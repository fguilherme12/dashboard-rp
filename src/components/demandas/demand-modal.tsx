"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DEMAND_STATUSES,
  DEMAND_TYPES,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/constants";
import type { Attendant, Demand, DemandFormData, Requester } from "@/lib/types";
import { getCurrentDateISO, getCurrentTime } from "@/lib/utils";
import { useState } from "react";

interface DemandFormProps {
  demand?: Demand | null;
  attendants: Attendant[];
  requesters: Requester[];
  onSave: (data: DemandFormData) => Promise<void>;
  onClose: () => void;
}

function buildInitialForm(demand?: Demand | null): DemandFormData {
  if (demand) {
    return {
      date: demand.date,
      demand_time: demand.demand_time.slice(0, 5),
      type: demand.type,
      requester_id: demand.requester_id,
      attendant_id: demand.attendant_id,
      service_time: demand.service_time?.slice(0, 5) ?? null,
      status: demand.status,
      comment: demand.comment,
    };
  }

  return {
    date: getCurrentDateISO(),
    demand_time: getCurrentTime(),
    type: "tracking",
    requester_id: null,
    attendant_id: null,
    service_time: null,
    status: "pendente",
    comment: null,
  };
}

function DemandForm({
  demand,
  attendants,
  requesters,
  onSave,
  onClose,
}: DemandFormProps) {
  const [form, setForm] = useState<DemandFormData>(() => buildInitialForm(demand));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof DemandFormData>(
    key: K,
    value: DemandFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.requester_id) {
      setError("Solicitante é obrigatório");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Data
          </label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Hora Demanda
          </label>
          <Input
            type="time"
            value={form.demand_time}
            onChange={(e) => updateField("demand_time", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Tipo
          </label>
          <Select
            value={form.type}
            onChange={(e) =>
              updateField("type", e.target.value as DemandFormData["type"])
            }
          >
            {DEMAND_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Status
          </label>
          <Select
            value={form.status}
            onChange={(e) =>
              updateField("status", e.target.value as DemandFormData["status"])
            }
          >
            {DEMAND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Solicitante
          </label>
          <Select
            value={form.requester_id ?? ""}
            onChange={(e) =>
              updateField("requester_id", e.target.value || null)
            }
          >
            <option value="">Selecione o solicitante</option>
            {requesters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Atendente
          </label>
          <Select
            value={form.attendant_id ?? ""}
            onChange={(e) =>
              updateField("attendant_id", e.target.value || null)
            }
          >
            <option value="">Selecione o atendente</option>
            {attendants.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Hora Atendida (opcional)
          </label>
          <Input
            type="time"
            value={form.service_time ?? ""}
            onChange={(e) =>
              updateField("service_time", e.target.value || null)
            }
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted">
            Comentário (opcional)
          </label>
          <Textarea
            value={form.comment ?? ""}
            onChange={(e) => updateField("comment", e.target.value || null)}
            placeholder="Comentário..."
            rows={3}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : demand ? "Salvar" : "Registrar"}
        </Button>
      </div>
    </form>
  );
}

interface DemandModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: DemandFormData) => Promise<void>;
  demand?: Demand | null;
  attendants: Attendant[];
  requesters: Requester[];
}

export function DemandModal({
  open,
  onClose,
  onSave,
  demand,
  attendants,
  requesters,
}: DemandModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={demand ? "Editar Demanda" : "Nova Demanda"}
      className="max-w-2xl"
    >
      {open && (
        <DemandForm
          key={demand?.id ?? "new"}
          demand={demand}
          attendants={attendants}
          requesters={requesters}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
