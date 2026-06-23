# P1-BROWSER-E2E-QC-FINAL-8088 — Combined sponsor nghiệm thu :8088 QC gate

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-QC-FINAL-8088` |
| **role** | qc |
| **executed_at** | 2026-06-20T17:30+07 |
| **portal** | http://14.225.217.232:8088/ |
| **PORTAL_DEV_URL** | http://14.225.217.232:8088/ |
| **qa_evidence_in** | `docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md` · `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r3-20260620.md` · `docs/qa/evidence/p1-hrm-pagesize-crypto-8088-fe-20260620.md` (READY_FOR_QA, R4 pending) |
| **spec_ref** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` Wave 1 + Wave 2 |
| **rule** | U65 zero-seed · browser-only · L2.5 J-* mandatory for in-scope slice |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**NO-GO (full combined sponsor nghiệm thu :8088)** — Track B HRM web **0/11 🟢**; QA R4 **not executed** (dev-fe fix READY_FOR_QA, deploy + browser retest pending). Prior R3 **FAIL_TO_PM** documents all 11 web UF 🔴 with browser U63 blocks.

**GO WITH CONDITIONS (Wave 1 XBOS only)** — Independent audit confirms Track A **15/15 UF-XBOS-01..15 🟢** browser mutate chains per [`p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md`](./p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md).

**NOT Phase 1 DONE** · **NOT full sponsor UAT-ready** until HRM R4 closes Track B.

---

## Classification

| Class | Signal | QC action |
|-------|--------|-----------|
| **PRODUCT PASS (Track A)** | 15/15 UF-XBOS browser U63; L2.5 J-CC-01/02/03 cited PASS | **Promote Wave 1 🟢** |
| **PRODUCT FAIL (Track B)** | HRM R3 0/11 web 🟢; page_size=200→400; routes 404; crypto.randomUUID; member UI login FAIL | **NO-GO full UAT** |
| **PROCESS** | HRM R4 evidence file absent; dev-fe READY_FOR_QA not yet browser-verified on VPS | **Block full GO** — dispatch qa R4 after deploy |
| **ENV** | L0 stack healthy on :8088 (QA + QC spot) | **Accepted** — not blocking Wave 1 |

---

## Command table (QC gate)

| Command | Target | Exit | Result |
|---------|--------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md` | Wave 1 QC close in | **1** | FAIL 3/8 — portal regex + command_table (prior wave; product audit still valid) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-qc-final-8088-20260620.md` | This final pack | **0** | PASS 8/8 (post-write QC verify) |
| `pnpm run qc:dev-stack` | L0 spot (local proxy health) | **0** | PASS hrm-api + xbos-api + portal |
| HRM R4 browser pack | `docs/qa/evidence/p1-browser-e2e-hrm-wave-8088-r4-*.md` | **n/a** | **MISSING** — QA not run |

---

## L0 / L1 / L2 / L2.5

| Layer | Track A (XBOS) | Track B (HRM web) | Evidence |
|-------|----------------|-------------------|----------|
| **L0** | **PASS** | **PASS** embed mount | QA R5/R7 + QC spot `qc:dev-stack` exit **0** |
| **L1** | N/A bounded | N/A bounded | Browser wave scoped U63 |
| **L2** | **PASS** 15 UF CC/settings routes | **FAIL** — lists 0, routes 404 | Wave1 QC close · HRM R3 |
| **L2.5** | **PASS** J-CC-01 login→CC; J-CC-02 holding/member nav; J-CC-03 KPI CC | **FAIL** — J-HRM-01..07 blocked (list 0 / no mutate) | [`PROGRAM_JOURNEY_MAP.md`](../../program/PROGRAM_JOURNEY_MAP.md) |

### L2.5 journey audit

| J-ID | Track | Browser :8088 | QC |
|------|-------|---------------|-----|
| **J-CC-01** | A | **PASS** UF-XBOS-01 login→CC | **🟢** |
| **J-CC-02** | A | **PASS** UF-XBOS-02/05/07 member/holding + RACI | **🟢** |
| **J-CC-03** | A | **PASS** UF-XBOS-10 KPI CC home | **🟢** |
| **J-HRM-01** | B | **FAIL** — employee list 0; page_size=200→400 | **🔴** |
| **J-HRM-02** | B | **FAIL** — list→detail blocked | **🔴** |
| **J-HRM-03** | B | **FAIL** — contracts UI empty | **🔴** |
| **J-HRM-04..07** | B | **FAIL** — no record mutate / shell only | **🔴** |

---

## Track A — UF-XBOS-01..15 (Dev8088 browser)

Audit source: [`p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md`](./p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md) — **15/15 🟢** confirmed; each row has browser mutate + Network 2xx + FE post-mutation (not probe-only).

| UF range | Count 🟢 | QC |
|----------|----------|-----|
| UF-XBOS-01..15 | **15/15** | **PASS** Wave 1 |

---

## Track B — UF-HRM web (Dev8088 browser)

**Latest QA evidence:** R3 [`p1-browser-e2e-hrm-wave-8088-r3-20260620.md`](./p1-browser-e2e-hrm-wave-8088-r3-20260620.md) — **FAIL_TO_PM**, **0/11 web 🟢**.

