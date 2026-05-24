"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Attendant } from "@/lib/types";
import { useState } from "react";

interface AttendantFormProps {
  attendant?: Attendant | null;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

function AttendantForm({ attendant, onSave, onClose }: AttendantFormProps) {
  const [name, setName] = useState(attendant?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
          Nome
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do atendente"
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : attendant ? "Salvar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}

interface AttendantModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  attendant?: Attendant | null;
}

export function AttendantModal({
  open,
  onClose,
  onSave,
  attendant,
}: AttendantModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={attendant ? "Editar Atendente" : "Novo Atendente"}
    >
      {open && (
        <AttendantForm
          key={attendant?.id ?? "new"}
          attendant={attendant}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
