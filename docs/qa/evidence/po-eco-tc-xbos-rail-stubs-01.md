# Evidence — PO-ECO-TC-XBOS-RAIL-STUBS-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-XBOS-RAIL-STUBS-01` |
| **from_role** | qa |
| **to_role** | qa-synth |
| **date** | 2026-08-03 |
| **ack_status** | **READY_FOR_SYNTH** |
| **pack_path** | `docs/qa/testcases/xbos/XBOS-RAIL-STUBS.md` |
| **locks** | U65 (execution not run) · U76 HDSD refs (legacy OOS) · **cấm** UAT DONE · **cấm** `apps/**` change |

---

## completion_report

- **Closed:** World-standard **STUB/OOS honest** depth pack for CC left-rail modules **outside GROUP/KPI** (Wave C roster §A.5): **Finance · Accounting · Business · Fleet** (inbox-filter stubs on shared home workspace), **HRM-link** (embed entry + xref `hrm-web/*`), **System** (settings nav inventory + xref XBOS leaf packs), plus **legacy catalog `href`** OOS pages (`/dashboard/customers`, `/dashboard/organization`, `/dashboard/kpi-dashboard`, `/dashboard/cockpit`).
- **Inventory source (read-only):** `command-center-rail-catalog.ts` · `CommandCenterModuleRail.tsx` (onClick → `commandCenterModuleUrl` / `hrmPortalPath`, **not** catalog `href`) · `CommandCenterPage.tsx` (`filteredCards` · `?module=` · settings sidebar keys) · `commandCenterUrl.ts` · `CustomersPage.tsx` · `OrganizationPage.tsx` · App routes for legacy dashboard.
- **STUB honesty documented:** Selecting finance/accounting/business/fleet **does not** mount dedicated module workspaces; KPI widget remains group-scoped (TC-RST-UX-001).
- **Dedupe:** GROUP home widgets / KPI / full Action Cards matrix remain in `XBOS-CC-HOME-KPI.md`; synth cross-ref TC-RST-PTR-003/004 vs `TC-RAIL-HP-004` / `TC-KPI-*`.
- **Depth DoD §2:** Screen inventory (17) · field dictionary (45) · function inventory (14) · TC matrix (28, all PLANNED) · trace §5 · STUB/OOS table §0.1.
- **Residual:** No browser/U78 run. Legacy dashboard pages exist for direct URL/HDSD but are **OOS** from rail click until Phase-2 module workspaces. Asset-requests settings leaf still roster PLANNED pack. Member CEO rail disabled patterns not expanded (xref UF-XBOS-11).

---

## spec_read_ack

| Artifact | Path |
|----------|------|
| Depth program | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` |
| Roster Wave C | `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` §A.5 |
| Template | `docs/qa/testcases/_TEMPLATE_MENU_TC_PACK.md` |
| Sibling pack | `docs/qa/testcases/xbos/XBOS-CC-HOME-KPI.md` |
| UF matrix | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3 UF-XBOS-01 |
| HDSD legacy | `docs/client-delivery/hdsd/xbos/HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` |

---

## depth_gate checklist

| Gate | PASS |
|------|------|
| STUB/OOS classification table (§0.1) | ☑ |
| All 4 stub rails + HRM-link + System nav inventoried | ☑ |
| Legacy href vs runtime navigation OOS TCs | ☑ |
| Fields for visible rail labels, chips, system menus | ☑ |
| Dedupe pointers to CC-HOME-KPI + HRM/XBOS settings packs | ☑ |
| No browser execution / no UAT DONE claim | ☑ |

---

## counts

| Metric | Value |
|--------|------:|
| screens | 17 |
| fields | 45 |
| functions | 14 |
| test cases | 28 |
| STUB rails | 4 (finance, accounting, business, fleet) |
| LINK | 1 (hrm) |
| Settings nav keys | 13 |

---

## next_owner

**qa-synth** (Wave C dedupe + roster status + `PO_SPEC_TEST_REPORT` depth rollup)

---

## next_dispatch_prompt

```text
work_item_id: PO-ECO-TC-SYNTH-WAVE-C-RAIL-STUBS-01
from_role: pm
to_role: qa

Mission: SYNTH ingest PO-ECO-TC-XBOS-RAIL-STUBS-01 — dedupe TC-RST-* vs XBOS-CC-HOME-KPI (TC-RAIL-HP-004 business, TC-RAIL-HP-003 system nav); mark roster §A.5 XBOS-RAIL-* rows READY_FOR_SYNTH→SYNTHED; append docs/qa/reports/PO_SPEC_TEST_REPORT.md depth line (+28 TC, 17 screens); update docs/qa/testcases/README.md index.

read_first: docs/qa/testcases/xbos/XBOS-RAIL-STUBS.md · docs/qa/evidence/po-eco-tc-xbos-rail-stubs-01.md · docs/qa/evidence/po-eco-tc-synth-wave-c-01.md

exit: PASS_TO_PM with collision report (0 duplicate TC-ID). No UAT DONE.
```

---

## policy

- Catalog **PLANNED** only; execution uses U65 FE path when promoted.
- **L2 PASS** on stub rail = inbox filter + URL `?module=` + honest empty — **not** legacy dashboard mount.
- System rail leaf mutate TCs remain owned by existing XBOS packs (ORG, WF, RBAC, INBOX-CAT, CATALOG-CC).
