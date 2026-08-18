# Evidence — PO-E2E-SPINE-02-WEB-QC-W1

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-02-WEB-QC-W1` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **lane** | L3 gate — SPINE-02 web LV-03/04 only (not full product UAT) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `po-e2e-spine-02-web-qa-w1-r1.md` PASS_TO_PM · test-log md+json · BE VAL-ATT READY · FE attach READY |
| **spec_ref** | FR-UC-H03 · BR-LEAVE-ATT-01 · LV-03 · LV-04 · J-HRM-06 (mount/list F5) · HDSD Chấm công → Nghỉ phép |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY · full SPINE-02 approve / LV-02 ladder |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded SPINE-02 **web LV-03/04** after QA-W1-R1. Independent QC audit confirms:

1. **LeaveOverviewRecentPanel mount GWC kept** — `#root=4`, `viteResolveFail=false`, tab **Nghỉ phép**.
2. **LV-03** — ốm ≥3d no attach → FE toast block · `postAfter=[]` · `silentCreate=false` · **no silent 201** (prior W1 FAIL closed). Live POST `HRM-LEAVE-VAL-ATT` not hit (FE gate); BE catalog VAL-ATT covered by jest **33/33** in BE evidence.
3. **LV-04** — upload `HRM-FILE-201` + POST leave **201** `HRM-LEAVE-201` + non-null `attachment_url` + F5 GET sample same id / `attachment_url` / `status_label=Chờ duyệt`.
4. **U65** zero-seed honored; **U76** HDSD inventory; **U78** test-log `xevn-test-log/v1` md+json credible.
5. Prior FAIL `po-e2e-spine-02-web-qa-w1.md` **superseded** for LV-03/04 product AC.

**Allowed CONDITIONS (not blockers for this slice):** `R-SPINE-WEB-APPROVE-UX-01` · `R-SPINE-LV02-BA-01` / leave ladder T_L1 HOLD (`C-LEAVE-DEV-UNLOCK-01`). **NOT** Phase 1 / product UAT DONE from this slice GWC.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md` | FAIL_TO_PM · LV-03 silent 201 · LV-04 no attach UI | **SUPERSEDED** by R1 for LV-03/04 |
| `docs/qa/evidence/po-e2e-spine-02-be-lv03-val-att-01.md` | READY_FOR_QA · catalog ốm VAL-ATT · jest 33/33 | **ACCEPT** |
| `docs/qa/evidence/r-spine-lv04-attach-fe-01.md` | READY_FOR_QA · attach UI + FE gate · mount untouched | **ACCEPT** |
| `docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md` | PASS_TO_PM · mount · LV-03 · LV-04 | **ACCEPT** |
| `…-web-qa-w1-r1-test-log.md` | chrono steps · verdict pass | **ACCEPT** (U78) |
| `…-web-qa-w1-r1-test-log.json` | `schema: xevn-test-log/v1` · 8 steps · all pass | **ACCEPT** (U78 / OS 31) |
| `docs/qa/evidence/_tmp-po-e2e-spine-02-web-qa-w1-r1-browser.json` | click_log **36** · LV_03/LV_04 PASS · network | **ACCEPT** |
| Screens `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/` | **8** PNG on disk | **ACCEPT** (spot visual) |

---

## Independent spot-check (QC)

### EC1 — Mount must_keep (LeaveOverviewRecentPanel)

| Check | Result |
|-------|--------|
| Runtime | `ac.mount` · `rootChild=4` · `viteResolveFail=false` · `hasLeaveTitle=true` |
| Screen | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/02-leave-tab.png` — **Quản lý nghỉ phép** · tab **Nghỉ phép** · recent panel empty-day state OK |
| Console | `consoleErrors` / `pageErrors` empty in raw |

**PASS** — mount GWC **kept** · do not reopen without new whitescreen evidence

### EC2 — LV-03 no silent 201

| Check | Result |
|-------|--------|
| Runtime | `case_matrix.LV_03` · `feBlockedNoPost=true` · `silentCreate=false` · `postAfter=[]` · `toastOrValidation=true` · attach UI present (`fileInputCount=1`, doctor label, required hint) |
| Screen | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/05-lv03-after-submit.png` — toast **Lỗi**: «Nghỉ ốm từ 3 ngày trở lên cần đính kèm giấy bác sĩ…» · **No file chosen** · dialog still open |
| Network | No `POST …/leave-requests` after LV-03 submit |
| BE depth | Live `HRM-LEAVE-VAL-ATT` **not** exercised (FE blocks POST) — BE evidence jest catalog VAL-ATT **ACCEPT** as depth; mission allows FE block **and/or** VAL-ATT |

**PASS** — prior silent-201 FAIL **CLOSED** for browser AC

### EC3 — LV-04 attach + create + F5

| Check | Result |
|-------|--------|
| Upload | `POST /api/hrm/files/upload?feature=leave-attachment` → **201** `HRM-FILE-201` |
| Create | `POST /api/hrm/attendance/leave-requests` → **201** `HRM-LEAVE-201` id `639e8033-bdbe-4623-8677-7ee1d5b2b1ac` · attachment_url under /api/hrm/files/holding/leave-attachment-… (fixture doctor note) |
| Screen upload | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/06-lv04-after-upload.png` — file fixture doctor note · toast «Đã đính kèm giấy bác sĩ.» |
| Screen after submit | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/07-lv04-after-submit.png` — toast «Đã tạo đơn nghỉ phép» · totals **31** / pending **30** (was 30/29) |
| F5 runtime | `f5Ok=true` · `f5Sample.id` match · attachment_url retained · `status_label=Chờ duyệt` · employee `UAT NV 0020` |
| F5 screen | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/08-lv04-f5.png` — mount OK · calendar/overview (list tab not captured in PNG; **network/runtime is authoritative** for row persistence) |

