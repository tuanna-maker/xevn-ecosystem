# Evidence — PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-29 · UC-BP-ATT-11) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `ATT11QA2-MSLXOKS3` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (J-01..06 PASS · Vite blank P0 **CLOSED**) |
| **uc_ids** | `UC-BP-ATT-11` · `FR-UC-BP-ATT-11` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `attendance_uat_ready=false` · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · PAY OUT · DENY invent `att_leave_hold` · DENY second ledger · ≠ FIXED_GĐ1=full R-SIGN-01 DONE · Nest `/core` DENY · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | FE-02 READY (`po-hrm-mvp-gd1-att-11-cluster-fe-02.md`) · QA-01 FAIL `ATT11QA1-MSLXD7ZD` closed · API-01 RETAIN · BA J-* · `ATT10QC1-MSLWGUYH` · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Dev-BE HOLD invent |
| **env** | portal `:5173` · HRM embed via portal `/hr` · hrm-api `:28001` · xbos `:28002` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-11-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-11-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-11-cluster-qa-02/` (11 shots) |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · residual INFO/P2 for QC GWC · **DENY** claim LIVE=ATT-11 DONE · **DENY** AGG=ATT-10 DONE · **DENY** soft/ATT-08=ATT-09 DONE · **DENY** ATT module UAT · **DENY** CFG=ATT-02 DONE · **DENY** invent PAY/printable/HOL/MEAL/`lines[]`/CSUM/INBOX DONE · **DENY** invent `att_leave_hold` · **DENY** seed · **DENY** honesty flip · **DENY** FIXED_GĐ1=full R-SIGN-01 DONE |
| **L0** | hrm **200** · xbos **200** · portal `:5173` **200** · Nest `/core/attendance/attendance-sheets` **404** (SoT DENY OK) |
| **Vite / FE mount** | `GET /hr/src/integrations/hrmApi.ts` → **200** (prior QA-01 was **500**) · `#root` mounts · `att-sign-panel` visible · **no** blank white recur |
| **L2.5 J-*** | **J-01 PASS** · **J-02 PASS** · **J-03 PASS** · **J-04 PASS** · **J-05 PASS** · **J-06 PASS** |
| **Nest `/core` sign SoT** | probe **404** · browser Network non-404 SoT **= 0** |
| **Seed** | **none** (U65) |

**Explicit ≠ ATT-11 module UAT** · printable **false** · **C-SLICE** · **PAY OUT**.

---

## Spec / seal cite

