# PO Spec Test Report (live rollup)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-SPEC-TEST-REPORT-v1` |
| **Program** | `docs/program/PO_SPEC_TEST_SUITE_PROGRAM.md` §2.3 / Wave **T3** |
| **Catalog SoT** | `docs/qa/PO_SPEC_TEST_CASE_CATALOG.md` (**53** spine TC — execution) |
| **UC×TC (sponsor)** | `docs/qa/reports/PO_UC_TESTCASE_STATUS_ROLLUP.md` — UC done/chưa + TC từng UC |
| **Depth status** | `docs/program/PO_ECOSYSTEM_TC_DEPTH_STATUS.md` · **31** packs SYNTHED |
| **Unit Plan** | `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` (T2 CLOSED) |
| **Updated** | 2026-08-04 · `U84-PRIMARY-EXEC-ROLLUP-01` · §12.5 Primary exec · Waves A→C-Δ §6–§11 + §12 SYNTH preserved |
| **Owner** | qa |
| **Locks** | U65 · **cấm** claim UAT / Phase1 DONE — catalog writing ≠ business UAT PASS |

> Live rollup — exclusive primary Status per **spine** TC-ID (§2). Ecosystem **depth** packs = design/PLANNED (§6–§11). Refresh executive after each synth wave.

---

## 1. Executive rollup

### 1.0 Catalog depth vs spine execution (sponsor honesty)

| Layer | Metric | Count | Meaning |
|-------|--------|------:|---------|
| **Depth catalog** (U83+U84 design) | Menu packs SYNTHED | **31** | After `PO-ECO-TC-SYNTH-WF-CAT-01` (U84) |
| | Claimed TC matrix rows | **1593** | Author footers — **PLANNED** / design only |
| | Globally unique depth TC-IDs | **1473** | Prior **1375** + U84 net **+98** |
| **Spine execution** (T1) | Catalog TC total | **53** | `PO_SPEC_TEST_CASE_CATALOG.md` — **unchanged** |
| | Of which **EVIDENCED** | **16** | Browser/mobile/GWC — **do not invent** new EVIDENCED here |
| | Of which **AUTOMATED** | **16** | Jest present (not full UF) |

**Verdict for sponsors:** **UAT / Phase 1 = NOT DONE.** Writing / synthesizing depth TC packs (**1593** rows · **1473** unique · **31** packs) is **catalog depth IN DELIVERY** — it is **not** business UAT PASS and **not** Phase 1 DONE. Spine remains **53** TC with open FAIL/BLOCKED/SPEC_GAP (§1.1 spine table · §3 P0).

### 1.1 Spine execution status (53 TC — exclusive primary)

| Metric | Count | Notes |
|--------|------:|-------|
| Catalog TC total | **53** | T1 spine SoT |
| **EVIDENCED** | **16** | Browser/mobile/GWC mapped in §2 — unchanged this WI |
| **AUTOMATED** | **16** | Jest present (not full UF) |
| **FAIL** (open product) | **1** | TC-HP-02 JobTemplates / plan mount |
| **BLOCKED** | **2** | TC-LV-02 J-MOB-05 approve · TC-AT-02 (upstream submit) |
| **SPEC_GAP** | **1** | TC-LV-03 ladder `T_L1` — **no invent** |
| **PLANNED** | **17** | Not yet wave-run / deferred submit |

**Sum check:** 16+16+1+2+1+17 = **53**.

**UAT / Phase 1 DONE:** **NOT claimed.**

### 1.2 Wave evidence map (recent)

| Theme | Verdict | Evidence |
|-------|---------|----------|
| LV-03 / LV-04 web | **GWC** (QC) · prior W1 FAIL closed | `po-e2e-spine-02-web-qa-w1-r1.md` · `po-e2e-spine-02-web-qc-w1.md` |
| Leave approve UX / **TC-LV-09** | **EVIDENCED · GWC** (QC) · condition CLOSED | `r-spine-web-approve-ux-01-qa.md` · **`r-spine-web-approve-ux-01-qc.md`** |
| HP-03 Inbox | **PASS** (closed thiswave) | `po-e2e-spine-01-qa-w3.md` |
| HP-04 candidates | Prior W4 **FAIL** `HRM-VAL-001` → BE-CAND-DTO **READY** → W4-R1 **PASS** create+hire | `po-e2e-spine-01-qa-w4.md` · `po-e2e-spine-01-be-cand-dto-01.md` · `po-e2e-spine-01-qa-w4-r1.md` |
| HP-05 after hire | **soft** residual (stamp/contracts) | same W4-R1 |
| manager_id Option B | **PASS** browser PATCH | `r-spine-mgr-hier-01-qa-browser.md` |
| AT-01 nav | **GWC** nav-only · submit/approve **out of scope** | `r-spine-at-nav-01-qa.md` · `r-spine-at-nav-01-qc.md` |
| Unit Plan T2 | **CLOSED** COVERED/MISSING | `PO_SPEC_UNIT_TEST_PLAN.md` · `po-spec-unit-test-plan-01.md` |
| Unit IMPL | **in-flight** | `PO-SPEC-UNIT-TEST-IMPL-01` (dev-be) — **do not** re-dispatch plan |
| Ecosystem depth A→C-Δ | **SYNTHED** (design) | §6–§11 · prior **1494** / **1375** / **28** · evidence `po-eco-tc-synth-wave-c-delta-01.md` |
| U84 WF×catalog×company | **SYNTHED** (design) | §12 · **1593** claimed / **1473** unique / **31** packs · evidence `po-eco-tc-synth-wf-cat-01.md` |
| U84 Primary exec rollup | **6/7 EVIDENCED** · 1 EXTERNAL · OPEN **0** | §12.5 + §12.5 R2 · `u84-primary-exec-rollup-r2.md` · HIM §2 — **≠** UAT DONE |
| Program status refresh | **PASS_TO_PM** | `PO-ECO-TC-PROGRAM-STATUS-01` · `po-eco-tc-program-status-01.md` |

---

## 2. Rollup table — TC → evidence → verdict

