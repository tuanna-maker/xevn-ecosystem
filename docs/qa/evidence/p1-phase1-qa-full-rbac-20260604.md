# QA evidence — P1-PHASE1-QA-FULL-RBAC-01 (2026-06-04)

work_item_id: P1-PHASE1-QA-FULL-RBAC-01  
ack_status: PASS_TO_PM

| Field | Value |
|-------|--------|
| **work_item_id** | P1-PHASE1-QA-FULL-RBAC-01 |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 |
| **environment** | HTTPS pilot `PORTAL_DEV_URL=https://14-225-217-232.nip.io` (authoritative); local stack **down** |

## Deploy retest — `P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01` (2026-06-04)

After DevOps `P1-PHASE1-DO-XBOS-BE-SCOPE-DEPLOY-01` (`READY_FOR_QA`):

| Check | Result |
|-------|--------|
| `node scripts/tmp-phase1-be-scope-crud-probe.mjs` on nip.io | **exit 0** — `PROBE_OK`; GET shareholders **200** `XBOS-SHR-200` |
| J-CC-02 browser (optional) | Settings → **XE_DU_LICH** edit — **Danh sách Cổ đông** visible; **no** preload WARN / 409 banner |
| QC condition | **C-RBACQC-02** → **closed** for QC re-gate |

Journey note: `docs/qa/evidence/p1-phase1-qa-scope-crud-journey-20260604.md`

---

## Executive verdict (U28 RBAC — closes QC **C-RBACQC-01**)

| Slice | Verdict | Class |
|-------|---------|-------|
| Group CEO L2 + L2.5 API (nip.io) | **PASS** 23/23 + 7/7 | PRODUCT |
| Group CEO JWT 24h | **PASS** `expiresInSec=86400` | PRODUCT |
| Group CEO member legal PUT (API) | **PASS** 4/4 `XBOS-ORG-201` | PRODUCT |
| Group CEO HRM rollup density (`company_id=main`) | **PASS** (portal-proxy persona) | PRODUCT |
| Member CEO negative (`du-lich.ceo@xe.vn`) | **PASS** GMU **403**, KPI holding **409** | RBAC negative |
| Member legal GET shareholders (group CEO, member headers) | **PASS** HTTP **200** `XBOS-SHR-200` | PRODUCT — **C-RBACQC-02 closed** (retest below) |
| `verify-hrm-persona-scope-probes.mjs` (stock script) | **FAIL** exit **1** | **ENV** — `portalLogin` uses `uat-http` → `127.0.0.1:28002`; portal-equivalent run **PASS** below |

**Not claimed:** Phase 1 program DONE; PROD-READY; full local L0/L1; browser J-CC-02 L2.5 (tracked separately in `p1-cc-qa-member-legal-save-l25-20260604.md`).

---

## Command table

