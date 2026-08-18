# Evidence — PO-ECO-TC-XBOS-KPI-RAIL-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-XBOS-KPI-RAIL-01` |
| **from_role** | qa |
| **to_role** | qa-synth |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-CC-HOME-KPI.md` |
| **locks** | U65 (execution not run) · U76 HDSD refs · **cấm** UAT DONE · **cấm** `apps/**` change |

---

## completion_report

- **Closed:** World-standard depth TC pack **CC Home / KPI widgets / rail GROUP** for UF-XBOS-01 · UF-XBOS-10 with **member-scope negative pointers** to UF-XBOS-11 (TC-AU-PTR-001..003 — no full duplicate member matrix).
- **Inventory source:** `CommandCenterPage.tsx` (widgets + Action Cards + persona header) · `CommandCenterModuleRail.tsx` · `command-center-rail-catalog.ts` (7 modules) · `useCommandCenterKpiRail.ts` · `kpiEngineApi.ts` · `commandCenterScope.ts`.
- **Widgets inventoried:** Việc cần xử lý (counts + module chips) · Chỉ số KPI tập đoàn (headline % + Sparkline + strict banners) · Cảnh báo hệ thống · Action Cards filter bar + inbox rows + drawer entry.
- **Depth DoD §2:** Screen inventory (12) · field dictionary (38) · function inventory (16) · TC matrix (36, all PLANNED) · trace §5 · unit automate hints (KPI mapper + hook) · coverage check GAP=0.
- **Residual:** No browser/U78 run this task. Synth dedupe TC-ID vs `XBOS-ORG-SHARE` / future INBOX pack. Rollup `PO_SPEC_TEST_REPORT.md` §Ecosystem depth. Prior matrix 🟢 UF-XBOS-01/10/11 remains EVIDENCED SoT until execution against this pack.

---

## spec_read_ack

| Artifact | Path |
|----------|------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` |
| UF matrix §3 | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` (UF-XBOS-01 · 10 · 11) |
| Journey | `docs/program/PROGRAM_JOURNEY_MAP.md` (J-CC-01 · J-CC-03) |
| SRS P0 | `docs/xbos/COMMAND_CENTER_P0_SRS.md` (UC-CC-P0-08 · UC-CC-P0-09) |
| Scope ADR | `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` |

---

## depth_gate checklist

| Gate | PASS |
|------|------|
| Rail GROUP + 6 sibling modules in inventory | ☑ |
| All 3 home widgets + filter chips + inbox card fields in §2 | ☑ |
| KPI rollup API + empty/error/strict paths in TC | ☑ |
| UF-XBOS-11 pointer rows (not full exec here) | ☑ |
| TC matrix DoD §2 coverage table | ☑ |
| No browser execution this task | ☑ (catalog) |

---

## counts

| Metric | Value |
|--------|------:|
| screens | 12 |
| fields | 38 |
| functions | 16 |
| test cases | 36 |

---

## next_owner

**qa-synth** (Wave A dedupe + `PO_SPEC_TEST_REPORT` depth section)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-A-01
from_role: pm
to_role: qa

Mission: SYNTH Wave A TC packs — dedupe TC-ID across XBOS-CC-HOME-KPI (36 TC) + XBOS-ORG-SHARE (38 TC) + other READY_FOR_SYNTH xbos packs; update docs/qa/testcases/README.md roster; append docs/qa/reports/PO_SPEC_TEST_REPORT.md §Ecosystem depth with XBOS-CC-HOME-KPI counts (12 screens / 38 fields / 16 fn).

read_first: docs/qa/testcases/xbos/XBOS-CC-HOME-KPI.md · docs/qa/evidence/po-eco-tc-xbos-kpi-rail-01.md · PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md §3 synth rule.

ack PASS_TO_PM when rollup written. No UAT DONE.
```

---

## policy

- Catalog **PLANNED** only; execution uses U65 FE path when promoted from synth.
- Member CEO negatives: run **TC-AU-PTR-001/002** under UF-XBOS-11 persona matrix, not Group CEO sign-off.
- L2 PASS without J-CC-03 KPI Network check remains **FAIL** per business-flow gate — this pack supplies TC-J-HP-002 for future U78.
