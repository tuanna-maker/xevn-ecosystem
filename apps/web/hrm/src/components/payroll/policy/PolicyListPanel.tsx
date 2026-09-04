/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Policy List (Màn 2)
 * UC:         UC-POL-02 — Xem danh sách policy trong nhóm
 * Spec:       29-UIUX-STANDARDS-HRM.md & Command Center Light Theme
 * WorkItem:   HRM-POLICY-HUB-V2
 * SOLID:      SRP — List + Filter + Actions (Command Center CSS standardized)
 */
import { useEffect, useRef, useState } from "react";
import type { Policy, PolicyGroup } from "../../../lib/api/hrm-policy-api";
import { PolicyAPI } from "../../../lib/api/hrm-policy-api";

type Props = {
  group: PolicyGroup;
  onBack: () => void;
  onEdit: (policy: Policy) => void;
  onCreate: () => void;
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang áp dụng",
  DRAFT: "Nháp",
  ARCHIVED: "Đã lưu trữ",
  SUPERSEDED: "Đã thay thế",
  INACTIVE: "Chưa áp dụng",
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  ACTIVE: { color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0" },
  DRAFT: { color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a" },
  ARCHIVED: { color: "#4b5563", background: "#f3f4f6", border: "1px solid #e5e7eb" },
  SUPERSEDED: { color: "#6b21a8", background: "#f3e8ff", border: "1px solid #e9d5ff" },
  INACTIVE: { color: "#4b5563", background: "#f3f4f6", border: "1px solid #e5e7eb" },
};

const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("vi-VN") : "—");

const S: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 16 },
  cardContainer: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  header: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 },
  backBtn: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#334155",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "background .15s",
  },
  title: { fontSize: 18, fontWeight: 700, color: "#0f172a", flex: 1, margin: 0 },
  addBtn: {
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  toolbar: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 },
  searchInput: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 14,
    minWidth: 240,
    outline: "none",
  },
  filterSelect: {
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    color: "#0f172a",
    borderRadius: 8,
    padding: "8px 14px",
    fontSize: 14,
    cursor: "pointer",
    outline: "none",
  },
  table: { width: "100%", borderCollapse: "collapse" as const, borderRadius: 8, overflow: "hidden" },
  thead: { background: "#f8fafc" },
  th: {
    padding: "11px 16px",
    textAlign: "left" as const,
    fontSize: 12,
    color: "#475569",
    fontWeight: 600,
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.03em",
  },
  tr: (hover: boolean): React.CSSProperties => ({
    background: hover ? "#f8fafc" : "#ffffff",
    transition: "background .1s",
  }),
  td: { padding: "14px 16px", fontSize: 14, color: "#0f172a", borderBottom: "1px solid #f1f5f9" },
  policyName: { fontWeight: 600, color: "#0f172a" },
  statusBadge: (status: string): React.CSSProperties => {
    const style = STATUS_STYLE[status] ?? { color: "#4b5563", background: "#f3f4f6", border: "1px solid #e5e7eb" };
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      fontWeight: 600,
      borderRadius: 20,
      padding: "3px 10px",
      ...style,
    };
  },
  dot: (status: string): React.CSSProperties => {
    const colors: Record<string, string> = { ACTIVE: "#16a34a", DRAFT: "#d97706", ARCHIVED: "#6b7280" };
    return { width: 6, height: 6, borderRadius: "50%", background: colors[status] ?? "#6b7280" };
  },
  actionsMenu: {
    position: "absolute" as const,
    right: 0,
    top: "100%",
    zIndex: 200,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    minWidth: 150,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
  },
  actionItem: {
    display: "block",
    width: "100%",
    padding: "9px 16px",
    fontSize: 13,
    color: "#1e293b",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left" as const,
    fontWeight: 500,
  },
  emptyState: { textAlign: "center" as const, padding: "48px 24px", color: "#64748b" },
  skeletonRow: { height: 52, background: "#f1f5f9", borderRadius: 6, marginBottom: 6, animation: "pulse 1.5s infinite" },
};

