// ─── Types ────────────────────────────────────────────────────────────────────

export type BookingStatus = "new" | "checked-in" | "cancelled" | "checked-out";

export interface BookingGuest {
  name:        string;
  initials:    string;
  avatarBg:    string;
  avatarColor: string;
  nationality: string;
  nationalId:  string;
  phone:       string;
  numGuests:   number;
  isLoyal:     boolean;
}

export interface BookingActivity {
  activity: string;
  price:    string;
}

export interface Booking {
  id:           string;
  guest:        BookingGuest;
  room:         string;
  roomType:     string;
  ratePerNight: number;
  checkIn:      string;
  checkOut:     string;
  nights:       number;
  status:       BookingStatus;
  activities:   BookingActivity[];
}

// ─── Status display config ────────────────────────────────────────────────────

export const bookingStatusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string }
> = {
  "new":         { label: "New",         bg: "#E6F1FB", text: "#185FA5" },
  "checked-in":  { label: "Checked In",  bg: "#EAF3DE", text: "#3B6D11" },
  "checked-out": { label: "Checked Out", bg: "#F5EDD8", text: "#7A5018" },
  "cancelled":   { label: "Cancelled",   bg: "#FCEBEB", text: "#A32D2D" },
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

// ─── Available rooms for new booking form ────────────────────────────────────

export const AVAILABLE_ROOMS = [
  { value: "103-single",  label: "103 · Single · EGP 300/night"  },
  { value: "106-double",  label: "106 · Double · EGP 450/night"  },
  { value: "201-double",  label: "201 · Double · EGP 450/night"  },
  { value: "304-single",  label: "304 · Single · EGP 300/night"  },
  { value: "308-single",  label: "308 · Single · EGP 300/night"  },
];
