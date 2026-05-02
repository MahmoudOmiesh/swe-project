import { eq, and, or, not, lt, gt, gte, count, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import {
  reservations,
  guests,
  rooms,
  bills,
  services,
  reservationServices,
} from "@/server/db/schema";


type ReservationStatus = "new" | "checked-in" | "cancelled" | "checked-out";
type PaymentMethod = "cash" | "card" | "bank_transfer" | "other";


/** List all bookings with guest, room, and service data. */
export async function listBookings(filters?: {
  status?: ReservationStatus;
  search?: string;
}) {
  const rows = await db.query.reservations.findMany({
    with: {
      guest: true,
      room: true,
      services: {
        with: { service: true },
        orderBy: (rs, { asc }) => [asc(rs.createdAt)],
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
      bills: true,
      services: {
        with: { service: true },
        orderBy: (rs, { asc }) => [asc(rs.createdAt)],
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
    .where(isNull(rooms.serviceMode));

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

/** Return all predefined services. */
export async function getAvailableServices() {
  return db.select().from(services).orderBy(services.name);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Create a booking: guest → reservation → optional services. Bill is created at checkout. */
export async function createBooking(input: {
  guest: {
    firstName: string;
    lastName: string;
    nationalityId: string;
    phone: string;
    address?: string;
    dob: string;
  };
  roomId: number;
  numberOfGuests: number;
  checkIn: Date;
  checkOut: Date;
  serviceIds?: number[];
}) {
  // 1. Create guest record
  const [guest] = await db
    .insert(guests)
    .values({
      firstName: input.guest.firstName,
      lastName: input.guest.lastName,
      nationalityId: input.guest.nationalityId,
      phone: input.guest.phone,
      address: input.guest.address,
      dob: input.guest.dob,
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

  // 3. Link services (if any)
  if (input.serviceIds?.length) {
    await db.insert(reservationServices).values(
      input.serviceIds.map((serviceId) => ({
        reservationId: reservation.id,
        serviceId,
      })),
    );
  }

  return reservation;
}

/** Check out a reservation: set status and generate the bill. */
export async function checkOutBooking(
  id: number,
  paymentMethod: PaymentMethod,
) {
  // 1. Fetch reservation with room and services
  const reservation = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
    with: {
      room: true,
      services: {
        with: { service: true },
      },
    },
  });

  if (!reservation) throw new Error("Reservation not found");

  // 2. Calculate totals
  const nights = Math.ceil(
    (reservation.checkOutAt.getTime() - reservation.checkInAt.getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const roomTotal = reservation.room.ratePerNight * nights;
  const extrasTotal = reservation.services.reduce(
    (sum, rs) => sum + Number(rs.service.price),
    0,
  );
  const subtotal = roomTotal + extrasTotal;
  const tax = subtotal * 0.14;
  const totalAmount = subtotal + tax;

  // 3. Create bill
  const [bill] = await db
    .insert(bills)
    .values({
      reservationId: id,
      extraServices: extrasTotal.toFixed(2),
      tax: tax.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
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

/** Update a booking: guest fields + reservation fields + replace services. */
export async function updateBooking(
  id: number,
  input: {
    guest: {
      firstName: string;
      lastName: string;
      nationalityId: string;
      phone: string;
      address?: string;
      dob: string;
    };
    roomId: number;
    numberOfGuests: number;
    checkIn: Date;
    checkOut: Date;
    serviceIds?: number[];
  },
) {
  // 1. Find reservation to get guestId
  const reservation = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
  });
  if (!reservation) throw new Error("Reservation not found");

  // 2. Update guest record
  await db
    .update(guests)
    .set({
      firstName: input.guest.firstName,
      lastName: input.guest.lastName,
      nationalityId: input.guest.nationalityId,
      phone: input.guest.phone,
      address: input.guest.address,
      dob: input.guest.dob,
    })
    .where(eq(guests.id, reservation.guestId));

  // 3. Update reservation
  const [updated] = await db
    .update(reservations)
    .set({
      roomId: input.roomId,
      numberOfGuests: input.numberOfGuests,
      checkInAt: input.checkIn,
      checkOutAt: input.checkOut,
    })
    .where(eq(reservations.id, id))
    .returning();

  // 4. Replace services — delete old, insert new
  await db
    .delete(reservationServices)
    .where(eq(reservationServices.reservationId, id));

  if (input.serviceIds?.length) {
    await db.insert(reservationServices).values(
      input.serviceIds.map((serviceId) => ({
        reservationId: id,
        serviceId,
      })),
    );
  }

  return updated;
}

/** Add a predefined service to a reservation by service ID. */
export async function addService(reservationId: number, serviceId: number) {
  const [row] = await db
    .insert(reservationServices)
    .values({ reservationId, serviceId })
    .returning();
  return row;
}

/** List today's arrivals — reservations with status "new" whose check-in date is today. */
export async function getTodayArrivals() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return db.query.reservations.findMany({
    where: and(
      eq(reservations.status, "new"),
      gte(reservations.checkInAt, today),
      lt(reservations.checkInAt, tomorrow),
    ),
    with: {
      guest: true,
      room: true,
      services: {
        with: { service: true },
        orderBy: (rs, { asc }) => [asc(rs.createdAt)],
      },
    },
    orderBy: (r, { asc }) => [asc(r.checkInAt)],
  });
}

/** Check in a reservation: set status to "checked-in" and optionally update services. */
export async function checkInReservation(
  id: number,
  serviceIds?: number[],
) {
  const reservation = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
  });
  if (!reservation) throw new Error("Reservation not found");

  // 1. Update status
  const [updated] = await db
    .update(reservations)
    .set({ status: "checked-in" })
    .where(eq(reservations.id, id))
    .returning();

  // 2. Replace services if provided
  if (serviceIds !== undefined) {
    await db
      .delete(reservationServices)
      .where(eq(reservationServices.reservationId, id));

    if (serviceIds.length) {
      await db.insert(reservationServices).values(
        serviceIds.map((serviceId) => ({
          reservationId: id,
          serviceId,
        })),
      );
    }
  }

  return updated;
}

/** List today's departures — checked-in or checked-out reservations whose check-out date is today. */
export async function getTodayDepartures() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return db.query.reservations.findMany({
    where: and(
      or(
        eq(reservations.status, "checked-in"),
        eq(reservations.status, "checked-out"),
      ),
      gte(reservations.checkOutAt, today),
      lt(reservations.checkOutAt, tomorrow),
    ),
    with: {
      guest: true,
      room: true,
      bills: true,
      services: {
        with: { service: true },
        orderBy: (rs, { asc }) => [asc(rs.createdAt)],
      },
    },
    orderBy: (r, { asc }) => [asc(r.checkOutAt)],
  });
}

/** Late checkouts — checked-in reservations whose check-out time has already passed. */
export async function getLateCheckouts() {
  const now = new Date();

  return db.query.reservations.findMany({
    where: and(
      eq(reservations.status, "checked-in"),
      lt(reservations.checkOutAt, now),
    ),
    with: {
      room: true,
    },
    orderBy: (r, { asc }) => [asc(r.checkOutAt)],
  });
}

/** List all bills with reservation, guest, room, and service data. */
export async function listBills() {
  return db.query.bills.findMany({
    with: {
      reservation: {
        with: {
          guest: true,
          room: true,
          services: {
            with: { service: true },
            orderBy: (rs, { asc }) => [asc(rs.createdAt)],
          },
        },
      },
    },
    orderBy: (b, { desc }) => [desc(b.createdAt)],
  });
}

/** Dashboard KPI stats. */
export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  // All rooms
  const allRooms = await db.select().from(rooms);
  const totalRooms = allRooms.length || 1;

  // Occupied = checked-in reservations (unique rooms)
  const occupiedRows = await db.query.reservations.findMany({
    where: eq(reservations.status, "checked-in"),
    columns: { roomId: true },
  });
  const occupiedCount = new Set(occupiedRows.map((r) => r.roomId)).size;

  // Today's pending arrivals
  const arrivalsRows = await db.query.reservations.findMany({
    where: and(
      eq(reservations.status, "new"),
      gte(reservations.checkInAt, today),
      lt(reservations.checkInAt, tomorrow),
    ),
    columns: { id: true },
  });

  // Revenue this week
  const weekBills = await db.select().from(bills);
  const revenueThisWeek = weekBills
    .filter((b) => b.createdAt >= weekAgo)
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  // Rooms to clean
  const roomsToClean = allRooms.filter((r) => r.serviceMode === "cleaning").length;

  return {
    occupancyPercent: Math.round((occupiedCount / totalRooms) * 100),
    checkInsToday: arrivalsRows.length,
    revenueThisWeek,
    roomsToClean,
  };
}

/** Today's guests for the dashboard — check-ins, staying, check-outs. */
export async function getDashboardGuests() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const arrivals = await db.query.reservations.findMany({
    where: and(
      eq(reservations.status, "new"),
      gte(reservations.checkInAt, today),
      lt(reservations.checkInAt, tomorrow),
    ),
    with: { guest: true, room: true },
    orderBy: (r, { asc }) => [asc(r.checkInAt)],
  });

  const departures = await db.query.reservations.findMany({
    where: and(
      eq(reservations.status, "checked-in"),
      gte(reservations.checkOutAt, today),
      lt(reservations.checkOutAt, tomorrow),
    ),
    with: { guest: true, room: true },
    orderBy: (r, { asc }) => [asc(r.checkOutAt)],
  });

  const staying = await db.query.reservations.findMany({
    where: and(
      eq(reservations.status, "checked-in"),
      gte(reservations.checkOutAt, tomorrow),
    ),
    with: { guest: true, room: true },
    orderBy: (r, { desc }) => [desc(r.checkInAt)],
    limit: 5,
  });

  type Status = "checkin" | "staying" | "checkout";
  type GuestRow = {
    reservationId: number;
    firstName: string;
    lastName: string;
    room: string;
    roomType: string;
    status: Status;
    isLoyal: boolean;
  };

  const result: GuestRow[] = [];
  const seen = new Set<number>();

  for (const r of arrivals) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    result.push({
      reservationId: r.id,
      firstName: r.guest.firstName,
      lastName: r.guest.lastName,
      room: r.room.number,
      roomType: r.room.type,
      status: "checkin",
      isLoyal: r.guest.isLoyal,
    });
  }

  for (const r of departures) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    result.push({
      reservationId: r.id,
      firstName: r.guest.firstName,
      lastName: r.guest.lastName,
      room: r.room.number,
      roomType: r.room.type,
      status: "checkout",
      isLoyal: r.guest.isLoyal,
    });
  }

  for (const r of staying) {
    if (seen.has(r.id) || result.length >= 8) continue;
    seen.add(r.id);
    result.push({
      reservationId: r.id,
      firstName: r.guest.firstName,
      lastName: r.guest.lastName,
      room: r.room.number,
      roomType: r.room.type,
      status: "staying",
      isLoyal: r.guest.isLoyal,
    });
  }

  return result;
}

/** Weekly occupancy percentages for the bar chart. */
export async function getWeeklyOccupancy() {
  const now = new Date();
  const dayOfWeek = now.getDay();

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const totalRows = await db.select({ count: count() }).from(rooms);
  const totalRooms = totalRows[0]?.count ?? 1;

  const overlapping = await db.query.reservations.findMany({
    where: and(
      not(eq(reservations.status, "cancelled")),
      lt(reservations.checkInAt, weekEnd),
      gt(reservations.checkOutAt, weekStart),
    ),
    columns: { checkInAt: true, checkOutAt: true },
  });

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return labels.map((label, i) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const occupied = overlapping.filter(
      (r) => r.checkInAt < dayEnd && r.checkOutAt > dayStart,
    ).length;

    return {
      label,
      value: Math.min(Math.round((occupied / totalRooms) * 100), 100),
      current: i === dayOfWeek,
    };
  });
}

/** Billing stats: revenue this week, paid count, pending (checked-in without bill) count. */
export async function getBillingStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const allBills = await db.select().from(bills);

  const revenueThisWeek = allBills
    .filter((b) => b.createdAt >= weekAgo)
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const paidCount = allBills.length;

  const pendingRows = await db
    .select({ count: count() })
    .from(reservations)
    .where(eq(reservations.status, "checked-in"));

  return {
    revenueThisWeek,
    paidCount,
    pendingCount: pendingRows[0]?.count ?? 0,
  };
}
