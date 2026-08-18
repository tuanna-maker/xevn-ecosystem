# Evidence — `PO-HRM-E2E-LINK-PAY-CFG-QC-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-E2E-LINK-PAY-CFG-QC-03` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **PAY-CFG O4 Settings `salary_components` key + AC-PAY-COMP-01 picker slice** (not module UAT · not J-HRM-07 process) |
| **priority** | P1 |
| **parent** | `PO-HRM-E2E-LINK-PAY-CFG-QA-03` |
| **prior_be** | `PO-HRM-E2E-LINK-PAY-CFG-O4-SC-KEY-BE-01` READY_FOR_QA (Option A synthesize) |
| **prior_qa** | `PO-HRM-E2E-LINK-PAY-CFG-QA-03` PASS_TO_PM stamp **`PAYCFGQA03-MSIS9HM9`** |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **journey_l25** | Settings Danh mục `salary_components` → FE create → F5 · Lương Thành phần lương CatalogSearchPicker + invent negative — **not** J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — O4 key + AC-PAY-COMP-01 picker ACCEPT · **O4 residual from QA-02 CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-e2e-link-pay-cfg-qa-03.md`](po-hrm-e2e-link-pay-cfg-qa-03.md) stamp **`PAYCFGQA03-MSIS9HM9`** |
| **be_ref** | [`po-hrm-e2e-link-pay-cfg-o4-sc-key-be-01.md`](po-hrm-e2e-link-pay-cfg-o4-sc-key-be-01.md) READY_FOR_QA |
| **machine** | [`_tmp-po-hrm-e2e-link-pay-cfg-qa-03-browser.json`](_tmp-po-hrm-e2e-link-pay-cfg-qa-03-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-cfg-qa-03/` (01–10) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — PAY-CFG O4+picker GWC ≠ payroll module UAT / Phase1 DONE / J-HRM-07 flip |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`settings_catalog_e2e_ready`** | **not claimed** | Slice Settings key density only |
| **J-HRM-07 process UAT** | **DENIED** this seat | Historical shell PASS ≠ this picker seat promote |
| **Module UAT / Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser UF only · `seed_used=false` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT O4 Settings overview key `salary_components` (Option A synthesize) + U65 browser FE create extension POST **201** → F5 `effectiveItems>0` + AC-PAY-COMP-01 CatalogSearchPicker positive + invent-code negative + instance POST **201** `QA_SC_IS9HM9` + F5 row + picker-again remaining. Audited QA-03 MD + machine JSON stamp `PAYCFGQA03-MSIS9HM9` + BE-01 + screens 01/05/09 + pack verify **8/8**. **O4 residual from QA-02 CLOSED**. Residual **OBS-SC-OVERVIEW-NAME** (P3) + **XBOS `salary_components`/`pay_types` 404** (P2 HOLD) + **C-SLICE-≠-MODULE** only — **not** product NO-GO. **DENIED** `payroll_e2e_ready=true` · module UAT · J-HRM-07 flip · Phase1 DONE.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| API overview `salary_components` key | QA-03 · JSON `settingsHasSalaryComponentsKey=true` | 🟢 **ACCEPT** |
| Settings Select VI label | «Thành phần lương (danh mục)» | 🟢 **ACCEPT** |
| FE create extension → F5 eff>0 | POST **201** · codes `QA_SC_IS9HM9`,`QA_SB_IS9HM9` · eff=**3** | 🟢 **ACCEPT** |
| AC-PAY-COMP-01 CatalogSearchPicker | `pay-salary-component-catalog-picker` · free-text hidden | 🟢 **ACCEPT** |
| AC-PAY-COMP-01 invent negative | `INVENT_IS9HM9` no successful POST | 🟢 **ACCEPT** |
| Pick + save instance + F5 | POST **201** · row `QA_SC_IS9HM9` after F5 | 🟢 **ACCEPT** |
| Picker again (remaining code) | `QA_SB_IS9HM9` pickable | 🟢 **ACCEPT** |
| Unit Zod/picker | vitest **41/41** (cited QA) | 🟢 **ACCEPT** |
| Honesty / console | ready=false · no Uncaught | 🟢 **ACCEPT** |
| Pack verify QA-03 | **8/8** exit 0 | 🟢 **PROCESS OK** |
| OBS overview `name` raw key | JSON `name="salary_components"` · Select VI OK | 🟡 **CONDITION OK** (P3) |
| XBOS catalog 404 | QA-02 carry | 🟡 **HOLD** (P2) — out of slice |
| **C-SLICE-≠-MODULE** / ready / Phase1 / J-HRM-07 | Explicit DENIED | 🟢 |

