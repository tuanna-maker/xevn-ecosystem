# BA-HRM-ADM-INVITE-04 — G-ADM-04 invite temporary password policy

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-HRM-ADM-INVITE-04` |
| **role** | `ba-process` · governance |
| **date** | 2026-07-27 |
| **change_mode** | ADD (policy + AC) · preserve_default |
| **lane** | Close residual **G-ADM-04** design SoT → DESIGN READY for BE |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Problem

| Artifact | Says / does |
|----------|-------------|
| Runtime `HrmAdminService.inviteEmployees` | `findOrCreatePortalUser(..., '12345678', ...)` — fixed secret |
| API_DESIGN §C (before) | Documented hardcoded temp + residual G-ADM-04 |
| Client FR-HRM-04 | «kênh đã cấu hình» / «chờ chấp nhận» — **not** claimed DONE this wave |
| must_keep | No invent full email outbox / accept-invite SM |

**Exit:** Normative temp-password policy + measurable AC; G-ADM-04 **DESIGN READY** (not CLOSED — code still non-compliant); HOLD outbox/accept-SM.

---

## 2. Options evaluated

| Option | Scope | Risk | Timeline |
|--------|-------|------|----------|
| **A — CSPRNG hash-only, no plaintext on wire** (recommended) | Replace fixed secret; no API reveal; HOLD outbox | Low — matches security baseline + FR-05 «không lộ MK» | Same day docs → BE small |
| **B — One-time plaintext in API response** | Admin copies password from `results[]` | Medium — wire/log/UI leak; fights §0.1 «never return plaintext» | Reject unless sponsor CR |
| **C — Full email outbox + accept-invite SM** | Token table, mailer, pending status | High — invent product; out of must_keep | **HOLD** / future CR |

**Decision: Option A.**

Rationale:

1. Removes insecure predictable password without inventing mailer product.
2. Aligns with existing common contract «Password response: never».
3. Existing-user re-invite stays membership-only (no forced password churn).
4. Client «kênh mời» / «chờ chấp nhận» remains aspirational → documented **HOLD**.

---

## 3. SoT policy (normative)

Canonical: `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§C.1** · team AC in `docs/hrm/SRS.md` UC-HRM-04.

| Item | Value |
|------|--------|
| Endpoint | `POST /api/hrm/admin/invite-employee` |
| New profile | CSPRNG temp password · length ≥12 · letter+digit charset · hash only |
| Existing profile | Membership UPSERT only — **no** password overwrite |
| Response | **No** plaintext / password fields on envelope or `results[]` |
| Forbidden | Literal `12345678` (or any fixed invite secret) |
| HOLD | Email outbox · invite token · accept-invite SM · one-time API reveal |
| Post-create credential path | FR-05 reset (admin) or future outbox CR |

**G-ADM-04 status:** **DESIGN READY** (not CLOSED).

---

## 4. Artifacts updated (ADD)

