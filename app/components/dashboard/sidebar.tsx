import { Link, useLocation, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient, type User } from "@/lib/auth-client";
import type { Role } from "@/lib/roles";

interface NavItem {
  label: string;
  href: string;
  color: string;
  badge?: number;
}
interface NavSection {
  label: string;
  items: NavItem[];
}

const managerNav: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/manager", color: "#B8965A" },
      { label: "Rooms",     href: "/manager/rooms", color: "#5DCAA5" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Bookings",     href: "/manager/bookings",     color: "#85B7EB" },
      { label: "Check-in",     href: "/manager/checkin",      color: "#5DCAA5" },
      { label: "Check-out",    href: "/manager/checkout",     color: "#D4B07A" },
      { label: "Housekeeping", href: "/manager/housekeeping", color: "#C0DD97" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Billing",   href: "/manager/billing",   color: "#AFA9EC" },
      { label: "Reports",   href: "/manager/reports",   color: "#F4C0D1" },
      { label: "Suppliers", href: "/manager/suppliers", color: "#FAC775" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Users", href: "/manager/users", color: "#85B7EB" },
    ],
  },
];

const receptionistNav: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/receptionist", color: "#B8965A" },
      { label: "Rooms",     href: "/receptionist/rooms", color: "#5DCAA5" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Bookings",  href: "/receptionist/bookings",  color: "#85B7EB" },
      { label: "Check-in",  href: "/receptionist/checkin",   color: "#5DCAA5" },
      { label: "Check-out", href: "/receptionist/checkout",  color: "#D4B07A" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Billing", href: "/receptionist/billing", color: "#AFA9EC" },
    ],
  },
];

const housekeepingNav: NavSection[] = [
  {
    label: "Today",
    items: [
      { label: "My tasks", href: "/housekeeping", color: "#C0DD97" },
    ],
  },
];

const accountantNav: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/accountant", color: "#B8965A" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Billing",  href: "/accountant/billing",   color: "#AFA9EC" },
      { label: "Reports",  href: "/accountant/reports",   color: "#F4C0D1" },
      { label: "Expenses", href: "/accountant/suppliers", color: "#FAC775" },
    ],
  },
];

interface SidebarProps {
  user: User;
  role: Role;
}

export function Sidebar({ user, role }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const nav =
    role === "manager"
      ? managerNav
      : role === "receptionist"
        ? receptionistNav
        : role === "accountant"
          ? accountantNav
          : housekeepingNav;
  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  async function handleSignOut() {
    try {
      await authClient.signOut();
      navigate("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign out");
    }
  }

  return (
    <aside className="hms-sidebar flex h-screen w-[190px] flex-shrink-0 flex-col">
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "0.5px solid rgba(184,150,90,0.22)" }}>
        <div className="font-display" style={{ fontSize: 15, color: "#F5EDD8" }}>Arafa Hotel</div>
        <div style={{ fontSize: 9, color: "#9C8B78", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>
          Management System
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {nav.map((section) => (
          <div key={section.label} style={{ borderBottom: "0.5px solid rgba(184,150,90,0.08)", marginBottom: 2 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.13em", textTransform: "uppercase", color: "#9C8B78", padding: "10px 14px 5px" }}>
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/manager" &&
                  item.href !== "/receptionist" &&
                  item.href !== "/housekeeping" &&
                  item.href !== "/accountant" &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  prefetch="intent"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 14px",
                    position: "relative",
                    background: isActive ? "rgba(184,150,90,0.14)" : "transparent",
                    borderLeft: isActive ? "2px solid #B8965A" : "2px solid transparent",
                    textDecoration: "none",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: isActive ? "#F5EDD8" : "#C8BDB0", fontWeight: isActive ? 500 : 400 }}>
                    {item.label}
                  </span>
                  {item.badge != null && (
                    <span style={{ marginLeft: "auto", fontSize: 9, background: "rgba(184,150,90,0.22)", color: "#D4B07A", padding: "1px 5px", borderRadius: 10 }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderTop: "0.5px solid rgba(184,150,90,0.15)" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#B8965A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 500, color: "#1A1612", flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: "#C8BDB0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
          <div style={{ fontSize: 9, color: "#9C8B78", textTransform: "capitalize" }}>{role}</div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: 4,
            background: "transparent",
            border: "0.5px solid rgba(184,150,90,0.22)",
            color: "#C8BDB0",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(184,150,90,0.14)";
            e.currentTarget.style.color = "#F5EDD8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#C8BDB0";
          }}
        >
          <LogOut size={13} />
        </button>
      </div>
    </aside>
  );
}
