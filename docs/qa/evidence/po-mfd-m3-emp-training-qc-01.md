# Evidence — `PO-MFD-M3-EMP-TRAINING-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-TRAINING-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — M3 Employees profile **Đào tạo** crash residual only (matrix **#19 LIVE**) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main` |
| **journey_l25** | **J-HRM-02** list→hồ sơ → tab Đào tạo (HDSD CH06 §6.2) · matrix **#19** SCR-TAB-TRAINING |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **uat_done** | **false** |
| **employees_closed** | **false** |
| **attendance_closed** | **false** |
| **entry** | QA [`po-mfd-m3-emp-training-qa-01.md`](po-mfd-m3-emp-training-qa-01.md) PASS_TO_PM · FE [`po-mfd-m3-emp-training-fix-01.md`](po-mfd-m3-emp-training-fix-01.md) · parent RUNTIME [`po-mfd-m3-emp-qa-runtime-01.md`](po-mfd-m3-emp-qa-runtime-01.md) #19 **BROKEN** · runtime [`_tmp-po-mfd-m3-emp-training-qa-01-browser.json`](_tmp-po-mfd-m3-emp-training-qa-01-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/01-list.png` · `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/02-detail-shell.png` · `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/03-training-tab.png` · `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/04-training-f5.png` |
| **spec_ref** | HDSD CH06 §6.2 · UC-HRM-21 · matrix #19 SCR-TAB-TRAINING · residual `R-MFD-M3-EMP-TRAINING-CRASH` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` · **0** mutates in QA runtime |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · **Employees menu CLOSED** · Attendance CLOSED · Training CRUD mutate depth |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 Training crash residual only. Parent RUNTIME stamped #19 **BROKEN** (`TypeError` reading `stats.completed` after GET training **200**). FE FIX (`getStats` / `EMPTY_TRAINING_STATS`) + QA U65 browser prove #19 **LIVE**: click path list→profile→HR→Đào tạo; GET `…/training?company_id=main` **200** `HRM-EMP-PROFILE-200` (`itemCount=0`, `hasStatsKey=false`); `pageErrors=[]` · `consoleErrors=[]` · `completedCrash=false`; summary cards **Đã hoàn thành 0 / Đang học 0 / Tổng giờ học 0h / Chi phí (CTy) 0 ₫**; empty honesty **Chưa có chương trình đào tạo**; F5 → re-open Đào tạo still **200** + no crash. Residual `R-MFD-M3-EMP-TRAINING-CRASH` **CLOSED**. Matrix rollup BROKEN **0**. **Employees menu NOT CLOSED**. **Attendance NOT CLOSED**. **uat_done=false**. Did **not** expand to full Employees GO. Training Thêm/Lưu/F5 mutate **not** promoted.

**Conditions:** NOT Phase1/UAT DONE · NOT Employees CLOSED · NOT Attendance CLOSED · #9 Xuất PARTIAL + #18 Job PARTIAL remain · Training CRUD RO-only this seat.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `po-mfd-m3-emp-qa-runtime-01.md` | #19 **BROKEN** · pageError `.completed` · residual P0 → FE | **ACCEPT** parent FAIL SoT |
| `po-mfd-m3-emp-training-fix-01.md` | ROOT: destructure `stats` vs `getStats` · EMPTY defaults · unit 2/2 · READY_FOR_QA | **ACCEPT** FE root-cause |
| `po-mfd-m3-emp-training-qa-01.md` | PASS_TO_PM · #19 LIVE · GET 200 · pageErrors=[] · F5 OK · U65 · Employees CLOSED false | **ACCEPT** product |
| `_tmp-po-mfd-m3-emp-training-qa-01-browser.json` | verdict **PASS** · matrix_stamp **LIVE** · trainingOk×2 · mutates=[] · uat_done false | **ACCEPT** Network SoT |
| Matrix `#19` `HRM-EMPLOYEES_FIDELITY_MATRIX.md` | **LIVE** · TRAINING-QA-01 · BROKEN=0 · LIVE=26 · PARTIAL=#9+#18 | **ACCEPT** MATCH QA stamp |
| Screens (4) | list · shell · training · F5 | **ACCEPT** visual spot |

