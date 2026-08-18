# Evidence — W1-B-01-QC-LEAVE-LIVE-R1

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-QC-LEAVE-LIVE-R1` |
| **from_role** | qc |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **lane** | L3 gate — leave browser UF (J-HRM-06 + Cases A/B/C after LIVE-R1) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `w1b-01-qa-leave-live-r1.md` PASS_TO_PM · test-log md+json · FE mount READY |
| **spec_ref** | FR-UC-H03 · FR-UC-M03 · J-HRM-06 · HDSD Chấm công → Nghỉ phép |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY |

---

## Verdict summary

**GO WITH CONDITIONS** — leave browser wave after QA LIVE-R1. Independent QC audit confirms prior mount P0 **`R-LEAVE-FE-ATTENDANCE-MOUNT` CLOSED** (`#root=4`, Vite resolve OK, tab **Nghỉ phép**), Cases **A/B/C**, **J-HRM-06** leave list surface, U65 zero-seed, U76 HDSD inventory, U78 world-standard test-log md+json. Prior FAIL `w1b-01-qa-leave-live.md` **superseded**. Do **not** reopen AUTH/EMP CLOSED residuals.

**Condition (allowed):** **R-LEAVE-TYPE-LABEL-DEPTH** P2 — API `leave_type_label` often echoes `LVT_*` (field present; UI list may show catalog VI e.g. Phép năm / picker `LVT_02 Ốm`). **Defer**; does **not** block leave mount / J-HRM-06 core. Soft-defer **R-LEAVE-WF-FULL** P2 (WF bridge). **NOT** Phase 1 / product UAT DONE from this leave gate alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/w1b-01-qa-leave-live.md` | FAIL_TO_PM · `#root=0` · mount P0 | **SUPERSEDED** by R1 |
| `docs/qa/evidence/w1b-01-fe-leave-attendance-mount.md` | READY_FOR_QA · LeaveOverview + transitive restore | **ACCEPT** |
| `docs/qa/evidence/w1b-01-qa-leave-live-r1.md` | PASS_TO_PM · A/B/C · J-HRM-06 · mount CLOSED | **ACCEPT** |
| `…-qa-leave-live-r1-test-log.md` | 12 chronological steps · verdict pass | **ACCEPT** (U78) |
| `…-qa-leave-live-r1-test-log.json` | `schema: xevn-test-log/v1` · 12 steps · cases pass | **ACCEPT** (U78 / OS 31) |
| `docs/qa/evidence/_tmp-w1b-01-qa-leave-live-r1-browser.json` | click_log **28** · ac mount/A/B/C · J-HRM-06 PASS | **ACCEPT** |
| Screens `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/` | **8** PNG on disk | **ACCEPT** (spot visual) |

---

## Independent spot-check (QC)

### EC1 — Mount + L0 (closes prior FAIL)

| Check | Result |
|-------|--------|
| FE panel on disk | `LeaveOverviewRecentPanel.tsx` **present** |
| Runtime mount | `ac.mount` · `rootChild=4` · `viteResolveFail=false` · `leaveTabVisible=true` |
| Screen attendance | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/01-attendance.png` — Tổng quan mounted · tab **Nghỉ phép** in chrome · recent leave widget |
| Screen leave tab | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/02-leave-tab.png` — **Quản lý nghỉ phép** · Tổng yêu cầu **28** · + Tạo yêu cầu nghỉ |
| Console / page errors | `consoleErrors=[]` · `pageErrors=[]` |

**PASS** — **`R-LEAVE-FE-ATTENDANCE-MOUNT` CLOSED** · prior LIVE FAIL superseded

### EC2 — Case A fail_deep

