# BE-HRM-G-BOOT-01-VERIFY-01 — Bootstrap env SoT verify (DevOps slice)

**Date:** 2026-07-22  
**work_item_id:** `BE-HRM-G-BOOT-01-VERIFY-01`  
**from_role:** pm → **devops** (narrow env verify)  
**spec_ref:** TechSpec `docs/hrm/TECHSPEC.md` §6.1 · §16.5 #52 · §16.9 **G-BOOT-01** · FR-HRM-BOOT-01 / BR-HRM-08  
**code_sot:** `apps/api/hrm-api/src/common/tenant-scope-env.ts`  
**TM entry:** `docs/qa/evidence/tm-hrm-code-spec-convention-w2d-01-20260722.md` §4.2  
**Scope:** VERIFY only — env keys documented + present on `:8088`/VPS dev. **No** secret commit · **no** seed · **NOT** Phase1/PROD.

---

## 1. Checklist

| # | Item | Result |
|---|------|--------|
| 1 | HRM/XBOS bootstrap env keys documented **or** script exit 0 on `:8088`/dev | **PASS** (docs + VPS runtime) |
| 2 | Evidence this file | **PASS** |
| 3 | `PASS_TO_PM` / `READY_FOR_QA` | **PASS_TO_PM** (env slice) |
| 4 | Residual clear (env slice) | **PASS** — see §5 for out-of-slice BE grep |
| 5 | next_dispatch if fail | N/A (env PASS) |

---

## 2. Documentation SoT (§6.1)

| Key (TechSpec) | Role | Documented where |
|----------------|------|------------------|
| `MASTER_TENANT_ID` | Primary tenant master bootstrap | `deploy/xevn-ecosystem/.env.example` L40 · TechSpec §6.1 · ecosystem TechSpec |
| `DEFAULT_TENANT_ID` | Alias of master tenant | TechSpec §6.1 · `tenant-scope-env.ts` · bootstrap `MERGE_KEY_PREFIXES` |
| `DEFAULT_COMPANY_ID` | Primary company header bootstrap | `.env.example` L41 · TechSpec §6.1 |
| `DEFAULT_COMPANY_HEADER_ID` | Alias of default company | TechSpec §6.1 · `tenant-scope-env.ts` |

**Code contract:** `masterTenantIdFromEnv()` / `defaultCompanyIdFromEnv()` return `''` if unset (no silent fake ĐV). Catalog-sync raises `HRM-SYNC-CONF` when bootstrap values missing (`catalog-sync.service.ts`).

**Bootstrap merge:** `scripts/xevn-ecosystem-bootstrap.mjs` merges `MASTER_TENANT_ID`, `DEFAULT_COMPANY_ID`, `DEFAULT_TENANT_ID` into deploy `.env`.

**Compose:** `hrm-be` / `xbos-be` load `env_file: deploy/xevn-ecosystem/.env` → keys reach containers without hardcoding in `docker-compose.yml` `environment:` block.

---

## 3. Runtime verify — VPS `:8088` (2026-07-22)

Host: `14.225.217.232` · compose dir `/opt/xevn-ecosystem/deploy/xevn-ecosystem`  
Values **not** recorded (redacted).

### 3.1 Deploy `.env` key presence

| Key | Presence |
|-----|----------|
| `MASTER_TENANT_ID` | **SET** |
| `DEFAULT_COMPANY_ID` | **SET** |
| `DEFAULT_TENANT_ID` | MISSING (OK — alias unused when primary set) |
| `DEFAULT_COMPANY_HEADER_ID` | MISSING (OK — alias unused when primary set) |

### 3.2 Container `printenv` (presence only)

| Container | `MASTER_TENANT_ID` | `DEFAULT_COMPANY_ID` | Alias keys |
|-----------|--------------------|----------------------|------------|
| `xevn-hrm-be-dev` | **SET** | **SET** | UNSET (expected) |
| `xevn-xbos-be-dev` | **SET** | **SET** | UNSET (expected) |

### 3.3 L0 smoke (VPS loopback + public)

