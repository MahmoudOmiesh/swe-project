import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";


/** Start of today (local time, midnight). */
function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}


/** Egyptian National ID — exactly 14 digits. */
const NATIONAL_ID_RE = /^\d{14}$/;

/**
 * Passport number — 6‑9 alphanumeric characters.
 * Covers the vast majority of world‑wide formats (ICAO spec is max 9).
 */
const PASSPORT_RE = /^[A-Za-z0-9]{6,9}$/;


export const newBookingSchema = z.object({
  // Guest
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  nationalityId: z
    .string()
    .min(1, "ID / Passport number is required")
    .refine(
      (v) => NATIONAL_ID_RE.test(v) || PASSPORT_RE.test(v),
      "Enter a 14-digit national ID or a 6–9 character passport number",
    ),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (v) => isValidPhoneNumber(v, "EG"),
      "Enter a valid phone number",
    ),
  address: z.string(),
  dob: z
    .date({ error: "Date of birth is required" })
    .refine((v) => v < today(), "Date of birth must be in the past"),

  // Reservation
  roomId: z.string().min(1, "Please select a room"),
  numberOfGuests: z.number().min(1, "At least 1 guest required"),
  checkIn: z
    .date({ error: "Check-in date is required" })
    .refine(
      (v) => v >= today(),
      "Check-in must be today or a future date",
    ),
  checkOut: z
    .date({ error: "Check-out date is required" })
    .refine(
      (v) => v >= today(),
      "Check-out must be a future date",
    ),

  // Services
  services: z.array(z.string()),
}).refine(
  (data) => data.checkOut > data.checkIn,
  {
    message: "Check-out must be after check-in date",
    path: ["checkOut"],
  },
);

export type NewBookingFormValues = z.infer<typeof newBookingSchema>;

/** The raw input shape (before refinements) – used for useForm generic. */
export type NewBookingFormInput = z.input<typeof newBookingSchema>;
