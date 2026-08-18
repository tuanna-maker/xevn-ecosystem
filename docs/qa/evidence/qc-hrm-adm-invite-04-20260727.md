# QC Gate — QC-HRM-ADM-INVITE-04 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-ADM-INVITE-04` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · GWC local · HOLD_DEPLOY · gate **G-ADM-04** invite CSPRNG |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — **G-ADM-04 CLOSED** (invite temp = CSPRNG ≥12 · hash-only · no plaintext on wire) |
| **scope_claim** | Unit + contract: `inviteEmployees` CSPRNG · AC-ADM-04-TEMP-01..05 · API/DB residual CLOSED · HOLD outbox/accept-SM |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed · no invent mailer · no live invite mutate required · no UF admin browser claim |

---

## Scope (bounded — unit/contract GWC)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Formal close **G-ADM-04** after BE + QA + QC spot | Invent email outbox / accept-invite SM DONE |
| Accept jest + source as proof of CSPRNG invite (no live mutate) | Require live invite mutate for GO |
| Confirm HOLD outbox/accept-SM still explicit in API_DESIGN + DB_DESIGN | Phase 1 DONE / PROD-READY / `:8088` |
| Confirm G-ADM-01 / G-ADM-05 remain CLOSED (not reopened) | Reopen G-ADM-01 / G-ADM-05 |
| Note sibling `upsertCompanyMembership` / `BE-HRM-ADM-UPSERT-PWD-01` separately | Block G-ADM-04 on sibling upsert WI |

**Spec SoT:** `docs/hrm/SRS.md` UC-HRM-04 · AC-ADM-04-TEMP-01..05 · `docs/hrm/API_DESIGN_HRM_ADMIN.md` §C / §C.1 · `docs/hrm/DB_DESIGN_HRM_ADMIN.md` residual G-ADM-04.

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Audit QA: jest EXIT 0 + AC-ADM-04-TEMP-01..05 PASS | **PASS** — QA 10/10; QC re-run **10/10 EXIT 0** |
| 2 | G-ADM-04 CLOSED in API_DESIGN + DB_DESIGN; HOLD outbox/accept-SM explicit | **PASS** — residual ~~G-ADM-04~~ CLOSED; BR-ADM-04-TEMP-PWD-08 HOLD retained |
| 3 | No plaintext on invite success; invite CSPRNG not literal `12345678` | **PASS** — return shape `{success,total,invited,failed,results[{email,success,error?}]}`; factory `() => generateInviteTempPassword()` |
| 4 | G-ADM-01/05 not reopened; sibling upsert = optional residual (UPSERT WI may be in flight) | **PASS** — G-ADM-01/05 remain CLOSED; sibling noted separately (source already uses shared helper; track under `BE-HRM-ADM-UPSERT-PWD-01`) |
| 5 | Verdict GO or GWC · this evidence path | **PASS** — **GO WITH CONDITIONS** |
| 6 | No Phase1/PROD claim · Append bus | **PASS** |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/be-hrm-adm-invite-04-20260727.md` | CSPRNG factory · jest AC · design CLOSED | **READY_FOR_QA** | G-ADM-04 |
| `docs/qa/evidence/qa-hrm-adm-invite-04-20260727.md` | jest 10/10 · AC 5/5 · HOLD documented | **PASS** · PASS_TO_PM | AC-ADM-04-TEMP-01..05 |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` §C / §C.1 · residual | Status CLOSED · HOLD BR-08 | **CLOSED** cite `BE-HRM-ADM-INVITE-04` | G-ADM-04 |
| `docs/hrm/DB_DESIGN_HRM_ADMIN.md` residual · `password_hash` | CSPRNG hash-only · HOLD outbox | **CLOSED** | G-ADM-04 |
| Runtime `hrm-admin.service.ts` | `generateInviteTempPassword` + invite factory | **PASS** QC grep | Invite path |
| Runtime `hrm-admin.service.spec.ts` | AC-ADM-04-TEMP-01..05 | **PASS** QC re-run | 10/10 |

