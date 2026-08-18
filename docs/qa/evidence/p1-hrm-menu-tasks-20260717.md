# P1-HRM-MENU-QA-TASKS — Công việc (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-TASKS` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **menu** | Công việc |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/tasks` |
| **spec_ref** | HRM-OP-02 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` § tasks · `GET /operations/tasks` |
| **U65** | zero-seed · browser-only (read-only API probe with session Bearer; no seed) |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**PASS** — Menu Công việc loads under Group CEO rollup (`company_id=main`): L0 clean, list hydrated from live API, console without P0 duplicate-key, primary Network 2xx, status tabs filter correctly, F5 stable.

| Gate | Result |
|------|--------|
| **L0** tab load / no ERROR banner / no 409 / no `54321` | **PASS** |
| **L2** UI data + empty/200 semantics | **PASS** — «Hiển thị 1-10 / **22** bản ghi»; tabs Totals match API |
| **Console** P0 (dup React key / red hard errors) | **PASS** — 0 same-key; a11y DialogTitle noise only when dialog path exercised |
| **Network** `GET /api/hrm/operations/tasks` | **PASS** — **200** `HRM-OPS-200`; **275–1660 ms** (no >3s primary) |
| **Functional** status filter + pagination | **PASS** — «Đang thực hiện» → **5/5** rows all «Đang thực hiện»; page 2 → «11-20 / 22» |
| **L2.5 J-*** | **N/A** — no dedicated J-HRM tasks list→detail in `PROGRAM_JOURNEY_MAP.md` (HRM-OP-02 = list) |
| **Mutate CRUD** | **Out of scope** this wave (load QA) |

---

## Environment / session

| Item | Value |
|------|-------|
| Portal URL | `http://14.225.217.232:8088/command-center/hrm/tasks` |
| HRM iframe | `http://14.225.217.232:8088/hr/tasks?portal=1&tenantId=xevn&companyId=main&_v=…` |
| UI title | «Quản lý công việc» |
| Scope bar | «Tất cả đơn vị (rollup)» |
| Storage | `hrm_current_company_id=main` |
| Auth | sessionStorage `xevn.portal.accessToken` |

Screenshot (agent capture): Tasks list with 22 records / status tabs — `page-2026-07-17T01-56-10-723Z.png` (local agent temp).

---

## L0 / L2 UI

| Check | Observation |
|-------|-------------|
| Heading | Quản lý công việc |
| Subtitle | Theo dõi và quản lý các công việc trong công ty |
| Pagination | Hiển thị 1-10 / **22** bản ghi · Trang 1 / 3 |
| Status tabs | Tất cả (22) · Chờ thực hiện (14) · Đang thực hiện (5) · Đang đánh giá (0) · Đang tạm dừng (2) · Hoàn thành (1) · Đã hủy (0) |
| Sample rows | `seed:p1-hrm-h22-operations-density:*`, `QA-H1-7-TASKS-RETEST-*`, Seed BHXH/chấm công, `P1-CLOSE-BE-W4 probe task` |
| Sync ERROR / 54321 / 409 banner | **None** |

### F5

Full `location.reload()` → iframe rehydrated; again **22** bản ghi, heading present, `companyId=main`, no Sync ERROR.

---

## Network (iframe fetch, after clean F5)

| Endpoint | Calls | Duration | Status |
|----------|-------|----------|--------|
| `GET /api/hrm/operations/tasks?company_id=main&page=1&page_size=100` | **1** | **667 ms** | **200** (observed live) |
| `GET /api/hrm/settings-catalogs` | 1 | ~1417 ms | 2xx |
| `GET /api/hrm/employees` | 1 | (support hydrate) | 2xx |

**Earlier churn note (non-gating):** during mid-session iframe remount testing, saw `employees` ×12 and `settings-catalogs` ×2 (~1.8–2.3s). Clean F5 settled to ×1 — align with P1-HRM-PERF / mount-dup program if regresses.

No request > **3s** on clean load.

---

## API cardinality (read-only, session Bearer)

`GET /api/hrm/operations/tasks?company_id=main&page_size=100`

| Metric | Value |
|--------|-------|
| HTTP | **200** |
| code | **HRM-OPS-200** |
| total | **22** |
| `data.data` length | **22** |
| unique `id` | **22** |
| dup ids | **0** |
| Status mix | `todo` 14 · `in_progress` 5 · `blocked` 2 · `done` 1 |
| Latency (probe) | **275 ms** |

Duplicate **titles** exist (`P1-CLOSE-BE-W4 probe task` ×4, `Rà soát KPI tuần` ×5, …) with **distinct UUIDs** — seed/density, not React key collision.

Density vs matrix (≥5 tasks / company): **PASS** at group rollup (22).

---

## Console

| Class | Count / note |
|-------|----------------|
| Duplicate React key (`Encountered two children` / same key) | **0** |
| Fiber page-1 keys | **10/10** unique |
| Fiber page-2 keys | **10/10** unique (same titles, different ids) |
| P2 a11y | Radix `DialogContent` missing `DialogTitle` / Description — only when dialog interaction attempted; **non-gating** for list load |

---

## Functional checks

| Step | Result |
|------|--------|
| Status tab «Đang thực hiện (5)» (pointer/mousedown path) | Tab `data-state=active`; «Hiển thị **1-5 / 5** bản ghi»; all 5 rows status «Đang thực hiện» |
| Pagination page **2** | «Hiển thị **11-20 / 22** bản ghi» |
| Row title click / first action buttons | No separate detail route (list+dialog pattern); HRM-OP-02 list AC satisfied |

---

## Residuals (non-blocking)

| ID | Severity | Note |
|----|----------|------|
| `D-HRM-TASKS-A11Y-DIALOG-01` | P2 | Radix DialogTitle/Description warn if/when edit dialog opens |
| `D-HRM-TASKS-SUPPORT-FETCH-CHURN` | P1 note | Support calls (`employees`, `settings-catalogs`) can multiply under remount — track under existing PERF/mount program; clean F5 = ×1 |

---

## Handoff

- **completion_report:** P1-HRM-MENU-QA-TASKS **PASS**. L0+L2+console P0+Network+functional filter/pagination+F5 closed for Công việc / HRM-OP-02 on `:8088`. No P0 residual. P2 a11y + optional support-fetch churn noted.
- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-tasks-20260717.md`
- **next_dispatch_prompt:** |
  PM: Mark `P1-HRM-MENU-QA-TASKS` PASS on program roster. Continue remaining HRM menu QA wave-3+ (Processes / Internal services / Tools) or dispatch `P1-HRM-FULL-MENU-QC` only after 17/17 menu evidence. Optional later: Dev-FE `D-HRM-TASKS-A11Y-DIALOG-01` (Radix DialogTitle on TaskFormDialog) — not gate-blocking.
