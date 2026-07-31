/**
 * @CODE-MEMORY
 * Screen:     HRM — U72 display-label anti raw-key leakage (shared maps)
 * UC:         UC/FR-HRM-U72-LABEL-01 · AC-FD-01..13 · AC-U72-GLOBAL
 * BR:         BR-CO-LABEL-01 · BR-U72-NULL-01 · BR-U72-SPELL-01
 * SRS:        docs/hrm/SRS_FIELD_DISPLAY.md §1–§4 · docs/hrm/SRS.md §17
 * TechSpec:   .cursor/rules/display-label-no-raw-key.mdc · OS 22-DISPLAY-LABEL-RULE
 * Purpose:    Tập trung map enum/slug/code → nhãn tiếng Việt cho UI HRM.
 *             Unknown/null → «—»; cấm fallback `|| raw`.
 * WorkItem:   D-HRM-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    EmployeeProfile, EmployeeResume, EmployeeContracts, Compensation*,
 *             Contracts, ExpiringContractsAlert, JobRequisitionsTab, Candidate*,
 *             HrmApiReminders, Settings*, Performance
 * Callees:    catalogSearchPicker · compensationAllowanceCodes · recruitmentFunnel · employeeCompanyDisplayName
 * Impact:     Sai map → lộ raw key hoặc «—» sai cho nhãn VI đã lưu (vd. «Hợp đồng 1 năm»)
 * must_keep:  resolveIndustryDisplay (tenantScopeApi — không đụng); fail-closed EM_DASH; U65 no seed
 * SOLID:      Pure resolvers — UI chỉ gọi, không nhúng dictionary rải rác
 * LastVerified: labelMaps.encoding.test.ts + labelMaps.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-MOB-UUID-BPRIME-FE-01
 * change_mode: FIX
 * What: resolveHrmCompanyIdDisplay inherits Plane B′ UUID→slug via employeeCompanyDisplayName
 * Why: QC MOB UUID GWC P2 — company labels never raw UUID
 * must_keep: U72 fail-closed EM_DASH; dual-plane BE untouched
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Shared hrm label maps + contract_type giữ nhãn VI sẵn có; tech key → VI / —
 * Why: BA FAIL-LABEL-LEAK F-01..F-13; contract_type UI lưu «Hợp đồng …» không được blank
 * SRS/BR: SRS_FIELD_DISPLAY.md FR-HRM-U72-LABEL-01 · AC-FD-* · BR-CO-LABEL-01
 * must_keep: resolveIndustryDisplay; never || raw
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E3-01
 * change_mode: ADD
 * What: resolvePerformanceEvalStatusDisplay + resolveInsurancePolicyStatusDisplay (U72 SM)
 * Why: AC-E3-U72-01 · BA_ERP_E3 §1.2/§1.3 — cấm raw draft/submitted trên badge
 * must_keep: cycle open≡active; cycle ≠ eval enums
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 (re-dispatch)
 * WorkItem: D-HRM-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Neo CODE-MEMORY → SRS_FIELD_DISPLAY + UC/FR-HRM-U72-LABEL-01; harden status map bind
 * Why: RE-DISPATCH exit — evidence F-01..F-13 CLOSED + spec_read_ack
 * SRS/BR: docs/hrm/SRS_FIELD_DISPLAY.md §2 F-01..F-13 · §4 AC-FD-*
 * must_keep: resolveIndustryDisplay; OU iframe portal; by_company headcount; no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-U72-LABEL-FE-02
 * change_mode: FIX
 * What: resolveJobTitleDisplayLabel — job_title_label / catalog; unknown → «—»; cấm raw key
 * Why: QA AC-FD-U02 FAIL (LEGAL_SPECIALIST on profile HLD-0996)
 * SRS/BR: SRS_FIELD_DISPLAY.md §3 U-02 · AC-FD-U02
 * must_keep: F-01..F-13 maps; resolveIndustryDisplay; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-FE-U72-SOFT-P2-01
 * change_mode: FIX
 * What: resolveLeaveTypeDisplayLabel unknown/empty catalog code → «—» (positive unit path)
 * Why: QC C-U72-LEAVE-P3 soft — prove unknown→— without seed
 * SRS/BR: SRS_FIELD_DISPLAY.md · AC-U72-GLOBAL · leave soft
 * must_keep: AC-FD-U02 · F-01..F-13 · resolveIndustryDisplay · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-FE-U72-LEAVE-NOTE-HYGIENE-01
 * change_mode: ADD
 * What: sanitizeLeaveNoteDisplay — lý do/ghi chú nghỉ bắt đầu bằng `seed:` → «—» (chỉ display)
 * Why: QC C-U72-LEAVE-NOTE-HYGIENE — ENV residue `seed:p1-hrm-h16-leave-density` lộ UI
 * SRS/BR: AC-U72-GLOBAL · hygiene only (không đổi leave-type map CLOSED)
 * must_keep: C-U72-LEAVE-P3 unknown→— · C-XBOS-U72-P2 · F-09/F-10/U02 · U65 no seed
 */
