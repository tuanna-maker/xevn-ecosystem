# QC Gate Decision — D-HRM-EMP-SALARY-INVALID-DATE-01 (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-SALARY-INVALID-DATE-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **qa_evidence** | `docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qa-20260720.md` (**PASS_TO_PM**) |
| **fe_evidence** | `docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-20260720.md` (**READY_FOR_QA**) |
| **executed_at** | `2026-07-20` |
| **decision** | **GO WITH CONDITIONS** — Invalid time crash closed; R1 DialogTitle optional; NOT Phase1/PROD |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **f_delivery_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no seed |

---

## Executive summary

QC audited FE safe-date display for employee **Lương & Phụ cấp** + QA browser U65 **PASS**. Primary sponsor symptom `RangeError: Invalid time value` on payslip `payDate` / `period_label` is **CLOSED**: tab renders without crash; **Ngày trả** = `—`; **Tháng** shows prose period; empty CEO salary state OK; Hợp đồng adjacent smoke OK; vitest `formatDisplayDate` **8/8**.

**GO WITH CONDITIONS** — product AC closed; residual **R1** DialogTitle/Description console on **Thêm phụ cấp** remains optional P2; pack verify missing `journey_l25` = PROCESS only; **NOT** Phase 1 DONE · **NOT** PROD-READY.

---

## Chain audited

| Lane | Evidence | Verdict |
|------|----------|---------|
| dev-fe | `d-hrm-emp-salary-invalid-date-01-20260720.md` | READY_FOR_QA — `formatPayrollPayDateCell` / `formatDisplayDate`; DialogTitle on dialogs; vitest 8 PASS |
| qa | `d-hrm-emp-salary-invalid-date-01-qa-20260720.md` | **PASS_TO_PM** — browser no Invalid time; payDate `—`; period prose; R1 P2 residual |
| qc (this) | `d-hrm-emp-salary-invalid-date-01-qc-20260720.md` | **GWC** — primary CLOSED; R1 optional; pack PROCESS; NOT Phase1/PROD |

---

## Evidence pack gate (Layer B)

