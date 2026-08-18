# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-FE-EVAL-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-FE-EVAL-01` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01` READY_FOR_QA |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **browser U65** gd1_eval_v1 author + Nest preview |
| **date** | 2026-08-07 |
| **priority** | P1 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC1–AC7 browser UF |
| **portal_url** | `http://127.0.0.1:5173` |
| **journey_l25** | Formula author + Nest preview (gd1_eval_v1) — **not** full J-HRM-07 process UAT |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.mjs` |
| **stamp** | `PAYFEVAL-MSII5NC4` |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-qa-fe-eval-01/` |
| **commit** | `dc930c5` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Badge + preview amounts · **DENIED** promote |
| **Formula LIVE / customer UAT** | **DENIED** | Preview path = staged Nest compute only |
| **J-HRM-07 process UAT** | **DENIED** | This seat = author + preview UF only |
| **Seed** | **DENIED** | U65 zero-seed · browser form only |
| **DnD canvas / FE net engine** | **DENIED** | `dndSurface=0` · amounts from Nest only |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM/XBOS/portal **200** (Windows UV assert noise — health rows PASS) |
| `qc:fe-be-health` | **ALL PASS** |
| Formulas probe (no auth) | **401** (route present — not 404 stale dist) |
| Auth | Portal login `ceo@xe.vn` · Bearer inject · `company_id=main` |
| Persona | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |

---

## Click path (U65)

```text
login (API inject) → /hr/payroll?portal=1&companyId=main
  → payroll-tab-formulas (Công thức lương)
  → pay-formula-author-panel · pay-formula-eval-lines
  → fill code + label + note
  → author lines: BASE var base_salary + DED_TAX expr mul(base_salary, 0.1)
  → preview overrides: base_salary=8000000 · payable_hours=176
  → hdsd-pay-formula-save → POST /api/hrm/payroll/formulas 201
       body expressionJson.form=gd1_eval_v1 · lines=2 · staged=true
  → FE list row (label+code)
  → F5 → re-open formulas tab → row còn → click row → lines hydrate
  → hdsd-pay-formula-preview → POST …/preview 201 OK-COMPUTE
       Gross 8.000.000 · Deduction 800.000 · Net 7.200.000 · ready=false
  → hdsd-pay-formula-submit-publish → 201 pending_publish
  → hdsd-pay-formula-publish (same actor) → 403-DUAL toast
```

**Draft under test:** code `qa_feval_payfeval_msii5nc4` · label `Công thức FE-EVAL browser PAYFEVAL-MSII5NC4`

---

## UF evidence blocks

### UF-PAY-FE-EVAL-01 — Author lines + Lưu nháp gd1_eval_v1

| Field | Value |
|-------|--------|
| Persona / URL | `ceo@xe.vn` · `http://127.0.0.1:5173/hr/payroll?portal=1&companyId=main` |
| Click path | Tab Công thức lương → fill code/label → BASE + DED_TAX lines → Lưu bản nháp |
| Network | **POST** `/api/hrm/payroll/formulas` → **201** · `expressionJson.form=gd1_eval_v1` · `dialect=gd1_eval_v1` · `staged=true` · lines `[BASE var base_salary, DED_TAX expr mul]` |
| FE sau 2xx | List row nhãn+mã `qa_feval_payfeval_msii5nc4` |
| F5 | Row còn · reopen → hydrate BASE/`base_salary` + line1 DED_TAX · marker `gd1_eval_v1` |
| Verdict | 🟢 PASS |
| Seed/probe-only | **cấm** — browser only |

### UF-PAY-FE-EVAL-02 — Preview Nest + variableOverrides

