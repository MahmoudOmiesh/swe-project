import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  date,
  boolean,
} from "drizzle-orm/pg-core";
import { reservations } from "./reservations";

export const guests = pgTable("guests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  nationality: text("nationality").notNull(),
  nationalityId: text("nationality_id").notNull(),
  phone: text("phone"),
  address: text("address"),
  dob: date("dob"),
  isLoyal: boolean("is_loyal").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const guestsRelations = relations(guests, ({ many }) => ({
  reservations: many(reservations),
}));
