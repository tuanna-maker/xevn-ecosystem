import { HttpStatus, Injectable } from '@nestjs/common';
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
import { HrmDbService } from '../db/hrm-db.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { ListDecisionsQueryDto } from './dto/list-decisions.query.dto';
import { UpdateDecisionDto } from './dto/update-decision.dto';

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
  effective_date: string | null;
  expiry_date: string | null;
  signer_name: string | null;
  signer_position: string | null;
  signing_date: string | null;
  file_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class DecisionsService {
  constructor(private readonly db: HrmDbService) {}

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
      `SELECT id, company_id, decision_code, decision_type, title, content,
              employee_id, employee_name, employee_code, department, position,
              effective_date::text, expiry_date::text, signer_name, signer_position,
              signing_date::text, file_url, status, notes, created_at, updated_at
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
    const content = payload.content?.trim() ?? payload.reason?.trim() ?? null;
    const effectiveDate = payload.effective_date ?? payload.decision_date ?? null;
    const res = await this.db.query<HrDecisionRow>(
      `INSERT INTO public.hr_decisions (
        id, company_id, decision_code, decision_type, title, content,
        employee_id, employee_name, employee_code, department, position,
        effective_date, expiry_date, signer_name, signer_position, signing_date,
        file_url, status, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12::date, $13::date, $14, $15, $16::date, $17, $18, $19
      )
      RETURNING id, company_id, decision_code, decision_type, title, content,
                employee_id, employee_name, employee_code, department, position,
                effective_date::text, expiry_date::text, signer_name, signer_position,
                signing_date::text, file_url, status, notes, created_at, updated_at;`,
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
        payload.position?.trim() ?? null,
        effectiveDate,
        payload.expiry_date ?? null,
        payload.signer_name?.trim() ?? null,
        payload.signer_position?.trim() ?? null,
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
    if (payload.decision_type != null) set('decision_type', payload.decision_type);
    if (payload.title != null) set('title', payload.title.trim());
    if (payload.content !== undefined) set('content', payload.content?.trim() ?? null);
    if (payload.employee_id !== undefined) set('employee_id', payload.employee_id ?? null);
    if (payload.employee_name != null) set('employee_name', payload.employee_name.trim());
    if (payload.employee_code !== undefined) set('employee_code', payload.employee_code?.trim() ?? null);
    if (payload.department !== undefined) set('department', payload.department?.trim() ?? null);
    if (payload.position !== undefined) set('position', payload.position?.trim() ?? null);
    if (payload.effective_date !== undefined) set('effective_date', payload.effective_date);
    if (payload.expiry_date !== undefined) set('expiry_date', payload.expiry_date);
    if (payload.signer_name !== undefined) set('signer_name', payload.signer_name?.trim() ?? null);
    if (payload.signer_position !== undefined) set('signer_position', payload.signer_position?.trim() ?? null);
    if (payload.signing_date !== undefined) set('signing_date', payload.signing_date);
    if (payload.file_url !== undefined) set('file_url', payload.file_url ?? null);
    if (payload.status != null) set('status', payload.status);
    if (payload.notes !== undefined) set('notes', payload.notes?.trim() ?? null);
    if (fields.length === 0) return existing;
    fields.push('updated_at = NOW()');
    values.push(decisionId);
    const res = await this.db.query<HrDecisionRow>(
      `UPDATE public.hr_decisions SET ${fields.join(', ')} WHERE id = $${values.length}
       RETURNING id, company_id, decision_code, decision_type, title, content,
                 employee_id, employee_name, employee_code, department, position,
                 effective_date::text, expiry_date::text, signer_name, signer_position,
                 signing_date::text, file_url, status, notes, created_at, updated_at;`,
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
    const row = await this.getDecisionScoped(decisionId, companyId, authorization);
    if (!row) {
      throw new ApiException('HRM-DEC-404', 'Decision not found', HttpStatus.NOT_FOUND);
    }
    return row;
  }

  private async getDecisionScoped(decisionId: string, companyId: string, authorization?: string) {
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [decisionId];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<HrDecisionRow>(
      `SELECT id, company_id, decision_code, decision_type, title, content,
              employee_id, employee_name, employee_code, department, position,
              effective_date::text, expiry_date::text, signer_name, signer_position,
              signing_date::text, file_url, status, notes, created_at, updated_at
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
        RETURNING id, company_id, decision_code, decision_type, title, content,
                  employee_id, employee_name, employee_code, department, position,
                  effective_date::text, expiry_date::text, signer_name, signer_position,
                  signing_date::text, file_url, status, notes, created_at, updated_at;
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
