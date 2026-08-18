/**
 * D-UX-D5-ZOD-T-SCOPE-FIX-01 — payroll mount + tax settlement smoke (U65, no seed)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '_tmp-d-ux-d5-zod-t-scope-fix-01-runtime.json');
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: data?.user?.userId || EMAIL,
      email: EMAIL,
      displayName: 'CEO Tập đoàn',
      roles: ['group_ceo'],
    },
    raw: data,
  };
}

/** @param {import('playwright').Page | import('playwright').Frame} ctx */
async function openPayrollTax(ctx) {
  const calcTab = ctx.getByRole('button', { name: /^Tính lương$/i });
  if (await calcTab.count()) {
    await calcTab.first().click();
    await ctx.waitForTimeout?.(400);
    if (!ctx.waitForTimeout) await new Promise((r) => setTimeout(r, 400));
  }
  const menuItem = ctx.getByRole('menuitem', {
    name: /Bảng quyết toán thuế|Quyết toán thuế/i,
  });
  if (await menuItem.count()) {
    await menuItem.first().click();
    await new Promise((r) => setTimeout(r, 1000));
    return 'menuitem';
  }
  const via = await ctx.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]'),
    );
    const el = nodes.find((n) => /quyết toán thuế|tax settlement/i.test((n.textContent || '').trim()));
    if (!el) return null;
    el.click();
    return (el.textContent || '').trim().slice(0, 60);
  });
  await new Promise((r) => setTimeout(r, 1000));
  return via;
}

const result = {
  work_item_id: 'D-UX-D5-ZOD-T-SCOPE-FIX-01',
  startedAt: new Date().toISOString(),
  pageErrors: [],
  consoleErrors: [],
};

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
page.on('pageerror', (e) => result.pageErrors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') result.consoleErrors.push(m.text());
});

try {
  const sess = await loginApi();
  await page.addInitScript((s) => {
    localStorage.setItem('xbos_auth_session', JSON.stringify(s));
  }, sess);
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3500);
  await page.waitForFunction(
    () => (document.getElementById('root')?.innerHTML || '').length > 80,
    { timeout: 45000 },
  );
  // Wait until Payroll chrome visible (tab or greeting) — iframe or same doc
  await page
    .waitForFunction(
      () => /Tính lương|Thành phần lương|Xin chào/i.test(document.body?.innerText || ''),
      { timeout: 45000 },
    )
    .catch(() => null);

  const iframeEl = page.locator('iframe').first();
  const iframeCount = await page.locator('iframe').count();
  result.hasIframe = iframeCount > 0;

  /** @type {import('playwright').Page | import('playwright').Frame} */
  let ctx = page;
  if (iframeCount > 0) {
    const handle = await iframeEl.elementHandle();
    const frame = handle ? await handle.contentFrame() : null;
    if (frame) {
      await frame.waitForFunction(
        () => (document.getElementById('root')?.innerHTML || '').length > 80,
        { timeout: 45000 },
      ).catch(() => null);
      ctx = frame;
      result.payRoot = await frame.evaluate(
        () => (document.getElementById('root')?.innerHTML || '').length,
      );
    }
  }
  if (!result.payRoot) {
    result.payRoot = await page.evaluate(
      () => (document.getElementById('root')?.innerHTML || '').length,
    );
  }

  result.taxVia = await openPayrollTax(ctx);
  result.onTax = await ctx.evaluate(() =>
    /bảng quyết toán thuế|quyết toán thuế|tax settlement/i.test(
      (document.body?.innerText || '').slice(0, 8000),
    ),
  );
  result.hasRefErr = [...result.pageErrors, ...result.consoleErrors].some((e) =>
    /t is not defined|ReferenceError/i.test(e),
  );
  result.refErrSamples = [...result.pageErrors, ...result.consoleErrors]
    .filter((e) => /t is not defined|ReferenceError/i.test(e))
    .slice(0, 5);
  result.ok =
    result.payRoot > 80 &&
    !!result.onTax &&
    !result.hasRefErr &&
    result.pageErrors.filter((e) => /ReferenceError|t is not defined/i.test(e)).length === 0;
} catch (err) {
  result.error = String(err);
  result.ok = false;
} finally {
  result.finishedAt = new Date().toISOString();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

process.exit(result.ok ? 0 : 2);