| Path | Delta |
|------|--------|
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` | §0.1 invite temp · §C nghiệp vụ · **§C.1** BR/AC · residual DESIGN READY · §6 FE |
| `docs/hrm/DB_DESIGN_HRM_ADMIN.md` | `password_hash` cite FR-04 · gap G-ADM-04 DESIGN READY |
| `docs/hrm/SRS.md` UC-HRM-04 | BR-ADM-04-TEMP-PWD-* + AC-ADM-04-TEMP-01..05 |

**Unchanged / must_keep:** Client FR-04 wipe avoided · email outbox invent avoided · Fleet/OP/W2/Payroll · `apps/**` · no seed · no Phase1 claim.

**Code AS-IS (evidence only — not patched):** `apps/api/hrm-api/src/hrm-admin/hrm-admin.service.ts` still passes `'12345678'` in `inviteEmployees` (~line 301). Sibling `createCompanyAdmin` may share fixed secret — optional same-PR helper reuse; not required to close G-ADM-04 invite design.

---

## 5. Acceptance criteria (BE/QA-ready)

| ID | Pass |
|----|------|
| **AC-ADM-04-TEMP-01** | Invite create path has **zero** literal fixed temp password (`12345678`) |
| **AC-ADM-04-TEMP-02** | `HRM-ADMIN-203` body / `results[]` have **no** password secret fields |
| **AC-ADM-04-TEMP-03** | Two new-user invites → distinct stored password hashes |
| **AC-ADM-04-TEMP-04** | Re-invite existing email → `password_hash` unchanged |
| **AC-ADM-04-TEMP-05** | Generator unit test: length ≥12 + charset rules |

U65: browser FE batch if present — assert UI does not show temp password after 2xx. L1/unit sufficient for contract close of G-ADM-04 after BE. **Cấm seed**.

---

## 6. Residual / HOLD

| ID | Status | Note |
|----|--------|------|
| **G-ADM-04** | **DESIGN READY** → BE implement | Close when AC-01..05 PASS |
| Email outbox / accept-invite SM | **HOLD** | Non-goal; do not invent |
| One-time plaintext API reveal | **Rejected** (Option B) | Needs sponsor CR to reopen |
| `createCompanyAdmin` fixed temp | Sibling Info | May reuse generator in `BE-HRM-ADM-INVITE-04` |

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Locked Option A CSPRNG temp-password policy §C.1 + team AC; G-ADM-04 **DESIGN READY**; HOLD outbox/accept-SM; no `apps/**`. |
| **next_owner** | `dev-be` |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/ba-hrm-adm-invite-04-20260727.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BE-HRM-ADM-INVITE-04
role: dev-be
lane: execution
change_mode: FIX
preserve_default: true
code_memory_required: true
code_memory_mode: APPEND

read_first (ordered):
1. docs/hrm/API_DESIGN_HRM_ADMIN.md §C + §C.1 (G-ADM-04 DESIGN READY — BR-ADM-04-TEMP-PWD-01..08, AC-ADM-04-TEMP-01..05)
2. docs/hrm/DB_DESIGN_HRM_ADMIN.md — profiles.password_hash · gap G-ADM-04
3. docs/hrm/SRS.md UC-HRM-04 AC-ADM-04-TEMP-*
4. docs/qa/evidence/ba-hrm-adm-invite-04-20260727.md
5. apps/api/hrm-api/src/hrm-admin/hrm-admin.service.ts — inviteEmployees + findOrCreatePortalUser

spec_read_ack required before code:
- srs: docs/hrm/SRS.md UC-HRM-04 · AC-ADM-04-TEMP-01..05
- tech_spec: docs/hrm/TECHSPEC.md §16.2 FR-HRM-04 / HRM-ADMIN-203
- db_design: docs/hrm/DB_DESIGN_HRM_ADMIN.md · profiles.password_hash
- api_design: docs/hrm/API_DESIGN_HRM_ADMIN.md §C.1 · mục đích invite batch · bước SRS FR-04 #6/#7
- sponsor_confirm: BA-HRM-ADM-INVITE-04 2026-07-27 DESIGN READY

allowed_paths:
- apps/api/hrm-api/src/hrm-admin/**
- apps/api/hrm-api/src/hrm-admin/**/*.spec.ts (or equivalent unit tests)
- docs/qa/evidence/be-hrm-adm-invite-04-*.md
- docs/hrm/API_DESIGN_HRM_ADMIN.md / DB_DESIGN residual status only if closing G-ADM-04 after evidence

forbidden_paths:
- invent email outbox / mailer / invite token table / accept-invite SM
- return plaintext password in API response
- wipe FR-04 / Fleet / OP / W2 / Payroll
- seed scripts for UF evidence
- apps/web-portal/** (unless toast already echoes password — then minimal FE only)

entry_criteria: G-ADM-04 DESIGN READY; runtime still uses '12345678' in inviteEmployees
exit_criteria:
1) Replace hardcoded invite temp password with CSPRNG generator (≥12, charset §C.1)
2) New profile only; existing profile must not overwrite password_hash
3) Response never includes plaintext password
4) Jest: AC-ADM-04-TEMP-01..05 (or mapped unit coverage)
5) Mark G-ADM-04 CLOSED in API/DB residual tables + evidence PASS → READY_FOR_QA
6) Optional: reuse same generator for createCompanyAdmin fixed temp (sibling) — not required to close invite residual

must_keep: hash algorithm path; batch per-row continue-on-error; soft employee_id; U65 no-seed

evidence_path: docs/qa/evidence/be-hrm-adm-invite-04-20260727.md
ack_status target: READY_FOR_QA
```

---

## 8. Verdict

| Gate | Result |
|------|--------|
| Policy locked Option A | **PASS** |
| Outbox/accept-SM not invented | **PASS** (HOLD documented) |
| G-ADM-04 | **DESIGN READY** (not CLOSED) |
| Phase1 / PROD claim | **Not claimed** |

**ack_status: PASS_TO_PM**
