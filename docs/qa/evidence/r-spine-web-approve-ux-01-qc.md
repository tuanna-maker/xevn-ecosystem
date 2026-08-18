# Evidence — R-SPINE-WEB-APPROVE-UX-01-QC

| Field | Value |
|-------|--------|
| **work_item_id** | `R-SPINE-WEB-APPROVE-UX-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-03 |
| **lane** | L3 gate — Path A leave-list Duyệt + Path B CC inbox `hrm_leave` Duyệt (not full product UAT) |
| **priority** | P1 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` · Path B `http://127.0.0.1:5173/command-center/inbox` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | `r-spine-web-approve-ux-01-qa.md` PASS_TO_PM · test-log md+json · FE READY `r-spine-web-approve-ux-01.md` · prior GWC `po-e2e-spine-02-web-qc-w1.md` |
| **spec_ref** | FR-UC-H03 · UF-XBOS-08 · J-HRM-06 · HDSD Chấm công → Nghỉ phép / CC Việc cần xử lý |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed |
| **NOT claimed** | product UAT DONE · Phase 1 DONE · PROD-READY · LV-02 ladder · invent L2 / T_L1 |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded web approve UX after QA browser PASS. Independent QC audit confirms:

1. **Path A** — leave **Danh sách** exposes HDSD **Duyệt** on pending rows → `POST …/leave-requests/:id/approve` **201** `HRM-LEAVE-203` · `status=approved` / `status_label=Đã duyệt` → **F5** retains **Đã duyệt** (LV-04 row id `639e8033-…`).
2. **Path B** — CC inbox leave cards show actionable **Duyệt** (`hdsd-cc-leave-approve` / aria Duyệt; non-leave keeps **Xử lý nhanh**) → `POST …/workflow-engine/tasks/:id/complete` **201** `XBOS-WF-200` → toast hoàn thành · leave approve CTA count **28→27** after F5.
3. **must_keep** — LeaveOverviewRecentPanel mount **kept** (`#root=4`, `viteResolveFail=false`); LV-03/04 attach GWC **not reopened**.
4. **U65** zero-seed · **U76** HDSD inventory · **U78** `xevn-test-log/v1` md+json credible.
5. Prior SPINE-02 web GWC condition **`R-SPINE-WEB-APPROVE-UX-01` → CLOSED**.

**Allowed CONDITIONS (not blockers for this slice):** `R-SPINE-LV02-BA-01` / leave ladder T_L1 HOLD (`C-LEAVE-DEV-UNLOCK-01`) — **do not invent L2**. QA pack process gap (missing `command_table`) P3. **NOT** Phase 1 / product UAT DONE from this approve-UX GWC alone.

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/qa/evidence/po-e2e-spine-02-web-qc-w1.md` | GWC · condition `R-SPINE-WEB-APPROVE-UX-01` OPEN | **ACCEPT** — this WI closes that condition |
| `docs/qa/evidence/r-spine-web-approve-ux-01.md` | READY_FOR_QA · list + CC Duyệt FE | **ACCEPT** |
| `docs/qa/evidence/r-spine-web-approve-ux-01-qa.md` | PASS_TO_PM · Path A+B | **ACCEPT** (product) |
| `…-qa-test-log.md` | chrono 8 steps · verdict pass | **ACCEPT** (U78) |
| `…-qa-test-log.json` | `schema: xevn-test-log/v1` · 8 steps · all pass | **ACCEPT** (U78 / OS 31) |
| `docs/qa/evidence/_tmp-r-spine-web-approve-ux-01-qa-browser.json` | click_log **23** · Path A/B NET 201 · mount | **ACCEPT** |
| Screens `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/` | **8** PNG on disk | **ACCEPT** (spot visual) |

---

## Independent spot-check (QC)

### EC1 — Mount must_keep (LeaveOverviewRecentPanel)

| Check | Result |
|-------|--------|
| Runtime | `ASSERT_MOUNT` · `rootChild=4` · `viteResolveFail=false` · `hasLeaveTitle=true` |
| Screen | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/02-leave-tab.png` — **Quản lý nghỉ phép** · tab **Nghỉ phép** · four overview cards · calendar + day panel (path verified) |
| LV-03/04 reopen | No attach-create / VAL-ATT steps in harness — **not touched** |

