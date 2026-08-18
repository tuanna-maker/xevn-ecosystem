# Evidence — PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-02-CLUSTER-FE-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89) |
| **lane** | execution · **dev-fe** |
| **Date** | 2026-08-09 |
| **ack_status** | **READY_FOR_QA** |
| **uc_ids** | `UC-BP-REC-02` · `UC-BP-REC-02b` |
| **change_mode** | UPGRADE · preserve_default · code_memory APPEND |
| **Honesty** | `recruitment_uat_ready=false` · C-SLICE · U65 zero-seed |
| **depends_on** | API-01 CONFIRMED · BE-01 READY_FOR_QA (jest 108) |

---

## spec_read_ack

| Artifact | Path · sections |
|----------|-----------------|
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-02** · **FR-UC-BP-REC-02b** Diễn biến (cite BA-01 §3.4 / §4.4) |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-BA-01.md` O1–O5 · VAL-01..18 · AC-REC-YCTD-02* / 02b* · Diễn biến FE |
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md` F-REC-YCTD-01..04 · §6 DTO · §8 HRM-YCTD-* |
| **be evidence** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-be-01.md` — draft create · transitions · pipeline-flags LIVE |
| **code AS-IS** | `JobRequisitionsTab.tsx` · `hrmApi.ts` · `HeadcountProposalTab.tsx` · `candidateUvYctdUi.ts` |
| **sponsor_confirm** | API-01 CONFIRMED · BA-01 O1–O5 · SA Option A · BE-01 READY |
| **uc_ids** | UC-BP-REC-02 · UC-BP-REC-02b |
| **change_mode** | UPGRADE |

**spec says / code does (delta closed this seat):**

| Spec | Before | After |
|------|--------|-------|
| Create fork | title/JD/headcount only → immediate open path | **in_plan** + cell · **out_of_plan** + reason · hire_reason/replace · POST draft fields |
| O2 CELL-QTY | silent / generic toast | **409** VI + hint «chuyển Ngoài ĐB» — no silent pass |
| O4 legacy NULL mode | absent | Banner classify · block CV/flags · require mode on save |
| O3 receivable | open synonym loose | Status **`open_for_hire`** label · pipeline-flags only when receivable |
| Transitions | ABSENT FE | Detail: approve → open_for_hire · reject + reason |
| Pipeline flags | ABSENT FE | PATCH when receivable · REC-03 Campaign DENY |
| O5 proposals | dual create persist | CTA deprecate/redirect only · DENY createHeadcountProposal path |
| F5 | JD only | List/detail mode · hire · out reason · cell · flags · JD |

---

## Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/jobRequisitionYctdWave2.ts` | **ADD** pure helpers mode/hire/O4/receivable/pipeline/preset |
| `apps/web/hrm/src/lib/jobRequisitionYctdWave2.test.ts` | **ADD** vitest (13) |
| `apps/web/hrm/src/integrations/hrmApi.ts` | UPGRADE types + create/update payload · **ADD** `transitionJobRequisition` · `patchJobRequisitionPipelineFlags` |
| `apps/web/hrm/src/lib/apiError.ts` | **ADD** HRM-YCTD-* VI (incl. CELL-QTY ngoài ĐB hint) |
| `apps/web/hrm/src/lib/jobRequisitionUi.ts` | `open_for_hire` label + map active |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | terminal + submit block for `open_for_hire` |
| `apps/web/hrm/src/lib/candidateUvYctdUi.ts` | O4 filter unclassified from UV receivable picker |
| `apps/web/hrm/src/components/recruitment/JobRequisitionsTab.tsx` | Form forks · classify · transitions · flags · list/detail F5 |
| `apps/web/hrm/src/components/recruitment/HeadcountProposalTab.tsx` | O5 deprecate banner + redirect CTA |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Wire createPreset + proposals → out_of_plan YCTD |
| `apps/web/hrm/src/lib/recruitmentWorkflowUi.test.ts` | open_for_hire cases |

**must_keep RETAIN:** UF-HRM-12 · J-HRM-JD-YCTD-01 soft FK · REC-01 Định biên · REC-03 OUT · honesty false · C-SLICE

