"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useTRPC } from "@/utils/trpc/react";
import { colors } from "@/components/dashboard/theme";
import { FilterPill } from "./filter-pill";
import { SupplierStatus } from "./supplier-status";
import { AddSupplierModal } from "./add-supplier-modal";
import { PlaceOrderModal } from "./place-order-modal";

export function SuppliersPage() {
  const trpc = useTRPC();

  const { data: suppliers = [], isLoading } = useQuery(
    trpc.hotel.suppliers.list.queryOptions(),
  );

  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null,
  );
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);

  const selectedSupplier =
    suppliers.find((s) => s.id === selectedSupplierId) ?? suppliers[0] ?? null;

  const visibleSuppliers = suppliers
    .filter((supplier) => {
      if (filter === "All") return true;
      if (filter === "Active") return supplier.status === "Active";
      if (filter === "Pending order") return supplier.status === "Order pending";
      return false;
    })
    .filter((supplier) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return (
        supplier.name.toLowerCase().includes(query) ||
        supplier.category.toLowerCase().includes(query)
      );
    });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: colors.textMuted }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="hms-shell flex flex-1 flex-col overflow-hidden">
        <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
          <h1
            className="font-display text-[17px]"
            style={{ color: colors.text }}
          >
            Suppliers
          </h1>
          <button
            type="button"
            onClick={() => setIsAddSupplierModalOpen(true)}
            className="rounded-full px-4 py-[8px] text-[11px] font-medium"
            style={{ background: colors.gold, color: "#fff", border: "none" }}
          >
            + Add supplier
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 gap-4 overflow-y-auto p-[18px]">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search supplier, category..."
                  className="w-[240px] rounded-full px-4 py-[8px] text-[11px] outline-none"
                  style={{
                    background: colors.cream2,
                    border: `0.5px solid ${colors.border2}`,
                    color: colors.text,
                  }}
                />
                {["All", "Active", "Pending order"].map((item) => (
                  <FilterPill
                    key={item}
                    label={item}
                    active={filter === item}
                    onClick={() => setFilter(item)}
                  />
                ))}
              </div>

              {visibleSuppliers.length === 0 ? (
                <div
                  className="py-12 text-center text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  No suppliers found.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {visibleSuppliers.map((supplier) => {
                    const active = selectedSupplier?.id === supplier.id;
                    return (
                      <button
                        key={supplier.id}
                        onClick={() => setSelectedSupplierId(supplier.id)}
                        className="rounded-[16px] px-4 py-4 text-left"
                        style={{
                          background: colors.cream2,
                          border: `0.5px solid ${active ? colors.gold : colors.border2}`,
                        }}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-medium"
                              style={{
                                background: supplier.avatarBg,
                                color: supplier.avatarColor,
                              }}
                            >
                              {supplier.initials}
                            </div>
                            <div>
                              <div
                                className="text-[12px] font-medium"
                                style={{ color: colors.text }}
                              >
                                {supplier.name}
                              </div>
                              <div
                                className="text-[10px]"
                                style={{ color: colors.textMuted }}
                              >
                                {supplier.category}
                              </div>
                            </div>
                          </div>
                          <SupplierStatus status={supplier.status} />
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-[10px]">
                          <div>
                            <div style={{ color: colors.textMuted }}>
                              Last order
                            </div>
                            <div
                              className="mt-1 font-medium"
                              style={{ color: colors.text }}
                            >
                              {supplier.lastOrder}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: colors.textMuted }}>
                              Total orders
                            </div>
                            <div
                              className="mt-1 font-medium"
                              style={{ color: colors.text }}
                            >
                              {supplier.totalOrders}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: colors.textMuted }}>
                              Avg. delivery
                            </div>
                            <div
                              className="mt-1 font-medium"
                              style={{ color: colors.text }}
                            >
                              {supplier.avgDelivery}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedSupplier ? (
              <aside
                className="w-[300px] flex-shrink-0 rounded-[16px] p-4"
                style={{
                  background: colors.cream,
                  border: `0.5px solid ${colors.border2}`,
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-medium"
                    style={{
                      background: selectedSupplier.avatarBg,
                      color: selectedSupplier.avatarColor,
                    }}
                  >
                    {selectedSupplier.initials}
                  </div>
                  <div>
                    <div
                      className="text-[12px] font-medium"
                      style={{ color: colors.text }}
                    >
                      {selectedSupplier.name}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: colors.textMuted }}
                    >
                      {selectedSupplier.category}
                    </div>
                    <div className="mt-1">
                      <SupplierStatus status={selectedSupplier.status} />
                    </div>
                  </div>
                </div>

                <div
                  className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: colors.textMuted }}
                >
                  Contact
                </div>
                <div
                  className="rounded-[12px] px-3 py-3 text-[11px]"
                  style={{
                    background: colors.cream2,
                    border: `0.5px solid ${colors.border2}`,
                    color: colors.textSub,
                  }}
                >
                  {selectedSupplier.phone}
                </div>

                <div
                  className="mt-5 mb-3 text-[10px] font-medium uppercase tracking-[0.12em]"
                  style={{ color: colors.textMuted }}
                >
                  Recent orders
                </div>
                {selectedSupplier.orders.length === 0 ? (
                  <div
                    className="text-[10px]"
                    style={{ color: colors.textMuted }}
                  >
                    No orders yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedSupplier.orders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-[56px_1fr_72px] gap-3"
                      >
                        <div
                          className="text-[11px]"
                          style={{ color: colors.textMuted }}
                        >
                          {order.id}
                        </div>
                        <div>
                          <div
                            className="text-[11px] font-medium"
                            style={{ color: colors.text }}
                          >
                            {order.title}
                          </div>
                          <div
                            className="text-[10px]"
                            style={{ color: colors.textMuted }}
                          >
                            {order.date}
                          </div>
                          <div
                            className="mt-1 inline-flex rounded-full px-2 py-[3px] text-[9px] font-medium"
                            style={{
                              background:
                                order.status === "Done"
                                  ? colors.status.available.bg
                                  : colors.goldPale,
                              color:
                                order.status === "Done"
                                  ? colors.status.available.text
                                  : colors.status.occupied.text,
                            }}
                          >
                            {order.status}
                          </div>
                        </div>
                        <div
                          className="text-right text-[11px] font-medium"
                          style={{ color: colors.text }}
                        >
                          EGP {order.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSupplier.notes && (
                  <>
                    <div
                      className="mt-5 mb-3 text-[10px] font-medium uppercase tracking-[0.12em]"
                      style={{ color: colors.textMuted }}
                    >
                      Notes
                    </div>
                    <div
                      className="rounded-[12px] px-3 py-3 text-[11px]"
                      style={{
                        background: colors.cream2,
                        border: `0.5px solid ${colors.border2}`,
                        color: colors.textSub,
                      }}
                    >
                      {selectedSupplier.notes}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaceOrderModalOpen(true);
                  }}
                  className="mt-4 w-full rounded-full px-4 py-[10px] text-[11px] font-medium"
                  style={{
                    background: colors.gold,
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Place order
                </button>
              </aside>
            ) : null}
          </div>
        </div>
      </div>

      <AddSupplierModal
        open={isAddSupplierModalOpen}
        onClose={() => setIsAddSupplierModalOpen(false)}
      />

      <PlaceOrderModal
        open={isPlaceOrderModalOpen}
        onClose={() => setIsPlaceOrderModalOpen(false)}
        defaultSupplierId={selectedSupplier?.id}
      />
    </>
  );
}
