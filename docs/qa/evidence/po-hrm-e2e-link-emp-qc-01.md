# Evidence — `PO-HRM-E2E-LINK-EMP-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 gate — **EMP E2E linkage** slice only (D1+D2+D5+D6 + J-01/02/04) |
| **priority** | P0 D5 body `company_id` CLOSED · D1 WH neo sealed · module UAT denied |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` |
| **Verdict** | **GO WITH CONDITIONS** — EMP linkage slice only (`C-SLICE-≠-MODULE`) |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-E2E-LINK-EMP-QA-01` **R4** `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-e2e-link-emp-qa-01-r4.md`](po-hrm-e2e-link-emp-qa-01-r4.md) |
| **fe_ref** | [`po-hrm-e2e-link-emp-fe-04.md`](po-hrm-e2e-link-emp-fe-04.md) · FE-03 mount |
| **be_ref** | [`po-hrm-e2e-link-emp-be-03.md`](po-hrm-e2e-link-emp-be-03.md) |
| **prior_qa** | R3 FAIL D5 body · R3 D1 PASS — [`po-hrm-e2e-link-emp-qa-01-r3.md`](po-hrm-e2e-link-emp-qa-01-r3.md) |
| **machine** | [`_tmp-po-hrm-e2e-link-emp-qa-01-r4.FINAL.json`](_tmp-po-hrm-e2e-link-emp-qa-01-r4.FINAL.json) · stamp **`EMPQA-HNWYL0`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-01-r4/` (20 PNG cited in machine) |
| **spec_ref** | F-CORE-DEC-02 · F-CORE-SI-03 · InsuranceActionDto · `PO-HRM-E2E-LINK-EMP-SPEC-01` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — slice GWC ≠ personnel module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **hrm_personnel_uat_ready** | **false** | **DENIED** — cấm claim |
| **employees_e2e_linkage_ready** | **false** | **DENIED** — narrow D1/D5 PASS ≠ linkage program closed |
| **Module personnel UAT** | **DENIED** | Not certified |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` · `api_only_pass` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT for **EMP E2E linkage slice**: D1 QSĐ→WH neo · D2 WH picker · **D5 SI action body `company_id`** · D6 HTP-05 smoke · J-HRM-01/02/04 under U65.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **D5** SI timeline mutate | POST **201** `HRM-EINS-200` · body `"company_id":"main"` + `action=suspend` · periods F5 · PNG 10–13 | 🟢 **ACCEPT** — closes **R-EMP-SI-ACTION-COMPANY-ID-BODY** |
| **D1** QSĐ HRD_01 → WH neo | POST **201** `HRM-DEC-201` · `work_history_id=1f93a01d-…` · badge `QSĐ QD-EMPQA-HNWYL0` · PNG 08 | 🟢 **SEALED** (R3 + R4 reconfirm) |
| **D2** WH CatalogSearchPicker | POST work-timeline **201** · `position_key=CEO` · F5 | 🟢 **SEALED** |
| **D6** HTP-05 | `blocked` · GET **200** `HRM-HTP-200` · invent=false | 🟢 **SEALED** |
| **J-HRM-01 / 02 / 04** | list→detail / contracts→emp / insurance→emp **200** | 🟢 **PASS** |
| **J-HRM-03** | dialog=false PARTIAL | 🟡 **CONDITION** P2 `R-J03-DIALOG` |
| Module / linkage ready flags | Explicit **false** | 🟢 honesty retained |
| Seed / API-only PASS | DENIED | 🟢 U65 |

