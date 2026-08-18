# Evidence — `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-03` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution — **U65 browser** Chi trả → wire-payment-batch |
| **priority** | P2 |
| **resume_chunk** | K6.4 |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-FE-01` READY_FOR_QA |
| **qc_l1_seal** | `PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-01` GWC L1 — **not reopened** |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **u65** | zero-seed · browser-only · FE after 2xx + F5 |
| **hdsd_align** | Tiền lương → **Chi trả lương** → **Chi trả** (`hdsd-pay-wire-btn`) → kỳ processed → submit |
| **ack_status** | **`PASS_TO_PM`** |
| **overall** | **PASS** |
| **stamp** | `PAYWIREQA3-IWB7V2` |
| **machine JSON** | [`_tmp-po-hrm-amis-parity-pay-payment-wire-qa-03-browser.json`](./_tmp-po-hrm-amis-parity-pay-payment-wire-qa-03-browser.json) |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-payment-wire-qa-03/` |
| **script** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-payment-wire-qa-03.mjs` |
| **closes** | **R-PAY-WIRE-FE** (browser UF) — **not** module UAT / AMIS Step7 DONE / J-HRM-07 |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | **DENIED** flip |
| **AMIS Step7 DONE** | **DENIED** | Browser wire UF only |
| **J-HRM-07 DONE** | **DENIED** | Not claimed |
| **Module payroll UAT** | **DENIED** | Slice ≠ module |
| **Seed** | **DENIED** | U65 · existing processed periods |
| **Rewrite BE wire** | **DENIED** | L1 spine QC-01 SEAL retained |
| **`C-SLICE-≠-MODULE`** | **RETAINED** | governance |

---

## Mission

U65 browser prove FE-01 CTA:

`Tiền lương → Chi trả lương → Chi trả → chọn kỳ processed → POST …/wire-payment-batch → 201 HRM-PAY-WIRE-201 → FE detail records → F5 giữ`

---

## Environment (L0)

| Check | Result |
|-------|--------|
| HRM `:28001/api/hrm` | **200** |
| XBOS `:28002/api/xbos` | **200** |
| portal `:5173` | **200** |
| Processed periods (API list) | **6** (`draft=23` · `closed=2`) — no seed |
| Chosen period (picker) | `cf38deac-…` · `QA-PAY-HIRE-1786011557288` · `company_id=main` |

### ENV OBS (not product FAIL)

First browser attempt hit **POST 500** while dual `dev:hrm-api` watchers fought `EADDRINUSE` / restart on `:28001`. After single healthy Nest listener, L1 probe + browser wire both **201**. Classified **ENV OBS** — not R-PAY-WIRE-DEPT-COL reopen (L1 SEAL held).

---

## Click path (HDSD · U65)

| Step | UI | Observed |
|------|-----|----------|
| 1 | `/hr/payroll` · tab **Chi trả lương** (`payroll-tab-payment`) | GET payment-batches **200** |
| 2 | **Chi trả** (`hdsd-pay-wire-btn`) | Dialog `pay-payment-wire-dialog-precision` |
| 3 | Period select (`hdsd-pay-wire-period-select`) | **6** options · selected `QA-PAY-HIRE-1786011557288 · 08/2026` |
| 4 | Name `QA-WIRE-FE-PAYWIREQA3-IWB7V2` · submit (`hdsd-pay-wire-submit`) | **POST** `…/periods/cf38deac-…/wire-payment-batch` |
| 5 | Network | **201** `HRM-PAY-WIRE-201` · body `{ company_id: main, name, payment_method: bank_transfer }` · `records_added=0` · `records_skipped=1` (idempotent) · batch `7d0b8e23-…` |
| 6 | FE sau 2xx | Toast idempotent · **auto-open detail** · records table **1** row (UAT-0100 / net display) |
| 7 | F5 → Chi trả lương → open batch | List + detail records **còn** |

---

## AC matrix

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| L0-STACK | HRM/XBOS/portal 200 | 200/200/200 | **PASS** |
| PRECOND-PROCESSED-PERIOD | ≥1 processed · no seed | 6 processed | **PASS** |
| NAV-PAYMENT-TAB | Chi trả lương | `payroll-tab-payment` | **PASS** |
| WIRE-DIALOG-OPEN | Dialog precision | visible | **PASS** |
| PICK-PROCESSED-PERIOD | Select processed | 6 opts · HIRE period | **PASS** |
| POST-WIRE-201 | 201 `HRM-PAY-WIRE-201` | 201 · code OK · idempotent skip | **PASS** |
| POST-BODY-COMPANY-ID | body `company_id` | `main` | **PASS** |
| FE-DETAIL-RECORDS | open detail + records | onDetail · rows=1 | **PASS** |
| FE-LIST-REFRESH | list after 2xx | batch/records visible | **PASS** |
| F5-PERSIST | F5 giữ | list + detail rows=1 | **PASS** |
| HONESTY-LOCKS | ready=false · no AMIS/J/module | Held | **PASS** |
| CONSOLE-GATE | no Uncaught/Ref/Type | PASS (2 soft errors) | **PASS** |

### Network stamp

```text
POST /api/hrm/payroll/periods/cf38deac-8b64-474d-9aee-b34249c0f5a1/wire-payment-batch
→ 201 HRM-PAY-WIRE-201
body: { company_id: "main", name: "QA-WIRE-FE-PAYWIREQA3-IWB7V2", payment_method: "bank_transfer" }
data: batch_id=7d0b8e23-… · records_added=0 · records_skipped=1 · payslip_count=1
```

---

## Residual / not promoted

| ID | Status | Note |
|----|--------|------|
| **R-PAY-WIRE-FE** | **CLOSED** browser | FE CTA → 201 → detail → F5 |
| L1 wire spine (QC-01) | **SEAL retained** | Not reopened / not rewritten |
| **`payroll_e2e_ready=true`** | **DENIED** | |
| AMIS Step7 DONE / J-HRM-07 / module UAT / Phase1 | **DENIED** | `C-SLICE-≠-MODULE` |
| OBS duplicate `pay-payment-precision` testid | P3 FE polish | KPI grid + table card — harness used wire CTA |
| OBS idempotent name | OK | Prior L1/probe batch name kept; skip path accepted per FE-01 |
| ENV OBS dual hrm-api / EADDRINUSE | ops | Stabilize single `:28001` listener for UAT |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready`.
- Did **not** claim AMIS Step7 / J-HRM-07 / module payroll UAT.
- Did **not** seed.
- Did **not** rewrite BE wire (L1 SEAL).
- Browser UF PASS ≠ full payroll e2e / process-all / close chain UAT.

