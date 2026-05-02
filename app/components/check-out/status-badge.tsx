import { colors } from "@/components/dashboard/theme";

export function StatusBadge({ status }: { status: "Pending" | "Paid" }) {
  const isPaid = status === "Paid";

  return (
    <span
      className="rounded-full px-2 py-[3px] text-[9px] font-medium"
      style={{
        background: isPaid ? colors.status.available.bg : colors.goldPale,
        color: isPaid ? colors.status.available.text : colors.status.occupied.text,
      }}
    >
      {status}
    </span>
  );
}
