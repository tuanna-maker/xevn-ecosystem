# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | 2026-08-08 |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01` **CONFIRMED** |
| **parallel** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01` |
| **ref_ba** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md) §6.3 / §6.5 |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md) Option **B** |
| **change_mode** | **ADD** |
| **ack_status** | `READY_FOR_QA` |
| **U65** | zero-seed · browser AC for QA |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`C-SLICE-≠-MODULE`** · DENY module REC UAT |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| BA-01 | §6.3 **VAL-REC-CNS-04** / **VAL-REC-CNS-05** · §6.5 UF-REC-STAGE-CNS-03 / CNS-05 · §4 S-REC-CNS-03/05 · MK-REC-EFF-01 / MK-REC-IV-01 / MK-REC-QC-02 |
| SA-01 | Option **B** LOCKED · L-REC-STAGE-02/04 · F-REC-CAT-EFF-01 · IV soft ≠ one-active reopen |
| Peer FE | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01` Settings + CandidatesTab/Form EFF bind **RETAIN** |
| SRS | FR-UC-BP-REC-05 / 05a / 06a / 07 |

---

## 2. Deliverable (apps)

| Path | Role |
|------|------|
| `apps/web/hrm/src/lib/recPipelineStageCatalog.ts` | **ADD** `buildRecPipelineKanbanColumns` · `isRecPipelineStageInterviewScheduleAllowed` · empty/IV VI copy |
| `apps/web/hrm/src/lib/recPipelineStageCatalog.test.ts` | **+5** CNS cases (10 total) |
| `apps/web/hrm/src/pages/Recruitment.tsx` | Kanban columns bind EFF when >0; soft-empty + CTA Settings when EFF=0 |
| `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx` | Soft-gate banner + disable submit when `allowsInterviewSchedule=false` |
| `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | Pass `candidateStage` into Schedule dialog (**RETAIN** EFF picker) |
| `apps/web/hrm/src/hooks/useRecPipelineStagesEffective.ts` | Callers note kanban + IV |
| `apps/web/hrm/src/lib/apiError.ts` | Map **`HRM-REC-IV-STAGE-DENY`** (≠ UNKNOWN · ≠ one-active) |
| `ScheduleInterviewDialog.source.test.ts` | Soft-gate retain Lane A assert |

**RETAIN (no wipe):** `RecPipelineStageSettingsPanel` CREATE N+1 · CandidatesTab/Form/JobDialog EFF picker · hire `hiredOutcomeKey` · IV one-active Lane A · JD DnD.

**Cấm / not done:** seed · invent `recruitment_uat_ready=true` · reopen IV one-active / REC UX QC / JD · claim module REC UAT.

---

## 3. Surface matrix (FE)

| Surf / VAL | Before | After |
|------------|--------|-------|
| **VAL-REC-CNS-04** S-REC-CNS-03 Kanban | Hardcode six `{applied…rejected}` | **EFF columns** when `catalogCount>0` (incl. N+1); EFF=0 → `rec-kanban-stages-empty` + CTA `/settings` |
| **VAL-REC-CNS-05** S-REC-CNS-05 IV | Schedule always open | Soft-gate: banner `schedule-interview-stage-deny-banner` + submit disabled; one-active **unchanged** |
| **MK-REC-EFF-01** CNS-01/02 | EFF picker | **RETAIN** |
| **MK-REC-QC-02** ADM | Settings open N+1 | **RETAIN** |

---

## 4. Vitest

```text
cd apps/web/hrm
pnpm exec vitest run src/lib/recPipelineStageCatalog.test.ts src/components/recruitment/ScheduleInterviewDialog.source.test.ts src/lib/recruitmentHireLink.test.ts --reporter=dot
→ Test Files: 3 passed · Tests: 24 passed
```

| Suite | Result |
|-------|--------|
| `recPipelineStageCatalog.test.ts` | **10 PASS** (5 prior + 5 CNS-04/05) |
| `ScheduleInterviewDialog.source.test.ts` | **7 PASS** (incl. soft-gate retain Lane A) |
| `recruitmentHireLink.test.ts` | **7 PASS** (hire RETAIN regression) |

---

## 5. QA browser click paths (U65 · zero-seed)

| UF | Path | Expect |
|----|------|--------|
| **UF-REC-STAGE-CNS-03** | EFF≥1 (from Settings admin — **no seed**) → Tuyển dụng → Dashboard **board** → Network GET `…/pipeline-stages/effective` → columns = EFF keys (N+1 visible) → drag/move ∈ EFF → PATCH 2xx | Soft-empty when EFF=0 + CTA |
| **UF-REC-STAGE-CNS-05** | Settings tắt `allows_interview_schedule` trên stage hiện tại UV → F5 → Ứng viên → Lên lịch → banner deny + submit disabled; bật lại → schedule OK; one-active 409 still maps | Soft-gate only |
| Spot RETAIN | Settings CREATE N+1 · UV stage Select EFF · hire hired-outcome | Unchanged |

**HDSD / testids:** `rec-kanban-board` · `rec-kanban-stages-empty` · `rec-kanban-stages-empty-cta` · `schedule-interview-stage-deny-banner` · `schedule-interview-submit` · `settings-tab-rec-pipeline-stages` · `hdsd-rec-candidate-stage-picker`.

**Persona:** `ceo@xe.vn` / `Xevn@2026`.

---

## 6. Honesty / seals

| Flag / seal | Value |
|-------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| REC UX QC process / JD DnD / IV one-active | **SEAL RETAIN** |
| REC-QC-01 / REC-QC-02 | **SEAL RETAIN** |
| EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS | **SEAL RETAIN** |
| `C-SLICE-≠-MODULE` | Stage catalog CNS ≠ module REC UAT |
| Seed in evidence | **none** |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **completion_report** | Closed VAL-REC-CNS-04 kanban EFF bind + empty CTA; VAL-REC-CNS-05 IV soft-gate; RETAIN picker/admin/hire/one-active; vitest 24 PASS. Residual: browser U65 UF-REC-STAGE-CNS-03/05; parallel CNS-BE for VAL-REC-CNS-02 pool create assert. |
| **next_dispatch_prompt** | See §8 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md` |

---

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01
from_role: pm
to_role: qa
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01 READY_FOR_QA
ref_fe: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md
ref_ba: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md §6.3/§6.5

## task
U65 browser-only zero-seed (cấm seed):
1) UF-REC-STAGE-CNS-03 / VAL-REC-CNS-04 / AC-PLT-REC-STAGE-05k — EFF≥1 from Settings admin CREATE (not seed): board columns = Nest GET …/pipeline-stages/effective (N+1 visible); EFF=0 soft-empty + CTA Settings; move ∈ EFF → PATCH 2xx + F5
2) UF-REC-STAGE-CNS-05 / VAL-REC-CNS-05 / AC-PLT-REC-STAGE-06a — toggle allows_interview_schedule=false → Schedule banner deny + submit disabled; true → schedule OK; IV one-active 409 RETAIN (cấm reopen)
3) Spot RETAIN: Settings CREATE N+1 (AC-PLT-REC-STAGE-01d) · CandidatesTab EFF picker (01) · hire hiredOutcomeKey (07)
4) Honesty: recruitment_uat_ready=false · jd_dynamic_done=false · C-SLICE-≠-MODULE · DENY module REC UAT · seals UX/JD/IV/REC-QC RETAIN
Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01.md
exit: PASS_TO_PM | FAIL_TO_PM + residual
```
