import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Briefcase,
  GraduationCap,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  PageHeader,
  DataTable,
  Badge,
  Button,
  StatCard,
  InfoBanner,
  Container,
  Section,
  type Column,
} from '@xevn/ui';
import { mockEmployees, type Employee } from '../../data/mock-data';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { resolveIdentityScope } from '../../integrations/identityScope';

type HrmEmployeeApiRow = {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
  join_date: string;
  company_id: string;
};

const HRPage: React.FC = () => {
  const { selectedCompany } = useGlobalFilter();
  const [apiEmployees, setApiEmployees] = useState<Employee[]>([]);
  const [apiLoadFailed, setApiLoadFailed] = useState(false);

  useEffect(() => {
    const scopeHint = selectedCompany.id === 'all' ? null : selectedCompany.id;
    let scope: { tenantId: string; companyId: string };
    try {
      scope = resolveIdentityScope(scopeHint);
    } catch {
      setApiLoadFailed(true);
      return;
    }
    const internalApiKey = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
    const headers: Record<string, string> = {
      'x-tenant-id': scope.tenantId,
      'x-company-id': scope.companyId,
    };
    if (internalApiKey) headers['x-internal-api-key'] = internalApiKey;

    void fetch('/api/hrm/employees', { method: 'GET', headers })
      .then(async (res) => {
        if (!res.ok) throw new Error('load-failed');
        const json = await res.json();
        const rows = (json?.data?.items ?? []) as HrmEmployeeApiRow[];
        const mapped: Employee[] = rows.map((row) => ({
          id: row.id,
          code: row.employee_code || 'N/A',
          fullName: row.full_name || 'N/A',
          email: row.email || '',
          phone: row.phone || '',
          position: row.position || 'N/A',
          department: row.department || 'N/A',
          joinDate: row.join_date || new Date().toISOString().slice(0, 10),
          status: row.status === 'probation' || row.status === 'resigned' ? row.status : 'active',
          employmentType: 'full-time',
          salary: 0,
        }));
        setApiEmployees(mapped);
        setApiLoadFailed(false);
      })
      .catch(() => {
        setApiLoadFailed(true);
      });
  }, [selectedCompany.id]);

  // Filter employees by selected company
  const companyEmployees = useMemo(() => {
    if (apiEmployees.length > 0) {
      return apiEmployees;
    }
    if (selectedCompany.id === 'all') {
      return mockEmployees;
    }
    return mockEmployees.filter((emp) => emp.id.startsWith(selectedCompany.id));
  }, [selectedCompany, apiEmployees]);

  // Statistics
  const stats = useMemo(() => {
    const total = companyEmployees.length;
    const active = companyEmployees.filter((e) => e.status === 'active').length;
    const probation = companyEmployees.filter(
      (e) => e.status === 'probation'
    ).length;
    const resigned = companyEmployees.filter(
      (e) => e.status === 'resigned'
    ).length;

    const newHires = companyEmployees.filter((e) => {
      const hireDate = new Date(e.joinDate);
      const now = new Date();
      const monthsDiff =
        (now.getFullYear() - hireDate.getFullYear()) * 12 +
        (now.getMonth() - hireDate.getMonth());
      return monthsDiff <= 3;
    }).length;

    const avgTenure =
      companyEmployees.reduce((acc, emp) => {
        const hireDate = new Date(emp.joinDate);
        const now = new Date();
        const tenureMonths =
          (now.getFullYear() - hireDate.getFullYear()) * 12 +
          (now.getMonth() - hireDate.getMonth());
        return acc + tenureMonths;
      }, 0) / (total || 1);

    return { total, active, probation, resigned, newHires, avgTenure };
  }, [companyEmployees]);

  // Table columns
  const columns: Column<Employee>[] = [
    {
      key: 'code',
      header: 'Mã NV',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-mono text-xs bg-xevn-primary/10 text-xevn-primary px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Họ tên',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-xevn-primary/10 flex items-center justify-center text-xevn-primary font-semibold">
            {value.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-xevn-text">{value}</div>
            <div className="text-xs text-xevn-textSecondary">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Chức vụ',
      sortable: true,
      width: '180px',
      render: (value) => <span className="text-xevn-text">{value}</span>,
    },
    {
      key: 'department',
      header: 'Phòng ban',
      sortable: true,
      width: '200px',
      render: (value) => <span className="text-xevn-textSecondary">{value}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      width: '120px',
      render: (value) => {
        const config = {
          active: { color: 'success' as const, label: 'Đang làm' },
          probation: { color: 'warning' as const, label: 'Thử việc' },
          resigned: { color: 'danger' as const, label: 'Đã nghỉ' },
        };
        const { color, label } = config[value as keyof typeof config];
        return <Badge variant={color}>{label}</Badge>;
      },
    },
    {
      key: 'joinDate',
      header: 'Ngày vào',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-xevn-textSecondary">
          {new Date(value).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Quản lý nhân sự"
        subtitle="Theo dõi và quản lý đội ngũ nhân viên"
        icon={<Users size={28} />}
        actions={
          <Button icon={<UserPlus size={16} />} variant="primary">
            Thêm nhân viên
          </Button>
        }
      />

      <InfoBanner
        title="Chế độ chỉ xem (View-only)"
        message={
          apiLoadFailed
            ? 'Không tải được HRM API, đang hiển thị dữ liệu dự phòng.'
            : 'Để thêm/sửa/xóa nhân sự, vui lòng truy cập Cài đặt → Nhân sự'
        }
        icon={<Info size={20} />}
      />

      <Section gap="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng nhân sự"
            value={stats.total.toString()}
            icon={<Users size={20} />}
          />
          <StatCard
            title="Đang làm việc"
            value={stats.active.toString()}
            icon={<Briefcase size={20} />}
          />
          <StatCard
            title="Thử việc"
            value={stats.probation.toString()}
            icon={<GraduationCap size={20} />}
          />
          <StatCard
            title="Đã nghỉ"
            value={stats.resigned.toString()}
            icon={<TrendingDown size={20} />}
          />
        </div>
      </Section>

      <Section>
        <DataTable
          columns={columns}
          data={companyEmployees}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Tìm kiếm nhân sự..."
          emptyMessage="Không tìm thấy nhân sự nào"
        />
      </Section>
    </Container>
  );
};

export default HRPage;
