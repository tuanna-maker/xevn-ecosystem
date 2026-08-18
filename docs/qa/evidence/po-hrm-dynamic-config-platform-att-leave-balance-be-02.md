# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-02` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **date** | 2026-08-08 |
| **lane** | execution — wire consumer invent KEY on HTTP surface |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `…-ATT-LEAVE-BALANCE-QC-01` GWC Condition **`R-PLT-ATT-LVRULE-CNS-WIRE`** MANDATORY P1 |
| **stamp_qa** | `ATTLVRULEQA-MSK6G783` |
| **change_mode** | FIX (+ ADD gated consumer surface) · `preserve_default: true` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · no `apps/**` product mutation via script · login/build only |

---

## Condition addressed

QC-01 attached **MANDATORY P1** `R-PLT-ATT-LVRULE-CNS-WIRE` (owner `dev-be`): helper `assertLeaveAccrualPolicyForConsumer` + jest were LIVE, but **no HTTP surface** emitted `HRM-ATT-LVRULE-KEY` (grant/adjust/assert **404 ABSENT**; leave-request invent policy_* → `HRM-VAL-001` DTO whitelist ≠ KEY). QA machine `network_key_hit=false` · `controller_assert_consumer_wired=false`.

**Fix:** wire a **gated leave consumer body** HTTP surface `POST /attendance/leave-accrual-policies/assert-consumer` that calls the existing helper so **Network** proves `HRM-ATT-LVRULE-KEY` when active policy set >0 and consumer invents.

## spec_read_ack

- srs: `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md` §3–§7 · AC-PLT-ATT-LEAVE-BAL-01b/01c · VAL-ATT-LVRULE-CNS-01/05
- tech_spec: `…-ATT-LEAVE-BALANCE-SA-01.md` Option **B** · F-ATT-LVRULE-CNS-01 · `HRM-ATT-LVRULE-KEY`
- db_design: `…-ATT-LEAVE-BALANCE-DATA-01.md` §2 `att_leave_accrual_policy` (no schema change this wave)
- api_design: F-ATT-LVRULE-CNS-01 consumer invent guard → 4xx KEY
- qc_ref: [`po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md`](po-hrm-dynamic-config-platform-att-leave-balance-qc-01.md)
- change_mode: FIX/ADD · must_keep: engine HOLD · admin CREATE untouched · orthogonal TYPE/UNKNOWN · ledger seals · U65

