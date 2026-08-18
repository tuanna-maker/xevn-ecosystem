# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-03`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-03` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01` READY_FOR_QA |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **browser U65** GĐ1 formula author form |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC1–AC7 browser UF |
| **portal_url** | `http://127.0.0.1:5173` |
| **journey_l25** | GĐ1 formula author UF (Payroll → Công thức lương) — **not** full J-HRM-07 process UAT |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-03.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-03.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-03.mjs` |
| **stamp** | `PAYFQ3-MSIGUR4C` |
| **screens** | `docs/qa/evidence/screens/po-hrm-payroll-formula-run-gap-qa-03/` |
| **commit** | `dc930c5` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | Badge + constant · **DENIED** promote |
| **Formula LIVE / evaluator** | **DENIED** | Preview honest **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** |
| **J-HRM-07 process UAT** | **DENIED** | This seat = GĐ1 author form UF only |
| **Seed** | **DENIED** | U65 zero-seed · browser form only |
| **DnD canvas / FE net engine** | **DENIED** | `dndSurface=0` · no FE calc |

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
  → pay-formula-author-panel
  → fill code + label (+ note/expression)
  → hdsd-pay-formula-save → POST /api/hrm/payroll/formulas 201
  → FE list row (label+code)
  → F5 → re-open formulas tab → row còn
  → hdsd-pay-formula-submit-publish → 201 pending_publish
  → hdsd-pay-formula-publish (same actor) → 403-DUAL toast
  → hdsd-pay-formula-preview → 412-PREVIEW-STUB panel
```

**Draft under test:** code `qa_formula_payfq3_msigur4c` · label `Công thức QA browser PAYFQ3-MSIGUR4C`

---

## AC matrix (browser)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **1** Tab Công thức lương visible | Panel + honesty badge | `pay-formula-author-panel` · badge `payroll_e2e_ready=false · evaluator chưa LIVE` | **PASS** |
| **2** Create draft → Save → Network 2xx → FE list row | POST 2xx + row label+code | **201** `HRM-PAY-FORMULA-201` · row `… (qa_formula_payfq3_msigur4c) v1 Bản nháp` | **PASS** |
| **3** F5 → row còn | Persist | Same row label+code after reload + re-open tab | **PASS** |
| **4** Submit-publish | pending_publish | **201** · `dataStatus=pending_publish` · UI chờ phát hành | **PASS** |
| **5** Self-publish | 403-DUAL honest (not silent success) | **403** `HRM-PAY-FORMULA-403-DUAL` · toast «Bị chặn dual-control…» | **PASS** |
| **6** Preview | 412-PREVIEW-STUB honest (not fake LIVE) | **412** · panel shows stub code + «không phải kết quả lương thật · payroll_e2e_ready=false» | **PASS** |
| **7** No DnD · no FE net · HDSD | dnd=0 · inventory | `dndSurface=0` · all required testids seen · missing=[] | **PASS** |

---

## HDSD inventory (U76)

| testid | Seen |
|--------|------|
| `payroll-tab-formulas` | ✅ |
| `pay-formula-author-panel` | ✅ |
| `pay-formula-honesty-badge` | ✅ |
| `hdsd-pay-formula-code` | ✅ |
| `hdsd-pay-formula-label` | ✅ |
| `hdsd-pay-formula-note` | ✅ |
| `hdsd-pay-formula-expression` | ✅ |
| `hdsd-pay-formula-save` | ✅ |
| `hdsd-pay-formula-submit-publish` | ✅ |
| `hdsd-pay-formula-publish` | ✅ |
| `hdsd-pay-formula-preview` | ✅ |
| `pay-formula-list-table` | ✅ |
| `pay-formula-preview-result` | ✅ |
| `hdsd-pay-formula-var-payable_hours` | ✅ (extra) |

---

## Process / console

| Signal | Value |
|--------|-------|
| pageErrors | 0 |
| dndStorm (`@hello-pangea/dnd`) | 0 |
| Uncaught ReferenceError/TypeError | 0 |
| Seed used | **false** |

---

## Residual / not promoted

| ID | Item | Owner | Status |
|----|------|-------|--------|
| R-PAY-F-EVAL | Evaluator + real PREVIEW + PROCESS lines | `dev-be` | **OPEN** (staged — not this seat) |
| R-PAY-FE-FORM | GĐ1 form browser UF | `qa` this seat | **CLOSED** (AC1–7 PASS) |
| J-HRM-07 formula/process UAT | Full payroll process journey | `qa` later | **DEFERRED** |
| — | `payroll_e2e_ready` / formula LIVE | `pm` | **LOCKED false / DENIED** |

### Explicit non-claims

- Did **not** claim formula LIVE / customer-ready evaluator.
- Did **not** flip `payroll_e2e_ready`.
- Did **not** run seed or second-actor publish to active (L1 QA-02 already proved that).
- Did **not** promote J-HRM-07 / module payroll UAT / Phase1 DONE.
- Browser UF PASS here **supersedes** QC-01 residual **R-PAY-FE-FORM** as open product gap for GĐ1 form — QC should close that CONDITION on re-gate.

---

## Command table

| Command | Result |
|---------|--------|
| `pnpm run qc:dev-stack` | HRM/XBOS/portal **200** |
| `pnpm run qc:fe-be-health` | **ALL PASS** |
| `node scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-03.mjs` | exit **0** · overall **PASS** · stamp `PAYFQ3-MSIGUR4C` |

---

## completion_report

### Closed

1. Browser U65 GĐ1 formula author form: tab → draft save → F5 → submit-publish → self-publish **403-DUAL** → preview **412-PREVIEW-STUB**.  
2. AC1–AC7 **PASS** with Network + FE-after-2xx + HDSD inventory.  
3. Honesty held: `payroll_e2e_ready=false` · no DnD · no FE net engine · zero-seed.  
4. R-PAY-FE-FORM browser gap **CLOSED** for this UF (pending QC confirm).

### Residual

Evaluator LIVE / process lines / J-HRM-07 full UAT still open · **DENIED** ready flag.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** (browser slice gate) |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-03.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC browser GĐ1 formula UF — **cấm** flip `payroll_e2e_ready` / claim formula LIVE / module UAT |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-02
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-03 PASS_TO_PM (browser U65 GĐ1 form)
priority: P0

## Mission
QC browser slice gate on Payroll → Công thức lương GĐ1 form UF (draft save/F5/submit/403-DUAL/412-PREVIEW-STUB). Not module UAT. Not formula LIVE.

entry: QA-03 PASS · evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-03.md · JSON _tmp-po-hrm-payroll-formula-run-gap-qa-03.FINAL.json · screens po-hrm-payroll-formula-run-gap-qa-03/
read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-03.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-01.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md (prior L1 GWC — close R-PAY-FE-FORM if ACCEPT)

exit: GO/GWC/NO-GO · honesty payroll_e2e_ready=false · cấm claim formula LIVE / Phase1 DONE
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-02.md
```
