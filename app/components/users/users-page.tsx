"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { ROLES } from "@/lib/roles";

type AssignableRole = typeof ROLES.RECEPTIONIST | typeof ROLES.HOUSEKEEPING;

const ROLE_OPTIONS: { value: AssignableRole; label: string }[] = [
  { value: ROLES.RECEPTIONIST, label: "Reception" },
  { value: ROLES.HOUSEKEEPING, label: "Housekeeping" },
];

function roleBadgeColors(role: string) {
  if (role === ROLES.MANAGER)
    return {
      bg: colors.goldPale,
      text: colors.status.occupied.text,
    };
  if (role === ROLES.RECEPTIONIST)
    return {
      bg: colors.status.cleaning.bg,
      text: colors.status.cleaning.text,
    };
  if (role === ROLES.HOUSEKEEPING)
    return {
      bg: colors.status.available.bg,
      text: colors.status.available.text,
    };
  return {
    bg: colors.cream2,
    text: colors.textSub,
  };
}

function prettyRole(role: string) {
  if (role === ROLES.RECEPTIONIST) return "Reception";
  if (role === ROLES.HOUSEKEEPING) return "Housekeeping";
  if (role === ROLES.MANAGER) return "Manager";
  return role;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function UsersPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const usersQuery = useQuery(trpc.hotel.users.list.queryOptions());
  const users = usersQuery.data ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const setRoleMutation = useMutation(
    trpc.hotel.users.setRole.mutationOptions({
      onSuccess: (_data, variables) => {
        toast.success(`Role updated to ${prettyRole(variables.role)}.`);
        void queryClient.invalidateQueries(
          trpc.hotel.users.list.queryFilter(),
        );
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update role.");
      },
      onSettled: () => {
        setPendingId(null);
      },
    }),
  );

  const visibleUsers = users.filter((u) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  if (usersQuery.isLoading) {
    return (
      <div className="hms-shell flex flex-1 items-center justify-center">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: colors.textMuted }}
        />
      </div>
    );
  }

  return (
    <div className="hms-shell flex flex-1 flex-col overflow-hidden">
      <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
        <h1 className="font-display text-[17px]" style={{ color: colors.text }}>
          Users
        </h1>
      </header>

      <div className="hms-shell flex flex-1 overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-[18px]">
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-[280px] rounded-full px-4 py-[8px] text-[11px] outline-none"
              style={{
                background: colors.cream2,
                border: `0.5px solid ${colors.border2}`,
                color: colors.text,
              }}
            />
            <div
              className="ml-auto text-[10px]"
              style={{ color: colors.textMuted }}
            >
              {visibleUsers.length}{" "}
              {visibleUsers.length === 1 ? "user" : "users"}
            </div>
          </div>

          {visibleUsers.length === 0 ? (
            <div
              className="py-12 text-center text-[12px]"
              style={{ color: colors.textMuted }}
            >
              No users found.
            </div>
          ) : (
            <div
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px]"
              style={{
                background: colors.cream,
                border: `0.5px solid ${colors.border2}`,
              }}
            >
              <div
                className="grid shrink-0 grid-cols-[1fr_1fr_140px_220px] gap-3 px-4 py-3 text-[9px] font-medium uppercase tracking-[0.12em]"
                style={{
                  color: colors.textMuted,
                  borderBottom: `0.5px solid ${colors.border2}`,
                }}
              >
                <div>Name</div>
                <div>Email</div>
                <div>Current role</div>
                <div>Set role</div>
              </div>

              <div className="flex-1 overflow-y-auto">
              {visibleUsers.map((u, idx) => {
                const badge = roleBadgeColors(u.role);
                const isManager = u.role === ROLES.MANAGER;
                const isPending =
                  pendingId === u.id && setRoleMutation.isPending;
                const isLast = idx === visibleUsers.length - 1;

                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1fr_1fr_140px_220px] items-center gap-3 px-4 py-3 text-[11px]"
                    style={{
                      borderBottom: isLast
                        ? undefined
                        : `0.5px solid ${colors.border2}`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-medium"
                        style={{
                          background: colors.cream2,
                          color: colors.textSub,
                          border: `0.5px solid ${colors.border2}`,
                        }}
                      >
                        {getInitials(u.name) || "?"}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="truncate font-medium"
                          style={{ color: colors.text }}
                        >
                          {u.name}
                        </div>
                      </div>
                    </div>

                    <div
                      className="truncate"
                      style={{ color: colors.textSub }}
                      title={u.email}
                    >
                      {u.email}
                    </div>

                    <div>
                      <span
                        className="inline-flex rounded-full px-2 py-[3px] text-[9px] font-medium"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {prettyRole(u.role)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isManager ? (
                        <span
                          className="text-[10px]"
                          style={{ color: colors.textMuted }}
                        >
                          Managers can&apos;t be reassigned here.
                        </span>
                      ) : (
                        <>
                          <select
                            value={
                              u.role === ROLES.RECEPTIONIST ||
                              u.role === ROLES.HOUSEKEEPING
                                ? u.role
                                : ""
                            }
                            disabled={isPending}
                            onChange={(event) => {
                              const next = event.target.value as AssignableRole;
                              if (!next || next === u.role) return;
                              setPendingId(u.id);
                              setRoleMutation.mutate({
                                id: u.id,
                                role: next,
                              });
                            }}
                            className="flex-1 rounded-full px-3 py-[6px] text-[11px] outline-none"
                            style={{
                              background: colors.cream2,
                              border: `0.5px solid ${colors.border2}`,
                              color: colors.text,
                            }}
                          >
                            <option value="" disabled>
                              Choose role…
                            </option>
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {isPending && (
                            <Loader2
                              size={14}
                              className="animate-spin"
                              style={{ color: colors.textMuted }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
