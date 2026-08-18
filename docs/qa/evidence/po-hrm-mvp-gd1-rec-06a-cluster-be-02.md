# Evidence — PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-4) |
| **lane** | execution · **dev-be** |
| **Date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-06a` |
| **depends_on** | QA-01 FAIL **R-REC-IV-PROJ-ID** · `po-hrm-mvp-gd1-rec-06a-cluster-qa-01.md` |
| **change_mode** | **FIX** · `preserve_default: true` · `code_memory_mode: APPEND` |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `recruitment_uat_ready=false` · program honesty **false** · **C-SLICE** · U65 zero-seed |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **api** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-API-01.md` **F-REC-IV-04** — BE subquery ACTIVE → `active_interview_id` / status / at / badge · FE bind only |
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-06A-CLUSTER-BA-01.md` AC-REC-IV-06 · J-HRM-REC-IV-03..06 Manage PATCH needs id |
| **qa** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-01.md` R-REC-IV-PROJ-ID — mapper omit id |
| **fe residual** | FE-01 **R-FE-IV-ID-PROJ** elevated to BE P0 |
| **srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-06a** Diễn biến #3/#7 list badge · Manage cancel/complete/no_show/R-A |

**spec says / code does:**

| Spec | Before | After |
|------|--------|-------|
| F-REC-IV-04 nested `active_interview_id` | SQL `ai.id AS active_interview_id` selected · **mapper omit** | `toActiveInterviewProjection` embeds id when ACTIVE |
| Flat fallback | absent on list map | ADD flat `active_interview_id` on list/get |
| get-by-id parity | no LATERAL ACTIVE | LATERAL + same projection (list↔get) |

---

## Implementation

| Surface | Change |
|---------|--------|
| `ActiveInterviewProjection` | ADD `active_interview_id: string \| null` |
| `toActiveInterviewProjection` | Embed id (null when inactive; trim string when ACTIVE) |
| `listCandidates` | nested + flat `active_interview_id` |
| `getCandidateById` | LATERAL ACTIVE join + nested + flat (U19 parity) |
| CODE-MEMORY | APPEND BE-02 on service + get method |

**must_keep RETAIN:** Lane A SoT · badge label · 409 ACTIVE details · soft-gate ≠ 409 · BE-01 R-A/`no_show`/PAST · W1–W3 · honesty false · U65

**DENY respected:** Nest `/rec` dual · Lane B SoT · seed · flip `recruitment_uat_ready` · reopen W1–W3

---

## Files touched

| Path | Mode |
|------|------|
| `apps/api/hrm-api/src/recruitment/recruitment.service.ts` | FIX projection + get LATERAL |
| `apps/api/hrm-api/src/recruitment/recruitment.service.spec.ts` | UPGRADE assert nested+flat id |
| `apps/api/hrm-api/src/recruitment/po-hrm-mvp-gd1-rec-06a-cluster-be-02.spec.ts` | ADD |

---

## Jest

```text
pnpm --filter hrm-api exec jest --testPathPatterns="po-hrm-mvp-gd1-rec-06a-cluster-be-02|po-hrm-mvp-gd1-rec-06a-cluster-be-01|recruitment.service.spec|bm-be-rec-cand-get-by-id-01|po-hrm-rec-uv-yctd-be-01" --no-coverage
→ Test Suites: 5 passed · Tests: 47 passed
```

BE-02 focused: list nested+flat id · get parity · inactive clears id.

---

## Rebuild + restart (R-REC-IV-STALE-DIST seal)

| Step | Result |
|------|--------|
| `pnpm --filter hrm-api run build:clean` | **PASS** (verify-dist) |
| Stop listener `:28001` + `node dist/main` (`HRM_BE_PORT=28001`) | Nest **successfully started** |
| Dist grep `active_interview_id` in mapper | present |

### LIVE probe (ceo@xe.vn · company_id=main)

`GET /api/hrm/recruitment/candidates?company_id=main`

| Row | nested `active_interview.active_interview_id` | flat |
|-----|-----------------------------------------------|------|
| ACTIVE sample (CNS Allow…) | `87f73d3b-663c-4dbe-9d2b-4749a4282dd8` | same |
| **Tuấn** `tuanna@unicomhub.com` (QA persona) | `71cab875-faac-48bd-aeb8-93f4cf3d9e82` | same |
| Inactive | null / omitted empty | null |

→ **R-REC-IV-PROJ-ID CLOSED** at L1 LIVE after rebuild.

---

## Residual for QA-02

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| J-HRM-REC-IV-03..06 browser | P0 verify | **qa** | Manage dialog must enable cancel / no_show / R-A · Network PATCH Lane A |
| R-FE-IV-409-HANDOFF | P2 | optional FE | Projection fixed → handoff optional |
| Honesty / C-SLICE | — | QC | **DENY** flip `recruitment_uat_ready` |

---

## Honesty footer

```text
recruitment_uat_ready=false
program honesty flags=false
C-SLICE ≠ module REC UAT
prior IV create/409/badge GWC RETAIN ≠ module UAT
U65 zero-seed
REC-03 OUT · Lane B ≠ SoT · Nest /rec dual DENY
LIVE projection id sealed after rebuild — READY_FOR_QA browser residual
```

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-be-02.md` |
| **next_owner** | **qa** |
| **completion_report** | Closed R-REC-IV-PROJ-ID: `toActiveInterviewProjection` + list/get now emit nested (+ flat) `active_interview_id` when ACTIVE. Jest 47 PASS. `build:clean` + restart `:28001`. LIVE Tuấn row shows UUID. Honesty false · U65 · DENY Nest/rec dual · no seed. |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-06A-CLUSTER-QA-02
lane: execution · qa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-4)
uc_ids: UC-BP-REC-06a
depends_on: BE-02 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-be-02.md
entry_criteria: L0 qc:dev-stack + qc:fe-be-health; LIVE GET candidates ACTIVE has active_interview.active_interview_id; U65 zero-seed
MISSION: Browser retest J-HRM-REC-IV-03..06 (Manage cancel → round2 · no_show → round2 · R-A Đổi lịch · open ACTIVE manage with id). Assert Network PATCH /recruitment/interviews/:id(/status) from FE; FE sau 2xx + F5; RETAIN J-01/02/07. DENY seed · Nest /rec dual · Lane B SoT · honesty flip · reopen W1–W3.
exit_criteria: UF evidence blocks for J-03..06; matrix update; ack PASS_TO_PM or FAIL with residual; evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-06a-cluster-qa-02.md
```
