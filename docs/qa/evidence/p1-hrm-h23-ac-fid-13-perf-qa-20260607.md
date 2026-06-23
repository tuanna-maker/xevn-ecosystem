# QA — P1-HRM-H23-AC-FID-13-PERF retest (performance cycles + evaluations density)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H23-AC-FID-13-PERF-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h23-ac-fid-13-perf-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-13 · performance |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **11/11 PASS** (`performance-fidelity`: cycles **14**, evaluations **300**); SQL counts meet targets; API spot `ceo@xe.vn` / `company_id=main` — cycles **14**, evaluations **300**, no **409**; L0 stack exit 0.

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

### performance-fidelity line (QA session)

```
PASS  performance-fidelity  performance_cycles=14 evaluations=300 need cycles>=5 evals>=300
=== Summary: 11/11 PASS ===
```

## AC-FID-13 — Group performance density

Probe: `node ./scripts/tmp-p1-hrm-h21-h23-fidelity-qa-probe.mjs` · JSON `docs/qa/evidence/p1-hrm-h21-h23-fidelity-qa-probe-20260607.json`

| metric | SQL count | Target | Result |
|--------|-----------|--------|--------|
| **performance_cycles** | **14** | ≥ **5** | **PASS** |
| **performance_evaluations** | **300** | ≥ **300** | **PASS** |

## L2 — Performance API (`ceo@xe.vn`)

| API | HTTP | Code | total | 409 | Result |
|-----|------|------|-------|-----|--------|
| `GET /api/hrm/performance/cycles?company_id=main` | **200** | HRM-PERF-200 | **14** | none | **PASS** |
| `GET /api/hrm/performance/evaluations?company_id=main` | **200** | HRM-PERF-200 | **300** | none | **PASS** |

**QA note:** Do **not** pass `page_size` on performance list DTOs — `forbidNonWhitelisted` returns **400** `HRM-VAL-001` (false FAIL if mis-probed).

## L2.5 / scope parity note

| Check | Result | Note |
|-------|--------|------|
| GET cycle by id sample | **404** HRM-DATA-404 | **GWC** — no GET cycle by id route; density wave in scope |

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-13** performance density | evals **10** | **CLOSED** |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | Density seed stdout on verify import |
| GET-by-id performance cycle | dev-be | **P3** — deep link parity deferred |
| Browser `/command-center/hrm/performance` iframe | qa | API L2 PASS; CC tab not re-run this batch |

---

**completion_report:** **AC-FID-13 performance density CLOSED** — SQL cycles **14**, evaluations **300**; menu-density **11/11**; API lists **200** non-empty for `main`. Residual: GET-by-id GWC; browser iframe deferred.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H23-AC-FID-13-PERF-QA` PASS_TO_PM — mark AC-FID-13 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json`; with H21/H22 PASS dispatch **qc** narrow fidelity batch re-gate (AC-FID-04..13) or AC-FID-14 wave per backlog.

**evidence_path:** `docs/qa/evidence/p1-hrm-h23-ac-fid-13-perf-qa-20260607.md`

**pm_dispatch_hint:** Performance tab API now returns **14** cycles + **300** evaluations for group CEO — embed should show data on refresh.
