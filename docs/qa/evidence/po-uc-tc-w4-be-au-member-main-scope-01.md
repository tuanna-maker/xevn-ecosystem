# Evidence — PO-UC-TC-W4-BE-AU-MEMBER-MAIN-SCOPE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W4-BE-AU-MEMBER-MAIN-SCOPE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-04 |
| **change_mode** | FIX (regression lock + ADR waiver) |
| **u65_zero_seed** | true |
| **residual_closed** | `R-W4-B1-AU-MEMBER-MAIN-200` |
| **spec_ref** | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE` §5 · `ADR-HRM-RBAC-SCOPE-LADDER` (member `companyId=main`) |

---

## Verdict

**ADR-WAIVER (intentional 200 on own bucket)** — not a holding rollup leak.

| Claim | Result |
|-------|--------|
| Member JWT must not list **holding / group rollup** as self-scope | **PASS** — `resolveHrmListScope` keeps `companyIds=['main']` + `memberTenantId`; live total **0** vs group CEO total **59** |
| Member + `xevn`/`main` (group headers) | **409** `SCOPE_CONTEXT_MISMATCH` |
| Member + `company_id=holding` | **409** `SCOPE_CONTEXT_MISMATCH` |
| Member + own `xe-du-lich`/`main` | **200** `HRM-EMP-200` — ADR §5 operating bucket (same slug `main`, different **tenant**) |
| Group CEO `main` five-slug rollup | **must_keep PASS** — live total 59; Jest still expands `GROUP_MEMBER_SLUGS` |

Rejecting member own `company_id=main` with 403/409 would **break** subsidiary CEO employee list (ADR §5 + RBAC ladder membership `MEMBER_DEFAULT_COMPANY_ID=main`).

---

## Root cause (QA PARTIAL reinterpret)

QA W4-B1 probe (`scripts/qa/_tmp-po-uc-tc-w4-qa-b1-hrm-im-browser.mjs`):

```text
member login → GET /api/hrm/employees?company_id=main + x-company-id=main
expect 403/409 → got 200 → PARTIAL
```

Collision: portal slug **`main`** is shared by group CEO (`tenantId=xevn`) and member CEO (`tenantId=xe-du-lich`). TC text «member vượt scope» maps to **holding / xevn headers**, not member’s own operating bucket.

Live (2026-08-04, zero-seed):

```text
groupCEO     GET company_id=main + x-tenant-id=xevn           → 200 HRM-EMP-200 total=59
memberOwn    GET company_id=main + x-tenant-id=xe-du-lich     → 200 HRM-EMP-200 total=0  holdingLeak=false
memberAU     x-tenant-id=xevn + company_id=main               → 409 SCOPE_CONTEXT_MISMATCH
memberAU     company_id=holding                               → 409 SCOPE_CONTEXT_MISMATCH
JWT          tenantId=xe-du-lich companyId=main role=subsidiary_ceo
```

---

## Code / test delta

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/common/hrm-list-scope.ts` | `@CODE-MEMORY-CHANGE` PO-UC-TC-W4 — ADR §5 lock (no behavior widen) |
| `apps/api/hrm-api/src/common/hrm-list-scope.spec.ts` | Member main ≠ group rollup + SQL tenant filter; must_keep group CEO expand |
| `apps/api/hrm-api/src/common/scope-context.spec.ts` | Own main accept; xevn/main 409; holding 409 |

**Jest:** `hrm-list-scope.spec` + `scope-context.spec` → **51/51 PASS**

**Health:** `pnpm run qc:fe-be-health` → ALL PASS

**Cấm / must_keep:** no seed · no Leave L2 · IM-01/02/04 untouched · AT-12 / CREATE-CATALOG / CI01 / BR-WF-04 untouched · Group CEO rollup not weakened

---

## Corrected AU matrix for QA retest (IM-03 SCOPE-AU only)

| Case | Request | Expect |
|------|---------|--------|
| **AU-1** (vượt scope) | `du-lich.ceo` + `company_id=holding` | **409** |
| **AU-2** (vượt scope) | `du-lich.ceo` + `x-tenant-id=xevn` + `company_id=main` | **409** |
| **AU-3** (own bucket) | `du-lich.ceo` + `x-tenant-id=xe-du-lich` + `company_id=main` | **200**; total **≠** group CEO rollup total; no holding rows |
| **must_keep** | `ceo@xe.vn` + `company_id=main` | **200** rollup (total ≫ member) |

> Do **not** fail AU solely because member own `main` returns 200 — that is ADR §5.

---

## Handoff

```
ack_status: READY_FOR_QA
work_item_id: PO-UC-TC-W4-BE-AU-MEMBER-MAIN-SCOPE-01
evidence_path: docs/qa/evidence/po-uc-tc-w4-be-au-member-main-scope-01.md
next_owner: qa
uat_done: false
```

### next_dispatch_prompt

```
work_item_id: PO-UC-TC-W4-QA-IM03-AU-MEMBER-MAIN-01
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM
priority: P1
u65_zero_seed: true

Retest TC-HRM-IM-03-SCOPE-AU only (Import/Export NV — not BH).
READ: docs/qa/evidence/po-uc-tc-w4-be-au-member-main-scope-01.md
Persona: du-lich.ceo@xe.vn / Xevn@2026
Matrix:
  AU-1 holding → 409
  AU-2 xevn+main headers → 409
  AU-3 own xe-du-lich+main → 200 + no holding leak (total ≠ ceo@xe.vn rollup)
must_keep: Group CEO main rollup still 200; IM-01/02/04 UI_PASS untouched
CẤM: seed · invent Leave L2 · claim UAT DONE
Update by-uc HRM-IM-03 execution if AU matrix PASS; residual R-W4-B1 close or reopen with leak proof.
```
