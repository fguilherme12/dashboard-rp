"use client";

import { DemandModal } from "@/components/demandas/demand-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader, Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { getAllAttendants } from "@/lib/services/attendants";
import {
  createDemand,
  deleteDemand,
  getDemands,
  updateDemand,
} from "@/lib/services/demands";
import type { Attendant, Demand, DemandFormData } from "@/lib/types";
import {
  calculateDurationMinutes,
  formatDateBR,
  formatDateTimeBR,
  formatDuration,
  formatTime,
} from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function DemandList() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Demand | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchDemands() {
      setLoading(true);
      setError(null);
      try {
        const [demandsResult, attendantsList] = await Promise.all([
          getDemands(page),
          getAllAttendants(),
        ]);
        if (!active) return;
        setDemands(demandsResult.data);
        setTotalPages(demandsResult.totalPages);
        setAttendants(attendantsList);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Erro ao carregar demandas"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDemands();
    return () => {
      active = false;
    };
  }, [page]);

  async function reload() {
    const [demandsResult, attendantsList] = await Promise.all([
      getDemands(page),
      getAllAttendants(),
    ]);
    setDemands(demandsResult.data);
    setTotalPages(demandsResult.totalPages);
    setAttendants(attendantsList);
  }

  async function handleSave(data: DemandFormData) {
    if (editing) {
      await updateDemand(editing.id, data);
    } else {
      await createDemand(data);
    }
    await reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir esta demanda?")) return;
    try {
      await deleteDemand(id);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  async function handleInlineUpdate(
    id: string,
    field: Partial<DemandFormData>
  ) {
    try {
      await updateDemand(id, field);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  }

  async function handleCommentBlur(id: string, comment: string) {
    await handleInlineUpdate(id, { comment: comment || null });
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(demand: Demand) {
    setEditing(demand);
    setModalOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Demandas"
        subtitle="Gerencie as demandas de atendimento"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Nova Demanda
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <EmptyState message="Carregando..." />
      ) : demands.length === 0 ? (
        <EmptyState message="Nenhuma demanda registrada." />
      ) : (
        <>
          <div className="hidden xl:block space-y-2">
            <div className="grid grid-cols-[repeat(11,minmax(0,1fr))] gap-2 px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted">
              <span>Data</span>
              <span>Hora</span>
              <span>H. Atendida</span>
              <span>Tipo</span>
              <span>Solicitante</span>
              <span>Atendente</span>
              <span>Finalização</span>
              <span>Duração</span>
              <span>Status</span>
              <span>Ações</span>
              <span>Comentário</span>
            </div>

            {demands.map((demand) => {
              const duration = calculateDurationMinutes(
                demand.demand_time,
                demand.service_time,
                demand.completion_time
              );
              return (
                <Card
                  key={demand.id}
                  className="grid grid-cols-[repeat(11,minmax(0,1fr))] gap-2 items-center p-3 text-sm"
                >
                  <span>{formatDateBR(demand.date)}</span>
                  <span>{formatTime(demand.demand_time)}</span>
                  <span>{formatTime(demand.service_time)}</span>
                  <Badge className="border-accent-blue/50 bg-accent-blue/10 text-accent-blue w-fit">
                    {demand.type}
                  </Badge>
                  <span className="truncate">{demand.requester}</span>
                  <Select
                    value={demand.attendant_id ?? ""}
                    onChange={(e) =>
                      handleInlineUpdate(demand.id, {
                        attendant_id: e.target.value || null,
                      })
                    }
                    className="py-1 text-xs"
                  >
                    <option value="">—</option>
                    {attendants.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                  <span className="text-xs text-muted">
                    {formatDateTimeBR(demand.completion_time)}
                  </span>
                  <span>{formatDuration(duration)}</span>
                  <Select
                    value={demand.status}
                    onChange={(e) =>
                      handleInlineUpdate(demand.id, {
                        status: e.target.value as DemandFormData["status"],
                        service_time: demand.service_time,
                      })
                    }
                    className={`py-1 text-xs ${STATUS_COLORS[demand.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(demand)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(demand.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    defaultValue={demand.comment ?? ""}
                    placeholder="Clique para adicionar comentário..."
                    rows={1}
                    className="text-xs py-1 min-h-8"
                    onBlur={(e) => handleCommentBlur(demand.id, e.target.value)}
                  />
                </Card>
              );
            })}
          </div>

          <div className="xl:hidden space-y-3">
            {demands.map((demand) => {
              const duration = calculateDurationMinutes(
                demand.demand_time,
                demand.service_time,
                demand.completion_time
              );
              return (
                <Card key={demand.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{demand.requester}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {formatDateBR(demand.date)} · {formatTime(demand.demand_time)}
                      </p>
                    </div>
                    <Badge className="border-accent-blue/50 bg-accent-blue/10 text-accent-blue shrink-0">
                      {demand.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Field label="Atendente">
                      <Select
                        value={demand.attendant_id ?? ""}
                        onChange={(e) =>
                          handleInlineUpdate(demand.id, {
                            attendant_id: e.target.value || null,
                          })
                        }
                        className="py-1 text-xs"
                      >
                        <option value="">—</option>
                        {attendants.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Hora Atendida">
                      <span>{formatTime(demand.service_time)}</span>
                    </Field>
                    <Field label="Duração">
                      <span>{formatDuration(duration)}</span>
                    </Field>
                    <Field label="Status">
                      <Select
                        value={demand.status}
                        onChange={(e) =>
                          handleInlineUpdate(demand.id, {
                            status: e.target.value as DemandFormData["status"],
                            service_time: demand.service_time,
                          })
                        }
                        className={`py-1 text-xs ${STATUS_COLORS[demand.status]}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>

                  <Textarea
                    defaultValue={demand.comment ?? ""}
                    placeholder="Comentário..."
                    rows={2}
                    className="text-xs"
                    onBlur={(e) => handleCommentBlur(demand.id, e.target.value)}
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(demand)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(demand.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <DemandModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        demand={editing}
        attendants={attendants}
      />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted mb-1">{label}</p>
      {children}
    </div>
  );
}
