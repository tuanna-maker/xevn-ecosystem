# Evidence — W1-B-01-QA-LEAVE-LIVE

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-QA-LEAVE-LIVE` |
| **prior** | `docs/qa/evidence/w1b-01-qa-leave.md` (L1 SKIP + R-QA-BROWSER) |
| **slice** | `docs/program/slices/DOC-ENT-P0-HRM-LEAVE.md` |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · HRM Vite `:8080` · hrm-api `:28001` · U65 zero-seed |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **ack_status** | `FAIL_TO_PM` |
| **test_log** | `docs/qa/evidence/w1b-01-qa-leave-live-test-log.md` + `.json` |

## spec_read_ack

- prior residual: `w1b-01-qa-leave.md` §2 L1 SKIP · R-QA-BROWSER
- slice: `DOC-ENT-P0-HRM-LEAVE.md` · FR-UC-H03 / FR-UC-M03
- api_contract: `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` §4.1–4.5
- hdsd_align: Attendance → tab **Nghỉ phép** · create / list · U65 · anti-idle clicks
- journeys: **J-HRM-06** (leave list surface) — blocked by FE mount

## 1. L0 stack

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:28001/api/hrm` | **200** |
| Portal `http://127.0.0.1:5173/` | **200** |
| HRM Vite `http://127.0.0.1:8080/` | **200** |
| `/api/hrm/health` | 404 (route absent — use `/api/hrm` root as L0) |

## 2. L1 live leave smoke (ceo · main)

Harness: `scripts/qa/_tmp-w1b-01-qa-leave-live-l1.mjs` → `_tmp-w1b-01-qa-leave-live-l1.json`

| Probe | HTTP | code | Notes | Verdict |
|-------|------|------|-------|---------|
| POST login | 201 | `XBOS-AUTH-200` | token OK | 🟢 |
| GET leave-requests `company_id=main` | **200** | `HRM-LEAVE-200` | **28** rows · display-ready keys present | 🟢 |
| GET leave-balance `employee_id` sample | **200** | `HRM-LEAVE-BAL-200` | `leave_type_label` + `source=default` | 🟢 |
| POST leave sick 5d **no** `attachment_url` (L1 fail_deep probe) | **400** | `HRM-LEAVE-VAL-ATT` | message requires attachment under `/api/hrm/files/` · **no seed** | 🟢 API rule |

Sample list row (first):

| Field | Value |
|-------|--------|
| `status` | `pending` |
| `status_label` | `Chờ duyệt` |
| `leave_type` | `LVT_01` |
| `leave_type_label` | `LVT_01` *(echo code — P2 label depth)* |
| `employee_display_name` | `CEO Tập đoàn` |
| `total_days_number` | `3` |

**L1 overall:** 🟢 PASS (closes prior SKIP)

## 3. Browser UF leave (U65 · HDSD · anti-idle)

Harness: `scripts/qa/_tmp-w1b-01-qa-leave-live-browser.mjs`  
Screens: `docs/qa/evidence/screens/w1b-01-qa-leave-live-20260803/`  
Raw: `docs/qa/evidence/_tmp-w1b-01-qa-leave-live-browser.json`

### Click path attempted

1. API login ceo → inject portal auth  
2. Goto `:5173` shell → fallback `/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
3. Attempt tab Nghỉ phép / create / list / F5  

**Observed:** `#root` childCount = **0** (whitescreen). Same on `:8080/hr/attendance`.

### Root cause (FE mount)

Vite transform **500** on lazy `Attendance.tsx`:

```text
Failed to resolve import "@/components/attendance/LeaveOverviewRecentPanel"
from "src/pages/Attendance.tsx". Does the file exist?
```

- Import present: `apps/web/hrm/src/pages/Attendance.tsx` L106  
- File on disk: **MISSING** (`LeaveOverviewRecentPanel*` glob = 0)  
- Employees route still mounts (rootChild=4) — leave surface isolated.

| Case | Result | Notes |
|------|--------|-------|
| A fail_deep (UI) | 🔴 BLOCKED | Create dialog unreachable; API VAL-ATT proven L1 only |
| B happy list/labels | 🔴 BLOCKED | No leave GET from browser; no UI labels |
| C F5 bind | 🔴 BLOCKED | F5 still whitescreen |
| idle_guard | 🟢 PASS | 15 timestamped click/actions (not idle viewport) |
| Seed | 🟢 none | U65 |

**J-HRM-06:** FAIL (mount)

## 4. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| L1 leave-balance + leave-requests | 🟢 PASS |
| L1 sick≥3 VAL-ATT | 🟢 PASS (API) |
| Browser UF A/B/C | 🔴 FAIL / BLOCKED-MOUNT |
| Display-ready list API | 🟢 fields present · 🟡 `leave_type_label` often = code `LVT_*` |
| Seed | 🟢 none |
| AUTH/EMP CLOSED | 🟢 not reopened |

**Overall:** `FAIL_TO_PM`

## 5. Residuals

| ID | Sev | Note | Owner |
|----|-----|------|-------|
| **R-LEAVE-FE-ATTENDANCE-MOUNT** | **P0** | Missing `LeaveOverviewRecentPanel` → Attendance/Leave whitescreen `:5173`/`:8080` | **dev-fe** |
| R-LEAVE-TYPE-LABEL-DEPTH | P2 | API `leave_type_label` echoes `LVT_01` instead of catalog VI name | defer / settings catalog |
| R-LEAVE-WF-FULL | P2 | Soft WF bridge (prior) | defer |
| R-QA-BROWSER | — | **superseded** by this WI FAIL (mount blocker named) | — |

## completion_report

**Closed:** Prior L1 SKIP closed — live GET leave-requests `HRM-LEAVE-200` (28) + leave-balance `HRM-LEAVE-BAL-200` as ceo/main; sick≥3 no attach → `HRM-LEAVE-VAL-ATT` 400; U78 test-log md+json; U65 no seed; idle_guard PASS.

**Open:** Browser UF leave **FAIL** — Attendance lazy import missing `LeaveOverviewRecentPanel`; Cases A/B/C + J-HRM-06 blocked; no UF 🟢.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT
role: dev-fe
priority: P0
mission: Restore Attendance page mount — file missing LeaveOverviewRecentPanel imported by apps/web/hrm/src/pages/Attendance.tsx (~L106). Restore or recreate component (HDSD leave overview recent panel) so /hr/attendance loads without Vite 500; must_keep LeaveTab create/list path; U65 no seed; CODE-MEMORY APPEND.
entry: docs/qa/evidence/w1b-01-qa-leave-live.md FAIL · Vite error Failed to resolve import LeaveOverviewRecentPanel · L1 leave API already PASS
exit: READY_FOR_QA · evidence path; /hr/attendance #root>0; leave tab visible
follow: QA retest W1-B-01-QA-LEAVE-LIVE (browser A/B/C + J-HRM-06) with test_log_required
cấm: seed · reopen AUTH/EMP CLOSED · claim UAT DONE
```

---

`ack_status: FAIL_TO_PM`  
`evidence_path: docs/qa/evidence/w1b-01-qa-leave-live.md`  
`next_owner: pm` → dispatch **dev-fe** `W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT`
