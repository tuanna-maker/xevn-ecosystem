export type MobileJwtClaims = {
  sub?: string;
  tenantId?: string;
  companyId?: string;
  company_uuid?: string;
  employee_id?: string;
  roles?: string[];
};

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  if (typeof atob === 'function') {
    return atob(padded);
  }
  return Buffer.from(padded, 'base64').toString('utf8');
}

export function parseJwtClaims(token: string): MobileJwtClaims | null {
  const raw = token.replace(/^Bearer\s+/i, '').trim();
  const parts = raw.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
    const roles = Array.isArray(json.roles)
      ? json.roles.filter((r): r is string => typeof r === 'string')
      : undefined;
    return {
      sub: typeof json.sub === 'string' ? json.sub : undefined,
      tenantId:
        typeof json.tenantId === 'string'
          ? json.tenantId
          : typeof json.tenant_id === 'string'
            ? json.tenant_id
            : undefined,
      companyId:
        typeof json.companyId === 'string'
          ? json.companyId
          : typeof json.company_id === 'string'
            ? json.company_id
            : undefined,
      company_uuid: typeof json.company_uuid === 'string' ? json.company_uuid : undefined,
      employee_id: typeof json.employee_id === 'string' ? json.employee_id : undefined,
      roles,
    };
  } catch {
    return null;
  }
}

export function isManagerRole(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === 'manager' || r === 'hr_manager');
}
