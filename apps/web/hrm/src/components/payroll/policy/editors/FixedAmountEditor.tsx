/**
 * FixedAmountEditor — Fallback editor cho các loại có 1 trường amount
 * Params schema: { amount: number, note?: string }
 */
import { useState } from "react";
type Props = { params: Record<string, unknown>; onChange: (p: Record<string, unknown>) => void };

const S: Record<string, React.CSSProperties> = {
  root: { marginTop: 12, display: "flex", flexDirection: "column", gap: 12 },
  label: { fontSize: 12, color: "#64748b", marginBottom: 4, display: "block" },
  input: { background: "#0f1117", border: "1px solid #2a2f45", color: "#e8eaf0", borderRadius: 6, padding: "8px 10px", fontSize: 13, width: "100%", boxSizing: "border-box" as const, outline: "none" },
  hint: { fontSize: 11, color: "#475569", marginTop: 4 },
};

const fmtVnd = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

export function FixedAmountEditor({ params, onChange }: Props) {
  const [amount, setAmount] = useState<string>(params.amount ? fmtVnd(Number(params.amount)) : "");
  const [note, setNote] = useState<string>((params.note as string) ?? "");

  const emitAmount = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ""), 10) || 0;
    onChange({ ...params, amount: num, note });
  };

  return (
    <div style={S.root}>
      <div>
        <label style={S.label}>Mức tiền (đ)</label>
        <input
          style={S.input}
          value={amount}
          placeholder="VD: 500.000"
          onChange={(e) => {
            setAmount(e.target.value);
            emitAmount(e.target.value);
          }}
          onBlur={(e) => {
            const num = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
            setAmount(num > 0 ? fmtVnd(num) : "");
          }}
        />
        <div style={S.hint}>Định dạng số nguyên, đơn vị VND</div>
      </div>
      <div>
        <label style={S.label}>Ghi chú cấu hình</label>
        <input
          style={S.input}
          value={note}
          placeholder="Mô tả thêm về mức tiền này..."
          onChange={(e) => { setNote(e.target.value); onChange({ ...params, amount: parseInt(amount.replace(/\D/g, ""), 10) || 0, note: e.target.value }); }}
        />
      </div>
    </div>
  );
}