**Cấm:** invent `payroll_e2e_ready=true` · promote J-HRM-07 / module UAT / Phase1 DONE · reopen O4 key absence without regression · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · picker/Settings density ≠ process payslip · J-HRM-07 not re-proven this seat · XBOS HOLD open |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim O4 `salary_components` key closed? | **YES** — this seat ACCEPT |
| May PM claim AC-PAY-COMP-01 picker closed? | **YES** — this seat ACCEPT |
| Idle-ok this PAY-CFG O4+picker slice? | **YES** — residuals P3 OBS + P2 XBOS HOLD only (not forced product fix) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-01 O4 Option A | `po-hrm-e2e-link-pay-cfg-o4-sc-key-be-01.md` | READY_FOR_QA | **ACCEPT** prior |
| QA-03 browser U65 | `po-hrm-e2e-link-pay-cfg-qa-03.md` | PASS_TO_PM | **ACCEPT** stamp `PAYCFGQA03-MSIS9HM9` |
| Machine QA-03 | `_tmp-po-hrm-e2e-link-pay-cfg-qa-03-browser.json` | PASS | **ACCEPT** |
| Screens 01–10 | `screens/po-hrm-e2e-link-pay-cfg-qa-03/` | present (10 PNGs) | **ACCEPT** spot-check 01/05/09 |
| Pack verify QA-03 | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `honesty.payroll_e2e_ready` / `seed_used` | **false** / **false** | 🟢 |
| `l0` hrm/xbos/portal | all **200** | 🟢 |
| `probes.settingsHasSalaryComponentsKey` | **true** | 🟢 |
| `probes.settingsSalaryComponentsName` | `salary_components` (raw — OBS P3) | 🟡 OBS OK |
| `probes.settingsSalaryComponentsEff` | **3** | 🟢 |
| `ac.API-OVERVIEW-SC-KEY` … `AC-PAY-COMP-01-PICKER-AGAIN` | all **PASS** | 🟢 |
| `UF-SETTINGS-FE-CREATE-SC` | POST **201** `QA_SC_IS9HM9` + `QA_SB_IS9HM9` | 🟢 |
| `UF-SETTINGS-EFF-AFTER-F5` | eff codes include both + prior | 🟢 |
| `AC-PAY-COMP-01-INVENT-NEGATIVE` | `inventPosts=[]` | 🟢 |
| `UF-MUTATE-POST` | **201** `QA_SC_IS9HM9` | 🟢 |
| `UF-F5-INSTANCE` | row after F5 | 🟢 |
| `CONSOLE-GATE` / `HONESTY-NO-E2E-READY` | PASS | 🟢 |
| `overall` | **PASS** | 🟢 |

### Screen spot-check

| Screen | Observed | QC |
|--------|----------|-----|
| `01-settings-catalogs.png` | Settings Danh mục (XBOS+HRM) surface · sync UI · catalog tables | 🟢 |
| `05-add-dialog.png` | Modal «Thêm mới thành phần lương» · Mã = picker «Chọn mã từ danh mục…» · note cấm free-text when catalog có data | 🟢 |
| `09-f5-instance.png` | Tab Thành phần lương · row **`QA_SC_IS9HM9`** «TP lương QA IS9HM9» Active · total 14 | 🟢 |

---

## Gate AC audit (browser U65)

| # | Expected | Observed | QC |
|---|----------|----------|-----|
| 1 | Overview includes `salary_components` | Key present · O4 closed | 🟢 |
| 2 | Select VI label | «Thành phần lương (danh mục)» | 🟢 |
| 3 | FE create → F5 eff>0 | 201 ×2 · eff=3 | 🟢 |
| 4 | CatalogSearchPicker when SC>0 | Picker visible · free-text hidden | 🟢 |
| 5 | Invent negative | No invent POST 2xx | 🟢 |
| 6 | Pick + Lưu + F5 | 201 · row `QA_SC_IS9HM9` | 🟢 |
| 7 | Thêm again picker bound | Remaining `QA_SB_IS9HM9` | 🟢 |
| 8 | Honesty ready=false · U65 | Locked | 🟢 |
| 9 | J-HRM-07 / module UAT / e2e_ready | Not this seat | ⬜ **OUT OF SCOPE** |

### L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-03 | QC |
|-----------------|-------|-------|-----|
| **Settings O4 `salary_components` key + FE density** (in-scope) | BE-01 READY | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| **AC-PAY-COMP-01 picker + invent** (in-scope) | QA-02 BLOCKED → closed | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** process / phiếu lương e2e | Historical map ✅ | **not claimed** | ⬜ **DEFERRED** — honesty false · **cấm promote** |
| XBOS publish `salary_components` | QA-02 P2 HOLD | HOLD | 🟡 **HOLD** — not slice NO-GO |

