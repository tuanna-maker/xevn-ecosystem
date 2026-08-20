/**
 * PO-HRM-REC-PLAN-CONSOLE-FE-01 — capture Uncaught / Warning on recruitment plan path
 * U65 · zero-seed · mutates=0
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
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-rec-plan-console-fe-01.json');
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pageErrors = [];
const consoleErrors = [];
const consoleWarnings = [];
const allConsole = [];

function classify(text) {
  const t = String(text || '');
  return {
    getDialogPortalContainer: /getDialogPortalContainer is not defined/i.test(t),
    LayoutDashboard: /LayoutDashboard is not defined/i.test(t),
    dragHandle: /Unable to find (any )?drag handle/i.test(t),
    uniqueKey: /unique ["']?key["']? prop/i.test(t),
    validateDOMNesting: /validateDOMNesting/i.test(t),
    uncaught: /Uncaught|ReferenceError|TypeError/i.test(t),
  };
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('pageerror', (err) => {
    pageErrors.push({ message: err.message, stack: err.stack?.slice(0, 800) });
  });
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const entry = { type, text: text.slice(0, 500), class: classify(text) };
    allConsole.push(entry);
    if (type === 'error') consoleErrors.push(entry);
    if (type === 'warning') consoleWarnings.push(entry);
  });

  const result = {
    work_item_id: 'PO-HRM-REC-PLAN-CONSOLE-FE-01',
    startedAt: new Date().toISOString(),
    portal: PORTAL,
    account: EMAIL,
    phases: {},
  };

  try {
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('[data-testid="portal-login-email"]').fill(EMAIL);
    await page.locator('[data-testid="portal-login-password"]').fill(PASSWORD);
    const loginWait = page.waitForResponse(
      (r) => r.url().includes('/auth/login') && r.request().method() === 'POST',
      { timeout: 20000 },
    );
    await page.locator('[data-testid="portal-login-submit"]').click();
    await loginWait;
    await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 25000 }).catch(() => null);
    await sleep(1200);

    // Reset collectors after login noise
    pageErrors.length = 0;
    consoleErrors.length = 0;
    consoleWarnings.length = 0;
    allConsole.length = 0;

    const recUrl = `${PORTAL}/command-center/hrm/recruitment?tab=plans&companyId=main&tenantId=xevn&_qa=${Date.now()}`;
    await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(5000);

    // Click plans tab in iframe if needed
    const plansRe = /Kế\s*hoạch|Ke\s*hoach|Plans|tuyển dụng/i;
    for (const host of [page, ...page.frames()]) {
      const loc = host.locator('button, [role="tab"], a').filter({ hasText: /Kế\s*hoạch|Plans/i }).first();
      if (await loc.isVisible().catch(() => false)) {
        await loc.click({ force: true });
        await sleep(2000);
        break;
      }
    }

    // Open first plan row if present
    let openedDetail = false;
    for (const host of [page, ...page.frames()]) {
      const row = host.locator('table tbody tr').first();
      if (await row.isVisible().catch(() => false)) {
        await row.click({ force: true });
        await sleep(2500);
        openedDetail = true;
        break;
      }
    }

    // Also try eye button
    if (!openedDetail) {
      for (const host of [page, ...page.frames()]) {
        const eye = host.locator('table tbody tr button').first();
        if (await eye.isVisible().catch(() => false)) {
          await eye.click({ force: true });
          await sleep(2500);
          openedDetail = true;
          break;
        }
      }
    }

    const countClass = (pred) =>
      [...pageErrors.map((e) => e.message), ...consoleErrors.map((e) => e.text), ...consoleWarnings.map((e) => e.text)].filter(
        (t) => pred(t),
      ).length;

    result.phases.plan_surface = {
      openedDetail,
      pageErrors: pageErrors.length,
      consoleErrors: consoleErrors.length,
      consoleWarnings: consoleWarnings.length,
      classCounts: {
        getDialogPortalContainer: countClass((t) => /getDialogPortalContainer is not defined/i.test(t)),
        LayoutDashboard: countClass((t) => /LayoutDashboard is not defined/i.test(t)),
        dragHandle: countClass((t) => /Unable to find (any )?drag handle/i.test(t)),
        uniqueKey: countClass((t) => /unique ["']?key["']? prop/i.test(t)),
        validateDOMNesting: countClass((t) => /validateDOMNesting/i.test(t)),
        ReferenceError: countClass((t) => /ReferenceError/i.test(t)),
        TypeError: countClass((t) => /TypeError/i.test(t)),
      },
      pageErrorMessages: pageErrors.map((e) => e.message).slice(0, 30),
      consoleErrorSample: consoleErrors.map((e) => e.text).slice(0, 40),
      consoleWarningSample: consoleWarnings.map((e) => e.text).slice(0, 40),
    };

    result.endedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result.phases.plan_surface, null, 2));
  } catch (err) {
    result.fatal = String(err?.stack || err);
    writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.error(result.fatal);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
