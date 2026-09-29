import { describe, expect, it } from "vitest";
import { skipInjuryBlock, skipQuestion, showFallsBlock, showSurgeryDetails } from "@/lib/branching";
import { sampleAnswers, elderlySample, injurySample, urgentSample } from "@/lib/fixtures";
import { buildQuestionRows, ALL_QUESTION_IDS } from "@/lib/questions";
import { validateAssessment, validateStep } from "@/lib/schema";
import { isUrgentSymptom, priorityFlags } from "@/lib/triage";
import { visitorWhatsAppLink, assertSafeVisitorMessage, extractStatusUpdates, sendPdfToProfessor } from "@/lib/whatsapp";
import { generateAssessmentPdf, assertPdfHasNoSecrets } from "@/lib/pdf";
import { AssessmentStore } from "@/lib/store";
import type { StoredAssessment } from "@/lib/types";

describe("perguntas condicionais", () => {
  it("não mostra detalhes de cirurgia quando a pessoa não fez cirurgia", () => {
    const answers = sampleAnswers({ cirurgiaInternacaoRecente: "nao" });
    expect(showSurgeryDetails(answers)).toBe(false);
    expect(skipQuestion("cirurgiaQuandoPorQue", answers)).toBe(true);
  });

  it("mostra detalhes de cirurgia somente quando a resposta é sim", () => {
    const answers = sampleAnswers({ cirurgiaInternacaoRecente: "sim", cirurgiaQuandoPorQue: "há 3 semanas, teste" });
    expect(showSurgeryDetails(answers)).toBe(true);
    expect(skipQuestion("cirurgiaQuandoPorQue", answers)).toBe(false);
  });

  it("não mostra o bloco completo de lesão para quem não relata lesão", () => {
    const answers = sampleAnswers({ motivoPrincipal: "forca", relataLesaoDor: "nao" });
    expect(skipInjuryBlock(answers)).toBe(true);
    expect(skipQuestion("regiaoAfetada", answers)).toBe(true);
    expect(skipQuestion("dorRepouso", answers)).toBe(true);
  });

  it("mostra o bloco de lesão quando a pessoa relata lesão", () => {
    const answers = injurySample();
    expect(skipInjuryBlock(answers)).toBe(false);
    expect(skipQuestion("regiaoAfetada", answers)).toBe(false);
  });
});

describe("pessoa idosa e quedas", () => {
  it("oferece perguntas de equilíbrio e segurança a partir de 60 anos, sem presumir incapacidade", () => {
    const answers = elderlySample();
    expect(showFallsBlock(answers)).toBe(true);
    expect(answers.capacidadeCaminhar).not.toBe("nao_consegue");
    const rows = buildQuestionRows(answers);
    const falls = rows.find((row) => row.id === "caiu12Meses");
    expect(falls?.skipped).toBe(false);
  });

  it("não mostra o bloco de quedas para adulto mais jovem sem instabilidade", () => {
    const answers = sampleAnswers({ idade: 40, relataLesaoDor: "nao", instabilidade: "" });
    expect(showFallsBlock(answers)).toBe(false);
    expect(skipQuestion("caiu12Meses", answers)).toBe(true);
  });

  it("mostra o bloco de quedas em qualquer idade se houver instabilidade", () => {
    const answers = injurySample();
    expect(answers.idade).toBe(45);
    expect(showFallsBlock(answers)).toBe(true);
  });
});

describe("sinalização de urgência", () => {
  it("interrompe o fluxo comercial quando há dor no peito", () => {
    const answers = urgentSample();
    expect(isUrgentSymptom(answers)).toBe(true);
    expect(priorityFlags(answers).some((flag) => flag.code === "urgencia_sintomas")).toBe(true);
  });

  it("não trata tontura isolada como interrupção de emergência", () => {
    const answers = sampleAnswers({ tonturasRecorrentes: "sim" });
    expect(isUrgentSymptom(answers)).toBe(false);
    expect(priorityFlags(answers).some((flag) => flag.code === "tonturas")).toBe(true);
  });
});

describe("validação", () => {
  it("aceita uma avaliação completa de teste", () => {
    const result = validateAssessment(injurySample());
    expect(result.success).toBe(true);
  });

  it("rejeita etapa 1 sem WhatsApp válido", () => {
    const errors = validateStep(1, sampleAnswers({ whatsapp: "123" }));
    expect(errors.whatsapp).toBeTruthy();
  });

  it("não condiciona o envio ao marketing", () => {
    const result = validateAssessment(sampleAnswers({ consentimentoMarketing: false }));
    expect(result.success).toBe(true);
  });
});

