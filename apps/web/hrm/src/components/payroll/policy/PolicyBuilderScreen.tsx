/**
 * @CODE-MEMORY
 * Screen:     HRM · Policy Builder (S2)
 * Route:      /hr/payroll/policy-engine → click Xem/Sửa
 * BEEndpoint: GET /pay-policies/:id, POST /pay-policies/:id/components,
 *             PUT reorder, DELETE component, POST activate
 * WorkItem:   HRM-POLICY-FE-S2
 * Coded:      2026-08-22
 */
import { useEffect, useState } from "react";
import { type Policy, type PolicyComponent, PolicyAPI } from "../../../lib/api/hrm-policy-api";

const COMPONENT_TYPES = [
  "grade_base","grade_allowance","kpi_bonus_pct","trip_rate_tiered",
  "revenue_quality","cpn_commission","contract_fee","vehicle_repair_deduction",
  "fixed_base_salary","vehicle_mgmt_allowance","revenue_commission_tiered",
  "fuel_quota_deduction","clhd_point_deduction","kpi_pool_share",
  "revenue_pool_commission","team_milestone_bonus","delivery_commission",
  "zero_sum_pool","attendance_bonus_conditional","meal_allowance_conditional",
  "remote_work_allowance","loading_support","special_allowance",
  "probation_override","fixed_trial_salary","ranking_bonus",
  "kpi_multiplier","penalty_deduction","insurance_deduction",
];

const S = {
  root: { display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, minHeight: "70vh" } as React.CSSProperties,
  panel: { background: "#1a1f2e", borderRadius: 12, border: "1px solid #2a2f45", overflow: "hidden" } as React.CSSProperties,
  header: { background: "#1e2540", padding: "14px 20px", borderBottom: "1px solid #2a2f45", display: "flex", justifyContent: "space-between", alignItems: "center" } as React.CSSProperties,
  compItem: (active: boolean, deduction: boolean): React.CSSProperties => ({
    padding: "12px 16px", borderBottom: "1px solid #1e2540", cursor: "pointer",
    background: active ? "#312e81" : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center",
    transition: "background .15s",
    borderLeft: `3px solid ${deduction ? "#f87171" : "#4ade80"}`,
  }),
  input: { background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "8px 14px", fontSize: 14, width: "100%", boxSizing: "border-box" as const },
  btn: (color: string): React.CSSProperties => ({ background: color, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }),
  label: { fontSize: 12, color: "#94a3b8", marginBottom: 4, display: "block" } as React.CSSProperties,
  field: { marginBottom: 14 } as React.CSSProperties,
};

