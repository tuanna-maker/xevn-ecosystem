# QC Gate Decision — QC-U71-HRM-CO-HC-DESIGN-GATE-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-U71-HRM-CO-HC-DESIGN-GATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` (re-dispatch **qa** for pack repair) |
| **execution_date** | `2026-07-27` |
| **decision** | **NO-GO (process)** |
| **slice** | Company headcount U71 F.1 + UF browser — **local** `:5173` / `:28001` / `:28002` only |
| **qa_handoff** | `docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md` (claims **PASS** / `PASS_TO_PM`) |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · QA runtime `seed: false` · **no seed** in QC spot |
| **HOLD_DEPLOY** | **YES — stands** · local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |
| **Dev reopen headcount** | **No** — process gap only (QA pack section); product runtime looks closed |

---

## 1. Scope audited

**In scope (this gate):**
- U71 physical design existence + F.1 fields for Company headcount
- QA browser UF-HRM-CO-HC / AC-CO-EMP-* / J-HRM-CO-01 evidence integrity
- Evidence pack gate (`verify:qc:evidence-pack`) before any GO/GWC
- Locks: U65 zero-seed · HOLD_DEPLOY · no Phase1/PROD claim

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` / nip.io · matrix Dev8088 promote · reopen Dev for honest industry «—» / `-`

---

## 2. Evidence pack gate (blocking)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
→ FAIL: QC evidence pack incomplete (1/8 checks)
  - crud_or_matrix: CRUD matrix, read-only module table, or L2.5 journey matrix with PASS rows
```

| Check | Result |
|-------|--------|
| Pack integrity | **FAIL 7/8** — missing `crud_or_matrix` |
| Root cause | QA MD has `| **PASS**` rows and `J-HRM-CO-01`, but **no** token `L2.5` / `journey` / CRUD / `read-only` matrix wording required by `scripts/verify-qc-evidence-pack.mjs` |
| QA MD readable | Yes |
| Runtime JSON | Present · `overall: PASS` · `HOLD_DEPLOY: true` · `seed: false` |
| Screenshots on disk | `qa-u71-hrm-co-hc-regression-01-company.png` · `-f5.png` · `-dashboard.png` **exist** |
| L0 spot (`qc:dev-stack`) | HRM/XBOS/portal **HTTP 200** (Windows Node UV assert after success — **ENV noise**, not product FAIL) |

**Rule:** `.cursor/rules/qc-evidence-pack-gate.mdc` — verify FAIL ⇒ **NO-GO (process)** → return to **QA**, not Dev. QC **must not** issue GO/GWC.

---

## 3. Design / U71 F.1 audit (non-blocking for process — recorded)

| Artifact | Path | QC |
|----------|------|----|
| TECHSPEC §19 | `docs/hrm/TECHSPEC.md` §19 dual-plane + `employees/summary.by_company` | **Present** · cites physical DB/API paths |
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` | **Present** · Plane B `employees.company_id` TEXT slug · anti LE UUID |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` | **Present** — **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** UC-HRM-CO-01 Diễn biến #4–6 · DTO↔DB · errors |
| Control | `docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md` R2 + UF-HRM-CO-HC | **Aligned** |
| Orthogonal industry | TECHSPEC §20 / prior `QC-HRM-CO-INDUSTRY-01` GWC | Empty «-» / «—» **OK** — not headcount FAIL |

**F.1 product design:** **PASS** (docs complete). Does **not** override pack NO-GO.

---

## 4. Product substance (provisional — not promoted)

Runtime + screenshots **corroborate** QA claims; listed only for PM/QA repair context. **Not** a GO.

| AC / Journey | QA claim | QC spot (runtime/JSON/L0) | Provisional |
|--------------|----------|---------------------------|-------------|
| **AC-CO-EMP-01** card = summary total | 1109 | runtime `card=1109 apiTotal=1109` | Would PASS |
| **AC-CO-EMP-02** per-row slug counts | 229/220×4 | sample rows positive · sum 1109 | Would PASS |
| **AC-CO-EMP-03** LE→slug bridge | mappedKnown=5 | names match registry | Would PASS |
| **AC-CO-EMP-04** no fake all-0 | allZero=false | while apiTotal=1109 | Would PASS |
| **AC-CO-EMP-05** Company ≈ Dashboard | both 1109 | deltaPct=0 | Would PASS |
| **AC-CO-EMP-06** F5 + Network 2xx | f5Card=1109 | summary `company_id=main` · badUuid=0 · by_company | Would PASS |
| **Plane B keys** | slug-only | `by_company` true · interim false | Would PASS |
| **J-HRM-CO-01** | PASS | detailEmp=229 · backPositive | Would PASS |
| **Industry regression** | all `-` · no entity_type leak | industry runtime scrape `-` ×5 | Would PASS (honest empty) |

### Classification

