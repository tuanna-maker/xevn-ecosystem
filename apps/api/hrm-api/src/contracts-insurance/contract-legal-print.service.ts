/**
 * @CODE-MEMORY
 * Screen:     HRM Cài đặt mẫu/điều khoản HĐ + preview/in phiên bản
 * UC:         FR-UC-BP-CORE-09 · 09a · 09b · 09c · F-CORE-CTR-TPL/CL/PACK/PREV/VER/PDF
 * BR:         BR-CTR-CL-01..04 · BR-CD-F5-01 · VAL-CTR-*
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §B–D
 *             docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-09*
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md §2–§10
 * DB_DESIGN:  docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md §3–§5
 * API_DESIGN: DATA-01 §5 F-CORE-CTR-* · Blueprint F-CORE-CTR overlay
 * Purpose:    Thư viện mẫu/điều khoản versioned; gói nghề; merge preview; snapshot print; PDF binary.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
 * Coded:      2026-08-06
 * Callers:    contracts-insurance.controller.ts
 * Callees:    HrmDbService · resolveHrmListScope / assertResourceInHrmScope · contract-print-pdf.renderer
 * FEActions:  Settings CRUD DnD clause → template; HĐ preview → Lưu phiên bản → PDF
 * BEChain:    ensureSchema → scope filter → soft archive · freeze snapshot on issue
 * Impact:     Sai scope → member đọc mẫu CT khác; thiếu mandatory → in giả
 * must_keep:  UF-HRM-02 registry CRUD · salary off body · soft-delete · U65 no UAT seed
 *             contracts_printable_ready=false · ≠ dual-write rec_jd_pack_rule
 * SOLID:      Print spine tách ContractsInsuranceService (registry)
 * LastVerified: docs/qa/evidence/po-hrm-contract-legal-print-be-03.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
 * change_mode: ADD
 * What: templates/clauses/template_clauses/print_versions/pack_rules + preview/issue/PDF stub
 * Why: Sponsor CONFIRM 2026-08-06 unlocked BE after DATA-01 CONFIRMED
 * must_keep: employee_contracts registry; BR-CD-F5-01; soft-delete; honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-BE-02
 * change_mode: ADD
 * What: F-CORE-CTR-PDF-01 → application/pdf (pdfkit) + ?format=html debug; Q-CTR-02 binary
 * Why: QC GWC CONDITION Q-CTR-02 — HTML stub not production PDF
 * must_keep: print-spine GWC path; registry; salary off body; soft-delete; honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-BE-WATCH-TS-01
 * change_mode: FIX
 * What: resolvePackForEmployee — parseJsonObject(custom_fields) trước assertResourceInHrmScope
 * Why: nest --watch TS2345 (JSONB string | Record ≠ assert custom_fields Record-only)
 * must_keep: BE-02 PDF binary · print-spine · pack resolve · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-BE-03
 * change_mode: ADD
 * What: ensureSchema publishes + pull_audits + lineage cols; CL/TPL overlay origin*; override stamp
 * Why: DATA-02 CONFIRMED · ADR Option A; PDF spine untouched
 * must_keep: print_versions immutable · UF-HRM-02 · no synced_catalogs · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01
 * change_mode: EXPAND
 * What: XEVN matrix cols + PV.template_code freeze; GPLX cols; company_settings CFG;
 *       matrix=xevn list; PREV/VER term+GPLX+number hint; bootstrap 8 starter drafts (open catalog)
 * Why: XEVN-TPL-DATA/API · FR-09d · DYNAMIC LOCK (8 ≠ ceiling)
 * must_keep: print spine · Q-CTR CLOSED · UF-HRM-02 nullable template · printable=false · no closed 8-enum CHK
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01
 * change_mode: FIX
 * What: DROP chk_hrm_ctr_tpl_xevn_code IN(8); CREATE accepts 9th+; CODE-INVALID = format only
 * Why: Sponsor interrupt — catalog động
 * must_keep: starter bootstrap OK; unique code/scope; print-spine
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01
 * change_mode: ADD
 * What: PREV/VER merge step calls shared resolveMergeTokens (§5.2) — registry wins / empty→keyword_map
 * Why: PLATFORM-API-01 F-CORE-CTR-PREV/VER deepen · Option B MergeToken
 * must_keep: print-spine GWC · PDF unchanged · open catalog no CHK IN 8 · printable=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02
 * change_mode: FIX
 * What: nest build TS2367 — normalize matrix_family empty→null (không so sánh union vs ''); ship dist EXPAND+CFG
 * Why: QA-01 FAIL R-CTR-XEVN-TPL-BE-BUILD — dist cũ HRM-VAL-001 + company-settings 404
 * must_keep: open catalog 9+ · print-spine · Q-CTR CLOSED · UF-HRM-02 · printable=false · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01
 * change_mode: ADD
 * What: F-CTR-TPL-CNS-01 — invent code/id when active EFF>0 → HRM-CTR-TPL-KEY;
 *       keep TPL-404 get-by-id · TPL-NONE empty · CODE-INVALID format-only; assertTemplateKeysForConsumer
 * Why: BA-01 §4.3·§8.1 CONFIRMED Option B RETAIN — invent taxonomy ≠ 404 confuse
 * must_keep: createTemplate/freeze LIVE · no schema invent · clause body_vi RETAIN · printable=false · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01
 * change_mode: FIX
 * What: clauseHasIssuedSnapshot — jsonb_array_elements code match + expandHrmTextCompanyIds rollup (main/holding)
 * Why: QA-03 AC-02 PATCH 200 — ILIKE on jsonb::text + single company_id missed issued PV in scope
 * must_keep: updateClause soft-block 409 HRM-CTR-CL-CODE-CONFLICT · activate version bump · CLQA2 PATCH seal
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01
 * change_mode: EXPAND
 * What: resolveContractDetailLayout — GET detail clause_ids alias + clause_layout[] read-only + can_issue + preview_summary
 * Why: SA-01 §4.1 G-CTR-GET-LAYOUT-01 — ContractWorkspace view shell one round-trip
 * must_keep: print-overlay mutate path; preview spine; body_vi SoT Settings; contracts_printable_ready=false; U65
 */

import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  HrmListScopeContext,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter as pushCompanyIdFilterBase,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { HRM_PLT_SCHEMA_INVALID } from '../merge-tokens/merge-token.constants';
import { resolveMergeTokens } from '../merge-tokens/merge-token.resolver';
import { MergeTokensService } from '../merge-tokens/merge-tokens.service';
import {
  CONTRACT_NUMBER_PATTERN_DEFAULT,
  CONTRACT_PACK_CODES,
  CONTRACT_PACK_DEFAULT,
  CONTRACT_SETTING_KEYS,
  CONTRACT_SETTING_NUMBER_PATTERN,
  CONTRACT_SETTING_ORG_SUFFIX,
  type ContractPackCode,
  type ContractSettingKey,
  assertValidTemplateCodeFormat,
  defaultXevnKeywordMap,
  docKindFromTemplateCode,
  getXevnMatrixRow,
  HRM_CTR_CL_CODE_CONFLICT,
  HRM_CTR_CL_404,
  HRM_CTR_CL_REQUIRED,
  HRM_CTR_DRIVER_REQUIRED,
  HRM_CTR_ISSUE_BLOCKED,
  HRM_CTR_OVERLAY_400,
  HRM_CTR_PACK_INVALID,
  HRM_CTR_PV_404,
  HRM_CTR_TERM_INVALID,
  HRM_CTR_TPL_404,
  HRM_CTR_TPL_CODE_INVALID,
  HRM_CTR_TPL_KEY,
  HRM_CTR_TPL_NONE,
  HRM_CTR_TPL_PACK_MISMATCH,
  HRM_CTR_RENDER_FAIL,
  HRM_CTR_VERSION_NOT_ISSUED,
  normalizeContractPackCode,
  termTypeLabelVi,
  XEVN_MATRIX_CATALOG,
  XEVN_MATRIX_FAMILY,
} from './contract-legal-print.constants';
import {
  renderContractPrintHtmlDocument,
  renderContractPrintPdfBuffer,
} from './contract-print-pdf.renderer';
import {
  ContractPreviewDto,
  CreatePrintVersionDto,
  GetContractCompanySettingQueryDto,
  ListContractClausesQueryDto,
  ListContractPackRulesQueryDto,
  ListContractTemplatesQueryDto,
  PutContractPrintOverlayDto,
  PutContractCompanySettingDto,
  PutContractPackRulesDto,
  PutTemplateClausesDto,
  UpdateContractClauseDto,
  UpdateContractTemplateDto,
  UpsertContractClauseDto,
  UpsertContractTemplateDto,
} from './dto/contract-legal-print.dto';

export type PrintPdfFormat = 'pdf' | 'html';

export type PrintPdfRenderResult = {
  content_type: string;
  filename: string;
  body: Buffer | string;
  stub: boolean;
  format: PrintPdfFormat;
};

/** Qualified column support (e.g. `ec.company_id`, `c.company_id`). */
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
  if (companyIds.length === 1) {
    values.push(companyIds[0]);
    filters.push(`${column} = $${values.length}::text`);
    return;
  }
  values.push(companyIds);
  filters.push(`${column} = ANY($${values.length}::text[])`);
}

type TemplateRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  pack_code: string;
  layout_json: Record<string, unknown> | string;
  keyword_map: Record<string, unknown> | string;
  status: string;
  version: number;
  default_term_type?: string | null;
  default_duration_days?: number | null;
  default_duration_months?: number | null;
  title_print_vi?: string | null;
  matrix_family?: string | null;
  origin?: string;
  origin_company_id?: string | null;
  origin_publish_version?: number | null;
  lineage_code?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
};

type ClauseRow = {
  id: string;
  company_id: string;
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  apply_to_packs: string[] | null;
  sort_order: number;
  mandatory: boolean;
  status: string;
  version: number;
  origin?: string;
  origin_company_id?: string | null;
  origin_publish_version?: number | null;
  lineage_code?: string | null;
  effective_from?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
};

type PackRuleRow = {
  id: string;
  company_id: string;
  match_type: string;
  match_value: string | null;
  pack_code: string;
  priority: number;
  status: string;
  origin?: string;
  origin_company_id?: string | null;
  origin_publish_version?: number | null;
  lineage_code?: string | null;
};

type PrintVersionRow = {
  id: string;
  contract_id: string;
  company_id: string;
  version_no: number;
  pack_code: string;
  template_id: string | null;
  template_code?: string | null;
  template_version: number | null;
  merged_fields_json: Record<string, unknown> | string;
  clauses_snapshot_json: unknown;
  compensation_snapshot_json: unknown;
  status: string;
  issued_at: string | null;
  issued_by: string | null;
  pdf_artifact_ref: string | null;
  created_at: string;
  updated_at: string;
};

type ContractPrintRow = {
  id: string;
  company_id: string;
  employee_id: string;
  contract_code: string | null;
  contract_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  notes: string | null;
  position: string | null;
  position_key: string | null;
  department: string | null;
  work_location: string | null;
  work_location_scope: string | null;
  term_type: string | null;
  job_description_text: string | null;
  probation_days: number | null;
  probation_end: string | null;
  license_class: string | null;
  driver_license_number?: string | null;
  driver_license_issued_on?: string | null;
  driver_license_issued_place?: string | null;
  vehicle_plate: string | null;
  route_or_region: string | null;
  pack_code: string | null;
  template_id: string | null;
  template_code?: string | null;
  compensation_package_id: string | null;
  print_overlay_clause_ids?: string[] | null;
  signer_name: string | null;
  signer_position: string | null;
  employee_name?: string | null;
  employee_code?: string | null;
  employee_dob?: string | null;
  employee_gender?: string | null;
  employee_id_number?: string | null;
  employee_phone?: string | null;
  employee_email?: string | null;
  employee_address?: string | null;
};

export type ClauseSnapshotItem = {
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  clause_version: number;
  sort_order: number;
  mandatory: boolean;
};

export type PreviewResult = {
  pack_code: string;
  template_id: string | null;
  template_code: string | null;
  template_version: number | null;
  title_print_vi: string | null;
  term_type: string | null;
  default_duration_days: number | null;
  default_duration_months: number | null;
  number_pattern_hint: string | null;
  contract_number_suggested: string | null;
  show_driver_license_block: boolean;
  sections: Array<{ clause_group: string; clauses: ClauseSnapshotItem[] }>;
  merged_fields: Record<string, unknown>;
  clauses: ClauseSnapshotItem[];
  missing_fields: Array<{ field: string; message: string }>;
  missing_clauses: Array<{ code: string; title_vi: string }>;
  can_issue: boolean;
  cb_masked: boolean;
  compensation_snapshot: Record<string, unknown> | null;
};

