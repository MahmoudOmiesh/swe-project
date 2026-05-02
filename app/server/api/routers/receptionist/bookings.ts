import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { receptionistProcedure, router } from "@/server/api";
import {
  listBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  checkOutBooking,
  getAvailableRooms,
  getBookingStats,
  getAvailableServices,
  addService,
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

// ─── Mappers ────────────────────────────────────────────────────────────────

type ListRow = Awaited<ReturnType<typeof listBookings>>[number];
type DetailRow = NonNullable<Awaited<ReturnType<typeof getBookingById>>>;

/** Slim item for table rows — only what the list needs. */
function mapListItem(row: ListRow) {
  const name = `${row.guest.firstName} ${row.guest.lastName}`;
  const avatar = avatarColors(name);

  return {
    id: row.id,
    guestName: name,
    guestInitials: initials(row.guest.firstName, row.guest.lastName),
    avatarBg: avatar.bg,
    avatarColor: avatar.text,
    isLoyal: row.guest.isLoyal,
    numGuests: row.numberOfGuests,
    room: row.room.number,
    roomType: capitalize(row.room.type),
    checkIn: fmtDate(row.checkInAt),
    checkOut: fmtDate(row.checkOutAt),
    status: row.status,
  };
}

/** Full detail for the side panel + edit form — includes raw IDs and all guest fields. */
function mapDetail(row: DetailRow) {
  const name = `${row.guest.firstName} ${row.guest.lastName}`;
  const avatar = avatarColors(name);
  const nights = nightsBetween(row.checkInAt, row.checkOutAt);

  const bill = row.bills[0] ?? null;

  return {
    id: row.id,
    // Guest — display
    guestName: name,
    guestInitials: initials(row.guest.firstName, row.guest.lastName),
    avatarBg: avatar.bg,
    avatarColor: avatar.text,
    isLoyal: row.guest.isLoyal,
    // Guest — raw for edit form
    firstName: row.guest.firstName,
    lastName: row.guest.lastName,
    nationalId: row.guest.nationalityId,
    phone: row.guest.phone,
    address: row.guest.address,
    dob: row.guest.dob, // string "YYYY-MM-DD"
    numGuests: row.numberOfGuests,
    // Room
    roomId: row.room.id,
    room: row.room.number,
    roomType: capitalize(row.room.type),
    ratePerNight: row.room.ratePerNight,
    // Stay
    checkIn: row.checkInAt, // Date (SuperJSON preserves)
    checkOut: row.checkOutAt,
    nights,
    status: row.status,
    // Services with IDs
    services: row.services.map((rs) => ({
      id: rs.service.id,
      name: rs.service.name,
      price: rs.service.price,
    })),
    // Bill (only present for checked-out reservations)
    bill: bill
      ? {
          id: bill.id,
          tax: bill.tax,
          extraServices: bill.extraServices,
          discount: bill.discount,
          totalAmount: bill.totalAmount,
          paymentMethod: bill.paymentMethod,
          createdAt: bill.createdAt,
        }
      : null,
  };
}

// ─── Router ─────────────────────────────────────────────────────────────────

const bookingStatusSchema = z.enum([
  "new",
  "checked-in",
  "cancelled",
  "checked-out",
]);

export const bookingsRouter = router({
  /** List bookings — returns slim items for the table. */
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
      return rows.map(mapListItem);
    }),

  /** Get a single booking with full detail (for side panel + edit form). */
  getById: receptionistProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const row = await getBookingById(input.id);
      if (!row) return null;
      return mapDetail(row);
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

  /** All predefined services. */
  availableServices: receptionistProcedure.query(async () => {
    const rows = await getAvailableServices();
    return rows.map((s) => ({ id: s.id, name: s.name, price: s.price }));
  }),

  /** Create a new booking (guest + reservation + optional service IDs). */
  create: receptionistProcedure
    .input(
      z.object({
        guest: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          nationalityId: z.string().min(1),
          phone: z.string().min(1),
          address: z.string().optional(),
          dob: z.string().min(1),
        }),
        roomId: z.number(),
        numberOfGuests: z.number().min(1),
        checkIn: z.coerce.date(),
        checkOut: z.coerce.date(),
        serviceIds: z.array(z.number()).optional(),
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

  /** Update an existing booking (guest + reservation + services). */
  update: receptionistProcedure
    .input(
      z.object({
        id: z.number(),
        guest: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          nationalityId: z.string().min(1),
          phone: z.string().min(1),
          address: z.string().optional(),
          dob: z.string().min(1),
        }),
        roomId: z.number(),
        numberOfGuests: z.number().min(1),
        checkIn: z.coerce.date(),
        checkOut: z.coerce.date(),
        serviceIds: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...data } = input;
        const updated = await updateBooking(id, data);
        return { id: updated.id };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Failed to update booking",
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

  /** Add a predefined service to a reservation by service ID. */
  addService: receptionistProcedure
    .input(
      z.object({
        reservationId: z.number(),
        serviceId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const row = await addService(input.reservationId, input.serviceId);
      return { id: row.id };
    }),
});
