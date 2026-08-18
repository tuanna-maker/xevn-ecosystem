# Evidence — `PO-UAT-EMP-SOFT-OBS-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UAT-EMP-SOFT-OBS-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — soft OBS close delta on personnel UAT pack GWC |
| **Verdict** | **GO WITH CONDITIONS** — soft OBS **CLOSED**; pack GWC wording tightened; **NOT** clean full-module GO · **NOT** invent `hrm_personnel_uat_ready` |
| **ack_status** | `PASS_TO_PM` |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` |
| **parent** | `PO-UAT-EMP-SOFT-OBS-QA-01` `PASS_TO_PM` |
| **prior_pack_gwc** | [`po-uat-emp-qc-01.md`](po-uat-emp-qc-01.md) · **GWC** pack slice (`C-SLICE-≠-MODULE`) · soft OBS were OPEN |
| **qa_ref** | [`po-uat-emp-soft-obs-qa-01.md`](po-uat-emp-soft-obs-qa-01.md) |
| **machine** | [`_tmp-po-uat-emp-soft-obs-qa-01.FINAL.json`](_tmp-po-uat-emp-soft-obs-qa-01.FINAL.json) · stamp **`EMPOBS-IE3ORQ`** |
| **screens** | `docs/qa/evidence/screens/po-uat-emp-soft-obs-qa-01/` (**12** PNG on disk) |
| **spec_ref** | F-CORE-DEC-02 · F-CORE-SI-03 · InsuranceActionDto · `PROGRAM_JOURNEY_MAP.md` J-HRM-01..04 · UX vi-VN date |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | Soft OBS close ≠ `hrm_personnel_uat_ready=true` · `C-SLICE-≠-MODULE` retained |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **hrm_personnel_uat_ready** | **false** | **DENIED invent** — soft OBS CLOSED alone ≠ full-module GO · **`C-SLICE-≠-MODULE`** · **PM must not set true** |
| **employees_e2e_linkage_ready** | **false** | **DENIED** — soft-OBS delta ≠ linkage program closed |
| **Module personnel UAT** | **DENIED** as full-module promote | Pack GWC + soft OBS delta only — **no clean GO wording** |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes seed · api_only · module_uat · flags |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT soft OBS close delta on top of prior personnel UAT pack GWC (`po-uat-emp-qc-01`):

| Item | Prior pack GWC | Soft OBS QA | QC |
|------|----------------|-------------|-----|
| **OBS-D1-HINT** | OPEN soft (`hintVisible=false`) | HRD_01+effective → hint **visible** · HRD_03 → absent · stamp `EMPOBS-IE3ORQ` | 🟢 **CLOSED** |
| **OBS-SI-DATE-ISO** | OPEN soft (ISO on SI card) | Card `30/07/2026 - 28/09/2026` · periods `dd/MM/yyyy` · `hasIsoLeak=false` · `displayClean=true` | 🟢 **CLOSED** |
| **D1** WH neo sealed | SEALED | POST **201** `HRM-DEC-201` · `work_history_id` · badge `QSĐ QD-EMPOBS-IE3ORQ` · F5 | 🟢 **SEALED** not reopened |
| **D5** body `company_id` | SEALED | stop POST **201** · `bodyHasCompanyId=true` · `company_id=main` | 🟢 **SEALED** not reopened |
| **J03** / R-J03-DIALOG | SEALED | out of soft-OBS path · not touched | 🟢 **SEALED** not reopened |
| **C-SLICE-≠-MODULE** | OPEN | OPEN | 🟡 **CONDITION retained** |
| `hrm_personnel_uat_ready` | DENIED | false honesty | 🔴 **still DENIED invent true** |

**GWC wording tighten (allowed):** soft OBS conditions may be marked **CLOSED** — no longer block cleaner pack-slice GWC residual text.

**Still NOT clean GO for personnel / NOT invent `hrm_personnel_uat_ready=true`:** residual CONDITION = **`C-SLICE-≠-MODULE`** (and no explicit full-module GO seat). QC issues **no** clean GO wording on this WI.

**Cấm:** invent `hrm_personnel_uat_ready=true` · reopen sealed D1/D5/J03 · seed · invent Phase 1 DONE.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| Why | Soft OBS CLOSED removes prior soft blockers to *flag promote*, but **`C-SLICE-≠-MODULE`** remains — sponsor honesty requires **explicit full-module clean GO** with zero P0/P1 before true. This seat is **GWC soft-OBS delta**, **not** clean GO. |
| Recommended flag state | keep `hrm_personnel_uat_ready=false` · `employees_e2e_linkage_ready=false` |
| May PM tighten bus/GWC residual text (soft OBS CLOSED)? | **YES** |

---

## Soft OBS audit vs QA evidence

### OBS-D1-HINT → CLOSED

| Signal | QA MD | Machine FINAL | QC |
|--------|-------|---------------|-----|
| Path | `/hr/decisions` → Thêm · HRD_01 · effective | `uf.OBS-D1-HINT` | 🟢 |
| Hint | `[data-testid=hdsd-decisions-effective-wh-hint]` visible | `hintVisible=true` · WH neo copy | 🟢 PNG `01` visual ACCEPT |
| HRD_03 neg | hint absent · cancel | `OBS-D1-HINT-HRD03-ABSENT` · `hintVisible=false` | 🟢 PNG `04` |
| Stamp | `EMPOBS-IE3ORQ` | `env.STAMP=EMPOBS-IE3ORQ` · badge text | 🟢 |
| Verdict | CLOSED | `verdict=PASS` | 🟢 **ACCEPT CLOSED** |

### OBS-SI-DATE-ISO → CLOSED

| Signal | QA MD | Machine FINAL | QC |
|--------|-------|---------------|-----|
| Surface | employee Tran Thi B · tab insurance | `uf.OBS-SI-DATE-ISO` · emp `22222222-…` | 🟢 |
| Card | `30/07/2026 - 28/09/2026` | `cardScan.hasIsoLeak=false` · vi `30/07/2026` | 🟢 PNG `05-si-date-surface` |
| Periods | `06/08/2026` / `07/08/2026` | `periodsScan.hasIsoLeak=false` · sample vi dates | 🟢 |
| Overall | displayClean | `displayClean=true` | 🟢 **ACCEPT CLOSED** |
| Wire | D5 `effective_from` still `yyyy-MM-dd` | `wireYyyyMmDd=true` | 🟢 display-only · not D5 reopen |

---

## Sealed must_keep (not reopened)

| ID | Prior | Soft OBS QA | QC |
|----|-------|-------------|-----|
| **R-EMP-DEC-WH-NEO-CATALOG** (D1) | SEALED | POST 201 · WH neo · badge `QD-EMPOBS-IE3ORQ` · F5 PNG `03` | 🟢 **SEALED** |
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** (D5) | SEALED | `bodyHasCompanyId=true` · `company_id=main` · 201 | 🟢 **SEALED** |
| **R-J03-DIALOG** | SEALED | `J03_NOT_REOPENED` · no contracts Eye path | 🟢 **SEALED** |

---

## L2.5 journey matrix (U19 — soft OBS delta)

| Journey | Prior pack GWC | Soft OBS retest | QC |
|---------|----------------|-----------------|-----|
| **J-HRM-01..04** | PASS (pack) | not full re-run; D1/D5 mutate paths exercised | 🟢 retain prior pack PASS |
| **J-HRM-03** | SEALED (qc-j03) | explicitly **not reopened** | 🟢 **SEALED** |
| Soft OBS D1 hint / SI locale | OPEN soft | CLOSED browser U65 | 🟢 **OBS CLOSED** |

### CRUD / mutate (soft OBS scope)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| D1 decision create HRD_01 + hint + WH neo | Create | **PASS** · OBS-D1-HINT CLOSED · D1 sealed |
| D1 HRD_03 hint absent (cancel) | Read/neg | **PASS** |
| SI date surface after stop/F5 | Read | **PASS** · OBS-SI-DATE-ISO CLOSED |
| D5 SI action stop body `company_id` | Update (action) | **PASS** · D5 sealed |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| Soft OBS CLOSED (D1 hint + SI ISO) | **PRODUCT OK** (delta) | ACCEPT close |
| D1/D5/J03 sealed | **PRODUCT OK** | Not reopened |
| QA evidence pack verify **3/8** | **PROCESS OBS** | QC consolidates **8/8** here — **not** product demote |
| `C-SLICE-≠-MODULE` | **CONDITION** | Pack ≠ module UAT / clean GO |
| invent `hrm_personnel_uat_ready=true` | **HONESTY BLOCK** | QC DENIED — no clean GO wording |
| Portal `:5173` | **ENV OBS** | L0 200 on evidence port |
| No P0/P1 product residual | **PRODUCT OK** | Machine `residuals: []` · `processOk=true` |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **OBS-D1-HINT** | P3 soft | — | **CLOSED** | HRD_01 hint visible · HRD_03 absent |
| **OBS-SI-DATE-ISO** | P2 soft | — | **CLOSED** | SI card/periods `dd/MM/yyyy` · no ISO leak |
| **R-EMP-DEC-WH-NEO-CATALOG** | P0 | — | **CLOSED / SEALED** | Do not reopen |
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** | P0 | — | **CLOSED / SEALED** | Do not reopen |
| **R-J03-DIALOG** | P2 | — | **CLOSED / SEALED** | Do not reopen |
| **C-SLICE-≠-MODULE** | honesty | **pm** | **OPEN** | Pack GWC ≠ full-module clean GO |
| `hrm_personnel_uat_ready` promote | P0 honesty | **pm** | **BLOCKED** | QC DENIED invent true |

**P0/P1 product residuals for this WI:** none.

**CONDITION for GWC (tightened):** soft OBS **CLOSED**; remaining CONDITION = **`C-SLICE-≠-MODULE`** — deny `hrm_personnel_uat_ready=true` and deny clean full-module GO; **not** product NO-GO for pack slice / soft OBS delta.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-emp-soft-obs-qa-01.md` | exit **1** · **3/8** (command_table · journey_l25 · residual_section) | **PROCESS OBS** — QC consolidates below |
| QA machine overall | **PASS** · stamp `EMPOBS-IE3ORQ` · honesty false · residuals `[]` | PRODUCT OK delta |
| Spot screens `01` / `03` / `05-si-date-surface` | exist · hint visible · WH badge IE3ORQ · SI `dd/MM/yyyy` | ASSET OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uat-emp-soft-obs-qc-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |

