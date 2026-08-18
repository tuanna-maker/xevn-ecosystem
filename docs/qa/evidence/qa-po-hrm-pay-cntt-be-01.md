# Evidence — QA-PO-HRM-PAY-CNTT-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-PAY-CNTT-BE-01` |
| **parent** | `PO-HRM-PAY-CNTT-BE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **date** | 2026-08-11 |
| **persona** | `ceo@xe.vn` / `du-lich.ceo@xe.vn` · `company_id=main` |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator **HOLD** · U65 zero-seed |
| **ack_status** | **FAIL_TO_PM** |

---

## Environment

| Item | Value |
|------|--------|
| hrm-api target | `http://127.0.0.1:28001/api/hrm` |
| portal proxy | `http://127.0.0.1:5173` |
| xbos-api | `http://127.0.0.1:28002` |
| probe stamp | `CNTTBEQA-MSO7PS4K` |
| machine JSON | `docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-be-01.FINAL.json` |

---

## L0 — Stack health

| Gate | Command | Result | Notes |
|------|---------|--------|-------|
| qc:dev-stack | `pnpm run qc:dev-stack` | **PASS** (pre-probe) | hrm-api + xbos-api + portal 200 |
| qc:fe-be-health | `pnpm run qc:fe-be-health` | **PASS** | employees + catalog-sync 200 |
| qc:dev-stack (post-restart attempt) | — | **FAIL** | Port `:28001` down after stale PID kill; `nest start --watch` blocked by TS compile errors |

**Finding:** Process on `:28001` (PID 24724) was a **stale dist** without CNTT routes. Fresh `dev:hrm-api` restart fails compile — see P0 defect below.

---

## L1 — Jest regression (dev evidence cross-check)

```bash
cd apps/api/hrm-api
pnpm exec jest pay-cntt-setup.service.spec.ts pay-period-input-pack.service.spec.ts pay-sheet-template.service.spec.ts --no-coverage
```

| Suite | Result |
|-------|--------|
| `pay-cntt-setup.service.spec.ts` | **PASS** |
| `pay-period-input-pack.service.spec.ts` | **PASS** |
| `pay-sheet-template.service.spec.ts` | **PASS** |

**Exit 0 · 27/27 tests** (QA re-run 2026-08-11)

> Jest PASS ≠ runtime PASS. `ts-jest` runs targeted specs; full Nest compile currently **FAIL**.

---

## L1 — Live API probe (FAIL)

Probe script: `scripts/qa/_tmp-qa-po-hrm-pay-cntt-be-01.mjs`

### AC-CNTT-SETUP-02 — Policy pack CRUD

| Step | Method / path | Status | Code |
|------|---------------|--------|------|
| POST policy pack | `POST /payroll/pay-policy-packs` | **404** | `HRM-DATA-404` — `Cannot POST …` |
| GET list | `GET /payroll/pay-policy-packs?company_id=main` | **404** | `HRM-DATA-404` |

**Verdict:** 🔴 FAIL — routes not mounted on live `:28001`.

### AC-CNTT-SETUP-04 — Input profile CRUD

| Step | Method / path | Status | Code |
|------|---------------|--------|------|
| POST profile | `POST /payroll/pay-input-pack-profiles` | **404** | `HRM-DATA-404` |
| GET list | `GET /payroll/pay-input-pack-profiles?company_id=main` | **404** | `HRM-DATA-404` |

**Verdict:** 🔴 FAIL

### F-PAY-SETUP-RESOLVE-01

| Step | Method / path | Status |
|------|---------------|--------|
| Resolve helper | `GET /payroll/pay-setup/resolve?company_id=main` | **404** `HRM-DATA-404` |

**Verdict:** 🔴 FAIL

### AC-CNTT-SETUP-03 — Period `setupContext` snapshot

| Step | Result |
|------|--------|
| POST template with `policyPackId` + `inputPackProfileId` | **400** `HRM-VAL-001` — EXPAND DTO fields rejected (`businessLineTag`, `policyPackId`, `inputPackProfileId` should not exist) on stale server |
| POST period with `paySheetTemplateId` | **201** (no template bound) |
| `sheet_template_snapshot_json.setupContext` | **absent** |

**Verdict:** 🔴 FAIL — cannot bind FKs or snapshot setupContext on stale runtime.

### HRM-PAY-INP-PROFILE-422 — `source_kind` mismatch

| Step | Result |
|------|--------|
| Pick employee via `GET /payroll/employees` | **0 rows** on payroll employees endpoint (probe used wrong path) |
| POST input-line `source_kind=revenue` | **BLOCKED** — no policy/profile/period chain |

**Verdict:** 🔴 FAIL (not exercised on live API)

### scope_parity U19 — group CEO list / member get 404

| Step | Result |
|------|--------|
| Group CEO list `main` | **404** (routes missing) |
| Member CEO `du-lich.ceo@xe.vn` get-by-id | **not reached** |

**Verdict:** 🔴 FAIL

---

## L2 / Browser — NOT_PROMOTED (expected for BE slice)

