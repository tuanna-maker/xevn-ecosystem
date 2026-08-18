# Evidence — PO-HRM-BP-ATT-SIGN-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-FE-01` |
| **from_role** | dev-fe |
| **to_role** | qa |
| **date** | 2026-08-05 |
| **lane** | execution · UC-BP-ATT-11 |
| **prior_handoff** | `po-hrm-bp-att-sign-qa-01.md` PASS_WITH_OBS · `po-hrm-bp-att-sign-be-01.md` READY |
| **ack_status** | **READY_FOR_QA** |
| **Attendance CLOSED / product GO / Face LIVE / remaster DONE** | **not claimed** |

---

## spec_read_ack

| Artifact | Path / § |
|----------|----------|
| **SRS** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-11 · BR-BP-TS-02 |
| **TechSpec** | `TECHSPEC_HRM_ENTERPRISE.md` §6.4 · F-ATT-WF-SIGN |
| **API** | F-ATT-WF-SIGN-01/02 · F-ATT-SHEET-02 |
| **UF** | `po-hrm-bp-att-sign-uf-ba-01.md` AC-ATT-SIGN-UF-01..07 |
| **change_mode** | ADD |
| **must_keep** | `att-sheets-precision` list chrome · vi-VN dates · U65 no seed |

---

## Implementation summary

| Deliverable | Path |
|-------------|------|
| API client | `apps/web/hrm/src/integrations/hrmApi.ts` — `getAttendanceSheetById`, `listAttendanceSheetSignatures`, `createAttendanceSheetSignature`, `closeAttendanceSheet` |
| Sign panel UI | `apps/web/hrm/src/components/attendance/AttendanceSheetSignPanel.tsx` |
| Wire (sheet detail) | `apps/web/hrm/src/pages/Attendance.tsx` — weekly detail after row click; list cột **Trạng thái** (nhãn VI) |
| Error copy | `apps/web/hrm/src/lib/apiError.ts` — `HRM-ATT-SIGN-INCOMPLETE`, `HRM-ATT-SHEET-STATE`, `HRM-ATT-SHEET-LOCKED` |
| CODE-MEMORY | UC-BP-ATT-11 APPEND on `Attendance.tsx` + `AttendanceSheetSignPanel.tsx` |

### UI / testid (QA)

| testid | Mục đích |
|--------|----------|
| `att-sign-panel` | Panel Ký chốt trên chi tiết bảng |
| `att-sign-panel-hold-draft` | Nháp — gợi ý gửi chờ ký trước |
| `att-sign-steps-list` | Danh sách bước NV / QL / HCNS |
| `att-sign-step-employee` / `direct_manager` / `hr_admin` | Từng bước |
| `att-sign-confirm-{persona}` | Nút **Xác nhận** |
| `att-sign-close-sheet` | **Chốt bảng công** (disabled khi `can_close=false`) |
| `att-sign-sheet-status-badge` | Badge trạng thái VI trên panel |
| `att-sheet-status-{id}` | Trạng thái trên list |

### Luồng FE

1. List `att-sheets-precision` → click kỳ → weekly detail + panel.
2. Sheet **`submitted`**: `GET …/signatures` → hiển thị bước; **Xác nhận** → `POST …/signatures` → refetch panel + invalidate list.
3. Khi `can_close`: **Chốt bảng công** → `POST …/close` → badge **Đã chốt** + F5 list/detail.
4. Sheet **`draft`**: panel honesty (không gọi sign trên nháp).

**Scope:** `company_id` query + headers qua `requestHrm` / `normalizeHrmApiListCompanyId` (cùng pattern sheets list).

---

## Verify (dev-fe)

```bash
cd apps/web/hrm
pnpm exec tsc --noEmit
```

| Check | Result |
|-------|--------|
| Typecheck | **PASS** — `pnpm exec tsc --noEmit` exit **0** |
| Browser UF | **Deferred QA** — U65 cần sheet `submitted` từ UF-HRM-16 / J-HRM-06b trước happy path |

---

## completion_report

**Closed:** FE wire panel Ký chốt + API mutate; NV→QL→HCNS ladder UI; post-mutation refetch list + signatures; vi-VN status labels; testids for QA.

**Open:** Full AC-ATT-SIGN-UF-01..07 browser (QA `PO-HRM-BP-ATT-SIGN-QA-02`); prerequisite submitted sheet from FE chain (no seed).

**not promoted:** 🟢 UF-HRM-ATT-SIGN · J-HRM-06c · Attendance CLOSED.

---

## next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | `qa` |

```text
work_item_id: PO-HRM-BP-ATT-SIGN-QA-02
role: qa
read_first: docs/qa/evidence/po-hrm-bp-att-sign-fe-01.md · po-hrm-bp-att-sign-uf-ba-01.md
entry_criteria: FE READY_FOR_QA; L0 PASS; U65 zero-seed
exit_criteria: UF-HRM-ATT-SIGN AC-ATT-SIGN-UF-01..07 browser when sheet submitted exists; Network POST signatures + POST close; FE post-mutation + F5; static check att-sign-panel on submitted sheet
persona: ceo@xe.vn / Xevn@2026 · company_id=main
cấm: seed · claim Attendance CLOSED without full UF chain
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-qa-02.md
ack_status target: PASS_TO_PM or PASS_WITH_OBS if still no submitted sheet U65
```

---

*End evidence PO-HRM-BP-ATT-SIGN-FE-01 · ack_status: **READY_FOR_QA***
