#!/usr/bin/env node
/**
 * P1-EX-QA-HTTPS-J-HRM-06-01-R3 — browser L2.5 + P-CC-07 on HTTPS pilot.
 */
import { chromium } from 'playwright';

const BASE = 'https://14-225-217-232.nip.io';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const EMP_ID = '00000000-0000-4000-8000-000000000021';

const out = {
  work_item_id: 'P1-EX-QA-HTTPS-J-HRM-06-01-R3',
  execution_time_utc: new Date().toISOString(),
  pageErrors: [],
  portalAuthErrors: [],
  checks: {},
};

function pass(id, ok, detail = {}) {
  out.checks[id] = { pass: ok, ...detail };
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail.note ? ' — ' + detail.note : ''}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  page.on('pageerror', (err) => {
    const msg = String(err?.message || err);
    out.pageErrors.push(msg);
    if (/portalAuthBridge|waitForPortalAccessToken/i.test(msg)) out.portalAuthErrors.push(msg);
  });

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 60000 });
  if (page.url().includes('/login')) {
    await page.fill('input[type="email"], input[name="email"]', EMAIL);
    await page.fill('input[type="password"], input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/command-center|dashboard/, { timeout: 30000 }).catch(() => {});
  }
  pass('login', /command-center|login/.test(page.url()) === false || page.url().includes('command-center'), { url: page.url() });

  // Hard refresh CC attendance
  await page.goto(`${BASE}/command-center/hrm/attendance?companyId=main&_cb=r3pw`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);

  const ccFallback = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.includes('54321') || u.includes('127.0.0.1')).length,
  );

  const ccFrame = page.frame({ url: /\/hr\/attendance/ });
  let ccIframe = { found: !!ccFrame };
  if (ccFrame) {
    const ccText = await ccFrame.locator('body').innerText().catch(() => '');
    ccIframe = {
      found: true,
      bodyLen: ccText.length,
      hasConnected: /CONNECTED/i.test(ccText),
      hasSyncError: /Sync ERROR/i.test(ccText),
      bodySample: ccText.slice(0, 500),
    };
  }

  const attApiCc = await page.evaluate(async () => {
    const token = localStorage.getItem('xevn.portal.accessToken') || '';
    const portalToken = sessionStorage.getItem('xevn.portal.portalAccessToken') || token;
    const r = await fetch('/api/hrm/attendance/records?company_id=main&page=1&page_size=5', {
      headers: {
        Accept: 'application/json',
        'x-access-token': token,
        'x-portal-access-token': portalToken,
        'x-company-id': 'main',
        'x-tenant-id': 'xevn',
      },
    });
    const b = await r.json().catch(() => ({}));
    return { status: r.status, code: b?.code, total: b?.data?.total ?? b?.data?.pagination?.total };
  });

  pass('P-CC-07-fallback54321-cc', ccFallback === 0, { count: ccFallback });
  pass('P-CC-07-attendance-api-cc', attApiCc.status === 200 && attApiCc.code === 'HRM-ATT-200', attApiCc);
  pass('P-CC-07-sync-connected-cc', ccIframe.hasConnected === true, ccIframe);

  // Direct embed attendance
  await page.goto(`${BASE}/hr/attendance?portal=1&tenantId=xevn&companyId=main&_cb=r3pw`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(8000);

  const directText = await page.locator('body').innerText().catch(() => '');
  const directFallback = await page.evaluate(() =>
    performance.getEntriesByType('resource').map((e) => e.name).filter((u) => u.includes('54321') || u.includes('127.0.0.1')).length,
  );

  const srcProbe = await page.evaluate(async () => {
    const r = await fetch('/hr/src/lib/portalAuthBridge.ts?pw=' + Date.now());
    const t = await r.text();
    return { status: r.status, len: t.length, hasWait: t.includes('waitForPortalAccessToken') };
  });

  pass('portalAuthBridge-export', srcProbe.hasWait === true, srcProbe);
  pass('portalAuthBridge-PAGEERROR', out.portalAuthErrors.length === 0, { errors: out.portalAuthErrors });
  pass('P-CC-07-fallback54321-direct', directFallback === 0, { count: directFallback });
  pass('P-CC-07-sync-connected-direct', /CONNECTED/i.test(directText), {
    bodyLen: directText.length,
    sample: directText.slice(0, 400),
  });

  // J-HRM-06 deep link profile
  await page.goto(`${BASE}/hr/employees/${EMP_ID}?portal=1&companyId=main&_cb=r3pw`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.waitForTimeout(6000);
  const profileText = await page.locator('body').innerText().catch(() => '');
  const empApi = await page.evaluate(async (id) => {
    const token = localStorage.getItem('xevn.portal.accessToken') || '';
    const portalToken = sessionStorage.getItem('xevn.portal.portalAccessToken') || token;
    const r = await fetch(`/api/hrm/employees/${id}?company_id=main`, {
      headers: {
        Accept: 'application/json',
        'x-access-token': token,
        'x-portal-access-token': portalToken,
        'x-company-id': 'main',
        'x-tenant-id': 'xevn',
      },
    });
    const b = await r.json().catch(() => ({}));
    return { status: r.status, code: b?.code, name: b?.data?.full_name || b?.data?.fullName };
  }, EMP_ID);

  const profileFail = profileText.includes('Không tìm thấy nhân viên');
  const profilePass = !profileFail && /Nguyen NhanSu0021|NhanSu0021|0021/i.test(profileText);
  pass('J-HRM-06-deep-link-api', empApi.status === 200 && empApi.code === 'HRM-EMP-200', empApi);
  pass('J-HRM-06-deep-link-ui', profilePass, {
    hasNotFound: profileFail,
    bodySample: profileText.slice(0, 600),
  });

  // CC iframe deep link
  await page.goto(`${BASE}/command-center/hrm/attendance?companyId=main&_cb=r3pw2`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await page.waitForTimeout(5000);
  const frame = page.frame({ url: /\/hr\// }) || page.frame({ url: /\/hr\/attendance/ });
  if (frame) {
    await frame.goto(`${BASE}/hr/employees/${EMP_ID}?portal=1&companyId=main&_cb=r3pw`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
    await page.waitForTimeout(5000);
    const iframeProfile = await frame.locator('body').innerText().catch(() => '');
    const iframeFail = iframeProfile.includes('Không tìm thấy nhân viên');
    const iframePass = !iframeFail && /Nguyen NhanSu0021|NhanSu0021|0021/i.test(iframeProfile);
    pass('J-HRM-06-cc-iframe-profile', iframePass, {
      hasNotFound: iframeFail,
      bodySample: iframeProfile.slice(0, 600),
    });
  } else {
    pass('J-HRM-06-cc-iframe-profile', false, { note: 'iframe not found' });
  }

  const failed = Object.entries(out.checks).filter(([, v]) => !v.pass);
  out.verdict = failed.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  out.failedChecks = failed.map(([k]) => k);

  console.log('\n=== VERDICT:', out.verdict, '===');
  console.log(JSON.stringify(out, null, 2));

  await browser.close();
  process.exit(out.verdict === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
