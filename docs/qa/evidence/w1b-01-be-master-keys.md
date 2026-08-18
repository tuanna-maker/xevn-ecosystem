# Evidence — W1-B-01-BE-MASTER-KEYS

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-BE-MASTER-KEYS` |
| **from_role** | dev-be |
| **to_role** | qa |
| **date** | 2026-08-03 |
| **ack_status** | `READY_FOR_QA` |
| **priority** | P0 (R-MASTER-KEYS from W1-B-01-TM-LEAVE) |
| **slice_ref** | TM triage `docs/qa/evidence/w1b-01-tm-leave.md` § R-MASTER-KEYS |

---

## Mission closed

Restored missing source:

`apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts`

Reconstructed **only** from:

- `apps/api/hrm-api/dist/settings-catalogs/hrm-settings-master-keys.js`
- `apps/api/hrm-api/dist/settings-catalogs/hrm-settings-master-keys.d.ts`

No Settings BR rewrite. U65 no seed.

---

## Export / must_keep parity (dist ↔ source)

| Export | Parity |
|--------|--------|
| `HRM_SC_POS_KEYS` | PASS — 6 keys |
| `HRM_SC_LEAVE_KEY` | PASS — `'leave_types'` |
| `HRM_SC_DEC_KEY` | PASS — `'decision_types'` |
| `HRM_SC_DEC_STORAGE_KEY` | PASS — `'hr_decision_types'` |
| `HRM_SC_DEC_ALIASES` | PASS |
| `HRM_SC_PAY_KEYS` | PASS |
| `HRM_E1B_MASTER_SURFACE_KEYS` | PASS — freeze(Set of all aliases) |
| `normalizeMasterCatalogKey` | PASS — trim + lower |
| `resolveCatalogFamily` | PASS — family map + self: fallback |
| `catalogAliasTryList` | PASS — storageKey first |
| `isE1bMasterCatalogKey` | PASS |
| `isPosCatalogKey` | PASS — `pos_titles` only (not org_depts) |
| `isDecCatalogKey` | PASS — `dec_types` |
| `CATALOG_FAMILIES` | PASS — leave / DEC / POS / PAY / insurers / insurance_types / kpi_library / … |

Spot checks (ts-node import of restored source):

- `resolveCatalogFamily('decision_types').storageKey === 'hr_decision_types'`
- `catalogAliasTryList('decision_types') === ['hr_decision_types','decision_types']`
- `catalogAliasTryList('positions') === ['job_titles','positions','employee_positions']`
- `isPosCatalogKey('job_titles') && !isPosCatalogKey('departments')`
- all helper checks → `ok: true`

---

## Importers (static)

| File | Import |
|------|--------|
| `settings-catalogs.service.ts` | `HRM_SC_POS_KEYS`, `catalogAliasTryList`, `isE1bMasterCatalogKey`, `resolveCatalogFamily` |
| `catalog-sync.service.ts` | `catalogAliasTryList`, `normalizeMasterCatalogKey` |
| `decisions.service.ts` | `HRM_SC_DEC_KEY` |

No import-path fix required (≤2 extras unused).

---

## Verification

| Check | Result |
|-------|--------|
| Source present on NFD path | PASS |
| ts-node import smoke (helpers) | PASS `ok:true` (13 checks) |
| `pnpm exec jest --runInBand src/settings-catalogs/settings-catalogs.service.spec.ts` | PASS **7/7** |
| `tsc --noEmit -p tsconfig.build.json` errors mentioning `hrm-settings-master-keys` | **0** |
| Full `nest build` / workspace tsc | FAIL — **pre-existing** missing modules (attendance DTOs, recruitment bridges, `list-catalog-picker.query.dto`, performance DTOs, …) — **not introduced by this WI**; master-keys absent from error list |

---

## CODE-MEMORY

File includes baseline `@CODE-MEMORY` + APPEND `@CODE-MEMORY-CHANGE` WorkItem `W1-B-01-BE-MASTER-KEYS` (and prior W1-B-02-EMP restore note). VI Purpose/must_keep/SOLID preserved; no wipe.

---

## solid_convention_ack

```markdown
## solid_convention_ack
- [x] Đã đọc `_vibe-team-os/25-SOLID-AND-CODING-CONVENTION.md`
- [x] Logic BR alias/family nằm ở module pure helpers — không page FE
- [x] File restored có @CODE-MEMORY + field SOLID (tiếng Việt)
- [x] SRP: chỉ khóa/alias; không merge SQL / sync I/O
- [x] Không duplicate công thức payroll/insurance
- [x] convention: no `any`; export types match dist .d.ts
### FE–BE boundary
- [x] fe_boundary: wave BE-only — không FE join
- [x] be_boundary: master key map SoT cho Settings/CatalogSync/Decisions
- [x] display_ready_ack: N/A (pure key map — không response DTO)
- [x] soc_ref: `_vibe-team-os/28-FE-BE-SEPARATION-DISPLAY-READY.md`
```

---

## Residual (not in this WI allowed_paths)

| ID | Severity | Note | Owner |
|----|----------|------|-------|
| R-LEAVE-DI | P2 | TM optional: revert leave `ModuleRef` lazy-require → constructor inject Settings/CatalogSync after master-keys restore — `attendance/leave-requests.service.ts` **outside** allowed_paths | PM → `dev-be` FIX |
| R-HRM-DIST-MISSING | P1 workspace | Other missing src vs dist (attendance/recruitment/performance DTOs, picker DTO) block full `nest build` — separate restore wave | PM |

---

## next_dispatch_prompt

```text
work_item_id: W1-B-01-QA-MASTER-KEYS
to_role: qa
priority: P0
entry_criteria:
  - Source exists: apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts
  - Evidence: docs/qa/evidence/w1b-01-be-master-keys.md READY_FOR_QA
  - U65 no seed
exit_criteria:
  - Confirm export surface vs dist .d.ts (HRM_SC_* + helpers)
  - Re-run: pnpm --filter hrm-api exec jest --runInBand src/settings-catalogs/settings-catalogs.service.spec.ts → green
  - Import graph spot: settings-catalogs.service / catalog-sync.service / decisions.service resolve master-keys (no MODULE_NOT_FOUND for this file)
  - Note residual R-HRM-DIST-MISSING if full nest build still blocked by unrelated absent files
  - Evidence: docs/qa/evidence/w1b-01-qa-master-keys.md · ack_status PASS_TO_PM
must_keep:
  - family alias map · HRM_SC_LEAVE_KEY=leave_types · DEC storageKey hr_decision_types
forbidden:
  - seed · FE/mobile · NEW docs rewrite
```

---

**ack_status:** `READY_FOR_QA`  
**next_owner:** `qa`
