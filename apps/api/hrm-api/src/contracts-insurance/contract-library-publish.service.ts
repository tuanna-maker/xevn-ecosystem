/**
 * @CODE-MEMORY
 * Screen:     HRM Settings — phát hành / kéo / áp dụng thư viện HĐ tập đoàn
 * UC:         FR-UC-BP-CORE-09a · F-CORE-CTR-PUB-01/02 · PULL-01 · APPLY-01
 * BR:         BR-CTR-CL-01 · VAL-PUB-01..12 · ADR Option A
 * SRS:        SRS_HRM_ENTERPRISE.md v0.18 FR-UC-BP-CORE-09a Diễn biến #1–#5 (+ distribution)
 * TechSpec:   PO-HRM-CONTRACT-LEGAL-PRINT-SA-02.md §4 F.1
 * DB_DESIGN:  PO-HRM-CONTRACT-LEGAL-PRINT-DATA-02.md §3–§5
 * API_DESIGN: DATA-02 §7 `/contract-library/*`
 * Purpose:    Đóng băng gói holding → member pull nháp → apply kích hoạt local; không đụng print_versions.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-BE-03
 * Coded:      2026-08-07
 * Callers:    contracts-insurance.controller.ts
 * Callees:    ContractLegalPrintService.ensureSchema · HrmDbService · resolveHrmListScope
 * FEActions:  Settings Publish (holding) · Pull/Apply (member) · origin badge
 * BEChain:    ensureSchema → publish freeze → pull upsert lineage → apply activate
 * Impact:     Sai scope → member kéo nhầm OU; mutate print_versions = phá BR-CTR-CL-01
 * must_keep:  print-spine GWC · pull≠apply · no synced_catalogs · honesty false · no live holding PREV
 * SOLID:      Publish/pull/apply tách ContractLegalPrintService (print spine)
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01
 * change_mode: EXPAND
 * What: payload templates[] + checksum include duration/title/matrix_family; pull upsert copies cols
 * Why: XEVN-TPL-DATA §3.4 · DYNAMIC LOCK (open catalog)
 * must_keep: VAL-PUB-*; no print_versions mutate; printable=false
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-BE-02
 * change_mode: ADD (re-verify alias)
 * What: PM DATA-02 next_dispatch used BE-02 for PUB/PULL/APPLY — SoT remains BE-03; PDF binary keeps be-02.md
 * Why: ID collision PDF BE-02 vs DATA-02 BE-02; re-verify jest 38 PASS; no wipe GWC/PDF
 * must_keep: contracts_printable_ready=false · no overwrite PDF evidence · VAL-PUB-*
 */

