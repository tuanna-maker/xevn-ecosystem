/**
 * @CODE-MEMORY
 * Component:  SmartTargetPicker — Step 2 của PolicyBuilderDrawer
 * UC:         UC-POL-05
 * Spec:       implementation_plan.md §UIUX 5.3 Step 2
 * WorkItem:   HRM-POLICY-HUB-V2
 * Coded:      2026-08-27
 * SOLID:      SRP; OCP — render target picker phụ thuộc group.code
 */
import { useCallback, useEffect, useState } from "react";
import type { LookupItem, PolicyAssignment, PolicyGroup } from "../../../lib/api/hrm-policy-api";
import { LookupAPI, PolicyAssignmentAPI } from "../../../lib/api/hrm-policy-api";

type Props = {
  group: PolicyGroup;
  policyId: string;
  assignments: PolicyAssignment[];
  onAssignmentsChange: (a: PolicyAssignment[]) => void;
};

const TARGET_TYPE_BY_GROUP: Record<string, Array<{ value: string; label: string }>> = {
  LUONG: [
    { value: "job_title", label: "Chức danh" },
    { value: "department", label: "Phòng ban" },
    { value: "pay_group", label: "Nhóm đối tượng" },
    { value: "employee", label: "Cá nhân cụ thể" },
    { value: "all", label: "Tất cả nhân viên" },
  ],
  THUONG: [
    { value: "pay_group", label: "Nhóm đối tượng" },
    { value: "job_title", label: "Chức danh" },
    { value: "employee", label: "Cá nhân cụ thể" },
    { value: "all", label: "Tất cả nhân viên" },
  ],
  GIA: [
    { value: "job_title", label: "Chức danh" },
    { value: "department", label: "Phòng ban" },
    { value: "employee", label: "Cá nhân cụ thể" },
  ],
  PHAT: [
    { value: "job_title", label: "Chức danh" },
    { value: "pay_group", label: "Nhóm đối tượng" },
    { value: "all", label: "Tất cả nhân viên" },
  ],
  BHXH: [{ value: "all", label: "Tất cả nhân viên (bắt buộc)" }],
  THUE: [{ value: "all", label: "Tất cả nhân viên (bắt buộc)" }],
};

const PRIORITY_BY_TYPE: Record<string, number> = {
  contract: 10, employee: 20, job_title: 30, department: 40, pay_group: 50, all: 99,
};

const S: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#a5b4fc", marginBottom: 8 },
  addArea: {
    background: "#1a1f2e", border: "1px solid #2a2f45", borderRadius: 10,
    padding: 16, display: "flex", flexDirection: "column", gap: 12,
  },
  row: { display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" },
  label: { fontSize: 12, color: "#64748b", marginBottom: 4, display: "block" },
  select: {
    background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0",
    borderRadius: 8, padding: "9px 12px", fontSize: 13, cursor: "pointer", flex: 1, minWidth: 160,
  },
  input: {
    background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0",
    borderRadius: 8, padding: "9px 12px", fontSize: 13, flex: 1, minWidth: 180, outline: "none",
  },
  addBtn: {
    background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
    padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" as const,
  },
  assignmentList: { display: "flex", flexDirection: "column", gap: 8 },
  assignmentRow: {
    background: "#1a1f2e", border: "1px solid #2a2f45", borderRadius: 8,
    padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
  },
  typeTag: (type: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 700, borderRadius: 12, padding: "3px 8px",
    background: type === "all" ? "#6b728020" : "#6366f120",
    color: type === "all" ? "#94a3b8" : "#a5b4fc",
    border: `1px solid ${type === "all" ? "#2a2f45" : "#6366f140"}`,
    textTransform: "uppercase" as const, letterSpacing: 0.5,
  }),
  priorityTag: {
    fontSize: 11, color: "#f59e0b", background: "#f59e0b18",
    border: "1px solid #f59e0b30", borderRadius: 10, padding: "2px 8px",
  },
  removeBtn: {
    marginLeft: "auto", background: "none", border: "none", color: "#64748b",
    cursor: "pointer", fontSize: 16, padding: "4px 8px",
  },
  emptyHint: { color: "#64748b", fontSize: 13, textAlign: "center" as const, padding: "20px 0" },
};

type AddForm = { targetType: string; targetKey: string; effectiveFrom: string };