/**
 * @CODE-MEMORY-CHANGE 2026-08-01 — D-REC-13-S2-LABELMAPS-UTF8-01
 * change_mode: FIX
 * What: Ensure labelMaps.ts on-disk bytes are UTF-8 (no UTF-16 LE BOM FF FE / NUL pairs).
 * Why: QA-REC-13-S2-SUBMIT-INBOX-RET-01 FAIL — Vite Unexpected character → /hr/recruitment whitescreen; JobRequisitionsTab unreachable.
 * must_keep: VI semantic label maps; Gửi duyệt QT wire untouched; UF-HRM-12 historic not demoted; U65 no seed
 * LastVerified: labelMaps.encoding.test.ts + Vite GET :8080/hr/src/lib/labelMaps.ts 200
 */



import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import { resolveCatalogPickerSelection } from '@/lib/catalogSearchPicker';
import { XBOS_ALLOWANCE_CODE_OPTIONS } from '@/lib/compensationAllowanceCodes';
import { mapRecruitmentFunnelStage, RECRUITMENT_FUNNEL_LABEL_VI } from '@/lib/recruitmentFunnel';
import { resolveEmployeeCompanyColumnLabel } from '@/lib/employeeCompanyDisplayName';
import {
  resolveEmployeePositionLabel,
  type EmployeePickerLabelSource,
} from '@/lib/employeePickerLabel';
import type { HrmPerformanceEvaluation } from '@/integrations/hrmApi';

export const EM_DASH = '—';

function normalizeKey(raw: string | null | undefined): string {
  return (raw ?? '').trim().toLowerCase();
}

/** ASCII fold for VN phrase matching (không thời hạn / thử việc…). */
function foldAscii(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

/** True when value looks like a technical enum/slug (not a human VI label). */
function looksLikeTechEnumKey(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (/\s/.test(s)) return false;
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(s)) {
    return false;
  }
  return /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/i.test(s);
}

export function resolveGenderDisplay(gender: string | null | undefined): string {
  const key = normalizeKey(gender);
  if (!key) return EM_DASH;
  if (key === 'male') return 'Nam';
  if (key === 'female') return 'Nữ';
  if (key === 'other') return 'Khác';
  return EM_DASH;
}

export function resolveEmploymentTypeDisplay(employmentType: string | null | undefined): string {
  const key = normalizeKey(employmentType).replace(/-/g, '_');
  if (!key) return EM_DASH;

  const map: Record<string, string> = {
    full_time: 'Toàn thời gian',
    fulltime: 'Toàn thời gian',
    part_time: 'Bán thời gian',
    parttime: 'Bán thời gian',
    contract: 'Hợp đồng',
    intern: 'Thực tập',
    internship: 'Thực tập',
    temporary: 'Tạm thời',
    freelance: 'Freelancer',
  };

  return map[key] ?? EM_DASH;
}

