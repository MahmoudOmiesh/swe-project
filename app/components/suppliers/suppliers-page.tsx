"use client";

import { useState } from "react";
import { colors } from "@/components/dashboard/theme";
import { Modal } from "@/components/ui/modal";
import { FilterPill } from "./filter-pill";
import { SUPPLIERS, type SupplierRecord } from "./mock-data";
import { SupplierStatus } from "./supplier-status";

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(SUPPLIERS);
  const [selectedSupplierId, setSelectedSupplierId] = useState(SUPPLIERS[0]?.id ?? "");
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isPlaceOrderModalOpen, setIsPlaceOrderModalOpen] = useState(false);
  const [supplierError, setSupplierError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [supplierForm, setSupplierForm] = useState({ name: "", contact: "", company: "" });
  const [orderForm, setOrderForm] = useState({ supplierId: SUPPLIERS[0]?.id ?? "", item: "", quantity: "" });

  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? suppliers[0];

  const visibleSuppliers = suppliers
    .filter((supplier) => {
      if (filter === "All") return true;
      if (filter === "Active") return supplier.status === "Active";
      if (filter === "Pending order") return supplier.status === "Order pending";
      return supplier.status === "Inactive";
    })
    .filter((supplier) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return true;
      return supplier.name.toLowerCase().includes(query) || supplier.category.toLowerCase().includes(query);
    });

  const resetSupplierForm = () => {
    setSupplierForm({ name: "", contact: "", company: "" });
    setSupplierError("");
  };

  const resetOrderForm = () => {
    setOrderForm({ supplierId: selectedSupplier?.id ?? suppliers[0]?.id ?? "", item: "", quantity: "" });
    setOrderError("");
  };

  const handleAddSupplier = () => {
    if (!supplierForm.name.trim() || !supplierForm.contact.trim() || !supplierForm.company.trim()) {
      setSupplierError("Name, contact, and company are required.");
      return;
    }

    const initials = supplierForm.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
    const supplierId = `supplier-${Date.now()}`;
    const newSupplier: SupplierRecord = {
      id: supplierId,
      name: supplierForm.name.trim(),
      initials,
      avatarBg: "#F1EFE8",
      avatarColor: "#5F5E5A",
      category: supplierForm.company.trim(),
      status: "Active",
      lastOrder: "No orders yet",
      totalOrders: 0,
      avgDelivery: "—",
      phone: supplierForm.contact.trim(),
      email: `${supplierForm.name.trim().toLowerCase().replace(/\s+/g, "")}@example.com`,
      website: supplierForm.company.trim(),
      orders: [],
      notes: "Supplier added locally from dashboard.",
    };

    setSuppliers((currentSuppliers) => [newSupplier, ...currentSuppliers]);
    setSelectedSupplierId(supplierId);
    setOrderForm((current) => ({ ...current, supplierId }));
    setIsAddSupplierModalOpen(false);
    resetSupplierForm();
  };

  const handlePlaceOrder = () => {
    if (!orderForm.supplierId || !orderForm.item.trim() || !orderForm.quantity.trim()) {
      setOrderError("Supplier, item, and quantity are required.");
      return;
    }

    const selectedId = orderForm.supplierId;
    const quantity = orderForm.quantity.trim();

    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier) => {
        if (supplier.id !== selectedId) return supplier;

        return {
          ...supplier,
          status: "Order pending",
          lastOrder: "Today",
          totalOrders: supplier.totalOrders + 1,
          orders: [
            { id: `#ORD-${supplier.totalOrders + 1}`, title: `${orderForm.item.trim()} x ${quantity}`, date: "Today", status: "Done", amount: 0 },
            ...supplier.orders,
          ],
        };
      }),
    );

    setSelectedSupplierId(selectedId);
    setIsPlaceOrderModalOpen(false);
    resetOrderForm();
  };

  return (
    <>
      <div className="hms-shell flex flex-1 flex-col overflow-hidden">
        <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
          <h1 className="font-display text-[17px]" style={{ color: colors.text }}>Suppliers</h1>
          <button type="button" onClick={() => setIsAddSupplierModalOpen(true)} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>+ Add supplier</button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 gap-4 overflow-y-auto p-[18px]">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search supplier, category..." className="w-[240px] rounded-full px-4 py-[8px] text-[11px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} />
                {["All", "Active", "Pending order", "Inactive"].map((item) => <FilterPill key={item} label={item} active={filter === item} onClick={() => setFilter(item)} />)}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {visibleSuppliers.map((supplier) => {
                  const active = selectedSupplier?.id === supplier.id;
                  return (
                    <button key={supplier.id} onClick={() => setSelectedSupplierId(supplier.id)} className="rounded-[16px] px-4 py-4 text-left" style={{ background: colors.cream2, border: `0.5px solid ${active ? colors.gold : colors.border2}` }}>
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-medium" style={{ background: supplier.avatarBg, color: supplier.avatarColor }}>{supplier.initials}</div>
                          <div>
                            <div className="text-[12px] font-medium" style={{ color: colors.text }}>{supplier.name}</div>
                            <div className="text-[10px]" style={{ color: colors.textMuted }}>{supplier.category}</div>
                          </div>
                        </div>
                        <SupplierStatus status={supplier.status} />
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-[10px]">
                        <div><div style={{ color: colors.textMuted }}>Last order</div><div className="mt-1 font-medium" style={{ color: colors.text }}>{supplier.lastOrder}</div></div>
                        <div><div style={{ color: colors.textMuted }}>Total orders</div><div className="mt-1 font-medium" style={{ color: colors.text }}>{supplier.totalOrders}</div></div>
                        <div><div style={{ color: colors.textMuted }}>Avg. delivery</div><div className="mt-1 font-medium" style={{ color: colors.text }}>{supplier.avgDelivery}</div></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSupplier ? (
              <aside className="w-[300px] flex-shrink-0 rounded-[16px] p-4" style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-medium" style={{ background: selectedSupplier.avatarBg, color: selectedSupplier.avatarColor }}>{selectedSupplier.initials}</div>
                  <div>
                    <div className="text-[12px] font-medium" style={{ color: colors.text }}>{selectedSupplier.name}</div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>{selectedSupplier.category}</div>
                    <div className="mt-1"><SupplierStatus status={selectedSupplier.status} /></div>
                  </div>
                </div>

                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Contact details</div>
                <div className="flex flex-col gap-2">
                  {[selectedSupplier.phone, selectedSupplier.email, selectedSupplier.website].map((item) => (
                    <div key={item} className="rounded-[12px] px-3 py-3 text-[11px]" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>{item}</div>
                  ))}
                </div>

                <div className="mt-5 mb-3 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Recent orders</div>
                <div className="flex flex-col gap-3">
                  {selectedSupplier.orders.map((order) => (
                    <div key={order.id} className="grid grid-cols-[56px_1fr_72px] gap-3">
                      <div className="text-[11px]" style={{ color: colors.textMuted }}>{order.id}</div>
                      <div>
                        <div className="text-[11px] font-medium" style={{ color: colors.text }}>{order.title}</div>
                        <div className="text-[10px]" style={{ color: colors.textMuted }}>{order.date}</div>
                        <div className="mt-1 inline-flex rounded-full px-2 py-[3px] text-[9px] font-medium" style={{ background: colors.status.available.bg, color: colors.status.available.text }}>{order.status}</div>
                      </div>
                      <div className="text-right text-[11px] font-medium" style={{ color: colors.text }}>EGP {order.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 mb-3 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Notes</div>
                <div className="rounded-[12px] px-3 py-3 text-[11px]" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>{selectedSupplier.notes}</div>

                <button type="button" onClick={() => { setOrderForm((current) => ({ ...current, supplierId: selectedSupplier.id })); setIsPlaceOrderModalOpen(true); }} className="mt-4 w-full rounded-full px-4 py-[10px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>Place order</button>
              </aside>
            ) : null}
          </div>
        </div>
      </div>

      <Modal open={isAddSupplierModalOpen} title="Add Supplier" onClose={() => { setIsAddSupplierModalOpen(false); resetSupplierForm(); }} footer={<><button type="button" onClick={() => { setIsAddSupplierModalOpen(false); resetSupplierForm(); }} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>Cancel</button><button type="button" onClick={handleAddSupplier} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>Submit</button></>}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Name<input value={supplierForm.name} onChange={(event) => setSupplierForm((current) => ({ ...current, name: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Contact<input value={supplierForm.contact} onChange={(event) => setSupplierForm((current) => ({ ...current, contact: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Company<input value={supplierForm.company} onChange={(event) => setSupplierForm((current) => ({ ...current, company: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          {supplierError ? <div className="text-[11px]" style={{ color: colors.status.maintenance.text }}>{supplierError}</div> : null}
        </div>
      </Modal>

      <Modal open={isPlaceOrderModalOpen} title="Place Order" onClose={() => { setIsPlaceOrderModalOpen(false); resetOrderForm(); }} footer={<><button type="button" onClick={() => { setIsPlaceOrderModalOpen(false); resetOrderForm(); }} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>Cancel</button><button type="button" onClick={handlePlaceOrder} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>Submit</button></>}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Supplier<select value={orderForm.supplierId} onChange={(event) => setOrderForm((current) => ({ ...current, supplierId: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }}>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Item<input value={orderForm.item} onChange={(event) => setOrderForm((current) => ({ ...current, item: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Quantity<input value={orderForm.quantity} onChange={(event) => setOrderForm((current) => ({ ...current, quantity: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          {orderError ? <div className="text-[11px]" style={{ color: colors.status.maintenance.text }}>{orderError}</div> : null}
        </div>
      </Modal>
    </>
  );
}

