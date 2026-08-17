/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ NV → Quá trình công tác / Work Timeline
 * UC:         UC-HRM-21 · FR-HRM-MD-BIND-E1A-01 · FR-HRM-SC-POS-01
 * BR:         BR-HRM-MD-01 · BR-HRM-MD-E1A-01/03 · AC-HRM-PICKER-01
 * SRS:        docs/program/deltas/BA_ERP_E1A_SRS_01_20260728.md · docs/hrm/SRS.md §16.4
 * TechSpec:   docs/hrm/TECHSPEC.md §11.4 / §14
 * DB_DESIGN:  docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md §3 (employee_work_timeline.position_key)
 * API_DESIGN: docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md WH-C/U · HRM-WH-POS-KEY
 * Purpose:    Profile tabs CRUD; E1-A bind Vị trí = catalog code (position_key), không free-text SoT.
 * WorkItem:   D-BE-ERP-E1A-POS-KEY-01
 * Coded:      2026-07-28
 * Callers:    employees.controller.ts work-timeline
 * Callees:    SettingsCatalogsService.assertCodeInEffectiveCatalog · employee_work_timeline
 * must_keep:  employees.job_title_key path riêng; scope_parity list/get; U65 no seed
 * SOLID:      Service owns schema + catalog soft assert
 * LastVerified: be-erp-e1a-pos-key-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E1A-POS-KEY-01
 * change_mode: ADD
 * What: ensureSchema ADD position_key/department_key; create/update assert job_titles; allowlist keys
 * Why: Layer A MD-BIND — cấm invent position TEXT làm SoT
 * must_keep: job_title_key trên employees; Leave; JD position_code; decision_type
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-BE-01
 * change_mode: ADD
 * What: WH ADD decision_id/source_module/archived_at + UQ; F-CORE-WH-02 HRM-WH-PICK-REQUIRED; soft-archive delete; list display decision_code
 * Why: EMP E2E QSĐ→WH · AC-WH-PICK · AC-DEC-WH-02..04 · soft FK no CASCADE
 * spec_ref: PO-HRM-E2E-LINK-EMP-SA-01 F-CORE-WH-01/02 · DB-01 CONFIRMED
 * must_keep: ONE SoT employee_work_timeline; no dual hrm_employment_history; catalog position_key
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01
 * change_mode: UPGRADE
 * What: RD rewards/discipline mutate SoT moved to EmployeeRewardDisciplineService (link+enforce)
 * Why: F-CORE-RD-01 residual — profile retains table CREATE baseline only; controller uses RD service
 * must_keep: dual tables; no Nest /core; note-CRUD ≠ FR-08 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-01
 * change_mode: ADD
 * What: employee_assets ADD handover_confirmed_*; updateAsset allowlist+BB confirm; serial 409;
 *       soft-delete prefer (DENY hard DELETE issued); display-ready statusLabelVi + handoverDocId
 * Why: F-CORE-AST-01 RETAIN · F-CORE-AST-BB-01 ADD · R-CORE-05-HANDOVER/SERIAL · UC-BP-CORE-05
 * spec_ref: API-01 CONFIRMED · DATA-01 §4 · BA-01 O1–O12 · paper /core alias only
 * must_keep: spine cols HOLD; Nest /core DENY; F-CORE-AST-02 OUT invent DONE; CORE-03 DOC/ET/CHK;
 *            CORE-02b EMP-CF; CORE-09d..01; U19 list=get=mutate; no Asset ledger; no seed; honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-02
 * change_mode: FIX
 * What: normalizeAssetWritePayload coerce '' / whitespace DATE (assigned_date|return_date) → null
 * Why: R-CORE-05-EMPTY-DATE-500 — FE blank assignedDate/returnDate → PG invalid date "" → 500
 * spec_ref: F-CORE-AST-01 · API-01 · QA stamp CORE05QA-MSLGFOXU
 * must_keep: serial 409 · BB confirm · DELETE-FORBIDDEN · Nest /core DENY · U19 · no CORE-06/07 invent · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02
 * change_mode: FIX
 * What: EmployeeProfileListQueryDto optional status + soft termination_context_id;
 *       listAssets SQL filter when status provided (assigned-only checklist feed)
 * Why: R-CORE-06-STATUS-QUERY-400 — GET …/assets?status=assigned → 400 HRM-VAL-001
 * spec_ref: API-01 R-CORE-06-TERM-CHK-01 · UC-BP-CORE-06 · QA CORE06QA1-MSLHUNCJ
 * must_keep: CORE-05 BB/serial/DELETE-FORBIDDEN · Nest /core DENY · no hrm_termination invent ·
 *            no Nest /core AST/TERM · DENY invent CORE-06/07/PAY DONE · honesty false · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-BE-HRM-WH-POSITION-KEY-01
 * change_mode: ADD (evidence/trace only — logic from E1-A/F-CORE-WH-02 RETAIN)
 * What: AC-SET-CONSUMER-JT-WH-01 trace — POST/PATCH work-timeline persist position_key + assert job_titles EFF
 * Why: UF-HRM-10 · SRS §16.8 O4 · GAP-WH-POS-01..02 closure on BE leg before FE CatalogSearchPicker
 * spec_ref: PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md §6.2 · API_DESIGN_HRM_MD_BIND_E1A.md WH-C/U
 * must_keep: HRM_WH_PICK_REQUIRED ≡ invent class; settings_catalog_e2e_ready=false; dept/REC-CH sealed slices
 * LastVerified: po-hrm-settings-consumer-jt-wh-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-BE-HRM-WH-POSITION-CATALOG-SCOPE-01
 * change_mode: FIX
 * What: assertWhPositionKey/DepartmentKey use resolveHrmSettingsCatalogCompanyId (main→holding) parity settings GET items
 * Why: QA WHPOS1-MSNL05LB — picker lists ceo/CHRO at main but POST assert used raw employee.company_id partition
 * spec_ref: API_DESIGN_HRM_MD_BIND_E1A.md WH-C · AC-SET-CONSUMER-JT-WH-01
 * must_keep: persist company_id on WH row unchanged; catalog assert only
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  MASTER_TENANT_ID,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { EmployeeProfileListQueryDto } from './dto/employee-profile-list.query.dto';
import { EmployeesService } from './employees.service';

