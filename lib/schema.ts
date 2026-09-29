import { z } from "zod";
import { skipQuestion } from "./branching";
import type { AssessmentAnswers } from "./types";
import { emptyAnswers } from "./types";

const tri = z.enum(["sim", "nao", "nao_sei"]);
const soft = z.enum(["sim", "nao", "nao_sei", "prefiro_explicar", "nao_se_aplica", "ainda_nao"]);
const capacidade = z.enum([
  "sem_dificuldade",
  "pouca_dificuldade",
  "muita_dificuldade",
  "nao_consegue",
  "nao_sei",
  "prefiro_explicar",
  "nao_se_aplica",
]);

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidBrMobile(value: string): boolean {
  const d = onlyDigits(value);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  return true;
}

const shortText = z.string().trim().max(400);
const mediumText = z.string().trim().max(800);
const nameText = z.string().trim().min(3, "Informe o nome completo.").max(120);

const painValue = z.union([
  z.number().int().min(0).max(10),
  z.literal(""),
  z.literal("nao_sei"),
  z.literal("prefiro_explicar"),
]);

export const assessmentSchema: z.ZodType<AssessmentAnswers> = z
  .object({
    nomeCompleto: nameText,
    idade: z.union([z.number().int().min(12, "Idade mínima: 12 anos.").max(120), z.literal("")]),
    cidade: z.string().trim().min(2, "Informe a cidade.").max(80),
    estado: z.string().trim().min(2, "Selecione o estado.").max(2),
    whatsapp: z
      .string()
      .trim()
      .refine((v) => isValidBrMobile(v), "Informe um WhatsApp com DDD, com 10 ou 11 dígitos."),
    email: z
      .string()
      .trim()
      .max(120)
      .refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "E-mail inválido."),
    preenchidoPor: z.union([z.enum(["propria", "familiar"]), z.literal("")]),
    familiarNome: shortText,
    familiarVinculo: shortText,
    familiarCiencia: z.boolean(),
    melhorPeriodo: z.union([
      z.enum(["manha", "tarde", "noite", "qualquer", "prefiro_explicar"]),
      z.literal(""),
    ]),

    motivoPrincipal: z.union([
      z.enum([
        "retorno_lesao",
        "dor_limitacao",
        "forca",
        "equilibrio",
        "mobilidade",
        "autonomia",
        "prevencao_quedas",
        "outro",
        "prefiro_explicar",
      ]),
      z.literal(""),
    ]),
    motivoOutro: shortText,
    dificuldadePrincipal: mediumText,
    atividadesDesejadas: z.array(z.string().max(80)).max(3),
    atividadesOutra: shortText,
    objetivoProximosMeses: mediumText,
    receioExercicios: z.union([soft, z.literal("")]),
    receioDetalhe: mediumText,

    orientacaoLimitarExercicios: z.union([tri, z.literal("")]),
    diagnosticoRelevante: z.union([tri, z.literal("")]),
    diagnosticoEspecificar: mediumText,
    dorPeitoEsforco: z.union([tri, z.literal("")]),
    faltaArDesproporcional: z.union([tri, z.literal("")]),
    desmaio: z.union([tri, z.literal("")]),
    tonturasRecorrentes: z.union([tri, z.literal("")]),
    fraquezaNeurologicaNova: z.union([tri, z.literal("")]),
    perdaControleEsfincterComDorLombar: z.union([tri, z.literal("")]),
    cirurgiaInternacaoRecente: z.union([tri, z.literal("")]),
    cirurgiaQuandoPorQue: mediumText,
    tratamentoAtual: z.union([tri, z.literal("")]),
    tratamentoDetalhes: mediumText,
    medicamentos: z.union([soft, z.literal("")]),
    medicamentosGeral: mediumText,
    liberacaoExercicios: z.union([soft, z.literal("")]),
    recomendacaoEspecifica: z.union([soft, z.literal("")]),
    recomendacaoDetalhes: mediumText,

    relataLesaoDor: z.union([soft, z.literal("")]),
    regiaoAfetada: z.array(z.string().max(60)).max(8),
    regiaoOutra: shortText,
    ladoAfetado: z.union([
      z.enum(["direito", "esquerdo", "ambos", "nao_se_aplica", "nao_sei", "prefiro_explicar"]),
      z.literal(""),
    ]),
    diagnosticoProfissional: z.union([soft, z.literal("")]),
    diagnosticoInformado: mediumText,
    inicioQuando: shortText,
    eventoEspecifico: z.union([soft, z.literal("")]),
    eventoDetalhe: mediumText,
    faseLesao: z.union([
      z.enum([
        "recente",
        "em_tratamento",
        "apos_cirurgia",
        "acompanhamento_longo",
        "nao_sei",
        "prefiro_explicar",
        "nao_se_aplica",
      ]),
      z.literal(""),
    ]),
    fisioterapia: z.union([soft, z.literal("")]),
    fisioterapiaAndamento: z.union([soft, z.literal("")]),
    dorRepouso: painValue,
    dorMovimento: painValue,
    frequenciaDor: z.union([
      z.enum([
        "constante",
        "diaria",
        "algumas_vezes_semana",
        "ocasional",
        "somente_movimento",
        "nao_sei",
        "prefiro_explicar",
        "nao_se_aplica",
      ]),
      z.literal(""),
    ]),
    oQuePiora: mediumText,
    oQueAlivia: mediumText,
    perdaForca: z.union([tri, z.literal("")]),
    dormenciaFormigamento: z.union([tri, z.literal("")]),
    instabilidade: z.union([tri, z.literal("")]),
    movimentosEvitar: mediumText,
    interfereSono: z.union([tri, z.literal("")]),
    interfereTrabalho: z.union([tri, z.literal("")]),
    interfereCotidiano: z.union([tri, z.literal("")]),

    capacidadeCaminhar: z.union([capacidade, z.literal("")]),
    capacidadeEscadas: z.union([capacidade, z.literal("")]),
    capacidadeLevantarCadeira: z.union([capacidade, z.literal("")]),
    capacidadeCarregarLeve: z.union([capacidade, z.literal("")]),
    capacidadeEquilibrio: z.union([capacidade, z.literal("")]),
    precisaAjudaCotidiano: z.union([soft, z.literal("")]),
    ajudaQual: shortText,
    usaApoio: z.union([soft, z.literal("")]),
    apoioQual: shortText,
    confiancaMovimento: painValue,
    caiu12Meses: z.union([tri, z.literal("")]),
    quedasQuantidade: shortText,
    quedaComLesao: z.union([tri, z.literal("")]),
    inseguroEmPeOuCaminhar: z.union([tri, z.literal("")]),
    medoDeCair: z.union([tri, z.literal("")]),
    dificuldadeEnxergarOuObstaculos: z.union([tri, z.literal("")]),
    alguemAcompanhaAtividades: z.union([soft, z.literal("")]),

    praticaAtualmente: z.union([soft, z.literal("")]),
    praticaQual: shortText,
    praticaFrequencia: shortText,
    praticaDuracao: shortText,
    oQueNaoFuncionou: mediumText,
    oQueGosta: mediumText,
    oQueEvita: mediumText,
    tempoPorSessao: shortText,
    tempoPorSemana: shortText,
    equipamentos: z.array(z.string().max(60)).max(12),
    equipamentosOutros: shortText,
    barreiraPrincipal: z.union([
      z.enum(["tempo", "dor", "medo", "deslocamento", "motivacao", "outra", "nao_sei", "prefiro_explicar"]),
      z.literal(""),
    ]),
    barreiraOutra: shortText,
    modalidadeInteresse: z.union([z.enum(["presencial", "remoto", "ainda_nao_sei"]), z.literal("")]),

    cienciaNaoSubstituiClinico: z.boolean(),
    autorizacaoDadosSaude: z.boolean(),
    cienciaEnvioWhatsapp: z.boolean(),
    consentimentoMarketing: z.boolean(),

    website: z.string().max(80),
    startedAt: z.number(),
  })
  .superRefine((data, ctx) => requireFilled(data, ctx));

