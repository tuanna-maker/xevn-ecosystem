# QA-HRM-SETTINGS-MD-LEAVE-01 — LeaveTab catalog SoT retest

| Field | Value |
|-------|--------|
| **Date** | 2026-07-25 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-SETTINGS-MD-LEAVE-01` (batch parent `QA-HRM-SETTINGS-MD-FE-BATCH-01`) |
| **Dev entry** | `docs/qa/evidence/fe-hrm-settings-md-leave-01-20260725.md` |
| **BA SoT** | `docs/qa/evidence/ba-hrm-settings-master-data-01-20260723.md` — **AC-SET-FS-05** · **BR-SET-MD-03** |
| **Prior FAIL** | `docs/qa/evidence/qa-hrm-settings-master-data-01-20260725.md` §1.4 |
| **U65** | zero-seed · **HOLD_DEPLOY** · **NOT** Phase1/PROD |
| **Overall verdict** | **PASS** (code + unit) · **BLOCKED** live browser UF (hrm-api down) — **no UF 🟢** |

---

## 0. Environment / L0

| Check | Result | Note |
|-------|--------|------|
| `qc:dev-stack` (first) | **PARTIAL** | hrm `:28001` **200** · xbos **200** · portal **down** |
| After `dev:web-only` | portal `:5173` **200** · HRM Vite `:8080/hr/` **200** · hrm-api **down** |
| `pnpm run dev:hrm-api` | **FAIL** start (turbo exit -1) | Process did not listen; **not** claimed as TS compile fail — `tsc --noEmit -p tsconfig.build.json` **exit 0** (no error output) |
| Browser U65 path | **BLOCKED** | No FE→API 2xx without `:28001`; no Playwright in repo; no browser MCP |
| Seed | **not used** | U65 |

**Implication:** Exit rows below marked **PASSᶜ/ᵘ** = code/static + vitest. Live create/approve/F5 = **BLOCKED** — not UF 🟢.

---

## 1. Exit criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Empty `leave_types` → create dialog amber empty + CTA (no 8 fake types) | **PASS** (code+unit) | `leaveTypeOptionsFromCatalog([])` → `[]` (vitest); `LeaveTab` uses that helper only — **no** bootstrap of 8 keys; `CatalogSearchPicker` empty → amber `border-amber-200 bg-amber-50` + CTA «Mở Cài đặt → Danh mục… / Loại nghỉ»; form `leaveType: ''`; submit guarded by `isCatalogPickerValueAllowed(..., { allowEmpty: false })` |
| 2 | With catalog → picker + filter; create FE after 2xx + F5 when live | **PASSᵘ** picker/filter · **BLOCKED** live mutate | Unit: maps `leave_types` → `{value:code}`; filter `SelectItem` from `leaveTypeOptions.map`. Live create/F5 **not executed** (API down) |
| 3 | Approve path OK when requests exist | **PASS** (code wire) · **BLOCKED** live | `handleApprove` → `approveRequest(id)` still on list + detail; no live click |
| 4 | Evidence this file | **PASS** | — |

### AC-SET-FS rollup (leave_types)

| AC | Verdict | Note |
|----|---------|------|
| AC-SET-FS-01 | **PASSᶜ** when catalog populated | Options from `effectiveItems` only |
| AC-SET-FS-02 | **PASSᶜ** | Shared `CatalogSearchPicker` search |
| AC-SET-FS-03 | **PASSᵘ** bind · **BLOCKED** live | Persist path = picker `value` (= code); live F5 blocked |
| AC-SET-FS-04 | **PASSᶜ** filter | List filter options from catalog only (empty → only «Tất cả») |
| AC-SET-FS-05 | **PASS** (code+unit) | Closes prior **FAIL** bootstrap 8 fake types |

**Prior §1.4 FAIL (bootstrap)** → **CLOSED** at FE code/unit.

---

## 2. Verify commands (QA re-ran)

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/catalogSearchPicker.test.ts
# → 13/13 PASS (incl. 3 leave-type AC-SET-FS-05)
```

Also with dept suite: `catalogSearchPicker` + `p1-hrm-perf-fe-03` → **15/15**.

Grep: no `leaveTypeLabels` / bootstrap discrete list remaining as option SoT in `LeaveTab.tsx` (display via `resolveLeaveTypeLabel`).

---

## 3. Residuals

| Residual | Owner |
|----------|--------|
| Live U65 create + F5 + Network 2xx | **qa** — see `qa-hrm-settings-master-data-02-20260725.md` (**PARTIAL**: empty CTA once PASS under intercept; create→F5 **not promoted**) |
| BE `LEAVE_TYPE_COLORS` / balance default `annual` (G-ORPH-BE-04/13 BE) | dev-be (out of this FE wave) |
| hrm-api process start fail (turbo -1) despite `tsc` exit 0 | devops / dev-be — restore L0 |

---

## 4. What was NOT done

- No `pnpm seed:*` / invent leave codes
- No API-only claim as UF 🟢
- No Phase1 / PROD
- No screenshot (API down for mutate path)

---

## 5. Handoff

- **ack_status:** `PASS_TO_PM` (code gate closed; live UF not 🟢)
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/qa-hrm-settings-md-leave-01-20260725.md`

### completion_report

**Closed:** Prior LeaveTab empty-catalog FAIL (8 fake types) closed — catalog SoT only; amber empty + CTA; unit 13/13 leave helpers; approve wiring intact.

**Open:** Browser UF create/approve/F5 **BLOCKED** — hrm-api not listening; do not promote UF 🟢 or QC until L0 full + browser retest.
