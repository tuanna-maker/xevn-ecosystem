# BE — D-HRM-OP-DUAL-PLANE-GUARD-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-OP-DUAL-PLANE-GUARD-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **change_mode** | ADD |
| **date** | 2026-07-27 (ICT) |
| **ack_status** | **READY_FOR_QA** |
| **U65** | No seed |

---

## spec_read_ack

| Artifact | Ack |
|----------|-----|
| `docs/qa/evidence/ba-dual-plane-audit-02-20260727.md` §2#1 | OP + OP-04: B′ UUID persist; LE ≠ map → empty/0 risk |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6 | Plane A/B/B′; residual #1 OP guard |
| `docs/hrm/DB_DESIGN_HRM_OPERATIONS.md` | `company_id` UUID + `resolveHrmOperationsPersistCompanyId` / `pushCompanyIdUuidFilter` |
| `docs/hrm/API_DESIGN_HRM_OPERATIONS.md` | OP-01 persist map; OP-02 list; OP-04 summary multi-mode |
| `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` §4 | `companyId` slug vs `company_uuid` mobile — not LE as operating key |

```yaml
spec_read_ack:
  srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.45–3.48 · FR-HRM-OP-01..04
  tech_spec: docs/hrm/TECHSPEC.md §16.5
  db_design: docs/hrm/DB_DESIGN_HRM_OPERATIONS.md · hrm_tasks / service_requests UUID
  api_design: docs/hrm/API_DESIGN_HRM_OPERATIONS.md · POST/GET tasks · GET reports/summary
  uc_ids: [HRM-OP-01, HRM-OP-02, HRM-OP-04]
  change_mode: ADD
  must_keep: [CO-HC by_company GWC, Fleet TEXT company_id, resolveHrmListScope TEXT siblings, U65]
  forbidden_paths: [Company headcount FE, apps outside OP + shared UUID map helpers]
```

---

## Implementation

| Change | Path |
|--------|------|
| `isHrmMappedCompanyUuid` / `assertHrmMappedCompanyUuidOrThrow` → `HRM-PLANE-409` | `apps/api/hrm-api/src/common/hrm-list-scope.ts` |
| Persist reject LE UUID ∉ `HRM_COMPANY_UUID_BY_SLUG` | `resolveHrmOperationsPersistCompanyId` |
| OP list / SR list / OP-04 summary early wire guard | `OperationsService.assertOperationsCompanyWire` |
| CODE-MEMORY APPEND (OP-04 UUID vs TEXT mix documented) | `operations.service.ts` + `hrm-list-scope.ts` |
| Jest anti-join LE + happy slug | `operations/be-hrm-op-dual-plane-guard-01.spec.ts` + scope/ops specs |
| ATT create fixtures slug (persist shares helper) | `attendance.service.spec.ts` (fixture only) |

**Plane note (OP-04):** `getSummary` counts `hrm_tasks`/`service_requests` in `company_uuid` mode; `payroll_periods`/`job_requisitions` in `company_text`; `attendance_records` via workforce — documented in CODE-MEMORY. LE wire → **409**, not silent zeros.

**Blast-radius choice:** `companyIdsToUuidList` keeps UUID pass-through for home/inbox callers; OP fail-closed is service-layer + persist. Metadata dual-plane = parallel WI `D-HRM-MD-DUAL-PLANE-GUARD-01`.

---

## Verification

```text
pnpm exec jest --testPathPatterns=be-hrm-op-dual-plane-guard-01 \
  --testPathPatterns=operations.service.spec \
  --testPathPatterns=hrm-list-scope.spec \
  --testPathPatterns=attendance.service.spec \
  --testPathPatterns=home.service.spec --no-coverage
→ Test Suites: 5 passed · Tests: 91 passed · EXIT 0
```

| Case | Expected |
|------|----------|
| Persist LE UUID | `HRM-PLANE-409` |
| Persist slug `holding` / `trsport` / `main`→holding | mapped UUID INSERT |
| List/summary LE UUID | `HRM-PLANE-409` (no fake 0) |
| List/summary slug | mapped UUID filter / honest zeros |

---

## completion_report

**Closed:** OP dual-plane anti-join LE on persist + list/summary wire; slug→map happy path preserved; OP-04 plane-mix CODE-MEMORY; Jest + this evidence.

**Residual:** `pushCompanyIdUuidFilter` still pass-through raw UUID for non-OP (home/inbox) — MD WI owns metadata LE guard; optional harden shared filter later without home regression.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-OP-DUAL-PLANE-01
role: qa
lane: execution
entry_criteria: D-HRM-OP-DUAL-PLANE-GUARD-01 READY_FOR_QA — docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md
read_first:
  - docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6.4
  - docs/hrm/API_DESIGN_HRM_OPERATIONS.md
must_keep: CO-HC GWC closed; U65 zero-seed; browser-only for UF
exit_criteria:
  1) Network: POST/GET operations/tasks + GET reports/summary with company_id=<XBOS LE UUID> → 409 HRM-PLANE-409 (not 200 with 0)
  2) Happy: company_id=holding|main (group CEO) → 2xx; persist uses mapped UUID
  3) OP-04 summary with slug — zeros honest when empty; no LE undercount path
  4) Evidence docs/qa/evidence/qa-hrm-op-dual-plane-01-20260727.md PASS_TO_PM
cấm: seed tasks; reopen CO-HC FE
```

### evidence_path

`docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md`

### ack_status

**READY_FOR_QA**