**DENY:** Campaign invent · Nest `/rec` dual · seed · warn-cho-qua without BOD · dual persist proposals

---

## Vitest evidence

```text
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/jobRequisitionYctdWave2.test.ts \
  src/lib/recruitmentWorkflowUi.test.ts \
  src/lib/jobRequisitionUi.test.ts \
  src/lib/candidateUvYctdUi.test.ts

Test Files  4 passed (4)
Tests:      72 passed (72)
```

Coverage: mode/hire VAL · O2 CELL-QTY VI · O4 classify · receivable gate · O5 source · transitions/flags paths · open_for_hire submit block · UV filter · JD/status regression.

---

## U65 browser plan (QA — zero-seed)

| J-* / UF | Persona | Click path | FE after 2xx + F5 |
|----------|---------|------------|-------------------|
| **J-HRM-REC-YCTD-02** | TP/HR `ceo@xe.vn` | Recruitment → Yêu cầu → Thêm → mode **Trong ĐB** + cell_id + hire_reason + JD Hiệu lực → **Lưu** → **Gửi duyệt QT** | status `draft`/`pending_approval`; **không** chip nhận hồ sơ; F5 còn mode+JD |
| **J-HRM-REC-YCTD-02b** | TP/HR | Thêm → **Ngoài ĐB** + out_reason + LONG hint → Lưu → Gửi | pending; CV/flags blocked; F5 còn reason |
| O2 | in_plan qty vượt ô | Submit | Toast **HRM-YCTD-CELL-QTY** VI gợi ý ngoài ĐB — form giữ |
| O4 | legacy NULL mode row | List/detail | Banner classify; block flags; Sửa bắt mode |
| Transitions | pending row | Chi tiết → Duyệt / Từ chối+lý do | `open_for_hire` or rejected + F5 |
| Pipeline | receivable | Chi tiết → Lưu cờ | flags 2xx; **không** Campaign |
| O5 | tab Đề xuất | CTA redirect | opens YCTD out_of_plan — **không** POST proposals |
| must_keep | UF-HRM-12 · J-HRM-JD-YCTD-01 | regression | soft FK JD · submit WF strip |

**cấm:** `pnpm seed:*` · API fake inbox · SQL flip open_for_hire

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R-REC-02-QA | Browser J-HRM-REC-YCTD-02/02b U65 + L1 spot | **qa** |
| R-REC-02-CELL-PICKER | in_plan cell_id still text/deep-link (spawn REC-01 primary) — CatalogSearchPicker from approved cells optional deepen | defer FE follow-up |
| Honesty | `recruitment_uat_ready` stays **false** | PM/QC |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-fe-01.md` |
| **completion_report** | FE YCTD Option A forks LIVE: in_plan/out_of_plan + hire/replace + O2/O4 toasts/banners + transitions + pipeline-flags + O5 proposals redirect; vitest 72 PASS; honesty false; no seed; physical `/recruitment/requisitions*` only. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-02-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-02 · UC-BP-REC-02b
depends_on: BE-01 READY · FE-01 READY_FOR_QA
entry_criteria: L0 stack; browser-only U65 zero-seed; evidence FE docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-fe-01.md · BE docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-be-01.md
MISSION — combined L1 + U65:
1) L1/API spot: draft create (not open) · CELL-QTY 409 · out_of_plan reason · submit→pending + matrix · transitions→open_for_hire · pipeline-flags gate · O4 MODE-UNCLASSIFIED · scope_parity
2) U65 browser J-HRM-REC-YCTD-02 (in_plan cell+JD+hire → Lưu → Gửi → F5) · J-HRM-REC-YCTD-02b (out_of_plan+LONG hint → block CV → BOD approve path when available)
3) O4 classify banner · O5 proposals CTA redirect only (no dual persist)
4) must_keep UF-HRM-12 · J-HRM-JD-YCTD-01 soft FK · REC-01 Định biên sealed
cấm: seed · API fake inbox · honesty flip · Nest /rec dual
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-02-cluster-qa-01.md
```
