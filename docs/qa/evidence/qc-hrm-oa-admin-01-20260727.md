# QC Gate — QC-HRM-OA-ADMIN-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-OA-ADMIN-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · GWC local · HOLD_DEPLOY |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — OpenAPI admin F.1 **CLOSED** (`BE-HRM-OA-ADMIN-01` + QA spot) |
| **scope_claim** | Yaml/OpenAPI contract only: `hrm-api.yaml` **1.3.5-admin-f1** · 4× `POST /admin/*` vs `API_DESIGN_HRM_ADMIN.md` §A–D |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — contract-only; no seed · no live admin mutate · no UF admin claim |

---

## Scope (bounded — contract GWC)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Formal close **OpenAPI admin paths** F.1 residual | Live admin mutate / invite seed / browser UF |
| Confirm **G-ADM-DTO-01** remains **CLOSED** (no reopen/wipe) | Phase 1 DONE / PROD-READY / `:8088` |
| QC re-run `verify:openapi-hrm-p1-s3b` **85 EXIT 0** | Invent FR · §E supporting membership OpenAPI DONE |
| Explicit residual G-ADM-01/03/04/SCOPE-01/05 **OPEN** | Claim UF admin mutate PASS from yaml |

**Spec SoT:** `docs/hrm/API_DESIGN_HRM_ADMIN.md` §A–D · §7 · `docs/api/openapi/hrm-api.yaml` **1.3.5-admin-f1** · FR-HRM-02..05 · HRM-ADMIN-201..204.

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Formal GWC: OpenAPI admin F.1 CLOSED (BE + QA spot) | **PASS** — §Spot + API_DESIGN §7 ~~OpenAPI admin paths~~ CLOSED |
| 2 | G-ADM-DTO-01 remains CLOSED (no reopen) | **PASS** — DTO `@IsString`/`@MaxLength(64)` + OA must_keep + API_DESIGN residual |
| 3 | Residual G-ADM-01/03/04/SCOPE-01/05 stay OPEN | **PASS** — §Residual |
| 4 | Evidence this path · PASS_TO_PM | **PASS** |
| 5 | Append bus handoff | **PASS** (same session) |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/be-hrm-oa-admin-01-20260727.md` | OpenAPI F.1 deepen | **READY_FOR_QA** | 4 paths + schemas · verify 85 · CODE-MEMORY APPEND |
| `docs/qa/evidence/qa-hrm-oa-admin-01-20260727.md` | Contract spot | **PASS** · PASS_TO_PM | F.1 §A–D audit · G-ADM-DTO-01 no regression |
| `docs/qa/evidence/qa-hrm-admin-dto-01-20260727.md` | Prior DTO | **CLOSED** retained | G-ADM-DTO-01 — **not** reopened this wave |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` §7 | Residual table | **OpenAPI CLOSED** · DTO CLOSED · P2 OPEN | Matches exit |
| `docs/api/openapi/hrm-api.yaml` | version 1.3.5-admin-f1 | **PASS** | Mục đích · Nghiệp vụ · Bước SRS ×4 |

