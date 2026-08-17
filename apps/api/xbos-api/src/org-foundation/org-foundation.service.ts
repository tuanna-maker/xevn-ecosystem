import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  XBOS_GROUP_LEGAL_HOLDING,
  XBOS_GROUP_OPERATING_MAIN,
} from '../common/xbos-group-legal-scope';
import {
  GROUP_HOLDING_ROOT_ID,
  isMasterTenant,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../common/tenant.constants';
import { XbosDbService } from '../db/xbos-db.service';

/**
 * @CODE-MEMORY
 * Screen: `/command-center/hrm/company` - màn Công ty / Company Management
 * UC: UC-HRM-CO-01
 * BR: BR-CO-LABEL-01
 * SRS: `docs/hrm/SRS.md` § UC-HRM-CO-01 · Data Interaction danh sách ĐVTV và hồ sơ pháp nhân
 * TechSpec: `docs/hrm/TECHSPEC.md` §20 · TS ngành nghề Company bind từ `business_lines`
 * Purpose: Service này chịu trách nhiệm đọc SoT pháp nhân XBOS cho các màn Command Center và HRM embed. Với luồng Company Management, dữ liệu `members[]` phải mang đủ tín hiệu hồ sơ pháp nhân để FE không suy diễn sai ngành nghề từ `entity_type`. Phần sửa của work item này chỉ bổ sung contract đọc `business_lines` cho danh sách ĐVTV, không đụng logic headcount Plane B.
 * WorkItem: D-HRM-CO-INDUSTRY-BE-01
 * Coded: 2026-07-27
 * Callers: `src/tenant-scope/tenant-scope.service.ts` -> `groupMemberUnits()`; `src/org-foundation/org-foundation.controller.ts`
 * Callees: `public.xbos_tenant_registry`; `public.xbos_legal_entity`
 * FEActions: Mở menu Công ty -> FE gọi `GET /api/xbos/tenant-scope/group-member-units` -> mapper dựng `members[]` -> bind cột "Ngành nghề"
 * BEChain: `TenantScopeController` -> `TenantScopeService.groupMemberUnits()` -> `OrgFoundationService.listGroupMemberUnits()` -> `xbos_tenant_registry` join `xbos_legal_entity`
 * Impact: Nếu bind sai sang `entity_type`, UI sẽ hiện `subsidiary` hoặc `holding` ở cột "Ngành nghề", làm sai nghiệp vụ và đánh lạc hướng QA. Nếu payload thiếu `business_lines`, FE buộc phải phụ thuộc vào enrich call thứ hai mới hiển thị đúng.
 * must_keep: Giữ nguyên contract hiện có của `holding`, `entity_type`, `payload` và không trộn với headcount `employee_count`. Không đổi semantics `entity_type`; chỉ dùng field đó cho phân loại pháp nhân.
 * SOLID: Tách responsibility đọc dữ liệu pháp nhân vào service XBOS để FE nhận contract rõ ràng, giảm logic suy diễn ở lớp trình bày.
 * LastVerified: `docs/qa/evidence/be-hrm-co-industry-01-20260727.md`
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-DEV-BE-DEPT-VAL-01
 * UC: UC-CC-P0-03 · TC-CC-P0-03-DEPT-ADD-FD-001
 * SRS/by-uc: `docs/qa/professional/by-uc/UC-CC-P0-03.md` · FN-DEPT-ADD FD empty mã/tên → 4xx
 * Purpose: Reject mã/tên phòng ban rỗng (sau trim) bằng `XBOS-VAL-014` HTTP 400 — không chấp nhận POST/PUT tạo org-unit trống; HP với mã hợp lệ vẫn `XBOS-ORG-201`.
 * must_keep: AU member 409 holding; happy CRUD dept; RACI/AUTH paths; scope partition legalEntityId.
 * Impact: Nếu bỏ check VAL-014, FE/API lại nhận 201 với mã/tên trống (R-W4E1-DEPT-EMPTY-201).
 * LastVerified: `docs/qa/evidence/po-uc-tc-w4-dev-be-dept-val-01.md`
 */
export type LegalEntityPartition = { tenantId: string; companyId: string };

export interface LegalEntityInput {
  code: string;
  name: string;
  entityType?: string;
  taxCode?: string;
  establishedAt?: string;
  address?: string;
  businessLines?: string;
  charterCapital?: number;
  legalRepresentative?: string;
  payload?: Record<string, unknown>;
}

export interface OrgUnitInput {
  code: string;
  name: string;
  orgType: string;
  parentId?: string | null;
  legalEntityId?: string | null;
  sortOrder?: number;
  payload?: Record<string, unknown>;
}

export type GroupOrgTreeEntry = {
  tenantId: string;
  name: string;
  tree: unknown[];
  /** Registry tenant slug when tree is keyed by legal-entity UUID (group overview role mapping). */
  memberTenantId?: string;
};

@Injectable()
export class OrgFoundationService {
  constructor(private readonly db: XbosDbService) {}

  /** Pháp nhân trong một tenant (mỗi tenant thành viên thường chỉ có company_id = main). */
  async listLegalEntityForTenant(tenantId: string) {
    const companyId = isMasterTenant(tenantId) ? MASTER_TENANT_ID : MEMBER_DEFAULT_COMPANY_ID;
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_legal_entity
       WHERE tenant_id = $1 AND company_id = $2 AND status <> 'deleted'`,
      [tenantId, companyId],
    );
    return rows;
  }

  /** Resolve persisted tenant/company for a legal-entity UUID (group CEO reads member rows). */
  async resolveLegalEntityPartition(entityId: string): Promise<LegalEntityPartition | null> {
    const id = entityId?.trim();
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return null;
    }
    const { rows } = await this.db.query<{ tenant_id: string; company_id: string }>(
      `SELECT tenant_id, company_id FROM public.xbos_legal_entity
       WHERE id = $1::uuid AND status IS DISTINCT FROM 'deleted'`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return { tenantId: String(row.tenant_id), companyId: String(row.company_id) };
  }

  async getLegalEntityById(entityId: string) {
    const partition = await this.resolveLegalEntityPartition(entityId);
    if (!partition) {
      throw new ApiException('XBOS-ORG-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
    }
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_legal_entity
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 AND status <> 'deleted'`,
      [entityId, partition.tenantId, partition.companyId],
    );
    if (!rows[0]) {
      throw new ApiException('XBOS-ORG-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
    }
    return rows[0];
  }

  async listLegalEntities(tenantId: string, companyId: string) {
    if (isMasterTenant(tenantId) && companyId === XBOS_GROUP_LEGAL_HOLDING) {
      const { rows } = await this.db.query(
        `SELECT * FROM public.xbos_legal_entity
         WHERE tenant_id = $1 AND company_id = $2 AND status <> 'deleted'
         ORDER BY name`,
        [tenantId, companyId],
      );
      return rows;
    }
    if (
      isMasterTenant(tenantId) &&
      (companyId === XBOS_GROUP_OPERATING_MAIN || companyId === MASTER_TENANT_ID)
    ) {
      return this.listGroupMemberLegalEntitiesFlat();
    }
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_legal_entity
       WHERE tenant_id = $1 AND company_id = $2 AND status <> 'deleted'
       ORDER BY name`,
      [tenantId, companyId],
    );
    return rows;
  }

  /** Flat member legal entities for Command Center / UC-CC-03 list on group CEO scope. */
  async listGroupMemberLegalEntitiesFlat() {
    const { rows } = await this.db.query(
      `SELECT le.*, t.name AS tenant_name, t.short_name AS tenant_short_name
       FROM public.xbos_tenant_registry t
       JOIN public.xbos_legal_entity le
         ON le.tenant_id = t.tenant_id AND le.company_id = t.default_company_id
       WHERE t.tenant_kind = 'member' AND t.status = 'active'
         AND le.status IS DISTINCT FROM 'deleted'
       ORDER BY t.name`,
    );
    return rows;
  }

  private normalizeLegalEntityBody(body: LegalEntityInput & Record<string, unknown>): LegalEntityInput {
    if (!body || typeof body !== 'object') {
      throw new ApiException('XBOS-ORG-400', 'Request body is required (HTTP 400)', HttpStatus.BAD_REQUEST);
    }
    const raw = body as Record<string, unknown>;
    const establishedRaw = body.establishedAt ?? (raw.established_at as string | undefined);
    const establishedAt =
      typeof establishedRaw === 'string' && establishedRaw.trim() ? establishedRaw.trim() : undefined;
    return {
      ...body,
      code: String(body.code ?? raw.code ?? '').trim(),
      name: String(body.name ?? raw.name ?? '').trim(),
      taxCode: body.taxCode ?? (raw.tax_code != null ? String(raw.tax_code) : undefined),
      establishedAt,
      charterCapital:
        body.charterCapital ??
        (raw.charter_capital != null ? Number(raw.charter_capital) : undefined),
      legalRepresentative: body.legalRepresentative ?? (raw.legal_representative as string | undefined),
    };
  }

  private validateLegalEntityInput(body: LegalEntityInput) {
    if (!body.code?.trim() || !body.name?.trim()) {
      throw new ApiException('XBOS-ORG-400', 'Tên pháp nhân và mã code là bắt buộc (HTTP 400)', HttpStatus.BAD_REQUEST);
    }
    const tax = body.taxCode?.trim();
    if (tax && !/^\d{10,13}$/.test(tax)) {
      throw new ApiException('XBOS-ORG-400', 'Mã số thuế không hợp lệ (HTTP 400)', HttpStatus.BAD_REQUEST);
    }
    if (body.charterCapital != null && Number(body.charterCapital) < 0) {
      throw new ApiException('XBOS-ORG-400', 'Vốn điều lệ không hợp lệ (HTTP 400)', HttpStatus.BAD_REQUEST);
    }
  }

  async upsertLegalEntity(tenantId: string, companyId: string, entityId: string | null, body: LegalEntityInput) {
    const normalized = this.normalizeLegalEntityBody(body as LegalEntityInput & Record<string, unknown>);
    this.validateLegalEntityInput(normalized);
    body = normalized;
    let targetTenantId = tenantId;
    let targetCompanyId = companyId;
    if (entityId) {
      const partition = await this.resolveLegalEntityPartition(entityId);
      if (!partition) {
        throw new ApiException('XBOS-ORG-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
      }
      targetTenantId = partition.tenantId;
      targetCompanyId = partition.companyId;
      const { rows } = await this.db.query(
        `UPDATE public.xbos_legal_entity SET
          code = $4, name = $5, entity_type = COALESCE($6, entity_type),
          tax_code = $7, established_at = $8::date, address = $9, business_lines = $10,
          charter_capital = $11, legal_representative = $12,
          payload = COALESCE($13, payload), updated_at = NOW()
         WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3
         RETURNING *`,
        [
          entityId,
          targetTenantId,
          targetCompanyId,
          body.code.trim(),
          body.name.trim(),
          body.entityType ?? null,
          body.taxCode ?? null,
          body.establishedAt ?? null,
          body.address ?? null,
          body.businessLines ?? null,
          body.charterCapital ?? null,
          body.legalRepresentative ?? null,
          body.payload ? JSON.stringify(body.payload) : null,
        ],
      );
      if (!rows[0]) throw new ApiException('XBOS-ORG-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
      return rows[0];
    }
    const { rows } = await this.db.query(
      `INSERT INTO public.xbos_legal_entity (
        tenant_id, company_id, code, name, entity_type, tax_code, established_at,
        address, business_lines, charter_capital, legal_representative, payload
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::date,$8,$9,$10,$11,$12::jsonb)
      RETURNING *`,
      [
        targetTenantId,
        targetCompanyId,
        body.code.trim(),
        body.name.trim(),
        body.entityType ?? 'subsidiary',
        body.taxCode ?? null,
        body.establishedAt ?? null,
        body.address ?? null,
        body.businessLines ?? null,
        body.charterCapital ?? null,
        body.legalRepresentative ?? null,
        JSON.stringify(body.payload ?? {}),
      ],
    );
    return rows[0];
  }

  /**
   * UC-XBOS-ORG-01 — member tenant org tree; master tenant returns aggregated member trees (ADR group-org-overview).
   */
  async listOrgTree(tenantId: string, companyId: string, userId?: string) {
    if (isMasterTenant(tenantId)) {
      const resolvedUser = (userId ?? '').trim();
      if (!resolvedUser) {
        throw new ApiException(
          'XBOS-ORG-400',
          'Tenant master không có sơ đồ org riêng; cần userId từ JWT hoặc dùng tenant-scope/group-org-overview',
          HttpStatus.BAD_REQUEST,
        );
      }
      return this.listGroupOrgTreesForUser(resolvedUser);
    }
    return this.listMemberOrgTree(tenantId, companyId);
  }

  /** Aggregated org trees for group CEO on master tenant (same data plane as tenant-scope/group-org-overview). */
  async listGroupOrgTreesForUser(_userId: string): Promise<GroupOrgTreeEntry[]> {
    const trees: GroupOrgTreeEntry[] = [];

    const { rows: holdingLegalRows } = await this.db.query<{
      id: string;
      name: string;
    }>(
      `SELECT le.id::text AS id, le.name
       FROM public.xbos_legal_entity le
       WHERE le.tenant_id = $1
         AND le.company_id = $2
         AND le.status IS DISTINCT FROM 'deleted'
       ORDER BY CASE WHEN le.entity_type = 'holding' THEN 0 ELSE 1 END, le.name`,
      [MASTER_TENANT_ID, XBOS_GROUP_LEGAL_HOLDING],
    );
    if (holdingLegalRows.length > 0) {
      const { rows: tenantRows } = await this.db.query<{ name: string }>(
        `SELECT name FROM public.xbos_tenant_registry
         WHERE tenant_id = $1 AND status = 'active' LIMIT 1`,
        [MASTER_TENANT_ID],
      );
      const holdingDisplayName =
        holdingLegalRows.find((row) => row.name?.trim())?.name ??
        tenantRows[0]?.name ??
        'Tập đoàn XeVN';
      const holdingLegalIds = holdingLegalRows.map((row) => String(row.id));
      trees.push({
        tenantId: GROUP_HOLDING_ROOT_ID,
        name: String(holdingDisplayName),
        tree: await this.listMemberOrgTree(
          MASTER_TENANT_ID,
          XBOS_GROUP_LEGAL_HOLDING,
          holdingLegalIds,
          true,
        ),
      });
    }

    const { rows: members } = await this.db.query<{
      tenant_id: string;
      tenant_name: string;
      id: string;
      name: string;
    }>(
      `SELECT t.tenant_id,
              t.name AS tenant_name,
              le.id::text AS id,
              le.name
       FROM public.xbos_tenant_registry t
       JOIN public.xbos_legal_entity le ON (
         (le.tenant_id = t.tenant_id AND le.company_id = t.default_company_id)
         OR (le.tenant_id = $1 AND le.company_id = t.tenant_id)
       )
       WHERE t.tenant_kind = 'member' AND t.status = 'active'
         AND le.status IS DISTINCT FROM 'deleted'
         AND le.entity_type IS DISTINCT FROM 'holding'
       ORDER BY t.name`,
      [MASTER_TENANT_ID],
    );

    for (const member of members) {
      const memberTenantId = String(member.tenant_id);
      trees.push({
        tenantId: String(member.id),
        name: String(member.name),
        memberTenantId,
        tree: await this.listMemberOrgTree(memberTenantId, memberTenantId, String(member.id)),
      });
    }

    return trees;
  }

  private resolveOrgUnitCompanyPartitions(tenantId: string, companyId: string): string[] {
    const normalized = companyId.trim().toLowerCase();
    if (isMasterTenant(tenantId)) {
      if (
        normalized === 'all' ||
        normalized === XBOS_GROUP_LEGAL_HOLDING ||
        normalized === XBOS_GROUP_OPERATING_MAIN ||
        normalized === MASTER_TENANT_ID
      ) {
        return [XBOS_GROUP_LEGAL_HOLDING, XBOS_GROUP_OPERATING_MAIN];
      }
      return [companyId];
    }
    if (normalized === 'all' || normalized === XBOS_GROUP_LEGAL_HOLDING) {
      return [MEMBER_DEFAULT_COMPANY_ID];
    }
    return [companyId];
  }

  private async listMemberOrgTree(
    tenantId: string,
    companyId: string,
    legalEntityIds?: string | string[] | null,
    includeUnlinkedMasterUnits = false,
  ) {
    const resolvedLegalEntityIds = this.normalizeLegalEntityIds(legalEntityIds);
    if (resolvedLegalEntityIds.length > 0) {
      return this.listOrgTreeByLegalEntity(
        tenantId,
        companyId,
        resolvedLegalEntityIds,
        includeUnlinkedMasterUnits,
      );
    }

    const companyIds = this.resolveOrgUnitCompanyPartitions(tenantId, companyId);
    const { rows } = await this.db.query(
      `WITH RECURSIVE tree AS (
        SELECT o.*, 0 AS depth, ARRAY[o.id] AS path
        FROM public.xbos_org_unit o
        WHERE o.tenant_id = $1
          AND o.company_id = ANY($2::text[])
          AND o.parent_id IS NULL
          AND o.status <> 'deleted'
        UNION ALL
        SELECT c.*, t.depth + 1, t.path || c.id
        FROM public.xbos_org_unit c
        JOIN tree t ON c.parent_id = t.id
        WHERE c.status <> 'deleted'
      )
      SELECT * FROM tree ORDER BY path, sort_order, name`,
      [tenantId, companyIds],
    );
    return this.buildTree(rows as Array<Record<string, unknown>>);
  }

  private normalizeLegalEntityIds(legalEntityIds?: string | string[] | null): string[] {
    if (Array.isArray(legalEntityIds)) {
      return [...new Set(legalEntityIds.map((id) => id.trim()).filter(Boolean))];
    }
    const single = legalEntityIds?.trim();
    return single ? [single] : [];
  }

  /** Org units for one or more legal entities — main/holding partitions on master + legacy member slug + member tenant. */
  private async listOrgTreeByLegalEntity(
    tenantId: string,
    companyId: string,
    legalEntityIds: string[],
    includeUnlinkedMasterUnits = false,
  ) {
    const legacyMasterCompanyId = isMasterTenant(tenantId) ? companyId : tenantId;
    const masterCompanyIds = [XBOS_GROUP_OPERATING_MAIN, XBOS_GROUP_LEGAL_HOLDING];
    if (
      !masterCompanyIds.includes(legacyMasterCompanyId) &&
      isMasterTenant(MASTER_TENANT_ID) &&
      legacyMasterCompanyId !== MASTER_TENANT_ID
    ) {
      masterCompanyIds.push(legacyMasterCompanyId);
    }

    const unlinkedClause = includeUnlinkedMasterUnits
      ? `OR (
              o.legal_entity_id IS NULL
              AND o.tenant_id = $2
              AND o.company_id = ANY($3::text[])
            )`
      : '';

    const { rows } = await this.db.query(
      `WITH RECURSIVE roots AS (
        SELECT o.id
        FROM public.xbos_org_unit o
        WHERE o.status <> 'deleted'
          AND o.parent_id IS NULL
          AND (
            (
              o.legal_entity_id = ANY($1::uuid[])
              AND (
                (o.tenant_id = $2 AND o.company_id = ANY($3::text[]))
                OR (o.tenant_id = $4 AND o.company_id = $5)
                OR (o.tenant_id = $2 AND o.company_id = $6)
              )
            )
            ${unlinkedClause}
          )
      ),
      tree AS (
        SELECT o.*, 0 AS depth, ARRAY[o.id] AS path
        FROM public.xbos_org_unit o
        JOIN roots r ON r.id = o.id
        UNION ALL
        SELECT c.*, t.depth + 1, t.path || c.id
        FROM public.xbos_org_unit c
        JOIN tree t ON c.parent_id = t.id
        WHERE c.status <> 'deleted'
      )
      SELECT * FROM tree ORDER BY path, sort_order, name`,
      [
        legalEntityIds,
        MASTER_TENANT_ID,
        masterCompanyIds,
        tenantId,
        MEMBER_DEFAULT_COMPANY_ID,
        legacyMasterCompanyId,
      ],
    );
    return this.buildTree(rows as Array<Record<string, unknown>>);
  }

  private buildTree(flat: Array<Record<string, unknown>>) {
    const byId = new Map<string, Record<string, unknown>>();
    const roots: Record<string, unknown>[] = [];
    for (const row of flat) {
      byId.set(String(row.id), { ...row, children: [] as Record<string, unknown>[] });
    }
    for (const row of flat) {
      const node = byId.get(String(row.id))!;
      const parentId = row.parent_id as string | null;
      if (parentId && byId.has(parentId)) {
        (byId.get(parentId)!.children as Record<string, unknown>[]).push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  /**
   * Org units for a legal entity persist under that entity's tenant partition so list/get tree parity holds
   * (UF-XBOS-12 — group CEO POST with legalEntityId must appear on GET tree for member entity).
   */
  async resolveOrgUnitPersistScope(
    tenantId: string,
    companyId: string,
    legalEntityId?: string | null,
  ): Promise<{ tenantId: string; companyId: string }> {
    const entityId = legalEntityId?.trim();
    if (!entityId) {
      return { tenantId, companyId };
    }
    const partition = await this.resolveLegalEntityPartition(entityId);
    if (!partition) {
      return { tenantId, companyId };
    }
    if (isMasterTenant(partition.tenantId)) {
      const normalizedCompany = partition.companyId.trim().toLowerCase();
      return {
        tenantId: partition.tenantId,
        companyId:
          normalizedCompany === XBOS_GROUP_OPERATING_MAIN
            ? XBOS_GROUP_LEGAL_HOLDING
            : partition.companyId,
      };
    }
    return {
      tenantId: partition.tenantId,
      companyId: MEMBER_DEFAULT_COMPANY_ID,
    };
  }

  /** Flat org tree scoped to one legal entity (F5 reload after member org-unit mutate). */
  async listOrgTreeForLegalEntity(legalEntityId: string) {
    const partition = await this.resolveLegalEntityPartition(legalEntityId);
    if (!partition) {
      throw new ApiException('XBOS-ORG-404', 'Legal entity not found', HttpStatus.NOT_FOUND);
    }
    return this.listMemberOrgTree(partition.tenantId, partition.companyId, legalEntityId.trim());
  }

  async upsertOrgUnit(tenantId: string, companyId: string, unitId: string | null, body: OrgUnitInput) {
    // UC-CC-P0-03 FD — mã/tên phòng ban bắt buộc (trim); mã lỗi ổn định XBOS-VAL-014
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const orgType = typeof body.orgType === 'string' ? body.orgType.trim() : '';
    if (!code || !name) {
      throw new ApiException(
        'XBOS-VAL-014',
        'Mã và tên phòng ban là bắt buộc',
        HttpStatus.BAD_REQUEST,
        { fields: { code: Boolean(code), name: Boolean(name) } },
      );
    }
    if (!orgType) {
      throw new ApiException(
        'XBOS-VAL-014',
        'Loại đơn vị tổ chức (orgType) là bắt buộc',
        HttpStatus.BAD_REQUEST,
        { fields: { orgType: false } },
      );
    }
    const persistScope = await this.resolveOrgUnitPersistScope(tenantId, companyId, body.legalEntityId);
    let persistTenantId = persistScope.tenantId;
    let persistCompanyId = persistScope.companyId;
    if (unitId) {
      const existing = await this.db.query<{ tenant_id: string; company_id: string }>(
        `SELECT tenant_id, company_id FROM public.xbos_org_unit
         WHERE id = $1::uuid AND status <> 'deleted' LIMIT 1`,
        [unitId],
      );
      if (existing.rows[0]) {
        persistTenantId = String(existing.rows[0].tenant_id);
        persistCompanyId = String(existing.rows[0].company_id);
      }
      const { rows } = await this.db.query(
        `UPDATE public.xbos_org_unit SET
          code = $4, name = $5, org_type = $6, parent_id = $7::uuid,
          legal_entity_id = $8::uuid, sort_order = COALESCE($9, sort_order),
          payload = COALESCE($10::jsonb, payload), updated_at = NOW()
         WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3
         RETURNING *`,
        [
          unitId,
          persistTenantId,
          persistCompanyId,
          code,
          name,
          orgType,
          body.parentId ?? null,
          body.legalEntityId ?? null,
          body.sortOrder ?? null,
          body.payload ? JSON.stringify(body.payload) : null,
        ],
      );
      if (!rows[0]) throw new ApiException('XBOS-ORG-404', 'Org unit not found', HttpStatus.NOT_FOUND);
      return rows[0];
    }
    const { rows } = await this.db.query(
      `INSERT INTO public.xbos_org_unit (
        tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload
      ) VALUES ($1,$2,$3,$4,$5,$6::uuid,$7::uuid,$8,$9::jsonb)
      RETURNING *`,
      [
        persistTenantId,
        persistCompanyId,
        code,
        name,
        orgType,
        body.parentId ?? null,
        body.legalEntityId ?? null,
        body.sortOrder ?? 0,
        JSON.stringify(body.payload ?? {}),
      ],
    );
    return rows[0];
  }

  async deleteOrgUnit(tenantId: string, companyId: string, unitId: string) {
    const existing = await this.db.query<{ tenant_id: string; company_id: string }>(
      `SELECT tenant_id, company_id FROM public.xbos_org_unit
       WHERE id = $1::uuid AND status <> 'deleted' LIMIT 1`,
      [unitId],
    );
    const row = existing.rows[0];
    const deleteTenantId = row ? String(row.tenant_id) : tenantId;
    const deleteCompanyId = row ? String(row.company_id) : companyId;
    const { rows } = await this.db.query(
      `UPDATE public.xbos_org_unit SET status = 'deleted', updated_at = NOW()
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 AND status <> 'deleted'
       RETURNING id`,
      [unitId, deleteTenantId, deleteCompanyId],
    );
    if (!rows[0]) {
      throw new ApiException('XBOS-ORG-404', 'Org unit not found', HttpStatus.NOT_FOUND);
    }
    return { deleted: true };
  }

  async promoteSegment(tenantId: string, companyId: string, segmentId: string, legalEntityBody: LegalEntityInput) {
    const { rows: segRows } = await this.db.query(
      `SELECT * FROM public.xbos_org_unit
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 AND org_type = 'segment' AND status <> 'deleted'`,
      [segmentId, tenantId, companyId],
    );
    const segment = segRows[0] as Record<string, unknown> | undefined;
    if (!segment) {
      throw new ApiException('XBOS-ORG-404', 'Business segment not found', HttpStatus.NOT_FOUND);
    }
    const entity = await this.upsertLegalEntity(tenantId, companyId, null, {
      ...legalEntityBody,
      name: legalEntityBody.name || String(segment.name),
      code: legalEntityBody.code || String(segment.code),
    });
    const entityId = String((entity as Record<string, unknown>).id);
    await this.db.query(
      `UPDATE public.xbos_org_unit SET org_type = 'subsidiary', legal_entity_id = $4::uuid, updated_at = NOW()
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3`,
      [segmentId, tenantId, companyId, entityId],
    );
    return { segmentId, legalEntity: entity };
  }

  /**
   * Danh sách phẳng cho Command Center — tập đoàn (tenant master) + pháp nhân gốc mỗi tenant thành viên
   * (dữ liệu từ seed org / Excel → JSON → DB).
   */
  async listGroupMemberUnits() {
    const { rows: masterRows } = await this.db.query<{
      tenant_id: string;
      name: string;
      short_name: string;
    }>(
      `SELECT tenant_id, name, short_name
       FROM public.xbos_tenant_registry
       WHERE tenant_kind = 'master' AND status = 'active'
       ORDER BY CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END
       LIMIT 1`,
      [MASTER_TENANT_ID],
    );
    const holding = masterRows[0] ?? null;

    const { rows: members } = await this.db.query<{
      tenant_id: string;
      tenant_name: string;
      tenant_short_name: string;
      id: string;
      code: string;
      name: string;
      business_lines: string | null;
      entity_type: string;
      payload: Record<string, unknown> | null;
    }>(
      `SELECT t.tenant_id,
              t.name AS tenant_name,
              t.short_name AS tenant_short_name,
              le.id::text AS id,
              le.code,
              le.name,
              le.business_lines,
              le.entity_type,
              le.payload
       FROM public.xbos_tenant_registry t
       JOIN public.xbos_legal_entity le
         ON le.tenant_id = t.tenant_id AND le.company_id = t.default_company_id
       WHERE t.tenant_kind = 'member' AND t.status = 'active'
         AND le.status IS DISTINCT FROM 'deleted'
       ORDER BY t.name`,
    );

    return { holding, members };
  }
}
