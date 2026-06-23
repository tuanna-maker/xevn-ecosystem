# PCOMP-W7-MOB-LEAVE-BAL — Leave balance API (W7-4 scope parity R2)

| Field | Value |
|-------|-------|
| **work_item_id** | PCOMP-W7-MOB-LEAVE-BAL |
| **role** | dev-be |
| **date** | 2026-06-09 |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | `MOBILE_W7_DATA_CONTRACTS.md` §4 · VAL-W7-LBAL-* |
| **journeys** | J-MOB-25..28 · MOB-UX-07 |

---

## Summary

Closed W7-4 leave balance backend contract for mobile `LeaveBalanceHeader` / `fetchLeaveBalance`. Added **`normalizePayrollListCompanyId`** on employee scope lookup so `company_id={legal_uuid}` queries match `GET /attendance/leave-requests` list parity (D-MOB-PARITY-LEAVE-SLUG-01 pattern). Mobile FE wiring already present — no dev-mobile code change required this wave.

---

## API contract

```http
GET /api/hrm/attendance/leave-balance?company_id={holding|main|uuid}&employee_id={self}&leave_type=annual&year=2026
Authorization: Bearer {jwt}
x-tenant-id: xevn
x-company-id: {legal_uuid}
```

**200** `HRM-LEAVE-BAL-200` — fields consumed by mobile `LeaveBalancePayload`:

| Field | Mobile use |
|-------|------------|
| `available_days` | `LeaveBalanceHeader` «Còn lại» |
| `used_days` | `LeaveBalanceHeader` «Đã dùng» |
| `year` / `balance_year` / `period` | Period label |
| `entitled_days`, `pending_days`, `remaining_days` | Profile metrics, create-leave chip |
| `source` | `employee_leave_balances` \| `custom_fields` \| `default` |

**403** `HRM-LEAVE-403` — non-HR JWT + foreign `employee_id` (VAL-W7-LBAL-02).

**200** zeros + `source: "default"` — no balance row (VAL-W7-LBAL-03).

---

## Scope parity (U19)

| Layer | Mechanism |
|-------|-----------|
| Employee lookup | `normalizePayrollListCompanyId` → `resolveHrmListScope` → `pushWorkforceEmployeeScopeFilter('e.id')` |
| Balance row | `employee_leave_balances.company_id` = employee slug (`holding`) |
| UUID query | JWT `company_uuid` on `company_id` param normalizes to slug `holding` (same as leave-requests list) |

---

## Delta (2026-06-09)

- `leave-balance.service.ts` — `normalizePayrollListCompanyId` before `resolveHrmListScope` in `loadEmployeeInScope`.
- `leave-balance.service.spec.ts` — `PCOMP-W7-MOB-LEAVE-BAL: company_uuid query normalizes…` regression.

---

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Leave balance unit | `pnpm --filter hrm-api exec npx jest leave-balance.service.spec.ts --no-cache` | **6/6 PASS** |
| Attendance controller | `pnpm --filter hrm-api exec npx jest attendance.controller.spec.ts --no-cache` | **21/21 PASS** |
| Combined | same with both files | **27/27 PASS** |
| TypeScript build | `pnpm --filter hrm-api run build` | exit **0** |
| Local HTTP smoke | `:28001` / `:3001` | **SKIP** — stack not running |

Prior pilot evidence (nip.io 200 after deploy): `docs/qa/evidence/pcomp-w7-leave-bal-deploy-20260608.md`.

---

## Mobile integration (already wired — QA only)

| Screen | Integration |
|--------|-------------|
| `LeaveRequestsListScreen` | `LeaveBalanceHeader` + `fetchLeaveBalance` |
| `CreateLeaveRequestScreen` | balance chip via `available_days` |
| `ProfileScreen` | work metrics from balance payload |
| `hrmLeaveBalance.ts` | `resolveLeaveBalanceQueryCompanyId` → slug `holding` |

**dev-mobile:** no BE handoff blockers; retest device after pilot deploy if BE delta not yet on VPS.

---

## QA probe (copy-ready)

1. Login: `uat.nv0001@xe.vn` / `xevn-uat-2026`
2. `GET /api/hrm/attendance/leave-balance?company_id=holding&employee_id={jwt.employee_id}&leave_type=annual&year=2026` → **200**, `available_days=8`, `used_days=3`
3. Repeat with `company_id={jwt.company_uuid}` → **200** same payload (scope parity)
4. Foreign `employee_id` + employee JWT → **403** `HRM-LEAVE-403`
5. Device: My Leaves tab shows «Còn lại 8» / «Đã dùng 3» (J-MOB-25)

Seed if missing: `pnpm run seed:hrm:uat-mob-pilot-qual`

---

## Residual

- VPS may still run pre-06-09 image until devops redeploy — nip.io UUID query retest after sync.
- Home `leave_balance_preview` optional extension not in scope.

---

## Handoff

- **next_owner:** qa
- **next_dispatch_prompt:** Retest PCOMP-W7-MOB-LEAVE-BAL on pilot: login `uat.nv0001@xe.vn`, probe `GET /attendance/leave-balance` with `company_id=holding` and `company_id={company_uuid}` (expect 200, available_days=8), VAL-W7-LBAL-02 foreign employee 403, then device J-MOB-25 LeaveBalanceHeader on My Leaves. Evidence: `docs/qa/evidence/pcomp-w7-leave-bal-be-20260609.md`. Run `seed:hrm:uat-mob-pilot-qual` if balance row missing.