| TC-ID | Layer | Verdict | Evidence path(s) |
|-------|-------|---------|------------------|
| TC-HP-01 | UI | **EVIDENCED** | `po-e2e-spine-01-qa-w1.md` |
| TC-HP-02 | UI | **FAIL** | `po-e2e-spine-01-qa-w1.md` · `po-e2e-spine-01-fe-rec-mount.md` |
| TC-HP-03 | UI | **EVIDENCED** | `po-e2e-spine-01-qa-w3.md` (+ test-log) |
| TC-HP-04 | UI | **PLANNED** | Self-approve BR-WF-04 — not thiswave |
| TC-HP-05 | UI | **PLANNED** | U65 empty-inbox policy |
| TC-HP-06 | UI | **EVIDENCED** | `po-e2e-spine-01-qa-w4-r1.md` · POST **201** `HRM-REC-CP-201` (prior FAIL superseded) |
| TC-HP-07 | UNIT | **AUTOMATED** | `po-e2e-spine-01-be-cand-dto-01.md` · `.spec.ts` — BE READY confirmed by W4-R1 |
| TC-HP-08 | UI | **EVIDENCED** | W4-R1 hire · PATCH **200** `HRM-REC-CP-200` + `employee_id` |
| TC-HP-09 | UI | **EVIDENCED** | W4-R1 emp detailOk · soft residual stamp/contracts |
| TC-HP-10 | UI | **PLANNED** | Contracts surface weak — not promoted |
| TC-HP-11 | UI | **PLANNED** | — |
| TC-HP-12 | UI | **PLANNED** | — |
| TC-HP-13 | UI | **PLANNED** | — |
| TC-HP-14 | UNIT | **AUTOMATED** | `recruitment-workflow.bridge.spec.ts` |
| TC-LV-01 | MOBILE | **EVIDENCED** | `po-e2e-spine-02-03-mob-qa-w1.md` (submit) |
| TC-LV-02 | MOBILE | **BLOCKED** | J-MOB-05 after mgr hier — qa-device pending |
| TC-LV-03 | MOBILE/UI | **SPEC_GAP** | `po-e2e-ba-case-matrix-01.md` GAP-LEAVE-LADDER-01 — **no invent T_L1** |
| TC-LV-04 | API | **EVIDENCED** | ba-case-matrix §1 — AS-IS 1-step honesty |
| TC-LV-05 | UI | **EVIDENCED** | w1-r1 + QC **GWC** |
| TC-LV-06 | UNIT | **AUTOMATED** | `po-e2e-spine-02-be-lv03-val-att-01.md` |
| TC-LV-07 | UI | **EVIDENCED** | w1-r1 + QC **GWC** |
| TC-LV-08 | UNIT | **AUTOMATED** | `leave-requests.service.spec.ts` |
| TC-LV-09 | UI | **EVIDENCED** (GWC) | `r-spine-web-approve-ux-01-qa.md` · **`r-spine-web-approve-ux-01-qc.md`** (GWC · closes `R-SPINE-WEB-APPROVE-UX-01`) |
| TC-LV-10 | UI/API | **PLANNED** | BR-WF-04 self-approve leave |
| TC-LV-11 | UI/API | **PLANNED** | — |
| TC-LV-12 | API/UI | **PLANNED** | BR-LEAVE-NOTICE-01 |
| TC-LV-13 | UNIT | **AUTOMATED** | leave-requests.service.spec.ts |
| TC-LV-14 | UNIT | **AUTOMATED** | leave-requests.service.spec.ts |
| TC-LV-15 | UI | **EVIDENCED** | spine-02 R1 · `w1b-01-qa-leave-live-r1.md` |
| TC-LV-16 | UNIT | **AUTOMATED** | `leave-workflow.bridge.spec.ts` |
| TC-AT-01 | MOBILE | **EVIDENCED** | nav-only **GWC** `r-spine-at-nav-01-qa.md` · `-qc.md` · submit deferred |
| TC-AT-02 | MOBILE | **BLOCKED** | upstream full AT submit/approve |
| TC-AT-03 | MOBILE/API | **PLANNED** | — |
| TC-AT-04 | UI/MOBILE | **PLANNED** | — |
| TC-AT-05 | MOBILE | **PLANNED** | — |
| TC-AT-06 | MOBILE | **PLANNED** | — |
| TC-AT-07 | UNIT | **AUTOMATED** | `attendance-requests.service.spec.ts` |
| TC-AT-08 | UI | **PLANNED** | — |
| TC-MGR-01 | UI | **EVIDENCED** | `r-spine-mgr-hier-01-qa-browser.md` |
| TC-MGR-02 | UI | **EVIDENCED** | same · P2 label residual |
| TC-MGR-03 | API/MOBILE | **PLANNED** | qa-device J-MOB-05 Option A |
| TC-MGR-04 | UNIT | **AUTOMATED** | `employee-manager.validation.spec.ts` |
| TC-MGR-05 | UNIT | **AUTOMATED** | same |
| TC-MGR-06 | UNIT | **AUTOMATED** | same |
| TC-UNIT-LEAVE-01 | UNIT | **AUTOMATED** | leave-requests.service.spec.ts |
| TC-UNIT-LEAVE-02 | UNIT | **AUTOMATED** | leave-requests.service.spec.ts |
| TC-UNIT-REC-01 | UNIT | **AUTOMATED** | po-e2e-spine-01-be-cand-dto-01.spec.ts |
| TC-UNIT-REC-02 | UNIT | **AUTOMATED** | recruitment.controller.spec.ts |
| TC-UNIT-EMP-01 | UNIT | **AUTOMATED** | employees.service.spec.ts |
| TC-X-01 | API | **PLANNED** | scope parity |
| TC-X-02 | API | **PLANNED** | BR-WF-04 |
| TC-X-03 | UI | **EVIDENCED** | `w1b-03-tc-cat-qa-r1.md` |
| TC-X-04 | UI | **EVIDENCED** | leave mount GWC |

---

## 3. P0 open (block product UAT claim)

