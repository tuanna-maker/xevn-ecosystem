/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Group Hub (Màn 1)
 * UC:         UC-POL-01 — Xem danh sách nhóm chính sách
 * Spec:       implementation_plan.md §UIUX 5.1
 * WorkItem:   HRM-POLICY-HUB-V2
 * Coded:      2026-08-27
 * SOLID:      SRP — chỉ render Group Hub, không chứa policy list hay builder
 */
import { useEffect, useState } from "react";
import type { PolicyGroup } from "../../../lib/api/hrm-policy-api";
import { PolicyGroupAPI } from "../../../lib/api/hrm-policy-api";

type Props = {
  onSelectGroup: (group: PolicyGroup) => void;
};

const S: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    padding: "0",
  },
  card: (color: string): React.CSSProperties => ({
    background: "#ffffff",
    border: "1.5px solid #e2e8f0",
    borderRadius: 12,
    padding: "20px 22px",
    cursor: "pointer",
    transition: "transform .15s, box-shadow .15s, border-color .15s",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  }),
  icon: { fontSize: 28, marginBottom: 10, display: "block" },
  name: { fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" },
  count: (color: string): React.CSSProperties => ({
    display: "inline-block",
    background: color,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 20,
    padding: "2px 10px",
    marginBottom: 8,
  }),
  systemBadge: {
    fontSize: 11,
    color: "#a78bfa",
    background: "#a78bfa20",
    border: "1px solid #a78bfa40",
    borderRadius: 10,
    padding: "2px 8px",
    display: "inline-block",
    marginLeft: 6,
  },
  skeletonCard: {
    background: "#1a1f2e",
    border: "1.5px solid #2a2f45",
    borderRadius: 12,
    padding: "20px 22px",
    height: 100,
    animation: "pulse 1.5s infinite",
  },
  glowAccent: (color: string): React.CSSProperties => ({
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
    pointerEvents: "none",
  }),
};

export function PolicyGroupGrid({ onSelectGroup }: Props) {
  const [groups, setGroups] = useState<PolicyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    PolicyGroupAPI.list()
      .then((data) => { setGroups(data); setLoading(false); })
      .catch((e: { message?: string }) => { setError(e.message ?? "Lỗi tải nhóm chính sách"); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div style={S.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={S.skeletonCard} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", color: "#f87171", padding: 32 }}>
        ⚠️ {error}
        <br />
        <button
          onClick={() => { setError(null); setLoading(true); PolicyGroupAPI.list().then(setGroups).finally(() => setLoading(false)); }}
          style={{ marginTop: 12, padding: "8px 16px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#64748b", padding: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <div>Chưa có nhóm chính sách nào</div>
      </div>
    );
  }

  return (
    <div style={S.grid}>
      {groups.map((g) => {
        const color = g.color_hex ?? "#6366f1";
        const isHovered = hoveredId === g.id;
        return (
          <div
            key={g.id}
            style={{
              ...S.card(color),
              transform: isHovered ? "translateY(-2px) scale(1.01)" : "none",
              boxShadow: isHovered ? `0 8px 32px ${color}30` : "none",
              borderColor: isHovered ? `${color}80` : `${color}40`,
            }}
            onClick={() => onSelectGroup(g)}
            onMouseEnter={() => setHoveredId(g.id)}
            onMouseLeave={() => setHoveredId(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelectGroup(g)}
          >
            <div style={S.glowAccent(color)} />
            <span style={S.icon}>{g.icon ?? "📁"}</span>
            <div style={S.name}>
              {g.name_vi}
              {g.is_platform && <span style={S.systemBadge}>Hệ thống</span>}
            </div>
            <span style={S.count(color)}>
              {g.active_policy_count} đang áp dụng
            </span>
          </div>
        );
      })}
    </div>
  );
}