| Signal | Class | Action |
|--------|-------|--------|
| Pack `crud_or_matrix` missing | **PROCESS** | **NO-GO** → QA patch MD then re-gate QC |
| Headcount Plane B / UF browser | PRODUCT | Provisional closed — **no Dev reopen** |
| Industry cells all `-` | PRODUCT / data | Honest empty OK (same class as industry GWC) |
| Detail MST scrape `tax=-229` | PRODUCT P3 cosmetic | Defer — not blocker |
| `qc:dev-stack` UV assert after 200 | ENV | Ignore for product |

---

## 5. L2.5 journey coverage (U19)

| J-* | In-scope this gate? | Status under this decision |
|-----|---------------------|----------------------------|
| **J-HRM-CO-01** | Yes | Runtime/QA claim PASS — **not QC-promoted** until pack 8/8 + re-gate |
| Other HRM/CC J-* | No | Out of slice |

`PROGRAM_JOURNEY_MAP.md` already marks J-HRM-CO-01 ✅ PASS local from prior industry+emp-count wave — **do not** claim Phase1/PROD from this NO-GO.

---

## 6. Conditions / locks (stand)

| ID | Statement | Owner |
|----|-----------|-------|
| **C-U71-HC-PACK-01** | Pack repair required before any GO/GWC on this work_item | **qa** |
| **C-U71-HC-HOLD-01** | **HOLD_DEPLOY** stands · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-U71-HC-IND-EMPTY** | Industry empty `-` / `—` **OK** — do not reopen Dev | **pm** |
| **C-U71-HC-NO-DEV** | **No** Dev headcount reopen unless pack re-gate finds product FAIL | **pm** |

---

## 7. Decision

### **NO-GO (process)**

- Fail-closed: `verify:qc:evidence-pack` **not** 8/8.
- U71 F.1 designs **exist and are complete** (recorded).
- Browser/runtime substance **looks** PASS (provisional) — **cannot promote**.
- **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD** · **NOT :8088**.
- **No seed**. **No Dev reopen** for headcount or honest industry empty.

---

## 8. Handoff

### completion_report

- **Closed:** QC audit of U71 headcount design gate inputs; pack verify executed; F.1 design presence confirmed; L0 200×3; locks confirmed.
- **Open / blocking:** QA evidence pack missing `crud_or_matrix` wording → **NO-GO (process)**.
- **Residual (non-blocking product):** P3 detail MST parse; industry VI map not live-exercised (empty SoT OK).

### next_owner

`qa` (then `qc` re-gate same work_item)

### next_dispatch_prompt

```text
work_item_id: QA-U71-HRM-CO-HC-PACK-01
from_role: pm
to_role: qa
lane: execution · U65 zero-seed · pack repair only (no product retest required unless pack edit breaks claims)
entry_criteria:
  - QC NO-GO (process): docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-20260727.md
  - Source claims: docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
exit_criteria:
  1) Patch QA MD: add explicit "## L2.5 journey matrix" table with rows | J-HRM-CO-01 | … | **PASS** | (and/or read-only module matrix) so verify:qc:evidence-pack exits 0 (8/8)
  2) Keep AC-CO-EMP / Network / F5 / industry «-» / seed:none / HOLD_DEPLOY language
  3) Do NOT seed; do NOT reopen Dev for headcount; do NOT claim Phase1/PROD
  4) Re-run: pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md → exit 0
  5) ack_status READY_FOR_QC → PM Task QC-U71-HRM-CO-HC-DESIGN-GATE-01 re-gate
evidence_path: docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
cấm: seed · Dev reopen for empty industry · Phase1/PROD/:8088 claim
```

### evidence_path

`docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-20260727.md`

### ack_status

**PASS_TO_PM**

---

## 9. Supersession (R2 — 2026-07-27) — append only

| Field | Value |
|-------|--------|
| **Re-gate evidence** | `docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-r2-20260727.md` |
| **Pack repair** | `docs/qa/evidence/qa-u71-hrm-co-hc-pack-repair-01-20260727.md` |
| **Pack verify R2** | **PASS 8/8** · exit 0 |
| **C-U71-HC-PACK-01** | **CLOSED** on R2 |
| **R2 decision** | **GO WITH CONDITIONS** (local U71 F.1 + UF-HRM-CO-HC) · HOLD_DEPLOY · NOT Phase1/PROD/:8088 |
| **This R1 file** | Historical **NO-GO (process)** — **not wiped** |

---

## 9. Supersession (R2 — 2026-07-27) — append only

| Field | Value |
|-------|--------|
| **Re-gate evidence** | `docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-r2-20260727.md` |
| **Pack repair** | `docs/qa/evidence/qa-u71-hrm-co-hc-pack-repair-01-20260727.md` |
| **Pack verify R2** | **PASS 8/8** · exit 0 |
| **C-U71-HC-PACK-01** | **CLOSED** on R2 |
| **R2 decision** | **GO WITH CONDITIONS** (local U71 F.1 + UF-HRM-CO-HC) · HOLD_DEPLOY · NOT Phase1/PROD/:8088 |
| **This R1 file** | Historical **NO-GO (process)** — **not wiped** |
