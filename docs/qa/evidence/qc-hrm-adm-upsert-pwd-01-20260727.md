# QC Gate — QC-HRM-ADM-UPSERT-PWD-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-ADM-UPSERT-PWD-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · GWC local · HOLD_DEPLOY · sibling upsert CSPRNG (§C.1) |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — sibling **upsert** temp = `generateInviteTempPassword` · zero literal `12345678` as password · **G-ADM-04 remains CLOSED** |
| **scope_claim** | Unit + contract: `upsertCompanyMembership` CSPRNG factory · new-profile hash-only · existing no password overwrite · invite regression green |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed · no invent mailer · no live admin upsert mutate · no UF admin browser claim |

---

## Scope (bounded — unit/contract GWC)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Formal close sibling upsert CSPRNG after BE + QA + QC spot | Reopen **G-ADM-04** without FAIL |
| Accept jest + source as proof (no live upsert mutate) | Invent email outbox / accept-invite SM DONE |
| Confirm **G-ADM-04 CLOSED** + HOLD outbox/accept-SM retained | Phase 1 DONE / PROD-READY / `:8088` |
| Confirm zero `'12345678'` / `"12345678"` password literal in service | Change `create*` client `payload.password` (must_keep) |
| Confirm `createPlatformAdmin` / `createCompanyAdmin` keep client password | Treat unit PASS as UF browser PASS |

