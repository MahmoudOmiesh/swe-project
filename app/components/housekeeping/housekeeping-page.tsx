"use client";

import { useState } from "react";
import { colors } from "@/components/dashboard/theme";
import { Modal } from "@/components/ui/modal";
import { HOUSEKEEPING_METRICS, HOUSEKEEPING_TASKS, LOW_SUPPLIES_ALERT, MAINTENANCE_ISSUES, STAFF_ON_DUTY } from "./mock-data";
import { MetricCard } from "./metric-card";
import { TaskStatus } from "./task-status";

export function HousekeepingPage() {
  const [issues, setIssues] = useState(MAINTENANCE_ISSUES);
  const [stockRequests, setStockRequests] = useState<{ itemName: string; quantity: string }[]>([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ room: "", description: "", priority: "medium" });
  const [stockForm, setStockForm] = useState({ itemName: "", quantity: "" });
  const [issueError, setIssueError] = useState("");
  const [stockError, setStockError] = useState("");

  const resetIssueForm = () => {
    setIssueForm({ room: "", description: "", priority: "medium" });
    setIssueError("");
  };

  const resetStockForm = () => {
    setStockForm({ itemName: "", quantity: "" });
    setStockError("");
  };

  const handleIssueSubmit = () => {
    if (!issueForm.room.trim() || !issueForm.description.trim()) {
      setIssueError("Room number and issue description are required.");
      return;
    }

    const priorityLabel =
      issueForm.priority === "high" ? "Urgent" : issueForm.priority === "medium" ? "Normal" : "Low";

    setIssues((currentIssues) => [
      {
        id: `issue-${Date.now()}`,
        room: `Room ${issueForm.room.trim()}`,
        title: issueForm.description.trim(),
        reportedAt: `Reported today · ${priorityLabel}`,
        estimate: "Est. inspection pending",
      },
      ...currentIssues,
    ]);

    setIsIssueModalOpen(false);
    resetIssueForm();
  };

  const handleStockSubmit = () => {
    if (!stockForm.itemName.trim() || !stockForm.quantity.trim()) {
      setStockError("Item name and quantity are required.");
      return;
    }

    setStockRequests((currentRequests) => [
      { itemName: stockForm.itemName.trim(), quantity: stockForm.quantity.trim() },
      ...currentRequests,
    ]);

    setIsStockModalOpen(false);
    resetStockForm();
  };

  return (
    <>
      <div className="hms-shell flex flex-1 flex-col overflow-hidden">
        <header className="hms-topbar flex items-center justify-between px-5 py-[13px]">
          <h1 className="font-display text-[17px]" style={{ color: colors.text }}>
            Housekeeping
          </h1>
          <div className="text-[11px]" style={{ color: colors.textMuted }}>
            Sat 25 Apr 2026 · Shift 08:00–16:00
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-[18px]">
          <div className="grid grid-cols-4 gap-[10px]">
            {HOUSEKEEPING_METRICS.map((metric) => (
              <MetricCard key={metric.label} label={metric.label} value={metric.value} valueColor={metric.valueColor} />
            ))}
          </div>

          <div className="grid grid-cols-[1.15fr_0.85fr] gap-4">
            <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
                  Cleaning tasks — today
                </h2>
                <span className="text-[11px]" style={{ color: colors.textMuted }}>
                  5 pending
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {HOUSEKEEPING_TASKS.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 rounded-[14px] bg-white px-4 py-4" style={{ border: `0.5px solid ${colors.border2}` }}>
                    <div className="w-10 text-[24px] font-light" style={{ color: colors.text }}>
                      {task.room}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                        {task.title}
                      </div>
                      <div className="text-[10px]" style={{ color: colors.textMuted }}>
                        {task.subtitle} · {task.time}
                      </div>
                    </div>

                    <TaskStatus tone={task.statusTone} label={task.statusLabel} />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-4">
              <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
                    Maintenance issues
                  </h2>
                  <span className="text-[11px]" style={{ color: colors.status.maintenance.text }}>
                    {issues.length} open
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {issues.map((issue) => (
                    <div key={issue.id} className="rounded-[14px] px-4 py-3" style={{ background: colors.status.maintenance.bg, border: `0.5px solid ${colors.status.maintenance.border}` }}>
                      <div className="text-[12px] font-medium" style={{ color: colors.status.maintenance.text }}>
                        {issue.room} — {issue.title}
                      </div>
                      <div className="text-[10px]" style={{ color: colors.textMuted }}>
                        {issue.reportedAt} · {issue.estimate}
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => setIsIssueModalOpen(true)} className="mt-3 w-full rounded-full px-4 py-[9px] text-[11px]" style={{ background: colors.cream, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>
                  Report new issue
                </button>
              </section>

              <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
                    Staff on duty
                  </h2>
                  <span className="text-[11px]" style={{ color: colors.textMuted }}>
                    3 active
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {STAFF_ON_DUTY.map((staff) => (
                    <div key={staff.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-medium" style={{ background: staff.avatarBg, color: staff.avatarColor }}>
                        {staff.initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-medium" style={{ color: colors.text }}>
                          {staff.name}
                        </div>
                        <div className="text-[10px]" style={{ color: colors.textMuted }}>
                          {staff.floor} · {staff.progressLabel}
                        </div>
                      </div>

                      <div className="w-20 rounded-full" style={{ height: 6, background: "rgba(184,150,90,0.12)" }}>
                        <div className="rounded-full" style={{ width: `${staff.progress}%`, height: 6, background: colors.gold }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[16px] p-4" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}` }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[12px] font-medium" style={{ color: colors.text }}>
                    Low supplies alert
                  </h2>
                </div>

                <div className="rounded-[14px] px-4 py-3 text-[11px]" style={{ background: colors.cream, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>
                  {LOW_SUPPLIES_ALERT.message}
                </div>

                <button type="button" onClick={() => setIsStockModalOpen(true)} className="mt-3 w-full rounded-full px-4 py-[10px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>
                  Request restock
                </button>
              </section>
            </div>
          </div>
        </main>
      </div>

      <Modal open={isIssueModalOpen} title="Report New Issue" onClose={() => { setIsIssueModalOpen(false); resetIssueForm(); }} footer={<><button type="button" onClick={() => { setIsIssueModalOpen(false); resetIssueForm(); }} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>Cancel</button><button type="button" onClick={handleIssueSubmit} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>Submit</button></>}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>
            Room number
            <input value={issueForm.room} onChange={(event) => setIssueForm((current) => ({ ...current, room: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} />
          </label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>
            Issue description
            <textarea value={issueForm.description} onChange={(event) => setIssueForm((current) => ({ ...current, description: event.target.value }))} className="min-h-[96px] rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text, resize: "none" }} />
          </label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>
            Priority
            <select value={issueForm.priority} onChange={(event) => setIssueForm((current) => ({ ...current, priority: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          {issueError ? <div className="text-[11px]" style={{ color: colors.status.maintenance.text }}>{issueError}</div> : null}
        </div>
      </Modal>

      <Modal open={isStockModalOpen} title="Request Stock" onClose={() => { setIsStockModalOpen(false); resetStockForm(); }} footer={<><button type="button" onClick={() => { setIsStockModalOpen(false); resetStockForm(); }} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.textSub }}>Cancel</button><button type="button" onClick={handleStockSubmit} className="rounded-full px-4 py-[8px] text-[11px] font-medium" style={{ background: colors.gold, color: "#fff", border: "none" }}>Submit</button></>}>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>
            Item name
            <input value={stockForm.itemName} onChange={(event) => setStockForm((current) => ({ ...current, itemName: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} />
          </label>
          <label className="flex flex-col gap-[5px] text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.textMuted }}>
            Quantity
            <input value={stockForm.quantity} onChange={(event) => setStockForm((current) => ({ ...current, quantity: event.target.value }))} className="rounded-[12px] px-3 py-[10px] text-[12px] outline-none" style={{ background: colors.cream2, border: `0.5px solid ${colors.border2}`, color: colors.text }} />
          </label>
          {stockRequests.length ? <div className="text-[11px]" style={{ color: colors.textMuted }}>{stockRequests.length} request{stockRequests.length === 1 ? "" : "s"} queued locally.</div> : null}
          {stockError ? <div className="text-[11px]" style={{ color: colors.status.maintenance.text }}>{stockError}</div> : null}
        </div>
      </Modal>
    </>
  );
}

