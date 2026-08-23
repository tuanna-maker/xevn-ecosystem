import type { ModuleCardData } from '../data/mockExecutiveDashboardData';

type ExecModuleCatalogEntry = Omit<ModuleCardData, 'id'>;

/** Registry module id → cockpit card metadata (BR-TOS-06). */
export const EXEC_MODULE_CATALOG: Record<string, ExecModuleCatalogEntry> = {
  hrm: {
    title: 'HRM',
    subtitle: 'Nhân sự & Đào tạo',
    icon: 'hrm',
    gradientStart: '#831843',
    gradientEnd: '#9d174d',
    status: 'success',
    stats: [
      { label: 'Phân hệ', value: 'Nhân sự' },
      { label: 'Trạng thái', value: 'Hoạt động' },
    ],
  },
  logistics: {
    title: 'LGTS',
    subtitle: 'Kho bãi & Chuỗi cung ứng',
    icon: 'lgs',
    gradientStart: '#0891b2',
    gradientEnd: '#0e7490',
    status: 'success',
    stats: [
      { label: 'Phân hệ', value: 'Logistics' },
      { label: 'Trạng thái', value: 'Hoạt động' },
    ],
  },
  'x-bos-group': {
    title: 'X-BOS',
    subtitle: 'Holding Core - Quản trị tập đoàn',
    icon: 'x-bos',
    gradientStart: '#1e293b',
    gradientEnd: '#0f172a',
    status: 'success',
    stats: [
      { label: 'Phân hệ', value: 'X-BOS' },
      { label: 'Trạng thái', value: 'Hoạt động' },
    ],
  },
  cockpit: {
    title: 'COCKPIT',
    subtitle: 'Bảng điều hành tập đoàn',
    icon: 'x-bos',
    gradientStart: '#1e40af',
    gradientEnd: '#1e3a8a',
    status: 'success',
    stats: [{ label: 'Phân hệ', value: 'Điều hành' }],
  },
  settings: {
    title: 'SETTINGS',
    subtitle: 'Cấu hình hệ thống',
    icon: 'x-office',
    gradientStart: '#1f2937',
    gradientEnd: '#111827',
    status: 'success',
    stats: [{ label: 'Phân hệ', value: 'Cài đặt' }],
  },
  finance: {
    title: 'X-FINANCE',
    subtitle: 'Tài chính & Kế toán',
    icon: 'x-finance',
    gradientStart: '#14532d',
    gradientEnd: '#166534',
    status: 'success',
    stats: [{ label: 'Phân hệ', value: 'Tài chính' }],
  },
  operations: {
    title: 'OPERATIONS',
    subtitle: 'Vận hành nghiệp vụ',
    icon: 'trsport',
    gradientStart: '#1e3a8a',
    gradientEnd: '#1e40af',
    status: 'success',
    stats: [{ label: 'Phân hệ', value: 'Vận hành' }],
  },
};

const MODULE_ALIASES: Record<string, string> = {
  'x-bos': 'x-bos-group',
};

export function collectMembershipModuleIds(
  memberships: ReadonlyArray<{ modules?: string[] }>,
): string[] {
  const out = new Set<string>();
  for (const m of memberships) {
    for (const mod of m.modules ?? []) {
      const normalized = mod.trim().toLowerCase();
      if (normalized) out.add(normalized);
    }
  }
  return [...out];
}

export function resolveExecModuleCards(moduleIds: string[]): ModuleCardData[] {
  const cards: ModuleCardData[] = [];
  const seen = new Set<string>();
  for (const raw of moduleIds) {
    const key = MODULE_ALIASES[raw] ?? raw;
    if (seen.has(key)) continue;
    const meta = EXEC_MODULE_CATALOG[key];
    if (!meta) continue;
    seen.add(key);
    cards.push({ id: key, ...meta });
  }
  return cards;
}
