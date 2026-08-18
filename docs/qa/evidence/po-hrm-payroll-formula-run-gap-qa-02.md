# Evidence — `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-02` |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-01` READY_FOR_QA · QA-01 inventory only (do not confuse) |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API smoke only** (not browser UF) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC1–AC7 L1 smoke |
| **artifact_json** | [`_tmp-po-hrm-payroll-formula-run-gap-qa-02.FINAL.json`](./_tmp-po-hrm-payroll-formula-run-gap-qa-02.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-payroll-formula-run-gap-qa-02.mjs` |
| **stamp** | `PAYFQ2-MSIGD3E0` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | L1 formula CRUD ≠ module UAT / process lines |
| **Formula LIVE / evaluator** | **DENIED** | Preview returns honest **`HRM-PAY-FORMULA-412-PREVIEW-STUB`** |
| **Browser UF PASS** | **DENIED** | No FE GĐ1 form this seat |
| **Seed** | **DENIED** | U65 zero-seed · API smoke only |
| **QA-01 inventory** | **not superseded as UF** | This seat = L1 smoke only |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` (pre) | HRM/XBOS/portal **200** (Windows UV assert noise — health rows PASS) |
| Initial formulas probe | **`Cannot GET/POST /api/hrm/payroll/formulas` → 404 `HRM-DATA-404`** — **stale `dist/`** missing `pay-formula.service.js` |
| QA recovery | `pnpm --filter hrm-api run build` → restart `start:prod` on `:28001` · restart `dev:xbos-api:node` (xbos dropped during kill) |
| Post-rebuild L0 | HRM **200** · XBOS **200** |
| Auth | Portal `POST /api/xbos/auth/login` · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Author | `ceo@xe.vn` / `Xevn@2026` (JWT `sub=ceo@xe.vn`) |
| Publisher (dual) | `admin@xe.vn` / `Xevn@2026` (JWT `sub=admin@xe.vn`) |
| Persist note | Create with `company_id=main` → row `companyId=holding` (Plane B persist) · list/get with `company_id=main` still resolves — scope OK |

---

## AC matrix (L1)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **1** POST draft opaque `expressionJson` + `requiredVarsJson.keys` | 2xx draft | **201** `HRM-PAY-FORMULA-201` · id `d06e0d6d-…` · `status=draft` · code `qa_formula_msigd3e0` | **PASS** |
| **2** GET list / get same company scope | 200 + row visible | list **200** `HRM-PAY-FORMULA-200` rows=1 inList · get **200** same id | **PASS** |
| **3** submit-publish → publish second actor → active | pending → active | submit **201** `pending_publish` · publish `admin@xe.vn` **201** `status=active` | **PASS** |
| **4** Same actor publish | `HRM-PAY-FORMULA-403-DUAL` | **403** `HRM-PAY-FORMULA-403-DUAL` | **PASS** |
| **5** PUT active | `409-IMMUTABLE` | **409** `HRM-PAY-FORMULA-409-IMMUTABLE` (target `active`) | **PASS** |
| **6** POST preview | `412-PREVIEW-STUB` | **412** `HRM-PAY-FORMULA-412-PREVIEW-STUB` · message admits evaluator not LIVE | **PASS** |
| **7** No `pay_sheet_template` claimed as formula BE invent | Template ≠ formula SoT | `GET /payroll/formulas*` = F-PAY-FORMULA · `GET /payroll/pay-sheet-templates` **200** `HRM-PAY-TPL-200` empty items (peer F-PAY-SHEET-TPL surface, **not** formula invent / no `expression_json`) · `salary-templates` peer **200** `HRM-PAY-200` | **PASS** |

---

## Dual-control harness note

Pilot single-user (`ceo@xe.vn` alone) correctly blocked self-publish (**AC4**). Full **draft → active** exercised with second JWT actor **`admin@xe.vn`** (distinct `sub`) — no env dual-control disable, no seed.

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| R-PAY-F-STALE-DIST | BE-01 READY claimed while live `:28001` `dist` lacked formulas routes until QA rebuild/restart | **dev-be / devops** — post-READY dist refresh SOP |
| R-PAY-F-EVAL | Evaluator + real PREVIEW + PROCESS lines | **dev-be** staged |
| R-PAY-FE-FORM | GĐ1 form author UI (no DnD) | **dev-fe** after this L1 |
| R-PAY-AMIS-TPL | Template formula override depth | AMIS / separate — **not** this L1 |
| — | Browser UF / `payroll_e2e_ready` | **DENIED** |

### Explicit non-claims

- Did **not** claim formula LIVE / customer-ready preview.
- Did **not** run browser UF or seed.
- Did **not** promote QA-01 inventory as L1/UF PASS.
- Did **not** treat `pay-sheet-templates` / `salary-templates` as F-PAY-FORMULA SoT.

---

## completion_report

### Closed

1. L0 recovery + rebuild so formulas routes live.  
2. L1 AC1–AC7 PASS against API_DESIGN §4 / §7 error taxonomy.  
3. Dual-control: self-publish **403-DUAL**; second actor → **active**.  
4. Immutable active PUT **409-IMMUTABLE**; preview honest **412-PREVIEW-STUB**.  
5. Honesty: `payroll_e2e_ready=false`.

### Residual

Stale-dist process OBS · evaluator/FE form/process still open · module UAT DENIED.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** (L1 slice gate) **or** **pm** → **dev-fe** GĐ1 form after QC |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-02.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC L1 formula CRUD dual-control · then FE GĐ1 form — **cấm** flip `payroll_e2e_ready` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-02 PASS_TO_PM (L1 API smoke)
priority: P0

## Mission
QC L1 slice gate on payroll formulas CRUD + dual-control. Not module UAT. Not browser UF.

entry: QA-02 PASS · evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-02.md · JSON _tmp-po-hrm-payroll-formula-run-gap-qa-02.FINAL.json
read_first:
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-02.md
- docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md
- docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4 · §7

exit: GO/GWC/NO-GO · honesty payroll_e2e_ready=false · cấm claim formula LIVE
residual note: R-PAY-F-STALE-DIST (dist refresh after READY)
evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md
next after GO: PM dispatch dev-fe GĐ1 formula form (no DnD) OR evaluator wave — not UF PASS without FE
```
