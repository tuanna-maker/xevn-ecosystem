# QA — P1-UF-HRM-16-PROMOTE-01 (2026-07-21)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-UF-HRM-16-PROMOTE-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 |
| **date** | `2026-07-21` |
| **PORTAL_DEV_URL** | `http://14.225.217.232:8088` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` (cited from prior browser; **no** AC re-open) |
| **U65** | zero-seed — governance promote only; **no** seed |
| **ack_status** | **PASS_TO_PM** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |

---

## Entry criteria (audited)

| Artifact | Signal |
|----------|--------|
| `docs/qa/evidence/qc-hrm-att-sheet-ac-01-20260721.md` | QC **GWC** — AC-ATT-SHEET-01..06 + **J-HRM-06b** CLOSED product |
| `docs/qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md` | QA browser **PASS_TO_PM** Dev8088 U65 |
| `docs/qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md` | BA AC lock + proposed **UF-HRM-16** |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | **J-HRM-06b** ✅ |

**Cấm respected:** no seed · no reopen AC-01..06 product browser · no Phase1/PROD claim.

---

## Exit criteria — done

| Exit | Result |
|------|--------|
| Add **UF-HRM-16** to `USER_FLOW_OPERABILITY_MATRIX.md` §4 as **🟢** Dev8088 | **DONE** |
| Cite QC + QA + BA | **DONE** — row links all three + this promote |
| Optional polish QA pack (`C-ATT-SHEET-PACK-01`) | **DONE** — `command_table` + `PORTAL_DEV_URL` on QA AC pack |
| Evidence this file | **DONE** |
| `ack_status PASS_TO_PM` | **DONE** |

---

### command_table

| Command | Result | Classification |
|---------|--------|----------------|
| Governance promote (matrix §4 + journey + trace delta) | **PASS** | PROCESS |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md` | **PASS** · exit **0** (8/8) | PROCESS — closes C-ATT-SHEET-PACK-01 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-uf-hrm-16-promote-01-20260721.md` | **PASS** · exit **0** | PROCESS |

---

## Matrix delta

| UF-ID | Before | After | Spec / J-* |
|-------|--------|-------|------------|
| **UF-HRM-16** | Missing from §4 (⬜ in SRS trace delta) | **🟢** Dev8088 in §4 | UC-HRM-23 · HRM-AT-14 · **J-HRM-06b** |

**§4 HRM web count:** 11/11 → **12/12** 🟢 (2 mobile ⚪ unchanged). Combined web: 26 → **27**.

### Cite chain (SoT)

1. BA — `ba-hrm-att-sheet-ac-01-20260721.md` (AC-ATT-SHEET-01..06)
2. QA — `qa-hrm-att-sheet-ac-01-20260721.md` (browser PASS)
3. QC — `qc-hrm-att-sheet-ac-01-20260721.md` (GWC product PASS)
4. Promote — this file

Also updated:

- `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` — UF-HRM-16 cờ **🟢**
- `docs/program/PROGRAM_JOURNEY_MAP.md` — J-HRM-06b cite **UF-HRM-16 🟢** (no longer “promote pending”)

---

## L2.5 — J-HRM-06b (cite only · not re-executed)

| J-ID | Verdict | Evidence |
|------|---------|----------|
| **J-HRM-06b** | **PASS** | QA AC 2026-07-21 · QC GWC — create → list → open weekly; no reload storm |

---

## Residual

| ID | Status | Note |
|----|--------|------|
| **C-ATT-SHEET-UF16-01** | **CLOSED** | UF-HRM-16 🟢 in matrix §4 |
| **C-ATT-SHEET-PACK-01** | **CLOSED** | QA pack Layer B 8/8 |
| **C-ATT-SHEET-AC03-COLD** | DEFER OK (P3 soft) | Cold list `total=0` not required for promote |
| Auto-roster on create | OUT OF SCOPE | Unchanged |
| Phase1 / PROD | **FORBIDDEN** | Not claimed |

**No residual product** for this governance slice.

---

## Handoff

- **completion_report:** Closed `P1-UF-HRM-16-PROMOTE-01`. UF-HRM-16 added to `USER_FLOW_OPERABILITY_MATRIX.md` §4 as **🟢** Dev8088 with QC+QA+BA cites. Trace delta + journey map synced. Optional QA pack polish closed C-ATT-SHEET-PACK-01 (verify 8/8). Did **not** reopen AC-01..06. Did **not** claim Phase1/PROD.
- **next_owner:** `pm`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qa-uf-hrm-16-promote-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-INTAKE-UF-HRM-16-PROMOTE-01
from_role: qa
to_role: pm
lane: governance
entry_criteria: QA PASS docs/qa/evidence/qa-uf-hrm-16-promote-01-20260721.md; UF-HRM-16 🟢 in USER_FLOW_OPERABILITY_MATRIX.md §4; C-ATT-SHEET-UF16-01 + C-ATT-SHEET-PACK-01 CLOSED
exit_criteria: Bus INTAKE; close QC GWC conditions C-ATT-SHEET-UF16-01 + PACK-01 on qc-hrm-att-sheet-ac-01 register; scan next P0/P1 residual (optional C-ATT-SHEET-AC03-COLD defer OK); cấm Phase1/PROD claim from this promote alone
cấm: seed · reopen AC-ATT-SHEET product · claim Phase1 DONE
```
