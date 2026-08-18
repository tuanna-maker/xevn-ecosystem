# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution — ATT sheet density / enroll product path (U65) |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-ATT-LINE-02` GWC · **R-PAY-F-ATT-LINE-AC4-BIND OPEN** · stamp `PAYFEATT-MSIJRXT4` |
| **priority** | P1 |
| **ack_status** | **`READY_FOR_QA`** |
| **portal_url** | `http://127.0.0.1:5173` (or local Vite) · HRM embed `/hr` · holding `ceo@xe.vn` / `Xevn@2026` |
| **spec_ref** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01` F-ATT-SHEET-AGG-01 · F-ATT-SHEET-03 · FR-UC-BP-ATT-10 · UC-HRM-23 / HRM-AT-01 / HRM-AT-14 |
| **U65** | zero-seed · product FE only · **cấm** `pnpm seed:*` |
| **honesty** | **`payroll_e2e_ready=false`** · formula LIVE **DENIED** · J-HRM-07 / Phase1 / module UAT **DENIED** |

---

## Mission outcome

**FE product path EXISTS and was FIXED for density → AGG `line_count>0`** (not PASS_TO_BA).

Enrollment SoT for AGG is **not** a separate “enroll on sheet” API — BE enrolls from `attendance_records` and/or **approved** `overtime_requests` inside the sheet `[start_date, end_date]` window (`att-timesheet-line-aggregate.ts`). FE already had Clock-In (today) + OT create/approve (dated) + sheet create + submit. Gaps blocking AC4 product path:

| Gap | Fix (this seat) |
|-----|-----------------|
| Submit toast ignored `line_count` / `AGG_EMPTY_ENROLLMENT` | Honest toast + amber hint + badge |
| Submitted sheet: no re-AGG after punch/OT | **`Tổng hợp lại`** → `POST …/aggregate` (`att-sheet-aggregate`) |
| Closed Sep/Jan: no FE reopen (L1-only before) | **`Mở lại bảng`** → `POST …/reopen` (`att-sheet-reopen`) — **do not** touch Jul CB-BAG unless QA explicitly avoids Jul |
| Draft copy silent on density | Draft hint: chấm công / tăng ca trước gửi chờ ký |

**Not claimed:** AC4 LIVE bind PASS · formula LIVE · `payroll_e2e_ready=true`.

---

## SRS / product path (holding · `ceo@xe.vn`)

### Path A — current month window (preferred when “today” ∈ kỳ — 2026-08)

1. Login portal → HRM → **Chấm công**.
2. **Clock-In** → Thủ công → chọn NV → **Check-in** (`POST /api/hrm/attendance/records`, `attendance_date=today`).
3. **Bảng chấm công** → **Thêm** kỳ **01/08/2026–31/08/2026** (or any window containing today) → Lưu (`att-sheets-add`).
4. Mở bảng nháp → **Gửi chờ ký** (`att-sheet-submit`) → expect toast **line_count≥1** (not empty enrollment).
5. Ký NV → QL → HCNS → **Chốt bảng công** (`att-sign-close-sheet`) → `line_locked` on BE.
6. QA AC4 STRICT: PREVIEW/PROCESS bind `payable_hours` **without** `ATT_TIMESHEET_LINE_ABSENT`.

### Path B — Sep / Jan existing closed sheets (preserve Jul CB-BAG)

1. Open Sep (`ae71f0b0-…`) or Jan sheet — **not** Jul PROCESS month.
2. **Mở lại bảng** (`att-sheet-reopen`) → status chờ ký.
3. Density in window: either Clock-In if today ∈ window **or** **Đơn từ → Tăng ca** date in Sep/Jan → **Duyệt**.
4. **Tổng hợp lại** (`att-sheet-aggregate`) → expect `line_count>0`.
5. Sign ladder → **Chốt** → QA AC4 STRICT.

### Path C — new non-Jul sheet + OT only

1. Create sheet for target month (non-Jul).
2. OT create+approve with `overtime_date` inside sheet window.
3. Submit or **Tổng hợp lại** → `line_count>0`.

---

## Code delta

| Path | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | `aggregateAttendanceSheet` · `reopenAttendanceSheet` · submit type + `warnings` |
| `apps/web/hrm/src/lib/attSheetAggUi.ts` (+ test) | Pure empty-enrollment / toast copy |
| `apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx` | AGG toast · `att-sheet-aggregate` · `att-sheet-reopen` · empty hint · line_count badge |

### Unit evidence

```text
pnpm exec vitest run src/lib/attSheetAggUi.test.ts
→ 2 passed
```

---

## Honesty locks

| Flag | Value |
|------|-------|
| `payroll_e2e_ready` | **false** (not flipped) |
| Formula LIVE / J-HRM-07 / Phase1 / module UAT | **DENIED** |
| Seed | **DENIED** |
| Jul CB-BAG / FE-EVAL / L1 EVAL reopen | **cấm** auto; QA must avoid Jul sheets |
| AC4 hours LIVE | **not claimed** — QA STRICT next |

---

## Residual

| ID | Owner | Note |
|----|-------|------|
| **R-PAY-F-ATT-LINE-AC4-BIND** | **qa** | STRICT closed+locked bind without `ATT_TIMESHEET_LINE_ABSENT` after Path A/B density |
| Backdated punch UI (arbitrary date on Clock-In) | deferred | Not required — OT dated + Aug punch cover product path; no BA gap |

---

## completion_report

### Closed

1. Confirmed FE SRS path: Clock-In / OT → sheet window → AGG → sign/close (no separate sheet-enroll API).  
2. Fixed enroll UX gaps: honesty toast, **Tổng hợp lại**, **Mở lại bảng**, density hint.  
3. Vitest `attSheetAggUi` **2 PASS**.  
4. Evidence + click paths for QA AC4 STRICT. Honesty locks held.

### Residual

AC4 LIVE bind unproven until QA browser/L1 after density on non-Jul sheet.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md` |
| **ack_status** | **`READY_FOR_QA`** |
| **pm_dispatch_hint** | QA AC4 STRICT · Path A Aug punch or Path B Sep reopen+OT · **cấm** seed · Jul CB-BAG · ready flip · claim LIVE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-ATT-LINE-03
from_role: pm
to_role: qa
lane: execution
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01 READY_FOR_QA
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
priority: P1
residual_auto_fix: true

## Mission
AC4 STRICT hours bind after FE product density (U65 zero-seed):
1) Path A (preferred): holding ceo@xe.vn — Clock-In today → create/open Aug sheet covering today → Gửi chờ ký → expect line_count>0 → sign → Chốt
   OR Path B: reopen Sep/Jan (NOT Jul) → OT dated in window + Duyệt → Tổng hợp lại (att-sheet-aggregate) → line_count>0 → Chốt
2) closed+locked → PREVIEW/PROCESS bind payable_hours WITHOUT ATT_TIMESHEET_LINE_ABSENT
3) Retain AC2 PREVIEW-STUB taxonomy where incomplete; retain AC3 ATT-412 for open-sheet PROCESS
4) honesty: payroll_e2e_ready=false · no claim formula LIVE / J-HRM-07 / Phase1

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-att-enroll-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-att-line-02.md
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-att-line-03.md
cấm: seed · reopen Jul CB-BAG · flip ready · claim module UAT
```
