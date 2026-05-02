import { receptionistProcedure, router } from "@/server/api";
import {
  getDashboardStats,
  getDashboardGuests,
  getWeeklyOccupancy,
} from "@/server/db/data-access/reservation";

// ─── Helpers ────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#EEEDFE", text: "#534AB7" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FAECE7", text: "#993C1D" },
  { bg: "#F5EDD8", text: "#7A5018" },
  { bg: "#FBEAF0", text: "#72243E" },
  { bg: "#E6F1FB", text: "#185FA5" },
  { bg: "#F1EFE8", text: "#5F5E5A" },
] as const;

function avatarColors(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Router ─────────────────────────────────────────────────────────────────

export const dashboardRouter = router({
  /** Dashboard KPI stats (occupancy, check-ins, revenue, rooms to clean). */
  stats: receptionistProcedure.query(async () => {
    return getDashboardStats();
  }),

  /** Today's guests for the dashboard list. */
  guests: receptionistProcedure.query(async () => {
    const rows = await getDashboardGuests();
    return rows.map((row) => {
      const name = `${row.firstName} ${row.lastName}`;
      const avatar = avatarColors(name);
      return {
        id: row.reservationId,
        name,
        initials: `${row.firstName[0]}${row.lastName[0]}`.toUpperCase(),
        avatarBg: avatar.bg,
        avatarColor: avatar.text,
        room: row.room,
        roomType: capitalize(row.roomType),
        bookingId: `#${row.reservationId}`,
        status: row.status,
        isLoyal: row.isLoyal,
      };
    });
  }),

  /** Weekly occupancy percentages for the bar chart. */
  weeklyOccupancy: receptionistProcedure.query(async () => {
    return getWeeklyOccupancy();
  }),
});
