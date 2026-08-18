# QC Gate Decision — D-HRM-EMP-SALARY-DIALOG-A11Y-01 (R2 residual close · 2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-SALARY-DIALOG-A11Y-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **parent_gate** | `D-HRM-EMP-SALARY-INVALID-DATE-01` → `docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qc-20260720.md` (**GWC retained**) |
| **parent_condition** | **C-01** R1 DialogTitle/Description iframe portal warn (P2 optional) |
| **qa_evidence** | `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-r2-20260720.md` (**PASS_TO_PM**) |
| **fe_evidence** | `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-fe-r2-20260720.md` (**READY_FOR_QA**) |
| **prior_qa_fail** | `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-20260720.md` (R1 FAIL — closed by R2) |
| **executed_at** | `2026-07-20` |
| **decision** | **GO** — C-01 DialogTitle residual CLOSED; parent Invalid-date **GWC retained**; NOT Phase1/PROD |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no reopen Invalid time |

---

## Executive summary

QC audited FE R2 portal a11y fix (callback-ref `attachPortalDialogA11yMirror` + Presence mount) and QA browser U65 R2 **PASS**. Parent GWC condition **C-01** (Radix `DialogTitle` / `Description` console on **Thêm phụ cấp** despite visible title) is **CLOSED**: iframe console **0×** Title/Description warns; **2** `[data-xevn-hrm-dialog-a11y-mirror]` stubs; title «Thêm phụ cấp mới» visible; Invalid time **must_keep PASS**.

**Verdict: GO** — residual-close only. Parent `D-HRM-EMP-SALARY-INVALID-DATE-01` stays **GWC** for standing **C-02** (pack process) + **C-03** (NOT Phase1/PROD). **NOT** Phase 1 DONE · **NOT** PROD-READY.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| parent qc | `d-hrm-emp-salary-invalid-date-01-qc-20260720.md` | **GWC** — primary Invalid time CLOSED; **C-01 OPEN** optional P2 |
| dev-fe R1 | `d-hrm-emp-salary-dialog-a11y-01-20260720.md` | READY_FOR_QA — mirror + DialogDescription |
| qa R1 | `d-hrm-emp-salary-dialog-a11y-01-qa-20260720.md` | **FAIL** — Presence timing; 2 console warns |
| dev-fe R2 | `d-hrm-emp-salary-dialog-a11y-01-fe-r2-20260720.md` | READY_FOR_QA — callback-ref attach before Radix warn |
| qa R2 | `d-hrm-emp-salary-dialog-a11y-01-qa-r2-20260720.md` | **PASS_TO_PM** — 0 warns; mirrors×2; must_keep PASS; vitest 16/16 |
| qc (this) | `d-hrm-emp-salary-dialog-a11y-01-qc-r2-20260720.md` | **GO** — **C-01 CLOSED**; parent GWC retain C-02/C-03 |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `d-hrm-emp-salary-dialog-a11y-01-qa-r2-20260720.md` | **1** | **2/8** fail (`journey_l25`, `crud_or_matrix`) | **PROCESS only** — browser click-path, L0, CDP console/mirror table, Invalid time must_keep present in prose. Explicit `J-*` PASS/FAIL line missing. **Not** product NO-GO (precedent: `process-pack-not-product-nogo`). |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-r2-20260720.md
# FAIL: QC evidence pack incomplete (2/8 checks)
#   - journey_l25: List at least one J-* journey id ...
#   - crud_or_matrix: CRUD matrix / L2.5 journey matrix with PASS rows
```

**QC L2.5 mapping (adjudication — residual a11y slice):**

| J-* / UF | This wave | Status |
|----------|-----------|--------|
| **UF-HRM-06** (salary / allowance dialog) | Employee → Lương → Thêm phụ cấp · 0 DialogTitle/Description console | **PASS** (C-01 close) |
| **J-HRM-01** (employee list → detail) | Entry `/employees/:id` DVU-0005 embed | **PASS smoke** (path used) |
| **J-HRM-07** (Lương menu → phiếu) | Not re-walked | **must_keep** — matrix 🟢 not reopened |

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| QA R2 pack missing `J-*` / matrix PASS rows (verify 2/8) | P3 process | qa (optional polish) | **Noted** — absorbed into parent **C-02** standing; not product reopen |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QC spot `qc:dev-stack` 2026-07-20 | ENV | hrm `:28001` · xbos `:28002` · portal `:5173` **200** — **PASS**; Windows UV assert after healthy print = **ENV flake** — **not** product NO-GO |
| iframe console 0× DialogTitle / Description | PRODUCT | **PASS** — **C-01 CLOSED** |
| a11y mirrors ×2 + getElementById true | PRODUCT | **PASS** |
| Visible title «Thêm phụ cấp mới» | PRODUCT | **PASS** |
| Invalid time / RangeError must_keep | PRODUCT must_keep | **PASS** — primary Invalid-date close **not reopened** |
| Seed | PROCESS U65 | **PASS** — none |
| evidence-pack 2/8 | PROCESS | Format GWC note only — **not** product NO-GO |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** — parent **C-03** standing |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-20) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` `/api/hrm` | HTTP **200** | **PASS** |
| xbos-api `:28002` `/api/xbos` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert | **ENV flake** — treat as PASS |

