# P1-TODAY-GOV-TA — Technical Auditor gap plan (U18 Phase 1 EOD)

| Field | Value |
|-------|--------|
| **work_item_id** | P1-TODAY-GOV-TA |
| **date** | 2026-05-24 (ICT) |
| **owner** | Technical Manager (TA lane) |
| **deadline** | **2026-05-24T23:59:59+07:00** (U18) |
| **scope** | Path **31/245 → G1–G9** by EOD; UC `e2e_pass` vs `waived`; Dev+QA hour blocks |
| **evidence reviewed** | `PHASE1_COMPLETION_PLAN.md`, `PHASE1_GATE_REPORT.md`, `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` (regen), `phase1-impl-status.json`, `p1-s5-qa-01-20260524.md`, `p1-s5-qc-01-20260524.md`, `p1-s5-be-wave-final-20260524.md`, `p1-s2-tm-01-review-20260524.md`, `PHASE1_TODAY_EXECUTION_PLAN.md` |

---

## 1. Executive technical assessment

**Verdict: Phase 1 unconditional DONE (all G1–G9 MET with 245/245 `e2e_pass`) by EOD ICT is not achievable without a mass waiver register.** Automation gates G5–G9 (except G3/G4 program closure) are already green; the blocker is **G1/G2/G3/G4 UC cardinality**, not stack health.

| Metric | U18 kickoff | Current (matrix regen) | EOD realistic ceiling |
|--------|------------:|------------------------:|----------------------:|
| **Closed (`e2e_pass` + `waived`)** | **31/245 (12.7%)** | **57/245 (23.3%)** | **95–110/245 (39–45%)** with evidence |
| **G1** | OPEN | OPEN | **GWC only** unless PM accepts **135–150 waivers** |
| **G2 (104 XBOS)** | ~14/104 | **~41/104** | **~55–65/104** e2e + remainder waived |
| **G3 (119 HRM)** | 15/119 mob | **16/119** (+1 waived) | **~45–55/119** e2e + waived |
| **G4 (22 DM-LOG)** | OPEN | 22× `data` | **22/22** via seed-verify **or** GWC waiver to P2 |

**TM recommendation to PM:** Execute **evidence-first promotion waves** (below) until ~23:00 ICT, then **QC re-gate** with honest counts. Claim **«Phase 1 DONE»** only if PM signs waiver register for remaining `planned`/no-UI UC; otherwise **GO WITH CONDITIONS — UAT baseline proven, program closure deferred**.

---

## 2. G1–G9 gate map (EOD path)

| Gate | Target | Now | EOD path | Owner | TM |
|------|--------|-----|----------|-------|-----|
| **G1** | 245 closed | 57/245 | +38–53 `e2e_pass` + **135–150 `waived`** (PM) | QA-02 + PM | **GWC max** |
| **G2** | 104/104 XBOS | ~41/104 | +14–24 e2e (clusters) + waiver for AR/AST/DASH/INF/CC legacy | Dev-BE/FE + QA | **GWC** |
| **G3** | 119/119 HRM | 16/119 | +29–39 e2e (BE cluster + L2 embed) + waiver MD/OP/PF/IM | Dev-BE/FE + QA | **GWC** |
| **G4** | 22/22 DM-LOG | 0/22 e2e | Seed verify script → 22 `e2e_pass` **or** waiver expiry **2026-07-31** | DevOps + QA | **Achievable** |
| **G5** | 183 DM | MET | Hold (S4 evidence) | — | **PASS** |
| **G6** | 15 mobile | MET | Regression smoke only | Dev-Mobile + QA | **PASS** |
| **G7** | `phase1:gate` | exit 0 | Re-run **`--strict`** EOD | QA | **PASS w/ strict run** |
| **G8** | L0→L3 | MET | Re-run after last Dev wave | QA | **PASS** |
| **G9** | 245 ≥ partial | MET | Hold `uc-373-coverage.json` | QA | **PASS** |

**Already closed (no further Dev):** G5, G6, G7 (non-strict), G8, G9 per `p1-s5-qa-01` / `p1-s5-qc-01`.

---

## 3. UC tiers — `e2e_pass` today vs waiver

### Tier 1 — Promote today with live evidence (high confidence)

