import { colors } from "@/components/dashboard/theme";

interface PaymentButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function PaymentButton({ label, active, onClick }: PaymentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-[12px] px-3 py-[10px] text-[11px] font-medium"
      style={{
        background: active ? colors.goldPale : colors.cream,
        border: `0.5px solid ${active ? colors.goldLight : colors.border2}`,
        color: colors.textSub,
      }}
    >
      {label}
    </button>
  );
}