| ID | Issue | Owner hint |
|----|-------|------------|
| TC-HP-02 | Plan/JobTemplates mount path | **dev-fe** |
| TC-LV-03 | Ladder L2 / `T_L1` | **SA/BA** — SPEC_GAP HOLD |
| TC-LV-02 / TC-MGR-03 | J-MOB-05 approve after mgr_id | **qa-device** |
| TC-AT-02 (+ AT submit) | Full SPINE-03 submit/approve after nav GWC | **qa-device** / **dev-mobile** (FAB overlap P2) |
| Unit MISSING P0 | hire-employee-link · PATCH hired · BR-WF-04 unit | **dev-be** `PO-SPEC-UNIT-TEST-IMPL-01` **in-flight** |

---

## 4. Unit Test Plan — COVERED vs MISSING + IMPL

| Artifact | Status |
|----------|--------|
| `docs/qa/PO_SPEC_UNIT_TEST_PLAN.md` | **T2 CLOSED** |
| Evidence | `docs/qa/evidence/po-spec-unit-test-plan-01.md` |
| IMPL | **`PO-SPEC-UNIT-TEST-IMPL-01` DISPATCHED** (dev-be) — **cấm** re-dispatch UNIT-TEST-PLAN |

| P0 theme | Gap |
|----------|-----|
| Leave VAL-ATT (sick / LVT_02 / metadata) | **COVERED** |
| Leave approve/reject happy + scope | **COVERED** |
| Leave L2 day ladder | **BLOCKED** (`T_L1`) |
| Candidate FE DTO whitelist | **COVERED** (+ browser W4-R1) |
| G-DB-01 create hired no link | **PARTIAL** |
| G-DB-01 hire-employee-link + HIRE-409 + PATCH hired | **MISSING** → IMPL |
| Employee `manager_id` cycle/self/scope | **COVERED** |
| Inbox display_title stamp | **COVERED** |
| BR-WF-04 / LV-05 self-approve unit | **MISSING** → IMPL |
| Advance notice ≥3 calendar days | **MISSING** (hold code name) |

---

## 6. Ecosystem depth — Wave A (catalog SYNTH)

| Meta | Value |
|------|--------|
| **Program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §4 Synth |
| **WI** | `PO-ECO-TC-SYNTH-WAVE-A-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wave-a-01.md` |
| **Mode** | Design packs only — **PLANNED** TCs; **not** browser UAT |

### 6.1 Totals (6 packs)

| Metric | Wave A sum | Spine (T1) | Notes |
|--------|----------:|----------:|-------|
| Menu packs | **6** | — | EMP · REC · ATT · ORG-SHARE · INBOX-CAT · MOB-LEAVE-APPR |
| Screen inventory rows | **158** | — | includes tabs/dialogs per pack |
| Field dictionary rows | **405** | — | |
| Function inventory rows | **254** | — | |
| **TC matrix rows (claimed)** | **465** | **53** | Disjoint ID namespaces; spine neo-map in synth evidence §2.5 |
| TC-ID cross-pack collisions | **0** | — | Synth scan 2026-08-03 |

### 6.2 Pack index

| pack_path | TCs | Screens | Fields | Functions | Synth status |
|-----------|----:|--------:|-------:|----------:|--------------|
| `docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md` | 156 | 40 | 118 | 72 | **SYNTHED** |
| `docs/qa/testcases/hrm-web/HRM-RECRUITMENT.md` | 118 | 38 | 94 | 62 | **SYNTHED** |
| `docs/qa/testcases/hrm-web/HRM-ATTENDANCE.md` | 82 | 41 | 87 | 58 | **SYNTHED** |
| `docs/qa/testcases/xbos/XBOS-ORG-SHARE.md` | 38 | 12 | 44 | 19 | **SYNTHED** |
| `docs/qa/testcases/xbos/XBOS-INBOX-CAT.md` | 32 | 12 | 28 | 18 | **SYNTHED** |
| `docs/qa/testcases/hrm-mobile/MOB-LEAVE-APPR.md` | 39 | 15 | 34 | 25 | **SYNTHED** |

### 6.3 BLOCKED / SPEC_GAP (Wave A cross-refs — unchanged spine verdicts)

| ID | Scope | Report status |
|----|-------|---------------|
| **LV-02** · **TC-LV-03** | Leave 2-step ladder `T_L1`/`N` | **SPEC_GAP** (spine §2) · depth `TC-ATT-LV-BLK-*` · `TC-MOB-LV-X-003` **BLOCKED** |
| **SPEC_GAP-HDSD-EMP-01** | HDSD leaf Nhân sự | **Closed** — `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` · evidence `docs/qa/evidence/ba-hdsd-emp-leaf-01.md` |

**UAT / Phase 1 DONE:** still **NOT claimed** — Wave A adds catalog depth only.

---

## 7. Ecosystem depth — Wave B (catalog SYNTH)

| Meta | Value |
|------|--------|
| **Program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §4 Synth |
| **WI** | `PO-ECO-TC-SYNTH-WAVE-B-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wave-b-01.md` |
| **Mode** | Design packs only — **PLANNED** TCs; **not** browser UAT |

### 7.1 Totals (7 packs)

| Metric | Wave B sum | Wave A (§6) | A+B cumulative | Notes |
|--------|----------:|------------:|---------------:|-------|
| Menu writer packs | **7** | 6 | **13** | CON · PAY · DEC · RACI · RBAC · MOB-HOME · MOB-ATT |
| Screen inventory rows | **131** | 158 | **289** | per pack footers |
| Field dictionary rows | **354** | 405 | **759** | |
| Function inventory rows | **191** | 254 | **445** | |
| **TC matrix rows (claimed)** | **394** | 465 | **859** | **768** globally unique depth IDs |
| TC-ID cross-pack collisions | **0** | 0 | **0** | Synth scan 2026-08-03 |

### 7.2 Pack index

| pack_path | TCs | Screens | Fields | Functions | Synth status |
|-----------|----:|--------:|-------:|----------:|--------------|
| `docs/qa/testcases/hrm-web/HRM-CONTRACTS.md` | 96 | 28 | 52 | 43 | **SYNTHED** |
| `docs/qa/testcases/hrm-web/HRM-PAYROLL.md` | 96 | 38 | 78 | 52 | **SYNTHED** |
| `docs/qa/testcases/hrm-web/HRM-DECISIONS.md` | 59 | 15 | 38 | 27 | **SYNTHED** |
| `docs/qa/testcases/xbos/XBOS-RACI.md` | 32 | 10 | 51 | 13 | **SYNTHED** |
| `docs/qa/testcases/xbos/XBOS-RBAC-MATRIX.md` | 38 | 8 | 65 | 13 | **SYNTHED** |
| `docs/qa/testcases/hrm-mobile/MOB-HOME.md` | 34 | 18 | 32 | 19 | **SYNTHED** |
| `docs/qa/testcases/hrm-mobile/MOB-ATTENDANCE.md` | 39 | 14 | 38 | 24 | **SYNTHED** |