**Rule:** BE jest + authenticated HTTP probe + matrix row evidence; no bulk infer from L1 alone (QC-S5-R1).

| Cluster | UC IDs | impl_status | Evidence path | Dev h | QA h |
|---------|--------|-------------|---------------|------:|-----:|
| **Config / audit / MD (done)** | UC-XBOS-01..07, MD-01..07, KPI-01..04, AUTH/TENANT, WF-02..06, CC-P0-01..05,08, CAT-03/05 | `e2e_pass` | `p1-s5-be-wave-final`, `p1-s2-qa-01`, `p1-s5-qa-02` | 0 | 0.5 retest |
| **BE ready — probe only** | UC-XBOS-SYNC-01, UC-XBOS-08, UC-XBOS-10, UC-XBOS-ORG-01, UC-XBOS-ORG-03, UC-ECO-MASTER-02, UC-XBOS-WF-01 | `be` | xbos jest 125/125; UAT bootstrap steps | 1.5 | 1 |
| **CC inbox** | UC-CC-P0-06 | `be` | WF tasks API + L2 drawer (FE wire) | 1 | 0.5 |
| **HRM embed L2** | UC-HRM-22..25 | `be` | P-CC-05..08 PASS; `test:hrm-embed:audit` | 0.5 | 0.5 |
| **Mobile (G6)** | UC-HRM-MOB-01..15 | `e2e_pass` | `mobile-hrm-smoke.mjs` regression | 0.5 | 0.5 |

**Tier-1 new e2e today:** **~10–12 UC** (increment on top of 57).

### Tier 2 — Promote if Wave-1 completes (medium confidence)

| Cluster | UC IDs | Blocker | Dev h | QA h |
|---------|--------|---------|------:|-----:|
| **Catalog governance data→e2e** | UC-XBOS-CAT-01,02,04,06,07 | TM-S2-R1 scope alias; seed at `holding` | 2 | 1 |
| **RACI FE** | UC-RACI-01..06 | API exists; FE `fe` — vitest + CC panel | 2 | 1 |
| **KPI strict / dashboard policy** | UC-CC-P0-09 | `FE_MOCK_TO_API_AUDIT` strict banner | 1.5 | 0.5 |
| **HRM BE clusters (attendance)** | HRM-AT-01..13 | BE jest; L2 row partial | 1 | 1.5 |
| **HRM BE clusters (payroll)** | HRM-PR-01..06 | payslips L2 PASS | 0.5 | 1 |
| **HRM BE clusters (recruitment/contracts/insurance)** | HRM-RC-01..06, HRM-CI-01..07 | BE specs; embed tabs | 1 | 1.5 |
| **HRM core list CRUD** | UC-HRM-01..08, HRM-EM-01..05, HRM-SC-01..05, HRM-FL-01 | API smoke; not full standalone UI | 2 | 2 |

**Tier-2 new e2e today:** **~28–38 UC** (cumulative **~85–95/245**).

### Tier 3 — DM-LOG + seed (G4)

| Cluster | UC IDs | Path | Dev h | QA h |
|---------|--------|------|------:|-----:|
| **XBOS-DM-LOG-01..22** | All 22 | `seed:phase1:logistic-catalog` + checklist `XBOS-DM-LOG-19` JSON | 1 (DevOps) | 1 |

**If seed verify PASS:** promote 22 `e2e_pass` → **G4 MET**. If API UI absent: **waived** expiry **2026-07-31**, owner Dev-BE, evidence `p1-s4-qa-01`.

### Tier 4 — Waiver required (cannot e2e by EOD)

**Policy:** PM sign-off; each row: `owner`, `evidence_path`, `expiry`, `trigger_to_close`.

| Bucket | Count | Example UC | Rationale | Expiry |
|--------|------:|------------|-----------|--------|
| **A — no endpoint / mock-only** | **~25** | UC-XBOS-13..16, AR-01..03, AST-01..02, DASH-01..03, INF-01..03, CC-01,03,04, CC-05..08, ECO-MASTER-01, ECO-FE-01, ECO-SCOPE-01 | TechSpec «Một phần»; no controller | **2026-08-31** |
| **C — planned HRM extensions** | **~23** | HRM-MD-01..05, HRM-SC-06..09, HRM-IM-01..04, HRM-OP-01..04, HRM-PF-01..04, UC-HRM-20,21,26 | Out of pilot slice; SRS P1 deferred UI | **2026-08-31** |
| **C — BE-only remainder** | **~35–45** | UC-HRM-07..08, HRM-SV-*, HRM-NT-*, remaining `be` without L2 | API without FE/E2E path today | **2026-07-31** |
| **Already waived** | **1** | UC-HRM-27 | FE embed decisions/reports | hold |

