"use client";

import { useEffect, type ReactNode } from "react";
import { colors } from "@/components/dashboard/theme";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(25, 20, 12, 0.42)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-[18px] p-4"
        style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-[18px]" style={{ color: colors.text }}>
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-[6px] text-[11px] font-medium"
            style={{
              background: colors.cream2,
              border: `0.5px solid ${colors.border2}`,
              color: colors.textSub,
            }}
          >
            Close
          </button>
        </div>

        <div>{children}</div>

        {footer ? <div className="mt-4 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
