# PCOMP-W8-MOB-ESS-LEAVE-01 — QA retest (MOB-UX-07)

| Field | Value |
|-------|-------|
| work_item_id | PCOMP-W8-MOB-ESS-LEAVE-01 |
| role | qa |
| date | 2026-06-08 |
| ack_status | **FAIL_TO_PM** (automated PASS · L2.5 device **NOT VERIFIED**) |
| account | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| pilot base | `https://14-225-217-232.nip.io` (**502 Bad Gateway**) |
| dev evidence | `docs/qa/evidence/pcomp-w8-mob-ess-leave-01-20260608.md` |

## Verdict summary

| # | Exit criterion | Result |
|---|----------------|--------|
| 1 | `pnpm --filter hrm-mobile test` + `type-check` exit 0 | **PASS** — 31 files / 169 tests; `tsc --noEmit` clean |
| 2 | L0 `qc:dev-stack` (local hrm-api up) | **PASS** — HRM :28001 + XBOS :28002 + portal :5173 |
| 3 | J-MOB-23..24 manager inline approve + confirm + Undo snackbar | **NOT VERIFIED** — no MOB-UX-07 APK on emulator; uiautomator dump failed; nip.io 502 |
| 4 | J-MOB-26..29 employee tabs / empty / form confirm / date modal | **NOT VERIFIED** — same device + pilot blockers |
| 5 | J-MOB-25 balance cards | **GWC** — local API 200 `available_days=8`; **nip.io unreachable (502)** |
| 6 | Regression J-MOB-06..09 Home | **PASS (API/local)** — home-summary 200 tasks=10 mgr=2 cel=5 who=1; nip.io probe **502** |
| 7 | Evidence file | this document |

**Overall: FAIL_TO_PM** — unit/tsc + local L0 + local balance API promotable; **L2.5 device journeys 23–24 / 26–29 not executed**; pilot infra down.

## 1 — Automated (exit 1)

```bash
cd apps/mobile/hrm-mobile && pnpm test
# Test Files  31 passed (31) | Tests  169 passed (169)

cd apps/mobile/hrm-mobile && pnpm run type-check
# exit 0
```

MOB-UX-07 contract tests included:

- `src/integrations/__tests__/hrmLeaveBalance.test.ts` (2)
- `src/utils/__tests__/leaveListGrouping.test.ts` (2)
- `src/components/ui/__tests__/essLeaveUx.test.ts` (4)

## 2 — L0 stack (exit 2)

```bash
pnpm run qc:dev-stack
# HRM + XBOS healthy

pnpm run qc:fe-be-health:pilot
# ALL PASS (local :28001/:28002/:5173 + test:pilot:flows 13/13)
```

## 3–4 — L2.5 device (J-MOB-23..29) — NOT VERIFIED

**Blockers:**

| Blocker | Detail |
|---------|--------|
| D-W8-MOB-APK-MOBUX07-01 | No `hrm-mobile-qa-device.apk` in repo/dist; installed emulator build predates MOB-UX-07 bundle |
| D-W8-PILOT-502-01 | nip.io `POST /api/hrm/auth/mobile/login` → **502 Bad Gateway** (nginx) |
| D-W8-DEVICE-UIAUTO-01 | `adb shell uiautomator dump` → `null root node` on emulator (launcher/calendar focus) |

**Attempted:** deep-link login script with `base_url=http://10.0.2.2:28001` (host API on :28001); device walk script `scripts/tmp-pcomp-w8-mob-ess-leave-01-device.mjs` — hung on uiautomator retries; **no screen XML captured**.

**Code review (static — not L2.5 PASS):**

