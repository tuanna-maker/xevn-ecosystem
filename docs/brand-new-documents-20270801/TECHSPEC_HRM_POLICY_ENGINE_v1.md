# TECHSPEC — XEVN HRM PAYROLL POLICY ENGINE
## Technical Architecture Specification v1.1
**Ngày cập nhật:** 2026-08-22 | **Thay đổi:** Thêm `insurance_deduction` calculator; cập nhật `zero_sum_pool` params; xác nhận pool TĐ chung

---

## 1. KIẾN TRÚC TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────┐
│  hrm-api (NestJS, port 28001)                                    │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ GradeModule  │  │ PolicyModule │  │  PayrollModule       │   │
│  │              │  │              │  │  ┌────────────────┐  │   │
│  │ GradeService │  │ PolicySvc    │  │  │BatchService    │  │   │
│  │ StepService  │  │ AssignSvc    │  │  │ComponentFactory│  │   │
│  │ PromotionSvc │  │ DecisionSvc  │  │  │PoolCalcService │  │   │
│  └──────────────┘  └──────────────┘  │  │AttSummarySvc  │  │   │
│                                       │  └────────────────┘  │   │
│  ┌──────────────┐  ┌──────────────┐  └──────────────────────┘   │
│  │ InputModule  │  │ VehicleModule│                               │
│  │ ImportSvc    │  │ VehicleSvc   │                               │
│  │ ValidateSvc  │  │ FuelCalcSvc  │                               │
│  └──────────────┘  └──────────────┘                               │
│                                                                   │
│  Shared: HrmDbService · HrmJwtGuard · TenantContextMiddleware    │
└─────────────────────────────────────────────────────────────────┘
         │ events (at-least-once)         │ SQL (tenant_id filter)
         ▼                                 ▼
   XBOS Event Bus                   PostgreSQL 16+
   (WORKFLOW_APPROVED,              (hrm schema)
    CATALOG_UPDATED...)
```

---

## 2. FOLDER STRUCTURE

```
apps/api/hrm-api/src/
├── auth/
│   └── hrm-jwt.guard.ts          (existing)
├── grade/                         [NEW Epic E1]
│   ├── grade.module.ts
│   ├── grade.controller.ts
│   ├── grade.service.ts
│   ├── grade-step.service.ts
│   ├── grade-promotion.service.ts
│   └── dto/
│       ├── create-grade.dto.ts
│       ├── update-steps.dto.ts
│       └── promote-employee.dto.ts
├── policy/                        [NEW Epic E2]
│   ├── policy.module.ts
│   ├── policy.controller.ts
│   ├── policy.service.ts
│   ├── policy-assignment.service.ts
│   ├── policy-decision.service.ts
│   ├── policy-preview.service.ts
│   └── dto/
│       ├── create-policy.dto.ts
│       ├── upsert-component.dto.ts
│       └── preview-policy.dto.ts
├── input/                         [NEW Epic E3]
│   ├── input.module.ts
│   ├── input.controller.ts
│   ├── import.service.ts
│   ├── validate.service.ts
│   ├── parsers/
│   │   ├── trip-log.parser.ts
│   │   ├── revenue-cldv.parser.ts
│   │   ├── maintenance-cost.parser.ts
│   │   ├── freight-revenue.parser.ts
│   │   ├── dphh-revenue.parser.ts
│   │   ├── hotline-stats.parser.ts
│   │   └── branch-stats.parser.ts
│   └── dto/
│       └── import-input.dto.ts
├── payroll/                       [EXISTING + REWRITE Epic E4]
│   ├── payroll.module.ts
│   ├── payroll.controller.ts      (existing — thêm endpoints)
│   ├── pay-formula.constants.ts   (existing)
│   ├── pay-formula-variable-bag.ts (existing)
│   ├── batch/
│   │   ├── payroll-batch.service.ts  [NEW]
│   │   └── payslip.service.ts        [NEW]
│   ├── calculators/               [NEW — ComponentCalculatorFactory]
│   │   ├── calculator.interface.ts
│   │   ├── calculator.registry.ts
│   │   ├── grade-base.calculator.ts
│   │   ├── grade-allowance.calculator.ts
│   │   ├── trip-rate-tiered.calculator.ts
│   │   ├── revenue-quality.calculator.ts
│   │   ├── zero-sum-pool.calculator.ts
│   │   ├── attendance-bonus.calculator.ts
│   │   └── ... (28 calculators total)
│   ├── pool/
│   │   └── pool-calculation.service.ts
│   └── attendance-summary.service.ts [NEW]
├── vehicle/                       [NEW Epic E6]
│   ├── vehicle.module.ts
│   ├── vehicle.controller.ts
│   ├── vehicle.service.ts
│   └── fuel-quota.service.ts
└── shared/
    ├── hrm-db.service.ts          (existing)
    └── tenant-context.middleware.ts
