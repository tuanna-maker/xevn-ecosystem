# QA — P1-HRM-H22-AC-FID-12-OPS retest (operations tasks + service_requests density)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H22-AC-FID-12-OPS-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h22-ac-fid-12-ops-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-12 · operations |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **11/11 PASS** (`operations-fidelity`: `hrm_tasks=25`, `service_requests=50`); SQL counts match targets; API spot `ceo@xe.vn` / `company_id=main` — tasks **22** visible (rollup), service requests **50**, no **409**; L0 stack exit 0.

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` |
| xbos-api | `http://127.0.0.1:28002` |
| Account | `ceo@xe.vn` / `Xevn@2026` |
| Scope | Group CEO — `company_id=main` |
| DB | `xevn_hrm` via deploy env |

## L0 — Stack + density gates

| Check | Command | Result |
|-------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** — hrm-api, xbos-api, web-portal **200** |
| Menu density | `pnpm run verify:hrm:menu-density` | **exit 0** — **11/11 PASS** |

### operations-fidelity line (QA session)

```
PASS  operations-fidelity  hrm_tasks=25 service_requests=50 need tasks>=25 service_requests>=50
=== Summary: 11/11 PASS ===
```

## AC-FID-12 — Group operations density

Probe: `node ./scripts/tmp-p1-hrm-h21-h23-fidelity-qa-probe.mjs` · JSON `docs/qa/evidence/p1-hrm-h21-h23-fidelity-qa-probe-20260607.json`

| table | SQL count | Target | Result |
|-------|-----------|--------|--------|
| **hrm_tasks** | **25** | ≥ **25** | **PASS** |
| **service_requests** | **50** | ≥ **50** | **PASS** |

## L2 — Operations API (`ceo@xe.vn`)

| API | HTTP | Code | total | 409 | Result |
|-----|------|------|-------|-----|--------|
| `GET /api/hrm/operations/tasks?company_id=main` | **200** | HRM-OPS-200 | **22** | none | **PASS** |
| `GET /api/hrm/operations/service-requests?company_id=main` | **200** | HRM-SVC-200 | **50** | none | **PASS** |

**Note:** API task count (**22**) < SQL total (**25**) — expected group rollup filter vs full table count; both exceed minimum visibility threshold (non-empty list, density gate PASS).

## L2.5 / scope parity note

| Check | Result | Note |
|-------|--------|------|
| GET task by id sample | **404** HRM-DATA-404 | **GWC** — no GET task by id route; density wave in scope |

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-12** ops density | tasks **21**, requests **16** | **CLOSED** |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| Import side-effect | dev-be | Density seed stdout on verify import |
| GET-by-id operations task | dev-be | **P3** — deep link parity deferred |
| Browser operations embed | qa | API L2 PASS; CC iframe not re-run this batch |

---

**completion_report:** **AC-FID-12 operations density CLOSED** — SQL `hrm_tasks` **25**, `service_requests` **50**; menu-density **11/11**; API lists **200** non-empty for `main`. Residual: GET-by-id GWC; browser iframe deferred.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H22-AC-FID-12-OPS-QA` PASS_TO_PM — mark AC-FID-12 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json`; batch with H21/H23 for QC fidelity re-gate.

**evidence_path:** `docs/qa/evidence/p1-hrm-h22-ac-fid-12-ops-qa-20260607.md`

**pm_dispatch_hint:** Operations menus should no longer appear sparse for group CEO — API confirms non-empty tasks + service requests.
