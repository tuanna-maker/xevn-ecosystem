# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01` · BA-01 · residual **R-PLT-SI-INR-03** |
| **from_role** | dev-fe |
| **to_role** | qa |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-08 |
| **change_mode** | **ADD** Settings SI insurer admin · **FIX** consumer pickers → Nest EFF |
| **honesty** | `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · **DENIED** invent SI/CTR module UAT · **`C-SLICE-≠-MODULE`** · U65 |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| BA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md` §4 S-SI-INR-CNS-01/02 · §6 AC-PLT-SI-INSURER-01* · VAL-SI-INR-CNS-* |
| SA | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-SA-01.md` F-SI-CAT-INS/EFF |
| BE | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md` — F-SI-CAT-INS/EFF live |
| Peer pattern | `SI-INS-CATALOG-FE-01` Settings + EFF picker (RETAIN — type pickers untouched) |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/siInsurerCatalog.ts` | Format-only key · picker map · history option |
| `apps/web/hrm/src/lib/siInsurerCatalog.test.ts` | Open-catalog format tests (**6 PASS**) |
| `apps/web/hrm/src/hooks/useSiInsurersEffective.ts` | RQ GET `/contracts-insurance/insurers/effective` |
| `apps/web/hrm/src/components/settings/SiInsurerSettingsPanel.tsx` | CRUD + retire Settings **Nhà BH / Insurers** |
| `apps/web/hrm/src/pages/Settings.tsx` | Tab `settings-tab-si-insurers` + `?tab=si-insurers` deep-link |
| `apps/web/hrm/src/integrations/hrmApi.ts` | F-SI-CAT-INS/EFF client |
| `apps/web/hrm/src/components/insurance/InsurancePolicyMasterPanel.tsx` | Policy insurer → Nest EFF + CTA admin |
| `apps/web/hrm/src/components/insurance/AddInsuranceDialog.tsx` | Soft-key insurer → Nest EFF + CTA admin |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-INS-INSURER-KEY` · alias UNKNOWN · 404 |
| `apps/web/hrm/src/lib/catalogSearchPicker.ts` | MD `insurers` helper **deprecated** as sole SoT |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HDSD ids SI insurer Settings |

**Cấm / not done:** seed · flip printable/personnel · reopen SI type L1 · wipe type FE · claim module SI/CTR UAT · CTR legal-print · enrollment rewrite.

**RETAIN smoke:** SI type Settings tab + type EFF pickers (policy/participant) unchanged.

---

## 3. Routes / click path (QA — AC-PLT-SI-INSURER-01*)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · OU holding / portal `main` |
| 1 | **Settings** → tab **Nhà BH / Insurers** (`settings-tab-si-insurers`) hoặc `?tab=si-insurers` |
| 2 | Card `settings-si-insurers` — nhập `insurerKey` (vd. `hr_insurer_custom_09`) · **Nhãn tiếng Việt** |
| 3 | **Tạo nhà BH** (`hdsd-si-insurer-save`) → Network **PUT/POST** `/api/hrm/contracts-insurance/insurers` **2xx** |
| 4 | F5 / **Tải lại** → row trong `settings-si-insurers-table` |
| 5a | **Bảo hiểm** → policy master → insurer picker Network **GET** `…/insurers/effective` → chọn mã → Lưu **2xx** → F5 |
| 5b | (optional) Participant dialog → soft insurer_key EFF → Lưu **2xx** → F5 |
| 6 | EFF=0: picker empty + CTA `hdsd-*-open-si-insurers` — **không** seed |
| 7 | Invent insurer khi EFF>0 → FE chặn và/hoặc Network **4xx** `HRM-INS-INSURER-KEY` (≠ `HRM-INS-TYPE-KEY`) |
| 8 | must_keep smoke: Settings **Loại BH / SI type** tab load · type picker still GET `…/insurance-types/effective` |

**HDSD inventory (U76):**

- `settings-tab-si-insurers`
- `settings-si-insurers` · `settings-si-insurers-table`
- `hdsd-si-insurer-key` · `hdsd-si-insurer-name` · `hdsd-si-insurer-save` · `hdsd-si-insurer-reload`
- `hdsd-si-insurer-retire-{key}` · `hdsd-si-insurer-effective-picker`
- `hdsd-policy-insurer-picker` · `hdsd-policy-open-si-insurers`
- `hdsd-participant-insurer-picker` · `hdsd-participant-open-si-insurers`

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/siInsurerCatalog.test.ts src/lib/siInsuranceTypeCatalog.test.ts src/lib/insurancePolicyFormSchema.test.ts --reporter=dot
→ Test Files: 3 passed · Tests: 15 passed (siInsurer 6 · peer type 7 · policy schema 2)
```

---

## 5. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| CTR legal-print / library | **RETAIN** (untouched) |
| SI enrollment EMP-BE-02 / F-CORE-SI-03 | **RETAIN** |
| SI type L1 F-SI-CAT-TYP/EFF FE | **RETAIN** (no wipe) |
| Seed / UF density | **DENIED** (U65) |
| `C-SLICE-≠-MODULE` | Nest insurer catalog FE ≠ module SI/CTR GO |
| Browser UF | **HOLD for QA** (this seat = wire only) |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| R-PLT-SI-INR-03 | Closed by this FE seat (rebind) | — |
| Browser AC-PLT-SI-INSURER-01/01b/01c/01d/01H | U65 create→F5→picker · invent KEY | **qa** |
| R-PLT-SI-INR-04 | Client API DOC-DELTA F-SI-CAT-INS-* | ba-docs |

---

## 7. Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md` |
| **next_owner** | **qa** |
| **completion_report** | ADD Settings SI insurer admin (F-SI-CAT-INS open N+1 + retire); rebind policy + optional records soft-key pickers to Nest GET `…/insurers/effective`; empty EFF → soft empty + CTA admin (no seed); MD `insurers` deprecated as sole SoT; SI type FE RETAIN; honesty false; vitest 6 PASS (+ peer type 7). |
| **next_dispatch_prompt** | See §8 |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
prior: SI-INSURER-CATALOG-FE-01 READY_FOR_QA · BE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed; browser-only for UF
read_first:
  - docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-fe-01.md
  - docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-be-01.md
  - docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BA-01.md §6 AC-PLT-SI-INSURER-01*
exit_criteria:
  - L1: GET …/insurers/effective (empty [] OK) · invent policy insurer_key when EFF>0 → 400 HRM-INS-INSURER-KEY
  - Confirm HRM-INS-TYPE-KEY path still separate (peer type RETAIN)
  - L2/L2.5 U65: Settings Nhà BH CREATE N+1 → F5 → policy insurer picker Network GET effective → Lưu 2xx → F5
  - AC-PLT-SI-INSURER-01c: EFF=0 empty picker + CTA admin · no seed
  - honesty flags remain false · SI type / CTR / enrollment seals untouched
  - evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-si-insurer-catalog-qa-01.md
  - ack_status PASS_TO_PM | FAIL_TO_PM
cấm: pnpm seed:* · flip printable/personnel · reopen SI type L1 · claim module SI/CTR UAT
```
