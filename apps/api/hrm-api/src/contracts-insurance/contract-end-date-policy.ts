/**
 * @CODE-MEMORY
 * Screen:     HRM → Hợp đồng (create) — end_date by contract type
 * UC:         FR-HRM-CI-01 / HRM-CI-01 · UC-HRM-25
 * BR:         SRS §3.2 — Ngày kết thúc «Theo loại»; nếu có ≥ start_date
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.2 FR-HRM-CI-01
 * TechSpec:   docs/hrm/TECHSPEC.md §14.2 · §16.9 **G-CI-01**
 * Purpose:    Quyết định end_date bắt buộc vs optional theo loại HĐ (không thời hạn).
 * WorkItem:   BE-HRM-G-CI-01
 * Coded:      2026-07-22
 * Callers:    contracts-insurance.service.ts → createContract
 * Callees:    ApiException
 * Impact:     Sai policy → HĐ có hạn thiếu ngày hoặc HĐ vô hạn bị ép end_date
 * must_keep:  Open-ended codes (indefinite/permanent/HDLD_KTH + VN labels); HRM-CON-001 range
 * SOLID:      Pure policy — service chỉ gọi assert
 * LastVerified: contracts-insurance.service.spec.ts (G-CI-01)
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

/** Strip diacritics for VN label match (không thời hạn / không xác định…). */
function normalizeContractTypeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

/**
 * Open-ended / indefinite labor contracts — end_date optional (SRS «Theo loại»).
 * Codes: indefinite, permanent, HDLD_KTH; labels containing không thời hạn / indefinite.
 */
export function isOpenEndedContractType(contractType: string): boolean {
  const key = normalizeContractTypeKey(contractType);
  if (!key) return false;
  if (key === 'indefinite' || key === 'permanent' || key === 'hdld_kth') {
    return true;
  }
  return (
    key.includes('indefinite') ||
    key.includes('khong thoi han') ||
    key.includes('khong xac dinh thoi han') ||
    key.includes('vo thoi han')
  );
}

export function contractTypeRequiresEndDate(contractType: string): boolean {
  return !isOpenEndedContractType(contractType);
}

/**
 * G-CI-01 create policy:
 * - open-ended: end_date optional; if present must be >= start_date
 * - fixed/other: end_date required; must be >= start_date
 */
/**
 * Wizard Step1→2 draft (NV-first): default effective date when FE omits start_date.
 * SRS BA-01 O5 — user may apply template suggestion later; draft must persist.
 */
export function resolveContractStartDateForCreate(input: {
  startDate?: string | null;
  effectiveFrom?: string | null;
  defaultToday?: () => string;
}): string {
  const trimmed = input.startDate?.trim() || input.effectiveFrom?.trim();
  if (trimmed) return trimmed;
  const fallback =
    input.defaultToday ??
    (() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()));
  return fallback();
}

export function assertContractEndDateForCreate(input: {
  contractType: string;
  startDate: string;
  endDate?: string | null;
}): void {
  const end = input.endDate?.trim() ? input.endDate.trim() : null;
  if (!end) {
    if (contractTypeRequiresEndDate(input.contractType)) {
      throw new ApiException(
        'HRM-CON-002',
        'end_date is required for this contract_type',
        HttpStatus.BAD_REQUEST,
      );
    }
    return;
  }
  if (new Date(input.startDate).getTime() > new Date(end).getTime()) {
    throw new ApiException('HRM-CON-001', 'start_date must be <= end_date', HttpStatus.BAD_REQUEST);
  }
}
