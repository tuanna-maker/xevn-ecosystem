# TechSpec — G0: Foundation — pay_policy_groups
**Phiên bản:** 1.0 | **Ngày:** 2026-08-27 | **Trạng thái:** DRAFT  
**Tham chiếu SRS:** `SRS_G0_FOUNDATION_PAY_POLICY_GROUPS_v1.md` (UC-G0-01..04)  
**Tham chiếu OS:** `25-SOLID-AND-CODING-CONVENTION.md` · `26-DEV-LANES-WEB-MOBILE-BE.md`  
**Stack:** NestJS · PostgreSQL · raw SQL (pg pool) · class-validator

---

## 1. DB SCHEMA

### 1.1 Bảng `pay_policy_groups`

```sql
CREATE TABLE IF NOT EXISTS public.pay_policy_groups (
  id              BIGSERIAL     PRIMARY KEY,
  tenant_id       TEXT          NOT NULL DEFAULT '',
  code            TEXT          NOT NULL,
  name_vi         TEXT          NOT NULL,
  icon            TEXT          NULL,
  color_hex       TEXT          NULL,
  sort_order      SMALLINT      NOT NULL DEFAULT 100,
  is_platform     BOOLEAN       NOT NULL DEFAULT false,
  is_active       BOOLEAN       NOT NULL DEFAULT true,
  description     TEXT          NULL,
  created_by      TEXT          NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_by      TEXT          NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ   NULL,
  -- Unique: code unique per (tenant_id + platform)
  CONSTRAINT uq_pay_policy_groups_code
    UNIQUE (code, tenant_id)
);

-- Index: list query nhanh per tenant
CREATE INDEX IF NOT EXISTS idx_pay_policy_groups_tenant
  ON public.pay_policy_groups (tenant_id, sort_order)
  WHERE deleted_at IS NULL;

-- Index: platform groups (shared)
CREATE INDEX IF NOT EXISTS idx_pay_policy_groups_platform
  ON public.pay_policy_groups (is_platform, sort_order)
  WHERE deleted_at IS NULL AND is_platform = true;
```

> **Ghi chú thiết kế:**  
> - `tenant_id = ''` cho platform groups (không thuộc tenant nào)  
> - `UNIQUE (code, tenant_id)` cho phép platform có code='LUONG' tenant_id='' và tenant có code='LUONG' tenant_id='T001' đồng thời — **KHÔNG** — xem BR-G0-04: tenant bị cấm dùng reserved codes  
> - Money: không có cột tiền trong bảng này (phù hợp)  
> - Soft-delete: `deleted_at TIMESTAMPTZ NULL`

### 1.2 Liên kết với bảng `pay_policies`

Migration bổ sung (thêm vào migration file mới, KHÔNG sửa migration cũ):

```sql
-- G0: Thêm group_id vào pay_policies để link sang pay_policy_groups
ALTER TABLE public.pay_policies
  ADD COLUMN IF NOT EXISTS group_id BIGINT NULL;

-- Giữ pay_group_code cũ (backward compat) — sẽ migrate data sau
-- group_id là FK logic (không FK vật lý cross-table để giữ soft-delete dễ xử lý)

CREATE INDEX IF NOT EXISTS idx_pay_policies_group
  ON public.pay_policies (group_id)
  WHERE deleted_at IS NULL AND group_id IS NOT NULL;
```

### 1.3 ERD

```
pay_policy_groups (id PK, tenant_id, code UNIQUE, is_platform, ...)
      │
      │ 1:N (group_id FK logic)
      ▼
pay_policies (id PK, tenant_id, group_id NULL→pay_policy_groups.id, ...)
```

---

## 2. SEED DATA (Idempotent)

File: `migrations/202608270012_g0_pay_policy_groups_seed.sql`