**Cấm:** `hrm_personnel_uat_ready=true` · `employees_e2e_linkage_ready=true` · reopen CLOSED D1/D5 without evidence gap · Phase 1 DONE · personnel module UAT.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-03 WH neo catalog | `po-hrm-e2e-link-emp-be-03.md` | READY_FOR_QA | **ACCEPT** — HRD_01→neo map; jest cited |
| FE-03 insurance mount | `po-hrm-e2e-link-emp-fe-03.md` | (prior) | **ACCEPT** — `?tab=insurance` + HDSD roots must_keep |
| FE-04 body company_id | `po-hrm-e2e-link-emp-fe-04.md` | READY_FOR_QA | **ACCEPT** — FIX query-only → body DTO |
| QA R3 | `po-hrm-e2e-link-emp-qa-01-r3.md` | FAIL D5 | Historical — D1 PASS retained; D5 superseded by R4 |
| QA R4 | `po-hrm-e2e-link-emp-qa-01-r4.md` | PASS_TO_PM | **ACCEPT** U65 browser + machine |

### Machine JSON spot (stamp `EMPQA-HNWYL0`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `EMPQA-HNWYL0` | 🟢 |
| `l0` hrm/xbos/portal | 200 | 🟢 |
| `uf.D5_SI_TIMELINE.verdict` | **PASS** | 🟢 |
| `bodyHasCompanyId` / `bodyCompanyId` | **true** / **`main`** | 🟢 **not query-only** |
| `requestBody.company_id` + `action` | `main` · `suspend` | 🟢 |
| `postStatus` / `postCode` | **201** / `HRM-EINS-200` | 🟢 |
| `periodsVisible` · `timelineRootAfterF5` | true | 🟢 FE after 2xx+F5 |
| `uf.D1_DEC_WH.work_history_id` | `1f93a01d-95d8-4a91-8a08-35b4a23b81da` | 🟢 neo |
| `hasDecisionNeo` · `hrd03NoWhInvent` | true | 🟢 |
| `uf.D2_WH_PICKER` / `D6_HTP05` | PASS / PASS | 🟢 |
| `journey.J-HRM-01/02/04` | PASS | 🟢 |
| `journey.J-HRM-03` | PARTIAL | 🟡 CONDITION |
| `honesty.*` | both **false** · `narrow_slice_only` | 🟢 |
| `denied[]` | seed · api_only · module_uat · flags | 🟢 |
| `pageErrors` / `consoleErrors` | `[]` · processOk | 🟢 |
| `overall` | **PASS** | 🟢 slice |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `08-wh-after-decision-f5.png` | WH row **Tổng Giám đốc** · badge **QSĐ QD-EMPQA-HNWYL0** · neo visible after F5 |
| `11-si-action-dialog.png` | Dialog **Tạm hoãn** open · effective date · **Lưu thao tác** (pre-POST) |
| `13-si-f5-periods.png` | Enrollment **suspended** · log `suspended 2026-08-06` · periods after F5 |

---

## Gate AC audit

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack | Machine l0 200 · QA `qc:fe-be-health` ALL PASS | 🟢 |
| 2 | D5 body `company_id` string (not query-only) | Machine `lastSiAction.requestBody` + Network POST | 🟢 **PROMOTED** |
| 3 | D5 POST 201 + FE after 2xx+F5 | 201 · periodsVisible · PNG 13 | 🟢 **PROMOTED** |
| 4 | Residual R-EMP-SI-ACTION-COMPANY-ID-BODY | CLOSED | 🟢 **CLOSED** |
| 5 | D1 WH neo sealed | work_history_id + badge PNG 08 | 🟢 **SEALED** |
| 6 | D2 / D6 smoke | PASS / blocked invent=false | 🟢 **SEALED** |
| 7 | J-HRM-01/02/04 L2.5 | PASS | 🟢 |
| 8 | J-HRM-03 | PARTIAL | 🟡 CONDITION P2 |
| 9 | U65 zero-seed | denied seed · browser click path | 🟢 |
| 10 | Honesty flags stay false | MD + machine | 🟢 denied promote |
| 11 | Module UAT / Phase 1 | Explicit DENIED / NOT claimed | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey | Verdict | QC |
|---------|---------|-----|
| **J-HRM-01** | **PASS** | contracts → employee profile |
| **J-HRM-02** | **PASS** | employees list → detail GET 200 |
| **J-HRM-03** | **PARTIAL** | Eye dialog not opened — CONDITION P2 |
| **J-HRM-04** | **PASS** | insurance → employee GET 200 |

