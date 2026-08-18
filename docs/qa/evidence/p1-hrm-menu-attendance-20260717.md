# P1-HRM-MENU-QA-ATTENDANCE — Chấm công (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-ATTENDANCE` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **spec_ref** | P-CC-07 · J-HRM-06 · UF-HRM-05 |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **U65** | zero-seed · browser-only (API probe read-only with session Bearer) |
| **ack_status** | **PASS_TO_PM** (verdict **FAIL**) |

---

## Verdict

**FAIL** — Overview widgets load (no 1970 dates) and `GET /attendance/records` returns **13103** rows with valid 2026 timestamps, but **Nghỉ phép / leave-requests** path is broken in FE under load: refetch storm → `RATE-429` → UI error banner «Không thể tải danh sách đơn nghỉ phép». Attendance sheets tab also storms `attendance-sheets` (×62 in one session). L2.5 employee drill blocked by 429 after storm.

| Gate | Result |
|------|--------|
| L0 route load / no Sync ERROR / no 54321 | **PASS** (shell + iframe) |
| L2 overview widgets / charts | **PASS** |
| No `01/01/1970` dates | **PASS** |
| Tabs present (Tổng quan / Chấm công / Ca / Quản lý đơn / Nghỉ phép / Báo cáo / Thiết lập) | **PASS** |
| L2 records tab UI (today filter) | **PASS** empty-state for `17/07/2026` (API has historical rows) |
| Network `GET /attendance/records` 2xx | **PASS** `HRM-ATT-200` · total **13103** · ~1.0–1.8s |
| Network `GET /leave-requests` usable from FE | **FAIL** — UI toast error; fetch storm + `RATE-429` |
| Console (iframe) | **FAIL** — repeated `Error fetching leave requests: RATE-429` |
| Perf / duplicate calls | **FAIL** — `attendance-sheets` ×**62**; leave-requests dozens (AbortError + 429) |
| L2.5 J-HRM-06 list→employee | **FAIL / blocked** — emp GET hit `RATE-429` after storm (one earlier leave-row emp **200** `HRM-EMP-200` before storm) |

---

## Environment / session

| Item | Value |
|------|-------|
| Portal URL | `http://14.225.217.232:8088/command-center/hrm/attendance` |
| HRM iframe | `http://14.225.217.232:8088/hr/attendance?portal=1&tenantId=xevn&companyId=main&…` |
| Scope | `hrm_current_company_id=main` |
| Click path | Login `ceo@xe.vn` → redirect attendance → tabs Overview / Chấm công(records) / Nghỉ phép |

Screenshot:

- Leave error over overview: `docs/qa/evidence/p1-hrm-menu-attendance-leave-error-20260717.png`

---

## L0 / L2 — Overview (UF-HRM-05 widgets)

Observed iframe text (overview):

- Scope: «Tất cả đơn vị (rollup)»
- KPI: Đi muộn/về sớm hôm nay **0**; Thực tế đã nghỉ tuần này **38**; Kế hoạch nghỉ tuần sau **29**
- Charts: leave by month / department / type (annual, sick, LVT_*)
- Date window labels: `(01/01/2026 - 31/12/2026)` — **not** 1970
- Network: `GET /api/hrm/attendance/overview?company_id=main&year=2026` → **200** `HRM-ATT-OVERVIEW-200` · ~486–1031ms

No HRM API Sync ERROR banner on initial overview load.

---

## L2 — Chấm công / records

| Check | Evidence |
|-------|----------|
| Tab content | «Dữ liệu chấm công» · date **17/07/2026** · counters all **0** · table «Không có dữ liệu chấm công» |
| Interpretation | FE filters by selected day (`useAttendanceRecords` `from_date=today`); empty today ≠ empty API |
| API (Bearer session) | `GET /api/hrm/attendance/records?company_id=main&page_size=20&page=1` → **200** `HRM-ATT-200` · nested `data.total=13103` |
| Sample row | `id=bbfc8ddf-…` · `attendance_date=Wed Jun 10` · `check_in_at=2026-06-10T02:00:00.000Z` · `status=present` |
| 1970 | **none** in sample payload |

Sheets submenu («Bảng chấm công chi tiết»): UI «Tổng số bản ghi: 0» while Network showed **`/api/hrm/attendance/attendance-sheets?company_id=main` ×62** in one page session (many **>3s**, up to ~4.6s).

---

## L2 — Nghỉ phép / leave-requests (**FAIL**)

### UI

- Banner / toast: **«Lỗi — Không thể tải danh sách đơn nghỉ phép»** (+ «Too many requests» when 429)
- Screenshot: `p1-hrm-menu-attendance-leave-error-20260717.png`

### Network (fetch intercept on Nghỉ phép click)

