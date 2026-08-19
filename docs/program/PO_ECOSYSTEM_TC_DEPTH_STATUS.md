# PO — Ecosystem TC depth status (sponsor rollup)

| Meta | Value |
|------|--------|
| **Updated** | 2026-08-04T01:25+07:00 |
| **Program** | `PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` (U83) + `PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` (U84) |
| **Report** | `docs/qa/reports/PO_SPEC_TEST_REPORT.md` §1.0 + §6–§12.5 |
| **Verdict** | Catalog depth **SYNTHED** · Primary exec **6/7 EVIDENCED** — **not** UAT / Phase1 DONE |

## Cumulative (after U84 SYNTH-WF-CAT)

| Metric | Value |
|--------|------:|
| Menu / matrix packs SYNTHED | **31** |
| Claimed TC rows | **1593** |
| Unique depth TC-IDs | **1473** |
| Spine catalog (execution) | **53** (unchanged) |
| Spine EVIDENCED | **16** (unchanged — not invented) |
| Cross-pack ID collisions | **0** new (neo-maps documented) |

## U84 Primary execution (browser U78 — post VISUN REC-REQ)

| Metric | Value |
|--------|------:|
| Primary AS-IS cells | **7** |
| **EVIDENCED** | **6** |
| **BLOCKED-EXTERNAL** | **1** (P-LEAVE @ CO-DL) |
| **OPEN** | **0** |
| EVIDENCED Primary TC-IDs (HP+AP) | **12** |
| Rollup evidence | `docs/qa/evidence/u84-primary-exec-rollup-01.md` · **R2** `u84-primary-exec-rollup-r2.md` |
| QC honesty | GWC R1 `u84-primary-exec-rollup-qc-01.md` · **GWC R2** `u84-primary-exec-rollup-r2.md` |
| Matrix stamp | `HRM-WF-INSTANCE-MATRIX.md` §2 / §5.2 |

| Cell | Status | Evidence |
|------|--------|----------|
| P-REC-PLAN @ CO-TMDV | EVIDENCED | `u78-u84-primary-rec-plan-tmdv-01.md` |
| P-REC-REQ @ CO-TMDV | EVIDENCED | `u78-u84-primary-rec-req-tmdv-01-r1.md` |
| P-REC-REQ @ CO-VISUN | EVIDENCED | `u78-u84-primary-rec-req-visun-01.md` |
| P-REC-PIPE @ CO-TMDV | EVIDENCED | `u78-u84-primary-rec-pipe-tmdv-01.md` |
| P-LEAVE @ CO-DL | BLOCKED-EXTERNAL | `r-u84-leave-dl-persona-scope-01.md` |
| P-ATT-ADJ @ CO-TMDV | EVIDENCED | `u78-u84-primary-att-adj-tmdv-01-r2.md` |
| P-CAT-EXT @ CO-DL | EVIDENCED | `u78-u84-primary-cat-ext-dl-01.md` |

## Waves closed (design)

| Wave | Content | Evidence |
|------|---------|----------|
| A | Emp · Rec · Att · OrgShare · InboxCat · MobLeave | `po-eco-tc-synth-wave-a-01.md` |
| B | Contracts · Payroll · Decisions · RACI · RBAC · MobHome · MobAtt | `po-eco-tc-synth-wave-b-01.md` |
| B-Δ | Ins · Settings · Perf · KPI · WF · CatalogCC · MobProf · MobSet | `po-eco-tc-synth-wave-b-delta-01.md` |
| C | Dashboard · Login · MobTeam · Guide | `po-eco-tc-synth-wave-c-01.md` |
| C-Δ | Rail stubs · Mob Operations · Mob Journey | `po-eco-tc-synth-wave-c-delta-01.md` |
| **U84** | WF process matrix · CAT-MEMBER · HRM WF instance | `po-eco-tc-synth-wf-cat-01.md` |

## Parallel product gates (not catalog)

| Item | Status |
|------|--------|
| HP-05/06 Contracts+Payroll Vite | **GO** (slice) |
| J-MOB-05 ManagerApprovals R2 | **GWC** |
| MD Settings panel restore | **QA mount PASS** |
| Perf / Decisions / metadata restores | **QA mount PASS** (chain) |
| Company emp-count restore | **QA PASS** (prior) |
| LV-02 leave ladder | **HOLD T_L1** · SPEC_GAP |
| **U84** WF×company×catalog matrix | **SYNTHED** (design) · Primary exec **6/7** |
| MOB-UX-13g device (GWC-13G-01) | **backlog** — catalog SYNTHED |

## Next

- **CLOSED this wave:** `U78-U84-PRIMARY-REC-REQ-VISUN-01` → EVIDENCED (C2) · QC R2 **GWC** `u84-primary-exec-rollup-r2.md`
- **BLOCKED-EXTERNAL:** P-LEAVE @ CO-DL — sponsor bootstrap (≥1 submitter + manager on `finance`) — **cấm** seed for UAT stamp (C1)
- **P2 residual:** `R-U84-REC-REQ-VISUN-HDV-TITLE-PROXY` — no `HDV_*` in job_titles; OPS_MANAGER used
- **GOVERNANCE_LOCK residual (C3):** P-ATT-ADJ XBOS inbox path — keep LOCK; do not invent EVIDENCED on XBOS ATT lane
- **Hygiene (C5):** HIM yaml footer `exec_tally` **ALIGNED** → 6/7 · OPEN 0/7 (PM intake R2)
- Depth pack browser waves = separate U78 (U65)
- **uat_done: false** · **phase1_done: false** explicit (C4)

*Writing TC packs ≠ product UAT DONE. Primary 6/7 EVIDENCED ≠ Phase1 DONE.*
