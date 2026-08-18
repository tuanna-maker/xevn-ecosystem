# Evidence — PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01` |
| **parent** | `PO-HRM-PAY-CNTT-FE-STP-01` |
| **lane** | `dev-fe` |
| **date** | 2026-08-12 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **seed** | none (U65) |
| **honesty** | `payroll_e2e_ready=false` · formula evaluator HOLD |

---

## spec_read_ack

1. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-SRS-01.md` — UC-BP-PAY-STP-01 (CHUNG CRUD) · AC-01-01..05 · STP-03/04 KPI+BCC · GLOBAL-01 · testid registry · 403/409/400 VI
2. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-TECHSPEC-01.md` §2.1 — `pay_policy_pack` columns + validation
3. `docs/program/specs/PO-HRM-PAY-CNTT-FE-STP-01-API-01.md` — header only; routes confirmed from LIVE BE
4. `docs/hrm/ui-screens/UI-HRM-PAY-STP-POLICY-PACK.md` — two-pane IA · field map · empty/error
5. `docs/hrm/ui-screens/UI-HRM-PAY-STP-HUB.md` — hub nav → child Policy Pack (must_keep route PASS)
6. `docs/qa/test-cases/po-hrm-pay-cntt-fe-stp-01-test-matrix.md` — STP01-TC browser matrix
7. `docs/qa/evidence/qc-po-hrm-pay-cntt-be-01.md` — DTO `company_id` snake; GWC CNTTBEQC1-MSO8HVERQC1
8. BE LIVE: `pay-cntt-setup.dto.ts` + `payroll.controller.ts` `pay-policy-packs*` + archive POST

## solid_convention_ack

- SRP: `payPolicyPackForm.ts` (validate/build) · `usePolicyPackApi.ts` (HTTP) · `PolicyPackSetupScreen.tsx` (UI bind)
- FE/BE separation: rateParams pass-through numbers only — no formula eval / no fragment merge
- Display-ready: `statusLabelVi` FE-derive; dates `formatHrmDateVi` / ViDateField ISO wire

---

## Files

| Path | Action |
|------|--------|
| `apps/web/hrm/src/lib/payPolicyPackForm.ts` | **ADD** — validate + build CHUNG payload / rateParams |
| `apps/web/hrm/src/lib/payPolicyPackForm.test.ts` | **ADD** — 7 vitest |
| `apps/web/hrm/src/components/payroll/policy-pack/usePolicyPackApi.ts` | **UPGRADE** — archive + 403 VI map |
| `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.tsx` | **UPGRADE** — two-pane · ViDateField · KPI · ViMoneyInput BCC · archive |
| `apps/web/hrm/src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts` | **UPGRADE** — 8 AC tests |
| `apps/web/hrm/src/components/payroll/setup/PayrollSetupHub.test.ts` | **FIX** — mock `useArchivePolicyPack` |

**Hub must_keep:** `PayrollSetupHub.tsx` / route `/payroll/setup` — không đụng logic hub ngoài mock test.

---

## Behavior delivered (CHUNG)

| AC | Behavior |
|----|----------|
| AC-PAY-STP-01-01 | Form tạo → POST `pay-policy-packs` `{ company_id, code, nameVi, scope:CHUNG, effectiveFrom, rateParams? }` |
| AC-PAY-STP-01-02 | Click row → edit KPI/BCC → PATCH |
| AC-PAY-STP-01-03 | `Ngưng / Archive` → POST `…/:id/archive?company_id=` · testid `pay-policy-pack-archive` |
| AC-PAY-STP-01-04 | 409 `HRM-PAY-POL-409-CODE` → banner/field giữ form |
| AC-PAY-STP-01-05 | `effectiveTo < effectiveFrom` → message nguyên văn · không gửi |
| AC-PAY-STP-03-01 | KPI 0–100 · testid `pay-params-kpi-threshold` · không thousand group |
| AC-PAY-STP-04-01 | BCC_STD ViMoneyInput · submit number thuần · testid `pay-params-bcc-std` |
| BR-PAY-STP-01 | HTTP 403 → banner «Không có quyền thao tác scope này — liên hệ C&B tập đoàn» |
| Locale | ViDateField dd/MM/yyyy · BCC nhóm nghìn · KPI exempt |
| Hub | `/hr/payroll/setup` → nav «Gói chính sách» → `PolicyPackSetupScreen` |

**CHUNG-only honesty:** không render RIÊNG / BP filter / geo / VP (STP-02/05/06 residual).

---

## vitest (thật)

```bash
cd apps/web/hrm && pnpm exec vitest run \
  src/lib/payPolicyPackForm.test.ts \
  src/components/payroll/policy-pack/ \
  src/components/payroll/setup/PayrollSetupHub.test.ts \
  --no-coverage
```

```
✓ src/lib/payPolicyPackForm.test.ts (7)
✓ src/components/payroll/policy-pack/PolicyPackSetupScreen.test.ts (8)
✓ src/components/payroll/setup/PayrollSetupHub.test.ts (5)

Test Files  3 passed
Tests       20 passed
```

---

## Residual (QA / next)

| ID | Note | Owner |
|----|------|-------|
| R-PAY-STP-RIENG | Tab RIÊNG + BP filter + geo/VP (STP-02/05/06) | FE follow-up |
| R-PAY-STP-BROWSER | Browser U65 matrix STP01-TC-* trên `:8088` / embed | **qa** |
| formula HOLD | Không eval | — |
| `payroll_e2e_ready=false` | Không claim UAT kỳ lương | — |

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
role: qa
lane: execution
entry_criteria: READY_FOR_QA FE POLICY-PACK-01; BE GWC CNTTBEQC1-MSO8HVERQC1; U65 zero-seed; browser-only
exit_criteria:
- Login ceo@xe.vn → Lương → Thiết lập lương (/hr/payroll/setup) → Gói chính sách
- AC-PAY-STP-01-01 create CHUNG → POST 2xx → list row → F5 còn
- AC-PAY-STP-01-02 edit rateParams KPI+BCC → PATCH 2xx → F5 còn
- AC-PAY-STP-01-03 Archive → row retired / ẩn default list → F5
- AC-PAY-STP-01-05 date order FE block (không request)
- AC-PAY-STP-03-01 KPI 150 → viền đỏ + message VI
- AC-PAY-STP-04-01 BCC gõ 5000000 → hiển thị 5.000.000 → body number
- testid: pay-policy-pack-list|save|archive|pay-params-kpi-threshold|pay-params-bcc-std
- evidence: docs/qa/evidence/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01.md
cấm: seed; PASS chỉ probe; claim RIÊNG/STP-02 DONE
```

---

## completion_report

**Closed:** CHUNG Policy Pack list+create+edit+archive LIVE bind; vi-VN date/money; vitest 20 PASS; hub wire retained.

**Open:** Browser QA matrix; RIÊNG/geo/VP residual.
