# QA-HRM-ADM-AUDIT-01 — G-ADM-01 FR-05 audit write verify

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-ADM-AUDIT-01` |
| **from_role** | `qa` |
| **to_role** | `pm` → `qc` |
| **lane** | execution · U65 · HOLD_DEPLOY |
| **date** | 2026-07-27 |
| **root** | `C:\xevn-ecosystem` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** (L1 live mutate **not** executed — documented limit below) |

---

## spec_read_ack

| Plane | Cite |
|-------|------|
| **api_design** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§D** reset · **§D.1** audit write F.1 |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` **§5** `admin_audit_logs` (vocab · detail §5.4 · CHK · indexes) |
| **be_evidence** | `docs/qa/evidence/be-hrm-adm-audit-01-20260727.md` READY_FOR_QA |
| **srs** | FR-HRM-05 Diễn biến **#6** / **#8** · NFR-HRM-04 |

---

## Environment / probes

| Check | Result |
|-------|--------|
| `http://127.0.0.1:28001` hrm-api health | **DOWN** (`Unable to connect`) |
| `DATABASE_URL_HRM` read-only table probe | **ECONNREFUSED** (Postgres unreachable from agent host) |
| Live `POST /api/hrm/admin/reset-user-password` | **SKIPPED** — stack down + HOLD_DEPLOY / U65: **cấm** seed; **không** start mutate credential trên persona thật khi L0 FAIL |
| Seed | **None** |

### L1 honesty (exit_criteria #1 fallback)

Prefer path (privileged POST 2xx → row in `admin_audit_logs`) **could not** be exercised safely this session. Fallback accepted by dispatch: **jest audit suite PASS** + **schema/DDL source probe** (runtime `ensureAdminSchema` vs DB_DESIGN §5) + secret-in-detail asserts.

**Residual for QC:** Live L1 audit row observation = **deferred** until stack L0 up — **not** invent as browser UF 🟢; does **not** reopen G-ADM-01 as FAIL when unit + contract PASS.

---

## AC results

### AC1 — Audit write on success path (vocab + outcome=success)

| Assert | Evidence | Status |
|--------|----------|--------|
| Success path INSERT `admin_audit_logs` same TX | `hrm-admin.service.spec.ts` + `resetUserPassword` → `withTransaction` + INSERT | ✅ |
| `action` ∈ §5.3 vocab | jest: `credential_password_reset` · `credential_password_and_email` | ✅ |
| `outcome='success'` | service INSERT literal `'success'` + jest params | ✅ |
| Fail-closed if audit INSERT throws | jest rejects `audit_insert_failed` (TX rollback path) | ✅ |
| Schema ensure DDL §5 | Source `CREATE TABLE IF NOT EXISTS public.admin_audit_logs` + 4 `ix_admin_audit_logs_*` + CHK action/outcome | ✅ |
| Live DB row after POST | Not observed (L0 down) | ⬜ documented |

### AC2 — `detail` JSON no secrets

| Assert | Status |
|--------|--------|
| Keys `password_changed` / `email_changed` (+ optional `email_after`, `rows_profiles`) | ✅ jest + service |
| **No** plaintext password / hash / `password` / `password_hash` / `new_password` in detail | ✅ jest `not.toContain` + `not.toHaveProperty` |
| Secret-in-detail fail would be **FAIL** this WI | Gate honored — asserts present |

### AC3 — Regression / non-goals

| Item | Status |
|------|--------|
| G-ADM-DTO-01 | ✅ `hrm-admin.dto.spec` **7/7** PASS — plane TEXT company / UUID user untouched |
| OpenAPI admin F.1 | ✅ `hrm-api.yaml` version **1.3.5-admin-f1** · `POST /admin/reset-user-password` present · `pnpm run verify:openapi-hrm-p1-s3b` **85 checks PASS** |
| GET `/admin/audit*` invent as DONE | ✅ **NOT** present on `HrmAdminController` (only platform/company/invite/reset + membership helpers). OpenAPI has `/employee-metadata/audit-logs` (unrelated) — **G-ADM-01-READ** remains Info |
| Controller smoke | ✅ `hrm-admin.controller.spec` **4/4** |

