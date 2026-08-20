#!/usr/bin/env node
/**
 * PO-HRM-REC-IV-ONE-ACTIVE-QA-01-R2 — U65 browser slice (no seed)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-rec-iv-one-active-qa-01-r2.json');
const SHOT = resolve(ROOT, 'docs/qa/evidence/po-hrm-rec-iv-one-active-qa-01');
mkdirSync(SHOT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return token;
}

async function findHostWith(page, locatorFn) {
  for (const host of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(host);
      if (await loc.first().isVisible({ timeout: 800 }).catch(() => false)) {
        return { host, loc: loc.first() };
      }
    } catch {
      /* continue */
    }
  }
  return null;
}

async function main() {
  const token = await loginApi();
  const result = {
    work_item_id: 'PO-HRM-REC-IV-ONE-ACTIVE-QA-01-R2',
    u65: 'zero-seed',
    recruitment_uat_ready: false,
    clickPath: [],
    network: [],
    browser: {},
    ac: {},
    overall: null,
  };

  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', async (resp) => {
    const url = resp.url();
    if (
      url.includes('/api/hrm/recruitment/interviews') ||
      url.includes('/api/hrm/recruitment/candidates-pool')
    ) {
      let body = null;
      try {
        body = await resp.json();
      } catch {
        body = null;
      }
      result.network.push({
        method: resp.request().method(),
        url: url.replace(PORTAL, '').slice(0, 120),
        status: resp.status(),
        code: body?.code ?? body?.error?.code ?? null,
      });
    }
  });

  try {
    await page.addInitScript(
      (s) => {
        const payload = JSON.stringify({
          userId: s.email,
          email: s.email,
          displayName: 'Group CEO',
          roles: ['group_ceo'],
        });
        for (const store of [localStorage, sessionStorage]) {
          store.setItem('xevn.portal.accessToken', s.token);
          store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
          store.setItem('xevn.portal.user', payload);
          store.setItem('xevn.portal.tenantId', 'xevn');
          store.setItem('xevn.portal.companyId', s.companyId);
          store.setItem('hrm_portal_mode', '1');
          store.setItem('hrm_current_company_id', s.companyId);
        }
      },
      { token, email: EMAIL, companyId: COMPANY },
    );

    const recUrl = `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`;
    await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    result.clickPath.push(`goto ${recUrl}`);
    await sleep(4000);

    const candNav = await findHostWith(page, (h) =>
      h.getByRole('button', { name: /ứng viên/i }).or(h.locator('[data-testid="recruitment-nav-candidates"]')),
    );
    if (candNav) {
      await candNav.loc.click({ force: true });
      result.clickPath.push('click ứng viên nav');
      await sleep(2500);
    }

    const allCand = await findHostWith(page, (h) => h.getByText(/tất cả ứng viên/i));
    if (allCand) {
      await allCand.loc.click({ force: true });
      result.clickPath.push('click Tất cả ứng viên');
      await sleep(2000);
    }

    await page.screenshot({ path: join(SHOT, '02-candidates-table-r2.png'), fullPage: false });

    const badgeHit = await findHostWith(page, (h) =>
      h.locator('[data-testid="candidate-active-interview-badge"]'),
    );
    result.browser.badgeBefore = {
      visible: Boolean(badgeHit),
      label: badgeHit ? (await badgeHit.loc.innerText().catch(() => '')).trim() : null,
    };
    if (badgeHit) {
      const timeHit = await findHostWith(page, (h) =>
        h.locator('[data-testid="candidate-active-interview-time"]'),
      );
      result.browser.badgeBefore.time = timeHit
        ? (await timeHit.loc.innerText().catch(() => '')).trim()
        : null;
    }

    async function openScheduleForFirstRow() {
      const scheduleInRow = await findHostWith(page, (h) =>
        h
          .locator('table tbody tr')
          .first()
          .locator('button')
          .filter({ has: h.locator('.lucide-calendar-clock') }),
      );
      if (scheduleInRow) {
        await scheduleInRow.loc.click({ force: true });
        return true;
      }
      return false;
    }

    async function submitScheduleForm(tag) {
      const dialog = await findHostWith(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
      if (!dialog) return false;
      const dateBtn = await findHostWith(page, (h) =>
        h.locator('[data-testid="schedule-interview-dialog"] button').filter({ hasText: /chọn ngày/i }),
      );
      if (dateBtn) {
        await dateBtn.loc.click({ force: true });
        await sleep(800);
        const dayBtn = await findHostWith(page, (h) =>
          h.locator('[role="gridcell"] button:not([disabled])').last(),
        );
        if (!dayBtn) {
          const dayBtn2 = await findHostWith(page, (h) =>
            h.locator('button.rdp-day:not([disabled])').last(),
          );
          if (dayBtn2) {
            await dayBtn2.loc.click({ force: true });
            result.clickPath.push(`${tag}: pick date (rdp-day)`);
          }
        } else {
          await dayBtn.loc.click({ force: true });
          result.clickPath.push(`${tag}: pick date (gridcell)`);
        }
        await sleep(500);
      }
      const submit = await findHostWith(page, (h) =>
        h.locator('[data-testid="schedule-interview-dialog"]').getByRole('button', { name: /^lên lịch phỏng vấn$/i }),
      );
      if (submit) {
        await submit.loc.click({ force: true });
        result.clickPath.push(`${tag}: submit schedule form`);
        await sleep(3000);
        return true;
      }
      return false;
    }

    const opened = await openScheduleForFirstRow();
    result.clickPath.push(opened ? 'open schedule dialog row[0] action[1]' : 'schedule button NOT found');
    await sleep(1500);

    const dialog = await findHostWith(page, (h) => h.locator('[data-testid="schedule-interview-dialog"]'));
    result.browser.scheduleDialogOpen = Boolean(dialog);
    if (dialog) {
      await page.screenshot({ path: join(SHOT, '03-schedule-dialog-r2.png'), fullPage: false });
      await submitScheduleForm('first');
    } else {
      result.browser.note = 'schedule dialog did not open';
    }

    await page.screenshot({ path: join(SHOT, '04-after-first-schedule-r2.png'), fullPage: false });

    const badgeAfter1 = await findHostWith(page, (h) =>
      h.locator('[data-testid="candidate-active-interview-badge"]'),
    );
    result.browser.badgeAfterFirstSchedule = Boolean(badgeAfter1);

    if (await openScheduleForFirstRow()) {
      result.clickPath.push('open schedule dialog again (duplicate probe)');
      await sleep(1500);
      await submitScheduleForm('duplicate');
    }

    const toastHit = await findHostWith(page, (h) =>
      h.locator('[role="status"], [data-sonner-toast], .destructive').filter({ hasText: /lịch|409|hiệu lực/i }),
    );
    result.browser.conflictToast = toastHit
      ? (await toastHit.loc.innerText().catch(() => '')).trim().slice(0, 200)
      : null;

    await page.screenshot({ path: join(SHOT, '05-after-duplicate-schedule-r2.png'), fullPage: false });

    await page.reload({ waitUntil: 'domcontentloaded' });
    result.clickPath.push('F5 reload');
    await sleep(4000);

    const badgeAfterF5 = await findHostWith(page, (h) =>
      h.locator('[data-testid="candidate-active-interview-badge"]'),
    );
    result.browser.f5BadgePersists = Boolean(badgeAfterF5);
    if (badgeAfterF5) {
      const timeF5 = await findHostWith(page, (h) =>
        h.locator('[data-testid="candidate-active-interview-time"]'),
      );
      result.browser.f5BadgeTime = timeF5
        ? (await timeF5.loc.innerText().catch(() => '')).trim()
        : null;
      result.browser.f5BadgeTimePattern = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(
        result.browser.f5BadgeTime || '',
      )
        ? 'vi-VN'
        : 'other';
    }

    await page.screenshot({ path: join(SHOT, '06-after-f5-r2.png'), fullPage: false });

    result.browser.pageErrors = pageErrors.length;
    result.browser.consoleErrors = consoleErrors.length;

    const postCreates = result.network.filter(
      (n) => n.method === 'POST' && n.url.includes('interviews'),
    );
    const dup409 = postCreates.some((n) => n.status === 409 && n.code === 'HRM-REC-IV-409-ACTIVE');
    const dup201 = postCreates.filter((n) => n.status === 201).length;

    result.ac = {
      'AC-fe-badge': result.browser.f5BadgePersists ? 'PASS' : 'FAIL',
      'AC-fe-datetime-vi': result.browser.f5BadgeTimePattern === 'vi-VN' ? 'PASS' : 'FAIL',
      'AC-409-conflict-ux': dup409 || /hiệu lực|409/i.test(result.browser.conflictToast || '') ? 'PASS' : 'FAIL',
      'AC-f5-persist': result.browser.f5BadgePersists ? 'PASS' : 'FAIL',
      'AC-no-console-crash': pageErrors.length === 0 ? 'PASS' : 'FAIL',
    };

    result.browser.postInterviewCreates = postCreates;
    result.browser.duplicateAllowed201Count = dup201;

    const allPass = Object.values(result.ac).every((v) => v === 'PASS');
    result.overall = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  } finally {
    await browser.close();
  }

  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (result.overall !== 'PASS_TO_PM') process.exitCode = 2;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
