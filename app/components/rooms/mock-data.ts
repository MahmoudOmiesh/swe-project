import type { RoomStatus } from "@/components/dashboard/theme";

// ─── Display helpers ─────────────────────────────────────────────────────────

export const roomTypeLabel: Record<string, string> = {
  single: "Single room",
  double: "Double room",
  suite:  "Suite",
};

// ─── Derived helpers ─────────────────────────────────────────────────────────

/** Group rooms by floor number */
export function groupByFloor<T extends { floor: number }>(
  rooms: T[],
): Map<number, T[]> {
  return rooms.reduce((acc, room) => {
    const list = acc.get(room.floor) ?? [];
    list.push(room);
    acc.set(room.floor, list);
    return acc;
  }, new Map<number, T[]>());
}

/** Count rooms by status */
export function countByStatus<T extends { status: string }>(
  rooms: T[],
): Record<RoomStatus, number> {
  return rooms.reduce(
    (acc, r) => ({
      ...acc,
      [r.status]: ((acc as Record<string, number>)[r.status] ?? 0) + 1,
    }),
    { occupied: 0, available: 0, cleaning: 0, maintenance: 0 } as Record<
      RoomStatus,
      number
    >,
  );
}