export function resolveCompensationLineTypeDisplay(lineType: string | null | undefined): string {
  const key = normalizeKey(lineType);
  if (!key) return EM_DASH;
  if (key === 'base') return 'Lương cơ bản';
  if (key === 'probation') return 'Thử việc';
  if (key === 'allowance') return 'Phụ cấp';
  return EM_DASH;
}

export function resolveAllowanceCodeDisplayLabel(code: string | null | undefined): string {
  const key = code?.trim() ?? '';
  if (!key) return EM_DASH;
  return XBOS_ALLOWANCE_CODE_OPTIONS.find((o) => o.code === key)?.label ?? EM_DASH;
}

/**
 * Contract term type display.
 * - Tech codes (fixed_term / indefinite / HDLD_*) → VI dictionary
 * - Already-human VI labels (e.g. «Hợp đồng 1 năm») → keep as-is
 * - Unknown tech slug → «—» (never raw)
 */
export function resolveContractTypeDisplayLabel(contractType: string | null | undefined): string {
  const trimmed = contractType?.trim() ?? '';
  if (!trimmed) return EM_DASH;

  const key = normalizeKey(trimmed).replace(/-/g, '_');
  const techMap: Record<string, string> = {
    fixed_term: 'Có thời hạn',
    fixedterm: 'Có thời hạn',
    indefinite: 'Không thời hạn',
    permanent: 'Không thời hạn',
    probation: 'Thử việc',
    apprentice: 'Hợp đồng học việc',
    apprenticeship: 'Hợp đồng học việc',
    internship: 'Hợp đồng học việc',
    hdld_kth: 'Không thời hạn',
  };
  if (techMap[key]) return techMap[key];
  if (key.startsWith('hdld_')) return 'Có thời hạn';

  const ascii = foldAscii(trimmed);
  if (
    ascii.includes('khong thoi han') ||
    ascii.includes('khong xac dinh thoi han') ||
    ascii.includes('vo thoi han')
  ) {
    return trimmed;
  }
  if (ascii.includes('thu viec')) return trimmed;
  if (ascii.includes('hoc viec')) return trimmed;
  if (ascii.includes('hop dong')) return trimmed;

  // Human phrase / catalog VI label — keep; unknown tech key — fail-closed.
  if (!looksLikeTechEnumKey(trimmed)) return trimmed;
  return EM_DASH;
}

export function resolveContractStatusDisplay(status: string | null | undefined): string {
  const key = normalizeKey(status);
  if (!key) return EM_DASH;
  const map: Record<string, string> = {
    active: 'Đang hiệu lực',
    pending: 'Chờ hiệu lực',
    expired: 'Hết hạn',
    terminated: 'Đã chấm dứt',
    cancelled: 'Đã hủy',
    draft: 'Nháp',
  };
  return map[key] ?? EM_DASH;
}

export function resolveSettingsCatalogItemStatusDisplay(status: string | null | undefined): string {
  const key = normalizeKey(status);
  if (!key) return EM_DASH;
  if (key === 'active') return 'Đang dùng';
  if (key === 'draft') return 'Nháp';
  if (key === 'inactive') return 'Ngừng dùng';
  return EM_DASH;
}

export function resolveLeaveTypeDisplayLabel(
  options: readonly CatalogPickerOption[],
  leaveTypeCode: string | null | undefined,
): string {
  const hit = resolveCatalogPickerSelection(options, leaveTypeCode);
  if (!hit) return EM_DASH;
  return hit.label;
}

/**
 * Leave reason / note hygiene — never render raw ENV `seed:…` markers to end users.
 * Empty stays empty (table/detail may omit); seed prefix → «—». Business text unchanged.
 */