### 7.3 MENU-05 density ≠ product DONE (preserve)

| Note | Detail |
|------|--------|
| **UF-HRM-MENU-05** · **UC-HRM-27** | `HRM-DECISIONS.md` — load/create path may be **GWC**; **≠** module/product DONE |
| Governance TC | `TC-DEC-DEN-BLK-001` — **BLOCKED** if claiming UC-27 DONE chỉ vì empty+200 |
| Execution | Density / AC-DEC-04 evidence still required before UF promotion — **not** UAT DONE from catalog synth |

### 7.4 Cross-ref highlights (no TC-ID collision)

| Edge | Canonical pack |
|------|------------------|
| MOB leave FAB / wizard / MGR leave tab | **MOB-LEAVE-APPR** (Wave A) — HOME/ATT **entry + XREF** only |
| UF-XBOS-07 RACI cell vs UF-XBOS-13 RBAC matrix | **XBOS-RACI** vs **XBOS-RBAC-MATRIX** — `TC-RACI-*` vs `TC-XRM-*` |
| Spine **TC-HP-11** | **TC-PAY-SPINE-HP-001** in PAYROLL |
| **J-HRM-01** menu vs profile tab HĐ | **HRM-CONTRACTS** vs **HRM-EMPLOYEES** §4.6 (`TC-EMP-C-HP-001`) |

**UAT / Phase 1 DONE:** still **NOT claimed** — Wave B adds catalog depth only.

---

## 9. Ecosystem depth — Wave B-DELTA (catalog SYNTH)

| Meta | Value |
|------|--------|
| **Program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §4 Synth |
| **WI** | `PO-ECO-TC-SYNTH-WAVE-B-DELTA-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wave-b-delta-01.md` |
| **Mode** | Design packs only — **PLANNED** TCs; **not** browser UAT |

### 9.1 Totals (8 packs)

| Metric | Wave B-DELTA sum | A+B batch-1 (§6+§7) | A+B+DELTA cumulative | Notes |
|--------|----------------:|---------------------:|---------------------:|-------|
| Menu writer packs | **8** | 13 | **21** | INS · SET · PERF · CC-KPI · WF · CATALOG-CC · MOB-PROF · MOB-SET |
| Screen inventory rows | **112** | 289 | **401** | per pack handoffs |
| Field dictionary rows | **302** | 759 | **1061** | |
| Function inventory rows | **189** | 445 | **634** | |
| **TC matrix rows (claimed)** | **381** | 859 | **1240** | **1095** globally unique depth IDs |
| TC-ID cross-pack overlaps | **9** | 0 (prior scan) | **9** | Supersede / journey split — §9.3 |

### 9.2 Pack index

| pack_path | TCs | Screens | Fields | Functions | Synth status |
|-----------|----:|--------:|-------:|----------:|--------------|
| `docs/qa/testcases/hrm-web/HRM-INSURANCE.md` | 87 | 13 | 62 | 39 | **SYNTHED** |
| `docs/qa/testcases/hrm-web/HRM-SETTINGS.md` | 76 | 33 | 86 | 56 | **SYNTHED** |
| `docs/qa/testcases/hrm-web/HRM-PERFORMANCE.md` | 58 | 13 | 28 | 15 | **SYNTHED** |
| `docs/qa/testcases/xbos/XBOS-CC-HOME-KPI.md` | 36 | 12 | 38 | 16 | **SYNTHED** |
| `docs/qa/testcases/xbos/XBOS-WF-DESIGNER.md` | 30 | 7 | 22 | 12 | **SYNTHED** |
| `docs/qa/testcases/xbos/XBOS-CATALOG-CC.md` | 28 | 6 | 28 | 13 | **SYNTHED** |
| `docs/qa/testcases/hrm-mobile/MOB-PROFILE.md` | 36 | 14 | 42 | 30 | **SYNTHED** |
| `docs/qa/testcases/hrm-mobile/MOB-SETTINGS.md` | 30 | 14 | 36 | 18 | **SYNTHED** |

### 9.3 BUILD_GAP + collision notes (preserve)

| ID | Note |
|----|------|
| **BUILD_GAP-MD-PANEL-01** | `HRM-SETTINGS.md` — `MasterDataSettingsPanel.tsx` absent on disk; **76** TC remain **PLANNED** design until **dev-fe** restores panel |
| **TC-XIC-CC-*** supersede | UF-14 execution owns **`TC-CCC-*`** in **XBOS-CATALOG-CC**; **XBOS-INBOX-CAT** legacy IDs = deprecated pointers |
| **TC-J-HP-001..003** | **XBOS-ORG-SHARE** (Wave A) vs **XBOS-CC-HOME-KPI** — split journeys; KPI pack should rename to `TC-CC-J-HP-*` on author refresh |
| **MENU-05 density** | Unchanged from §7.3 — not product DONE |

**UAT / Phase 1 DONE:** still **NOT claimed** — Wave B-DELTA adds catalog depth only.

---

## 10. Ecosystem depth — Wave C (catalog SYNTH)

| Meta | Value |
|------|--------|
| **Program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §4 Synth |
| **WI** | `PO-ECO-TC-SYNTH-WAVE-C-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wave-c-01.md` |
| **Mode** | Design packs only — **PLANNED** TCs; **not** browser UAT |

### 10.1 Totals (4 packs)

| Metric | Wave C sum | A+B+DELTA (§6+§7+§9) | **Cumulative** | Notes |
|--------|----------:|----------------------:|---------------:|-------|
| Menu writer packs | **4** | 21 | **25** | DASH · LOGIN · MOB-TEAM · GUIDE |
| Screen inventory rows | **55** | 401 | **456** | per pack footers |
| Field dictionary rows | **117** | 1061 | **1178** | |
| Function inventory rows | **62** | 634 | **696** | |
| **TC matrix rows (claimed)** | **156** | 1240 | **1396** | **1246** globally unique depth IDs |
| TC-ID cross-pack collisions (Wave C) | **0** | 9 (B-DELTA documented) | **9** | Login↔CC-HOME = neo-map only |

