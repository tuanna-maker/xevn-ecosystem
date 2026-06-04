import { hrmBase, xbosBase } from '../seed-env-loader.mjs';

export function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

export async function fetchJson(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { res, body, status: res.status };
}

export function hrmApiBase() {
  return `${hrmBase().replace(/\/+$/, '')}/api/hrm`;
}

export function xbosApiBase() {
  return `${xbosBase().replace(/\/+$/, '')}/api/xbos`;
}

export async function hrmReq(path, init = {}) {
  return fetchJson(`${hrmApiBase()}${path}`, init);
}

export async function xbosReq(path, init = {}) {
  return fetchJson(`${xbosApiBase()}${path}`, init);
}

export async function checkHrmHealth() {
  const { body, status } = await hrmReq('/');
  assert(status === 200 && body?.success === true, `HRM health failed: ${status}`);
  return body;
}

export async function checkXbosHealth() {
  const { body, status } = await xbosReq('/');
  assert(status === 200, `XBOS health failed: ${status}`);
  return body;
}

export async function portalLogin(email, password) {
  const { body, status } = await xbosReq('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  assert(status === 200 || status === 201, `portal login HTTP ${status}`);
  const data = body?.data ?? {};
  const token = data.access_token ?? data.accessToken;
  assert(body?.success === true && token, `portal login: ${body?.code ?? 'no token'}`);
  return { ...data, access_token: token };
}

export async function mobileLogin(email, password, scopeHeaders = {}) {
  const { body, status } = await hrmReq('/auth/mobile/login', {
    method: 'POST',
    headers: scopeHeaders,
    body: JSON.stringify({ email, password }),
  });
  return { body, status, ok: status === 200 || status === 201 };
}

export function authHeaders(session) {
  const tenant =
    session.default_tenant_id ??
    session.defaultTenantId ??
    session.tenant_id ??
    session.tenantId;
  const company =
    session.default_company_id ??
    session.defaultCompanyId ??
    session.company_id ??
    session.companyId;
  return {
    Authorization: `Bearer ${session.access_token}`,
    'x-tenant-id': tenant,
    'x-company-id': company,
  };
}

export async function scopeMismatchProbe(token, tenantId, companyId) {
  const { status, body } = await hrmReq('/attendance/leave-requests?limit=1', {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId,
      'x-company-id': companyId,
    },
  });
  return { status, code: body?.code };
}
