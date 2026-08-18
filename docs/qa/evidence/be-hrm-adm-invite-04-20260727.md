# BE-HRM-ADM-INVITE-04 — G-ADM-04 invite CSPRNG temp password

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-ADM-INVITE-04` |
| **role** | `dev-be` · execution |
| **date** | 2026-07-27 |
| **change_mode** | FIX · preserve_default |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/be-hrm-adm-invite-04-20260727.md` |

---

## spec_read_ack

| Plane | Path · sections |
|-------|-----------------|
| **srs** | `docs/hrm/SRS.md` UC-HRM-04 · **BR-ADM-04-TEMP-PWD-01..08** · **AC-ADM-04-TEMP-01..05** |
| **api_design** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§C** + **§C.1** · residual G-ADM-04 |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` · `profiles.password_hash` · gap G-ADM-04 |
| **ba_design** | `docs/qa/evidence/ba-hrm-adm-invite-04-20260727.md` (Option A — CSPRNG hash-only) |
| **runtime** | `apps/api/hrm-api/src/hrm-admin/hrm-admin.service.ts` · `inviteEmployees` + `findOrCreatePortalUser` |
| **uc_ids** | UC-HRM-04 / FR-HRM-04 |
| **change_mode** | FIX |
| **must_keep** | hash path SHA-256 · batch per-row continue-on-error · soft `employee_id` · U65 · G-ADM-01/05 · HOLD outbox/accept-SM · no plaintext on wire |
| **forbidden** | invent email outbox / invite token / accept-SM · plaintext in response · wipe FR-04/Fleet/OP/W2/Payroll · seed for UF |

**spec says / code did (before):** §C.1 CSPRNG ≥12 · `inviteEmployees` passed literal `'12345678'`.  
**code does (after):** `generateInviteTempPassword()` (CSPRNG) only when INSERT new profile; existing → membership only; response has no password fields.

---

## Changes

| File | Delta |
|------|--------|
| `hrm-admin.service.ts` | Export `generateInviteTempPassword`; `findOrCreatePortalUser` accepts `string \| () => string` so factory runs **only** on new profile; `inviteEmployees` uses factory; CODE-MEMORY APPEND |
| `hrm-admin.service.spec.ts` | Jest AC-ADM-04-TEMP-01..05 |
| `API_DESIGN_HRM_ADMIN.md` | G-ADM-04 **CLOSED** residual status |
| `DB_DESIGN_HRM_ADMIN.md` | G-ADM-04 **CLOSED** residual status |

**Not changed (must_keep / HOLD):** email outbox · invite token table · accept-invite SM · G-ADM-01 audit · G-ADM-05 404 · `upsertCompanyMembership` sibling fixed secret (out of G-ADM-04 invite close per §C.1 sibling note).

---

## Verification

```text
pnpm --filter hrm-api exec jest src/hrm-admin/hrm-admin.service.spec.ts --no-coverage
→ Test Suites: 1 passed · Tests: 10 passed · EXIT 0
```

| AC | Result |
|----|--------|
| **AC-ADM-04-TEMP-01** | PASS — `inviteEmployees` block has zero `'12345678'` / `"12345678"`; uses `generateInviteTempPassword` |
| **AC-ADM-04-TEMP-02** | PASS — result / `results[]` have no `password` / `temp_password` / `plainPassword` |
| **AC-ADM-04-TEMP-03** | PASS — two new-email invites → distinct `password_hash` inserts; ≠ hash(`12345678`) |
| **AC-ADM-04-TEMP-04** | PASS — existing email → no profile INSERT · no `password_hash` UPDATE · membership UPSERT only |
| **AC-ADM-04-TEMP-05** | PASS — 40 samples ≥12 · charset §C.1 · ≥1 letter · ≥1 digit |

---

## Residual / HOLD

| Item | Status |
|------|--------|
| **G-ADM-04** | **CLOSED** |
| Email outbox / accept-invite SM / one-time API reveal | **HOLD** (BR-ADM-04-TEMP-PWD-08) |
| `upsertCompanyMembership` / company-admin fixed temp | Optional sibling — not blocking G-ADM-04 |
| U65 seed | Not used |
| HOLD_DEPLOY | Yes — no prod claim |

---

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **next_dispatch_prompt:** see completion packet below
