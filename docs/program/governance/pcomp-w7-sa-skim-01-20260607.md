# PCOMP-W7-SA-SKIM-01 — Mobile W7 architecture skim (governance)

| Field | Value |
|-------|--------|
| **work_item_id** | `PCOMP-W7-SA-SKIM-01` |
| **from_role** | sa |
| **to_role** | pm → dev-be (W7-1 first) |
| **lane** | governance |
| **date** | 2026-06-07 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **effort** | Readonly skim ≤0.5d |

---

## 1. Inputs reviewed

| Artifact | Verdict |
|----------|---------|
| `docs/hrm/MOBILE_W7_SRS_DELTA.md` | PASS — measurable AC, BR tables, scope rows cite `resolveHrmListScope` |
| `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` | PASS with **2 reconciliations** (see §4) |
| `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md` | PASS — SoT for field semantics; preferred over TechSpec where conflict |
| `docs/program/governance/pcomp-w7-ba-data-01-20260607.md` | PASS — residual IDs map to waves |

---

## 2. Baseline code audit (2026-06-07)

### 2.1 Implemented (W7-0) — scope OK

| Surface | Resolver evidence | Parity |
|---------|-------------------|--------|
| `GET /home/summary` entry | `home.service.ts` L134 `resolveHrmListScope` | Y |
| Viewer load | L193–210 `resolveHrmListScope` + `pushWorkforceEmployeeScopeFilter` + `assertResourceInHrmScope` | Y |
| DOB privacy 04a | `is_birthday_today` only; spec `home.service.spec.ts` forbids `birth_year` / `date_of_birth` in JSON | Y |
| `PATCH /employees/:id` avatar | `employees.service.ts` — same scope as GET | Y (per `PHASE1_SCOPE_PARITY_AUDIT.md` §3.1) |
| Leave list (whos_out precursor) | `leave-requests.service.ts` L118–126 `resolveHrmListScope` + `pushWorkforceEmployeeScopeFilter` | Y for list |

**Note:** `celebrations` / `whos_out` return **empty stubs** (L140–141, L180–181) — scope gate is present; population is W7-1 Dev-BE work, not an architecture gap.

### 2.2 Planned — not in repo (expected)

| Surface | Repo grep | SA gate |
|---------|-----------|---------|
| `GET /attendance/leave-balance` | Not found | ADR D-W7-02 |
| `view=directory` | Not found | ADR D-W7-03 |
| `leave_requests.attachment_url` | Not found | ADR D-W7-01 |
| `covering_date` on leave list | Not found | Required for whos_out BR-WHO-02 |
| `GET /attendance/leave-requests/:id` | Not found | GWC residual J-MOB-09 |

---

## 3. Scope parity checklist (W7 surfaces)

Mandatory stack per `MOBILE_W7_TECHSPEC_DELTA.md` §6 and ADR-HRM-RBAC §3:

```text
resolveScopeContext (HTTP) → resolveHrmListScope → pushWorkforceEmployeeScopeFilter | pushEmployeeListScopeFilters
→ assertResourceInHrmScope (mutate / row peek)
```

| W7 surface | List / aggregate | Detail / self | Parity verdict | Owner wave |
|------------|------------------|---------------|----------------|------------|
| **celebrations** | Employee SQL in scope (planned) | N/A | **SPEC OK** — implement with same filters as `loadViewer` + active/archived rules | W7-1 |
| **whos_out** | Reuse scoped leave list + `covering_date` | Leave detail nav | **SPEC OK** — list scoped today; add `:id` GET or GWC | W7-1 |
| **directory** | `GET /employees?view=directory` | `GET /employees/:id?view=directory` | **SPEC OK** — single resolver path (ADR D-W7-03) | W7-5 |
| **leave-balance** | N/A | Self `employee_id` assert | **SPEC OK** — no list/detail split | W7-4 |

**Group CEO `company_id=main`:** All planned queries must use rollup `companyIds` from `resolveHrmListScope` — **no** `company_id = 'main'` literal on operational tables (ADR-GROUP-CEO).

---

## 4. BA vs TechSpec reconciliations (SA binding)

| Topic | TechSpec delta | BA data contracts | **SA decision** |
|-------|----------------|-------------------|-----------------|
| Leave attachment | `attachment_urls[]` JSON on POST | `attachment_url` TEXT column | **Single column** Phase 1 — ADR D-W7-01 |
| Directory route | `GET /employees/directory` | `GET /employees?view=directory` | **`view=directory`** on existing routes — ADR D-W7-03 |
| Leave balance code | `HRM-ATT-BAL-200` | `HRM-LEAVE-BAL-200` | Use **`HRM-LEAVE-BAL-200`** (align BA + data contracts) |

Dev-BE bus entries must cite ADR + data contracts, not superseded TechSpec alternatives.

