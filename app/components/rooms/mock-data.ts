import type { RoomStatus } from "@/components/dashboard/theme";

// ─── Room type ────────────────────────────────────────────────────────────────

export type RoomType = "single" | "double" | "suite";

export const roomTypeLabel: Record<RoomType, string> = {
  single: "Single room",
  double: "Double room",
  suite:  "Suite",
};

export const roomTypeRate: Record<RoomType, number> = {
  single: 300,
  double: 450,
  suite:  750,
};

// ─── Room record ──────────────────────────────────────────────────────────────

export interface RoomRecord {
  id:       number;
  number:   string;
  floor:    number;
  type:     RoomType;
  status:   RoomStatus;
  capacity: number;
  // only present when occupied
  guest?: {
    name:       string;
    initials:   string;
    avatarBg:   string;
    avatarColor:string;
    bookingId:  string;
    checkIn:    string;
    checkOut:   string;
    services:   string[];
    isLoyal?:   boolean;
  };
  // only present when under maintenance
  maintenanceNote?: string;
}

// ─── Mock rooms ───────────────────────────────────────────────────────────────

export const MOCK_ROOM_RECORDS: RoomRecord[] = [
  // Floor 1
  {
    id: 1, number: "101", floor: 1, type: "double", status: "occupied", capacity: 2,
    guest: { name: "Ahmed Kamel", initials: "AK", avatarBg: "#EEEDFE", avatarColor: "#534AB7", bookingId: "#1038", checkIn: "25 Apr 2026", checkOut: "27 Apr 2026", services: ["Breakfast", "Laundry"] },
  },
  {
    id: 2, number: "102", floor: 1, type: "single", status: "occupied", capacity: 1,
    guest: { name: "Nour Hamdy", initials: "NH", avatarBg: "#E1F5EE", avatarColor: "#0F6E56", bookingId: "#1040", checkIn: "24 Apr 2026", checkOut: "26 Apr 2026", services: ["Breakfast"] },
  },
  { id: 3,  number: "103", floor: 1, type: "single", status: "available",   capacity: 1 },
  { id: 4,  number: "104", floor: 1, type: "double", status: "cleaning",    capacity: 2 },
  {
    id: 5, number: "105", floor: 1, type: "single", status: "occupied", capacity: 1,
    guest: { name: "Omar Saad", initials: "OS", avatarBg: "#E6F1FB", avatarColor: "#185FA5", bookingId: "#1043", checkIn: "22 Apr 2026", checkOut: "28 Apr 2026", services: [] },
  },
  { id: 6,  number: "106", floor: 1, type: "double", status: "available",   capacity: 2 },
  {
    id: 7, number: "107", floor: 1, type: "single", status: "occupied", capacity: 1,
    guest: { name: "Mohamed Hassan", initials: "MH", avatarBg: "#F5EDD8", avatarColor: "#7A5018", bookingId: "#1041", checkIn: "24 Apr 2026", checkOut: "25 Apr 2026", services: [] },
  },
  { id: 8,  number: "108", floor: 1, type: "double", status: "maintenance", capacity: 2, maintenanceNote: "AC repair — est. 2 days" },
  // Floor 2
  { id: 9,  number: "201", floor: 2, type: "double", status: "available",   capacity: 2 },
  {
    id: 10, number: "202", floor: 2, type: "suite", status: "occupied", capacity: 3,
    guest: { name: "Sara Ramadan", initials: "SR", avatarBg: "#E1F5EE", avatarColor: "#0F6E56", bookingId: "#1039", checkIn: "23 Apr 2026", checkOut: "28 Apr 2026", services: ["Breakfast", "Airport transfer"], isLoyal: true },
  },
  {
    id: 11, number: "203", floor: 2, type: "double", status: "occupied", capacity: 2,
    guest: { name: "Layla Ibrahim", initials: "LI", avatarBg: "#FAECE7", avatarColor: "#993C1D", bookingId: "#1044", checkIn: "24 Apr 2026", checkOut: "27 Apr 2026", services: ["Breakfast"] },
  },
  { id: 12, number: "204", floor: 2, type: "single", status: "cleaning",    capacity: 1 },
  {
    id: 13, number: "205", floor: 2, type: "double", status: "occupied", capacity: 2,
    guest: { name: "Rania Mostafa", initials: "RM", avatarBg: "#FBEAF0", avatarColor: "#72243E", bookingId: "#1042", checkIn: "26 Apr 2026", checkOut: "29 Apr 2026", services: [] },
  },
  { id: 14, number: "206", floor: 2, type: "double", status: "available",   capacity: 2 },
  { id: 15, number: "207", floor: 2, type: "single", status: "available",   capacity: 1 },
  {
    id: 16, number: "208", floor: 2, type: "double", status: "occupied", capacity: 2,
    guest: { name: "Khaled Amin", initials: "KA", avatarBg: "#F1EFE8", avatarColor: "#5F5E5A", bookingId: "#1045", checkIn: "25 Apr 2026", checkOut: "28 Apr 2026", services: ["Laundry"] },
  },
  // Floor 3
  {
    id: 17, number: "301", floor: 3, type: "double", status: "occupied", capacity: 2,
    guest: { name: "Hana Youssef", initials: "HY", avatarBg: "#E6F1FB", avatarColor: "#185FA5", bookingId: "#1046", checkIn: "25 Apr 2026", checkOut: "30 Apr 2026", services: ["Breakfast"] },
  },
  {
    id: 18, number: "302", floor: 3, type: "double", status: "occupied", capacity: 2,
    guest: { name: "Tarek Nasser", initials: "TN", avatarBg: "#EEEDFE", avatarColor: "#534AB7", bookingId: "#1047", checkIn: "24 Apr 2026", checkOut: "27 Apr 2026", services: [] },
  },
  { id: 19, number: "303", floor: 3, type: "suite",  status: "maintenance", capacity: 3, maintenanceNote: "Plumbing — est. 3 days" },
  { id: 20, number: "304", floor: 3, type: "single", status: "available",   capacity: 1 },
  {
    id: 21, number: "305", floor: 3, type: "suite", status: "occupied", capacity: 3,
    guest: { name: "Sara Ramadan (2nd stay)", initials: "SR", avatarBg: "#E1F5EE", avatarColor: "#0F6E56", bookingId: "#1048", checkIn: "25 Apr 2026", checkOut: "28 Apr 2026", services: ["Breakfast"], isLoyal: true },
  },
  { id: 22, number: "306", floor: 3, type: "double", status: "cleaning",    capacity: 2 },
  {
    id: 23, number: "307", floor: 3, type: "double", status: "occupied", capacity: 2,
    guest: { name: "Amr Fawzy", initials: "AF", avatarBg: "#FAECE7", avatarColor: "#993C1D", bookingId: "#1049", checkIn: "23 Apr 2026", checkOut: "26 Apr 2026", services: [] },
  },
  { id: 24, number: "308", floor: 3, type: "single", status: "available",   capacity: 1 },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

/** Group rooms by floor number */
export function groupByFloor(rooms: RoomRecord[]): Map<number, RoomRecord[]> {
  return rooms.reduce((acc, room) => {
    const list = acc.get(room.floor) ?? [];
    list.push(room);
    acc.set(room.floor, list);
    return acc;
  }, new Map<number, RoomRecord[]>());
}

/** Count rooms by status */
export function countByStatus(rooms: RoomRecord[]): Record<RoomStatus, number> {
  return rooms.reduce(
    (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
    { occupied: 0, available: 0, cleaning: 0, maintenance: 0 } as Record<RoomStatus, number>,
  );
}
