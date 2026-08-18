# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow browser** AC-PLT-EMP-02..05 after QA-02 · **cấm reopen** EMP-QC-01 L1 |
| **priority** | P0 |
| **program** | `PO-HRM-CONTINUOUS-W7-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QA-02` |
| **prior_fe** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01` READY_FOR_QA |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · api_base `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — browser AC slice only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | Browser AC-PLT-EMP-02..05 · NO-HARDCODE · must_keep position XBOS REF · contracts/SI · soft-delete · L1 SEAL (see § Gate AC audit) |
| **Verdict** | **GO WITH CONDITIONS** — browser AC SEAL ACCEPT · CONDITIONS: **`C-SLICE-≠-MODULE`** · DENY personnel UAT / e2e / J-* / Phase1 / ready flips |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-emp-qa-02.md`](po-hrm-dynamic-config-platform-emp-qa-02.md) |
| **fe_ref** | [`po-hrm-dynamic-config-platform-emp-fe-01.md`](po-hrm-dynamic-config-platform-emp-fe-01.md) |
| **l1_seal** | [`po-hrm-dynamic-config-platform-emp-qc-01.md`](po-hrm-dynamic-config-platform-emp-qc-01.md) — **SEAL RETAINED** · not reopened |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-emp-qa-02-browser.json`](_tmp-po-hrm-dynamic-config-platform-emp-qa-02-browser.json) · stamp **`EMPPLATQA2-MSJ0OAL9`** |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-emp-qa-02/01..23-*.png` |
| **spec_ref** | SA vertical **AC-PLT-EMP-02..05** · FE-01 §3 click path · L1 baseline stamp `EMPPLATQA-MSIZXHIM` |
| **U65** | zero-seed · browser FE click · QC observe-only · no `apps/**` · no seed |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser AC GWC ≠ personnel module UAT / Phase1 DONE / PAY·ATT·REC ready / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **Browser UF AC-PLT-EMP-02..05** | **SEALED this seat** | CLOSED prior QC-01 CONDITION `R-PLT-EMP-FE` |
| **Module personnel UAT** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5** | **DENIED / deferred** | Out of scope this browser AC seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **LIST-TOTALS / CTR GWC** | **must_keep** | **not reopened** |
| **Seed** | **DENIED** (U65) | QA browser zero-seed · machine `seed_used=false` |
| **EMP-QC-01 L1** | **SEAL RETAINED** | **Cấm reopen** API-only L1 |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 AC-PLT-EMP-02..05 after FE-01 + QA-02 stamp **`EMPPLATQA2-MSJ0OAL9`** (`overall=PASS` · `pass=21` · `fail=0` · honesty all **false** · `l1_seal_retained=true` · `deny_wipe_l1_seal=true`). Audited QA MD + machine JSON + FE-01 + L1 QC-01 SEAL + spot screens (CCCD INVALID toast · DOC create toast/`msj0oal9` row+picker · YCTD ET retest picker). Proven: Settings **Loại giấy tờ EMP** create `hr_doc_custom_09_msj0oal9` **PUT 200** `HRM-EMP-DOC-200` → **F5** row → effective picker · CCCD toast **HRM-PLT-CAT-CODE-INVALID** · Settings **Loại hình thuê EMP** seasonal **PUT 200** · `full-time`→`full_time` · FULL_TIME INVALID · Emp form + YCTD ET pickers from effective (YCTD retest `seasonal_temp_yctd_msj0rv2s`) · retire DOC+ET **201** hide active pickers · GET-by-id **200** `status=retired` · must_keep position/contracts/SI. **CLOSE** QC-01 CONDITION **`R-PLT-EMP-FE`**. **RETAIN** L1 QC-01 GWC SEAL (not reopened). QA pack verify **2/8** (`command_table` · `journey_l25`) = **PROCESS OBS** — this QC consolidates **8/8**. **DENIED** personnel UAT · e2e linkage · J-* · Phase1 DONE · ready flips · seed · wipe L1. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `EMPPLATQA2-MSJ0OAL9` · 21/21 | machine `summary.pass=21` · `fail=0` · `overall=PASS` | 🟢 **ACCEPT** |
| AC-PLT-EMP-02 DOC create→F5→picker · CCCD INVALID | PUT 200 · F5 row · picker · toast INVALID | 🟢 **ACCEPT** · **CLOSE HOLD** |
| AC-PLT-EMP-04 ET seasonal/full_time · Emp+YCTD | PUT 200 · normalize · pickers PASS (YCTD retest) | 🟢 **ACCEPT** · **CLOSE HOLD** |
| AC-PLT-EMP-03 retire hide + history | POST retire 201 · pickers hide · GET-by-id retired | 🟢 **ACCEPT** · **CLOSE HOLD** |
| AC-PLT-EMP-05 consumers / effective | Emp form + YCTD + Settings preview | 🟢 **ACCEPT** |
| NO-HARDCODE CCCD/FULL_TIME | client toast INVALID · no invent enum | 🟢 **ACCEPT** |
| must_keep position XBOS · contracts/SI | form combobox · contractsOk/siOk | 🟢 **ACCEPT** |
| U65 zero-seed | machine `seed_used=false` · MD | 🟢 **ACCEPT** |
| Honesty ready flags false | MD + JSON | 🟢 **DENIED promote** |
| EMP-QC-01 L1 SEAL | not reopened this seat | 🟢 **RETAIN** |
| LIST-TOTALS / CTR | must_keep · not reopened | 🟢 **ACCEPT** |
| QA pack 2/8 | verify exit 1 | 🟡 **PROCESS OBS** — QC consolidates |
| Console 404 `/employee-insurances` | React route noise · SI surface PASS | 🟡 **OBS idle-ok** |
| DOC checklist full spine | FE residual deferred | 🟡 **OBS P3 idle-ok** |
| Module UAT / J-* / Phase1 / ready | Explicit DENIED | 🟢 |
| `C-SLICE-≠-MODULE` | Residual CONDITION | 🟡 **CONDITION OPEN** |

**Cấm:** invent `hrm_personnel_uat_ready=true` · invent e2e/PAY/ATT/REC ready · Phase1 DONE · claim J-* / module EMP UAT · reopen L1 QC-01 · seed as evidence.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM set `employees_e2e_linkage_ready=true`? | **NO** |
| May PM set PAY/ATT/REC ready true? | **NO** |
| Why | `C-SLICE-≠-MODULE` · browser AC seal ≠ module personnel UAT / J-* / Phase1 |
| Recommended flag state | keep all honesty flags **`false` LOCKED** |
| May PM claim browser AC-PLT-EMP-02..05 SEALED? | **YES** — this seat GWC |
| May PM claim L1 DOC/ET still SEALED? | **YES** — QC-01 retained |
| May PM claim module EMP UAT / Phase1 / J-*? | **NO** |
| Forced residual P0 this turn? | **NO** product P0 — **YES** U88 governance: MergeToken `custom.emp` / DEC chain |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| QC-01 L1 GWC | `po-hrm-dynamic-config-platform-emp-qc-01.md` | GWC · `R-PLT-EMP-FE` HOLD | **SEAL RETAINED** |
| FE-01 | `po-hrm-dynamic-config-platform-emp-fe-01.md` | READY_FOR_QA · vitest 10 PASS | **ACCEPT** |
| QA-02 browser | `po-hrm-dynamic-config-platform-emp-qa-02.md` | PASS_TO_PM · 21/21 | **ACCEPT** |
| Machine JSON | `_tmp-…-qa-02-browser.json` | stamp `EMPPLATQA2-MSJ0OAL9` · PASS | **ACCEPT** |
| Screens 01..23 | `screens/po-hrm-dynamic-config-platform-emp-qa-02/` | CCCD / create / YCTD spot-check | **ACCEPT** |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **1** · **2/8** (`command_table` · `journey_l25`) | 🟡 **PROCESS OBS** |

### Machine JSON spot (`EMPPLATQA2-MSJ0OAL9`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `EMPPLATQA2-MSJ0OAL9` | 🟢 |
| `stamp_ref_l1` | `EMPPLATQA-MSIZXHIM` | 🟢 |
| `u65` | zero-seed · browser-only · FE after 2xx + F5 | 🟢 |
| `honesty.hrm_personnel_uat_ready` | **false** | 🟢 |
| `honesty.employees_e2e_linkage_ready` | **false** | 🟢 |
| `honesty.payroll/att/rec` | **false** | 🟢 |
| `honesty.seed_used` | **false** | 🟢 |
| `honesty.deny_wipe_l1_seal` | **true** | 🟢 |
| `overall` / summary | **PASS** · **21/0** · `l1_seal_retained=true` | 🟢 |
| DOC create | PUT **200** `HRM-EMP-DOC-200` · key `hr_doc_custom_09_msj0oal9` · id `8be6fff0-…` | 🟢 |
| CCCD INVALID | toast `HRM-PLT-CAT-CODE-INVALID` | 🟢 |
| ET seasonal + full_time | PUT **200** · persist `full_time` | 🟢 |
| FULL_TIME INVALID | toast INVALID | 🟢 |
| Emp form ET picker | seasonal option_click | 🟢 |
| YCTD ET | retest key `seasonal_temp_yctd_msj0rv2s` · dialogOk | 🟢 |
| Retire + history | DOC/ET **201** · pickers hide · GET-by-id **retired** | 🟢 |
| must_keep | position+contracts/SI PASS | 🟢 |
| `pageErrors` | `[]` | 🟢 |
| `consoleErrors` | 404 `/employee-insurances` · `/insurances` | 🟡 OBS idle-ok (SI surface still PASS) |
| `ack_status` | **PASS_TO_PM** | 🟢 |

### Screen spot-check (QC)

| Screen | Observation | QC |
|--------|-------------|-----|
| `02-cccd-invalid.png` | Red toast «Mã loại giấy tờ không hợp lệ» · `HRM-PLT-CAT-CODE-INVALID` · input `CCCD` · honesty banner false | 🟢 |
| `03-doc-after-create.png` | Toast «Đã tạo loại giấy tờ… msj0oal9» · picker + table row · L1 SEAL row visible | 🟢 |
| `23-yctd-retest-picker.png` | YCTD dialog · ET search `seasonal_temp_yctd_msj0rv2s` option highlighted | 🟢 |

---

## Gate AC audit (browser AC-PLT-EMP-02..05)

| # | Spec / AC | Browser observed | QC |
|---|-----------|------------------|-----|
| 02 | Settings DOC create → 2xx → F5 → effective picker · CCCD INVALID | PUT 200 · F5 · picker · toast | 🟢 **ACCEPT** |
| 04 | ET seasonal 2xx · full-time→full_time · FULL_TIME INVALID · Emp+YCTD | All PASS (YCTD after retest) | 🟢 **ACCEPT** |
| 03 | Retire → active hide · historical key | Retire 201 · hide · GET-by-id retired | 🟢 **ACCEPT** |
| 05 | Effective drives consumers | Emp form + YCTD + Settings preview | 🟢 **ACCEPT** |
| — | must_keep position XBOS · contracts/SI · soft-delete | PASS | 🟢 **ACCEPT** |
| — | L1 SEAL / LIST-TOTALS/CTR | Retained / not reopened | 🟢 **ACCEPT** |
| — | Module UAT / J-* / Phase1 / ready | Explicit non-claim | 🟢 **DENIED** |
| — | Prior `R-PLT-EMP-FE` HOLD | Closed by this seat | 🟢 **CLOSED** |

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-PLT-EMP-FE** | QC-01 CONDITION OPEN | **CLOSED** — browser AC-PLT-EMP-02..05 PASS stamp `EMPPLATQA2-MSJ0OAL9` |
| YCTD first-pass `dialog_missing` | QA OBS | **CLOSED** — retest with `hdsd-requisition-create-btn` |
| DOC checklist consumer full spine | FE residual | **OBS P3 idle-ok** — Settings effective covers AC picker this seat |
| History via GET-by-id (list default omits retired) | QA OBS | **ACCEPT** — soft-delete SoT · keys readable |
| Console 404 insurance routes | machine `consoleErrors` | **OBS idle-ok** — must_keep SI/contracts PASS · not product AC fail |
| QA pack missing 2 fields | verify 2/8 | **PROCESS OBS** — QC consolidates 8/8 |
| Product P0 blockers | — | **NONE** |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| Browser 21/21 PASS stamp `EMPPLATQA2-MSJ0OAL9` | PRODUCT PASS | Yes → GWC ACCEPT browser SEAL |
| `R-PLT-EMP-FE` closed | PRODUCT CLOSED | Yes → prior CONDITION closed |
| L1 SEAL retained | PROCESS/PRODUCT OK | Yes → must_keep |
| QA pack 2/8 | PROCESS OBS | No — QC consolidates |
| Console insurance 404 | PROCESS OBS | No — SI surface PASS |
| `C-SLICE-≠-MODULE` honesty false | PRODUCT CONDITION | Yes → CONDITIONS (not full GO) |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **C-SLICE-≠-MODULE** | — | **pm** | Keep personnel/e2e/PAY/ATT/REC ready **false** · no J-* / Phase1 invent |
| **MergeToken `custom.emp`** | P2 program | **sa** (then ba/dev as needed) | U88 next governance after EMP browser seal — W8 residual |
| DOC checklist full spine | P3 OBS | **dev-fe** (optional) | Not blocking this GWC |
| LIST-TOTALS / CTR GWC | must_keep | — | **do not reopen** |
| EMP-QC-01 L1 | must_keep | — | **do not reopen** |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — browser AC only · no J-* promote · cross-nav deferred |
| 4 | crud_or_matrix | ✅ Browser AC-PLT-EMP-02..05 matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ personnel/e2e/pay/att/rec **false** · DENIED flips |
| 7 | Residual section | ✅ C-SLICE · MergeToken · OBS · must_keep seals |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-02.md` | exit **1** · **2/8** (`command_table` · `journey_l25`) | **PROCESS OBS** — browser QA seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md` | exit **0** · **8/8** | L1 SEAL pack OK (retained) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-02.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-02 runner stamp `EMPPLATQA2-MSJ0OAL9` | **PASS** · 21/21 · fail=0 | PRODUCT OK (cited machine JSON) |
| Screen spot CCCD / DOC create / YCTD | visual toast+picker+dialog | PRODUCT OK (spot-check) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: personnel J-* rows = **N/A / not tested** for this browser AC gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** Browser U65 AC-PLT-EMP-02..05 (Settings DOC/ET create→PUT 2xx→F5→INVALID toast→Emp+YCTD effective pickers→retire hide→GET-by-id retired) · CLOSE `R-PLT-EMP-FE` · U65 zero-seed · honesty LOCKED false · must_keep position XBOS REF · contracts/SI · soft-delete · LIST-TOTALS/CTR · L1 SEAL retained.

**OUT of scope / DENIED:** Module personnel UAT · employees e2e linkage · PAY/ATT/REC ready flip · J-* L2.5 · Phase 1 DONE · reopen EMP-QC-01 L1 · invent ready=true · seed.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC browser GWC **SEAL** for EMP platform DOC/ET AC-PLT-EMP-02..05 complete.
2. QA stamp **`EMPPLATQA2-MSJ0OAL9`** · **21/21** browser · U65 zero-seed **ACCEPT**.
3. **`R-PLT-EMP-FE` CLOSED** (prior QC-01 CONDITION).
4. **EMP-QC-01 L1 GWC SEAL RETAINED** — not reopened.
5. Honesty locked: personnel/e2e/pay/att/rec **false** · no module UAT / J-* / Phase1 invent · LIST-TOTALS/CTR not reopened.
6. Verdict **GO WITH CONDITIONS** (browser-SEAL) — not full-module GO.

### Residual

- **CONDITION:** `C-SLICE-≠-MODULE` — keep ready flags **false**.
- **U88 next:** MergeToken `custom.emp` governance (SA) and/or continue DEC BE chain per W8 — not EMP browser retest.
- OBS P3: DOC checklist full spine · insurance route console 404 — idle-ok.

---

## next_owner

**pm** → dispatch **`sa`** MergeToken `custom.emp` residual (U88) · optionally continue **`dev-be`** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01` if not already in-flight

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-MERGE-TOKEN-EMP-SA-01
from_role: pm
to_role: sa
lane: governance
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-QC-02
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-02.md
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qa-02.md
stamp_ref: EMPPLATQA2-MSJ0OAL9 · browser GWC EMP-QC-02 · L1 SEAL EMPPLATQA-MSIZXHIM retained

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-02.md
2. docs/program/PO_HRM_CONTINUOUS_W8_20260807.md (MergeToken custom.emp residual)
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-VERTICAL-SA-01.md (DOC+ET Option B · position XBOS REF must_keep)
4. docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-01.md (L1 SEAL — do not reopen)

## task
ADD-only Option/F.1 delta for MergeToken hook `custom.emp` after EMP DOC/ET browser GWC:
- Map merge tokens that bind emp_document_type / emp_employment_type effective catalogs
- must_keep: position XBOS REF · contracts/SI · LIST-TOTALS/CTR · soft-delete · EMP-QC-01 L1 + EMP-QC-02 browser seals
- Honesty LOCKED false — DENY hrm_personnel_uat_ready / employees_e2e / module EMP UAT / Phase1 · C-SLICE-≠-MODULE
- Cấm: reopen EMP-QC-01/02 · invent ready=true · seed · wipe seals
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-merge-token-emp-sa-01.md (or program specs path per map)

## exit
PASS_TO_PM with Option A/B + F.1 unlock ba-data/dev only if needed; then PM may chain DEC-BE if still open
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-emp-qc-02.md`

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
