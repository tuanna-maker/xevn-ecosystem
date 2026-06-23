/** HRM workspace — mount bởi router `/command-center/hrm/:view`, không nhồi vào CommandCenterPage. */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Clock,
  Wallet,
  Search,
  Download,
  BarChart3,
} from 'lucide-react';
import type { Company, Employee } from '../../data/mock-data';
import { ENTITY_LEVEL_LABELS } from '../../data/mock-data';
import { fetchGroupMemberUnitsForCommandCenter } from '../../integrations/tenantScopeApi';
import {
  SETTINGS_COL,
  SETTINGS_CONTROL_TEXT,
  SETTINGS_FIELD_SHELL,
  SETTINGS_LABEL_CLASS,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_PAGE_TITLE_CLASS,
  SETTINGS_RADIUS_CARD,
  SETTINGS_RADIUS_INPUT,
  SETTINGS_SECTION_GRID,
  WORKSPACE_STICKY_HEADER_ROW,
  WORKSPACE_STICKY_HEADER_AXIS_H,
  WORKSPACE_STICKY_SEARCH_SHELL_CLASS,
} from '../../pages/command-center/settings-form-pattern';
import type { HrmWorkspaceMenuKey } from './types';
import { hrmPortalPath } from './paths';
import { getParentEntityLabel } from './entity-utils';
import { HRM_TABLE_SHELL, HRM_TABLE_CLASS } from './mock-data';
import {
  approveEmployeeMetadataRequest,
  listEmployeeMetadataQueue,
  listHrmAttendanceRecords,
  listHrmContracts,
  listHrmInsurance,
  listHrmEmployees,
  listHrmJobRequisitions,
  listHrmPayslips,
  listHrmOperationsTasks,
  listHrmServiceRequests,
  getHrmOperationsSummary,
  rejectEmployeeMetadataRequest,
  type HrmOperationsTaskRow,
  type HrmServiceRequestRow,
  type EmployeeMetadataQueueItem,
  type HrmAttendanceRecordRow,
  type HrmContractRow,
  type HrmInsuranceApiRow,
  type HrmEmployeeApiRow,
  type HrmJobRequisitionRow,
  type HrmPayslipApiRow,
  type HrmOperationsSummary,
} from './hrmApiClient';
import { resolveIdentityScope } from '../../integrations/identityScope';
import { formatHrmMetadataQueueError } from './hrmWorkspaceErrorText';
import { formatJoinDateVi } from './formatJoinDate';
import {
  mapHrmDashboardStats,
  mapHrmInsuranceEmbedRows,
  shouldLoadMetadataQueue,
} from './hrmWorkspaceEmbedApi';
import { HrmMetadataQueueSection } from './HrmMetadataQueueSection';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { allowMockFallback, API_LOAD_FAILED_MESSAGE, API_NOT_AVAILABLE_MESSAGE } from '../../utils/mockPolicy';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';

const RAIL_STROKE = 1.5;

const SettingSectionHeader: React.FC<{ title: string; subtitle?: React.ReactNode }> = ({
  title,
  subtitle,
}) => (
  <div
    className={`border border-xevn-border bg-white/70 px-4 py-3 shadow-soft backdrop-blur-md ${SETTINGS_RADIUS_CARD}`}
  >
    <h3 className={SETTINGS_PAGE_TITLE_CLASS}>{title}</h3>
    {subtitle != null && subtitle !== '' ? (
      <div className={SETTINGS_PAGE_SUBTITLE_CLASS}>{subtitle}</div>
    ) : null}
  </div>
);

export interface HrmWorkspacePanelProps {
  view: HrmWorkspaceMenuKey;
  /** Đồng bộ pháp nhân với Command Center; không truyền → mock. */
  legalEntityList?: Company[];
}

