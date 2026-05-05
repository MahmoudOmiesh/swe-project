import {
  eq,
  and,
  not,
  lt,
  gt,
  gte,
  count,
} from "drizzle-orm";
import { todayUtc, addDaysUtc } from "@/lib/calendar-date";
import { db } from "@/server/db";
import {
  reservations,
  rooms,
  bills,
  housekeepingTasks,
  user,
  supplierOrders,
} from "@/server/db/schema";
import { ROLES } from "@/lib/roles";

export type TimeRange = "week" | "month";

// ─── Range helpers ─────────────────────────────────────────────────────────

function weekRange() {
  const today = todayUtc();
  const start = addDaysUtc(today, -today.getUTCDay());
  return { start, end: addDaysUtc(start, 7) };
}

function monthRange() {
  const n = new Date();
  return {
    start: new Date(Date.UTC(n.getFullYear(), n.getMonth(), 1)),
    end: new Date(Date.UTC(n.getFullYear(), n.getMonth() + 1, 1)),
  };
}

function rangeFor(tr: TimeRange) {
  return tr === "week" ? weekRange() : monthRange();
}

function prevRange(s: Date, e: Date) {
  const ms = e.getTime() - s.getTime();
  return { start: new Date(s.getTime() - ms), end: new Date(s.getTime()) };
}

// ─── Formatting ────────────────────────────────────────────────────────────

function fmtEgp(n: number) {
  return `EGP ${Math.round(n).toLocaleString("en-US")}`;
}

