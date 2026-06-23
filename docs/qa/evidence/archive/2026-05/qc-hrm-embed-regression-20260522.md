# QC gate — HRM Command Center embed regression

**Date:** 2026-05-22  
**work_item_id:** `QC-HRM-EMBED-REGRESSION-01`  
**from_role:** QC  
**to_role:** PM, technical-manager, dev-fe  
**ack_status:** `PASS_TO_PM` (initial gate **NO-GO**; re-gate **GO WITH CONDITIONS** — see § Re-gate)

## User escalation (valid)

User screenshot on `/command-center/hrm/contracts`: empty data, console `ERR_CONNECTION_REFUSED` to `127.0.0.1:54321`, network `settings-catalogs` **409**. Prior QC/local-pilot signoff did **not** exercise this route; PM was not notified.

## Retrospective — why prior gate missed this

| Gap | Detail |
|-----|--------|
| **Narrow QC scope** | `qc-local-pilot-20260522.md` gated only `LOCAL-PILOT-STACK-01` + `PORTAL-AUTH-TOKEN-24H-01` (stack health, JWT 24h, `group-member-units`). No HRM embed matrix. |
| **Inherited QA slice only** | QA `PASS_TO_PM` on `HRM-EMBED-D1` covered **employees** U1–U4 only (`hrm-embed-employees-fix-20260522.md`). QC did not re-run or extend matrix to `contracts` / `insurance`. |
| **Slice-over-generalization** | Employees fix (`portalAuthBridge`, `shouldSkipSupabaseDataFetches`, D1 scope) was treated as representative of all HRM iframe routes; `Contracts.tsx` still uses Supabase for list CRUD + employee dropdown and calls Nest `settings-catalogs` with embed scope. |
| **Process breach** | Empty UI + `ERR_CONNECTION_REFUSED` + HTTP **409** is a **BLOCKER** per pilot policy; QC should have issued **NO-GO** and `qc -> PM` same day — not silent acceptance. |

**Employees PASS baseline (reference only):** `docs/qa/evidence/hrm-embed-employees-fix-20260522.md` § QA final retest D1 — U1–U4 PASS, iframe `companyId=main`, 10 rows, no ERROR banner.

## Mandatory HRM embed matrix (local pilot)

**Pre:** Portal `http://localhost:5175`, login `ceo@xe.vn` / `Xevn@2026`, stack HRM `28001` + XBOS `28002` up.

| Route | Portal path | Pass criteria |
|-------|-------------|---------------|
| Employees | `/command-center/hrm/employees` | No HRM API Sync **ERROR**; no critical console red on load; `GET /api/hrm/employees?...page_size=100` → **200** with rows OR documented seed-empty with **200** + copy |
| Contracts | `/command-center/hrm/contracts` | Same banner/console rules; contract list from **Nest/proxy** OR explicit empty-with-**200**; no required `54321` fetch on load |
| Insurance **or** settings-catalogs probe | `/command-center/hrm/insurance` **or** contracts load calling `GET /api/hrm/settings-catalogs` | No **409** `SCOPE_CONTEXT_MISMATCH` when JWT `companyId=main`; catalogs **200** or graceful degraded UI (not silent empty + 409) |

**Per-route checks (all three):**

1. HRM API Sync banner ≠ ERROR (when portal session valid).
2. Console: no **critical** red (`ERR_CONNECTION_REFUSED`, uncaught 409 storm) on initial load.
3. Data: table/content OR explicit empty state **and** backing API **200** with `data: []` (not failed fetch masked as empty).

**QC rule:** PASS on **employees alone** does **not** satisfy Command Center HRM pilot GO.

## Verdict — contracts (user screenshot criteria)

| Criterion | User observation | QC audit | Result |
|-----------|------------------|----------|--------|
| No ERROR banner | (not stated) | Not re-run in this cycle; code path still mixed Supabase + API | **UNKNOWN** — assume at risk |
| No critical console red | `54321 ERR_CONNECTION_REFUSED` | `Contracts.tsx` still queries `supabase.from('contracts'|'employee_contracts'|'employees')` — pilot stack has no local Supabase | **FAIL** |
| Data or empty-with-200 | Empty “Không có dữ liệu” | List load depends on Supabase, not `contracts-insurance` Nest API; parallel `getSettingsCatalogsOverview` → **409** | **FAIL** |
| settings-catalogs | HTTP **409** | Same scope/header class as pre-D1 employees (`SCOPE_CONTEXT_MISMATCH` when company header ≠ JWT) | **FAIL** |

