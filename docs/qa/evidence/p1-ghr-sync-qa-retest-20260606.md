# P1-GHR-SYNC-RETEST — U34 incident retest (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-GHR-SYNC-RETEST` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **env** | localhost `:5173` (web-portal) + hrm-api `:28001` + xbos-api `:28002` |
| **route** | `http://localhost:5173/command-center?settings=company_member_units` → tab **Danh mục hồ sơ nhân sự** → popup **Cấu hình mục thông tin hồ sơ nhân sự** |
| **member entity** | X.E TM-DV — Công ty Cổ phần Thương mại và Dịch vụ X.E |
| **upstream evidence** | `p1-ghr-sync-perf-be-20260606.md`, `p1-ghr-sync-scope-fe-20260606.md` |

## Defects under retest

| ID | Symptom (incident) | Verdict |
|----|-------------------|---------|
| **D-U34-GHR-EMP-409-01** | Console 409 on `GET /api/hrm/employees` while on settings tabs | **CLOSED** — 0 employee requests / 0×409 on `company_member_units` + `company_group_hr` |
| **D-U34-GHR-SYNC-SLOW-01** | Sequential sync; frozen «Đang đồng bộ…» | **CLOSED** — progress `Đang đồng bộ danh mục 8/8…`; wall-clock network phase **~2.5s** (< 5s) |
| **U34 consumer sync** | Reopen popup — fields persisted; HRM form reads catalogs | **PASS** |

## L0 / automation gates

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | exit **0** |
| `pnpm run qc:fe-be-health` | **ALL PASS** (portal `:5173`, hrm employees 200, catalog-sync 200) |
| `vitest groupHrCatalogApi.test.ts` | **2/2 PASS** |
| `jest settings-catalogs.service.spec.ts` | **3/3 PASS** |

## Browser journey (exact user screenshot path)

### Step 1 — Đơn vị thành viên, no employee 409

- URL: `?settings=company_member_units`
- Sidebar: **Cài đặt** → **Đơn vị thành viên**
- `performance.getEntriesByType('resource')` filtered `/api/hrm/employees`: **count=0**, **has409=false**

### Step 2 — Member company GHR popup

- Sidebar: **Danh mục hồ sơ nhân sự** (while URL param still `company_member_units`)
- Entity tab: **X.E TM-DV**
- Click **Cấu hình chi tiết** → dialog title **Cấu hình mục thông tin hồ sơ nhân sự**
- HRM catalog hydrated from DB: **38** preset fields + prior `QA W5 HRM Cat BE Fix 20260606`

### Step 3 — Sync perf + progress + toast

- Added field: `QA GHR Sync Retest 20260606` (`company_group_hr_profile__personal__qa_ghr_sync_retest_20260606`)
- Click **Xác nhận (áp dụng)**:
  - Button progress: `Đang đồng bộ danh mục 8/8…` (N/M observed)
  - Network (parallel POST + GET):

| Path | HTTP | ms |
|------|------|-----|
| `…/hrm_employee_basic_fields/extension-items` | 201 | 766 |
| `…/hrm_employee_personal_fields/extension-items` | 201 | 991 |
| `…/hrm_employee_contact_fields/extension-items` | 201 | 970 |
| `…/hrm_employee_emergency_fields/extension-items` | 201 | 968 |
| `…/hrm_employee_address_fields/extension-items` | 201 | 970 |
| `…/hrm_employee_insurance_fields/extension-items` | 201 | 992 |
| `…/hrm_employee_work_fields/extension-items` | 201 | 1501 |
| `…/hrm_employee_finance_fields/extension-items` | 201 | 2079 |
| `GET /api/hrm/settings-catalogs` | 200 | 1777 |

- Max parallel bucket latency **2079ms** → total sync **< 5s** (vs pre-fix ~1.3s × 8 sequential)
- Success toast: *«Đã áp dụng và đồng bộ cấu hình khối & trường sang HRM DB (immediate). Form NV HRM sẽ đọc lại catalog khi mở.»*
- **No** 409 on `settings-catalogs` or `employees`

### Step 4 — U34 reopen persist

- Re-click **Cấu hình chi tiết** (popup reopen without F5)
- Dialog shows **12** fields in `personal` block including **QA GHR Sync Retest 20260606**
- Outer list: **39 trường** includes new field (consumer sync without reload)

### Step 5 — API read-back (HRM consumer)

```text
GET /api/hrm/settings-catalogs
  Authorization: Bearer <ceo@xe.vn>
  x-tenant-id: xevn · x-company-id: main
→ 200 · hrm_employee_personal_fields.effectiveItems: 12
→ hit: code=company_group_hr_profile__personal__qa_ghr_sync_retest_20260606
       label=QA GHR Sync Retest 20260606
```

Scope headers on sync POST/GET: `x-tenant-id=xevn`, `x-company-id=main` (holding partition — no D-W5 regression).

## Residual (non-blocking)

- URL query stays `settings=company_member_units` when sidebar switches to **Danh mục hồ sơ nhân sự** (cosmetic deep-link; no functional FAIL).
- Optional BE single-call batch endpoint (FE parallel POST sufficient for pilot).

## completion_report

- **Closed:** D-U34-GHR-EMP-409-01, D-U34-GHR-SYNC-SLOW-01, U34 GHR catalog consumer sync for member company X.E TM-DV.
- **Promoted:** Command Center GHR popup sync path ready for QC spot on J-XBOS-02 / settings catalog wave.
- **Residual:** cosmetic URL param only (P3).

## next_owner

**pm**

## next_dispatch_prompt

PM intake **P1-GHR-SYNC-RETEST** **PASS_TO_PM**: D-U34-GHR-EMP-409-01 + D-U34-GHR-SYNC-SLOW-01 **CLOSED**; U34 reopen persist PASS (`QA GHR Sync Retest 20260606` in HRM `hrm_employee_personal_fields`). Evidence: `docs/qa/evidence/p1-ghr-sync-qa-retest-20260606.md`. Dispatch **qc** spot-gate if release-impacting, or close incident on bus; no dev re-dispatch unless user reports new screenshot.
