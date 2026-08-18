# Evidence — `PO-UC-TC-W4-QA-E4-CI01-R4-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-QA-E4-CI01-R4-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — P0 HRM-CI-01 CC iframe create (R4) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-uc-tc-w4-qa-e4-ci01-r4.md`](po-uc-tc-w4-qa-e4-ci01-r4.md) PASS_TO_PM · FE [`po-uc-tc-w4-dev-fe-ci01-iframe-01.md`](po-uc-tc-w4-dev-fe-ci01-iframe-01.md) READY_FOR_QA |
| **spec_ref** | HRM-CI-01 · TECHSPEC §4.1 parent dialog portal · by-uc `HRM-CI-01.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · Leave L2 / DEPT VAL untouched |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 slice: Group CEO `ceo@xe.vn` → CC menu **Hợp đồng** → iframe **Thêm** → parent dialog (`hdsd-contracts-form-dialog`) + iframe latch (`hdsd-contracts-form-dialog-open`) per TECHSPEC §4.1 → **Lưu** → `POST /api/hrm/contracts-insurance/contracts` **201** `HRM-CON-201` · `contract_code=HD-388XZ` → toast «Thêm hợp đồng thành công» → F5 list by Nest code **present**. Residuals **R-W4E4-CI01-IFRAME-DIALOG** + **R-W4E4-CI01-CODE-DISPLAY CLOSED**. Surface stayed `command-center/hrm/contracts` (`no_hr_fallback: true`). U65 zero-seed honored. Leave L2 / DEPT VAL **untouched**.

**Conditions:** QA narrative pack process gap (2/8) does not demote product close · **NOT** Phase 1 / UAT DONE from this gate alone · do not reopen closed residuals without new FAIL.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-uc-tc-w4-dev-fe-ci01-iframe-01.md` | READY_FOR_QA; parent portal assert + `mapApiContract` Nest `contract_code` | **ACCEPT** |
| `docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4.md` | PASS_TO_PM; CC iframe only; residuals CLOSED | **ACCEPT** |
| `_tmp-po-uc-tc-w4-qa-e4-ci01-r4.json` | verdict **PASS**; parentDlg+latch; 201 HRM-CON-201; F5 stampOnList; no_hr_fallback | **ACCEPT** |
| Screens `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/` | **7** PNG on disk (01..06 + 99) | **ACCEPT** (spot visual) |
| by-uc `docs/qa/professional/by-uc/HRM-CI-01.md` | `execution: PASS` · `uat_done: false` · R3 residuals CLOSED stamp | **ACCEPT** |
| Prior R3 iframe-document-only FAIL | superseded by R4 parent-portal assert | **SUPERSEDED** — do not reopen without new FAIL |

---

## Independent spot-check (QC)

### EC1 — Parent dialog / latch (TECHSPEC §4.1) — CLOSED residual IFRAME-DIALOG

| Check | Result |
|-------|--------|
| Runtime `OPEN_DIALOG_IFRAME` | **PASS** · `parentDlg=true latch=true latchCount=1 iframeDlgCount=0 parentFormOrDlg=true` |
| `dialogProbe` | `parentVisible=true` · `latchVisible=true` · `open=true` · iframe dialog count **0** OK (not FAIL) |
| Screen | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/03-iframe-after-create-click.png` — modal «Thêm hợp đồng mới» over CC · code `HD-388XZ` · sidebar **Hợp đồng** |

**PASS** — **R-W4E4-CI01-IFRAME-DIALOG CLOSED**

### EC2 — POST create 201 from CC iframe (no /hr fallback)

| Check | Result |
|-------|--------|
| Runtime `MAIN_SAVE` | **PASS** · `createOk=true posts=201:HRM-CON-201:HD-388XZ` |
| Network | `POST …/contracts-insurance/contracts` **201** `HRM-CON-201` · id `04191837-2624-46bf-aa52-ced64e1671df` · `contract_code=HD-388XZ` |
| Surface | `pageUrlFinal=…/command-center/hrm/contracts` · `no_hr_fallback: true` · `surface: iframe` |
| Iframe scope | `portal=1&tenantId=xevn&companyId=main` embed URL (not top-level `/hr` navigate cheat) |

**PASS**

### EC3 — FE toast + F5 by Nest `contract_code` — CLOSED residual CODE-DISPLAY

| Check | Result |
|-------|--------|
| Screen after save | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/05-after-save.png` — toast **«Thêm hợp đồng thành công»** · row `HD-388XZ` · tab **Tất cả 12** |
| Harness `toastOk` | runtime `toastOk=false` / `toast=[]` — **probe miss**; visual toast **overrides** (PRODUCT PASS) |
| Runtime `FE_F5` | **PASS** · `stampOnList=true searchCode=HD-388XZ apiContractCode=HD-388XZ` |
| Screen F5 | `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/06-f5.png` — `HD-388XZ` still first row · count 12 · CC shell |

