# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01` READY_FOR_QA |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API R-PAY-F-CB-BAG** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC-CB1..AC-CB4 L1 honesty |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-cb-bag-01.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-cb-bag-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-cb-bag-01.mjs` (+ focused FINAL recheck) |
| **stamp** | `PAYFECB-MSIIFNL` (FINAL) · PROCESS success path `PAYFECB-RETRY3` |
| **portal_url** | `http://127.0.0.1:5173` |
| **spec_ref** | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` §4.4 · §5 · §7 |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Preview + process keep ready=false / not promoted |
| **Formula LIVE** | **DENIED** | Staged `gd1_eval_v1` subset only (`STAGED_EVAL_SUBSET` / `NOT_CUSTOMER_UAT`) |
| **Browser UF / J-HRM-07** | **DENIED** | L1 API only |
| **Seed** | **DENIED** | U65 — used **product-path** `POST /contracts-insurance/compensation-packages` (≠ `pnpm seed:*`) |
| **Module UAT / Phase1** | **DENIED** | Slice residual ATT-LINE + FE emit + no GET payslip_lines |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM/XBOS/portal **200** (Windows UV assert noise — health rows PASS) |
| Pre-test process | Stale — HRM PID started **12:06** · dist C&B bag **12:22** |
| QA recovery (R-PAY-F-STALE-DIST) | `pnpm --filter hrm-api build` + kill `:28001` + `pnpm --filter hrm-api run start:prod` → PID **26840** Start **12:26:28** |
| Dist marker | `pay-formula-variable-bag.js` present · `expandCbReadCompanyIds` / `CB_PACKAGE_*` |
| Auth | Portal login · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Author | `ceo@xe.vn` / `Xevn@2026` |
| Publisher (dual) | `admin@xe.vn` / `Xevn@2026` |

---

## AC matrix (L1 R-PAY-F-CB-BAG)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **CB-preview** | `gd1_eval_v1` + `employeeId` · **no** `variableOverrides` → compute from CORE C&B | **201** gross **12_000_000** · lines **2** · `payroll_e2e_ready=false` · warning `CB_PACKAGE_SOURCE:scoped_package` (HLD-0001) | **PASS** |
| **AC-CB1** | PROCESS + published `gd1_eval_v1` + real C&B `base_salary` → **2xx** + amounts / payslip_lines path | Period `38674cc1…` (Jul closed sheet) · sole payslip **NV002** · product-path C&B base **9_500_000** → PROCESS **201** `HRM-PAY-202` · summary gross **9_500_000** net **8_550_000** · payslip `processed` | **PASS** |
| **AC-CB2** | Missing C&B → `HRM-PAY-FORMULA-412-VARS` · no silent 0₫ | Sep draft period process → **412** `HRM-PAY-FORMULA-412-VARS` · `missingVars:[base_salary]` · warnings include `CB_PACKAGE_ABSENT` · emp without package | **PASS** |
| **AC-CB3** | Open ATT month → `HRM-PAY-ATT-412` | Draft 2033-04 → **412** `HRM-PAY-ATT-412` | **PASS** |
| **AC-CB4** | No active published formula → `HRM-PAY-FORMULA-412` | After retire all actives → **412** `HRM-PAY-FORMULA-412` · *refuse silent zero process* | **PASS** |

### Live C&B inventory note

- Initial list `compensation-packages` main/holding **total=0** (no pre-existing CORE packages).
- U65: created packages via **product API** `POST …/compensation-packages` (mirrors FE C&B save) — **not** seed scripts.
- Packages used: HLD-0001 `49e79114…` (base 12M from 2026-01-01); NV002 `084a6c66…` (base 9.5M from 2026-06-01).

### PROCESS period strategy (test hygiene)

| Attempt | Result | Learning |
|---------|--------|----------|
| Reused Sep period `d92d3bbb` (53 payslips) after C&B on HLD-0001 only | **412 VARS** on **NV002** first | PROCESS fails closed on **first** enrolled emp without bag — not a bag regression |
| Empty Feb-mislabelled period | **ATT-412** / enroll empty | Period start TZ must match closed sheet month |
| Jul period `38674cc1` with **1** payslip + C&B for that emp | **201** success | Correct isolation for sole-emp PROCESS |

### Payslip lines OBS

- PROCESS invokes `replacePayslipLines` (BE path) · preview returns **2** lines for C&B evaluate.
- Public **GET** `/payroll/payslips/:id` / `…/lines` → **404** (route not shipped) — **OBS P2** · amounts on list payslip prove evaluate used C&B; do **not** claim browser line UI.

---

## Key runtime excerpts

### Preview bag (no overrides)
```text
POST /payroll/formulas/{id}/preview { employeeId: HLD-0001 }
→ 201 HRM-PAY-FORMULA-200
  gross=12000000 net=10800000 lines=2
  payroll_e2e_ready=false
  warnings: … CB_PACKAGE_SOURCE:scoped_package … NOT_CUSTOMER_UAT
