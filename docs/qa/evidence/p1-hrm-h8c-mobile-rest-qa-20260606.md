# QA evidence — P1-HRM-H8C-MOB-REST (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H8C-MOB-REST` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-06 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h8c-mobile-rest-20260606.md` |
| **account** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **environment** | hrm-api `http://127.0.0.1:28001` |

## Executive summary

| Area | Layer | Verdict | Notes |
|------|-------|---------|-------|
| Unit tests | L1 | **PASS** | vitest **41/41** exit 0 |
| TypeScript | L1 | **PASS** | `pnpm run type-check` exit 0 |
| Legacy dark grep | Static | **PASS** | `#0f172a` — **0 matches** in `apps/mobile/hrm-mobile/src` |
| Light UI components | Static | **PASS** | All 5 screens use `AppScreenLayout` + shared tokens (`ListRow`, `SurfaceCard`, `StatusBadge`, …) |
| REST smoke (screen APIs) | L1 | **PASS** | Scope, UpdateRequests, Payroll, Notifications endpoints **200** @ `uat.nv0001` |
| Device visual L2.5 | — | **GWC** | No adb/emulator this session — static + API corroboration only |

## Commands executed

```text
pnpm test (apps/mobile/hrm-mobile)     → 41/41 PASS exit 0
pnpm run type-check (hrm-mobile)       → exit 0
rg '#0f172a' apps/mobile/hrm-mobile/src → 0 matches
pnpm run qc:dev-stack                  → exit 0 (L0 corroboration)
```

## Static review — 5 legacy screens (H8C scope)

| Screen | Shared components | Light tokens |
|--------|-------------------|--------------|
| `ScopeScreen` | `AppScreenLayout`, `ListRow`, `StatusBadge` | `colors.background` via layout |
| `UpdateRequestsScreen` | `AppScreenLayout`, `ListRow`, filter chips | `colors.background`, `colors.surface` |
| `PayrollSummaryScreen` | `AppScreenLayout`, `ListRow` | `colors.background` |
| `PayslipDetailScreen` | `AppScreenLayout`, `StatusBadge`, `SurfaceCard`, `DetailRow` | layout tokens |
| `InAppNotificationsScreen` | `AppScreenLayout`, `ListRow`, `SurfaceCard`, `PrimaryButton` | `colors.background` |

## API probe — `uat.nv0001@xe.vn` (REST paths unchanged)

Login: `POST /auth/mobile/login` → **201** `HRM-AUTH-200` · `default_company_id=holding` · memberships=1

| Journey | Endpoint | HTTP | Rows / note | Result |
|---------|----------|------|-------------|--------|
| Scope | memberships from login | 200 | 1 membership | **PASS** |
| J-MOB-07 Update list | `GET /attendance/update-requests?company_id={uuid}&status=pending` | **200** | 7 rows | **PASS** |
| J-MOB-04 Payroll periods | `GET /payroll/periods?company_id={uuid}` | **200** | 4 periods | **PASS** |
| J-MOB-04 Payslips | `GET /payroll/payslips?company_id={uuid}&page_size=5` | **200** | total **257** | **PASS** |
| J-MOB-13 Notifications | `GET /notifications/inbox?company_id={uuid}&employee_id={eid}&limit=12` | **200** | 12 inbox rows | **PASS** |
| Health | `GET /` | **200** | `HRM-HEALTH-200` | **PASS** |

## Defects

None opened for H8C scope.

## Residual

| Item | Owner | Note |
|------|-------|------|
| Device L2.5 visual | qa-device | Light-theme pixel verify on Scope/Update/Payroll/Notifications screens — optional follow-up on physical device |

---

**completion_report:** H8C mobile REST + light-theme wave **PASS** — 41/41 vitest, type-check, zero legacy dark hex, static component review on 5 screens, live API smoke for all screen data paths @ `uat.nv0001`. Residual: device visual L2.5 not re-run (GWC).

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H8C-MOB-REST` PASS_TO_PM — promote H8C mobile light-theme closure; optional `qa-device` adb smoke on 5 screens if sprint DoD requires device evidence; no dev-mobile re-dispatch unless device finds regression.

**evidence_path:** `docs/qa/evidence/p1-hrm-h8c-mobile-rest-qa-20260606.md`

**pm_dispatch_hint:** H8C closed; chain to H13 batch QC if grouped under `P1-HRM-H13-REGRESSION-BATCH`.
