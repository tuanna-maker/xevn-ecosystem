/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Lane B pool ↔ Lane A spine (recruitment_candidates)
 * UC:         FR-UC-BP-REC-06a · FR-HRM-RC-03
 * Purpose:    Materialize spine recruitment_candidates from pool public.candidates by email
 *             so FE resolveSpineRecruitmentCandidateId + active_interview merge work (U65 path).
 * WorkItem:   PO-HRM-REC-IV-ONE-ACTIVE-SPINE-POOL-LINK-03
 * must_keep:   G-DB-04 dual catalog · no hard FK pool↔spine (G-DB-02) · U65 no seed scripts
 * SOLID:      Pure bridge helpers — RecruitmentService + RecruitmentCatalogService callers
 */
import { randomUUID } from 'node:crypto';
import type { HrmDbService } from '../db/hrm-db.service';
import { pushCompanyIdFilter } from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';

export type PoolCandidateSpineSource = {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  source?: string | null;
};

export type EnsureSpineFromPoolResult = {
  id: string;
  created: boolean;
};

function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase();
}

/** Resolve an open requisition in company scope for spine INSERT (requisition_id NOT NULL). */
export async function resolveOpenRequisitionIdForCompany(
  db: HrmDbService,
  companyId: string,
  scopeCompanyIds: readonly string[],
): Promise<string | null> {
  const tryIds = [
    companyId,
    ...scopeCompanyIds.filter((id) => id !== companyId),
  ];
  for (const cid of tryIds) {
    const res = await db.query<{ id: string }>(
      `SELECT id
       FROM public.job_requisitions
       WHERE company_id = $1::text
         AND lower(status) IN ('open', 'approved', 'pending_approval')
       ORDER BY updated_at DESC
       LIMIT 1;`,
      [cid],
    );
    if (res.rows[0]?.id) {
      return res.rows[0].id;
    }
  }
  return null;
}

export async function findSpineRecruitmentCandidateIdByEmail(
  db: HrmDbService,
  email: string,
  scopeCompanyIds: readonly string[],
): Promise<string | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const filters: string[] = ['lower(btrim(email)) = $1'];
  const values: unknown[] = [normalized];
  pushCompanyIdFilter(filters, values, [...scopeCompanyIds]);
  const res = await db.query<{ id: string }>(
    `SELECT id
     FROM public.recruitment_candidates
     WHERE ${filters.join(' AND ')}
     ORDER BY updated_at DESC
     LIMIT 1;`,
    values,
  );
  return res.rows[0]?.id ?? null;
}

/**
 * Ensure Lane A spine row exists for a pool candidate (match by normalized email in scope).
 * Creates spine when missing and an open requisition exists in scope.
 */
export async function ensureSpineRecruitmentCandidateFromPool(
  db: HrmDbService,
  pool: PoolCandidateSpineSource,
  scopeCompanyIds: readonly string[],
): Promise<EnsureSpineFromPoolResult | null> {
  const normalizedEmail = normalizeEmail(pool.email);
  if (!normalizedEmail) return null;

  const existingId = await findSpineRecruitmentCandidateIdByEmail(
    db,
    normalizedEmail,
    scopeCompanyIds,
  );
  if (existingId) {
    return { id: existingId, created: false };
  }

  const requisitionId = await resolveOpenRequisitionIdForCompany(
    db,
    pool.company_id,
    scopeCompanyIds,
  );
  if (!requisitionId) {
    return null;
  }

  const reqTenantRes = await db.query<{ tenant_id: string | null }>(
    `SELECT NULLIF(TRIM(tenant_id), '') AS tenant_id
     FROM public.job_requisitions
     WHERE id = $1::uuid
     LIMIT 1;`,
    [requisitionId],
  );
  const tenantId =
    reqTenantRes.rows[0]?.tenant_id ?? masterTenantIdFromEnv();

  const spineId = randomUUID();
  const source = (pool.source ?? 'pool').trim() || 'pool';
  await db.query(
    `INSERT INTO public.recruitment_candidates
      (id, tenant_id, company_id, requisition_id, full_name, email, source, status, pool_candidate_id)
     VALUES ($1, $2::text, $3::text, $4::uuid, $5, $6, $7, 'new', $8::uuid);`,
    [
      spineId,
      tenantId,
      pool.company_id,
      requisitionId,
      pool.full_name.trim(),
      normalizedEmail,
      source,
      pool.id,
    ],
  );
  return { id: spineId, created: true };
}

/** Materialize spine rows for pool candidates in scope that lack email match on spine. */
export async function materializeMissingSpineCandidatesFromPool(
  db: HrmDbService,
  scopeCompanyIds: readonly string[],
): Promise<number> {
  if (scopeCompanyIds.length === 0) return 0;

  const poolFilters: string[] = [`email IS NOT NULL`, `btrim(email) <> ''`];
  const poolValues: unknown[] = [];
  pushCompanyIdFilter(poolFilters, poolValues, [...scopeCompanyIds]);

  const poolRes = await db.query<PoolCandidateSpineSource>(
    `SELECT id, company_id, full_name, email, source
     FROM public.candidates
     WHERE ${poolFilters.join(' AND ')};`,
    poolValues,
  );

  let created = 0;
  for (const row of poolRes.rows) {
    const result = await ensureSpineRecruitmentCandidateFromPool(
      db,
      row,
      scopeCompanyIds,
    );
    if (result?.created) {
      created += 1;
    }
  }
  return created;
}
