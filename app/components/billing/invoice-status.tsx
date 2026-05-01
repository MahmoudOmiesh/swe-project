import { colors } from "@/components/dashboard/theme";
import type { InvoiceRecord } from "./mock-data";

export function InvoiceStatus({ status }: { status: InvoiceRecord["status"] }) {
  const isPending = status === "Pending";

  return (
    <span
      className="rounded-full px-3 py-[4px] text-[9px] font-medium"
      style={{
        background: isPending ? colors.goldPale : colors.status.available.bg,
        color: isPending ? colors.status.occupied.text : colors.status.available.text,
      }}
    >
      {status}
    </span>
  );
}

