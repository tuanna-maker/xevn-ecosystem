/**
 * @CODE-MEMORY WorkItem: BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01
 * Plane A/B: HRM DB only. No cross-plane FK. tenant_id = TEXT DEFAULT.
 * Soft-delete only (deleted_at). Hard-delete forbidden.
 * HrmDbService: only query/queryOne/execute/withTransaction.
 * Spec: docs/program/specs/BA-CTR-TPL-8-CLAUSE-MAP-01-S7-IMPL-01.md §1-§2
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import {
  ClauseOverrideRow,
  UpsertClauseOverrideDto,
  VALID_CLAUSE_SOURCES,
} from './dto/clause-override.dto';

/**
 * 6 bound template codes — config-driven via this constant.
 * To re-enable TV/probation codes, add them here (no other code change needed).
 */
export const BOUND_TEMPLATE_CODES: string[] = [
  'XEVN_FT_12M_OFFICE',
  'XEVN_FT_24M_OFFICE',
  'XEVN_INDEF_OFFICE',
  'XEVN_FT_12M_DRIVER',
  'XEVN_FT_24M_DRIVER',
  'XEVN_INDEF_DRIVER',
];

/** Fixed-term template codes that require insurance_salary_vnd per BLLĐ 2019. */
const FT_TEMPLATE_CODES = new Set(
  BOUND_TEMPLATE_CODES.filter((c) => c.includes('_FT_')),
);

function assertBoundCode(templateCode: string): void {
  if (!BOUND_TEMPLATE_CODES.includes(templateCode)) {
    throw new ApiException(
      'HRM-VAL-001',
      `template_code '${templateCode}' is not a bound template code. Valid: ${BOUND_TEMPLATE_CODES.join(', ')}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertClauseIdFormat(clauseId: string): void {
  if (
    !clauseId ||
    (!clauseId.startsWith('CTR-CLAUSE-') && !UUID_V4_RE.test(clauseId))
  ) {
    throw new ApiException(
      'HRM-VAL-001',
      `clause_id '${clauseId}' must be a canonical clause id (CTR-CLAUSE-* or UUID v4)`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

function assertSource(source: unknown): void {
  if (!(VALID_CLAUSE_SOURCES as string[]).includes(source as string)) {
    throw new ApiException(
      'HRM-VAL-001',
      `source must be one of: ${VALID_CLAUSE_SOURCES.join(', ')}`,
      HttpStatus.BAD_REQUEST,
    );
  }
}

function buildWarnings(templateCode: string): string[] {
  if (FT_TEMPLATE_CODES.has(templateCode)) {
    return [
      'insurance_salary_vnd is required by law (BLLĐ 2019 Đ.168) for fixed-term contracts. ' +
        'Ensure the compensation pack line has insurance_salary_vnd set.',
    ];
  }
  return [];
}

const SELECT_COLS = `id, tenant_id, template_code, clause_id, override_text, source,
                     updated_by, updated_at, deleted_at, created_at`;

@Injectable()
export class ContractTemplatesService {
  constructor(private readonly db: HrmDbService) {}

  /** Returns the 6 bound codes and bind_count. Config-driven — no hardcode in logic. */
  getBoundCodes() {
    return {
      bound_codes: BOUND_TEMPLATE_CODES,
      bind_count: BOUND_TEMPLATE_CODES.length,
      dropped_codes: ['XEVN_PROBATION_OFFICE', 'XEVN_PROBATION_DRIVER'],
    };
  }

  /** List overrides for a template, excluding soft-deleted rows. */
  async listClauses(templateCode: string, tenantId: string) {
    assertBoundCode(templateCode);
    const result = await this.db.query<ClauseOverrideRow>(
      `SELECT ${SELECT_COLS}
       FROM template_clause_override
       WHERE tenant_id = $1
         AND template_code = $2
         AND deleted_at IS NULL
       ORDER BY clause_id ASC`,
      [tenantId, templateCode],
    );
    return { items: result.rows, warnings: buildWarnings(templateCode) };
  }

  /** Get single clause override. Throws HRM-NF-001 if not found. */
  async getClause(templateCode: string, clauseId: string, tenantId: string) {
    assertBoundCode(templateCode);
    assertClauseIdFormat(clauseId);
    const row = await this.db.queryOne<ClauseOverrideRow>(
      `SELECT ${SELECT_COLS}
       FROM template_clause_override
       WHERE tenant_id = $1
         AND template_code = $2
         AND clause_id = $3
         AND deleted_at IS NULL`,
      [tenantId, templateCode, clauseId],
    );
    if (!row) {
      throw new ApiException(
        'HRM-NF-001',
        `No override found for template_code '${templateCode}', clause_id '${clauseId}'`,
        HttpStatus.NOT_FOUND,
      );
    }
    return { item: row, warnings: buildWarnings(templateCode) };
  }

  /**
   * Upsert clause override (idempotent PUT).
   * ON CONFLICT (tenant_id, template_code, clause_id) -> UPDATE.
   * Restores soft-deleted row (sets deleted_at = NULL).
   * override_text empty string is a valid first-class state (manual fill).
   */
  async upsertClause(
    templateCode: string,
    clauseId: string,
    tenantId: string,
    dto: UpsertClauseOverrideDto,
  ) {
    assertBoundCode(templateCode);
    assertClauseIdFormat(clauseId);
    assertSource(dto.source);

    const id = crypto.randomUUID();
    const overrideText =
      dto.override_text !== undefined ? dto.override_text : null;
    const updatedBy = dto.updated_by ?? null;

    const row = await this.db.queryOne<ClauseOverrideRow>(
      `INSERT INTO template_clause_override
         (id, tenant_id, template_code, clause_id, override_text, source, updated_by, updated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
       ON CONFLICT (tenant_id, template_code, clause_id) DO UPDATE
         SET override_text = EXCLUDED.override_text,
             source        = EXCLUDED.source,
             updated_by    = EXCLUDED.updated_by,
             updated_at    = now(),
             deleted_at    = NULL
       RETURNING ${SELECT_COLS}`,
      [
        id,
        tenantId,
        templateCode,
        clauseId,
        overrideText,
        dto.source,
        updatedBy,
      ],
    );

    return { item: row, warnings: buildWarnings(templateCode) };
  }

  /**
   * Soft-delete clause override. Hard-delete is forbidden per platform rules.
   * Throws HRM-NF-001 if no active row found.
   */
  async softDeleteClause(
    templateCode: string,
    clauseId: string,
    tenantId: string,
  ) {
    assertBoundCode(templateCode);
    assertClauseIdFormat(clauseId);

    const row = await this.db.queryOne<ClauseOverrideRow>(
      `UPDATE template_clause_override
       SET deleted_at = now()
       WHERE tenant_id = $1
         AND template_code = $2
         AND clause_id = $3
         AND deleted_at IS NULL
       RETURNING ${SELECT_COLS}`,
      [tenantId, templateCode, clauseId],
    );
    if (!row) {
      throw new ApiException(
        'HRM-NF-001',
        `No active override found for template_code '${templateCode}', clause_id '${clauseId}'`,
        HttpStatus.NOT_FOUND,
      );
    }
    return { item: row };
  }
}
