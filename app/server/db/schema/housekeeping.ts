import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { rooms } from "./rooms";

export const taskType = pgEnum("housekeeping_task_type", [
  "cleaning",
  "maintenance",
]);

export const taskPriority = pgEnum("housekeeping_task_priority", [
  "low",
  "medium",
  "high",
]);

export const taskStatus = pgEnum("housekeeping_task_status", [
  "pending",
  "in_progress",
  "done",
]);

// ─── Housekeeping staff ─────────────────────────────────────────────────────

export const housekeepingStaff = pgTable("housekeeping_staff", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  phone: text("phone"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const housekeepingStaffRelations = relations(
  housekeepingStaff,
  ({ many }) => ({
    tasks: many(housekeepingTasks),
  }),
);

// ─── Housekeeping tasks (cleaning + maintenance) ────────────────────────────

export const housekeepingTasks = pgTable("housekeeping_tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "cascade" }),
  assignedToId: integer("assigned_to_id").references(
    () => housekeepingStaff.id,
    { onDelete: "set null" },
  ),
  type: taskType("type").notNull(),
  title: text("title").notNull(),
  priority: taskPriority("priority").notNull().default("medium"),
  status: taskStatus("status").notNull().default("pending"),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const housekeepingTasksRelations = relations(
  housekeepingTasks,
  ({ one }) => ({
    room: one(rooms, {
      fields: [housekeepingTasks.roomId],
      references: [rooms.id],
    }),
    assignedTo: one(housekeepingStaff, {
      fields: [housekeepingTasks.assignedToId],
      references: [housekeepingStaff.id],
    }),
  }),
);
