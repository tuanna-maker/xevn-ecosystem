/**
 * PO-HRM-REC-INTERVIEW-SELECT-QA-01 — U65 browser retest InterviewsTab rating Select
 * C-CONSOLE-CRASH: Select.Item empty string · mutates=0 · no seed
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
const EVIDENCE = resolve(ROOT, 'docs/qa/evidence');
const OUT = resolve(EVIDENCE, '_tmp-po-hrm-rec-interview-select-qa-01.json');
const SHOT_DIR = resolve(EVIDENCE, 'po-hrm-rec-interview-select-qa-01');
mkdirSync(EVIDENCE, { recursive: true });
mkdirSync(SHOT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const pageErrors = [];
const consoleErrors = [];
const consoleWarnings = [];
const allConsole = [];

function classify(text) {
  const t = String(text || '');
  return {
    selectItemEmpty: /Select\.Item .* value prop that is not an empty string/i.test(t),
    getDialogPortalContainer: /getDialogPortalContainer is not defined/i.test(t),
    LayoutDashboard: /LayoutDashboard is not defined/i.test(t),
    dragHandle: /Unable to find (any )?drag handle|Invariant failed: Draggable/i.test(t),
    uniqueKey: /unique ["']?key["']? prop/i.test(t),
    ReferenceError: /ReferenceError/i.test(t),
    TypeError: /TypeError/i.test(t),
    Uncaught: /Uncaught/i.test(t),
  };
}

function countClass(pred) {
  return [
    ...pageErrors.map((e) => e.message),
    ...consoleErrors.map((e) => e.text),
    ...consoleWarnings.map((e) => e.text),
  ].filter((t) => pred(t)).length;
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
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('pageerror', (err) => {
    pageErrors.push({ message: err.message, stack: err.stack?.slice(0, 800) });
  });
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const entry = { type, text: text.slice(0, 600), class: classify(text) };
    allConsole.push(entry);
    if (type === 'error') consoleErrors.push(entry);
    if (type === 'warning') consoleWarnings.push(entry);
  });

  const result = {
    work_item_id: 'PO-HRM-REC-INTERVIEW-SELECT-QA-01',
    startedAt: new Date().toISOString(),
    portal: PORTAL,
    account: EMAIL,
    u65: true,
    mutates: 0,
    clickPath: [],
    phases: {},
    claims_denied: ['recruitment_uat_ready', 'one-active-interview-BR'],
  };

  try {
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    result.clickPath.push('goto /login');
    await page.locator('[data-testid="portal-login-email"]').fill(EMAIL);
    await page.locator('[data-testid="portal-login-password"]').fill(PASSWORD);
    const loginWait = page.waitForResponse(
      (r) => r.url().includes('/auth/login') && r.request().method() === 'POST',
      { timeout: 20000 },
    );
    await page.locator('[data-testid="portal-login-submit"]').click();
    await loginWait;
    result.clickPath.push('login ceo@xe.vn submit');
    await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 25000 }).catch(() => null);
    await sleep(1200);

    // Reset console after login noise
    pageErrors.length = 0;
    consoleErrors.length = 0;
    consoleWarnings.length = 0;
    allConsole.length = 0;

    const recUrl = `${PORTAL}/command-center/hrm/recruitment?tab=interviews&companyId=main&tenantId=xevn&_qa=${Date.now()}`;
    await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    result.clickPath.push(recUrl.replace(/&_qa=\d+/, '&_qa=…'));
    await sleep(4500);

    // Portal iframe often strips ?tab= — click nav testid (not pipeline "Phỏng vấn" KPI)
    const navHit = await findHostWith(page, (h) =>
      h.locator('[data-testid="recruitment-nav-interviews"]'),
    );
    if (navHit) {
      await navHit.loc.click({ force: true });
      result.clickPath.push('click [data-testid=recruitment-nav-interviews]');
      await sleep(1200);
      // Prefer submenu Lịch phỏng vấn if dropdown opened
      const sched = await findHostWith(page, (h) =>
        h.locator('[role="menuitem"]').filter({ hasText: /Lịch phỏng vấn|Scheduled/i }),
      );
      if (sched) {
        await sched.loc.click({ force: true });
        result.clickPath.push('click menu Lịch phỏng vấn');
        await sleep(2500);
      } else {
        await sleep(2000);
      }
    } else {
      result.clickPath.push('WARN: recruitment-nav-interviews not found');
    }

    // Wait for InterviewsTab mount
    let precision = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      precision = await findHostWith(page, (h) =>
        h.locator('[data-testid="rec-interviews-tab-precision"]'),
      );
      if (precision) break;
      await sleep(800);
    }

    await page.screenshot({ path: resolve(SHOT_DIR, '01-interviews-list.png'), fullPage: false });

    result.phases.list = {
      tabPrecisionVisible: Boolean(precision),
      finalUrl: page.url(),
    };

    // Open row actions → Cập nhật
    let openedUpdate = false;
    let rowSnippet = null;
    for (const host of [page, ...page.frames()]) {
      const rows = host.locator('table tbody tr');
      const n = await rows.count().catch(() => 0);
      if (n < 1) continue;
      rowSnippet = (await rows.first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 160);
      const moreBtn = rows.first().locator('button').last();
      if (!(await moreBtn.isVisible().catch(() => false))) continue;
      await moreBtn.click({ force: true });
      result.clickPath.push(`open row menu: ${rowSnippet || 'first-row'}`);
      await sleep(600);
      const updateItem = host
        .locator('[role="menuitem"]')
        .filter({ hasText: /Cập nhật|Update/i })
        .first();
      if (await updateItem.isVisible().catch(() => false)) {
        await updateItem.click({ force: true });
        result.clickPath.push('click menu Cập nhật');
        await sleep(1500);
        openedUpdate = true;
        break;
      }
    }

    // Fallback: detail → update button
    if (!openedUpdate) {
      for (const host of [page, ...page.frames()]) {
        const row = host.locator('table tbody tr').first();
        if (!(await row.isVisible().catch(() => false))) continue;
        await row.click({ force: true });
        result.clickPath.push('click first interview row (detail fallback)');
        await sleep(1200);
        const upd = host.locator('button').filter({ hasText: /Cập nhật|Update/i }).first();
        if (await upd.isVisible().catch(() => false)) {
          await upd.click({ force: true });
          result.clickPath.push('click Update from detail');
          await sleep(1500);
          openedUpdate = true;
          break;
        }
      }
    }

    await page.screenshot({ path: resolve(SHOT_DIR, '02-update-dialog.png'), fullPage: false });

    let ratingOpened = false;
    let selectedNoRating = false;
    let selectedStar = false;
    let ratingTriggerText = null;
    let optionTexts = [];

    // Open rating Select (label Đánh giá)
    for (const host of [page, ...page.frames()]) {
      const dialog = host.locator('[role="dialog"]').filter({ hasText: /Cập nhật phỏng vấn|Update interview|Đánh giá/i });
      if (!(await dialog.first().isVisible().catch(() => false))) continue;

      // Prefer combobox near rating label
      let trigger = dialog
        .locator('label')
        .filter({ hasText: /Đánh giá|Rating/i })
        .locator('..')
        .locator('[role="combobox"]')
        .first();
      if (!(await trigger.isVisible().catch(() => false))) {
        // second combobox in form is typically rating (status is first)
        const combos = dialog.locator('[role="combobox"]');
        const c = await combos.count();
        if (c >= 2) trigger = combos.nth(1);
        else if (c === 1) trigger = combos.first();
      }
      if (!(await trigger.isVisible().catch(() => false))) continue;

      ratingTriggerText = (await trigger.innerText().catch(() => '')).slice(0, 80);
      await trigger.click({ force: true });
      result.clickPath.push(`open rating Select (trigger="${ratingTriggerText}")`);
      await sleep(800);
      ratingOpened = true;

      const listbox = host.locator('[role="listbox"]');
      await listbox.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
      const opts = host.locator('[role="option"]');
      const oc = await opts.count().catch(() => 0);
      for (let i = 0; i < Math.min(oc, 8); i++) {
        optionTexts.push((await opts.nth(i).innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 40));
      }

      const noneOpt = host
        .locator('[role="option"]')
        .filter({ hasText: /Chưa đánh giá|Not rated|no rating/i })
        .first();
      if (await noneOpt.isVisible().catch(() => false)) {
        await noneOpt.click({ force: true });
        result.clickPath.push('select «Chưa đánh giá» / no rating');
        selectedNoRating = true;
        await sleep(700);
      }

      // Re-open and pick a star value (1–5)
      if (await trigger.isVisible().catch(() => false)) {
        await trigger.click({ force: true });
        await sleep(600);
        const starOpt = host.locator('[role="option"]').filter({ hasText: /★|⭐|sao|\b[1-5]\b/i }).nth(1);
        // Prefer explicit value via data-radix / text with star unicode from SelectItem
        const starCandidates = host.locator('[role="option"]');
        const sc = await starCandidates.count();
        let clickedStar = false;
        for (let i = 0; i < sc; i++) {
          const txt = (await starCandidates.nth(i).innerText().catch(() => '')).trim();
          if (/Chưa|Not rated/i.test(txt)) continue;
          // star items render filled Star icons; pick first non-none
          await starCandidates.nth(i).click({ force: true });
          result.clickPath.push(`select star option #${i}: ${txt.slice(0, 40) || '(icon-only)'}`);
          selectedStar = true;
          clickedStar = true;
          await sleep(700);
          break;
        }
        if (!clickedStar && (await starOpt.isVisible().catch(() => false))) {
          await starOpt.click({ force: true });
          selectedStar = true;
          result.clickPath.push('select star option (fallback regex)');
          await sleep(700);
        }
      }
      break;
    }

    await page.screenshot({ path: resolve(SHOT_DIR, '03-after-rating-select.png'), fullPage: false });

    // Cancel dialog — no mutate
    for (const host of [page, ...page.frames()]) {
      const cancel = host
        .locator('[role="dialog"] button')
        .filter({ hasText: /Hủy|Cancel/i })
        .first();
      if (await cancel.isVisible().catch(() => false)) {
        await cancel.click({ force: true });
        result.clickPath.push('click Hủy (mutates=0)');
        await sleep(500);
        break;
      }
    }

    const selectItemEmpty =
      countClass((t) => /Select\.Item .* value prop that is not an empty string/i.test(t)) +
      pageErrors.filter((e) => /Select\.Item .* empty string/i.test(e.message)).length;

    const classCounts = {
      selectItemEmpty,
      getDialogPortalContainer: countClass((t) => /getDialogPortalContainer is not defined/i.test(t)),
      LayoutDashboard: countClass((t) => /LayoutDashboard is not defined/i.test(t)),
      dragHandle: countClass((t) => /Unable to find (any )?drag handle|Invariant failed: Draggable/i.test(t)),
      uniqueKey: countClass((t) => /unique ["']?key["']? prop/i.test(t)),
      ReferenceError: countClass((t) => /ReferenceError/i.test(t)),
      TypeError: countClass((t) => /TypeError/i.test(t)),
      Uncaught: countClass((t) => /Uncaught/i.test(t)) + pageErrors.length,
    };

    const pass =
      openedUpdate &&
      ratingOpened &&
      selectedNoRating &&
      selectedStar &&
      pageErrors.length === 0 &&
      selectItemEmpty === 0 &&
      classCounts.ReferenceError === 0 &&
      classCounts.TypeError === 0 &&
      classCounts.Uncaught === 0;

    result.phases.interview_select = {
      openedUpdate,
      rowSnippet,
      ratingOpened,
      ratingTriggerText,
      optionTexts,
      selectedNoRating,
      selectedStar,
      finalUrl: page.url(),
      pageErrors: pageErrors.length,
      consoleErrors: consoleErrors.length,
      consoleWarnings: consoleWarnings.length,
      classCounts,
      pageErrorMessages: pageErrors.map((e) => e.message).slice(0, 30),
      consoleErrorSample: consoleErrors.map((e) => e.text).slice(0, 40),
      selectItemEmptySample: [
        ...pageErrors.map((e) => e.message),
        ...consoleErrors.map((e) => e.text),
      ]
        .filter((t) => /Select\.Item|empty string/i.test(t))
        .slice(0, 10),
      screenshots: [
        'docs/qa/evidence/po-hrm-rec-interview-select-qa-01/01-interviews-list.png',
        'docs/qa/evidence/po-hrm-rec-interview-select-qa-01/02-update-dialog.png',
        'docs/qa/evidence/po-hrm-rec-interview-select-qa-01/03-after-rating-select.png',
      ],
      verdict: pass ? 'PASS' : 'FAIL',
    };

    result.endedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log(
      JSON.stringify(
        {
          clickPath: result.clickPath,
          ...result.phases.interview_select,
          mutates: result.mutates,
        },
        null,
        2,
      ),
    );
    if (!pass) process.exitCode = 2;
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
