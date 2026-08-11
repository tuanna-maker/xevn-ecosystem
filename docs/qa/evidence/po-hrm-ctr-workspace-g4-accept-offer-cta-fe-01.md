# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-01` |
| **role** | `dev-fe` |
| **ack_status** | **READY_FOR_QA** |
| **spec_ref** | FR-UC-BP-REC-07 Diễn biến #1 · FR-UC-BP-REC-05 stage transition · AC-REC-UV-02 merge |
| **parent QA** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-01.md` |

## Root cause

Lane A `GET /recruitment/candidates` returns `status=offer`, but Candidates list SoT kept **pool `stage=new`** after `mergeYctdDisplayOntoPoolCandidates` (YCTD merged, stage not). `shouldShowAcceptOfferCta` gated on stale `stage` → `rec-accept-offer-open-detail` hidden.

Secondary: `?candidateId=` deep-link did not auto-open detail overlay (QA harness reload lost detail state).

## Fix (FE)

| File | Change |
|------|--------|
| `candidateUvYctdUi.ts` | Project spine `status/stage` (+ `employee_id`) on pool merge; `resolveCandidatePipelineStage` prefers Lane A `status` when YCTD-bound |
| `recCandidateAcceptOffer.ts` | `shouldShowAcceptOfferCta` uses `resolveCandidatePipelineStage` |
| `CandidatesTab.tsx` | `?candidateId=` opens detail after list load |
| `CandidateStageTransitionDialog.tsx` | `data-testid="rec-stage-transition-select"` for QA harness (P2) |

## Tests

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/candidateUvYctdUi.test.ts src/lib/recCandidateAcceptOffer.test.ts \
  src/components/recruitment/CandidatesTab.rec05.source.test.ts \
  src/components/recruitment/CandidatesTab.rec07.source.test.ts
pnpm exec tsc --noEmit
```

| Command | Result |
|---------|--------|
| vitest (4 files) | **29 passed** |
| tsc --noEmit | **exit 0** |

## QA retest matrix (U65)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → `/command-center/hrm/recruitment?tab=candidates&candidateId={offer-uv-id}` | Detail opens; badge stage **Offer** |
| UV `status=offer` + YCTD | `rec-accept-offer-open-detail` visible |
| Click «Chấp nhận offer» → submit | `POST …/applications/{id}/accept-offer` **2xx**; `employee_id` populated |
| Optional | `rec-accept-offer-create-contract` / `rec-hire-cta-create-contract` → workspace prefill (WS-G4-13/14) |
| `status=new` → «Đổi trạng thái» | `rec-stage-transition-dialog` + `rec-stage-transition-select` navigable to **offer** |

## Residual

- CFG `offer` stage pilot upsert (O2 catalog) — documented in prior QA; not hire seed.
- Full WS-G4-14 hire-readiness HTP probe — QA after accept-offer PASS.

---

## completion_report

**Closed:** P0 DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE — spine status projected to list SoT; accept-offer CTA gate fixed; candidateId deep-link; stage dialog QA testid. Vitest + tsc PASS.

**Residual:** QA browser retest full hire chain (accept-offer → Tạo HĐ → workspace prefill).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST
role: qa
read_first:
- docs/qa/evidence/po-hrm-ctr-workspace-g4-accept-offer-cta-fe-01.md
- docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-01.md
entry_criteria: dev-fe READY_FOR_QA; L0 stack up; U65 zero-seed
exit_criteria: ceo@ — UV offer → rec-accept-offer-open-detail → POST accept-offer 2xx → employee_id → Tạo HĐ CTA → workspace Step1 prefill; WS-G4-13/14 🟢; J-HRM-CTR-HIRE-01 PASS
evidence_path: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01.md
ack_status: PASS_TO_PM
```