| # | Command | Exit | Verdict | Class |
|---|---------|------|---------|-------|
| 1 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | **0** | **PASS** | PRODUCT — L2 **23/23**, L2.5 **7/7**, `member-kpi-negative` **409** |
| 2 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io pnpm run test:xbos:cc-member-save` | **0** | **PASS** | PRODUCT — **4/4** member PUT **200** `XBOS-ORG-201` |
| 3 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/verify-hrm-persona-scope-probes.mjs` | **1** | **FAIL** | **ENV** — `ECONNREFUSED 127.0.0.1:28002` (script not portal-aware for login) |
| 3b | Portal-proxy persona replay (same paths as #3, login via `/api/xbos/auth/login`) | **0** | **PASS** | PRODUCT — see persona matrix |
| 4 | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs` | **0** (2026-06-04 deploy retest) | **PASS** | PRODUCT — GET entity **200**; GET shareholders **200** `XBOS-SHR-200`; PUT **200**; member block **409** — **PROBE_OK** |
| 5 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md` | **0** | **PASS** | PROCESS — closes **C-RBACQC-01** |

---

## Persona matrix (U28)

| Persona | Account | Check | HTTP / outcome | Verdict |
|---------|---------|-------|----------------|---------|
| Group CEO | `ceo@xe.vn` | JWT TTL | `expiresInSec=86400` (`P-CC-01-jwt`) | **PASS** |
| Group CEO | `ceo@xe.vn` | KPI rollup `companyId=holding` | **200** `XBOS-KPI-202` (`J-CC-03`) | **PASS** |
| Group CEO | `ceo@xe.vn` | `group-member-units` | **200** `XBOS-TENANT-200` | **PASS** |
| Group CEO | `ceo@xe.vn` | HRM employees `company_id=main` | **200**, total **1100** | **PASS** |
| Group CEO | `ceo@xe.vn` | HRM contracts `company_id=main` | **200**, total **777** | **PASS** |
| Group CEO | `ceo@xe.vn` | Member legal PUT ×4 | **200** `XBOS-ORG-201` each | **PASS** |
| Group CEO | `ceo@xe.vn` | GET legal-entity + member tenant headers | **200** `XBOS-ORG-200` | **PASS** |
| Group CEO | `ceo@xe.vn` | GET shareholders (member tenant headers) | **200** `XBOS-SHR-200` | **PASS** — **C-RBACQC-02 closed** |
| Member CEO | `du-lich.ceo@xe.vn` | `group-member-units` | **403** `XBOS-TENANT-403` | **PASS** (negative) |
| Member CEO | `du-lich.ceo@xe.vn` | KPI rollup `companyId=holding` | **409** `SCOPE_CONTEXT_MISMATCH` | **PASS** (negative) |
| Member CEO | `du-lich.ceo@xe.vn` | HRM employees (own scope) | **200**, total **10** (not 1100 rollup) | **PASS** |
| Member CEO | `du-lich.ceo@xe.vn` | GET `xevn/main` legal entity rollup | **409** blocked | **PASS** (negative) |

---

## P-CC / J-* verdict table (pilot API — this run)

| ID | Read (L2) | Cross-nav / mutate (L2.5) | Verdict |
|----|-------------|---------------------------|---------|
| P-CC-01 | login + jwt **PASS** | — | **PASS** |
| P-CC-02..09 | all **PASS** (probe) | — | **PASS** |
| J-CC-02 | list/mutate API **PASS** (4/4 PUT) | Edit **XE_DU_LICH** — shareholders preload **PASS** (no WARN); save history in `p1-cc-qa-member-legal-save-l25-20260604.md` | **PASS** |
| J-CC-03 | rollup **200** | member KPI negative **409** | **PASS** |
| J-HRM-01..07 | embed paths **200** | list→detail API **7/7 PASS** | **PASS** |
| J-XBOS-01 | workflow tasks **200** | — | **PASS** |
| member-kpi-negative | — | `du-lich.ceo` holding **409** | **PASS** (negative) |

---

## CRUD / scope matrix (touched modules)

| Module | Persona | Operation | Result | Verdict |
|--------|---------|-----------|--------|---------|
| org-foundation legal-entity | Group CEO | **R** GET by id (member headers) | **200** | **PASS** |
| org-foundation shareholders | Group CEO | **R** GET (member headers) | **200** `XBOS-SHR-200` | **PASS** — post `P1-PHASE1-DO-XBOS-BE-SCOPE-DEPLOY-01` |
| org-foundation legal-entity | Group CEO | **U** PUT XE_DU_LICH | **200** `XBOS-ORG-201` | **PASS** |
| org-foundation legal-entity | Member CEO | **R** GET rollup `xevn/main` | **409** | **PASS** (negative) |
| tenant-scope GMU | Member CEO | **R** list | **403** | **PASS** (negative) |
| kpi-engine rollup | Member CEO | **R** holding | **409** | **PASS** (negative) |
| HRM employees/contracts | Group CEO | **R** `company_id=main` | **200** + density | **PASS** |

---

## Residual

| ID | Item | Owner | Class | Blocks U28 API slice? |
|----|------|-------|-------|----------------------|
| ~~**C-RBACQC-02**~~ | Shareholders GET — **closed** 2026-06-04 deploy retest (`P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01`) | — | PRODUCT | Probe **200**; browser J-CC-02 edit **XE_DU_LICH** — no preload WARN on cổ đông block |
| **C-RBACQC-04** | Full member CEO + HRBP P-CC + J-HRM **browser** L2.5 on nip.io | **qa** | PROCESS | Deferred |
| **ENV-LOCAL** | Local `qc:dev-stack` / `verify-hrm-persona-scope-probes.mjs` direct API | **devops** | ENV | Does not NO-GO nip.io RBAC API evidence |

---

## QC evidence pack

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md
```

---

## completion_report

**Closed (C-RBACQC-01):** Consolidated QA pack for Phase 1 U28 RBAC on nip.io — HTTPS probe **exit 0**, member save **4/4**, portal-proxy persona density **PASS**, member CEO negatives **403/409** confirmed.

**Closed (C-RBACQC-02):** Post-deploy retest `P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01` — scope probe **PROBE_OK**; shareholders **200**; J-CC-02 edit preload **PASS** (no WARN).

**Open:** Stock `verify-hrm-persona-scope-probes.mjs` needs portal-login fix or always run with local stack up; **C-RBACQC-04** browser L2.5 deferred.

## next_owner

**qc** — re-gate U28 RBAC slice; promote **C-RBACQC-02** to **CLOSED** on `p1-phase1-qc-full-rbac-*.md`.

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-RBAC-C02-CLOSE-01
from_role: pm
to_role: qc
lane: governance

Close QC condition C-RBACQC-02 after QA deploy verify P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01 PASS.

Entry: docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md (deploy retest §) + docs/qa/evidence/p1-phase1-qa-scope-crud-journey-20260604.md
Verify: shareholders row PASS; PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs exit 0; no regression on test:xbos:cc-member-save 4/4.
Exit: Update p1-phase1-qc-full-rbac-20260604.md — C-RBACQC-02 CLOSED; GO or GWC for U28 RBAC API slice per residual table.
```

## evidence_path

`docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md`

## ack_status

**PASS_TO_PM** — U28 RBAC API slice **PASS** on nip.io; **C-RBACQC-01** closed; **C-RBACQC-02** closed on deploy retest (`P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01`) — dispatch **qc** for gate promotion.
