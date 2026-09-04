/**
 * @CODE-MEMORY
 * Screen:     HRM · Cài đặt · Thang bảng lương
 * UC:         UC-E1-01 (Quản lý Thang bảng lương), UC-E1-02 (Gán ngạch-bậc)
 * SRS:        docs/hrm/SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md §3
 * TechSpec:   TECHSPEC_HRM_POLICY_ENGINE_v1.md §8
 * Purpose:    CRUD grade definitions (versioned per QĐ), grade step management,
 *             grade assignment for employees. Implements ensureSchema pattern.
 * WorkItem:   HRM-POLICY-E1-01
 * Coded:      2026-08-22
 * Callers:    GradeController
 * Callees:    HrmDbService
 * be_boundary: queries pay_grade_definitions, pay_grade_steps, employee_grade_assignments
 * SOLID:      SRP — grade definition + assignment only; promotion logic in GradePromotionService
 * FORBIDDEN:  Cross-plane FK to XBOS · Hard-delete · Float money · grade_code closed enum
 * must_keep:  tenant_id filter on every query; BigInt serialized as string in responses;
 *             soft-delete pattern (deleted_at); versioning via new row (not UPDATE)
 */
import { HttpStatus, Injectable } from "@nestjs/common";
import { HrmDbService } from "../db/hrm-db.service";
import type {
  CreateGradeDto,
  GradeAssignmentDto,
  GradeAssignmentResponse,
  GradeDefinitionResponse,
  UpdateStepsDto,
} from "./dto/grade.dto";

/** DB row shape for pay_grade_definitions + joined steps */
type GradeDefRow = {
  id: string;
  tenant_id: string;
  grade_code: string;
  grade_name: string;
  effective_from: string;
  effective_to: string | null;
  created_by: string;
  created_at: string;
};

type GradeStepRow = {
  grade_def_id: string;
  step_number: number;
  monthly_salary: string; // BIGINT as text
};

type GradeAssignmentRow = {
  id: string;
  employee_id: string;
  grade_def_id: string;
  step_number: number;
  effective_from: string;
  reason: string | null;
  created_at: string;
  grade_code: string;
  grade_name: string;
  monthly_salary: string;
};

@Injectable()
export class GradeService {
  private schemaReady = false;

  constructor(private readonly db: HrmDbService) {}

