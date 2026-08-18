# Evidence — PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-11-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-29 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-11` · `FR-UC-BP-ATT-11` · `J-HRM-ATT-11-01..06` |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA O1–O12 · `ATT10QC1-MSLWGUYH` ≠ AGG=DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Dev-BE HOLD invent · DENY second sign ledger · DENY `att_leave_hold` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT · DENY invent `att_leave_hold` · DENY second sign ledger · ≠ FIXED_GĐ1=full R-SIGN-01 DONE · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-11 Diễn biến #1–#3 + Thành công · BR-BP-TS-02 · R-SIGN-01
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md
  F-ATT-WF-SIGN-02 GET /attendance/attendance-sheets/{id}/signatures
  F-ATT-WF-SIGN-01 POST …/signatures (approved|rejected · dup 409 SIGN-DUP)
  F-ATT-SHEET-02 POST …/close (can_close · 409 INCOMPLETE · event timesheet.closed)
  F-ATT-SHEET-03 POST …/reopen (archive → submitted)
  display-ready header_id·status·statusLabelVi(FE-derive)·steps[]·missing_mandatory_roles[]·can_close·policy_ready?
  FIXED_GĐ1 employee|direct_manager|hr_admin · Nest /core DENY
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-DATA-01.md HOLD · attendance_sheets + att_timesheet_sign_step
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md O1–O12 · J-HRM-ATT-11-01..06
- must_keep: ATT10QC1-MSLWGUYH · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
- sponsor_confirm: API-01 CONFIRMED RETAIN · unlock FE+QA · Dev-BE HOLD
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind submitted SignPanel → GET/POST `/api/hrm/attendance/attendance-sheets/{id}/signatures` | **PASS** |
| POST `…/close` · POST `…/reopen` | **PASS** |
| Display-ready header_id·status·statusLabelVi(FE-derive)·steps[]·missing_mandatory_roles[]·can_close·policy_ready? | **PASS** (`parseAtt11SignaturesDisplay` · `att-11-sign-display`) |
| FIXED_GĐ1 3 personas (employee\|direct_manager\|hr_admin) | **PASS** (`ATT_11_FIXED_GD1_PERSONAS` + ladder UI) |
| Reject + comment → can_close false · close disabled / 409 path | **PASS** (`att-sign-reject-*`) |
| Close event `timesheet.closed` response-only · CSUM/INBOX OUT footer | **PASS** |
| Nest `/core` sign/close SoT = 0 | **PASS** (source lock) |
| must_keep ATT-10 AGG/submit peer · ATT-09 hold · ATT-08 preview | **PASS** (peer source lock) |
| Honesty ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY `att_leave_hold` · ≠ FIXED_GĐ1=full R-SIGN-01 | **PASS** |
| No seed · Dev-BE HOLD invent Nest/CSUM/INBOX/second ledger/`att_leave_hold`/PAY | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **3 files · 17 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attSheet11Ring.ts` (+ test) — path · statusLabelVi · FIXED_GĐ1 · parse display · honesty · CSUM/INBOX OUT
- `apps/web/hrm/src/lib/poHrmMvpGd1Att11ClusterFe01.source.test.ts` — Nest `/core` 0 · DENY att_leave_hold in sign slice · ATT-10/09/08 RETAIN
- `apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx` — sign display-ready · reject · close event · ATT-11 honesty · RETAIN ATT-10 AGG peer
- `apps/web/hrm/src/integrations/hrmApi.ts` — optional statusLabelVi / policy_ready on signatures payload · CODE-MEMORY APPEND

### Network assert path (QA)

```text
1) Chấm công → Bảng công → kỳ submitted (cite ATT-10 submit peer · ≠ AGG=ATT-10 DONE)
   → Sign panel att-sign-panel
   → GET /api/hrm/attendance/attendance-sheets/{id}/signatures 2xx
   → att-11-sign-display: header_id · statusLabelVi · can_close · missing_mandatory_roles · FIXED_GĐ1 footer
   → Nest /core = 0 · no seed
2) Xác nhận NV → QL → HCNS (att-sign-confirm-*) → POST …/signatures approved
   → can_close=true · Chốt (att-sign-close-sheet) → POST …/close 2xx · event timesheet.closed
   → F5 status=closed · ≠ invent PAY DONE
3) Reject path: att-sign-reject-* + comment → can_close=false → Chốt → 409 HRM-ATT-SIGN-INCOMPLETE
4) Incomplete: thiếu ≥1 vai → close disabled / 409 INCOMPLETE · no bypass
5) Closed → Mở lại bảng (att-sheet-reopen) → POST …/reopen · status=submitted · F5
6) Honesty att-11-honesty · seals ATT-10/09/08/02/PLT/CORE RETAIN · DENY att_leave_hold · printable false
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attSheet11Ring.test.ts \
  src/lib/poHrmMvpGd1Att11ClusterFe01.source.test.ts \
  src/lib/attSheet10Ring.test.ts
