/** HRM workspace — mount bởi router `/command-center/hrm/:view`, không nhồi vào CommandCenterPage. */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { Company } from '../../data/mock-data';
import { mockCompanies } from '../../data/mock-data';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_PAGE_TITLE_CLASS,
  SETTINGS_RADIUS_CARD,
  WORKSPACE_STICKY_HEADER_ROW,
  WORKSPACE_STICKY_HEADER_AXIS_H,
  WORKSPACE_STICKY_SEARCH_SHELL_CLASS,
} from '../../pages/command-center/settings-form-pattern';
import type { HrmWorkspaceMenuKey } from './types';
import { hrmPortalPath } from './paths';
import {
  HRM_TABLE_SHELL,
  HRM_MOCK_PROCESSES,
  HRM_MOCK_SERVICE_REQUESTS,
  HRM_MOCK_TOOLS_EQUIPMENT,
} from './mock-data';
import { EmployeesView } from './views/employees/EmployeesView';
import { AttendanceView } from './views/attendance/AttendanceView';
import { PayrollView } from './views/payroll/PayrollView';
import { ContractsView } from './views/contracts/ContractsView';
import { InsuranceView } from './views/insurance/InsuranceView';
import { DecisionsView } from './views/decisions/DecisionsView';
import { RecruitmentView } from './views/recruitment/RecruitmentView';
import { DashboardView } from './views/dashboard/DashboardView';
import { ReportsView } from './views/reports/ReportsView';
import { ProcessesView } from './views/processes/ProcessesView';
import { InternalServicesView } from './views/internal-services/InternalServicesView';
import { ToolsEquipmentView } from './views/tools-equipment/ToolsEquipmentView';
import { GuideView } from './views/guide/GuideView';
import { UniAIView } from './views/ai/UniAIView';
import { TasksView } from './views/tasks/TasksView';
import { CompanyView } from './views/company/CompanyView';
import { SettingsView } from './views/settings/SettingsView';

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
  const location = useLocation();
  useGlobalFilter();
  const hrmLegalEntities = legalEntityListProp ?? mockCompanies;
  const titles: Record<HrmWorkspaceMenuKey, { title: string; subtitle: string }> = {
      dashboard: {
        title: 'Tổng quan HRM',
        subtitle: 'Chỉ số nhanh, lối tắt nghiệp vụ và tình trạng kỳ lương.',
      },
      employees: {
        title: 'Quản lý nhân viên',
        subtitle: 'Danh sách nhân viên, hồ sơ nhân sự và thông tin liên quan.',
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
      insurance: { title: 'Bảo hiểm', subtitle: 'BHXH, BHYT, BHTN và hồ sơ tham gia.' },
      decisions: { title: 'Quyết định', subtitle: 'Quyết định nhân sự.' },
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

  const searchParams = new URLSearchParams(location.search);
  const employeeDraft = searchParams.get('createEmployee') === '1';

  const setPanelParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v == null || v === '') params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: false });
  };

  const openHrmApp = (path: string) => {
    /**
     * Trước đây HRM trong portal mở “app HRM gốc” (/hr/*).
     * Giờ portal render native, nên các CTA sẽ điều hướng nội bộ trong `/command-center/hrm/:view`.
     */
    const normalized = path.replace(/\/+$/, '');
    const suffix = normalized.replace(/^\/hr(?=\/|$)/, '') || '/';
    const routeToView: Record<string, HrmWorkspaceMenuKey> = {
      '/': 'dashboard',
      '/employees': 'employees',
      '/company': 'company',
      '/recruitment': 'recruitment',
      '/attendance': 'attendance',
      '/payroll': 'payroll',
      '/contracts': 'contracts',
      '/insurance': 'insurance',
      '/decisions': 'decisions',
      '/reports': 'reports',
      '/settings': 'settings',
      '/ai': 'hrm_ai',
      '/tasks': 'tasks',
      '/processes': 'processes',
      '/internal-services': 'internal_services',
      '/tools-equipment': 'tools_equipment',
      '/guide': 'guide',
    };
    const target = routeToView[suffix] ?? 'dashboard';
    navigate(hrmPortalPath(target));
  };

  const openIframeVersion = () => {
    const params = new URLSearchParams(location.search);
    params.set('iframe', '1');
    navigate(`${location.pathname}?${params.toString()}`, { replace: false });
  };

  const renderActionBar = () => {
    switch (view) {
      case 'dashboard':
        // Dashboard điều hướng bằng các thẻ (tiles) bên trong view.
        return null;
      case 'employees':
        return (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPanelParams({ modal: 'trash' })}
                className="inline-flex items-center gap-2 rounded-full border border-xevn-border bg-white px-4 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50 shadow-sm"
              >
                <div className="w-5 h-5 flex items-center justify-center border border-slate-300 rounded bg-slate-50">
                  <div className="w-2.5 h-3 border-2 border-slate-400 rounded-sm" />
                </div>
                Đã xóa (0)
              </button>
              <button
                type="button"
                onClick={() => setPanelParams({ modal: 'import' })}
                className="inline-flex items-center gap-2 rounded-full border border-xevn-border bg-white px-4 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50 shadow-sm"
              >
                <span className="text-xs font-bold">↑</span>
                Import Excel
              </button>
              <button
                type="button"
                onClick={() => setPanelParams({ modal: 'export' })}
                className="inline-flex items-center gap-2 rounded-full border border-xevn-border bg-white px-4 py-2 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50 shadow-sm"
              >
                <span className="text-xs font-bold">↓</span>
                Xuất
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPanelParams({ createEmployee: employeeDraft ? null : '1', employeeId: null })}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-xevn-primary px-5 text-[13px] font-bold text-white shadow-md shadow-blue-200 transition active:scale-95 hover:opacity-90"
              >
                + Thêm nhân viên
              </button>
            </div>
          </div>
        );
      case 'recruitment':
        return null;
      case 'contracts':
        return null;
      case 'insurance':
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open('/hr/insurance', '_blank')}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Bảo hiểm
            </button>
          </div>
        );
      case 'decisions':
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open('/hr/decisions', '_blank')}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Mở HRM / Quyết định
            </button>
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
        className={`flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden border border-xevn-border bg-xevn-surface shadow-soft ${SETTINGS_RADIUS_CARD}`}
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
                placeholder="Tìm nhanh trong HRM..."
              />
            </div>
          </div>
        </div>

        <div className="xevn-safe-inline w-full min-w-0 flex-1 min-h-[min(520px,72vh)] overflow-y-auto overflow-x-hidden pb-6 pt-6">
          {/* Dashboard gọn: bỏ tiêu đề để tăng diện tích làm việc */}
          {/* Header & Actions Row - Unified on one line */}
          {(view === 'dashboard' || view === 'contracts' || view === 'insurance' || view === 'decisions' || view === 'recruitment') ? null : (
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className={SETTINGS_PAGE_TITLE_CLASS}>{meta.title}</h3>
                {meta.subtitle && (
                  <div className={SETTINGS_PAGE_SUBTITLE_CLASS}>{meta.subtitle}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {renderActionBar()}
              </div>
            </div>
          )}

          {view === 'dashboard' ? <DashboardView /> : null}

          {view === 'hrm_ai' ? <UniAIView /> : null}

          {view === 'tasks' ? <TasksView /> : null}

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
                  {HRM_MOCK_PROCESSES.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-mono text-sm text-xevn-primary">{row.code}</td>
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.name}</td>
                      <td className="px-3 py-2 text-slate-600">{row.version}</td>
                      <td className="px-3 py-2 text-slate-600">{row.owner}</td>
                      <td className="px-3 py-2 text-slate-600">{row.effective}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            row.status === 'Hiệu lực'
                              ? 'font-medium text-emerald-700'
                              : row.status === 'Soạn thảo'
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
                          onClick={() => openHrmApp('/hr/processes')}
                        >
                          Xem PDF
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  {HRM_MOCK_SERVICE_REQUESTS.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-mono text-sm text-xevn-primary">{row.code}</td>
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.requester}</td>
                      <td className="px-3 py-2 text-slate-600">{row.type}</td>
                      <td className="px-3 py-2 text-slate-600">{row.dept}</td>
                      <td className="px-3 py-2 text-slate-600">{row.submitted}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            row.status === 'Hoàn tất'
                              ? 'font-medium text-emerald-700'
                              : row.status.startsWith('Chờ')
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
                          onClick={() => openHrmApp('/hr/internal-services')}
                        >
                          Xử lý
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  {HRM_MOCK_TOOLS_EQUIPMENT.map((row) => (
                    <tr key={row.id} className="border-t border-xevn-border">
                      <td className="px-3 py-2 font-mono text-sm text-xevn-primary">{row.asset}</td>
                      <td className="px-3 py-2 font-medium text-xevn-text">{row.name}</td>
                      <td className="px-3 py-2 text-slate-600">{row.holder}</td>
                      <td className="px-3 py-2 text-slate-600">{row.location}</td>
                      <td className="px-3 py-2 text-slate-600">{row.condition}</td>
                      <td className="px-3 py-2 text-slate-600">{row.nextAudit}</td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          className="text-[15px] font-semibold text-xevn-primary hover:underline"
                          onClick={() => openHrmApp('/hr/tools-equipment')}
                        >
                          Lịch sử
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === 'guide' ? <GuideView /> : null}

          {view === 'company' ? <CompanyView legalEntities={hrmLegalEntities} openHrmApp={openHrmApp} /> : null}

          {view === 'employees' ? (
            <EmployeesView />
          ) : null}

          {view === 'recruitment' ? (
            <RecruitmentView openHrmApp={openHrmApp} />
          ) : null}

          {view === 'attendance' ? (
            <AttendanceView openHrmApp={openHrmApp} />
          ) : null}

          {view === 'payroll' ? (
            <PayrollView openHrmApp={openHrmApp} />
          ) : null}

          {view === 'contracts' ? (
            <ContractsView openHrmApp={openHrmApp} />
          ) : null}

          {view === 'insurance' ? (
            <InsuranceView openHrmApp={openHrmApp} />
          ) : null}

          {view === 'decisions' ? (
            <DecisionsView openHrmApp={openHrmApp} />
          ) : null}

          {view === 'reports' ? <ReportsView /> : null}

          {view === 'processes' ? <ProcessesView /> : null}

          {view === 'internal_services' ? <InternalServicesView /> : null}

          {view === 'tools_equipment' ? <ToolsEquipmentView /> : null}

          {view === 'guide' ? <GuideView /> : null}

          {view === 'hrm_ai' ? <UniAIView /> : null}

          {view === 'settings' ? <SettingsView /> : null}
        </div>
      </div>
    );

}
