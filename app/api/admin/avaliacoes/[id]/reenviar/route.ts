import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { generateAssessmentPdf } from "@/lib/pdf";
import { getStore, readPdfFile, savePdfFile } from "@/lib/store";
import { isRetryableWhatsappError, sendPdfToProfessor, whatsappConfigured } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await context.params;
  const store = await getStore();
  const record = await store.getById(id);
  if (!record) return NextResponse.json({ error: "Avaliação não encontrada." }, { status: 404 });
  if (record.status === "interrompida_urgencia") {
    return NextResponse.json({ error: "Registro de urgência não segue fluxo comercial." }, { status: 400 });
  }
  if (record.whatsappStatus === "enviado" || record.whatsappStatus === "entregue") {
    return NextResponse.json({ error: "Este PDF já foi aceito pela API. Evite reenvio duplicado." }, { status: 409 });
  }
  if (!whatsappConfigured()) {
    await store.update(record.id, {
      whatsappStatus: "pendente_configuracao",
      whatsappError: "Credenciais da WhatsApp Cloud API ainda não configuradas.",
    });
    return NextResponse.json({
      ok: false,
      status: "pendente_configuracao",
      error: "Configure WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID no servidor.",
    });
  }
  if (record.whatsappError && !isRetryableWhatsappError(record.whatsappError) && record.whatsappAttempts > 0) {
    return NextResponse.json({ error: "Falha não retriável. Verifique as credenciais." }, { status: 400 });
  }

  let bytes = record.pdfFilename ? await readPdfFile(record.pdfFilename) : null;
  if (!bytes) {
    const generated = await generateAssessmentPdf(record);
    const filename = await savePdfFile(record.protocol, generated);
    await store.update(record.id, { pdfFilename: filename });
    bytes = Buffer.from(generated);
  }

  const sent = await sendPdfToProfessor({
    pdf: new Uint8Array(bytes),
    protocol: record.protocol,
    filename: `${record.protocol}.pdf`,
  });

  if (sent.ok) {
    await store.update(record.id, {
      whatsappStatus: "enviado",
      whatsappMessageId: sent.messageId,
      whatsappError: null,
      whatsappAttempts: record.whatsappAttempts + 1,
      lastWhatsappAttemptAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, status: "enviado" });
  }

  await store.update(record.id, {
    whatsappStatus: "falhou",
    whatsappError: sent.error,
    whatsappAttempts: record.whatsappAttempts + 1,
    lastWhatsappAttemptAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: false, status: "falhou", error: sent.error }, { status: 502 });
}
