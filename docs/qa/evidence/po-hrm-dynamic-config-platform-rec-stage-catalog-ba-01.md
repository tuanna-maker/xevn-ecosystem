# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **date** | 2026-08-08 |
| **lane** | governance — AC pack **AC-PLT-REC-STAGE-01*** (admin open N+1 ≠ consumer Nest EFF picker) |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01` Option **B** **CONFIRMED** |
| **ref_peer_att** | ATT leave Nest Option B · AC-PLT-ATT-LEAVE-01* |
| **ref_peer_pay** | PAY Nest SC Option B · AC-PLT-PAY-01* |
| **spec_path** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md) |
| **ref_sa** | [`docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md) |
| **Verdict** | **CONFIRMED** |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | ADD · docs-only · **no** `apps/**` · **no** seed |
| **U65** | zero-seed · browser click paths enumerated |
| **OS honesty** | `C-SLICE-≠-MODULE` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · DENY REC UX QC process / JD DnD / IV one-active reopen · DENY reopen EMP·DEC·PAY·ATT·EXT·CTR·LIST-TOTALS · DENY module REC UAT |

### Honesty locks (mandatory)

| Flag | Value | BA note |
|------|-------|---------|
| **`recruitment_uat_ready`** | **`false`** | **DENIED** invent / promote |
| **`jd_dynamic_done`** | **`false`** | retained — JD OUT |
| **REC UX QC process** | **SEAL RETAIN** | **cấm reopen** |
| **JD DnD · IV one-active · YCTD · hire→EMP** | **SEAL RETAIN** | soft-gate IV ≠ one-active reopen |
| **REC-QC-01 · REC-QC-02** (`RECPLATQA2-MSIXNFE2`) | **SEAL RETAIN** | AC-PLT-REC-02..05 retained |
| **EMP · DEC · PAY · ATT · EXT · CTR · LIST-TOTALS** | **SEAL RETAIN** | **cấm reopen** |
| **Module REC UAT / Phase1** | **DENIED** | Slice AC ≠ module GO |
| **Seed** | **DENIED** (U65) | |
| **ba-data** | **HOLD** | no EXPAND — physical + flags already typed |

---

## 1. spec_read_ack

