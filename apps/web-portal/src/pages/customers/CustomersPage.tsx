import React, { useMemo } from 'react';
import { UserCircle, Building, User, Info } from 'lucide-react';
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
import { mockCustomers, type Customer } from '../../data/mock-data';

const CustomersPage: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();

  // Filter customers based on selected company
  const filteredCustomers = useMemo(() => {
    if (selectedCompany.id === 'all') {
      return mockCustomers;
    }
    return mockCustomers.filter(
      (cust) => cust.fromCompanyId === selectedCompany.id
    );
  }, [selectedCompany.id]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredCustomers.length;
    const corporate = filteredCustomers.filter(
      (c) => c.type === 'corporate'
    ).length;
    const individual = filteredCustomers.filter(
      (c) => c.type === 'individual'
    ).length;
    const totalRevenue = filteredCustomers.reduce(
      (acc, c) => acc + c.totalRevenue,
      0
    );
    return { total, corporate, individual, totalRevenue };
  }, [filteredCustomers]);

  // Table columns
  const columns: Column<Customer>[] = [
    {
      key: 'code',
      header: 'Mã KH',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Tên khách hàng',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              item.type === 'corporate'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-purple-100 text-purple-600'
            }`}
          >
            {item.type === 'corporate' ? (
              <Building size={16} />
            ) : (
              <User size={16} />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-800">{value}</p>
            {item.industry && (
              <p className="text-xs text-slate-500">{item.industry}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại KH',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'corporate' ? 'info' : 'neutral'} size="sm">
          {value === 'corporate' ? 'Doanh nghiệp' : 'Cá nhân'}
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
      key: 'totalOrders',
      header: 'Số đơn',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-slate-800">{value}</span>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Doanh thu',
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-emerald-600">
          {(value / 1000000).toFixed(0)} triệu
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (value) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'} size="sm" dot>
          {value === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </Badge>
      ),
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Khách hàng"
        subtitle="Danh sách khách hàng toàn tập đoàn"
        icon={<UserCircle size={24} />}
      />

      <InfoBanner
        title="Chế độ chỉ xem (View-only)"
        message="Dữ liệu khách hàng được tổng hợp từ CRM của từng công ty thành viên. Để cập nhật thông tin khách hàng, vui lòng sử dụng hệ thống CRM tương ứng."
        icon={<Info size={20} />}
      />

      <Section gap="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng khách hàng"
            value={stats.total}
            icon={<UserCircle size={24} />}
          />
          <StatCard
            title="Doanh nghiệp"
            value={stats.corporate}
            icon={<Building size={24} />}
          />
          <StatCard
            title="Cá nhân"
            value={stats.individual}
            icon={<User size={24} />}
          />
          <StatCard
            title="Tổng doanh thu"
            value={`${(stats.totalRevenue / 1000000000).toFixed(1)} tỷ`}
            subtitle="Từ khách hàng"
          />
        </div>
      </Section>

      <Section>
        <DataTable
          columns={columns}
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Tìm kiếm khách hàng..."
          emptyMessage="Không tìm thấy khách hàng nào"
        />
      </Section>
    </Container>
  );
};

export default CustomersPage;
