# Evidence — PO-HRM-PAY-ENROLL-DOCS-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-PAY-ENROLL-DOCS-01` |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| parent | `PO-HRM-UC-MENU-COVERAGE-AUDIT-01` · `PO-HRM-E2E-LINK-PAY-CFG-SPEC-01` |
| change_mode | ADD-only DOC-DELTA · no wipe · no_prompt_echo · NO `apps/**` |
| date | 2026-08-06 |
| ack_status | **PASS_TO_PM** |

---

## Honesty locks (unchanged — not UAT)

| Flag | Value |
|------|--------|
| `payroll_e2e_ready` | **false** |
| U65 zero-seed | **true** |
| apps/** touched | **no** |
| seed | **no** |
| Module UAT claim | **none** |
| Invent N-step WF | **none** |
| Overwrite PAY TechSpec v0.3.x | **none** |

---

## Merged deltas

| Delta | Target | Result |
|-------|--------|--------|
| Diễn biến FE: menu Lương · NV Hoạt động → kỳ → đưa NV / chạy đợt → list phiếu → tải lại | `SRS_HRM_ENTERPRISE` **FR-UC-BP-PAY-06** (DOC-DELTA **v0.16**; tip file may be **v0.17+** PROC) | MERGED ADD-only |
| AC-PAY-HIRE-04 (FE sau lưu) · AC-PAY-HIRE-05 (tải lại / F5) | Enterprise PAY-06 + team `UC-HRM-24` | MERGED |
| Khóa đủ điều kiện bảng công chốt cho đưa NV / chạy đợt | Enterprise **FR-UC-BP-PAY-01** | MERGED (ADD BR + special case) |
| Dual SoT component lock cross-ref (PAY-CFG SPEC §D2) | Enterprise **FR-UC-BP-PAY-02** ↔ PAY-06 | MERGED (cross-ref; AC-PAY-COMP-01 kept) |
| Slice E3 + residual AC-01..05 | `docs/program/slices/DOC-ENT-P0-HRM-PAY.md` | MERGED |
| PAY-CFG SPEC §H D1b stamp | `PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` | MERGED |

### Files touched (docs only)

- `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md`
- `docs/hrm/SRS.md` (UC-HRM-24)
- `docs/program/slices/DOC-ENT-P0-HRM-PAY.md`
- `docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md` (§H D1b)
- `docs/qa/evidence/po-hrm-pay-enroll-docs-01.md` (this file)

### Spec sources (read)

- Coverage audit § Executive #2 · payroll row
- `PO-HRM-E2E-LINK-PAY-CFG-SPEC-01` §D P0-PAY-01 · §D1/D2
- Enterprise FR-UC-BP-PAY-06 · PAY-01 · PAY-02
- Pre-existing SA: `PO-HRM-E2E-LINK-PAY-HIRE-TECH-01` (TECH DRAFT Option B) — **not re-opened / not overwritten**

---

## Spot-check (internal)

| Check | OK |
|-------|----|
| PAY-06 still has 7 FR sections | yes |
| AC-PAY-HIRE-01..03 preserved; 04/05 ADD | yes |
| Customer text: no work_item / sponsor chat echo | yes |
| Sequence includes màn Lương · phản hồi sau lưu · tải lại | yes |
| Diễn biến #1–#7 FE path; không invent multi-level approve WF | yes |
| PAY TechSpec v0.3.x / HIRE TECH-01 body untouched by this seat | yes |
| `payroll_e2e_ready` remains false | yes |

---

## Tech seal status (for next_owner)

| Artifact | Status |
|----------|--------|
| Enterprise PAY-06 FE Diễn biến + AC-PAY-HIRE-01..05 | **docs MERGED** (v0.16 delta) |
| `PO-HRM-E2E-LINK-PAY-HIRE-TECH-01` | **Already TECH DRAFT** (Option B enroll+process) — evidence `po-hrm-e2e-link-pay-hire-tech-01.md` |
| Map note | Tech maps Diễn biến **#1–#5** (pre-FE thicken); Dev/QA must also cover **#6–#7** + **AC-PAY-HIRE-04/05** from this DOC-DELTA |
| Product seal / UAT | **No** — residual ba-data DB-01 → BE/FE → QA |

---

## completion_report

- **Closed:** ADD-only DOC-DELTA — thickened FR-UC-BP-PAY-06 with FE Diễn biến (menu Lương → kỳ → đưa NV/chạy đợt → list → reload) + AC-PAY-HIRE-04/05; locked PAY-01 sheet-chốt eligibility; dual-SoT cross-ref PAY-02↔PAY-06; team UC-HRM-24 synced; slice E3 + PAY-CFG §H D1b stamped.
- **Open / residual (not this seat):** SA PAY-HIRE Tech already DRAFT — next **ba-data** `PO-HRM-E2E-LINK-PAY-HIRE-DB-01` then Dev BE/FE; `payroll_e2e_ready=false`.
- **Forbidden honored:** no `apps/**`, no seed, no UAT claim, no invent N-step WF, no overwrite PAY TechSpec v0.3.x / HIRE TECH body.

## next_owner

**pm** → **ba-data** `PO-HRM-E2E-LINK-PAY-HIRE-DB-01` (Tech DRAFT already exists — **do not** re-dispatch SA PAY-HIRE tech unless map #6–#7 / AC-04/05 needs DOC-DELTA pointer only)

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-DB-01
from_role: pm
to_role: ba-data
lane: governance
parent: PO-HRM-PAY-ENROLL-DOCS-01 · PO-HRM-E2E-LINK-PAY-HIRE-TECH-01
change_mode: ADD DB note confirm — NO apps/**

read_first:
1. docs/qa/evidence/po-hrm-pay-enroll-docs-01.md
2. docs/program/specs/PO-HRM-E2E-LINK-PAY-HIRE-TECH-01.md §4 DB note · §3 F-PAY-HIRE-02..04
3. docs/qa/evidence/po-hrm-e2e-link-pay-hire-tech-01.md
4. SRS_HRM_ENTERPRISE FR-UC-BP-PAY-06 Diễn biến #1–#7 · AC-PAY-HIRE-01..05 (v0.16)
5. AS-IS payroll_payslips / payroll_periods

Task:
- Stamp CONFIRMED: AS-IS tables đủ cho enroll=payslip draft UQ (period_id, employee_id)
  OR ADD minimal columns only if required for AC-PAY-HIRE-01/04 UI reasons
- Confirm require_closed_timesheet physical sheet bind (PAY-01)
- Note Dev/QA must cover AC-PAY-HIRE-04/05 (FE sau 2xx + F5) — not only API body
- Cấm invent parallel batch_records SoT; cấm hard FK migration blocking GĐ1
- honesty: payroll_e2e_ready=false · no UAT claim

exit_criteria:
- evidence: docs/qa/evidence/po-hrm-e2e-link-pay-hire-db-01.md
- next_dispatch_prompt → PO-HRM-E2E-LINK-PAY-HIRE-BE-01 + PAY-HIRE-FE-01
  (wire enroll; FE list sau 2xx + F5 per AC-04/05; cấm fake toast)
ack_status: PASS_TO_PM

# Residual only (optional, không chặn DB-01):
# Nếu cần: SA one-line DOC-DELTA trên PAY-HIRE-TECH map Diễn biến #6–#7 + AC-04/05
# — không rewrite Option B / không đè PAY TechSpec v0.3.x meeting depth
```

## ack_status

**PASS_TO_PM**
