import { relations } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const supplierOrderStatus = pgEnum("supplier_order_status", [
  "pending",
  "finished",
]);

export const suppliers = pgTable("suppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const supplierOrders = pgTable("supplier_orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: supplierOrderStatus("status").notNull().default("pending"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  orders: many(supplierOrders),
}));

export const supplierOrdersRelations = relations(
  supplierOrders,
  ({ one }) => ({
    supplier: one(suppliers, {
      fields: [supplierOrders.supplierId],
      references: [suppliers.id],
    }),
  }),
);
