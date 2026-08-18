# Evidence — PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01` |
| **parent** | `PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **date** | 2026-08-07 |
| **priority** | P0 |
| **change_mode** | **ADD** |
| **prior** | `PO-HRM-PAYROLL-FORMULA-RUN-GAP-QC-01` GO WITH CONDITIONS (L1) · BE-01 READY · QA-02 L1 PASS |
| **ack_status** | **`READY_FOR_QA`** |
| **honesty** | **`payroll_e2e_ready=false`** · **cấm** claim formula LIVE / evaluator UAT |
| **U65** | zero-seed · browser form only |
| **portal_url** | `http://127.0.0.1:5173` (or local Vite `:5175` / pilot `:8088`) · HRM embed `/hr` → **Tiền lương** |
| **journey_l25** | Formula author UF (GĐ1 form) — not full J-HRM-07 process UAT |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QC-01 GWC | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qc-01.md` — residual **R-PAY-FE-FORM** |
| QA-02 L1 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-02.md` AC1–7 · stamp `PAYFQ2-MSIGD3E0` |
| API-01 §4 · §7 | `docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md` F-PAY-FORMULA-AUTHOR/PUBLISH/LIST/PREVIEW · error taxonomy |
| BE-01 | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-01.md` Nest `/api/hrm/payroll/formulas*` |
| R-PAY-DD-01 | Form GĐ1 — **cấm DnD canvas** (honored) |
| Neo | Payroll top tabs · sibling `SalaryComponentsTab` (catalog TP ≠ formula SoT) |

**solid_convention_ack:** FE binds display-ready fields from API; **no** FE formula engine / net calc; preview amounts only if BE returns (stub = honest 412).

---

## 2. Deliverables (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/payFormulaCatalog.ts` | Format code · vi-VN status/var labels · opaque expression helpers · honesty lock |
| `apps/web/hrm/src/lib/payFormulaCatalog.test.ts` | Vitest **5 PASS** |
| `apps/web/hrm/src/components/payroll/PayFormulaAuthorPanel.tsx` | List + draft form + submit/publish/withdraw/new-version/preview/retire |
| `apps/web/hrm/src/pages/Payroll.tsx` | Top tab **Công thức lương** · CODE-MEMORY APPEND |
| `apps/web/hrm/src/integrations/hrmApi.ts` | Client `list/get/create/update/versions/submit/withdraw/publish/retire/preview` |
| `apps/web/hrm/src/lib/apiError.ts` | Friendly `HRM-PAY-FORMULA-403-DUAL` / `409-IMMUTABLE` / `412-PREVIEW-STUB` / … |

**Cấm / not done:** DnD canvas · FE evaluator · `salary_components.formula` as SoT · seed · flip `payroll_e2e_ready`.

---

## 3. Route + click path (QA — U65 browser)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · scope `company_id=main` (portal OU) |
| 1 | Mở **Tiền lương / Payroll** (`/hr` embed hoặc portal CC → HRM lương) |
| 2 | Click tab **Công thức lương** (`data-testid=payroll-tab-formulas`) |
| 3 | Panel `pay-formula-author-panel` — badge honesty `payroll_e2e_ready=false` |
| 4 | Nhập **Mã** (`hdsd-pay-formula-code`) + **Nhãn tiếng Việt** bắt buộc (`hdsd-pay-formula-label`) + biến DV-18 + ghi chú/biểu thức opaque |
| 5 | **Lưu bản nháp** (`hdsd-pay-formula-save`) → Network **POST** `/api/hrm/payroll/formulas` **2xx** · status draft |
| 6 | **Tải lại** / F5 → row hiện trong `pay-formula-list-table` với **nhãn + mã** (không raw-key-only) |
| 7 | **Gửi phát hành** (`hdsd-pay-formula-submit-publish`) → `pending_publish` |
| 8 | (Cùng actor) **Phát hành** (`hdsd-pay-formula-publish`) → expect toast **403-DUAL** (dual-control) |
| 9 | (Optional second actor `admin@xe.vn`) Phát hành → `active` |
| 10 | Active: form khóa · banner immutable · **Tạo phiên bản mới** nếu cần sửa |
| 11 | **Xem trước (stub)** (`hdsd-pay-formula-preview`) → expect **412-PREVIEW-STUB** surfaced honestly — **không** claim LIVE |

