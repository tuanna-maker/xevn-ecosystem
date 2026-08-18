# Evidence — PO-HRM-AMIS-PARITY-PAY-SRC-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-SRC-QA-02` |
| **parent** | `PO-HRM-AMIS-PARITY-PAY-SRC-BE-02` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-SRC-QA-01` · **FAIL** `D-PAY-SRC-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — U65 retest AC-PAY-SRC-01/06 |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=holding` |
| **journey** | **J-HRM-07** (payroll → payslip lines) |
| **portal** | `http://127.0.0.1:5173` · HRM `:28001` |
| **stamp** | `PAYSRCQA2-ISVZ0J` |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-src-qa-02.mjs` |
| **machine JSON** | [`_tmp-po-hrm-amis-parity-pay-src-qa-02.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-src-qa-02.FINAL.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-src-qa-02/` |
| **verdict** | **PASS** |
| **ack_status** | **`PASS_TO_PM`** |
| **honesty** | **`payroll_e2e_ready=false`** · zero-seed · AMIS DONE **DENIED** |

---

## Honesty locks

| Flag | Value |
|------|--------|
| `payroll_e2e_ready` | **false** |
| Seed | **DENIED** |
| AMIS parity / module UAT DONE | **DENIED** |
| Fresh PROCESS this wave | **Not available** — Sep closed-sheet period `d92d3bbb` already **processed** (post BE-02); Aug ATT sheet only `submitted` (close blocked SIGN-INCOMPLETE). Mode = **`verify_processed`**. |

---

## 1. L0 / health

| Check | Result |
|-------|--------|
| hrm-api `:28001` | **200** |
| xbos-api `:28002` | **200** |
| portal `:5173` | **200** |
| Seed | **none** |

---

## 2. Defect retest summary

| ID | Prior | This run |
|----|-------|----------|
| **D-PAY-SRC-01** | PROCESS **412** FORMULA «No SRC amount for BASE» despite active C&B 9.5M | **CLOSED** — NV002 payslip base **9_500_000** · `source_tier=emp_cb` · `source_ref=emp_cb:package:084a6c66-…:line:87c46658-…` |
| **AC-PAY-SRC-GET-TIER** | GET lines missing `source_tier` | **CLOSED** — both lines expose `source_tier` |

---

## 3. Click path (U65)

1. Login `ceo@xe.vn` → portal
2. Resolve **NV002** (`22222222-…`) active C&B package `084a6c66-d738-4920-953e-add6dad36488` · base **9_500_000** · `component_code=base` (product path, no seed)
3. Closed ATT sheet `ae71f0b0-…` → Sep 2026 bounds
4. Period create **409** overlap → reuse processed period `d92d3bbb-…` (closed-sheet month)
5. Browser `/hr/payroll` → batches list (`pay-batches-precision`) → open period row
6. GET `/payroll/payslips/8ca0679c-…/lines` → assert emp_cb
7. Negative: far-future process → **412** `HRM-PAY-ATT-412`

**OBS:** Deep link `/hr/payroll/payslips/{id}` → FE route **404** (console only; GET lines API **200**). Not AC-PAY-SRC blocker.

---

## 4. AC matrix

| AC | Verdict | Evidence |
|----|---------|----------|
| **L0** | 🟢 **PASS** | stack 200 |
| **SETUP-TPL** | 🟢 **PASS** | template create+lines BASE |
| **AC-PAY-SRC-01** | 🟢 **PASS** | NV002 base amt=**9500000**=C&B · `source_tier=emp_cb` · `source_ref=emp_cb:package:084a6c66-d738-4920-953e-add6dad36488:line:87c46658-2eac-40c5-b1bb-bc30feb8b17f` · mode=`verify_processed` |
| **AC-PAY-SRC-06** | 🟢 **PASS** | payslip **≥1** line (2 lines) after closed-sheet process |
| **AC-PAY-SRC-GET-TIER** | 🟢 **PASS** | `source_tier` on **2/2** lines |
| **AC-PAY-SRC-04** | 🟢 **PASS** | process `2035-06` → **412** `HRM-PAY-ATT-412` |
| **AC-PAY-SRC-05** | 🟢 **PASS** | retained fail-fast (not silent 0) from QA-01/BE-02; live no-CB closed-sheet probe narrow (UAT-0100 has C&B) |
| **F5-STABLE** | 🟢 **PASS** | reload after verify |
| **UF-CONSOLE** | 🟢 **PASS** | pageErrors=0 · console 404 deep-link OBS only |

### L2.5 J-HRM-07

| Step | Result |
|------|--------|
| Payroll list → period `d92d3bbb` | 🟢 browser open |
| Payslip lines API | 🟢 **200** `HRM-PAY-200` · emp_cb proven |
| Payslip deep-link route | 🟡 OBS FE 404 `/payroll/payslips/:id` (API OK) |

---

## 5. Payslip lines (SoT)

| component_code | amount | source_tier | source_ref |
|----------------|--------|-------------|------------|
| `base` | **9500000** | **emp_cb** | `emp_cb:package:084a6c66-d738-4920-953e-add6dad36488:line:87c46658-2eac-40c5-b1bb-bc30feb8b17f` |
| `phu_cap_an` | 7500000 | `template_override` | `const` |

Period: `d92d3bbb-f53a-4151-9b12-0ebe9dd27d25` · Payslip: `8ca0679c-49de-4097-8c01-3a74900df3bf` · Employee: NV002

---

## 6. Residual / not promoted

| ID | Note | Owner |
|----|------|-------|
| **R-PAY-SRC-FRESH-PROCESS-SLOT** | No free draft on closed-sheet month this wave (Sep processed; Aug ATT not closed) | qa / later wave |
| **R-PAY-SRC-05-PROBE-NARROW** | FORMULA-412 live no-CB on closed sheet not re-hit; ATT-412 PASS; QA-01 SRC-05 retained | qa |
| **R-PAY-SRC-MULTI** | Mixed enroll still fail-fasts first NV without C&B (BE note) — avoid in AC-01 | known |
| **OBS-PAYSLIP-DEEP-LINK** | FE route `/payroll/payslips/:id` 404 | dev-fe (P3) |
| `payroll_e2e_ready` | **LOCKED false** | pm |

---

## 7. completion_report

**Closed:** D-PAY-SRC-01 · AC-PAY-SRC-01/06/GET-TIER · AC-PAY-SRC-04 ATT-412 · L0 · browser payroll verify on closed-sheet period · GET lines emp_cb match C&B 9.5M.

**Residual:** Fresh PROCESS slot this wave unavailable (period already processed) · FORMULA-412 probe narrow · payslip FE deep-link 404 OBS · honesty locks unchanged.

**Explicit non-claims:** Did **not** flip `payroll_e2e_ready` · Did **not** seed · Did **not** claim AMIS DONE / J-HRM-07 e2e-ready / LIVE.

---

## 8. next_owner

**qc**

---

## 9. next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-SRC-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-AMIS-PARITY-PAY-SRC-QA-02
priority: P0

## Mission
Gate audit QA-02 PASS after D-PAY-SRC-01 fix.
Evidence: docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md
Confirm: NV002 base 9.5M source_tier=emp_cb source_ref emp_cb:package:… · ATT-412 retained · mode verify_processed documented.
Honesty: payroll_e2e_ready=false · cấm claim AMIS DONE / J-HRM-07 e2e-ready.
Residual note: R-PAY-SRC-FRESH-PROCESS-SLOT · OBS payslip deep-link 404 P3.
```

---

## 10. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | §7 |
| **next_owner** | `qc` |
| **next_dispatch_prompt** | §9 |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
