/**
 * Screen:     HRM · Ngạch-Bậc (S3)
 * WorkItem:   HRM-POLICY-FE-S3
 * Coded:      2026-08-22
 */
import { useEffect, useState } from "react";
import { GradeAPI, type Grade } from "../../../lib/api/hrm-policy-api";

const S = {
  card: { background: "#1a1f2e", borderRadius: 12, padding: 20, border: "1px solid #2a2f45" } as React.CSSProperties,
  th: { background: "#1e2540", color: "#94a3b8", fontSize: 12, padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 },
  td: { padding: "10px 14px", borderBottom: "1px solid #1e2540", fontSize: 13, color: "#e8eaf0" },
  badge: (group: string): React.CSSProperties => {
    const map: Record<string, string> = { LX_TUYEN: "#4f46e5", LX_TAI: "#0891b2", DPHH: "#059669", TONG_DAI: "#7c3aed", VP_HN: "#b45309" };
    return { background: (map[group] ?? "#334155") + "33", color: map[group] ?? "#94a3b8", borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 600 };
  },
};

function fmtM(vnd: string): string {
  return (parseInt(vnd) / 1_000_000).toFixed(1) + "M";
}

export function GradeManagementScreen() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Grade | null>(null);
  const [assignEmpId, setAssignEmpId] = useState("");
  const [assignGrade, setAssignGrade] = useState("");
  const [assignStep, setAssignStep] = useState("1");
  const [assignFrom, setAssignFrom] = useState(new Date().toISOString().slice(0, 10));

  const load = async () => {
    setLoading(true);
    try { setGrades(await GradeAPI.list()); }
    catch { setGrades([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const handleAssign = async () => {
    if (!assignEmpId || !assignGrade) return alert("Nhập Employee ID và chọn ngạch");
    try {
      await GradeAPI.assign(assignEmpId, { grade_code: assignGrade, step_number: parseInt(assignStep), effective_from: assignFrom });
      alert("Đã xếp ngạch-bậc thành công!");
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi"); }
  };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "#6366f1" }}>⏳ Đang tải...</div>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Grade list */}
      <div style={S.card}>
        <h3 style={{ margin: "0 0 16px", color: "#a5b4fc" }}>Bảng Ngạch-Bậc ({grades.length} ngạch)</h3>
        {grades.length === 0 ? (
          <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>Chưa có dữ liệu ngạch-bậc.<br />Chạy migration seed để khởi tạo.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {grades.map(g => (
              <div key={g.id} onClick={() => setSelected(g)}
                style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${selected?.id === g.id ? "#6366f1" : "#2a2f45"}`, cursor: "pointer", transition: "all .15s", background: selected?.id === g.id ? "#312e81" : "#0f1117" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{g.grade_code}</strong>
                    <span style={{ marginLeft: 8, fontSize: 13, color: "#94a3b8" }}>{g.grade_name}</span>
                  </div>
                  <span style={S.badge(g.pay_group_code)}>{g.pay_group_code}</span>
                </div>
                {g.steps.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                    Bậc 1: {fmtM(g.steps[0]?.monthly_salary_vnd ?? "0")} → Bậc {g.steps.length}: {fmtM(g.steps[g.steps.length - 1]?.monthly_salary_vnd ?? "0")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Step detail */}
        {selected && (
          <div style={S.card}>
            <h3 style={{ margin: "0 0 16px", color: "#a5b4fc" }}>{selected.grade_code} — {selected.grade_name}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Bậc", "Lương/tháng", "Thâm niên tối thiểu"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {selected.steps.map(step => (
                  <tr key={step.id}>
                    <td style={S.td}><strong>Bậc {step.step_number}</strong></td>
                    <td style={{ ...S.td, color: "#4ade80", fontWeight: 700 }}>{parseInt(step.monthly_salary_vnd).toLocaleString("vi-VN")} đ</td>
                    <td style={S.td}>{step.min_seniority_months} tháng</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Assign form */}
        <div style={S.card}>
          <h3 style={{ margin: "0 0 16px", color: "#a5b4fc" }}>Xếp Ngạch-Bậc cho Nhân viên</h3>
          <div style={{ display: "grid", gap: 12 }}>
            <input id="assign-emp-id" placeholder="Employee ID *" style={{ background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "8px 14px", fontSize: 14 }} value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)} />
            <select id="assign-grade" style={{ background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "8px 14px", fontSize: 14 }} value={assignGrade} onChange={e => setAssignGrade(e.target.value)}>
              <option value="">— Chọn ngạch —</option>
              {grades.map(g => <option key={g.id} value={g.grade_code}>{g.grade_code} — {g.grade_name}</option>)}
            </select>
            <input id="assign-step" type="number" min="1" max="9" placeholder="Bậc (1-9)" style={{ background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "8px 14px", fontSize: 14 }} value={assignStep} onChange={e => setAssignStep(e.target.value)} />
            <input id="assign-from" type="date" style={{ background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "8px 14px", fontSize: 14 }} value={assignFrom} onChange={e => setAssignFrom(e.target.value)} />
            <button style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }} onClick={handleAssign} id="btn-assign-grade">Xếp bậc</button>
          </div>
        </div>
      </div>
    </div>
  );
}
