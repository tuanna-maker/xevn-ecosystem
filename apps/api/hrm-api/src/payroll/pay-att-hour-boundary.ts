/**
 * @CODE-MEMORY
 * Screen:     HRM → Payroll process (R-PAY-01-BOUNDARY)
 * UC:         FR-UC-BP-PAY-01 · BR-BP-TS-03
 * SRS:        docs/program/specs/PO-HRM-MVP-GD1-PAY-01-CLUSTER-API-01.md §4.11
 * Purpose:    Static guard — giờ kỳ chỉ từ closed att_timesheet_line; cấm leave/OT HTTP cross-read.
 * WorkItem:   PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01
 * Coded:      2026-08-10
 * Callers:    payroll.service processPayrollPeriod
 * must_keep:  no pay_boundary_crossread_* DDL · payroll_e2e_ready=false · C-SLICE
 * SOLID:      Boundary policy tách khỏi orchestrator
 * LastVerified: pay-att-hour-boundary.spec.ts
 */

import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

/** AC-PAY-01-BOUNDARY · API-01 §4.11 — cross-read leave/OT HTTP for hour vars */
export const HRM_PAY_BOUNDARY_403 = 'HRM-PAY-BOUNDARY-403';

const BOUNDARY_VI_MESSAGE =
  'Tính lương không được đọc giờ từ leave-requests hoặc OT HTTP — chỉ từ bảng công đã chốt và dòng khóa (BR-BP-TS-03).';

/** Test-only — production path never sets this (static audit: payroll/** has no leave/OT HTTP). */
let payAttHourCrossreadViolationForTests = false;

/** @internal jest */
export function __setPayAttHourCrossreadViolationForTests(value: boolean): void {
  payAttHourCrossreadViolationForTests = value;
}

/**
 * Gọi trước orchestrator process — fail-closed khi phát hiện cross-read hoặc env misconfig.
 */
export function assertPayrollAttHourBoundaryLocked(): void {
  if (process.env.HRM_PAY_ALLOW_ATT_HTTP_CROSSREAD === '1') {
    throw new ApiException(HRM_PAY_BOUNDARY_403, BOUNDARY_VI_MESSAGE, HttpStatus.FORBIDDEN);
  }
  if (payAttHourCrossreadViolationForTests) {
    throw new ApiException(HRM_PAY_BOUNDARY_403, BOUNDARY_VI_MESSAGE, HttpStatus.FORBIDDEN);
  }
}

/**
 * Đăng ký vi phạm runtime (nếu sau này có facade HTTP) — GĐ1 không gọi từ production path.
 */
export function registerPayAttHourCrossreadAttempt(_source: string): void {
  payAttHourCrossreadViolationForTests = true;
}