import { createHash, randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import {
  expandHrmTextCompanyIds,
  HrmListScopeContext,
  isGroupCeoMasterOperatingBucket,
  MASTER_TENANT_ID,
  normalizePayrollListCompanyId,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_CTR_PUB_CODE_CONFLICT,
  HRM_CTR_PUB_EMPTY,
  HRM_CTR_PUB_FORBIDDEN,
  HRM_CTR_PUB_NOT_FOUND,
  HRM_CTR_PUB_NOTHING_TO_APPLY,
  HRM_CTR_PUB_RETIRED,
} from './contract-legal-print.constants';
import { ContractLegalPrintService } from './contract-legal-print.service';
import {
  ApplyContractLibraryDto,
  PublishContractLibraryDto,
  PullContractLibraryDto,
} from './dto/contract-legal-print.dto';
type PayloadTemplate = {
  code: string;
  name_vi: string;
  pack_code: string;
  layout_json: Record<string, unknown>;
  keyword_map: Record<string, unknown>;
  version: number;
  default_term_type?: string | null;
  default_duration_days?: number | null;
  default_duration_months?: number | null;
  title_print_vi?: string | null;
  matrix_family?: string | null;
};

type PayloadClause = {
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  apply_to_packs: string[];
  sort_order: number;
  mandatory: boolean;
  version: number;
};

type PayloadPackRule = {
  match_type: string;
  match_value: string | null;
  pack_code: string;
  priority: number;
};

export type ContractLibraryPayload = {
  templates: PayloadTemplate[];
  clauses: PayloadClause[];
  pack_rules: PayloadPackRule[];
};

type PublishRow = {
  id: string;
  tenant_id: string;
  source_company_id: string;
  publish_version: number;
  checksum: string;
  payload_json: ContractLibraryPayload | string;
  label_vi: string | null;
  template_count: number;
  clause_count: number;
  pack_rule_count: number;
  published_at: string;
  published_by: string | null;
  status: string;
  archived_at: string | null;
};

type LineageRow = {
  id: string;
  code?: string;
  origin: string;
  lineage_code: string | null;
  status?: string;
};

function readClaim(
  payload: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = payload[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/** Pack-rule lineage: pr:{match_type}:{match_value|∅}:{pack_code} */
export function packRuleLineageCode(
  matchType: string,
  matchValue: string | null | undefined,
  packCode: string,
): string {
  const mv = matchValue == null || matchValue === '' ? '∅' : String(matchValue);
  return `pr:${matchType}:${mv}:${packCode}`;
}

/** Stable JSON for checksum — sorted object keys · sorted apply_to_packs. */
export function canonicalizeLibraryPayload(
  payload: ContractLibraryPayload,
): string {
  const sortKeys = (obj: Record<string, unknown>): Record<string, unknown> => {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      const v = obj[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        out[k] = sortKeys(v as Record<string, unknown>);
      } else {
        out[k] = v;
      }
    }
    return out;
  };
  const templates = [...payload.templates]
    .map((t) =>
      sortKeys({
        code: t.code,
        name_vi: t.name_vi,
        pack_code: t.pack_code,
        layout_json: sortKeys(t.layout_json ?? {}),
        keyword_map: sortKeys(t.keyword_map ?? {}),
        version: t.version,
        default_term_type: t.default_term_type ?? null,
        default_duration_days: t.default_duration_days ?? null,
        default_duration_months: t.default_duration_months ?? null,
        title_print_vi: t.title_print_vi ?? null,
        matrix_family: t.matrix_family ?? null,
      }),
    )
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));
  const clauses = [...payload.clauses]
    .map((c) =>
      sortKeys({
        code: c.code,
        title_vi: c.title_vi,
        body_vi: c.body_vi,
        clause_group: c.clause_group,
        apply_to_packs: [...(c.apply_to_packs ?? [])].map(String).sort(),
        sort_order: c.sort_order,
        mandatory: c.mandatory,
        version: c.version,
      }),
    )
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));
  const pack_rules = [...payload.pack_rules]
    .map((r) =>
      sortKeys({
        match_type: r.match_type,
        match_value: r.match_value,
        pack_code: r.pack_code,
        priority: r.priority,
      }),
    )
    .sort((a, b) =>
      packRuleLineageCode(
        String(a.match_type),
        a.match_value as string | null,
        String(a.pack_code),
      ).localeCompare(
        packRuleLineageCode(
          String(b.match_type),
          b.match_value as string | null,
          String(b.pack_code),
        ),
      ),
    );
  return JSON.stringify({ templates, clauses, pack_rules });
}

export function checksumLibraryPayload(
  payload: ContractLibraryPayload,
): string {
  return createHash('sha256')
    .update(canonicalizeLibraryPayload(payload), 'utf8')
    .digest('hex');
}

@Injectable()
export class ContractLibraryPublishService {
  constructor(
    private readonly db: HrmDbService,
    private readonly legalPrint: ContractLegalPrintService,
  ) {}

