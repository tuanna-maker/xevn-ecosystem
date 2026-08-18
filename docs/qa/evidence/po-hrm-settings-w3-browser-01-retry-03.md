# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03 — F5 list after W3-F5-LIST-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` |
| **stamp** | `SETW3RT3-MSN1JWGH` |
| **Entry** | `docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-01.md` (READY_FOR_QA) |
| **Prior QA** | `SETW3RT2-MSMYZN13` · `po-hrm-settings-w3-browser-01-retry-02.md` |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu → F5 · lowercase slug in table |
| **commit** | `dc930c5` |
| **ack_status** | **FAIL_TO_PM** |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs` (runner stamp `SETW3RT2-MSN1JWGH`) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/` |

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
| Overall | **FAIL** |

**Interpretation:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-01` (pagination focus + stable sort) **not verified** on running portal at `dc930c5` — same symptom class as `SETW3RT2-MSMYZN13` (pre-F5 OK, full reload + same tab → slug not in DOM). Contract-templates canvas remains **PASS**.

---

### UF-SET-W3-A01 — `att-attendance-codes`

- Click path: CC HRM Cài đặt → `?tab=att-attendance-codes` → Thêm → Lưu slug `rt2n1jwghatt`
- Network: POST `/api/hrm/attendance/attendance-codes` → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row **missing**
- Verdict: 🔴

### UF-SET-W3-B01 — `emp-document-types`

- Slug `rt2n1jwghemp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B02 — `emp-employment-types`

- Slug `rt2n1jwghemp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Slug `rt2n1jwghrec` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-C03 — `contract-templates`

- Thêm mẫu → `ctr-tpl-canvas` visible · Verdict: 🟢

## Defects (dispatch dev-fe)

| ID | Sev | Note |
|----|-----|------|
| FE-SET-W3-F5-ROW | P1 | 4 catalog tabs: POST 200, row pre-F5, **F5 slug not visible** — `rememberFocusForReload` / focus page not effective in CC embed reload path or dev bundle stale |
| UF-SET-W3-A01..B07 | P1 | See JSON defects |

## J-* / matrix

- In-scope: settings W3 narrow slice (not full 18-tab). L2.5 N/A for this WI.

## completion_report

- **Closed:** L0; mutate 4/4; contract-templates canvas.
- **Open:** F5 list visibility 0/4 after claimed `po-hrm-settings-w3-f5-list-fe-01` fix — **blocker for RETEST-03 sign-off**.

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-W3-F5-LIST-FE-02
role: dev-fe
entry_criteria: QA FAIL SETW3RT3-MSN1JWGH; evidence po-hrm-settings-w3-browser-01-retry-03.md; POST 200 + pre-F5 OK on 4 tabs; F5 0/4 at commit dc930c5 on :5173
exit_criteria: After Lưu → reload + ?tab= same → data-testid or tr contains lowercase slug; verify useSettingsCatalogFocusPage runs on iframe remount; restart dev:web if needed; unit tests settingsCatalogPagination + panel gates still PASS
evidence_path: docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-02.md
ack_status: READY_FOR_QA
spec_ref: po-hrm-settings-w3-f5-list-fe-01.md · UF-SET-W3-A01/B01/B02/B07
```

**pm_dispatch_hint:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-02` → re-queue `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`
