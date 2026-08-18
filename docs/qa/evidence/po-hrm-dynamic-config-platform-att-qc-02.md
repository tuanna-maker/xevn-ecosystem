# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | governance — **narrow browser U65 AC-PLT-ATT-01..02** (Settings create → F5 → Nghỉ phép picker → retire hide → history key · must_keep shifts/sheets) · **not** module ATT UAT · **not** J-* · **not** Phase1 |
| **priority** | P2 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02` |
| **resume_chunk** | **K5** |
| **prior_fe** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01` READY_FOR_QA |
| **prior_qa** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-02` PASS_TO_PM · stamp **`ATTPLATQA2-MSIVNE4A`** · **13/13** |
| **prior_l1_qc** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-01` **GWC SEAL** — **cấm reopen** L1 API |
| **closes** | K5 browser AC-PLT-ATT-01..02 · browser HOLD from QC-01 CONDITION |
| **portal_url** | `http://127.0.0.1:5173` · HRM FE `:8080` · HRM API `:28001` · XBOS `:28002` |
| **journey_l25** | Settings Loại phép ATT → Nghỉ phép picker — **not** full ATT module J-* UAT |
| **crud_or_matrix** | Browser AC-PLT-ATT-01..02 + must_keep + NO-HARDCODE (§ Gate AC audit) |
| **Verdict** | **GO WITH CONDITIONS** — browser AC ACCEPT · **K5 SEAL** · `C-SLICE-≠-MODULE` · `attendance_uat_ready=false` |
| **ack_status** | `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-dynamic-config-platform-att-qa-02.md`](po-hrm-dynamic-config-platform-att-qa-02.md) |
| **fe_ref** | [`po-hrm-dynamic-config-platform-att-fe-01.md`](po-hrm-dynamic-config-platform-att-fe-01.md) |
| **l1_qc_ref** | [`po-hrm-dynamic-config-platform-att-qc-01.md`](po-hrm-dynamic-config-platform-att-qc-01.md) **SEAL retained** |
| **machine** | [`_tmp-po-hrm-dynamic-config-platform-att-qa-02-browser.json`](_tmp-po-hrm-dynamic-config-platform-att-qa-02-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-dynamic-config-platform-att-qa-02/` (01–10) |
| **spec_ref** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` §5 AC-PLT-ATT-01..02 · resume plan §K5 |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — browser GWC ≠ ATT module UAT / Phase1 DONE / J-* |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **`attendance_uat_ready`** | **`false`** | **DENIED** invent / promote — **PM must not set true** |
| **`payroll_e2e_ready`** | **`false`** | retained honesty (out of ATT slice claim) |
| **ATT-QC-01 L1 GWC** | **SEAL retained** | **cấm reopen** API-only seat |
| **Module ATT UAT / J-*** | **DENIED** this seat | browser AC slice only · no L2.5 promote |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | QA `seed_used=false` · zero-seed |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT browser U65 **AC-PLT-ATT-01..02** after FE-01 + QA-02 stamp **`ATTPLATQA2-MSIVNE4A`** (`passed=13` · `failed=0`). Audited QA-02 MD + machine JSON + FE-01 + QC-01 L1 SEAL (not reopened) + screens 02/06/07 + pack. Proven: Settings tab Loại phép ATT → **PUT** leave-types **200** key=`hr_custom_09_msivne4a` id=`94df8e8b-…` → F5 row → Nghỉ phép CatalogSearchPicker selects open key (effective sample includes `hr_custom_09_*` + `lvt_01..04`, not hardcode-only) → retire **201** active row gone → effective/picker hide → historical leave `f1fbed06-…` `leave_type` intact · must_keep work_shifts + attendance-sheets **200**. QA pack verify **8/8** PASS. **CONDITIONS:** `C-SLICE-≠-MODULE` · `attendance_uat_ready=false`. **CLOSED:** browser HOLD from ATT-QC-01. **DENIED** module ATT UAT · J-* flip · Phase1 DONE · invent ready=true · reopen L1. **NOT Phase 1 DONE.** **K5 exit met** (L1+FE picker browser GWC · DENY full ATT UAT).

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Stamp `ATTPLATQA2-MSIVNE4A` · 13/13 | QA-02 · machine `summary` | 🟢 **ACCEPT** |
| AC-PLT-ATT-01 create → 2xx → F5 row | PUT **200** · screen 02 toast + row | 🟢 **ACCEPT** |
| AC-PLT-ATT-01 picker selects new key | screen 06 · effective `hasNewKey=true` | 🟢 **ACCEPT** |
| NO-HARDCODE open keys in effective | sample `hr_custom_09_msivne4a` + lvt_* | 🟢 **ACCEPT** |
| AC-PLT-ATT-02 retire hide | retire **201** · screen 07 row gone · effective `hasKey=false` | 🟢 **ACCEPT** |
| AC-PLT-ATT-02 history key intact | leave `f1fbed06-…` · `intact=true` | 🟢 **ACCEPT** |
| must_keep shifts/sheets | both **200** | 🟢 **ACCEPT** |
| Honesty `attendance_uat_ready=false` | MD + machine | 🟢 **DENIED promote** |
| ATT-QC-01 L1 | prior GWC SEAL | 🟢 **SEAL retained** — not reopened |
| Browser HOLD (QC-01 CONDITION) | now browser PASS | 🟢 **CLOSED** |
| Module UAT / J-* / Phase1 | Explicit DENIED | 🟢 |
| Retire `fallbackApi` + leave create API helper | machine probes | 🟡 **OBS idle-ok** — see Classification |
| Portal `/hr/*` needs `:8080` | QA §6 OBS | 🟡 **ENV OBS** — not product NO-GO |

**Cấm:** invent `attendance_uat_ready=true` · claim ATT module UAT · flip J-* · Phase1 DONE · reopen ATT-QC-01 L1 · seed.

### PM promote decision (explicit)

| Question | Answer |
|----------|--------|
| May PM set `attendance_uat_ready=true`? | **NO** |
| May PM claim ATT module UAT / J-* new GO from this gate? | **NO** |
| Why | `C-SLICE-≠-MODULE` · browser AC slice ≠ module UAT · J-* not tested |
| Recommended flag state | keep **`attendance_uat_ready=false`** |
| May PM claim K5 browser AC-PLT-ATT-01..02 ACCEPT / SEAL? | **YES** — this seat GWC |
| May PM reopen ATT-QC-01 L1? | **NO** — SEAL retained |
| Forced residual dispatch this turn? | **NO** — idle-ok honesty + OBS only |

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| ATT-QC-01 L1 | `po-hrm-dynamic-config-platform-att-qc-01.md` | GWC SEAL | 🟢 **SEAL retained** — cấm reopen |
| FE-01 | `po-hrm-dynamic-config-platform-att-fe-01.md` | READY_FOR_QA | 🟢 **ACCEPT** Settings panel + LeaveTab effective |
| QA-02 browser | `po-hrm-dynamic-config-platform-att-qa-02.md` | PASS_TO_PM | 🟢 **ACCEPT** stamp `ATTPLATQA2-MSIVNE4A` |
| Machine | `_tmp-…-att-qa-02-browser.json` | overall PASS · 13/0 | 🟢 **ACCEPT** |
| Screens 01–10 | `screens/…-att-qa-02/` | present | 🟢 **ACCEPT** spot 02/06/07 |
| Pack verify QA-02 | `verify:qc:evidence-pack` | exit **0** · **8/8** | 🟢 |
| Spec AC-PLT-ATT-01..02 / §K5 | vertical SA + resume plan | TRACE OK | 🟢 **ACCEPT** |

### Machine JSON spot (`ATTPLATQA2-MSIVNE4A`)

| Signal | Value | QC |
|--------|-------|-----|
| `stamp` | `ATTPLATQA2-MSIVNE4A` | 🟢 |
| `honesty.attendance_uat_ready` / `seed_used` | **false** / **false** | 🟢 |
| `honesty.deny_reopen_att_qc_01_l1` | **true** | 🟢 |
| `overall` / `summary.failed` | **PASS** / **0** | 🟢 |
| `summary.passed` | **13** | 🟢 |
| `LVT_KEY` / upsert id | `hr_custom_09_msivne4a` / `94df8e8b-…` | 🟢 |
| AC-PLT-ATT-01-CREATE-2XX | PUT **200** | 🟢 |
| AC-PLT-ATT-01-F5-ROW | PASS | 🟢 |
| AC-PLT-ATT-01-PICKER | `hasNewKey=true` · company_id=`main` | 🟢 |
| AC-PLT-ATT-02-RETIRE-2XX | **201** · active row gone | 🟢 |
| AC-PLT-ATT-02-PICKER-HIDE | `hasKey=false` | 🟢 |
| AC-PLT-ATT-02-HISTORY | leave `f1fbed06-…` intact | 🟢 |
| MUST_KEEP-SHIFTS-SHEETS | both **200** | 🟢 |
| `consoleErrors` / `pageErrors` | **[]** | 🟢 |
| `ack_status` | **PASS_TO_PM** | 🟢 |

---

## Gate AC audit (browser)

| ID | Spec / check | Observed | QC |
|----|--------------|----------|-----|
| **AC-PLT-ATT-01** | Settings Tạo loại phép → 2xx → F5 → form picker | PUT **200** · F5 row · picker `hr_custom_09_msivne4a` | 🟢 **ACCEPT** |
| **AC-PLT-ATT-02** | Retire → picker ẩn · đơn cũ giữ key | retire **201** · hide · history intact | 🟢 **ACCEPT** |
| NO-HARDCODE | effective not LVT_01..04 only | open keys in sample | 🟢 **ACCEPT** |
| must_keep | work_shifts + sheets | **200** / **200** | 🟢 **ACCEPT** |
| AC-PLT-ATT-03 browser | optional · L1 already | **out of scope** | ⬜ **N/A** — L1 SEAL |
| Module UAT / J-* / Phase1 / ready | Explicit non-claim | DENIED | 🟢 **DENIED** |

---

## L2.5 journey matrix (U19 — QC consolidated)

| Journey / slice | Prior | QA-02 | QC |
|-----------------|-------|-------|-----|
| **ATT leave-type L1 API** | QC-01 GWC SEAL | not reopened | 🟢 **SEAL retained** |
| **AC-PLT-ATT browser Settings → picker → retire** (in-scope) | FE-01 + QA-02 | 🟢 PASS 13/13 | 🟢 **PASS / ACCEPT** |
| Attendance module UAT / J-* ATT | out of scope | not claimed | ⬜ **DEFERRED** — **DENY** promote |
| Phase 1 / `attendance_uat_ready` | honesty false | false | 🟢 **DENIED flip** |

**U19 note:** This gate certifies the **browser AC-PLT-ATT-01..02 slice** named in dispatch — **not** a claim that attendance module UAT or any **J-*** is newly GO. Missing module J-* does **not** NO-GO this seat; it **forces GWC CONDITION** (`C-SLICE-≠-MODULE`) and keeps `attendance_uat_ready=false`.

---

## Classification

| Signal | Class | Drives verdict? |
|--------|-------|-----------------|
| Browser AC-PLT-ATT-01..02 PASS stamp `ATTPLATQA2-MSIVNE4A` | PRODUCT PASS | Yes → GWC ACCEPT |
| `C-SLICE-≠-MODULE` · ready=false | PRODUCT CONDITION (honesty) | CONDITION — DENY promote |
| Retire Network `url=null` · `fallbackApi=true` (FE Ngừng button present `feBtn=true`) | PROCESS OBS | No — state after retire verified on FE (screen 07) + effective hide |
| Leave create via API after FE catalog (history fixture; not seed catalog) | PROCESS OBS | No — AC-02 history assert; catalog source = FE create |
| Portal `/hr/*` needs HRM Vite `:8080` mid-session crash | ENV OBS | No — stack recovered; L0 200 |
| Seed | none (U65) | OK |

---

## Evidence pack (QC consolidates 8/8)

| # | Check | Status |
|---|-------|--------|
| 1 | work_item_id | ✅ `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-02` |
| 2 | portal_url | ✅ `:5173` + HRM `:28001` / `:8080` |
| 3 | journey_l25 | ✅ browser Settings→picker slice · DENY module J-* |
| 4 | crud_or_matrix | ✅ AC-PLT-ATT-01..02 table above |
| 5 | Classification | ✅ PRODUCT / PROCESS / ENV |
| 6 | Honesty locks | ✅ `attendance_uat_ready=false` · DENIED flips · L1 SEAL |
| 7 | Residual / Conditions | ✅ C-SLICE · OBS idle-ok |
| 8 | Verdict + ack | ✅ **GO WITH CONDITIONS** · `PASS_TO_PM` |

---

## Command table (QC audit)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-02.md` | exit **0** · **PASS** · **8/8** | PRODUCT OK (QA pack) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-02.md` | exit **0** · **PASS** · **8/8** | QC pack SoT |
| QA-02 browser stamp `ATTPLATQA2-MSIVNE4A` | **PASS** · 13/0 · honesty ready=false | PRODUCT OK (cited) |
| Machine JSON audit `_tmp-…-att-qa-02-browser.json` | overall PASS · create/F5/picker/retire/history/must_keep | PRODUCT OK |
| Screen spot-check 02 / 06 / 07 | toast+row · picker select · retire row gone | PRODUCT OK |
| ATT-QC-01 L1 | GWC SEAL cited · not re-run | PROCESS OK — SEAL |

**U65:** QC did **not** run seed · did **not** mutate `apps/**` · observe-only pack + JSON + screen audit.

**L2.5 / journey:** No program attendance J-* newly GO — **deferred**. Explicit: all program attendance J-* rows = **N/A / not tested** for this browser slice gate — **DENY** promote.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **C-SLICE-≠-MODULE** | CONDITION | **RETAIN** | PM honesty |
| `attendance_uat_ready=false` | honesty | **RETAIN** | PM — DENY flip |
| Module ATT UAT / J-* | out-of-scope | **DEFERRED** | separate program wave |
| Browser HOLD (from QC-01) | CONDITION | **CLOSED** this seat | — |
| Retire fallbackApi / leave API history helper | OBS | **idle-ok** | optional P3 harden Network capture |
| Portal `:8080` proxy ENV | OBS | **idle-ok** | DevOps if flaky |

**Idle-ok:** no forced new technical residual for K5 browser AC seat after this GWC.

---

## Scope statement (bounded)

**IN scope ACCEPT:** Browser Settings Loại phép ATT create open key → F5 → Nghỉ phép picker select → retire hide → history key · must_keep shifts/sheets · NO-HARDCODE effective.

**OUT of scope / DENIED:** Module ATT UAT · J-* L2.5 promote · `attendance_uat_ready=true` · Phase 1 DONE · reopen ATT-QC-01 L1 API · AC-PLT-ATT-03 browser (optional; L1 SEAL).

**NOT Phase 1 DONE.**

**K5 SEAL:** L1 GWC (QC-01) + browser GWC (this seat) · DENY full ATT UAT.

---

## completion_report

### Closed

1. Narrow QC gate on browser AC-PLT-ATT-01..02 complete (resume **K5**).
2. Stamp `ATTPLATQA2-MSIVNE4A` ACCEPT — Settings create → F5 → picker → retire hide → history · must_keep.
3. Browser HOLD from ATT-QC-01 CONDITION **CLOSED**.
4. ATT-QC-01 L1 GWC **SEAL retained** (not reopened).
5. Honesty acknowledged: `attendance_uat_ready=false` · `C-SLICE-≠-MODULE` · DENY module UAT / J-* / Phase1.
6. QA pack 8/8 cited; this QC pack **8/8**.
7. Verdict **GO WITH CONDITIONS** — K5 browser SEAL · not module ATT UAT GO.

### Residual

- Honesty ready=false · C-SLICE-≠-MODULE · DENY J-* / module UAT / Phase1 · OBS idle-ok (retire Network fallback · leave API history helper · `:8080` ENV).

---

## Handoff

- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-02.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-PM-INTAKE-02
from_role: qc
to_role: pm
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QC-02
resume_chunk: K5
ref_qc: docs/qa/evidence/po-hrm-dynamic-config-platform-att-qc-02.md

## task
INTAKE QC GWC for ATT leave-type browser K5:
- Stamp ATTPLATQA2-MSIVNE4A browser AC-PLT-ATT-01..02 ACCEPT (Settings create→F5→picker→retire hide→history · must_keep).
- K5 SEAL: L1 QC-01 + browser QC-02 — mark resume plan §K5 DONE.
- Keep attendance_uat_ready=false; DENY module ATT UAT / J-* / Phase1 / invent ready=true.
- Cấm reopen ATT-QC-01 L1.
- Bus INTAKE + update TEAM_WORKING_NOW / PO_HRM_RESUME_PLAN §K5; scan K6 open seats via pm:idle:check and Task next P2 (do not idle if K6 OPEN).
- Idle-ok on K5 ATT browser residual (honesty + OBS only).

cấm: invent attendance_uat_ready=true · claim ATT module UAT · flip J-* · reopen ATT-QC-01 · seed
```
