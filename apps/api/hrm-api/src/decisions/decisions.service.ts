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

const HR_DECISION_SELECT = `id, company_id, decision_code, decision_type, title, content,
              employee_id, employee_name, employee_code, department, position, position_key,
              effective_date::text, expiry_date::text, signer_name, signer_position, signer_position_key,
              signing_date::text, file_url, status, notes, created_at, updated_at`;

@Injectable()
export class DecisionsService {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private resolvePage(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(value: number | string | undefined, fallback: number): number {
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
    return { total: res.rows.length, page, page_size: pageSize, data: res.rows.slice(offset, offset + pageSize) };
  }

  async createDecision(payload: CreateDecisionDto, authorization?: string) {
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    await this.ensureSchema();
    const id = randomUUID();
    const decisionCode = payload.decision_code?.trim() || `DEC-${Date.now()}`;
    const title = payload.title?.trim() || payload.reason?.trim() || `Decision ${decisionCode}`;
    const decisionType = payload.decision_type?.trim() || 'appointment';
    // BR-HRM-MD-01 / VAL-SET-MD-03 — decision_type ∈ decision_types (FR-HRM-SC-DEC-01).
    if (this.settingsCatalogs) {
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: masterTenantIdFromEnv() || 'xevn',
        companyId,
        catalogKey: HRM_SC_DEC_KEY,
        code: decisionType,
        errorCode: 'HRM-DEC-TYPE',
        errorMessage: `decision_type '${decisionType}' is not in decision_types catalog (free-text SoT forbidden)`,
      });
    }
    // E1-A — Vị trí bắt buộc catalog key (AC-E1A-DEC-POS-01).
    const pos = await this.assertDecPositionKey(companyId, payload.position_key, true);
    const signerPresent = Boolean(
      payload.signer_name?.trim() || payload.signer_position?.trim() || payload.signer_position_key?.trim(),
    );
    const signerPos = await this.assertDecSignerPositionKey(
      companyId,
      payload.signer_position_key,
      signerPresent,
    );
    const content = payload.content?.trim() ?? payload.reason?.trim() ?? null;
    const effectiveDate = payload.effective_date ?? payload.decision_date ?? null;
    const positionSnapshot = payload.position?.trim() || pos!.label;
    const signerPositionSnapshot =
      payload.signer_position?.trim() || (signerPos ? signerPos.label : null);
    const res = await this.db.query<HrDecisionRow>(
      `INSERT INTO public.hr_decisions (
        id, company_id, decision_code, decision_type, title, content,
        employee_id, employee_name, employee_code, department, position, position_key,
        effective_date, expiry_date, signer_name, signer_position, signer_position_key, signing_date,
        file_url, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13::date, $14::date, $15, $16, $17, $18::date, $19, $20, $21
      )
      RETURNING ${HR_DECISION_SELECT};`,
      [
        id,
        companyId,
        decisionCode,
        decisionType,
        title,
        content,
        payload.employee_id ?? null,
        payload.employee_name.trim(),
        payload.employee_code?.trim() ?? null,
        payload.department?.trim() ?? null,
        positionSnapshot,
        pos!.code,
        effectiveDate,
        payload.expiry_date ?? null,
        payload.signer_name?.trim() ?? null,
        signerPositionSnapshot,
        signerPos?.code ?? null,
        payload.signing_date ?? null,
        payload.file_url ?? null,
        payload.status ?? 'draft',
        payload.notes?.trim() ?? null,
      ],
    );
    return res.rows[0];
  }

  async updateDecision(decisionId: string, payload: UpdateDecisionDto, authorization?: string) {
    await this.ensureSchema();
    if (!payload.company_id?.trim()) {
      throw new ApiException('HRM-DEC-002', 'company_id is required', HttpStatus.BAD_REQUEST);
    }
    const scope = resolveHrmListScope(authorization, payload.company_id.trim());
    const existing = await this.getDecisionScoped(decisionId, payload.company_id.trim(), authorization);
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
    if (payload.decision_code != null) set('decision_code', payload.decision_code.trim());
    if (payload.decision_type != null) {
      const decisionType = payload.decision_type.trim();
      if (this.settingsCatalogs) {
        await this.settingsCatalogs.assertCodeInEffectiveCatalog({
          tenantId: masterTenantIdFromEnv() || 'xevn',
          companyId: existing.company_id,
          catalogKey: HRM_SC_DEC_KEY,
          code: decisionType,
          errorCode: 'HRM-DEC-TYPE',
          errorMessage: `decision_type '${decisionType}' is not in decision_types catalog (free-text SoT forbidden)`,
        });
      }
      set('decision_type', decisionType);
    }
    if (payload.title != null) set('title', payload.title.trim());
    if (payload.content !== undefined) set('content', payload.content?.trim() ?? null);
    if (payload.employee_id !== undefined) set('employee_id', payload.employee_id ?? null);
    if (payload.employee_name != null) set('employee_name', payload.employee_name.trim());
    if (payload.employee_code !== undefined) set('employee_code', payload.employee_code?.trim() ?? null);
    if (payload.department !== undefined) set('department', payload.department?.trim() ?? null);
    if (payload.position !== undefined && payload.position_key === undefined) {
      throw new ApiException(
        HRM_DEC_POS_KEY,
        'position_key is required when updating position (invent-only free-text forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.position_key !== undefined) {
      const pos = await this.assertDecPositionKey(existing.company_id, payload.position_key, true);
      set('position_key', pos!.code);
      set('position', payload.position?.trim() || pos!.label);
    } else if (payload.position !== undefined) {
      set('position', payload.position?.trim() ?? null);
    }
    if (payload.effective_date !== undefined) set('effective_date', payload.effective_date);
    if (payload.expiry_date !== undefined) set('expiry_date', payload.expiry_date);
    if (payload.signer_name !== undefined) set('signer_name', payload.signer_name?.trim() ?? null);
    if (payload.signer_position !== undefined && payload.signer_position_key === undefined) {
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
      set('signer_position', payload.signer_position?.trim() || signerPos!.label);
    } else if (payload.signer_position !== undefined) {
      set('signer_position', payload.signer_position?.trim() ?? null);
    }
    if (payload.signing_date !== undefined) set('signing_date', payload.signing_date);
    if (payload.file_url !== undefined) set('file_url', payload.file_url ?? null);
    if (payload.status != null) set('status', payload.status);
    if (payload.notes !== undefined) set('notes', payload.notes?.trim() ?? null);
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(decisionId);
    const res = await this.db.query<HrDecisionRow>(
      `UPDATE public.hr_decisions SET ${fields.join(', ')} WHERE id = $${values.length}
       RETURNING ${HR_DECISION_SELECT};`,
      values,
    );
    return res.rows[0];
  }

  async deleteDecision(decisionId: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const existing = await this.getDecisionScoped(decisionId, companyId, authorization);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-DEC-404',
      mismatchCode: 'HRM-DEC-409',
    });
    await this.db.query(`DELETE FROM public.hr_decisions WHERE id = $1::uuid;`, [decisionId]);
    return { id: decisionId };
  }

  async getDecisionById(decisionId: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const row = await this.getDecisionScoped(decisionId, companyId, authorization);
    if (!row) {
      throw new ApiException('HRM-DEC-404', 'Decision not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-DEC-404',
      mismatchCode: 'HRM-DEC-409',
    });
    return row;
  }

  private async getDecisionScoped(decisionId: string, companyId: string, authorization?: string) {
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
    const existing = await this.getDecisionScoped(decisionId, companyId, authorization);
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-DEC-404',
      mismatchCode: 'HRM-DEC-409',
    });
    const baseDir =
      process.env.HRM_DECISION_UPLOAD_DIR?.trim() ||
      join(process.cwd(), 'uploads', 'hrm-decisions');
    await mkdir(baseDir, { recursive: true });
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
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
      throw new ApiException('HRM-DEC-404', 'Decision not found', HttpStatus.NOT_FOUND);
    }
    return {
      ...row,
      storage_path: absolutePath,
      mime_type: file.mimetype,
    };
  }
}
