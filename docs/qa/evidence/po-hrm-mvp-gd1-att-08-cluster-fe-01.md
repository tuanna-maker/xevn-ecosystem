# Evidence — PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-26 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-ATT-08` · `FR-UC-BP-ATT-08` · `J-HRM-ATT-08-01..06` DRAFT |
| **depends_on** | API-01 **CONFIRMED** · DATA-01 HOLD · BA-01 O1–O12 · SA Option A · BE residual **REQUIRED** (preview/engine/holiday/unit ABSENT) · `ATT02QC1-MSLQZUK7` CFG≠DONE · `PLT01QC1-MSLPUQIU` · `CORE10QC1-MSLP0EJB` · `CORE09QC1-MSLNBA89` printable false · `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE |
| **ack_status** | **PASS_TO_PM** — leave peers RETAIN bound · preview Nest path **ABSENT** → residual **R-ATT-08-PREVIEW-FE** await BE then FE-02 |
| **change_mode** | **ADD/UPGRADE** · preserve_default · CODE-MEMORY **APPEND** |
| **honesty** | `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · `hrm_personnel_uat_ready=false` · **C-SLICE** · client-days ≠ ATT-08 DONE · ≠ ATT-09/03b DONE · ≠ ATT module UAT · CFG≠ATT-02 DONE · ≠ PLT/CORE DONE · PAY OUT · Nest `/core` DENY · no seed |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08 Diễn biến #1–#4 + FAIL calendar · Thành công · BR-BP-LV-05 · Q-LEAVE-UNIT
- tech_spec / api: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md
  F-ATT-LEAVE-01 POST /attendance/leave-requests/preview-deduction · peers leave-requests/balance/types
  residual PREVIEW/ENGINE/HOL/UNIT/ALIGN ABSENT → BE REQUIRED · Nest /core DENY · paper alias only
- ba: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-BA-01.md O1–O12 · AC-ATT-08-* · J-HRM-ATT-08-01..06 DRAFT
- data: DATA-01 HOLD · leave_requests RETAIN · residual ADD stamped closable
- must_keep: ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · FE RETAIN peers parallel · engine AC wait BE
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind RETAIN leave UI → physical `/api/hrm/attendance/leave-requests*` (list/create/approve/reject/cancel) | **RETAIN** (source lock + CODE-MEMORY) |
| Preview-deduction panel shell · call when LIVE · stub-safe ABSENT (no fake T6→T2=4) | **ADD** `AttLeavePreviewDeductionPanel` |
| Display-ready fields when present (`calendar_days` / `working_days` / `deductible_units` / `unit` / `excluded_days`) | **Prepared** — bind when BE returns envelope |
| HOL-MISS chặn nộp (`HRM-LEAVE-HOL-MISSING`) | **ADD** — disable submit + toast |
| Nest `/core` leave SoT = 0 (source lock) | **PASS** |
| Honesty ≠ client-days DONE · ≠ ATT-09/03b · ≠ ATT UAT · CFG≠ATT-02 · printable false · PAY OUT · PLT/CORE RETAIN | **ADD** `att-08-honesty` |
| CODE-MEMORY APPEND | **PASS** |
| vitest | **2 files · 13 PASS** (see §3) |

### Files touched

- `apps/web/hrm/src/lib/attLeaveRing.ts` (+ test) — path/preview parse/honesty/HOL-MISS
- `apps/web/hrm/src/lib/poHrmMvpGd1Att08ClusterFe01.source.test.ts` — Nest `/core` 0 · peers · honesty
- `apps/web/hrm/src/components/attendance/AttLeavePreviewDeductionPanel.tsx` — preview shell stub-safe
- `apps/web/hrm/src/components/attendance/LeaveTab.tsx` — mount panel · HOL-MISS block submit
- `apps/web/hrm/src/hooks/useLeaveRequests.ts` — CODE-MEMORY APPEND RETAIN
- `apps/web/hrm/src/integrations/hrmApi.ts` — `previewLeaveDeduction` ADD
- `apps/web/hrm/src/lib/apiError.ts` — `HRM-LEAVE-HOL-MISSING` friendly

### Network assert path (QA — peers now · preview after BE)

```text
1) Chấm công → Nghỉ phép → Tạo yêu cầu
   → GET /api/hrm/attendance/leave-requests  (no Nest /core)
   → GET /api/hrm/attendance/leave-types/effective (RETAIN)
   → GET /api/hrm/attendance/leave-balance* (RETAIN)
   → Panel att-08-preview: residual banner R-ATT-08-PREVIEW-FE HOLD if preview ABSENT (404)
   → DENY invent working_days=4 / fake T6→T2
2) Khi BE LIVE preview:
   → POST /api/hrm/attendance/leave-requests/preview-deduction 2xx
   → Display Ngày calendar / Ngày trừ quỹ / Đơn vị trừ
   → Gold T6→T2 working_days=2 (≠ calendar 4 as trừ quỹ)
3) HOL-MISS → HRM-LEAVE-HOL-MISSING → submit DISABLED · toast
4) Submit create → POST /attendance/leave-requests · Nest 0 · client total_days ≠ ATT-08 DONE alone
5) Footer att-08-honesty: client≠DONE · ≠09/03b · ≠ATT UAT · CFG≠02 · printable false · PAY OUT · PLT/CORE RETAIN · soft≠06
```

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/attLeaveRing.test.ts \
  src/lib/poHrmMvpGd1Att08ClusterFe01.source.test.ts
