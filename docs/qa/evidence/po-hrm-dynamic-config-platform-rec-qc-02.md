# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow browser** AC-PLT-REC-02..05 after QA-02 · **cấm reopen** REC-QC-01 L1 |
| **priority** | P2 |
| **resume_chunk** | K6.2e |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-02` |
| **prior_fe** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01` READY_FOR_QA |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · HRM FE `:8080/hr/` |
| **journey_l25** | **N/A deferred** — browser AC slice only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | Browser AC-PLT-REC-02..05 · NO-HARDCODE · must_keep JD/IV/YCTD (see § Gate AC audit) |
| **Verdict** | **GO WITH CONDITIONS** — browser AC SEAL ACCEPT · CONDITIONS: **`C-SLICE-≠-MODULE`** · DENY module REC UAT / J-* / Phase1 / ready flips |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-rec-qa-02.md`](po-hrm-dynamic-config-platform-rec-qa-02.md) |
| **fe_ref** | [`po-hrm-dynamic-config-platform-rec-fe-01.md`](po-hrm-dynamic-config-platform-rec-fe-01.md) |
| **l1_seal** | [`po-hrm-dynamic-config-platform-rec-qc-01.md`](po-hrm-dynamic-config-platform-rec-qc-01.md) — **SEAL RETAINED** · not reopened |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-rec-qa-02-browser.json`](_tmp-po-hrm-dynamic-config-platform-rec-qa-02-browser.json) · stamp **`RECPLATQA2-MSIXNFE2`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-rec-qa-02/01..13-*.png` |
| **spec_ref** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` §5 **AC-PLT-REC-02..05** · FE-01 §3 click path |
| **U65** | zero-seed · browser FE click · QC observe-only · no `apps/**` · no seed |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser AC GWC ≠ recruitment module UAT / Phase1 DONE / payroll_e2e / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Browser UF AC-PLT-REC-02..05** | **SEALED this seat** | CLOSED prior QC-01 CONDITION HOLD |
| **Module recruitment UAT** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5** | **DENIED / deferred** | Out of scope this browser AC seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA browser zero-seed · machine `seed_used=false` |
| **REC-QC-01 L1** | **SEAL RETAINED** | **Cấm reopen** API-only L1 |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 AC-PLT-REC-02..05 after FE-01 + QA-02 stamp **`RECPLATQA2-MSIXNFE2`** (`overall=PASS` · `passed=13` · `failed=0` · honesty all **false** · `deny_reopen_rec_qc_01_l1=true`). Audited QA MD + machine JSON + FE-01 + spot screens (create toast row · hire dialog EMP · retire toast · settings honesty banner). Proven: Settings **Giai đoạn REC** create key `hr_custom_stage_07_msixnfe2` **PUT 200** `HRM-REC-STG-200` → **F5** row → Ứng viên picker **PATCH 200** `HRM-REC-CP-200` · UNKNOWN **400** `HRM-REC-STAGE-UNKNOWN` (FE-initiated rewrite) · Hire dialog + EMP soft-link `0500220b-…` on `hired_qa_msiwiylu` · retire **201** hide from effective/picker · historical cand `1d291765-…` stage key intact · must_keep JD/IV/YCTD **200**. **CLOSE** QC-01 CONDITIONS `R-REC-BROWSER-AC-PLT` + `R-REC-AC-PLT-REC-05`. **RETAIN** L1 QC-01 GWC SEAL (not reopened). QA pack verify **1/8** (`command_table`) = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** module REC UAT · J-* · Phase1 DONE · `recruitment_uat_ready=true` · `payroll_e2e_ready=true` · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `RECPLATQA2-MSIXNFE2` · 13/13 | machine `summary.passed=13` · `failed=0` · `overall=PASS` | 🟢 **ACCEPT** |
| AC-PLT-REC-02 create→F5→picker | PUT 200 · F5 row · PATCH 200 · effective hasNewKey | 🟢 **ACCEPT** · **CLOSE HOLD** |
| AC-PLT-REC-03 retire hide + history | POST retire 201 · effective hasKey=false · cand stage intact | 🟢 **ACCEPT** · **CLOSE HOLD** |
| AC-PLT-REC-04 UNKNOWN 400 | `HRM-REC-STAGE-UNKNOWN` · `via=api_fallback` | 🟢 **ACCEPT** · toast scrape OBS |
| AC-PLT-REC-05 Hire→EMP | Dialog + PATCH 200 · `hasEmployeeId=true` · emp=`0500220b-…` | 🟢 **ACCEPT** · **CLOSE HOLD** |
| NO-HARDCODE six starters | effective sample includes custom #7 key | 🟢 **ACCEPT** |
| must_keep JD/IV/YCTD | all **200** | 🟢 **ACCEPT** |
| U65 zero-seed | machine `seed_used=false` · MD | 🟢 **ACCEPT** |
| Honesty ready flags false | MD + JSON | 🟢 **DENIED promote** |
| REC-QC-01 L1 SEAL | not reopened this seat | 🟢 **RETAIN** |
| QA pack 1/8 command_table | verify exit 1 | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / J-* / Phase1 / ready | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | Residual CONDITION | 🟡 **CONDITION OPEN** |

