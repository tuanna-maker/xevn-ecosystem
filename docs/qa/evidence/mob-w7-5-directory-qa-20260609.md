# MOB-W7-5-DIRECTORY-QA — Employee directory API validation

| Field | Value |
|-------|-------|
| **work_item_id** | MOB-W7-5-DIRECTORY-QA |
| **from_role** | qa |
| **to_role** | pm |
| **journey** | J-MOB-30 (API layer — device L2.5 deferred nip.io deploy) |
| **spec_ref** | `MOBILE_W7_DATA_CONTRACTS.md` §5 · `mob-w7-5-directory-be-20260609.md` |
| **environment** | Local `http://127.0.0.1:28001` (hrm-api up, port in use) |
| **date** | 2026-06-09 |
| **ack_status** | **PASS_TO_PM** |

---

## Summary

Directory API (`GET /employees?view=directory` + get-by-id) **PASS** on local hrm-api for VAL-W7-DIR-01/02/03, `attendance_today` badge shape, forbidden-field exclusion, and `keyword` alias. Jest employees module **37/37 PASS**. nip.io pilot **not yet deployed** (HRM-VAL-001) — GWC for device J-MOB-30 until devops deploy.

---

## L0 / automation

| Check | Result |
|-------|--------|
| `pnpm --filter hrm-api exec jest` employee-directory + employees service/controller | **37/37 PASS** |
| hrm-api `:28001` reachable | **PASS** (404 on `/health` route only; API responds) |

---

## VAL-W7-DIR-01 — List→detail scope parity

### Holding (`company_id=holding`, internal key)

| Step | HTTP | Code | Notes |
|------|------|------|-------|
| List `view=directory&include_attendance_today=true` | 200 | HRM-EMP-DIR-200 | total=**213**, sample=10 |
| Detail first row `6b887b08-5236-4d9c-8d57-f02e95ad93ed` | 200 | HRM-EMP-200 | `manager_id` + `phone_number` present |

### Group CEO rollup (`company_id=main`, `x-company-id: main`)

| Step | HTTP | Code | Notes |
|------|------|------|-------|
| List | 200 | HRM-EMP-DIR-200 | total=**1041** |
| Detail first row `a20d0858-57f9-4ed6-8c6f-8027c79bfe0e` | 200 | HRM-EMP-200 | scope parity OK (main sees holding member) |

### Mobile member slug (`uat.nv0002@xe.vn`, employee-only)

| Step | HTTP | Code | Notes |
|------|------|------|-------|
| List `company_id=trsport` (slug, not UUID) | 200 | HRM-EMP-DIR-200 | total=**207** |
| Detail colleague | 200 | HRM-EMP-200 | list→detail parity **PASS** |

> **Note:** Same persona with `company_id={company_uuid}` returns total=0 — mobile must use **operating-unit slug** (`trsport`) per active membership, consistent with other ESS probes.

---

## VAL-W7-DIR-02 — `q` search

| Query | HTTP | Code | total |
|-------|------|------|-------|
| `company_id=main&q=Nguyen&include_attendance_today=true` | 200 | HRM-EMP-DIR-200 | **91** |
| `company_id=holding&keyword=HLD` (alias) | 200 | HRM-EMP-DIR-200 | **188** |

---

## VAL-W7-DIR-03 — Email mask (non-HR)

| Persona | Colleague detail | email field | Verdict |
|---------|------------------|-------------|---------|
| `uat.nv0002@xe.vn` (roles: `employee` only) | 200 HRM-EMP-200 | `u***@xe.vn` | **MASK PASS** |
| `uat.nv0001@xe.vn` (hr_manager+manager) | N/A list scope | — | HR plaintext expected by policy |
| Internal key (no Bearer) | 200 | full email | Expected (no JWT → HR path) |

Unit: `employee-directory.spec.ts` — `mapDirectoryDetail masks email for non-HR` **PASS**.

---

## attendance_today badge + filter

List row shape (holding, `include_attendance_today=true`):

```json
"attendance_today": {
  "checked_in": false,
  "check_in_at": null,
  "status": null
}
```

| Filter | rows returned | invariant |
|--------|---------------|-----------|
| `all` | 50 | — |
| `checked_in` | 0 | all `checked_in===true` (vacuous) |
| `not_checked_in` | 50 | all `checked_in===false` |

---

## Forbidden fields (list + detail JSON)

| Field | List holding (10 rows) | Detail holding | Detail employee mask |
|-------|------------------------|----------------|----------------------|
| `custom_fields` | absent | absent | absent |
| `date_of_birth` | absent | absent | absent |
| `email` on list | absent | N/A | masked on detail only |

`JSON.stringify` grep on list responses: **no** `custom_fields` / `date_of_birth` keys.

---

## nip.io pilot (residual — not blocking API QA)

```bash
HRM_API_BASE_URL=https://14-225-217-232.nip.io node scripts/tmp-mob-w7-5-directory-probe.mjs
# → FAIL HRM-VAL-001 "property view should not exist; property include_attendance_today should not exist"
```

Matches BE handoff pre-deploy state. **Device J-MOB-30** retest on nip.io after `devops` deploy.

---

## Verdict matrix

| ID | Result |
|----|--------|
| VAL-W7-DIR-01 | **PASS** (holding + main + mobile slug) |
| VAL-W7-DIR-02 | **PASS** (`q` + `keyword`) |
| VAL-W7-DIR-03 | **PASS** (employee-only runtime + jest) |
| attendance_today | **PASS** |
| no custom_fields / DOB in JSON | **PASS** |
| Jest regression | **PASS** 37/37 |

**ack_status: PASS_TO_PM**

---

## Residual / PM dispatch

| ID | Owner | Trigger |
|----|-------|---------|
| nip.io deploy `view=directory` | devops | Device MOB-UX-08 / J-MOB-30 L2.5 on pilot |
| Directory list empty when `company_id=uuid` vs slug | dev-mobile | Confirm client uses slug from membership (MOB-UX-08) |

---

## Handoff

```yaml
completion_report: |
  MOB-W7-5-DIRECTORY-QA closed on local :28001. VAL-W7-DIR-01 list→detail parity PASS for holding,
  main rollup, and uat.nv0002@xe.vn (trsport slug). VAL-W7-DIR-02 q/keyword search PASS.
  VAL-W7-DIR-03 non-HR email mask PASS (u***@xe.vn). attendance_today badge + filters PASS.
  No custom_fields/date_of_birth in directory JSON. Jest 37/37 PASS.
  Residual: nip.io HRM-VAL-001 until devops deploy — GWC for device J-MOB-30 only.

next_owner: pm

next_dispatch_prompt: |
  work_item_id: MOB-W7-5-DIRECTORY-DEPLOY
  from_role: pm
  to_role: devops
  lane: execution
  entry_criteria: MOB-W7-5-DIRECTORY-QA PASS_TO_PM local; nip.io probe HRM-VAL-001
  action: Deploy hrm-api delta with view=directory DTO to https://14-225-217-232.nip.io; re-run
    scripts/tmp-mob-w7-5-directory-probe.mjs exit 0; then dispatch qa-device or qa for J-MOB-30
    team tab L2.5 on pilot with uat.nv0002@xe.vn (trsport slug)
  exit_criteria: nip.io probe PASS; evidence docs/qa/evidence/mob-w7-5-directory-nipio-YYYYMMDD.md

evidence_path: docs/qa/evidence/mob-w7-5-directory-qa-20260609.md
ack_status: PASS_TO_PM
```
