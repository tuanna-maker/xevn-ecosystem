# PCOMP-W7-BE-SELF-PATCH-PHONE-01 — QA retest (API / AC-ESS-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-BE-SELF-PATCH-PHONE-01` |
| **from_role** | `qa` |
| **to_role** | `pm` → `dev-be` |
| **date** | 2026-07-19 |
| **ack_status** | **FAIL_TO_PM** |
| **entry** | Dev-BE `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-20260719.md` READY_FOR_QA |
| **env** | local `hrm-api` `:28001` (restarted this session); U65 zero-seed |
| **mandated persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **spec_ref** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.5 UC-HRM-MOB-12 · AC-ESS-01 · BR-ESS-01 · TechSpec §3.1 |

---

## Executive verdict

**FAIL → dev-be** — phone allowlist works for **employee-only** JWT, but mandated persona `uat.nv0001` carries mobile-derived `manager` + `hr_manager` (job_title `CEO`), so `canFullEmployeeUpdate()` short-circuits self allowlist. Exit criteria **(2) full_name → HRM-EMP-403** and **(3) gender-only → HRM-EMP-403** **FAIL** on that persona.

Unit suite green is **not** sufficient: jest self cases use employee-role tokens only; they miss CEO/manager self path.

**cấm respected:** no `pnpm seed:*`; no Phase1/PROD claim; no open-all-fields claim.

---

## Matrix (exit criteria)

| # | Expect | `uat.nv0001` (mandated) | `uat.nv0016` (employee-only control) | Verdict |
|---|--------|-------------------------|--------------------------------------|---------|
| 1 | PATCH `custom_fields` `{phone_number, work_phone}` → 2xx; GET sticks | **PASS** (session A: PATCH 200 `HRM-EMP-202`; GET stick true) | **PASS** (PATCH 200; GET `company_id=holding` stick; merge kept other CF keys) | phone path OK |
| 2 | PATCH `full_name` → `HRM-EMP-403` | **FAIL** — **200** `HRM-EMP-202` (name applied) | **PASS** — **403** `HRM-EMP-403` | **FAIL mandated** |
| 3 | PATCH `custom_fields` `{gender only}` → `HRM-EMP-403` | **FAIL** — **200** `HRM-EMP-202` (wholesale CF replace; wiped phones) | **PASS** — **403** `HRM-EMP-403` | **FAIL mandated** |
| 4 | PATCH `avatar_url` → 2xx | **PASS** (200) | **PASS** (200) | OK |

Overall wave: **FAIL** (L1 AC on mandated persona).

---

## Root cause (deterministic)

1. Mobile auth `deriveRoles('CEO')` → `roles: ['employee','manager','hr_manager']`  
   Corroboration: `docs/qa/evidence/pcomp-w7-mob-leave-bal-qa-r2-20260608.md` — JWT `uat.nv0001` `roles=["employee","manager","hr_manager"]`.  
   Live employee row (session A): `employee_code=HLD-0001`, `job_title_key=CEO`, `id=3796d949-4513-45c0-88fa-33030a062b17`.

2. `canFullEmployeeUpdate()` returns **true** when `roles` includes `manager` **or** `hr_manager` → `assertEmployeeUpdateAllowed` returns early → self allowlist never runs.

3. Same bypass class on `uat.nv0002` (`roles: ["employee","manager"]`): full_name / gender-only also **200**.

4. Jest: `employee-update-policy` **13/13** + prior Dev **34/34** — covers employee self, **not** manager/hr self ESS deny.

```text
pnpm --filter hrm-api exec jest --testPathPatterns="employee-update-policy|employees.service.spec" --no-coverage
→ Suites 2 passed · Tests 34 passed (Dev evidence)
→ policy-only reconfirm: 13 passed (QA 2026-07-19)
```

---

## Session A — live `uat.nv0001` (before later login 401)

