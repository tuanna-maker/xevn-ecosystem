/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt → Lịch lễ / Tết (ATT-03b thin LIVE)
 * UC:         UC-BP-ATT-03b · FR-UC-BP-ATT-03b · AC-ATT-03B-* · J-HRM-ATT-03B-01..06
 * BR:         BR-BP-HOL-01 · ATT-03B-PATH/SOT/≠-THIN/LUNAR/TYPE/PUB/ADMIN/CNS/PAY-OUT
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-03b Diễn biến #1–#2 + Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-03B-CLUSTER-API-01.md
 *             F-ATT-HOL-01 RETAIN thin GET/PUT …/holiday-calendars/:year · Nest /core DENY
 * Purpose:    Path lock + display-ready year DTO parse + statusLabelVi FE-derive +
 *             honesty footers — bind LIVE thin {date,nameVi}; residual lunar/type/publish
 *             stub-honest (not DONE until BE-01 wires); DENY Nest /core · claim thin =
 *             ATT-03b DONE · catalog=ATT-01 · LIVE=ATT-11 · AGG=ATT-10 · ATT UAT ·
 *             invent PAY/printable · invent att_leave_hold · invent ASSIGN DONE.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    AttHolidayCalendarPanel · Attendance · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  ATT01QC1-MSLZ3KIM ≠ catalog=DONE · R-ATT-01-ASSIGN open ·
 *             ATT11QC1-MSLXTH9P ≠ LIVE=DONE · ATT10QC1-MSLWGUYH ≠ AGG=DONE ·
 *             ATT09QC1-MSLUTL9D DENY att_leave_hold · ATT08QC1-MSLSL36C HOL-MISS ·
 *             ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · Nest /core DENY · U65 · C-SLICE
 * SOLID:      Pure helpers tách panel — no FE invent lunar/type/publish DONE · no Nest /core
 * LastVerified: attHoliday03bRing.test.ts · poHrmMvpGd1Att03bClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03B-CLUSTER-FE-02
 * What: UPGRADE residual bind after BE-01 — parse/PUT lunarFlag · calendarType · isPaid ·
 *       dayType · status · dayTypeLabelVi FE-derive · midYearPendingLeaveRecalcRequired ·
 *       publishMode · honesty ≠ residual alone=ATT-03b DONE · seals RETAIN · Nest /core 0.
 * must_keep: ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D ·
 *            ATT08QC1-MSLSL36C HOL-MISS · ATT02/PLT/CORE · R-ATT-01-ASSIGN open ·
 *            DENY att_leave_hold · PAY OUT · printable false · U65 · C-SLICE
 * LastVerified: attHoliday03bRing.test.ts · poHrmMvpGd1Att03bClusterFe02.source.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';
import { ApiClientError } from '@/lib/apiError';

/** Physical SoT paths — Network MUST contain; Nest /core holiday = FAIL. */
export const ATT_HOL_03B_PATH_ASSERT = {
  holidayCalendars: '/api/hrm/attendance/holiday-calendars',
  holidayCalendarYear: '/api/hrm/attendance/holiday-calendars/:year',
  leavePreviewPeer: '/api/hrm/attendance/leave-requests/preview-deduction',
  nestCoreDenied: '/api/hrm/core/',
  inventHoldTableDenied: 'att_leave_hold',
} as const;

export const ATT_03B_VAL_400_CODE = 'HRM-VAL-400' as const;
export const ATT_03B_HOL_404_CODE = 'HRM-ATT-HOL-404' as const;
export const ATT_03B_HOL_MISS_PEER = 'HRM-LEAVE-HOL-MISSING' as const;

/** Residual stamps — FE-02 binds wire; ≠ ATT-03b DONE alone (C-SLICE). */
export const R_ATT_03B_LUNAR = 'R-ATT-03B-LUNAR' as const;
export const R_ATT_03B_TYPE = 'R-ATT-03B-TYPE' as const;
export const R_ATT_03B_PUB = 'R-ATT-03B-PUB' as const;
export const R_ATT_03B_ADMIN = 'R-ATT-03B-ADMIN' as const;

export type Att03bCalendarType = 'solar' | 'lunar';
export type Att03bCalendarStatus = 'draft' | 'effective';
export type Att03bDayType = 'nghi' | 'truc';

export type Att03bHolidayDay = {
  date: string;
  nameVi: string | null;
  lunarFlag: boolean | null;
  calendarType: Att03bCalendarType | null;
  isPaid: boolean | null;
  dayType: Att03bDayType | string | null;
  dayTypeLabelVi: string | null;
};

