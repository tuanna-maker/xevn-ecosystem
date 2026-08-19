/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ NV — gán Quản lý trực tiếp (manager_id)
 * UC:         UC-H01 · FR-UC-H01 · FR-UC-H03
 * BR:         BR-CD-F4-02 · L1 direct_manager · BR-WF-04 (no self-approve chain)
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md · FR-UC-H01
 * TechSpec:   docs/brand-new-documents-20270801/TECH_SPEC_NEW.md §4.3 · §4.4
 * DB:         docs/brand-new-documents-20270801/DB_DESIGN_NEW.md employees.manager_id
 * Purpose:    Validate manager_id on create/update: null clear OK; ≠ self; same company;
 *             no hierarchy cycle. Product path for Option B (U65 — no seed).
 * WorkItem:   R-SPINE-MGR-HIER-01-BE
 * Coded:      2026-08-03
 *
 * Callers:
 *   - employees.service.ts → createEmployee / updateEmployee
 *
 * Callees:
 *   - HrmDbService.query → public.employees
 *
 * BE-Chain:
 *   PATCH/POST manager_id → assertManagerAssignment → UPDATE/INSERT employees.manager_id
 *   Leave L1 list: lr.employee_id IN (SELECT id FROM employees WHERE manager_id = :mgr)
 *
 * Impact:     Missing guard → self/cycle/cross-company edge → empty or wrong ManagerApprovals
 * must_keep:  leave list SQL filter semantics; soft-delete (archived manager reject);
 *             scope parity list↔get↔patch (caller already asserts target in scope)
 * SOLID:      SRP — hierarchy validation only; persistence stays in EmployeesService
 * LastVerified: employee-manager.validation.spec.ts · employees.service.spec.ts manager_id
 */

import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import {
  expandHrmTextCompanyIds,
  resolveHrmListScope,
} from '../common/hrm-list-scope';

export type EmployeeManagerDb = {
  // Compatible with pg QueryResult / HrmDbService.query (rows typed loosely).
  query: (
    sql: string,
    params?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>;
};

type ManagerRow = {
  id: string;
  company_id: string;
  archived_at: string | null;
};

function normalizeCompanyId(companyId: string): string {
  return companyId.trim().toLowerCase();
}

/**
 * Assert manager_id may be assigned to employeeId under list scope.
 * `null` / empty → clear (allowed). `employeeId` null on create (no self/cycle yet).
 */
export async function assertManagerAssignment(
  db: EmployeeManagerDb,
  options: {
    employeeId: string | null;
    companyId: string;
    managerId: string | null | undefined;
    authorization?: string;
    scopeContext?: { tenantId?: string };
  },
): Promise<string | null> {
  if (options.managerId === undefined) {
    return null;
  }
  if (options.managerId === null) {
    return null;
  }
  const managerId = options.managerId.trim();
  if (!managerId) {
    return null;
  }

  if (options.employeeId && managerId === options.employeeId) {
    throw new ApiException(
      'HRM-EMP-MGR-SELF',
      'manager_id cannot equal the employee id',
      HttpStatus.BAD_REQUEST,
    );
  }

  const managerRes = await db.query(
    `
      SELECT id::text AS id, company_id, archived_at
      FROM public.employees
      WHERE id = $1::uuid
      LIMIT 1;
    `,
    [managerId],
  );
  const manager = managerRes.rows[0] as ManagerRow | undefined;
  if (!manager || manager.archived_at !== null) {
    throw new ApiException(
      'HRM-EMP-MGR-404',
      'manager_id must reference an active employee',
      HttpStatus.BAD_REQUEST,
    );
  }

  // Resolve list scope to validate manager is within allowed companies
  const listScope = resolveHrmListScope(options.authorization, options.companyId, options.scopeContext);
  const allowedCompanyIds = expandHrmTextCompanyIds(listScope, options.authorization);
  const normalizedManagerCompanyId = normalizeCompanyId(String(manager.company_id));
  if (!allowedCompanyIds.map(normalizeCompanyId).includes(normalizedManagerCompanyId)) {
    throw new ApiException(
      'HRM-EMP-MGR-SCOPE',
      'manager_id must belong to the same company as the employee',
      HttpStatus.BAD_REQUEST,
      {
        employee_company_id: options.companyId,
        manager_company_id: manager.company_id,
        allowed_company_ids: allowedCompanyIds,
      },
    );
  }

  if (options.employeeId) {
    const cycleRes = await db.query(
      `
        WITH RECURSIVE chain AS (
          SELECT e.id, e.manager_id
          FROM public.employees e
          WHERE e.id = $1::uuid AND e.archived_at IS NULL
          UNION ALL
          SELECT m.id, m.manager_id
          FROM public.employees m
          INNER JOIN chain c ON m.id = c.manager_id
          WHERE m.archived_at IS NULL
        )
        SELECT id::text AS id
        FROM chain
        WHERE id = $2::uuid
        LIMIT 1;
      `,
      [managerId, options.employeeId],
    );
    if (cycleRes.rows[0]) {
      throw new ApiException(
        'HRM-EMP-MGR-CYCLE',
        'manager_id would create a reporting cycle',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  return managerId;
}