| Check | Result |
|-------|--------|
| Runtime | `A_fail` · `validationUi=true` · `noSuccessCreate=true` · `pickedSick=true` · `postAfter=[]` |
| Screen | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/04-case-a-fail.png` — dialog **Tạo yêu cầu nghỉ** · sick **LVT_02 Ốm** · reason fail_deep · **Gửi yêu cầu** visible |
| Network | No leave-requests POST 2xx during Case A |

**PASS** — silent create blocked. Note: picker shows `LVT_02` prefix → supports **R-LEAVE-TYPE-LABEL-DEPTH** CONDITION (not new FAIL).

### EC3 — Case B / J-HRM-06 list + row

| Check | Result |
|-------|--------|
| Runtime | GET leave-requests **200** `HRM-LEAVE-200` · **28** rows · `status_label=Chờ duyệt` · `employee_display_name=CEO Tập đoàn` |
| Screen list | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/05-case-b-list.png` — Danh sách yêu cầu · UI **Phép năm** / **Chờ duyệt** · employee CEO Tập đoàn |
| Screen row | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/06-case-b-detail.png` · row click OK |
| Journey | `journeys[0].id=J-HRM-06` · verdict **PASS** |

**PASS** — **J-HRM-06 PASS**

### EC4 — Case C F5

| Check | Result |
|-------|--------|
| Runtime | After F5 `#root=4` · `hasLeave=true` · `whitescreen=false` · GET leave **200** |
| Screen | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/07-case-c-f5.png` |

**PASS**

### EC5 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-W1B-01-QA-LEAVE-LIVE-R1-20260803` |
| steps | **12** chronological · all `pass` |
| cases | mount · A_fail · B_happy · C_f5 · J-HRM-06 |
| hdsd_align | **true** |
| u65_zero_seed | **true** |
| summary | passed=12 failed=0 · click_count=28 · verdict=pass · ack PASS_TO_PM |
| attachments | 8 PNG + runtime — **all exist on disk** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs leave LIVE-R1 | QC |
|---------|------------------------|-----|
| **J-HRM-06** Chấm công → leave list / yêu cầu | In-scope (Attendance → Nghỉ phép · list · row) | **PASS** (browser R1) |
| J-HRM-06b attendance sheet | Out of this WI | **not claimed** |
| Other J-HRM-* / J-CC-* / mobile | Out of this WI | **not claimed** |
| AUTH / EMP CLOSED journeys | Out of this WI | **not reopened** |

Mandatory in-scope journey for this leave gate: **J-HRM-06 PASS**. No untested mandatory J-* claimed PASS.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Mount CLOSED · J-HRM-06 + A/B/C **PASS** · leave surface browser UF |
| **PROCESS** | QA narrative pack `verify:qc:evidence-pack` **6/8** missing `command_table` + `residual_section` heading shape — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (L0/portal/HRM Vite **200** during R1 window) |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote leave close.

---

## Residual

| Id | Status | Sev | Owner | Blocks leave GO? |
|----|--------|-----|-------|------------------|
| **R-LEAVE-FE-ATTENDANCE-MOUNT** | **CLOSED** | — | — | No — do not reopen without regression |
| **R-LEAVE-TYPE-LABEL-DEPTH** | **OPEN — CONDITION** | P2 | PM triage / catalog display wave | **No** (defer OK per entry residual policy) |
| **R-LEAVE-WF-FULL** | **OPEN — CONDITION** | P2 | defer soft WF bridge | **No** |
| AUTH / EMP CLOSED | **CLOSED** (prior waves) | — | — | No — **cấm reopen** this leave gate |
| **C-LEAVE-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table + `## Residual` on next QA MD |

---

## Conditions (explicit)