### AC4 — jest suite

```text
pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin.service.spec --no-coverage
# Test Suites: 1 passed · Tests: 6 passed · EXIT 0
# (includes G-ADM-01 audit cases + G-ADM-05 404 must_keep coexistence)
```

Also: dto **7/7** · controller **4/4**.

---

## Command table

| # | Command | Exit | Note |
|---|---------|------|------|
| 1 | `pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin.service.spec --no-coverage` | **0** | 6/6 |
| 2 | `pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin.dto.spec --no-coverage` | **0** | 7/7 G-ADM-DTO-01 |
| 3 | `pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin.controller.spec --no-coverage` | **0** | 4/4 |
| 4 | `pnpm run verify:openapi-hrm-p1-s3b` | **0** | 85 checks |
| 5 | Health `:28001` | N/A | DOWN |
| 6 | DB `to_regclass('public.admin_audit_logs')` | N/A | ECONNREFUSED |

---

## Residual

| ID | Sev | Note |
|----|-----|------|
| **L1-live-audit-row** | Info / QC condition | Observe real INSERT after L0 up — optional retest; not blocker for G-ADM-01 unit/contract PASS this WI |
| **G-ADM-01-READ** | Info | GET audit list — **non-goal** — do not invent DONE |
| **G-ADM-05** | CLOSED (peer WI) | `BE-HRM-ADM-05-01` — out of scope claim here; audit success path must_keep verified coexists in same jest suite |
| OpenAPI §D description stale “audit = residual G-ADM-01” | Info | F.1 endpoints unchanged (must_keep) — copy refresh optional later OA wave, **not** reopen this WI |

---

## Verdict

**PASS_TO_PM** — G-ADM-01 FR-05 audit write verified at **jest + source DDL + OpenAPI/DTO regression**; detail secret gate PASS; no GET audit invent; U65 no seed; L1 live mutate honestly **not** run (stack down / HOLD_DEPLOY).

---

## Handoff

- **completion_report:** Closed QA-HRM-ADM-AUDIT-01. AC1 fallback PASS (jest 6/6 audit TX + vocab + fail-closed + DDL§5 in `ensureAdminSchema`). AC2 detail no secrets PASS. AC3 G-ADM-DTO-01 + OA F.1 unchanged; no GET admin audit DONE. L1 live POST/DB probe blocked (28001 down, Postgres ECONNREFUSED) — documented, not FAIL invent. Residual: live row observation Info; G-ADM-01-READ Info.
- **next_owner:** `qc`
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/qa-hrm-adm-audit-01-20260727.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QC-HRM-ADM-AUDIT-01
role: qc
lane: governance · Go/No-Go G-ADM-01 FR-05 audit write
entry_criteria: QA-HRM-ADM-AUDIT-01 PASS_TO_PM · evidence qa-hrm-adm-audit-01-20260727.md · BE be-hrm-adm-audit-01-20260727.md
read_first:
  - docs/hrm/API_DESIGN_HRM_ADMIN.md §D / §D.1
  - docs/hrm/DB_DESIGN_HRM_ADMIN.md §5
  - docs/qa/evidence/qa-hrm-adm-audit-01-20260727.md
gate:
  1) Confirm jest audit suite PASS + detail no plaintext/hash (AC2)
  2) Confirm G-ADM-DTO-01 / OpenAPI 1.3.5-admin-f1 F.1 unchanged; GET audit list NOT claimed DONE (G-ADM-01-READ Info)
  3) Accept L1 live mutate deferred as Info condition (stack was down / HOLD_DEPLOY / U65) — do NOT NO-GO solely for missing live row if unit+contract PASS
  4) HOLD_DEPLOY · U65 · no Phase1/PROD/:8088 claim
exit_criteria: evidence docs/qa/evidence/qc-hrm-adm-audit-01-20260727.md · GO or GO WITH CONDITIONS (list L1-live if any)
cấm: invent GET audit PASS · require seed · ignore secret-in-detail
```
