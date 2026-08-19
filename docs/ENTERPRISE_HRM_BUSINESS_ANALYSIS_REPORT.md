# Enterprise HRM Business Analysis & Improvement Recommendations

**Module:** HRM_BUSINESS_FLOWS_ANALYSIS
**Policy:** No code changes — analysis only
**Sources:** BRD-XEVN-OS-001 v1.0, SRS-XEVN-OS-001 v1.0, FIELD_DISPLAY_SRS_*.md, S7_KICKOFF.md

---

## 1. Executive Summary

XeVN Ecosystem OS is a multi-tenant, multi-BU digital operations platform for XeVN Group (tourism, transport, services). Phase 1 covers 5 subsystems: **XBOS** (platform core), **HRM Web**, **HRM Mobile**, **Portal/CC**, and **Logistics** (limited scope).

- Key strengths: formal IEEE 830 SRS, structured 5-attribute field governance rules, comprehensive RBAC model, strict multi-tenant isolation, detailed workflow state machines with SLA tracking
- Key gaps: No formal API contract artifact, database schema not documented, recruitment workflow under-specified, absence of event schema, no connection pooling guidance

Recommendation: address P0 gaps before implementation starts. P1 improvements can be done in parallel with wave B code.

### File map for this report
- [ENTERPRISE_HRM_BUSINESS_ANALYSIS_REPORT.md](ENTERPRISE_HRM_BUSINESS_ANALYSIS_REPORT.md) — this file
- [HRM_BUSINESS_FLOWS_ANALYSIS_REPORT.md](HRM_BUSINESS_FLOWS_ANALYSIS_REPORT.md) — earlier flow-level analysis
- [FIELD_DISPLAY_SRS_XBOS.md](xbos/FIELD_DISPLAY_SRS_XBOS.md) — XBOS field governance rules
- [FIELD_DISPLAY_SRS_HRM.md](hrm/FIELD_DISPLAY_SRS_HRM.md) — HRM field governance rules
- [01_BRD_XeVN_OS.md](client-delivery/01_BRD_XeVN_OS.md) — business requirements
- [02_SRS_XeVN_OS.md](client-delivery/02_SRS_XeVN_OS.md) — software requirements
- [S7_KICKOFF.md](S7_KICKOFF.md) — sprint context

---

## Module Landscape

| Module | Full Name | Phase | Priority | Use Cases |
|---|---|---|---|---|
| XBOS | X-Business OS (Platform Core) | P0 | 6 UCs (B01–B06) |
| HRM Web | Human Resource Management Web | P0 | 6 UCs (H01–H06) |
| HRM Mobile | Mobile App (React Native) | P0 | 7 UCs (M01–M07) |
| Portal/CC | Command Center & Catalog | P1 | 3 UCs (P01–P03) |
| Logistics | Vehicle/Driver/Trip Mgmt | P1 — Limited | 4 UCs (L01–L04) |

Out of scope for Phase 1: CRM, Accounting/ERP integration, AI/ML engine, Advanced BI dashboards.

---

## XBOS — Platform Core Assessment

### Tenant Management (UC-B01)

BRD spec: slug globally unique under `[a-z0-9-]`, email domain whitelist, 48h activation link, status PROVISIONING → ACTIVE.


---

## XBOS — Platform Core Assessment

### Tenant Management (UC-B01)

BRD spec: slug globally unique under `[a-z0-9-]`, email domain whitelist, 48h activation link, status `PROVISIONING -> ACTIVE`.
Gaps:
- API endpoint path not specified (implied `/api/xbos/tenants`).
- Activation email service is not defined (3rd-party vs internal SMTP).
- Rollback behavior on API timeout > 5s is not specified — what state does the tenant revert to?
- Slug uniqueness is globally constrained but no DB-level enforcement strategy is described.

### RBAC Engine (UC-B02)

3-tier hierarchy: Platform (`SUPER_ADMIN`), Tenant (`TENANT_ADMIN`, `HR_MANAGER`, `DEPT_MANAGER`, `FINANCE_STAFF`, `RECRUITER`), Resource-level (department-scoped, payroll-period-scoped).
Gaps:
- Resource-level scoping (`department`, `payroll-period`) has no formal entity or API for storing/retrieving scopes.
- Token revocation described as "đánh dấu revoke" but not how short-lived JWT tokens are actually invalidated before expiry (Redis blacklist?).
- `TENANT_ADMIN` role is restricted to `SUPER_ADMIN` only — no secondary SA as fallback owner.

### Workflow Engine (UC-B03)

