import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { managerProcedure, router } from "@/server/api";
import { ROLES } from "@/lib/roles";
import { listUsers, updateUserRole } from "@/server/db/data-access/users";

/** Roles a manager is allowed to assign through this UI. */
const ASSIGNABLE_ROLES = [
  ROLES.RECEPTIONIST,
  ROLES.HOUSEKEEPING,
  ROLES.ACCOUNTANT,
] as const;

export const usersRouter = router({
  /** List every user with their current role. Manager only. */
  list: managerProcedure.query(async () => {
    const rows = await listUsers();
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
    }));
  }),

  /** Set a user's role to either receptionist or housekeeping. Manager only. */
  setRole: managerProcedure
    .input(
      z.object({
        id: z.string().min(1),
        role: z.enum(ASSIGNABLE_ROLES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Don't let a manager demote themselves through this screen.
      if (ctx.session?.user.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot change your own role.",
        });
      }

      const row = await updateUserRole(input.id, input.role);
      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      return { id: row.id, role: row.role };
    }),
});
