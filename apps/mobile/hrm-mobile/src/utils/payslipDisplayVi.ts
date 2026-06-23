import {
  isRawCompanySlugLabel,
  resolveCompanyDisplayVi,
  type ResolveCompanyDisplayViOptions,
} from './companyDisplayVi';

const PERIOD_SLUG_SUFFIX_RE = /^(.+?)\s*[—–|-]\s*([a-z0-9][a-z0-9_-]*)\s*$/i;

/**
 * MOB-UX-16e — payroll period labels must not show raw slugs (ILA-07).
 * «Kỳ lương 05/2026 — holding» → «Kỳ lương 05/2026 — Tập đoàn XeVN».
 */
export function resolvePayslipPeriodLabelVi(
  raw: string | null | undefined,
  options?: ResolveCompanyDisplayViOptions,
): string {
  const label = raw?.trim() ?? '';
  if (!label) return 'Kỳ lương';

  const suffix = label.match(PERIOD_SLUG_SUFFIX_RE);
  if (suffix) {
    const prefix = suffix[1].trim();
    const slug = suffix[2].trim().toLowerCase();
    if (isRawCompanySlugLabel(slug)) {
      const companyVi = resolveCompanyDisplayVi(slug, options);
      return `${prefix} — ${companyVi}`;
    }
    return label;
  }

  if (isRawCompanySlugLabel(label)) {
    return resolveCompanyDisplayVi(label, options);
  }

  return label;
}