## Changes (allowed_paths)

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/attendance/dto/att-leave-accrual-policy.dto.ts` | **ADD** `AssertConsumerAttLeaveAccrualPolicyDto` (camelCase whitelist: `companyId`, `leaveTypeKey`, `policyId?`, `accrualMode?`, `annualDays?`) + CODE-MEMORY-CHANGE |
| `apps/api/hrm-api/src/attendance/attendance.controller.ts` | **ADD** `POST leave-accrual-policies/assert-consumer` → `assertLeaveAccrualPolicyForConsumer` → `ok(HRM-ATT-LVRULE-200)` / throws `HRM-ATT-LVRULE-KEY` 400 + CODE-MEMORY-CHANGE |
| `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.ts` | **FIX** guard: malformed (non-UUID) `policyId` when active>0 → deterministic `HRM-ATT-LVRULE-KEY` 400 (avoid `::uuid` cast 500) + CODE-MEMORY-CHANGE |
| `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts` | **ADD** 3 Network-class controller tests (invent forward, invent→KEY 4xx, empty→skip) + mock method |
| `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.spec.ts` | **ADD** unit: malformed policyId active>0 → KEY, no `::uuid` query |

**No** schema/migration change. **No** touch to leave TXN create / workflow bridge / fanout / ledger. **No** engine LIVE. **No** FE. **No** seed.

## Behavior (F-ATT-LVRULE-CNS-01)

| Case | Result | Code / HTTP |
|------|--------|-------------|
| active policy set >0 + invent `policyId` / ad-hoc `accrualMode`\|`annualDays` (no published match) | reject | **400 `HRM-ATT-LVRULE-KEY`** |
| active policy set >0 + malformed (non-UUID) `policyId` | reject (guard, no DB 500) | **400 `HRM-ATT-LVRULE-KEY`** |
| active policy set >0 + params match a published policy | resolve | **200 `HRM-ATT-LVRULE-200`** `{ policy, skipped:false }` |
| active policy = 0 (empty) | soft skip (U65) | **200** `{ policy:null, skipped:true }` |
| no rule params on body | soft skip | **200** `{ policy:null, skipped:true }` |
| unauth / no internal key | reject | **401 `HRM-AUTH-001`** |

Orthogonality preserved: `HRM-ATT-LVRULE-TYPE` (admin orphan type) and `HRM-LEAVE-TYPE-UNKNOWN` (leave TXN invent type) unchanged and distinct from KEY.

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Unit + controller jest LIVE | `npx jest att-leave-accrual-policy.service.spec attendance.controller.spec` | **2 suites / 39 tests PASS** |
| Build dist | `npx nest build` | **exit 0** |
| Dist wire present | grep dist controller | `leave-accrual-policies/assert-consumer` + `assertLeaveAccrualPolicyForConsumer` present → `controller_assert_consumer_wired=true` |
| Dist service guard | grep dist service | `POLICY_ID_UUID_FORMAT` + `HRM_ATT_LVRULE_KEY` present |
| Live route registered | `POST :28001/api/hrm/attendance/leave-accrual-policies/assert-consumer` (unauth) | **401** (route exists — not 404) |
| Lint | ReadLints (5 files) | **No linter errors** |

### Network-class jest (controller)
- `assert-consumer forwards invent params → service assert` — code `HRM-ATT-LVRULE-200`, `skipped:false`, forwards `policyId/accrualMode/annualDays`.
- `assert-consumer invent when active>0 → rejects HRM-ATT-LVRULE-KEY 4xx` — `err.code=HRM-ATT-LVRULE-KEY`, `getStatus()=400`.
- `assert-consumer empty active → skipped soft (U65)` — code `HRM-ATT-LVRULE-200`, `skipped:true`.

## Honesty locks (RETAIN — not flipped)

| Flag | Value |
|------|-------|
| `attendance_uat_ready` | **false** (unchanged) |
| `payroll_e2e_ready` | **false** (unchanged) |
| F-ATT-LEAVE-04 engine LIVE | **HOLD** (not claimed) |
| leave-type / ATT-CODE / WS / SHIFT / FE HOLDs seals | **RETAIN** (not reopened) |
| `C-SLICE-≠-MODULE` | **true** — this is the CNS-WIRE residual close, not module ATT UAT |

## Residual / OBS

- **OBS (pre-existing, NOT BE-02):** `attendance-sheet-scope-parity.spec.ts` (untracked WIP) fails DI — its `TestingModule` never provides `AttLeaveTypeService` / `AttLeaveAccrualPolicyService` / `AttAttendanceCodeService`. Independent of this wave (controller constructor unchanged). Flag to attendance-sheet lane owner.
- **R-PLT-ATT-LVRULE-FE-01g** — FE admin/grant/panel HOLD P2 (owner `dev-fe`) — **do not invent FE** (unchanged).

## Handoff

- **completion_report:** Wired gated consumer HTTP surface `POST /attendance/leave-accrual-policies/assert-consumer` → Network 4xx `HRM-ATT-LVRULE-KEY` on invent (active>0); soft-skip on empty/no-params; added UUID guard (no 500); unit + controller Network-class jest LIVE (39 PASS); dist rebuilt; route registered live (401 unauth). Honesty flags/seals RETAIN; engine HOLD; no seed/FE/schema.
- **next_owner:** `qa`
- **next_dispatch_prompt:** `qa` — retest AC-PLT-ATT-LEAVE-BAL-01b via L1 Network: login `ceo@xe.vn`/`Xevn@2026` (`:28001` restart to load rebuilt dist), create 1 active policy for a leave type (admin CREATE), then `POST /attendance/leave-accrual-policies/assert-consumer` `{companyId, leaveTypeKey, policyId:<invent uuid>, accrualMode:'year_start_grant', annualDays:999}` → expect **400 `HRM-ATT-LVRULE-KEY`** (`network_key_hit=true`, `controller_assert_consumer_wired=true`); confirm orthogonal `HRM-ATT-LVRULE-TYPE` / `HRM-LEAVE-TYPE-UNKNOWN` unaffected; retire the policy after. Keep honesty false / engine HOLD / seals RETAIN. Re-run `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-leave-balance-qa-01.mjs`.
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-02.md`
- **ack_status:** `READY_FOR_QA`
