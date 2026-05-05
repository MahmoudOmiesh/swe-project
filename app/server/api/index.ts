import superjson from "superjson";

import z, { ZodError } from "zod";
import { initTRPC, TRPCError } from "@trpc/server";

import { auth } from "@/lib/auth.server";
import { ROLES } from "@/lib/roles";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    session,
  };
};
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError ? z.treeifyError(error.cause) : null,
    },
  }),
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Shared procedure for any authenticated staff member (manager OR receptionist).
 * Use this for all operations that both roles can perform.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const role = ctx.session?.user.role;
  if (role !== ROLES.MANAGER && role !== ROLES.RECEPTIONIST) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

/** Procedure restricted to managers only. */
export const managerProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.session?.user.role !== ROLES.MANAGER) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

/** Procedure restricted to receptionists only. */
export const receptionistProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.session?.user.role !== ROLES.RECEPTIONIST) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

/**
 * Procedure for the housekeeping role. Re-exposes the session as
 * non-nullable so handlers can access `ctx.session.user.id` directly.
 */
export const housekeepingProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.session?.user.role !== ROLES.HOUSEKEEPING) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
