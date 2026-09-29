import { skipQuestion } from "./branching";
import { atividadesResumo, formatPhoneDisplay, labelOf } from "./labels";
import type { AssessmentAnswers } from "./types";

export type QuestionRow = {
  id: string;
  section: string;
  pergunta: string;
  resposta: string;
  skipped: boolean;
};

const NAO_SE_APLICA = "Não se aplica";

function text(value: string, skipped: boolean): string {
  if (skipped) return NAO_SE_APLICA;
  const t = value.trim();
  return t ? t : "Não informado";
}

function choice(value: unknown, skipped: boolean): string {
  if (skipped) return NAO_SE_APLICA;
  return labelOf(value);
}

function pain(value: AssessmentAnswers["dorRepouso"], skipped: boolean): string {
  if (skipped) return NAO_SE_APLICA;
  if (value === "" ) return "Não informado";
  if (value === "nao_sei") return "Não sei";
  if (value === "prefiro_explicar") return "Prefiro explicar na conversa";
  return `${value} / 10`;
}

export function buildQuestionRows(answers: AssessmentAnswers): QuestionRow[] {
  const s = (id: string) => skipQuestion(id, answers);

  return [
    ...sec("Etapa 1 — Identificação e contato", [
      row("nomeCompleto", "Nome completo", text(answers.nomeCompleto, false)),
      row("idade", "Idade (anos)", answers.idade === "" ? "Não informado" : String(answers.idade)),
      row("cidade", "Cidade", text(answers.cidade, false)),
      row("estado", "Estado", text(answers.estado, false)),
      row("whatsapp", "WhatsApp", formatPhoneDisplay(answers.whatsapp)),
      row("email", "E-mail", answers.email.trim() ? answers.email : "Não informado (opcional)"),
      row("preenchidoPor", "Quem está preenchendo", choice(answers.preenchidoPor, false)),
      row("familiarNome", "Nome do familiar ou cuidador", text(answers.familiarNome, s("familiarNome")), s("familiarNome")),
      row("familiarVinculo", "Vínculo com a pessoa atendida", text(answers.familiarVinculo, s("familiarVinculo")), s("familiarVinculo")),
      row(
        "familiarCiencia",
        "A pessoa atendida sabe deste contato?",
        s("familiarCiencia") ? NAO_SE_APLICA : answers.familiarCiencia ? "Sim, confirmado" : "Não",
        s("familiarCiencia"),
      ),
      row("melhorPeriodo", "Melhor período para contato", choice(answers.melhorPeriodo, false)),
    ]),

    ...sec("Etapa 2 — Objetivos e contexto", [
      row("motivoPrincipal", "Principal motivo para procurar acompanhamento", choice(answers.motivoPrincipal, false)),
      row("motivoOutro", "Outro motivo", text(answers.motivoOutro, s("motivoOutro")), s("motivoOutro")),
      row("dificuldadePrincipal", "Principal dificuldade atualmente", text(answers.dificuldadePrincipal, false)),
      row("atividadesDesejadas", "Atividades que gostaria de voltar a fazer ou fazer com mais segurança", atividadesResumo(answers)),
      row("objetivoProximosMeses", "Objetivo mais importante nos próximos meses", text(answers.objetivoProximosMeses, false)),
      row("receioExercicios", "Existe receio relacionado à prática de exercícios?", choice(answers.receioExercicios, false)),
      row("receioDetalhe", "Qual é o receio?", text(answers.receioDetalhe, s("receioDetalhe")), s("receioDetalhe")),
    ]),

    ...sec("Etapa 3 — Histórico de saúde e prontidão para exercício", [
      row("orientacaoLimitarExercicios", "Algum profissional de saúde já orientou limitar ou adaptar exercícios?", choice(answers.orientacaoLimitarExercicios, false)),
      row("diagnosticoRelevante", "Há diagnóstico relevante de condição que afete o exercício?", choice(answers.diagnosticoRelevante, false)),
      row("diagnosticoEspecificar", "Qual diagnóstico ou condição foi informado?", text(answers.diagnosticoEspecificar, s("diagnosticoEspecificar")), s("diagnosticoEspecificar")),
      row("dorPeitoEsforco", "Dor ou pressão no peito durante esforço?", choice(answers.dorPeitoEsforco, false)),
      row("faltaArDesproporcional", "Falta de ar intensa ou desproporcional ao esforço?", choice(answers.faltaArDesproporcional, false)),
      row("desmaio", "Desmaio ou quase desmaio?", choice(answers.desmaio, false)),
      row("tonturasRecorrentes", "Tonturas recorrentes?", choice(answers.tonturasRecorrentes, false)),
      row("fraquezaNeurologicaNova", "Fraqueza neurológica nova (braço, perna, fala ou um lado do corpo)?", choice(answers.fraquezaNeurologicaNova, false)),
      row("perdaControleEsfincterComDorLombar", "Perda recente de controle urinário ou intestinal associada a dor nas costas?", choice(answers.perdaControleEsfincterComDorLombar, false)),
      row("cirurgiaInternacaoRecente", "Houve cirurgia, internação ou atendimento de urgência recente?", choice(answers.cirurgiaInternacaoRecente, false)),
      row("cirurgiaQuandoPorQue", "Quando e por quê?", text(answers.cirurgiaQuandoPorQue, s("cirurgiaQuandoPorQue")), s("cirurgiaQuandoPorQue")),
      row("tratamentoAtual", "Faz tratamento médico ou fisioterapêutico atualmente?", choice(answers.tratamentoAtual, false)),
      row("tratamentoDetalhes", "Qual tratamento, de forma geral?", text(answers.tratamentoDetalhes, s("tratamentoDetalhes")), s("tratamentoDetalhes")),
      row("medicamentos", "Usa medicamentos que possam influenciar disposição, pressão, equilíbrio ou exercício?", choice(answers.medicamentos, false)),
      row("medicamentosGeral", "Informação geral sobre medicamentos (sem dose nem receita)", text(answers.medicamentosGeral, s("medicamentosGeral")), s("medicamentosGeral")),
      row("liberacaoExercicios", "Recebeu orientação ou liberação para retomar exercícios após lesão ou cirurgia?", choice(answers.liberacaoExercicios, false)),
      row("recomendacaoEspecifica", "Há recomendação específica do profissional que acompanha o caso?", choice(answers.recomendacaoEspecifica, false)),
      row("recomendacaoDetalhes", "Qual recomendação?", text(answers.recomendacaoDetalhes, s("recomendacaoDetalhes")), s("recomendacaoDetalhes")),
    ]),

    ...sec("Etapa 4 — Lesão, dor e limitações", [
      row("relataLesaoDor", "Há lesão, dor ou limitação física a detalhar nesta avaliação?", choice(answers.relataLesaoDor, false)),
      row("regiaoAfetada", "Região do corpo afetada", s("regiaoAfetada") ? NAO_SE_APLICA : labelOf([...answers.regiaoAfetada, answers.regiaoOutra].filter(Boolean)), s("regiaoAfetada")),
      row("regiaoOutra", "Outra região", text(answers.regiaoOutra, s("regiaoOutra")), s("regiaoOutra")),
      row("ladoAfetado", "Lado", choice(answers.ladoAfetado, s("ladoAfetado")), s("ladoAfetado")),
      row("diagnosticoProfissional", "Houve diagnóstico feito por profissional?", choice(answers.diagnosticoProfissional, s("diagnosticoProfissional")), s("diagnosticoProfissional")),
      row("diagnosticoInformado", "Qual foi o diagnóstico informado?", text(answers.diagnosticoInformado, s("diagnosticoInformado")), s("diagnosticoInformado")),
      row("inicioQuando", "Quando começou?", text(answers.inicioQuando, s("inicioQuando")), s("inicioQuando")),
      row("eventoEspecifico", "Houve um evento específico?", choice(answers.eventoEspecifico, s("eventoEspecifico")), s("eventoEspecifico")),
      row("eventoDetalhe", "Qual evento?", text(answers.eventoDetalhe, s("eventoDetalhe")), s("eventoDetalhe")),
      row("faseLesao", "Fase atual da lesão", choice(answers.faseLesao, s("faseLesao")), s("faseLesao")),
      row("fisioterapia", "Fez fisioterapia ou outro acompanhamento?", choice(answers.fisioterapia, s("fisioterapia")), s("fisioterapia")),
      row("fisioterapiaAndamento", "Esse acompanhamento está em andamento?", choice(answers.fisioterapiaAndamento, s("fisioterapiaAndamento")), s("fisioterapiaAndamento")),
      row("dorRepouso", "Dor em repouso (0 a 10)", pain(answers.dorRepouso, s("dorRepouso")), s("dorRepouso")),
      row("dorMovimento", "Dor durante o movimento (0 a 10)", pain(answers.dorMovimento, s("dorMovimento")), s("dorMovimento")),
      row("frequenciaDor", "Com que frequência a dor aparece?", choice(answers.frequenciaDor, s("frequenciaDor")), s("frequenciaDor")),
      row("oQuePiora", "O que piora", text(answers.oQuePiora, s("oQuePiora")), s("oQuePiora")),
      row("oQueAlivia", "O que alivia", text(answers.oQueAlivia, s("oQueAlivia")), s("oQueAlivia")),
      row("perdaForca", "Há perda de força?", choice(answers.perdaForca, s("perdaForca")), s("perdaForca")),
      row("dormenciaFormigamento", "Há dormência ou formigamento?", choice(answers.dormenciaFormigamento, s("dormenciaFormigamento")), s("dormenciaFormigamento")),
      row("instabilidade", "Há sensação de instabilidade?", choice(answers.instabilidade, s("instabilidade")), s("instabilidade")),
      row("movimentosEvitar", "Quais movimentos foram orientados a evitar?", text(answers.movimentosEvitar, s("movimentosEvitar")), s("movimentosEvitar")),
      row("interfereSono", "A limitação interfere no sono?", choice(answers.interfereSono, s("interfereSono")), s("interfereSono")),
      row("interfereTrabalho", "A limitação interfere no trabalho?", choice(answers.interfereTrabalho, s("interfereTrabalho")), s("interfereTrabalho")),
      row("interfereCotidiano", "A limitação interfere nas atividades cotidianas?", choice(answers.interfereCotidiano, s("interfereCotidiano")), s("interfereCotidiano")),
    ]),

    ...sec("Etapa 5 — Capacidade funcional e quedas", [
      row("capacidadeCaminhar", "Capacidade de caminhar", choice(answers.capacidadeCaminhar, false)),
      row("capacidadeEscadas", "Capacidade de subir escadas", choice(answers.capacidadeEscadas, false)),
      row("capacidadeLevantarCadeira", "Capacidade de levantar de uma cadeira", choice(answers.capacidadeLevantarCadeira, false)),
      row("capacidadeCarregarLeve", "Capacidade de carregar objetos leves", choice(answers.capacidadeCarregarLeve, false)),
      row("capacidadeEquilibrio", "Capacidade de manter o equilíbrio", choice(answers.capacidadeEquilibrio, false)),
      row("precisaAjudaCotidiano", "Precisa de ajuda para alguma atividade cotidiana?", choice(answers.precisaAjudaCotidiano, false)),
      row("ajudaQual", "Qual atividade?", text(answers.ajudaQual, s("ajudaQual")), s("ajudaQual")),
      row("usaApoio", "Usa bengala, andador ou outro apoio?", choice(answers.usaApoio, false)),
      row("apoioQual", "Qual apoio?", text(answers.apoioQual, s("apoioQual")), s("apoioQual")),
      row("confiancaMovimento", "Confiança para se movimentar (0 a 10)", pain(answers.confiancaMovimento, false)),
      row("caiu12Meses", "Caiu nos últimos 12 meses?", choice(answers.caiu12Meses, s("caiu12Meses")), s("caiu12Meses")),
      row("quedasQuantidade", "Quantas vezes?", text(answers.quedasQuantidade, s("quedasQuantidade")), s("quedasQuantidade")),
      row("quedaComLesao", "Houve lesão em alguma queda?", choice(answers.quedaComLesao, s("quedaComLesao")), s("quedaComLesao")),
      row("inseguroEmPeOuCaminhar", "Sente-se inseguro ao ficar em pé ou caminhar?", choice(answers.inseguroEmPeOuCaminhar, s("inseguroEmPeOuCaminhar")), s("inseguroEmPeOuCaminhar")),
      row("medoDeCair", "Tem medo de cair?", choice(answers.medoDeCair, s("medoDeCair")), s("medoDeCair")),
      row("dificuldadeEnxergarOuObstaculos", "Há dificuldade para enxergar ou obstáculos frequentes no ambiente?", choice(answers.dificuldadeEnxergarOuObstaculos, s("dificuldadeEnxergarOuObstaculos")), s("dificuldadeEnxergarOuObstaculos")),
      row("alguemAcompanhaAtividades", "Alguém costuma acompanhar as atividades físicas?", choice(answers.alguemAcompanhaAtividades, s("alguemAcompanhaAtividades")), s("alguemAcompanhaAtividades")),
    ]),

    ...sec("Etapa 6 — Rotina e preferências de treino", [
      row("praticaAtualmente", "Pratica alguma atividade física atualmente?", choice(answers.praticaAtualmente, false)),
      row("praticaQual", "Qual atividade?", text(answers.praticaQual, s("praticaQual")), s("praticaQual")),
      row("praticaFrequencia", "Quantas vezes por semana?", text(answers.praticaFrequencia, s("praticaFrequencia")), s("praticaFrequencia")),
      row("praticaDuracao", "Por quanto tempo, em média?", text(answers.praticaDuracao, s("praticaDuracao")), s("praticaDuracao")),
      row("oQueNaoFuncionou", "O que já tentou fazer e não funcionou?", text(answers.oQueNaoFuncionou, false)),
      row("oQueGosta", "Quais exercícios ou atividades gosta de fazer?", text(answers.oQueGosta, false)),
      row("oQueEvita", "Quais não gosta, causam desconforto ou prefere evitar?", text(answers.oQueEvita, false)),
      row("tempoPorSessao", "Tempo realista por sessão", text(answers.tempoPorSessao, false)),
      row("tempoPorSemana", "Tempo realista por semana", text(answers.tempoPorSemana, false)),
      row("equipamentos", "Acesso a equipamentos", labelOf(answers.equipamentos.length ? answers.equipamentos : [])),
      row("equipamentosOutros", "Outros equipamentos", text(answers.equipamentosOutros, s("equipamentosOutros")), s("equipamentosOutros")),
      row("barreiraPrincipal", "Principal barreira para manter uma rotina", choice(answers.barreiraPrincipal, false)),
      row("barreiraOutra", "Outra barreira", text(answers.barreiraOutra, s("barreiraOutra")), s("barreiraOutra")),
      row("modalidadeInteresse", "Preferência para conversar sobre o acompanhamento", `${choice(answers.modalidadeInteresse, false)} (preferência de conversa; disponibilidade a confirmar com o professor)`),
    ]),

    ...sec("Etapa 7 — Autorização", [
      row("cienciaNaoSubstituiClinico", "Ciência de que o formulário não substitui avaliação clínica", answers.cienciaNaoSubstituiClinico ? "Sim" : "Não"),
      row("autorizacaoDadosSaude", "Autorização para tratamento de dados pessoais e de saúde para avaliação inicial e contato", answers.autorizacaoDadosSaude ? "Sim" : "Não"),
      row("cienciaEnvioWhatsapp", "Ciência de que o relatório poderá ser enviado ao professor pelo WhatsApp", answers.cienciaEnvioWhatsapp ? "Sim" : "Não"),
      row("consentimentoMarketing", "Consentimento opcional para mensagens promocionais futuras", answers.consentimentoMarketing ? "Sim" : "Não (padrão)"),
    ]),
  ];
}

function row(id: string, pergunta: string, resposta: string, skipped = false): QuestionRow {
  return { id, section: "", pergunta, resposta, skipped };
}

function sec(section: string, items: QuestionRow[]): QuestionRow[] {
  return items.map((item) => ({ ...item, section }));
}

export const ALL_QUESTION_IDS = [
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
  "motivoPrincipal",
  "motivoOutro",
  "dificuldadePrincipal",
  "atividadesDesejadas",
  "objetivoProximosMeses",
  "receioExercicios",
  "receioDetalhe",
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
  "medicamentosGeral",
  "liberacaoExercicios",
  "recomendacaoEspecifica",
  "recomendacaoDetalhes",
  "relataLesaoDor",
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
  "equipamentosOutros",
  "barreiraPrincipal",
  "barreiraOutra",
  "modalidadeInteresse",
  "cienciaNaoSubstituiClinico",
  "autorizacaoDadosSaude",
  "cienciaEnvioWhatsapp",
  "consentimentoMarketing",
] as const;
