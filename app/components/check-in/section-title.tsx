import type { ReactNode } from "react";
import { colors } from "@/components/dashboard/theme";

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div
      className="mb-3 border-b pb-2 text-[10px] font-medium uppercase tracking-[0.12em]"
      style={{ color: colors.textMuted, borderColor: colors.border2 }}
    >
      {children}
    </div>
  );
}

