/**
 * @CODE-MEMORY
 * Screen:     HRM · Bảng lương · Batch Chạy lương
 * UC:         UC-E4-01..04
 * TechSpec:   TECHSPEC_HRM_POLICY_ENGINE_v1.md §5 Batch Engine
 * Purpose:    Orchestrate 3-phase payroll batch calculation:
 *   Phase 1: Per-employee individual components (non-pool)
 *   Phase 2: Pool distribution (zero_sum_pool, kpi_pool_share)
 *   Phase 3: Net = Gross - Deductions (insurance, PIT, penalty)
 * WorkItem:   HRM-POLICY-E4-01
 * Coded:      2026-08-22
 * SOLID:      SRP — orchestration only; each calc in its Calculator class
 * FORBIDDEN:  Float money · skip tenant filter · hard-delete batch records
 * must_keep:  Batch status: PENDING→RUNNING→COMPLETED→APPROVED→LOCKED
 *             Payroll record = BIGINT for all money columns
 *             Pool phase runs AFTER Phase 1 completes
 */
import { Injectable } from "@nestjs/common";
import { HrmDbService } from "../db/hrm-db.service";
import { GradeService } from "../grade/grade.service";
import { InputService } from "../input/input.service";
import type {
  AttendanceSummary,
  CalcContext,
  ComponentResult,
  EmployeeSnapshot,
  GradeStepSnapshot,
  InputDataBag,
} from "../policy/calculators/calculator.interface";
import { getCalculator } from "../policy/calculators/calculator.registry";
import { PolicyService } from "../policy/policy.service";
import { PoolCalculationService } from "./pool-calculation.service";

const POOL_COMPONENT_TYPES = new Set(["zero_sum_pool", "kpi_pool_share"]);

type BatchEmployeeRow = {
  employee_id: string;
  full_name: string;
  pay_group_code: string;
  province_code: string | null;
  is_probation: boolean;
  contract_salary: string | null;
};

@Injectable()
export class PayrollBatchService {
  constructor(
    private readonly db: HrmDbService,
    private readonly gradeSvc: GradeService,
    private readonly inputSvc: InputService,
    private readonly policySvc: PolicyService,
    private readonly poolSvc: PoolCalculationService,
  ) {}

  // ─── RUN BATCH ──────────────────────────────────────────────────────────

