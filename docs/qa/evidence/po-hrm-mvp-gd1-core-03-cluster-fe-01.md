# Evidence — PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-18 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-03` |
| **depends_on** | API-01 **CONFIRMED** · BA O1–O12 · BE-01 parallel OK (UI bind stubs) |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · personnel/CORE/CTR module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only · empty checklist OK |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-03-* · J-HRM-CORE-03-01..05 DRAFT |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md` | F-CORE-CHK-01 ADD · physical `/employees/:id/document-checklist*` · DOC/ET RETAIN |
| **DATA-01** | `hrm_document_checklist_item` §4–§5 · status missing\|submitted\|approved |
| **DOC/ET L1** | seals `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` RETAIN · **≠** CORE-03 DONE |
| **Peers must_keep** | CORE-02b / 09d..01 · Nest `/core` DENY · CORE-07 OUT invent DONE |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-03 Diễn biến #1–#2 · BR-BP-DOC-01 · BR-PLT-02/05
- tech_spec / api: PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md F-CORE-CHK-01 §4
- ba: PO-HRM-MVP-GD1-CORE-03-CLUSTER-BA-01.md O1–O12 · AC-CORE-03-*
- db_design: DATA-01 §4–§5 (cite — no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind hồ sơ checklist → Network **`/api/hrm/employees/:id/document-checklist*`** only | **ADD** |
| DENY Nest `/core` checklist/DOC SoT | **PASS** (source lock) |
| Settings DOC/ET **RETAIN** `/document-types*` · `/employment-types*` — no FE hardcode required starter | **RETAIN** (asserted) |
| Nộp → `submitted` · Xác nhận → `approved` · toast invent **`HRM-EMP-DOC-TYPE-UNKNOWN`** | **ADD** |
| F5 list · empty `[]` OK U65 (no seed) | **ADD** |
| DENY invent DOC SoT · claim CORE-07 / personnel / printable DONE · reopen sealed J-* · honesty flip | **PASS** |
| Profile tab `documents` + deep-link `?tab=documents` | **ADD** |
| vitest | **22 PASS** (4 files) |

### Files touched

- `apps/web/hrm/src/lib/empCoreChkRing.ts` (+ test)
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-03.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — list/get/create/patch/archive checklist
- `apps/web/hrm/src/hooks/useEmployeeDocumentChecklist.ts`
- `apps/web/hrm/src/components/employee/EmployeeDocumentChecklist.tsx`
- `apps/web/hrm/src/pages/EmployeeProfile.tsx` — tab wire
- `apps/web/hrm/src/lib/employeeProfileTabGroups.ts` (+ test)
- `apps/web/hrm/src/i18n/locales/{vi,en,zh,my,lo,km}.json`
- `apps/web/hrm/src/lib/poHrmMvpGd1Core03ClusterFe01.source.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreChkRing.test.ts \
  src/lib/apiError.core-03.test.ts \
  src/lib/poHrmMvpGd1Core03ClusterFe01.source.test.ts \
  src/lib/employeeProfileTabGroups.test.ts
# → 4 files · 22 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-03-01** | Cài đặt → Loại giấy tờ EMP → tạo mã N+1 + flags → F5 | Network **`/employees/document-types*`** 2xx · **không** Nest `/core` · open catalog (cite EMP DOC L1) |
| **J-HRM-CORE-03-02** | Spot ET + TOK emp.doc.* (RETAIN) | `/employment-types*` · merge-tokens side-effect cite |
| **J-HRM-CORE-03-03** | EFF>0 · invent KEY trên checklist Thêm dòng | Toast **`HRM-EMP-DOC-TYPE-UNKNOWN`** · F5 **không** row mới |
| **J-HRM-CORE-03-04** | Hồ sơ NV → Career → **Giấy tờ** (`?tab=documents`) → Thêm dòng (picker EFF) → **Nộp** → **Xác nhận** → F5 | Network **GET/POST/PATCH** `…/employees/:id/document-checklist*` · status submitted→approved · empty OK trước mutate |
| **J-HRM-CORE-03-05** | Soft-retire DOC → picker ẩn · history checklist còn | Retire RETAIN · history GET OK |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Prerequisite:** BE-01 Nest `document-checklist*` + assert wire + CHK-* codes LIVE (parallel)  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · FE invent DOC starter · honesty flip · claim CORE-07/personnel/printable DONE · reopen sealed J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-03-BE-LIVE** | Browser U65 mutate blocked until BE-01 checklist route + table + assert LIVE | BE / QA |
| Honesty | flags false · C-SLICE · EMP DOC L1 ≠ CORE-03 DONE · CORE-07 OUT | QC |
| CORE-07 activate / OCR | OUT invent DONE | peer |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · empty checklist OK
Nest /core CHK dual DENY · FE invent DOC SoT DENY · CORE-07 / printable DONE DENY
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-fe-01.md` |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-03-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-03
entry_criteria: FE-01 READY_FOR_QA @ docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-fe-01.md · BE-01 document-checklist* LIVE (or note BLOCKED if route 404) · L0 stack · U65 zero-seed
exit_criteria: J-HRM-CORE-03-01..05 browser evidence · Network physical /employees/:id/document-checklist* + /document-types* /employment-types* · Nest /core = 0 · Nộp→submitted · Xác nhận→approved · invent KEY toast · empty OK · DENY claim CORE-07/personnel/printable DONE · must_keep sealed J-CORE-02B/09D..01 · PASS_TO_PM or FAIL with residual
evidence_path: docs/qa/evidence/po-hrm-mvp-gd1-core-03-cluster-qa-01.md
cấm: seed · Nest /core SoT · FE invent DOC · honesty flip · reopen sealed peers
```
