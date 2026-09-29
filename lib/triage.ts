import { ageNumber, reportsInjury, showFallsBlock } from "./branching";
import type { AssessmentAnswers, PriorityFlag } from "./types";

const URGENT_FIELDS = [
  "dorPeitoEsforco",
  "faltaArDesproporcional",
  "desmaio",
  "fraquezaNeurologicaNova",
  "perdaControleEsfincterComDorLombar",
] as const;

export function isUrgentSymptom(answers: AssessmentAnswers): boolean {
  return URGENT_FIELDS.some((field) => answers[field] === "sim");
}

export function urgentReasons(answers: AssessmentAnswers): string[] {
  const reasons: string[] = [];
  if (answers.dorPeitoEsforco === "sim") {
    reasons.push("dor ou pressão no peito durante esforço");
  }
  if (answers.faltaArDesproporcional === "sim") {
    reasons.push("falta de ar intensa ou desproporcional");
  }
  if (answers.desmaio === "sim") {
    reasons.push("desmaio ou quase desmaio");
  }
  if (answers.fraquezaNeurologicaNova === "sim") {
    reasons.push("fraqueza neurológica nova");
  }
  if (answers.perdaControleEsfincterComDorLombar === "sim") {
    reasons.push("perda recente de controle urinário ou intestinal associada a dor nas costas");
  }
  return reasons;
}

export function priorityFlags(answers: AssessmentAnswers): PriorityFlag[] {
  const flags: PriorityFlag[] = [];

  if (isUrgentSymptom(answers)) {
    flags.push({
      code: "urgencia_sintomas",
      label: "Sintomas potencialmente urgentes relatados — não é indicação de treino; orientar atendimento médico.",
    });
  }

  if (answers.cirurgiaInternacaoRecente === "sim") {
    flags.push({
      code: "cirurgia_recente",
      label: "Cirurgia, internação ou atendimento de urgência recente relatado.",
    });
  }

  if (answers.liberacaoExercicios === "nao" || answers.liberacaoExercicios === "ainda_nao") {
    flags.push({
      code: "sem_liberacao",
      label: "Ausência de orientação ou liberação profissional para retomar exercícios.",
    });
  }

  if (answers.orientacaoLimitarExercicios === "sim") {
    flags.push({
      code: "orientacao_limitar",
      label: "Profissional de saúde já orientou limitar ou adaptar exercícios.",
    });
  }

  if (answers.tonturasRecorrentes === "sim") {
    flags.push({
      code: "tonturas",
      label: "Tonturas recorrentes relatadas.",
    });
  }

  if (answers.quedaComLesao === "sim") {
    flags.push({
      code: "queda_com_lesao",
      label: "Queda nos últimos 12 meses com lesão relatada.",
    });
  } else if (answers.caiu12Meses === "sim") {
    flags.push({
      code: "quedas",
      label: "Quedas relatadas nos últimos 12 meses.",
    });
  }

  const highPain =
    (typeof answers.dorRepouso === "number" && answers.dorRepouso >= 7) ||
    (typeof answers.dorMovimento === "number" && answers.dorMovimento >= 7);

  if (highPain) {
    flags.push({
      code: "dor_alta",
      label: "Dor relatada em nível elevado (7 ou mais) em repouso ou movimento.",
    });
  }

  const importantLimitation = [
    answers.capacidadeCaminhar,
    answers.capacidadeEscadas,
    answers.capacidadeLevantarCadeira,
    answers.capacidadeEquilibrio,
  ].some((value) => value === "nao_consegue" || value === "muita_dificuldade");

  if (importantLimitation) {
    flags.push({
      code: "limitacao_importante",
      label: "Limitação funcional importante relatada em caminhar, escadas, sentar-levantar ou equilíbrio.",
    });
  }

  if (answers.diagnosticoRelevante === "sim") {
    flags.push({
      code: "condicao_saude",
      label: "Condição de saúde referida como relevante para o exercício.",
    });
  }

  const age = ageNumber(answers);
  if (age !== null && age >= 60 && showFallsBlock(answers) && answers.medoDeCair === "sim") {
    flags.push({
      code: "medo_cair",
      label: "Medo de cair relatado — revisar segurança e ambiente, sem presumir incapacidade.",
    });
  }

  if (reportsInjury(answers) && answers.faseLesao === "recente") {
    flags.push({
      code: "lesao_recente",
      label: "Lesão descrita como fase recente.",
    });
  }

  return flags;
}

export function summaryForProfessor(answers: AssessmentAnswers): {
  objetivo: string;
  regiao: string;
  dor: string;
  limitacoes: string;
} {
  const motivo = answers.motivoPrincipal || "não informado";
  const objetivo = answers.objetivoProximosMeses.trim() || motivo;
  const regiao = reportsInjury(answers)
    ? [...answers.regiaoAfetada, answers.regiaoOutra].filter(Boolean).join(", ") || "não especificada"
    : "não se aplica";

  const dorParts: string[] = [];
  if (typeof answers.dorRepouso === "number") dorParts.push(`repouso ${answers.dorRepouso}/10`);
  if (typeof answers.dorMovimento === "number") dorParts.push(`movimento ${answers.dorMovimento}/10`);
  const dor = dorParts.length ? dorParts.join("; ") : "não informada ou não se aplica";

  const limitacoes = [
    answers.capacidadeCaminhar && `caminhar: ${answers.capacidadeCaminhar}`,
    answers.capacidadeEscadas && `escadas: ${answers.capacidadeEscadas}`,
    answers.capacidadeLevantarCadeira && `levantar da cadeira: ${answers.capacidadeLevantarCadeira}`,
    answers.capacidadeEquilibrio && `equilíbrio: ${answers.capacidadeEquilibrio}`,
  ]
    .filter(Boolean)
    .join("; ");

  return { objetivo, regiao, dor, limitacoes: limitacoes || "não informadas" };
}
