# BE-HRM-G-AT10-01-SCOPE-SLUG-01 — Leave `company_id` slug/TEXT ladder

| Field | Value |
|-------|-------|
| **work_item_id** | `BE-HRM-G-AT10-01-SCOPE-SLUG-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P1 |
| **date** | 2026-07-21 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **spec_ref** | khách `SRS_HRM_KHACH.md` §3.5 **FR-HRM-AT-10** · TechSpec §14.5 · §14.9 **G-AT10-01** |
| **entry** | TM GWC `tm-hrm-code-spec-convention-01-20260721.md` · TechSpec §14.9 |

---

## spec_read_ack

| Artifact | Sections |
|----------|----------|
| **srs (khách)** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.5 **FR-HRM-AT-10** / HRM-AT-10 |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §14.5 FR-HRM-AT-10 · §14.9 **G-AT10-01** |
| **tm** | `docs/qa/evidence/tm-hrm-code-spec-convention-01-20260721.md` — leave `@IsUUID` + `::uuid` skew vs TEXT/slug ladder |
| **sponsor_confirm** | PM dispatch `BE-HRM-G-AT10-01-SCOPE-SLUG-01` (U69 narrow) |
| **change_mode** | ADD |
| **must_keep** | leave-workflow bridge / terminal callback; attachment_url path; **không** G-AT10-02 overlap/balance; **cấm** attendance sheet weekly RQ |
| **forbidden** | seed U65 · Phase1/PROD claim · sheet RQ change |

**spec says / code did (before):** `CreateLeaveRequestDto.company_id` `@IsUUID` + INSERT `$n::uuid` — slug `holding`/`main` rejected or mis-scoped.  
**after:** `@IsString` `@MaxLength(64)` + `resolveHrmPersistCompanyIdText` + INSERT `$2::text`; schema `company_id TEXT` + ALTER UUID→TEXT; list uses workforce scope (no `lr.company_id = $n::uuid`).

---

## Implementation

| Layer | Change |
|-------|--------|
| DTO create | `company_id` `@IsString()` `@MaxLength(64)` — parity requisition/OT; `@CODE-MEMORY` G-AT10-01 |
| DTO list | already `@IsString` `@MaxLength(64)` — no `@IsUUID` on company_id |
| Service create | `resolveHrmPersistCompanyIdText` → INSERT `$2::text` |
| Service schema | `CREATE … company_id TEXT` + `ALTER COLUMN company_id TYPE TEXT USING company_id::text` |
| Service list | `normalizePayrollListCompanyId` + `resolveHrmListScope` + `pushWorkforceEmployeeScopeFilter` (no company `::uuid`) |
| Tests | create `main`→`holding` TEXT; holding slug bind; DTO validate slug; list no `::uuid` (existing D-MOB-PARITY) |

**Not touched:** G-AT10-02 overlap/balance; attendance sheet weekly RQ; leave-workflow bridge logic beyond `companySlug` pass-through.

---

## Verification

```text
pnpm --filter hrm-api exec jest --testPathPatterns="leave-requests.service.spec|leave-workflow.bridge.spec" --no-coverage
→ Test Suites: 2 passed, 2 total
→ Tests:       21 passed, 21 total
```

| Assertion | Result |
|-----------|--------|
| DTO accepts `holding` / `main` / `du-lich` | PASS |
| List query DTO accepts `holding` | PASS |
| create `company_id=main` + group_ceo JWT → persist `holding` + `$2::text` | PASS |
| create `company_id=holding` → params[1]=`holding` | PASS |
| list holding / main / UUID normalize — no `lr.company_id=$n::uuid` | PASS (existing + G-DB-03) |
| leave-workflow.bridge.spec | 6/6 PASS (must_keep) |

---

## completion_report

**Closed:** G-AT10-01 — leave create/list accept `company_id` slug ladder (parity OT/requisition); TEXT persist + jest; CODE-MEMORY + spec_read_ack.

**Residual (out of this narrow):** G-AT10-02 overlap/balance reject; G-AT10-03 dates `@IsDateString`; G-DB-03 already covered by sibling wave.

---

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **evidence_path:** `docs/qa/evidence/be-hrm-g-at10-01-scope-slug-01-20260721.md`
- **pm_dispatch_hint:** `QA-HRM-G-AT10-01` — browser U65: create leave with OU slug `holding`/`main` (not UUID-only); list after 2xx + F5; no seed; must_keep sheet AC-ATT-SHEET; do **not** promote Phase1/PROD.

### next_dispatch_prompt

```text
work_item_id: QA-HRM-G-AT10-01
from_role: pm
to_role: qa
lane: execution
priority: P1
entry: BE READY_FOR_QA docs/qa/evidence/be-hrm-g-at10-01-scope-slug-01-20260721.md · TechSpec §14.5/§14.9 G-AT10-01
exit: Browser U65 — login → Chấm công → Đơn nghỉ → Tạo với company_id slug (holding hoặc main OU); Network POST 201 HRM-LEAVE-201; list row; F5 còn; evidence docs/qa/evidence/qa-hrm-g-at10-01-20260721.md; PASS_TO_PM
cấm: seed · API-only PASS · Phase1/PROD · đụng attendance sheet weekly RQ
UF/J: UF leave create · J-HRM leave path if mapped
```
