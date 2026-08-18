# Evidence — `PO-UC-TC-W4-STACK-JWT-PARITY-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-UC-TC-W4-STACK-JWT-PARITY-01` |
| **from_role** | `devops` |
| **to_role** | `qa` |
| **date** | 2026-08-04 |
| **lane** | execution |
| **priority** | P0 |
| **ack_status** | **READY_FOR_QA** |
| **U65** | honored — zero-seed · no invent Leave L2 · no prod deploy · secrets not committed |
| **prior** | [`po-uc-tc-w4-qa-e2-hrm-at-r1.md`](po-uc-tc-w4-qa-e2-hrm-at-r1.md) (BLOCKED — HRM-AUTH-001) |

---

## Executive verdict

| Gate | Result |
|------|--------|
| JWT secret/iss/aud parity (xbos ↔ hrm ↔ deploy) | **PASS** |
| Portal/XBOS login `ceo@xe.vn` → Bearer | **201** `XBOS-AUTH-200` |
| `GET /api/hrm/employees?company_id=trsport` | **200** `HRM-EMP-200` (not 401 `HRM-AUTH-001`) |
| Portal proxy same path (`:5173`) | **200** `HRM-EMP-200` |
| `pnpm run qc:fe-be-health` | **ALL PASS** |

**Ops blocker for AT-07 Eye→Duyệt is cleared at auth layer.** Product AT-07 / AT-12 remain for QA R2.

---

## Root cause (pre-fix)

| Layer | Observation |
|-------|-------------|
| File secrets (apps) | Both had `SERVICE_JWT_SECRET` placeholder label `replace_with_strong_secret` (sha12 `dd4e37ba68dd`) |
| `deploy/xevn-ecosystem/.env` | **Missing** `SERVICE_JWT_*` (only `.env.example` had canonical `xevn-dev-jwt-secret`) |
| Runtime class (QA R1) | When HRM process missed package `.env` (cwd / load-env), verify fell back to code default `xevn-dev-jwt-secret` while XBOS signed with package placeholder → HMAC fail → **401 HRM-AUTH-001** |
| iss/aud | Already `xevn-internal` / `xevn-api` (no change required beyond ensuring both load same values) |

---

## Actions taken (no secret values in evidence)

1. **Aligned** `SERVICE_JWT_SECRET` + `SERVICE_JWT_ISSUER` + `SERVICE_JWT_AUDIENCE` across:
   - `deploy/xevn-ecosystem/.env` (gitignored)
   - `apps/api/hrm-api/.env` (gitignored)
   - `apps/api/xbos-api/.env` (gitignored)
   - Canonical local label: `xevn-dev-jwt-secret` (sha12 **`824ee48ddf9b`**) — matches deploy `.env.example` + non-prod code default
2. **Aligned** app `.env.example` files to same local default (prevent placeholder drift).
3. **Hardened** `apps/api/hrm-api/src/load-env.ts` — `findMonorepoRoot()` + multi-candidate package `.env` (parity with xbos) so cwd drift cannot drop secret and reintroduce HMAC mismatch.
4. **Restarted** hrm-api (`:28001`) and xbos-api (`:28002`) after env change so both processes load the same secret.

**Not done:** seed · Leave L2 invent · commit `.env` · prod/VPS deploy.

---

## Proof commands (redacted)

```text
# File parity (hashes only)
node _tmp_jwt_parity_probe.mjs
# → secrets_equal true · sha12=824ee48ddf9b on hrm/xbos/deploy

# Live smoke
POST http://127.0.0.1:28002/api/xbos/auth/login  { ceo@xe.vn }
→ 201 XBOS-AUTH-200 · iss=xevn-internal · aud=xevn-api · exp-iat=86400
HMAC candidates: hrm_env/xbos_env/deploy_env/deploy_example/code_default = MATCH
                 placeholder(replace_with_strong_secret) = NO_MATCH

GET http://127.0.0.1:28001/api/hrm/employees?company_id=trsport
  Authorization: Bearer <portal token>
→ 200 HRM-EMP-200

# Portal FE proxy (same as browser)
POST http://127.0.0.1:5173/api/xbos/auth/login
GET  http://127.0.0.1:5173/api/hrm/employees?company_id=trsport
→ 200 HRM-EMP-200

pnpm run qc:fe-be-health → Summary: ALL PASS
```

### HMAC matrix (post-restart)

| Candidate | HMAC vs live CEO JWT |
|-----------|----------------------|
| `apps/api/hrm-api/.env` | MATCH |
| `apps/api/xbos-api/.env` | MATCH |
| `deploy/xevn-ecosystem/.env` | MATCH |
| `deploy/.../.env.example` | MATCH |
| code default `xevn-dev-jwt-secret` | MATCH |
| legacy placeholder `replace_with_strong_secret` | NO_MATCH |

---

## Stack snapshot (local UAT)

| Service | Port | Status |
|---------|------|--------|
| hrm-api | 28001 | up (Nest) |
| xbos-api | 28002 | up (`node dist/main.js`) |
| web-portal | 5173 | up |
| DB SoT | remote `DB_PORT=6432` | used by APIs (no seed this seat) |

---

## Residual / out of scope

| Item | Owner |
|------|--------|
| AT-07 Eye→Duyệt browser (NOTE-ATT-SCOPE) | QA R2 |
| AT-12 L1 only; L2 SPEC_GAP locked | QA R2 |
| Nest `xbos-api` watch looking for `dist/main` (no `.js`) on this machine | optional DevOps follow-up — worked around with `node dist/main.js` |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **next_dispatch_prompt:** see below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W4-QA-E2-HRM-AT-R2
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
hdsd_align: true

entry_criteria:
- L0: pnpm run qc:dev-stack + pnpm run qc:fe-be-health PASS
- JWT parity closed: docs/qa/evidence/po-uc-tc-w4-stack-jwt-parity-01.md (employees 200, not HRM-AUTH-001)
- Persona: ceo@xe.vn / Xevn@2026 · ATT companyId=trsport · portal :5173
- CẤM: seed · invent Leave L2 PASS · API inbox seed

scope:
- HRM-AT-07 only: HDSD Quản lý đơn → Đề nghị cập nhật công → Eye → Duyệt
  Evidence NOTE-ATT-SCOPE: POST update-requests/:id/approve 2xx + x-company-id + FE after 2xx + F5
- HRM-AT-12 L1 only (pending leave operable if present from FE chain)
- Leave L2: SPEC_GAP — do NOT PASS

exit_criteria:
- Evidence docs/qa/evidence/po-uc-tc-w4-qa-e2-hrm-at-r2.md
- ack_status PASS_TO_PM · promoted/not promoted explicit
- AT-07 🟢 or product FAIL with Network proof (not ops 401)
```

---

## completion_report

**Closed:** Local UAT JWT signing/verify parity (secret + iss/aud) between xbos-api and hrm-api; both APIs restarted; CEO Bearer → HRM employees `trsport` **200**; fe-be-health ALL PASS; load-env harden on hrm-api.

**Residual:** AT-07 / AT-12 product browser seats for QA R2; optional nest watch entrypoint quirk for xbos.
