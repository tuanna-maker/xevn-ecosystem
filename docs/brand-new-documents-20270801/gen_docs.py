import os

OUT = "docs/brand-new-documents-20270801"

def write(fname, lines):
    path = os.path.join(OUT, fname)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"OK: {fname} ({len(lines)} lines)")

BRD = [
"# BRD-XEVN-NEW v1.0",
"Business Requirements — XeVN Ecosystem OS",
"",
"| Field | Value |",
"|-------|-------|",
"| Version | 1.0 |",
"| Date | 2026-08-01 |",
"| Status | Draft |",
"| Author | Product Management — XeVN Ecosystem |",
"| Classification | Internal Use Only |",
"| Customer | XeVN Group |",
"| Vendor | Unicom Technology Solutions |",
"",
"---",
"",
"## 1. Business Context and Objectives",
"",
"XeVN Group operates across tourism, transport, logistics, and services",
"with multiple subsidiary companies (legal entities).",
"",
"| Pain Point | Impact |",
"|------------|--------|",
"| Data silos (Excel, disparate tools) | Consolidated reports take 3-5 days/month |",
"| Non-standard HR processes | Vague RACI, uncontrolled approvals |",
"| Slow onboarding | 2-4 weeks per new company setup |",
"| Manual HR management | Paper-based attendance, Excel payroll |",
"",
"**Objectives:**",
"- Replace fragmented HR stack with unified multi-tenant platform",
"- Single source of truth for tenant, org, people, payroll data",
"- RBAC-first security with event-driven extensibility",
"- Enterprise auditability via append-only, queryable audit history",
"",
"---",
"",
"## 2. System Scope",
"",
"| Module | Full Name | Phase | Priority |",
"|--------|-----------|-------|----------|",
"| XBOS | X-Business Operating System (Core) | Phase 1 | P0 |",
"| HRM Web | Human Resource Management (Web Portal) | Phase 1 | P0 |",
"| HRM Mobile | Mobile Application (React Native) | Phase 1 | P0 |",
"| Portal/CC | Command Center & Catalog Governance | Phase 1 | P1 |",
"| Logistics | Vehicle/Driver/Trip Management | Phase 1 (Limited) | P1 |",
"",
"**Out of scope:** CRM, Accounting/ERP integration, AI/ML engine, Advanced BI",
"",
"---",
"",
"## 3. User Groups and Actors",
"",
"| Role | Description | Count | System |",
"|------|-------------|-------|--------|",
"| SUPER_ADMIN | Platform config, tenant CRUD, catalog | 2-5 | Portal/CC |",
"| TENANT_ADMIN | Tenant config, membership, policy | 1-3/tenant | Portal/CC, HRM |",
"| HR_MANAGER | Employee, attendance, payroll, reports | 1-5/tenant | HRM |",
"| DEPT_MANAGER | Team management, leave approval | 3-20/tenant | HRM |",
"| EMPLOYEE | Self-service profile, attendance, leave | 50-500/tenant | Mobile |",
"| FINANCE_STAFF | Payroll review, approval | 1-3/tenant | HRM |",
"| RECRUITER | Requisition, pipeline, offer workflow | 1-5/tenant | HRM |",
"| Fleet Manager | Vehicle/driver ops (Logistics) | 1-3/tenant | Logistics |",
"| Dispatcher | Trip/route ops (Logistics) | 1-5/tenant | Logistics |",
"",
]

if __name__ == "__main__":
    write("BRD_NEW.md", BRD)
    print("DONE")