1. **R-LEAVE-TYPE-LABEL-DEPTH** — API sample `leave_type_label: "LVT_01"` echo; UI list may still show Phép năm; create picker may show `LVT_02 Ốm` — **deferred P2**.
2. **R-LEAVE-WF-FULL** — full WF inbox approve chain **not** in this R1 scope — soft defer P2.
3. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this leave GWC alone.
4. Do **not** reopen **R-LEAVE-FE-ATTENDANCE-MOUNT** / AUTH / EMP CLOSED without new browser regression evidence.
5. Prior `w1b-01-qa-leave-live.md` FAIL is **superseded** — do not re-dispatch mount fix unless new whitescreen evidence.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-01-qa-leave-live-r1.md
→ FAIL exit 1 · 2/8 — command_table + residual_section
```

**PROCESS GWC** — product J-HRM-06 + A/B/C + mount independently verified; does not demote leave close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-01-qc-leave-live-r1.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-01-qc-leave-live-r1.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-01-qa-leave-live-r1.md` | **FAIL** exit **1** · **6/8** missing command_table + residual_section (process) |
| `node -e` schema/chrono/allPass on `w1b-01-qa-leave-live-r1-test-log.json` | **PASS** exit **0** · schema `xevn-test-log/v1` · steps=12 · allPass · png=8 |
| Disk check 8 PNG under `screens/w1b-01-qa-leave-live-r1-20260803/` | **PASS** · all present |
| Runtime cross-check `_tmp-w1b-01-qa-leave-live-r1-browser.json` | **PASS** · click_log=28 · mount rootChild=4 · A/B/C 🟢 · J-HRM-06 PASS |
| Disk `LeaveOverviewRecentPanel.tsx` | **PASS** · present (FE restore) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-01-qc-leave-live-r1.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/w1b-01-qc-leave-live-r1.md --check-assets` | **PASS** exit **0** (PNG paths resolve) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| Mount | `#root>0` · Nghỉ phép · no Vite resolve fail | **PASS** | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/01-attendance.png` · `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/02-leave-tab.png` · runtime rootChild=4 |
| **A** fail_deep | sick≥3 no attach · no silent create | **PASS** | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/04-case-a-fail.png` · postAfter=[] |
| **B** success_hdsd | list + labels bind · row click | **PASS** | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/05-case-b-list.png` · `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/06-case-b-detail.png` · GET 200 |
| **C** F5 | persist · no whitescreen | **PASS** | `docs/qa/evidence/screens/w1b-01-qa-leave-live-r1-20260803/07-case-c-f5.png` |
| **J-HRM-06** L2.5 | Attendance → leave list surface | **PASS** | R1 Cases B/C · journeys runtime |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not reopen AUTH / EMP CLOSED residuals
- Did not invent new AC beyond QA evidence
- Did not NO-GO solely on P2 **R-LEAVE-TYPE-LABEL-DEPTH**
- Did not treat prior LIVE FAIL as still open after R1 mount CLOSED

---

## completion_report

**Closed:** L3 QC gate `W1-B-01-QC-LEAVE-LIVE-R1` on leave browser after QA LIVE-R1. Spot-check screens + runtime Network + U78 test-log credible. **`R-LEAVE-FE-ATTENDANCE-MOUNT` CLOSED**. Cases A/B/C **PASS**. **J-HRM-06 PASS**. U65 zero-seed honored. Prior LIVE FAIL superseded.

**Residual / conditions:** **R-LEAVE-TYPE-LABEL-DEPTH** P2 defer (CONDITION); **R-LEAVE-WF-FULL** P2 soft defer; QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/w1b-01-qc-leave-live-r1.md`

---

## next_dispatch_prompt

```text
work_item_id: W1-B-01-LEAVE-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/w1b-01-qc-leave-live-r1.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - R-LEAVE-FE-ATTENDANCE-MOUNT CLOSED — do not reopen without regression
  - J-HRM-06 PASS (leave local :5173 / :8080)
  - R-LEAVE-TYPE-LABEL-DEPTH P2 CONDITION defer OK
  - prior w1b-01-qa-leave-live.md FAIL superseded by LIVE-R1
action:
  1) Bus INTAKE W1-B-01-QC-LEAVE-LIVE-R1 PASS_TO_PM + promote leave browser mount CLOSED on backlog / TEAM_WORKING_NOW
  2) Close leave browser slice W1-B-01 LIVE/R1 chain — continue next open W1-B / PM_OPEN_BACKLOG item (do not idle)
  3) Defer R-LEAVE-TYPE-LABEL-DEPTH to catalog/display wave only when that UF enters scope — not leave J-HRM-06 reopen
  4) Soft-defer R-LEAVE-WF-FULL (WF approve chain) — separate WI if sponsor needs inbox approve
  5) Do NOT claim product UAT DONE / Phase 1 DONE from this leave GWC
  6) Do NOT reopen AUTH/EMP CLOSED residuals
cấm: seed · invent UAT DONE · reopen attendance mount without new whitescreen defect
```

---

## pm_dispatch_hint

`W1-B-01-LEAVE-PM-CLOSE` — promote leave browser mount CLOSED + J-HRM-06 GWC; defer R-LEAVE-TYPE-LABEL-DEPTH P2; next backlog; no UAT/Phase1 DONE claim; no AUTH/EMP reopen.