**U19 note:** This gate certifies the **PAY-CFG O4 Settings key + AC-PAY-COMP-01 picker** slice named in dispatch — **not** a claim that **J-HRM-07** process UAT or payroll module UAT is newly GO. Missing process UAT does **not** NO-GO this seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (browser U65)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| GET settings-catalogs overview key | Read | **PASS** |
| POST settings-catalogs/items (`salary_components`) | Create ×2 | **PASS** |
| F5 Settings density | Read persist | **PASS** |
| Invent free-text code | Create blocked | **PASS** (negative) |
| POST `/payroll/salary-components` from picker | Create | **PASS** |
| F5 payroll components list | Read persist | **PASS** |
| Hard-delete / XBOS publish | — | **N/A this seat** |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-03 pack verify **8/8** | **PROCESS OK** | exit 0 — QC audit entry valid |
| O4 key + FE create + picker + invent + instance F5 | **PRODUCT OK** | Matches BE-01 Option A + AC-PAY-COMP-01 |
| OBS overview `name` raw key when extension exists | **PRODUCT OBS** (P3) | Select VI label OK — polish only · **not** demote |
| XBOS `salary_components`/`pay_types` 404 | **SCOPE / HOLD** (P2) | Blocks ready=true · **not** picker product NO-GO |
| J-HRM-07 / module UAT / Phase1 | **SCOPE / CONDITION** | Honesty DENIED promote |
| L0 stack (cited QA) | **ENV OK** | Observe-only this QC |
| No P0/P1 product residual on O4+picker UF | **PRODUCT OK** | Slice ACCEPT |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **C-SLICE-≠-MODULE** | honesty | `pm` | **CONDITION** | O4+picker GWC ≠ module UAT / Phase1 / J-HRM-07 flip |
| **OBS-SC-OVERVIEW-NAME** | P3 | optional ba/fe | **CONDITION OK** | overview `name` may be raw `salary_components`; Select VI OK |
| **XBOS-SC-PAYTYPES-404** | P2 | devops/XBOS | **HOLD** | Carry QA-02 — not this wave |
| Dual SoT starters ≠ Settings picker | P2 honesty | ba/sa | **DOCUMENTED** | Option B/C deferred · unchanged |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process e2e | L2.5 | — | **DEFERRED** | Not claimed / not flipped |

**P0/P1 product residuals for this PAY-CFG O4+picker WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + OBS P3 + XBOS P2 HOLD — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified O4+picker browser UF.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-03.md` | exit **0** · **8/8** | **PROCESS OK** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qc-03.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness (prior) stamp `PAYCFGQA03-MSIS9HM9` | **PASS** · machine JSON | PRODUCT OK (cited) |
| L0 (prior QA) | hrm/xbos/portal **200** | ENV OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + screen audit.

---

## completion_report

### Closed

1. QC narrow gate on PAY-CFG **O4 Settings `salary_components` key + AC-PAY-COMP-01 picker** — **GO WITH CONDITIONS**.  
2. Integrity ACCEPT vs QA stamp `PAYCFGQA03-MSIS9HM9` + BE-01 Option A + screens 01/05/09.  
3. **O4 residual from QA-02 CLOSED** (key present · FE density · picker · invent).  
4. Honesty: `payroll_e2e_ready=false` **LOCKED** · J-HRM-07 / module UAT / Phase1 **DENIED**.  
5. QA pack **8/8** PROCESS OK; this QC consolidates the seat.

### Residual

- **OBS-SC-OVERVIEW-NAME** (P3) · **XBOS 404** (P2 HOLD) · **C-SLICE-≠-MODULE** · ready flag locked false.  
- **Idle-ok** this PAY-CFG O4+picker slice for PM (XBOS HOLD not forced same-day product fix).

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok this slice) |
| **evidence_path** | `docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qc-03.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | ACCEPT O4+picker · **cấm** flip `payroll_e2e_ready` / J-HRM-07 / module UAT · idle-ok this seat |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-E2E-LINK-PAY-CFG-QC-03-INTAKE
from_role: qc
to_role: pm
lane: governance
priority: P1
prior: PO-HRM-E2E-LINK-PAY-CFG-QC-03 GO WITH CONDITIONS

## Mission (PM intake)
PAY-CFG O4 Settings salary_components key + AC-PAY-COMP-01 picker GWC ACCEPT.
O4 residual from QA-02 CLOSED. Stamp PAYCFGQA03-MSIS9HM9 audited.
Retain C-SLICE-≠-MODULE · OBS-SC-OVERVIEW-NAME P3 · XBOS 404 P2 HOLD.
Cấm invent payroll_e2e_ready=true · cấm promote J-HRM-07 / module UAT / Phase1 DONE.

## Decision
IDLE-OK this PAY-CFG O4+picker seat.

Optional (do NOT block this slice close):
1) OBS-SC-OVERVIEW-NAME — optional ba/fe polish overview display name
2) XBOS salary_components/pay_types 404 — HOLD devops/XBOS when program prioritizes

## evidence
docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qc-03.md
docs/qa/evidence/po-hrm-e2e-link-pay-cfg-qa-03.md (stamp PAYCFGQA03-MSIS9HM9)

## ack
PASS_TO_PM · honesty payroll_e2e_ready=false
```
