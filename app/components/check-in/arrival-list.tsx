import { colors } from "@/components/dashboard/theme";

export interface ArrivalListItem {
  id: number;
  guestName: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  roomLabel: string;
  bookingId: string;
  time: string;
}

interface ArrivalListProps {
  title: string;
  meta: string;
  items: ArrivalListItem[];
  selectedId: number | null;
  onSelect: (item: ArrivalListItem) => void;
}

export function ArrivalList({ title, meta, items, selectedId, onSelect }: ArrivalListProps) {
  return (
    <section
      className="rounded-[14px] p-4"
      style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
          {title}
        </h2>
        <span className="text-[11px]" style={{ color: colors.textMuted }}>
          {meta}
        </span>
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-[12px] px-4 py-6 text-center text-[12px]"
          style={{ color: colors.textMuted }}
        >
          No arrivals expected today
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const active = selectedId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex items-center gap-3 rounded-[12px] px-2 py-[10px] text-left"
                style={{
                  background: active ? colors.cream : "transparent",
                  border: `0.5px solid ${active ? colors.border2 : "transparent"}`,
                }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-medium"
                  style={{ background: item.avatarBg, color: item.avatarColor }}
                >
                  {item.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                    {item.guestName}
                  </div>
                  <div className="text-[10px]" style={{ color: colors.textMuted }}>
                    {item.roomLabel} · {item.bookingId}
                  </div>
                </div>

                <div className="text-[11px] font-medium" style={{ color: colors.gold }}>
                  {item.time}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
