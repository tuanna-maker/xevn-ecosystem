import type { LegalEntityApiRow } from './orgFoundationApi';

/** Preserve large VND amounts from API strings without comma/scientific drift (UC-CC-03). */
export function coerceCharterCapital(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const normalized = String(value).trim().replace(/[,\s]/g, '');
  if (!normalized) {
    return fallback;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export type LegalEntityCompanyFormState = {
  nameVi: string;
  nameEn: string;
  shortName: string;
  enterpriseCode: string;
  enterpriseType: string;
  taxCode: string;
  headOfficeAddress: string;
  headOfficeCountry: string;
  charterCapital: number;
  firstIssueDate: string;
  issuePlace: string;
  legalRepName: string;
  legalRepTitle: string;
  legalRepIdNo: string;
  legalRepPhone: string;
  legalRepAddress: string;
  hotline: string;
  companyEmail: string;
  website: string;
  entityLevel: 'parent' | 'subsidiary';
  parentEntityId: string;
  adminEmail?: string;
  adminPassword?: string;
};

/** UC-CC-03/04 — map org-foundation legal entity row to Command Center edit form. */
export function mapLegalEntityRowToCompanyForm(row: LegalEntityApiRow): LegalEntityCompanyFormState {
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const nested = (payload.companyForm ?? {}) as Record<string, unknown>;
  const entityLevel =
    row.entity_type === 'holding' ? 'parent' : row.entity_type === 'subsidiary' ? 'subsidiary' : 'subsidiary';

  const rowCode = String(row.code ?? '').trim();
  const nestedShort = String(nested.shortName ?? '').trim();
  const displayName = String(nested.nameVi ?? row.name ?? '').trim();
  const shortName =
    nestedShort && nestedShort !== displayName ? nestedShort : rowCode || nestedShort;

  return {
    nameVi: displayName,
    nameEn: String(nested.nameEn ?? ''),
    shortName,
    enterpriseCode: String(nested.enterpriseCode ?? row.tax_code ?? ''),
    enterpriseType: String(nested.enterpriseType ?? 'joint-stock'),
    taxCode: String(nested.taxCode ?? row.tax_code ?? ''),
    headOfficeAddress: String(nested.headOfficeAddress ?? row.address ?? ''),
    headOfficeCountry: String(nested.headOfficeCountry ?? 'Việt Nam'),
    charterCapital: coerceCharterCapital(nested.charterCapital ?? row.charter_capital, 0),
    firstIssueDate: String(nested.firstIssueDate ?? row.established_at?.slice(0, 10) ?? ''),
    issuePlace: String(nested.issuePlace ?? ''),
    legalRepName: String(nested.legalRepName ?? row.legal_representative ?? ''),
    legalRepTitle: String(nested.legalRepTitle ?? 'Chủ tịch Hội đồng quản trị'),
    legalRepIdNo: String(nested.legalRepIdNo ?? ''),
    legalRepPhone: String(nested.legalRepPhone ?? ''),
    legalRepAddress: String(nested.legalRepAddress ?? ''),
    hotline: String(nested.hotline ?? ''),
    companyEmail: String(nested.companyEmail ?? ''),
    website: String(nested.website ?? ''),
    entityLevel,
    parentEntityId: String(nested.parentEntityId ?? ''),
    adminEmail: String(nested.adminEmail ?? ''),
    adminPassword: '',
  };
}

export type LegalEntityFieldErrors = {
  enterpriseCode?: string;
  charterCapital?: string;
  taxCode?: string;
  nameVi?: string;
  shortName?: string;
};

/** Parse XBOS validation message into inline field errors (UC-CC-04). */
export function parseLegalEntitySaveFieldErrors(message: string): LegalEntityFieldErrors {
  const lower = message.toLowerCase();
  const errors: LegalEntityFieldErrors = {};
  const taxMention =
    /mã số thuế|mst|tax.?code|tax_code|số thuế/.test(lower) ||
    (/thuế/.test(lower) && !/vốn điều lệ|charter/.test(lower));
  const enterpriseMention = /mã số doanh nghiệp|enterprise.?code|enterprise_code/.test(lower);
  if (taxMention) {
    errors.taxCode = 'Mã số thuế không hợp lệ.';
  }
  if (enterpriseMention || (/mst|enterprise/.test(lower) && !taxMention)) {
    errors.enterpriseCode = 'Mã số doanh nghiệp / MST không hợp lệ.';
  }
  if (/vốn điều lệ|charter.?capital|charter_capital|\bvốn\b/.test(lower)) {
    errors.charterCapital = 'Vốn điều lệ không hợp lệ.';
  }
  if (/\bcode\b/.test(lower)) {
    errors.shortName = 'Mã viết tắt (code) không hợp lệ hoặc chưa gửi lên API.';
  }
  if (/\bname\b/.test(lower) && !/\bcode\b/.test(lower)) {
    errors.nameVi = 'Tên pháp nhân (name) không hợp lệ hoặc chưa gửi lên API.';
  } else if (/\bname\b/.test(lower) && /\bcode\b/.test(lower)) {
    errors.nameVi = 'Tên pháp nhân (name) không hợp lệ hoặc chưa gửi lên API.';
    errors.shortName = 'Mã viết tắt (code) không hợp lệ hoặc chưa gửi lên API.';
  }
  if (Object.keys(errors).length === 0 && /400|validation|hợp lệ/.test(lower)) {
    errors.enterpriseCode = 'Dữ liệu pháp nhân chưa hợp lệ — kiểm tra MST và vốn điều lệ.';
  }
  return errors;
}

export function isLegalEntityValidationHttpError(message: string): boolean {
  return /\(HTTP 400\)|HTTP 400|validation|hợp lệ|XBOS-VAL/i.test(message);
}
