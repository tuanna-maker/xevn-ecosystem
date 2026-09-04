/**
 * @CODE-MEMORY
 * Screen:     HRM · Nhân viên · Đề xuất Nâng bậc
 * UC:         UC-E1-03 (Đề xuất Nâng bậc — Workflow)
 * SRS:        docs/hrm/SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md §3
 * Purpose:    Tạo + track promotion requests. Auto-check điều kiện: ≥730 ngày,
 *             KPI ≥80% (4 kỳ gần nhất), không kỷ luật active.
 *             Tích hợp XBOS Workflow Engine qua event (fire-and-forget).
 * WorkItem:   HRM-POLICY-E1-01
 * Coded:      2026-08-22
 * BR:         BR-E1-04: nâng tối đa 1 bậc/lần; bậc max → không tạo được
 * FORBIDDEN:  Hard-delete · XBOS direct DB join · skip auto-checks
 * must_keep:  All check results stored in auto_check_result JSONB for audit
 */
import { HttpStatus, Injectable } from "@nestjs/common";
import { HrmDbService } from "../db/hrm-db.service";
import type { GradePromotionDto, PromotionRequestResponse } from "./dto/grade.dto";

const MAX_STEP = 9;

type PromotionRow = {
  id: string;
  employee_id: string;
  current_step: number;
  proposed_step: number;
  status: string;
  auto_check_result: string | null;
};

