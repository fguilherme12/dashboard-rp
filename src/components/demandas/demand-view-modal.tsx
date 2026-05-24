"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import type { Demand } from "@/lib/types";
import {
  calculateDurationMinutes,
  formatDateBR,
  formatDateTimeBR,
  formatDuration,
  formatTime,
} from "@/lib/utils";
import { Pencil } from "lucide-react";

interface DemandViewModalProps {
  open: boolean;
  onClose: () => void;
  demand: Demand;
  onEdit?: () => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b border-card-border/50 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

export function DemandViewModal({
  open,
  onClose,
  demand,
  onEdit,
}: DemandViewModalProps) {
  const duration = calculateDurationMinutes(
    demand.demand_time,
    demand.service_time,
    demand.completion_time
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalhes da Demanda"
      className="max-w-2xl"
    >
      <DetailRow label="Data" value={formatDateBR(demand.date)} />
      <DetailRow label="Hora Demanda" value={formatTime(demand.demand_time)} />
      <DetailRow
        label="Tipo"
        value={
          <Badge className="border-accent-blue/50 bg-accent-blue/10 text-accent-blue">
            {demand.type}
          </Badge>
        }
      />
      <DetailRow label="Solicitante" value={demand.requester} />
      <DetailRow
        label="Atendente"
        value={demand.attendant?.name ?? "—"}
      />
      <DetailRow
        label="Hora Atendida"
        value={formatTime(demand.service_time)}
      />
      <DetailRow
        label="Finalização"
        value={formatDateTimeBR(demand.completion_time)}
      />
      <DetailRow label="Duração" value={formatDuration(duration)} />
      <DetailRow
        label="Status"
        value={
          <Badge className={STATUS_COLORS[demand.status]}>
            {STATUS_LABELS[demand.status]}
          </Badge>
        }
      />
      <DetailRow
        label="Comentário"
        value={
          demand.comment ? (
            <span className="whitespace-pre-wrap">{demand.comment}</span>
          ) : (
            "—"
          )
        }
      />

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        {onEdit && (
          <Button onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>
    </Modal>
  );
}
