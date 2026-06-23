# Dev-FE evidence — P1-PHASE1-FE-MEMCC-01 (2026-06-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-FE-MEMCC-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **closes** | **C-MEMCC-01** (scope layer — browser L2.5 CC iframe retest required) |
| **persona** | Member CEO `du-lich.ceo@xe.vn` / `Xevn@2026` |
| **pilot** | `https://14-225-217-232.nip.io` |

---

## Root cause

Member CEO CC embed `/command-center/hrm/*` could resolve **master placeholder** tenant (`xevn`) before `GlobalFilter` finished loading, producing iframe `tenantId=xevn` + wrong HRM scope (404/409/empty). Secondary: CC shell only read `sessionStorage` while HRM bridge mirrored JWT to `localStorage` → `/login` redirect without React session.

---

## Fix summary

| Area | Change |
|------|--------|
| `identityScope.ts` | JWT member tenant wins over master placeholder hint; member `companyId=main` from JWT/hints |
| `GlobalFilterContext.tsx` | Default membership prefers `getJwtTenantId()` before env default |
| `HrmWorkspaceRoute.tsx` | Wait `tenantScopeStatus=ready` before mounting iframe |
| `authSession.ts` | Re-hydrate `sessionStorage` from `localStorage` mirror (embed bridge) |
| Tests | `identityScope`, `paths`, `authSession`, `hrmApiClient` member scope regressions |

---

## Automated verification

```powershell
pnpm --filter web-portal test   # 148/148 PASS
pnpm --filter web-portal build  # exit 0
```

---

## Pilot smoke (API + shell, 2026-06-05)

```powershell
# Login member CEO
POST https://14-225-217-232.nip.io/api/xbos/auth/login
# → success; membership tenantId=xe-du-lich, companyId=main, role=subsidiary_ceo

GET /api/hrm/employees?company_id=main
  Headers: Authorization, x-tenant-id=xe-du-lich, x-company-id=main
# → 200, total=18

GET /command-center/hrm/employees (authenticated)
# → 200 (shell HTML)

GET /hr/employees?portal=1&tenantId=xe-du-lich&companyId=main
# → 200 (iframe HTML, len≈1400) — same for dashboard/contracts/attendance/payroll
```

No `409 companyId mismatches` on probed HRM list path.

---

## QA retest scope (L2.5)

| J-ID / route | Account | Click path |
|--------------|---------|------------|
| CC iframe | `du-lich.ceo@xe.vn` | Login UI → `/command-center` → sidebar HRM tabs (`employees`, `contracts`, …) |
| Deep link | same | `/command-center/hrm/employees/:id` list→profile |
| Negative | same | No `HRM API Sync ERROR`, no `54321`, no scope 409 banner |

---

## completion_report

- **Closed:** FE scope alignment for member CEO CC HRM embed — `resolveIdentityScope`, tenant picker, iframe gate, session hydrate, proxy header contract (`x-tenant-id` / `x-company-id` + query `companyId=main`).
- **Residual:** Browser L2.5 CC iframe click-path on nip.io (QA-owned); prior MCP form-login quirk may still affect automation — manual UI login acceptable.

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: P1-W6-QA-MEMCC-01
from_role: pm
to_role: qa
entry_criteria: dev-fe P1-PHASE1-FE-MEMCC-01 READY_FOR_QA — evidence docs/qa/evidence/p1-phase1-fe-memcc-20260605.md; member CEO du-lich.ceo@xe.vn on https://14-225-217-232.nip.io.
exit_criteria: Browser L2.5 PASS — UI login → /command-center/hrm/* tabs load iframe without 404/409/empty; J-HRM-01..07 via CC shell where applicable; no 54321; evidence docs/qa/evidence/p1-w6-qa-memcc-20260605.md; ack_status PASS_TO_PM or FAIL with defect id.
evidence_path: docs/qa/evidence/p1-w6-qa-memcc-20260605.md
ack_status: PASS_TO_PM
```

## pm_dispatch_hint

- Close **C-MEMCC-01** on QA PASS; update `p1-phase1-qc-full-rbac-20260604.md` + bus.
- If FAIL scope-only → re-dispatch **dev-fe** with route/J-id; if auth-only → check JWT wave **P1-EX-QA-JWT-CLOSE-01**.

## ack_status

**READY_FOR_QA**
