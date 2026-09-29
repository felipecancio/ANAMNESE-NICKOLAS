import type { AssessmentAnswers } from "./types";

export function ageNumber(answers: Pick<AssessmentAnswers, "idade">): number | null {
  return typeof answers.idade === "number" && Number.isFinite(answers.idade)
    ? answers.idade
    : null;
}

export function reportsInjury(answers: AssessmentAnswers): boolean {
  if (answers.relataLesaoDor === "sim") return true;
  if (answers.motivoPrincipal === "retorno_lesao") return true;
  if (answers.motivoPrincipal === "dor_limitacao") return true;
  return false;
}

export function skipInjuryBlock(answers: AssessmentAnswers): boolean {
  if (answers.relataLesaoDor === "nao" || answers.relataLesaoDor === "nao_se_aplica") return true;
  if (answers.relataLesaoDor === "nao_sei" || answers.relataLesaoDor === "prefiro_explicar") return true;
  if (answers.relataLesaoDor === "sim") return false;
  return !["retorno_lesao", "dor_limitacao"].includes(answers.motivoPrincipal);
}

export function showCaregiverFields(answers: AssessmentAnswers): boolean {
  return answers.preenchidoPor === "familiar";
}

export function showDiagnosisSpecify(answers: AssessmentAnswers): boolean {
  return answers.diagnosticoRelevante === "sim" || answers.diagnosticoRelevante === "nao_sei";
}

export function showSurgeryDetails(answers: AssessmentAnswers): boolean {
  return answers.cirurgiaInternacaoRecente === "sim";
}

export function showTreatmentDetails(answers: AssessmentAnswers): boolean {
  return answers.tratamentoAtual === "sim";
}

export function showMedicationDetails(answers: AssessmentAnswers): boolean {
  return answers.medicamentos === "sim" || answers.medicamentos === "prefiro_explicar";
}

export function showRecommendationDetails(answers: AssessmentAnswers): boolean {
  return answers.recomendacaoEspecifica === "sim";
}

export function showFearDetails(answers: AssessmentAnswers): boolean {
  return answers.receioExercicios === "sim" || answers.receioExercicios === "prefiro_explicar";
}

export function showMotiveOther(answers: AssessmentAnswers): boolean {
  return answers.motivoPrincipal === "outro";
}

export function showPhysioOngoing(answers: AssessmentAnswers): boolean {
  return answers.fisioterapia === "sim";
}

export function showEventDetails(answers: AssessmentAnswers): boolean {
  return answers.eventoEspecifico === "sim" || answers.eventoEspecifico === "prefiro_explicar";
}

export function showDiagnosisInformed(answers: AssessmentAnswers): boolean {
  return answers.diagnosticoProfissional === "sim" || answers.diagnosticoProfissional === "prefiro_explicar";
}

export function reportsInstability(answers: AssessmentAnswers): boolean {
  return (
    answers.instabilidade === "sim" ||
    answers.capacidadeEquilibrio === "muita_dificuldade" ||
    answers.capacidadeEquilibrio === "nao_consegue" ||
    answers.inseguroEmPeOuCaminhar === "sim" ||
    answers.motivoPrincipal === "equilibrio" ||
    answers.motivoPrincipal === "prevencao_quedas"
  );
}

export function showFallsBlock(answers: AssessmentAnswers): boolean {
  const age = ageNumber(answers);
  if (age !== null && age >= 60) return true;
  if (answers.caiu12Meses === "sim") return true;
  return reportsInstability(answers);
}

export function showFallCount(answers: AssessmentAnswers): boolean {
  return showFallsBlock(answers) && answers.caiu12Meses === "sim";
}

export function showHelpDetails(answers: AssessmentAnswers): boolean {
  return answers.precisaAjudaCotidiano === "sim";
}

export function showSupportDetails(answers: AssessmentAnswers): boolean {
  return answers.usaApoio === "sim";
}

export function showPracticeDetails(answers: AssessmentAnswers): boolean {
  return answers.praticaAtualmente === "sim";
}

export function showBarrierOther(answers: AssessmentAnswers): boolean {
  return answers.barreiraPrincipal === "outra";
}

