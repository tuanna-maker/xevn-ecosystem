# TM Sprint 0 Technical Review — P1-S0-TM-01

| Field | Value |
|-------|-------|
| work_item_id | P1-S0-TM-01 |
| program | PHASE1-SCRUM-S0 |
| reviewer | Technical Manager |
| reviewed_at | 2026-05-23 |
| ack_status | **PASS_TO_PM** |
| verdict | **GO WITH CONDITIONS** (not release GO) |

## Scope reviewed

| Slice | Artifact paths | TM status |
|-------|----------------|-----------|
| HRM embed API data mode | `apps/web/hrm/src/lib/hrmDataMode.ts`, `portalAuthBridge.ts`, `hooks/useEmployee.ts`, `hooks/useEmployees.ts`, `hooks/useContracts.ts`, `hooks/useDepartments.ts`, `integrations/hrmApi.ts`, `contexts/AuthContext.tsx` | **APPROVE** with conditions |
| HRM vitest | `apps/web/hrm` — `pnpm test` | **PASS** (5 files, 15 tests) |
| web-portal vitest (P1-S0-FE-02) | `apps/web/web-portal/vitest.config.ts` + `vite.config.ts` | **BLOCK** — mergeConfig + callback vite |
| Optional `GET /employees/:id` (P1-S0-BE-01) | `apps/api/hrm-api/src/employees/employees.controller.ts` | **NOT PRESENT** — client list-scan acceptable for S0 pilot |

## Executive assessment

Embed API mode is architecturally sound: a single gate (`shouldSkipSupabaseDataFetches`) composes `isHrmApiDataMode()` with portal session detection, and `loadEmployee` is testable via a pure loader. Portal JWT is read from sessionStorage keys aligned with web-portal `authSession.ts`; dev-only `x-internal-api-key` fallback is gated on `import.meta.env.DEV`.

Sprint 0 **cannot** claim “vitest portal PASS” until P1-S0-FE-02 resolves `Cannot merge config in form of callback` (vite `defineConfig(({ mode }) => …)` merged via `mergeConfig` in vitest.config.ts).

`GET /employees/:id` is optional for S0; current `getEmployeeById` paginates `listEmployees` with `clampHrmPageSize(100)` per company — acceptable for pilot tenants with ≤100 rows per company; schedule dedicated endpoint (P1-S3-BE-02 / P1-S0-BE-01) before scale.

## SOLID checklist — `apps/web/hrm` hooks + lib

| Principle | Finding | Risk |
|-----------|---------|------|
| **S** | `hrmDataMode.ts` owns mode flags only; `portalAuthBridge.ts` owns session read; `loadEmployee` separated from hook state | Low |
| **O** | New routes extend via `shouldSkipSupabase` without editing Supabase paths | Low |
| **L** | N/A (no inheritance hierarchy) | — |
| **I** | Small exports (`isHrmApiDataMode`, `getPortalAccessToken`, `clampHrmPageSize`) | Low |
| **D** | Hooks depend on `hrmApi` / mode lib, not raw fetch | Low |

**Drift note:** `mapEmployee` duplicated in `useEmployees` and `mapHrmEmployeeRecord` in `useEmployee` — acceptable S0; consolidate in S1 if a third consumer appears.

## Security checklist — FE + `hrm-api` employees

| Control | Status | Evidence / note |
|---------|--------|-----------------|
| No hardcoded secrets in FE | PASS | `INTERNAL_API_KEY` only when `DEV`; portal token from storage |
| Auth order: portal JWT → Supabase session → service JWT / dev key | PASS | `hrmApi.ts` `headers()` |
| Token expiry respected | PASS | `portalAuthBridge.getPortalAccessToken` |
| List `page_size` capped at 100 | PASS | `clampHrmPageSize`, `buildListSearchParams` |
| Scope headers on Nest calls | PASS | `inferRuntimeScope` / `resolveHrmSpreadsheetScope` |
| List reads scoped by `company_id` query + `resolveScopeContext` | PASS | `listEmployees` controller |
| **Mutations by `employeeId` only (PATCH/archive/restore)** | **GAP (Medium)** | SQL filters `WHERE id = $uuid` without `company_id`; JWT scope on header not tied to row — **pre-existing**, not introduced by embed mode; track **P2-SEC-HRM-EMP-SCOPE** |
| `getEmployeeById` client scan | PASS (pilot) / PERF (scale) | Only iterates caller-supplied `companyIds`; no cross-tenant leak if membership list is correct |
| Error messages | PASS | No stack traces in UI path; `toErrorMessage` |

Platform NFR: no change required for this slice; existing `platform-core` + scope tests remain the BE release gate.

## Runtime verification (TM-run)

```text
apps/web/hrm:     pnpm test  → 5 files, 15 tests PASS (2026-05-23)
apps/web/web-portal: pnpm test → FAIL startup: Cannot merge config in form of callback
```

## Options — `GET /employees/:id`

| Option | Complexity | Risk | Recommendation |
|--------|------------|------|----------------|
| A. Keep list-scan (current) | Low | Perf + extra RTTs when pages > 1 | **S0 pilot OK** |
| B. Add `GET :employeeId` + `company_id` query + scope assert on row | Medium | Fixes perf; enables row-level scope assert | **Before production scale** |
| C. GraphQL/BFF aggregate | High | Overkill | Defer |

**Verification for B:** controller spec `HRM-EMP-205`; e2e tenant isolation; FE `getEmployeeById` single request.

## web-portal vitest (P1-S0-FE-02)

**Problem:** `vitest.config.ts` uses `mergeConfig(viteConfig, …)` while `vite.config.ts` exports a **function** config.

**Fix path (for Dev-FE):** Inline vitest keys in `vitest.config.ts` without merging callback config (duplicate alias/plugins), or export a shared plain object from `vite.config.shared.ts`, or use `defineProject` pattern documented in Vitest 2.x.

**Gate:** S0 DoD item “web-portal vitest PASS” remains **open** until exit 0.

## Risk register (S0)

| ID | Severity | Item | Owner | Mitigation |
|----|----------|------|-------|------------|
| S0-R1 | **High** (S0 gate) | Portal vitest config merge | dev-fe P1-S0-FE-02 | Fix config; re-run `pnpm -C apps/web/web-portal test` |
| S0-R2 | Medium | Employee mutation IDOR gap | dev-be | Add `company_id` to WHERE on update/archive/restore |
| S0-R3 | Low | List-scan detail perf | dev-be P1-S0-BE-01 / S3 | `GET /employees/:id` |
| S0-R4 | Low | Hooks still calling Supabase on non-gated screens | dev-fe | Per-route matrix P-CC-05..08 + insurance |

## Milestone / gate recommendation

| Gate | TM decision |
|------|-------------|
| Merge HRM embed API mode PRs | **ALLOW** after QA L2 on touched routes |
| S0 sprint “vitest portal PASS” | **BLOCK** until P1-S0-FE-02 |
| QC full 8-route GO | **WAIT** — depends on QA + FE-01 + FE-02 |
| Production cutover | **NOT READY** — unchanged NFR/runbook requirements |

## Conditions for PM closure of P1-S0-TM-01

1. Do not mark S0 complete without **P1-S0-FE-02** evidence (portal vitest exit 0).
2. Dispatch **P1-S0-QA-01** L2 matrix P-CC-05..08 before **P1-S0-QC-01**.
3. Log **P2-SEC-HRM-EMP-SCOPE** for BE mutation scope (not a merge blocker for embed read path).
4. **P1-S0-BE-01** optional for S0 merge; recommended before employee count > 100 per company.