### 10.2 Pack index

| pack_path | TCs | Screens | Fields | Functions | Synth status |
|-----------|----:|--------:|-------:|----------:|--------------|
| `hrm-web/HRM-DASHBOARD.md` | 54 | 19 | 42 | 18 | **SYNTHED** |
| `xbos/XBOS-LOGIN.md` | 28 | 8 | 18 | 12 | **SYNTHED** |
| `hrm-mobile/MOB-TEAM.md` | 32 | 16 | 35 | 14 | **SYNTHED** |
| `hrm-web/HRM-GUIDE.md` | 42 | 12 | 22 | 18 | **SYNTHED** · thin_ui STUB |
| **Wave C total** | **156** | **55** | **117** | **62** | — |

### 10.3 Neo-map highlights (preserve)

| Edge | Canonical pack | Notes |
|------|----------------|-------|
| UF-XBOS-01 login form + fail-deep | **XBOS-LOGIN** (`TC-LGN-*`) | **XBOS-CC-HOME-KPI** `TC-CC-HP-001` / `TC-CC-FD-001` = precondition pointer |
| J-CC-01 session F5 | **LOGIN** `TC-LGN-HP-003` vs **CC-HOME** widget reload | Split assertions |
| J-MOB-30 team directory L2.5 | **MOB-TEAM** | **MOB-ATTENDANCE** Team screens **OOS** |
| MOB home tile / profile self CheckIn | **MOB-HOME** · **MOB-PROFILE** | **MOB-TEAM** NAV cross-ref only |
| Dashboard leave approve | **HRM-DASHBOARD** `TC-DASH-REM-HP-002` | Adjacent spine **TC-LV-09** (U65 FE) |
| CC embed guide CTA | **HRM-GUIDE** `TC-GUIDE-L-HP-002` | Not full iframe depth |

**UAT / Phase 1 DONE:** still **NOT claimed** — Wave C adds catalog depth only.

---

## 11. Ecosystem depth — Wave C-DELTA (stub packs SYNTH)

| Meta | Value |
|------|--------|
| **Program** | `docs/program/PO_ECOSYSTEM_TESTCASE_DEPTH_PROGRAM.md` §4 Synth |
| **WI** | `PO-ECO-TC-SYNTH-WAVE-C-DELTA-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wave-c-delta-01.md` |
| **Mode** | Design packs only — **PLANNED** TCs; **not** browser UAT |

### 11.1 Totals (3 packs)

| Metric | C-DELTA sum | A+B+DELTA+C (§6+§7+§9+§10) | **Cumulative** | Notes |
|--------|------------:|----------------------------:|---------------:|-------|
| Menu writer packs | **3** | 25 | **28** | RAIL-STUBS · MOB-OPS · MOB-JRN |
| Screen inventory rows | **43** | 456 | **499** | per pack footers |
| Field dictionary rows | **97** | 1178 | **1275** | |
| Function inventory rows | **44** | 696 | **740** | |
| **TC matrix rows (claimed)** | **98** | 1396 | **1494** | **1375** globally unique depth IDs |
| TC-ID cross-pack collisions (C-DELTA) | **0** | 9 (B-DELTA documented) | **9** | RST↔CC-HOME = neo-map only |

### 11.2 Pack index

| pack_path | TCs | Screens | Fields | Functions | Synth status |
|-----------|----:|--------:|-------:|----------:|--------------|
| `xbos/XBOS-RAIL-STUBS.md` | 28 | 17 | 45 | 14 | **SYNTHED** · STUB/OOS honest |
| `hrm-mobile/MOB-OPERATIONS.md` | 32 | 14 | 24 | 13 | **SYNTHED** · xref SET/HOME |
| `hrm-mobile/MOB-JOURNEY.md` | 38 | 12 | 28 | 17 | **SYNTHED** · MOB-UX-13g |
| **Wave C-DELTA total** | **98** | **43** | **97** | **44** | — |

### 11.3 Neo-map highlights (preserve)

| Edge | Canonical pack | Notes |
|------|----------------|-------|
| Stub module `?module=` + Action Cards filter | **XBOS-RAIL-STUBS** (`TC-RST-*`) | **CC-HOME-KPI** `TC-RAIL-HP-004` = cross_ref · KPI widgets not module-scoped |
| HRM rail · System settings nav inventory | **RAIL-STUBS** | Leaf depth in **HRM-DASHBOARD** / XBOS settings packs |
| Settings **Vận hành** row visibility | **MOB-SETTINGS** `TC-MOB-SET-AU-001` | **MOB-OPERATIONS** owns screen + mutate TCs |
| Home tile → Operations | **MOB-HOME** entry | **TC-MOB-OPS-NAV-002** mount parity |
| Journey timeline + full screen | **MOB-JOURNEY** (`TC-MOB-JRN-*`) | **J-MOB-08** culture REG stays **MOB-HOME** |

**UAT / Phase 1 DONE:** still **NOT claimed** — Wave C-DELTA adds catalog depth only.

---

## 12. Ecosystem depth — U84 WF×catalog×company (SYNTH)

| Meta | Value |
|------|--------|
| **Program** | `docs/program/PO_ENTERPRISE_WF_CATALOG_MATRIX_PROGRAM.md` §6–§7 · U84 |
| **WI** | `PO-ECO-TC-SYNTH-WF-CAT-01` |
| **Evidence** | `docs/qa/evidence/po-eco-tc-synth-wf-cat-01.md` |
| **Code lock** | `docs/program/matrices/PO_WF_CANDIDATE_CODE_LOCK.md` §3–§6 |
| **Mode** | Design packs only — **PLANNED** / GOVERNANCE_LOCK / SPEC_GAP; **not** browser UAT · **uat_done=false** |

### 12.1 Totals (3 packs)

