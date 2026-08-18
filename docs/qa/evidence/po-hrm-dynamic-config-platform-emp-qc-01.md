# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API only** EMP DOC/ET platform catalog · **not** browser UF · **not** J-* promote · **not** personnel UAT |
| **priority** | P0 |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-01` PASS_TO_PM (L1 AC 1–7) |
| **prior_devops** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEVOPS-01` (closes `D-EMP-PLT-STALE-DIST`) |
| **prior_fail** | stamp `EMPPLATQA-MSIZICMH` (stale dist 500/404) — superseded |
| **portal_url** | `http://127.0.0.1:5173` (login proxy) · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 API seat only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | L1 AC-PLT-EMP 1–7 (DOC/ET create · format · normalize · effective · retire · scope_parity · FORBIDDEN) |
| **Verdict** | **GO WITH CONDITIONS** — **L1 SEAL ACCEPT** · CONDITION: browser Settings pickers **`R-PLT-EMP-FE`** HOLD → **`EMP-FE-01`** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-emp-qa-01.md`](po-hrm-dynamic-config-platform-emp-qa-01.md) |
| **devops_ref** | [`po-hrm-dynamic-config-platform-emp-devops-01.md`](po-hrm-dynamic-config-platform-emp-devops-01.md) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-emp-qa-01.FINAL.json`](_tmp-po-hrm-dynamic-config-platform-emp-qa-01.FINAL.json) · stamp **`EMPPLATQA-MSIZXHIM`** |
| **stamp_ref** | QA `EMPPLATQA-MSIZXHIM` · DevOps `EMPPLATDEVOPS-MSIZICMH` · prior FAIL `EMPPLATQA-MSIZICMH` |
| **spec_ref** | AC-PLT-EMP-02..06 · BE `po-hrm-dynamic-config-platform-emp-be-01.md` · SA EMP vertical DOC+ET Option B |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · probe ≠ UF |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 GWC ≠ personnel UAT / Phase1 DONE / PAY·ATT·REC ready / J-* / browser UF |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **Browser UF Settings pickers** | **HOLD** | FE seat not delivered · L1 ≠ browser PASS |
| **Module personnel UAT** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5** | **DENIED / deferred** | Out of scope this L1 seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **LIST-TOTALS / CTR GWC** | **must_keep** | **not reopened** |
| **Seed** | **DENIED** (U65) | QA L1 probe only · zero-seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API smoke for EMP platform catalog (`emp_document_type` + `emp_employment_type`) after DevOps rebuild closed `D-EMP-PLT-STALE-DIST` + QA retest stamp **`EMPPLATQA-MSIZXHIM`** (`overall.verdict=PASS` · `pass_count=20` · `fail_count=0` · `failed_ids=[]` · honesty all **false**). Audited QA MD + FINAL JSON + DevOps-01 + live unauth spot-check. Proven at stamp: unauth list/effective **401** `HRM-AUTH-001` (not 500/404) · DOC/ET list **200** · open key create **201** · `CCCD`/`FULL_TIME` **400** `HRM-PLT-CAT-CODE-INVALID` · `full-time`→`full_time` normalize · effective EMP-native · soft retire + active hide + `include_archived` · group CEO scope_parity main↔holding · member OOS **409** `SCOPE_CONTEXT_MISMATCH` · DELETE **404** (no hard-delete) · must_keep employees/contracts **200**. Browser Settings DOC/ET pickers = **CONDITION HOLD** (`R-PLT-EMP-FE`) → **`EMP-FE-01`**. QA pack verify **3/8** (missing `command_table` / `portal_url` / `journey_l25`) = **PROCESS OBS** for L1 MD — this QC consolidates **8/8** with explicit **N/A deferred J-***. **DENIED** personnel UAT · e2e linkage · honesty flip · browser UF PASS · module UAT · Phase1 DONE · LIST-TOTALS/CTR reopen · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `EMPPLATQA-MSIZXHIM` · 20/20 L1 | FINAL `overall.pass_count=20` · `failed_ids=[]` | 🟢 **ACCEPT** |
| `D-EMP-PLT-STALE-DIST` CLOSED | DevOps-01 + QA unauth **401** + live spot **401** | 🟢 **CLOSED** |
| DOC/ET open create + list | `201` / `200` | 🟢 **ACCEPT** |
| Format reject `CCCD` / `FULL_TIME` | `400 HRM-PLT-CAT-CODE-INVALID` | 🟢 **ACCEPT** |
| Hyphen normalize `full-time`→`full_time` | `201` key=`full_time` | 🟢 **ACCEPT** |
| Effective EMP wins | `200` · `source=emp_native` | 🟢 **ACCEPT** |
| Soft retire + hide + archived | retire `201` · activeHide · archivedShow | 🟢 **ACCEPT** |
| Scope parity CEO + member OOS 409 | get holding/main 200 · member 409 | 🟢 **ACCEPT** |
| FORBIDDEN hard-delete | DELETE `404 HRM-DATA-404` | 🟢 **ACCEPT** |
| must_keep emp/contracts + LIST-TOTALS/CTR | 200 · not reopened | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine `u65` | 🟢 **ACCEPT** |
| Honesty ready flags false | MD + FINAL | 🟢 **DENIED promote** |
| Browser Settings pickers `R-PLT-EMP-FE` | HOLD until FE | 🟡 **CONDITION OPEN** |
| QA pack 3/8 | L1 seat | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / J-* / Phase1 / ready | Explicit DENIED | 🟢 |

