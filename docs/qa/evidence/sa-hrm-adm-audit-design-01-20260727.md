# SA-HRM-ADM-AUDIT-DESIGN-01 — G-ADM-01 physical audit design

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-HRM-ADM-AUDIT-DESIGN-01` |
| **from_role** | `pm` |
| **to_role** | `sa` |
| **lane** | governance · close G-ADM-01 physical (before BE code) |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Deliverables

| Artifact | Path | Action |
|----------|------|--------|
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` §5 **`admin_audit_logs`** | **ADD** columns · PK · soft FK · indexes · RLS/scope · DDL sketch · `ref_srs` FR-05 / NFR-HRM-04 |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_ADMIN.md` §D + **§D.1** | **UPDATE** FR-05 success path writes audit — Mục đích · Nghiệp vụ · Bước SRS #6/#8 |
| TechSpec residual | `docs/hrm/TECHSPEC.md` §16.2 G-ADM-01 | **UPDATE** → **DESIGN READY** |
| Pointers | `docs/tech-spec/DB_DESIGN_HRM_ADMIN.md` · `API_DESIGN_HRM_ADMIN.md` | Note audit ADD + evidence |
| `apps/**` | — | **Not touched** (spec-before-code) |

---

## 2. Physical table summary

| Item | Value |
|------|--------|
| Table | `public.admin_audit_logs` |
| Mode | Append-only INSERT |
| Soft refs | `actor_user_id` / `target_user_id` → `profiles.user_id` (no hard FK) |
| Actions | `credential_password_reset` · `credential_email_change` · `credential_password_and_email` |
| Secrets | **Cấm** password / hash in `detail` JSONB |
| Runtime today | **Not** in `ensureAdminSchema` — BE implements |
| Scope/RLS | App-layer platform privilege gate; Postgres RLS optional later |

---

## 3. F.1 — FR-05 audit write

| Check | Status |
|-------|--------|
| Mục đích (VI) | ✅ nhật ký nhạy cảm / NFR-HRM-04 |
| Nghiệp vụ xử lý | ✅ INSERT after credential UPDATE; same TX preferred; fail closed if audit fails |
| Bước SRS | ✅ FR-HRM-05 Diễn biến **#6** · **#8** · team UC-HRM-05 «ghi nhật ký» |
| Residual mark | ✅ **G-ADM-01 DESIGN READY** for `BE-HRM-ADM-AUDIT-01` |

---

## 4. must_keep verification

| Item | Status |
|------|--------|
| G-ADM-DTO-01 CLOSED | Untouched |
| OpenAPI admin F.1 CLOSED | Untouched (deepen audit = BE WI) |
| G-ADM-03 CLOSED (KEEP UPSERT) | Untouched |
| Auth/Tenant cite | Cite only |
| Fleet / OP / Payroll / Leave / ATT pairs | Untouched |
| HOLD_DEPLOY · U65 · no seed | Affirmed |
| Client SRS rewrite | **No** (no_prompt_echo) |

---

## 5. Residuals (post-design)

| ID | Status | Next |
|----|--------|------|
| **G-ADM-01** | **DESIGN READY** | `BE-HRM-ADM-AUDIT-01` — ensureAdminSchema + INSERT on reset |
| **G-ADM-01-READ** | Info | GET list UI optional |
| **G-ADM-05** | OPEN | Prefer 404 before silent 0-row success audit |
| **G-ADM-04** / SCOPE-01 | OPEN | Unrelated |

---

## 6. Handoff

- **completion_report:** G-ADM-01 physical design closed — table + FR-05 write F.1 documented; no Nest/migration.
- **next_owner:** `dev-be` (via PM dispatch)
- **ack_status:** **PASS_TO_PM**
- **evidence_path:** `docs/qa/evidence/sa-hrm-adm-audit-design-01-20260727.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BE-HRM-ADM-AUDIT-01
role: dev-be
lane: execution · implement G-ADM-01 (DESIGN READY)
change_mode: ADD · preserve_default
read_first:
  - docs/hrm/DB_DESIGN_HRM_ADMIN.md §5 admin_audit_logs
  - docs/hrm/API_DESIGN_HRM_ADMIN.md §D / §D.1 FR-05 audit write
  - docs/qa/evidence/sa-hrm-adm-audit-design-01-20260727.md
must_keep: G-ADM-DTO-01 CLOSED · OpenAPI admin F.1 CLOSED · Auth/Tenant cite · Fleet/OP/Payroll · HOLD_DEPLOY · U65 · no plaintext in logs
entry_criteria: G-ADM-01 DESIGN READY · ensureAdminSchema thiếu admin_audit_logs
exit_criteria:
  1) ensureAdminSchema CREATE TABLE IF NOT EXISTS admin_audit_logs + indexes per DB_DESIGN §5
  2) resetUserPassword success path INSERT audit (action vocab + detail no secrets); same TX preferred
  3) jest: reset success → audit row; fail if secret in detail; CODE-MEMORY APPEND
  4) evidence docs/qa/evidence/be-hrm-adm-audit-01-20260727.md · READY_FOR_QA
cấm: seed · reopen DTO/OA · invent GET audit list as DONE · Phase1/PROD · wipe siblings
```
