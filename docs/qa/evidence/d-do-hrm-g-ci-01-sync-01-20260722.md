# D-DO-HRM-G-CI-01-SYNC-01 — DevOps evidence (Dev8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `D-DO-HRM-G-CI-01-SYNC-01` |
| **from_role** | `devops` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P1 |
| **executed_at** | 2026-07-22 ~20:01–20:10 ICT |
| **portal** | http://14.225.217.232:8088 |
| **HRM API** | http://14.225.217.232:3001/api/hrm/ · LB `:3101` · via portal `:8088/api/hrm/` |
| **entry** | `docs/qa/evidence/be-hrm-g-ci-01-20260722.md` (jest 43/43) · QA PARTIAL `docs/qa/evidence/qa-hrm-g-ci-01-20260722.md` (**BLOCKED-SYNC** `HRM-VAL-001`) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | No seed · no Phase1/PROD · no reopen G-AT10 / G-RC / JWT / G-DEC · non-xevn untouched |

---

## Executive summary

Synced G-CI-01 optional `end_date` (policy + DTO + service + migration `0018`) onto VPS bind-mount `/opt/xevn-ecosystem`. Applied **0018** (`end_date` **NO→YES** nullable). Nest-built `hrm-api`; force-recreated `hrm-be`×3. Authenticated smokes via `:8088` proxy **PASS**: fixed-term missing end → **400** `HRM-CON-002` (no longer `HRM-VAL-001`); indefinite / `HDLD_KTH` → **201** + `end_date` null; range still **400** `HRM-CON-001`. Cleanup DELETE of smoke rows **200**. Ready for **QA R2** (browser U65; FE optional bind still residual).

---

## 1) Pre-sync audit

| Check | Result |
|-------|--------|
| `xevn-hrm-be-dev` / `-2` / `-3` | Up healthy (~8h) |
| `contract-end-date-policy.ts` | **MISSING** on VPS |
| `migrations/hrm/0018_*` | **MISSING** |
| DTO `end_date` | required `@IsDateString()` (no `@IsOptional`) — explains QA `HRM-VAL-001` |
| Service `HRM-CON-002` / `assertContractEndDate` | **absent** |
| DB `employee_contracts.end_date` | `is_nullable=NO` |

---

## 2) Allow-list synced + migrate + rebuild

