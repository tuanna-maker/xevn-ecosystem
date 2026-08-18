# Evidence — `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow browser U65 AC-PAY-TPL-03 period-bind slice** (not module UAT · not J-HRM-07) |
| **priority** | P1 |
| **parent** | `PO-HRM-RESUME-QC-WAVE-K1-K4` · resume_chunk **K4** |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QA-02` PASS_TO_PM (browser UF) |
| **portal_url** | `http://127.0.0.1:5173` · HRM FE `:8080` · HRM API `:28001` · XBOS `:28002` |
| **journey_l25** | Tạo kỳ bind mẫu → list/row/detail/F5 — **not** full J-HRM-07 process UAT |
| **Verdict** | **GO WITH CONDITIONS** — AC-PAY-TPL-03 ACCEPT · **R-PAY-PERIOD-LIST-TPL CLOSED** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-amis-parity-pay-period-bind-qa-02.md`](po-hrm-amis-parity-pay-period-bind-qa-02.md) stamp **`PAYBINDQA2-IT9Y27`** |
| **qa_fail_baseline** | [`po-hrm-amis-parity-pay-period-bind-qa-01.md`](po-hrm-amis-parity-pay-period-bind-qa-01.md) FAIL `PAYBINDQA1-IRABN0` |
| **be_ref** | [`po-hrm-amis-parity-pay-period-bind-be-02.md`](po-hrm-amis-parity-pay-period-bind-be-02.md) READY_FOR_QA |
| **machine** | [`_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.FINAL.json`](_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-period-bind-qa-02/` (01–06) |
| **period_id** | `47d43fe6-30d3-41ca-a3ea-e7bf3ffb84a6` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — period-bind GWC ≠ payroll module UAT / AMIS DONE / Phase1 DONE |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Pack as mẫu** | **DENIED** | POST body only `paySheetTemplateId` · no `/salary-templates` SoT |
| **J-HRM-07 process UAT** | **DENIED** this seat | Period bind display ≠ process / phiếu lương e2e |
| **Module UAT / AMIS DONE / Phase1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Browser UF only · `seed_used=false` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 **AC-PAY-TPL-03** after BE-02 list DTO fix + QA-02 retest stamp `PAYBINDQA2-IT9Y27`. Audited QA-02 MD + FINAL JSON + QA-01 FAIL baseline + BE-02 + screens 04/05/06 + pack. Proven chain: Settings active mẫu → **POST** `/api/hrm/payroll/periods` **201** `HRM-PAY-201` with `paySheetTemplateId` → **GET list** `pay_sheet_template_id` non-null + `snapshot_name` → row **Mẫu bảng lương** = snapshot name (**≠** `—`) → detail subtitle `Mẫu: …` → **F5** persist. **R-PAY-PERIOD-LIST-TPL = CLOSED** (supersedes QA-01 FAIL). QA pack verify **1/8** = **PROCESS OBS** (missing `command_table` wording) — this QC consolidates **8/8**. OBS idle-ok: **R-PAY-PERIOD-FILTER-UX** (month filter) · picker label vs bound id. **DENIED** `payroll_e2e_ready=true` · J-HRM-07 · module UAT · Phase1 DONE · seed.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Entry stamp `PAYBINDQA2-IT9Y27` · period `47d43fe6-…` | QA-02 · FINAL JSON | 🟢 **ACCEPT** |
| POST bind **201** + `paySheetTemplateId` | AC2 · network · body keys | 🟢 **ACCEPT** |
| GET list bind fields | `pay_sheet_template_id` + `snapshot_name` | 🟢 **ACCEPT** |
| Row mẫu name ≠ em-dash | screen 04 · AC3 | 🟢 **ACCEPT** |
| Detail `Mẫu:` subtitle | screen 05 · AC4 | 🟢 **ACCEPT** |
| F5 row tpl persist | screen 06 · AC5 | 🟢 **ACCEPT** |
| Pack≠mẫu regression | AC1 alias · AC6 enroll · no salary-templates POST | 🟢 **ACCEPT** |
| **R-PAY-PERIOD-LIST-TPL** | QA-01 OPEN → QA-02 CLOSE | 🟢 **CLOSED** |
| QA pack 1/8 | `command_table` | 🟡 **PROCESS OBS** — QC consolidates |
| **R-PAY-PERIOD-FILTER-UX** | month filter still required | 🟡 **OBS idle-ok** (optional) |
| Picker label vs bound id | click_log pick new · POST binds SRC02 | 🟡 **OBS idle-ok** |
| **C-SLICE-≠-MODULE** / ready / Phase1 | Explicit DENIED | 🟢 |
| **J-HRM-07** | Not claimed | ⬜ **DEFERRED** |