**Cấm:** invent `recruitment_uat_ready=true` · invent `payroll_e2e_ready=true` · Phase1 DONE · claim J-* / module REC UAT · reopen L1 QC-01 · seed as evidence.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · browser AC seal ≠ module REC UAT / J-* / Phase1 |
| Recommended flag state | keep **`recruitment_uat_ready=false`** · **`payroll_e2e_ready=false`** |
| May PM claim browser AC-PLT-REC-02..05 SEALED? | **YES** — this seat GWC |
| May PM claim L1 F-REC-CAT still SEALED? | **YES** — QC-01 retained |
| May PM claim module REC UAT / Phase1 / J-*? | **NO** |
| Forced residual P0 this turn? | **NO** — K6.2e chain closed · plan exit / idle-ok |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA vertical §5 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` §5 | AC-PLT-REC-02..05 | **TRACE OK** |
| QC-01 L1 GWC | `po-hrm-dynamic-config-platform-rec-qc-01.md` | GWC · browser HOLD | **SEAL RETAINED** |
| FE-01 | `po-hrm-dynamic-config-platform-rec-fe-01.md` | READY_FOR_QA · vitest 12 PASS | **ACCEPT** |
| QA-02 browser | `po-hrm-dynamic-config-platform-rec-qa-02.md` | PASS_TO_PM · 13/13 | **ACCEPT** |
| Machine JSON | `_tmp-…-qa-02-browser.json` | stamp `RECPLATQA2-MSIXNFE2` · PASS | **ACCEPT** |
| Screens 01..13 | `screens/po-hrm-dynamic-config-platform-rec-qa-02/` | create/hire/retire spot-check | **ACCEPT** |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · **1/8** (`command_table`) | 🟡 **PROCESS OBS** |

### Machine JSON spot (`RECPLATQA2-MSIXNFE2`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `RECPLATQA2-MSIXNFE2` | 🟢 |
| `u65` | zero-seed · browser-only · FE after 2xx + F5 | 🟢 |
| `honesty.recruitment_uat_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` | **false** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| `honesty.deny_module_rec_uat` / `deny_j_star_promote` | **true** / **true** | 🟢 |
| `honesty.deny_reopen_rec_qc_01_l1` | **true** | 🟢 |
| `overall` / summary | **PASS** · **13/0/0** | 🟢 |
| Create | PUT **200** `HRM-REC-STG-200` · key `hr_custom_stage_07_msixnfe2` · id `b7b309e4-…` | 🟢 |
| Picker | PATCH **200** `HRM-REC-CP-200` · effective hasNewKey | 🟢 |
| UNKNOWN | **400** `HRM-REC-STAGE-UNKNOWN` · toast=false · via api_fallback | 🟢 HTTP · 🟡 toast OBS |
| Hire | dialog · PATCH **200** · emp `0500220b-…` · stage `hired_qa_msiwiylu` | 🟢 |
| Retire + history | **201** · hasKey=false · cand `1d291765-…` intact | 🟢 |
| must_keep | jd/iv/yctd **200** | 🟢 |
| `consoleErrors` / `pageErrors` | `[]` / `[]` | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

### Screen spot-check (QC)

| Screen | Observation | QC |
|--------|-------------|-----|
| `02-after-create.png` | Toast «Đã tạo giai đoạn» · row `GĐ QA REC msixnfe2` / `hr_custom_stage_07_msixnfe2` · honesty banner on panel | 🟢 |
| `07-hire-dialog.png` / `08-after-hire.png` | Dialog `Gắn hồ sơ nhân viên` · EMP picker · confirm chốt | 🟢 |
| `09-after-retire.png` | Toast «Đã ngừng giai đoạn» · `msixnfe2` gone from active table | 🟢 |

---

## Gate AC audit

| # | Spec / AC | Browser observed | Prior QC-01 | QC |
|---|-----------|------------------|-------------|-----|
| **AC-PLT-REC-02** | Settings create → 2xx → F5 → picker | PUT 200 · F5 · PATCH 200 | HOLD | 🟢 **CLOSE HOLD** |
| **AC-PLT-REC-03** | Retire hide · history key | retire 201 · picker hide · stage intact | HOLD | 🟢 **CLOSE HOLD** |
| **AC-PLT-REC-04** | to_stage ∉ catalog → 4xx UNKNOWN | 400 `HRM-REC-STAGE-UNKNOWN` | HOLD (L1 had API) | 🟢 **CLOSE HOLD** · toast OBS |
| **AC-PLT-REC-05** | hired-outcome → Hire → EMP | dialog + soft-link 200 | HOLD | 🟢 **CLOSE HOLD** |
| NO-HARDCODE | open #7+ in effective | sample has custom key | — | 🟢 **ACCEPT** |
| must_keep | JD / IV / YCTD | all 200 | — | 🟢 **ACCEPT** |
| L1 QC-01 | F-REC-CAT/EFF/APP-02 | not reopened | SEAL | 🟢 **RETAIN** |
| — | Module UAT / J-* / Phase1 / ready | Explicit non-claim | — | 🟢 **DENIED** |

**OBS (not blocker):**
1. Radix Select Root `data-testid=hdsd-rec-candidate-stage-picker` not in DOM — QA used `table [role=combobox]` (FE-01 HDSD still documented).
2. AC-PLT-REC-04 `toast=false` headless scrape — HTTP code PASS; toast map unit-tested FE-01 (`recruitmentHireLink.test.ts`).
3. UNKNOWN proven via FE route rewrite (`api_fallback`) — valid when catalog>0 (unknown cannot appear in picker options).

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-REC-BROWSER-AC-PLT** | QC-01 CONDITION OPEN | **CLOSED** — QA-02 13/13 stamp `RECPLATQA2-MSIXNFE2` |
| **R-REC-AC-PLT-REC-05** | QC-01 CONDITION OPEN hire→EMP | **CLOSED** — Hire dialog + EMP soft-link PASS |
| Toast scrape / Select testid | QA OBS | **PROCESS OBS** — not product demote |
| QA pack missing command_table | verify 1/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Product blockers | none | **NONE** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| Browser 13/13 PASS stamp `RECPLATQA2-MSIXNFE2` | PRODUCT PASS | Yes → GWC ACCEPT browser SEAL |
| Close R-REC-BROWSER + R-REC-AC-05 | PRODUCT CLOSE | Yes → CONDITIONS reduced |
| `C-SLICE-≠-MODULE` · DENY ready/module/J-*/Phase1 | PRODUCT CONDITION | Yes → GWC (not clean GO) |
| QA pack 1/8 command_table · toast scrape · Select testid | PROCESS OBS | No — QC consolidates |
| L1 QC-01 | RETAIN SEAL | No reopen |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **C-SLICE-≠-MODULE** | — | **pm** | Keep `recruitment_uat_ready=false` · no J-* / Phase1 / module invent |
| OBS-toast-scrape / OBS-select-testid | P3 soft | **dev-fe** (optional) | Improve toast assert / Radix testid on Trigger — **not** forced this turn |

**K6.2e chain:** SA → DATA → BE → QA-01 → QC-01 L1 → FE-01 → QA-02 → **QC-02** = **CLOSED**. Per `PO_HRM_RESUME_PLAN_20260807.md` K6.2–6.5: **plan exit / idle-ok** (no forced P0 residual).

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-02` |
| 2 | portal_url | ✅ `:5173` + HRM `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — browser AC slice · no J-* promote |
| 4 | crud_or_matrix | ✅ AC-PLT-REC-02..05 browser matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · DENIED flips · L1 SEAL retain |
| 7 | Residual section | ✅ C-SLICE + soft OBS · R-REC-* CLOSED |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-02.md` | exit **1** · **1/8** (`command_table`) | **PROCESS OBS** — browser QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-02.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-02 runner stamp `RECPLATQA2-MSIXNFE2` | **PASS** · 13/13 · failed=0 | PRODUCT OK (cited machine JSON) |
| FE-01 vitest `recPipelineStageCatalog` + `recruitmentHireLink` | **12 PASS** (cited FE-01) | PRODUCT OK (cited) |
| REC-QC-01 L1 | GWC SEAL retained · not re-run | PROCESS OK — cấm reopen |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: recruitment J-* rows = **N/A / not tested** for this browser AC gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** Browser AC-PLT-REC-02 create/F5/picker · AC-PLT-REC-03 retire hide + history · AC-PLT-REC-04 UNKNOWN 400 · AC-PLT-REC-05 Hire→EMP soft-link · NO-HARDCODE · must_keep JD/IV/YCTD · U65 zero-seed · close QC-01 browser CONDITIONS.