```

---

## 3. COMPONENT CALCULATOR PATTERN

### 3.1 Interface

```typescript
// calculators/calculator.interface.ts
export interface CalcContext {
  component: {
    id: bigint;
    component_type: string;
    params: Record<string, unknown>;
    is_deduction: boolean;
    effective_from: Date;
    effective_to: Date | null;
  };
  inputBag: Record<string, unknown>;   // từ pay_input_rows.data JSONB
  attendance: AttendanceSummary;
  gradeStep: GradeStepInfo | null;
  employee: { id: string; pay_group_code: string; province_code: string; vehicle_type_code: string; is_probation: boolean };
  periodMonth: Date;                   // First day of month
  tenantId: string;
}

export interface ComponentResult {
  component_type: string;
  name: string;
  amount_vnd: bigint;               // Dương = income, Âm = deduction
  breakdown: Record<string, unknown>; // Chi tiết công thức để hiển thị
  warnings: string[];
  skipped: boolean;                 // true nếu không đủ điều kiện
  skip_reason?: string;
}

export interface ComponentCalculator {
  readonly componentType: string;
  calculate(ctx: CalcContext, db: DbQueryable): Promise<ComponentResult>;
}
```

### 3.2 Registry (tự động đăng ký)

```typescript
// calculators/calculator.registry.ts
@Injectable()
export class ComponentCalculatorRegistry {
  private readonly registry = new Map<string, ComponentCalculator>();

  register(calc: ComponentCalculator): void {
    this.registry.set(calc.componentType, calc);
  }

  get(componentType: string): ComponentCalculator {
    const calc = this.registry.get(componentType);
    if (!calc) throw new Error(`No calculator for: ${componentType}`);
    return calc;
  }
}
```

### 3.3 Ví dụ Calculator — trip_rate_tiered

```typescript
// calculators/trip-rate-tiered.calculator.ts
@Injectable()
export class TripRateTieredCalculator implements ComponentCalculator {
  readonly componentType = 'trip_rate_tiered';

  async calculate(ctx: CalcContext, _db: DbQueryable): Promise<ComponentResult> {
    const params = ctx.component.params as {
      province_code: string;
      tiers: Array<{ max_trips: number; rate_vnd: number }>;
      support_rate_vnd: number;
      noibai_rate_vnd: number;
      sunday_meal_vnd: number;
    };

    const tripLog = ctx.inputBag['TRIP_LOG'] as TripLogInput | undefined;
    if (!tripLog) {
      return { ...emptyResult(ctx), skipped: true, skip_reason: 'TRIP_LOG input missing' };
    }

    // Tính lượt Tier 1 + Tier 2
    let lương_luot = 0n;
    let remaining = tripLog.so_luot_t1 + tripLog.so_luot_t2;
    for (const tier of params.tiers) {
      const inTier = Math.min(remaining, tier.max_trips);
      lương_luot += BigInt(inTier) * BigInt(tier.rate_vnd);
      remaining = Math.max(0, remaining - inTier);
    }
    if (remaining > 0) {
      // Vượt tier cuối → dùng rate của tier cuối
      const lastRate = params.tiers.at(-1)!.rate_vnd;
      lương_luot += BigInt(remaining) * BigInt(lastRate);
    }

    // Tính lượt hỗ trợ tỉnh khác (Tier 2 của tỉnh đang hỗ trợ)
    const ho_tro = BigInt(tripLog.so_luot_ho_tro ?? 0) * BigInt(params.support_rate_vnd);

    // Tính lượt Nội Bài (tách riêng, không tính vào DT)
    const noi_bai = BigInt(tripLog.so_luot_noibai ?? 0) * BigInt(params.noibai_rate_vnd);

    // Ăn ca CN
    const an_ca_cn = BigInt(ctx.attendance.sunday_count) * BigInt(params.sunday_meal_vnd);

    const total = lương_luot + ho_tro + noi_bai + an_ca_cn;

    return {
      component_type: this.componentType,
      name: `Lương lượt (${params.province_code})`,
      amount_vnd: total,
      breakdown: {
        luot_t1: tripLog.so_luot_t1,
        luot_t2: tripLog.so_luot_t2,
        luong_luot_vnd: lương_luot.toString(),
        luot_ho_tro: tripLog.so_luot_ho_tro,
        tien_ho_tro_vnd: ho_tro.toString(),
        luot_noi_bai: tripLog.so_luot_noibai,
        tien_noi_bai_vnd: noi_bai.toString(),
        ngay_chu_nhat: ctx.attendance.sunday_count,
        tien_an_ca_cn_vnd: an_ca_cn.toString(),
      },
      warnings: [],
      skipped: false,
    };
  }
}
```

---

## 4. POOL CALCULATION ENGINE

### 4.1 Kiến trúc Pool

```
Batch run:
  Phase 1 — Individual calculation (parallel per employee):
    For each employee: calculate non-pool components → accumulate pre_pool_amount
  
  Phase 2 — Pool aggregation (sequential per pool_key):
    Group employees by pool_key
    For each pool_key:
      calculate pool shares → distribute to each employee
      update payroll_record with pool_share_vnd
  
  Phase 3 — Post-pool:
    For each employee: net = sum(income) - sum(deductions)
    Calculate BHXH/BHYT/BHTN/PIT
    Save final payroll_record
