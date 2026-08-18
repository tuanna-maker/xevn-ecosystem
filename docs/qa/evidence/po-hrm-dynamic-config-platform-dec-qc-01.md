# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API only** DEC `hr_decision_type` platform catalog · **not** browser UF · **not** J-* promote · **not** decisions UAT |
| **priority** | P0 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-01` PASS_TO_PM (L1 AC 12/12) |
| **prior_devops** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-DEVOPS-01` (closes `D-DEC-PLT-STALE-DIST`) |
| **prior_fail** | stamp `DECPLATQA-MSJ14FCK` (stale dist — unauth `/effective` **404**) — superseded |
| **portal_url** | `http://127.0.0.1:5173` (login proxy) · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 API seat only · **no** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | L1 AC-PLT-DEC / VAL-DEC-CAT·CNS·ALS·SCP (list/create · format · uppercase VALID · effective dual SoT · CNS UNKNOWN · retire hide · scope_parity · member 409 · FORBIDDEN hard-delete) |
| **Verdict** | **GO WITH CONDITIONS** — **L1 SEAL ACCEPT** · CONDITION: browser Settings / DEC CFG pickers **`R-PLT-DEC-FE-01`** HOLD → **`DEC-FE-01`** · **`C-SLICE-≠-MODULE`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-dec-qa-01.md`](po-hrm-dynamic-config-platform-dec-qa-01.md) |
| **devops_ref** | [`po-hrm-dynamic-config-platform-dec-devops-01.md`](po-hrm-dynamic-config-platform-dec-devops-01.md) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-dec-qa-01.FINAL.json`](_tmp-po-hrm-dynamic-config-platform-dec-qa-01.FINAL.json) · stamp **`DECPLATQA-MSJ1FB3D`** |
| **stamp_ref** | QA `DECPLATQA-MSJ1FB3D` · DevOps `DECPLATDEVOPS-MSJ1K9XZ` · prior FAIL `DECPLATQA-MSJ14FCK` |
| **spec_ref** | F-DEC-CAT-TYP/EFF · AC-PLT-DEC-01..06 · VAL-DEC-CAT/CNS/ALS/SCP · BE `po-hrm-dynamic-config-platform-dec-be-01.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · probe ≠ UF |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 GWC ≠ decisions UAT / Phase1 DONE / personnel·e2e·pay·att·rec·printable ready / J-* / browser UF |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **Decisions / QSĐ module UAT** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`hrm_personnel_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`employees_e2e_linkage_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **Browser UF Settings / DEC CFG pickers** | **HOLD** | FE seat not delivered · L1 ≠ browser PASS |
| **Module decisions UAT** | **DENIED** | Slice ≠ module seal |
| **J-* L2.5** | **DENIED / deferred** | Out of scope this L1 seat |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **F-CORE-DEC create/approve/WH · EMP DOC/ET · ATT leave · REC stages** | **must_keep** | **not reopened / not wiped** |
| **Seed** | **DENIED** (U65) | QA L1 probe only · zero-seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 API smoke for DEC platform catalog (`hr_decision_type` / F-DEC-CAT-TYP+EFF) after DevOps rebuild closed `D-DEC-PLT-STALE-DIST` + QA retest stamp **`DECPLATQA-MSJ1FB3D`** (`overall.verdict=PASS` · `pass=12` · `fail=0` · `total_ac=12` · honesty all **false** · `fe_hold=true`). Audited QA MD + FINAL JSON + DevOps-01 + live unauth spot-check. Proven at stamp: unauth list+effective **401** `HRM-AUTH-001` (not 404) · dist `hr-decision-type.service.js` present · controller `decision-types/effective` · list **200** · open key create **201** · format space/digit **400** `HRM-PLT-CAT-CODE-INVALID` · uppercase-alone `HRD_QA_*` **201** VALID · effective dual SoT `dec_native`+`group_ref` · openInEff=true · CNS unknown **400** `HRM-DEC-TYPE-UNKNOWN` · retire hide · CEO scope_parity holding↔main **200** · member OOS **409** `SCOPE_CONTEXT_MISMATCH` · DELETE **404** (no hard-delete). Browser Settings / DEC CFG pickers = **CONDITION HOLD** (`R-PLT-DEC-FE-01`) → **`DEC-FE-01`**. QA pack verify **3/8** (missing `command_table` / `portal_url` / `journey_l25`) = **PROCESS OBS** for L1 MD — this QC consolidates **8/8** with explicit **N/A deferred J-***. **DENIED** decisions UAT · honesty flip · browser UF PASS · module UAT · Phase1 DONE · FE dispatch before this SEAL · seed. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `DECPLATQA-MSJ1FB3D` · 12/12 L1 | FINAL `overall.pass=12` · `fail=0` | 🟢 **ACCEPT** |
| `D-DEC-PLT-STALE-DIST` CLOSED | DevOps-01 + QA unauth **401**/**401** + live spot **401**/**401** + dist present | 🟢 **CLOSED** |
| List + open key create | `200` / `201` `hr_custom_dec_09_msj1fb3d` | 🟢 **ACCEPT** |
| Format INVALID (space / leading digit) | `400 HRM-PLT-CAT-CODE-INVALID` | 🟢 **ACCEPT** |
| Uppercase-alone VALID (`HRD_QA_*`) | `201` (DEC allows case) | 🟢 **ACCEPT** |
| Effective dual SoT | `200` · sources `dec_native,group_ref` · openInEff | 🟢 **ACCEPT** |
| CNS UNKNOWN when catalog >0 | `400 HRM-DEC-TYPE-UNKNOWN` | 🟢 **ACCEPT** |
| Soft retire + list hide | retire `201` · hidden=true | 🟢 **ACCEPT** |
| Scope parity CEO + member OOS 409 | get holding/main 200 · member 409 | 🟢 **ACCEPT** |
| FORBIDDEN hard-delete | DELETE `404 HRM-DATA-404` | 🟢 **ACCEPT** |
| must_keep F-CORE-DEC / EMP / ATT / REC | not reopened | 🟢 **ACCEPT** |
| U65 zero-seed | QA + machine `u65` | 🟢 **ACCEPT** |
| Honesty ready flags false | MD + FINAL | 🟢 **DENIED promote** |
| Browser Settings pickers `R-PLT-DEC-FE-01` | HOLD until FE | 🟡 **CONDITION OPEN** |
| QA pack 3/8 | L1 seat | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / J-* / Phase1 / ready | Explicit DENIED | 🟢 |

**Cấm:** invent decisions UAT · invent personnel/e2e/pay/att/rec/printable ready · Phase1 DONE · claim J-* / browser UF PASS · claim module DEC UAT · wipe F-CORE-DEC WH spine · seed as evidence · FE dispatch before this L1 SEAL (now unlocked for PM).

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set decisions / QSĐ module UAT ready? | **NO** |
| May PM set `hrm_personnel_uat_ready=true`? | **NO** |
| May PM set e2e / PAY / ATT / REC / printable ready true? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 API seal ≠ browser Settings / module UAT |
| Recommended flag state | keep all honesty flags **`false` LOCKED** |
| May PM claim L1 AC DEC catalog SEALED? | **YES** — this seat GWC L1-SEAL |
| May PM claim browser Settings pickers / module UAT / Phase1 / J-*? | **NO** |
| Forced residual dispatch this turn? | **YES** — next product wave **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01`** (Settings / DEC CFG pickers) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Prior FAIL | stamp `DECPLATQA-MSJ14FCK` | FAIL_TO_PM · unauth `/effective` **404** · dist missing | **SUPERSEDED** |
| DevOps-01 | `po-hrm-dynamic-config-platform-dec-devops-01.md` | READY_FOR_QA · stamp `DECPLATDEVOPS-MSJ1K9XZ` | **ACCEPT** · `D-DEC-PLT-STALE-DIST` CLOSED |
| QA-01 L1 retest | `po-hrm-dynamic-config-platform-dec-qa-01.md` | PASS_TO_PM · 12/12 | **ACCEPT** |
| Machine FINAL | `_tmp-…-dec-qa-01.FINAL.json` | stamp `DECPLATQA-MSJ1FB3D` · PASS | **ACCEPT** |
| Pack verify QA-01 | `verify:qc:evidence-pack` | exit **1** · **3/8** | 🟡 **PROCESS OBS** — L1; QC consolidates |
| Live unauth spot (QC) | `:28001` list + `/effective` | **401** / **401** · dist EXISTS · effective route FOUND | 🟢 **CLOSED** stale-dist |

