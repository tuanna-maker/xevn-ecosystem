/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ NV → Khen thưởng & kỷ luật (KT/KL)
 * UC:         UC-BP-CORE-08 · FR-UC-BP-CORE-08 Diễn biến #1–#5
 * BR:         BR-BP-RD-01 · O1–O12 · CORE-RD-* invariants
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-CORE-08
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md §5 F-CORE-RD-01
 * DB_DESIGN:  docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-DATA-01.md §4–§5
 * Purpose:    Dual LIVE employee_rewards + employee_discipline SoT — link cols, enforce/cancel,
 *             soft payroll_periods, display-ready VI; paper /core/reward-discipline = alias only.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    employees.controller …/rewards* · …/discipline*
 * Callees:    resolveHrmListScope · payroll_periods soft · EmployeesService.getEmployeeById
 * FEActions:  KT/KL tab → GET/POST/PATCH · POST enforce · cancel-enforce
 * BEChain:    ensureSchema link cols → emp Hoạt động → period gates → status+link persist
 * Impact:     Nest /core dual · wipe dual · payslip_line CORE · mandatory pay_reward_link = FAIL
 * must_keep:  dual tables · HRM-CORE-RD-* · U19 · CORE-01/02 seals · Nest /core DENY · decisions≠RD
 * SOLID:      Service SRP for RD — profile tabs remain in EmployeeProfileService
 * LastVerified: po-hrm-mvp-gd1-core-08-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-08-CLUSTER-BE-01
 * change_mode: UPGRADE
 * What: ADD payroll_link_* + archived/audit; create pending+link; enforce/cancel; VAL/409 mint
 * Why: API-01 CONFIRMED F-CORE-RD-01 residual · note-CRUD ≠ FR-08 DONE
 * must_keep: dual LIVE · no Nest /core · no payslip_line · no pay_reward_link mandatory · honesty false
 */
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  pushCompanyIdFilter,
  resolveHrmListScope,
} from '../common/hrm-list-scope';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeProfileListQueryDto } from './dto/employee-profile-list.query.dto';
import { EmployeesService } from './employees.service';

export const HRM_CORE_RD_VAL_400 = 'HRM-CORE-RD-VAL-400';
export const HRM_CORE_RD_ENFORCE_409 = 'HRM-CORE-RD-ENFORCE-409';
export const HRM_CORE_RD_DUAL_PERIOD_409 = 'HRM-CORE-RD-DUAL-PERIOD-409';
export const HRM_CORE_RD_LOCKED_PERIOD_409 = 'HRM-CORE-RD-LOCKED-PERIOD-409';
export const HRM_CORE_RD_EMP_INACTIVE_409 = 'HRM-CORE-RD-EMP-INACTIVE-409';
export const HRM_CORE_RD_PERIOD_404 = 'HRM-CORE-RD-PERIOD-404';
export const HRM_CORE_RD_404 = 'HRM-CORE-RD-404';

export type RdKind = 'reward' | 'discipline';
export type PayrollLinkStatus =
  | 'none'
  | 'pending_period'
  | 'linked'
  | 'executed';
export type RdCanonicalStatus =
  | 'pending'
  | 'in_force'
  | 'executed'
  | 'cancelled';

type RdRow = Record<string, unknown> & {
  id: string;
  employee_id: string;
  company_id: string;
  title: string;
  status: string;
  payroll_link_status?: string | null;
  payroll_period_id?: string | null;
  payroll_period_ref?: string | null;
  payslip_id?: string | null;
  archived_at?: string | null;
  enforced_at?: string | null;
  enforced_by?: string | null;
  cancelled_at?: string | null;
  cancelled_by?: string | null;
  link_updated_at?: string | null;
  amount?: string | number | null;
  penalty_amount?: string | number | null;
  created_at?: string;
  updated_at?: string;
};

type SoftPeriod = {
  id: string;
  company_id: string;
  status: string;
  period_label: string | null;
};

const LINK_ENUM = new Set<PayrollLinkStatus>([
  'none',
  'pending_period',
  'linked',
  'executed',
]);
/** LIVE draft + paper open/adjust = unlocked for enforce. */
const PERIOD_UNLOCKED = new Set(['draft', 'open', 'adjust']);
/** LIVE processed/closed + paper locked. */
const PERIOD_LOCKED = new Set(['processed', 'closed', 'locked']);

