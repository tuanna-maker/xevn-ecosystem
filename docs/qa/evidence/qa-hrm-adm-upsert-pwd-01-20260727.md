# QA-HRM-ADM-UPSERT-PWD-01 — upsertCompanyMembership CSPRNG sibling

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ADM-UPSERT-PWD-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **lane** | execution · U65 · verify sibling upsert CSPRNG · HOLD_DEPLOY |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |
| **entry** | `BE-HRM-ADM-UPSERT-PWD-01` READY_FOR_QA · evidence `be-hrm-adm-upsert-pwd-01-20260727.md` |
| **spec_ref** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§C.1** sibling note · BR-ADM-04-TEMP-PWD-01/02 reuse · UC-HRM-04 |
| **evidence_path** | `docs/qa/evidence/qa-hrm-adm-upsert-pwd-01-20260727.md` |
| **next** | `QC-HRM-ADM-UPSERT-PWD-01` |

---

## 1. Scope / cấm

| In | Out |
|----|-----|
| Confirm `upsertCompanyMembership` → `generateInviteTempPassword` | Invent mailer / seed / live admin mutate |
| Zero literal `'12345678'` / `"12345678"` in create/upsert password paths | Reopen **G-ADM-04** (CLOSED — QC GWC) |
| New email upsert → `password_hash` set · ≠ hash(`12345678`) · no plaintext fields | Phase1 / PROD / `:8088` claim |
| Existing email upsert → no `password_hash` overwrite | Change `create*` client `payload.password` (must_keep) |
| Regression: invite AC-ADM-04-TEMP-01..05 still green (jest) | Close outbox / accept-invite SM (HOLD retained) |

**G-ADM-04:** remains **CLOSED** per `qc-hrm-adm-invite-04-20260727.md` — this WI is sibling only; **no reopen**.

---

## 2. Environment / commands

| Item | Result |
|------|--------|
| Workspace | `C:\xevn-ecosystem` |
| Seed | **none** (U65) |
| Jest | `pnpm --filter hrm-api exec jest src/hrm-admin/hrm-admin.service.spec.ts src/hrm-admin/hrm-admin.controller.spec.ts --no-coverage` |
| Jest result | **Test Suites: 2 passed · Tests: 17 passed · EXIT 0** |
| Live upsert mutate | **not required** — unit + source + §C.1 sibling (HOLD_DEPLOY) |

```text
Test Suites: 2 passed, 2 total
Tests:       17 passed, 17 total
Time:        ~5.5 s
EXIT 0
```

---

## 3. Exit criteria matrix

| # | Criterion | QA evidence | Verdict |
|---|-----------|-------------|---------|
| **1** | `upsertCompanyMembership` uses `generateInviteTempPassword`; zero literal `12345678` in create/upsert paths | Source L544–562: factory `() => generateInviteTempPassword()`; rg: **no** `['"]12345678['"]` in `hrm-admin.service.ts` (only charset `0123456789` + CODE-MEMORY mention); jest source slice + whole-file literal count **0**; `createPlatformAdmin` / `createCompanyAdmin` keep **client** `payload.password` (not fixed temp) | **PASS** |
| **2** | New email upsert → `password_hash` set · ≠ hash(`12345678`) · no plaintext password fields | Jest: INSERT captures hash; `≠ SHA-256(12345678)`; hex64; `JSON.stringify(result)` no password keys; return membership row only | **PASS** |
| **3** | Existing email upsert → no `password_hash` overwrite | Jest: `findOrCreatePortalUser` early-return; profileInserts=0; passwordUpdates=0; membership UPSERT only | **PASS** |
| **4** | Regression invite G-ADM-04 AC still green | Same suite: `G-ADM-04 invite temp password (AC-ADM-04-TEMP-01..05)` **4/4** still PASS inside 17/17; invite path still `() => generateInviteTempPassword()` | **PASS** — G-ADM-04 **not reopened** |
| **5** | This evidence → PASS_TO_PM | This file | **PASS** |
| **6** | next QC-HRM-ADM-UPSERT-PWD-01 | Handoff below | **PASS** |

**Overall exit:** **6/6 PASS**

---

## 4. Source corroboration