### Machine JSON spot (`DECPLATQA-MSJ1FB3D`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `DECPLATQA-MSJ1FB3D` | 🟢 |
| `lane` | `L1_API_smoke_only` | 🟢 |
| `u65` | zero-seed · browser Settings HOLD | 🟢 |
| `honesty.decisions_module_uat_ready` | **false** | 🟢 |
| `honesty.hrm_personnel_uat_ready` / e2e / pay / att / rec / printable | **false** | 🟢 |
| `honesty.browser_uf` / `module_uat` | **false** / **false** | 🟢 |
| `overall.verdict` / pass | **PASS** · **12/12** · fail **0** | 🟢 |
| Unauth stale_dist_probe | list=**401** effective=**401** | 🟢 CLOSED |
| Dist `has_hr_decision_type_service_js` | **true** · controller effective **true** | 🟢 |
| Open create | `201 HRM-DEC-TYP-201` · `hr_custom_dec_09_msj1fb3d` | 🟢 |
| Format + uppercase | space/digit **400** · `HRD_QA_*` **201** | 🟢 |
| Effective dual SoT | `200` · sources `dec_native,group_ref` · openInEff | 🟢 |
| CNS unknown | `400 HRM-DEC-TYPE-UNKNOWN` | 🟢 |
| Retire hide | `201` status=retired · hidden=true | 🟢 |
| CEO scope_parity | holding **200** · main **200** | 🟢 |
| Member OOS | `409 SCOPE_CONTEXT_MISMATCH` | 🟢 |
| Hard-delete | `404 HRM-DATA-404` | 🟢 |
| `fe_hold` / `honesty_locked` | **true** / **true** | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (L1 exit criteria)