**PASS** — mount GWC **kept** · LV-03/04 attach GWC **kept**

### EC2 — Path A leave-list Duyệt + F5

| Check | Result |
|-------|--------|
| Pre | `PATH_A_APPROVE_PROBE` · `byTestId=30` · `byRole=30` |
| Screen list | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/06-path-a-list.png` — **Danh sách yêu cầu** · pending rows show green **Duyệt** (+ Từ chối); LV-04 / LV-03 reasons visible |
| Network | `POST /api/hrm/attendance/leave-requests/639e8033-bdbe-4623-8677-7ee1d5b2b1ac/approve` → **201** `HRM-LEAVE-203` · `approveOk=true` |
| Screen after | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/07-path-a-after-approve.png` — LV-04 row **Đã duyệt**; pending cards **30→29**; approved **1→2** |
| F5 | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/08-path-a-f5.png` — same LV-04 **Đã duyệt** retained · mount OK · GET leave-requests **200** (test-log) |

**PASS** — Path A product AC met

### EC3 — Path B CC inbox hrm_leave Duyệt + F5

| Check | Result |
|-------|--------|
| Probe | `leaveCards=28` · `leaveApproveCount=28` · `hasDuyet=true` · `hasXuLyNhanh=true` (non-leave) |
| Screen inbox | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/09-path-b-inbox.png` — leave cards **Duyệt**; business cards **Xử lý nhanh** (label split OK) |
| Network | `POST /api/xbos/workflow-engine/tasks/669909c4-b24d-47fb-bd93-8e37dd18eaa9/complete` → **201** `XBOS-WF-200` · `completeOk=true` |
| Screen after | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/10-path-b-after-approve.png` — toast **Đã hoàn thành: Phê duyệt đơn nghỉ phép HRM** · remaining leave **Duyệt** still present |
| F5 / count | test-log + runtime `afterLeaveApprove=27` · `PATH_B_DONE` PASS |

**PASS** — Path B / UF-XBOS-08 leave-specific Duyệt met

### EC4 — World-standard test log (U78 / OS 31)

| Field | JSON / MD |
|-------|-----------|
| schema | `xevn-test-log/v1` |
| log_id | `TEL-R-SPINE-WEB-APPROVE-UX-01-QA-20260803` |
| steps | **8** chronological · all `pass` |
| cases | B_success Path A+B · C Duyệt labels · A LV-03 spot skipped (must_keep) |
| hdsd_align | **true** |
| u65_zero_seed | **true** |
| summary | failed=0 · click_count=23 · idle_guard PASS · verdict=pass · ack PASS_TO_PM |
| attachments | 8 PNG + raw runtime — **exist on disk** |

**PASS**

### EC5 — U65 / U76

| Check | Result |
|-------|--------|
| Seed | Narrative + raw `u65=zero-seed` · no inbox/DB seed; FE-origin pending used | **PASS** |
| HDSD | Chấm công → Nghỉ phép → Danh sách → Duyệt · CC Việc cần xử lý → Duyệt leave | **PASS** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs R-SPINE-WEB-APPROVE-UX-01-QC | QC |
|---------|--------------------------------------|-----|
| **J-HRM-06** leave list surface + approve CTA + F5 | In-scope | **PASS** (browser + runtime + screens) |
| **UF-XBOS-08** inbox complete leave Duyệt | In-scope (leave-specific label) | **PASS** |
| LV-02 leave ladder / invent N | Out of this WI (`R-SPINE-LV02-BA-01` HOLD) | **CONDITION defer** — **cấm invent** |
| Mobile ManagerApprovals / other J-* | Out of this WI | **not claimed** |

Mandatory in-scope for this slice: Path A + Path B + mount must_keep + **J-HRM-06** / UF-XBOS-08 leave Duyệt. No untested mandatory J-* claimed PASS for this gate.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Path A approve **201** + F5 **Đã duyệt** · Path B complete **201** + Duyệt label + count down · mount kept · LV-03/04 not reopened · J-HRM-06 / UF-XBOS-08 PASS |
| **PROCESS** | QA narrative pack `verify:qc:evidence-pack` **FAIL 1/8** missing `command_table` only — **process-only**; product PASS independent; this QC pack targets **8/8** |
| **ENV** | None driving verdict (portal `:5173` · hrm-api `:28001` · xbos-api `:28002` live in QA window) |

ENV does not drive verdict. Process pack gap on QA MD does **not** demote Path A/B close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this slice GO? |
|----|--------|-----|-------|------------------------|
| **R-SPINE-WEB-APPROVE-UX-01** | **CLOSED** (Path A+B browser + Network 201 + F5) | — | — | No — do not reopen without regression |
| **R-SPINE-LV02-BA-01** / leave ladder T_L1 HOLD | **OPEN — CONDITION** | P1 | ba-process / `C-LEAVE-DEV-UNLOCK-01` | **No** (allowed; **cấm invent N**) |
| LV-03/04 attach + mount GWC | **CLOSED (kept)** | — | — | No — do not reopen without new evidence |
| **C-SPINE-QA-PACK-FMT-01** | OPEN process (carry) | P3 | qa | No — next QA MD add `command_table` |

---

## Conditions (explicit)

1. **R-SPINE-WEB-APPROVE-UX-01 CLOSED** — promote on bus / backlog; supersede OPEN condition from `po-e2e-spine-02-web-qc-w1.md`.
2. **R-SPINE-LV02-BA-01** / leave ladder T_L1 HOLD (`C-LEAVE-DEV-UNLOCK-01`) — **no invent N**; CONDITION defer (allowed; separate from this WI).
3. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this approve-UX GWC alone.
4. Do **not** reopen LeaveOverviewRecentPanel mount or LV-03/04 attach GWC without new defect evidence.
5. QA pack missing `command_table` = process P3 — does not demote product close.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-web-approve-ux-01-qa.md
→ FAIL exit 1 · 1/8 — command_table only
```

