---
name: enterprise-docs
description: Generate enterprise-grade Vietnamese business and technical documents (BRD, SRS, TECH_SPEC, DB_DESIGN, API_CONTRACT). Use when user asks to write or upgrade docs in docs/brand-new-documents-20270801/.
---

# Enterprise Docs Skill

## When to Use
- User asks to write/upgrade BRD, SRS, TECH_SPEC, DB_DESIGN, API_CONTRACT
- User mentions "enterprise PO-grade", "vietnamese", "business document"
- Working in docs/brand-new-documents-20270801/

## Document Structure (Vietnamese)

### BRD (Business Requirements)
1. Mục Đích + Phạm Vi
2. Bối Cảnh Nghiệp Vụ (Pain Points → Impact table)
3. Stakeholders + Actor matrix
4. Luồng Nghiệp Vụ Chính (5 flows: tenant, employee, leave, payroll, recruitment)
5. Yêu Cầu Phi Chức Năng (NFR table)
6. Mã Lỗi Nghiệp Vụ (Error catalog)
7. Traceability
8. Tiêu Chí Nghiệm Thu (Acceptance Criteria checklist)

### SRS (Software Requirements)
1. Platform + Runtime
2. Multi-Tenant Data Model
3. XBOS Requirements (UC-B01 to UC-B05)
4. HRM Requirements (UC-H01 to UC-H06)
5. Mobile Requirements (UC-M01 to UC-M06)
6. NFRs
7. Integration + Event Contract
8. Traceability

## Writing Rules
- Use Vietnamese for all business sections, English for technical identifiers
- Include Mermaid diagrams for flows where possible
- Every requirement must have traceability to API endpoint + DB entity
- Tables: use | delimited markdown
- Error codes: ID + HTTP status + Vietnamese description
- Acceptance criteria: checklist format - [ ]

## File Writing Approach
For large docs (>100 lines), use bash `printf` or `cat >> file << 'EOF'` — Write tool may fail with Vietnamese paths.
