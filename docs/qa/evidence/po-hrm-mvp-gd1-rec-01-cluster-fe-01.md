# Evidence — PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · dev-fe |
| **Date** | 2026-08-09 |
| **change_mode** | ADD / UPGRADE · preserve_default · code_memory APPEND |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **depends_on** | SA Option A · BA O1–O5 · DATA-01 · API-01 CONFIRMED · BE-01 READY_FOR_QA |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · C-SLICE · U65 zero-seed · no claim module REC UAT |

---

## spec_read_ack (BEFORE code)

| Artifact | Path · sections | Stamp |
|----------|-----------------|-------|
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01.md` **O1–O5** · AC-REC-HC-* · ALT-03 dual ABSENT · Diễn biến FE 2xx+F5 · VAL-REC-HC-15/16 | **READ · CONFIRMED** |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md` F-REC-HC-01 PUT/GET · F-REC-HC-05 spawn · DTO `need_hire` · `allow_override` · HRM-HC-* | **READ · CONFIRMED** |
| **be** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-01.md` — PUT/spawn LIVE · jest 50/50 · residual R-FE-01 | **READ** |
| **srs** | `SRS_HRM_ENTERPRISE.md` FR-UC-BP-REC-01 · 01b (via BA cite) | **READ** |
| **code AS-IS** | `apps/web/hrm/src/pages/Recruitment.tsx` · `useRecruitmentPlans` · prior interrupt partial landing | **READ** |

**sponsor_confirm:** SA Option A + BA O1–O5 + DATA-01 + API-01 + BE-01 on disk (2026-08-09).

---

## What closed

| Mission item | Implementation |
|--------------|----------------|
| Single «Cần tuyển» column (O1 · ALT-03) | Removed ns/dx dual editors; one `need_hire` input; HT = `headcount_current` **read-only** subtitle |
| Label Định biên synonym | Tab `plansDinhBien` · `headcountTableTitleNeedHire` · `dinhBienContent` |
| PUT upsert + POST spawn | `upsertRecruitmentPlan` + `spawnRecruitmentPlanRequests`; toast created / skipped_duplicate / drift |
| Qty drift O3 | `detectQtyDrift*` → AlertDialog confirm → PUT with `allow_override: true` (no silent YCTD overwrite) |
| Vượt HC O4 | `countOverHeadcountCells` → warn toast on approve; **still allows** approve |
| Catalog keys · DENY free-text EFF>0 | `CatalogSearchPicker` + `assertPlanCatalogKeys` → `HRM_HC_KEY_UNKNOWN_TOAST_VI` |
| FE-after-2xx + F5 | create/upsert/submit/spawn → refetch list; toast copy cites F5 persist |
| must_keep | XBOS submit-workflow · UF-HRM-12 · JD · REC-03 OUT · honesty false |

---

## Files changed

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/recruitmentPlanHeadcount.ts` | NEW/UPGRADE — O1 parse/serialize · spawn feedback · O3/O4 helpers |
| `apps/web/hrm/src/lib/recruitmentPlanHeadcount.test.ts` | vitest O1 + O3 + O4 |
| `apps/web/hrm/src/hooks/useRecruitmentPlans.ts` | PUT upsert · spawn · allow_override · overHcWarned |
| `apps/web/hrm/src/hooks/useRecruitmentPlans.test.ts` | portal skip smoke (RETAIN) |
| `apps/web/hrm/src/integrations/hrmApi.ts` | get/upsert/spawn physical paths (prior + RETAIN) |
| `apps/web/hrm/src/pages/Recruitment.tsx` | grid UI · pickers · drift dialog · O4 approve warn · CODE-MEMORY APPEND |
| `apps/web/hrm/src/pages/Recruitment.plan-headcount.test.ts` | source-scan dual ABSENT + wire |
| `apps/web/hrm/src/i18n/locales/vi.json` / `en.json` | Định biên / Cần tuyển labels (prior) |

---