export function SmartTargetPicker({ group, policyId, assignments, onAssignmentsChange }: Props) {
  const allowedTypes = TARGET_TYPE_BY_GROUP[group.code] ?? TARGET_TYPE_BY_GROUP["LUONG"];
  const isAllOnly = group.code === "BHXH" || group.code === "THUE";

  const [form, setForm] = useState<AddForm>({
    targetType: allowedTypes[0]?.value ?? "all",
    targetKey: "",
    effectiveFrom: new Date().toISOString().slice(0, 10),
  });
  const [lookupItems, setLookupItems] = useState<LookupItem[]>([]);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load lookup options based on targetType
  const loadLookup = useCallback(async (type: string, search?: string) => {
    if (type === "all" || type === "contract") return;
    setLoadingLookup(true);
    try {
      if (type === "job_title") setLookupItems(await LookupAPI.positions(search));
      else if (type === "department") setLookupItems(await LookupAPI.departments(search));
      else if (type === "pay_group") setLookupItems(await LookupAPI.payGroups());
    } catch { setLookupItems([]); }
    finally { setLoadingLookup(false); }
  }, []);

  useEffect(() => { loadLookup(form.targetType); }, [form.targetType, loadLookup]);

  // Auto-add "all" assignment for BHXH/THUE if none exists
  useEffect(() => {
    if (isAllOnly && assignments.length === 0 && policyId) {
      PolicyAssignmentAPI.create(policyId, {
        target_type: "all",
        effective_from: new Date().toISOString().slice(0, 10),
      }).then((a) => onAssignmentsChange([a])).catch(console.error);
    }
  }, [isAllOnly, assignments.length, policyId, onAssignmentsChange]);

  const handleAdd = async () => {
    if (!form.targetType || !form.effectiveFrom) return;
    if (form.targetType !== "all" && !form.targetKey) {
      alert("Vui lòng chọn đối tượng cụ thể");
      return;
    }
    setSaving(true);
    try {
      const created = await PolicyAssignmentAPI.create(policyId, {
        target_type: form.targetType,
        target_key: form.targetType !== "all" ? form.targetKey : undefined,
        effective_from: form.effectiveFrom,
      });
      onAssignmentsChange([...assignments, created]);
      setForm((f) => ({ ...f, targetKey: "" }));
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi thêm đối tượng"); }
    finally { setSaving(false); }
  };

  const handleRemove = async (a: PolicyAssignment) => {
    if (!confirm("Xóa đối tượng này khỏi chính sách?")) return;
    try {
      await PolicyAssignmentAPI.delete(policyId, a.id);
      onAssignmentsChange(assignments.filter((x) => x.id !== a.id));
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi xóa đối tượng"); }
  };

  const needsKeyInput = form.targetType !== "all" && form.targetType !== "contract";
  const showLookup = lookupItems.length > 0 && needsKeyInput;

  return (
    <div style={S.root}>
      <div>
        <div style={S.sectionTitle}>🎯 Đối tượng đã chọn ({assignments.length})</div>
        <div style={S.assignmentList}>
          {assignments.length === 0 ? (
            <div style={S.emptyHint}>
              {isAllOnly
                ? "Đang áp dụng cho tất cả nhân viên (tự động)"
                : "Chưa có đối tượng nào. Thêm bên dưới →"}
            </div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} style={S.assignmentRow}>
                <span style={S.typeTag(a.target_type)}>{a.target_type}</span>
                <span style={{ color: "#e8eaf0", fontWeight: 500 }}>
                  {a.target_key ?? a.target_id ?? "Tất cả nhân viên"}
                </span>
                <span style={S.priorityTag}>priority: {a.priority}</span>
                {!isAllOnly && (
                  <button style={S.removeBtn} onClick={() => handleRemove(a)} title="Xóa đối tượng này">
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {!isAllOnly && (
        <div style={S.addArea}>
          <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>+ Thêm đối tượng áp dụng</div>
          <div style={S.row}>
            <div style={{ flex: "0 0 180px" }}>
              <label style={S.label}>Loại đối tượng</label>
              <select
                id="target-type-select"
                style={S.select}
                value={form.targetType}
                onChange={(e) => setForm((f) => ({ ...f, targetType: e.target.value, targetKey: "" }))}
              >
                {allowedTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {needsKeyInput && (
              <div style={{ flex: 1 }}>
                <label style={S.label}>
                  {form.targetType === "job_title" ? "Chức danh" :
                    form.targetType === "department" ? "Phòng ban" :
                      form.targetType === "pay_group" ? "Nhóm đối tượng" : "Giá trị"}
                </label>
                {showLookup ? (
                  <select
                    id="target-key-select"
                    style={S.select}
                    value={form.targetKey}
                    onChange={(e) => setForm((f) => ({ ...f, targetKey: e.target.value }))}
                  >
                    <option value="">-- Chọn --</option>
                    {loadingLookup ? (
                      <option disabled>Đang tải...</option>
                    ) : (
                      lookupItems.map((item) => (
                        <option key={item.key} value={item.key}>{item.label} ({item.key})</option>
                      ))
                    )}
                  </select>
                ) : (
                  <input
                    id="target-key-input"
                    style={S.input}
                    placeholder="Nhập key (VD: LX_TUYEN)"
                    value={form.targetKey}
                    onChange={(e) => setForm((f) => ({ ...f, targetKey: e.target.value }))}
                  />
                )}
              </div>
            )}

            <div style={{ flex: "0 0 160px" }}>
              <label style={S.label}>Hiệu lực từ</label>
              <input
                id="target-effective-from"
                type="date"
                style={S.input}
                value={form.effectiveFrom}
                onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
              />
            </div>

            <button
              id="btn-target-add"
              style={{ ...S.addBtn, marginBottom: 0 }}
              onClick={handleAdd}
              disabled={saving}
            >
              {saving ? "..." : "+ Thêm"}
            </button>
          </div>
          {needsKeyInput && (
            <div style={{ fontSize: 12, color: "#475569" }}>
              Priority sẽ tự động: {PRIORITY_BY_TYPE[form.targetType] ?? 50} ({form.targetType})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