| Field | Value |
|-------|--------|
| Click path | Biến xem trước → `base_salary=8000000` · `payable_hours=176` → Xem trước (Nest) |
| Network | **POST** `…/formulas/{id}/preview` → **201** · body `variableOverrides={payable_hours:176,base_salary:8000000}` |
| FE sau 2xx | Panel `pay-formula-preview-result` **(OK-COMPUTE)** · `pay-formula-preview-amounts` Gross **8.000.000 ₫** · Khấu trừ **800.000 ₫** · Net **7.200.000 ₫** · `payroll_e2e_ready=false` · Dòng: 2 |
| Honesty | Copy «Máy chủ đã tính staged (gd1_eval_v1) — payroll_e2e_ready=false · không phải LIVE» |
| Verdict | 🟢 PASS (OK-COMPUTE path; honest-412 path not exercised this run — bag complete via overrides) |

### UF-PAY-FE-EVAL-03 — Dual-control retained

| Field | Value |
|-------|--------|
| Click path | Gửi phát hành → Phát hành (cùng actor) |
| Network | submit-publish **201** · publish **403** `HRM-PAY-FORMULA-403-DUAL` |
| FE sau | Toast «Bị chặn dual-control…» — **không** silent 2xx |
| Verdict | 🟢 PASS |

---

## AC matrix (browser)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **1** Tab + eval UI + honesty | Panel + eval lines + badge false | `pay-formula-eval-lines` · badge `payroll_e2e_ready=false` | **PASS** |
| **2** Author lines | BASE var + DED_TAX expr | line-0 + line-1 authored | **PASS** |
| **3** Save `gd1_eval_v1` | POST/PUT body form=gd1_eval_v1 · FE row | **201** · form=`gd1_eval_v1` · lines=2 · FE row | **PASS** |
| **4** F5 hydrate | Row + lines + marker | BASE/base_salary · line1 · marker `gd1_eval_v1` | **PASS** |
| **5** Preview Nest | 200/201 OK-COMPUTE **or** honest 412 | **201** OK-COMPUTE · gross/net · ready=false · overrides sent | **PASS** |
| **6** Dual-control | 403-DUAL not silent | **403** `HRM-PAY-FORMULA-403-DUAL` + toast | **PASS** |
| **7** HDSD · no DnD · honesty | inventory · dnd=0 | missing=[] · dndSurface=0 · honesty false | **PASS** |

---

## Network body (documented)

**Save POST `expressionJson`:**

```json
{
  "form": "gd1_eval_v1",
  "note": "U65 FE-EVAL gd1_eval_v1 PAYFEVAL-MSII5NC4",
  "lines": [
    { "component_code": "BASE", "sign": "earning", "source": "var", "var": "base_salary" },
    { "component_code": "DED_TAX", "sign": "deduction", "source": "expr", "expr": { "op": "mul", "left": "base_salary", "right": 0.1 } }
  ],
  "dialect": "gd1_eval_v1",
  "staged": true
}
```

**Preview POST:**

```json
{
  "company_id": "main",
  "variableOverrides": { "payable_hours": 176, "base_salary": 8000000 }
}
```

---

## HDSD inventory (U76)

| testid | Seen |
|--------|------|
| `payroll-tab-formulas` | ✅ |
| `pay-formula-author-panel` | ✅ |
| `pay-formula-honesty-badge` | ✅ |
| `pay-formula-eval-lines` | ✅ |
| `hdsd-pay-formula-code` | ✅ |
| `hdsd-pay-formula-label` | ✅ |
| `hdsd-pay-formula-note` | ✅ |
| `hdsd-pay-formula-expression` | ✅ (hidden marker = `gd1_eval_v1`) |
| `hdsd-pay-formula-add-line` | ✅ |
| `hdsd-pay-formula-seed-lines` | ✅ |
| `hdsd-pay-formula-line-0` | ✅ |
| `hdsd-pay-formula-line-1` | ✅ (extra) |
| `pay-formula-preview-overrides` | ✅ |
| `hdsd-pay-formula-preview-var-base_salary` | ✅ |
| `hdsd-pay-formula-save` | ✅ |
| `hdsd-pay-formula-submit-publish` | ✅ |
| `hdsd-pay-formula-publish` | ✅ |
| `hdsd-pay-formula-preview` | ✅ |
| `pay-formula-list-table` | ✅ |
| `pay-formula-preview-result` | ✅ |
| `pay-formula-preview-amounts` | ✅ (after OK-COMPUTE) |
| **missing** | **[]** |