**PROCESS GWC** — product Path A/B independently verified; does not demote slice close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-web-approve-ux-01-qc.md
→ target EXIT 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-web-approve-ux-01-qc.md --check-assets
→ target EXIT 0
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-web-approve-ux-01-qa.md` | **FAIL** exit **1** · **1/8** missing command_table (process) |
| `node -e` schema/chrono/allPass on `r-spine-web-approve-ux-01-qa-test-log.json` | **PASS** exit **0** · schema `xevn-test-log/v1` · steps=8 · allPass · hdsd_align · u65 · clicks=23 |
| Disk check 8 PNG under `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/` | **PASS** · `01`,`02`,`06`–`11` present |
| Runtime cross-check `docs/qa/evidence/_tmp-r-spine-web-approve-ux-01-qa-browser.json` | **PASS** · click_log=23 · mount rootChild=4 · Path A 201 HRM-LEAVE-203 · Path B 201 XBOS-WF-200 |
| FE entry disk `r-spine-web-approve-ux-01.md` | **PASS** · READY_FOR_QA present |
| Prior GWC disk `po-e2e-spine-02-web-qc-w1.md` | **PASS** · condition R-SPINE-WEB-APPROVE-UX-01 was OPEN |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-web-approve-ux-01-qc.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-spine-web-approve-ux-01-qc.md --check-assets` | **PASS** exit **0** (PNG paths resolve) |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| Mount | `#root>0` · Nghỉ phép · LeaveOverviewRecentPanel · no Vite resolve fail | **PASS** | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/02-leave-tab.png` · runtime rootChild=4 |
| Path A create/update (approve) | List **Duyệt** → POST approve **201** · FE **Đã duyệt** | **PASS** | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/06-path-a-list.png` · `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/07-path-a-after-approve.png` · HRM-LEAVE-203 |
| Path A read F5 | After reload LV-04 still **Đã duyệt** · GET 200 | **PASS** | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/08-path-a-f5.png` |
| Path B update (complete) | CC leave **Duyệt** → POST complete **201** · toast + count down | **PASS** | `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/09-path-b-inbox.png` · `docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa/10-path-b-after-approve.png` · XBOS-WF-200 |
| Path B F5 | leave approve CTAs 28→27 · mount OK | **PASS** | test-log seq 8 · runtime PATH_B_DONE |
| **J-HRM-06** L2.5 | Attendance → leave list → Duyệt → F5 | **PASS** | Path A chain |
| **UF-XBOS-08** | Inbox leave Duyệt (not Xử lý nhanh) | **PASS** | Path B screens + network |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent leave ladder `N` / reopen LV-02 HOLD as product FAIL
- Did not demote Path A/B solely on QA pack missing `command_table`
- Did not reopen LV-03/04 attach or LeaveOverviewRecentPanel mount GWC
- Did not claim full SPINE-02 / mobile / ladder DONE

---

## completion_report

**Closed:** L3 QC gate `R-SPINE-WEB-APPROVE-UX-01-QC` on Path A leave-list Duyệt + Path B CC `hrm_leave` Duyệt. Spot-check screens + raw Network + U78 test-log credible. Mount + LV-03/04 must_keep **kept**. Prior GWC condition **`R-SPINE-WEB-APPROVE-UX-01` CLOSED**.

**Residual / conditions:** `R-SPINE-LV02-BA-01` / ladder HOLD CONDITION (separate); QA pack format P3 process; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/r-spine-web-approve-ux-01-qc.md`

