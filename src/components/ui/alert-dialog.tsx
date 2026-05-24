"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AlertCircle } from "lucide-react";

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function AlertDialog({
  open,
  onClose,
  title = "Ops, algo deu errado",
  message,
}: AlertDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-400/15">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <p className="text-sm text-muted leading-relaxed pt-2">{message}</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Entendi</Button>
      </div>
    </Modal>
  );
}