function pctChange(cur: number, prev: number) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function changeMeta(p: number, label: string) {
  if (p === 0)
    return { sub: `— same as ${label}`, subTone: "neutral" as const };
  return {
    sub: `${p > 0 ? "↑" : "↓"} ${Math.abs(p)}% vs ${label}`,
    subTone: (p > 0 ? "positive" : "negative") as "positive" | "negative",
  };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Sub-queries ───────────────────────────────────────────────────────────

async function revenueIn(s: Date, e: Date) {
  const rows = await db
    .select()
    .from(bills)
    .where(and(gte(bills.createdAt, s), lt(bills.createdAt, e)));
  return rows.reduce((acc, b) => acc + Number(b.totalAmount), 0);
}

async function bookingCountIn(s: Date, e: Date) {
  const [r] = await db
    .select({ c: count() })
    .from(reservations)
    .where(
      and(gte(reservations.createdAt, s), lt(reservations.createdAt, e)),
    );
  return r?.c ?? 0;
}

async function avgStayIn(s: Date, e: Date) {
  const rows = await db.query.reservations.findMany({
    where: and(
      not(eq(reservations.status, "cancelled")),
      gte(reservations.createdAt, s),
      lt(reservations.createdAt, e),
    ),
    columns: { checkInAt: true, checkOutAt: true },
  });
  if (!rows.length) return 0;
  const total = rows.reduce(
    (a, r) =>
      a +
      Math.max(
        1,
        Math.ceil(
          (r.checkOutAt.getTime() - r.checkInAt.getTime()) / 86_400_000,
        ),
      ),
    0,
  );
  return Math.round((total / rows.length) * 10) / 10;
}

async function avgOccIn(s: Date, e: Date, totalRooms: number) {
  if (totalRooms === 0) return 0;
  const rows = await db.query.reservations.findMany({
    where: and(
      not(eq(reservations.status, "cancelled")),
      lt(reservations.checkInAt, e),
      gt(reservations.checkOutAt, s),
    ),
    columns: { roomId: true, checkInAt: true, checkOutAt: true },
  });
  const days = Math.max(
    1,
    Math.ceil((e.getTime() - s.getTime()) / 86_400_000),
  );
  let occupied = 0;
  for (let i = 0; i < days; i++) {
    const ds = addDaysUtc(s, i);
    const de = addDaysUtc(s, i + 1);
    occupied += new Set(
      rows
        .filter((r) => r.checkInAt < de && r.checkOutAt > ds)
        .map((r) => r.roomId),
    ).size;
  }
  return Math.round((occupied / (days * totalRooms)) * 100);
}

// ─── Main report query ─────────────────────────────────────────────────────

export async function getReportData(timeRange: TimeRange) {
  const { start, end } = rangeFor(timeRange);
  const prev = prevRange(start, end);
  const today = todayUtc();
  const label = timeRange === "week" ? "last week" : "last month";

  // Trailing 7-day window for the daily revenue chart (always has data)
  const trail7Start = addDaysUtc(today, -6);
  const trail7End = addDaysUtc(today, 1);

  const allRooms = await db.select().from(rooms);
  const totalRooms = allRooms.length || 1;

  // ── Parallel queries ─────────────────────────────────────────────────
  const [
    curRev,
    prevRev,
    curOcc,
    prevOcc,
    curStay,
    prevStay,
    curBC,
    prevBC,
    periodBills,
    weekBillRows,
    checkedInRows,
    periodRes,
    tasksDoneR,
    maintOpenR,
    suppOrdR,
    staffR,
  ] = await Promise.all([
    revenueIn(start, end),
    revenueIn(prev.start, prev.end),
    avgOccIn(start, end, totalRooms),
    avgOccIn(prev.start, prev.end, totalRooms),
    avgStayIn(start, end),
    avgStayIn(prev.start, prev.end),
    bookingCountIn(start, end),
    bookingCountIn(prev.start, prev.end),
    // Current period bills with full relations
    db.query.bills.findMany({
      where: and(gte(bills.createdAt, start), lt(bills.createdAt, end)),
      with: {
        reservation: {
          with: {
            guest: true,
            room: true,
            services: { with: { service: true } },
          },
        },
      },
    }),
    // Trailing 7-day bills (plain, for daily revenue chart)
    db
      .select()
      .from(bills)
      .where(
        and(gte(bills.createdAt, trail7Start), lt(bills.createdAt, trail7End)),
      ),
    // Checked-in reservations (for floor occupancy snapshot)
    db.query.reservations.findMany({
      where: eq(reservations.status, "checked-in"),
      columns: { roomId: true },
    }),
    // Period reservations with guest + bills (for booking summary)
    db.query.reservations.findMany({
      where: and(
        gte(reservations.createdAt, start),
        lt(reservations.createdAt, end),
      ),
      with: { guest: true, bills: true },
    }),
    // Housekeeping: tasks completed in period
    db
      .select({ c: count() })
      .from(housekeepingTasks)
      .where(
        and(
          eq(housekeepingTasks.status, "done"),
          gte(housekeepingTasks.createdAt, start),
          lt(housekeepingTasks.createdAt, end),
        ),
      ),
    // Housekeeping: open maintenance issues (any date)
    db
      .select({ c: count() })
      .from(housekeepingTasks)
      .where(
        and(
          eq(housekeepingTasks.type, "maintenance"),
          not(eq(housekeepingTasks.status, "done")),
        ),
      ),
    // Supplier orders in period
    db
      .select({ c: count() })
      .from(supplierOrders)
      .where(
        and(
          gte(supplierOrders.createdAt, start),
          lt(supplierOrders.createdAt, end),
        ),
      ),
    // Total housekeeping staff (users with the housekeeping role)
    db.select({ c: count() }).from(user).where(eq(user.role, ROLES.HOUSEKEEPING)),
  ]);

  // ── KPIs ─────────────────────────────────────────────────────────────
  const kpis = [
    {
      label: "Total revenue",
      value: fmtEgp(curRev),
      ...changeMeta(pctChange(curRev, prevRev), label),
    },
    {
      label: "Avg. occupancy",
      value: `${curOcc}%`,
      ...changeMeta(pctChange(curOcc, prevOcc), label),
    },
    {
      label: "Total bookings",
      value: String(curBC),
      ...changeMeta(pctChange(curBC, prevBC), label),
    },
    {
      label: "Avg. stay length",
      value: `${curStay} nights`,
      ...changeMeta(pctChange(curStay, prevStay), label),
    },
  ];

  // ── Daily Revenue (trailing 7 days) ───────────────────────────────────
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dailyRevenue = Array.from({ length: 7 }, (_, i) => {
    const ds = addDaysUtc(trail7Start, i);
    const de = addDaysUtc(trail7Start, i + 1);
    return {
      day: DOW[ds.getUTCDay()],
      amount: Math.round(
        weekBillRows
          .filter((b) => b.createdAt >= ds && b.createdAt < de)
          .reduce((a, b) => a + Number(b.totalAmount), 0),
      ),
      highlighted: i === 6, // today is always the last bar
    };
  });

  const nonZero = dailyRevenue.filter((d) => d.amount > 0);
  const peakDay = nonZero.length
    ? nonZero.reduce((m, d) => (d.amount > m.amount ? d : m))
    : null;
  const lowestDay = nonZero.length
    ? nonZero.reduce((m, d) => (d.amount < m.amount ? d : m))
    : null;

  // ── Floor Occupancy (live snapshot) ──────────────────────────────────
  const occIds = new Set(checkedInRows.map((r) => r.roomId));
  const floorMap = new Map<number, { total: number; occupied: number }>();
  for (const rm of allRooms) {
    const f = floorMap.get(rm.floor) ?? { total: 0, occupied: 0 };
    f.total++;
    if (occIds.has(rm.id)) f.occupied++;
    floorMap.set(rm.floor, f);
  }
  const floorOccupancy = [...floorMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([fl, d]) => ({
      floor: `F${fl}`,
      percent: d.total ? Math.round((d.occupied / d.total) * 100) : 0,
      ratio: `${d.occupied}/${d.total}`,
    }));

  // ── Revenue by Source ────────────────────────────────────────────────
  let roomRev = 0;
  const svcMap = new Map<string, number>();
  for (const b of periodBills) {
    roomRev +=
      Number(b.totalAmount) - Number(b.tax) - Number(b.extraServices);
    for (const rs of b.reservation.services) {
      svcMap.set(
        rs.service.name,
        (svcMap.get(rs.service.name) ?? 0) + Number(rs.service.price),
      );
    }
  }
  const revenueSources = [
    { label: "Rooms", amount: Math.round(Math.max(0, roomRev)) },
    ...[...svcMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([l, a]) => ({ label: l, amount: Math.round(a) })),
  ];

  // ── Top Performing Rooms (aggregated by room) ────────────────────────
  const roomAgg = new Map<
    number,
    {
      room: (typeof periodBills)[0]["reservation"]["room"];
      amount: number;
      guestLabel: string;
      topBill: number;
    }
  >();
  for (const b of periodBills) {
    const r = b.reservation;
    const nights = Math.max(
      1,
      Math.ceil(
        (r.checkOutAt.getTime() - r.checkInAt.getTime()) / 86_400_000,
      ),
    );
    const amt = Number(b.totalAmount);
    const gLabel = `${nights} nights · ${r.guest.firstName.charAt(0)}. ${r.guest.lastName}`;
    const ex = roomAgg.get(r.room.id);
    if (ex) {
      ex.amount += amt;
      if (amt > ex.topBill) {
        ex.guestLabel = gLabel;
        ex.topBill = amt;
      }
    } else {
      roomAgg.set(r.room.id, {
        room: r.room,
        amount: amt,
        guestLabel: gLabel,
        topBill: amt,
      });
    }
  }
  const topRooms = [...roomAgg.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4)
    .map((r) => ({
      room: r.room.number,
      details: `${cap(r.room.type)} · Floor ${r.room.floor}`,
      guest: r.guestLabel,
      amount: Math.round(r.amount),
    }));

  // ── Booking Summary ──────────────────────────────────────────────────
  const newB = periodRes.filter((r) => r.status === "new").length;
  const confirmed = periodRes.filter(
    (r) => r.status === "checked-in" || r.status === "checked-out",
  ).length;
  const cancelled = periodRes.filter(
    (r) => r.status === "cancelled",
  ).length;
  const pendingPay = periodRes.filter(
    (r) => r.status === "checked-in" && r.bills.length === 0,
  ).length;
  const loyal = new Set(
    periodRes.filter((r) => r.guest.isLoyal).map((r) => r.guestId),
  ).size;
  const avgBill = periodBills.length
    ? Math.round(curRev / periodBills.length)
    : 0;

  const bookingSummary = [
    { label: "New bookings", value: String(newB) },
    { label: "Confirmed", value: String(confirmed), tone: "positive" as const },
    { label: "Cancelled", value: String(cancelled), tone: "negative" as const },
    { label: "Pending payment", value: String(pendingPay) },
    { label: "Loyal guests", value: String(loyal), tone: "gold" as const },
    {
      label: "Avg. booking value",
      value: avgBill > 0 ? fmtEgp(avgBill) : "—",
      tone: "gold" as const,
    },
  ];

  // ── Housekeeping Summary ─────────────────────────────────────────────
  const housekeepingSummary = [
    {
      label: "Tasks completed",
      value: String(tasksDoneR[0]?.c ?? 0),
      tone: "positive" as const,
    },
    {
      label: "Maintenance open",
      value: String(maintOpenR[0]?.c ?? 0),
      tone: "negative" as const,
    },
    { label: "Supplier orders", value: String(suppOrdR[0]?.c ?? 0) },
    { label: "Staff on duty", value: String(staffR[0]?.c ?? 0) },
  ];

  return {
    kpis,
    dailyRevenue,
    peakDay: peakDay
      ? { day: peakDay.day, amount: peakDay.amount }
      : null,
    lowestDay: lowestDay
      ? { day: lowestDay.day, amount: lowestDay.amount }
      : null,
    floorOccupancy,
    revenueSources,
    topRooms,
    bookingSummary,
    housekeepingSummary,
  };
}