| Observation | Detail |
|-------------|--------|
| Correct URL | `/api/hrm/attendance/leave-requests?company_id=main` (matches `listLeaveRequests` — no `page`/`year`) |
| Storm | Dozens of parallel calls; many `AbortError: signal is aborted without reason` |
| 429 | Multiple `RATE-429` «Too many requests» (e.g. 2026-07-17T02:01:20Z … 02:02:06Z) |
| Occasional 200 | `HRM-LEAVE-200` · `total=85` but latency **~18–28s** when not rate-limited |
| Invalid probe (not FE) | `?page=1&page_size=20` → **400** `HRM-VAL-001` «property page should not exist» (FE does **not** send page — noted for contract only) |

### Console (iframe hook)

Repeated:

```text
Error fetching leave requests: {"code":"RATE-429","status":429,"name":"ApiClientError"}
```

### Likely root cause (code review — for Dev-FE)

`useLeaveRequests.ts`:

- `const h = (key) => t(...)` recreated every render
- `fetchRequests` `useCallback(..., [currentCompanyId, toast, t, h])`
- `useEffect(() => { void fetchRequests(); }, [fetchRequests])`

→ unstable `h`/`toast` identity can retrigger fetch every render → abort prior → storm → rate limit.

Same pattern risk in `useAttendanceSheets.ts` (`h` + `fetchSheets` deps + `useEffect([fetchSheets, enabled])`) explaining sheets ×62.

Also dual consumers: `useLeaveRequests` + `useLeaveRequestsData` both call `listLeaveRequests`.

---

## L2.5 — J-HRM-06 (record / leave → employee)

| Step | Result |
|------|--------|
| Records list has rows (API) | **PASS** total 13103 |
| `GET /employees/{id}?company_id=main` after storm | **FAIL** `RATE-429` (emp `89604c9b-…`, ~9750ms) |
| Earlier leave row#2 emp `3796d949-…` | **200** `HRM-EMP-200` (before storm; name null in probe parse) |
| Browser click list→profile | **Not completed** — leave UI error + rate limit blocked clean drill |

**Overall J-HRM-06 this wave: FAIL** (blocked by product fetch storm / 429; not scope_parity 404).

---

## Defects opened

| ID | Severity | Summary | Owner hint |
|----|----------|---------|------------|
| **D-HRM-ATT-LEAVE-FETCH-STORM** | **P0** | Leave tab refetch loop → Abort×N + RATE-429 → UI cannot load leave list | `dev-fe` (`useLeaveRequests.ts` unstable deps; coalesce RQ) |
| **D-HRM-ATT-SHEETS-FETCH-STORM** | **P1** | `attendance-sheets` called ×62 / session, many >3s | `dev-fe` (`useAttendanceSheets.ts`) |
| **D-HRM-ATT-LEAVE-LATENCY** | **P1** | Cold `leave-requests` **18–28s** even on 200 (scale risk vs NFR 1000 users) | `dev-be` + SA NFR |

Residual note: parallel menu-QA waves on same `:8088` amplify 429 — but Abort storm is reproducible from single Leave tab open with fetch intercept.

---

## What passed (do not regress)

- Overview widgets + overview API under `company_id=main`
- No 1970 epoch dates on overview / records samples
- Records list API contract `HRM-ATT-200` with nested pagination
- Tab chrome / menu highlight «Chấm công» current

---

## Handoff

```yaml
completion_report: |
  P1-HRM-MENU-QA-ATTENDANCE FAIL on :8088. Overview+records API PASS (13103, no 1970).
  Leave tab FAIL: fetch storm → RATE-429 → error «Không thể tải danh sách đơn nghỉ phép».
  attendance-sheets ×62 P1. J-HRM-06 blocked by 429. Evidence p1-hrm-menu-attendance-20260717.md.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: D-HRM-ATT-LEAVE-FETCH-STORM
  from_role: pm | to_role: dev-fe
  entry_criteria: evidence docs/qa/evidence/p1-hrm-menu-attendance-20260717.md; U65 no seed
  fix: stabilize useLeaveRequests (and useAttendanceSheets) — remove unstable `h`/toast from
    useCallback deps that retrigger useEffect; React Query/singleflight; abort only on unmount
  exit_criteria: Nghỉ phép tab loads leave list without RATE-429; Network leave-requests ≤2 in-flight;
    attendance-sheets not ×N loop; jest regression on hook deps; READY_FOR_QA
  evidence_path: docs/qa/evidence/d-hrm-att-leave-fetch-storm-20260717.md
  then: QA retest P1-HRM-MENU-QA-ATTENDANCE (J-HRM-06 + UF-HRM-05 leave tab)
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-hrm-menu-attendance-20260717.md
```
