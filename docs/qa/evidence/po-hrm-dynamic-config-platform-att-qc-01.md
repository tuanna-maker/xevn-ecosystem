# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **L1 API ATT leave-type catalog** (open create · Annual 400 · effective ATT wins · UNKNOWN leave 400 · retire+history) · **not** browser UF · **not** J-* promote · **not** module ATT UAT |
| **priority** | P2 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01` |
| **prior_be** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01` READY_FOR_QA |
| **prior_qa** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01` PASS_TO_PM · stamp **`ATTPLATQA-MSISVY4L`** |
| **closes** | L1 ATT leave-type catalog API seat (VAL-ATT-LVT-* / AC-PLT-ATT API subset) |
| **portal_url** | `http://127.0.0.1:5173` (login proxy observe) · HRM `:28001` · **api_base** `http://127.0.0.1:28001/api/hrm` |
| **journey_l25** | **N/A deferred** — L1 API seat only · **DENY** J-* promote · `C-SLICE-≠-MODULE` |
| **crud_or_matrix** | L1 VAL/AC matrix § Gate AC audit (create/read/retire + consumer unknown) |
| **Verdict** | **GO WITH CONDITIONS** — L1 API ACCEPT · CONDITIONS: **browser AC-PLT-ATT HOLD** (FE-01 already DISPATCHED) · **`C-SLICE-≠-MODULE`** · **`attendance_uat_ready=false`** |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-qa-01.md`](po-hrm-dynamic-config-platform-att-qa-01.md) |
| **be_ref** | [`po-hrm-dynamic-config-platform-att-be-01.md`](po-hrm-dynamic-config-platform-att-be-01.md) |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-qa-01.FINAL.json`](_tmp-po-hrm-dynamic-config-platform-att-qa-01.FINAL.json) |
| **spec_ref** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` §5 AC-PLT-ATT-01..03 · DATA-01 §5 VAL-ATT-LVT-* · F-ATT-CAT-LVT/EFF |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — L1 GWC ≠ ATT module UAT / Phase1 DONE / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | retained honesty (out of ATT slice claim) |
| **Browser AC-PLT-ATT / UF** | **HOLD** | FE-01 **already DISPATCHED** 2026-08-07T18:44+07 — **cấm** re-dispatch duplicate |
| **Module ATT UAT / J-*** | **DENIED** this seat | L1 API only · no L2.5 |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA honesty zero-seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT L1 ATT leave-type open catalog API after BE-01 + QA-01 stamp **`ATTPLATQA-MSISVY4L`**. Audited QA MD + FINAL JSON (`overall.verdict=PASS` · `passed=12` · `failed=0` · `honesty.attendance_uat_ready=false` · `browser_uf_hold=true`) + BE-01 jest 4 suites / 71 tests PASS (cited). Proven: open `hr_custom_09(+unique)` **201** · list+get scope_parity **200** · `Annual` **400** `HRM-PLT-CAT-CODE-INVALID` · effective collision `lvt_04` **`source=att_override`** · unknown leave **400** `HRM-LEAVE-TYPE-UNKNOWN` · retire **201** `status=retired` + active hide + archived · historical leave id `28fa6307-…` key `hr_custom_09_msisvy4l` intact · must_keep work_shifts + attendance-sheets **200**. QA pack verify **1/8** (`command_table` missing) = **PROCESS OBS** for L1 MD — this QC consolidates **8/8**. **CONDITIONS:** browser **AC-PLT-ATT HOLD** until FE-01 + browser QA · **`C-SLICE-≠-MODULE`** · **`attendance_uat_ready=false`**. **DENIED** module ATT UAT · J-* flip · Phase1 DONE · browser UF PASS. **NOT Phase 1 DONE.**

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Open catalog create `hr_custom_09_*` → 201 → list/get | QA §2 · JSON `POST_leave_types_open_key` · id `a1dbb5bc-…` | 🟢 **ACCEPT** |
| Literal `hr_custom_09` open (not enum) | QA §2 · **201** upsert | 🟢 **ACCEPT** |
| `Annual` → 400 `HRM-PLT-CAT-CODE-INVALID` | QA §2 · JSON step | 🟢 **ACCEPT** |
| Effective ATT wins (`att_override` on `lvt_04`) | QA §2 · JSON `GET_effective_after_collision` | 🟢 **ACCEPT** |
| UNKNOWN leave → 400 `HRM-LEAVE-TYPE-UNKNOWN` | QA §2 · `not_in_catalog_msisw255` | 🟢 **ACCEPT** |
| Retire + picker hide + archived | QA §2 · `status=retired` · `archivedAt` | 🟢 **ACCEPT** |
| History leave key intact after retire | leave id `28fa6307-…` · key intact on list | 🟢 **ACCEPT** |
| must_keep work_shifts / attendance-sheets | both **200** | 🟢 **ACCEPT** |
| BE-01 jest 71 PASS | BE evidence §4 | 🟢 **ACCEPT** (cited) |
| Honesty `attendance_uat_ready=false` | MD + machine | 🟢 **DENIED promote** |
| Browser AC-PLT-ATT HOLD | QA residual · FE-01 DISPATCHED | 🟡 **CONDITION** — do not re-dispatch FE |
| QA pack 1/8 command_table | L1 seat | 🟡 **PROCESS OBS** — QC consolidates |
| Module UAT / J-* / Phase1 | Explicit DENIED | 🟢 |

**Cấm:** invent `attendance_uat_ready=true` · claim ATT module UAT · flip J-* · claim browser UF PASS · Phase1 DONE · seed · re-dispatch FE-01 while in-flight.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM claim ATT module UAT / J-* new GO from this gate? | **NO** |
| Why | `C-SLICE-≠-MODULE` · L1 API ≠ browser UF / module UAT · J-* not tested |
| Recommended flag state | keep **`attendance_uat_ready=false`** |
| May PM claim L1 ATT leave-type catalog API ACCEPT? | **YES** — this seat GWC |
| Forced residual dispatch this turn? | **NO** for L1 — FE-01 already DISPATCHED; after FE READY_FOR_QA → browser QA (not this QC seat) |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-01 | `po-hrm-dynamic-config-platform-att-be-01.md` | READY_FOR_QA | **ACCEPT** ensureSchema + F-ATT-CAT-* + leave UNKNOWN wire |
| QA-01 L1 | `po-hrm-dynamic-config-platform-att-qa-01.md` | PASS_TO_PM | **ACCEPT** stamp `ATTPLATQA-MSISVY4L` |
| Machine | `_tmp-…-att-qa-01.FINAL.json` | overall PASS · 12/0 | **ACCEPT** |
| Pack verify QA | `verify:qc:evidence-pack` | exit **1** · **1/8** | 🟡 **PROCESS OBS** — L1; QC consolidates |
| Spec AC-PLT-ATT / VAL-ATT-LVT | vertical SA + DATA | TRACE OK | **ACCEPT** |
| FE-01 | bus `pm -> dev-fe DISPATCHED` 18:44+07 | in-flight | 🟡 **CONDITION HOLD** — cấm duplicate |

### Machine JSON spot (`ATTPLATQA-MSISVY4L`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTPLATQA-MSISVY4L` | 🟢 |
| `honesty.attendance_uat_ready` / `browser_uf` / `module_uat` | **false** / **false** / **false** | 🟢 |
| `overall.verdict` / failed | **PASS** / **0** | 🟢 |
| `unique_key` | `hr_custom_09_msisvy4l` | 🟢 |
| `ac.val_lvt_08_unknown` | 400 `HRM-LEAVE-TYPE-UNKNOWN` | 🟢 |
| `ac.val_lvt_05_retire` / picker / history | PASS · id `28fa6307-…` intact | 🟢 |
| Effective `lvt_04.source` | **`att_override`** | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (L1)