/** Display-ready clause row for ContractWorkspace GET detail (read-only — body_vi SoT Settings). */
export type ClauseLayoutItem = {
  id: string;
  code: string;
  title_vi: string;
  body_vi: string;
  clause_group: string;
  mandatory: boolean;
  sort_order: number;
};

export type ContractDetailLayoutInput = {
  id: string;
  company_id: string;
  employee_id: string | null;
  template_id?: string | null;
  template_code?: string | null;
  pack_code?: string | null;
  print_overlay_clause_ids?: string[] | null;
};

export type ContractDetailLayoutEnrichment = {
  clause_ids: string[];
  print_overlay_clause_ids: string[] | null;
  clause_layout: ClauseLayoutItem[];
  can_issue: boolean;
  preview_summary?: {
    pack_code: string | null;
    template_code: string | null;
    missing_fields: Array<{ field: string; message: string }>;
    missing_clauses: Array<{ code: string; title_vi: string }>;
  };
};

@Injectable()
export class ContractLegalPrintService {
  private schemaReady = false;

  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly mergeTokens?: MergeTokensService,
  ) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_contract_templates (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        pack_code TEXT NOT NULL,
        layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        keyword_map JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'draft',
        version INT NOT NULL DEFAULT 1,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by TEXT NULL,
        updated_by TEXT NULL,
        CONSTRAINT chk_hrm_contract_tpl_status CHECK (status IN ('draft', 'active', 'retired'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_contract_templates_company_code_active
      ON public.hrm_contract_templates (company_id, lower(code)) WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_contract_templates_company_status
      ON public.hrm_contract_templates (company_id, status);
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_contract_clauses (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        code TEXT NOT NULL,
        title_vi TEXT NOT NULL,
        body_vi TEXT NOT NULL,
        clause_group TEXT NOT NULL,
        apply_to_packs TEXT[] NOT NULL DEFAULT ARRAY['*']::text[],
        sort_order INT NOT NULL DEFAULT 0,
        mandatory BOOLEAN NOT NULL DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'draft',
        version INT NOT NULL DEFAULT 1,
        effective_from DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_by TEXT NULL,
        updated_by TEXT NULL,
        CONSTRAINT chk_hrm_contract_cl_status CHECK (status IN ('draft', 'active', 'retired'))
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_contract_clauses_company_code_active
      ON public.hrm_contract_clauses (company_id, lower(code))
      WHERE status = 'active' AND archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_contract_clauses_company_group
      ON public.hrm_contract_clauses (company_id, clause_group);
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_contract_template_clauses (
        id UUID PRIMARY KEY,
        template_id UUID NOT NULL,
        clause_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_hrm_contract_tpl_clause UNIQUE (template_id, clause_id)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_contract_tpl_clauses_order
      ON public.hrm_contract_template_clauses (template_id, sort_order);
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_contract_print_versions (
        id UUID PRIMARY KEY,
        contract_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        version_no INT NOT NULL,
        pack_code TEXT NOT NULL,
        template_id UUID NULL,
        template_version INT NULL,
        merged_fields_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        clauses_snapshot_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        compensation_snapshot_json JSONB NULL,
        status TEXT NOT NULL DEFAULT 'draft_preview',
        issued_at TIMESTAMPTZ NULL,
        issued_by TEXT NULL,
        pdf_artifact_ref TEXT NULL,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_contract_pv_status CHECK (status IN ('draft_preview', 'issued', 'superseded')),
        CONSTRAINT uq_hrm_contract_pv_contract_ver UNIQUE (contract_id, version_no)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_contract_pv_company_contract
      ON public.hrm_contract_print_versions (company_id, contract_id);
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_contract_pack_rules (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        match_type TEXT NOT NULL,
        match_value TEXT NULL,
        pack_code TEXT NOT NULL,
        priority INT NOT NULL DEFAULT 100,
        status TEXT NOT NULL DEFAULT 'active',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_contract_pack_match CHECK (match_type IN ('job_family', 'fallback')),
        CONSTRAINT chk_hrm_contract_pack_status CHECK (status IN ('active', 'retired'))
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_contract_pack_rules_company
      ON public.hrm_contract_pack_rules (company_id, match_type, priority);
    `);

    // EXPAND registry (ADD-only) — also mirrored in ContractsInsuranceService.ensureSchema
    const expandCols = [
      'signed_at DATE NULL',
      'work_location TEXT NULL',
      'work_location_scope TEXT NULL',
      'archived_at TIMESTAMPTZ NULL',
      'pack_code TEXT NULL',
      'template_id UUID NULL',
      'template_code TEXT NULL',
      'term_type TEXT NULL',
      'job_description_text TEXT NULL',
      'probation_days INT NULL',
      'probation_end DATE NULL',
      'license_class TEXT NULL',
      'driver_license_number TEXT NULL',
      'driver_license_issued_on DATE NULL',
      'driver_license_issued_place TEXT NULL',
      'vehicle_plate TEXT NULL',
      'route_or_region TEXT NULL',
      'contract_name TEXT NULL',
      'work_arrangement TEXT NULL',
      'salary_ratio_percent NUMERIC(6,2) NULL',
      'print_overlay_clause_ids JSONB NULL',
    ];
    for (const col of expandCols) {
      await this.db.query(`ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS ${col};`);
    }
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_employee_contracts_template_code
      ON public.employee_contracts (company_id, template_code)
      WHERE template_code IS NOT NULL AND archived_at IS NULL;
    `);

    // BE-03 — group library publish registry + pull audits + lineage EXPAND
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_contract_library_publishes (
        id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        source_company_id TEXT NOT NULL DEFAULT 'holding',
        publish_version INT NOT NULL,
        checksum TEXT NOT NULL,
        payload_json JSONB NOT NULL,
        label_vi TEXT NULL,
        template_count INT NOT NULL DEFAULT 0,
        clause_count INT NOT NULL DEFAULT 0,
        pack_rule_count INT NOT NULL DEFAULT 0,
        published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        published_by TEXT NULL,
        status TEXT NOT NULL DEFAULT 'published',
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_ctr_lib_pub_status CHECK (status IN ('published', 'retired')),
        CONSTRAINT uq_hrm_ctr_lib_pub_tenant_version UNIQUE (tenant_id, publish_version)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pub_tenant_status_ver
      ON public.hrm_contract_library_publishes (tenant_id, status, publish_version DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pub_tenant_active
      ON public.hrm_contract_library_publishes (tenant_id, archived_at)
      WHERE archived_at IS NULL;
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_contract_library_pull_audits (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        publish_version INT NOT NULL,
        publish_id UUID NULL,
        force BOOLEAN NOT NULL DEFAULT FALSE,
        pulled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        pulled_by TEXT NULL,
        result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        archived_at TIMESTAMPTZ NULL
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pull_company_at
      ON public.hrm_contract_library_pull_audits (company_id, pulled_at DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_lib_pull_company_ver
      ON public.hrm_contract_library_pull_audits (company_id, publish_version);
    `);

    const lineageCols = [
      `origin TEXT NOT NULL DEFAULT 'member'`,
      `origin_company_id TEXT NULL`,
      `origin_publish_version INT NULL`,
      `lineage_code TEXT NULL`,
    ];
    for (const table of [
      'hrm_contract_templates',
      'hrm_contract_clauses',
      'hrm_contract_pack_rules',
    ] as const) {
      for (const col of lineageCols) {
        await this.db.query(`ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS ${col};`);
      }
    }
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_tpl_lineage
      ON public.hrm_contract_templates (company_id, lineage_code) WHERE lineage_code IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_tpl_origin_ver
      ON public.hrm_contract_templates (company_id, origin, origin_publish_version);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_cl_lineage
      ON public.hrm_contract_clauses (company_id, lineage_code) WHERE lineage_code IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_cl_origin_ver
      ON public.hrm_contract_clauses (company_id, origin, origin_publish_version);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_pr_lineage
      ON public.hrm_contract_pack_rules (company_id, lineage_code) WHERE lineage_code IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_pr_origin_ver
      ON public.hrm_contract_pack_rules (company_id, origin, origin_publish_version);
    `);

    // XEVN-TPL-BE-01 — EXPAND templates matrix cols + print_versions.template_code + settings
    const tplMatrixCols = [
      'default_term_type TEXT NULL',
      'default_duration_days INT NULL',
      'default_duration_months INT NULL',
      'title_print_vi TEXT NULL',
      'matrix_family TEXT NULL',
    ];
    for (const col of tplMatrixCols) {
      await this.db.query(
        `ALTER TABLE public.hrm_contract_templates ADD COLUMN IF NOT EXISTS ${col};`,
      );
    }
    await this.db.query(
      `ALTER TABLE public.hrm_contract_print_versions ADD COLUMN IF NOT EXISTS template_code TEXT NULL;`,
    );
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_tpl_matrix_family
      ON public.hrm_contract_templates (company_id, matrix_family)
      WHERE matrix_family IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_tpl_xevn_code
      ON public.hrm_contract_templates (company_id, code)
      WHERE code LIKE 'XEVN_%' AND archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_ctr_pv_template_code
      ON public.hrm_contract_print_versions (company_id, template_code)
      WHERE template_code IS NOT NULL;
    `);

    // DYNAMIC LOCK: drop closed 8-code ceiling if prior wave added it
    await this.db.query(`
      ALTER TABLE public.hrm_contract_templates
        DROP CONSTRAINT IF EXISTS chk_hrm_ctr_tpl_xevn_code;
    `);
    // Drop prefix-only pack gate — pack ∈ allowed packs enforced in app for all codes
    await this.db.query(`
      ALTER TABLE public.hrm_contract_templates
        DROP CONSTRAINT IF EXISTS chk_hrm_ctr_tpl_xevn_pack;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_contract_templates
          ADD CONSTRAINT chk_hrm_ctr_tpl_term_type
          CHECK (default_term_type IS NULL OR default_term_type IN ('probation','definite','indefinite'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_contract_templates
          ADD CONSTRAINT chk_hrm_ctr_tpl_duration_months
          CHECK (default_duration_months IS NULL OR default_duration_months IN (12,24));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_contract_templates
          ADD CONSTRAINT chk_hrm_ctr_tpl_matrix_family
          CHECK (matrix_family IS NULL OR matrix_family IN ('XEVN_MATRIX','LEGACY'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.hrm_contract_templates
          ADD CONSTRAINT chk_hrm_ctr_tpl_pack_allowed
          CHECK (pack_code IN ('GENERAL','IT_OFFICE','DRIVER','LOGISTICS'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_company_settings (
        id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL DEFAULT 'xevn',
        company_id TEXT NOT NULL,
        setting_key TEXT NOT NULL,
        value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        archived_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_hrm_company_settings_tenant_co_key UNIQUE (tenant_id, company_id, setting_key)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_hrm_company_settings_company_key
      ON public.hrm_company_settings (company_id, setting_key)
      WHERE archived_at IS NULL;
    `);

    await this.bootstrapXevnMatrixDrafts('holding');

    this.schemaReady = true;
  }

  /** Schema bootstrap — upsert 8 Excel starter drafts at holding (seed-of-structure, ≠ ceiling). */
  private async bootstrapXevnMatrixDrafts(companyId: string): Promise<void> {
    for (const row of XEVN_MATRIX_CATALOG) {
      const existing = await this.db.query<{ id: string }>(
        `SELECT id FROM public.hrm_contract_templates
         WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
         LIMIT 1;`,
        [companyId, row.code],
      );
      if (existing.rows[0]) continue;
      const layout =
        row.pack_code === 'DRIVER'
          ? { show_driver_license_block: true }
          : { show_driver_license_block: false };
      await this.db.query(
        `INSERT INTO public.hrm_contract_templates
          (id, company_id, code, name_vi, pack_code, layout_json, keyword_map, status, version,
           default_term_type, default_duration_days, default_duration_months, title_print_vi, matrix_family)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, 'draft', 1,
                 $8, $9, $10, $11, $12);`,
        [
          randomUUID(),
          companyId,
          row.code,
          row.name_vi,
          row.pack_code,
          JSON.stringify(layout),
          JSON.stringify(defaultXevnKeywordMap(row.pack_code)),
          row.default_term_type,
          row.default_duration_days,
          row.default_duration_months,
          row.title_print_vi,
          XEVN_MATRIX_FAMILY,
        ],
      );
    }
  }

  private resolveScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, scopeContext);
    const expandedCompanyIds = expandHrmTextCompanyIds(scope, authorization, requestedCompanyId);
    return { scope, expandedCompanyIds, scopeCompanyId };
  }

  private parseJsonObject(raw: unknown): Record<string, unknown> {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>;
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        /* ignore */
      }
    }
    return {};
  }

  private displayTemplate(row: TemplateRow, clauses?: ClauseRow[]) {
    const code = row.code;
    return {
      ...row,
      code,
      template_code: code,
      default_term_type: row.default_term_type ?? null,
      default_duration_days: row.default_duration_days ?? null,
      default_duration_months: row.default_duration_months ?? null,
      title_print_vi: row.title_print_vi ?? null,
      matrix_family: row.matrix_family ?? null,
      layout_json: this.parseJsonObject(row.layout_json),
      keyword_map: this.parseJsonObject(row.keyword_map),
      origin: row.origin ?? 'member',
      origin_company_id: row.origin_company_id ?? null,
      origin_publish_version: row.origin_publish_version ?? null,
      lineage_code: row.lineage_code ?? null,
      clauses: (clauses ?? []).map((c) => this.displayClause(c)),
    };
  }

  private displayClause(row: ClauseRow) {
    const packs = Array.isArray(row.apply_to_packs) ? row.apply_to_packs : [];
    return {
      ...row,
      apply_to_packs: packs,
      origin: row.origin ?? 'member',
      origin_company_id: row.origin_company_id ?? null,
      origin_publish_version: row.origin_publish_version ?? null,
      lineage_code: row.lineage_code ?? null,
    };
  }

  private requirePack(raw: string): ContractPackCode {
    const n = normalizeContractPackCode(raw);
    if (!n) {
      throw new ApiException(HRM_CTR_PACK_INVALID, `Unknown pack_code '${raw}'`, HttpStatus.BAD_REQUEST);
    }
    return n;
  }

  private requireTemplateCode(raw: string): string {
    try {
      return assertValidTemplateCodeFormat(raw);
    } catch {
      throw new ApiException(
        HRM_CTR_TPL_CODE_INVALID,
        `Invalid template code format '${raw}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private assertTermDurationRules(input: {
    termType: string | null | undefined;
    durationDays: number | null | undefined;
    durationMonths: number | null | undefined;
    matrixFamily: string | null | undefined;
  }): void {
    const term = input.termType?.trim() || null;
    if (term && !['probation', 'definite', 'indefinite'].includes(term)) {
      throw new ApiException(
        HRM_CTR_TERM_INVALID,
        `Invalid default_term_type '${term}'`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const months = input.durationMonths;
    if (months != null && months !== 12 && months !== 24) {
      throw new ApiException(
        HRM_CTR_TERM_INVALID,
        'default_duration_months must be 12, 24, or null',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (input.matrixFamily === XEVN_MATRIX_FAMILY && !term) {
      throw new ApiException(
        HRM_CTR_TERM_INVALID,
        'default_term_type required when matrix_family=XEVN_MATRIX',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (term === 'probation' && input.durationDays != null && input.durationDays <= 0) {
      throw new ApiException(
        HRM_CTR_TERM_INVALID,
        'default_duration_days must be positive for probation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * When matrix_family=XEVN_MATRIX, pack must be IT_OFFICE|DRIVER (starter matrix rule).
   * Custom templates (LEGACY/null) may use any allowed pack.
   */
  private assertMatrixPack(
    pack: ContractPackCode,
    matrixFamily: string | null | undefined,
  ): void {
    if (matrixFamily === XEVN_MATRIX_FAMILY && pack !== 'IT_OFFICE' && pack !== 'DRIVER') {
      throw new ApiException(
        HRM_CTR_TPL_PACK_MISMATCH,
        `matrix_family=XEVN_MATRIX requires pack_code IT_OFFICE or DRIVER (got ${pack})`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /** FE may send "" for clear; DTO union omits "" — normalize before assert. */
  private normalizeMatrixFamilyInput(
    raw: string | null | undefined,
  ): string | null {
    if (raw == null) return null;
    const trimmed = String(raw).trim();
    return trimmed === '' ? null : trimmed;
  }

  private resolveMatrixFieldsForCreate(payload: UpsertContractTemplateDto, code: string, pack: ContractPackCode) {
    const starter = getXevnMatrixRow(code);
    let matrixFamily: string | null;
    if (payload.matrix_family !== undefined) {
      matrixFamily = this.normalizeMatrixFamilyInput(payload.matrix_family as string | null);
    } else {
      matrixFamily = starter ? XEVN_MATRIX_FAMILY : null;
    }

    const termType =
      payload.default_term_type ?? starter?.default_term_type ?? null;
    const durationDays =
      payload.default_duration_days !== undefined
        ? payload.default_duration_days
        : (starter?.default_duration_days ?? null);
    const durationMonths =
      payload.default_duration_months !== undefined
        ? payload.default_duration_months
        : (starter?.default_duration_months ?? null);
    const titlePrint =
      payload.title_print_vi?.trim() || starter?.title_print_vi || null;

    if (starter && pack !== starter.pack_code) {
      throw new ApiException(
        HRM_CTR_TPL_PACK_MISMATCH,
        `Starter code ${code} requires pack_code=${starter.pack_code}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    this.assertMatrixPack(pack, matrixFamily);
    this.assertTermDurationRules({
      termType,
      durationDays,
      durationMonths,
      matrixFamily,
    });
    return {
      matrixFamily,
      termType,
      durationDays,
      durationMonths,
      titlePrint,
      layout:
        payload.layout_json ??
        (pack === 'DRIVER'
          ? { show_driver_license_block: true }
          : { show_driver_license_block: false }),
      keywordMap: payload.keyword_map ?? (starter ? defaultXevnKeywordMap(starter.pack_code) : {}),
    };
  }

  private clauseAppliesToPack(clause: ClauseRow, pack: string): boolean {
    const packs = Array.isArray(clause.apply_to_packs) ? clause.apply_to_packs : [];
    if (!packs.length) return true;
    return packs.some((p) => p === '*' || p.toUpperCase() === pack.toUpperCase());
  }

  private readonly tplSelectCols = `id, company_id, code, name_vi, pack_code, layout_json, keyword_map, status, version,
              default_term_type, default_duration_days, default_duration_months, title_print_vi, matrix_family,
              origin, origin_company_id, origin_publish_version, lineage_code,
              archived_at, created_at, updated_at`;

  // --- Templates ---

  async listTemplates(
    query: ListContractTemplatesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { expandedCompanyIds } = this.resolveScope(authorization, query.company_id, scopeContext);
    const filters: string[] = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    if (query.status?.trim()) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status.trim());
    }
    if (query.pack_code?.trim()) {
      filters.push(`pack_code = $${values.length + 1}`);
      values.push(this.requirePack(query.pack_code));
    }
    if (query.matrix?.trim().toLowerCase() === 'xevn') {
      filters.push(`matrix_family = $${values.length + 1}`);
      values.push(XEVN_MATRIX_FAMILY);
    }
    const res = await this.db.query<TemplateRow>(
      `SELECT ${this.tplSelectCols}
       FROM public.hrm_contract_templates
       WHERE ${filters.join(' AND ')}
       ORDER BY code ASC;`,
      values,
    );
    const data = [];
    for (const row of res.rows) {
      const clauses = await this.loadTemplateClausesOrdered(row.id, expandedCompanyIds);
      data.push(this.displayTemplate(row, clauses));
    }
    return { total: data.length, data };
  }

  async getTemplateById(
    templateId: string,
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
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<TemplateRow>(
      `SELECT ${this.tplSelectCols}
       FROM public.hrm_contract_templates WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_CTR_TPL_404, 'Contract template not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_CTR_TPL_404,
      mismatchCode: 'HRM-CTR-409',
    });
    const clauses = await this.loadTemplateClausesOrdered(row.id, expandedCompanyIds);
    return this.displayTemplate(row, clauses);
  }

  private async loadTemplateClausesOrdered(
    templateId: string,
    expandedCompanyIds: string[],
  ): Promise<ClauseRow[]> {
    const filters: string[] = ['tc.template_id = $1::uuid', 'c.archived_at IS NULL'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds, 'c.company_id');
    const res = await this.db.query<ClauseRow>(
      `SELECT c.id, c.company_id, c.code, c.title_vi, c.body_vi, c.clause_group, c.apply_to_packs,
              tc.sort_order, c.mandatory, c.status, c.version, c.effective_from, c.archived_at,
              c.origin, c.origin_company_id, c.origin_publish_version, c.lineage_code,
              c.created_at, c.updated_at
       FROM public.hrm_contract_template_clauses tc
       INNER JOIN public.hrm_contract_clauses c ON c.id = tc.clause_id
       WHERE ${filters.join(' AND ')}
       ORDER BY tc.sort_order ASC, c.code ASC;`,
      values,
    );
    return res.rows;
  }

  async createTemplate(payload: UpsertContractTemplateDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const pack = this.requirePack(payload.pack_code);
    const code = this.requireTemplateCode(payload.code);
    const nameVi = payload.name_vi.trim();
    if (!nameVi) {
      throw new ApiException(HRM_CTR_CL_REQUIRED, 'Template name_vi is required', HttpStatus.BAD_REQUEST);
    }
    const matrix = this.resolveMatrixFieldsForCreate(payload, code, pack);
    const status = payload.status ?? 'draft';
    if (status === 'active' && matrix.matrixFamily === XEVN_MATRIX_FAMILY && !matrix.titlePrint) {
      throw new ApiException(
        HRM_CTR_CL_REQUIRED,
        'title_print_vi required when activating XEVN_MATRIX template',
        HttpStatus.BAD_REQUEST,
      );
    }
    const id = randomUUID();
    try {
      await this.db.query(
        `INSERT INTO public.hrm_contract_templates
          (id, company_id, code, name_vi, pack_code, layout_json, keyword_map, status, version,
           default_term_type, default_duration_days, default_duration_months, title_print_vi, matrix_family)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, 1,
                 $9, $10, $11, $12, $13);`,
        [
          id,
          companyId,
          code,
          nameVi,
          pack,
          JSON.stringify(matrix.layout),
          JSON.stringify(matrix.keywordMap),
          status,
          matrix.termType,
          matrix.durationDays,
          matrix.durationMonths,
          matrix.titlePrint,
          matrix.matrixFamily,
        ],
      );
      if (payload.clause_ids) {
        await this.replaceTemplateClauses(id, companyId, payload.clause_ids, authorization);
      }
      return this.getTemplateById(id, companyId, authorization);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('uq_hrm_contract_templates_company_code_active')) {
        throw new ApiException(
          HRM_CTR_CL_CODE_CONFLICT,
          `Template code '${code}' already exists`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async updateTemplate(
    templateId: string,
    payload: UpdateContractTemplateDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getTemplateById(templateId, requestedCompanyId, authorization);
    const pack =
      payload.pack_code !== undefined
        ? this.requirePack(payload.pack_code)
        : this.requirePack(String(existing.pack_code));
    const matrixFamily =
      payload.matrix_family !== undefined
        ? this.normalizeMatrixFamilyInput(payload.matrix_family as string | null)
        : ((existing.matrix_family as string | null) ?? null);
    this.assertMatrixPack(pack, matrixFamily);
    const termType =
      payload.default_term_type !== undefined
        ? payload.default_term_type
        : ((existing.default_term_type as string | null) ?? null);
    const durationDays =
      payload.default_duration_days !== undefined
        ? payload.default_duration_days
        : ((existing.default_duration_days as number | null) ?? null);
    const durationMonths =
      payload.default_duration_months !== undefined
        ? payload.default_duration_months
        : ((existing.default_duration_months as number | null) ?? null);
    this.assertTermDurationRules({
      termType,
      durationDays,
      durationMonths,
      matrixFamily,
    });
    const starter = getXevnMatrixRow(String(existing.code));
    if (starter && pack !== starter.pack_code) {
      throw new ApiException(
        HRM_CTR_TPL_PACK_MISMATCH,
        `Starter code ${existing.code} requires pack_code=${starter.pack_code}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const stampOverride =
      (existing.origin === 'group' || existing.origin === 'member_override') &&
      (payload.name_vi !== undefined ||
        payload.layout_json !== undefined ||
        payload.keyword_map !== undefined ||
        payload.pack_code !== undefined ||
        payload.title_print_vi !== undefined ||
        payload.default_term_type !== undefined);
    await this.db.query(
      `UPDATE public.hrm_contract_templates
       SET name_vi = COALESCE($1, name_vi),
           pack_code = $2,
           layout_json = COALESCE($3::jsonb, layout_json),
           keyword_map = COALESCE($4::jsonb, keyword_map),
           status = COALESCE($5, status),
           default_term_type = COALESCE($6, default_term_type),
           default_duration_days = CASE WHEN $7::boolean THEN $8 ELSE default_duration_days END,
           default_duration_months = CASE WHEN $9::boolean THEN $10 ELSE default_duration_months END,
           title_print_vi = COALESCE($11, title_print_vi),
           matrix_family = CASE WHEN $12::boolean THEN $13 ELSE matrix_family END,
           origin = CASE WHEN $14::boolean THEN 'member_override' ELSE origin END,
           updated_at = NOW()
       WHERE id = $15::uuid;`,
      [
        payload.name_vi?.trim() ?? null,
        pack,
        payload.layout_json !== undefined ? JSON.stringify(payload.layout_json) : null,
        payload.keyword_map !== undefined ? JSON.stringify(payload.keyword_map) : null,
        payload.status ?? null,
        payload.default_term_type ?? null,
        payload.default_duration_days !== undefined,
        payload.default_duration_days ?? null,
        payload.default_duration_months !== undefined,
        payload.default_duration_months ?? null,
        payload.title_print_vi?.trim() ?? null,
        payload.matrix_family !== undefined,
        payload.matrix_family ?? null,
        stampOverride,
        templateId,
      ],
    );
    if (payload.clause_ids) {
      await this.replaceTemplateClauses(
        templateId,
        existing.company_id as string,
        payload.clause_ids,
        authorization,
      );
    }
    return this.getTemplateById(templateId, requestedCompanyId, authorization);
  }

  async activateTemplate(
    templateId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getTemplateById(templateId, requestedCompanyId, authorization);
    if (
      existing.matrix_family === XEVN_MATRIX_FAMILY &&
      !String(existing.title_print_vi ?? '').trim()
    ) {
      throw new ApiException(
        HRM_CTR_CL_REQUIRED,
        'title_print_vi required when activating XEVN_MATRIX template',
        HttpStatus.BAD_REQUEST,
      );
    }
    const issuedRef = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM public.hrm_contract_print_versions
       WHERE template_id = $1::uuid AND status = 'issued' AND archived_at IS NULL;`,
      [templateId],
    );
    const bump = Number(issuedRef.rows[0]?.c ?? 0) > 0;
    await this.db.query(
      `UPDATE public.hrm_contract_templates
       SET status = 'active',
           version = CASE WHEN $2::boolean THEN version + 1 ELSE version END,
           updated_at = NOW()
       WHERE id = $1::uuid;`,
      [templateId, bump],
    );
    return this.getTemplateById(templateId, existing.company_id as string, authorization);
  }

  async putTemplateClauses(
    templateId: string,
    payload: PutTemplateClausesDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    const existing = await this.getTemplateById(templateId, requestedCompanyId, authorization);
    await this.replaceTemplateClauses(
      templateId,
      existing.company_id as string,
      payload.clause_ids,
      authorization,
    );
    return this.getTemplateById(templateId, requestedCompanyId, authorization);
  }

  private async replaceTemplateClauses(
    templateId: string,
    companyId: string,
    clauseIds: string[],
    authorization?: string,
  ) {
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    for (const clauseId of clauseIds) {
      const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
      const values: unknown[] = [clauseId];
      pushCompanyIdFilter(filters, values, expandedCompanyIds);
      const found = await this.db.query<{ id: string }>(
        `SELECT id FROM public.hrm_contract_clauses WHERE ${filters.join(' AND ')} LIMIT 1;`,
        values,
      );
      if (!found.rows[0]) {
        throw new ApiException(HRM_CTR_CL_404, `Clause ${clauseId} not found in scope`, HttpStatus.NOT_FOUND);
      }
    }
    await this.db.query(`DELETE FROM public.hrm_contract_template_clauses WHERE template_id = $1::uuid;`, [
      templateId,
    ]);
    let order = 0;
    for (const clauseId of clauseIds) {
      await this.db.query(
        `INSERT INTO public.hrm_contract_template_clauses (id, template_id, clause_id, company_id, sort_order)
         VALUES ($1, $2::uuid, $3::uuid, $4, $5);`,
        [randomUUID(), templateId, clauseId, companyId, order++],
      );
    }
  }

  // --- Clauses ---

  async listClauses(
    query: ListContractClausesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { expandedCompanyIds } = this.resolveScope(authorization, query.company_id, scopeContext);
    const filters: string[] = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    if (query.status?.trim()) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status.trim());
    }
    if (query.clause_group?.trim()) {
      filters.push(`clause_group = $${values.length + 1}`);
      values.push(query.clause_group.trim());
    }
    if (query.pack_code?.trim()) {
      const pack = this.requirePack(query.pack_code);
      filters.push(
        `($${values.length + 1} = ANY(apply_to_packs) OR '*' = ANY(apply_to_packs))`,
      );
      values.push(pack);
    }
    const res = await this.db.query<ClauseRow>(
      `SELECT id, company_id, code, title_vi, body_vi, clause_group, apply_to_packs, sort_order,
              mandatory, status, version, effective_from, archived_at, created_at, updated_at,
              origin, origin_company_id, origin_publish_version, lineage_code
       FROM public.hrm_contract_clauses
       WHERE ${filters.join(' AND ')}
       ORDER BY sort_order ASC, code ASC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows.map((r) => this.displayClause(r)) };
  }

  async getClauseById(
    clauseId: string,
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
    const values: unknown[] = [clauseId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<ClauseRow>(
      `SELECT id, company_id, code, title_vi, body_vi, clause_group, apply_to_packs, sort_order,
              mandatory, status, version, effective_from, archived_at, created_at, updated_at,
              origin, origin_company_id, origin_publish_version, lineage_code
       FROM public.hrm_contract_clauses WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_CTR_CL_404, 'Contract clause not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_CTR_CL_404,
      mismatchCode: 'HRM-CTR-409',
    });
    return this.displayClause(row);
  }

  private assertClauseRequired(code: string, title: string, body: string) {
    if (!code.trim() || !title.trim() || !body.trim()) {
      throw new ApiException(
        HRM_CTR_CL_REQUIRED,
        'Clause code, title_vi and body_vi are required',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createClause(payload: UpsertContractClauseDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    this.assertClauseRequired(payload.code, payload.title_vi, payload.body_vi);
    const packs = (payload.apply_to_packs?.length ? payload.apply_to_packs : ['*']).map((p) =>
      p.trim().toUpperCase(),
    );
    for (const p of packs) {
      if (p !== '*' && !normalizeContractPackCode(p)) {
        throw new ApiException(HRM_CTR_PACK_INVALID, `Invalid apply_to_packs entry '${p}'`, HttpStatus.BAD_REQUEST);
      }
    }
    const status = payload.status ?? 'draft';
    const id = randomUUID();
    try {
      if (status === 'active') {
        await this.assertNoActiveCodeConflict(companyId, payload.code.trim());
      }
      const res = await this.db.query<ClauseRow>(
        `INSERT INTO public.hrm_contract_clauses
          (id, company_id, code, title_vi, body_vi, clause_group, apply_to_packs, sort_order, mandatory, status, version, effective_from)
         VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, $10, 1, $11::date)
         RETURNING id, company_id, code, title_vi, body_vi, clause_group, apply_to_packs, sort_order,
                   mandatory, status, version, effective_from, archived_at, created_at, updated_at;`,
        [
          id,
          companyId,
          payload.code.trim(),
          payload.title_vi.trim(),
          payload.body_vi.trim(),
          payload.clause_group.trim(),
          packs,
          payload.sort_order ?? 0,
          payload.mandatory ?? false,
          status,
          payload.effective_from ?? null,
        ],
      );
      return this.displayClause(res.rows[0]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('uq_hrm_contract_clauses_company_code_active')) {
        throw new ApiException(
          HRM_CTR_CL_CODE_CONFLICT,
          `Active clause code '${payload.code}' already exists`,
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  private async assertNoActiveCodeConflict(companyId: string, code: string, excludeId?: string) {
    const res = await this.db.query<{ id: string }>(
      `SELECT id FROM public.hrm_contract_clauses
       WHERE company_id = $1 AND lower(code) = lower($2) AND status = 'active' AND archived_at IS NULL
         AND ($3::uuid IS NULL OR id <> $3::uuid)
       LIMIT 1;`,
      [companyId, code, excludeId ?? null],
    );
    if (res.rows[0]) {
      throw new ApiException(
        HRM_CTR_CL_CODE_CONFLICT,
        `Active clause code '${code}' already exists`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async updateClause(
    clauseId: string,
    payload: UpdateContractClauseDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getClauseById(clauseId, requestedCompanyId, authorization);
    const title = payload.title_vi !== undefined ? payload.title_vi.trim() : (existing.title_vi as string);
    const body = payload.body_vi !== undefined ? payload.body_vi.trim() : (existing.body_vi as string);
    this.assertClauseRequired(existing.code as string, title, body);
    if (payload.status === 'active' || (existing.status === 'active' && payload.body_vi !== undefined)) {
      // Active body change that was issued → force activate path (version bump) — soft-block silent overwrite
      const issued = await this.clauseHasIssuedSnapshot(
        existing.code as string,
        existing.company_id as string,
        authorization,
        requestedCompanyId,
      );
      if (issued && payload.body_vi !== undefined && existing.status === 'active') {
        throw new ApiException(
          HRM_CTR_CL_CODE_CONFLICT,
          'Active issued clause body change requires POST …/activate (version bump)',
          HttpStatus.CONFLICT,
        );
      }
    }
    const packs =
      payload.apply_to_packs !== undefined
        ? payload.apply_to_packs.map((p) => p.trim().toUpperCase())
        : null;
    const stampOverride =
      (existing.origin === 'group' || existing.origin === 'member_override') &&
      (payload.title_vi !== undefined ||
        payload.body_vi !== undefined ||
        payload.clause_group !== undefined ||
        payload.apply_to_packs !== undefined);
    await this.db.query(
      `UPDATE public.hrm_contract_clauses
       SET title_vi = $1,
           body_vi = $2,
           clause_group = COALESCE($3, clause_group),
           apply_to_packs = COALESCE($4::text[], apply_to_packs),
           sort_order = COALESCE($5, sort_order),
           mandatory = COALESCE($6, mandatory),
           status = COALESCE($7, status),
           effective_from = COALESCE($8::date, effective_from),
           origin = CASE WHEN $10::boolean THEN 'member_override' ELSE origin END,
           updated_at = NOW()
       WHERE id = $9::uuid;`,
      [
        title,
        body,
        payload.clause_group?.trim() ?? null,
        packs,
        payload.sort_order ?? null,
        payload.mandatory ?? null,
        payload.status ?? null,
        payload.effective_from ?? null,
        clauseId,
        stampOverride,
      ],
    );
    return this.getClauseById(clauseId, requestedCompanyId, authorization);
  }

  /**
   * True when an issued print version in scope contains this clause code in clauses_snapshot_json.
   * Uses jsonb_array_elements (not ILIKE) so PG jsonb text spacing cannot miss matches.
   * Company filter uses expandHrmTextCompanyIds (main↔holding rollup) like list/get scope parity.
   */
  private async clauseHasIssuedSnapshot(
    code: string,
    clauseCompanyId: string,
    authorization?: string,
    requestedCompanyId?: string,
  ): Promise<boolean> {
    const scopeKey = (requestedCompanyId ?? clauseCompanyId).trim();
    const { expandedCompanyIds } = this.resolveScope(authorization, scopeKey);
    const companyIds = [
      ...new Set(
        [...expandedCompanyIds, clauseCompanyId.trim()].map((id) => id.trim().toLowerCase()).filter(Boolean),
      ),
    ];
    const normalizedCode = code.trim();
    if (!normalizedCode || companyIds.length === 0) {
      return false;
    }
    const res = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c
       FROM public.hrm_contract_print_versions pv
       WHERE pv.archived_at IS NULL
         AND pv.status = 'issued'
         AND pv.company_id = ANY($1::text[])
         AND EXISTS (
           SELECT 1
           FROM jsonb_array_elements(
             CASE jsonb_typeof(pv.clauses_snapshot_json)
               WHEN 'array' THEN pv.clauses_snapshot_json
               ELSE '[]'::jsonb
             END
           ) AS elem
           WHERE lower(trim(elem->>'code')) = lower(trim($2))
         );`,
      [companyIds, normalizedCode],
    );
    return Number(res.rows[0]?.c ?? 0) > 0;
  }

  async activateClause(
    clauseId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getClauseById(clauseId, requestedCompanyId, authorization);
    this.assertClauseRequired(
      existing.code as string,
      existing.title_vi as string,
      existing.body_vi as string,
    );
    await this.assertNoActiveCodeConflict(
      existing.company_id as string,
      existing.code as string,
      clauseId,
    );
    // Retire other active same code (same company)
    await this.db.query(
      `UPDATE public.hrm_contract_clauses
       SET status = 'retired', updated_at = NOW()
       WHERE company_id = $1 AND lower(code) = lower($2) AND status = 'active'
         AND archived_at IS NULL AND id <> $3::uuid;`,
      [existing.company_id, existing.code, clauseId],
    );
    const issued = await this.clauseHasIssuedSnapshot(
      existing.code as string,
      existing.company_id as string,
      authorization,
      requestedCompanyId,
    );
    await this.db.query(
      `UPDATE public.hrm_contract_clauses
       SET status = 'active',
           version = CASE WHEN $2::boolean THEN version + 1 ELSE GREATEST(version, 1) END,
           updated_at = NOW()
       WHERE id = $1::uuid;`,
      [clauseId, issued],
    );
    return this.getClauseById(clauseId, existing.company_id as string, authorization);
  }

  async retireClause(
    clauseId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const existing = await this.getClauseById(clauseId, requestedCompanyId, authorization);
    await this.db.query(
      `UPDATE public.hrm_contract_clauses SET status = 'retired', updated_at = NOW() WHERE id = $1::uuid;`,
      [clauseId],
    );
    return this.getClauseById(clauseId, existing.company_id as string, authorization);
  }

  async softDeleteClause(
    clauseId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await this.getClauseById(clauseId, requestedCompanyId, authorization);
    await this.db.query(
      `UPDATE public.hrm_contract_clauses SET archived_at = NOW(), status = 'retired', updated_at = NOW()
       WHERE id = $1::uuid;`,
      [clauseId],
    );
    return { id: clauseId, archived: true };
  }

  // --- Pack rules ---

  async listPackRules(
    query: ListContractPackRulesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { expandedCompanyIds } = this.resolveScope(authorization, query.company_id, scopeContext);
    const filters: string[] = [`archived_at IS NULL`, `status = 'active'`];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<PackRuleRow>(
      `SELECT id, company_id, match_type, match_value, pack_code, priority, status,
              origin, origin_company_id, origin_publish_version, lineage_code
       FROM public.hrm_contract_pack_rules
       WHERE ${filters.join(' AND ')}
       ORDER BY priority ASC, match_type ASC;`,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((r) => ({
        ...r,
        origin: r.origin ?? 'member',
        origin_company_id: r.origin_company_id ?? null,
        origin_publish_version: r.origin_publish_version ?? null,
        lineage_code: r.lineage_code ?? null,
      })),
      allowed_packs: [...CONTRACT_PACK_CODES],
    };
  }

  async putPackRules(payload: PutContractPackRulesDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    for (const r of payload.rules) {
      this.requirePack(r.pack_code);
      if (r.match_type !== 'job_family' && r.match_type !== 'fallback') {
        throw new ApiException(HRM_CTR_PACK_INVALID, `Invalid match_type '${r.match_type}'`, HttpStatus.BAD_REQUEST);
      }
    }
    await this.db.query(
      `UPDATE public.hrm_contract_pack_rules SET archived_at = NOW(), status = 'retired', updated_at = NOW()
       WHERE company_id = $1 AND archived_at IS NULL;`,
      [companyId],
    );
    for (const r of payload.rules) {
      await this.db.query(
        `INSERT INTO public.hrm_contract_pack_rules
          (id, company_id, match_type, match_value, pack_code, priority, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active');`,
        [
          randomUUID(),
          companyId,
          r.match_type,
          r.match_type === 'fallback' ? null : (r.match_value?.trim().toUpperCase() ?? null),
          this.requirePack(r.pack_code),
          r.priority ?? 100,
        ],
      );
    }
    return this.listPackRules({ company_id: companyId }, authorization);
  }

  async resolvePackForEmployee(
    companyId: string,
    employeeId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveScope(authorization, companyId, scopeContext);
    const empFilters: string[] = ['e.id = $1::uuid', 'e.archived_at IS NULL'];
    const empValues: unknown[] = [employeeId];
    pushCompanyIdFilter(empFilters, empValues, expandedCompanyIds, 'e.company_id');
    const emp = await this.db.query<{
      id: string;
      company_id: string;
      job_title_key: string | null;
      custom_fields: Record<string, unknown> | string | null;
    }>(
      `SELECT e.id, e.company_id::text AS company_id, e.job_title_key, e.custom_fields
       FROM public.employees e WHERE ${empFilters.join(' AND ')} LIMIT 1;`,
      empValues,
    );
    const row = emp.rows[0];
    if (!row) {
      throw new ApiException('HRM-CON-404', 'Employee not found', HttpStatus.NOT_FOUND);
    }
    // pg JSONB may arrive as string | object — normalize before scope assert (TS2345 watch).
    const cf = this.parseJsonObject(row.custom_fields);
    assertResourceInHrmScope(
      { company_id: row.company_id, custom_fields: cf },
      scope,
      {
        notFoundCode: 'HRM-CON-404',
        mismatchCode: 'HRM-CTR-409',
      },
    );
    const jobFamily = String(
      cf.job_family ?? cf.job_family_key ?? cf.position_family ?? row.job_title_key ?? '',
    )
      .trim()
      .toUpperCase();

    const rules = await this.listPackRules({ company_id: companyId }, authorization, scopeContext);
    let suggested: ContractPackCode = CONTRACT_PACK_DEFAULT;
    let reason = 'hard_default_GENERAL';
    const sorted = [...rules.data].sort((a, b) => a.priority - b.priority);
    for (const r of sorted) {
      if (r.match_type === 'job_family' && r.match_value && jobFamily.includes(r.match_value)) {
        suggested = this.requirePack(r.pack_code);
        reason = `job_family:${r.match_value}`;
        break;
      }
    }
    if (reason === 'hard_default_GENERAL') {
      const fb = sorted.find((r) => r.match_type === 'fallback');
      if (fb) {
        suggested = this.requirePack(fb.pack_code);
        reason = 'fallback_rule';
      }
    }
    return {
      employee_id: employeeId,
      job_family: jobFamily || null,
      suggested_pack: suggested,
      allowed_packs: [...CONTRACT_PACK_CODES],
      reason,
    };
  }

  // --- Preview / print versions ---

  private async loadContractForPrint(
    contractId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<ContractPrintRow> {
    const { scope, expandedCompanyIds } = this.resolveScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const filters: string[] = [
      'ec.id = $1::uuid',
      'ec.archived_at IS NULL',
      'e.archived_at IS NULL',
    ];
    const values: unknown[] = [contractId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds, 'ec.company_id');
    const res = await this.db.query<
      ContractPrintRow & { employee_custom_fields?: Record<string, unknown> | string | null }
    >(
      `SELECT ec.id, ec.company_id, ec.employee_id, ec.contract_code, ec.contract_type,
              ec.start_date, ec.end_date, ec.status, ec.notes, ec.position, ec.position_key,
              ec.department, ec.work_location, ec.work_location_scope, ec.term_type,
              ec.job_description_text, ec.probation_days, ec.probation_end,
              ec.license_class, ec.driver_license_number, ec.driver_license_issued_on,
              ec.driver_license_issued_place, ec.vehicle_plate, ec.route_or_region,
              ec.pack_code, ec.template_id, ec.template_code,
              ec.compensation_package_id, ec.print_overlay_clause_ids,
              ec.signer_name, ec.signer_position,
              e.full_name AS employee_name, e.employee_code AS employee_code,
              e.email AS employee_email, e.custom_fields AS employee_custom_fields
       FROM public.employee_contracts ec
       LEFT JOIN public.employees e ON e.id = ec.employee_id
       WHERE ${filters.join(' AND ')} AND e.id IS NOT NULL
       LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-CON-404', 'Contract not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-CON-404',
      mismatchCode: 'HRM-CTR-409',
    });
    const cf = this.parseJsonObject(row.employee_custom_fields);
    return {
      ...row,
      print_overlay_clause_ids: this.parseOverlayClauseIds(row.print_overlay_clause_ids),
      employee_dob: (cf.date_of_birth as string) ?? (cf.dob as string) ?? null,
      employee_gender: (cf.gender as string) ?? null,
      employee_id_number: (cf.id_number as string) ?? (cf.cccd as string) ?? null,
      employee_phone: (cf.phone as string) ?? (cf.mobile as string) ?? null,
      employee_address: (cf.address as string) ?? (cf.residence_address as string) ?? null,
    };
  }

  private parseOverlayClauseIds(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((x) => String(x)).filter((x) => x.length > 0);
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as unknown;
        return this.parseOverlayClauseIds(parsed);
      } catch {
        return [];
      }
    }
    return [];
  }

  /** F-CORE-CTR-OVERLAY-01 — ordered clause rows; does not mutate template junction. */
  async resolveClausesByOrderedIds(
    companyId: string,
    pack: ContractPackCode,
    clauseIds: string[],
    authorization?: string,
  ): Promise<ClauseRow[]> {
    if (!clauseIds.length) {
      return [];
    }
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const filters: string[] = ['c.archived_at IS NULL', 'c.status = $2'];
    const values: unknown[] = [clauseIds, 'active'];
    pushCompanyIdFilter(filters, values, expandedCompanyIds, 'c.company_id');
    const res = await this.db.query<ClauseRow & { id: string }>(
      `SELECT c.id, c.company_id, c.code, c.title_vi, c.body_vi, c.clause_group, c.apply_to_packs,
              0 AS sort_order, c.mandatory, c.status, c.version, c.effective_from, c.archived_at,
              c.origin, c.origin_company_id, c.origin_publish_version, c.lineage_code,
              c.created_at, c.updated_at
       FROM public.hrm_contract_clauses c
       WHERE c.id = ANY($1::uuid[]) AND ${filters.join(' AND ')};`,
      values,
    );
    const byId = new Map(res.rows.map((r) => [r.id, r]));
    const ordered: ClauseRow[] = [];
    for (const id of clauseIds) {
      const row = byId.get(id);
      if (!row) {
        throw new ApiException(
          HRM_CTR_OVERLAY_400,
          `clause_id ${id} not found or inactive in scope`,
          HttpStatus.BAD_REQUEST,
          { field: 'clause_ids', clause_id: id },
        );
      }
      if (!this.clauseAppliesToPack(row, pack)) {
        throw new ApiException(
          HRM_CTR_OVERLAY_400,
          `clause ${row.code} does not apply to pack ${pack}`,
          HttpStatus.BAD_REQUEST,
          { field: 'clause_ids', clause_id: id, pack_code: pack },
        );
      }
      ordered.push({ ...row, sort_order: ordered.length });
    }
    return ordered;
  }

  /** GET detail — read-only clause rows; skips missing/inactive ids (no overlay mutate throw). */
  private async loadClauseLayoutReadOnly(
    companyId: string,
    pack: ContractPackCode,
    clauseIds: string[],
    authorization?: string,
  ): Promise<ClauseLayoutItem[]> {
    if (!clauseIds.length) {
      return [];
    }
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const filters: string[] = ['c.archived_at IS NULL', 'c.status = $2'];
    const values: unknown[] = [clauseIds, 'active'];
    pushCompanyIdFilter(filters, values, expandedCompanyIds, 'c.company_id');
    const res = await this.db.query<ClauseRow & { id: string }>(
      `SELECT c.id, c.company_id, c.code, c.title_vi, c.body_vi, c.clause_group, c.apply_to_packs,
              0 AS sort_order, c.mandatory, c.status, c.version, c.effective_from, c.archived_at,
              c.origin, c.origin_company_id, c.origin_publish_version, c.lineage_code,
              c.created_at, c.updated_at
       FROM public.hrm_contract_clauses c
       WHERE c.id = ANY($1::uuid[]) AND ${filters.join(' AND ')};`,
      values,
    );
    const byId = new Map(res.rows.map((r) => [r.id, r]));
    const layout: ClauseLayoutItem[] = [];
    for (const id of clauseIds) {
      const row = byId.get(id);
      if (!row || !this.clauseAppliesToPack(row, pack)) {
        continue;
      }
      layout.push({
        id: row.id,
        code: row.code,
        title_vi: row.title_vi,
        body_vi: row.body_vi,
        clause_group: row.clause_group,
        mandatory: Boolean(row.mandatory),
        sort_order: layout.length,
      });
    }
    return layout;
  }

  private mapClauseRowsToLayout(clauseRows: ClauseRow[]): ClauseLayoutItem[] {
    return clauseRows.map((row, index) => ({
      id: row.id,
      code: row.code,
      title_vi: row.title_vi,
      body_vi: row.body_vi,
      clause_group: row.clause_group,
      mandatory: Boolean(row.mandatory),
      sort_order: row.sort_order ?? index,
    }));
  }

  /**
   * F-CORE-CTR-GET-LAYOUT-01 — enrich GET contract detail for ContractWorkspace view/edit step 2.
   * Resolution: overlay ids → template junction default; can_issue mirrors previewContract predicate.
   */
  async resolveContractDetailLayout(
    contract: ContractDetailLayoutInput,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<ContractDetailLayoutEnrichment> {
    await this.ensureSchema();
    const overlayStored = this.parseOverlayClauseIds(contract.print_overlay_clause_ids);
    const print_overlay_clause_ids = overlayStored.length ? overlayStored : null;

    let template: TemplateRow | null = null;
    let pack: ContractPackCode = CONTRACT_PACK_DEFAULT;
    try {
      template = await this.resolveActiveTemplate(
        contract.company_id,
        contract.pack_code ? this.requirePack(contract.pack_code) : null,
        contract.template_id ?? undefined,
        contract.template_code ?? undefined,
        authorization,
      );
      pack = this.requirePack(template.pack_code);
    } catch {
      if (contract.pack_code?.trim()) {
        try {
          pack = this.requirePack(contract.pack_code);
        } catch {
          pack = CONTRACT_PACK_DEFAULT;
        }
      }
    }

    let clauseIds: string[];
    let clause_layout: ClauseLayoutItem[];

    if (overlayStored.length) {
      clauseIds = overlayStored;
      clause_layout = await this.loadClauseLayoutReadOnly(
        contract.company_id,
        pack,
        clauseIds,
        authorization,
      );
    } else if (template) {
      const clauseRows = await this.resolveClausesForPack(
        contract.company_id,
        pack,
        template.id,
        authorization,
      );
      clauseIds = clauseRows.map((r) => r.id);
      clause_layout = this.mapClauseRowsToLayout(clauseRows);
    } else {
      clauseIds = [];
      clause_layout = [];
    }

    let can_issue = false;
    let missing_fields: Array<{ field: string; message: string }> = [];
    let missing_clauses: Array<{ code: string; title_vi: string }> = [];
    let summaryPack = pack;
    let summaryTemplateCode = template?.code ?? contract.template_code ?? null;

    if (contract.employee_id) {
      try {
        const preview = await this.previewContract(
          contract.id,
          {},
          requestedCompanyId,
          authorization,
          scopeContext,
        );
        can_issue = preview.can_issue;
        missing_fields = preview.missing_fields;
        missing_clauses = preview.missing_clauses;
        summaryPack = this.requirePack(preview.pack_code);
        summaryTemplateCode = preview.template_code;
      } catch {
        can_issue = false;
      }
    } else {
      missing_fields = [
        {
          field: 'employee_id',
          message: 'Employee is required before contract can be issued',
        },
      ];
    }

    return {
      clause_ids: clauseIds,
      print_overlay_clause_ids,
      clause_layout,
      can_issue,
      preview_summary: {
        pack_code: summaryPack,
        template_code: summaryTemplateCode,
        missing_fields,
        missing_clauses,
      },
    };
  }

  async putContractPrintOverlay(
    contractId: string,
    payload: PutContractPrintOverlayDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const contract = await this.loadContractForPrint(
      contractId,
      requestedCompanyId,
      authorization,
      scopeContext,
    );
    const template = contract.template_id
      ? await this.getTemplateRowById(contract.template_id, contract.company_id, authorization)
      : null;
    const pack = this.requirePack(template?.pack_code ?? contract.pack_code ?? CONTRACT_PACK_DEFAULT);
    const clauseIds = payload.clause_ids ?? [];
    await this.resolveClausesByOrderedIds(contract.company_id, pack, clauseIds, authorization);
    await this.db.query(
      `UPDATE public.employee_contracts
       SET print_overlay_clause_ids = $1::jsonb, updated_at = NOW()
       WHERE id = $2::uuid AND archived_at IS NULL;`,
      [JSON.stringify(clauseIds), contractId],
    );
    return {
      contract_id: contractId,
      clause_ids: clauseIds,
      pack_code: pack,
    };
  }

  private async getTemplateRowById(
    templateId: string,
    companyId: string,
    authorization?: string,
  ): Promise<TemplateRow | null> {
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<TemplateRow>(
      `SELECT ${this.tplSelectCols} FROM public.hrm_contract_templates WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    return res.rows[0] ?? null;
  }

  /**
   * VAL-CTR-TPL-03 / AC-PLT-CTR-TPL-04 — when active EFF>0, reject invent template_code/id.
   * Empty active = soft skip (U65 · UF-HRM-02 nullable · L-CTR-TPL-08).
   * Format-invalid code → HRM-CTR-TPL-CODE-INVALID (≠ KEY).
   */
  async assertTemplateKeysForConsumer(input: {
    companyId: string;
    templateId?: string | null;
    templateCode?: string | null;
    authorization?: string;
  }): Promise<void> {
    await this.ensureSchema();
    const rawId = input.templateId?.trim() || '';
    const rawCode = input.templateCode?.trim() || '';
    if (!rawId && !rawCode) {
      return;
    }
    // Format-only gate before EFF soft-skip — CODE-INVALID ≠ invent KEY.
    const code = rawCode ? this.requireTemplateCode(rawCode) : '';
    const activeCount = await this.countActiveTemplates(input.companyId, input.authorization);
    if (activeCount === 0) {
      return;
    }
    if (code) {
      const hit = await this.findActiveTemplateByCode(input.companyId, code, input.authorization);
      if (!hit) {
        throw new ApiException(
          HRM_CTR_TPL_KEY,
          `template_code '${code}' is not in Nest hrm_contract_templates active catalog (invent forbidden when active ≠ empty)`,
          HttpStatus.BAD_REQUEST,
          { field: 'template_code', key: code },
        );
      }
    }
    if (rawId) {
      const hit = await this.findTemplateRowById(input.companyId, rawId, input.authorization);
      if (!hit || hit.status !== 'active' || hit.archived_at) {
        throw new ApiException(
          HRM_CTR_TPL_KEY,
          `template_id '${rawId}' is not in Nest hrm_contract_templates active catalog (invent forbidden when active ≠ empty)`,
          HttpStatus.BAD_REQUEST,
          { field: 'template_id', key: rawId },
        );
      }
    }
  }

  private async countActiveTemplates(
    companyId: string,
    authorization?: string,
  ): Promise<number> {
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const filters: string[] = [`status = 'active'`, 'archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c
       FROM public.hrm_contract_templates
       WHERE ${filters.join(' AND ')};`,
      values,
    );
    return Number(res.rows[0]?.c ?? 0);
  }

  private async findActiveTemplateByCode(
    companyId: string,
    code: string,
    authorization?: string,
  ): Promise<TemplateRow | null> {
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const filters: string[] = [
      `status = 'active'`,
      'archived_at IS NULL',
      `lower(code) = lower($1)`,
    ];
    const values: unknown[] = [code];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<TemplateRow>(
      `SELECT ${this.tplSelectCols}
       FROM public.hrm_contract_templates
       WHERE ${filters.join(' AND ')}
       ORDER BY updated_at DESC LIMIT 1;`,
      values,
    );
    return res.rows[0] ?? null;
  }

  private async findTemplateRowById(
    companyId: string,
    templateId: string,
    authorization?: string,
  ): Promise<TemplateRow | null> {
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [templateId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<TemplateRow>(
      `SELECT ${this.tplSelectCols}
       FROM public.hrm_contract_templates
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    return res.rows[0] ?? null;
  }

  /** Print/preview invent miss: KEY when EFF>0; NONE when empty catalog. */
  private async rejectConsumerInventOrEmpty(input: {
    companyId: string;
    field: string;
    raw: string;
    authorization?: string;
  }): Promise<never> {
    const activeCount = await this.countActiveTemplates(input.companyId, input.authorization);
    if (activeCount > 0) {
      throw new ApiException(
        HRM_CTR_TPL_KEY,
        `${input.field} '${input.raw}' is not in Nest hrm_contract_templates active catalog (invent forbidden when active ≠ empty)`,
        HttpStatus.BAD_REQUEST,
        { field: input.field, key: input.raw },
      );
    }
    throw new ApiException(
      HRM_CTR_TPL_NONE,
      'No active contract template — configure Settings first',
      HttpStatus.BAD_REQUEST,
    );
  }

  private async resolveActiveTemplate(
    companyId: string,
    pack: ContractPackCode | null,
    templateId: string | undefined,
    templateCode: string | undefined,
    authorization?: string,
  ): Promise<TemplateRow> {
    if (templateId) {
      const tpl = await this.findTemplateRowById(companyId, templateId, authorization);
      if (!tpl || tpl.status !== 'active') {
        return await this.rejectConsumerInventOrEmpty({
          companyId,
          field: 'template_id',
          raw: templateId,
          authorization,
        });
      }
      return tpl;
    }
    if (templateCode?.trim()) {
      const code = this.requireTemplateCode(templateCode);
      const hit = await this.findActiveTemplateByCode(companyId, code, authorization);
      if (!hit) {
        return await this.rejectConsumerInventOrEmpty({
          companyId,
          field: 'template_code',
          raw: code,
          authorization,
        });
      }
      return hit;
    }
    if (!pack) {
      throw new ApiException(
        HRM_CTR_TPL_NONE,
        'template_id, template_code, or pack_code required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const filters: string[] = [
      `status = 'active'`,
      'archived_at IS NULL',
      `pack_code = $1`,
    ];
    const values: unknown[] = [pack];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<TemplateRow>(
      `SELECT ${this.tplSelectCols}
       FROM public.hrm_contract_templates
       WHERE ${filters.join(' AND ')}
       ORDER BY updated_at DESC LIMIT 1;`,
      values,
    );
    if (!res.rows[0]) {
      const filters2: string[] = [`status = 'active'`, 'archived_at IS NULL'];
      const values2: unknown[] = [];
      pushCompanyIdFilter(filters2, values2, expandedCompanyIds);
      const any = await this.db.query<TemplateRow>(
        `SELECT ${this.tplSelectCols}
         FROM public.hrm_contract_templates
         WHERE ${filters2.join(' AND ')}
         ORDER BY updated_at DESC LIMIT 1;`,
        values2,
      );
      if (!any.rows[0]) {
        throw new ApiException(
          HRM_CTR_TPL_NONE,
          'No active contract template — configure Settings first',
          HttpStatus.BAD_REQUEST,
        );
      }
      return any.rows[0];
    }
    return res.rows[0];
  }

  private async resolveClausesForPack(
    companyId: string,
    pack: ContractPackCode,
    templateId: string,
    authorization?: string,
  ): Promise<ClauseRow[]> {
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId);
    const attached = await this.loadTemplateClausesOrdered(templateId, expandedCompanyIds);
    if (attached.length) {
      return attached.filter(
        (c) => c.status === 'active' && this.clauseAppliesToPack(c, pack),
      );
    }
    // Fallback: all active clauses matching pack
    const list = await this.listClauses(
      { company_id: companyId, status: 'active', pack_code: pack },
      authorization,
    );
    return list.data as ClauseRow[];
  }

  private buildMergedFields(
    contract: ContractPrintRow,
    overrides?: Record<string, unknown>,
    template?: TemplateRow,
  ): Record<string, unknown> {
    const ov = { ...(overrides ?? {}) };
    // Alias driver_license_class → license_class (ONE physical col)
    if (ov.driver_license_class !== undefined && ov.license_class === undefined) {
      ov.license_class = ov.driver_license_class;
    }
    const licenseClass = String(
      ov.license_class ?? contract.license_class ?? '',
    ).trim() || null;
    const licNum = String(
      ov.driver_license_number ?? contract.driver_license_number ?? '',
    ).trim() || null;
    const licOn = String(
      ov.driver_license_issued_on ?? contract.driver_license_issued_on ?? '',
    ).trim() || null;
    const licPlace = String(
      ov.driver_license_issued_place ?? contract.driver_license_issued_place ?? '',
    ).trim() || null;

    const termType =
      String(ov.term_type ?? contract.term_type ?? template?.default_term_type ?? '').trim() ||
      null;
    const titlePrint = template?.title_print_vi ?? null;

    const base: Record<string, unknown> = {
      employee_full_name: contract.employee_name,
      employee_code: contract.employee_code,
      employee_dob: contract.employee_dob,
      employee_gender: contract.employee_gender,
      employee_id_number: contract.employee_id_number,
      employee_phone: contract.employee_phone,
      employee_email: contract.employee_email,
      employee_residence_address: contract.employee_address,
      job_title: contract.position,
      position_key: contract.position_key,
      job_description_text: contract.job_description_text,
      work_location: contract.work_location,
      work_location_scope: contract.work_location_scope,
      effective_from: ov.start_date ?? ov.effective_from ?? contract.start_date,
      effective_to: ov.end_date ?? ov.effective_to ?? contract.end_date,
      term_type: termType,
      term_type_label_vi: termTypeLabelVi(termType),
      probation_days: contract.probation_days,
      probation_end: contract.probation_end,
      license_class: licenseClass,
      driver_license_class: licenseClass,
      driver_license_number: licNum,
      driver_license_issued_on: licOn,
      driver_license_issued_place: licPlace,
      vehicle_plate: String(ov.vehicle_plate ?? contract.vehicle_plate ?? '').trim() || null,
      route_or_region: contract.route_or_region,
      contract_code: ov.contract_code ?? contract.contract_code,
      contract_number: ov.contract_code ?? contract.contract_code,
      contract_type: contract.contract_type,
      contract_title_print: titlePrint,
      employer_unit_label: ov.employer_unit_label ?? null,
      employer_signatory_name: contract.signer_name,
      employer_signatory_title: contract.signer_position,
      department: contract.department,
      template_code: template?.code ?? contract.template_code ?? null,
    };
    return { ...base, ...ov, license_class: licenseClass, driver_license_class: licenseClass };
  }

  private validatePreview(
    pack: ContractPackCode,
    contract: ContractPrintRow,
    merged: Record<string, unknown>,
    termType: string | null,
  ): {
    missing_fields: Array<{ field: string; message: string }>;
    missing_clauses: Array<{ code: string; title_vi: string }>;
    driver_error: boolean;
    term_error: boolean;
  } {
    const missing_fields: Array<{ field: string; message: string }> = [];
    const requireField = (field: string, label: string) => {
      const v = merged[field];
      if (v === null || v === undefined || String(v).trim() === '') {
        missing_fields.push({ field, message: `${label} is required` });
      }
    };
    requireField('employee_full_name', 'Employee name');
    requireField('effective_from', 'Effective from');
    requireField('job_title', 'Job title');
    requireField('work_location', 'Work location');

    let term_error = false;
    const term = (termType ?? '').toLowerCase();
    if (term === 'probation' || term === 'definite') {
      if (!String(merged.effective_from ?? '').trim() || !String(merged.effective_to ?? '').trim()) {
        missing_fields.push({
          field: 'end_date',
          message: 'probation/definite term requires start_date and end_date',
        });
        term_error = true;
      }
    } else if (term === 'indefinite') {
      if (!String(merged.effective_from ?? '').trim()) {
        missing_fields.push({ field: 'start_date', message: 'indefinite term requires start_date' });
        term_error = true;
      }
      // do NOT require end_date for indefinite (VAL-XEVN-04)
    }

    let driver_error = false;
    if (pack === 'DRIVER') {
      const driverKeys: Array<{ field: string; label: string }> = [
        { field: 'driver_license_number', label: 'GPLX số' },
        { field: 'driver_license_class', label: 'GPLX hạng' },
        { field: 'driver_license_issued_on', label: 'GPLX ngày cấp' },
        { field: 'driver_license_issued_place', label: 'GPLX nơi cấp' },
        { field: 'vehicle_plate', label: 'Biển số' },
      ];
      for (const k of driverKeys) {
        const v =
          k.field === 'driver_license_class'
            ? merged.driver_license_class ?? merged.license_class
            : merged[k.field];
        if (v === null || v === undefined || String(v).trim() === '') {
          missing_fields.push({ field: k.field, message: `DRIVER pack requires ${k.label}` });
          driver_error = true;
        }
      }
    }

    return { missing_fields, missing_clauses: [], driver_error, term_error };
  }

  private async mandatoryGate(
    companyId: string,
    pack: ContractPackCode,
    resolved: ClauseRow[],
    authorization?: string,
  ): Promise<Array<{ code: string; title_vi: string }>> {
    const all = await this.listClauses(
      { company_id: companyId, status: 'active', pack_code: pack },
      authorization,
    );
    const resolvedCodes = new Set(resolved.map((c) => String(c.code).toLowerCase()));
    const missing: Array<{ code: string; title_vi: string }> = [];
    for (const c of all.data) {
      if (c.mandatory && this.clauseAppliesToPack(c as ClauseRow, pack)) {
        if (!resolvedCodes.has(String(c.code).toLowerCase())) {
          missing.push({ code: c.code as string, title_vi: c.title_vi as string });
        }
      }
    }
    return missing;
  }

  async previewContract(
    contractId: string,
    payload: ContractPreviewDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<PreviewResult> {
    await this.ensureSchema();
    const contract = await this.loadContractForPrint(
      contractId,
      requestedCompanyId,
      authorization,
      scopeContext,
    );
    const template = await this.resolveActiveTemplate(
      contract.company_id,
      payload.pack_code ? this.requirePack(payload.pack_code) : null,
      payload.template_id,
      payload.template_code ?? contract.template_code ?? undefined,
      authorization,
    );
    const pack = this.requirePack(template.pack_code);
    if (payload.pack_code) {
      const requestedPack = this.requirePack(payload.pack_code);
      if (requestedPack !== pack) {
        throw new ApiException(
          HRM_CTR_TPL_PACK_MISMATCH,
          `pack_code ${requestedPack} mismatches template pack ${pack}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const clauseRows = payload.clause_ids?.length
      ? await this.resolveClausesByOrderedIds(
          contract.company_id,
          pack,
          payload.clause_ids,
          authorization,
        )
      : contract.print_overlay_clause_ids?.length
        ? await this.resolveClausesByOrderedIds(
            contract.company_id,
            pack,
            contract.print_overlay_clause_ids,
            authorization,
          )
        : await this.resolveClausesForPack(
            contract.company_id,
            pack,
            template.id,
            authorization,
          );
    const baseMerged = this.buildMergedFields(contract, payload.field_overrides, template);
    // F-CORE-CTR-PREV deepen: shared §5.2 resolve (registry wins; empty → keyword_map)
    let registry: Array<{ tokenKey: string; sourcePath: string; ring: string }> = [];
    if (this.mergeTokens) {
      try {
        registry = await this.mergeTokens.loadActiveRegistry(
          contract.company_id,
          authorization,
          scopeContext,
        );
      } catch {
        registry = [];
      }
    }
    let resolvedPreview;
    try {
      resolvedPreview = resolveMergeTokens({
        registry,
        keywordMap: this.parseJsonObject(template.keyword_map),
        valueBag: baseMerged,
        fieldOverrides: payload.field_overrides,
        canViewCb: payload.can_view_cb !== false,
        strict: false,
      });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === HRM_PLT_SCHEMA_INVALID) {
        throw new ApiException(
          HRM_PLT_SCHEMA_INVALID,
          e.message ?? 'Invalid merge token schema',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw err;
    }
    const merged: Record<string, unknown> = {
      ...baseMerged,
      ...resolvedPreview.mergedPreview,
    };
    const termType =
      String(merged.term_type ?? template.default_term_type ?? contract.term_type ?? '').trim() ||
      null;

    // Duration hints when dates empty (preview only — user-editable)
    if (!String(merged.effective_to ?? '').trim() && termType === 'probation') {
      const days = template.default_duration_days ?? 60;
      const start = String(merged.effective_from ?? '').slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(start)) {
        const d = new Date(`${start}T00:00:00`);
        d.setDate(d.getDate() + days);
        merged.effective_to = d.toISOString().slice(0, 10);
        merged.duration_hint_applied = `+${days}d`;
      }
    } else if (
      !String(merged.effective_to ?? '').trim() &&
      termType === 'definite' &&
      template.default_duration_months
    ) {
      const months = template.default_duration_months;
      const start = String(merged.effective_from ?? '').slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(start)) {
        const d = new Date(`${start}T00:00:00`);
        d.setMonth(d.getMonth() + months);
        merged.effective_to = d.toISOString().slice(0, 10);
        merged.duration_hint_applied = `+${months}m`;
      }
    }

    const validation = this.validatePreview(pack, contract, merged, termType);
    const missing_clauses = await this.mandatoryGate(
      contract.company_id,
      pack,
      clauseRows,
      authorization,
    );
    validation.missing_clauses.push(...missing_clauses);

    const { number_pattern_hint, contract_number_suggested } = await this.buildNumberHints(
      contract.company_id,
      template.code,
      authorization,
    );
    merged.contract_number_suggested = contract_number_suggested;
    if (number_pattern_hint) merged.number_pattern_hint = number_pattern_hint;

    const canViewCb = payload.can_view_cb !== false;
    let compensation_snapshot: Record<string, unknown> | null = null;
    let cb_masked = !canViewCb;
    if (canViewCb && contract.compensation_package_id) {
      try {
        const pkg = await this.db.query<{ id: string; payload: unknown }>(
          `SELECT id, to_jsonb(p.*) AS payload
           FROM public.employee_compensation_packages p WHERE id = $1::uuid LIMIT 1;`,
          [contract.compensation_package_id],
        );
        if (pkg.rows[0]) {
          const payloadObj = this.parseJsonObject(pkg.rows[0].payload);
          const base =
            payloadObj.base_salary ??
            payloadObj.base_salary_amount ??
            (this.parseJsonObject(payloadObj.meta).base_salary as unknown) ??
            null;
          compensation_snapshot = {
            package_id: pkg.rows[0].id,
            base_salary_amount: base,
          };
          merged.base_salary_amount = base;
          cb_masked = false;
        }
      } catch {
        /* optional */
      }
    } else if (!canViewCb) {
      merged.base_salary_amount = '***';
      cb_masked = true;
    }

    const clauses: ClauseSnapshotItem[] = clauseRows.map((c, i) => ({
      code: c.code,
      title_vi: c.title_vi,
      body_vi: c.body_vi,
      clause_group: c.clause_group,
      clause_version: c.version,
      sort_order: c.sort_order ?? i,
      mandatory: Boolean(c.mandatory),
    }));

    const byGroup = new Map<string, ClauseSnapshotItem[]>();
    for (const c of clauses) {
      const list = byGroup.get(c.clause_group) ?? [];
      list.push(c);
      byGroup.set(c.clause_group, list);
    }
    const sections = [...byGroup.entries()].map(([clause_group, groupClauses]) => ({
      clause_group,
      clauses: groupClauses,
    }));

    const can_issue =
      validation.missing_fields.length === 0 && validation.missing_clauses.length === 0;

    return {
      pack_code: pack,
      template_id: template.id,
      template_code: template.code,
      template_version: template.version,
      title_print_vi: template.title_print_vi ?? null,
      term_type: termType,
      default_duration_days: template.default_duration_days ?? null,
      default_duration_months: template.default_duration_months ?? null,
      number_pattern_hint,
      contract_number_suggested,
      show_driver_license_block: pack === 'DRIVER',
      sections,
      merged_fields: merged,
      clauses,
      missing_fields: validation.missing_fields,
      missing_clauses: validation.missing_clauses,
      can_issue,
      cb_masked,
      compensation_snapshot,
    };
  }

  private async buildNumberHints(
    companyId: string,
    templateCode: string,
    authorization?: string,
  ): Promise<{ number_pattern_hint: string | null; contract_number_suggested: string | null }> {
    const suffixRow = await this.readCompanySetting(
      companyId,
      CONTRACT_SETTING_ORG_SUFFIX,
      authorization,
    );
    const patternRow = await this.readCompanySetting(
      companyId,
      CONTRACT_SETTING_NUMBER_PATTERN,
      authorization,
    );
    const suffix =
      typeof suffixRow?.value?.suffix === 'string' ? String(suffixRow.value.suffix).trim() : '';
    const pattern =
      typeof patternRow?.value?.pattern === 'string' && patternRow.value.pattern.trim()
        ? String(patternRow.value.pattern).trim()
        : CONTRACT_NUMBER_PATTERN_DEFAULT;
    const docKind = docKindFromTemplateCode(templateCode);
    const yyyy = String(new Date().getFullYear());
    const hint = pattern
      .replace('{docKind}', docKind)
      .replace('{orgSuffix}', suffix || '{orgSuffix}')
      .replace('{yyyy}', yyyy)
      .replace('{seq}', '{seq}');
    const suggested = suffix
      ? pattern
          .replace('{docKind}', docKind)
          .replace('{orgSuffix}', suffix)
          .replace('{yyyy}', yyyy)
          .replace('{seq}', '001')
      : null;
    return { number_pattern_hint: hint, contract_number_suggested: suggested };
  }

  async createPrintVersion(
    contractId: string,
    payload: CreatePrintVersionDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    issuedBy?: string,
  ) {
    await this.ensureSchema();
    const preview = await this.previewContract(
      contractId,
      payload,
      requestedCompanyId,
      authorization,
      scopeContext,
    );
    if (!preview.can_issue) {
      const driverMissing = preview.missing_fields.some((f) =>
        f.field.startsWith('driver_') || f.field === 'vehicle_plate',
      );
      const termMissing = preview.missing_fields.some(
        (f) => f.field === 'end_date' || f.field === 'start_date',
      );
      if (driverMissing && preview.pack_code === 'DRIVER') {
        throw new ApiException(
          HRM_CTR_DRIVER_REQUIRED,
          'DRIVER pack requires GPLX quartet and vehicle_plate',
          HttpStatus.BAD_REQUEST,
          { missing_fields: preview.missing_fields },
        );
      }
      if (termMissing) {
        throw new ApiException(
          HRM_CTR_TERM_INVALID,
          'Term dates invalid for selected template term_type',
          HttpStatus.BAD_REQUEST,
          { missing_fields: preview.missing_fields },
        );
      }
      throw new ApiException(
        HRM_CTR_ISSUE_BLOCKED,
        'Cannot issue print version — missing mandatory fields or clauses',
        HttpStatus.BAD_REQUEST,
        {
          missing_fields: preview.missing_fields,
          missing_clauses: preview.missing_clauses,
        },
      );
    }

    const contract = await this.loadContractForPrint(
      contractId,
      requestedCompanyId,
      authorization,
      scopeContext,
    );
    const templateCode = preview.template_code;
    const mergedWithMeta = {
      ...preview.merged_fields,
      _meta: {
        ...(this.parseJsonObject(preview.merged_fields._meta) as Record<string, unknown>),
        template_code: templateCode,
      },
    };

    await this.db.query(
      `UPDATE public.hrm_contract_print_versions
       SET status = 'superseded', updated_at = NOW()
       WHERE contract_id = $1::uuid AND status = 'issued' AND archived_at IS NULL;`,
      [contractId],
    );

    const verRes = await this.db.query<{ max: string | null }>(
      `SELECT MAX(version_no)::text AS max FROM public.hrm_contract_print_versions WHERE contract_id = $1::uuid;`,
      [contractId],
    );
    const versionNo = Number(verRes.rows[0]?.max ?? 0) + 1;
    const id = randomUUID();
    const res = await this.db.query<PrintVersionRow>(
      `INSERT INTO public.hrm_contract_print_versions
        (id, contract_id, company_id, version_no, pack_code, template_id, template_code, template_version,
         merged_fields_json, clauses_snapshot_json, compensation_snapshot_json, status, issued_at, issued_by)
       VALUES ($1, $2::uuid, $3, $4, $5, $6::uuid, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, 'issued', NOW(), $12)
       RETURNING id, contract_id, company_id, version_no, pack_code, template_id, template_code, template_version,
                 merged_fields_json, clauses_snapshot_json, compensation_snapshot_json, status,
                 issued_at, issued_by, pdf_artifact_ref, created_at, updated_at;`,
      [
        id,
        contractId,
        contract.company_id,
        versionNo,
        preview.pack_code,
        preview.template_id,
        templateCode,
        preview.template_version,
        JSON.stringify(mergedWithMeta),
        JSON.stringify(preview.clauses),
        preview.compensation_snapshot ? JSON.stringify(preview.compensation_snapshot) : null,
        issuedBy ?? null,
      ],
    );

    await this.db.query(
      `UPDATE public.employee_contracts
       SET pack_code = $1, template_id = $2::uuid, template_code = $3, updated_at = NOW()
       WHERE id = $4::uuid;`,
      [preview.pack_code, preview.template_id, templateCode, contractId],
    );

    return this.displayPrintVersion(res.rows[0], payload.can_view_cb !== false);
  }

  private displayPrintVersion(row: PrintVersionRow, canViewCb: boolean) {
    const merged = this.parseJsonObject(row.merged_fields_json);
    const colCode = row.template_code ?? null;
    const metaCode =
      typeof this.parseJsonObject(merged._meta).template_code === 'string'
        ? String(this.parseJsonObject(merged._meta).template_code)
        : null;
    // Column wins if diverge
    const template_code = colCode ?? metaCode;
    let compensation = row.compensation_snapshot_json;
    if (!canViewCb) {
      if (merged.base_salary_amount !== undefined) merged.base_salary_amount = '***';
      compensation = compensation ? { masked: true } : null;
    }
    let clauses = row.clauses_snapshot_json;
    if (typeof clauses === 'string') {
      try {
        clauses = JSON.parse(clauses);
      } catch {
        clauses = [];
      }
    }
    return {
      ...row,
      template_code,
      merged_fields_json: merged,
      clauses_snapshot_json: clauses,
      compensation_snapshot_json: compensation,
    };
  }

  async listPrintVersions(
    contractId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    canViewCb = true,
  ) {
    await this.ensureSchema();
    await this.loadContractForPrint(contractId, requestedCompanyId, authorization, scopeContext);
    const { expandedCompanyIds } = this.resolveScope(authorization, requestedCompanyId, scopeContext);
    const filters: string[] = ['contract_id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [contractId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<PrintVersionRow>(
      `SELECT id, contract_id, company_id, version_no, pack_code, template_id, template_code, template_version,
              merged_fields_json, clauses_snapshot_json, compensation_snapshot_json, status,
              issued_at, issued_by, pdf_artifact_ref, created_at, updated_at
       FROM public.hrm_contract_print_versions
       WHERE ${filters.join(' AND ')}
       ORDER BY version_no DESC;`,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((r) => this.displayPrintVersion(r, canViewCb)),
    };
  }

  async getPrintVersionById(
    versionId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    canViewCb = true,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const filters: string[] = ['id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [versionId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<PrintVersionRow>(
      `SELECT id, contract_id, company_id, version_no, pack_code, template_id, template_code, template_version,
              merged_fields_json, clauses_snapshot_json, compensation_snapshot_json, status,
              issued_at, issued_by, pdf_artifact_ref, created_at, updated_at
       FROM public.hrm_contract_print_versions
       WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_CTR_PV_404, 'Print version not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_CTR_PV_404,
      mismatchCode: 'HRM-CTR-409',
    });
    return this.displayPrintVersion(row, canViewCb);
  }

  /**
   * F-CORE-CTR-PDF-01 — default application/pdf (pdfkit); `?format=html` debug fallback.
   * Renders from frozen snapshot only (Q-CTR-02 binary engine).
   */
  async renderPrintVersionPdf(
    versionId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
    format: PrintPdfFormat = 'pdf',
  ): Promise<PrintPdfRenderResult> {
    const version = await this.getPrintVersionById(
      versionId,
      requestedCompanyId,
      authorization,
      scopeContext,
      true,
    );
    if (version.status !== 'issued') {
      throw new ApiException(
        HRM_CTR_VERSION_NOT_ISSUED,
        'PDF requires an issued print version',
        HttpStatus.BAD_REQUEST,
      );
    }
    const merged = version.merged_fields_json as Record<string, unknown>;
    const clauses = (version.clauses_snapshot_json as ClauseSnapshotItem[]) ?? [];
    const input = {
      contract_id: version.contract_id,
      version_no: version.version_no,
      pack_code: version.pack_code,
      merged_fields: merged,
      clauses,
    };

    if (format === 'html') {
      return {
        content_type: 'text/html; charset=utf-8',
        filename: `contract-${version.contract_id}-v${version.version_no}.html`,
        body: renderContractPrintHtmlDocument(input),
        stub: false,
        format: 'html',
      };
    }

    try {
      const body = await renderContractPrintPdfBuffer(input);
      if (!body.length || body.subarray(0, 4).toString('utf8') !== '%PDF') {
        throw new Error('PDF engine produced invalid magic bytes');
      }
      return {
        content_type: 'application/pdf',
        filename: `contract-${version.contract_id}-v${version.version_no}.pdf`,
        body,
        stub: false,
        format: 'pdf',
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF render failed';
      throw new ApiException(HRM_CTR_RENDER_FAIL, message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // --- F-CORE-CTR-CFG-01 company settings ---

  private assertSettingKey(key: string): ContractSettingKey {
    if (!(CONTRACT_SETTING_KEYS as readonly string[]).includes(key)) {
      throw new ApiException(
        'HRM-VAL-400',
        `Unknown setting_key '${key}' — allowed: ${CONTRACT_SETTING_KEYS.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return key as ContractSettingKey;
  }

  async readCompanySetting(
    companyId: string,
    key: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<{
    company_id: string;
    setting_key: string;
    value: Record<string, unknown> | null;
    updated_at: string | null;
  } | null> {
    await this.ensureSchema();
    const settingKey = this.assertSettingKey(key);
    const { expandedCompanyIds } = this.resolveScope(authorization, companyId, scopeContext);
    const filters: string[] = ['setting_key = $1', 'archived_at IS NULL'];
    const values: unknown[] = [settingKey];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<{
      company_id: string;
      setting_key: string;
      value_json: Record<string, unknown> | string;
      updated_at: string;
    }>(
      `SELECT company_id, setting_key, value_json, updated_at
       FROM public.hrm_company_settings
       WHERE ${filters.join(' AND ')}
       ORDER BY updated_at DESC LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      return {
        company_id: companyId,
        setting_key: settingKey,
        value: null,
        updated_at: null,
      };
    }
    return {
      company_id: row.company_id,
      setting_key: row.setting_key,
      value: this.parseJsonObject(row.value_json),
      updated_at: row.updated_at,
    };
  }

  async getCompanySetting(
    query: GetContractCompanySettingQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    return this.readCompanySetting(query.company_id, query.key, authorization, scopeContext);
  }

  async putCompanySetting(
    payload: PutContractCompanySettingDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const settingKey = this.assertSettingKey(payload.setting_key);
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    this.resolveScope(authorization, companyId, scopeContext);
    const existing = await this.db.query<{ id: string }>(
      `SELECT id FROM public.hrm_company_settings
       WHERE tenant_id = 'xevn' AND company_id = $1 AND setting_key = $2 AND archived_at IS NULL
       LIMIT 1;`,
      [companyId, settingKey],
    );
    if (existing.rows[0]) {
      await this.db.query(
        `UPDATE public.hrm_company_settings
         SET value_json = $1::jsonb, updated_at = NOW()
         WHERE id = $2::uuid;`,
        [JSON.stringify(payload.value ?? {}), existing.rows[0].id],
      );
    } else {
      await this.db.query(
        `INSERT INTO public.hrm_company_settings
          (id, tenant_id, company_id, setting_key, value_json)
         VALUES ($1, 'xevn', $2, $3, $4::jsonb);`,
        [randomUUID(), companyId, settingKey, JSON.stringify(payload.value ?? {})],
      );
    }
    return this.readCompanySetting(companyId, settingKey, authorization, scopeContext);
  }
}

/** Exported for jest — mandatory clause intersection. */
export function computeMissingMandatoryClauses(
  pack: string,
  library: Array<{ code: string; title_vi: string; mandatory: boolean; apply_to_packs: string[] }>,
  resolvedCodes: string[],
): Array<{ code: string; title_vi: string }> {
  const have = new Set(resolvedCodes.map((c) => c.toLowerCase()));
  const missing: Array<{ code: string; title_vi: string }> = [];
  for (const c of library) {
    if (!c.mandatory) continue;
    const packs = c.apply_to_packs ?? [];
    const applies =
      !packs.length ||
      packs.some((p) => p === '*' || p.toUpperCase() === pack.toUpperCase());
    if (!applies) continue;
    if (!have.has(c.code.toLowerCase())) {
      missing.push({ code: c.code, title_vi: c.title_vi });
    }
  }
  return missing;
}

/** Exported for jest — pack resolve algorithm. */
export function resolveContractPackFromRules(
  jobFamily: string,
  rules: Array<{ match_type: string; match_value: string | null; pack_code: string; priority: number }>,
): { suggested_pack: ContractPackCode; reason: string } {
  const family = jobFamily.trim().toUpperCase();
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);
  for (const r of sorted) {
    if (r.match_type === 'job_family' && r.match_value && family.includes(r.match_value.toUpperCase())) {
      const pack = normalizeContractPackCode(r.pack_code) ?? CONTRACT_PACK_DEFAULT;
      return { suggested_pack: pack, reason: `job_family:${r.match_value}` };
    }
  }
  const fb = sorted.find((r) => r.match_type === 'fallback');
  if (fb) {
    return {
      suggested_pack: normalizeContractPackCode(fb.pack_code) ?? CONTRACT_PACK_DEFAULT,
      reason: 'fallback_rule',
    };
  }
  return { suggested_pack: CONTRACT_PACK_DEFAULT, reason: 'hard_default_GENERAL' };
}