| Artifact | Cite |
|----------|------|
| BA-01 | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md` J-HRM-ATT-11-01..06 · AC-ATT-11-* · O1–O12 |
| API-01 | F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03 · Nest `/core` DENY |
| FE-02 | `docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-02.md` READY_FOR_QA · P0 Vite comment fix |
| QA-01 prior | `ATT11QA1-MSLXD7ZD` FAIL · blank Vite 500 · **CLOSED** by FE-02 |
| ATT-10 QC | **`ATT10QC1-MSLWGUYH`** RETAIN · ≠ AGG=ATT-10 DONE · R-ATT-10-DISP P2 HOLD |
| ATT-09 QC | **`ATT09QC1-MSLUTL9D`** RETAIN · DENY `att_leave_hold` |
| ATT-08 QC | **`ATT08QC1-MSLSL36C`** RETAIN |
| ATT-02 QC | **`ATT02QC1-MSLQZUK7`** RETAIN · CFG≠ATT-02 DONE |
| PLT-01 QC | **`PLT01QC1-MSLPUQIU`** RETAIN (QA seat cite · banner text optional OBS) |
| CORE-10 QC | **`CORE10QC1-MSLP0EJB`** RETAIN |
| CORE-09 QC | **`CORE09QC1-MSLNBA89`** printable false RETAIN |
| CORE-07 QC | **`CORE07QC1-KZJTSHNT`** RETAIN |
| soft≠CORE-06 | must_keep |
| PAY | **OUT invent DONE** |

---

## Browser U65 — journeys (U63 template)

Persona: portal auth inject · `/hr/attendance?portal=1&companyId=main` → Chấm công → Bảng công.  
**Sheet (zero-seed, ATT-10 peer):** `QA-ATT-10-CLUSTER-01` `2d1a688e-0449-4237-a2df-2b2f1707f138` started **`submitted`**.

**hdsd_align:** `att-sign-panel` · `att-11-sign-display` · `att-sign-confirm-*` · `att-sign-reject-*` · `att-sign-close-sheet` · `att-sheet-reopen` · `att-11-honesty` — **reachable**.

### UF / J-HRM-ATT-11-01 — Submitted → GET signatures

- Persona / URL / click path: `ceo@xe.vn` → `/hr/attendance` → menu Bảng công → row `QA-ATT-10-CLUSTER-01`
- Trước mutate: sheet `submitted` · signatures steps empty · `can_close=false`
- Action: open detail → Sign panel mounts
- Network: **`GET /api/hrm/attendance/attendance-sheets/{id}/signatures?company_id=main` → 200** (physical path; Nest `/core` **0**)
- **FE sau load:** `att-sign-panel` + `att-11-sign-display` · header_id · statusLabel · can_close=false · FIXED_GĐ1 footer · honesty ≠ LIVE=ATT-11 DONE
- F5: panel persists (subsequent journeys)
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-11-LOAD/GET-SIGN/PREREQ/DISP/PATH/≠-LIVE-DONE

### UF / J-HRM-ATT-11-02 — NV+QL+HR → close → F5 closed

- Action: `att-sign-confirm-employee` → `direct_manager` → `hr_admin` → `att-sign-close-sheet`
- Network: **3× POST …/signatures → 201** · **POST …/close → 201** · body event `timesheet.closed` (response-only)
- **FE sau 2xx:** can_close=true before close · after F5 status **`closed`** · reopen control visible
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-11-SIGN/LADDER/CLOSE/F5/PAY-OUT · ≠ invent PAY DONE

### UF / J-HRM-ATT-11-03 — Reject → 409 INCOMPLETE

- Prerequisite: after J-05 reopen → `submitted` again
- Action: `att-sign-reject-employee` + comment → attempt close
- Network: **POST …/signatures (rejected) 2xx** · force **POST …/close → 409 `HRM-ATT-SIGN-INCOMPLETE`**
- **FE:** can_close=false · close disabled · reject UI visible
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-11-REJECT/FAIL-REJECT/INCOMPLETE

### UF / J-HRM-ATT-11-04 — Incomplete no-bypass

- Action (before ladder): Chốt disabled · API force close
- Network: **POST …/close → 409 `HRM-ATT-SIGN-INCOMPLETE`**
- **FE:** closeDisabled=true · can_close=false · no silent closed
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-11-NO-BYPASS/INCOMPLETE/LADDER

### UF / J-HRM-ATT-11-05 — Reopen + archive

- Action: closed sheet → `att-sheet-reopen`
- Network: **POST …/reopen → 201**
- **FE + F5:** status **`submitted`** · prior approved steps cleared/archived (`can_close=false` · missing roles back)
- Verdict: **🟢 PASS**
- spec_ref: AC-ATT-11-REOPEN · ≠ invent PAY adjustment DONE

### UF / J-HRM-ATT-11-06 — F5 + honesty seals

- Action: assert `att-11-honesty` + FIXED_GĐ1 / CSUM-INBOX OUT footers
- Network: Nest `/core` sign SoT non-404 **= 0** · seed=false
- Honesty sample (excerpt): C-SLICE · ≠ LIVE alone = ATT-11 DONE · ≠ AGG = ATT-10 DONE (`ATT10QC1-MSLWGUYH`) · ≠ soft/ATT-08=ATT-09 · CFG≠ATT-02 (`ATT02QC1-MSLQZUK7`) · `ATT09QC1-MSLUTL9D` · DENY `att_leave_hold` · `ATT08QC1-MSLSL36C` · Nest `/core` DENY · printable false · PAY OUT · FIXED_GĐ1 ≠ full R-SIGN-01 · CSUM/INBOX OUT
- Verdict: **🟢 PASS** (OBS: banner text does not literally embed `PLT01QC1`/`CORE*` stamp IDs — QA seat cites must_keep RETAIN)
- spec_ref: AC-ATT-11-F5/≠-*/H/MK-*/CSUM-OUT/INBOX-OUT/WF-FOOTER

Screens: `01-sheets-list` … `11-j06-honesty` under `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-11-cluster-qa-02/`.

---

## Network / L0 summary

| Metric | Value |
|--------|--------|
| L0 hrm/xbos/portal | **200 / 200 / 200** |
| Vite `hrmApi.ts` | **200** (P0 Vite terminator **CLOSED**) |
| Nest `/core/attendance/attendance-sheets` | **404** (DENY OK) |
| Browser GET `…/attendance-sheets/{id}/signatures` | **11×** physical `/api/hrm/attendance/…` **200** |
| Browser POST `…/signatures` | **4×** (**201** ladder + reject) |
| Browser POST `…/close` | **1× 201** (happy) + force probes **409 INCOMPLETE** |
| Browser POST `…/reopen` | **1× 201** |
| Browser Nest `/core` sign SoT non-404 | **0** |
| pageErrors / Vite Unexpected | **0** |
| Seed | **none** |

---

## Residuals / defects

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **P0-ATT11-FE-VITE-COMMENT-TERMINATOR** | — | — | **CLOSED** by FE-02 · retest PASS |
| **R-ATT-11-WF** | P2 | qc | FIXED_GĐ1 interim · ≠ invent full R-SIGN-01 DONE |
| **R-ATT-11-CSUM / INBOX** | INFO | — | OUT GĐ1 |
| **R-ATT-11-EMIT** | INFO | qc | response-only `timesheet.closed` · ≠ invent PAY |
| **R-ATT-10-DISP** | P2 HOLD | — | peer · HOL/MEAL OUT · ≠ invent lines[] DONE |
| **R-ATT-11-HONESTY** | INFO | qc | C-SLICE · ≠ ATT-11 module UAT · printable false · PAY OUT |
| **R-ATT-11-HONESTY-PLT-CORE-TEXT** | OBS P2 | fe (optional) | Banner omits literal `PLT01QC1`/`CORE*` IDs — seals RETAIN via evidence cite; **not** FAIL seat |

**Ops:** U65 zero-seed · no honesty flip · **≠ ATT-11 module UAT** · **≠ LIVE=ATT-11 DONE** · **≠ AGG=ATT-10 DONE** · printable false · C-SLICE · PAY OUT.

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
P0 Vite blank CLOSED (FE-02)
```