**Tier-4 waiver total:** **~83–93 UC** minimum; **full G1 closure** needs **~135–150 waivers** depending on Tier-2 yield.

**Existing waiver (keep):**

| UC | Status | evidence_path |
|----|--------|---------------|
| UC-HRM-27 | `waived` | `FE_MOCK_TO_API_AUDIT.md` — embed decisions/reports |

---

## 4. Realistic hour blocks — Dev + QA (ICT 24/05)

Assumes parallel lanes (max 3 Task). Hours are **wall-clock effort**, not calendar stretch.

| Block (ICT) | Duration | Dev-BE | Dev-FE | Dev-Mobile | DevOps | QA | Outcome |
|-------------|----------|--------|--------|------------|--------|-----|---------|
| **B0 — Baseline** | 09:00–10:00 | — | — | — | 0.5 stack pulse | 0.5 L0 + regen matrix | Confirm **57/245**; L0 PASS |
| **B1 — Khối A BE probes** | 10:00–12:00 | **2h** SYNC/ORG/WF-01/MASTER-02 | — | — | — | **1h** parallel probes | +8–10 `e2e_pass` |
| **B2 — CC + catalog** | 12:00–15:00 | **1h** cat-gov scope alias | **2h** P0-06 inbox, P0-09, RACI | — | — | **1.5h** L2 cat-gov row | +10–14 `e2e_pass` |
| **B3 — HRM clusters** | 15:00–18:00 | **2h** AT/PR/RC/CI smoke fixes | **1.5h** embed 22–25 harden | **0.5h** mob regression | — | **2h** L2 + persona | +20–28 `e2e_pass` |
| **B4 — DM-LOG G4** | 18:00–19:30 | 0.5 support | — | — | **1h** seed verify | **0.5h** checklist | G4 close or waiver |
| **B5 — QA-02 promotion** | 19:30–21:30 | — | — | — | — | **2h** per-UC overrides + `docs:phase1:matrix` | Matrix honest |
| **B6 — S5 gate** | 21:30–23:30 | — | — | — | 0.5 | **1.5h** strict gate + QC packet | G7 strict; QC re-gate |

**Dev+QA effort summary (EOD):**

| Role | Hours | Primary deliverable |
|------|------:|---------------------|
| Dev-BE | **6.5** | Tier-1/2 BE probes; catalog scope; HRM API fixes |
| Dev-FE | **3.5** | CC-P0-06, P0-09, RACI, embed |
| Dev-Mobile | **0.5** | MOB regression |
| DevOps | **1.5** | L0 + DM-LOG seed verify |
| QA | **9** | Cluster retest, QA-02 promotions, strict gate |
| **Total execution** | **~21** | Fits U18 window with 3 parallel lanes |

---

## 5. Work split — dispatch IDs for PM

| work_item_id | Role | Entry | Exit | Depends |
|--------------|------|-------|------|---------|
| **P1-TODAY-BE-A01** | dev-be | xbos 125/125; TM-S2-R1 open | Tier-1 BE 8 UC probed → `e2e_pass` | B0 |
| **P1-TODAY-FE-A01** | dev-fe | `p1-s5-be-wave-final` READY_FOR_QA | CC-P0-06, P0-09, RACI wired | B1 |
| **P1-TODAY-QA-A01** | qa | L0 PASS | Tier-1+2 promotions logged | B1–B3 |
| **P1-TODAY-BE-C01** | dev-be | `p1-s3-be-01` evidence | HRM AT/PR/RC/CI cluster smoke | B3 |
| **P1-TODAY-FE-C01** | dev-fe | embed 8/8 | UC-HRM-22..25 + UC-HRM-26 fe path | B3 |
| **P1-TODAY-DO-B01** | devops | G5 PASS | G4 seed verify 22/22 or waiver draft | B4 |
| **P1-TODAY-QA-02** | qa | P1-S5-QA-01 PASS | G1 matrix regen; no bulk infer | B5 |
| **P1-TODAY-QC-02** | qc | QA-02 complete | GO/GWC/NO-GO with waiver list | B6 |
| **P1-TODAY-PM-W01** | pm | TM gap plan | Waiver register signed | B6 |

