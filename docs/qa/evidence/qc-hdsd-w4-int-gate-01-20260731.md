# QC Gate — HDSD W4 Integration L3 (`QC-HDSD-W4-INT-GATE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-W4-INT-GATE-01` |
| **program** | `HDSD-P2-FULL-01` / `HDSD-W4-INTEGRATION` |
| **parent condition** | `C-P2-05` (W4 integration) |
| **gate_type** | L3 QC — post `QA-HDSD-W4-INT-03-R4` |
| **auditor** | QC |
| **date** | 2026-07-31 |
| **portal** | `http://127.0.0.1:5173` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **policy** | U65 zero-seed · browser harness · no seed |
| **ack_status** | PASS_TO_PM |

## Verdict

**GO WITH CONDITIONS** — W4 integration slice **closed** at **3/3 🟢** (`TC-ECO-INT-01` catalog publish/pull · `TC-ECO-INT-02` headcount parity · `TC-ECO-INT-03` HRM leave → CC workflow inbox full U65 chain). **C-P2-05 W4 integration condition CLOSED** for these three TCs.

**NOT in this gate scope:** Phase 2 DONE · PNG/PDF deliverables (C-P2-01..02) · W3 Mobile CH12 · W5 member CEO · Phase 1 DONE · PROD-READY · full 360-TC matrix body promotion.

---

## Evidence polled (QA intake)

| Artifact | Pack verify | QC audit |
|----------|-------------|----------|
| `qa-hdsd-w4-int-03-r4-20260731.md` | **8/8 PASS** | ✅ INT-03 full chain; handoff complete |
| `hdsd-uat-w4-20260730.md` | **8/8 PASS** | ✅ INT-01/02/03 overlay updated 🟢 |
| `_tmp-qa-hdsd-w4-int-03-r4-runtime.json` | — | ✅ Runtime matches QA MD (`overall: PASS`) |
| `HDSD_SRS_TESTCASE_MATRIX.md` § overlay + rows | — | ✅ W4 line + TC-ECO-INT-01..03 all 🟢 |
| Prior `qc-hdsd-full-w0-w4-20260730.md` | — | ✅ Acknowledged — INT-03 was 🟡 soft at W0–W4 gate; **promoted** by R4 |

---

## TC audit (entry criteria)

| TC ID | UF / FR | Verdict | Key evidence |
|-------|---------|---------|--------------|
| **TC-ECO-INT-01** | UF-HRM-10 · FR-UC-XBOS-CAT-01 | 🟢 PASS | Catalog governance + HRM settings pull **200**; no Sync ERROR |
| **TC-ECO-INT-02** | UF-HRM-MENU-15 · FR-UC-HRM-CO-01 · J-HRM-CO-01 | 🟢 PASS | Headcount summary **200** + org dashboard cross-nav |
| **TC-ECO-INT-03** | UF-XBOS-08 · UF-HRM-09 · FR-UC-XBOS-WF-01 | 🟢 PASS | U65 leave **POST 201** `HRM-LEAVE-201` · non-null `workflow_instance_id` · WF task match · CC inbox **Nghỉ phép** cards |

### INT-03 independent runtime cross-check (QC)

| Check | QA MD | Runtime JSON | QC |
|-------|-------|--------------|-----|
| `leavePost201` | PASS | POST 201 · id `a28a2178-…` | ✅ |
| `workflowInstanceId` | PASS | `1c6221e8-…` in 201 body | ✅ |
| `wfHitForLeave` | PASS | task `9f92788d-…` · `business_id` + `instance_id` match | ✅ |
| `wfTasksNet200` | PASS | browser GET wf/tasks **200** on inbox nav | ✅ |
| `ccInboxTaskCard` | PASS | 9 cards · `hasLeave: true` | ✅ |
| `TC_ECO_INT_03` / `overall` | PASS | PASS | ✅ |

**Closed residuals (R3 → R4):** R-W4-INT-03-INBOX-UI · R-W4-INT-03-INBOX-NET · R-W4-INT-03-WF · R-W4-INT-03-WF-RESP

---

## L2.5 journey (U19)

| Journey | Verdict | Note |
|---------|---------|------|
| **WF cross-product** (HRM mutate → CC `/command-center/inbox`) | 🟢 PASS | INT-03 promotes inbox cross-nav vs prior W0–W4 🟡 |
| **J-HRM-CO-01** (headcount → org dash) | 🟢 PASS | INT-02 |
| **J-XBOS-01** inbox pattern | 🟢 extended | CC inbox panel + task cards after HRM leave |

