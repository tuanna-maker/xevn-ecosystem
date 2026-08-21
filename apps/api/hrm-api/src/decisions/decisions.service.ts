import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_SC_DEC_KEY } from '../settings-catalogs/hrm-settings-master-keys';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { ListDecisionsQueryDto } from './dto/list-decisions.query.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';
import type { HrDecisionTypeDisplay } from './hr-decision-type.service';
import { HrDecisionTypeService } from './hr-decision-type.service';

/**
 * @CODE-MEMORY
 * Screen: HRM → Quyết định nhân sự
 * UC: UC-HRM-27 · FR-HRM-SC-DEC-01 · FR-HRM-MD-BIND-E1A-01
 * BR: BR-HRM-MD-01 · BR-DEC-04 — decision_type từ catalog decision_types
 * SRS: docs/client-delivery/hrm/SRS_HRM_KHACH_DELTA_CAI_DAT_20260723.md §5 · BA_ERP_E1A_SRS_01
 * TechSpec: docs/hrm/TECHSPEC.md §18.1
 * DB_DESIGN: docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md §4
 * API_DESIGN: docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md DEC-C/U
 * Purpose: CRUD hr_decisions; reject free-text decision_type when Settings catalog present.
 * WorkItem: D-HRM-SETTINGS-MD-CRUD-BE-01
 * Coded: 2026-07-23
 * Callers: decisions.controller.ts
 * Callees: SettingsCatalogsService.assertCodeInEffectiveCatalog · public.hr_decisions
 * must_keep: scope_parity list/get; soft catalog empty = 400 VAL-SET-MD-03; decision_type assert
 * SOLID: Service owns persistence + catalog guard
 * LastVerified: be-erp-e1a-pos-key-01.spec.ts · decisions.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E1A-POS-KEY-01
 * change_mode: ADD
 * What: position_key + signer_position_key columns; assert job_titles; DTO allowlist; denorm snapshots
 * Why: Layer A MD-BIND Decisions FREE_TEXT → catalog code
 * must_keep: HRM-DEC-TYPE; HRM-DEC-201 envelope; scope_parity U19
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E1B-ALIAS-KEYS-01
 * change_mode: ADD
 * What: assert vẫn HRM_SC_DEC_KEY; Settings family merge gồm hr_decision_types (VAL-E1B-DEC-04)
 * must_keep: free-text SoT forbidden; empty catalog → 400
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-BE-01
 * change_mode: ADD
 * What: F-CORE-DEC-01 person-bound employee_id; F-CORE-DEC-02 status=effective UPSERT WH by decision_id; department_key; archive WH on cancel
 * Why: EMP E2E QSĐ→lịch sử · BR-DEC-05 · AC-DEC-WH-02..04 · DB-01 CONFIRMED
 * spec_ref: PO-HRM-E2E-LINK-EMP-SA-01 §3.1–3.2 · PO-HRM-E2E-LINK-EMP-DB-01
 * must_keep: ONE SoT hr_decisions + employee_work_timeline; soft FK no CASCADE; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-BE-03
 * change_mode: FIX
 * What: Map live catalog HRD_* (hr_decision_types) → person-bound + WH neo; keep legacy appointment|transfer aliases
 * Why: R-EMP-DEC-WH-NEO-CATALOG — catalog rejects free-text appointment; HRD_01 effective left work_history_id=null
 * spec_ref: F-CORE-DEC-02 · QA R2 po-hrm-e2e-link-emp-qa-01-r2.md §D1
 * must_keep: catalog assert HRM-DEC-TYPE; soft FK WH by decision_id; U65 no seed; no dual WH SoT
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01
 * change_mode: ADD
 * What: Wire F-CORE-DEC-01/02 → F-DEC-CAT-EFF-01; person-bound/WH/position from typed catalog flags when effective >0; legacy Sets = empty-catalog fallback only
 * Why: R-PLT-DEC-01 — retire hardcoded Sets as SoT after hr_decision_type live
 * spec_ref: DEC-DATA-01 §2.4 · DEC-VERTICAL-SA-01 §3–§4 · VAL-DEC-CNS-*
 * must_keep: create/approve/effective→WH decision_id spine · EMP DOC/ET · ATT · REC · CTR OUT · U65 no seed
 * solid_convention_ack: FE–BE boundary display-ready catalog; consumer assert ∈ effective; flags not JSON SoT
 */

