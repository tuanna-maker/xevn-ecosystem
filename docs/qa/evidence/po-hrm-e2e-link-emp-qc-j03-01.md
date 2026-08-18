# Evidence — `PO-HRM-E2E-LINK-EMP-QC-J03-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-EMP-QC-J03-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | L3 gate — **narrow CONDITION close only** (`R-J03-DIALOG`) |
| **priority** | P2 residual close · D1/D5 sealed untouched · module UAT denied |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` (QA used dist `start:prod`) |
| **Verdict** | **GO WITH CONDITIONS** — EMP linkage GWC **retained**; CONDITION **R-J03-DIALOG CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-E2E-LINK-EMP-QA-J03-01` `PASS_TO_PM` |
| **gwc_parent** | [`po-hrm-e2e-link-emp-qc-01.md`](po-hrm-e2e-link-emp-qc-01.md) — CONDITION R-J03-DIALOG was OPEN |
| **qa_ref** | [`po-hrm-e2e-link-emp-qa-j03-01.md`](po-hrm-e2e-link-emp-qa-j03-01.md) |
| **machine** | [`_tmp-po-hrm-e2e-link-emp-qa-j03-01.FINAL.json`](_tmp-po-hrm-e2e-link-emp-qa-j03-01.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-emp-qa-j03-01/` (00–03) |
| **spec_ref** | `PROGRAM_JOURNEY_MAP.md` J-HRM-03 · EMP GWC CONDITION R-J03-DIALOG |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — condition close ≠ personnel module UAT |

### Honesty locks (mandatory — unchanged)

| Flag | Value | QC note |
|------|-------|---------|
| **hrm_personnel_uat_ready** | **false** | **DENIED** — cấm claim / promote |
| **employees_e2e_linkage_ready** | **false** | **DENIED** — J03 close ≠ linkage program closed |
| **Module personnel UAT** | **DENIED** | Not certified |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` |

---

## Verdict summary

**GO WITH CONDITIONS (delta)** — ACCEPT browser proof that **J-HRM-03 PASS** closes EMP GWC CONDITION **R-J03-DIALOG**.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| **J-HRM-03** list → Eye → dialog populated | Machine `journey.J-HRM-03.verdict=PASS` · code `HD-QVQ6L` · parent dialog + iframe latch · PNG 03 | 🟢 **ACCEPT** — closes **R-J03-DIALOG** |
| must_keep UF-HRM-02 create + pencil | `createBtn=1` · pencilProxy · PNG 01/03 | 🟢 **SEALED** (spot) |
| **D1** WH neo | Parent QC-01 | 🟢 **SEALED** — **not reopened** |
| **D5** SI body `company_id` | Parent QC-01 | 🟢 **SEALED** — **not reopened** |
| **D2 / D6 / J-01/02/04** | Parent QC-01 | 🟢 **SEALED** (prior) |
| Module / linkage ready flags | Explicit **false** | 🟢 honesty retained |
| Seed / API-only PASS | DENIED | 🟢 U65 |

**Cấm:** `hrm_personnel_uat_ready=true` · `employees_e2e_linkage_ready=true` · reopen CLOSED D1/D5 · Phase 1 DONE · personnel module UAT.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| EMP QC-01 GWC | `po-hrm-e2e-link-emp-qc-01.md` | PASS_TO_PM | **RETAIN** — D1/D5 sealed; R-J03 was OPEN CONDITION |
| FE-J03 | (parent of QA) | READY_FOR_QA | Cited by QA |
| QA-J03 | `po-hrm-e2e-link-emp-qa-j03-01.md` | PASS_TO_PM | **ACCEPT** U65 browser + machine overall PASS |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `l0` hrm/xbos/portal | 200 | 🟢 |
| `steps.LOGIN` / `LIST` | PASS · rows=10 · GET `HRM-CON-200` | 🟢 |
| `steps.CLICK_VIEW_BTN` | PASS · `iframe-testid` | 🟢 |
| `journey.J-HRM-03.verdict` | **PASS** | 🟢 |
| `dialog.open` · `parentCount` · `latchCountIframe` | true · 1 · 1 | 🟢 testid gate (not role-only) |
| `content.codeText` · `populated` · `titleHit` | `HD-QVQ6L` · true · true | 🟢 not empty shell |
| `MUST_KEEP_UF_HRM_02` | PASS createBtn=1 | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `denied[]` | seed · personnel UAT · full_emp_matrix | 🟢 |
| `residuals[R-J03-DIALOG].status` | **CLOSED** | 🟢 |
| `consoleErrors` | `[]` | 🟢 |
| `overall` | **PASS** | 🟢 |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `01-contracts-list.png` | Contracts list · **+ Thêm hợp đồng** · Eye/Pencil/Trash · row `HD-QVQ6L` |
| `03-view-dialog.png` | Modal **Chi tiết hợp đồng** · Mã **HD-QVQ6L** · UAT NV 0100 · status Có hiệu lực · dates `dd/MM/yyyy` |

---

## Gate AC audit (narrow)

| # | AC / Check | Evidence | QC |
|---|------------|----------|-----|
| 1 | L0 stack (QA-time) | Machine l0 200 | 🟢 |
| 2 | Eye click opens view surface (testid) | parent dialog + iframe latch | 🟢 **PROMOTED** |
| 3 | Content populated (not empty shell) | code + title + body | 🟢 **PROMOTED** |
| 4 | Residual R-J03-DIALOG | CLOSED | 🟢 **CLOSED** |
| 5 | D1/D5 sealed untouched | Parent GWC + this seat scope | 🟢 **not reopened** |
| 6 | U65 zero-seed | denied seed · browser click path | 🟢 |
| 7 | Honesty flags stay false | MD + machine | 🟢 denied promote |
| 8 | Module UAT / Phase 1 | Explicit DENIED / NOT claimed | 🟢 |

---

## L2.5 journey matrix (U19 — delta only)

| Journey | Prior (QC-01) | This seat | QC |
|---------|---------------|-----------|-----|
| **J-HRM-01** | PASS | — (not reopened) | 🟢 sealed |
| **J-HRM-02** | PASS | — | 🟢 sealed |
| **J-HRM-03** | PARTIAL / CONDITION | **PASS** | 🟢 **CONDITION CLOSED** |
| **J-HRM-04** | PASS | — | 🟢 sealed |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| J-HRM-03 Eye → populated dialog | **PRODUCT** (closed) | QA browser + PNG prove open+content |
| hrm-api nest `--watch` TS2345 (`contract-legal-print.service.ts` custom_fields) | **OBS** P2 ops | Blocks watch compile; QA used `start:prod` dist — **not** J03 product fail · **owner: BE separate seat** |
| Soft OBS WH hint / SI ISO date (parent) | **OBS** soft | Remain cosmetic — **not** new EMP CONDITION |
| Portal `:5173` | **ENV OBS** | QA L0 PASS on evidence port |

---

## Residual board (EMP GWC after this seat)

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-EMP-SI-ACTION-COMPANY-ID-BODY** | P0 | — | **CLOSED** | Prior QC-01 — not reopened |
| **R-EMP-DEC-WH-NEO-CATALOG** | P0 | — | **CLOSED** | Prior — not reopened |
| **R-J03-DIALOG** | P2 | — | **CLOSED** | This seat — Eye dialog + populated detail |
| OBS WH hint HRD_01 | P2 | — | OPEN soft | Cosmetic only — not CONDITION |
| OBS SI date ISO display | P2 | — | OPEN soft | Locale polish — not CONDITION |
| OBS hrm-api nest watch TS2345 | P2 | **dev-be** (separate) | OPEN ops | Not EMP product CONDITION |

**P0 residuals for this WI:** none.  
**EMP GWC CONDITION board for J03:** **clear** (R-J03 CLOSED). Soft OBS ≠ CONDITION.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-emp-qa-j03-01.md` | exit **0** · **8/8** | 🟢 PROCESS OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-emp-qc-01.md` | exit **0** · **8/8** | 🟢 parent pack OK |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-emp-qc-j03-01.md` | expected **PASS** 8/8 after this file | QC pack SoT |
| QA machine overall | **PASS** | PRODUCT OK |
| Optional L0 re-spot | **not required** — QA L0 200 + pack integrity sound | OBS skip |

---

## Scope boundary (explicit)

| In seal (this seat) | Out of seal |
|---------------------|-------------|
| J-HRM-03 PASS · **R-J03-DIALOG CLOSED** | Full personnel module UAT |
| EMP GWC retained with J03 condition cleared | `employees_e2e_linkage_ready=true` |
| D1/D5 **must remain sealed** | Reopen D1/D5 / expand EMP matrix |
| Honesty flags **false** | Phase 1 DONE · production GO · nest watch TS fix (BE seat) |

**NOT Phase 1 DONE.** **NOT** `hrm_personnel_uat_ready`. **NOT** `employees_e2e_linkage_ready`.

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | **GO WITH CONDITIONS (delta)** — EMP linkage GWC retained; **CONDITION R-J03-DIALOG CLOSED** via J-HRM-03 browser PASS (Eye → parent `hdsd-contracts-view-dialog` + latch · code `HD-QVQ6L` · populated). D1/D5 **not reopened**. Honesty **false**. Soft OBS + nest watch TS2345 = ops/cosmetic only (BE separate). Residual board **clear for J03**. **Cấm** promote personnel/linkage UAT. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | See below |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-emp-qc-j03-01.md` |
| **ack_status** | **PASS_TO_PM** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-EMP-PM-J03-CLOSE-01
from_role: pm
to_role: pm (bus + residual board)
lane: governance
parent: PO-HRM-E2E-LINK-EMP-QC-J03-01 GO WITH CONDITIONS (R-J03 CLOSED)

task:
  - Bus INTAKE: EMP GWC CONDITION R-J03-DIALOG CLOSED · J-HRM-03 PASS
  - Keep hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false
  - Do NOT reopen D1/D5
  - EMP J03 residual CONDITION board clear; soft OBS optional
  - Optional separate seat (non-blocking): Task dev-be for nest watch TS2345 contract-legal-print.service.ts
  - Continue program backlog next P0 — do not claim personnel module UAT

exit: bus updated · honesty flags unchanged · idle-ok this EMP J03 condition lane
evidence: docs/qa/evidence/po-hrm-e2e-link-emp-qc-j03-01.md
```
