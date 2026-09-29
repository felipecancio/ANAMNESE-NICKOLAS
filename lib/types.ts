export type Tri = "sim" | "nao" | "nao_sei";
export type Soft =
  | "sim"
  | "nao"
  | "nao_sei"
  | "prefiro_explicar"
  | "nao_se_aplica"
  | "ainda_nao";

export type MotivoPrincipal =
  | "retorno_lesao"
  | "dor_limitacao"
  | "forca"
  | "equilibrio"
  | "mobilidade"
  | "autonomia"
  | "prevencao_quedas"
  | "outro"
  | "prefiro_explicar";

export type PreenchidoPor = "propria" | "familiar";

export type Capacidade =
  | "sem_dificuldade"
  | "pouca_dificuldade"
  | "muita_dificuldade"
  | "nao_consegue"
  | "nao_sei"
  | "prefiro_explicar"
  | "nao_se_aplica";

export type FaseLesao =
  | "recente"
  | "em_tratamento"
  | "apos_cirurgia"
  | "acompanhamento_longo"
  | "nao_sei"
  | "prefiro_explicar"
  | "nao_se_aplica";

export type FrequenciaDor =
  | "constante"
  | "diaria"
  | "algumas_vezes_semana"
  | "ocasional"
  | "somente_movimento"
  | "nao_sei"
  | "prefiro_explicar"
  | "nao_se_aplica";

export type ModalidadeInteresse = "presencial" | "remoto" | "ainda_nao_sei";

export type AssessmentAnswers = {
  // Etapa 1
  nomeCompleto: string;
  idade: number | "";
  cidade: string;
  estado: string;
  whatsapp: string;
  email: string;
  preenchidoPor: PreenchidoPor | "";
  familiarNome: string;
  familiarVinculo: string;
  familiarCiencia: boolean;
  melhorPeriodo: "manha" | "tarde" | "noite" | "qualquer" | "prefiro_explicar" | "";

  // Etapa 2
  motivoPrincipal: MotivoPrincipal | "";
  motivoOutro: string;
  dificuldadePrincipal: string;
  atividadesDesejadas: string[];
  atividadesOutra: string;
  objetivoProximosMeses: string;
  receioExercicios: Soft | "";
  receioDetalhe: string;

  // Etapa 3
  orientacaoLimitarExercicios: Tri | "";
  diagnosticoRelevante: Tri | "";
  diagnosticoEspecificar: string;
  dorPeitoEsforco: Tri | "";
  faltaArDesproporcional: Tri | "";
  desmaio: Tri | "";
  tonturasRecorrentes: Tri | "";
  fraquezaNeurologicaNova: Tri | "";
  perdaControleEsfincterComDorLombar: Tri | "";
  cirurgiaInternacaoRecente: Tri | "";
  cirurgiaQuandoPorQue: string;
  tratamentoAtual: Tri | "";
  tratamentoDetalhes: string;
  medicamentos: Soft | "";
  medicamentosGeral: string;
  liberacaoExercicios: Soft | "";
  recomendacaoEspecifica: Soft | "";
  recomendacaoDetalhes: string;

  // Etapa 4
  relataLesaoDor: Soft | "";
  regiaoAfetada: string[];
  regiaoOutra: string;
  ladoAfetado: "direito" | "esquerdo" | "ambos" | "nao_se_aplica" | "nao_sei" | "prefiro_explicar" | "";
  diagnosticoProfissional: Soft | "";
  diagnosticoInformado: string;
  inicioQuando: string;
  eventoEspecifico: Soft | "";
  eventoDetalhe: string;
  faseLesao: FaseLesao | "";
  fisioterapia: Soft | "";
  fisioterapiaAndamento: Soft | "";
  dorRepouso: number | "" | "nao_sei" | "prefiro_explicar";
  dorMovimento: number | "" | "nao_sei" | "prefiro_explicar";
  frequenciaDor: FrequenciaDor | "";
  oQuePiora: string;
  oQueAlivia: string;
  perdaForca: Tri | "";
  dormenciaFormigamento: Tri | "";
  instabilidade: Tri | "";
  movimentosEvitar: string;
  interfereSono: Tri | "";
  interfereTrabalho: Tri | "";
  interfereCotidiano: Tri | "";

  // Etapa 5
  capacidadeCaminhar: Capacidade | "";
  capacidadeEscadas: Capacidade | "";
  capacidadeLevantarCadeira: Capacidade | "";
  capacidadeCarregarLeve: Capacidade | "";
  capacidadeEquilibrio: Capacidade | "";
  precisaAjudaCotidiano: Soft | "";
  ajudaQual: string;
  usaApoio: Soft | "";
  apoioQual: string;
  confiancaMovimento: number | "" | "nao_sei" | "prefiro_explicar";
  caiu12Meses: Tri | "";
  quedasQuantidade: string;
  quedaComLesao: Tri | "";
  inseguroEmPeOuCaminhar: Tri | "";
  medoDeCair: Tri | "";
  dificuldadeEnxergarOuObstaculos: Tri | "";
  alguemAcompanhaAtividades: Soft | "";

  // Etapa 6
  praticaAtualmente: Soft | "";
  praticaQual: string;
  praticaFrequencia: string;
  praticaDuracao: string;
  oQueNaoFuncionou: string;
  oQueGosta: string;
  oQueEvita: string;
  tempoPorSessao: string;
  tempoPorSemana: string;
  equipamentos: string[];
  equipamentosOutros: string;
  barreiraPrincipal:
    | "tempo"
    | "dor"
    | "medo"
    | "deslocamento"
    | "motivacao"
    | "outra"
    | "nao_sei"
    | "prefiro_explicar"
    | "";
  barreiraOutra: string;
  modalidadeInteresse: ModalidadeInteresse | "";

  // Etapa 7
  cienciaNaoSubstituiClinico: boolean;
  autorizacaoDadosSaude: boolean;
  cienciaEnvioWhatsapp: boolean;
  consentimentoMarketing: boolean;

  // anti-spam (never in PDF)
  website: string;
  startedAt: number;
};