**PASS** — LV-04 product AC met

### EC4 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-PO-E2E-SPINE-02-WEB-QA-W1-R1-20260803` |
| steps | **8** chronological · all `pass` (md expands HDSD rows; JSON machine steps aligned) |
| cases | mount · LV_03 · LV_04 · idle_guard |
| hdsd_align | **true** |
| u65_zero_seed | **true** |
| summary | failed=0 · click_count=36 · verdict=pass · ack PASS_TO_PM |
| attachments | 8 PNG + raw runtime — **exist on disk** |

**PASS**

### EC5 — U65 / U76

| Check | Result |
|-------|--------|
| Seed | Narrative + raw `u65=zero-seed` · no inbox/DB seed in steps | **PASS** |
| HDSD | Chấm công → Nghỉ phép → Tạo yêu cầu nghỉ · Đính kèm giấy bác sĩ · Gửi | **PASS** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs SPINE-02 WEB-QC-W1 | QC |
|---------|----------------------------|-----|
| **J-HRM-06** Chấm công → leave surface / list F5 | In-scope (mount + create path + F5 GET leave-requests) | **PASS** (browser R1 + runtime) |
| J-HRM-06b attendance sheet | Out of this WI | **not claimed** |
| Web approve / CC Duyệt | Out of this WI (`R-SPINE-WEB-APPROVE-UX-01`) | **CONDITION defer** |
| LV-02 leave ladder | Out of this WI (`R-SPINE-LV02-BA-01` / HOLD) | **CONDITION defer** |
| Mobile LV / other J-* | Out of this WI | **not claimed** |

Mandatory in-scope for this slice: leave mount + LV-03/04 + **J-HRM-06** surface/F5. No untested mandatory J-* claimed PASS for this gate.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | LV-03 no silent 201 (FE block) · LV-04 upload+201+`attachment_url`+F5 · mount GWC kept · J-HRM-06 surface PASS |
| **PROCESS** | QA narrative pack `verify:qc:evidence-pack` **FAIL 3/8** missing `command_table` + `journey_l25` heading shape + `crud_or_matrix` — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (portal `:5173` · HRM Vite · hrm-api `:28001` live in R1 window) |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote LV-03/04 close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this slice GO? |
|----|--------|-----|-------|------------------------|
| **R-SPINE-LV03-VAL-ATT-CATALOG** | **CLOSED** (browser FE gate + BE jest) | — | — | No — do not reopen without regression |
| **R-SPINE-LV04-ATTACH-FE-01** | **CLOSED** (browser LV-04) | — | — | No |
| **R-SPINE-WEB-APPROVE-UX-01** | **OPEN — CONDITION** | P1 | dev-fe | **No** (allowed per entry) |
| **R-SPINE-LV02-BA-01** / leave ladder T_L1 HOLD | **OPEN — CONDITION** | P1 | ba-process / `C-LEAVE-DEV-UNLOCK-01` | **No** (allowed; **cấm invent N**) |
| **R-LEAVE-TYPE-LABEL-DEPTH** | OPEN soft | P2 | defer | No |
| **R-QA-LEAVE-DATE-FILL-DEPTH** | OPEN soft | P2 | qa/dev-fe | No — harness end-date drift (`total_days=113`) still ≥3d; AC met |
| **C-SPINE-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — next QA MD add command_table + J-* matrix + residual heading |

---

## Conditions (explicit)

