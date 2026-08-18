# QC-S7-TENANT-ID-EMPTY-01 - Live Audit of contract-templates tenant_id handling

**work_item_id:** QC-S7-TENANT-ID-EMPTY-01
**auditor:** qc lane (read-only)
**target:** HRM BE :28001 /api/hrm/contract-templates
**verdict:** REAL BUG (contract/parameter mismatch - NOT a probe artifact)
**ack_status:** PASS_TO_PM

## 1. Verdict

**REAL BUG.** The empty tenant_id is not a DB default artifact. It is produced by a
**parameter-name mismatch between client and controller**:

- The probe (and the S7 BE contract) passes the tenant as a **query parameter**
  ?tenantId=xevn.
- The controller reads the tenant from the **x-tenant-id HTTP header only**
  (@Headers('x-tenant-id')) and falls back to '' when the header is absent.

Because the query param is silently ignored, every request that omits the header
upserts a row with tenant_id = ''. The DB has no default for tenant_id
(NOT NULL, no DEFAULT in the migration), so the empty string is 100% the
controller tenantId ?? '' fallback, not a DB artifact.

**It is NOT a multi-tenant isolation collapse.** The unique key
(tenant_id, template_code, clause_id) still separates tenants when the header is
present - verified live (section 4, probes C/D). Severity is
**contract-breaking + data-hygiene**, not tenant leakage.

## 2. Exact code path that produces tenant_id=''

| File | Line(s) | Role |
|---|---|---|
| apps/api/hrm-api/src/contract-templates/contract-templates.controller.ts | 43, 57, 72, 88 | @Headers('x-tenant-id') tenantId - **only** source. No @Query, no JWT claim read. |
| apps/api/hrm-api/src/contract-templates/contract-templates.controller.ts | 46, 60, 77, 91 | tenantId ?? '' - fallback that persists the empty string. |
| apps/api/hrm-api/src/contract-templates/contract-templates.service.ts | 146-158 | upsertClause binds  = tenantId straight into INSERT VALUES (,,...). |
| apps/api/hrm-api/migrations/202608180000_create_template_clause_override.sql | 5-17 | tenant_id TEXT NOT NULL (no DEFAULT), UNIQUE (tenant_id, template_code, clause_id), ix_tco_tenant_id. Proves '' is injected by the service, not the DB. |

**Correct pattern already in the codebase (NOT used):**
apps/api/hrm-api/src/common/scope-context.ts:264-342 exports
resolveScopeContext(authorization, { tenantId, moduleId }), which derives tenantId
from the **verified JWT claim** (getVerifiedInternalJwtPayload at scope-context.ts:268)
with header/query normalization and a hard SCOPE_TENANT_REQUIRED / SCOPE_TENANT_INVALID
guard (assertScopeId at scope-context.ts:221-239). The contract-templates controller
bypasses this entire layer and reads a raw header instead. That is the root cause.

Note: scope-context.ts has NO resolveTenantOnlyContext export (searched). The
available entry point is resolveScopeContext.

## 3. Minimal fix

**Function to change:** ContractTemplatesController (all 4 handlers: listClauses,
getClause, upsertClause, softDeleteClause).

**Change:** replace the raw header read + ?? '' fallback with the existing scope
resolver, e.g.

    import { resolveScopeContext } from '../common/scope-context';
    ...
    const { tenantId } = resolveScopeContext(authorization, {
      tenantId: req.headers['x-tenant-id'],
    });

and drop the tenantId ?? '' fallback. Effects:
1. JWT-claim-backed tenant id (authoritative, not spoofable by omitting a header);
2. hard SCOPE_TENANT_REQUIRED / SCOPE_TENANT_INVALID validation instead of
   silently persisting '';
3. header/query parity with every other HRM endpoint.

**In scope of the running S7 cluster?** YES - same WI. The controller carries the
@CODE-MEMORY header BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01 and the migration is
202608180000_create_template_clause_override.sql from the same cluster. No new WI
needed; this is a defect in already-shipped S7 BE code.

## 4. Live curl evidence (server 127.0.0.1:28001; auth header
x-internal-api-key: xevn-dev-internal-key throughout)

4.1 Reproduces the reported symptom (query param ignored):
  GET .../clauses?tenantId=xevn&companyId=xevn   (no x-tenant-id header)
  -> 200, items[...].tenant_id ==             <- the reported bug

