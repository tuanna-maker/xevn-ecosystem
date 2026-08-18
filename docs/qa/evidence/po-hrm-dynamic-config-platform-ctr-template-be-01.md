# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01 (dev-be invent KEY CNS)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BA-01` CONFIRMED Option B RETAIN Nest `hrm_contract_templates` |
| **change_mode** | **ADD** (narrow KEY CNS only) |
| **preserve_default** | true |
| **date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-be-01.md` |
| **honesty** | `contracts_printable_ready=false` · `payroll_e2e_ready=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |

---

## 1. spec_read_ack

| Artifact | Sections | Result |
|----------|----------|--------|
| **BA-01** | §4.3 Invent KEY wire · §8.1 Conditional BE unlock · VAL-CTR-TPL-01..06 · AC-PLT-CTR-TPL-04 | **READ** |
| **BA evidence** | invent KEY gap · LIVE 404/CODE-INVALID alias · ba-data HOLD · FE HOLD | **READ** |
| **SA Option B** | RETAIN Nest `hrm_contract_templates` · L-CTR-TPL-02 admin≠consumer · F-CTR-TPL-CNS-01 preview/print | **READ** |
| **Code LIVE** | `createTemplate` · `resolveActiveTemplate` · `getTemplateById` · freeze `print_versions.template_code` | **RETAIN** — no schema invent |

**change_mode:** ADD invent KEY wire only. **Forbidden:** ba-data migration · Settings sole SoT · reopen clause/ATT/LVRULE 01g · DnD · DOCX · flip printable · seed · mega-EAV · module CTR UAT · Phase1.

---

## 2. Implementation (closed)

| Item | Detail |
|------|--------|
| Constant | `HRM_CTR_TPL_KEY = 'HRM-CTR-TPL-KEY'` in `contract-legal-print.constants.ts` |
| Resolve invent | `resolveActiveTemplate` — invent/unknown/inactive `template_code` or `template_id` when **active EFF>0** → **`HRM-CTR-TPL-KEY`** (4xx) |
| Empty catalog | invent on print/preview when EFF=0 → **`HRM-CTR-TPL-NONE`** RETAIN |
| Get-by-id miss | `getTemplateById` → **`HRM-CTR-TPL-404`** RETAIN (≠ KEY) |
| Format | `requireTemplateCode` / assert path → **`HRM-CTR-TPL-CODE-INVALID`** format-only (≠ KEY) |
| Consumer assert | `assertTemplateKeysForConsumer` — EFF>0 invent KEY; EFF=0 soft skip (UF-HRM-02 nullable · U65); format before soft-skip |
| Scope parity (U19) | list / get-by-id / count / find-by-code share `resolveScope` + `pushCompanyIdFilter` |
| Display-ready | `displayTemplate` RETAIN — no display strip |
| createTemplate / freeze | **RETAIN LIVE** — untouched |
| Schema | **NO** new table / migration |

### Taxonomy lock (one wire per condition)

| Class | Wire | When |
|-------|------|------|
| Invent SoT | **`HRM-CTR-TPL-KEY`** | Active EFF>0 + code/id not in active catalog |
| Get-by-id miss | `HRM-CTR-TPL-404` | Admin/API GET `templates/{id}` absent in scope |
| Empty require-template | `HRM-CTR-TPL-NONE` | Print/preview needs template + EFF=0 |
| Bad slug | `HRM-CTR-TPL-CODE-INVALID` | Format/charset only |

---

## 3. Files touched

| Path | Change |
|------|--------|
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.constants.ts` | ADD `HRM_CTR_TPL_KEY` + CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.ts` | ADD assert + resolve invent map + CODE-MEMORY APPEND |
| `apps/api/hrm-api/src/contracts-insurance/contract-legal-print.service.spec.ts` | ADD VAL invent KEY / 404≠KEY / CODE-INVALID / NONE / scope_parity |

---

