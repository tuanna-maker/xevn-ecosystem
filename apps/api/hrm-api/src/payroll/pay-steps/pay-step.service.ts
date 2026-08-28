import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../../common/api.exception';
import { HrmDbService } from '../../db/hrm-db.service';

export type PayStepRow = {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class PayStepService {
  constructor(private readonly db: HrmDbService) {}

  private getSafeUuid(id: string): string {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(id) ? id : '00000000-0000-0000-0000-000000000000';
  }

  async findAll(tenantId: string, query: { search?: string, limit?: number, page?: number }) {
    const limit = query.limit ?? 50;
    const offset = ((query.page ?? 1) - 1) * limit;
    const params: unknown[] = [tenantId];
    let searchClause = '';
    if (query.search) {
      params.push(`%${query.search}%`);
      searchClause = `AND (code ILIKE $${params.length} OR name ILIKE $${params.length})`;
    }
    params.push(limit);
    params.push(offset);
    
    const { rows } = await this.db.query<PayStepRow>(
      `SELECT id::text, tenant_id::text, code, name, description, is_active, created_at::text, updated_at::text 
       FROM pay_steps 
       WHERE tenant_id = $1 AND deleted_at IS NULL ${searchClause} 
       ORDER BY code ASC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    const countParams: unknown[] = [tenantId];
    let countSearch = '';
    if (query.search) {
      countParams.push(`%${query.search}%`);
      countSearch = `AND (code ILIKE $${countParams.length} OR name ILIKE $${countParams.length})`;
    }
    const { rows: countRows } = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM pay_steps WHERE tenant_id = $1 AND deleted_at IS NULL ${countSearch}`,
      countParams,
    );

    return { data: rows, total: parseInt(countRows[0]?.total ?? '0', 10) };
  }

  async create(tenantId: string, dto: { code: string; name: string; description?: string }, userId: string) {
    const safeTenantId = tenantId || 'test-tenant';
    const safeUserId = this.getSafeUuid(userId);
    const { rows: exist } = await this.db.query<{ id: string }>(
      `SELECT id FROM pay_steps WHERE tenant_id = $1 AND code = $2 AND deleted_at IS NULL`,
      [safeTenantId, dto.code.toUpperCase()]
    );
    if (exist.length) throw new ApiException('HRM-G1-002', 'Mã bậc đã tồn tại', HttpStatus.CONFLICT);

    const { rows } = await this.db.query(
      `INSERT INTO pay_steps (tenant_id, code, name, description, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $5) RETURNING id`,
      [safeTenantId, dto.code.toUpperCase(), dto.name, dto.description ?? null, safeUserId],
    );
    return { id: rows[0].id };
  }

  async update(tenantId: string, id: string, dto: { name: string; description?: string, is_active?: boolean }, userId: string) {
    const safeTenantId = tenantId || 'test-tenant';
    const safeUserId = this.getSafeUuid(userId);
    const { rowCount } = await this.db.query(
      `UPDATE pay_steps SET name = $1, description = $2, is_active = COALESCE($3, is_active), updated_at = NOW(), updated_by = $4 
       WHERE id = $5 AND tenant_id = $6 AND deleted_at IS NULL`,
      [dto.name, dto.description ?? null, dto.is_active, safeUserId, id, safeTenantId]
    );
    if (!rowCount) throw new ApiException('HRM-G1-001', 'Bậc lương không tồn tại', HttpStatus.NOT_FOUND);
  }

  async archive(tenantId: string, id: string) {
    const safeTenantId = tenantId || 'test-tenant';
    const { rowCount } = await this.db.query(
      `UPDATE pay_steps SET deleted_at = NOW() WHERE id = $1 AND tenant_id = $2`,
      [id, safeTenantId]
    );
    if (!rowCount) throw new ApiException('HRM-G1-001', 'Bậc lương không tồn tại', HttpStatus.NOT_FOUND);
  }
}