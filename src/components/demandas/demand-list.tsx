"use client";

import { DemandModal } from "@/components/demandas/demand-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState, PageHeader, Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from "@/lib/constants";
import { getAllAttendants } from "@/lib/services/attendants";
import {
  createDemand,
  deleteDemand,
  getDemands,
  updateDemand,
} from "@/lib/services/demands";
import { getAllRequesters } from "@/lib/services/requesters";
import type { Attendant, Demand, DemandFormData, Requester } from "@/lib/types";
import { formatDateBR, formatDateTimeBR, formatTime } from "@/lib/utils";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function DemandList() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [requesters, setRequesters] = useState<Requester[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Demand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchDemands() {
      setLoading(true);
      setError(null);
      try {
        const [demandsResult, attendantsList, requestersList] = await Promise.all([
          getDemands(page),
          getAllAttendants(),
          getAllRequesters(),
        ]);
        if (!active) return;
        setDemands(demandsResult.data);
        setTotalPages(demandsResult.totalPages);
        setAttendants(attendantsList);
        setRequesters(requestersList);
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
    const [demandsResult, attendantsList, requestersList] = await Promise.all([
      getDemands(page),
      getAllAttendants(),
      getAllRequesters(),
    ]);
    setDemands(demandsResult.data);
    setTotalPages(demandsResult.totalPages);
    setAttendants(attendantsList);
    setRequesters(requestersList);
  }

  async function handleSave(data: DemandFormData) {
    if (editing) {
      await updateDemand(editing.id, data);
    } else {
      await createDemand(data);
    }
    await reload();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteDemand(deleteId);
      await reload();
    } catch (err) {
      setAlertMessage(
        err instanceof Error ? err.message : "Erro ao excluir demanda"
      );
      throw err;
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
      setAlertMessage(
        err instanceof Error ? err.message : "Erro ao atualizar demanda"
      );
    }
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
          <div className="hidden md:block overflow-x-auto rounded-xl border border-card-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Solicitante</th>
                  <th className="px-4 py-3">Atendente</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Finalização</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {demands.map((demand) => (
                  <tr
                    key={demand.id}
                    className="border-b border-card-border/50 hover:bg-card-border/20"
                  >
                    <td className="px-4 py-3">{formatDateBR(demand.date)}</td>
                    <td className="px-4 py-3">{formatTime(demand.demand_time)}</td>
                    <td className="px-4 py-3">
                      <Badge className="border-accent-blue/50 bg-accent-blue/10 text-accent-blue">
                        {TYPE_LABELS[demand.type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {demand.requester?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
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
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <Select
                        value={demand.status}
                        onChange={(e) =>
                          handleInlineUpdate(demand.id, {
                            status: e.target.value as DemandFormData["status"],
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
                    </td>
                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                      {formatDateTimeBR(demand.completion_time)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/demandas/${demand.id}`}>
                          <Button variant="ghost" size="sm" aria-label="Ver">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(demand)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteId(demand.id)}
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {demands.map((demand) => (
              <Card key={demand.id} className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{demand.requester?.name ?? "—"}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {formatDateBR(demand.date)} · {formatTime(demand.demand_time)}
                    </p>
                  </div>
                  <Badge className="border-accent-blue/50 bg-accent-blue/10 text-accent-blue shrink-0">
                    {TYPE_LABELS[demand.type]}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm">
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
                  <Field label="Status">
                    <Select
                      value={demand.status}
                      onChange={(e) =>
                        handleInlineUpdate(demand.id, {
                          status: e.target.value as DemandFormData["status"],
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
                  <Field label="Finalização">
                    <span className="text-xs text-muted">
                      {formatDateTimeBR(demand.completion_time)}
                    </span>
                  </Field>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Link href={`/demandas/${demand.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(demand)}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteId(demand.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
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
        requesters={requesters}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        message="Deseja excluir esta demanda? Esta ação não pode ser desfeita."
      />

      <AlertDialog
        open={alertMessage !== null}
        onClose={() => setAlertMessage(null)}
        message={alertMessage ?? ""}
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
