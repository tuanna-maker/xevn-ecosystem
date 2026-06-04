import type { LegalEntityInputPayload } from './orgFoundationApi';

/** Lift code/name from nested companyForm when top-level fields are missing (UC-CC member save). */
export function normalizeLegalEntityPutBody(body: LegalEntityInputPayload): LegalEntityInputPayload {
  const cf = (body.payload?.companyForm ?? {}) as Record<string, unknown>;
  const shortName = String(cf.shortName ?? '').trim();
  const topCode = String(body.code ?? '').trim();
  const nameVi = String(cf.nameVi ?? body.name ?? '').trim();
  const topName = String(body.name ?? '').trim();
  // Prefer nested shortName — root code must be member slug (XE_DU_LICH), not display label.
  const code = shortName || topCode || String(cf.enterpriseCode ?? 'LE').trim();
  const name = nameVi || topName || 'Pháp nhân mới';
  return {
    ...body,
    code: code || 'LE',
    name,
    payload: {
      ...body.payload,
      companyForm: {
        ...cf,
        shortName: code || 'LE',
        nameVi: name,
      },
    },
  };
}