| Metric | U84 sum | A→C-Δ (§6–§11) | **Cumulative** | Notes |
|--------|--------:|---------------:|---------------:|-------|
| Matrix / menu writer packs | **3** | 28 | **31** | WFM · XCM · HIM |
| **TC matrix rows (claimed)** | **99** | 1494 | **1593** | **1473** globally unique depth IDs |
| TC-ID cross-pack collisions (U84) | **0** | 9 (neo-maps prior) | **9** | XREF pointers intentional |
| Spine TC / EVIDENCED | — | 53 / 16 | **53 / 16** | **unchanged** — do not invent |

### 12.2 Pack index

| pack_path | TCs | Prefix | Synth status |
|-----------|----:|--------|--------------|
| `xbos/XBOS-WF-PROCESS-MATRIX.md` | 20 | `TC-WFM-*` | **SYNTHED** · LOCK/SPEC_GAP §6 |
| `xbos/XBOS-CAT-MEMBER-MATRIX.md` | 36 | `TC-XCM-*` | **SYNTHED** · stub `XBOS-CATALOG-MEMBER-MATRIX.md` |
| `hrm-web/HRM-WF-INSTANCE-MATRIX.md` | 43 | `TC-HIM-*` | **SYNTHED** · Primary cells preserved |
| **U84 total** | **99** | — | — |

### 12.3 Neo-map highlights (preserve)

| Edge | Canonical | Notes |
|------|-----------|-------|
| Designer chrome / canvas | **XBOS-WF-DESIGNER** `TC-WFD-*` | WFM = process-family create-def only |
| Inbox approve / gov / extension | **XBOS-INBOX-CAT** `TC-XIC-*` | HIM/WFM/XCM = XREF only |
| Leave mobile submit/approve | **MOB-LEAVE-APPR** `TC-MOB-LV-*` | HIM Leave Primary XREF |
| HRM settings sync depth | **HRM-SETTINGS** `TC-SET-*` | XCM-XREF-SET-001 neo |
| CC catalog doc/measure/price | **XBOS-CATALOG-CC** `TC-CCC-*` | XCM OOS |
| LOCK_CODE (5) | GOVERNANCE_LOCK names | ATT-ADJ + CONTRACT + PROBATION + TRANSFER + EXIT — **no** product constants |
| SPEC_GAP (4) | OT · TRAIN · DISCIPLINE · PAY-EX | Inventory/BLOCKED — **cấm** draft spawn |
| P-LEAVE L2 / T_L1 | SPEC_GAP | TC-HIM-LEAVE-DL-SG-L2-001 |
| P-ATT-ADJ XBOS inbox | BLOCKED until bridge | HRM instance/approve OK |

### 12.4 U78 Primary cell execution (APPEND)

| TC-ID | Status | Evidence | Notes |
|-------|--------|----------|-------|
| TC-HIM-LEAVE-DL-HP-001 | **BLOCKED** (env) | `u78-u84-primary-leave-dl-01.md` | CO-DL finance/xe-du-lich employees **0** — **not** EVIDENCED |
| TC-HIM-LEAVE-DL-AP-001 | **BLOCKED** (env) | same · U78 test-log | L1 holding supporting PASS only; **not** EVIDENCED |
| TC-HIM-LEAVE-DL-SG-L2-001 | SPEC_GAP | HOLD | L2/T_L1 **not** claimed |
| TC-HIM-REC-PLAN-TMDV-HP-001 | **EVIDENCED** | `u78-u84-primary-rec-plan-tmdv-01.md` · U78 test-log | P-REC-PLAN @ CO-TMDV · create **201** + Gửi duyệt QT **201** `HRM-REC-PLAN-WF-200` + F5 |
| TC-HIM-REC-PLAN-TMDV-AP-001 | **EVIDENCED** | same · AP-retarget | Inbox **Xử lý nhanh** **201** `XBOS-WF-200` `plan_approval` · plan `approved` · card gone |
| TC-HIM-REC-REQ-TMDV-HP-001 | **EVIDENCED** | `u78-u84-primary-rec-req-tmdv-01-r1.md` · U78 test-log | P-REC-REQ @ CO-TMDV · JD **201** + YCTD create **201** + Gửi duyệt QT **201** `HRM-REC-WF-200` + F5 (R1 after D-U84 catalog assert) |
| TC-HIM-REC-REQ-TMDV-AP-001 | **EVIDENCED** | same · cont | Inbox **Xử lý nhanh** **201** `XBOS-WF-200` `requisition_approval` · card gone · status `open` |
| TC-HIM-ATT-TMDV-HP-001 | **EVIDENCED** | `u78-u84-primary-att-adj-tmdv-01-r2.md` · U78 test-log | P-ATT-ADJ @ CO-TMDV · R2: POST **201** ISO + CEO F5 pending `@trsport` (slug↔UUID) |
| TC-HIM-ATT-TMDV-AP-001 | **EVIDENCED** | same | mgr `uat.nv0002` Eye→Duyệt **201** `HRM-ATT-REQ-203` · Network `x-company-id=trsport` · F5 approved · XBOS inbox N/A |
| TC-HIM-REC-PIPE-TMDV-HP-001 | **EVIDENCED** | `u78-u84-primary-rec-pipe-tmdv-01.md` · U78 test-log | P-REC-PIPE @ CO-TMDV · FE WF preset `hrm_candidate_pipeline` **201** + candidate **201** + Bắt đầu QT **201** `HRM-REC-CP-WF-200` + F5 |
| TC-HIM-REC-PIPE-TMDV-AP-001 | **EVIDENCED** | same | Inbox **Xử lý nhanh** **201** `XBOS-WF-200` `intake` · matching WI · multi-step card may remain |
| TC-HIM-REC-PIPE-TMDV-FD-001 | **SPEC_GAP** (observe) | same | BR-PO-REC-LGX-01 Offer GPLX FE gate **absent** — residual `R-U84-REC-PIPE-LGX-GPLX-GATE` · **not** EVIDENCED as product block |
| TC-HIM-CAT-DL-HP-001 | **EVIDENCED** | `u78-u84-primary-cat-ext-dl-01.md` · U78 test-log | P-CAT-EXT @ CO-DL · FE WF `wf_hrm_catalog_extension_xe_du_lich` **201** + apply **201** `HRM-SET-209` + `workflowInstanceId` + F5 |
| TC-HIM-CAT-HOLD-AP-001 | **EVIDENCED** | same · R1 | Gov inbox **Phê duyệt** **201** `XBOS-CAT-201` · matching WI · task gone F5 · custom stamp dialog PARTIAL P2 |