---

## completion_report

**Closed:** QA-02 U65 browser retest after FE-02 Vite fix. L0 PASS; `hrmApi.ts` **200** (no blank `#root`); `att-sign-panel` mounts. J-HRM-ATT-11-01..06 **all PASS** on sheet `2d1a688e-…` (`QA-ATT-10-CLUSTER-01`): GET signatures physical path · NV+QL+HR sign ladder · close 201 + F5 `closed` · reject/incomplete **409 HRM-ATT-SIGN-INCOMPLETE** · reopen 201 + archive · Nest `/core` sign SoT **0**. Zero-seed. Honesty flags not flipped. Explicit **≠ ATT-11 module UAT** · printable false · C-SLICE · PAY OUT · must_keep ATT10/09/08/02/PLT/CORE seals RETAIN. Prior QA-01 FAIL `ATT11QA1-MSLXD7ZD` residual **CLOSED**.

**Residual open (for QC GWC, not FAIL):** R-ATT-11-WF FIXED_GĐ1 · CSUM/INBOX OUT · EMIT response-only · R-ATT-10-DISP peer HOLD · OBS honesty banner optional PLT/CORE stamp IDs · Dev-BE HOLD invent RETAIN.

---

## Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `qc` |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-02.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-11-CLUSTER-QC-01
role: qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-29 · UC-BP-ATT-11)
entry_criteria:
- QA-02 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-02.md · stamp ATT11QA2-MSLXOKS3
- FE-02 Vite P0 CLOSED · J-HRM-ATT-11-01..06 PASS · Nest /core 0 · U65 zero-seed
- must_keep: ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT
exit_criteria:
- QC GWC C-SLICE (≠ ATT-11 module UAT · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · printable false · PAY OUT · DENY att_leave_hold · ≠ FIXED_GĐ1=full R-SIGN-01 DONE)
- Audit Network physical /api/hrm/attendance/attendance-sheets*/signatures|close|reopen · Nest /core SoT DENY
- Residual list R-ATT-11-WF / CSUM-INBOX OUT / EMIT / R-ATT-10-DISP HOLD documented
- evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qc-01.md · ack PASS_TO_PM (GWC) or NO-GO
cấm: claim ATT UAT · honesty flip · invent PAY/CSUM/INBOX/second ledger · wipe peer seals
```

---

*End QA-02 · PASS_TO_PM · 2026-08-09*