type ProfileRow = Record<string, unknown> & { id: string };

/** VAL-MDBIND / F-CORE-WH-02 — work timeline position catalog soft-ref. */
export const HRM_WH_PICK_REQUIRED = 'HRM-WH-PICK-REQUIRED';
export const HRM_WH_PICK_EMPTY_CATALOG = 'HRM-WH-PICK-EMPTY-CATALOG';
/** @deprecated alias — prefer HRM_WH_PICK_REQUIRED (EMP-BE-01) */
export const HRM_WH_POS_KEY = HRM_WH_PICK_REQUIRED;
export const HRM_WH_DEPT_KEY = 'HRM-WH-DEPT-KEY';

/** F-CORE-AST-01 / R-CORE-05-CAT-SERIAL-01 — duplicate assigned serial in scope. */
export const HRM_EMP_ASSET_SERIAL_CONFLICT = 'HRM-EMP-ASSET-SERIAL-CONFLICT';
/** F-CORE-AST-01 O7 — hard DELETE issued without BA waiver. */
export const HRM_EMP_ASSET_DELETE_FORBIDDEN = 'HRM-EMP-ASSET-DELETE-FORBIDDEN';
/** BA waiver header/query value unlocking hard DELETE of issued asset rows. */
export const HRM_EMP_ASSET_DELETE_WAIVER = 'HRM-EMP-ASSET-DELETE';

const ASSET_SPINE_FIELDS = [
  'asset_code',
  'asset_name',
  'category',
  'serial_number',
  'assigned_date',
  'return_date',
  'status',
  'condition',
  'notes',
  'brand',
  'model',
  'specifications',
  'value',
] as const;

const ASSET_BB_FIELDS = [
  'handover_confirmed_at',
  'handover_confirmed_by',
  'handover_receiver_name',
] as const;

const ASSET_WRITE_FIELDS = [...ASSET_SPINE_FIELDS, ...ASSET_BB_FIELDS] as const;

const ASSET_STATUS_LABEL_VI: Record<string, string> = {
  assigned: 'Đang sử dụng',
  returned: 'Đã thu hồi',
  maintenance: 'Bảo trì',
  lost: 'Mất/ghi nợ',
};

