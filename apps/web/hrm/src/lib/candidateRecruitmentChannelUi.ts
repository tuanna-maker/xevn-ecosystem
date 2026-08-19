/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — tab Ứng viên (source / nguồn)
 * UC:         FR-HRM-SC-CH-01 · AC-SET-CONSUMER-CH-REC-01..03
 * BR:         BR-REC-CH-SOT-01..03
 * SRS:        docs/program/specs/BA-HRM-REC-CHANNELS-CONSUMER-01.md
 * TechSpec:   docs/hrm/DB_DESIGN_HRM_SETTINGS_E1B.md §6
 * Purpose:    Picker + label resolve for candidate.source — catalog when EFF>0, legacy fallback when EFF=0.
 * WorkItem:   PO-HRM-REC-CHANNELS-CONSUMER-FE-01
 * Coded:      2026-08-11
 * Callers:    CandidateFormDialog · CandidatesTab · CandidateDetailView
 * Callees:    recruitmentChannelOptionsFromCatalog · resolveRecruitmentChannelLabel
 * Impact:     Hardcode getSourceOptions as sole SoT when catalog has items → FAIL AC-SC-CH-03
 * must_keep:  YCTD SELECT · pipeline stage EFF · U65 no seed · DEPTCONREG1 sealed
 * SOLID:      Pure UI helpers — no React
 * LastVerified: candidateRecruitmentChannelUi.test.ts
 */

import {
  type CatalogPickerOption,
  resolveRecruitmentChannelLabel,
} from '@/lib/catalogSearchPicker';

export const REC_CHANNEL_EMPTY_HINT_VI =
  'Chưa có kênh tuyển dụng trong danh mục. Đồng bộ từ XBOS hoặc khai báo tại Cài đặt HRM → Danh mục (Kênh tuyển dụng).';

export const REC_CHANNEL_OPEN_SETTINGS_CTA_VI = 'Mở Cài đặt danh mục';

/** Legacy starter list — chỉ dùng khi catalog EFF=0 (BR-REC-CH-SOT-02). */
export function legacyCandidateSourceOptions(
  r: (key: string) => string,
): CatalogPickerOption[] {
  return [
    { value: 'LinkedIn', label: 'LinkedIn', code: 'LinkedIn' },
    { value: 'Website', label: r('sources.website'), code: 'Website' },
    { value: 'TopCV', label: 'TopCV', code: 'TopCV' },
    { value: 'VietnamWorks', label: 'VietnamWorks', code: 'VietnamWorks' },
    { value: 'Facebook', label: 'Facebook', code: 'Facebook' },
    { value: 'Giới thiệu', label: r('sources.referral'), code: 'Giới thiệu' },
    { value: 'Hội chợ việc làm', label: r('sources.jobFair'), code: 'Hội chợ việc làm' },
    { value: 'Email', label: r('sources.directEmail'), code: 'Email' },
    { value: 'Khác', label: r('sources.other'), code: 'Khác' },
  ];
}

export function candidateSourcePickerOptions(
  channelCatalogOptions: readonly CatalogPickerOption[],
  catalogCount: number,
  r: (key: string) => string,
): CatalogPickerOption[] {
  if (catalogCount > 0) return [...channelCatalogOptions];
  return legacyCandidateSourceOptions(r);
}

/** Display label — catalog when EFF>0; legacy map when EFF=0. */
export function resolveCandidateSourceDisplayLabel(
  channelCatalogOptions: readonly CatalogPickerOption[],
  catalogCount: number,
  source: string | null | undefined,
  legacyLabelForCode: (code: string) => string,
): string {
  const code = source?.trim() ?? '';
  if (!code) return '—';
  if (catalogCount > 0) {
    const fromCatalog = resolveRecruitmentChannelLabel(channelCatalogOptions, code);
    if (fromCatalog !== '—') return fromCatalog;
    return code;
  }
  return legacyLabelForCode(code);
}

/** Filter toolbar values — catalog codes + legacy values still on rows. */
export function candidateSourceFilterValues(
  channelCatalogOptions: readonly CatalogPickerOption[],
  catalogCount: number,
  candidateSources: readonly string[],
): string[] {
  const set = new Set<string>();
  if (catalogCount > 0) {
    for (const opt of channelCatalogOptions) set.add(opt.value);
  }
  for (const s of candidateSources) {
    const t = s?.trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
}