```

### PROCESS with C&B
```text
POST /payroll/periods/38674cc1-…/process
→ 201 HRM-PAY-202
  payslip_summary: { total_gross: 9500000, total_net: 8550000 }
  formula_bind: { code: qa_cb_r3_…, source: company_active }
GET /payroll/payslips?period_id=… → NV002 status=processed gross=9500000 net=8550000
```

### Missing C&B / ATT / no formula
```text
PROCESS Sep multi-emp → 412 HRM-PAY-FORMULA-412-VARS (CB_PACKAGE_ABSENT)
PROCESS 2033-04 open → 412 HRM-PAY-ATT-412
PROCESS after retire all active → 412 HRM-PAY-FORMULA-412
```

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| **R-PAY-F-CB-BAG** | L1 PROCESS+C&B success | **CLOSED** this seat |
| **R-PAY-F-ATT-LINE** | `att_timesheet_line` → hours LIVE | ATT / ba-data → **dev-be** |
| **R-PAY-FE-OPAQUE→EVAL** | FE emit `gd1_eval_v1` | **dev-fe** optional |
| **R-PAY-F-STALE-DIST** | Post-READY restart SOP | **CONDITION OK** — QA rebuilt+restarted |
| **R-PAY-PAYSLIP-LINES-GET** | No public GET lines | **OBS P2** → **dev-be** later |
| **`payroll_e2e_ready`** | LOCKED false | **pm** |
| Browser process UF / J-HRM-07 | — | **DENIED** until ATT+browser |

### Explicit non-claims

- Did **not** flip `payroll_e2e_ready` / claim formula LIVE / Phase1 / module UAT.
- Did **not** seed (`pnpm seed:*` / DB fake).
- Did **not** invent browser UF or claim J-HRM-07 process UAT.
- Did **not** treat `salary_components.formula` as engine.

---

## completion_report

### Closed

1. Stale-dist SOP — rebuild + `start:prod` so C&B variable bag live.  
2. L1 AC-CB1..4 **PASS** — C&B preview · PROCESS 2xx amounts · VARS · ATT-412 · FORMULA-412.  
3. **R-PAY-F-CB-BAG** L1 closed.  
4. Honesty: `payroll_e2e_ready=false`.  
5. Evidence MD + FINAL JSON stamp `PAYFECB-MSIIFNL`.

### Residual

ATT line · FE gd1_eval emit · payslip lines GET OBS · module/browser UAT DENIED.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC slice GWC on R-PAY-F-CB-BAG L1 · **cấm** flip `payroll_e2e_ready` / claim formula LIVE |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-CB-BAG-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-CB-BAG-01 PASS_TO_PM (L1 R-PAY-F-CB-BAG)
priority: P0

## Mission
QC gate L1 C&B bag after BE-CB-BAG + QA-CB-BAG:
1. Audit docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md + FINAL JSON stamp PAYFECB-MSIIFNL
2. Confirm: preview employeeId no overrides → compute ready=false + CB_PACKAGE_SOURCE; PROCESS with real C&B → 2xx amounts; missing C&B → FORMULA-412-VARS; ATT-412 / FORMULA-412 retained
3. Retain residuals R-PAY-F-ATT-LINE · R-PAY-FE-OPAQUE→EVAL · payslip lines GET OBS · C-SLICE-≠-MODULE
4. GO WITH CONDITIONS or NO-GO — cấm flip payroll_e2e_ready / claim formula LIVE / module UAT / Phase1

read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-cb-bag-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-cb-bag-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md

evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-cb-bag-01.md
honesty: payroll_e2e_ready=false
```
