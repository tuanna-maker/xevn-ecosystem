"use strict";
/**
 * @CODE-MEMORY
 * Screen:     Portal auth — membership list display-ready (OS 28)
 * UC:         FR-UC-M01 · UC-M01
 * BR:         BR-SCOPE-01 — chọn membership trước API nghiệp vụ
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01
 * TechSpec:   docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-MOB-AUTH
 * Purpose:    Map role_code / tenant_kind / company slug → nhãn tiếng Việt để FE
 *             bind trực tiếp, không invent label từ raw key.
 * WorkItem:   W1-B-03-AUTH-BE
 * Coded:      2026-08-03
 * Callers:    auth.service.ts → login / selectMembership / me
 * Callees:    none (pure map)
 * FEActions:  Scope picker / GlobalFilter bind tenant_label · role_label
 * BEChain:    xbos_user_tenant_membership + xbos_tenant_registry → labels
 * Impact:     Thiếu label → FE tự dịch roleCode → vi phạm OS 28
 * must_keep:  Giữ tenantId/roleCode/companyId raw cho JWT; chỉ ADD *_label
 * SOLID:      SRP — label map tách khỏi AuthService credential/JWT
 * LastVerified: auth.service.spec.ts W1-B-03
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalRoleLabelVi = portalRoleLabelVi;
exports.portalCompanyLabelVi = portalCompanyLabelVi;
exports.portalTenantKindLabelVi = portalTenantKindLabelVi;
exports.toPortalMembershipDisplay = toPortalMembershipDisplay;
const ROLE_LABELS_VI = {
    group_ceo: 'CEO Tập đoàn',
    ceo_group: 'CEO Tập đoàn',
    subsidiary_ceo: 'CEO công ty thành viên',
    ceo: 'CEO',
    hrbp_manager: 'HRBP',
    hr_manager: 'Quản lý nhân sự',
    hr: 'Nhân sự',
    manager: 'Quản lý',
    employee: 'Nhân viên',
    admin: 'Quản trị',
    tenant_admin: 'Quản trị tenant',
};
const COMPANY_LABELS_VI = {
    holding: 'Công ty mẹ (Holding)',
    main: 'Công ty chính',
    trsport: 'Vận tải',
    logistics: 'Logistics',
    finance: 'Tài chính',
    services: 'Dịch vụ',
};
const TENANT_KIND_LABELS_VI = {
    master: 'Tập đoàn',
    member: 'Công ty thành viên',
    holding: 'Holding',
};
function portalRoleLabelVi(roleCode) {
    const raw = String(roleCode ?? '').trim();
    if (!raw)
        return '—';
    const key = raw.toLowerCase();
    return ROLE_LABELS_VI[key] ?? raw.replace(/_/g, ' ');
}
function portalCompanyLabelVi(companyId, tenantNameFallback) {
    const slug = String(companyId ?? '')
        .trim()
        .toLowerCase();
    if (!slug)
        return (tenantNameFallback ?? '').trim() || '—';
    return COMPANY_LABELS_VI[slug] ?? (tenantNameFallback?.trim() || slug);
}
function portalTenantKindLabelVi(tenantKind) {
    const key = String(tenantKind ?? '')
        .trim()
        .toLowerCase();
    return TENANT_KIND_LABELS_VI[key] ?? (key || '—');
}
function toPortalMembershipDisplay(row, membershipId) {
    const tenantLabel = (row.name ?? '').trim() || row.tenantId;
    return {
        ...row,
        membershipId,
        tenant_label: tenantLabel,
        company_label: portalCompanyLabelVi(row.companyId, row.shortName || tenantLabel),
        role_label: portalRoleLabelVi(row.roleCode),
        tenant_kind_label: portalTenantKindLabelVi(row.tenantKind),
    };
}
