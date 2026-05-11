/** Minimal JWT-shaped string so `resolveIdentityScope` reads tenant/company from payload (same shape as runtime `VITE_SERVICE_JWT_TOKEN`). */
export function minimalScopeJwt(tenantId: string, companyId: string): string {
  const payload = Buffer.from(JSON.stringify({ tenantId, companyId }), 'utf8').toString('base64url');
  return `unused.${payload}.unused`;
}
