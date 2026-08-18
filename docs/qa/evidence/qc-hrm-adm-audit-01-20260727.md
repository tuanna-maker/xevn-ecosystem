# QC Gate — QC-HRM-ADM-AUDIT-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-ADM-AUDIT-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance · GWC local · HOLD_DEPLOY |
| **date** | `2026-07-27` (ICT) |
| **decision** | **GO WITH CONDITIONS** — **G-ADM-01 CLOSED** (FR-05 audit **write** path only) |
| **scope_claim** | Unit + contract: `admin_audit_logs` INSERT on reset success · detail no secrets · OpenAPI/DTO must_keep |
| **phase1_done_claim** | **NO** — NOT Phase 1 DONE |
| **prod_ready_claim** | **NO** — NOT PROD-READY · NOT `:8088` |
| **deploy** | **HOLD_DEPLOY** |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no seed · no live credential mutate required for this GWC · no UF admin browser claim |

---

## Scope (bounded — write-path GWC)

| In scope | Explicitly out (cấm) |
|----------|----------------------|
| Formal close **G-ADM-01** FR-05 audit **write** after BE + QA + QC spot | Invent **GET** `/admin/audit*` DONE (**G-ADM-01-READ**) |
| jest audit suite PASS + detail no plaintext/hash | Phase 1 DONE / PROD-READY / `:8088` |
| G-ADM-DTO-01 + OpenAPI **1.3.5-admin-f1** F.1 unchanged | Require seed / live mutate to close write path |
| Accept **L1-live-audit-row** deferred as Info (stack down) | Treat missing live row as product NO-GO when unit+contract PASS |
| API_DESIGN §D / §D.1 · DB_DESIGN §5 | UF admin browser mutate 🟢 |

**Spec SoT:** `docs/hrm/API_DESIGN_HRM_ADMIN.md` §D · §D.1 · §7 · `docs/hrm/DB_DESIGN_HRM_ADMIN.md` §5 · FR-HRM-05 #6/#8 · NFR-HRM-04.

---

## Micro-checklist (exit_criteria)

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Confirm jest audit suite PASS + detail no plaintext/hash | **PASS** — QC re-run `hrm-admin.service.spec` **6/6**; asserts `not.toContain` plaintext/hash + `password_changed`/`email_changed` only |
| 2 | G-ADM-DTO-01 / OpenAPI **1.3.5-admin-f1** F.1 unchanged; GET audit **NOT** DONE | **PASS** — OA verify **85** EXIT 0; controller has no GET audit; **G-ADM-01-READ** Info |
| 3 | Accept L1 live mutate deferred as Info (stack down) | **PASS** — ENV · not product NO-GO |
| 4 | Formal GWC: **G-ADM-01 CLOSED** (write) · HOLD_DEPLOY · NOT Phase1/PROD/:8088 | **PASS** |
| 5 | Evidence this path · PASS_TO_PM · bus append | **PASS** (same session) |

---

## Evidence chain audited

| Artifact | Gap / role | Verdict | Closed |
|----------|------------|---------|--------|
| `docs/qa/evidence/be-hrm-adm-audit-01-20260727.md` | DDL + TX INSERT + fail-closed | **READY_FOR_QA** | G-ADM-01 write |
| `docs/qa/evidence/qa-hrm-adm-audit-01-20260727.md` | jest + OA/DTO regression + L1 honesty | **PASS** · PASS_TO_PM | AC1 fallback + AC2 secrets |
| `docs/hrm/API_DESIGN_HRM_ADMIN.md` §D / §D.1 · §7 | F.1 audit write · residual | **CLOSED** cite `BE-HRM-ADM-AUDIT-01` | Write path |
| `docs/hrm/DB_DESIGN_HRM_ADMIN.md` §5 | `admin_audit_logs` vocab · detail §5.4 · indexes | **ALIGNED** | Physical SoT |
| `docs/api/openapi/hrm-api.yaml` | version **1.3.5-admin-f1** · `POST /admin/reset-user-password` | **UNCHANGED** | must_keep F.1 |
| Runtime controller | `HrmAdminController` | **PASS** QC grep | No GET audit route |

**must_keep:** G-ADM-DTO-01 CLOSED · OpenAPI admin F.1 CLOSED · Auth/Tenant cite · U65 · HOLD_DEPLOY · no plaintext in `detail` · no invent GET audit.

---

## Spot verify (QC)