```

### 4.2 Pool Distribution Logic

```typescript
// pool/pool-calculation.service.ts
interface PoolMember {
  employee_id: string;
  contribution: number; // cuộc nghe | giờ công | hệ số vị trí × giờ
}

function distributePool(poolAmount: bigint, members: PoolMember[]): Map<string, bigint> {
  const totalContribution = members.reduce((s, m) => s + m.contribution, 0);
  if (totalContribution === 0) return new Map();

  const result = new Map<string, bigint>();
  let distributed = 0n;

  members.forEach((m, idx) => {
    if (idx === members.length - 1) {
      // Người cuối nhận phần còn lại để tránh rounding error
      result.set(m.employee_id, poolAmount - distributed);
    } else {
      const share = BigInt(Math.round((m.contribution / totalContribution) * Number(poolAmount)));
      result.set(m.employee_id, share);
      distributed += share;
    }
  });

  // Invariant: sum(shares) === poolAmount
  return result;
}
```

### 4.3 Pool Types và allocation_basis

| Pool Type | pool_key pattern | allocation_basis | contribution value |
|----------|-----------------|-----------------|-------------------|
| TĐ cuộc nghe | `TD_{hotline_code}_{YYYY_MM}` | `calls` | cuộc nghe cá nhân |
| TĐ HĐ+TG | `TD_{hotline_code}_HĐ_{YYYY_MM}` | `working_days` | ngày công × ca |
| VP Tỉnh | `VPT_{branch_code}_{YYYY_MM}` | `grade_coefficient` | hệ số × giờ công |
| ĐPHH KPI | `DPHH_KPI_{YYYY_MM}` | `working_days` | ngày công |

---

## 5. PAYROLL BATCH SERVICE

```typescript
// batch/payroll-batch.service.ts
async runBatch(tenantId: string, periodMonth: Date, createdBy: string): Promise<BatchResult> {
  // 1. Create batch record
  const batch = await this.createBatchRecord(tenantId, periodMonth, createdBy);

  try {
    // 2. Load all active employees with their policies
    const employees = await this.loadEmployeesWithPolicies(tenantId, periodMonth);

    // 3. Phase 1: Individual calculation
    const phase1Results = await Promise.allSettled(
      employees.map(emp => this.calculateEmployee(emp, periodMonth, tenantId))
    );

    // 4. Phase 2: Pool aggregation
    await this.poolCalcService.processAllPools(tenantId, periodMonth, phase1Results);

    // 5. Phase 3: BHXH/BHYT/BHTN/PIT + save
    for (const result of phase1Results) {
      if (result.status === 'fulfilled') {
        await this.finalizePayrollRecord(result.value, tenantId, batch.id);
      }
    }

    await this.markBatchComplete(batch.id, employees.length);
    return { batch_id: batch.id, status: 'COMPLETED', employee_count: employees.length };
  } catch (err) {
    await this.markBatchFailed(batch.id, err.message);
    throw err;
  }
}
```

---

## 6. ATTENDANCE SUMMARY SERVICE

```typescript
// attendance-summary.service.ts
export interface AttendanceSummary {
  working_days: number;
  total_hours: number;
  sunday_count: number;
  weekend_count: number;
  shift_breakdown: { CA_SANG: number; CA_CHIEU: number; HC: number };
  attendance_pct_of_standard: number; // 0–100, dùng cho pool TĐ
  standard_working_days: number;
}

