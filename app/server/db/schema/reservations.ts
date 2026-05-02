import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { guests } from "./guests";
import { rooms } from "./rooms";
import { bills } from "./bills";
import { reservationServices } from "./reservation-services";

export const reservationStatus = pgEnum("reservation_status", [
  "new",
  "checked-in",
  "cancelled",
  "checked-out",
]);

export const reservations = pgTable("reservations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  guestId: integer("guest_id")
    .notNull()
    .references(() => guests.id, { onDelete: "cascade" }),
  roomId: integer("room_id")
    .notNull()
    .references(() => rooms.id, { onDelete: "restrict" }),

  numberOfGuests: integer("number_of_guests").notNull(),
  checkInAt: timestamp("check_in_date").notNull(),
  checkOutAt: timestamp("check_out_date").notNull(),

  status: reservationStatus("status").notNull().default("new"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const reservationsRelations = relations(
  reservations,
  ({ one, many }) => ({
    guest: one(guests, {
      fields: [reservations.guestId],
      references: [guests.id],
    }),
    room: one(rooms, {
      fields: [reservations.roomId],
      references: [rooms.id],
    }),
    bills: many(bills),
    services: many(reservationServices),
  }),
);
