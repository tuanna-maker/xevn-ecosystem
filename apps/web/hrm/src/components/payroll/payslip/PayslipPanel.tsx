/**
 * @CODE-MEMORY
 * Screen:     HRM · Payslip Panel (S7 — shared component)
 * WorkItem:   HRM-POLICY-FE-S7
 * Coded:      2026-08-22
 */
import { useState } from "react";
import type { Payslip, PayslipComponent } from "../../../lib/api/hrm-policy-api";

function fmtVND(n: string | bigint | number): string {
  const num = typeof n === "string" ? parseInt(n) : Number(n);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
}

function CompRow({ comp, index }: { comp: PayslipComponent; index: number }) {
  const [open, setOpen] = useState(false);
  const amount = parseInt(comp.amount_vnd);
  return (
    <div style={{ borderBottom: "1px solid #1e2540" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", cursor: "pointer", transition: "background .1s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "#1e2540")} onMouseLeave={e => (e.currentTarget.style.background = "")}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "#475569", fontSize: 12, minWidth: 24 }}>{index + 1}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{comp.name}</div>
            {comp.skipped && <div style={{ fontSize: 11, color: "#f59e0b" }}>⚠️ Bỏ qua</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: comp.is_deduction ? "#f87171" : "#4ade80" }}>
            {comp.is_deduction ? "−" : "+"}{fmtVND(amount)}
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>{open ? "▲" : "▼"}</div>
        </div>
      </div>
      {open && (
        <div style={{ padding: "8px 20px 16px 56px", background: "#131720" }}>
          {comp.breakdown.map((b, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: "#64748b" }}>{b.label}</span>
              <span style={{ color: "#94a3b8" }}>{b.value}</span>
            </div>
          ))}
          {comp.warnings.map((w, i) => <div key={i} style={{ fontSize: 12, color: "#f59e0b", marginTop: 4 }}>⚠️ {w}</div>)}
        </div>
      )}
    </div>
  );
}

export function PayslipPanel({ payslip }: { payslip: Payslip }) {
  const income = payslip.components.filter(c => !c.is_deduction && !c.skipped);
  const deductions = payslip.components.filter(c => c.is_deduction && !c.skipped);
  const skipped = payslip.components.filter(c => c.skipped);

  const statusColor: Record<string, string> = { APPROVED: "#4ade80", DRAFT: "#fb923c", LOCKED: "#818cf8" };

  return (
    <div style={{ background: "#1a1f2e", borderRadius: 16, border: "1px solid #2a2f45", overflow: "hidden", maxWidth: 780 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1e2540,#2a2f55)", padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: "0 0 4px", color: "#a5b4fc", fontSize: 20 }}>Phiếu lương</h2>
            <div style={{ color: "#64748b", fontSize: 14 }}>Kỳ: {payslip.period_month} · Employee: {payslip.employee_id}</div>
          </div>
          <span style={{ background: `${statusColor[payslip.status] ?? "#334155"}22`, color: statusColor[payslip.status] ?? "#94a3b8", borderRadius: 8, padding: "4px 14px", fontSize: 13, fontWeight: 600 }}>{payslip.status}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
          <div style={{ background: "#ffffff0d", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>TỔNG THU NHẬP</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#4ade80" }}>{fmtVND(payslip.gross_vnd)}</div>
          </div>
          <div style={{ background: "#ffffff0d", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>THỰC LĨNH</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#a5b4fc" }}>{fmtVND(payslip.net_vnd)}</div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {payslip.warnings.length > 0 && (
        <div style={{ background: "#92400e22", borderBottom: "1px solid #78350f", padding: "10px 20px" }}>
          {payslip.warnings.map((w, i) => <div key={i} style={{ fontSize: 13, color: "#fcd34d" }}>⚠️ {w}</div>)}
        </div>
      )}

      {/* Income */}
      <div style={{ padding: "16px 0 0" }}>
        <div style={{ padding: "8px 20px", fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
          Thu nhập ({income.length} khoản)
        </div>
        {income.map((c, i) => <CompRow key={c.component_type + i} comp={c} index={i} />)}
      </div>

      {/* Deductions */}
      {deductions.length > 0 && (
        <div style={{ padding: "8px 0 0" }}>
          <div style={{ padding: "8px 20px", fontSize: 12, color: "#64748b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
            Khấu trừ ({deductions.length} khoản)
          </div>
          {deductions.map((c, i) => <CompRow key={c.component_type + i} comp={c} index={i} />)}
        </div>
      )}

      {/* Skipped */}
      {skipped.length > 0 && (
        <div style={{ padding: "8px 20px 16px", borderTop: "1px solid #1e2540" }}>
          <div style={{ fontSize: 12, color: "#475569" }}>Bỏ qua ({skipped.length}): {skipped.map(c => c.name).join(", ")}</div>
        </div>
      )}

      {/* Footer summary */}
      <div style={{ borderTop: "2px solid #312e81", padding: "20px 28px", background: "#12162a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
          <span style={{ color: "#64748b" }}>Tổng thu nhập</span>
          <strong style={{ color: "#4ade80" }}>{fmtVND(payslip.gross_vnd)}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, marginTop: 8 }}>
          <span style={{ color: "#64748b" }}>Tổng khấu trừ</span>
          <strong style={{ color: "#f87171" }}>− {fmtVND(deductions.reduce((s, c) => s + parseInt(c.amount_vnd), 0))}</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 800, marginTop: 16, borderTop: "1px solid #1e2540", paddingTop: 16 }}>
          <span style={{ color: "#e8eaf0" }}>THỰC LĨNH</span>
          <strong style={{ color: "#a5b4fc" }}>{fmtVND(payslip.net_vnd)}</strong>
        </div>
      </div>
    </div>
  );
}
