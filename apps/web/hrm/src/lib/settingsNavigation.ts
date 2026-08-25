/**
 * SoT menu Cài đặt HRM — nhóm dọc (AMIS-style). Deep link: /settings?tab=<id>
 * WorkItem: PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-19 PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 * change_mode: UPGRADE
 * What: Quy hoạch lại menu Settings từ 7 nhóm → 8 nhóm đúng nghiệp vụ.
 *       Xóa nhóm "Danh mục & Cấu hình chung" (mơ hồ) và "Hồ sơ nhân sự".
 *       master-data/catalog-leave-types/merge-tokens/dec-decision-types → phân tán về đúng nhóm.
 *       Tách nhóm "Lương & Phúc lợi" thành insurance + payroll; mở rộng recruitment/contract/attendance.
 *       Thêm 16 tab ID mới vào SettingsTabId union + ALL_SETTINGS_TAB_IDS.
 * Why: Sponsor yêu cầu nhóm lại theo nghiệp vụ; chấm công web = view-only (không form nhập liệu).
 * must_keep: SETTINGS_TAB_ALIASES · resolveSettingsTab · resolveEffectiveSettingsTab · tab ID cũ không bị xóa
 */
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Briefcase,
  Calculator,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileSignature,
  FileText,
  GitBranch,
  Globe,
  IdCard,
  Image,
  Key,
  Layers,
  Mail,
  ScrollText,
  Settings as SettingsIcon,
  Shield,
  User,
  UserCheck,
  Users,
} from 'lucide-react';

export type SettingsTabId =
  | 'account'
  | 'branding'
  | 'notifications'
  | 'security'
  | 'roles'
  | 'system'
  | 'subscription'
  | 'catalogs'
  | 'master-data'
  | 'jd-master-library'
  | 'jd-dynamic'
  | 'contract-clauses'
  | 'contract-templates'
  | 'contract-number-config'
  | 'contract-library-publish'
  | 'merge-tokens'
  | 'contract-legal'
  | 'pay-sheet-tpl'
  | 'att-leave-types'
  | 'att-attendance-codes'
  | 'att-ot-types'
  | 'att-ot-comp-types'
  | 'emp-document-types'
  | 'emp-employment-types'
  | 'emp-employment-statuses'
  | 'dec-decision-types'
  | 'si-insurance-types'
  | 'si-insurers'
  | 'rec-pipeline-stages'
  | 'rec-mail-templates'
  | 'settings-defaults'
  | 'catalog-leave-types'
  | 'payroll-insurance-rates'
  // --- Mới thêm 2026-08-19 (PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01) ---
  | 'catalog-job-titles'
  | 'rec-sources'
  | 'rec-interview-types'
  | 'rec-rejection-reasons'
  | 'rec-positions'
  | 'rec-health-requirements'
  | 'contract-types'
  | 'contract-termination-reasons'
  | 'att-shifts'
  | 'att-work-rules'
  | 'att-schedule-groups'
  | 'pay-salary-components'
  | 'pay-salary-formulas'
  | 'pay-salary-groups'
  | 'pay-payslip-tpl'
  | 'pay-tax-tables'
  | 'pay-policy-packs'
  | 'workflow-config';

export type SettingsNavItem = {
  id: SettingsTabId;
  label: string;
  icon: LucideIcon;
  testId?: string;
};

export type SettingsNavGroup = {
  groupId: string;
  title: string;
  items: SettingsNavItem[];
};

/** Alias tab cũ → màn mới (bookmark / QA) */
export const SETTINGS_TAB_ALIASES: Record<string, SettingsTabId> = {
  'contract-legal': 'contract-clauses',
  'catalog-leave-types': 'att-leave-types',
};

export function resolveSettingsTab(raw: string | null | undefined): SettingsTabId {
  const t = (raw ?? '').trim();
  if (!t) return 'account';
  const aliased = SETTINGS_TAB_ALIASES[t] ?? t;
  if (ALL_SETTINGS_TAB_IDS.has(aliased as SettingsTabId)) {
    return aliased as SettingsTabId;
  }
  return 'account';
}

/** CC parent `?tab=` when iframe remounts without tab query (PO-HRM-SETTINGS-W3-F5-LIST-FE-07). */
export function resolveEffectiveSettingsTab(
  iframeTab: string | null | undefined,
  parentTab: string | null | undefined,
): SettingsTabId {
  if ((iframeTab ?? '').trim()) {
    return resolveSettingsTab(iframeTab);
  }
  return resolveSettingsTab(parentTab);
}