# → exit 0 · 2 files · 13 tests PASS
```

**Preview path:** BE `POST …/preview-deduction` **ABSENT PROVEN** (API-01 + Nest grep 0) → **no READY_FOR_QA** on engine journeys · residual **R-ATT-08-PREVIEW-FE**.

---

## 4. U65 browser plan (partial peers now · engine after BE)

| J-ID | Click path | Pass when | Gate |
|------|------------|-----------|------|
| **J-HRM-ATT-08-01** | Login → Nghỉ phép → chọn T6→T2 → preview working_days=2 · Nest `/core` **0** | AC-ATT-08-PREVIEW/ENGINE/PATH | **BLOCKED** until BE preview |
| **J-HRM-ATT-08-02** | Calendar-4 as trừ quỹ → FAIL · no soft-OK | AC-ATT-08-FAIL-CAL | **BLOCKED** until BE |
| **J-HRM-ATT-08-03** | HOL-MISS → chặn nộp | AC-ATT-08-HOL-MISS | **BLOCKED** until BE holiday · FE shell ready |
| **J-HRM-ATT-08-04** | unit day 0.5 / hour 1h | AC-ATT-08-UNIT | **BLOCKED** until BE unit |
| **J-HRM-ATT-08-05** | Submit consume engine · ≠ ATT-09 DONE | AC-ATT-08-ALIGN | **BLOCKED** until BE ALIGN |
| **J-HRM-ATT-08-06** | F5 + honesty seals · ≠DONE · PAY OUT · CFG≠02 | AC-ATT-08-F5/≠-*/H/MK-* | **Partial** — honesty footers LIVE now |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed → Chấm công → Nghỉ phép  
**Cấm:** `pnpm seed:*` · Nest `/core` leave SoT · claim client-days = ATT-08 DONE · claim ATT-09/03b DONE · claim ATT module UAT · claim CFG=ATT-02 DONE · invent PAY/printable/Word DONE · fake T6→T2=4 · honesty flip · reopen sealed J-ATT-02/PLT/CORE-*

**Partial QA (peers only — optional same wave):** Leave list/create chrome · leave-types EFF · balance panel · assert Nest `/core` 0 · honesty footer visible — **do not** 🟢 engine AC.

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-ATT-08-PREVIEW-FE** | Preview Nest ABSENT — panel HOLD · await BE wire then FE-02 bind verify | **dev-be** → **dev-fe** FE-02 |
| **R-ATT-08-PREVIEW/ENGINE/HOL/UNIT/ALIGN** | BE residual REQUIRED (API-01) | **dev-be** |
| Honesty | printable=false · C-SLICE · ≠ ATT UAT · ≠ PLT/CORE DONE · PAY OUT · CFG≠ATT-02 DONE | QC |
| Peers | ATT-02/PLT/CORE seals must_keep · ≠ claim DONE from this seat | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** → ensure **dev-be** BE-01 residual · then FE-02 / QA peers-optional |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-01.md` |

```yaml
completion_report: |
  FE-01 ADD/UPGRADE — RETAIN leave-requests* physical bind + AttLeavePreviewDeductionPanel
  stub-safe when preview ABSENT (no fake T6→T2=4); HOL-MISS submit block wired;
  display-ready parse prepared; Nest /core leave = 0; honesty seals RETAIN;
  client-days ≠ ATT-08 DONE · ≠ ATT-09/03b · ≠ ATT UAT · CFG≠ATT-02 DONE · PAY OUT · printable false;
  must_keep ATT02QC1-MSLQZUK7 · PLT/CORE · soft≠CORE-06; vitest 13 PASS;
  residual R-ATT-08-PREVIEW-FE await BE then FE-02.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
  role: dev-be
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-26)
  entry_criteria: API-01 F.1 CONFIRMED · FE-01 PASS_TO_PM @ docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-01.md · residual R-ATT-08-PREVIEW-FE · Nest /core DENY · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · printable false · PAY OUT · U65 zero-seed
  read_first:
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-DATA-01.md
    - docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-01.md
  exit_criteria:
    - Wire POST /api/hrm/attendance/leave-requests/preview-deduction · BR-BP-LV-05 gold T6→T2 working_days=2 · HOL-MISS · unit day|hour · display-ready · ALIGN reject calendar inflate
    - DENY Nest @Controller('core') · DENY invent PAY/printable · ≠ claim client-days/ATT-09/03b/ATT UAT/CFG=ATT-02 DONE
    - evidence docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-be-01.md · READY_FOR_QA → then FE-02 + QA J-HRM-ATT-08-01..06
  cấm: Nest /core dual · wipe ATT-02/PLT/CORE · seed · honesty flip
```

---

*End FE-01 · PASS_TO_PM · R-ATT-08-PREVIEW-FE HOLD · 2026-08-09*
