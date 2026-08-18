# Evidence — PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-01-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-10 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-01` |
| **depends_on** | API-01 **CONFIRMED** · BA O1–O12 · BE-01 parallel OK |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE/ADD · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01 · Diễn biến FE U65 |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md` | F-CORE-EMP-01 UPGRADE · F-CORE-DEP-01 ADD · physical `/employees*` · CB-403 · DEP-* · relation_label |
| **DATA-01** | §4 allow/deny · §5 `employee_dependents` |
| **AS-IS UI** | EmployeeForm had finance tab when `view_salary`; FamilyInfo stub null; Profile bound `employee.salary` InfoItems |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-01 Diễn biến #1–#4 · BR-BP-SEC-01 · AC-CORE-PUB-01/02 · AC-CORE-CB-MAP-01
- tech_spec / api: PO-HRM-MVP-GD1-CORE-01-CLUSTER-API-01.md F-CORE-EMP-01 · F-CORE-DEP-01 · F-CORE-HTP-05 RETAIN
- ba: PO-HRM-MVP-GD1-CORE-01-CLUSTER-BA-01.md O1–O12 · AC-CORE-01-*
- db_design: DATA-01 §4–§5 (cite — no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Public create/edit → GET/PATCH `/api/hrm/employees*` only · strip CB keys from CF | **UPGRADE** |
| AC-CORE-CB-MAP-01 — hide finance tab; redirect banner; NEVER submit salary/bank/tax/SI | **UPGRADE** |
| Profile general — no public DTO salary/bank/tax/SI InfoItems; CTA → salary/insurance tabs | **UPGRADE** |
| `mapHrmEmployeeRecord` strip CF deny keys (F5 defense) | **UPGRADE** |
| Dependents UI → Nest `…/employees/:id/dependents*` · `relation_label` · DOB dd/MM/yyyy (ViDateField) | **ADD** |
| Toast `HRM-CORE-CB-403` · `HRM-CORE-DEP-VAL-400` · `HRM-CORE-DEP-404` · optional PUB-VAL | **ADD** |
| DENY Nest `/core` SoT · same-form salary · FE invent salary aggregate · hire=CORE DONE · seed · honesty | **PASS** |
| Emergency contact | **RETAIN stub honesty** (OUT F-CORE-DEP-01) |
| vitest | **24 PASS** |

### Files touched

- `apps/web/hrm/src/lib/empCorePublicRing.ts` (+ test)
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-01.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — dependents CRUD clients
- `apps/web/hrm/src/hooks/useEmployeeMutations.ts` — strip CB before mutate
- `apps/web/hrm/src/hooks/useEmployee.ts` — strip CF on map
- `apps/web/hrm/src/components/employee/EmployeeFormDialog.tsx` — CB-MAP
- `apps/web/hrm/src/components/employee/EmployeeFamilyInfo.tsx` — Nest dependents
- `apps/web/hrm/src/pages/EmployeeProfile.tsx` — CB redirect cards
- `apps/web/hrm/src/lib/poHrmMvpGd1Core01ClusterFe01.source.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCorePublicRing.test.ts \
  src/lib/apiError.core-01.test.ts \
  src/lib/poHrmMvpGd1Core01ClusterFe01.source.test.ts \
  src/components/employee/EmployeeFormDialog.mount-guard.test.ts
# → 4 files · 24 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-01-01** | Login → NS → mở hồ sơ → Thông tin chung | Network **GET** `/api/hrm/employees/:id` · **không** Nest `/core` · **không** hiện lương/NH/MST từ public DTO · CTA redirect C&B |
| **J-HRM-CORE-01-02** | Sửa hồ sơ hành chính → Lưu → F5 | **PATCH** `/employees/:id` 2xx · form **không** tab Tài chính · F5 vẫn **không** lộ C&B |
| **J-HRM-CORE-01-03** | Tab Gia đình → Thêm NPT (họ tên + quan hệ + DOB dd/MM/yyyy) → Lưu → F5 | **POST** `…/dependents` 2xx · row `relation_label` · DOB display · F5 còn |
| **J-HRM-CORE-01-04** | Forced C&B body / thiếu DOB / soft-delete | Toast **CB-403** / **DEP-VAL-400** / **DEP-404** · **≠** claim hire=CORE DONE · **≠** salary từ «có gia đình» |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Nhân sự  
**Prerequisite:** BE-01 public serializer + dependents LIVE (parallel)  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · same-form salary PASS · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-01-BE-LIVE** | Browser U65 blocked until BE-01 mapPublicEmployee + dependents routes LIVE | BE / QA |
| Emergency contact Nest | OUT — stub honesty | peer |
| Honesty | flags false · C-SLICE | QC |
| CORE-02 compensation write | OUT | peer |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
personnel / CORE module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core EMP dual DENY · hire ≠ CORE-01 DONE · family ≠ salary
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-01-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-01
depends_on: FE-01 READY_FOR_QA · BE-01 READY (public strip + dependents LIVE)
entry_criteria: L0 stack; browser-only U65; cấm seed; honesty false; C-SLICE
MISSION: U65 browser J-HRM-CORE-01-01..04 — public GET/PATCH /employees only; F5 no C&B leak; CB-MAP hide/redirect; dependents CRUD relation_label + DOB dd/MM/yyyy; toast CB-403 / DEP-*; Network path contains /employees not Nest /core SoT; DENY hire=CORE DONE · family⇒salary · seed · honesty flip.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-01-cluster-qa-01.md · PASS_TO_PM
```
