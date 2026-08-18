# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01` · BA-01 · residual **R-PLT-SI-INS-03** |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **ADD** Settings SI type admin · **FIX** consumer pickers → Nest EFF |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **DENIED** invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md` §4 S-SI-CNS-01..03 · §6 AC-PLT-SI-INS-01* · VAL-SI-CNS-04 |
| BE | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-01.md` — F-SI-CAT-TYP/EFF live |
| Peer pattern | ATT leave-type FE · DEC decision-type FE · PAY catalog CNS FE |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/siInsuranceTypeCatalog.ts` | Format-only key · picker map · rate-cfg filter · history option |
| `apps/web/hrm/src/lib/siInsuranceTypeCatalog.test.ts` | Open-catalog format tests (**7 PASS**) |
| `apps/web/hrm/src/hooks/useSiInsuranceTypesEffective.ts` | RQ GET `/contracts-insurance/insurance-types/effective` |
| `apps/web/hrm/src/components/settings/SiInsuranceTypeSettingsPanel.tsx` | CRUD + retire Settings **Loại BH / SI type** |
| `apps/web/hrm/src/pages/Settings.tsx` | Tab `settings-tab-si-insurance-types` + `?tab=` deep-link |
| `apps/web/hrm/src/integrations/hrmApi.ts` | F-SI-CAT-TYP/EFF client |
| `apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx` | Policy type → Nest EFF + CTA admin |
| `apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx` | Participant type → Nest EFF |
| `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx` | Enrollment type CatalogSearchPicker EFF |
| `apps/web/hrm/src/hooks/useEmployeeInsurance.ts` | `type: string` open — preserve raw key |
| `apps/web/hrm/src/components/settings/SettingsDefaultsPanel.tsx` | Rate-cfg key picker EFF (eligible) |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-INS-TYPE-KEY` · alias UNKNOWN · 404 |
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | MD `insurance_types` helper **deprecated** as sole SoT |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HDSD ids SI type Settings |

**Cấm / not done:** seed · rewrite enrollment ONE SoT · CTR legal-print · insurers Nest fold · flip printable/personnel · claim module SI/CTR UAT.

---

## 3. Routes / click path (QA — AC-PLT-SI-INS-01*)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · OU holding / portal `main` |
| 1 | **Settings** → tab **Loại BH / SI type** (`settings-tab-si-insurance-types`) hoặc `?tab=si-insurance-types` |
| 2 | Card `settings-si-insurance-types` — nhập `insuranceTypeKey` (vd. `hr_custom_si_09`) · **Nhãn tiếng Việt** |
| 3 | **Tạo loại BH** (`hdsd-si-insurance-type-save`) → Network **PUT/POST** `/api/hrm/contracts-insurance/insurance-types` **2xx** |
| 4 | F5 / **Tải lại** → row trong `settings-si-insurance-types-table` |
| 5a | **Bảo hiểm** → policy master → type picker Network **GET** `…/insurance-types/effective` → chọn mã → Lưu **2xx** → F5 |
| 5b | Hồ sơ NV → BH timeline → Thêm → type picker EFF → Lưu **2xx** → F5 |
| 5c | (optional) Settings → Mặc định thuế/BH/PC → rate-cfg type ∈ EFF |
| 6 | EFF=0: picker empty + CTA `hdsd-*-open-si-insurance-types` — **không** seed |
| 7 | Invent type khi EFF>0 → FE chặn và/hoặc Network **4xx** `HRM-INS-TYPE-KEY` |
| 8 | must_keep smoke: enrollment timeline actions · CTR legal-print Settings tab load |

**HDSD inventory (U76):**

- `settings-tab-si-insurance-types`
- `settings-si-insurance-types` · `settings-si-insurance-types-table`
- `hdsd-si-insurance-type-key` · `hdsd-si-insurance-type-name` · `hdsd-si-insurance-type-save` · `hdsd-si-insurance-type-reload`
- `hdsd-si-insurance-type-retire-{key}` · `hdsd-si-insurance-type-effective-picker`
- `hdsd-policy-insurance-type-picker` · `hdsd-policy-open-si-insurance-types`
- `hdsd-enrollment-insurance-type-picker` · `hdsd-enrollment-open-si-insurance-types`
- `hdsd-settings-si-type-key` · `hdsd-settings-si-open-si-insurance-types`

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/siInsuranceTypeCatalog.test.ts --reporter=dot
→ Test Files: 1 passed · Tests: 7 passed
```

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| CTR legal-print / library | **RETAIN** (untouched) |
| SI enrollment EMP-BE-02 / F-CORE-SI-03 | **RETAIN** |
| Insurers Nest fold | **OUT** (MD insurer picker keep) |
| Seed / UF density | **DENIED** (U65) |
| `C-SLICE-≠-MODULE` | Nest type catalog FE ≠ module SI/CTR GO |
| Browser UF | **HOLD for QA** (this seat = wire only) |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-SI-INS-03 | Closed by this FE seat (rebind) | — |
| Browser AC-PLT-SI-INS-01/01b/01c/01d/01H | U65 create→F5→picker · invent KEY | **qa** |
| R-PLT-SI-INS-04 | Client API DOC-DELTA F-SI-CAT-* | ba-docs |
| R-PLT-SI-INS-05 | Insurers Nest catalog | OUT / later |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-fe-01.md` |
| **next_owner** | **qa** |
| **completion_report** | ADD Settings SI insurance-type admin (F-SI-CAT-TYP open N+1 + retire); rebind policy + enrollment + optional rate-cfg pickers to Nest GET `…/insurance-types/effective`; empty EFF → soft empty + CTA admin (no seed); MD `insurance_types` deprecated as sole SoT; enrollment type open string; CTR/enrollment seals untouched; honesty false; vitest 7 PASS. |
| **next_dispatch_prompt** | See §8 |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
prior: SI-INS-CATALOG-FE-01 READY_FOR_QA · BE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed; browser-only for UF
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-fe-01.md
  - docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-be-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BA-01.md §6 AC-PLT-SI-INS-01*
exit_criteria:
  - L1: GET …/insurance-types/effective (empty [] OK) · invent policy/enrollment type when EFF>0 → 400 HRM-INS-TYPE-KEY
  - L2/L2.5 U65: Settings Loại BH CREATE N+1 → F5 → policy + enrollment pickers Network GET effective → Lưu 2xx → F5
  - AC-PLT-SI-INS-01c: EFF=0 empty picker + CTA admin · no seed
  - honesty flags remain false · CTR/enrollment seals untouched
  - evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-ins-catalog-qa-01.md
  - ack_status PASS_TO_PM | FAIL_TO_PM
cấm: pnpm seed:* · flip printable/personnel · claim module SI/CTR UAT
```
