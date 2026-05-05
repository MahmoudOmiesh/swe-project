import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { financeProcedure, protectedProcedure, router } from "@/server/api";
import { EG_PHONE_RE, EG_PHONE_ERROR } from "@/utils/validation/phone";
import {
  listSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  createSupplierOrder,
  finishSupplierOrder,
} from "@/server/db/data-access/suppliers";

// ─── Helpers ───────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "#EAF3DE", color: "#3B6D11" },
  { bg: "#E8F2FF", color: "#205FA6" },
  { bg: "#FBEAF0", color: "#72243E" },
  { bg: "#FFF1DA", color: "#8E5A10" },
  { bg: "#EEEDFE", color: "#534AB7" },
  { bg: "#F1EFE8", color: "#5F5E5A" },
] as const;

function avatarColors(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(d: Date) {
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
}

/** Derive the display status from a supplier's orders. */
function deriveStatus(orders: { status: string }[]) {
  const hasPending = orders.some((o) => o.status === "pending");
  if (hasPending) return "Order pending" as const;
  return "Active" as const;
}

// ─── Router ────────────────────────────────────────────────────────────────

export const suppliersRouter = router({
  /** List all suppliers. */
  list: financeProcedure.query(async () => {
    const rows = await listSuppliers();
    return rows.map((s) => {
      const avatar = avatarColors(s.name);
      const lastOrder = s.orders[0];
      return {
        id: s.id,
        name: s.name,
        initials: getInitials(s.name),
        avatarBg: avatar.bg,
        avatarColor: avatar.color,
        category: s.category,
        status: deriveStatus(s.orders),
        lastOrder: lastOrder ? formatDate(lastOrder.createdAt) : "No orders yet",
        totalOrders: s.orders.length,
        avgDelivery: "—",
        phone: s.phone,
        notes: s.notes ?? "",
        orders: s.orders.map((o) => ({
          id: `#ORD-${o.id}`,
          title: o.title,
          date: formatDate(o.createdAt),
          status: o.status === "pending" ? ("Pending" as const) : ("Done" as const),
          amount: Number(o.amount),
        })),
      };
    });
  }),

  /** Get a single supplier by ID. */
  getById: financeProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const s = await getSupplierById(input.id);
      if (!s) return null;
      const avatar = avatarColors(s.name);
      const lastOrder = s.orders[0];
      return {
        id: s.id,
        name: s.name,
        initials: getInitials(s.name),
        avatarBg: avatar.bg,
        avatarColor: avatar.color,
        category: s.category,
        status: deriveStatus(s.orders),
        lastOrder: lastOrder ? formatDate(lastOrder.createdAt) : "No orders yet",
        totalOrders: s.orders.length,
        avgDelivery: "—",
        phone: s.phone,
        notes: s.notes ?? "",
        orders: s.orders.map((o) => ({
          id: `#ORD-${o.id}`,
          title: o.title,
          date: formatDate(o.createdAt),
          status: o.status === "pending" ? ("Pending" as const) : ("Done" as const),
          amount: Number(o.amount),
        })),
      };
    }),

  /** Create a new supplier. */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        phone: z.string().min(1).refine((v) => EG_PHONE_RE.test(v), EG_PHONE_ERROR),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const supplier = await createSupplier(input);
        return { id: supplier.id };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Failed to create supplier",
        });
      }
    }),

  /** Update a supplier. */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
        phone: z
          .string()
          .min(1)
          .refine((v) => EG_PHONE_RE.test(v), EG_PHONE_ERROR)
          .optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const supplier = await updateSupplier(id, data);
      if (!supplier) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Supplier not found",
        });
      }
      return { id: supplier.id };
    }),

  /** Delete a supplier. */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const supplier = await deleteSupplier(input.id);
      if (!supplier) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Supplier not found",
        });
      }
      return { id: supplier.id };
    }),

  /** Place an order for a supplier. */
  placeOrder: protectedProcedure
    .input(
      z.object({
        supplierId: z.number(),
        title: z.string().min(1),
        amount: z.number().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const order = await createSupplierOrder({
          supplierId: input.supplierId,
          title: input.title,
          amount: String(input.amount),
        });
        return { id: order.id };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Failed to place order",
        });
      }
    }),

  /** Mark an order as finished. */
  finishOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ input }) => {
      const order = await finishSupplierOrder(input.orderId);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }
      return { id: order.id };
    }),
});