Concurs QA R2 pack L0.

---

## Exit criteria adjudication

| # | Exit (PM dispatch) | QC |
|---|--------------------|-----|
| 1 | GO or GWC close C-01 DialogTitle residual | **GO** — **C-01 CLOSED** |
| 2 | Retain parent Invalid-date product AC CLOSED | **PASS** — must_keep Invalid time verified |
| 3 | no Phase1/PROD | **PASS** — **C-03** standing on parent |
| 4 | Evidence this file | **PASS** |

---

## Conditions — parent GWC update

| ID | Severity | Item | Owner | Status (after this gate) |
|----|----------|------|-------|--------------------------|
| **C-01** | P2 | R1 DialogTitle/Description iframe portal warn on Thêm phụ cấp | `dev-fe` | **CLOSED** by `D-HRM-EMP-SALARY-DIALOG-A11Y-01` R2 |
| **C-02** | P3 process | QA pack `journey_l25` / matrix label missing (parent + this R2 2/8) | `qa` (optional) | **OPEN — process only** (parent standing) |
| **C-03** | Standing | **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY | pm | **OPEN standing** (parent) |

**Parent gate:** `D-HRM-EMP-SALARY-INVALID-DATE-01` remains **GO WITH CONDITIONS** with **C-01 closed**; residual standing = **C-02** + **C-03** only.

---

## Controls (must_keep)

- U65 zero-seed — **PASS**
- Invalid time / UF-HRM-06 payDate safe display — **not reopened** (QA R2 must_keep PASS)
- Parent Invalid-date primary product AC — **CLOSED** (retained)
- J-HRM-07 matrix 🟢 — **do not reopen** without retest
- Cấm Phase1/PROD claim from this residual gate

---

## completion_report

**Closed:** **C-01** / `D-HRM-EMP-SALARY-DIALOG-A11Y-01` — Thêm phụ cấp iframe console **0×** DialogTitle/Description; portal a11y mirrors×2; title visible; Invalid time must_keep PASS; U65; L0 200; prior R1 FAIL closed by R2.

**Residual (parent standing):** C-02 pack process; C-03 NOT Phase1/PROD.

**Verdict:** **GO** (residual close). Parent Invalid-date **GWC retained** (C-02 + C-03).

**next_owner:** pm

**next_dispatch_prompt:**

```text
work_item_id: D-HRM-EMP-SALARY-DIALOG-A11Y-01
from_role: pm
to_role: pm
lane: governance
entry: QC GO residual close docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qc-r2-20260720.md
action: Bus INTAKE — CLOSE parent C-01 DialogTitle; retain parent D-HRM-EMP-SALARY-INVALID-DATE-01 GWC with C-02 process + C-03 NOT Phase1/PROD only; update TEAM_WORKING_NOW / pulse
cấm: Phase1/PROD claim · seed · reopen Invalid time · reopen J-HRM-07 without retest
optional: qa polish pack journey_l25 label on future salary evidence (C-02)
```

**ack_status:** **PASS_TO_PM**  
**evidence_path:** `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qc-r2-20260720.md`
