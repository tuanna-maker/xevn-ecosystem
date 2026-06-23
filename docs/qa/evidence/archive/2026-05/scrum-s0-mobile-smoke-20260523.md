# P1-S0-MOB-01 — Sprint 0 HRM Mobile regression (Dev-Mobile, 2026-05-23)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-S0-MOB-01` |
| **sprint** | S0 · `PHASE1-SCRUM-S0` |
| **from_role** | Dev-Mobile |
| **to_role** | PM |
| **ack_status** | `PASS_TO_PM` |
| **scope** | No new features — regression for 15 `UC-HRM-MOB-*` |

## Verdict

**PASS** — `node scripts/mobile-hrm-smoke.mjs` exit 0; `pnpm test:hrm-mobile` exit 0 (6/6); `docs/hrm/MOBILE_BACKLOG.md` — **26/26 rows `DONE`** (no open MOB-* tickets).

## Preconditions

| Check | Status |
|-------|--------|
| HRM API listening `http://127.0.0.1:28001` | PASS (smoke health `success=true`) |
| Deploy env loaded via `scripts/seed-env-loader.mjs` | PASS |
| Pilot account `du-lich.ceo@xe.vn` | PASS |

## Commands executed

```powershell
Set-Location "...\xevn-ecosystem"
node scripts/mobile-hrm-smoke.mjs
pnpm test:hrm-mobile
```

### `mobile-hrm-smoke.mjs` output

```
MOB smoke OK: {
  base: 'http://127.0.0.1:28001',
  email: 'du-lich.ceo@xe.vn',
  employeeId: 'c4d59b81-b7ce-4e75-8c6d-856d5acfd02c'
}
```

Exit code: **0**

### `pnpm test:hrm-mobile` output

| Suite | Result |
|-------|--------|
| `mapApiError.test.ts` | 1 passed |
| `envelope.test.ts` | 4 passed |
| `hrmRealtimeClient.test.ts` | 1 passed |
| **Total** | **6 passed**, exit **0** |

## API smoke matrix (script)

| Step | Endpoint | UC coverage (regression) |
|------|----------|-------------------------|
| Health | `GET /api/hrm/` | UC-HRM-MOB-01 (session bootstrap) |
| Login | `POST /api/hrm/auth/mobile/login` | UC-HRM-MOB-01 |
| Roles in login payload | `data.roles[]` | UC-HRM-MOB-02 (scope context) |
| Leave list | `GET /api/hrm/attendance/leave-requests?company_id={uuid}&employee_id=…` | UC-HRM-MOB-07 |
| Payslips | `GET /api/hrm/payroll/payslips?company_id=…&employee_id=…` | UC-HRM-MOB-09 |

Slug header `x-company-id` + attendance `company_id` UUID alignment verified by prior cycle (`UAT-MOB-ATT-SCOPE-01`); no mobile code change in S0.

## UC-HRM-MOB-01..15 regression posture (S0)

| UC | Title | S0 evidence |
|----|-------|-------------|
| UC-HRM-MOB-01 | Đăng nhập / phiên | Smoke login PASS |
| UC-HRM-MOB-02 | Chọn phạm vi công ty | Login `default_tenant_id` / `default_company_id` + scope headers in smoke |
| UC-HRM-MOB-03 | Dashboard cá nhân | MOB backlog DONE; no S0 code delta |
| UC-HRM-MOB-04 | Chấm công | MOB-104/402 DONE; no S0 delta |
| UC-HRM-MOB-05 | Lịch sử chấm công | MOB-104 DONE |
| UC-HRM-MOB-06 | Tạo đơn | MOB-101/leave screens DONE |
| UC-HRM-MOB-07 | Danh sách đơn | Smoke leave-requests PASS |
| UC-HRM-MOB-08 | Phê duyệt | MOB-102/301/302 DONE |
| UC-HRM-MOB-09 | Tóm tắt lương | Smoke payslips PASS |
| UC-HRM-MOB-10 | Hợp đồng / BH | MOB-102/302 DONE |
| UC-HRM-MOB-11 | Công việc / dịch vụ | MOB-202 DONE |
| UC-HRM-MOB-12 | Hồ sơ cá nhân | MOB-203 DONE |
| UC-HRM-MOB-13 | Thông báo | MOB-201/205 DONE; vitest realtime client PASS |
| UC-HRM-MOB-14 | Offline | MOB-401/204 DONE |
| UC-HRM-MOB-15 | Đăng xuất | MOB-103 auth flow DONE |

## MOBILE_BACKLOG audit

Source: `docs/hrm/MOBILE_BACKLOG.md` (2026-05-23 read).

- Rows in status table: **26**
- Status `DONE`: **26**
- Non-DONE (`TODO`, `IN_PROGRESS`, `BLOCKED`, …): **0**

## Residual risk

- S0 smoke is **API-level** (MOB-404 script); full device E2E not re-run in this cycle.
- QA L2 pilot matrix (`P-CC-*`) is out of scope for this work item (PM → QA `P1-S0-QA-01`).

## Handoff

- **entry_criteria:** Sprint S0 mobile regression dispatch; stack reachable on `28001`.
- **exit_criteria:** `mobile-hrm-smoke.mjs` PASS; MOBILE_BACKLOG all DONE; evidence file present.
- **needed_by:** PM → QA `P1-S0-QA-01` (L1/L2 per zero-defect gate).
