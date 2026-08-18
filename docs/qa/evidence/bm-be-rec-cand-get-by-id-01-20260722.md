# BM-BE-REC-CAND-GET-BY-ID-01 — Candidates pool GET-by-id scope_parity

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-BE-REC-CAND-GET-BY-ID-01` |
| **from_role** | dev-be |
| **to_role** | qa |
| **ack_status** | **READY_FOR_QA** |
| **priority** | P1 |
| **executed_at** | 2026-07-22 |
| **entry** | `docs/qa/evidence/bm-qa-j-rec-wf-04-roadmap-01-20260722.md` **R-REC-WF-04-02** |
| **U65** | zero-seed · no Phase1/PROD claim |
| **spec_ref** | J-REC-WF-04 · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · TechSpec §17.6 Lane B · must_keep G-DB-01 hire · dual catalog F1–F10 |

---

## spec_read_ack

| Item | Cite |
|------|------|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` FR-HRM-RC-03 (spine) · FR-HRM-INT-01 hire surface on pool · J-REC-WF-04 detail deep-link |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §17.6 dual catalog — Lane B `public.candidates` via `…/candidates-pool` (`HRM-REC-CP-*`); Lane A `recruitment_candidates` via `…/candidates` |
| **adr** | `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` — group CEO `company_id=main` list/get share `resolveHrmListScope` rollup |
| **qa residual** | R-REC-WF-04-02: list `GET …/candidates-pool?company_id=main` **200**; get-by-id **404** `HRM-DATA-404` |
| **sponsor_confirm** | PM dispatch `BM-BE-REC-CAND-GET-BY-ID-01` |
| **change_mode** | **ADD** |
| **must_keep** | G-DB-01 hire soft `employee_id` · dual catalog F1–F10 (no cross-lane bind) · U65 no seed |

### spec says / code did (before)

| Spec / AC | Before | After |
|-----------|--------|-------|
| List + get-by-id same scope resolver | List used `resolveHrmListScope` + `pushCompanyIdFilter`; **no** `GET candidates-pool/:id` route → Nest **404** `HRM-DATA-404` | `getCandidatePoolById` + `GET …/candidates-pool/:candidateId` with same rollup filter → **200** `HRM-REC-CP-200` for holding/member rows under `main` |
| Dual catalog | Pool ids ≠ spine `recruitment_candidates` | Pool GET stays on `public.candidates`; spine GET `…/candidates/:id` added separately (FR-RC-03) — pool UUID still correctly **404** on spine |

---

## Root cause

Missing RD route: Nest had list `GET /candidates-pool` and mutate `PATCH/DELETE /candidates-pool/:id`, but **no** `GET /candidates-pool/:id`. Framework NotFound → filter code `HRM-DATA-404`. Not a SQL `company_id = 'main'` exact-match bug on an existing handler.

---

## Change package

| File | Change |
|------|--------|
| `recruitment-catalog.service.ts` | ADD `getCandidatePoolById` — `id = $1` + `pushCompanyIdFilter(scope.companyIds)`; code `HRM-REC-CP-404` |
| `recruitment.controller.ts` | ADD `GET candidates-pool/:candidateId` → `HRM-REC-CP-200` |
| `recruitment.service.ts` | ADD `getCandidateById` (Lane A spine parity) |
| `recruitment.controller.ts` | ADD `GET candidates/:candidateId` → `HRM-REC-200` |
| `bm-be-rec-cand-get-by-id-01.spec.ts` | NEW — group CEO main finds `holding` pool + spine; outside scope 404 |
| `recruitment.controller.spec.ts` | Mock + smoke get pool/spine |

---

## Verification (jest)

```text
pnpm --filter hrm-api exec jest --testPathPatterns=bm-be-rec-cand-get-by-id-01 \
  --testPathPatterns=recruitment.controller.spec \
  --testPathPatterns=recruitment-catalog.service.spec \
  --testPathPatterns=be-hrm-g-db-01-hire-link \
  --testPathPatterns=be-hrm-g-rc-01 \
  --testPathPatterns=p1-phase1-be-crud-rd-parity \
  --testPathPatterns=p1-phase1-be-rec-patch --no-coverage
```

**Result:** Test Suites **7 passed** · Tests **43 passed** (includes hire-link + G-RC-01 must_keep).

---

## QA retest focus (browser / L1 aux)

```http
GET /api/hrm/recruitment/candidates-pool?company_id=main
→ 200 HRM-REC-CP-200 · pick any id

GET /api/hrm/recruitment/candidates-pool/{id}?company_id=main
→ 200 HRM-REC-CP-200 · same row (company_id may be holding/member slug)
```

Persona: `ceo@xe.vn` · portal `companyId=main` · **cấm** seed.

Note: `GET …/candidates/{pool-id}` remains **404** `HRM-REC-404` if id only exists in pool (dual catalog — expected). Use `candidates-pool/{id}` for FE deep-link.

---

## Residual

| ID | Note |
|----|------|
| R-REC-WF-04-01 | Post-inbox stage sync — out of scope this work item |
| OpenAPI | Path not in OpenAPI snapshot this wave — optional devops/contract delta |

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** qa
- **pm_dispatch_hint:** `BM-QA-REC-CAND-GET-BY-ID-R2` — retest R-REC-WF-04-02 on `:8088` or local with Group CEO
