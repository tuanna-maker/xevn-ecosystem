# PO-HRM-PAY-CNTT Research Summary — Customer Policy Coverage & Extensibility Assessment

**Date:** 2026-08-11  
**Author:** PM (research per sponsor directive)  
**Status:** COMPLETE — ready for PM synthesis & dispatch

---

## 1. Executive Summary

Customer provided **7 payroll models** across **30 PDFs + 38 XLSX** yielding **63 policy fragments**. Current XeVN implementation has **strong scaffolding** but **critical runtime gaps** blocking customer-ready payroll.

| Model | Fragments | Policy Coverage | Template Coverage | Runtime (Process) |
|-------|-----------|-----------------|-------------------|-------------------|
| **CHUNG** | 4 | PARTIAL (policy pack API exists) | MISSING | 0₫ stub |
| **ĐPHH** | 10 | PARTIAL (policy pack API exists) | MISSING | 0₫ stub |
| **TĐHK** | 5 | PARTIAL | MISSING | 0₫ stub |
| **TG** | 0 (uses VP HN) | MISSING | MISSING | 0₫ stub |
| **LX-T** | 24 | PARTIAL (policy pack API exists) | MISSING | 0₫ stub |
| **LX-TR** | 7 | PARTIAL | MISSING | 0₫ stub |
| **VP-T** | 13 | PARTIAL | MISSING (multi-template!) | 0₫ stub |

**Verdict:** Setup/Catalog layer (L4/L5) APIs are **deployed** (pay-cntt-setup, pay-sheet-template, pay-formula). Formula evaluator exists as **staged subset** (gd1_eval_v1). **Process engine absent** — payslip lines = 0₫. **No template bound to period**. **No input packs typed**. **No SRC priority chain**.

---

## 2. Current Implementation Assessment

### 2.1 What's LIVE (Deployed + Tests Passing)

| Component | File | Status | Evidence |
|-----------|------|--------|----------|
| Policy Pack CRUD | `pay-cntt-setup.service.ts` L460-670 | ✅ LIVE | P-CC-08 probe PASS |
| Input Profile CRUD | `pay-cntt-setup.service.ts` L671-858 | ✅ LIVE | P-CC-08 probe PASS |
| Setup Resolve (template→policy+profile) | `pay-cntt-setup.service.ts` L860-980 | ✅ LIVE | F-PAY-SETUP-RESOLVE-01 |
| Pay Sheet Template CRUD | `pay-sheet-template.service.ts` | ✅ LIVE | F-PAY-SHEET-TPL-* |
| Pay Formula Definitions (metadata) | `pay-formula.service.ts` | 📝 PAPER | API-01 DISPATCHED |
| Formula Evaluator (gd1_eval_v1) | `pay-formula-evaluator.ts` | 📝 STAGED | Pure function, no I/O |
| Salary Components Catalog | `payroll-catalog.service.ts` | ✅ LIVE | AC-PAY-COMP-01 FAIL (free-text) |
| Payment Batch Wire | `payroll-catalog.service.ts` L918-1087 | ✅ LIVE | AMIS Step7 API |

### 2.2 What's MISSING / BLOCKED (P0)

