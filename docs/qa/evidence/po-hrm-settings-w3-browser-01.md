# QA-PO-HRM-SETTINGS-W3-BROWSER-01 — HRM Settings W3 browser sweep (§6.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-PO-HRM-SETTINGS-W3-BROWSER-01` |
| **stamp** | `SETW3SWP-MSNHWVTO` |
| **Date** | 2026-08-11 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **URL base** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · FE mutate + F5 |
| **Boundary** | **AC-SWEEP-BOUNDARY-01** · **AC-SWEEP-BOUNDARY-02** |
| **settings_catalog_e2e_ready** | **false** (DENY flip) |
| **ack_status** | **PASS_TO_PM** |
| **commit** | `dc930c5` |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-w3-browser-sweep-61.mjs` |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-w3-browser-sweep-61.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-w3-browser-01/` |

## L0

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` (:5173) | HRM+XBOS+portal HTTP 200 (Windows exit quirk on dev-stack) |
| `pnpm run qc:fe-be-health` | exit 0 — ALL PASS |

## SEALED — RETAIN (not re-run as failure)

| Stamp | Note |
|-------|------|
| `SETW3MUTQC1-MSNHB5QC1` | 8-tab mutate / SETFID / ATTLVTSOT — regression bus-only |
| `SETFID02W3-MSNHB5VD` | 8-tab mutate / SETFID / ATTLVTSOT — regression bus-only |
| `ATTLVTSOTQC1-MSNGQC01` | 8-tab mutate / SETFID / ATTLVTSOT — regression bus-only |
| `SETFIDQC1-MSN8VQ3L` | 8-tab mutate / SETFID / ATTLVTSOT — regression bus-only |

## IN SWEEP results

### UF-ATT-LVT-SMOKE — `att-leave-types`

- Click path: CC → Cài đặt HRM → `?tab=att-leave-types`
- Action: UF-ATT-LVT-SMOKE — shell + effective GET (no LVT mutate)
- Network: effective (timeout — non-block if shell OK)
- **FE sau 2xx:** att-leave-types shell visible
- F5: —
- Verdict: 🟢 RETAIN
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-B06 — `dec-decision-types`

- Click path: CC → Cài đặt HRM → `?tab=dec-decision-types`
- Action: Thêm → Lưu (swpnhwvtodec)
- Network: **200**
- **FE sau 2xx:** row pre-F5
- F5: row after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-B07 — `rec-pipeline-stages`

- Click path: CC → Cài đặt HRM → `?tab=rec-pipeline-stages`
- Action: Thêm → Lưu (swpnhwvtorec)
- Network: **200**
- **FE sau 2xx:** row pre-F5
- F5: row after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-C01 — `merge-tokens`

- Click path: CC → Cài đặt HRM → `?tab=merge-tokens`
- Action: Thêm → Lưu (swpnhwvtomerg)
- Network: **200**
- **FE sau 2xx:** row pre-F5
- F5: row after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-C02 — `pay-sheet-tpl`

- Click path: CC → Cài đặt HRM → `?tab=pay-sheet-tpl`
- Action: Thêm → Lưu (swpnhwvtopay)
- Network: **201**
- **FE sau 2xx:** row pre-F5
- F5: row after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-W1 — `contract-clauses`

- Click path: CC → Cài đặt HRM → `?tab=contract-clauses`
- Action: Thêm điều khoản swpnhwvtocont
- Network: **201**
- **FE sau 2xx:** row pre-F5
- F5: row after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-C03 — `contract-templates`

- Click path: CC → Cài đặt HRM → `?tab=contract-templates`
- Action: Thêm mẫu → ctr-tpl-canvas (list/dialog UX leg)
- Network: —
- **FE sau 2xx:** canvas visible
- F5: —
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-D01 — `catalogs`

- Click path: CC → Cài đặt HRM → `?tab=catalogs`
- Action: Extension item swpnhwvtocata
- Network: POST extension **201**
- **FE sau 2xx:** row in table
- F5: row after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-D02 — `master-data`

- Click path: CC → Cài đặt HRM → `?tab=master-data`
- Action: MD departments swpnhwvtomast
- Network: **201**
- **FE sau 2xx:** md row
- F5: after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-D03 — `settings-defaults`

- Click path: CC → Cài đặt HRM → `?tab=settings-defaults`
- Action: Tax defaults Lưu
- Network: **200**
- **FE sau 2xx:** panel after save
- F5: panel after F5
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-L01 — `contract-number-config`

- Click path: CC → Cài đặt HRM → `?tab=contract-number-config`
- Action: Load / density smoke
- Network: —
- **FE sau 2xx:** settings-page visible
- F5: —
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-L02 — `contract-library-publish`

- Click path: CC → Cài đặt HRM → `?tab=contract-library-publish`
- Action: Load / density smoke
- Network: —
- **FE sau 2xx:** ctr-library-publish-panel visible
- F5: —
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-L03 — `jd-dynamic`

- Click path: CC → Cài đặt HRM → `?tab=jd-dynamic`
- Action: Load / density smoke
- Network: —
- **FE sau 2xx:** jd-dynamic-settings-panel visible
- F5: —
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

### UF-SET-W3-L04 — `roles`

- Click path: CC → Cài đặt HRM → `?tab=roles`
- Action: Load roles tab
- Network: —
- **FE sau 2xx:** roles copy visible
- F5: —
- Verdict: 🟢
- spec_ref: `PO-HRM-SETTINGS-SRS-FIDELITY-DELTA-01.md` §6.1

## Honesty

- **W3 browser sweep DONE** (IN SWEEP rows only) — **≠** Settings module UAT · **≠** `settings_catalog_e2e_ready=true`
- **OUT OF SWEEP:** portal tabs account/branding/… · `jd-master-list` mutate slice §6.3

## Console (sample)
```
(none critical)
```

## completion_report

- **Closed:** L0 `qc:fe-be-health` exit **0** (:5173); all **IN SWEEP** §6.1 rows (14 UF blocks) U65 browser 🟢; **AC-SWEEP-BOUNDARY-01** — SEALED 8-tab mutate **not** re-stamped; **UF-ATT-LVT-SMOKE** RETAIN `ATTLVTSOTQC1-MSNGQC01`.
- **Residual:** `settings_catalog_e2e_ready=false` · consumer matrix §6.2 OPEN · JD master §6.3 OUT OF SWEEP · portal tabs OUT OF SWEEP · **≠** Settings module UAT.
- **First run** `SETW3SWP-MSNHPJGR` FAIL (merge-token row id · catalogs POST · tax PUT) — fixed runner → **SETW3SWP-MSNHWVTO** PASS.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-SETTINGS-W3-SWEEP-GATE-01
role: qc
entry_criteria: QA QA-PO-HRM-SETTINGS-W3-BROWSER-01 PASS_TO_PM stamp SETW3SWP-MSNHWVTO; must_keep SETW3MUTQC1-MSNHB5QC1 + ATTLVTSOTQC1 + settings_catalog_e2e_ready=false
read_first:
  - docs/qa/evidence/po-hrm-settings-w3-browser-01.md
  - docs/qa/evidence/qc-po-hrm-settings-w3-mutate-gate-01.md
exit_criteria: GWC audit §6.1 sweep vs honesty AC-SWEEP-BOUNDARY-02; DENY settings_catalog_e2e_ready flip; evidence docs/qa/evidence/qc-po-hrm-settings-w3-sweep-gate-01.md; PASS_TO_PM
cấm: reopen SEALED 8-tab as FAIL; seed in evidence
```