| # | Spec / AC | L1 observed | Browser | QC |
|---|-----------|-------------|---------|-----|
| 0 | Stale-dist unauth list+effective | **401** / **401** (not 404) | — | 🟢 **CLOSED** |
| 1 | GET decision-types holding | **200** `HRM-DEC-TYP-200` | — | 🟢 **ACCEPT** |
| 2 | POST open key create | **201** `HRM-DEC-TYP-201` | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| 3 | Format INVALID (space / digit) | **400** `HRM-PLT-CAT-CODE-INVALID` | — | 🟢 **ACCEPT** |
| 3b | Uppercase-alone VALID | **201** `HRD_QA_*` | — | 🟢 **ACCEPT** |
| 4 | Effective dual SoT | **200** · `dec_native`+`group_ref` · openInEff | — | 🟢 **ACCEPT** |
| 5 | CNS UNKNOWN | **400** `HRM-DEC-TYPE-UNKNOWN` | — | 🟢 **ACCEPT** |
| 6 | Retire + list hide | **201** retired · hidden | **⬜ HOLD** | 🟢 L1 · 🟡 browser CONDITION |
| 7 | scope_parity group CEO | list↔get holding/main **200** | — | 🟢 **ACCEPT** |
| 7b | member OOS | **409** deny | — | 🟢 **ACCEPT** |
| 8 | FORBIDDEN hard-delete | **404** | — | 🟢 **ACCEPT** |
| 9 | honesty + FE HOLD | false LOCKED · HOLD | — | 🟢 **DENIED promote** |
| — | Settings / DEC CFG pickers | not in L1 | **⬜ HOLD** | 🟡 **CONDITION OPEN** → DEC-FE-01 |
| — | Module UAT / J-* / Phase1 / ready | Explicit non-claim | — | 🟢 **DENIED** |

