# Evidence — `PO-HRM-SETTINGS-DEFAULTS-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-DEFAULTS-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-07 |
| **lane** | execution |
| **priority** | P2 |
| **resume_chunk** | K6.3 |
| **parent** | `PO-HRM-AMIS-PARITY-SETTINGS-DEFAULTS` (L1 QC GWC) |
| **closes** | QC-02 CONDITION **FE Settings UF deferred** |
| **change_mode** | **ADD/FIX wire only** · `preserve_default: true` |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **DENIED** flip / module UAT / AMIS DONE / UF 🟢 claim this seat |
| **portal_url** | `http://127.0.0.1:5173` (or `:5175` / embed `:8088`) · HRM API `:28001` |
| **U65** | zero-seed · browser mutate only · no `pnpm seed:*` |

### Honesty locks

| Flag | Value |
|------|-------|
| **`payroll_e2e_ready`** | **`false`** (badge `settings-defaults-honesty-badge`) |
| **FE formula / GTGC invent** | **DENIED** — display-ready bind only |
| **POS create `positionLabelSnapshot`** | **DENIED** in body (DTO whitelist OBS from QA-02) |
| **SRC-02 resolve** | read-only draft preview — **no** emp C&B write |
| **Seed** | **DENIED** (U65) |
| **L1 API GWC / PAY-CFG pickers** | **must_keep** — not reopened |

---

## spec_read_ack

| Artifact | Used |
|----------|------|
| `docs/qa/evidence/po-hrm-settings-defaults-qc-02.md` | CONDITION **FE Settings UF deferred** · L1 GWC · honesty |
| `docs/qa/evidence/po-hrm-settings-defaults-qa-02.md` | L1 payloads TAX/SI/POS · no `positionLabelSnapshot` |
| `docs/qa/evidence/po-hrm-settings-defaults-be-02.md` | `@Allow()` value · YYYY-MM-DD · SC SAVEPOINT |
| `docs/program/specs/PO-HRM-SETTINGS-DEFAULTS-API-01.md` | F-SET-TAX-01 · F-SET-SI-01..03 · F-SET-POS-01..05 · SRC-02 |
| `docs/program/PO_HRM_RESUME_PLAN_20260807.md` §K6.3 | FE-01 DISPATCHED |
| Existing Settings panels | PaySheetTemplate / AttLeaveType pattern · `Settings.tsx` tabs |

### solid_convention_ack (FE–BE)

- FE binds Nest display-ready camelCase (`settingKey`/`value` · SI rates · POS `lines[]`).
- No FE tax/SI formula engine; amounts/% pass-through; ViMoneyInput format-only.
- POS resolve = GET draft + warnings (`NO_POLICY`) — never invent `employeePackageId`.

---

## Delivered

| Surface | Path / testid |
|---------|----------------|
| Settings tab | `/settings` → **Mặc định thuế/BH/PC** · `settings-tab-settings-defaults` |
| Panel | `SettingsDefaultsPanel` · `settings-defaults-panel` |
| Tax card | `settings-defaults-tax-card` · save `hdsd-settings-tax-save` |
| SI card | `settings-defaults-si-card` · save `hdsd-settings-si-save` · list `settings-si-list-table` |
| POS card | `settings-defaults-pos-card` · save `hdsd-settings-pos-save` · resolve `hdsd-settings-pos-resolve` |
| API client | `hrmApi` GET/PUT `/settings/company-settings` · SI CRUD/retire · POS CRUD/retire/resolve |
| Catalog helpers | `lib/settingsDefaultsCatalog.ts` (+ vitest **6 PASS**) |

### Click path (QA U65 browser)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · JWT `companyId=main` (holding partition).

1. Login → portal HRM embed → **Cài đặt**.
2. Tab **Mặc định thuế/BH/PC** (`settings-tab-settings-defaults`).
3. **Thuế:** sửa giảm trừ bản thân / phụ thuộc (ViMoney) → **Lưu thuế** (`hdsd-settings-tax-save`) → Network **PUT** `/api/hrm/settings/company-settings` **200** `HRM-SET-TAX-200` (× keys) → **Tải lại** / F5 → số còn.
4. **BH:** nhập `insuranceTypeKey` (open, vd. `BHXH_FE01`) + % + `effectiveFrom` YYYY-MM-DD → **Tạo cấu hình BH** → **POST** `…/insurance-rate-cfg` **201** `HRM-SET-SI-201` → row trong `settings-si-list-table` → F5 còn → (tuỳ chọn) **Sửa** PATCH → **Ngừng** soft retire.
5. **PC vị trí:** `positionKey` (vd. `CEO`) + chọn **mã PC từ catalog** (không orphan / không `positionLabelSnapshot`) + số tiền → **Tạo chính sách PC** → **POST** `…/position-compensation-policies` **201** `HRM-SET-POS-201` → list row → F5.
6. **Resolve:** nhập cùng `positionKey` → **Resolve draft** → thấy `warnings` / lines · **không** ghi C&B NV (SRC-02).
7. Regression: tab **Mẫu bảng lương** / PAY-CFG pickers vẫn GWC; badge `payroll_e2e_ready=false`.

