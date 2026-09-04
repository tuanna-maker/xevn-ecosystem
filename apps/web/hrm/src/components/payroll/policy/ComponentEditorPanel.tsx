/**
 * @CODE-MEMORY
 * Component:  ComponentEditorPanel — Step 3 của PolicyBuilderDrawer
 * UC:         UC-POL-06
 * Spec:       implementation_plan.md §UIUX 5.3 Step 3 + 5.4
 * WorkItem:   HRM-POLICY-HUB-V2
 * Coded:      2026-08-27
 * SOLID:
 *   OCP — EDITOR_MAP: thêm loại mới = thêm entry, không sửa dispatch
 *   SRP — mỗi sub-editor chỉ xử lý params của loại đó
 */
import { useState } from "react";
import type { PolicyComponent } from "../../../lib/api/hrm-policy-api";
import { PolicyAPI } from "../../../lib/api/hrm-policy-api";
import { GradeBaseEditor } from "./editors/GradeBaseEditor";
import { InsuranceDeductionEditor } from "./editors/InsuranceDeductionEditor";
import { TieredEditor } from "./editors/TieredEditor";
import { FixedAmountEditor } from "./editors/FixedAmountEditor";

type Props = {
  policyId: string;
  components: PolicyComponent[];
  onComponentsChange: (c: PolicyComponent[]) => void;
  isActive?: boolean;
};

// ─── COMPONENT TYPE CATALOG ────────────────────────────────────────────────────
// Labels tiếng Việt + nhóm hiển thị
const COMPONENT_TYPES: Array<{ group: string; items: Array<{ type: string; label: string; isDeduction?: boolean }> }> = [
  {
    group: "Lương cơ bản",
    items: [
      { type: "grade_base", label: "Lương theo ngạch-bậc" },
      { type: "fixed_salary", label: "Lương cứng" },
      { type: "probation_salary", label: "Lương thử việc" },
      { type: "base_salary", label: "Lương cơ bản phẳng" },
    ],
  },
  {
    group: "Hoa hồng & Doanh thu",
    items: [
      { type: "trip_rate_tiered", label: "Lương lượt xe (bậc thang)" },
      { type: "revenue_commission_tiered", label: "Hoa hồng doanh thu (bậc thang)" },
      { type: "cpn_commission", label: "Hoa hồng CPN" },
      { type: "pool_distribution", label: "Chia pool doanh thu" },
      { type: "kpi_multiplier", label: "Nhân hệ số KPI" },
      { type: "ranking_bonus", label: "Thưởng xếp hạng" },
    ],
  },
  {
    group: "Phụ cấp & Thưởng",
    items: [
      { type: "allowance_basic", label: "Phụ cấp cơ bản" },
      { type: "allowance_fuel", label: "Phụ cấp xăng dầu" },
      { type: "meal_allowance", label: "Phụ cấp ăn" },
      { type: "attendance_bonus_conditional", label: "Thưởng chuyên cần" },
      { type: "flat_bonus", label: "Thưởng cứng" },
      { type: "revenue_bonus", label: "Thưởng doanh thu" },
      { type: "ot_overtime", label: "Phụ cấp OT" },
    ],
  },
  {
    group: "Khấu trừ",
    items: [
      { type: "insurance_deduction", label: "BHXH/BHYT/BHTN", isDeduction: true },
      { type: "advance_deduction", label: "Khấu trừ tạm ứng", isDeduction: true },
      { type: "penalty_deduction", label: "Khấu trừ vi phạm", isDeduction: true },
      { type: "tax_deduction", label: "Thuế TNCN", isDeduction: true },
    ],
  },
];

// ─── EDITOR MAP (OCP): thêm editor mới = thêm entry ─────────────────────────
const EDITOR_MAP: Record<string, React.ComponentType<{ params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void }>> = {
  grade_base: GradeBaseEditor,
  trip_rate_tiered: TieredEditor,
  revenue_commission_tiered: TieredEditor,
  insurance_deduction: InsuranceDeductionEditor,
  // Fallback: FixedAmountEditor covers flat types
};

function getEditor(type: string) {
  return EDITOR_MAP[type] ?? FixedAmountEditor;
}