| ID | Spec / check | Observed | QC |
|----|--------------|----------|-----|
| ensureSchema | GET leave-types holding 200 | total≥0 · `HRM-ATT-LVT-200` | 🟢 **ACCEPT** |
| VAL-ATT-LVT-04 | Open create + list + get-by-id | **201** → **200** same id | 🟢 **ACCEPT** |
| VAL-ATT-LVT-02 | `Annual` format reject | **400** `HRM-PLT-CAT-CODE-INVALID` | 🟢 **ACCEPT** |
| VAL-ATT-LVT-10 / EFF | ATT wins collision | `source=att_override` | 🟢 **ACCEPT** |
| VAL-ATT-LVT-08 / AC-PLT-ATT-03 | Unknown leave reject | **400** `HRM-LEAVE-TYPE-UNKNOWN` | 🟢 **ACCEPT** |
| VAL-ATT-LVT-05 / AC-PLT-ATT-02 API | Retire + hide + history | retire **201** · history intact | 🟢 **ACCEPT** |
| must_keep | work_shifts + sheets | **200** / **200** | 🟢 **ACCEPT** |
| AC-PLT-ATT-01 **browser** | Settings → create → F5 → picker | **⬜ HOLD** | 🟡 **CONDITION** |
| — | Module UAT / J-* / Phase1 / ready | Explicit non-claim | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-01 | QC |
|-----------------|-------|-------|-----|
| **ATT leave-type L1 API** (in-scope) | BE-01 READY | 🟢 PASS | 🟢 **PASS / ACCEPT** |
| AC-PLT-ATT browser Settings picker | FE-01 DISPATCHED | ⬜ HOLD | ⬜ **DEFERRED** — CONDITION |
| Attendance module UAT / J-* ATT | out of scope | not claimed | ⬜ **DEFERRED** — **DENY** promote |
| Phase 1 / `attendance_uat_ready` | honesty false | false | 🟢 **DENIED flip** |

