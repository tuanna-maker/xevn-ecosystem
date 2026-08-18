# Evidence — PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-28 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-10` · `FR-UC-BP-ATT-10` · `J-HRM-ATT-10-01..06` |
| **depends_on** | API-01 **CONFIRMED RETAIN** · DATA-01 HOLD · BA O1–O12 · `ATT09QC1-MSLUTL9D` · `ATT08QC1-MSLSL36C` · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 · Dev-BE HOLD invent |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT · DENY invent `att_leave_hold` · DENY second hour ledger · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-10 Diễn biến #1–#3 + Thành công · BR-BP-TS-01
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md
  F-ATT-SHEET-01/AGG POST /attendance/attendance-sheets/{id}/aggregate
  POST …/submit MUST AGG · GET peer · display-ready sheet_id·status·statusLabelVi·line_count·warnings·lines
  payable gold = std+paidLeave+otWeighted · late_penalty display · unpaid∉ · HOL/MEAL OUT GĐ1
- data: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-DATA-01.md HOLD · attendance_sheets + att_timesheet_line
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md O1–O12 · J-HRM-ATT-10-01..06
- must_keep: ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
- sponsor_confirm: API-01 CONFIRMED RETAIN · unlock FE+QA · Dev-BE HOLD
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind chọn kỳ → `POST /api/hrm/attendance/attendance-sheets/{id}/aggregate` 2xx · line_count SoT · F5 plan | **PASS** (CTA draft/open `att-sheet-aggregate-draft`) |
| Submit MUST AGG · lines/line_count after 2xx | **PASS** (RETAIN submit → applyAggToast + display) |
| Display-ready sheet_id·status·statusLabelVi(FE-derive)·line_count·warnings[]·lines gold | **PASS** (`parseAtt10SheetAggDisplay` · panel `att-10-agg-display`) |
| Payable gold = std+paidLeave+otW · late_penalty display · unpaid∉ · HOL/MEAL footer OUT | **PASS** (ring + footer) |
| Nest `/core` AGG SoT = 0 | **PASS** (source lock) |
| must_keep ATT-09 hold + ATT-08 preview intact | **PASS** (peer source lock) |
| Honesty ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY · ≠ soft/ATT-08=ATT-09 · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · DENY `att_leave_hold` | **PASS** |
| No seed · Dev-BE HOLD invent Nest/HOL/MEAL/−penalty/second ledger | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **3 files · 13 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attSheet10Ring.ts` (+ test) — path · statusLabelVi · payable gold · parse display · honesty · HOL/MEAL OUT
- `apps/web/hrm/src/lib/poHrmMvpGd1Att10ClusterFe01.source.test.ts` — Nest `/core` 0 · DENY att_leave_hold · ATT-08/09 RETAIN
- `apps/web/hrm/src/lib/attSheetAggUi.ts` — CODE-MEMORY APPEND peer ATT-10
- `apps/web/hrm/src/integrations/hrmApi.ts` — optional `lines[]` + statusLabelVi on AGG result · CODE-MEMORY APPEND
- `apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx` — draft AGG CTA · display-ready panel · honesty · submit AGG bind

### Network assert path (QA)

```text
1) Chấm công → Bảng công → chọn kỳ (draft|open)
   → click «Tổng hợp kỳ» (att-sheet-aggregate-draft)
   → POST /api/hrm/attendance/attendance-sheets/{id}/aggregate 2xx
   → att-10-agg-display: sheet_id · statusLabelVi · line_count · warnings[]
   → lines[] table IF present · ELSE att-10-disp-residual (R-ATT-10-DISP · no invent)
   → Nest /core = 0 · no seed
2) «Gửi chờ ký» → POST …/submit 2xx (MUST AGG) · line_count · F5 còn
3) Gold assert (when lines[]): payable = std+paidLeave+otW · unpaid∉ · late_penalty display · HOL/MEAL footer OUT
4) Closed sheet AGG → 409 HRM-ATT-SHEET-LOCKED · warnings AC · ≠ invent ATT-11 DONE
5) Honesty att-10-honesty · seals ATT-09/08/02/PLT/CORE RETAIN · DENY att_leave_hold
```

### Residual DISP note

LIVE AGG response returns `{sheet_id,status,line_count,warnings}` — `lines[]` optional. FE binds gold table **when** BE/wire returns `lines[]`; otherwise shows honest `R-ATT-10-DISP` residual (line_count SoT PRESENT · no invent rows). Dev-BE thin GET enrich **ONLY if** QA proves closable browser gold gap.

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attSheet10Ring.test.ts \
  src/lib/poHrmMvpGd1Att10ClusterFe01.source.test.ts \
  src/lib/attSheetAggUi.test.ts
# → exit 0 · 3 files · 13 tests PASS
```

