# P1-S1-QA-BE-01 — Catalog M01 slice retest (QA)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-S1-QA-BE-01 (covers P1-S1-BE-01) |
| **date** | 2026-05-23 |
| **owner** | QA |
| **dev_handoff** | `docs/qa/evidence/p1-s1-be-01-catalog-20260523.md` |
| **verdict** | **PASS** → bus `PASS_TO_PM` |

## Entry criteria (from bus)

- Dev-BE `READY_FOR_QA` for P1-S1-BE-01
- ADR `docs/decisions/ADR-XBOS-M01-OPENAPI-BOUNDARIES.md`
- OpenAPI M01-Catalog paths in `docs/api/openapi/xbos-api.yaml`

## Commands executed

| Command | Exit | Result |
|---------|------|--------|
| `pnpm verify:openapi-m01` | 0 | PASS — `docs/api/openapi/xbos-api.yaml` |
| `pnpm --filter xbos-api test` | 0 | **12 suites, 40 tests** PASS |
| `pnpm --filter xbos-api exec jest src/common/scope-context.spec.ts` | 0 | **1 test** PASS |
| `pnpm --filter xbos-api exec jest config-sync.controller.spec.ts catalog-governance.controller.spec.ts` | 0 | **2 suites, 15 tests** PASS |

**Environment:** Windows dev host; repo root `xevn-ecosystem`; no commit.

## Exit criteria mapping

| Criterion | Evidence |
|-----------|----------|
| config-sync publish/list/get scope aligned | `config-sync.controller.spec.ts` — publish JWT/body alignment; scope mismatch throws before service |
| catalog-governance claim-first + holding default | `catalog-governance.controller.spec.ts` — auth 401, tenant-only list, workflow start |
| holding vs main **409** on publish + group workflow | See §409 scope tests below |
| jest + build (dev claimed) | Full xbos-api **40/40** PASS (reproduced); build not re-run (out of QA slice — dev evidence) |

## 409 / scope mismatch coverage (automated)

| Suite | Case | Expected |
|-------|------|----------|
| `config-sync.controller.spec` | `rejects scope mismatch before service read` | `companyId mismatches token scope` |
| `config-sync.controller.spec` | `rejects publish when body companyId drifts from JWT holding scope` | publish `main` vs JWT `holding` rejected |
| `config-sync.controller.spec` | `publish passes JWT-aligned holding scope to service` | aligned publish forwards scoped payload |
| `catalog-governance.controller.spec` | inbox holding mismatch | `SCOPE_CONTEXT_MISMATCH` |
| `catalog-governance.controller.spec` | approve holding mismatch | `SCOPE_CONTEXT_MISMATCH` |

`scope-context.spec.ts`: shared resolver behavior **PASS** (1 case).

## OpenAPI M01

`verify-openapi-m01` confirms controller/route contract alignment for M01 catalog slice per ADR.

## Defects

None opened for P1-S1-BE-01 scope.

## Residual risk (not blocking this handoff)

| Item | Owner | Note |
|------|-------|------|
| L1 `UAT-XBOS-CAT-*` live probes | P1-S1-QA-01 | Not in P1-S1-QA-BE-01 scope; schedule with stack + `ceo@xe.vn` |
| L2 Command Center catalog routes | P1-S1-QA-01 | Matrix row owner per `PILOT_BUSINESS_FLOW_MATRIX.md` |
| Cold deploy API restart | DevOps / Dev-BE | Required if not on `nest --watch` |

## Recommendation

**PASS_TO_PM** — M01 catalog BE slice meets automated exit criteria; unblock P1-S1-FE-01 KPI/catalog rail and fold into broader P1-S1-QA-01 UAT when stack ready.