**Note (normalize peer):** DEC key `^[a-zA-Z][a-zA-Z0-9_]*$` — hyphen **not** accepted (unlike EMP ET); uppercase alone **VALID** per BR-PLT-05 / HRD_* style — audited ACCEPT.

---

## Defect / OBS disposition

| ID | Prior | QC disposition |
|----|-------|----------------|
| **D-DEC-PLT-STALE-DIST** | P0 runtime `/effective` 404 · dist missing | **CLOSED** — DevOps rebuild + QA retest 401 + QC live 401 + dist EXISTS |
| **R-PLT-DEC-FE-01** | QA residual HOLD | **CONDITION OPEN** — owner **dev-fe** `DEC-FE-01` then **qa** browser |
| VAL-DEC-CNS-02..04 / CAT-06..10 | deferred deep WH / person-bound | **deferred** — post FE / separate wave · not L1 blocker |
| L1 product blockers | none | **NONE** — do not invent defect |
| QA pack missing 3 fields | verify 3/8 | **PROCESS OBS** — L1 seat; QC consolidates 8/8 |

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| L1 12/12 PASS stamp `DECPLATQA-MSJ1FB3D` | PRODUCT PASS | Yes → GWC ACCEPT L1 SEAL |
| `D-DEC-PLT-STALE-DIST` closed (401 not 404) | PRODUCT CLOSED | Yes → prior FAIL superseded |
| Browser Settings HOLD `R-PLT-DEC-FE-01` | PRODUCT CONDITION | Yes → CONDITIONS (not NO-GO) |
| QA pack 3/8 | PROCESS OBS | No — L1 seat; QC consolidates |
| Member OOS 409 (not 403) | PRODUCT OK | No — matrix-aligned deny |

---

## Residual

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-PLT-DEC-FE-01** | P2 | **dev-fe** → **qa** | Settings / DEC CFG decision-types pickers UF (create→F5→picker · format toast · retire hide · effective bind) |
| VAL-DEC-CNS-02..04 / CAT-06..10 | P3 deferred | post FE | person-bound / WH flag deep / WH-REQUIRED |
| **C-SLICE-≠-MODULE** | — | **pm** | Keep decisions/personnel/e2e/pay/att/rec/printable ready **false** · no J-* / Phase1 invent |
| F-CORE-DEC / EMP DOC-ET / ATT leave / REC stages | must_keep | — | **do not reopen / wipe** |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 only · no J-* promote · cross-nav deferred |
| 4 | crud_or_matrix | ✅ L1 VAL-DEC-CAT/CNS/ALS/SCP matrix above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ decisions/personnel/e2e/pay/att/rec/printable **false** · DENIED flips |
| 7 | Residual section | ✅ R-PLT-DEC-FE-01 + deferred CNS deep + C-SLICE · D CLOSED |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md` | exit **1** · **3/8** (`command_table` · `portal_url` · `journey_l25`) | **PROCESS OBS** — L1 seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-01.md` | exit **0** · **PASS** · **8/8** (re-run after write) | QC pack SoT |
| QA-01 runner stamp `DECPLATQA-MSJ1FB3D` | **PASS** · 12/12 · fail 0 | PRODUCT OK (cited FINAL JSON) |
| DevOps-01 unauth list + effective | **401** `HRM-AUTH-001` (not 404) | PRODUCT OK — `D-DEC-PLT-STALE-DIST` CLOSED |
| QC live spot unauth `:28001` list + `/effective` | **401** / **401** · dist `hr-decision-type.service.js` EXISTS · controller effective FOUND | PRODUCT OK (spot-check) |
| L0 `GET /api/hrm` | **200** | ENV OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit + unauth spot.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: decisions J-* rows = **N/A / not tested** for this L1 gate.

---

## Scope statement (bounded)

