# QA L2.5 Evidence — P1-EX-QA-J-HRM-06-NIPIO-CLICK

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QA-J-HRM-06-NIPIO-CLICK` |
| from_role | `pm` |
| to_role | `qa` |
| execution_time_local | `2026-07-19 (UTC+7)` |
| runtime_url | `https://14-225-217-232.nip.io` |
| portal_route | `/command-center/hrm/attendance?companyId=main&_qa_jhrm06=20260719` |
| iframe | `/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| account | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| closes_condition | `C-RES03R3R3-04` (J-HRM-06 click deferred from QC GWC R3-R3) |
| prior_context | `docs/qa/evidence/p1-ex-qa-https-residual-03-r3-20260719.md` (attendance product gates PASS) |
| U65 | zero-seed · browser-only · no `pnpm seed:*` |
| screenshots | `docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719-leave-detail.png` · `…-profile.png` |

## Scope

**J-HRM-06** — Chấm công → bản ghi / yêu cầu (P-CC-07 → detail) per `docs/program/PROGRAM_JOURNEY_MAP.md`.

Fresh browser L2.5 on nip.io (not rubber-stamp of R6 archive).

## Commands (pack gate)

| Command | Purpose | Result | Exit |
|---------|---------|--------|------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719.md` | QC evidence-pack completeness | **PASS** (after pack polish) | **0** |
| Browser L2.5 J-HRM-06 click (Cursor browser / CDP) | Leave list → eye → request detail | **PASS** | n/a (interactive) |

## L2.5 journey matrix

| Journey | Click path | Result |
|---------|------------|--------|
| **J-HRM-06** | CC attendance → Nghỉ phép → Danh sách yêu cầu → eye → Chi tiết yêu cầu nghỉ phép | **PASS** |

## L0 Perimeter

| Target | HTTP |
|--------|------|
| `/command-center/hrm/attendance?companyId=main` | **200** |
| `/hr/attendance?portal=1&companyId=main` | **200** |
| `/api/hrm/` | **200** |

## Click path executed (browser)

1. Session already authenticated as `ceo@xe.vn` (`tokenLen=311`).
2. Navigate portal: `https://14-225-217-232.nip.io/command-center/hrm/attendance?companyId=main&_qa_jhrm06=20260719`.
3. Iframe mounts attendance overview (`#root` children **4**; menu «Chấm công»).
4. Sub-nav **Nghỉ phép** → leave management loads (Tổng yêu cầu **85**, Chờ duyệt **27**) — **no** RATE-429 / Sync ERROR.
5. Tab **Danh sách yêu cầu** → table rows include `Nguyen NhanSu0002` / `NV0002`.
6. Row action **eye** (`lucide-eye` / `handleOpenDetailModal`) → modal **«Chi tiết yêu cầu nghỉ phép»**.

### FE after action (mandatory)

| Checkpoint | Observed | Verdict |
|------------|----------|---------|
| Modal title | Chi tiết yêu cầu nghỉ phép | **PASS** |
| Employee | Nguyen NhanSu0002 · NV0002 · Ban Điều hành | **PASS** |
| Leave fields | Nghỉ phép năm · 2 ngày · 16/06/2026–17/06/2026 · Đã duyệt | **PASS** |
| Not-found copy | «Không tìm thấy nhân viên» **absent** | **PASS** |
| Late-list today | Đi muộn Hôm nay = **0** / «Không có dữ liệu» — alternate path N/A without seed | note |

Screenshot: `p1-ex-qa-j-hrm-06-nipio-20260719-leave-detail.png`

## Network 2xx (iframe PerformanceResourceTiming + session fetch)

| API | HTTP | Code | Notes |
|-----|------|------|-------|
| `GET /api/hrm/attendance/overview?company_id=main&year=2026` | **200** | — | overview widgets |
| `GET /api/hrm/attendance/leave-requests?company_id=main` | **200** | `HRM-LEAVE-200` | list source for click |
| `GET /api/hrm/employees?company_id=main&page=1&page_size=100` | **200** | — | leave tab companion |
| `GET /api/hrm/attendance/records?company_id=main&page=1&page_size=10` | **200** | `HRM-ATT-200` | attendance records contract |
| `GET /api/hrm/employees/00000000-0000-4000-8000-000000000002?company_id=main` | **200** | `HRM-EMP-200` | scope parity · name Nguyen NhanSu0002 · NV0002 |

