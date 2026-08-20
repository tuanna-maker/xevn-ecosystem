#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-PORT-LOGIN-QA — U65 browser login neo brand
 * zero-seed · type credentials (empty by design) · F5 session · no remaster DONE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-port-login-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-port-login-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W4-PORT-LOGIN-QA',
  fe_work_item: 'PO-HRM-UI-BRAND-W4-PORT-LOGIN',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  env: { PORTAL, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  checks: {},
  screenshots: [],
  consoleErrors: [],
  pageErrors: [],
  network: [],
  failReasons: [],
  mutates: 0,
  seed: false,
  remaster_program_done: false,
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

function fail(id, reason) {
  results.failReasons.push(`${id}: ${reason}`);
  results.checks[id] = { pass: false, reason };
}

function pass(id, detail) {
  results.checks[id] = { pass: true, ...detail };
}

async function probeL0() {
  for (const [k, url] of [
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', `${PORTAL}/login`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
}

function rgbToHex(rgb) {
  const m = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return String(rgb);
  return (
    '#' +
    [m[1], m[2], m[3]]
      .map((x) => Number(x).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

async function main() {
  await probeL0();
  if (results.l0.portal !== 200) {
    fail('L0_portal', `portal /login status=${results.l0.portal}`);
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  page.on('pageerror', (e) => results.pageErrors.push(String(e.message || e).slice(0, 200)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', (res) => {
    const u = res.url();
    if (u.includes('/auth/login') && res.request().method() === 'POST') {
      results.network.push({ url: u.replace(/https?:\/\/[^/]+/, ''), status: res.status(), method: 'POST' });
    }
  });

  try {
    // Clear any prior session
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 45000 });
    await sleep(400);

    const neo = await page.locator('[data-testid="portal-login-neo"]').count();
    const wordmark = await page.locator('[data-testid="portal-login-wordmark"]').innerText().catch(() => '');
    const mark = await page.locator('[data-testid="portal-login-mark"]').count();
    const visualBg = await page.locator('.xevn-login-visual').evaluate((el) => getComputedStyle(el).backgroundColor);
    const pageBg = await page.locator('.xevn-login-page').evaluate((el) => getComputedStyle(el).backgroundColor);

    if (neo === 1 && wordmark.trim() === 'XeVN' && mark === 1) {
      pass('AC1_left_hero', {
        wordmark: wordmark.trim(),
        visualBg: rgbToHex(visualBg),
        pageBg: rgbToHex(pageBg),
        neo: true,
      });
    } else {
      fail('AC1_left_hero', `neo=${neo} wordmark=${JSON.stringify(wordmark)} mark=${mark}`);
    }

    const cardWm = await page.locator('[data-testid="portal-login-card-wordmark"]').count();
    const bar = await page.locator('.xevn-dialog-surface').evaluate((el) => {
      const before = getComputedStyle(el, '::before');
      return {
        height: before.height,
        bg: before.backgroundColor,
        display: before.display,
      };
    });
    const barHex = rgbToHex(bar.bg);
    const glass = await page.locator('.xevn-dialog-header-glass').count();
    const title = await page.locator('.xevn-dialog-header-glass h2').innerText().catch(() => '');

    if (cardWm === 1 && glass === 1 && barHex === '#1E40AF' && (bar.height === '4px' || parseFloat(bar.height) === 4)) {
      pass('AC2_glass_card', { barHex, barHeight: bar.height, title: title.trim(), cardWordmark: true, glass: true });
    } else {
      fail(
        'AC2_glass_card',
        `cardWm=${cardWm} glass=${glass} bar=${barHex}/${bar.height} title=${JSON.stringify(title)}`,
      );
    }

    const cta = await page.locator('[data-testid="portal-login-submit"]').evaluate((el) => {
      const s = getComputedStyle(el);
      return { bg: s.backgroundColor, text: el.textContent?.trim() };
    });
    const ctaHex = rgbToHex(cta.bg);
    // Computed-style scan only (Tailwind unused .bg-purple-* in CSS bundle ≠ applied UI)
    const aiPalette = await page.evaluate(() => {
      const hits = [];
      const creamish = (r, g, b) => r > 230 && g > 220 && b > 200 && b < 230 && Math.abs(r - g) < 20;
      const purpleish = (r, g, b) => r > 100 && b > 140 && g < 120 && Math.abs(r - b) < 80;
      for (const el of document.querySelectorAll('[data-testid="portal-login-neo"] *')) {
        const s = getComputedStyle(el);
        for (const prop of ['backgroundColor', 'color']) {
          const m = String(s[prop]).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!m) continue;
          const [r, g, b] = [+m[1], +m[2], +m[3]];
          if (purpleish(r, g, b) || creamish(r, g, b)) {
            hits.push({
              testid: el.getAttribute('data-testid') || el.tagName,
              prop,
              rgb: `rgb(${r},${g},${b})`,
            });
          }
        }
      }
      return hits.slice(0, 12);
    });
    if (ctaHex === '#1E40AF' && aiPalette.length === 0) {
      pass('AC3_cta_primary_no_ai', { ctaHex, ctaText: cta.text, aiPaletteHits: 0 });
    } else {
      fail('AC3_cta_primary_no_ai', `cta=${ctaHex} aiPalette=${JSON.stringify(aiPalette)}`);
    }

    const emailVal = await page.locator('[data-testid="portal-login-email"]').inputValue();
    const passVal = await page.locator('[data-testid="portal-login-password"]').inputValue();
    const devStrip = await page.getByText(/Dev credential|credential strip|mật khẩu demo/i).count();
    if (emailVal === '' && passVal === '' && devStrip === 0) {
      pass('fields_empty_by_design', { emailVal, passVal, devStrip: 0 });
    } else {
      fail('fields_empty_by_design', `email=${JSON.stringify(emailVal)} passLen=${passVal.length} devStrip=${devStrip}`);
    }

    const shot1 = resolve(SCREEN, 'W4-PORT-LOGIN-load.png');
    await page.screenshot({ path: shot1, fullPage: true });
    results.screenshots.push(shot1);

    // Type credentials (U65 — no prefill, no seed)
    await page.locator('[data-testid="portal-login-email"]').fill(EMAIL);
    await page.locator('[data-testid="portal-login-password"]').fill(PASSWORD);

    const loginWait = page.waitForResponse(
      (r) => r.url().includes('/auth/login') && r.request().method() === 'POST',
      { timeout: 20000 },
    );
    await page.locator('[data-testid="portal-login-submit"]').click();
    const loginRes = await loginWait;
    const loginStatus = loginRes.status();
    await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 20000 }).catch(() => null);
    await sleep(800);

    const afterUrl = page.url();
    const landed = !afterUrl.includes('/login');
    if (loginStatus >= 200 && loginStatus < 300 && landed) {
      pass('AC4_login_post_land', { loginStatus, afterUrl });
    } else {
      fail('AC4_login_post_land', `status=${loginStatus} url=${afterUrl}`);
    }

    const shot2 = resolve(SCREEN, 'W4-PORT-LOGIN-after-auth.png');
    await page.screenshot({ path: shot2, fullPage: false });
    results.screenshots.push(shot2);

    // F5 session holds
    await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
    await sleep(600);
    const f5Url = page.url();
    const bouncedToLogin = f5Url.includes('/login');
    if (!bouncedToLogin) {
      pass('AC4b_f5_session', { f5Url });
    } else {
      fail('AC4b_f5_session', `bounced to login: ${f5Url}`);
    }

    const shot3 = resolve(SCREEN, 'W4-PORT-LOGIN-f5.png');
    await page.screenshot({ path: shot3, fullPage: false });
    results.screenshots.push(shot3);

    results.mutates = 0;
    results.seed = false;
  } catch (e) {
    fail('harness', String(e?.message || e).slice(0, 300));
  } finally {
    await browser.close().catch(() => null);
  }

  const allPass = results.failReasons.length === 0 && Object.values(results.checks).every((c) => c.pass);
  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = new Date().toISOString();
  save();
  console.log(JSON.stringify({ verdict: results.verdict, checks: results.checks, failReasons: results.failReasons, l0: results.l0, network: results.network }, null, 2));
  process.exit(allPass ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
