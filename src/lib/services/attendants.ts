import { PAGE_SIZE } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";
import type { Attendant, PaginatedResult } from "@/lib/types";

export async function getAttendants(
  page = 1,
  pageSize = PAGE_SIZE,
  search = ""
): Promise<PaginatedResult<Attendant>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("attendants")
    .select("*", { count: "exact" })
    .order("name");

  const term = search.trim();
  if (term) {
    query = query.ilike("name", `%${term}%`);
  }

  const { data, error, count } = await query.range(from, to);

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

export async function getAllAttendants(): Promise<Attendant[]> {
  const { data, error } = await supabase
    .from("attendants")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function createAttendant(name: string): Promise<Attendant> {
  const { data, error } = await supabase
    .from("attendants")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAttendant(
  id: string,
  name: string
): Promise<Attendant> {
  const { data, error } = await supabase
    .from("attendants")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAttendant(id: string): Promise<void> {
  const { error } = await supabase.from("attendants").delete().eq("id", id);
  if (error) throw error;
}
