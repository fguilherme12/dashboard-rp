"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { Requester } from "@/lib/types";
import { useState } from "react";

interface RequesterFormProps {
  requester?: Requester | null;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

function RequesterForm({ requester, onSave, onClose }: RequesterFormProps) {
  const [name, setName] = useState(requester?.name ?? "");
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
          placeholder="Nome do solicitante"
          autoFocus
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : requester ? "Salvar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}

interface RequesterModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  requester?: Requester | null;
}

export function RequesterModal({
  open,
  onClose,
  onSave,
  requester,
}: RequesterModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={requester ? "Editar Solicitante" : "Novo Solicitante"}
    >
      {open && (
        <RequesterForm
          key={requester?.id ?? "new"}
          requester={requester}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