```text
POST /api/hrm/auth/mobile/login  uat.nv0001@xe.vn → 201 HRM-AUTH-200
employee_id=3796d949-4513-45c0-88fa-33030a062b17  company_id=holding

PATCH /employees/:id { custom_fields: { phone_number, work_phone } }
→ 200 HRM-EMP-202
GET  → phone/work stick = true

PATCH /employees/:id { full_name: "SHOULD_NOT_APPLY" }
→ 200 HRM-EMP-202   ← expect 403

PATCH /employees/:id { custom_fields: { gender: "female" } }
→ 200 HRM-EMP-202   ← expect 403; response custom_fields={gender:female} only (phones wiped)

PATCH /employees/:id { avatar_url }
→ 200 HRM-EMP-202
```

---

## Control — `uat.nv0016` (roles `["employee"]`)

```text
POST /auth/mobile/login → 201
roles=["employee"]  employee_id=89604c9b-bcc6-464f-8b24-ce525a607788

PATCH full_name → 403 HRM-EMP-403
PATCH custom_fields { gender } → 403 HRM-EMP-403
PATCH custom_fields { phone_number, work_phone, gender:should_ignore }
→ 200 HRM-EMP-202; merge keeps grade/tenant_id/…; gender stays "Nữ"; phones stick on GET ?company_id=holding
PATCH avatar_url → 200
```

---

## Residuals / pollution

| Item | Severity | Note |
|------|----------|------|
| `uat.nv0001` row pollution from session A | P2 | `full_name` set to `SHOULD_NOT_APPLY`; CF wiped to `{gender:female}`; avatar overwritten. Later mobile login returned **401** (cannot restore via same account this session). |
| Manager/CEO ESS deny gap | **P0** | Blocks AC-ESS-01 exit on mandated persona + any manager JWT. |
| Device J-MOB-12 | deferred | After BE fix + WAVE-APK; do **not** promote on this FAIL. |

---

## Recommended Dev-BE fix (options — pick one, document in evidence)

| Option | Behavior | Fits mobile ESS |
|--------|----------|-----------------|
| **A (recommended)** | If `jwt.employee_id === :id`, always apply **self allowlist** (avatar + phone CF keys) regardless of `manager`/`hr_manager` in roles; keep `canFullEmployeeUpdate` for **other** employees | CEO/manager can edit own SĐT; cannot self-edit `full_name`/gender |
| B | Keep HR-full on self; change QA persona to employee-only (`uat.nv0016`) and update PM exit | Leaves managers able to self-write any field via mobile profile |

Add jest: self PATCH deny for JWT with `roles:['employee','manager','hr_manager']` and matching `employee_id`.

---

## Handoff

- **ack_status:** `FAIL_TO_PM`
- **next_owner:** `dev-be`
- **evidence_path:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-qa-20260719.md`
- **prior Dev:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-20260719.md`

### next_dispatch_prompt

```text
work_item_id: PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1
from_role: pm
to_role: dev-be
lane: execution
residual_auto_fix: true

## Entry
QA FAIL: docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-qa-20260719.md
Root cause: canFullEmployeeUpdate(manager|hr_manager) bypasses ESS self allowlist; uat.nv0001 is CEO → roles include hr_manager. Employee-only uat.nv0016 already PASSes all 4 exit checks.

## Exit
1) Prefer Option A: when jwt.employee_id === :id, assertEmployeeUpdateAllowed uses SELF allowlist even if roles include manager/hr_manager.
2) Jest: self full_name + gender-only → HRM-EMP-403 with roles ["employee","manager","hr_manager"] and matching employee_id; phone merge still 2xx.
3) Restore/document uat.nv0001 pollution if still broken (login 401 / full_name SHOULD_NOT_APPLY) — no seed of new business data.
4) READY_FOR_QA evidence; U65 no-seed; no open-all-fields.

## Cấm
seed; Phase1/PROD claim; waive without Option A or B recorded on bus
```