**Decision:** **NO-GO** for `/command-center/hrm/contracts` and **NO-GO** for Command Center HRM pilot slice until **dev-fe** closes defects below and QA re-runs full matrix.

## Defects — dev-fe (open)

| ID | Sev | Route | Summary | Expected fix direction |
|----|-----|-------|---------|------------------------|
| HRM-EMBED-D3 | **P0** | `/hr/contracts` (embed) | Page loads contract/employee data via **Supabase** `:54321` → connection refused, empty table | Route contracts list through portal JWT + `/api/hrm/contracts-insurance/...` (or equivalent Nest list); `shouldSkipSupabaseDataFetches()` on all contract load paths |
| HRM-EMBED-D4 | **P0** | contracts (catalog) | `GET /api/hrm/settings-catalogs` → **409** on embed load | Align `HrmSpreadsheetScope` / `headers({ scope })` with portal JWT `companyId=main` (same pattern as employees D1); verify proxy `x-company-id` |
| HRM-EMBED-D5 | **P1** | insurance (matrix) | Not user-reported this cycle; likely same Supabase-only pattern as contracts | Apply embed matrix on `/command-center/hrm/insurance` before QC re-gate |
| HRM-EMBED-D2 | P2 | embed-wide | Residual `54321` on subscription/departments (employees doc) | Close when embed sweep completes |

## Handoffs

### qc → PM

- **ack_status:** `FAIL` (not release-ready for HRM embed pilot)
- **entry_criteria:** Valid user escalation + employees PASS baseline on file
- **exit_criteria:** QA PASS on full embed matrix (employees + contracts + insurance/catalog probe); QC re-gate
- **evidence_path:** this file; `docs/qa/evidence/hrm-embed-employees-fix-20260522.md` (employees baseline)
- **needed_by:** PM dispatch **dev-fe** `HRM-EMBED-REGRESSION-01`; then **qa** full matrix; then **qc** re-gate
- **residual_risk:** Demo on contracts/insurance/decisions will show empty/broken UI while employees appears green

### qc → technical-manager

- **Recommendation:** **embed sweep** — audit all `/command-center/hrm/:view` iframes for (a) Supabase hard-dependency, (b) Nest scope 409, (c) `page_size` > 100; publish TM checklist tied to `contracts-insurance` + `settings-catalogs` modules.
- **ack_status:** `PASS_TO_PM` (advisory)

### qc → dev-fe

- **ack_status:** `FAIL`
- **priority order:** D3 (Supabase contracts data) → D4 (settings-catalogs 409) → D5 (insurance) → D2 (54321 cleanup)
- **exit_criteria:** Matrix PASS; bus `READY_FOR_QA`

## Addendum pointer

See also: `docs/qa/evidence/qc-local-pilot-20260522.md` § Addendum HRM embed regression.

## Evidence paths

- `docs/qa/evidence/hrm-embed-employees-fix-20260522.md` (employees PASS)
- `docs/qa/evidence/hrm-embed-contracts-fix-20260522.md` (contracts fix + QA matrix PASS)
- `apps/web/hrm/src/pages/Contracts.tsx`, `apps/web/hrm/src/hooks/useContracts.ts`, `apps/web/hrm/src/lib/hrmSpreadsheetScope.ts`
- `apps/api/hrm-api/src/contracts-insurance/` (Nest lane — wired in FE portal mode)

---

## Re-gate — 2026-05-22T17:30Z

**from_role:** QC  
**to_role:** PM, technical-manager  
**trigger:** PM dispatch after `HRM-EMBED-CONTRACTS-01` dev-fe fix + QA PASS on full embed matrix (employees + contracts + settings-catalogs probe).

### Inputs audited

