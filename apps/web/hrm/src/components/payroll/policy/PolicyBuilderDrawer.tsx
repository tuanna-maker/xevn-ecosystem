/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Policy Builder Drawer (Màn 3)
 * UC:         UC-POL-03, UC-POL-04, UC-POL-05, UC-POL-06
 * Spec:       implementation_plan.md §UIUX 5.3
 * WorkItem:   HRM-POLICY-HUB-V2
 * Coded:      2026-08-27
 * SOLID:      SRP — 4-step wizard; delegates to sub-editors via ComponentEditorPanel
 */
import { useEffect, useReducer, useRef, useState } from "react";
import type { Policy, PolicyAssignment, PolicyComponent, PolicyGroup } from "../../../lib/api/hrm-policy-api";
import { PolicyAPI, PolicyAssignmentAPI } from "../../../lib/api/hrm-policy-api";
import { ComponentEditorPanel } from "./ComponentEditorPanel";
import { SmartTargetPicker } from "./SmartTargetPicker";

type Props = {
  group: PolicyGroup;
  editPolicy?: Policy | null;
  onClose: () => void;
  onSaved: () => void;
};

type Step = 1 | 2 | 3 | 4;

type FormState = {
  name: string;
  pay_group_code: string;
  effective_from: string;
  effective_to: string;
  description: string;
};

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed" as const, inset: 0, background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", justifyContent: "flex-end",
  },
  drawer: {
    width: 880, maxWidth: "95vw", height: "100vh",
    background: "#ffffff", display: "flex", flexDirection: "column",
    boxShadow: "-12px 0 50px rgba(0,0,0,0.2)", overflow: "hidden",
  },
  drawerHeader: {
    padding: "20px 24px", background: "#ffffff",
    borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12,
  },
  drawerTitle: { fontSize: 18, fontWeight: 700, color: "#0f172a", flex: 1, margin: 0 },
  closeBtn: { background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer", lineHeight: 1 },
  stepBar: {
    display: "flex", padding: "16px 24px", gap: 0, background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  stepItem: (active: boolean, done: boolean): React.CSSProperties => ({
    flex: 1, display: "flex", alignItems: "center", gap: 8, fontSize: 13,
    color: done ? "#16a34a" : active ? "#4f46e5" : "#64748b",
    fontWeight: active || done ? 600 : 400,
  }),
  stepNum: (active: boolean, done: boolean): React.CSSProperties => ({
    width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, flexShrink: 0,
    background: done ? "#16a34a" : active ? "#4f46e5" : "#e2e8f0",
    color: done || active ? "#fff" : "#475569",
    border: `2px solid ${done ? "#16a34a" : active ? "#4f46e5" : "#cbd5e1"}`,
  }),
  stepConnector: (done: boolean): React.CSSProperties => ({
    flex: 1, height: 2, background: done ? "#16a34a" : "#e2e8f0",
    margin: "0 4px", borderRadius: 1,
  }),
  body: { flex: 1, overflowY: "auto" as const, padding: 24, background: "#ffffff" },
  footer: {
    padding: "16px 24px", background: "#ffffff",
    borderTop: "1px solid #e2e8f0", display: "flex", gap: 10, justifyContent: "flex-end",
  },
  btnSecondary: {
    background: "#ffffff", border: "1px solid #cbd5e1", color: "#334155",
    borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 14, fontWeight: 500,
  },
  btnPrimary: {
    background: "linear-gradient(135deg,#6366f1,#4f46e5)",
    color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px",
    fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 4px rgba(99,102,241,0.2)",
  },
  btnSuccess: {
    background: "linear-gradient(135deg,#16a34a,#15803d)",
    color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px",
    fontWeight: 600, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 4px rgba(22,163,74,0.2)",
  },
  label: { display: "block", fontSize: 13, color: "#475569", marginBottom: 6, fontWeight: 600 },
  required: { color: "#ef4444", marginLeft: 2 },
  input: {
    width: "100%", background: "#ffffff", border: "1px solid #cbd5e1",
    color: "#0f172a", borderRadius: 8, padding: "10px 14px", fontSize: 14,
    boxSizing: "border-box" as const, outline: "none",
  },
  select: {
    width: "100%", background: "#ffffff", border: "1px solid #cbd5e1",
    color: "#0f172a", borderRadius: 8, padding: "10px 14px", fontSize: 14,
    boxSizing: "border-box" as const, cursor: "pointer",
  },
  formRow2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  formGroup: { marginBottom: 18 },
  reviewSection: {
    background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: "16px 20px", marginBottom: 14,
  },
  reviewTitle: { fontSize: 13, color: "#4f46e5", fontWeight: 700, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  reviewRow: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 },
  reviewKey: { color: "#64748b" },
  reviewVal: { color: "#0f172a", fontWeight: 600 },
};

const STEP_LABELS = ["Thông tin cơ bản", "Đối tượng áp dụng", "Thành phần tính lương", "Xem lại & Lưu"];

export function PolicyBuilderDrawer({ group, editPolicy, onClose, onSaved }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useReducer(
    (prev: FormState, patch: Partial<FormState>) => ({ ...prev, ...patch }),
    {
      name: editPolicy?.name ?? "",
      pay_group_code: editPolicy?.pay_group_code ?? "",
      effective_from: editPolicy?.effective_from ?? new Date().toISOString().slice(0, 10),
      effective_to: editPolicy?.effective_to ?? "",
      description: editPolicy?.description ?? "",
    },
  );

  const [policyId, setPolicyId] = useState<string | null>(editPolicy?.id ?? null);
  const [assignments, setAssignments] = useState<PolicyAssignment[]>([]);
  const [components, setComponents] = useState<PolicyComponent[]>(editPolicy?.components ?? []);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Load assignments if editing
  useEffect(() => {
    if (editPolicy?.id) {
      PolicyAssignmentAPI.list(editPolicy.id).then(setAssignments).catch(console.error);
      if (editPolicy.components) setComponents(editPolicy.components);
      else PolicyAPI.get(editPolicy.id).then((p) => setComponents(p.components ?? [])).catch(console.error);
    }
  }, [editPolicy]);

  const goNext = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const goPrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  // Step 1 → 2: Save basic info first (create or use existing id)
  const handleStep1Next = async () => {
    if (!form.name.trim() || !form.effective_from) {
      alert("Tên chính sách và ngày hiệu lực là bắt buộc");
      return;
    }
    if (!policyId) {
      // Create draft policy
      setSaving(true);
      try {
        const res = await PolicyAPI.create({
          name: form.name.trim(),
          pay_group_code: form.pay_group_code || group.code,
          group_id: group.id,
          effective_from: form.effective_from,
          effective_to: form.effective_to || undefined,
          description: form.description || undefined,
        });
        setPolicyId(res.policy_id);
        goNext();
      } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi tạo chính sách"); }
      finally { setSaving(false); }
    } else {
      goNext();
    }
  };

  const handleSaveDraft = async () => {
    onSaved();
    onClose();
  };

  const handleActivate = async () => {
    if (!policyId) return;
    setSaving(true);
    try {
      await PolicyAPI.activate(policyId);
      onSaved();
      onClose();
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi kích hoạt"); }
    finally { setSaving(false); }
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      if (confirm("Đóng mà không lưu?")) onClose();
    }
  };

  const isEditing = !!editPolicy;

  return (
    <div style={S.overlay} onClick={handleOverlayClick}>
      <div style={S.drawer} ref={drawerRef} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={S.drawerHeader}>
          <h2 style={S.drawerTitle}>
            {group.icon} {isEditing ? "Sửa chính sách" : "Tạo chính sách mới"}
            {isEditing && <span style={{ fontSize: 13, color: "#64748b", marginLeft: 8, fontWeight: 400 }}>— {editPolicy.name}</span>}
          </h2>
          <button style={S.closeBtn} onClick={onClose} id="btn-policy-drawer-close">✕</button>
        </div>

        {/* Step bar */}
        <div style={S.stepBar}>
          {STEP_LABELS.map((label, i) => {
            const sn = (i + 1) as Step;
            const active = step === sn;
            const done = step > sn;
            return (
              <>
                <div key={sn} style={S.stepItem(active, done)}>
                  <span style={S.stepNum(active, done)}>{done ? "✓" : sn}</span>
                  <span>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div key={`c${i}`} style={S.stepConnector(step > sn)} />
                )}
              </>
            );
          })}
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div>
              <div style={S.formGroup}>
                <label style={S.label} htmlFor="pf-name">Tên chính sách<span style={S.required}>*</span></label>
                <input
                  id="pf-name"
                  style={S.input}
                  value={form.name}
                  onChange={(e) => setForm({ name: e.target.value })}
                  placeholder="VD: Lương cơ bản LX Tuyến 2026"
                />
              </div>
              <div style={S.formRow2}>
                <div style={S.formGroup}>
                  <label style={S.label} htmlFor="pf-group">Nhóm chính sách</label>
                  <input id="pf-group" style={{ ...S.input, color: group.color_hex ?? "#6366f1", fontWeight: 600 }} value={`${group.icon ?? ""} ${group.name_vi}`} readOnly />
                </div>
                <div style={S.formGroup}>
                  <label style={S.label} htmlFor="pf-pgc">Nhóm đối tượng (pay_group)</label>
                  <input
                    id="pf-pgc"
                    style={S.input}
                    value={form.pay_group_code}
                    onChange={(e) => setForm({ pay_group_code: e.target.value })}
                    placeholder="VD: LX_TUYEN"
                  />
                </div>
              </div>
              <div style={S.formRow2}>
                <div style={S.formGroup}>
                  <label style={S.label} htmlFor="pf-from">Hiệu lực từ<span style={S.required}>*</span></label>
                  <input
                    id="pf-from" type="date" style={S.input}
                    value={form.effective_from}
                    onChange={(e) => setForm({ effective_from: e.target.value })}
                  />
                </div>
                <div style={S.formGroup}>
                  <label style={S.label} htmlFor="pf-to">Hiệu lực đến (để trống = vô thời hạn)</label>
                  <input
                    id="pf-to" type="date" style={S.input}
                    value={form.effective_to}
                    onChange={(e) => setForm({ effective_to: e.target.value })}
                  />
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.label} htmlFor="pf-desc">Mô tả</label>
                <textarea
                  id="pf-desc"
                  style={{ ...S.input, height: 80, resize: "vertical" as const }}
                  value={form.description}
                  onChange={(e) => setForm({ description: e.target.value })}
                  placeholder="Mô tả ngắn về chính sách..."
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Target Picker ── */}
          {step === 2 && policyId && (
            <SmartTargetPicker
              group={group}
              policyId={policyId}
              assignments={assignments}
              onAssignmentsChange={setAssignments}
            />
          )}

          {/* ── Step 3: Components ── */}
          {step === 3 && policyId && (
            <ComponentEditorPanel
              policyId={policyId}
              components={components}
              onComponentsChange={setComponents}
              isActive={editPolicy?.status === "ACTIVE"}
            />
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div>
              <div style={S.reviewSection}>
                <div style={S.reviewTitle}>📋 Thông tin cơ bản</div>
                <div style={S.reviewRow}><span style={S.reviewKey}>Tên</span><span style={S.reviewVal}>{form.name}</span></div>
                <div style={S.reviewRow}><span style={S.reviewKey}>Nhóm</span><span style={S.reviewVal}>{group.icon} {group.name_vi}</span></div>
                <div style={S.reviewRow}><span style={S.reviewKey}>Nhóm ĐT</span><span style={S.reviewVal}>{form.pay_group_code || "—"}</span></div>
                <div style={S.reviewRow}><span style={S.reviewKey}>Hiệu lực từ</span><span style={S.reviewVal}>{form.effective_from}</span></div>
                <div style={S.reviewRow}><span style={S.reviewKey}>Hiệu lực đến</span><span style={S.reviewVal}>{form.effective_to || "Vô thời hạn"}</span></div>
              </div>

              <div style={S.reviewSection}>
                <div style={S.reviewTitle}>🎯 Đối tượng áp dụng ({assignments.length})</div>
                {assignments.length === 0 ? (
                  <div style={{ color: "#f59e0b", fontSize: 13 }}>⚠️ Chưa có đối tượng — chính sách sẽ không áp dụng cho ai</div>
                ) : (
                  assignments.map((a) => (
                    <div key={a.id} style={{ ...S.reviewRow, borderBottom: "1px solid #1e2235", paddingBottom: 6, marginBottom: 6 }}>
                      <span style={S.reviewKey}>{a.target_type}</span>
                      <span style={S.reviewVal}>{a.target_key ?? a.target_id ?? "Tất cả"}</span>
                      <span style={{ color: "#64748b", fontSize: 12 }}>priority: {a.priority}</span>
                    </div>
                  ))
                )}
              </div>

              <div style={S.reviewSection}>
                <div style={S.reviewTitle}>⚙️ Thành phần tính lương ({components.length})</div>
                {components.length === 0 ? (
                  <div style={{ color: "#f87171", fontSize: 13 }}>❌ Chưa có thành phần — không thể kích hoạt</div>
                ) : (
                  components.map((c, i) => (
                    <div key={c.id} style={{ ...S.reviewRow, marginBottom: 4 }}>
                      <span style={{ color: "#94a3b8", fontSize: 12, width: 20 }}>{i + 1}.</span>
                      <span style={S.reviewVal}>{c.name}</span>
                      <span style={{ color: c.is_deduction ? "#f87171" : "#10b981", fontSize: 12 }}>
                        {c.is_deduction ? "−KT" : "+TN"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={S.footer}>
          {step > 1 && (
            <button style={S.btnSecondary} onClick={goPrev} disabled={saving}>
              ← Quay lại
            </button>
          )}
          <button style={S.btnSecondary} onClick={onClose} disabled={saving}>
            Hủy
          </button>
          {step < 4 && step !== 1 && (
            <button style={S.btnPrimary} onClick={goNext} disabled={saving}>
              Tiếp theo →
            </button>
          )}
          {step === 1 && (
            <button style={S.btnPrimary} onClick={handleStep1Next} disabled={saving}>
              {saving ? "Đang lưu..." : "Tiếp theo →"}
            </button>
          )}
          {step === 4 && (
            <>
              <button style={S.btnSecondary} onClick={handleSaveDraft} disabled={saving} id="btn-policy-save-draft">
                💾 Lưu nháp
              </button>
              <button
                style={{ ...S.btnSuccess, opacity: components.length === 0 ? 0.5 : 1 }}
                onClick={handleActivate}
                disabled={saving || components.length === 0}
                id="btn-policy-activate"
              >
                {saving ? "Đang xử lý..." : "🚀 Kích hoạt"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
