/**
 * @CODE-MEMORY
 * Screen: /dashboard/organization — Dashboard Tổ chức XBOS
 * UC: UF-XBOS-10 · FR-UC-XBOS-DASH-01
 * SRS: docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md §4.2
 * TechSpec: orgFoundationApi · tenantScopeApi · TreeView
 * Purpose: Hiển thị sơ đồ org + widget headcount; toolbar Tải lại/Bộ lọc/Tìm kiếm/Xuất theo HDSD.
 * WorkItem: D-XBOS-DASHBOARD-FE-01
 * Coded: 2026-08-01
 * Callers: App.tsx route dashboard/organization
 * Callees: fetchOrgTree · fetchGroupOrgOverview · dashboardPageToolbar helpers
 * FEActions: Tải lại → reload API · Bộ lọc → departments-only · Tìm kiếm → filter tree · Xuất → CSV
 * Impact: Thiếu toolbar → QA TC-016 🟡; TreeView cần label từ name.
 * must_keep: Master vs member scope banner; không seed org giả.
 * SOLID: Toolbar tách DashboardPageToolbar; lọc/export trong lib.
 * LastVerified: vitest dashboardPageToolbar.test.ts
 *
 * @CODE-MEMORY-CHANGE D-XBOS-DASHBOARD-FE-01 (2026-08-01): Thêm toolbar HDSD + sửa map name→label TreeView; export/lọc client-side.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Info } from 'lucide-react';
import { PageHeader, TreeView, InfoBanner, Container, Section, StatCard } from '@xevn/ui';
import { useGlobalFilter, useTenantScope } from '../../contexts/GlobalFilterContext';
import { fetchOrgTree, orgTreeToViewNodes } from '../../integrations/orgFoundationApi';
import { fetchGroupOrgOverview } from '../../integrations/tenantScopeApi';
import { isMasterTenant } from '../../constants/tenant';
import { DashboardPageToolbar } from '../../components/dashboard/DashboardPageToolbar';
import {
  ORG_TOOLBAR_LABELS,
  buildOrgTreeCsv,
  downloadTextFile,
  filterOrgTreeNodes,
  orgRowsToTreeViewNodes,
  type OrgTreeFilterMode,
  type OrgTreeViewNode,
} from '../../lib/dashboardPageToolbar';

const OrganizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedTenant } = useGlobalFilter();
  const { tenantId, isMasterContext, canAccessMaster } = useTenantScope();
  const [orgRows, setOrgRows] = useState<Array<Record<string, unknown>>>([]);
  const [deptCount, setDeptCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<OrgTreeFilterMode>('all');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadOrgData = useCallback(async () => {
    try {
      if (isMasterTenant(tenantId) && canAccessMaster) {
        const overview = await fetchGroupOrgOverview();
        if (overview?.trees?.length) {
          const merged = overview.trees.flatMap((t) =>
            orgTreeToViewNodes(t.tree).map((node) => ({
              ...node,
              name: `[${t.name}] ${node.name}`,
            })),
          );
          setOrgRows(merged);
          setDeptCount(overview.trees.reduce((n, t) => n + (t.tree[0]?.children?.length ?? 0), 0));
          return;
        }
        setOrgRows([]);
        setDeptCount(0);
        return;
      }
      const tree = await fetchOrgTree(tenantId);
      if (tree.length) {
        const view = orgTreeToViewNodes(tree);
        setOrgRows(view);
        setDeptCount(
          view.reduce((n, r) => n + ((r.children as unknown[])?.length ?? 0), 0),
        );
        return;
      }
      setOrgRows([]);
      setDeptCount(0);
    } catch {
      setOrgRows([]);
      setDeptCount(0);
    }
  }, [tenantId, canAccessMaster]);

  useEffect(() => {
    void loadOrgData();
  }, [loadOrgData]);

  const treeNodes = useMemo(() => orgRowsToTreeViewNodes(orgRows), [orgRows]);

  const filteredOrgStructure = useMemo(
    () => filterOrgTreeNodes(treeNodes, searchQuery, filterMode),
    [treeNodes, searchQuery, filterMode],
  );

  const handleToggleFilter = () => {
    setFilterMode((prev) => (prev === 'all' ? 'departments' : 'all'));
  };

  const handleToggleSearch = () => {
    setShowSearch((prev) => {
      const next = !prev;
      if (next) {
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return next;
    });
  };

  const handleExport = () => {
    const csv = buildOrgTreeCsv(filteredOrgStructure.length ? filteredOrgStructure : treeNodes);
    downloadTextFile(`co-cau-to-chuc-${tenantId}.csv`, csv);
  };

  const toolbarActions = [
    {
      id: 'reload',
      label: ORG_TOOLBAR_LABELS.reload,
      onClick: () => void loadOrgData(),
    },
    {
      id: 'filter',
      label: ORG_TOOLBAR_LABELS.filter,
      onClick: handleToggleFilter,
      variant: filterMode === 'departments' ? ('primary' as const) : ('outline' as const),
    },
    {
      id: 'search',
      label: ORG_TOOLBAR_LABELS.search,
      onClick: handleToggleSearch,
      variant: showSearch ? ('primary' as const) : ('outline' as const),
    },
    {
      id: 'export',
      label: ORG_TOOLBAR_LABELS.export,
      onClick: handleExport,
      disabled: treeNodes.length === 0,
    },
    {
      id: 'settings',
      label: ORG_TOOLBAR_LABELS.settings,
      onClick: () => navigate('/dashboard/settings/departments'),
      variant: 'ghost' as const,
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Cơ cấu Tổ chức"
        subtitle={
          isMasterContext
            ? 'Tổng hợp sơ đồ các tenant thành viên (chế độ tập đoàn)'
            : `Tenant: ${selectedTenant.shortName} · vai trò: ${selectedTenant.roleCode}`
        }
        icon={<Building2 size={24} />}
        actions={<DashboardPageToolbar actions={toolbarActions} aria-label="Thao tác dashboard Tổ chức" />}
      />

      <InfoBanner
        title={isMasterContext ? 'X-BOS Group' : 'Tenant công ty thành viên'}
        message={
          isMasterContext
            ? 'Chỉ tài khoản có membership tenant master mới thấy tổng hợp này. Chuyển tenant ở header để vào HRM/Cài đặt từng công ty.'
            : 'Dữ liệu org chỉ thuộc tenant này. Tài khoản không thuộc tenant master sẽ không thấy menu X-BOS tập đoàn.'
        }
        icon={<Info size={20} />}
      />

      {showSearch ? (
        <Section>
          <label className="block text-sm font-medium text-xevn-text mb-2" htmlFor="org-dashboard-search">
            {ORG_TOOLBAR_LABELS.search} tổ chức
          </label>
          <input
            id="org-dashboard-search"
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập tên phòng ban hoặc công ty..."
            className="w-full max-w-md rounded-lg border border-xevn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-xevn-primary/30"
            data-testid="org-dashboard-search-input"
          />
        </Section>
      ) : null}

      <Section gap="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tenant" value={selectedTenant.shortName} icon={<Building2 size={24} />} />
          <StatCard title="Phòng ban" value={String(deptCount || '—')} icon={<Building2 size={24} />} />
          <StatCard title="Vai trò (tenant)" value={selectedTenant.roleCode} icon={<Building2 size={24} />} />
          <StatCard
            title="Loại"
            value={isMasterContext ? 'Master' : 'Thành viên'}
            icon={<Building2 size={24} />}
          />
        </div>
      </Section>

      <Section>
        <div className="bg-xevn-surface rounded-xl shadow-lg p-6 border border-xevn-border">
          <h3 className="text-lg font-semibold text-xevn-text mb-6">Sơ đồ Cơ cấu Tổ chức</h3>
          {filteredOrgStructure.length > 0 ? (
            <TreeView items={filteredOrgStructure as OrgTreeViewNode[]} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              {searchQuery.trim() || filterMode === 'departments'
                ? 'Không có đơn vị phù hợp bộ lọc hiện tại.'
                : isMasterContext
                  ? 'Tenant master không có org riêng — chọn tenant thành viên hoặc xem tổng hợp phía trên.'
                  : 'Chưa có dữ liệu org cho tenant này.'}
            </div>
          )}
        </div>
      </Section>
    </Container>
  );
};

export default OrganizationPage;