States: `SUBMITTED -> L1_PENDING -> L1_APPROVED -> L2_PENDING -> L2_APPROVED/REJECTED/CANCELLED`. SLA: L1 — 24h, L2 — 48h. Reminder every 4h, escalation at 2x SLA.
Gaps:
- No formal API contract for workflow transitions (endpoint paths, request/response schemas).
- The `workflow_instances` table structure is implied but never formally defined.
- Escalation routing ("cấp trên của approver") is not specified — is it the approver's manager? How resolved in org chart?
- Anti-self-approval rule exists but no enforcement mechanism is defined at the data-model level.
- Rejection requires min 10-char reason — validation rule in spec but no API-level enforcement described.

### Catalog Governance (UC-B04)

2-tier: Platform catalog (SA CRUD), Tenant catalog (TA extends but cannot delete platform values). Propagation flag: 7 days.
Gaps:
- No data model or API for catalog propagation scheduling.
- "Referenced values cannot be hard-deleted" — referential integrity enforcement not described at DB level.
- No versioning or audit trail for catalog changes.

### Audit Log (UC-B05)

Format: `{actor, tenantId, action, resource, timestamp}`. Immutable.
Gaps:
- No storage strategy described (separate table? append-only? cold storage?).
- No retention policy defined.
- No API endpoint for querying/filtering audit logs.

### Cross-Cutting Concerns

- No event schema or message bus contract defined for cross-module communication.
- No explicit error-code registry or HTTP status-code mapping across modules.
- No defined rate-limit or circuit-breaker patterns for the API gateway layer.

---

## HRM Web — Assessment

### Employee Management (UC-H01)

Form: 4 tabs — Personal Info / Job Position / Contract & Salary / Documents. Validation: CCCD unique per tenant, age 15-70, salary >= regional minimum.
Gaps:
- No API contract for the 4-tab form submission — is it one PATCH or multiple PUTs?
- Document upload flow (scan images) size limit, format, virus scanning not specified.
- "Manager must be active employee in same tenant" — no query optimization for large orgs.

### Attendance (UC-H02)

GPS check-in/out, geofence ≤ 200m, auto checkout after 10h, mock GPS detection.
Gaps:
- Geofence service architecture not specified — is it a separate microservice or embedded?
- Mock GPS detection relies on "Play Integrity API" (Android only) — no iOS equivalent mentioned.
- No compensation/time-off accrual for attendance anomalies (e.g., late check-in).

### Leave Management (UC-H03)

5 types: Annual (12 days), Sick (unlimited, doctor cert if >= 3 days), Maternity (6 months), Unpaid, Compensatory. Submit 3 days in advance for annual.
Gaps:
- How is "team calendar" data fetched? One query or N+1?
- Leave balance reset/rollover at year-end not specified.
- Concurrent leave requests — race condition handling not described.

### Payroll (UC-H04)

Batch on 25th, formula: Net = Gross - BHXH(8%) - BHYT(1.5%) - BHTN(1%) - PIT. 6 steps: Batch -> HR Review -> Finance Approve -> TA Confirm -> Issue -> Lock.
Gaps:
- Lock mechanism: row-level DB lock? Application-level flag?
- No API for mid-cycle adjustments before lock.
- Tax calculation (PIT) requires progressive tax table — how is it maintained?

### Recruitment (UC-H05)

Pipeline: JD -> Post -> CV -> Screening -> Interview -> Offer -> Onboard. States: NEW -> SCREENING -> INTERVIEW_SCHEDULED -> INTERVIEWED -> OFFER_SENT -> HIRED/REJECTED/WITHDREW.
Critical gap: BRD mentions 13-step dynamic workflow but SRS only describes a fixed 5-state pipeline. There is no employee onboarding workflow defined (post-HIRED steps).

### Reporting (UC-H06)

Only marked as "P1 — basic spec". No detail in SRS.
Gaps: No report types, no export formats, no scheduling defined.

---

## HRM Mobile — Assessment

### Multi-tenant Login (UC-M01)

Sequence: login -> list memberships -> select company -> issue scoped tokens. Biometric after first success. Lockout: 5 failed attempts -> 30 min.
Gaps:
- Token rotation for refresh_token not defined (rotating vs non-rotating).
- device fingerprint for "force logout on suspicious device" not specified.

### GPS Check-in (UC-M02)

Map view, geofence ring, manual fallback, mock GPS detection.
Gaps:
- Same Play Integrity API gap as web (Android only).
- No offline queue for attempted check-ins when network is down.

### Leave Mobile (UC-M03)

Employee flow: 5 steps. Manager flow: 5 steps including team calendar view.
Gaps:
- Team calendar requires fetching all team members' leave — N+1 risk if not batched.

### Payslip Mobile (UC-M04)

