import { auth } from "@/lib/auth.server";
import type { Route } from "./+types/layout";
import { ROLES } from "@/lib/roles";
import { Outlet, redirect, useLoaderData } from "react-router";
import { Sidebar } from "@/components/dashboard/sidebar";
import type { User } from "@/lib/auth-client";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session?.user?.role !== ROLES.ACCOUNTANT) {
    throw redirect("/");
  }

  return { user: session.user };
}

// Auth check only needs to happen once when the layout first loads —
// child routes have no loaders and fetch data client-side via tRPC.
export function shouldRevalidate() {
  return false;
}

export default function AccountantLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div
      className="flex h-screen overflow-hidden font-body"
      style={{ background: "oklch(0.13 0.01 60)" }}
    >
      <Sidebar user={user as unknown as User} role="accountant" />
      <Outlet />
    </div>
  );
}
