import type { Company } from '../data/mock-data';

/** Tên ngắn hiển thị trên thẻ/tab (ưu tiên tên thương hiệu). */
export function companyPrimaryLabel(company: Pick<Company, 'shortName' | 'code' | 'name'>): string {
  const short = company.shortName?.trim();
  if (short) return short;
  const code = company.code?.trim();
  if (code) return code;
  return company.name?.trim() || '—';
}

/** Tên pháp nhân đầy đủ (DKKD). */
export function companyFullName(company: Pick<Company, 'shortName' | 'code' | 'name'>): string {
  return company.name?.trim() || companyPrimaryLabel(company);
}
