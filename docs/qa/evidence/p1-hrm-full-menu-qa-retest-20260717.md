# P1-HRM-FULL-MENU-QA-RETEST-01 — Full-menu fix-bundle retest

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-QA-RETEST-01` |
| **date** | 2026-07-17 |
| **env** | `http://14.225.217.232:8088` |
| **deploy SoT** | `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-20260717.md` (HEAD `ea6ea06`) |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · browser-only (no `pnpm seed:*`) |
| **ack_status** | **FAIL_TO_PM** (superseded for residuals 4b–7 by resume) |
| **resume** | `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md` · **PASS_TO_PM** (4b–7 🟢) |

---

## Executive verdict

**FAIL_TO_PM** — partial green on Attendance leave + Recruitment Đề xuất + Insurance error-mask; **session lost mid-wave** and **re-login blocked** by portal `/api/xbos/*` → empty HTTP **500** because **xbos-be `:28002` is down** (Vite proxy default). Remaining checklist items (Insurance happy/J-HRM-04, Internal services, Payroll i18n, Employees J-HRM-02 profile, Báo cáo) **not closed**.

> **2026-07-17 resume:** After `d-xbos-auth-28002-restore-20260717.md`, QA closed residuals **4b–7** → see `p1-hrm-full-menu-qa-retest-resume-20260717.md` (**PASS_TO_PM**).

---

## Per-item checklist

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 1 | Dashboard / D-DASH-01 | 🟡 | After cool-down, iframe hard-nav `/hr/dashboard` fired `GET /api/hrm/employees/summary?company_id=main&include_archived=true` (transferSize **2384**, ~234ms) + list `page=1&page_size=50` once; UI showed **1107** employees. **No** uuid-as-`summary` 500 path observed. First portal soft load of Tổng quan showed payroll widgets with **0** under prior RATE-429. **Ops/PortalOperationsSummary** consumer still not clearly painted as dedicated ops block on this surface. Soft-nav from portal often left wrong React tree until hard iframe reload. |
| 2 | Attendance — Nghỉ phép | 🟢 | Hard-load `/hr/attendance` → tab **Nghỉ phép**: `leave-requests` **exactly 2** GETs (54140 then 421 bytes); **sheets = 0**; UI «Quản lý nghỉ phép» with 85 total / 27 chờ duyệt; **no** RATE-429 banner / ERROR on leave tab. |
| 3 | Recruitment | 🟡 | **No** `candidate-evaluations` storm (evalCount **0** on Dashboard/Candidates). **Đề xuất** UI **8** rows + «Tổng đề xuất 8» (matches prior API cardinality). **Tạo đề xuất** + **Thêm yêu cầu** / **Tạo tin tuyển dụng** visible. Requisitions list hit **RATE-429** with banner+Thử lại (empty list) → **Sửa** not observable on rows. **POST Tạo đề xuất + F5** not closed (429 + later auth loss). |
| 4 | Insurance + Internal services | 🟡 / ⬜ | **Insurance non-2xx:** 🟢 ERROR path — «Lỗi tải dữ liệu» + RATE-429 copy + **Thử lại**; summary cards «Không tải được»; filters show **—** (not silent fake empty-as-OK). **Happy path / paint after page=1 / J-HRM-04:** ⬜ blocked after JWT expiry. **Internal services:** ⬜ not reached. |
| 5 | Payroll — «Trạng thái» | ⬜ | Not reached (auth 500). |
| 6 | Employees scale W1 / J-HRM-02 | 🟡 | List mount after hard-nav: **≤1** list GET `page=1&page_size=50` + summary; count **1107**. Soft-nav portal→attendance left employees DOM under `/hr/attendance` (embed soft-nav residual). **list→profile ≤1 detail / console P0 / J-HRM-02 click:** ⬜ not closed. |
| 7 | Báo cáo | ⬜ | Not reached (auth 500). |

---

## Environment blocker (P0 ops)

