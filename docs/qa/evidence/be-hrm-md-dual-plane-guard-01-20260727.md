# BE — D-HRM-MD-DUAL-PLANE-GUARD-01

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-MD-DUAL-PLANE-GUARD-01` |
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
| `docs/qa/evidence/ba-dual-plane-audit-02-20260727.md` §2#2 | Metadata `employee_metadata_*`: B′ UUID + slug→UUID (`G-MD-PLANE-01`); LE mutate/list miss |
| `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` §6 | Plane A/B/B′; residual #2 MD guard |
| `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` §C | UUID `company_id` + `resolveHrmCompanyUuidForSlug` |
| `docs/hrm/API_DESIGN_HRM_W2_SLICE.md` C1/C2 | Submit map; list scope; MD-01 #6/#7 |
| `docs/qa/evidence/be-hrm-op-dual-plane-guard-01-20260727.md` | Pattern reuse: `assertHrmMappedCompanyUuidOrThrow` → `HRM-PLANE-409` |
| ADR ladder §4 | `companyId` slug vs `company_uuid` — not LE as operating key |

```yaml
spec_read_ack:
  srs: docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.31 · FR-HRM-MD-01 · UC-HRM-26
  tech_spec: docs/hrm/TECHSPEC.md §16.2
  db_design: docs/hrm/DB_DESIGN_HRM_W2_SLICE.md · employee_metadata_* UUID company_id
  api_design: docs/hrm/API_DESIGN_HRM_W2_SLICE.md · POST/GET change-requests · approve/reject · audit
  uc_ids: [HRM-MD-01, HRM-MD-02, HRM-MD-03, HRM-MD-04, HRM-MD-05]
  change_mode: ADD
  must_keep: [OP dual-plane GWC, CO-HC GWC, U65, HOLD_DEPLOY, Admin/Fleet closed]
  forbidden_paths: [reopen OP/CO-HC, Phase1 claim, seed]
```

---

## Implementation

| Change | Path |
|--------|------|
| Persist: UUID wire → `assertHrmMappedCompanyUuidOrThrow` (`HRM-PLANE-409`); slug/main → map | `employee-metadata.service.ts` `resolveMetadataCompanyUuid` |
| List / audit / approve / reject early wire guard | `assertMetadataCompanyWire` |
| CODE-MEMORY + CHANGE APPEND (G-MD-PLANE-01) | `employee-metadata.service.ts` |
| Shared helper CHANGE note (MD reuse; no home pass-through wipe) | `common/hrm-list-scope.ts` |
| Jest anti-join LE + happy slug/main/mapped UUID | `be-hrm-md-dual-plane-guard-01.spec.ts` |
| UF-HRM-11 LE reject regression | `p1-web-acceptance-metadata-company-uuid.spec.ts` |

**Plane note:** Settings master catalogs remain TEXT `company_id` (Plane B) — out of this WI. Metadata DDL stays UUID (G-MD-PLANE-01 migrate deferred).

**Blast-radius:** Did **not** harden `resolveHrmCompanyUuidForSlug` / `companyIdsToUuidList` global pass-through (employees/home/inbox must_keep). Guard is Metadata service-layer only — same pattern as OP.

---

## Verification

```text
cd apps/api/hrm-api
pnpm exec jest --testPathPatterns=be-hrm-md-dual-plane-guard-01 \
  --testPathPatterns=p1-web-acceptance-metadata-company-uuid \
  --testPathPatterns=employee-metadata.controller.spec --no-coverage
→ Test Suites: 3 passed · Tests: 19 passed · EXIT 0
```

| Case | Expected |
|------|----------|
| Persist LE UUID | `HRM-PLANE-409` · no `submitChange` |
| Persist slug `holding` / `finance` / `main`→holding | mapped UUID INSERT |
| Persist mapped Plane B′ UUID | accepted as-is |
| List / audit / approve / reject LE | `HRM-PLANE-409` (no silent empty) |
| List / audit slug | repository called · happy path |

---

## completion_report

**Closed:** Metadata dual-plane anti-join LE on persist + list/audit/decide wire; slug→map happy path preserved; CODE-MEMORY G-MD-PLANE-01; Jest 19/19 + this evidence.

**Residual:** `API_DESIGN_HRM_W2_SLICE` C1 still names only `HRM-VAL-001` for map fail — does not yet name **`HRM-PLANE-409`** (Info / ba-process optional, same class as OP GWC Info). Optional UUID→TEXT migrate = G-MD-PLANE-01 defer. Settings TEXT catalogs untouched.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-HRM-MD-DUAL-PLANE-01
role: qa
lane: execution
entry_criteria: D-HRM-MD-DUAL-PLANE-GUARD-01 READY_FOR_QA — docs/qa/evidence/be-hrm-md-dual-plane-guard-01-20260727.md
read_first:
  - docs/qa/evidence/be-hrm-md-dual-plane-guard-01-20260727.md
  - docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §6.4
  - docs/hrm/API_DESIGN_HRM_W2_SLICE.md C1/C2
must_keep: OP dual-plane GWC closed; CO-HC GWC closed; U65 zero-seed; browser-only for UF
exit_criteria:
  1) Network: POST/GET /api/hrm/employee-metadata/change-requests (+ audit-logs) with company_id=<XBOS LE UUID> → 409 HRM-PLANE-409 (not 200 with empty queue)
  2) Happy: company_id=holding|main|finance (group CEO) → 2xx; persist uses mapped UUID
  3) Jest be-hrm-md-dual-plane-guard-01 + metadata controller/UF-HRM-11 re-run EXIT 0
  4) Evidence docs/qa/evidence/qa-hrm-md-dual-plane-01-20260727.md PASS_TO_PM
cấm: seed metadata; reopen OP/CO-HC FE; claim Phase1
```

### evidence_path

`docs/qa/evidence/be-hrm-md-dual-plane-guard-01-20260727.md`

### ack_status

**READY_FOR_QA**
