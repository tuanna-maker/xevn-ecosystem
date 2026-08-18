# BE-HRM-ADM-AUDIT-01 — G-ADM-01 admin_audit_logs + FR-05 write

| Field | Value |
|-------|--------|
| **work_item_id** | `BE-HRM-ADM-AUDIT-01` |
| **from_role** | `dev-be` |
| **to_role** | `qa` |
| **lane** | execution |
| **change_mode** | ADD · preserve_default |
| **date** | 2026-07-27 |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Plane | Path · § |
|-------|----------|
| **srs** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` §3.27 **FR-HRM-05** Diễn biến **#6** (Lưu thành công) · **#8** (nhật ký) · **NFR-HRM-04** · team `docs/hrm/SRS.md` UC-HRM-05 «ghi nhật ký» |
| **tech_spec** | `docs/hrm/TECHSPEC.md` §16.2 G-ADM-01 · rows FR-HRM-05 |
| **db_design** | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` **§5** `admin_audit_logs` (columns · CHK action/outcome · indexes · detail §5.4) |
| **api_design** | `docs/hrm/API_DESIGN_HRM_ADMIN.md` **§D** reset · **§D.1** audit write F.1 (mục đích · nghiệp vụ · bước SRS #6/#8) |
| **design evidence** | `docs/qa/evidence/sa-hrm-adm-audit-design-01-20260727.md` |
| **uc_ids** | FR-HRM-05 · UC-HRM-05 |
| **change_mode** | ADD |
| **sponsor_confirm** | G-ADM-01 DESIGN READY → BE implement (PM dispatch 2026-07-27) |

---

## 1. Closed scope

| Exit | Status | Notes |
|------|--------|-------|
| `ensureAdminSchema` CREATE `admin_audit_logs` + 4 indexes | ✅ | Per DB_DESIGN §5 DDL + `ix_*` |
| `resetUserPassword` success path INSERT audit | ✅ | Same TX via `HrmDbService.withTransaction`; action vocab §5.3; `detail` §5.4 no secrets |
| Fail-closed if audit INSERT fails | ✅ | TX rollback · reject success |
| jest | ✅ | 5/5 `hrm-admin.service.spec.ts` |
| CODE-MEMORY APPEND | ✅ | `hrm-admin.service.ts` `@CODE-MEMORY-CHANGE` BE-HRM-ADM-AUDIT-01 |
| Residual docs | ✅ | G-ADM-01 → **CLOSED** in DB/API/TECHSPEC |

### Implementation touchpoints

| File | Change |
|------|--------|
| `apps/api/hrm-api/src/db/hrm-db.service.ts` | ADD `withTransaction` (same-connection BEGIN/COMMIT) |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.service.ts` | DDL + reset audit INSERT + helpers |
| `apps/api/hrm-api/src/hrm-admin/hrm-admin.service.spec.ts` | Audit row · no secret · fail-closed · schema ensure |

---

## 2. must_keep verification

| Item | Status |
|------|--------|
| G-ADM-DTO-01 CLOSED | Untouched |
| OpenAPI admin F.1 CLOSED | Untouched (no OA reopen) |
| Auth/Tenant cite | Cite only — dual plane |
| Fleet / OP / Payroll | Untouched |
| HOLD_DEPLOY · U65 · no seed | Affirmed |
| No plaintext password in `detail` | Asserted in jest |
| GET audit list invent as DONE | **Not** done — **G-ADM-01-READ** remains Info |

---

## 3. Verify commands

```bash
pnpm --filter hrm-api exec jest --testPathPatterns=hrm-admin.service.spec --no-coverage
# Test Suites: 1 passed · Tests: 5 passed · EXIT 0
```

---

## 4. Residuals (post-implement)

| ID | Status | Note |
|----|--------|------|
| ~~G-ADM-01~~ | **CLOSED** | Physical + FR-05 write |
| **G-ADM-01-READ** | Info | GET list UI — non-goal this WI |
| **G-ADM-05** | OPEN | 0-row reset still returns success; audit skipped when `rows_profiles < 1` |
| **G-ADM-04** / SCOPE-01 | OPEN | Unrelated |

---

## 5. Handoff

- **completion_report:** G-ADM-01 implemented — `admin_audit_logs` in `ensureAdminSchema`; FR-05 reset success writes append-only audit in same TX (fail-closed); jest 5/5; no secrets in detail; CODE-MEMORY APPEND; G-ADM-01 residual CLOSED. Residual: G-ADM-01-READ (GET list Info), G-ADM-05 (404 missing user).
- **next_owner:** `qa`
- **ack_status:** **READY_FOR_QA**
- **evidence_path:** `docs/qa/evidence/be-hrm-adm-audit-01-20260727.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: QA-HRM-ADM-AUDIT-01
role: qa
lane: execution · verify G-ADM-01 FR-05 audit write
entry_criteria: BE-HRM-ADM-AUDIT-01 READY_FOR_QA · evidence be-hrm-adm-audit-01-20260727.md
read_first:
  - docs/hrm/API_DESIGN_HRM_ADMIN.md §D / §D.1
  - docs/hrm/DB_DESIGN_HRM_ADMIN.md §5
  - docs/qa/evidence/be-hrm-adm-audit-01-20260727.md
AC (browser-or-API L1 + FE if stack up — U65 zero-seed):
  1) After privileged POST /api/hrm/admin/reset-user-password 2xx with real profile row updated → row exists in admin_audit_logs (action vocab; outcome=success)
  2) detail JSON has password_changed/email_changed only — no plaintext/hash
  3) Regression: G-ADM-DTO-01 / OpenAPI admin F.1 unchanged; no GET audit invent claimed DONE
  4) jest hrm-admin.service.spec still 5/5
exit_criteria: evidence docs/qa/evidence/qa-hrm-adm-audit-01-20260727.md · PASS_TO_PM or FAIL with defect
cấm: seed · plaintext assert fail ignored · invent GET list PASS
persona: platform_admin | group_ceo (ceo@xe.vn) if live stack
HOLD_DEPLOY · U65
```
