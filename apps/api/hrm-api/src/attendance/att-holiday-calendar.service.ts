/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Lịch lễ năm (thin · F-ATT-HOL-01 peer)
 * UC:         UC-BP-ATT-08 · FR-UC-BP-ATT-08 · peer FR-UC-BP-ATT-03b ≠ DONE
 * BR:         BR-ATT-08-HOL-MISS — thiếu lịch năm = CHẶN NỘP
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md §5.3 F-ATT-HOL-01
 * DB_DESIGN:  docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md R-ATT-08-HOL
 * Purpose:    Thin year holiday set under /attendance/holiday-calendars* — input engine; ≠ ATT-03b admin DONE.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    attendance.controller · LeaveRequestsService preview/create ALIGN
 * Callees:    HrmDbService · resolveHrmListScope
 * must_keep:  Nest /core DENY · ≠ ATT-03b DONE · CFG≠ATT-02 · soft-delete only · U65 no seed
 * SOLID:      Holiday year-set SRP tách LeaveRequestsService TXN
 * LastVerified: po-hrm-mvp-gd1-att-08-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * change_mode: ADD
 * What: ensureSchema att_holiday_calendar + att_holiday_day · GET/PUT year · assertYearsPresent HOL-MISS
 * must_keep: ATT-02/PLT/CORE seals · PAY OUT · honesty false · ≠ claim ATT-03b DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01
 * change_mode: ADD
 * What: Residual lunar_flag/calendar_type · is_paid/day_type · status on LIVE att_holiday_* only
 *       · GET/PUT deepen display-ready · GĐ1 replace + midYearPendingLeaveRecalcRequired XOR
 * Why:  API-01 RETAIN F-ATT-HOL-01 · DATA-01 stamped closable · BR-BP-HOL-01 · AC-ATT-03B-LUNAR/TYPE/PUB
 * must_keep: ATT01QC1-MSLZ3KIM · ATT11QC1-MSLXTH9P · ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C
 *            HOL-MISS · Nest /core DENY · DENY att_leave_hold · DENY invent ASSIGN · DENY second mega table
 *            sheet HOL OUT GĐ1 · ≠ thin alone=ATT-03b DONE · ≠ catalog/LIVE/AGG DONE · PAY OUT · printable false
 * LastVerified: po-hrm-mvp-gd1-att-03b-cluster-be-01.spec.ts
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  normalizePayrollListCompanyId,
  pushCompanyIdTextColumnFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  parseLeaveDateInput,
  yearsSpanningLeaveRange,
} from './leave-deduction-engine';

export const HRM_LEAVE_HOL_MISSING = 'HRM-LEAVE-HOL-MISSING';
export const HRM_ATT_HOL_404 = 'HRM-ATT-HOL-404';

/** GĐ1 publish XOR — replace-in-place + explicit mid-year pending-leave recalc footer (≠ silent). */
export const ATT_HOL_PUBLISH_MODE_REPLACE_GD1 = 'replace_in_place_gd1' as const;

export type AttHolidayCalendarStatus = 'draft' | 'effective';
export type AttHolidayCalendarType = 'solar' | 'lunar';

