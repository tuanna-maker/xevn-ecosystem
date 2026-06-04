# UC-373 Test Strategy — XeVN Ecosystem

**work_item_id:** `UC-373-TEST-PROGRAM-01`  
**Owner:** QA Lead  
**Catalog source:** [`docs/ecosystem/BANG_TONG_HOP_USECASE_XEVN.md`](../ecosystem/BANG_TONG_HOP_USECASE_XEVN.md) (373 unique UC codes)  
**Generated coverage:** [`evidence/uc-373-coverage.json`](evidence/uc-373-coverage.json) via `pnpm run test:uc:catalog`

## Reality (honest scope)

| Claim | Truth |
|-------|--------|
| «373 unit test files» | **Not feasible** in one cycle — SRS catalog spans XBOS, HRM, Logistic Phase 2, mobile, portal. |
| «373 UC tested» | **Layered program** — L1 API UAT + L2 pilot routes + L3 package unit tests + L4 per-UC map (`planned` \| `unit` \| `integration` \| `e2e` \| `waived`). |
| PASS for release pilot | L0–L2 gates per [`business-flow-zero-defect-gate`](../../.cursor/rules/business-flow-zero-defect-gate.mdc) — not 100% UC automation. |

## Test layers

| Layer | Command | What it proves |
|-------|---------|----------------|
| **L0** | `pnpm run qc:dev-stack` | HRM + XBOS + portal health 200 |
| **L1** | `pnpm run test:system:uat` | Live API + Postgres: auth, scope, attendance, leave, payroll (37+ phases) |
| **L2** | `pnpm run test:pilot:flows` | Command Center proxy smoke P-CC-01..04 (+ scripted checks) |
| **L3a** | `pnpm --filter hrm-api test` | Nest Jest modules (attendance, payroll, employees, …) |
| **L3b** | `pnpm --filter xbos-api test` | XBOS Jest (auth, assets, scope, …) |
| **L3c** | `cd apps/web/hrm && pnpm test` | Vitest (portal bridge, data mode) |
| **L3d** | `cd apps/web/web-portal && pnpm test` | Vitest (auth session, HRM client errors) |
| **L4** | `pnpm run test:uc:catalog` | Each UC → coverage `covered` \| `partial` \| `none` + evidence refs |
| **Gate** | `pnpm run phase1:gate` | Phase 1 bootstrap + matrix doc freshness |

## L4 catalog rules

Script: [`scripts/uc-test-catalog.mjs`](../../scripts/uc-test-catalog.mjs)

| Signal | `level` | `coverage` |
|--------|---------|------------|
| UC string in `*.spec.ts` / `*.test.ts` | `unit` | `covered` |
| Module block spec (e.g. `attendance/` for `HRM-AT-*`) | `unit` | `partial` or `covered` |
| Mapped in `test:system:uat` phases | `integration` | `partial`+ |
| Mapped in `test:pilot:flows` / matrix P-CC-* | `e2e` | `covered` |
| Phase 2 `LG-*` without API | `planned` | `none` or `partial` if API hint only |
| No automation | `planned` | `none` |

**PM scheduling:** prioritize `none` + Phase 1 (`P1`) + Command Center / HRM pilot UC codes in gap list from JSON `entries` where `coverage === "none"`.

## Accounts & env

| Flow | Account |
|------|---------|
| Portal / L2 | `ceo@xe.vn` / `Xevn@2026` |
| Mobile UAT L1 | `uat.nv####@xe.vn` / `xevn-uat-2026` |
| Env file | `deploy/xevn-ecosystem/.env` |

## Evidence paths

| Artifact | Path |
|----------|------|
| UC map JSON | `docs/qa/evidence/uc-373-coverage.json` |
| Test run log | `docs/qa/evidence/uc-373-test-run-20260522.md` |
| L1 UAT | `docs/qa/evidence/system-integration-uat-report.json` |
| L2 pilot | `docs/qa/evidence/pilot-business-flow-*.md` |
| Pilot matrix | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |

## Dev waves (PM backlog hint)

1. **Wave A — P1 pilot UC:** UC-HRM-21..25, UC-ECO-SCOPE-*, UC-CC-P0-* — extend L2 script to P-CC-05..08; keep L1 green.  
2. **Wave B — XBOS platform:** UC-RACI-*, UC-XBOS-WF-*, catalog-governance — add focused controller specs + UAT phases.  
3. **Wave C — Phase 2 Logistic:** 128 `LG-*` — `planned` until logistic API exists; no false `covered`.  

## Acceptance for this work item

- [x] Strategy doc + catalog script + `test:uc:catalog` script  
- [x] Runnable L1–L3 commands executed with logged exit codes  
- [x] Coverage % reported — **not** claiming 373 physical unit files  
