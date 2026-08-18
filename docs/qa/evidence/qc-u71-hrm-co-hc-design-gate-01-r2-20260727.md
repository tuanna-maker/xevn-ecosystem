# QC Gate Decision — QC-U71-HRM-CO-HC-DESIGN-GATE-01 · **R2 re-gate** (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-U71-HRM-CO-HC-DESIGN-GATE-01` |
| **gate_revision** | **R2** (after pack repair) |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **slice** | U71 F.1 + **UF-HRM-CO-HC** · **J-HRM-CO-01** — **local only** `:5173` / `:28001` / `:28002` |
| **prior_decision** | **NO-GO (process)** — `docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-20260727.md` · **C-U71-HC-PACK-01** |
| **pack_repair** | `docs/qa/evidence/qa-u71-hrm-co-hc-pack-repair-01-20260727.md` · **READY_FOR_QC** |
| **qa_evidence** | `docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md` (patched Layer B · product claims unchanged) |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · runtime `seed: false` · **no seed** in QC |
| **HOLD_DEPLOY** | **YES — stands** |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088** |
| **Dev reopen headcount** | **No** |

---

## 0. Supersession note

| Item | R1 (prior) | R2 (this gate) |
|------|------------|----------------|
| Pack `verify:qc:evidence-pack` | **FAIL** 1/8 `crud_or_matrix` | **PASS 8/8** exit **0** |
| **C-U71-HC-PACK-01** | OPEN → QA repair | **CLOSED** |
| Product UF / Plane B | Provisional PASS (not promoted) | **Promoted** for **local** slice only |
| Decision | **NO-GO (process)** | **GO WITH CONDITIONS** |

Prior NO-GO file **retained** (history). R2 does **not** wipe R1.

---

## 1. Scope audited

**In scope (this re-gate):**
- Evidence pack integrity after PACK-REPAIR-01
- Close **C-U71-HC-PACK-01**
- Promote U71 F.1 design completeness + UF-HRM-CO-HC / AC-CO-EMP-01..06 / J-HRM-CO-01 for **local** `:5173`
- Locks: U65 · HOLD_DEPLOY · no Phase1/PROD/:8088 · no Dev reopen

**Explicitly not approved:** Phase 1 DONE · PROD-READY · `:8088` / nip.io promote · Dev reopen for industry empty or P3 MST cosmetic

---

