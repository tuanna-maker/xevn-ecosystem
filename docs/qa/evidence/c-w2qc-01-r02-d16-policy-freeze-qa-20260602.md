# C-W2QC-01-R02-D16-POLICY-FREEZE — Independent QA (2026-06-02)

- **work_item_id:** `C-W2QC-01-R02-D16-POLICY-FREEZE-QA`
- **parent_residual:** `C-W2QC-01-R02` / defect `D16`
- **role:** `qa`
- **account:** `ceo@xe.vn` (group CEO, `company_id=main`)
- **environment:** local dev stack (`qc:dev-stack` exit **0**)
- **portal:** `http://127.0.0.1:5173` (`PORTAL_DEV_URL`)
- **hrm-api:** `http://127.0.0.1:28001`

## Verdict

**PASS — R02 / D16 closed** under Option A frozen policy (`D16-FROZEN-ALLOW-200`).

Independent QA confirms:

1. Matrix probe row `settings/admin` · `NEG-R-HOLDING-POLICY` **PASS** on HTTP **200** + `HRM-SET-200` with metadata `policy: D16-FROZEN-ALLOW-200`.
2. Fail-closed **boundary** remains covered in `settings-catalogs.controller.spec.ts`: JWT `companyId=main` + explicit `query company_id=holding` is rejected (`companyId mismatches token scope`); service `getOverview` is not invoked with holding under that conflict path.
3. Contrast control: same probe run still enforces **409** `SCOPE_CONTEXT_MISMATCH` for `NEG-R-SCOPE` on contracts-insurance, insurance, and decisions when `?company_id=holding` (non-settings modules unchanged).

## Preconditions (L0)

| Check | Command | Result |
|-------|---------|--------|
| Stack health | `pnpm run qc:dev-stack` | exit **0** — HRM `:28001`, XBOS `:28002`, portal `:5173` **200** |

## Task 1 — Matrix probe (D16 row)

| Field | Value |
|-------|--------|
| Script | `scripts/tmp-c-w2qc-01-crud-matrix-close.mjs` |
| Executed at | `2026-06-02T15:09:56.170Z` |
| Probe exit | **0** (17/17 checks PASS) |
| Run artifact | `docs/qa/evidence/c-w2qc-01-crud-matrix-close-20260602-run.json` |

**D16 row (extract):**

| module | action | request | status | code | verdict | policy |
|--------|--------|---------|--------|------|---------|--------|
| settings/admin | NEG-R-HOLDING-POLICY | `GET /api/hrm/settings-catalogs?company_id=holding` | **200** | **HRM-SET-200** | **PASS** | `D16-FROZEN-ALLOW-200` |

**Dev-BE input reviewed:** `docs/qa/evidence/c-w2qc-01-r02-d16-policy-freeze-20260602.md`

## Task 2 — Boundary (fail-closed)

| Check | Command | Result |
|-------|---------|--------|
| Controller policy + boundary | `pnpm --filter hrm-api test -- src/settings-catalogs/settings-catalogs.controller.spec.ts` | **23/23 PASS** |
| Named boundary case | `D16 policy boundary: JWT main with explicit holding query is rejected` | **PASS** — throws `companyId mismatches token scope`; `getOverview('xevn','holding')` not called |

**Interpretation (fail-closed):**

- **Frozen allow-200:** Portal-integrated read `GET settings-catalogs?company_id=holding` for group CEO context is an explicit product policy (holding-partition catalog overview), not an accidental scope leak.
- **JWT conflict path:** Direct Bearer JWT `main` + explicit `company_id=holding` query remains **rejected** at `resolveScopeContext` (unit-tested). This is distinct from the portal/proxy path exercised by the matrix probe.

## Task 3 — Contrast (scope still strict elsewhere)

From the same probe run (`executed_at=2026-06-02T15:09:56.170Z`):

| module | action | holding query | status | code | verdict |
|--------|--------|---------------|--------|------|---------|
| contracts-insurance | NEG-R-SCOPE | `?company_id=holding` | 409 | SCOPE_CONTEXT_MISMATCH | PASS |
| insurance | NEG-R-SCOPE | `?company_id=holding` | 409 | SCOPE_CONTEXT_MISMATCH | PASS |
| decisions | NEG-R-SCOPE | `?company_id=holding` | 409 | SCOPE_CONTEXT_MISMATCH | PASS |

## Residual / risk

| ID | Status | Note |
|----|--------|------|
| D16 | **CLOSED** | Policy frozen; probe + spec deterministic |
| R02 | **CLOSED** (QA) | Pending QC confirmatory sign-off |
| C-W2QC-01 (overall) | out of scope | Other defects/residuals not re-audited in this work item |

## Completion contract

- **completion_report:** Independent QA validated R02/D16 closure. `NEG-R-HOLDING-POLICY` passes on `200 HRM-SET-200` with `D16-FROZEN-ALLOW-200`; boundary JWT conflict remains fail-closed in controller-spec; non-settings holding negatives still 409.
- **next_owner:** `qc`
- **next_dispatch_prompt:** see bus entry `C-W2QC-01-R02-D16-POLICY-FREEZE-QA`
- **evidence_path:** `docs/qa/evidence/c-w2qc-01-r02-d16-policy-freeze-qa-20260602.md`
- **ack_status:** `PASS_TO_PM`
