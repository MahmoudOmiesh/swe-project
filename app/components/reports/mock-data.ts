import { colors } from "@/components/dashboard/theme";

export interface ReportKpi {
  label: string;
  value: string;
  sub: string;
  subTone?: "positive" | "negative" | "neutral";
}

export interface DailyRevenuePoint {
  day: string;
  amount: number;
  highlighted?: boolean;
}

export interface FloorOccupancy {
  floor: string;
  percent: number;
  ratio: string;
}

export interface RevenueSource {
  label: string;
  amount: number;
  color: string;
}

export interface TopRoom {
  room: string;
  details: string;
  guest: string;
  amount: number;
}

export interface SummaryRow {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral" | "gold";
}

export const REPORT_KPIS: ReportKpi[] = [
  { label: "Total revenue", value: "EGP 42,150", sub: "↑ 12% vs last week", subTone: "positive" },
  { label: "Avg. occupancy", value: "74%", sub: "↑ 6% vs last week", subTone: "positive" },
  { label: "Total bookings", value: "38", sub: "↓ 3% vs last week", subTone: "negative" },
  { label: "Avg. stay length", value: "2.4 nights", sub: "- same as last week", subTone: "neutral" },
];

export const DAILY_REVENUE: DailyRevenuePoint[] = [
  { day: "Sun", amount: 4800 },
  { day: "Mon", amount: 6100 },
  { day: "Tue", amount: 4200 },
  { day: "Wed", amount: 8400 },
  { day: "Thu", amount: 5600 },
  { day: "Fri", amount: 6700, highlighted: true },
  { day: "Sat", amount: 5100 },
];

export const FLOOR_OCCUPANCY: FloorOccupancy[] = [
  { floor: "F1", percent: 83, ratio: "10/12" },
  { floor: "F2", percent: 67, ratio: "8/12" },
  { floor: "F3", percent: 58, ratio: "7/12" },
];

export const REVENUE_SOURCES: RevenueSource[] = [
  { label: "Rooms", amount: 28620, color: colors.gold },
  { label: "Restaurant", amount: 8400, color: "#97C459" },
  { label: "Laundry", amount: 3360, color: "#85B7EB" },
  { label: "Other", amount: 1770, color: "#AFA9EC" },
];

export const TOP_ROOMS: TopRoom[] = [
  { room: "305", details: "Suite · Floor 3", guest: "5 nights · Sara R.", amount: 3375 },
  { room: "202", details: "Suite · Floor 2", guest: "4 nights · A. Kamel", amount: 1800 },
  { room: "105", details: "Single · Floor 1", guest: "6 nights · O. Saad", amount: 1800 },
  { room: "203", details: "Double · Floor 2", guest: "3 nights · L. Ibrahim", amount: 1350 },
];

export const BOOKING_SUMMARY: SummaryRow[] = [
  { label: "New bookings", value: "12" },
  { label: "Confirmed", value: "22", tone: "positive" },
  { label: "Cancelled", value: "4", tone: "negative" },
  { label: "Pending payment", value: "3" },
  { label: "Loyal guests", value: "6", tone: "gold" },
  { label: "Avg. booking value", value: "EGP 1,109", tone: "gold" },
];

export const HOUSEKEEPING_SUMMARY: SummaryRow[] = [
  { label: "Tasks completed", value: "31", tone: "positive" },
  { label: "Avg. clean time", value: "24 min" },
  { label: "Maintenance open", value: "2", tone: "negative" },
  { label: "Rooms restocked", value: "18" },
  { label: "Supplier orders", value: "3" },
  { label: "Staff on duty", value: "3" },
];