```sql
-- Migration 012: G0 — pay_policy_groups table + seed
-- Idempotent: CREATE IF NOT EXISTS + INSERT ON CONFLICT DO NOTHING

-- Step 1: Create table (script ở §1.1 trên)

-- Step 2: Add group_id to pay_policies (script ở §1.2 trên)

-- Step 3: Seed platform groups
INSERT INTO public.pay_policy_groups
  (tenant_id, code, name_vi, icon, color_hex, sort_order, is_platform, is_active, created_by)
VALUES
  ('', 'LUONG',  N'Lương',               '💰', '#10B981', 10, true, true, 'SYSTEM'),
  ('', 'THUONG', N'Thưởng',              '🏆', '#F59E0B', 20, true, true, 'SYSTEM'),
  ('', 'GIA',    N'Phụ cấp & Giá',       '🎁', '#3B82F6', 30, true, true, 'SYSTEM'),
  ('', 'PHAT',   N'Phạt & Khấu trừ',     '⚠️', '#EF4444', 40, true, true, 'SYSTEM'),
  ('', 'BHXH',   N'BHXH & BHYT',         '🏥', '#8B5CF6', 50, true, true, 'SYSTEM'),
  ('', 'THUE',   N'Thuế TNCN',           '📊', '#6B7280', 60, true, true, 'SYSTEM')
ON CONFLICT (code, tenant_id) DO NOTHING;
```

---

## 3. MODULE NESTJS

### 3.1 Cấu trúc file (SRP — mỗi file 1 trách nhiệm)

```
apps/api/hrm-api/src/payroll/
└── pay-policy-groups/
    ├── pay-policy-groups.module.ts         ← DI wiring
    ├── pay-policy-groups.controller.ts     ← Transport layer (parse input, auth guard, HTTP status)
    ├── pay-policy-groups.service.ts        ← Application layer (business logic, orchestrate)
    ├── pay-policy-groups.repository.ts     ← Infrastructure layer (raw SQL, pg pool)
    ├── dto/
    │   ├── create-pay-policy-group.dto.ts  ← class-validator
    │   ├── update-pay-policy-group.dto.ts
    │   └── query-pay-policy-group.dto.ts   ← filter/pagination
    ├── types/
    │   └── pay-policy-group.types.ts       ← TypeScript interfaces
    └── __tests__/
        └── pay-policy-groups.service.spec.ts
```

### 3.2 DTO (class-validator)

```typescript
// create-pay-policy-group.dto.ts
import { IsString, IsNotEmpty, Matches, MaxLength, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePayPolicyGroupDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã nhóm không được để trống' })
  @Matches(/^[A-Z0-9_]{2,30}$/, { message: 'Mã nhóm chỉ chứa A-Z, 0-9, gạch dưới, 2-30 ký tự' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  code: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @MaxLength(100)
  name_vi: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Màu phải là mã hex hợp lệ #RRGGBB' })
  color_hex?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sort_order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

// update-pay-policy-group.dto.ts (không có code — immutable)
export class UpdatePayPolicyGroupDto {
  @IsOptional() @IsString() @MaxLength(100) name_vi?: string;
  @IsOptional() @IsString() @MaxLength(10) icon?: string;
  @IsOptional() @IsString() @Matches(/^#[0-9A-Fa-f]{6}$/) color_hex?: string;
  @IsOptional() @IsNumber() @Min(1) sort_order?: number;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() is_active?: boolean;
}
```

### 3.3 Repository (raw SQL — Infrastructure layer)

