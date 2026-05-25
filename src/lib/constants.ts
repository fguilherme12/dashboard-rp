export const DEMAND_TYPES = [
  "tracking",
  "conversao",
  "pdf",
  "tracking_conversao",
  "atualizacao_status",
] as const;
export type DemandType = (typeof DEMAND_TYPES)[number];

export const TYPE_LABELS: Record<DemandType, string> = {
  tracking: "Tracking",
  conversao: "Conversão",
  pdf: "PDF",
  tracking_conversao: "Tracking + Conversão",
  atualizacao_status: "Atualização Status",
};

export const DEMAND_STATUSES = [
  "pendente",
  "em_atendimento",
  "concluido",
  "cancelada",
] as const;
export type DemandStatus = (typeof DEMAND_STATUSES)[number];

export const STATUS_LABELS: Record<DemandStatus, string> = {
  pendente: "Pendente",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  cancelada: "Demanda Cancelada",
};

export const STATUS_COLORS: Record<DemandStatus, string> = {
  pendente: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  em_atendimento: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  concluido: "text-green-400 border-green-400/50 bg-green-400/10",
  cancelada: "text-red-400 border-red-400/50 bg-red-400/10",
};

export const PAGE_SIZE = 10;

export const SEED_REQUESTER_NAMES = [
  "Adriano Correia",
  "Adriano Luz",
  "Alceu Filho",
  "Alexandro Silva",
  "Amanda Silva",
  "Ana Carla",
  "Ariane Januario",
  "Arlete Fraga",
  "Dagmara Amorim",
  "Daniel Filho",
  "Douglas Oliveira",
  "Edilaine Bandeira",
  "Emanoelli Vitória",
  "Fernanda Nunes",
  "Filipe Silva",
  "Gabrielaa Fagundes",
  "Gleydson Saraiva",
  "Guilherme Werpp",
  "Hugo Leonardo",
  "Jairo Rodrigues",
  "Jessica Dias",
  "Jessica Reis",
  "João Carlos",
  "Lucas Martins",
  "Luiza Araujo",
  "Luma Amorim",
  "Magna Marques",
  "Marivaldo Silva",
  "Matheus Mendes",
  "Matheus Padilha",
  "Mônica Melo",
  "Nilza Jungklaus",
  "Pablo Ferreira",
  "Pedro Rodrigues",
  "Robert Emanuel",
  "Sammia Cordeiro",
  "Theisy Vieira",
  "Tiago Santos",
  "Vanessa Fagundes",
  "Wallacy Nascimento",
] as const;
