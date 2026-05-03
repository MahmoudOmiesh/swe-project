// Interfaces kept for reference / type-safety in tests.
// All data is now served from the database via tRPC.

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
}

export interface StaffProgress {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  progressLabel: string;
  progress: number;
}