| Check | Evidence | Verdict |
|-------|----------|---------|
| Shared generator | `generateInviteTempPassword` — `randomInt` (`node:crypto`); `Math.max(12,…)`; charset §C.1; ≥1 letter + ≥1 digit | **PASS** |
| Upsert path | `upsertCompanyMembership` → `findOrCreatePortalUser(email, () => generateInviteTempPassword(), fullName)` | **PASS** |
| Factory-only-on-create | Existing email → return `{ userId, isExisting: true }` **before** factory/`hashPassword`; new → factory → SHA-256 → INSERT `password_hash` | **PASS** |
| Response | Membership SELECT row — **no** password / temp_password / plainPassword | **PASS** |
| Create paths | `createPlatformAdmin` / `createCompanyAdmin` pass `payload.password` (client-supplied — must_keep §C.1 sibling note) | **PASS** (not fixed temp) |
| Controller fixtures | `hrm-admin.controller.spec.ts` uses `secret1234` / `newpass123` — **not** fixed-temp literal | **PASS** |
| Invite regression | `inviteEmployees` still factory CSPRNG; AC-ADM-04-TEMP-01..05 suite green | **PASS** |

---

## 5. Design residual — sibling CLOSED · G-ADM-04 untouched

| Artifact | Status | Note |
|----------|--------|------|
| `API_DESIGN_HRM_ADMIN.md` §C.1 sibling note | **CLOSED** `BE-HRM-ADM-UPSERT-PWD-01` | Same factory · new profiles only · evidence BE path |
| ~~G-ADM-04~~ invite | **CLOSED** (QC GWC) | **Do not reopen** — regression green only |
| Email outbox / accept-invite SM | **HOLD** | BR-ADM-04-TEMP-PWD-08 retained |
| G-ADM-01 / G-ADM-05 | **CLOSED** (must_keep) | Not touched |

---

## 6. Residual / HOLD

| Item | Status |
|------|--------|
| **QA-HRM-ADM-UPSERT-PWD-01** | **CLOSED** (unit/contract) · PASS_TO_PM |
| Live platform-admin upsert mutate / browser UF | **not claimed** (U65 · HOLD_DEPLOY) |
| Email outbox / accept-invite SM | **HOLD** |
| Phase1 / PROD | **NO claim** |

---

## 7. Handoff

```yaml
work_item_id: QA-HRM-ADM-UPSERT-PWD-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hrm-adm-upsert-pwd-01-20260727.md
next_owner: qc
next_work_item_id: QC-HRM-ADM-UPSERT-PWD-01
pm_dispatch_hint: QC-HRM-ADM-UPSERT-PWD-01 — GWC unit/contract sibling upsert CSPRNG; G-ADM-04 remains CLOSED; HOLD_DEPLOY; NOT Phase1/PROD
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-ADM-UPSERT-PWD-01
role: qc
lane: governance · GWC local · HOLD_DEPLOY · sibling upsert CSPRNG (not reopen G-ADM-04)
workspace: C:\xevn-ecosystem

read_first:
- docs/qa/evidence/qa-hrm-adm-upsert-pwd-01-20260727.md
- docs/qa/evidence/be-hrm-adm-upsert-pwd-01-20260727.md
- docs/qa/evidence/qc-hrm-adm-invite-04-20260727.md (G-ADM-04 CLOSED — do not reopen)
- docs/hrm/API_DESIGN_HRM_ADMIN.md §C.1 sibling note

entry_criteria: QA-HRM-ADM-UPSERT-PWD-01 PASS_TO_PM · HOLD_DEPLOY
exit_criteria:
1) Audit QA exit matrix 6/6 + jest 17/17 EXIT 0 (re-spot service+controller)
2) Confirm upsertCompanyMembership factory generateInviteTempPassword; zero literal 12345678 as password
3) G-ADM-04 remains CLOSED; invite AC regression green; HOLD outbox/accept-SM
4) Verdict GO or GWC · evidence docs/qa/evidence/qc-hrm-adm-upsert-pwd-01-20260727.md → PASS_TO_PM
5) NOT Phase1/PROD/:8088 · no invent mailer · no seed · no UF admin mutate claim

cấm: reopen G-ADM-04 without FAIL · invent mailer · seed · Phase1/PROD
```