export function sanitizeLeaveNoteDisplay(raw: string | null | undefined): string {
  if (raw == null) return '';
  const text = String(raw).trim();
  if (!text) return '';
  if (text.toLowerCase().startsWith('seed:')) return EM_DASH;
  return text;
}

/**
 * AC-FD-U02 — Chức vụ / chức danh: job_title_label → catalog label → «—».
 * Never render raw job_title_key (e.g. LEGAL_SPECIALIST).
 */
export function resolveJobTitleDisplayLabel(
  source: EmployeePickerLabelSource,
  catalogOptions?: readonly CatalogPickerOption[],
): string {
  return resolveEmployeePositionLabel(source, catalogOptions) ?? EM_DASH;
}

export function resolveMaritalStatusDisplay(status: string | null | undefined): string {
  const key = normalizeKey(status);
  if (!key) return EM_DASH;
  if (key === 'single') return 'Độc thân';
  if (key === 'married') return 'Đã kết hôn';
  if (key === 'divorced') return 'Đã ly hôn';
  if (key === 'widowed') return 'Góa';
  return EM_DASH;
}

export function resolveRecruitmentFunnelStageDisplay(stage: string | null | undefined): string {
  const raw = stage?.trim() ?? '';
  if (!raw) return EM_DASH;
  const key = normalizeKey(raw);
  const allowed = new Set([
    'new',
    'applied',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected',
  ]);
  if (!allowed.has(key)) return EM_DASH;
  const mapped = mapRecruitmentFunnelStage(raw);
  return RECRUITMENT_FUNNEL_LABEL_VI[mapped] ?? EM_DASH;
}

export function resolveWorkflowInstanceDisplay(workflowInstanceId: string | null | undefined): string {
  const raw = workflowInstanceId?.trim() ?? '';
  if (!raw) return EM_DASH;
  // Do not leak raw UUID to end-user.
  return 'Đã gắn quy trình';
}

export function resolveHrmCompanyIdDisplay(
  companyId: string | null | undefined,
  operatingUnitLabelMap: Map<string, string>,
): string {
  return resolveEmployeeCompanyColumnLabel({
    companyId,
    operatingUnitLabelMap,
  });
}

export function resolvePerformanceCycleStatusDisplay(status: string | null | undefined): string {
  const key = normalizeKey(status);
  if (!key) return EM_DASH;
  if (key === 'draft') return 'Nháp';
  if (key === 'active' || key === 'open') return 'Đang mở'; // SRS open ≡ active
  if (key === 'closed') return 'Đã đóng';
  return EM_DASH;
}

/** Eval SM U72 — Nháp · Đã nộp · Đã duyệt · Hoàn thành (AC-E3-U72-01). */
export function resolvePerformanceEvalStatusDisplay(status: string | null | undefined): string {
  const key = normalizeKey(status);
  if (!key) return EM_DASH;
  if (key === 'draft') return 'Nháp';
  if (key === 'submitted') return 'Đã nộp';
  if (key === 'approved') return 'Đã duyệt';
  if (key === 'completed') return 'Hoàn thành';
  return EM_DASH;
}

/** Insurance policy SM U72 — Nháp · Đang hiệu lực · Hết hạn · Đã hủy. */
export function resolveInsurancePolicyStatusDisplay(status: string | null | undefined): string {
  const key = normalizeKey(status);
  if (!key) return EM_DASH;
  if (key === 'draft') return 'Nháp';
  if (key === 'active') return 'Đang hiệu lực';
  if (key === 'expired') return 'Hết hạn';
  if (key === 'cancelled') return 'Đã hủy';
  return EM_DASH;
}

export function resolvePerformanceEmployeeDisplay(
  row: Pick<HrmPerformanceEvaluation, 'employee_name' | 'employee_code' | 'employee_id'> | null | undefined,
): string {
  const name = row?.employee_name?.trim() ?? '';
  const code = row?.employee_code?.trim() ?? '';
  if (!name) return EM_DASH;
  if (!code) return name;
  return `${name} (${code})`;
}