Nest `/core` AGG SoT = **0** (source lock). `att_leave_hold` only as DENY stamp in ring honesty (no dual SoT path).

---

## 4. U65 browser plan (QA-01 — J-HRM-ATT-10-01..06)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-10-01** | Login → Bảng công → chọn kỳ → Tổng hợp kỳ · line_count SoT · Nest `/core` **0** · no seed · ≠ AGG alone DONE · HOL/MEAL footer OUT | AC-ATT-10-LOAD/AGG/FUNNEL/FOOTER/PATH/≠-AGG-DONE |
| **J-HRM-ATT-10-02** | Gửi chờ ký · submit must AGG · lines/line_count còn · F5 · Nest `/core` **0** · ≠ ATT-11 DONE | AC-ATT-10-SUBMIT/F5/≠-11 |
| **J-HRM-ATT-10-03** | Kỳ có OT duyệt ×coef → ot_hours_weighted in payable (when lines[]) · raw OT FAIL · Nest `/core` **0** | AC-ATT-10-OT/FAIL-RAW-OT |
| **J-HRM-ATT-10-04** | payable=std+paid+otW · unpaid∉ · late_penalty display · DENY att_leave_hold · Nest `/core` **0** | AC-ATT-10-PAYABLE/GOLD/LEAVE/MK-ATT09 |
| **J-HRM-ATT-10-05** | warnings[] · closed → 409 LOCKED · Nest `/core` **0** · ≠ invent ATT-11 block DONE | AC-ATT-10-WARN/LOCKED/≠-11 |
| **J-HRM-ATT-10-06** | F5 + honesty · ≠DONE · printable false · PAY OUT · ATT-09/08/02/PLT/CORE RETAIN · DENY att_leave_hold | AC-ATT-10-F5/≠-*/H/MK-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Bảng công  
**Cấm:** `pnpm seed:*` · Nest `/core` AGG SoT · invent `att_leave_hold` · second hour ledger · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · invent PAY/printable/Word DONE · invent HOL/MEAL/−penalty DONE · wipe ATT-09/08 · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| Browser U65 J-HRM-ATT-10-01..06 | **QA next** | qa |
| R-ATT-10-DISP | lines[] optional · FE residual honest when ABSENT · thin BE ONLY if QA prove | qa → optional be |
| HOL/MEAL/−penalty | **OUT GĐ1** · HOLD invent | — |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · ≠ AGG=ATT-10 DONE · PAY OUT · CFG≠ATT-02 | qc |
| Peers | ATT-09/08/02/PLT/CORE seals must_keep · ≠ claim DONE from this seat | qc |
| Dev-BE | **HOLD** invent unless FE/QA proves closable thin GET lines[] gap | — |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-10-CLUSTER-QA-01
role: qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-28)
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md · L0 stack · browser-only U65 zero-seed · API-01 CONFIRMED RETAIN · Dev-BE HOLD invent
read_first:
  - docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-fe-01.md
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-BA-01.md (J-HRM-ATT-10-01..06 · AC-ATT-10-*)
  - docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md
exit_criteria:
  - J-HRM-ATT-10-01..06 browser evidence — login→Bảng công→chọn kỳ→AGG/submit→line_count SoT→OT weighted FAIL raw→payable gold (when lines[])→warnings/409 LOCKED→F5
  - Network MUST /api/hrm/attendance/attendance-sheets* · Nest /core = 0
  - Explicit ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false · C-SLICE · PAY OUT · DENY att_leave_hold · DENY second ledger · HOL/MEAL footer OUT
  - evidence: docs/qa/evidence/po-hrm-mvp-gd1-att-10-cluster-qa-01.md
  - ack_status PASS_TO_PM
persona: ceo@xe.vn / Xevn@2026 · HRM embed → Chấm công → Bảng công
cấm: pnpm seed:* · Nest /core AGG SoT · invent att_leave_hold · invent second hour ledger · invent HOL/MEAL/−penalty DONE · claim AGG=ATT-10 DONE · claim ATT-11/PAY DONE · claim soft/ATT-08=ATT-09 DONE · claim ATT UAT · claim CFG=ATT-02 DONE · invent PAY/printable · wipe ATT-09/08 · honesty flip
must_keep: ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
```

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **≠ ATT-10 DONE** (slice FE bind only) · AGG alone ≠ FR-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT · DENY invent `att_leave_hold` · DENY second hour ledger · Nest `/core` DENY · must_keep ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 · CORE07QC1-KZJTSHNT · soft≠CORE-06 · U65 no seed
