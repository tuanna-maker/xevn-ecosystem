# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QC-01` GWC L1 SEAL |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **change_mode** | **ADD** Settings DEC CFG panel + API client · **FIX** Decisions picker → effective |
| **honesty** | decisions UAT=**false** · personnel/e2e/pay/att/rec/printable=**false** · **LOCKED** · U65 |
| **must_keep** | F-CORE-DEC create/approve/WH · EMP DOC/ET · ATT leave · REC stages · no seed · no wipe L1 SEAL |
| **stamp_ref** | L1 SEAL `DECPLATQA-MSJ1FB3D` · QC `po-hrm-dynamic-config-platform-dec-qc-01.md` |
| **closes** | `R-PLT-DEC-FE-01` (wire) — browser UF for QA |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QC GWC | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qc-01.md` — L1 SEAL · CONDITION `R-PLT-DEC-FE-01` |
| QA L1 | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-01.md` — stamp `DECPLATQA-MSJ1FB3D` |
| BE | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-be-01.md` — F-DEC-CAT-TYP/EFF · `^[a-zA-Z][a-zA-Z0-9_]*$` |
| SA vertical | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-VERTICAL-SA-01.md` §3 F-DEC-CAT · AC-PLT-DEC |
| Pattern neo | `EmpDocumentTypeSettingsPanel` · `AttLeaveTypeSettingsPanel` |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/decDecisionTypeCatalog.ts` | Format-only DEC key (HRD_* case allowed) · picker map · history |
| `apps/web/hrm/src/lib/decDecisionTypeCatalog.test.ts` | Open-catalog format tests (**5 PASS**) |
| `apps/web/hrm/src/hooks/useDecDecisionTypesEffective.ts` | RQ GET `/decisions/decision-types/effective` |
| `apps/web/hrm/src/components/settings/DecDecisionTypeSettingsPanel.tsx` | CRUD + retire + effective picker preview + WH flags |
| `apps/web/hrm/src/pages/Settings.tsx` | Tab **Loại quyết định DEC** |
| `apps/web/hrm/src/pages/Decisions.tsx` | decision_type picker → **effective** · CNS toast via apiError · catalog personBound/WH extras |
| `apps/web/hrm/src/integrations/hrmApi.ts` | F-DEC-CAT-TYP/EFF client |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-DEC-TYPE-UNKNOWN` · `HRM-DEC-TYP-*` toast copy |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HDSD ids DEC TYP |

**Cấm / not done:** seed · invent decisions UAT · flip honesty · wipe L1 SEAL · closed enum invent · claim browser UF PASS · reopen EMP/ATT/REC.

---

## 3. Routes / click path (QA — AC-PLT-DEC browser)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · OU scope `holding` / portal `main` |
| 1 | **Settings** → tab **Loại quyết định DEC** (`settings-tab-dec-decision-types`) |
| 2 | Nhập `decisionTypeKey` open (vd. `hr_custom_dec_09_*`) · **Nhãn tiếng Việt** → **Tạo loại quyết định** (`hdsd-dec-decision-type-save`) → Network **PUT** `/api/hrm/decisions/decision-types` **2xx** |
| 3 | Invalid: nhập `BAD KEY` hoặc `9bad_key` → toast **HRM-PLT-CAT-CODE-INVALID** (client format; HRD_* uppercase **allowed**) |
| 3b | Valid case: `HRD_QA_*` → **2xx** (DEC allows case — không reject uppercase-alone) |
| 4 | **Tải lại (F5 list)** / F5 trang → row trong table; **Picker hiệu lực** (`hdsd-dec-decision-type-effective-picker`) chọn được mã mới |
| 5 | **Quyết định** → Thêm QSĐ → picker loại (`hdsd-decisions-form-type` / decisionsFormType) → mã mới từ GET `/decision-types/effective` |
| 6 | CNS: nếu gửi type ∉ effective khi catalog >0 → toast **HRM-DEC-TYPE-UNKNOWN** (Network **400**) |
| 7 | **Ngừng** loại → active list/picker ẩn; QSĐ cũ vẫn hiện key (history option) |
| 8 | must_keep smoke: create/approve QSĐ · WH hint path · EMP DOC/ET · ATT leave · REC tabs load |

**HDSD inventory (U76):**

