"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { EmptyState } from "@/components/ui/pagination";
import { getDashboardStats } from "@/lib/services/demands";
import type { DashboardStats } from "@/lib/types";
import { useEffect, useState } from "react";

const emptyStats: DashboardStats = {
  total: 0,
  pendentes: 0,
  emAtendimento: 0,
  finalizadas: 0,
  mediaTempoMinutos: null,
};

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <EmptyState message="Carregando dashboard..." />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return <StatsCards stats={stats} />;
}
