import { z } from "zod";

/** YYYY-MM-DD for PostgreSQL `date` — avoids UTC shifting full `Date` serialization. */
export const calendarDateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");

/** Calendar day as UTC midnight — matches PostgreSQL `date` without local-TZ drift. */
export function parseCalendarDateUtc(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d)
  ) {
    throw new RangeError(`Bad calendar date: ${isoDate}`);
  }
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Today's date as a UTC-midnight Date, using the server's local calendar day.
 * Safe for comparing against PostgreSQL `date` columns (which Drizzle maps to UTC midnight).
 */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Add `n` days to a UTC-midnight Date, returning another UTC-midnight Date. */
export function addDaysUtc(d: Date, n: number): Date {
  const result = new Date(d);
  result.setUTCDate(result.getUTCDate() + n);
  return result;
}