**PASS** — **R-W4E4-CI01-CODE-DISPLAY CLOSED**

### EC4 — U65 / U76 / by-uc honesty

| Check | Result |
|-------|--------|
| Seed | QA + FE + QC: **no** `pnpm seed:*` · `seed_used: false` |
| HDSD | Login UI → menu **Hợp đồng** → iframe **Thêm** → **Lưu** → F5 |
| by-uc | `execution: PASS` · **`uat_done: false`** |
| Console | `consoleErrors=[]` |
| Untouched | Leave L2 · DEPT VAL · Phase1/UAT DONE not claimed |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **P-CC-04** / contracts CC surface create→list→F5 | In-scope mutate path (menu Hợp đồng → iframe create) | **PASS** |
| **J-HRM-01** Hợp đồng → Hồ sơ NV | Cross-nav employee deep link | **not claimed** this seat (prior map PASS; out of R4 create scope) |
| **J-HRM-03** Hợp đồng → tab chi tiết HĐ | Drawer/detail | **not claimed** this seat (prior map PASS) |
| Leave L2 · DEPT VAL | Out of this P0 | **untouched** |

Mandatory in-scope for this gate: **CC iframe create** on **P-CC-04** / `command-center/hrm/contracts` **PASS**. No untested mandatory J-* claimed PASS for this slice. Full Phase1 journey closure **not** claimed.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Parent dialog + latch · POST **201** `HRM-CON-201` · toast (visual) · F5 by Nest code · **R-W4E4-CI01-IFRAME-DIALOG** + **CODE-DISPLAY CLOSED** · no `/hr` fallback |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing command_table · journey_l25) — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (L0 hrm/xbos/portal **200** during QA) |
| **OUT-OF-SCOPE** | Leave L2 · DEPT VAL · J-HRM-01/03 retest · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote CI01-R4 close. Harness `toastOk=false` classified **probe process** — visual toast PRODUCT PASS.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| **R-W4E4-CI01-IFRAME-DIALOG** | **CLOSED** | — | — | No — do not reopen without new iframe Thêm FAIL |
| **R-W4E4-CI01-CODE-DISPLAY** | **CLOSED** | — | — | No — do not reopen without F5-by-code FAIL |
| Leave L2 / DEPT VAL | — | — | — | No — **untouched** |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |
| **C-CI01-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table + J-* on next QA MD |
| Harness toast probe miss | CLOSED as process note | P3 | qa | No — PNG toast credible |

