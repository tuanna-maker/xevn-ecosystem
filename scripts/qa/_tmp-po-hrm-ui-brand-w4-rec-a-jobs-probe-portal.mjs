#!/usr/bin/env node
/** Dual-host probe: Jobs h2 «Tin tuyển dụng» computed styles (8080 + portal 5173). */
import { chromium } from 'playwright';

const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const login = await fetch('http://127.0.0.1:28002/api/xbos/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await login.json();
const data = j.data || j;
const token = data.accessToken || data.access_token;
const user = data.user || {};

const browser = await chromium.launch({ headless: true, executablePath: CHROME });

async function probe(base, portalMode, label) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(
    ({ token, user }) => {
      const u = JSON.stringify({
        userId: user.userId || user.id || 'ceo',
        email: 'ceo@xe.vn',
        displayName: user.displayName || 'CEO',
        roles: user.roles || ['group_ceo'],
      });
      for (const s of [localStorage, sessionStorage]) {
        s.setItem('xevn.portal.accessToken', token);
        s.setItem('access_token', token);
        s.setItem('token', token);
        s.setItem('xevn.portal.companyId', 'main');
        s.setItem('hrm_current_company_id', 'main');
        s.setItem('xevn.portal.tenantId', 'xevn');
        s.setItem('hrm_current_tenant_id', 'xevn');
        s.setItem('xevn.portal.user', u);
        s.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600e3));
      }
    },
    { token, user },
  );

  const url = new URL('/hr/recruitment', base);
  if (portalMode) url.searchParams.set('portal', '1');
  url.searchParams.set('tenantId', 'xevn');
  url.searchParams.set('companyId', 'main');
  url.searchParams.set('tab', 'jobs');
  url.searchParams.set('_qa', String(Date.now()));

  await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(2800);

  let ctx = page;
  for (const f of page.frames()) {
    const n = await f.locator('[data-testid="rec-jobs-tab-precision"]').count().catch(() => 0);
    if (n > 0) {
      ctx = f;
      break;
    }
  }

  const info = await ctx.evaluate(() => {
    const root = document.querySelector('[data-testid="rec-jobs-tab-precision"]');
    const h2 =
      root?.querySelector('h2') ||
      [...document.querySelectorAll('h2')].find((el) =>
        (el.textContent || '').includes('Tin tuyển dụng'),
      );
    if (!h2) {
      return { hasTestId: !!root, found: false, href: location.href };
    }
    const cs = getComputedStyle(h2);
    return {
      hasTestId: !!root,
      found: true,
      href: location.href,
      text: (h2.textContent || '').trim().slice(0, 60),
      fs: cs.fontSize,
      fw: cs.fontWeight,
      ff: cs.fontFamily.slice(0, 64),
      cls: (h2.className || '').toString().slice(0, 140),
      inRoot: !!(root && root.contains(h2)),
      ok: parseFloat(cs.fontSize) >= 20 && /Montserrat/i.test(cs.fontFamily),
    };
  });

  console.log(label, JSON.stringify(info));
  await page.close();
  return info;
}

const out = {};
try {
  out.portal5173 = await probe('http://127.0.0.1:5173', true, 'portal5173');
} catch (e) {
  out.portal5173 = { error: String(e.message || e).slice(0, 160) };
  console.log('portal5173 ERR', out.portal5173.error);
}
try {
  out.hrm8080 = await probe('http://127.0.0.1:8080', false, 'hrm8080');
} catch (e) {
  out.hrm8080 = { error: String(e.message || e).slice(0, 160) };
  console.log('hrm8080 ERR', out.hrm8080.error);
}

await browser.close();
const pass = [out.hrm8080, out.portal5173].some((r) => r && r.ok === true);
process.exit(pass ? 0 : 1);
