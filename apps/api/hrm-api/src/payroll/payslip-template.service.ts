/**
 * @CODE-MEMORY
 * Screen:     Cài đặt / Thiết lập mẫu phiếu lương (Service)
 * UC:         UC-HRM-PAY-PAYSLIP-TPL
 * Purpose:    CRUD mẫu phiếu lương (payslip templates).
 * WorkItem:   PO-HRM-PAY-PAYSLIP-TEMPLATE-SPEC-01
 * Coded:      2026-08-25
 * Callers:    payslip-template.controller.ts
 * Callees:    resolveHrmListScope, pushCompanyIdFilter
 * must_keep:  Display-Ready mapper (trả về statusLabel, statusTone) cho UI; Không để lọt entity thô ra FE.
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { HrmDbService } from '../db/hrm-db.service';
import { pushCompanyIdFilter, resolveHrmListScope } from '../common/hrm-list-scope';
import { CreatePayslipTemplateDto, ListPayslipTemplatesQueryDto, UpdatePayslipTemplateDto } from './dto/payslip-template.dto';

export async function ensurePayslipTemplateSchema(db: HrmDbService): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.payroll_payslip_templates (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      pay_sheet_template_id UUID NULL,
      settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by TEXT NULL,
      updated_by TEXT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_payroll_payslip_templates_company_code
    ON public.payroll_payslip_templates (company_id, lower(code))
    WHERE is_active = TRUE;
  `);
  
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_payroll_payslip_templates_company
    ON public.payroll_payslip_templates (company_id);
  `);
}

function toDisplayReadyPayslipTemplate(row: any) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    pay_sheet_template_id: row.pay_sheet_template_id,
    pay_sheet_template_name: row.pay_sheet_template_name,
    settings: row.settings,
    is_active: row.is_active,
    statusLabel: row.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động',
    statusTone: row.is_active ? 'success' : 'secondary',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

@Injectable()
export class PayslipTemplateService {
  constructor(private readonly db: HrmDbService) {}

  async onModuleInit() {
    await ensurePayslipTemplateSchema(this.db);
  }

  async list(req: any, query: ListPayslipTemplatesQueryDto) {
    const payload = getVerifiedInternalJwtPayload(req.headers?.authorization);
    const scope = resolveHrmListScope(req.headers?.authorization, '');
    const params: any[] = [];
    const filters: string[] = ['is_active = TRUE'];
    
    pushCompanyIdFilter(filters, params, scope);

    if (query.q) {
      params.push(`%${query.q}%`);
      filters.push(`(code ILIKE $${params.length} OR name ILIKE $${params.length})`);
    }

    const { rows } = await this.db.query(`
      SELECT 
        t.*,
        pst.name as pay_sheet_template_name
      FROM public.payroll_payslip_templates t
      LEFT JOIN public.pay_sheet_templates pst ON pst.id = t.pay_sheet_template_id
      WHERE ${filters.join(' AND ')}
      ORDER BY t.created_at DESC
    `, params);

    return { data: rows.map(toDisplayReadyPayslipTemplate) };
  }

  async getById(req: any, id: string) {
    const payload = getVerifiedInternalJwtPayload(req.headers?.authorization);
    const scope = resolveHrmListScope(req.headers?.authorization, '');
    const params: any[] = [id];
    const filters: string[] = ['t.id = $1', 't.is_active = TRUE'];
    
    pushCompanyIdFilter(filters, params, scope);

    const { rows } = await this.db.query(`
      SELECT 
        t.*,
        pst.name as pay_sheet_template_name
      FROM public.payroll_payslip_templates t
      LEFT JOIN public.pay_sheet_templates pst ON pst.id = t.pay_sheet_template_id
      WHERE ${filters.join(' AND ')}
      LIMIT 1
    `, params);

    if (rows.length === 0) {
      throw new ApiException('HRM_PAYSLIP_TPL_404', 'Không tìm thấy Mẫu phiếu lương', HttpStatus.NOT_FOUND);
    }

    return toDisplayReadyPayslipTemplate(rows[0]);
  }

  async create(req: any, dto: CreatePayslipTemplateDto) {
    const payload = getVerifiedInternalJwtPayload(req.headers?.authorization);
    const tenantId = (payload?.tenant_id as string) || 'xevn'; const persistCompanyIdText = (payload?.company_id as string) || 'main';

    // Check code unique
    const { rows: existing } = await this.db.query(`
      SELECT id FROM public.payroll_payslip_templates
      WHERE company_id = $1 AND lower(code) = lower($2) AND is_active = TRUE
      LIMIT 1
    `, [persistCompanyIdText, dto.code]);

    if (existing.length > 0) {
      throw new ApiException('HRM_PAYSLIP_TPL_409', 'Mã mẫu phiếu lương đã tồn tại', HttpStatus.CONFLICT);
    }

    const id = randomUUID();
    const settingsJson = JSON.stringify(dto.settings || {});

    const { rows } = await this.db.query(`
      INSERT INTO public.payroll_payslip_templates (
        id, company_id, tenant_id, code, name, pay_sheet_template_id, settings, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7::jsonb, $8
      ) RETURNING *
    `, [
      id, persistCompanyIdText, tenantId, dto.code, dto.name, dto.pay_sheet_template_id || null, settingsJson, payload?.sub || 'system'
    ]);

    return rows[0];
  }

  async update(req: any, id: string, dto: UpdatePayslipTemplateDto) {
    const tpl = await this.getById(req, id);
    const payload = getVerifiedInternalJwtPayload(req.headers?.authorization);
    
    const updates: string[] = ['updated_at = NOW()', `updated_by = $${2}`];
    const params: any[] = [id, payload?.sub || 'system'];
    let paramIndex = 3;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(dto.name);
    }
    if (dto.pay_sheet_template_id !== undefined) {
      updates.push(`pay_sheet_template_id = $${paramIndex++}`);
      params.push(dto.pay_sheet_template_id);
    }
    if (dto.settings !== undefined) {
      updates.push(`settings = $${paramIndex++}::jsonb`);
      params.push(JSON.stringify(dto.settings));
    }
    if (dto.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(dto.is_active);
    }

    const { rows } = await this.db.query(`
      UPDATE public.payroll_payslip_templates
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `, params);

    return rows[0];
  }

  async delete(req: any, id: string) {
    const tpl = await this.getById(req, id);
    const payload = getVerifiedInternalJwtPayload(req.headers?.authorization);

    await this.db.query(`
      UPDATE public.payroll_payslip_templates
      SET is_active = FALSE, updated_at = NOW(), updated_by = $2
      WHERE id = $1
    `, [id, payload?.sub || 'system']);

    return { success: true };
  }
}
