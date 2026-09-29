import { skippedQuestionIds } from "./branching";
import { onlyDigits } from "./schema";
import { isUrgentSymptom, priorityFlags } from "./triage";
import type { AssessmentAnswers } from "./types";

export function sanitizeAnswers(input: AssessmentAnswers): AssessmentAnswers {
  const answers = structuredClone(input);
  answers.whatsapp = onlyDigits(answers.whatsapp);
  answers.website = "";
  answers.nomeCompleto = answers.nomeCompleto.replace(/\s+/g, " ").trim();
  return answers;
}

export function submissionGuard(answers: AssessmentAnswers): string | null {
  if (answers.website && answers.website.trim() !== "") {
    return "Não foi possível enviar. Atualize a página e tente novamente.";
  }
  const elapsed = Date.now() - (answers.startedAt || 0);
  if (elapsed < 8000) {
    return "A avaliação foi enviada rápido demais. Revise as respostas e envie novamente.";
  }
  return null;
}

export function buildRecordMeta(answers: AssessmentAnswers) {
  return {
    flags: priorityFlags(answers),
    skippedQuestionIds: skippedQuestionIds(answers),
    urgent: isUrgentSymptom(answers),
  };
}

export function publicError(message: string) {
  return message;
}
