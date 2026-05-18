import React, { useEffect, useMemo, useState } from 'react';
import { Building2, Info } from 'lucide-react';
import { PageHeader, TreeView, InfoBanner, Container, Section, StatCard } from '@xevn/ui';
import { useGlobalFilter, useTenantScope } from '../../contexts/GlobalFilterContext';
import { fetchOrgTree, orgTreeToViewNodes } from '../../integrations/orgFoundationApi';
import { fetchGroupOrgOverview } from '../../integrations/tenantScopeApi';
import { isMasterTenant } from '../../constants/tenant';

const OrganizationPage: React.FC = () => {
  const { selectedTenant } = useGlobalFilter();
  const { tenantId, isMasterContext, canAccessMaster } = useTenantScope();
  const [orgRows, setOrgRows] = useState<any[]>([]);
  const [deptCount, setDeptCount] = useState(0);

  useEffect(() => {
    const load = async () => {
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
            setOrgRows(merged as any[]);
            setDeptCount(overview.trees.reduce((n, t) => n + (t.tree[0]?.children?.length ?? 0), 0));
            return;
          }
          setOrgRows([]);
          setDeptCount(0);
          return;
        }
        const tree = await fetchOrgTree(tenantId);
        if (tree.length) {
          const view = orgTreeToViewNodes(tree) as any[];
          setOrgRows(view);
          setDeptCount(view.reduce((n, r) => n + ((r.children as unknown[])?.length ?? 0), 0));
          return;
        }
        setOrgRows([]);
        setDeptCount(0);
      } catch {
        setOrgRows([]);
        setDeptCount(0);
      }
    };
    void load();
  }, [tenantId, canAccessMaster]);

  const filteredOrgStructure = useMemo(() => orgRows, [orgRows]);

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
            <TreeView items={filteredOrgStructure as any} />
          ) : (
            <div className="text-center py-12 text-slate-500">
              {isMasterContext
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
