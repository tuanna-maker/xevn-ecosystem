# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01` |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01` |
| **defect** | `R-PAY-SRC-TIER-FIELD` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **journey** | **J-HRM-07** GET lines `source_tier` (SRC-02 path retain) |
| **U65** | zero-seed · browser payroll F5 · Network GET lines |
| **honesty** | **`payroll_e2e_ready=false`** · cấm seed · cấm AMIS DONE |
| **stamp** | `SRCTIER-ISPYVE` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-amis-parity-emp-salary-history-qa-tier-01.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-tier-01/` |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-emp-salary-history-qa-tier-01.mjs` |

## Mission assert (STRICT)

Every line with `source_ref` matching `emp_cb:*` MUST have:
1. **`source_tier` key present** on JSON object (`hasOwnProperty`)
2. **`source_tier === "emp_cb"`** — **not** inferred only from `source_ref` prefix

## Click path (U65)

1. Login `ceo@xe.vn` → portal
2. `/hr/payroll` → Tính lương / Danh sách · TDZ gate `pay-batches-precision`
3. F5 stable
4. GET `/payroll/payslips/e9903a23-fe1e-4b39-acb2-a0603007e952/lines` (SRC-02 PROCESS path reuse — mission allows)
5. Assert tier key + retain AC-PAY-SRC-01 / VAL-02A/B amounts

## HDSD / inventory (U76)

| Surface | Observed |
|---------|----------|
| Payroll batches | `pay-batches-precision` / list |
| Payslip lines GET | `/payroll/payslips/:id/lines` 200 + `source_tier` |

## Honesty locks

| Flag | Value |
|------|-------|
| `payroll_e2e_ready` | **false** |
| Seed | **DENIED** |
| AMIS DONE / module UAT / formula LIVE | **DENIED** |

## AC matrix

| AC | Verdict | Notes |
|----|---------|-------|
| **L0** | 🟢 PASS | {"hrm":200,"xbos":200,"portal":200} |
| **AUTH** | 🟢 PASS | ceo@xe.vn |
| **TDZ-GATE** | 🟢 PASS | precision=true showAddDialogErr=false |
| **F5-STABLE** | 🟢 PASS | reload payroll after browse |
| **AC-PAY-SRC-GET-TIER** | 🟢 PASS | emp_cb_refs=2 failures=[] get=200/HRM-PAY-200 |
| **R-PAY-SRC-TIER-FIELD** | 🟢 CLOSED | GET lines expose source_tier===emp_cb with key present (no prefix-only assert) |
| **AC-PAY-SRC-01** | 🟢 PASS | base=13579000@emp_cb an=777000@emp_cb expect base=13579000 an=777000 |
| **VAL-PAY-SRC-02A** | 🟢 PASS | an=777000@emp_cb ref=emp_cb:package:ab2c7c78-8b89-4f59-a84e-6f99df05763c:line:d6d116da-1fa0-4815-a48f-6bc9825b52b0 |
| **VAL-PAY-SRC-02B** | 🟢 PASS | overrideWon=false historyWins=true ovrConst=7500000 |
| **UF-CONSOLE** | 🟢 PASS | uncaught=0 |

## Key steps

- `{"name":"payslip_lines_get","payslipId":"e9903a23-fe1e-4b39-acb2-a0603007e952","status":200,"code":"HRM-PAY-200","total":2,"lines":[{"component_code":"base","amount":13579000,"source_ref":"emp_cb:package:ab2c7c78-8b89-4f`
- `{"name":"tier_assert","emp_cb_ref_count":2,"failures":[],"pass":true}`
- `{"name":"payslip_by_id","status":200,"code":"HRM-PAY-200","nested_lines":2,"nested_tier_sample":[{"component_code":"base","source_tier":"emp_cb","has_key":true},{"component_code":"phu_cap_an","source_tier":"emp_cb","has_`

## Residuals

- **R-EMP-SH-FE-CB-CLICK** · dev-fe: Unchanged from QA-SRC-02 — FE Đãi ngộ save POST still open (not in this tier scope)

## Honesty / non-claims

- `payroll_e2e_ready=false`
- No `pnpm seed:*` / DB fake
- No AMIS parity DONE / module UAT / formula LIVE claim

## completion_report

Closed: U65 R-PAY-SRC-TIER-FIELD retest stamp SRCTIER-ISPYVE. GET-TIER: 🟢 PASS; AC-PAY-SRC-01: 🟢 PASS; VAL-02A: 🟢 PASS; VAL-02B: 🟢 PASS; F5: 🟢 PASS. Honesty: payroll_e2e_ready=false; no seed; no AMIS DONE.

## next_owner

qc

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-TIER-01
from_role: pm
to_role: qc
lane: governance
GWC R-PAY-SRC-TIER-FIELD CLOSED + AC-PAY-SRC-01 / VAL-02A/B retain
evidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md
honesty: payroll_e2e_ready=false · no AMIS DONE
```

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md`

## ack_status

**PASS_TO_PM**
