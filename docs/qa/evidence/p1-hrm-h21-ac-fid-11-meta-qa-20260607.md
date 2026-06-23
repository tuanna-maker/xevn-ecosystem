# QA — P1-HRM-H21-AC-FID-11-META retest (metadata change requests density)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H21-AC-FID-11-META-QA` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **dev_evidence** | `docs/qa/evidence/p1-hrm-h21-ac-fid-11-meta-20260606.md` |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-11 · metadata queue |

## Verdict

**PASS_TO_PM** — Global `verify:hrm:menu-density` **11/11 PASS** (`metadata-fidelity`: linked **20**, pending **12**, historical **8**); SQL + API spot `ceo@xe.vn` / `company_id=main` — pending list **12**, all **20**, no **409**; L0 stack exit 0; unit tests **4/4** PASS.

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

### metadata-fidelity line (QA session)

```
PASS  metadata-fidelity  metadata_change_requests linked=20 pending=12 historical=8 need total>=20
=== Summary: 11/11 PASS ===
```

## AC-FID-11 — Metadata change requests ≥ 20 linked

Probe: `node ./scripts/tmp-p1-hrm-h21-h23-fidelity-qa-probe.mjs` · JSON `docs/qa/evidence/p1-hrm-h21-h23-fidelity-qa-probe-20260607.json`

| Metric | SQL | Target | Result |
|--------|-----|--------|--------|
| **linked_total** | **20** | ≥ **20** | **PASS** |
| **pending** | **12** | ≥ **1** (H-META) | **PASS** |
| **historical** | **8** | — | **PASS** |

## L2 — Metadata API (`ceo@xe.vn`)

| API | HTTP | Code | total | 409 | Result |
|-----|------|------|-------|-----|--------|
| `GET /api/hrm/employee-metadata/change-requests?company_id=main&status=pending` | **200** | HRM-META-200 | **12** | none | **PASS** |
| `GET /api/hrm/employee-metadata/change-requests?company_id=main` | **200** | HRM-META-200 | **20** | none | **PASS** |

## Unit tests

`pnpm --filter hrm-api test -- employee-metadata` — **4/4 PASS** exit 0

## L2.5 / scope parity note

| Check | Result | Note |
|-------|--------|------|
| GET-by-id sample | **404** HRM-DATA-404 | **GWC** — no GET change-request by id route; list density wave in scope; defer deep-link parity |

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-11** metadata density | **0** linked rows | **CLOSED** |
| **metadata list scope** (UUID filter) | empty list for `main` | **CLOSED** (dev fix verified) |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| R-H10-02 | dev-be | Density seed `main()` on import — noisy stdout |
| GET-by-id metadata | dev-be | **P3** — list→detail deep link not in AC-FID-11 |
| Browser decisions/metadata iframe | qa | API L2 PASS; full CC iframe not re-run this batch |

---

**completion_report:** **AC-FID-11 metadata density CLOSED** — SQL linked **20** (pending **12**, historical **8**); menu-density **11/11**; API list **200** non-empty for `main`; scope UUID filter fix verified; unit tests **4/4**. Residual: GET-by-id GWC; browser iframe deferred.

**next_owner:** pm

**next_dispatch_prompt:** PM intake `P1-HRM-H21-AC-FID-11-META-QA` PASS_TO_PM — mark AC-FID-11 **CLOSED** in `HRM_MENU_DATA_LINKAGE_MATRIX.md` + `PM_FIDELITY_STATUS.json`; batch with H22/H23 PASS for narrow QC fidelity re-gate.

**evidence_path:** `docs/qa/evidence/p1-hrm-h21-ac-fid-11-meta-qa-20260607.md`

**pm_dispatch_hint:** H-META pending queue now non-empty for group CEO API — decisions embed should show rows on refresh.
