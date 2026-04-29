import { colors } from "@/components/dashboard/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookingStatus = "new" | "confirmed" | "pending" | "cancelled";

export interface BookingService {
  label: string;
}

export interface BookingGuest {
  name:        string;
  initials:    string;
  avatarBg:    string;
  avatarColor: string;
  nationality: string;
  nationalId:  string;
  phone:       string;
  purpose:     string;
  numGuests:   number;
  isLoyal?:    boolean;
}

export interface BookingActivity {
  label: string;
  sub:   string;
  color: string;
}

export interface Booking {
  id:         string;
  guest:      BookingGuest;
  room:       string;
  roomType:   string;
  ratePerNight: number;
  checkIn:    string;
  checkOut:   string;
  nights:     number;
  status:     BookingStatus;
  services:   string[];
  activity:   BookingActivity[];
}

// ─── Status display config ────────────────────────────────────────────────────

export const bookingStatusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string }
> = {
  new:       { label: "New",       bg: "#E6F1FB", text: "#185FA5" },
  confirmed: { label: "Confirmed", bg: "#EAF3DE", text: "#3B6D11" },
  pending:   { label: "Pending",   bg: "#F5EDD8", text: "#7A5018" },
  cancelled: { label: "Cancelled", bg: "#FCEBEB", text: "#A32D2D" },
};

// ─── Available services ───────────────────────────────────────────────────────