export const emptyAnswers = (): AssessmentAnswers => ({
  nomeCompleto: "",
  idade: "",
  cidade: "",
  estado: "",
  whatsapp: "",
  email: "",
  preenchidoPor: "",
  familiarNome: "",
  familiarVinculo: "",
  familiarCiencia: false,
  melhorPeriodo: "",

  motivoPrincipal: "",
  motivoOutro: "",
  dificuldadePrincipal: "",
  atividadesDesejadas: [],
  atividadesOutra: "",
  objetivoProximosMeses: "",
  receioExercicios: "",
  receioDetalhe: "",

  orientacaoLimitarExercicios: "",
  diagnosticoRelevante: "",
  diagnosticoEspecificar: "",
  dorPeitoEsforco: "",
  faltaArDesproporcional: "",
  desmaio: "",
  tonturasRecorrentes: "",
  fraquezaNeurologicaNova: "",
  perdaControleEsfincterComDorLombar: "",
  cirurgiaInternacaoRecente: "",
  cirurgiaQuandoPorQue: "",
  tratamentoAtual: "",
  tratamentoDetalhes: "",
  medicamentos: "",
  medicamentosGeral: "",
  liberacaoExercicios: "",
  recomendacaoEspecifica: "",
  recomendacaoDetalhes: "",

  relataLesaoDor: "",
  regiaoAfetada: [],
  regiaoOutra: "",
  ladoAfetado: "",
  diagnosticoProfissional: "",
  diagnosticoInformado: "",
  inicioQuando: "",
  eventoEspecifico: "",
  eventoDetalhe: "",
  faseLesao: "",
  fisioterapia: "",
  fisioterapiaAndamento: "",
  dorRepouso: "",
  dorMovimento: "",
  frequenciaDor: "",
  oQuePiora: "",
  oQueAlivia: "",
  perdaForca: "",
  dormenciaFormigamento: "",
  instabilidade: "",
  movimentosEvitar: "",
  interfereSono: "",
  interfereTrabalho: "",
  interfereCotidiano: "",

  capacidadeCaminhar: "",
  capacidadeEscadas: "",
  capacidadeLevantarCadeira: "",
  capacidadeCarregarLeve: "",
  capacidadeEquilibrio: "",
  precisaAjudaCotidiano: "",
  ajudaQual: "",
  usaApoio: "",
  apoioQual: "",
  confiancaMovimento: "",
  caiu12Meses: "",
  quedasQuantidade: "",
  quedaComLesao: "",
  inseguroEmPeOuCaminhar: "",
  medoDeCair: "",
  dificuldadeEnxergarOuObstaculos: "",
  alguemAcompanhaAtividades: "",

  praticaAtualmente: "",
  praticaQual: "",
  praticaFrequencia: "",
  praticaDuracao: "",
  oQueNaoFuncionou: "",
  oQueGosta: "",
  oQueEvita: "",
  tempoPorSessao: "",
  tempoPorSemana: "",
  equipamentos: [],
  equipamentosOutros: "",
  barreiraPrincipal: "",
  barreiraOutra: "",
  modalidadeInteresse: "",

  cienciaNaoSubstituiClinico: false,
  autorizacaoDadosSaude: false,
  cienciaEnvioWhatsapp: false,
  consentimentoMarketing: false,

  website: "",
  startedAt: 0,
});

export type WhatsappStatus =
  | "pendente"
  | "pendente_configuracao"
  | "enviado"
  | "entregue"
  | "falhou"
  | "nao_aplicavel";

export type AssessmentStatus = "recebida" | "interrompida_urgencia";

export type PriorityFlag = {
  code: string;
  label: string;
};

export type StoredAssessment = {
  id: string;
  protocol: string;
  createdAt: string;
  updatedAt: string;
  status: AssessmentStatus;
  answers: AssessmentAnswers;
  flags: PriorityFlag[];
  skippedQuestionIds: string[];
  whatsappStatus: WhatsappStatus;
  whatsappMessageId: string | null;
  whatsappError: string | null;
  whatsappAttempts: number;
  lastWhatsappAttemptAt: string | null;
  pdfFilename: string | null;
  clientRequestId: string;
};

export type SiteSettings = {
  cref: string;
  photoPath: string;
  responsibleName: string;
  responsibleEmail: string;
  retentionNote: string;
};
