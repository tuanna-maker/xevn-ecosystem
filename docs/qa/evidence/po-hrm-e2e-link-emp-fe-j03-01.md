# Evidence — PO-HRM-E2E-LINK-EMP-FE-J03-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-FE-J03-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution · FIX · preserve_default · code_memory APPEND |
| **parent** | `PO-HRM-E2E-LINK-EMP-QC-01` GWC · residual **R-J03-DIALOG** P2 |
| **date** | 2026-08-07 |
| **change_mode** | FIX |
| **ack_status** | **READY_FOR_QA** |
| **u65** | zero-seed |
| **honesty** | `hrm_personnel_uat_ready=false` · **DENIED** personnel UAT claim |

---

## spec_read_ack

| Layer | Path / § |
|-------|----------|
| QC CONDITION | `docs/qa/evidence/po-hrm-e2e-link-emp-qc-01.md` · **R-J03-DIALOG** · J-HRM-03 PARTIAL `dialog=false` |
| QA R4 | `docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r4.md` · J-HRM-03 Eye dialog not opened |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` **J-HRM-03** — Hợp đồng → chi tiết HĐ (Eye → modal) |
| Prior PASS pattern | `docs/qa/evidence/p1-hrm-h12-journey-qa-20260606.md` — Eye → Chi tiết hợp đồng |
| must_keep | UF-HRM-02 CRUD · print-spine · D1/D5 EMP sealed paths · U65 |

---

## Root cause (R-J03-DIALOG)

| Observation | Meaning |
|-------------|---------|
| Eye control | Icon-only button — `aria-label` only; Playwright `hasText: /Eye\|Chi tiết\|Xem/` **misses** |
| Fallback click | `table tbody tr button`.first()` may hit contract-code / wrong control |
| Dialog mount | View `DialogContent` parent-portaled (TECHSPEC §4.1) — iframe `[role=dialog]` count = **0** → harness `dialog=false` |
| Missing HDSD | No `hdsd-contracts-view-*` testids / iframe latch (create path already has `hdsd-contracts-form-dialog-open`) |

---

## Implemented (FIX)

| Change | Path |
|--------|------|
| HDSD ids: `contractsViewBtn` · `contractsViewDialog` · `contractsViewDialogOpen` | `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` |
| Helper `isContractsViewDialogOpen(query)` — latch **or** dialog mount | same |
| Eye: `type=button` · `data-testid=hdsd-contracts-view-btn` · sr-only `viewTitle` («Chi tiết hợp đồng») | `apps/web/hrm/src/pages/Contracts.tsx` |
| Iframe latch when `viewDialogOpen` (`hdsd-contracts-view-dialog-open`) | same |
| View `DialogContent` `data-testid=hdsd-contracts-view-dialog` + `data-hrm-dialog-portal=parent` | same |
| Body/code hooks `hdsd-contracts-view-body` / `hdsd-contracts-view-code` | same |
| Vitest helper + source wiring lock | `hdsdMutateTestIds.test.ts` · `Contracts.viewDialog.source.test.ts` |
| @CODE-MEMORY APPEND | `Contracts.tsx` · `hdsdMutateTestIds.ts` |

**must_keep untouched:** create/edit form dialog (`hdsd-contracts-form-*`) · print-spine panel · D1/D5 EMP modules · no seed · no `apps/api/**`.

---

## Verify (agent)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/hdsdMutateTestIds.test.ts src/pages/Contracts.viewDialog.source.test.ts
```

| Result | Value |
|--------|-------|
| Exit | **0** |
| Files | 2 passed |
| Tests | **10/10 PASS** |

---

## QA retest contract (J-HRM-03 only)

| Step | Action | PASS when |
|------|--------|-----------|
| 1 | Login `ceo@xe.vn` · open `/hr/contracts` (CC embed OK) | List rows visible |
| 2 | Click `[data-testid=hdsd-contracts-view-btn]` (first row) **or** button matching /Chi tiết/ | Click succeeds |
| 3 | Assert open | `[data-testid=hdsd-contracts-view-dialog-open]` **in iframe** **OR** `[data-testid=hdsd-contracts-view-dialog]` (parent portal) **OR** `isContractsViewDialogOpen` |
| 4 | Content | Title **Chi tiết hợp đồng** · code in `hdsd-contracts-view-code` |
| 5 | must_keep spot | Create CTA / pencil path still present (no CRUD regression) |

**U65:** browser-only · **cấm** seed · **cấm** claim `hrm_personnel_uat_ready`.

**Harness tip:** Prefer latch / view-dialog testid over bare `[role=dialog]` in iframe (same class as create CI01 iframe portal).

---

## Residual

| ID | Sev | Status | Note |
|----|-----|--------|------|
| **R-J03-DIALOG** | P2 | **READY_FOR_QA** | FE hooks landed; browser retest closes |
| D1/D5 sealed | — | **must_keep** | Do not reopen |
| personnel UAT | — | **DENIED** | honesty false |

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Closed FE side of **R-J03-DIALOG**: accessible Eye + HDSD view dialog/latch + `isContractsViewDialogOpen` helper; vitest **10/10**. must_keep UF-HRM-02 CRUD / print-spine / D1/D5. **No** personnel UAT claim · no seed · no API. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-fe-j03-01.md` |
| **ack_status** | **READY_FOR_QA** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-QA-J03-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-E2E-LINK-EMP-FE-J03-01 READY_FOR_QA
residual: R-J03-DIALOG
u65: zero-seed
honesty: hrm_personnel_uat_ready=false

entry: docs/qa/evidence/po-hrm-e2e-link-emp-fe-j03-01.md
task: Retest J-HRM-03 ONLY — contracts list → hdsd-contracts-view-btn → assert hdsd-contracts-view-dialog-open (iframe) OR hdsd-contracts-view-dialog (parent portal) · Chi tiết hợp đồng populated. Prefer testid over role=dialog. Spot must_keep UF-HRM-02 create/pencil still present. No seed. Do not claim personnel UAT.
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-j03-01.md · close R-J03-DIALOG or FAIL with residual
```
