# QA-HRM-MD-PICKER-SPOT-01 — Master-data picker gap (spot inventory)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MD-PICKER-SPOT-01` |
| **Date** | 2026-07-28 |
| **Lane** | execution audit G0 · U65 zero-seed · HOLD_DEPLOY |
| **Scope** | Independent spot-check — **not** full UF promote |
| **Persona (API smoke)** | `ceo@xe.vn` via XBOS login |
| **Hosts** | `127.0.0.1:5173` portal · `127.0.0.1:28001` hrm-api · `127.0.0.1:28002` xbos-api · LAN `192.168.88.174:5173` |
| **nip.io** | **not used** |
| **Seed** | **none** (U65) |

---

## Spec says / Code does

| Spec | Code |
|------|------|
| `docs/hrm/SRS.md` §16.0 **BR-HRM-MD-01** + **AC-HRM-PICKER-01** — chức danh/vị trí = Settings CRUD; consumer = combo/search; **cấm free-text SoT** | `EmployeeWorkHistory.tsx` L990–994: `<Input value={formData.position} />` free-text |
| Settings SoT `job_titles` / `positions` — `DB_DESIGN_HRM_SETTINGS_CATALOG.md` · `API_DESIGN_HRM_SETTINGS_CATALOG.md` · `GET …/settings-catalogs` + `GET …/{catalogKey}/items` | Controller + master keys present; live overview includes both keys |
| Matrix **UF-HRM-10** Settings catalogs 🟢 | Settings path exists; **Work History not listed** as picker UF (gap = orphan consumer) |

---

## Checks executed

### 1) Work History — Vị trí free-text (static)

**File:** `apps/web/hrm/src/components/employee/EmployeeWorkHistory.tsx`

| Field | Control | Catalog bind |
|-------|---------|--------------|
| **Vị trí** (`workHistory.position`) | `<Input>` L991–994 · `formData.position` string | **NONE** — no `job_titles` / `positions` / `settings-catalogs` / `CatalogSearchPicker` in file |
| **Phòng ban** | `<Select>` L999–1011 · `departments.map` | Select (dept list) — contrast with position |
| Công ty | `<Input>` free-text | N/A this spot |

**Grep:** `job_titles|positions|settings-catalogs|CatalogSearchPicker` in this file → **0 matches**.

**Contrast (PASS pattern elsewhere):** `EmployeeFormDialog.tsx` uses `CatalogSearchPicker` for position (CODE-MEMORY: cấm Input free-text).

### 2) Settings catalogs API / docs (static + live)

| Artifact | Result |
|----------|--------|
| `settings-catalogs.controller.ts` | `@Controller('settings-catalogs')` · `GET /` overview · `GET /:catalogKey/items` picker (AC-HRM-PICKER-01) |
| `hrm-settings-master-keys.ts` | `HRM_SC_POS_KEYS` includes **`job_titles`**, **`positions`**, departments aliases |
| `API_DESIGN_HRM_SETTINGS_CATALOG.md` | Documents overview + `{catalogKey}/items` for picker |
| FE Settings UI | `MasterDataSettingsPanel.tsx` tab **Chức danh** → writeKey `job_titles` |

### 3) Live smoke (optional — stack up)

| Probe | Result |
|-------|--------|
| `GET http://127.0.0.1:5173/` | **200** |
| `GET http://192.168.88.174:5173/` | **200** |
| `GET :28001/api/hrm` | **200** |
| `GET :28001/api/hrm/settings-catalogs` (no auth) | **401** (route alive) |
| `POST :28002/api/xbos/auth/login` ceo@xe.vn | **201** `XBOS-AUTH-200` |
| Bearer `GET :28001/api/hrm/settings-catalogs` | **200** `HRM-SET-200` · **76** catalogs · **HAS `job_titles` + `positions`** |
| Bearer `GET …/job_titles/items` | **200** `HRM-SET-200` · `total=5` · codes e.g. `CEO`, `CHRO` · origin `xbos` |
| Bearer `GET …/positions/items` | **200** `HRM-SET-200` · `total=33` · origin mix hrm/xbos |

Live smoke = **PASS** for “Settings catalog SoT exists / picker API returns items.”  
Browser UF mutate (Settings → Work History Select → Lưu → F5) = **out of scope** this spot WI (full `QA-HRM-MD-PICKER-01` after E1).

---

## Verdict table

| Surface | Field | Expected (AC-HRM-PICKER-01) | Observed | Verdict |
|---------|-------|----------------------------|----------|---------|
| Work History dialog | **Vị trí** | Select/combo from `job_titles`/`positions` | Free-text `<Input>` | **FAIL** product gap (orphan picker) |
| Work History dialog | Phòng ban | Select | Select from `departments` | PASS (contrast) |
| Settings catalogs API | `job_titles` / `positions` | Endpoints + data | Live 200 + items | **PASS** SoT exists |
| Matrix UF-HRM-10 | Settings sync/CRUD | Operable | 🟢 prior; not re-promoted | SoT side OK |
| Employee form | Position | CatalogSearchPicker | Wired | PASS pattern (not WH) |

### Other FAIL found quickly (inventory note — not full promote)

| File | Field | Control | Note |
|------|-------|---------|------|
| `EmployeeContracts.tsx` ~L862–865 | `ec.position` | `<Input>` free-text | Same orphan class vs AC-HRM-PICKER-01 |
| `EmployeeWorkTimeline.tsx` ~L255–258 | `workTimeline.position` | `<Input>` free-text | Same orphan class |

---

## Overall QA verdict

| Layer | Result |
|-------|--------|
| Static inventory (WH Vị trí) | **FAIL** vs SRS (expected product gap) |
| Settings catalog existence | **PASS** (docs + code + live) |
| Process / evidence completeness | **PASS** |
| **ack_status** | **PASS_TO_PM** — inventory FAIL ≠ QA process fail |
| Phase 1 / PROD claim | **NONE** · HOLD_DEPLOY |
| Seed | **NONE** |

---

## Residual / next

- Wait **SYNTH-HRM-MD-PICKER-01** / peer synthesis; **QC later** after G1/E1 — not QC GO this WI.
- Execution fix (after sponsor chốt): `D-FE-HRM-WH-POSITION-PICKER-01` (+ contracts/timeline orphans) → full `QA-HRM-MD-PICKER-01` browser U65.

---

## Handoff

- **completion_report:** Spot inventory closed — Work History Vị trí confirmed free-text; Settings `job_titles`/`positions` confirmed present (live 5 / 33 items). Quick orphans: Contracts + WorkTimeline position Inputs.
- **next_owner:** pm (wait SYNTH / peer; QC later)
- **ack_status:** PASS_TO_PM
- **evidence_path:** `docs/qa/evidence/qa-hrm-md-picker-spot-01-20260728.md`
