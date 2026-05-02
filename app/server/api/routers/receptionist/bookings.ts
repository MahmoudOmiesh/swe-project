import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { receptionistProcedure, router } from "@/server/api";
import {
  listBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  checkOutBooking,
  getAvailableRooms,
  getBookingStats,
  addActivity,
} from "@/server/db/data-access/reservation";


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

function nightsBetween(a: Date, b: Date) {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Transform a DAL reservation row into the flat Booking object the UI expects. */
function mapBooking(row: Awaited<ReturnType<typeof listBookings>>[number]) {
  const name = `${row.guest.firstName} ${row.guest.lastName}`;
  const avatar = avatarColors(name);
  const nights = nightsBetween(row.checkInAt, row.checkOutAt);

  return {
    id: `#${String(row.id)}`,
    guest: {
      name,
      initials: initials(row.guest.firstName, row.guest.lastName),
      avatarBg: avatar.bg,
      avatarColor: avatar.text,
      nationality: row.guest.nationality,
      nationalId: row.guest.nationalityId,
      phone: row.guest.phone ?? "",
      numGuests: row.numberOfGuests,
      isLoyal: row.guest.isLoyal,
    },
    room: row.room.number,
    roomType: capitalize(row.room.type),
    ratePerNight: row.room.ratePerNight,
    checkIn: fmtDate(row.checkInAt),
    checkOut: fmtDate(row.checkOutAt),
    nights,
    status: row.status,
    activities: row.activities.map((a) => ({
      activity: a.activity,
      price: a.price,
    })),
  };
}

const bookingStatusSchema = z.enum([
  "new",
  "checked-in",
  "cancelled",
  "checked-out",
]);

export const bookingsRouter = router({
  /** List bookings, optionally filtered by status and/or search text. */
  list: receptionistProcedure
    .input(
      z
        .object({
          status: bookingStatusSchema.optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const rows = await listBookings(input ?? undefined);
      return rows.map(mapBooking);
    }),

  /** Get a single booking by its numeric reservation ID. */
  getById: receptionistProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const row = await getBookingById(input.id);
      if (!row) return null;
      return mapBooking(row);
    }),

  /** Aggregate stats by status. */
  stats: receptionistProcedure.query(async () => {
    return getBookingStats();
  }),

  /** Rooms available for a given date range. */
  availableRooms: receptionistProcedure
    .input(
      z.object({
        checkIn: z.coerce.date(),
        checkOut: z.coerce.date(),
      }),
    )
    .query(async ({ input }) => {
      const roomsList = await getAvailableRooms(input.checkIn, input.checkOut);
      return roomsList.map((r) => ({
        id: r.id,
        number: r.number,
        type: capitalize(r.type),
        ratePerNight: r.ratePerNight,
        label: `${r.number} · ${capitalize(r.type)} · EGP ${String(r.ratePerNight)}/night`,
      }));
    }),

  /** Create a new booking (guest + reservation). */
  create: receptionistProcedure
    .input(
      z.object({
        guest: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          nationality: z.string().min(1),
          nationalityId: z.string().min(1),
          phone: z.string().optional(),
        }),
        roomId: z.number(),
        numberOfGuests: z.number().min(1),
        checkIn: z.coerce.date(),
        checkOut: z.coerce.date(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const reservation = await createBooking(input);
        return { id: reservation.id };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Failed to create booking",
        });
      }
    }),

  /** Check out a reservation: generates the bill and sets status to checked-out. */
  checkOut: receptionistProcedure
    .input(
      z.object({
        id: z.number(),
        paymentMethod: z.enum(["cash", "card", "bank_transfer", "other"]),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const bill = await checkOutBooking(input.id, input.paymentMethod);
        return { billId: bill.id, totalAmount: bill.totalAmount };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Failed to check out",
        });
      }
    }),

  /** Update booking status (check-in, cancel). */
  updateStatus: receptionistProcedure
    .input(
      z.object({
        id: z.number(),
        status: bookingStatusSchema,
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const updated = await updateBookingStatus(input.id, input.status);
        return { id: updated.id, status: updated.status };
      } catch (err) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            err instanceof Error ? err.message : "Failed to update booking",
        });
      }
    }),

  /** Add a service / extra activity to a reservation. */
  addActivity: receptionistProcedure
    .input(
      z.object({
        reservationId: z.number(),
        activity: z.string().min(1),
        price: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const row = await addActivity(
        input.reservationId,
        input.activity,
        input.price,
      );
      return { id: row.id };
    }),
});
