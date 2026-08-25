/**
 * @CODE-MEMORY
 * Screen:     HRM → Lương → Phân nhóm bảng lương (F-PAY-GROUP-01)
 * UC:         UC-BP-PAY-09 · FR-UC-BP-PAY-09 · BR-BP-PAY-04
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-09
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-PAY-09-CLUSTER-API-01.md §4.1–4.2
 * Purpose:    CRUD pay_payroll_group · resolve membership · period bind validation · U19 scope parity.
 * WorkItem:   PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-01
 * Coded:      2026-08-10
 * must_keep:  PAY-01..08 process spine · payroll_e2e_ready=false · U65 no seed
 */
/** @CODE-MEMORY-CHANGE PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-02 — loadEmployeeAttrs: ORDER BY employee_work_timeline.event_date (not effective_from). */
/** @CODE-MEMORY-CHANGE HRM-MVP-GD1-PAY-09-CLUSTER-01 — solid_convention_ack: CRUD/resolve nhóm ở Service; display-ready qua JOIN catalog; scope parity list↔get-by-id. */
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandPayrollAttendanceSheetCompanyIds,
  expandPayrollPeriodCompanyIds,
  type HrmListScopeContext,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  pushEmployeeListScopeFilters,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import type { CreatePayrollGroupDto } from './dto/create-payroll-group.dto';
import type { ListPayrollGroupsQueryDto } from './dto/list-payroll-groups.query.dto';
import type { UpdatePayrollGroupDto } from './dto/update-payroll-group.dto';
import {
  HRM_PAY_GROUP_409,
  HRM_PAY_GROUP_412,
  PAY_PAYROLL_GROUP_STATUS_ACTIVE,
  PAY_PAYROLL_GROUP_STATUS_RETIRED,
} from './pay-payroll-group.constants';
import {
  assertPayGroupMatchSource,
  employeeMatchesPayrollGroupRule,
  parsePayPayrollGroupMatchRule,
  resolvePayrollGroupWinner,
  type EmployeePayrollGroupAttrs,
  type PayPayrollGroupCatalogRow,
  type PayPayrollGroupMatchRule,
} from './pay-payroll-group-resolver';
import { ensurePayPayrollGroupSchema } from './pay-payroll-group.schema';