type HolidayCalendarRow = {
  id: string;
  company_id: string;
  calendar_year: number;
  status: string | null;
  calendar_type: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type HolidayDayRow = {
  id: string;
  calendar_id: string;
  holiday_date: string;
  name_vi: string | null;
  lunar_flag: boolean | null;
  is_paid: boolean | null;
  day_type: string | null;
  calendar_type: string | null;
};

export type AttHolidayDayDisplay = {
  date: string;
  nameVi: string | null;
  lunarFlag: boolean;
  calendarType: AttHolidayCalendarType | null;
  isPaid: boolean;
  dayType: string | null;
  dayTypeLabelVi: string | null;
};

export type AttHolidayCalendarDisplay = {
  id: string;
  companyId: string;
  year: number;
  status: AttHolidayCalendarStatus;
  statusLabelVi: string;
  calendarType: AttHolidayCalendarType | null;
  days: AttHolidayDayDisplay[];
  dayCount: number;
  /** XOR GĐ1: replace-in-place (not Nest /core dual version table). */
  publishMode: typeof ATT_HOL_PUBLISH_MODE_REPLACE_GD1;
  /**
   * True when PUT replaced an existing active year calendar — pending leave must re-preview
   * (AC-ATT-03B-MIDYEAR · DENY silent mid-year). Sheet HOL OUT GĐ1.
   */
  midYearPendingLeaveRecalcRequired: boolean;
  updatedAt: string;
  createdAt: string;
};

export type PutHolidayDayInput = {
  date: string;
  nameVi?: string;
  lunarFlag?: boolean;
  calendarType?: string;
  isPaid?: boolean;
  dayType?: string;
};

export type PutHolidayCalendarInput = {
  companyId: string;
  status?: string;
  calendarType?: string;
  days?: PutHolidayDayInput[];
};

function statusLabelVi(status: AttHolidayCalendarStatus): string {
  return status === 'effective' ? 'Đã phát hành' : 'Nháp';
}

function dayTypeLabelVi(dayType: string | null | undefined): string | null {
  if (!dayType) return null;
  const key = dayType.trim().toLowerCase();
  if (key === 'nghi' || key === 'nghỉ' || key === 'holiday' || key === 'off') {
    return 'Nghỉ lễ';
  }
  if (key === 'truc' || key === 'trực' || key === 'duty' || key === 'on_duty') {
    return 'Trực lễ';
  }
  return dayType.trim();
}

function normalizeCalendarType(
  raw: string | undefined | null,
): AttHolidayCalendarType | null {
  if (raw == null || String(raw).trim() === '') return null;
  const v = String(raw).trim().toLowerCase();
  if (v === 'solar' || v === 'duong' || v === 'dương') return 'solar';
  if (v === 'lunar' || v === 'am' || v === 'âm') return 'lunar';
  throw new ApiException(
    'HRM-VAL-400',
    `calendarType must be solar|lunar (got '${raw}')`,
    HttpStatus.BAD_REQUEST,
  );
}

function normalizeStatus(
  raw: string | undefined | null,
): AttHolidayCalendarStatus {
  if (raw == null || String(raw).trim() === '') return 'draft';
  const v = String(raw).trim().toLowerCase();
  if (v === 'draft' || v === 'nhap' || v === 'nháp') return 'draft';
  if (
    v === 'effective' ||
    v === 'published' ||
    v === 'phat_hanh' ||
    v === 'phát hành'
  ) {
    return 'effective';
  }
  throw new ApiException(
    'HRM-VAL-400',
    `status must be draft|effective (got '${raw}')`,
    HttpStatus.BAD_REQUEST,
  );
}

function asBool(raw: unknown, fallback: boolean): boolean {
  if (raw === true || raw === false) return raw;
  if (raw == null) return fallback;
  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes') return true;
    if (v === 'false' || v === '0' || v === 'no') return false;
  }
  if (typeof raw === 'number') return raw !== 0;
  return fallback;
}

