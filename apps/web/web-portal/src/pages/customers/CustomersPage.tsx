/**
 * @CODE-MEMORY
 * Screen: /dashboard/customers — Khách hàng & Đối tác (CRM lite view-only)
 * UC: UF-XBOS-10 · FR-UC-XBOS-DASH-01
 * SRS: docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md §4.3
 * TechSpec: businessMasterApi listBusinessMasterItems · DataTable
 * Purpose: Danh sách KH tập đoàn; toolbar Thêm mới/Tìm kiếm/Xuất theo HDSD; mutate qua CRM (view-only).
 * WorkItem: D-XBOS-DASHBOARD-FE-01
 * Coded: 2026-08-01
 * Callers: App.tsx route dashboard/customers
 * Callees: listBusinessMasterItems · dashboardPageToolbar helpers
 * FEActions: Thêm mới → hướng dẫn CRM · Tìm kiếm → lọc bảng · Xuất → CSV
 * Impact: Thiếu nhãn toolbar → QA TC-019 🟡; DataTable không render searchPlaceholder.
 * must_keep: View-only banner; portalStrictMode mock fallback; không POST KH từ dashboard.
 * SOLID: Lọc/export tách lib; toolbar component dùng chung org/customers.
 * LastVerified: vitest dashboardPageToolbar.test.ts
 *
 * @CODE-MEMORY-CHANGE D-XBOS-DASHBOARD-FE-01 (2026-08-01): Toolbar HDSD + search input visible + export CSV; giữ view-only cho Thêm mới.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useTenantScope } from '../../contexts/GlobalFilterContext';
import { type Customer } from '../../data/mock-data';
import { listBusinessMasterItems } from '../../integrations/businessMasterApi';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { resolveCustomersPageFailure } from '../../utils/portalStrictMode';
import { DashboardPageToolbar } from '../../components/dashboard/DashboardPageToolbar';
import {
  CUSTOMERS_TOOLBAR_LABELS,
  buildCustomersCsv,
  downloadTextFile,
  filterCustomersByQuery,
} from '../../lib/dashboardPageToolbar';

const CustomersPage: React.FC = () => {
  const { tenantId, companyId, isMasterContext } = useTenantScope();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const [showAddNotice, setShowAddNotice] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadFailed(false);
    setUsingMockFallback(false);
    void listBusinessMasterItems<Customer>('customers', tenantId, companyId)
      .then((rows) => {
        setCustomers(rows);
      })
      .catch(() => {
        const failure = resolveCustomersPageFailure();
        setLoadFailed(failure.loadFailed);
        setUsingMockFallback(failure.usingMockFallback);
        setCustomers(failure.rows);
      });
  }, [tenantId, companyId]);

  const scopedCustomers = useMemo(() => {
    if (isMasterContext) return customers;
    return customers.filter((cust) => cust.fromCompanyId === tenantId || !cust.fromCompanyId);
  }, [customers, tenantId, isMasterContext]);

  const filteredCustomers = useMemo(
    () => filterCustomersByQuery(scopedCustomers, searchQuery),
    [scopedCustomers, searchQuery],
  );

  const stats = useMemo(() => {
    const total = scopedCustomers.length;
    const corporate = scopedCustomers.filter((c) => c.type === 'corporate').length;
    const individual = scopedCustomers.filter((c) => c.type === 'individual').length;
    const totalRevenue = scopedCustomers.reduce((acc, c) => acc + c.totalRevenue, 0);
    return { total, corporate, individual, totalRevenue };
  }, [scopedCustomers]);

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
            {item.type === 'corporate' ? <Building size={16} /> : <User size={16} />}
          </div>
          <div>
            <p className="font-medium text-slate-800">{value}</p>
            {item.industry && <p className="text-xs text-slate-500">{item.industry}</p>}
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
      render: (value) => <span className="font-semibold text-slate-800">{value}</span>,
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

  const handleExport = () => {
    const csv = buildCustomersCsv(filteredCustomers.length ? filteredCustomers : scopedCustomers);
    downloadTextFile(`khach-hang-${tenantId}.csv`, csv);
  };

  const toolbarActions = [
    {
      id: 'add',
      label: CUSTOMERS_TOOLBAR_LABELS.add,
      onClick: () => setShowAddNotice(true),
      variant: 'primary' as const,
    },
    {
      id: 'search',
      label: CUSTOMERS_TOOLBAR_LABELS.search,
      onClick: () => {
        setShowSearch(true);
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      },
      variant: showSearch ? ('primary' as const) : ('outline' as const),
    },
    {
      id: 'export',
      label: CUSTOMERS_TOOLBAR_LABELS.export,
      onClick: handleExport,
      disabled: scopedCustomers.length === 0,
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Khách hàng"
        subtitle="Danh sách khách hàng toàn tập đoàn"
        icon={<UserCircle size={24} />}
        actions={<DashboardPageToolbar actions={toolbarActions} aria-label="Thao tác dashboard Khách hàng" />}
      />

      <InfoBanner
        title="Chế độ chỉ xem (View-only)"
        message="Dữ liệu khách hàng được tổng hợp từ CRM của từng công ty thành viên. Để cập nhật thông tin khách hàng, vui lòng sử dụng hệ thống CRM tương ứng."
        icon={<Info size={20} />}
      />

      {showAddNotice ? (
        <Section>
          <InfoBanner
            title="Thêm khách hàng qua CRM"
            message="Dashboard tập đoàn chỉ tổng hợp dữ liệu. Vui lòng tạo khách hàng mới trên CRM của công ty thành viên tương ứng, sau đó tải lại trang này."
            icon={<Info size={20} />}
          />
        </Section>
      ) : null}

      <ApiLoadBanner loadFailed={loadFailed} usingMockFallback={usingMockFallback} />

      <Section gap="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Tổng khách hàng" value={stats.total} icon={<UserCircle size={24} />} />
          <StatCard title="Doanh nghiệp" value={stats.corporate} icon={<Building size={24} />} />
          <StatCard title="Cá nhân" value={stats.individual} icon={<User size={24} />} />
          <StatCard
            title="Tổng doanh thu"
            value={`${(stats.totalRevenue / 1000000000).toFixed(1)} tỷ`}
            subtitle="Từ khách hàng"
          />
        </div>
      </Section>

      {showSearch ? (
        <Section>
          <label className="block text-sm font-medium text-xevn-text mb-2" htmlFor="customers-dashboard-search">
            {CUSTOMERS_TOOLBAR_LABELS.search} khách hàng
          </label>
          <input
            id="customers-dashboard-search"
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã hoặc tên khách hàng..."
            className="w-full max-w-md rounded-lg border border-xevn-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-xevn-primary/30"
            data-testid="customers-dashboard-search-input"
          />
        </Section>
      ) : null}

      <Section>
        <DataTable
          columns={columns}
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          emptyMessage="Không tìm thấy khách hàng nào"
        />
      </Section>
    </Container>
  );
};

export default CustomersPage;