  private parsePayload(raw: unknown): ContractLibraryPayload {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      const o = raw as Record<string, unknown>;
      return {
        templates: Array.isArray(o.templates)
          ? (o.templates as PayloadTemplate[])
          : [],
        clauses: Array.isArray(o.clauses) ? (o.clauses as PayloadClause[]) : [],
        pack_rules: Array.isArray(o.pack_rules)
          ? (o.pack_rules as PayloadPackRule[])
          : [],
      };
    }
    if (typeof raw === 'string') {
      try {
        return this.parsePayload(JSON.parse(raw) as unknown);
      } catch {
        /* ignore */
      }
    }
    return { templates: [], clauses: [], pack_rules: [] };
  }

  private actorFromAuth(authorization?: string): string | null {
    const payload = getVerifiedInternalJwtPayload(authorization);
    if (!payload) return null;
    return readClaim(payload, 'sub', 'email') ?? null;
  }

  private assertGroupPublisher(authorization: string | undefined): void {
    const payload = getVerifiedInternalJwtPayload(authorization);
    const tenantId = (
      readClaim(payload ?? {}, 'tenantId', 'tenant_id') ?? MASTER_TENANT_ID
    ).toLowerCase();
    const claimCompany =
      readClaim(payload ?? {}, 'companyId', 'company_id', 'cid') ?? 'main';
    const roleCode =
      readClaim(payload ?? {}, 'roleCode', 'role_code', 'role') ?? '';
    if (
      !isGroupCeoMasterOperatingBucket(
        payload,
        tenantId,
        claimCompany,
        roleCode,
      )
    ) {
      // Service JWT / internal without group role — still require master rollup scope
      const scope = resolveHrmListScope(authorization, 'main');
      if (!scope.masterTenantPartition) {
        throw new ApiException(
          HRM_CTR_PUB_FORBIDDEN,
          'Only group config role may publish contract library',
          HttpStatus.FORBIDDEN,
        );
      }
      if (payload) {
        const role = roleCode.toLowerCase();
        if (role && role !== 'group_ceo' && !role.startsWith('group_')) {
          throw new ApiException(
            HRM_CTR_PUB_FORBIDDEN,
            'Only group config role may publish contract library',
            HttpStatus.FORBIDDEN,
          );
        }
      }
    }
  }

  private resolveMemberTarget(
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext?: HrmListScopeContext,
  ): {
    companyId: string;
    scope: ReturnType<typeof resolveHrmListScope>;
    expanded: string[];
  } {
    // Scope from JWT operating bucket (not from arbitrary target) — blocks foreign-member pull.
    const payload = getVerifiedInternalJwtPayload(authorization);
    const tenantId = (
      readClaim(payload ?? {}, 'tenantId', 'tenant_id') ??
      scopeContext?.tenantId ??
      MASTER_TENANT_ID
    ).toLowerCase();
    const claimCompany =
      readClaim(payload ?? {}, 'companyId', 'company_id', 'cid') ??
      requestedCompanyId;
    const roleCode =
      readClaim(payload ?? {}, 'roleCode', 'role_code', 'role') ?? '';
    const scopeBase = isGroupCeoMasterOperatingBucket(
      payload,
      tenantId,
      claimCompany,
      roleCode,
    )
      ? 'main'
      : normalizePayrollListCompanyId(authorization, claimCompany);
    const scope = resolveHrmListScope(authorization, scopeBase, scopeContext);
    const expanded = expandHrmTextCompanyIds(scope, authorization, scopeBase);

    let companyId = requestedCompanyId.trim().toLowerCase();
    if (companyId === 'main' && scope.masterTenantPartition) {
      companyId = 'holding';
    }
    const allowed = new Set([
      ...scope.companyIds.map((c) => c.toLowerCase()),
      ...expanded.map((c) => c.toLowerCase()),
    ]);
    if (!allowed.has(companyId)) {
      throw new ApiException(
        'HRM-SCOPE-409',
        'Pull/apply target company_id is outside token scope',
        HttpStatus.CONFLICT,
      );
    }
    return { companyId, scope, expanded };
  }

  private displayPublishMeta(row: PublishRow, includePayload = false) {
    const base = {
      id: row.id,
      tenant_id: row.tenant_id,
      source_company_id: row.source_company_id,
      publish_version: row.publish_version,
      checksum: row.checksum,
      label_vi: row.label_vi,
      template_count: row.template_count,
      clause_count: row.clause_count,
      pack_rule_count: row.pack_rule_count,
      published_at: row.published_at,
      published_by: row.published_by,
      status: row.status,
    };
    if (!includePayload) return base;
    return { ...base, payload_json: this.parsePayload(row.payload_json) };
  }

  async publishLibrary(
    body: PublishContractLibraryDto,
    authorization?: string,
    _scopeContext?: HrmListScopeContext,
  ) {
    await this.legalPrint.ensureSchema();
    this.assertGroupPublisher(authorization);

    const holding = 'holding';
    const templatesRes = await this.db.query<{
      code: string;
      name_vi: string;
      pack_code: string;
      layout_json: Record<string, unknown> | string;
      keyword_map: Record<string, unknown> | string;
      version: number;
      default_term_type: string | null;
      default_duration_days: number | null;
      default_duration_months: number | null;
      title_print_vi: string | null;
      matrix_family: string | null;
    }>(
      `SELECT code, name_vi, pack_code, layout_json, keyword_map, version,
              default_term_type, default_duration_days, default_duration_months,
              title_print_vi, matrix_family
       FROM public.hrm_contract_templates
       WHERE company_id = $1 AND status = 'active' AND archived_at IS NULL
       ORDER BY code ASC;`,
      [holding],
    );
    const clausesRes = await this.db.query<{
      code: string;
      title_vi: string;
      body_vi: string;
      clause_group: string;
      apply_to_packs: string[] | null;
      sort_order: number;
      mandatory: boolean;
      version: number;
    }>(
      `SELECT code, title_vi, body_vi, clause_group, apply_to_packs, sort_order, mandatory, version
       FROM public.hrm_contract_clauses
       WHERE company_id = $1 AND status = 'active' AND archived_at IS NULL
       ORDER BY code ASC;`,
      [holding],
    );
    const rulesRes = await this.db.query<{
      match_type: string;
      match_value: string | null;
      pack_code: string;
      priority: number;
    }>(
      `SELECT match_type, match_value, pack_code, priority
       FROM public.hrm_contract_pack_rules
       WHERE company_id = $1 AND status = 'active' AND archived_at IS NULL
       ORDER BY priority ASC, match_type ASC;`,
      [holding],
    );

    const parseObj = (raw: unknown): Record<string, unknown> => {
      if (raw && typeof raw === 'object' && !Array.isArray(raw))
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
      return {};
    };

    const payload: ContractLibraryPayload = {
      templates: templatesRes.rows.map((t) => ({
        code: t.code,
        name_vi: t.name_vi,
        pack_code: t.pack_code,
        layout_json: parseObj(t.layout_json),
        keyword_map: parseObj(t.keyword_map),
        version: Number(t.version) || 1,
        default_term_type: t.default_term_type ?? null,
        default_duration_days: t.default_duration_days ?? null,
        default_duration_months: t.default_duration_months ?? null,
        title_print_vi: t.title_print_vi ?? null,
        matrix_family: t.matrix_family ?? null,
      })),
      clauses: clausesRes.rows.map((c) => ({
        code: c.code,
        title_vi: c.title_vi,
        body_vi: c.body_vi,
        clause_group: c.clause_group,
        apply_to_packs: [
          ...(Array.isArray(c.apply_to_packs) ? c.apply_to_packs : ['*']),
        ].sort(),
        sort_order: Number(c.sort_order) || 0,
        mandatory: Boolean(c.mandatory),
        version: Number(c.version) || 1,
      })),
      pack_rules: rulesRes.rows.map((r) => ({
        match_type: r.match_type,
        match_value: r.match_value,
        pack_code: r.pack_code,
        priority: Number(r.priority) || 100,
      })),
    };

    if (payload.templates.length === 0 && payload.clauses.length === 0) {
      throw new ApiException(
        HRM_CTR_PUB_EMPTY,
        'Publish requires at least one active template or clause at holding',
        HttpStatus.BAD_REQUEST,
      );
    }

    const checksum = checksumLibraryPayload(payload);
    const verRes = await this.db.query<{ next: string }>(
      `SELECT COALESCE(MAX(publish_version), 0) + 1 AS next
       FROM public.hrm_contract_library_publishes
       WHERE tenant_id = $1;`,
      [MASTER_TENANT_ID],
    );
    const publishVersion = Number(verRes.rows[0]?.next ?? 1);
    const id = randomUUID();
    const publishedBy = this.actorFromAuth(authorization);

    const inserted = await this.db.query<PublishRow>(
      `INSERT INTO public.hrm_contract_library_publishes
        (id, tenant_id, source_company_id, publish_version, checksum, payload_json, label_vi,
         template_count, clause_count, pack_rule_count, published_by, status)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, 'published')
       RETURNING id, tenant_id, source_company_id, publish_version, checksum, payload_json, label_vi,
                 template_count, clause_count, pack_rule_count, published_at, published_by, status, archived_at;`,
      [
        id,
        MASTER_TENANT_ID,
        holding,
        publishVersion,
        checksum,
        canonicalizeLibraryPayload(payload),
        body.label_vi?.trim() || null,
        payload.templates.length,
        payload.clauses.length,
        payload.pack_rules.length,
        publishedBy,
      ],
    );

    const row = inserted.rows[0];
    return {
      publish_version: row.publish_version,
      checksum: row.checksum,
      template_count: row.template_count,
      clause_count: row.clause_count,
      pack_rule_count: row.pack_rule_count,
      published_at: row.published_at,
      label_vi: row.label_vi,
      id: row.id,
    };
  }

  async listPublishes(
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    companyId?: string,
  ) {
    await this.legalPrint.ensureSchema();
    const requested = companyId?.trim() || 'main';
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requested,
    );
    resolveHrmListScope(authorization, scopeCompanyId, scopeContext);
    // Members may read publish metadata (ADR §5.5) — tenant master only
    const res = await this.db.query<PublishRow>(
      `SELECT id, tenant_id, source_company_id, publish_version, checksum, payload_json, label_vi,
              template_count, clause_count, pack_rule_count, published_at, published_by, status, archived_at
       FROM public.hrm_contract_library_publishes
       WHERE tenant_id = $1 AND archived_at IS NULL
       ORDER BY publish_version DESC;`,
      [MASTER_TENANT_ID],
    );
    return {
      total: res.rows.length,
      data: res.rows.map((r) => this.displayPublishMeta(r, false)),
    };
  }

  async getPublishByVersion(
    publishVersion: number,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    companyId?: string,
    includePayload = true,
  ) {
    await this.legalPrint.ensureSchema();
    const requested = companyId?.trim() || 'main';
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requested,
    );
    resolveHrmListScope(authorization, scopeCompanyId, scopeContext);

    const res = await this.db.query<PublishRow>(
      `SELECT id, tenant_id, source_company_id, publish_version, checksum, payload_json, label_vi,
              template_count, clause_count, pack_rule_count, published_at, published_by, status, archived_at
       FROM public.hrm_contract_library_publishes
       WHERE tenant_id = $1 AND publish_version = $2 AND archived_at IS NULL
       LIMIT 1;`,
      [MASTER_TENANT_ID, publishVersion],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CTR_PUB_NOT_FOUND,
        `Publish version ${publishVersion} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.displayPublishMeta(row, includePayload);
  }

  private async loadPublishRow(publishVersion: number): Promise<PublishRow> {
    const res = await this.db.query<PublishRow>(
      `SELECT id, tenant_id, source_company_id, publish_version, checksum, payload_json, label_vi,
              template_count, clause_count, pack_rule_count, published_at, published_by, status, archived_at
       FROM public.hrm_contract_library_publishes
       WHERE tenant_id = $1 AND publish_version = $2 AND archived_at IS NULL
       LIMIT 1;`,
      [MASTER_TENANT_ID, publishVersion],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CTR_PUB_NOT_FOUND,
        `Publish version ${publishVersion} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  private async latestPublishedVersion(): Promise<number> {
    const res = await this.db.query<{ publish_version: number }>(
      `SELECT publish_version FROM public.hrm_contract_library_publishes
       WHERE tenant_id = $1 AND status = 'published' AND archived_at IS NULL
       ORDER BY publish_version DESC LIMIT 1;`,
      [MASTER_TENANT_ID],
    );
    const v = res.rows[0]?.publish_version;
    if (v == null) {
      throw new ApiException(
        HRM_CTR_PUB_NOT_FOUND,
        'No published library version',
        HttpStatus.NOT_FOUND,
      );
    }
    return Number(v);
  }

  async pullLibrary(
    body: PullContractLibraryDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.legalPrint.ensureSchema();
    const { companyId } = this.resolveMemberTarget(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const force = Boolean(body.force);
    const version =
      body.publish_version != null
        ? Number(body.publish_version)
        : await this.latestPublishedVersion();
    const publish = await this.loadPublishRow(version);
    if (publish.status === 'retired') {
      throw new ApiException(
        HRM_CTR_PUB_RETIRED,
        `Publish version ${version} is retired`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const payload = this.parsePayload(publish.payload_json);
    const upserted: string[] = [];
    const skipped_override: string[] = [];
    const conflicts: string[] = [];
    let pack_rules_upserted = 0;

    // Preflight conflicts (member-local same code)
    for (const t of payload.templates) {
      const existing = await this.db.query<LineageRow>(
        `SELECT id, code, origin, lineage_code FROM public.hrm_contract_templates
         WHERE company_id = $1 AND archived_at IS NULL
           AND (lineage_code = $2 OR lower(code) = lower($2))
         LIMIT 1;`,
        [companyId, t.code],
      );
      const row = existing.rows[0];
      if (
        row &&
        row.origin === 'member' &&
        (row.lineage_code == null || row.origin === 'member')
      ) {
        conflicts.push(`template:${t.code}`);
      }
    }
    for (const c of payload.clauses) {
      const existing = await this.db.query<LineageRow>(
        `SELECT id, code, origin, lineage_code FROM public.hrm_contract_clauses
         WHERE company_id = $1 AND archived_at IS NULL
           AND (lineage_code = $2 OR lower(code) = lower($2))
         LIMIT 1;`,
        [companyId, c.code],
      );
      const row = existing.rows[0];
      if (row && row.origin === 'member') {
        conflicts.push(`clause:${c.code}`);
      }
    }
    if (conflicts.length) {
      await this.insertPullAudit(
        companyId,
        version,
        publish.id,
        force,
        authorization,
        {
          upserted,
          skipped_override,
          conflicts,
          pack_rules_upserted,
        },
      );
      throw new ApiException(
        HRM_CTR_PUB_CODE_CONFLICT,
        `Member-local code blocks pull: ${conflicts.join(', ')}`,
        HttpStatus.CONFLICT,
      );
    }

    for (const t of payload.templates) {
      const existing = await this.db.query<LineageRow & { origin: string }>(
        `SELECT id, code, origin, lineage_code FROM public.hrm_contract_templates
         WHERE company_id = $1 AND archived_at IS NULL AND lineage_code = $2
         LIMIT 1;`,
        [companyId, t.code],
      );
      const row = existing.rows[0];
      if (row?.origin === 'member_override' && !force) {
        skipped_override.push(`template:${t.code}`);
        continue;
      }
      if (row) {
        await this.db.query(
          `UPDATE public.hrm_contract_templates
           SET name_vi = $1, pack_code = $2, layout_json = $3::jsonb, keyword_map = $4::jsonb,
               version = $5, origin = 'group', origin_company_id = 'holding',
               origin_publish_version = $6, lineage_code = $7, status = 'draft',
               default_term_type = $8, default_duration_days = $9, default_duration_months = $10,
               title_print_vi = $11, matrix_family = $12, updated_at = NOW()
           WHERE id = $13::uuid;`,
          [
            t.name_vi,
            t.pack_code,
            JSON.stringify(t.layout_json ?? {}),
            JSON.stringify(t.keyword_map ?? {}),
            t.version,
            version,
            t.code,
            t.default_term_type ?? null,
            t.default_duration_days ?? null,
            t.default_duration_months ?? null,
            t.title_print_vi ?? null,
            t.matrix_family ?? null,
            row.id,
          ],
        );
      } else {
        await this.db.query(
          `INSERT INTO public.hrm_contract_templates
            (id, company_id, code, name_vi, pack_code, layout_json, keyword_map, status, version,
             origin, origin_company_id, origin_publish_version, lineage_code,
             default_term_type, default_duration_days, default_duration_months, title_print_vi, matrix_family)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, 'draft', $8,
                   'group', 'holding', $9, $10, $11, $12, $13, $14, $15);`,
          [
            randomUUID(),
            companyId,
            t.code,
            t.name_vi,
            t.pack_code,
            JSON.stringify(t.layout_json ?? {}),
            JSON.stringify(t.keyword_map ?? {}),
            t.version,
            version,
            t.code,
            t.default_term_type ?? null,
            t.default_duration_days ?? null,
            t.default_duration_months ?? null,
            t.title_print_vi ?? null,
            t.matrix_family ?? null,
          ],
        );
      }
      upserted.push(`template:${t.code}`);
    }

    for (const c of payload.clauses) {
      const existing = await this.db.query<LineageRow>(
        `SELECT id, code, origin, lineage_code FROM public.hrm_contract_clauses
         WHERE company_id = $1 AND archived_at IS NULL AND lineage_code = $2
         LIMIT 1;`,
        [companyId, c.code],
      );
      const row = existing.rows[0];
      if (row?.origin === 'member_override' && !force) {
        skipped_override.push(`clause:${c.code}`);
        continue;
      }
      const packs = Array.isArray(c.apply_to_packs) ? c.apply_to_packs : ['*'];
      if (row) {
        await this.db.query(
          `UPDATE public.hrm_contract_clauses
           SET title_vi = $1, body_vi = $2, clause_group = $3, apply_to_packs = $4::text[],
               sort_order = $5, mandatory = $6, version = $7, origin = 'group',
               origin_company_id = 'holding', origin_publish_version = $8, lineage_code = $9,
               status = 'draft', updated_at = NOW()
           WHERE id = $10::uuid;`,
          [
            c.title_vi,
            c.body_vi,
            c.clause_group,
            packs,
            c.sort_order,
            c.mandatory,
            c.version,
            version,
            c.code,
            row.id,
          ],
        );
      } else {
        await this.db.query(
          `INSERT INTO public.hrm_contract_clauses
            (id, company_id, code, title_vi, body_vi, clause_group, apply_to_packs, sort_order,
             mandatory, status, version, origin, origin_company_id, origin_publish_version, lineage_code)
           VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, 'draft', $10,
                   'group', 'holding', $11, $12);`,
          [
            randomUUID(),
            companyId,
            c.code,
            c.title_vi,
            c.body_vi,
            c.clause_group,
            packs,
            c.sort_order,
            c.mandatory,
            c.version,
            version,
            c.code,
          ],
        );
      }
      upserted.push(`clause:${c.code}`);
    }

    for (const r of payload.pack_rules) {
      const lineage = packRuleLineageCode(
        r.match_type,
        r.match_value,
        r.pack_code,
      );
      const existing = await this.db.query<LineageRow>(
        `SELECT id, origin, lineage_code FROM public.hrm_contract_pack_rules
         WHERE company_id = $1 AND archived_at IS NULL AND lineage_code = $2
         LIMIT 1;`,
        [companyId, lineage],
      );
      const row = existing.rows[0];
      if (row?.origin === 'member_override' && !force) {
        skipped_override.push(`pack_rule:${lineage}`);
        continue;
      }
      if (row) {
        await this.db.query(
          `UPDATE public.hrm_contract_pack_rules
           SET match_type = $1, match_value = $2, pack_code = $3, priority = $4,
               origin = 'group', origin_company_id = 'holding', origin_publish_version = $5,
               lineage_code = $6, status = 'retired', updated_at = NOW()
           WHERE id = $7::uuid;`,
          [
            r.match_type,
            r.match_value,
            r.pack_code,
            r.priority,
            version,
            lineage,
            row.id,
          ],
        );
      } else {
        await this.db.query(
          `INSERT INTO public.hrm_contract_pack_rules
            (id, company_id, match_type, match_value, pack_code, priority, status,
             origin, origin_company_id, origin_publish_version, lineage_code)
           VALUES ($1, $2, $3, $4, $5, $6, 'retired', 'group', 'holding', $7, $8);`,
          [
            randomUUID(),
            companyId,
            r.match_type,
            r.match_value,
            r.pack_code,
            r.priority,
            version,
            lineage,
          ],
        );
      }
      pack_rules_upserted += 1;
    }

    const result = {
      upserted,
      skipped_override,
      conflicts,
      pack_rules_upserted,
    };
    await this.insertPullAudit(
      companyId,
      version,
      publish.id,
      force,
      authorization,
      result,
    );

    return {
      publish_version: version,
      company_id: companyId,
      upserted,
      skipped_override,
      conflicts,
      pack_rules_upserted,
    };
  }

  private async insertPullAudit(
    companyId: string,
    publishVersion: number,
    publishId: string,
    force: boolean,
    authorization: string | undefined,
    result: Record<string, unknown>,
  ) {
    await this.db.query(
      `INSERT INTO public.hrm_contract_library_pull_audits
        (id, company_id, tenant_id, publish_version, publish_id, force, pulled_by, result_json)
       VALUES ($1, $2, $3, $4, $5::uuid, $6, $7, $8::jsonb);`,
      [
        randomUUID(),
        companyId,
        MASTER_TENANT_ID,
        publishVersion,
        publishId,
        force,
        this.actorFromAuth(authorization),
        JSON.stringify(result),
      ],
    );
  }

  async applyLibrary(
    body: ApplyContractLibraryDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.legalPrint.ensureSchema();
    const { companyId } = this.resolveMemberTarget(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    let version =
      body.publish_version != null ? Number(body.publish_version) : null;
    if (version == null) {
      const audit = await this.db.query<{ publish_version: number }>(
        `SELECT publish_version FROM public.hrm_contract_library_pull_audits
         WHERE company_id = $1 AND archived_at IS NULL
         ORDER BY pulled_at DESC LIMIT 1;`,
        [companyId],
      );
      version = audit.rows[0] ? Number(audit.rows[0].publish_version) : null;
    }
    if (version == null) {
      throw new ApiException(
        HRM_CTR_PUB_NOTHING_TO_APPLY,
        'No pulled group drafts to apply',
        HttpStatus.BAD_REQUEST,
      );
    }

    const templates = await this.db.query<{ id: string; code: string }>(
      `SELECT id, code FROM public.hrm_contract_templates
       WHERE company_id = $1 AND origin = 'group' AND origin_publish_version = $2
         AND archived_at IS NULL AND status IN ('draft', 'retired')
       ORDER BY code ASC;`,
      [companyId, version],
    );
    const clauses = await this.db.query<{
      id: string;
      code: string;
      mandatory: boolean;
    }>(
      `SELECT id, code, mandatory FROM public.hrm_contract_clauses
       WHERE company_id = $1 AND origin = 'group' AND origin_publish_version = $2
         AND archived_at IS NULL AND status IN ('draft', 'retired')
       ORDER BY code ASC;`,
      [companyId, version],
    );
    const rules = await this.db.query<{
      id: string;
      lineage_code: string | null;
    }>(
      `SELECT id, lineage_code FROM public.hrm_contract_pack_rules
       WHERE company_id = $1 AND origin = 'group' AND origin_publish_version = $2
         AND archived_at IS NULL AND status = 'retired'
       ORDER BY lineage_code ASC;`,
      [companyId, version],
    );

    if (!templates.rows.length && !clauses.rows.length && !rules.rows.length) {
      throw new ApiException(
        HRM_CTR_PUB_NOTHING_TO_APPLY,
        `Nothing to apply for publish_version ${version}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // VAL-PUB-09: never touch hrm_contract_print_versions
    let activated_templates = 0;
    let activated_clauses = 0;
    let activated_pack_rules = 0;

    for (const t of templates.rows) {
      await this.db.query(
        `UPDATE public.hrm_contract_templates
         SET status = 'retired', updated_at = NOW()
         WHERE company_id = $1 AND lower(code) = lower($2) AND status = 'active'
           AND archived_at IS NULL AND id <> $3::uuid
           AND COALESCE(origin, 'member') <> 'member_override';`,
        [companyId, t.code, t.id],
      );
      await this.db.query(
        `UPDATE public.hrm_contract_templates
         SET status = 'active', updated_at = NOW() WHERE id = $1::uuid;`,
        [t.id],
      );
      activated_templates += 1;
    }

    for (const c of clauses.rows) {
      await this.db.query(
        `UPDATE public.hrm_contract_clauses
         SET status = 'retired', updated_at = NOW()
         WHERE company_id = $1 AND lower(code) = lower($2) AND status = 'active'
           AND archived_at IS NULL AND id <> $3::uuid
           AND COALESCE(origin, 'member') <> 'member_override';`,
        [companyId, c.code, c.id],
      );
      await this.db.query(
        `UPDATE public.hrm_contract_clauses
         SET status = 'active', updated_at = NOW() WHERE id = $1::uuid;`,
        [c.id],
      );
      activated_clauses += 1;
    }

    for (const r of rules.rows) {
      if (r.lineage_code) {
        await this.db.query(
          `UPDATE public.hrm_contract_pack_rules
           SET status = 'retired', updated_at = NOW()
           WHERE company_id = $1 AND lineage_code = $2 AND status = 'active'
             AND archived_at IS NULL AND id <> $3::uuid
             AND COALESCE(origin, 'member') <> 'member_override';`,
          [companyId, r.lineage_code, r.id],
        );
      }
      await this.db.query(
        `UPDATE public.hrm_contract_pack_rules
         SET status = 'active', updated_at = NOW() WHERE id = $1::uuid;`,
        [r.id],
      );
      activated_pack_rules += 1;
    }

    const mandatoryGap = await this.db.query<{
      code: string;
      title_vi: string;
    }>(
      `SELECT code, title_vi FROM public.hrm_contract_clauses
       WHERE company_id = $1 AND origin = 'group' AND origin_publish_version = $2
         AND mandatory = TRUE AND status <> 'active' AND archived_at IS NULL;`,
      [companyId, version],
    );

    return {
      publish_version: version,
      company_id: companyId,
      activated_templates,
      activated_clauses,
      activated_pack_rules,
      missing_mandatory: mandatoryGap.rows.map((m) => ({
        code: m.code,
        title_vi: m.title_vi,
      })),
      print_versions_mutated: false,
    };
  }
}
