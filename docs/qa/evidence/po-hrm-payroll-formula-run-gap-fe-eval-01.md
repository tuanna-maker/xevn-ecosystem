# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P1 |
| **change_mode** | **ADD** |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-EVAL-01` GWC · optional residual **R-PAY-FE-OPAQUE→EVAL** |
| **parallel** | BE-CB-BAG (ok) |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **cấm** claim formula LIVE / Phase1 DONE / module UAT |
| **U65** | zero-seed · browser form only |
| **portal_url** | `http://127.0.0.1:5173` (or Vite `:5175` / pilot `:8088`) · HRM embed `/hr` → **Tiền lương** |
| **journey_l25** | Formula author + Nest preview path (gd1_eval_v1) — **not** full J-HRM-07 process UAT |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QC-EVAL GWC | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-eval-01.md` — optional **R-PAY-FE-OPAQUE→EVAL** |
| BE-EVAL shape | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-eval-01.md` — `form: gd1_eval_v1` + `lines[]` |
| FE-01 baseline | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-01.md` — GĐ1 form retained (dual-control / immutable) |
| API-01 §4.4 | PREVIEW compute when evaluable + bag; else PREVIEW-STUB |
| Evaluator types | `apps/api/hrm-api/src/payroll/pay-formula-evaluator.ts` — var / const / expr subset |

**solid_convention_ack:** FE serializes display/form fields → `expression_json`; **no** FE formula engine / net calc; preview amounts only from Nest 2xx body.

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/payFormulaCatalog.ts` | `buildGd1EvalV1ExpressionJson` · `readGd1EvalV1Expression` · defaults · override parse · money format · CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/payFormulaCatalog.test.ts` | Vitest serializer + round-trip (**8 PASS**) |
| `apps/web/hrm/src/components/payroll/PayFormulaAuthorPanel.tsx` | Line editor → save `gd1_eval_v1`; preview Nest + overrides; show 200 compute **or** honest 412 |
| `apps/web/hrm/src/pages/Payroll.tsx` | CODE-MEMORY APPEND FE-EVAL-01 |

**Cấm / not done:** FE evaluator · DnD canvas · flip `payroll_e2e_ready` · seed · claim LIVE.

**Dialect emitted (documented subset):**

```json
{
  "form": "gd1_eval_v1",
  "note": "…",
  "lines": [
    { "component_code": "BASE", "sign": "earning", "source": "var", "var": "base_salary" },
    { "component_code": "DED_TAX", "sign": "deduction", "source": "expr", "expr": { "op": "mul", "left": "base_salary", "right": 0.1 } }
  ],
  "dialect": "gd1_eval_v1",
  "staged": true
}
```

Legacy opaque `{ form:"gd1", ops:[…] }` still **readable** (hint banner); **save** rewrites to `gd1_eval_v1`.

---

## 3. Route + click path (QA — U65 browser)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| 1 | **Tiền lương** → tab **Công thức lương** (`payroll-tab-formulas`) |
| 2 | Panel `pay-formula-author-panel` · honesty badge `payroll_e2e_ready=false` |
| 3 | Nhập mã + nhãn · dòng `gd1_eval_v1` (var BASE ← `base_salary`; optional expr deduction) |
| 4 | **Lưu bản nháp** → Network **POST/PUT** `expression_json.form === "gd1_eval_v1"` · **2xx** |
| 5 | F5 → row list nhãn+mã; mở lại → lines hydrate |
| 6 | Điền **Biến xem trước** (`hdsd-pay-formula-preview-var-*`, vd. `base_salary=8000000`) |
| 7 | **Xem trước (Nest)** → expect **200/201 compute** (gross/net/lines · ready=false) **hoặc** honest **412-PREVIEW-STUB / 412-VARS** nếu bag thiếu |
| 8 | Dual-control self-publish vẫn **403-DUAL**; active vẫn immutable |

**HDSD inventory (U76) — delta:**

- `pay-formula-eval-lines` · `hdsd-pay-formula-add-line` · `hdsd-pay-formula-seed-lines`
- `hdsd-pay-formula-line-*` · `hdsd-pay-formula-expression` (hidden dialect marker)
- `pay-formula-preview-overrides` · `hdsd-pay-formula-preview-var-*`
- `pay-formula-preview-amounts` · `pay-formula-legacy-opaque-hint`
- Retained: save / submit / publish / withdraw / new-version / preview / retire / list table

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/payFormulaCatalog.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 8 passed
```

Coverage intent:

| Case | Result |
|------|--------|
| Serialize var + const + expr → `gd1_eval_v1` | PASS |
| Skip incomplete lines | PASS |
| Round-trip read / legacy opaque `isEvalV1=false` | PASS |
| Override parse skips empty · money format | PASS |
| Honesty lock false | PASS |

---

## 5. Honesty locks

| Flag | Value |
|------|-------|
| `payroll_e2e_ready` | **false** (badge + constant) |
| Formula LIVE / customer UAT | **DENIED** |
| FE engine / net calc | **DENIED** |
| Preview | Nest only — 200 staged **or** honest 412 |
| Seed | **DENIED** |
| Module / Phase1 DONE | **NOT claimed** |

---

## completion_report

### Closed

1. GĐ1 form fields serialize to `expression_json` dialect **`gd1_eval_v1`** (documented subset).  
2. Preview still calls Nest; UI shows **compute amounts** on 2xx **or** honest **412** messaging.  
3. Dual-control / immutable / honesty badge retained; no DnD; no FE evaluator.  
4. Vitest serializer **8 PASS**; CODE-MEMORY APPEND.  
5. Residual **R-PAY-FE-OPAQUE→EVAL** addressed (emit path).  
6. Honesty: **`payroll_e2e_ready=false`**.

### Residual

- Browser U65 smoke preview path (this handoff → **qa**); may need BE-CB bag / ATT line for process — parallel ok.  
- J-HRM-07 full process UAT — deferred.  
- Opaque historical rows need **re-save** to become evaluable (hint shown).

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-eval-01.md` |
| **ack_status** | **`READY_FOR_QA`** |
| **pm_dispatch_hint** | QA browser preview after save gd1_eval_v1 — cấm claim LIVE / flip ready |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-FE-EVAL-01
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-EVAL-01 READY_FOR_QA
priority: P1

## Mission
Browser U65: login → Payroll → Công thức lương → author lines → Lưu nháp with expression_json.form=gd1_eval_v1 → Preview Nest with variableOverrides → expect 200 staged compute (gross/net, ready=false) OR honest 412 if bag incomplete. Retain dual-control 403-DUAL. No seed. No claim LIVE / flip payroll_e2e_ready.

entry_criteria:
- FE-EVAL evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-eval-01.md
- L0 stack up · U65 zero-seed
- account ceo@xe.vn / Xevn@2026 · company_id=main
- BE-EVAL / QC-EVAL baselines retained (if BE-CB not ready, 412-VARS/STUB still PASS honesty)

exit_criteria:
- Network POST/PUT body form=gd1_eval_v1 documented
- Preview path shows OK-COMPUTE amounts OR honest 412 code on UI
- HDSD inventory testids in evidence
- honesty payroll_e2e_ready=false
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-fe-eval-01.md
- ack_status PASS_TO_PM (or FAIL with residual)

cấm: seed · claim formula LIVE · flip payroll_e2e_ready · PASS only API/probe · FE net invent
```