**Cấm:** invent `hrm_personnel_uat_ready=true` · invent PAY/ATT/REC ready · Phase1 DONE · claim J-* / browser UF PASS · claim module personnel UAT · reopen LIST-TOTALS/CTR · seed as evidence.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM set `employees_e2e_linkage_ready=true`? | **NO** |
| May PM set PAY/ATT/REC ready true? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 API seal ≠ browser Settings / module UAT |
| Recommended flag state | keep all honesty flags **`false` LOCKED** |
| May PM claim L1 AC 1–7 SEALED? | **YES** — this seat GWC L1-SEAL |
| May PM claim browser Settings pickers / module UAT / Phase1 / J-*? | **NO** |
| Forced residual dispatch this turn? | **YES** — next product wave **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01`** (Settings DOC/ET pickers) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Prior FAIL | stamp `EMPPLATQA-MSIZICMH` | FAIL_TO_PM · stale dist 500/404 | **SUPERSEDED** |
| DevOps-01 | `po-hrm-dynamic-config-platform-emp-devops-01.md` | READY_FOR_QA · stamp `EMPPLATDEVOPS-MSIZICMH` | **ACCEPT** · `D-EMP-PLT-STALE-DIST` CLOSED |
| QA-01 L1 retest | `po-hrm-dynamic-config-platform-emp-qa-01.md` | PASS_TO_PM · 20/20 | **ACCEPT** |
| Machine FINAL | `_tmp-…-qa-01.FINAL.json` | stamp `EMPPLATQA-MSIZXHIM` · PASS | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · **3/8** | 🟡 **PROCESS OBS** — L1; QC consolidates |
| Live unauth spot (QC) | `:28001` DOC list + ET effective | **401** both | 🟢 **CLOSED** stale-dist |

### Machine JSON spot (`EMPPLATQA-MSIZXHIM`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `EMPPLATQA-MSIZXHIM` | 🟢 |
| `lane` | `L1_API_smoke_only` | 🟢 |
| `u65` | zero-seed · browser UF HOLD | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `honesty.employees_e2e_linkage_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` / att / rec | **false** | 🟢 |
| `honesty.browser_uf` / `module_uat` | **false** / **false** | 🟢 |
| `overall.verdict` / pass | **PASS** · **20/20** · `failed_ids=[]` | 🟢 |
| Unauth stale_dist_probe | doc=**401** et=**401** | 🟢 CLOSED |
| Open DOC create | `201 HRM-EMP-DOC-201` · `hr_doc_custom_09_msizxhim` | 🟢 |
| CCCD reject | `400 HRM-PLT-CAT-CODE-INVALID` | 🟢 |
| ET open + normalize | `201` · key=`full_time` | 🟢 |
| Effective EMP | `200` · EMP-native | 🟢 |
| Retire hide | DOC/ET retire `201` · activeHide · archivedShow | 🟢 |
| Member OOS | `409 SCOPE_CONTEXT_MISMATCH` | 🟢 |
| Hard-delete | `404 HRM-DATA-404` | 🟢 |
| `residual` | `R-PLT-EMP-FE` · R-PLT-EMP-01/02 deferred | 🟡 CONDITION FE |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (L1 AC 1–7)

| # | Spec / AC | L1 observed | Browser | QC |
|---|-----------|-------------|---------|-----|
| 1 | GET document-types holding | **200** `HRM-EMP-DOC-200` | — | 🟢 **ACCEPT** |
| 1b | GET employment-types | **200** `HRM-EMP-ET-200` | — | 🟢 **ACCEPT** |
| 2 | POST open DOC key | **201** `HRM-EMP-DOC-201` | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| 2b | POST `CCCD` format reject | **400** INVALID | — | 🟢 **ACCEPT** |
| 3 | POST open ET `seasonal_temp*` | **201** `HRM-EMP-ET-201` | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| 3b | `full-time` → `full_time` | **201** normalize | — | 🟢 **ACCEPT** |
| 4 | ET effective EMP wins | **200** emp_native | — | 🟢 **ACCEPT** |
| 4b | DOC effective | **200** | — | 🟢 **ACCEPT** |
| 5 | Retire + list hide | **201** + hide + archived | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| 6 | scope_parity group CEO | list↔get **200** | — | 🟢 **ACCEPT** |
| 6b | member OOS | **409** deny | — | 🟢 **ACCEPT** |
| 7 | FORBIDDEN hard-delete | **404** | — | 🟢 **ACCEPT** |
| 7b | FORBIDDEN uppercase enum | **400** INVALID | — | 🟢 **ACCEPT** |
| 7c | honesty flip | all **false LOCKED** | — | 🟢 **DENIED promote** |
| — | Settings DOC/ET pickers | not in L1 | **⬜ HOLD** | 🟡 **CONDITION OPEN** → EMP-FE-01 |
| — | Module UAT / J-* / Phase1 / ready | Explicit non-claim | — | 🟢 **DENIED** |

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **D-EMP-PLT-STALE-DIST** | P0 runtime 500/404 | **CLOSED** — DevOps rebuild + QA retest 401 + QC live 401 |
| **R-PLT-EMP-FE** | QA residual HOLD | **CONDITION OPEN** — owner **dev-fe** `EMP-FE-01` then **qa** browser |
| **R-PLT-EMP-01/02** | deferred assert consumers | **deferred** — post FE · not L1 blocker |
| L1 product blockers | none | **NONE** — do not invent defect |
| QA pack missing 3 fields | verify 3/8 | **PROCESS OBS** — L1 seat; QC consolidates 8/8 |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| L1 20/20 PASS stamp `EMPPLATQA-MSIZXHIM` | PRODUCT PASS | Yes → GWC ACCEPT L1 SEAL |
| `D-EMP-PLT-STALE-DIST` closed (401) | PRODUCT CLOSED | Yes → prior FAIL superseded |
| Browser Settings HOLD `R-PLT-EMP-FE` | PRODUCT CONDITION | Yes → CONDITIONS (not NO-GO) |
| QA pack 3/8 | PROCESS OBS | No — L1 seat; QC consolidates |
| Member OOS 409 (not 403) | PRODUCT OK | No — matrix-aligned deny |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-EMP-FE** | P2 | **dev-fe** → **qa** | Settings DOC/ET pickers UF (create→F5→picker · retire hide · format toast) |
| **R-PLT-EMP-01/02** | P3 deferred | **dev-be** (post FE) | Wire checklist/ACT DOC · YCTD/employee ET asserts |
| **C-SLICE-≠-MODULE** | — | **pm** | Keep personnel/e2e/PAY/ATT/REC ready **false** · no J-* / Phase1 invent |
| LIST-TOTALS / CTR GWC | must_keep | — | **do not reopen** |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 only · no J-* promote · cross-nav deferred |
| 4 | crud_or_matrix | ✅ L1 AC 1–7 DOC/ET matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ personnel/e2e/pay/att/rec **false** · DENIED flips |
| 7 | Residual section | ✅ R-PLT-EMP-FE + deferred 01/02 + C-SLICE · D CLOSED |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md` | exit **1** · **3/8** (`command_table` · `portal_url` · `journey_l25`) | **PROCESS OBS** — L1 seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-01 runner stamp `EMPPLATQA-MSIZXHIM` | **PASS** · 20/20 · `failed_ids=[]` | PRODUCT OK (cited FINAL JSON) |
| DevOps-01 unauth DOC/ET + effective | **401** `HRM-AUTH-001` (not 500/404) | PRODUCT OK — `D-EMP-PLT-STALE-DIST` CLOSED |
| QC live spot unauth `:28001` DOC list + ET `/effective` | **401** / **401** | PRODUCT OK (spot-check) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + unauth spot.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: personnel J-* rows = **N/A / not tested** for this L1 gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** L1 AC 1–7 EMP DOC+ET catalog (create · format reject · hyphen normalize · effective EMP · retire hide · scope_parity CEO + member 409 · FORBIDDEN hard-delete/enum) · `D-EMP-PLT-STALE-DIST` CLOSED · U65 zero-seed · honesty LOCKED false · LIST-TOTALS/CTR must_keep.