1. **R-SPINE-WEB-APPROVE-UX-01** — web approve UX / actionable Duyệt **out of this WI** — CONDITION defer (allowed).
2. **R-SPINE-LV02-BA-01** / leave ladder T_L1 HOLD (`C-LEAVE-DEV-UNLOCK-01`) — **no invent N**; CONDITION defer (allowed).
3. Live browser path for LV-03 used **FE block** (not live POST `HRM-LEAVE-VAL-ATT`); BE VAL-ATT catalog covered by jest — acceptable per mission; optional later probe may hit BE if FE gate bypassed.
4. **R-QA-LEAVE-DATE-FILL-DEPTH** P2 — harness ViDate drift — soft defer.
5. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this SPINE-02 LV-03/04 GWC alone.
6. Prior `po-e2e-spine-02-web-qa-w1.md` FAIL **superseded** for LV-03/04 — do not re-dispatch VAL-ATT/attach FE unless new regression evidence.
7. Do **not** reopen LeaveOverviewRecentPanel mount GWC without new whitescreen evidence.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md
→ FAIL exit 1 · 3/8 — command_table + journey_l25 + crud_or_matrix
```

**PROCESS GWC** — product LV-03/04 + mount independently verified; does not demote slice close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-02-web-qa-w1-r1.md` | **FAIL** exit **1** · **3/8** missing command_table + journey_l25 + crud_or_matrix (process) |
| `node -e` schema/chrono/allPass on `po-e2e-spine-02-web-qa-w1-r1-test-log.json` | **PASS** exit **0** · schema `xevn-test-log/v1` · steps=8 · allPass · cases mount/LV_03/LV_04/idle |
| Disk check 8 PNG under `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/` | **PASS** · all present (`01`…`08`) |
| Runtime cross-check `docs/qa/evidence/_tmp-po-e2e-spine-02-web-qa-w1-r1-browser.json` | **PASS** · click_log=36 · mount rootChild=4 · LV_03 silentCreate=false · LV_04 create201 + attachment_url + f5Ok |
| BE entry disk `po-e2e-spine-02-be-lv03-val-att-01.md` | **PASS** · READY_FOR_QA present |
| FE entry disk `r-spine-lv04-attach-fe-01.md` | **PASS** · READY_FOR_QA present |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md --check-assets` | **PASS** exit **0** (PNG paths resolve) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| Mount | `#root>0` · Nghỉ phép · LeaveOverviewRecentPanel · no Vite resolve fail | **PASS** | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/02-leave-tab.png` · runtime rootChild=4 |
| **LV-03** create fail_deep | ốm≥3 no attach · FE block and/or VAL-ATT · **no silent 201** | **PASS** | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/05-lv03-after-submit.png` · postAfter=[] |
| **LV-04** create success | upload 2xx · POST **201** + attachment_url · F5 persist | **PASS** | `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/06-lv04-after-upload.png` · `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/07-lv04-after-submit.png` · `docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/08-lv04-f5.png` · network 201 |
| Read (list F5) | GET leave-requests **200** · same id · attachment retained | **PASS** | runtime `f5Sample` · network GET 200 |
| **J-HRM-06** L2.5 | Attendance → leave surface / list F5 | **PASS** | R1 mount + create + F5 GET |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent leave ladder `N` / reopen LV-02 SPEC_GAP as product FAIL
- Did not NO-GO solely on allowed CONDITIONS (approve UX / LV-02 HOLD)
- Did not treat prior W1 FAIL as still open for LV-03/04 after R1 PASS
- Did not claim full SPINE-02 (approve / mobile / ladder) DONE

---

## completion_report

**Closed:** L3 QC gate `PO-E2E-SPINE-02-WEB-QC-W1` on SPINE-02 web **LV-03/04** after QA-W1-R1. Spot-check screens + raw Network + U78 test-log credible. Mount GWC **kept**. LV-03 **no silent 201** (FE block). LV-04 **201 + attachment_url + F5**. U65 zero-seed. Prior W1 FAIL superseded for in-scope AC. Residuals `R-SPINE-LV03-VAL-ATT-CATALOG` / `R-SPINE-LV04-ATTACH-FE-01` **CLOSED**.

**Residual / conditions:** `R-SPINE-WEB-APPROVE-UX-01` P1 CONDITION; `R-SPINE-LV02-BA-01` / ladder HOLD CONDITION; P2 date-fill/label; QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-02-WEB-PM-CLOSE
role: pm
priority: P1
entry_criteria:
  - docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - LV-03 no silent 201 CLOSED · LV-04 attach+201+attachment_url+F5 CLOSED · mount GWC kept
  - Conditions OK (not blockers): R-SPINE-WEB-APPROVE-UX-01 · R-SPINE-LV02-BA-01 / C-LEAVE-DEV-UNLOCK-01 HOLD
  - prior po-e2e-spine-02-web-qa-w1.md FAIL superseded for LV-03/04
action:
  1) Bus INTAKE PO-E2E-SPINE-02-WEB-QC-W1 PASS_TO_PM + promote SPINE-02 web LV-03/04 CLOSED on backlog / TEAM_WORKING_NOW
  2) Continue next open PO-E2E / SPINE backlog item — do not idle
  3) Keep R-SPINE-WEB-APPROVE-UX-01 as separate WI when approve UX enters scope (no seed to invent inbox)
  4) Keep LV-02 ladder under BA/HOLD — cấm invent N / 🟢 LV-02 on ASSUMPTION
  5) Do NOT claim product UAT DONE / Phase 1 DONE from this LV-03/04 GWC
  6) Do NOT reopen LeaveOverviewRecentPanel mount without new whitescreen defect
cấm: seed · invent UAT/Phase1 DONE · invent leave ladder N · reopen LV-03/04 CLOSED without regression
```

---

## pm_dispatch_hint

`PO-E2E-SPINE-02-WEB-PM-CLOSE` — promote web LV-03/04 GWC; carry approve UX + LV-02 HOLD as conditions; next SPINE backlog; no UAT/Phase1 DONE claim; no mount reopen.
