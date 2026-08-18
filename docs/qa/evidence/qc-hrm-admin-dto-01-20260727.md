# QC Gate — QC-HRM-ADMIN-DTO-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-ADMIN-DTO-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · GWC local · HOLD_DEPLOY |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — **G-ADM-DTO-01 CLOSED** (Plane B `company_id` TEXT slug + reset `user_id` UUID) |
| **scope_claim** | Contract / L1 ValidationPipe + jest DTO plane only — Admin FR-03/04/05 request DTOs |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no admin/membership write · no seed · no UF browser mutate claim |

---

## Scope (bounded — contract GWC)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Formal close **G-ADM-DTO-01** after BE + QA + QC spot | Browser UF mutate admin/membership |
| L1 ValidationPipe: slug `holding` accepted; email `user_id` rejected on reset | Phase 1 DONE / PROD-READY / `:8088` |
| jest hrm-admin **13/13** corroboration | Seed admin · wipe Auth · invent FR |
| Residuals G-ADM-01/03/04/SCOPE-01/05 stay **OPEN** | Reopen OpenAPI F.1 (`QC-HRM-OA-ADMIN-01` separate) |
| must_keep DTO TEXT ladder + UUID reset | Wipe must_keep DTO / unify Auth email `user_id` |

**Spec SoT:** `docs/hrm/API_DESIGN_HRM_ADMIN.md` §B/#2 · §C · §D · residual table §7 · FR-HRM-03..05.

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Formal GWC: **G-ADM-DTO-01 CLOSED** | **PASS** — BE CLOSED + QA PASS + QC L1/jest/DTO spot |
| 2 | Residual G-ADM-01/03/04/SCOPE-01/05 stay OPEN | **PASS** — listed OPEN below; not closed by this packet |
| 3 | Do NOT reopen OpenAPI F.1 wave | **PASS** — OpenAPI stays separate `QC-HRM-OA-ADMIN-01`; DTO wave does not reopen yaml |
| 4 | Evidence this path · PASS_TO_PM | **PASS** |
| 5 | Append bus handoff | **PASS** (same session) |
| 6 | HOLD_DEPLOY · NOT Phase1/PROD/:8088 | **PASS** |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/be-hrm-admin-dto-01-20260727.md` | DTO plane ADD | **READY_FOR_QA** | G-ADM-DTO-01 · jest 13/13 |
| `docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md` | L1 ValidationPipe + jest | **PASS** · PASS_TO_PM | slug holding + reset UUID |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` §B/#2 · §7 | Residual CLOSED cite | **CLOSED** `BE-HRM-ADMIN-DTO-01` | TEXT MaxLength(64) |
| Runtime DTO sources | `create-company-admin` / `invite-employees` / `reset-user-password` | **PASS** QC grep | `@IsString`/`@MaxLength(64)` · `@IsUUID` |

**must_keep:** Auth/Tenant JWT TEXT email `user_id` cite · Fleet/OP · soft U72 maps · HOLD_DEPLOY · U65 · OpenAPI admin F.1 separate lane.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin --no-coverage` | **PASS** exit **0** — Suites 3 · Tests **13/13** | PRODUCT (contract) |
| `GET http://127.0.0.1:28001/api/hrm/admin/companies` (no Bearer) | **401** — auth gate live | ENV/L0 |
| L1 `POST …/company-admin` `company_id=holding` valid shape | **401** Unauthorized (pipe accepted slug) | PRODUCT |
| L1 `POST …/company-admin` bad email + holding | **400** (email validation; no UUID-only `company_id`) | PRODUCT |
| L1 `POST …/reset-user-password` `user_id=ceo@xe.vn` | **400** | PRODUCT |
| L1 `POST …/reset-user-password` UUID shape | **401** (pipe accepted UUID) | PRODUCT |
| Grep DTO: `CreateCompanyAdminDto` / `InviteEmployeesDto` `company_id` `@IsString` `@MaxLength(64)` — not `@IsUUID` | **Present** | PRODUCT |
| Grep `ResetUserPasswordDto.user_id` `@IsUUID` | **Present** | PRODUCT |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md` | **FAIL** 3/8 (`portal_url`, `journey_l25`, `crud_or_matrix`) | PROCESS — contract/L1 QA pack (expected) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-admin-dto-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |

**Portal URL / PORTAL_DEV_URL:** N/A for contract/L1 DTO gate — no browser UF in slice (`PORTAL_DEV_URL` not required).

### Read-only module / contract matrix

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| CreateCompanyAdmin `company_id` TEXT slug | **PASS** pipe 401 | N/A | N/A | N/A | holding accepted |
| InviteEmployees `company_id` TEXT | **PASS** QA L1 + jest | N/A | N/A | N/A | ArrayMinSize kept |
| ResetUserPassword `user_id` UUID | N/A | N/A | **PASS** reject email / accept UUID | N/A | FR-05 plane |
| Admin UF browser mutate | — | **not claimed** | — | — | U65 · out of slice |
| OpenAPI `/admin/*` F.1 | — | separate WI | — | — | **QC-HRM-OA-ADMIN-01** — not reopened here |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| G-ADM-DTO-01 Plane B TEXT + reset UUID | PRODUCT | **PASS** — CLOSED |
| jest hrm-admin 13/13 | PRODUCT | **PASS** (QC re-run 2026-07-27) |
| L1 ValidationPipe holding / email reject | PRODUCT | **PASS** (QC spot) |
| QA pack 3/8 missing portal/J-*/matrix wording | PROCESS | **OPEN P3** — expected contract pack; QC pack 8/8 |
| XBOS login `:28002` DOWN (QA note) | ENV | **NON-BLOCKING** — L1 uses unauthenticated ValidationPipe path; no mutate |
| Seed / FE mutate / Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Admin UF / membership browser journey | **N/A** this packet | Contract/L1 DTO wave — L2.5 browser **not in entry criteria** |
| J-* HRM admin mutate | **not claimed** | Contract PASS ≠ UF browser PASS (U65) |
| G-ADM-DTO-01 ValidationPipe plane | **PASS** | L1 + jest + API_DESIGN CLOSED |

