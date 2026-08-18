# PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01-QA — Evidence

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01-QA` |
| **Parent BE** | `PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01` · `docs/qa/evidence/po-mfd-m2-att-settings-catalog-500-01.md` |
| **Prior runtime** | `PO-MFD-M1-ATT-QA-RUNTIME` · Tùy chỉnh already LIVE |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |
| **uat_done** | `false` (formal confirm seat only — not full menu / not UAT close) |
| **Account** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL** | `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main` |
| **commit** | `dc930c5` |
| **U65** | zero-seed · no seed · no full 38-menu re-smoke |
| **hdsd_align** | Chấm công → **Thiết lập** → **Quy định chấm công** → **Tùy chỉnh bảng công** |

## L0 stack

| When | Check | Result |
|------|-------|--------|
| Entry | `pnpm run qc:fe-be-health` | **PASS** |
| Exit | `pnpm run qc:fe-be-health` | **PASS** |

## Method (U65 · browser)

Playwright headless Chrome — script `scripts/qa/_tmp-po-mfd-m2-att-settings-catalog-500-01-qa.mjs`

1. Login API `ceo@xe.vn` → inject portal auth
2. Open `/hr/attendance?portal=1&tenantId=xevn&companyId=main`
3. Click **Thiết lập** → **Quy định chấm công** → tab **`hdsd-att-rules-tab-customize`** (Tùy chỉnh bảng công)
4. Capture Network `GET /api/hrm/settings-catalogs` + Sync ERROR banner heuristics

Raw JSON: `docs/qa/evidence/_tmp-po-mfd-m2-att-settings-catalog-500-01-qa-browser.json`  
Screenshot: `docs/qa/evidence/screens/po-mfd-m2-att-settings-catalog-500-01-qa/tuy-chinh.png`

## Results

| Check | Result |
|-------|--------|
| Browser `GET /api/hrm/settings-catalogs` | **200** · code **`HRM-SET-200`** (1 request) |
| Direct HRM API (supporting) | **200** · `HRM-SET-200` |
| HRM API ≥500 on `/api/hrm/*` | **none** |
| Sync ERROR / HRM-SYS-001 banner | **absent** |
| Customize tab body | Visible column editor («Thiết lập cấu trúc bảng chấm công…») |
| `consoleErrors` / `pageErrors` | **[]** |

### Click path

```text
Login ceo@xe.vn
→ /hr/attendance?portal=1&tenantId=xevn&companyId=main
→ Thiết lập
→ Quy định chấm công
→ Tùy chỉnh bảng công (data-testid=hdsd-att-rules-tab-customize)
→ Network GET /api/hrm/settings-catalogs → 200 HRM-SET-200
```

## Runtime log

| id | Was | After this seat |
|----|-----|-----------------|
| `rules-Tùy-chỉnh` | LIVE (M1 runtime) | **LIVE confirmed** — BE harden retest; no 500 |

Updated note in `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_RUNTIME_LOG.md`.

## Residual (out of seat / not blockers for this work_item)

- FE customize columns still non-persist mock — BE residual (known)
- STUB_UI settings sidebar (#40–46) — **dev-fe** / BA CFG
- ScanFace + Máy chấm công tab ambiguity — separate P0 **dev-fe**
- **uat_done** remains `false`

## L2.5

Formal catalog-500 confirm only — J-* leave/attendance detail journeys **not** in this seat scope.

---

### completion_report

Closed **PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01-QA**: L0 PASS entry+exit; browser U65 path Thiết lập → Quy định → Tùy chỉnh proves `GET /api/hrm/settings-catalogs` **200 `HRM-SET-200`**; no Sync ERROR / 500. Runtime `rules-Tùy-chỉnh` stays **LIVE**. Residual STUB/ScanFace/customize mock out of scope. **uat_done false**.

### next_owner

**pm**

### next_dispatch_prompt

```text
work_item_id: PO-MFD-M2-ATT-SETTINGS-CATALOG-500-01 — CLOSED
from_role: qa
to_role: pm
lane: governance
ack_status: PASS_TO_PM

Closed: BE harden settings-catalogs corrupt catalog_key — browser confirm PASS (HRM-SET-200 on Tùy chỉnh).
evidence_path: docs/qa/evidence/po-mfd-m2-att-settings-catalog-500-01-qa.md
uat_done: false

Next (ordered residuals — not this seat):
1) PO-MFD-M2 / dev-fe: R-MFD-ATT-SCANFACE-UNDEFINED + R-MFD-ATT-RULES-TAB-AMBIGUITY
2) Continue M2 backlog (SCOPE/BALANCE/CFG) per HRM-ATTENDANCE_M2_BACKLOG.md
cấm: claim uat_done · seed · full menu re-inventory unless M2 QA seat
```

### evidence_path

`docs/qa/evidence/po-mfd-m2-att-settings-catalog-500-01-qa.md`

### ack_status

**PASS_TO_PM**
