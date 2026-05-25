"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DEMAND_STATUSES,
  DEMAND_TYPES,
  PAGE_SIZE_OPTIONS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/constants";
import type { DemandStatus } from "@/lib/constants";
import type { Attendant, DemandFilters, Requester } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

const EMPTY_FILTERS: DemandFilters = {
  status: "",
  attendantId: "",
  requesterId: "",
  type: "",
  search: "",
};

export function getEmptyDemandFilters(): DemandFilters {
  return { ...EMPTY_FILTERS };
}

export function hasActiveDemandFilters(filters: DemandFilters): boolean {
  return Boolean(
    filters.status ||
      filters.attendantId ||
      filters.requesterId ||
      filters.type ||
      filters.search?.trim()
  );
}

interface DemandFiltersBarProps {
  filters: DemandFilters;
  onFiltersChange: (filters: DemandFilters) => void;
  attendants: Attendant[];
  requesters: Requester[];
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const QUICK_STATUS: { value: DemandStatus | ""; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "em_atendimento", label: "Em atendimento" },
  { value: "concluido", label: "Concluídas" },
  { value: "cancelada", label: "Canceladas" },
];

export function DemandFiltersBar({
  filters,
  onFiltersChange,
  attendants,
  requesters,
  pageSize,
  onPageSizeChange,
}: DemandFiltersBarProps) {
  function update<K extends keyof DemandFilters>(
    key: K,
    value: DemandFilters[K]
  ) {
    onFiltersChange({ ...filters, [key]: value });
  }

  function clearFilters() {
    onFiltersChange(getEmptyDemandFilters());
  }

  const active = hasActiveDemandFilters(filters);

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={filters.search ?? ""}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Buscar solicitante, atendente ou comentário..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted whitespace-nowrap">
            Por página
          </span>
          <Select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="w-20 py-1.5"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
          {active && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {QUICK_STATUS.map(({ value, label }) => (
          <button
            key={value || "all"}
            type="button"
            onClick={() => update("status", value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filters.status === value
                ? "border-accent-green/50 bg-accent-green/15 text-accent-green"
                : "border-card-border bg-card text-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterField label="Status">
          <Select
            value={filters.status ?? ""}
            onChange={(e) =>
              update("status", e.target.value as DemandFilters["status"])
            }
            className="py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {DEMAND_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label="Tipo">
          <Select
            value={filters.type ?? ""}
            onChange={(e) =>
              update("type", e.target.value as DemandFilters["type"])
            }
            className="py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {DEMAND_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label="Solicitante">
          <Select
            value={filters.requesterId ?? ""}
            onChange={(e) => update("requesterId", e.target.value)}
            className="py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {requesters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label="Atendente">
          <Select
            value={filters.attendantId ?? ""}
            onChange={(e) => update("attendantId", e.target.value)}
            className="py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {attendants.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </FilterField>
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
