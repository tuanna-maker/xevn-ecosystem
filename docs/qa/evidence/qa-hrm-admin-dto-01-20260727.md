# QA-HRM-ADMIN-DTO-01 — G-ADM-DTO-01 contract / L1

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ADMIN-DTO-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 contract/L1 (no seed · HOLD_DEPLOY) |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `docs/qa/evidence/be-hrm-admin-dto-01-20260727.md` READY_FOR_QA |
| **spec_ref** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` §B/#2 · §C · §D · residual G-ADM-DTO-01 **CLOSED** |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| DTO plane: `company_id` TEXT slug (`holding`) on CreateCompanyAdmin / InviteEmployees | Browser UF mutate admin/membership |
| `reset-user-password` rejects non-UUID `user_id` | Seed admin · wipe Auth · invent staging |
| Jest corroboration + live ValidationPipe on `:28001` | Phase1 / PROD claim · OpenAPI admin deepen |

---

## 2. Environment

| Item | Result |
|------|--------|
| Workspace | `C:\xevn-ecosystem` |
| hrm-api | `:28001` up — `GET /api/hrm/admin/companies` → **401** (auth gate live) |
| XBOS login `:28002` | **DOWN / 404** — no Bearer; L1 uses unauthenticated ValidationPipe path only |
| Seed | **none** |
| Mutate admin data | **none** (valid-shape posts stop at **401** before service write) |

---

## 3. Unit corroboration

```text
pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin --no-coverage
→ Test Suites: 3 passed · Tests: 13 passed · exit 0
```

DTO source check (runtime files):

| DTO | Field | Decorators | Verdict |
|-----|-------|------------|---------|
| `CreateCompanyAdminDto` | `company_id` | `@IsString` `@IsNotEmpty` `@MaxLength(64)` — **not** `@IsUUID` | PASS |
| `InviteEmployeesDto` | `company_id` | same TEXT ladder | PASS |
| `ResetUserPasswordDto` | `user_id` | `@IsUUID` (HRM profiles plane) | PASS |

API_DESIGN §B step 2 cites **G-ADM-DTO-01 CLOSED** `BE-HRM-ADMIN-DTO-01` — confirmed in doc.

---

## 4. L1 live ValidationPipe (`POST http://127.0.0.1:28001/api/hrm/...`)

No Authorization header. Expectation: invalid DTO → **400**; valid DTO shape (incl. slug) → past pipe → service auth → **401** (not UUID 400).

| Case | Body highlight | HTTP | Message (excerpt) | Verdict |
|------|----------------|------|-------------------|---------|
| CreateCompanyAdmin + `company_id=holding` valid shape | email+password+holding | **401** | `Unauthorized` | **PASS** — slug accepted (not UUID-only 400) |
| CreateCompanyAdmin + holding + bad email | `email=not-an-email`, `company_id=holding` | **400** | `email must be an email` | **PASS** — no `company_id` UUID complaint |
| CreateCompanyAdmin empty `company_id` | `company_id=""` | **400** | `company_id should not be empty` | **PASS** |
| InviteEmployees + holding + `employees=[]` | | **400** | `employees must contain at least 1 elements` | **PASS** (ArrayMinSize · FR-04) |
| InviteEmployees + holding + 1 row | | **401** | `Unauthorized` | **PASS** — slug accepted |
| ResetUserPassword `user_id=ceo@xe.vn` | email TEXT | **400** | `user_id must be a UUID` | **PASS** |
| ResetUserPassword UUID shape | `11111111-1111-4111-8111-111111111111` | **401** | `Unauthorized` | **PASS** — UUID accepted by pipe |

**Exit criteria map**

1. CreateCompanyAdmin / InviteEmployees accept `company_id=holding` — **PASS** (L1 401 after pipe + jest).
2. reset-user-password rejects non-UUID `user_id` — **PASS** (L1 400 `user_id must be a UUID` + jest).

---

## 5. Residual (still open — not this wave)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **G-ADM-01** | P2 | `dev-be` | Audit log FR-05 |
| **G-ADM-03** | P2 | `ba` / `dev-be` | Conflict vs upsert FR-02 |
| **G-ADM-04** | P2 | `dev-be` | Invite temp password channel |
| G-ADM-SCOPE-01 | P2 | `dev-be` | Narrower-than-platform scope |
| G-ADM-05 | P2 | `dev-be` | Reset missing user → 404 |
| OpenAPI `/admin/*` | P2 | `dev-be` | `BE-HRM-OA-ADMIN-01` in flight |

~~G-ADM-DTO-01~~ — **CLOSED** (BE + QA verified this evidence).

---

## 6. Handoff

### completion_report

**Closed:** QA-HRM-ADMIN-DTO-01 — G-ADM-DTO-01 QA-verified. Live ValidationPipe on `:28001` accepts Plane B slug `holding` on `POST /admin/company-admin` and `POST /admin/invite-employee` (401 auth, not 400 UUID). `POST /admin/reset-user-password` with email `user_id` → **400** `user_id must be a UUID`. Jest hrm-admin **13/13**. API_DESIGN §B/§C CLOSED cite confirmed. U65: no seed, no membership write, HOLD_DEPLOY.

**Residual:** G-ADM-01 / G-ADM-03 / G-ADM-04 (and SCOPE-01 / G-ADM-05 / OpenAPI admin) remain open — not blocking DTO plane.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QA-HRM-ADMIN-DTO-01
role: pm
lane: governance intake
read_first:
  - docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md
  - docs/hrm/API_DESIGN_HRM_ADMIN.md residual table
action:
  1) Mark G-ADM-DTO-01 QA-verified CLOSED on bus / matrix note
  2) Keep residual G-ADM-01 / G-ADM-03 / G-ADM-04 open (P2) — do not claim Phase1/PROD
  3) Continue BE-HRM-OA-ADMIN-01 OpenAPI deepen when READY_FOR_QA → QA spot
cấm: seed admin · wipe Auth · invent staging · HOLD_DEPLOY
```

### evidence_path

`docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

G-ADM-DTO-01 QA CLOSED · residual G-ADM-01/03/04 stay P2 · optional QC contract spot if wave needs formal GWC · HOLD_DEPLOY
