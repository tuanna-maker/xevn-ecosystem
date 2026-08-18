# Evidence — `PO-UAT-EMP-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-EMP-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **personnel UAT pack slice** (D1+D2+D5+D6 + J-HRM-01..04) |
| **priority** | Seal reconfirm · soft OBS retained · module UAT denied |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` |
| **Verdict** | **GO WITH CONDITIONS** — EMP UAT pack slice ACCEPT (`C-SLICE-≠-MODULE`) |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-UAT-EMP-01` `PASS_TO_PM` |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **qa_ref** | [`po-uat-emp-01.md`](po-uat-emp-01.md) |
| **machine** | [`_tmp-po-uat-emp-01.FINAL.json`](_tmp-po-uat-emp-01.FINAL.json) · stamp **`EMPQA-ICBMY8`** |
| **screens** | `docs/qa/evidence/screens/po-uat-emp-01/` (**21** PNG on disk) |
| **prior GWC** | [`po-hrm-e2e-link-emp-qc-01.md`](po-hrm-e2e-link-emp-qc-01.md) · [`po-hrm-e2e-link-emp-qc-j03-01.md`](po-hrm-e2e-link-emp-qc-j03-01.md) |
| **spec_ref** | F-CORE-DEC-02 · F-CORE-SI-03 · InsuranceActionDto · `PROGRAM_JOURNEY_MAP.md` J-HRM-01..04 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — pack PASS ≠ personnel module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **hrm_personnel_uat_ready** | **false** | **DENIED** — soft OBS remain · slice ≠ full module · **PM must not set true** |
| **employees_e2e_linkage_ready** | **false** | **DENIED** — pack reconfirm ≠ linkage program closed |
| **Module personnel UAT** | **DENIED** | Not certified |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` · `api_only_pass` · `module_uat` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT UAT pack reconfirm for **personnel EMP slice**: D1 QSĐ→WH neo · D2 WH picker · D5 SI action body `company_id` · D6 HTP-05 · **J-HRM-01..04** (incl. J-03 dialog reconfirm). Sealed residuals **not reopened**. Soft OBS remain → **not** clean GO / **not** `hrm_personnel_uat_ready=true`.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **D1** QSĐ HRD_01 → WH neo | POST **201** `HRM-DEC-201` · `work_history_id=ae4a2a78-…` · badge `QSĐ QD-EMPQA-ICBMY8` · F5 · HRD_03 no invent · PNG 08 | 🟢 **SEALED** reconfirm |
| **D2** WH CatalogSearchPicker | picker · reject free-text · POST **201** · `position_key=CEO` · F5 | 🟢 **SEALED** reconfirm |
| **D5** SI timeline `stop` | POST **201** `HRM-EINS-200` · `bodyHasCompanyId=true` · `company_id=main` · periods F5 · PNG 11/13 | 🟢 **SEALED** reconfirm |
| **D6** HTP-05 | banner · GET **200** `HRM-HTP-200` · `state=ready` · invent=false | 🟢 **SEALED** reconfirm |
| **J-HRM-01..04** | All PASS · J-03 `dialog=true` | 🟢 **PASS** (J03 already CLOSED qc-j03; UAT reconfirm) |
| Soft OBS | OBS-D1-HINT · SI ISO date display | 🟡 **OPEN soft** — blocks clean GO / flag promote |
| Module / honesty flags | Explicit **false** | 🟢 honesty retained |
| Seed / API-only PASS | DENIED | 🟢 U65 |

**Cấm:** `hrm_personnel_uat_ready=true` · `employees_e2e_linkage_ready=true` · reopen CLOSED D1/D5/J03 without evidence gap · Phase 1 DONE · invent full module UAT.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| Why | Soft OBS remain · `C-SLICE-≠-MODULE` · sponsor honesty DENIED unless GO **full module** with **zero** P0/P1 — this seat is **GWC slice**, not full-module GO |
| Recommended flag state | keep both honesty flags **false** |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| EMP linkage GWC | `po-hrm-e2e-link-emp-qc-01.md` | PASS_TO_PM | Baseline D1/D2/D5/D6 sealed · J03 was CONDITION |
| EMP qc-j03 | `po-hrm-e2e-link-emp-qc-j03-01.md` | PASS_TO_PM | **R-J03-DIALOG CLOSED** |
| QA UAT pack | `po-uat-emp-01.md` | PASS_TO_PM | **ACCEPT** U65 browser · stamp `EMPQA-ICBMY8` |
| Machine JSON | `_tmp-po-uat-emp-01.FINAL.json` | overall PASS | **ACCEPT** |

### Machine JSON spot (stamp `EMPQA-ICBMY8`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `EMPQA-ICBMY8` | 🟢 |
| `l0` hrm/xbos/portal | 200 | 🟢 |
| `uf.D1_DEC_WH` | PASS · `work_history_id` · `hasDecisionNeo=true` · `hrd03NoWhInvent=true` | 🟢 |
| `uf.D2_WH_PICKER` | PASS · freeText reject · save 201 · F5 | 🟢 |
| `uf.D5_SI_TIMELINE` | PASS · `postStatus=201` · `bodyHasCompanyId=true` · `bodyCompanyId=main` · `action=stop` | 🟢 **D5 body not query-only** |
| `lastSiAction.requestBody` | `{ company_id: "main", action: "stop", effective_from: "2026-08-07" }` | 🟢 |
| `uf.D6_HTP05` | PASS · invent=false · net 200/HRM-HTP-200 | 🟢 |
| `journey.J-HRM-01..04` | all **PASS** · J-03 `dialog=true` | 🟢 |
| `honesty.*` | both **false** · `narrow_slice_only` | 🟢 |
| `denied[]` | seed · api_only · module_uat · flags | 🟢 |
| `residuals` | `[]` | 🟢 no P0/P1 product |
| `pageErrors` / `consoleErrors` | `[]` · processOk | 🟢 |
| `overall` | **PASS** | 🟢 slice |

### Screenshot visual spot (mandatory D5 + D1)

| File | QC observation |
|------|----------------|
| `08-wh-after-decision-f5.png` | WH **Tổng Giám đốc** · badge **QSĐ QD-EMPQA-ICBMY8** · neo after F5 — D1 sealed |
| `11-si-action-dialog.png` | Dialog **Ngừng** open · effective `07/08/2026` · **Lưu thao tác** — D5 pre-POST |
| `13-si-f5-periods.png` | Enrollment **stopped** · period log `suspended 2026-08-06` + `stopped 2026-08-07` after F5 — D5 FE after 2xx |
| Screens dir | **21** PNG cited; spot files **exist** on disk |

---

## Gate AC audit

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack + fe-be-health | QA MD + machine l0 200 | 🟢 |
| 2 | D1 WH neo sealed (not reopened) | work_history_id + badge PNG 08 · stamp ICBMY8 | 🟢 **SEALED** |
| 3 | D2 picker reject free-text | machine D2 PASS | 🟢 **SEALED** |
| 4 | D5 `bodyHasCompanyId=true` | machine + lastSiAction | 🟢 **SEALED** |
| 5 | D5 POST 201 + FE F5 periods | 201 · periodsVisible · PNG 13 | 🟢 **SEALED** |
| 6 | D6 HTP honest invent=false | ready + invent=false | 🟢 **SEALED** |
| 7 | J-HRM-01..04 L2.5 | all PASS · J03 dialog=true | 🟢 |
| 8 | Sealed residuals not reopened | D1/D5/J03 status SEALED/CLOSED | 🟢 |
| 9 | U65 zero-seed | denied seed · browser click path | 🟢 |
| 10 | Honesty flags stay false | MD + machine + this QC | 🟢 **DENIED promote** |
| 11 | Module UAT / Phase 1 | Explicit DENIED / NOT claimed | 🟢 |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey | Prior | UAT 2026-08-07 | QC |
|---------|-------|----------------|-----|
| **J-HRM-01** | PASS | PASS | 🟢 contracts → employee |
| **J-HRM-02** | PASS | PASS | 🟢 list → detail GET 200 |
| **J-HRM-03** | CLOSED (qc-j03) | PASS `dialog=true` | 🟢 **reconfirm** — do not reopen |
| **J-HRM-04** | PASS | PASS | 🟢 insurance → employee GET 200 |

### CRUD / mutate matrix (slice)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| D1 decision create + WH neo | Create | **PASS** |
| D2 work-timeline create | Create | **PASS** |
| D5 SI action stop | Update (action) | **PASS** |
| D6 hire-readiness | Read | **PASS** (ready honest / invent=false) |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA pack verify 2/8 (`crud_or_matrix`, `residual_section` header form) | **PROCESS OBS** | QC consolidates 8/8 here — **not** product demote |
| OBS-D1-HINT `hintVisible=false` | **OBS** P3 soft | Cosmetic; neo + badge work — blocks clean GO only |
| SI card ISO datetime display | **OBS** P2 soft | Locale `dd/MM/yyyy` polish — not D5 reopen |
| Portal `:5173` | **ENV OBS** | QA L0 PASS on evidence port |
| No P0/P1 product residual | **PRODUCT OK** | Machine `residuals: []` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-EMP-DEC-WH-NEO-CATALOG** | P0 | — | **CLOSED / SEALED** | UAT reconfirm — do not reopen |
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** | P0 | — | **CLOSED / SEALED** | `bodyHasCompanyId=true` reconfirm |
| **R-J03-DIALOG** | P2 | — | **CLOSED / SEALED** | qc-j03 + UAT `dialog=true` |
| **OBS-D1-HINT** | P3 | — | **OPEN soft** | HDSD hint false — cosmetic |
| **OBS-SI-DATE-ISO** | P2 | — | **OPEN soft** | ISO on SI card — locale polish |

**P0/P1 residuals for this WI:** none.

**CONDITION for GWC (soft only):** soft OBS above — sufficient to deny `hrm_personnel_uat_ready=true` and deny clean full-module GO; **not** product NO-GO.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-emp-01.md` | exit **1** · 2/8 (`crud_or_matrix`, `residual_section`) | **PROCESS OBS** — consolidated below |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-emp-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |
| QA machine overall | **PASS** | PRODUCT OK |
| QA claimed `qc:dev-stack` + `qc:fe-be-health` | L0 200 · ALL PASS | L0 OK |
| Spot screens 08/11/13 | exist on disk · visual ACCEPT | ASSET OK |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| D1+D2+D5+D6 · J-HRM-01..04 UAT reconfirm | Full personnel module UAT |
| Sealed D1/D5/J03 remain CLOSED | `hrm_personnel_uat_ready=true` |
| Soft OBS documented | `employees_e2e_linkage_ready=true` |
| Honesty flags **false** | Phase 1 DONE · production GO · other HRM modules |

