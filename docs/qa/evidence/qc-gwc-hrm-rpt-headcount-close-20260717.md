# QC Condition Close — GWC-HRM-RPT-HEADCOUNT-01

| Field | Value |
|-------|-------|
| **work_item_id** | `GWC-HRM-RPT-HEADCOUNT-01-CLOSE` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **environment** | Dev8088 · `PORTAL_DEV_URL=http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **decision** | **CONDITION CLOSED — BY-DESIGN** |
| **ack_status** | **PASS_TO_PM** |
| **full_menu_done_claim** | **NO** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **U65** | zero-seed — no seed in evidence chain |

---

## Scope

Close QC condition **GWC-HRM-RPT-HEADCOUNT-01** from
`docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md` as **BY-DESIGN**
after BA-data governance delta **BR-DQ-HEADCOUNT-01**.

This gate does **not** promote HRM full-menu program closure, Phase 1 DONE, or
PROD-READY. Settings persistence `D-HRM-SET-ITEM-PERSIST-01` and other open GWC
items remain outside this bounded condition close.

---

## Evidence audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/gwc-hrm-rpt-headcount-01-20260717.md` | ba-data | **PASS_TO_PM** — BY-DESIGN semantics; `1041+66=1107`; no dev-be |
| `docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md` | qc (prior) | **GWC-HRM-RPT-HEADCOUNT-01** OPEN P2 — trigger for this close |
| `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md` | governance | **BR-DQ-HEADCOUNT-01** published with AC-HC-01..04, VAL-HC-01..04 |
| `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md` | qa | Residual **7** 🟢 — Biến động NS **1041**; Employees list **1107** |
| `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-20260717.md` | devops | Summary API `active_count=1041` · `total=1107` · `inactive_count=66` |
| `docs/qa/evidence/p1-hrm-menu-dashboard-20260717.md` | qa | Dashboard dual tiles **1107** / **1041** (AC-HC-03 corroboration) |
| Screenshot | qa | `p1-hrm-full-menu-qa-retest-resume-reports-20260717.png` |

Portal URL: `http://14.225.217.232:8088` ·
`PORTAL_DEV_URL=http://14.225.217.232:8088`.

---

## Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/gwc-hrm-rpt-headcount-01-20260717.md` | **FAIL**, exit **1**, 3/8 | PROCESS — BA pack lacks command table, portal URL regex, residual section |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-gwc-hrm-rpt-headcount-close-20260717.md` | **PASS**, exit **0**, 8/8 | PROCESS gate satisfied (this file) |
| Deploy summary probe (carry) `GET /api/hrm/employees/summary?company_id=main` | **PASS** **200** `HRM-EMP-SUMMARY-200` | `active_count=1041` · `inactive_count=66` · `total=1107` |
| QA resume browser — Reports Biến động NS | **PASS** | «Nhân viên hiện tại» **1041** (not ~95 undercount class) |
| QA resume browser — Employees list | **PASS** | Subtitle / pagination **1107** |

**QC adjudication:** BA source pack **PROCESS GWC** — auditable semantics,
traceability matrix, BR publication, and probe definitions present. Script misses
are format-only (precedent: `qc-p1-hrm-full-menu-retest-20260717.md` H13). Authoritative
governance anchor: `gwc-hrm-rpt-headcount-01-20260717.md` + `BR-DQ-HEADCOUNT-01`.

---

## Classification

| Signal | Type | QC finding |
|--------|------|------------|
| Reports turnover «Nhân viên hiện tại» = **1041** | PRODUCT / semantics | **BY-DESIGN** — binds `summary.active_count` per BR-DQ-HEADCOUNT-01 AC-HC-01 |
| Employees list total = **1107** | PRODUCT / semantics | **BY-DESIGN** — binds non-archived list `total` per AC-HC-02 |
| `1041 + 66 = 1107` identity | DATA / contract | **PASS** — `inactive_count=66`; `archived_count=0` |
| Prior ~95 undercount (page-1 length misuse) | PRODUCT / defect | **CLOSED** (prior wave) — not this incident |
| BE summary filter wrong hypothesis | PRODUCT / defect | **REJECT** — no dev-be dispatch |
| Dashboard shows both 1107 and 1041 | PRODUCT / UX | **PASS** AC-HC-03 |
| Reports overview label vs `active_count` | PRODUCT / P2 UX | **OPEN non-blocking** — optional dev-fe |
| Employees subtitle without inactive hint | PRODUCT / P2 UX | **OPEN non-blocking** — optional dev-fe |
| Settings persist `D-HRM-SET-ITEM-PERSIST-01` | PRODUCT / P0 | **OPEN elsewhere** — blocks full-menu DONE |
| `GWC-HRM-PAY-STATUS-CELL-01` | PRODUCT / P2 | **OPEN** — unrelated to this condition |

---

## VAL-HC validation (re-audit from evidence chain)

| ID | Criterion | Evidence | Verdict |
|----|-----------|----------|---------|
| **VAL-HC-01** | `active_count + inactive_count = total` | Deploy summary + `BR-DQ-HEADCOUNT-01` identity row | **PASS** `1041+66=1107` |
| **VAL-HC-02** | Reports «Nhân viên hiện tại» = `active_count` | QA resume §7 + screenshot | **PASS** **1041** |
| **VAL-HC-03** | Employees list total = list API `total` | QA resume §6 — UI **1107** | **PASS** |
| **VAL-HC-04** | scope_parity list→get-by-id | QA resume J-HRM-02 — profile **200** | **PASS** (unchanged) |

