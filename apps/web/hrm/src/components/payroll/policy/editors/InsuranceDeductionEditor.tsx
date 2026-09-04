/**
 * InsuranceDeductionEditor — Cấu hình BHXH/BHYT/BHTN
 * Params schema: { base_type: string, bhxh_pct: number, bhyt_pct: number, bhtn_pct: number, cap_multiplier?: number }
 */
import { useState } from "react";
type Props = { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void };

const S: Record<string, React.CSSProperties> = {
  root: { marginTop: 12, display: "flex", flexDirection: "column", gap: 14 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  label: { fontSize: 12, color: "#64748b", marginBottom: 4, display: "block" },
  input: { background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0", borderRadius: 6, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" as const, outline: "none" },
  select: { background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0", borderRadius: 6, padding: "8px 10px", fontSize: 13, cursor: "pointer", width: "100%" },
  hint: { fontSize: 11, color: "#475569", marginTop: 4 },
};

export function InsuranceDeductionEditor({ params, onChange }: Props) {
  const [base, setBase] = useState<string>((params.base_type as string) ?? "grade_base");
  const [bhxh, setBhxh] = useState<string>(String(params.bhxh_pct ?? 8));
  const [bhyt, setBhyt] = useState<string>(String(params.bhyt_pct ?? 1.5));
  const [bhtn, setBhtn] = useState<string>(String(params.bhtn_pct ?? 1));
  const [cap, setCap] = useState<string>(String(params.cap_multiplier ?? ""));

  const emit = (updates: Record<string, unknown>) =>
    onChange({ ...params, base_type: base, bhxh_pct: parseFloat(bhxh) || 0, bhyt_pct: parseFloat(bhyt) || 0, bhtn_pct: parseFloat(bhtn) || 0, cap_multiplier: cap ? parseFloat(cap) : null, ...updates });

  return (
    <div style={S.root}>
      <div>
        <label style={S.label}>Cơ sở đóng BH</label>
        <select style={S.select} value={base} onChange={(e) => { setBase(e.target.value); emit({ base_type: e.target.value }); }}>
          <option value="grade_base">Lương ngạch-bậc</option>
          <option value="contract_salary">Lương ghi trong HĐ</option>
          <option value="actual_income">Thu nhập thực tế</option>
        </select>
        <div style={S.hint}>Nguồn lương dùng làm căn cứ tính BHXH/BHYT/BHTN</div>
      </div>
      <div style={S.row2}>
        <div>
          <label style={S.label}>BHXH (%)</label>
          <input style={S.input} type="number" step="0.1" min="0" max="100" value={bhxh}
            onChange={(e) => { setBhxh(e.target.value); emit({ bhxh_pct: parseFloat(e.target.value) || 0 }); }} />
        </div>
        <div>
          <label style={S.label}>BHYT (%)</label>
          <input style={S.input} type="number" step="0.1" min="0" max="100" value={bhyt}
            onChange={(e) => { setBhyt(e.target.value); emit({ bhyt_pct: parseFloat(e.target.value) || 0 }); }} />
        </div>
        <div>
          <label style={S.label}>BHTN (%)</label>
          <input style={S.input} type="number" step="0.1" min="0" max="100" value={bhtn}
            onChange={(e) => { setBhtn(e.target.value); emit({ bhtn_pct: parseFloat(e.target.value) || 0 }); }} />
        </div>
      </div>
      <div>
        <label style={S.label}>Trần đóng (× lương cơ sở, bỏ trống = không có trần)</label>
        <input style={S.input} type="number" step="0.5" min="0" value={cap} placeholder="VD: 20"
          onChange={(e) => { setCap(e.target.value); emit({ cap_multiplier: parseFloat(e.target.value) || null }); }} />
        <div style={S.hint}>Theo NĐ, trần đóng BHXH = 20× lương cơ sở</div>
      </div>
    </div>
  );
}
