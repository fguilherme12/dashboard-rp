"use client";

import { DemandModal } from "@/components/demandas/demand-modal";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/pagination";
import { getAllAttendants } from "@/lib/services/attendants";
import { createDemand, getDashboardStats } from "@/lib/services/demands";
import { getAllRequesters } from "@/lib/services/requesters";
import type {
  Attendant,
  DashboardStats,
  DemandFormData,
  Requester,
} from "@/lib/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

const emptyStats: DashboardStats = {
  total: 0,
  pendentes: 0,
  emAtendimento: 0,
  concluidas: 0,
  canceladas: 0,
  mediaTempoMinutos: null,
};

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadStats() {
    const data = await getDashboardStats();
    setStats(data);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [statsData, attendantsList, requestersList] = await Promise.all([
          getDashboardStats(),
          getAllAttendants(),
          getAllRequesters(),
        ]);
        if (!active) return;
        setStats(statsData);
        setAttendants(attendantsList);
        setRequesters(requestersList);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Erro ao carregar dashboard"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(data: DemandFormData) {
    await createDemand(data);
    await loadStats();
  }

  if (loading) return <EmptyState message="Carregando dashboard..." />;

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <>
      <StatsCards
        stats={stats}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Demanda
          </Button>
        }
      />

      <DemandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        attendants={attendants}
        requesters={requesters}
      />
    </>
  );
}
