/**
 * TieredEditor — Cấu hình bậc thang (trip_rate_tiered, revenue_commission_tiered, etc.)
 * Params schema: { tiers: { from: number, to: number | null, rate: number }[] }
 */
import { useState } from "react";

type Tier = { from: number; to: number | null; rate: number };
type Props = { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void };

const fmtVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const S: Record<string, React.CSSProperties> = {
  root: { marginTop: 12 },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", background: "#131820", color: "#64748b", fontWeight: 600, textAlign: "left" as const, borderBottom: "1px solid #2a2f45" },
  td: { padding: "8px 10px", borderBottom: "1px solid #1e2235" },
  input: { background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0", borderRadius: 6, padding: "6px 10px", fontSize: 12, width: "100%", boxSizing: "border-box" as const, outline: "none" },
  addBtn: { marginTop: 10, background: "none", border: "1px dashed #2a2f45", color: "#6366f1", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 12, width: "100%" },
  delBtn: { background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 },
};

export function TieredEditor({ params, onChange }: Props) {
  const raw = (params.tiers ?? []) as Tier[];
  const [tiers, setTiers] = useState<Tier[]>(raw.length > 0 ? raw : [{ from: 0, to: null, rate: 0 }]);

  const emit = (t: Tier[]) => { setTiers(t); onChange({ ...params, tiers: t }); };
  const addTier = () => {
    const last = tiers[tiers.length - 1];
    emit([...tiers, { from: (last?.to ?? 0) + 1, to: null, rate: 0 }]);
  };
  const delTier = (i: number) => emit(tiers.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof Tier, val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10);
    emit(tiers.map((t, idx) => idx === i ? { ...t, [field]: isNaN(num) ? null : num } : t));
  };

  return (
    <div style={S.root}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Từ</th>
            <th style={S.th}>Đến</th>
            <th style={S.th}>Đơn giá (đ)</th>
            <th style={S.th}></th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t, i) => (
            <tr key={i}>
              <td style={S.td}><input style={S.input} value={t.from} onChange={(e) => update(i, "from", e.target.value)} /></td>
              <td style={S.td}><input style={S.input} value={t.to ?? ""} placeholder="∞" onChange={(e) => update(i, "to", e.target.value)} /></td>
              <td style={S.td}><input style={S.input} value={t.rate ? fmtVnd(t.rate) : ""} placeholder="0" onChange={(e) => update(i, "rate", e.target.value)} /></td>
              <td style={S.td}><button style={S.delBtn} onClick={() => delTier(i)}>🗑</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={S.addBtn} onClick={addTier}>+ Thêm bậc</button>
    </div>
  );
}
