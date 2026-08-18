# QA-HRM-ADM-INVITE-04 — G-ADM-04 CSPRNG invite temp password

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ADM-INVITE-04` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · verify G-ADM-04 · U65 no seed · HOLD_DEPLOY |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `BE-HRM-ADM-INVITE-04` READY_FOR_QA · evidence `be-hrm-adm-invite-04-20260727.md` |
| **spec_ref** | `docs/hrm/SRS.md` UC-HRM-04 · **AC-ADM-04-TEMP-01..05** · `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§C / §C.1** |
| **evidence_path** | `docs/qa/evidence/qa-hrm-adm-invite-04-20260727.md` |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Re-run jest `hrm-admin.service.spec.ts` EXIT 0 | Seed / invent mailer / invent accept-invite SM |
| Source `inviteEmployees` has no literal `12345678` as invite password | Reopen G-ADM-01 / G-ADM-05 |
| AC-ADM-04-TEMP-01..05 mapped PASS | Phase1 / PROD claim |
| G-ADM-04 CLOSED in API_DESIGN + DB_DESIGN residual | Browser UF mutate invent |
| Invite success shape: no plaintext password fields | Close sibling `upsertCompanyMembership` fixed temp (out of G-ADM-04) |
| HOLD still documented: email outbox / accept-invite SM | |

---

## 2. Environment / commands

| Item | Result |
|------|--------|
| Workspace | `C:\xevn-ecosystem` |
| Seed | **none** (U65) |
| Jest | `pnpm --filter hrm-api exec jest src/hrm-admin/hrm-admin.service.spec.ts --no-coverage` |
| Jest result | **Test Suites: 1 passed · Tests: 10 passed · EXIT 0** |
| Live invite mutate | **not required** — exit criteria = unit + source + design residual (HOLD_DEPLOY) |

```text
Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Time:        ~2 s
EXIT 0
```

---

## 3. Source corroboration

| Check | Evidence | Verdict |
|-------|----------|---------|
| Generator | `generateInviteTempPassword` uses `randomInt` from `node:crypto` (CSPRNG); length `Math.max(12, …)`; charset §C.1; ≥1 letter + ≥1 digit forced | **PASS** |
| Invite path | `inviteEmployees` → `findOrCreatePortalUser(email, () => generateInviteTempPassword(), fullName)` | **PASS** |
| Factory-only-on-create | `findOrCreatePortalUser`: existing email → return early **before** factory/`hashPassword`; new → factory → SHA-256 → `password_hash` INSERT | **PASS** |
| Response shape | Return `{ success, total, invited, failed, results: { email, success, error? }[] }` — **no** password fields | **PASS** |
| Literal `12345678` in `inviteEmployees` block | rg + jest source slice: **absent** as invite password (charset `0123456789` substring ≠ password literal) | **PASS** |
| Sibling residual | `upsertCompanyMembership` L549 still `'12345678'` — **documented sibling** per API_DESIGN §C.1; **does not block** G-ADM-04 | Residual P3 optional |

---

## 4. AC matrix (AC-ADM-04-TEMP-01..05)

| AC | Pass when (spec) | QA evidence | Verdict |
|----|------------------|-------------|---------|
| **AC-ADM-04-TEMP-01** | `inviteEmployees` source has zero literal `12345678` as invite password | Jest: invite block slice asserts no `'12345678'`/`"12345678"` + contains `generateInviteTempPassword`; manual rg confirms only CODE-MEMORY mention + sibling upsert | **PASS** |
| **AC-ADM-04-TEMP-02** | Success body / `results[]` have no `password` / `temp_password` / `plainPassword` | Jest: `JSON.stringify(result)` no password keys; per-row `not.toHaveProperty` | **PASS** |
| **AC-ADM-04-TEMP-03** | Two new emails → distinct stored hashes; ≠ hash(`12345678`) | Jest: 2 INSERT hashes length 2, differ, ≠ SHA-256(`12345678`) | **PASS** |
| **AC-ADM-04-TEMP-04** | Re-invite existing → no profile INSERT · no `password_hash` UPDATE · membership only | Jest: profileInserts=0, passwordUpdates=0, membership INSERT called | **PASS** |
| **AC-ADM-04-TEMP-05** | Generator ≥12 + charset §C.1 | Jest: 40 samples length/charset/letter/digit; `generateInviteTempPassword(8)` still ≥12 | **PASS** |

**Overall AC:** **5/5 PASS**

---

## 5. Design residual — G-ADM-04 CLOSED + HOLD

