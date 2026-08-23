/**
 * Screen:     HRM · Nhập liệu (S4 + S5)
 * WorkItem:   HRM-POLICY-FE-S4
 * Coded:      2026-08-22
 */
import { useEffect, useRef, useState } from "react";
import { InputAPI, type InputImport, type InputRow } from "../../../lib/api/hrm-policy-api";

const INPUT_TYPES = ["TRIP_LOG","REVENUE_CLDV","MAINTENANCE_COST","FREIGHT_REVENUE","DPHH_REVENUE","HOTLINE_STATS","BRANCH_STATS"];

const statusBadge = (s: string) => {
  const m: Record<string, string> = { APPROVED: "#4ade80", PENDING_REVIEW: "#fb923c", PROCESSING: "#818cf8", FAILED: "#f87171" };
  return <span style={{ background: (m[s] ?? "#334155") + "22", color: m[s] ?? "#94a3b8", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{s}</span>;
};

const S = {
  card: { background: "#1a1f2e", borderRadius: 12, padding: 20, border: "1px solid #2a2f45", marginBottom: 16 } as React.CSSProperties,
  input: { background: "#0f1117", border: "1px solid #334155", borderRadius: 8, color: "#e8eaf0", padding: "8px 14px", fontSize: 14 } as React.CSSProperties,
  btn: (c: string): React.CSSProperties => ({ background: c, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }),
  th: { background: "#1e2540", color: "#94a3b8", fontSize: 12, padding: "10px 14px", textAlign: "left" as const, fontWeight: 600 },
  td: { padding: "10px 14px", borderBottom: "1px solid #1e2540", fontSize: 13, color: "#e8eaf0" },
};

export function InputHubScreen() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [imports, setImports] = useState<InputImport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImport, setSelectedImport] = useState<InputImport | null>(null);
  const [rows, setRows] = useState<InputRow[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [approving, setApproving] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    setLoading(true);
    try { setImports(await InputAPI.list(period)); }
    catch { setImports([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [period]);

  const handleUpload = async (inputType: string) => {
    const file = fileRefs.current[inputType]?.files?.[0];
    if (!file) return alert("Chọn file Excel trước");
    setUploading(u => ({ ...u, [inputType]: true }));
    try {
      await InputAPI.upload(period, inputType, file);
      alert(`Upload ${inputType} thành công!`);
      await load();
    } catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi upload"); }
    finally { setUploading(u => ({ ...u, [inputType]: false })); }
  };

  const handleViewRows = async (imp: InputImport) => {
    setSelectedImport(imp);
    const { data } = await InputAPI.getRows(imp.id);
    setRows(data);
  };

  const handleApprove = async (imp: InputImport) => {
    if (!confirm(`Approve import ${imp.input_type} kỳ ${period}?`)) return;
    setApproving(imp.id);
    try { await InputAPI.approve(imp.id); await load(); alert("Đã approve!"); }
    catch (e: unknown) { alert((e as { message?: string }).message ?? "Lỗi"); }
    finally { setApproving(null); }
  };

  return (
    <div>
      {/* Period selector */}
      <div style={{ ...S.card, display: "flex", gap: 16, alignItems: "center" }}>
        <label style={{ color: "#94a3b8", fontSize: 14 }}>Kỳ lương:</label>
        <input id="input-period" type="month" style={{ ...S.input, width: 160 }} value={period} onChange={e => setPeriod(e.target.value)} />
        <button style={S.btn("#334155")} onClick={load} id="btn-refresh-inputs">↻ Làm mới</button>
        <span style={{ color: "#475569", fontSize: 13 }}>{imports.length} import(s) trong kỳ này</span>
      </div>

      {/* Upload section */}
      <div style={S.card}>
        <h3 style={{ margin: "0 0 16px", color: "#a5b4fc" }}>📥 Upload dữ liệu theo loại</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
          {INPUT_TYPES.map(type => {
            const existing = imports.find(i => i.input_type === type);
            return (
              <div key={type} style={{ background: "#0f1117", borderRadius: 10, padding: 16, border: `1px solid ${existing ? "#16a34a44" : "#2a2f45"}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: existing ? "#4ade80" : "#e8eaf0" }}>
                  {existing ? "✓ " : ""}{type}
                </div>
                {existing && <div style={{ marginBottom: 8 }}>{statusBadge(existing.status)} <span style={{ fontSize: 12, color: "#64748b" }}>{existing.total_rows} dòng</span></div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <input ref={el => { fileRefs.current[type] = el; }} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} id={`file-${type}`} />
                  <button style={{ ...S.btn("#6366f1"), flex: 1, padding: "6px 12px", fontSize: 12 }}
                    onClick={() => fileRefs.current[type]?.click()} id={`btn-choose-${type}`}>
                    Chọn file
                  </button>
                  <button style={{ ...S.btn(uploading[type] ? "#334155" : "#312e81"), padding: "6px 12px", fontSize: 12 }}
                    onClick={() => handleUpload(type)} disabled={uploading[type]} id={`btn-upload-${type}`}>
                    {uploading[type] ? "..." : "Upload"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Import list */}
      {imports.length > 0 && (
        <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #2a2f45", color: "#a5b4fc", fontWeight: 700 }}>Lịch sử import</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Loại","File","Tổng dòng","Khớp","Lỗi","Trạng thái","Thao tác"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {imports.map(imp => (
                <tr key={imp.id}>
                  <td style={S.td}><code style={{ background: "#1e2540", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{imp.input_type}</code></td>
                  <td style={S.td}>{imp.original_filename}</td>
                  <td style={{ ...S.td, textAlign: "center" }}>{imp.total_rows}</td>
                  <td style={{ ...S.td, color: "#4ade80", textAlign: "center" }}>{imp.matched_rows}</td>
                  <td style={{ ...S.td, color: imp.error_rows > 0 ? "#f87171" : "#64748b", textAlign: "center" }}>{imp.error_rows}</td>
                  <td style={S.td}>{statusBadge(imp.status)}</td>
                  <td style={S.td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={S.btn("#334155")} onClick={() => handleViewRows(imp)} id={`btn-view-rows-${imp.id}`}>Chi tiết</button>
                      {imp.status === "PENDING_REVIEW" && (
                        <button style={S.btn("#16a34a")} onClick={() => handleApprove(imp)} disabled={approving === imp.id} id={`btn-approve-${imp.id}`}>
                          {approving === imp.id ? "..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Row detail modal */}
      {selectedImport && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, color: "#a5b4fc" }}>Chi tiết: {selectedImport.input_type} ({rows.length} dòng)</h3>
            <button style={S.btn("#334155")} onClick={() => { setSelectedImport(null); setRows([]); }}>Đóng</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["#","Employee ID","Khớp","Dữ liệu key"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.slice(0, 50).map(r => (
                <tr key={r.id}>
                  <td style={{ ...S.td, color: "#64748b" }}>{r.row_number}</td>
                  <td style={S.td}>{r.employee_id ?? "—"}</td>
                  <td style={S.td}>
                    <span style={{ color: r.match_status === "MATCHED" ? "#4ade80" : r.match_status === "ERROR" ? "#f87171" : "#fb923c" }}>
                      {r.match_status}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontSize: 12, fontFamily: "monospace", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {JSON.stringify(r.data).slice(0, 80)}
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
