# Evidence — PO-MFD-M2-ATT-EXPORT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-EXPORT-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P2 (matrix #30 — not Attendance CLOSED) |
| **verdict** | **A) ACCEPTED_AS_IS_P1** — client-side export dialog honesty OK Phase-1; keep matrix **PARTIAL**; no Nest export API / no PDF FR invented |
| **sponsor_confirm** | **None invented** — no claim customer signed server PDF / audit export SLA / Attendance CLOSED |
| **dev_coding** | **Not opened** (FR_NEEDED Phase-1 rejected) |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **u65_zero_seed** | true |
| **must_keep** | REPORTS-01 GWC (#29 LIVE) · REQUESTS/LEAVE/OT/CLOCK/RECORDS/SETTINGS-EMP/WEEKLY/OVERVIEW GWC · CFG-COLUMNS / DEVICE / AUTO / QR ACCEPTED_AS_IS · Face #9 GĐ2-HOLD · **not** Attendance CLOSED · `uat_done: false` |

## Sources read (spec says / code does)

| Artifact | Finding |
|----------|---------|
| Fidelity matrix **#29** | Báo cáo `AttendanceReportsTab` — filter tháng/năm · charts · bảng · **LIVE** (`REPORTS-01` U65 ceo@ filter 8→7 idle0 · client-aggregate honesty). UC UNMAPPED ≠ UC-HRM-27 alone. |
| Fidelity matrix **#30** | Báo cáo→Xuất · `AttendanceExportDialog` · Actions «Export Excel/PDF» · Spec **SPEC_GAP** · TechSpec CODE · API «export client-side / SPEC_GAP» · Runtime **PARTIAL** · UC **UNMAPPED** · Owner qa · **P2**. |
| M2 backlog **P2-2** | This WI — governance #30 client vs server · not ATT CLOSED. Parent P1-4 REPORTS GWC CLOSED with #30 left PARTIAL. |
| REPORTS QA | `po-mfd-m2-att-reports-01-qa.md`: #29 LIVE; #30 **PARTIAL** — Xuất CTA visible; **export dialog not exercised**; do not claim LIVE export. |
| REPORTS QC GWC | `po-mfd-m2-att-reports-01-qc.md` **GO WITH CONDITIONS**: Condition #3 «Do not invent #30 export LIVE»; residual `#30 Xuất` OPEN PARTIAL P2 non-blocking; no dedicated `/attendance/reports/*`. |
| QA-RUNTIME | `po-mfd-m2-att-qa-runtime-01.md`: UNKNOWN=0; #30 PARTIAL kept (export not clicked); P1 table COMPLETE awaiting QC runtime. |
| `docs/hrm/SRS.md` | **No** FR Diễn biến «Xuất báo cáo chấm công Excel/PDF». UF-HRM-05 in matrix points to records/widgets — **not** an export deliverable FR. **No overwrite** this seat. |
| HDSD client | `HDSD_XEVN_CH06` export = **Employees** Excel (IM path) — **no** operable HDSD step Chấm công→Báo cáo→Xuất. |
| TECHSPEC | No Nest attendance export contract found for this surface (employee IM export ≠ ATT #30). |
| FE `AttendanceReportsTab.tsx` | Wraps `AttendanceExportDialog` on Xuất CTA (`attendance.reports.exportReport`) — CTA wired under #29 LIVE. |
| FE `AttendanceRecordsTable.tsx` | Same dialog reused on records toolbar (shared component). |
| FE `AttendanceExportDialog.tsx` (read-only) | Client **XLSX only** (no PDF). UI: year/month Select + 3-sheet description + Export Excel. `fetchMonthlyRecords` **stub**: after companyId check → `return null \|\| []` — **never** calls `GET /attendance/records`. `handleExport` → empty → `toast.warning(noData)` path; workbook write only if length>0 (unreachable with stub). |

## As-is vs to-be (Phase-1 / M2 #30)

| Aspect | As-is | Phase-1 to-be (this delta) |
|--------|-------|----------------------------|
| #29 Báo cáo load/filter | LIVE REPORTS GWC | **must_keep** — do not reopen |
| Xuất CTA on Báo cáo | Visible (QA/QC spot) | **Accepted** as dialog entry |
| Export dialog shell | Year/month + Excel CTA + sheet copy | **Accepted PARTIAL** shell |
| Client vs server | Client XLSX intended; **no** Nest export | **Honesty OK** — no dedicated export API required P1 (align REPORTS aggregate honesty) |
| Data fetch for export | Stub → always `[]` → noData toast | **Honest PARTIAL** — must **not** stamp LIVE download |
| PDF | Matrix wording Excel/PDF; code Excel-only | **No PDF claim** Phase-1 |
| Dedicated FR export Phase-1 | Missing SRS/HDSD | **Not invented** — FR_NEEDED rejected |
| Server PDF / audit pack / async job | Absent | **DEFERRED_GĐ2_CANDIDATE** |

## Decision (authoritative)

### A) ACCEPTED_AS_IS_P1 — **SELECTED**

Close governance residual for matrix **#30** / M2 **P2-2** without opening Dev and without Phase-1 UC/SRS overwrite:

1. **Parent #29 already GWC LIVE** with documented **client-aggregate** honesty (no Nest `/attendance/reports/*`). Export as **client-side XLSX dialog** is the same Phase-1 architecture class — not a separate server RPT product without FR.
2. Matrix **PARTIAL** is the correct honest stamp: dialog + CTA exist; successful file download was **not** proven (REPORTS seat skipped dialog; code fetch stub → empty).
3. **SRS/HDSD have no ATT export Diễn biến** — inventing **FR_NEEDED** Phase-1 Excel/PDF SLA or Nest export endpoint without sponsor = process defect (parallel CFG-COLUMNS / QR / AUTO-CHECKOUT).
4. Stub `fetchMonthlyRecords → []` is **AS-IS PARTIAL**, not a false LIVE. Claiming LIVE xlsx or inventing seed data to pass export = FAIL honesty.
5. PDF depth / server audit export / signed file retention = **GĐ2 candidate** only if sponsor opens — not primary C) GĐ2-HOLD (surface is operable dialog under LIVE reports, unlike Face #9).

### B) FR_NEEDED Phase-1 UC delta — **REJECTED**

Would invent sponsor-grade FR (working download AC, PDF, Nest export) without SRS/HDSD Diễn biến and without sponsor confirm. Violates «no invent sponsor confirm» + ADD-only on `docs/hrm/SRS.md` (do not overwrite). Inactive GĐ2 candidates kept below only.

### C) SPEC_GAP / GĐ2-HOLD as primary — **REJECTED**

- Matrix already labels Spec **SPEC_GAP**; treating the whole seat as **GĐ2-HOLD** would contradict REPORTS GWC keeping Xuất CTA as P2 PARTIAL under LIVE #29.
- Depth gaps (wire GET→XLSX, PDF, server job) stay **DEFERRED_GĐ2_CANDIDATE** under A — not Face-class HOLD.

## Phase-1 accepted AC (measurable)

| ID | Acceptance criterion | Pass | Fail |
|----|----------------------|------|------|
| **AC-ATT-EXPORT-01** | Báo cáo exposes Xuất CTA opening `AttendanceExportDialog` | Dialog title/description + year/month visible | Blank crash / Uncaught on open |
| **AC-ATT-EXPORT-02** | Phase-1 export path is **client-side** — **no** Nest `/attendance/reports/export*` (or equivalent) required | Align REPORTS honesty `dedicated_reports_api=false` | FAIL seat only because dedicated export API missing |
| **AC-ATT-EXPORT-03** | Matrix #30 stamp remains **PARTIAL** ACCEPTED_AS_IS until browser proves real `.xlsx` download from live GET records | Honest PARTIAL | Stamp **LIVE** without Network proof of data→file |
| **AC-ATT-EXPORT-04** | Empty / stub / noData toast is **valid PARTIAL** — must not invent rows or seed to green export | Toast noData or honest empty | Fake file / DB seed for PASS |
| **AC-ATT-EXPORT-05** | Phase-1 **does not** require PDF export | Excel-only UI OK | FAIL because PDF absent |
| **AC-ATT-EXPORT-06** | REPORTS #29 GWC **not** reopened by this WI | No invent REPORTS FAIL | Re-run REPORTS as invent FAIL for export |
| **AC-ATT-EXPORT-07** | U65: no seed / no API-only green for export LIVE claim | Browser FE if LIVE claimed later | `pnpm seed:*` or API invent to pass export |
| **AC-ATT-EXPORT-08** | No new Phase-1 FR overwrite of `docs/hrm/SRS.md` for ATT export | Close without SRS wipe | Overwrite SRS or invent sponsor confirm |
| **AC-ATT-EXPORT-09** | Attendance menu **not** CLOSED / `uat_done` stays false from this seat | Governance close only | Claim ATT CLOSED / Phase1 DONE |

## Residual disposition

| ID | Status | Note |
|----|--------|------|
| M2 backlog **P2-2** / matrix #30 governance | **CLOSED — ACCEPTED_AS_IS_P1** | AC-ATT-EXPORT-01..09 · no Dev |
| Matrix #30 runtime | Keep **PARTIAL** | Optional future QA dialog exercise — not required to close P2-2 |
| REPORTS #29 | **must_keep GWC LIVE** | Do not reopen |
| `R-MFD-M2-ATT-REPORTS-NO-DEDICATED-API` | Remains OBS | Orthogonal; export does not invent API |
| Stub fetch / wire GET records → XLSX | **DEFERRED_GĐ2_CANDIDATE** (or sponsor FR) | Not Dev from this seat |
| PDF / server audit export | **DEFERRED_GĐ2_CANDIDATE** | — |
| Attendance CLOSED / uat_done | **Forbidden** | — |

## Deferred GĐ2 candidate (IF sponsor later opens FR — do not invent confirm)

> **Not Phase-1.** Do **not** dispatch Dev until sponsor/product explicitly opens. Shape only for backlog readiness. **Do not overwrite** `docs/hrm/SRS.md` in this seat.

### Candidate FR (draft IDs — inactive)

| Candidate | Intent |
|-----------|--------|
| **FR-ATT-EXPORT-XLSX-01** | Wire dialog month range → `GET /attendance/records` (scoped) → client XLSX multi-sheet download; empty = honest toast; F5 N/A |
| **FR-ATT-EXPORT-PDF-01** | PDF deliverable for audit/payroll pack (server or client) with retention rules |
| **FR-ATT-EXPORT-API-01** | Nest export job + signed URL for large tenants (beyond browser XLSX) |

### ADD-only Diễn biến pointer

| Pointer | Note |
|---------|------|
| Host | ADD under new FR — **preserve** REPORTS #29 AC + honesty no dedicated reports API unless FR says otherwise |
| Happy | HRBP opens Báo cáo→Xuất → chọn tháng → Excel tải · sheets khớp filter |
| Fail sâu | Không dữ liệu kỳ · sai scope company → toast/4xx deterministic · không file giả |
| ba-docs | Only after sponsor opens — ADD 7 mục + ratio; **no** wipe existing FR |

## Actors / RACI (this seat)

| Role | Responsibility |
|------|----------------|
| ba-process | Verdict A + AC + GĐ2 candidates; no apps/** |
| pm | Intake PASS_TO_PM; stamp matrix/backlog P2-2 CLOSED ACCEPTED; **do not** dispatch Dev for export wire/PDF/API without sponsor FR |
| qa/qc | Keep #30 PARTIAL; do **not** NO-GO REPORTS for missing Nest export; FAIL only false LIVE download claim |
| ba-docs / sa / dev | **Idle** until sponsor opens FR-ATT-EXPORT-* |

## Open questions (non-blocking)

| Q | Owner | Trigger |
|---|-------|---------|
| Q-ATT-EXPORT-PAY-01 | Sponsor / ba-process | Does payroll GĐ1 require ATT Excel pack, or Báo cáo UI #29 enough? |
| Q-ATT-EXPORT-PDF-01 | Sponsor | Is PDF audit mandatory for enterprise, or XLSX sufficient? |

No answer required to close this P2-2 residual for Phase-1.

## Forbidden honesty

- No invent sponsor confirm
- No open Dev / no `apps/**`
- No invent Attendance CLOSED / Phase1 DONE / `uat_done=true`
- No overwrite `docs/hrm/SRS.md`
- No invent #30 LIVE
- No reopen REPORTS / REQUESTS / LEAVE / OT / CLOCK / RECORDS GWC without new FAIL
- No seed to fabricate export rows

## Matrix / backlog stamp (for PM)

| Artifact | Stamp |
|----------|-------|
| Matrix **#30** | **PARTIAL · ACCEPTED_AS_IS_P1** (this evidence) — not LIVE |
| M2 backlog **P2-2** | **CLOSED** governance · not ATT CLOSED |
| Matrix **#29** | **must_keep LIVE** REPORTS GWC |
| Attendance menu / `uat_done` | **unchanged** (not CLOSED / false) |

## completion_report

**Closed:** Governance decision for Attendance Báo cáo→Xuất (matrix **#30** / M2 **P2-2**). Verdict **A) ACCEPTED_AS_IS_P1**: Phase-1 accepts honest **client-side** export dialog under REPORTS #29 LIVE (no Nest export API, no PDF requirement); matrix stays **PARTIAL** (CTA+dialog shell; fetch stub → noData; download not proven). Measurable **AC-ATT-EXPORT-01..09**. Candidates FR-ATT-EXPORT-XLSX/PDF/API inactive (GĐ2). **No Dev opened.** REPORTS GWC must_keep. **Not** Attendance CLOSED / `uat_done`.

**Open:** Non-blocking Q-ATT-EXPORT-PAY-01 / Q-ATT-EXPORT-PDF-01; optional future QA dialog exercise or sponsor FR for wire GET→XLSX — not required for this close.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-PM-EXPORT-SPEC-CLOSE-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
verdict: ACCEPTED_AS_IS_P1
evidence_path: docs/qa/evidence/po-mfd-m2-att-export-01-spec.md

Action:
1) Bus INTAKE: close PO-MFD-M2-ATT-EXPORT-01 / matrix #30 / M2 P2-2 as ACCEPTED_AS_IS_P1 (client export dialog honesty OK; keep PARTIAL; no Nest export / PDF required Phase-1).
2) Stamp matrix #30 PARTIAL ACCEPTED_AS_IS_P1; M2 backlog P2-2 CLOSED governance; must_keep REPORTS #29 LIVE GWC.
3) Do NOT dispatch Dev (dev-fe/dev-be) for fetch wire / PDF / Nest export without sponsor opening FR-ATT-EXPORT-*.
4) Do NOT invent Attendance CLOSED / uat_done=true / #30 LIVE.
5) Continue QC on QA-RUNTIME if still open; then M3 next menu or remaining P2 stubs — export seat closed.
```

## evidence_path

`docs/qa/evidence/po-mfd-m2-att-export-01-spec.md`

## ack_status

**PASS_TO_PM**
