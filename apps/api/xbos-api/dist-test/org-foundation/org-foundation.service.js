"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgFoundationService = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const xbos_group_legal_scope_1 = require("../common/xbos-group-legal-scope");
const tenant_constants_1 = require("../common/tenant.constants");
const xbos_db_service_1 = require("../db/xbos-db.service");
let OrgFoundationService = class OrgFoundationService {
    db;
    constructor(db) {
        this.db = db;
    }
    /** Pháp nhân trong một tenant (mỗi tenant thành viên thường chỉ có company_id = main). */
    async listLegalEntityForTenant(tenantId) {
        const companyId = (0, tenant_constants_1.isMasterTenant)(tenantId) ? tenant_constants_1.MASTER_TENANT_ID : tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID;
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_legal_entity
       WHERE tenant_id = $1 AND company_id = $2 AND status <> 'deleted'`, [tenantId, companyId]);
        return rows;
    }
    /** Resolve persisted tenant/company for a legal-entity UUID (group CEO reads member rows). */
    async resolveLegalEntityPartition(entityId) {
        const id = entityId?.trim();
        if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
            return null;
        }
        const { rows } = await this.db.query(`SELECT tenant_id, company_id FROM public.xbos_legal_entity
       WHERE id = $1::uuid AND status IS DISTINCT FROM 'deleted'`, [id]);
        const row = rows[0];
        if (!row) {
            return null;
        }
        return { tenantId: String(row.tenant_id), companyId: String(row.company_id) };
    }
    async getLegalEntityById(entityId) {
        const partition = await this.resolveLegalEntityPartition(entityId);
        if (!partition) {
            throw new api_exception_1.ApiException('XBOS-ORG-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
        }
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_legal_entity
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 AND status <> 'deleted'`, [entityId, partition.tenantId, partition.companyId]);
        if (!rows[0]) {
            throw new api_exception_1.ApiException('XBOS-ORG-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
        }
        return rows[0];
    }
    async listLegalEntities(tenantId, companyId) {
        if ((0, tenant_constants_1.isMasterTenant)(tenantId) && companyId === xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING) {
            const { rows } = await this.db.query(`SELECT * FROM public.xbos_legal_entity
         WHERE tenant_id = $1 AND company_id = $2 AND status <> 'deleted'
         ORDER BY name`, [tenantId, companyId]);
            return rows;
        }
        if ((0, tenant_constants_1.isMasterTenant)(tenantId) &&
            (companyId === xbos_group_legal_scope_1.XBOS_GROUP_OPERATING_MAIN || companyId === tenant_constants_1.MASTER_TENANT_ID)) {
            return this.listGroupMemberLegalEntitiesFlat();
        }
        const { rows } = await this.db.query(`SELECT * FROM public.xbos_legal_entity
       WHERE tenant_id = $1 AND company_id = $2 AND status <> 'deleted'
       ORDER BY name`, [tenantId, companyId]);
        return rows;
    }
    /** Flat member legal entities for Command Center / UC-CC-03 list on group CEO scope. */
    async listGroupMemberLegalEntitiesFlat() {
        const { rows } = await this.db.query(`SELECT le.*, t.name AS tenant_name, t.short_name AS tenant_short_name
       FROM public.xbos_tenant_registry t
       JOIN public.xbos_legal_entity le
         ON le.tenant_id = t.tenant_id AND le.company_id = t.default_company_id
       WHERE t.tenant_kind = 'member' AND t.status = 'active'
         AND le.status IS DISTINCT FROM 'deleted'
       ORDER BY t.name`);
        return rows;
    }
    normalizeLegalEntityBody(body) {
        if (!body || typeof body !== 'object') {
            throw new api_exception_1.ApiException('XBOS-ORG-400', 'Request body is required (HTTP 400)', common_1.HttpStatus.BAD_REQUEST);
        }
        const raw = body;
        const establishedRaw = body.establishedAt ?? raw.established_at;
        const establishedAt = typeof establishedRaw === 'string' && establishedRaw.trim() ? establishedRaw.trim() : undefined;
        return {
            ...body,
            code: String(body.code ?? raw.code ?? '').trim(),
            name: String(body.name ?? raw.name ?? '').trim(),
            taxCode: body.taxCode ?? (raw.tax_code != null ? String(raw.tax_code) : undefined),
            establishedAt,
            charterCapital: body.charterCapital ??
                (raw.charter_capital != null ? Number(raw.charter_capital) : undefined),
            legalRepresentative: body.legalRepresentative ?? raw.legal_representative,
        };
    }
    validateLegalEntityInput(body) {
        if (!body.code?.trim() || !body.name?.trim()) {
            throw new api_exception_1.ApiException('XBOS-ORG-400', 'Tên pháp nhân và mã code là bắt buộc (HTTP 400)', common_1.HttpStatus.BAD_REQUEST);
        }
        const tax = body.taxCode?.trim();
        if (tax && !/^\d{10,13}$/.test(tax)) {
            throw new api_exception_1.ApiException('XBOS-ORG-400', 'Mã số thuế không hợp lệ (HTTP 400)', common_1.HttpStatus.BAD_REQUEST);
        }
        if (body.charterCapital != null && Number(body.charterCapital) < 0) {
            throw new api_exception_1.ApiException('XBOS-ORG-400', 'Vốn điều lệ không hợp lệ (HTTP 400)', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async upsertLegalEntity(tenantId, companyId, entityId, body) {
        const normalized = this.normalizeLegalEntityBody(body);
        this.validateLegalEntityInput(normalized);
        body = normalized;
        let targetTenantId = tenantId;
        let targetCompanyId = companyId;
        if (entityId) {
            const partition = await this.resolveLegalEntityPartition(entityId);
            if (!partition) {
                throw new api_exception_1.ApiException('XBOS-ORG-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
            }
            targetTenantId = partition.tenantId;
            targetCompanyId = partition.companyId;
            const { rows } = await this.db.query(`UPDATE public.xbos_legal_entity SET
          code = $4, name = $5, entity_type = COALESCE($6, entity_type),
          tax_code = $7, established_at = $8::date, address = $9, business_lines = $10,
          charter_capital = $11, legal_representative = $12,
          payload = COALESCE($13, payload), updated_at = NOW()
         WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3
         RETURNING *`, [
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
            ]);
            if (!rows[0])
                throw new api_exception_1.ApiException('XBOS-ORG-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
            return rows[0];
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_legal_entity (
        tenant_id, company_id, code, name, entity_type, tax_code, established_at,
        address, business_lines, charter_capital, legal_representative, payload
      ) VALUES ($1,$2,$3,$4,$5,$6,$7::date,$8,$9,$10,$11,$12::jsonb)
      RETURNING *`, [
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
        ]);
        return rows[0];
    }
    /**
     * UC-XBOS-ORG-01 — member tenant org tree; master tenant returns aggregated member trees (ADR group-org-overview).
     */
    async listOrgTree(tenantId, companyId, userId) {
        if ((0, tenant_constants_1.isMasterTenant)(tenantId)) {
            const resolvedUser = (userId ?? '').trim();
            if (!resolvedUser) {
                throw new api_exception_1.ApiException('XBOS-ORG-400', 'Tenant master không có sơ đồ org riêng; cần userId từ JWT hoặc dùng tenant-scope/group-org-overview', common_1.HttpStatus.BAD_REQUEST);
            }
            return this.listGroupOrgTreesForUser(resolvedUser);
        }
        return this.listMemberOrgTree(tenantId, companyId);
    }
    /** Aggregated org trees for group CEO on master tenant (same data plane as tenant-scope/group-org-overview). */
    async listGroupOrgTreesForUser(_userId) {
        const trees = [];
        const { rows: holdingLegalRows } = await this.db.query(`SELECT le.id::text AS id, le.name
       FROM public.xbos_legal_entity le
       WHERE le.tenant_id = $1
         AND le.company_id = $2
         AND le.status IS DISTINCT FROM 'deleted'
       ORDER BY CASE WHEN le.entity_type = 'holding' THEN 0 ELSE 1 END, le.name`, [tenant_constants_1.MASTER_TENANT_ID, xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING]);
        if (holdingLegalRows.length > 0) {
            const { rows: tenantRows } = await this.db.query(`SELECT name FROM public.xbos_tenant_registry
         WHERE tenant_id = $1 AND status = 'active' LIMIT 1`, [tenant_constants_1.MASTER_TENANT_ID]);
            const holdingDisplayName = holdingLegalRows.find((row) => row.name?.trim())?.name ??
                tenantRows[0]?.name ??
                'Tập đoàn XeVN';
            const holdingLegalIds = holdingLegalRows.map((row) => String(row.id));
            trees.push({
                tenantId: tenant_constants_1.GROUP_HOLDING_ROOT_ID,
                name: String(holdingDisplayName),
                tree: await this.listMemberOrgTree(tenant_constants_1.MASTER_TENANT_ID, xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING, holdingLegalIds, true),
            });
        }
        const { rows: members } = await this.db.query(`SELECT t.tenant_id,
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
       ORDER BY t.name`, [tenant_constants_1.MASTER_TENANT_ID]);
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
    resolveOrgUnitCompanyPartitions(tenantId, companyId) {
        const normalized = companyId.trim().toLowerCase();
        if ((0, tenant_constants_1.isMasterTenant)(tenantId)) {
            if (normalized === 'all' ||
                normalized === xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING ||
                normalized === xbos_group_legal_scope_1.XBOS_GROUP_OPERATING_MAIN ||
                normalized === tenant_constants_1.MASTER_TENANT_ID) {
                return [xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING, xbos_group_legal_scope_1.XBOS_GROUP_OPERATING_MAIN];
            }
            return [companyId];
        }
        if (normalized === 'all' || normalized === xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING) {
            return [tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID];
        }
        return [companyId];
    }
    async listMemberOrgTree(tenantId, companyId, legalEntityIds, includeUnlinkedMasterUnits = false) {
        const resolvedLegalEntityIds = this.normalizeLegalEntityIds(legalEntityIds);
        if (resolvedLegalEntityIds.length > 0) {
            return this.listOrgTreeByLegalEntity(tenantId, companyId, resolvedLegalEntityIds, includeUnlinkedMasterUnits);
        }
        const companyIds = this.resolveOrgUnitCompanyPartitions(tenantId, companyId);
        const { rows } = await this.db.query(`WITH RECURSIVE tree AS (
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
      SELECT * FROM tree ORDER BY path, sort_order, name`, [tenantId, companyIds]);
        return this.buildTree(rows);
    }
    normalizeLegalEntityIds(legalEntityIds) {
        if (Array.isArray(legalEntityIds)) {
            return [...new Set(legalEntityIds.map((id) => id.trim()).filter(Boolean))];
        }
        const single = legalEntityIds?.trim();
        return single ? [single] : [];
    }
    /** Org units for one or more legal entities — main/holding partitions on master + legacy member slug + member tenant. */
    async listOrgTreeByLegalEntity(tenantId, companyId, legalEntityIds, includeUnlinkedMasterUnits = false) {
        const legacyMasterCompanyId = (0, tenant_constants_1.isMasterTenant)(tenantId) ? companyId : tenantId;
        const masterCompanyIds = [xbos_group_legal_scope_1.XBOS_GROUP_OPERATING_MAIN, xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING];
        if (!masterCompanyIds.includes(legacyMasterCompanyId) &&
            (0, tenant_constants_1.isMasterTenant)(tenant_constants_1.MASTER_TENANT_ID) &&
            legacyMasterCompanyId !== tenant_constants_1.MASTER_TENANT_ID) {
            masterCompanyIds.push(legacyMasterCompanyId);
        }
        const unlinkedClause = includeUnlinkedMasterUnits
            ? `OR (
              o.legal_entity_id IS NULL
              AND o.tenant_id = $2
              AND o.company_id = ANY($3::text[])
            )`
            : '';
        const { rows } = await this.db.query(`WITH RECURSIVE roots AS (
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
      SELECT * FROM tree ORDER BY path, sort_order, name`, [
            legalEntityIds,
            tenant_constants_1.MASTER_TENANT_ID,
            masterCompanyIds,
            tenantId,
            tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID,
            legacyMasterCompanyId,
        ]);
        return this.buildTree(rows);
    }
    buildTree(flat) {
        const byId = new Map();
        const roots = [];
        for (const row of flat) {
            byId.set(String(row.id), { ...row, children: [] });
        }
        for (const row of flat) {
            const node = byId.get(String(row.id));
            const parentId = row.parent_id;
            if (parentId && byId.has(parentId)) {
                byId.get(parentId).children.push(node);
            }
            else {
                roots.push(node);
            }
        }
        return roots;
    }
    /**
     * Org units for a legal entity persist under that entity's tenant partition so list/get tree parity holds
     * (UF-XBOS-12 — group CEO POST with legalEntityId must appear on GET tree for member entity).
     */
    async resolveOrgUnitPersistScope(tenantId, companyId, legalEntityId) {
        const entityId = legalEntityId?.trim();
        if (!entityId) {
            return { tenantId, companyId };
        }
        const partition = await this.resolveLegalEntityPartition(entityId);
        if (!partition) {
            return { tenantId, companyId };
        }
        if ((0, tenant_constants_1.isMasterTenant)(partition.tenantId)) {
            const normalizedCompany = partition.companyId.trim().toLowerCase();
            return {
                tenantId: partition.tenantId,
                companyId: normalizedCompany === xbos_group_legal_scope_1.XBOS_GROUP_OPERATING_MAIN
                    ? xbos_group_legal_scope_1.XBOS_GROUP_LEGAL_HOLDING
                    : partition.companyId,
            };
        }
        return {
            tenantId: partition.tenantId,
            companyId: tenant_constants_1.MEMBER_DEFAULT_COMPANY_ID,
        };
    }
    /** Flat org tree scoped to one legal entity (F5 reload after member org-unit mutate). */
    async listOrgTreeForLegalEntity(legalEntityId) {
        const partition = await this.resolveLegalEntityPartition(legalEntityId);
        if (!partition) {
            throw new api_exception_1.ApiException('XBOS-ORG-404', 'Legal entity not found', common_1.HttpStatus.NOT_FOUND);
        }
        return this.listMemberOrgTree(partition.tenantId, partition.companyId, legalEntityId.trim());
    }
    async upsertOrgUnit(tenantId, companyId, unitId, body) {
        if (!body.code?.trim() || !body.name?.trim() || !body.orgType?.trim()) {
            throw new api_exception_1.ApiException('XBOS-ORG-400', 'code, name, orgType are required', common_1.HttpStatus.BAD_REQUEST);
        }
        const persistScope = await this.resolveOrgUnitPersistScope(tenantId, companyId, body.legalEntityId);
        let persistTenantId = persistScope.tenantId;
        let persistCompanyId = persistScope.companyId;
        if (unitId) {
            const existing = await this.db.query(`SELECT tenant_id, company_id FROM public.xbos_org_unit
         WHERE id = $1::uuid AND status <> 'deleted' LIMIT 1`, [unitId]);
            if (existing.rows[0]) {
                persistTenantId = String(existing.rows[0].tenant_id);
                persistCompanyId = String(existing.rows[0].company_id);
            }
            const { rows } = await this.db.query(`UPDATE public.xbos_org_unit SET
          code = $4, name = $5, org_type = $6, parent_id = $7::uuid,
          legal_entity_id = $8::uuid, sort_order = COALESCE($9, sort_order),
          payload = COALESCE($10::jsonb, payload), updated_at = NOW()
         WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3
         RETURNING *`, [
                unitId,
                persistTenantId,
                persistCompanyId,
                body.code.trim(),
                body.name.trim(),
                body.orgType.trim(),
                body.parentId ?? null,
                body.legalEntityId ?? null,
                body.sortOrder ?? null,
                body.payload ? JSON.stringify(body.payload) : null,
            ]);
            if (!rows[0])
                throw new api_exception_1.ApiException('XBOS-ORG-404', 'Org unit not found', common_1.HttpStatus.NOT_FOUND);
            return rows[0];
        }
        const { rows } = await this.db.query(`INSERT INTO public.xbos_org_unit (
        tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload
      ) VALUES ($1,$2,$3,$4,$5,$6::uuid,$7::uuid,$8,$9::jsonb)
      RETURNING *`, [
            persistTenantId,
            persistCompanyId,
            body.code.trim(),
            body.name.trim(),
            body.orgType.trim(),
            body.parentId ?? null,
            body.legalEntityId ?? null,
            body.sortOrder ?? 0,
            JSON.stringify(body.payload ?? {}),
        ]);
        return rows[0];
    }
    async deleteOrgUnit(tenantId, companyId, unitId) {
        const existing = await this.db.query(`SELECT tenant_id, company_id FROM public.xbos_org_unit
       WHERE id = $1::uuid AND status <> 'deleted' LIMIT 1`, [unitId]);
        const row = existing.rows[0];
        const deleteTenantId = row ? String(row.tenant_id) : tenantId;
        const deleteCompanyId = row ? String(row.company_id) : companyId;
        const { rows } = await this.db.query(`UPDATE public.xbos_org_unit SET status = 'deleted', updated_at = NOW()
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 AND status <> 'deleted'
       RETURNING id`, [unitId, deleteTenantId, deleteCompanyId]);
        if (!rows[0]) {
            throw new api_exception_1.ApiException('XBOS-ORG-404', 'Org unit not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { deleted: true };
    }
    async promoteSegment(tenantId, companyId, segmentId, legalEntityBody) {
        const { rows: segRows } = await this.db.query(`SELECT * FROM public.xbos_org_unit
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3 AND org_type = 'segment' AND status <> 'deleted'`, [segmentId, tenantId, companyId]);
        const segment = segRows[0];
        if (!segment) {
            throw new api_exception_1.ApiException('XBOS-ORG-404', 'Business segment not found', common_1.HttpStatus.NOT_FOUND);
        }
        const entity = await this.upsertLegalEntity(tenantId, companyId, null, {
            ...legalEntityBody,
            name: legalEntityBody.name || String(segment.name),
            code: legalEntityBody.code || String(segment.code),
        });
        const entityId = String(entity.id);
        await this.db.query(`UPDATE public.xbos_org_unit SET org_type = 'subsidiary', legal_entity_id = $4::uuid, updated_at = NOW()
       WHERE id = $1::uuid AND tenant_id = $2 AND company_id = $3`, [segmentId, tenantId, companyId, entityId]);
        return { segmentId, legalEntity: entity };
    }
    /**
     * Danh sách phẳng cho Command Center — tập đoàn (tenant master) + pháp nhân gốc mỗi tenant thành viên
     * (dữ liệu từ seed org / Excel → JSON → DB).
     */
    async listGroupMemberUnits() {
        const { rows: masterRows } = await this.db.query(`SELECT tenant_id, name, short_name
       FROM public.xbos_tenant_registry
       WHERE tenant_kind = 'master' AND status = 'active'
       ORDER BY CASE WHEN tenant_id = $1 THEN 0 ELSE 1 END
       LIMIT 1`, [tenant_constants_1.MASTER_TENANT_ID]);
        const holding = masterRows[0] ?? null;
        const { rows: members } = await this.db.query(`SELECT t.tenant_id,
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
       ORDER BY t.name`);
        return { holding, members };
    }
};
exports.OrgFoundationService = OrgFoundationService;
exports.OrgFoundationService = OrgFoundationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService])
], OrgFoundationService);
