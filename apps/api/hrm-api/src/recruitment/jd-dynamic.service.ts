/**
 * @CODE-MEMORY
 * Screen:     HRM Cài đặt JD (trường/bố cục/nhóm/gói/rule) + resolve pack Thư viện JD
 * UC:         UC-BP-REC-00a/b · UC-00d..00h · F-JD-DEF/LAY/GRP/PACK/RULE/RESOLVE
 * BR:         BR-BP-JD-DYN-* · VAL-GRP-* · title-first · fail-closed CORP_DEFAULT
 * SRS:        docs/program/specs/PO-HRM-JD-DYNAMIC-SPEC-01.md · PO-HRM-JD-GROUP-SPEC-01.md
 * TechSpec:   PO-HRM-JD-DYNAMIC-ARCH-02.md §2–§3 · PO-HRM-JD-GROUP-ARCH-01.md §3
 * DB_DESIGN:  ARCH-02 §3 · GROUP-DATA-01 §4 (ALIGNED-BENCHMARK)
 * API_DESIGN: ARCH-02 §2 F.1 · GROUP-ARCH §3.6
 * Purpose:    CFG SoT rec_jd_* — field catalog, L1 layout, groups, packs, pack rules + resolve.
 * WorkItem:   PO-HRM-JD-DYNAMIC-BE-01 · PO-HRM-JD-DYNAMIC-BE-02
 * Coded:      2026-08-06
 * Callers:    recruitment.controller · RecruitmentCatalogService (snapshot clone / resolve)
 * Callees:    HrmDbService · resolveHrmListScope / assertResourceInHrmScope
 * FEActions:  Settings CRUD → F5; Thêm JD → resolve pack → always_on groups
 * BEChain:    ensureSchema → scope filter → soft archive only
 * Impact:     Sai scope → member đọc CT khác; sai resolve → pack office trên lái xe
 * must_keep:  YCTD job_template_id · HRM-REC-JD-POS · FORBIDDEN dual-write job_postings · U65 no UAT seed
 * SOLID:      CFG layer tách khỏi RecruitmentCatalogService (TXN JD master)
 * LastVerified: docs/qa/evidence/po-hrm-jd-dynamic-be-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-BE-01
 * change_mode: ADD
 * What: Field/layout/group/pack/rule schema + APIs + pack resolve fail-closed CORP/COMPANY_DEFAULT
 * Why: Sponsor Option A + group/pack layer unlock after GROUP triad PASS
 * must_keep: ARCH-02 A/Q1/Q6 · snapshot v2 groups · scope_parity list↔get · soft-delete
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-BE-02
 * change_mode: FIX
 * What: Explicit return types on enrichLayout/enrichGroup/enrichPack — TS drop of spread Record keys blocked nest --watch
 * Why: QA FAIL BE-COMPILE-BLOCK — 4 TS errors → JD CFG/resolve routes 404 from stale dist
 * must_keep: no dual-write job_postings · snapshot v2 · pack resolve fail-closed · scope_parity
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter as pushCompanyIdFilterBase,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  JD_FIELD_TYPES,
  JD_GROUP_KINDS,
  JD_GROUP_USAGES,
  JD_PACK_MATCH_TYPES,
  JD_SYSTEM_FIELD_KEYS,
  JD_VIEW_STYLES,
  PACK_CORP_DEFAULT,
  PACK_DRIVER_OPS,
  PACK_IT_OFFICE,
  PACK_MEMBERSHIP,
  SELECT_CATALOG_ALLOWLIST,
  SYSTEM_GROUP_DEFS,
  normalizePackCode,
  type JdFieldType,
} from './jd-dynamic.constants';

/** Same as pushCompanyIdFilter with optional qualified column (e.g. `l.company_id`). */
function pushCompanyIdFilter(
  filters: string[],
  values: unknown[],
  companyIds: string[],
  column = 'company_id',
): void {
  if (column === 'company_id') {
    pushCompanyIdFilterBase(filters, values, companyIds);
    return;
  }
  if (!companyIds.length) {
    filters.push('FALSE');
    return;
  }
  const start = values.length + 1;
  companyIds.forEach((id) => values.push(id));
  const placeholders = companyIds.map((_, i) => `$${start + i}`).join(', ');
  filters.push(`${column} IN (${placeholders})`);
}

export type JdSnapshotField = {
  field_id?: string;
  field_key: string;
  label: string;
  field_type: string;
  is_required: boolean;
  sort_order: number;
};

export type JdSnapshotGroup = {
  group_id?: string;
  group_code: string;
  label: string;
  view_style: string;
  sort_order: number;
  source:
    | 'pack_always_on'
    | 'optional_dnd'
    | 'optional_drag'
    | 'manual'
    | 'legacy';
  fields: JdSnapshotField[];
};

export type JdLayoutSnapshotV2 = {
  layout_version: number;
  pack_code?: string;
  pack_label?: string;
  pack?: {
    pack_id?: string;
    pack_code: string;
    pack_label?: string;
    resolved_by?: string;
    match_value?: string | null;
    resolved_from_rule_id?: string | null;
  };
  resolved_from_rule_id?: string | null;
  groups: JdSnapshotGroup[];
};

/** Layout row + items — explicit so spread of DB row is not erased by TS. */
export type JdFormLayoutDetail = {
  id: string;
  company_id: string;
  name: string | null;
  is_default: boolean;
  status: string | null;
  created_at?: unknown;
  updated_at?: unknown;
  items: Array<Record<string, unknown>>;
};

/** Group def + fields — explicit return for get/list/update. */
export type JdGroupDefDetail = {
  id: string;
  company_id: string;
  code: string;
  label: string;
  kind: string;
  usage: string;
  view_style: string;
  sort_order: number;
  is_active: boolean;
  created_at?: unknown;
  updated_at?: unknown;
  fields: Array<Record<string, unknown>>;
};

/** Pack group membership as returned by enrichPack / resolve. */
export type JdPackGroupDetail = {
  group_id: string;
  group_code: string;
  label: string;
  view_style: string;
  usage: string;
  kind: string;
  sort_order: number;
  always_on: boolean;
  fields: JdSnapshotField[];
};

/** Default pack + groups — explicit so pack.id / pack.label survive resolve casts. */
export type JdDefaultPackDetail = {
  id: string;
  company_id: string;
  code: string;
  label: string;
  description?: string | null;
  is_company_fallback?: boolean;
  is_system?: boolean;
  status?: string | null;
  is_active?: boolean;
  created_at?: unknown;
  updated_at?: unknown;
  groups: JdPackGroupDetail[];
};

