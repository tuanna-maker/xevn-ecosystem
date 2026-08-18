# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-02 — Narrow 5 P1 tabs

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-02` |
| **stamp** | `SETW3RT2-MSN9KG40` |
| **Prior fix** | `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` · prior QA `SETW3QA-MSMY9E1A` |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu · F5 row by **lowercase slug** |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-retry-02.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-retry-02/` |

## L0 (pre-browser)

| Gate | Result |
|------|--------|
| `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |

## Summary

| Metric | Value |
|--------|--------|
| Tabs in scope | 5 |
| 🟢 | 5 |
| 🔴 | 0 |

### UF-SET-W3-A01 — `att-attendance-codes`

- Persona / URL: `?tab=att-attendance-codes`
- Action: Thêm → Lưu (slug=rt2n9kg40att)
- Slug assert: `rt2n9kg40att` (lowercase)
- Network: /api/hrm/attendance/attendance-codes → **200**
- **FE sau 2xx:** row visible pre-F5 (lowercase slug)
- F5: row visible after F5
- Verdict: 🟢
- spec_ref: `po-hrm-settings-w3-mutate-fix-fe-01.md` · PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01

### UF-SET-W3-B01 — `emp-document-types`

- Persona / URL: `?tab=emp-document-types`
- Action: Thêm → Lưu (slug=rt2n9kg40emp)
- Slug assert: `rt2n9kg40emp` (lowercase)
- Network: /api/hrm/employees/document-types → **200**
- **FE sau 2xx:** row visible pre-F5 (lowercase slug)
- F5: row visible after F5
- Verdict: 🟢
- spec_ref: `po-hrm-settings-w3-mutate-fix-fe-01.md` · PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01

### UF-SET-W3-B02 — `emp-employment-types`

- Persona / URL: `?tab=emp-employment-types`
- Action: Thêm → Lưu (slug=rt2n9kg40emp)
- Slug assert: `rt2n9kg40emp` (lowercase)
- Network: /api/hrm/employees/employment-types → **200**
- **FE sau 2xx:** row visible pre-F5 (lowercase slug)
- F5: row visible after F5
- Verdict: 🟢
- spec_ref: `po-hrm-settings-w3-mutate-fix-fe-01.md` · PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Persona / URL: `?tab=rec-pipeline-stages`
- Action: Thêm → Lưu (slug=rt2n9kg40rec)
- Slug assert: `rt2n9kg40rec` (lowercase)
- Network: /api/hrm/recruitment/pipeline-stages → **200**
- **FE sau 2xx:** row visible pre-F5 (lowercase slug)
- F5: row visible after F5
- Verdict: 🟢
- spec_ref: `po-hrm-settings-w3-mutate-fix-fe-01.md` · PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01

### UF-SET-W3-C03 — `contract-templates`

- Persona / URL: `?tab=contract-templates`
- Action: Thêm mẫu → ctr-tpl-canvas visible (iframe dialog portal)
- Slug assert: `n/a` (lowercase)
- Network: —
- **FE sau 2xx:** canvas visible
- F5: —
- Verdict: 🟢
- spec_ref: `po-hrm-settings-w3-mutate-fix-fe-01.md` · PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01

## completion_report

- **Closed:** P1 mutate on 5 tabs + contract-templates canvas after FE-01 fix.
- **Residual:** Full 18-tab W3 sweep not re-run (narrow scope).

## next_owner

`qc` — GWC slice PO-HRM-SETTINGS-FIDELITY W3

**pm_dispatch_hint:** QC-PO-HRM-SETTINGS-W3-NARROW-GATE-01