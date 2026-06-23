# P1-BROWSER-E2E-XBOS-WAVE-8088-QC-CLOSE — Wave 1 XBOS browser QC gate

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-XBOS-WAVE-8088-QC-CLOSE` |
| **role** | qc |
| **executed_at** | 2026-06-20T16:00+07 |
| **portal** | http://14.225.217.232:8088/ |
| **PORTAL_DEV_URL** | http://14.225.217.232:8088/ |
| **qa_evidence_in** | `docs/qa/evidence/p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md` · `docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md` §Wave1–§R7-FINAL |
| **spec_ref** | `docs/qa/P1_BROWSER_E2E_XBOS_HRM_WAVE.md` Wave 1 |
| **rule** | U65 zero-seed · browser-only · reject probe-only 🟢 |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**GO WITH CONDITIONS (scoped Wave 1 XBOS @ :8088)** — Independent QC audit confirms **15/15 UF-XBOS-01..15** have browser mutate chains with **FE post-mutation + Network 2xx** (not probe-only). R7-FINAL closes UF-09/15; UI label gates G1–G3 **PASS** on VPS. **NOT Phase 1 DONE** — HRM Wave 2 Track B runs separately (0/11 web 🟢 per §HRM-W2-R2).

**Verdict class:** PRODUCT **PASS** for Wave 1 XBOS slice · PROCESS **carry** (evidence-pack verify regex + screenshot paths on 7 UFs).

---

## Classification

| Class | Signal | QC action |
|-------|--------|-----------|
| **PRODUCT** | 15/15 browser U63 blocks; UF-14 scope 409 closed; UF-09 approve 201 live | **Promote Wave 1 🟢** |
| **PRODUCT P2** | R-UF15-BATCH-ROW — custom field not listed in governance batch detail table | **Carry dev-be** |
| **PROCESS P2** | `verify:qc:evidence-pack` FAIL (portal :8088 IP + command_table regex) | **Carry qa** — does not block product promote |
| **ENV** | Local `qc:dev-stack` exit **0** (127.0.0.1); QA cites VPS L0 exit **0** on :8088 | **Accepted** — stack healthy |

---

## Command table (QC spot)

| Command | Target | Exit | Result |
|---------|--------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md` | R7-FINAL pack | **1** | FAIL 3/8 — missing command_table, portal_url regex, journey_l25 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-browser-e2e-xbos-hrm-20260620.md` | Consolidated wave | **1** | FAIL 2/8 — command_table, portal_url regex |
| `pnpm run qc:dev-stack` | Local L0 spot | **0** | PASS hrm-api + xbos-api + portal 5173 |

---

## L0 / L1 / L2 / L2.5

| Layer | Criterion | Result | Evidence |
|-------|-----------|--------|----------|
| **L0** | Stack health | **PASS** | QA R5 `qc:dev-stack` exit **0** on :8088; QC local spot exit **0** |
| **L1** | API UAT spot | **N/A bounded** | Wave scoped browser U63; no full `test:system:uat` re-run this gate |
| **L2** | CC/XBOS settings routes load | **PASS** | 15 UF browser sessions on `:8088` without persistent ERROR banner (UF-14 409 closed R5) |
| **L2.5** | J-* cross-nav | **PASS (cited)** | J-CC-01 login→CC (UF-01); J-CC-02 member/holding nav + RACI (UF-02/05/07); J-CC-03 KPI CC home (UF-10) — [`PROGRAM_JOURNEY_MAP.md`](../../program/PROGRAM_JOURNEY_MAP.md) |

---

## §3 audit — UF-XBOS-01..15 browser evidence (Dev8088)

Audit rule: each row must cite **browser** block with **FE post-mutation**; **screenshot** column notes gap if absent in final promoted section.

| UF | Final evidence § | Browser | Network 2xx | FE post-mutation | F5 | Screenshot | QC |
|----|------------------|---------|-------------|------------------|-----|------------|-----|
| **UF-01** | Wave1 §UF-01 | ✅ UI login | redirect CC | CC shell mount | session persist | ✅ MCP page-02-47 | **🟢** |
| **UF-02** | Wave1 §UF-02 | ✅ list click | GET implicit | detail heading | list reload | ✅ MCP page-02-48 | **🟢** |
| **UF-03** | Wave1 §UF-03 | ✅ Lưu | PUT **200** | toast + row | list persist | ✅ MCP page-02-49 | **🟢** |
| **UF-04** | §R3 F5 | ✅ Submit | POST **201** carry | row in form | **PASS** SHR | ✅ MCP page-03-17 | **🟢** |
| **UF-05** | final2 cross-ref | ✅ holding ✓ | POST **201** SHR | row in table | same-day deploy | ✅ [L25 final2](./p1-qa-8088-l25-cc-rail-20260620.md) | **🟢** |
| **UF-06** | §R3 F5 | ✅ doc Submit | POST **201** carry | doc input visible | **PASS** doc | ⚠️ no path in §R3 | **🟢** |
| **UF-07** | §R5 UF-07 | ✅ cell blur | PUT **200** matrix/cell | cell **R** | **PASS** sticky R | ⚠️ [R5 detail](./p1-browser-e2e-xbos-r5-8088-20260620.md) no screenshot | **🟢** |
| **UF-08** | [R5 detail](./p1-browser-e2e-xbos-r5-8088-20260620.md) | ✅ WF→Duyệt | POST def **201** + complete **201** | counter **14→13** | **PASS** 0 pending | ⚠️ no screenshot | **🟢** |
| **UF-09** | [R7-FINAL](./p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md) | ✅ Phê duyệt | POST approve **201** CAT | inbox **99→98** | **PASS** (98) | ⚠️ no screenshot | **🟢** |
| **UF-10** | §R2 + R7 label | ✅ CC home | no 409 banner | KPI/Task widgets (labels 🟢 R7) | carry | ✅ MCP page-03-09 | **🟢** |
| **UF-11** | §R2 negative | ✅ fetch scope | **403** + **409** KPI | member blocked rollup | n/a negative | ✅ MCP page-03-12 | **🟢** |
| **UF-12** | §R4 | ✅ ✓ Lưu dòng | POST **201** org-units | toast + row | **PASS** dept | ⚠️ no screenshot | **🟢** |
| **UF-13** | §R3 | ✅ checkbox | PUT **200** rbac | checked | **PASS** true | ✅ MCP page-03-24 | **🟢** |
| **UF-14** | [retest](./p1-qa-uf14-8088-retest-20260620.md) | ✅ autosave | GET **200** + PUT **200** | version cell | **PASS** v1.0-r5-10064 | ⚠️ no screenshot | **🟢** |
| **UF-15** | [R7-FINAL](./p1-browser-e2e-uf09-uf15-8088-r7-final-20260620.md) | ✅ extension→approve | HRM-SET **201** + CAT **201** | field label in dialog | **PASS** label | ⚠️ no screenshot | **🟢** |

**Probe-only rejection:** No row promoted on API/probe alone — all 🟢 rows trace to MCP browser sessions R1–R7-FINAL.

**UI label gate (R7-FINAL re-verify):** G1 CC widgets Vietnamese ✅ · G2 no Seed dev ✅ · G3 **Quản trị danh mục** ✅ — supersedes prior §3 label FAIL on UF-01/10.

---

## Matrix impact (Dev8088 §3)

| UF | Prior matrix | QC promote |
|----|--------------|------------|
| UF-XBOS-01 | 🔴 label FAIL | **🟢** — R7-FINAL label gate |
| UF-XBOS-02..09, 11..15 | 🟢 | **🟢** confirmed |
| UF-XBOS-10 | 🔴 label FAIL | **🟢** — R7-FINAL label gate + R2 KPI load |

Updated in [`USER_FLOW_OPERABILITY_MATRIX.md`](../USER_FLOW_OPERABILITY_MATRIX.md) §3.

---

## Residual (max 3 P2 — bounded)

| ID | Item | Severity | Owner | Trigger to close |
|----|------|----------|-------|------------------|
| **R-UF15-BATCH-ROW** | Custom extension stamp `QA-R7-UF15-806520` not listed in governance batch detail rows (5 standard work_fields only); F5 dialog read-back OK | P2 | dev-be | Batch detail lists custom stamp OR SRS waives with AC |
| **R-W1-SCREENSHOT-CARRY** | UF-06/07/08/09/12/14/15 final promoted evidence blocks lack persisted screenshot path in MD | P2 | qa | Append MCP screenshot refs to consolidated §3 index |
| **R-QC-PACK-8088-FORMAT** | `verify:qc:evidence-pack` FAIL — script regex misses `:8088` IP portal + consolidated pack lacks command_table section | P2 | qa + platform | Pack verify exit **0** on wave closeout MD |

**Explicitly NOT blocking Wave 1 GO:** HRM Wave 2 Track B (parallel program).

---

## QC verdict

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | **Wave 1 XBOS UF-XBOS-01..15 @ http://14.225.217.232:8088/** — sponsor browser nghiệm thu Wave 1 **APPROVED** |
| **NOT Phase 1 DONE** | HRM Wave 2 0/11 web 🟢; program gates G4/G5 open |
| **NOT HRM Wave 2 GO** | Out of scope this work_item |

---

## Handoff packet

- **completion_report:** QC audited 15/15 UF browser blocks; promoted Dev8088 §3 **15/15 🟢**; closed UF-01/10 label 🔴 via R7-FINAL; issued **GO WITH CONDITIONS** with 3 bounded P2 residuals; HRM Wave 2 not gated.
- **next_owner:** `pm`
- **next_dispatch_prompt:**

```
Role: pm
work_item_id: P1-BROWSER-E2E-HRM-WAVE-8088-R3-INTAKE
from_role: qc
to_role: pm
priority: P0
entry_criteria: QC GO WITH CONDITIONS Wave 1 XBOS — docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md; 15/15 UF-XBOS Dev8088 🟢; 3 P2 carry (batch row, screenshot, pack format); NOT Phase 1 DONE
exit_criteria: PM intake Wave 1 closure on bus; dispatch qa HRM Wave 2 retest (parallel Track B) per P1_BROWSER_E2E_XBOS_HRM_WAVE.md; optional dev-be R-UF15-BATCH-ROW if sprint capacity
evidence_path: docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: Wave 1 XBOS CLOSED scoped — do not block HRM Wave 2 on Wave 1 carry P2
```

- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-xbos-wave-8088-qc-close-20260620.md`
- **ack_status:** **PASS_TO_PM**