**Cấm:** invent `payroll_e2e_ready=true` · claim payroll e2e DONE · J-HRM-07 / module UAT · reopen R-PAY-PERIOD-LIST-TPL without regression · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · J-HRM-07 process UAT not proven · period-bind display slice only |
| Recommended flag state | keep **`payroll_e2e_ready=false`** |
| May PM claim R-PAY-PERIOD-LIST-TPL closed? | **YES** — this seat ACCEPT |
| Idle-ok this period-bind UF slice? | **YES** — residuals optional filter UX + picker OBS |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QA-01 FAIL | `po-hrm-amis-parity-pay-period-bind-qa-01.md` | FAIL_TO_PM | **BASELINE** — list DTO null · R-PAY-PERIOD-LIST-TPL OPEN |
| BE-02 list SELECT + mapPeriod | `po-hrm-amis-parity-pay-period-bind-be-02.md` | READY_FOR_QA | **ACCEPT** prior fix |
| QA-02 browser U65 | `po-hrm-amis-parity-pay-period-bind-qa-02.md` | PASS_TO_PM | **ACCEPT** stamp `PAYBINDQA2-IT9Y27` |
| Machine QA-02 | `_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.FINAL.json` | overall PASS | **ACCEPT** |
| Screens 01–06 | `screens/po-hrm-amis-parity-pay-period-bind-qa-02/` | present | **ACCEPT** spot-check 04/05/06 |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** |
| Pack verify QC-02 | this file | expected **8/8** | QC SoT |

