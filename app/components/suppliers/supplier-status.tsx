import { colors } from "@/components/dashboard/theme";

type SupplierDisplayStatus = "Active" | "Order pending";

export function SupplierStatus({ status }: { status: SupplierDisplayStatus }) {
  const palette =
    status === "Active"
      ? { bg: colors.status.available.bg, text: colors.status.available.text }
      : { bg: colors.goldPale, text: colors.status.occupied.text };

  return (
    <span
      className="rounded-full px-2 py-[4px] text-[9px] font-medium"
      style={{ background: palette.bg, color: palette.text }}
    >
      {status}
    </span>
  );
}