**QC:** No L2.5 product NO-GO — browser journey coverage **out of scope** for this contract GWC. Do **not** promote admin UF mutate from this evidence.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **G-ADM-01** | P2 | **OPEN** | `dev-be` — Audit log FR-05 |
| **G-ADM-03** | P2 | **OPEN** | `ba` / `dev-be` — Conflict vs upsert FR-02 |
| **G-ADM-04** | P2 | **OPEN** | `dev-be` — Invite temp password channel |
| **G-ADM-SCOPE-01** | P2 | **OPEN** | `dev-be` — Narrower-than-platform scope |
| **G-ADM-05** | P2 | **OPEN** | `dev-be` — Reset missing user → 404 |
| ~~**G-ADM-DTO-01**~~ | — | **CLOSED** | This GWC · BE-HRM-ADMIN-DTO-01 + QA + QC |
| OpenAPI admin F.1 | — | **Separate** | `QC-HRM-OA-ADMIN-01` — **do not reopen** from this DTO packet |
| **C-ADM-DTO-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future contract packs for Layer B 8/8 |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** Soft residual **G-ADM-DTO-01** — Admin request DTO plane: `company_id` TEXT `@IsString` `@MaxLength(64)` (accepts Plane B slug `holding`); FR-05 `user_id` remains `@IsUUID`; QA L1 + jest 13/13 + QC independent spot; API_DESIGN §B/#2 · §7 CLOSED cite intact; Auth/Tenant must_keep preserved; U65 no seed.
- **Conditions:** HOLD_DEPLOY; residuals **G-ADM-01 / G-ADM-03 / G-ADM-04 / G-ADM-SCOPE-01 / G-ADM-05** remain **OPEN**; OpenAPI F.1 stays on **QC-HRM-OA-ADMIN-01** (not reopened); **NOT** Phase 1 DONE; **NOT** PROD-READY; **NOT** `:8088`.
- **cấm honored:** no seed · no invent FR · no Phase1/PROD/:8088 · no wipe must_keep DTO · no OpenAPI F.1 reopen.

---

## Handoff

### completion_report

**Closed:** QC contract gate **GO WITH CONDITIONS** for `QC-HRM-ADMIN-DTO-01`. Independent audit confirms **G-ADM-DTO-01 CLOSED**: BE DTO plane + QA L1 ValidationPipe (slug `holding` → 401 not UUID-400; email `user_id` → 400) + QC re-run jest **13/13** + live L1 spot + DTO source grep; API_DESIGN residual CLOSED cite; must_keep Auth plane + U65 + HOLD_DEPLOY. QC evidence-pack **8/8**. Residuals G-ADM-01/03/04/SCOPE-01/05 stay OPEN. OpenAPI F.1 **not** reopened (separate `QC-HRM-OA-ADMIN-01`). **No seed · NOT Phase1/PROD/:8088.**

**Residual:** G-ADM-01/03/04/SCOPE-01/05 P2 OPEN; C-ADM-DTO-QA-PACK-01 P3 PROCESS; no product P0/P1 for DTO plane.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-ADMIN-DTO-01
from_role: qc
to_role: pm
lane: governance intake · Admin DTO residual close
priority: P2

entry_criteria:
- QC-HRM-ADMIN-DTO-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-admin-dto-01-20260727.md
- QA PASS: docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md
- BE: docs/qa/evidence/be-hrm-admin-dto-01-20260727.md

action:
1. Bus INTAKE: mark G-ADM-DTO-01 QC-verified CLOSED (product contract/L1)
2. Keep residual G-ADM-01 / G-ADM-03 / G-ADM-04 / G-ADM-SCOPE-01 / G-ADM-05 OPEN (P2) — do not claim closed
3. Continue QC-HRM-OA-ADMIN-01 OpenAPI F.1 GWC as separate lane (already DISPATCHED) — do not reopen DTO
4. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
5. Optional later: P2 backlog for G-ADM-01/03/04 when capacity — not blocking DTO close
cấm: seed admin · invent FR · Phase1/PROD/:8088 · wipe must_keep DTO · reopen G-ADM-DTO-01 without FAIL
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-admin-dto-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — GWC closes G-ADM-DTO-01 only; residual G-ADM-01/03/04/SCOPE-01/05 stay OPEN; OpenAPI = QC-HRM-OA-ADMIN-01 separate; HOLD_DEPLOY · NOT Phase1/PROD/:8088.