export type Att03bHolidayCalendarEnvelope = {
  id: string | null;
  companyId: string | null;
  year: number | null;
  status: string | null;
  statusLabelVi: string | null;
  calendarType: Att03bCalendarType | null;
  days: Att03bHolidayDay[];
  dayCount: number;
  publishMode: string | null;
  midYearPendingLeaveRecalcRequired: boolean;
  updatedAt: string | null;
  createdAt: string | null;
  /** True when BE returned year calendar thin (id/year/days). */
  envelopePresent: boolean;
  /** True when residual lunar/type/publish fields present from BE. */
  residualDeepenPresent: boolean;
};

export type Att03bPutDayInput = {
  date: string;
  nameVi?: string | null;
  lunarFlag?: boolean | null;
  calendarType?: Att03bCalendarType | null;
  isPaid?: boolean | null;
  dayType?: string | null;
};

export type Att03bPutYearBody = {
  companyId: string;
  status?: Att03bCalendarStatus;
  calendarType?: Att03bCalendarType;
  days: Array<{
    date: string;
    nameVi?: string;
    lunarFlag?: boolean;
    calendarType?: Att03bCalendarType;
    isPaid?: boolean;
    dayType?: string;
  }>;
};

function asBool(v: unknown): boolean | null {
  if (v == null) return null;
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === 1 || v === '1') return true;
  if (v === 'false' || v === 0 || v === '0') return false;
  return null;
}

function asNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeCalendarType(raw: unknown): Att03bCalendarType | null {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === 'solar' || s === 'duong' || s === 'dương') return 'solar';
  if (s === 'lunar' || s === 'am' || s === 'âm') return 'lunar';
  return null;
}

function normalizeDayType(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  const key = s.toLowerCase();
  if (key === 'nghi' || key === 'nghỉ' || key === 'holiday' || key === 'off') return 'nghi';
  if (key === 'truc' || key === 'trực' || key === 'duty' || key === 'on_duty') return 'truc';
  return s;
}

function asMidYearFlag(raw: unknown): boolean {
  if (raw === true) return true;
  if (raw === false || raw == null) return false;
  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
  }
  if (typeof raw === 'number') return raw !== 0;
  return false;
}

/**
 * FE-derive statusLabelVi — wire label wins when non-empty.
 * Thin GĐ1: no calendar.status ⇒ derive from day presence (≠ publish DONE alone).
 */
export function resolveAtt03bStatusLabelVi(
  status: string | null | undefined,
  wireLabel: string | null | undefined,
  dayCount: number,
  envelopePresent: boolean,
): string {
  const fromBe = String(wireLabel ?? '').trim();
  if (fromBe) return fromBe;
  const st = String(status ?? '')
    .trim()
    .toLowerCase();
  if (st === 'draft' || st === 'nhap' || st === 'nháp') return 'Nháp';
  if (st === 'effective' || st === 'published' || st === 'active' || st === 'phat_hanh') {
    return 'Đã phát hành';
  }
  if (st === 'archived') return 'Đã lưu trữ';
  if (!envelopePresent) return 'Chưa có lịch năm';
  if (dayCount <= 0) return 'Năm trống (chưa có ngày)';
  return 'Đã lưu năm (thay tại chỗ GĐ1)';
}

/**
 * FE-derive dayTypeLabelVi — wire wins; map nghi/truc when wire empty.
 * is_paid alone ≠ invent PAY DONE.
 */
export function resolveAtt03bDayTypeLabelVi(
  dayType: string | null | undefined,
  wireLabel: string | null | undefined,
): string | null {
  const fromBe = String(wireLabel ?? '').trim();
  if (fromBe) return fromBe;
  const key = String(dayType ?? '')
    .trim()
    .toLowerCase();
  if (!key) return null;
  if (key === 'nghi' || key === 'nghỉ' || key === 'holiday' || key === 'off') {
    return 'Nghỉ lễ';
  }
  if (key === 'truc' || key === 'trực' || key === 'duty' || key === 'on_duty') {
    return 'Trực lễ';
  }
  return String(dayType).trim();
}

