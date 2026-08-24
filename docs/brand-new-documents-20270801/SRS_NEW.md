# SRS-XEVN-NEW v1
Software Requirements — XeVN Ecosystem OS
Based on: BRD-XEVN-NEW v1
Date: 2026-08-07
Status: Draft
Sponsor: Product Management — XeVN Ecosystem
Classification: Internal Use Only

---

## 1. Platform and Runtime

| Requirement | Specification |
|-------------|---------------|
| Backend runtime | Node.js 20+, NestJS (recommended), Express as fallback |
| Language | TypeScript 5.x, strict mode enabled |
| Frontend | React 18+ with Vite, React Native 0.76+ for mobile |
| Database | PostgreSQL 16+ with Prisma ORM |
| Cache / realtime | Redis (session, rate-limit, catalog cache, Socket.IO adapter) |
| Package manager | pnpm 9.15, Turborepo for orchestration |
| Container runtime for dev | Docker Compose with node:22-aline base images |

### 1.1 Type Safety Policy

All public interfaces — controllers, services, repositories, DTOs, and shared packages — must use TypeScript strict types. Usage of `any` is banned in new code. Input validation uses class-validator (NestJS) or Zod (utility modules). Error responses use a shared envelope schema.

---

## 2. Multi-Tenant Data Model

Every persistent entity carries `tenant_id` at the database row level. Tenant isolation is enforced in the data-access layer, not only at the API gateway.

| Requirement | Specification |
|-------------|---------------|
| JWT claims | tenantId, membershipId, roles[] |
| Tenant context propagation | Every request carries tenant context from JWT + X-Tenant-ID header (rejected if mismatch) |
| Catalog extension | Tenant rows extend platform enums; platform values cannot be hard-deleted |
| Soft-delete | All business entities support `deletedAt`; hard-delete is forbidden |
| Cross-tenant queries | Structurally prevented by DAL; application must not construct raw SQL bypassing tenant filter |

---

## 3. XBOS Requirements

### 3.0 Web Portal Multi-Tenant Routing & Deep Links (UC-W01)
- **Strict Tenant Context Enforcement:** Any access to the system MUST include a valid `tenantId` in the URL (e.g., `/:tenantId/...`).
- **Missing or Invalid Tenant ID:** If a user attempts to access any route without a valid `tenantId` (e.g., directly accessing `/command-center/...` or `/dashboard/...`):
  - The system MUST immediately delete the current `accessToken` (force logout).
  - The user MUST be redirected to the login page.
  - The system MAY preserve the original deep link in the `redirect` query parameter to route them back after a successful login.

### 3.1 Tenant Lifecycle (UC-B01)
- Tenant auto-provisioning with adminEmail and adminPassword fields from UI, optionally sending an activation email with a secure token.
- Tenant status lifecycle: PROVISIONING -> ACTIVE -> SUSPENDED -> ARCHIVED.
- Provisioning is idempotent: a duplicate slug or admin email returns a deterministic conflict.

### 3.2 RBAC Engine (UC-B02)

| Role | Scope |
|------|-------|
| SUPER_ADMIN | All tenants, platform configuration |
| TENANT_ADMIN | Single tenant, membership CRUD |
| HR_MANAGER | HR module, employees, attendance, leave, payroll |
| DEPT_MANAGER | Own department, team leave approval |
| FINANCE_STAFF | Payroll review, approval, and issue |
| RECRUITER | Requisition, candidate, offer workflow |
| EMPLOYEE | Own profile, attendance, leave submission |

- Resource scoping is department-scoped and payroll-period-scoped.
- Token revocation uses Redis-backed blacklist with TTL matching remaining JWT lifetime.

### 3.3 Workflow Engine (UC-B03)

Workflow state machine:

```
SUBMITTED -> L1_PENDING -> L1_APPROVED -> L2_PENDING -> L2_APPROVED
                                                 -> L2_REJECTED
                                                 -> CANCELLED
```

- Anti-self-approval is enforced at the data layer; the submitter and approver must be distinct records.
- SLA targets: Level 1 — twenty-four hours; Level 2 — forty-eight hours.
- Automated reminders: every four hours while pending.
- Escalation triggers at two times the SLA.
- Rejection requires a minimum ten-character reason, validated at API input.

### 3.4 Catalog Governance (UC-B04)

- Two-tier catalog: platform-owned values (SUPER_ADMIN CRUD), tenant-extended values (TENANT_ADMIN extends).
- Tenant extensions cannot delete or modify platform rows.
- Catalog propagation flag: cross-module cache invalidation event on change.

### 3.5 Audit Log (UC-B05)

- Append-only event format: `{actor, tenantId, action, resource, timestamp}`.
- Immutable once written; no UPDATE or DELETE paths.
- Query API supports filtering by actor, action, resource, and time range.
- Retention period defined per regulation; cold storage strategy documented.

---

## 4. HRM Requirements

### 4.1 Employee Profile (UC-H01)

- CRUD form organized as four logical tabs: Personal Info, Job Position, Contract and Salary, Documents.
- Constraint checks at submission: CCCD unique per tenant, age fifteen to seventy, salary meets regional minimum wage.
- Document upload: format and size limits defined; virus scanning on upload is recommended in P1.

### 4.2 Attendance (UC-H02)

- GPS check-in with success radius of two hundred meters from the registered workplace center.
- Automatic checkout after ten hours without explicit checkout.
- Mock-GPS detection via Play Integrity API on Android; equivalent anti-spoof mechanism on iOS documented.
- Attendance anomalies do not alter leave balance by default.