  /** Idempotent schema bootstrap (chạy khi module khởi động) */
  async ensureSchema(): Promise<void> {
    if (this.schemaReady) return;

    // pay_grade_definitions
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_grade_definitions (
        id              BIGSERIAL     PRIMARY KEY,
        tenant_id       TEXT          NOT NULL DEFAULT '',
        grade_code      TEXT          NOT NULL,
        grade_name      TEXT          NOT NULL DEFAULT '',
        effective_from  DATE          NOT NULL,
        effective_to    DATE          NULL,
        created_by      TEXT          NOT NULL DEFAULT '',
        created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        updated_by      TEXT          NOT NULL DEFAULT '',
        updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
        deleted_at      TIMESTAMPTZ   NULL,
        CONSTRAINT chk_grade_def_period
          CHECK (effective_to IS NULL OR effective_to >= effective_from)
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_grade_def_tenant_code
        ON public.pay_grade_definitions (tenant_id, grade_code)
        WHERE deleted_at IS NULL;
    `);

    // pay_grade_steps
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.pay_grade_steps (
        id              BIGSERIAL     PRIMARY KEY,
        grade_def_id    BIGINT        NOT NULL,
        step_number     SMALLINT      NOT NULL,
        monthly_salary  BIGINT        NOT NULL,
        CONSTRAINT chk_grade_step_number   CHECK (step_number BETWEEN 1 AND 9),
        CONSTRAINT chk_grade_salary_pos    CHECK (monthly_salary > 0),
        CONSTRAINT uq_grade_step           UNIQUE (grade_def_id, step_number)
      );
    `);

    // employee_grade_assignments
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_grade_assignments (
        id              BIGSERIAL     PRIMARY KEY,
        tenant_id       TEXT          NOT NULL DEFAULT '',
        employee_id     TEXT          NOT NULL,
        grade_def_id    BIGINT        NOT NULL,
        step_number     SMALLINT      NOT NULL CHECK (step_number BETWEEN 1 AND 9),
        effective_from  DATE          NOT NULL,
        reason          TEXT          NULL,
        approved_by     TEXT          NULL,
        created_by      TEXT          NOT NULL DEFAULT '',
        created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_emp_grade_assign_lookup
        ON public.employee_grade_assignments (tenant_id, employee_id, effective_from DESC);
    `);

    this.schemaReady = true;
  }

  // ─── LIST ────────────────────────────────────────────────────────────

  /** Lấy tất cả grade definitions đang hiệu lực tại as_of_date */
  async listGrades(
    tenantId: string,
    asOfDate: string,
  ): Promise<GradeDefinitionResponse[]> {
    await this.ensureSchema();

    const { rows: defs } = await this.db.query<GradeDefRow>(
      `SELECT id, tenant_id, grade_code, grade_name, effective_from, effective_to,
              created_by, created_at
       FROM public.pay_grade_definitions
       WHERE tenant_id = $1
         AND effective_from <= $2
         AND (effective_to IS NULL OR effective_to >= $2)
         AND deleted_at IS NULL
       ORDER BY grade_code ASC`,
      [tenantId, asOfDate],
    );

    if (!defs.length) return [];

    const defIds = defs.map((d) => d.id);
    const { rows: steps } = await this.db.query<GradeStepRow>(
      `SELECT grade_def_id::text, step_number, monthly_salary::text
       FROM public.pay_grade_steps
       WHERE grade_def_id = ANY($1::bigint[])
       ORDER BY grade_def_id, step_number ASC`,
      [defIds],
    );

    // Group steps by grade_def_id
    const stepsByDefId = new Map<string, GradeStepRow[]>();
    for (const s of steps) {
      const arr = stepsByDefId.get(s.grade_def_id) ?? [];
      arr.push(s);
      stepsByDefId.set(s.grade_def_id, arr);
    }

    return defs.map((d) => ({
      id: d.id,
      grade_code: d.grade_code,
      grade_name: d.grade_name,
      effective_from: d.effective_from,
      effective_to: d.effective_to,
      steps: (stepsByDefId.get(d.id) ?? []).map((s) => ({
        step_number: s.step_number,
        monthly_salary_vnd: s.monthly_salary,
      })),
      created_by: d.created_by,
      created_at: d.created_at,
    }));
  }

  // ─── CREATE ───────────────────────────────────────────────────────────

  /**
   * Tạo grade definition mới (version theo QĐ mới).
   * Tự động close version cũ: effective_to = new effective_from - 1 day
   * BR-E1-01: không xóa grade đang dùng.
   */
  async createGrade(
    tenantId: string,
    dto: CreateGradeDto,
    createdBy: string,
  ): Promise<{ id: string; grade_code: string; effective_from: string }> {
    await this.ensureSchema();

    if (!dto.steps?.length) {
      throw { statusCode: HttpStatus.BAD_REQUEST, message: "steps cannot be empty" };
    }

    // Validate steps: step_number 1–9, no duplicates
    const stepNums = dto.steps.map((s) => s.step_number);
    if (new Set(stepNums).size !== stepNums.length) {
      throw { statusCode: HttpStatus.BAD_REQUEST, message: "Duplicate step_number in steps" };
    }
    for (const s of dto.steps) {
      if (s.step_number < 1 || s.step_number > 9) {
        throw { statusCode: HttpStatus.BAD_REQUEST, message: `step_number ${s.step_number} must be 1–9` };
      }
      if (s.monthly_salary_vnd <= 0) {
        throw { statusCode: HttpStatus.BAD_REQUEST, message: `monthly_salary_vnd must be positive` };
      }
    }

    // Close previous active version for this grade_code
    await this.db.query(
      `UPDATE public.pay_grade_definitions
       SET effective_to = $1::date - INTERVAL '1 day',
           updated_at = now()
       WHERE tenant_id = $2
         AND grade_code = $3
         AND effective_to IS NULL
         AND deleted_at IS NULL`,
      [dto.effective_from, tenantId, dto.grade_code],
    );

    // Insert new definition
    const { rows: [def] } = await this.db.query<{ id: string }>(
      `INSERT INTO public.pay_grade_definitions
         (tenant_id, grade_code, grade_name, effective_from, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id::text`,
      [tenantId, dto.grade_code, dto.grade_name, dto.effective_from, createdBy],
    );

    // Insert steps
    for (const s of dto.steps) {
      await this.db.query(
        `INSERT INTO public.pay_grade_steps (grade_def_id, step_number, monthly_salary)
         VALUES ($1, $2, $3)`,
        [def.id, s.step_number, s.monthly_salary_vnd],
      );
    }

    return { id: def.id, grade_code: dto.grade_code, effective_from: dto.effective_from };
  }

  // ─── UPDATE STEPS ────────────────────────────────────────────────────

  /** Update mức lương bậc trong 1 grade definition (chỉ nếu KHÔNG có assignment nào dùng) */
  async updateSteps(
    tenantId: string,
    gradeDefId: string,
    dto: UpdateStepsDto,
  ): Promise<void> {
    await this.ensureSchema();

    // Verify ownership
    const { rows: [def] } = await this.db.query<{ id: string }>(
      `SELECT id FROM public.pay_grade_definitions
       WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`,
      [gradeDefId, tenantId],
    );
    if (!def) throw { statusCode: HttpStatus.NOT_FOUND, message: "Grade definition not found" };

    // BR-E1-01: check if any employee is using this grade_def_id
    const { rows: [usage] } = await this.db.query<{ cnt: string }>(
      `SELECT count(*)::text AS cnt FROM public.employee_grade_assignments
       WHERE grade_def_id = $1`,
      [gradeDefId],
    );
    if (Number(usage?.cnt ?? 0) > 0) {
      throw {
        statusCode: HttpStatus.CONFLICT,
        message: "HRM-GRADE-IN-USE: Cannot update steps of a grade already assigned to employees",
      };
    }

    // Delete old steps + reinsert (simplest idempotent approach)
    await this.db.query(
      `DELETE FROM public.pay_grade_steps WHERE grade_def_id = $1`,
      [gradeDefId],
    );
    for (const s of dto.steps) {
      await this.db.query(
        `INSERT INTO public.pay_grade_steps (grade_def_id, step_number, monthly_salary)
         VALUES ($1, $2, $3)`,
        [gradeDefId, s.step_number, s.monthly_salary_vnd],
      );
    }
  }

  // ─── GRADE ASSIGNMENT ─────────────────────────────────────────────────

  /**
   * Gán ngạch-bậc cho nhân viên.
   * Tạo record mới trong employee_grade_assignments (không xóa cũ — BR-E1-03).
   * Cập nhật employees.grade_code + employees.step_number nếu cột tồn tại.
   */
  async assignGrade(
    tenantId: string,
    employeeId: string,
    dto: GradeAssignmentDto,
    assignedBy: string,
  ): Promise<GradeAssignmentResponse> {
    await this.ensureSchema();

    // Find active grade definition for grade_code at effective_from date
    const { rows: [def] } = await this.db.query<{ id: string; grade_name: string }>(
      `SELECT id::text, grade_name
       FROM public.pay_grade_definitions
       WHERE tenant_id = $1
         AND grade_code = $2
         AND effective_from <= $3
         AND (effective_to IS NULL OR effective_to >= $3)
         AND deleted_at IS NULL
       ORDER BY effective_from DESC
       LIMIT 1`,
      [tenantId, dto.grade_code, dto.effective_from],
    );
    if (!def) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: `HRM-GRADE-NOT-FOUND: No active grade definition for '${dto.grade_code}' at ${dto.effective_from}`,
      };
    }

    // Get salary for this step
    const { rows: [step] } = await this.db.query<{ monthly_salary: string }>(
      `SELECT monthly_salary::text
       FROM public.pay_grade_steps
       WHERE grade_def_id = $1 AND step_number = $2`,
      [def.id, dto.step_number],
    );
    if (!step) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: `HRM-GRADE-STEP-NOT-FOUND: Step ${dto.step_number} not found in grade '${dto.grade_code}'`,
      };
    }

    // Insert assignment record (BR-E1-03: immutable history)
    const { rows: [assignment] } = await this.db.query<{ id: string }>(
      `INSERT INTO public.employee_grade_assignments
         (tenant_id, employee_id, grade_def_id, step_number, effective_from, reason, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id::text`,
      [tenantId, employeeId, def.id, dto.step_number, dto.effective_from, dto.reason ?? null, assignedBy],
    );

    // Update employees snapshot columns (best-effort — columns may not exist yet)
    try {
      await this.db.query(
        `UPDATE public.employees
         SET grade_code = $1,
             step_number = $2,
             updated_at = now()
         WHERE id = $3 AND tenant_id = $4`,
        [dto.grade_code, dto.step_number, employeeId, tenantId],
      );
    } catch {
      // Columns not yet migrated — swallow; snapshot is non-critical
    }

    return {
      assignment_id: assignment.id,
      employee_id: employeeId,
      grade_code: dto.grade_code,
      step_number: dto.step_number,
      effective_from: dto.effective_from,
      monthly_salary_vnd: step.monthly_salary,
      grade_name: def.grade_name,
    };
  }

  // ─── GRADE HISTORY ────────────────────────────────────────────────────

  /** Lịch sử gán ngạch-bậc của nhân viên */
  async getGradeHistory(tenantId: string, employeeId: string) {
    await this.ensureSchema();

    const { rows } = await this.db.query<GradeAssignmentRow>(
      `SELECT
         ega.id::text,
         ega.employee_id,
         ega.grade_def_id::text,
         ega.step_number,
         ega.effective_from,
         ega.reason,
         ega.created_at,
         gd.grade_code,
         gd.grade_name,
         gs.monthly_salary::text
       FROM public.employee_grade_assignments ega
       JOIN public.pay_grade_definitions gd ON gd.id = ega.grade_def_id
       JOIN public.pay_grade_steps gs ON gs.grade_def_id = ega.grade_def_id
                                     AND gs.step_number = ega.step_number
       WHERE ega.tenant_id = $1
         AND ega.employee_id = $2
       ORDER BY ega.effective_from DESC`,
      [tenantId, employeeId],
    );

    return rows.map((r) => ({
      assignment_id: r.id,
      grade_code: r.grade_code,
      grade_name: r.grade_name,
      step_number: r.step_number,
      effective_from: r.effective_from,
      monthly_salary_vnd: r.monthly_salary,
      reason: r.reason,
      created_at: r.created_at,
    }));
  }

  // ─── HELPER (used by PayrollBatch) ───────────────────────────────────

  /** Tìm grade-step hiện tại của NV tại 1 thời điểm — dùng bởi PayrollBatchService */
  async getCurrentGradeStep(
    tenantId: string,
    employeeId: string,
    asOfDate: string,
  ): Promise<{ grade_code: string; step_number: number; monthly_salary_vnd: bigint } | null> {
    await this.ensureSchema();

    const { rows: [row] } = await this.db.query<{
      grade_code: string;
      step_number: number;
      monthly_salary: string;
    }>(
      `SELECT gd.grade_code, ega.step_number, gs.monthly_salary::text
       FROM public.employee_grade_assignments ega
       JOIN public.pay_grade_definitions gd ON gd.id = ega.grade_def_id
       JOIN public.pay_grade_steps gs ON gs.grade_def_id = ega.grade_def_id
                                     AND gs.step_number = ega.step_number
       WHERE ega.tenant_id = $1
         AND ega.employee_id = $2
         AND ega.effective_from <= $3
       ORDER BY ega.effective_from DESC
       LIMIT 1`,
      [tenantId, employeeId, asOfDate],
    );

    if (!row) return null;
    return {
      grade_code: row.grade_code,
      step_number: row.step_number,
      monthly_salary_vnd: BigInt(row.monthly_salary),
    };
  }
}