---

## Gate AC audit (narrow TRAINING crash CLOSED)

| # | AC | Runtime / visual | QC |
|---|-----|------------------|-----|
| 1 | L0 fe-be health | JSON l0 entry+exit hrm/xbos/portal **200** | 🟢 **PASS** |
| 2 | Browser click path HDSD §6.2 / J-HRM-02 | click_log NAV_EMPLOYEES → CLICK_ROW → OPEN_TRAINING → F5 | 🟢 **PASS** |
| 3 | GET training **200** | `/training?company_id=main` **200** `HRM-EMP-PROFILE-200` · itemCount=0 · hasStatsKey=false (×2 incl F5) | 🟢 **PASS** |
| 4 | pageErrors=[] (no `.completed` crash) | pageErrors=[] · consoleErrors=[] · completedCrash=false · f5Crash=false | 🟢 **PASS** |
| 5 | Summary cards render (zeros OK) | UI hasCompletedLabel · hasNumericStats · bodySnippet cards 0 · PNG 03/04 | 🟢 **PASS** |
| 6 | F5 + re-open Đào tạo | training_f5 GET 200 · crashBanner=false · PNG 04 | 🟢 **PASS** |
| 7 | U65 zero-seed · 0 mutates | mutates=[] · zero_seed=true · no seed commands | 🟢 **PASS** |
| 8 | #19 LIVE honesty vs parent BROKEN | matrix LIVE · JSON matrix_stamp LIVE · BROKEN residual CLOSED | 🟢 **PASS** |
| 9 | NOT invent Employees / Attendance CLOSED | employees_closed=false · attendance_closed=false · uat_done=false | 🟢 **PASS** (honesty) |

---

## Independent spot-check (QC)

### EC1 — Crash residual CLOSED vs parent BROKEN

| Check | Result |
|-------|--------|
| Parent RUNTIME | #19 **BROKEN** — GET 200 + pageError reading `'completed'` |
| FE FIX | `useEmployeeTraining` exposes `getStats` + `EMPTY_TRAINING_STATS`; UI uses `getStats?.() ?? EMPTY` |
| QA retest | `completedCrash=false` · `pageErrors=[]` · criteria all true · verdict **PASS** |
| Residual | `R-MFD-M3-EMP-TRAINING-CRASH` **CLOSED** |

**PASS** — P0 crash closed with Network + UI proof.

### EC2 — Network training 200 (empty honesty OK)

| Check | Result |
|-------|--------|
| Open tab | GET training **200** `HRM-EMP-PROFILE-200` · itemCount=0 · hasStatsKey=false |
| After F5 | same path **200** again |
| Mutates | **0** |

**PASS** — Nest empty list without `stats` key no longer crashes FE.

### EC3 — Visual summary cards + empty state

| Check | Result |
|-------|--------|
| PNG `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/03-training-tab.png` | Tab **Đào tạo** active · cards **0 / 0 / 0h / 0 ₫** · empty **Chưa có chương trình đào tạo** · CTA Thêm · no crash banner |
| PNG `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/04-training-f5.png` | Same intact after F5 re-open |
| Disk | 01–04 present (188858 / 136673 / 65061 / 65043 bytes) |

**PASS**

### EC4 — Matrix #19 LIVE consistency