| Journey | Implementation | File |
|---------|----------------|------|
| J-MOB-23 | Manager inbox default filter `leave`, `ManagerLeaveCard` inline actions | `ManagerApprovalsScreen.tsx` |
| J-MOB-24 | `ConfirmActionModal` approve/decline + `UndoSnackbar` 5s | `ConfirmActionModal.tsx`, `UndoSnackbar.tsx` |
| J-MOB-25 | `LeaveBalanceHeader` Kỳ nghỉ + Còn lại/Đã dùng cards | `LeaveBalanceHeader.tsx` |
| J-MOB-26 | `SegmentedTabBar` Đang xét \| Đã duyệt \| Từ chối + section grouping | `LeaveRequestsListScreen.tsx` |
| J-MOB-27 | `EmptyLeaveIllustration` + CTA «Đăng ký nghỉ» | `LeaveRequestsListScreen.tsx` |
| J-MOB-28 | Create step 2 balance refetch via `fetchLeaveBalance` | `CreateLeaveRequestScreen.tsx` |
| J-MOB-29 | `HrmDateRangeField` step 0 + `ConfirmActionModal` submit | `CreateLeaveRequestScreen.tsx` |

## 5 — J-MOB-25 leave-balance API (exit 5 — GWC)

**Local (hrm-api :28001):**

```http
GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id=3796d949-4513-45c0-88fa-33030a062b17&leave_type=annual&year=2026
Authorization: Bearer {uat.nv0001}
```

| Field | Expected | Actual |
|-------|----------|--------|
| HTTP | 200 | **200** |
| code | `HRM-LEAVE-BAL-200` | **HRM-LEAVE-BAL-200** |
| `available_days` | 8 | **8** |
| `used_days` | 3 | **3** |
| `source` | `employee_leave_balances` | **employee_leave_balances** |

**nip.io (sponsor target):**

```http
POST https://14-225-217-232.nip.io/api/hrm/auth/mobile/login
→ HTTP 502 Bad Gateway (nginx)
```

Cannot probe leave-balance on pilot. Prior defect **D-W7-LEAVE-BAL-DEPLOY-01** (404 route) may still apply once 502 cleared.

**GWC J-MOB-25:** balance UI promotable after MOB-UX-07 APK + pilot API 200 retest.

## 6 — J-MOB-06..09 Home regression (exit 6)

**Local home-summary probe (same session as balance):**

| Slice | HTTP | Value |
|-------|------|-------|
| tasks | 200 | 10 |
| manager_pending | 200 | 2 |
| celebrations | 200 | 5 |
| whos_out | 200 | 1 |

**nip.io:** `tmp-pcomp-w7-qa-hub-04b-probe.mjs` → login **502** (cannot reconfirm on pilot).

**Note:** `GET /attendance/leave-requests` on local returned **500 HRM-SYS-001** — may affect My Leaves list tabs on device; separate from balance header.

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| J-MOB-23..24 device walk | qa-device | After MOB-UX-07 APK + pilot up |
| J-MOB-26..29 device walk | qa-device | Same |
| J-MOB-25 pilot balance 200 | devops | D-W7-LEAVE-BAL-DEPLOY-01 + fix nip.io 502 |
| MOB-UX-07 release APK | dev-mobile | `pnpm --filter hrm-mobile run android:apk:qa-device` |
| Undo revert API | — | BR-ESS-UNDO-01: alert only (dev handoff accepted) |
| leave-requests 500 local | dev-be | Blocks list tab data on local device walk |

## Defects / conditions

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| D-W8-MOB-APK-MOBUX07-01 | P0 | No qa-device APK with MOB-UX-07 bundle for L2.5 | dev-mobile |
| D-W8-PILOT-502-01 | P0 | nip.io HRM auth 502 — blocks sponsor UAT | devops |
| D-W7-LEAVE-BAL-DEPLOY-01 | P0 (carry) | leave-balance route on pilot (404 prior QA) | devops |
| D-W8-DEVICE-UIAUTO-01 | P2 | uiautomator dump flaky on emulator | qa |

## Handoff

- **next_owner:** pm
- **ack_status:** **FAIL_TO_PM**
- **pm_dispatch_hint:**
  1. `dev-mobile` — build/install `android:apk:qa-device` with MOB-UX-07 → `READY_FOR_QA`
  2. `devops` — restore nip.io (502) + deploy leave-balance route (close D-W7-LEAVE-BAL-DEPLOY-01)
  3. `qa` / `qa-device` — re-run PCOMP-W8-MOB-ESS-LEAVE-01 L2.5 J-MOB-23..29 on nip.io + emulator evidence XML/screenshots
