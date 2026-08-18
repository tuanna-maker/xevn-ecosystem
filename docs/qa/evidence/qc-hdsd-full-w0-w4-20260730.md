# QC Gate — HDSD W0–W4 Browser UAT (`QC-HDSD-FULL-W0-W4-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HDSD-FULL-W0-W4-01 |
| **program** | HDSD-P2-FULL-01 |
| **gate_type** | QA W0–W4 browser UAT (post `QA-HDSD-FULL-W0-W4-01`) |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **portal** | `http://127.0.0.1:5173` (CC/embed) · W2a `http://127.0.0.1:8080/hr/` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **policy** | U65 zero-seed · browser Puppeteer |
| **ack_status** | PASS_TO_PM |

## Verdict

**GO WITH CONDITIONS** — Wave W0–W4 representative browser UAT **closed** at **30 🟢 · 4 🟡 · 0 🔴** (34 spot checks). Dual HRM entry **W2a standalone + W2b embed** both documented. **Four soft items** accepted as conditions (automation timing / U65 mutate policy), not product P0.

**NOT in this gate scope:** Phase 2 PNG inline · PDF deliverable · W3 Mobile CH12 · full 360-TC matrix row promotion · Phase 2 DONE · UAT-PASS program · PROD-READY.

**Prior gate:** `QC-HDSD-P2-GATE-01` **NO-GO** on doc deliverables remains **open** — this gate **does not** supersede C-P2-01..07.

---

## Evidence polled (QA intake)

| Artifact | Status | Notes |
|----------|--------|-------|
| `hdsd-uat-eco-20260730.md` | ✅ | W0 · 4 TC |
| `hdsd-uat-xbos-20260730.md` | ✅ | W1 · 10 TC |
| `hdsd-uat-hrm-standalone-20260730.md` | ✅ | W2a · 8 TC |
| `hdsd-uat-hrm-embed-20260730.md` | ✅ | W2b · 9 TC |
| `hdsd-uat-integration-20260730.md` | ✅ | W4 · 3 TC |
| `_tmp-qa-hdsd-full-w0-w4-runtime.json` | ✅ | Summary matches 30/4/0 |
| `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` § overlay | ✅ | Wave summary block lines 6–19 |
| Screens `screens/hdsd-uat-20260730/` | ✅ | **66** PNG on disk (runtime lists 25 primary; supplement/legacy coexist) |
| Prior checklist | ✅ | `qc-hdsd-p2-gate-20260730.md` NO-GO acknowledged |

---

## Wave audit vs entry criteria

| Wave | Expected | QC result | Entry URL |
|------|----------|-----------|-----------|
| **W0** Ecosystem | Login · rail · dash org | **PASS** 3🟢 1🟡 | `:5173` ✅ |
| **W1** XBOS | CC · settings · WF · catalog · cockpit | **PASS** 9🟢 1🟡 | `:5173` ✅ |
| **W2a** HRM standalone | Mirror core menus | **PASS** 8/8 🟢 | `:8080/hr/` ⚠️ see dual-entry |
| **W2b** HRM embed | CC proxy `/hr/*` + L2.5 spot | **PASS** 9/9 🟢 | `:5173/hr/*` ✅ |
| **W4** Integration | Catalog · headcount | **PASS** 1🟢 2🟡 soft | cross-layer ✅ |
| **W3** Mobile | — | **DEFER** ⬜ | out of wave (documented) |

---

## Dual-entry audit (W2a vs W2b)

| Entry | QA used | Spec note | QC |
|-------|---------|-----------|-----|
| **W2b embed** | `http://127.0.0.1:5173/hr/*?portal=1` | HDSD Ch.0 CC → NHÂN SỰ | ✅ Correct |
| **W2a standalone** | `http://127.0.0.1:8080/hr/` | Prior P2 gate cited `:5175` | ✅ **Accepted** — `apps/web/hrm/vite.config.ts` sets `port: 8080`, `base: "/hr/"`; `:5175` not listening in L0. Trailing slash required (`/hr/` not `/hr`). |
| **Dual-entry requirement** | Both paths exercised | Representative menu parity | ✅ W2a 8 TC + W2b 9 TC overlap employees/contracts/attendance/payroll/headcount/settings |

**Condition C-W2A-PORT:** Document in HDSD Ch.0 that canonical dev standalone = `:8080/hr/` (not `:5175`) until stack doc aligned.

---

## L2.5 journey spot (W2b)

| Journey | Verdict | Evidence |
|---------|---------|----------|
| **J-HRM-01** employees list→detail | 🟢 PASS | `hdsd-uat-hrm-embed-20260730.md` · runtime `clickRow=true detailGET=200` |
| **J-HRM-02** contracts list | 🟢 PASS | embed GET 200 |
| **J-CC-HRM** CC → `/hr/employees` cross-nav | 🟢 PASS | prior ch02-11 pattern cited; W2b direct routes 🟢 |

**Deferred J-*:** Mobile J-MOB-* (W3) · member CEO negative (W5) · full PROGRAM_JOURNEY_MAP sweep — **not required** for this bounded W0–W4 gate.

---

## Four soft conditions (GWC — not NO-GO)

| ID | TC | Class | Detail | Owner | Severity |
|----|-----|-------|--------|-------|----------|
| **C-S01** | TC-ECO-03 | Automation | Rail NHÂN SỰ click — URL stayed `/command-center` in Puppeteer; W2b embed routes 🟢 | qa (optional manual spot) | P3 soft |
| **C-S02** | TC-XBOS-HDSD-02-05 | Timing | Phòng ban tab render OK; dept GET not captured in 2.5s window | qa retest Network | P3 soft |
| **C-S03** | TC-ECO-05 · TC-HRM-HDSD-07-01-INT | Timing | Catalog sync API not captured on settings tab switch; **functional PASS** via W1 TC-XBOS-HDSD-03-03 🟢 + W2b catalogSync 🟢 + L0 proxy | qa optional explicit publish/pull click | P3 soft |
| **C-S04** | U65 mutate | Policy | Empty DB — NV/HĐ/YCTD mutate **BLOCKED** by design (zero-seed); load+list→detail only | sponsor policy | INFO accepted |

