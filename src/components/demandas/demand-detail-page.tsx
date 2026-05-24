"use client";

import { DemandModal } from "@/components/demandas/demand-modal";
import { DemandViewModal } from "@/components/demandas/demand-view-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/ui/pagination";
import { getAllAttendants } from "@/lib/services/attendants";
import { getDemandById, updateDemand } from "@/lib/services/demands";
import type { Attendant, Demand, DemandFormData } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DemandDetailPageProps {
  id: string;
}

export function DemandDetailPage({ id }: DemandDetailPageProps) {
  const router = useRouter();
  const [demand, setDemand] = useState<Demand | null>(null);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [demandData, attendantsList] = await Promise.all([
          getDemandById(id),
          getAllAttendants(),
        ]);
        if (!active) return;
        if (!demandData) {
          setError("Demanda não encontrada");
          return;
        }
        setDemand(demandData);
        setAttendants(attendantsList);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Erro ao carregar demanda"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  async function handleSave(data: DemandFormData) {
    if (!demand) return;
    try {
      const updated = await updateDemand(demand.id, data);
      setDemand(updated);
    } catch (err) {
      setAlertMessage(
        err instanceof Error ? err.message : "Erro ao salvar demanda"
      );
      throw err;
    }
  }

  function handleClose() {
    router.push("/demandas");
  }

  if (loading) return <EmptyState message="Carregando demanda..." />;

  if (error || !demand) {
    return (
      <div className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
        {error ?? "Demanda não encontrada"}
      </div>
    );
  }

  return (
    <>
      <DemandViewModal
        open
        onClose={handleClose}
        demand={demand}
        onEdit={() => setEditOpen(true)}
      />

      <DemandModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
        demand={demand}
        attendants={attendants}
      />

      <AlertDialog
        open={alertMessage !== null}
        onClose={() => setAlertMessage(null)}
        message={alertMessage ?? ""}
      />
    </>
  );
}
