# Evidence — PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-29 · UC-BP-ATT-11) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT11QA1-MSLXD7ZD` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** (FE white-screen · Vite transform 500 · J-01..06 **BLOCKED**) |
| **uc_ids** | `UC-BP-ATT-11` · `FR-UC-BP-ATT-11` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · DENY second ledger · ≠ FIXED_GĐ1=full R-SIGN-01 DONE · Nest `/core` DENY · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-01 READY · API-01 RETAIN · BA J-* · `ATT10QC1-MSLWGUYH` · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Dev-BE HOLD invent |
| **env** | portal `:5173` + HRM `:8080` · hrm-api `:28001` · xbos `:28002` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-11-cluster-qa-01.mjs` · debug `scripts/qa/_tmp-att-11-debug-nav.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-11-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-11-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **FAIL** · `FAIL_TO_PM` · residual **FE** · **DENY** claim LIVE=ATT-11 DONE · **DENY** AGG=ATT-10 DONE · **DENY** soft/ATT-08=ATT-09 DONE · **DENY** ATT module UAT · **DENY** CFG=ATT-02 DONE · **DENY** invent PAY/printable/HOL/MEAL/`lines[]`/CSUM/INBOX DONE · **DENY** invent `att_leave_hold` · **DENY** seed · **DENY** honesty flip · **DENY** FIXED_GĐ1=full R-SIGN-01 DONE |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/attendance/attendance-sheets` **404** (SoT DENY OK) |
| **L2 / L2.5 J-*** | **J-01..06 BLOCKED** — HRM embed blank white screen (Vite **500** on `hrmApi.ts`) |
| **Nest `/core` sign SoT** | probe **404** · browser Network SoT non-404 **= 0** (page never mounted) |
| **Seed** | **none** (U65) |

**Explicit ≠ ATT-11 module UAT** · printable **false** · **C-SLICE** · **PAY OUT**.

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md` J-HRM-ATT-11-01..06 · AC-ATT-11-* · O1–O12 |
| API-01 | F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03 · Nest `/core` DENY |
| FE-01 | `docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-01.md` READY_FOR_QA |
| ATT-10 QC | **`ATT10QC1-MSLWGUYH`** RETAIN · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD |
| ATT-09 QC | **`ATT09QC1-MSLUTL9D`** RETAIN · DENY `att_leave_hold` |
| ATT-08 QC | **`ATT08QC1-MSLSL36C`** RETAIN |
| ATT-02 QC | **`ATT02QC1-MSLQZUK7`** RETAIN · CFG≠ATT-02 DONE |
| PLT-01 QC | **`PLT01QC1-MSLPUQIU`** RETAIN |
| CORE-10 QC | **`CORE10QC1-MSLP0EJB`** RETAIN |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** RETAIN |
| soft≠CORE-06 | must_keep |
| PAY | **OUT invent DONE** |

---

## Browser U65 — journeys (U63 template)

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → expected Chấm công → Bảng công.  
**Prerequisite sheet (API read-only, zero-seed):** `QA-ATT-10-CLUSTER-01` `2d1a688e-0449-4237-a2df-2b2f1707f138` status **`submitted`** · GET signatures **200** `HRM-ATT-SIGN-200` · `steps=[]` · `can_close=false` · Nest `/core` **404**.

**hdsd_align (planned):** `att-sign-panel` · `att-11-sign-display` · `att-sign-confirm-*` · `att-sign-reject-*` · `att-sign-close-sheet` · `att-sheet-reopen` · `att-11-honesty` — **NOT reachable**.

### UF / J-HRM-ATT-11-01 — Submitted → GET signatures

