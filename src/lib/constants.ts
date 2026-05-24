export const DEMAND_TYPES = ["TMS", "TMS+CSV"] as const;
export type DemandType = (typeof DEMAND_TYPES)[number];

export const DEMAND_STATUSES = [
  "pendente",
  "em_atendimento",
  "finalizada",
] as const;
export type DemandStatus = (typeof DEMAND_STATUSES)[number];

export const STATUS_LABELS: Record<DemandStatus, string> = {
  pendente: "Pendente",
  em_atendimento: "Em Atendimento",
  finalizada: "Finalizada",
};

export const STATUS_COLORS: Record<DemandStatus, string> = {
  pendente: "text-yellow-400 border-yellow-400/50 bg-yellow-400/10",
  em_atendimento: "text-blue-400 border-blue-400/50 bg-blue-400/10",
  finalizada: "text-green-400 border-green-400/50 bg-green-400/10",
};

export const PAGE_SIZE = 10;
