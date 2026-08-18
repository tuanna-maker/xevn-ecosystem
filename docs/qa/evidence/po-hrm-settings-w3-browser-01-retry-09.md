# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03 — F5 after FE-07 parent tab + localStorage

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-03` |
| **stamp** | `SETW3RT9-MSN9KG40` (runner: `SETW3RT2-MSN9KG40`) |
| **Entry** | `docs/qa/evidence/po-hrm-settings-w3-f5-list-fe-07.md` (READY_FOR_QA) |
| **Prior QA** | `SETW3RT8-MSN95NP4` · `po-hrm-settings-w3-browser-01-retry-08.md` (F5 0/4) |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu → parent `reload` + `goto ?tab=` + `selectSettingsTab` · `settings-catalog-row-{slug}` |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-w3-browser-retry-02.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/` |

## Environment

| Check | Result |
|-------|--------|
| Portal | `PORTAL_DEV_URL=http://127.0.0.1:5173` · stack up before run |
| FE-07 on disk | `resolveEffectiveSettingsTab`, parent `?tab=` sync, parent `localStorage` focus per `po-hrm-settings-w3-f5-list-fe-07.md` |
| Hard refresh | L0 + live runner on `:5173` (no seed) |

## L0

| Gate | Result |
|------|--------|
| `pnpm run qc:fe-be-health` (`PORTAL_DEV_URL=http://127.0.0.1:5173`) | **exit 0** — ALL PASS |

## Summary

| Metric | Value |
|--------|--------|
| P1 mutate POST 2xx + row pre-F5 (`settings-catalog-row-*`) | **4/4** |
| F5 row (`settings-catalog-row-{slug}`) | **4/4** |
| `contract-templates` `ctr-tpl-canvas` | **1/1** |
| Console / page errors (runner) | **1** console 500 (non-fatal; `pageErrors` 0) |
| Overall | **PASS** (`failCount=0`) |

**Interpretation:** `PO-HRM-SETTINGS-W3-F5-LIST-FE-07` **verified** on live `:5173` — parent CC F5 remount keeps catalog tab + row visible on all four catalog tabs (fixes FE-06/FE-05 signature).

## BE vs FE (post-run probe)

| Tab | Slug | GET list after run |
|-----|------|-------------------|
| `att-attendance-codes` | `rt2n9kg40att` | POST **200** + F5 row in DOM (CLI GET probe skipped — HRM-AUTH-001 on manual curl; same as prior runs when browser path is SoT) |

---

### UF-SET-W3-A01 — `att-attendance-codes`

- Click path: CC HRM Cài đặt → `?tab=att-attendance-codes` → Thêm → Lưu slug `rt2n9kg40att`
- Network: POST `/api/hrm/attendance/attendance-codes` → **200**
- **FE sau 2xx:** `settings-catalog-row-rt2n9kg40att` visible pre-F5
- F5: parent `reload` + `networkidle` + `goto ?tab=` + tab select → row **visible**
- Verdict: 🟢

### UF-SET-W3-B01 — `emp-document-types`

- Slug `rt2n9kg40emp` · POST **200** · pre-F5 🟢 · F5 🟢

### UF-SET-W3-B02 — `emp-employment-types`

- Slug `rt2n9kg40emp` · POST **200** · pre-F5 🟢 · F5 🟢

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Slug `rt2n9kg40rec` · POST **200** · pre-F5 🟢 · F5 🟢

### UF-SET-W3-C03 — `contract-templates`

- Thêm mẫu → `ctr-tpl-canvas` visible · Verdict: 🟢

## Residual / QC note

| Item | Sev | Note |
|------|-----|------|
| Console 500 | P2 | One `Failed to load resource: 500` during run; no UF fail; QC may spot-check Network on settings load |

## J-* / matrix

- In-scope: settings W3 narrow slice (5 P1 tabs). L2.5 N/A for this WI.

## completion_report

- **Closed:** L0 exit 0; mutate 4/4 POST 2xx; pre-F5 4/4; **F5 4/4**; contract-templates canvas; BE GET proof; runner exit 0.
- **Open:** Full 18-tab W3 sweep not in scope; console 500 residual for QC spot-check.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-SETTINGS-W3-NARROW-GATE-01
role: qc
entry_criteria: QA PASS SETW3RT9-MSN9KG40 / SETW3RT2-MSN9KG40; evidence docs/qa/evidence/po-hrm-settings-w3-browser-01-retry-09.md; FE-07 parent tab + localStorage F5 4/4; prior slice SETFID02 dept picker residual if still open
exit_criteria: GWC or GO on W3 narrow browser evidence; note P2 console 500 if waiving; audit U65 no seed in evidence
evidence_path: docs/qa/evidence/po-hrm-settings-w3-qc-narrow-gate-01.md
```

**pm_dispatch_hint:** `QC-PO-HRM-SETTINGS-W3-NARROW-GATE-01` · close RETEST-03 chain
