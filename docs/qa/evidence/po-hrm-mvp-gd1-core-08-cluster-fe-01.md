# Evidence — PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-08-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-12 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-08` |
| **depends_on** | API-01 **CONFIRMED** · BA O1–O12 · BE-01 parallel OK (UI bind stubs) |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE/ADD · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-08-* · VAL-CORE-RD-* · J-HRM-CORE-08-01..04 DRAFT |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md` | F-CORE-RD-01 UPGRADE · enforce/cancel · physical rewards* + discipline* |
| **DATA-01** | §4 link cols · §5 execution map · soft `payroll_periods` |
| **CORE-02 / CORE-01** | stamps `CORE02QC1-MSL80DU6` · `CORE01QC1-MSL6WMS7` must_keep · **≠** pillar DONE · **≠** FR-08 via note-CRUD |
| **AS-IS UI** | `EmployeeRewardsDiscipline` note-CRUD without period/enforce |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-08 Diễn biến #1–#5 · BR-BP-RD-01
- tech_spec / api: PO-HRM-MVP-GD1-CORE-08-CLUSTER-API-01.md F-CORE-RD-01 §5.1–§5.4
- ba: PO-HRM-MVP-GD1-CORE-08-CLUSTER-BA-01.md O1–O12 · AC-CORE-08-*
- db_design: DATA-01 §4–§5 (cite — no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind tab KT/KL → GET/POST/PATCH `/api/hrm/employees/:id/rewards*` + `/discipline*` | **UPGRADE** |
| Title-first form · amount>0 → period picker (`listPayrollPeriods` unlocked) | **ADD** |
| Enforce / Cancel → POST `…/enforce` · `…/cancel-enforce` | **ADD** |
| F5 retain `status_label` + `payroll_link_status` (+ label) + period ref from BE | **ADD** |
| Amounts vi-VN · dates dd/MM/yyyy (`formatDisplayDate` · ViMoneyInput · ViDateField) | **UPGRADE** |
| Toast VAL / ENFORCE / DUAL / LOCKED / EMP (+ PERIOD-404 / RD-404) | **ADD** |
| Create omits status invent (pending BE) · note-only no period | **UPGRADE** |
| DENY Nest `/core` SoT · FE invent payslip Net · fold `/decisions` · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · seed · honesty | **PASS** |
| vitest | **15 PASS** (3 files) |

### Files touched

- `apps/web/hrm/src/lib/empCoreRdRing.ts` (+ test)
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-08.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — enforce / cancel-enforce
- `apps/web/hrm/src/hooks/useEmployeeRewardsDiscipline.ts`
- `apps/web/hrm/src/components/employee/EmployeeRewardsDiscipline.tsx`
- `apps/web/hrm/src/lib/poHrmMvpGd1Core08ClusterFe01.source.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreRdRing.test.ts \
  src/lib/apiError.core-08.test.ts \
  src/lib/poHrmMvpGd1Core08ClusterFe01.source.test.ts
# → 3 files · 15 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-08-01** | Login → hồ sơ NV Hoạt động → tab KT/KL → nhập **tiêu đề trước** (+ loại + amount + kỳ nếu tiền) → Lưu → F5 | Network **POST** `/employees/:id/rewards` **or** `…/discipline` **2xx** · status **Chờ** · path physical · **không** Nest `/core` |
| **J-HRM-CORE-08-02** | Case Chờ + period (nếu tiền) → **Thi hành** → F5 | Network **POST …/enforce** **2xx** · `status_label` Đang/Đã · `payroll_link_status` linked · period label còn |
| **J-HRM-CORE-08-03** | Enforced unlocked → **Hủy thi hành** · note-only (amount 0) create | Cancel **2xx** unlink/Hủy · note `payroll_link_status=none` · **không** FE invent payslip Net |
| **J-HRM-CORE-08-04** | Network assert + must_keep | Nest `/core` **0** · toast LOCKED/DUAL/EMP/VAL when BE LIVE · CORE-02/01 seals RETAIN · **≠** claim CORE-02=pillar DONE · **≠** note-CRUD=FR-08 DONE |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Prerequisite:** BE-01 payroll_link DTO + enforce/cancel + RD-* mint LIVE (parallel)  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · fold `/decisions` · honesty flip · reopen J-CORE-02/01 rewrite

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-08-BE-LIVE** | Browser U65 blocked until BE-01 link cols + enforce/cancel + RD-* codes LIVE | BE / QA |
| Honesty | flags false · C-SLICE · CORE-02 ≠ pillar DONE · note ≠ FR-08 DONE | QC |
| F-PAY-RD-APPLY-01 / payslip write | OUT | peer |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
personnel / CORE module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core RD dual DENY · CORE-02 packages ≠ pillar DONE · note-CRUD ≠ FR-08 DONE · no FE invent payslip Net
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-08-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-08
depends_on: FE-01 READY_FOR_QA · BE-01 READY (payroll_link + enforce/cancel + HRM-CORE-RD-* LIVE)
entry_criteria: L0 stack; browser-only U65; cấm seed; honesty false; C-SLICE; must_keep CORE-02/01 seals
MISSION: U65 browser J-HRM-CORE-08-01..04 — tab KT/KL title-first create Network path contains /employees/:id/rewards OR /discipline; amount>0 period picker; Thi hành → POST …/enforce F5 status_label + payroll_link_status + period label; Hủy → cancel-enforce; note-only link=none; toast VAL/ENFORCE/DUAL/LOCKED/EMP; amounts vi-VN · dates dd/MM/yyyy; DENY Nest /core SoT · FE invent payslip Net · fold /decisions · claim CORE-02=pillar DONE · claim note-CRUD=FR-08 DONE · seed · honesty flip · reopen J-CORE-02/01.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-08-cluster-qa-01.md · PASS_TO_PM
```