### CRUD / mutate matrix (slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| D1 decision create + WH neo | Create | **PASS** |
| D2 work-timeline create | Create | **PASS** |
| D5 SI action suspend | Update (action) | **PASS** |
| D6 hire-readiness | Read | **PASS** (blocked honest) |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| D5 R3 → 400 `HRM-VAL-001` query-only | **PRODUCT** (closed by FE-04 + R4) | Not ENV |
| QA pack verify 2/8 (`crud_or_matrix`, `residual_section` header form) | **PROCESS OBS** | QC consolidates 8/8 here — **not** product demote |
| J-HRM-03 dialog flaky | **PRODUCT** P2 CONDITION | Non-blocking for D5 seal |
| ISO date display on SI card | **OBS** soft | Locale format residual — out of D5 exit |
| FE hint `hdsd-decisions-effective-wh-hint` false | **OBS** P2 cosmetic | Neo works without hint |
| Portal `:5173` | **ENV OBS** | QA L0 PASS on evidence port |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** | P0 | — | **CLOSED** | Body `company_id` + 201 proven |
| **R-EMP-DEC-WH-NEO-CATALOG** | P0 | — | **CLOSED** (prior) | D1 sealed; do not reopen |
| **R-J03-DIALOG** | P2 | qa (later) | **OPEN CONDITION** | Contract Eye dialog open flaky |
| OBS WH hint HRD_01 | P2 | — | OPEN soft | Cosmetic only |
| OBS SI date ISO display | P2 | — | OPEN soft | Locale `dd/MM/yyyy` polish — not D5 blocker |

**P0 residuals for this WI:** none.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-01-r4.md` | exit **1** · 2/8 (`crud_or_matrix`, `residual_section`) | **PROCESS OBS** — consolidated below |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-emp-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |
| QA R4 machine overall | **PASS** | PRODUCT OK |
| QA claimed `pnpm run qc:fe-be-health` | **ALL PASS** | L0 OK |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| D1+D2+D5+D6 smoke · J-01/02/04 | Full personnel module UAT |
| Residual SI body company_id CLOSED | `employees_e2e_linkage_ready=true` |
| Narrow EMP linkage GWC | Contracts Eye J-03 · C&B public form · full SI rate timeline UX polish |
| Honesty flags **false** | Phase 1 DONE · production GO |

**NOT Phase 1 DONE.** **NOT** `hrm_personnel_uat_ready`. **NOT** `employees_e2e_linkage_ready`.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | **GO WITH CONDITIONS** for EMP E2E linkage slice (D1+D2+D5+D6 + J-01/02/04). **R-EMP-SI-ACTION-COMPANY-ID-BODY CLOSED** — browser POST body includes `company_id=main` → 201 + FE F5 periods/suspended. D1 WH neo + D2 + D6 **sealed**. Honesty **false** / seed **DENIED**. CONDITION: P2 **R-J03-DIALOG** only (+ soft OBS). QA pack format 2/8 = PROCESS OBS (QC consolidates). **Cấm** promote personnel/linkage UAT flags. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-PM-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-HRM-E2E-LINK-EMP-QC-01 GO WITH CONDITIONS

task:
  - Bus INTAKE: EMP linkage slice GWC — D5 CLOSED · D1/D2/D6 sealed
  - Keep hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false
  - Do NOT reopen D1/D5
  - Optional later (non-blocking): Task qa for R-J03-DIALOG P2 when capacity
  - Continue program backlog next P0 (do not claim personnel module UAT)

exit: bus updated · honesty flags unchanged · idle-ok this EMP D5 lane
evidence: docs/qa/evidence/po-hrm-e2e-link-emp-qc-01.md
```
