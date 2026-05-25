import type { DemandStatus, DemandType } from "./constants";

export interface Attendant {
  id: string;
  name: string;
  created_at: string;
}

export interface Requester {
  id: string;
  name: string;
  created_at: string;
}

export interface Demand {
  id: string;
  date: string;
  demand_time: string;
  type: DemandType;
  requester_id: string | null;
  attendant_id: string | null;
  service_time: string | null;
  completion_time: string | null;
  status: DemandStatus;
  comment: string | null;
  created_at: string;
  attendant?: Attendant | null;
  requester?: Requester | null;
}

export interface DemandFormData {
  date: string;
  demand_time: string;
  type: DemandType;
  requester_id: string | null;
  attendant_id: string | null;
  service_time: string | null;
  status: DemandStatus;
  comment: string | null;
}

export interface DashboardStats {
  total: number;
  pendentes: number;
  emAtendimento: number;
  concluidas: number;
  canceladas: number;
  mediaTempoMinutos: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
