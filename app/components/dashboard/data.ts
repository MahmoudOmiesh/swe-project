export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";
export type GuestStatus = "checkin" | "staying" | "checkout";
export type NotifType = "warn" | "info" | "alert";

export interface Room {
  number: string;
  status: RoomStatus;
}

export interface LegendItem {
  status: RoomStatus;
  label: string;
  count: number;
}

export interface Guest {
  id: number;
  initials: string;
  name: string;
  room: string;
  type: string;
  bookingId: string;
  status: GuestStatus;
  avatarBg: string;
  avatarColor: string;
  note?: string;
}

export interface NotificationItem {
  id: number;
  type: NotifType;
  message: string;
  time: string;
}

export interface OccupancyDay {
  label: string;
  value: number;
  current?: boolean;
}

export const ROOM_STATUS_STYLES: Record<
  RoomStatus,
  { bg: string; color: string; border: string }
> = {
  occupied: { bg: "#F5EDD8", color: "#7A5018", border: "#D4B07A" },
  available: { bg: "#EAF3DE", color: "#3B6D11", border: "#97C459" },
  cleaning: { bg: "#E6F1FB", color: "#185FA5", border: "#85B7EB" },
  maintenance: { bg: "#FCEBEB", color: "#A32D2D", border: "#F09595" },
};

export const ROOM_STATUS_LABELS: LegendItem[] = [
  { status: "occupied", label: "Occupied", count: 13 },
  { status: "available", label: "Available", count: 7 },
  { status: "cleaning", label: "Cleaning", count: 3 },
  { status: "maintenance", label: "Maintenance", count: 2 },
];

export const ROOMS: Room[] = [
  { number: "101", status: "occupied" },
  { number: "102", status: "occupied" },
  { number: "103", status: "available" },
  { number: "104", status: "cleaning" },
  { number: "105", status: "occupied" },
  { number: "106", status: "available" },
  { number: "107", status: "occupied" },
  { number: "108", status: "maintenance" },
  { number: "201", status: "available" },
  { number: "202", status: "occupied" },
  { number: "203", status: "occupied" },
  { number: "204", status: "available" },
  { number: "205", status: "cleaning" },
  { number: "206", status: "occupied" },
  { number: "207", status: "available" },
  { number: "208", status: "occupied" },
  { number: "301", status: "occupied" },
  { number: "302", status: "occupied" },
  { number: "303", status: "maintenance" },
  { number: "304", status: "available" },
  { number: "305", status: "occupied" },
  { number: "306", status: "cleaning" },
  { number: "307", status: "occupied" },
  { number: "308", status: "available" },
];

export const GUEST_STATUS_LABELS: Record<GuestStatus, string> = {
  checkin: "Check-in",
  staying: "Staying",
  checkout: "Check-out",
};

export const GUEST_STATUS_STYLES: Record<
  GuestStatus,
  { bg: string; color: string }
> = {
  checkin: { bg: "#EAF3DE", color: "#3B6D11" },
  staying: { bg: "#F5EDD8", color: "#7A5018" },
  checkout: { bg: "#FCEBEB", color: "#A32D2D" },
};

export const GUESTS: Guest[] = [
  {
    id: 1,
    initials: "MA",
    name: "Mohammed Ali",
    room: "202",
    type: "Double",
    bookingId: "#1038",
    status: "checkin",
    avatarBg: "#EEEDFE",
    avatarColor: "#534AB7",
  },
  {
    id: 2,
    initials: "MO",
    name: "Mahmoud Omiesh",
    room: "305",
    type: "Suite",
    bookingId: "#1039",
    status: "staying",
    avatarBg: "#E1F5EE",
    avatarColor: "#0F6E56",
    note: "loyal guest",
  },
  {
    id: 3,
    initials: "HZ",
    name: "Hazeloum",
    room: "107",
    type: "Single",
    bookingId: "#1041",
    status: "checkout",
    avatarBg: "#F5EDD8",
    avatarColor: "#7A5018",
  },
];

export const NOTIFICATION_STYLES: Record<
  NotifType,
  { border: string; iconBg: string; iconColor: string; symbol: string }
> = {
  warn: { border: "#B8965A", iconBg: "#F5EDD8", iconColor: "#7A5018", symbol: "!" },
  info: { border: "#85B7EB", iconBg: "#E6F1FB", iconColor: "#185FA5", symbol: "i" },
  alert: { border: "#F09595", iconBg: "#FCEBEB", iconColor: "#A32D2D", symbol: "x" },
};

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: "warn",
    message: "Room 206 checkout at 12:00 — late fee may apply",
    time: "8 mins ago",
  },
  {
    id: 2,
    type: "info",
    message: "Housekeeping completed rooms 201, 202",
    time: "22 mins ago",
  },
  {
    id: 3,
    type: "alert",
    message: "Payment pending — Booking #1042",
    time: "1 hr ago",
  },
];

export const OCCUPANCY_DAYS: OccupancyDay[] = [
  { label: "Sun", value: 62 },
  { label: "Mon", value: 75 },
  { label: "Tue", value: 55 },
  { label: "Wed", value: 88 },
  { label: "Thu", value: 70 },
  { label: "Fri", value: 74, current: true },
  { label: "Sat", value: 80 },
];
