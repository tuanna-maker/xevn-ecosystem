# Evidence — PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-19 seat #21 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-CORE-05` |
| **depends_on** | API-01 **CONFIRMED** · BA O1–O12 · DATA-01 · SA Option A · BE-01 parallel |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · personnel/CORE/CTR module UAT **false** · **C-SLICE** |
| **U65** | zero-seed — browser FE only · empty assets OK |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md` | O1–O12 · AC-CORE-05-* · J-HRM-CORE-05-01..05 DRAFT |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md` | F-CORE-AST-01 RETAIN · F-CORE-AST-BB-01 ADD · serial 409 · paper `/core` alias only |
| **DATA-01** | soft cols `handover_confirmed_*` · spine HOLD (cite — no FE invent) |
| **Peers must_keep** | CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · Nest `/core` DENY · CORE-06/07 OUT invent DONE · OBS P2 idle-ok |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-05 Luồng #1–#4 · Diễn biến #1–#2 · BR-BP-AST-01
- tech_spec / api: PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md F-CORE-AST-01 §4 · F-CORE-AST-BB-01 §5 · serial §6
- ba: PO-HRM-MVP-GD1-CORE-05-CLUSTER-BA-01.md O1–O12 · AC-CORE-05-*
- db_design: DATA-01 soft confirm cols (cite — no FE invent Asset SoT)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O12 · SA Option A
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Profile Tài sản bind display-ready (`statusLabelVi` · `handoverConfirmed*` · spine) | **ADD** |
| CTA **Xác nhận nhận** → PATCH `handoverConfirmed: true` (≠ notes) | **ADD** |
| VI «Đang sử dụng» gate CFG **default ON** · pending-confirm filter | **ADD** |
| Serial **409** toast `HRM-EMP-ASSET-SERIAL-CONFLICT` | **ADD** |
| Soft status UX — Thu hồi (đổi trạng thái) prefer over hard DELETE issued | **ADD** |
| Network **MUST** `/employees/:id/assets*` · Nest `/core` = **0** (source lock) | **PASS** |
| DENY notes-only = BB · invent Asset SoT / e-sign · claim CRUD = CORE-05 DONE | **PASS** |
| must_keep CORE-03/02b/09d..01 · honesty false · C-SLICE · U65 | **PASS** |
| vitest | **4 files · 21 PASS** |

### Files touched

- `apps/web/hrm/src/lib/empCoreAstRing.ts` (+ test)
- `apps/web/hrm/src/lib/apiError.ts` + `apiError.core-05.test.ts`
- `apps/web/hrm/src/integrations/hrmApi.ts` — CODE-MEMORY APPEND assets*
- `apps/web/hrm/src/hooks/useEmployeeAssets.ts` (+ mapAsset test)
- `apps/web/hrm/src/components/employee/EmployeeAssets.tsx`
- `apps/web/hrm/src/i18n/locales/{vi,en}.json`
- `apps/web/hrm/src/lib/poHrmMvpGd1Core05ClusterFe01.source.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/empCoreAstRing.test.ts \
  src/lib/apiError.core-05.test.ts \
  src/lib/poHrmMvpGd1Core05ClusterFe01.source.test.ts \
  src/hooks/useEmployeeAssets.mapAsset.test.ts
# → 4 files · 21 tests PASS · exit 0
```
---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-CORE-05-01** | Hồ sơ NV → tab **Tài sản** → Thêm cấp phát → Lưu → F5 | Network **POST** `/api/hrm/employees/:id/assets` **2xx** · row trên list · Nest `/core` **0** |
| **J-HRM-CORE-05-02** | Sau tạo (chưa BB) → **Xác nhận nhận** → F5 | Network **PATCH** `…/assets/:assetId` confirm flags **2xx** · badge BB · Nest `/core` **0** |
| **J-HRM-CORE-05-03** | POST/PATCH serial đã `assigned` trong scope | Toast **`HRM-EMP-ASSET-SERIAL-CONFLICT`** · F5 không giữ trùng |
| **J-HRM-CORE-05-04** | Menu **Thu hồi (đổi trạng thái)** trên dòng issued | PATCH `status=returned` · **không** silent hard DELETE |
| **J-HRM-CORE-05-05** | Network + seals spot | Nest `/core` assets **0** · no claim CORE-03=personnel · no CORE-06/07/printable/closed-8 DONE · honesty false |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed  
**Prerequisite:** BE-01 confirm cols + serial 409 + display-ready LIVE (parallel)  
**Cấm:** `pnpm seed:*` · Nest `/core` SoT · notes-only = BB PASS · honesty flip · reopen sealed J-HRM-CORE-03/02B/09D..01

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-CORE-05-BE-LIVE** | Browser U65 BB/serial blocked until BE-01 confirm cols + serial wire LIVE | BE / QA |
| Honesty | flags false · C-SLICE · CRUD ≠ CORE-05 DONE · CORE-06 OUT | QC |
| F-CORE-AST-02 / CORE-06 | OUT invent DONE · board #22 QUEUED | peer |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
contracts_printable_ready=false
hrm_personnel_uat_ready=false
personnel / CORE / CTR module UAT = false
C-SLICE ≠ module CORE UAT
U65 zero-seed · empty assets OK
Nest /core AST dual DENY · FE invent Asset SoT DENY · notes≠BB · CORE-06/07 / printable DONE DENY
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | FE-01 closed: Profile Tài sản bind display-ready + CTA Xác nhận nhận (BB) · VI «Đang sử dụng» gate CFG default on · serial 409 toast · soft thu hồi · Network `/employees/:id/assets*` only · Nest `/core` 0 · DENY notes=BB · Asset SoT/e-sign invent · claim CRUD=CORE-05 DONE · must_keep peers · U65 · honesty false · C-SLICE. |
| **next_owner** | **qa** (after BE-01 READY) |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-fe-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-CORE-05-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-05
depends_on: FE-01 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-05-cluster-fe-01.md · BE-01 READY (confirm cols + serial 409 LIVE)
entry_criteria: L0 stack · browser-only U65 · zero-seed · persona ceo@xe.vn
exit_criteria: J-HRM-CORE-05-01..05 evidence blocks · Network /employees/:id/assets* · Nest /core = 0 · serial 409 toast · BB CTA ≠ notes · soft return · must_keep CORE-03/02b/09d..01 · honesty false · C-SLICE · PASS_TO_PM
cấm: pnpm seed:* · Nest /core SoT · claim CRUD=CORE-05 DONE · invent CORE-06/07 · personnel/printable flip · reopen sealed J-*
```