async function getAttendanceSummary(
  employeeId: string,
  periodMonth: Date,
  db: DbQueryable,
): Promise<AttendanceSummary> {
  // Query từ attendance_records
  // Tính: working_days, hours, sunday count, weekend count
  // Standard = số ngày trong tháng - 4 (TĐ) hoặc 26 (standard)
}
```

---

## 7. INPUT DATA HUB — IMPORT PIPELINE

```
Upload Excel → ExcelParser (per input_type) → ValidationService → Preview → Approve

ExcelParser output: ParsedRow[]
  - raw_employee_ref: string (mã NV hoặc tên)
  - data: JSONB (typed per input_type)
  - parse_errors: string[]

ValidationService:
  - Employee matching: ma_nv → employee_id (fuzzy match + confirm)
  - Schema validation: required fields, numeric ranges
  - Business validation: period not locked, employee in right pay_group
  - Duplicate check: cùng employee trong cùng import

Result: ImportValidationResult[]
  - row_status: OK | ERROR | WARNING
  - error_message: mô tả lỗi chi tiết
```

---

## 8. GRADE-STEP SERVICE

```typescript
// grade/grade.service.ts
async getActiveGradeDefinition(tenantId: string, gradeCode: string, asOfDate: Date) {
  return db.query(`
    SELECT gd.*, gs.step_number, gs.monthly_salary
    FROM pay_grade_definitions gd
    JOIN pay_grade_steps gs ON gs.grade_def_id = gd.id
    WHERE gd.tenant_id = $1
      AND gd.grade_code = $2
      AND gd.effective_from <= $3
      AND (gd.effective_to IS NULL OR gd.effective_to >= $3)
      AND gd.deleted_at IS NULL
    ORDER BY gd.effective_from DESC
    LIMIT 1
  `, [tenantId, gradeCode, asOfDate]);
}

async getEmployeeCurrentGrade(tenantId: string, employeeId: string, asOfDate: Date) {
  return db.query(`
    SELECT ega.grade_def_id, ega.step_number, gs.monthly_salary, gd.grade_code
    FROM employee_grade_assignments ega
    JOIN pay_grade_definitions gd ON gd.id = ega.grade_def_id
    JOIN pay_grade_steps gs ON gs.grade_def_id = ega.grade_def_id AND gs.step_number = ega.step_number
    WHERE ega.tenant_id = $1
      AND ega.employee_id = $2
      AND ega.effective_from <= $3
    ORDER BY ega.effective_from DESC
    LIMIT 1
  `, [tenantId, employeeId, asOfDate]);
}
```

---

## 9. POLICY ASSIGNMENT RESOLUTION

```typescript
// policy/policy-assignment.service.ts
async getActivePolicyForEmployee(
  tenantId: string,
  employeeId: string,
  periodMonth: Date,
): Promise<PolicyWithComponents | null> {
  // 1. Tìm policy assignment active tại period_month
  const assignment = await db.query(`
    SELECT pa.policy_id
    FROM pay_policy_assignments pa
    WHERE pa.tenant_id = $1
      AND pa.employee_id = $2
      AND pa.effective_from <= $3
      AND (pa.effective_to IS NULL OR pa.effective_to >= $3)
    ORDER BY pa.effective_from DESC
    LIMIT 1
  `, [tenantId, employeeId, periodMonth]);

  if (!assignment.rows[0]) return null;

  // 2. Load policy + components
  const policy = await db.query(`
    SELECT pp.*, pic.*
    FROM pay_policies pp
    JOIN pay_income_components pic ON pic.policy_id = pp.id
    WHERE pp.id = $1
      AND pp.deleted_at IS NULL
      AND pic.effective_from <= $2
      AND (pic.effective_to IS NULL OR pic.effective_to >= $2)
    ORDER BY pic.sort_order ASC
  `, [assignment.rows[0].policy_id, periodMonth]);

  return groupPolicyWithComponents(policy.rows);
}
```

---

## 10. BHXH/BHYT/BHTN/PIT CALCULATION

```typescript
// Rates cấu hình trong catalog (không hardcode)
const INSURANCE_RATES = {
  BHXH_EMPLOYEE: 0.08,   // 8%
  BHYT_EMPLOYEE: 0.015,  // 1.5%
  BHTN_EMPLOYEE: 0.01,   // 1%
};

