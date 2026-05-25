"use client";

import { AttendantModal } from "@/components/atendentes/attendant-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ListControls } from "@/components/ui/list-controls";
import { EmptyState, PageHeader, Pagination } from "@/components/ui/pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import {
  createAttendant,
  deleteAttendant,
  getAttendants,
  updateAttendant,
} from "@/lib/services/attendants";
import type { Attendant } from "@/lib/types";
import { formatDateBR } from "@/lib/utils";
import { Pencil, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

export function AttendantList() {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Attendant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchAttendants() {
      setLoading(true);
      setError(null);
      try {
        const result = await getAttendants(page, pageSize, debouncedSearch);
        if (!active) return;
        setAttendants(result.data);
        setTotalPages(result.totalPages);
        setTotalCount(result.count);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Erro ao carregar atendentes"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAttendants();
    return () => {
      active = false;
    };
  }, [page, pageSize, debouncedSearch]);

  async function reload() {
    const result = await getAttendants(page, pageSize, debouncedSearch);
    setAttendants(result.data);
    setTotalPages(result.totalPages);
    setTotalCount(result.count);
  }

  async function handleSave(name: string) {
    if (editing) {
      await updateAttendant(editing.id, name);
    } else {
      await createAttendant(name);
    }
    await reload();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteAttendant(deleteId);
      await reload();
    } catch (err) {
      setAlertMessage(
        err instanceof Error ? err.message : "Erro ao excluir atendente"
      );
      throw err;
    }
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(attendant: Attendant) {
    setEditing(attendant);
    setModalOpen(true);
  }

  const emptyMessage = debouncedSearch
    ? `Nenhum atendente encontrado para "${debouncedSearch}".`
    : "Nenhum atendente cadastrado.";

  return (
    <>
      <PageHeader
        title="Atendentes"
        subtitle="Gerencie os atendentes do CCO"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo Atendente
          </Button>
        }
      />

      <ListControls
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Buscar atendente..."
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <EmptyState message="Carregando..." />
      ) : attendants.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-card-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Cadastrado em</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {attendants.map((attendant) => (
                  <tr
                    key={attendant.id}
                    className="border-b border-card-border/50 hover:bg-card-border/20"
                  >
                    <td className="px-4 py-3 font-medium">{attendant.name}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatDateBR(attendant.created_at.split("T")[0])}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(attendant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteId(attendant.id)}
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
            {attendants.map((attendant) => (
              <Card
                key={attendant.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-green/15">
                    <User className="h-5 w-5 text-accent-green" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{attendant.name}</p>
                    <p className="text-xs text-muted">
                      {formatDateBR(attendant.created_at.split("T")[0])}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(attendant)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteId(attendant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </>
      )}

      <AttendantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        attendant={editing}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        message="Deseja excluir este atendente? Esta ação não pode ser desfeita."
      />

      <AlertDialog
        open={alertMessage !== null}
        onClose={() => setAlertMessage(null)}
        message={alertMessage ?? ""}
      />
    </>
  );
}
