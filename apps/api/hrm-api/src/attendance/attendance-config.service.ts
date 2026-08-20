/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Quy tắc / GPS work-sites (CFG)
 * UC:         HRM-AT-14 · menu-fidelity CFG P0-1/P0-6 · FR-UC-BP-ATT-03d
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md v0.8 · FR-UC-BP-ATT-03d
 * TechSpec:   docs/hrm/TECHSPEC.md attendance CFG · ADR-HRM-ATTENDANCE-CFG-PERSIST D2–D3
 * Purpose:    Persist attendance_rules (1 row/slug) + CRUD attendance_work_sites (geofence SoT).
 * WorkItem:   PO-MFD-M1-ATT-P0-CFG-BE-01
 * Coded:      2026-08-04
 * Callers:    attendance.controller.ts · AttendanceService (gps_enabled read)
 * Callees:    resolveHrmListScope · resolveHrmPersistCompanyIdText · HrmDbService
 * must_keep:  FE AttendanceRules column parity; U65 lazy GET default (no seed script);
 *             work_shifts wins vs XBOS shifts REF; Face GĐ2; geofence SoT = work-sites
 * SOLID:      CFG tách khỏi TXN records/sheets
 * LastVerified: attendance-config.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-ATT-03d-05b-BE-01
 * change_mode: UPGRADE
 * What: FE-ready radius alias trên create/update; scope parity list↔mutate work-sites (TEXT slug).
 * Why:  SRS FR-UC-BP-ATT-03d MVP GPS điểm + ADR D3 company_id TEXT.
 * must_keep: expandHrmTextCompanyIds list; assertResourceInHrmScope update/delete; no ensureDefaultWorkSite
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01
 * change_mode: UPGRADE
 * What: F-ATT-CAT-WS deepen — list default active-only (include_inactive=true audit);
 *       DELETE product path = soft-retire active=false; hard DELETE chỉ khi ?hard=true (residual);
 *       countActiveWorkSites cho CNS-05 GPS method fail-closed.
 * Why:  BA VAL-ATT-WS-CNS-03b/04 · BR-PLT-04 · SA Option B · ADR D3 · U65 no ensureDefault
 * must_keep: GEO-001 assert · open admin CREATE N+1 · SITE-UNKNOWN HOLD · no fold leave · no seed
 * spec_ref: SRS FR-UC-BP-ATT-03d · SA/BA ATT-WORKSITE-CATALOG · AC-PLT-ATT-WORKSITE-01*
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
 * change_mode: ADD
 * What: Residual F-ATT-RULE-01 — soft cols late_penalty_* on attendance_rules +
 *       specificity public.att_attendance_rule (dept+shift > dept > company > shift);
 *       XOR mode minute|block|tier · bands[] · latePenaltyEnabled · display-ready;
 *       PATCH …/rules (+ optional …/rules/late-penalty); notifyLate ≠ off;
 *       evaluate helper for sheet late_penalty_hours funnel.
 * Why:  FR-UC-BP-ATT-02 Diễn biến #1/#3/#5 · BR-BP-SHF-02 · API-01 F.1 CONFIRMED
 * must_keep: RETAIN round/methods/notify_late/work-sites/shifts/late_early/funnel col;
 *            Nest @Controller('core') DENY · CFG ≠ ATT-02 DONE · attendance_uat_ready=false;
 *            PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *            CORE07QC1-KZJTSHNT · soft≠CORE-06 · PAY/printable OUT · U19 list=get=mutate · U65
 * spec_ref: SRS FR-UC-BP-ATT-02 · API-01 · DATA-01 · BA O1–O12 · SA Option A
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  HRM_COMPANY_UUID_BY_SLUG,
  pushCompanyIdTextColumnFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateWorkSiteDto } from './dto/create-work-site.dto';
import { UpdateAttendanceRulesDto } from './dto/update-attendance-rules.dto';
import { UpdateWorkSiteDto } from './dto/update-work-site.dto';
import {
  assertBandsNoOverlap,
  assertXorLatePenaltyMode,
  evaluateLatePenaltyHours,
  modeLabelVi,
  normalizeLatePenaltyMode,
  parseLatePenaltyBands,
  pickBestSpecificityRule,
  type LatePenaltyBand,
  type LatePenaltyMode,
} from './late-penalty.util';

