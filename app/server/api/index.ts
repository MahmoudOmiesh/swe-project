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

export const managerProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.session?.user.role !== ROLES.MANAGER) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});

export const receptionistProcedure = t.procedure.use(({ ctx, next }) => {
  if (ctx.session?.user.role !== ROLES.RECEPTIONIST) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx });
});