```typescript
// pay-policy-groups.repository.ts
// @CODE-MEMORY UC: UC-G0-01..04 | SOLID: SRP (chỉ DB I/O)
import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PayPolicyGroupsRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(tenantId: string, isActive?: boolean): Promise<PayPolicyGroupRow[]> {
    const params: unknown[] = [tenantId];
    let where = `(tenant_id = $1 OR is_platform = true) AND deleted_at IS NULL`;
    if (isActive !== undefined) {
      params.push(isActive);
      where += ` AND is_active = $${params.length}`;
    }
    const { rows } = await this.pool.query<PayPolicyGroupRow>(`
      SELECT ppg.*,
             COUNT(pp.id) FILTER (WHERE pp.status = 'ACTIVE' AND pp.deleted_at IS NULL) AS active_policy_count
      FROM pay_policy_groups ppg
      LEFT JOIN pay_policies pp ON pp.group_id = ppg.id
      WHERE ${where}
      GROUP BY ppg.id
      ORDER BY ppg.is_platform DESC, ppg.sort_order ASC
    `, params);
    return rows;
  }

  async findByCode(code: string, tenantId: string): Promise<PayPolicyGroupRow | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM pay_policy_groups WHERE code=$1 AND (tenant_id=$2 OR is_platform=true) AND deleted_at IS NULL LIMIT 1`,
      [code, tenantId]
    );
    return rows[0] ?? null;
  }

  async findById(id: number, tenantId: string): Promise<PayPolicyGroupRow | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM pay_policy_groups WHERE id=$1 AND (tenant_id=$2 OR is_platform=true) AND deleted_at IS NULL LIMIT 1`,
      [id, tenantId]
    );
    return rows[0] ?? null;
  }

  async create(data: InsertPayPolicyGroupData): Promise<PayPolicyGroupRow> {
    const { rows } = await this.pool.query(`
      INSERT INTO pay_policy_groups (tenant_id, code, name_vi, icon, color_hex, sort_order, is_platform, description, created_by)
      VALUES ($1,$2,$3,$4,$5,
        COALESCE($6, (SELECT COALESCE(MAX(sort_order),0)+10 FROM pay_policy_groups WHERE tenant_id=$1 AND deleted_at IS NULL)),
        false,$7,$8)
      RETURNING *
    `, [data.tenantId, data.code, data.nameVi, data.icon, data.colorHex, data.sortOrder, data.description, data.createdBy]);
    return rows[0];
  }

  async update(id: number, tenantId: string, data: Partial<UpdatePayPolicyGroupData>): Promise<PayPolicyGroupRow> {
    const setClauses: string[] = ['updated_at = NOW()', 'updated_by = $3'];
    const params: unknown[] = [id, tenantId, data.updatedBy];
    let paramIdx = 4;
    if (data.nameVi !== undefined) { setClauses.push(`name_vi = $${paramIdx++}`); params.push(data.nameVi); }
    if (data.icon !== undefined)   { setClauses.push(`icon = $${paramIdx++}`); params.push(data.icon); }
    if (data.colorHex !== undefined) { setClauses.push(`color_hex = $${paramIdx++}`); params.push(data.colorHex); }
    if (data.sortOrder !== undefined) { setClauses.push(`sort_order = $${paramIdx++}`); params.push(data.sortOrder); }
    if (data.description !== undefined) { setClauses.push(`description = $${paramIdx++}`); params.push(data.description); }
    if (data.isActive !== undefined) { setClauses.push(`is_active = $${paramIdx++}`); params.push(data.isActive); }
    const { rows } = await this.pool.query(
      `UPDATE pay_policy_groups SET ${setClauses.join(', ')} WHERE id=$1 AND tenant_id=$2 AND is_platform=false AND deleted_at IS NULL RETURNING *`,
      params
    );
    return rows[0];
  }

  async softDelete(id: number, tenantId: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Soft delete group
      const { rowCount } = await client.query(
        `UPDATE pay_policy_groups SET deleted_at=NOW() WHERE id=$1 AND tenant_id=$2 AND is_platform=false AND deleted_at IS NULL`,
        [id, tenantId]
      );
      if (rowCount === 0) { await client.query('ROLLBACK'); return false; }
      // Ungroup policies (cascade null)
      await client.query(
        `UPDATE pay_policies SET group_id=NULL WHERE group_id=$1 AND deleted_at IS NULL`,
        [id]
      );
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
```

### 3.4 Service (Application layer — SRP: chỉ business logic)