  async runBatch(
    tenantId: string,
    periodMonthStr: string,
    runBy: string,
  ): Promise<{ batch_id: string; employee_count: number; warnings: string[] }> {

    const periodMonth = `${periodMonthStr}-01`;

    // Create batch record
    const { rows: [batchRow] } = await this.db.query<{ id: string }>(
      `INSERT INTO public.payroll_batches (tenant_id, period_month, status, run_by)
       VALUES ($1, $2, 'RUNNING', $3)
       RETURNING id`,
      [tenantId, periodMonth, runBy],
    );
    const batchId = batchRow.id;
    const batchWarnings: string[] = [];

    try {
      // Fetch all active employees for this tenant
      const { rows: employees } = await this.db.query<BatchEmployeeRow>(
        `SELECT e.id AS employee_id, e.full_name, e.pay_group_code,
                e.province_code,
                COALESCE(ec.is_probation, false) AS is_probation,
                ec.base_salary::text AS contract_salary
         FROM public.employees e
         LEFT JOIN public.employee_contracts ec
           ON ec.employee_id = e.id AND ec.is_current = true AND ec.deleted_at IS NULL
         WHERE e.tenant_id = $1 AND e.deleted_at IS NULL
         ORDER BY e.pay_group_code, e.id`,
        [tenantId],
      ).catch(() => ({ rows: [] as BatchEmployeeRow[] }));

      if (!employees.length) {
        batchWarnings.push("Không có nhân viên nào để tính lương");
        await this.finalizeBatch(batchId, 0, 0n, 0n, batchWarnings);
        return { batch_id: batchId, employee_count: 0, warnings: batchWarnings };
      }

      // Pre-fetch approved input data for this period
      const inputTypes = ["TRIP_LOG","REVENUE_CLDV","MAINTENANCE_COST",
        "FREIGHT_REVENUE","DPHH_REVENUE","HOTLINE_STATS","BRANCH_STATS"] as const;

      const inputByType: Record<string, Map<string, Record<string, unknown>>> = {};
      for (const type of inputTypes) {
        const rows = await this.inputSvc.getApprovedRows(tenantId, periodMonthStr, type);
        const map = new Map<string, Record<string, unknown>>();
        for (const r of rows) {
          if (r.employee_id) map.set(r.employee_id, r.data as Record<string, unknown>);
        }
        inputByType[type] = map;
        if (!rows.length) batchWarnings.push(`Thiếu dữ liệu ${type} — NV thuộc nhóm này sẽ bỏ qua component`);
      }

      // ─── PHASE 1: Per-employee calculation ──────────────────────────────
      const phase1Results: Array<{
        employee: BatchEmployeeRow;
        gradeStep: GradeStepSnapshot | null;
        inputBag: InputDataBag;
        policy: Awaited<ReturnType<PolicyService["getActivePolicyForGroup"]>>;
        components: ComponentResult[];
        grossBeforePool: bigint;
      }> = [];

      for (const emp of employees) {
        // Get grade-step
        const gs = await this.gradeSvc.getCurrentGradeStep(tenantId, emp.employee_id, periodMonth);
        const gradeStep: GradeStepSnapshot | null = gs
          ? { grade_code: gs.grade_code, step_number: gs.step_number, monthly_salary_vnd: gs.monthly_salary_vnd, grade_name: "" }
          : null;

        // Build input bag
        const inputBag = this.buildInputBag(emp.employee_id, inputByType);

        // Attendance summary (best-effort)
        const attendance = await this.getAttendanceSummary(tenantId, emp.employee_id, periodMonthStr);

        // Get active policy
        const policy = await this.policySvc.getActivePolicyForGroup(tenantId, emp.pay_group_code, periodMonth);
        if (!policy) {
          batchWarnings.push(`${emp.full_name}: Không tìm thấy chính sách ACTIVE cho nhóm '${emp.pay_group_code}'`);
          await this.insertRecord(batchId, tenantId, emp.employee_id, periodMonth, null, null, [], 0n, 0n, "ERROR",
            [`No ACTIVE policy for pay_group '${emp.pay_group_code}'`]);
          continue;
        }

        const empSnapshot: EmployeeSnapshot = {
          employee_id: emp.employee_id, full_name: emp.full_name,
          pay_group_code: emp.pay_group_code, province_code: emp.province_code,
          is_probation: emp.is_probation,
          contract_salary_vnd: emp.contract_salary ? BigInt(emp.contract_salary) : null,
        };

        // Calculate non-pool components
        const compResults: ComponentResult[] = [];
        let grossBeforePool = 0n;

        for (const comp of policy.components.filter((c: any) => !POOL_COMPONENT_TYPES.has(c.component_type))) {
          const calc = getCalculator((comp as any).component_type);
          if (!calc) {
            compResults.push({
              component_type: (comp as any).component_type, name: (comp as any).name,
              is_deduction: Boolean((comp as any).is_deduction), amount_vnd: 0n, breakdown: [],
              warnings: [`[UNREGISTERED] No calculator for '${comp.component_type}'`], skipped: true,
            });
            continue;
          }

          const ctx: CalcContext = {
            periodMonth: periodMonthStr, employee: empSnapshot, gradeStep,
            attendance, inputBag, params: (comp as any).params as Record<string, unknown>,
            componentName: (comp as any).name, componentType: (comp as any).component_type,
            preTaxGrossVnd: grossBeforePool,
          };

          const result = await calc.calculate(ctx);
          compResults.push(result);
          if (!result.is_deduction && !result.skipped) grossBeforePool += result.amount_vnd;
        }

        phase1Results.push({ employee: emp, gradeStep, inputBag, policy, components: compResults, grossBeforePool });
      }

      // ─── PHASE 2: Pool distribution ────────────────────────────────────
      // Group employees by pool key
      const poolGroups = new Map<string, { poolKey: string; params: Record<string, unknown>; members: typeof phase1Results }>();

      for (const r of phase1Results) {
        if (!r.policy) continue;
        for (const comp of r.policy.components.filter((c: any) => POOL_COMPONENT_TYPES.has(c.component_type))) {
          const poolKey = String((comp as any).params["pool_key"] ?? comp.component_type);
          const resolvedKey = poolKey.replace("{YYYY_MM}", periodMonthStr.replace("-", "_"));
          if (!poolGroups.has(resolvedKey)) {
            poolGroups.set(resolvedKey, { poolKey: resolvedKey, params: (comp as any).params as Record<string, unknown>, members: [] });
          }
          poolGroups.get(resolvedKey)!.members.push(r);
        }
      }

      // Distribute each pool
      const poolShares = new Map<string, bigint>(); // `${poolKey}:${employee_id}` → share

      for (const [poolKey, group] of poolGroups) {
        const result = this.poolSvc.distributePool(
          poolKey,
          group.params,
          group.members.map((m) => ({
            employee_id: m.employee.employee_id,
            attendance: m.components[0] ? { actual_days: 0, standard_days: 26 } : { actual_days: 26, standard_days: 26 },
            inputBag: m.inputBag,
          })),
        );
        batchWarnings.push(...result.warnings);
        for (const [empId, share] of Object.entries(result.shares)) {
          poolShares.set(`${poolKey}:${empId}`, BigInt(String(share)));
        }
      }

      // ─── PHASE 3: Finalize net ─────────────────────────────────────────
      let totalGross = 0n;
      let totalNet = 0n;
      let recordCount = 0;

      for (const r of phase1Results) {
        const allComponents = [...r.components];

        // Add pool components
        if (r.policy) {
          for (const comp of r.policy.components.filter((c: any) => POOL_COMPONENT_TYPES.has(c.component_type))) {
            const poolKey = String((comp as any).params["pool_key"] ?? comp.component_type)
              .replace("{YYYY_MM}", periodMonthStr.replace("-", "_"));
            const poolShare = poolShares.get(`${poolKey}:${r.employee.employee_id}`) ?? 0n;
            allComponents.push({
              component_type: (comp as any).component_type, name: (comp as any).name,
              is_deduction: false, amount_vnd: poolShare,
              breakdown: [{ label: "Pool key", value: poolKey }, { label: "Phần phân bổ", value: poolShare.toLocaleString() + " đ" }],
              warnings: [], skipped: false,
            });
          }
        }

        // Calculate gross and net
        const gross = allComponents.filter((c: any) => !c.is_deduction && !c.skipped).reduce((s, c) => s + c.amount_vnd, 0n);
        const deductions = allComponents.filter((c: any) => c.is_deduction && !c.skipped).reduce((s, c) => s + c.amount_vnd, 0n);
        const net = gross > deductions ? gross - deductions : 0n;

        await this.insertRecord(
          batchId, tenantId, r.employee.employee_id, periodMonth,
          (r.policy as any)?.id ?? null, r.policy,
          allComponents, gross, net, "DRAFT", [],
        );

        totalGross += gross;
        totalNet += net;
        recordCount++;
      }

      await this.finalizeBatch(batchId, recordCount, totalGross, totalNet, batchWarnings);
      return { batch_id: batchId, employee_count: recordCount, warnings: batchWarnings };

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await this.db.query(
        `UPDATE public.payroll_batches SET status = 'FAILED', error_log = $1 WHERE id = $2`,
        [JSON.stringify({ error: msg }), batchId],
      );
      throw err;
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────

  private buildInputBag(employeeId: string, inputByType: Record<string, Map<string, Record<string, unknown>>>): InputDataBag {
    const bag: InputDataBag = {};
    const tripData = inputByType["TRIP_LOG"]?.get(employeeId);
    if (tripData) bag.trip_log = tripData as InputDataBag["trip_log"];
    const rcldv = inputByType["REVENUE_CLDV"]?.get(employeeId);
    if (rcldv) bag.revenue_cldv = rcldv as InputDataBag["revenue_cldv"];
    const mc = inputByType["MAINTENANCE_COST"]?.get(employeeId);
    if (mc) bag.maintenance_cost = mc as InputDataBag["maintenance_cost"];
    const fr = inputByType["FREIGHT_REVENUE"]?.get(employeeId);
    if (fr) bag.freight_revenue = fr as InputDataBag["freight_revenue"];
    const dphh = inputByType["DPHH_REVENUE"]?.get(employeeId);
    if (dphh) bag.dphh_revenue = dphh as InputDataBag["dphh_revenue"];
    const hotline = inputByType["HOTLINE_STATS"]?.get(employeeId);
    if (hotline) bag.hotline_stats = hotline as InputDataBag["hotline_stats"];
    const branch = inputByType["BRANCH_STATS"]?.get(employeeId);
    if (branch) bag.branch_stats = branch as InputDataBag["branch_stats"];
    return bag;
  }

  private async getAttendanceSummary(
    tenantId: string, employeeId: string, periodMonthStr: string
  ): Promise<AttendanceSummary> {
    try {
      const [year, month] = periodMonthStr.split("-").map(Number) as [number, number];
      const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
      const periodEnd = new Date(year, month, 0).toISOString().slice(0, 10);

      const { rows: [row] } = await this.db.query<{
        actual_days: string; sunday_days: string; absence_days: string; is_probation: string;
      }>(
        `SELECT
           count(DISTINCT date)::text AS actual_days,
           count(DISTINCT date) FILTER (WHERE EXTRACT(DOW FROM date) = 0)::text AS sunday_days,
           0::text AS absence_days,
           false::text AS is_probation
         FROM public.attendance_records
         WHERE tenant_id = $1 AND employee_id = $2
           AND date BETWEEN $3 AND $4 AND check_in_time IS NOT NULL`,
        [tenantId, employeeId, periodStart, periodEnd],
      );

      return {
        standard_days: 26, // Default; should fetch from calendar
        actual_days: Number(row?.actual_days ?? 0) || 26,
        sunday_days: Number(row?.sunday_days ?? 0),
        night_shift_hours: 0, overtime_hours: 0,
        absence_days: Number(row?.absence_days ?? 0),
        is_probation: row?.is_probation === "true",
      };
    } catch {
      // Attendance table not yet available — use defaults
      return { standard_days: 26, actual_days: 26, sunday_days: 0, night_shift_hours: 0, overtime_hours: 0, absence_days: 0, is_probation: false };
    }
  }

  private async insertRecord(
    batchId: string, tenantId: string, employeeId: string, periodMonth: string,
    policyId: string | null, policySnapshot: unknown,
    components: ComponentResult[], gross: bigint, net: bigint,
    status: string, recordWarnings: string[],
  ) {
    const serializable = components.map((c) => ({
      ...c,
      amount_vnd: c.amount_vnd.toString(),
    }));

    await this.db.query(
      `INSERT INTO public.payroll_records
         (batch_id, tenant_id, employee_id, period_month, policy_id, policy_snapshot,
          components, gross_vnd, net_vnd, status, warnings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        batchId, tenantId, employeeId, periodMonth,
        policyId, JSON.stringify(policySnapshot ?? {}),
        JSON.stringify(serializable), gross, net,
        status, JSON.stringify(recordWarnings),
      ],
    );
  }

  private async finalizeBatch(
    batchId: string, count: number, totalGross: bigint, totalNet: bigint, warnings: string[],
  ) {
    await this.db.query(
      `UPDATE public.payroll_batches
       SET status = 'COMPLETED', employee_count = $1, total_gross_vnd = $2,
           total_net_vnd = $3, completed_at = now(), error_log = $4
       WHERE id = $5`,
      [count, totalGross, totalNet, JSON.stringify({ warnings }), batchId],
    );
  }

  // ─── APPROVE ────────────────────────────────────────────────────────────

  async approveBatch(tenantId: string, batchId: string, approvedBy: string) {
    const { rows: [batch] } = await this.db.query<{ status: string }>(
      `SELECT status FROM public.payroll_batches WHERE id = $1 AND tenant_id = $2`,
      [batchId, tenantId],
    );
    if (!batch || batch.status !== "COMPLETED") {
      throw { statusCode: 409, message: `Batch status is '${batch?.status}' — must be COMPLETED to approve` };
    }
    await this.db.query(
      `UPDATE public.payroll_batches SET status='APPROVED', approved_by=$1, approved_at=now() WHERE id=$2`,
      [approvedBy, batchId],
    );
    await this.db.query(
      `UPDATE public.payroll_records SET status='APPROVED' WHERE batch_id=$1`,
      [batchId],
    );
    return { batch_id: batchId, status: "APPROVED" };
  }

  // ─── PAYSLIP ────────────────────────────────────────────────────────────

  async getPayslip(tenantId: string, employeeId: string, periodMonthStr: string) {
    const periodMonth = `${periodMonthStr}-01`;
    const { rows: [record] } = await this.db.query<{
      id: string; gross_vnd: string; net_vnd: string; status: string;
      components: string; warnings: string; policy_snapshot: string;
    }>(
      `SELECT pr.id::text, pr.gross_vnd::text, pr.net_vnd::text, pr.status,
              pr.components, pr.warnings, pr.policy_snapshot
       FROM public.payroll_records pr
       JOIN public.payroll_batches pb ON pb.id = pr.batch_id
       WHERE pr.tenant_id = $1 AND pr.employee_id = $2 AND pr.period_month = $3
         AND pb.status IN ('COMPLETED','APPROVED','LOCKED') AND pr.deleted_at IS NULL
       ORDER BY pb.created_at DESC LIMIT 1`,
      [tenantId, employeeId, periodMonth],
    );
    if (!record) throw { statusCode: 404, message: "Payslip not found for this period" };

    return {
      record_id: record.id,
      employee_id: employeeId,
      period_month: periodMonthStr,
      gross_vnd: record.gross_vnd,
      net_vnd: record.net_vnd,
      status: record.status,
      components: JSON.parse(record.components as unknown as string),
      warnings: JSON.parse(record.warnings as unknown as string),
    };
  }
}
