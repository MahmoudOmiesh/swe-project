"use client";

import { useState } from "react";
import { colors } from "@/components/dashboard/theme";
import { Modal } from "@/components/ui/modal";
import { BillingSummaryCard } from "./billing-summary-card";
import { InvoiceStatus } from "./invoice-status";
import { BILLING_SUMMARY, INVOICES, type InvoiceRecord } from "./mock-data";

export function BillingPage() {
  const [bills, setBills] = useState<InvoiceRecord[]>(INVOICES);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(INVOICES[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false);
  const [billError, setBillError] = useState("");
  const [newBillForm, setNewBillForm] = useState({ guestName: "", room: "", amount: "", paymentMethod: "Cash" });

  const selectedInvoice = bills.find((invoice) => invoice.id === selectedInvoiceId) ?? bills[0];

  const resetBillForm = () => {
    setNewBillForm({ guestName: "", room: "", amount: "", paymentMethod: "Cash" });
    setBillError("");
  };

  const handleAddBill = () => {
    if (!newBillForm.guestName.trim() || !newBillForm.room.trim() || !newBillForm.amount.trim()) {
      setBillError("Guest name, room, and amount are required.");
      return;
    }

    const amount = Number(newBillForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setBillError("Amount must be a valid number.");
      return;
    }

    const nextBillNumber =
      bills
        .map((bill) => Number(bill.id.replace("B-", "")))
        .filter((value) => !Number.isNaN(value))
        .reduce((max, value) => Math.max(max, value), 40) + 1;

    const initials = newBillForm.guestName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");

    const newBill: InvoiceRecord = {
      id: `B-${String(nextBillNumber).padStart(3, "0")}`,
      guestName: newBillForm.guestName.trim(),
      initials,
      avatarBg: "#F1EFE8",
      avatarColor: "#5F5E5A",
      room: newBillForm.room.trim(),
      amount,
      status: newBillForm.paymentMethod === "Cash" ? "Pending" : "Paid",
      bookingId: `#10${nextBillNumber}`,
      lineItems: [{ label: `Room ${newBillForm.room.trim()} bill`, amount }],
    };

    setBills((currentBills) => [newBill, ...currentBills]);
    setSelectedInvoiceId(newBill.id);
    setPaymentMethod(newBillForm.paymentMethod);
    setIsNewBillModalOpen(false);
    resetBillForm();
  };

  const handleExportCsv = () => {
    const rows = [["Bill #", "Guest", "Room", "Amount", "Status", "Booking ID"], ...bills.map((bill) => [bill.id, bill.guestName, bill.room, bill.amount.toFixed(2), bill.status, bill.bookingId])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "billing-data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="hms-shell flex flex-1 flex-col overflow-hidden">
        <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
          <h1 className="font-display text-[17px]" style={{ color: colors.text }}>
            Billing
          </h1>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleExportCsv} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.cream, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>
              Export CSV
            </button>
            <button type="button" onClick={() => setIsNewBillModalOpen(true)} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>
              + New bill
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 gap-4 overflow-y-auto p-[18px]">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="grid grid-cols-3 gap-[10px]">
                {BILLING_SUMMARY.map((item) => (
                  <BillingSummaryCard key={item.label} label={item.label} value={item.value} accent={item.accent} />
                ))}
              </div>

              <section className="overflow-hidden rounded-[16px]" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
                <div className="grid px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: colors.textMuted, borderBottom: `0.5px solid ${colors.border2}`, gridTemplateColumns: "90px 1.3fr 80px 120px" }}>
                  <div>Bill #</div>
                  <div>Guest</div>
                  <div>Room</div>
                  <div>Amount</div>
                </div>

                {bills.map((invoice) => {
                  const active = selectedInvoice?.id === invoice.id;
                  return (
                    <button key={invoice.id} onClick={() => setSelectedInvoiceId(invoice.id)} className="grid w-full items-center px-4 py-3 text-left" style={{ gridTemplateColumns: "90px 1.3fr 80px 120px", background: active ? colors.cream : "transparent", borderLeft: active ? `2px solid ${colors.gold}` : "2px solid transparent", borderBottom: `0.5px solid ${colors.border2}` }}>
                      <div className="text-[12px]" style={{ color: colors.textSub }}>{invoice.id}</div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-medium" style={{ background: invoice.avatarBg, color: invoice.avatarColor }}>{invoice.initials}</div>
                        <div className="text-[12px] font-medium" style={{ color: colors.text }}>{invoice.guestName}</div>
                      </div>
                      <div className="text-[12px]" style={{ color: colors.text }}>{invoice.room}</div>
                      <div className="text-[12px] font-medium" style={{ color: colors.text }}>EGP {invoice.amount.toFixed(2)}</div>
                    </button>
                  );
                })}
              </section>
            </div>

            {selectedInvoice ? (
              <aside className="w-[360px] flex-shrink-0 rounded-[16px] p-4" style={{ background: colors.cream, border: `0.5px solid ${colors.border2}` }}>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-[18px]" style={{ color: colors.text }}>Bill {selectedInvoice.id}</h2>
                    <div className="text-[11px]" style={{ color: colors.textMuted }}>{selectedInvoice.guestName} · {selectedInvoice.bookingId}</div>
                  </div>
                  <InvoiceStatus status={selectedInvoice.status} />
                </div>

                <div className="mb-3 border-b pb-2 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: colors.textMuted, borderColor: colors.border2 }}>Breakdown</div>

                <div className="flex flex-col gap-3">
                  {selectedInvoice.lineItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-[12px]">
                      <span style={{ color: colors.textSub }}>{item.label}</span>
                      <span style={{ color: item.tone === "success" ? colors.status.available.text : colors.text, fontWeight: item.tone === "success" ? 500 : 400 }}>
                        EGP {item.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[12px] px-4 py-4" style={{ background: colors.goldPale, border: `0.5px solid ${colors.goldLight}` }}>
                  <span className="text-[12px] font-medium" style={{ color: colors.textSub }}>Total due</span>
                  <span className="font-display text-[22px]" style={{ color: colors.text }}>EGP {selectedInvoice.amount.toFixed(2)}</span>
                </div>

                <div className="mt-5">
                  <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Payment method</div>
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="w-full rounded-[12px] px-4 py-3 text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }}>
                    <option>Cash</option>
                    <option>Credit / Debit card</option>
                    <option>Bank transfer</option>
                    <option>Online payment</option>
                  </select>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>

      <Modal open={isNewBillModalOpen} title="New Bill" onClose={() => { setIsNewBillModalOpen(false); resetBillForm(); }} footer={<><button type="button" onClick={() => { setIsNewBillModalOpen(false); resetBillForm(); }} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>Cancel</button><button type="button" onClick={handleAddBill} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>Submit</button></>}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Guest name<input value={newBillForm.guestName} onChange={(event) => setNewBillForm((current) => ({ ...current, guestName: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Room<input value={newBillForm.room} onChange={(event) => setNewBillForm((current) => ({ ...current, room: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Amount<input value={newBillForm.amount} onChange={(event) => setNewBillForm((current) => ({ ...current, amount: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} /></label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>Payment method<select value={newBillForm.paymentMethod} onChange={(event) => setNewBillForm((current) => ({ ...current, paymentMethod: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }}><option>Cash</option><option>Credit / Debit card</option><option>Bank transfer</option><option>Online payment</option></select></label>
          {billError ? <div className="text-[11px]" style={{ color: colors.status.maintenance.text }}>{billError}</div> : null}
        </div>
      </Modal>
    </>
  );
}

