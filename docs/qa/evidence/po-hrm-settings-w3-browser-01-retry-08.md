# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03 — F5 after FE-06 bootstrap q + parent ?focus=

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` |
| **stamp** | `SETW3RT8-MSN95NP4` (runner: `SETW3RT2-MSN95NP4`) |
| **Entry** | `docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-06.md` (READY_FOR_QA) |
| **Prior QA** | `SETW3RT7-MSN8NK8M` · `po-hrm-settings-w3-browser-01-retry-07.md` |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu → parent `reload` + `goto ?tab=` · `settings-catalog-row-{slug}` |
| **commit** | `dc930c5` |
| **ack_status** | **FAIL_TO_PM** |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/` |

## Environment

| Check | Result |
|-------|--------|
| Portal | `PORTAL_DEV_URL=http://127.0.0.1:5173` · `dev:web-only` already up (vite_react_shadcn_ts :8080 proxied `/hr`) |
| FE-06 on disk | `resolveSettingsCatalogInitialSearchQuery`, `useSettingsCatalogQueryPageSync` bootstrap guard, parent `?focus=` sync per `po-hrm-settings-w3-f5-list-fe-06.md` |
| Hard refresh | Runner uses full parent `page.reload({ waitUntil: 'networkidle' })` per `mutateCatalog` (same as prior retries) |

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
| Console / page errors (runner) | **0** |
| Overall | **FAIL** (exit requires F5 **4/4**) |

**Interpretation:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-06` **not verified** on live `:5173` — same signature as FE-05 run (`SETW3RT7`): mutate + pre-F5 pass; parent F5 still drops row on all four catalog tabs.

## BE vs FE (post-run probe)

| Tab | Slug | GET list after run |
|-----|------|-------------------|
| `att-attendance-codes` | `rt2n95np4att` | **Present** in `GET /api/hrm/attendance/attendance-codes?company_id=main` via portal proxy (HTTP 200, body contains slug) |

→ Server has row; F5 miss = **FE bootstrap/search/page after parent reload** (not BE).

---

### UF-SET-W3-A01 — `att-attendance-codes`

- Click path: CC HRM Cài đặt → `?tab=att-attendance-codes` → Thêm → Lưu slug `rt2n95np4att`
- Network: POST `/api/hrm/attendance/attendance-codes` → **200**
- **FE sau 2xx:** `settings-catalog-row-rt2n95np4att` visible pre-F5
- F5: parent `reload` + `networkidle` + `goto ?tab=` → row **missing**
- Verdict: 🔴

### UF-SET-W3-B01 — `emp-document-types`

- Slug `rt2n95np4emp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B02 — `emp-employment-types`

- Slug `rt2n95np4emp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Slug `rt2n95np4rec` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-C03 — `contract-templates`

- Thêm mẫu → `ctr-tpl-canvas` visible · Verdict: 🟢

## Defects

| ID | Sev | Note |
|----|-----|------|
| FE-SET-W3-F5-ROW | P1 | POST 200 + pre-F5 4/4; F5 0/4 after FE-06; GET contains slug |
| UF-SET-W3-A01..B07 | P1 | See JSON defects |

## J-* / matrix

- In-scope: settings W3 narrow slice. L2.5 N/A for this WI.

## completion_report

- **Closed:** L0 exit 0 on `:5173`; mutate 4/4 POST 2xx; pre-F5 4/4; contract-templates canvas; BE GET proof; runner exit 1 `failCount=4`.
- **Open:** F5 **0/4** — **no PASS_TO_PM**.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-W3-F5-LIST-FE-07
role: dev-fe
entry_criteria: QA FAIL SETW3RT8-MSN95NP4 / SETW3RT2-MSN95NP4; evidence po-hrm-settings-w3-browser-01-retry-08.md; FE-06 on disk (bootstrap q + query/page sync + parent focus) but Playwright mutateCatalog F5 still 0/4; POST 200 + pre-F5 4/4; GET :5173 proxy includes rt2n95np4att; runner path page.reload(networkidle) + goto ?tab= only (no ?focus=)
exit_criteria: Instrument or fix so after parent F5: localStorage hrm-settings-catalog-focus:v1:{tab} read on :5173 origin + search q prefilled + settings-catalog-row-{slug} visible 4/4; optional extend runner assert parent ?focus= + localStorage; vitest settingsCatalogPagination + useSettingsCatalogQueryPageSync PASS; ack READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-07.md
spec_ref: po-hrm-settings-w3-f5-list-fe-06.md · UF-SET-W3-A01/B01/B02/B07
```

**pm_dispatch_hint:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-07` (or hotfix same WI) → re-queue `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`
