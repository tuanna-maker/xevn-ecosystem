import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { HrmDbService } from '../../db/hrm-db.service';

@Injectable()
export class PayGradeService {
  constructor(private readonly db: HrmDbService) {}

  async findAll(tenantId: string, options: { search?: string; limit?: number; page?: number }) {
    const { search, limit = 50, page = 1 } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, code, name, description, is_active
      FROM pay_grades
      WHERE deleted_at IS NULL
    `;
    const params: any[] = [];
    
    if (tenantId) {
      query += ` AND tenant_id = $1`;
      params.push(tenantId);
    }

    if (search) {
      query += ` AND (code ILIKE $${params.length + 1} OR name ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    console.log('[DEBUG] Query:', query);
    console.log('[DEBUG] Params:', params);

    const testDb = await this.db.query('SELECT COUNT(*) FROM pay_grades');
    console.log('[DEBUG] Total pay_grades in DB:', testDb.rows);

    const result = await this.db.query(query, params);
    console.log('[DEBUG] Returned rows:', result.rows.length);
    
    require('fs').writeFileSync('debug_pay_grades.json', JSON.stringify({
      params,
      query,
      testDb: testDb.rows,
      result: result.rows,
      envHost: process.env.DB_HOST,
      envDbUrl: process.env.DATABASE_URL_HRM
    }, null, 2));

    return result.rows;
  }

  async create(tenantId: string, dto: { code: string; name: string; description?: string }, userId: string) {
    try {
      const safeTenantId = tenantId || 'test-tenant';
      const safeUserId = this.isUUID(userId) ? userId : '00000000-0000-0000-0000-000000000000';

      const result = await this.db.query(
        `INSERT INTO pay_grades (tenant_id, code, name, description, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, code, name, description, is_active`,
        [safeTenantId, dto.code, dto.name, dto.description || null, safeUserId, safeUserId]
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // unique violation
        throw new ConflictException(`Mã ngạch ${dto.code} đã tồn tại`);
      }
      throw error;
    }
  }

  async update(tenantId: string, id: string, dto: { name?: string; description?: string; is_active?: boolean }, userId: string) {
    const safeTenantId = tenantId || 'test-tenant';
    const safeUserId = this.isUUID(userId) ? userId : '00000000-0000-0000-0000-000000000000';

    const updates: string[] = [];
    const params: any[] = [id, safeTenantId];
    let paramIndex = 3;

    if (dto.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(dto.description);
    }
    if (dto.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(dto.is_active);
    }
    
    if (updates.length === 0) return;

    updates.push(`updated_at = NOW()`);
    updates.push(`updated_by = $${paramIndex}`);
    params.push(safeUserId);

    const query = `
      UPDATE pay_grades
      SET ${updates.join(', ')}
      WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
    `;

    const result = await this.db.query(query, params);
    if (result.rowCount === 0) {
      throw new NotFoundException('Ngạch lương không tồn tại');
    }
  }

  async archive(tenantId: string, id: string) {
    const safeTenantId = tenantId || 'test-tenant';
    const result = await this.db.query(
      `UPDATE pay_grades
       SET deleted_at = NOW()
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [id, safeTenantId]
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Ngạch lương không tồn tại');
    }
  }

  private isUUID(str: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(str);
  }
}
