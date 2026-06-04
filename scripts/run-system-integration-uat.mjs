#!/usr/bin/env node
/**
 * System integration UAT — live HRM/XBOS APIs + Postgres verification.
 * Usage: node scripts/run-system-integration-uat.mjs [--seed] [--batch-size=50]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadDeployEnv, repoRoot, internalKey } from './seed-env-loader.mjs';
import {
  assert,
  authHeaders,
  checkHrmHealth,
  checkXbosHealth,
  hrmReq,
  mobileLogin,
  portalLogin,
  scopeMismatchProbe,
} from './lib/uat-http.mjs';
import {
  createHrmClient,
  verifyUatWorkforceInDb,
  findUatEmployeeBySeq,
  countLeaveRequestsForEmployee,
  countAttendanceRecordsForEmployee,
} from './lib/uat-db.mjs';
import {
  UAT_ROLES,
  batchSampleIndices,
  buildUatEmployee,
  expectedMobileRoles,
  roleSampleIndices,
  attendanceCompanyUuid,
  resolveMasterTenant,
} from './lib/uat-workforce.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const reportDir = resolve(repoRoot, 'docs/qa/evidence');
const reportPath = resolve(reportDir, 'system-integration-uat-report.json');

const args = process.argv.slice(2);
const shouldSeed = args.includes('--seed');
const batchSizeArg = args.find((a) => a.startsWith('--batch-size='));
const batchLoginSize = batchSizeArg ? Number(batchSizeArg.split('=')[1]) : 50;

const uatPassword = process.env.UAT_PASSWORD ?? 'xevn-uat-2026';
const portalEmail = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const portalPassword = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';

const report = {
  started_at: new Date().toISOString(),
  env: {},
  summary: { pass: 0, fail: 0, skip: 0 },
  phases: [],
};

function record(phase, name, status, detail = {}) {
  report.phases.push({ phase, name, status, ...detail, at: new Date().toISOString() });
  if (status === 'PASS') report.summary.pass += 1;
  else if (status === 'FAIL') report.summary.fail += 1;
  else report.summary.skip += 1;
}

async function runPhase(phase, name, fn) {
  try {
    const detail = await fn();
    record(phase, name, 'PASS', detail);
    console.log(`PASS  [${phase}] ${name}`);
    return true;
  } catch (err) {
    record(phase, name, 'FAIL', { error: err.message });
    console.error(`FAIL  [${phase}] ${name}: ${err.message}`);
    return false;
  }
}

function runSeed() {
  const r = spawnSync(process.execPath, [`${repoRoot}/scripts/seed-hrm-1000-uat-workforce.mjs`], {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });
  if (r.status !== 0) throw new Error(`seed exited ${r.status}`);
}

async function main() {
  loadDeployEnv();
  report.env = {
    hrm_port: process.env.HRM_BE_PORT ?? '28001',
    xbos_port: process.env.XBOS_BE_PORT ?? '28002',
    db_host: process.env.DB_HOST,
    hrm_db: process.env.HRM_DB_NAME ?? 'xevn_hrm',
    master_tenant: resolveMasterTenant(),
  };

  if (shouldSeed) {
    await runPhase('P0', 'seed-hrm-1000-uat-workforce', async () => {
      runSeed();
      return { seeded: true };
    });
  }

  await runPhase('P0', 'hrm-api-health', async () => {
    const body = await checkHrmHealth();
    return { code: body?.code };
  });

  await runPhase('P0', 'xbos-api-health', async () => {
    await checkXbosHealth();
    return {};
  });

  await runPhase('P1', 'db-workforce-count-roles-tenant', async () => {
    const client = createHrmClient();
    await client.connect();
    try {
      const v = await verifyUatWorkforceInDb(client);
      assert(v.total === v.expected_total, `expected ${v.expected_total} employees, got ${v.total}`);
      assert(v.distinct_roles >= v.expected_roles, `expected >=${v.expected_roles} roles, got ${v.distinct_roles}`);
      assert(
        v.with_tenant_and_password === v.total,
        `missing tenant/password on ${v.total - v.with_tenant_and_password} rows`,
      );
      return v;
    } finally {
      await client.end();
    }
  });

  let portalSession;
  await runPhase('P2', 'xbos-portal-login-rbac', async () => {
    portalSession = await portalLogin(portalEmail, portalPassword);
    assert(Array.isArray(portalSession.memberships) && portalSession.memberships.length > 0, 'no memberships');
    assert(portalSession.access_token, 'no access_token');
    return {
      email: portalEmail,
      membership_count: portalSession.memberships.length,
      default_tenant: portalSession.default_tenant_id ?? portalSession.tenantId,
    };
  });

  const roleResults = [];
  for (const idx of roleSampleIndices()) {
    const seq = idx + 1;
    const e = buildUatEmployee(idx, uatPassword);
    const role = UAT_ROLES[idx];
    await runPhase('P3', `mobile-login-role-${role}`, async () => {
      const { body, ok } = await mobileLogin(e.email, uatPassword);
      assert(ok, `login failed: ${body?.code ?? 'unknown'}`);
      assert(body?.success === true, 'success false');
      const exp = expectedMobileRoles(role);
      const got = body.data.roles ?? [];
      for (const r of exp) {
        assert(got.includes(r), `missing role ${r} for ${role}, got ${got.join(',')}`);
      }
      roleResults.push({ role, email: e.email, roles: got });
      return { employee_code: e.employee_code, roles: got };
    });
  }

  const batchIndices = batchSampleIndices(batchLoginSize);
  let batchPass = 0;
  let batchFail = 0;
  for (const idx of batchIndices) {
    const e = buildUatEmployee(idx, uatPassword);
    const { ok } = await mobileLogin(e.email, uatPassword);
    if (ok) batchPass += 1;
    else batchFail += 1;
  }
  await runPhase('P3', 'mobile-login-batch-sample', async () => {
    assert(batchFail === 0, `${batchFail}/${batchIndices.length} batch logins failed`);
    return { sampled: batchIndices.length, pass: batchPass };
  });

  let driverSession;
  await runPhase('P4', 'tenant-scope-header-mismatch', async () => {
    const driver = buildUatEmployee(15, uatPassword);
    const { body, ok } = await mobileLogin(driver.email, uatPassword);
    assert(ok, 'driver login failed');
    driverSession = body.data;
    const token = driverSession.access_token;
    const tenant = driverSession.default_tenant_id;
    const company = driverSession.default_company_id;
    const wrongTenant = tenant === 'xevn' ? 'other-tenant' : 'xevn';
    const tMismatch = await scopeMismatchProbe(token, wrongTenant, company);
    assert(
      tMismatch.status === 409 || tMismatch.status === 403 || tMismatch.status === 400,
      `tenant mismatch expected 409/403/400, got ${tMismatch.status}`,
    );
    const wrongCompany = company === 'holding' ? 'finance' : 'holding';
    const cMismatch = await scopeMismatchProbe(token, tenant, wrongCompany);
    assert(
      cMismatch.status === 409 || cMismatch.status === 403 || cMismatch.status === 400,
      `company mismatch expected 409/403/400, got ${cMismatch.status}`,
    );
    return { tenant_mismatch: tMismatch.status, company_mismatch: cMismatch.status };
  });

  const tenantId = resolveMasterTenant();
  const crudDate =
    process.env.UAT_ATTENDANCE_DATE ??
    new Date().toISOString().slice(0, 10);
  let leaveId;
  /** P5 leave row `company_id` — P6 approve must use same `x-company-id` (not CEO `holding`). */
  let leaveCompanyId;
  let attendanceId;

  await runPhase('P5', 'attendance-record-create-list-db', async () => {
    const emp = buildUatEmployee(15, uatPassword);
    const { body, ok } = await mobileLogin(emp.email, uatPassword);
    assert(ok, 'login for attendance read path');
    const session = body.data;
    const companyUuid = session.company_uuid;
    const serviceHeaders = {
      'x-internal-api-key': internalKey(),
      'x-tenant-id': tenantId,
      'x-company-id': session.default_company_id,
      'x-request-id': `uat-att-${Date.now()}`,
    };
    const create = await hrmReq('/attendance/records', {
      method: 'POST',
      headers: serviceHeaders,
      body: JSON.stringify({
        company_id: companyUuid,
        employee_id: session.employee.id,
        attendance_date: crudDate,
        check_in_at: `${crudDate}T01:00:00.000Z`,
        check_out_at: `${crudDate}T10:00:00.000Z`,
        status: 'present',
        note: 'system-integration-uat',
        created_by: 'qa-uat-runner',
      }),
    });
    const createOk =
      create.status === 200 ||
      create.status === 201 ||
      (create.status === 400 && create.body?.code === 'HRM-ATT-001');
    assert(createOk, `create attendance ${create.status} ${create.body?.code}`);
    attendanceId = create.body?.data?.id;

    const list = await hrmReq(
      `/attendance/records?company_id=${encodeURIComponent(companyUuid)}&employee_id=${encodeURIComponent(session.employee.id)}&from_date=${crudDate}&to_date=${crudDate}`,
      { headers: serviceHeaders },
    );
    assert(list.body?.success === true, `list attendance: ${list.body?.code}`);

    const client = createHrmClient();
    await client.connect();
    try {
      const dbCount = await countAttendanceRecordsForEmployee(client, session.employee.id, crudDate);
      assert(dbCount >= 1, `DB attendance_records count expected >=1, got ${dbCount}`);
    } finally {
      await client.end();
    }
    return { attendance_id: attendanceId, db_rows: true, write_path: 'internal-key+scope' };
  });

  const mobileAttDate =
    process.env.UAT_MOBILE_ATTENDANCE_DATE ??
    `${crudDate.slice(0, 8)}${String(Number(crudDate.slice(8, 10)) + 1).padStart(2, '0')}`;

  await runPhase('P5', 'mobile-jwt-attendance-record-uuid-scope', async () => {
    const driverIdx = UAT_ROLES.indexOf('DRIVER');
    assert(driverIdx >= 0, 'DRIVER role missing from UAT_ROLES');
    const emp = buildUatEmployee(driverIdx, uatPassword);
    const { body, ok } = await mobileLogin(emp.email, uatPassword);
    assert(ok, 'DRIVER mobile login failed');
    const session = body.data;
    assert(session.roles?.includes('employee'), `DRIVER roles expected employee, got ${session.roles?.join(',')}`);
    const companyUuid = session.company_uuid;
    assert(companyUuid && /^[0-9a-f-]{36}$/i.test(companyUuid), 'company_uuid missing on session');
    const headers = authHeaders(session);
    const create = await hrmReq('/attendance/records', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        company_id: companyUuid,
        employee_id: session.employee.id,
        attendance_date: mobileAttDate,
        check_in_at: `${mobileAttDate}T02:00:00.000Z`,
        check_out_at: `${mobileAttDate}T11:00:00.000Z`,
        status: 'present',
        note: 'uat-mob-att-scope-01',
        created_by: session.employee.employee_code,
      }),
    });
    assert(
      create.status === 200 ||
        create.status === 201 ||
        (create.status === 400 && create.body?.code === 'HRM-ATT-001'),
      `mobile JWT create attendance ${create.status} ${create.body?.code ?? ''} (no internal key)`,
    );
    assert(create.body?.code !== 'SCOPE_CONTEXT_MISMATCH', 'SCOPE_CONTEXT_MISMATCH on mobile UUID body');
    const list = await hrmReq(
      `/attendance/records?company_id=${encodeURIComponent(companyUuid)}&employee_id=${encodeURIComponent(session.employee.id)}&from_date=${mobileAttDate}&to_date=${mobileAttDate}`,
      { headers },
    );
    assert(list.body?.success === true, `mobile JWT list attendance: ${list.body?.code}`);
    const client = createHrmClient();
    await client.connect();
    try {
      const dbCount = await countAttendanceRecordsForEmployee(client, session.employee.id, mobileAttDate);
      assert(dbCount >= 1, `DB attendance_records for DRIVER mobile write expected >=1, got ${dbCount}`);
    } finally {
      await client.end();
    }
    return {
      role: 'DRIVER',
      employee_code: session.employee.employee_code,
      company_uuid: companyUuid,
      write_path: 'mobile-jwt-only',
      attendance_date: mobileAttDate,
    };
  });

  await runPhase('P5', 'leave-request-create-list-db', async () => {
    const emp = buildUatEmployee(15, uatPassword);
    const { body, ok } = await mobileLogin(emp.email, uatPassword);
    assert(ok, 'login for leave CRUD');
    const session = body.data;
    const headers = authHeaders(session);
    const companyUuid = session.company_uuid;
    const beforeClient = createHrmClient();
    await beforeClient.connect();
    let beforeCount = 0;
    try {
      beforeCount = await countLeaveRequestsForEmployee(beforeClient, session.employee.id);
    } finally {
      await beforeClient.end();
    }

    const create = await hrmReq('/attendance/leave-requests', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        company_id: companyUuid,
        employee_id: session.employee.id,
        employee_code: session.employee.employee_code,
        employee_name: session.employee.full_name,
        leave_type: 'annual',
        start_date: '2026-06-01',
        end_date: '2026-06-02',
        total_days: 2,
        reason: 'system-integration-uat',
      }),
    });
    assert(create.status === 200 || create.status === 201, `create leave ${create.status} ${create.body?.code}`);
    leaveId = create.body?.data?.id;
    leaveCompanyId = create.body?.data?.company_id ?? companyUuid;

    const list = await hrmReq(
      `/attendance/leave-requests?company_id=${encodeURIComponent(companyUuid)}&employee_id=${encodeURIComponent(session.employee.id)}`,
      { headers },
    );
    assert(list.body?.success === true, `list leave: ${list.body?.code}`);

    const client = createHrmClient();
    await client.connect();
    try {
      const afterCount = await countLeaveRequestsForEmployee(client, session.employee.id);
      assert(afterCount > beforeCount, `DB leave_requests expected increase, before=${beforeCount} after=${afterCount}`);
    } finally {
      await client.end();
    }
    return { leave_id: leaveId };
  });

  await runPhase('P5', 'payroll-payslips-list', async () => {
    const emp = buildUatEmployee(7, uatPassword);
    const { body, ok } = await mobileLogin(emp.email, uatPassword);
    assert(ok, 'login for payroll');
    const session = body.data;
    const headers = authHeaders(session);
    const payslips = await hrmReq(
      `/payroll/payslips?company_id=${encodeURIComponent(session.default_company_id)}&employee_id=${encodeURIComponent(session.employee.id)}`,
      { headers },
    );
    assert(payslips.body?.success === true, `payslips: ${payslips.status} ${payslips.body?.code}`);
    return { count: payslips.body?.data?.items?.length ?? payslips.body?.data?.length ?? 0 };
  });

  await runPhase('P6', 'manager-approve-leave-sample', async () => {
    const manager = buildUatEmployee(0, uatPassword);
    const { body, ok } = await mobileLogin(manager.email, uatPassword);
    assert(ok, 'CEO/manager login');
    const session = body.data;
    assert(session.roles?.includes('manager') || session.roles?.includes('hr_manager'), 'manager roles expected');
    if (!leaveId) {
      return { skipped: true, reason: 'no leaveId from prior phase' };
    }
    assert(leaveCompanyId, 'leaveCompanyId from P5 required (must match leave row company_id)');
    const headers = {
      ...authHeaders(session),
      'x-company-id': leaveCompanyId,
    };
    const approve = await hrmReq(`/attendance/leave-requests/${leaveId}/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        reviewer_name: session.employee.full_name,
        reviewer_employee_id: session.employee.id,
      }),
    });
    assert(
      approve.status === 200 || approve.status === 201 || approve.body?.code === 'HRM-LEAVE-203',
      `approve: ${approve.status} ${approve.body?.code}`,
    );
    return { leave_id: leaveId, approved: true };
  });

  await runPhase('P6', 'db-spot-check-ceo-record', async () => {
    const row = await (async () => {
      let lastErr;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const client = createHrmClient();
        try {
          await client.connect();
          return await findUatEmployeeBySeq(client, 1);
        } catch (e) {
          lastErr = e;
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        } finally {
          try {
            await client.end();
          } catch {
            // noop
          }
        }
      }
      throw lastErr;
    })();
    assert(row, `workforce seq ${1} not in DB (expected realistic-v2 employee_code)`);
    assert(row.custom_fields?.tenant_id === tenantId, 'tenant_id mismatch on CEO row');
    const expectedUuid = attendanceCompanyUuid(tenantId, row.company_id);
    assert(
      row.custom_fields?.attendance_company_uuid === expectedUuid,
      'attendance_company_uuid mismatch',
    );
    return { employee_code: row.employee_code, company_id: row.company_id };
  });

  report.finished_at = new Date().toISOString();
  report.verdict = report.summary.fail === 0 ? 'PASS' : 'FAIL';

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n=== System Integration UAT Summary ===');
  console.log(`Verdict: ${report.verdict}`);
  console.log(`PASS: ${report.summary.pass}  FAIL: ${report.summary.fail}  SKIP: ${report.summary.skip}`);
  console.log(`Report: ${reportPath}`);

  process.exit(report.summary.fail === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('UAT runner fatal:', err.message);
  process.exit(1);
});