@Injectable()
export class JdDynamicService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_field_def (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        field_key TEXT NOT NULL,
        label TEXT NOT NULL,
        field_type TEXT NOT NULL,
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        section_hint TEXT NULL,
        applies_to_company_ids JSONB NULL,
        validation_json JSONB NULL,
        is_system BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by TEXT NULL,
        updated_by TEXT NULL
      );
    `);
    await this.db.query(
      `CREATE INDEX IF NOT EXISTS ix_rec_jd_field_def_company ON public.rec_jd_field_def (company_id)`,
    );
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_field_def_company_key_active
      ON public.rec_jd_field_def (company_id, field_key) WHERE archived_at IS NULL
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_form_layout (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'draft',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_form_layout_default
      ON public.rec_jd_form_layout (company_id)
      WHERE is_default = TRUE AND archived_at IS NULL
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_form_layout_item (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        layout_id UUID NOT NULL REFERENCES public.rec_jd_form_layout (id) ON DELETE CASCADE,
        field_id UUID NOT NULL REFERENCES public.rec_jd_field_def (id),
        section TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        company_id TEXT NOT NULL
      );
    `);
    await this.db.query(
      `CREATE INDEX IF NOT EXISTS ix_rec_jd_form_layout_item_layout ON public.rec_jd_form_layout_item (layout_id, section, sort_order)`,
    );

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_group_def (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        kind TEXT NOT NULL,
        usage TEXT NOT NULL,
        view_style TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by TEXT NULL,
        updated_by TEXT NULL
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_group_def_company_code_active
      ON public.rec_jd_group_def (company_id, code) WHERE archived_at IS NULL
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_group_field (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID NOT NULL REFERENCES public.rec_jd_group_def (id) ON DELETE CASCADE,
        field_id UUID NOT NULL REFERENCES public.rec_jd_field_def (id),
        company_id TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_required_in_group BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_group_field_pair
      ON public.rec_jd_group_field (group_id, field_id)
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_default_pack (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        description TEXT NULL,
        is_company_fallback BOOLEAN NOT NULL DEFAULT FALSE,
        is_system BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'published',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by TEXT NULL,
        updated_by TEXT NULL
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_default_pack_company_code_active
      ON public.rec_jd_default_pack (company_id, code) WHERE archived_at IS NULL
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_pack_group (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pack_id UUID NOT NULL REFERENCES public.rec_jd_default_pack (id) ON DELETE CASCADE,
        group_id UUID NOT NULL REFERENCES public.rec_jd_group_def (id),
        company_id TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        always_on BOOLEAN NOT NULL DEFAULT TRUE
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_jd_pack_group_pair
      ON public.rec_jd_pack_group (pack_id, group_id)
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.rec_jd_pack_rule (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 100,
        match_type TEXT NOT NULL,
        match_value TEXT NULL,
        pack_id UUID NOT NULL REFERENCES public.rec_jd_default_pack (id),
        condition_json JSONB NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_rec_jd_pack_rule_company_priority
      ON public.rec_jd_pack_rule (company_id, priority)
      WHERE archived_at IS NULL AND is_active = TRUE
    `);

    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS values_json JSONB NULL`,
    );
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS layout_snapshot_json JSONB NULL`,
    );
    await this.db.query(
      `ALTER TABLE public.job_description_templates ADD COLUMN IF NOT EXISTS layout_version INTEGER NOT NULL DEFAULT 1`,
    );

    this.schemaReady = true;
  }

  /** Config bootstrap (≠ UAT seed): system fields/groups/packs/rules per company. */
  async ensureCompanyBootstrap(companyId: string): Promise<void> {
    await this.ensureSchema();
    const cid = companyId.trim();
    if (!cid) return;

    const fieldCount = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.rec_jd_field_def WHERE company_id = $1 AND archived_at IS NULL`,
      [cid],
    );
    if (Number(fieldCount.rows[0]?.c ?? 0) === 0) {
      const systemFields: Array<{
        key: string;
        label: string;
        type: JdFieldType;
        required: boolean;
        sort: number;
        hint: string;
      }> = [
        {
          key: 'title',
          label: 'Chức danh / Tiêu đề JD',
          type: 'short_text',
          required: true,
          sort: 0,
          hint: 'hero',
        },
        {
          key: 'code',
          label: 'Mã JD',
          type: 'short_text',
          required: true,
          sort: 1,
          hint: 'meta',
        },
        {
          key: 'position_code',
          label: 'Mã chức danh',
          type: 'select',
          required: true,
          sort: 2,
          hint: 'meta',
        },
        {
          key: 'responsibilities',
          label: 'Trách nhiệm',
          type: 'long_text',
          required: false,
          sort: 10,
          hint: 'responsibilities',
        },
        {
          key: 'requirements',
          label: 'Yêu cầu',
          type: 'long_text',
          required: false,
          sort: 11,
          hint: 'requirements',
        },
      ];
      for (const f of systemFields) {
        const validation =
          f.key === 'position_code'
            ? JSON.stringify({ source: 'catalog', catalog_key: 'job_titles' })
            : null;
        await this.db.query(
          `INSERT INTO public.rec_jd_field_def
            (id, company_id, field_key, label, field_type, is_required, sort_order, section_hint, validation_json, is_system, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,TRUE,TRUE)
           ON CONFLICT DO NOTHING`,
          [
            randomUUID(),
            cid,
            f.key,
            f.label,
            f.type,
            f.required,
            f.sort,
            f.hint,
            validation,
          ],
        );
      }
    }

    const groupCount = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.rec_jd_group_def WHERE company_id = $1 AND archived_at IS NULL`,
      [cid],
    );
    if (Number(groupCount.rows[0]?.c ?? 0) === 0) {
      const groupIds = new Map<string, string>();
      for (const g of SYSTEM_GROUP_DEFS) {
        const id = randomUUID();
        groupIds.set(g.code, id);
        await this.db.query(
          `INSERT INTO public.rec_jd_group_def
            (id, company_id, code, label, kind, usage, view_style, sort_order, is_active)
           VALUES ($1,$2,$3,$4,'system_skeleton',$5,$6,$7,TRUE)`,
          [id, cid, g.code, g.label, g.usage, g.view_style, g.sort_order],
        );
      }
      const titleField = await this.db.query<{ id: string }>(
        `SELECT id::text AS id FROM public.rec_jd_field_def
         WHERE company_id = $1 AND field_key = 'title' AND archived_at IS NULL LIMIT 1`,
        [cid],
      );
      const titleId = titleField.rows[0]?.id;
      const metaId = groupIds.get('SEC_META');
      if (titleId && metaId) {
        await this.db.query(
          `INSERT INTO public.rec_jd_group_field (id, group_id, field_id, company_id, sort_order, is_required_in_group)
           VALUES ($1,$2::uuid,$3::uuid,$4,0,TRUE)
           ON CONFLICT DO NOTHING`,
          [randomUUID(), metaId, titleId, cid],
        );
      }
      for (const [fieldKey, groupCode] of [
        ['code', 'SEC_META'],
        ['position_code', 'SEC_META'],
        ['responsibilities', 'SEC_RESPONSIBILITIES'],
        ['requirements', 'SEC_REQ_MIN'],
      ] as const) {
        const fr = await this.db.query<{ id: string }>(
          `SELECT id::text AS id FROM public.rec_jd_field_def
           WHERE company_id = $1 AND field_key = $2 AND archived_at IS NULL LIMIT 1`,
          [cid, fieldKey],
        );
        const gid = groupIds.get(groupCode);
        if (fr.rows[0]?.id && gid) {
          await this.db.query(
            `INSERT INTO public.rec_jd_group_field (id, group_id, field_id, company_id, sort_order, is_required_in_group)
             VALUES ($1,$2::uuid,$3::uuid,$4,$5,FALSE)
             ON CONFLICT DO NOTHING`,
            [
              randomUUID(),
              gid,
              fr.rows[0].id,
              cid,
              fieldKey === 'code' ? 1 : fieldKey === 'position_code' ? 2 : 0,
            ],
          );
        }
      }

      for (const packCode of [
        PACK_IT_OFFICE,
        PACK_DRIVER_OPS,
        PACK_CORP_DEFAULT,
      ]) {
        const packId = randomUUID();
        const label =
          packCode === PACK_IT_OFFICE
            ? 'IT / văn phòng công nghệ'
            : packCode === PACK_DRIVER_OPS
              ? 'Lái xe / vận hành logistics'
              : 'Mặc định pháp nhân';
        await this.db.query(
          `INSERT INTO public.rec_jd_default_pack
            (id, company_id, code, label, is_company_fallback, is_system, status, is_active)
           VALUES ($1,$2,$3,$4,$5,TRUE,'published',TRUE)`,
          [packId, cid, packCode, label, packCode === PACK_CORP_DEFAULT],
        );
        const mem = PACK_MEMBERSHIP[packCode];
        let order = 0;
        for (const gc of mem.always_on) {
          const gid = groupIds.get(gc);
          if (!gid) continue;
          await this.db.query(
            `INSERT INTO public.rec_jd_pack_group (id, pack_id, group_id, company_id, sort_order, always_on)
             VALUES ($1,$2::uuid,$3::uuid,$4,$5,TRUE)`,
            [randomUUID(), packId, gid, cid, order++],
          );
        }
        for (const gc of mem.optional) {
          const gid = groupIds.get(gc);
          if (!gid) continue;
          await this.db.query(
            `INSERT INTO public.rec_jd_pack_group (id, pack_id, group_id, company_id, sort_order, always_on)
             VALUES ($1,$2::uuid,$3::uuid,$4,$5,FALSE)`,
            [randomUUID(), packId, gid, cid, order++],
          );
        }
      }

      const packs = await this.db.query<{ id: string; code: string }>(
        `SELECT id::text AS id, code FROM public.rec_jd_default_pack
         WHERE company_id = $1 AND archived_at IS NULL`,
        [cid],
      );
      const byCode = new Map(packs.rows.map((r) => [r.code, r.id]));
      const rules: Array<{
        priority: number;
        match_type: string;
        match_value: string | null;
        pack: string;
      }> = [
        {
          priority: 10,
          match_type: 'job_family',
          match_value: 'IT',
          pack: PACK_IT_OFFICE,
        },
        {
          priority: 10,
          match_type: 'job_family',
          match_value: 'TECH',
          pack: PACK_IT_OFFICE,
        },
        {
          priority: 10,
          match_type: 'job_family',
          match_value: 'SOFTWARE',
          pack: PACK_IT_OFFICE,
        },
        {
          priority: 10,
          match_type: 'job_family',
          match_value: 'DRIVER',
          pack: PACK_DRIVER_OPS,
        },
        {
          priority: 10,
          match_type: 'job_family',
          match_value: 'FLEET',
          pack: PACK_DRIVER_OPS,
        },
        {
          priority: 10,
          match_type: 'job_family',
          match_value: 'LOGISTICS_OPS',
          pack: PACK_DRIVER_OPS,
        },
        {
          priority: 100,
          match_type: 'fallback',
          match_value: null,
          pack: PACK_CORP_DEFAULT,
        },
      ];
      for (const r of rules) {
        const packId = byCode.get(r.pack);
        if (!packId) continue;
        await this.db.query(
          `INSERT INTO public.rec_jd_pack_rule
            (id, company_id, priority, match_type, match_value, pack_id, is_active)
           VALUES ($1,$2,$3,$4,$5,$6::uuid,TRUE)`,
          [randomUUID(), cid, r.priority, r.match_type, r.match_value, packId],
        );
      }
    }
  }

  // ─── Field defs (F-JD-DEF) ─────────────────────────────────────────────

  async listFieldDefs(
    companyId: string,
    authorization?: string,
    active?: string,
  ) {
    await this.ensureSchema();
    const persistCid = resolveHrmPersistCompanyIdText(authorization, companyId);
    await this.ensureCompanyBootstrap(persistCid);
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const a = active?.trim().toLowerCase();
    if (a === 'true' || a === '1' || a === 'active')
      filters.push('is_active = TRUE');
    else if (a === 'false' || a === '0' || a === 'inactive')
      filters.push('is_active = FALSE');
    const res = await this.db.query(
      `SELECT id, company_id, field_key, label, field_type, is_required, sort_order, section_hint,
              validation_json, is_system, is_active, applies_to_company_ids, created_at, updated_at
       FROM public.rec_jd_field_def
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, field_key ASC`,
      values,
    );
    return { items: res.rows, total: res.rows.length };
  }

  async getFieldDefById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT id, company_id, field_key, label, field_type, is_required, sort_order, section_hint,
              validation_json, is_system, is_active, applies_to_company_ids, created_at, updated_at
       FROM public.rec_jd_field_def WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-JD-FIELD-404',
        'JD field definition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0];
  }

  async createFieldDef(
    payload: {
      company_id: string;
      field_key: string;
      label: string;
      field_type: string;
      is_required?: boolean;
      sort_order?: number;
      section_hint?: string;
      validation_json?: Record<string, unknown> | null;
      applies_to_company_ids?: string[] | null;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    await this.ensureCompanyBootstrap(companyId);
    const fieldKey = payload.field_key?.trim().toLowerCase();
    const label = payload.label?.trim();
    const fieldType = payload.field_type?.trim().toLowerCase();
    if (!fieldKey || !label || !fieldType) {
      throw new ApiException(
        'HRM-JD-FIELD-VAL',
        'field_key, label, field_type are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!/^[a-z][a-z0-9_]*$/.test(fieldKey)) {
      throw new ApiException(
        'HRM-JD-FIELD-VAL',
        'field_key must be snake_case',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(JD_FIELD_TYPES as readonly string[]).includes(fieldType)) {
      throw new ApiException(
        'HRM-JD-FIELD-TYPE',
        `Unknown field_type: ${fieldType}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    this.assertSelectValidation(fieldType, payload.validation_json);
    const dup = await this.db.query(
      `SELECT id FROM public.rec_jd_field_def
       WHERE company_id = $1 AND lower(field_key) = lower($2) AND archived_at IS NULL LIMIT 1`,
      [companyId, fieldKey],
    );
    if (dup.rows[0]) {
      throw new ApiException(
        'HRM-JD-FIELD-DUP',
        'field_key already exists',
        HttpStatus.CONFLICT,
      );
    }
    const res = await this.db.query(
      `INSERT INTO public.rec_jd_field_def
        (id, company_id, field_key, label, field_type, is_required, sort_order, section_hint,
         validation_json, applies_to_company_ids, is_system, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,FALSE,TRUE)
       RETURNING id, company_id, field_key, label, field_type, is_required, sort_order, section_hint,
                 validation_json, is_system, is_active, applies_to_company_ids, created_at, updated_at`,
      [
        randomUUID(),
        companyId,
        fieldKey,
        label,
        fieldType,
        payload.is_required === true,
        payload.sort_order ?? 100,
        payload.section_hint?.trim() || null,
        payload.validation_json
          ? JSON.stringify(payload.validation_json)
          : null,
        payload.applies_to_company_ids
          ? JSON.stringify(payload.applies_to_company_ids)
          : null,
      ],
    );
    return res.rows[0];
  }

  async updateFieldDef(
    id: string,
    companyId: string,
    payload: {
      label?: string;
      is_required?: boolean;
      sort_order?: number;
      section_hint?: string;
      validation_json?: Record<string, unknown> | null;
      is_active?: boolean;
      applies_to_company_ids?: string[] | null;
      field_type?: string;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getFieldDefById(id, companyId, authorization);
    if (
      payload.field_type !== undefined &&
      payload.field_type !== existing.field_type
    ) {
      const inUse = await this.fieldHasValues(
        existing.field_key as string,
        existing.company_id as string,
      );
      if (inUse) {
        throw new ApiException(
          'HRM-JD-FIELD-TYPE-LOCK',
          'Cannot change field_type after values exist',
          HttpStatus.CONFLICT,
        );
      }
      if (!(JD_FIELD_TYPES as readonly string[]).includes(payload.field_type)) {
        throw new ApiException(
          'HRM-JD-FIELD-TYPE',
          'Unknown field_type',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    if (payload.validation_json !== undefined) {
      this.assertSelectValidation(
        (payload.field_type ?? existing.field_type) as string,
        payload.validation_json,
      );
    }
    const setParts: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    const push = (col: string, v: unknown) => {
      values.push(v);
      setParts.push(`${col} = $${values.length}`);
    };
    if (payload.label !== undefined) push('label', payload.label.trim());
    if (payload.is_required !== undefined)
      push('is_required', payload.is_required);
    if (payload.sort_order !== undefined)
      push('sort_order', payload.sort_order);
    if (payload.section_hint !== undefined)
      push('section_hint', payload.section_hint?.trim() || null);
    if (payload.validation_json !== undefined) {
      push(
        'validation_json',
        payload.validation_json
          ? JSON.stringify(payload.validation_json)
          : null,
      );
      setParts[setParts.length - 1] =
        `validation_json = $${values.length}::jsonb`;
    }
    if (payload.is_active !== undefined) push('is_active', payload.is_active);
    if (payload.applies_to_company_ids !== undefined) {
      push(
        'applies_to_company_ids',
        payload.applies_to_company_ids
          ? JSON.stringify(payload.applies_to_company_ids)
          : null,
      );
      setParts[setParts.length - 1] =
        `applies_to_company_ids = $${values.length}::jsonb`;
    }
    if (payload.field_type !== undefined)
      push('field_type', payload.field_type);

    const scope = resolveHrmListScope(authorization, companyId);
    values.push(id);
    const filters = [`id = $${values.length}::uuid`, 'archived_at IS NULL'];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `UPDATE public.rec_jd_field_def SET ${setParts.join(', ')}
       WHERE ${filters.join(' AND ')}
       RETURNING id, company_id, field_key, label, field_type, is_required, sort_order, section_hint,
                 validation_json, is_system, is_active, applies_to_company_ids, created_at, updated_at`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-JD-FIELD-404',
        'JD field definition not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0];
  }

  async archiveFieldDef(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const existing = await this.getFieldDefById(id, companyId, authorization);
    if (
      existing.is_system ||
      (JD_SYSTEM_FIELD_KEYS as readonly string[]).includes(
        existing.field_key as string,
      )
    ) {
      throw new ApiException(
        'HRM-JD-FIELD-SYSTEM',
        'Cannot archive system field',
        HttpStatus.BAD_REQUEST,
      );
    }
    const inUse = await this.fieldHasValues(
      existing.field_key as string,
      existing.company_id as string,
    );
    if (inUse) {
      throw new ApiException(
        'HRM-JD-FIELD-INUSE',
        'Field referenced by JD values/snapshot',
        HttpStatus.CONFLICT,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    await this.db.query(
      `UPDATE public.rec_jd_field_def
       SET archived_at = NOW(), is_active = FALSE, updated_at = NOW()
       WHERE ${filters.join(' AND ')}`,
      values,
    );
    return { id, archived: true };
  }

  // ─── Layouts (F-JD-LAY) ────────────────────────────────────────────────

  async listLayouts(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT id, company_id, name, is_default, status, updated_at, created_at
       FROM public.rec_jd_form_layout
       WHERE ${filters.join(' AND ')}
       ORDER BY is_default DESC, updated_at DESC`,
      values,
    );
    return { items: res.rows, total: res.rows.length };
  }

  async getLayoutById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['l.id = $1::uuid', 'l.archived_at IS NULL'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds, 'l.company_id');
    const layout = await this.db.query(
      `SELECT l.id, l.company_id, l.name, l.is_default, l.status, l.updated_at, l.created_at
       FROM public.rec_jd_form_layout l
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    if (!layout.rows[0]) {
      throw new ApiException(
        'HRM-JD-LAYOUT-404',
        'JD form layout not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.enrichLayout(layout.rows[0]);
  }

  async getDefaultLayout(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const persistCid = resolveHrmPersistCompanyIdText(authorization, companyId);
    await this.ensureCompanyBootstrap(persistCid);
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['l.is_default = TRUE', 'l.archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds, 'l.company_id');
    const layout = await this.db.query(
      `SELECT l.id, l.company_id, l.name, l.is_default, l.status, l.updated_at, l.created_at
       FROM public.rec_jd_form_layout l
       WHERE ${filters.join(' AND ')}
       ORDER BY l.updated_at DESC LIMIT 1`,
      values,
    );
    if (!layout.rows[0]) {
      return {
        id: null,
        company_id: persistCid,
        name: null,
        is_default: true,
        status: null,
        items: [],
      };
    }
    return this.enrichLayout(layout.rows[0]);
  }

  async putDefaultLayout(
    payload: {
      company_id: string;
      name?: string;
      status?: 'draft' | 'published';
      items: Array<{ field_id: string; section: string; sort_order: number }>;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    await this.ensureCompanyBootstrap(companyId);
    const status = payload.status ?? 'published';
    const items = payload.items ?? [];
    if (status === 'published' && items.length === 0) {
      throw new ApiException(
        'HRM-JD-LAYOUT-EMPTY',
        'Cannot publish empty layout',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.validateLayoutItems(
      companyId,
      authorization,
      items,
      status === 'published',
    );

    const existing = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.rec_jd_form_layout
       WHERE company_id = $1 AND is_default = TRUE AND archived_at IS NULL LIMIT 1`,
      [companyId],
    );
    let layoutId = existing.rows[0]?.id;
    if (!layoutId) {
      layoutId = randomUUID();
      await this.db.query(
        `INSERT INTO public.rec_jd_form_layout (id, company_id, name, is_default, status)
         VALUES ($1,$2,$3,TRUE,$4)`,
        [
          layoutId,
          companyId,
          payload.name?.trim() || 'Layout mặc định JD',
          status,
        ],
      );
    } else {
      await this.db.query(
        `UPDATE public.rec_jd_form_layout
         SET name = COALESCE($2, name), status = $3, updated_at = NOW()
         WHERE id = $1::uuid`,
        [layoutId, payload.name?.trim() || null, status],
      );
      await this.db.query(
        `DELETE FROM public.rec_jd_form_layout_item WHERE layout_id = $1::uuid`,
        [layoutId],
      );
    }
    for (const it of items) {
      await this.db.query(
        `INSERT INTO public.rec_jd_form_layout_item (id, layout_id, field_id, section, sort_order, company_id)
         VALUES ($1,$2::uuid,$3::uuid,$4,$5,$6)`,
        [
          randomUUID(),
          layoutId,
          it.field_id,
          it.section,
          it.sort_order,
          companyId,
        ],
      );
    }
    return this.getLayoutById(layoutId, companyId, authorization);
  }

  // ─── Groups (F-JD-GRP) ─────────────────────────────────────────────────

  async listGroupDefs(
    companyId: string,
    authorization?: string,
    active?: string,
  ) {
    await this.ensureSchema();
    const persistCid = resolveHrmPersistCompanyIdText(authorization, companyId);
    await this.ensureCompanyBootstrap(persistCid);
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['g.archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds, 'g.company_id');
    const a = active?.trim().toLowerCase();
    if (a === 'true' || a === '1') filters.push('g.is_active = TRUE');
    else if (a === 'false' || a === '0') filters.push('g.is_active = FALSE');
    const groups = await this.db.query(
      `SELECT g.id, g.company_id, g.code, g.label, g.kind, g.usage, g.view_style, g.sort_order,
              g.is_active, g.created_at, g.updated_at
       FROM public.rec_jd_group_def g
       WHERE ${filters.join(' AND ')}
       ORDER BY g.sort_order ASC, g.code ASC`,
      values,
    );
    const items = [];
    for (const g of groups.rows) {
      items.push(await this.enrichGroup(g));
    }
    return { items, total: items.length };
  }

  async getGroupDefById(id: string, companyId: string, authorization?: string) {
    await this.ensureSchema();
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['g.id = $1::uuid', 'g.archived_at IS NULL'];
    const values: unknown[] = [id];
    pushCompanyIdFilter(filters, values, scope.companyIds, 'g.company_id');
    const res = await this.db.query(
      `SELECT g.id, g.company_id, g.code, g.label, g.kind, g.usage, g.view_style, g.sort_order,
              g.is_active, g.created_at, g.updated_at
       FROM public.rec_jd_group_def g
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-JD-GRP-404',
        'JD group not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.enrichGroup(res.rows[0]);
  }

  async createGroupDef(
    payload: {
      company_id: string;
      code: string;
      label: string;
      kind?: string;
      usage: string;
      view_style: string;
      sort_order?: number;
      fields?: Array<{
        field_id: string;
        sort_order: number;
        is_required_in_group?: boolean;
      }>;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    await this.ensureCompanyBootstrap(companyId);
    const code = payload.code?.trim().toUpperCase();
    const label = payload.label?.trim();
    const kind = (payload.kind ?? 'tenant_custom').trim();
    const usage = payload.usage?.trim();
    const viewStyle = payload.view_style?.trim();
    if (!code || !label || !usage || !viewStyle) {
      throw new ApiException(
        'HRM-JD-GROUP-VAL',
        'code, label, usage, view_style required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(JD_GROUP_KINDS as readonly string[]).includes(kind)) {
      throw new ApiException(
        'HRM-JD-GROUP-ENUM',
        'Invalid kind',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(JD_GROUP_USAGES as readonly string[]).includes(usage)) {
      throw new ApiException(
        'HRM-JD-GROUP-ENUM',
        'Invalid usage',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!(JD_VIEW_STYLES as readonly string[]).includes(viewStyle)) {
      throw new ApiException(
        'HRM-JD-GROUP-ENUM',
        'Invalid view_style',
        HttpStatus.BAD_REQUEST,
      );
    }
    const reserved = SYSTEM_GROUP_DEFS.some((g) => g.code === code);
    if (reserved && kind !== 'system_skeleton') {
      throw new ApiException(
        'HRM-JD-GROUP-CODE-RESERVED',
        'Reserved group code requires system_skeleton kind',
        HttpStatus.CONFLICT,
      );
    }
    const dup = await this.db.query(
      `SELECT id FROM public.rec_jd_group_def
       WHERE company_id = $1 AND code = $2 AND archived_at IS NULL LIMIT 1`,
      [companyId, code],
    );
    if (dup.rows[0]) {
      throw new ApiException(
        'HRM-JD-GROUP-DUP',
        'group code already exists',
        HttpStatus.CONFLICT,
      );
    }
    const id = randomUUID();
    await this.db.query(
      `INSERT INTO public.rec_jd_group_def
        (id, company_id, code, label, kind, usage, view_style, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE)`,
      [
        id,
        companyId,
        code,
        label,
        kind,
        usage,
        viewStyle,
        payload.sort_order ?? 100,
      ],
    );
    await this.replaceGroupFields(
      id,
      companyId,
      authorization,
      payload.fields ?? [],
    );
    return this.getGroupDefById(id, companyId, authorization);
  }

  async updateGroupDef(
    id: string,
    companyId: string,
    payload: {
      label?: string;
      usage?: string;
      view_style?: string;
      sort_order?: number;
      is_active?: boolean;
      fields?: Array<{
        field_id: string;
        sort_order: number;
        is_required_in_group?: boolean;
      }>;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getGroupDefById(id, companyId, authorization);
    if (
      payload.usage &&
      !(JD_GROUP_USAGES as readonly string[]).includes(payload.usage)
    ) {
      throw new ApiException(
        'HRM-JD-GROUP-ENUM',
        'Invalid usage',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      payload.view_style &&
      !(JD_VIEW_STYLES as readonly string[]).includes(payload.view_style)
    ) {
      throw new ApiException(
        'HRM-JD-GROUP-ENUM',
        'Invalid view_style',
        HttpStatus.BAD_REQUEST,
      );
    }
    const setParts: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    const push = (col: string, v: unknown) => {
      values.push(v);
      setParts.push(`${col} = $${values.length}`);
    };
    if (payload.label !== undefined) push('label', payload.label.trim());
    if (payload.usage !== undefined) push('usage', payload.usage);
    if (payload.view_style !== undefined)
      push('view_style', payload.view_style);
    if (payload.sort_order !== undefined)
      push('sort_order', payload.sort_order);
    if (payload.is_active !== undefined) push('is_active', payload.is_active);

    const scope = resolveHrmListScope(authorization, companyId);
    values.push(id);
    const filters = [`id = $${values.length}::uuid`, 'archived_at IS NULL'];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    await this.db.query(
      `UPDATE public.rec_jd_group_def SET ${setParts.join(', ')} WHERE ${filters.join(' AND ')}`,
      values,
    );
    if (payload.fields) {
      await this.replaceGroupFields(
        id,
        existing.company_id,
        authorization,
        payload.fields,
      );
    }
    return this.getGroupDefById(id, companyId, authorization);
  }

  // ─── Packs (F-JD-PCK) ──────────────────────────────────────────────────

  async listDefaultPacks(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const persistCid = resolveHrmPersistCompanyIdText(authorization, companyId);
    await this.ensureCompanyBootstrap(persistCid);
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query(
      `SELECT id, company_id, code, label, description, is_company_fallback, is_system, status,
              is_active, created_at, updated_at
       FROM public.rec_jd_default_pack
       WHERE ${filters.join(' AND ')}
       ORDER BY is_company_fallback DESC, code ASC`,
      values,
    );
    return { items: res.rows, total: res.rows.length };
  }

  async getDefaultPackByCode(
    code: string,
    companyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const persistCid = resolveHrmPersistCompanyIdText(authorization, companyId);
    await this.ensureCompanyBootstrap(persistCid);
    const packCode = normalizePackCode(code);
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['p.code = $1', 'p.archived_at IS NULL'];
    const values: unknown[] = [packCode];
    pushCompanyIdFilter(filters, values, scope.companyIds, 'p.company_id');
    const pack = await this.db.query(
      `SELECT p.id, p.company_id, p.code, p.label, p.description, p.is_company_fallback, p.is_system,
              p.status, p.is_active, p.created_at, p.updated_at
       FROM public.rec_jd_default_pack p
       WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    if (!pack.rows[0]) {
      throw new ApiException(
        'HRM-JD-PCK-404',
        'JD default pack not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.enrichPack(pack.rows[0]);
  }

  async putDefaultPack(
    code: string,
    payload: {
      company_id: string;
      label?: string;
      description?: string;
      is_company_fallback?: boolean;
      status?: string;
      groups: Array<{
        group_id?: string;
        group_code?: string;
        sort_order: number;
        always_on: boolean;
      }>;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    await this.ensureCompanyBootstrap(companyId);
    const packCode = normalizePackCode(code);
    const alwaysOn = (payload.groups ?? []).filter((g) => g.always_on);
    if (alwaysOn.length === 0) {
      throw new ApiException(
        'HRM-JD-PACK-EMPTY',
        'Pack requires always_on groups',
        HttpStatus.BAD_REQUEST,
      );
    }

    const pack = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.rec_jd_default_pack
       WHERE company_id = $1 AND code = $2 AND archived_at IS NULL LIMIT 1`,
      [companyId, packCode],
    );
    let packId = pack.rows[0]?.id;
    if (!packId) {
      if (payload.is_company_fallback) {
        await this.assertNoOtherFallback(companyId, null);
      }
      packId = randomUUID();
      await this.db.query(
        `INSERT INTO public.rec_jd_default_pack
          (id, company_id, code, label, description, is_company_fallback, is_system, status, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,FALSE,$7,TRUE)`,
        [
          packId,
          companyId,
          packCode,
          payload.label?.trim() || packCode,
          payload.description?.trim() || null,
          payload.is_company_fallback === true ||
            packCode === PACK_CORP_DEFAULT,
          payload.status ?? 'published',
        ],
      );
    } else {
      if (payload.is_company_fallback) {
        await this.assertNoOtherFallback(companyId, packId);
      }
      await this.db.query(
        `UPDATE public.rec_jd_default_pack
         SET label = COALESCE($2, label),
             description = COALESCE($3, description),
             is_company_fallback = COALESCE($4, is_company_fallback),
             status = COALESCE($5, status),
             updated_at = NOW()
         WHERE id = $1::uuid`,
        [
          packId,
          payload.label?.trim() || null,
          payload.description !== undefined
            ? payload.description?.trim() || null
            : null,
          payload.is_company_fallback,
          payload.status ?? null,
        ],
      );
      await this.db.query(
        `DELETE FROM public.rec_jd_pack_group WHERE pack_id = $1::uuid`,
        [packId],
      );
    }

    for (const g of payload.groups) {
      const groupId = await this.resolveGroupId(
        companyId,
        authorization,
        g.group_id,
        g.group_code,
      );
      const group = await this.getGroupDefById(
        groupId,
        companyId,
        authorization,
      );
      if (g.always_on && group.usage === 'optional_only') {
        throw new ApiException(
          'HRM-JD-PACK-GROUP-USAGE',
          'optional_only group cannot be always_on',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.db.query(
        `INSERT INTO public.rec_jd_pack_group (id, pack_id, group_id, company_id, sort_order, always_on)
         VALUES ($1,$2::uuid,$3::uuid,$4,$5,$6)`,
        [
          randomUUID(),
          packId,
          groupId,
          companyId,
          g.sort_order,
          g.always_on !== false,
        ],
      );
    }
    return this.getDefaultPackByCode(packCode, companyId, authorization);
  }

  // ─── Rules (F-JD-RUL) ──────────────────────────────────────────────────

  async listPackRules(companyId: string, authorization?: string) {
    await this.ensureSchema();
    const persistCid = resolveHrmPersistCompanyIdText(authorization, companyId);
    await this.ensureCompanyBootstrap(persistCid);
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['r.archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds, 'r.company_id');
    const res = await this.db.query(
      `SELECT r.id, r.company_id, r.priority, r.match_type, r.match_value, r.pack_id, r.condition_json,
              r.is_active, r.created_at, r.updated_at, p.code AS pack_code, p.label AS pack_label
       FROM public.rec_jd_pack_rule r
       JOIN public.rec_jd_default_pack p ON p.id = r.pack_id
       WHERE ${filters.join(' AND ')}
       ORDER BY r.priority ASC, r.id ASC`,
      values,
    );
    return { items: res.rows, total: res.rows.length };
  }

  async replacePackRules(
    payload: {
      company_id: string;
      rules: Array<{
        priority: number;
        match_type: string;
        match_value?: string | null;
        pack_id?: string;
        pack_code?: string;
        condition_json?: Record<string, unknown> | null;
        is_active?: boolean;
      }>;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    await this.ensureCompanyBootstrap(companyId);
    const rules = payload.rules ?? [];
    let fallbackCount = 0;
    for (const r of rules) {
      if (!(JD_PACK_MATCH_TYPES as readonly string[]).includes(r.match_type)) {
        throw new ApiException(
          'HRM-JD-PACK-RULE-VAL',
          'Invalid match_type',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (r.match_type === 'fallback') {
        fallbackCount += 1;
        if (r.match_value != null && String(r.match_value).trim() !== '') {
          throw new ApiException(
            'HRM-JD-PACK-RULE-VAL',
            'fallback match_value must be null',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      await this.resolvePackId(
        companyId,
        authorization,
        r.pack_id,
        r.pack_code,
      );
    }
    if (fallbackCount > 1) {
      throw new ApiException(
        'HRM-JD-PACK-FALLBACK-DUP',
        'At most one fallback rule',
        HttpStatus.CONFLICT,
      );
    }

    await this.db.query(
      `UPDATE public.rec_jd_pack_rule SET archived_at = NOW(), is_active = FALSE, updated_at = NOW()
       WHERE company_id = $1 AND archived_at IS NULL`,
      [companyId],
    );
    const inserted = [];
    for (const r of rules) {
      const packId = await this.resolvePackId(
        companyId,
        authorization,
        r.pack_id,
        r.pack_code,
      );
      const id = randomUUID();
      await this.db.query(
        `INSERT INTO public.rec_jd_pack_rule
          (id, company_id, priority, match_type, match_value, pack_id, condition_json, is_active)
         VALUES ($1,$2,$3,$4,$5,$6::uuid,$7::jsonb,$8)`,
        [
          id,
          companyId,
          r.priority,
          r.match_type,
          r.match_type === 'fallback' ? null : r.match_value?.trim() || null,
          packId,
          r.condition_json ? JSON.stringify(r.condition_json) : null,
          r.is_active !== false,
        ],
      );
      inserted.push(id);
    }
    return this.listPackRules(companyId, authorization);
  }

  /**
   * F-JD-RUL-03 — resolve pack fail-closed → PACK_CORP_DEFAULT / COMPANY_DEFAULT alias.
   */
  async resolvePack(
    payload: {
      company_id: string;
      position_code?: string;
      job_family?: string;
      industry?: string;
      employment_type?: string;
      work_mode?: string;
    },
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    await this.ensureCompanyBootstrap(companyId);
    const scope = resolveHrmListScope(authorization, payload.company_id);
    assertResourceInHrmScope({ company_id: companyId }, scope, {
      notFoundCode: 'HRM-JD-PCK-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    const jobFamily = (payload.job_family ?? '').trim().toUpperCase();
    const industry = (payload.industry ?? '').trim().toUpperCase();
    const empMode = [payload.employment_type, payload.work_mode]
      .filter(Boolean)
      .map((s) => String(s).trim().toLowerCase())
      .join('|');

    const rules = await this.db.query<{
      id: string;
      priority: number;
      match_type: string;
      match_value: string | null;
      pack_id: string;
      pack_code: string;
      pack_label: string;
    }>(
      `SELECT r.id::text AS id, r.priority, r.match_type, r.match_value,
              r.pack_id::text AS pack_id, p.code AS pack_code, p.label AS pack_label
       FROM public.rec_jd_pack_rule r
       JOIN public.rec_jd_default_pack p ON p.id = r.pack_id AND p.archived_at IS NULL AND p.is_active = TRUE
       WHERE r.company_id = $1 AND r.archived_at IS NULL AND r.is_active = TRUE
       ORDER BY r.priority ASC, r.id ASC`,
      [companyId],
    );

    let matched: (typeof rules.rows)[0] | undefined;
    for (const r of rules.rows) {
      if (r.match_type === 'job_family') {
        if (!jobFamily) continue;
        if ((r.match_value ?? '').toUpperCase() === jobFamily) {
          matched = r;
          break;
        }
        continue;
      }
      if (r.match_type === 'industry') {
        if (!industry) continue;
        if ((r.match_value ?? '').toUpperCase() === industry) {
          matched = r;
          break;
        }
        continue;
      }
      if (r.match_type === 'employment_work_mode') {
        if (!empMode) continue;
        if ((r.match_value ?? '').toLowerCase() === empMode) {
          matched = r;
          break;
        }
        continue;
      }
      if (r.match_type === 'fallback') {
        matched = r;
        break;
      }
    }

    if (!matched) {
      const fb = await this.db.query<{
        id: string;
        code: string;
        label: string;
      }>(
        `SELECT id::text AS id, code, label FROM public.rec_jd_default_pack
         WHERE company_id = $1 AND is_company_fallback = TRUE AND archived_at IS NULL AND is_active = TRUE
         LIMIT 1`,
        [companyId],
      );
      const row = fb.rows[0];
      if (!row) {
        throw new ApiException(
          'HRM-JD-PACK-FALLBACK',
          'No pack rule matched and no COMPANY_DEFAULT / CORP_DEFAULT configured',
          HttpStatus.BAD_REQUEST,
        );
      }
      matched = {
        id: '',
        priority: 999,
        match_type: 'fallback',
        match_value: null,
        pack_id: row.id,
        pack_code: normalizePackCode(row.code),
        pack_label: row.label,
      };
    }

    const packDetail = await this.enrichPack({
      id: matched.pack_id,
      company_id: companyId,
      code: matched.pack_code,
      label: matched.pack_label,
      description: null,
      is_company_fallback: matched.pack_code === PACK_CORP_DEFAULT,
      is_system: true,
      status: 'published',
      is_active: true,
    });

    const alwaysOnGroups = packDetail.groups.filter(
      (g) => g.always_on === true,
    );

    return {
      pack_id: matched.pack_id,
      pack_code: normalizePackCode(matched.pack_code),
      pack_label: matched.pack_label,
      resolved_from_rule_id: matched.id || null,
      resolved_by: matched.match_type,
      match_value: matched.match_value,
      position_code: payload.position_code ?? null,
      job_family: jobFamily || null,
      always_on_groups: alwaysOnGroups,
      pack: packDetail,
    };
  }

  /** Materialize v2 snapshot from pack (create JD when client omits snapshot). */
  async materializeSnapshotFromPack(
    companyId: string,
    authorization: string | undefined,
    resolveCtx: {
      position_code?: string;
      job_family?: string;
      industry?: string;
      employment_type?: string;
      work_mode?: string;
      optional_group_codes?: string[];
    },
  ): Promise<JdLayoutSnapshotV2> {
    const resolved = await this.resolvePack(
      {
        company_id: companyId,
        position_code: resolveCtx.position_code,
        job_family: resolveCtx.job_family,
        industry: resolveCtx.industry,
        employment_type: resolveCtx.employment_type,
        work_mode: resolveCtx.work_mode,
      },
      authorization,
    );
    const pack = resolved.pack;
    const optionalSet = new Set(
      (resolveCtx.optional_group_codes ?? []).map((c) => c.toUpperCase()),
    );
    const groups: JdSnapshotGroup[] = [];
    for (const g of pack.groups) {
      if (!g.always_on && !optionalSet.has(g.group_code)) continue;
      groups.push({
        group_id: g.group_id,
        group_code: g.group_code,
        label: g.label,
        view_style: g.view_style,
        sort_order: g.sort_order,
        source: g.always_on ? 'pack_always_on' : 'optional_dnd',
        fields: g.fields ?? [],
      });
    }
    groups.sort((a, b) => a.sort_order - b.sort_order);
    this.assertTitleFirstInSnapshot(groups);
    return {
      layout_version: 2,
      pack_code: resolved.pack_code,
      pack_label: resolved.pack_label,
      resolved_from_rule_id: resolved.resolved_from_rule_id,
      pack: {
        pack_id: resolved.pack_id,
        pack_code: resolved.pack_code,
        pack_label: resolved.pack_label,
        resolved_by: resolved.resolved_by,
        match_value: resolved.match_value,
        resolved_from_rule_id: resolved.resolved_from_rule_id,
      },
      groups,
    };
  }

  validateSnapshotAndValues(
    snapshot: JdLayoutSnapshotV2 | null | undefined,
    values: Record<string, unknown> | null | undefined,
    opts?: { enforceRequired?: boolean },
  ): {
    layout_version: number;
    snapshot: JdLayoutSnapshotV2 | null;
    values: Record<string, unknown>;
  } {
    const enforceRequired = opts?.enforceRequired !== false;
    if (!snapshot && (!values || Object.keys(values).length === 0)) {
      return { layout_version: 1, snapshot: null, values: values ?? {} };
    }
    if (
      !snapshot ||
      !Array.isArray(snapshot.groups) ||
      snapshot.groups.length === 0
    ) {
      throw new ApiException(
        'HRM-JD-LAYOUT-EMPTY',
        'layout_snapshot.groups required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const sortOrders = snapshot.groups.map((g) => g.sort_order);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new ApiException(
        'HRM-JD-GROUP-ORDER',
        'Duplicate group sort_order',
        HttpStatus.BAD_REQUEST,
      );
    }
    this.assertTitleFirstInSnapshot(snapshot.groups);
    const allowedKeys = new Set<string>();
    const requiredKeys = new Set<string>();
    for (const g of snapshot.groups) {
      for (const f of g.fields ?? []) {
        allowedKeys.add(f.field_key);
        if (f.is_required) requiredKeys.add(f.field_key);
      }
    }
    const vals = values ?? {};
    for (const key of Object.keys(vals)) {
      if (
        !allowedKeys.has(key) &&
        !['title', 'code', 'position_code', 'notes'].includes(key)
      ) {
        throw new ApiException(
          'HRM-JD-VAL-UNKNOWN',
          `Unknown value key: ${key}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    // Save-as-draft (F-JD-02) may skip required; publish (F-JD-04) enforces via collectMissingRequiredKeys / enforceRequired.
    if (enforceRequired) {
      for (const rk of requiredKeys) {
        const v = vals[rk];
        if (v === undefined || v === null || String(v).trim() === '') {
          throw new ApiException(
            'HRM-JD-VAL-REQUIRED',
            `Required field empty: ${rk}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
    return {
      layout_version:
        snapshot.layout_version >= 2 ? snapshot.layout_version : 2,
      snapshot: {
        ...snapshot,
        layout_version:
          snapshot.layout_version >= 2 ? snapshot.layout_version : 2,
      },
      values: vals,
    };
  }

  /** O3 publish gate — required-on-layout ∩ values (API-01 HRM-REC-JD-PUB-REQUIRED). */
  collectMissingRequiredKeys(
    snapshot: JdLayoutSnapshotV2 | null | undefined,
    values: Record<string, unknown> | null | undefined,
  ): string[] {
    if (
      !snapshot ||
      !Array.isArray(snapshot.groups) ||
      snapshot.groups.length === 0
    ) {
      return [];
    }
    const vals = values ?? {};
    const missing: string[] = [];
    for (const g of snapshot.groups) {
      for (const f of g.fields ?? []) {
        if (!f.is_required) continue;
        const v = vals[f.field_key];
        if (v === undefined || v === null || String(v).trim() === '') {
          missing.push(f.field_key);
        }
      }
    }
    return missing;
  }

  buildDisplaySections(
    snapshot: unknown,
    values: Record<string, unknown> | null,
    legacy: {
      title?: string;
      job_description?: string | null;
      requirements?: string | null;
    },
  ): Array<{
    section: string;
    group_code?: string;
    label?: string;
    view_style?: string;
    fields: Array<Record<string, unknown>>;
  }> {
    const snap = snapshot as JdLayoutSnapshotV2 | JdSnapshotField[] | null;
    const vals = { ...(values ?? {}) };
    if (!values || Object.keys(values).length === 0) {
      if (legacy.title) vals.title = legacy.title;
      if (legacy.job_description)
        vals.responsibilities = legacy.job_description;
      if (legacy.requirements) vals.requirements = legacy.requirements;
    }
    if (
      snap &&
      typeof snap === 'object' &&
      Array.isArray((snap as JdLayoutSnapshotV2).groups)
    ) {
      const groups = [...(snap as JdLayoutSnapshotV2).groups].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      return groups.map((g) => ({
        section: g.group_code,
        group_code: g.group_code,
        label: g.label,
        view_style: g.view_style,
        fields: (g.fields ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((f) => ({
            field_key: f.field_key,
            label: f.label,
            field_type: f.field_type,
            is_required: f.is_required,
            value: vals[f.field_key] ?? null,
          })),
      }));
    }
    if (Array.isArray(snap)) {
      return [
        {
          section: 'SEC_LEGACY',
          group_code: 'SEC_LEGACY',
          label: 'Nội dung',
          view_style: 'plain',
          fields: snap.map((f) => ({
            field_key: f.field_key,
            label: f.label,
            field_type: f.field_type,
            value: vals[f.field_key] ?? null,
          })),
        },
      ];
    }
    return [
      {
        section: 'SEC_LEGACY',
        label: 'Nội dung',
        fields: [
          {
            field_key: 'title',
            label: 'Tiêu đề',
            field_type: 'short_text',
            value: legacy.title ?? null,
          },
          {
            field_key: 'responsibilities',
            label: 'Mô tả',
            field_type: 'long_text',
            value: legacy.job_description ?? null,
          },
          {
            field_key: 'requirements',
            label: 'Yêu cầu',
            field_type: 'long_text',
            value: legacy.requirements ?? null,
          },
        ],
      },
    ];
  }

  // ─── private helpers ───────────────────────────────────────────────────

  private assertSelectValidation(
    fieldType: string,
    validation: Record<string, unknown> | null | undefined,
  ) {
    if (fieldType !== 'select') return;
    const src = validation?.source;
    if (src === 'catalog') {
      const key = String(validation?.catalog_key ?? '');
      if (!(SELECT_CATALOG_ALLOWLIST as readonly string[]).includes(key)) {
        throw new ApiException(
          'HRM-JD-SELECT-SRC',
          'catalog_key not in allowlist',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (src === 'static') {
      if (
        !Array.isArray(validation?.options) ||
        validation.options.length === 0
      ) {
        throw new ApiException(
          'HRM-JD-SELECT-SRC',
          'static select requires options',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (validation != null) {
      throw new ApiException(
        'HRM-JD-SELECT-SRC',
        'select validation.source required',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async fieldHasValues(
    fieldKey: string,
    companyId: string,
  ): Promise<boolean> {
    const res = await this.db.query(
      `SELECT id FROM public.job_description_templates
       WHERE company_id = $1
         AND values_json IS NOT NULL
         AND values_json ? $2
       LIMIT 1`,
      [companyId, fieldKey],
    );
    return Boolean(res.rows[0]);
  }

  private async enrichLayout(
    layout: Record<string, unknown>,
  ): Promise<JdFormLayoutDetail> {
    const items = await this.db.query(
      `SELECT i.id, i.field_id, i.section, i.sort_order, i.company_id,
              f.field_key, f.label, f.field_type, f.is_required, f.is_system
       FROM public.rec_jd_form_layout_item i
       JOIN public.rec_jd_field_def f ON f.id = i.field_id
       WHERE i.layout_id = $1::uuid
       ORDER BY i.section ASC, i.sort_order ASC`,
      [layout.id],
    );
    return {
      id: String(layout.id),
      company_id: String(layout.company_id),
      name: (layout.name as string | null) ?? null,
      is_default: Boolean(layout.is_default),
      status: (layout.status as string | null) ?? null,
      created_at: layout.created_at,
      updated_at: layout.updated_at,
      items: items.rows,
    };
  }

  private async validateLayoutItems(
    companyId: string,
    authorization: string | undefined,
    items: Array<{ field_id: string; section: string; sort_order: number }>,
    enforceTitle: boolean,
  ) {
    const scope = resolveHrmListScope(authorization, companyId);
    let titleOrder: number | null = null;
    for (const it of items) {
      const filters = [
        'id = $1::uuid',
        'archived_at IS NULL',
        'is_active = TRUE',
      ];
      const values: unknown[] = [it.field_id];
      pushCompanyIdFilter(filters, values, scope.companyIds);
      const f = await this.db.query<{ field_key: string }>(
        `SELECT field_key FROM public.rec_jd_field_def WHERE ${filters.join(' AND ')} LIMIT 1`,
        values,
      );
      if (!f.rows[0]) {
        throw new ApiException(
          'HRM-JD-LAYOUT-FIELD',
          `Invalid field_id ${it.field_id}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (f.rows[0].field_key === 'title') {
        titleOrder = it.sort_order;
        if (
          it.section !== 'hero' &&
          it.section !== 'meta' &&
          it.section !== 'SEC_META'
        ) {
          // allow meta/hero
        }
      }
    }
    if (enforceTitle) {
      const minSort = Math.min(...items.map((i) => i.sort_order));
      if (titleOrder === null || titleOrder !== minSort) {
        throw new ApiException(
          'HRM-JD-LAYOUT-TITLE',
          'title must be first (sort_order min) in layout',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async enrichGroup(
    group: Record<string, unknown>,
  ): Promise<JdGroupDefDetail> {
    const fields = await this.db.query(
      `SELECT gf.id, gf.field_id, gf.sort_order, gf.is_required_in_group,
              f.field_key, f.label, f.field_type, f.is_required, f.is_system, f.is_active
       FROM public.rec_jd_group_field gf
       JOIN public.rec_jd_field_def f ON f.id = gf.field_id
       WHERE gf.group_id = $1::uuid
       ORDER BY gf.sort_order ASC`,
      [group.id],
    );
    return {
      id: String(group.id),
      company_id: String(group.company_id),
      code: String(group.code),
      label: String(group.label),
      kind: String(group.kind ?? 'tenant_custom'),
      usage: String(group.usage),
      view_style: String(group.view_style),
      sort_order: Number(group.sort_order ?? 0),
      is_active: group.is_active !== false,
      created_at: group.created_at,
      updated_at: group.updated_at,
      fields: fields.rows,
    };
  }

  private async replaceGroupFields(
    groupId: string,
    companyId: string,
    authorization: string | undefined,
    fields: Array<{
      field_id: string;
      sort_order: number;
      is_required_in_group?: boolean;
    }>,
  ) {
    const scope = resolveHrmListScope(authorization, companyId);
    for (const f of fields) {
      const filters = ['id = $1::uuid', 'archived_at IS NULL'];
      const values: unknown[] = [f.field_id];
      pushCompanyIdFilter(filters, values, scope.companyIds);
      const hit = await this.db.query(
        `SELECT id FROM public.rec_jd_field_def WHERE ${filters.join(' AND ')} LIMIT 1`,
        values,
      );
      if (!hit.rows[0]) {
        throw new ApiException(
          'HRM-JD-GROUP-FIELD',
          `Unknown field_id ${f.field_id}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const other = await this.db.query(
        `SELECT gf.group_id FROM public.rec_jd_group_field gf
         JOIN public.rec_jd_group_def g ON g.id = gf.group_id AND g.archived_at IS NULL AND g.is_active = TRUE
         WHERE gf.field_id = $1::uuid AND gf.company_id = $2 AND gf.group_id <> $3::uuid
         LIMIT 1`,
        [f.field_id, companyId, groupId],
      );
      if (other.rows[0]) {
        throw new ApiException(
          'HRM-JD-GROUP-FIELD-DUP',
          'field already in another active group',
          HttpStatus.CONFLICT,
        );
      }
    }
    await this.db.query(
      `DELETE FROM public.rec_jd_group_field WHERE group_id = $1::uuid`,
      [groupId],
    );
    for (const f of fields) {
      await this.db.query(
        `INSERT INTO public.rec_jd_group_field
          (id, group_id, field_id, company_id, sort_order, is_required_in_group)
         VALUES ($1,$2::uuid,$3::uuid,$4,$5,$6)`,
        [
          randomUUID(),
          groupId,
          f.field_id,
          companyId,
          f.sort_order,
          f.is_required_in_group === true,
        ],
      );
    }
  }

  private async enrichPack(
    pack: Record<string, unknown>,
  ): Promise<JdDefaultPackDetail> {
    const groups = await this.db.query<{
      group_id: string;
      sort_order: number;
      always_on: boolean;
      group_code: string;
      label: string;
      view_style: string;
      usage: string;
      kind: string;
    }>(
      `SELECT pg.group_id::text AS group_id, pg.sort_order, pg.always_on,
              g.code AS group_code, g.label, g.view_style, g.usage, g.kind
       FROM public.rec_jd_pack_group pg
       JOIN public.rec_jd_group_def g ON g.id = pg.group_id
       WHERE pg.pack_id = $1::uuid
       ORDER BY pg.sort_order ASC`,
      [pack.id],
    );
    const enriched: JdPackGroupDetail[] = [];
    for (const g of groups.rows) {
      const fields = await this.db.query<{
        field_id: string;
        field_key: string;
        label: string;
        field_type: string;
        is_required: boolean;
        sort_order: number;
      }>(
        `SELECT f.id::text AS field_id, f.field_key, f.label, f.field_type,
                COALESCE(gf.is_required_in_group, f.is_required) AS is_required,
                gf.sort_order
         FROM public.rec_jd_group_field gf
         JOIN public.rec_jd_field_def f ON f.id = gf.field_id
         WHERE gf.group_id = $1::uuid
         ORDER BY gf.sort_order ASC`,
        [g.group_id],
      );
      enriched.push({
        group_id: String(g.group_id),
        group_code: String(g.group_code),
        label: String(g.label),
        view_style: String(g.view_style),
        usage: String(g.usage),
        kind: String(g.kind),
        sort_order: Number(g.sort_order ?? 0),
        always_on: g.always_on !== false,
        fields: fields.rows.map((f) => ({
          field_id: f.field_id,
          field_key: f.field_key,
          label: f.label,
          field_type: f.field_type,
          is_required: Boolean(f.is_required),
          sort_order: Number(f.sort_order ?? 0),
        })),
      });
    }
    return {
      id: String(pack.id),
      company_id: String(pack.company_id),
      code: normalizePackCode(String(pack.code)),
      label: String(pack.label ?? pack.code ?? ''),
      description: (pack.description as string | null | undefined) ?? null,
      is_company_fallback: Boolean(pack.is_company_fallback),
      is_system: Boolean(pack.is_system),
      status: (pack.status as string | null | undefined) ?? null,
      is_active: pack.is_active !== false,
      created_at: pack.created_at,
      updated_at: pack.updated_at,
      groups: enriched,
    };
  }

  private async resolveGroupId(
    companyId: string,
    authorization: string | undefined,
    groupId?: string,
    groupCode?: string,
  ): Promise<string> {
    if (groupId) {
      await this.getGroupDefById(groupId, companyId, authorization);
      return groupId;
    }
    if (!groupCode) {
      throw new ApiException(
        'HRM-JD-PACK-GROUP-USAGE',
        'group_id or group_code required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const scope = resolveHrmListScope(authorization, companyId);
    const filters = ['code = $1', 'archived_at IS NULL'];
    const values: unknown[] = [groupCode.trim().toUpperCase()];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    const res = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.rec_jd_group_def WHERE ${filters.join(' AND ')} LIMIT 1`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-JD-GRP-404',
        `Group ${groupCode} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0].id;
  }

  private async resolvePackId(
    companyId: string,
    authorization: string | undefined,
    packId?: string,
    packCode?: string,
  ): Promise<string> {
    if (packId) {
      const scope = resolveHrmListScope(authorization, companyId);
      const filters = ['id = $1::uuid', 'archived_at IS NULL'];
      const values: unknown[] = [packId];
      pushCompanyIdFilter(filters, values, scope.companyIds);
      const res = await this.db.query(
        `SELECT id FROM public.rec_jd_default_pack WHERE ${filters.join(' AND ')} LIMIT 1`,
        values,
      );
      if (!res.rows[0]) {
        throw new ApiException(
          'HRM-JD-PACK-RULE-REF',
          'pack_id out of scope',
          HttpStatus.BAD_REQUEST,
        );
      }
      return packId;
    }
    if (!packCode) {
      throw new ApiException(
        'HRM-JD-PACK-RULE-REF',
        'pack_id or pack_code required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const detail = await this.getDefaultPackByCode(
      packCode,
      companyId,
      authorization,
    );
    return detail.id;
  }

  private async assertNoOtherFallback(
    companyId: string,
    exceptPackId: string | null,
  ) {
    const res = await this.db.query<{ id: string }>(
      `SELECT id::text AS id FROM public.rec_jd_default_pack
       WHERE company_id = $1 AND is_company_fallback = TRUE AND archived_at IS NULL AND is_active = TRUE
         AND ($2::uuid IS NULL OR id <> $2::uuid)
       LIMIT 1`,
      [companyId, exceptPackId],
    );
    if (res.rows[0]) {
      throw new ApiException(
        'HRM-JD-PACK-FALLBACK-DUP',
        'Only one company fallback pack',
        HttpStatus.CONFLICT,
      );
    }
  }

  private assertTitleFirstInSnapshot(groups: JdSnapshotGroup[]) {
    const ordered = [...groups].sort((a, b) => a.sort_order - b.sort_order);
    for (const g of ordered) {
      const fields = [...(g.fields ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      const title = fields.find((f) => f.field_key === 'title');
      if (title) {
        if (fields[0]?.field_key !== 'title') {
          throw new ApiException(
            'HRM-JD-LAYOUT-TITLE',
            'title must be first field in its group',
            HttpStatus.BAD_REQUEST,
          );
        }
        return;
      }
    }
    // Allow empty-field groups during pack materialize before fields attached — title path via SEC_META
    const hasMeta = ordered.some((g) => g.group_code === 'SEC_META');
    if (!hasMeta) {
      throw new ApiException(
        'HRM-JD-LAYOUT-TITLE',
        'Snapshot missing SEC_META / title path',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
