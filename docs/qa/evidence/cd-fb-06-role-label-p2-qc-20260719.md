# QC Gate Decision — CD-FB-06-ROLE-LABEL-P2 (2026-07-19)

| Field | Value |
|-------|--------|
| **work_item_id** | `CD-FB-06-ROLE-LABEL-P2` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **parent_gate** | `CD-FB-06-ROLE-SWITCH` · `docs/qa/evidence/cd-fb-06-role-switch-qc-20260719.md` (**GWC retained**) |
| **closes** | **C-CD-FB-06-02** / **R-CD-FB-06-01** (VI label `subsidiary_ceo`) |
| **executed_at** | `2026-07-19` |
| **spec_ref** | AC-CD-F3-01 (narrow label polish only) · R-CD-FB-06-01 |
| **decision** | **GO** — residual close only (VI chip polish) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC audited FE `cd-fb-06-role-label-p2-20260719.md` + QA `cd-fb-06-role-label-p2-qa-20260719.md` (**PASS_TO_PM**) against parent F3 GWC. QA evidence-pack **8/8 exit 0**. Browser U65: `du-lich.ceo@xe.vn` JWT `roleCode=subsidiary_ceo` renders **TGĐ công ty thành viên** (not English `subsidiary ceo`); `ceo@xe.vn` chip remains **Tổng giám đốc tập đoàn**. Code spot-check confirms alias in portal + HRM iframe helpers.

**CLOSED:** **C-CD-FB-06-02** / **R-CD-FB-06-01**.

**Did NOT reopen** AC-CD-F3-02..06 / **J-HRM-INT-05** (prior F3 PASS stands).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY exit. Parent F3 remains **GO WITH CONDITIONS** for standing opens below.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| dev-fe | `docs/qa/evidence/cd-fb-06-role-label-p2-20260719.md` | READY_FOR_QA — `subsidiary_ceo` → VI; vitest 4+3 PASS |
| qa | `docs/qa/evidence/cd-fb-06-role-label-p2-qa-20260719.md` | **PASS_TO_PM** — browser member VI + group regression |
| parent qc | `docs/qa/evidence/cd-fb-06-role-switch-qc-20260719.md` | GWC — condition **C-CD-FB-06-02** was OPEN |
| qc (this) | `docs/qa/evidence/cd-fb-06-role-label-p2-qc-20260719.md` | **GO** residual close |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `cd-fb-06-role-label-p2-qa-20260719.md` | **0** | **8/8** | **PASS** — gate open for residual adjudication |
| `cd-fb-06-role-label-p2-20260719.md` (FE) | 1 | 4/8 | Expected for FE handoff — **not** product NO-GO; QA pack is SoT |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/cd-fb-06-role-label-p2-qa-20260719.md
# PASS: QC evidence pack ready (8/8)
```

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| L0 HTTP 200 hrm/xbos/portal (QC spot 2026-07-19) | ENV | **PASS** — healthy lines printed; Windows UV assert after (known flake) — **not** product NO-GO |
| `verify:qc:evidence-pack` QA 8/8 | PROCESS | **PASS** |
| Member chip VI «TGĐ công ty thành viên» | PRODUCT | **PASS** (QA browser + code map) |
| Group CEO chip regression | PRODUCT | **PASS** |
| AC-CD-F3-02..06 / J-HRM-INT-05 | OUT OF SLICE | **Not reopened** — prior F3 GWC stands |
| Seed | PROCESS U65 | **PASS** — none |
| Phase 1 DONE / PROD | OUT OF SLICE | **NOT claimed** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-19) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` | HTTP **200** | **PASS** |
| xbos-api `:28002` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert | **ENV flake** — treat as PASS |

---

## Residual / condition close matrix

| ID | Prior status (parent GWC) | This gate | QC |
|----|---------------------------|-----------|-----|
| **C-CD-FB-06-02** / **R-CD-FB-06-01** | OPEN (P2 UX VI label) | Browser + map PASS | **CLOSED** |
| **C-CD-FB-06-01** / R-CD-FB-06-02 | OPEN (multi-hat AC-F3-04 N/A) | Unchanged | **OPEN** (defer — no seed) |
| **C-CD-FB-06-03** | OPEN (NOT Phase1/PROD) | Unchanged | **OPEN** (standing) |
| **C-CD-FB-06-04** | OPEN (BA_TRACE J-HRM-INT-05 promote) | Unchanged | **OPEN** (hygiene) |

---

## L2.5 / J-* (U19)

Narrow polish — **no** new J-* required. Parent **J-HRM-INT-05** remains **PASS** from F3 GWC; **not** re-executed this wave (correct for residual-only close).

**NO-GO trigger not met:** mandatory in-scope journey for this residual slice is N/A; F3 mandatory J-* already PASS on parent.

---

## Controls (must keep)

- Do **not** reopen AC-CD-F3-02..06 without fresh regression evidence
- Do **not** claim Phase1 / PROD / F-DELIVERY from this close
- U65 zero-seed — multi-hat still deferred (**C-CD-FB-06-01**)
- Parent F3 decision remains **GO WITH CONDITIONS** (not upgraded to unconditional GO)

---

## Forbidden claims

- Phase 1 DONE / PROD-READY / UAT full-program exit
- F-DELIVERY / customer-demo program exit from this residual alone
- Seed multi-hat for AC-CD-F3-04
- Revoke or reopen F3 green ACs / J-HRM-INT-05 without regression

---

## Parent GWC annotation

Annotate `cd-fb-06-role-switch-qc-20260719.md` Conditions row **C-CD-FB-06-02** → **CLOSED** citing this evidence path (same session).

---

## completion_report

QC **GO** for residual-only `CD-FB-06-ROLE-LABEL-P2`. **CLOSED:** **C-CD-FB-06-02** / **R-CD-FB-06-01** (VI `subsidiary_ceo` chip). QA pack **8/8**; L0 **200×3**; AC-CD-F3-02..06 **not** reopened; **NOT** Phase1/PROD. Parent F3 **GWC retained** with **C-CD-FB-06-01**, **C-CD-FB-06-03**, **C-CD-FB-06-04** still OPEN.

## next_owner

pm

## next_dispatch_prompt

```text
work_item_id: CD-FB-06-ROLE-LABEL-P2
from_role: pm
to_role: pm
lane: governance
entry: docs/qa/evidence/cd-fb-06-role-label-p2-qc-20260719.md GO (residual close)
actions:
  1) Bus INTAKE — CLOSED C-CD-FB-06-02 / R-CD-FB-06-01; parent F3 GWC retained
  2) Confirm parent qc annotation C-CD-FB-06-02 CLOSED (cite p2-qc 20260719)
  3) Optional hygiene (non-blocking): promote BA_TRACE J-HRM-INT-05 ⏳→PASS (C-CD-FB-06-04)
  4) Continue customer-demo backlog (CD-FB-07 / next F-slice) — do NOT claim Phase1/PROD/F-DELIVERY
standing OPEN (parent):
  C-CD-FB-06-01 multi-hat AC-F3-04 (no seed)
  C-CD-FB-06-03 NOT Phase1/PROD
  C-CD-FB-06-04 BA_TRACE promote
cấm: seed · reopen AC-CD-F3-02..06 without regression · Phase1/PROD claim
```

**ack_status:** **PASS_TO_PM**
