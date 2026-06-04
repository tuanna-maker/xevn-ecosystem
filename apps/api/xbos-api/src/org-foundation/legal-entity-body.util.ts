/** Shared enrich logic — middleware + pipes (Command Center PUT/POST). */
export function enrichLegalEntityRequestBody(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }
  const raw = { ...(value as Record<string, unknown>) };
  const payload = raw.payload;
  const cf =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>).companyForm
      : undefined;
  const nested = cf && typeof cf === 'object' ? (cf as Record<string, unknown>) : undefined;
  if (!nested) {
    return raw;
  }
  if (!String(raw.code ?? '').trim()) {
    raw.code = String(nested.shortName ?? nested.enterpriseCode ?? 'LE').trim();
  }
  if (!String(raw.name ?? '').trim()) {
    raw.name = String(nested.nameVi ?? '').trim();
  }
  return raw;
}