## 4. Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns=contract-legal-print.service.spec --no-coverage
→ Test Suites: 1 passed · Tests: 26 passed (incl. 9 new CTR invent KEY CNS)
```

| Test | Expect |
|------|--------|
| VAL-CTR-TPL-03 invent `template_code` EFF>0 preview | `HRM-CTR-TPL-KEY` |
| VAL-CTR-TPL-03 invent `template_id` EFF>0 preview | `HRM-CTR-TPL-KEY` |
| VAL-CTR-TPL-05 getTemplateById miss | `HRM-CTR-TPL-404` ≠ KEY |
| VAL-CTR-TPL-01 illegal slug | `HRM-CTR-TPL-CODE-INVALID` ≠ KEY |
| VAL-CTR-TPL-04 invent EFF=0 print | `HRM-CTR-TPL-NONE` |
| assert EFF=0 soft skip | resolves (U65) |
| assert invent EFF>0 | `HRM-CTR-TPL-KEY` |
| scope_parity main→holding invent | KEY + company_id filter |
| constant taxonomy | KEY ≠ 404 ≠ NONE ≠ CODE-INVALID |

---

## 5. RETAIN / honesty checklist

| Seal | Status |
|------|--------|
| CTR-CLAUSE `body_vi` Option B | **RETAIN — cấm reopen** |
| ATT leave-balance CNS-WIRE CLOSED · FE LVRULE 01g HOLD | **RETAIN** |
| ATT SHIFT/CODE/WS · EMP · SI · PAY seals | **RETAIN** |
| `contracts_printable_ready=false` | **NOT flipped** |
| U65 zero-seed | **OK** — no seed in evidence |
| C-SLICE ≠ module CTR UAT / Phase1 | **DENIED** claim |
| Display-ready list/get | **RETAIN** |
| DnD / DOCX / Settings sole SoT / mega-EAV | **FORBIDDEN** this seat |

---

## 6. Residual / not in this seat

| Item | Owner |
|------|-------|
| FE HOLD — Settings «Tạo mẫu #9+» LIVE; no invent FE HOLDs | FE HOLD |
| ba-data HOLD — no physicalize | ba-data HOLD |
| Optional wire `ContractsInsuranceService` create/update → `assertTemplateKeysForConsumer` (UF-HRM-02 POST invent) | residual P2 — preview/issue CNS closed; contract POST still free-text until wired |
| Browser L2.5 UF-CTR-TPL-INVENT | **qa** |
| Flip printable / module UAT | **DENIED** |

---

## 7. Handoff

**completion_report:** Narrow KEY CNS shipped on LIVE Nest `hrm_contract_templates` Option B RETAIN. Invent code/id when active EFF>0 → `HRM-CTR-TPL-KEY`; get-by-id miss stays `HRM-CTR-TPL-404`; empty print stays `HRM-CTR-TPL-NONE`; format stays `CODE-INVALID`. createTemplate/freeze untouched; no schema; honesty false; jest 26 PASS. Residual: optional contract CRUD assert wire (P2).

**next_owner:** qa

**ack_status:** READY_FOR_QA

**next_dispatch_prompt:**

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-TEMPLATE-BE-01 READY_FOR_QA
entry_criteria: L0 stack; evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-be-01.md
task: L1 invent KEY LIVE — preview/issue with invent template_code when EFF>0 → 4xx HRM-CTR-TPL-KEY;
  GET templates/:id miss → HRM-CTR-TPL-404 ≠ KEY; empty catalog print → HRM-CTR-TPL-NONE;
  CODE-INVALID format-only ≠ KEY; U65 zero-seed; honesty contracts_printable_ready=false · C-SLICE
cấm: seed · flip printable · reopen clause/ATT · claim module CTR UAT
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-template-qa-01.md
```

---

## 8. CODE-MEMORY

- APPEND on `contract-legal-print.constants.ts` + `contract-legal-print.service.ts` (work_item BE-01 · BA §4.3·§8.1).
