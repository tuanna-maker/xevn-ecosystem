# PO-HRM-SETTINGS-FIDELITY-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-SETTINGS-FIDELITY-QA-02` |
| **stamp** | `SETFID02W3-MSNHB5VD` |
| **spec_ref** | `GOV-HRM-SETTINGS-POST-ATT-SA-01` Option A · `PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01` |
| **Date** | 2026-08-10 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · company `main` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/settings?tab=<id>` |
| **U65** | Zero seed · Thêm → Lưu → row pre-F5 + F5 |
| **commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **Honesty** | `settings_catalog_e2e_ready` **DENY** (not flipped) |
| **Machine JSON** | `docs/qa/evidence/_tmp-po-hrm-settings-fidelity-qa-02-w3p0.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-settings-fidelity-qa-02-w3p0/` |
| **Runner** | `scripts/qa/_tmp-po-hrm-settings-fidelity-qa-02-w3p0.mjs` |

## L0

| Gate | Result |
|------|--------|
| `pnpm run qc:dev-stack` | hrm+xbos+portal **200** (Windows UV exit quirk on script end) |
| `pnpm run qc:fe-be-health` | **exit 0** — ALL PASS |

## Summary

| W3 P0 mutate tabs | 🟢 8 | 🔴 0 |
| ATTLVTSOTQC1 smoke | 🟢 |

### UF-SET-W3-A01 — `att-attendance-codes`

- **spec_ref:** FR-HRM-SC-ATT · F-ATT-CAT-CODE
- Persona / URL: `?tab=att-attendance-codes`
- Action: Thêm → Lưu
- Slug/keys: `w3nhb5vdatt`
- Network: /api/hrm/attendance/attendance-codes → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row persists after F5
- Verdict: 🟢

### UF-SET-W3-A02 — `att-ot-types`

- **spec_ref:** FR-HRM-SC-ATT · F-ATT-OT-TYPE
- Persona / URL: `?tab=att-ot-types`
- Action: Thêm → Lưu
- Slug/keys: `w3nhb5vdatt`
- Network: /api/hrm/attendance/ot-types → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row persists after F5
- Verdict: 🟢

### UF-SET-W3-A03 — `att-ot-comp-types`

- **spec_ref:** FR-HRM-SC-ATT · F-ATT-OT-COMP
- Persona / URL: `?tab=att-ot-comp-types`
- Action: Thêm → Lưu
- Slug/keys: `w3nhb5vdatt`
- Network: /api/hrm/attendance/ot-comp-types → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row persists after F5
- Verdict: 🟢

### UF-SET-W3-B01 — `emp-document-types`

- **spec_ref:** FR-HRM-SC-EMP-DOC
- Persona / URL: `?tab=emp-document-types`
- Action: Thêm → Lưu
- Slug/keys: `w3nhb5vdemp`
- Network: /api/hrm/employees/document-types → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row persists after F5
- Verdict: 🟢

### UF-SET-W3-B02 — `emp-employment-types`

- **spec_ref:** FR-HRM-SC-ET
- Persona / URL: `?tab=emp-employment-types`
- Action: Thêm → Lưu
- Slug/keys: `w3nhb5vdemp`
- Network: /api/hrm/employees/employment-types → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row persists after F5
- Verdict: 🟢

### UF-SET-W3-B04 — `si-insurance-types`

- **spec_ref:** FR-HRM-SC-SI · insurance-types
- Persona / URL: `?tab=si-insurance-types`
- Action: Thêm → Lưu
- Slug/keys: `w3nhb5vdsii`
- Network: /api/hrm/contracts-insurance/insurance-types → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row persists after F5
- Verdict: 🟢

### UF-SET-W3-B05 — `si-insurers`

- **spec_ref:** FR-HRM-SC-SI · insurers
- Persona / URL: `?tab=si-insurers`
- Action: Thêm → Lưu
- Slug/keys: `w3nhb5vdsii`
- Network: /api/hrm/contracts-insurance/insurers → **200**
- **FE sau 2xx:** row visible pre-F5
- F5: row persists after F5
- Verdict: 🟢

### UF-SET-W3-B03 — `emp-employment-statuses`

- **spec_ref:** FR-HRM-SC-EMP-ST-STR
- Persona / URL: `?tab=emp-employment-statuses`
- Action: Thêm trạng thái / Thêm lý do (dialog) → Lưu
- Slug/keys: `qa_st_nhb5vd + qa_str_nhb5vd`
- Network: ST 200 pre=true f5=true · STR 200 pre=true f5=true
- **FE sau 2xx:** ST/STR dialog mutate
- F5: ST f5=true STR f5=true
- Verdict: 🟢

### UF-ATT-LVT-SMOKE

- **spec_ref:** ATTLVTSOTQC1-MSNGQC01 sealed — no reopen
- Result: REF MD: MD banner=true noSave=true · catalogs ref banner=true · extension POSTs=0 · Effective: GET leave-types/effective → 200
- Verdict: 🟢

## completion_report

- **Closed:** All 8 W3 P0 settings tabs (`PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01`) — U65 Thêm→Lưu **2xx**, row **pre-F5** + **F5** on portal `:5173` / `ceo@xe.vn` / `main`. EMP ST+STR via dialog shells. ATTLVTSOT regression smoke (MD REF + catalogs REF + `leave-types/effective` **200**). **`settings_catalog_e2e_ready` not flipped** (DENY).
- **Residual:** Full 18-tab W3 sweep · prior SETFID dept/JD legs not re-run this dispatch (narrow W3 P0 only).
- **Note:** First runner attempt FAIL on B03/LVT was **harness** (command-center iframe vs `/hr/settings?portal=1` + EMP dialog UX); product path PASS on stamp `SETFID02W3-MSNHB5VD`.

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: QC-PO-HRM-SETTINGS-W3-MUTATE-GATE-01
role: qc
entry_criteria: PO-HRM-SETTINGS-FIDELITY-QA-02 PASS stamp SETFID02W3-MSNHB5VD; evidence docs/qa/evidence/po-hrm-settings-fidelity-qa-02.md; dev-fe PO-HRM-SETTINGS-W3-MUTATE-FIX-FE-01; L0 qc:fe-be-health exit 0
exit_criteria: GWC C-SLICE — audit 8 UF blocks + UF-ATT-LVT-SMOKE; DENY settings_catalog_e2e_ready flip; RETAIN ATTLVTSOTQC1-MSNGQC01; U65 no seed in evidence
evidence_path: docs/qa/evidence/qc-po-hrm-settings-w3-mutate-gate-01.md
```

**ack_status:** **PASS_TO_PM**