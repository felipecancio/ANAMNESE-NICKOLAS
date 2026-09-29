import fs from "fs";
import path from "path";
import { generateAssessmentPdf, assertPdfHasNoSecrets } from "../lib/pdf";
import { injurySample } from "../lib/fixtures";
import { skippedQuestionIds } from "../lib/branching";
import { priorityFlags } from "../lib/triage";
import type { StoredAssessment } from "../lib/types";

async function main() {
  const answers = injurySample();
  const record: StoredAssessment = {
    id: "fixture-local",
    protocol: "NA-TESTE-LOCAL",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "recebida",
    answers,
    flags: priorityFlags(answers),
    skippedQuestionIds: skippedQuestionIds(answers),
    whatsappStatus: "pendente_configuracao",
    whatsappMessageId: null,
    whatsappError: "Integração WhatsApp pendente em ambiente de teste.",
    whatsappAttempts: 0,
    lastWhatsappAttemptAt: null,
    pdfFilename: null,
    clientRequestId: "local-script",
  };
  const pdf = await generateAssessmentPdf(record);
  assertPdfHasNoSecrets(pdf);
  const dir = path.join(process.cwd(), "data", "test-output");
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, "avaliacao-teste.pdf");
  fs.writeFileSync(dest, pdf);
  console.log(`PDF de teste gerado em ${dest} (${pdf.byteLength} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
