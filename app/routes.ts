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
      route("checkin", "routes/manager/checkin.tsx"),
      route("checkout", "routes/manager/checkout.tsx"),
      route("housekeeping", "routes/manager/housekeeping.tsx"),
      route("billing", "routes/manager/billing.tsx"),
      route("reports", "routes/manager/reports.tsx"),
      route("suppliers", "routes/manager/suppliers.tsx"),
      route("users", "routes/manager/users.tsx"),
    ]),
  ]),

  ...prefix("receptionist", [
    layout("routes/receptionist/layout.tsx", [
      index("routes/receptionist/index.tsx"),
      route("rooms", "routes/receptionist/rooms.tsx"),
      route("bookings", "routes/receptionist/bookings.tsx"),
      route("checkin", "routes/receptionist/checkin.tsx"),
      route("checkout", "routes/receptionist/checkout.tsx"),
      route("housekeeping", "routes/receptionist/housekeeping.tsx"),
      route("billing", "routes/receptionist/billing.tsx"),
      route("reports", "routes/receptionist/reports.tsx"),
      route("suppliers", "routes/receptionist/suppliers.tsx"),
    ]),
  ]),

  ...prefix("housekeeping", [
    layout("routes/housekeeping/layout.tsx", [
      index("routes/housekeeping/index.tsx"),
    ]),
  ]),

  ...prefix("accountant", [
    layout("routes/accountant/layout.tsx", [
      index("routes/accountant/index.tsx"),
      route("billing", "routes/accountant/billing.tsx"),
      route("reports", "routes/accountant/reports.tsx"),
      route("suppliers", "routes/accountant/suppliers.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
