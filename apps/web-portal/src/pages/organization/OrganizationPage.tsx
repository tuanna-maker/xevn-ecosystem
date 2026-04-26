import React, { useMemo } from 'react';
import { Building2, Info } from 'lucide-react';
import { PageHeader, TreeView, InfoBanner, Container, Section, StatCard, type TreeViewProps } from '@xevn/ui';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { mockOrgStructure, mockCompanies, type OrganizationNode } from '../../data/mock-data';

const toTreeItems = (nodes: OrganizationNode[]): TreeViewProps['items'] =>
  nodes.map((node) => ({
    id: node.id,
    label: `${node.name} (${node.employees})`,
    children: node.children ? toTreeItems(node.children) : undefined,
  }));

const OrganizationPage: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();

  // Filter organization structure based on selected company
  const filteredOrgStructure = useMemo(() => {
    if (selectedCompany.id === 'all') {
      return mockOrgStructure;
    }

    // Find company in mockCompanies to get employee count
    const company = mockCompanies.find(c => c.id === selectedCompany.id);

    // Create a simplified structure for single company view
    if (company) {
      const scopedStructure: OrganizationNode[] = [{
        id: company.id,
        name: company.name,
        type: 'company',
        manager: 'Giám đốc điều hành',
        employees: company.employeeCount,
        children: [
          {
            id: `${company.id}-dept-1`,
            name: 'Phòng Kinh doanh',
            type: 'department',
            manager: 'Trưởng phòng Kinh doanh',
            employees: Math.floor(company.employeeCount * 0.3),
          },
          {
            id: `${company.id}-dept-2`,
            name: 'Phòng Kỹ thuật',
            type: 'department',
            manager: 'Trưởng phòng Kỹ thuật',
            employees: Math.floor(company.employeeCount * 0.25),
          },
          {
            id: `${company.id}-dept-3`,
            name: 'Phòng Nhân sự',
            type: 'department',
            manager: 'Trưởng phòng Nhân sự',
            employees: Math.floor(company.employeeCount * 0.15),
          },
        ]
      }];
      return scopedStructure;
    }

    return [];
  }, [selectedCompany.id]);

  const treeItems = useMemo(() => toTreeItems(filteredOrgStructure), [filteredOrgStructure]);

  return (
    <Container>
      <PageHeader
        title="Cơ cấu Tổ chức"
        subtitle="Xem sơ đồ tổ chức và mối quan hệ giữa các đơn vị trong tập đoàn"
        icon={<Building2 size={24} />}
      />

      <InfoBanner
        title="Chế độ chỉ xem (View-only)"
        message="Để thêm/sửa/xóa đơn vị tổ chức, vui lòng truy cập Cài đặt → Danh mục Phòng ban"
        icon={<Info size={20} />}
      />

      <Section gap="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Công ty thành viên"
            value={selectedCompany.id === 'all' ? '4' : '1'}
            icon={<Building2 size={24} />}
          />
          <StatCard
            title="Tổng phòng ban"
            value={selectedCompany.id === 'all' ? '14' : '3-4'}
            icon={<Building2 size={24} />}
          />
          <StatCard
            title="Tổng nhân sự"
            value={selectedCompany.employeeCount || 'N/A'}
            icon={<Building2 size={24} />}
          />
          <StatCard
            title="Cấp quản lý"
            value={selectedCompany.id === 'all' ? '4' : '3'}
            icon={<Building2 size={24} />}
          />
        </div>
      </Section>

      <Section>
        <div className="bg-xevn-surface rounded-xl shadow-lg p-6 border border-xevn-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-xevn-text">Sơ đồ Cơ cấu Tổ chức</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
                <span className="text-xs text-slate-500">Tập đoàn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div>
                <span className="text-xs text-slate-500">Công ty</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div>
                <span className="text-xs text-slate-500">Phòng ban</span>
              </div>
            </div>
          </div>

          {filteredOrgStructure.length > 0 ? (
            <TreeView
              items={treeItems}
            />
          ) : (
            <div className="text-center py-12 text-slate-500">
              Không có dữ liệu cơ cấu tổ chức cho công ty đã chọn
            </div>
          )}
        </div>
      </Section>
    </Container>
  );
};

export default OrganizationPage;