@Injectable()
export class EmployeeProfileService {
  constructor(
    private readonly db: HrmDbService,
    private readonly employees: EmployeesService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_employee_degrees (
        id UUID PRIMARY KEY,
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        degree_type TEXT,
        institution TEXT,
        field_of_study TEXT,
        graduation_year INT,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_trainings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'internal',
        category TEXT NOT NULL DEFAULT 'other',
        provider TEXT,
        instructor TEXT,
        start_date DATE,
        end_date DATE,
        duration INTEGER NOT NULL DEFAULT 0,
        duration_unit TEXT NOT NULL DEFAULT 'hours',
        location TEXT,
        status TEXT NOT NULL DEFAULT 'planned',
        progress INTEGER NOT NULL DEFAULT 0,
        score NUMERIC,
        certificate_number TEXT,
        certificate_file_url TEXT,
        cost NUMERIC NOT NULL DEFAULT 0,
        paid_by TEXT NOT NULL DEFAULT 'company',
        description TEXT,
        skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        asset_code TEXT,
        asset_name TEXT NOT NULL,
        category TEXT,
        serial_number TEXT,
        assigned_date DATE,
        return_date DATE,
        status TEXT NOT NULL DEFAULT 'assigned',
        condition TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS brand TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS model TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS specifications TEXT;
      ALTER TABLE public.employee_assets ADD COLUMN IF NOT EXISTS value NUMERIC NOT NULL DEFAULT 0;
    `);
    // PO-HRM-MVP-GD1-CORE-05 — F-CORE-AST-BB-01 soft confirm cols (DATA §4) · HOLD spine · HOLD unique index.
    await this.db.query(`
      ALTER TABLE public.employee_assets
        ADD COLUMN IF NOT EXISTS handover_confirmed_at TIMESTAMPTZ NULL;
      ALTER TABLE public.employee_assets
        ADD COLUMN IF NOT EXISTS handover_confirmed_by TEXT NULL;
      ALTER TABLE public.employee_assets
        ADD COLUMN IF NOT EXISTS handover_receiver_name TEXT NULL;
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'technical',
        name TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 50,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_work_timeline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        event_date DATE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        event_type TEXT NOT NULL DEFAULT 'position',
        status TEXT NOT NULL DEFAULT 'current',
        contract_code TEXT,
        department TEXT,
        position TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // E1-A MD-BIND — position_key SoT (≠ employees.job_title_key).
    await this.db.query(`
      ALTER TABLE public.employee_work_timeline
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_work_timeline
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_work_timeline_position_key
        ON public.employee_work_timeline (company_id, position_key)
        WHERE position_key IS NOT NULL;
    `);
    // PO-HRM-E2E-LINK-EMP-BE-01 — soft FK decision_id + source_module + soft archive (DB-01 CONFIRMED).
    await this.db.query(`
      ALTER TABLE public.employee_work_timeline
        ADD COLUMN IF NOT EXISTS decision_id UUID NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_work_timeline
        ADD COLUMN IF NOT EXISTS source_module TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_work_timeline
        ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_work_timeline_decision_id_active
        ON public.employee_work_timeline (decision_id)
        WHERE decision_id IS NOT NULL AND archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_work_timeline_employee_event_date
        ON public.employee_work_timeline (employee_id, event_date);
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_resume_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        file_type TEXT,
        file_url TEXT NOT NULL,
        file_size TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        reward_date DATE NOT NULL,
        reward_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_discipline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        discipline_date DATE NOT NULL,
        discipline_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        penalty_amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        effective_from DATE,
        effective_to DATE,
        status TEXT NOT NULL DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private async listScopedRows(
    fromSql: string,
    selectSql: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    const filters = ['employee_id = $1::uuid'];
    const values: unknown[] = [employeeId];
    pushCompanyIdFilter(filters, values, [employee.company_id]);
    const res = await this.db.query<ProfileRow>(
      `
        SELECT ${selectSql}
        FROM ${fromSql}
        WHERE ${filters.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT 500;
      `,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows,
    };
  }

  listDegrees(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows(
      'public.hrm_employee_degrees',
      'id, employee_id, company_id, payload, created_at, updated_at',
      employeeId,
      query,
      authorization,
    ).then((result) => ({
      ...result,
      data: result.data.map((row) => ({
        id: row.id,
        employee_id: employeeId,
        company_id: row.company_id,
        ...(typeof row.payload === 'object' && row.payload ? (row.payload as Record<string, unknown>) : {}),
        created_at: row.created_at,
        updated_at: row.updated_at,
      })),
      phase: 'P1-stub-read',
    }));
  }

  listTraining(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows(
      'public.employee_trainings',
      '*',
      employeeId,
      query,
      authorization,
    );
  }

  /**
   * F-CORE-AST-01 — list display-ready (statusLabelVi · BB confirm flags · handoverDocId).
   * R-CORE-06-TERM-CHK-01 — optional query.status filters SQL (e.g. assigned-only checklist).
   * Soft termination_context_id accepted on DTO only (HOLD invent TERM PK / join).
   */
  async listAssets(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    const filters = ['employee_id = $1::uuid'];
    const values: unknown[] = [employeeId];
    pushCompanyIdFilter(filters, values, [employee.company_id]);

    const statusRaw = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';
    if (statusRaw) {
      if (!ASSET_STATUS_LABEL_VI[statusRaw]) {
        throw new ApiException(
          'HRM-EMP-PROFILE-400',
          `Invalid asset status '${query.status}' (allowed: assigned|returned|maintenance|lost)`,
          HttpStatus.BAD_REQUEST,
        );
      }
      values.push(statusRaw);
      filters.push(`status = $${values.length}`);
    }

    const res = await this.db.query<ProfileRow>(
      `
        SELECT *
        FROM public.employee_assets
        WHERE ${filters.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT 500;
      `,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => this.mapAssetDisplayReady(row)),
    };
  }

  /** F-CORE-AST-01 POST — default assigned · confirm NULL · serial conflict gate. */
  async createAsset(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    // Fail-fast emp/scope before serial gate (U19 — no empty-mask).
    await this.employees.getEmployeeById(employeeId, query, authorization);
    const normalized = this.normalizeAssetWritePayload(payload, { forCreate: true });
    const assetName =
      typeof normalized.asset_name === 'string' ? normalized.asset_name.trim() : '';
    if (!assetName) {
      throw new ApiException(
        'HRM-EMP-PROFILE-400',
        'asset_name is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    normalized.asset_name = assetName;
    if (normalized.status === undefined || normalized.status === null || normalized.status === '') {
      normalized.status = 'assigned';
    }
    // Create never stamps BB confirm (Diễn biến #2 = PATCH).
    delete normalized.handover_confirmed_at;
    delete normalized.handover_confirmed_by;
    delete normalized.handover_receiver_name;

    const nextStatus = String(normalized.status ?? 'assigned');
    await this.assertAssetSerialAvailable({
      serial: normalized.serial_number,
      status: nextStatus,
      authorization,
      companyId: query.company_id,
      excludeAssetId: undefined,
    });

    const row = await this.insertProfileRow(
      'public.employee_assets',
      employeeId,
      query,
      authorization,
      normalized,
    );
    return this.mapAssetDisplayReady(row);
  }

  /**
   * F-CORE-AST-01 PATCH spine + F-CORE-AST-BB-01 confirm flags.
   * Allowlist ADD handover_confirmed_* · serial 409 · display-ready return.
   */
  async updateAsset(
    assetId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await this.employees.getEmployeeById(employeeId, query, authorization);
    const existing = await this.peekAssetRow(assetId, employeeId);
    this.guardProfileRowMutate(existing, authorization, query.company_id);
    if (!existing) {
      throw new ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', HttpStatus.NOT_FOUND);
    }

    const normalized = this.normalizeAssetWritePayload(payload, {
      forCreate: false,
      authorization,
    });
    if (Object.keys(normalized).length === 0) {
      throw new ApiException('HRM-EMP-PROFILE-400', 'No fields to update', HttpStatus.BAD_REQUEST);
    }

    const nextSerial =
      normalized.serial_number !== undefined
        ? normalized.serial_number
        : existing.serial_number;
    const nextStatus = String(
      normalized.status !== undefined ? normalized.status : existing.status ?? 'assigned',
    );
    await this.assertAssetSerialAvailable({
      serial: nextSerial,
      status: nextStatus,
      authorization,
      companyId: query.company_id,
      excludeAssetId: assetId,
    });

    const row = await this.updateProfileRow(
      'public.employee_assets',
      assetId,
      employeeId,
      query,
      authorization,
      normalized,
      [...ASSET_WRITE_FIELDS],
    );
    return this.mapAssetDisplayReady(row);
  }

  /**
   * Soft-prefer O7 — hard DELETE issued (assigned / confirm / disposition history)
   * FORBIDDEN without BA waiver (`x-ba-waiver: HRM-EMP-ASSET-DELETE`).
   * Prefer PATCH status → returned|lost|maintenance. F-CORE-AST-02 OUT invent DONE.
   */
  async deleteAsset(
    assetId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
    options?: { baWaiver?: boolean },
  ) {
    await this.ensureSchema();
    await this.employees.getEmployeeById(employeeId, query, authorization);
    const existing = await this.peekAssetRow(assetId, employeeId);
    this.guardProfileRowMutate(existing, authorization, query.company_id);
    if (!existing) {
      throw new ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', HttpStatus.NOT_FOUND);
    }

    const issued = this.isAssetIssued(existing);
    if (issued && !options?.baWaiver) {
      throw new ApiException(
        HRM_EMP_ASSET_DELETE_FORBIDDEN,
        'Hard DELETE of issued asset forbidden — prefer PATCH status to returned|lost|maintenance (CORE-06 history). BA waiver required.',
        HttpStatus.CONFLICT,
      );
    }

    return this.deleteProfileRow('public.employee_assets', assetId, employeeId, query, authorization);
  }

  private assetStatusLabelVi(status: unknown): string {
    const key = typeof status === 'string' ? status.trim().toLowerCase() : '';
    return ASSET_STATUS_LABEL_VI[key] ?? (key || '—');
  }

  /** Display-ready Profile Tài sản — FE MUST NOT invent Asset SoT. */
  private mapAssetDisplayReady(row: ProfileRow): ProfileRow {
    const confirmedAt = row.handover_confirmed_at ?? null;
    const confirmed = confirmedAt != null && String(confirmedAt).trim() !== '';
    const status = row.status ?? null;
    return {
      ...row,
      statusLabelVi: this.assetStatusLabelVi(status),
      status_label_vi: this.assetStatusLabelVi(status),
      handoverConfirmed: confirmed,
      handover_confirmed: confirmed,
      handoverConfirmedAt: confirmedAt,
      handoverConfirmedBy: row.handover_confirmed_by ?? null,
      handoverReceiverName: row.handover_receiver_name ?? null,
      handoverDocId: confirmed ? row.id : null,
      handover_doc_id: confirmed ? row.id : null,
    };
  }

  private resolveAssetActorId(authorization?: string): string | null {
    const payload = getVerifiedInternalJwtPayload(authorization);
    if (!payload) return null;
    for (const key of ['email', 'sub', 'userId', 'user_id', 'preferred_username'] as const) {
      const value = payload[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  }

  private normalizeAssetWritePayload(
    payload: Record<string, unknown>,
    opts: { forCreate: boolean; authorization?: string },
  ): Record<string, unknown> {
    const camelToSnake: Record<string, string> = {
      assetCode: 'asset_code',
      assetName: 'asset_name',
      serialNumber: 'serial_number',
      assignedDate: 'assigned_date',
      returnDate: 'return_date',
      handoverConfirmedAt: 'handover_confirmed_at',
      handoverConfirmedBy: 'handover_confirmed_by',
      handoverReceiverName: 'handover_receiver_name',
    };
    /** Optional DATE cols — FE blank '' must not reach PG `::date` (R-CORE-05-EMPTY-DATE-500). */
    const assetDateFields = new Set(['assigned_date', 'return_date']);
    const out: Record<string, unknown> = {};
    for (const [rawKey, value] of Object.entries(payload)) {
      if (value === undefined) continue;
      if (rawKey === 'handoverConfirmed' || rawKey === 'handover_confirmed') continue;
      const snake = camelToSnake[rawKey] ?? rawKey;
      if ((ASSET_WRITE_FIELDS as readonly string[]).includes(snake)) {
        if (assetDateFields.has(snake) && typeof value === 'string' && value.trim() === '') {
          out[snake] = null;
          continue;
        }
        out[snake] = typeof value === 'string' && snake === 'serial_number' ? value.trim() : value;
      }
    }

    // F-CORE-AST-BB-01 — bool confirm SET/CLEAR (not notes-only).
    const confirmFlag = payload.handoverConfirmed ?? payload.handover_confirmed;
    if (!opts.forCreate && confirmFlag === true) {
      if (out.handover_confirmed_at === undefined) {
        out.handover_confirmed_at = new Date().toISOString();
      }
      if (out.handover_confirmed_by === undefined || out.handover_confirmed_by === null) {
        out.handover_confirmed_by = this.resolveAssetActorId(opts.authorization) ?? 'system';
      }
    } else if (!opts.forCreate && confirmFlag === false) {
      out.handover_confirmed_at = null;
      out.handover_confirmed_by = null;
    }

    if (typeof out.status === 'string') {
      const st = out.status.trim().toLowerCase();
      if (st && !ASSET_STATUS_LABEL_VI[st] && st !== 'allocated') {
        throw new ApiException(
          'HRM-EMP-PROFILE-400',
          `Invalid asset status '${out.status}' (allowed: assigned|returned|maintenance|lost)`,
          HttpStatus.BAD_REQUEST,
        );
      }
      // Paper allocated → LIVE assigned (alias map only).
      out.status = st === 'allocated' ? 'assigned' : st;
    }

    return out;
  }

  private isAssetIssued(row: {
    status?: string | null;
    handover_confirmed_at?: unknown;
  }): boolean {
    const status = typeof row.status === 'string' ? row.status.trim().toLowerCase() : '';
    if (status === 'assigned' || status === 'returned' || status === 'maintenance' || status === 'lost') {
      return true;
    }
    const confirmedAt = row.handover_confirmed_at;
    return confirmedAt != null && String(confirmedAt).trim() !== '';
  }

  private async peekAssetRow(assetId: string, employeeId: string) {
    const peek = await this.db.query<{
      company_id: string;
      status: string | null;
      serial_number: string | null;
      handover_confirmed_at: string | null;
    }>(
      `
        SELECT company_id, status, serial_number, handover_confirmed_at
        FROM public.employee_assets
        WHERE id = $1::uuid AND employee_id = $2::uuid
        LIMIT 1;
      `,
      [assetId, employeeId],
    );
    return peek.rows[0];
  }

  /**
   * R-CORE-05-CAT-SERIAL-01 — non-empty serial already status=assigned in list scope → 409.
   * Unique index HOLD — service wire first. Empty serial allowed.
   */
  private async assertAssetSerialAvailable(args: {
    serial: unknown;
    status: string;
    authorization?: string;
    companyId: string;
    excludeAssetId?: string;
  }) {
    if (args.status !== 'assigned') return;
    const serial =
      typeof args.serial === 'string'
        ? args.serial.trim()
        : args.serial == null
          ? ''
          : String(args.serial).trim();
    if (!serial) return;

    const scope = resolveHrmListScope(args.authorization, args.companyId);
    const filters = [
      `TRIM(COALESCE(serial_number, '')) = $1`,
      `status = 'assigned'`,
    ];
    const values: unknown[] = [serial];
    if (args.excludeAssetId) {
      values.push(args.excludeAssetId);
      filters.push(`id <> $${values.length}::uuid`);
    }
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<{ id: string }>(
      `
        SELECT id
        FROM public.employee_assets
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_EMP_ASSET_SERIAL_CONFLICT,
        `serial_number '${serial}' already assigned in scope`,
        HttpStatus.CONFLICT,
      );
    }
  }

  listSkills(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_skills', '*', employeeId, query, authorization);
  }

  createSkill(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    const skillLevel = this.resolveSkillLevel(payload, 50);
    return this.insertProfileRow('public.employee_skills', employeeId, query, authorization, {
      category: payload.category ?? 'technical',
      name: payload.name,
      level: skillLevel,
      notes: payload.notes ?? null,
    });
  }

  updateSkill(skillId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    const normalizedPayload: Record<string, unknown> = { ...payload };
    const skillLevel = this.resolveSkillLevel(payload);
    if (skillLevel !== undefined) {
      normalizedPayload.level = skillLevel;
    }
    return this.updateProfileRow('public.employee_skills', skillId, employeeId, query, authorization, normalizedPayload, [
      'category',
      'name',
      'level',
      'notes',
    ]);
  }

  deleteSkill(skillId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_skills', skillId, employeeId, query, authorization);
  }

  listWorkTimeline(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listWorkTimelineScoped(employeeId, query, authorization);
  }

  /** F-CORE-WH-01 — display-ready WH + soft join decision_code; hide archived. */
  private async listWorkTimelineScoped(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    const filters = ['wt.employee_id = $1::uuid', 'wt.archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    pushCompanyIdFilter(filters, values, [employee.company_id]);
    // Rewrite company filter alias for join table.
    const whereSql = filters
      .map((f) => f.replace(/^company_id /, 'wt.company_id '))
      .join(' AND ');
    const res = await this.db.query<ProfileRow>(
      `
        SELECT wt.*,
               d.decision_code AS decision_code,
               d.title AS decision_title
        FROM public.employee_work_timeline wt
        LEFT JOIN public.hr_decisions d ON d.id = wt.decision_id
        WHERE ${whereSql}
        ORDER BY wt.event_date DESC NULLS LAST, wt.updated_at DESC
        LIMIT 500;
      `,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows,
    };
  }

  private resolveCatalogTenantId(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  /**
   * FR-HRM-SC-POS-01 #5/#6 · BR-HRM-MD-01 · F-CORE-WH-02 — position_key ∈ job_titles.
   * Returns catalog label for snapshot denorm when client omits `position`.
   */
  /**
   * Settings picker partition (main / member OU → holding on group tenant) — parity settings-catalogs controller.
   */
  private resolveWhCatalogCompanyId(persistCompanyId: string, authorization?: string): string {
    const tenantId = this.resolveCatalogTenantId();
    return resolveHrmSettingsCatalogCompanyId(authorization, tenantId, persistCompanyId);
  }

  private async assertWhPositionKey(
    companyId: string,
    positionKey: unknown,
    authorization?: string,
  ): Promise<{ code: string; label: string }> {
    const code = typeof positionKey === 'string' ? positionKey.trim() : '';
    if (!code) {
      throw new ApiException(
        HRM_WH_PICK_REQUIRED,
        'position_key is required (catalog SoT; free-text position alone forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) {
      return { code, label: code };
    }
    const tenantId = this.resolveCatalogTenantId();
    const catalogCompanyId = this.resolveWhCatalogCompanyId(companyId, authorization);
    try {
      const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId,
        companyId: catalogCompanyId,
        catalogKey: 'job_titles',
        code,
        errorCode: HRM_WH_PICK_REQUIRED,
        errorMessage: `position_key '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
      });
      return { code: hit.code, label: hit.label };
    } catch (err: unknown) {
      if (err instanceof ApiException) {
        const body = err.getResponse() as { message?: string };
        const msg = typeof body?.message === 'string' ? body.message : '';
        if (msg.includes('no active items')) {
          throw new ApiException(
            HRM_WH_PICK_EMPTY_CATALOG,
            'job_titles catalog is empty — configure Settings before free-text fallback (forbidden)',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      throw err;
    }
  }

  private async assertWhDepartmentKey(
    companyId: string,
    departmentKey: unknown,
    authorization?: string,
  ): Promise<string | null> {
    if (departmentKey === undefined || departmentKey === null) return null;
    const code = typeof departmentKey === 'string' ? departmentKey.trim() : '';
    if (!code) {
      throw new ApiException(
        HRM_WH_DEPT_KEY,
        'department_key cannot be empty when provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return code;
    const tenantId = this.resolveCatalogTenantId();
    const catalogCompanyId = this.resolveWhCatalogCompanyId(companyId, authorization);
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId,
      companyId: catalogCompanyId,
      catalogKey: 'departments',
      code,
      errorCode: HRM_WH_DEPT_KEY,
      errorMessage: `department_key '${code}' is not in departments catalog`,
    });
    return hit.code;
  }

  private async assertOptionalDecisionId(
    companyId: string,
    employeeId: string,
    decisionId: unknown,
    authorization?: string,
  ): Promise<string | null> {
    if (decisionId === undefined || decisionId === null || decisionId === '') return null;
    const id = typeof decisionId === 'string' ? decisionId.trim() : '';
    if (!id) return null;
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid', 'employee_id = $2::uuid'];
    const values: unknown[] = [id, employeeId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<{ id: string }>(
      `SELECT id FROM public.hr_decisions WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-WH-DEC-404',
        'decision_id not found in scope for this employee',
        HttpStatus.BAD_REQUEST,
      );
    }
    return id;
  }

  async createWorkTimelineItem(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    // F-CORE-WH-02 — reject free-text-only SoT (position without position_key).
    const hasPositionKey = Object.prototype.hasOwnProperty.call(payload, 'position_key');
    const hasPositionText = Object.prototype.hasOwnProperty.call(payload, 'position');
    if (hasPositionText && !hasPositionKey) {
      throw new ApiException(
        HRM_WH_PICK_REQUIRED,
        'position_key is required (catalog SoT; free-text position alone forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const pos = await this.assertWhPositionKey(employee.company_id, payload.position_key, authorization);
    const departmentKey = await this.assertWhDepartmentKey(
      employee.company_id,
      payload.department_key,
      authorization,
    );
    const decisionId = await this.assertOptionalDecisionId(
      employee.company_id,
      employeeId,
      payload.decision_id,
      authorization,
    );
    const positionSnapshot =
      typeof payload.position === 'string' && payload.position.trim()
        ? payload.position.trim()
        : pos.label;
    const normalized: Record<string, unknown> = {
      ...payload,
      position_key: pos.code,
      position: positionSnapshot,
      source_module:
        typeof payload.source_module === 'string' && payload.source_module.trim()
          ? payload.source_module.trim()
          : 'manual',
    };
    if (departmentKey != null) {
      normalized.department_key = departmentKey;
    }
    if (decisionId != null) {
      normalized.decision_id = decisionId;
    } else {
      delete normalized.decision_id;
    }
    return this.insertProfileRow('public.employee_work_timeline', employeeId, query, authorization, normalized);
  }

  async updateWorkTimelineItem(
    itemId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    const normalized: Record<string, unknown> = { ...payload };
    const hasPositionKey = Object.prototype.hasOwnProperty.call(payload, 'position_key');
    const hasPositionText = Object.prototype.hasOwnProperty.call(payload, 'position');
    if (hasPositionText && !hasPositionKey) {
      throw new ApiException(
        HRM_WH_PICK_REQUIRED,
        'position_key is required when updating position (invent-only free-text forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (hasPositionKey) {
      const pos = await this.assertWhPositionKey(employee.company_id, payload.position_key, authorization);
      normalized.position_key = pos.code;
      if (
        payload.position === undefined ||
        (typeof payload.position === 'string' && !payload.position.trim())
      ) {
        normalized.position = pos.label;
      }
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'department_key')) {
      const departmentKey = await this.assertWhDepartmentKey(
        employee.company_id,
        payload.department_key,
        authorization,
      );
      normalized.department_key = departmentKey;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'decision_id')) {
      const decisionId = await this.assertOptionalDecisionId(
        employee.company_id,
        employeeId,
        payload.decision_id,
        authorization,
      );
      normalized.decision_id = decisionId;
    }
    return this.updateProfileRow('public.employee_work_timeline', itemId, employeeId, query, authorization, normalized, [
      'event_date',
      'title',
      'description',
      'event_type',
      'status',
      'contract_code',
      'department',
      'department_key',
      'position',
      'position_key',
      'notes',
      'decision_id',
      'source_module',
    ]);
  }

  async deleteWorkTimelineItem(
    itemId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    // AC-DEC-WH-04 / DB-01 — soft archive; cấm hard-delete WH history used in reports.
    await this.ensureSchema();
    await this.employees.getEmployeeById(employeeId, query, authorization);
    this.guardProfileRowMutate(
      await this.peekProfileRow('public.employee_work_timeline', itemId, employeeId),
      authorization,
      query.company_id,
    );
    const res = await this.db.query<{ id: string }>(
      `
        UPDATE public.employee_work_timeline
        SET archived_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL
        RETURNING id;
      `,
      [itemId, employeeId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', HttpStatus.NOT_FOUND);
    }
    return { id: itemId, archived: true };
  }

  listResumeFiles(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_resume_files', '*', employeeId, query, authorization);
  }

  createResumeFile(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_resume_files', employeeId, query, authorization, payload);
  }

  deleteResumeFile(fileId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_resume_files', fileId, employeeId, query, authorization);
  }

  listRewards(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_rewards', '*', employeeId, query, authorization);
  }

  listDiscipline(employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.listScopedRows('public.employee_discipline', '*', employeeId, query, authorization);
  }

  createReward(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_rewards', employeeId, query, authorization, payload);
  }

  updateReward(rewardId: string, employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.updateProfileRow('public.employee_rewards', rewardId, employeeId, query, authorization, payload, [
      'reward_date',
      'reward_type',
      'title',
      'description',
      'decision_number',
      'amount',
      'issued_by',
      'status',
      'notes',
    ]);
  }

  deleteReward(rewardId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_rewards', rewardId, employeeId, query, authorization);
  }

  createDiscipline(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_discipline', employeeId, query, authorization, payload);
  }

  updateDiscipline(
    disciplineId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.updateProfileRow('public.employee_discipline', disciplineId, employeeId, query, authorization, payload, [
      'discipline_date',
      'discipline_type',
      'title',
      'description',
      'decision_number',
      'penalty_amount',
      'issued_by',
      'effective_from',
      'effective_to',
      'status',
      'notes',
    ]);
  }

  deleteDiscipline(disciplineId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_discipline', disciplineId, employeeId, query, authorization);
  }

  createTraining(employeeId: string, query: EmployeeProfileListQueryDto, payload: Record<string, unknown>, authorization?: string) {
    return this.insertProfileRow('public.employee_trainings', employeeId, query, authorization, payload);
  }

  updateTraining(
    trainingId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.updateProfileRow('public.employee_trainings', trainingId, employeeId, query, authorization, payload, [
      'name',
      'type',
      'category',
      'provider',
      'instructor',
      'start_date',
      'end_date',
      'duration',
      'duration_unit',
      'location',
      'status',
      'progress',
      'score',
      'certificate_number',
      'certificate_file_url',
      'cost',
      'paid_by',
      'description',
      'skills',
    ]);
  }

  deleteTraining(trainingId: string, employeeId: string, query: EmployeeProfileListQueryDto, authorization?: string) {
    return this.deleteProfileRow('public.employee_trainings', trainingId, employeeId, query, authorization);
  }

  private resolveSkillLevel(payload: Record<string, unknown>, fallback?: unknown) {
    const candidate = payload.level ?? payload.proficiency ?? fallback;
    if (candidate === undefined || candidate === null) {
      return undefined;
    }
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return Math.round(candidate);
    }
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim().toLowerCase();
      if (!trimmed) {
        return undefined;
      }
      if (/^\d+$/.test(trimmed)) {
        return Number(trimmed);
      }
      if (trimmed === 'advanced') return 90;
      if (trimmed === 'intermediate') return 70;
      if (trimmed === 'beginner') return 50;
      if (trimmed === 'expert') return 100;
      return undefined;
    }
    return undefined;
  }

  private async insertProfileRow(
    table: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization: string | undefined,
    payload: Record<string, unknown>,
  ) {
    await this.ensureSchema();
    const employee = await this.employees.getEmployeeById(employeeId, query, authorization);
    const id = randomUUID();
    const columns = ['id', 'employee_id', 'company_id'];
    const values: unknown[] = [id, employeeId, employee.company_id];
    const allowed = Object.keys(payload).filter((k) => payload[k] !== undefined);
    for (const key of allowed) {
      columns.push(key);
      values.push(key === 'skills' ? JSON.stringify(payload[key] ?? []) : payload[key]);
    }
    const placeholders = values.map((_, i) => {
      if (columns[i] === 'skills') return `$${i + 1}::jsonb`;
      if (columns[i]?.includes('date') && columns[i] !== 'updated_at') return `$${i + 1}::date`;
      return `$${i + 1}`;
    });
    const res = await this.db.query<ProfileRow>(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *;`,
      values,
    );
    return res.rows[0];
  }

  private guardProfileRowMutate(
    row: { company_id?: string | null } | null | undefined,
    authorization: string | undefined,
    companyId: string,
  ) {
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-EMP-PROFILE-404',
      mismatchCode: 'HRM-EMP-PROFILE-409',
    });
  }

  private async peekProfileRow(table: string, rowId: string, employeeId: string) {
    const peek = await this.db.query<{ company_id: string }>(
      `SELECT company_id FROM ${table} WHERE id = $1::uuid AND employee_id = $2::uuid LIMIT 1;`,
      [rowId, employeeId],
    );
    return peek.rows[0];
  }

  private async updateProfileRow(
    table: string,
    rowId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization: string | undefined,
    payload: Record<string, unknown>,
    fields: string[],
  ) {
    await this.ensureSchema();
    await this.employees.getEmployeeById(employeeId, query, authorization);
    this.guardProfileRowMutate(
      await this.peekProfileRow(table, rowId, employeeId),
      authorization,
      query.company_id,
    );
    const sets: string[] = [];
    const values: unknown[] = [rowId, employeeId];
    for (const field of fields) {
      if (payload[field] === undefined) continue;
      values.push(field === 'skills' ? JSON.stringify(payload[field]) : payload[field]);
      const cast = field.includes('date') ? '::date' : field === 'skills' ? '::jsonb' : '';
      sets.push(`${field} = $${values.length}${cast}`);
    }
    if (sets.length === 0) {
      throw new ApiException('HRM-EMP-PROFILE-400', 'No fields to update', HttpStatus.BAD_REQUEST);
    }
    sets.push('updated_at = NOW()');
    const res = await this.db.query<ProfileRow>(
      `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $1::uuid AND employee_id = $2::uuid RETURNING *;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  private async deleteProfileRow(
    table: string,
    rowId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization: string | undefined,
  ) {
    await this.ensureSchema();
    await this.employees.getEmployeeById(employeeId, query, authorization);
    this.guardProfileRowMutate(
      await this.peekProfileRow(table, rowId, employeeId),
      authorization,
      query.company_id,
    );
    const res = await this.db.query(`DELETE FROM ${table} WHERE id = $1::uuid AND employee_id = $2::uuid RETURNING id;`, [
      rowId,
      employeeId,
    ]);
    if (!res.rows[0]) {
      throw new ApiException('HRM-EMP-PROFILE-404', 'Profile row not found', HttpStatus.NOT_FOUND);
    }
    return { id: rowId };
  }
}
