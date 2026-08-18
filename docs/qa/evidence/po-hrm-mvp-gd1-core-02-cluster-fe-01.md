# Evidence — PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-11 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-02` |
| **depends_on** | API-01 **CONFIRMED** · BA O1–O12 · BE-01 parallel OK (UI bind stubs) |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | UPGRADE/ADD · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · personnel/CORE module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-CB-01/02 · AC-CORE-02-* · J-HRM-CORE-02-01..04 DRAFT |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md` | F-CORE-EMP-02 UPGRADE · F-CORE-SI-* RETAIN · packages* + employee-insurances* · AuthZ/OVERLAP/VAL |
| **DATA-01** | §4 bank/MST header · §5 SI period RETAIN |
| **CORE-01** | stamp `CORE01QC1-MSL6WMS7` must_keep · **≠** C&B DONE |
| **AS-IS UI** | Compensation panel packages create/revise; SI timeline actions; public form finance stripped |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-02 Diễn biến #1–#4 · BR-BP-SEC-02 · AC-CORE-CB-01/02
- tech_spec / api: PO-HRM-MVP-GD1-CORE-02-CLUSTER-API-01.md F-CORE-EMP-02 · F-CORE-SI-* · F-CORE-SI-RATE
- ba: PO-HRM-MVP-GD1-CORE-02-CLUSTER-BA-01.md O1–O12 · AC-CORE-02-*
- db_design: DATA-01 §4–§5 (cite — no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Bind vòng mật → GET/POST/revise `/api/hrm/contracts-insurance/compensation-packages*` (+ active/history) | **UPGRADE** |
| Bank/MST on C&B form only (create/revise body) · mask view on active/history | **ADD** |
| SI → `/employee-insurances*` · amount delta → `POST …/actions` `change_rate` (PATCH omits contrib) | **UPGRADE** |
| Toast `HRM-CORE-CB-AUTHZ-403` · `HRM-COMP-409-OVERLAP` / `HRM-CORE-CB-OVERLAP-409` · `HRM-CORE-CB-VAL-400` · RETAIN `HRM-CORE-CB-403` | **ADD** |
| Amounts vi-VN · dates dd/MM/yyyy (Calendar + formatDisplayDate) | **RETAIN/UPGRADE** |
| Public CORE-01 form still strips finance (AC-CORE-CB-02 / must_keep) | **RETAIN** |
| DENY Nest `/core` SoT · same-form public+salary · FE invent payslip · claim CORE-01=C&B DONE · seed · honesty | **PASS** |
| vitest | **43 PASS** (8 files) |

### Files touched

- `apps/web/hrm/src/lib/empCoreCbRing.ts` (+ test)
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-02.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — bank/MST on package DTO + create/revise
- `apps/web/hrm/src/hooks/useEmployeeCompensation.ts` — passthrough bank/MST
- `apps/web/hrm/src/hooks/useEmployeeInsurance.ts` — split rate → change_rate
- `apps/web/hrm/src/components/employee/EmployeeCompensationPanel.tsx` (+ test mock)
- `apps/web/hrm/src/components/employee/EmployeeCompensationHistoryPanel.tsx`
- `apps/web/hrm/src/components/employee/EmployeeInsurance.tsx` — CODE-MEMORY APPEND
- `apps/web/hrm/src/lib/poHrmMvpGd1Core02ClusterFe01.source.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreCbRing.test.ts \
  src/lib/apiError.core-02.test.ts \
  src/lib/poHrmMvpGd1Core02ClusterFe01.source.test.ts \
  src/components/employee/EmployeeCompensationPanel.test.ts \
  src/lib/compensationLines.test.ts \
  src/lib/insuranceTimelineActions.test.ts \
  src/lib/empCorePublicRing.test.ts \
  src/lib/apiError.core-01.test.ts
# → 8 files · 43 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-02-01** | Login C&B → HĐ–BH / Đãi ngộ → mở mật NV | Network **GET** packages and/or `/active` **200** (or **403** AuthZ non-C&B) · **không** Nest `/core` |
| **J-HRM-CORE-02-02** | Nhập lương+PC+NH+MST+`effective_from` → Tạo/Revise → F5 | **POST** packages **2xx** / revise **2xx** · history ≥2 · F5 còn · amounts vi-VN · dates dd/MM/yyyy |
| **J-HRM-CORE-02-03** | Sau C&B save → hồ sơ **công khai** CORE-01 → F5 | Public GET **không** lộ salary/NH/MST/SI · toast CB-403 nếu forced public PATCH |
| **J-HRM-CORE-02-04** | Tab BH → đổi mức / enrollment | Network `/employee-insurances*` + **actions** `change_rate` · **không** silent PATCH contrib SoT · Nest `/core` 0 · **≠** claim CORE-01=C&B DONE |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Prerequisite:** BE-01 bank/MST DTO + AuthZ + SI PATCH harden LIVE (parallel)  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · same-form salary PASS · honesty flip · reopen J-CORE-01 rewrite

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-02-BE-LIVE** | Browser U65 blocked until BE-01 bank/MST persist + AuthZ-403 + SI PATCH 400 LIVE | BE / QA |
| Honesty | flags false · C-SLICE · CORE-01 ≠ C&B DONE | QC |
| CORE-02b metadata / PAY invent | OUT | peer |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
personnel / CORE module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed
Nest /core compensation dual DENY · CORE-01 public ≠ C&B DONE · no FE invent payslip SoT
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-02-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-02
depends_on: FE-01 READY_FOR_QA · BE-01 READY (bank/MST + AuthZ + SI change_rate LIVE)
entry_criteria: L0 stack; browser-only U65; cấm seed; honesty false; C-SLICE; must_keep CORE-01 public strip
MISSION: U65 browser J-HRM-CORE-02-01..04 — packages create/revise/history/active Network path contains /contracts-insurance/compensation-packages; bank/MST on C&B only; SI via /employee-insurances* + actions change_rate; after save public CORE-01 F5 clean (AC-CORE-CB-02); toast AuthZ-403 / CB-403 / OVERLAP / VAL; amounts vi-VN · dates dd/MM/yyyy; DENY Nest /core SoT · same-form public+salary · FE invent payslip · claim CORE-01=C&B DONE · seed · honesty flip · reopen J-CORE-01.
exit: docs/qa/evidence/po-hrm-mvp-gd1-core-02-cluster-qa-01.md · PASS_TO_PM
```