| UF / Screen | Status | Reason |
|-------------|--------|--------|
| STP-HUB `/hr/payroll/setup` | **NOT_PROMOTED** | No `pay-policy-packs` / `PayPolicyPack` / `payroll/setup` in `apps/web` (grep 0 hits) |
| AC-CNTT-SETUP-02 FE mutate | **NOT_PROMOTED** | `R-CNTT-FE` — Thiết lập hub bind UI out of scope BE-01 |
| AC-CNTT-SETUP-04 FE | **NOT_PROMOTED** | Same |

Per exit criteria: **L1 API FAIL blocks BE slice** regardless of FE gap documentation.

---

## P0 defects

### D-PAY-CNTT-BE-COMPILE-01 — Nest watch compile broken

**File:** `apps/api/hrm-api/src/payroll/dto/pay-period-input-line.dto.ts`  
**Lines:** 101–108 — orphaned decorators/fields outside class after `UpdatePeriodInputLineDto` closes at L100.

```
TS1146 / TS1005 / TS1128 on nest start --watch (2026-08-11 12:22)
```

**Impact:** Fresh `pnpm run dev:hrm-api` cannot boot; `:28001` down after QA killed stale PID.

**Owner:** `dev-be`

### D-PAY-CNTT-BE-RUNTIME-01 — CNTT routes not on live hrm-api

**Symptom:** `Cannot POST/GET /api/hrm/payroll/pay-policy-packs` → `HRM-DATA-404`  
**Root cause:** Stale node process served pre-CNTT PayrollController (startup log 09:18 — no `pay-policy-packs` route mapping). Source has routes (`payroll.controller.ts` L954+).

**Owner:** `dev-be` + `devops` (ensure dist restart after BE-01 merge)

---

## Summary matrix

| Criterion | Verdict |
|-----------|---------|
| L0 qc:dev-stack + fe-be-health (initial) | 🟢 PASS |
| L0 after restart attempt | 🔴 FAIL (port down) |
| L1 Jest 27/27 | 🟢 PASS |
| L1 policy pack CRUD live | 🔴 FAIL |
| L1 input profile CRUD live | 🔴 FAIL |
| L1 pay-setup/resolve | 🔴 FAIL |
| L1 setupContext on period bind | 🔴 FAIL |
| L1 HRM-PAY-INP-PROFILE-422 | 🔴 FAIL (blocked) |
| L1 scope_parity U19 | 🔴 FAIL |
| Browser U65 Thiết lập | ⚪ NOT_PROMOTED |
| payroll_e2e_ready=false | ✅ kept |
| Formula evaluator HOLD | ✅ kept |

**Overall:** 🔴 **FAIL_TO_PM**

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| R-CNTT-FE | Thiết lập hub UI | dev-fe |
| R-CNTT-MOUNT | XLSX column verify | ba-process |
| R-CNTT-SALES | sales → input-lines bridge | dev-be |

---

## completion_report

### Closed (QA scope)

1. Read dev evidence + API_DESIGN F.1 + UI index (FE gap confirmed).
2. L0 gates PASS on initial stack (hrm + xbos + portal).
3. Jest regression re-run **27/27 PASS**.
4. Live API probe executed — all CNTT endpoints **404** on stale runtime.
5. Identified P0 compile blocker in `pay-period-input-line.dto.ts` preventing fresh server boot.
6. Browser rows marked **NOT_PROMOTED** (FE hub not wired).

### Open

- Fix D-PAY-CNTT-BE-COMPILE-01 → restart hrm-api → re-probe L1 ACs.
- scope_parity + 422 + setupContext require live API retest after fix.

---

## next_owner

**pm** → dispatch **`dev-be`** (P0 compile + runtime route verification)

---

## next_dispatch_prompt

```text
work_item_id: D-PAY-CNTT-BE-COMPILE-01
from_role: qa
to_role: dev-be
lane: execution
parent: PO-HRM-PAY-CNTT-BE-01

read_first:
- docs/qa/evidence/qa-po-hrm-pay-cntt-be-01.md
- apps/api/hrm-api/src/payroll/dto/pay-period-input-line.dto.ts (L100-108 orphan)
- docs/qa/evidence/po-hrm-pay-cntt-be-01.md

entry_criteria: QA FAIL_TO_PM — nest watch TS1146; live :28001 lacked pay-policy-packs routes

exit_criteria:
- Fix pay-period-input-line.dto.ts syntax (remove orphan L101-108 or restore class)
- pnpm run dev:hrm-api boots; route map includes pay-policy-packs / pay-input-pack-profiles / pay-setup/resolve
- pnpm exec jest pay-cntt-setup*.spec.ts pay-period-input-pack*.spec.ts pay-sheet-template*.spec.ts exit 0
- curl smoke: POST policy pack + input profile → GET list 200; bind template FKs → period setupContext; revenue source_kind → HRM-PAY-INP-PROFILE-422
- ack_status READY_FOR_QA
- evidence docs/qa/evidence/po-hrm-pay-cntt-be-01-r2.md
- must_keep: payroll_e2e_ready=false · formula HOLD
```

---

## evidence_path

`docs/qa/evidence/qa-po-hrm-pay-cntt-be-01.md`
