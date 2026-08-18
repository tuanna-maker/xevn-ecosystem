# D-BE-MOB-AUTH-CEO-HASH-01 — Portal Group CEO mobile login after tenant-master reset

| Field | Value |
|-------|--------|
| **work_item_id** | `D-BE-MOB-AUTH-CEO-HASH-01` |
| **date** | 2026-07-30 (ICT) |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | true · **U65** no bulk seed |

---

## Decision

**Option B (lazy product ensure)** — not Option A-only portal bypass.

After tenant-master reset (`employees=0`), mobile login for `ceo@xe.vn` / `Xevn@2026`:

1. On first successful portal-password match with **zero** active employee rows → idempotent `INSERT` holding `PORTAL-GCEO` row with `custom_fields.mobile_password_hash = sha256('ceo@xe.vn:Xevn@2026')`.
2. `verifyPassword` accepts documented portal Group CEO password when hash missing **or stale** (blocks prior “hash present but wrong → no pilot fallback” 401).
3. Mirrors recruitment bridge `ensureHoldingPortalGroupCeoEmployee` pattern — **not** `seed:hrm:1000-uat` / fidelity seed.

Rationale: UC-HRM-MOB-03 requires employee identity + JWT `employee_id`; portal-only JWT bypass would break attendance/membership flows.

---

## Files changed

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/auth/mobile-auth.service.ts` | ensure row + portal password path + `@CODE-MEMORY-CHANGE` |
| `apps/api/hrm-api/src/auth/mobile-auth.service.spec.ts` | +3 tests D-BE-MOB-AUTH-CEO-HASH-01 |

---

## Verification

```bash
cd apps/api/hrm-api
pnpm exec jest src/auth/mobile-auth.service.spec.ts --no-cache
# Test Suites: 1 passed · Tests: 23 passed
```

### Live smoke (when stack up)

```bash
curl -s -X POST http://127.0.0.1:28001/api/hrm/auth/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ceo@xe.vn","password":"Xevn@2026"}'
# Expect 200 + access_token + employee_code PORTAL-GCEO + company_uuid = HRM_COMPANY_UUID_BY_SLUG.holding
```

Pre-condition: post `D-DEV-RESET-TENANT-MASTER-01` (HRM employees=0, portal membership intact).

---

## Security / env

| Env | Behavior |
|-----|----------|
| `NODE_ENV !== production` | Portal password default `Xevn@2026` (override `HRM_PORTAL_GROUP_CEO_PASSWORD`) |
| `NODE_ENV === production` | Portal password **only** if `HRM_PORTAL_GROUP_CEO_PASSWORD` set |
| Scope | **Only** `ceo@xe.vn` — subsidiary CEOs unchanged |

---

## Residual

- Subsidiary CEO mobile (`du-lich.ceo@xe.vn`, …) still requires HRM employee row or `seed:hrm:mobile-account` — out of scope this WI.
- `catalog-extensions` sync: grep shows no `mobile_password_hash` overwrite — no change needed.

---

## completion_report

**Closed:** Group CEO mobile login path after clean tenant-master reset without bulk workforce seed; jest 23/23; documented Option B lazy ensure.

**Open:** QA live probe + U65 device path (`QA-MOB-G-ORPH-KHOI-01-R1`).

---

## next_owner

`qa`

---

## next_dispatch_prompt

```text
work_item_id: QA-D-BE-MOB-AUTH-CEO-HASH-01
from_role: pm
to_role: qa
lane: execution
entry: dev-be READY_FOR_QA D-BE-MOB-AUTH-CEO-HASH-01 — post tenant-master reset employees=0; evidence docs/qa/evidence/d-be-mob-auth-ceo-hash-01-20260730.md
exit: L0 qc:dev-stack; POST :28001/api/hrm/auth/mobile/login ceo@xe.vn / Xevn@2026 → 200, employee_code PORTAL-GCEO, company_uuid Plane B′ holding; wrong password → 401; U65 zero-seed (no seed:hrm:1000); optional unblock QA-MOB-G-ORPH-KHOI-01 authenticated OU probe; ack_status PASS_TO_PM; evidence docs/qa/evidence/qa-d-be-mob-auth-ceo-hash-01-20260730.md
read_first: docs/qa/evidence/d-be-mob-auth-ceo-hash-01-20260730.md · docs/qa/evidence/d-dev-reset-tenant-master-01-20260730.md
cấm: seed bulk workforce · probe-only UF 🟢
```

---

## evidence_path

`docs/qa/evidence/d-be-mob-auth-ceo-hash-01-20260730.md`
