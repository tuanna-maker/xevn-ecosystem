# Evidence — PO-HRM-CTR-CREATE-AUDIT-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-AUDIT-QA-01` |
| **stamp** | **`CTRAUDITQA1-MSMQ0L96`** |
| **ack_status** | **PASS_TO_PM** (audit facts — **cấm** claim UAT / module GO) |
| **audit_overall** | **AS-IS GAPS (no UAT PASS)** · `contracts_printable_ready=false` · C-SLICE |
| **URL** | `http://localhost:5173/command-center/hrm/contracts` (runner `127.0.0.1:5173` equivalent; pilot `:8088` not used) |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-create-audit-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-create-audit-qa-01.json` |
| **commit** | `dc930c5` |
| **dispatch** | `docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md` Task 2 |

## Gates

| Gate | Result |
|------|--------|
| L0 | `pnpm run qc:dev-stack` — hrm-api + xbos-api + portal **HTTP 200** (node UV exit quirk on Windows) |

## Audit matrix (AS-IS)

| Check | Ref BA-01 | Verdict | Ghi chú quan sát (fact) | Screenshot |
|-------|-----------|---------|-------------------------|------------|
| DIALOG-FULL-CC | O1 / TECHSPEC §4.1 | **FAIL** | O1/TECHSPEC §4.1 — dialog 954×687 vs viewport 1440×900 (w=0.663 h=0.764) | `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/01-dialog-cc.png` |
| SO-TEN-HD | O2 / intake AMIS | **PASS** | O2/intake AMIS — Số HĐ trước Tên HĐ: true | `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/02-so-ten-hd.png` |
| NV-PICKER | O3 | **FAIL** | O3 — trigger="3ad58ec2-d480-47e8-b781-91904c561294QA CORE07 PENDING msljspgo — qa_c07p_msljspg" uuid=true searchInput=false placeholder="—" | `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/03-nv-picker.png` |
| MAU-TIEP-TAB2 | O4–O5 | **FAIL** | O4 — không chọn được mẫu active: TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByTestId('ctr-create-template-combob | `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/04-mau-tiep-tab2.png` |
| STEP2-DND | O6–O7 | **BLOCKED** | Bước 2 không mở | `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/05-step2-dnd-go.png` |
| CONSOLE-PANGEA | QA-01 lesson | **PASS** | QA-01 lesson — pangea/DnD errors: 0 storm(s); consoleErrors=0 | `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/06-console-state.png` |

## Console / DnD samples

—

## Screens index

- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/01-dialog-cc.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/02-so-ten-hd.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/03-nv-picker.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/04-mau-tiep-tab2.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/05-step2-dnd-go.png`
- `C:/Users/ADMIN/OneDrive/Tài liệu/Vibe Coding/projects/xevn-ecosystem/docs/qa/evidence/screens/po-hrm-ctr-create-audit-qa-01/06-console-state.png`

**ack_status:** **PASS_TO_PM**
