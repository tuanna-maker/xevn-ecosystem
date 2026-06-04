#!/usr/bin/env node
/**
 * P1-EX-QA-HTTPS-RESIDUAL-03-R4 — browser + in-session API on pilot HTTPS.
 */
import { chromium } from 'playwright';

const BASE = 'https://14-225-217-232.nip.io';
const ATT_URL = `${BASE}/hr/attendance?portal=1&companyId=main&_qa_r4=${Date.now()}`;
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';

const out = {
  work_item_id: 'P1-EX-QA-HTTPS-RESIDUAL-03-R4',
  execution_time_utc: new Date().toISOString(),
  runtime_url: ATT_URL,
  fallback: { before: null, after: null },
  attendanceProbe: { before: null, after: null },
  authProbes: {},
};

function countFallback(page) {
  return page.evaluate(() => {
    const urls = performance
      .getEntriesByType('resource')
      .map((e) => e.name)
      .filter((u) => u.includes('127.0.0.1:54321') || u.includes('54321/rest/v1'));
    return {
      fallbackAllCount: urls.length,
      fallbackAttendanceCount: urls.filter((u) =>
        /attendance_|work_shifts|leave_requests|departments/.test(u),
      ).length,
      fallbackSample: urls.slice(0, 12),
    };
  });
}

async function attendanceProbe(page) {
  return page.evaluate(async () => {
    const token = localStorage.getItem('xevn.portal.accessToken') || '';
    const portalToken = sessionStorage.getItem('xevn.portal.portalAccessToken') || token;
    const r = await fetch('/api/hrm/attendance/records?company_id=main&page=1&page_size=5', {
      headers: {
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        'x-access-token': token,
        'x-portal-access-token': portalToken,
        'x-company-id': 'main',
        'x-tenant-id': 'xevn',
      },
    });
    const b = await r.json().catch(() => ({}));
    return { status: r.status, code: b?.code ?? b?.error?.code, message: b?.message?.slice?.(0, 80) };
  });
}

async function listProbe(page, id, path) {
  const r = await page.evaluate(async (p) => {
    const token = localStorage.getItem('xevn.portal.accessToken') || '';
    const portalToken = sessionStorage.getItem('xevn.portal.portalAccessToken') || token;
    const res = await fetch(p, {
      headers: {
        Accept: 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        'x-access-token': token,
        'x-portal-access-token': portalToken,
        'x-company-id': 'main',
        'x-tenant-id': 'xevn',
      },
    });
    const b = await res.json().catch(() => ({}));
    return { status: res.status, code: b?.code ?? b?.error?.code };
  }, path);
  out.authProbes[id] = r;
  const ok = r.status === 200 && r.code !== 'HRM-AUTH-001';
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  HTTP ${r.status}  ${r.code ?? ''}`);
  return ok;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ ignoreHTTPSErrors: true });

  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  if (page.url().includes('/login')) {
    await page.fill('input[type="email"], input[name="email"]', EMAIL);
    await page.fill('input[type="password"], input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/command-center|dashboard|hr\//, { timeout: 45000 }).catch(() => {});
  }
  const tokenLen = await page.evaluate(
    () => (localStorage.getItem('xevn.portal.accessToken') || '').length,
  );
  console.log(`login  url=${page.url()}  tokenLen=${tokenLen}`);

  await page.goto(ATT_URL, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(6000);

  out.fallback.before = await countFallback(page);
  out.attendanceProbe.before = await attendanceProbe(page);
  const bodyBefore = await page.locator('body').innerText().catch(() => '');
  out.syncBannerBefore = {
    connected: /CONNECTED|Đã kết nối HRM API/i.test(bodyBefore),
    syncError: /Sync ERROR/i.test(bodyBefore),
  };

  console.log(
    `fallback BEFORE  all=${out.fallback.before.fallbackAllCount}  att=${out.fallback.before.fallbackAttendanceCount}`,
  );
  console.log(
    `attendance probe BEFORE  HTTP ${out.attendanceProbe.before.status}  ${out.attendanceProbe.before.code}`,
  );

  const retryBtn = page.getByRole('button', { name: /Kiểm tra lại/i });
  if (await retryBtn.count()) {
    await retryBtn.first().click();
    await page.waitForTimeout(5000);
  } else {
    console.log('WARN  no Kiểm tra lại button');
  }

  out.fallback.after = await countFallback(page);
  out.attendanceProbe.after = await attendanceProbe(page);
  const bodyAfter = await page.locator('body').innerText().catch(() => '');
  out.syncBannerAfter = {
    connected: /CONNECTED|Đã kết nối HRM API/i.test(bodyAfter),
    syncError: /Sync ERROR/i.test(bodyAfter),
  };

  console.log(
    `fallback AFTER  all=${out.fallback.after.fallbackAllCount}  att=${out.fallback.after.fallbackAttendanceCount}`,
  );
  console.log(
    `attendance probe AFTER  HTTP ${out.attendanceProbe.after.status}  ${out.attendanceProbe.after.code}`,
  );

  const q = 'company_id=main&page_size=5';
  const authOk =
    (await listProbe(page, 'CON-LIST', `/api/hrm/contracts-insurance/contracts?${q}`)) &&
    (await listProbe(page, 'INS-LIST', `/api/hrm/contracts-insurance/insurance?${q}`)) &&
    (await listProbe(page, 'REC-LIST', `/api/hrm/recruitment/requisitions?${q}`)) &&
    (await listProbe(page, 'ATT-RECORDS', `/api/hrm/attendance/records?${q}`)) &&
    (await listProbe(page, 'PAY-LIST', `/api/hrm/payroll/payslips?${q}`));

  const fallbackPass =
    out.fallback.before.fallbackAllCount === 0 &&
    out.fallback.after.fallbackAllCount === 0;
  const attPass =
    out.attendanceProbe.before.status === 200 &&
    out.attendanceProbe.after.status === 200 &&
    out.attendanceProbe.before.code === 'HRM-ATT-200' &&
    out.attendanceProbe.after.code === 'HRM-ATT-200';

  out.gates = {
    fallbackZero: fallbackPass,
    attendanceRecords: attPass,
    authFiveLists: authOk,
  };
  out.verdict =
    fallbackPass && attPass && authOk ? 'PASS_TO_PM' : 'FAIL_TO_PM';

  console.log('\n=== GATES ===');
  console.log(JSON.stringify(out.gates, null, 2));
  console.log('=== VERDICT:', out.verdict, '===');
  console.log(JSON.stringify(out, null, 2));

  await browser.close();
  process.exit(out.verdict === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