---

## Process / console

| Signal | Value |
|--------|-------|
| pageErrors | 0 |
| dndStorm (`@hello-pangea/dnd`) | 0 |
| Uncaught ReferenceError/TypeError | 0 |
| consoleErrors | 1 — expected `403 (Forbidden)` from dual-control self-publish Network |
| Seed used | **false** |

---

## Residual / not promoted

| ID | Item | Owner | Status |
|----|------|-------|--------|
| R-PAY-FE-OPAQUE→EVAL | FE emit gd1_eval_v1 + Nest preview UI | `qa` this seat | **CLOSED** (browser UF PASS) |
| J-HRM-07 formula/process UAT | Full payroll process journey | `qa` later | **DEFERRED** |
| R-PAY-F-ATT-LINE / CB-BAG | Process without override bag | `dev-be` / parallel | **OPEN** (out of this seat) |
| — | `payroll_e2e_ready` / formula LIVE | `pm` | **LOCKED false / DENIED** |

### Explicit non-claims

- Did **not** claim formula LIVE / customer-ready evaluator.
- Did **not** flip `payroll_e2e_ready`.
- Did **not** run seed or second-actor publish to active.
- Did **not** promote J-HRM-07 / module payroll UAT / Phase1 DONE.
- Preview **OK-COMPUTE** here is **staged Nest** with `variableOverrides` — not LIVE payslip / process UAT.

---

## Command table

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| `node scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.mjs` | exit **0** · overall **PASS** · stamp `PAYFEVAL-MSII5NC4` |

---

## completion_report

### Closed

1. Browser U65: author `gd1_eval_v1` lines → Lưu nháp POST **201** with `expressionJson.form=gd1_eval_v1` documented.  
2. F5 hydrate lines + dialect marker.  
3. Preview Nest with `variableOverrides` → **201 OK-COMPUTE** amounts (gross/net) · `payroll_e2e_ready=false`.  
4. Dual-control self-publish **403-DUAL** toast retained.  
5. HDSD inventory complete · no DnD · zero-seed.  
6. Honesty held: **`payroll_e2e_ready=false`** · no LIVE claim.

### Residual

- J-HRM-07 full process UAT — deferred.  
- ATT/C&B bag process without overrides — parallel residual (not this seat).  
- QC slice GWC next — confirm close **R-PAY-FE-OPAQUE→EVAL** browser residual.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-fe-eval-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC slice GWC FE-EVAL browser — cấm claim LIVE / flip ready |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-FE-EVAL-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-FE-EVAL-01 PASS_TO_PM
priority: P1

## Mission
Slice QC GWC for FE-EVAL browser U65: author lines → Lưu nháp expressionJson.form=gd1_eval_v1 → Nest preview OK-COMPUTE (gross/net, ready=false) + dual-control 403-DUAL retained. Audit evidence — do NOT re-run full browser unless residual.

entry_criteria:
- QA evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-fe-eval-01.md
- FINAL: docs/qa/evidence/_tmp-po-hrm-payroll-formula-run-gap-qa-fe-eval-01.FINAL.json
- stamp PAYFEVAL-MSII5NC4 · AC1–AC7 PASS

exit_criteria:
- GO WITH CONDITIONS (slice) or GO — close R-PAY-FE-OPAQUE→EVAL browser residual if justified
- Retain C-SLICE-≠-MODULE · DENY payroll_e2e_ready / formula LIVE / J-HRM-07 process UAT
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-fe-eval-01.md
- ack_status PASS_TO_PM

cấm: flip payroll_e2e_ready · claim formula LIVE · promote module UAT from this seat
```