**NOT Phase 1 DONE.** **NOT** `hrm_personnel_uat_ready`. **NOT** `employees_e2e_linkage_ready`.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-emp-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for **personnel UAT pack slice** (D1+D2+D5+D6 + J-HRM-01..04). UAT stamp `EMPQA-ICBMY8` reconfirms sealed D1 WH neo · D5 `bodyHasCompanyId=true` stop 201 · D2/D6 · J-01..04 (J03 dialog reconfirm). Sealed residuals **not reopened**. Soft OBS (hint + SI ISO date) remain → **deny** clean GO and **deny** `hrm_personnel_uat_ready=true`. QA pack format 2/8 = PROCESS OBS (QC consolidates). U65 / seed DENIED. **C-SLICE-≠-MODULE**. **NOT** Phase 1 DONE.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-EMP-PM-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-EMP-QC-01 GO WITH CONDITIONS
program: PO-UAT-MODULES-PARALLEL-01

task:
  - Bus INTAKE: EMP personnel UAT pack slice GWC — D1/D2/D5/D6 + J-HRM-01..04 ACCEPT
  - Keep hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false (QC DENIED promote)
  - Do NOT reopen sealed D1/D5/J03
  - Soft OBS (OBS-D1-HINT · SI ISO date) — optional later polish; non-blocking for other modules
  - Continue PO-UAT-MODULES-PARALLEL-01 next module lane — idle-ok this EMP UAT lane

exit: bus updated · honesty flags unchanged · no invent Phase1 DONE
evidence: docs/qa/evidence/po-uat-emp-qc-01.md
```