| Check | Result |
|-------|--------|
| `GET /api/hrm/` via portal | **200** `HRM-HEALTH-200` |
| `POST /api/xbos/auth/login` via portal | **500** empty body, `content-type: text/plain` |
| `http://14.225.217.232:28002` | **ECONNREFUSED** (HTTP 000) |
| Vite proxy | `VITE_DEV_PROXY_XBOS_API` default `127.0.0.1:28002` — comment in `vite.config.ts` warns wrong port → proxy 500 |
| Deploy recreate allow-list | `hrm-be` / `hrm-fe` / `portal-fe` only — **xbos-be not recreated** in deploy evidence |

Session was valid for early items; mid-retest redirect to `/login` then repeated login failures.

---

## Click / network evidence (browser)

### Session A (pre-logout)

1. Login already active as BOD → `/command-center/hrm/dashboard`.
2. Iframe Vite cold-start slow; soft-nav unreliable → **hard** `iframe.location` used for isolation.
3. **D-DASH-01:** summary + employees page-1 observed; UI 1107.
4. **Attendance leave:** tab Nghỉ phép; leave×2; sheets×0; UI OK.
5. **Recruitment:** no eval storm; Đề xuất 8 rows; requisitions 429 banner.
6. **Insurance:** first paint under 429 → ERROR+Thử lại (fix verified for empty-mask class).

### Session B (blocked)

7. JWT expiry → `/login?redirect=…/insurance`.
8. `ceo@xe.vn` / `Xevn@2026` → **Đăng nhập thất bại**; Network `POST /api/xbos/auth/login` → **500**.

---

## Residual / defects

| ID | Severity | Owner | Summary |
|----|----------|-------|---------|
| `D-P1-HRM-RETEST-XBOS-28002-DOWN-01` | **P0** | devops | xbos-be not listening `:28002`; portal `/api/xbos/*` 500; blocks U65 re-login |
| `D-P1-HRM-EMBED-SOFTNAV-STALE-DOM-01` | P1 | dev-fe | Portal soft-nav updates iframe path but React tree can stay on prior view until hard reload |
| `D-P1-HRM-REC-SUA-429-01` | P2 | qa retest | Sửa / mutate not proven under RATE-429 on requisitions |
| Checklist gaps 4b–7 | P0 gate | qa after devops | Insurance happy+J-HRM-04, Internal services, Payroll i18n, Employees profile, Reports |

---

## Handoff packet

- `work_item_id:` `P1-HRM-FULL-MENU-QA-RETEST-01`
- `from_role:` qa
- `to_role:` pm
- `ack_status:` **FAIL_TO_PM**
- `evidence_path:` `docs/qa/evidence/p1-hrm-full-menu-qa-retest-20260717.md`
- `completion_report:` Partial U65 browser retest on `:8088` after `ea6ea06`. 🟢 Attendance leave (≤2 leave GETs, no sheets storm). 🟡 D-DASH-01 summary used/no uuid-500; Recruitment no eval storm + Đề xuất=8; Insurance ERROR+Thử lại on 429; Employees list page-1/1107. ⬜ Payroll, Reports, Internal services, Insurance happy/J-HRM-04, Employees profile — blocked by xbos `:28002` down → portal auth 500 after session expiry. U65 no seed.
- `next_owner:` **devops** (P0 restore xbos-be `:28002` + portal proxy) then **qa** resume same checklist
- `next_dispatch_prompt:` |
  ```
  work_item_id: P1-HRM-FULL-MENU-QA-RETEST-XBOS-UP-01
  from_role: pm
  to_role: devops
  entry_criteria: VPS :8088; portal POST /api/xbos/auth/login returns 500 empty; :28002 ECONNREFUSED; deploy evidence only recreated hrm-be/hrm-fe/portal-fe
  task: Bring xbos-be healthy on XBOS_BE_PORT (28002); verify portal proxy /api/xbos/auth/login 200 for ceo@xe.vn; do not seed; no docker compose down of unrelated stacks
  exit_criteria: login 200 + JWT; evidence docs/qa/evidence/p1-hrm-full-menu-xbos-up-20260717.md; READY_FOR_QA to resume P1-HRM-FULL-MENU-QA-RETEST-01 items 4b–7
  ```

---

## Seeds / API-only

- **Seed:** none used.
- **API-only PASS:** none claimed — all 🟢/🟡 from browser FE observation + PerformanceResourceTiming / fetch intercept in iframe.