const S: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 12 },
  toolbar: { display: "flex", gap: 10, alignItems: "center", marginBottom: 4 },
  addDropdown: { position: "relative" as const },
  addBtn: {
    background: "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff",
    border: "none", borderRadius: 8, padding: "9px 16px", cursor: "pointer",
    fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
  },
  dropdown: {
    position: "absolute" as const, top: "100%", left: 0, zIndex: 300, marginTop: 4,
    background: "#1e2235", border: "1px solid #2a2f45", borderRadius: 10,
    overflow: "hidden", minWidth: 280,
    boxShadow: "0 8px 32px rgba(0,0,0,.5)", maxHeight: 400, overflowY: "auto" as const,
  },
  dropGroup: { padding: "8px 12px 4px", fontSize: 11, color: "#6366f1", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  dropItem: {
    display: "block", width: "100%", padding: "8px 16px", fontSize: 13,
    color: "#e8eaf0", background: "none", border: "none", cursor: "pointer",
    textAlign: "left" as const,
  },
  componentCard: {
    background: "#1a1f2e", border: "1px solid #2a2f45", borderRadius: 10, overflow: "hidden",
  },
  componentHeader: {
    padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
    cursor: "pointer",
  },
  compNum: {
    width: 22, height: 22, borderRadius: "50%", background: "#6366f1",
    color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
  },
  compName: { fontWeight: 600, fontSize: 14, color: "#e8eaf0", flex: 1 },
  compType: { fontSize: 11, color: "#64748b", fontFamily: "monospace" },
  deductionBadge: {
    fontSize: 11, color: "#f87171", background: "#f8717118",
    border: "1px solid #f8717130", borderRadius: 10, padding: "2px 8px",
  },
  expandIcon: { color: "#64748b", fontSize: 14 },
  editorBody: {
    padding: "0 16px 16px", borderTop: "1px solid #1e2235",
  },
  delBtn: {
    background: "none", border: "none", color: "#64748b", cursor: "pointer",
    fontSize: 16, padding: "4px", borderRadius: 4,
  },
  activeWarning: { background: "#f59e0b18", border: "1px solid #f59e0b30", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#f59e0b" },
};

export function ComponentEditorPanel({ policyId, components, onComponentsChange, isActive }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [editedParams, setEditedParams] = useState<Record<string, Record<string, unknown>>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAdd = async (type: string, label: string, isDeduction = false) => {
    setDropdownOpen(false);
    if (isActive) { alert("Chính sách đang ACTIVE — không thể sửa. Clone trước."); return; }
    setSaving(true);
    try {
      await PolicyAPI.addComponent(policyId, {
        component_type: type,
        name: label,
        sort_order: (components.length + 1) * 10,
        is_deduction: isDeduction,
        input_source: "calculated",
        params: {},
      });
      // Reload components
      const updated = await PolicyAPI.get(policyId);
      onComponentsChange(updated.components ?? []);
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi thêm thành phần"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (comp: PolicyComponent) => {
    if (!confirm(`Xóa thành phần "${comp.name}"?`)) return;
    if (isActive) { alert("Chính sách đang ACTIVE — không thể sửa."); return; }
    try {
      await PolicyAPI.deleteComponent(policyId, comp.id);
      onComponentsChange(components.filter((c) => c.id !== comp.id));
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi xóa"); }
  };

  const handleParamChange = (compId: string, params: Record<string, unknown>) => {
    setEditedParams((prev) => ({ ...prev, [compId]: params }));
  };

  const handleSaveParams = async (comp: PolicyComponent) => {
    const params = editedParams[comp.id];
    if (!params) return;
    try {
      await PolicyAPI.updateComponent(policyId, comp.id, { params });
      onComponentsChange(components.map((c) => c.id === comp.id ? { ...c, params } : c));
      setEditedParams((prev) => { const n = { ...prev }; delete n[comp.id]; return n; });
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi lưu params"); }
  };

  return (
    <div style={S.root}>
      {isActive && (
        <div style={S.activeWarning}>
          ⚠️ Chính sách đang ACTIVE — chỉ xem. Để sửa, hãy Clone trước.
        </div>
      )}

      {/* Add button */}
      <div style={S.toolbar}>
        <div style={S.addDropdown}>
          <button
            id="btn-add-component"
            style={{ ...S.addBtn, opacity: saving ? 0.6 : 1 }}
            onClick={() => setDropdownOpen((v) => !v)}
            disabled={saving || isActive}
          >
            + Thêm thành phần ▾
          </button>
          {dropdownOpen && (
            <div style={S.dropdown}>
              {COMPONENT_TYPES.map((group) => (
                <div key={group.group}>
                  <div style={S.dropGroup}>{group.group}</div>
                  {group.items.map((item) => (
                    <button
                      key={item.type}
                      style={S.dropItem}
                      onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#6366f120"; }}
                      onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "none"; }}
                      onClick={() => handleAdd(item.type, item.label, item.isDeduction)}
                    >
                      {item.isDeduction ? "📉 " : "📈 "}{item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        <span style={{ color: "#64748b", fontSize: 13 }}>{components.length} thành phần</span>
      </div>

      {/* Components list */}
      {components.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: "32px 0" }}>
          Chưa có thành phần. Nhấn "+ Thêm thành phần" để bắt đầu.
        </div>
      ) : (
        components.map((comp, idx) => {
          const isExpanded = expandedIds.has(comp.id);
          const EditorComponent = getEditor(comp.component_type);
          const currentParams = editedParams[comp.id] ?? comp.params;
          const isDirty = !!editedParams[comp.id];

          return (
            <div key={comp.id} style={S.componentCard}>
              <div style={S.componentHeader} onClick={() => toggleExpand(comp.id)}>
                <span style={S.compNum}>{idx + 1}</span>
                <span style={S.compName}>{comp.name}</span>
                <span style={S.compType}>{comp.component_type}</span>
                {comp.is_deduction && <span style={S.deductionBadge}>−KT</span>}
                {!comp.is_deduction && <span style={{ ...S.deductionBadge, color: "#10b981", background: "#10b98118", borderColor: "#10b98130" }}>+TN</span>}
                <span style={S.expandIcon}>{isExpanded ? "▲" : "▼"}</span>
                {!isActive && (
                  <button
                    style={S.delBtn}
                    onClick={(e) => { e.stopPropagation(); handleDelete(comp); }}
                    title="Xóa thành phần"
                  >
                    🗑
                  </button>
                )}
              </div>

              {isExpanded && (
                <div style={S.editorBody}>
                  <EditorComponent
                    params={currentParams}
                    onChange={(p) => handleParamChange(comp.id, p)}
                  />
                  {isDirty && !isActive && (
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                      <button
                        style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                        onClick={() => handleSaveParams(comp)}
                      >
                        💾 Lưu cấu hình
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
