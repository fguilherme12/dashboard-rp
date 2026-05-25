import { STATUS_LABELS, TYPE_LABELS } from "@/lib/constants";
import type { Demand } from "@/lib/types";
import {
  calculateDurationMinutes,
  formatDateBR,
  formatDateTimeBR,
  formatDuration,
  formatTime,
} from "@/lib/utils";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function demandToRow(demand: Demand): string[] {
  const duration = calculateDurationMinutes(
    demand.date,
    demand.demand_time,
    demand.service_time,
    demand.completion_time
  );

  return [
    formatDateBR(demand.date),
    formatTime(demand.demand_time),
    TYPE_LABELS[demand.type],
    demand.requester?.name ?? "",
    demand.attendant?.name ?? "",
    formatTime(demand.service_time) === "—" ? "" : formatTime(demand.service_time),
    formatDateTimeBR(demand.completion_time) === "—"
      ? ""
      : formatDateTimeBR(demand.completion_time),
    formatDuration(duration) === "—" ? "" : formatDuration(duration),
    STATUS_LABELS[demand.status],
    demand.comment ?? "",
  ];
}

export function buildDemandsCsv(demands: Demand[]): string {
  const headers = [
    "Data",
    "Hora Demanda",
    "Tipo",
    "Solicitante",
    "Atendente",
    "Hora Atendida",
    "Finalização",
    "Duração",
    "Status",
    "Comentário",
  ];

  const rows = demands.map((d) =>
    demandToRow(d).map(escapeCsvCell).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadDemandsCsv(demands: Demand[]): void {
  const csv = buildDemandsCsv(demands);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().split("T")[0];
  const link = document.createElement("a");
  link.href = url;
  link.download = `demandas-${date}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