const ALL_SETTINGS_TAB_IDS = new Set<SettingsTabId>([
  'account',
  'branding',
  'notifications',
  'security',
  'roles',
  'system',
  'subscription',
  'catalogs',
  'master-data',
  'jd-master-library',
  'jd-dynamic',
  'contract-clauses',
  'contract-templates',
  'contract-number-config',
  'contract-library-publish',
  'merge-tokens',
  'contract-legal',
  'pay-sheet-tpl',
  'att-leave-types',
  'att-attendance-codes',
  'att-ot-types',
  'att-ot-comp-types',
  'emp-document-types',
  'emp-employment-types',
  'emp-employment-statuses',
  'dec-decision-types',
  'si-insurance-types',
  'si-insurers',
  'rec-pipeline-stages',
  'rec-mail-templates',
  'settings-defaults',
  'catalog-leave-types',
  'payroll-insurance-rates',
  // --- Mới thêm 2026-08-19 ---
  'catalog-job-titles',
  'rec-sources',
  'rec-interview-types',
  'rec-rejection-reasons',
  'rec-positions',
  'rec-health-requirements',
  'contract-types',
  'contract-termination-reasons',
  'att-shifts',
  'att-work-rules',
  'att-schedule-groups',
  'pay-salary-components',
  'pay-salary-formulas',
  'pay-salary-groups',
  'pay-payslip-tpl',
  'pay-tax-tables',
  'pay-policy-packs',
  'workflow-config',
]);

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    groupId: 'system',
    title: 'Hệ thống & Tài khoản',
    items: [
      { id: 'account', label: 'Tài khoản', icon: User },
      { id: 'branding', label: 'Thương hiệu', icon: Image },
      { id: 'notifications', label: 'Thông báo', icon: Bell },
      { id: 'security', label: 'Bảo mật', icon: Shield },
      { id: 'roles', label: 'Vai trò & Quyền', icon: Users },
      { id: 'system', label: 'Hệ thống', icon: SettingsIcon },
      { id: 'subscription', label: 'Gói dịch vụ', icon: DollarSign },
    ],
  },
  {
    groupId: 'hr-catalog',
    title: 'Danh mục Nhân sự',
    items: [
      { id: 'master-data', label: 'Đơn vị & Phòng ban', icon: Layers, testId: 'settings-tab-master-data' },
      { id: 'catalog-job-titles', label: 'Chức danh công việc', icon: Briefcase, testId: 'settings-tab-catalog-job-titles' },
      { id: 'emp-document-types', label: 'Loại giấy tờ', icon: IdCard, testId: 'settings-tab-emp-document-types' },
      { id: 'emp-employment-types', label: 'Loại hình thuê', icon: Briefcase, testId: 'settings-tab-emp-employment-types' },
      { id: 'emp-employment-statuses', label: 'Trạng thái nhân viên', icon: UserCheck, testId: 'settings-tab-emp-employment-statuses' },
      { id: 'dec-decision-types', label: 'Loại quyết định', icon: FileSignature, testId: 'settings-tab-dec-decision-types' },
    ],
  },
  {
    groupId: 'recruitment',
    title: 'Tuyển dụng',
    items: [
      { id: 'jd-master-library', label: 'Thư viện JD', icon: FileText, testId: 'settings-tab-jd-master-library' },
      { id: 'jd-dynamic', label: 'Trường JD linh hoạt', icon: FileText, testId: 'settings-tab-jd-dynamic' },
      { id: 'rec-pipeline-stages', label: 'Giai đoạn tuyển dụng', icon: GitBranch, testId: 'settings-tab-rec-pipeline-stages' },
      { id: 'rec-mail-templates', label: 'Mẫu thư tuyển', icon: Mail, testId: 'settings-tab-rec-mail-templates' },
      { id: 'rec-sources', label: 'Nguồn tuyển dụng', icon: Globe, testId: 'settings-tab-rec-sources' },
      { id: 'rec-interview-types', label: 'Loại phỏng vấn', icon: ClipboardCheck, testId: 'settings-tab-rec-interview-types' },
      { id: 'rec-rejection-reasons', label: 'Lý do từ chối', icon: FileText, testId: 'settings-tab-rec-rejection-reasons' },
      { id: 'rec-positions', label: 'Catalog vị trí', icon: Briefcase, testId: 'settings-tab-rec-positions' },
      { id: 'rec-health-requirements', label: 'Yêu cầu sức khỏe', icon: Shield, testId: 'settings-tab-rec-health-requirements' },
    ],
  },
  {
    groupId: 'contract',
    title: 'Hợp đồng lao động',
    items: [
      { id: 'contract-types', label: 'Loại hợp đồng', icon: FileText, testId: 'settings-tab-contract-types' },
      { id: 'contract-clauses', label: 'Điều khoản HĐ', icon: ScrollText, testId: 'settings-tab-contract-clauses' },
      { id: 'contract-templates', label: 'Mẫu hợp đồng', icon: FileText, testId: 'settings-tab-contract-templates' },
      { id: 'contract-number-config', label: 'Đánh số HĐ', icon: FileSignature, testId: 'settings-tab-contract-number-config' },
      { id: 'merge-tokens', label: 'Token merge', icon: Key, testId: 'settings-tab-merge-tokens' },
      { id: 'contract-library-publish', label: 'Phát hành văn bản', icon: Globe, testId: 'settings-tab-contract-library-publish' },
      { id: 'contract-termination-reasons', label: 'Lý do chấm dứt HĐ', icon: FileText, testId: 'settings-tab-contract-termination-reasons' },
    ],
  },
  {
    groupId: 'attendance',
    title: 'Chấm công & Nghỉ phép',
    // Web chỉ dùng để khai báo danh mục. Dữ liệu chấm công thực tế nhập qua máy chấm công tích hợp hoặc mobile app.
    items: [
      { id: 'att-leave-types', label: 'Loại nghỉ phép', icon: FileText, testId: 'settings-tab-att-leave-types' },
      { id: 'att-attendance-codes', label: 'Mã chấm công', icon: ClipboardCheck, testId: 'settings-tab-att-attendance-codes' },
      { id: 'att-ot-types', label: 'Loại tăng ca', icon: Clock, testId: 'settings-tab-att-ot-types' },
      { id: 'att-ot-comp-types', label: 'Chi trả tăng ca', icon: Clock, testId: 'settings-tab-att-ot-comp-types' },
      { id: 'att-shifts', label: 'Ca làm việc', icon: Clock, testId: 'settings-tab-att-shifts' },
      { id: 'att-work-rules', label: 'Quy tắc tính công', icon: Calculator, testId: 'settings-tab-att-work-rules' },
      { id: 'att-schedule-groups', label: 'Nhóm lịch làm việc', icon: Layers, testId: 'settings-tab-att-schedule-groups' },
    ],
  },
  {
    groupId: 'insurance',
    title: 'Bảo hiểm',
    items: [
      { id: 'si-insurance-types', label: 'Loại bảo hiểm', icon: Shield, testId: 'settings-tab-si-insurance-types' },
      { id: 'si-insurers', label: 'Nhà bảo hiểm', icon: Layers, testId: 'settings-tab-si-insurers' },
      { id: 'payroll-insurance-rates', label: 'Mức đóng BH', icon: Shield, testId: 'settings-tab-payroll-insurance-rates' },
    ],
  },
  {
    groupId: 'payroll',
    title: 'Lương & Thu nhập',
    items: [
      { id: 'pay-salary-components', label: 'Thành phần lương', icon: DollarSign, testId: 'settings-tab-pay-salary-components' },
      { id: 'pay-salary-formulas', label: 'Công thức tính lương', icon: Calculator, testId: 'settings-tab-pay-salary-formulas' },
      { id: 'pay-salary-groups', label: 'Nhóm lương', icon: Layers, testId: 'settings-tab-pay-salary-groups' },
      { id: 'pay-sheet-tpl', label: 'Mẫu bảng lương', icon: DollarSign, testId: 'settings-tab-pay-sheet-tpl' },
      { id: 'pay-payslip-tpl', label: 'Template phiếu lương', icon: FileText, testId: 'settings-tab-pay-payslip-tpl' },
      { id: 'pay-tax-tables', label: 'Bảng thuế TNCN', icon: Calculator, testId: 'settings-tab-pay-tax-tables' },
      { id: 'settings-defaults', label: 'Mặc định tính lương', icon: Calculator, testId: 'settings-tab-settings-defaults' },
    ],
  },
  {
    groupId: 'policy',
    title: 'Quy trình & Chính sách',
    items: [
      { id: 'workflow-config', label: 'Cấu hình quy trình', icon: GitBranch, testId: 'settings-tab-workflow-config' },
      { id: 'pay-policy-packs', label: 'Gói chính sách', icon: FileText, testId: 'settings-tab-pay-policy-packs' },
    ],
  },
];
