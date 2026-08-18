# BM-EXP-CAND-START-QT-01 — HRM FE «Bắt đầu QT» / candidate spawn WF (J-REC-WF-04 residual)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-EXP-CAND-START-QT-01` |
| **from_role** | explore |
| **to_role** | pm |
| **lane** | execution |
| **priority** | P1 |
| **thoroughness** | quick |
| **executed_at** | 2026-07-22 ~11:01 ICT |
| **scope** | NARROW inventory ONLY — does HRM FE have «Bắt đầu QT» / spawn WF on candidate (applied stage)? |
| **cấm** | edit `apps/**` (read-only) |
| **spec_ref** | **J-REC-WF-04** residual R-01 (step-sync precondition) · UC-HRM-REC-WF-04 · prior `docs/qa/evidence/bm-qa-j-rec-wf-04-roadmap-01-20260722.md` |
| **J-*** | **J-REC-WF-04** |

---

## Executive summary

**EXISTS** — HRM FE already surfaces **«Bắt đầu QT»** on the candidates-pool **list** row when `workflow_instance_id` is null (covers **applied** / F6 `new` rows with no instance). Click → `startCandidatePipeline` → `POST …/candidates-pool/{id}/start-pipeline`. SPAWN-MISSING banner + toast wired. **No** `BM-FE-REC-CAND-START-QT-01` dispatch needed for missing UI.

Residual for J-REC-WF-04 step-sync remains **runtime / catalog / inbox** (SPAWN-MISSING or no pipeline instance), not missing FE start button.

---

## Inventory matrix

| Surface | Path | Symbol / UI | Verdict |
|---------|------|-------------|---------|
| List CTA «Bắt đầu QT» | `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` | Button label `Bắt đầu QT` (~L631); `handleStartPipeline` (~L292); gate `!candidate.workflow_instance_id` (~L622) | **EXISTS** |
| API client spawn | `apps/web/hrm/src/integrations/hrmApi.ts` | `startCandidatePipeline` → `POST /api/hrm/recruitment/candidates-pool/{id}/start-pipeline` (~L1021–1028) | **EXISTS** |
| SPAWN-MISSING UX | `apps/web/hrm/src/components/recruitment/RecruitmentWfSpawnBanner.tsx` | Banner on spawn miss | **EXISTS** |
| Spawn helpers | `apps/web/hrm/src/lib/recruitmentWorkflowUi.ts` | `detectRecruitmentSpawnMissing` / `HRM_REC_WF_SPAWN_MISSING_CODE` | **EXISTS** |
| Detail view CTA | `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` | No «Bắt đầu QT» / `startCandidatePipeline` | **MISSING** (list-only; not required if list CTA is AC path) |
| Kanban / other tabs | `apps/web/hrm/src/components/recruitment/*` (grep) | Only `CandidatesTab.tsx` binds start | **N/A** — primary list path EXISTS |

### Applied-stage note

- Button is **not** hard-filtered to `stage === 'applied'` only; it shows whenever `workflow_instance_id` is falsy.
- Applied candidates with `wf=null` (QA baseline 4×`applied`) **do** get the CTA — sufficient for J-REC-WF-04 mutate precondition «FE applied UV → Bắt đầu QT».

---

## Code anchors (read-only)

```622:636:apps/web/hrm/src/components/recruitment/CandidatesTab.tsx
                            {!candidate.workflow_instance_id ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={pipelineSubmittingId === candidate.id}
                                    onClick={() => void handleStartPipeline(candidate)}
                                  >
                                    Bắt đầu QT
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Bắt đầu quy trình tuyển dụng cho ứng viên</TooltipContent>
                              </Tooltip>
                            ) : null}
```

```1021:1028:apps/web/hrm/src/integrations/hrmApi.ts
/** UC-HRM-REC-WF-04 — start candidate pipeline (U65 FE path). */
export async function startCandidatePipeline(candidateId: string, companyId: string) {
  const search = new URLSearchParams();
  search.set("company_id", normalizeHrmApiListCompanyId(companyId));
  return requestHrm<HrmCandidatePipelineStartResult>(
    `/api/hrm/recruitment/candidates-pool/${encodeURIComponent(candidateId)}/start-pipeline?${search.toString()}`,
    { method: "POST", body: JSON.stringify({}) },
  );
}
```

---

## Verdict vs residual

| Question | Answer |
|----------|--------|
| FE missing «Bắt đầu QT»? | **No — EXISTS** |
| Dispatch `BM-FE-REC-CAND-START-QT-01`? | **Not required** (copy-ready omitted) |
| Next for J-REC-WF-04 step-sync | QA U65: list → **Bắt đầu QT** on applied → observe Network `start-pipeline` 2xx / SPAWN-MISSING → if instance + inbox task → step → recheck roadmap chips (`BM-QA-J-REC-WF-04-STEP-SYNC-01`) |

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **completion_report:** Narrow inventory closed — FE candidate start-QT **EXISTS** on `CandidatesTab`; API client + SPAWN-MISSING support present. Detail view lacks duplicate CTA (non-blocking for list AC).
- **next_owner:** `qa` (or `pm` → QA step-sync) — **not** `dev-fe` for start-QT UI
- **next_dispatch_prompt:** (copy-ready)

```text
work_item_id: BM-QA-J-REC-WF-04-STEP-SYNC-01
from_role: pm
to_role: qa
entry_criteria: docs/qa/evidence/bm-exp-cand-start-qt-01-20260722.md EXISTS; U65 zero-seed; L0 :8088
exit_criteria: FE applied candidate → Bắt đầu QT → Network POST start-pipeline 2xx (or documented SPAWN-MISSING); if instance+inbox → complete mapped rec_* step → detail roadmap chip advances per F6; evidence bm-qa-j-rec-wf-04-step-sync-01-YYYYMMDD.md
cấm: seed inbox / pipeline; edit apps/**
must_keep: J-HRM-05 · UF-HRM-12 · F6 funnel
```

- **evidence_path:** `docs/qa/evidence/bm-exp-cand-start-qt-01-20260722.md`