---

## completion_report

### Closed

1. U65 browser Chi trả wire CTA after FE-01 — stamp **`PAYWIREQA3-IWB7V2`**.  
2. **POST 201** `HRM-PAY-WIRE-201` with body `company_id=main`.  
3. FE after 2xx: toast + auto-open detail + **1** record; F5 persist.  
4. **R-PAY-WIRE-FE** CLOSED at browser UF.  
5. Honesty: `payroll_e2e_ready=false` · DENIED AMIS / J-HRM-07 / module UAT · L1 QC-01 SEAL not reopened.

### Residual

- `C-SLICE-≠-MODULE` retained.  
- P3 OBS duplicate testid / env dual-watcher (idle-ok unless PM opens polish).

---

## Handoff

| Field | Value |
|-------|--------|
| **next_owner** | **qc** |
| **ack_status** | **`PASS_TO_PM`** |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-03.md` |
| **payroll_e2e_ready** | **false** |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-QA-03
priority: P2
resume_chunk: K6.4

## Mission
QC gate browser Chi trả wire UF after QA-03 PASS. Retain L1 QC-01 SEAL (cấm reopen API spine).

## read_first
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qa-03.md
- docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-payment-wire-qa-03-browser.json
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-fe-01.md
- docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-01.md (L1 GWC SEAL)

## entry_criteria
- QA-03 PASS stamp PAYWIREQA3-IWB7V2 · POST 201 HRM-PAY-WIRE-201 · FE detail+F5
- payroll_e2e_ready=false · U65 zero-seed

## exit_criteria
- GO WITH CONDITIONS (or GO) for browser R-PAY-WIRE-FE slice only
- CLOSE R-PAY-WIRE-FE as browser UF
- RETAIN L1 QC-01 SEAL · C-SLICE-≠-MODULE
- DENY payroll_e2e_ready=true / AMIS Step7 DONE / J-HRM-07 / module UAT
- evidence: docs/qa/evidence/po-hrm-amis-parity-pay-payment-wire-qc-02.md

## cấm
flip payroll_e2e_ready · claim AMIS DONE / J-HRM-07 / module UAT · reopen L1 wire BE rewrite
```