**AC-HC-04:** Comparing **1041** vs **1107** across surfaces is **not** a cardinality
bug when the **66** inactive delta is documented — **PASS** (governance closure).

---

## Condition register update

| Condition | Prior status | New status | Rationale |
|-----------|--------------|------------|-----------|
| **GWC-HRM-RPT-HEADCOUNT-01** | OPEN P2 (ba-data) | **CLOSED — BY-DESIGN** | BR-DQ-HEADCOUNT-01 + VAL-HC-01..03 PASS; no dev-be |
| **GWC-HRM-RPT-HEADCOUNT-FE-01** (optional) | n/a | **OPEN P2 optional** | dev-fe label polish — sponsor-triggered only |
| **GWC-HRM-PAY-STATUS-CELL-01** | OPEN P2 | **OPEN** | unrelated |
| **D-HRM-SET-ITEM-PERSIST-01** | OPEN P0 | **OPEN** | blocks full-menu closure |
| Full-menu / Phase 1 / PROD | n/a | **NOT CLAIMED** | per PM entry criteria |

---

## Verdict rationale

1. BA-data published **BR-DQ-HEADCOUNT-01** with operational definitions, AC-HC-01..04,
   and VAL-HC-01..04 in `HRM_DASHBOARD_DATA_QUALITY_RULES.md`.
2. Live pilot identity `1041 + 66 = 1107` is corroborated by deploy summary, QA resume
   browser evidence, and dashboard dual tiles — not a filter or page-size defect.
3. Reports «Nhân viên hiện tại» correctly uses `active_count`; Employees list correctly
   uses non-archived `total` including inactive profiles — intentional cross-surface semantics.
4. **No dev-be fix** is required; BE contract `HRM-EMP-SUMMARY-200` is correct.
5. Optional P2 FE label polish (overview card / employees subtitle breakdown) is
   documented and **non-blocking** for condition closure.
6. **NOT** full-menu DONE — `D-HRM-SET-ITEM-PERSIST-01` P0 and other GWC items remain open.

**Decision: CONDITION CLOSED — BY-DESIGN (GWC-HRM-RPT-HEADCOUNT-01).**

---

## Residual

| Item | Owner | Blocking condition close? |
|------|-------|---------------------------|
| GWC-HRM-RPT-HEADCOUNT-FE-01 (optional label polish) | dev-fe | **No** — defer unless sponsor requests |
| GWC-HRM-PAY-STATUS-CELL-01 | dev-fe | **No** — separate condition |
| D-HRM-SET-ITEM-PERSIST-01 | dev-be → qa | **Yes** for full-menu DONE (outside this gate) |
| BA evidence-pack format (3/8) | ba-data / qa | **No** — process carry only |

No dev-be dispatch for headcount semantics.

---

## Handoff packet

- `work_item_id:` `GWC-HRM-RPT-HEADCOUNT-01-CLOSE`
- `from_role:` qc
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/qc-gwc-hrm-rpt-headcount-close-20260717.md`
- `completion_report:` |
  QC **CLOSED** condition **GWC-HRM-RPT-HEADCOUNT-01** as **BY-DESIGN**. Audited BA delta `gwc-hrm-rpt-headcount-01-20260717.md`, published **BR-DQ-HEADCOUNT-01**, and QA resume VAL-HC-01..03 (`1041` active / `66` inactive / `1107` total). Rejected dev-be defect hypothesis. Optional P2 FE label polish remains non-blocking. **NOT** full-menu DONE · **NOT** Phase 1 DONE · settings persist P0 still open.
- `next_owner:` **pm**
- `next_dispatch_prompt:` |
  ```text
  work_item_id: D-HRM-SET-ITEM-PERSIST-01-QA
  from_role: pm
  to_role: qa
  entry_criteria: dev-be READY_FOR_QA docs/qa/evidence/d-hrm-set-item-persist-01-20260717.md; QC headcount GWC CLOSED docs/qa/evidence/qc-gwc-hrm-rpt-headcount-close-20260717.md; U65 zero-seed browser on http://14.225.217.232:8088; ceo@xe.vn / Xevn@2026
  task: UF-HRM-10 browser retest — /hr/settings-catalogs → Thêm mục → POST 201 → FE row → F5 persists; edit ACM_* label → F5 shows new label. Update USER_FLOW_OPERABILITY_MATRIX UF-HRM-10. Parallel P2 (non-blocking): dev-fe GWC-HRM-PAY-STATUS-CELL-01 if not already in-flight.
  cấm: seed
  exit_criteria: evidence docs/qa/evidence/d-hrm-set-item-persist-01-qa-retest-20260717.md; PASS_TO_PM or FAIL_TO_PM
  ```

  Optional (sponsor-triggered only):

  ```text
  work_item_id: GWC-HRM-RPT-HEADCOUNT-FE-01
  from_role: pm
  to_role: dev-fe
  entry_criteria: BR-DQ-HEADCOUNT-01 §P2 UX polish; QC condition already CLOSED BY-DESIGN
  task: Reports OverviewReportTab label/bind alignment; Employees subtitle inactive breakdown. No BE change.
  exit_criteria: READY_FOR_QA; evidence docs/qa/evidence/gwc-hrm-rpt-headcount-fe-01-*.md
  ```

---

## QC sign-off

| Role | Decision | Date |
|------|----------|------|
| QC Manager (subagent) | **CONDITION CLOSED — BY-DESIGN** | 2026-07-17 |
