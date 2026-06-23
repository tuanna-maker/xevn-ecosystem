# HRM Technical Manager Review — 2026-05-24

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-TM-REVIEW-20260524` |
| **Reviewer** | Technical Manager (TA lane) |
| **Inputs** | `hrm-full-quality-audit-20260524.md`, `HRM_QUALITY_AUDIT_PROGRAM.md`, `hrm-be-quality-audit-20260524.md`, `hrm-embed-fe-audit-20260524.md` |
| **ADR** | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md`, `ADR-HRM-EMBED-DATA-MODE.md` |
| **Commit** | None |

---

## Executive verdict

**Release recommendation: NO-GO** (production and UAT-PASS for full HRM).

**Conditional path: GO WITH CONDITIONS (GWC)** — *only* for **Group CEO embed slice** (8 CC tabs + J-HRM-01..07) **after W1 closes** with TM scope-parity sign-off and QA L2.5 evidence. Not eligible today (2026-05-24 W0).

Core BE discipline is sound (127/127 jest, density 7/7, L2 embed 8/8). Gaps are **scope parity on mutate paths**, **L2.5 journey evidence**, **FE date-crash paths**, and **structural dual Supabase/API debt** — all block a clean GO.

---

## 1. Scope parity risks

| Risk | Severity | Evidence | TM requirement before GWC |
|------|----------|----------|----------------------------|
| **List ↔ mutate asymmetry** — lists use `resolveHrmListScope`; mutations query by UUID only | **High (IDOR class)** | `recruitment.service.ts` `createCandidate`/`scheduleInterview` exact `company_id`; `updateInterviewStatus` no scope predicate; `contracts-insurance.service.ts` `updateContract`/`deleteContract` by id only | W1: shared `assertResourceInHrmScope` on all mutate-by-id paths in recruitment + contracts; jest regression with group CEO JWT + member slug rows |
| **Module rollup missing** — performance, fleet, attendance update-requests, payroll reconciliation use exact `main` | **High (empty UI / 400)** | BE audit P0-01..04; performance/fleet no `resolveHrmListScope` | W2 for operations/performance; **block GWC** if any in-scope embed tab still empty for `ceo@xe.vn` |
| **DTO slug vs UUID inconsistency** — list DTOs accept `main`; write/list-candidates DTOs `@IsUUID()` | **Medium (400 HRM-VAL-001)** | 15+ DTO files; `list-candidates` vs `list-job-requisitions` mismatch | Bulk DTO alignment (`@IsString` slug for `company_id` on writes); QA must prove POST from portal with `main` |
| **Only employees has list↔get parity** | **Medium (future drift)** | `employees.service.ts` reference impl; no GET-by-id elsewhere yet | Any new GET-by-id must copy employees pattern; TM spot-check grep before QC GWC |
| **Recruitment create parent lookup** — requisition/candidate check uses exact `payload.company_id`, not rollup IN | **Medium** | `recruitment.service.ts` L146–147, L194–195 | Mutations must validate parent row ∈ `scope.companyIds`, not literal slug |

**TM spot-check (code):** grep confirms lists wired in employees, contracts, payroll, recruitment, attendance, leave, employee-metadata; **mutations and performance/fleet/operations remain FAIL** vs ADR §4.

**Scope parity checklist status:** ❌ **Not signed** — W1 Dev-BE work in flight.

---

## 2. Dual Supabase / Nest API architecture debt

| Dimension | Current state | Risk | Mitigation |
|-----------|---------------|------|------------|
| **Surface area** | ~90 HRM web files import Supabase; pilot guard covers **32 modules / P-CC-03..08 load paths only** | User on full HRM app or employee sub-tabs (Skills, Resume, Family, recruitment campaigns) hits **Supabase-first** — data divergence, 54321 console errors, scope bypass | Phase 2 (W2–W3): tab-by-tab API migration; expand static guard or route-level `hrmDataMode` enforcement beyond embed |
| **Data SoT** | Embed lists → Nest API ✅; write/detail/recruitment advanced → mixed | Inconsistent AC for 119 UC (~35–45% e2e evidence); BA cannot sign UC closure | Treat as **accepted tech debt for GWC slice only**; full UAT-PASS requires migration plan with per-UC cutover |
| **Testability** | `hrmEmbedPilotGuardAudit.test.ts` — static gate on pilot paths | Guard does **not** prove runtime API usage on non-pilot routes | Add CI fail if new embed route imports Supabase without guard; TM review on each FE PR touching `apps/web/hrm` |
| **Operability** | Dual stack = dual failure mode (API down vs Supabase unreachable) | Production cutover blocked without single SoT | **Production NO-GO** until embed slice is API-only for read+write in scope; Supabase retained only for legacy full-app with explicit waiver |

**Architecture debt rating:** **P1 structural** — acceptable for **limited GWC pilot** with documented out-of-scope (full app, mobile advanced, recruitment campaigns). **Not acceptable for Production GO.**

---

## 3. Release recommendation

| Gate | Verdict | Rationale |
|------|---------|-----------|
| **Production GO** | **NO-GO** | Unresolved P0 scope/DTO gaps; no L2.5 PASS bundle; dual SoT; 119 UC ~35–45% closure; no `verify:production-env` / NFR evidence for HRM slice |
| **UAT-PASS (full HRM)** | **NO-GO** | Program doc §1 🔴 UC sign-off; mobile/catalog/recruitment full incomplete |
| **UAT-READY GWC (Group CEO embed slice)** | **NO-GO today → GWC after W1** | Conditions below |

### GWC conditions (minimum for TM + QC sign-off)

1. QA **L2.5 PASS** with evidence for **J-HRM-01..07** (`PROGRAM_JOURNEY_MAP.md`).
2. W1 Dev-BE: recruitment + contract mutate scope parity + tests **PASS**.
3. W1 Dev-FE: `formatDisplayDate` (or equivalent) on Contracts, Decisions, recruitment — **zero** `Invalid time value` on pilot persona.
4. `pnpm test` (hrm-api) + `verify:hrm:menu-density` + `qc:fe-be-health` exit **0**.
5. TM **scope parity checklist signed** (this doc updated §1 → ✅).
6. Explicit **out-of-scope** in QC packet: full HRM app Supabase routes, mobile 15 UC, catalog 72 DM hardening, member CEO persona.

---

## 4. Risk register (top 5)

| ID | Risk | L | Owner | Mitigation |
|----|------|---|-------|------------|
| TM-R1 | IDOR via mutate-by-id without rollup | High | Dev-BE | W1 scope helper + tests |
| TM-R2 | Group CEO empty panels (performance, fleet, update-requests) | High | Dev-BE | W1–W2 rollup wiring |
| TM-R3 | FE date crash on Contracts/Decisions | Medium | Dev-FE | W1 formatDisplayDate rollout |
| TM-R4 | Supabase leak on non-pilot navigation | Medium | Dev-FE | W2 tab migration + guard expansion |
| TM-R5 | False confidence from L2-only QA (tab load ≠ journey) | High | QA/QC | Enforce L2.5 gate; TM blocks re-GO if user P0 after QA PASS |

---

## 5. Next TM actions

- Re-review after W1 Dev-BE/FE handoff; re-run scope parity grep + sign §1 checklist.
- Align with SA on `assertResourceInHrmScope` ADR delta if mutate contract changes.
- Support QC **NO-GO** until this file §3 GWC conditions are met.

**Signed:** Technical Manager · 2026-05-24 · **NO-GO** (GWC deferred to post-W1)
