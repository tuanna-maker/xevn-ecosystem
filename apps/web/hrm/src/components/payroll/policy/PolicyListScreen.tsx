/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Danh sách chính sách (S1)
 * Route:      /hr/payroll/policy-engine (tab "Chính sách")
 * BEEndpoint: GET /api/hrm/pay-policies
 * WorkItem:   HRM-POLICY-FE-S1
 * Coded:      2026-08-22
 */
import { useEffect, useState } from "react";
import { BatchAPI, type Payslip, type Policy, PolicyAPI } from "../../../lib/api/hrm-policy-api";
import { PayslipPanel } from "../payslip/PayslipPanel";
import { PolicyBuilderScreen } from "./PolicyBuilderScreen";

type View = "list" | "builder" | "payslip";

const badge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    ACTIVE: { bg: "#16a34a22", color: "#4ade80" },
    DRAFT: { bg: "#d9770622", color: "#fb923c" },
    ARCHIVED: { bg: "#64748b22", color: "#94a3b8" },
  };
  const s = map[status] ?? { bg: "#334155", color: "#94a3b8" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{status}</span>;
};

const S = {
  card: { background: "#1a1f2e", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #2a2f45" } as React.CSSProperties,
  input: { background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "8px 14px", fontSize: 14 } as React.CSSProperties,
  btn: (color: string): React.CSSProperties => ({ background: color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }),
  table: { width: "100%", borderCollapse: "collapse" } as React.CSSProperties,
  th: { background: "#1e2540", color: "#94a3b8", fontSize: 12, fontWeight: 600, padding: "10px 16px", textAlign: "left", textTransform: "uppercase", letterSpacing: 1 } as React.CSSProperties,
  td: { padding: "12px 16px", borderBottom: "1px solid #1e2540", fontSize: 14, color: "#e8eaf0" } as React.CSSProperties,
};

export function PolicyListScreen() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<View>("list");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", pay_group_code: "", effective_from: "", description: "" });
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [payslipLoading, setPayslipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PolicyAPI.list({ status: filterStatus || undefined, pay_group_code: filterGroup || undefined });
      setPolicies(data);
    } catch (e: unknown) { setError((e as { message?: string }).message ?? "Lỗi tải dữ liệu"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [filterStatus, filterGroup]);

  const handleActivate = async (id: string) => {
    if (!confirm("Kích hoạt chính sách này? Phiên bản cũ sẽ bị đóng.")) return;
    try { await PolicyAPI.activate(id); await load(); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi"); }
  };

  const handleClone = async (id: string, name: string) => {
    const newName = prompt("Tên chính sách mới:", `${name} (clone)`);
    if (!newName) return;
    const from = prompt("Ngày hiệu lực (YYYY-MM-DD):", new Date().toISOString().slice(0,10));
    if (!from) return;
    try { const r = await PolicyAPI.clone(id, { name: newName, effective_from: from }); alert(`Đã clone → ${r.policy_id}`); await load(); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi"); }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.pay_group_code || !createForm.effective_from) return alert("Điền đủ thông tin bắt buộc");
    setCreating(true);
    try {
      await PolicyAPI.create(createForm);
      setShowCreate(false);
      setCreateForm({ name: "", pay_group_code: "", effective_from: "", description: "" });
      await load();
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi tạo chính sách"); }
    finally { setCreating(false); }
  };

  const handleViewPayslip = async (policyId: string) => {
    const empId = prompt("Employee ID để xem payslip preview:");
    if (!empId) return;
    const period = prompt("Kỳ lương (YYYY-MM):", new Date().toISOString().slice(0,7));
    if (!period) return;
    setPayslipLoading(true);
    try {
      const ps = await BatchAPI.getPayslip(empId, period);
      setPayslip(ps);
      setView("payslip");
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi"); }
    finally { setPayslipLoading(false); }
  };

  if (view === "builder" && selectedId) {
    return <PolicyBuilderScreen policyId={selectedId} onBack={() => { setView("list"); void load(); }} />;
  }
  if (view === "payslip" && payslip) {
    return (
      <div>
        <button style={S.btn("#6366f1")} onClick={() => setView("list")}>← Quay lại</button>
        <div style={{ marginTop: 20 }}><PayslipPanel payslip={payslip} /></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={S.input} id="filter-status">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
        <input value={filterGroup} onChange={e => setFilterGroup(e.target.value)} placeholder="Pay Group Code..." style={{ ...S.input, minWidth: 160 }} id="filter-group" />
        <button style={S.btn("#6366f1")} onClick={() => setShowCreate(true)} id="btn-create-policy">+ Tạo chính sách</button>
        <button style={S.btn("#334155")} onClick={load} id="btn-refresh">↻ Làm mới</button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={S.card}>
          <h3 style={{ margin: "0 0 16px", color: "#a5b4fc" }}>Tạo chính sách mới</h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <input id="create-name" placeholder="Tên chính sách *" style={S.input} value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
            <input id="create-pay-group" placeholder="Pay Group Code *" style={S.input} value={createForm.pay_group_code} onChange={e => setCreateForm(f => ({ ...f, pay_group_code: e.target.value }))} />
            <input id="create-effective-from" type="date" style={S.input} value={createForm.effective_from} onChange={e => setCreateForm(f => ({ ...f, effective_from: e.target.value }))} />
            <input id="create-description" placeholder="Mô tả" style={S.input} value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={S.btn("#6366f1")} onClick={handleCreate} disabled={creating} id="btn-create-submit">{creating ? "Đang tạo..." : "Tạo"}</button>
            <button style={S.btn("#334155")} onClick={() => setShowCreate(false)}>Hủy</button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6366f1" }}>⏳ Đang tải...</div>
      ) : error ? (
        <div style={{ ...S.card, borderColor: "#ef4444", color: "#f87171" }}>❌ {error}</div>
      ) : policies.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#475569" }}>Chưa có chính sách nào. Nhấn "+ Tạo chính sách" để bắt đầu.</div>
      ) : (
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <table style={S.table}>
            <thead>
              <tr>
                {["Tên", "Pay Group", "Trạng thái", "Phiên bản", "Hiệu lực từ", "Components", "Thao tác"].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {policies.map(p => (
                <tr key={p.id} style={{ transition: "background .15s" }} onMouseEnter={e => (e.currentTarget.style.background = "#1e2540")} onMouseLeave={e => (e.currentTarget.style.background = "")}>
                  <td style={S.td}><strong>{p.name}</strong></td>
                  <td style={S.td}><code style={{ background: "#1e2540", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{p.pay_group_code}</code></td>
                  <td style={S.td}>{badge(p.status)}</td>
                  <td style={{ ...S.td, textAlign: "center" }}>v{p.version}</td>
                  <td style={S.td}>{p.effective_from}</td>
                  <td style={{ ...S.td, textAlign: "center" }}>{p.assignment_count ?? "—"}</td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button style={S.btn("#6366f1")} onClick={() => { setSelectedId(p.id); setView("builder"); }} id={`btn-edit-${p.id}`}>Xem/Sửa</button>
                      {p.status === "DRAFT" && <button style={S.btn("#16a34a")} onClick={() => handleActivate(p.id)} id={`btn-activate-${p.id}`}>Kích hoạt</button>}
                      <button style={S.btn("#334155")} onClick={() => handleClone(p.id, p.name)} id={`btn-clone-${p.id}`}>Clone</button>
                      {p.status === "ACTIVE" && <button style={S.btn("#7c3aed")} onClick={() => handleViewPayslip(p.id)} disabled={payslipLoading}>Payslip</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
