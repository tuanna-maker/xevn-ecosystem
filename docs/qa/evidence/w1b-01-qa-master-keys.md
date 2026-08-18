# Evidence — W1-B-01-QA-MASTER-KEYS

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-01-QA-MASTER-KEYS` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | `PASS_TO_PM` |
| **priority** | P0 (R-MASTER-KEYS closed for src presence) |
| **entry** | `docs/qa/evidence/w1b-01-be-master-keys.md` READY_FOR_QA |
| **U65** | no seed · no FE/mobile · no NEW docs rewrite |

---

## Verdict

**PASS** — `hrm-settings-master-keys.ts` restored; export surface matches dist `.d.ts`; jest green; import graph resolves for Settings / CatalogSync / Decisions. **R-MASTER-KEYS (src presence) CLOSED.**

Full `tsc -p tsconfig.build.json` still FAIL on unrelated missing modules → residual **R-HRM-DIST-MISSING** remains open (not introduced by this WI).

---

## EC1 — Export surface vs dist `.d.ts`

Compared `apps/api/hrm-api/src/settings-catalogs/hrm-settings-master-keys.ts` ↔ `dist/settings-catalogs/hrm-settings-master-keys.d.ts`:

| Export | Result |
|--------|--------|
| `CatalogFamilyResolution` | PASS |
| `HRM_SC_POS_KEYS` (6) | PASS |
| `HRM_SC_LEAVE_KEY` = `leave_types` | PASS |
| `HRM_SC_DEC_KEY` = `decision_types` | PASS |
| `HRM_SC_DEC_STORAGE_KEY` = `hr_decision_types` | PASS |
| `HRM_SC_DEC_ALIASES` | PASS |
| `HRM_SC_PAY_KEYS` (3) | PASS |
| `HRM_E1B_MASTER_SURFACE_KEYS` | PASS |
| `HrmSettingsMasterKey` | PASS |
| `normalizeMasterCatalogKey` | PASS |
| `resolveCatalogFamily` | PASS |
| `catalogAliasTryList` | PASS |
| `isE1bMasterCatalogKey` | PASS |
| `isPosCatalogKey` | PASS |
| `isDecCatalogKey` | PASS |

must_keep smoke (`node` require dist JS):

```json
{
  "LEAVE": true,
  "DEC_STOR": true,
  "TRY": true,
  "POS": true,
  "DEC": true,
  "NORM": true,
  "E1B": true,
  "POS_KEYS": true,
  "PAY": true,
  "SURF": true,
  "ok": true
}
```

- `HRM_SC_LEAVE_KEY === 'leave_types'`
- `resolveCatalogFamily('decision_types').storageKey === 'hr_decision_types'`
- `catalogAliasTryList('decision_types') === ['hr_decision_types','decision_types']`
- `isPosCatalogKey('job_titles') && !isPosCatalogKey('departments')`

---

## EC2 — Jest

```text
pnpm --filter hrm-api exec jest --runInBand src/settings-catalogs/settings-catalogs.service.spec.ts
Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

---

## EC3 — Import graph spot

| Consumer | Import | Src exists | MODULE_NOT_FOUND |
|----------|--------|------------|------------------|
| `settings-catalogs.service.ts` | `./hrm-settings-master-keys` | yes | none (jest loads suite) |
| `catalog-sync.service.ts` | `../settings-catalogs/hrm-settings-master-keys` (`catalogAliasTryList`, `normalizeMasterCatalogKey`) | yes | none (static path OK) |
| `decisions.service.ts` | `../settings-catalogs/hrm-settings-master-keys` (`HRM_SC_DEC_KEY`) | yes | none (static path OK) |

`tsc` error list: **0** lines mentioning `hrm-settings-master-keys`.

---

## EC4 — Residual R-HRM-DIST-MISSING (still open)

`pnpm --filter hrm-api exec tsc --noEmit -p tsconfig.build.json` exit **1**. Sample TS2307 (unrelated to master-keys):

| Missing module (examples) | Area |
|---------------------------|------|
| `./dto/create-attendance-sheet.dto` / `update-attendance-sheet.dto` | attendance |
| `./dto/update-performance-cycle.dto` / `update-performance-evaluation.dto` | performance |
| `./hire-employee-link`, `./recruitment-workflow.bridge`, job-template DTOs | recruitment |
| `./dto/list-catalog-picker.query.dto` | settings-catalogs controller |

Also: `hrm-company-display-name.ts` TS7053 indexing issue (typed any indexing — not master-keys).

**Owner:** PM → separate restore wave (`dev-be`). Does **not** block closing R-MASTER-KEYS for this file.

Carry from BE evidence (out of this WI):

| ID | Severity | Note |
|----|----------|------|
| R-LEAVE-DI | P2 | Optional ModuleRef → constructor inject after master-keys restore |
| R-HRM-DIST-MISSING | P1 workspace | Full nest/tsc build still blocked |

---

## not promoted

- Full `nest build` / workspace tsc green
- Live L0/L1 portal smoke (OOS this WI; U65 FE not in scope)
- R-LEAVE-DI refactor

---

## completion_report

Closed: R-MASTER-KEYS src presence + export/helpers parity vs dist + settings-catalogs jest 7/7 + importer resolve. Residual: R-HRM-DIST-MISSING (other absent src files).

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: W1-B-01-PM-INTAKE-MASTER-KEYS
to_role: pm
priority: P0 closed for R-MASTER-KEYS; carry R-HRM-DIST-MISSING
entry_criteria:
  - Evidence: docs/qa/evidence/w1b-01-qa-master-keys.md PASS_TO_PM
  - R-MASTER-KEYS CLOSED (src + export + jest)
action:
  1) Mark R-MASTER-KEYS closed on TM/bus triage
  2) Dispatch restore wave for R-HRM-DIST-MISSING (attendance/performance/recruitment DTOs + list-catalog-picker.query.dto) — separate work_item, not reopen master-keys
  3) Optional P2: R-LEAVE-DI ModuleRef cleanup (defer OK)
forbidden: seed · reopen master-keys without regression
```

---

**ack_status:** `PASS_TO_PM`  
**evidence_path:** `docs/qa/evidence/w1b-01-qa-master-keys.md`
