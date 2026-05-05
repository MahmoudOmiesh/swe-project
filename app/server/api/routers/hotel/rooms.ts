import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "@/server/api";
import {
  listRooms,
  getRoomById,
  getRoomByNumber,
  createRoom,
  updateRoomServiceMode,
} from "@/server/db/data-access/rooms";

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function initials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Status computation ──────────────────────────────────────────────────────

type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";

/** Derive the display status from the room's serviceMode + active reservation. */
function computeStatus(
  serviceMode: "cleaning" | "maintenance" | null,
  hasActiveReservation: boolean,
): RoomStatus {
  if (serviceMode === "maintenance") return "maintenance";
  if (serviceMode === "cleaning") return "cleaning";
  if (hasActiveReservation) return "occupied";
  return "available";
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

/** Map a DAL room row into the minimal shape needed by the room grid. */
function mapRoomMinimal(row: Awaited<ReturnType<typeof listRooms>>[number]) {
  const hasActiveReservation = row.reservations.length > 0;
  const status = computeStatus(row.serviceMode, hasActiveReservation);

  return {
    id: row.id,
    number: row.number,
    floor: row.floor,
    type: row.type,
    status,
    capacity: row.capacity,
    ratePerNight: row.ratePerNight,
    guestName: hasActiveReservation
      ? `${row.reservations[0].guest.firstName} ${row.reservations[0].guest.lastName}`
      : undefined,
    checkOut: hasActiveReservation
      ? fmtDate(row.reservations[0].checkOutAt)
      : undefined,
    maintenanceNote:
      status === "maintenance"
        ? (row.maintenanceNote ?? undefined)
        : undefined,
  };
}

/** Map a full DAL room row into the detailed shape for the detail panel. */
function mapRoomDetail(row: Awaited<ReturnType<typeof getRoomById>>) {
  if (!row) return null;

  const hasActiveReservation = row.reservations.length > 0;
  const status = computeStatus(row.serviceMode, hasActiveReservation);

  const guest = hasActiveReservation
    ? (() => {
        const r = row.reservations[0];
        const name = `${r.guest.firstName} ${r.guest.lastName}`;
        const avatar = avatarColors(name);
        return {
          name,
          initials: initials(r.guest.firstName, r.guest.lastName),
          avatarBg: avatar.bg,
          avatarColor: avatar.text,
          bookingId: `#${String(r.id)}`,
          checkIn: fmtDate(r.checkInAt),
          checkOut: fmtDate(r.checkOutAt),
          services: r.services.map((rs) => rs.service.name),
          isLoyal: r.guest.isLoyal,
        };
      })()
    : undefined;

  return {
    id: row.id,
    number: row.number,
    floor: row.floor,
    type: row.type,
    status,
    capacity: row.capacity,
    ratePerNight: row.ratePerNight,
    guest,
    maintenanceNote:
      status === "maintenance"
        ? (row.maintenanceNote ?? undefined)
        : undefined,
  };
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const roomsRouter = router({
  /** List all rooms with minimal data for the grid view. */
  list: protectedProcedure.query(async () => {
    const rows = await listRooms();
    return rows.map(mapRoomMinimal);
  }),

  /** Get a single room by ID with full details. */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const row = await getRoomById(input.id);
      return mapRoomDetail(row);
    }),

  /** Create a new room. */
  create: protectedProcedure
    .input(
      z.object({
        number: z.string().min(1, "Room number is required").max(16),
        type: z.enum(["single", "double", "suite"]),
        floor: z.number().int().min(1, "Floor must be at least 1"),
        capacity: z.number().int().min(1, "Capacity must be at least 1"),
        ratePerNight: z.number().int().min(0, "Rate must be at least 0"),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getRoomByNumber(input.number);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Room ${input.number} already exists`,
        });
      }
      try {
        const room = await createRoom(input);
        return { id: room.id };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Failed to create room",
        });
      }
    }),

  /** Update a room's service mode (cleaning/maintenance) or clear it. */
  updateServiceMode: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        serviceMode: z.enum(["cleaning", "maintenance"]).nullable(),
        maintenanceNote: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updated = await updateRoomServiceMode(
          input.id,
          input.serviceMode,
          input.maintenanceNote,
        );
        return { id: updated.id };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Failed to update room",
        });
      }
    }),
});
