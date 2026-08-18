# QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST — HRM Settings W3 browser U65

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST` |
| **stamp** | `SETW3QA-MSMY9E1A` |
| **Prior blocked run** | `SETW3QA-MSMXZ8Q9` — `ERR_CONNECTION_REFUSED` :5173 (not hung agent) |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu from FE · F5 observe |
| **Handoff** | `PO-HRM-SETTINGS-FIDELITY-PROGRAM-WAVE-01` Wave 0 |
| **commit** | `dc930c5` |
| **ack_status** | **FAIL_TO_PM** |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-qa-01.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-01/` |

## L0 (pre-browser)

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | **PASS** — hrm-api :28001, xbos-api :28002, portal :5173 HTTP 200 (Node Windows exit `3221226505` UV quirk; checks OK) |
| `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS (proxy + direct HRM routes) |
| Portal | Sponsor stack already on `:5173` (`dev:web-only`) — no restart needed |

## Summary

| Metric | Value |
|--------|--------|
| Tabs exercised | 18 |
| UF 🟢 | 13 |
| UF 🔴 | 5 |
| Console critical | none |
| Density `settings-page` | all tabs visible · `noSafeInline: true` (MUST_KEEP density retained) |

**Residual (honesty):** Runner marks 🟢 when row visible **pre-F5** even if F5 row missing — 9 tabs showed `row missing after F5` on 🟢 verdicts. Treat as **P2 FE list/cache or pagination** until manual F5 PASS on sponsor slice; not waived this retest.

---

### UF-SET-W3-REF — Loại phép (`att-leave-types`)

- Persona / URL / click path: `ceo@xe.vn` → CC HRM Cài đặt → Loại phép · `?tab=att-leave-types`
- Trước mutate: catalog shell `settings-att-leave-types` loaded
- Action: Thêm mới → nhập mã/tên → Lưu (`QMY9E1AATT`)
- Network: POST `/api/hrm/attendance/leave-types` → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row **not** seen after reload (runner quirk — see Residual)
- Verdict: 🟢 (mutate path OK) · F5 hold P2
- spec_ref: `PO-HRM-SETTINGS-W3-UX-DENSITY-CONTINUOUS-01` · CAT-A FE evidence
- Owner: —

### UF-SET-W3-A01 — Mã chấm công (`att-attendance-codes`)

- Persona / URL: `?tab=att-attendance-codes`
- Action: Thêm → Lưu (`QMY9E1AATT`) · expects `hdsd-att-attendance-code-counts-as` select-in-dialog
- Network: **no POST/PUT captured**
- **FE sau 2xx:** row not seen · dialog/save likely blocked (counts-as?)
- F5: row missing
- Verdict: 🔴
- spec_ref: CAT-A · select portal AC
- **Owner: dev-fe** (P1)

### UF-SET-W3-A02 — Loại OT (`att-ot-types`)

- Network: POST `/api/hrm/attendance/ot-types` → **200**
- **FE sau 2xx:** row pre-F5 OK
- F5: row missing (P2 residual)
- Verdict: 🟢

### UF-SET-W3-A03 — Loại bù OT (`att-ot-comp-types`)

- Network: POST `/api/hrm/attendance/ot-comp-types` → **200**
- **FE sau 2xx:** row pre-F5 OK
- F5: row missing (P2 residual)
- Verdict: 🟢

### UF-SET-W3-B01 — Loại hồ sơ NV (`emp-document-types`)

- Network: **no mutation captured**
- **FE sau 2xx:** fail
- Verdict: 🔴
- **Owner: dev-fe** (P1)

### UF-SET-W3-B02 — Loại hình lao động (`emp-employment-types`)

- Network: **no mutation captured**
- Verdict: 🔴
- **Owner: dev-fe** (P1)

### UF-SET-W3-B03 — Trạng thái lao động (`emp-employment-statuses`)

- Network: POST `/api/hrm/employees/employment-statuses` → **200**
- Verdict: 🟢 · F5 hold P2

### UF-SET-W3-B04 — Loại bảo hiểm (`si-insurance-types`)

- Network: POST `/api/hrm/contracts-insurance/insurance-types` → **200**
- Verdict: 🟢 · F5 hold P2

### UF-SET-W3-B05 — Đơn vị BHXH (`si-insurers`)

- Network: POST `/api/hrm/contracts-insurance/insurers` → **200**
- Verdict: 🟢 · F5 hold P2

### UF-SET-W3-B06 — Loại quyết định (`dec-decision-types`)

- Network: POST `/api/hrm/decisions/decision-types` → **200**
- Verdict: 🟢 · F5 hold P2

### UF-SET-W3-B07 — Giai đoạn tuyển dụng (`rec-pipeline-stages`)

- Network: **no mutation captured**
- Verdict: 🔴
- **Owner: dev-fe** (P1)

### UF-SET-W3-W1 — Điều khoản HĐ (`contract-clauses`)

- Action: smoke · shell `settings-contract-clauses`
- Verdict: 🟢

### UF-SET-W3-C01 — Merge token (`merge-tokens`)

- Network: POST `/api/hrm/merge-tokens` → **200**
- Verdict: 🟢 · F5 hold P2

### UF-SET-W3-C02 — Mẫu phiếu lương (`pay-sheet-tpl`)

- Network: POST `/api/hrm/payroll/pay-sheet-templates` → **201**
- Verdict: 🟢 · F5 hold P2

### UF-SET-W3-C03 — Mẫu hợp đồng (`contract-templates`)

- Action: Thêm mẫu → expect `ctr-tpl-canvas` in dialog
- **FE sau 2xx:** `canvasVisible: false` · verdict FAIL
- Verdict: 🔴
- spec_ref: Wave 1 `PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01` · PAT-CTR-TEMPLATE-COMPOSER-01
- **Owner: dev-fe** (P1)

### UF-SET-W3-E01 — Tài khoản (`account`)

- Action: compact card smoke · `cards=1`
- Verdict: 🟢

### UF-SET-W3-E02 — Thông báo (`notifications`)

- `cards=1`
- Verdict: 🟢

### UF-SET-W3-E03 — Bảo mật (`security`)

- `cards=2`
- Verdict: 🟢

---

## Defect register (dispatch)

| ID | Tab | Sev | Owner | Note |
|----|-----|-----|-------|------|
| SETW3-A01 | att-attendance-codes | P1 | dev-fe | Save không fire POST; kiểm tra counts-as select + validation |
| SETW3-B01 | emp-document-types | P1 | dev-fe | No mutation response |
| SETW3-B02 | emp-employment-types | P1 | dev-fe | No mutation response |
| SETW3-B07 | rec-pipeline-stages | P1 | dev-fe | No mutation response |
| SETW3-C03 | contract-templates | P1 | dev-fe | DnD canvas không hiện sau Thêm (composer-in-dialog wave) |
| SETW3-F5-RES | multiple 🟢 tabs | P2 | dev-fe | Row không thấy sau F5 dù POST 2xx — list invalidation/pagination |

## Dialog Select portal

`selectPortal` probe: **{}** — counts-as on A01 not exercised (blocked before save).

## Console (filtered)

```
(none critical)
```

## completion_report

- **Closed:** L0 unblock (5173 up); full 18-tab W3 browser sweep U65; prior RUNNER refusal cleared.
- **Open:** 5 UF 🔴 (4 catalog mutate + contract-templates DnD); P2 F5 persistence on 9 tabs.

## next_owner

`pm` → dispatch **dev-fe** fixes; after fix **qa** narrow retest FAIL tabs; **qc** blocked until FAIL tabs 🟢.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01
role: dev-fe
entry_criteria: QA SETW3QA-MSMY9E1A FAIL tabs att-attendance-codes, emp-document-types, emp-employment-types, rec-pipeline-stages, contract-templates
exit_criteria: Each tab Thêm→Lưu POST 2xx + row visible; contract-templates Thêm shows ctr-tpl-canvas; optional P2 F5 row visible after reload
allowed_paths: apps/web/hrm/src/components/settings/* for failing panels + contract template panel
spec_ref: PO-HRM-SETTINGS-FIDELITY-PROGRAM-WAVE-01 · PO-HRM-CTR-TPL-DIALOG-COMPOSER-FE-01
evidence_path: docs/qa/evidence/po-hrm-settings-w3-browser-01-retry.md
```

**pm_dispatch_hint:** `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` (dev-fe) then `QA-PO-HRM-SETTINGS-W3-BROWSER-01-RETEST-02` (qa narrow)
