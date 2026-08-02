# BRD-XEVN-NEW v1.0
Business Requirements — XeVN Ecosystem OS

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | 2026-08-01 |
| Status | Draft |
| Author | Product Management — XeVN Ecosystem |
| Classification | Internal Use Only |
| Customer | XeVN Group |
| Vendor | Unicom Technology Solutions |

---

## 1. Business Context and Objectives

XeVN Group operates across tourism, transport, logistics, and services
with multiple subsidiary companies (legal entities).

| Pain Point | Impact |
|------------|--------|
| Data silos (Excel, disparate tools) | Consolidated reports take 3-5 days/month |
| Non-standard HR processes | Vague RACI, uncontrolled approvals |
| Slow onboarding | 2-4 weeks per new company setup |
| Manual HR management | Paper-based attendance, Excel payroll |

**Objectives:**
- Replace fragmented HR stack with unified multi-tenant platform
- Single source of truth for tenant, org, people, payroll data
- RBAC-first security with event-driven extensibility
- Enterprise auditability via append-only, queryable audit history

---

## 2. System Scope

| Module | Full Name | Phase | Priority |
|--------|-----------|-------|----------|
| XBOS | X-Business Operating System (Core) | Phase 1 | P0 |
| HRM Web | Human Resource Management (Web Portal) | Phase 1 | P0 |
| HRM Mobile | Mobile Application (React Native) | Phase 1 | P0 |
| Portal/CC | Command Center & Catalog Governance | Phase 1 | P1 |
| Logistics | Vehicle/Driver/Trip Management | Phase 1 (Limited) | P1 |

**Out of scope:** CRM, Accounting/ERP integration, AI/ML engine, Advanced BI

---

## 3. User Groups and Actors

| Role | Description | Count | System |
|------|-------------|-------|--------|
| SUPER_ADMIN | Platform config, tenant CRUD, catalog | 2-5 | Portal/CC |
| TENANT_ADMIN | Tenant config, membership, policy | 1-3/tenant | Portal/CC, HRM |
| HR_MANAGER | Employee, attendance, payroll, reports | 1-5/tenant | HRM |
| DEPT_MANAGER | Team management, leave approval | 3-20/tenant | HRM |
| EMPLOYEE | Self-service profile, attendance, leave | 50-500/tenant | Mobile |
| FINANCE_STAFF | Payroll review, approval | 1-3/tenant | HRM |
| RECRUITER | Requisition, pipeline, offer workflow | 1-5/tenant | HRM |
| Fleet Manager | Vehicle/driver ops (Logistics) | 1-3/tenant | Logistics |
| Dispatcher | Trip/route ops (Logistics) | 1-5/tenant | Logistics |

---

## 4. Business Flows

### 4.1 Tenant Onboarding Flow
1. SUPER_ADMIN creates tenant via Portal/CC
2. System sends activation email with cryptographically secure token
3. TENANT_ADMIN activates tenant within 48 hours
4. Tenant status: PROVISIONING → ACTIVE
5. Idempotent: duplicate slug or admin email returns deterministic conflict

see BRD_XEVN_OS.md for full tenant lifecycle diagram.

### 4.2 Employee Lifecycle Flow
1. HR_MANAGER creates employee record
2. System assigns employee_code (tenant-scoped unique)
3. Employee receives welcome email with login credentials
4. Employee completes profile via Mobile app
5. Manager assigns to department and position

### 4.3 Leave Approval Flow (Two-Level)
1. EMPLOYEE submits leave request
2. DEPT_MANAGER (L1) reviews within 24 hours
3. If approved → HR_MANAGER (L2) reviews within 48 hours
4. If rejected: minimum 10-char reason required
5. System deducts leave balance on final approval
6. Anti-self-approval enforced at data layer

### 4.4 Payroll Batch Flow
1. HR_MANAGER triggers batch on 25th of month (or nearest business day)
2. System calculates: Net = Gross - BHXH(8%) - BHYT(1.5%) - BHTN(1%) - PIT(progressive)
3. Finance reviews → Tenant Admin confirms → Issue → Lock
4. Lock is application-level + database-level write guard
5. Post-lock edits are rejected

