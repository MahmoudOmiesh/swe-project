export interface BillLineItem {
  label: string;
  amount: number;
  tone?: "default" | "muted" | "success";
}

export interface DepartureRecord {
  id: string;
  guestName: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  roomLabel: string;
  bookingId: string;
  nationality: string;
  staySummary: string;
  paymentStatus: "Pending" | "Paid";
  billItems: BillLineItem[];
  totalDue: number;
}

export interface CheckoutAlert {
  id: string;
  message: string;
}

export const CHECK_OUT_DEPARTURES: DepartureRecord[] = [
  {
    id: "departure-1041",
    guestName: "Mohamed Hassan",
    initials: "MH",
    avatarBg: "#F5EDD8",
    avatarColor: "#7A5018",
    roomLabel: "Room 107",
    bookingId: "#1041",
    nationality: "Egyptian",
    staySummary: "1 guest · Business",
    paymentStatus: "Pending",
    totalDue: 409.5,
    billItems: [
      { label: "Room 107 · Single · 1 night", amount: 300 },
      { label: "Breakfast x 1", amount: 50 },
      { label: "Laundry service", amount: 40 },
      { label: "Tax (5%)", amount: 19.5 },
      { label: "Loyalty discount", amount: 0, tone: "success" },
    ],
  },
  {
    id: "departure-1043",
    guestName: "Omar Saad",
    initials: "OS",
    avatarBg: "#E6F1FB",
    avatarColor: "#185FA5",
    roomLabel: "Room 105",
    bookingId: "#1043",
    nationality: "Egyptian",
    staySummary: "1 guest · Business",
    paymentStatus: "Paid",
    totalDue: 300,
    billItems: [{ label: "Room 105 · Single · 1 night", amount: 300 }],
  },
  {
    id: "departure-1040",
    guestName: "Layla Ibrahim",
    initials: "LI",
    avatarBg: "#FAECE7",
    avatarColor: "#993C1D",
    roomLabel: "Room 203",
    bookingId: "#1040",
    nationality: "Egyptian",
    staySummary: "2 guests · Family visit",
    paymentStatus: "Pending",
    totalDue: 950,
    billItems: [
      { label: "Room 203 · Double · 2 nights", amount: 900 },
      { label: "Breakfast", amount: 50 },
    ],
  },
  {
    id: "departure-1045",
    guestName: "Nada Khalil",
    initials: "NK",
    avatarBg: "#EEEDFE",
    avatarColor: "#534AB7",
    roomLabel: "Room 204",
    bookingId: "#1045",
    nationality: "Egyptian",
    staySummary: "1 guest · Leisure",
    paymentStatus: "Paid",
    totalDue: 300,
    billItems: [{ label: "Room 204 · Single · 1 night", amount: 300 }],
  },
];

export const CHECK_OUT_ALERTS: CheckoutAlert[] = [
  {
    id: "alert-206",
    message: "Room 206 — expected 12:00, still occupied. Extra charge may apply.",
  },
];

