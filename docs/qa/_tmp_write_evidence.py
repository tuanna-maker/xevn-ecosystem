import os

base = 'docs/qa/evidence'
real = os.path.realpath(base)
os.makedirs(real, exist_ok=True)
p = os.path.join(real, 'qc-s7-tenant-id-empty-01.md')

content = r'''# QC-S7-TENANT-ID-EMPTY-01 - Live Audit of `contract-templates` tenant_id handling

**work_item_id:** `QC-S7-TENANT-ID-EMPTY-01`
**auditor:** qc lane (read-only investigation)
**target:** HRM BE `:28001` `/api/hrm/contract-templates`
**verdict:** **REAL BUG** (contract/parameter mismatch - not a probe artifact)
**ack_status:** `PASS_TO_PM`

---

## 1. Verdict

**REAL BUG.** The empty `tenant_id` is not a DB default artifact. It is produced by a
**parameter-name mismatch between the client and the controller**:

- The probe (and the S7 spec's BE contract) passes the tenant as a **query parameter**
  `?tenantId=xevn`.
- The controller reads the tenant from the **`x-tenant-id` HTTP header only**
  (`@Headers('x-tenant-id')`), and falls back to `''` when the header is absent.

Because the query param is silently ignored, every request that omits the header
upserts a row with `tenant_id = ''`. The DB has no default for `tenant_id`
(`NOT NULL`, no `DEFAULT` in the migration), so the empty string is 100% the
controller's `tenantId ?? ''` fallback, not a DB artifact.

**It is NOT a multi-tenant isolation collapse.** The unique key
`(tenant_id, template_code, clause_id)` still separates tenants correctly when the
header is present - verified live (section 4, probes C/D). Severity is
**contract-breaking + data-hygiene**, not tenant leakage.

---

## 2. Exact code path that produces `tenant_id=""`

| File | Line(s) | Role |
|---|---|---|
| `apps/api/hrm-api/src/contract-templates/contract-templates.controller.ts` | 43, 57, 72, 88 | `@Headers('x-tenant-id') tenantId` - **only** source of the tenant id. No `@Query('tenantId')`, no `@Query('tenant_id')`, no JWT claim read. |
| `apps/api/hrm-api/src/contract-templates/contract-templates.controller.ts` | 46, 60, 77, 91 | `tenantId ?? ''` - fallback to empty string when header missing. |
| `apps/api/hrm-api/src/contract-templates/contract-templates.service.ts` | 146-158 | `upsertClause` binds `$2 = tenantId` straight into `INSERT ... VALUES ($1, $2, ...)`. No normalization, no default. |
| `apps/api/hrm-api/migrations/202608180000_create_template_clause_override.sql` | 5-17 | `tenant_id TEXT NOT NULL` (no `DEFAULT`), `UNIQUE (tenant_id, template_code, clause_id)`, `ix_tco_tenant_id`. Confirms the DB cannot invent `''`; the value is injected by the service. |

**Contrast with the correct pattern that exists in the same codebase:**
`apps/api/hrm-api/src/common/scope-context.ts:264-342` exports
`resolveScopeContext(authorization, { tenantId, moduleId })`, which derives
`tenantId` from the **verified JWT claim** (`getVerifiedInternalJwtPayload`,
`scope-context.ts:268`) with header/query normalization and a
`SCOPE_TENANT_REQUIRED` guard (`assertScopeId`, `scope-context.ts:221-239`).
The contract-templates controller does **not** call `resolveScopeContext` - it
bypasses the whole scope-resolution layer and reads a raw header. That is the
root cause.

Note: `scope-context.ts` does not define a `resolveTenantOnlyContext` export
(searched). The available entry point is `resolveScopeContext`.

---

## 3. Minimal fix

**Function to change:** `ContractTemplatesController` (all four handlers:
`listClauses`, `getClause`, `upsertClause`, `softDeleteClause`).

**Change:** replace the raw header read + `?? ''` fallback with the existing
scope resolver, e.g.

```ts
import { resolveScopeContext } from '../common/scope-context';
...
const { tenantId } = resolveScopeContext(authorization, {
  tenantId: req.headers['x-tenant-id'],
});
```

and drop the `tenantId ?? ''` fallback. This gives:
1. JWT-claim-backed tenant id (authoritative, cannot be spoofed by omitting a header);
2. `SCOPE_TENANT_REQUIRED` / `SCOPE_TENANT_INVALID` hard validation instead of
   silently persisting `''`;
3. header/query parity with every other HRM endpoint.

**In scope of the running S7 cluster?** **YES - same WI.**
`contract-templates.controller.ts` carries the `@CODE-MEMORY` header
`BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01` and the migration is
`202608180000_create_template_clause_override.sql` from the same cluster.
No new WI needed; this is a defect in already-shipped S7 BE code.

---

## 4. Live curl evidence (all read-only probes; server `127.0.0.1:28001`)

Auth header used throughout: `-H "x-internal-api-key: xevn-dev-internal-key"`.

### 4.1 Reproduces the reported symptom (query param ignored)

```
GET .../clauses?tenantId=xevn&companyId=xevn   (no x-tenant-id header)
-> 200, items[...].tenant_id == ""            <- the reported bug
```

### 4.2 The header IS the real input channel

```
PUT .../clauses/CTR-CLAUSE-009  -H "x-tenant-id: xevn"  body {"override_text":"qc-probe-a","source":"manual"}
-> 200, item.tenant_id == "xevn"

PUT .../clauses/CTR-CLAUSE-009  -H "x-tenant-id: xe-du-lich"  body {"override_text":"qc-probe-b","source":"manual"}
-> 200, item.tenant_id == "xe-du-lich"
```

### 4.3 Multi-tenant isolation is intact (NOT collapsed)

```
GET .../clauses -H "x-tenant-id: xevn"
-> 1 row: [("xevn","CTR-CLAUSE-009","qc-probe-a")]

GET .../clauses -H "x-tenant-id: xe-du-lich"
-> 1 row: [("xe-du-lich","CTR-CLAUSE-009","qc-probe-b")]
```

Two different tenants upserting the same `(template_code, clause_id)` produced
**two distinct rows** - the unique key works. No tenant sees the other's data.

### 4.4 Empty-tenant rows are real persisted rows, not a display bug

```
GET .../clauses  (no x-tenant-id header)
-> 2 rows: [("", "00000000-0000-4000-8000-000000000000", "test"),
            ("", "CTR-CLAUSE-009", "test")]
```

These pre-existing `tenant_id=""` rows are stored in the table (they are the
"test" rows the reporter first observed). They are not a serialization artifact.

### 4.5 `warnings` field confirmed

Both GET responses include:
`"warnings":["insurance_salary_vnd is required by law (BLLĐ 2019 Đ.168) for fixed-term contracts. Ensure the compensation pack line has insurance_salary_vnd set."]`
- present for `XEVN_FT_12M_OFFICE` (an `_FT_` code), as expected from
`buildWarnings()` at `contract-templates.service.ts:62-70`.

### 4.6 Negative control

```
GET .../clauses/00000000-0000-4000-8000-000000000000 -H "x-tenant-id: xevn"
-> 400 HRM-VAL-001 "clause_id '...' must be a canonical clause id (CTR-CLAUSE-* or UUID v4)"
```
Confirms the server is live and the validation path works (the all-zero UUID is
rejected by `assertClauseIdFormat`, `contract-templates.service.ts:42-50`).

---

## 5. Disclosure

Two rows were written to `template_clause_override` during the isolation test
(section 4.2, `qc-probe-a` / `qc-probe-b`). This was **necessary and unavoidable**
to answer the "two tenants upsert the same key" branch of the question; the task
asked for that exact probe. No other DB writes occurred. The pre-existing
`tenant_id=""` "test" rows were already present before this audit and were not
created by it.

## 6. Does it block the S7 cluster?

**No hard blocker, but it must be fixed before S7 is signed off.** The BE
contract in `BA-CTR-TPL-8-CLAUSE-MAP-01-S7-IMPL-01.md` §2 implies a
tenant-scoped upsert; persisting `tenant_id=""` rows violates §1.1
(`tenant_id` is tenant-scoped, indexed, part of the unique key) and breaks any
consumer that keys off the query parameter. Fix is a controller change
inside the already-running `BA-CTR-TPL-8-CLAUSE-MAP-01-S7-BE-01` WI.
'''

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)
print('written:', p)
print('exists:', os.path.exists(p), 'bytes:', os.path.getsize(p))