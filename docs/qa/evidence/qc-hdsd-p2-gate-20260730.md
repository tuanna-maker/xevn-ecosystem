# QC Gate — HDSD Phase 2 Full (`QC-HDSD-P2-GATE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HDSD-P2-GATE-01 |
| **program** | HDSD-P2-FULL-01 (`P-HDSD-P2-FULL-01`) |
| **gate_type** | Phase 2 final — PNG inline · HTML/PDF · TC matrix · QA W0–W4 |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **ack_status** | PASS_TO_PM |

## Verdict

**NO-GO (partial audit)** — Phase 2 deliverables P2-1..P2-4 và QA W0–W4 **chưa đủ** để GO/GWC nghiệm thu Phase 2. Có tiến độ thực (matrix v2.0 · HTML draft · UAT embed partial) — **re-gate** sau khi đóng conditions P0 bên dưới.

**NOT:** Phase 2 DONE · HDSD client-ready · UAT-PASS · PROD-READY.

---

## Evidence polled

| Pattern | Found | Notes |
|---------|-------|-------|
| `docs/qa/evidence/hdsd-p*` | 0 | P2 screen-capture lane chưa publish evidence |
| `docs/qa/evidence/hdsd-uat-*` | 3 | `hdsd-uat-ch02-04` · `ch05-09` · `ch10-11` (20260730) |
| `_tmp-qa-hdsd-driven-uat-ch02-11-runtime.json` | 1 | 38 TC legacy IDs · 30🟢 · 8🟡 |
| `docs/client-delivery/hdsd/assets/**` | dir exists · **0 PNG** | P2-1 FAIL |
| `docs/client-delivery/hdsd/artifacts/**` | HTML only | P2-3 partial · P2-4 FAIL |

---

## Checklist audit

### 1. PNG count vs HDSD placeholder (inline, not appendix)

| Metric | Count |
|--------|-------|
| `[Hình …]` markers in MD | **114** |
| Explicit `placeholder Phase 2` | **20** |
| Inline `![…](assets/…)` in MD | **0** |
| PNG in `hdsd/assets/` | **0** |
| QA capture PNG (`screens/hdsd-uat-20260730/`) | **45** (not injected into MD) |

| Result | **NO-GO P0** — 0/114 inline images; captures exist but not wired per P2-1/P2-2 |

### 2. HTML + PDF A4 print QA