export const ALL_SERVICES = [
  "Breakfast",
  "Laundry",
  "Airport transfer",
  "Extra bed",
  "Room service",
  "Mini bar",
];

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "#1038",
    guest: {
      name: "Mohammed Ali", initials: "MA", avatarBg: "#EEEDFE", avatarColor: "#534AB7",
      nationality: "Egyptian", nationalId: "29801012345678",
      phone: "012 2240 8049", purpose: "Business", numGuests: 2,
    },
    room: "202", roomType: "Double", ratePerNight: 450,
    checkIn: "25 Apr 2026", checkOut: "27 Apr 2026", nights: 2,
    status: "new",
    services: ["Breakfast", "Laundry"],
    activity: [
      { label: "Booking created",    sub: "25 Apr · 08:30 · Reception", color: colors.gold    },
      { label: "Room 202 assigned",  sub: "25 Apr · 08:31 · System",    color: "#85B7EB"       },
      { label: "Awaiting check-in",  sub: "Expected 09:30",             color: colors.textMuted},
    ],
  },
  {
    id: "#1039",
    guest: {
      name: "Sara Ramadan", initials: "SR", avatarBg: "#E1F5EE", avatarColor: "#0F6E56",
      nationality: "Egyptian", nationalId: "29501023456789",
      phone: "010 1234 5678", purpose: "Leisure", numGuests: 1, isLoyal: true,
    },
    room: "305", roomType: "Suite", ratePerNight: 750,
    checkIn: "23 Apr 2026", checkOut: "28 Apr 2026", nights: 5,
    status: "confirmed",
    services: ["Breakfast", "Airport transfer"],
    activity: [
      { label: "Booking confirmed",  sub: "23 Apr · 10:00 · Manager",   color: "#3B6D11"       },
      { label: "Loyalty discount applied", sub: "10% off — EGP 375 saved", color: colors.gold  },
      { label: "Checked in",        sub: "23 Apr · 14:05 · Reception",  color: colors.gold    },
    ],
  },
  {
    id: "#1040",
    guest: {
      name: "Layla Ibrahim", initials: "LI", avatarBg: "#FAECE7", avatarColor: "#993C1D",
      nationality: "Egyptian", nationalId: "30001034567890",
      phone: "011 9876 5432", purpose: "Family visit", numGuests: 2,
    },
    room: "203", roomType: "Double", ratePerNight: 450,
    checkIn: "24 Apr 2026", checkOut: "27 Apr 2026", nights: 3,
    status: "confirmed",
    services: ["Breakfast"],
    activity: [
      { label: "Booking confirmed",  sub: "24 Apr · 09:15 · Reception", color: "#3B6D11"       },
      { label: "Checked in",        sub: "24 Apr · 13:00 · Reception",  color: colors.gold    },
    ],
  },
  {
    id: "#1041",
    guest: {
      name: "Mohamed Hassan", initials: "MH", avatarBg: "#F5EDD8", avatarColor: "#7A5018",
      nationality: "Egyptian", nationalId: "30101045678901",
      phone: "012 5555 6666", purpose: "Business", numGuests: 1,
    },
    room: "107", roomType: "Single", ratePerNight: 300,
    checkIn: "24 Apr 2026", checkOut: "25 Apr 2026", nights: 1,
    status: "pending",
    services: [],
    activity: [
      { label: "Booking created",    sub: "24 Apr · 07:00 · Online",    color: colors.gold    },
      { label: "Payment pending",    sub: "Awaiting confirmation",       color: "#7A5018"       },
    ],
  },
  {
    id: "#1042",
    guest: {
      name: "Rania Mostafa", initials: "RM", avatarBg: "#FBEAF0", avatarColor: "#72243E",
      nationality: "Egyptian", nationalId: "29701056789012",
      phone: "010 8888 9999", purpose: "Leisure", numGuests: 3,
    },
    room: "106", roomType: "Double", ratePerNight: 450,
    checkIn: "26 Apr 2026", checkOut: "29 Apr 2026", nights: 3,
    status: "new",
    services: [],
    activity: [
      { label: "Booking created",    sub: "25 Apr · 20:00 · Online",    color: colors.gold    },
    ],
  },
  {
    id: "#1043",
    guest: {
      name: "Omar Saad", initials: "OS", avatarBg: "#E6F1FB", avatarColor: "#185FA5",
      nationality: "Egyptian", nationalId: "29601067890123",
      phone: "011 3333 4444", purpose: "Business", numGuests: 1,
    },
    room: "105", roomType: "Single", ratePerNight: 300,
    checkIn: "22 Apr 2026", checkOut: "28 Apr 2026", nights: 6,
    status: "confirmed",
    services: [],
    activity: [
      { label: "Booking confirmed",  sub: "22 Apr · 11:00 · Reception", color: "#3B6D11"       },
      { label: "Checked in",        sub: "22 Apr · 15:30 · Reception",  color: colors.gold    },
    ],
  },
  {
    id: "#1044",
    guest: {
      name: "Khaled Amin", initials: "KA", avatarBg: "#F1EFE8", avatarColor: "#5F5E5A",
      nationality: "Egyptian", nationalId: "29301078901234",
      phone: "012 7777 8888", purpose: "Business", numGuests: 2,
    },
    room: "204", roomType: "Single", ratePerNight: 300,
    checkIn: "27 Apr 2026", checkOut: "30 Apr 2026", nights: 3,
    status: "cancelled",
    services: [],
    activity: [
      { label: "Booking created",    sub: "20 Apr · 09:00 · Online",    color: colors.gold    },
      { label: "Cancelled by guest", sub: "22 Apr · 16:00",             color: "#A32D2D"       },
    ],
  },
];

// ─── Available rooms for new booking form ────────────────────────────────────

export const AVAILABLE_ROOMS = [
  { value: "103-single",  label: "103 · Single · EGP 300/night"  },
  { value: "106-double",  label: "106 · Double · EGP 450/night"  },
  { value: "201-double",  label: "201 · Double · EGP 450/night"  },
  { value: "304-single",  label: "304 · Single · EGP 300/night"  },
  { value: "308-single",  label: "308 · Single · EGP 300/night"  },
];

// ─── Summary stats ────────────────────────────────────────────────────────────

export function getBookingStats(bookings: Booking[]) {
  return {
    total:     bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };
}
