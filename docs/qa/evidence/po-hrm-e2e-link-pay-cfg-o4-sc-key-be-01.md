# Evidence — PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01` |
| **parent** | `PO-HRM-E2E-LINK-PAY-CFG-QA-02` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P1 |
| **change_mode** | ADD |
| **option** | **A** — synthesize empty overview row (no starter dual-write) |
| **date** | 2026-08-07 |
| **ack_status** | **READY_FOR_QA** |
| **honesty** | `payroll_e2e_ready=false` · U65 zero-seed · starters ≠ Settings picker SoT |

---

## 1. spec_read_ack

| # | Artifact | Used |
|---|----------|------|
| 1 | `docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-02.md` | O4 key ABSENT · Option A preferred |
| 2 | `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` | family `pay_comp` · storageKey `salary_components` already present |
| 3 | `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts` | allowance synthesize pattern (reuse) |
| 4 | ADR Option B/C | **Rejected** — dual-write starters / ADR change out of scope |

### Decision

| Option | Verdict |
|--------|---------|
| **A** Synthesize empty `salary_components` overview | **Chosen** — unblocks Settings Select without XBOS publish / seed |
| B Dual-write payroll starters → Settings | Rejected — starters ≠ picker SoT (QA honesty) |
| C SA ADR starters = picker | Deferred — not needed if FE extension works |

---

## 2. Delivered

| Cap | Implementation |
|-----|----------------|
| **Overview O4** | `getOverview` synthesizes `salary_components` when `familyId === pay_comp` absent |
| **Honesty** | `effectiveItems=[]` · `xbosItems=[]` · no fake codes · no payroll starter copy |
| **Label** | `Thành phần lương (danh mục)` · domain `PAY` |
| **FE path** | Select shows key → POST `/settings-catalogs/items` `category_key=salary_components` → extension row → `effectiveItems>0` |
| **Idempotent** | No duplicate when extension/synced already present for `pay_comp` |

### Files

- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.ts` (CODE-MEMORY APPEND + synthesize block)
- `apps/api/hrm-api/src/settings-catalogs/settings-catalogs.service.spec.ts` (O4 cases + overview expect updates)

---

## 3. Jest evidence

```text
pnpm --filter hrm-api exec jest src/settings-catalogs/settings-catalogs.service.spec.ts --no-coverage
Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

Cases added:

- synthesizes empty `salary_components` when XBOS/extension absent
- does not duplicate when extension already present

---

## 4. Live smoke

| Check | Result |
|-------|--------|
| `:28001` L0 at handoff | Not used for UF claim — restart/reload Nest required before QA browser |
| U65 seed | **Not run** |
| `payroll_e2e_ready` | remains **false** |

---

## 5. Residual / not promoted

| Item | Owner |
|------|-------|
| QA-03 browser: Select `salary_components` → FE create → F5 → CatalogSearchPicker + invent AC | **qa** |
| XBOS `salary_components` / `pay_types` catalog 404 (P2 HOLD) | devops/XBOS — not this wave |
| Dual-write starters ↔ Settings | deferred (Option B/C) |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01
from_role: dev-be
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-cfg-o4-sc-key-be-01.md
next_owner: qa
next_dispatch: PO-HRM-E2E-LINK-PAY-CFG-QA-03
```

**completion_report:** Closed O4 Settings overview key absence for `salary_components` via Option A empty synthesize. Residual = browser QA-03 picker+invent; XBOS 404 P2 HOLD; no e2e_ready flip.

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-QA-03
from_role: pm
to_role: qa
parent: PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01
entry_criteria: Nest hrm-api reloaded with O4-SC-KEY-BE-01; U65 zero-seed; L0 stack up
exit_criteria:
  - GET /api/hrm/settings-catalogs includes catalogKey=salary_components (eff may be 0)
  - Settings Select shows «Thành phần lương (danh mục)»
  - FE create extension item → effectiveItems>0 + F5
  - AC-PAY-COMP-01 CatalogSearchPicker positive when density>0
  - invent-code negative path
  - payroll_e2e_ready stays false
cấm: seed · API-only PASS without FE click path
evidence: docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-03.md
```
