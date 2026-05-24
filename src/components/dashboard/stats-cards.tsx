"use client";

import { Card } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";
import { formatDuration, getTodayBR } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  Timer,
  TrendingUp,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
  action?: React.ReactNode;
}

export function StatsCards({ stats, action }: StatsCardsProps) {
  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: TrendingUp,
      color: "text-foreground",
      iconColor: "text-muted",
    },
    {
      label: "Pendentes",
      value: stats.pendentes,
      icon: Circle,
      color: "text-accent-yellow",
      iconColor: "text-accent-yellow",
    },
    {
      label: "Em Atend.",
      value: stats.emAtendimento,
      icon: Timer,
      color: "text-accent-blue",
      iconColor: "text-accent-blue",
    },
    {
      label: "Finalizadas",
      value: stats.finalizadas,
      icon: CheckCircle2,
      color: "text-accent-green",
      iconColor: "text-accent-green",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <ClipboardList className="h-7 w-7 text-accent-green mt-0.5 shrink-0" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Demandas CCO / Atendimento
            </h1>
            <p className="text-sm text-muted capitalize mt-0.5">{getTodayBR()}</p>
          </div>
        </div>
        {action}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, iconColor }) => (
          <Card key={label} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                {label}
              </span>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <span className={`text-3xl font-bold ${color}`}>{value}</span>
          </Card>
        ))}
      </div>

      <Card className="mt-4 max-w-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-muted">
            Média Tempo
          </span>
          <Clock className="h-4 w-4 text-accent-green" />
        </div>
        <span className="mt-3 block text-3xl font-bold text-accent-green">
          {stats.mediaTempoMinutos !== null
            ? formatDuration(stats.mediaTempoMinutos)
            : "—"}
        </span>
      </Card>
    </div>
  );
}