| UF | R3 verdict | Blocker (PRODUCT) | R4 status |
|----|------------|-------------------|-----------|
| UF-HRM-01 | 🔴 | page_size=200→400 · list 0 | **pending** deploy+retest |
| UF-HRM-02 | 🔴 | contracts UI 0 rows | pending |
| UF-HRM-03 | 🔴 | empty list | pending |
| UF-HRM-04 | 🔴 | insurance 0 rows | pending |
| UF-HRM-05 | 🔴 | no attendance mutate | pending |
| UF-HRM-06 | 🔴 | payroll shell only | pending |
| UF-HRM-07/08 | ⚪ | mobile N/A | — |
| UF-HRM-09 | 🔴 | member UI login no token | pending |
| UF-HRM-10 | 🔴 | route 404 settings-catalogs | pending |
| UF-HRM-11 | 🔴 | route 404 employee-metadata | pending |
| UF-HRM-12 | 🔴 | crypto.randomUUID HTTP | pending |
| UF-HRM-13 | 🔴 | member UI login no token | pending |

**Dev-fe fix:** [`p1-hrm-pagesize-crypto-8088-fe-20260620.md`](./p1-hrm-pagesize-crypto-8088-fe-20260620.md) — **READY_FOR_QA**; **not** promoted until R4 browser PASS on VPS.

**Track B summary:** **0/11 web 🟢** — **FAIL** for full sponsor UAT.

---

## Matrix impact (Dev8088 summary)

| Slice | Dev8088 | QC final |
|-------|---------|----------|
| §3 XBOS UF-XBOS-01..15 | 15/15 🟢 | **Confirmed 🟢** |
| §4 HRM web UF-HRM-01..06, 09..13 | 0/11 🟢 (11 🔴) | **NO-GO carry** until R4 |
| §4 HRM mobile UF-HRM-07/08 | ⚪ | N/A :8088 web |
| **Combined sponsor nghiệm thu** | 15/26 web in-scope | **NO-GO** (need 26/26 🟢) |

Updated in [`USER_FLOW_OPERABILITY_MATRIX.md`](../USER_FLOW_OPERABILITY_MATRIX.md) footer summary.

---

## Residual

| ID | Item | Severity | Owner | Trigger to close |
|----|------|----------|-------|------------------|
| **R-HRM-R4-BLOCK** | HRM R4 not run; 0/11 web 🟢 blocks full UAT | **P0** | pm → devops → qa | Deploy HRM dist + Task `P1-BROWSER-E2E-HRM-WAVE-8088-R4` browser PASS |
| **R-UF15-BATCH-ROW** | UF-XBOS-15 custom field not in batch detail table | P2 | dev-be | Batch row lists stamp OR SRS waiver |
| **R-W1-SCREENSHOT-CARRY** | 7 XBOS UFs lack screenshot path in promoted MD | P2 | qa | Append MCP refs to consolidated index |
| **R-QC-PACK-8088-FORMAT** | Prior wave close pack verify FAIL (regex) | P2 | qa | Pack verify exit **0** on wave MDs |

---

## QC verdict

| Decision | Scope |
|----------|-------|
| **NO-GO** | **Full combined sponsor nghiệm thu web :8088** — Track B **0/11** HRM web 🟢; R4 absent |
| **GO WITH CONDITIONS** | **Wave 1 XBOS only** — UF-XBOS-01..15 **15/15 🟢** @ http://14.225.217.232:8088/ |
| **NOT Phase 1 DONE** | Program gates G4/G5 open; HRM Wave 2 incomplete |
| **NOT sponsor show-all** | PM must not claim UAT-ready for full CC+HRM demo until R4 PASS |

---

## Handoff packet

- **completion_report:** QC audited Track A **15/15 🟢** (Wave 1 XBOS browser confirmed via prior close + cross-check); Track B **0/11 🟢** (R3 FAIL, R4 missing); issued **NO-GO full UAT** + **GWC Wave 1 only**; updated matrix Dev8088 summary row.
- **next_owner:** `pm`
- **next_dispatch_prompt:**

```
Role: pm
work_item_id: P1-BROWSER-E2E-HRM-WAVE-8088-R4-DEPLOY
from_role: qc
to_role: pm
priority: P0
entry_criteria: QC final NO-GO full :8088 — docs/qa/evidence/p1-browser-e2e-qc-final-8088-20260620.md; Wave 1 XBOS GWC 15/15; HRM 0/11; dev-fe READY_FOR_QA docs/qa/evidence/p1-hrm-pagesize-crypto-8088-fe-20260620.md
exit_criteria: PM deploy apps/web/hrm/dist/ to :8088; Task qa P1-BROWSER-E2E-HRM-WAVE-8088-R4 browser U63 11 web UF; on PASS re-dispatch qc P1-BROWSER-E2E-QC-FINAL-8088-R2 for full GO
evidence_path: docs/qa/evidence/p1-browser-e2e-qc-final-8088-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: Do NOT claim full sponsor UAT-ready; Wave 1 XBOS demo approved scoped only
```

- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-qc-final-8088-20260620.md`
- **ack_status:** **PASS_TO_PM**