## Vitest

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/recruitmentPlanHeadcount.test.ts src/pages/Recruitment.plan-headcount.test.ts src/hooks/useRecruitmentPlans.test.ts --reporter=verbose

Test Files  3 passed (3)
Tests       10 passed (10)
```

Covered: legacy ns/dx→need_hire · serialize no dual · spawn feedback · qty_drift detect · over HC count · page source dual ABSENT + PUT/spawn/O3/O4 wiring.

---

## U65 browser plan (QA — J-HRM-REC-HC-01 / 01b)

**Entry:** portal / HR embed → Tuyển dụng → tab **Định biên** (`?tab=plans`)  
**Persona:** TP / approver / HCNS per BA · `ceo@xe.vn` / member as scope needs  
**Cấm:** seed · API fake inbox · claim `recruitment_uat_ready`

### J-HRM-REC-HC-01

1. Open Định biên → lưới 12 tháng; **một** cột Cần tuyển (FAIL if ns+dx editors).
2. Catalog picker phòng/vị trí (EFF>0) → set CT SL ≥1 → **Lưu** → Network PUT/POST **2xx** → FE ô đúng → **F5** còn.
3. **Gửi duyệt QT** → chờ duyệt; F5 còn.
4. Approver duyệt (FE PATCH hoặc XBOS chuỗi FE) — nếu CT > HT: toast vượt (O4) vẫn duyệt **2xx**; ô CT khóa.
5. HCNS / main rollup list thấy plan approved.

### J-HRM-REC-HC-01b

1. After approved → **Sinh YCTD từ Cần tuyển** → toast created ≥1; list YCTD có row; F5 còn.
2. Spawn lại → skipped_duplicate; count **không** +1 (BR-BP-HC-04).
3. (Nếu editable override path) đổi SL ô đã spawn → AlertDialog qty_drift → confirm → PUT allow_override; YCTD không silent overwrite.
4. Cross-nav YCTD detail (J-HRM-05 must_keep) — no 404 scope.

### L1 combined (with BE)

- GET list/get-by-id scope parity U19  
- PUT need_hire · PATCH approve lock  
- POST spawn create then re-POST skipped_duplicate  
- HRM-HC-SPAWN-PLAN-NOT-APPROVED on non-approved  

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| R-QA-U65 | Browser J-HRM-REC-HC-01/01b + L1 API | **qa** |
| Honesty | `recruitment_uat_ready` remains **false** | qc |
| REC-02b / BOD vượt YCTD | OUT this cluster (cite only) | — |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-fe-01.md` |
| **completion_report** | FE-01 closed: single Cần tuyển · Định biên labels · PUT/spawn wire · O3 qty_drift confirm + allow_override · O4 vượt warn-allow · catalog DENY free-text · vitest 10 PASS. Honesty false. |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-01-CLUSTER-QA-01
lane: execution · qa
depends_on: BE-01 READY_FOR_QA · FE-01 READY_FOR_QA
entry_criteria: L0 stack; U65 zero-seed; browser-only for UF; cấm seed
MISSION (combined L1 + U65):
1) L1 API — GET list/get-by-id same scope (U19); PUT upsert need_hire; PATCH approve lock; POST spawn-requests create then re-POST skipped_duplicate (BR-BP-HC-04); HRM-HC-SPAWN-PLAN-NOT-APPROVED on non-approved; no rec_headcount_* invent.
2) U65 browser J-HRM-REC-HC-01 — Định biên tab: single Cần tuyển column ABSENT ns/dx; catalog pickers; Lưu→2xx→F5; Gửi duyệt; approve (O4 vượt warn still allow); cell lock.
3) U65 browser J-HRM-REC-HC-01b — Sinh YCTD → created; re-spawn skipped_duplicate; optional qty_drift confirm path; YCTD detail J-HRM-05 must_keep.
READ: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-fe-01.md · be-01.md · BA-01 AC · API-01
exit: PASS_TO_PM or FAIL · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-qa-01.md
cấm: seed · flip recruitment_uat_ready · claim module REC UAT from slice
```
