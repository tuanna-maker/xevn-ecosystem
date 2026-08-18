# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01

| Meta | Value |
|------|-------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QC-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **ack_status** | **READY_FOR_QA** |
| **date** | 2026-08-07 |
| **resume_chunk** | K6.2e |
| **change_mode** | **ADD** Settings panel + API client · **FIX** UV/application stage picker → effective · hire hiredOutcomeKey |
| **honesty** | `recruitment_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · U65 |
| **must_keep** | JD DnD · IV one-active · YCTD · F-REC-HIRE-01 soft-link · soft-delete · no FE hardcode six starter SoT |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QC GWC | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md` — L1 SEAL · browser AC HOLD |
| SA vertical | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md` §5 **AC-PLT-REC-02..05** · §3 F-REC-CAT-STG/EFF |
| BE | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-be-01.md` — routes pipeline-stages* live |
| Pattern neo | `AttLeaveTypeSettingsPanel` · `docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md` |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/recPipelineStageCatalog.ts` | Format-only key · picker map · historical label resolve |
| `apps/web/hrm/src/lib/recPipelineStageCatalog.test.ts` | Open-catalog format tests (**5 PASS**) |
| `apps/web/hrm/src/hooks/useRecPipelineStagesEffective.ts` | RQ GET `/recruitment/pipeline-stages/effective` + `hiredOutcomeKey` |
| `apps/web/hrm/src/components/settings/RecPipelineStageSettingsPanel.tsx` | CRUD + retire Settings/REC CFG |
| `apps/web/hrm/src/pages/Settings.tsx` | Tab **Giai đoạn REC** (`settings-tab-rec-pipeline-stages`) |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | Pool stage Select binds **effective**; hire uses `hiredOutcomeKey` |
| `apps/web/hrm/src/components/recruitment/JobCandidatesDialog.tsx` | Application stage Select binds **effective** |
| `apps/web/hrm/src/components/recruitment/CandidateFormDialog.tsx` | Form stage options + hire gate via `hiredOutcomeKey` |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Kanban hire confirm → `resolveHireTargetStage` |
| `apps/web/hrm/src/lib/recruitmentHireLink.ts` | EXPAND `isHiredStage` / `needsHireEmployeePicker` / `resolveHireTargetStage` |
| `apps/web/hrm/src/lib/recruitmentHireLink.test.ts` | Hire + UNKNOWN toast map (**7 PASS**) |
| `apps/web/hrm/src/integrations/hrmApi.ts` | F-REC-CAT-STG/EFF client |
| `apps/web/hrm/src/lib/apiError.ts` | `HRM-REC-STAGE-UNKNOWN` · HIRED-DUP/REQUIRED · STG-404 |
| `apps/web/hrm/src/lib/hdsdMutateTestIds.ts` | HDSD ids for pipeline-stage Settings |

**Cấm / not done:** seed · flip `recruitment_uat_ready` · wipe JD/IV/hire · claim module REC UAT · closed six enum on FE.

---

## 3. Routes / click path (QA — AC-PLT-REC-02..05)

| Step | Action |
|------|--------|
| 0 | Account: `ceo@xe.vn` / `Xevn@2026` · OU scope `holding` / portal `main` |
| 1 | **Settings** → tab **Giai đoạn REC** (`settings-tab-rec-pipeline-stages`) |
| 2 | Card `settings-rec-pipeline-stages` — nhập `stageKey` (vd. `hr_custom_stage_07_*`) · **Nhãn tiếng Việt** · optional hired-outcome |
| 3 | Bấm **Tạo giai đoạn** (`hdsd-rec-pipeline-stage-save`) → Network **PUT/POST** `/api/hrm/recruitment/pipeline-stages` **2xx** |
| 4 | **Tải lại (F5 list)** / F5 trang → row trong `settings-rec-pipeline-stages-table` |
| 5 | **Tuyển dụng** → Ứng viên → picker đổi trạng thái (`hdsd-rec-candidate-stage-picker`) chọn được mã mới (GET `/pipeline-stages/effective`) |
| 6 | **Ngừng** giai đoạn → active list/picker ẩn; UV cũ vẫn hiện key / `nameVi` fallback (**AC-PLT-REC-03**) |
| 7 | Transition `to_stage` ∉ catalog (khi catalog>0) → toast **4xx** `HRM-REC-STAGE-UNKNOWN` (**AC-PLT-REC-04**) |
| 8 | Chọn hired-outcome key → HireEmployeeLinkDialog → PATCH còn soft-link EMP (**AC-PLT-REC-05**) — must_keep F-REC-HIRE-01 |
| 9 | must_keep smoke: JD library / IV schedule / YCTD create surface vẫn load |

**HDSD inventory (U76):**

- `settings-tab-rec-pipeline-stages`
- `settings-rec-pipeline-stages` · `settings-rec-pipeline-stages-table`
- `hdsd-rec-pipeline-stage-key` · `hdsd-rec-pipeline-stage-name` · `hdsd-rec-pipeline-stage-sort`
- `hdsd-rec-pipeline-stage-save` · `hdsd-rec-pipeline-stage-reload` · `hdsd-rec-pipeline-stage-retire-{key}`
- `hdsd-rec-pipeline-stage-hired-outcome` · `hdsd-rec-pipeline-stage-terminal`
- `hdsd-rec-candidate-stage-picker` · `hdsd-rec-application-stage-picker`

---

## 4. Verification (dev)

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/recPipelineStageCatalog.test.ts src/lib/recruitmentHireLink.test.ts --reporter=dot
→ Test Files: 2 passed · Tests: 12 passed
```