**must_keep:** G-ADM-01 audit write · G-ADM-05 404 · hash SHA-256 · batch continue-on-error · U65 · HOLD outbox/accept-SM · no plaintext on invite wire · HOLD_DEPLOY · **no** invent mailer · **no** reopen G-ADM-01/05.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm --filter hrm-api exec jest src/hrm-admin/hrm-admin.service.spec.ts --no-coverage` | **PASS** exit **0** — Tests **10/10** (QC re-run 2026-07-27) | PRODUCT (unit) |
| Grep service: `generateInviteTempPassword` uses `randomInt` from `node:crypto`; `Math.max(12,…)`; charset §C.1; ≥1 letter + ≥1 digit | **Present** | PRODUCT |
| Grep invite: `inviteEmployees` → `() => generateInviteTempPassword()`; return **no** `password` / `temp_password` / `plainPassword` | **Present** | PRODUCT |
| Grep `findOrCreatePortalUser`: existing → early return before factory; new → factory → `hashPassword` INSERT | **Present** | PRODUCT |
| Service source: zero `'12345678'` / `"12345678"` literal as password (only charset digit substring `0123456789`) | **PASS** | PRODUCT |
| API_DESIGN §C.1 Status **CLOSED** + residual ~~G-ADM-04~~ CLOSED + HOLD email outbox / accept-invite SM | **Present** | PRODUCT (contract) |
| DB_DESIGN residual ~~G-ADM-04~~ CLOSED + `profiles.password_hash` note CLOSED | **Present** | PRODUCT (contract) |
| API_DESIGN residual G-ADM-01 / G-ADM-05 | **Remain CLOSED** — not reopened | PRODUCT (must_keep) |
| Live invite mutate / invent mailer | **NOT required** per exit · **not claimed** | OUT — U65 |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-adm-invite-04-20260727.md` | **FAIL** 2/8 (`portal_url`, `journey_l25`) | PROCESS — unit/contract QA pack (expected) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-adm-invite-04-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |

**Portal URL / PORTAL_DEV_URL:** N/A for unit/contract G-ADM-04 gate — no browser UF in slice (`PORTAL_DEV_URL` not required; portal `127.0.0.1:5175` not exercised).

### Read-only / contract matrix (invite CSPRNG)

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| AC-ADM-04-TEMP-01 no literal invite pwd | **PASS** jest+source | N/A | N/A | N/A | §C.1 |
| AC-ADM-04-TEMP-02 no plaintext on success | **PASS** jest shape | N/A | N/A | N/A | HRM-ADMIN-203 body |
| AC-ADM-04-TEMP-03 distinct hashes ≠ hash(12345678) | **PASS** jest | N/A | N/A | N/A | new profiles |
| AC-ADM-04-TEMP-04 re-invite no password overwrite | N/A | N/A | **PASS** jest | N/A | membership only |
| AC-ADM-04-TEMP-05 length≥12 + charset | **PASS** jest 40 samples | N/A | N/A | N/A | CSPRNG |
| Email outbox / accept-invite SM | — | **HOLD** | — | — | BR-ADM-04-TEMP-PWD-08 |
| Admin UF browser invite mutate | — | **not claimed** | — | — | U65 · out of slice |
| Sibling upsert fixed temp | — | **separate WI** | — | — | `BE-HRM-ADM-UPSERT-PWD-01` |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| G-ADM-04 invite CSPRNG ≥12 hash-only | PRODUCT | **PASS** — CLOSED via jest+source+design |
| No plaintext password fields on invite success | PRODUCT | **PASS** |
| HOLD outbox / accept-invite SM documented | PRODUCT (non-goal) | **PASS** — retained; not invented DONE |
| G-ADM-01 / G-ADM-05 | PRODUCT must_keep | **PASS** — remain CLOSED; not reopened |
| Sibling upsert / `BE-HRM-ADM-UPSERT-PWD-01` | PRODUCT sibling | **Note only** — DISPATCHED on bus; source spot already uses `generateInviteTempPassword`; **does not block** G-ADM-04 |
| Live invite mutate not run | OUT OF SLICE | **Accepted** — exit cấm require live mutate |
| QA pack 2/8 missing portal/J-* | PROCESS | **OPEN P3** — expected unit/contract pack; QC pack 8/8 |
| Seed / invent mailer / Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Admin UF / FR-04 invite browser journey | **N/A** this packet | Unit/contract G-ADM-04 gate — L2.5 browser **not in entry criteria** |
| J-HRM-ADMIN invite mutate (if mapped later) | **not claimed** | Contract/unit PASS ≠ UF browser PASS (U65) |
| G-ADM-04 invite CSPRNG path | **PASS** | jest AC-ADM-04-TEMP-01..05 + API §C.1 + source |