**U19 note:** This gate certifies the **L1 ATT leave-type catalog API slice** named in dispatch — **not** a claim that attendance module UAT or any **J-*** is newly GO. Missing browser/J-* does **not** NO-GO the L1 seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE` + browser HOLD) and keeps `attendance_uat_ready=false`.

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| L1 VAL/AC API PASS stamp `ATTPLATQA-MSISVY4L` | PRODUCT PASS | Yes → GWC ACCEPT |
| Browser AC-PLT-ATT HOLD | PRODUCT CONDITION (FE path) | CONDITION — FE-01 in flight |
| QA pack missing `command_table` (1/8) | PROCESS OBS | No — L1 seat; QC consolidates |
| Seed | none (U65) | OK |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-01` |
| 2 | portal_url | ✅ `:5173` + api_base `:28001` |
| 3 | journey_l25 | ✅ **N/A deferred** — L1 only · DENY J-* |
| 4 | crud_or_matrix | ✅ L1 VAL/AC table above |
| 5 | Classification | ✅ PRODUCT / PROCESS |
| 6 | Honesty locks | ✅ `attendance_uat_ready=false` · DENIED flips |
| 7 | Residual / Conditions | ✅ browser HOLD · C-SLICE |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-01.md` | exit **1** · **1/8** (`command_table`) | **PROCESS OBS** — L1 seat |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-01.md` | exit **0** · **PASS** · **8/8** | QC pack SoT |
| BE-01 `pnpm --filter hrm-api exec jest --testPathPatterns="att-leave-type.service.spec|attendance-config.service.spec|leave-requests.service.spec|attendance.controller.spec"` | **PASS** · 4 suites · 71 tests (cited BE-01) | PRODUCT OK (cited) |
| QA-01 L1 stamp `ATTPLATQA-MSISVY4L` | **PASS** · failed=0 · honesty ready=false | PRODUCT OK (cited) |
| `node` machine JSON audit `_tmp-…-att-qa-01.FINAL.json` | overall PASS · 12 AC · lvt_04=`att_override` · history intact | PRODUCT OK |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON audit.

**L2.5 / journey:** No J-* in-scope this seat — **deferred**. Explicit: all program attendance J-* rows = **N/A / not tested** for this L1 gate — **DENY** promote.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **AC-PLT-ATT browser HOLD** | CONDITION | **RETAIN** — FE-01 already DISPATCHED | dev-fe → qa browser after READY |
| **C-SLICE-≠-MODULE** | CONDITION | **RETAIN** | PM honesty |
| `attendance_uat_ready=false` | honesty | **RETAIN** | PM — DENY flip |
| Module ATT UAT / J-* | out-of-scope | **DEFERRED** | separate wave after FE+browser |

**Idle-ok:** no forced new technical residual for L1 ATT catalog seat after this GWC (do not re-dispatch FE-01).

---

## Scope statement (bounded)

**IN scope ACCEPT:** L1 F-ATT-CAT-LVT/EFF open catalog create/list/get · format reject · effective ATT wins · leave UNKNOWN · soft retire + history · must_keep shifts/sheets.

**OUT of scope / DENIED:** Settings browser UF · J-* L2.5 · `attendance_uat_ready=true` · ATT module UAT · Phase 1 DONE.

**NOT Phase 1 DONE.**

---

## completion_report

### Closed

1. Narrow QC gate on ATT leave-type L1 API catalog complete.
2. Stamp `ATTPLATQA-MSISVY4L` ACCEPT — open create · Annual 400 · ATT wins · UNKNOWN 400 · retire+history · must_keep.
3. Honesty acknowledged: `attendance_uat_ready=false` · `C-SLICE-≠-MODULE` · DENY module UAT / J-*.
4. Browser AC-PLT-ATT = CONDITION HOLD; FE-01 already DISPATCHED (no duplicate).
5. QA pack PROCESS OBS (1/8) consolidated into this QC pack **8/8**.
6. Verdict **GO WITH CONDITIONS** — not module ATT UAT GO.

### Residual

- Browser AC-PLT-ATT HOLD (FE-01 in flight) · honesty ready=false · C-SLICE-≠-MODULE · DENY J-* / module UAT / Phase1.

---

## Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-01.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-PM-INTAKE-01
from_role: qc
to_role: pm
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-01
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-01.md

## task
INTAKE QC GWC for ATT leave-type L1 catalog:
- Stamp ATTPLATQA-MSISVY4L L1 API ACCEPT (open create · Annual 400 · ATT wins · UNKNOWN · retire+history).
- Keep attendance_uat_ready=false; DENY module ATT UAT / J-* / Phase1 / browser UF PASS.
- CONDITION: browser AC-PLT-ATT HOLD — FE-01 already DISPATCHED (cấm re-dispatch). Wait FE READY_FOR_QA → Task qa browser U65.
- Bus INTAKE + update TEAM_WORKING_NOW; scan parent PO-HRM-DYNAMIC-CONFIG-PLATFORM for next open seat via pm:idle:check.
- Idle-ok on L1 ATT catalog residual (honesty + FE wait only).

cấm: invent attendance_uat_ready=true · claim ATT module UAT · flip J-* · re-dispatch FE-01 while in-flight · seed
```