function parseDay(row: Record<string, unknown>): Att03bHolidayDay | null {
  const date = String(row.date ?? row.holiday_date ?? row.holidayDate ?? '')
    .trim()
    .slice(0, 10);
  if (!date) return null;
  const nameRaw = row.nameVi ?? row.name_vi ?? row.name;
  const lunarFlag = asBool(row.lunarFlag ?? row.lunar_flag);
  const calendarType = normalizeCalendarType(row.calendarType ?? row.calendar_type);
  const isPaid = asBool(row.isPaid ?? row.is_paid);
  const dayType = normalizeDayType(row.dayType ?? row.day_type);
  const wireDayLabel =
    row.dayTypeLabelVi != null
      ? String(row.dayTypeLabelVi)
      : row.day_type_label_vi != null
        ? String(row.day_type_label_vi)
        : null;
  return {
    date,
    nameVi: nameRaw != null && String(nameRaw).trim() ? String(nameRaw).trim() : null,
    lunarFlag,
    calendarType,
    isPaid,
    dayType,
    dayTypeLabelVi: resolveAtt03bDayTypeLabelVi(dayType, wireDayLabel),
  };
}

/**
 * Parse GET/PUT year display-ready DTO (API-01 §5 + BE-01 residual).
 * Thin LIVE: id·companyId·year·days[{date,nameVi}]·dayCount·updatedAt.
 * Residual: lunarFlag·calendarType·isPaid·dayType·status·midYearPendingLeaveRecalcRequired.
 */
export function parseAtt03bHolidayCalendarEnvelope(
  raw: unknown,
): Att03bHolidayCalendarEnvelope {
  const empty: Att03bHolidayCalendarEnvelope = {
    id: null,
    companyId: null,
    year: null,
    status: null,
    statusLabelVi: null,
    calendarType: null,
    days: [],
    dayCount: 0,
    publishMode: null,
    midYearPendingLeaveRecalcRequired: false,
    updatedAt: null,
    createdAt: null,
    envelopePresent: false,
    residualDeepenPresent: false,
  };
  if (!raw || typeof raw !== 'object') return empty;
  const row = raw as Record<string, unknown>;
  const year = asNum(row.year ?? row.calendar_year ?? row.calendarYear);
  const id = row.id != null ? String(row.id) : null;
  const companyId =
    row.companyId != null
      ? String(row.companyId)
      : row.company_id != null
        ? String(row.company_id)
        : null;
  const daysRaw = row.days;
  const days: Att03bHolidayDay[] = [];
  if (Array.isArray(daysRaw)) {
    for (const item of daysRaw) {
      if (!item || typeof item !== 'object') continue;
      const d = parseDay(item as Record<string, unknown>);
      if (d) days.push(d);
    }
  }
  const dayCount = asNum(row.dayCount ?? row.day_count) ?? days.length;
  const status =
    row.status != null && String(row.status).trim() ? String(row.status).trim() : null;
  const wireLabel =
    row.statusLabelVi != null
      ? String(row.statusLabelVi)
      : row.status_label_vi != null
        ? String(row.status_label_vi)
        : null;
  const calendarType = normalizeCalendarType(row.calendarType ?? row.calendar_type);
  const publishMode =
    row.publishMode != null
      ? String(row.publishMode)
      : row.publish_mode != null
        ? String(row.publish_mode)
        : null;
  const midYearPendingLeaveRecalcRequired = asMidYearFlag(
    row.midYearPendingLeaveRecalcRequired ??
      row.mid_year_pending_leave_recalc_required,
  );
  const envelopePresent = id != null || year != null || days.length > 0;
  const residualDeepenPresent =
    days.some(
      (d) =>
        d.lunarFlag != null ||
        d.calendarType != null ||
        d.isPaid != null ||
        (d.dayType != null && String(d.dayType).length > 0) ||
        (d.dayTypeLabelVi != null && d.dayTypeLabelVi.length > 0),
    ) ||
    status != null ||
    calendarType != null ||
    midYearPendingLeaveRecalcRequired ||
    (publishMode != null && publishMode.length > 0);

  const statusLabelVi = resolveAtt03bStatusLabelVi(
    status,
    wireLabel,
    dayCount,
    envelopePresent,
  );

  return {
    id,
    companyId,
    year,
    status,
    statusLabelVi,
    calendarType,
    days,
    dayCount,
    publishMode,
    midYearPendingLeaveRecalcRequired,
    updatedAt:
      row.updatedAt != null
        ? String(row.updatedAt)
        : row.updated_at != null
          ? String(row.updated_at)
          : null,
    createdAt:
      row.createdAt != null
        ? String(row.createdAt)
        : row.created_at != null
          ? String(row.created_at)
          : null,
    envelopePresent,
    residualDeepenPresent,
  };
}

