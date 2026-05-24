import { PAGE_SIZE } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type {
  DashboardStats,
  Demand,
  DemandFormData,
  PaginatedResult,
} from "@/lib/types";
import { calculateDurationMinutes } from "@/lib/utils";

export async function getDemands(
  page = 1,
  pageSize = PAGE_SIZE
): Promise<PaginatedResult<Demand>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("demands")
    .select("*, attendant:attendants(*)", { count: "exact" })
    .order("date", { ascending: false })
    .order("demand_time", { ascending: false })
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: (data ?? []) as Demand[],
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function createDemand(form: DemandFormData): Promise<Demand> {
  const payload = buildPayload(form);

  const { data, error } = await supabase
    .from("demands")
    .insert(payload)
    .select("*, attendant:attendants(*)")
    .single();

  if (error) throw error;
  return data as Demand;
}

export async function updateDemand(
  id: string,
  form: Partial<DemandFormData>
): Promise<Demand> {
  const payload = buildPayload(form);

  const { data, error } = await supabase
    .from("demands")
    .update(payload)
    .eq("id", id)
    .select("*, attendant:attendants(*)")
    .single();

  if (error) throw error;
  return data as Demand;
}

export async function deleteDemand(id: string): Promise<void> {
  const { error } = await supabase.from("demands").delete().eq("id", id);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from("demands")
    .select("status, demand_time, service_time, completion_time");

  if (error) throw error;

  const demands = data ?? [];
  const total = demands.length;
  const pendentes = demands.filter((d) => d.status === "pendente").length;
  const emAtendimento = demands.filter(
    (d) => d.status === "em_atendimento"
  ).length;
  const finalizadas = demands.filter((d) => d.status === "finalizada").length;

  const durations = demands
    .filter((d) => d.status === "finalizada" && d.completion_time)
    .map((d) =>
      calculateDurationMinutes(
        d.demand_time,
        d.service_time,
        d.completion_time
      )
    )
    .filter((d): d is number => d !== null);

  const mediaTempoMinutos =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

  return { total, pendentes, emAtendimento, finalizadas, mediaTempoMinutos };
}

function buildPayload(form: Partial<DemandFormData>) {
  const payload: Record<string, unknown> = { ...form };

  if (form.status === "em_atendimento" && !form.service_time) {
    const now = new Date();
    payload.service_time = now.toTimeString().slice(0, 8);
  }

  if (form.status === "finalizada") {
    payload.completion_time = new Date().toISOString();
    if (!form.service_time) {
      const now = new Date();
      payload.service_time = now.toTimeString().slice(0, 8);
    }
  }

  if (form.status === "pendente") {
    payload.completion_time = null;
  }

  return payload;
}
