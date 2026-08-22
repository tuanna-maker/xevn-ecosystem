/**
 * @CODE-MEMORY
 * Screen:     HRM operating units API (filter + label map for employees)
 * UC:         UC-HRM-21 · UC-HRM-SCOPE-03 · AC-EMP-COL-01..04 · AC-EMP-COL-07
 * BR:         BR-EMP-COL-01 · BR-EMP-COL-03 · BR-INT-05
 * SRS:        docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md
 * TechSpec:   company_slug_map.display_name = Plane A / ĐVTV LE names
 * Purpose:    Expose operating_slug + display_name_vi from synced LE SoT;
 *             upgrade legacy Khối rows; never return Khối as final label.
 * WorkItem:   BE-HRM-EMP-COMPANY-COL-01
 * Coded:      2026-07-22
 * Callers:    OperatingUnitsController · FE operatingUnitLabelMap
 * Callees:    hrm-company-display-name · resolveHrmListScope · company_slug_map
 * Impact:     Khối labels → cột/filter «Thông tin công ty» lệch ĐVTV
 * must_keep:  Scope visibility (group CEO 5 slugs; member empty); holding = Tập đoàn XeVN
 * SOLID:      Thin Nest service — resolve/sync in shared module
 * LastVerified: be-hrm-emp-company-col-01.spec.ts · operating-units.service.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BE-HRM-EMP-COMPANY-COL-01
 * what: Use ensureCompanySlugMapLegalDisplayNames + resolveCompanyDisplayNameVi (LE SoT)
 * why: AC-EMP-COL-03/04 — stop COALESCE-only seed that left Khối in DB; reject Khối on read
 * must_keep: GROUP_MEMBER slug set; member CEO empty list
 *
 * @CODE-MEMORY-CHANGE 2026-07-25 D-HRM-EMP-COMPANY-COL-BE-02
 * what: Forward QueryResultRow generic into ensureCompanySlugMapLegalDisplayNames (TS2322)
 * why: nest --watch / start:dev failed assigning db.query wrapper to CompanyDisplayQueryFn
 * must_keep: LE display names; reject Khối* in company column; no runtime behavior change
 *
 * @CODE-MEMORY-CHANGE 2026-08-22
 * WorkItem: SA-HRM-TENANT-ONLY-SCOPE-01
 * change_mode: SPEC_ACK · DEPRECATE scheduled Phase 5
 * What: GET /operating-units lists legacy OU slugs for group CEO — superseded by tenant switcher
 *       + group-member-units (tenant_id). Member CEO returns [] by design.
 * Why:  ADR-HRM-TENANT-ONLY-SCOPE — OU not partition key after migrate.
 * Ref:  docs/program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md Phase 3–5
 * must_keep: Unchanged behavior until HRM_TENANT_ONLY_SCOPE=true and Phase 5 deprecate
 */
import { Injectable } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import {
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  HRM_PILOT_OPERATING_COMPANY_ID,
  MASTER_TENANT_ID,
  resolveHrmListScope,
  type HrmListScopeContext,
} from '../common/hrm-list-scope';
import {
  HRM_GROUP_ROLLUP_TENANT_IDS,
  HRM_TENANT_DISPLAY_NAMES,
  isHrmTenantOnlyScopeEnabled,
} from '../common/hrm-tenant-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  ensureCompanySlugMapLegalDisplayNames,
  resolveCompanyDisplayNameVi,
} from './hrm-company-display-name';
import {
  type HrmOperatingUnitRow,
  rollupOrderForSlug,
} from './hrm-operating-unit-registry';

@Injectable()
export class OperatingUnitsService {
  constructor(private readonly db: HrmDbService) {}

  private resolveVisibleSlugs(
    scope: ReturnType<typeof resolveHrmListScope>,
  ): string[] {
    if (scope.masterTenantPartition) {
      return [...HRM_GROUP_MEMBER_COMPANY_SLUGS];
    }
    if (scope.memberTenantId) {
      return [];
    }
    const allowed = new Set(
      scope.companyIds.map((id) => id.trim().toLowerCase()),
    );
    return HRM_GROUP_MEMBER_COMPANY_SLUGS.filter((slug) => allowed.has(slug));
  }

  private listTenantFilterRows(
    scope: ReturnType<typeof resolveHrmListScope>,
  ): HrmOperatingUnitRow[] {
    if (scope.memberTenantId) {
      return [];
    }
    const tenantIds =
      scope.tenantIds?.length && scope.tenantOnlyMode
        ? scope.tenantIds
        : [...HRM_GROUP_ROLLUP_TENANT_IDS];
    return tenantIds.map((tenantId, index) => ({
      operating_slug: tenantId as HrmOperatingUnitRow['operating_slug'],
      display_name_vi: HRM_TENANT_DISPLAY_NAMES[tenantId] ?? tenantId,
      rollup_order: index + 1,
    }));
  }

  async listOperatingUnits(
    authorization: string | undefined,
    context?: HrmListScopeContext,
  ): Promise<HrmOperatingUnitRow[]> {
    const scope = resolveHrmListScope(
      authorization,
      HRM_PILOT_OPERATING_COMPANY_ID,
      context,
    );
    if (isHrmTenantOnlyScopeEnabled()) {
      return this.listTenantFilterRows(scope);
    }

    await ensureCompanySlugMapLegalDisplayNames(
      async <T extends QueryResultRow>(sql: string, params?: unknown[]) =>
        this.db.query<T>(sql, params ?? []),
    );
    const visibleSlugs = this.resolveVisibleSlugs(scope);
    if (!visibleSlugs.length) {
      return [];
    }

    const res = await this.db.query<{
      company_slug: string;
      display_name: string | null;
    }>(
      `SELECT company_slug, display_name
       FROM public.company_slug_map
       WHERE tenant_id = $1 AND company_slug = ANY($2::text[])
       ORDER BY company_slug ASC;`,
      [MASTER_TENANT_ID, visibleSlugs],
    );
    const labelBySlug = new Map(
      res.rows.map((row) => [
        row.company_slug.trim().toLowerCase(),
        row.display_name,
      ]),
    );

    return visibleSlugs
      .map((slug) => {
        const key = slug as (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number];
        const display_name_vi =
          resolveCompanyDisplayNameVi(slug, labelBySlug.get(slug) ?? null) ??
          '';
        return {
          operating_slug: key,
          display_name_vi,
          rollup_order: rollupOrderForSlug(slug),
        };
      })
      .sort((a, b) => a.rollup_order - b.rollup_order);
  }
}