export function HrmWorkspacePanel({ view, legalEntityList: legalEntityListProp }: HrmWorkspacePanelProps) {
  const navigate = useNavigate();
  const { selectedCompany } = useGlobalFilter();
  const [hrmLegalEntities, setHrmLegalEntities] = useState<Company[]>(legalEntityListProp ?? []);
  const [hrmCompaniesNotice, setHrmCompaniesNotice] = useState<string | null>(null);
  const [metadataQueue, setMetadataQueue] = useState<EmployeeMetadataQueueItem[]>([]);
  const [metadataQueueFallback, setMetadataQueueFallback] = useState(false);
  const [metadataQueueLoading, setMetadataQueueLoading] = useState(false);
  const [metadataQueueError, setMetadataQueueError] = useState<string | null>(null);
  const [apiEmployees, setApiEmployees] = useState<HrmEmployeeApiRow[] | null>(null);
  const [apiPayslips, setApiPayslips] = useState<HrmPayslipApiRow[] | null>(null);
  const [apiRecruitment, setApiRecruitment] = useState<HrmJobRequisitionRow[] | null>(null);
  const [apiAttendance, setApiAttendance] = useState<HrmAttendanceRecordRow[] | null>(null);
  const [apiContracts, setApiContracts] = useState<HrmContractRow[] | null>(null);
  const [apiInsurance, setApiInsurance] = useState<HrmInsuranceApiRow[] | null>(null);
  const [apiTasks, setApiTasks] = useState<HrmOperationsTaskRow[] | null>(null);
  const [apiServiceRequests, setApiServiceRequests] = useState<HrmServiceRequestRow[] | null>(null);
  const [apiOperationsSummary, setApiOperationsSummary] = useState<HrmOperationsSummary | null>(null);
  const [hrmDataSource, setHrmDataSource] = useState<'api' | 'error'>('api');
  const [hrmLoadError, setHrmLoadError] = useState<string | null>(null);
  const [hrmApiLoading, setHrmApiLoading] = useState(false);

  useEffect(() => {
    if (legalEntityListProp?.length) {
      setHrmLegalEntities(legalEntityListProp);
      return;
    }
    let cancelled = false;
    void fetchGroupMemberUnitsForCommandCenter()
      .then((rows) => {
        if (!cancelled) {
          setHrmLegalEntities(rows);
          if (!rows.length) {
            setHrmCompaniesNotice('Không tải được danh sách công ty từ tenant-scope.');
          }
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setHrmLegalEntities([]);
          setHrmCompaniesNotice(e instanceof Error ? e.message : 'Lỗi tải công ty');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [legalEntityListProp]);
  const titles: Record<HrmWorkspaceMenuKey, { title: string; subtitle: string }> = {
      dashboard: {
        title: 'Tổng quan HRM',
        subtitle: 'Chỉ số nhanh, lối tắt nghiệp vụ và tình trạng kỳ lương.',
      },
      employees: {
        title: 'Nhân sự',
        subtitle: 'Danh sách nhân sự, hồ sơ và phân bổ theo phòng ban.',
      },
      company: {
        title: 'Phòng/Ban & Công ty',
        subtitle: 'Cây phòng ban theo pháp nhân và sơ đồ tổ chức.',
      },
      recruitment: {
        title: 'Tuyển dụng',
        subtitle: 'Kế hoạch tuyển dụng, chiến dịch và ứng viên.',
      },
      attendance: { title: 'Chấm công', subtitle: 'Ca làm, bảng công và đơn nghỉ.' },
      payroll: { title: 'Tiền lương', subtitle: 'Bảng lương, mẫu tính, phụ cấp và khấu trừ.' },
      contracts: { title: 'Hợp đồng', subtitle: 'Hợp đồng lao động và phụ lục.' },
      insurance: {
        title: 'Bảo hiểm',
        subtitle: 'Danh sách BHXH/BHYT từ HRM API (contracts-insurance/insurance).',
      },
      decisions: { title: 'Hàng chờ metadata', subtitle: 'Duyệt thay đổi field hồ sơ sau sync catalog (UC-HRM-26).' },
      hrm_ai: {
        title: 'UniAI',
        subtitle: 'Trợ lý cho HCNS: soạn văn bản, checklist và giải thích chính sách.',
      },
      tasks: {
        title: 'Công việc',
        subtitle: 'Theo dõi việc được giao, hạn xử lý và mức ưu tiên.',
      },
      processes: {
        title: 'Quy trình & chính sách',
        subtitle: 'Sổ quy trình nội bộ, phiên bản và ngày hiệu lực.',
      },
      internal_services: {
        title: 'Dịch vụ nội bộ',
        subtitle: 'Yêu cầu hành chính, cấp phát, hỗ trợ và trạng thái duyệt.',
      },
      tools_equipment: {
        title: 'Công cụ & thiết bị',
        subtitle: 'Tài sản, CCDC, mốc kiểm định và người phụ trách.',
      },
      reports: { title: 'Báo cáo', subtitle: 'Báo cáo nhân sự tổng hợp.' },
      settings: { title: 'Cấu hình HRM', subtitle: 'Thiết lập hệ thống HRM.' },
      guide: {
        title: 'Hướng dẫn sử dụng',
        subtitle: 'Mục lục hướng dẫn theo từng phân hệ.',
      },
  };

  const meta = titles[view];
  const hrmEmployees: Employee[] =
    apiEmployees?.map((row) => ({
      id: row.id,
      code: row.employee_code,
      fullName: row.full_name,
      position: row.job_title_key ?? '—',
      department: 'Du lịch XeVN',
      email: row.email,
      phone: '—',
      employmentType: 'full-time' as const,
      status: row.status === 'active' ? ('active' as const) : ('inactive' as const),
      joinDate: row.hired_at && row.hired_at !== '0' ? row.hired_at : '',
      salary: 0,
    })) ?? [];
  const metadataQueueRows = metadataQueue;
  const activeEmployeeCount =
    apiEmployees?.filter((row) => row.status === 'active').length ?? null;
  const dashboardStats = mapHrmDashboardStats(
    apiEmployees?.length ?? null,
    activeEmployeeCount,
    apiOperationsSummary,
  );
  const recruitmentRows = useMemo(() => {
    if (apiRecruitment?.length) {
      return apiRecruitment.map((r) => ({
        id: r.id,
        campaign: r.title,
        department: r.department ?? '—',
        need: r.headcount ?? 1,
        pipeline: 0,
        status: r.status,
      }));
    }
    return [];
  }, [apiRecruitment]);
  const attendanceRows = useMemo(() => {
    if (apiAttendance?.length) {
      return apiAttendance.map((r) => ({
        id: r.id,
        period: r.attendance_date,
        entity: r.employee_id,
        workdays: 1,
        leave: 0,
        late: 0,
        locked: r.status,
      }));
    }
    return [];
  }, [apiAttendance]);
  const contractRows = useMemo(() => {
    if (apiContracts?.length) {
      return apiContracts.map((r) => ({
        id: r.id,
        code: r.id.slice(0, 8),
        employee: r.employee_id ?? '—',
        type: r.contract_type ?? '—',
        start: '—',
        end: r.end_date ?? '—',
        status: r.status,
      }));
    }
    return [];
  }, [apiContracts]);
  const insuranceRows = useMemo(() => {
    if (apiInsurance?.length) {
      return mapHrmInsuranceEmbedRows(apiInsurance);
    }
    return [];
  }, [apiInsurance]);
  const scopeHint =
    (selectedCompany as { tenantId?: string }).tenantId ?? selectedCompany?.id ?? null;

  const resolveRowScopeHint = (companyId: string | null | undefined): string | null => {
    if (typeof companyId === 'string' && companyId.trim()) {
      return companyId.trim();
    }
    return scopeHint;
  };

  useEffect(() => {
    let cancelled = false;
    const loadMetadataQueue = async () => {
      setMetadataQueueLoading(true);
      setMetadataQueueError(null);
      try {
        const scope = resolveIdentityScope(scopeHint);
        const result = await listEmployeeMetadataQueue(scope);
        if (!cancelled) {
          setMetadataQueue(result.data);
          setMetadataQueueFallback(false);
        }
      } catch (error) {
        if (!cancelled) {
          setMetadataQueue([]);
          setMetadataQueueFallback(true);
          setMetadataQueueError(formatHrmMetadataQueueError(error, 'Không tải được hàng chờ metadata'));
        }
      } finally {
        if (!cancelled) {
          setMetadataQueueLoading(false);
        }
      }
    };
    if (shouldLoadMetadataQueue(view)) {
      void loadMetadataQueue();
    }
    return () => {
      cancelled = true;
    };
  }, [scopeHint, view]);

  useEffect(() => {
    let cancelled = false;
    const apiViews = new Set([
      'employees',
      'payroll',
      'dashboard',
      'recruitment',
      'attendance',
      'contracts',
      'insurance',
      'tasks',
      'internal_services',
      'decisions',
      'reports',
    ]);
    if (!apiViews.has(view)) return;
    const load = async () => {
      setHrmApiLoading(true);
      try {
        const scope = resolveIdentityScope(scopeHint);
        if (view === 'employees' || view === 'dashboard') {
          const emp = await listHrmEmployees(scope);
          if (!cancelled) setApiEmployees(emp.data);
        }
        if (view === 'dashboard') {
          const summary = await getHrmOperationsSummary(scope);
          if (!cancelled) setApiOperationsSummary(summary);
        }
        if (view === 'payroll' || view === 'dashboard') {
          const pay = await listHrmPayslips(scope);
          if (!cancelled) setApiPayslips(pay.data);
        }
        if (view === 'recruitment') {
          const rec = await listHrmJobRequisitions(scope);
          if (!cancelled) setApiRecruitment(rec.data);
        }
        if (view === 'attendance') {
          const att = await listHrmAttendanceRecords(scope);
          if (!cancelled) setApiAttendance(att.data);
        }
        if (view === 'contracts') {
          const con = await listHrmContracts(scope);
          if (!cancelled) setApiContracts(con.data);
        }
        if (view === 'insurance') {
          const ins = await listHrmInsurance(scope);
          if (!cancelled) setApiInsurance(ins.data);
        }
        if (view === 'tasks') {
          const tasks = await listHrmOperationsTasks(scope);
          if (!cancelled) setApiTasks(tasks.data);
        }
        if (view === 'internal_services') {
          const sr = await listHrmServiceRequests(scope);
          if (!cancelled) setApiServiceRequests(sr.data);
        }
        if (view === 'decisions' || view === 'reports') {
          await getHrmOperationsSummary(scope);
        }
        if (!cancelled) {
          setHrmDataSource('api');
          setHrmLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setApiEmployees(null);
          setApiPayslips(null);
          setApiRecruitment(null);
          setApiAttendance(null);
          setApiContracts(null);
          setApiInsurance(null);
          setApiTasks(null);
          setApiServiceRequests(null);
          setApiOperationsSummary(null);
          setHrmDataSource('error');
          setHrmLoadError(API_LOAD_FAILED_MESSAGE);
        }
      } finally {
        if (!cancelled) {
          setHrmApiLoading(false);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [scopeHint, view]);

  const handleMetadataDecision = async (
    action: 'approve' | 'reject',
    row: EmployeeMetadataQueueItem,
  ) => {
    try {
      const payload = {
        actor_name: 'Portal HRM Cockpit',
        note:
          action === 'approve'
            ? 'Duyệt từ Command Center / HRM cockpit'
            : 'Từ chối từ Command Center / HRM cockpit',
      };
      if (action === 'approve') {
        await approveEmployeeMetadataRequest(
          row.id,
          payload,
          resolveIdentityScope(resolveRowScopeHint(row.company_id)),
        );
      } else {
        await rejectEmployeeMetadataRequest(
          row.id,
          payload,
          resolveIdentityScope(resolveRowScopeHint(row.company_id)),
        );
      }
      setMetadataQueue((prev) => prev.filter((item) => item.id !== row.id));
      setMetadataQueueFallback(false);
    } catch (error) {
      setMetadataQueueError(formatHrmMetadataQueueError(error, 'Không cập nhật được yêu cầu metadata'));
    }
  };

  const openHrmApp = (path: string) => {
    window.location.href = path;
  };

  const renderActionBar = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Điều hướng nhanh tới các phân hệ chính của HRM.</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/employees')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Nhân sự
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/recruitment')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Tuyển dụng
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/attendance')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Chấm công
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/payroll')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Tiền lương
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/reports')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Báo cáo
              </button>
            </div>
          </div>
        );
      case 'employees':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Danh sách nhân sự từ HRM API theo scope JWT. Để thao tác đầy đủ, mở ứng dụng HRM.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/employees')}
                className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
              >
                Thêm nhân sự
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/employees')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2.5 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Mở HRM / Nhân sự
              </button>
            </div>
          </div>
        );
      case 'recruitment':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Pipeline và chiến dịch tuyển dụng thực tế được quản lý trong HRM.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/recruitment')}
                className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
              >
                Tạo chiến dịch
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/recruitment')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2.5 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Mở HRM / Tuyển dụng
              </button>
            </div>
          </div>
        );
      case 'contracts':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">Hợp đồng và phụ lục (bao gồm thử việc/chính thức) quản lý trong HRM.</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/contracts')}
                className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
              >
                Mở HRM / Hợp đồng
              </button>
            </div>
          </div>
        );
      case 'insurance':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">BHXH/BHYT/BHTN và hồ sơ tham gia được đồng bộ trong HRM.</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/insurance')}
                className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
              >
                Mở HRM / Bảo hiểm
              </button>
            </div>
          </div>
        );
      case 'decisions':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Hàng chờ duyệt metadata nhân sự — GET /api/hrm/employee-metadata/change-requests.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/settings')}
                className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
              >
                Mở tab Metadata (HRM)
              </button>
            </div>
          </div>
        );
      case 'attendance':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Dữ liệu chi tiết bảng công, ca làm và đơn nghỉ được thao tác trong HRM.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/attendance')}
                className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
              >
                Mở bảng công HRM
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/settings')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2.5 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Thiết lập ca / quy tắc
              </button>
            </div>
          </div>
        );
      case 'payroll':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Kỳ lương thật, phê duyệt và xuất file chi trả được xử lý trong module Lương của HRM.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openHrmApp('/hr/payroll')}
                className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
              >
                Tạo kỳ lương
              </button>
              <button
                type="button"
                onClick={() => openHrmApp('/hr/payroll')}
                className="inline-flex items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 py-2.5 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              >
                Mở HRM / Lương
              </button>
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Danh sách bên dưới chỉ là snapshot; Kanban / Gantt nằm trong module Công việc của HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/tasks')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Công việc
            </button>
          </div>
        );
      case 'hrm_ai':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              UniAI chi tiết (chat multi-turn, lịch sử) chạy trong ứng dụng HRM gốc.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/ai')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở UniAI trong HRM
            </button>
          </div>
        );
      case 'processes':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Bộ quy trình / chính sách đầy đủ (file, version) được cấu hình trong HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/processes')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Quy trình
            </button>
          </div>
        );
      case 'internal_services':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Tạo ticket dịch vụ nội bộ (đặt xe, cấp phát, hỗ trợ…) thực hiện trong HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/internal-services')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Dịch vụ nội bộ
            </button>
          </div>
        );
      case 'tools_equipment':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Ghi nhận CCDC, thiết bị, kiểm kê thực hiện trực tiếp trên module CCDC của HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/tools-equipment')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Công cụ &amp; Thiết bị
            </button>
          </div>
        );
      case 'company':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Cấu trúc pháp nhân, phân cấp đơn vị chính thức được quản lý trong HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/company')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Phòng ban &amp; Công ty
            </button>
          </div>
        );
      case 'reports':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Báo cáo động (filter, export) hiển thị trong module Báo cáo của HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/reports')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Báo cáo
            </button>
          </div>
        );
      case 'settings':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Đây là bản xem nhanh cấu hình; chỉnh sửa chi tiết nằm trong Cài đặt hệ thống của HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/settings')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Cài đặt
            </button>
          </div>
        );
      case 'guide':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Hướng dẫn chi tiết theo ngôn ngữ / quyền người dùng được hiển thị trong màn User Guide của HRM.
            </p>
            <button
              type="button"
              onClick={() => openHrmApp('/hr/guide')}
              className="inline-flex items-center gap-2 rounded-lg bg-xevn-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Hướng dẫn
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
      <div
        className={`flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden border border-xevn-border bg-white/50 shadow-soft backdrop-blur-sm ${SETTINGS_RADIUS_CARD}`}
      >
        <div className={WORKSPACE_STICKY_HEADER_ROW}>
          <div className="flex w-full min-h-10 items-center gap-3">
            <h2
              className={`m-0 flex min-h-0 min-w-0 flex-1 items-center truncate ${WORKSPACE_STICKY_HEADER_AXIS_H} ${SETTINGS_PAGE_TITLE_CLASS}`}
              title={meta.title}
            >
              <span className="min-w-0 truncate">{meta.title}</span>
            </h2>
            <div className={WORKSPACE_STICKY_SEARCH_SHELL_CLASS}>
              <Search className="h-4 w-4 shrink-0 text-xevn-textSecondary" strokeWidth={RAIL_STROKE} />
              <input
                className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 ${SETTINGS_CONTROL_TEXT}`}
                placeholder="Tìm nhanh trong module HRM..."
              />
            </div>
          </div>
        </div>

        <div className="xevn-safe-inline w-full min-w-0 flex-1 min-h-[min(520px,72vh)] overflow-y-auto overflow-x-hidden pb-6 pt-6">
          <SettingSectionHeader title={meta.title} subtitle={meta.subtitle} />

          {hrmApiLoading && !hrmLoadError ? (
            <p className="mt-3 text-sm text-slate-600" role="status">
              Đang tải dữ liệu HRM API…
            </p>
          ) : null}
          <div className="mt-3">
            <ApiLoadBanner
              loadFailed={Boolean(hrmLoadError)}
              title="Trạng thái dữ liệu HRM"
              message={hrmLoadError ?? undefined}
            />
          </div>
          {!hrmLoadError &&
          ['decisions', 'reports', 'hrm_ai', 'tasks', 'processes', 'internal_services', 'tools_equipment', 'guide'].includes(
            view,
          ) &&
          !allowMockFallback() ? (
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              {API_NOT_AVAILABLE_MESSAGE}
            </div>
          ) : null}

          {renderActionBar()}

          {view === 'dashboard' ? (
            <div className="mt-4 space-y-6">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <span
                  className={`inline-flex h-10 items-center rounded-lg border border-xevn-border bg-white px-4 ${SETTINGS_CONTROL_TEXT} text-slate-600`}
                >
                  Kỳ xem: Tháng này
                </span>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white px-4 font-semibold text-xevn-primary shadow-soft transition active:scale-95 hover:bg-slate-50"
                  onClick={() => openHrmApp('/hr/reports')}
                >
                  <Download className="h-4 w-4 shrink-0" strokeWidth={RAIL_STROKE} />
                  Xuất báo cáo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  {
                    label: 'Nhân sự',
                    hint: 'Hồ sơ & phân bổ',
                    Icon: Users,
                    surface: 'border-emerald-200 bg-emerald-50/90',
                    iconClass: 'text-emerald-700',
                  },
                  {
                    label: 'Tuyển dụng',
                    hint: 'Ứng viên & pipeline',
                    Icon: UserPlus,
                    surface: 'border-xevn-primary/25 bg-blue-50/90',
                    iconClass: 'text-xevn-primary',
                  },
                  {
                    label: 'Chấm công',
                    hint: 'Ca & bảng công',
                    Icon: Clock,
                    surface: 'border-amber-200 bg-amber-50/90',
                    iconClass: 'text-amber-800',
                  },
                  {
                    label: 'Tiền lương',
                    hint: 'Kỳ chi & thuế',
                    Icon: Wallet,
                    surface: 'border-rose-200 bg-rose-50/90',
                    iconClass: 'text-rose-700',
                  },
                  {
                    label: 'Báo cáo',
                    hint: 'Thống kê tổng hợp',
                    Icon: BarChart3,
                    surface: 'border-cyan-200 bg-cyan-50/90',
                    iconClass: 'text-cyan-800',
                  },
                ].map(({ label, hint, Icon, surface, iconClass }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const map: Record<string, HrmWorkspaceMenuKey> = {
                        'Nhân sự': 'employees',
                        'Tuyển dụng': 'recruitment',
                        'Chấm công': 'attendance',
                        'Tiền lương': 'payroll',
                        'Báo cáo': 'reports',
                      };
                      const k = map[label];
                      if (k) navigate(hrmPortalPath(k));
                    }}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left shadow-soft transition active:scale-95 hover:brightness-[1.02] ${surface}`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ${iconClass}`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={RAIL_STROKE} />
                    </span>
                    <span className="min-w-0">
                      <span className={`block font-semibold text-xevn-text ${SETTINGS_CONTROL_TEXT}`}>{label}</span>
                      <span className="mt-1 block text-sm text-slate-600">{hint}</span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
                <div
                  className={`flex flex-col justify-between border border-xevn-border bg-white p-5 shadow-soft lg:col-span-7 ${SETTINGS_RADIUS_CARD}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className={`${SETTINGS_CONTROL_TEXT} font-semibold text-xevn-text`}>Tổng quỹ lương kỳ</p>
                      <p className="mt-1 text-sm text-slate-500">Tháng 03/2026 — toàn pháp nhân</p>
                    </div>
                    <span className="rounded-full border border-xevn-border bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                      Đã khóa sổ C&B
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Tổng lương gross</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-xevn-text">299 tỷ ₫</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Thuế TNCN</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-700">30 tỷ ₫</p>
                      <p className="text-xs text-slate-500">~10% quỹ khả dụng</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">BHXH/BHYT/BHTN</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-700">31 tỷ ₫</p>
                      <p className="text-xs text-slate-500">~10,5% tổng quỹ</p>
                    </div>
                  </div>
                </div>
                <div
                  className={`border border-xevn-border bg-white/80 p-5 shadow-soft backdrop-blur-md lg:col-span-5 ${SETTINGS_RADIUS_CARD}`}
                >
                  <p className={`${SETTINGS_CONTROL_TEXT} font-semibold text-xevn-text`}>Thống kê nhân sự</p>
                  <ul className="mt-4 space-y-3">
                    {dashboardStats.map((row) => (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-4 border-b border-xevn-border/80 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-sm text-slate-600">{row.label}</span>
                        <span className="text-lg font-semibold tabular-nums text-xevn-primary">{row.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={`${HRM_TABLE_SHELL}`}>
                <table className={HRM_TABLE_CLASS}>
                  <thead className="bg-white/70 backdrop-blur-md">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Lô bảng lương</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Đơn vị</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Số nhân sự</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Điểm nghẽn</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                        {hrmLoadError
                          ? 'Không tải được lô bảng lương — xem banner phía trên.'
                          : 'Chưa có lô bảng lương từ HRM API.'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={HRM_TABLE_SHELL}>
                <div className="flex items-center justify-between gap-4 border-b border-xevn-border px-4 py-3">
                  <div>
                    <p className={`${SETTINGS_CONTROL_TEXT} font-semibold text-xevn-text`}>
                      Hàng chờ thay đổi metadata nhân sự
                    </p>
                    <p className="text-sm text-slate-500">
                      {metadataQueueFallback
                        ? 'Không tải được HRM API — hàng chờ trống.'
                        : 'Đọc trực tiếp từ HRM API / employee-metadata/change-requests.'}
                    </p>
                  </div>
                  <span className="rounded-full border border-xevn-border bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {metadataQueueLoading ? 'Đang tải...' : `${metadataQueueRows.length} hồ sơ chờ duyệt`}
                  </span>
                </div>
                {metadataQueueError ? (
                  <div className="border-b border-xevn-border bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {metadataQueueError}
                  </div>
                ) : null}
                <table className={HRM_TABLE_CLASS}>
                  <thead className="bg-white/70 backdrop-blur-md">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Nhân sự</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Field</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Giá trị đề nghị</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Lý do</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Workflow</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metadataQueueRows.map((row) => (
                      <tr key={row.id} className="border-t border-xevn-border">
                        <td className="px-3 py-2 text-sm font-medium text-xevn-text">
                          {row.actor_name ?? row.employee_id}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-xevn-primary">{row.field_key}</td>
                        <td className="px-3 py-2 text-slate-700">
                          {typeof row.requested_value === 'string'
                            ? row.requested_value
                            : JSON.stringify(row.requested_value)}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{row.reason ?? 'Không có'}</td>
                        <td className="px-3 py-2 text-slate-600">{row.workflow_code ?? 'Mặc định'}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                              onClick={() => void handleMetadataDecision('approve', row)}
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                              onClick={() => void handleMetadataDecision('reject', row)}
                            >
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {view === 'hrm_ai' ? (
            <div className="mt-4 space-y-4">
              <div
                className={`border border-xevn-border bg-gradient-to-br from-cyan-50/90 to-white p-5 shadow-soft ${SETTINGS_RADIUS_CARD}`}
              >
                <p className={`${SETTINGS_CONTROL_TEXT} font-semibold text-xevn-text`}>Gợi ý nhanh</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    'Soạn thông báo thay đổi chính sách nghỉ phép',
                    'Checklist onboard nhân sự mới trong 7 ngày',
                    'Tóm tắt khác biệt HĐ thử việc vs chính thức',
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="rounded-full border border-xevn-accent/40 bg-white px-4 py-2 text-left text-sm font-medium text-xevn-text shadow-sm transition active:scale-95 hover:bg-cyan-50/80"
                      onClick={() => openHrmApp('/hr/ai')}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div className={HRM_TABLE_SHELL}>
                <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                  <thead className="bg-white/70 backdrop-blur-md">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phiên gần đây</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Người dùng</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Thời điểm</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                        {API_NOT_AVAILABLE_MESSAGE}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {view === 'tasks' ? (
            <div className={HRM_TABLE_SHELL}>
                <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Công việc</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phụ trách</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Hạn</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ưu tiên</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {apiTasks && apiTasks.length > 0
                    ? apiTasks.map((row) => {
                        const priorityLabel =
                          row.priority === 'high' ? 'Cao' : row.priority === 'medium' ? 'Trung bình' : 'Thấp';
                        const statusLabel =
                          row.status === 'in_progress'
                            ? 'Đang làm'
                            : row.status === 'todo'
                              ? 'Chờ xử lý'
                              : row.status === 'done'
                                ? 'Hoàn tất'
                                : row.status;
                        return (
                          <tr key={row.id} className="border-t border-xevn-border">
                            <td className="px-3 py-2 font-medium text-xevn-text">{row.title}</td>
                            <td className="px-3 py-2 text-slate-600">—</td>
                            <td className="px-3 py-2 text-slate-600">{row.due_date ?? '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{priorityLabel}</td>
                            <td className="px-3 py-2 text-slate-600">{statusLabel}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                className="text-[15px] font-semibold text-xevn-primary hover:underline"
                                onClick={() => openHrmApp('/hr/tasks')}
                              >
                                Mở chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    : null}
                  {!hrmApiLoading && (!apiTasks || apiTasks.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                        {hrmLoadError
                          ? 'Không tải được danh sách công việc — xem banner phía trên.'
                          : 'Chưa có công việc — chạy '}
                        {!hrmLoadError ? (
                          <code className="text-xs">pnpm seed:hrm:operations-sample</code>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'processes' ? (
            <div className={HRM_TABLE_SHELL}>
              <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Mã QT</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Tên quy trình / chính sách</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phiên bản</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ban chủ trì</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Hiệu lực</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                      {API_NOT_AVAILABLE_MESSAGE}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'internal_services' ? (
            <div className={HRM_TABLE_SHELL}>
              <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Mã yêu cầu</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Người gửi</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Loại dịch vụ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phòng/Ban</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Gửi lúc</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {apiServiceRequests && apiServiceRequests.length > 0
                    ? apiServiceRequests.map((row) => (
                        <tr key={row.id} className="border-t border-xevn-border">
                          <td className="px-3 py-2 font-mono text-sm text-xevn-primary">{row.id.slice(0, 8)}</td>
                          <td className="px-3 py-2 font-medium text-xevn-text">{row.employee_name}</td>
                          <td className="px-3 py-2 text-slate-600">{row.service_type}</td>
                          <td className="px-3 py-2 text-slate-600">{row.department ?? '—'}</td>
                          <td className="px-3 py-2 text-slate-600">{row.request_date}</td>
                          <td className="px-3 py-2 text-slate-600">{row.status}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              className="text-[15px] font-semibold text-xevn-primary hover:underline"
                              onClick={() => openHrmApp('/hr/internal-services')}
                            >
                              Xử lý
                            </button>
                          </td>
                        </tr>
                      ))
                    : null}
                  {!hrmApiLoading && (!apiServiceRequests || apiServiceRequests.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        {hrmLoadError
                          ? 'Không tải được yêu cầu dịch vụ — xem banner phía trên.'
                          : 'Chưa có yêu cầu dịch vụ — seed operations sample.'}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'tools_equipment' ? (
            <div className={HRM_TABLE_SHELL}>
              <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Mã tài sản</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Tên CCDC / thiết bị</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Đang giao cho</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Vị trí</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Tình trạng</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Kiểm định kế</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                      {API_NOT_AVAILABLE_MESSAGE}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'guide' ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-700">
              {API_NOT_AVAILABLE_MESSAGE}{' '}
              <button
                type="button"
                className="font-semibold text-xevn-primary hover:underline"
                onClick={() => openHrmApp('/hr/guide')}
              >
                Mở HRM đầy đủ
              </button>
            </div>
          ) : null}

          {view === 'company' ? (
            <>
              {hrmCompaniesNotice ? (
                <p className="mt-2 text-sm text-amber-800">{hrmCompaniesNotice}</p>
              ) : null}
            <div className={`overflow-x-auto border border-xevn-border bg-white mt-4 ${SETTINGS_RADIUS_CARD}`}>
              <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Mã</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Tên pháp nhân</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Cấp bậc</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trực thuộc</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {hrmLegalEntities.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-medium tabular-nums text-xevn-text">{row.code}</td>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">
                        {row.entityLevel ? ENTITY_LEVEL_LABELS[row.entityLevel] : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {getParentEntityLabel(row.parentEntityId, hrmLegalEntities) || '—'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={row.status === 'active' ? 'font-medium text-emerald-700' : 'text-slate-500'}>
                          {row.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[15px] font-semibold text-xevn-primary hover:underline"
                          onClick={() => openHrmApp('/hr/company')}
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          ) : null}

          {view === 'employees' ? (
            <p className="mb-2 text-sm text-slate-500">
              Nguồn dữ liệu:{' '}
              {hrmLoadError ? 'API lỗi' : hrmDataSource === 'api' ? 'HRM API (Postgres)' : 'đang tải'}
              {apiEmployees ? ` · ${apiEmployees.length} nhân sự` : ''}
            </p>
          ) : null}

          {view === 'employees' ? (
            <div className={`overflow-x-auto border border-xevn-border bg-white mt-4 ${SETTINGS_RADIUS_CARD}`}>
              <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Mã NV</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Họ tên</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Chức vụ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phòng/Ban</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ngày vào</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {hrmEmployees.map((row: Employee) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-mono text-sm text-xevn-primary">{row.code}</td>
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.fullName}</td>
                      <td className="px-3 py-2 text-slate-700">{row.position}</td>
                      <td className="px-3 py-2 text-slate-600">{row.department}</td>
                      <td className="px-3 py-2">
                        <span className={row.status === 'active' ? 'font-medium text-emerald-700' : 'text-slate-500'}>
                          {row.status === 'active' ? 'Đang làm' : row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{formatJoinDateVi(row.joinDate)}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[15px] font-semibold text-xevn-primary hover:underline"
                          onClick={() => openHrmApp('/hr/employees')}
                        >
                          Xem hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'recruitment' ? (
            <div className={HRM_TABLE_SHELL}>
              <table className={HRM_TABLE_CLASS}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Chiến dịch</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phòng/Ban</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Chỉ tiêu</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Ứng viên pipeline</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {recruitmentRows.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.campaign}</td>
                      <td className="px-3 py-2 text-slate-600">{row.department}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.need}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.pipeline}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            row.status === 'Đang tuyển'
                              ? 'font-medium text-emerald-700'
                              : row.status === 'Tạm dừng'
                                ? 'text-amber-700'
                                : 'text-slate-600'
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[15px] font-semibold text-xevn-primary hover:underline"
                          onClick={() => openHrmApp('/hr/recruitment')}
                        >
                          Mở pipeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'attendance' ? (
            <div className={HRM_TABLE_SHELL}>
              <table className={HRM_TABLE_CLASS}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Kỳ công</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Pháp nhân / Đơn vị</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Ngày công chuẩn</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Nghỉ phép (giờ)</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Đi muộn (lượt)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái kỳ</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.period}</td>
                      <td className="px-3 py-2 text-slate-600">{row.entity}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.workdays}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.leave}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{row.late}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            row.locked === 'Đã khóa kỳ'
                              ? 'font-medium text-emerald-700'
                              : row.locked === 'Mở chỉnh sửa'
                                ? 'text-amber-700'
                                : 'text-slate-600'
                          }
                        >
                          {row.locked}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[15px] font-semibold text-xevn-primary hover:underline"
                          onClick={() => openHrmApp('/hr/attendance')}
                        >
                          Mở kỳ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'payroll' ? (
            <p className="mb-2 text-sm text-slate-500">
              Nguồn: {hrmLoadError ? 'API lỗi' : hrmDataSource === 'api' ? 'HRM API' : 'đang tải'}
              {apiPayslips ? ` · ${apiPayslips.length} phiếu lương` : ''}
            </p>
          ) : null}

          {view === 'payroll' ? (
            <div className={HRM_TABLE_SHELL}>
              <table className={HRM_TABLE_CLASS}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Kỳ chi trả</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phạm vi</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Tổng quỹ (gross)</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Duyệt</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ngày chi</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {apiPayslips && apiPayslips.length > 0
                    ? apiPayslips.map((row) => (
                        <tr key={row.id} className="border-t border-xevn-border">
                          <td className="px-3 py-2 font-medium text-xevn-text">{row.period_label}</td>
                          <td className="px-3 py-2 text-slate-600" colSpan={2}>
                            {row.employee_code} · {row.employee_name}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{row.gross_amount.toLocaleString('vi-VN')}</td>
                          <td className="px-3 py-2 text-slate-700">{row.deduction_amount.toLocaleString('vi-VN')}</td>
                          <td className="px-3 py-2 text-slate-600">{row.net_amount.toLocaleString('vi-VN')}</td>
                          <td className="px-3 py-2">{row.status}</td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              className="text-[15px] font-semibold text-xevn-primary hover:underline"
                              onClick={() => openHrmApp('/hr/payroll')}
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    : null}
                  {!hrmApiLoading && (!apiPayslips || apiPayslips.length === 0) ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                        {hrmLoadError
                          ? 'Không tải được phiếu lương — xem banner phía trên.'
                          : 'Chưa có phiếu lương trên API.'}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'contracts' ? (
            <div className={HRM_TABLE_SHELL}>
              <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Số hợp đồng</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Nhân sự</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Loại</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Hiệu lực từ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Hết hạn</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {contractRows.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-mono text-sm text-xevn-primary">{row.code}</td>
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.employee}</td>
                      <td className="px-3 py-2 text-slate-600">{row.type}</td>
                      <td className="px-3 py-2 text-slate-600">{row.start}</td>
                      <td className="px-3 py-2 text-slate-600">{row.end}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            row.status === 'Hiệu lực'
                              ? 'font-medium text-emerald-700'
                              : row.status.startsWith('Hết hạn')
                                ? 'text-amber-700'
                                : 'text-slate-600'
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[15px] font-semibold text-xevn-primary hover:underline"
                          onClick={() => openHrmApp('/hr/contracts')}
                        >
                          Mở hồ sơ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'insurance' ? (
            <div className={HRM_TABLE_SHELL}>
              {!hrmLoadError && insuranceRows.length === 0 && !hrmApiLoading ? (
                <p className="mb-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Chưa có hồ sơ BHXH trên API — kiểm tra seed fidelity (AC-FID-04) hoặc mở HRM đầy đủ.
                </p>
              ) : null}
              <table className={HRM_TABLE_CLASS}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Số BHXH</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Nhân viên</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Đơn vị BH</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Hiệu lực</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {insuranceRows.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-mono text-sm text-xevn-primary">{row.ref}</td>
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.employee}</td>
                      <td className="px-3 py-2 text-slate-600">{row.regime}</td>
                      <td className="px-3 py-2 text-slate-600">{row.period}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            row.sync === 'Đồng bộ VSSID' || row.sync === 'Đã nộp'
                              ? 'font-medium text-emerald-700'
                              : row.sync === 'Chờ xác nhận'
                                ? 'text-amber-700'
                                : 'text-slate-600'
                          }
                        >
                          {row.sync}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[15px] font-semibold text-xevn-primary hover:underline"
                          onClick={() => openHrmApp('/hr/insurance')}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'decisions' ? (
            <HrmMetadataQueueSection
              rows={metadataQueueRows}
              loading={metadataQueueLoading}
              error={metadataQueueError}
              fallback={metadataQueueFallback}
              onDecide={handleMetadataDecision}
            />
          ) : null}

          {view === 'reports' ? (
            <div className={HRM_TABLE_SHELL}>
              <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {API_NOT_AVAILABLE_MESSAGE}{' '}
                <button
                  type="button"
                  className="ml-1 font-semibold text-xevn-primary hover:underline"
                  onClick={() => openHrmApp('/hr/reports')}
                >
                  Mở HRM đầy đủ
                </button>
              </div>
              <table className={`w-full ${SETTINGS_CONTROL_TEXT}`}>
                <thead className="bg-white/70 backdrop-blur-md">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Báo cáo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Chu kỳ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Lần chạy gần nhất</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Kênh phân phối</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-500">
                      Chưa có báo cáo từ API cockpit.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'settings' ? (
            <div
              className={`border border-xevn-border bg-white/70 mt-4 p-4 shadow-soft backdrop-blur-md ${SETTINGS_RADIUS_CARD}`}
            >
              <div className={`${SETTINGS_SECTION_GRID} gap-y-4`}>
                <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                  <span className={SETTINGS_LABEL_CLASS}>Ngày công chuẩn / tháng</span>
                  <input
                    readOnly
                    className={`mt-2 w-full border border-xevn-border bg-white px-3 py-2 text-left text-base text-xevn-text outline-none focus:ring-2 focus:ring-xevn-accent ${SETTINGS_RADIUS_INPUT}`}
                    defaultValue="22"
                  />
                </label>
                <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                  <span className={SETTINGS_LABEL_CLASS}>Giờ làm việc mặc định / ngày</span>
                  <input
                    readOnly
                    className={`mt-2 w-full border border-xevn-border bg-white px-3 py-2 text-left text-base text-xevn-text outline-none focus:ring-2 focus:ring-xevn-accent ${SETTINGS_RADIUS_INPUT}`}
                    defaultValue="8,0 giờ"
                  />
                </label>
                <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                  <span className={SETTINGS_LABEL_CLASS}>Làm tròn công</span>
                  <input
                    readOnly
                    className={`mt-2 w-full border border-xevn-border bg-white px-3 py-2 text-left text-base text-xevn-text outline-none focus:ring-2 focus:ring-xevn-accent ${SETTINGS_RADIUS_INPUT}`}
                    defaultValue="0,25 bước — nửa ngày"
                  />
                </label>
                <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span8}`}>
                  <span className={SETTINGS_LABEL_CLASS}>Webhook đồng bộ chấm công thiết bị</span>
                  <input
                    readOnly
                    className={`mt-2 w-full border border-xevn-border bg-white px-3 py-2 text-left text-base text-xevn-text outline-none focus:ring-2 focus:ring-xevn-accent ${SETTINGS_RADIUS_INPUT}`}
                    defaultValue="https://api.xevn.local/hrm/attendance/device-ingest"
                  />
                </label>
                <label className={`${SETTINGS_FIELD_SHELL} w-full ${SETTINGS_COL.span4}`}>
                  <span className={SETTINGS_LABEL_CLASS}>Khóa kỳ lương tự động</span>
                  <input
                    readOnly
                    className={`mt-2 w-full border border-xevn-border bg-white px-3 py-2 text-left text-base text-xevn-text outline-none focus:ring-2 focus:ring-xevn-accent ${SETTINGS_RADIUS_INPUT}`}
                    defaultValue="Ngày 25 hàng tháng"
                  />
                </label>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );

}
