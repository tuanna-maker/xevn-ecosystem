# P1-PHASE1-QC-PRE-CLOSE — Phase 1 closure gate audit (G1–G8)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QC-PRE-CLOSE` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **gate_scope** | `PHASE1_CLOSURE_REMAINING.md` exit criteria G1–G8 |
| **decision** | **NO-GO — Phase 1 DONE** · **GO WITH CONDITIONS (program slice)** — localhost + nip.io pilot promotable for sponsor UAT; not PROD-READY |
| **phase1_done_claim** | **EXPLICITLY DENIED** |
| **prod_ready_claim** | **DENIED** |
| **ack_status** | **PASS_TO_PM** |
| **portal_url** | http://localhost:5173 (sponsor UAT) |
| **api_base** | https://14-225-217-232.nip.io (mobile pilot) |

---

## Executive verdict

| Question | QC answer |
|----------|-----------|
| Claim **Phase 1 DONE**? | **NO** — G7 sponsor sign-off open; W7 scope open; G8 ILA 9/10; program backlog `pm:scan` exit **2** |
| Claim **PROD-READY**? | **NO** — nip.io pilot only; `SERVICE_READINESS` PROD columns unchanged |
| Sponsor **demo/UAT** @ nip.io + localhost pack? | **YES (GWC)** — G1–G2 PASS; G3/G4/G6/G8 bounded GWC; G4 partner slice consolidated |
| Unconditional partner-ready? | **NO** — CheckIn ILA carry, MOB-UX-15d, 13e persona deferred |

**Program posture:** Automated gates **~85–90% closed with documented GWC**. Remaining blockers are **human sign-off (G7)**, **W7 mobile backlog**, **ILA 10/10 partner polish**, and **carry waves** — not a single P0 slug/API class on default journeys @ nip.io.

---

## Evidence audited (mandatory chain)

| Artifact | Role | Prior ack | QC audit |
|----------|------|-----------|----------|
| [`p1-g3-g6-ecosystem-r2-20260609.md`](p1-g3-g6-ecosystem-r2-20260609.md) | QA | FAIL_TO_PM | G3 pilot **PASS**; G6 pre-R3 **GWC**; local J-HRM 4/7 **GWC** |
| [`qc-mob-partner-01-20260609.md`](qc-mob-partner-01-20260609.md) | QC | PASS_TO_PM | G4 **GWC bounded GO**; ILA 9/10; J-MOB batch GWC |
| [`p1-l0-w6-pack-20260609.md`](p1-l0-w6-pack-20260609.md) | DevOps | PASS_TO_PM | G1 L0 + fe-be-health **PASS**; W6 pack delivered |
| [`mob-parity-01-r3-20260609.md`](mob-parity-01-r3-20260609.md) | QA | PASS_TO_PM | G6 R3 **28/32 + 4 GWC**; MP-19 **CLOSED**; MP-01 **CLOSED** nip.io |

