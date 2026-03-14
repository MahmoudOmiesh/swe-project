import { router } from "@/server/api";
import { testRouter } from "./test";

export const appRouter = router({
  test: testRouter,
});

export type AppRouter = typeof appRouter;