/** Empty year shell after HRM-ATT-HOL-404 — allow PUT create (U65). */
export function emptyAtt03bYearEnvelope(
  year: number,
  companyId: string | null,
): Att03bHolidayCalendarEnvelope {
  return {
    id: null,
    companyId,
    year,
    status: null,
    statusLabelVi: resolveAtt03bStatusLabelVi(null, null, 0, false),
    calendarType: null,
    days: [],
    dayCount: 0,
    publishMode: null,
    midYearPendingLeaveRecalcRequired: false,
    updatedAt: null,
    createdAt: null,
    envelopePresent: false,
    residualDeepenPresent: false,
  };
}

/** PUT body — thin date+nameVi + residual lunar/type/status (BE-01 wire). */
export function buildAtt03bPutYearBody(input: {
  companyId: string;
  status?: Att03bCalendarStatus | null;
  calendarType?: Att03bCalendarType | null;
  days: Att03bPutDayInput[];
}): Att03bPutYearBody {
  const body: Att03bPutYearBody = {
    companyId: input.companyId,
    days: input.days.map((d) => {
      const out: Att03bPutYearBody['days'][number] = { date: d.date };
      const name = d.nameVi?.trim();
      if (name) out.nameVi = name;
      if (d.lunarFlag === true || d.lunarFlag === false) out.lunarFlag = d.lunarFlag;
      if (d.calendarType === 'solar' || d.calendarType === 'lunar') {
        out.calendarType = d.calendarType;
      }
      if (d.isPaid === true || d.isPaid === false) out.isPaid = d.isPaid;
      const dt = d.dayType?.trim();
      if (dt) out.dayType = dt;
      return out;
    }),
  };
  if (input.status === 'draft' || input.status === 'effective') {
    body.status = input.status;
  }
  if (input.calendarType === 'solar' || input.calendarType === 'lunar') {
    body.calendarType = input.calendarType;
  }
  return body;
}

/** Client duplicate-date guard → surface as HRM-VAL-400. */
export function validateAtt03bYearDraft(days: Array<{ date: string }>): string | null {
  const seen = new Set<string>();
  for (const d of days) {
    const key = String(d.date ?? '')
      .trim()
      .slice(0, 10);
    if (!key) return 'Mỗi ngày lễ phải có ngày hợp lệ (dd/MM/yyyy hoặc yyyy-MM-dd).';
    if (seen.has(key)) {
      return `Trùng ngày ${key} trong năm — HRM-VAL-400.`;
    }
    seen.add(key);
  }
  return null;
}

export function isAtt03bHol404Error(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.code === ATT_03B_HOL_404_CODE) return true;
    if (error.status === 404) return true;
  }
  if (typeof error === 'object' && error !== null) {
    const code = (error as { code?: string }).code;
    const status = (error as { status?: number }).status;
    if (code === ATT_03B_HOL_404_CODE) return true;
    if (status === 404) return true;
  }
  return false;
}

/** TRUE when path is Nest dual /api/hrm/core/… holiday SoT (FAIL O7). */
export function isForbiddenAttHolidaySotPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('holiday') ||
    p.includes('/att/') ||
    p.includes('attendance') ||
    p.includes('calendar')
  );
}

/** Physical attendance family (PASS O1/O7). */
export function isPhysicalAttHolidayPath(path: string | null | undefined): boolean {
  const p = String(path ?? '');
  return p.includes('/attendance/holiday-calendars');
}

/** Residual deepen LIVE after BE-01 — still ≠ FR-03b / ATT-03b DONE alone. */
export function att03bResidualDeepenBannerText(): string {
  return `${R_ATT_03B_LUNAR} · ${R_ATT_03B_TYPE} · ${R_ATT_03B_PUB}: LIVE residual wire bound · ≠ residual alone=ATT-03b DONE · C-SLICE.`;
}

export function att03bAdminLiveBadgeText(): string {
  return `${R_ATT_03B_ADMIN} residual LIVE`;
}

/** Mid-year replace banner — DENY silent (AC-ATT-03B-MIDYEAR). */
export function att03bMidYearRecalcBannerText(): string {
  return 'Đã thay lịch năm tại chỗ (GĐ1) — cần tính lại đơn nghỉ đang chờ (midYearPendingLeaveRecalcRequired) · ≠ ATT-03b DONE alone.';
}