function add(ctx: z.RefinementCtx, path: string, message: string) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [path] });
}

function missing(value: unknown): boolean {
  if (value === "" || value === null || value === undefined) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function requireFilled(data: AssessmentAnswers, ctx: z.RefinementCtx) {
  const need = (path: keyof AssessmentAnswers, message: string) => {
    if (skipQuestion(String(path), data)) return;
    if (missing(data[path])) add(ctx, String(path), message);
  };

  need("nomeCompleto", "Informe o nome completo.");
  if (data.idade === "") add(ctx, "idade", "Informe a idade em anos.");
  need("cidade", "Informe a cidade.");
  need("estado", "Selecione o estado.");
  need("whatsapp", "Informe o WhatsApp com DDD.");
  need("preenchidoPor", "Informe quem está preenchendo.");
  if (data.preenchidoPor === "familiar") {
    need("familiarNome", "Informe o nome de quem está preenchendo.");
    need("familiarVinculo", "Informe o vínculo com a pessoa atendida.");
    if (!data.familiarCiencia) {
      add(
        ctx,
        "familiarCiencia",
        "É necessário confirmar que a pessoa atendida sabe deste contato.",
      );
    }
  }
  need("melhorPeriodo", "Informe o melhor período para contato.");

  need("motivoPrincipal", "Selecione o principal motivo.");
  if (data.motivoPrincipal === "outro") need("motivoOutro", "Descreva o motivo.");
  need("dificuldadePrincipal", "Descreva a principal dificuldade atual.");
  if (data.atividadesDesejadas.length === 0 && !data.atividadesOutra.trim()) {
    add(ctx, "atividadesDesejadas", "Escolha até três atividades, ou descreva outra.");
  }
  if (data.atividadesDesejadas.length > 3) {
    add(ctx, "atividadesDesejadas", "Selecione no máximo três atividades.");
  }
  need("objetivoProximosMeses", "Informe o objetivo mais importante nos próximos meses.");
  need("receioExercicios", "Informe se existe algum receio relacionado aos exercícios.");
  if (data.receioExercicios === "sim") need("receioDetalhe", "Conte, em poucas palavras, qual é o receio.");

  need("orientacaoLimitarExercicios", "Responda se já houve orientação para limitar ou adaptar exercícios.");
  need("diagnosticoRelevante", "Responda sobre diagnósticos relevantes para o exercício.");
  if (data.diagnosticoRelevante === "sim") {
    need("diagnosticoEspecificar", "Especifique o que foi informado pelo profissional de saúde.");
  }
  need("dorPeitoEsforco", "Responda sobre dor ou pressão no peito durante esforço.");
  need("faltaArDesproporcional", "Responda sobre falta de ar desproporcional.");
  need("desmaio", "Responda sobre desmaio ou quase desmaio.");
  need("tonturasRecorrentes", "Responda sobre tonturas recorrentes.");
  need("fraquezaNeurologicaNova", "Responda sobre fraqueza neurológica nova.");
  need("perdaControleEsfincterComDorLombar", "Responda sobre perda de controle urinário ou intestinal com dor nas costas.");
  need("cirurgiaInternacaoRecente", "Responda sobre cirurgia, internação ou urgência recente.");
  if (data.cirurgiaInternacaoRecente === "sim") {
    need("cirurgiaQuandoPorQue", "Informe quando ocorreu e o motivo, se souber.");
  }
  need("tratamentoAtual", "Responda se faz tratamento médico ou fisioterapêutico atualmente.");
  if (data.tratamentoAtual === "sim") need("tratamentoDetalhes", "Informe, de forma geral, qual tratamento.");
  need("medicamentos", "Responda sobre o uso de medicamentos.");
  need("liberacaoExercicios", "Responda sobre orientação ou liberação para retomar exercícios.");
  need("recomendacaoEspecifica", "Responda se há recomendação específica do profissional que acompanha o caso.");
  if (data.recomendacaoEspecifica === "sim") {
    need("recomendacaoDetalhes", "Descreva a recomendação informada.");
  }

  need("relataLesaoDor", "Informe se há lesão, dor ou limitação a detalhar.");

  if (!skipQuestion("regiaoAfetada", data)) {
    if (data.regiaoAfetada.length === 0 && !data.regiaoOutra.trim()) {
      add(ctx, "regiaoAfetada", "Indique a região do corpo afetada.");
    }
    need("ladoAfetado", "Informe o lado afetado.");
    need("diagnosticoProfissional", "Informe se houve diagnóstico feito por profissional.");
    need("inicioQuando", "Informe quando começou, mesmo que de forma aproximada.");
    need("eventoEspecifico", "Informe se houve um evento específico.");
    need("faseLesao", "Informe a fase atual, se souber.");
    need("fisioterapia", "Informe se fez fisioterapia ou outro acompanhamento.");
    if (data.dorRepouso === "") add(ctx, "dorRepouso", "Indique a dor em repouso, ou escolha Não sei.");
    if (data.dorMovimento === "") add(ctx, "dorMovimento", "Indique a dor no movimento, ou escolha Não sei.");
    need("frequenciaDor", "Informe a frequência da dor.");
    need("oQuePiora", "Informe o que piora, ou escolha uma opção equivalente no texto.");
    need("oQueAlivia", "Informe o que alivia, ou escreva “não sei”.");
    need("perdaForca", "Responda sobre perda de força.");
    need("dormenciaFormigamento", "Responda sobre dormência ou formigamento.");
    need("instabilidade", "Responda sobre sensação de instabilidade.");
    need("movimentosEvitar", "Informe movimentos orientados a evitar, ou “não sei” / “não se aplica”.");
    need("interfereSono", "Responda se interfere no sono.");
    need("interfereTrabalho", "Responda se interfere no trabalho.");
    need("interfereCotidiano", "Responda se interfere nas atividades cotidianas.");
  }

  need("capacidadeCaminhar", "Avalie a capacidade de caminhar.");
  need("capacidadeEscadas", "Avalie a capacidade de subir escadas.");
  need("capacidadeLevantarCadeira", "Avalie a capacidade de levantar de uma cadeira.");
  need("capacidadeCarregarLeve", "Avalie a capacidade de carregar objetos leves.");
  need("capacidadeEquilibrio", "Avalie o equilíbrio.");
  need("precisaAjudaCotidiano", "Informe se precisa de ajuda para alguma atividade cotidiana.");
  if (data.precisaAjudaCotidiano === "sim") need("ajudaQual", "Qual atividade precisa de ajuda?");
  need("usaApoio", "Informe se usa bengala, andador ou outro apoio.");
  if (data.usaApoio === "sim") need("apoioQual", "Qual apoio utiliza?");
  if (data.confiancaMovimento === "") {
    add(ctx, "confiancaMovimento", "Avalie a confiança para se movimentar, de 0 a 10.");
  }

  if (!skipQuestion("caiu12Meses", data)) {
    need("caiu12Meses", "Informe se caiu nos últimos 12 meses.");
    if (data.caiu12Meses === "sim") {
      need("quedasQuantidade", "Informe quantas vezes, mesmo que aproximado.");
      need("quedaComLesao", "Informe se houve lesão em alguma queda.");
    }
    need("inseguroEmPeOuCaminhar", "Informe se sente insegurança ao ficar em pé ou caminhar.");
    need("medoDeCair", "Informe se tem medo de cair.");
    need("dificuldadeEnxergarOuObstaculos", "Informe sobre visão ou obstáculos no ambiente.");
    need("alguemAcompanhaAtividades", "Informe se alguém costuma acompanhar as atividades físicas.");
  }

  need("praticaAtualmente", "Informe se pratica atividade física atualmente.");
  if (data.praticaAtualmente === "sim") {
    need("praticaQual", "Qual atividade?");
    need("praticaFrequencia", "Quantas vezes por semana?");
    need("praticaDuracao", "Por quanto tempo, em média?");
  }
  need("oQueNaoFuncionou", "O que já tentou e não funcionou? Se nada, escreva “não se aplica”.");
  need("oQueGosta", "Quais exercícios ou atividades gosta de fazer?");
  need("oQueEvita", "O que prefere evitar?");
  need("tempoPorSessao", "Quanto tempo consegue reservar por sessão?");
  need("tempoPorSemana", "Quanto tempo consegue reservar por semana?");
  if (data.equipamentos.length === 0 && !data.equipamentosOutros.trim()) {
    add(ctx, "equipamentos", "Informe o acesso a equipamentos, mesmo que “Nenhum”.");
  }
  need("barreiraPrincipal", "Qual é a principal barreira para manter uma rotina?");
  if (data.barreiraPrincipal === "outra") need("barreiraOutra", "Descreva a barreira.");
  need("modalidadeInteresse", "Informe a preferência de conversa sobre o acompanhamento.");

  if (!data.cienciaNaoSubstituiClinico) {
    add(ctx, "cienciaNaoSubstituiClinico", "Confirme que entendeu que este formulário não substitui avaliação clínica.");
  }
  if (!data.autorizacaoDadosSaude) {
    add(
      ctx,
      "autorizacaoDadosSaude",
      "É necessário autorizar o tratamento dos dados pessoais e de saúde para a avaliação inicial.",
    );
  }
  if (!data.cienciaEnvioWhatsapp) {
    add(
      ctx,
      "cienciaEnvioWhatsapp",
      "É necessário estar ciente de que o relatório poderá ser enviado ao professor pelo WhatsApp.",
    );
  }
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function validateAssessment(data: AssessmentAnswers): {
  success: boolean;
  errors: Record<string, string>;
  value?: AssessmentAnswers;
} {
  const parsed = assessmentSchema.safeParse(data);
  if (!parsed.success) return { success: false, errors: fieldErrors(parsed.error) };
  return { success: true, errors: {}, value: parsed.data };
}

export function validateStep(
  step: number,
  data: AssessmentAnswers,
): Record<string, string> {
  if (step === 1) return validateStep1(data);
  if (step === 2) return validateStep2(data);
  if (step === 3) return validateStep3(data);
  if (step === 4) return validateStep4(data);
  if (step === 5) return validateStep5(data);
  if (step === 6) return validateStep6(data);
  return validateStep7(data);
}

const STEP_FIELDS: Record<number, (keyof AssessmentAnswers)[]> = {
  1: [
    "nomeCompleto",
    "idade",
    "cidade",
    "estado",
    "whatsapp",
    "email",
    "preenchidoPor",
    "familiarNome",
    "familiarVinculo",
    "familiarCiencia",
    "melhorPeriodo",
  ],
  2: [
    "motivoPrincipal",
    "motivoOutro",
    "dificuldadePrincipal",
    "atividadesDesejadas",
    "objetivoProximosMeses",
    "receioExercicios",
    "receioDetalhe",
  ],
  3: [
    "orientacaoLimitarExercicios",
    "diagnosticoRelevante",
    "diagnosticoEspecificar",
    "dorPeitoEsforco",
    "faltaArDesproporcional",
    "desmaio",
    "tonturasRecorrentes",
    "fraquezaNeurologicaNova",
    "perdaControleEsfincterComDorLombar",
    "cirurgiaInternacaoRecente",
    "cirurgiaQuandoPorQue",
    "tratamentoAtual",
    "tratamentoDetalhes",
    "medicamentos",
    "liberacaoExercicios",
    "recomendacaoEspecifica",
    "recomendacaoDetalhes",
  ],
  4: [
    "relataLesaoDor",
    "regiaoAfetada",
    "ladoAfetado",
    "diagnosticoProfissional",
    "diagnosticoInformado",
    "inicioQuando",
    "eventoEspecifico",
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
  ],
  5: [
    "capacidadeCaminhar",
    "capacidadeEscadas",
    "capacidadeLevantarCadeira",
    "capacidadeCarregarLeve",
    "capacidadeEquilibrio",
    "precisaAjudaCotidiano",
    "ajudaQual",
    "usaApoio",
    "apoioQual",
    "confiancaMovimento",
    "caiu12Meses",
    "quedasQuantidade",
    "quedaComLesao",
    "inseguroEmPeOuCaminhar",
    "medoDeCair",
    "dificuldadeEnxergarOuObstaculos",
    "alguemAcompanhaAtividades",
  ],
  6: [
    "praticaAtualmente",
    "praticaQual",
    "praticaFrequencia",
    "praticaDuracao",
    "oQueNaoFuncionou",
    "oQueGosta",
    "oQueEvita",
    "tempoPorSessao",
    "tempoPorSemana",
    "equipamentos",
    "barreiraPrincipal",
    "barreiraOutra",
    "modalidadeInteresse",
  ],
  7: ["cienciaNaoSubstituiClinico", "autorizacaoDadosSaude", "cienciaEnvioWhatsapp"],
};

function validatePartialDirect(
  data: AssessmentAnswers,
  keys: (keyof AssessmentAnswers)[],
): Record<string, string> {
  const clone: AssessmentAnswers = {
    ...emptyAnswers(),
    ...data,
  };

  const issues: Record<string, string> = {};
  const fakeCtx = {
    addIssue(issue: { path?: (string | number)[]; message: string }) {
      const key = String(issue.path?.[0] ?? "form");
      if (!issues[key]) issues[key] = issue.message;
    },
  } as z.RefinementCtx;

  requireFilled(clone, fakeCtx);
  const filtered: Record<string, string> = {};
  for (const key of keys) {
    if (issues[key]) filtered[key] = issues[key];
  }
  if (keys.includes("whatsapp") && data.whatsapp && !isValidBrMobile(data.whatsapp)) {
    filtered.whatsapp = "Informe um WhatsApp com DDD, com 10 ou 11 dígitos.";
  }
  if (keys.includes("email") && data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    filtered.email = "E-mail inválido.";
  }
  if (keys.includes("idade") && data.idade === "") {
    filtered.idade = "Informe a idade em anos.";
  }
  if (keys.includes("idade") && typeof data.idade === "number" && (data.idade < 12 || data.idade > 120)) {
    filtered.idade = "Informe uma idade entre 12 e 120 anos.";
  }
  return filtered;
}

function validateStep1(data: AssessmentAnswers) {
  return validatePartialDirect(data, STEP_FIELDS[1]);
}
function validateStep2(data: AssessmentAnswers) {
  return validatePartialDirect(data, STEP_FIELDS[2]);
}
function validateStep3(data: AssessmentAnswers) {
  return validatePartialDirect(data, STEP_FIELDS[3]);
}
function validateStep4(data: AssessmentAnswers) {
  return validatePartialDirect(data, STEP_FIELDS[4]);
}
function validateStep5(data: AssessmentAnswers) {
  return validatePartialDirect(data, STEP_FIELDS[5]);
}
function validateStep6(data: AssessmentAnswers) {
  return validatePartialDirect(data, STEP_FIELDS[6]);
}
function validateStep7(data: AssessmentAnswers) {
  return validatePartialDirect(data, STEP_FIELDS[7]);
}

export { STEP_FIELDS };
