# Evidence — PO-ECO-TC-XBOS-RACI-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-XBOS-RACI-01` |
| **from_role** | qa |
| **to_role** | qa-synth |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-RACI.md` |
| **locks** | U65 (execution not run) · U76 HDSD refs · **cấm** UAT DONE · **cấm** `apps/**` change |

---

## completion_report

- **Closed:** World-standard depth TC pack **XBOS-RACI** — member unit tab **Nhiệm vụ & RACI** (`CompanyRaciPanel`) + deep link **`?settings=raci`** + read-only **Chuẩn RACI** under `?settings=permission` (UF-13 split).
- **Cell lifecycle:** Documented **RACI-FN-CELL-EDIT** · **CELL-SAVE** (debounce 600ms + blur PUT) · **CELL-CANCEL** (revert/no-op before persist) · **CELL-NOOP** — with dedicated TC rows (HP-010..014, FD-013/014, UX-002).
- **Field depth:** All **17** `RACI_ORG_COLUMNS` matrix cell fields (`RACI-FLD-CELL-*`) + filters + coverage stats + catalog/cap/bind fields + SET-RACI reference columns.
- **UF / spec:** **UF-XBOS-07** · FR-XBOS-RACI-02 · UC-RACI-01..04 · AC-UF-XBOS-07 · prior 🟢 evidence `p1-browser-e2e-xbos-r5-8088-20260620.md` cited as EVIDENCED baseline (BDH-001×HĐQT).
- **Depth DoD §2:** Screen inventory (10) · field dictionary (51) · function inventory (13) · TC matrix (32, PLANNED) · trace §5 · coverage check 0 GAP.
- **Residual:** None for catalog. Synth dedupe vs `XBOS-ORG-SHARE.md` LE-TAB-RACI inventory-only rows; update roster + `PO_SPEC_TEST_REPORT` §Ecosystem depth.

---

## spec_read_ack

| Artifact | Path |
|----------|------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` |
| UF matrix §3 | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` (UF-XBOS-07) |
| SRS trace | `docs/qa/USER_FLOW_SRS_TRACE_DELTA.md` |
| TechSpec RACI | `docs/xbos/TECHSPEC.md` §14.14 |
| FE panel | `CompanyRaciPanel.tsx` (read-only inventory) |
| FE CC | `CommandCenterPage.tsx` tab + permission RACI table |
| Deep link | `commandCenterUrl.ts` `SETTINGS_MENU_ALIASES.raci` |

---

## depth_gate checklist

| Gate | PASS |
|------|------|
| Every mutate function (cell save, bind) has HP + FD | ☑ |
| Cell edit / save / cancel each ≥1 TC | ☑ |
| All 17 matrix column fields in §2.3 | ☑ |
| `settings=raci` deep link TC | ☑ |
| No browser execution this task | ☑ (catalog) |
| No `apps/**` edits | ☑ |

---

## counts

| Metric | Value |
|--------|------:|
| screens | 10 |
| fields | 51 |
| functions | 13 |
| test cases | 32 |

---

## next_owner

**qa-synth** (Wave B dedupe + roster status + report rollup)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-B-01
from_role: pm
to_role: qa

Mission: SYNTH Wave B TC packs — include docs/qa/testcases/xbos/XBOS-RACI.md (32 TC / 51 fields / 13 fn). Dedupe TC-ID vs XBOS-ORG-SHARE (LE-TAB-RACI OOS lines). Update docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md XBOS-RACI status PLANNED→READY_FOR_SYNTH→SYNTHED. Append docs/qa/reports/PO_SPEC_TEST_REPORT.md §Ecosystem depth.

read_first: docs/qa/testcases/xbos/XBOS-RACI.md · docs/qa/evidence/po-eco-tc-xbos-raci-01.md · PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md §3 synth rule.

ack PASS_TO_PM when rollup written. No UAT DONE. Browser execution of TC-RACI-HP-010 remains separate U78 wave (U65).
```

---

## policy

- Catalog **PLANNED** only; matrix 🟢 UF-07 browser evidence remains SoT for EVIDENCED until U78 run maps TC-ID to test-log.
- **U65:** Execution precond = FE path only; no seed for matrix cells.
- **UF-XBOS-13:** Permission checkbox matrix out of scope except SET-RACI-REF view + AU-001 split check.
