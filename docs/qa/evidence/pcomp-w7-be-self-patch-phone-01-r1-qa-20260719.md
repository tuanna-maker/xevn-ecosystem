# PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1 — QA retest (Option A)

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-07-19 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | Dev-BE `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-20260719.md` READY_FOR_QA |
| **prior FAIL** | `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-qa-20260719.md` |
| **env** | local `hrm-api` `:28001` (`GET /api/hrm` → `HRM-HEALTH-200`); U65 zero-seed |
| **mandated persona** | `uat.nv0001@xe.vn` / `xevn-uat-2026` |
| **control persona** | `uat.nv0016@xe.vn` / `xevn-uat-2026` |
| **spec_ref** | `docs/hrm/MOBILE_W7_SRS_DELTA.md` §4.5 UC-HRM-MOB-12 · AC-ESS-01 · BR-ESS-01 · TechSpec §3.1 |

---

## Executive verdict

**PASS → PM** — Option A live: self ESS allowlist applies even when JWT includes `manager`|`hr_manager`. Mandated `uat.nv0001` closes prior FAIL (full_name / gender-only now `HRM-EMP-403`). Employee-only `uat.nv0016` still PASS (no regression).

**cấm respected:** no `pnpm seed:*`; no Phase1/PROD claim; no open-all-fields claim.

---

## Matrix (exit criteria)

| # | Expect | `uat.nv0001` (mandated) | `uat.nv0016` (employee-only) | Verdict |
|---|--------|-------------------------|------------------------------|---------|
| 1 | PATCH phones → 2xx; GET stick | **PASS** — PATCH **200** `HRM-EMP-202`; GET stick; gender/`tenant_id`/`mobile_password_hash` kept | **PASS** — PATCH **200**; GET stick; merge kept other CF keys; gender stays `Nữ` | OK |
| 2 | PATCH `full_name` → `HRM-EMP-403` | **PASS** — **403** `HRM-EMP-403`; name remains `Nguyễn Văn An` | **PASS** — **403** `HRM-EMP-403`; name remains `Lý Văn An` | closed prior FAIL |
| 3 | PATCH CF `{gender}` only → `HRM-EMP-403` | **PASS** — **403** `HRM-EMP-403`; CF not wiped | **PASS** — **403** `HRM-EMP-403`; CF intact | closed prior FAIL |
| 4 | PATCH `avatar_url` → 2xx | **PASS** — **200** `HRM-EMP-202`; GET stick | **PASS** — **200** `HRM-EMP-202`; GET stick | OK |

Overall wave: **PASS** (L1 AC on mandated + control personas).

---

## JWT / persona proof

| Persona | Login | JWT roles | `employee_id` | `company_id` |
|---------|-------|-----------|---------------|--------------|
| `uat.nv0001` | **201** `HRM-AUTH-200` | `["employee","manager","hr_manager"]` | `3796d949-4513-45c0-88fa-33030a062b17` | `holding` |
| `uat.nv0016` | **201** `HRM-AUTH-200` | `["employee"]` | `89604c9b-bcc6-464f-8b24-ce525a607788` | `holding` |

Pollution restore from Dev R1 confirmed: login with `xevn-uat-2026` works; `full_name=Nguyễn Văn An`; CF includes phones + `gender=Nam` + hash.

---

## Live session excerpt (`uat.nv0001`)

```text
POST /api/hrm/auth/mobile/login → 201 HRM-AUTH-200
roles=["employee","manager","hr_manager"]

PATCH /employees/:id { custom_fields: { phone_number, work_phone } }
→ 200 HRM-EMP-202; GET stick=true; afterGender=Nam; keys keep hash/tenant

PATCH /employees/:id { full_name: "SHOULD_NOT_APPLY_R1" }
→ 403 HRM-EMP-403; currentName=Nguyễn Văn An

PATCH /employees/:id { custom_fields: { gender: "female" } }
→ 403 HRM-EMP-403; CF not replaced

PATCH /employees/:id { avatar_url }
→ 200 HRM-EMP-202; GET stick=true
```

## Control excerpt (`uat.nv0016`)

```text
roles=["employee"]
phone PATCH 200 + stick; full_name 403; gender-only 403; avatar 200
```

---

## Jest reconfirm (QA)

```text
pnpm --filter hrm-api exec jest --testPathPatterns="employee-update-policy|employees.service.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 39 passed (2026-07-19)
```

---

## Residual

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| Device J-MOB-12 browser/APK | deferred | qa-device | After WAVE-APK — API gate closed; do not block this PASS |
| Avatar QA URL on rows | P3 / cosmetic | — | Prior Dev + this retest used `cdn.example.invalid/*`; self-clear attempted; not AC blocker |

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm` (optional `qa-device` for J-MOB-12 after APK)
- **evidence_path:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-qa-20260719.md`
- **prior Dev:** `docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-20260719.md`

### next_dispatch_prompt

```text
work_item_id: PCOMP-W7-BE-SELF-PATCH-PHONE-01-R1
from_role: pm
to_role: pm
lane: governance
residual_auto_fix: true

## Entry
QA PASS_TO_PM: docs/qa/evidence/pcomp-w7-be-self-patch-phone-01-r1-qa-20260719.md
Option A verified live: uat.nv0001 (manager|hr_manager) phones 2xx+stick; full_name/gender → HRM-EMP-403; avatar 2xx; uat.nv0016 no regression. Jest 39/39.

## Exit
1) Close residual PCOMP-W7-BE-SELF-PATCH-PHONE-01 / R1 on bus + TODO.
2) Optional: dispatch qa-device J-MOB-12 after WAVE-APK (device ESS self phone) — not required to close API gate.
3) Continue next PCOMP open backlog item (pm:idle:check / PM_OPEN_BACKLOG).

## Cấm
seed; reopen Option B persona waive; claim Phase1/PROD from this API PASS alone
```
