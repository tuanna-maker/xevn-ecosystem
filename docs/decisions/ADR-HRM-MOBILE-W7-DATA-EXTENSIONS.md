# ADR: HRM Mobile W7 — Data extensions (leave balance, attachment, directory)

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-HRM-MOBILE-W7-DATA-EXTENSIONS |
| **work_item_id** | `PCOMP-W7-SA-SKIM-01` |
| **Status** | **Accepted (stub — implementation W7-3..W7-5)** |
| **Date** | 2026-06-07 |
| **Decision owner** | SA |
| **Normative pair** | `docs/hrm/MOBILE_W7_SRS_DELTA.md`, `docs/hrm/MOBILE_W7_DATA_CONTRACTS.md`, `docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md` |
| **Scope ADR** | `ADR-HRM-RBAC-SCOPE-LADDER.md`, `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` |
| **Evidence** | `docs/program/governance/pcomp-w7-sa-skim-01-20260607.md` |

---

## 1. Context

Wave **P1-MOBILE-W7** adds mobile-facing capabilities that require **new persistence or API surfaces** beyond the W7-0 baseline (avatar column, `GET /home/summary` 04a). BA pack PASS (`PCOMP-W7-BA-SRS-01`, `PCOMP-W7-BA-DATA-01`) defines contracts; this ADR locks **storage shape**, **route strategy**, and **scope invariants** so Dev-BE does not fork resolver paths.

---

## 2. Decisions

### D-W7-01 — Leave medical attachment storage

| Option | Verdict |
|--------|---------|
| A. `leave_requests.attachment_url` TEXT NULL (single file) | **Accepted — Phase 1 W7-3** |
| B. `custom_fields.attachment_urls` JSONB array | Rejected — no typed validation; harder download auth |
| C. Join table `leave_request_attachments` | Deferred — only if multi-file + audit retention becomes P0 |

**Rationale:** Pilot SRS allows max 3 files client-side; server stores **one primary URL** in W7-3. Multi-file backlog uses client loop with last-wins or follow-up ADR amendment — not blocking W7-3 DONE.

**Migration:** `ALTER TABLE public.leave_requests ADD COLUMN attachment_url TEXT NULL;`

**Scope:** Upload `feature=leave-attachment` uses existing write scope; GET detail returns URL only to owner + manager/HR in scope (`assertResourceInHrmScope` on leave row).

---

### D-W7-02 — Leave balance SoT

| Option | Verdict |
|--------|---------|
| A. Table `employee_leave_balances` | **Accepted** |
| B. Computed-only from `leave_requests` aggregate | Rejected — entitled_days needs policy row |
| C. `custom_fields.leave_balance_*` write path | **Read-only interim fallback** until seed/migration |

**Endpoint:** `GET /api/hrm/attendance/leave-balance` (new controller method on attendance module).

**Scope invariant:**

1. `resolveHrmListScope(authorization, query.company_id, { tenantId })`
2. Non-HR JWT: `query.employee_id` **must equal** JWT `employee_id` → else `403 HRM-LEAVE-403`
3. HR/manager rollup: same workforce filter as leave list (`pushWorkforceEmployeeScopeFilter` on employee join)

**No list↔detail parity gap** — read-only scalar resource.

---

### D-W7-03 — Employee directory route strategy

| Option | Verdict |
|--------|---------|
| A. New `GET /employees/directory` | Rejected — duplicate resolver maintenance |
| B. **`view=directory` on existing `GET /employees` and `GET /employees/:id`** | **Accepted** |

**Rationale:** `employees.service.ts` already uses `resolveHrmListScope` + `pushEmployeeListScopeFilters` for list and `queryEmployeeById` for detail. Directory is a **field projection + PII filter**, not a new scope domain.

**Projection rules (both list and detail):**

- Include: `id`, `employee_code`, `full_name`, `job_title_key`, `department` (from `custom_fields`), `avatar_url`, `status`, optional `work_phone`/`phone_number` per policy
- **Exclude:** raw `custom_fields`, `date_of_birth`, `email` plaintext on list (mask on detail for non-HR)

**Parity:** List-visible `id` must load detail with same `view=directory` — mandatory QA probe `VAL-W7-DIR-01` under group CEO `company_id=main`.

**Index (non-blocking):** Optional partial index `(company_id, status) WHERE archived_at IS NULL` for directory search — add in migration only if EXPLAIN shows seq scan at UAT scale; not required for W7 gate.

---

### D-W7-04 — Home summary celebrations / whos_out (W7-1)

No new tables. **Scope stack (mandatory):**

| Branch | Resolver | Filter helper |
|--------|----------|---------------|
| `celebrations` | `resolveHrmListScope` | `pushWorkforceEmployeeScopeFilter` on employee query — same as `loadViewer` |
| `whos_out` | `resolveHrmListScope` via `LeaveRequestsService` | Existing list SQL + new `covering_date` param |

**Privacy:** Celebrations payload **must not** include `birth_year`, `date_of_birth`, or unfiltered `custom_fields` (grep gate in `home.service.spec.ts` — extend for populated items).

**whos_out cross-nav (J-MOB-09):** Prefer adding scoped `GET /attendance/leave-requests/:id` using same assert pattern as approve/reject — **residual** if not in W7-1 slice; list-only detail is acceptable GWC with client-held `leave_request_id` from summary item.

---

## 3. Non-goals (W7)

- MOB-UX-04c quick-action pin, MOB-UX-05 search hub, GPS geofence
- Full offline write queue
- RLS (`PLATFORM_RLS_ENABLED`) — unchanged; app-layer scope only

---

## 4. Verification (Dev-BE / QA)

| Check | Command / probe |
|-------|-----------------|
| Home scope + DOB privacy | `pnpm --filter hrm-api test -- home.service.spec.ts` |
| Celebrations workforce SQL | Assert `pushWorkforceEmployeeScopeFilter` in celebrations builder |
| Directory parity main | Group CEO `company_id=main` list id → detail 200/404 match |
| Leave balance foreign id | Non-HR GET other `employee_id` → 403 |
| Attachment scope | Foreign leave GET hides `attachment_url` |

---

## 5. Rollout order

1. W7-1 — `home/summary` populate celebrations + whos_out (no migration)
2. W7-3 — `attachment_url` column + DTO
3. W7-4 — `employee_leave_balances` seed + balance GET
4. W7-5 — `view=directory` projection on employees routes