**Deferred:** J-MOB-* (W3) · member CEO negative (W5) · full `PROGRAM_JOURNEY_MAP` sweep — out of bounded W4 integration gate.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS** | All three W4 integration TCs 🟢; U65 FE mutate → 2xx → inbox visible; no 409 scope on exercised paths |
| **ENV / transient** | `R-W4-HRM-STABILITY` HRM `:28001` ECONNREFUSED between harness runs (P2) · `R-W4-RATE-429` login rate limit on rapid harness (P2) · QC `qc:dev-stack` all **200** then Node UV exit crash on Windows — **not elevated** |
| **P3 hygiene** | 9 pending `hrm_leave` inbox cards from prior QA runs — does not block INT-03 for created leave id |
| **PROGRAM (out of slice)** | C-P2-01 PNG · C-P2-02 PDF · C-P2-03 W2a doc · C-P2-04 mobile · C-P2-06 matrix body · C-P2-07 mutate batch |

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hdsd-w4-int-03-r4-20260731.md` | **0** | PASS 8/8 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/hdsd-uat-w4-20260730.md` | **0** | PASS 8/8 |
| Read `_tmp-qa-hdsd-w4-int-03-r4-runtime.json` | — | PASS — all verdict keys PASS |
| `pnpm run qc:dev-stack` | crash after checks | **Functional PASS** — HRM/XBOS/portal **200**; Windows UV_HANDLE_CLOSING on exit only |

---

## Conditions (GWC — not NO-GO)

| ID | Item | Sev | Owner | Trigger |
|----|------|-----|-------|---------|
| **C-W4-ENV-01** | HRM API intermittent down between harness batches | P2 | devops | consecutive QA FAIL L0 |
| **C-W4-ENV-02** | Login 429 on rapid Puppeteer reruns | P2 | qa spacing / devops | rate-limit policy |
| **C-W4-HYG-01** | Accumulated pending leave inbox cards (9) from prior U65 runs | P3 | qa hygiene / optional cleanup script | sponsor UAT demo prep |
| **C-PROGRAM** | Phase 2 PNG/PDF/mobile/matrix still open | P0 program | PM parallel recovery | `QC-HDSD-P2-GATE-01-R3` |

**QC ruling:** No product reopen for W4 integration slice. **No Dev dispatch** required for INT-01/02/03.

---

## Matrix confirmation

| TC ID | Matrix row | Status |
|-------|------------|--------|
| TC-ECO-INT-01 | line 420 | 🟢 confirmed |
| TC-ECO-INT-02 | line 421 | 🟢 confirmed |
| TC-ECO-INT-03 | line 422 | 🟢 confirmed |
| W4 overlay | line 19 | 🟢 all three + R4 evidence cite |

---

## Handoff

**completion_report:** L3 audit after `QA-HDSD-W4-INT-03-R4` PASS. Evidence packs 8/8 on R4 + consolidated W4 UAT. Runtime JSON independently confirms POST 201 + WF bind + CC inbox UI. **GO WITH CONDITIONS** — W4 integration **3/3 🟢**; **C-P2-05 CLOSED** for catalog/headcount/WF cross-product. P2 ENV + P3 inbox hygiene remain Info/conditions only. NOT Phase 2 DONE.

**next_owner:** PM

**next_dispatch_prompt:**
```
work_item_id: HDSD-P2-RECOVERY-CONT-01
program: HDSD-P2-FULL-01
from_role: pm | to_role: parallel execution

Context: QC-HDSD-W4-INT-GATE-01 GWC — C-P2-05 W4 integration CLOSED (TC-ECO-INT-01..03 🟢). Prior QC-HDSD-P2-GATE-01-R3 GWC web still open on mobile/PNG/PDF.

Continue in-flight (do not duplicate W4 INT):
- QA-HDSD-MOB-CH12-01-R4 (qa-device) — J-MOB + 8 PNG
- QA-HDSD-MUTATE-RET-03-HRM — TC 05-08
- QA-HDSD-W2A-SCOPE-PARITY-01-R2

When mobile + mutate waves PASS → QC-HDSD-P2-GATE-01-R4 re-gate for Phase 2 doc/program closure.

U65 zero-seed · browser-only acceptance
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-w4-int-gate-01-20260731.md`

**ack_status:** PASS_TO_PM

**pm_dispatch_hint:** Mark `C-P2-05` CLOSED on bus; `TEAM_WORKING_NOW` QC-HDSD-W4-INT-GATE-01 → CLOSED; no re-run INT-03 unless regression on inbox FE
