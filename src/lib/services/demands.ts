import { PAGE_SIZE } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type {
  DashboardStats,
  Demand,
  DemandFilters,
  DemandFormData,
  PaginatedResult,
} from "@/lib/types";
import { buildCompletionIso, calculateDurationMinutes } from "@/lib/utils";

const demandSelect =
  "*, attendant:attendants(*), requester:requesters(*)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DemandsQuery = any;

async function buildSearchOrClause(term: string): Promise<string | null> {
  const pattern = `%${term.trim()}%`;
  const [requestersRes, attendantsRes] = await Promise.all([
    supabase.from("requesters").select("id").ilike("name", pattern),
    supabase.from("attendants").select("id").ilike("name", pattern),
  ]);

  if (requestersRes.error) throw requestersRes.error;
  if (attendantsRes.error) throw attendantsRes.error;

  const parts = [`comment.ilike.${pattern}`];
  const requesterIds = requestersRes.data?.map((r) => r.id) ?? [];
  const attendantIds = attendantsRes.data?.map((a) => a.id) ?? [];

  if (requesterIds.length > 0) {
    parts.push(`requester_id.in.(${requesterIds.join(",")})`);
  }
  if (attendantIds.length > 0) {
    parts.push(`attendant_id.in.(${attendantIds.join(",")})`);
  }

  return parts.join(",");
}

function applyDemandFilters(
  query: DemandsQuery,
  filters?: DemandFilters
): DemandsQuery {
  if (!filters) return query;

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.attendantId) {
    query = query.eq("attendant_id", filters.attendantId);
  }
  if (filters.requesterId) {
    query = query.eq("requester_id", filters.requesterId);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  return query;
}

async function applySearchFilter(
  query: DemandsQuery,
  filters?: DemandFilters
): Promise<DemandsQuery> {
  const term = filters?.search?.trim();
  if (!term) return query;

  const orClause = await buildSearchOrClause(term);
  if (!orClause) return query;

  return query.or(orClause);
}

export async function getAllDemands(
  filters?: DemandFilters
): Promise<Demand[]> {
  let query = supabase.from("demands").select(demandSelect);

  query = applyDemandFilters(query, filters);
  query = await applySearchFilter(query, filters);

  query = query
    .order("date", { ascending: false })
    .order("demand_time", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Demand[];
}

export async function getDemands(
  page = 1,
  pageSize = PAGE_SIZE,
  filters?: DemandFilters
): Promise<PaginatedResult<Demand>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("demands")
    .select(demandSelect, { count: "exact" });

  query = applyDemandFilters(query, filters);
  query = await applySearchFilter(query, filters);

  query = query
    .order("date", { ascending: false })
    .order("demand_time", { ascending: false });

  const { data, error, count } = await query.range(from, to);

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
    .select(demandSelect)
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
    .select(demandSelect)
    .single();

  if (error) throw error;
  return data as Demand;
}

export async function getDemandById(id: string): Promise<Demand | null> {
  const { data, error } = await supabase
    .from("demands")
    .select(demandSelect)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data as Demand;
}

export async function deleteDemand(id: string): Promise<void> {
  const { error } = await supabase.from("demands").delete().eq("id", id);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from("demands")
    .select("status, date, demand_time, service_time, completion_time");

  if (error) throw error;

  const demands = data ?? [];
  const total = demands.length;
  const pendentes = demands.filter((d) => d.status === "pendente").length;
  const emAtendimento = demands.filter(
    (d) => d.status === "em_atendimento"
  ).length;
  const concluidas = demands.filter((d) => d.status === "concluido").length;
  const canceladas = demands.filter((d) => d.status === "cancelada").length;

  const durations = demands
    .filter((d) => d.status === "concluido" && d.completion_time)
    .map((d) =>
      calculateDurationMinutes(
        d.date,
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

  return { total, pendentes, emAtendimento, concluidas, canceladas, mediaTempoMinutos };
}

function buildPayload(form: Partial<DemandFormData>) {
  const payload: Record<string, unknown> = { ...form };

  delete payload.completion_date;
  delete payload.completion_time_only;

  if (form.service_time === "") {
    payload.service_time = null;
  }

  if (form.status === "concluido") {
    const hasCompletionDate =
      form.completion_date != null && form.completion_date !== "";
    const hasCompletionTime =
      form.completion_time_only != null && form.completion_time_only !== "";

    if (hasCompletionDate && hasCompletionTime) {
      payload.completion_time = buildCompletionIso(
        form.completion_date!,
        form.completion_time_only!
      );
    } else if (
      form.completion_date === undefined &&
      form.completion_time_only === undefined
    ) {
      // Ex.: mudança rápida de status na tabela — usa o momento atual
      payload.completion_time = new Date().toISOString();
    }
    // Se o formulário enviou data/hora de finalização (edição), não sobrescreve com "agora"
  }

  if (form.status === "pendente" || form.status === "em_atendimento") {
    payload.completion_time = null;
  }

  return payload;
}
