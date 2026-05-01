import { Link } from "react-router";
import { colors } from "@/components/dashboard/theme";

interface FrontDeskTabsProps {
  basePath: string;
  active: "checkin" | "checkout";
}

export function FrontDeskTabs({ basePath, active }: FrontDeskTabsProps) {
  return (
    <div
      className="inline-flex rounded-full p-[3px]"
      style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}
    >
      {[
        { key: "checkin", label: "Check-in" },
        { key: "checkout", label: "Check-out" },
      ].map((tab) => {
        const isActive = active === tab.key;

        return (
          <Link
            key={tab.key}
            to={`${basePath}/${tab.key}`}
            className="rounded-full px-4 py-[6px] text-[11px] font-medium"
            style={{
              background: isActive ? colors.gold : "transparent",
              color: isActive ? "#fff" : colors.textMuted,
              textDecoration: "none",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

