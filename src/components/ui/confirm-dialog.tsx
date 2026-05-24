"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmar exclusão",
  message,
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  loading: externalLoading,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading ?? internalLoading;

  async function handleConfirm() {
    setInternalLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setInternalLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-400/15">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <p className="text-sm text-muted leading-relaxed pt-2">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={loading}>
          {loading ? "Excluindo..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
