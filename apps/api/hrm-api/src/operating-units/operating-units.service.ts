import { Injectable } from '@nestjs/common';
import {
  HRM_GROUP_MEMBER_COMPANY_SLUGS,
  HRM_PILOT_OPERATING_COMPANY_ID,
  MASTER_TENANT_ID,
  resolveHrmListScope,
  type HrmListScopeContext,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  buildOperatingUnitSeedRows,
  HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES,
  type HrmOperatingUnitRow,
  rollupOrderForSlug,
} from './hrm-operating-unit-registry';

@Injectable()
export class OperatingUnitsService {
  constructor(private readonly db: HrmDbService) {}

  private async ensureSlugMapDisplayNames(): Promise<void> {
    await this.db.query(`
      ALTER TABLE public.company_slug_map
      ADD COLUMN IF NOT EXISTS display_name TEXT;
    `);
    for (const row of buildOperatingUnitSeedRows()) {
      await this.db.query(
        `INSERT INTO public.company_slug_map (tenant_id, company_slug, company_uuid, display_name, updated_at)
         VALUES ($1, $2, $3::uuid, $4, NOW())
         ON CONFLICT (tenant_id, company_slug) DO UPDATE SET
           display_name = COALESCE(NULLIF(TRIM(company_slug_map.display_name), ''), EXCLUDED.display_name),
           company_uuid = EXCLUDED.company_uuid,
           updated_at = NOW();`,
        [row.tenant_id, row.company_slug, row.company_uuid, row.display_name],
      );
    }
  }

  private resolveVisibleSlugs(scope: ReturnType<typeof resolveHrmListScope>): string[] {
    if (scope.masterTenantPartition) {
      return [...HRM_GROUP_MEMBER_COMPANY_SLUGS];
    }
    if (scope.memberTenantId) {
      return [];
    }
    const allowed = new Set(scope.companyIds.map((id) => id.trim().toLowerCase()));
    return HRM_GROUP_MEMBER_COMPANY_SLUGS.filter((slug) => allowed.has(slug));
  }

  async listOperatingUnits(
    authorization: string | undefined,
    context?: HrmListScopeContext,
  ): Promise<HrmOperatingUnitRow[]> {
    await this.ensureSlugMapDisplayNames();
    const scope = resolveHrmListScope(authorization, HRM_PILOT_OPERATING_COMPANY_ID, context);
    const visibleSlugs = this.resolveVisibleSlugs(scope);
    if (!visibleSlugs.length) {
      return [];
    }

    const res = await this.db.query<{ company_slug: string; display_name: string | null }>(
      `SELECT company_slug, display_name
       FROM public.company_slug_map
       WHERE tenant_id = $1 AND company_slug = ANY($2::text[])
       ORDER BY company_slug ASC;`,
      [MASTER_TENANT_ID, visibleSlugs],
    );
    const labelBySlug = new Map(
      res.rows.map((row) => [row.company_slug.trim().toLowerCase(), row.display_name?.trim() || '']),
    );

    return visibleSlugs
      .map((slug) => {
        const key = slug as (typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number];
        const fromDb = labelBySlug.get(slug);
        const display_name_vi =
          fromDb && fromDb.length > 0
            ? fromDb
            : HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES[key];
        return {
          operating_slug: key,
          display_name_vi,
          rollup_order: rollupOrderForSlug(slug),
        };
      })
      .sort((a, b) => a.rollup_order - b.rollup_order);
  }
}
