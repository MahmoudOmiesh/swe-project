import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { reservations } from "./reservations";

export const roomType = pgEnum("room_type", ["single", "double", "suite"]);
export const roomServiceMode = pgEnum("room_service_mode", [
  "cleaning",
  "maintenance",
]);

export const rooms = pgTable("rooms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  number: text("room_number").notNull().unique(),
  type: roomType("type").notNull(),
  floor: integer("floor").notNull().default(1),
  capacity: integer("capacity").notNull().default(1),
  ratePerNight: integer("rate_per_night").notNull().default(0),
  serviceMode: roomServiceMode("service_mode"),
  maintenanceNote: text("maintenance_note"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const roomsRelations = relations(rooms, ({ many }) => ({
  reservations: many(reservations),
}));
