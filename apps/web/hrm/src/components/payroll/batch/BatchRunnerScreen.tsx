/**
 * Screen:     HRM · Chạy lương (S6)
 * WorkItem:   HRM-POLICY-FE-S6
 * Coded:      2026-08-22
 */
import { useState } from "react";
import { BatchAPI, type Payslip } from "../../../lib/api/hrm-policy-api";
import { PayslipPanel } from "../payslip/PayslipPanel";

type BatchResult = { batch_id: string; employee_count: number; warnings: string[] };

const S = {
  card: { background: "#1a1f2e", borderRadius: 12, padding: 24, border: "1px solid #2a2f45", marginBottom: 16 } as React.CSSProperties,
  btn: (c: string, disabled = false): React.CSSProperties => ({ background: disabled ? "#1e2540" : c, color: disabled ? "#475569" : "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", transition: "all .2s" }),
  input: { background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "10px 16px", fontSize: 16 } as React.CSSProperties,
  stat: (c: string): React.CSSProperties => ({ background: "#0f1117", borderRadius: 12, padding: "16px 20px", border: `1px solid ${c}44`, textAlign: "center" as const }),
};

export function BatchRunnerScreen() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [payslipEmpId, setPayslipEmpId] = useState("");
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loadingPayslip, setLoadingPayslip] = useState(false);

  const handleRun = async () => {
    if (!period) return;
    setRunning(true);
    setResult(null);
    setApproved(false);
    setPayslip(null);
    try {
      const r = await BatchAPI.run(period);
      setResult(r);
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi chạy lương"); }
    finally { setRunning(false); }
  };

  const handleApprove = async () => {
    if (!result) return;
    setApproving(true);
    try { await BatchAPI.approve(result.batch_id); setApproved(true); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi approve"); }
    finally { setApproving(false); }
  };

  const handleGetPayslip = async () => {
    if (!payslipEmpId || !period) return;
    setLoadingPayslip(true);
    try { setPayslip(await BatchAPI.getPayslip(payslipEmpId, period)); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Không tìm thấy phiếu lương"); }
    finally { setLoadingPayslip(false); }
  };

  return (
    <div>
      {/* Run form */}
      <div style={S.card}>
        <h2 style={{ margin: "0 0 8px", color: "#a5b4fc" }}>🚀 Chạy lương tháng</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 14 }}>
          Hệ thống sẽ tự động tính lương cho tất cả nhân viên theo chính sách đang ACTIVE của từng nhóm.
        </p>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Kỳ lương</label>
            <input id="batch-period" type="month" style={{ ...S.input, width: 180 }} value={period} onChange={e => setPeriod(e.target.value)} />
          </div>
          <button style={{ ...S.btn("#6366f1", running), marginTop: 22 }} onClick={handleRun} disabled={running} id="btn-run-batch">
            {running ? "⏳ Đang chạy lương..." : "🚀 Chạy lương"}
          </button>
        </div>
        {running && (
          <div style={{ marginTop: 20, background: "#0f1117", borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#818cf8" }}>
              <div style={{ fontSize: 20, animation: "spin 1s linear infinite" }}>⚙️</div>
              <span>Đang xử lý batch — vui lòng chờ...</span>
            </div>
            <div style={{ marginTop: 12, height: 4, background: "#1e2540", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#6366f1", width: "60%", animation: "progress 2s ease-in-out infinite" }} />
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: "0 0 4px", color: approved ? "#4ade80" : "#a5b4fc" }}>
                {approved ? "✅ Đã approve" : "✅ Hoàn thành batch"}
              </h3>
              <code style={{ fontSize: 12, color: "#64748b" }}>Batch ID: {result.batch_id}</code>
            </div>
            {!approved && (
              <button style={S.btn("#16a34a", approving)} onClick={handleApprove} disabled={approving} id="btn-approve-batch">
                {approving ? "Đang approve..." : "✓ Approve lương"}
              </button>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
            <div style={S.stat("#4ade80")}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#4ade80" }}>{result.employee_count}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Nhân viên đã tính</div>
            </div>
            <div style={S.stat("#818cf8")}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#818cf8" }}>{result.warnings.length}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Cảnh báo</div>
            </div>
            <div style={S.stat("#fb923c")}>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#fb923c" }}>
                {approved ? "APPROVED" : "COMPLETED"}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Trạng thái</div>
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div>
              <button style={{ ...S.btn("#334155"), fontSize: 13, padding: "8px 14px" }} onClick={() => setShowWarnings(s => !s)}>
                {showWarnings ? "▲" : "▼"} {result.warnings.length} cảnh báo
              </button>
              {showWarnings && (
                <div style={{ background: "#92400e22", borderRadius: 8, padding: 16, marginTop: 8, maxHeight: 200, overflowY: "auto" }}>
                  {result.warnings.map((w, i) => <div key={i} style={{ fontSize: 13, color: "#fcd34d", marginBottom: 4 }}>⚠️ {w}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payslip lookup */}
      <div style={S.card}>
        <h3 style={{ margin: "0 0 16px", color: "#a5b4fc" }}>🔍 Tra cứu phiếu lương</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input id="payslip-emp-id" placeholder="Employee ID" style={{ ...S.input, flex: 1, minWidth: 200 }} value={payslipEmpId} onChange={e => setPayslipEmpId(e.target.value)} />
          <button style={S.btn("#7c3aed", loadingPayslip)} onClick={handleGetPayslip} disabled={loadingPayslip} id="btn-get-payslip">
            {loadingPayslip ? "Đang tải..." : "Xem phiếu lương"}
          </button>
        </div>
        {payslip && <div style={{ marginTop: 24 }}><PayslipPanel payslip={payslip} /></div>}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes progress { 0% { width: 20%; } 50% { width: 80%; } 100% { width: 20%; } }
      `}</style>
    </div>
  );
}
