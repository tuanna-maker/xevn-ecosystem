# Evidence — PO-UC-TC-W3-BE-LOG09

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-UC-TC-W3-BE-LOG09` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **date** | 2026-08-04 |
| **ack_status** | **READY_FOR_QA** |
| **u65_zero_seed** | true |
| **uat_done** | **false** |
| **change_mode** | ADD |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local **9** · PHASE1 matrix **STT 106** · by-uc `XBOS-DM-LOG-09.md` |
| **srs_new** | **N/A-DELTA** — SRS_VN chưa FR khối DM-LOG |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (Company copy LOG-08..09 = bootstrap script) · `TECHSPEC_HE` §8.1 catalog pattern |
| **api_design** | ADD `POST /api/xbos/config-sync/catalogs/clone-bundle` — không OpenAPI clone trước wave; reuse publish path |
| **db_design** | Existing `config_catalogs` / `config_catalog_items` / `catalog_audit_logs` — **no migration** |
| **uc_ids** | `XBOS-DM-LOG-09` (twin pattern for `XBOS-DM-09`) |

### spec says / code does

| Spec | Code |
|------|------|
| Sao chép bộ DM Logistic CT nguồn → CT đích | `cloneCatalogBundle` filters `domains=['logistics']`, publish each key to dest |
| TECHSPEC_M03 §2: bootstrap script | **Honest:** script seed vẫn còn; P1 ADD API UI-stable — **không** claim seed = UAT |
| Merge policy conflict / no half-copy | Default `onConflict=fail` → `XBOS-CFG-009` trước mọi `publishCatalog` |
| Group only / member 403 | Controller `XBOS-AUTH-003` when JWT not group_* on master |
| Auth anonymous | `XBOS-AUTH-001` |

---

## 2. Architecture choice (documented)

| Option | Summary | Decision |
|--------|---------|----------|
| A — LOG-only clone module | Separate logistic god service | Reject — duplicates config-sync |
| B — Shared clone + domain filter | One endpoint; LOG-09 passes `domains=['logistics']` | **Selected** |
| C — Seed-only (TECHSPEC_M03 literal) | Keep DevOps bootstrap only | Reject for UC UI/API contract; seed remains for bootstrap env only (U65 cấm UAT) |

**must_keep verified:** HRM `apply-to-members` allow-list · catalog-governance inbox approve paths untouched.

---

## 3. Contract (BE)

```http
POST /api/xbos/config-sync/catalogs/clone-bundle
Authorization: Bearer <group JWT> | x-internal-api-key (DevOps)
```

```json
{
  "sourceTenantId": "xevn",
  "sourceCompanyId": "holding",
  "destTenantId": "xevn",
  "destCompanyId": "logistics",
  "domains": ["logistics"],
  "keyPrefix": "log_dm_",
  "onConflict": "fail",
  "actor": "ceo@xe.vn"
}
```

| Code | When |
|------|------|
| `XBOS-CFG-205` | Success |
| `XBOS-CFG-008` | No source catalogs match filter |
| `XBOS-CFG-009` | Dest conflict + `onConflict=fail` |
| `XBOS-VAL-001` | Bad domains / keyPrefix |
| `XBOS-VAL-013` | Source == dest |
| `XBOS-AUTH-001` | No auth |
| `XBOS-AUTH-003` | Member / non-group JWT |

---

## 4. Files touched

- `apps/api/xbos-api/src/config-sync/dto/clone-catalog-bundle.dto.ts` (ADD)
- `apps/api/xbos-api/src/config-sync/config-sync.service.ts` (ADD cloneCatalogBundle + CODE-MEMORY)
- `apps/api/xbos-api/src/config-sync/config-sync.controller.ts` (ADD route + AU gate)
- `apps/api/xbos-api/src/config-sync/config-sync.service.spec.ts` (HP+FD)
- `apps/api/xbos-api/src/config-sync/config-sync.controller.spec.ts` (HP+AU)
- `docs/qa/professional/by-uc/XBOS-DM-LOG-09.md` (code_readiness → LIKELY_PARTIAL)

---

## 5. Verification

```text
pnpm --filter xbos-api exec jest --testPathPatterns="config-sync.service.spec|config-sync.controller.spec" --no-coverage
→ Test Suites: 2 passed · Tests: 36 passed · EXIT 0
```

| TC (design) | Unit coverage |
|-------------|---------------|
| HP-001 copy empty dest | service HP + controller CFG-205 |
| FD-002 conflict fail | service XBOS-CFG-009 no publish |
| FD-006 missing/invalid | domains=[] · same scope VAL-013 · empty source CFG-008 |
| AU-004 member | controller XBOS-AUTH-003 |
| AU-008 anonymous | controller XBOS-AUTH-001 |
| UX-005 async job | **not BE** — residual FE |
| BD-003 large bundle | not load-tested this wave — sync path OK for ~112 keys |

---

## 6. by-uc readiness

- `XBOS-DM-LOG-09` **GAP → LIKELY_PARTIAL**
- `uat_done: false` · no browser · no seed in evidence

---

## 7. Residual

| Item | Owner |
|------|-------|
| FE wizard «Sao chép bộ danh mục» wire + F5 | dev-fe (after QA API spot) |
| Async progress UX-005 | product/FE — not invent job queue this wave |
| Include `workflow_definition` domain in LOG copy? | **product decision** — HOLD; LOG-09 DM = `logistics` only |
| OpenAPI yaml delta clone-bundle | sa/dev-be follow-up |
| Twin DM-09 may reuse same endpoint with other domains | PO-UC-TC-W3-BE-DM09 |

---

## 8. completion_report

**Closed:** LOG-09 BE clone API (shared + domain filter), DTO validation, group AU gate, jest HP+FD+AU, by-uc readiness update, CODE-MEMORY APPEND.

**Open:** FE wire, async UX, OpenAPI file, workflow_definition inclusion decision.

---

## 9. Handoff

| Field | Value |
|-------|--------|
| next_owner | **qa** |
| ack_status | **READY_FOR_QA** |
| evidence_path | `docs/qa/evidence/po-uc-tc-w3-be-log09.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-UC-TC-W3-QA-LOG09
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
ack_status_target: PASS_TO_PM

## CONTEXT
dev-be PO-UC-TC-W3-BE-LOG09 READY_FOR_QA — shared POST /api/xbos/config-sync/catalogs/clone-bundle with domains=['logistics'].

## READ_FIRST
1. docs/qa/evidence/po-uc-tc-w3-be-log09.md
2. docs/qa/professional/by-uc/XBOS-DM-LOG-09.md (TC HP/FD/AU)
3. TECHSPEC_M03 §2 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE

## MISSION — LOG-09 retest
1) L0 stack; login ceo@xe.vn.
2) API (or FE if wired): clone holding→member/logistics company with domains=['logistics']; assert XBOS-CFG-205; dest has keys; source unchanged; F5.
3) FD: dest conflict → XBOS-CFG-009 no half-copy.
4) AU: member JWT → 403 XBOS-AUTH-003; anonymous → 401.
5) Update by-uc Dev8088 / execution note; cấm seed; cấm invent Leave L2; FE missing → PARTIAL not fake PASS.
6) evidence: docs/qa/evidence/po-uc-tc-w3-qa-log09.md
```