**UAT / Phase 1 DONE:** still **NOT claimed** — U84 Primary cell progress ≠ program DONE · spine EVIDENCED **16** unchanged.

### 12.5 U84 Primary execution rollup (`U84-PRIMARY-EXEC-ROLLUP-01` · APPEND)

| Meta | Value |
|------|--------|
| **WI** | `U84-PRIMARY-EXEC-ROLLUP-01` |
| **Date** | 2026-08-04 |
| **Mode** | Docs stamp after ATT-ADJ R2 PASS — **no new browser** this WI |
| **Matrix** | `docs/qa/testcases/hrm-web/HRM-WF-INSTANCE-MATRIX.md` §2 |
| **Evidence** | `docs/qa/evidence/u84-primary-exec-rollup-01.md` |
| **Honesty** | Design depth SYNTH (**1593** / **1473** / **31**) **≠** UAT / Phase1 DONE · spine EVIDENCED **16** unchanged |

**Primary cells (7 AS-IS P0)**

| process_id | co_key | exec_status | HP+AP TC-IDs | Evidence |
|------------|--------|-------------|--------------|----------|
| P-REC-PLAN | CO-TMDV | **EVIDENCED** | TC-HIM-REC-PLAN-TMDV-HP-001 · AP-001 | `u78-u84-primary-rec-plan-tmdv-01.md` |
| P-REC-REQ | CO-TMDV | **EVIDENCED** | TC-HIM-REC-REQ-TMDV-HP-001 · AP-001 | `u78-u84-primary-rec-req-tmdv-01-r1.md` |
| P-REC-REQ | CO-VISUN | **OPEN** | TC-HIM-REC-REQ-VISUN-HP-001 · AP-001 | WI `U78-U84-PRIMARY-REC-REQ-VISUN-01` in flight |
| P-REC-PIPE | CO-TMDV | **EVIDENCED** | TC-HIM-REC-PIPE-TMDV-HP-001 · AP-001 | `u78-u84-primary-rec-pipe-tmdv-01.md` |
| P-LEAVE | CO-DL | **BLOCKED-EXTERNAL** | TC-HIM-LEAVE-DL-HP-001 · AP-001 | `r-u84-leave-dl-persona-scope-01.md` · `u78-u84-primary-leave-dl-01.md` — **cấm** invent EVIDENCED |
| P-ATT-ADJ | CO-TMDV | **EVIDENCED** | TC-HIM-ATT-TMDV-HP-001 · AP-001 | `u78-u84-primary-att-adj-tmdv-01-r2.md` |
| P-CAT-EXT | CO-DL | **EVIDENCED** | TC-HIM-CAT-DL-HP-001 · TC-HIM-CAT-HOLD-AP-001 | `u78-u84-primary-cat-ext-dl-01.md` |

**EVIDENCED Primary TC-IDs (10):**  
`TC-HIM-REC-PLAN-TMDV-HP-001` · `TC-HIM-REC-PLAN-TMDV-AP-001` · `TC-HIM-REC-REQ-TMDV-HP-001` · `TC-HIM-REC-REQ-TMDV-AP-001` · `TC-HIM-REC-PIPE-TMDV-HP-001` · `TC-HIM-REC-PIPE-TMDV-AP-001` · `TC-HIM-ATT-TMDV-HP-001` · `TC-HIM-ATT-TMDV-AP-001` · `TC-HIM-CAT-DL-HP-001` · `TC-HIM-CAT-HOLD-AP-001`

**Tally (R1 historical):** EVIDENCED **5/7** cells · BLOCKED-EXTERNAL **1/7** · OPEN **1/7**.  
**UAT / Phase 1 DONE:** **NOT claimed.**

### 12.5 R2 — honesty re-stamp after VISUN (`U84-PRIMARY-EXEC-ROLLUP-R2` · APPEND)

| Meta | Value |
|------|--------|
| **WI** | `U84-PRIMARY-EXEC-ROLLUP-R2` |
| **Date** | 2026-08-04 |
| **Mode** | QC docs-only honesty audit — **no browser / no seed** |
| **Evidence** | `docs/qa/evidence/u84-primary-exec-rollup-r2.md` |
| **Prior QC** | R1 GWC `u84-primary-exec-rollup-qc-01.md` @ 5/7 |
| **VISUN QA** | `u78-u84-primary-rec-req-visun-01.md` + U78 test-log pair |

**Tally (authoritative post-VISUN):** EVIDENCED **6/7** · BLOCKED-EXTERNAL **1/7** (P-LEAVE@CO-DL) · OPEN **0/7**.  
**EVIDENCED Primary TC-IDs (12):** prior 10 + `TC-HIM-REC-REQ-VISUN-HP-001` · `TC-HIM-REC-REQ-VISUN-AP-001`.  
**P-REC-REQ @ CO-VISUN:** **EVIDENCED** (supersedes §12.5 OPEN row).  
**P-LEAVE @ CO-DL:** still **BLOCKED-EXTERNAL** — **cấm** invent EVIDENCED.  
**UAT / Phase 1 DONE:** **NOT claimed** · `uat_done: false` · `phase1_done: false`.  
**QC verdict:** **GO WITH CONDITIONS** — C1 leave EXTERNAL · C3 ATT XBOS GOVERNANCE_LOCK · C4 no tally→UAT · C2 CLOSED · P2 HDV proxy defer OK.

---

## 8. Change log