**HDSD inventory (U76):**

- `payroll-tab-formulas`
- `pay-formula-author-panel` · `pay-formula-honesty-badge`
- `hdsd-pay-formula-code` · `hdsd-pay-formula-label` · `hdsd-pay-formula-note` · `hdsd-pay-formula-expression`
- `hdsd-pay-formula-var-*` · `hdsd-pay-formula-custom-var` · `hdsd-pay-formula-add-var`
- `hdsd-pay-formula-save` · `hdsd-pay-formula-submit-publish` · `hdsd-pay-formula-publish`
- `hdsd-pay-formula-withdraw` · `hdsd-pay-formula-new-version` · `hdsd-pay-formula-preview` · `hdsd-pay-formula-retire`
- `hdsd-pay-formula-reload` · `pay-formula-list-table` · `pay-formula-preview-result` · `pay-formula-immutable-guard`

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/payFormulaCatalog.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 5 passed
```

---

## 5. Honesty locks

| Flag | Value |
|------|-------|
| `payroll_e2e_ready` | **false** (badge + constant) |
| Formula LIVE | **DENIED** |
| Preview | Honest **412-PREVIEW-STUB** messaging |
| Module / Phase1 DONE | **NOT claimed** |
| Seed | **DENIED** |

---

## completion_report

### Closed

1. GĐ1 formula author form (no DnD) on Payroll tab **Công thức lương**.  
2. Wired Nest `/api/hrm/payroll/formulas*` — list/create/update/submit/publish/withdraw/version/retire/preview.  
3. Dual-control messaging + 403-DUAL toast; immutable active guard + 409 messaging; preview stub honest.  
4. vi-VN labels (status + DV-18 vars); display-ready list (label + code).  
5. Vitest catalog **5 PASS**; CODE-MEMORY APPEND; `solid_convention_ack` FE–BE.  
6. Honesty: `payroll_e2e_ready=false`.

### Residual

- Browser U65 smoke (this handoff → QA).  
- Evaluator LIVE / process lines → BE eval wave (not this seat).  
- J-HRM-07 full process UAT — deferred until evaluator + form QA PASS.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | § above |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | see below |
| **evidence_path** | `docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-01.md` |
| **ack_status** | **`READY_FOR_QA`** |
| **pm_dispatch_hint** | QA browser U65 form smoke — cấm claim LIVE / flip ready |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-PAYROLL-FORMULA-RUN-GAP-QA-03
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-PAYROLL-FORMULA-AND-RUN-GAP-01
prior: PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-01 READY_FOR_QA
priority: P0

## Mission
Browser U65 smoke GĐ1 formula author form (no DnD): login → Payroll → tab Công thức lương → draft save → F5 list → submit-publish → self-publish expect 403-DUAL → preview expect 412-PREVIEW-STUB honest.

entry_criteria:
- FE-01 evidence docs/qa/evidence/po-hrm-payroll-formula-run-gap-fe-01.md
- L0 stack up · U65 zero-seed
- account ceo@xe.vn / Xevn@2026 · company_id=main

exit_criteria:
- Click path + Network 2xx on POST draft; list shows label+code after F5
- 403-DUAL on self-publish; 412-PREVIEW-STUB surfaced (not LIVE claim)
- HDSD inventory testids in evidence
- honesty payroll_e2e_ready=false
- evidence: docs/qa/evidence/po-hrm-payroll-formula-run-gap-qa-03.md
- ack_status PASS_TO_PM (or FAIL with residual)

cấm: seed · claim formula LIVE · flip payroll_e2e_ready · PASS only API/probe
```
