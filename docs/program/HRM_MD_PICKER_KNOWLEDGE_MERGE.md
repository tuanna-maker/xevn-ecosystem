# HRM MD Picker — Knowledge Merge (Cursor ↔ Claude)

**Program:** P-HRM-MD-PICKER-01 · G0 ACTIVE  
**Rule:** Mỗi seat xong → APPEND block dưới (evidence_path + 5–10 findings). Cursor-PM tổng hợp SYNTH sau khi đủ 2 bên.

## Cursor lane (in flight)

| WI | Role | Status | Evidence |
|----|------|--------|----------|
| BA-HRM-MD-PICKER-INVENTORY-01 | ba-process | PASS_TO_PM | docs/qa/evidence/ba-hrm-md-picker-inventory-01-20260728.md |
| BA-HRM-MD-CATALOG-TRACE-01 | ba-data | PASS_TO_PM | `docs/qa/evidence/ba-hrm-md-catalog-trace-01-20260728.md` |
| SA-XBOS-HRM-CONTROL-GAP-01 | sa | **PASS_TO_PM** | `docs/qa/evidence/sa-xbos-hrm-control-gap-01-20260728.md` |
| QA-HRM-MD-PICKER-SPOT-01 | qa | PASS_TO_PM | docs/qa/evidence/qa-hrm-md-picker-spot-01-20260728.md |

## Claude lane (self-dispatch)

| WI | Role | Status | Evidence |
|----|------|--------|----------|
| CLAUDE-BA-HRM-MD-ORPHAN-SCAN-01 | ba-process | OPEN | TBD |
| CLAUDE-BA-HRM-MD-SETTINGS-MENU-01 | ba-data | OPEN | TBD |
| CLAUDE-SA-XBOS-DM-CONTROL-01 | sa | OPEN | TBD |
| CLAUDE-QA-HRM-MD-MATRIX-01 | qa | OPEN | TBD |
| CLAUDE-PM-30YR-SYNTH-NOTE-01 | Claude-PM | OPEN | TBD |

## Findings log (APPEND only)

<!-- seats append below -->

### 2026-07-28 | SA-XBOS-HRM-CONTROL-GAP-01 (CURSOR sa)

