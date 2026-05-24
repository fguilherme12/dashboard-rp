"use client";

import { cn } from "@/lib/utils";
import {
  ClipboardList,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/atendentes", label: "Atendentes", icon: Users },
  { href: "/demandas", label: "Demandas", icon: ClipboardList },
];

function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="mb-8 px-3">
        <h2 className="text-lg font-bold text-foreground">Dashboard RP</h2>
        <p className="text-xs text-muted mt-1">CCO / Atendimento</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-green/15 text-accent-green"
                  : "text-muted hover:bg-card-border/30 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 rounded-lg border border-card-border bg-card p-2 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-card-border bg-sidebar p-4 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 rounded-lg p-1 text-muted hover:text-foreground lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarNav onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
