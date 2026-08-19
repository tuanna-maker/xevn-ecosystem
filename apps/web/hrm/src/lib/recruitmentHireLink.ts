/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — chốt tuyển gắn hồ sơ NV (INT-01)
 * UC:         UC-HRM-INT-01 · AC-PLT-REC-05
 * BR:         G-DB-01 · G-INT-01 · VAL-REC-STG-14
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.33 · FR-HRM-INT-01
 * SRS bước:   Diễn biến #5 thiếu hồ sơ → từ chối · #7 Lưu thành công đủ khóa
 * TechSpec:   docs/hrm/TECHSPEC.md §17.3 G-DB-01 · §16.3 FR-HRM-INT-01
 * Purpose:    Helper FE — nhận diện stage hired (+ hiredOutcomeKey catalog) + copy VI cho HRM-REC-HIRE-400/409.
 * WorkItem:   FE-HRM-G-DB-01-HIRE-BIND-01
 * Coded:      2026-07-21
 * Callers:    HireEmployeeLinkDialog · CandidatesTab · JobCandidatesDialog · useKanbanCandidates · CandidateFormDialog · apiError
 * Callees:    — (thuần helper)
 * must_keep:  G-RC-01 headcount · leave CREATE · U65 no seed · F-REC-HIRE-01 soft-link · default hired khi catalog trống
 * SOLID:      Thuần hàm — UI/API không nhúng chuỗi lỗi hire rải rác
 * LastVerified: recruitmentHireLink.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * EXPAND isHiredStage / needsHireEmployeePicker(optional hiredOutcomeKey) — khớp BE VAL-REC-STG-14.
 * change_mode: ADD · must_keep default `hired` when catalog empty · soft FK
 */

/** Stable BE reject — FR-HRM-INT-01 Diễn biến #5. */
export const HRM_REC_HIRE_400 = 'HRM-REC-HIRE-400';

/** Stable BE reject — FR-HRM-INT-01 Diễn biến #4 (khác đơn vị). */
export const HRM_REC_HIRE_409 = 'HRM-REC-HIRE-409';

/** User-facing VI — thiếu mã hồ sơ khi chốt hired. */
export const HRM_REC_HIRE_400_VI =
  'Chốt tuyển cần gắn hồ sơ nhân viên. Chọn hoặc tạo hồ sơ cùng đơn vị rồi thử lại.';

/** User-facing VI — hồ sơ khác đơn vị với ứng viên. */
export const HRM_REC_HIRE_409_VI =
  'Hồ sơ nhân viên và ứng viên không cùng đơn vị — không thể chốt tuyển.';

/**
 * Hire spine target — default starter key `hired`.
 * When open catalog has hiredOutcomeKey / isHiredOutcome hit, pass that key (AC-PLT-REC-05).
 */
export function isHiredStage(
  stage: string | null | undefined,
  hiredOutcomeKey?: string | null,
): boolean {
  const s = (stage ?? '').trim().toLowerCase();
  if (!s) return false;
  const outcome = hiredOutcomeKey?.trim().toLowerCase();
  if (outcome) return s === outcome;
  return s === 'hired';
}

/**
 * Prefer existing soft link on candidate; otherwise FE must collect employee_id before PATCH.
 */
export function resolveHireEmployeeIdForRequest(
  existingEmployeeId: string | null | undefined,
  selectedEmployeeId: string | null | undefined,
): string | undefined {
  const selected = selectedEmployeeId?.trim();
  if (selected) return selected;
  const existing = existingEmployeeId?.trim();
  if (existing) return existing;
  return undefined;
}

/** True when marking hired-outcome and no employee_id is available yet — open picker. */
export function needsHireEmployeePicker(
  targetStage: string | null | undefined,
  existingEmployeeId: string | null | undefined,
  hiredOutcomeKey?: string | null,
): boolean {
  if (!isHiredStage(targetStage, hiredOutcomeKey)) return false;
  return !existingEmployeeId?.trim();
}

/** Resolve stage key to PATCH on hire confirm (pending selection → catalog outcome → hired). */
export function resolveHireTargetStage(
  pendingStage: string | null | undefined,
  hiredOutcomeKey?: string | null,
): string {
  const pending = pendingStage?.trim();
  if (pending) return pending;
  const outcome = hiredOutcomeKey?.trim();
  if (outcome) return outcome;
  return 'hired';
}
