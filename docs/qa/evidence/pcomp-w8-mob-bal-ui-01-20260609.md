# D-W8-MOB-BAL-UI-01 — Leave balance UI scope fix @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `D-W8-MOB-BAL-UI-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **upstream** | QC GWC [`qc-pcomp-w8-mob-ess-leave-01-r3-20260609.md`](qc-pcomp-w8-mob-ess-leave-01-r3-20260609.md) — D-W8-MOB-BAL-UI-01 |

---

## Root cause

`fetchLeaveBalance` sent `company_id=<legal UUID>` via `auth.getAttendanceCompanyId()` (`resolveWireCompanyId`). BE `LeaveBalanceService.loadEmployeeInScope` filters `employees.company_id = $uuid::text`, but UAT workforce rows use TEXT slug `holding` → **404 HRM-LEAVE-BAL-404** → UI dashes + leaked English `Resource not found` + create chip HR fallback.

Working probe (QA R3 / nip.io): `company_id=holding` + header UUID → **200** `available_days=8`, `used_days=3`.

---

## Fix (mobile)

| File | Change |
|------|--------|
| `companyWireScope.ts` | `LEAVE_BALANCE_QUERY_SCOPE_SLUGS` + `resolveLeaveBalanceQueryCompanyId()` — parity with payroll/home rollup slug recovery (membership/JWT when SecureStore holds legal UUID) |
| `hrmLeaveBalance.ts` | Resolve query `company_id` from auth via resolver (removed caller-passed UUID) |
| `LeaveRequestsListScreen.tsx` | Balance fetch uses resolver indirectly |
| `CreateLeaveRequestScreen.tsx` | Balance chip fetch uses resolver indirectly |
| Tests | `companyWireScope.test.ts`, `hrmLeaveBalance.test.ts` — uat.nv0001 holding recovery |

---

## Verification

```powershell
pnpm --filter hrm-mobile test
# exit 0 — 198/198

pnpm --filter hrm-mobile exec tsc --noEmit
# exit 0

node -e "<nip.io probe UUID vs holding>"
# UUID 6efaa5d6-… → 404 HRM-LEAVE-BAL-404
# holding → 200 HRM-LEAVE-BAL-200 available=8 used=3
```

| Check | Result |
|-------|--------|
| Vitest | **198/198 PASS** |
| tsc | **PASS** |
| nip.io probe holding slug | **200** av=8 used=3 |
| nip.io probe legal UUID (pre-fix path) | **404** (confirms regression guard) |

---

## QA device retest (J-MOB-25 / J-MOB-28)

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io`

| Journey | Expect after fix |
|---------|------------------|
| **J-MOB-25** | My Leaves → **Còn lại 8** / **Đã dùng 3** (no `—`, no `Resource not found`) |
| **J-MOB-28** | Create step 2 → chip **Còn lại: 8 ngày** (not HR fallback) |

**APK:** `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` — **71,783,350 B** (68.46 MiB) · SHA-256 `6001D4D0254ABA07E65382D21ACB310241D4A48ACC9D728D342A80B53E95B1F9` (Gradle qa-device `GRADLE_USE_SUBST=1` @ junction). `pm clear` before install.

---

## Handoff

**completion_report:** Closed D-W8-MOB-BAL-UI-01 — leave-balance query scope uses rollup slug `holding` (not legal UUID) matching payroll/home/home-summary pattern. Vitest 198/198 + tsc PASS. nip.io probe confirms 8/3 on holding, 404 on UUID path.

**next_owner:** `qa-device`

**next_dispatch_prompt:**

```
work_item_id: D-W8-MOB-BAL-UI-01-QA
from_role: pm
to_role: qa-device
lane: execution
entry_criteria: dev-mobile READY_FOR_QA pcomp-w8-mob-bal-ui-01-20260609.md — resolveLeaveBalanceQueryCompanyId holding slug fix
exit_criteria: J-MOB-25 list header shows 8/3 days; J-MOB-28 create step chip shows «Còn lại: 8 ngày»; no Resource not found; evidence pcomp-w8-mob-bal-ui-01-qa-20260609.md
evidence_path: docs/qa/evidence/pcomp-w8-mob-bal-ui-01-qa-20260609.md
action: pm clear + install fresh qa-device APK if rebuilt; deep-link login uat.nv0001; walk J-MOB-25 + J-MOB-28; dump XML to evidence screens folder
```

**evidence_path:** `docs/qa/evidence/pcomp-w8-mob-bal-ui-01-20260609.md`

**ack_status:** `READY_FOR_QA`

**pm_dispatch_hint:** `qa-device` — retest J-MOB-25/28 balance numeric bind after D-W8-MOB-BAL-UI-01; close GWC D-W8-MOB-BAL-UI-01 on QC re-gate