| Suite | Result |
|-------|--------|
| `recPipelineStageCatalog.test.ts` | **5 PASS** (open #7+ · reject Interview · picker map · history key) |
| `recruitmentHireLink.test.ts` | **7 PASS** (hiredOutcomeKey · resolveHireTargetStage · UNKNOWN toast) |

---

## 5. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `payroll_e2e_ready` | **false** |
| U65 seed in evidence | **none** |
| Module / Phase1 UAT flip | **none** |
| Browser UF | **HOLD for QA** (this seat = wire only) |

---

## 6. completion_report

**Closed:** Wire REC pipeline-stage Settings panel (F-REC-CAT-STG upsert/list/retire) under Settings tab **Giai đoạn REC**; CandidatesTab / JobCandidatesDialog / CandidateFormDialog stage pickers bind F-REC-CAT-EFF when catalog>0 (soft-allow starters when empty); format-only validation (Interview fail client-side); soft-retire hides active list; historical display falls back to key; hire path uses `hiredOutcomeKey` without breaking F-REC-HIRE-01; UNKNOWN/HIRED-DUP toast map; vitest **12 PASS**; must_keep JD/IV/YCTD untouched; honesty false.

**Residual:** Browser AC-PLT-REC-02..05 U65 (create→F5→picker · retire hide · UNKNOWN toast · hire→EMP soft-link).

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-fe-01.md` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-QA-02
from_role: pm
to_role: qa
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
priority: P2
resume_chunk: K6.2e

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-fe-01.md (§3 click path)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-VERTICAL-SA-01.md §5 AC-PLT-REC-02..05
3. docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qc-01.md (L1 SEAL baseline)

## task
Browser U65 (zero-seed · FE-only · cấm seed · cấm flip recruitment_uat_ready):
- Login ceo@xe.vn → Settings → Giai đoạn REC
- Tạo giai đoạn mã HR (vd. hr_custom_stage_07_*) → Network 2xx → Tải lại/F5 → row còn
- Tuyển dụng → Ứng viên → picker đổi trạng thái chọn được mã mới
- Retire → picker ẩn; UV/history vẫn hiện key cũ
- (khi catalog>0) transition ngoài catalog → toast 4xx HRM-REC-STAGE-UNKNOWN
- Chọn hired-outcome → Hire link dialog → EMP soft-link còn (F-REC-HIRE-01)
- must_keep: JD / IV / YCTD load; no seed
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-qa-02.md
- Honesty: recruitment_uat_ready=false · payroll_e2e_ready=false

## exit
PASS_TO_PM · AC matrix browser · no module UAT invent
```
