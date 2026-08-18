# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-SRC-02-01` |
| **parent** | `PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-SRC-02-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** |
| **date** | 2026-08-07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **journey** | **J-HRM-07** PROCESS + C&B SRC-02 |
| **U65** | zero-seed · FE C&B + payroll process · Network 2xx + F5 |
| **honesty** | **`payroll_e2e_ready=false`** · ATT-412 if sheet open |
| **stamp** | `SRCSRC02-ISBDZW` |
| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-01.FINAL.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-src-02-01/` |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-emp-salary-history-qa-src-02-01.mjs` |

## Click path (U65)

1. Login `ceo@xe.vn` → portal `:5173`
2. **TDZ gate:** `/hr/payroll` → Tính lương → Danh sách → `[data-testid=pay-batches-precision]` visible · **no** `showAddDialog` ReferenceError (**R-PAY-BATCHES-SHOWADD-TDZ CLOSED** for this run)
3. Employee `/hr/employees/:id?tab=contract` → tab **Đãi ngộ** (FE save 🟡 — no POST 2xx; product-path mirror FE C&B payload ≠ seed)
4. Sole empty draft period bind template OV-C (const **7_500_000**) on `base` + `phu_cap_an` → enroll 1 emp → PROCESS **201 HRM-PAY-202**
5. GET payslip lines: `base=13_579_000` · `phu_cap_an=777_000` · `source_ref=emp_cb:package:…:line:…` · **≠** override 7.5M
6. F5 payroll list stable · console no Uncaught

## HDSD / inventory (U76)

| Surface | Observed |
|---------|----------|
| Payroll batches list | `pay-batches-precision` · Lập bảng lương |
| Employee Contracts | Tab Đãi ngộ · Tạo gói / revise |
| Payslip lines GET | `/payroll/payslips/:id/lines` 200 |

## Honesty locks

| Flag | Value |
|------|-------|
| `payroll_e2e_ready` | **false** |
| Seed | **DENIED** |
| AMIS DONE / module UAT / formula LIVE | **DENIED** |
| R-PAY-BATCHES-SHOWADD-TDZ | **PASS** this run (precision mounts) |

## AC matrix

| AC | Verdict | Notes |
|----|---------|-------|
| **L0** | 🟢 PASS | {"hrm":200,"xbos":200,"portal":200} |
| **SETUP-TPL** | 🟢 PASS | tpl=f7728741-6894-469f-a015-ea3bf7bf6ade linesOk=true ovr=true baseSc=4a8b7dc4-cc62-4463-92ca-0c860d05016f anSc=23bd4a1b-4795-4fe6-8388-0d39be0ced55 |
| **TDZ-GATE** | 🟢 PASS | pay-batches-precision visible · no showAddDialog TDZ |
| **FE-CB-COMPONENT** | 🟡 PARTIAL | feOk=false hasComponentCode=true allowMapped=true base=13579000 an=777000 |
| **F5-STABLE** | 🟢 PASS | reload after process |
| **AC-PAY-SRC-01** | 🟢 PASS | proc=true code=HRM-PAY-202 tier=emp_cb base=13579000@emp_cb an=777000@emp_cb cbBase=13579000 cbAn=777000 lines=2 get=200/HRM-PAY-200 |
| **VAL-PAY-SRC-02A** | 🟢 PASS | an=777000@emp_cb ref=emp_cb:package:ab2c7c78-8b89-4f59-a84e-6f99df05763c:line:d6d116da-1fa0-4815-a48f-6bc9825b52b0 |
| **VAL-PAY-SRC-02B** | 🟢 PASS | overrideWon=false historyWins=true ovrConst=7500000 baseAmt=13579000 anAmt=777000 |
| **UF-CONSOLE** | 🟢 PASS | uncaught=0 |

## Key steps

- `{"name":"att_sheets","closed":true,"bounds":{"start":"2026-09-01","end":"2026-09-30","ymd":"2026-09-01","year":2026,"month":9}}`
- `{"name":"override_formula","id":"f4460176-3335-4856-b924-caa95163fad0","active":true,"createStatus":201,"createCode":"HRM-PAY-FORMULA-201","createMsg":"Pay formula draft created","submitStatus":201,"submitCode":"HRM-PAY-FORMULA-200","pubSta`
- `{"name":"template_lines","status":200,"code":"HRM-PAY-TPL-200","linesOk":true,"codes":["base","phu_cap_an"]}`
- `{"name":"pick_emp","id":"0772bd42-48fb-48f5-ae0f-e074246712cb","code":"UAT-0021","company":"holding"}`
- `{"name":"fe_money_input_count","n":5}`
- `{"name":"fe_allow_input_count","an":2}`
- `{"name":"fe_cb","ok":false,"posts":[]}`
- `{"name":"product_path_cb_fallback","status":201,"code":"HRM-COMP-201"}`
- `{"name":"active_pkg","lines":[{"type":"base","component_code":"base","allowance_code":null,"amount":13579000},{"type":"allowance","component_code":"phu_cap_an","allowance_code":"PHU_CAP_AN","amount":777000},{"type":"allowance","component_co`
- `{"name":"pick_sole_period","periodId":"bb206be7-3195-410f-9979-85a5215c127b","label":"QA-SRC-BE02-EMP-CB","employeeId":"0772bd42-48fb-48f5-ae0f-e074246712cb","eligibleCount":53}`
- `{"name":"browser_period","createOk":false,"periodId":null,"posts":[]}`
- `{"name":"bind_tpl","status":201,"code":"HRM-PAY-TPL-200","message":"Pay sheet template bound to period"}`
- `{"name":"enroll","status":201,"code":"HRM-PAY-ENROLL-200","message":"Payroll period enrolled"}`
- `{"name":"process_api","status":201,"code":"HRM-PAY-202","message":"Payroll period processed"}`
- `{"name":"payslip_lines","payslipId":"e9903a23-fe1e-4b39-acb2-a0603007e952","gross":14356000,"status":"processed","linesStatus":200,"linesCode":"HRM-PAY-200","lines":[{"component_code":"base","amount":13579000,"source_ref":"emp_cb:package:ab`

## Residuals

- **R-EMP-SH-FE-CB-CLICK** · dev-fe: FE Đãi ngộ save did not POST 2xx — product-path mirror used for PROCESS SRC assert (≠ seed)
- **R-PAY-SRC-TIER-FIELD** · dev-be: GET payslip lines returns source_ref emp_cb:* but source_tier column may be absent in response — asserted via source_ref prefix

## Honesty / non-claims

- `payroll_e2e_ready=false`
- No `pnpm seed:*` / DB fake
- No AMIS parity DONE / module UAT / formula LIVE claim

## completion_report

Closed: U65 J-HRM-07 SRC-02 browser stamp SRCSRC02-ISBDZW. TDZ: 🟢 PASS; FE-CB: 🟡 PARTIAL; AC-PAY-SRC-01: 🟢 PASS; VAL-02A: 🟢 PASS; VAL-02B: 🟢 PASS. Honesty: payroll_e2e_ready=false; no seed; no AMIS DONE.

## next_owner

qc

## next_dispatch_prompt

```text
work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-SRC-02-01
from_role: pm
to_role: qc
lane: governance
GWC AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md
honesty: payroll_e2e_ready=false · no AMIS DONE
```

## evidence_path

`docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-src-02-01.md`

## ack_status

**PASS_TO_PM**