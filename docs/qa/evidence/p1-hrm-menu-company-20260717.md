# P1-HRM-MENU-QA-COMPANY — Phòng/Ban & Công ty (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-COMPANY` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` · `tenantId=xevn` |
| **menu** | Phòng/Ban & Công ty |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/company` |
| **spec_ref** | UC-HRM-03 · HRM-SC-01 · `HRM_MENU_DATA_LINKAGE_MATRIX.md` § `company` |
| **U65** | zero-seed · browser-only (API probe read-only with session Bearer; no seed) |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**PASS** — Group CEO sees **≥1 member unit** (holding + **4** subsidiaries = **5** companies) via XBOS `tenant-scope/group-member-units`. `GET /settings-catalogs?company_id=main` returns **200** `HRM-SET-200` with **76** catalogs (same session, before rate-limit contention). No ERROR banner / 409 / `54321` on successful load.

| Gate | Result |
|------|--------|
| L0 tab load (portal + HRM iframe) | **PASS** (first load + direct embed) |
| L2 member units visible (matrix AC) | **PASS** — 5/5 active |
| Network: `tenant-scope/group-member-units` | **PASS** — **200** `XBOS-TENANT-200` |
| Network: `settings-catalogs?company_id=main` | **PASS** — **200** `HRM-SET-200` · catalogs **76** |
| Network: `operating-units` / `company-subscription` | **PASS** — **200** `HRM-OPU-200` / `HRM-SUB-200` |
| Console P0 (error / dup-key) | **PASS** — 0 injected error/warn on Company UI |
| F5 / reload companies list | **PASS** — still 5 units (direct embed) |
| Tab Phòng ban | **FAIL residual** — always empty (FE stub) |
| Tab Tài khoản người dùng | **Noted** — empty state 0 members (no error toast) |

---

## Environment / session

| Item | Value |
|------|-------|
| Portal URL | `http://14.225.217.232:8088/command-center/hrm/company` |
| HRM iframe / direct | `http://14.225.217.232:8088/hr/company?portal=1&tenantId=xevn&companyId=main` |
| UI title | «Thông tin công ty» · «Quản lý thông tin doanh nghiệp» |
| Storage | `hrm_current_company_id=main` · `hrm_current_tenant_id=xevn` |
| Scope bar | BOD selected |

---

## Click path (U65)

1. Login `ceo@xe.vn` / `Xevn@2026` (session).
2. Command Center → HRM → **Phòng/Ban & Công ty** (`/command-center/hrm/company`).
3. Confirm iframe `…/hr/company?portal=1&tenantId=xevn&companyId=main`.
4. Tab **Quản lý công ty** — counters **5 / 5 / 0** + table rows.
5. Tab **Phòng ban** — empty «Chưa có phòng ban nào».
6. Tab **Tài khoản người dùng** — empty «Chưa có thành viên nào».
7. Direct embed reload (F5 equivalent) — companies list still **5**.

---

## L2 — Member units (matrix AC)

| # | Name | Code | Status |
|---|------|------|--------|
| 1 | Tập đoàn XeVN | Tập đoàn | Đang hiệu lực |
| 2 | Công ty Cổ phần Thương mại và Dịch vụ X.E | XE_TMDV | Đang hiệu lực |
| 3 | Công ty TNHH Du lịch Visun | VISUN | Đang hiệu lực |
| 4 | Công ty TNHH Du lịch X.E Việt Nam | XE_DU_LICH | Đang hiệu lực |
| 5 | Công ty TNHH X.E Việt Nam | XE_VIETNAM | Đang hiệu lực |

**PASS:** ≥ 1 member unit visible for Group CEO (`company_id=main`).

---

## Network / API (session Bearer, read-only)

| Endpoint | HTTP | Code | Latency | Notes |
|----------|------|------|---------|-------|
| `GET /api/xbos/tenant-scope/group-member-units` | **200** | `XBOS-TENANT-200` | ~122–773 ms (peak ~4.3s under load) | holding `xevn` + **4** members |
| `GET /api/hrm/operating-units` | **200** | `HRM-OPU-200` | ~506–1523 ms (peak ~4.1s) | len **5** |
| `GET /api/hrm/settings-catalogs?company_id=main` | **200** | `HRM-SET-200` | ~3860 ms | **76** catalogs |
| `GET /api/hrm/company-subscription?company_id=main` | **200** | `HRM-SUB-200` | ~617–1823 ms | subscription payload |
| `GET /api/hrm/admin/company-memberships?company_id=main` | **429** (probe) | `RATE-429` | — | env contention from parallel menu QA |

### Tenant-scope payload (abbrev)

- `holding`: Tập đoàn XeVN (`tenant_id=xevn`)
- `members[]`: XE_TMDV, VISUN, XE_DU_LICH, XE_VIETNAM

### Perf notes (P1 NFR, non-gating for this menu AC)

- Several primary GETs exceeded **3s** under concurrent `:8088` menu QA waves (settings-catalogs ~3.8s; operating-units peak ~4.1s; tenant-scope peak ~4.3s).
- Link: program `P1-HRM-NFR-1000-SA`.

---

## Console

| Check | Result |
|-------|--------|
| Injected `console.error` / `console.warn` on Company UI | **0** |
| Banner ERROR / `54321` / scope 409 on successful load | **none** |

---

## Residuals

| ID | Severity | Finding | Owner hint |
|----|----------|---------|------------|
| R1 | **P1** | `DepartmentManagement.fetchDepartments` sets `setDepartments(data \|\| [])` with **undeclared `data`** — no API call; tab always «Chưa có phòng ban nào» | `dev-fe` |
| R2 | P2 | Tab «Tài khoản người dùng» shows **0** members (empty OK if API 200 empty; not primary matrix AC for this menu) | defer / `dev-be` if membership seed expected |
| R3 | Env | Parallel full-menu QA → intermittent portal **HTTP 429** banner / stuck «Đang tải…»; retest cool-down recovers tenant-scope **200** | DevOps/QA serialize waves |

---

## Spec mapping

| Spec | Expected | Observed |
|------|----------|----------|
| UC-HRM-03 / matrix `company` | Portal tenant-scope + member units | **PASS** — 5 companies from `group-member-units` |
| HRM-SC-01 | Settings catalogs overview reachable for company scope | **PASS** — `GET settings-catalogs` **200** / 76 catalogs |
| U65 | No seed in acceptance | **PASS** — browser + read-only probe only |

---

## Handoff

```text
work_item_id: P1-HRM-MENU-QA-COMPANY
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-hrm-menu-company-20260717.md
completion_report: PASS — Company menu UC-HRM-03/HRM-SC-01; 5 member units; tenant-scope 200; settings-catalogs 200/76. Residual P1: DepartmentManagement stub (no fetch). Env 429 under parallel QA noted.
next_owner: pm
next_dispatch_prompt: PM intake P1-HRM-MENU-QA-COMPANY PASS_TO_PM. Mark company menu PASS in program roster. Dispatch dev-fe P1-HRM-MENU-COMPANY-DEPT-STUB — fix DepartmentManagement.fetchDepartments to call real departments/org API (spec org DM §1–6); then continue next open P1-HRM-MENU-QA-* wave. Optional devops note: throttle parallel :8088 menu QA to avoid RATE-429.
pm_dispatch_hint: P1-HRM-MENU-COMPANY-DEPT-STUB — DepartmentManagement uses undeclared `data`; always empty Phòng ban tab
```
