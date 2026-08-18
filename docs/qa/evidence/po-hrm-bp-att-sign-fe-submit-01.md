# Evidence — PO-HRM-BP-ATT-SIGN-FE-SUBMIT-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-FE-SUBMIT-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-08-05 |
| **lane** | execution · FR-UC-BP-ATT-10 funnel · UF-HRM-ATT-SIGN prereq |
| **prior** | `po-hrm-bp-att-sign-qa-02.md` PASS_WITH_OBS (submitButtonCount=0) |
| **ack_status** | **READY_FOR_QA** |
| **u65_zero_seed** | true |
| **attendance_closed** | **false** |
| **product_go** | **false** |

---

## spec_read_ack

| Artifact | Path / § |
|----------|----------|
| **SRS** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-10** · Luồng #4 chờ ký → UC-BP-ATT-11 |
| **TechSpec** | `TECHSPEC_HRM_ENTERPRISE.md` §6.4.1 · F-ATT-SHEET-01 funnel → `submitted` |
| **API** | `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-SHEET-01 (canonical Nest: `POST …/attendance-sheets/{id}/submit`) |
| **UF** | `po-hrm-bp-att-sign-uf-ba-01.md` prerequisite §4 item 2 |
| **change_mode** | ADD |
| **must_keep** | `att-sheets-precision` · `AttendanceSheetSignPanel` · U65 no seed |

---

## Implementation summary

| Deliverable | Path |
|-------------|------|
| FE client | `apps/web/hrm/src/integrations/hrmApi.ts` — `submitAttendanceSheetForSign` |
| UI control | `AttendanceSheetSignPanel.tsx` — **Gửi chờ ký** on hold-draft (`draft`/`open`) |
| Wire | `Attendance.tsx` — unchanged props; `onSheetMutated` → list refetch |
| BE (P0 dependency) | `POST /api/hrm/attendance/attendance-sheets/:sheetId/submit` — `attendance-sheet-sign.service.ts` + `attendance.controller.ts` (MVP status transition; full aggregate lines deferred) |
| CODE-MEMORY | APPEND UC-BP-ATT-10/11 on panel, Attendance.tsx, sign service |

### testid (QA)

| testid | Mục đích |
|--------|----------|
| `att-sheet-submit` | Nút **Gửi chờ ký** trên hold-draft |
| `att-sign-panel-hold-draft` | Trước submit |
| `att-sign-panel` | Sau submit + refetch (`status=submitted`) |

### U65 click path (expected QA-03)

1. Login `ceo@xe.vn` → **Chấm công** → **Bảng chấm công** → click kỳ `draft`.
2. **Gửi chờ ký** (`att-sheet-submit`) → `POST …/attendance-sheets/{id}/submit?company_id=main` **200**.
3. **FE sau 2xx:** list cột trạng thái **Chờ ký** · panel chuyển `att-sign-panel` (không còn chỉ hold-draft).
4. **F5:** `status=submitted` persisted · `GET …/signatures` **200**.
5. Tiếp UF-HRM-ATT-SIGN sign ladder (FE-01).

**Scope:** `company_id` query + `requestHrm` headers (parity list sheets).

---

## Verify (dev-fe)

```bash
cd apps/web/hrm
pnpm exec tsc --noEmit
```

| Check | Result |
|-------|--------|
| Typecheck | **PASS** exit **0** |
| hrm-api controller jest | **PASS** (suite green after mock `submitAttendanceSheetForSign`) |

---

## completion_report

**Closed:** FR-UC-BP-ATT-10 funnel control on sheet detail; FE submit client; Nest submit route (MVP draft|open→submitted); post-mutation refetch; testids for QA-03.

**Open:** Full F-ATT-SHEET-01 payroll line aggregation (line_count=0 MVP); QA browser UF-01..07 sign steps; product GO / Attendance CLOSED not claimed.

---

## next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | `qa` |
| **ack_status** | **READY_FOR_QA** |

```text
work_item_id: PO-HRM-BP-ATT-SIGN-QA-03
role: qa
read_first: docs/qa/evidence/po-hrm-bp-att-sign-fe-submit-01.md · po-hrm-bp-att-sign-qa-02.md · po-hrm-bp-att-sign-uf-ba-01.md
entry_criteria: L0 PASS; hrm-api :28001; U65 zero-seed; FE submit wired
exit_criteria: UF-HRM-ATT-SIGN — draft row → att-sheet-submit → 2xx → att-sign-panel → F5 submitted; then AC-ATT-SIGN-UF-01 partial/full per persona; evidence block per qa-fe-outside-browser-gate.mdc
persona: ceo@xe.vn / Xevn@2026 · company_id=main
UF/J: UF-HRM-ATT-SIGN · J-HRM-06c
hdsd_align: Chấm công → Bảng chấm công → kỳ → Gửi chờ ký → Ký chốt
cấm: seed · claim Attendance CLOSED
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-03.md
```