@Injectable()
export class AttHolidayCalendarService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_holiday_calendar (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        calendar_year INT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        calendar_type TEXT NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_holiday_calendar_company_year_active
        ON public.att_holiday_calendar (company_id, calendar_year)
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_holiday_day (
        id UUID PRIMARY KEY,
        calendar_id UUID NOT NULL REFERENCES public.att_holiday_calendar(id),
        holiday_date DATE NOT NULL,
        name_vi TEXT NULL,
        lunar_flag BOOLEAN NOT NULL DEFAULT FALSE,
        is_paid BOOLEAN NOT NULL DEFAULT TRUE,
        day_type TEXT NULL,
        calendar_type TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_holiday_day_calendar_date
        ON public.att_holiday_day (calendar_id, holiday_date);
    `);
    // LIVE residual ADD (prefer ensure path — no second mega holiday table)
    await this.db.query(`
      ALTER TABLE public.att_holiday_calendar
        ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
        ADD COLUMN IF NOT EXISTS calendar_type TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.att_holiday_day
        ADD COLUMN IF NOT EXISTS lunar_flag BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS day_type TEXT NULL,
        ADD COLUMN IF NOT EXISTS calendar_type TEXT NULL;
    `);
    this.schemaReady = true;
  }

  private resolveScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    tenantId?: string,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId, {
      tenantId,
    });
    const companyKeys = expandHrmTextCompanyIds(
      scope,
      authorization,
      requestedCompanyId,
    );
    return { scope, companyKeys, scopeCompanyId };
  }

  private safeCalendarType(
    raw: string | null | undefined,
  ): AttHolidayCalendarType | null {
    try {
      return normalizeCalendarType(raw);
    } catch {
      return null;
    }
  }

  private safeStatus(raw: string | null | undefined): AttHolidayCalendarStatus {
    try {
      return normalizeStatus(raw);
    } catch {
      return 'draft';
    }
  }

  private display(
    cal: HolidayCalendarRow,
    days: HolidayDayRow[],
    midYearPendingLeaveRecalcRequired: boolean,
  ): AttHolidayCalendarDisplay {
    const status = this.safeStatus(cal.status);
    const calType = this.safeCalendarType(cal.calendar_type);
    const mapped = days.map((d) => {
      const dayCalType =
        this.safeCalendarType(d.calendar_type) ??
        (asBool(d.lunar_flag, false) ? 'lunar' : calType);
      const lunarFlag = asBool(d.lunar_flag, false) || dayCalType === 'lunar';
      const dayType = d.day_type?.trim() || null;
      return {
        date: String(d.holiday_date).slice(0, 10),
        nameVi: d.name_vi,
        lunarFlag,
        calendarType: dayCalType,
        isPaid: asBool(d.is_paid, true),
        dayType,
        dayTypeLabelVi: dayTypeLabelVi(dayType),
      };
    });
    return {
      id: cal.id,
      companyId: cal.company_id,
      year: Number(cal.calendar_year),
      status,
      statusLabelVi: statusLabelVi(status),
      calendarType: calType,
      days: mapped,
      dayCount: mapped.length,
      publishMode: ATT_HOL_PUBLISH_MODE_REPLACE_GD1,
      midYearPendingLeaveRecalcRequired,
      updatedAt: cal.updated_at,
      createdAt: cal.created_at,
    };
  }

  /** Load holiday date keys for company across years (empty set if calendars present but no days). */
  async loadHolidayDateSet(input: {
    companyId: string;
    years: number[];
    authorization?: string;
    tenantId?: string;
  }): Promise<Set<string>> {
    await this.ensureSchema();
    const { companyKeys } = this.resolveScope(
      input.authorization,
      input.companyId,
      input.tenantId,
    );
    if (input.years.length === 0) {
      return new Set();
    }
    const filters: string[] = ['c.archived_at IS NULL'];
    const values: unknown[] = [];
    if (companyKeys.length === 1) {
      values.push(companyKeys[0]);
      filters.push(`c.company_id::text = $${values.length}`);
    } else {
      values.push(companyKeys);
      filters.push(`c.company_id::text = ANY($${values.length}::text[])`);
    }
    values.push(input.years);
    filters.push(`c.calendar_year = ANY($${values.length}::int[])`);
    const res = await this.db.query<{ holiday_date: string }>(
      `
        SELECT d.holiday_date::text AS holiday_date
        FROM public.att_holiday_day d
        INNER JOIN public.att_holiday_calendar c ON c.id = d.calendar_id
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    return new Set(res.rows.map((r) => String(r.holiday_date).slice(0, 10)));
  }

  /**
   * BR-ATT-08-HOL-MISS — every year spanning range MUST have an active calendar row.
   * ABSENT year → HRM-LEAVE-HOL-MISSING (CHẶN NỘP) — no silent empty treat.
   * must_keep ATT08QC1-MSLSL36C · thin HOL peer ≠ ATT-03b DONE alone.
   */
  async assertHolidayYearsPresent(input: {
    companyId: string;
    startDate: string;
    endDate: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<{ years: number[]; holidayDates: Set<string> }> {
    await this.ensureSchema();
    const start = parseLeaveDateInput(input.startDate);
    const end = parseLeaveDateInput(input.endDate);
    if (!start || !end) {
      throw new ApiException(
        'HRM-VAL-400',
        'startDate/endDate must be yyyy-MM-dd or dd/MM/yyyy',
        HttpStatus.BAD_REQUEST,
      );
    }
    const years = yearsSpanningLeaveRange(start, end);
    const { companyKeys } = this.resolveScope(
      input.authorization,
      input.companyId,
      input.tenantId,
    );
    const filters: string[] = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    values.push(years);
    filters.push(`calendar_year = ANY($${values.length}::int[])`);
    const res = await this.db.query<{ calendar_year: number }>(
      `
        SELECT DISTINCT calendar_year
        FROM public.att_holiday_calendar
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    const present = new Set(res.rows.map((r) => Number(r.calendar_year)));
    const missing = years.filter((y) => !present.has(y));
    if (missing.length > 0) {
      throw new ApiException(
        HRM_LEAVE_HOL_MISSING,
        `Holiday calendar missing for year(s): ${missing.join(', ')} — CHẶN NỘP`,
        HttpStatus.BAD_REQUEST,
        { missing_years: missing, company_id: input.companyId },
      );
    }
    const holidayDates = await this.loadHolidayDateSet({
      companyId: input.companyId,
      years,
      authorization: input.authorization,
      tenantId: input.tenantId,
    });
    return { years, holidayDates };
  }

  /** GET /attendance/holiday-calendars/:year — U19 same scope as list/mutate. */
  async getYearCalendar(
    year: number,
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttHolidayCalendarDisplay> {
    await this.ensureSchema();
    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      throw new ApiException(
        'HRM-VAL-400',
        'year must be a valid calendar year',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { scope, companyKeys } = this.resolveScope(
      authorization,
      companyId,
      tenantId,
    );
    const filters: string[] = ['archived_at IS NULL', 'calendar_year = $1'];
    const values: unknown[] = [year];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    const calRes = await this.db.query<HolidayCalendarRow>(
      `
        SELECT id, company_id, calendar_year, status, calendar_type,
               archived_at, created_at, updated_at
        FROM public.att_holiday_calendar
        WHERE ${filters.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT 1;
      `,
      values,
    );
    const cal = calRes.rows[0];
    if (!cal) {
      throw new ApiException(
        HRM_ATT_HOL_404,
        `Holiday calendar for year ${year} not found`,
        HttpStatus.NOT_FOUND,
        { year, company_id: companyId },
      );
    }
    assertResourceInHrmScope(cal, scope, {
      notFoundCode: HRM_ATT_HOL_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    const daysRes = await this.db.query<HolidayDayRow>(
      `
        SELECT id, calendar_id, holiday_date::text AS holiday_date, name_vi,
               lunar_flag, is_paid, day_type, calendar_type
        FROM public.att_holiday_day
        WHERE calendar_id = $1::uuid
        ORDER BY holiday_date ASC;
      `,
      [cal.id],
    );
    // GET alone is not mid-year mutate — footer false; publishMode still stamped for FE honesty.
    return this.display(cal, daysRes.rows, false);
  }

  /**
   * PUT /attendance/holiday-calendars/:year — replace year day set (GĐ1 XOR).
   * Residual deepen: lunar/type/publish — ≠ ATT-03b module DONE · PAY OUT from is_paid alone.
   */
  async putYearCalendar(
    year: number,
    body: PutHolidayCalendarInput,
    authorization?: string,
    tenantId?: string,
  ): Promise<AttHolidayCalendarDisplay> {
    await this.ensureSchema();
    if (!Number.isFinite(year) || year < 2000 || year > 2100) {
      throw new ApiException(
        'HRM-VAL-400',
        'year must be a valid calendar year',
        HttpStatus.BAD_REQUEST,
      );
    }
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      body.companyId,
      { tenantId },
    );
    const { scope } = this.resolveScope(
      authorization,
      body.companyId,
      tenantId,
    );
    const status = normalizeStatus(body.status);
    const calendarType = normalizeCalendarType(body.calendarType);
    const dayInputs = Array.isArray(body.days) ? body.days : [];
    const normalized: Array<{
      date: string;
      nameVi: string | null;
      lunarFlag: boolean;
      calendarType: AttHolidayCalendarType | null;
      isPaid: boolean;
      dayType: string | null;
    }> = [];
    const seenDates = new Set<string>();
    for (const d of dayInputs) {
      const iso = parseLeaveDateInput(d.date);
      if (!iso) {
        throw new ApiException(
          'HRM-VAL-400',
          `Invalid holiday date '${d.date}' — use yyyy-MM-dd or dd/MM/yyyy`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (Number(iso.slice(0, 4)) !== year) {
        throw new ApiException(
          'HRM-VAL-400',
          `Holiday date ${iso} is outside year ${year}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (seenDates.has(iso)) {
        throw new ApiException(
          'HRM-VAL-400',
          `Duplicate holiday date ${iso} in year ${year}`,
          HttpStatus.BAD_REQUEST,
          { holiday_date: iso, year },
        );
      }
      seenDates.add(iso);
      const dayCalType = normalizeCalendarType(d.calendarType);
      const resolvedLunar =
        d.lunarFlag === true || dayCalType === 'lunar'
          ? true
          : d.lunarFlag === false
            ? false
            : false;
      const resolvedType: AttHolidayCalendarType | null =
        dayCalType ?? (resolvedLunar ? 'lunar' : calendarType);
      normalized.push({
        date: iso,
        nameVi: d.nameVi?.trim() || null,
        lunarFlag: resolvedLunar || resolvedType === 'lunar',
        calendarType: resolvedType,
        isPaid: d.isPaid === false ? false : true,
        dayType: d.dayType?.trim() || null,
      });
    }

    let calRes = await this.db.query<HolidayCalendarRow>(
      `
        SELECT id, company_id, calendar_year, status, calendar_type,
               archived_at, created_at, updated_at
        FROM public.att_holiday_calendar
        WHERE company_id = $1 AND calendar_year = $2 AND archived_at IS NULL
        LIMIT 1;
      `,
      [companyId, year],
    );
    let cal = calRes.rows[0];
    let midYearPendingLeaveRecalcRequired = false;
    if (!cal) {
      const id = randomUUID();
      calRes = await this.db.query<HolidayCalendarRow>(
        `
          INSERT INTO public.att_holiday_calendar (id, company_id, calendar_year, status, calendar_type)
          VALUES ($1::uuid, $2, $3, $4, $5)
          RETURNING id, company_id, calendar_year, status, calendar_type,
                    archived_at, created_at, updated_at;
        `,
        [id, companyId, year, status, calendarType],
      );
      cal = calRes.rows[0];
    } else {
      assertResourceInHrmScope(cal, scope, {
        notFoundCode: HRM_ATT_HOL_404,
        mismatchCode: 'HRM-SCOPE-409',
      });
      // Existing year → GĐ1 replace-in-place ⇒ mid-year pending-leave recalc REQUIRED (explicit footer).
      midYearPendingLeaveRecalcRequired = true;
      calRes = await this.db.query<HolidayCalendarRow>(
        `
          UPDATE public.att_holiday_calendar
          SET status = $2,
              calendar_type = $3,
              updated_at = NOW()
          WHERE id = $1::uuid
          RETURNING id, company_id, calendar_year, status, calendar_type,
                    archived_at, created_at, updated_at;
        `,
        [cal.id, status, calendarType],
      );
      cal = calRes.rows[0] ?? cal;
    }
    if (!cal) {
      throw new ApiException(
        'HRM-ATT-HOL-500',
        'Failed to upsert holiday calendar',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.db.query(
      `DELETE FROM public.att_holiday_day WHERE calendar_id = $1::uuid`,
      [cal.id],
    );
    for (const day of normalized) {
      await this.db.query(
        `
          INSERT INTO public.att_holiday_day
            (id, calendar_id, holiday_date, name_vi, lunar_flag, is_paid, day_type, calendar_type)
          VALUES ($1::uuid, $2::uuid, $3::date, $4, $5, $6, $7, $8);
        `,
        [
          randomUUID(),
          cal.id,
          day.date,
          day.nameVi,
          day.lunarFlag,
          day.isPaid,
          day.dayType,
          day.calendarType,
        ],
      );
    }

    const fresh = await this.getYearCalendar(
      year,
      body.companyId,
      authorization,
      tenantId,
    );
    return {
      ...fresh,
      midYearPendingLeaveRecalcRequired,
      publishMode: ATT_HOL_PUBLISH_MODE_REPLACE_GD1,
    };
  }
}
