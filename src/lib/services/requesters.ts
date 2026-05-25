import { PAGE_SIZE } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type { PaginatedResult, Requester } from "@/lib/types";

export async function getRequesters(
  page = 1,
  pageSize = PAGE_SIZE
): Promise<PaginatedResult<Requester>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("requesters")
    .select("*", { count: "exact" })
    .order("name")
    .range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  return {
    data: data ?? [],
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getAllRequesters(): Promise<Requester[]> {
  const { data, error } = await supabase
    .from("requesters")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function createRequester(name: string): Promise<Requester> {
  const { data, error } = await supabase
    .from("requesters")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRequester(
  id: string,
  name: string
): Promise<Requester> {
  const { data, error } = await supabase
    .from("requesters")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRequester(id: string): Promise<void> {
  const { error } = await supabase.from("requesters").delete().eq("id", id);
  if (error) throw error;
}
