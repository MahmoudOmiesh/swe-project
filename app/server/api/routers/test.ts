import { publicProcedure, router } from "@/server/api";

export const testRouter = router({
  hello: publicProcedure.query(() => "Hello, world!"),
});
