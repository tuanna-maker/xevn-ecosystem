# Evidence — PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-26 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-08` · `FR-UC-BP-ATT-08` · `J-HRM-ATT-08-01..06` |
| **depends_on** | BE-01 READY_FOR_QA · FE-01 shell · API-01 CONFIRMED · BA O1–O12 · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | **UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · **R-ATT-08-PREVIEW-FE CLOSED** · client-days ≠ ATT-08 DONE · ≠ ATT-09/03b DONE · ≠ ATT UAT · CFG≠ATT-02 DONE · printable false RETAIN · PAY OUT · Nest `/core` DENY · C-SLICE · U65 |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08 Diễn biến #1–#4 + FAIL calendar · BR-BP-LV-05 · Q-LEAVE-UNIT
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md
  F-ATT-LEAVE-01 POST /attendance/leave-requests/preview-deduction · peers leave-requests/balance/types
  display-ready deductible_units·working_days·calendar_days·unit·excluded_days
- be: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-be-01.md READY_FOR_QA
- fe-01: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-01.md · residual R-ATT-08-PREVIEW-FE → CLOSED this seat
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md O1–O12 · J-HRM-ATT-08-01..06
- must_keep: ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06
- sponsor_confirm: API-01 CONFIRMED · BE-01 wired · FE-02 LIVE bind
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind đơn nghỉ → LIVE `POST /api/hrm/attendance/leave-requests/preview-deduction` | **PASS** |
| Display Ngày trừ quỹ (`working_days` / `deductible_units`) vs calendar_days — DENY calendar=SoT | **PASS** |
| HOL-MISS → block submit CTA + clear message | **PASS** |
| unit day\|hour from envelope · Q-LEAVE-UNIT | **PASS** |
| ALIGN reject inflate surfaced (`toErrorMessage` + submit uses `deductible_units`) | **PASS** |
| Close residual **R-ATT-08-PREVIEW-FE** | **CLOSED** |
| Nest `/core` leave SoT = 0 | **PASS** (source lock) |
| Honesty ≠ client-days DONE · ≠ ATT-09/03b · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · seals RETAIN | **PASS** |
| No seed · no invent PAY/printable | **PASS** |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **3 files · 21 PASS** |

### Files touched

- `apps/web/hrm/src/lib/attLeaveRing.ts` (+ test) — LIVE helpers · ALIGN · residual CLOSED
- `apps/web/hrm/src/lib/poHrmMvpGd1Att08ClusterFe02.source.test.ts` — Nest `/core` 0 · LIVE stamps
- `apps/web/hrm/src/lib/poHrmMvpGd1Att08ClusterFe01.source.test.ts` — retain Nest lock (compat)
- `apps/web/hrm/src/components/attendance/AttLeavePreviewDeductionPanel.tsx` — LIVE bind · unit VI · onPreviewReady
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — submit `deductible_units` · HOL-MISS block
- `apps/web/hrm/src/integrations/hrmApi.ts` · `hooks/useLeaveRequests.ts` — CODE-MEMORY APPEND
- `apps/web/hrm/src/lib/apiError.ts` — ALIGN inflate before generic HRM-VAL-400

### Network assert path (QA)

```text
1) Chấm công → Nghỉ phép → Tạo yêu cầu · chọn T6→T2
   → POST /api/hrm/attendance/leave-requests/preview-deduction 2xx
   → Panel: LIVE · R-ATT-08-PREVIEW-FE CLOSED
   → Ngày calendar=4 · Ngày trừ quỹ working_days=2 · deductible_units=2 · Nest /core = 0
   → DENY treat calendar 4 as trừ quỹ
2) HOL-MISS (thiếu lịch lễ năm) → HRM-LEAVE-HOL-MISSING · submit DISABLED · toast
3) unit day 0.5 / hour 1h from envelope
4) Submit → POST /attendance/leave-requests · total_days = deductible_units (ALIGN)
   → Inflate calendar → HRM-VAL-400 ALIGN toast (≠ ATT-02 late-penalty wording)
5) Footer att-08-honesty: client≠DONE · ≠09/03b · ≠ATT UAT · CFG≠02 · printable false · PAY OUT · residual CLOSED
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeaveRing.test.ts \
  src/lib/poHrmMvpGd1Att08ClusterFe01.source.test.ts \
  src/lib/poHrmMvpGd1Att08ClusterFe02.source.test.ts
# → exit 0 · 3 files · 21 tests PASS
```