**OUT of scope / DENIED:** Browser Settings DOC/ET pickers PASS · personnel UAT · employees e2e linkage · PAY/ATT/REC ready flip · J-* L2.5 · module EMP UAT · Phase 1 DONE · reopen LIST-TOTALS/CTR.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC L1 GWC **SEAL** for EMP platform DOC/ET catalog (AC 1–7) complete.
2. QA stamp **`EMPPLATQA-MSIZXHIM`** · **20/20** L1 · U65 zero-seed **ACCEPT**.
3. **`D-EMP-PLT-STALE-DIST` CLOSED** (unauth **401** not 500/404) — DevOps + QA + QC live spot.
4. Honesty locked: personnel/e2e/pay/att/rec **false** · browser Settings HOLD · no module UAT / J-* / Phase1 invent · LIST-TOTALS/CTR not reopened.
5. Verdict **GO WITH CONDITIONS** (L1-SEAL) — not full-module GO.

### Residual

- **CONDITION:** browser Settings DOC/ET pickers **`R-PLT-EMP-FE`** → owner chain **`EMP-FE-01`** then QA browser.
- **`C-SLICE-≠-MODULE`** retained · R-PLT-EMP-01/02 deferred post FE.

---

## next_owner

**pm** → dispatch **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01`** (`dev-fe`)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-01
program: PO-HRM-CONTINUOUS-W7-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md
ref_devops: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-devops-01.md
stamp_ref: EMPPLATQA-MSIZXHIM · L1 SEAL GWC EMP-QC-01

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md
2. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-01.md
3. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-be-01.md (if present)
4. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md (DOC+ET Option B · position XBOS REF must_keep)

## task
ADD Settings / EMP CFG document-types + employment-types open catalog FE (picker bind to L1 effective):
- AC-PLT-EMP browser: Tạo loại hồ sơ / loại HĐLĐ (open key) → 2xx → list row → F5 persist → related pickers show new key
- Format reject (CCCD / FULL_TIME uppercase) → deterministic 4xx toast HRM-PLT-CAT-CODE-INVALID
- Hyphen normalize display: full-time persists as full_time
- Retire → picker hide → include_archived / history still shows key
- must_keep: LIST-TOTALS / CTR GWC seats · position/dept XBOS REF · no invent emp_position · U65 zero-seed · no wipe spines
- Honesty: hrm_personnel_uat_ready=false · employees_e2e_linkage_ready=false · payroll/att/rec ready=false
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-fe-01.md
- code_memory_required: true · change_mode: ADD
- closes residual: R-PLT-EMP-FE

## exit
READY_FOR_QA with click path + network stamps; then PM dispatch QA browser Settings DOC/ET UF
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md`

## ack_status

**PASS_TO_PM**

## hrm_personnel_uat_ready

**false**

## employees_e2e_linkage_ready

**false**

## payroll_e2e_ready

**false**

## attendance_uat_ready

**false**

## recruitment_uat_ready

**false**