| Date | Change |
|------|--------|
| 2026-08-03 | v0 stub — map catalog 53 TC → known evidence; PASS_TO_PM catalog wave |
| 2026-08-03 | **v1 T3** — live counts; LV-03/04 GWC; TC-LV-09 / R-SPINE-WEB-APPROVE-UX **GWC** (`*-qc.md`); HP-03; HP-04 FAIL→W4-R1 EVIDENCED; MGR browser; AT-NAV GWC; Unit Plan CLOSED + IMPL in-flight |
| 2026-08-03 | **§6 Wave A synth** — 465 depth TC rollup; roster SYNTHED; evidence `po-eco-tc-synth-wave-a-01.md` |
| 2026-08-03 | **§7 Wave B synth** — 394 depth TC rollup; 7 packs SYNTHED; MENU-05 density note; evidence `po-eco-tc-synth-wave-b-01.md` |
| 2026-08-03 | **§9 Wave B-DELTA synth** — 381 depth TC rollup; 8 packs SYNTHED; BUILD_GAP-MD-PANEL-01; evidence `po-eco-tc-synth-wave-b-delta-01.md` |
| 2026-08-03 | **§10 Wave C synth** — 156 depth TC rollup; 4 packs SYNTHED; Login↔CC-HOME neo-map; evidence `po-eco-tc-synth-wave-c-01.md` |
| 2026-08-03 | **§11 Wave C-DELTA synth** — 98 depth TC rollup; 3 stub packs SYNTHED; RST/MOB-OPS/MOB-JRN dedupe; evidence `po-eco-tc-synth-wave-c-delta-01.md` |
| 2026-08-03 | **§1 PROGRAM-STATUS** — executive catalog vs execution: depth **1494** / **1375** unique / **28** packs vs spine **53** (EVIDENCED **16** unchanged); UAT/Phase1 **NOT DONE**; evidence `po-eco-tc-program-status-01.md` |
| 2026-08-03 | **§12 U84 SYNTH-WF-CAT** — 99 matrix TC; packs **31**; claimed **1593** / unique **1473**; LOCK/SPEC_GAP neo-map; evidence `po-eco-tc-synth-wf-cat-01.md`; UAT **NOT DONE** |
| 2026-08-03 | **§12.4 U78 Primary P-LEAVE@CO-DL** — TC-HIM-LEAVE-DL-HP/AP **BLOCKED** env (0 employees); L1 holding FE chain supporting; evidence `u78-u84-primary-leave-dl-01.md`; **not** EVIDENCED; UAT **NOT DONE** |
| 2026-08-03 | **§12.4 U78 Primary P-REC-PLAN@CO-TMDV** — TC-HIM-REC-PLAN-TMDV-HP/AP **EVIDENCED**; evidence `u78-u84-primary-rec-plan-tmdv-01.md`; UAT **NOT DONE** |
| 2026-08-03 | **§12.4 U78 Primary P-REC-PLAN@CO-TMDV** — TC-HIM-REC-PLAN-TMDV-HP/AP **EVIDENCED**; evidence `u78-u84-primary-rec-plan-tmdv-01.md`; UAT **NOT DONE** |
| 2026-08-04 | **§12.4 U78 Primary P-REC-REQ@CO-TMDV** — TC-HIM-REC-REQ-TMDV-HP/AP **BLOCKED** (JD `HRM-REC-JD-POS` picker≠assert); evidence `u78-u84-primary-rec-req-tmdv-01.md`; **not** EVIDENCED; UAT **NOT DONE** |
| 2026-08-04 | **§12.4 U78 Primary P-ATT-ADJ@CO-TMDV** — TC-HIM-ATT-TMDV-HP **FAIL** (FE HH:mm → TIMESTAMPTZ 500); AP blocked upstream; evidence `u78-u84-primary-att-adj-tmdv-01.md`; **not** EVIDENCED; UAT **NOT DONE** |
| 2026-08-04 | **§12.4 U78 R1 Primary P-REC-REQ@CO-TMDV** — TC-HIM-REC-REQ-TMDV-HP/AP **EVIDENCED** after D-U84 JD catalog assert; evidence `u78-u84-primary-rec-req-tmdv-01-r1.md`; UAT **NOT DONE** |
| 2026-08-04 | **§12.4 U78 Primary P-REC-PIPE@CO-TMDV** — TC-HIM-REC-PIPE-TMDV-HP/AP **EVIDENCED**; FE WF preset + candidate pipeline + Inbox intake; FD GPLX SPEC_GAP; evidence `u78-u84-primary-rec-pipe-tmdv-01.md`; UAT **NOT DONE** |
| 2026-08-04 | **§12.4 U78 R1 Primary P-ATT-ADJ@CO-TMDV** — time-wire create **201** ISO OK; HP F5 CEO FAIL (list slug/UUID); AP mgr Duyệt **409** scope; evidence `u78-u84-primary-att-adj-tmdv-01-r1.md`; **not** EVIDENCED; UAT **NOT DONE** |
| 2026-08-04 | **§12.4 U78 Primary P-CAT-EXT@CO-DL** — TC-HIM-CAT-DL-HP/HOLD-AP **EVIDENCED**; FE WF + apply `HRM-SET-209`+wi + gov `XBOS-CAT-201`; stamp PARTIAL P2; evidence `u78-u84-primary-cat-ext-dl-01.md`; UAT **NOT DONE** |
| 2026-08-04 | **§12.4 U78 R2 Primary P-ATT-ADJ@CO-TMDV** — TC-HIM-ATT-TMDV-HP/AP **EVIDENCED** after FE header + BE list scope; create→F5 pending · mgr Duyệt **201** `x-company-id=trsport`; evidence `u78-u84-primary-att-adj-tmdv-01-r2.md`; UAT **NOT DONE** |
| 2026-08-04 | **§12.5 U84-PRIMARY-EXEC-ROLLUP-01** — HIM §2 stamp: EVIDENCED **5/7** · BLOCKED-EXTERNAL leave@DL · OPEN VISUN REC-REQ; 10 Primary TC-IDs EVIDENCED; design ≠ UAT; evidence `u84-primary-exec-rollup-01.md`; UAT **NOT DONE** |
| 2026-08-04 | **§12.5 R2 U84-PRIMARY-EXEC-ROLLUP-R2** — QC GWC honesty: EVIDENCED **6/7** · OPEN **0** · leave EXTERNAL · **12** Primary TC-IDs; VISUN U78 pair on disk; evidence `u84-primary-exec-rollup-r2.md`; UAT **NOT DONE** |

---

*PO-SPEC-TEST-REPORT-v1 · U84-PRIMARY-EXEC-ROLLUP-R2 · Wave A+B+B-DELTA+C+C-DELTA+U84 synth · Primary exec 6/7 · UAT NOT DONE*