| Artifact | Status |
|----------|--------|
| `artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | **Present** (~387 KB) — A4 `@page` · `page-break-after` · `break-inside: avoid` on tables |
| `artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` | **Missing** |
| `<img>` in HTML | **2** (vs 114 Hình in source MD) |
| Formal print QA (page breaks / table split) | **Not recorded** |

| Result | **NO-GO P0** — PDF absent; HTML draft only; no print sign-off evidence |

### 3. TC matrix coverage ≥ inventory (`HDSD_ECOSYSTEM_INDEX`)

| Source | Value |
|--------|-------|
| Matrix version | v2.0 · `HDSD-P2-TC-MATRIX-01` · 30/07/2026 |
| Total TC rows | **360** (ECO 11 · XBOS 139 · HRM 177 · Mobile 33 · INT/W5 5) |
| Matrix PASS (🟢) | **0** (all ⬜) |
| HDSD § coverage | 16 content MD files mapped (per matrix § Coverage by chapter) |
| Inventory ref | ECO W0 · XBOS A1–A10 · HRM 17 menu · Mobile D1 |

| Result | **PASS structure / FAIL execution** — coverage ≥ inventory **on paper**; 0 TC promoted to matrix |

### 4. QA W1 XBOS + W2a/W2b HRM + mobile evidence

| Wave | Expected | Evidence | Result |
|------|----------|----------|--------|
| W0 ECO | TC-ECO-* | Partial in ch02-04 (login + rail) | 🟡 partial |
| W1 XBOS | UF-XBOS-01..15 · `xbos/*` | ch02-04: 13 TC · 10🟢 3🟡 · `:5173` CC/settings | 🟡 load-only; 3 BLOCKED |
| W2a HRM standalone | `:5175` | **None** | **NO-GO P0** |
| W2b HRM embed | `/command-center/hrm/*` | ch05-09 + ch10-11 via `:5173/hr?portal=1` · 31 TC load · 4 mutate 🟡 | 🟡 partial embed only |
| W3 Mobile | J-MOB-* · CH12 | **No `hdsd-uat` mobile file** | **NO-GO P0** |
| W4 Integration | Catalog · headcount · WF | **None** | **NO-GO P0** |

**QA honesty:** Legacy `TC-HDSD-*` IDs in UAT MD **not yet** back-mapped to `TC-XBOS-HDSD-*` / `TC-HRM-HDSD-*` matrix v2.0.

| Result | **NO-GO P0** — W2a · Mobile · W4 missing; W1/W2b partial only |

### 5. XBOS vs HRM docs separated

| Check | Result |
|-------|--------|
| Folder split `ecosystem/` · `xbos/` · `hrm/` | PASS |
| Separate indexes `HDSD_XBOS_INDEX` · `HDSD_HRM_INDEX` · `HDSD_ECOSYSTEM_INDEX` | PASS |
| Matrix prefixes `TC-XBOS-*` vs `TC-HRM-*` vs `TC-MOB-*` | PASS |
| Cross-ref only via ecosystem index (not merged prose) | PASS |

| Result | **PASS**

---

## Classification

| Class | Items |
|-------|-------|
| **P0 product/doc blockers** | P2-1 PNG inline 0/114 · P2-4 PDF missing · W2a standalone absent · Mobile CH12 UAT absent · W4 integration absent |
| **P1 process** | UAT evidence uses legacy TC IDs; matrix 360/360 ⬜; QA screenshots not in `hdsd/assets/` |
| **P2 conditions** | 8🟡 mutate BLOCKED (shareholder · NV create · HĐ · YCTD · leave POST 400) · HTML print QA · map UAT→matrix v2 |
| **INFO** | Prior governance gate `QC-HDSD-GATE-01` GWC still valid for Phase 1 MD; Phase 2 is separate scope |

**ENV:** L0 stack PASS in UAT ch02-04 (`qc:dev-stack` · `qc:fe-be-health` exit 0) — **not** elevated to product NO-GO.

---

## P0 conditions to re-gate (all required for GO)

| ID | Condition | Owner | Evidence path |
|----|-----------|-------|---------------|
| C-P2-01 | Capture + inject **114/114** inline PNG (`hdsd/assets/**` + `![](assets/…)` per `[Hình]`) | dev-fe + ba-docs | MD diff + asset dir |
| C-P2-02 | Generate **`HDSD_XEVN_ECOSYSTEM_v1.pdf`** + A4 print QA (tables/page breaks) | ba-docs | `artifacts/*.pdf` + spot note |
| C-P2-03 | QA **W2a** HRM standalone `:5175` — mirror W2b UF set | qa | `hdsd-uat-w2a-*` |
| C-P2-04 | QA **W3 Mobile** CH12 — `QA-HDSD-MOB-CH12-01` · J-MOB-* | qa-device | `hdsd-uat-mobile-*` |
| C-P2-05 | QA **W4** integration (catalog · headcount · WF cross-product) | qa | `hdsd-uat-w4-*` |
| C-P2-06 | Promote matrix v2.0: map UAT 🟢 → matrix `Verdict` column (≥ W1–W3 primary UF) | qa + ba-process | `HDSD_SRS_TESTCASE_MATRIX.md` |
| C-P2-07 | Close or document **8🟡** mutate BLOCKED with FE/BE owner + retest | dev-fe/dev-be → qa | updated `hdsd-uat-*` |

---

## Residual

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| R-P2-PNG | 0 inline images vs 114 placeholders | P0 | dev-fe |
| R-P2-PDF | PDF deliverable missing | P0 | ba-docs |
| R-P2-W2A | No standalone HRM UAT | P0 | qa |
| R-P2-MOB | No HDSD mobile UAT pack | P0 | qa-device |
| R-P2-W4 | No integration UAT | P0 | qa |
| R-P2-MATRIX-EXEC | 360 TC all ⬜ | P1 | qa |
| R-P2-TC-LEGACY | UAT uses TC-HDSD-* not TC-XBOS/HRM-* | P1 | ba-process |
| R-P2-MUTATE | 8 harness 🟡 (shareholder POST · create NV/HĐ/YCTD · leave 400 · WF canvas) | P2 | dev-fe/dev-be |

---

## QC recommendation

| Decision | Scope |
|----------|-------|
| **NO-GO** | Phase 2 final gate — DoD P2-1..P2-7 incomplete |
| **Partial credit** | Matrix v2.0 inventory scan · HTML shell · embed UAT ~31 load PASS |
| **Re-gate trigger** | All C-P2-01..07 closed + `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-p2-gate-RE*.md` |

**next_owner:** PM → dispatch residual owners in parallel (do not wait for sponsor).

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| Node placeholder/PNG count scan | 0 | 114 Hình · 0 assets PNG · 0 inline MD images |
| `Test-Path` assets/ artifacts/ screens | 0 | dirs exist; PDF missing |
| Read `HDSD_SRS_TESTCASE_MATRIX.md` summary | — | 360 TC · 0 PASS |
| Poll `hdsd-uat-*` + `_tmp` JSON | — | 3 MD + 1 JSON partial |

**Portal URLs (QA reference):** `http://127.0.0.1:5173` (portal/CC embed) · `http://127.0.0.1:5175` (HRM standalone W2a — **required, not yet UAT'd**)

**L2.5 J-*:** Required in full QA W2b/W3 — **deferred** (mobile + embed cross-nav not in Phase 2 pack yet).

---

## Handoff

**completion_report:** Phase 2 QC gate audited 5 checklist items. Structure PASS on doc separation + TC matrix v2.0 coverage map. **NO-GO** on PNG inline (0/114), PDF, W2a standalone, mobile CH12, W4 integration, and matrix execution (0/360 PASS). Partial embed UAT (30🟢/8🟡 legacy harness) acknowledged.

**next_owner:** PM

**next_dispatch_prompt:**
```
work_item_id: HDSD-P2-RECOVERY-01
program: HDSD-P2-FULL-01
Parallel dispatch (same session):
1) DEVOPS-HDSD-P2-STACK-01 — ensure :5175 HRM standalone for W2a captures
2) HDSD-P2-SCREEN-01 (dev-fe) — inject 114 PNG inline into MD from docs/qa/evidence/screens/hdsd-uat-20260730 + new captures
3) HDSD-P2-HTML-PDF-01 (ba-docs) — PDF A4 + print QA after PNG wired
4) QA-HDSD-W2A-STANDALONE-01 (qa) — :5175 mirror ch05-09 UF set → hdsd-uat-w2a-*.md
5) QA-HDSD-MOB-CH12-01 (qa-device) — J-MOB-* → hdsd-uat-mobile-*.md
6) QA-HDSD-W4-INT-01 (qa) — TC-ECO-INT-* browser U65
7) QA-HDSD-MATRIX-PROMOTE-01 (qa) — map 🟢 from hdsd-uat-* to TC-XBOS/HRM/MOB matrix v2.0
After C-P2-01..07: re-dispatch QC-HDSD-P2-GATE-01-R2
entry_criteria: prior NO-GO evidence docs/qa/evidence/qc-hdsd-p2-gate-20260730.md
exit_criteria: PNG≥Hình count · PDF exists · W2a+W2b+mobile+W4 evidence · matrix PASS>0 for in-scope UF
evidence_path: docs/qa/evidence/qc-hdsd-p2-gate-20260730.md
ack_status target: PASS_TO_PM after R2 GO/GWC
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-p2-gate-20260730.md`

**ack_status:** PASS_TO_PM
