/**
 * GradeBaseEditor — Cấu hình lương theo ngạch-bậc
 * UC: UC-POL-06 | Spec: §UIUX 5.4 GradeBaseEditor
 * Params schema: { grade_job_map: { job_title_key: string, grade_code: string, grade_name: string, steps: { step: number, amount: number }[] }[] }
 */
import { useEffect, useState } from "react";
import { GradeAPI } from "../../../../lib/api/hrm-policy-api";
import type { Grade } from "../../../../lib/api/hrm-policy-api";

type GradeJobMap = {
  job_title_key: string;
  grade_code: string;
  steps: Record<number, number>; // step_number → amount_vnd
};

type Props = {
  params: Record<string, unknown>;
  onChange: (p: Record<string, unknown>) => void;
};

const fmtVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n);

const S: Record<string, React.CSSProperties> = {
  root: { marginTop: 12 },
  hint: { fontSize: 12, color: "#64748b", marginBottom: 12 },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", background: "#131820", color: "#64748b", fontWeight: 600, textAlign: "left" as const, borderBottom: "1px solid #2a2f45" },
  td: { padding: "8px 10px", borderBottom: "1px solid #1e2235", verticalAlign: "middle" as const },
  input: {
    background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0",
    borderRadius: 6, padding: "6px 10px", fontSize: 12, width: "100%",
    boxSizing: "border-box" as const, outline: "none",
  },
  select: {
    background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0",
    borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer", width: "100%",
  },
  addRowBtn: {
    marginTop: 10, background: "none", border: "1px dashed #2a2f45", color: "#6366f1",
    borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 12, width: "100%",
  },
  delBtn: {
    background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14,
  },
};

export function GradeBaseEditor({ params, onChange }: Props) {
  const raw = (params.grade_job_map ?? []) as GradeJobMap[];
  const [rows, setRows] = useState<GradeJobMap[]>(raw.length > 0 ? raw : [{ job_title_key: "", grade_code: "", steps: {} }]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [maxSteps, setMaxSteps] = useState(3);

  useEffect(() => {
    GradeAPI.list().then((data) => {
      setGrades(data);
      // Determine max steps from data
      const maxS = data.reduce((mx, g) => Math.max(mx, g.steps.length), 3);
      setMaxSteps(Math.max(maxS, 3));
    }).catch(() => {});
  }, []);

  const emit = (newRows: GradeJobMap[]) => {
    setRows(newRows);
    onChange({ ...params, grade_job_map: newRows });
  };

  const addRow = () => emit([...rows, { job_title_key: "", grade_code: "", steps: {} }]);
  const delRow = (i: number) => emit(rows.filter((_, idx) => idx !== i));

  const updateRow = (i: number, patch: Partial<GradeJobMap>) => {
    emit(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  };

  const updateStep = (rowIdx: number, step: number, val: string) => {
    const amount = parseInt(val.replace(/\D/g, ""), 10) || 0;
    const newRows = [...rows];
    newRows[rowIdx] = { ...newRows[rowIdx], steps: { ...newRows[rowIdx].steps, [step]: amount } };
    emit(newRows);
  };

  const stepNums = Array.from({ length: maxSteps }, (_, i) => i + 1);

  return (
    <div style={S.root}>
      <div style={S.hint}>Cấu hình mức lương theo chức danh + ngạch + từng bậc.</div>
      <div style={{ overflowX: "auto" }}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Chức danh (key)</th>
              <th style={S.th}>Ngạch</th>
              {stepNums.map((s) => <th key={s} style={S.th}>Bậc {s} (đ)</th>)}
              <th style={S.th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const gradeOptions = grades.filter((g) => !row.job_title_key || g.pay_group_code === row.job_title_key || true);
              return (
                <tr key={i}>
                  <td style={S.td}>
                    <input
                      style={S.input}
                      value={row.job_title_key}
                      onChange={(e) => updateRow(i, { job_title_key: e.target.value })}
                      placeholder="VD: LX_TUYEN"
                    />
                  </td>
                  <td style={S.td}>
                    <select
                      style={S.select}
                      value={row.grade_code}
                      onChange={(e) => updateRow(i, { grade_code: e.target.value })}
                    >
                      <option value="">-- Chọn ngạch --</option>
                      {gradeOptions.map((g) => (
                        <option key={g.id} value={g.grade_code}>{g.grade_code}</option>
                      ))}
                    </select>
                  </td>
                  {stepNums.map((s) => (
                    <td key={s} style={S.td}>
                      <input
                        style={S.input}
                        value={row.steps[s] ? fmtVnd(row.steps[s]) : ""}
                        onChange={(e) => updateStep(i, s, e.target.value)}
                        placeholder="0"
                      />
                    </td>
                  ))}
                  <td style={S.td}>
                    <button style={S.delBtn} onClick={() => delRow(i)} title="Xóa dòng">🗑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button style={S.addRowBtn} onClick={addRow}>+ Thêm dòng chức danh</button>
    </div>
  );
}
