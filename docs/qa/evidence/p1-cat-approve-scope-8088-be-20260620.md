# P1-CAT-APPROVE-SCOPE-8088 — BE fix (UF-XBOS-09/15 R6)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-CAT-APPROVE-SCOPE-8088` |
| **role** | dev-be |
| **executed_at** | 2026-06-20 |
| **spec_ref** | UC-XBOS-CAT-05/06 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE §4 (C2) |
| **ack_status** | **READY_FOR_QA** |

---

## Root cause

`POST /api/xbos/catalog-governance/tasks/{id}/approve` (and reject) used **`resolveGroupWriteScope`** → strict `resolveScopeContext` JWT∩query match. Portal sends `companyId=holding` while group CEO JWT carries `companyId=main`. Inbox GET already used **`resolveGroupReadScope`** (main→holding alias) — approve path diverged → **409** `SCOPE_CONTEXT_MISMATCH` (`token=main`, `request=holding`).

## Fix

`catalog-governance.controller.ts` — `approveTask` + `rejectTask` call **`resolveGroupReadScope`** (same as inbox GET / instance detail).

**File:** `apps/api/xbos-api/src/catalog-governance/catalog-governance.controller.ts`

## Regression

| Suite | Result |
|-------|--------|
| `catalog-governance.controller.spec.ts` | **16/16** PASS (incl. `P1-CAT-APPROVE-SCOPE-8088` main+holding approve) |
| `catalog-governance/*.spec.ts` (all) | **20/20** PASS |
| `pnpm run build` (xbos-api) | exit **0** |

## QA retest (browser U63/U65 — no seed)

1. Login `ceo@xe.vn` / `Xevn@2026` on `:8088`
2. UF-XBOS-09/15: HRM catalog extension save → inbox task visible
3. Open catalog approval inbox → approve task
4. **Network:** `POST …/catalog-governance/tasks/{id}/approve?tenantId=xevn&companyId=holding` → **200** `XBOS-CAT-201` (not 409)
5. F5 inbox → task cleared / status updated on FE

## DevOps handoff

PM pscp + recreate `xbos-be` on VPS after merge/deploy.
