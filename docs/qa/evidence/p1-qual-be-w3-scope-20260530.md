# P1-QUAL-BE-W3-SCOPE — catalog-extensions scope hardening

| Field | Value |
|-------|-------|
| **work_item_id** | P1-QUAL-BE-W3-SCOPE |
| **role** | dev-be |
| **date** | 2026-05-30 |
| **parent_audit** | `docs/qa/evidence/p1-qual-tm-01-20260530.md` |
| **ack_status** | **READY_FOR_QA** |
| **scope_parity** | **PASS** (in-scope CE-01..03); CE-04/05 deferred |

---

## Completion summary

| ID | Fix | File |
|----|-----|------|
| **SCOPE-01** | `syncSalesData` uses `scopedList` → `company_id = ANY(...)` on UPDATE (group CEO `main` rollup) | `catalog-extensions.service.ts` |
| **SCOPE-02** | `deleteFaceData` peeks row by `employee_id`, `assertResourceInHrmScope`, deletes by stored `company_id` | same |
| **SCOPE-03** | `createBonusPolicyParticipant` peeks `hrm_bonus_policies`, asserts policy in scope; persists participant `company_id` from policy row | same |

**Deferred (per dispatch):**

| ID | Item | Reason |
|----|------|--------|
| SCOPE-04 | `files/upload` `company_id` + scoped storage path | P1 — not in this wave |
| SCOPE-05 | Profile asset row-level `assertResourceInHrmScope` | P3 — defense-in-depth only |

---

## Regression tests

`apps/api/hrm-api/src/catalog-extensions/catalog-extensions.service.spec.ts`:

- `syncSalesData` — ANY rollup + `company_ids` in response (group CEO JWT)
- `deleteFaceData` — peek/delete params; `HRM-FACE-409` when row outside rollup
- `createBonusPolicyParticipant` — policy peek + `holding` company from policy; `HRM-BONUS-409` on mismatch

---

## Verification

```bash
pnpm --filter hrm-api test
# 2026-05-30: 46 suites, 288 tests, exit 0
```

**QA suggested (L0/L2):**

```bash
pnpm run qc:fe-be-health
# Group CEO: POST /api/hrm/sales-data/sync?company_id=main
# DELETE /api/hrm/face-data/:employeeId?company_id=main
# POST /api/hrm/bonus-policies/participants (policy in holding scope)
```

Account: `ceo@xe.vn` / `Xevn@2026` — J-* per `docs/program/PROGRAM_JOURNEY_MAP.md` if W3 catalog tab in scope.

---

## Handoff

- **completion_report:** Closed TM items CE-01..03 for catalog-extensions; jest added; full hrm-api test PASS. CE-04 upload tenancy and CE-05 profile asset assert deferred.
- **next_owner:** qa
- **next_dispatch_prompt:** Retest P1-QUAL W3 catalog-extensions scope: work_item_id P1-QUAL-QA-W3-SCOPE. Run `pnpm run qc:fe-be-health` then group CEO `ceo@xe.vn`: (1) POST `sales-data/sync?company_id=main` — member-company rows get `synced_at`; (2) DELETE face-data for seeded employee under member slug — 200 not cross-scope delete; (3) POST bonus participant with valid `policy_id` in holding — 201, invalid/out-of-scope policy — 409. Evidence: update this file + `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` if routes touched. ack_status PASS_TO_PM or FAIL with J-* ids.
- **evidence_path:** `docs/qa/evidence/p1-qual-be-w3-scope-20260530.md`
- **ack_status:** READY_FOR_QA
- **pm_dispatch_hint:** P1-QUAL-QA-W3-SCOPE — L2.5 J-* for payroll/sales/bonus tabs if in sprint matrix
