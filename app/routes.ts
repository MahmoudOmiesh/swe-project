import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/api/auth/*", "routes/api/auth.ts"),
  route("/api/trpc/*", "routes/api/trpc.ts"),

  index("routes/redirect.tsx"),
  route("/login", "routes/login.tsx"),

  ...prefix("manager", [
    layout("routes/manager/layout.tsx", [index("routes/manager/index.tsx")]),
  ]),

  ...prefix("receptionist", [
    layout("routes/receptionist/layout.tsx", [
      index("routes/receptionist/index.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
