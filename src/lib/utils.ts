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

export function calculateDurationMinutes(
  demandTime: string,
  serviceTime: string | null,
  completionTime: string | null
): number | null {
  if (!completionTime) return null;

  const baseTime = serviceTime ?? demandTime;
  const [bh, bm] = baseTime.split(":").map(Number);
  const completion = new Date(completionTime);
  const ch = completion.getHours();
  const cm = completion.getMinutes();

  let diff = ch * 60 + cm - (bh * 60 + bm);
  if (diff < 0) diff += 24 * 60;

  return diff;
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
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