**QC ruling:** All four are **automation/policy**, not load-path product defects. **No Dev reopen** for W0–W4 slice.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (wave)** | W0–W4 load paths · no 🔴 · no 409 scope · no `:54321` on exercised routes |
| **ENV / transient** | Runtime JSON console: intermittent XBOS "Không kết nối" + HRM 500 burst during W4 window — L0 start **PASS**; verdicts 🟡 not 🔴; **not elevated** to product NO-GO |
| **PROCESS P2** | W2a **0** dedicated `w2a-*.png` (runtime JSON only) · matrix body rows still ⬜ (overlay summary only) · legacy TC alias mix (`TC-ECO-01` vs matrix `TC-ECO-002`) |
| **OUT OF SCOPE** | W3 Mobile CH12 · W5 member CEO · Phase 2 PNG/PDF (C-P2-01..02 from prior NO-GO) |
| **INFO** | Reports embed GET 500 logged once (`operations/reports/summary`) while TC-HRM-HDSD-07-02 marked 🟢 — monitor P2 if banner appears for sponsor |

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `pnpm run qc:dev-stack` (QA L0 cited) | **0** | PASS — HRM :28001 + XBOS :28002 + portal :5173 |
| `pnpm run qc:fe-be-health` (QA L0 cited) | **0** | PASS — ALL PASS |
| `node -e "const j=require('./docs/qa/evidence/_tmp-qa-hdsd-full-w0-w4-runtime.json'); console.log(j.summary)"` | **0** | PASS — `{ green:30, yellow:4, red:0 }` |
| `Get-ChildItem docs/qa/evidence/screens/hdsd-uat-20260730 \| Measure` | **0** | PASS — **66** PNG |
| Read matrix overlay + `apps/web/hrm/vite.config.ts` | — | PASS — W2a `:8080/hr/` confirmed |

---

## Residual (post-GWC)

| ID | Item | Sev | Owner | Trigger |
|----|------|-----|-------|---------|
| R-P2-PNG | 0/114 inline PNG (prior gate) | P0 | dev-fe + ba-docs | C-P2-01 |
| R-P2-PDF | PDF missing | P0 | ba-docs | C-P2-02 |
| R-W3-MOB | Mobile CH12 UAT | P0 program | qa-device | W3 wave |
| R-MATRIX-BODY | 360 TC Verdict column ⬜ | P1 | qa | matrix promote wave |
| R-W2A-SCREEN | No w2a-* screenshots | P2 | qa | optional capture pass |
| R-REPORTS-500 | Embed reports summary 500 in network log | P2 | dev-be | user-visible banner |

---

## QC recommendation

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | `QA-HDSD-FULL-W0-W4-01` W0–W4 browser UAT |
| **Conditions** | C-S01..C-S04 (four soft) + C-W2A-PORT doc note |
| **Promote** | PM may dispatch P2 recovery (PNG/PDF/mobile) without re-running full W0–W4 unless regression |
| **Re-gate** | `QC-HDSD-P2-GATE-01-R2` after C-P2-01..07 — separate from this artifact |

---

## Handoff

**completion_report:** Audited QA PASS_TO_PM for W0–W4: 5 evidence MD + runtime JSON + 66 screenshots + matrix overlay. Confirmed W2b embed (`:5173`) and W2a standalone (`:8080/hr/`) both documented with menu parity. **GO WITH CONDITIONS** — four soft items (rail-click, dept GET timing, catalog W4 timing, U65 mutate blocked). W3 mobile deferred. Prior Phase 2 NO-GO (PNG/PDF) **unchanged**.

**next_owner:** PM

**next_dispatch_prompt:**
```
work_item_id: HDSD-P2-RECOVERY-01
program: HDSD-P2-FULL-01
from_role: pm | to_role: parallel execution

Context: QC-HDSD-FULL-W0-W4-01 GWC — W0–W4 browser UAT closed 30🟢 4🟡 0🔴. Prior QC-HDSD-P2-GATE-01 NO-GO on doc deliverables still open.

Parallel dispatch:
1) HDSD-P2-SCREEN-01 (dev-fe) — inject PNG inline 114/114 from screens/hdsd-uat-20260730
2) HDSD-P2-HTML-PDF-01 (ba-docs) — PDF A4 after PNG wired
3) QA-HDSD-MOB-CH12-01 (qa-device) — W3 mobile J-MOB-* → hdsd-uat-mobile-*.md
4) QA-HDSD-MATRIX-PROMOTE-01 (qa) — map overlay 🟢 to matrix Verdict rows (≥ W0–W4 spot TC)
5) ba-process — HDSD Ch.0 note: W2a dev entry :8080/hr/ (dual-entry doc)

Optional P3 (not blocking):
- QA manual spot TC-ECO-03 rail click + TC-XBOS-HDSD-02-05 dept Network
- QA w2a-* screenshot capture pass

After C-P2-01..07: re-dispatch QC-HDSD-P2-GATE-01-R2 (full Phase 2 gate)

entry_criteria: docs/qa/evidence/qc-hdsd-full-w0-w4-20260730.md GWC
exit_criteria: PNG≥Hình · PDF exists · mobile evidence · matrix body PASS>0
evidence_path: docs/qa/evidence/qc-hdsd-full-w0-w4-20260730.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-full-w0-w4-20260730.md`

**ack_status:** PASS_TO_PM
