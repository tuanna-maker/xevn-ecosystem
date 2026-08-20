/**
 * PO-HRM-ATT-LEAVE-FUNNEL-BE-02 — API smoke (U65 zero-seed, not UF claim)
 * Open-period approve → materialized_days>0 + records leave
 * Closed Sept overlap → 409 HRM-ATT-SHEET-LOCKED
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const STAMP = `LVFN-BE02-${Date.now().toString(36).toUpperCase()}`;

const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-po-hrm-att-leave-funnel-be-02-smoke.json',
);

async function login() {
  for (const base of [PORTAL, XBOS]) {
    const res = await fetch(`${base}/api/xbos/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    }).catch(() => null);
    if (!res) continue;
    const body = await res.json().catch(() => ({}));
    const token = body?.data?.accessToken || body?.accessToken;
    if (token) return { token, via: base, status: res.status };
  }
  return null;
}

async function main() {
  const report = {
    work_item_id: 'PO-HRM-ATT-LEAVE-FUNNEL-BE-02',
    layer: 'L1-api-smoke',
    u65: 'zero-seed',
    attendance_uat_ready: false,
    stamp: STAMP,
    startedAt: new Date().toISOString(),
    steps: [],
  };

  const auth = await login();
  report.steps.push({ step: 'login', ok: Boolean(auth?.token), via: auth?.via });
  if (!auth?.token) {
    report.verdict = 'FAIL_LOGIN';
    writeReport(report);
    process.exit(2);
  }

  const headers = {
    Authorization: `Bearer ${auth.token}`,
    Accept: 'application/json',
    'content-type': 'application/json',
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };

  const empRes = await fetch(`${HRM}/api/hrm/employees?company_id=main&page_size=5`, { headers });
  const empBody = await empRes.json().catch(() => ({}));
  const empPayload = empBody?.data;
  const empItems = Array.isArray(empPayload)
    ? empPayload
    : empPayload?.data || empPayload?.items || empPayload?.rows || [];
  const emp = Array.isArray(empItems) ? empItems[0] : null;
  report.steps.push({
    step: 'employee',
    status: empRes.status,
    employee_id: emp?.id ?? null,
    code: emp?.employee_code || emp?.code,
  });
  if (!emp?.id) {
    report.verdict = 'FAIL_NO_EMPLOYEE';
    writeReport(report);
    process.exit(2);
  }

  // --- Open period (unique Dec days; retry on overlap) ---
  let openStart = '';
  let openEnd = '';
  let openId = null;
  let createOpen = { status: 0 };
  let createOpenBody = {};
  for (let attempt = 0; attempt < 10; attempt++) {
    const openStartDay = 20 + ((Number(String(Date.now()).slice(-3)) + attempt * 3) % 11); // 20..30
    openStart = `2026-12-${String(openStartDay).padStart(2, '0')}`;
    openEnd = openStart;
    createOpen = await fetch(`${HRM}/api/hrm/attendance/leave-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        company_id: 'main',
        employee_id: emp.id,
        employee_code: emp.employee_code || emp.code || 'NV',
        employee_name: emp.full_name || emp.display_name || emp.name || 'Smoke Emp',
        leave_type: 'LVT_01',
        start_date: openStart,
        end_date: openEnd,
        total_days: 1,
        reason: `${STAMP} open-period materialize a${attempt}`,
      }),
    });
    createOpenBody = await createOpen.json().catch(() => ({}));
    openId = createOpenBody?.data?.id || createOpenBody?.id || null;
    if (createOpen.status === 201 && openId) break;
    if (createOpenBody?.code !== 'HRM-LEAVE-VAL-OVERLAP') break;
  }
  report.steps.push({
    step: 'create_open_leave',
    status: createOpen.status,
    code: createOpenBody?.code,
    message: createOpenBody?.message,
    id: openId,
    dates: [openStart, openEnd],
  });

  let approveOpen = { status: 0, body: {} };
  if (openId) {
    const res = await fetch(`${HRM}/api/hrm/attendance/leave-requests/${openId}/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reviewer_name: 'BE-02 smoke' }),
    });
    approveOpen = { status: res.status, body: await res.json().catch(() => ({})) };
  }
  const approvePayload = approveOpen.body?.data || approveOpen.body || {};
  const matDays = approvePayload?.materialized_days || [];
  const expectDays = openStart === openEnd ? [openStart] : [openStart, openEnd];
  report.steps.push({
    step: 'approve_open',
    status: approveOpen.status,
    code: approveOpen.body?.code,
    materialized_days: matDays,
    expect_days: expectDays,
    days_match: JSON.stringify(matDays) === JSON.stringify(expectDays),
    ok:
      approveOpen.status >= 200 &&
      approveOpen.status < 300 &&
      Array.isArray(matDays) &&
      matDays.length > 0 &&
      JSON.stringify(matDays) === JSON.stringify(expectDays),
  });

  const recRes = await fetch(
    `${HRM}/api/hrm/attendance/records?company_id=main&from_date=2026-12-20&to_date=2026-12-31&page_size=50`,
    { headers },
  );
  const recBody = await recRes.json().catch(() => ({}));
  const recPayload = recBody?.data;
  const recItems = Array.isArray(recPayload)
    ? recPayload
    : recPayload?.data || recPayload?.items || recPayload?.rows || [];
  const leaveRows = (Array.isArray(recItems) ? recItems : []).filter(
    (r) => r.status === 'leave' && r.leave_request_id === openId,
  );
  report.steps.push({
    step: 'get_records_leave',
    status: recRes.status,
    leave_count: leaveRows.length,
    sample: leaveRows.slice(0, 3).map((r) => ({
      date: r.attendance_date,
      status: r.status,
      leave_request_id: r.leave_request_id,
      leave_type_label: r.leave_type_label,
    })),
    ok: recRes.status === 200 && leaveRows.length > 0,
  });

  // --- Closed sheet overlap (unique mid-Sept within closed sheet) ---
  let lockStart = '';
  let lockEnd = '';
  let lockId = null;
  let createLock = { status: 0 };
  let createLockBody = {};
  for (let attempt = 0; attempt < 10; attempt++) {
    const lockStartDay = 8 + ((Number(String(Date.now()).slice(-3)) + attempt * 2) % 20); // 8..27
    lockStart = `2026-09-${String(lockStartDay).padStart(2, '0')}`;
    lockEnd = lockStart;
    createLock = await fetch(`${HRM}/api/hrm/attendance/leave-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        company_id: 'main',
        employee_id: emp.id,
        employee_code: emp.employee_code || emp.code || 'NV',
        employee_name: emp.full_name || emp.display_name || emp.name || 'Smoke Emp',
        leave_type: 'LVT_01',
        start_date: lockStart,
        end_date: lockEnd,
        total_days: 1,
        reason: `${STAMP} closed-sheet LOCKED a${attempt}`,
      }),
    });
    createLockBody = await createLock.json().catch(() => ({}));
    lockId = createLockBody?.data?.id || createLockBody?.id || null;
    if (createLock.status === 201 && lockId) break;
    if (createLockBody?.code !== 'HRM-LEAVE-VAL-OVERLAP') break;
  }
  report.steps.push({
    step: 'create_lock_leave',
    status: createLock.status,
    code: createLockBody?.code,
    message: createLockBody?.message,
    id: lockId,
    dates: [lockStart, lockEnd],
  });

  let approveLock = { status: 0, body: {} };
  if (lockId) {
    const res = await fetch(`${HRM}/api/hrm/attendance/leave-requests/${lockId}/approve`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reviewer_name: 'BE-02 smoke' }),
    });
    approveLock = { status: res.status, body: await res.json().catch(() => ({})) };
  }
  const lockCode = approveLock.body?.code || approveLock.body?.error?.code;
  const lockMsg = String(approveLock.body?.message || '');
  report.steps.push({
    step: 'approve_lock_overlap',
    status: approveLock.status,
    code: lockCode,
    message: lockMsg,
    materialized_days: approveLock.body?.data?.materialized_days || approveLock.body?.materialized_days,
    ok:
      approveLock.status === 409 &&
      lockCode === 'HRM-ATT-SHEET-LOCKED' &&
      lockMsg.includes(lockStart),
  });

  const openOk = report.steps.find((s) => s.step === 'approve_open')?.ok;
  const recOk = report.steps.find((s) => s.step === 'get_records_leave')?.ok;
  const lockOk = report.steps.find((s) => s.step === 'approve_lock_overlap')?.ok;
  report.verdict = openOk && recOk && lockOk ? 'PASS' : 'FAIL';
  report.finishedAt = new Date().toISOString();
  writeReport(report);
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.verdict === 'PASS' ? 0 : 1);
}

function writeReport(report) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(3);
});
