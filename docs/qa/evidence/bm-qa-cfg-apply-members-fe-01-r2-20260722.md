# BM-QA-CFG-APPLY-MEMBERS-FE-01-R2 — Áp dụng danh mục HRM (ĐVTV) U65 browser retest

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-CFG-APPLY-MEMBERS-FE-01-R2` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution |
| **priority** | P0 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (session token present) |
| **URL** | `http://14.225.217.232:8088` |
| **click path** | `/command-center` → CÀI ĐẶT HỆ THỐNG → **Áp dụng danh mục HRM** → `job_titles` → Chọn tất cả (4 ĐVTV) → Áp dụng → confirm Áp dụng → FE status → F5 → reopen panel |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim · do not sole-FAIL on Group CEO member GET 409 |
| **entry** | `docs/qa/evidence/d-do-8088-portal-presets-sync-01-20260722.md` (CC Vite fixed) |
| **prior FAIL** | `docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-20260722.md` (blank `#root` / Vite resolve) |
| **spec_ref** | XBOS-DM-HRM-07 · G-BM-REC-01 · OpenAPI `configSyncApplyCatalogToMembers` |
| **executed_at** | `2026-07-22` ICT (~00:18–00:20) |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

| Layer | Result |
|-------|--------|
| L0 Vite CC modules | **PASS** — `CommandCenterPage.tsx` / `MetadataTypedFieldControls.tsx` / `workflow-resolver.ts` / presets → **200** `text/javascript`, no `Failed to resolve` |
| L2 `/command-center` | **PASS** — `#root` childCount **1**; Command Center chrome + inbox KPI render (not blank) |
| L2.5 apply click path | **PASS** — panel **Áp dụng danh mục HRM sang ĐVTV** opens; `job_titles` default |
| POST apply-to-members | **PASS** — **201** + code **`XBOS-CFG-204`** · `appliedCount=4` |
| FE after 2xx | **PASS** — status `Đã áp dụng Chức danh: appliedCount=4 · nguồn 4 mục` + result list 4 tenants |
| F5 holding source | **PASS** — after reload + reopen panel: `Nguồn holding: xevn/holding · version 7 · 4 mục` · same checksum |
| Seed | **None** |
| Member GET 409 (Group CEO) | **Noted only** — panel warning present; **not** used as sole FAIL |

**Overall:** **PASS_TO_PM** — prior CC Vite blocker cleared; U65 FE mutate path closed.

---

## AC results

| AC | Expected | Actual | Verdict |
|----|----------|--------|---------|
| CC loads | Not blank `#root`; no Vite Failed to resolve | rootChildren=1; Vite modules 200 JS | 🟢 |
| Open panel | Cài đặt → Áp dụng danh mục HRM | Menu item + panel heading visible | 🟢 |
| Catalog `job_titles` | Selectable / default | Combobox value `Chức danh (job_titles)` | 🟢 |
| ≥1 ĐVTV → Áp dụng | Confirm + mutate | Chọn tất cả → 4 ĐVTV → confirm dialog → POST | 🟢 |
| Network POST | 2xx + `XBOS-CFG-204` + `appliedCount` ≥ 1 | POST `/api/xbos/config-sync/catalog/job_titles/apply-to-members` → **201** · code **XBOS-CFG-204** · **appliedCount=4** (~8478 ms) | 🟢 |
| FE after 2xx | Toast/status shows appliedCount | `appliedCount=4`; result rows xe-tmdv / visun / xe-du-lich / xe-vietnam | 🟢 |
| F5 | Holding source still listed | version **7** · **4 mục** · checksum `sha256:af60ffad5a89…` | 🟢 |
| Group CEO member GET 409 | Note only | Scope note on panel; not sole-FAIL | ⚪ N/A |

---

## Network evidence (browser fetch hook · no secrets)

### POST apply-to-members

- **URL:** `/api/xbos/config-sync/catalog/job_titles/apply-to-members`
- **Method:** `POST`
- **Status:** **201**
- **Body excerpt (sanitized):**

```json
{
  "success": true,
  "code": "XBOS-CFG-204",
  "message": "Catalog applied to members",
  "data": {
    "catalogKey": "job_titles",
    "source": {
      "tenantId": "xevn",
      "companyId": "holding",
      "version": 7,
      "checksum": "sha256:af60ffad5a89c85a3beb631de09069d5cdcbe3fda24dff3d115b56d44054a7c9",
      "itemCount": 4
    },
    "applied": [
      { "tenantId": "xe-tmdv", "companyId": "main", "version": 1 },
      { "tenantId": "visun", "companyId": "main", "version": 1 },
      { "tenantId": "xe-du-lich", "companyId": "main", "version": 1 },
      { "tenantId": "xe-vietnam", "companyId": "main", "version": 1 }
    ],
    "appliedCount": 4
  }
}
```

### Post-apply source reload (FE auto)

- **GET** `/api/xbos/config-sync/catalog/job_titles?target=hrm&tenantId=xevn&companyId=holding` → **200** · `XBOS-CFG-201` · version 7 · 4 items (CEO, CHRO, DRIVER_LEAD, OPS_MANAGER)

---

## Vite probe (closes prior FAIL)

| Module | HTTP | Content-Type | Note |
|--------|------|--------------|------|
| `CommandCenterPage.tsx` | 200 | `text/javascript` | len ~1.97MB · no import-analysis fail |
| `MetadataTypedFieldControls.tsx` | 200 | `text/javascript` | was SPA HTML fallback in R1 |
| `workflow-resolver.ts` | 200 | `text/javascript` | was SPA HTML fallback in R1 |
| `hrm-recruitment-workflow-presets.ts` | 200 | `text/javascript` | OK |

---

## Residual / follow-up (not blockers for this UF)

| Item | Owner | Priority |
|------|-------|----------|
| Optional: member-persona FE confirm catalog after apply+pull (`QA-BM-MEMBER-CATALOG-FE-01`) | `qa` | P2 defer — Group CEO cannot GET member partition (409 by design) |
| QC gate if wave needs release sign-off | `qc` | when PM requests |

---

## completion_report

**Closed:** U65 R2 browser retest after portal presets sync. Command Center boots; Áp dụng danh mục HRM → `job_titles` → 4 ĐVTV → POST **XBOS-CFG-204** · FE **appliedCount=4** · F5 holding source still listed (v7 / 4 mục). No seed. Prior Vite blank-SPA FAIL superseded.

**Residual:** Member-persona catalog visual confirm optional (409 under Group CEO expected — do not sole-FAIL).

## next_owner

`pm` — intake PASS; dispatch `qc` if gate needed, else continue B-Minutes wave / optional `QA-BM-MEMBER-CATALOG-FE-01`.

## next_dispatch_prompt

```text
work_item_id: QC-BM-CFG-APPLY-MEMBERS-01 (or next B-Minutes open item)
from_role: pm
to_role: qc
priority: P1
entry: docs/qa/evidence/bm-qa-cfg-apply-members-fe-01-r2-20260722.md PASS_TO_PM
job:
  - Audit U65 evidence: CC Vite green · POST XBOS-CFG-204 · appliedCount=4 · F5 holding source
  - Confirm no seed · no Phase1/PROD claim · 409 Group CEO member GET not sole-FAIL
  - If GO WITH CONDITIONS: list only optional member-persona confirm
exit_criteria: GO or GWC with residual owner; evidence docs/qa/evidence/qc-bm-cfg-apply-members-01-YYYYMMDD.md
```

## ack_status

**PASS_TO_PM**
