import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { reservations } from "./reservations";

export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
]);

export const paymentMethod = pgEnum("payment_method", [
  "cash",
  "card",
  "bank_transfer",
  "other",
]);

export const bills = pgTable("bills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  reservationId: integer("reservation_id")
    .notNull()
    .unique()
    .references(() => reservations.id, { onDelete: "cascade" }),

  roomRate: numeric("room_rate", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  extraServices: numeric("extra_services", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),

  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),

  paymentStatus: paymentStatus("payment_status").notNull(),
  paymentMethod: paymentMethod("payment_method").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const billsRelations = relations(bills, ({ one }) => ({
  reservation: one(reservations, {
    fields: [bills.reservationId],
    references: [reservations.id],
  }),
}));