**QC:** No L2.5 product NO-GO — browser journey coverage **out of scope** for this unit/contract GWC. Do **not** promote admin UF invite mutate from this evidence.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| ~~**G-ADM-04**~~ | — | **CLOSED** | This GWC · BE-HRM-ADM-INVITE-04 + QA-HRM-ADM-INVITE-04 + QC unit/contract |
| **HOLD outbox / accept-invite SM** | HOLD | OPEN (condition) | Future CR — **cấm** invent DONE this wave (BR-ADM-04-TEMP-PWD-08) |
| ~~**G-ADM-01**~~ (write) | — | **CLOSED** (prior) | must_keep preserved |
| ~~**G-ADM-05**~~ | — | **CLOSED** (prior) | must_keep preserved |
| **BE-HRM-ADM-UPSERT-PWD-01** | P3 sibling | **in flight** (PM DISPATCHED) | `dev-be` — source already appears fixed to shared CSPRNG helper; close under that WI + QA — **do not reopen G-ADM-04** |
| **C-ADM-04-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future unit packs with `PORTAL_DEV_URL` N/A + journey N/A for Layer B 8/8 |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** Soft residual **G-ADM-04** — UC-HRM-04 / FR-04 invite create uses CSPRNG temp (≥12, charset §C.1) only on new profile; hash-only persist; invite success body has no password fields; literal `12345678` absent as invite password; AC-ADM-04-TEMP-01..05 **PASS**; API_DESIGN §C.1 + DB_DESIGN residual **CLOSED** with HOLD outbox/accept-SM retained; QC re-run `hrm-admin.service.spec` **10/10**; G-ADM-01/05 **not reopened**.
- **Conditions:** HOLD_DEPLOY; HOLD email outbox / accept-invite SM (do not invent); sibling upsert tracked under `BE-HRM-ADM-UPSERT-PWD-01` (optional P3 — not blocking); **NOT** Phase 1 DONE; **NOT** PROD-READY; **NOT** `:8088`; no UF admin invite mutate claim.
- **cấm honored:** no seed · no invent mailer · no reopen G-ADM-01/05 · no require live invite mutate for GO · no Phase1/PROD/:8088.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-HRM-ADM-INVITE-04`. Independent audit confirms **G-ADM-04 CLOSED**: BE CSPRNG factory + QA AC-ADM-04-TEMP-01..05 PASS + QC re-run `hrm-admin.service.spec` **10/10 EXIT 0**; invite success shape has no plaintext password fields; API_DESIGN §C/§C.1 + DB_DESIGN residual CLOSED with HOLD outbox/accept-SM explicit; G-ADM-01/05 remain CLOSED. QC evidence-pack **8/8**. U65 · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088 · **no** invent mailer · **no** live invite mutate requirement.

**Residual:** HOLD outbox/accept-SM; sibling `BE-HRM-ADM-UPSERT-PWD-01` in flight (source spot already uses shared helper — close under that WI); C-ADM-04-QA-PACK-01 P3 PROCESS; no product P0/P1 on G-ADM-04 invite path.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-ADM-INVITE-04
from_role: qc
to_role: pm
lane: governance intake · G-ADM-04 close
priority: P2

entry_criteria:
- QC-HRM-ADM-INVITE-04 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-adm-invite-04-20260727.md
- QA PASS: docs/qa/evidence/qa-hrm-adm-invite-04-20260727.md
- BE: docs/qa/evidence/be-hrm-adm-invite-04-20260727.md

action:
1. Bus INTAKE: mark G-ADM-04 QC-verified CLOSED (invite CSPRNG ≥12 hash-only · no plaintext on wire)
2. Keep HOLD email outbox / accept-invite SM — do NOT invent DONE
3. Keep G-ADM-01 / G-ADM-05 CLOSED — do NOT reopen without FAIL
4. Continue sibling BE-HRM-ADM-UPSERT-PWD-01 separately (source already uses generateInviteTempPassword) → QA when READY_FOR_QA — do NOT reopen G-ADM-04
5. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
cấm: seed · invent mailer · invent accept-SM · reopen G-ADM-01/05 · reopen G-ADM-04 without FAIL · treat unit PASS as UF browser PASS · Phase1/PROD/:8088
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-adm-invite-04-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — GWC closes G-ADM-04 only; HOLD outbox/accept-SM; sibling UPSERT under `BE-HRM-ADM-UPSERT-PWD-01`; HOLD_DEPLOY · NOT Phase1/PROD/:8088.