---

## 6. Risk register

| ID | Sev | Problem | Mitigation | Verification |
|----|-----|---------|------------|--------------|
| TA-U18-R1 | **Critical** | 188 UC open at kickoff; ~2 UC/hour max with evidence | Waiver register + honest reporting | `PROJECT_STATUS_REPORT` ≠ «xong» |
| TA-U18-R2 | **High** | G2 requires 104 e2e; only ~41 today | Waive mock-only A-block; e2e only probed clusters | G2 row in gate report |
| TA-U18-R3 | **High** | Catalog-gov 409 portal JWT (`main` vs `holding`) | `resolveCatalogGovernanceScope` (TM-S2-R1) | Authenticated inbox 200 |
| TA-U18-R4 | Medium | `phase1:gate --strict` not yet run | QA B6 before QC GO | exit 0 log |
| TA-U18-R5 | Medium | Member CEO / HRBP fidelity not in L2 | Defer G3 sign-off or waiver persona rows | persona probes doc |
| TA-U18-R6 | Low | Windows path spaces break capability spawn | Direct `verify:capabilities` | QC-S5-R6 |

---

## 7. Options (solution evaluation)

| Option | Scope | Timeline | Risk | TM pick |
|--------|-------|----------|------|---------|
| **A — Evidence-only EOD** | ~95–110/245 e2e; G1 OPEN | Today | Low honesty risk | **Baseline** |
| **B — Evidence + structured waiver** | 245/245 closed; G1 MET | Today + PM sign | Medium — must list every waiver | **Recommended for «DONE» label** |
| **C — Claim DONE from G7/G8/G9** | Skip G1/G2 | Today | **Critical** — QC already rejected | **Rejected** |

---

## 8. Milestone / Go–No-Go (EOD ICT)

| Checkpoint | Time ICT | Criterion | Decision owner |
|------------|----------|-----------|----------------|
| CP1 | 12:00 | +10 UC e2e; L0 PASS | PM |
| CP2 | 18:00 | ≥80/245 closed OR stop-scope | PM + TM |
| CP3 | 21:30 | QA-02 matrix regen | QA |
| CP4 | 23:30 | `phase1:gate --strict` + QC-02 | QC |

**EOD TM sign-off criteria:**

- G5, G6, G7 (strict), G8, G9 = PASS
- G1 = **245/245** only with waiver register; else **GWC**
- G2 ≥ **55/104** e2e + documented waivers for remainder
- G3 ≥ **45/119** e2e + waivers for MD/OP/PF
- G4 = 22/22 seed verify **or** waiver to 2026-07-31
- No silent bulk promotion (QC-S5-R1)

---

## 9. Handoff

| Field | Value |
|-------|--------|
| **work_item_id** | P1-TODAY-GOV-TA |
| **from_role** | technical-manager |
| **to_role** | pm |
| **entry_criteria** | U18 kickoff; baseline 31/245; governance wave complete |
| **exit_criteria** | G1–G9 gap plan with UC tiers, hour blocks, Dev+QA split, waiver policy |
| **evidence_path** | `docs/qa/evidence/p1-today-ta-gap-plan-20260524.md` |
| **needed_by** | P1-TODAY-QA-02; P1-TODAY-BE-A01; P1-TODAY-FE-A01; P1-TODAY-QC-02; PM waiver register |
| **ack_status** | **PASS_TO_PM** |

**TM summary for PM:** Treat **57/245 (current)** as the honest floor (not 31). By EOD, **~95–110 `e2e_pass` + 1 waived** is the evidence ceiling without gaming gates. **Full G1–G9 «Phase 1 DONE»** requires PM-approved **~135–150 waivers** for Tier-4 UC; otherwise ship **GO WITH CONDITIONS** (UAT baseline proven per `p1-s5-qc-01`). Dispatch **B1→B6** in §4 immediately; do not wait for user CLI.