```typescript
// pay-policy-groups.service.ts
// @CODE-MEMORY UC: UC-G0-01..04 | SOLID: SRP, OCP | ref_srs: SRS_G0 §UC-G0-01..04
@Injectable()
export class PayPolicyGroupsService {
  // Reserved codes — tenant không được dùng (BR-G0-04)
  private static readonly RESERVED_CODES = ['LUONG','THUONG','GIA','PHAT','BHXH','THUE'];

  constructor(private readonly repo: PayPolicyGroupsRepository) {}

  async findAll(tenantId: string, isActive?: boolean) {
    return this.repo.findAll(tenantId, isActive);
  }

  async checkCodeAvailable(code: string, tenantId: string): Promise<{ available: boolean }> {
    if (PayPolicyGroupsService.RESERVED_CODES.includes(code.toUpperCase())) {
      return { available: false };
    }
    const existing = await this.repo.findByCode(code, tenantId);
    return { available: !existing };
  }

  async create(tenantId: string, dto: CreatePayPolicyGroupDto, userId: string) {
    // BR-G0-04: check reserved
    if (PayPolicyGroupsService.RESERVED_CODES.includes(dto.code)) {
      throw new ConflictException({ code: 'HRM-G0-CODE-RESERVED', message: 'Mã nhóm này thuộc nhóm hệ thống, không thể sử dụng' });
    }
    // Check unique in tenant scope
    const existing = await this.repo.findByCode(dto.code, tenantId);
    if (existing) {
      throw new ConflictException({ code: 'HRM-G0-CODE-DUPLICATE', message: 'Mã nhóm đã tồn tại', field: 'code' });
    }
    return this.repo.create({ tenantId, code: dto.code, nameVi: dto.name_vi, icon: dto.icon, colorHex: dto.color_hex, sortOrder: dto.sort_order, description: dto.description, createdBy: userId });
  }

  async update(id: number, tenantId: string, dto: UpdatePayPolicyGroupDto, userId: string) {
    const group = await this.repo.findById(id, tenantId);
    if (!group) throw new NotFoundException({ code: 'HRM-G0-NOT-FOUND', message: 'Không tìm thấy nhóm chính sách' });
    // BR-G0-07: platform readonly
    if (group.is_platform) throw new ForbiddenException({ code: 'HRM-G0-PLATFORM-READONLY', message: 'Nhóm hệ thống không thể sửa' });
    // BR-G0-09: tenant scope
    if (group.tenant_id !== tenantId) throw new ForbiddenException({ code: 'HRM-AUTH-FORBIDDEN' });
    return this.repo.update(id, tenantId, { ...dto, updatedBy: userId });
  }

  async remove(id: number, tenantId: string) {
    const group = await this.repo.findById(id, tenantId);
    if (!group) throw new NotFoundException({ code: 'HRM-G0-NOT-FOUND' });
    if (group.is_platform) throw new ForbiddenException({ code: 'HRM-G0-PLATFORM-READONLY', message: 'Nhóm hệ thống không thể xóa' });
    if (group.tenant_id !== tenantId) throw new ForbiddenException({ code: 'HRM-AUTH-FORBIDDEN' });
    await this.repo.softDelete(id, tenantId);
    return { message: 'Xóa nhóm thành công' };
  }
}
```

### 3.5 Controller (Transport layer — RBAC)

```typescript
// pay-policy-groups.controller.ts
@Controller('api/hrm/pay-policy-groups')
@UseGuards(JwtAuthGuard, TenantGuard)
export class PayPolicyGroupsController {
  constructor(private readonly svc: PayPolicyGroupsService) {}

  @Get()
  findAll(@TenantId() tenantId: string, @Query() query: QueryPayPolicyGroupDto) {
    return this.svc.findAll(tenantId, query.is_active);
  }

  @Get('check-code')
  checkCode(@TenantId() tenantId: string, @Query('code') code: string) {
    return this.svc.checkCodeAvailable(code, tenantId);
  }

  @Post()
  @Roles('HR_ADMIN')
  @UseGuards(RolesGuard)
  create(@TenantId() tenantId: string, @Body() dto: CreatePayPolicyGroupDto, @UserId() userId: string) {
    return this.svc.create(tenantId, dto, userId);
  }

  @Put(':id')
  @Roles('HR_ADMIN')
  @UseGuards(RolesGuard)
  update(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: string, @Body() dto: UpdatePayPolicyGroupDto, @UserId() userId: string) {
    return this.svc.update(id, tenantId, dto, userId);
  }

  @Delete(':id')
  @Roles('HR_ADMIN')
  @UseGuards(RolesGuard)
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: string) {
    return this.svc.remove(id, tenantId);
  }
}
```

