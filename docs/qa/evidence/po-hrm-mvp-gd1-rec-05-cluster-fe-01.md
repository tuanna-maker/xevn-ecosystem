# Evidence — PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-05-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-7 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-05` |
| **depends_on** | API-01 **CONFIRMED** · BA-01 O1–O9 · BE-01 parallel |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD/UPGRADE · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · DENY module REC UAT claim |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md` | Diễn biến FE §3.4 #0b–#2 · AC-REC-05-01..05 · O1 path `/recruitment/` · O3 Lane A · O5 reject note · O4 EFF empty CTA |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md` | F-REC-APP-02 POST `…/candidates/:id/transitions` · F-REC-APP-02-TL GET `…/stage-history` · EFF RETAIN · mint REJECT/REVERSE/EMPTY |
| **AS-IS UI** | CandidatesTab pool `updateCandidatePoolStage` · spine display-only · no timeline |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-05 Diễn biến #0b–#2 · BR-BP-CV-02
- tech_spec / api: PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md F-REC-APP-02 / F-REC-APP-02-TL
- ba: PO-HRM-MVP-GD1-REC-05-CLUSTER-BA-01.md §3.1–3.4 · VAL-REC-STG-*
- db_design: cite DATA-01 rec_candidate_stage_history (no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O9
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| EFF picker on YCTD-bound UV | **ADD** — dialog binds `GET …/pipeline-stages/effective` |
| POST transitions | **ADD** `postRecruitmentCandidateTransition` → `/api/hrm/recruitment/candidates/:id/transitions` |
| Reject reason | **ADD** required note when `isRejectOutcome` / fallback reject keys |
| Reverse hint | **ADD** `is_reverse` when lower EFF `sortOrder` |
| Timeline | **ADD** `CandidateStageHistoryPanel` + detail tab · `GET …/stage-history` |
| Lane A id | **ADD** `recruitment_candidate_id` on YCTD merge (pool id ≠ spine) |
| EFF=0 | Empty CTA — **no** invent starter on YCTD path |
| Pool stage | **RETAIN** only when **không** gắn YCTD (≠ FR-05 SoT claim) |
| Nest `/rec` · REC-03 · seed · honesty flip | **DENY** |
| Peers IV / UV-YCTD / REC-04 | **RETAIN** must_keep |
| vitest | **17 PASS** (REC-05) + **12 PASS** UV-YCTD regression |

### Files touched

- `apps/web/hrm/src/integrations/hrmApi.ts` — POST transitions + GET stage-history
- `apps/web/hrm/src/lib/apiError.ts` — STAGE-REJECT/REVERSE/EMPTY/HISTORY/WF toasts
- `apps/web/hrm/src/lib/recCandidateStageTransition.ts` — **NEW** helpers
- `apps/web/hrm/src/lib/candidateUvYctdUi.ts` — attach `recruitment_candidate_id`
- `apps/web/hrm/src/components/recruitment/CandidateStageTransitionDialog.tsx` — **NEW**
- `apps/web/hrm/src/components/recruitment/CandidateStageHistoryPanel.tsx` — **NEW**
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` — YCTD → dialog wire
- `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` — Timeline tab + CTA
- tests: `recCandidateStageTransition.test.ts` · `CandidatesTab.rec05.source.test.ts` · `apiError.recruitment-stage.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/recCandidateStageTransition.test.ts \
  src/lib/apiError.recruitment-stage.test.ts \
  src/components/recruitment/CandidatesTab.rec05.source.test.ts \
  src/components/recruitment/CandidatesTab.source.test.ts
# → 4 files · 17 tests PASS

pnpm --dir apps/web/hrm exec vitest run src/lib/candidateUvYctdUi.test.ts
# → 12 PASS (regression)
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-REC-STG-05-01** | Login → Tuyển dụng → Ứng viên → mở UV **gắn YCTD** → Đổi trạng thái | Picker ∈ EFF · Network **GET** `/recruitment/pipeline-stages/effective` 2xx · **không** free-text SoT |
| **J-HRM-REC-STG-05-02** | Chọn stage ∈ EFF → **Lưu** → F5 stage còn → Detail → tab **Lịch sử trạng thái** | Network **POST** `…/candidates/:id/transitions` 2xx · **GET** `…/stage-history` 2xx · F5 vết còn · path chứa `/recruitment/` |
| **J-HRM-REC-STG-05-03** | Reject + lý do → F5; reject **không** lý do → toast REJECT-REASON; invent ngoài EFF → UNKNOWN | AC-REC-05-04 · EX-01/02 |
| **J-HRM-REC-STG-05-04** | Reverse allow → 2xx + history; CFG deny → REVERSE-FORBIDDEN; multi-YCTD chỉ link đang mở; **không** Nest `/rec` / Campaign | AC-REC-05-05 · O6/O7 |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Tuyển dụng → Ứng viên  
**Prerequisite:** UV đã gắn ≥1 YCTD (FR-05a) · BE transitions LIVE  
**Cấm:** `pnpm seed:*` · API fake history · pool PATCH as FR-05 PASS · honesty flip · reopen J-HRM-REC-CV-04-*

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-STG-BE-LIVE** | Transition/timeline 2xx depends on BE-01 Nest LIVE — FE wired; QA BLOCKED until BE READY | BE / QA |
| **R-FE-STG-HIRE** | Hired-outcome on YCTD uses transitions (no `employee_id` in F.1 body) — INT-01 hire soft-link still pool-only for non-YCTD | residual P2 |
| Kanban O9 | **OUT** this seat (P2) — columns=EFF when later | — |
| Honesty | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · C-SLICE | QC |

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-fe-01.md` |
| **next_dispatch_prompt** | see completion contract below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-05
depends_on: FE-01 READY_FOR_QA · BE-01 READY (transitions LIVE) · API-01 CONFIRMED
entry_criteria: browser-only; U65 zero-seed; L0 stack up
MISSION: U65 J-HRM-REC-STG-05-01..04 — EFF picker; POST …/candidates/:id/transitions; GET stage-history; reject reason; F5 timeline; Network path contains /recruitment/; DENY Nest /rec · REC-03 · seed · honesty flip · reopen J-CV-04
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-05-cluster-qa-01.md · PASS_TO_PM · matrix Dev8088
cấm: pnpm seed:* · API inbox seed · pool stage as FR-05 PASS
```

---

## 7. Honesty / DENY footer

| Flag / claim | Status |
|--------------|--------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| C-SLICE | GWC FE slice ≠ module REC UAT |
| Nest `/rec` dual | **DENY** |
| Pool/posting stage as FR-05 SoT | **DENY** |
| REC-03 Campaign | **DENY** |
| Seed in evidence | **DENY** |
| Reopen REC-04 J-* | **DENY** |