| Endpoint | HTTP |
|----------|------|
| `:8088/` | **200** |
| `:3001/api/hrm/` | **200** |
| `:28002/api/xbos/` | **200** |

Public re-check from agent host: `8088:200` · `hrm3001:200` · `xbos28002:200`.

### 3.4 Local Windows workspace

| Check | Result |
|-------|--------|
| `deploy/xevn-ecosystem/.env` primary keys | **SET** (`MASTER_TENANT_ID`, `DEFAULT_COMPANY_ID`) |
| Local `:8088` | DOWN (not used for this wave — VPS `:8088` is SoT UAT host) |

---

## 4. Verdict (DevOps env slice)

| Gate | Verdict |
|------|---------|
| Env keys documented (§6.1 / `.env.example`) | **PASS** |
| Primary keys on VPS `.env` + containers | **PASS** |
| Portal `:8088` + HRM/XBOS API smoke | **PASS** |
| Secrets committed | **No** |
| Seed run | **No** |
| Phase1 / PROD claim | **No** |

**Overall (this work_item DevOps slice):** **PASS** → `ack_status: PASS_TO_PM`

---

## 5. Residual (out of this DevOps slice)

| ID | Item | Owner | Note |
|----|------|-------|------|
| R1 | G-BOOT-01 **business mutate hardcode grep** (literal tenant/company bypassing `resolveScopeContext`) | `dev-be` (+ TM spot) | TM §4.2 job 1–3 — **not** closed by env verify |
| R2 | Optional: comment aliases `DEFAULT_TENANT_ID` / `DEFAULT_COMPANY_HEADER_ID` in `.env.example` | devops (chore) | Non-blocking — TechSpec already documents OR aliases |
| R3 | `DEFAULT_COMPANY_HEADER_ID` not in bootstrap `MERGE_KEY_PREFIXES` | devops (chore) | Non-blocking while `DEFAULT_COMPANY_ID` is SoT |

---

## 6. completion_report

**Closed:** DevOps narrow verify for G-BOOT-01 env SoT — keys documented; primary keys SET on VPS `:8088` stack for hrm-be + xbos-be; L0 smoke 200; no secret/seed/Phase1/PROD.

**Open:** Product hardcode mutate VERIFY table (TM C2 remainder) → `dev-be`.

**ack_status:** `PASS_TO_PM`  
**next_owner:** `pm` → dispatch `dev-be` for R1 hardcode grep (or close G-BOOT-01 product if BE already done in parallel)

---

## 7. next_dispatch_prompt (copy-ready)

```text
work_item_id: BE-HRM-G-BOOT-01-HARDCODE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
code_allowed: true

## Entry
DevOps env slice PASS: docs/qa/evidence/be-hrm-g-boot-01-verify-01-20260722.md
TM: docs/qa/evidence/tm-hrm-code-spec-convention-w2d-01-20260722.md §4.2
TechSpec §6.1 · §16.9 G-BOOT-01 · tenant-scope-env.ts
cấm: seed · wipe ADR · Phase1/PROD · change env secrets

## Job
1. Grep business mutate for literal tenant/company bypassing resolveScopeContext / persist helpers
2. Classify: OK pilot constant vs FAIL hardcode
3. Fix only FAIL paths; keep env SoT for DDL/bootstrap
4. Evidence table path · literal · verdict — append or new docs/qa/evidence/be-hrm-g-boot-01-hardcode-01-YYYYMMDD.md
5. READY_FOR_QA or PASS_TO_PM if zero FAIL

entry_criteria: env SoT PASS (devops evidence)
exit_criteria: hardcode evidence table complete; no FAIL residual OR fixed+tested
```

---

## 8. Commands run (no secrets)

```text
# Local key presence (redacted)
Select-String deploy/xevn-ecosystem/.env -Pattern '^(MASTER_TENANT_ID|DEFAULT_COMPANY_ID)='

# Public smoke
curl.exe http://14.225.217.232:8088/          → 200
curl.exe http://14.225.217.232:3001/api/hrm/  → 200
curl.exe http://14.225.217.232:28002/api/xbos/ → 200

# VPS (plink): .env key presence + docker exec printenv presence + loopback smoke → §3
```