export type HrDecisionRow = {
  id: string;
  company_id: string;
  decision_code: string;
  decision_type: string;
  title: string;
  content: string | null;
  employee_id: string | null;
  employee_name: string;
  employee_code: string | null;
  department: string | null;
  department_key: string | null;
  position: string | null;
  position_key: string | null;
  effective_date: string | null;
  expiry_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signer_position_key: string | null;
  signing_date: string | null;
  file_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const HRM_DEC_POS_KEY = 'HRM-DEC-POS-KEY';
export const HRM_DEC_SIGNER_POS_KEY = 'HRM-DEC-SIGNER-POS-KEY';
export const HRM_DEC_EMP_REQUIRED = 'HRM-DEC-EMP-REQUIRED';
export const HRM_DEC_NOT_EFFECTIVE = 'HRM-DEC-NOT-EFFECTIVE';

/**
 * LEGACY empty-catalog fallback only (BR-PLT-DEC-06).
 * After F-DEC-CAT-EFF-01 >0, SoT = catalog `is_person_bound` — do not extend this Set as product ceiling.
 */
export const PERSON_BOUND_DECISION_TYPES = new Set([
  'appointment',
  'transfer',
  'hrd_01', // Bổ nhiệm
  'hrd_02', // Miễn nhiệm
  'hrd_03', // Kỷ luật (employee required; WH neo only for career map below)
]);

/**
 * LEGACY empty-catalog fallback only.
 * After catalog live, SoT = `writes_work_history` + `wh_event_type` flags.
 */
export const WORK_HISTORY_NEO_DECISION_TYPES = new Set([
  'appointment',
  'transfer',
  'hrd_01', // Bổ nhiệm → event_type appointment
  'hrd_02', // Miễn nhiệm → event_type termination
]);

/** Normalize catalog / legacy decision_type for Set lookups. */
export function normalizeDecisionTypeKey(
  decisionType: string | null | undefined,
): string {
  return (decisionType ?? '').trim().toLowerCase();
}

export function isPersonBoundDecisionType(
  decisionType: string | null | undefined,
): boolean {
  return PERSON_BOUND_DECISION_TYPES.has(
    normalizeDecisionTypeKey(decisionType),
  );
}

export function isWorkHistoryNeoDecisionType(
  decisionType: string | null | undefined,
): boolean {
  return WORK_HISTORY_NEO_DECISION_TYPES.has(
    normalizeDecisionTypeKey(decisionType),
  );
}

/** Map catalog/legacy type → WH event_type (TEXT; appointment|transfer|termination). */
export function resolveWorkHistoryEventType(decisionType: string): string {
  const key = normalizeDecisionTypeKey(decisionType);
  if (key === 'transfer') return 'transfer';
  if (key === 'hrd_02' || key === 'termination') return 'termination';
  return 'appointment';
}

type DecisionTypeRuntimeFlags = {
  canonicalKey: string;
  isPersonBound: boolean;
  writesWorkHistory: boolean;
  whEventType: string;
  requiresPositionKey: boolean;
  fromCatalog: boolean;
};

const HR_DECISION_SELECT = `id, company_id, decision_code, decision_type, title, content,
              employee_id, employee_name, employee_code, department, department_key, position, position_key,
              effective_date::text, expiry_date::text, signer_name, signer_position, signer_position_key,
              signing_date::text, file_url, status, notes, created_at, updated_at`;

@Injectable()
export class DecisionsService {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
    @Optional() private readonly decisionTypeCatalog?: HrDecisionTypeService,
  ) {}

  private flagsFromCatalogRow(
    row: HrDecisionTypeDisplay,
  ): DecisionTypeRuntimeFlags {
    return {
      canonicalKey: row.decisionTypeKey,
      isPersonBound: row.isPersonBound,
      writesWorkHistory: row.writesWorkHistory,
      whEventType:
        row.whEventType?.trim() ||
        resolveWorkHistoryEventType(row.decisionTypeKey),
      requiresPositionKey: row.requiresPositionKey,
      fromCatalog: true,
    };
  }

  private legacyFlags(decisionType: string): DecisionTypeRuntimeFlags {
    return {
      canonicalKey: decisionType,
      isPersonBound: isPersonBoundDecisionType(decisionType),
      writesWorkHistory: isWorkHistoryNeoDecisionType(decisionType),
      whEventType: resolveWorkHistoryEventType(decisionType),
      requiresPositionKey: true,
      fromCatalog: false,
    };
  }

  /**
   * Resolve decision_type ∈ F-DEC-CAT-EFF-01 when catalog >0; else settings assert + legacy Sets.
   */
  private async resolveDecisionTypeFlags(input: {
    companyId: string;
    decisionType: string;
    authorization?: string;
  }): Promise<DecisionTypeRuntimeFlags> {
    const decisionType = input.decisionType.trim() || 'appointment';
    if (this.decisionTypeCatalog) {
      const hit =
        await this.decisionTypeCatalog.assertDecisionTypeInEffectiveCatalog({
          companyId: input.companyId,
          decisionType,
          authorization: input.authorization,
        });
      if (hit) {
        return this.flagsFromCatalogRow(hit);
      }
      // Empty effective — fall through to settings / legacy (BR-PLT-DEC-06).
    }
    if (this.settingsCatalogs) {
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: masterTenantIdFromEnv() || 'xevn',
        companyId: input.companyId,
        catalogKey: HRM_SC_DEC_KEY,
        code: decisionType,
        errorCode: 'HRM-DEC-TYPE',
        errorMessage: `decision_type '${decisionType}' is not in decision_types catalog (free-text SoT forbidden)`,
      });
    }
    return this.legacyFlags(decisionType);
  }

  private resolvePage(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hr_decisions (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        decision_code TEXT NOT NULL,
        decision_type TEXT NOT NULL DEFAULT 'appointment',
        title TEXT NOT NULL,
        content TEXT,
        employee_id UUID,
        employee_name TEXT NOT NULL,
        employee_code TEXT,
        department TEXT,
        position TEXT,
        effective_date DATE,
        expiry_date DATE,
        signer_name TEXT,
        signer_position TEXT,
        signing_date DATE,
        file_url TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hr_decisions_company_id ON public.hr_decisions (company_id);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hr_decisions_decision_type ON public.hr_decisions (decision_type);
    `);
    // E1-A MD-BIND — position_key / signer_position_key (≠ employees.job_title_key).
    await this.db.query(`
      ALTER TABLE public.hr_decisions
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.hr_decisions
        ADD COLUMN IF NOT EXISTS signer_position_key TEXT NULL;
    `);
    // EMP-BE-01 — department_key for WH copy (DB-01 preferred ADD).
    await this.db.query(`
      ALTER TABLE public.hr_decisions
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    // Ensure WH table + link columns exist before F-CORE-DEC-02 upsert (idempotent ADD).
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
      ALTER TABLE public.employee_work_timeline
        ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_work_timeline
        ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_work_timeline_decision_id_active
        ON public.employee_work_timeline (decision_id)
        WHERE decision_id IS NOT NULL AND archived_at IS NULL;
    `);
  }

  private isPersonBoundType(
    decisionType: string,
    flags?: DecisionTypeRuntimeFlags,
  ): boolean {
    if (flags) return flags.isPersonBound;
    return isPersonBoundDecisionType(decisionType);
  }

  private assertPersonBoundEmployeeId(
    decisionType: string,
    employeeId: string | null | undefined,
    flags?: DecisionTypeRuntimeFlags,
  ): string {
    if (!this.isPersonBoundType(decisionType, flags)) {
      return employeeId?.trim() || '';
    }
    const id = employeeId?.trim() ?? '';
    if (!id) {
      throw new ApiException(
        HRM_DEC_EMP_REQUIRED,
        'employee_id is required for person-bound decision_type (catalog is_person_bound / legacy HRD_*)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return id;
  }

  /** Soft-assert employee exists in persist company scope; denorm name when missing. */
  private async resolvePersonBoundEmployee(
    companyId: string,
    employeeId: string,
    authorization: string | undefined,
    fallbackName: string,
  ): Promise<{
    employee_id: string;
    employee_name: string;
    employee_code: string | null;
  }> {
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<{
      id: string;
      full_name: string;
      employee_code: string | null;
    }>(
      `SELECT id, full_name, employee_code FROM public.employees WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-DEC-404',
        'Employee not found in scope for decision',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      employee_id: row.id,
      employee_name: row.full_name?.trim() || fallbackName,
      employee_code: row.employee_code,
    };
  }

  /**
   * F-CORE-DEC-02 — when status=effective + writes_work_history: UPSERT WH by decision_id (idempotent).
   */
  private async upsertWorkHistoryFromDecision(
    decision: HrDecisionRow,
    flags?: DecisionTypeRuntimeFlags,
  ): Promise<{ work_history_id: string } | null> {
    if (decision.status !== 'effective') return null;
    const resolved =
      flags ??
      (this.decisionTypeCatalog
        ? await this.resolveDecisionTypeFlags({
            companyId: decision.company_id,
            decisionType: decision.decision_type,
          }).catch(() => this.legacyFlags(decision.decision_type))
        : this.legacyFlags(decision.decision_type));
    // F-CORE-DEC-02 — WH only when catalog writes_work_history (or legacy neo Set).
    if (!resolved.writesWorkHistory) return null;
    const employeeId = decision.employee_id?.trim();
    if (!employeeId) {
      throw new ApiException(
        HRM_DEC_EMP_REQUIRED,
        'employee_id required before writing work history on effective decision',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (resolved.requiresPositionKey && !decision.position_key?.trim()) {
      throw new ApiException(
        HRM_DEC_POS_KEY,
        'position_key required on decision before WH upsert',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Ensure base WH table exists (cold path).
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
    const eventType =
      resolved.whEventType ||
      resolveWorkHistoryEventType(decision.decision_type);
    const eventDate =
      decision.effective_date || new Date().toISOString().slice(0, 10);
    const title =
      decision.position?.trim() ||
      decision.title?.trim() ||
      decision.position_key;
    const existing = await this.db.query<{ id: string }>(
      `
        SELECT id FROM public.employee_work_timeline
        WHERE decision_id = $1::uuid AND archived_at IS NULL
        LIMIT 1;
      `,
      [decision.id],
    );
    if (existing.rows[0]) {
      const upd = await this.db.query<{ id: string }>(
        `
          UPDATE public.employee_work_timeline SET
            event_date = $2::date,
            title = $3,
            event_type = $4,
            position = $5,
            position_key = $6,
            department = $7,
            department_key = $8,
            source_module = 'decision',
            updated_at = NOW()
          WHERE id = $1::uuid
          RETURNING id;
        `,
        [
          existing.rows[0].id,
          eventDate,
          title,
          eventType,
          decision.position,
          decision.position_key,
          decision.department,
          decision.department_key,
        ],
      );
      return { work_history_id: upd.rows[0].id };
    }
    const id = randomUUID();
    const ins = await this.db.query<{ id: string }>(
      `
        INSERT INTO public.employee_work_timeline (
          id, employee_id, company_id, event_date, title, event_type, status,
          department, position, position_key, department_key,
          decision_id, source_module
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4::date, $5, $6, 'current',
          $7, $8, $9, $10, $11::uuid, 'decision'
        )
        RETURNING id;
      `,
      [
        id,
        employeeId,
        decision.company_id,
        eventDate,
        title,
        eventType,
        decision.department,
        decision.position,
        decision.position_key,
        decision.department_key,
        decision.id,
      ],
    );
    return { work_history_id: ins.rows[0].id };
  }

  private async archiveWorkHistoryForDecision(
    decisionId: string,
  ): Promise<void> {
    await this.db.query(
      `
        UPDATE public.employee_work_timeline
        SET archived_at = NOW(), updated_at = NOW()
        WHERE decision_id = $1::uuid AND archived_at IS NULL;
      `,
      [decisionId],
    );
  }

  private async assertDecPositionKey(
    companyId: string,
    positionKey: string | null | undefined,
    required: boolean,
  ): Promise<{ code: string; label: string } | null> {
    const code = positionKey?.trim() ?? '';
    if (!code) {
      if (!required) return null;
      throw new ApiException(
        HRM_DEC_POS_KEY,
        'position_key is required (catalog SoT; free-text position alone forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return { code, label: code };
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: masterTenantIdFromEnv() || 'xevn',
      companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: HRM_DEC_POS_KEY,
      errorMessage: `position_key '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
    });
    return { code: hit.code, label: hit.label };
  }

  private async assertDecSignerPositionKey(
    companyId: string,
    signerPositionKey: string | null | undefined,
    required: boolean,
  ): Promise<{ code: string; label: string } | null> {
    const code = signerPositionKey?.trim() ?? '';
    if (!code) {
      if (!required) return null;
      throw new ApiException(
        HRM_DEC_SIGNER_POS_KEY,
        'signer_position_key is required when signer fields are set',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return { code, label: code };
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: masterTenantIdFromEnv() || 'xevn',
      companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: HRM_DEC_SIGNER_POS_KEY,
      errorMessage: `signer_position_key '${code}' is not in job_titles catalog`,
    });
    return { code: hit.code, label: hit.label };
  }

  async listDecisions(query: ListDecisionsQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, query.company_id);
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const offset = (page - 1) * pageSize;
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (query.decision_type) {
      filters.push(`decision_type = $${values.length + 1}`);
      values.push(query.decision_type);
    }
    if (query.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status);
    }
    const where = filters.join(' AND ');
    const res = await this.db.query<HrDecisionRow>(
      `SELECT ${HR_DECISION_SELECT}
       FROM public.hr_decisions
       WHERE ${where}
       ORDER BY created_at DESC;`,
      values,
    );
    return {
      total: res.rows.length,
      page,
      page_size: pageSize,
      data: res.rows.slice(offset, offset + pageSize),
    };
  }

  async createDecision(payload: CreateDecisionDto, authorization?: string) {
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    await this.ensureSchema();
    const id = randomUUID();
    const decisionCode = payload.decision_code?.trim() || `DEC-${Date.now()}`;
    const title =
      payload.title?.trim() ||
      payload.reason?.trim() ||
      `Decision ${decisionCode}`;
    const rawType = payload.decision_type?.trim() || 'appointment';
    // F-DEC-CAT-EFF-01 / BR-PLT-02 — assert ∈ effective when catalog >0; else settings + legacy Sets.
    const typeFlags = await this.resolveDecisionTypeFlags({
      companyId,
      decisionType: rawType,
      authorization,
    });
    const decisionType = typeFlags.canonicalKey;
    // F-CORE-DEC-01 — person-bound require employee_id (catalog flag or legacy Set).
    const boundEmployeeId = this.assertPersonBoundEmployeeId(
      decisionType,
      payload.employee_id,
      typeFlags,
    );
    let employeeId: string | null = payload.employee_id ?? null;
    let employeeName = payload.employee_name.trim();
    let employeeCode = payload.employee_code?.trim() ?? null;
    if (boundEmployeeId) {
      const emp = await this.resolvePersonBoundEmployee(
        companyId,
        boundEmployeeId,
        authorization,
        employeeName,
      );
      employeeId = emp.employee_id;
      employeeName = emp.employee_name;
      employeeCode = emp.employee_code ?? employeeCode;
    }
    // E1-A / catalog requires_position_key — Vị trí catalog key.
    const pos = await this.assertDecPositionKey(
      companyId,
      payload.position_key,
      typeFlags.requiresPositionKey,
    );
    const signerPresent = Boolean(
      payload.signer_name?.trim() ||
      payload.signer_position?.trim() ||
      payload.signer_position_key?.trim(),
    );
    const signerPos = await this.assertDecSignerPositionKey(
      companyId,
      payload.signer_position_key,
      signerPresent,
    );
    const content = payload.content?.trim() ?? payload.reason?.trim() ?? null;
    const effectiveDate =
      payload.effective_date ?? payload.decision_date ?? null;
    const positionSnapshot = payload.position?.trim() || pos?.label || null;
    const signerPositionSnapshot =
      payload.signer_position?.trim() || (signerPos ? signerPos.label : null);
    const status = payload.status ?? 'draft';
    const departmentKey = payload.department_key?.trim() || null;
    const res = await this.db.query<HrDecisionRow>(
      `INSERT INTO public.hr_decisions (
        id, company_id, decision_code, decision_type, title, content,
        employee_id, employee_name, employee_code, department, department_key, position, position_key,
        effective_date, expiry_date, signer_name, signer_position, signer_position_key, signing_date,
        file_url, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14::date, $15::date, $16, $17, $18, $19::date, $20, $21, $22
      )
      RETURNING ${HR_DECISION_SELECT};`,
      [
        id,
        companyId,
        decisionCode,
        decisionType,
        title,
        content,
        employeeId,
        employeeName,
        employeeCode,
        payload.department?.trim() ?? null,
        departmentKey,
        positionSnapshot,
        pos?.code ?? null,
        effectiveDate,
        payload.expiry_date ?? null,
        payload.signer_name?.trim() ?? null,
        signerPositionSnapshot,
        signerPos?.code ?? null,
        payload.signing_date ?? null,
        payload.file_url ?? null,
        status,
        payload.notes?.trim() ?? null,
      ],
    );
    const row = res.rows[0];
    // F-CORE-DEC-02 — create already effective → write WH same turn (catalog flags / legacy neo).
    if (row.status === 'effective' && typeFlags.writesWorkHistory) {
      const wh = await this.upsertWorkHistoryFromDecision(row, typeFlags);
      return { ...row, work_history_id: wh?.work_history_id ?? null };
    }
    return row;
  }

  async updateDecision(
    decisionId: string,
    payload: UpdateDecisionDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    if (!payload.company_id?.trim()) {
      throw new ApiException(
        'HRM-DEC-002',
        'company_id is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const scope = resolveHrmListScope(authorization, payload.company_id.trim());
    const existing = await this.getDecisionScoped(
      decisionId,
      payload.company_id.trim(),
      authorization,
    );
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-DEC-404',
      mismatchCode: 'HRM-DEC-409',
    });
    const fields: string[] = [];
    const values: unknown[] = [];
    const set = (col: string, val: unknown) => {
      values.push(val);
      fields.push(`${col} = $${values.length}`);
    };
    if (payload.decision_code != null)
      set('decision_code', payload.decision_code.trim());
    let nextType = existing.decision_type;
    let typeFlags = await this.resolveDecisionTypeFlags({
      companyId: existing.company_id,
      decisionType: nextType,
      authorization,
    });
    if (payload.decision_type != null) {
      const decisionType = payload.decision_type.trim();
      typeFlags = await this.resolveDecisionTypeFlags({
        companyId: existing.company_id,
        decisionType,
        authorization,
      });
      set('decision_type', typeFlags.canonicalKey);
      nextType = typeFlags.canonicalKey;
    }
    if (payload.title != null) set('title', payload.title.trim());
    if (payload.content !== undefined)
      set('content', payload.content?.trim() ?? null);
    const nextEmployeeId =
      payload.employee_id !== undefined
        ? payload.employee_id
        : existing.employee_id;
    const nextStatus =
      payload.status != null ? payload.status : existing.status;
    // F-CORE-DEC-01 — re-validate person-bound on type/status/employee change.
    if (
      this.isPersonBoundType(nextType, typeFlags) ||
      nextStatus === 'effective'
    ) {
      this.assertPersonBoundEmployeeId(nextType, nextEmployeeId, typeFlags);
    }
    if (payload.employee_id !== undefined) {
      if (payload.employee_id) {
        const emp = await this.resolvePersonBoundEmployee(
          existing.company_id,
          payload.employee_id,
          authorization,
          payload.employee_name?.trim() || existing.employee_name,
        );
        set('employee_id', emp.employee_id);
        if (payload.employee_name == null)
          set('employee_name', emp.employee_name);
        if (payload.employee_code === undefined && emp.employee_code) {
          set('employee_code', emp.employee_code);
        }
      } else {
        set('employee_id', null);
      }
    }
    if (payload.employee_name != null)
      set('employee_name', payload.employee_name.trim());
    if (payload.employee_code !== undefined)
      set('employee_code', payload.employee_code?.trim() ?? null);
    if (payload.department !== undefined)
      set('department', payload.department?.trim() ?? null);
    if (payload.department_key !== undefined)
      set('department_key', payload.department_key?.trim() ?? null);
    if (payload.position !== undefined && payload.position_key === undefined) {
      throw new ApiException(
        HRM_DEC_POS_KEY,
        'position_key is required when updating position (invent-only free-text forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.position_key !== undefined) {
      const pos = await this.assertDecPositionKey(
        existing.company_id,
        payload.position_key,
        typeFlags.requiresPositionKey,
      );
      set('position_key', pos!.code);
      set('position', payload.position?.trim() || pos!.label);
    } else if (payload.position !== undefined) {
      set('position', payload.position?.trim() ?? null);
    }
    if (payload.effective_date !== undefined)
      set('effective_date', payload.effective_date);
    if (payload.expiry_date !== undefined)
      set('expiry_date', payload.expiry_date);
    if (payload.signer_name !== undefined)
      set('signer_name', payload.signer_name?.trim() ?? null);
    if (
      payload.signer_position !== undefined &&
      payload.signer_position_key === undefined
    ) {
      throw new ApiException(
        HRM_DEC_SIGNER_POS_KEY,
        'signer_position_key is required when updating signer_position',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.signer_position_key !== undefined) {
      const signerPos = await this.assertDecSignerPositionKey(
        existing.company_id,
        payload.signer_position_key,
        true,
      );
      set('signer_position_key', signerPos!.code);
      set(
        'signer_position',
        payload.signer_position?.trim() || signerPos!.label,
      );
    } else if (payload.signer_position !== undefined) {
      set('signer_position', payload.signer_position?.trim() ?? null);
    }
    if (payload.signing_date !== undefined)
      set('signing_date', payload.signing_date);
    if (payload.file_url !== undefined)
      set('file_url', payload.file_url ?? null);
    if (payload.status != null) set('status', payload.status);
    if (payload.notes !== undefined)
      set('notes', payload.notes?.trim() ?? null);
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(decisionId);
    const res = await this.db.query<HrDecisionRow>(
      `UPDATE public.hr_decisions SET ${fields.join(', ')} WHERE id = $${values.length}
       RETURNING ${HR_DECISION_SELECT};`,
      values,
    );
    const row = res.rows[0];
    // F-CORE-DEC-02 — transition to effective → UPSERT WH (catalog writes_work_history / legacy neo).
    if (row.status === 'effective' && typeFlags.writesWorkHistory) {
      const wh = await this.upsertWorkHistoryFromDecision(row, typeFlags);
      return { ...row, work_history_id: wh?.work_history_id ?? null };
    }
    // AC-DEC-WH-04 — cancel → soft-archive linked WH (no hard delete).
    if (row.status === 'cancelled' || row.status === 'expired') {
      await this.archiveWorkHistoryForDecision(row.id);
    }
    return row;
  }

  async deleteDecision(
    decisionId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const existing = await this.getDecisionScoped(
      decisionId,
      companyId,
      authorization,
    );
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-DEC-404',
      mismatchCode: 'HRM-DEC-409',
    });
    // Soft-archive WH before decision hard-delete (soft FK; no CASCADE).
    await this.archiveWorkHistoryForDecision(decisionId);
    await this.db.query(
      `DELETE FROM public.hr_decisions WHERE id = $1::uuid;`,
      [decisionId],
    );
    return { id: decisionId };
  }

  async getDecisionById(
    decisionId: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const row = await this.getDecisionScoped(
      decisionId,
      companyId,
      authorization,
    );
    if (!row) {
      throw new ApiException(
        'HRM-DEC-404',
        'Decision not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-DEC-404',
      mismatchCode: 'HRM-DEC-409',
    });
    return row;
  }

  private async getDecisionScoped(
    decisionId: string,
    companyId: string,
    authorization?: string,
  ) {
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [decisionId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<HrDecisionRow>(
      `SELECT ${HR_DECISION_SELECT}
       FROM public.hr_decisions WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    return res.rows[0] ?? null;
  }

  /** Local disk multipart stub — stores under `uploads/hrm-decisions` or `HRM_DECISION_UPLOAD_DIR`. */
  async saveDecisionFile(
    decisionId: string,
    companyId: string,
    authorization: string | undefined,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    await this.ensureSchema();
    const existing = await this.getDecisionScoped(
      decisionId,
      companyId,
      authorization,
    );
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-DEC-404',
      mismatchCode: 'HRM-DEC-409',
    });
    const baseDir =
      process.env.HRM_DECISION_UPLOAD_DIR?.trim() ||
      join(process.cwd(), 'uploads', 'hrm-decisions');
    await mkdir(baseDir, { recursive: true });
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 120);
    const storedName = `${decisionId}-${Date.now()}-${safeName}`;
    const absolutePath = join(baseDir, storedName);
    await writeFile(absolutePath, file.buffer);
    const fileUrl = `/api/hrm/decisions/files/${storedName}`;
    const res = await this.db.query<HrDecisionRow>(
      `
        UPDATE public.hr_decisions
        SET file_url = $2, updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING ${HR_DECISION_SELECT};
      `,
      [decisionId, fileUrl],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-DEC-404',
        'Decision not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      ...row,
      storage_path: absolutePath,
      mime_type: file.mimetype,
    };
  }
}