/** Honesty footer lines — every ATT-03b evidence / UI smoke. */
export const ATT_03B_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  thinNeDone: 'thin year GET/PUT ≠ ATT-03b DONE · ≠ FR-03b DONE',
  residualNeDone: 'residual lunar/type/publish FE bind ≠ ATT-03b DONE alone',
  neCatalog01: '≠ catalog=ATT-01 DONE · ATT01QC1-MSLZ3KIM · R-ATT-01-ASSIGN open',
  neLive11: '≠ LIVE=ATT-11 DONE · ATT11QC1-MSLXTH9P',
  neAgg10: '≠ AGG=ATT-10 DONE · HOL/MEAL OUT · ATT10QC1-MSLWGUYH',
  neSoft09: '≠ soft/ATT-08=ATT-09 DONE · DENY att_leave_hold · ATT09QC1-MSLUTL9D',
  holMissPeer: 'ATT-08 HOL-MISS RETAIN · ATT08QC1-MSLSL36C · ≠ ATT-03b DONE alone',
  neAttModuleUat: '≠ ATT module UAT · attendance_uat_ready=false',
  cfgNeAtt02Done: 'CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7',
  nePltDone: '≠ PLT/platform UAT · PLT01QC1-MSLPUQIU',
  neCore10Done: '≠ CORE-10 DONE · CORE10QC1-MSLP0EJB',
  neCore09Done: '≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89',
  neCore07Done:
    '≠ CORE-07 DONE · GATE 409 · ACT-400 · Nest DENY · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  nestCoreDeny: 'Nest /core holiday = 0',
  payOut: 'PAY OUT invent DONE',
  noSeed: 'U65 zero-seed',
  cSlice: 'C-SLICE · ATT/personnel/PAY/PLT module UAT false',
  residualBound: 'R-ATT-03B-LUNAR/TYPE/PUB FE-02 bound · ≠ residual alone=ATT-03b DONE',
  sheetHolOut: 'sheet HOL OUT GĐ1 · ≠ invent sheet HOL DONE',
} as const;

export function att03bHonestyFooterLines(): string[] {
  return [
    ATT_03B_HONESTY_FOOTER.printableFalse,
    ATT_03B_HONESTY_FOOTER.thinNeDone,
    ATT_03B_HONESTY_FOOTER.residualNeDone,
    ATT_03B_HONESTY_FOOTER.neCatalog01,
    ATT_03B_HONESTY_FOOTER.neLive11,
    ATT_03B_HONESTY_FOOTER.neAgg10,
    ATT_03B_HONESTY_FOOTER.neSoft09,
    ATT_03B_HONESTY_FOOTER.holMissPeer,
    ATT_03B_HONESTY_FOOTER.neAttModuleUat,
    ATT_03B_HONESTY_FOOTER.cfgNeAtt02Done,
    ATT_03B_HONESTY_FOOTER.nePltDone,
    ATT_03B_HONESTY_FOOTER.neCore10Done,
    ATT_03B_HONESTY_FOOTER.neCore09Done,
    ATT_03B_HONESTY_FOOTER.neCore07Done,
    ATT_03B_HONESTY_FOOTER.softNeCore06,
    ATT_03B_HONESTY_FOOTER.nestCoreDeny,
    ATT_03B_HONESTY_FOOTER.payOut,
    ATT_03B_HONESTY_FOOTER.noSeed,
    ATT_03B_HONESTY_FOOTER.cSlice,
    ATT_03B_HONESTY_FOOTER.residualBound,
    ATT_03B_HONESTY_FOOTER.sheetHolOut,
  ];
}

export function att03bHonestyBannerText(): string {
  return [
    `Honesty: ${ATT_03B_HONESTY_FOOTER.printableFalse}`,
    ATT_03B_HONESTY_FOOTER.thinNeDone,
    ATT_03B_HONESTY_FOOTER.residualNeDone,
    ATT_03B_HONESTY_FOOTER.neCatalog01,
    ATT_03B_HONESTY_FOOTER.neLive11,
    ATT_03B_HONESTY_FOOTER.neAgg10,
    ATT_03B_HONESTY_FOOTER.neAttModuleUat,
    ATT_03B_HONESTY_FOOTER.cfgNeAtt02Done,
    'PLT/CORE RETAIN (≠ DONE)',
    ATT_03B_HONESTY_FOOTER.payOut,
    ATT_03B_HONESTY_FOOTER.residualBound,
    ATT_03B_HONESTY_FOOTER.nestCoreDeny,
  ].join(' · ');
}

export function att03bHolMissCtaText(): string {
  return 'Thiếu lịch lễ năm — mở Cài đặt → Lịch lễ / Tết để khai năm rồi thử lại (HRM-LEAVE-HOL-MISSING · ≠ ATT-03b DONE alone).';
}

export function att03bEmptyYearCtaText(): string {
  return 'Chưa có lịch năm — thêm ngày + tên VI + loại/âm (tuỳ chọn) rồi Lưu (U65 · no seed). Residual bind ≠ ATT-03b DONE.';
}

/** Guard — never flip printable from FE alone. */
export function assertAtt03bPrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}
