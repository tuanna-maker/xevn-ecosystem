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
exports.SettingsCatalogsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const catalog_sync_service_1 = require("../catalog-sync/catalog-sync.service");
const tenant_scope_env_1 = require("../common/tenant-scope-env");
const hrm_db_service_1 = require("../db/hrm-db.service");
const node_crypto_1 = require("node:crypto");
const node_crypto_2 = require("node:crypto");
const group_employee_import_catalog_1 = require("./group-employee-import-catalog");
const tourism_fleet_catalog_1 = require("./tourism-fleet-catalog");
const hrm_settings_master_keys_1 = require("./hrm-settings-master-keys");
const tenant_position_catalog_1 = require("./tenant-position-catalog");
const xbos_catalog_workflow_bridge_1 = require("./xbos-catalog-workflow.bridge");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
let SettingsCatalogsService = class SettingsCatalogsService {
    db;
    catalogSync;
    xbosWorkflow;
    constructor(db, catalogSync, xbosWorkflow) {
        this.db = db;
        this.catalogSync = catalogSync;
        this.xbosWorkflow = xbosWorkflow;
    }
    normalizeCatalogKey(catalogKey) {
        const normalized = catalogKey.trim().toLowerCase();
        if (!/^[a-z0-9_][a-z0-9_-]{1,62}$/.test(normalized)) {
            throw new api_exception_1.ApiException('HRM-SET-001', 'Invalid catalog key format', common_2.HttpStatus.BAD_REQUEST);
        }
        return normalized;
    }
    async ensureExtensionSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_catalog_extension_items (
        id BIGSERIAL PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        catalog_key TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        unit TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_cat_ext_scope_key_code
      ON public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code);
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_catalog_field_removal_requests (
        id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        catalog_key TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NULL,
        reason TEXT NULL,
        requested_by_name TEXT NULL,
        requested_by_email TEXT NULL,
        leadership_emails TEXT[] NOT NULL DEFAULT '{}',
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_note TEXT NULL,
        reviewed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_remove_req_scope
      ON public.hrm_catalog_field_removal_requests (tenant_id, company_id, catalog_key, status, created_at DESC);
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_catalog_extension_requests (
        id UUID PRIMARY KEY,
        batch_id UUID NOT NULL,
        tenant_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        catalog_key TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        unit TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        workflow_instance_id UUID NULL,
        requested_by_user_id TEXT NULL,
        requested_by_email TEXT NULL,
        reviewed_by_user_id TEXT NULL,
        review_note TEXT NULL,
        reviewed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_ext_req_status
      ON public.hrm_catalog_extension_requests (status, created_at DESC);
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_ext_req_scope
      ON public.hrm_catalog_extension_requests (tenant_id, company_id, catalog_key, status);
    `);
        await this.db.query(`ALTER TABLE public.hrm_catalog_extension_requests ADD COLUMN IF NOT EXISTS batch_id UUID`);
        await this.db.query(`ALTER TABLE public.hrm_catalog_extension_requests ADD COLUMN IF NOT EXISTS workflow_instance_id UUID`);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_cat_ext_req_batch
      ON public.hrm_catalog_extension_requests (batch_id, status);
    `);
    }
    parseLeadershipEmails() {
        const raw = process.env.HRM_XBOS_LEADERSHIP_EMAILS ?? process.env.XBOS_LEADERSHIP_EMAILS ?? '';
        if (!raw.trim())
            return [];
        return [...new Set(raw.split(',').map((v) => v.trim()).filter((v) => v.length > 0))];
    }
    parsePayloadItems(payload) {
        if (!payload || typeof payload !== 'object') {
            return { name: null, domain: null, key: null, items: [] };
        }
        const p = payload;
        const rawItems = Array.isArray(p.items) ? p.items : [];
        const items = rawItems
            .filter((row) => !!row && typeof row === 'object')
            .map((row) => ({
            code: typeof row.code === 'string' ? row.code : '',
            label: typeof row.label === 'string' ? row.label : '',
            unit: typeof row.unit === 'string' ? row.unit : row.unit === null ? null : undefined,
            status: typeof row.status === 'string' ? row.status : 'active',
        }))
            .filter((row) => row.code.length > 0 && row.label.length > 0);
        return {
            name: typeof p.name === 'string' ? p.name : null,
            domain: typeof p.domain === 'string' ? p.domain : null,
            key: typeof p.key === 'string' ? p.key : null,
            items,
        };
    }
    toXbosOriginItems(items) {
        return items.map((row) => ({
            code: row.code,
            label: row.label,
            unit: row.unit ?? null,
            status: row.status === 'draft' ? 'draft' : 'active',
            origin: 'xbos',
        }));
    }
    mergeEffective(xbos, hrm) {
        const byCode = new Map();
        for (const row of xbos) {
            byCode.set(row.code.toLowerCase(), { ...row, origin: 'xbos' });
        }
        for (const row of hrm) {
            byCode.set(row.code.toLowerCase(), { ...row, origin: 'hrm' });
        }
        return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
    }
    matchesPickerQuery(item, q) {
        if (!q?.trim())
            return true;
        const needle = q.trim().toLowerCase();
        return item.code.toLowerCase().includes(needle) || item.label.toLowerCase().includes(needle);
    }
    matchesActiveFilter(item, activeRaw, status) {
        if (status === 'all')
            return true;
        if (status === 'active')
            return item.status === 'active';
        if (status === 'draft')
            return item.status === 'draft';
        if (activeRaw == null || activeRaw.trim() === '')
            return true;
        const a = activeRaw.trim().toLowerCase();
        if (a === '1' || a === 'true' || a === 'active' || a === 'yes')
            return item.status === 'active';
        if (a === '0' || a === 'false' || a === 'draft' || a === 'inactive' || a === 'no') {
            return item.status !== 'active';
        }
        return true;
    }
    async getEffectiveItemsForKey(tenantId, companyId, catalogKey) {
        await this.ensureExtensionSchema();
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        const ck = this.normalizeCatalogKey(catalogKey);
        const synced = await this.catalogSync.getSyncedCatalog(ck, t, c).catch(() => null);
        const parsed = synced ? this.parsePayloadItems(synced.payload) : { items: [] };
        const xbosItems = this.toXbosOriginItems(parsed.items);
        const extRes = await this.db.query(`
      SELECT code, label, unit, status
      FROM public.hrm_catalog_extension_items
      WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3
      ORDER BY code
    `, [t, c, ck]);
        const hrmItems = extRes.rows.map((row) => ({
            code: row.code,
            label: row.label,
            unit: row.unit,
            status: row.status === 'draft' ? 'draft' : 'active',
            origin: 'hrm',
        }));
        return this.mergeEffective(xbosItems, hrmItems);
    }
    async listPickerItems(tenantId, companyId, catalogKey, query) {
        const items = await this.getEffectiveItemsForKey(tenantId, companyId, catalogKey);
        const filtered = items.filter((item) => this.matchesActiveFilter(item, query?.active, query?.status) &&
            this.matchesPickerQuery(item, query?.q));
        return {
            catalog_key: this.normalizeCatalogKey(catalogKey),
            company_id: companyId.trim().toLowerCase(),
            total: filtered.length,
            data: filtered,
        };
    }
    async assertCodeInEffectiveCatalog(opts) {
        const code = opts.code.trim();
        if (!code) {
            throw new api_exception_1.ApiException(opts.errorCode, opts.errorMessage ?? `Catalog code required for ${opts.catalogKey}`, common_2.HttpStatus.BAD_REQUEST);
        }
        const items = await this.getEffectiveItemsForKey(opts.tenantId, opts.companyId, opts.catalogKey);
        const activeOnly = items.filter((i) => i.status === 'active');
        if (activeOnly.length === 0) {
            throw new api_exception_1.ApiException(opts.errorCode, opts.errorMessage ??
                `Catalog '${opts.catalogKey}' has no active items — sync from XBOS or add in Settings`, common_2.HttpStatus.BAD_REQUEST);
        }
        const hit = activeOnly.find((i) => i.code.toLowerCase() === code.toLowerCase());
        if (!hit) {
            throw new api_exception_1.ApiException(opts.errorCode, opts.errorMessage ??
                `Code '${code}' is not in catalog '${opts.catalogKey}' (free-text SoT forbidden)`, common_2.HttpStatus.BAD_REQUEST);
        }
        return hit;
    }
    async getOverview(tenantId, companyId) {
        await this.ensureExtensionSchema();
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        const synced = await this.catalogSync.listSyncedCatalogs(t, c);
        const extRes = await this.db.query(`
      SELECT catalog_key, code, label, unit, status
      FROM public.hrm_catalog_extension_items
      WHERE tenant_id = $1 AND company_id = $2
      ORDER BY catalog_key, code
    `, [t, c]);
        const pendingRes = await this.db.query(`
      SELECT catalog_key, code, label, unit, status
      FROM public.hrm_catalog_extension_requests
      WHERE tenant_id = $1 AND company_id = $2 AND status = 'pending'
      ORDER BY catalog_key, code
    `, [t, c]);
        const extByKey = new Map();
        const mergeExtensionRow = (row) => {
            const list = extByKey.get(row.catalog_key) ?? [];
            const normalizedCode = row.code.toLowerCase();
            if (list.some((item) => item.code.toLowerCase() === normalizedCode)) {
                return;
            }
            list.push({
                code: row.code,
                label: row.label,
                unit: row.unit,
                status: row.status === 'pending' ? 'draft' : row.status === 'draft' ? 'draft' : 'active',
                origin: 'hrm',
            });
            extByKey.set(row.catalog_key, list);
        };
        for (const row of extRes.rows) {
            mergeExtensionRow(row);
        }
        for (const row of pendingRes.rows) {
            mergeExtensionRow({ ...row, status: 'pending' });
        }
        const keys = new Set();
        for (const c of synced.data) {
            keys.add(c.key);
        }
        for (const k of extByKey.keys()) {
            keys.add(k);
        }
        const catalogs = [];
        for (const catalogKey of [...keys].sort()) {
            const syncedRow = synced.data.find((c) => c.key === catalogKey);
            const parsed = syncedRow ? this.parsePayloadItems(syncedRow.payload) : { name: null, domain: null, key: null, items: [] };
            const xbosItems = this.toXbosOriginItems(parsed.items);
            const hrmExtensionItems = extByKey.get(catalogKey) ?? [];
            catalogs.push({
                catalogKey,
                catalog_key: catalogKey,
                key: catalogKey,
                name: parsed.name ?? syncedRow?.key ?? catalogKey,
                domain: parsed.domain,
                xbosVersion: syncedRow?.version ?? null,
                xbosSyncedAt: syncedRow?.syncedAt ?? null,
                xbosItems,
                hrmExtensionItems,
                extension_items: hrmExtensionItems,
                extensionItems: hrmExtensionItems,
                items: hrmExtensionItems,
                effectiveItems: this.mergeEffective(xbosItems, hrmExtensionItems),
            });
        }
        return { catalogs };
    }
    async syncAllFromXbos(tenantId, companyId, authorization) {
        const remote = await this.catalogSync.listRemoteCatalogsFromXbos(tenantId, companyId, authorization);
        const pulledKeys = [];
        for (const entry of remote.data) {
            const key = typeof entry?.key === 'string' ? entry.key : null;
            if (!key)
                continue;
            await this.catalogSync.pullCatalogFromXbos(key, tenantId, companyId, authorization);
            pulledKeys.push(key);
        }
        return { pulledKeys };
    }
    async submitExtensionItemsForApproval(tenantId, companyId, catalogKey, items, requestedBy) {
        await this.ensureExtensionSchema();
        const ck = this.normalizeCatalogKey(catalogKey);
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        const batchId = (0, node_crypto_2.randomUUID)();
        let submitted = 0;
        for (const row of items) {
            await this.db.query(`
        INSERT INTO public.hrm_catalog_extension_requests
          (id, batch_id, tenant_id, company_id, catalog_key, code, label, unit, status, requested_by_user_id, requested_by_email)
        VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, 'pending', $9, $10)
      `, [
                (0, node_crypto_2.randomUUID)(),
                batchId,
                t,
                c,
                ck,
                row.code,
                row.label,
                row.unit ?? null,
                requestedBy?.userId ?? null,
                requestedBy?.email ?? null,
            ]);
            submitted += 1;
        }
        await this.appendExtensionItems(t, c, ck, items.map((row) => ({
            ...row,
            status: row.status ?? 'draft',
        })));
        const workflow = await this.xbosWorkflow.startCatalogWorkflowIfConfigured(batchId, t, c, requestedBy?.userId ?? requestedBy?.email);
        return {
            batchId,
            submitted,
            status: 'pending',
            workflowInstanceId: workflow?.workflowInstanceId ?? null,
            message: workflow?.workflowInstanceId
                ? 'Đã gửi yêu cầu và khởi tạo quy trình phê duyệt XBOS (Tập đoàn).'
                : 'Đã gửi yêu cầu bổ sung danh mục — chờ XBOS (tập đoàn) phê duyệt.',
        };
    }
    async listExtensionRequests(filters) {
        await this.ensureExtensionSchema();
        const clauses = ['1=1'];
        const params = [];
        let idx = 1;
        if (filters.status) {
            clauses.push(`status = $${idx++}`);
            params.push(filters.status);
        }
        if (filters.tenantId) {
            clauses.push(`tenant_id = $${idx++}`);
            params.push(filters.tenantId.trim().toLowerCase());
        }
        if (filters.companyId) {
            clauses.push(`company_id = $${idx++}`);
            params.push(filters.companyId.trim().toLowerCase());
        }
        const res = await this.db.query(`
      SELECT id, batch_id, tenant_id, company_id, catalog_key, code, label, unit, status,
             requested_by_user_id, requested_by_email, created_at
      FROM public.hrm_catalog_extension_requests
      WHERE ${clauses.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT 500
    `, params);
        return { items: res.rows };
    }
    async assertExtensionBatchInCatalogScope(batchId, tenantId, catalogCompanyId, authorization) {
        await this.ensureExtensionSchema();
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, catalogCompanyId, { tenantId });
        const peek = await this.db.query(`SELECT tenant_id, company_id
       FROM public.hrm_catalog_extension_requests
       WHERE batch_id = $1::uuid
       LIMIT 1`, [batchId]);
        const row = peek.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-SET-404', 'Extension batch not found', common_2.HttpStatus.NOT_FOUND);
        }
        const normalizedTenant = tenantId.trim().toLowerCase();
        if (row.tenant_id?.trim().toLowerCase() !== normalizedTenant) {
            throw new api_exception_1.ApiException('HRM-SET-409', 'Extension batch tenant is outside token scope', common_2.HttpStatus.CONFLICT);
        }
        (0, hrm_list_scope_1.assertResourceInHrmScope)(row, scope, {
            notFoundCode: 'HRM-SET-404',
            mismatchCode: 'HRM-SET-409',
        });
    }
    async attachWorkflowToBatch(batchId, workflowInstanceId, tenantId, catalogCompanyId, authorization) {
        await this.assertExtensionBatchInCatalogScope(batchId, tenantId, catalogCompanyId, authorization);
        await this.db.query(`UPDATE public.hrm_catalog_extension_requests
       SET workflow_instance_id = $2::uuid
       WHERE batch_id = $1::uuid AND status = 'pending'`, [batchId, workflowInstanceId]);
    }
    async reviewExtensionBatch(batchId, decision, reviewerUserId, reviewNote, tenantId, catalogCompanyId, authorization) {
        await this.assertExtensionBatchInCatalogScope(batchId, tenantId, catalogCompanyId, authorization);
        const res = await this.db.query(`SELECT id FROM public.hrm_catalog_extension_requests
       WHERE batch_id = $1::uuid AND status = 'pending'`, [batchId]);
        const results = [];
        for (const row of res.rows) {
            results.push(await this.reviewExtensionRequest(row.id, decision, reviewerUserId, reviewNote));
        }
        return { batchId, decision, reviewed: results.length, results };
    }
    async getExtensionBatchDetail(batchId, tenantId, catalogCompanyId, authorization) {
        await this.assertExtensionBatchInCatalogScope(batchId, tenantId, catalogCompanyId, authorization);
        const normalizedTenant = tenantId.trim().toLowerCase();
        const normalizedCompany = catalogCompanyId.trim().toLowerCase();
        const res = await this.db.query(`SELECT id, batch_id, tenant_id, company_id, catalog_key, code, label, unit, status,
              workflow_instance_id, requested_by_user_id, requested_by_email, created_at
       FROM public.hrm_catalog_extension_requests
       WHERE batch_id = $1::uuid
         AND tenant_id = $2
         AND company_id = $3
       ORDER BY catalog_key, code`, [batchId, normalizedTenant, normalizedCompany]);
        if (!res.rows.length) {
            throw new api_exception_1.ApiException('HRM-SET-404', 'Extension batch not found', common_2.HttpStatus.NOT_FOUND);
        }
        return { batchId, items: res.rows };
    }
    async reviewExtensionRequest(requestId, decision, reviewerUserId, reviewNote) {
        await this.ensureExtensionSchema();
        const res = await this.db.query(`SELECT id, tenant_id, company_id, catalog_key, code, label, unit, status
       FROM public.hrm_catalog_extension_requests WHERE id = $1::uuid LIMIT 1`, [requestId]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-SET-420', 'Extension request not found', common_2.HttpStatus.NOT_FOUND);
        }
        if (row.status !== 'pending') {
            throw new api_exception_1.ApiException('HRM-SET-421', 'Request already reviewed', common_2.HttpStatus.CONFLICT, {
                status: row.status,
            });
        }
        if (decision === 'approved') {
            await this.appendExtensionItems(row.tenant_id, row.company_id, row.catalog_key, [
                {
                    code: row.code,
                    label: row.label,
                    unit: row.unit ?? undefined,
                    status: 'active',
                },
            ]);
        }
        await this.db.query(`
      UPDATE public.hrm_catalog_extension_requests
      SET status = $2, reviewed_by_user_id = $3, review_note = $4, reviewed_at = NOW()
      WHERE id = $1::uuid
    `, [requestId, decision, reviewerUserId, reviewNote?.trim() ?? null]);
        return { requestId, status: decision, catalogKey: row.catalog_key, code: row.code };
    }
    async appendExtensionItems(tenantId, companyId, catalogKey, items) {
        await this.ensureExtensionSchema();
        const ck = this.normalizeCatalogKey(catalogKey);
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        if (items.length === 0) {
            return { upserted: 0 };
        }
        const codes = [];
        const labels = [];
        const units = [];
        const statuses = [];
        for (const row of items) {
            codes.push(row.code);
            labels.push(row.label);
            units.push(row.unit ?? null);
            statuses.push(row.status ?? 'active');
        }
        await this.db.query(`
      INSERT INTO public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code, label, unit, status)
      SELECT $1, $2, $3, u.code, u.label, u.unit, u.status
      FROM unnest($4::text[], $5::text[], $6::text[], $7::text[]) AS u(code, label, unit, status)
      ON CONFLICT (tenant_id, company_id, catalog_key, code)
      DO UPDATE SET
        label = EXCLUDED.label,
        unit = EXCLUDED.unit,
        status = EXCLUDED.status
    `, [t, c, ck, codes, labels, units, statuses]);
        return { upserted: items.length };
    }
    async upsertCatalogItem(tenantId, body) {
        const status = body.status === 'draft' ? 'draft' : 'active';
        const result = await this.appendExtensionItems(tenantId, body.company_id, body.category_key, [
            {
                code: body.item_key,
                label: body.item_name,
                unit: body.item_value ?? undefined,
                status,
            },
        ]);
        return {
            upserted: result.upserted,
            item_key: body.item_key,
            category_key: body.category_key,
            status,
        };
    }
    async deleteCatalogItem(tenantId, body) {
        await this.ensureExtensionSchema();
        const t = tenantId.trim().toLowerCase();
        const c = body.company_id.trim().toLowerCase();
        const catalogKey = this.normalizeCatalogKey(body.category_key);
        const code = body.item_key.trim();
        const res = await this.db.query(`UPDATE public.hrm_catalog_extension_items
       SET status = 'draft'
       WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3 AND code = $4
       RETURNING code`, [t, c, catalogKey, code]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-SET-404', 'Catalog item not found in HRM extension (cannot hard-delete XBOS master)', common_2.HttpStatus.NOT_FOUND);
        }
        return { item_key: res.rows[0].code, category_key: catalogKey, status: 'draft' };
    }
    async requestFieldRemoval(tenantId, companyId, catalogKey, payload) {
        await this.ensureExtensionSchema();
        const ck = this.normalizeCatalogKey(catalogKey);
        const code = payload.code.trim();
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        const extRes = await this.db.query(`
      SELECT label
      FROM public.hrm_catalog_extension_items
      WHERE tenant_id = $1 AND company_id = $2 AND catalog_key = $3 AND code = $4
      LIMIT 1
    `, [t, c, ck, code]);
        if (!extRes.rows[0]) {
            throw new api_exception_1.ApiException('HRM-SET-410', `Field '${code}' does not exist in HRM extension scope`, common_2.HttpStatus.NOT_FOUND);
        }
        const requestRes = await this.db.query(`
      INSERT INTO public.hrm_catalog_field_removal_requests
        (id, tenant_id, company_id, catalog_key, code, label, reason, requested_by_name, requested_by_email, leadership_emails, status)
      VALUES
        ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::text[], 'pending')
      RETURNING id, status, leadership_emails, created_at
    `, [
            (0, node_crypto_2.randomUUID)(),
            t,
            c,
            ck,
            code,
            payload.label?.trim() || extRes.rows[0].label,
            payload.reason?.trim() || 'Company requested field removal from HRM extension catalog',
            payload.requested_by_name?.trim() || null,
            payload.requested_by_email?.trim() || null,
            this.parseLeadershipEmails(),
        ]);
        const row = requestRes.rows[0];
        return {
            requestId: row.id,
            status: row.status,
            leadershipEmails: row.leadership_emails,
            createdAt: row.created_at,
            message: 'Removal request created and pending XBOS + group leadership approval. Field is not deleted immediately.',
        };
    }
    async countActivePosMasterItems(tenantId, companyId) {
        let total = 0;
        for (const key of hrm_settings_master_keys_1.HRM_SC_POS_KEYS) {
            const items = await this.getEffectiveItemsForKey(tenantId, companyId, key);
            total += items.filter((i) => i.status === 'active').length;
        }
        return total;
    }
    async assertTenantPositionHardcodeSeedAllowed(tenantId, companyId) {
        if (!(0, tenant_position_catalog_1.isTenantPositionSeedEnvAllowed)()) {
            throw new api_exception_1.ApiException('HRM-CAT-POS-SEED-FORBIDDEN', 'tenant-position-catalog seed is bootstrap-only (G-ORPH-BE-03 retired). Prefer POST …/sync-from-xbos or catalog-sync/pull for job_titles/departments. Set HRM_ALLOW_TENANT_POSITION_SEED=1 only for explicit bootstrap-dev — not UAT evidence.', common_2.HttpStatus.FORBIDDEN);
        }
        const activePos = await this.countActivePosMasterItems(tenantId, companyId);
        if (activePos > 0) {
            throw new api_exception_1.ApiException('HRM-CAT-POS-SEED-SOT-EXISTS', `Refusing hardcoded tenant-position seed: ${activePos} active item(s) already in XBOS/Settings POS catalogs (${hrm_settings_master_keys_1.HRM_SC_POS_KEYS.join('|')}). Use Settings path.`, common_2.HttpStatus.CONFLICT);
        }
    }
    async seedEmployeeProfileTemplate(tenantId, companyId) {
        await this.ensureExtensionSchema();
        const t = tenantId.trim().toLowerCase() || (0, tenant_scope_env_1.masterTenantIdFromEnv)();
        if (!t) {
            throw new api_exception_1.ApiException('HRM-CAT-TENANT', 'tenantId is required (header or JWT), or set MASTER_TENANT_ID / DEFAULT_TENANT_ID for seed.', common_2.HttpStatus.BAD_REQUEST);
        }
        const c = companyId.trim().toLowerCase();
        const deptPositionItems = (0, tenant_position_catalog_1.buildEmptyPositionFieldDefs)();
        const templates = [
            {
                catalogKey: 'hrm_employee_basic_fields',
                items: [
                    { code: 'employee_code', label: 'Mã nhân sự', unit: 'text', status: 'active' },
                    { code: 'full_name', label: 'Họ và tên', unit: 'text', status: 'active' },
                    ...deptPositionItems,
                    { code: 'status', label: 'Trạng thái lao động', unit: 'select:active|probation|inactive', status: 'active' },
                    { code: 'xbos_basic_badge_id', label: 'Mã thẻ nội bộ', unit: 'text', status: 'active' },
                ],
            },
            {
                catalogKey: 'hrm_employee_personal_fields',
                items: [
                    { code: 'date_of_birth', label: 'Ngày sinh', unit: 'date', status: 'active' },
                    { code: 'gender', label: 'Giới tính', unit: 'select:Nam|Nữ|Khác', status: 'active' },
                    { code: 'national_id', label: 'CCCD/CMND', unit: 'text', status: 'active' },
                    { code: 'phone_number', label: 'Số điện thoại', unit: 'phone', status: 'active' },
                    { code: 'permanent_address', label: 'Địa chỉ thường trú', unit: 'text', status: 'active' },
                    { code: 'xbos_personal_hometown', label: 'Quê quán', unit: 'text', status: 'active' },
                ],
            },
            {
                catalogKey: 'hrm_employee_work_fields',
                items: [
                    { code: 'join_date', label: 'Ngày vào làm', unit: 'date', status: 'active' },
                    { code: 'work_location', label: 'Địa điểm làm việc', unit: 'text', status: 'active' },
                    { code: 'manager', label: 'Quản lý trực tiếp', unit: 'text', status: 'active' },
                    { code: 'employment_type', label: 'Loại hợp đồng', unit: 'select:full-time|part-time|contract|intern', status: 'active' },
                    { code: 'xbos_work_shift_group', label: 'Nhóm ca làm việc', unit: 'select:Ca hành chính|Ca xoay 2|Ca xoay 3', status: 'active' },
                ],
            },
            {
                catalogKey: 'hrm_employee_finance_fields',
                items: [
                    { code: 'bank_account_number', label: 'Số tài khoản ngân hàng', unit: 'text', status: 'active' },
                    { code: 'bank_name', label: 'Ngân hàng', unit: 'text', status: 'active' },
                    { code: 'tax_code', label: 'Mã số thuế TNCN', unit: 'text', status: 'active' },
                    { code: 'salary_grade', label: 'Bậc lương', unit: 'text', status: 'active' },
                    { code: 'xbos_finance_salary_band', label: 'Nhóm lương XBOS', unit: 'select:Band A|Band B|Band C', status: 'active' },
                ],
            },
        ];
        const catalogs = [];
        let totalUpserted = 0;
        for (const tpl of templates) {
            const result = await this.appendExtensionItems(t, c, tpl.catalogKey, tpl.items);
            catalogs.push({ catalogKey: tpl.catalogKey, upserted: result.upserted });
            totalUpserted += result.upserted;
        }
        return { catalogs, totalUpserted };
    }
    async upsertGroupCatalogMeta(tenantId, companyId, catalogKey, name, domain, items) {
        await this.catalogSync.listSyncedCatalogs(tenantId, companyId);
        const payload = {
            key: catalogKey,
            name,
            domain,
            source: 'xevn_group_import_template',
            items: items.map((row) => ({
                code: row.code,
                label: row.label,
                unit: row.unit ?? null,
                status: row.status ?? 'active',
            })),
        };
        const checksum = (0, node_crypto_1.createHash)('sha256').update(JSON.stringify(payload)).digest('hex');
        await this.db.query(`
      INSERT INTO public.synced_catalogs (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
      VALUES ($1, $2, $3, 'xevn_group', $4::jsonb, 1, $5, NOW())
      ON CONFLICT (tenant_id, company_id, catalog_key)
      DO UPDATE SET
        payload = EXCLUDED.payload,
        source_system = EXCLUDED.source_system,
        version = public.synced_catalogs.version + 1,
        checksum = EXCLUDED.checksum,
        synced_at = NOW()
    `, [tenantId, companyId, catalogKey, JSON.stringify(payload), checksum]);
    }
    async seedGroupEmployeeImportCatalog(tenantId, companyId) {
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        if (!t || !c) {
            throw new api_exception_1.ApiException('HRM-CAT-SCOPE', 'tenantId and companyId are required', common_2.HttpStatus.BAD_REQUEST);
        }
        const catalogs = [];
        let totalUpserted = 0;
        for (const def of group_employee_import_catalog_1.GROUP_EMPLOYEE_IMPORT_CATALOGS) {
            await this.upsertGroupCatalogMeta(t, c, def.catalogKey, def.name, def.domain, def.items);
            const result = await this.appendExtensionItems(t, c, def.catalogKey, def.items);
            catalogs.push({ catalogKey: def.catalogKey, upserted: result.upserted });
            totalUpserted += result.upserted;
        }
        return { tenantId: t, companyId: c, catalogs, totalUpserted };
    }
    async seedGroupEmployeeImportCatalogAllTenants() {
        const scopes = [];
        let totalUpserted = 0;
        for (const scope of group_employee_import_catalog_1.GROUP_HRM_TENANT_SCOPES) {
            const row = await this.seedGroupEmployeeImportCatalog(scope.tenantId, scope.companyId);
            scopes.push({
                tenantId: row.tenantId,
                companyId: row.companyId,
                catalogs: row.catalogs,
                totalUpserted: row.totalUpserted,
            });
            totalUpserted += row.totalUpserted;
        }
        return { scopes, totalUpserted };
    }
    async seedTourismFleetCatalog() {
        const t = tourism_fleet_catalog_1.TOURISM_TENANT_ID;
        const c = tourism_fleet_catalog_1.TOURISM_COMPANY_ID;
        const catalogs = [];
        let totalUpserted = 0;
        for (const def of tourism_fleet_catalog_1.TOURISM_FLEET_CATALOGS) {
            await this.upsertGroupCatalogMeta(t, c, def.catalogKey, def.name, def.domain, def.items);
            const result = await this.appendExtensionItems(t, c, def.catalogKey, def.items);
            catalogs.push({ catalogKey: def.catalogKey, upserted: result.upserted });
            totalUpserted += result.upserted;
        }
        return { tenantId: t, companyId: c, catalogs, totalUpserted };
    }
    async seedTenantPositionCatalog(tenantId, companyId) {
        await this.ensureExtensionSchema();
        const t = tenantId.trim().toLowerCase();
        const c = companyId.trim().toLowerCase();
        await this.assertTenantPositionHardcodeSeedAllowed(t, c);
        const catalog = (0, tenant_position_catalog_1.getTenantPositionCatalog)(t);
        if (!catalog) {
            throw new api_exception_1.ApiException('HRM-CAT-POSITION', `No bootstrap position catalog defined for tenant "${t}" — use XBOS sync for job_titles/departments`, common_2.HttpStatus.BAD_REQUEST);
        }
        const items = (0, tenant_position_catalog_1.buildPositionCatalogItems)(catalog);
        const result = await this.appendExtensionItems(t, c, 'hrm_employee_basic_fields', items);
        const deptUnit = items.find((i) => i.code === 'department')?.unit ?? '';
        const posUnit = items.find((i) => i.code === 'position')?.unit ?? '';
        return {
            tenantId: t,
            companyId: c,
            departmentOptions: deptUnit.replace(/^select:/, '').split('|').filter(Boolean).length,
            positionOptions: posUnit.replace(/^select:/, '').split('|').filter(Boolean).length,
            upserted: result.upserted,
            source: 'bootstrap_hardcode',
            sot: 'deprecated_use_xbos_settings',
        };
    }
    async seedTenantPositionCatalogAllTenants() {
        if (!(0, tenant_position_catalog_1.isTenantPositionSeedEnvAllowed)()) {
            throw new api_exception_1.ApiException('HRM-CAT-POS-SEED-FORBIDDEN', 'tenant-position-catalog seed-all is bootstrap-only (G-ORPH-BE-03 retired). Prefer sync-from-xbos. Set HRM_ALLOW_TENANT_POSITION_SEED=1 only for explicit bootstrap-dev.', common_2.HttpStatus.FORBIDDEN);
        }
        const scopes = [];
        for (const { tenantId, companyId } of group_employee_import_catalog_1.GROUP_HRM_TENANT_SCOPES.filter((s) => s.tenantId !== 'xevn')) {
            const row = await this.seedTenantPositionCatalog(tenantId, companyId);
            scopes.push({
                tenantId: row.tenantId,
                companyId: row.companyId,
                departmentOptions: row.departmentOptions,
                positionOptions: row.positionOptions,
                upserted: row.upserted,
                source: row.source,
                sot: row.sot,
            });
        }
        return { scopes };
    }
};
exports.SettingsCatalogsService = SettingsCatalogsService;
exports.SettingsCatalogsService = SettingsCatalogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService,
        catalog_sync_service_1.CatalogSyncService,
        xbos_catalog_workflow_bridge_1.XbosCatalogWorkflowBridge])
], SettingsCatalogsService);
//# sourceMappingURL=settings-catalogs.service.js.map