export function skipQuestion(
  questionId: string,
  answers: AssessmentAnswers,
): boolean {
  switch (questionId) {
    case "familiarNome":
    case "familiarVinculo":
    case "familiarCiencia":
      return !showCaregiverFields(answers);
    case "motivoOutro":
      return !showMotiveOther(answers);
    case "receioDetalhe":
      return !showFearDetails(answers);
    case "diagnosticoEspecificar":
      return answers.diagnosticoRelevante !== "sim";
    case "cirurgiaQuandoPorQue":
      return !showSurgeryDetails(answers);
    case "tratamentoDetalhes":
      return !showTreatmentDetails(answers);
    case "medicamentosGeral":
      return answers.medicamentos !== "sim";
    case "recomendacaoDetalhes":
      return !showRecommendationDetails(answers);
    case "regiaoAfetada":
    case "regiaoOutra":
    case "ladoAfetado":
    case "diagnosticoProfissional":
    case "diagnosticoInformado":
    case "inicioQuando":
    case "eventoEspecifico":
    case "eventoDetalhe":
    case "faseLesao":
    case "fisioterapia":
    case "fisioterapiaAndamento":
    case "dorRepouso":
    case "dorMovimento":
    case "frequenciaDor":
    case "oQuePiora":
    case "oQueAlivia":
    case "perdaForca":
    case "dormenciaFormigamento":
    case "instabilidade":
    case "movimentosEvitar":
    case "interfereSono":
    case "interfereTrabalho":
    case "interfereCotidiano":
      if (questionId === "regiaoOutra") {
        return skipInjuryBlock(answers) || !answers.regiaoAfetada.includes("Outra");
      }
      if (questionId === "diagnosticoInformado") {
        return skipInjuryBlock(answers) || !showDiagnosisInformed(answers);
      }
      if (questionId === "eventoDetalhe") {
        return skipInjuryBlock(answers) || !showEventDetails(answers);
      }
      if (questionId === "fisioterapiaAndamento") {
        return skipInjuryBlock(answers) || !showPhysioOngoing(answers);
      }
      return skipInjuryBlock(answers);
    case "ajudaQual":
      return !showHelpDetails(answers);
    case "apoioQual":
      return !showSupportDetails(answers);
    case "caiu12Meses":
    case "inseguroEmPeOuCaminhar":
    case "medoDeCair":
    case "dificuldadeEnxergarOuObstaculos":
    case "alguemAcompanhaAtividades":
      return !showFallsBlock(answers);
    case "quedasQuantidade":
    case "quedaComLesao":
      return !showFallCount(answers);
    case "praticaQual":
    case "praticaFrequencia":
    case "praticaDuracao":
      return !showPracticeDetails(answers);
    case "barreiraOutra":
      return !showBarrierOther(answers);
    case "equipamentosOutros":
      return !answers.equipamentos.includes("Outros") && !answers.equipamentosOutros;
    default:
      return false;
  }
}

export function skippedQuestionIds(answers: AssessmentAnswers): string[] {
  const ids = QUESTION_IDS_FOR_SKIP.filter((id) => skipQuestion(id, answers));
  return ids;
}

const QUESTION_IDS_FOR_SKIP = [
  "familiarNome",
  "familiarVinculo",
  "familiarCiencia",
  "motivoOutro",
  "receioDetalhe",
  "diagnosticoEspecificar",
  "cirurgiaQuandoPorQue",
  "tratamentoDetalhes",
  "medicamentosGeral",
  "recomendacaoDetalhes",
  "regiaoAfetada",
  "regiaoOutra",
  "ladoAfetado",
  "diagnosticoProfissional",
  "diagnosticoInformado",
  "inicioQuando",
  "eventoEspecifico",
  "eventoDetalhe",
  "faseLesao",
  "fisioterapia",
  "fisioterapiaAndamento",
  "dorRepouso",
  "dorMovimento",
  "frequenciaDor",
  "oQuePiora",
  "oQueAlivia",
  "perdaForca",
  "dormenciaFormigamento",
  "instabilidade",
  "movimentosEvitar",
  "interfereSono",
  "interfereTrabalho",
  "interfereCotidiano",
  "ajudaQual",
  "apoioQual",
  "caiu12Meses",
  "quedasQuantidade",
  "quedaComLesao",
  "inseguroEmPeOuCaminhar",
  "medoDeCair",
  "dificuldadeEnxergarOuObstaculos",
  "alguemAcompanhaAtividades",
  "praticaQual",
  "praticaFrequencia",
  "praticaDuracao",
  "barreiraOutra",
  "equipamentosOutros",
];