export function PolicyListPanel({ group, onBack, onEdit, onCreate }: Props) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = () => {
    setLoading(true);
    PolicyAPI.list({
      pay_group_code: group.code,
      group_id: group.id,
      search: search || undefined,
      status: statusFilter || undefined,
    })
      .then((r) => {
        setPolicies(r.data);
        setTotal(r.total ?? r.data?.length ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [group.id, group.code]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (menuRef.current && !menuRef.current.contains(target) && !target.closest('.policy-action-btn')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggleStatus = async (p: Policy) => {
    setOpenMenuId(null);
    const actionText = p.status === "ACTIVE" ? "Hủy kích hoạt" : "Kích hoạt";
    if (!confirm(`${actionText} chính sách "${p.name}"?`)) return;
    try {
      await PolicyAPI.toggleStatus(p.id);
      load();
    } catch (e: unknown) {
      alert((e as { message?: string }).message ?? `Lỗi ${actionText.toLowerCase()}`);
    }
  };

  const handleClone = async (p: Policy) => {
    setOpenMenuId(null);
    const name = prompt("Tên chính sách mới:", `${p.name} (Copy)`);
    if (!name) return;
    const from = prompt("Hiệu lực từ (YYYY-MM-DD):", new Date().toISOString().slice(0, 10));
    if (!from) return;
    try {
      await PolicyAPI.clone(p.id, { name, effective_from: from });
      load();
    } catch (e: unknown) {
      alert((e as { message?: string }).message ?? "Lỗi clone");
    }
  };

  const handleDelete = async (p: Policy) => {
    setOpenMenuId(null);
    if (!confirm(`Xóa chính sách nháp "${p.name}"?`)) return;
    try {
      await PolicyAPI.delete(p.id);
      load();
    } catch (e: unknown) {
      alert((e as { message?: string }).message ?? "Lỗi xóa chính sách");
    }
  };

  return (
    <div style={S.root}>
      <div style={S.cardContainer}>
        {/* Header */}
        <div style={S.header}>
          <button style={S.backBtn} onClick={onBack}>
            ← Quay lại nhóm
          </button>
          <h2 style={S.title}>
            {group.icon ?? "💼"} {group.name_vi} — Danh sách chính sách
          </h2>
          <button style={S.addBtn} onClick={onCreate}>
            + Tạo chính sách
          </button>
        </div>

        {/* Toolbar */}
        <div style={S.toolbar}>
          <input
            style={S.searchInput}
            placeholder="🔍 Tìm theo tên chính sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={S.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang áp dụng</option>
            <option value="DRAFT">Nháp</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
            {total} chính sách
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={S.skeletonRow} />
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div style={S.emptyState}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#334155" }}>
              Chưa có chính sách nào trong nhóm này
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4, marginBottom: 16 }}>
              Tạo chính sách đầu tiên để bắt đầu cấu hình
            </div>
            <button style={S.addBtn} onClick={onCreate}>
              + Tạo chính sách
            </button>
          </div>
        ) : (
          <table style={S.table}>
            <thead style={S.thead}>
              <tr>
                <th style={S.th}>Tên chính sách</th>
                <th style={S.th}>Nhóm đối tượng</th>
                <th style={S.th}>Hiệu lực từ</th>
                <th style={S.th}>Trạng thái</th>
                <th style={S.th}>Thành phần</th>
                <th style={{ ...S.th, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => {
                const isHovered = hoveredRow === p.id;
                const isMenuOpen = openMenuId === p.id;

                return (
                  <tr
                    key={p.id}
                    style={S.tr(isHovered)}
                    onMouseEnter={() => setHoveredRow(p.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={S.td}>
                      <span
                        style={{ ...S.policyName, cursor: "pointer" }}
                        onClick={() => onEdit(p)}
                      >
                        {p.name}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#475569",
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 6,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {p.pay_group_code}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: "#475569" }}>{fmtDate(p.effective_from)}</td>
                    <td style={S.td}>
                      <span style={S.statusBadge(p.status)}>
                        <span style={S.dot(p.status)} />
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: "#475569" }}>
                      {p.components?.length ?? 0}
                    </td>
                    <td style={{ ...S.td, textAlign: "right", position: "relative" }}>
                      <button
                        className="policy-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) => (prev === p.id ? null : p.id));
                        }}
                        style={{
                          background: isMenuOpen ? "#e2e8f0" : "none",
                          border: "1px solid #cbd5e1",
                          color: "#475569",
                          borderRadius: 6,
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        ⋮
                      </button>

                      {isMenuOpen && (
                        <div ref={menuRef} style={S.actionsMenu}>
                          <button style={S.actionItem} onClick={() => { setOpenMenuId(null); onEdit(p); }}>
                            ✏️ Xem / Chỉnh sửa
                          </button>
                          <button style={S.actionItem} onClick={() => handleClone(p)}>
                            📋 Sơ đồ / Copy
                          </button>
                          <button
                            style={{ ...S.actionItem, color: p.status === "ACTIVE" ? "#d97706" : "#16a34a" }}
                            onClick={() => handleToggleStatus(p)}
                          >
                            {p.status === "ACTIVE" ? "⏸ Hủy kích hoạt" : "⚡ Kích hoạt"}
                          </button>
                          {p.status !== "ACTIVE" && (
                            <button
                              style={{ ...S.actionItem, color: "#ef4444" }}
                              onClick={() => handleDelete(p)}
                            >
                              🗑️ Xóa chính sách
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