**Cross-check:** `pnpm run verify:product:completion` → **exit 0** (W1–W3 PASS; `qc-dev-stack` + `pm-scan-backlog` **SKIP** on audit machine — not a product FAIL).

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-phase1-pre-close-20260609.md
# QC self-audit target: 8/8 (this file)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-mob-partner-01-20260609.md
# exit 0 — 8/8

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-g3-g6-ecosystem-r2-20260609.md
# exit 1 — 7/8 (residual section naming); QC opened MD — process GWC

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-l0-w6-pack-20260609.md
# exit 1 — 2/8 (DevOps L0 pack — no J-matrix); QC audited L0 logs — acceptable for G1 only

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-parity-01-r3-20260609.md
# exit 1 — 6/8 (no J-* rows); QC audited probe JSON + slug 4/4 — acceptable for G6
```

**QC adjudication:** Pre-close gate consolidates **multiple upstream packs**. Format gaps on QA/DevOps files are **process GWC** — not product NO-GO when QC cross-opened artifacts and spot-checked commands below.

**QC independent spot-checks (2026-06-09):**

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:product:completion` | **0** | W1–W3 PASS; 0 required FAIL |
| `pnpm run pm:scan:backlog` | **2** | 1 dispatch required (`MOB-UX-14-R7`); 12 in-flight |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-mob-partner-01-20260609.md` | **0** | 8/8 |

---

## Classification (ENV vs PRODUCT vs PROGRAM)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 `qc:dev-stack` PASS @ audit (28001/28002/5173) | ENV | **PASS** — cites `p1-l0-w6-pack` |
| nip.io pilot API + APK SHA `C152EDD6…` | ENV | **PASS** |
| `verify:product:completion` SKIP `qc-dev-stack` on some runners | ENV | **GWC** — re-run before PROD cutover |
| Local J-HRM-05..07 500 (candidates, employee from att/payroll) | PRODUCT / seed | **GWC** — not on nip.io pilot; `P1-G3-LOCAL-JHRM-01` P2 |
| G6 MP-11/14/16/17 probe GWC | PRODUCT / scope | **GWC** — documented waivers; not partner P0 |
| G8 CheckIn ILA 15/20 | PRODUCT / UX | **GWC carry** — `R3-CHECKIN-FAB-01` |
| MOB-UX-15d `update_type` raw copy | PRODUCT | **OPEN P1** |
| MOB-UX-13e/f/g persona device | PRODUCT | **DEFERRED** — out of bounded G4 |
| **PCOMP-W6-SP-01** sponsor browser UAT | **PROGRAM** | **BLOCKS Phase 1 DONE** |
| W7 leave-doc / leave-bal / profile-full `[ ]` | **PROGRAM** | **BLOCKS full mobile SRS closure** |
| PROD deploy / security / backup | **PROGRAM** | **BLOCKS PROD-READY** |

**Product NO-GO avoided:** No open **P0 sponsor screenshot class** on default partner ESS @ canonical APK + nip.io after MOB-UX-15/16/17 + parity R3 chain.

---

## Gate-by-gate audit (G1–G8)

| Gate | Criterion | Evidence | QC status | Blocks DONE? |
|------|-----------|----------|-----------|--------------|
| **G1** | `verify:product:completion` exit 0 + L0 up | `p1-l0-w6-pack`: `qc:dev-stack` **0**, `qc:fe-be-health:pilot` **13/13**; `verify:product:completion` **0** | **PASS (GWC)** — completion script SKIP L0 on some hosts | No — re-run L0 before PROD |
| **G2** | L1 `test:system:uat` exit 0 | `p1-g3-g6`: **37/0** `system-integration-uat-report.json` | **PASS — CLOSED** | No |
| **G3** | L2 P-CC 13/13 + L2.5 J-HRM/J-MOB | `p1-g3-g6`: nip.io **23/23 L2**, **7/7 J-HRM**; local J-HRM **4/7**; J-MOB batch GWC per `qc-mob-partner-01` | **GWC — CLOSED pilot** | No for pilot; local parity optional |
| **G4** | Mobile partner slice QC GO | `qc-mob-partner-01`: **GWC bounded GO**; consolidates 15/16/17 + J-MOB + parity spot | **GWC — CLOSED (bounded)** | No for demo; yes for unconditional partner |
| **G5** | `test:hrm-mobile` + `test:mobile:user-copy` | Program **429/429**; QC spot `test:mobile:user-copy` **0** | **PASS — CLOSED** | No |
| **G6** | Ecosystem parity mobile↔web↔API | `mob-parity-01-r3`: **28/32** strict + **4 GWC**; slug **4/4**; MP-19 **CLOSED**; MP-01 **CLOSED** | **GWC — CLOSED** | No for partner slice; `P1-G6-FIELD-02` open P2 |
| **G7** | Sponsor `PCOMP-W6-SP-01` sign-off | `pcomp-w6-uat-session-pack-20260609.md` ready; verdict **unsigned** | **OPEN — BLOCKER** | **YES** |
| **G8** | ILA ≥16/20 + `verify:mobile:layout` | `qc-mob-partner-01` + ILA R3: **9/10 ≥16**, avg **~16.3**; layout gate PASS | **GWC — MET threshold** | No for GWC program; yes for 10/10 unconditional |

---

## What is GWC CLOSED (promotable slices)

| Slice | Gate(s) | Evidence | QC promotion |
|-------|---------|----------|--------------|
| Localhost L0 + P-CC L2 | G1 | `p1-l0-w6-pack` | **PROMOTED** for sponsor browser session |
| API integration L1 | G2 | `p1-g3-g6` §2 | **PROMOTED** |
| nip.io CC + HRM embed L2 + J-HRM L2.5 | G3 | `p1-g3-g6` §3–4 nip.io | **PROMOTED** |
| Mobile unit + user-copy | G5 | program + QC spot | **PROMOTED** |
| Partner ESS @ nip.io (bounded) | G4 | `qc-mob-partner-01` | **PROMOTED (GWC)** — demo/UAT APK `C152EDD6…` |
| G6 parity P0 slug + MP-19 + MP-01 | G6 | `mob-parity-01-r3` | **PROMOTED (GWC)** — 4 probe waivers documented |
| ILA partner average ≥16 | G8 | ILA R3 scorecard | **PROMOTED (GWC)** — CheckIn 15 carry |
| W1–W3 product completion scripts | Program | `verify:product:completion` | **PROMOTED** |

---

## What BLOCKS claiming Phase 1 DONE

| # | Blocker | Class | work_item_id | Owner |
|---|---------|-------|--------------|-------|
| **B1** | Sponsor human UAT not signed | PROGRAM | `PCOMP-W6-SP-01` | sponsor |
| **B2** | W7 mobile SRS rows open (leave-doc, leave-bal, profile-full, directory) | PROGRAM | `PCOMP-W7-MOB-LEAVE-DOC`, `PCOMP-W7-MOB-LEAVE-BAL`, `PCOMP-W7-MOB-PROFILE-FULL`, `PCOMP-W7-MOB-DIRECTORY` | dev-mobile / dev-be |
| **B3** | ILA 9/10 not 10/10 (CheckIn FAB) | PRODUCT GWC | `R3-CHECKIN-FAB-01` / `MOB-UX-16d` | dev-mobile |
| **B4** | MOB-UX-15d sanitization open | PRODUCT P1 | `MOB-UX-15d` | dev-mobile |
| **B5** | MOB-UX-13e/f/g persona device deferred | PRODUCT P1 | `MOB-UX-13-EFG-QA` | qa-device |
| **B6** | G6 field alias `request_type` / MP-14 | PRODUCT P2 | `P1-G6-FIELD-02` | dev-be |
| **B7** | Local J-HRM-05..07 parity (optional strict) | PRODUCT P2 | `P1-G3-LOCAL-JHRM-01` | dev-be |
| **B8** | `pm:scan:backlog` exit **2** — pipeline not idle | PROCESS | `MOB-UX-14-R7` + 12 in-flight | pm → qa |
| **B9** | PROD-READY lane (deploy, security, backup) | PROGRAM | W5/W6 PROD wave | devops / qc |
| **B10** | Unconditional partner-ready denied | QUALITY | carry list in `qc-mob-partner-01` §Consolidated carry | multi |

**QC rule:** Bounded GWC slices **do not** satisfy program exit. Sponsor must not interpret «G4 GWC» or «G6 GWC» as «Phase 1 xong».

---

## L2.5 journey coverage (U19)

| Journey set | Environment | Coverage | QC |
|-------------|-------------|----------|-----|
| J-HRM-01..07 | nip.io | **7/7 PASS** | **PROMOTED** |
| J-HRM-05..07 | localhost | **FAIL** (500) | **GWC** — not pilot blocker |
| J-MOB partner slice | nip.io device | 8 PASS + 3 GWC per `qc-mob-partner-01` | **GWC PROMOTED** |
| J-MOB-36..38 persona | — | **NOT RUN** | **DEFERRED** — blocks «tier-1 persona» claim only |

**L2.5 compliance:** Pre-close gate **does not** NO-GO on HTTP-only evidence for mobile — partner gate cites device adb chain. Web sponsor pack (`PCOMP-W6-SP-01`) requires browser J-HRM clicks — separate from mobile G4.

---

## Residual

| ID | Item | Sev | Owner | Blocks DONE? |
|----|------|-----|-------|--------------|
| R-P1-G7 | Sponsor `PCOMP-W6-SP-01` unsigned | Program | sponsor | **YES** |
| R-P1-W7 | W7 mobile leave-doc / bal / profile / directory | Program | dev-* | **YES** (full SRS) |
| R-P1-ILA | CheckIn ILA 15/20 FAB | P1 | dev-mobile | GWC only |
| R-P1-15D | `update_type` raw tokens | P1 | dev-mobile | GWC only |
| R-P1-13E | Persona/swipe/culture device | P1 | qa-device | GWC only |
| R-P1-G6-F02 | MP-14 `request_type` alias | P2 | dev-be | No |
| R-P1-LOCAL | Local J-HRM-05..07 500 | P2 | dev-be | No (pilot) |
| R-P1-PIPE | `MOB-UX-14-R7` READY_FOR_QA undispatched | P1 | pm → qa | Process |
| R-P1-PROD | PROD column 🔴 | Program | devops/qc | **YES** (PROD claim) |

---

## PM dispatch queue (explicit — no sponsor questions)

Execute in priority order; PM **Task** same session — do not ask sponsor to choose wave.

| Priority | work_item_id | Owner | Action |
|----------|--------------|-------|--------|
| **P0** | `PCOMP-W6-SP-01` | sponsor | Deliver session pack `docs/program/evidence/pcomp-w6-uat-session-pack-20260609.md`; collect UAT-PASS/FAIL on bus |
| **P0** | `MOB-UX-14-R7` | qa | Intake READY_FOR_QA from bus — home responsive R7 retest |
| **P1** | `R3-CHECKIN-FAB-01` / `MOB-UX-16d` | dev-mobile | Hide FAB on focused CheckIn → ILA ≥16 |
| **P1** | `MOB-UX-15d` | dev-mobile | Close `update_type` sanitization |
| **P1** | `MOB-UX-13-EFG-QA` | qa-device | Persona/swipe/culture before «tier-1» claim |
| **P1** | `PCOMP-W7-MOB-LEAVE-DOC` | dev-mobile + dev-be | W7 SRS closure |
| **P1** | `PCOMP-W7-MOB-LEAVE-BAL` | dev-be + dev-mobile | W7 SRS closure |
| **P1** | `PCOMP-W7-MOB-PROFILE-FULL` | dev-mobile | W7 SRS closure |
| **P2** | `P1-G6-FIELD-02` | dev-be | MP-14 `request_type` alias or mobile `service_type` doc |
| **P2** | `P1-G3-LOCAL-JHRM-01` | dev-be | Local candidates 500 + employee GET from att/payroll |
| **P3** | `P1-PHASE1-CLOSE-WAVE-02` | qc | Re-gate after G7 verdict + W7 carry reduction |

**Update artifacts after dispatch:** `PHASE1_CLOSURE_REMAINING.md` G4 → **GWC PASS**; G6 → **GWC CLOSED**; G7 → await sponsor; `PROJECT_STATUS_REPORT.md`.

---

## Program statements

- **Phase 1 DONE:** **DENIED** — G7 open + W7 backlog + pipeline idle scan + PROD lane.
- **PROD-READY:** **DENIED** — pilot environment only.
- **Sponsor UAT session:** **READY** — localhost pack + nip.io mobile APK documented.
- **Partner ESS demo:** **GO WITH CONDITIONS (bounded)** — per `qc-mob-partner-01`; consolidates G4/G6/G8 GWC.
- **Strict G1–G8 unconditional:** **NOT MET** — G3 local, G4/G6/G8 carry, G7 human gate.

---

## Handoff

```yaml
completion_report: >
  P1-PHASE1-QC-PRE-CLOSE audit complete. Audited p1-g3-g6, qc-mob-partner-01, p1-l0-w6-pack,
  mob-parity-01-r3. G1/G2/G5 PASS; G3/G4/G6/G8 GWC CLOSED on promotable slices; G7 PCOMP-W6-SP-01
  BLOCKS Phase 1 DONE. W7 mobile + carry waves (CheckIn FAB, 15d, 13e) remain. verify:product:completion
  exit 0; pm:scan exit 2. Phase 1 DONE EXPLICITLY DENIED; sponsor UAT pack READY.
