import React, { useMemo } from 'react';
import { Users2, Info, Building2 } from 'lucide-react';
import {
  PageHeader,
  StatCard,
  DataTable,
  Badge,
  InfoBanner,
  Container,
  Section,
  type Column,
} from '@xevn/ui';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { mockPartners, mockCompanies, type Partner } from '../../data/mock-data';

const PartnersPage: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();

  // Filter partners based on selected company
  const filteredPartners = useMemo(() => {
    if (selectedCompany.id === 'all') {
      return mockPartners;
    }
    return mockPartners.filter(
      (partner) =>
        partner.relatedCompanies.includes(selectedCompany.id) ||
        partner.relatedCompanies.includes('all')
    );
  }, [selectedCompany.id]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredPartners.length;
    const active = filteredPartners.filter((p) => p.status === 'active').length;
    const byType = filteredPartners.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, active, byType };
  }, [filteredPartners]);

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    const company = mockCompanies.find((c) => c.id === companyId);
    return company?.code || companyId;
  };

  // Table columns
  const columns: Column<Partner>[] = [
    {
      key: 'code',
      header: 'Mã ĐT',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên đối tác',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Building2 size={16} />
          </div>
          <div>
            <p className="font-medium text-slate-800">{value}</p>
            <p className="text-xs text-slate-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại đối tác',
      sortable: true,
      render: (value) => (
        <Badge variant="info" size="sm">
          {value}
        </Badge>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Người liên hệ',
      render: (value, item) => (
        <div>
          <p className="text-sm text-slate-800">{value}</p>
          <p className="text-xs text-slate-500">{item.phone}</p>
        </div>
      ),
    },
    {
      key: 'relatedCompanies',
      header: 'Công ty liên quan',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((companyId) => (
            <Badge key={companyId} variant="neutral" size="sm">
              {getCompanyName(companyId)}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {value === 'active' ? 'Đang hợp tác' : 'Ngừng hợp tác'}
        </Badge>
      ),
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Đối tác"
        subtitle="Danh sách đối tác và nhà cung cấp của tập đoàn"
        icon={<Users2 size={24} />}
      />

      <InfoBanner
        title="Chế độ chỉ xem (View-only)"
        message="Quản lý thông tin đối tác được thực hiện tại các phân hệ nghiệp vụ tương ứng của từng công ty thành viên."
        icon={<Info size={20} />}
      />

      <Section gap="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng đối tác"
            value={stats.total}
            icon={<Users2 size={24} />}
          />
          <StatCard
            title="Đang hợp tác"
            value={stats.active}
            subtitle={`${((stats.active / stats.total) * 100).toFixed(0)}% tổng số`}
          />
          <StatCard
            title="Nhà cung cấp"
            value={stats.byType['Nhà cung cấp'] || 0}
          />
          <StatCard
            title="Đối tác công nghệ"
            value={stats.byType['Đối tác công nghệ'] || 0}
          />
        </div>
      </Section>

      <Section>
        <DataTable
          columns={columns}
          data={filteredPartners}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Tìm kiếm đối tác..."
          emptyMessage="Không tìm thấy đối tác nào"
        />
      </Section>
    </Container>
  );
};

export default PartnersPage;
