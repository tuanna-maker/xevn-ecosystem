/**
 * @CODE-MEMORY
 * Screen:     Settings → Lương → Nhóm Chính sách (F-PAY-POLICY-GROUP-01)
 * UC:         UC-G0-01 (List), UC-G0-02 (Create), UC-G0-03 (Update), UC-G0-04 (SoftDelete)
 * SRS:        SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md
 * TechSpec:   TECHSPEC_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md §3.4
 * Purpose:    Application layer — Business logic cho pay_policy_groups.
 *             SRP: chỉ xử lý nghiệp vụ nhóm CS; KHÔNG xử lý transport.
 * Coded:      2026-08-27
 * must_keep:  BR-G0-04 reserved codes; BR-G0-07 platform readonly; BR-G0-10 soft-delete only
 * must_keep:  BR-G0-11 xóa nhóm cascade null group_id trên pay_policies (trong transaction)
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../../common/api.exception';
import { HrmDbService } from '../../db/hrm-db.service';
import type { CreatePayPolicyGroupDto } from './dto/create-pay-policy-group.dto';
import type { UpdatePayPolicyGroupDto } from './dto/update-pay-policy-group.dto';

/** BR-G0-04: Các code này là platform-reserved, tenant không được dùng */
const RESERVED_PLATFORM_CODES = new Set(['LUONG', 'THUONG', 'GIA', 'PHAT', 'BHXH', 'THUE']);

export type PayPolicyGroupRow = {
  id: string;
  tenant_id: string;
  code: string;
  name_vi: string;
  icon: string | null;
  color_hex: string | null;
  sort_order: number;
  is_platform: boolean;
  is_active: boolean;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  active_policy_count: number;
};

@Injectable()
export class PayPolicyGroupService {
  constructor(private readonly db: HrmDbService) {}

  // ─── UC-G0-01: List ──────────────────────────────────────────────────────
  async findAll(tenantId: string, isActive?: boolean): Promise<PayPolicyGroupRow[]> {
    const params: unknown[] = [tenantId];
    let extraWhere = '';
    if (isActive !== undefined) {
      params.push(isActive);
      extraWhere = `AND ppg.is_active = $${params.length}`;
    }
    const { rows } = await this.db.query<PayPolicyGroupRow>(
      `
      SELECT
        ppg.id::text,
        ppg.tenant_id,
        ppg.code,
        ppg.name_vi,
        ppg.icon,
        ppg.color_hex,
        ppg.sort_order,
        ppg.is_platform,
        ppg.is_active,
        ppg.description,
        ppg.created_by,
        ppg.created_at::text,
        ppg.updated_at::text,
        COUNT(pp.id) FILTER (
          WHERE pp.status = 'ACTIVE' AND pp.deleted_at IS NULL
        )::int AS active_policy_count
      FROM pay_policy_groups ppg
      LEFT JOIN pay_policies pp ON pp.group_id = ppg.id
      WHERE (ppg.tenant_id = $1 OR ppg.is_platform = true)
        AND ppg.deleted_at IS NULL
        ${extraWhere}
      GROUP BY ppg.id
      ORDER BY ppg.is_platform DESC, ppg.sort_order ASC
      `,
      params,
    );
    return rows;
  }

  // ─── UC-G0-02: Check code unique (real-time) ────────────────────────────
  async checkCodeAvailable(
    code: string,
    tenantId: string,
  ): Promise<{ available: boolean; reason?: string }> {
    const upperCode = code.toUpperCase().trim();
    if (RESERVED_PLATFORM_CODES.has(upperCode)) {
      return { available: false, reason: 'Mã này thuộc nhóm hệ thống (reserved)' };
    }
    const { rows } = await this.db.query(
      `SELECT 1 FROM pay_policy_groups WHERE code=$1 AND tenant_id=$2 AND deleted_at IS NULL LIMIT 1`,
      [upperCode, tenantId],
    );
    return { available: rows.length === 0 };
  }

  // ─── UC-G0-02: Create ────────────────────────────────────────────────────
  async create(
    tenantId: string,
    dto: CreatePayPolicyGroupDto,
    userId: string,
  ): Promise<PayPolicyGroupRow> {
    // BR-G0-04: reserved codes
    if (RESERVED_PLATFORM_CODES.has(dto.code)) {
      throw new ApiException(
        'HRM-G0-CODE-RESERVED',
        'Mã nhóm này thuộc nhóm hệ thống, không thể sử dụng',
        HttpStatus.CONFLICT,
        { field: 'code' },
      );
    }
    // Unique check in tenant scope
    const { rows: existing } = await this.db.query(
      `SELECT 1 FROM pay_policy_groups WHERE code=$1 AND tenant_id=$2 AND deleted_at IS NULL LIMIT 1`,
      [dto.code, tenantId],
    );
    if (existing.length > 0) {
      throw new ApiException(
        'HRM-G0-CODE-DUPLICATE',
        'Mã nhóm đã tồn tại trong hệ thống của bạn',
        HttpStatus.CONFLICT,
        { field: 'code' },
      );
    }
    const { rows } = await this.db.query<PayPolicyGroupRow>(
      `
      INSERT INTO pay_policy_groups
        (tenant_id, code, name_vi, icon, color_hex, sort_order, is_platform, description, created_by, updated_by)
      VALUES
        ($1, $2, $3, $4, $5,
         COALESCE($6, (
           SELECT COALESCE(MAX(sort_order), 0) + 10
           FROM pay_policy_groups
           WHERE tenant_id=$1 AND deleted_at IS NULL
         )),
         false, $7, $8, $8)
      RETURNING
        id::text, tenant_id, code, name_vi, icon, color_hex, sort_order,
        is_platform, is_active, description, created_by, created_at::text, updated_at::text,
        0::int AS active_policy_count
      `,
      [
        tenantId, dto.code, dto.name_vi, dto.icon ?? null, dto.color_hex ?? null,
        dto.sort_order ?? null, dto.description ?? null, userId,
      ],
    );
    return rows[0];
  }

