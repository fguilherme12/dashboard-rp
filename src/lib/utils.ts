import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateBR(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("pt-BR");
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "—";
  return time.slice(0, 5);
}

export function formatDateTimeBR(datetime: string | null | undefined): string {
  if (!datetime) return "—";
  const d = new Date(datetime);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseLocalDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time.slice(0, 5)}:00`);
}

function toLocalDateString(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Minutos entre abertura da demanda e finalização (inclui dias entre as datas). */
export function calculateDurationMinutes(
  demandDate: string,
  demandTime: string,
  serviceTime: string | null,
  completionTime: string | null
): number | null {
  if (!completionTime) return null;

  const end = new Date(completionTime);
  let start = parseLocalDateTime(demandDate, demandTime);

  const sameDay = demandDate === toLocalDateString(end);
  if (serviceTime && sameDay) {
    const serviceStart = parseLocalDateTime(demandDate, serviceTime);
    if (
      serviceStart.getTime() >= start.getTime() &&
      serviceStart.getTime() <= end.getTime()
    ) {
      start = serviceStart;
    }
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return null;

  return Math.round(diffMs / 60_000);
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes}min`;

  const days = Math.floor(minutes / (24 * 60));
  const remainder = minutes % (24 * 60);
  const h = Math.floor(remainder / 60);
  const m = remainder % 60;

  if (days > 0) {
    const dayPart = days === 1 ? "1 dia" : `${days} dias`;
    if (h === 0 && m === 0) return dayPart;
    if (m > 0) return `${dayPart} ${h}h ${m}min`;
    return h > 0 ? `${dayPart} ${h}h` : dayPart;
  }

  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function getTodayBR(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getCurrentTime(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

export function getCurrentDateISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function parseCompletionFromIso(
  completionTime: string | null,
  fallbackDate: string
): { completion_date: string; completion_time_only: string | null } {
  if (!completionTime) {
    return { completion_date: fallbackDate, completion_time_only: null };
  }

  const d = new Date(completionTime);
  const pad = (n: number) => String(n).padStart(2, "0");

  return {
    completion_date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    completion_time_only: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function buildCompletionIso(
  date: string,
  time: string
): string {
  return new Date(`${date}T${time}:00`).toISOString();
}
