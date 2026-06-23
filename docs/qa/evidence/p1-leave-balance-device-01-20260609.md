# P1-LEAVE-BALANCE-DEVICE-01 — Leave balance header 8/3 scope fix

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-LEAVE-BALANCE-DEVICE-01` |
| **from_role** | `dev-mobile` |
| **to_role** | `qa-device` |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **upstream FAIL** | [`p1-g3-jmob-05-strict-r3-20260609.md`](p1-g3-jmob-05-strict-r3-20260609.md) — REG-NV1-LEAVE-83 @ APK `A00B6433` |

---

## Root cause

On APK **A00B6433** (R4 manager-nav build), `uat.nv0001@xe.vn` My Leaves mounted but `LeaveBalanceHeader` showed **Còn lại 0 / Đã dùng 0** while nip.io `GET /attendance/leave-balance?company_id=holding` returned **8/3**.

| Layer | Finding |
|-------|---------|
| **Query scope** | `fetchLeaveBalance` could emit legal UUID when SecureStore `companyId` was UUID-shaped and qa-login deep link stored **empty `memberships[]`** — rollup slug recovery failed |
| **Gate** | `loadBalance` gated on `getAttendanceCompanyId()` (wire UUID) instead of leave-balance query slug |
| **Display** | `available_days: 0` with positive `remaining_days` rendered as **0** (no fallback) |
| **qa-login** | `qaDeepLinkToSignInPayload` passed UUID `company_id` through without normalizing to TEXT slug `holding` |

---

## Fix (mobile)

| File | Change |
|------|--------|
| `companyWireScope.ts` | `resolveLeaveBalanceQueryCompanyId` — member TEXT slug first; JWT slug; never wire UUID; default `holding`; `resolveMembershipScopeSlug` matches `company_uuid` |
| `hrmLeaveBalance.ts` | `composeLeaveBalanceParams`; `resolveLeaveBalanceDisplayDays`; `readBalancePayload` coalesces available/remaining |
| `LeaveBalanceHeader.tsx` | Display via `resolveLeaveBalanceDisplayDays` |
| `LeaveRequestsListScreen.tsx` | Balance fetch gates on `getLeaveBalanceQueryCompanyId()` |
| `CreateLeaveRequestScreen.tsx` | Balance chip uses leave-balance query scope + display fallback |
| `AuthContext.tsx` | `getLeaveBalanceQueryCompanyId()` |
| `qaLoginDeepLink.ts` | Synthetic membership + UUID→holding slug normalization on qa-device login |

---

## Verification

```text
pnpm --filter hrm-mobile test     → 444/444 PASS
pnpm --filter hrm-mobile exec tsc --noEmit → PASS
node scripts/qa-mobile-login-intent.mjs    → home_reached: true
```

| nip.io probe (`uat.nv0001`) | Result |
|-----------------------------|--------|
| `company_id={legal_uuid}` | 404 or default 0 — pre-fix path |
| `company_id=holding` | **200** `available_days=8` `used_days=3` |

---

## APK artifact (unified R4 + balance fix)

| Field | Value |
|-------|-------|
| Path | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` |
| Size | 69,154,211 B (~65.96 MiB) |
| SHA-256 | `4954062EBF6319451C58825EA0213F87620CD28C63DF5C0B851786D6B8B3FE62` |
| Build | `pnpm run android:apk:qa-device` @ junction `C:\xevn-ecosystem`, `GRADLE_USE_SUBST=1` |
| Includes | R-W7-MOB-LEAVE-NAV-01-R4 manager swipe + **P1-LEAVE-BALANCE-DEVICE-01** |

---

## QA device retest

**Account:** `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io`

| Journey | Expect |
|---------|--------|
| **J-MOB-25** | Home → Nghỉ phép tile → `leave-balance-header` **Còn lại 8** / **Đã dùng 3** |
| **J-MOB-28** | Create leave step 2 → chip **Còn lại: 8 ngày** |

**Pre-step:** `adb shell pm clear vn.xevn.hrm.mobile` before install fresh APK.

---

## completion_report

Closed **P1-LEAVE-BALANCE-DEVICE-01** — leave-balance query always resolves to rollup TEXT slug (`holding` for uat.nv0001), qa-login hydrates membership for scope recovery, header displays remaining when available is zero. Vitest **444/444** + tsc PASS. Fresh qa-device APK SHA `4954062E…` bundles R4 manager fix + balance scope fix. Residual: nv0002 manager persona (`P1-G3-JMOB-05-PERSONA-NV2-FIX`) unchanged — separate dev-be track.

## next_owner

`qa-device`

## next_dispatch_prompt

```
work_item_id: P1-LEAVE-BALANCE-DEVICE-01-QA
from_role: pm
to_role: qa-device
entry_criteria: docs/qa/evidence/p1-leave-balance-device-01-20260609.md READY_FOR_QA — APK SHA 4954062E… installed after pm clear; includes R4 + balance fix
exit_criteria: emulator-5554 @ nip.io uat.nv0001 — home-action-tile-time_off → leave-requests-list-screen XML contains text="8" and text="3" in leave-balance-header; J-MOB-28 create chip shows 8 ngày; evidence p1-leave-balance-device-01-qa-20260609.md
ack_status: PASS_TO_PM or FAIL_TO_PM
evidence_path: docs/qa/evidence/p1-leave-balance-device-01-qa-20260609.md
```

## pm_dispatch_hint

`P1-LEAVE-BALANCE-DEVICE-01-QA` — retest REG-NV1-LEAVE-83 on new APK before re-running strict J-MOB-05 nv0002 persona gate.
