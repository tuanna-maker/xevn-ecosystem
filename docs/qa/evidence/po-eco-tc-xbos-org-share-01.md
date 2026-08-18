# Evidence — PO-ECO-TC-XBOS-ORG-SHARE-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-XBOS-ORG-SHARE-01` |
| **from_role** | qa |
| **to_role** | qa-synth |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-ORG-SHARE.md` |
| **locks** | U65 (execution not run) · U76 HDSD refs · **cấm** UAT DONE · **cấm** `apps/**` change |

---

## completion_report

- **Closed:** World-standard depth TC pack Wave A domain **XBOS/CC org + shareholders + legal documents + org-units** in single file with screen prefixes **LE-|SHR-|DOC-|OU-**.
- **Inventory source:** `CommandCenterPage.tsx` (list/detail/tabs), `legalEntityFormMapper.ts`, `legalEntityProfileApi.ts`, `orgFoundationApi.ts`, HDSD via UF matrix + journey map.
- **UF coverage:** UF-XBOS-02 · 03 · 04 · 05 · 06 · 12 mapped to functions + ≥1 TC each; J-CC-02 · J-XBOS-03 · J-XBOS-07 cross-check rows.
- **Depth DoD §2:** Screen inventory (12) · field dictionary (44) · function inventory (19) · TC matrix (38, all PLANNED) · trace §5 · automate hints · coverage check filled (0 GAP).
- **Popups:** SHR-POP-CONFIRM · DOC-POP-CONFIRM · LE-POP-PARENT documented; confirm cancel/submit TC included.
- **Residual:** None for catalog. Synth must dedupe TC-ID vs other xbos packs and rollup `docs/qa/reports/PO_SPEC_TEST_REPORT.md` §Ecosystem depth.

---

## spec_read_ack

| Artifact | Path |
|----------|------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` |
| UF matrix §3 | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` (J-CC-02, J-XBOS-03, J-XBOS-07) |
| SRS P0 | `docs/xbos/COMMAND_CENTER_P0_SRS.md` |
| TechSpec P0 | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` |

---

## depth_gate checklist

| Gate | PASS |
|------|------|
| Every mutate popup/confirm in inventory | ☑ |
| Thêm cổ đông / Sửa pháp nhân / Thêm phòng ban / Thêm tài liệu fields in §2 | ☑ |
| TC matrix DoD §2 coverage table | ☑ |
| No browser execution this task | ☑ (catalog) |

---

## counts

| Metric | Value |
|--------|------:|
| screens | 12 |
| fields | 44 |
| functions | 19 |
| test cases | 38 |

---

## next_owner

**qa-synth** (Wave A dedupe + `PO_SPEC_TEST_REPORT` depth section)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-A-01
from_role: pm
to_role: qa

Mission: SYNTH Wave A TC packs — dedupe TC-ID, FK cross-menu (XBOS-ORG-SHARE vs INBOX-CAT), update docs/qa/testcases/README.md + roster pack_path status READY_FOR_SYNTH→SYNTHED, append docs/qa/reports/PO_SPEC_TEST_REPORT.md §Ecosystem depth with XBOS-ORG-SHARE counts (38 TC / 44 fields).

read_first: docs/qa/testcases/xbos/XBOS-ORG-SHARE.md · docs/qa/evidence/po-eco-tc-xbos-org-share-01.md · PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md §3 synth rule.

ack PASS_TO_PM when rollup written. No UAT DONE.
```

---

## policy

- Catalog **PLANNED** only; prior matrix 🟢 UF evidence remains SoT for EVIDENCED UI until U78 run against this pack.
- Holding shareholder: enforce UUID POST path in execution (`UF-XBOS-05`).
