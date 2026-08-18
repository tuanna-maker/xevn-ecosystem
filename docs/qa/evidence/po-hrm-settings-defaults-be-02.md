# Evidence — PO-HRM-SETTINGS-DEFAULTS-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-BE-02` |
| **parent** | `PO-HRM-SETTINGS-DEFAULTS-QA-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P0 |
| **Date** | 2026-08-07 |
| **U65** | zero-seed · no `pnpm seed:*` |
| **Honesty** | `payroll_e2e_ready=false` · L1 hotfix only · not UF 🟢 |
| **Cite** | `docs/qa/evidence/po-hrm-settings-defaults-qa-01.md` |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| QA-01 defect register | D-SETDEF-QA-TAX-01 / SI-DATE-01 / POS-TX-01 |
| `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md` | F-SET-TAX/SI/POS · VAL-SET-TAX-SHAPE · VAL-SET-SI-01 · HRM-ALLOW-CAT-ORPHAN-CODE |
| Peer SAVEPOINT pattern | `allowance-catalog-sync.service.ts` D-ALLOW-CAT-QA-01 |
| Peer pg date coerce | `toLeaveDayKey` (ATT-LINE / leave-funnel) |

---

## 2. Root cause → fix

| Defect | Root cause | Fix |
|--------|------------|-----|
| **D-SETDEF-QA-TAX-01** | `PutSettingsCompanySettingDto.value` had **no** class-validator decorator → `forbidNonWhitelisted` → `HRM-VAL-001 property value should not exist` | `@Allow()` on `value`; shape still in `validatePayTaxValue` → `HRM-SET-TAX-400-SHAPE` |
| **D-SETDEF-QA-SI-DATE-01** | `String(pg Date).slice(0,10)` → `Thu Jan 01` — PATCH 400 + overlap compare silent miss → 201 | `toLeaveDayKey` in `toDateOnly` / `display` / `assertNoOverlap` (SI + POS display) |
| **D-SETDEF-QA-POS-TX-01** | SC probe used nonexistent `status` column; `.catch` alone does **not** unabort PG TX | Query `is_active` + `archived_at`; SAVEPOINT `pos_sc_count` / `pos_sc_by_code` + ROLLBACK TO |

---

## 3. Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/settings/dto/settings-defaults.dto.ts` | `@Allow()` on `value` |
| `apps/api/hrm-api/src/settings/insurance-rate-cfg.service.ts` | pg date coerce |
| `apps/api/hrm-api/src/settings/position-compensation-policy.service.ts` | SC SAVEPOINT + `is_active` + date coerce |
| `apps/api/hrm-api/src/settings/settings-defaults.service.spec.ts` | +4 regression tests (DTO whitelist, Date overlap, Date PATCH, SC SAVEPOINT) |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=settings-defaults.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 21 passed
```

Locks retained: `payroll_e2e_ready=false` · SRC-02 resolve read-only · soft-delete only · U65 no seed.

---

## completion_report

### Closed

1. TAX PUT body `value` passes ValidationPipe whitelist; bad shape still service → `HRM-SET-TAX-400-SHAPE`.
2. SI overlap detects pg `Date` windows → `409 HRM-SET-SI-409-OVERLAP`; display/PATCH emit `YYYY-MM-DD`.
3. POS create SC probe no longer aborts TX; orphan → `400 HRM-ALLOW-CAT-ORPHAN-CODE`; SQL uses `is_active`/`archived_at`.

### Residual

- Live L1 retest on `:28001` after Nest reload (QA-02).
- FE Settings tax/SI/POS UF deferred.
- `payroll_e2e_ready=true` DENIED.

### Explicit non-claims

- Not browser UF 🟢 · not PAY process wire · no seed.

---

## next_owner

**qa** (`PO-HRM-SETTINGS-DEFAULTS-QA-02`)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-SETTINGS-DEFAULTS-BE-02
priority: P0

## Goal
L1 retest hotfix from docs/qa/evidence/po-hrm-settings-defaults-be-02.md (cite QA-01 FAIL matrix):
1) PUT /settings/company-settings pay_tax_* with value → 200 UPSERT; bad shape → 400 HRM-SET-TAX-400-SHAPE (not property value should not exist)
2) SI: create active + overlapping active → 409 HRM-SET-SI-409-OVERLAP; PATCH notes/re-save → 200 YYYY-MM-DD effectiveFrom
3) POS: POST CEO + known PC code → 201; orphan code → 400 HRM-ALLOW-CAT-ORPHAN-CODE (not 500 aborted TX); resolve SRC-02 still no emp write

## Locks
U65 zero-seed · L1 probe secondary · payroll_e2e_ready=false · no UF 🟢 claim

## exit_criteria
evidence docs/qa/evidence/po-hrm-settings-defaults-qa-02.md · PASS_TO_PM or FAIL with residual IDs
persona: ceo@xe.vn · companyId=main · holding partition
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-be-02.md`

## ack_status

**READY_FOR_QA**
