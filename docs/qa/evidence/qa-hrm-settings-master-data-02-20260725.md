# QA-HRM-SETTINGS-MASTER-DATA-02 — Live U65 retest (leave + dept + picker)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MASTER-DATA-02` |
| **also_covers** | `QA-HRM-SETTINGS-MD-FE-LIVE-01` |
| **BA SoT** | `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` — AC-SET-FS-01..05 |
| **Compile entry** | `docs/qa/evidence/be-hrm-settings-md-compile-01-20260725.md` |
| **FE leave** | `fe-hrm-settings-md-leave-01-20260725.md` · prior unit QA `qa-hrm-settings-md-leave-01-20260725.md` |
| **FE dept** | `fe-hrm-settings-md-dept-01-20260725.md` · prior unit QA `qa-hrm-settings-md-dept-01-20260725.md` |
| **FAIL baseline** | `qa-hrm-settings-master-data-01-20260725.md` |
| **Env** | local 1B · portal `:5173` · HRM FE `:8080` (`VITE_DEV_PROXY_HRM_API=http://127.0.0.1:28001`) · hrm-api `:28001` |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD · **NOT** `:8088` |
| **Overall** | **PARTIAL** — not full matrix 🟢 |

---

## 0. L0 / environment

| Check | Result | Note |
|-------|--------|------|
| `pnpm run qc:dev-stack` (first) | **PASS** content | hrm `:28001` **200** · xbos **200** · portal **200** (script later hit Node UV assert on Windows — health lines green) |
| `pnpm run qc:fe-be-health` | **PASS** | portal-login + employees + catalog-sync direct/proxy **200** |
| hrm-api stability | **FLAKY** | Dist race / `EADDRINUSE` / `Cannot find module './spreadsheet/spreadsheet.module'` when concurrent nest rebuilds; recovered via clean `tsc` + `node dist/main.js` |
| Seed | **not used** | U65 |

**Runtime logs (supporting):** `POST …/seed/tenant-position-catalog*` → **403** `HRM-CAT-POS-SEED-FORBIDDEN` (G-ORPH-BE-03 seed path blocked at API).

---

## 1. Exit criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | `qc:dev-stack` HRM 200 | **PASS** (with flaky residual) | §0 |
| 2a | Browser leave empty CTA (no 8 fakes) | **PARTIAL** | **PASS** once: Puppeteer intercept stripped `leave_types` → amber empty + CTA; `fake8=none` (`scripts/qa/qa-hrm-settings-master-data-02.mjs` mid-run). Later runs **FAIL** when Attendance nested create dialog not opened (snippet stayed on overview). **No** discrete `annual/sick/…` options observed when dialog opened. Unit still **17/17** (`leaveTypeOptionsFromCatalog([])→[]`). |
| 2b | With catalog create→2xx→F5 | **FAIL / not promoted** | Settings → Danh mục nghiệp vụ activates (native mouse). Nested **Loại nghỉ** tab visible but `#md-code-leaveTypes` **not** in DOM in automation (panel often without «Thêm / cập nhật mục» — load/scope race under flaky `:28001`). No FE POST `settings-catalogs/items` 2xx + F5 proof this wave. |
| 3a | Browser dept empty CTA | **PASS** | Multiple runs: Employee «Thêm nhân viên» + stripped/empty catalog → amber CTA «Chưa có mục…» / «Mở Cài đặt». |
| 3b | With catalog persist code not label→F5 | **FAIL / not promoted** | Employee dept combobox not reliably opened in automation this wave. Unit lock remains: `value=code`, label rejected (`qa-hrm-settings-md-dept-01`). Live persist+F5 **not** UF 🟢. |
| 4 | Settings picker smoke P0 | **PARTIAL** | Master-data panel title + «Đồng bộ XBOS» reachable; leave/dept bucket forms not exercised live when `#md-code-*` missing. Catalog API baseline: `leave_types=4` (`LVT_01..04`), `departments=4` (`DEPT_01..04`), `job_titles=8`. |
| 5 | Evidence this file | **PASS** | — |
| 6 | Residual POS-SEED / JT | **OPEN** (OK to note) | Seed endpoint **403** forbidden — good. JT free-text DTO residual from matrix-01 **still open**. Do **not** claim full Settings MD matrix 🟢. |

### Runtime artifact

`docs/qa/evidence/_tmp-qa-hrm-settings-md-02-runtime.json` · scripts: `scripts/qa/qa-hrm-settings-md-02-*.mjs`

### Unit (no seed)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/catalogSearchPicker.test.ts
→ 17/17 PASS
```

---

## 2. AC-SET-FS rollup (live + unit)

| Field | AC-01 | AC-02 | AC-03 | AC-04 | AC-05 | Field verdict |
|-------|-------|-------|-------|-------|-------|---------------|
| Loại nghỉ | PASSᵘ / live PARTIAL | PASSᵘ | BLOCKED live create | BLOCKED | PARTIAL live empty | **PARTIAL** (prior FE bootstrap FAIL stays **CLOSED** at code) |
| Phòng ban | PASSᵘ | PASSᵘ | BLOCKED live persist | BLOCKED | **PASS** live empty CTA | **PARTIAL** (prior name-as-code FAIL stays **CLOSED** at code) |
| Chức danh | — | — | — | — | PARTIAL smoke | residual **POS-SEED** note |
| JD templates | — | — | residual free DTO | — | — | **OPEN** JT |

---

## 3. What was NOT done / cấm respected

- No `pnpm seed:*` / invent codes as SoT
- No UF 🟢 for leave create or dept persist without FE click path proof
- No Phase1 / PROD / `:8088`
- Empty leave CTA used **request intercept** (strip catalog JSON) once — not DB wipe; later natural empty not available (`leave_types` already has 4 XBOS items)

---

## 4. Residuals (PM)

| ID | Owner | Note |
|----|-------|------|
| Live leave create + F5 after Settings Lưu | **qa** retest when hrm-api stable + Settings nested form visible | Automation blocker + L0 flake |
| Live dept persist code + F5 | **qa** | Dialog picker open reliability |
| G-ORPH-BE-03 registry file / dual SoT | **dev-be** | Seed HTTP **403**; file may still exist |
| JT free-text DTO | **dev-be** | From matrix-01 |
| hrm-api dist race under parallel nest | **devops/dev-be** | Blocks UF reproducibility |

---

## 5. Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-hrm-settings-master-data-02-20260725.md`

### completion_report

**Closed:** L0 green achieved (flaky); FE leave/dept prior code FAILs remain closed (unit 17/17); **live dept empty CTA PASS** (U65 FE); leave empty CTA demonstrated once under catalog-strip intercept (no 8 fakes); POS seed API path returns 403.

**Open / not promoted:** Settings leave/dept create→2xx→F5; leave create with catalog; dept persist code→F5; full matrix 🟢; JT residual; hrm-api stability.

### next_dispatch_prompt

```text
work_item_id: D-HRM-SETTINGS-MD-L0-STAB-01 (or QA retest after stab)
role: devops + qa
entry: QA-HRM-SETTINGS-MASTER-DATA-02 PARTIAL — docs/qa/evidence/qa-hrm-settings-master-data-02-20260725.md
AC: stabilize hrm-api :28001 (no dist wipe races); then QA U65: Settings → Danh mục nghiệp vụ → Loại nghỉ/Phòng ban → Lưu 2xx → F5; Leave create catalog code; Employee dept picker shows DEPT_* code not label → Lưu → F5
cấm: seed; claim matrix 🟢 while JT/POS residuals open
HOLD_DEPLOY · NOT Phase1/PROD
```
