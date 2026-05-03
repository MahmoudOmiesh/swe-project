import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { suppliers, supplierOrders } from "@/server/db/schema";

/** List all suppliers with their orders. */
export async function listSuppliers() {
  return db.query.suppliers.findMany({
    with: { orders: { orderBy: (o, { desc }) => [desc(o.createdAt)] } },
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });
}

/** Get a single supplier by ID with orders. */
export async function getSupplierById(id: number) {
  return db.query.suppliers.findFirst({
    where: eq(suppliers.id, id),
    with: { orders: { orderBy: (o, { desc }) => [desc(o.createdAt)] } },
  });
}

/** Create a new supplier. */
export async function createSupplier(data: {
  name: string;
  category: string;
  phone: string;
  notes?: string;
}) {
  const [row] = await db.insert(suppliers).values(data).returning();
  return row;
}

/** Update a supplier. */
export async function updateSupplier(
  id: number,
  data: Partial<{
    name: string;
    category: string;
    phone: string;
    notes: string;
  }>,
) {
  const [row] = await db
    .update(suppliers)
    .set(data)
    .where(eq(suppliers.id, id))
    .returning();
  return row;
}

/** Delete a supplier and its orders. */
export async function deleteSupplier(id: number) {
  await db.delete(supplierOrders).where(eq(supplierOrders.supplierId, id));
  const [row] = await db
    .delete(suppliers)
    .where(eq(suppliers.id, id))
    .returning();
  return row;
}

/** Create an order for a supplier. */
export async function createSupplierOrder(data: {
  supplierId: number;
  title: string;
  amount: string;
}) {
  const [order] = await db
    .insert(supplierOrders)
    .values({ ...data, status: "pending" })
    .returning();
  return order;
}

/** Mark an order as finished. */
export async function finishSupplierOrder(orderId: number) {
  const [order] = await db
    .update(supplierOrders)
    .set({ status: "finished" })
    .where(eq(supplierOrders.id, orderId))
    .returning();
  return order;
}