type PayPayrollGroupRow = {
  id: string;
  company_id: string;
  code: string;
  name_vi: string;
  priority: number;
  match_rule_json: PayPayrollGroupMatchRule;
  formula_definition_id: string | null;
  status: string;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class PayPayrollGroupService {
  constructor(private readonly db: HrmDbService) {}

  async ensureSchema(): Promise<void> {
    await ensurePayPayrollGroupSchema(this.db);
  }

  private mapGroup(row: PayPayrollGroupRow) {
    return {
      id: row.id,
      company_id: row.company_id,
      code: row.code,
      name_vi: row.name_vi,
      priority: Number(row.priority),
      match_rule_json: row.match_rule_json ?? {},
      formula_definition_id: row.formula_definition_id ?? null,
      status: row.status,
      archived_at: row.archived_at ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async loadGroupRowInScope(
    groupId: string,
    requestedCompanyId: string,
    authorization?: string,
  ): Promise<PayPayrollGroupRow | undefined> {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [groupId];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    const res = await this.db.query<PayPayrollGroupRow>(
      `
        SELECT
          id::text AS id, company_id, code, name_vi, priority,
          match_rule_json, formula_definition_id::text AS formula_definition_id,
          status, archived_at::text AS archived_at,
          created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.pay_payroll_group
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    return res.rows[0];
  }

  async listGroups(query: ListPayrollGroupsQueryDto, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      query.company_id,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandPayrollPeriodCompanyIds(scope));
    if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }
    const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query<PayPayrollGroupRow>(
      `
        SELECT
          id::text AS id, company_id, code, name_vi, priority,
          match_rule_json, formula_definition_id::text AS formula_definition_id,
          status, archived_at::text AS archived_at,
          created_at::text AS created_at, updated_at::text AS updated_at
        FROM public.pay_payroll_group
        ${where}
        ORDER BY priority DESC, code ASC, id ASC;
      `,
      values,
    );
    return { items: res.rows.map((row) => this.mapGroup(row)) };
  }

  async getGroupById(
    groupId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const row = await this.loadGroupRowInScope(
      groupId,
      requestedCompanyId,
      authorization,
    );
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll group not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-SCOPE-409',
    });
    return this.mapGroup(row);
  }

  async createGroup(payload: CreatePayrollGroupDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const code = payload.code.trim();
    const nameVi = payload.name_vi.trim();
    if (!code || !nameVi) {
      throw new ApiException(
        'HRM-VAL-400',
        'code and name_vi required',
        HttpStatus.BAD_REQUEST,
      );
    }
    let matchRule: PayPayrollGroupMatchRule = {};
    try {
      matchRule = parsePayPayrollGroupMatchRule(payload.match_rule_json ?? {});
    } catch {
      throw new ApiException(
        'HRM-VAL-400',
        'match_rule_json invalid shape',
        HttpStatus.BAD_REQUEST,
      );
    }
    const status = payload.status ?? PAY_PAYROLL_GROUP_STATUS_ACTIVE;
    const priority = payload.priority ?? 0;
    const id = randomUUID();
    try {
      const res = await this.db.query<PayPayrollGroupRow>(
        `
          INSERT INTO public.pay_payroll_group (
            id, company_id, code, name_vi, priority, match_rule_json,
            formula_definition_id, status
          ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::uuid, $8)
          RETURNING
            id::text AS id, company_id, code, name_vi, priority,
            match_rule_json, formula_definition_id::text AS formula_definition_id,
            status, archived_at::text AS archived_at,
            created_at::text AS created_at, updated_at::text AS updated_at;
        `,
        [
          id,
          companyId,
          code,
          nameVi,
          priority,
          JSON.stringify(matchRule),
          payload.formula_definition_id ?? null,
          status,
        ],
      );
      return this.mapGroup(res.rows[0]);
    } catch (err: unknown) {
      const pgCode = (err as { code?: string })?.code;
      if (pgCode === '23505') {
        throw new ApiException(
          HRM_PAY_GROUP_409,
          'Mã nhóm bảng lương đã tồn tại trong công ty',
          HttpStatus.CONFLICT,
          { reason_code: 'DUPLICATE_CODE' },
        );
      }
      throw err;
    }
  }

  async updateGroup(
    groupId: string,
    requestedCompanyId: string,
    payload: UpdatePayrollGroupDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const existing = await this.loadGroupRowInScope(
      groupId,
      requestedCompanyId,
      authorization,
    );
    if (!existing) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll group not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-PAY-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    const nextName = payload.name_vi?.trim() ?? existing.name_vi;
    const nextPriority = payload.priority ?? existing.priority;
    let nextRule = existing.match_rule_json ?? {};
    if (payload.match_rule_json != null) {
      try {
        nextRule = parsePayPayrollGroupMatchRule(payload.match_rule_json);
      } catch {
        throw new ApiException(
          'HRM-VAL-400',
          'match_rule_json invalid shape',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const nextStatus = payload.status ?? existing.status;
    const nextFormulaId =
      payload.formula_definition_id !== undefined
        ? payload.formula_definition_id
        : existing.formula_definition_id;
    const archivedAt =
      nextStatus === PAY_PAYROLL_GROUP_STATUS_RETIRED &&
      existing.status !== PAY_PAYROLL_GROUP_STATUS_RETIRED
        ? new Date().toISOString()
        : existing.archived_at;

    const res = await this.db.query<PayPayrollGroupRow>(
      `
        UPDATE public.pay_payroll_group
        SET name_vi = $2,
            priority = $3,
            match_rule_json = $4::jsonb,
            formula_definition_id = $5::uuid,
            status = $6,
            archived_at = $7::timestamptz,
            updated_at = NOW()
        WHERE id = $1::uuid
        RETURNING
          id::text AS id, company_id, code, name_vi, priority,
          match_rule_json, formula_definition_id::text AS formula_definition_id,
          status, archived_at::text AS archived_at,
          created_at::text AS created_at, updated_at::text AS updated_at;
      `,
      [
        groupId,
        nextName,
        nextPriority,
        JSON.stringify(nextRule),
        nextFormulaId,
        nextStatus,
        archivedAt,
      ],
    );
    return this.mapGroup(res.rows[0]);
  }

  async assertActiveGroupForPeriodBind(
    payrollGroupId: string,
    periodCompanyId: string,
    authorization?: string,
  ): Promise<PayPayrollGroupRow> {
    await this.ensureSchema();
    const row = await this.loadGroupRowInScope(
      payrollGroupId,
      periodCompanyId,
      authorization,
    );
    if (!row) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll group not found',
        HttpStatus.NOT_FOUND,
      );
    }
    if (row.status === PAY_PAYROLL_GROUP_STATUS_RETIRED) {
      throw new ApiException(
        HRM_PAY_GROUP_409,
        'Không gắn kỳ lương với nhóm đã ngừng sử dụng',
        HttpStatus.CONFLICT,
        { reason_code: 'RETIRED_GROUP_BIND' },
      );
    }
    const persistCompany = resolveHrmPersistCompanyIdText(
      authorization,
      periodCompanyId,
    );
    if (row.company_id !== persistCompany) {
      throw new ApiException(
        'HRM-SCOPE-409',
        'Payroll group company mismatch',
        HttpStatus.CONFLICT,
      );
    }
    return row;
  }

  private async loadActiveGroupsForCompany(
    companyId: string,
  ): Promise<PayPayrollGroupCatalogRow[]> {
    const res = await this.db.query<{
      id: string;
      company_id: string;
      code: string;
      name_vi: string;
      priority: number;
      match_rule_json: PayPayrollGroupMatchRule;
      status: string;
    }>(
      `
        SELECT
          id::text AS id, company_id, code, name_vi, priority,
          match_rule_json, status
        FROM public.pay_payroll_group
        WHERE company_id = $1 AND status = 'active' AND archived_at IS NULL
        ORDER BY priority DESC, code ASC;
      `,
      [companyId],
    );
    return res.rows.map((row) => ({
      id: row.id,
      company_id: row.company_id,
      code: row.code,
      name_vi: row.name_vi,
      priority: Number(row.priority),
      match_rule_json: row.match_rule_json ?? {},
      status: row.status,
    }));
  }

  async loadEmployeeAttrsForCompany(
    companyId: string,
    scope: ReturnType<typeof resolveHrmListScope>,
  ): Promise<EmployeePayrollGroupAttrs[]> {
    const filters: string[] = ['e.archived_at IS NULL'];
    const values: unknown[] = [];
    pushEmployeeListScopeFilters(filters, values, scope);
    pushCompanyIdFilter(
      filters,
      values,
      expandPayrollAttendanceSheetCompanyIds(companyId),
    );
    const res = await this.db.query<{
      id: string;
      employee_code: string;
      full_name: string;
      department_id: string | null;
      position_key: string | null;
    }>(
      `
        SELECT
          e.id::text AS id,
          e.employee_code,
          e.full_name,
          NULLIF(TRIM(e.custom_fields->>'department_id'), '') AS department_id,
          COALESCE(
            (
              SELECT ewt.position_key
              FROM public.employee_work_timeline ewt
              WHERE ewt.employee_id = e.id
                AND ewt.archived_at IS NULL
              ORDER BY ewt.event_date DESC NULLS LAST, ewt.created_at DESC
              LIMIT 1
            ),
            e.job_title_key
          ) AS position_key
        FROM public.employees e
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    return res.rows.map((row) => ({
      employee_id: row.id,
      employee_code: row.employee_code,
      employee_name: row.full_name,
      department_id: row.department_id,
      position_key: row.position_key,
    }));
  }

  throwDualGroup409(employeeId?: string, groupIds?: string[]): never {
    throw new ApiException(
      HRM_PAY_GROUP_409,
      'Nhân viên khớp nhiều nhóm bảng lương cùng mức ưu tiên — cần cấu hình priority rõ ràng',
      HttpStatus.CONFLICT,
      {
        code: HRM_PAY_GROUP_409,
        reason_code: 'AMBIGUOUS_PRIORITY',
        employee_id: employeeId,
        group_ids: groupIds,
      },
    );
  }

  async resolveEffectiveGroupForEmployee(
    companyId: string,
    attrs: EmployeePayrollGroupAttrs,
    scope: ReturnType<typeof resolveHrmListScope>,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<{
    winner_id: string | null;
    ambiguous: boolean;
    group_ids?: string[];
  }> {
    const persistCompany = resolveHrmPersistCompanyIdText(
      authorization,
      companyId,
      scopeContext,
    );
    const groups = await this.loadActiveGroupsForCompany(persistCompany);
    if (groups.length === 0) {
      return { winner_id: null, ambiguous: false };
    }
    const resolved = resolvePayrollGroupWinner(groups, attrs);
    if (resolved.ambiguous) {
      this.throwDualGroup409(attrs.employee_id, resolved.group_ids);
    }
    return resolved;
  }

  async resolveMemberEmployeeIdsForGroup(
    groupId: string,
    periodCompanyId: string,
    authorization?: string,
    scope?: ReturnType<typeof resolveHrmListScope>,
  ): Promise<string[]> {
    await this.ensureSchema();
    const group = await this.loadGroupRowInScope(
      groupId,
      periodCompanyId,
      authorization,
    );
    if (!group || group.status !== PAY_PAYROLL_GROUP_STATUS_ACTIVE) {
      return [];
    }
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      periodCompanyId,
    );
    const resolvedScope =
      scope ?? resolveHrmListScope(authorization, scopeCompanyId);
    const employees = await this.loadEmployeeAttrsForCompany(
      periodCompanyId,
      resolvedScope,
    );
    const catalog = await this.loadActiveGroupsForCompany(group.company_id);
    const memberIds: string[] = [];
    for (const emp of employees) {
      const winner = resolvePayrollGroupWinner(catalog, emp);
      if (winner.ambiguous) {
        continue;
      }
      if (winner.winner_id === groupId) {
        memberIds.push(emp.employee_id);
      }
    }
    return memberIds;
  }

  async listGroupMembers(
    groupId: string,
    requestedCompanyId: string,
    periodId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const group = await this.getGroupById(
      groupId,
      requestedCompanyId,
      authorization,
    );
    const periodRes = await this.db.query<{
      id: string;
      company_id: string;
      start_date: string;
      end_date: string;
    }>(
      `
        SELECT id::text AS id, company_id, start_date::text AS start_date, end_date::text AS end_date
        FROM public.payroll_periods
        WHERE id = $1::uuid
        LIMIT 1;
      `,
      [periodId],
    );
    const period = periodRes.rows[0];
    if (!period) {
      throw new ApiException(
        'HRM-PAY-404',
        'Payroll period not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const catalog = await this.loadActiveGroupsForCompany(group.company_id);
    const employees = await this.loadEmployeeAttrsForCompany(
      period.company_id,
      scope,
    );
    const items: Array<{
      employee_id: string;
      employee_code: string;
      employee_name: string;
      match_source: string;
      conflict?: boolean;
    }> = [];
    const warnings: string[] = [];
    for (const emp of employees) {
      const rule = group.match_rule_json ?? {};
      const direct = employeeMatchesPayrollGroupRule(emp, rule);
      if (!direct.match) {
        continue;
      }
      const winner = resolvePayrollGroupWinner(catalog, emp);
      if (winner.ambiguous) {
        warnings.push(
          `employee ${emp.employee_id}: ambiguous priority across groups`,
        );
        items.push({
          employee_id: emp.employee_id,
          employee_code: emp.employee_code,
          employee_name: emp.employee_name,
          match_source: assertPayGroupMatchSource(
            direct.match_source ?? 'explicit_list',
          ),
          conflict: true,
        });
        continue;
      }
      if (winner.winner_id !== groupId) {
        continue;
      }
      items.push({
        employee_id: emp.employee_id,
        employee_code: emp.employee_code,
        employee_name: emp.employee_name,
        match_source: assertPayGroupMatchSource(
          direct.match_source ?? 'explicit_list',
        ),
      });
    }
    return {
      group_id: groupId,
      period_id: periodId,
      items,
      warnings,
    };
  }

  async persistPayslipGroupSnapshot(
    payslipId: string,
    payrollGroupId: string | null,
  ): Promise<void> {
    await this.db.query(
      `
        UPDATE public.payroll_payslips
        SET payroll_group_id = $2::uuid, updated_at = NOW()
        WHERE id = $1::uuid;
      `,
      [payslipId, payrollGroupId],
    );
  }

  async loadGroupLabelsByIds(
    ids: string[],
  ): Promise<Map<string, { code: string; name_vi: string }>> {
    if (ids.length === 0) {
      return new Map();
    }
    const res = await this.db.query<{
      id: string;
      code: string;
      name_vi: string;
    }>(
      `
        SELECT id::text AS id, code, name_vi
        FROM public.pay_payroll_group
        WHERE id = ANY($1::uuid[]);
      `,
      [ids],
    );
    const map = new Map<string, { code: string; name_vi: string }>();
    for (const row of res.rows) {
      map.set(row.id, { code: row.code, name_vi: row.name_vi });
    }
    return map;
  }

  throwMissingGroup412(employeeId?: string): never {
    throw new ApiException(
      HRM_PAY_GROUP_412,
      'Nhân viên chưa được gán nhóm bảng lương hiệu lực',
      HttpStatus.PRECONDITION_FAILED,
      { code: HRM_PAY_GROUP_412, employee_id: employeeId },
    );
  }
}