---

## next_dispatch_prompt

```text
work_item_id: R-SPINE-WEB-APPROVE-UX-01-PM-CLOSE
role: pm
priority: P1
entry_criteria:
  - docs/qa/evidence/r-spine-web-approve-ux-01-qc.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - Path A leave-list Duyệt 201 HRM-LEAVE-203 + F5 CLOSED · Path B CC hrm_leave Duyệt 201 XBOS-WF-200 + F5 CLOSED
  - Promote R-SPINE-WEB-APPROVE-UX-01 CLOSED (closes prior po-e2e-spine-02-web-qc-w1 CONDITION)
  - must_keep LV-03/04 attach GWC + LeaveOverviewRecentPanel mount kept (do not reopen)
  - Condition OK (not blocker): R-SPINE-LV02-BA-01 / C-LEAVE-DEV-UNLOCK-01 HOLD — cấm invent L2 ladder
action:
  1) Bus INTAKE R-SPINE-WEB-APPROVE-UX-01-QC PASS_TO_PM + promote R-SPINE-WEB-APPROVE-UX-01 CLOSED on backlog / TEAM_WORKING_NOW / prior SPINE-02 GWC residual
  2) Continue next open PO-E2E / SPINE backlog item — do not idle
  3) Keep LV-02 ladder under BA/HOLD — cấm invent N / 🟢 LV-02 on ASSUMPTION
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this approve-UX GWC
  5) Do NOT reopen LeaveOverviewRecentPanel mount or LV-03/04 attach without new regression evidence
cấm: seed · invent UAT/Phase1 DONE · invent leave ladder N · reopen CLOSED approve UX / LV-03/04 / mount without regression
```

---

## pm_dispatch_hint

`R-SPINE-WEB-APPROVE-UX-01-PM-CLOSE` — promote approve UX CLOSED; keep LV-02 HOLD; next SPINE backlog; no UAT/Phase1 DONE claim; no mount/LV-03/04 reopen.
