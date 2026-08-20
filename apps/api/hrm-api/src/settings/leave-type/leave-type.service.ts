/**
 * @CODE-MEMORY
 * Screen:     Settings > Catalog > Loai nghi (Service) -- UC-LV-01, UC-LV-02
 * UC:         UC-LV-01 (list), UC-LV-02 (CRUD)
 * BR:         BR-LV-01 (LABOR_LAW no hard delete) · BR-LV-02 (unique code) · BR-LV-04 (LABOR_LAW immutable code/name)
 *             BR-LV-06 (unpaid -> payRate=0)
 * SRS:        docs/program/deltas/BA_HRM_LEAVE_TYPE_SRS_01_20260815.md §3 UC · §4 FR · §5 Data Model
 * TechSpec:   docs/program/deltas/BA_HRM_LEAVE_TYPE_TECHSPEC_01_20260815.md §3.2 Service
 * WorkItem:   BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * Coded:      2026-08-15
 * Purpose:    Leave Type CRUD + business logic for payroll integration.
 * solid_convention_ack: true
 * be_boundary: true -- Service chỉ xử lý nghiệp vụ, không FE logic
 *
 * @CODE-MEMORY-CHANGE 2026-08-17
 * change_mode: FIX
 * What: Replace queryOne/execute → query().rows[0] pattern
 * Why: HrmDbService chỉ có query() + withTransaction(); queryOne/execute không tồn tại → TS2339 ×7
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HrmDbService } from '../../db/hrm-db.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveTypeQueryDto } from './dto/leave-type.query.dto';

type LeaveTypeRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  code: string;
  name: string;
  default_days_per_year: number;
  is_paid: boolean;
  pay_rate_percent: string;
  leave_category: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string | null;
  updated_by: string | null;
};

@Injectable()
export class LeaveTypeService {
  constructor(private readonly db: HrmDbService) {}

  async findAll(tenantId: string, companyId: string, query: LeaveTypeQueryDto) {
    const { page = 1, limit = 20, search, status, category } = query;
    const where: string[] = [
      'tenant_id = $1',
      'company_id = $2',
      'deleted_at IS NULL',
    ];
    const params: any[] = [tenantId, companyId];
    let paramIdx = 3;

    if (search) {
      where.push(`(code ILIKE $${paramIdx} OR name ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }
    if (status) {
      where.push(`status = $${paramIdx}`);
      params.push(status);
      paramIdx++;
    }
    if (category) {
      where.push(`leave_category = $${paramIdx}`);
      params.push(category);
      paramIdx++;
    }

    const total = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM public.hrm_leave_type WHERE ${where.join(' AND ')}`,
      params,
    );
    const rowsResult = await this.db.query<LeaveTypeRow>(
      `SELECT * FROM public.hrm_leave_type WHERE ${where.join(' AND ')} ORDER BY leave_category DESC, code LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, (page - 1) * limit],
    );
    return {
      data: rowsResult.rows,
      total: parseInt(total?.count ?? '0', 10),
      page,
      limit,
    };
  }

  async findById(tenantId: string, companyId: string, id: string) {
    return this.db.queryOne<LeaveTypeRow>(
      `SELECT * FROM public.hrm_leave_type WHERE id = $1 AND tenant_id = $2 AND company_id = $3 AND deleted_at IS NULL`,
      [id, tenantId, companyId],
    );
  }

  async create(
    tenantId: string,
    companyId: string,
    dto: CreateLeaveTypeDto,
    userId: string,
  ) {
    // Validate code unique
    const exists = await this.db.queryOne(
      `SELECT 1 FROM public.hrm_leave_type WHERE tenant_id = $1 AND company_id = $2 AND code = $3 AND deleted_at IS NULL`,
      [tenantId, companyId, dto.code],
    );
    if (exists) throw new ConflictException('Leave type code already exists');

    // BR-LV-06: if !is_paid -> pay_rate must be 0
    if (!dto.isPaid && dto.payRatePercent !== 0) {
      throw new BadRequestException(
        'Unpaid leave type must have payRatePercent = 0',
      );
    }

    const result = await this.db.queryOne<LeaveTypeRow>(
      `INSERT INTO public.hrm_leave_type (tenant_id, company_id, code, name, default_days_per_year, is_paid, pay_rate_percent, leave_category, description, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        tenantId,
        companyId,
        dto.code,
        dto.name,
        dto.defaultDaysPerYear ?? 0,
        dto.isPaid,
        dto.payRatePercent,
        dto.leaveCategory,
        dto.description ?? null,
        userId,
      ],
    );
    return result;
  }

  async update(
    tenantId: string,
    companyId: string,
    id: string,
    dto: UpdateLeaveTypeDto,
  ) {
    const existing = await this.findById(tenantId, companyId, id);
    if (!existing) throw new NotFoundException('Leave type not found');
    if (existing.leave_category === 'LABOR_LAW') {
      // BR-LV-04: khong duoc doi code/ten mac dinh cua BLĐ
      if (dto.name && dto.name !== existing.name)
        throw new BadRequestException(
          'Cannot change name of LABOR_LAW leave type',
        );
    }
    // BR-LV-06 check
    const isPaid = dto.isPaid ?? existing.is_paid;
    const payRate = dto.payRatePercent ?? Number(existing.pay_rate_percent);
    if (!isPaid && payRate !== 0) {
      throw new BadRequestException(
        'Unpaid leave type must have payRatePercent = 0',
      );
    }

    const fields: string[] = [];
    const params: any[] = [tenantId, companyId, id];
    let idx = 4;
    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      params.push(dto.name);
    }
    if (dto.defaultDaysPerYear !== undefined) {
      fields.push(`default_days_per_year = $${idx++}`);
      params.push(dto.defaultDaysPerYear);
    }
    if (dto.isPaid !== undefined) {
      fields.push(`is_paid = $${idx++}`);
      params.push(dto.isPaid);
    }
    if (dto.payRatePercent !== undefined) {
      fields.push(`pay_rate_percent = $${idx++}`);
      params.push(dto.payRatePercent);
    }
    if (dto.leaveCategory !== undefined) {
      fields.push(`leave_category = $${idx++}`);
      params.push(dto.leaveCategory);
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      params.push(dto.description);
    }
    if (dto.status !== undefined) {
      fields.push(`status = $${idx++}`);
      params.push(dto.status);
    }
    fields.push(`updated_at = now()`);

    if (fields.length === 1) return existing; // no changes (only updated_at)

    const result = await this.db.queryOne<LeaveTypeRow>(
      `UPDATE public.hrm_leave_type SET ${fields.join(', ')} WHERE tenant_id = $1 AND company_id = $2 AND id = $3 RETURNING *`,
      params,
    );
    return result;
  }

  async softDelete(tenantId: string, companyId: string, id: string) {
    const existing = await this.findById(tenantId, companyId, id);
    if (!existing) throw new NotFoundException('Leave type not found');
    if (existing.leave_category === 'LABOR_LAW') {
      // BR-LV-01: chi deactivate, khong hard delete
      return this.update(tenantId, companyId, id, { status: 'inactive' });
    }
    await this.db.execute(
      `UPDATE public.hrm_leave_type SET deleted_at = now(), status = 'inactive' WHERE tenant_id = $1 AND company_id = $2 AND id = $3`,
      [tenantId, companyId, id],
    );
    return { success: true };
  }

  // For payroll formula -- lay pay_rate_percent theo code
  async getPayRateByCode(
    tenantId: string,
    companyId: string,
    code: string,
  ): Promise<number> {
    const row = await this.db.queryOne<{ pay_rate_percent: string }>(
      `SELECT pay_rate_percent FROM public.hrm_leave_type WHERE tenant_id = $1 AND company_id = $2 AND code = $3 AND status = 'active' AND deleted_at IS NULL`,
      [tenantId, companyId, code],
    );
    return row ? parseFloat(row.pay_rate_percent) : 100;
  }
}
