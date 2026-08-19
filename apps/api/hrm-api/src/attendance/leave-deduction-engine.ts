/**
 * @CODE-MEMORY
 * Screen:     HRM → Đơn nghỉ → Preview trừ quỹ (BR-BP-LV-05)
 * UC:         UC-BP-ATT-08 · FR-UC-BP-ATT-08
 * BR:         BR-BP-LV-05 · Q-LEAVE-UNIT · weekend Sat+Sun GĐ1
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md §4 F-ATT-LEAVE-01
 * Purpose:    Pure working-day deduction engine — T6→T2=2 · exclude T7/CN/Lễ · unit day|hour.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    LeaveRequestsService.previewDeduction / createLeaveRequest ALIGN
 * Callees:    expandLeaveDateRange (calendar keys only — ≠ BR-BP-LV-05 SoT)
 * must_keep:  expandLeaveDateRange RETAIN ≠ FR-08 DONE · Nest /core DENY · PAY OUT
 * SOLID:      Pure calc SRP — no DB / Nest controller
 * LastVerified: leave-deduction-engine.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * change_mode: ADD
 * What: BR-BP-LV-05 engine gold T6→T2 working_days=2 · Q-LEAVE-UNIT deductible_units
 * must_keep: calendar expand ≠ engine SoT · ATT-09/03b ≠ DONE · CFG≠ATT-02 · honesty false
 */

import { expandLeaveDateRange } from './leave-attendance-funnel.service';

export type LeaveDeductionUnit = 'day' | 'hour';

export type LeaveExcludedDay = {
  date: string;
  reason: 'weekend' | 'holiday';
  labelVi: string;
};

export type LeaveDeductionResult = {
  calendar_days: number;
  working_days: number;
  deductible_units: number;
  unit: LeaveDeductionUnit;
  excluded_days: LeaveExcludedDay[];
  warnings: string[];
};

const WEEKDAY_LABEL_VI: Record<number, string> = {
  0: 'Chủ nhật',
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
};

/** Parse ISO `yyyy-MM-dd` or `dd/MM/yyyy` → `yyyy-MM-dd`; invalid → null. */
export function parseLeaveDateInput(raw: string): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000Z`);
    if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== s) {
      return null;
    }
    return s;
  }
  const vi = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (vi) {
    const dd = Number(vi[1]);
    const mm = Number(vi[2]);
    const yyyy = Number(vi[3]);
    const iso = `${String(yyyy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    const d = new Date(`${iso}T00:00:00.000Z`);
    if (
      !Number.isFinite(d.getTime()) ||
      d.getUTCFullYear() !== yyyy ||
      d.getUTCMonth() + 1 !== mm ||
      d.getUTCDate() !== dd
    ) {
      return null;
    }
    return iso;
  }
  return null;
}

export function yearsSpanningLeaveRange(startIso: string, endIso: string): number[] {
  const y0 = Number(startIso.slice(0, 4));
  const y1 = Number(endIso.slice(0, 4));
  if (!Number.isFinite(y0) || !Number.isFinite(y1) || y1 < y0) {
    return [y0].filter(Number.isFinite);
  }
  const out: number[] = [];
  for (let y = y0; y <= y1; y += 1) out.push(y);
  return out;
}

export function normalizeLeaveUnit(raw: unknown): LeaveDeductionUnit {
  const u = String(raw ?? 'day').trim().toLowerCase();
  return u === 'hour' ? 'hour' : 'day';
}

/**
 * BR-BP-LV-05 — count working days only (exclude Sat/Sun + holiday set).
 * Gold: Fri 2026-08-07 → Mon 2026-08-10 → working_days=2 · calendar_days=4.
 */
export function computeLeaveDeduction(input: {
  startDate: string;
  endDate: string;
  holidayDates: ReadonlySet<string> | Iterable<string>;
  unit?: LeaveDeductionUnit | string;
  halfDay?: boolean;
  hours?: number;
}): LeaveDeductionResult {
  const start = parseLeaveDateInput(input.startDate) ?? String(input.startDate).trim().slice(0, 10);
  const end = parseLeaveDateInput(input.endDate) ?? String(input.endDate).trim().slice(0, 10);
  const days = expandLeaveDateRange(start, end);
  const holidaySet =
    input.holidayDates instanceof Set
      ? input.holidayDates
      : new Set(Array.from(input.holidayDates));
  const unit = normalizeLeaveUnit(input.unit);
  const excluded_days: LeaveExcludedDay[] = [];
  let working_days = 0;

  for (const date of days) {
    const dow = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    if (dow === 0 || dow === 6) {
      excluded_days.push({
        date,
        reason: 'weekend',
        labelVi: WEEKDAY_LABEL_VI[dow] ?? (dow === 0 ? 'Chủ nhật' : 'Thứ Bảy'),
      });
      continue;
    }
    if (holidaySet.has(date)) {
      excluded_days.push({
        date,
        reason: 'holiday',
        labelVi: 'Ngày lễ',
      });
      continue;
    }
    working_days += 1;
  }

  const calendar_days = days.length;
  let deductible_units = 0;
  if (unit === 'hour') {
    const hours =
      input.hours != null && Number.isFinite(Number(input.hours))
        ? Number(input.hours)
        : working_days;
    deductible_units = working_days <= 0 ? 0 : Math.max(0, hours);
  } else if (input.halfDay) {
    deductible_units = working_days <= 0 ? 0 : 0.5;
  } else {
    deductible_units = working_days;
  }

  const warnings: string[] = [];
  if (working_days === 0 && calendar_days > 0) {
    warnings.push(
      'Khoảng nghỉ toàn thứ Bảy/Chủ nhật/ngày lễ — số trừ quỹ = 0. Kiểm tra trước khi gửi.',
    );
  }

  return {
    calendar_days,
    working_days,
    deductible_units,
    unit,
    excluded_days,
    warnings,
  };
}
