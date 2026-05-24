"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border border-card-border bg-card shadow-2xl",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