---

## 4. U65 browser plan (QA-01 — J-HRM-ATT-08-01..06)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-ATT-08-01** | Login → Nghỉ phép → chọn T6→T2 → preview working_days=2 · Nest `/core` **0** | AC-ATT-08-PREVIEW/ENGINE/PATH |
| **J-HRM-ATT-08-02** | Calendar-4 as trừ quỹ → FAIL · no soft-OK | AC-ATT-08-FAIL-CAL |
| **J-HRM-ATT-08-03** | HOL-MISS → chặn nộp CTA | AC-ATT-08-HOL-MISS |
| **J-HRM-ATT-08-04** | unit day 0.5 / hour 1h | AC-ATT-08-UNIT |
| **J-HRM-ATT-08-05** | Submit consume engine · ALIGN · ≠ ATT-09 DONE | AC-ATT-08-ALIGN |
| **J-HRM-ATT-08-06** | F5 + honesty seals · ≠DONE · PAY OUT · CFG≠02 · R-ATT-08-PREVIEW-FE CLOSED | AC-ATT-08-F5/≠-*/H/MK-* |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Nghỉ phép  
**Cấm:** `pnpm seed:*` · Nest `/core` leave SoT · claim client-days = ATT-08 DONE · claim ATT-09/03b DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · invent PAY/printable/Word DONE · fake T6→T2=4 · honesty flip · reopen sealed J-ATT-02/PLT/CORE-*

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-ATT-08-PREVIEW-FE** | **CLOSED** this seat | — |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · ≠ PLT/CORE DONE · PAY OUT · CFG≠ATT-02 DONE | QC |
| Peers | ATT-02/PLT/CORE seals must_keep · ≠ claim DONE from this seat | QC |
| Browser U65 J-HRM-ATT-08-01..06 | **QA next** | qa |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-02.md` |

```yaml
completion_report: |
  FE-02 UPGRADE — LIVE bind POST /attendance/leave-requests/preview-deduction;
  display Ngày trừ quỹ (working_days/deductible_units) vs calendar; HOL-MISS block CTA;
  unit day|hour; ALIGN submit total_days=deductible_units + inflate toast;
  R-ATT-08-PREVIEW-FE CLOSED; Nest /core=0; honesty seals RETAIN;
  ≠ client-days DONE · ≠ ATT-09/03b · ≠ ATT UAT · CFG≠ATT-02 · PAY OUT · printable false;
  must_keep ATT02QC1-MSLQZUK7 · PLT/CORE; vitest 21 PASS.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-QA-01
  role: qa
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-26)
  entry_criteria: browser-only; U65 zero-seed; FE-02 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-02.md · BE-01 READY @ docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-be-01.md · Nest /core DENY
  persona: ceo@xe.vn / Xevn@2026 · portal HRM → Chấm công → Nghỉ phép
  journeys: J-HRM-ATT-08-01..06
  exit_criteria:
    - Each J-* evidence block: click path · Network POST …/preview-deduction 2xx · FE after 2xx · F5
    - J-01 gold T6→T2 working_days=2 · Nest /core=0
    - J-02 calendar-4 as trừ quỹ FAIL
    - J-03 HOL-MISS chặn nộp
    - J-04 unit day|hour
    - J-05 ALIGN submit · ≠ ATT-09 DONE
    - J-06 honesty · R-ATT-08-PREVIEW-FE CLOSED · CFG≠ATT-02 · PAY OUT · printable false
    - matrix update · PASS_TO_PM (or FAIL with residual)
  cấm: pnpm seed:* · Nest /core SoT · claim client-days=ATT-08 DONE · claim ATT UAT · invent PAY/printable · reopen ATT-02/PLT/CORE seals
```

---

*End FE-02 · READY_FOR_QA · R-ATT-08-PREVIEW-FE CLOSED · 2026-08-09*