next_owner: pm
next_dispatch_prompt: >
  PM intake P1-PHASE1-QC-PRE-CLOSE PASS_TO_PM (NO-GO Phase 1 DONE, GWC program slice). Actions:
  (1) Route sponsor PCOMP-W6-SP-01 with docs/program/evidence/pcomp-w6-uat-session-pack-20260609.md
  + ceo@xe.vn / du-lich.ceo@xe.vn @ localhost:5173; mobile optional APK C152EDD6… @ nip.io.
  (2) Task qa MOB-UX-14-R7 (bus READY_FOR_QA undispatched). (3) Task dev-mobile R3-CHECKIN-FAB-01 +
  MOB-UX-15d. (4) Task qa-device MOB-UX-13-EFG-QA. (5) Continue W7 PCOMP-W7-MOB-LEAVE-DOC/BAL/PROFILE-FULL.
  (6) Update PHASE1_CLOSURE_REMAINING G4=GWC PASS, G6=GWC CLOSED. Do NOT claim Phase 1 DONE until
  PCOMP-W6-SP-01 UAT-PASS + W7 closure or PM waiver register. Evidence:
  docs/qa/evidence/qc-p1-phase1-pre-close-20260609.md
evidence_path: docs/qa/evidence/qc-p1-phase1-pre-close-20260609.md
ack_status: PASS_TO_PM
pm_dispatch_hint: NO-GO DONE — sponsor PCOMP-W6-SP-01 first; qa MOB-UX-14-R7; dev-mobile CheckIn+15d; W7 batch
```
