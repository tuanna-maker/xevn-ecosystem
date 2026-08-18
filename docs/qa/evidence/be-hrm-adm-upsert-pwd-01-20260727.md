# BE-HRM-ADM-UPSERT-PWD-01 — upsertCompanyMembership CSPRNG temp (sibling G-ADM-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-ADM-UPSERT-PWD-01` |
| **role** | `dev-be` · execution |
| **date** | 2026-07-27 |
| **change_mode** | FIX · preserve_default |
| **ack_status** | **READY_FOR_QA** |
| **evidence_path** | `docs/qa/evidence/be-hrm-adm-upsert-pwd-01-20260727.md` |

---

## spec_read_ack

| Plane | Path · sections |
|-------|-----------------|
| **srs** | `docs/hrm/SRS.md` UC-HRM-04 · **BR-ADM-04-TEMP-PWD-01/02** (reuse on upsert sibling) |
| **api_design** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§C.1** sibling note |
| **sibling** | `docs/qa/evidence/be-hrm-adm-invite-04-20260727.md` — G-ADM-04 invite CLOSED; upsert residual |
| **runtime** | `apps/api/hrm-api/src/hrm-admin/hrm-admin.service.ts` · `upsertCompanyMembership` + `findOrCreatePortalUser` |
| **uc_ids** | UC-HRM-04 sibling path (membership upsert) |
| **change_mode** | FIX |
| **must_keep** | G-ADM-04 invite CSPRNG · G-ADM-01/05 · DTO/OA · no plaintext in response · HOLD outbox · `create*` client `payload.password` |
| **forbidden** | invent mailer · seed · Phase1 · wipe invite CSPRNG · reopen CLOSED residuals |

**spec says / code did (before):** §C.1 forbids fixed temp; `upsertCompanyMembership` passed literal `'12345678'`.  
**code does (after):** `() => generateInviteTempPassword()` only when INSERT new profile; existing → membership only; response has no password fields.

---

## Changes

| File | Delta |
|------|--------|
| `hrm-admin.service.ts` | `upsertCompanyMembership` uses factory `generateInviteTempPassword`; CODE-MEMORY APPEND |
| `hrm-admin.service.spec.ts` | Jest: source no literal · new profile hash ≠ fixed secret · existing no password overwrite |
| `hrm-admin.controller.spec.ts` | Create DTO fixtures use `secret1234` (not fixed-temp literal) |
| `API_DESIGN_HRM_ADMIN.md` | §C.1 sibling note → upsert CLOSED `BE-HRM-ADM-UPSERT-PWD-01` |

**Not changed (must_keep / HOLD):** inviteEmployees CSPRNG · G-ADM-01 audit · G-ADM-05 404 · email outbox / accept-SM · `createPlatformAdmin` / `createCompanyAdmin` client password.

---

## Verification

```text
pnpm --filter hrm-api exec jest src/hrm-admin/hrm-admin.service.spec.ts src/hrm-admin/hrm-admin.controller.spec.ts --no-coverage
→ Test Suites: 2 passed · Tests: 17 passed · EXIT 0
```

| Check | Result |
|-------|--------|
| upsert source no `'12345678'` / `"12345678"` | PASS |
| whole `hrm-admin.service.ts` zero `'12345678'` string literals | PASS (charset `0123456789` ≠ password literal; CODE-MEMORY comment mentions removal) |
| new upsert → hash ≠ SHA-256(`12345678`); no password fields on row | PASS |
| existing upsert → no profile INSERT · no `password_hash` UPDATE | PASS |
| invite AC-ADM-04-TEMP-* regression | PASS (suite still green) |

---

## Residual / HOLD

| Item | Status |
|------|--------|
| **BE-HRM-ADM-UPSERT-PWD-01** | **CLOSED** (API) · READY_FOR_QA |
| G-ADM-04 invite | Kept CLOSED |
| Email outbox / accept-invite SM | **HOLD** |
| U65 seed | Not used |
| HOLD_DEPLOY | Yes — no prod claim |

---

## Handoff

- **next_owner:** `qa`
- **ack_status:** `READY_FOR_QA`
- **work_item_id (QA):** `QA-HRM-ADM-UPSERT-PWD-01`
