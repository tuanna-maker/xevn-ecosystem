#!/usr/bin/env node
/**
 * L2 pilot smoke — Command Center routes P-CC-02..04 via portal proxy (no browser).
 * Account: ceo@xe.vn / Xevn@2026 (override with UAT_PORTAL_EMAIL / PORTAL_DEV_PASSWORD).
 *
 * Usage: node scripts/pilot-business-flow-smoke.mjs
 */
import { loadDeployEnv } from './seed-env-loader.mjs';
import { portalLogin } from './lib/uat-http.mjs';
import { resolvePortalBase } from './lib/portal-base-resolver.mjs';

loadDeployEnv();

const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
let PORTAL = '';

const checks = [];

function record(id, name, pass, detail = {}) {
  checks.push({ id, name, pass, ...detail });
  const mark = pass ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${id}  ${name}${detail.status != null ? `  HTTP ${detail.status}` : ''}${detail.code ? `  ${detail.code}` : ''}`);
}

async function portalGet(path, headers) {
  const res = await fetch(`${PORTAL}${path}`, {
    headers: { Accept: 'application/json', ...headers },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, code: body?.code };
}

async function main() {
  PORTAL = await resolvePortalBase();
  console.log(`pilot-business-flow-smoke — ${PORTAL}\n`);

  const session = await portalLogin(email, password);
  const tenant = session.defaultTenantId ?? session.default_tenant_id ?? 'xevn';
  const company = session.defaultCompanyId ?? session.default_company_id ?? 'main';
  const token = session.access_token ?? session.accessToken;
  const expiresInSec = session.expiresInSec ?? session.expires_in_sec;

  record(
    'P-CC-01',
    'portal login expiresInSec=86400',
    expiresInSec === 86400,
    { expiresInSec, tenant, company },
  );

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenant,
    'x-company-id': company,
  };

  const gmu = await portalGet('/api/xbos/tenant-scope/group-member-units', headers);
  const memberCount = Array.isArray(gmu.body?.data?.members)
    ? gmu.body.data.members.length
    : Array.isArray(gmu.body?.data)
      ? gmu.body.data.length
      : 0;
  record('P-CC-02', 'group-member-units 200 with members', gmu.status === 200 && memberCount >= 1, {
    status: gmu.status,
    memberCount,
    code: gmu.code,
  });

  const emp = await portalGet('/api/hrm/employees?company_id=main&page_size=100', headers);
  record('P-CC-03', 'employees page_size=100 → 200', emp.status === 200, {
    status: emp.status,
    code: emp.code,
    total: emp.body?.data?.total ?? emp.body?.meta?.total,
  });

  const catalogs = await portalGet('/api/hrm/settings-catalogs', headers);
  const contracts = await portalGet(
    '/api/hrm/contracts-insurance/contracts?company_id=main',
    headers,
  );
  const rollupShell = await portalGet(
    `/api/xbos/kpi-engine/rollup?tenantId=${encodeURIComponent(tenant)}&companyId=${encodeURIComponent(company)}`,
    headers,
  );

  const hrmOk = catalogs.status === 200 && contracts.status === 200;
  const rollup409 =
    rollupShell.status === 409 && rollupShell.code === 'SCOPE_CONTEXT_MISMATCH';

  record('P-CC-04a', 'settings-catalogs → 200', catalogs.status === 200, {
    status: catalogs.status,
    code: catalogs.code,
  });
  record('P-CC-04b', 'contracts-insurance → 200', contracts.status === 200, {
    status: contracts.status,
    code: contracts.code,
  });
  record(
    'P-CC-04c',
    'kpi-engine rollup (JWT-aligned shell scope) must not 409',
    !rollup409,
    {
      status: rollupShell.status,
      code: rollupShell.code,
      message: rollupShell.body?.message,
      tenant,
      company,
      note: 'Matches useCommandCenterSparkline resolveIdentityScope (HRM-EMBED-D6)',
    },
  );

  const pcc04Pass = hrmOk && !rollup409;
  record('P-CC-04', 'contracts route aggregate', pcc04Pass, { hrmOk, rollup409 });

  const insurance = await portalGet(
    '/api/hrm/contracts-insurance/contracts?company_id=main',
    headers,
  );
  record('P-CC-05', 'insurance contracts company_id=main → 200', insurance.status === 200, {
    status: insurance.status,
    code: insurance.code,
  });

  const recruitment = await portalGet(
    '/api/hrm/recruitment/requisitions?company_id=main&page_size=100',
    headers,
  );
  record('P-CC-06', 'recruitment requisitions company_id=main → 200', recruitment.status === 200, {
    status: recruitment.status,
    code: recruitment.code,
  });

  const attendance = await portalGet(
    '/api/hrm/attendance/records?company_id=main&page_size=100',
    headers,
  );
  record('P-CC-07', 'attendance records company_id=main → 200', attendance.status === 200, {
    status: attendance.status,
    code: attendance.code,
  });

  const payroll = await portalGet(
    '/api/hrm/payroll/payslips?company_id=main&page_size=100',
    headers,
  );
  record('P-CC-08', 'payroll payslips company_id=main → 200', payroll.status === 200, {
    status: payroll.status,
    code: payroll.code,
  });

  const catGovInbox = await portalGet(
    '/api/xbos/catalog-governance/inbox?assigneeUserId=ceo@xe.vn',
    headers,
  );
  const inbox409 =
    catGovInbox.status === 409 && catGovInbox.code === 'SCOPE_CONTEXT_MISMATCH';
  const inboxItems = Array.isArray(catGovInbox.body?.data?.items)
    ? catGovInbox.body.data.items
    : [];
  record(
    'P-CC-09',
    'catalog-governance inbox (group CEO JWT main) → 200, not 409',
    catGovInbox.status === 200 && catGovInbox.code === 'XBOS-CAT-212' && !inbox409,
    {
      status: catGovInbox.status,
      code: catGovInbox.code,
      itemCount: inboxItems.length,
      note: 'P1-S2-BE-C6 / QC C10 — empty inbox is alternate PASS',
    },
  );

  if (inboxItems.length > 0) {
    const taskId = inboxItems[0].id;
    const approveRes = await fetch(
      `${PORTAL}/api/xbos/catalog-governance/tasks/${encodeURIComponent(taskId)}/approve?tenantId=${encodeURIComponent(tenant)}&companyId=holding`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...headers,
          'x-user-id': email,
        },
        body: JSON.stringify({ review_note: 'pilot-smoke P-CC-09b' }),
      },
    );
    const approveBody = await approveRes.json().catch(() => ({}));
    record('P-CC-09b', 'catalog-governance approve pending task', approveRes.status === 200, {
      status: approveRes.status,
      code: approveBody?.code,
      taskId,
      note: 'Write scope strict — holding query with JWT main may 409 by ADR',
    });
  } else {
    record('P-CC-09b', 'catalog-governance approve (skipped — empty inbox)', true, {
      skipped: true,
      note: 'Alternate empty+200; jest covers approve scope rejection',
    });
  }

  const failed = checks.filter((c) => !c.pass);
  console.log(`\n=== Summary: ${checks.length - failed.length}/${checks.length} PASS ===`);
  if (failed.length) {
    console.log('Failed:', failed.map((c) => c.id).join(', '));
    process.exit(1);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
