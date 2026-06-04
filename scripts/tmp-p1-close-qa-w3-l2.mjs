#!/usr/bin/env node
/**
 * P1-CLOSE-QA-W3 — FE-W3 L2 matrix W3-1..7 (delete after QA ack).
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';

/** Mirror legalEntityFormMapper.parseLegalEntitySaveFieldErrors (UC-CC-04). */
function parseLegalEntitySaveFieldErrors(message) {
  const lower = String(message).toLowerCase();
  const errors = {};
  const taxMention =
    /mã số thuế|mst|tax.?code|tax_code|số thuế/.test(lower) ||
    (/thuế/.test(lower) && !/vốn điều lệ|charter/.test(lower));
  if (taxMention) errors.taxCode = 'Mã số thuế không hợp lệ.';
  if (/vốn điều lệ|charter.?capital|charter_capital|\bvốn\b/.test(lower)) {
    errors.charterCapital = 'Vốn điều lệ không hợp lệ.';
  }
  if (Object.keys(errors).length === 0 && /400|validation|hợp lệ/.test(lower)) {
    errors.enterpriseCode = 'Dữ liệu pháp nhân chưa hợp lệ';
  }
  return errors;
}

loadDeployEnv();
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5175';
const HOLDING_ROOT = 'xbos-group-holding-root';

const rows = [];
function record(id, name, pass, detail = {}) {
  rows.push({ id, name, pass, ...detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}  ${name}${detail.status != null ? ` HTTP ${detail.status}` : ''}${detail.code ? ` ${detail.code}` : ''}`);
}

async function portalFetch(path, init = {}, session) {
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${session.access_token}`,
    'x-tenant-id': session.defaultTenantId ?? session.default_tenant_id ?? 'xevn',
    'x-company-id': session.defaultCompanyId ?? session.default_company_id ?? 'main',
    ...(init.headers ?? {}),
  };
  const res = await fetch(`${PORTAL}${path}`, { ...init, headers: { ...headers, ...init.headers } });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body?.code, message: body?.message ?? body?.error?.message ?? '' };
}

function pickMemberFromGroupUnits(membersRes) {
  const payload = membersRes.body?.data ?? {};
  const members = payload.members ?? payload.items ?? [];
  return members.find((m) => m?.id && m.id !== HOLDING_ROOT && /^[0-9a-f-]{36}$/i.test(String(m.id)));
}

