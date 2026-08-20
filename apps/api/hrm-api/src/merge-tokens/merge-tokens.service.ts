/**
 * @CODE-MEMORY
 * Screen:     HRM Settings — MergeToken registry `/api/hrm/merge-tokens`
 * UC:         BR-PLT-01 · AC-PLT-CTR-05 · VAL-PLT-01..03 · VAL-PLT-TOK-*
 * BR:         BR-PLT-01/03/04/05 · soft-delete · U19 scope_parity
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01.md
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md §1.1C · §6
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01.md §3
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01.md F-PLT-TOK-01..03
 * Purpose:    ensureSchema hrm_merge_tokens + list/get/upsert/retire + resolve-preview §5.2.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01
 * Coded:      2026-08-07
 * Callers:    MergeTokensController · ContractLegalPrintService (PREV/VER wire)
 * Callees:    HrmDbService · resolveHrmListScope / assertResourceInHrmScope · resolveMergeTokens
 * FEActions:  Settings token list F5 · register custom field → upsert · resolve smoke
 * BEChain:    ensureSchema → scope filter → soft archive · resolve no persist
 * Impact:     Sai scope_parity → 404 sau list; closed enum token = phá DYNAMIC-LOCK
 * must_keep:  empty registry OK · keyword_map fallback · soft-delete · U65 no UF seed
 *             contracts_printable_ready=false · FORBIDDEN hard-delete / CHK token IN (N)
 * SOLID:      Registry CRUD tách print-spine; resolver pure shared
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-be-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * change_mode: ADD
 * What: ensureSchema chk_hrm_merge_tok_origin includes allowance_catalog
 * must_keep: soft-delete · DYNAMIC-LOCK · printable=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-BE-01
 * change_mode: EXPAND
 * What: chk origin + MERGE_TOKEN_ORIGINS ADD emp_catalog; resolvePreview F-EMP-TOK-05 bag from DOC/ET
 * must_keep: allowance_catalog · keyword_map fallback · soft-delete · printable=false · no wipe F-PLT-TOK
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  HrmListScopeContext,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PLT_CAT_CODE_CONFLICT,
  HRM_PLT_CAT_CODE_INVALID,
  HRM_PLT_SCHEMA_INVALID,
  HRM_PLT_TOK_404,
  HRM_PLT_TOKEN_UNKNOWN,
  MERGE_TOKEN_DOMAINS,
  MERGE_TOKEN_KEY_FORMAT,
  MERGE_TOKEN_ORIGINS,
  MERGE_TOKEN_RINGS,
  MERGE_TOKEN_STATUSES,
  type MergeTokenDomain,
  type MergeTokenOrigin,
  type MergeTokenRing,
  type MergeTokenStatus,
} from './merge-token.constants';
import {
  normalizeTokenKey,
  resolveMergeTokens,
  type MergeTokenRegistryRow,
} from './merge-token.resolver';
import { enrichEmpCatalogLabelsIntoBag } from './emp-merge-token-register';
import type {
  ListMergeTokensQueryDto,
  PatchMergeTokenDto,
  ResolveMergePreviewDto,
  UpsertMergeTokenDto,
} from './dto/merge-tokens.dto';

type TokenRow = {
  id: string;
  company_id: string;
  token_key: string;
  source_path: string;
  ring: string;
  domain: string;
  label_vi: string;
  status: string;
  origin: string;
  extension_field_ref: string | null;
  meta_json: Record<string, unknown> | string | null;
  version: number;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

@Injectable()
export class MergeTokensService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_merge_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id text NOT NULL,
        token_key text NOT NULL,
        source_path text NOT NULL,
        ring text NOT NULL,
        domain text NOT NULL,
        label_vi text NOT NULL,
        status text NOT NULL DEFAULT 'active',
        origin text NOT NULL DEFAULT 'builtin',
        extension_field_ref text NULL,
        meta_json jsonb NULL,
        version int NOT NULL DEFAULT 1,
        archived_at timestamptz NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        created_by text NULL,
        updated_by text NULL
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_merge_tok_company_key_active
        ON public.hrm_merge_tokens (company_id, lower(token_key))
        WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_merge_tok_company_domain
        ON public.hrm_merge_tokens (company_id, domain);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_merge_tok_company_status
        ON public.hrm_merge_tokens (company_id, status);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_merge_tok_company_ring
        ON public.hrm_merge_tokens (company_id, ring);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_merge_tok_company_origin_ext
        ON public.hrm_merge_tokens (company_id, origin)
        WHERE origin = 'extension_field';
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_merge_tokens
          DROP CONSTRAINT IF EXISTS chk_hrm_merge_tok_ring;
        ALTER TABLE public.hrm_merge_tokens
          ADD CONSTRAINT chk_hrm_merge_tok_ring
          CHECK (ring IN ('public','company','contract','cb','clause','custom'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_merge_tokens
          DROP CONSTRAINT IF EXISTS chk_hrm_merge_tok_status;
        ALTER TABLE public.hrm_merge_tokens
          ADD CONSTRAINT chk_hrm_merge_tok_status
          CHECK (status IN ('draft','active','retired'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_merge_tokens
          DROP CONSTRAINT IF EXISTS chk_hrm_merge_tok_origin;
        ALTER TABLE public.hrm_merge_tokens
          ADD CONSTRAINT chk_hrm_merge_tok_origin
          CHECK (origin IN (
            'builtin',
            'keyword_map',
            'extension_field',
            'import',
            'allowance_catalog',
            'emp_catalog'
          ));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_merge_tokens
          DROP CONSTRAINT IF EXISTS chk_hrm_merge_tok_domain;
        ALTER TABLE public.hrm_merge_tokens
          ADD CONSTRAINT chk_hrm_merge_tok_domain
          CHECK (domain IN ('CTR','EMP','REC','ATT','PAY','SET','CAT'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_merge_tokens
          DROP CONSTRAINT IF EXISTS chk_hrm_merge_tok_key_format;
        ALTER TABLE public.hrm_merge_tokens
          ADD CONSTRAINT chk_hrm_merge_tok_key_format
          CHECK (token_key ~ '^[a-z][a-z0-9_]*(\\.[a-z][a-z0-9_]*)*$');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    // FORBIDDEN: never ADD CHECK token_key IN (<fixed N>) / closed enum
    this.schemaReady = true;
  }

  /** Public for PREV/VER — load active registry rows in scope. */
  async loadActiveRegistry(
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    domain?: string,
  ): Promise<MergeTokenRegistryRow[]> {
    await this.ensureSchema();
    const { expandedCompanyIds } = this.resolveScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const filters: string[] = ['archived_at IS NULL', `status = 'active'`];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    if (domain?.trim()) {
      filters.push(`domain = $${values.length + 1}`);
      values.push(domain.trim().toUpperCase());
    }
    const res = await this.db.query<TokenRow>(
      `SELECT id, company_id, token_key, source_path, ring, domain, label_vi, status,
              origin, extension_field_ref, meta_json, version, archived_at,
              created_at, updated_at, created_by, updated_by
       FROM public.hrm_merge_tokens
       WHERE ${filters.join(' AND ')}
       ORDER BY token_key ASC;`,
      values,
    );
    return res.rows.map((r) => ({
      tokenKey: r.token_key,
      sourcePath: r.source_path,
      ring: r.ring,
      domain: r.domain,
      labelVi: r.label_vi,
      status: r.status,
    }));
  }

  private resolveScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(
      authorization,
      scopeCompanyId,
      scopeContext,
    );
    const expandedCompanyIds = expandHrmTextCompanyIds(
      scope,
      authorization,
      requestedCompanyId,
    );
    return { scope, expandedCompanyIds, scopeCompanyId };
  }

  private parseMeta(raw: unknown): Record<string, unknown> | null {
    if (raw == null) return null;
    if (typeof raw === 'object' && !Array.isArray(raw))
      return raw as Record<string, unknown>;
    if (typeof raw === 'string') {
      try {
        const p = JSON.parse(raw) as unknown;
        if (p && typeof p === 'object' && !Array.isArray(p))
          return p as Record<string, unknown>;
      } catch {
        /* ignore */
      }
    }
    return null;
  }

  private display(row: TokenRow) {
    return {
      id: row.id,
      companyId: row.company_id,
      tokenKey: row.token_key,
      sourcePath: row.source_path,
      ring: row.ring,
      domain: row.domain,
      labelVi: row.label_vi,
      status: row.status,
      origin: row.origin,
      extensionFieldRef: row.extension_field_ref,
      meta: this.parseMeta(row.meta_json),
      version: Number(row.version),
      archivedAt: row.archived_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }

  private assertTokenKeyFormat(tokenKey: string): string {
    const key = normalizeTokenKey(tokenKey);
    if (!key || !MERGE_TOKEN_KEY_FORMAT.test(key)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'tokenKey format invalid — expected a-z / digits / underscore / dots (format only)',
        HttpStatus.BAD_REQUEST,
      );
    }
    return key;
  }

  private assertRing(ring: string): MergeTokenRing {
    const r = ring.trim().toLowerCase() as MergeTokenRing;
    if (!(MERGE_TOKEN_RINGS as readonly string[]).includes(r)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `ring must be one of ${MERGE_TOKEN_RINGS.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return r;
  }

  private assertDomain(domain: string): MergeTokenDomain {
    const d = domain.trim().toUpperCase() as MergeTokenDomain;
    if (!(MERGE_TOKEN_DOMAINS as readonly string[]).includes(d)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `domain must be one of ${MERGE_TOKEN_DOMAINS.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return d;
  }

  private assertOrigin(origin: string): MergeTokenOrigin {
    const o = origin.trim().toLowerCase() as MergeTokenOrigin;
    if (!(MERGE_TOKEN_ORIGINS as readonly string[]).includes(o)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `origin must be one of ${MERGE_TOKEN_ORIGINS.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return o;
  }

  private assertStatus(status: string): MergeTokenStatus {
    const s = status.trim().toLowerCase() as MergeTokenStatus;
    if (!(MERGE_TOKEN_STATUSES as readonly string[]).includes(s)) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        `status must be one of ${MERGE_TOKEN_STATUSES.join(',')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return s;
  }

  async listTokens(
    query: ListMergeTokensQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { expandedCompanyIds } = this.resolveScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const includeArchived =
      String(query.include_archived ?? '').toLowerCase() === 'true';
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    if (!includeArchived) {
      filters.push('archived_at IS NULL');
    }
    const statusFilter = query.status?.trim()
      ? this.assertStatus(query.status)
      : includeArchived
        ? null
        : 'active';
    if (statusFilter) {
      filters.push(`status = $${values.length + 1}`);
      values.push(statusFilter);
    }
    if (query.domain?.trim()) {
      filters.push(`domain = $${values.length + 1}`);
      values.push(this.assertDomain(query.domain));
    }
    if (query.ring?.trim()) {
      filters.push(`ring = $${values.length + 1}`);
      values.push(this.assertRing(query.ring));
    }
    if (query.origin?.trim()) {
      filters.push(`origin = $${values.length + 1}`);
      values.push(this.assertOrigin(query.origin));
    }
    if (query.q?.trim()) {
      filters.push(
        `(token_key ILIKE $${values.length + 1} OR label_vi ILIKE $${values.length + 1})`,
      );
      values.push(`%${query.q.trim()}%`);
    }
    const res = await this.db.query<TokenRow>(
      `SELECT id, company_id, token_key, source_path, ring, domain, label_vi, status,
              origin, extension_field_ref, meta_json, version, archived_at,
              created_at, updated_at, created_by, updated_by
       FROM public.hrm_merge_tokens
       WHERE ${filters.join(' AND ')}
       ORDER BY token_key ASC;`,
      values,
    );
    return {
      items: res.rows.map((r) => this.display(r)),
      total: res.rows.length,
    };
  }

  async getTokenById(
    tokenId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [tokenId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<TokenRow>(
      `SELECT id, company_id, token_key, source_path, ring, domain, label_vi, status,
              origin, extension_field_ref, meta_json, version, archived_at,
              created_at, updated_at, created_by, updated_by
       FROM public.hrm_merge_tokens
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_PLT_TOK_404,
        'Merge token not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_PLT_TOK_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.display(row);
  }

  async upsertToken(
    payload: UpsertMergeTokenDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    actor?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.companyId,
      scopeContext,
    );
    const { scope } = this.resolveScope(
      authorization,
      payload.companyId,
      scopeContext,
    );
    assertResourceInHrmScope({ company_id: companyId }, scope, {
      notFoundCode: 'HRM-SCOPE-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    const tokenKey = this.assertTokenKeyFormat(payload.tokenKey);
    const sourcePath = String(payload.sourcePath ?? '').trim();
    if (!sourcePath) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'sourcePath is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const ring = this.assertRing(payload.ring);
    const domain = this.assertDomain(payload.domain);
    const labelVi = String(payload.labelVi ?? '').trim();
    if (!labelVi) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'labelVi is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = this.assertStatus(payload.status ?? 'active');
    const origin = this.assertOrigin(payload.origin ?? 'builtin');
    const extensionFieldRef =
      payload.extensionFieldRef != null
        ? String(payload.extensionFieldRef).trim() || null
        : null;
    if (origin === 'extension_field' && !extensionFieldRef) {
      throw new ApiException(
        HRM_PLT_CAT_CODE_INVALID,
        'extensionFieldRef required when origin=extension_field',
        HttpStatus.BAD_REQUEST,
      );
    }
    const metaJson = payload.meta ? JSON.stringify(payload.meta) : null;

    const existing = await this.db.query<TokenRow>(
      `SELECT id, company_id, token_key, source_path, ring, domain, label_vi, status,
              origin, extension_field_ref, meta_json, version, archived_at,
              created_at, updated_at, created_by, updated_by
       FROM public.hrm_merge_tokens
       WHERE company_id = $1 AND lower(token_key) = lower($2) AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, tokenKey],
    );

    if (existing.rows[0]) {
      const prev = existing.rows[0];
      const materialChange =
        prev.source_path !== sourcePath ||
        prev.ring !== ring ||
        prev.domain !== domain ||
        prev.label_vi !== labelVi ||
        prev.origin !== origin ||
        (prev.extension_field_ref ?? null) !== extensionFieldRef;
      const nextVersion = materialChange
        ? Number(prev.version) + 1
        : Number(prev.version);
      const upd = await this.db.query<TokenRow>(
        `UPDATE public.hrm_merge_tokens
         SET source_path = $2,
             ring = $3,
             domain = $4,
             label_vi = $5,
             status = $6,
             origin = $7,
             extension_field_ref = $8,
             meta_json = COALESCE($9::jsonb, meta_json),
             version = $10,
             updated_at = NOW(),
             updated_by = $11
         WHERE id = $1::uuid
         RETURNING id, company_id, token_key, source_path, ring, domain, label_vi, status,
                   origin, extension_field_ref, meta_json, version, archived_at,
                   created_at, updated_at, created_by, updated_by;`,
        [
          prev.id,
          sourcePath,
          ring,
          domain,
          labelVi,
          status,
          origin,
          extensionFieldRef,
          metaJson,
          nextVersion,
          actor ?? null,
        ],
      );
      return this.display(upd.rows[0]);
    }

    const id = randomUUID();
    try {
      const ins = await this.db.query<TokenRow>(
        `INSERT INTO public.hrm_merge_tokens
          (id, company_id, token_key, source_path, ring, domain, label_vi, status, origin,
           extension_field_ref, meta_json, version, created_by, updated_by)
         VALUES
          ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, 1, $12, $12)
         RETURNING id, company_id, token_key, source_path, ring, domain, label_vi, status,
                   origin, extension_field_ref, meta_json, version, archived_at,
                   created_at, updated_at, created_by, updated_by;`,
        [
          id,
          companyId,
          tokenKey,
          sourcePath,
          ring,
          domain,
          labelVi,
          status,
          origin,
          extensionFieldRef,
          metaJson,
          actor ?? null,
        ],
      );
      return this.display(ins.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/unique|duplicate|uq_hrm_merge_tok/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_CONFLICT,
          'Active token_key already exists for company',
          HttpStatus.CONFLICT,
        );
      }
      if (/chk_hrm_merge_tok_key_format|check constraint/i.test(msg)) {
        throw new ApiException(
          HRM_PLT_CAT_CODE_INVALID,
          'tokenKey format invalid',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw err;
    }
  }

  async patchToken(
    tokenId: string,
    requestedCompanyId: string,
    payload: PatchMergeTokenDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    actor?: string,
  ) {
    const current = await this.getTokenById(
      tokenId,
      requestedCompanyId,
      authorization,
      scopeContext,
    );
    return this.upsertToken(
      {
        companyId: current.companyId,
        tokenKey: current.tokenKey,
        sourcePath: payload.sourcePath ?? current.sourcePath,
        ring: payload.ring ?? current.ring,
        domain: payload.domain ?? current.domain,
        labelVi: payload.labelVi ?? current.labelVi,
        status: payload.status ?? current.status,
        origin: payload.origin ?? current.origin,
        extensionFieldRef:
          payload.extensionFieldRef !== undefined
            ? payload.extensionFieldRef
            : (current.extensionFieldRef ?? undefined),
        meta: payload.meta ?? current.meta ?? undefined,
      },
      authorization,
      scopeContext,
      actor,
    );
  }

  async retireToken(
    tokenId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    actor?: string,
  ) {
    await this.ensureSchema();
    const current = await this.getTokenById(
      tokenId,
      requestedCompanyId,
      authorization,
      scopeContext,
    );
    const res = await this.db.query<TokenRow>(
      `UPDATE public.hrm_merge_tokens
       SET status = 'retired',
           archived_at = COALESCE(archived_at, NOW()),
           updated_at = NOW(),
           updated_by = $2
       WHERE id = $1::uuid
       RETURNING id, company_id, token_key, source_path, ring, domain, label_vi, status,
                 origin, extension_field_ref, meta_json, version, archived_at,
                 created_at, updated_at, created_by, updated_by;`,
      [current.id, actor ?? null],
    );
    return this.display(res.rows[0]);
  }

  async resolvePreview(
    payload: ResolveMergePreviewDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveScope(
      authorization,
      payload.companyId,
      scopeContext,
    );
    assertResourceInHrmScope(
      {
        company_id: resolveHrmPersistCompanyIdText(
          authorization,
          payload.companyId,
          scopeContext,
        ),
      },
      scope,
      {
        notFoundCode: 'HRM-SCOPE-404',
        mismatchCode: 'HRM-SCOPE-409',
      },
    );

    const registry = await this.loadActiveRegistry(
      payload.companyId,
      authorization,
      scopeContext,
      payload.domain,
    );

    let keywordMap: Record<string, unknown> = {};
    if (payload.templateId) {
      const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
      const values: unknown[] = [payload.templateId];
      pushCompanyIdFilter(filters, values, expandedCompanyIds);
      const tpl = await this.db.query<{
        id: string;
        company_id: string;
        keyword_map: Record<string, unknown> | string;
      }>(
        `SELECT id, company_id, keyword_map FROM public.hrm_contract_templates
         WHERE ${filters.join(' AND ')} LIMIT 1;`,
        values,
      );
      const row = tpl.rows[0];
      if (!row) {
        throw new ApiException(
          'HRM-CTR-TPL-404',
          'Template not found',
          HttpStatus.NOT_FOUND,
        );
      }
      assertResourceInHrmScope(row, scope, {
        notFoundCode: 'HRM-CTR-TPL-404',
        mismatchCode: 'HRM-SCOPE-409',
      });
      keywordMap =
        typeof row.keyword_map === 'string'
          ? (JSON.parse(row.keyword_map) as Record<string, unknown>)
          : (row.keyword_map ?? {});
    }

    let valueBag: Record<string, unknown> = {};
    if (payload.contractId) {
      const values: unknown[] = [payload.contractId];
      // soft presence — full print load lives in ContractLegalPrintService; lightweight here
      let companyPred: string;
      if (expandedCompanyIds.length === 1) {
        values.push(expandedCompanyIds[0]);
        companyPred = `c.company_id = $${values.length}::text`;
      } else {
        values.push(expandedCompanyIds);
        companyPred = `c.company_id = ANY($${values.length}::text[])`;
      }
      const ctr = await this.db.query<{
        id: string;
        company_id: string;
        contract_code: string | null;
        start_date: string | null;
        end_date: string | null;
        employee_name: string | null;
        driver_license_number: string | null;
        license_class: string | null;
        vehicle_plate: string | null;
      }>(
        `SELECT c.id, c.company_id, c.contract_code, c.start_date::text, c.end_date::text,
                e.full_name AS employee_name,
                c.driver_license_number, c.license_class, c.vehicle_plate
         FROM public.employee_contracts c
         LEFT JOIN public.employees e ON e.id = c.employee_id
         WHERE c.id = $1::uuid AND ${companyPred}
         LIMIT 1;`,
        values,
      );
      const row = ctr.rows[0];
      if (!row) {
        throw new ApiException(
          'HRM-CON-404',
          'Contract not found',
          HttpStatus.NOT_FOUND,
        );
      }
      assertResourceInHrmScope(row, scope, {
        notFoundCode: 'HRM-CON-404',
        mismatchCode: 'HRM-SCOPE-409',
      });
      valueBag = {
        employee_full_name: row.employee_name,
        contract_code: row.contract_code,
        contract_number: row.contract_code,
        effective_from: row.start_date,
        effective_to: row.end_date,
        driver_license_number: row.driver_license_number,
        license_class: row.license_class,
        driver_license_class: row.license_class,
        vehicle_plate: row.vehicle_plate,
      };
    }

    // F-EMP-TOK-05 — enrich bag from effective DOC/ET labels (DATA §5.2 registry values)
    valueBag = await this.enrichEmpCatalogResolveBag(
      valueBag,
      expandedCompanyIds,
      payload.companyId,
    );

    let resolved;
    try {
      resolved = resolveMergeTokens({
        registry,
        keywordMap,
        valueBag,
        tokenKeys: payload.tokenKeys,
        fieldOverrides: payload.fieldOverrides,
        canViewCb: payload.canViewCb,
        strict: payload.strict,
      });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === HRM_PLT_SCHEMA_INVALID) {
        throw new ApiException(
          HRM_PLT_SCHEMA_INVALID,
          e.message ?? 'Invalid merge schema',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw err;
    }

    if (
      payload.strict &&
      resolved.warnings.some((w) => w.startsWith('HRM-PLT-TOKEN-UNKNOWN'))
    ) {
      throw new ApiException(
        HRM_PLT_TOKEN_UNKNOWN,
        'Mandatory merge token missing',
        HttpStatus.BAD_REQUEST,
        { warnings: resolved.warnings },
      );
    }

    return {
      companyId: payload.companyId,
      templateId: payload.templateId ?? null,
      resolveOrder: resolved.resolveOrder,
      tokens: resolved.tokens,
      mergedPreview: resolved.mergedPreview,
      warnings: resolved.warnings,
    };
  }

  /**
   * F-EMP-TOK-05 — load DOC/ET name_vi (active + retired-for-history) into resolve bag.
   * Missing tables / empty catalogs → soft no-op (FORBIDDEN invent labels).
   */
  private async enrichEmpCatalogResolveBag(
    valueBag: Record<string, unknown>,
    expandedCompanyIds: string[],
    _requestedCompanyId: string,
  ): Promise<Record<string, unknown>> {
    const documentTypeLabels = new Map<string, string>();
    const employmentTypeLabels = new Map<string, string>();

    const companyPred =
      expandedCompanyIds.length === 1
        ? `company_id = $1::text`
        : `company_id = ANY($1::text[])`;
    const companyArg =
      expandedCompanyIds.length === 1
        ? expandedCompanyIds[0]
        : expandedCompanyIds;

    try {
      const docs = await this.db.query<{
        document_type_key: string;
        name_vi: string;
      }>(
        `SELECT document_type_key, name_vi
         FROM public.emp_document_type
         WHERE ${companyPred}
         ORDER BY archived_at NULLS FIRST, updated_at DESC;`,
        [companyArg],
      );
      for (const row of docs.rows) {
        const k = String(row.document_type_key ?? '')
          .trim()
          .toLowerCase();
        if (!k || documentTypeLabels.has(k)) continue;
        documentTypeLabels.set(k, String(row.name_vi ?? '').trim() || k);
      }
    } catch {
      // table may be absent on older envs — soft skip
    }

    try {
      const ets = await this.db.query<{
        employment_type_key: string;
        name_vi: string;
      }>(
        `SELECT employment_type_key, name_vi
         FROM public.emp_employment_type
         WHERE ${companyPred}
         ORDER BY archived_at NULLS FIRST, updated_at DESC;`,
        [companyArg],
      );
      for (const row of ets.rows) {
        const k = String(row.employment_type_key ?? '')
          .trim()
          .toLowerCase()
          .replace(/-/g, '_');
        if (!k || employmentTypeLabels.has(k)) continue;
        employmentTypeLabels.set(k, String(row.name_vi ?? '').trim() || k);
      }
    } catch {
      // soft skip
    }

    const etFromBag =
      valueBag.employment_type != null
        ? String(valueBag.employment_type)
        : valueBag.employee_employment_type != null
          ? String(valueBag.employee_employment_type)
          : null;

    return enrichEmpCatalogLabelsIntoBag({
      valueBag,
      documentTypeLabels,
      employmentTypeLabels,
      employeeEmploymentTypeKey: etFromBag,
    });
  }
}
