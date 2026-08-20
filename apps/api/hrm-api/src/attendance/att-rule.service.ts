import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';

export type AttRuleRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  rule_type: string;
  formula_desc: string | null;
  apply_to: string | null;
  description: string | null;
  status: string;
  archived_at: string | null;
};

export type UpsertAttRulePayload = {
  companyId: string;
  code: string;
  nameVi: string;
  ruleType: string;
  formulaDesc?: string | null;
  applyTo?: string | null;
  description?: string | null;
  status?: string;
};

@Injectable()
export class AttRuleService {
  constructor(private readonly db: HrmDbService) {}

  async listRules(companyId: string, q?: string): Promise<AttRuleRow[]> {
    let sql = `
      SELECT * FROM public.att_rule
      WHERE company_id = $1 AND archived_at IS NULL
    `;
    const params: unknown[] = [companyId];
    if (q && q.trim()) {
      sql += ` AND (code ILIKE $2 OR name_vi ILIKE $2)`;
      params.push(`%${q.trim()}%`);
    }
    sql += ` ORDER BY code ASC`;
    const res = await this.db.query(sql, params);
    return res.rows as AttRuleRow[];
  }

  async upsertRule(
    payload: UpsertAttRulePayload,
  ): Promise<AttRuleRow> {
    const code = payload.code.trim().toUpperCase();
    if (!code) {
      throw new ApiException('HRM-RULE-400', 'Thiếu mã quy tắc', HttpStatus.BAD_REQUEST);
    }

    const name = payload.nameVi.trim();
    if (!name) {
      throw new ApiException('HRM-RULE-400', 'Thiếu tên quy tắc', HttpStatus.BAD_REQUEST);
    }

    const ruleType = payload.ruleType.trim();
    if (!ruleType) {
      throw new ApiException('HRM-RULE-400', 'Thiếu loại quy tắc', HttpStatus.BAD_REQUEST);
    }

    const existing = await this.db.query(
      `SELECT * FROM public.att_rule WHERE company_id = $1 AND code = $2`,
      [payload.companyId, code],
    );

    let row: AttRuleRow;
    if (existing && existing.rowCount && existing.rowCount > 0) {
      const res = await this.db.query(
        `
        UPDATE public.att_rule
        SET name_vi = $3,
            rule_type = $4,
            formula_desc = $5,
            apply_to = $6,
            description = $7,
            status = $8,
            updated_at = NOW(),
            archived_at = NULL
        WHERE company_id = $1 AND code = $2
        RETURNING *
        `,
        [
          payload.companyId,
          code,
          name,
          ruleType,
          payload.formulaDesc ?? null,
          payload.applyTo ?? null,
          payload.description ?? null,
          payload.status ?? 'active',
        ],
      );
      row = res.rows[0] as AttRuleRow;
    } else {
      const res = await this.db.query(
        `
        INSERT INTO public.att_rule (
          company_id, code, name_vi, rule_type, formula_desc,
          apply_to, description, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        ) RETURNING *
        `,
        [
          payload.companyId,
          code,
          name,
          ruleType,
          payload.formulaDesc ?? null,
          payload.applyTo ?? null,
          payload.description ?? null,
          payload.status ?? 'active',
        ],
      );
      row = res.rows[0] as AttRuleRow;
    }
    return row;
  }

  async retireRule(companyId: string, id: string): Promise<void> {
    const res = await this.db.query(
      `
      UPDATE public.att_rule
      SET archived_at = NOW(), status = 'retired', updated_at = NOW()
      WHERE company_id = $1 AND id = $2 AND archived_at IS NULL
      RETURNING *
      `,
      [companyId, id],
    );
    if (res.rowCount === 0) {
      throw new ApiException('HRM-RULE-404', 'Không tìm thấy quy tắc hoặc đã bị xóa', HttpStatus.NOT_FOUND);
    }
  }
}
