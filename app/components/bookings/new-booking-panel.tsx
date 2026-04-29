import { useState } from "react";
import { X } from "lucide-react";
import { colors } from "@/components/dashboard/theme";
import { ALL_SERVICES, AVAILABLE_ROOMS } from "./mock-data";

// ─── Shared form field styles ─────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width:      "100%",
  fontSize:   11,
  padding:    "6px 10px",
  border:     `0.5px solid ${colors.border}`,
  borderRadius: 8,
  background: colors.cream2,
  color:      colors.text,
  fontFamily: "inherit",
  outline:    "none",
};

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.08em]"
      style={{ color: colors.textMuted }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: "0.5px", background: colors.border2 }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-[7px] text-[9px] font-medium uppercase tracking-[0.1em]"
      style={{ color: colors.textMuted }}
    >
      {children}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface NewBookingPanelProps {
  onClose: () => void;
}

export function NewBookingPanel({ onClose }: NewBookingPanelProps) {
  const [services, setServices] = useState<string[]>([]);

  function toggleService(s: string) {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  return (
    <aside
      className="flex h-full w-[264px] flex-shrink-0 flex-col gap-3 overflow-y-auto p-4"
      style={{ background: colors.cream, borderLeft: `0.5px solid ${colors.border}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="mb-[3px] text-[9px] font-medium uppercase tracking-[0.1em]"
            style={{ color: colors.textMuted }}
          >
            New booking
          </div>
          <div className="font-display text-[16px]" style={{ color: colors.text }}>
            Guest registration
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-1 rounded-md p-1 transition-colors hover:bg-[#F0EBE0]"
          aria-label="Close panel"
        >
          <X size={14} style={{ color: colors.textMuted }} />
        </button>
      </div>

      <Divider />

      {/* Guest details */}
      <div>
        <SectionLabel>Guest details</SectionLabel>
        <div className="flex flex-col gap-[7px]">
          <div>
            <FormLabel>Full name</FormLabel>
            <input style={inputStyle} placeholder="Guest full name" />
          </div>

          <div className="grid grid-cols-2 gap-[6px]">
            <div>
              <FormLabel>Nationality</FormLabel>
              <input style={inputStyle} placeholder="e.g. Egyptian" />
            </div>
            <div>
              <FormLabel>No. of guests</FormLabel>
              <input type="number" min={1} style={inputStyle} placeholder="1" />
            </div>
          </div>

          <div>
            <FormLabel>ID / Passport no.</FormLabel>
            <input style={inputStyle} placeholder="National ID or passport" />
          </div>

          <div className="grid grid-cols-2 gap-[6px]">
            <div>
              <FormLabel>Phone</FormLabel>
              <input type="tel" style={inputStyle} placeholder="01x xxxx xxxx" />
            </div>
            <div>
              <FormLabel>Purpose of visit</FormLabel>
              <select style={inputStyle}>
                <option>Business</option>
                <option>Leisure</option>
                <option>Family visit</option>
                <option>Medical</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Stay details */}
      <div>
        <SectionLabel>Stay details</SectionLabel>
        <div className="flex flex-col gap-[7px]">
          <div className="grid grid-cols-2 gap-[6px]">
            <div>
              <FormLabel>Check-in</FormLabel>
              <input type="date" style={inputStyle} />
            </div>
            <div>
              <FormLabel>Check-out</FormLabel>
              <input type="date" style={inputStyle} />
            </div>
          </div>

          <div>
            <FormLabel>Room</FormLabel>
            <select style={inputStyle}>
              {AVAILABLE_ROOMS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <FormLabel>Payment method</FormLabel>
            <select style={inputStyle}>
              <option>Cash</option>
              <option>Card</option>
              <option>Bank transfer</option>
            </select>
          </div>
        </div>
      </div>

      <Divider />

      {/* Services */}
      <div>
        <SectionLabel>Additional services</SectionLabel>
        <div className="grid grid-cols-2 gap-[5px]">
          {ALL_SERVICES.map((s) => (
            <label
              key={s}
              className="flex cursor-pointer items-center gap-[6px] rounded-[7px] px-[8px] py-[5px] transition-colors"
              style={{
                fontSize:   10,
                color:      services.includes(s) ? colors.status.occupied.text : colors.textSub,
                border:     `0.5px solid ${services.includes(s) ? colors.goldLight : colors.border2}`,
                background: services.includes(s) ? colors.goldPale : "transparent",
              }}
            >
              <input
                type="checkbox"
                checked={services.includes(s)}
                onChange={() => toggleService(s)}
                style={{ accentColor: colors.gold }}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="mt-auto flex flex-col gap-[6px] pt-2">
        <button
          className="w-full rounded-full py-[7px] text-[11px] font-medium transition-opacity hover:opacity-80"
          style={{
            background: colors.gold,
            color:      "#fff",
            border:     "none",
            fontFamily: "inherit",
            cursor:     "pointer",
          }}
        >
          Create booking
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-full py-[7px] text-[11px] font-medium transition-colors hover:bg-[#F0EBE0]"
          style={{
            background: "transparent",
            color:      colors.textSub,
            border:     `0.5px solid ${colors.border}`,
            fontFamily: "inherit",
            cursor:     "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </aside>
  );
}
