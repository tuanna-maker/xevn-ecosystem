# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **parent** | ATT-LEAVE-BALANCE-BA-01 **CONFIRMED** + ATT-LEAVE-BALANCE-DATA-01 **CONFIRMED** · Option **B** |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **Date** | 2026-08-08 |
| **change_mode** | **ADD** |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · F-ATT-LEAVE-04 accrue engine LIVE **HOLD** · att_leave_type L1 invent `HRM-LEAVE-TYPE-UNKNOWN` **RETAIN** · ATT-CODE/WS/SHIFT seals **RETAIN** · FE HOLDs **RETAIN** · **`C-SLICE-≠-MODULE`** · U65 zero-seed |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-SA-01.md` Option **B** · L-ATT-LVRULE-01..10 · F-ATT-LVRULE-01..04 · CNS KEY |
| **BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BA-01.md` AC-PLT-ATT-LEAVE-BAL-01* · VAL-ATT-LVRULE-CNS-* **CONFIRMED** |
| **DATA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-DATA-01.md` §2 ADD `att_leave_accrual_policy` **CONFIRMED** |
| **BA evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-ba-01.md` |
| **DATA evidence** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-data-01.md` |
| **DB client** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.4b |
| **API** | F-ATT-LVRULE-* under `/api/hrm/attendance/leave-accrual-policies*` · F-ATT-LEAVE-04 **HOLD** |

---

## 2. completion_report

**Closed (Nest F-ATT-LVRULE-* ADD):**

| Cap / VAL | Impl |
|-----------|------|
| **ensureSchema / migration** | `public.att_leave_accrual_policy` — version, effective_from/to, soft FK `leave_type_key`, accrual/carry/caps, status/`archived_at`, UQ/IX resolve |
| **F-ATT-LVRULE-01** | `GET …/leave-accrual-policies` — default **active** · `include_inactive=true` · display-ready (`leaveTypeNameVi`, `accrualModeLabel`, `statusLabel`) |
| **F-ATT-LVRULE-02** | `POST …/leave-accrual-policies` — admin CREATE open N+1 · soft FK EFF type · window overlap **409** `HRM-ATT-LVRULE-CONFLICT` |
| **F-ATT-LVRULE-03** | `PATCH …/:id` · `POST …/:id/retire` soft-retire only (**FORBIDDEN** hard-delete) |
| **F-ATT-LVRULE-04** | `GET …/leave-accrual-policies/effective?leave_type_key=&as_of=` — 200 empty OK |
| **VAL-CNS invent KEY** | `assertLeaveAccrualPolicyForConsumer` → **400 `HRM-ATT-LVRULE-KEY`** when active>0 ∧ invent `policyId` / ad-hoc mode\|days |
| **Orphan type** | Admin CREATE `leave_type_key` ∉ EFF → **400 `HRM-ATT-LVRULE-TYPE`** (≠ `HRM-LEAVE-TYPE-UNKNOWN`) |
| **Empty active** | invent assert **skip** · no seed (U65) |
| **U19 scope_parity** | list ↔ get-by-id ↔ resolve ↔ count/assert share `resolveHrmListScope` |
| **CODE-MEMORY** | APPEND on service/constants/dto/controller · app.module wire |

**Paths:**

| Cap | Path |
|-----|------|
| List | `GET /api/hrm/attendance/leave-accrual-policies?company_id=` (+ `leave_type_key`, `include_inactive`) |
| Effective | `GET /api/hrm/attendance/leave-accrual-policies/effective?company_id=&leave_type_key=&as_of=` |
| Create | `POST /api/hrm/attendance/leave-accrual-policies` |
| Get | `GET /api/hrm/attendance/leave-accrual-policies/:policyId?company_id=` |
| Patch | `PATCH /api/hrm/attendance/leave-accrual-policies/:policyId?company_id=` |
| Retire | `POST /api/hrm/attendance/leave-accrual-policies/:policyId/retire?company_id=` |

**Files:**

- `apps/api/hrm-api/migrations/20260808_att_leave_accrual_policy.sql`
- `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.constants.ts`
- `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.ts`
- `apps/api/hrm-api/src/attendance/att-leave-accrual-policy.service.spec.ts`
- `apps/api/hrm-api/src/attendance/dto/att-leave-accrual-policy.dto.ts`
- `apps/api/hrm-api/src/attendance/attendance.controller.ts` (+ CODE-MEMORY APPEND)
- `apps/api/hrm-api/src/app.module.ts`
- `apps/api/hrm-api/src/attendance/attendance.controller.spec.ts` (mock wire)

**Cấm giữ:** seed · flip ready · reopen leave-type/ATT-CODE/WS/SHIFT L1 · invent FE HOLDs · claim accrue engine LIVE · Settings dual-write SoT · mega-EAV · second leave-type table · fold ATT-CODE · rewrite aggregate/payroll formula.

**Residual:**

| Item | Owner |
|------|-------|
| Browser U65 AC-PLT-ATT-LEAVE-BAL-01/01b/01c/01d/01e · L1 invent KEY LIVE | **qa** |
| FE admin «Quy tắc quỹ phép» + consumer grant bind | **dev-fe** after QA or parallel |
| Panel MVP-five kill as sole SoT (**01g**) | FE/BE deepen residual |
| Wire CNS assert on grant/adjust body when product surface ships | follow-on (helper LIVE + jest) |
| F-ATT-LEAVE-04 accrue engine LIVE | **OUT** dedicated wave |
| Slice GWC · honesty false | **qc** after QA |

---

## 3. Error taxonomy (emit)

| Code | HTTP | When |
|------|------|------|
| **`HRM-ATT-LVRULE-KEY`** | 400 | Consumer invent `policy_id` / ad-hoc mode\|days when active policy >0 |
| **`HRM-ATT-LVRULE-TYPE`** | 400 | Admin orphan `leave_type_key` ∉ EFF |
| **`HRM-ATT-LVRULE-CONFLICT`** | 409 | Overlapping active window / UQ version |
| **`HRM-ATT-LVRULE-404`** | 404 | get/patch/retire not found / OOS empty |
| **`HRM-SCOPE-409`** | 409 | Scope mismatch (U19) |
| **`HRM-LEAVE-TYPE-UNKNOWN`** | 400 | Leave TXN invent type — **RETAIN** · ≠ LVRULE-KEY |

---

## 4. Verification

```bash
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns="att-leave-accrual-policy.service.spec|attendance.controller.spec" --no-coverage
# Test Suites: 2 passed · Tests: 35 passed
```

| VAL / AC | Jest |
|----------|------|
| ensureSchema ADD + FORBIDDEN closed key IN | PASS |
| **CNS-01** invent KEY (`policy_id` + ad-hoc days) | PASS |
| **CNS-05** empty active skip | PASS |
| Orphan type admin → `HRM-ATT-LVRULE-TYPE` | PASS |
| Admin CREATE N+1 display-ready | PASS |
| List active default / include_inactive | PASS |
| Soft-retire hide + no hard DELETE | PASS |
| Resolve empty + active filter | PASS |
| U19 get-by-id main→holding · member OOS | PASS |
| Orthogonal KEY ≠ LEAVE-TYPE-UNKNOWN | PASS |
| Controller suite regression | PASS |

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|-------|
| `attendance_uat_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| F-ATT-LEAVE-04 engine LIVE | **HOLD / DENIED** |
| att_leave_type L1 / `HRM-LEAVE-TYPE-UNKNOWN` | **SEAL RETAIN** |
| ATT-CODE / WS / SHIFT L1 | **SEAL RETAIN** |
| FE HOLDs ATT-CODE FE · ATT-SHIFT CNS-02 | **RETAIN do not invent** |
| Ledger `employee_leave_balances` | **RETAIN** (no EXPAND cols this seat) |
| Aggregate / LIST-TOTALS | **SEAL RETAIN** |
| Seed | **DENIED** (U65) |
| `C-SLICE-≠-MODULE` | **RETAIN** |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-01.md` |
| **next_dispatch_prompt** | See below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01 READY_FOR_QA
entry_criteria:
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-be-01.md
  - L0 stack if browser; U65 zero-seed
  - Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · engine LIVE HOLD
task:
  - L1 invent KEY LIVE: when ≥1 active policy for type, invent policy_id / ad-hoc accrual mode|days → Network 4xx HRM-ATT-LVRULE-KEY
  - Admin CREATE N+1 bound EFF leave_type_key → 2xx · F5 list · resolve effective sees row
  - Soft-retire → default resolve hides · include_inactive OK
  - Empty active → soft empty · no seed
  - Orphan admin type → 4xx HRM-ATT-LVRULE-TYPE
  - RETAIN: leave-type invent still HRM-LEAVE-TYPE-UNKNOWN · ATT-CODE/WS/SHIFT seals · FE HOLDs · no engine LIVE claim
exit: PASS_TO_PM or FAIL_TO_PM with evidence
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-leave-balance-qa-01.md
```