export function PolicyBuilderScreen({ policyId, onBack }: { policyId: string; onBack: () => void }) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [selectedComp, setSelectedComp] = useState<PolicyComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ component_type: COMPONENT_TYPES[0], name: "", params: "{}" });
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setPolicy(await PolicyAPI.get(policyId)); }
    catch { setPolicy(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [policyId]);

  const handleDelete = async (compId: string) => {
    if (!confirm("Xóa component này?")) return;
    await PolicyAPI.deleteComponent(policyId, compId);
    setSelectedComp(null);
    await load();
  };

  const handleAddComp = async () => {
    setSaving(true);
    let params: Record<string, unknown> = {};
    try { params = JSON.parse(addForm.params) as Record<string, unknown>; }
    catch { alert("Params JSON không hợp lệ"); setSaving(false); return; }
    try {
      await PolicyAPI.addComponent(policyId, { component_type: addForm.component_type, name: addForm.name || addForm.component_type, sort_order: undefined, is_deduction: addForm.component_type.includes("deduction") || addForm.component_type.includes("penalty"), input_source: "system", params } as Omit<import("../../../lib/api/hrm-policy-api").PolicyComponent, "id" | "policy_id">);
      setShowAdd(false);
      setAddForm({ component_type: COMPONENT_TYPES[0], name: "", params: "{}" });
      await load();
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi"); }
    finally { setSaving(false); }
  };

  const handleActivate = async () => {
    if (!confirm("Kích hoạt chính sách? Phiên bản cũ sẽ bị đóng.")) return;
    try { await PolicyAPI.activate(policyId); await load(); alert("Đã kích hoạt!"); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi"); }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#6366f1" }}>⏳ Đang tải...</div>;
  if (!policy) return <div style={{ color: "#f87171" }}>Không tìm thấy chính sách</div>;

  const components = policy.components ?? [];
  const isEditable = policy.status === "DRAFT";

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button style={S.btn("#334155")} onClick={onBack}>← Danh sách</button>
          <div>
            <h2 style={{ margin: 0, color: "#a5b4fc", fontSize: 18 }}>{policy.name}</h2>
            <span style={{ fontSize: 12, color: "#64748b" }}>v{policy.version} · {policy.pay_group_code} · {policy.status}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isEditable && <button style={S.btn("#16a34a")} onClick={handleActivate} id="btn-activate">🚀 Kích hoạt</button>}
          {isEditable && <button style={S.btn("#6366f1")} onClick={() => setShowAdd(!showAdd)} id="btn-add-comp">+ Thêm component</button>}
        </div>
      </div>

      {/* Add component form */}
      {showAdd && (
        <div style={{ ...S.panel, padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", color: "#a5b4fc" }}>Thêm component</h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label style={S.label}>Loại component *</label>
              <select id="add-comp-type" style={{ ...S.input }} value={addForm.component_type} onChange={e => setAddForm(f => ({ ...f, component_type: e.target.value }))}>
                {COMPONENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Tên hiển thị</label>
              <input id="add-comp-name" style={S.input} value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder={addForm.component_type} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>Params (JSON)</label>
              <textarea id="add-comp-params" style={{ ...S.input, minHeight: 80, fontFamily: "monospace", resize: "vertical" }} value={addForm.params} onChange={e => setAddForm(f => ({ ...f, params: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={S.btn("#6366f1")} onClick={handleAddComp} disabled={saving} id="btn-add-comp-submit">{saving ? "Đang thêm..." : "Thêm"}</button>
            <button style={S.btn("#334155")} onClick={() => setShowAdd(false)}>Hủy</button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={S.root}>
        {/* Component list */}
        <div style={S.panel}>
          <div style={S.header}>
            <span style={{ color: "#e8eaf0", fontWeight: 600 }}>Components ({components.length})</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>Thu nhập ● Khấu trừ ●</span>
          </div>
          <div style={{ overflowY: "auto", maxHeight: "60vh" }}>
            {components.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>Chưa có component nào</div>
            ) : (
              components.map(comp => (
                <div key={comp.id} style={S.compItem(selectedComp?.id === comp.id, comp.is_deduction)} onClick={() => setSelectedComp(comp)}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{comp.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{comp.component_type}</div>
                  </div>
                  <div style={{ fontSize: 11, color: comp.is_deduction ? "#f87171" : "#4ade80" }}>
                    {comp.is_deduction ? "−KT" : "+TN"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Component detail */}
        <div style={S.panel}>
          {selectedComp ? (
            <div>
              <div style={S.header}>
                <span style={{ color: "#e8eaf0", fontWeight: 600 }}>Chi tiết: {selectedComp.name}</span>
                {isEditable && (
                  <button style={S.btn("#ef4444")} onClick={() => handleDelete(selectedComp.id)} id={`btn-del-${selectedComp.id}`}>Xóa</button>
                )}
              </div>
              <div style={{ padding: 20 }}>
                <div style={S.field}><label style={S.label}>Loại</label><code style={{ color: "#818cf8" }}>{selectedComp.component_type}</code></div>
                <div style={S.field}><label style={S.label}>Sort Order</label>{selectedComp.sort_order}</div>
                <div style={S.field}><label style={S.label}>Loại thu/khấu</label>{selectedComp.is_deduction ? "🔴 Khấu trừ" : "🟢 Thu nhập"}</div>
                <div style={S.field}><label style={S.label}>Nguồn dữ liệu</label>{selectedComp.input_source}</div>
                <div style={S.field}>
                  <label style={S.label}>Params</label>
                  <pre style={{ background: "#0f1117", padding: 14, borderRadius: 8, fontSize: 12, color: "#4ade80", overflow: "auto", margin: 0 }}>
                    {JSON.stringify(selectedComp.params, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#475569" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
              <div>Chọn một component để xem chi tiết</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
