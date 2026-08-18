# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API only** F-REC-CAT-STG/EFF + APP-02 UNKNOWN · **not** browser UF · **not** J-* promote · **not** module REC UAT |
| **priority** | P2 |
| **resume_chunk** | K6.2d |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-01` |
| **prior_be** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01` READY_FOR_QA |
| **portal_url** | `http://127.0.0.1:5173` (login proxy) · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 API seat only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | L1 VAL-REC-STG / AC-PLT-REC L1 matrix (see § Gate AC audit) |
| **Verdict** | **GO WITH CONDITIONS** — L1 SEAL ACCEPT · CONDITIONS: browser **AC-PLT-REC-02..05** HOLD · **AC-PLT-REC-05** hire→EMP HOLD · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-rec-qa-01.md`](po-hrm-dynamic-config-platform-rec-qa-01.md) |
| **be_ref** | [`po-hrm-dynamic-config-platform-rec-be-01.md`](po-hrm-dynamic-config-platform-rec-be-01.md) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-rec-qa-01.FINAL.json`](_tmp-po-hrm-dynamic-config-platform-rec-qa-01.FINAL.json) · stamp **`RECPLATQA-MSIWKJWP`** |
| **spec_ref** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` §5 AC-PLT-REC-02..05 · F-REC-CAT-STG/EFF · F-REC-APP-02 · DATA-01 VAL-REC-STG-* |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · probe ≠ UF |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 GWC ≠ recruitment module UAT / Phase1 DONE / payroll_e2e / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **Browser UF AC-PLT-REC-02..05** | **HOLD** | FE seat not delivered · L1 ≠ browser PASS |
| **Module recruitment UAT** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5** | **DENIED / deferred** | Out of scope this L1 seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA L1 probe only · zero-seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API smoke for REC open pipeline-stage catalog (F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01 · F-REC-APP-02 UNKNOWN) after BE-01 + QA-01 stamp **`RECPLATQA-MSIWKJWP`** (`overall.verdict=PASS` · `pass_count=10` · `required_count=10` · `failed=[]` · honesty all **false**). Audited QA MD + FINAL JSON + BE-01 + SA §5. Proven at stamp: ensureSchema live · open `hr_custom_stage_07(_msiwkjwp)` **201** · format reject `Interview` **400** `HRM-PLT-CAT-CODE-INVALID` · effective `hiredOutcomeKey=hired_qa_msiwiylu` · second hired **409** `HRM-REC-STG-HIRED-DUP` · pool stage ∉ catalog **400** `HRM-REC-STAGE-UNKNOWN` · soft retire + active hide + historical pool stage intact · must_keep JD/IV/pool/YCTD **200**. Browser AC-PLT-REC-02..05 + full hire→EMP AC-PLT-REC-05 = **CONDITION HOLD** → **REC-FE-01** then QA browser. QA pack verify **1/8** (`command_table`) = **PROCESS OBS** for L1 MD — this QC consolidates **8/8** with explicit **N/A deferred J-***. **DENIED** module REC UAT · J-* promote · Phase1 DONE · `recruitment_uat_ready=true` · `payroll_e2e_ready=true` · browser UF PASS · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `RECPLATQA-MSIWKJWP` · 10/10 L1 | FINAL `overall.pass_count=10` · `failed=[]` | 🟢 **ACCEPT** |
| Open catalog create/list/get + scope_parity | QA §2 · id `9d4bd0cd-…` | 🟢 **ACCEPT** |
| Format reject `Interview` | `400 HRM-PLT-CAT-CODE-INVALID` | 🟢 **ACCEPT** |
| EFF `hiredOutcomeKey` | `hired_qa_msiwiylu` | 🟢 **ACCEPT** |
| Hired UQ second | `409 HRM-REC-STG-HIRED-DUP` | 🟢 **ACCEPT** |
| APP-02 UNKNOWN (pool path) | `400 HRM-REC-STAGE-UNKNOWN` | 🟢 **ACCEPT** |
| Soft retire + history intact | retired · cand stage key kept | 🟢 **ACCEPT** |
| must_keep JD/IV/hire-surface/YCTD | all **200** | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine `u65` | 🟢 **ACCEPT** |
| Honesty ready flags false | MD + FINAL | 🟢 **DENIED promote** |
| Browser AC-PLT-REC-02..05 | HOLD until FE | 🟡 **CONDITION OPEN** |
| AC-PLT-REC-05 hire→EMP | L1 HOLD · must_keep only | 🟡 **CONDITION OPEN** |
| QA pack 1/8 command_table | L1 seat | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / J-* / Phase1 / ready | Explicit DENIED | 🟢 |

**Cấm:** invent `recruitment_uat_ready=true` · invent `payroll_e2e_ready=true` · Phase1 DONE · claim J-* / browser UF PASS · claim module REC UAT · seed as evidence.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `recruitment_uat_ready=true`? | **NO** |
| May PM set `payroll_e2e_ready=true`? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 API seal ≠ browser AC / module UAT · AC-PLT-REC-02..05 browser HOLD |
| Recommended flag state | keep **`recruitment_uat_ready=false`** · **`payroll_e2e_ready=false`** |
| May PM claim L1 F-REC-CAT-STG/EFF + APP-02 UNKNOWN SEALED? | **YES** — this seat GWC |
| May PM claim browser AC / module UAT / Phase1 / J-*? | **NO** |
| Forced residual dispatch this turn? | **YES** — next product wave **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01`** (Settings/picker) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| SA vertical §5 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` §5 | CONFIRMED AC-PLT-REC-02..05 | **TRACE OK** |
| BE-01 | `po-hrm-dynamic-config-platform-rec-be-01.md` | READY_FOR_QA · jest 48 PASS | **ACCEPT** |
| QA-01 L1 | `po-hrm-dynamic-config-platform-rec-qa-01.md` | PASS_TO_PM · 10/10 | **ACCEPT** |
| Machine FINAL | `_tmp-…-qa-01.FINAL.json` | stamp `RECPLATQA-MSIWKJWP` · PASS | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · **1/8** (`command_table`) | 🟡 **PROCESS OBS** — L1; QC consolidates |
| Spec F-REC-CAT / APP-02 | SA §3 + §5 | L1 maps VAL + AC L1 rows | **TRACE OK** |

### Machine JSON spot (`RECPLATQA-MSIWKJWP`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `RECPLATQA-MSIWKJWP` | 🟢 |
| `lane` | `L1_API_smoke_only` | 🟢 |
| `u65` | zero-seed · browser UF HOLD | 🟢 |
| `honesty.recruitment_uat_ready` | **false** | 🟢 |
| `honesty.payroll_e2e_ready` | **false** | 🟢 |
| `honesty.browser_uf` / `module_uat` | **false** / **false** | 🟢 |
| `overall.verdict` / pass | **PASS** · **10/10** · `failed=[]` | 🟢 |
| Open create | `201 HRM-REC-STG-201` · key `hr_custom_stage_07_msiwkjwp` | 🟢 |
| Format reject | `400 HRM-PLT-CAT-CODE-INVALID` | 🟢 |
| EFF hired key | `hired_qa_msiwiylu` | 🟢 |
| Hired dup | `409 HRM-REC-STG-HIRED-DUP` | 🟢 |
| APP-02 UNKNOWN | `400 HRM-REC-STAGE-UNKNOWN` (pool PATCH) | 🟢 |
| Retire + history | retired · cand `1d291765-…` stage intact | 🟢 |
| `ac_plt_rec_05_hire_path` | **HOLD** (honest) | 🟢 HOLD ≠ invent PASS |
| `residual` | R-REC-BROWSER-AC-PLT · R-REC-AC-PLT-REC-05 | 🟡 CONDITION |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit

| # | Spec / AC | L1 observed | Browser | QC |
|---|-----------|-------------|---------|-----|
| ensureSchema | GET pipeline-stages holding | **200** | — | 🟢 **ACCEPT** |
| VAL-REC-STG-04 / **AC-PLT-REC-02** | Open key create + list + get | **201/200** | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| VAL-REC-STG-04 literal | `hr_custom_stage_07` open | **201** | — | 🟢 **ACCEPT** |
| VAL-REC-STG-11 | scope_parity | **PASS** | — | 🟢 **ACCEPT** |
| VAL-REC-STG-02 | `Interview` format reject | **400** INVALID | — | 🟢 **ACCEPT** |
| F-REC-CAT-EFF-01 | `hiredOutcomeKey` | **200** | — | 🟢 **ACCEPT** |
| VAL-REC-STG-05 | second hired | **409** HIRED-DUP | — | 🟢 **ACCEPT** |
| VAL-REC-STG-12 / **AC-PLT-REC-04** | UNKNOWN when catalog>0 | **400** (pool) | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| VAL-REC-STG-08 / **AC-PLT-REC-03** | Retire hide + history | **201** + intact | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| **AC-PLT-REC-05** | hire→EMP hired-outcome | must_keep pool **200** only | **⬜ HOLD** | 🟡 **CONDITION OPEN** |
| must_keep | JD / IV / hire / YCTD | all **200** | — | 🟢 **ACCEPT** |
| — | Module UAT / J-* / Phase1 / ready | Explicit non-claim | — | 🟢 **DENIED** |

**OBS (not blocker):** `candidate-applications` empty this env — UNKNOWN proven on **pool** path (same F-REC-APP-02 assert) · WF-locked pool rows skipped — **CONDITION OK**.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **R-REC-BROWSER-AC-PLT** | QA residual P2 | **CONDITION OPEN** — owner **dev-fe** `REC-FE-01` then **qa** browser |
| **R-REC-AC-PLT-REC-05** | QA residual P2 hire→EMP | **CONDITION OPEN** — after FE picker + hire path; **must_keep** F-REC-HIRE-01 |
| L1 product blockers | none | **NONE** — do not invent defect |
| QA pack missing command_table | verify 1/8 | **PROCESS OBS** — L1 seat; QC consolidates 8/8 |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| L1 10/10 PASS stamp `RECPLATQA-MSIWKJWP` | PRODUCT PASS | Yes → GWC ACCEPT L1 SEAL |
| Browser AC HOLD · hire→EMP HOLD | PRODUCT CONDITION | Yes → CONDITIONS (not NO-GO) |
| QA pack 1/8 command_table | PROCESS OBS | No — L1 seat; QC consolidates |
| Pool-path UNKNOWN vs applications empty | PRODUCT OBS | No — assert covered |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-REC-BROWSER-AC-PLT** | P2 | **dev-fe** → **qa** | Settings/REC CFG picker UF for AC-PLT-REC-02..04 browser |
| **R-REC-AC-PLT-REC-05** | P2 | **dev-fe** (+ hire soft-link) → **qa** | Hire path hired-outcome → EMP after FE |
| **C-SLICE-≠-MODULE** | — | **pm** | Keep `recruitment_uat_ready=false` · no J-* / Phase1 invent |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 only · no J-* promote · cross-nav deferred |
| 4 | crud_or_matrix | ✅ L1 create/read/retire/UNKNOWN matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · DENIED flips |
| 7 | Residual section | ✅ R-REC-BROWSER + R-REC-AC-05 + C-SLICE |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-01.md` | exit **1** · **1/8** (`command_table`) | **PROCESS OBS** — L1 seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT (re-run after write) |
| QA-01 runner stamp `RECPLATQA-MSIWKJWP` | **PASS** · 10/10 · `failed=[]` | PRODUCT OK (cited FINAL JSON) |
| BE-01 `pnpm --filter hrm-api exec jest --testPathPatterns="rec-pipeline-stage|…"` | **PASS** · 5 suites · 48 tests (cited BE-01) | PRODUCT OK (cited) |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: recruitment J-* rows = **N/A / not tested** for this L1 gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** L1 F-REC-CAT-STG-01/02 CRUD+retire · F-REC-CAT-EFF-01 hiredOutcomeKey · F-REC-APP-02 `HRM-REC-STAGE-UNKNOWN` · scope_parity · open catalog · hired UQ · must_keep surfaces 200 · U65 zero-seed.