type AttendanceRulesRow = {
  id: string;
  company_id: string;
  work_start_day: number | null;
  work_end_day: number | null;
  work_days: string[] | null;
  round_in_minutes: number | null;
  round_out_minutes: number | null;
  standard_type: string | null;
  standard_days_per_month: string | number | null;
  hours_per_day: string | number | null;
  allow_multiple_checkin: boolean | null;
  auto_checkout: boolean | null;
  notify_late: boolean | null;
  gps_enabled: boolean | null;
  wifi_enabled: boolean | null;
  qr_enabled: boolean | null;
  faceid_enabled: boolean | null;
  gps_locations: unknown;
  late_penalty_mode?: string | null;
  late_penalty_bands?: unknown;
  late_penalty_enabled?: boolean | null;
  late_penalty_department_id?: string | null;
  late_penalty_shift_id?: string | null;
  created_at: string;
  updated_at: string;
};

type AttAttendanceRuleRow = {
  id: string;
  company_id: string;
  department_id: string | null;
  shift_id: string | null;
  mode: string;
  bands_json: unknown;
  late_penalty_enabled: boolean | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type WorkSiteRow = {
  id: string;
  company_id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  active: boolean;
  created_at: string;
};

const DEFAULT_RULES_VALUES = {
  work_start_day: 1,
  work_end_day: 31,
  work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  round_in_minutes: 0,
  round_out_minutes: 0,
  standard_type: 'fixed',
  standard_days_per_month: 26,
  hours_per_day: 8,
  allow_multiple_checkin: true,
  auto_checkout: false,
  notify_late: true,
  gps_enabled: true,
  wifi_enabled: true,
  qr_enabled: false,
  faceid_enabled: false,
  gps_locations: [] as unknown[],
};

@Injectable()
export class AttendanceConfigService {
  constructor(private readonly db: HrmDbService) {}

  async ensureRulesSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL UNIQUE,
        work_start_day INTEGER,
        work_end_day INTEGER,
        work_days TEXT[],
        round_in_minutes INTEGER,
        round_out_minutes INTEGER,
        standard_type TEXT,
        standard_days_per_month NUMERIC,
        hours_per_day NUMERIC,
        allow_multiple_checkin BOOLEAN,
        auto_checkout BOOLEAN,
        notify_late BOOLEAN,
        gps_enabled BOOLEAN,
        wifi_enabled BOOLEAN,
        qr_enabled BOOLEAN,
        faceid_enabled BOOLEAN,
        gps_locations JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // Residual ATT-02 soft cols (DATA-01 ADD stamped · prefer extend LIVE spine)
    await this.db.query(
      `ALTER TABLE public.attendance_rules ADD COLUMN IF NOT EXISTS late_penalty_mode TEXT NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.attendance_rules ADD COLUMN IF NOT EXISTS late_penalty_bands JSONB NOT NULL DEFAULT '[]'::jsonb;`,
    );
    await this.db.query(
      `ALTER TABLE public.attendance_rules ADD COLUMN IF NOT EXISTS late_penalty_enabled BOOLEAN NOT NULL DEFAULT TRUE;`,
    );
    await this.db.query(
      `ALTER TABLE public.attendance_rules ADD COLUMN IF NOT EXISTS late_penalty_department_id TEXT NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.attendance_rules ADD COLUMN IF NOT EXISTS late_penalty_shift_id TEXT NULL;`,
    );
    await this.ensureLatePenaltySpecificitySchema();
  }

  /**
   * Paper att_attendance_rule ≡ specificity rows (dept+shift > dept > company > shift).
   * DENY Nest /core dual table invent.
   */
  async ensureLatePenaltySpecificitySchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.att_attendance_rule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        department_id TEXT NULL,
        shift_id TEXT NULL,
        mode TEXT NOT NULL,
        bands_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        late_penalty_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_att_attendance_rule_scope_active
      ON public.att_attendance_rule (
        company_id,
        COALESCE(department_id, ''),
        COALESCE(shift_id, '')
      )
      WHERE archived_at IS NULL;
    `);
  }

  async ensureWorkSitesSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.attendance_work_sites (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        radius_meters INTEGER NOT NULL DEFAULT 200,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      ALTER TABLE public.attendance_work_sites
      ADD COLUMN IF NOT EXISTS address TEXT NULL;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'attendance_work_sites'
            AND column_name = 'company_id'
            AND udt_name = 'uuid'
        ) THEN
          ALTER TABLE public.attendance_work_sites
            ALTER COLUMN company_id TYPE TEXT USING company_id::text;
        END IF;
      END $$;
    `);
    for (const [slug, uuid] of Object.entries(HRM_COMPANY_UUID_BY_SLUG)) {
      await this.db.query(
        `UPDATE public.attendance_work_sites SET company_id = $1 WHERE lower(company_id) = lower($2);`,
        [slug, uuid],
      );
    }
  }

  private parseBandsFromRow(raw: unknown): LatePenaltyBand[] {
    try {
      return parseLatePenaltyBands(raw ?? []);
    } catch {
      return [];
    }
  }

  private mapRules(
    row: AttendanceRulesRow,
    overlay?: {
      mode?: LatePenaltyMode | null;
      bands?: LatePenaltyBand[];
      latePenaltyEnabled?: boolean | null;
      departmentId?: string | null;
      shiftId?: string | null;
    },
  ) {
    const gpsRaw = row.gps_locations;
    let gps_locations: unknown[] = [];
    if (Array.isArray(gpsRaw)) {
      gps_locations = gpsRaw;
    } else if (gpsRaw && typeof gpsRaw === 'object') {
      gps_locations = [];
    }

    const mode =
      overlay?.mode !== undefined
        ? overlay.mode
        : normalizeLatePenaltyMode(row.late_penalty_mode);
    const bands =
      overlay?.bands !== undefined
        ? overlay.bands
        : this.parseBandsFromRow(row.late_penalty_bands);
    const latePenaltyEnabled =
      overlay?.latePenaltyEnabled !== undefined
        ? overlay.latePenaltyEnabled !== false
        : row.late_penalty_enabled !== false;
    const departmentId =
      overlay?.departmentId !== undefined
        ? overlay.departmentId
        : (row.late_penalty_department_id ?? null);
    const shiftId =
      overlay?.shiftId !== undefined
        ? overlay.shiftId
        : (row.late_penalty_shift_id ?? null);

    const notifyLate = row.notify_late !== false;
    const gpsEnabled = row.gps_enabled !== false;
    const wifiEnabled = row.wifi_enabled === true;
    const qrEnabled = row.qr_enabled === true;

    return {
      id: row.id,
      company_id: row.company_id,
      companyId: row.company_id,
      work_start_day: row.work_start_day,
      work_end_day: row.work_end_day,
      work_days: row.work_days,
      round_in_minutes: row.round_in_minutes,
      round_out_minutes: row.round_out_minutes,
      standard_type: row.standard_type,
      standard_days_per_month:
        row.standard_days_per_month != null
          ? Number(row.standard_days_per_month)
          : null,
      hours_per_day:
        row.hours_per_day != null ? Number(row.hours_per_day) : null,
      allow_multiple_checkin: row.allow_multiple_checkin,
      auto_checkout: row.auto_checkout,
      notify_late: notifyLate,
      notifyLate,
      gps_enabled: gpsEnabled,
      wifi_enabled: wifiEnabled,
      qr_enabled: qrEnabled,
      faceid_enabled: false,
      gps_locations,
      // Display-ready ATT-02 residual (API-01 §4.6)
      mode,
      modeLabelVi: modeLabelVi(mode),
      bands,
      scope: {
        companyId: row.company_id,
        departmentId,
        shiftId,
      },
      sourceFlags: {
        gpsEnabled,
        wifiEnabled,
        qrEnabled,
      },
      latePenaltyEnabled,
      latePenaltyHours: null as number | null,
      late_penalty_mode: mode,
      late_penalty_enabled: latePenaltyEnabled,
      late_penalty_bands: bands,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapWorkSite(row: WorkSiteRow) {
    return {
      id: row.id,
      company_id: row.company_id,
      name: row.name,
      address: row.address ?? '',
      latitude: row.latitude,
      longitude: row.longitude,
      radius: row.radius_meters,
      radius_meters: row.radius_meters,
      active: row.active,
      created_at: row.created_at,
    };
  }

  private resolveScopedCompanySlug(
    authorization: string | undefined,
    requestedCompanyId: string,
    tenantId?: string,
  ): string {
    return resolveHrmPersistCompanyIdText(authorization, requestedCompanyId, {
      tenantId,
    });
  }

  private async listSpecificityRows(
    companySlug: string,
  ): Promise<AttAttendanceRuleRow[]> {
    await this.ensureLatePenaltySpecificitySchema();
    const res = await this.db.query<AttAttendanceRuleRow>(
      `
        SELECT id, company_id, department_id, shift_id, mode, bands_json,
               late_penalty_enabled, archived_at, created_at, updated_at
        FROM public.att_attendance_rule
        WHERE company_id = $1 AND archived_at IS NULL
        ORDER BY updated_at DESC;
      `,
      [companySlug],
    );
    return res.rows;
  }

  private async resolveLatePenaltyOverlay(
    companySlug: string,
    companyRow: AttendanceRulesRow,
    opts?: { departmentId?: string | null; shiftId?: string | null },
  ) {
    const wantDept =
      opts?.departmentId !== undefined &&
      opts.departmentId !== null &&
      opts.departmentId !== ''
        ? String(opts.departmentId)
        : null;
    const wantShift =
      opts?.shiftId !== undefined &&
      opts.shiftId !== null &&
      opts.shiftId !== ''
        ? String(opts.shiftId)
        : null;

    const specificity = await this.listSpecificityRows(companySlug);
    const hit = pickBestSpecificityRule(specificity, {
      departmentId: wantDept,
      shiftId: wantShift,
    });

    if (hit) {
      return {
        mode: normalizeLatePenaltyMode(hit.mode),
        bands: this.parseBandsFromRow(hit.bands_json),
        latePenaltyEnabled: hit.late_penalty_enabled !== false,
        departmentId: hit.department_id,
        shiftId: hit.shift_id,
      };
    }

    // Company soft cols on attendance_rules (default SoT when no specificity)
    return {
      mode: normalizeLatePenaltyMode(companyRow.late_penalty_mode),
      bands: this.parseBandsFromRow(companyRow.late_penalty_bands),
      latePenaltyEnabled: companyRow.late_penalty_enabled !== false,
      departmentId: wantDept ?? companyRow.late_penalty_department_id ?? null,
      shiftId: wantShift ?? companyRow.late_penalty_shift_id ?? null,
    };
  }

  /**
   * Load late-penalty CFG for evaluate path (aggregate funnel).
   * U19: same persist slug resolver family as get/patch rules.
   */
  async loadLatePenaltyConfig(
    companyId: string,
    authorization?: string,
    tenantId?: string,
    opts?: { departmentId?: string | null; shiftId?: string | null },
  ): Promise<{
    latePenaltyEnabled: boolean;
    mode: LatePenaltyMode | null;
    bands: LatePenaltyBand[];
    notifyLate: boolean;
  }> {
    const mapped = await this.getRules(
      companyId,
      authorization,
      tenantId,
      opts,
    );
    return {
      latePenaltyEnabled: mapped.latePenaltyEnabled !== false,
      mode: mapped.mode,
      bands: mapped.bands,
      notifyLate: mapped.notifyLate !== false,
    };
  }

  /** Pure evaluate re-export seam for sheet aggregate (≠ PAY / ≠ ATT-10 DONE). */
  evaluateLatePenaltyHours = evaluateLatePenaltyHours;

  async getRules(
    companyId: string,
    authorization?: string,
    tenantId?: string,
    opts?: { departmentId?: string | null; shiftId?: string | null },
  ) {
    await this.ensureRulesSchema();
    const slug = this.resolveScopedCompanySlug(
      authorization,
      companyId,
      tenantId,
    );
    const existing = await this.db.query<AttendanceRulesRow>(
      `SELECT * FROM public.attendance_rules WHERE company_id = $1 LIMIT 1;`,
      [slug],
    );
    let row = existing.rows[0];
    if (!row) {
      const id = randomUUID();
      const inserted = await this.db.query<AttendanceRulesRow>(
        `
          INSERT INTO public.attendance_rules (
            id, company_id, work_start_day, work_end_day, work_days,
            round_in_minutes, round_out_minutes, standard_type, standard_days_per_month, hours_per_day,
            allow_multiple_checkin, auto_checkout, notify_late,
            gps_enabled, wifi_enabled, qr_enabled, faceid_enabled, gps_locations
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18::jsonb
          )
          ON CONFLICT (company_id) DO UPDATE SET updated_at = NOW()
          RETURNING *;
        `,
        [
          id,
          slug,
          DEFAULT_RULES_VALUES.work_start_day,
          DEFAULT_RULES_VALUES.work_end_day,
          DEFAULT_RULES_VALUES.work_days,
          DEFAULT_RULES_VALUES.round_in_minutes,
          DEFAULT_RULES_VALUES.round_out_minutes,
          DEFAULT_RULES_VALUES.standard_type,
          DEFAULT_RULES_VALUES.standard_days_per_month,
          DEFAULT_RULES_VALUES.hours_per_day,
          DEFAULT_RULES_VALUES.allow_multiple_checkin,
          DEFAULT_RULES_VALUES.auto_checkout,
          DEFAULT_RULES_VALUES.notify_late,
          DEFAULT_RULES_VALUES.gps_enabled,
          DEFAULT_RULES_VALUES.wifi_enabled,
          DEFAULT_RULES_VALUES.qr_enabled,
          false,
          JSON.stringify(DEFAULT_RULES_VALUES.gps_locations),
        ],
      );
      row = inserted.rows[0];
      if (!row) {
        const refetch = await this.db.query<AttendanceRulesRow>(
          `SELECT * FROM public.attendance_rules WHERE company_id = $1 LIMIT 1;`,
          [slug],
        );
        if (!refetch.rows[0]) {
          throw new ApiException(
            'HRM-ATT-RULES-001',
            'Unable to load attendance rules',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        row = refetch.rows[0];
      }
    }

    const overlay = await this.resolveLatePenaltyOverlay(slug, row, opts);
    return this.mapRules(row, overlay);
  }

  private resolveScopeKeysFromPayload(payload: UpdateAttendanceRulesDto): {
    departmentId: string | null;
    shiftId: string | null;
    hasScopeKeys: boolean;
  } {
    const hasDept =
      payload.departmentId !== undefined || payload.department_id !== undefined;
    const hasShift =
      payload.shiftId !== undefined || payload.shift_id !== undefined;
    const departmentId = hasDept
      ? (payload.departmentId ?? payload.department_id ?? null)
      : null;
    const shiftId = hasShift
      ? (payload.shiftId ?? payload.shift_id ?? null)
      : null;
    const deptVal =
      departmentId != null && String(departmentId).trim() !== ''
        ? String(departmentId).trim()
        : null;
    const shiftVal =
      shiftId != null && String(shiftId).trim() !== ''
        ? String(shiftId).trim()
        : null;
    return {
      departmentId: deptVal,
      shiftId: shiftVal,
      hasScopeKeys:
        hasDept || hasShift || Boolean(deptVal) || Boolean(shiftVal),
    };
  }

  private applyResidualValidation(payload: UpdateAttendanceRulesDto): {
    mode?: LatePenaltyMode;
    bands?: LatePenaltyBand[];
    latePenaltyEnabled?: boolean;
  } {
    const mode = assertXorLatePenaltyMode({
      mode: payload.mode,
      modes: payload.modes,
      modeMinute: payload.modeMinute,
      modeBlock: payload.modeBlock,
      modeTier: payload.modeTier,
      modeBand: payload.modeBand,
    });

    let bands: LatePenaltyBand[] | undefined;
    if (payload.bands !== undefined) {
      bands = parseLatePenaltyBands(payload.bands);
      assertBandsNoOverlap(bands);
    }

    const latePenaltyEnabled =
      payload.latePenaltyEnabled !== undefined
        ? payload.latePenaltyEnabled
        : payload.late_penalty_enabled !== undefined
          ? payload.late_penalty_enabled
          : undefined;

    return {
      mode: mode === undefined ? undefined : mode,
      bands,
      latePenaltyEnabled,
    };
  }

  async patchRules(
    companyId: string,
    payload: UpdateAttendanceRulesDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureRulesSchema();
    const current = await this.getRules(companyId, authorization, tenantId);
    const slug = current.company_id;
    const residual = this.applyResidualValidation(payload);
    const scopeKeys = this.resolveScopeKeysFromPayload(payload);

    // Specificity upsert when dept/shift keys present (R-ATT-02-SCOPE)
    if (
      scopeKeys.hasScopeKeys &&
      (residual.mode !== undefined ||
        residual.bands !== undefined ||
        residual.latePenaltyEnabled !== undefined)
    ) {
      const modeToPersist =
        residual.mode ?? normalizeLatePenaltyMode(current.mode) ?? 'minute';
      if (!modeToPersist) {
        throw new ApiException(
          'HRM-VAL-400',
          'mode required when saving late-penalty specificity',
          HttpStatus.BAD_REQUEST,
        );
      }
      const bandsToPersist = residual.bands ?? current.bands ?? [];
      assertBandsNoOverlap(bandsToPersist);
      const enabled =
        residual.latePenaltyEnabled !== undefined
          ? residual.latePenaltyEnabled
          : current.latePenaltyEnabled !== false;

      const existingSpec = await this.db.query<{ id: string }>(
        `
          SELECT id::text AS id FROM public.att_attendance_rule
          WHERE company_id = $1
            AND archived_at IS NULL
            AND COALESCE(department_id, '') = COALESCE($2, '')
            AND COALESCE(shift_id, '') = COALESCE($3, '')
          LIMIT 1;
        `,
        [slug, scopeKeys.departmentId, scopeKeys.shiftId],
      );
      if (existingSpec.rows[0]?.id) {
        await this.db.query(
          `
            UPDATE public.att_attendance_rule
            SET mode = $2,
                bands_json = $3::jsonb,
                late_penalty_enabled = $4,
                updated_at = NOW()
            WHERE id = $1::uuid;
          `,
          [
            existingSpec.rows[0].id,
            modeToPersist,
            JSON.stringify(bandsToPersist),
            enabled,
          ],
        );
      } else {
        await this.db.query(
          `
            INSERT INTO public.att_attendance_rule (
              id, company_id, department_id, shift_id, mode, bands_json, late_penalty_enabled
            ) VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, $7);
          `,
          [
            randomUUID(),
            slug,
            scopeKeys.departmentId,
            scopeKeys.shiftId,
            modeToPersist,
            JSON.stringify(bandsToPersist),
            enabled,
          ],
        );
      }

      // Still allow peer CFG fields on company row in same request
    }

    const sets: string[] = [];
    const values: unknown[] = [];

    const assign = (column: string, value: unknown) => {
      values.push(value);
      sets.push(`${column} = $${values.length}`);
    };

    if (payload.work_start_day !== undefined)
      assign('work_start_day', payload.work_start_day);
    if (payload.work_end_day !== undefined)
      assign('work_end_day', payload.work_end_day);
    if (payload.work_days !== undefined) assign('work_days', payload.work_days);
    if (payload.round_in_minutes !== undefined)
      assign('round_in_minutes', payload.round_in_minutes);
    if (payload.round_out_minutes !== undefined)
      assign('round_out_minutes', payload.round_out_minutes);
    if (payload.standard_type !== undefined)
      assign('standard_type', payload.standard_type);
    if (payload.standard_days_per_month !== undefined) {
      assign('standard_days_per_month', payload.standard_days_per_month);
    }
    if (payload.hours_per_day !== undefined)
      assign('hours_per_day', payload.hours_per_day);
    if (payload.allow_multiple_checkin !== undefined) {
      assign('allow_multiple_checkin', payload.allow_multiple_checkin);
    }
    if (payload.auto_checkout !== undefined)
      assign('auto_checkout', payload.auto_checkout);

    const notifyLate =
      payload.notifyLate !== undefined
        ? payload.notifyLate
        : payload.notify_late !== undefined
          ? payload.notify_late
          : undefined;
    if (notifyLate !== undefined) assign('notify_late', notifyLate);

    const gpsEnabled =
      payload.gpsEnabled !== undefined
        ? payload.gpsEnabled
        : payload.gps_enabled !== undefined
          ? payload.gps_enabled
          : undefined;
    const wifiEnabled =
      payload.wifiEnabled !== undefined
        ? payload.wifiEnabled
        : payload.wifi_enabled !== undefined
          ? payload.wifi_enabled
          : undefined;
    const qrEnabled =
      payload.qrEnabled !== undefined
        ? payload.qrEnabled
        : payload.qr_enabled !== undefined
          ? payload.qr_enabled
          : undefined;
    if (gpsEnabled !== undefined) assign('gps_enabled', gpsEnabled);
    if (wifiEnabled !== undefined) assign('wifi_enabled', wifiEnabled);
    if (qrEnabled !== undefined) assign('qr_enabled', qrEnabled);

    // Company-level soft cols when no specificity keys (or explicit company default write)
    if (!scopeKeys.hasScopeKeys) {
      if (residual.mode !== undefined)
        assign('late_penalty_mode', residual.mode);
      if (residual.bands !== undefined) {
        assign('late_penalty_bands', JSON.stringify(residual.bands));
      }
      if (residual.latePenaltyEnabled !== undefined) {
        assign('late_penalty_enabled', residual.latePenaltyEnabled);
      }
    } else if (
      !scopeKeys.departmentId &&
      !scopeKeys.shiftId &&
      (residual.mode !== undefined ||
        residual.bands !== undefined ||
        residual.latePenaltyEnabled !== undefined)
    ) {
      // Explicit null scope keys = company default soft cols + specificity company row
      if (residual.mode !== undefined)
        assign('late_penalty_mode', residual.mode);
      if (residual.bands !== undefined) {
        assign('late_penalty_bands', JSON.stringify(residual.bands));
      }
      if (residual.latePenaltyEnabled !== undefined) {
        assign('late_penalty_enabled', residual.latePenaltyEnabled);
      }
    }

    if (!sets.length && scopeKeys.hasScopeKeys) {
      return this.getRules(companyId, authorization, tenantId, {
        departmentId: scopeKeys.departmentId,
        shiftId: scopeKeys.shiftId,
      });
    }

    if (!sets.length) {
      return current;
    }
    assign('faceid_enabled', false);
    values.push(slug);
    const res = await this.db.query<AttendanceRulesRow>(
      `
        UPDATE public.attendance_rules
        SET ${sets.join(', ')}, updated_at = NOW()
        WHERE company_id = $${values.length}
        RETURNING *;
      `,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-ATT-RULES-404',
        'Attendance rules not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const overlay = await this.resolveLatePenaltyOverlay(slug, res.rows[0], {
      departmentId: scopeKeys.departmentId,
      shiftId: scopeKeys.shiftId,
    });
    return this.mapRules(res.rows[0], overlay);
  }

  /** Optional thin route same family — identical XOR/scope/off semantics (API-01). */
  async patchLatePenalty(
    companyId: string,
    payload: UpdateAttendanceRulesDto,
    authorization?: string,
    tenantId?: string,
  ) {
    return this.patchRules(companyId, payload, authorization, tenantId);
  }

  /** When no row yet, defaults match FE (gps_enabled true). */
  async isGpsGeofenceEnabled(
    authorization: string | undefined,
    requestedCompanyId: string,
    tenantId?: string,
  ): Promise<boolean> {
    await this.ensureRulesSchema();
    try {
      const slug = this.resolveScopedCompanySlug(
        authorization,
        requestedCompanyId,
        tenantId,
      );
      const res = await this.db.query<{ gps_enabled: boolean | null }>(
        `SELECT gps_enabled FROM public.attendance_rules WHERE company_id = $1 LIMIT 1;`,
        [slug],
      );
      if (!res.rows[0]) {
        return DEFAULT_RULES_VALUES.gps_enabled;
      }
      return res.rows[0].gps_enabled !== false;
    } catch {
      return DEFAULT_RULES_VALUES.gps_enabled;
    }
  }

  /**
   * F-ATT-CAT-WS-01 — default exclude inactive (VAL-ATT-WS-CNS-03b).
   * Pass includeInactive=true for admin audit of soft-retired sites.
   */
  async listWorkSites(
    companyId: string,
    authorization?: string,
    tenantId?: string,
    opts?: { includeInactive?: boolean },
  ) {
    await this.ensureWorkSitesSchema();
    const scope = resolveHrmListScope(authorization, companyId, { tenantId });
    const companyKeys = expandHrmTextCompanyIds(
      scope,
      authorization,
      companyId,
    );
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    if (!opts?.includeInactive) {
      filters.push('active = TRUE');
    }
    const res = await this.db.query<WorkSiteRow>(
      `SELECT id, company_id, name, address, latitude, longitude, radius_meters, active, created_at
       FROM public.attendance_work_sites
       WHERE ${filters.join(' AND ')}
       ORDER BY created_at ASC;`,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((r) => this.mapWorkSite(r)),
    };
  }

  /** Active site count in same list/geofence scope (U19) — CNS-05 / ADR D3 empty skip. */
  async countActiveWorkSites(
    companyId: string,
    authorization?: string,
    tenantId?: string,
  ): Promise<number> {
    await this.ensureWorkSitesSchema();
    const scope = resolveHrmListScope(authorization, companyId, { tenantId });
    const companyKeys = expandHrmTextCompanyIds(
      scope,
      authorization,
      companyId,
    );
    const filters: string[] = ['active = TRUE'];
    const values: unknown[] = [];
    pushCompanyIdTextColumnFilter(filters, values, companyKeys);
    const res = await this.db.query<{ c: string | number }>(
      `SELECT COUNT(*)::int AS c FROM public.attendance_work_sites WHERE ${filters.join(' AND ')};`,
      values,
    );
    return Number(res.rows[0]?.c ?? 0);
  }

  private resolveRadiusMeters(payload: {
    radius?: number;
    radius_meters?: number;
  }): number {
    const raw = payload.radius_meters ?? payload.radius ?? 200;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) {
      throw new ApiException(
        'HRM-ATT-SITE-VAL',
        'radius_meters must be a positive number',
        HttpStatus.BAD_REQUEST,
      );
    }
    return Math.floor(n);
  }

  async createWorkSite(
    payload: CreateWorkSiteDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureWorkSitesSchema();
    const companyId = this.resolveScopedCompanySlug(
      authorization,
      payload.company_id,
      tenantId,
    );
    const radius = this.resolveRadiusMeters(payload);
    const res = await this.db.query<WorkSiteRow>(
      `
        INSERT INTO public.attendance_work_sites (
          id, company_id, name, address, latitude, longitude, radius_meters, active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, company_id, name, address, latitude, longitude, radius_meters, active, created_at;
      `,
      [
        randomUUID(),
        companyId,
        payload.name.trim(),
        payload.address?.trim() ?? null,
        payload.latitude,
        payload.longitude,
        radius,
        payload.active ?? true,
      ],
    );
    return this.mapWorkSite(res.rows[0]);
  }

  async updateWorkSite(
    siteId: string,
    companyId: string,
    payload: UpdateWorkSiteDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureWorkSitesSchema();
    const scope = resolveHrmListScope(authorization, companyId, { tenantId });
    const existing = await this.db.query<WorkSiteRow>(
      `SELECT id, company_id, name, address, latitude, longitude, radius_meters, active, created_at
       FROM public.attendance_work_sites WHERE id = $1::uuid LIMIT 1;`,
      [siteId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ATT-SITE-404',
        'Work site not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-ATT-SITE-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    const sets: string[] = [];
    const values: unknown[] = [];
    const assign = (column: string, value: unknown) => {
      values.push(value);
      sets.push(`${column} = $${values.length}`);
    };
    if (payload.name !== undefined) assign('name', payload.name.trim());
    if (payload.address !== undefined)
      assign('address', payload.address.trim() || null);
    if (payload.latitude !== undefined) assign('latitude', payload.latitude);
    if (payload.longitude !== undefined) assign('longitude', payload.longitude);
    if (payload.radius_meters !== undefined || payload.radius !== undefined) {
      assign('radius_meters', this.resolveRadiusMeters(payload));
    }
    if (payload.active !== undefined) assign('active', payload.active);

    if (!sets.length) {
      return this.mapWorkSite(row);
    }
    values.push(siteId);
    const res = await this.db.query<WorkSiteRow>(
      `
        UPDATE public.attendance_work_sites
        SET ${sets.join(', ')}
        WHERE id = $${values.length}::uuid
        RETURNING id, company_id, name, address, latitude, longitude, radius_meters, active, created_at;
      `,
      values,
    );
    return this.mapWorkSite(res.rows[0]);
  }

  /**
   * Product retire = soft active=false (VAL-ATT-WS-CNS-04 · BR-PLT-04).
   * Hard DELETE only when hard=true (residual admin cleanup — not sole SoT retire).
   */
  async deleteWorkSite(
    siteId: string,
    companyId: string,
    authorization?: string,
    tenantId?: string,
    opts?: { hard?: boolean },
  ) {
    await this.ensureWorkSitesSchema();
    const scope = resolveHrmListScope(authorization, companyId, { tenantId });
    const existing = await this.db.query<WorkSiteRow>(
      `SELECT id, company_id, name, address, latitude, longitude, radius_meters, active, created_at
       FROM public.attendance_work_sites WHERE id = $1::uuid LIMIT 1;`,
      [siteId],
    );
    const row = existing.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-ATT-SITE-404',
        'Work site not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-ATT-SITE-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    if (opts?.hard) {
      await this.db.query(
        `DELETE FROM public.attendance_work_sites WHERE id = $1::uuid;`,
        [siteId],
      );
      return { id: siteId, retired: false, hard_deleted: true };
    }

    if (row.active === false) {
      return { ...this.mapWorkSite(row), retired: true, hard_deleted: false };
    }

    const res = await this.db.query<WorkSiteRow>(
      `
        UPDATE public.attendance_work_sites
        SET active = FALSE
        WHERE id = $1::uuid
        RETURNING id, company_id, name, address, latitude, longitude, radius_meters, active, created_at;
      `,
      [siteId],
    );
    return {
      ...this.mapWorkSite(res.rows[0]),
      retired: true,
      hard_deleted: false,
    };
  }
}
