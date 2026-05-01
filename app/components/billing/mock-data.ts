import { colors } from "@/components/dashboard/theme";

export interface BillingSummary {
  label: string;
  value: string;
  accent?: string;
}

export interface BillingLineItem {
  label: string;
  amount: number;
  tone?: "default" | "success";
}

export interface InvoiceRecord {
  id: string;
  guestName: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  room: string;
  amount: number;
  status: "Pending" | "Paid";
  bookingId: string;
  lineItems: BillingLineItem[];
}

export const BILLING_SUMMARY: BillingSummary[] = [
  { label: "Revenue this week", value: "EGP 42,150" },
  { label: "Paid invoices", value: "9", accent: colors.status.available.text },
  { label: "Pending payments", value: "3", accent: colors.status.maintenance.text },
];

export const INVOICES: InvoiceRecord[] = [
  { id: "B-041", guestName: "Mohamed Hassan", initials: "MH", avatarBg: "#F5EDD8", avatarColor: "#7A5018", room: "107", amount: 409.5, status: "Pending", bookingId: "#1041", lineItems: [{ label: "Room 107 · Single · 1 night", amount: 300 }, { label: "Breakfast x 1", amount: 50 }, { label: "Laundry service", amount: 40 }, { label: "Tax (5%)", amount: 19.5 }, { label: "Discount", amount: 0, tone: "success" }] },
  { id: "B-040", guestName: "Omar Saad", initials: "OS", avatarBg: "#E6F1FB", avatarColor: "#185FA5", room: "105", amount: 1680, status: "Paid", bookingId: "#1043", lineItems: [{ label: "Room 105 · Single · 6 nights", amount: 1800 }, { label: "Discount", amount: 120, tone: "success" }] },
  { id: "B-039", guestName: "Layla Ibrahim", initials: "LI", avatarBg: "#FAECE7", avatarColor: "#993C1D", room: "203", amount: 1350, status: "Paid", bookingId: "#1040", lineItems: [{ label: "Room 203 · Double · 3 nights", amount: 1350 }] },
  { id: "B-038", guestName: "Sara Ramadan", initials: "SR", avatarBg: "#E1F5EE", avatarColor: "#0F6E56", room: "305", amount: 3375, status: "Paid", bookingId: "#1039", lineItems: [{ label: "Room 305 · Suite · 5 nights", amount: 3375 }] },
  { id: "B-037", guestName: "Ahmed Kamel", initials: "AK", avatarBg: "#EEEDFE", avatarColor: "#534AB7", room: "202", amount: 900, status: "Paid", bookingId: "#1038", lineItems: [{ label: "Room 202 · Double · 2 nights", amount: 900 }] },
  { id: "B-036", guestName: "Khaled Amin", initials: "KA", avatarBg: "#F1EFE8", avatarColor: "#5F5E5A", room: "204", amount: 900, status: "Paid", bookingId: "#1045", lineItems: [{ label: "Room 204 · Single · 3 nights", amount: 900 }] },
];