Zero `127.0.0.1:54321` / `localhost:54321` / `rest/v1` observed on attendance+leave load path (aligned with residual-03 R3 PASS).

## Scope-parity / profile FE (supporting)

After leave detail, iframe navigated to:

`/hr/employees/00000000-0000-4000-8000-000000000002?portal=1&tenantId=main&companyId=main&_qa_jhrm06=20260719`

| Checkpoint | Result |
|------------|--------|
| Profile name / code | Nguyen NhanSu0002 / NV0002 |
| Role chip | COO · Đang làm việc |
| «Không tìm thấy nhân viên» | **absent** |
| Emp GET | **200** `HRM-EMP-200` |

Note: primary J-HRM-06 accept path this run = **leave list → eye → request detail modal** (journey «yêu cầu»). Overview late-list → profile (R6 historical) not re-clicked because late list today empty (U65 no seed). Emp profile FE verified as supporting scope_parity.

## Console / defects

- No RATE-429 on leave tab (prior `D-HRM-ATT-LEAVE-FETCH-STORM` class **not** reproduced on nip.io this run).
- No attendance Sync ERROR banner / «Kiểm tra lại».
- P0 console blockers: **0** observed for this journey.

## Overall QA Verdict

| Field | Value |
|-------|-------|
| **J-HRM-06** | **PASS** |
| **Verdict** | **PASS** |
| **ack_status** | `PASS_TO_PM` |

Closes QC condition **C-RES03R3R3-04** with fresh same-day browser click on nip.io.

**Not claimed:** Phase 1 Program DONE · PROD-READY · UF promote from NFR alone · re-open of residual-03 Auth/fallback gates (already PASS).

## Residual

No residual for **J-HRM-06** L2.5 click on nip.io this run (`C-RES03R3R3-04` product path closed).

- Late-list → profile alternate N/A today (Đi muộn = 0) — U65 no seed; leave-detail path is primary accept.
- Pack polish only (`P1-EX-QA-RES03-PACK-POLISH-02`) — product verdict unchanged.

## Handoff

```yaml
completion_report: |
  P1-EX-QA-J-HRM-06-NIPIO-CLICK PASS on https://14-225-217-232.nip.io.
  Click path: CC HRM attendance → Nghỉ phép → Danh sách yêu cầu → eye →
  modal Chi tiết yêu cầu nghỉ phép (Nguyen NhanSu0002 / NV0002 / Đã duyệt).
  Network: leave-requests 200 HRM-LEAVE-200; records 200 HRM-ATT-200;
  employees/:id 200 HRM-EMP-200 (scope parity). No not-found / no 429.
  Closes C-RES03R3R3-04. Evidence p1-ex-qa-j-hrm-06-nipio-20260719.md.
next_owner: qc
next_dispatch_prompt: |
  work_item_id: P1-EX-QC-J-HRM-06-NIPIO-CLOSE
  from_role: pm
  to_role: qc
  lane: governance
  entry_criteria: QA PASS evidence docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719.md;
    closes C-RES03R3R3-04 from docs/qa/evidence/p1-ex-qc-https-residual-03-r3-r3-20260719.md;
    U65 browser L2.5 on https://14-225-217-232.nip.io ceo@xe.vn companyId=main
  exit_criteria: QC GO or GWC with C-RES03R3R3-04 CLOSED; evidence
    docs/qa/evidence/qc-p1-ex-j-hrm-06-nipio-20260719.md; PASS_TO_PM;
    do NOT claim Phase1/PROD; do NOT promote UF from NFR alone
  ack_status: PASS_TO_PM
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-ex-qa-j-hrm-06-nipio-20260719.md
```