## 2. Evidence pack gate (mandatory)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-20260727.md
→ PASS: QC evidence pack ready (8/8)
→ EXIT=0
```

| Check id | Result |
|----------|--------|
| work_item_id | PASS |
| ack_status | PASS |
| command_table | PASS |
| portal_url | PASS |
| journey_l25 | PASS |
| crud_or_matrix | PASS (was FAIL on R1) |
| residual_section | PASS |
| timestamp | PASS |

**Pack integrity:** **8/8** — gate process blocker **cleared**.

---

## 3. Design / U71 F.1 audit

| Artifact | Path | QC |
|----------|------|----|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` | **PASS** — Plane B `employees.company_id` TEXT slug · anti LE UUID COUNT |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` | **PASS F.1** — **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** UC-HRM-CO-01 Diễn biến #4–6 |
| TECHSPEC | `docs/hrm/TECHSPEC.md` §19 (cited by QA/SA) | Present · dual-plane + summary.by_company |
| Control | DATA_LINKAGE + UF-HRM-CO-HC | Aligned |

**U71 physical design gate (headcount slice):** **PASS**.

---

## 4. Product / journey promotion (local)

Corroborated from patched QA MD + runtime JSON + screenshots on disk (R1 provisional now promoted under GWC):

| AC / Journey | Verdict | Evidence note |
|--------------|---------|---------------|
| **AC-CO-EMP-01** | **PASS** | card=1109 · apiTotal=1109 |
| **AC-CO-EMP-02** | **PASS** | 229 / 220×4 · sum 1109 |
| **AC-CO-EMP-03** | **PASS** | LE→slug bridge mappedKnown=5 |
| **AC-CO-EMP-04** | **PASS** | allZero=false while API>0 |
| **AC-CO-EMP-05** | **PASS** | Company ≈ Dashboard 1109 · Δ0 |
| **AC-CO-EMP-06** | **PASS** | F5 + summary 200 |
| **Plane B keys** | **PASS** | `by_company` slug-only · badUuid=0 · `company_id=main` |
| **UF-HRM-CO-HC** | **PASS** | FE after 2xx + F5 |
| **J-HRM-CO-01** | **PASS** | list→detail→back · detailEmp=229 |
| Industry spot | **PASS** (honest empty) | all cells `-` · no entity_type leak |

**Seed:** none. **Dev reopen:** not required.

### Classification

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Pack Layer B repair → 8/8 | **PROCESS** | **CLOSED** — C-U71-HC-PACK-01 |
| Headcount Plane B / UF / J-* | **PRODUCT** | **PASS** local — promote under GWC |
| Industry cells all `-` | PRODUCT / data | **OK** — do not reopen Dev |
| Detail MST scrape `tax=-229` | PRODUCT **P3** cosmetic | Defer — not blocker |
| `qc:dev-stack` UV noise | **ENV** | Ignore for product |

---

## 5. L2.5 journey coverage (U19)

| J-* | In-scope? | QC status R2 |
|-----|-----------|--------------|
| **J-HRM-CO-01** | Yes | **PASS** (promoted local) |
| Other HRM/CC/mobile J-* | No | Out of slice — **not** claimed |

---

## 6. Conditions / locks

| ID | Status | Statement | Owner |
|----|--------|-----------|-------|
| **C-U71-HC-PACK-01** | **CLOSED** | Pack 8/8 after PACK-REPAIR-01 | — |
| **C-U71-HC-HOLD-01** | **OPEN (condition)** | **HOLD_DEPLOY** · **NOT** Phase1 / PROD / `:8088` | **pm** |
| **C-U71-HC-IND-EMPTY** | **OPEN (condition OK)** | Industry empty `-` / `—` OK — no Dev | **pm** |
| **C-U71-HC-NO-DEV** | **OPEN (condition OK)** | No Dev headcount reopen | **pm** |
| **C-U71-HC-P3-MST** | **OPEN (P3)** | Detail tax scrape cosmetic — defer FE optional | **pm** / optional fe |

---

## 7. Decision

### **GO WITH CONDITIONS**

**GO for:** U71 F.1 physical designs (DB + API) + **UF-HRM-CO-HC** / AC-CO-EMP-01..06 / **J-HRM-CO-01** on **local** stack only.

**Conditions (must remain stated):**
1. **HOLD_DEPLOY** — no `:8088` / PROD promote from this gate.
2. **NOT Phase 1 DONE** · **NOT PROD-READY**.
3. Industry empty `-` / `—` is **acceptable** — **no Dev reopen**.
4. Residual **P3** MST cosmetic only — **no** P0/P1 reopen.
5. Scope bounded to Company headcount slice — not full HRM/CC matrix.

**Closed this re-gate:** **C-U71-HC-PACK-01**.

---

## 8. Handoff

### completion_report

- **Closed:** Re-gate after pack repair; `verify:qc:evidence-pack` **8/8**; **C-U71-HC-PACK-01 CLOSED**; U71 F.1 + UF-HRM-CO-HC / J-HRM-CO-01 **promoted local** under **GO WITH CONDITIONS**.
- **Residual (non-blocking):** P3 MST cosmetic; industry empty OK; HOLD_DEPLOY / NOT Phase1/PROD/:8088.
- **Not done:** Phase1 · PROD · `:8088` · Dev reopen (none required).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-U71-HRM-CO-HC-GWC-INTAKE-01
from_role: qc
to_role: pm
lane: governance · intake GWC
entry_criteria:
  - QC R2 GO WITH CONDITIONS: docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-r2-20260727.md
  - C-U71-HC-PACK-01 CLOSED; pack 8/8; U71 F.1 + UF-HRM-CO-HC local promoted
  - HOLD_DEPLOY stands · NOT Phase1/PROD/:8088
exit_criteria:
  1) Bus INTAKE R2 GWC; update TEAM_WORKING_NOW / evidence index as needed
  2) Do NOT dispatch Dev for headcount or industry empty
  3) Optional later: P3 MST cosmetic FE only if sponsor prioritizes — not blocker
  4) Continue program backlog per pm:idle:check — no Phase1/PROD claim from this slice
evidence_path: docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-r2-20260727.md
cấm: seed · Dev reopen headcount · Phase1/PROD/:8088 claim from U71 HC GWC
```

### evidence_path

`docs/qa/evidence/qc-u71-hrm-co-hc-design-gate-01-r2-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

Intake **GWC** U71 HC local — **C-U71-HC-PACK-01 CLOSED**; keep **HOLD_DEPLOY**; **no** Dev reopen