| File | verify exit | Score | QC adjudication |
|------|-------------|-------|-----------------|
| `d-hrm-emp-salary-invalid-date-01-qa-20260720.md` | **1** | **1/8** fail (`journey_l25` only) | **PROCESS GWC** — missing explicit `J-*` PASS/FAIL line. Browser click-path, L0, UF-HRM-06 salary tab, CDP table, Network GET payslips 200 present in prose. **Not** product NO-GO (precedent: `process-pack-not-product-nogo`). |

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qa-20260720.md
# FAIL: QC evidence pack incomplete (1/8 checks)
#   - journey_l25: List at least one J-* journey id ...
```

**QC L2.5 mapping (adjudication):** Defect surface = employee detail → tab Lương (UF-HRM-06 payroll display path). Related journeys:

| J-* / UF | This wave | Status |
|----------|-----------|--------|
| **UF-HRM-06** (salary / payslip display) | Employee → Lương tab · no Invalid time · table render | **PASS** (defect close) |
| **J-HRM-01** (employee list → detail) | Entry via `/employees/:id` DVU-0005 | **PASS smoke** (path used) |
| **J-HRM-07** (Lương menu → phiếu) | Not re-walked this slice | **must_keep** — matrix 🟢 not reopened; out-of-slice defer |

| Process note | Severity | Owner | Status |
|--------------|----------|-------|--------|
| QA pack missing `J-*` label (`journey_l25`) | P3 process | qa (optional polish) | **Noted** — **C-02** |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| QC spot `qc:dev-stack` 2026-07-20 | ENV | hrm `:28001` · xbos `:28002` · portal `:5173` **200** — **PASS**; Windows UV assert after healthy print = **ENV flake** — **not** product NO-GO |
| Tab Lương — 0 console `Invalid time` / `RangeError` | PRODUCT | **PASS** — primary CLOSED |
| payDate cell `—` + Tháng period prose | PRODUCT | **PASS** |
| Empty CEO salary state no crash | PRODUCT | **PASS** |
| Hợp đồng dates adjacent smoke | PRODUCT must_keep | **PASS** |
| Thêm phụ cấp DialogTitle DOM present + Radix Title/Description console | PRODUCT P2 | **OPEN optional** → **C-01** (does not block crash close) |
| Seed | PROCESS U65 | **PASS** — none |
| evidence-pack 1/8 `journey_l25` | PROCESS | **GWC format** → **C-02** — not product reopen |
| Phase1 / PROD / F-DELIVERY | OUT OF SLICE | **NOT claimed** → **C-03** |

---

## L0 — Dev stack health (QC spot)

| Check | QC spot (2026-07-20) | Result |
|-------|----------------------|--------|
| hrm-api `:28001` `/api/hrm` | HTTP **200** | **PASS** |
| xbos-api `:28002` `/api/xbos` | HTTP **200** | **PASS** |
| web-portal `:5173` | HTTP **200** | **PASS** |
| process exit after healthy print | Windows UV assert | **ENV flake** — treat as PASS |

Concurs QA pack L0.

---

## Exit criteria adjudication

| # | Exit (PM dispatch) | QC |
|---|--------------------|-----|
| 1 | GO or GWC | **GWC** — product primary CLOSED |
| 2 | Residual R1 DialogTitle optional | **C-01 OPEN** — optional P2; waive allowed; not crash blocker |
| 3 | no Phase1/PROD | **PASS** — **C-03** standing |
| 4 | Evidence this file | **PASS** |

---

## Conditions (bounded)

| ID | Severity | Item | Owner | Status |
|----|----------|------|-------|--------|
| **C-01** | P2 | **R1** — Opening **Thêm phụ cấp**: Radix still console `DialogContent` requires `DialogTitle` + Missing `Description` despite visible `h2` «Thêm phụ cấp mới» (iframe→parent portal). Primary crash AC not blocked. | `dev-fe` (optional) | **OPEN — optional waive** |
| **C-02** | P3 process | QA pack `journey_l25` missing explicit `J-*` line (verify 1/8) | `qa` (optional polish) | **OPEN — process only** |
| **C-03** | Standing | **NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** F-DELIVERY | pm | **OPEN standing** |

**R2 (QA P3)** live `period_label` prose → Ngày trả `—` while Tháng shows period — exit allows `—`; **absorbed / defer polish** — not a gate condition.

---

## Controls (must_keep)

- U65 zero-seed — **PASS** (no seed in evidence)
- UF-HRM-06 payroll display path — **CLOSED** this wave (Invalid time)
- F5 compensation / Hợp đồng adjacent — **not broken** (smoke PASS)
- J-HRM-07 matrix 🟢 — **do not reopen** / claim fresh L2.5 without retest
- Cấm Phase1/PROD claim from this gate

---

## completion_report

**Closed:** D-HRM-EMP-SALARY-INVALID-DATE-01 primary — employee Lương tab no `RangeError: Invalid time`; safe `—` payDate + period prose; empty state OK; contracts smoke OK; U65; L0 200.

**Residual / conditions:** C-01 R1 DialogTitle portal warn (optional P2); C-02 pack journey label PROCESS; C-03 NOT Phase1/PROD.

**Verdict:** **GO WITH CONDITIONS**.

**next_owner:** pm

**next_dispatch_prompt:**

```text
work_item_id: D-HRM-EMP-SALARY-INVALID-DATE-01
from_role: pm
to_role: pm
lane: governance
entry: QC GWC docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qc-20260720.md
action: Bus INTAKE CLOSE primary Invalid-time; update TEAM_WORKING_NOW / matrix note UF-HRM-06 employee Lương tab crash closed
optional: Task dev-fe C-01 DialogTitle/Description iframe portal warn (P2) — only if sponsor wants a11y console clean
cấm: Phase1/PROD claim · seed · reopen J-HRM-07 without retest
```

**ack_status:** **PASS_TO_PM**  
**evidence_path:** `docs/qa/evidence/d-hrm-emp-salary-invalid-date-01-qc-20260720.md`