// Tính từ grade_base salary (lương ngạch-bậc), KHÔNG phải total income
function calculateInsurance(gradeSalaryVnd: bigint, config: InsuranceConfig): InsuranceResult {
  // Trần đóng BH = 20 × mức lương cơ sở (cần config từ catalog)
  const cap = config.base_salary_ceiling_multiplier * config.base_salary_vnd;
  const insurable = bigintMin(gradeSalaryVnd, BigInt(cap));

  return {
    bhxh: insurable * BigInt(Math.round(config.bhxh_pct * 10000)) / 10000n,
    bhyt: insurable * BigInt(Math.round(config.bhyt_pct * 10000)) / 10000n,
    bhtn: insurable * BigInt(Math.round(config.bhtn_pct * 10000)) / 10000n,
  };
}

// PIT: Progressive table (cấu hình được, không hardcode)
// Bảng luỹ tiến thuế TNCN → cũng lưu trong catalog type PIT_TABLE
```

---

## 11. EVENT CONTRACTS (XBOS Integration)

```typescript
// Events published by HRM:
PAYROLL_BATCH_COMPLETED: {
  tenantId: string;
  batchId: string;
  periodMonth: string; // YYYY-MM-DD
  employeeCount: number;
  totalGrossVnd: string;
  totalNetVnd: string;
}

GRADE_PROMOTED: {
  tenantId: string;
  employeeId: string;
  fromGrade: string;
  fromStep: number;
  toStep: number;
  effectiveFrom: string;
}

// Events consumed by HRM:
WORKFLOW_APPROVED: {
  workflowInstanceId: string;
  entityType: 'grade_promotion' | 'policy_decision' | 'payroll_batch';
  entityId: string;
  approvedAt: string;
}

CATALOG_UPDATED: {
  catalogType: string;
  changeType: 'CREATE' | 'UPDATE' | 'DEACTIVATE';
  effectiveDate: string;
}
```

---

## 12. DATABASE MIGRATION ORDER

```
Migration 001: E0 — Catalog extension (add new types to seed)
Migration 002: E0 — Employee extension (add grade_code, pay_group_code...)
Migration 003: E0 — Attendance extension (add shift_type, is_sunday...)
Migration 004: E1 — pay_grade_definitions + pay_grade_steps + employee_grade_assignments
Migration 005: E2 — pay_policies + pay_income_components + pay_policy_assignments
Migration 006: E3 — pay_input_imports + pay_input_rows
Migration 007: E4 — payroll_records ALTER (add policy_id, policy_snapshot, components)
Migration 008: E5 — pay_policy_decisions
Migration 009: E6 — vehicles + vehicle_fuel_logs
Migration 010: SEED — Grade 11×9 data + catalog entries (80+ rows)
```

---

## 13. SECURITY & MULTI-TENANT

- Mọi query đều có `WHERE tenant_id = $1` — enforced bởi `TenantContextMiddleware`
- `HrmJwtGuard` verify RS256 JWT, extract `tenantId` + `roles[]`
- Policy data (params JSONB) không được trả về raw cho EMPLOYEE role — chỉ trả về calculated amounts
- Payslip PDF encrypted at rest (kế thừa từ SRS_NEW UC-M04)
- Pool calculation results không được expose trước khi batch LOCKED

---

## 14. PERFORMANCE TARGETS

| Operation | Target | Strategy |
|-----------|--------|---------|
| Single employee calculation | < 100ms | In-memory calculator, minimal DB queries |
| Batch 100 employees | < 2 min | Promise.allSettled parallel |
| Batch 500 employees | < 10 min | Worker queue + pagination |
| Pool calculation (100 members) | < 5s | Aggregation query + in-memory distribute |
| Import 1000 rows Excel | < 30s | Streaming parser + batch upsert |
| Payslip PDF generate | < 3s | Pre-computed data + template |

---

## 15. DESIGN CHANGES FROM SPONSOR ANSWERS (v1.1)

### 15.1 Component Mới: `insurance_deduction` (từ Q4)

BHXH/BHYT/BHTN **không hardcode** — trở thành 1 income_component dạng `is_deduction=true`:

```typescript
// calculators/insurance-deduction.calculator.ts
export class InsuranceDeductionCalculator implements ComponentCalculator {
  readonly componentType = 'insurance_deduction';

