/**
 * SoT menu Cài đặt HRM — nhóm dọc (AMIS-style). Deep link: /settings?tab=<id>
 * WorkItem: PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
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
  | 'settings-defaults'
  | 'catalog-leave-types'
  | 'payroll-insurance-rates';

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
  'settings-defaults',
  'catalog-leave-types',
  'payroll-insurance-rates',
]);

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    groupId: 'portal',
    title: 'Tài khoản & portal',
    items: [
      { id: 'account', label: 'Tài khoản', icon: User },
      { id: 'branding', label: 'Thương hiệu', icon: Image },
      { id: 'notifications', label: 'Thông báo', icon: Bell },
      { id: 'security', label: 'Bảo mật', icon: Shield },
      { id: 'roles', label: 'Vai trò & quyền', icon: Users },
      { id: 'system', label: 'Hệ thống', icon: SettingsIcon },
      { id: 'subscription', label: 'Gói dịch vụ', icon: DollarSign },
    ],
  },
  {
    groupId: 'catalog',
    title: 'Danh mục tổng hợp',
    items: [
      { id: 'catalogs', label: 'Danh mục (sync)', icon: Layers },
      { id: 'master-data', label: 'Danh mục nghiệp vụ', icon: Layers },
      { id: 'catalog-leave-types', label: 'Loại nghỉ phép', icon: FileText, testId: 'settings-tab-catalog-leave-types' },
    ],
  },
  {
    groupId: 'contract',
    title: 'Hợp đồng lao động',
    items: [
      {
        id: 'contract-clauses',
        label: 'Điều khoản HĐ',
        icon: ScrollText,
        testId: 'settings-tab-contract-clauses',
      },
      {
        id: 'contract-templates',
        label: 'Mẫu hợp đồng',
        icon: FileText,
        testId: 'settings-tab-contract-templates',
      },
      {
        id: 'contract-number-config',
        label: 'Quy tắc số HĐ',
        icon: FileSignature,
        testId: 'settings-tab-contract-number-config',
      },
      {
        id: 'contract-library-publish',
        label: 'Phát hành thư viện',
        icon: Globe,
        testId: 'settings-tab-contract-library-publish',
      },
      {
        id: 'merge-tokens',
        label: 'Token merge in',
        icon: Key,
        testId: 'settings-tab-merge-tokens',
      },
    ],
  },
  {
    groupId: 'recruitment',
    title: 'Tuyển dụng',
    items: [
      {
        id: 'jd-master-library',
        label: 'Thư viện JD',
        icon: FileText,
        testId: 'settings-tab-jd-master-library',
      },
      {
        id: 'jd-dynamic',
        label: 'Cấu hình trường JD',
        icon: FileText,
        testId: 'settings-tab-jd-dynamic',
      },
      {
        id: 'rec-pipeline-stages',
        label: 'Giai đoạn pipeline',
        icon: GitBranch,
        testId: 'settings-tab-rec-pipeline-stages',
      },
    ],
  },
  {
    groupId: 'attendance',
    title: 'Chấm công',
    items: [
      {
        id: 'att-leave-types',
        label: 'Loại phép',
        icon: FileText,
        testId: 'settings-tab-att-leave-types',
      },
      {
        id: 'att-attendance-codes',
        label: 'Mã chấm công',
        icon: ClipboardCheck,
        testId: 'settings-tab-att-attendance-codes',
      },
      { id: 'att-ot-types', label: 'Loại OT', icon: Clock, testId: 'settings-tab-att-ot-types' },
      {
        id: 'att-ot-comp-types',
        label: 'Chi trả OT',
        icon: Clock,
        testId: 'settings-tab-att-ot-comp-types',
      },
    ],
  },
  {
    groupId: 'employee',
    title: 'Nhân sự (catalog)',
    items: [
      {
        id: 'emp-document-types',
        label: 'Loại giấy tờ',
        icon: IdCard,
        testId: 'settings-tab-emp-document-types',
      },
      {
        id: 'emp-employment-types',
        label: 'Loại hình thuê',
        icon: Briefcase,
        testId: 'settings-tab-emp-employment-types',
      },
      {
        id: 'emp-employment-statuses',
        label: 'Trạng thái NV',
        icon: UserCheck,
        testId: 'settings-tab-emp-employment-statuses',
      },
    ],
  },
  {
    groupId: 'insurance',
    title: 'Bảo hiểm',
    items: [
      {
        id: 'si-insurance-types',
        label: 'Loại BH',
        icon: Shield,
        testId: 'settings-tab-si-insurance-types',
      },
      { id: 'si-insurers', label: 'Nhà bảo hiểm', icon: Layers, testId: 'settings-tab-si-insurers' },
    ],
  },
  {
    groupId: 'decision',
    title: 'Quyết định',
    items: [
      {
        id: 'dec-decision-types',
        label: 'Loại quyết định',
        icon: FileSignature,
        testId: 'settings-tab-dec-decision-types',
      },
    ],
  },
  {
    groupId: 'payroll',
    title: 'Lương',
    items: [
      {
        id: 'pay-sheet-tpl',
        label: 'Mẫu bảng lương',
        icon: DollarSign,
        testId: 'settings-tab-pay-sheet-tpl',
      },
      {
        id: 'settings-defaults',
        label: 'Mặc định thuế/BH/PC',
        icon: Calculator,
        testId: 'settings-tab-settings-defaults',
      },
      {
        id: 'payroll-insurance-rates',
        label: 'Mức đóng BH',
        icon: Shield,
        testId: 'settings-tab-payroll-insurance-rates',
      },
    ],
  },
];