---

## 4. TRACEABILITY MATRIX (SRS → TechSpec)

| UC | Bước Diễn biến | Endpoint | Service Method | Bảng đọc | Bảng ghi | ref_srs |
|----|---------------|----------|----------------|----------|----------|---------|
| G0-01 | 4: Query DB | GET /pay-policy-groups | findAll() | pay_policy_groups, pay_policies | — | UC-G0-01 #4 |
| G0-02 | 6: Check unique | GET /check-code | checkCodeAvailable() | pay_policy_groups | — | UC-G0-02 #3 |
| G0-02 | 7: INSERT | POST /pay-policy-groups | create() | pay_policy_groups | pay_policy_groups | UC-G0-02 #7 |
| G0-03 | 6: UPDATE | PUT /pay-policy-groups/:id | update() | pay_policy_groups | pay_policy_groups | UC-G0-03 #6 |
| G0-04 | 7: Soft-delete | DELETE /pay-policy-groups/:id | remove() | pay_policy_groups | pay_policy_groups, pay_policies | UC-G0-04 #7,8 |

---

## 5. ERROR CODES

| Code | HTTP | Message (vi) | Trigger |
|------|------|-------------|---------|
| `HRM-G0-CODE-DUPLICATE` | 409 | Mã nhóm đã tồn tại | POST code trùng tenant |
| `HRM-G0-CODE-RESERVED` | 409 | Mã nhóm này thuộc nhóm hệ thống | POST code = LUONG/THUONG/GIA/PHAT/BHXH/THUE |
| `HRM-G0-CODE-INVALID` | 400 | Mã nhóm sai định dạng | POST code không match regex |
| `HRM-G0-NOT-FOUND` | 404 | Không tìm thấy nhóm chính sách | PUT/DELETE id không tồn tại |
| `HRM-G0-PLATFORM-READONLY` | 403 | Nhóm hệ thống không thể sửa/xóa | PUT/DELETE is_platform=true |
| `HRM-G0-PAGE-SIZE-EXCEEDED` | 400 | page_size tối đa 100 | GET page_size>100 |
| `HRM-AUTH-FORBIDDEN` | 403 | Không có quyền thực hiện | Tenant B thao tác data Tenant A |

---

## 6. TEST SPEC (Unit Test Checklist)

File: `pay-policy-groups.service.spec.ts`

- [ ] `findAll`: trả đúng data khi có cả platform + tenant groups
- [ ] `findAll`: filter is_active=true chỉ trả active groups
- [ ] `checkCodeAvailable`: LUONG → available=false (reserved)
- [ ] `checkCodeAvailable`: code mới → available=true
- [ ] `create`: success → gọi repo.create đúng params
- [ ] `create`: code reserved → throw ConflictException HRM-G0-CODE-RESERVED
- [ ] `create`: code duplicate → throw ConflictException HRM-G0-CODE-DUPLICATE
- [ ] `update`: platform group → throw ForbiddenException HRM-G0-PLATFORM-READONLY
- [ ] `update`: tenant mismatch → throw ForbiddenException
- [ ] `update`: success → gọi repo.update đúng params
- [ ] `remove`: platform group → throw ForbiddenException
- [ ] `remove`: not found → throw NotFoundException
- [ ] `remove`: success → gọi repo.softDelete + cascade null policies