---

## Scope boundary (explicit)

| In seal | Out of seal |
|---------|-------------|
| Soft OBS OBS-D1-HINT + OBS-SI-DATE-ISO CLOSED | Full personnel module UAT / `hrm_personnel_uat_ready=true` |
| D1/D5/J03 remain SEALED | `employees_e2e_linkage_ready=true` |
| Tighten GWC residual wording (soft OBS closed) | Clean GO wording · Phase 1 DONE · production GO |
| Honesty flags **false** | Explicit full-module GO without sponsor seat |

**NOT Phase 1 DONE.** **NOT** `hrm_personnel_uat_ready`. **NOT** clean GO. **NOT** `employees_e2e_linkage_ready`.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | See below |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-uat-emp-soft-obs-qc-01.md` |
| **ack_status** | **PASS_TO_PM** |

### completion_report

**GO WITH CONDITIONS** for soft OBS close delta on personnel UAT pack. Stamp `EMPOBS-IE3ORQ` proves **OBS-D1-HINT CLOSED** (HRD_01 hint visible · HRD_03 absent) and **OBS-SI-DATE-ISO CLOSED** (SI card/periods `dd/MM/yyyy` · no ISO leak). D1/D5/J03 **SEALED not reopened**. Prior pack GWC (`po-uat-emp-qc-01`) retained; GWC wording may drop open soft OBS. **DENIED** invent `hrm_personnel_uat_ready=true` — **no clean GO wording**; CONDITION remains **`C-SLICE-≠-MODULE`**. U65 / seed DENIED. **NOT** Phase 1 DONE / full-module GO.

### next_owner

pm

### next_dispatch_prompt

```text
work_item_id: PO-UAT-EMP-PM-SOFT-OBS-CLOSE-01
from_role: pm
to_role: pm (bus + backlog)
lane: governance
parent: PO-UAT-EMP-SOFT-OBS-QC-01 GO WITH CONDITIONS
prior_pack: docs/qa/evidence/po-uat-emp-qc-01.md (GWC pack slice)

task:
  - Bus INTAKE: soft OBS OBS-D1-HINT + OBS-SI-DATE-ISO CLOSED (EMPOBS-IE3ORQ); D1/D5/J03 still SEALED
  - Tighten GWC residual wording — soft OBS no longer OPEN; keep pack GWC + C-SLICE-≠-MODULE
  - Keep hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false (QC DENIED invent — no clean GO · C-SLICE remains)
  - Do NOT claim clean GO / full-module UAT / Phase1 DONE
  - Continue PO-UAT-MODULES-PARALLEL-01 next open lane — idle-ok this EMP soft-OBS delta

exit: bus updated · honesty flags unchanged · no invent hrm_personnel_uat_ready=true
evidence: docs/qa/evidence/po-uat-emp-soft-obs-qc-01.md
```