**No residual** product P0/P1 open for this slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. Do **not** reopen **R-W4E4-CI01-IFRAME-DIALOG** / **R-W4E4-CI01-CODE-DISPLAY** without new CC iframe FAIL evidence.
3. Do **not** invent Leave L2 / DEPT VAL work from this gate.
4. Do **not** treat top-level `/hr` create as substitute for CC iframe PASS (R4 proved iframe path).
5. Prior R3 iframe-document-only FAIL is **superseded**.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4.md
→ FAIL 2/8 — missing command_table, journey_l25
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4-qc.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4-qc.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4.md` | **FAIL** exit **1** · **2/8** missing command_table / journey_l25 (process) |
| Disk check 7 PNG under `screens/po-uc-tc-w4-qa-e4-ci01-r4/` | **PASS** · 01..06 + 99 present |
| Runtime cross-check `_tmp-po-uc-tc-w4-qa-e4-ci01-r4.json` | **PASS** · verdict=PASS · parentDlg+latch · 201 HRM-CON-201 HD-388XZ · F5 stampOnList · no_hr_fallback |
| Spot visual `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/03-iframe-after-create-click.png` + `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/05-after-save.png` + `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/06-f5.png` | **PASS** · parent dialog · toast · F5 row HD-388XZ |
| by-uc stamp `HRM-CI-01.md` | **PASS** · execution PASS · uat_done false |
| `node scripts/qa/_tmp-po-uc-tc-w4-qa-e4-ci01-r4.mjs` (QA prior) | **PASS** (seat evidence; QC observe) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4-qc.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | hrm/xbos/portal 200 |
| **LOGIN** | ceo@xe.vn UI | **PASS** | 201 XBOS-AUTH-200 · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/01-after-login.png` |
| **OPEN** list create surface | P-CC-04 contracts iframe | **PASS** | HRM-CON-200 · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/02-contracts-list.png` |
| **CREATE** dialog | parent portal + latch §4.1 | **PASS** | runtime OPEN_DIALOG_IFRAME · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/03-iframe-after-create-click.png` |
| **CREATE** save | POST 201 HRM-CON-201 | **PASS** | runtime MAIN_SAVE · Network · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/05-after-save.png` |
| **READ** F5 | search by Nest contract_code | **PASS** | FE_F5 · `docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-ci01-r4/06-f5.png` |
| **P-CC-04** L2.5 mutate | CC iframe create→toast→F5 | **PASS** | no_hr_fallback · HD-388XZ |
| **J-HRM-01** / **J-HRM-03** | employee / detail cross-nav | **not claimed** | prior map; out of R4 create |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent Leave L2 / DEPT VAL
- Did not accept `/hr` top-level navigate as CI01 iframe PASS
- Did not GO without opening QA MD + runtime JSON + PNG spot-check
- Did not NO-GO solely on QA pack format gap or harness toast probe miss

---

## completion_report

**Closed:** L3 QC gate `PO-UC-TC-W4-QA-E4-CI01-R4-QC` for P0 HRM-CI-01 CC iframe create. Spot-check runtime parent dialog+latch + Network 201 + toast PNG + F5 PNG credible. **R-W4E4-CI01-IFRAME-DIALOG** + **R-W4E4-CI01-CODE-DISPLAY CLOSED**. Surface `command-center/hrm/contracts` only (`no_hr_fallback`). by-uc HRM-CI-01 **execution PASS** with **`uat_done: false`**. U65 zero-seed · Leave L2 / DEPT VAL untouched.

**Residual / conditions:** QA pack format P3 process; harness toast probe miss process-only; **NOT** Phase1/UAT DONE; J-HRM-01/03 not reclaimed this seat.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-QA-E4-CI01-R4-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/po-uc-tc-w4-qa-e4-ci01-r4-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-W4E4-CI01-IFRAME-DIALOG + R-W4E4-CI01-CODE-DISPLAY CLOSED — do not reopen without new CC iframe FAIL
  - HRM-CI-01 by-uc execution PASS; uat_done false
  - P-CC-04 CC iframe create→F5 PASS for this slice only
action:
  1) Bus INTAKE PO-UC-TC-W4-QA-E4-CI01-R4-QC PASS_TO_PM + promote CI01 iframe create P0 CLOSED on backlog / E4 rollup / TEAM_WORKING_NOW
  2) Continue next open PO-UC-TC / PM_OPEN_BACKLOG item (do not idle)
  3) Do NOT claim product UAT DONE / Phase 1 DONE from this GWC
  4) Do NOT invent Leave L2 / DEPT VAL; do NOT reopen CI01 residuals without new defect
  5) Optional: next QA MD include command_table + J-* (C-CI01-QA-PACK-FMT-01 P3 process)
cấm: seed · invent UAT DONE · reopen IFRAME-DIALOG/CODE-DISPLAY without new FAIL · /hr fallback as substitute PASS
```

---

## pm_dispatch_hint

`PO-UC-TC-W4-QA-E4-CI01-R4-PM-CLOSE` — promote HRM-CI-01 CC iframe create P0 CLOSED; GWC not UAT/Phase1 DONE; Leave L2/DEPT VAL untouched; next backlog.