- Persona / URL / click path: `ceo@xe.vn` → `/hr/attendance` (5173 **and** 8080)
- Trước mutate: API sheet `submitted` available (probe OK)
- Action: open HRM attendance embed
- Network (browser): **`GET /hr/src/integrations/hrmApi.ts` → 500** · page `#root` empty · **no** `GET …/attendance-sheets/*/signatures` from UI
- **FE sau load:** blank white · no `att-sign-panel` · no `att-11-sign-display`
- F5: still blank
- Verdict: **🔴 FAIL / BLOCKED**
- spec_ref: AC-ATT-11-LOAD/GET-SIGN/PREREQ/DISP/PATH/≠-LIVE-DONE
- defect: **P0-FE-VITE-COMMENT** (see § Root cause)

### UF / J-HRM-ATT-11-02 — NV+QL+HR → close → F5 closed

- Verdict: **🔴 BLOCKED** (white screen — cannot click `att-sign-confirm-*` / `att-sign-close-sheet`)
- spec_ref: AC-ATT-11-SIGN/LADDER/CLOSE/F5/PAY-OUT

### UF / J-HRM-ATT-11-03 — Reject → 409 INCOMPLETE

- Verdict: **🔴 BLOCKED**
- spec_ref: AC-ATT-11-REJECT/FAIL-REJECT/INCOMPLETE

### UF / J-HRM-ATT-11-04 — Incomplete no-bypass

- Verdict: **🔴 BLOCKED**
- API force-close probe deferred until FE mounts (API sheet ready; UI gate not executable)
- spec_ref: AC-ATT-11-NO-BYPASS/INCOMPLETE/LADDER

### UF / J-HRM-ATT-11-05 — Reopen + archive

- Verdict: **🔴 BLOCKED**
- spec_ref: AC-ATT-11-REOPEN

### UF / J-HRM-ATT-11-06 — F5 + honesty seals

- Verdict: **🔴 BLOCKED** — `att-11-honesty` not rendered
- Honesty policy (QA seat): flags remain **false** · **≠** ATT-11 DONE · printable false · C-SLICE · PAY OUT · must_keep seals cited above
- spec_ref: AC-ATT-11-F5/≠-*/H/MK-*/CSUM-OUT/INBOX-OUT/WF-FOOTER

Screens: `00-debug.png` (blank) · runner aborted before journey shots.

---

## Root cause (P0 FE)