| Source | Stamp | QC |
|--------|-------|-----|
| Parent RUNTIME | **BROKEN** | superseded for #19 only |
| QA TRAINING-01 | **LIVE** | MATCH |
| Browser JSON | `matrix_stamp=LIVE` | MATCH |
| `HRM-EMPLOYEES_FIDELITY_MATRIX.md` #19 | **LIVE** | MATCH |
| Rollup | LIVE **26** · PARTIAL **2** (#9 · #18) · BROKEN **0** | MATCH |

**PASS** — LIVE upgrade honest. Do **not** invent Employees CLOSED.

### EC5 — Forbidden honesty

| Check | Result |
|-------|--------|
| Seed | **None** (U65) |
| Employees CLOSED | **false** / **not claimed** |
| Attendance CLOSED | **false** / **not claimed** |
| uat_done | **false** |
| Phase1 / UAT DONE | **not claimed** |
| Training CRUD mutate | **not exercised** / **not promoted** |
| Full Employees GO | **out of scope** this seat |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-HRM-02** list→hồ sơ → Đào tạo (#19) | **In-scope** crash residual | **PASS** (Network + PNG + pageErrors=[]) — stamp **LIVE** |
| Employees menu CLOSED (28/28 LIVE + program rules) | Forbidden invent | **not claimed** (PARTIAL #9+#18 remain) |
| Attendance / Face | Out of this seat | **not claimed** / **NOT CLOSED** |

Mandatory in-scope: #19 crash gone + GET training 200 + summary cards. No invent Employees/Attendance CLOSED.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | #19 LIVE — GET training 200 · pageErrors=[] · summary cards zeros · F5 OK · crash residual **CLOSED** |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **FAIL 2/8** (missing command_table + portal_url headers) — **process-only**; does **not** drive product NO-GO (runtime JSON + screens + matrix solid). QC pack this file targets **8/8**. |
| **ENV** | L0 hrm/xbos/portal **200** entry+exit |
| **OBS** | Training CRUD Thêm/Lưu/F5 mutate not exercised (RO seat) |
| **OUT-OF-SCOPE** | Phase1/UAT DONE · Employees CLOSED · Attendance CLOSED · invent FAIL on #9/#18 · full Employees GO |

ENV does not drive verdict. PROCESS QA pack gap does **not** demote Training crash CLOSED. OBS CRUD depth does **not** reopen BROKEN.

---

## Residual

| Id | Status | Sev | Owner | Blocks this GWC? |
|----|--------|-----|-------|------------------|
| `R-MFD-M3-EMP-TRAINING-CRASH` / #19 BROKEN | **CLOSED** this QC | P0 | — | No — CLOSED |
| Matrix #19 LIVE (RO crash-free) | **CLOSED** | — | — | No |
| #9 Xuất Nest depth PARTIAL | OPEN | P1 | qa (`PO-MFD-M3-EMP-EXPORT-01` already DISPATCHED) | **No** — out of Training seat |
| #18 Job honesty PARTIAL | OPEN | P2 | ba-process | **No** |
| Training CRUD mutate depth | not exercised | P1/P2 | later EMP seat | **No** — RO sufficient for crash CLOSE |
| Employees / Attendance CLOSED · uat_done | — | — | — | No — **not claimed** |

**No residual product P0** open for Training crash. Employees menu **NOT CLOSED**.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **Employees menu NOT CLOSED** — do not stamp Employees CLOSED / flip `uat_done` true.
3. **Attendance NOT CLOSED** — do not invent Attendance CLOSED / Face LIVE.
4. Matrix **#19 LIVE** is Training crash-free RO slice only — **not** full Employees GO; CRUD mutate depth not claimed.
5. PARTIAL **#9 Xuất** + **#18 Job** remain open (EXPORT already on bus).
6. U65: **no seed** in acceptance path.
7. Parent RUNTIME BROKEN stamp **superseded for #19 only** — honesty chain retained (employees_closed false).
8. QA pack process gap (2/8) — optional QA format follow-up; **not** product reopen.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-training-qa-01.md
→ FAIL exit 1 (2/8) — missing command_table + portal_url
→ Classification: PROCESS only (product SoT = browser JSON + PNG + matrix)
```

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-training-qc-01.md
→ PASS exit 0 (8/8) [post-write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-training-qc-01.md --check-assets
→ PASS exit 0 · PNG refs OK [post-write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-training-qa-01.md` | **FAIL** exit **1** · **2/8** (command_table · portal_url) — **PROCESS** |
| Disk check PNG under `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/` | **PASS** · 01–04 present |
| Runtime cross-check `_tmp-po-mfd-m3-emp-training-qa-01-browser.json` | **PASS** · verdict PASS · training GET 200×2 · pageErrors=[] · mutates=0 · matrix LIVE · employees_closed=false · attendance_closed=false · uat_done=false |
| Spot visual docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/03-training-tab.png | **PASS** · Đào tạo · cards 0 · empty honesty · no crash |
| Spot visual docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/04-training-f5.png | **PASS** · after F5 intact |
| Matrix #19 vs `HRM-EMPLOYEES_FIDELITY_MATRIX.md` | **PASS** · #19 **LIVE** MATCH — supersedes BROKEN |
| Open FE FIX MD root-cause ack | **PASS** · getStats / EMPTY_TRAINING_STATS · unit 2/2 |
| Open parent RUNTIME #19 BROKEN | **PASS** · crash chain clear |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-training-qc-01.md` | **PASS** exit **0** (8/8) [post-write] |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m3-emp-training-qc-01.md --check-assets` | **PASS** exit **0** [post-write] |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | browser JSON l0 200 |
| **LOGIN** | `ceo@xe.vn` companyId=main | **PASS** | login http 201 |
| **READ** list→detail J-HRM-02 | open profile | **PASS** | click_log + detail GET 200 |
| **READ** #19 Đào tạo | GET training 200 · no pageError · cards | **PASS** / **LIVE** | `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/03-training-tab.png` + JSON |
| **READ** F5 re-open | still 200 · no crash | **PASS** | `docs/qa/evidence/screens/po-mfd-m3-emp-training-qa-01/04-training-f5.png` |
| Training **C/U/D** mutate | Thêm/Lưu/F5 | **not exercised** | RO seat — OBS |
| Employees CLOSED / Attendance CLOSED | Forbidden invent | **not claimed** | employees_closed false · attendance_closed false |

---

## Forbidden compliance (QC)

- No seed (`u65_zero_seed`)
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE / Employees CLOSED / Attendance CLOSED
- Did not invent Training CRUD mutate PASS
- Did not expand scope to full Employees GO
- Did not NO-GO solely on QA pack PROCESS 2/8 when product JSON+PNG+matrix PASS
- Did not GO without opening QA MD + FE FIX + parent RUNTIME + runtime JSON + PNG spot-check
- #19 LIVE only after crash gone **and** GET training 200 + summary cards proven

---

## completion_report

**Closed:** QC L3 **PO-MFD-M3-EMP-TRAINING-QC-01** → **GO WITH CONDITIONS**. Training crash residual **CLOSED**; matrix **#19 LIVE** (parent BROKEN superseded). Browser: GET training **200** `HRM-EMP-PROFILE-200` · pageErrors=[] · summary cards zeros · empty honesty · F5 OK · U65 **0** mutates. **Employees menu NOT CLOSED**. **Attendance NOT CLOSED**. **uat_done false**. NOT Phase1 DONE. NOT full Employees GO.

**Open / residual owners:** #9 Xuất → `PO-MFD-M3-EMP-EXPORT-01` (already DISPATCHED on bus); #18 Job (ba-process); Training CRUD depth later. QA pack format PROCESS optional.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-EXPORT-01
from_role: pm
to_role: qa
lane: execution
priority: P1
u65_zero_seed: true
ack_status target: PASS_TO_PM

## Context (QC GWC intake)
PO-MFD-M3-EMP-TRAINING-QC-01 = GO WITH CONDITIONS
evidence: docs/qa/evidence/po-mfd-m3-emp-training-qc-01.md
#19 Training crash CLOSED · LIVE; Employees NOT CLOSED · Attendance NOT CLOSED · uat_done false
If EXPORT-01 already DISPATCHED/in-flight: do NOT re-dispatch — await QA PASS_TO_PM then QC.

entry_criteria:
- L0 qc:fe-be-health PASS
- portal http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main
- ceo@xe.vn / Xevn@2026
- must_keep #1-8 #10-12 #19 #28 LIVE — do not regress Training

exit_criteria:
1. Browser Xuất dialog → columns/format honesty vs Nest export depth
2. Stamp #9 LIVE or keep PARTIAL with SPEC_GAP owner
3. evidence docs/qa/evidence/po-mfd-m3-emp-export-01.md
4. NOT claim Employees CLOSED · NOT touch Attendance Face
cấm: seed · invent CLOSED · reopen #19 BROKEN without new FAIL
```

## evidence_path

`docs/qa/evidence/po-mfd-m3-emp-training-qc-01.md`

## ack_status

**PASS_TO_PM**
