# Evidence — PO-ECO-TC-SYNTH-WF-CAT-01

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-ECO-TC-SYNTH-WF-CAT-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **mode** | Design-only SYNTH (U84) — **no browser** · **no seed** · **no apps/** · **uat_done=false** |
| **Doctrine** | `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md` — catalog ≠ UAT |

---

## 1. completion_report

**Closed**

- Ingested **3 U84 matrix packs** READY_FOR_SYNTH → **SYNTHED**:
  1. `XBOS-WF-PROCESS-MATRIX.md` — **20** TC (`TC-WFM-*`)
  2. `XBOS-CAT-MEMBER-MATRIX.md` — **36** TC (`TC-XCM-*`; stub `XBOS-CATALOG-MEMBER-MATRIX.md`)
  3. `HRM-WF-INSTANCE-MATRIX.md` — **43** TC (`TC-HIM-*`)
- **Cross-pack TC-ID collisions (U84 owned IDs as table primary in >1 pack):** **0**
- Neo-map §3: `TC-WFM-*` × `TC-XCM-*` × `TC-HIM-*` × `TC-XIC-*` / `TC-WFD-*` / `TC-MOB-LV-*` / `TC-SET-*`
- SA lock applied: **5 LOCK_CODE → GOVERNANCE_LOCK**; **4 SPEC_GAP** stay inventory/BLOCKED; P-LEAVE L2/`T_L1` SPEC_GAP; P-ATT-ADJ HRM OK / XBOS inbox **BLOCKED**
- Roster U84 rows → **SYNTHED**; `PO_SPEC_TEST_REPORT.md` **§12 APPEND** (§6–§11 preserved); `PO_ECOSYSTEM_TC_DEPTH_STATUS.md` refreshed
- Primary cells from company matrix §2 **preserved** (7 INST + AP XREF)

**Residual (non-blocking for synth PASS)**

| ID | Item | Owner hint |
|----|------|------------|
| P-ATT-ADJ bridge | XBOS inbox / constants not product | later `dev-be` bridge wave |
| P-LEAVE L2 / `T_L1` | SPEC_GAP · HOLD sponsor | `C-LEAVE-DEV-UNLOCK-01` |
| P-OT · P-TRAIN · P-DISCIPLINE · P-PAY-EX | SPEC_GAP inventory — no spawn TC | sponsor CR / GĐ1 |
| U78 browser | Depth packs still PLANNED | PM → qa browser Primary cell |
| Author vs grep | Claimed **99** · table-unique owned **98** (−1) | same class prior waves |

---

## 2. Collision scan

### 2.1 Method

- Regex: `^\| (TC-(WFM|XCM|HIM)-…) \|` on U84 packs + same for all `docs/qa/testcases/**/*.md` (excl. template/README/roster).
- Spine `PO_SPEC_TEST_CASE_CATALOG.md` — **53** primary — unchanged; **0** U84 ID equals spine string.
- XREF pointers (`TC-XIC-*`, `TC-WFD-*`, `TC-MOB-LV-*`, `TC-SET-*`, `TC-REC-*`) are **intentional** cross-pack references — not duplicate ownership.

### 2.2 Results

| Result | Count |
|--------|------:|
| U84 packs SYNTHED | **3** |
| Claimed TC rows (author footers) | **99** (20+36+43) |
| Unique U84 table-primary IDs | **98** |
| U84 ID as table primary in non-owning pack | **0** |
| New duplicate TC-ID collisions | **0** |
| Intentional XREF-only pointers | documented §3 |

### 2.3 Namespaces (disjoint ownership)

| Prefix | Pack SoT | Collision |
|--------|----------|-----------|
| `TC-WFM-*` | XBOS-WF-PROCESS-MATRIX | **0** vs WFD/XIC |
| `TC-XCM-*` | XBOS-CAT-MEMBER-MATRIX | **0** vs CCC/SET/XIC |
| `TC-HIM-*` | HRM-WF-INSTANCE-MATRIX | **0** vs REC/ATT/MOB |

---

## 3. Neo-map (cross-pack XREF)

| Edge / process | Def @ HOLD (`TC-WFM`) | Catalog apply (`TC-XCM`) | Instance (`TC-HIM`) | Approve / chrome XREF |
|----------------|----------------------|--------------------------|---------------------|------------------------|
| P-REC-PLAN | TC-WFM-REC-PLAN-HP-001 | — (consume job_titles) | TC-HIM-REC-PLAN-TMDV-HP-001 | TC-XIC-WF-HP-002/003 · TC-REC-* |
| P-REC-REQ | TC-WFM-REC-REQ-HP-001 | — | TC-HIM-REC-REQ-TMDV/VISUN-*-HP-001 | TC-XIC-WF-HP-003 · TC-WFD-CRT-* |
| P-REC-PIPE | TC-WFM-REC-PIPE-HP-001 | — | TC-HIM-REC-PIPE-TMDV-HP-001 | TC-XIC-WF-HP-002/003 · TC-WFD-GRF-* |
| P-LEAVE | TC-WFM-LEAVE-HP-001 | leave_types PUB/AP/HRM | TC-HIM-LEAVE-DL-HP-001 | TC-MOB-LV-* · TC-XIC-WF-HP-004 |
| P-LEAVE L2 / T_L1 | TC-WFM-LEAVE-FD-001 | — | TC-HIM-LEAVE-DL-SG-L2-001 | **SPEC_GAP** · TC-ATT-LV-BLK-* |
| P-ATT-ADJ | TC-WFM-ATT-HP-001 **GOVERNANCE_LOCK** | — | TC-HIM-ATT-TMDV-HP/AP-001 (HRM OK) | **TC-XIC BLOCKED** until bridge · TC-HIM-ATT-TMDV-SG-WF-001 |
| P-CAT-EXT | TC-WFM-CAT-HP-001 | TC-XCM-EXT-XREF-001/002 | TC-HIM-CAT-DL-HP-001 · HOLD-AP | TC-XIC-EXT-HP-001 → TC-XIC-CG-HP-001 |
| Catalog P0 keys | — | TC-XCM-PUB-* → AP-* → HRM-* | spot consume | TC-XCM-XREF-SET-001 → TC-SET-* · TC-XCM-XREF-CC-001 → TC-CCC-* |
| Designer chrome | XREF only | — | — | **XBOS-WF-DESIGNER** `TC-WFD-*` |
| LOCK_CODE office | TC-WFM-SG-INV-P-{CONTRACT,PROBATION,TRANSFER,EXIT} | — | TC-HIM-SG-*-VN-001 | **GOVERNANCE_LOCK** — no spawn |
| SPEC_GAP | TC-WFM-SG-INV-P-{OT,TRAIN,DISCIPLINE,PAY-EX} | — | TC-HIM-SG-OT/TRAIN/DISCIPLINE/PAYEX | **BLOCKED** inventory |

**Dedupe rule:** Execute approve chrome once via **INBOX-CAT** / **MOB-LEAVE-APPR**; matrix packs own process×company / catalog_key rows only.

---

## 4. LOCK_CODE vs SPEC_GAP handling

| `process_id` | SA decision | Synth tag | TC posture |
|--------------|-------------|-----------|------------|
| P-ATT-ADJ | LOCK_CODE | **GOVERNANCE_LOCK** | WFM create-def PLANNED/BLOCKED exec · HIM HRM path OK · XBOS inbox BLOCKED |
| P-CONTRACT · P-PROBATION · P-TRANSFER · P-EXIT | LOCK_CODE | **GOVERNANCE_LOCK** | SG inventory only — names from lock; **no** product constants claim |
| P-OT · P-TRAIN · P-DISCIPLINE · P-PAY-EX | SPEC_GAP | **SPEC_GAP** | Inventory/BLOCKED — **cấm** draft-name spawn assert |
| P-LEAVE identity | AS-IS_CODE | AS-IS | Keep `hrm_leave_approval` |
| P-LEAVE L2 / T_L1 | SPEC_GAP_BEHAVIOR | **SPEC_GAP** | TC-HIM-LEAVE-DL-SG-L2-001 · no ladder PASS |

---

## 5. Primary cell coverage preserved

| process_id | Primary co_key | INST | AP XREF | Status |
|------------|----------------|------|---------|--------|
| P-REC-PLAN | CO-TMDV | TC-HIM-REC-PLAN-TMDV-HP-001 | TC-XIC-WF-* | preserved |
| P-REC-REQ | CO-TMDV + CO-VISUN | 2× HP | TC-XIC-WF-HP-003 | preserved |
| P-REC-PIPE | CO-TMDV | HP | TC-XIC-WF-* | preserved |
| P-LEAVE | CO-DL | HP | MOB-LV / XIC-004 | L1 only; L2 SPEC_GAP |
| P-ATT-ADJ | CO-TMDV | HP | HRM/MOB Mgr | XBOS inbox BLOCKED |
| P-CAT-EXT | CO-DL → HOLD | HP + HOLD-AP | XIC-EXT/CG | preserved |

Spot ≥1 / company (§6 HIM): CO-HOLD · TMDV · VISUN · DL · VN — preserved.

---

## 6. Cumulative depth after U84 ingest

| Metric | U84 | Prior (C-DELTA) | **Total** |
|--------|----:|----------------:|----------:|
| Menu / matrix writer packs | **3** | 28 | **31** |
| TC matrix rows (claimed) | **99** | 1494 | **1593** |
| Globally unique depth TC-IDs | **+98** net | 1375 | **1473** |
| Cross-pack ID collisions (new) | **0** | 9 documented neo-maps | **9** unchanged |
| Spine catalog (execution) | — | 53 | **53** unchanged |
| Spine EVIDENCED | — | 16 | **16** — **not invented** |

All U84 TC status: **PLANNED** / **SPEC_GAP** / **GOVERNANCE_LOCK** inventory — **uat_done: false**.

---

## 7. Artifacts touched

| Path | Action |
|------|--------|
| `docs/qa/testcases/xbos/XBOS-WF-PROCESS-MATRIX.md` | SYNTHED · LOCK/SPEC_GAP §6 table |
| `docs/qa/testcases/xbos/XBOS-CAT-MEMBER-MATRIX.md` | SYNTHED |
| `docs/qa/testcases/hrm-web/HRM-WF-INSTANCE-MATRIX.md` | SYNTHED · LOCK/SPEC_GAP §7 |
| `docs/qa/testcases/roster/ECOSYSTEM_MENU_ROSTER.md` | U84 rows + header counts |
| `docs/qa/reports/PO_SPEC_TEST_REPORT.md` | §1 refresh · **§12 APPEND** |
| `docs/program/PO_ECOSYSTEM_TC_DEPTH_STATUS.md` | cumulative refresh |
| `docs/program/AGENT_MESSAGE_BUS.md` | qa → pm PASS_TO_PM |

---

## 8. Handoff

```
completion_report: U84 3 packs SYNTHED; 0 ID collisions; neo-map WFM×XCM×HIM×XIC/WFD/MOB-LV/SET; LOCK×5 GOVERNANCE_LOCK; SPEC_GAP×4 kept; claimed 1593 / unique 1473 / packs 31; uat_done false
next_owner: pm
next_dispatch_prompt: (see §9)
evidence_path: docs/qa/evidence/po-eco-tc-synth-wf-cat-01.md
ack_status: PASS_TO_PM
uat_done: false
```

## 9. next_dispatch_prompt

```text
work_item_id: U78-U84-PRIMARY-LEAVE-DL-01
from_role: pm
to_role: qa
lane: execution
ack_status_target: PASS_TO_PM
change_mode: ADD
u65_zero_seed: true
test_log_required: true

MISSION: Browser U78 on ONE Primary cell — P-LEAVE @ CO-DL L1 only
(TC-HIM-LEAVE-DL-HP-001 → TC-HIM-LEAVE-DL-AP-001 via MOB Mgr or TC-XIC-WF-HP-004).
Precond def: TC-WFM-LEAVE-HP-001 or AS-IS bridge present from FE (no seed).
CẤM: claim L2/T_L1 · seed inbox · invent EVIDENCED for whole U84 matrix.
ALT if device stack up: GWC-13G-01 MOB-UX-13g device (catalog already SYNTHED) — not more stubs.
evidence_path: docs/qa/evidence/u78-u84-primary-leave-dl-01.md
```

---

*PO-ECO-TC-SYNTH-WF-CAT-01 · qa · 2026-08-03*
