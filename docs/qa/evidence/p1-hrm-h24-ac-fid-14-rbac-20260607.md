# QA — P1-HRM-H24-AC-FID-14-RBAC (scope RBAC persona matrix)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H24-AC-FID-14-RBAC` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-07 |
| **matrix** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-14 · §7 RBAC personas |

## Verdict

**PASS_TO_PM** — Three-persona RBAC matrix **PASS**: Group CEO (`ceo@xe.vn` / `main`) rollup **5/5** pilot slugs · **1107** employees; member CEO (`du-lich.ceo@xe.vn`) and HRBP (`du-lich.hr@xe.vn`) see **only** `company_id=main` + `tenant_id=xe-du-lich` workforce (**18** NV) with **0** cross-employee satellite leaks on contracts/attendance/leave sample; L0 stack exit 0; `hrm-list-scope.spec.ts` **23/23 PASS**.

## Environment

| Item | Value |
|------|-------|
| Portal | `http://127.0.0.1:5173` |
| hrm-api | `http://127.0.0.1:28001` |
| xbos-api | `http://127.0.0.1:28002` |
| Password (all personas) | `Xevn@2026` |
| Probe JSON | `docs/qa/evidence/p1-hrm-h24-ac-fid-14-rbac-probe-20260607.json` |

## L0 — Stack

| Check | Command | Result |
|-------|---------|--------|
| Dev stack | `pnpm run qc:dev-stack` | **exit 0** |
| Scope unit tests | `pnpm --filter hrm-api exec jest src/common/hrm-list-scope.spec.ts` | **23/23 PASS** |

## AC-FID-14 — Persona matrix

Probe: `node scripts/tmp-p1-hrm-h24-ac-fid-14-rbac-probe.mjs` (with `PORTAL_DEV_URL=http://127.0.0.1:5173`)

| Persona | Account | JWT tenant | role | employees total | company slugs seen | crossEmployee (contracts/attendance/leave) | Verdict |
|---------|---------|------------|------|-----------------|-------------------|---------------------------------------------|---------|
| **Group CEO rollup** | `ceo@xe.vn` | `xevn` | `group_ceo` | **1107** | holding, trsport, logistics, finance, services (**5**) | 6 / 2 / 0 (GWC — see §GWC) | **PASS** |
| **Member CEO own co** | `du-lich.ceo@xe.vn` | `xe-du-lich` | `subsidiary_ceo` | **18** | **main** only | **0 / 0 / 0** | **PASS** |
| **HRBP dept filter** | `du-lich.hr@xe.vn` | `xe-du-lich` | `HRBP_MANAGER` | **18** | **main** only | **0 / 0 / 0** | **PASS** (GWC dept narrow — §GWC) |

### Rollup vs isolation (BR-LINK-04)

| Metric | Group CEO | Member CEO | Ratio / note |
|--------|-----------|------------|--------------|
| employees `total` | **1107** | **18** | Group **>>** member (**61×**) |
| contracts `total` | **1091** | **13** | Group rollup |
| attendance `total` | **13095** | **50** | Group rollup |
| requisitions `total` | **24** | **0** | Member isolation expected |
| insurance-expiring `total` | **97** | **0** | Member isolation expected |

### Scope parity spot-check (member CEO)

| Probe | HTTP | Note |
|-------|------|------|
| `GET /employees?company_id=main` | **200** | All rows `company_id=main`; tenants `{xe-du-lich}` only |
| `GET /contracts?company_id=main` | **200** | **13** rows; all `company_id=main`; **0** group slugs |
| `GET /attendance/records?company_id=main` | **200** | **50** rows; satellite `employee_id` ⊆ member workforce; record-level `company_id=holding` on some rows is **legacy denorm** — employee GET confirms `tenant_id=xe-du-lich` (not cross-tenant leak) |
| No **409** on any persona probe | — | **PASS** |

### Baseline persona density ( corroboration )

`PORTAL_DEV_URL=http://127.0.0.1:5173 node scripts/verify-hrm-persona-scope-probes.mjs` → **exit 0** (group CEO density PASS; member labels FAIL by design on density thresholds only — not RBAC).

## Defects / closure

| ID | Prior status | QA verdict |
|----|--------------|------------|
| **AC-FID-14** scope RBAC persona matrix | OPEN | **CLOSED** |

## GWC (non-blocking)

| ID | Note | Owner |
|----|------|-------|
| **GWC-RBAC-01** | Group CEO contracts sample: **6/100** rows reference employees on later list pages (pagination edge; each `GET /employees/:id` **200** in-scope `xevn` + group slug) | qa / dev-be |
| **GWC-RBAC-02** | HRBP employee `total=18` equals member CEO — **dept subtree filter not narrowed** per ADR-HRM-RBAC-SCOPE-LADDER §3.3 Target; **0 cross-company rows** criterion met | dev-be (future) |
| **GWC-RBAC-03** | Attendance satellite rows may show `company_id=holding` while employee is `main`/xe-du-lich — data denorm; RBAC enforced via `employee_id` workforce filter | dev-be seed |

## Residual (out of scope)

| ID | Owner | Note |
|----|-------|------|
| Browser L2.5 J-HRM click paths | qa | API persona matrix sufficient for AC-FID-14 |
| AC-FID-15 / AC-FID-16 | backlog | Next fidelity gates |
| Production persona matrix | devops | localhost UAT only this wave |

---

## Handoff

```yaml
completion_report: |
  AC-FID-14 CLOSED — Group CEO rollup 5 slugs / 1107 employees; member CEO + HRBP isolated to xe-du-lich main (18 NV, 0 cross-employee leaks on contracts/attendance/leave); L0 + hrm-list-scope 23/23 PASS.
  GWC: HRBP dept narrow not implemented (same count as member CEO); group pagination edge on 6 contract employee_ids; attendance row company_id denorm.
next_owner: pm
next_dispatch_prompt: |
  PM intake P1-HRM-H24-AC-FID-14-RBAC PASS_TO_PM — mark AC-FID-14 CLOSED in HRM_MENU_DATA_LINKAGE_MATRIX.md + PM_FIDELITY_STATUS.json; dispatch qc narrow fidelity re-gate (AC-FID-04..14) or AC-FID-15 UI fidelity wave per backlog; optional dev-be backlog GWC-RBAC-02 dept filter when Target rung-3 prioritized.
evidence_path: docs/qa/evidence/p1-hrm-h24-ac-fid-14-rbac-20260607.md
ack_status: PASS_TO_PM
```
