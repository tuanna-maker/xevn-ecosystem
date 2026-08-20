/**
 * @CODE-MEMORY
 * Screen:     Mobile auth — membership list display-ready (OS 28)
 * UC:         FR-UC-M01 · UC-M01
 * BR:         BR-SCOPE-01
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md v1.1 · FR-UC-M01
 * TechSpec:   API_CONTRACT_NEW.md §8.4–8.5
 * Purpose:    Nhãn công ty / tenant / vai / chức danh từ BE — FE ScopeScreen bind
 *             trực tiếp, không map slug raw.
 * WorkItem:   W1-B-03-AUTH-BE
 * Coded:      2026-08-03
 * Callers:    mobile-auth.service.ts → rowToMembership
 * Callees:    none
 * must_keep:  Giữ company_id / tenant_id / employee_id raw; chỉ ADD *_label
 * SOLID:      SRP label map tách khỏi credential/JWT
 * LastVerified: mobile-auth.service.spec.ts W1-B-03
 */

const COMPANY_LABELS_VI: Record<string, string> = {
  holding: 'Tập đoàn X.E (Holding)',
  main: 'Công ty chính',
  trsport: 'Vận tải X.E',
  logistics: 'Logistics X.E',
  finance: 'Tài chính X.E',
  services: 'Dịch vụ X.E',
};

const TENANT_LABELS_VI: Record<string, string> = {
  xevn: 'Tập đoàn XeVN',
  'xe-du-lich': 'Du lịch XeVN',
};

const ROLE_LABELS_VI: Record<string, string> = {
  employee: 'Nhân viên',
  manager: 'Quản lý',
  hr_manager: 'Quản lý nhân sự',
};

const JOB_TITLE_LABELS_VI: Record<string, string> = {
  ceo: 'CEO',
  coo: 'COO',
  cfo: 'CFO',
  cto: 'CTO',
  chro: 'CHRO',
  director: 'Giám đốc',
  staff: 'Nhân viên',
  manager: 'Quản lý',
  supervisor: 'Giám sát',
  ops_manager: 'Quản lý vận hành',
};

export function mobileCompanyLabelVi(
  companyId: string | null | undefined,
  customDisplay?: string | null,
): string {
  const custom = (customDisplay ?? '').trim();
  if (custom) return custom;
  const slug = String(companyId ?? '')
    .trim()
    .toLowerCase();
  if (!slug) return '—';
  return COMPANY_LABELS_VI[slug] ?? slug;
}

export function mobileTenantLabelVi(
  tenantId: string | null | undefined,
): string {
  const key = String(tenantId ?? '')
    .trim()
    .toLowerCase();
  if (!key) return '—';
  return TENANT_LABELS_VI[key] ?? key;
}

export function mobileRoleLabelVi(roles: string[] | null | undefined): string {
  const list = roles ?? [];
  if (list.includes('hr_manager')) return ROLE_LABELS_VI.hr_manager;
  if (list.includes('manager')) return ROLE_LABELS_VI.manager;
  if (list.includes('employee')) return ROLE_LABELS_VI.employee;
  const first = list[0]?.trim();
  return first ? first.replace(/_/g, ' ') : ROLE_LABELS_VI.employee;
}

export function mobileJobTitleLabelVi(
  jobTitleKey: string | null | undefined,
): string {
  const raw = String(jobTitleKey ?? '').trim();
  if (!raw) return '—';
  const key = raw.toLowerCase();
  return JOB_TITLE_LABELS_VI[key] ?? raw.replace(/_/g, ' ');
}