### 4.5 Recruitment Pipeline
1. RECRUITER creates requisition
2. Pipeline: NEW → SCREENING → INTERVIEW_SCHEDULED → INTERVIEWED → OFFER_SENT → HIRED/REJECTED/WITHDRAWN
3. On HIRED: employee record auto-created via event
4. Onboarding workflow deferred to P1

---

## 5. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | API latency P95 | < 300ms |
| NFR-02 | API latency P99 | < 800ms |
| NFR-03 | Payroll batch (500 employees) | < 30 minutes |
| NFR-04 | Transport security | HTTPS, TLS 1.2+ |
| NFR-05 | Password hashing | bcrypt cost factor 12 |
| NFR-06 | Platform uptime | 99.5% |
| NFR-07 | Disaster recovery RTO | < 2 hours |
| NFR-08 | Disaster recovery RPO | < 1 hour |
| NFR-09 | Tenant onboarding time | < 30 minutes end-to-end |
| NFR-10 | Cross-tenant access | Structurally prevented, returns 403 |

---

## 6. Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| TENANT_SLUG_EXISTS | 409 | Tenant slug already taken |
| TENANT_EMAIL_INVALID | 422 | Invalid admin email format |
| CROSS_TENANT_ACCESS | 403 | Token tenant mismatch |
| WORKFLOW_ALREADY_APPROVED | 409 | Cannot approve locked workflow |
| PAYROLL_ALREADY_LOCKED | 409 | Payroll period locked |
| EMPLOYEE_CODE_EXISTS | 409 | Employee code duplicate in tenant |
| ATTENDANCE_LOCATION_OUT_OF_RANGE | 422 | GPS outside geofence |
| LEAVE_BALANCE_INSUFFICIENT | 422 | Not enough leave days |

---

## 7. Traceability

| Document | Relationship |
|----------|-------------|
| SRS-XEVN-NEW v1 | Functional requirements derived from this BRD |
| TECH_SPEC_NEW.md | Architecture decisions implementing business needs |
| DB_DESIGN_NEW.md | Data model supporting each business entity |
| API_CONTRACT_NEW.md | Endpoint-level implementation of requirements |

---

## 8. Acceptance Criteria

- [ ] Tenant onboarding completes in < 30 minutes end-to-end
- [ ] Cross-tenant access returns HTTP 403
- [ ] Workflow enforces two-level approval with anti-self-approval
- [ ] Audit log is append-only and queryable
- [ ] Payroll lock prevents post-approval edits
- [ ] Employee code is unique per tenant
- [ ] Leave balance deducted only on final approval
- [ ] Catalog platform values cannot be hard-deleted
- [ ] All API responses use standard error envelope
- [ ] Mobile supports offline leave queue with sync-on-reconnect


---

## 4. Luồng Nghiệp Vụ Chính

### 4.1 Tenant Onboarding

SUPER_ADMIN tạo tenant tại Portal/CC -> hệ thống gửi email kích hoạt (hợp lệ 48h).
Trạng thái: PROVISIONING -> ACTIVE.
Thời gian on-boarding mục tiêu: < 30 phút end-to-end.

### 4.2 Employee Lifecycle

HR_MANAGER tạo hồ sơ -> hệ thống phát sinh employee_code (duy nhất theo tenant).
Nhân viên hoàn thiện profile qua Mobile -> Manager phân bổ phòng ban + chức vụ.

### 4.3 Leave Approval (Two-Level)

EMPLOYEE gửi đơn -> DEPT_MANAGER (L1) duyệt trong 24h -> HR_MANAGER (L2) duyệt trong 48h.
Từ chối yêu cầu lý do tối thiểu 10 ký tự.
Không cho self-approval ở tầng dữ liệu.

### 4.4 Payroll Batch

Chạy vào ngày 25 hàng tháng (hoặc ngày làm việc gần nhất).
Công thức: Net = Gross - BHXH(8%) - BHYT(1.5%) - BHTN(1%) - PIT(thang thuế lũy tiến).
Chuỗi duyệt: Batch -> HR Review -> Finance Approve -> Tenant Admin Confirm -> Issue -> Lock.
Lock là application-level + database write guard.