| Path | Local MD5 | Role |
|------|-----------|------|
| `apps/api/hrm-api/src/contracts-insurance/contract-end-date-policy.ts` | `cb063ea2fdb7af12218234dcaecd91e6` | open-ended detect + CON-002 |
| `apps/api/hrm-api/src/contracts-insurance/contract-end-date-policy.spec.ts` | `71391e4814f95996e18674ace27b1866` | unit (not runtime) |
| `apps/api/hrm-api/src/contracts-insurance/dto/create-contract.dto.ts` | `93e3fd3fc122e8644088f16ad85fcaae` | `end_date?` `@IsOptional` |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.ts` | `b693e17a052abe718b2015aa34350cb8` | assert + NULL insert |
| `apps/api/hrm-api/src/contracts-insurance/contracts-insurance.service.spec.ts` | `ef40e40c1f3574e9df26bf1ca253cd0f` | unit |
| `migrations/hrm/0018_employee_contracts_end_date_nullable.sql` | `7b0c5d074496bbcfa3e791325973d140` | DROP NOT NULL + CHECK |

### Ops

```text
pscp → /tmp/xevn-g-ci-01-sync-20260722.tar.gz (~11.8 KB)
tar -xzf … -C /opt/xevn-ecosystem
# migrate 0018 via node+pg inside hrm-be (DB_* parts; DATABASE_URL_HRM empty)
BEFORE is_nullable=NO → AFTER YES
CHECK: (end_date IS NULL) OR (start_date <= end_date)
docker exec xevn-hrm-be-dev → cd /app/apps/api/hrm-api && pnpm run build → BUILD_OK
dist: contract-end-date-policy.js present · HRM-CON-002 · assertContractEndDateForCreate
docker compose up -d --no-deps --force-recreate hrm-be hrm-be-2 hrm-be-3
```

**Cấm respected:** no `pnpm seed:*` · no `docker compose down` · no Phase1/PROD · no G-AT10/G-RC/JWT/G-DEC reopen · non-xevn untouched · no full monorepo rebuild.

---

## 3) L0 health

| Endpoint | HTTP |
|----------|------|
| `127.0.0.1:3001/api/hrm/` | **200** |
| `127.0.0.1:3011/api/hrm/` | **200** |
| `127.0.0.1:3012/api/hrm/` | **200** |
| `127.0.0.1:3101/api/hrm/` (LB) | **200** |
| `127.0.0.1:8088/` | **200** |
| `127.0.0.1:8088/api/hrm/metrics` | **200** |

| Container | Health |
|-----------|--------|
| `xevn-hrm-be-dev` / `-2` / `-3` | Up (healthy) after recreate |

---

## 4) G-CI-01 contract smoke (authenticated, U65 — no seed)

Persona: `ceo@xe.vn` / login `POST :8088/api/xbos/auth/login` → **201** `XBOS-AUTH-200`.  
Employee: `8ac84520-0d6b-4737-8341-2f9a929b5f81` · `company_id=main`.  
Path: `POST :8088/api/hrm/contracts-insurance/contracts`.

| Case | Status / code | Verdict |
|------|---------------|---------|
| `fixed_term` no `end_date` | **400** `HRM-CON-002` | **PASS** (was VAL-001) |
| `Hợp đồng 1 năm` no `end_date` | **400** `HRM-CON-002` | **PASS** |
| `Hợp đồng không thời hạn` no `end_date` | **201** `HRM-CON-201` · `end_date=null` · id `f835…` | **PASS** |
| `HDLD_KTH` no `end_date` | **201** `HRM-CON-201` · `end_date=null` · id `6528…` | **PASS** |
| start > end (indefinite label) | **400** `HRM-CON-001` | **PASS** (regression) |
| DELETE smoke ids | **200** / **200** | cleanup OK |

---

## Residual

| Item | Owner |
|------|-------|
| Browser UF open-ended create (FE still requires expiry toast) | **dev-fe** `FE-HRM-G-CI-01` (if not already dispatched) then **qa** R2 |
| QA R2 BE contract via Network after FE ready / or API probe confirm | **qa** |
| VPS git HEAD `2a7a02b` pscp drift | defer — promote via git when PM allows |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `pm` → dispatch **qa** (and **dev-fe** if FE bind still blocks browser open-ended)
- **evidence_path:** `docs/qa/evidence/d-do-hrm-g-ci-01-sync-01-20260722.md`
- **completion_report:** Closed D-DO-HRM-G-CI-01-SYNC-01 — G-CI-01 live on `:8088` BE (CON-002 / open-ended 201+null / CON-001). Migration 0018 applied. Residual = FE optional expiry + QA browser R2.
- **next_dispatch_prompt:** |

```text
work_item_id: QA-HRM-G-CI-01-R2
from_role: pm
to_role: qa
lane: execution
priority: P1
entry_criteria: D-DO-HRM-G-CI-01-SYNC-01 READY_FOR_QA — docs/qa/evidence/d-do-hrm-g-ci-01-sync-01-20260722.md; live :8088 BE: fixed-term no end_date → 400 HRM-CON-002; indefinite/HDLD_KTH no end_date → 201 end_date null; CON-001 still 400. If FE-HRM-G-CI-01 not READY, API Network probe via browser JWT still valid for BE AC; browser open-ended UF only after FE.
URL: http://14.225.217.232:8088 · persona ceo@xe.vn · employee HLD-0006 profile Hợp đồng
AC (U65 browser-only preferred): (1) fixed-term missing end → FE block OR Network 400 HRM-CON-002; (2) after FE READY — indefinite missing end → POST 201 + F5 end_date null; (3) start>end → HRM-CON-001. Cấm seed · cấm reopen G-AT10/G-RC/JWT/G-DEC.
evidence_path: docs/qa/evidence/qa-hrm-g-ci-01-r2-20260722.md
exit_criteria: PASS_TO_PM with UF click path + Network codes; update USER_FLOW matrix Dev8088 if applicable
```

### Parallel FE (if still open)

```text
work_item_id: FE-HRM-G-CI-01
from_role: pm
to_role: dev-fe
entry: BE+DO G-CI-01 live on :8088; FE useContracts still requires expiry_date before POST
exit: open-ended types allow empty end_date; fixed-term still require; READY_FOR_QA
cấm: seed · reopen G-AT10/G-RC/JWT/G-DEC
evidence_path: docs/qa/evidence/fe-hrm-g-ci-01-20260722.md
```