| Field | Detail |
|-------|--------|
| **id** | `P0-ATT11-FE-VITE-COMMENT-TERMINATOR` |
| **owner** | **dev-fe** |
| **symptom** | Vite transform **500** · console: `Unexpected character '·'` · blank `#root` on `/hr/attendance` (5173 + 8080) |
| **file** | `apps/web/hrm/src/integrations/hrmApi.ts` ~L6861–6868 (`@CODE-MEMORY-CHANGE` ATT-11 FE-01) |
| **mechanism** | Block comment text contains `attendance-sheets*/signatures` — the substring **`*/`** **terminates** the JS block comment early; trailing `· Nest /core…` is parsed as code → transform FAIL |
| **introduced_by** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01` CODE-MEMORY APPEND |
| **fix_hint** | Escape comment: write `attendance-sheets*\/signatures` **or** rephrase without `*/` (e.g. `attendance-sheets/{id}/signatures\|close\|reopen`) — then retest QA-01 |
| **not** | Nest `/core` SoT · seed · BE invent · API signatures (API GET **200** on same sheet) |

---

## Network / L0 summary

| Metric | Value |
|--------|--------|
| L0 hrm/xbos/portal | **200 / 200 / 200** |
| Nest `/core/attendance/attendance-sheets` | **404** (DENY OK) |
| API GET `…/attendance-sheets/{id}/signatures` (read-only probe) | **200** `HRM-ATT-SIGN-200` · sheet `2d1a688e-…` |
| Browser `GET …/signatures\|close\|reopen` | **0** (UI never mounted) |
| Browser Nest `/core` sign SoT non-404 | **0** |
| Seed | **none** |

---

## Residuals / defects

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **P0-ATT11-FE-VITE-COMMENT-TERMINATOR** | **P0** | **dev-fe** | Fix CODE-MEMORY `*/` in `hrmApi.ts` · restore Vite load · unlock J-01..06 |
| **J-HRM-ATT-11-01..06** | **P0** | **qa** (retest) | BLOCKED until FE fix · re-run U65 browser |
| **R-ATT-11-WF** | P2 | qc (after PASS) | FIXED_GĐ1 interim · ≠ full R-SIGN-01 DONE |
| **R-ATT-11-CSUM / INBOX** | INFO | — | OUT GĐ1 |
| **R-ATT-11-EMIT** | INFO | qc | response-only `timesheet.closed` · ≠ invent PAY |
| **R-ATT-10-DISP** | P2 HOLD | — | peer · HOL/MEAL OUT · ≠ invent lines[] DONE |
| **R-ATT-11-HONESTY** | INFO | qc | C-SLICE · ≠ ATT-11 module UAT · printable false · PAY OUT |

**Ops:** U65 zero-seed · no honesty flip · no claim module UAT · no claim LIVE=ATT-11 DONE · no claim AGG=ATT-10 DONE.

---

## Honesty footer

```text
attendance_uat_ready=false
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
C-SLICE-≠-MODULE
≠ LIVE alone = ATT-11 DONE
≠ AGG = ATT-10 DONE (ATT10QC1-MSLWGUYH)
≠ soft/ATT-08 = ATT-09 DONE (ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C)
CFG≠ATT-02 DONE (ATT02QC1-MSLQZUK7)
PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
soft≠CORE-06 DONE
PAY OUT · DENY att_leave_hold · DENY second ledger · Nest /core DENY
≠ FIXED_GĐ1 = full R-SIGN-01 DONE · CSUM/INBOX OUT · HOL/MEAL/lines[] OUT
seed_used=false
```

---

## completion_report

**Closed:** QA-01 attempted U65 browser J-HRM-ATT-11-01..06 on `ceo@xe.vn` / `main` against FE-01 READY handoff. L0 PASS (hrm+xbos+portal 200; Nest `/core` ATT **404**). API prerequisite sheet `QA-ATT-10-CLUSTER-01` `submitted` + GET signatures **200** confirmed (read-only, zero-seed). Browser journey **FAIL**: Vite **500** on `apps/web/hrm/src/integrations/hrmApi.ts` because ATT-11 FE-01 `@CODE-MEMORY-CHANGE` contains `attendance-sheets*/signatures` which closes the block comment early (`*/`) → blank `#root` on `:5173` and `:8080` → **all J-01..06 BLOCKED**. No seed. Honesty flags not flipped. Explicit **≠ ATT-11 module UAT** · printable false · C-SLICE · PAY OUT · must_keep ATT10/09/08/02/PLT/CORE seals.

**Residual open:** **P0 FE** fix comment terminator → **QA retest** J-01..06 (same runner). Dev-BE HOLD invent RETAIN.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **next_owner** | `dev-fe` |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-01.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-02
role: dev-fe
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-29)
entry_criteria: QA-01 FAIL_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-01.md · stamp ATT11QA1-MSLXD7ZD · P0-ATT11-FE-VITE-COMMENT-TERMINATOR
defect: apps/web/hrm/src/integrations/hrmApi.ts ~L6867 CODE-MEMORY text "attendance-sheets*/signatures" prematurely closes block comment (*/); Vite 500 → blank /hr/attendance
exit_criteria:
  - Fix comment without */ terminator (e.g. attendance-sheets/{id}/signatures|close|reopen or escape *\/)
  - Vite loads hrmApi.ts 200 · /hr/attendance mounts att-sign-panel (ceo@ · companyId=main)
  - No Nest /core invent · no seed · no honesty flip · ≠ LIVE=ATT-11 DONE · must_keep ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · printable false · PAY OUT · DENY att_leave_hold
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-02.md
  - ack_status READY_FOR_QA → re-dispatch PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-01 (same J-01..06 runner)
cấm: invent CSUM/INBOX/PAY/second ledger · claim ATT UAT · wipe ATT-10/09/08 seals
```

---

*End QA-01 · FAIL_TO_PM · 2026-08-09*
