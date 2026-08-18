# D-BE-XBOS-CTRL-G1-ALLOWLIST-01 — Expand apply-to-members allow-list P0+P1

| Field | Value |
|-------|--------|
| **work_item_id** | `D-BE-XBOS-CTRL-G1-ALLOWLIST-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution `E-XBOS-CTRL-G1` |
| **date** | 2026-07-29 |
| **change_mode** | ADD |
| **ack_status** | **READY_FOR_QA** |
| **HOLD_DEPLOY** | yes · U65 zero-seed |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| `docs/program/HRM_ERP_XBOS_CTRL_SPEC_SYNTH.md` | P0+P1 unlock after sponsor chốt |
| `docs/program/deltas/BA_ERP_XBOS_CTRL_SPEC_01_20260728.md` | §2.1 P0 · §2.2 P1 · §2.4 aliases |
| `docs/xbos/TECHSPEC_XBOS_APPLY_TO_MEMBERS_EXPAND.md` | Option C const expand · SA-DEC-WRITE-01 |
| `docs/xbos/DB_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` | no DDL · alias map logical |
| `docs/xbos/API_DESIGN_XBOS_APPLY_TO_MEMBERS_EXPAND.md` | F.1 · OpenAPI stamp G1 |
| `docs/qa/evidence/sa-erp-xbos-ctrl-spec-01-20260728.md` | SPEC READY prior |

---

## 2. Closed scope

| Change | Detail |
|--------|--------|
| Allow-list | `APPLY_TO_MEMBERS_CATALOG_ALLOWLIST` = P0 ∪ P1 (10 keys) |
| P0 | `job_titles`, `recruitment_channels`, `job_grades`, **`departments`**, **`leave_types`** |
| P1 | **`contract_types`**, **`employment_types`**, **`pay_types`**, **`shifts`**, **`decision_types`** |
| Alias | `APPLY_TO_MEMBERS_CATALOG_ALIASES` + `resolveApplyToMembersCanonicalKey` |
| DEC | Path `hr_decision_types` → canonical `decision_types`; **writeKey** = source L0 header (`hr_decision_types` if live) |
| OpenAPI | `ApplyCatalogToMembersBody` + `configSyncApplyCatalogToMembers` description P0+P1 + DEC alias |
| CODE-MEMORY | APPEND `@CODE-MEMORY-CHANGE 2026-07-29` |
| DDL / seed / new URL | **None** |

**Runtime file:** `apps/api/xbos-api/src/config-sync/config-sync.service.ts`

---

## 3. Verification

```text
pnpm exec jest src/config-sync/config-sync.service.spec.ts --no-coverage
→ Test Suites: 1 passed · Tests: 13 passed

pnpm exec jest src/config-sync/config-sync.controller.spec.ts --no-coverage
→ Test Suites: 1 passed · Tests: 17 passed
```

| Case | Expect |
|------|--------|
| Tier C `cost_centers` / P2 `salary_components` | **400** `XBOS-CFG-005` |
| P0 `departments` / `leave_types` | allow + fan-out |
| P1 `contract_types`…`shifts` | allow + fan-out |
| `decision_types` path when source is `hr_decision_types` | `writeKey=hr_decision_types` |
| Path `hr_decision_types` | canonical allow · same writeKey |

---

## 4. Residual / not in this WI

| ID | Item | Owner |
|----|------|-------|
| R-FE | Portal `APPLY_TO_MEMBERS_CATALOG_KEYS` still 3 keys (mirror BE) | `dev-fe` G1 FE |
| R-P2 | `salary_components` / insurers / kpi — still CFG-005 | later cohort |
| R-QA | Browser U65: publish → apply departments/leave_types (+ one DEC) → HRM sync | `QA-XBOS-CTRL-G1-01` |
| G2 | HRM pull rewrite — **not needed** this wave (existing pull by key) | hold |

---

## 5. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **next_dispatch_prompt:** see below
- **evidence_path:** `docs/qa/evidence/d-be-xbos-ctrl-g1-allowlist-01-20260729.md`

```text
work_item_id: QA-XBOS-CTRL-G1-01
from_role: pm
to_role: qa
entry_criteria: D-BE-XBOS-CTRL-G1-ALLOWLIST-01 READY_FOR_QA; L0 stack; U65 zero-seed browser-only
exit_criteria: AC-XBOS-CTRL-02/03 (departments + leave_types apply → XBOS-CFG-204 + member GET); one DEC apply (decision_types or hr_decision_types) writeKey = source L0; Tier C CFG-005; optional HRM pull after fan-out; matrix evidence; PASS_TO_PM
cấm: seed · invent L0 · Phase1 claim · HOLD_DEPLOY
evidence_path: docs/qa/evidence/qa-xbos-ctrl-g1-01-20260729.md
J-*: J-XBOS-CTRL-01 (apply P0) · J-XBOS-CTRL-02 (DEC alias) per BA delta
```
