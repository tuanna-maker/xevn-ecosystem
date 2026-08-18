# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03 — F5 after FE-04 query-page sync

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` |
| **stamp** | `SETW3RT6-MSN2VJGX` (runner: `SETW3RT2-MSN2VJGX`) |
| **Entry** | `docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-04.md` (READY_FOR_QA) |
| **Prior QA** | `SETW3RT5-MSN2J1C4` · `po-hrm-settings-w3-browser-01-retry-05.md` |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu → parent F5 · lowercase slug in table |
| **commit** | `dc930c5` (FE-03/FE-04 paths **untracked** on disk — `useSettingsCatalogQueryPageSync.ts`, four panels) |
| **ack_status** | **FAIL_TO_PM** |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/` |

## Environment

| Check | Result |
|-------|--------|
| Dev restart | **Yes** — stopped prior `dev:web-only` (pid 25012), fresh `pnpm run dev:web-only` until `PORTAL_READY` |
| FE-04 on disk | `useSettingsCatalogQueryPageSync` + four panels import hook (vitest per FE-04 handoff) |

## L0

| Gate | Result |
|------|--------|
| `pnpm run qc:fe-be-health` (`PORTAL_DEV_URL=http://127.0.0.1:5173`) | **exit 0** — ALL PASS |

## Summary

| Metric | Value |
|--------|--------|
| P1 mutate POST 2xx + row pre-F5 | **4/4** |
| F5 row (lowercase slug) | **0/4** |
| `contract-templates` `ctr-tpl-canvas` | **1/1** |
| Overall | **FAIL** (exit criteria requires F5 **4/4**) |

**Interpretation:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-04` **not verified** in browser. Mount `q`/`setPage(1)` race fix insufficient or another F5 path still drops focused row from DOM.

## BE vs FE (post-run probe)

| Tab | Slug | GET list after run |
|-----|------|-------------------|
| `att-attendance-codes` | `rt2n2vjgxatt` | **Present** in `GET /api/hrm/attendance/attendance-codes?company_id=main` (`data.data[]`, `code=rt2n2vjgxatt`) |

→ Data on server; F5 DOM miss = **FE pagination/focus** (not BE scope).

---

### UF-SET-W3-A01 — `att-attendance-codes`

- Click path: CC HRM Cài đặt → `?tab=att-attendance-codes` → Thêm → Lưu slug `rt2n2vjgxatt`
- Network: POST `/api/hrm/attendance/attendance-codes` → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: parent `reload` + `?tab=` only → row **missing**
- Verdict: 🔴

### UF-SET-W3-B01 — `emp-document-types`

- Slug `rt2n2vjgxemp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B02 — `emp-employment-types`

- Slug `rt2n2vjgxemp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Slug `rt2n2vjgxrec` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-C03 — `contract-templates`

- Thêm mẫu → `ctr-tpl-canvas` visible · Verdict: 🟢

## Defects

| ID | Sev | Note |
|----|-----|------|
| FE-SET-W3-F5-ROW | P1 | 4 tabs: POST 200, pre-F5 OK, F5 0/4 after FE-04 + dev restart; GET contains slug |
| UF-SET-W3-A01..B07 | P1 | See JSON defects |

## J-* / matrix

- In-scope: settings W3 narrow slice. L2.5 N/A for this WI.

## completion_report

- **Closed:** L0 exit 0 after **full dev:web-only restart** on `:5173`; mutate 4/4 POST 2xx + pre-F5; contract-templates canvas; BE GET proof slug in list.
- **Open:** F5 list visibility **0/4** — **no PASS_TO_PM** (requires F5 4/4).

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-W3-F5-LIST-FE-05
role: dev-fe
entry_criteria: QA FAIL SETW3RT6-MSN2VJGX / SETW3RT2-MSN2VJGX; evidence po-hrm-settings-w3-browser-01-retry-06.md; POST 200 + pre-F5 4/4; F5 0/4 after FE-04 useSettingsCatalogQueryPageSync + dev restart; GET :28001 includes slug (rt2n2vjgxatt); FE-04 files still untracked at dc930c5
exit_criteria: Parent F5 + ?tab= only → row visible (4 catalog tabs); debug useSettingsCatalogFocusPage + localStorage + page index after reload; commit FE files; vitest useSettingsCatalogQueryPageSync + SettingsCatalogF5ListPanels PASS; ack READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-05.md
spec_ref: po-hrm-settings-w3-f5-list-fe-04.md · UF-SET-W3-A01/B01/B02/B07
```

**pm_dispatch_hint:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-05` → re-queue `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`