### Command table

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin.service.spec --no-coverage` | **PASS** exit **0** — Tests **6/6** (QC re-run 2026-07-27) | PRODUCT (unit) |
| `pnpm run verify:openapi-hrm-p1-s3b` | **PASS** exit **0** — **85** checks | PRODUCT (contract) |
| Grep jest: `credential_password_reset` · `credential_password_and_email` · `not.toContain` plaintext/hash · `audit_insert_failed` fail-closed | **Present** | PRODUCT |
| Grep controller: `@Post('reset-user-password')` · no `@Get('audit` | **Present** / **Absent** as required | PRODUCT |
| OpenAPI `info.version: 1.3.5-admin-f1` + `/admin/reset-user-password` | **Present** | PRODUCT |
| Health `:28001` / live POST reset / DB `admin_audit_logs` row | **SKIPPED** — DOWN / ECONNREFUSED (QA honesty) | ENV — Info condition |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-adm-audit-01-20260727.md` | **FAIL** 2/8 (`portal_url`, `journey_l25`) | PROCESS — unit/contract QA pack (expected) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hrm-adm-audit-01-20260727.md` | **PASS** exit **0** (8/8) — this QC pack | PROCESS |

**Portal URL / PORTAL_DEV_URL:** N/A for unit/contract audit-write gate — no browser UF in slice (`PORTAL_DEV_URL` not required; portal `127.0.0.1:5175` not exercised).

### Read-only / contract matrix (audit write)

| Module / AC | Create | Read | Update | Delete | Note |
|-------------|--------|------|--------|--------|------|
| `admin_audit_logs` INSERT on FR-05 success | **PASS** jest TX | N/A this WI | N/A append-only | N/A | §D.1 · DB §5 |
| `detail` no secrets | **PASS** jest | N/A | N/A | N/A | §5.4 · AC2 |
| Fail-closed audit INSERT | **PASS** jest reject | N/A | N/A | N/A | same TX rollback |
| GET `/admin/audit*` list | — | **not claimed** | — | — | **G-ADM-01-READ** Info |
| Admin UF browser mutate | — | **not claimed** | — | — | U65 · out of slice |
| OpenAPI `/admin/*` F.1 | — | **unchanged** | — | — | 1.3.5-admin-f1 must_keep |

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| G-ADM-01 FR-05 audit write (TX + vocab + fail-closed + DDL §5) | PRODUCT | **PASS** — CLOSED |
| detail no plaintext/hash | PRODUCT | **PASS** — secret gate honored |
| G-ADM-DTO-01 / OpenAPI 1.3.5-admin-f1 F.1 | PRODUCT | **PASS** — unchanged / must_keep |
| GET admin audit invent DONE | PRODUCT anti-goal | **PASS** — not invented; **G-ADM-01-READ** Info |
| L1 live POST/DB row not observed (`:28001` DOWN · Postgres ECONNREFUSED) | ENV | **Info condition** — **not** product NO-GO per dispatch |
| QA pack 2/8 missing portal/J-* | PROCESS | **OPEN P3** — expected unit/contract pack; QC pack 8/8 |
| Seed / FE mutate / Phase1 / PROD / `:8088` | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## L2.5 journey coverage

| J-ID / slice | Status | Note |
|--------------|--------|------|
| Admin UF / FR-05 browser journey | **N/A** this packet | Unit/contract write gate — L2.5 browser **not in entry criteria** |
| J-HRM-ADMIN mutate (if mapped later) | **not claimed** | Contract/unit PASS ≠ UF browser PASS (U65) |
| G-ADM-01 audit write path | **PASS** | jest + API_DESIGN §D.1 + DB §5 |

**QC:** No L2.5 product NO-GO — browser journey coverage **out of scope** for this write-path GWC. Do **not** promote admin UF mutate or GET audit list from this evidence.

---

## Residual / Conditions

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| ~~**G-ADM-01**~~ | — | **CLOSED** | This GWC · BE-HRM-ADM-AUDIT-01 + QA-HRM-ADM-AUDIT-01 + QC write path |
| **L1-live-audit-row** | Info | OPEN (condition) | `qa` optional when L0 up — observe real INSERT; **not** reopen G-ADM-01 without FAIL |
| **G-ADM-01-READ** | Info | OPEN | `dev-be` optional — GET audit list UI — **non-goal** · **cấm** invent DONE |
| **G-ADM-05** | Peer WI | Separate | `QA-HRM-ADM-05-01` in flight — **not** closed by this packet |
| **G-ADM-04** / **G-ADM-SCOPE-01** / **G-ADM-03** | P2 | OPEN | Unrelated residuals — stay OPEN |
| ~~**G-ADM-DTO-01**~~ | — | **CLOSED** | Preserved — **no reopen** |
| OpenAPI admin F.1 | — | **CLOSED** (prior) | **1.3.5-admin-f1** unchanged — **no reopen** |
| **C-ADM-AUDIT-QA-PACK-01** | P3 PROCESS | OPEN | QA optional — enrich future unit packs with `PORTAL_DEV_URL` N/A + journey N/A for Layer B 8/8 |
| Phase1 / PROD / `:8088` | — | **NOT claimed** | HOLD_DEPLOY |

---

## Verdict

**GO WITH CONDITIONS**

- **Closed:** Soft residual **G-ADM-01** — FR-05 / NFR-HRM-04 audit **write**: `ensureAdminSchema` `admin_audit_logs` + same-TX INSERT on reset success; action vocab §5.3; `outcome=success`; fail-closed if audit INSERT fails; `detail` §5.4 flags only (no plaintext/hash); QA AC1 fallback + AC2 + AC3 PASS; QC re-run jest **6/6** + OpenAPI **85**; API_DESIGN §D.1 / DB §5 / residual CLOSED cite intact.
- **Conditions:** HOLD_DEPLOY; **L1-live-audit-row** Info (ENV stack was down — accepted); **G-ADM-01-READ** Info (GET list **not** DONE); peer **G-ADM-05** separate; **NOT** Phase 1 DONE; **NOT** PROD-READY; **NOT** `:8088`; no UF admin mutate claim.
- **cấm honored:** no invent GET audit PASS · no seed · no ignore secret-in-detail · no Phase1 claim · no NO-GO solely for missing live row when unit+contract PASS.

---

## Handoff

### completion_report

**Closed:** QC gate **GO WITH CONDITIONS** for `QC-HRM-ADM-AUDIT-01`. Independent audit confirms **G-ADM-01 CLOSED (write path)**: BE TX/DDL + QA jest/OA/DTO + QC re-run `hrm-admin.service.spec` **6/6** (vocab · no secrets · fail-closed · schema ensure) + `verify:openapi-hrm-p1-s3b` **85 EXIT 0**; OpenAPI **1.3.5-admin-f1** and **G-ADM-DTO-01** unchanged; controller has **no** GET audit; L1 live row deferred as **Info ENV** (not product NO-GO). QC evidence-pack **8/8**. U65 · HOLD_DEPLOY · **NOT** Phase1/PROD/:8088 · **no** GET audit invent · **no** UF admin claim.

**Residual:** L1-live-audit-row Info; G-ADM-01-READ Info; C-ADM-AUDIT-QA-PACK-01 P3 PROCESS; G-ADM-05 peer separate; G-ADM-03/04/SCOPE-01 stay OPEN; no product P0/P1 on write path.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-INTAKE-QC-HRM-ADM-AUDIT-01
from_role: qc
to_role: pm
lane: governance intake · G-ADM-01 write close
priority: P2

entry_criteria:
- QC-HRM-ADM-AUDIT-01 = GO WITH CONDITIONS
- evidence: docs/qa/evidence/qc-hrm-adm-audit-01-20260727.md
- QA PASS: docs/qa/evidence/qa-hrm-adm-audit-01-20260727.md
- BE: docs/qa/evidence/be-hrm-adm-audit-01-20260727.md

action:
1. Bus INTAKE: mark G-ADM-01 QC-verified CLOSED (FR-05 audit write only)
2. Keep G-ADM-01-READ Info OPEN — do NOT invent GET audit DONE
3. Keep L1-live-audit-row as optional Info retest when L0 up — do NOT reopen G-ADM-01 without FAIL
4. Continue QA-HRM-ADM-05-01 (peer) — do not conflate with this GWC
5. Keep HOLD_DEPLOY; do NOT claim Phase1/PROD/:8088
cấm: seed · invent GET audit PASS · Phase1/PROD/:8088 · reopen G-ADM-01 without FAIL · treat unit PASS as UF browser PASS
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/qc-hrm-adm-audit-01-20260727.md`

### pm_dispatch_hint

`PM-INTAKE` — GWC closes G-ADM-01 write only; G-ADM-01-READ + L1-live Info; HOLD_DEPLOY · NOT Phase1/PROD/:8088; peer QA-HRM-ADM-05-01 continues.
