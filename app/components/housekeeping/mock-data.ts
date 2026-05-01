import { colors } from "@/components/dashboard/theme";

export interface HousekeepingMetric {
  label: string;
  value: number;
  valueColor: string;
}

export interface HousekeepingTask {
  id: string;
  room: string;
  title: string;
  subtitle: string;
  time: string;
  statusLabel: string;
  statusTone: "urgent" | "normal" | "done";
}

export interface MaintenanceIssue {
  id: string;
  room: string;
  title: string;
  reportedAt: string;
  estimate: string;
}

export interface StaffProgress {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  floor: string;
  progressLabel: string;
  progress: number;
}

export const HOUSEKEEPING_METRICS: HousekeepingMetric[] = [
  { label: "To clean", value: 5, valueColor: colors.status.cleaning.text },
  { label: "Cleaned today", value: 8, valueColor: colors.status.available.text },
  { label: "Maintenance", value: 2, valueColor: colors.status.maintenance.text },
  { label: "Urgent", value: 1, valueColor: colors.status.occupied.text },
];

export const HOUSEKEEPING_TASKS: HousekeepingTask[] = [
  { id: "task-104", room: "104", title: "Guest checked out", subtitle: "Double · Floor 1", time: "08:45", statusLabel: "Urgent", statusTone: "urgent" },
  { id: "task-205", room: "205", title: "Guest checked out", subtitle: "Double · Floor 2", time: "09:10", statusLabel: "Normal", statusTone: "normal" },
  { id: "task-306", room: "306", title: "Routine cleaning", subtitle: "Double · Floor 3", time: "10:00", statusLabel: "Normal", statusTone: "normal" },
  { id: "task-201", room: "201", title: "Cleaned & ready", subtitle: "Double · Floor 2", time: "07:30", statusLabel: "Done", statusTone: "done" },
  { id: "task-202", room: "202", title: "Cleaned & ready", subtitle: "Suite · Floor 2", time: "07:45", statusLabel: "Done", statusTone: "done" },
];

export const MAINTENANCE_ISSUES: MaintenanceIssue[] = [
  { id: "issue-108", room: "Room 108", title: "AC not working", reportedAt: "Reported 24 Apr", estimate: "Est. 2 days" },
  { id: "issue-303", room: "Room 303", title: "Plumbing issue", reportedAt: "Reported 23 Apr", estimate: "Est. 3 days" },
];

export const STAFF_ON_DUTY: StaffProgress[] = [
  { id: "staff-fatma", name: "Fatma Ali", initials: "FA", avatarBg: "#E1F5EE", avatarColor: "#0F6E56", floor: "Floor 1", progressLabel: "3/4 tasks done", progress: 75 },
  { id: "staff-sami", name: "Sami Khalil", initials: "SK", avatarBg: "#EEEDFE", avatarColor: "#534AB7", floor: "Floor 2", progressLabel: "2/3 tasks done", progress: 67 },
  { id: "staff-nadia", name: "Nadia Ragab", initials: "NR", avatarBg: "#FBEAF0", avatarColor: "#72243E", floor: "Floor 3", progressLabel: "1/2 tasks done", progress: 50 },
];

export const LOW_SUPPLIES_ALERT = {
  message: "Towels and toiletries running low on Floor 2. Request restock from supplier?",
};