Security: auto-blur on background, screenshot audit log, encrypted PDF.
Gaps:
- PDF encryption key management not specified.
- "Background" detection on iOS vs Android — different APIs.

### Offline Mode (UC-M06)

Cache: profile 24h, attendance 30d (1h TTL), payslips 3m (7d TTL), leave list 30min, workplaces 7d.
Gaps:
- No conflict resolution strategy for offline-created leave requests synced later.

---

## Data Linkage & Integration Analysis

### Current State (per BRD/SRS)

The BRD describes integration as:
- XBOS -> HRM: REST API
- HRM -> XBOS: Event queue
- HRM -> Notification: Event queue

This is a one-directional, loosely-coupled pattern. The HRM service calls XBOS for auth/tenant data; XBOS emits events that HRM and Notification consume.

### Gap Analysis: Missing Data Linkages

| Linkage | BRD/SRS Claim | Actual State | Risk |
|---|---|---|---|
| Employee create -> XBOS Membership | "System creates Membership account" (UC-H01) | No event defined, no API contract for XBOS to HRM membership creation | Employee exists but cannot log in |
| Workflow approve -> Leave balance update | "Update related entity" (UC-B03) | No event contract, no DB trigger spec | Leave balance out of sync |
| Payroll lock -> Payslip issue | "Issue payslips, then lock" (UC-H04) | No event from XBOS workflow to HRM payroll | Payslips generated before approval |
| Catalog change -> Tenant propagation | "7-day update flag" (UC-B04) | No event schema, no propagation job spec | Stale catalog data across tenants |
| Tenant suspend -> Employee disable | "No hard delete" (BR-B01-04) | No cascade rule defined | Orphaned employee records |

### Proposed Cross-System Event Schema

| Event | Publisher | Subscribers | Payload (min) |
|---|---|---|---|
| `EMPLOYEE_CREATED` | HRM | XBOS, Notification | employeeId, tenantId, fullName, email, departmentId |
| `EMPLOYEE_UPDATED` | HRM | XBOS | employeeId, changedFields[] |
| `WORKFLOW_APPROVED` | XBOS | HRM | workflowInstanceId, entityType, entityId, approvedAt |
| `WORKFLOW_REJECTED` | XBOS | HRM | workflowInstanceId, entityType, entityId, rejectReason |
| `PAYROLL_LOCKED` | HRM | Notification | payrollPeriodId, tenantId |
| `CATALOG_UPDATED` | XBOS | HRM, Portal | catalogType, changeType, effectiveDate |
| `TENANT_SUSPENDED` | XBOS | HRM, Logistics | tenantId, reason, suspendedAt |

Without this event contract, cross-module consistency relies on ad-hoc polling or direct DB access — both anti-patterns in a microservices architecture.

---

## Field Display Compliance

### Source of Truth
Both [xbos/FIELD_DISPLAY_SRS_XBOS.md](xbos/FIELD_DISPLAY_SRS_XBOS.md) and [hrm/FIELD_DISPLAY_SRS_HRM.md](hrm/FIELD_DISPLAY_SRS_HRM.md) implement the rule: **every field in the UI must have a definition of 5 attributes**:
1. Field source (DB/API/catalog)
2. Vietnamese label
3. Source value type (enum, UUID, boolean, etc.)
4. UI display form (badge, label, plain text)
5. Null/empty behavior (EM-DASH, "Chưa cập nhật", hide row)

### Compliance Check

| Spec ID | Field | Null Rule Satisfied? | Enum Coverage Complete? | Risk |
|---|---|---|---|---|
| F-XBOS-01 | orgTypeCode | Yes — (null) | Yes — 4 values mapped | Low |
| F-XBOS-02 | status (org) | Yes — (null) | Yes — 2 values | Low |
| F-01 | Gender | Yes — EM-DASH | Yes — 3 values + colors | Low |
| F-02 | Employment Type | Yes — "Chưa cập nhật" | **Partial** — enum variants `full-time` vs `full_time` not normalized | Medium |
| F-03 | Compensation Line Type | Yes — EM-DASH / "Chưa cập nhật" | Yes | Low |
| F-09 | Workflow Instance | Yes — AN HANG (hide) | N/A — UUID nullable | Low |
| F-10 | Marital Status | Yes — EM-DASH | Yes — 3 values | Low |
| F-11 | Import Stage | Yes — EM-DASH | **Partial** — English source enum needs VI mapping via `/recruitment/funnel/catalog` | Medium |
| F-13 | Performance Status | Yes — EM-DASH / "Chưa phân công" | Yes | Low |