| Artifact | Verdict | Notes |
|----------|---------|-------|
| `hrm-embed-contracts-fix-20260522.md` § QA retest | **PASS** | C1–C6 PASS; U1–U4 regression PASS; API smoke + browser UAT |
| `hrm-embed-employees-fix-20260522.md` § QA final retest D1 | **PASS** | Baseline retained |
| dev-fe build/test | **PASS** | `pnpm test` 11/11, HRM + portal build PASS |
| Code closure D3/D4 | **CLOSED** | `useContracts` + `shouldSkipSupabaseDataFetches`; `resolveHrmSpreadsheetScope` JWT-first |

### Matrix re-audit (scoped pilot)

| Route | QC result | Evidence |
|-------|-----------|----------|
| `/command-center/hrm/employees` | **PASS** | QA U1–U4; `HRM-EMP-200`, 10 rows, banner CONNECTED |
| `/command-center/hrm/contracts` | **PASS** | QA C1–C6; `HRM-CON-200` empty OK; `HRM-SET-200`; no required `54321` on load |
| `/command-center/hrm/insurance` | **DEFERRED** | Not exercised this cycle (HRM-EMBED-D5); **out of approved pilot scope** until QA matrix PASS |

### Defect disposition

| ID | Prior | Re-gate |
|----|-------|---------|
| HRM-EMBED-D3 | P0 open | **CLOSED** (QA) |
| HRM-EMBED-D4 | P0 open | **CLOSED** (QA) |
| HRM-EMBED-D5 | P1 open | **OPEN — deferred condition** (insurance route) |
| HRM-EMBED-D2 | P2 open | **OPEN — non-blocking** (dashboard/expiring-contracts/EmployeeContracts Supabase; out of slice) |

### Final gate decision

**GO WITH CONDITIONS** — **local pilot only**, routes:

- `http://localhost:5175/command-center/hrm/employees`
- `http://localhost:5175/command-center/hrm/contracts`

**Pre:** stack HRM `28001` + XBOS `28002` + portal `5175`; login `ceo@xe.vn` / `Xevn@2026`.

| # | Condition | Owner | Expiry / trigger |
|---|-----------|-------|------------------|
| C-INS | **Insurance** (`/command-center/hrm/insurance`) not approved for demo/pilot until QA runs embed matrix row + QC re-gate closes D5 | dev-fe → qa → qc | Next embed sweep wave |
| C-SWEEP | Residual Supabase on non-slice HRM pages (dashboard, `EmployeeContracts`, expiring-contracts) — do not claim full Command Center HRM GO | PM / TM | TM embed sweep checklist |
| C-STACK | Operator must keep pilot stack up; xbos restart discipline per `qc-local-pilot-20260522.md` | DevOps / PM | Before external demo |
| C-REGRESS | Any reopen of `54321` required fetch or `settings-catalogs` **409** on employees/contracts → immediate **NO-GO** downgrade | qa | Same-day retest |

**Not in scope for this GO:** VPS/production cutover, program NFR/metrics gate, full HRM iframe catalog (decisions, payroll embed, etc.).

### Handoff — qc → PM

- **ack_status:** `PASS_TO_PM`
- **gate_verdict:** `GO WITH CONDITIONS` (employees + contracts local pilot)
- **entry_criteria:** QA PASS `HRM-EMBED-CONTRACTS-01` + employees baseline on file
- **exit_criteria:** PM may schedule demo on approved routes; insurance requires new QA/QC cycle
- **evidence_path:** this file § Re-gate; `docs/qa/evidence/hrm-embed-contracts-fix-20260522.md`
- **needed_by:** PM stakeholder comms — approved routes only; insurance deferred
- **residual_risk:** Insurance and other HRM iframe views may still hit Supabase/409; empty UI risk remains on unverified routes

### Handoff — qc → technical-manager

- **ack_status:** `PASS_TO_PM` (advisory unchanged)
- **note:** Employees + contracts pattern (`hrmSpreadsheetScope`, API mode) is now evidenced; extend TM sweep to insurance and remaining `/command-center/hrm/:view` before broad “HRM embed ready” messaging.

### Upgrade trace

| Cycle | Verdict |
|-------|---------|
| 2026-05-22T16:00Z initial | **NO-GO** (contracts Supabase + 409) |
| 2026-05-22T17:30Z re-gate | **GO WITH CONDITIONS** (employees + contracts only; insurance deferred) |