  async calculate(ctx: CalcContext, db: DbQueryable): Promise<ComponentResult> {
    const params = ctx.component.params as {
      base: 'grade_base' | 'contract' | 'actual_income';
      bhxh_pct: number;          // default 8
      bhyt_pct: number;          // default 1.5
      bhtn_pct: number;          // default 1
      apply_ceiling: boolean;    // true = áp trần
      ceiling_multiple: number;  // default 20 (× lương cơ sở)
      base_salary_ref_vnd: number; // lương cơ sở hiện hành (seed vào catalog)
    };

    // Xác định mức lương đóng
    let baseVnd: bigint;
    switch (params.base) {
      case 'grade_base':
        baseVnd = ctx.gradeStep?.salary_vnd ?? 0n;
        break;
      case 'contract':
        baseVnd = BigInt(ctx.inputBag['contract_salary_vnd'] as number ?? 0);
        break;
      case 'actual_income':
        // Chạy sau khi tất cả income components đã tính xong (sort_order cao)
        baseVnd = ctx.preTaxIncome ?? 0n;
        break;
    }

    // Áp trần nếu cần
    if (params.apply_ceiling) {
      const ceiling = BigInt(Math.round(params.ceiling_multiple * params.base_salary_ref_vnd));
      if (baseVnd > ceiling) baseVnd = ceiling;
    }

    const bhxh = baseVnd * BigInt(Math.round(params.bhxh_pct * 100)) / 10000n;
    const bhyt = baseVnd * BigInt(Math.round(params.bhyt_pct * 100)) / 10000n;
    const bhtn = baseVnd * BigInt(Math.round(params.bhtn_pct * 100)) / 10000n;
    const total = -(bhxh + bhyt + bhtn); // âm vì là khấu trừ

    return {
      component_type: this.componentType,
      name: 'BHXH + BHYT + BHTN',
      amount_vnd: total,
      breakdown: {
        base_vnd: baseVnd.toString(),
        bhxh_vnd: bhxh.toString(),
        bhyt_vnd: bhyt.toString(),
        bhtn_vnd: bhtn.toString(),
        ceiling_applied: params.apply_ceiling,
      },
      warnings: [],
      skipped: false,
    };
  }
}
```

**Params mẫu cho LX Tuyến (grade_base):**
```json
{
  "base": "grade_base",
  "bhxh_pct": 8,
  "bhyt_pct": 1.5,
  "bhtn_pct": 1,
  "apply_ceiling": true,
  "ceiling_multiple": 20,
  "base_salary_ref_vnd": 2340000
}
```

---

### 15.2 Cập nhật `zero_sum_pool` params (từ Q5)

Thêm field `remainder_behavior` vào params schema:

```typescript
type ZeroSumPoolParams = {
  pool_key: string;                    // 'TD_{YYYY_MM}', 'VPT_{branch}_{YYYY_MM}'
  pool_amount_vnd: number;             // Tổng quỹ
  allocation_basis: 'calls' | 'working_hours' | 'grade_coefficient';
  min_attendance_pct: number;          // 50 = <50% công chuẩn
  min_attendance_share_pct: number;    // 50 = hưởng 50% phần chia
  remainder_behavior:                  // [MỚI] điều gì xảy ra với phần còn lại
    | 'redistribute'                   // Chia lại cho NV đủ công
    | 'return_to_company'              // Hàn về công ty (không chia)
    | 'carry_forward';                 // Cộng vào quỹ tháng sau
};
```

---

### 15.3 Pool key Tổng đài (từ Q3 — pool chung)

```
TRƯỚC (sai): pool_key = 'TD_1500_{YYYY_MM}' và 'TD_1731_{YYYY_MM}' (2 pool riêng)
SAU   (đúng): pool_key = 'TD_{YYYY_MM}' (1 pool chung cho cả 2 số)
```

Nhân viên vẫn có `hotline_code` attribute để phân biệt báo cáo, nhưng pool key không phân biệt.

---

### 15.4 Tổng component_type: 29 (thêm 1 mới)

| # | Component type | Loại | Mới? |
|---|---------------|-------|-------|
| 1–28 | (Giữ nguyên) | | |
| **29** | `insurance_deduction` | Khấu trừ | **✅ Mới từ Q4** |