const STATUS_LABEL_VI: Record<string, string> = {
  pending: 'Chờ',
  in_force: 'Đang thi hành',
  approved: 'Đang thi hành',
  executed: 'Đã thi hành',
  completed: 'Đã thi hành',
  active: 'Đã thi hành',
  cancelled: 'Hủy',
};

const LINK_LABEL_VI: Record<PayrollLinkStatus, string> = {
  none: 'Không gắn kỳ',
  pending_period: 'Chờ kỳ lương',
  linked: 'Đã gắn kỳ',
  executed: 'Đã vào phiếu lương',
};

function tableFor(kind: RdKind): string {
  return kind === 'reward'
    ? 'public.employee_rewards'
    : 'public.employee_discipline';
}

function amountField(kind: RdKind): 'amount' | 'penalty_amount' {
  return kind === 'reward' ? 'amount' : 'penalty_amount';
}

function dateField(kind: RdKind): 'reward_date' | 'discipline_date' {
  return kind === 'reward' ? 'reward_date' : 'discipline_date';
}

function typeField(kind: RdKind): 'reward_type' | 'discipline_type' {
  return kind === 'reward' ? 'reward_type' : 'discipline_type';
}

function parseAmount(raw: unknown): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  const n =
    typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, ''));
  if (!Number.isFinite(n) || n < 0) {
    throw new ApiException(
      HRM_CORE_RD_VAL_400,
      'Số tiền không hợp lệ (phải ≥ 0)',
      HttpStatus.BAD_REQUEST,
    );
  }
  return n;
}

function formatAmountDisplay(amount: number): string {
  try {
    return new Intl.NumberFormat('vi-VN').format(amount);
  } catch {
    return String(amount);
  }
}

function canonicalizeStatus(
  raw: string | null | undefined,
): RdCanonicalStatus | string {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (!s || s === 'pending') return 'pending';
  if (s === 'in_force' || s === 'approved')
    return s === 'approved' ? 'in_force' : 'in_force';
  if (s === 'executed' || s === 'completed') return 'executed';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'active') return 'executed';
  return s;
}

function statusLabelVi(
  raw: string | null | undefined,
  link?: string | null,
): string {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === 'active' || s === 'approved') {
    if (link === 'executed') return 'Đã thi hành';
    if (link === 'linked' || link === 'pending_period') return 'Đang thi hành';
  }
  return STATUS_LABEL_VI[s] ?? (s || 'Chờ');
}

function asLinkStatus(raw: unknown): PayrollLinkStatus {
  const s = String(raw ?? 'none')
    .trim()
    .toLowerCase() as PayrollLinkStatus;
  return LINK_ENUM.has(s) ? s : 'none';
}

function actorSub(authorization?: string): string | null {
  const jwt = getVerifiedInternalJwtPayload(authorization);
  const sub = typeof jwt?.sub === 'string' ? jwt.sub.trim() : '';
  return sub || null;
}

function isPeriodUnlocked(status: string): boolean {
  return PERIOD_UNLOCKED.has(String(status).toLowerCase());
}

function isPeriodLocked(status: string): boolean {
  return PERIOD_LOCKED.has(String(status).toLowerCase());
}

