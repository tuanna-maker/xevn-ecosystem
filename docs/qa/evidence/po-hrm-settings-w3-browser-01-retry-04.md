# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03 — F5 list after W3-F5-LIST-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` |
| **stamp** | `SETW3RT4-MSN252HL` |
| **Entry** | `docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-02.md` (READY_FOR_QA) |
| **Prior QA** | `SETW3RT3-MSN1JWGH` · `po-hrm-settings-w3-browser-01-retry-03.md` |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu → F5 · lowercase slug in table |
| **commit** | `dc930c5` (FE-02 sources on disk **untracked** — not in HEAD) |
| **ack_status** | **FAIL_TO_PM** |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs` (machine stamp `SETW3RT2-MSN252HL`) |
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

**Interpretation:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-02` **not verified** — same class as `SETW3RT3-MSN1JWGH` (POST 200 + pre-F5 OK; full reload + `?tab=` only → slug not in DOM). Canvas **PASS**.

---

### UF-SET-W3-A01 — `att-attendance-codes`

- Click path: CC HRM Cài đặt → `?tab=att-attendance-codes` → Thêm → Lưu slug `rt2n252hlatt`
- Network: POST `/api/hrm/attendance/attendance-codes` → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row **missing**
- Verdict: 🔴

### UF-SET-W3-B01 — `emp-document-types`

- Slug `rt2n252hlemp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B02 — `emp-employment-types`

- Slug `rt2n252hlemp` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Slug `rt2n252hlrec` · POST **200** · pre-F5 🟢 · F5 🔴

### UF-SET-W3-C03 — `contract-templates`

- Thêm mẫu → `ctr-tpl-canvas` visible · Verdict: 🟢

## Environment note (traceability)

- `git rev-parse --short HEAD` → `dc930c5`
- FE-02 paths (`useSettingsCatalogFocusPage.ts`, `settingsCatalogPagination.ts`, four catalog panels) are **present on disk but untracked** — portal at `:5173` may still serve them via Vite; sign-off requires committed bundle + reproducible commit after Dev handoff.

## Defects (dispatch dev-fe)

| ID | Sev | Note |
|----|-----|------|
| FE-SET-W3-F5-ROW | P1 | 4 tabs: POST 200, pre-F5 OK, **F5 slug not visible** after FE-02 |
| UF-SET-W3-A01..B07 | P1 | See JSON defects |

## J-* / matrix

- In-scope: settings W3 narrow slice. L2.5 N/A for this WI.

## completion_report

- **Closed:** L0 exit 0; mutate 4/4 POST 2xx + pre-F5; contract-templates canvas.
- **Open:** F5 list visibility **0/4** — **blocker**; cannot `PASS_TO_PM` per exit (requires F5 4/4 + canvas).

## next_owner

`dev-fe`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-W3-F5-LIST-FE-03
role: dev-fe
entry_criteria: QA FAIL SETW3RT4-MSN252HL; evidence po-hrm-settings-w3-browser-01-retry-04.md; POST 200 + pre-F5 4/4; F5 0/4 on :5173; runner reloads parent then goto ?tab= only (no &focus=) — ensure sessionStorage and/or embed URL survive CC full reload
exit_criteria: Commit FE-02+ fixes; after Lưu → parent F5 + same ?tab= → tr/data-testid shows lowercase slug; unit tests settingsCatalogPagination + panel gates PASS; ack READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-03.md
spec_ref: po-hrm-settings-w3-f5-list-fe-02.md · UF-SET-W3-A01/B01/B02/B07
```

**pm_dispatch_hint:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-03` → re-queue `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03`

---

## Append — RETEST-04 (2026-08-10)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-04` |
| **stamp** | `SETW3RT5-MSN2J1C4` (runner `SETW3RT2-MSN2J1C4`) |
| **ack_status** | **FAIL_TO_PM** |
| **F5** | **0/4** · mutate **4/4** · canvas **1/1** |
| **Full evidence** | `docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-05.md` |
