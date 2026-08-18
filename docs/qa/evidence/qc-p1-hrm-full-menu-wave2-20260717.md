# QC Gate — P1-HRM-FULL-MENU-WAVE2-QC-01

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-WAVE2-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-07-17 |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **persona** | Group CEO · `companyId=main` |
| **deploy code** | `9dd029c` |
| **decision** | **GO WITH CONDITIONS — wave-2 only** |
| **ack_status** | **PASS_TO_PM** |
| **full_menu_done_claim** | **NO** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |

---

## Scope

This gate is bounded to the five post-deploy wave-2 acceptance checks in
`docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md`:

1. `PERF-HRM-DEC-01`
2. `COND-PF-PORTAL-01`
3. `COMPANY-DEPT-STUB`
4. `D-DASH-FE-STORM`
5. `P1-HRM-CON-PERF-01` with **J-HRM-03**

The Settings persistence defect `D-HRM-SET-ITEM-PERSIST-01` is outside this
wave and remains a **P0 blocker** for full-menu closure.

---

## Evidence audited

| Artifact | Signal |
|----------|--------|
| `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md` | QA **5/5 PASS**, browser sequential, U65 zero-seed, deploy `9dd029c` |
| `docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md` | Prior QC **GWC** with `GWC-HRM-WAVE2-QA-01` open |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **J-HRM-03** is mandatory and previously green; current QA re-proved contract detail |
| `docs/qa/evidence/p1-hrm-menu-settings-retest-20260717.md` | Settings POST 201 → F5 missing row; `D-HRM-SET-ITEM-PERSIST-01` **P0 OPEN** |

---

## Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md` | **FAIL**, exit **1**, 2/8 | PROCESS — source pack misses recognized `command_table` and `portal_url` formatting |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-hrm-full-menu-wave2-20260717.md` | **PASS**, exit **0**, 8/8 | PROCESS gate satisfied |

Portal URL: `http://14.225.217.232:8088` ·
`PORTAL_DEV_URL=http://14.225.217.232:8088`.

The source-pack failure is a documentation-format defect, not a product
failure: the file itself records the live URL, browser paths, Network 2xx,
F5 behavior, J-HRM-03, U65 no-seed, residuals, and complete handoff.

---

## Classification

| Signal | Type | QC finding |
|--------|------|------------|
| Decisions list 1 request; employees deferred until dialog | PRODUCT / performance | **PASS** |
| Performance deep-link remains on target; cycle POST 201 | PRODUCT / L2 + mutate | **PASS** |
| Company departments load real rows from API 200 | PRODUCT / L2 | **PASS** |
| Dashboard expiring-contract ×1; summary ×1; live operations tiles | PRODUCT / performance | **PASS** |
| Contracts F5 restores 1104 rows; detail opens without 404/409 | PRODUCT / L2.5 | **PASS** |
| QA source evidence-pack verifier 2/8 | PROCESS | **GWC** — formatting only |
| Dashboard payroll charts remain 0 VNĐ | PRODUCT / P2 | **OPEN**, non-blocking for wave-2 AC |
| Departments GET repeats ×2 | PRODUCT / P2 performance | **OPEN**, non-blocking |
| Settings item absent after POST 201 + F5 | PRODUCT / P0 | **OPEN elsewhere**; blocks full-menu closure |

---

## L2.5 journey coverage

| J-ID | Click path | Evidence | Verdict |
|------|------------|----------|---------|
| **J-HRM-03** | Hợp đồng list → Chi tiết hợp đồng | Contract `HLD-0006-HD`; dialog shows status and department; no 404/409; F5 retains 1104 rows | **PASS** |

No mandatory in-scope J-* row is untested for this five-check wave.

---

## Acceptance matrix