@Injectable()
export class EmployeeRewardDisciplineService implements OnModuleInit {
  constructor(
    private readonly db: HrmDbService,
    private readonly employees: EmployeesService,
  ) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        reward_date DATE NOT NULL,
        reward_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_discipline (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        discipline_date DATE NOT NULL,
        discipline_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        decision_number TEXT,
        penalty_amount NUMERIC NOT NULL DEFAULT 0,
        issued_by TEXT,
        effective_from DATE,
        effective_to DATE,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    for (const table of [
      'public.employee_rewards',
      'public.employee_discipline',
    ]) {
      await this.db.query(`
        ALTER TABLE ${table}
          ADD COLUMN IF NOT EXISTS payroll_link_status TEXT NOT NULL DEFAULT 'none',
          ADD COLUMN IF NOT EXISTS payroll_period_id UUID NULL,
          ADD COLUMN IF NOT EXISTS payroll_period_ref TEXT NULL,
          ADD COLUMN IF NOT EXISTS payslip_id UUID NULL,
          ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL,
          ADD COLUMN IF NOT EXISTS enforced_at TIMESTAMPTZ NULL,
          ADD COLUMN IF NOT EXISTS enforced_by TEXT NULL,
          ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ NULL,
          ADD COLUMN IF NOT EXISTS cancelled_by TEXT NULL,
          ADD COLUMN IF NOT EXISTS link_updated_at TIMESTAMPTZ NULL;
      `);
    }

    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.employee_rewards
          ADD CONSTRAINT chk_employee_rewards_payroll_link_status
          CHECK (payroll_link_status IN ('none','pending_period','linked','executed'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await this.db.query(`
      DO $$ BEGIN
        ALTER TABLE public.employee_discipline
          ADD CONSTRAINT chk_employee_discipline_payroll_link_status
          CHECK (payroll_link_status IN ('none','pending_period','linked','executed'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_employee_rewards_payroll_period
        ON public.employee_rewards (payroll_period_id) WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_employee_discipline_payroll_period
        ON public.employee_discipline (payroll_period_id) WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_employee_rewards_link_status
        ON public.employee_rewards (company_id, payroll_link_status) WHERE archived_at IS NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_employee_discipline_link_status
        ON public.employee_discipline (company_id, payroll_link_status) WHERE archived_at IS NULL;
    `);
  }

  listRewards(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.list(kindFrom('reward'), employeeId, query, authorization);
  }

  listDiscipline(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.list(kindFrom('discipline'), employeeId, query, authorization);
  }

  getReward(
    rewardId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.getById(
      kindFrom('reward'),
      rewardId,
      employeeId,
      query,
      authorization,
    );
  }

  getDiscipline(
    disciplineId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.getById(
      kindFrom('discipline'),
      disciplineId,
      employeeId,
      query,
      authorization,
    );
  }

  createReward(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.create(
      kindFrom('reward'),
      employeeId,
      query,
      payload,
      authorization,
    );
  }

  createDiscipline(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.create(
      kindFrom('discipline'),
      employeeId,
      query,
      payload,
      authorization,
    );
  }

  updateReward(
    rewardId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.patch(
      kindFrom('reward'),
      rewardId,
      employeeId,
      query,
      payload,
      authorization,
    );
  }

  updateDiscipline(
    disciplineId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    return this.patch(
      kindFrom('discipline'),
      disciplineId,
      employeeId,
      query,
      payload,
      authorization,
    );
  }

  deleteReward(
    rewardId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.softDeleteOrHard(
      kindFrom('reward'),
      rewardId,
      employeeId,
      query,
      authorization,
    );
  }

  deleteDiscipline(
    disciplineId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.softDeleteOrHard(
      kindFrom('discipline'),
      disciplineId,
      employeeId,
      query,
      authorization,
    );
  }

  enforceReward(
    rewardId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown> | undefined,
    authorization?: string,
  ) {
    return this.enforce(
      kindFrom('reward'),
      rewardId,
      employeeId,
      query,
      payload ?? {},
      authorization,
    );
  }

  enforceDiscipline(
    disciplineId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown> | undefined,
    authorization?: string,
  ) {
    return this.enforce(
      kindFrom('discipline'),
      disciplineId,
      employeeId,
      query,
      payload ?? {},
      authorization,
    );
  }

  cancelEnforceReward(
    rewardId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.cancelEnforce(
      kindFrom('reward'),
      rewardId,
      employeeId,
      query,
      authorization,
    );
  }

  cancelEnforceDiscipline(
    disciplineId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.cancelEnforce(
      kindFrom('discipline'),
      disciplineId,
      employeeId,
      query,
      authorization,
    );
  }

  private async list(
    kind: RdKind,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const employee = await this.assertEmployeeInScope(
      employeeId,
      query,
      authorization,
    );
    const filters = ['employee_id = $1::uuid', 'archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    pushCompanyIdFilter(filters, values, [employee.company_id]);
    const res = await this.db.query<RdRow>(
      `
        SELECT *
        FROM ${tableFor(kind)}
        WHERE ${filters.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT 500;
      `,
      values,
    );
    return {
      total: res.rows.length,
      data: res.rows.map((row) => this.toDisplayDto(kind, row)),
    };
  }

  private async getById(
    kind: RdKind,
    caseId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await this.assertEmployeeInScope(employeeId, query, authorization);
    const row = await this.loadCase(kind, caseId, employeeId);
    this.guardCaseScope(row, authorization, query.company_id);
    return this.toDisplayDto(kind, row);
  }

  private async create(
    kind: RdKind,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const employee = await this.assertEmployeeActive(
      employeeId,
      query,
      authorization,
    );

    const title = String(payload.title ?? '').trim();
    if (!title) {
      throw new ApiException(
        HRM_CORE_RD_VAL_400,
        'Thiếu tiêu đề khen thưởng/kỷ luật',
        HttpStatus.BAD_REQUEST,
      );
    }

    const amtField = amountField(kind);
    const amount = parseAmount(payload[amtField] ?? payload.amount);
    const dField = dateField(kind);
    const tField = typeField(kind);
    const caseDate = String(
      payload[dField] ?? payload.decision_date ?? '',
    ).trim();
    if (!caseDate) {
      throw new ApiException(
        HRM_CORE_RD_VAL_400,
        'Thiếu ngày quyết định',
        HttpStatus.BAD_REQUEST,
      );
    }
    const caseType = String(payload[tField] ?? payload.type ?? '').trim();
    if (!caseType) {
      throw new ApiException(
        HRM_CORE_RD_VAL_400,
        'Thiếu loại khen thưởng/kỷ luật',
        HttpStatus.BAD_REQUEST,
      );
    }

    let periodId =
      payload.payroll_period_id === undefined ||
      payload.payroll_period_id === null ||
      payload.payroll_period_id === ''
        ? null
        : String(payload.payroll_period_id);
    let periodRef =
      payload.payroll_period_ref === undefined ||
      payload.payroll_period_ref === null
        ? null
        : String(payload.payroll_period_ref);

    let link: PayrollLinkStatus = 'none';
    if (amount > 0) {
      if (!periodId) {
        throw new ApiException(
          HRM_CORE_RD_VAL_400,
          'Có số tiền phải gắn kỳ lương (payroll_period_id)',
          HttpStatus.BAD_REQUEST,
        );
      }
      const period = await this.resolvePeriodSoft(
        periodId,
        employee.company_id,
        authorization,
        query.company_id,
      );
      if (!isPeriodUnlocked(period.status)) {
        throw new ApiException(
          HRM_CORE_RD_LOCKED_PERIOD_409,
          'Kỳ lương đã khóa — không tạo gắn kỳ này',
          HttpStatus.CONFLICT,
        );
      }
      periodRef = periodRef || period.period_label;
      link = 'pending_period';
    } else {
      // note-only → force none; ignore stray period
      periodId = null;
      periodRef = null;
      link = 'none';
    }

    // Prefer pending on create — ignore FE approved/active default
    const status: RdCanonicalStatus = 'pending';
    const id = randomUUID();
    const columns = [
      'id',
      'employee_id',
      'company_id',
      dField,
      tField,
      'title',
      amtField,
      'status',
      'payroll_link_status',
      'payroll_period_id',
      'payroll_period_ref',
      'description',
      'decision_number',
      'issued_by',
      'notes',
    ];
    const values: unknown[] = [
      id,
      employeeId,
      employee.company_id,
      caseDate,
      caseType,
      title,
      amount,
      status,
      link,
      periodId,
      periodRef,
      payload.description ?? null,
      payload.decision_number ?? null,
      payload.issued_by ?? null,
      payload.notes ?? null,
    ];

    if (kind === 'discipline') {
      columns.push('effective_from', 'effective_to');
      values.push(payload.effective_from ?? null, payload.effective_to ?? null);
    }

    const placeholders = values.map((_, i) => {
      const col = columns[i];
      if (
        col?.includes('date') ||
        col === 'effective_from' ||
        col === 'effective_to'
      )
        return `$${i + 1}::date`;
      if (col === 'payroll_period_id') return `$${i + 1}::uuid`;
      return `$${i + 1}`;
    });

    const res = await this.db.query<RdRow>(
      `INSERT INTO ${tableFor(kind)} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *;`,
      values,
    );
    return this.toDisplayDto(kind, res.rows[0]);
  }

  private async patch(
    kind: RdKind,
    caseId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await this.assertEmployeeInScope(employeeId, query, authorization);
    const existing = await this.loadCase(kind, caseId, employeeId);
    this.guardCaseScope(existing, authorization, query.company_id);

    const targetStatusRaw =
      payload.status !== undefined
        ? String(payload.status).trim().toLowerCase()
        : undefined;
    if (
      targetStatusRaw === 'in_force' ||
      targetStatusRaw === 'executed' ||
      targetStatusRaw === 'approved' ||
      targetStatusRaw === 'completed'
    ) {
      // AC-CORE-08-ALT-04 — PATCH transition MUST run same enforce gates
      return this.enforce(
        kind,
        caseId,
        employeeId,
        query,
        {
          ...payload,
          target_status:
            targetStatusRaw === 'executed' || targetStatusRaw === 'completed'
              ? 'executed'
              : 'in_force',
        },
        authorization,
      );
    }
    if (targetStatusRaw === 'cancelled') {
      return this.cancelEnforce(kind, caseId, employeeId, query, authorization);
    }

    const amtField = amountField(kind);
    const nextAmount =
      payload[amtField] !== undefined || payload.amount !== undefined
        ? parseAmount(payload[amtField] ?? payload.amount)
        : parseAmount(existing[amtField]);

    let nextPeriodId =
      payload.payroll_period_id !== undefined
        ? payload.payroll_period_id === null || payload.payroll_period_id === ''
          ? null
          : String(payload.payroll_period_id)
        : (existing.payroll_period_id ?? null);
    let nextPeriodRef =
      payload.payroll_period_ref !== undefined
        ? payload.payroll_period_ref === null
          ? null
          : String(payload.payroll_period_ref)
        : (existing.payroll_period_ref ?? null);

    const currentLink = asLinkStatus(existing.payroll_link_status);
    if (existing.payroll_period_id) {
      const currentPeriod = await this.tryResolvePeriod(
        String(existing.payroll_period_id),
        String(existing.company_id),
        authorization,
        query.company_id,
      );
      if (currentPeriod && isPeriodLocked(currentPeriod.status)) {
        if (
          payload[amtField] !== undefined ||
          payload.amount !== undefined ||
          payload.payroll_period_id !== undefined ||
          payload.title !== undefined
        ) {
          throw new ApiException(
            HRM_CORE_RD_LOCKED_PERIOD_409,
            'Kỳ lương đã khóa — không sửa khoản gắn kỳ',
            HttpStatus.CONFLICT,
          );
        }
      }
      if (
        currentPeriod &&
        isPeriodUnlocked(currentPeriod.status) &&
        nextPeriodId &&
        nextPeriodId !== existing.payroll_period_id &&
        (currentLink === 'pending_period' ||
          currentLink === 'linked' ||
          currentLink === 'executed')
      ) {
        const nextPeriod = await this.resolvePeriodSoft(
          nextPeriodId,
          String(existing.company_id),
          authorization,
          query.company_id,
        );
        if (isPeriodUnlocked(nextPeriod.status)) {
          throw new ApiException(
            HRM_CORE_RD_DUAL_PERIOD_409,
            'Một khoản không được gắn đồng thời hai kỳ lương mở',
            HttpStatus.CONFLICT,
          );
        }
      }
    }

    let nextLink = currentLink;
    if (nextAmount > 0) {
      if (!nextPeriodId) {
        throw new ApiException(
          HRM_CORE_RD_VAL_400,
          'Có số tiền phải gắn kỳ lương (payroll_period_id)',
          HttpStatus.BAD_REQUEST,
        );
      }
      const period = await this.resolvePeriodSoft(
        nextPeriodId,
        String(existing.company_id),
        authorization,
        query.company_id,
      );
      if (
        !isPeriodUnlocked(period.status) &&
        nextPeriodId !== existing.payroll_period_id
      ) {
        throw new ApiException(
          HRM_CORE_RD_LOCKED_PERIOD_409,
          'Kỳ lương đã khóa — không gắn kỳ này',
          HttpStatus.CONFLICT,
        );
      }
      nextPeriodRef = nextPeriodRef || period.period_label;
      if (currentLink === 'none' || currentLink === 'pending_period') {
        nextLink = 'pending_period';
      }
    } else {
      nextPeriodId = null;
      nextPeriodRef = null;
      nextLink = 'none';
    }

    const sets: string[] = [];
    const values: unknown[] = [caseId, employeeId];
    const push = (col: string, val: unknown, cast = '') => {
      values.push(val);
      sets.push(`${col} = $${values.length}${cast}`);
    };

    if (payload.title !== undefined) {
      const title = String(payload.title).trim();
      if (!title) {
        throw new ApiException(
          HRM_CORE_RD_VAL_400,
          'Thiếu tiêu đề khen thưởng/kỷ luật',
          HttpStatus.BAD_REQUEST,
        );
      }
      push('title', title);
    }
    const dField = dateField(kind);
    const tField = typeField(kind);
    if (payload[dField] !== undefined) push(dField, payload[dField], '::date');
    if (payload[tField] !== undefined) push(tField, payload[tField]);
    if (payload.description !== undefined)
      push('description', payload.description);
    if (payload.decision_number !== undefined)
      push('decision_number', payload.decision_number);
    if (payload.issued_by !== undefined) push('issued_by', payload.issued_by);
    if (payload.notes !== undefined) push('notes', payload.notes);
    if (kind === 'discipline') {
      if (payload.effective_from !== undefined)
        push('effective_from', payload.effective_from, '::date');
      if (payload.effective_to !== undefined)
        push('effective_to', payload.effective_to, '::date');
    }
    push(amtField, nextAmount);
    push('payroll_link_status', nextLink);
    push('payroll_period_id', nextPeriodId, '::uuid');
    push('payroll_period_ref', nextPeriodRef);
    push('link_updated_at', new Date().toISOString(), '::timestamptz');
    sets.push('updated_at = NOW()');

    if (sets.length === 0) {
      throw new ApiException(
        HRM_CORE_RD_VAL_400,
        'Không có trường để cập nhật',
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.db.query<RdRow>(
      `UPDATE ${tableFor(kind)} SET ${sets.join(', ')}
       WHERE id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL
       RETURNING *;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_CORE_RD_404,
        'Không tìm thấy bản ghi KT/KL',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toDisplayDto(kind, res.rows[0]);
  }

  private async enforce(
    kind: RdKind,
    caseId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    payload: Record<string, unknown>,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await this.assertEmployeeActive(employeeId, query, authorization);
    const existing = await this.loadCase(kind, caseId, employeeId);
    this.guardCaseScope(existing, authorization, query.company_id);

    const currentStatus = String(existing.status ?? '').toLowerCase();
    if (currentStatus === 'cancelled') {
      throw new ApiException(
        HRM_CORE_RD_ENFORCE_409,
        'Khoản đã hủy — không thể thi hành lại',
        HttpStatus.CONFLICT,
      );
    }

    const amtField = amountField(kind);
    const amount = parseAmount(existing[amtField]);
    const periodId =
      payload.payroll_period_id !== undefined &&
      payload.payroll_period_id !== null &&
      payload.payroll_period_id !== ''
        ? String(payload.payroll_period_id)
        : existing.payroll_period_id
          ? String(existing.payroll_period_id)
          : null;

    if (amount > 0 && !periodId) {
      throw new ApiException(
        HRM_CORE_RD_ENFORCE_409,
        'Thi hành khoản có tiền yêu cầu gắn kỳ lương',
        HttpStatus.CONFLICT,
      );
    }

    let periodRef = existing.payroll_period_ref
      ? String(existing.payroll_period_ref)
      : null;
    if (periodId) {
      if (
        existing.payroll_period_id &&
        periodId !== String(existing.payroll_period_id) &&
        asLinkStatus(existing.payroll_link_status) !== 'none'
      ) {
        const currentPeriod = await this.tryResolvePeriod(
          String(existing.payroll_period_id),
          String(existing.company_id),
          authorization,
          query.company_id,
        );
        if (currentPeriod && isPeriodUnlocked(currentPeriod.status)) {
          const nextPeriod = await this.resolvePeriodSoft(
            periodId,
            String(existing.company_id),
            authorization,
            query.company_id,
          );
          if (isPeriodUnlocked(nextPeriod.status)) {
            throw new ApiException(
              HRM_CORE_RD_DUAL_PERIOD_409,
              'Một khoản không được gắn đồng thời hai kỳ lương mở',
              HttpStatus.CONFLICT,
            );
          }
        }
      }
      const period = await this.resolvePeriodSoft(
        periodId,
        String(existing.company_id),
        authorization,
        query.company_id,
      );
      if (isPeriodLocked(period.status)) {
        throw new ApiException(
          HRM_CORE_RD_LOCKED_PERIOD_409,
          'Kỳ lương đã khóa — không thể thi hành trên kỳ này',
          HttpStatus.CONFLICT,
        );
      }
      if (!isPeriodUnlocked(period.status)) {
        throw new ApiException(
          HRM_CORE_RD_ENFORCE_409,
          'Kỳ lương không ở trạng thái mở để thi hành',
          HttpStatus.CONFLICT,
        );
      }
      periodRef = period.period_label || periodRef;
    }

    const targetRaw = String(payload.target_status ?? 'in_force')
      .trim()
      .toLowerCase();
    const targetStatus: RdCanonicalStatus =
      targetRaw === 'executed' || targetRaw === 'completed'
        ? 'executed'
        : 'in_force';
    const link: PayrollLinkStatus = amount > 0 ? 'linked' : 'none';
    const actor = actorSub(authorization);

    const res = await this.db.query<RdRow>(
      `
        UPDATE ${tableFor(kind)}
        SET status = $3,
            payroll_link_status = $4,
            payroll_period_id = $5::uuid,
            payroll_period_ref = $6,
            enforced_at = NOW(),
            enforced_by = $7,
            link_updated_at = NOW(),
            cancelled_at = NULL,
            cancelled_by = NULL,
            updated_at = NOW()
        WHERE id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL
        RETURNING *;
      `,
      [caseId, employeeId, targetStatus, link, periodId, periodRef, actor],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_CORE_RD_404,
        'Không tìm thấy bản ghi KT/KL',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toDisplayDto(kind, res.rows[0]);
  }

  private async cancelEnforce(
    kind: RdKind,
    caseId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await this.assertEmployeeInScope(employeeId, query, authorization);
    const existing = await this.loadCase(kind, caseId, employeeId);
    this.guardCaseScope(existing, authorization, query.company_id);

    if (existing.payroll_period_id) {
      const period = await this.tryResolvePeriod(
        String(existing.payroll_period_id),
        String(existing.company_id),
        authorization,
        query.company_id,
      );
      if (period && isPeriodLocked(period.status)) {
        throw new ApiException(
          HRM_CORE_RD_LOCKED_PERIOD_409,
          'Kỳ lương đã khóa — không hủy thi hành ảnh hưởng phiếu lương',
          HttpStatus.CONFLICT,
        );
      }
    }

    const actor = actorSub(authorization);
    const res = await this.db.query<RdRow>(
      `
        UPDATE ${tableFor(kind)}
        SET status = 'cancelled',
            payroll_link_status = 'none',
            cancelled_at = NOW(),
            cancelled_by = $3,
            link_updated_at = NOW(),
            updated_at = NOW()
        WHERE id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL
        RETURNING *;
      `,
      [caseId, employeeId, actor],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_CORE_RD_404,
        'Không tìm thấy bản ghi KT/KL',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.toDisplayDto(kind, res.rows[0]);
  }

  private async softDeleteOrHard(
    kind: RdKind,
    caseId: string,
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await this.assertEmployeeInScope(employeeId, query, authorization);
    const existing = await this.loadCase(kind, caseId, employeeId);
    this.guardCaseScope(existing, authorization, query.company_id);

    const link = asLinkStatus(existing.payroll_link_status);
    if (
      (link === 'linked' || link === 'executed') &&
      existing.payroll_period_id
    ) {
      const period = await this.tryResolvePeriod(
        String(existing.payroll_period_id),
        String(existing.company_id),
        authorization,
        query.company_id,
      );
      if (period && isPeriodLocked(period.status)) {
        throw new ApiException(
          HRM_CORE_RD_LOCKED_PERIOD_409,
          'Kỳ lương đã khóa — không xóa khoản đã gắn',
          HttpStatus.CONFLICT,
        );
      }
    }

    // Prefer soft archive
    const soft = await this.db.query<{ id: string }>(
      `
        UPDATE ${tableFor(kind)}
        SET archived_at = NOW(), updated_at = NOW()
        WHERE id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL
        RETURNING id;
      `,
      [caseId, employeeId],
    );
    if (!soft.rows[0]) {
      throw new ApiException(
        HRM_CORE_RD_404,
        'Không tìm thấy bản ghi KT/KL',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: caseId, archived: true };
  }

  private async assertEmployeeInScope(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    return this.employees.getEmployeeById(employeeId, query, authorization);
  }

  private async assertEmployeeActive(
    employeeId: string,
    query: EmployeeProfileListQueryDto,
    authorization?: string,
  ) {
    const employee = await this.assertEmployeeInScope(
      employeeId,
      query,
      authorization,
    );
    const status = String(
      (employee as { status?: string }).status ?? '',
    ).toLowerCase();
    if (status && status !== 'active') {
      throw new ApiException(
        HRM_CORE_RD_EMP_INACTIVE_409,
        'Nhân viên không ở trạng thái Hoạt động',
        HttpStatus.CONFLICT,
      );
    }
    return employee;
  }

  private guardCaseScope(
    row: { company_id?: string | null } | null | undefined,
    authorization: string | undefined,
    companyId: string,
  ) {
    const scope = resolveHrmListScope(authorization, companyId);
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_CORE_RD_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
  }

  private async loadCase(
    kind: RdKind,
    caseId: string,
    employeeId: string,
  ): Promise<RdRow> {
    const res = await this.db.query<RdRow>(
      `
        SELECT *
        FROM ${tableFor(kind)}
        WHERE id = $1::uuid AND employee_id = $2::uuid AND archived_at IS NULL
        LIMIT 1;
      `,
      [caseId, employeeId],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        HRM_CORE_RD_404,
        'Không tìm thấy bản ghi KT/KL',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0];
  }

  private async resolvePeriodSoft(
    periodId: string,
    employeeCompanyId: string,
    authorization: string | undefined,
    queryCompanyId: string,
  ): Promise<SoftPeriod> {
    const period = await this.tryResolvePeriod(
      periodId,
      employeeCompanyId,
      authorization,
      queryCompanyId,
    );
    if (!period) {
      throw new ApiException(
        HRM_CORE_RD_PERIOD_404,
        'Không tìm thấy kỳ lương',
        HttpStatus.NOT_FOUND,
      );
    }
    return period;
  }

  private async tryResolvePeriod(
    periodId: string,
    employeeCompanyId: string,
    authorization: string | undefined,
    queryCompanyId: string,
  ): Promise<SoftPeriod | null> {
    const scope = resolveHrmListScope(
      authorization,
      queryCompanyId || employeeCompanyId,
    );
    const filters = ['id = $1::uuid'];
    const values: unknown[] = [periodId];
    pushCompanyIdFilter(
      filters,
      values,
      scope.companyIds.length ? scope.companyIds : [employeeCompanyId],
    );
    const res = await this.db.query<SoftPeriod>(
      `
        SELECT id, company_id, status, period_label
        FROM public.payroll_periods
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) return null;
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_CORE_RD_PERIOD_404,
      mismatchCode: 'HRM-SCOPE-409',
    });
    return row;
  }

  private toDisplayDto(kind: RdKind, row: RdRow): Record<string, unknown> {
    const amtField = amountField(kind);
    const rawAmt = row[amtField];
    const amount =
      rawAmt === undefined || rawAmt === null || rawAmt === ''
        ? 0
        : typeof rawAmt === 'number'
          ? rawAmt
          : Number(String(rawAmt).replace(/,/g, '')) || 0;
    const link = asLinkStatus(row.payroll_link_status);
    const statusRaw = String(row.status ?? 'pending');
    const canonical = canonicalizeStatus(statusRaw);
    const base: Record<string, unknown> = {
      id: row.id,
      employee_id: row.employee_id,
      company_id: row.company_id,
      kind,
      title: row.title,
      description: row.description ?? null,
      decision_number: row.decision_number ?? null,
      issued_by: row.issued_by ?? null,
      notes: row.notes ?? null,
      status: canonical,
      status_raw: statusRaw,
      status_label: statusLabelVi(statusRaw, link),
      payroll_link_status: link,
      payroll_link_status_label: LINK_LABEL_VI[link],
      payroll_period_id: row.payroll_period_id ?? null,
      payroll_period_ref: row.payroll_period_ref ?? null,
      payslip_id: row.payslip_id ?? null,
      archived_at: row.archived_at ?? null,
      enforced_at: row.enforced_at ?? null,
      enforced_by: row.enforced_by ?? null,
      cancelled_at: row.cancelled_at ?? null,
      cancelled_by: row.cancelled_by ?? null,
      link_updated_at: row.link_updated_at ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    if (kind === 'reward') {
      return {
        ...base,
        reward_date: row.reward_date ?? null,
        reward_type: row.reward_type ?? null,
        amount,
        amount_display: formatAmountDisplay(amount),
      };
    }
    return {
      ...base,
      discipline_date: row.discipline_date ?? null,
      discipline_type: row.discipline_type ?? null,
      penalty_amount: amount,
      penalty_amount_display: formatAmountDisplay(amount),
      amount,
      amount_display: formatAmountDisplay(amount),
      effective_from: row.effective_from ?? null,
      effective_to: row.effective_to ?? null,
    };
  }
}

function kindFrom(kind: RdKind): RdKind {
  return kind;
}
