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
    layout("routes/manager/layout.tsx", [
      index("routes/manager/index.tsx"),
      route("rooms", "routes/manager/rooms.tsx"),
      route("bookings", "routes/manager/bookings.tsx"),
    ]),
  ]),

  ...prefix("receptionist", [
    layout("routes/receptionist/layout.tsx", [
      index("routes/receptionist/index.tsx"),
      route("rooms", "routes/receptionist/rooms.tsx"),
      route("bookings", "routes/receptionist/bookings.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
