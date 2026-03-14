import { createCallerFactory, createTRPCContext } from "@/server/api";
import { appRouter } from "@/server/api/routers";
import { type LoaderFunctionArgs } from "react-router";

const createContext = (opts: { headers: Headers }) => {
  const headers = new Headers(opts.headers);
  headers.set("x-trpc-source", "server-loader");
  return createTRPCContext({
    headers,
  });
};

const createCaller = createCallerFactory(appRouter);
export const caller = async (loaderArgs: LoaderFunctionArgs) =>
  createCaller(await createContext({ headers: loaderArgs.request.headers }));