| Artifact | Status | Note |
|----------|--------|------|
| `API_DESIGN_HRM_ADMIN.md` § residual table | **G-ADM-04 CLOSED** | CSPRNG §C.1 · **HOLD** email outbox / accept-invite SM · evidence BE path cited |
| `API_DESIGN_HRM_ADMIN.md` §C.1 status banner | **CLOSED** `BE-HRM-ADM-INVITE-04` | BR-ADM-04-TEMP-PWD-08 HOLD explicit |
| `DB_DESIGN_HRM_ADMIN.md` residual | **G-ADM-04 CLOSED** | Runtime CSPRNG ≥12 hash-only · HOLD outbox/accept-SM |
| `DB_DESIGN` `profiles.password_hash` | G-ADM-04 CLOSED note on column | No plaintext persist |
| G-ADM-01 / G-ADM-05 | Remain **CLOSED** — **not reopened** | must_keep |

**HOLD still documented (required):** email outbox · invite token / accept-invite SM · one-time plaintext reveal in API — **non-goal** this wave (BR-ADM-04-TEMP-PWD-08).

---

## 6. Residual (not FAIL)

| Item | Sev | Owner | Note |
|------|-----|-------|------|
| Email outbox / accept-invite SM | HOLD | CR future | Documented; do not invent |
| `upsertCompanyMembership` fixed `'12345678'` | P3 optional | `dev-be` | Sibling note §C.1 — optional shared helper; **not** G-ADM-04 reopen |
| HOLD_DEPLOY | Info | PM/QC | No prod claim |
| Live browser UF invite | Out | — | Exit = unit+source; U65 no invent mutate |

---

## 7. Verdict

| Gate | Result |
|------|--------|
| Jest EXIT 0 | **PASS** (10/10) |
| AC-ADM-04-TEMP-01..05 | **PASS** |
| G-ADM-04 CLOSED (API + DB residual) | **PASS** |
| No plaintext on invite success shape | **PASS** |
| HOLD outbox/accept-SM documented | **PASS** |
| U65 no seed | **PASS** |
| **Wave verdict** | **PASS** → `PASS_TO_PM` |

---

## 8. Handoff

- **next_owner:** `qc`
- **ack_status:** `PASS_TO_PM`
- **next_work_item:** `QC-HRM-ADM-INVITE-04`
- **pm_dispatch_hint:** Dispatch QC gate on G-ADM-04 CLOSED + HOLD residual wording; do not invent mailer; do not reopen G-ADM-01/05.

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-ADM-INVITE-04
role: qc
lane: governance · Go/No-Go G-ADM-04 invite CSPRNG
workspace: C:\xevn-ecosystem

read_first:
- docs/qa/evidence/qa-hrm-adm-invite-04-20260727.md
- docs/qa/evidence/be-hrm-adm-invite-04-20260727.md
- docs/hrm/API_DESIGN_HRM_ADMIN.md §C / §C.1 + residual G-ADM-04
- docs/hrm/DB_DESIGN_HRM_ADMIN.md residual G-ADM-04
- docs/hrm/SRS.md UC-HRM-04 AC-ADM-04-TEMP-01..05

entry_criteria: QA-HRM-ADM-INVITE-04 PASS_TO_PM · HOLD_DEPLOY · U65
exit_criteria:
1) Audit QA evidence: jest 10/10 EXIT 0 + AC-ADM-04-TEMP-01..05 PASS
2) Confirm G-ADM-04 CLOSED in API_DESIGN + DB_DESIGN; HOLD outbox/accept-SM still explicit
3) Confirm no plaintext password on invite success shape; invite path uses CSPRNG not literal 12345678
4) Confirm G-ADM-01/05 not reopened; sibling upsertCompanyMembership fixed temp = optional residual only
5) Verdict GO or GO WITH CONDITIONS · evidence docs/qa/evidence/qc-hrm-adm-invite-04-20260727.md
6) No Phase1/PROD claim

cấm: seed · invent mailer · reopen G-ADM-01/05 · require live invite mutate for GO
```

### completion_report

Closed: QA verify G-ADM-04 — jest `hrm-admin.service.spec.ts` **10/10 EXIT 0**; `inviteEmployees` uses `generateInviteTempPassword` (crypto CSPRNG); AC-ADM-04-TEMP-01..05 **PASS**; invite success shape has no password fields; G-ADM-04 **CLOSED** in API_DESIGN + DB_DESIGN with HOLD outbox/accept-SM retained; G-ADM-01/05 untouched.

Residual: HOLD email outbox / accept-invite SM; optional P3 sibling `upsertCompanyMembership` fixed `'12345678'` (out of G-ADM-04 close scope); HOLD_DEPLOY.
