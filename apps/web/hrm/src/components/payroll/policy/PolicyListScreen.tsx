/**
 * @CODE-MEMORY
 * Screen:     HRM · Lương · Policy Hub (Full-page Wizard orchestrator)
 * Route:      /hr/payroll/policy-engine (tab "Chính sách")
 * UC:         UC-POL-01 → UC-POL-02 → UC-POL-03/04
 * Spec:       UIUX_SPEC_HRM_POLICY_ENGINE_v1.md & implementation_plan.md
 * WorkItem:   HRM-POLICY-HUB-V2 & G10 - Policy Builder Wizard
 * SOLID:      SRP — Orchestrate Group Grid -> Policy List Panel -> Policy Builder Screen (Full-page)
 */
import { useEffect, useState } from "react";
import type { Policy, PolicyGroup } from "../../../lib/api/hrm-policy-api";
import { PolicyAPI, PolicyGroupAPI } from "../../../lib/api/hrm-policy-api";
import { PolicyGroupGrid } from "./PolicyGroupGrid";
import { PolicyListPanel } from "./PolicyListPanel";
import { PolicyBuilderScreen } from "./PolicyBuilderScreen";
import { PolicyBuilderDrawer } from "./PolicyBuilderDrawer";

type ViewState =
  | { screen: "groups" }
  | { screen: "list"; group: PolicyGroup }
  | { screen: "builder"; group: PolicyGroup; policy?: Policy | null };

type Props = {
  defaultGroupCode?: string;
};

const S: Record<string, React.CSSProperties> = {
  root: { display: "flex", flexDirection: "column", gap: 0 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", marginBottom: 20 },
  breadcrumbSep: { color: "#94a3b8" },
  breadcrumbActive: { color: "#0f172a", fontWeight: 600 },
  sectionTitle: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 },
};

export function PolicyListScreen({ defaultGroupCode }: Props) {
  const [view, setView] = useState<ViewState>({ screen: "groups" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (defaultGroupCode) {
      PolicyGroupAPI.list()
        .then((groups) => {
          const match = groups.find(
            (g) => g.code.toUpperCase() === defaultGroupCode.toUpperCase()
          );
          if (match) {
            setView({ screen: "list", group: match });
          } else {
            setView({
              screen: "list",
              group: {
                id: defaultGroupCode,
                code: defaultGroupCode,
                name_vi: defaultGroupCode === "LUONG" ? "Lương" : defaultGroupCode,
                icon: "💰",
                color_hex: "#10B981",
                sort_order: 10,
                is_platform: true,
                is_active: true,
                description: null,
                created_by: "system",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                active_policy_count: 0,
              },
            });
          }
        })
        .catch(console.error);
    }
  }, [defaultGroupCode]);

  const handleSelectGroup = (group: PolicyGroup) => setView({ screen: "list", group });
  const handleBack = () => setView({ screen: "groups" });

  const handleEdit = (policy: Policy, group: PolicyGroup) =>
    setView({ screen: "builder", group, policy });

  const handleCreate = async (group: PolicyGroup) => {
    try {
      const created = await PolicyAPI.create({
        pay_group_code: group.code,
        name: `Chính sách ${group.name_vi} mới`,
        status: "DRAFT",
        effective_from: new Date().toISOString().slice(0, 10),
      });
      setView({ screen: "builder", group, policy: created });
    } catch (err: any) {
      alert("Không thể tạo chính sách mới: " + (err?.message || err));
    }
  };

  const handleCloseBuilder = () => {
    setRefreshKey((k) => k + 1);
    if (view.screen === "builder") {
      setView({ screen: "list", group: view.group });
    }
  };

  return (
    <div style={S.root}>
      {/* Breadcrumb */}
      <div style={S.breadcrumb}>
        <span
          style={{ cursor: "pointer", color: view.screen !== "groups" ? "#6366f1" : "#64748b" }}
          onClick={() => setView({ screen: "groups" })}
        >
          Nhóm chính sách
        </span>
        {view.screen !== "groups" && (
          <>
            <span style={S.breadcrumbSep}>›</span>
            <span
              style={{
                cursor: view.screen === "builder" ? "pointer" : "default",
                color: view.screen === "list" ? "#e8eaf0" : "#6366f1",
              }}
              onClick={() => view.screen === "builder" && setView({ screen: "list", group: view.group })}
            >
              {view.screen !== "groups" && view.group.icon} {view.screen !== "groups" && view.group.name_vi}
            </span>
          </>
        )}
        {view.screen === "builder" && (
          <>
            <span style={S.breadcrumbSep}>›</span>
            <span style={S.breadcrumbActive}>
              {view.policy ? "Cấu hình chính sách" : "Tạo mới"}
            </span>
          </>
        )}
      </div>

      {/* Màn 1: Group Hub */}
      {view.screen === "groups" && (
        <>
          <div style={S.sectionTitle}>
            <span>💼</span> Chọn nhóm chính sách
          </div>
          <PolicyGroupGrid key={`groups-${refreshKey}`} onSelectGroup={handleSelectGroup} />
        </>
      )}

      {/* Màn 2: Policy List Panel */}
      {(view.screen === "list" || view.screen === "builder") && (
        <PolicyListPanel
          key={`list-${view.group.id}-${refreshKey}`}
          group={view.group}
          onBack={handleBack}
          onEdit={(policy) => handleEdit(policy, view.group)}
          onCreate={() => handleCreate(view.group)}
        />
      )}

      {/* Màn 3: Policy Builder Full-Screen Popup Modal */}
      {view.screen === "builder" && view.policy?.id && (
        <PolicyBuilderScreen
          key={`builder-${view.policy.id}`}
          policyId={view.policy.id}
          onBack={handleCloseBuilder}
        />
      )}
    </div>
  );
}