**OUT of scope / DENIED:** Module REC UAT · J-* L2.5 promote · `recruitment_uat_ready=true` · `payroll_e2e_ready=true` · Phase 1 DONE · reopen REC-QC-01 L1 API seat · invent full-module GO.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC browser GWC for AC-PLT-REC-02..05 complete after QA-02 stamp **`RECPLATQA2-MSIXNFE2`** · **13/13**.
2. **CLOSED** prior CONDITIONS `R-REC-BROWSER-AC-PLT` + `R-REC-AC-PLT-REC-05`.
3. L1 REC-QC-01 GWC **SEAL RETAINED** (not reopened).
4. Honesty locked: `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · DENY module UAT / J-* / Phase1.
5. K6.2e REC platform chain (SA→DATA→BE→L1→FE→browser QA→QC) **CLOSED**.

### Residual

- **CONDITION:** `C-SLICE-≠-MODULE` only (honesty residual).
- Soft OBS toast scrape / Select testid — optional FE polish, not forced.

---

## next_owner

**pm** — **plan exit / idle-ok** (K6.2–6.5 closed per resume plan; no forced P0 residual this seat)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-RESUME-K6-EXIT-IDLE
from_role: pm
to_role: pm
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-02
resume_chunk: K6 exit

## context
REC browser QC-02 GWC SEALED AC-PLT-REC-02..05 (stamp RECPLATQA2-MSIXNFE2).
L1 QC-01 SEAL retained. K6.2–6.5 chain closed per PO_HRM_RESUME_PLAN_20260807.md.
Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false · attendance_uat_ready=false.
Cấm: flip ready flags · claim module REC UAT · Phase1 DONE · reopen L1.

## task
1) Intake QC-02 GWC on bus · update TEAM_WORKING_NOW: K6.2e CLOSED · Status IDLE or PAUSE
2) pnpm run pm:idle:check — if exit 0 and no P0 residual → PM -> ALL idle (plan exit)
3) Do NOT invent recruitment_uat_ready=true · Do NOT dispatch module REC UAT / J-* from this seat

## exit
Bus idle note + honesty retained · PASS_TO_SPONSOR summary only if needed
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-02.md`

## ack_status

**PASS_TO_PM**

## recruitment_uat_ready

**false**

## payroll_e2e_ready

**false**
