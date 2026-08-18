# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03 — F5 after FE-05 setQ + row testid

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` |
| **stamp** | `SETW3RT7-MSN8NK8M` (runner: `SETW3RT2-MSN8NK8M`) |
| **Entry** | `docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-05.md` (READY_FOR_QA) |
| **Prior QA** | `SETW3RT6-MSN2VJGX` · `po-hrm-settings-w3-browser-01-retry-06.md` |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu → parent F5 · `settings-catalog-row-{slug}` |
| **commit** | `dc930c5` |
| **ack_status** | **FAIL_TO_PM** |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/` |

## Environment

| Check | Result |
|-------|--------|
| Portal | `PORTAL_DEV_URL=http://127.0.0.1:5173` (no full dev restart this run; L0 PASS) |
| FE-05 on disk | `useSettingsCatalogFocusPage.ts`, `settingsCatalogRowTestId`, four W3 panels + runner `getByTestId('settings-catalog-row-{slug}')` |

## L0

| Gate | Result |
|------|--------|
| `pnpm run qc:fe-be-health` (`PORTAL_DEV_URL=http://127.0.0.1:5173`) | **exit 0** — ALL PASS |

## Summary

| Metric | Value |
|--------|--------|
| P1 mutate POST 2xx + row pre-F5 (`settings-catalog-row-*`) | **4/4** |
| F5 row (`settings-catalog-row-{slug}`) | **0/4** |
| `contract-templates` `ctr-tpl-canvas` | **1/1** |
| Overall | **FAIL** (exit requires F5 **4/4**) |

**Interpretation:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-05` **partially verified** — stable row testid + pre-F5 visibility improved vs FE-04 runs; **parent F5 still drops row from DOM** on all four catalog tabs.

## BE vs FE (post-run probe)

| Tab | Slug | GET list after run |
|-----|------|-------------------|
| `att-attendance-codes` | `rt2n8nk8matt` | **Present** in `GET /api/hrm/attendance/attendance-codes?company_id=main` (body contains slug; `data.length=11`) |

→ Server has row; F5 miss = **FE focus/search/page after parent reload** (not BE).

---

### UF-SET-W3-A01 — `att-attendance-codes`

- Click path: CC HRM Cài đặt → `?tab=att-attendance-codes` → Thêm → Lưu slug `rt2n8nk8matt`
- Network: POST `/api/hrm/attendance/attendance-codes` → **200**
- **FE sau 2xx:** `settings-catalog-row-rt2n8nk8matt` visible pre-F5
- F5: parent `reload` + `networkidle` + `?tab=` → row **missing**
- Verdict: 🔴

### UF-SET-W3-B01 — `emp-document-types`

- Slug `rt2n8nk8memp` · POST **200** · pre-F5 🟢 (`settings-catalog-row-*`) · F5 🔴

### UF-SET-W3-B02 — `emp-employment-types`

- Slug `rt2n8nk8memp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Slug `rt2n8nk8mrec` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-C03 — `contract-templates`

- Thêm mẫu → `ctr-tpl-canvas` visible · Verdict: 🟢

## Defects

| ID | Sev | Note |
|----|-----|------|
| FE-SET-W3-F5-ROW | P1 | POST 200 + pre-F5 4/4 via row testid; F5 0/4 after FE-05; GET contains slug |
| UF-SET-W3-A01..B07 | P1 | See JSON defects |

## J-* / matrix

- In-scope: settings W3 narrow slice. L2.5 N/A for this WI.

## completion_report

- **Closed:** L0 exit 0 on `:5173`; mutate 4/4 POST 2xx; **pre-F5 4/4** with `settings-catalog-row-{slug}`; contract-templates canvas; BE GET proof slug in list; 0 console/page errors in runner.
- **Open:** F5 list visibility **0/4** — **no PASS_TO_PM**.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-W3-F5-LIST-FE-06
role: dev-fe
entry_criteria: QA FAIL SETW3RT7-MSN8NK8M / SETW3RT2-MSN8NK8M; evidence po-hrm-settings-w3-browser-01-retry-07.md; POST 200 + pre-F5 4/4 (settings-catalog-row-*); F5 0/4 after FE-05 useSettingsCatalogFocusPage (setQ + setPage, no eager storage clear); GET :28001 includes slug (rt2n8nk8matt); parent reload path in Playwright mutateCatalog (page.reload networkidle + goto ?tab=)
exit_criteria: Parent F5 → search prefilled + settings-catalog-row-{slug} visible 4/4; trace localStorage hrm-settings-catalog-focus:v1:* + iframe ?focus= after reload; vitest settingsCatalogPagination + SettingsCatalogF5ListPanels PASS; ack READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-06.md
spec_ref: po-hrm-settings-w3-f5-list-fe-05.md · UF-SET-W3-A01/B01/B02/B07
```

**pm_dispatch_hint:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-06` → re-queue `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`