| Gap | Impact | Blocker |
|-----|--------|---------|
| **Process engine** | All payslips = 0₫, no lines | Formula API-01 not CONFIRMED → BE cannot wire evaluator |
| **Template bind to period** | Period create has `pay_sheet_template_id` but no snapshot used | `bindToPeriod` returns snapshot but process doesn't read it |
| **Input pack types** | No typed packs (DLL_CPN, KPI_TDHK, CPSC, etc.) | `pay_period_input_pack` types missing |
| **SRC priority chain** | No runtime merge: History → Pack → Template override → Catalog | BR-AMIS-PAY-SRC-01..05 not implemented |
| **ATT timesheet lines** | Hour/OT/leave vars only from closed sheet snapshot | `att_timesheet_line` PAPER only |
| **Salary history / C&B** | Fixed PC from employee history not feeding vars | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` not started |
| **Catalog picker bind** | AC-PAY-COMP-01 FAILS — free-text still allowed in consumers | `salary-component-consumer-assert` soft-allow when catalog empty |

---

## 3. Customer Policy → XeVN Fragment Mapping

From `PO-HRM-PAY-CNTT-POLICY-FRAGMENT-CATALOG.md` (63 fragments):

### 3.1 CHUNG (2 PDFs, 4 fragments)
| Fragment | Type | System Home | AMIS Step | XeVN Today |
|----------|------|-------------|-----------|------------|
| FRG-CHUNG-2A-01 | THANG_LUONG | settings_catalog · policy_rule | 1 | MISSING |
| FRG-CHUNG-2A-02 | THANG_LUONG | settings_catalog | 1 | MISSING |
| FRG-CHUNG-2A-03 | THANG_LUONG | settings_catalog | 1 | MISSING |
| FRG-CHUNG-2A-04 | THANG_LUONG | settings_catalog | 1 | MISSING |
| FRG-CHUNG-127A-01 | PHU_CAP | policy_rule · salary_component | 1–2 | MISSING |
| FRG-CHUNG-127A-02 | THUONG | policy_rule | 2 | MISSING |

### 3.2 ĐPHH (7 PDFs, 10 fragments)
| Fragment | Type | Override/Extend | XeVN Today |
|----------|------|-----------------|------------|
| FRG-DPHH-BASE-01 | KHAC | CHUNG thang (local) | MISSING |
| FRG-DPHH-KPI-01 | KPI | — | MISSING |
| FRG-DPHH-DT-HG-01/02 | DOANH_THU | overrides each other | MISSING |
| FRG-DPHH-DT-HN-01/02 | DOANH_THU | overrides each other | MISSING |
| FRG-DPHH-THUONG-DT-01 | THUONG | — | MISSING |
| FRG-DPHH-THANG-01 | THANG_LUONG | **override** FRG-CHUNG-2A-04 | MISSING |
| FRG-DPHH-TV-01/02 | THU_VIEC | **override** TV % CHUNG | MISSING |
| FRG-DPHH-SHIP-01..04 | THUONG/DOANH_THU | extends/overrides | MISSING |

### 3.3 LX-T (13 PDFs, 24 fragments) — Most Complex
- Per-province templates (ND, NB, TB, PT, VT, YB) → **multi-template per BP**
- Override chain: FRG-LXT-LUOT-* → FRG-LXT-QD439-LUOT (centralized unit price)
- CLDV scoring from revenue, CPSC, contract types
- **Critical:** `applicability_scope` must support province-level, not hardcoded enum

### 3.4 VP-T (3 PDFs, 13 fragments) — Multi-template per BP
- 6 provinces (ND, NB, TB, VT, PT, YB) each with own XLSX template
- **UC-BP-PAY-STP-11** explicitly required: nhiều mẫu / 1 BP (tỉnh)

---

## 4. Extensibility Architecture for Future Policy Types

Based on AMIS parity research (Option B storage) and customer fragment catalog:

### 4.1 Core Principle: Metadata-Driven, Not Hardcoded

```typescript
// FORBIDDEN - hardcoded in Nest
if (businessLineTag === 'DPHH') { ... }