### 4.3 Leave Management (UC-H03)

| Leave Type | Allowance | Notes |
|------------|-----------|-------|
| Annual | Twelve days | Submit request three calendar days in advance |
| Sick | Unlimited | Doctor certificate required for requests of three or more days |
| Maternity | Six months | Policy-regulated; deducts from annual quota where applicable |
| Unpaid | Unlimited | No salary deduction formula; approval only |
| Compensatory | Variable | Based on approved overtime |

- Two-level approval for all types.
- Concurrent requests handled synchronously at the data layer to prevent balance race conditions.
- Year-end rollover policy to be defined before payroll cutover.

### 4.4 Payroll (UC-H04)

- Batch runs on the twenty-fifth of each month or the nearest business day.
- Formula: Net = Gross minus BHXH (eight percent) minus BHYT (one point five percent) minus BHTN (one percent) minus PIT (progressive tax table).
- Six-step approval chain: Batch → HR Review → Finance Approve → Tenant Admin Confirm → Issue → Lock.
- Lock mechanism is application-level with database-level write guard.
- Mid-cycle adjustments before lock are supported; post-lock edits are rejected.

### 4.5 Recruitment (UC-H05)

Fixed pipeline states:

```
NEW -> SCREENING -> INTERVIEW_SCHEDULED -> INTERVIEWED -> OFFER_SENT -> HIRED / REJECTED / WITHDRAWN
```

- Dynamic workflow customization by tenant admin is out of scope for P1.
- Post-HIRED onboarding workflow is deferred to P1.

### 4.6 Reporting (UC-H06)

Placeholder structure provided; report types, export formats, and scheduling to be defined in P1.

---

## 5. Mobile Requirements

### 5.1 Multi-Tenant Login (UC-M01)

- Credentials: Authentication via Email OR Phone Number (synced from Employee profile).
- Sequence: authenticate → list memberships → select company → issue scoped token.
- Biometric unlock enabled after first successful password login.
- Lockout policy: five failed attempts triggers thirty-minute cooldown.

### 5.2 GPS Check-in (UC-M02)

- Map view with geofence ring.
- Manual fallback when GPS is unavailable.
- Mock-GPS detection integrated with backend anti-spoof challenge.

### 5.3 Leave Mobile (UC-M03)

- Employee flow: five steps (type, period, reason, attachment, confirmation).
- Manager flow: five steps including team calendar view.

### 5.4 Payslip Mobile (UC-M04)

- Auto-blur when application moves to background.
- Screenshot audit log captured server-side.
- PDF encrypted at rest; decryption key lifecycle managed.

### 5.5 Push Notifications (UC-M05)

- FCM for Android; APNs for iOS.
- Notification queue backed by messaging system with retry and dead-letter handling.

### 5.6 Offline Mode (UC-M06)

Cache TTL by entity:

| Entity | Cache Duration | TTL |
|--------|---------------|-----|
| Profile | Twenty-four hours | One hour |
| Attendance history | Thirty days | One hour |
| Payslips | Three months | Seven days |
| Leave list | Thirty days | Thirty minutes |
| Workplaces | Seven days | Seven days |

Offline leave requests are queued locally and synced when connectivity is restored.

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | API latency (P95) | Below three hundred milliseconds |
| NFR-02 | API latency (P99) | Below eight hundred milliseconds |
| NFR-03 | Payroll batch processing (five hundred employees) | Under thirty minutes |
| NFR-04 | Transport security | HTTPS mandatory, TLS 1.2 minimum |
| NFR-05 | Password hashing | bcrypt cost factor twelve |
| NFR-06 | Platform uptime | 99.5% |
| NFR-07 | Disaster recovery RTO | Under two hours |
| NFR-08 | Disaster recovery RPO | Under one hour |

---

## 7. Integration and Event Contract

Cross-module communication uses named events with at-least-once delivery guarantees. Direct database access across service boundaries is prohibited.

| Event Name | Publisher | Subscribers | Payload (minimum) |
|------------|----------|-------------|-------------------|
| EMPLOYEE_CREATED | HRM | XBOS, Notification | employeeId, tenantId, fullName, email, departmentId |
| EMPLOYEE_UPDATED | HRM | XBOS | employeeId, changedFields[] |
| WORKFLOW_APPROVED | XBOS | HRM | workflowInstanceId, entityType, entityId, approvedAt |
| WORKFLOW_REJECTED | XBOS | HRM | workflowInstanceId, entityType, entityId, rejectReason |
| PAYROLL_LOCKED | HRM | Notification | payrollPeriodId, tenantId |
| CATALOG_UPDATED | XBOS | HRM, Portal | catalogType, changeType, effectiveDate |
| TENANT_SUSPENDED | XBOS | HRM, Logistics | tenantId, reason, suspendedAt |
| NOTIFICATION_SENT | Notification | — | notificationId, recipientUserId, channel |

Failed event dispatches enter the dead-letter queue for operator review and replay.

---

## 8. Traceability

| Document | Relationship |
|----------|-------------|
| BRD-XEVN-NEW v1 | Source of business requirements |
| TECH_SPEC_NEW.md | Architecture and infrastructure decisions |
| DB_DESIGN_NEW.md | Data model supporting each requirement |
| API_CONTRACT_NEW.md | Endpoint-level implementation of each requirement |

All requirements in this document have at least one traceable API endpoint and one database entity.