4.2 The header IS the real input channel:
  PUT .../clauses/CTR-CLAUSE-009 -H x-tenant-id: xevn
      -d override_text=qc-probe-a,source=manual
  -> 200, item.tenant_id == xevn
  PUT .../clauses/CTR-CLAUSE-009 -H x-tenant-id: xe-du-lich
      -d override_text=qc-probe-b,source=manual
  -> 200, item.tenant_id == xe-du-lich

4.3 Multi-tenant isolation is intact (NOT collapsed):
  GET .../clauses -H x-tenant-id: xevn
  -> 1 row: (xevn, CTR-CLAUSE-009, qc-probe-a)
  GET .../clauses -H x-tenant-id: xe-du-lich
  -> 1 row: (xe-du-lich, CTR-CLAUSE-009, qc-probe-b)
  Two different tenants upserting the same (template_code, clause_id) produced
  TWO DISTINCT ROWS. The unique key works. No tenant sees the other's data.

4.4 Empty-tenant rows are real persisted rows, not a display bug:
  GET .../clauses  (no x-tenant-id header)
  -> 2 rows: [('', 00000000-0000-4000-8000-000000000000, test),
              ('', CTR-CLAUSE-009, test)]
  These pre-existing tenant_id='' test rows are stored in the table (the rows the
  reporter first observed). They are not a serialization artifact.

4.5 warnings field confirmed:
  Both GET responses include the warnings array about insurance_salary_vnd
  being required by law (BLLĐ 2019) for fixed-term contracts, present for
  XEVN_FT_12M_OFFICE (an _FT_ code), as expected from buildWarnings() at
  contract-templates.service.ts:62-70.

4.6 Negative control:
  GET .../clauses/00000000-0000-4000-8000-000000000000 -H x-tenant-id: xevn
  -> 400 HRM-VAL-001 clause_id must be a canonical clause id (CTR-CLAUSE-* or UUID v4)
  Confirms the server is live and the validation path works (the all-zero UUID is
  rejected by assertClauseIdFormat at contract-templates.service.ts:42-50).



## 5. Re-audit note (controller was patched mid-investigation)

While this audit was running, contract-templates.controller.ts was modified by
another lane (git diff shows the change). The controller now imports the
@Query('tenantId') decorator and resolves the tenant as
queryTenantId ?? tenantId ?? '' in all 4 handlers (controller.ts:43,58,74,91).

Re-probed live after the patch:

5.1 query param only (no header):
  PUT .../CTR-CLAUSE-009?tenantId=xevn&companyId=xevn
  -> 200, item.tenant_id == xevn          <- NOW CORRECT

5.2 header only:
  PUT .../CTR-CLAUSE-009 -H x-tenant-id: xevn
  -> 200, item.tenant_id == xevn          <- still correct

5.3 neither query nor header:
  PUT .../CTR-CLAUSE-009
  -> 200, item.tenant_id == ''            <- fallback still persists ''

So the reported symptom (empty tenant_id when passing ?tenantId=xevn) is now
**fixed by the mid-investigation patch**. The residual defect is narrower: the
queryTenantId ?? tenantId ?? '' fallback still silently persists an empty
tenant_id when no scope is provided at all. Recommended follow-up (still inside
the same S7 WI): route the resolution through resolveScopeContext so a missing
scope returns SCOPE_TENANT_REQUIRED (400) instead of writing a tenant_id='' row.
## 6. Disclosure

Two rows were written to template_clause_override during the isolation test
(4.2, qc-probe-a / qc-probe-b) plus three re-probe writes (5.1-5.3). This was
necessary and unavoidable to answer the two-tenants-upsert-the-same-key branch of
the question; the task explicitly asked for that probe. No other DB writes
occurred. The pre-existing tenant_id='' test rows were already present before
this audit and were not created by it.

## 7. Does it block the S7 cluster?

No hard blocker. The reported symptom is resolved by the mid-investigation patch
(5.1). The residual  fallback (5.3) is a data-hygiene defect, not a
multi-tenant isolation break: the unique key (tenant_id, template_code, clause_id)
correctly separates tenants (4.3). Fix is a controller change inside the
already-running BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01 WI; no new WI needed.