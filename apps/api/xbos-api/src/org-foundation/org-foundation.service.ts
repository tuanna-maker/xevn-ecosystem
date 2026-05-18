import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { isMasterTenant, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../common/tenant.constants';
import { XbosDbService } from '../db/xbos-db.service';

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

  async listLegalEntities(tenantId: string, companyId: string) {
    const { rows } = await this.db.query(
      `SELECT * FROM public.xbos_legal_entity
       WHERE tenant_id = $1 AND company_id = $2 AND status <> 'deleted'
       ORDER BY name`,
      [tenantId, companyId],
    );
    return rows;
  }

  async upsertLegalEntity(tenantId: string, companyId: string, entityId: string | null, body: LegalEntityInput) {
    if (!body.code?.trim() || !body.name?.trim()) {
      throw new ApiException('XBOS-ORG-400', 'code and name are required', HttpStatus.BAD_REQUEST);
    }
    if (entityId) {
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
          tenantId,
          companyId,
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
        tenantId,
        companyId,
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

  async listOrgTree(tenantId: string, companyId: string) {
    if (isMasterTenant(tenantId)) {
      throw new ApiException(
        'XBOS-ORG-400',
        'Tenant master không có sơ đồ org riêng; dùng tenant-scope/group-org-overview',
        HttpStatus.BAD_REQUEST,
      );
    }
    const scopedCompany = companyId === 'all' || companyId === 'holding' ? MEMBER_DEFAULT_COMPANY_ID : companyId;
    const { rows } = await this.db.query(
      `WITH RECURSIVE tree AS (
        SELECT o.*, 0 AS depth, ARRAY[o.id] AS path
        FROM public.xbos_org_unit o
        WHERE o.tenant_id = $1 AND o.company_id = $2 AND o.parent_id IS NULL AND o.status <> 'deleted'
        UNION ALL
        SELECT c.*, t.depth + 1, t.path || c.id
        FROM public.xbos_org_unit c
        JOIN tree t ON c.parent_id = t.id
        WHERE c.status <> 'deleted'
      )
      SELECT * FROM tree ORDER BY path, sort_order, name`,
      [tenantId, scopedCompany],
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

  async upsertOrgUnit(tenantId: string, companyId: string, unitId: string | null, body: OrgUnitInput) {
    if (!body.code?.trim() || !body.name?.trim() || !body.orgType?.trim()) {
      throw new ApiException('XBOS-ORG-400', 'code, name, orgType are required', HttpStatus.BAD_REQUEST);
    }
    if (unitId) {
      const { rows } = await this.db.query(
        `UPDATE public.xbos_org_unit SET
          code = $4, name = $5, org_type = $6, parent_id = $7::uuid,
          legal_entity_id = $8::uuid, sort_order = COALESCE($9, sort_order),
          payload = COALESCE($10::jsonb, payload), updated_at = NOW()
         WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3
         RETURNING *`,
        [
          unitId,
          tenantId,
          companyId,
          body.code.trim(),
          body.name.trim(),
          body.orgType.trim(),
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
        tenantId,
        companyId,
        body.code.trim(),
        body.name.trim(),
        body.orgType.trim(),
        body.parentId ?? null,
        body.legalEntityId ?? null,
        body.sortOrder ?? 0,
        JSON.stringify(body.payload ?? {}),
      ],
    );
    return rows[0];
  }

  async deleteOrgUnit(tenantId: string, companyId: string, unitId: string) {
    const { rows } = await this.db.query(
      `UPDATE public.xbos_org_unit SET status = 'deleted', updated_at = NOW()
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 AND status <> 'deleted'
       RETURNING id`,
      [unitId, tenantId, companyId],
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
      entity_type: string;
      payload: Record<string, unknown> | null;
    }>(
      `SELECT t.tenant_id,
              t.name AS tenant_name,
              t.short_name AS tenant_short_name,
              le.id::text AS id,
              le.code,
              le.name,
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