**must_keep:** G-ADM-DTO-01 CLOSED DTO plane · Auth/Tenant JWT cite · U65 · HOLD_DEPLOY · no invent FR · no wipe DTO.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** exit **0** — **85** checks (QC re-run 2026-07-27) | PRODUCT (contract) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-oa-admin-01-20260727.md` | **FAIL** 2/8 (`portal_url`, `journey_l25`) | PROCESS — yaml-only QA pack (expected) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-oa-admin-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |
| Grep spot `/admin/platform-admin` · `company-admin` · `invite-employee` · `reset-user-password` · `HRM-ADMIN-201..204` · `Mục đích`/`Nghiệp vụ`/`Bước SRS` · `company_id: holding` · `G-ADM-DTO-01 CLOSED` | **Present** in `hrm-api.yaml` **1.3.5-admin-f1** | PRODUCT |
| DTO spot `CreateCompanyAdminDto` / `InviteEmployeesDto` `@IsString` `@MaxLength(64)`; `ResetUserPasswordDto` `@IsUUID` | **Present** — G-ADM-DTO-01 not wiped | PRODUCT |

**Portal URL / PORTAL_DEV_URL:** N/A for yaml-only OpenAPI admin F.1 gate — no browser UF in slice (`PORTAL_DEV_URL` not required).

### OpenAPI F.1 / API_DESIGN spot (independent)

| Path | opId | Code | F.1 (Mục đích · Nghiệp vụ · Bước SRS) | API_DESIGN | Verdict |
|------|------|------|----------------------------------------|------------|---------|
| `POST /admin/platform-admin` | `adminCreatePlatformAdmin` | `HRM-ADMIN-201` | FR-HRM-02 #1/#3/#6/#8 · §3.24 | **A** | **PASS** |
| `POST /admin/company-admin` | `adminCreateCompanyAdmin` | `HRM-ADMIN-202` | FR-HRM-03 #1/#2/#4/#6/#8 · §3.25 · `company_id: holding` | **B** | **PASS** |
| `POST /admin/invite-employee` | `adminInviteEmployees` | `HRM-ADMIN-203` | FR-HRM-04 #1–#4/#6–#8 · §3.26 · `company_id: holding` | **C** | **PASS** |
| `POST /admin/reset-user-password` | `adminResetUserPassword` | `HRM-ADMIN-204` | FR-HRM-05 #1/#2/#5/#6/#8 · §3.27 · `user_id` UUID | **D** | **PASS** |

| Layer | Observation | Verdict |
|-------|-------------|---------|
| Version | `info.version: 1.3.5-admin-f1` · description cites BE-HRM-OA-ADMIN-01 | **PASS** |
| API_DESIGN §7 | ~~OpenAPI admin paths~~ **CLOSED**; ~~G-ADM-DTO-01~~ **CLOSED** | **PASS** |
| Examples Plane B | `company_id: holding` on company-admin + invite | **PASS** |
| Reset UUID | schema `format: uuid` · must_keep G-ADM-DTO-01 CLOSED | **PASS** |
| Residual honesty in OA | G-ADM-03/04/01/05 called out — not claimed CLOSED | **PASS** |

### Read-only / contract matrix (admin F.1)

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| OpenAPI `POST /admin/*` ×4 F.1 | Schema **PASS** | Docs **PASS** | N/A yaml | N/A | HRM-ADMIN-201..204 |
| Plane B `company_id` TEXT slug | Example holding | **PASS** | N/A | N/A | G-ADM-DTO-01 CLOSED |
| Reset `user_id` UUID | Schema uuid | **PASS** | N/A | N/A | must_keep |
| Runtime DTO plane | — | **PASS** prior QA | — | — | no wipe this wave |
| §E supporting membership OA | — | **OUT** | — | — | optional Info |
| Live admin mutate / UF browser | — | **not claimed** | — | — | U65 |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| OpenAPI admin F.1 4 paths + verify 85 EXIT 0 | PRODUCT | **PASS** — CLOSED |
| G-ADM-DTO-01 DTO + OA must_keep | PRODUCT | **PASS** — remains CLOSED |
| API_DESIGN §7 OpenAPI residual CLOSED | PRODUCT | **PASS** |
| QA yaml pack 2/8 missing portal/J-* | PROCESS | **OPEN P3** — expected yaml-only; QC pack 8/8 |
| Seed / live admin mutate / UF claim | PROCESS U65 | **PASS** — none claimed |
| Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| **J-HRM-ADMIN** / admin mutate journey | **N/A** this packet | Yaml/OpenAPI contract wave — L2.5 browser **not in entry criteria** |
| UF admin platform/company/invite/reset | **not claimed** | Contract PASS ≠ browser PASS (U65) |
| OpenAPI admin F.1 FR-02..05 | **PASS** | F.1 + verify gate |

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
| ~~G-ADM-DTO-01~~ | — | **CLOSED** | Preserved — **no reopen** |
| ~~OpenAPI admin paths~~ | — | **CLOSED** | This GWC |
| **C-OA-ADM-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future yaml packs with `PORTAL_DEV_URL` N/A + journey N/A for Layer B 8/8 |
| G-ADM-PATH/CODE · §E OA | Info | OPEN optional | `ba` / discoverability |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |
| Product P0/P1 for this OpenAPI wave | — | **NONE** | — |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** OpenAPI admin F.1 residual — `hrm-api.yaml` **1.3.5-admin-f1** deepen for `platform-admin` / `company-admin` / `invite-employee` / `reset-user-password` with Mục đích · Nghiệp vụ · Bước SRS (FR-HRM-02..05 · HRM-ADMIN-201..204); API_DESIGN §7 OpenAPI **CLOSED**; QA contract spot PASS; QC verify **85 EXIT 0**; **G-ADM-DTO-01 remains CLOSED** (no DTO wipe/reopen).
- **Conditions:** HOLD_DEPLOY; **G-ADM-01 / 03 / 04 / SCOPE-01 / 05** stay **OPEN** (P2); **C-OA-ADM-QA-PACK-01** P3 PROCESS; **NOT** Phase 1 DONE; **NOT** PROD-READY; **NOT** `:8088`; no UF admin mutate claim.
- **cấm honored:** no seed · no invent FR · no wipe DTO plane · no Phase1/PROD/:8088 · no live admin mutate PASS.

---

## Handoff

### completion_report

**Closed:** QC contract gate **GO WITH CONDITIONS** for `QC-HRM-OA-ADMIN-01`. Independent audit confirms OpenAPI admin F.1 **CLOSED**: BE deepen + QA spot + QC re-run `verify:openapi-hrm-p1-s3b` **85 EXIT 0**; `API_DESIGN_HRM_ADMIN.md` §7 OpenAPI residual CLOSED; four `/admin/*` paths F.1 vs §A–D; Plane B `company_id: holding` + reset UUID; **G-ADM-DTO-01 remains CLOSED** (DTO runtime + OA must_keep). QC evidence-pack **8/8**. U65 · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088 · **no** UF admin mutate claim.

**Residual:** G-ADM-01 / 03 / 04 / SCOPE-01 / 05 **OPEN** (P2); C-OA-ADM-QA-PACK-01 P3 (yaml QA Layer B optional); no product P0/P1 from this wave.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-OA-ADMIN-01
from_role: qc
to_role: pm
lane: governance intake · OpenAPI admin F.1 GWC
priority: P2

entry_criteria:
- QC-HRM-OA-ADMIN-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-oa-admin-01-20260727.md
- QA PASS: docs/qa/evidence/qa-hrm-oa-admin-01-20260727.md
- BE: docs/qa/evidence/be-hrm-oa-admin-01-20260727.md

action:
1. Bus INTAKE: mark OpenAPI admin F.1 CLOSED (product contract); G-ADM-DTO-01 stays CLOSED
2. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
3. Residual stay OPEN (do not auto-close): G-ADM-01 · G-ADM-03 · G-ADM-04 · G-ADM-SCOPE-01 · G-ADM-05
4. Optional later (non-blocking): separate WI for admin UF browser mutate only if sponsor asks
5. Note C-OA-ADM-QA-PACK-01 P3 PROCESS (QA yaml pack 2/8) — optional Layer B enrich
cấm: seed · treat yaml PASS as UF admin mutate PASS · Phase1/PROD/:8088 · wipe/reopen G-ADM-DTO-01
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-oa-admin-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — GWC closes OpenAPI admin F.1; G-ADM-DTO-01 stays CLOSED; G-ADM-01/03/04/SCOPE-01/05 OPEN; HOLD_DEPLOY; no UF admin / Phase1/PROD from this packet.