**OUT of scope / DENIED:** Browser Settings/picker UF · AC-PLT-REC-02..05 browser PASS · full hire→EMP soft-link UAT · J-* L2.5 · `recruitment_uat_ready=true` · `payroll_e2e_ready=true` · module REC UAT · Phase 1 DONE.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC L1 GWC SEAL for F-REC-CAT-STG/EFF + APP-02 UNKNOWN complete.
2. QA stamp **`RECPLATQA-MSIWKJWP`** · **10/10** L1 · U65 zero-seed **ACCEPT**.
3. Honesty locked: `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · browser AC HOLD · no module UAT / J-* / Phase1 invent.
4. Verdict **GO WITH CONDITIONS** (L1 seal) — not full-module GO.

### Residual

- **CONDITION:** browser **AC-PLT-REC-02..05** + **AC-PLT-REC-05** hire→EMP → owner chain **REC-FE-01** then QA browser.
- **`C-SLICE-≠-MODULE`** retained.

---

## next_owner

**pm** → dispatch **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01`** (`dev-fe`)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-01
resume_chunk: K6.2d
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-01.md
ref_sa: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §5

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md
2. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-01.md
3. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §3 + §5
4. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md

## task
ADD Settings / REC CFG pipeline-stage open catalog FE (picker bind to F-REC-CAT-EFF-01):
- AC-PLT-REC-02: Tạo giai đoạn (HR custom key #7+) → 2xx → list row → F5 persist → stage transition picker shows new key
- AC-PLT-REC-03: Retire → picker hide → historical application/history still shows old key
- AC-PLT-REC-04: transition to_stage ∉ catalog → deterministic 4xx toast (HRM-REC-STAGE-UNKNOWN)
- AC-PLT-REC-05 prep: hire/accept-offer path can select hired-outcome key without breaking F-REC-HIRE-01 soft-link
- must_keep: JD DnD · IV one-active · YCTD · no hardcode six starters · U65 zero-seed · no wipe spines
- Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-fe-01.md
- code_memory_required: true · change_mode: ADD

## exit
READY_FOR_QA with click path + network stamps; then PM dispatch QA browser AC-PLT-REC-02..05
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md`

## ack_status

**PASS_TO_PM**

## recruitment_uat_ready

**false**

## payroll_e2e_ready

**false**