# → exit 0 · 3 files · 17 tests PASS
```

Nest `/core` sign/close SoT = **0** (source lock). `att_leave_hold` only as DENY stamp in ring honesty (no dual SoT path in sign slice).

---

## 4. U65 browser plan (QA-01 — J-HRM-ATT-11-01..06)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-11-01** | Login → Bảng công → mở kỳ `submitted` → Sign panel · GET signatures · steps/can_close · Nest `/core` **0** · no seed · ≠ LIVE alone DONE | AC-ATT-11-LOAD/GET-SIGN/PREREQ/DISP/PATH/≠-LIVE-DONE |
| **J-HRM-ATT-11-02** | Ký đủ NV+QL+HR → can_close true → Chốt / POST close 2xx → F5 `closed` · Nest `/core` **0** · ≠ invent PAY DONE | AC-ATT-11-SIGN/LADDER/CLOSE/F5/PAY-OUT |
| **J-HRM-ATT-11-03** | Một vai Từ chối (+ comment) → can_close false → Chốt → **409** INCOMPLETE · Nest `/core` **0** · PAY blocked cite | AC-ATT-11-REJECT/FAIL-REJECT/INCOMPLETE |
| **J-HRM-ATT-11-04** | Thiếu ≥1 vai approved → close → **409** INCOMPLETE · không silent closed · Nest `/core` **0** | AC-ATT-11-NO-BYPASS/INCOMPLETE/LADDER |
| **J-HRM-ATT-11-05** | Sheet closed → Mở lại + lý do → `submitted` · prior steps archived · F5 · Nest `/core` **0** · ≠ invent PAY adjustment DONE | AC-ATT-11-REOPEN |
| **J-HRM-ATT-11-06** | F5 + honesty · ≠DONE · printable false · PAY OUT · ATT-10/09/08/02/PLT/CORE RETAIN · DENY att_leave_hold · FIXED_GĐ1 ≠ full R-SIGN-01 · CSUM/INBOX OUT | AC-ATT-11-F5/≠-*/H/MK-*/CSUM-OUT/INBOX-OUT/WF-FOOTER |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Bảng công  
**Cấm:** `pnpm seed:*` · Nest `/core` sign/close SoT · invent `att_leave_hold` · second sign ledger · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · invent PAY/printable/Word/CSUM/INBOX/HOL/MEAL/`lines[]` DONE · claim FIXED_GĐ1=full R-SIGN-01 DONE · wipe ATT-10/09/08 · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| Browser U65 J-HRM-ATT-11-01..06 | **QA next** | qa |
| R-ATT-11-WF | FIXED_GĐ1 interim footer · ≠ invent full R-SIGN-01 DONE | qa → residual doc |
| R-ATT-11-CSUM / INBOX | **OUT GĐ1** · HOLD invent | — |
| R-ATT-11-EMIT | response-only `timesheet.closed` · ≠ invent PAY | qa assert |
| R-ATT-10-DISP | peer **P2 HOLD** · HOL/MEAL OUT · ≠ invent lines[] DONE | — |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · ≠ LIVE=ATT-11 DONE · PAY OUT · CFG≠ATT-02 | qc |
| Peers | ATT-10/09/08/02/PLT/CORE seals must_keep · ≠ claim DONE from this seat | qc |
| Dev-BE | **HOLD** invent unless FE/QA proves closable thin statusLabelVi / reopen-reason envelope gap | — |

---

## 6. completion_report

**Closed:** Dev-FE UPGRADE SignPanel for UC-BP-ATT-11 / FR-UC-BP-ATT-11 — bind GET/POST `/api/hrm/attendance/attendance-sheets/{id}/signatures` · POST `…/close` · POST `…/reopen`; display-ready `header_id`·`status`·`statusLabelVi`(FE-derive)·`steps[]`·`missing_mandatory_roles[]`·`can_close`·`policy_ready?`; FIXED_GĐ1 3 personas; reject+comment blocks close; close event response-only; Nest `/core` 0; must_keep ATT10QC1-MSLWGUYH (≠ AGG=DONE · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT) · ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE stamps; honesty false · printable false · C-SLICE · PAY OUT · DENY invent CSUM/INBOX/second ledger/`att_leave_hold`/PAY/`lines[]` DONE · ≠ LIVE=ATT-11 DONE · ≠ FIXED_GĐ1=full R-SIGN-01 DONE; vitest **3 files · 17 PASS**; U65 zero-seed.

**Residual open:** Browser U65 **J-HRM-ATT-11-01..06** → QA-01. Dev-BE HOLD invent.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | `qa` |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-01.md` |
| **next_dispatch_prompt** | See §8 |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-01
role: qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-29)
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-01.md · API-01 CONFIRMED RETAIN · U65 zero-seed · L0 stack up (hrm-api :28001 · portal)
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-01.md (§4 U65 plan J-01..06)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-BA-01.md (AC-ATT-11-* · J-HRM-ATT-11-01..06)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-11-CLUSTER-API-01.md (F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02/03)
persona: ceo@xe.vn / Xevn@2026 · portal HRM embed → Chấm công → Bảng công
exit_criteria:
  - Browser U65 J-HRM-ATT-11-01..06 — submitted→GET signatures→ký NV+QL+HR→close→F5 closed; reject→409 INCOMPLETE; incomplete no-bypass; reopen+archive; Nest /core 0; zero-seed
  - Network MUST contain /api/hrm/attendance/attendance-sheets*/signatures|close|reopen — FAIL if Nest /core SoT
  - Explicit ≠ LIVE=ATT-11 DONE · ≠ AGG=ATT-10 DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT module UAT · printable false · C-SLICE · PAY OUT · ≠ FIXED_GĐ1=full R-SIGN-01 DONE · DENY invent att_leave_hold · second ledger · CSUM/INBOX/PAY/HOL/MEAL/lines[] DONE
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-01.md
  - ack_status PASS_TO_PM (or FAIL_TO_PM with residual)
cấm: pnpm seed:* · Nest /core SoT · invent att_leave_hold · claim LIVE=ATT-11 DONE · claim AGG=ATT-10 DONE · claim ATT UAT · invent PAY/printable · wipe ATT-10/09/08 seals
```

---

*End FE-01 · READY_FOR_QA · 2026-08-09*