**Spec SoT:** `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§C.1** sibling note · BR-ADM-04-TEMP-PWD-01/02 reuse · UC-HRM-04 · prior `qc-hrm-adm-invite-04-20260727.md` (G-ADM-04 CLOSED — do not reopen).

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Audit QA 6/6 + jest 17/17 (re-spot OK) | **PASS** — QA exit matrix 6/6; QC re-run **17/17 EXIT 0** (service + controller) |
| 2 | Confirm upsert factory `generateInviteTempPassword`; zero literal `12345678` as password | **PASS** — L558–561 factory; rg zero `['"]12345678['"]` in service (charset `0123456789` ≠ password literal) |
| 3 | G-ADM-04 remains CLOSED; HOLD outbox/accept-SM | **PASS** — invite AC still green inside 17/17; design residual CLOSED; HOLD retained; **no reopen** |
| 4 | Verdict GO or GWC · this evidence → PASS_TO_PM | **PASS** — **GO WITH CONDITIONS** |
| 5 | NOT Phase1/PROD/:8088 · Append bus | **PASS** (same session) |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/be-hrm-adm-upsert-pwd-01-20260727.md` | FIX upsert factory · jest · §C.1 sibling CLOSED | **READY_FOR_QA** | Upsert sibling |
| `docs/qa/evidence/qa-hrm-adm-upsert-pwd-01-20260727.md` | 6/6 · jest 17/17 · G-ADM-04 not reopened | **PASS** · PASS_TO_PM | Upsert sibling |
| `docs/qa/evidence/qc-hrm-adm-invite-04-20260727.md` | G-ADM-04 CLOSED | **GWC prior** — **must_keep CLOSED** this WI | Invite G-ADM-04 |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` §C.1 sibling note | Status CLOSED cite `BE-HRM-ADM-UPSERT-PWD-01` | **CLOSED** | Upsert sibling |
| Runtime `hrm-admin.service.ts` | upsert → `() => generateInviteTempPassword()` | **PASS** QC spot L544–562 | Upsert path |
| Runtime specs | New hash ≠ fixed · existing no overwrite · invite AC green | **PASS** QC re-run | 17/17 |

**must_keep:** G-ADM-04 invite CSPRNG CLOSED · G-ADM-01/05 CLOSED · HOLD outbox/accept-SM · `create*` client `payload.password` · U65 · HOLD_DEPLOY · **no** invent mailer · **no** reopen G-ADM-04 without FAIL.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm --filter hrm-api exec jest src/hrm-admin/hrm-admin.service.spec.ts src/hrm-admin/hrm-admin.controller.spec.ts --no-coverage` | **PASS** exit **0** — Tests **17/17** (QC re-run 2026-07-27) | PRODUCT (unit) |
| Grep service: `upsertCompanyMembership` → `() => generateInviteTempPassword()` | **Present** L558–561 | PRODUCT |
| Grep service: `generateInviteTempPassword` uses `randomInt` (`node:crypto`); `Math.max(12,…)`; charset §C.1; ≥1 letter + ≥1 digit | **Present** L81–96 | PRODUCT |
| Grep `findOrCreatePortalUser`: existing → early return before factory; new → factory → `hashPassword` INSERT | **Present** L266–288 | PRODUCT |
| Service source: zero `'12345678'` / `"12345678"` literal as password (only charset digit substring `0123456789` + CODE-MEMORY mention) | **PASS** | PRODUCT |
| Create paths: `createPlatformAdmin` / `createCompanyAdmin` pass `payload.password` (client — must_keep) | **Present** | PRODUCT (must_keep) |
| API_DESIGN §C.1 sibling note **CLOSED** `BE-HRM-ADM-UPSERT-PWD-01` + residual ~~G-ADM-04~~ CLOSED + HOLD outbox/accept-SM | **Present** | PRODUCT (contract) |
| Live upsert mutate / invent mailer | **NOT required** per exit · **not claimed** | OUT — U65 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-adm-upsert-pwd-01-20260727.md` | **FAIL** 3/8 (`portal_url`, `journey_l25`, `residual_section`) | PROCESS — unit/contract QA pack (expected P3) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-adm-upsert-pwd-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |

**Portal URL / PORTAL_DEV_URL:** N/A for unit/contract upsert sibling gate — no browser UF in slice (`PORTAL_DEV_URL` not required; portal `127.0.0.1:5175` not exercised).

### Read-only / contract matrix (upsert CSPRNG sibling)

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| Upsert new email → CSPRNG factory · hash ≠ hash(12345678) | **PASS** jest+source | N/A | N/A | N/A | §C.1 sibling |
| Upsert response no plaintext password fields | **PASS** membership row | N/A | N/A | N/A | hash-only persist |
| Upsert existing email → no `password_hash` overwrite | N/A | N/A | **PASS** jest | N/A | early return |
| Zero literal `12345678` as password in service | **PASS** rg | N/A | N/A | N/A | charset ≠ literal |
| Invite AC-ADM-04-TEMP-01..05 regression | **PASS** in 17/17 | N/A | N/A | N/A | G-ADM-04 not reopened |
| Email outbox / accept-invite SM | — | **HOLD** | — | — | BR-ADM-04-TEMP-PWD-08 |
| Admin UF browser upsert mutate | — | **not claimed** | — | — | U65 · out of slice |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| Upsert CSPRNG factory `generateInviteTempPassword` | PRODUCT | **PASS** — CLOSED via jest+source+§C.1 sibling |
| Zero literal `12345678` as password | PRODUCT | **PASS** |
| Existing upsert no password overwrite | PRODUCT | **PASS** |
| G-ADM-04 invite CLOSED | PRODUCT must_keep | **PASS** — remains CLOSED; regression green; **not reopened** |
| HOLD outbox / accept-invite SM | PRODUCT (non-goal) | **PASS** — retained; not invented DONE |
| G-ADM-01 / G-ADM-05 | PRODUCT must_keep | **PASS** — remain CLOSED |
| Live upsert mutate not run | OUT OF SLICE | **Accepted** — exit cấm require live mutate |
| QA pack 3/8 missing portal/J-*/residual heading | PROCESS | **OPEN P3** — expected unit/contract pack; QC pack 8/8 |
| Seed / invent mailer / Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Admin UF / FR-03/04 upsert browser journey | **N/A** this packet | Unit/contract sibling gate — L2.5 browser **not in entry criteria** |
| J-HRM-ADMIN upsert mutate (if mapped later) | **not claimed** | Contract/unit PASS ≠ UF browser PASS (U65) |
| Upsert CSPRNG sibling path | **PASS** | jest + API §C.1 sibling + source factory |
| G-ADM-04 invite CSPRNG path | **PASS** (prior GWC · regression) | Remains CLOSED — do not reopen |

**QC:** No L2.5 product NO-GO — browser journey coverage **out of scope** for this unit/contract GWC. Do **not** promote admin UF upsert mutate from this evidence.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| ~~**BE-HRM-ADM-UPSERT-PWD-01**~~ / sibling upsert CSPRNG | — | **CLOSED** | This GWC · BE + QA + QC unit/contract |
| ~~**G-ADM-04**~~ invite | — | **CLOSED** (prior) | `qc-hrm-adm-invite-04-20260727.md` — **must_keep** · **not reopened** |
| **HOLD outbox / accept-invite SM** | HOLD | OPEN (condition) | Future CR — **cấm** invent DONE (BR-ADM-04-TEMP-PWD-08) |
| ~~**G-ADM-01**~~ / ~~**G-ADM-05**~~ | — | **CLOSED** (prior) | must_keep preserved |
| **C-ADM-UPSERT-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future unit packs with `PORTAL_DEV_URL` N/A + journey N/A + `## Residual` for Layer B 8/8 |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** Sibling residual **upsertCompanyMembership** fixed temp — uses shared `generateInviteTempPassword` (CSPRNG ≥12, charset §C.1) only on new profile; hash-only persist; response has no password fields; existing email → membership only (no `password_hash` overwrite); zero `'12345678'` / `"12345678"` password literal in service; API_DESIGN §C.1 sibling note **CLOSED** cite `BE-HRM-ADM-UPSERT-PWD-01`; QA 6/6; QC re-run **17/17 EXIT 0**; invite G-ADM-04 AC regression green.
- **Conditions:** HOLD_DEPLOY; HOLD email outbox / accept-invite SM (do not invent); **G-ADM-04 remains CLOSED** (do not reopen without FAIL); **NOT** Phase 1 DONE; **NOT** PROD-READY; **NOT** `:8088`; no UF admin upsert mutate claim.
- **cấm honored:** no seed · no invent mailer · no reopen G-ADM-04 without FAIL · no require live upsert mutate for GO · no Phase1/PROD/:8088.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-HRM-ADM-UPSERT-PWD-01`. Independent audit confirms sibling upsert CSPRNG CLOSED: BE factory + QA 6/6 + QC re-run `hrm-admin.service`+`controller` specs **17/17 EXIT 0**; `upsertCompanyMembership` → `() => generateInviteTempPassword()`; zero password literal `12345678`; new-profile hash ≠ fixed; existing no overwrite; §C.1 sibling note CLOSED; **G-ADM-04 remains CLOSED** (regression green · not reopened); HOLD outbox/accept-SM retained. QC evidence-pack **8/8**. U65 · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088 · **no** invent mailer · **no** live upsert mutate claim.

**Residual:** HOLD outbox/accept-SM; C-ADM-UPSERT-QA-PACK-01 P3 PROCESS; no product P0/P1 on upsert sibling path.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-ADM-UPSERT-PWD-01
from_role: qc
to_role: pm
lane: governance intake · sibling upsert CSPRNG close
priority: P3

entry_criteria:
- QC-HRM-ADM-UPSERT-PWD-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-adm-upsert-pwd-01-20260727.md
- QA PASS: docs/qa/evidence/qa-hrm-adm-upsert-pwd-01-20260727.md
- BE: docs/qa/evidence/be-hrm-adm-upsert-pwd-01-20260727.md
- prior must_keep: docs/qa/evidence/qc-hrm-adm-invite-04-20260727.md (G-ADM-04 CLOSED)

action:
1. Bus INTAKE: mark sibling upsert CSPRNG QC-verified CLOSED (upsertCompanyMembership → generateInviteTempPassword · zero literal 12345678)
2. Keep G-ADM-04 CLOSED — do NOT reopen without FAIL
3. Keep HOLD email outbox / accept-invite SM — do NOT invent DONE
4. Keep G-ADM-01 / G-ADM-05 CLOSED — do NOT reopen without FAIL
5. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
6. Continue next open admin residual (e.g. G-ADM-SCOPE-01) only if prioritized — separate WI
cấm: seed · invent mailer · invent accept-SM · reopen G-ADM-04 without FAIL · treat unit PASS as UF browser PASS · Phase1/PROD/:8088
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-adm-upsert-pwd-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — GWC closes upsert sibling CSPRNG only; G-ADM-04 remains CLOSED; HOLD outbox/accept-SM; HOLD_DEPLOY · NOT Phase1/PROD/:8088.