| Wave-2 AC | Read / navigation | Mutate / F5 | Verdict |
|------------|-------------------|-------------|---------|
| `PERF-HRM-DEC-01` | Decisions 200 ×1; deferred picker | Create dialog triggers employee 200 ×1 | **PASS** |
| `COND-PF-PORTAL-01` | Deep-link and lists 200 | Cycle POST 201; FE count 15→16 | **PASS** |
| `COMPANY-DEPT-STUB` | Departments 200 with DEPT_01..04 | N/A | **PASS** |
| `D-DASH-FE-STORM` | Seven HRM requests; all 200; required calls ×1 | N/A | **PASS** |
| `P1-HRM-CON-PERF-01` / J-HRM-03 | Pages 1→12 sequential 200; detail opens | F5 restores 1104 | **PASS** |

---

## Condition register

| Condition | Status | Rationale / owner |
|-----------|--------|-------------------|
| **GWC-HRM-WAVE2-QA-01** | **CLOSED** | QA post-`9dd029c` browser evidence is 5/5 PASS |
| `R-DASH-PAYROLL-CHART-0` | **OPEN P2** | dev-fe / dev-be data wiring; does not invalidate UC-HRM-20 tile or storm AC |
| `R-DEPT-FETCH-X2` | **OPEN P2** | dev-fe coalescing; duplicate successful GET only |
| QA evidence-pack schema | **OPEN process condition** | qa should add a verifier-compatible command table and recognized portal URL |
| `D-HRM-SET-ITEM-PERSIST-01` | **OPEN P0 outside wave** | dev-be then QA; blocks UF-HRM-10 and full-menu DONE |

---

## Verdict rationale

1. All five bounded product ACs are proven on Dev8088 deploy `9dd029c`.
2. Mandatory **J-HRM-03** has current browser list→detail and F5 evidence.
3. U65 integrity is intact: no seed was used.
4. The prior P1 coverage condition **GWC-HRM-WAVE2-QA-01 is CLOSED**.
5. The two wave residuals are P2 and non-blocking, but prevent a pure scoped GO.
6. The QA source pack has a verifier-format gap, so the bounded decision remains
   **GO WITH CONDITIONS**.
7. Settings persistence remains P0 outside this wave; therefore this decision is
   **NOT full-menu DONE**, **NOT Phase 1 DONE**, and **NOT PROD-READY**.

**Decision: GO WITH CONDITIONS — wave-2 only.**

---

## Residual / not promoted

- `R-DASH-PAYROLL-CHART-0` — P2, not promoted.
- `R-DEPT-FETCH-X2` — P2, not promoted.
- QA source evidence-pack schema — process condition.
- `D-HRM-SET-ITEM-PERSIST-01` — P0 outside wave; full-menu closure blocked.

---

## Handoff

- `completion_report`: QC closed `GWC-HRM-WAVE2-QA-01` after auditing QA 5/5 PASS on Dev8088 code `9dd029c`. Decision is **GO WITH CONDITIONS for wave-2 only**. P2 `R-DASH-PAYROLL-CHART-0` and `R-DEPT-FETCH-X2` are non-blocking. Settings persistence P0 remains open elsewhere, so full-menu/Phase 1/production closure is not claimed.
- `next_owner`: **pm**
- `evidence_path`: `docs/qa/evidence/qc-p1-hrm-full-menu-wave2-20260717.md`
- `ack_status`: **PASS_TO_PM**

### next_dispatch_prompt

```text
work_item_id: D-HRM-SET-ITEM-PERSIST-01
from_role: pm
to_role: dev-be
entry_criteria: QA FAIL evidence docs/qa/evidence/p1-hrm-menu-settings-retest-20260717.md; POST /api/hrm/settings-catalogs/items returns 201 HRM-SET-201 but overview GET and FE after F5 omit created/edited item. QC wave-2 gate docs/qa/evidence/qc-p1-hrm-full-menu-wave2-20260717.md explicitly does not promote full-menu closure.
exit_criteria: Under U65 zero-seed, create and edit from FE persist in overview and remain visible after F5; add focused controller/service regression tests; provide READY_FOR_QA evidence with spec_read_ack for HRM-SC-03 and UF-HRM-10.
evidence_path: docs/qa/evidence/d-hrm-set-item-persist-01-20260717.md
ack_status: READY_FOR_QA
```
