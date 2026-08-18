# P1-HRM-MENU-QA-EMPLOYEES — QA evidence

- Date: 2026-07-17
- Environment: `http://14.225.217.232:8088`
- Persona: Group CEO `ceo@xe.vn` (`tenant_id=xevn`, `company_id=main`)
- Scope: P-CC-03 · J-HRM-02 · UF-HRM-01/03
- Spec refs: `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 employees and §4.1; `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` §3–4
- Method: U65 browser-only login → HRM menu → Nhân sự list → scroll to final row → click employee profile. No seed, direct DB mutation, or API-created test state.

## Verdict

**PASS_TO_PM — functional and duplicate-key regression gates passed.**

P-CC-03 and J-HRM-02 are promotable. A separate P1 performance/deduplication residual remains open because profile navigation launched two complete 12-page employee-list request chains and duplicated the detail request.

## Results

| Gate | Evidence | Verdict |
|---|---|---|
| Login / scope | Portal login succeeded as Group CEO; employee iframe used `tenantId=xevn&companyId=main` | PASS |
| P-CC-03 list | UI displayed `Danh sách nhân viên trong công ty - 1107`; API pagination requested pages 1–12 with `page_size=100`; no ERROR banner, 409, or `54321` dependency | PASS |
| Scroll/pagination | Scrolled the employee list container from top to `scrollTop=53585.6 / scrollHeight=53924`; final rows `NV0003`, `NV0002`, `NV0001` rendered | PASS |
| Duplicate React keys | 1,107 rendered table rows; 1,107 React fiber keys; 1,107 unique keys; zero null or duplicate keys | PASS |
| Console | Captured `error` and `warn` during pagination, scroll, and profile navigation: **0 entries**; duplicate-key warning matches: **0** | PASS |
| J-HRM-02 | Clicked `NV0001 / Nguyen NhanSu0001`; iframe navigated to `/hr/employees/00000000-0000-4000-8000-000000000001` | PASS |
| Detail scope parity | `GET /api/hrm/employees/00000000-0000-4000-8000-000000000001?company_id=main` returned **200**; profile rendered employee data, not “Không tìm thấy nhân viên” | PASS |
| Profile content | Personal, address, emergency contact, work, skills, work-history, attendance-awareness, and work-effectiveness sections rendered | PASS |
| Profile tabs | No elements with `role=tab` exist on this profile implementation; content is a single scroll page, so tab switching was not applicable | N/A |

## Performance observations

### Initial list

- 12 sequential employee requests (`include_archived=true`, pages 1–12).
- Request window: **11,719 ms**.
- Slowest page: page 8 at **2,053 ms**, slightly above the program `<2s` target.
- The UI rendered all 1,107 rows and remained usable through bottom scroll.

### Profile navigation residual

- Detail request was duplicated: **2 calls** (720 ms and 1,500 ms), both 200.
- Profile navigation started **24** `include_archived=false` list requests: two complete page 1–12 chains.
- Duplicate list-chain window: **9,967 ms**.
- Slow calls included page 1 at **3,851 ms** and page 2 at **2,483 ms**.

Defect: **D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01 (P1 performance)** — opening one employee profile must not refetch the full 1,107-row directory twice or duplicate the same detail request.

## Visual evidence

- List top: `C:\Users\ADMIN\AppData\Local\Temp\cursor\screenshots\p1-hrm-menu-employees-list-20260717.png`
- List bottom after scroll: `C:\Users\ADMIN\AppData\Local\Temp\cursor\screenshots\page-2026-07-17T01-57-40-478Z.png`
- Employee profile: `C:\Users\ADMIN\AppData\Local\Temp\cursor\screenshots\p1-hrm-menu-employees-profile-20260717.png`

## Handoff packet

- `work_item_id`: `P1-HRM-MENU-QA-EMPLOYEES`
- `from_role`: `qa`
- `to_role`: `pm`
- `entry_criteria`: P-CC-03 employee menu deployed on `:8088`; Group CEO account available; U65 browser-only
- `exit_criteria`: 1,100+ list visible; scroll/pagination verified; zero duplicate React-key warnings; J-HRM-02 detail 200 with `company_id=main`
- `completion_report`: Functional scope closed: P-CC-03, 1,107-row scroll/pagination, zero duplicate-key warning, and J-HRM-02 scope parity all PASS. Residual P1 request deduplication/performance defect remains open.
- `evidence_path`: `docs/qa/evidence/p1-hrm-menu-employees-20260717.md`
- `next_owner`: `dev-fe`
- `next_dispatch_prompt`: `work_item_id: D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01; investigate and fix HRM employee profile navigation on :8088 so one list-row click issues one GET /employees/:id and does not launch two full page=1..12 employee-list chains. Read P1-HRM-FULL-MENU-QA-PROGRAM.md, HRM_MENU_DATA_LINKAGE_MATRIX §2.1/§4.1, and evidence docs/qa/evidence/p1-hrm-menu-employees-20260717.md. Preserve P-CC-03/J-HRM-02 behavior and 1107/1107 unique React keys. Exit: targeted tests plus browser evidence showing detail 200, no duplicate key warnings, and request count deduplicated; hand off READY_FOR_QA.`
- `ack_status`: `PASS_TO_PM`