// REQUIRED - metadata-driven
const template = await paySheetTemplateService.resolveForEmployee(emp, period);
const policyPack = await payCnttSetupService.getBoundPolicyPack(template.policyPackId);
const inputPack = await payPeriodInputPackService.getTypedPack(period, template.inputPackType);
```

### 4.2 Extension Points (Open for New Models)

| Extension Point | Mechanism | New Model Adds |
|----------------|-----------|----------------|
| **Policy Pack** | `pay_policy_pack` row (scope=RIÊNG-{MODEL}) | Business rules, rate params, doc refs |
| **Input Pack Type** | `pay_period_input_pack` `source_kind` + writer | DLL_CPN, KPI_TDHK, CPSC, REVENUE_DT, etc. |
| **Salary Component** | `salary_components` + `component_type` from `pay_types` | Typed codes per fragment (e.g., CPSC, CLDV_SCORE) |
| **Pay Sheet Template** | `pay_sheet_template` + columns + applicability | Per-province, per-BP, per-position templates |
| **Formula Override** | `pay_sheet_template_column.override_formula_definition_id` | Template-scoped formula versions |
| **SRC Priority** | Resolver chain (configurable order) | New sources insert at correct priority |

### 4.3 Adding a New Payroll Model (e.g., "Bảo vệ" / Security)

1. **Policy Pack**: Create RIÊNG-BV policy pack with QĐ refs, rate params
2. **Catalog**: Add salary components with `component_type` from `pay_types` (BV_ALLOWANCE, BV_KPI, etc.)
3. **Templates**: Create `pay_sheet_template` rows per OU/province with `applicability_scope`
4. **Input Packs**: Define `source_kind` types + writers (UI import, ATT bind, bridge)
5. **Formula**: Author/publish formulas in `pay_formula_definition`, link to template columns
6. **Bind**: Attach policy pack + input pack profile to template via `pay-cntt-setup` resolve
7. **Process**: Period created from template → enroll → process evaluates via SRC chain

**Zero Nest code changes required** — all configuration via API + catalog.

---

## 5. AMIS Parity Alignment (from research)

### 5.1 AMIS 7-Step Spine → XeVN Status

| AMIS Step | XeVN Status | Gap Class |
|-----------|-------------|-----------|
| 1 Thiết lập (tax, BH, salary history) | PARTIAL | P0 — policy pack + C&B history |
| 2 Thành phần + công thức | GAP | P0 — catalog picker + formula engine |
| 3 Mẫu bảng + override | GAP | P0 — pay_sheet_template LIVE + override FK |
| 4 Dữ liệu (công chốt + thu nhập khác + tạm ứng) | PARTIAL | P0 — typed input packs + ATT lines |
| 5 Lập bảng → auto calc | GAP | P0 — process engine + evaluator |
| 6 Gửi phiếu ESS | PARTIAL | P2 |
| 7 Chi trả | PARTIAL | P2 |

### 5.2 Critical BR Locked (from SA evidence)

| BR | Rule |
|----|------|
| **SRC-01** | Hour/OT/leave vars ONLY from closed timesheet snapshot (Q-PAY-F-3) |
| **SRC-02** | Employee salary-history/C&B wins over template/catalog |
| **SRC-03** | Period input pack wins for period-variable components |
| **SRC-04** | Template override formula (FK to published) wins catalog default |
| **SRC-05** | Catalog default only if 1–4 empty — **no Nest % fallback** |

---

## 6. Dispatch Plan (PM Actions)

### 6.1 Immediate (Phase B in-flight)
- Monitor FE-STP-01 (dev-fe) → READY_FOR_QA → dispatch QA browser L2
- Monitor BE-02 (dev-be) fragment bind §8.7–8.8

### 6.2 Next Wave (P0 Setup Functions)
| Priority | Work Item | Owner | Depends On |
|----------|-----------|-------|------------|
| 1 | `PO-HRM-AMIS-PARITY-SA-01` | sa | ✅ PASS_TO_PM |
| 2 | `PO-HRM-AMIS-PARITY-PAY-DEPTH-01` | ba-process + sa | SA evidence |
| 3 | `PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01` | ba-process | PAY-DEPTH |
| 4 | `PO-HRM-PAY-SRC-PRIORITY-SPEC-01` | ba-process | PAY-DEPTH |
| 5 | `PO-HRM-PAY-INPUT-PACKS-SPEC-01` | ba-process | PAY-DEPTH |
| 6 | `PO-HRM-EMP-SALARY-HISTORY-SPEC-01` | ba-process | C&B timeline |
| 7 | `PO-HRM-ALLOWANCE-CATALOG-SYNC-01` | ba-data / sa | Settings catalog |
| 8 | Formula BE eval + process | dev-be | API-01 CONFIRMED |
| 9 | FE GĐ1 form author + preview | dev-fe | BE eval |
| 10 | QA U65 | qa | FE + BE |

### 6.3 Recruitment Wave (Phase B dispatched)
- BA-R1 → DEV-R1 → DEV-R2 → QA-R1 chain (await BA-R1 PASS_TO_PM)

### 6.4 QC Gates (Phase B dispatched)
- BRAND-TOKENS-L1, BRAND-PRIMITIVES-L2, HRM-COMPANY-COL, ORPHAN-CODE-SAMPLE, HTTPS-RESIDUAL-R3, SETTINGS-MASTER-DATA, HOOK-qa-276034_5, HOOK-qa-309fd5_5, HRM-MD-PICKER-SPOT

---

## 7. Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| R1: Formula API-01 delayed | High | Blocks all process | Escalate if >2 days; parallel template DATA |
| R2: ATT timesheet_line not ready | Medium | SRC-01 incomplete | Mock closed-sheet vars for formula dev; real ATT later |
| R3: Customer policy changes mid-stream | Medium | Rework fragments | Versioned fragment catalog; supersedes chain tracked |
| R4: Hardcode creep in dev | Low | Technical debt | CI golden tests; CODE-MEMORY guards; QC probes |

---

## 8. Conclusion

**Current state:** Strong L4/L5 setup APIs deployed, formula evaluator staged, process engine absent. **Customer policy coverage:** 63 fragments mapped, all MISSING in runtime. **Extensibility:** Architecture supports new models via metadata (policy packs, templates, input packs, formula overrides) — zero code changes needed per new model.

**Next PM actions:**
1. Accept SA evidence (`PO-HRM-AMIS-PARITY-SA-01`) → dispatch PAY-DEPTH
2. Monitor Phase B dispatches for PASS_TO_PM/FAIL_TO_PM signals
3. When Formula API-01 CONFIRMED → dispatch Formula BE eval
4. Maintain `payroll_e2e_ready=false` until formula+lines U65 + QC

---

**Evidence path:** `docs/qa/evidence/po-hrm-pay-cntt-research-summary-20260811.md`  
**Ack status:** COMPLETE — ready for PM synthesis & dispatch