### Identified Risks
- F-02: `full-time` and `full_time` variants exist in source — normalization not documented in the field spec. UI must handle both as "Toàn thời gian".
- F-11: Funnel stage source is English enum (`screening`, `interview`, `offer`, `onboarding`) but display must be Vietnamese via catalog lookup. If catalog lookup fails, fallback is not defined.
- 13 FAIL-LABEL-LEAK IDs tracked in HRM spec; 7 in XBOS spec. No master registry linking both specs — risk of drift over time.

---

## Root Cause Analysis

### Why the gaps exist
1. **No API contract artifact**: SRS is process-flow oriented; API design was deferred to implementation phase. This means dev teams will design APIs independently → inconsistency.
2. **No DB schema**: Data models were inferred from prose. Without a formal schema, different teams implement different column names/types for the same concept (e.g., `employment_type` vs `employmentType`).
3. **Recruitment workflow drift**: BRD says "dynamic 13-step workflow customizable by TA" but SRS only specifies a fixed 5-state pipeline. This is a scope/requirements mismatch at the document level — not a code bug.
4. **Event schema absent**: The BRD mentions event queues but does not define event names, payloads, or delivery guarantees. Implementation will produce ad-hoc events that are hard to consume reliably.
5. **S7 technical debt**: The kickoff notes document existing code issues (hooks-I/O errors, null-seed patterns, ILA gaps) that are engineering problems, not business spec gaps — but they will block deliverability if not addressed in wave B.

---

## Improvement Recommendations

### P0 — Must Fix Before Implementation

| # | Recommendation | Module | Rationale |
|---|---|---|---|
| 1 | **Produce a formal API contract artifact** — OpenAPI/Swagger spec covering all endpoints, request/response schemas, auth matrix, error codes. | All | Without this, each team builds APIs independently → integration failures. |
| 2 | **Produce a database schema document** — ER diagram + DDL scripts with all entities, FKs, constraints, indexes, and multi-tenant `tenant_id` column strategy. | XBOS + HRM | Prevents column name/type drift across services. |
| 3 | **Resolve recruitment workflow scope** — Clarify whether TA can customize steps (BRD says 13 steps, SRS says 5). Produce a definitive workflow model or lock to the SRS 5-state pipeline. | HRM | Scope mismatch between BRD and SRS is an unmanaged risk. |
| 4 | **Define the event schema** — Event names, payload schemas, delivery guarantees (at-least-once vs exactly-once), and failure handling. | XBOS | Without this, cross-module consistency is unreliable. |
| 5 | **Resolve S7 blockers** — Fix Hook-qa-276034 and Hook-qa-309fd5 I/O path issues; address U65 null-seed pattern before wave B code merges. | Infra | Existing code quality issues will compound with new features. |

### P1 — Should Address During Wave B

| # | Recommendation | Module | Rationale |
|---|---|---|---|
| 6 | **Implement batch API endpoints** — POST /api/batch for employee detail, attendance summary, payslip. Reduces N+1 requests. | HRM | Current FE would call 5-6 endpoints per screen; batch API cuts round-trips. |
| 7 | **Add catalog caching layer** — Redis key pattern `catalog:{tenantId}:v{version}` with TTL. Invalidates on catalog update events. | XBOS | Catalog lookups are on every screen load; caching cuts DB load. |
| 8 | **Normalize enum variants at the data layer** — Consolidate `full-time` / `full_time` / `FULL_TIME` into canonical values with a mapping table. | HRM | Field F-02 risk — prevents UI from having to handle variant strings. |
| 9 | **Add funnel stage fallback for recruitment import** — If `/recruitment/funnel/catalog` lookup fails, fallback to English source value + "(chưa dịch)" label. | HRM | Field F-11 risk — prevents blank display on catalog miss. |
| 10 | **Document token revocation strategy** — Specify Redis blacklist key, TTL, and cleanup job. | XBOS | Current spec says "revoke" but no mechanism. |
| 11 | **Add connection pool tuning config** — PgBouncer or HikariCP settings: min 5, max 20 per service, idle timeout 10min. | Infra | Prevents connection exhaustion under multi-tenant load. |

### P2 — Nice to Have / Future

| # | Recommendation | Module | Rationale |
|---|---|---|---|
| 12 | **Event replay/audit for workflow** — Record every state transition with actor + timestamp, enabling full audit reconstruction. | XBOS | Compliance and debugging. |
| 13 | **Mobile offline conflict resolution** — Define merge strategy for offline-created leave requests (last-write-wins vs manual merge). | HRM Mobile | UC-M06 offline queue has no conflict policy. |
| 14 | **Sampling/Masking for salary screen** — Instead of full audit of screen captures, mask sensitive fields at the rendering layer. | HRM | Reduces audit storage and privacy risk. |

---