**IN scope ACCEPT:** L1 DEC platform catalog (list/create open key · format INVALID · uppercase VALID · effective dual SoT · CNS UNKNOWN 400 · retire hide · CEO scope_parity · member 409 OOS · FORBIDDEN hard-delete) · `D-DEC-PLT-STALE-DIST` CLOSED · U65 zero-seed · honesty LOCKED false · must_keep F-CORE-DEC / EMP / ATT / REC.

**OUT of scope / DENIED:** Browser Settings / DEC CFG pickers PASS · decisions module UAT · personnel/e2e/pay/att/rec/printable ready flip · J-* L2.5 · Phase 1 DONE · wipe create/approve/WH spine.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC L1 GWC **SEAL** for DEC platform `hr_decision_type` catalog (AC 12/12) complete.
2. QA stamp **`DECPLATQA-MSJ1FB3D`** · **12/12** L1 · U65 zero-seed **ACCEPT**.
3. **`D-DEC-PLT-STALE-DIST` CLOSED** (unauth list+effective **401** not 404; dist `hr-decision-type.*` present) — DevOps + QA + QC live spot.
4. Honesty locked: decisions/personnel/e2e/pay/att/rec/printable **false** · browser Settings HOLD · no module UAT / J-* / Phase1 invent · must_keep spines not reopened.
5. Verdict **GO WITH CONDITIONS** (L1-SEAL) — not full-module GO.
6. FE dispatch **unlocked for PM** after this SEAL (was DENIED until QC SEAL).

### Residual

- **CONDITION:** browser Settings / DEC CFG pickers **`R-PLT-DEC-FE-01`** → owner chain **`DEC-FE-01`** then QA browser.
- **`C-SLICE-≠-MODULE`** retained · VAL-DEC-CNS-02..04 / CAT-06..10 deferred post FE.

---

## next_owner

**pm** → dispatch **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01`** (`dev-fe`)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-01
program: PO-HRM-CONTINUOUS-W8-20260807
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-01.md
ref_qa: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md
ref_devops: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-devops-01.md
stamp_ref: DECPLATQA-MSJ1FB3D · L1 SEAL GWC DEC-QC-01 · devops DECPLATDEVOPS-MSJ1K9XZ

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-01.md
2. docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md
3. docs/qa/evidence/po-hrm-dynamic-config-platform-dec-be-01.md (if present)
4. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md (F-DEC-CAT Option · dual SoT · must_keep F-CORE-DEC)

## entry_criteria
- L1 QC SEAL GWC ACCEPT (this parent) · D-DEC-PLT-STALE-DIST CLOSED
- U65 zero-seed · honesty decisions/personnel/e2e/pay/att/rec/printable =false LOCKED
- must_keep: F-CORE-DEC create/approve/WH spine · EMP DOC/ET · ATT leave · REC stages

## task
ADD Settings / DEC CFG decision-types open catalog FE (picker bind to L1 effective):
- AC-PLT-DEC browser: Tạo loại QSĐ (open key) → 2xx → list row → F5 persist → create-decision / CFG pickers show new key from effective
- Format reject (space / leading digit) → deterministic 4xx toast HRM-PLT-CAT-CODE-INVALID
- Uppercase HRD_* style allowed (peer L1) — do not falsely reject case-only keys
- Effective dual SoT display (dec_native + group_ref) — tenant wins where applicable
- CNS: free-text unknown type blocked on create decision (400 HRM-DEC-TYPE-UNKNOWN) with FE feedback
- Retire → picker hide → history/archived still shows key
- must_keep: F-CORE-DEC create/approve/WH · no wipe EMP/ATT/REC · U65 zero-seed
- Honesty: decisions UAT=false · personnel/e2e/pay/att/rec/printable=false
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md
- code_memory_required: true · change_mode: ADD
- closes residual: R-PLT-DEC-FE-01

## exit
READY_FOR_QA with click path + network stamps; then PM dispatch QA browser Settings/DEC CFG UF
DENIED: decisions UAT · honesty flip · Phase1 DONE · claim module GO from FE alone
```

---

## evidence_path

`docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-01.md`

## ack_status

**PASS_TO_PM**

## decisions_module_uat_ready

**false**

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

## contracts_printable_ready

**false**
