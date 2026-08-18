# Evidence — BA-HRM-DATA-LINKAGE-TRACE-01

**Date:** 2026-07-21  
**Role:** ba-data · governance  
**work_item_id:** `BA-HRM-DATA-LINKAGE-TRACE-01`  
**ack_status:** **PASS_TO_PM**

## Scope closed

| Deliverable | Path | Action |
|-------------|------|--------|
| SRS FR ↔ entity ↔ FK trace (SoT) | `docs/hrm/HRM_DATA_LINKAGE_SRS_TRACE.md` | **ADD** — 44 FR matrix, spine ER, VAL-FK/SC, lifecycle, gap register |
| Menu matrix pointer | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §11 | **ADD** — `ref_srs` per menu/entity; link to trace doc |
| Evidence | this file | COMPLETE |

**Inputs read:**

- `docs/client-delivery/hrm/SRS_HRM_KHACH.md` v3.0-W2c (§3.1–3.44 = 44 FR)
- `docs/hrm/TECHSPEC.md` §14 + §16 (+ §12.1 ATT must_keep)
- `docs/hrm/SRS.md` §15 INT/SCOPE · BR-INT-*
- `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` (pre-existing G-FID)
- `docs/hrm/HRM_SEED_CARDINALITY_RULES.md` (CARD-* FK)
- `docs/program/PROGRAM_JOURNEY_MAP.md` J-HRM-* / J-HRM-INT-*

**cấm respected:** no `apps/**` · no seed · no Phase1 DONE claim · no wipe of G-FID sections.

## Audit findings (summary)

1. **Coverage:** TechSpec §14.0 + §16.1 + §16.2 + §16.3 = **44** FR = khách body — mapped 1:1 to primary tables + `ref_srs` in new trace doc.
2. **Spine FK:** `employees` hub; contracts/insurance/attendance/leave/payslips/evaluations require `employee_id` + same `company_id` slug (INT-02/03); hire INT-01 requires attach (G-INT-01 open).
3. **scope_parity:** Documented VAL-SC-01 / G-SCOPE-01 standing — list vs get-by-id same resolver (U19).
4. **must_keep:** AC-ATT-SHEET-01..06 on FR-HRM-AT-14 / J-HRM-06b — dual-ref TechSpec §12.1; sheet POST header-only.
5. **Stale risk closed in docs:** Menu matrix R-FID-01 «no GET insurance» superseded by TechSpec §14.3 ALIGNED list — noted in §11 + trace §8.
6. **Non-claim:** 119 UC inventory still separate from 44 FR skeleton; fidelity density ≠ FR DONE.

## Residual (for PM dispatch — not closed by BA-Data)

| ID | Owner hint | Why open |
|----|------------|----------|
| G-RC-01 VERIFY | `qa` U65 | Browser headcount bind |
| G-AT10-01 | `dev-be` | Leave `company_id` UUID vs slug |
| G-SCOPE-01 | `dev-be`+`qa` | Standing scope parity |
| G-INT-01 / G-INT-04 | be+qa | Hire attach + L2.5 E2E |
| G-CI-01 / G-EM-01 / G-PR-03 / … | per TechSpec §16.9 | Field/process gaps |

## Completion contract

```yaml
work_item_id: BA-HRM-DATA-LINKAGE-TRACE-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
completion_report: >
  ADD HRM_DATA_LINKAGE_SRS_TRACE.md (entity FK + 44 FR ref_srs + VAL-* + scope_parity)
  and matrix §11 pointer. Residuals = TechSpec §16.9 execution gaps (not BA docs).
next_owner: pm
next_dispatch_prompt: |
  work_item_id: QA-HRM-G-RC-01-U65 (or DEV-BE-G-AT10-01)
  from_role: pm
  to_role: qa
  lane: execution
  entry_criteria: |
    Read docs/hrm/HRM_DATA_LINKAGE_SRS_TRACE.md §3.1 FR-HRM-RC-01 + TechSpec §14.7/§16.9 G-RC-01.
    L0 stack up; U65 zero-seed; browser-only.
  exit_criteria: |
    Create YCTD with headcount ≥1 → list/detail show số lượng after 2xx + F5;
    evidence docs/qa/evidence/qa-hrm-g-rc-01-u65-YYYYMMDD.md; PASS_TO_PM.
    Alternate P0: dispatch dev-be G-AT10-01 leave company_id slug parity (VAL-FK-07).
  cấm: seed · apps patch by QA · Phase1 DONE
evidence_path: docs/qa/evidence/ba-hrm-data-linkage-trace-01-20260721.md
```

## KB

Append planned: `~/.cursor/knowledge-base/ba-data.md` — reuse-tag `xevn-hrm-44fr-fk-srs-trace`.
