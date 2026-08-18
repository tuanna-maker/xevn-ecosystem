# Evidence — PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06-CLUSTER-FE-01` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-8 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-06` |
| **depends_on** | API-01 **CONFIRMED** · BA-01 O1–O12 · BE-01 parallel |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD/UPGRADE · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · DENY module REC UAT claim |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

| Artifact | Ack |
|----------|-----|
| **BA-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md` | Diễn biến FE §3.4 #1–#2 · AC-REC-06-01..04 · O1 path `/recruitment/` · O5 Pass/Fail · O7 APP-02 · O8 CC invite |
| **API-01** `docs/program/specs/PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md` | F-REC-MAIL-01 POST/GET `…/candidates/:id/mail` · F-REC-APP-03 YCTD neo · mint MAIL / EVAL · APP-02 RETAIN |
| **AS-IS UI** | CandidateEvaluationDialog pool `candidate_id` · no mail dialog · REC-05 transitions RETAIN |

```markdown
## spec_read_ack
- srs: SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06 Diễn biến #1–#2 · BR-BP-MAIL-01
- tech_spec / api: PO-HRM-MVP-GD1-REC-06-CLUSTER-API-01.md F-REC-MAIL-01 · F-REC-APP-03
- ba: PO-HRM-MVP-GD1-REC-06-CLUSTER-BA-01.md §3.1–3.4 · VAL-REC-ME-*
- db_design: cite DATA-01 rec_mail_outbox/log · candidate_evaluations YCTD (no FE invent)
- sponsor_confirm: API-01 CONFIRMED 2026-08-09 · BA O1–O12
```

---

## 2. Closed scope

| Item | Status |
|------|--------|
| `CandidateMailDialog` — template_code CFG + CC invite + outbox panel | **ADD** |
| Network mail | `POST/GET …/candidates/:id/mail` only — **no** Nest `/rec` · **no** transitions side-effect |
| Eval Pass/Fail chốt | **UPGRADE** — neo `recruitment_candidate_id` · `commit: true` · no silent pending DONE |
| Toast taxonomy | `HRM-REC-MAIL-*` · `HRM-REC-EVAL-*` via `toErrorMessage` |
| After eval → optional APP-02 | **ADD** suggest button — separate Network transition |
| Detail CTA **Gửi thư** | **ADD** when YCTD-bound |
| Peers REC-05 / 06a / 04 / UV | **RETAIN** must_keep |
| Nest `/rec` · Campaign · seed · honesty · stage fake from mail | **DENY** |
| vitest | **23 PASS** (REC-06 + REC-05 regression) |

### Files touched

- `apps/web/hrm/src/lib/recCandidateMailEval.ts` — **NEW** helpers
- `apps/web/hrm/src/components/recruitment/CandidateMailDialog.tsx` — **NEW**
- `apps/web/hrm/src/integrations/hrmApi.ts` — mail POST/GET + eval neo query
- `apps/web/hrm/src/lib/apiError.ts` — MAIL / EVAL toast VI
- `apps/web/hrm/src/components/recruitment/CandidateEvaluationDialog.tsx` — Pass/Fail + neo
- `apps/web/hrm/src/components/recruitment/CandidatesTab.tsx` — wire mail + eval neo
- `apps/web/hrm/src/components/recruitment/CandidateDetailView.tsx` — Gửi thư CTA + eval list neo
- tests: `recCandidateMailEval.test.ts` · `apiError.recruitment-mail-eval.test.ts` · `CandidatesTab.rec06.source.test.ts`

---

## 3. Verify

```bash
pnpm --dir apps/web/hrm exec vitest run \
  src/lib/recCandidateMailEval.test.ts \
  src/lib/apiError.recruitment-mail-eval.test.ts \
  src/components/recruitment/CandidatesTab.rec06.source.test.ts \
  src/components/recruitment/CandidatesTab.rec05.source.test.ts \
  src/lib/recCandidateStageTransition.test.ts
# → 5 files · 23 tests PASS
```

---

## 4. U65 browser plan (QA — no seed)

| J-ID | Click path | Pass when |
|------|------------|-----------|
| **J-HRM-REC-06-01** | Login → Tuyển dụng → UV **gắn YCTD** → **Gửi thư** → chọn mẫu (`fail_cv`/`offer`) → Gửi → F5 outbox | Network **POST** `/recruitment/candidates/:id/mail` 2xx · FE status/thời điểm · **không** POST transitions từ bước mail |
| **J-HRM-REC-06-02** | `interview_invite` + CC → 2xx; thiếu CC → toast CC-REQUIRED / 400; provider fail → failed + **không** đổi stage | AC-REC-06-02 · EX-01/02 · O7/O8 |
| **J-HRM-REC-06-03** | (IV TERMINAL nếu cần) → **Đánh giá** → điểm + **Pass\|Fail** → **Chốt** → F5 neo YCTD; thiếu Pass/Fail → client/400 toast | Network **POST** `/recruitment/candidate-evaluations` 2xx · path contains `/recruitment/` |
| **J-HRM-REC-06-04** | Sau eval → **Đổi trạng thái (APP-02)** → POST transitions 2xx + Timeline F5; mail không ghi stage; no Campaign / Nest `/rec` | AC-REC-06-04 · O7/O9 · DENY reopen J-STG-05 / J-IV / J-CV-04 |

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal HRM embed Tuyển dụng → Ứng viên  
**Prerequisite:** UV gắn ≥1 YCTD · BE mail + eval LIVE (BE-01 parallel)  
**Cấm:** `pnpm seed:*` · API fake outbox · pool eval as FR-06 PASS · honesty flip

---

## 5. Residual

| ID | Note | Owner |
|----|------|-------|
| **R-FE-REC-06-BE-LIVE** | QA browser blocked until BE-01 mail routes + eval neo LIVE | BE / QA |
| Honesty | `recruitment_uat_ready=false` · C-SLICE | QC |
| REC-03 / hire / 06b matrix | **OUT** this seat | — |

---

## 6. Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
C-SLICE ≠ module REC UAT
U65 zero-seed
Nest /rec dual DENY · Campaign OUT · pool eval ≠ FR-06 DONE
mail fail ≠ stage · APP-02 sole stage writer RETAIN
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md` |
| **next_owner** | **qa** |
| **completion_report** | Closed FE mail-by-template + Pass/Fail eval neo UV↔YCTD on `/recruitment/` only; toast MAIL/EVAL; optional APP-02 after eval; DENY /rec · Campaign · seed · honesty · stage-from-mail. Residual: QA U65 needs BE LIVE. |
| **next_dispatch_prompt** | see below |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-06-CLUSTER-QA-01
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-06
depends_on: FE-01 READY_FOR_QA · BE-01 READY (mail+eval LIVE)
entry_criteria: L0 stack; U65 zero-seed; browser-only; FE evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-fe-01.md
MISSION: Browser J-HRM-REC-06-01..04 — Gửi thư mẫu + Pass/Fail neo YCTD; Network path contains /recruitment/; toast MAIL/EVAL; mail ≠ transitions; F5 outbox+eval; DENY seed · Nest /rec · Campaign · reopen J-STG-05 / J-IV / J-CV-04 · honesty flip.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-06-cluster-qa-01.md · PASS_TO_PM
cấm: pnpm seed:* · API fake · PASS chỉ probe
```