- `settings-tab-dec-decision-types`
- `settings-dec-decision-types` · `settings-dec-decision-types-table` · `settings-dec-decision-types-picker-preview`
- `hdsd-dec-decision-type-key` · `hdsd-dec-decision-type-name` · `hdsd-dec-decision-type-save` · `hdsd-dec-decision-type-reload` · `hdsd-dec-decision-type-retire-{key}` · `hdsd-dec-decision-type-effective-picker`
- Decisions form type picker (existing HDSD decisionsFormType)

**Expected network stamps:**

```text
GET  /api/hrm/decisions/decision-types?company_id=…&status=active   → 200 HRM-DEC-TYP-200
PUT  /api/hrm/decisions/decision-types                              → 2xx (open key / HRD_*)
GET  /api/hrm/decisions/decision-types/effective                    → 200 dual SoT
POST /api/hrm/decisions/decision-types/:id/retire                   → 2xx soft
POST /api/hrm/decisions (unknown type when EFF>0)                   → 400 HRM-DEC-TYPE-UNKNOWN
```

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/decDecisionTypeCatalog.test.ts src/lib/decisionPersonBound.test.ts --reporter=dot
→ Test Files: 2 passed · Tests: 15 passed
```

| Suite | Result |
|-------|--------|
| `decDecisionTypeCatalog.test.ts` | **5 PASS** (open N+ · HRD_* case · reject space/digit · history) |
| `decisionPersonBound.test.ts` | **10 PASS** (must_keep F-CORE-DEC regression) |

---

## 5. Honesty

| Flag | Value |
|------|-------|
| Decisions / QSĐ module UAT | **false LOCKED** |
| `hrm_personnel_uat_ready` / e2e / pay / att / rec / printable | **false LOCKED** |
| U65 seed in evidence | **none** |
| Module / Phase1 UAT flip | **none** |
| Browser UF | **HOLD for QA** (this seat = wire only) |
| L1 SEAL `DECPLATQA-MSJ1FB3D` | **not wiped** |

---

## 6. completion_report

**Closed:** ADD Settings DEC CFG decision-types open catalog FE (peer EMP/ATT/REC); hrmApi F-DEC-CAT-TYP/EFF; effective pickers in Settings preview + Decisions create form; format-only toast `HRM-PLT-CAT-CODE-INVALID` (space/digit) while **HRD_* case allowed**; CNS `HRM-DEC-TYPE-UNKNOWN` FE feedback; soft-retire hides active + history option; catalog flags feed personBound/WH extras without wiping F-CORE-DEC defaults; vitest **15 PASS** (5 new + 10 regression); honesty false LOCKED; must_keep F-CORE-DEC / EMP / ATT / REC untouched.

**Residual:** Browser U65 AC-PLT-DEC (create→2xx→F5→picker · format toast · HRD_* · retire hide · CNS unknown) — owner **qa**.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-QA-02
from_role: pm
to_role: qa
lane: execution
priority: P0
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01 READY_FOR_QA
program: PO-HRM-CONTINUOUS-W8-20260807
ref_fe: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-fe-01.md
stamp_ref: DECPLATQA-MSJ1FB3D · L1 SEAL GWC DEC-QC-01 (do not wipe)

## task
U65 browser-only Settings / DEC CFG + Decisions picker UF (closes R-PLT-DEC-FE-01 verify):
1. Login ceo@xe.vn / Xevn@2026 → Settings → tab «Loại quyết định DEC» (settings-tab-dec-decision-types)
2. Create open key (hr_custom_dec_09_*) → PUT/POST decision-types 2xx → Tải lại / F5 → row + effective picker shows key
3. Format INVALID: space / leading digit → toast HRM-PLT-CAT-CODE-INVALID (no Network invent PASS)
4. HRD_* uppercase-alone VALID (peer L1) — do not FAIL case-only keys
5. Quyết định → Thêm → type picker binds GET …/decision-types/effective (new key selectable)
6. CNS: unknown type when EFF>0 → 400 HRM-DEC-TYPE-UNKNOWN FE toast
7. Retire → picker hide; history row still shows key on old QSĐ
8. must_keep smoke: F-CORE-DEC create/approve/WH · EMP DOC/ET · ATT leave · REC tabs
cấm: seed · invent decisions UAT · flip *_ready · claim module GO · wipe L1 SEAL
exit: PASS_TO_PM with browser evidence blocks + network stamps OR FAIL residual
evidence_path: docs/qa/evidence/po-hrm-dynamic-config-platform-dec-qa-02.md
```