async function main() {
  const session = await portalLogin('ceo@xe.vn', 'Xevn@2026');

  // W3-1 / J-CC-02 — member units + legal entity edit load
  const members = await portalFetch('/api/xbos/tenant-scope/group-member-units', {}, session);
  record('W3-1a', 'group-member-units (J-CC-02)', members.status === 200, members);

  const legal = await portalFetch('/api/xbos/org-foundation/legal-entities', {}, session);
  const entity = pickMemberFromGroupUnits(members);
  record('W3-1b', 'member unit row from group-member-units', Boolean(entity?.id), { entityId: entity?.id });

  let detail = { status: 0, code: 'skip' };
  let shareholders = { status: 0, code: 'skip' };
  let documents = { status: 0, code: 'skip' };
  if (entity?.id) {
    detail = await portalFetch(`/api/xbos/org-foundation/legal-entities/${entity.id}`, {}, session);
    shareholders = await portalFetch(
      `/api/xbos/org-foundation/legal-entities/${entity.id}/shareholders`,
      {},
      session,
    );
    documents = await portalFetch(
      `/api/xbos/org-foundation/legal-entities/${entity.id}/documents`,
      {},
      session,
    );
  }
  const shOk = shareholders.status === 200 || shareholders.code === 'XBOS-ORG-200';
  const docOk = documents.status === 200 || documents.code === 'XBOS-ORG-200';
  record(
    'W3-1',
    'member legal entity + shareholders + documents GET',
    Boolean(entity?.id) && detail.status === 200 && shOk && docOk,
    { entityId: entity?.id, detail, shareholders, documents },
  );

  // W3-2 — valid save
  let saveOk = false;
  if (entity?.id) {
    const saveBody = {
      name: entity.name ?? 'QA W3 Entity',
      code: entity.code ?? 'QA-W3',
      entityType: 'subsidiary',
      taxCode: entity.tax_code ?? entity.payload?.taxCode ?? '0123456789',
      charterCapital: entity.charter_capital ?? 1000000000,
      legalRepresentative: entity.legal_representative ?? 'QA Rep',
      payload: { companyForm: entity.payload?.companyForm ?? {} },
    };
    const put = await portalFetch(`/api/xbos/org-foundation/legal-entities/${entity.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(saveBody),
    }, session);
    saveOk = put.status === 200 && (put.code === 'XBOS-ORG-200' || put.body?.data?.id);
    record('W3-2', 'legal entity PUT valid', saveOk, put);
  } else {
    record('W3-2', 'legal entity PUT valid', false, { note: 'no entity id' });
  }

  // W3-3 — UC-CC-04: inline rules (FE) + API validation envelope when sent
  const mapperTax = parseLegalEntitySaveFieldErrors('Mã số thuế không hợp lệ (HTTP 400)');
  const mapperOk = Boolean(mapperTax.taxCode);
  let apiValOk = false;
  if (entity?.id) {
    const bad = await portalFetch(`/api/xbos/org-foundation/legal-entities/${entity.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: '',
        code: '!!',
        tax_code: 'not-a-number',
        charter_capital: -1,
      }),
    }, session);
    const msg = String(bad.message ?? bad.body?.message ?? JSON.stringify(bad.body ?? {}));
    const fieldErrors = parseLegalEntitySaveFieldErrors(msg);
    apiValOk =
      bad.status === 400 &&
      (fieldErrors.taxCode || fieldErrors.charterCapital || fieldErrors.enterpriseCode || fieldErrors.nameVi);
    record('W3-3', 'UC-CC-04 validation (mapper + API)', mapperOk && apiValOk, { mapperOk, apiValOk, bad, fieldErrors });
  } else {
    record('W3-3', 'UC-CC-04 validation (mapper + API)', mapperOk, { mapperOk, apiValOk: false });
  }

  // W3-4 — holding root blocked
  const holdingPut = await portalFetch(`/api/xbos/org-foundation/legal-entities/${HOLDING_ROOT}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Blocked', tax_code: '0999999999', charter_capital: 1 }),
  }, session);
  record(
    'W3-4',
    'holding root save blocked (no 500)',
    holdingPut.status === 400 || holdingPut.status === 403 || holdingPut.status === 404,
    holdingPut,
  );

  // W3-5 — workflow definition PUT (persisted UUID)
  const defs = await portalFetch('/api/xbos/workflow-engine/definitions?company_id=main', {}, session);
  const defItems = defs.body?.data?.items ?? defs.body?.data ?? [];
  const defRow = Array.isArray(defItems)
    ? defItems.find((d) => /^[0-9a-f-]{36}$/i.test(String(d?.id)))
    : null;
  let w35 = false;
  if (defRow?.id) {
    const graph =
      defRow.graph && typeof defRow.graph === 'object'
        ? defRow.graph
        : { nodes: [{ id: 'start', type: 'start' }], edges: [] };
    const wfPut = await portalFetch(`/api/xbos/workflow-engine/definitions/${defRow.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: defRow.name ?? 'QA WF',
        code: defRow.code ?? 'QA-WF',
        graph,
        status: defRow.status ?? 'active',
        tenantId: 'xevn',
        companyId: 'main',
      }),
    }, session);
    w35 = wfPut.status === 200 && wfPut.code !== 'XBOS-SYS-001';
    record('W3-5', 'workflow definition PUT uuid', w35, wfPut);
  } else {
    const wfGet = await portalFetch('/api/xbos/workflow-engine/definitions', {}, session);
    record('W3-5', 'workflow definition PUT uuid', false, { note: 'no persisted definition', wfGet });
  }

  // W3-6 — settings master APIs (ECO-FE-01 slice)
  const pos = await portalFetch('/api/xbos/position-rbac/templates', {}, session);
  const vendors = await portalFetch(
    '/api/xbos/business-master/vendors/items?tenantId=xevn&companyId=main',
    {},
    session,
  );
  record(
    'W3-6',
    'settings master APIs 200 (ECO-FE-01 slice)',
    pos.status === 200 && vendors.status === 200,
    { pos, vendors },
  );

  // W3-7 — HRM embed unchanged
  const hrmEmp = await portalFetch('/api/hrm/employees?page_size=5&company_id=main', {}, session);
  record('W3-7', 'HRM embed employees proxy', hrmEmp.status === 200 && hrmEmp.code === 'HRM-EMP-200', hrmEmp);

  const failed = rows.filter((r) => !r.pass);
  console.log(`\n=== W3 L2 ${rows.length - failed.length}/${rows.length} PASS ===`);
  process.exitCode = failed.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