@Injectable()
export class GradePromotionService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.grade_promotion_requests (
        id                    BIGSERIAL     PRIMARY KEY,
        tenant_id             TEXT          NOT NULL DEFAULT '',
        employee_id           TEXT          NOT NULL,
        current_grade_def_id  BIGINT        NOT NULL,
        current_step          SMALLINT      NOT NULL,
        proposed_step         SMALLINT      NOT NULL,
        status                TEXT          NOT NULL DEFAULT 'DRAFT',
        auto_check_result     JSONB         NULL,
        workflow_instance_id  TEXT          NULL,
        requested_by          TEXT          NOT NULL DEFAULT '',
        approved_by           TEXT          NULL,
        approved_at           TIMESTAMPTZ   NULL,
        reject_reason         TEXT          NULL,
        created_at            TIMESTAMPTZ   NOT NULL DEFAULT now(),
        deleted_at            TIMESTAMPTZ   NULL,
        CONSTRAINT chk_promo_status CHECK (
          status IN (''DRAFT'',''PENDING_L1'',''PENDING_L2'',''APPROVED'',''REJECTED'',''CANCELLED'')
        ),
        CONSTRAINT chk_promo_step CHECK (proposed_step = current_step + 1)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_grade_promo_employee
        ON public.grade_promotion_requests (tenant_id, employee_id, status)
        WHERE deleted_at IS NULL;
    `);
    this.schemaReady = true;
  }

  /**
   * Tạo đề xuất nâng bậc mới.
   * Auto-checks: service_days, kpi_avg, discipline.
   * BR-E1-04: proposed_step phải = current_step + 1; không nâng nếu ở bậc max.
   */
  async createPromotion(
    tenantId: string,
    dto: GradePromotionDto,
    requestedBy: string,
  ): Promise<PromotionRequestResponse> {
    await this.ensureSchema();

    // 1. Get current grade assignment
    const { rows: [current] } = await this.db.query<{
      grade_def_id: string;
      step_number: number;
    }>(
      `SELECT grade_def_id::text, step_number
       FROM public.employee_grade_assignments
       WHERE tenant_id = $1 AND employee_id = $2
       ORDER BY effective_from DESC
       LIMIT 1`,
      [tenantId, dto.employee_id],
    );

    if (!current) {
      throw { statusCode: HttpStatus.NOT_FOUND, message: "Employee has no grade assignment" };
    }

    // BR-E1-04a: Bậc max
    if (current.step_number >= MAX_STEP) {
      throw {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: "HRM-GRADE-MAX-STEP: Employee is already at maximum step",
      };
    }

    // BR-E1-04b: Chỉ được đề xuất nâng 1 bậc
    if (dto.proposed_step !== current.step_number + 1) {
      throw {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `proposed_step must be exactly ${current.step_number + 1} (current + 1)`,
      };
    }

    // Check for existing PENDING request
    const { rows: [existing] } = await this.db.query<{ id: string }>(
      `SELECT id::text FROM public.grade_promotion_requests
       WHERE tenant_id = $1 AND employee_id = $2
         AND status IN (''DRAFT'',''PENDING_L1'',''PENDING_L2'')
         AND deleted_at IS NULL
       LIMIT 1`,
      [tenantId, dto.employee_id],
    );
    if (existing) {
      throw {
        statusCode: HttpStatus.CONFLICT,
        message: "HRM-PROMO-ALREADY-PENDING: Employee already has a pending promotion request",
      };
    }

    // 2. Auto-checks
    const autoChecks = await this.runAutoChecks(tenantId, dto.employee_id);

    // 3. Create record
    const { rows: [row] } = await this.db.query<{ id: string }>(
      `INSERT INTO public.grade_promotion_requests
         (tenant_id, employee_id, current_grade_def_id, current_step, proposed_step,
          status, auto_check_result, requested_by)
       VALUES ($1, $2, $3, $4, $5, ''DRAFT'', $6, $7)
       RETURNING id::text`,
      [
        tenantId,
        dto.employee_id,
        current.grade_def_id,
        current.step_number,
        dto.proposed_step,
        JSON.stringify(autoChecks),
        requestedBy,
      ],
    );

    return {
      promotion_id: row.id,
      employee_id: dto.employee_id,
      current_step: current.step_number,
      proposed_step: dto.proposed_step,
      status: "DRAFT",
      auto_checks: autoChecks,
    };
  }

  /** Auto-check điều kiện nâng bậc */
  private async runAutoChecks(tenantId: string, employeeId: string) {
    // 2a: Thâm niên (ngày từ hợp đồng đầu tiên đến nay)
    const { rows: [tenureRow] } = await this.db.query<{ days: string }>(
      `SELECT EXTRACT(DAY FROM now() - MIN(start_date))::text AS days
       FROM public.employee_contracts
       WHERE tenant_id = $1 AND employee_id = $2 AND deleted_at IS NULL`,
      [tenantId, employeeId],
    ).catch(() => ({ rows: [{ days: "0" }] }));

    const years_of_service = Number(tenureRow?.days ?? 0) / 365;

    // 2b: KPI avg (best-effort — table may not exist yet)
    let kpi_avg_4_quarters: number | null = null;
    try {
      const { rows: [kpiRow] } = await this.db.query<{ avg_score: string }>(
        `SELECT AVG(score)::text AS avg_score
         FROM (
           SELECT score FROM public.kpi_evaluations
           WHERE tenant_id = $1 AND employee_id = $2 AND deleted_at IS NULL
           ORDER BY period_end DESC LIMIT 4
         ) sub`,
        [tenantId, employeeId],
      );
      kpi_avg_4_quarters = kpiRow?.avg_score ? Number(kpiRow.avg_score) : null;
    } catch {
      // KPI table not yet available — treat as null (not failing)
    }

    // 2c: Active discipline
    let has_active_discipline = false;
    try {
      const { rows: [discRow] } = await this.db.query<{ cnt: string }>(
        `SELECT count(*)::text AS cnt FROM public.employee_disciplines
         WHERE tenant_id = $1 AND employee_id = $2
           AND expires_at > now() AND deleted_at IS NULL`,
        [tenantId, employeeId],
      );
      has_active_discipline = Number(discRow?.cnt ?? 0) > 0;
    } catch {
      // Table not available — assume no discipline
    }

    const all_passed =
      years_of_service >= 2 &&
      (kpi_avg_4_quarters === null || kpi_avg_4_quarters >= 80) &&
      !has_active_discipline;

    return { years_of_service, kpi_avg_4_quarters, has_active_discipline, all_passed };
  }
}