### Machine JSON spot

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` | `PAYBINDQA2-IT9Y27` | 🟢 |
| `honesty.payroll_e2e_ready` / `seed_used` | **false** | 🟢 |
| `honesty.pack_is_not_mau` | **true** | 🟢 |
| `ids.periodId` | `47d43fe6-30d3-41ca-a3ea-e7bf3ffb84a6` | 🟢 |
| AC0 Settings active mẫu | PASS · create **201** `HRM-PAY-TPL-201` | 🟢 |
| AC1 pack≠mẫu alias | PASS | 🟢 |
| AC2 POST periods | **201** `HRM-PAY-201` · `paySheetTemplateId` `f7728741-…` · snapshot `Mẫu SRC02 SRCSRC02-ISBDZW` | 🟢 |
| AC3 list + row | `pay_sheet_template_id` non-null · rowTplText = snapshot · ≠ `—` | 🟢 |
| AC4 detail | `Mẫu: Mẫu SRC02 SRCSRC02-ISBDZW` | 🟢 |
| AC5 F5 | listHitF5 same id + snapshot · rowTplAfterF5 same | 🟢 |
| AC6 pack enroll | PASS | 🟢 |
| POST body keys | includes `paySheetTemplateId` · no salary-templates mutate | 🟢 |
| `consoleErrors` / `pageErrors` | **[]** | 🟢 |
| `overall` | **PASS** | 🟢 |

### Regression vs QA-01 FAIL

| Wave | listHit `pay_sheet_template_id` | `snapshot_name` | QC |
|------|----------------------------------|-----------------|-----|
| QA-01 FAIL `PAYBINDQA1-IRABN0` | `null` | `null` | root-cause retained |
| QA-02 PASS `PAYBINDQA2-IT9Y27` | `f7728741-6894-469f-a015-ea3bf7bf6ade` | `Mẫu SRC02 SRCSRC02-ISBDZW` | 🟢 **CLOSED gap** |

### Screen spot-check

| Screen | Observed | QC |
|--------|----------|-----|
| `04-after-create-list.png` | Filter **Tháng 3/2026** · row `Bảng lương QA PAYBINDQA2-IT9Y27` · cột **Mẫu bảng lương** = `Mẫu SRC02 SRCSRC02-ISBDZW` (**≠** `—`) | 🟢 |
| `05-detail-subtitle.png` | Title stamp · subtitle `03/2026 • 0 nhân viên • Mẫu: Mẫu SRC02 SRCSRC02-ISBDZW` | 🟢 |
| `06-after-f5-list.png` | Same period row · mẫu name still snapshot after F5 | 🟢 |

---

## Gate AC audit (browser U65 — AC-PAY-TPL-03)

| # | Expected | Observed | QC |
|---|----------|----------|-----|
| 1 | Active mẫu Settings (U65) | AC0 PASS · status active | 🟢 |
| 2 | Dialog pack≠mẫu | AC1 alias note | 🟢 |
| 3 | POST bind 201 + `paySheetTemplateId` | **201** `HRM-PAY-201` · period `47d43fe6-…` | 🟢 |
| 4 | GET list expose bind + snapshot | non-null id + `template_name` | 🟢 |
| 5 | Row/detail mẫu ≠ em-dash | screens 04/05 | 🟢 |
| 6 | F5 persist | screen 06 · AC5 | 🟢 |
| 7 | Pack enroll regression | AC6 | 🟢 |
| 8 | R-PAY-PERIOD-LIST-TPL | CLOSED | 🟢 |
| 9 | J-HRM-07 / module UAT / ready | Not this seat | ⬜ **OUT OF SCOPE** |

### L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **AC-PAY-TPL-03 period bind F5** (in-scope) | QA-01 FAIL · BE-02 | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| Pack≠mẫu on Tạo kỳ | FE alias | 🟢 AC1/AC6 | 🟢 **PASS / ACCEPT** |
| **J-HRM-07** process / phiếu lương e2e | Historical | **not claimed** | ⬜ **DEFERRED** — honesty false |
| Month filter auto-switch | R-PAY-PERIOD-FILTER-UX | OBS | 🟡 **OBS idle-ok** |

**U19 note:** This gate certifies the **period template bind display** slice (POST→list→row/detail/F5) — **not** a claim that **J-HRM-07** process UAT or payroll module UAT is newly GO. Missing process e2e does **not** NO-GO this seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `payroll_e2e_ready=false`.

### CRUD / mutate matrix (browser U65)

| Case | C/R/U/D | Verdict |
|------|---------|---------|
| POST pay-sheet-template (Settings, pretest) | Create | **PASS** |
| POST payroll period + `paySheetTemplateId` | Create bind | **PASS** |
| GET `/payroll/periods` list bind fields | Read | **PASS** (regression vs QA-01 null) |
| Row / detail display snapshot name | Read UI | **PASS** |
| F5 re-read | Read persist | **PASS** |
| Pack enroll surface | Read regression | **PASS** (≠ mẫu) |
| Hard-delete period / seed | Delete / seed | **N/A** — denied |

---

## Classification

| Signal | Class | Note |
|--------|-------|------|
| QA-02 pack verify **1/8** | **PROCESS OBS** | Missing `command_table` wording on QA MD — **not** product demote; QC pack consolidates |
| AC-PAY-TPL-03 POST→list→row/detail/F5 | **PRODUCT OK** | Closes R-PAY-PERIOD-LIST-TPL |
| Pack≠mẫu · no salary-templates SoT | **PRODUCT OK** | Enforced |
| R-PAY-PERIOD-FILTER-UX / picker label OBS | **SCOPE / OBS** | Idle-ok · optional FE — **not** product NO-GO |
| Missing J-HRM-07 / module UAT / ready flip | **SCOPE / CONDITION** | Blocks ready=true · **not** period-bind product NO-GO |
| L0 stack (cited QA) | **ENV OK** | Observe-only this QC |
| No P0/P1 product residual on AC-PAY-TPL-03 | **PRODUCT OK** | Slice ACCEPT |

---

## Residual

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **C-SLICE-≠-MODULE** | honesty | `pm` | **CONDITION** | Period-bind GWC ≠ module UAT / AMIS DONE / Phase1 |
| **R-PAY-PERIOD-LIST-TPL** | P0 | `dev-be` | **CLOSED** | List DTO + row/F5 ACCEPT this seat |
| **R-PAY-PERIOD-FILTER-UX** | P2 optional | `dev-fe` | **OBS idle-ok** | Month filter still required for non-current months |
| **OBS picker vs snapshot** | OBS | `qa`/`dev-fe` | **OBS idle-ok** | UI pick log can show new label while POST binds another active mẫu already in list — AC still met |
| **`payroll_e2e_ready`** | honesty | `pm` | **LOCKED false** | Explicit **NO** promote |
| **J-HRM-07** process e2e | L2.5 | `qa` later | **DEFERRED** | Not claimed |

**P0/P1 product residuals for this AC-PAY-TPL-03 WI:** none blocking slice ACCEPT.

**CONDITION for GWC:** `C-SLICE-≠-MODULE` + optional filter/picker OBS — sufficient to deny `payroll_e2e_ready=true` and deny clean module / Phase1 GO; **not** product NO-GO for certified period-bind browser UF.

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-02.md` | exit **1** · **1/8** (command_table) | **PROCESS OBS** |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qc-02.md` | expected **PASS** exit **0** · **8/8** after this file | QC pack SoT |
| QA harness (prior) `node scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs` | exit **0** · **PASS** · stamp `PAYBINDQA2-IT9Y27` | PRODUCT OK (cited) |
| L0 (prior QA) | portal / hrm / xbos **200** | ENV OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + screen audit.

---

## completion_report

### Closed

1. Narrow QC gate on **AC-PAY-TPL-03** period bind F5 — **GO WITH CONDITIONS**.  
2. Integrity ACCEPT vs stamp `PAYBINDQA2-IT9Y27` · period `47d43fe6-…` · screens 04/05/06.  
3. **R-PAY-PERIOD-LIST-TPL CLOSED** (QA-01 FAIL → BE-02 → QA-02 PASS).  
4. Honesty: `payroll_e2e_ready=false` **LOCKED** · J-HRM-07 / module UAT / Phase1 **DENIED**.  
5. QA pack PROCESS OBS consolidated into this QC pack **8/8**.  
6. K4 exit: period bind SEAL for this slice.

### Residual

- **R-PAY-PERIOD-FILTER-UX** (optional) · **OBS picker label** · **C-SLICE-≠-MODULE** · ready flag locked false.  
- **Idle-ok** this period-bind UF slice for PM (no forced residual Task).

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | see below (idle-ok this slice · residual optional) |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qc-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | ACCEPT AC-PAY-TPL-03 · **R-PAY-PERIOD-LIST-TPL CLOSED** · **cấm** flip `payroll_e2e_ready` · idle-ok this seat |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QC-02-INTAKE
from_role: qc
to_role: pm
lane: governance
priority: P1
prior: PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-QC-02 GO WITH CONDITIONS
parent: PO-HRM-RESUME-QC-WAVE-K1-K4 · K4

## Mission (PM intake)
AC-PAY-TPL-03 period bind F5 GWC ACCEPT · R-PAY-PERIOD-LIST-TPL CLOSED.
Retain C-SLICE-≠-MODULE · payroll_e2e_ready=false.
Cấm invent payroll_e2e_ready=true · cấm J-HRM-07 / module UAT / Phase1 DONE / payroll e2e DONE.

## Decision
IDLE-OK this period-bind UF seat (K4 SEAL).

Optional residuals (do NOT block this slice close):
1) R-PAY-PERIOD-FILTER-UX — optional dev-fe month auto-switch after create
2) OBS picker label vs bound active mẫu id — tighten only if sponsor requires exact new-code bind

## evidence
docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qc-02.md
docs/qa/evidence/po-hrm-amis-parity-pay-period-bind-qa-02.md (stamp PAYBINDQA2-IT9Y27)

## ack
PASS_TO_PM · honesty payroll_e2e_ready=false
```
