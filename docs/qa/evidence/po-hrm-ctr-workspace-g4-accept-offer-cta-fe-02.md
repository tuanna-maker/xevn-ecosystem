# Evidence — PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02` |
| **role** | `dev-fe` |
| **ack_status** | **READY_FOR_QA** |
| **parent QA** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01.md` |
| **prior FE** | `docs/qa/evidence/po-hrm-ctr-workspace-g4-accept-offer-cta-fe-01.md` |
| **spec_ref** | FR-UC-BP-REC-07 Diễn biến #1 · AC-REC-UV-02 merge · J-HRM-CTR-HIRE-01 |

## Root cause (QA retest)

1. **DEF-REC-ACCEPT-OFFER-CTA-OFFER-STAGE:** `mergeYctdDisplayOntoPoolCandidates` projected spine `stage` but not spine `status`. `resolveCandidatePipelineStage` prefers `status` when YCTD-bound → pool `status=new` normalized to `applied` overrode merged `stage=offer` → `shouldShowAcceptOfferCta` false.
2. **DEF-REC-EMBED-DEEPLINK-TAB-CANDIDATES:** CC portal URL `?tab=candidates&candidateId=` not forwarded to locked iframe src (same pattern as contract workspace G4) → Recruitment stayed on Dashboard; CandidatesTab never mounted for deep-link.

## Fix (FE)

| File | Change |
|------|--------|
| `candidateUvYctdUi.ts` | Project spine `status` onto pool merge (with `stage` + `employee_id`) |
| `recruitmentEmbedDeepLink.ts` | **NEW** — `mergePortalParentRecruitmentSearch` / `resolveRecruitmentTabFromSearch` |
| `Recruitment.tsx` | Initial tab + effect from merged embed search (parent portal fallback) |
| `CandidatesTab.tsx` | `candidateId` from merged search; match `id` or `recruitment_candidate_id` |

## Tests

```bash
cd apps/web/hrm
pnpm exec vitest run src/lib/candidateUvYctdUi.test.ts src/lib/recCandidateAcceptOffer.test.ts \
  src/lib/recruitmentEmbedDeepLink.test.ts \
  src/components/recruitment/CandidatesTab.rec05.source.test.ts \
  src/components/recruitment/CandidatesTab.rec07.source.test.ts
pnpm exec tsc --noEmit
```

| Command | Result |
|---------|--------|
| vitest (5 files) | **33 passed** |
| tsc --noEmit | **exit 0** |

## QA retest matrix (U65)

| Step | Expected |
|------|----------|
| Login `ceo@xe.vn` → `/command-center/hrm/recruitment?tab=candidates&candidateId={offer-uv-id}` | Tab **Ứng viên** active; detail opens (not Dashboard) |
| UV API `status=offer` + YCTD on detail | `rec-accept-offer-open-detail` visible |
| Click «Chấp nhận offer» → submit | `POST …/applications/{id}/accept-offer` **2xx**; `employee_id` populated |
| «Tạo HĐ» / workspace CTA | WS-G4-13 Step1 prefill (employee_id) |
| F5 on deep-link URL | Tab + detail + CTA still correct |

## Residual

- WS-G4-14 full hire-readiness HTP probe — QA after accept-offer PASS.
- CFG `offer` stage pilot catalog (O2) — not hire seed.

---

## completion_report

**Closed:** P0 status projection on pool merge; CC embed deep-link tab/candidateId via parent portal query merge; vitest + tsc PASS; committed.

**Residual:** QA browser U65 full hire chain (accept-offer → Tạo HĐ → workspace prefill).

## next_owner

`qa`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-REC-HIRE-FE-CHAIN-QA-01-RETEST-02
role: qa
read_first:
- docs/qa/evidence/po-hrm-ctr-workspace-g4-accept-offer-cta-fe-02.md
- docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-01.md
entry_criteria: dev-fe READY_FOR_QA FE-02 committed; L0 stack up; U65 zero-seed
exit_criteria: ceo@ — CC embed ?tab=candidates&candidateId= → detail Offer → rec-accept-offer-open-detail → POST accept-offer 2xx → employee_id → Tạo HĐ → workspace Step1 prefill; WS-G4-13/14 🟢; J-HRM-CTR-HIRE-01 PASS
evidence_path: docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-rec-hire-fe-chain-retest-02.md
ack_status: PASS_TO_PM
```
