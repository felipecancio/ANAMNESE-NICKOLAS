import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/auth";
import { skippedQuestionIds } from "@/lib/branching";
import { hashIp } from "@/lib/crypto";
import { generateAssessmentPdf } from "@/lib/pdf";
import { validateAssessment } from "@/lib/schema";
import { getStore, savePdfFile } from "@/lib/store";
import { buildRecordMeta, sanitizeAnswers, submissionGuard } from "@/lib/submit";
import { isUrgentSymptom } from "@/lib/triage";
import type { AssessmentAnswers } from "@/lib/types";
import { sendPdfToProfessor, visitorWhatsAppLink, whatsappConfigured } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!assertSameOrigin(request)) {
      return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
    }

    const body = (await request.json()) as {
      answers?: AssessmentAnswers;
      clientRequestId?: string;
    };
    if (!body.answers || !body.clientRequestId) {
      return NextResponse.json({ error: "Pedido incompleto." }, { status: 400 });
    }

    const answers = sanitizeAnswers(body.answers);
    const guard = submissionGuard(answers);
    if (guard) {
      return NextResponse.json({ error: guard }, { status: 400 });
    }

    const store = await getStore();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
    const limited = await store.hitRateLimit(hashIp(ip), 8, 60 * 60 * 1000);
    if (limited) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde um pouco antes de enviar de novo." },
        { status: 429 },
      );
    }

    const existing = await store.getByClientRequestId(body.clientRequestId);
    if (existing) {
      if (existing.status === "interrompida_urgencia") {
        return NextResponse.json({ ok: true, urgent: true });
      }
      return NextResponse.json({
        ok: true,
        protocol: existing.protocol,
        whatsappUrl: visitorWhatsAppLink(existing.protocol),
        whatsappStatus: existing.whatsappStatus,
      });
    }

    const validated = validateAssessment(answers);
    if (!validated.success || !validated.value) {
      return NextResponse.json(
        { error: "Revise as respostas destacadas.", fields: validated.errors },
        { status: 400 },
      );
    }

    const meta = buildRecordMeta(validated.value);
    const urgent = isUrgentSymptom(validated.value);

    const record = await store.create({
      answers: validated.value,
      flags: meta.flags,
      skippedQuestionIds: skippedQuestionIds(validated.value),
      status: urgent ? "interrompida_urgencia" : "recebida",
      whatsappStatus: urgent ? "nao_aplicavel" : whatsappConfigured() ? "pendente" : "pendente_configuracao",
      clientRequestId: body.clientRequestId,
    });

    if (urgent) {
      return NextResponse.json({ ok: true, urgent: true });
    }

    const pdf = await generateAssessmentPdf(record);
    const filename = await savePdfFile(record.protocol, pdf);
    await store.update(record.id, { pdfFilename: filename });

    if (!whatsappConfigured()) {
      await store.update(record.id, {
        whatsappStatus: "pendente_configuracao",
        whatsappError: "Credenciais da WhatsApp Cloud API ainda não configuradas.",
      });
    } else {
      const sent = await sendPdfToProfessor({
        pdf,
        protocol: record.protocol,
        filename,
      });
      if (sent.ok) {
        await store.update(record.id, {
          whatsappStatus: "enviado",
          whatsappMessageId: sent.messageId,
          whatsappAttempts: 1,
          lastWhatsappAttemptAt: new Date().toISOString(),
          whatsappError: null,
        });
      } else {
        await store.update(record.id, {
          whatsappStatus: "falhou",
          whatsappError: sent.error,
          whatsappAttempts: 1,
          lastWhatsappAttemptAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      protocol: record.protocol,
      whatsappUrl: visitorWhatsAppLink(record.protocol),
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível concluir o envio. Tente novamente." },
      { status: 500 },
    );
  }
}
