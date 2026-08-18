# Evidence — `PO-HRM-AMIS-PARITY-PAY-TPL-QA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-TPL-QA-01` |
| **prior** | `PO-HRM-AMIS-PARITY-PAY-TPL-BE-01` READY_FOR_QA |
| **parent** | `PO-HRM-AMIS-PARITY-RESEARCH-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution — **L1 API smoke only** (not browser UF · not module UAT) |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **ack_status** | **`PASS_TO_PM`** |
| **verdict** | **PASS** — AC1–AC7 L1 |
| **artifact_json** | [`_tmp-po-hrm-amis-parity-pay-tpl-qa-01.FINAL.json`](./_tmp-po-hrm-amis-parity-pay-tpl-qa-01.FINAL.json) |
| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-tpl-qa-01.mjs` |
| **stamp** | `PAYTPLQA-MSIGIKB1` |

### Honesty locks (mandatory)

| Flag | Value | Note |
|------|-------|------|
| **`payroll_e2e_ready`** | **`false`** | L1 mẫu CRUD ≠ process lines / AMIS UAT |
| **Browser UF / Settings** | **DENIED** | No FE Settings mẫu this seat |
| **Seed** | **DENIED** | U65 zero-seed · API smoke only |
| **Pack as mẫu** | **DENIED** | `/salary-templates*` remains enroll-only (`HRM-PAY-200`) · mẫu = `HRM-PAY-TPL-*` |

---

## Environment

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM / XBOS / portal **200** (Windows UV assert noise after PASS — health rows OK) |
| Stale-dist probe (unauth) | `GET …/pay-sheet-templates` → **401** `HRM-AUTH-001` (route live — **not** 404) |
| Dist files | `dist/payroll/pay-sheet-template.service.js` present (2026-08-07 11:34) — **no rebuild required** |
| Auth | Portal `POST /api/xbos/auth/login` · Bearer · `x-tenant-id=xevn` · `x-company-id=main` |
| Account | `ceo@xe.vn` / `Xevn@2026` (JWT `sub=ceo@xe.vn`) |
| Persist note | Create `company_id=main` → row `companyId=holding` (Plane B) · list/get with `main` still resolves |

---

## AC matrix (L1)

| AC | Expected | Observed | Verdict |
|----|----------|----------|---------|
| **1** GET/POST/PATCH `/pay-sheet-templates*` | 2xx CRUD | list **200** `HRM-PAY-TPL-200` empty → POST **201** `HRM-PAY-TPL-201` id `e23e72eb-…` · GET **200** · PATCH activate **200** `status=active` | **PASS** |
| **2** PUT lines (component + `display_label` + `sort_order` + OV-C) | 200 + fields persist | PUT **200** · GET lines label `Nhãn QA …` · `sortOrder=10` · OV-C `formulaOverrideJson` (+ optional definition id when formulas exist) | **PASS** |
| **3** ARCHIVE hide from active list | archived not in default list | POST archive **201** · `inActive=false` · `include_archived=true` → `inArchived=true` | **PASS** |
| **4** Bind draft period → snapshot | `pay_sheet_template_id` + `sheet_template_snapshot_json` | Create draft period **201** → `POST …/bind-sheet-template` **201** · snapshot `columns[0].display_label=Bind col …` · `component_code=D` | **PASS** |
| **5** scope_parity main↔holding | list≡get | get `company_id=main` **200** · get `holding` **200** same id · persist=`holding` | **PASS** |
| **6** `/salary-templates*` pack enroll-only | ≠ mẫu SoT | pack list **200** `HRM-PAY-200` · `packHasMauId=false` · create mẫu code `HRM-PAY-TPL-201` | **PASS** |
| **7** Honesty | no ready flip / no UF | `payroll_e2e_ready=false` · no seed · no browser | **PASS** |

---

## Bind path note (OBS — not FAIL)

| Path | Result |
|------|--------|
| `POST …/periods/:id/bind-sheet-template` | **PASS** — snapshot frozen |
| `POST …/periods` + `paySheetTemplateId` (same month) | **409** `HRM-PAY-002` period overlap after first draft period in Aug 2026 — **period uniqueness**, not template bind defect. Primary AC4 satisfied via bind endpoint. |

---

## Residual / not promoted

| ID | Item | Owner |
|----|------|-------|
| R-PAY-TPL-FE | Settings mẫu GĐ1 form (browser UF) | **dev-fe** after QC L1 |
| R-PAY-SRC-PROCESS | PROCESS SRC resolver + FORMULA-412 jsonb-only | formula/process wave |
| R-PAY-TPL-CREATE-BOUND | Optional retest create-with-`paySheetTemplateId` on free period window | qa (nice-to-have) |
| — | Module UAT / `payroll_e2e_ready` | **DENIED** |

### Explicit non-claims

- Did **not** claim AMIS parity DONE / payroll e2e ready.
- Did **not** run browser Settings UF.
- Did **not** treat `salary_templates` pack as mẫu SoT.
- Did **not** invent / exercise LIVE evaluator on process.

---

## completion_report

### Closed

1. L0 + live-dist probe (401 not 404) — no rebuild needed.  
2. L1 AC1–AC7 PASS on `/pay-sheet-templates*` + bind snapshot + pack regression.  
3. Soft archive hides from active list; scope_parity main↔holding.  
4. Honesty: `payroll_e2e_ready=false`.

### Residual

FE Settings mẫu · PROCESS SRC · module UAT DENIED · create-with-template optional retest on free dates.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qc** (L1 slice gate) → then **pm** → **dev-fe** Settings mẫu |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-01.md` |
| **ack_status** | **`PASS_TO_PM`** |
| **pm_dispatch_hint** | QC L1 pay-sheet-templates · then FE Settings — **cấm** flip `payroll_e2e_ready` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-QC-01
from_role: pm
to_role: qc
lane: governance
priority: P0
parent: PO-HRM-AMIS-PARITY-RESEARCH-01
prior: PO-HRM-AMIS-PARITY-PAY-TPL-QA-01 PASS_TO_PM (L1 API smoke)

## Mission
L1 QC gate for AMIS mẫu bảng lương API surface. Not module UAT. Not browser UF.

## read_first
1. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qa-01.md
2. docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-tpl-qa-01.FINAL.json
3. docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md
4. docs/qa/evidence/po-hrm-amis-parity-pay-tpl-be-01.md

## Gate AC
- Confirm QA AC1–AC7 PASS evidence integrity (CRUD/lines/archive/bind/scope/pack≠mẫu)
- OBS: create-with-paySheetTemplateId 409 HRM-PAY-002 overlap — accept as period uniqueness, not TPL FAIL
- DENY payroll_e2e_ready / browser UF / treat pack as mẫu
- GO WITH CONDITIONS or GO for L1 slice only

## Exit
evidence: docs/qa/evidence/po-hrm-amis-parity-pay-tpl-qc-01.md
PASS_TO_PM → dispatch PO-HRM-AMIS-PARITY-PAY-TPL-FE-01 (Settings mẫu GĐ1) after GO/GWC
honesty: payroll_e2e_ready=false
```

### Alternate next (after QC GO) — FE Settings

```text
work_item_id: PO-HRM-AMIS-PARITY-PAY-TPL-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P0
depends_on: PO-HRM-AMIS-PARITY-PAY-TPL-QC-01 GO|GWC
## Mission
Settings GĐ1 form for mẫu bảng lương — wire /pay-sheet-templates* (list/create/lines/archive). Cấm DnD formula canvas. Cấm merge salary-templates pack UI as mẫu SoT. U65 · payroll_e2e_ready=false.
```
