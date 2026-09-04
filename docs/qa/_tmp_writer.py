import os

p = os.path.join(os.path.realpath('docs/qa/evidence'), 'qc-s7-tenant-id-empty-01.md')

chunk = '''
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
  -> 200, items[...].tenant_id == ""            <- the reported bug

4.2 The header IS the real input channel:
  PUT .../clauses/CTR-CLAUSE-009 -H "x-tenant-id: xevn"
      -d {"override_text":"qc-probe-a","source":"manual"}
  -> 200, item.tenant_id == "xevn"
  PUT .../clauses/CTR-CLAUSE-009 -H "x-tenant-id: xe-du-lich"
      -d {"override_text":"qc-probe-b","source":"manual"}
  -> 200, item.tenant_id == "xe-du-lich"

4.3 Multi-tenant isolation is intact (NOT collapsed):
  GET .../clauses -H "x-tenant-id: xevn"
  -> 1 row: [("xevn","CTR-CLAUSE-009","qc-probe-a")]
  GET .../clauses -H "x-tenant-id: xe-du-lich"
  -> 1 row: [("xe-du-lich","CTR-CLAUSE-009","qc-probe-b")]
  Two different tenants upserting the same (template_code, clause_id) produced
  TWO DISTINCT ROWS. The unique key works. No tenant sees the other's data.

4.4 Empty-tenant rows are real persisted rows, not a display bug:
  GET .../clauses  (no x-tenant-id header)
  -> 2 rows: [("", "00000000-0000-4000-8000-000000000000", "test"),
              ("", "CTR-CLAUSE-009", "test")]
  These pre-existing tenant_id="" test rows are stored in the table (the rows the
  reporter first observed). They are not a serialization artifact.

4.5 warnings field confirmed:
  Both GET responses include the warnings array about insurance_salary_vnd
  being required by law (BLLĐ 2019) for fixed-term contracts, present for
  XEVN_FT_12M_OFFICE (an _FT_ code), as expected from buildWarnings() at
  contract-templates.service.ts:62-70.

4.6 Negative control:
  GET .../clauses/00000000-0000-4000-8000-000000000000 -H "x-tenant-id: xevn"
  -> 400 HRM-VAL-001 "clause_id ... must be a canonical clause id
     (CTR-CLAUSE-* or UUID v4)"
  Confirms the server is live and the validation path works (the all-zero UUID is
  rejected by assertClauseIdFormat at contract-templates.service.ts:42-50).
'''

with open(p, 'a', encoding='utf-8') as f:
    f.write(chunk)
print('bytes=', os.path.getsize(p), 'exists=', os.path.exists(p))