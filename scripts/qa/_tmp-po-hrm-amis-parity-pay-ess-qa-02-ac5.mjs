#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-ESS-QA-02 — AC5 CEO hardened retest only
 * Wait for ess-payslips-panel after tab click (prior shot raced on Tính lương).
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const CEO_EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const CEO_PASS = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-ess-qa-02-ac5-retest.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-amis-parity-pay-ess-qa-02');
mkdirSync(SCREEN, { recursive: true });

function decodeJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  } catch {
    return {};
  }
}

async function portalLoginCeo() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: CEO_EMAIL, password: CEO_PASS }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token;
      if (!token) continue;
      const u = data?.user ?? {};
      return {
        token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: 'main',
        employeeId: null,
        user: {
          userId: u.userId || u.id || CEO_EMAIL,
          email: u.email || CEO_EMAIL,
          displayName: u.displayName || u.fullName || u.name || CEO_EMAIL,
          roles: u.roles || ['group_ceo'],
        },
        raw: data,
        claims: decodeJwt(token),
      };
    } catch {
      /* */
    }
  }
  throw new Error('CEO portal login failed');
}

const session = await portalLoginCeo();
const net = [];
const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

page.on('response', async (res) => {
  try {
    const u = res.url();
    if (!/\/api\/hrm\/payroll\/me\/payslips/i.test(u)) return;
    let json = null;
    const ct = res.headers()['content-type'] || '';
    if (/json/i.test(ct)) json = await res.json().catch(() => null);
    net.push({
      method: res.request().method(),
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 520),
      code: json?.code || null,
      message: json?.message ? String(json.message).slice(0, 240) : null,
    });
  } catch {
    /* */
  }
});

await page.addInitScript((s) => {
  const payload = JSON.stringify(s.user);
  const memberships = JSON.stringify([
    { company_id: s.companyId, employee_id: s.employeeId || null },
  ]);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', payload);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', s.companyId);
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', s.companyId);
    store.setItem('hrm_current_tenant_id', 'xevn');
    store.setItem('access_token', s.token);
    store.setItem('token', s.token);
    store.setItem('hrm.mobile.memberships', memberships);
  }
}, session);

const gotoUrl = `${PORTAL}/hr/payroll?portal=1&tenantId=xevn&companyId=main&_=${Date.now()}`;
await page.goto(gotoUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.getByTestId('hdsd-pay-ess-tab').waitFor({ state: 'visible', timeout: 60_000 });
await page.getByTestId('hdsd-pay-ess-tab').click();
await page.waitForTimeout(4000);
await page.screenshot({ path: join(SCREEN, '06b-ceo-ess-tab-hardened.png'), fullPage: false });

const panelVisible = await page
  .getByTestId('ess-payslips-panel-precision')
  .isVisible()
  .catch(() => false);
const loadingVisible = await page.getByTestId('ess-payslips-loading').isVisible().catch(() => false);
const bodyText = await page.locator('main, [role="main"], body').first().innerText().catch(() => '');

const listGet = [...net]
  .reverse()
  .find((n) => n.method === 'GET' && /\/me\/payslips(\?|$)/.test(n.url));
const banner403 = await page.getByTestId('ess-payslips-403-hint').isVisible().catch(() => false);
const hintText = await page.getByTestId('ess-payslips-403-hint').innerText().catch(() => '');
const rowCount = await page.locator('[data-testid^="ess-payslip-row-"]').count();
const panelText = await page.getByTestId('ess-payslips-panel-precision').innerText().catch(() => '');
const honestCopy = /403|nhân viên|employee|hồ sơ|từ chối|không thể tải|Phiếu lương/i.test(
  `${panelText}\n${hintText}\n${bodyText}`,
);

const out = {
  stamp: `PAYESSQA2-AC5R-${Date.now().toString(36).toUpperCase().slice(-5)}`,
  jwtCompanyId: session.claims.companyId || session.claims.company_id || null,
  jwtEmployeeId: session.claims.employee_id || null,
  listGet,
  banner403,
  hintText,
  rowCount,
  panelVisible,
  loadingVisible,
  panelSnippet: panelText.replace(/\s+/g, ' ').slice(0, 480),
  bodySnippet: bodyText.replace(/\s+/g, ' ').slice(0, 480),
  honestCopy,
  net,
};

const ac5Pass =
  Boolean(listGet) &&
  listGet.status === 403 &&
  /HRM-PAY-403-ESS/i.test(String(listGet.code || '')) &&
  rowCount === 0 &&
  (banner403 || honestCopy);

out.ac5 = ac5Pass ? 'PASS' : 'FAIL';
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
process.exit(ac5Pass ? 0 : 2);
