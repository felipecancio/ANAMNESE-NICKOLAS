import type { AssessmentAnswers } from "./types";

export const LABELS: Record<string, string> = {
  sim: "Sim",
  nao: "Não",
  nao_sei: "Não sei",
  prefiro_explicar: "Prefiro explicar na conversa",
  nao_se_aplica: "Não se aplica",
  ainda_nao: "Ainda não",
  propria: "A própria pessoa que será acompanhada",
  familiar: "Familiar ou cuidador",
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  qualquer: "Qualquer período",
  retorno_lesao: "Retorno após lesão",
  dor_limitacao: "Dor ou limitação",
  forca: "Força",
  equilibrio: "Equilíbrio",
  mobilidade: "Mobilidade",
  autonomia: "Autonomia nas atividades diárias",
  prevencao_quedas: "Prevenção de quedas",
  outro: "Outro",
  sem_dificuldade: "Sem dificuldade",
  pouca_dificuldade: "Pouca dificuldade",
  muita_dificuldade: "Muita dificuldade",
  nao_consegue: "Não consegue no momento",
  recente: "Fase recente",
  em_tratamento: "Em tratamento",
  apos_cirurgia: "Após cirurgia",
  acompanhamento_longo: "Acompanhamento de longo prazo",
  constante: "Constante",
  diaria: "Diária",
  algumas_vezes_semana: "Algumas vezes na semana",
  ocasional: "Ocasional",
  somente_movimento: "Somente durante o movimento",
  presencial: "Conversar sobre acompanhamento presencial",
  remoto: "Conversar sobre acompanhamento remoto",
  ainda_nao_sei: "Ainda não sei",
  direito: "Direito",
  esquerdo: "Esquerdo",
  ambos: "Ambos",
  tempo: "Tempo",
  dor: "Dor",
  medo: "Medo",
  deslocamento: "Deslocamento",
  motivacao: "Motivação",
  outra: "Outra",
};

export const MOTIVO_OPTIONS = [
  { value: "retorno_lesao", label: "Retorno após lesão" },
  { value: "dor_limitacao", label: "Dor ou limitação" },
  { value: "forca", label: "Força" },
  { value: "equilibrio", label: "Equilíbrio" },
  { value: "mobilidade", label: "Mobilidade" },
  { value: "autonomia", label: "Autonomia nas atividades diárias" },
  { value: "prevencao_quedas", label: "Prevenção de quedas" },
  { value: "outro", label: "Outro" },
  { value: "prefiro_explicar", label: "Prefiro explicar na conversa" },
] as const;

export const ATIVIDADES_OPCOES = [
  "Caminhar",
  "Subir e descer escadas",
  "Levantar da cadeira ou da cama",
  "Trabalhar",
  "Praticar esporte",
  "Cuidar da casa",
  "Brincar com netos ou crianças",
  "Viajar com mais segurança",
] as const;

export const REGIOES_CORPO = [
  "Pescoço",
  "Ombro",
  "Cotovelo",
  "Punho ou mão",
  "Coluna torácica",
  "Lombar",
  "Quadril",
  "Joelho",
  "Tornozelo ou pé",
  "Outra",
] as const;

export const EQUIPAMENTOS_OPCOES = [
  "Nenhum",
  "Elástico",
  "Halteres leves",
  "Caneleiras",
  "Colchonete",
  "Bola",
  "Barra ou apoio fixo",
  "Academia",
  "Espaço ao ar livre",
] as const;

export const TRI_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "nao_sei", label: "Não sei" },
] as const;

export const SOFT_TRI_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
  { value: "nao_sei", label: "Não sei" },
  { value: "prefiro_explicar", label: "Prefiro explicar na conversa" },
] as const;

export const CAPACIDADE_OPTIONS = [
  { value: "sem_dificuldade", label: "Sem dificuldade" },
  { value: "pouca_dificuldade", label: "Pouca dificuldade" },
  { value: "muita_dificuldade", label: "Muita dificuldade" },
  { value: "nao_consegue", label: "Não consegue no momento" },
  { value: "nao_sei", label: "Não sei" },
  { value: "prefiro_explicar", label: "Prefiro explicar na conversa" },
  { value: "nao_se_aplica", label: "Não se aplica" },
] as const;

export function labelOf(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Não informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) {
    if (value.length === 0) return "Nenhuma selecionada";
    return value.map((item) => labelOf(item)).join(", ");
  }
  if (typeof value === "number") return String(value);
  const key = String(value);
  return LABELS[key] ?? key;
}

export function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return digits;
}

export function atividadesResumo(answers: AssessmentAnswers): string {
  const list = [...answers.atividadesDesejadas];
  if (answers.atividadesOutra.trim()) list.push(answers.atividadesOutra.trim());
  return list.length ? list.join(", ") : "Não informado";
}
