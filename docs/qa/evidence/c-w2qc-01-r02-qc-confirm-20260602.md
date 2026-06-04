# C-W2QC-01-R02-QC-CONFIRM (2026-06-02)

- **work_item_id:** `C-W2QC-01-R02-QC-CONFIRM`
- **role:** `qc`
- **scope:** confirmatory sign-off for **R02 / D16** policy freeze closure (`D16-FROZEN-ALLOW-200`) after independent QA PASS
- **parent_condition:** `C-W2QC-01-R02` from `docs/qa/evidence/c-w2qc-01-qc-regate-d01-d16-20260602.md`
- **inputs:**
  - `docs/qa/evidence/c-w2qc-01-r02-d16-policy-freeze-qa-20260602.md`
  - `docs/qa/evidence/c-w2qc-01-r02-d16-policy-freeze-20260602.md`
  - `docs/qa/evidence/c-w2qc-01-crud-matrix-close-20260602-run.json` (`executed_at=2026-06-02T15:09:56.170Z`)

## 1) Fail-closed criteria audit (D16 allow-200 policy freeze)

| Criterion | Required | Evidence | QC result |
|-----------|----------|----------|-----------|
| Explicit policy decision recorded | Option A frozen, not silent waiver | Dev-BE artifact §2–3; probe metadata `policy: D16-FROZEN-ALLOW-200` | **PASS** |
| Deterministic success envelope on frozen path | `200` + `HRM-SET-200` (or compatible SET/CAT aliases in probe) | JSON row `NEG-R-HOLDING-POLICY` @ `15:09:56.170Z` | **PASS** |
| Probe does not treat generic 4xx/5xx as PASS | Matcher requires `status === 200` and code in allowlist | `scripts/tmp-c-w2qc-01-crud-matrix-close.mjs` L290–298 | **PASS** |
| JWT conflict boundary remains fail-closed | Bearer `companyId=main` + explicit `query company_id=holding` rejected; service not invoked on conflict | `settings-catalogs.controller.spec.ts` L69–80; QC rerun **23/23** | **PASS** |
| Independent QA PASS on same run artifact | QA retest + L0 stack | `c-w2qc-01-r02-d16-policy-freeze-qa-20260602.md` | **PASS** |
| No undocumented strict-409 flip on settings read | Policy freeze documents allow-200 intent | Dev-BE + ADR-aligned `main → holding` mapping note | **PASS** |

**Anti-widening control:** D16 closure does **not** relax `NEG-R-SCOPE` matcher semantics on non-settings modules. R01 (`D05/D07/D12`) remains a separate scoped GO (`c-w2qc-01-r01-qc-confirm-20260602.md`).

## 2) Boundary behavior — non-settings holding negatives unchanged

From run artifact `executed_at=2026-06-02T15:09:56.170Z` (QA-independent execution; QC cross-audited JSON):

| module | action | request | status | code | verdict |
|--------|--------|---------|--------|------|---------|
| contracts-insurance | NEG-R-SCOPE | `?company_id=holding` | **409** | **SCOPE_CONTEXT_MISMATCH** | PASS |
| insurance | NEG-R-SCOPE | `?company_id=holding` | **409** | **SCOPE_CONTEXT_MISMATCH** | PASS |
| decisions | NEG-R-SCOPE | `?company_id=holding` | **409** | **SCOPE_CONTEXT_MISMATCH** | PASS |
| settings/admin | NEG-R-HOLDING-POLICY | `?company_id=holding` | **200** | **HRM-SET-200** | PASS (frozen policy) |

QC conclusion: scope strictness on contracts/insurance/decisions is **unchanged**. Only settings-catalogs holding overview uses the explicit frozen allow-200 policy lane.

## 3) Dual-path interpretation (documented, not a gate blocker)

- **Portal/proxy matrix path:** group CEO session exercises `GET settings-catalogs?company_id=holding` → `200 HRM-SET-200` under frozen policy.
- **Direct JWT conflict path:** unit test enforces rejection when token scope and explicit query conflict.

These paths are intentionally distinct per Dev-BE/QA analysis; R02 closure requires both to be evidenced — satisfied.

## 4) QC independent verification

QC reproduced controller-spec suite:

```bash
pnpm --filter hrm-api test -- src/settings-catalogs/settings-catalogs.controller.spec.ts
```

- Result: **23/23 PASS** (includes `D16 policy freeze` and `D16 policy boundary` cases).

QC did **not** require a full matrix re-run for R02 confirm (QA artifact + timestamped JSON + spec reproduction sufficient per fail-closed confirmatory gate pattern used for R01).

## 5) QC verdict

| Item | Verdict |
|------|---------|
| **R02 / D16 policy freeze** | **GO** |
| **C-W2QC-01 overall** | **out of scope** — PM must consolidate R01 GO + R02 GO + parent `GO_WITH_CONDITIONS` residuals |

**Decision basis:** Condition `C-W2QC-01-R02` is closed with explicit policy, reproducible probe row, fail-closed JWT boundary tests, and unchanged non-settings negatives. No silent acceptance widening detected.

## 6) Residuals and reopen triggers (bounded)

| ID | Status | Note |
|----|--------|------|
| D16 | **CLOSED** (QC) | Under `D16-FROZEN-ALLOW-200` only |
| R02 | **CLOSED** (QC) | Policy freeze lane complete |
| C-W2QC-01 consolidated | **PM action** | Publish user-facing status; do not claim full program/module closure |

**Reopen R02 immediately if:**

- `GET settings-catalogs?company_id=holding` returns **500** / `HRM-SYS-001` on fresh matrix run;
- probe policy metadata removed or matcher drifts to accept non-deterministic codes;
- JWT boundary test fails (holding query allowed under token conflict);
- non-settings `NEG-R-SCOPE` rows stop returning `409 SCOPE_CONTEXT_MISMATCH`.

## Completion contract

- **completion_report:** QC confirmed R02/D16 policy freeze closure with **GO**. Fail-closed JWT boundary preserved; frozen allow-200 is explicit and reproducible; contracts/insurance/decisions holding negatives remain strict 409. Does not auto-close parent `C-W2QC-01` without PM consolidation.
- **next_owner:** `pm`
- **next_dispatch_prompt:** see bus entry `C-W2QC-01-R02-QC-CONFIRM`
- **evidence_path:** `docs/qa/evidence/c-w2qc-01-r02-qc-confirm-20260602.md`
- **ack_status:** `PASS_TO_PM`
