import { cn } from "@/lib/utils";
import { colors } from "@/components/dashboard/theme";
import { RoomStatusBadge } from "./status-badge";
import { roomTypeLabel, roomTypeRate, type RoomRecord } from "./mock-data";

interface RoomCardProps {
  room:      RoomRecord;
  isSelected: boolean;
  onClick:   (room: RoomRecord) => void;
}

export function RoomCard({ room, isSelected, onClick }: RoomCardProps) {
  const subText = (() => {
    if (room.status === "occupied" && room.guest)
      return `${room.guest.name.split(" ")[0]} ${room.guest.name.split(" ").at(-1)} · out ${room.guest.checkOut.split(" ").slice(0, 2).join(" ")}`;
    if (room.status === "cleaning")
      return "Assigned to housekeeping";
    if (room.status === "maintenance" && room.maintenanceNote)
      return room.maintenanceNote;
    return "Ready for check-in";
  })();

  return (
    <button
      onClick={() => onClick(room)}
      className={cn(
        "w-full rounded-[10px] p-[11px] text-left transition-all",
        isSelected
          ? "ring-[1.5px] ring-[#B8965A]"
          : "hover:border-[#B8965A]",
      )}
      style={{
        background: colors.cream2,
        border: `0.5px solid ${isSelected ? colors.gold : colors.border2}`,
      }}
    >
      {/* Header */}
      <div className="mb-[6px] flex items-center justify-between">
        <span
          className="font-display text-[16px] leading-none"
          style={{ color: colors.text }}
        >
          {room.number}
        </span>
        <RoomStatusBadge status={room.status} />
      </div>

      {/* Type */}
      <div className="text-[10px]" style={{ color: colors.textMuted }}>
        {roomTypeLabel[room.type]}
      </div>

      {/* Rate */}
      <div
        className="mt-[3px] text-[11px] font-medium"
        style={{ color: colors.textSub }}
      >
        EGP {roomTypeRate[room.type].toLocaleString()} / night
      </div>

      {/* Guest or status note */}
      <div
        className="mt-[2px] overflow-hidden text-ellipsis whitespace-nowrap text-[9px]"
        style={{ color: colors.textMuted }}
      >
        {subText}
      </div>
    </button>
  );
}
