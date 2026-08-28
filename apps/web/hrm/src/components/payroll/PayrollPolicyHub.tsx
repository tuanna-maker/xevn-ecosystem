/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Hub chính sách
 * Route:      /hr/payroll/policy-engine
 * UC:         Hub navigation for E1/E2/E3/E4
 * WorkItem:   HRM-POLICY-FE-HUB
 * Coded:      2026-08-22
 * SOLID:      SRP — tab routing only; each tab is separate screen component
 * fe_boundary: import chỉ từ ./policy/* ./grade/* ./input/* ./batch/*
 */
import { useState } from "react";
import { BatchRunnerScreen } from "./batch/BatchRunnerScreen";
import { InputHubScreen } from "./input/InputHubScreen";
import { PolicyListScreen } from "./policy/PolicyListScreen";

type Tab = "policy" | "grade" | "input" | "batch";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "policy", label: "Chính sách", icon: "⚙️" },
  { id: "grade", label: "Ngạch-Bậc", icon: "🏛️" },
  { id: "input", label: "Nhập liệu", icon: "📥" },
  { id: "batch", label: "Chạy lương", icon: "🚀" },
];

const S: Record<string, React.CSSProperties> = {
  root: { fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#0f1117", color: "#e8eaf0" },
  header: { background: "linear-gradient(135deg,#1a1f2e 0%,#232840 100%)", borderBottom: "1px solid #2a2f45", padding: "20px 28px 0" },
  title: { fontSize: 22, fontWeight: 700, color: "#a5b4fc", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 10 },
  tabs: { display: "flex", gap: 4 },
  tab: (active: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    borderRadius: "8px 8px 0 0",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    background: active ? "#6366f1" : "transparent",
    color: active ? "#fff" : "#94a3b8",
    transition: "all .2s",
  }),
  content: { padding: 28 },
};

export function PayrollPolicyHub() {
  const [activeTab, setActiveTab] = useState<Tab>("policy");

  return (
    <div style={S.root}>
      <div style={S.header}>
        <h1 style={S.title}>
          <span>💎</span>
          Policy Engine — XeVN HRM
        </h1>
        <div style={S.tabs}>
          {TABS.map((t) => (
            <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={S.content}>
        {activeTab === "policy" && <PolicyListScreen />}
        {activeTab === "grade" && <PolicyListScreen defaultGroupCode="CHUNG" />}
        {activeTab === "input" && <InputHubScreen />}
        {activeTab === "batch" && <BatchRunnerScreen />}
      </div>
    </div>
  );
}