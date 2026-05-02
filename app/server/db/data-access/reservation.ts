import { eq, and, not, lt, gt, count } from "drizzle-orm";
import { db } from "@/server/db";
import {
  reservations,
  guests,
  rooms,
  bills,
  reservationActivities,
} from "@/server/db/schema";


type ReservationStatus = "new" | "checked-in" | "cancelled" | "checked-out";
type PaymentMethod = "cash" | "card" | "bank_transfer" | "other";


/** List all bookings with guest, room, and activity data. */
export async function listBookings(filters?: {
  status?: ReservationStatus;
  search?: string;
}) {
  const rows = await db.query.reservations.findMany({
    with: {
      guest: true,
      room: true,
      activities: {
        orderBy: (activities, { asc }) => [asc(activities.createdAt)],
      },
    },
    where: filters?.status
      ? eq(reservations.status, filters.status)
      : undefined,
    orderBy: (reservations, { desc }) => [desc(reservations.createdAt)],
  });

  if (!filters?.search) return rows;

  const q = filters.search.toLowerCase();
  return rows.filter((r) => {
    const name = `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase();
    const id = `#${String(r.id)}`;
    return (
      name.includes(q) ||
      r.room.number.toLowerCase().includes(q) ||
      id.includes(q)
    );
  });
}

/** Get a single booking by reservation ID, with all relations. */
export async function getBookingById(id: number) {
  return db.query.reservations.findFirst({
    where: eq(reservations.id, id),
    with: {
      guest: true,
      room: true,
      activities: {
        orderBy: (activities, { asc }) => [asc(activities.createdAt)],
      },
    },
  });
}

/** Get rooms available for a given date range (no overlapping non-cancelled reservations). */
export async function getAvailableRooms(checkIn: Date, checkOut: Date) {
  const overlapping = await db
    .select({ roomId: reservations.roomId })
    .from(reservations)
    .where(
      and(
        not(eq(reservations.status, "cancelled")),
        lt(reservations.checkInAt, checkOut),
        gt(reservations.checkOutAt, checkIn),
      ),
    );

  const occupiedIds = new Set(overlapping.map((r) => r.roomId));

  const allRooms = await db
    .select()
    .from(rooms)
    .where(eq(rooms.status, "available"));

  return allRooms.filter((r) => !occupiedIds.has(r.id));
}

/** Aggregate booking counts grouped by status. */
export async function getBookingStats() {
  const rows = await db
    .select({
      status: reservations.status,
      count: count(),
    })
    .from(reservations)
    .groupBy(reservations.status);

  const stats = {
    total: 0,
    new: 0,
    checkedIn: 0,
    checkedOut: 0,
    cancelled: 0,
  };
  for (const row of rows) {
    const c = row.count;
    stats.total += c;
    if (row.status === "new") stats.new = c;
    if (row.status === "checked-in") stats.checkedIn = c;
    if (row.status === "checked-out") stats.checkedOut = c;
    if (row.status === "cancelled") stats.cancelled = c;
  }
  return stats;
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Create a booking: guest → reservation. Bill is created at checkout. */
export async function createBooking(input: {
  guest: {
    firstName: string;
    lastName: string;
    nationality: string;
    nationalityId: string;
    phone?: string;
  };
  roomId: number;
  numberOfGuests: number;
  checkIn: Date;
  checkOut: Date;
}) {
  // 1. Create guest record
  const [guest] = await db
    .insert(guests)
    .values({
      firstName: input.guest.firstName,
      lastName: input.guest.lastName,
      nationality: input.guest.nationality,
      nationalityId: input.guest.nationalityId,
      phone: input.guest.phone,
    })
    .returning();

  // 2. Create reservation
  const [reservation] = await db
    .insert(reservations)
    .values({
      guestId: guest.id,
      roomId: input.roomId,
      numberOfGuests: input.numberOfGuests,
      checkInAt: input.checkIn,
      checkOutAt: input.checkOut,
      status: "new",
    })
    .returning();

  return reservation;
}

/** Check out a reservation: set status and generate the bill. */
export async function checkOutBooking(
  id: number,
  paymentMethod: PaymentMethod,
) {
  // 1. Fetch reservation with room and activities
  const reservation = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
    with: { room: true, activities: true },
  });

  if (!reservation) throw new Error("Reservation not found");

  // 2. Calculate totals
  const nights = Math.ceil(
    (reservation.checkOutAt.getTime() - reservation.checkInAt.getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const roomTotal = reservation.room.ratePerNight * nights;
  const extrasTotal = reservation.activities.reduce(
    (sum, a) => sum + Number(a.price),
    0,
  );
  const totalAmount = roomTotal + extrasTotal;

  // 3. Create bill
  const [bill] = await db
    .insert(bills)
    .values({
      reservationId: id,
      extraServices: extrasTotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paymentStatus: "pending",
      paymentMethod,
    })
    .returning();

  // 4. Mark as checked-out
  await db
    .update(reservations)
    .set({ status: "checked-out" })
    .where(eq(reservations.id, id));

  return bill;
}

/** Update a reservation's status. */
export async function updateBookingStatus(
  id: number,
  status: ReservationStatus,
) {
  const [updated] = await db
    .update(reservations)
    .set({ status })
    .where(eq(reservations.id, id))
    .returning();

  return updated;
}

/** Add a service / extra activity to a reservation. */
export async function addActivity(
  reservationId: number,
  activity: string,
  price: string,
) {
  const [row] = await db
    .insert(reservationActivities)
    .values({ reservationId, activity, price })
    .returning();
  return row;
}