| Artifact | Used |
|----------|------|
| SA Option B | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md` L-REC-STAGE-01..10 · §7 AC/VAL · ba-data HOLD · BE HOLD until BA |
| SA evidence | `po-hrm-dynamic-config-platform-rec-stage-catalog-sa-01.md` |
| REC vertical | F-REC-CAT-STG/EFF · AC-PLT-REC-02..05 · stamp REC-QC-02 |
| Platform BA | BR-PLT-02/04/05/06 · REC §2.2 |
| Peer ATT-LEAVE BA | AC-PLT-ATT-LEAVE-01* template pattern |
| Peer PAY BA | AC-PLT-PAY-01* admin≠consumer pattern |
| SRS | FR-UC-BP-REC-05 / 05a / 06 / 06a / 07 · JD 00a–00c OUT |
| DB | §2.4a `rec_pipeline_stage` · application.stage · history |
| Nest AS-IS | `assertStageInEffectiveCatalog` on APP-02 + createCandidateApplication; **missing** on `createCandidatePool`; `HRM-REC-STAGE-UNKNOWN` |
| FE AS-IS | `useRecPipelineStagesEffective` on CandidatesTab / CandidateFormDialog / JobCandidatesDialog / hire; **kanban** `Recruitment.tsx` hardcode six columns; IV soft-gate consumer **missing** |
| Prior QA | `po-hrm-dynamic-config-platform-rec-qa-02.md` stamp `RECPLATQA2-MSIXNFE2` click path Settings→picker→invent 400→hire |

---

## 2. Deliverable

| Path | Content |
|------|---------|
| [`PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md`](../../program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md) | AC-PLT-REC-STAGE-01/01b/01c/01d/01H · deepen 05a/05k/07/06a · VAL-REC-CNS-01..06 · surface matrix · UF/J-* click paths · FE bind EFF vs MD/six · BR-PLT-REC-STAGE-* · honesty · handoff |

**Không đụng:** `apps/**` · seed · flip `recruitment_uat_ready` · reopen REC UX process / JD / IV · reopen EMP/DEC/PAY/ATT seals · ba-data EXPAND.

---

## 3. AC pack summary

| ID | Surface | Rule |
|----|---------|------|
| **AC-PLT-REC-STAGE-01** | UV đổi trạng thái (CNS-01) | EFF≥1 → picker F-REC-CAT-EFF · 2xx · F5 ∈ catalog |
| **AC-PLT-REC-STAGE-01b** | Invent | **4xx** `HRM-REC-STAGE-UNKNOWN` ≡ **AC-PLT-REC-04** |
| **AC-PLT-REC-STAGE-01c** | EFF=0 | Empty/soft-starter + CTA admin · no seed |
| **AC-PLT-REC-STAGE-01d** | Admin CREATE N+1 | Open slug · REC-QC-02 RETAIN |
| **AC-PLT-REC-STAGE-01H** | Honesty | ready=false · seals retain · C-SLICE |
| **AC-PLT-REC-STAGE-05a** | UV create initial | EFF picker + BE assert |
| **AC-PLT-REC-STAGE-05k** | Kanban | Columns/move ∈ EFF when >0 |
| **AC-PLT-REC-STAGE-07** | Hire | hiredOutcomeKey RETAIN |
| **AC-PLT-REC-STAGE-06a** | IV soft-gate | `allows_interview_schedule` — ≠ one-active reopen |

---

## 4. FE bind source matrix (authoritative for QA)

| Surface | Expected SoT when EFF>0 | AS-IS | Gap |
|---------|-------------------------|-------|-----|
| Settings Giai đoạn REC | Admin Nest CRUD | OK | — |
| CandidatesTab stage Select | **GET …/pipeline-stages/effective** | EFF bind | **RETAIN verify** |
| CandidateFormDialog stage | **EFF** | EFF bind | **RETAIN** + BE assert gap |
| JobCandidatesDialog | **EFF** | EFF bind | **RETAIN verify** |
| Hire dialog | `hiredOutcomeKey` from **EFF** | Wired | **RETAIN** |
| Kanban columns `Recruitment.tsx` | **EFF keys** | **Hardcode six** | **GAP FE** VAL-REC-CNS-04 |
| Starter-six / MD helpers | Fallback only if EFF=0 | Present | Allowed REF — **FAIL** if sole SoT when EFF>0 |
| IV Schedule soft-gate | Flag from catalog/EFF | **Not wired** | **GAP** VAL-REC-CNS-05 |

---

## 5. Gate matrix

| Gate | Status |
|------|--------|
| ba-process AC pack | **CONFIRMED** (this seat) |
| ba-data physical EXPAND | **HOLD** — no column gap proven |
| BE consumer deepen | **UNLOCK** gaps: **VAL-REC-CNS-02** (pool create assert) · optional **VAL-REC-CNS-05**; APP-02 **RETAIN** |
| FE | **UNLOCK** kanban EFF columns + IV soft-gate; CNS-01/02 EFF **RETAIN verify** |
| QA / QC | After BE/FE gaps (or spot RETAIN + FAIL gaps) · U65 · no UAT flip |

---

## 6. Align note (no conflict)

| Vertical | This pack |
|----------|-----------|
| AC-PLT-REC-02 | ≡ **01d** admin open — RETAIN |
| AC-PLT-REC-03 | retire/history — RETAIN |
| AC-PLT-REC-04 | ≡ **01b** invent — cross-ref |
| AC-PLT-REC-05 | ≡ hire deepen **07** — RETAIN |
| AC-PLT-ATT-LEAVE-01* / AC-PLT-PAY-01* | Named peer pattern |

---

## 7. completion_report

**Closed:** CONFIRMED AC pack **AC-PLT-REC-STAGE-01 / 01b / 01c / 01d / 01H** + deepen **05a / 05k / 07 / 06a** + **VAL-REC-CNS-01..06** peer ATT-LEAVE/PAY — Nest F-REC-CAT-STG/EFF = stage_key SoT; admin CREATE open N+1 RETAIN (REC-QC-02); consumers (APP-02 · UV initial · kanban · hire · IV soft-gate) picker when EFF>0; invent → `HRM-REC-STAGE-UNKNOWN` (align AC-PLT-REC-04); exact UF/J-* click paths + FE bind EFF vs MD/six enumerated; ba-data **HOLD** (no EXPAND); BA gaps stamped: **BE** pool create assert · **FE** kanban columns · **FE/BE** IV soft-gate; APP-02 assert + CandidatesTab EFF **RETAIN**; honesty false · seals retained · docs-only · no `apps/**` · no seed · `C-SLICE-≠-MODULE` · DENY module REC UAT.

**Residual:** PM unlock **dev-be** (VAL-REC-CNS-02 ±05) + **dev-fe** (kanban + IV soft) → **qa** U65 browser pack; ba-data stays HOLD; DENY recruitment_uat / process·JD·IV reopen.

---

## 8. Handoff contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **next_owner** | **pm** → **dev-be** (+ **dev-fe** parallel) then **qa** |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-ba-01.md` |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01
from_role: pm
to_role: dev-be
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01 CONFIRMED
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
parallel_ok: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01 (dev-fe)

## task
Close BA gaps only (cite BA-01 §6.3):
1) VAL-REC-CNS-02 — createCandidatePool (+ update pool stage if missing) call assertStageInEffectiveCatalog when EFF>0 → invent → HRM-REC-STAGE-UNKNOWN
2) RETAIN APP-02 / updateCandidateApplicationStage assert + existing jest (VAL-REC-CNS-01) — no wipe
3) Optional VAL-REC-CNS-05 — IV schedule soft-gate when allows_interview_schedule=false (deterministic 4xx ≠ UNKNOWN; cấm reopen IV one-active)
4) Jest for VAL-REC-CNS-02 (+05 if shipped); scope_parity RETAIN
- Cite: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md
- Cite SA: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-SA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-be-01.md

## must_keep / honesty / cấm
recruitment_uat_ready=false · jd_dynamic_done=false · REC UX QC process / JD DnD / IV one-active / REC-QC-01/02 RETAIN
EMP/DEC/PAY/ATT/EXT/CTR/LIST-TOTALS RETAIN · no seed · C-SLICE-≠-MODULE · DENY module REC UAT · ba-data HOLD

## exit
READY_FOR_QA · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```

### next_dispatch_prompt_fe (copy-ready · parallel)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01 CONFIRMED
program: PO-HRM-CONTINUOUS-W8-20260807
change_mode: ADD
parallel_ok: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-BE-01

## task
Close BA FE gaps (cite BA-01 §4 / §6.3 / §6.5):
1) VAL-REC-CNS-04 / AC-PLT-REC-STAGE-05k — rebind Recruitment.tsx kanban columns to F-REC-CAT-EFF when catalogCount>0; soft-allow starter six ONLY when EFF=0
2) RETAIN verify CandidatesTab / CandidateFormDialog / JobCandidatesDialog EFF bind (Network GET …/pipeline-stages/effective)
3) VAL-REC-CNS-05 / AC-PLT-REC-STAGE-06a — soft-gate Schedule IV when current stage allows_interview_schedule=false (disable/banner); cấm reopen IV one-active core / JD DnD
4) U65-ready testids if missing for kanban column + IV gate
- Cite: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-BA-01.md
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-fe-01.md

## must_keep / honesty / cấm
recruitment_uat_ready=false · jd_dynamic_done=false · REC UX / JD / IV one-active / REC-QC RETAIN
no seed · C-SLICE-≠-MODULE · DENY module REC UAT

## exit
READY_FOR_QA · completion_report · next_owner · next_dispatch_prompt · evidence_path · ack_status
```