  // ─── UC-G0-03: Update ────────────────────────────────────────────────────
  async update(
    id: number,
    tenantId: string,
    dto: UpdatePayPolicyGroupDto,
    userId: string,
  ): Promise<PayPolicyGroupRow> {
    const group = await this._findById(id, tenantId);
    this._assertNotPlatform(group, 'sửa'); // BR-G0-07
    this._assertTenantOwnership(group, tenantId); // BR-G0-09

    // Build dynamic SET clause
    const setClauses: string[] = ['updated_at = NOW()', `updated_by = '${userId}'`];
    const params: unknown[] = [id, tenantId];
    let idx = 3;
    if (dto.name_vi !== undefined) { setClauses.push(`name_vi = $${idx++}`); params.push(dto.name_vi); }
    if (dto.icon !== undefined)    { setClauses.push(`icon = $${idx++}`); params.push(dto.icon); }
    if (dto.color_hex !== undefined){ setClauses.push(`color_hex = $${idx++}`); params.push(dto.color_hex); }
    if (dto.sort_order !== undefined){ setClauses.push(`sort_order = $${idx++}`); params.push(dto.sort_order); }
    if (dto.description !== undefined){ setClauses.push(`description = $${idx++}`); params.push(dto.description); }
    if (dto.is_active !== undefined){ setClauses.push(`is_active = $${idx++}`); params.push(dto.is_active); }

    const { rows } = await this.db.query<PayPolicyGroupRow>(
      `UPDATE pay_policy_groups
       SET ${setClauses.join(', ')}
       WHERE id=$1 AND tenant_id=$2 AND is_platform=false AND deleted_at IS NULL
       RETURNING
         id::text, tenant_id, code, name_vi, icon, color_hex, sort_order,
         is_platform, is_active, description, created_by, created_at::text, updated_at::text,
         0::int AS active_policy_count`,
      params,
    );
    if (!rows[0]) {
      throw new ApiException('HRM-G0-NOT-FOUND', 'Không tìm thấy nhóm chính sách', HttpStatus.NOT_FOUND);
    }
    return rows[0];
  }

  // ─── UC-G0-04: Soft delete ───────────────────────────────────────────────
  async remove(id: number, tenantId: string): Promise<void> {
    const group = await this._findById(id, tenantId);
    this._assertNotPlatform(group, 'xóa'); // BR-G0-12
    this._assertTenantOwnership(group, tenantId);

    // Transaction: soft-delete + cascade null group_id trên pay_policies (BR-G0-11)
    await this.db.withTransaction(async (query) => {
      const { rowCount } = await query(
        `UPDATE pay_policy_groups SET deleted_at=NOW(), updated_by=$2 WHERE id=$1 AND deleted_at IS NULL`,
        [id, tenantId],
      );
      if (!rowCount) {
        throw new ApiException('HRM-G0-NOT-FOUND', 'Không tìm thấy nhóm chính sách', HttpStatus.NOT_FOUND);
      }
      await query(
        `UPDATE pay_policies SET group_id=NULL WHERE group_id=$1 AND deleted_at IS NULL`,
        [id],
      );
    });
  }

  // ─── Internal helpers ────────────────────────────────────────────────────
  private async _findById(id: number, tenantId: string): Promise<PayPolicyGroupRow> {
    const { rows } = await this.db.query<PayPolicyGroupRow>(
      `SELECT id::text, tenant_id, code, name_vi, icon, color_hex, sort_order, is_platform, is_active, description, created_by, created_at::text, updated_at::text, 0::int AS active_policy_count
       FROM pay_policy_groups
       WHERE id=$1 AND (tenant_id=$2 OR is_platform=true) AND deleted_at IS NULL
       LIMIT 1`,
      [id, tenantId],
    );
    if (!rows[0]) {
      throw new ApiException('HRM-G0-NOT-FOUND', 'Không tìm thấy nhóm chính sách', HttpStatus.NOT_FOUND);
    }
    return rows[0];
  }

  /** BR-G0-07/BR-G0-12: Platform groups không thể sửa/xóa */
  private _assertNotPlatform(group: PayPolicyGroupRow, action: string): void {
    if (group.is_platform) {
      throw new ApiException(
        'HRM-G0-PLATFORM-READONLY',
        `Nhóm hệ thống không thể ${action}`,
        HttpStatus.FORBIDDEN,
      );
    }
  }

  /** BR-G0-09: Tenant chỉ thao tác nhóm của chính mình */
  private _assertTenantOwnership(group: PayPolicyGroupRow, tenantId: string): void {
    if (group.tenant_id !== tenantId) {
      throw new ApiException('HRM-AUTH-FORBIDDEN', 'Không có quyền thực hiện', HttpStatus.FORBIDDEN);
    }
  }
}