---

## 5. ADR delta

**Created:** `docs/decisions/ADR-HRM-MOBILE-W7-DATA-EXTENSIONS.md` (stub → **Accepted** for W7-3..W7-5)

Covers: attachment column, balance table + endpoint, directory projection strategy, celebrations/whos_out scope invariants.

**Not required:** New ADR for celebrations/whos_out (no new tables/endpoints beyond existing home + leave list).

---

## 6. Architecture risks and mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| TechSpec `attachment_urls[]` implemented while BA expects column | P1 | PM dispatch cites ADR D-W7-01 in `PCOMP-W7-BE-LEAVE-DOC` |
| Directory leaks `date_of_birth` via `custom_fields` | P0 privacy | Server-side projection strip; QA grep BR-BDAY-01 |
| whos_out without `covering_date` → client date filter drift | P1 | Add query param on leave list before mobile 04b |
| Leave balance mock zeros without `source` field | P2 | BA `VAL-W7-LBAL-03` — return explicit `source: "default"` |
| Duplicate `/employees/directory` route | P2 | Rejected by ADR — code review gate |

---

## 7. Journey / test hooks (PM → QA)

| Journey | Scope probe |
|---------|-------------|
| J-MOB-08 | Celebrations under `main`; JSON grep no DOB |
| J-MOB-09 | whos_out item → detail; scope on leave id |
| J-MOB-11 | attachment URL path under `/api/hrm/files/{scope}/` |
| J-MOB-16 | Directory list→detail same id under rollup |
| J-MOB-04 ext | Balance self-only 403 on foreign employee_id |

---

## 8. Residual (not blocking SA PASS)

| ID | Item | Owner |
|----|------|-------|
| R-SA-W7-01 | Merge SRS delta §4 into `SRS_MOBILE.md` after first Dev wave | ba-process / PM |
| R-SA-W7-02 | `PROGRAM_JOURNEY_MAP.md` J-MOB-11/12/13/16 rows | PM |
| R-SA-W7-03 | OpenAPI sync for new query params (`view`, `covering_date`, balance GET) | dev-be |
| R-SA-W7-04 | Scoped `GET leave-requests/:id` for J-MOB-09 hardening | dev-be (GWC if deferred) |
| R-SA-W7-05 | TechSpec §3.7 `/employees/directory` — mark superseded by ADR in next BA delta | ba-process |

---

## 9. SA verdict

**PASS_TO_PM** — BA pack is implementation-ready. Scope parity rules are explicit and align with closed Phase 1 register (`PHASE1_SCOPE_PARITY_AUDIT.md` PASS). W7 new surfaces must extend **existing** `resolveHrmListScope` paths per ADR stub; no `apps/**` edits in this work item.

**TM/QC note:** Block GO on W7-1 if populated celebrations JSON contains `date_of_birth` / `birth_year`; block W7-5 if directory returns raw `custom_fields`.

---

## 10. Completion contract

```yaml
completion_report: |
  Closed: Readonly SA skim of MOBILE_W7 SRS/TechSpec/Data contracts; verified W7-0 baseline
  (home/summary scope, viewer assert, DOB privacy spec); scope parity checklist for celebrations,
  whos_out, directory, leave-balance; reconciled TechSpec vs BA (attachment column, view=directory,
  error code); published ADR-HRM-MOBILE-W7-DATA-EXTENSIONS stub.
  Residual: leave GET-by-id for J-MOB-09; OpenAPI sync; SRS merge; journey map rows (PM).

next_owner: pm

next_dispatch_prompt: |
  work_item_id: PCOMP-W7-BE-04b-01
  from_role: pm
  to_role: dev-be
  lane: execution
  entry_criteria: SA PASS PCOMP-W7-SA-SKIM-01; ADR docs/decisions/ADR-HRM-MOBILE-W7-DATA-EXTENSIONS.md D-W7-04;
    MOBILE_W7_TECHSPEC_DELTA.md §3.4; MOBILE_W7_SRS_DELTA.md §4.1.
  exit_criteria: Populate home/summary celebrations + whos_out when include=celebrations,whos_out;
    celebrations SQL uses resolveHrmListScope + pushWorkforceEmployeeScopeFilter (same as loadViewer);
    whos_out via scoped leave list with covering_date= today Asia/Ho_Chi_Minh, status=approved only;
    no birth_year/date_of_birth in response; extend home.service.spec.ts; ack_status READY_FOR_QA.
  evidence_path: docs/qa/evidence/pcomp-w7-be-04b-20260607.md
  spec_ref: ADR-HRM-MOBILE-W7-DATA-EXTENSIONS D-W7-04, BR-BDAY-02, BR-WHO-01/02

evidence_path: docs/program/governance/pcomp-w7-sa-skim-01-20260607.md
ack_status: PASS_TO_PM
```