### Expected Network codes

| Action | Expect |
|--------|--------|
| TAX PUT | `200` `HRM-SET-TAX-200` |
| TAX bad amount (optional) | `400` `HRM-SET-TAX-400-SHAPE` |
| SI create | `201` `HRM-SET-SI-201` |
| SI overlap active | `409` `HRM-SET-SI-409-OVERLAP` |
| POS create | `201` `HRM-SET-POS-201` |
| POS orphan code | `400` `HRM-ALLOW-CAT-ORPHAN-CODE` |
| POS resolve | `200` · may `NO_POLICY` |

---

## Unit evidence

```text
pnpm exec vitest run src/lib/settingsDefaultsCatalog.test.ts
→ Test Files 1 passed · Tests 6 passed
```

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/settingsDefaultsCatalog.ts` | NEW helpers + honesty |
| `apps/web/hrm/src/lib/settingsDefaultsCatalog.test.ts` | NEW 6 tests |
| `apps/web/hrm/src/integrations/hrmApi.ts` | ADD F-SET-TAX/SI/POS client |
| `apps/web/hrm/src/components/settings/SettingsDefaultsPanel.tsx` | NEW panel |
| `apps/web/hrm/src/pages/Settings.tsx` | ADD tab + CODE-MEMORY-CHANGE |
| `docs/qa/evidence/po-hrm-settings-defaults-fe-01.md` | this evidence |

---

## completion_report

### Closed

1. Wired Settings browser UF for tax KV (`pay_tax_*`), SI rate CFG, and position compensation policies against L1-ready Nest mounts.
2. F5-persist path: load on mount + reload CTAs; mutate via PUT/POST/PATCH/retire; POS resolve preview SRC-02 read-only.
3. Honesty: `payroll_e2e_ready=false` badge; no `positionLabelSnapshot` on create; no FE formulas.
4. Unit: `settingsDefaultsCatalog` **6 PASS**.

### Residual

- QA U65 browser UF retest (this handoff) — not claimed 🟢 here.
- `C-SLICE-≠-MODULE` honesty carry from QC-02 (seat ≠ module GO).
- PAY process tax/SI consumer wire **out of scope**.

### Explicit non-claims

- Not UF 🟢 · not AMIS DONE · not module Settings UAT · not `payroll_e2e_ready=true` · not Phase 1 DONE.

---

## next_owner

**qa**

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-DEFAULTS-QA-03
from_role: pm
to_role: qa
lane: execution
priority: P2
parent: PO-HRM-SETTINGS-DEFAULTS-FE-01
ref_fe: docs/qa/evidence/po-hrm-settings-defaults-fe-01.md

## Goal
U65 browser UF Settings defaults (FE-01) — zero-seed:
1) Login ceo@xe.vn → Cài đặt → tab «Mặc định thuế/BH/PC» (settings-tab-settings-defaults)
2) TAX: edit personal/dependent → Lưu thuế → PUT 200 HRM-SET-TAX-200 → F5 values persist
3) SI: create insuranceTypeKey + rates + YYYY-MM-DD → POST 201 → list row → F5; optional overlap 409; soft retire
4) POS: create positionKey + PC code from catalog picker (no positionLabelSnapshot) → POST 201 → F5; Resolve draft SRC-02 no emp write
5) Honesty: badge payroll_e2e_ready=false · no seed · do not claim module UAT / AMIS DONE

## exit_criteria
docs/qa/evidence/po-hrm-settings-defaults-qa-03.md · PASS_TO_PM or FAIL with residual IDs
click path + Network codes in evidence
```

---

## evidence_path

`docs/qa/evidence/po-hrm-settings-defaults-fe-01.md`

## ack_status

**READY_FOR_QA**

## payroll_e2e_ready

**false**
