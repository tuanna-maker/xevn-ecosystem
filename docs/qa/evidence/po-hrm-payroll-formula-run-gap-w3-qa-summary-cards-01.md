# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-SUMMARY-CARDS-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-SUMMARY-CARDS-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — K6.5 browser retest R-PAY-W3-FE-SUMMARY-ZERO |
| **priority** | P3 |
| **parent** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-FE-SUMMARY-CARDS-01` |
| **closes** | **R-PAY-W3-FE-SUMMARY-ZERO** (browser) |
| **resume_chunk** | K6.5 |
| **portal_url** | `http://127.0.0.1:5173/hr/payroll` · persona `ceo@xe.vn` · `company_id=main` |
| **journey_l25** | **J-HRM-07** header summary cards slice (not full e2e) |
| **stamp** | **`PAYW3SUMQA-MSIWD3MS`** |
| **machine** | [`_tmp-po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.json`](_tmp-po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01/` |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.mjs` |
| **U65** | zero-seed · browser-only · **no** `pnpm seed:*` |
| **Verdict** | **PASS** — header Gross/Net = line / API **12.345.000 ₫** · `data-totals-source=line_aggregate` |
| **ack_status** | **`PASS_TO_PM`** |
| **fe_ref** | [`po-hrm-payroll-formula-run-gap-w3-fe-summary-cards-01.md`](po-hrm-payroll-formula-run-gap-w3-fe-summary-cards-01.md) |
| **qc_obs_ref** | [`po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md`](po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md) OBS summary-cards-zero |
| **process_ref** | [`po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md`](po-hrm-payroll-formula-run-gap-w3-qa-process-post-02.md) stamp `PAYW3PROC2-MSIT867S` · period `cf38deac` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | LOCKED — not flipped this seat (no process POST; prior process body false retained) |
| **Formula LIVE / customer UAT** | **DENIED** | Cards bind display-ready line aggregate — **no** FE formula invent |
| **Module payroll UAT / J-HRM-07 e2e** | **DENIED** | slice cards only |
| **Seed** | **DENIED** | U65 |
| **process-post GWC / TDZ / SRC** | **must_keep** | **not reopened** |

---

## Executive summary

U65 browser retest of FE fix R-PAY-W3-FE-SUMMARY-ZERO. Opened processed Aug period **`cf38deac`** (≠ `d92d3bbb`) as `ceo@xe.vn` → `/hr/payroll` → Tính lương → filter **8/2026** → detail. Header cards **Tổng lương Gross / Net = 12.345.000 ₫** match payslip line UAT-0100 and API `gross_amount`/`net_amount` **12345000**. `data-totals-source` = **`line_aggregate`**. F5 → re-open → same. Stamp **`PAYW3SUMQA-MSIWD3MS`**. **DENY** LIVE / ready flip / process-post reopen.

---

## Command table

| Command / check | Result | Exit / note |
|-----------------|--------|-------------|
| `pnpm run qc:fe-be-health` | **ALL PASS** (after stable `nest start` without watch-loop) | L0/L1 |
| `node scripts/qa/_tmp-…-qa-summary-cards-01.mjs` | stamp **`PAYW3SUMQA-MSIWD3MS`** | exit **0** |
| Seed | none | U65 |

---

## Target period

| Criterion | Result |
|-----------|--------|
| Prefer processed `cf38deac` | **PASS** · `cf38deac-8b64-474d-9aee-b34249c0f5a1` · status **processed** · emp=1 |
| NOT `d92d3bbb` proof | **PASS** |
| API payslips | **200** · 1 row · gross/net **12345000** · `UAT-0100` |

---

## UF / click path

| Step | Action | Verdict | Evidence |
|------|--------|---------|----------|
| Login inject | `ceo@xe.vn` portal tokens | **PASS** | machine |
| Nav | `/hr/payroll` → Tính lương → Danh sách | **PASS** | `01-pay-list.png` |
| Filter | `pay-batch-period-option-8-2026` | **PASS** | `02-filtered.png` |
| Open | `pay-batch-row-cf38deac-…` | **PASS** | `03-detail-cards.png` |
| Cards | Gross/Net **12.345.000 ₫** · source `line_aggregate` | **PASS** | beforeF5 |
| Lines | UAT-0100 base/net **12.345.000 ₫** | **PASS** | table |
| F5 | reload → filter → re-open | **PASS** | `04-after-f5.png` |
| TDZ | pageErrors | **PASS** | `tdzErrors=[]` |

---

## Acceptance criteria

| AC | Verdict | Notes |
|----|---------|-------|
| AC-Cards-F5 | **PASS** | Gross/Net cards = **12.345.000 ₫** = API/line · ≠ 0 while line non-zero · F5 holds |
| AC-Cards-Process (optional) | **N/A** | Existing processed period sufficient; no fresh enroll/Khóa this seat |
| `data-totals-source` | **PASS** | `line_aggregate` |
| Honesty `payroll_e2e_ready=false` | **PASS** | locked · no process this run |
| DENY LIVE invent | **PASS** | |
| Cấm reopen TDZ / process-post / SRC | **PASS** | |
| ≠ `d92d3bbb` proof | **PASS** | |

---

## Card vs line vs API (after F5)

| Surface | Gross | Net | Source |
|---------|-------|-----|--------|
| Header `pay-batch-summary-gross/net` | **12.345.000 ₫** | **12.345.000 ₫** | `line_aggregate` |
| Line UAT-0100 | **12.345.000 ₫** | **12.345.000 ₫** | table |
| GET `/payroll/payslips?period_id=cf38deac…` | **12345000** | **12345000** | API |

---

## Residuals

| ID | Sev | Owner | Status | Note |
|----|-----|-------|--------|------|
| **R-PAY-W3-FE-SUMMARY-ZERO** | was P3 OBS | fe/qa | **CLOSED** | browser cards match lines |
| **R-PAY-PERIOD-LIST-TOTALS** | P3 OBS | dev-be | **OPEN idle-ok** | list/get period still omit totals — FE detail OK via line aggregate (FE evidence note) |
| **process-post GWC / TDZ / SRC** | — | — | **RETAINED** | not reopened |
| **`payroll_e2e_ready`** | honesty | pm | **LOCKED false** | |
| **`C-SLICE-≠-MODULE`** | governance | pm/qc | **CONDITION** | |

---

## Not promoted

- `payroll_e2e_ready=true` / formula LIVE / module UAT / full J-HRM-07 e2e
- process-post GWC reopen
- BE list totals polish (optional OBS)

---

## completion_report

### Closed

- Browser AC-Cards-F5 on processed `cf38deac`: header Gross/Net **12.345.000 ₫** match line + API; `data-totals-source=line_aggregate`; F5 stable.
- R-PAY-W3-FE-SUMMARY-ZERO **CLOSED** for browser.
- Honesty retained: `payroll_e2e_ready=false` · LIVE DENIED · zero-seed · TDZ/process-post/SRC not reopened.
- Stamp **`PAYW3SUMQA-MSIWD3MS`** · exit 0.

### Residual

- Optional BE `R-PAY-PERIOD-LIST-TOTALS` (list column polish) — idle-ok.
- Not claimed: LIVE · e2e_ready · module UAT.

## next_owner

**qc**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QC-SUMMARY-CARDS-01
from_role: pm
to_role: qc
lane: governance
priority: P3
parent: PO-HRM-PAYROLL-FORMULA-RUN-GAP-W3-QA-SUMMARY-CARDS-01
resume_chunk: K6.5

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.md (stamp PAYW3SUMQA-MSIWD3MS)
- docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01.json
- docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-w3-qa-summary-cards-01/04-after-f5.png
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-fe-summary-cards-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-process-post-02.md (must_keep GWC)

Mission: QC gate R-PAY-W3-FE-SUMMARY-ZERO browser slice.
1. Audit QA stamp PAYW3SUMQA-MSIWD3MS — cards Gross/Net 12.345.000 ₫ = line/API on cf38deac; source line_aggregate; F5.
2. Confirm honesty payroll_e2e_ready=false · LIVE DENIED · no seed · process-post GWC/TDZ/SRC NOT reopened.
3. Verdict GO WITH CONDITIONS (slice) or NO-GO — cấm flip e2e_ready / claim module UAT / J-HRM-07 full DONE.
4. evidence_path: docs/qa/evidence/po-hrm-payroll-formula-run-gap-w3-qc-summary-cards-01.md
ack_status: PASS_TO_PM
```

## ack_status

**`PASS_TO_PM`**