describe("PDF", () => {
  it("inclui todas as perguntas, marca as puladas e não contém segredos", async () => {
    const answers = sampleAnswers({ relataLesaoDor: "nao", motivoPrincipal: "forca" });
    const record: StoredAssessment = {
      id: "test-id",
      protocol: "NA-20260101-TEST01",
      createdAt: "2026-01-01T15:00:00.000Z",
      updatedAt: "2026-01-01T15:00:00.000Z",
      status: "recebida",
      answers,
      flags: [],
      skippedQuestionIds: [],
      whatsappStatus: "pendente_configuracao",
      whatsappMessageId: null,
      whatsappError: null,
      whatsappAttempts: 0,
      lastWhatsappAttemptAt: null,
      pdfFilename: null,
      clientRequestId: "client-test",
    };
    const rows = buildQuestionRows(answers);
    expect(rows.map((row) => row.id).sort()).toEqual([...ALL_QUESTION_IDS].sort());
    expect(rows.find((row) => row.id === "cirurgiaQuandoPorQue")?.resposta).toBe("Não se aplica");
    expect(rows.find((row) => row.id === "regiaoAfetada")?.resposta).toBe("Não se aplica");

    const pdf = await generateAssessmentPdf(record);
    expect(pdf.byteLength).toBeGreaterThan(1000);
    assertPdfHasNoSecrets(pdf);
    const { PDFDocument } = await import("pdf-lib");
    const loaded = await PDFDocument.load(pdf);
    expect(loaded.getTitle()).toContain("NA-20260101-TEST01");
    expect(loaded.getPageCount()).toBeGreaterThan(1);
    const latin = Buffer.from(pdf).toString("latin1");
    expect(latin).not.toContain("WHATSAPP_TOKEN");
    expect(latin).not.toContain(record.clientRequestId);
  });
});

describe("WhatsApp do visitante", () => {
  it("abre conversa curta só com o protocolo", () => {
    const url = visitorWhatsAppLink("NA-20260101-ABC");
    expect(url.startsWith("https://wa.me/5522997231553?text=")).toBe(true);
    assertSafeVisitorMessage(url, "NA-20260101-ABC");
    const decoded = decodeURIComponent(url);
    expect(decoded).not.toMatch(/dor|lesão|diagnóstico|pdf/i);
  });

  it("interpreta webhook de entrega e falha", () => {
    const delivered = extractStatusUpdates({
      entry: [{ changes: [{ value: { statuses: [{ id: "wamid.1", status: "delivered" }] } }] }],
    });
    expect(delivered[0]).toEqual({ messageId: "wamid.1", status: "entregue" });
    const failed = extractStatusUpdates({
      entry: [{ changes: [{ value: { statuses: [{ id: "wamid.2", status: "failed", errors: [{ title: "erro" }] }] } }] }],
    });
    expect(failed[0]?.status).toBe("falhou");
  });

  it("não marca envio automático como sucesso sem credenciais da Cloud API", async () => {
    const result = await sendPdfToProfessor({
      pdf: new Uint8Array([37, 80, 68, 70]),
      protocol: "NA-TEST",
      filename: "teste.pdf",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.toLowerCase()).toContain("pendente");
  });
});

describe("persistência e reenvio", () => {
  it("evita duplicar envio com o mesmo clientRequestId", async () => {
    const store = await AssessmentStore.memory();
    const first = await store.create({
      answers: sampleAnswers(),
      flags: [],
      skippedQuestionIds: [],
      status: "recebida",
      whatsappStatus: "falhou",
      clientRequestId: "abc-1",
    });
    const second = await store.create({
      answers: sampleAnswers(),
      flags: [],
      skippedQuestionIds: [],
      status: "recebida",
      whatsappStatus: "pendente",
      clientRequestId: "abc-1",
    });
    expect(second.id).toBe(first.id);
    await store.update(first.id, { whatsappStatus: "enviado", whatsappMessageId: "wamid.x" });
    const again = await store.getById(first.id);
    expect(again?.whatsappStatus).toBe("enviado");
  });
});

describe("proteção de dados", () => {
  it("não coloca respostas de saúde na URL do WhatsApp do visitante", () => {
    const answers = injurySample();
    const url = visitorWhatsAppLink("NA-TEST");
    expect(url).not.toContain(encodeURIComponent(answers.diagnosticoInformado));
    expect(url).not.toContain("Joelho");
  });
});