- **evidence_path:** `docs/qa/evidence/sa-xbos-hrm-control-gap-01-20260728.md`
- **Verdict:** XBOS đủ control HRM master data? → **PARTIAL** (not YES/NO).
- **Findings:**
  1. L0→L1→L2a spine **HAS**: publish · pull · extension WF approve (API_DESIGN CATALOG_GOV A–G + Settings pair + OpenAPI).
  2. **XBOS-DM-HRM-07** copy = OpenAPI `apply-to-members` (`XBOS-CFG-204`) — **PARTIAL**: allow-list only `job_titles|recruitment_channels|job_grades`; **misses** P0 `departments` + `leave_types`.
  3. apply-to-members in API_DESIGN = **F.1-lite cite** only → U71 depth gap before expand.
  4. Dual surface risk: `config-sync` `job_titles` vs `business-master/positions` (UC-XBOS-MD-01).
  5. Matrix STT 248–262: only DM-09/10 «Có — endpoint»; rest «Một phần» — matches PARTIAL.
  6. DANH_MUC STT 27–36 / DEC/PAY = cite-only keys — not full XBOS control plane.
  7. Field-group presets (STT 15–20 / CC groupHr) parallel to L0 — boundary needed in G1.
  8. Work History free-text Vị trí = **HRM consumer picker gap** (AC-HRM-PICKER-01), not missing XBOS publish API.
  9. Recommend Option C: keep spine → G1 SRS/TechSpec/DB-API expand allow-list + SoT lock → then E1 Dev.
  10. **Cấm** Phase1/PROD / apps/** from this seat.
- **next:** `BA-HRM-MD-SRS-DELTA-01` (after SYNTH/U74 chốt) → `SA-HRM-MD-TECHSPEC-01` → `BA-HRM-MD-DB-API-01`

### 2026-07-28 | QA-HRM-MD-PICKER-SPOT-01 | qa | PASS_TO_PM

**Evidence:** `docs/qa/evidence/qa-hrm-md-picker-spot-01-20260728.md`  
**Locks:** U65 zero-seed · HOLD_DEPLOY · no nip.io · no Phase1 claim

**Findings (inventory):**

1. **Work History Vị trí = free-text Input** — `EmployeeWorkHistory.tsx` L990–994; zero bind to `job_titles`/`positions`/`CatalogSearchPicker` → **FAIL** vs SRS §16.0 AC-HRM-PICKER-01 (expected product gap).
2. **Phòng ban same dialog = Select** — asymmetry confirms orphan position control, not missing Select pattern.
3. **Settings SoT EXISTS** — `HRM_SC_POS_KEYS` + `GET /settings-catalogs` + `GET /:catalogKey/items`; FE `MasterDataSettingsPanel` Chức danh → `job_titles`.
4. **Live smoke PASS** — XBOS login 201; Bearer overview 200 (76 catalogs, HAS job_titles+positions); `job_titles/items` total=5; `positions/items` total=33.
5. **Contrast PASS** — `EmployeeFormDialog` already CatalogSearchPicker for position.
6. **Quick orphans** — `EmployeeContracts.tsx` + `EmployeeWorkTimeline.tsx` also free-text position Inputs.
7. **Matrix** — UF-HRM-10 Settings 🟢; no Work History picker UF row (consumer gap).
8. **Next** — wait SYNTH / peer; full browser `QA-HRM-MD-PICKER-01` only after E1 FE bind.

**ack_status:** PASS_TO_PM (inventory FAIL ≠ QA process fail)

### Cursor findings — BA-HRM-MD-PICKER-INVENTORY-01 (ba-process · 2026-07-28)

**Evidence:** `docs/qa/evidence/ba-hrm-md-picker-inventory-01-20260728.md`

1. **Sponsor FAIL confirmed:** `EmployeeWorkHistory` «Thêm quá trình công tác» → **Vị trí** = `<Input>` free-text (~L990–994); Phòng ban = Select nhưng `dept.name` (GAP vs catalog code).
2. **Spec already locks** BR-HRM-MD-01 + AC-HRM-PICKER-01 + FR-HRM-SC-POS/JT/LEAVE/DEC/PAY — gap class = **orphan picker / implement**, not missing FR.
3. **PASS islands exist:** `EmployeeFormDialog` (dept+position CatalogSearchPicker), `LeaveTab` (leave_types), `JobTemplatesTab` (position_code), `JobRequisitionsTab` (JD + dept), `Decisions.decision_type`, Settings `MasterDataSettingsPanel`.
4. **P0 FAIL cluster (position free-text):** Work History · Decisions.position · JobPostings.position · HeadcountProposal.position_name · EmployeeContracts.position.
5. **Department inconsistency:** CatalogSearchPicker on Employee/YCTD vs Input (JobPostings, Headcount) vs name-Select (Work History, Decisions, EmployeeContracts).
6. **Employment type** = hardcoded Select on EmployeeForm / JobPostings / Requisitions → GAP P2 (Settings-extendable via SC-EXT).
7. **Pay:** component *instances* pickable in SalaryTemplateBuilder (PASS); `component_type` enum still hardcoded `['Lương',…]` (GAP · orphan #12); template «vị trí áp dụng» derived from employee `job_title_key` not Settings picker (GAP).
8. **Contract type parity:** `Contracts` page reads `contract_types` catalog; `EmployeeContracts` still hardcodes `CONTRACT_TYPES_KEYS` (GAP P1).
9. **E1 preview (after U74 chốt):** lead `D-FE-HRM-WH-POSITION-PICKER-01` then wave same pattern to Decisions / JobPostings / Headcount / EmployeeContracts; BE `position_key` if schema still free-text-only.
10. **Do not** reopen SRS wipe — SYNTH may only ADD AC examples if needed; cấm Dev `apps/**` until sponsor chốt plan.

---

### 2026-07-28 · BA-HRM-MD-CATALOG-TRACE-01 · ba-data (Cursor)

- **Evidence:** `docs/qa/evidence/ba-hrm-md-catalog-trace-01-20260728.md`
- Pipe L0 XBOS `config_catalogs` → L1 `synced_catalogs` → L2a extension → `GET /settings-catalogs` `mergeEffective` is SoT; canonical keys `job_titles`/`departments`/`leave_types`/`decision_types`/`salary_components`.
- **OK bind:** Settings MasterData panel; EmployeeFormDialog position→`job_title_key` + BE assert; LeaveTab `leave_types`; Decisions `decision_types`; JobTemplatesTab position_code.
- **P0 FREE_TEXT:** `EmployeeWorkHistory` Vị trí = Input; DB `employee_work_timeline.position` TEXT — **no** `position_key`/`job_title_key`; BE no catalog assert on timeline.
- **P1 PARTIAL:** WH department Select persists `dept.name` (label) not catalog `code`.
- **P2:** Attendance sheet positions filter from employee display strings; SalaryComponents `component_type` hardcoded enum (GAP-MD-07 / GAP-PAY-TYPE-01).
- **E1 naming:** prefer ADD `position_key` on timeline + optional label snapshot; reuse `jobTitleOptionsFromCatalog`; must_keep EmployeeFormDialog + Settings merge.
- **next:** SYNTH after inventory+SA+Claude; Dev only post sponsor chốt — `D-FE-HRM-WH-POSITION-PICKER-01` + `D-BE-HRM-WH-POSITION-KEY-01`.

