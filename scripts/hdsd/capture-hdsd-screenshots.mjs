#!/usr/bin/env node
/**
 * HDSD-P2-SCREEN-01 — Playwright screenshot capture for client HDSD markdown placeholders.
 * Usage: pnpm run hdsd:capture [-- --ids=ECO.1,5.1] [-- --dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { assetRelativePath } from './hdsd-figure-utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(__dirname, 'hdsd-capture-manifest.json');
const ASSETS_ROOT = path.join(ROOT, 'docs/client-delivery/hdsd/assets');

const FORBIDDEN_SCREEN_PATTERNS = [
  /access denied/i,
  /403 forbidden/i,
  /you don't have permission/i,
  /không có quyền truy cập/i,
  /trang không tồn tại/i,
  /page not found/i,
];

function parseArgs(argv) {
  const idsArg = argv.find((a) => a.startsWith('--ids='));
  let filterIds = null;
  if (idsArg) {
    filterIds = new Set(
      idsArg
        .slice('--ids='.length)
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  return {
    dryRun: argv.includes('--dry-run'),
    filterIds,
    headless: !argv.includes('--headed'),
  };
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function hostBase(manifest, host) {
  const d = manifest.defaults;
  if (host === 'hrm') return (process.env.HRM_URL ?? d.hrmBase).replace(/\/+$/, '');
  return (process.env.PORTAL_URL ?? d.portalBase).replace(/\/+$/, '');
}

async function loginPortal(page, base, creds) {
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(400);
  await emailInput.fill(creds.email);
  await page.locator('input[type="password"]').fill(creds.password);
  await Promise.all([
    page.waitForURL(/command-center|dashboard|\/(?!login)/, { timeout: 45000 }).catch(() => null),
    page.getByRole('button', { name: /Đăng nhập/i }).click(),
  ]);
  await page.waitForTimeout(2000);
}

async function ensurePortalSession(page, manifest, session, base) {
  if (!session.portalLoggedIn) {
    await loginPortal(page, base, manifest.defaults.credentials);
    session.portalLoggedIn = true;
    return;
  }
  const onLogin = /\/login(\?|$)/.test(page.url()) && !/\/hr\/login/.test(page.url());
  if (onLogin) {
    await loginPortal(page, base, manifest.defaults.credentials);
    session.portalLoggedIn = true;
  }
}

function hrmLoginPath(base) {
  const envBase = process.env.HRM_BASE_PATH;
  if (envBase === '/' || envBase === '') return '/login';
  if (envBase) return `${envBase.replace(/\/+$/, '')}/login`;
  // W2a standalone (:5175 --base /) vs embed backend (:8080 /hr/)
  if (/:5175\b/.test(base)) return '/login';
  return '/hr/login';
}

function hrmPostLoginPattern(base) {
  if (hrmLoginPath(base) === '/login') return /\/(employees|dashboard|\?)?($|\?)/;
  return /\/hr\/?($|\?)/;
}

async function loginHrm(page, base, creds) {
  const loginUrl = `${base}${hrmLoginPath(base)}`;
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const email = page.locator('input[type="email"]');
  if (await email.count()) {
    await email.fill(creds.email);
    await page.fill('input[type="password"]', creds.password);
    await Promise.all([
      page.waitForURL(hrmPostLoginPattern(base), { timeout: 45000 }).catch(() => null),
      page.getByRole('button', { name: /Đăng nhập/i }).click(),
    ]);
    await page.waitForTimeout(2000);
  }
}

async function runActions(page, actions = []) {
  for (const action of actions) {
    try {
      if (action.type === 'clickText') {
        const loc = page.getByText(action.text, { exact: false }).first();
        if (await loc.isVisible({ timeout: 3000 }).catch(() => false)) {
          await loc.click({ timeout: 5000 });
          await page.waitForTimeout(800);
        } else if (!action.optional) {
          throw new Error(`Text not found: ${action.text}`);
        }
      } else if (action.type === 'clickRole') {
        const loc = page.getByRole(action.role, { name: new RegExp(action.name, 'i') }).first();
        if (await loc.isVisible({ timeout: 3000 }).catch(() => false)) {
          await loc.click({ timeout: 5000 });
          await page.waitForTimeout(800);
        } else if (!action.optional) {
          throw new Error(`Role ${action.role} not found: ${action.name}`);
        }
      } else if (action.type === 'clickRow') {
        const row = page.locator('table tbody tr, [role="row"]').first();
        if (await row.isVisible({ timeout: 3000 }).catch(() => false)) {
          await row.click({ timeout: 5000 });
          await page.waitForTimeout(800);
        }
      }
    } catch (err) {
      if (!action.optional) throw err;
    }
  }
}

async function assertScreenOk(page, figure, url) {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  for (const re of FORBIDDEN_SCREEN_PATTERNS) {
    if (re.test(bodyText)) {
      return { ok: false, reason: `Forbidden screen text matched ${re}` };
    }
  }
  if (figure.auth && /\/login(\?|$)/.test(page.url()) && !/\/hr\/login/.test(page.url())) {
    return { ok: false, reason: 'Redirected to login — session/auth failure' };
  }
  if (figure.path.includes('/command-center') && figure.auth && !/\/command-center|\/hr\//.test(page.url())) {
    if (!page.url().includes('/dashboard') && !page.url().includes('/cockpit')) {
      return { ok: false, reason: `Unexpected URL after nav: ${page.url()} (expected CC/HRM)` };
    }
  }
  return { ok: true, url: page.url() };
}

async function captureFigure(page, context, manifest, figure, session) {
  const base = hostBase(manifest, figure.host);
  const url = `${base}${figure.path.startsWith('/') ? figure.path : `/${figure.path}`}`;
  const relOut = assetRelativePath(figure.domain, figure.id);
  const outPath = path.join(ASSETS_ROOT, relOut);

  if (!figure.auth) {
    await context.clearCookies();
    session.portalLoggedIn = false;
    session.hrmLoggedIn = false;
  } else if (figure.host === 'hrm') {
    if (!session.hrmLoggedIn) {
      await loginHrm(page, base, manifest.defaults.credentials);
      session.hrmLoggedIn = true;
    }
  } else if (figure.host === 'portal') {
    await ensurePortalSession(page, manifest, session, base);
  }

  await page.goto(url, {
    waitUntil: manifest.defaults.waitUntil ?? 'networkidle',
    timeout: manifest.defaults.navigationTimeoutMs ?? 90000,
  });

  if (!figure.auth && /\/login/.test(figure.path)) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    }).catch(() => null);
    await page.reload({ waitUntil: manifest.defaults.waitUntil ?? 'networkidle' });
  }

  await page.waitForTimeout(manifest.defaults.settleMs ?? 1500);

  if (figure.auth && figure.host === 'portal') {
    await ensurePortalSession(page, manifest, session, base);
    if (/\/login(\?|$)/.test(page.url()) && !/\/hr\/login/.test(page.url())) {
      await loginPortal(page, base, manifest.defaults.credentials);
      session.portalLoggedIn = true;
      await page.goto(url, {
        waitUntil: manifest.defaults.waitUntil ?? 'networkidle',
        timeout: manifest.defaults.navigationTimeoutMs ?? 90000,
      });
      await page.waitForTimeout(manifest.defaults.settleMs ?? 1500);
    }
  }

  if (figure.waitFor === 'iframe') {
    await page.locator('iframe').first().waitFor({ state: 'attached', timeout: 20000 }).catch(() => null);
    await page.waitForTimeout(1000);
  }

  await runActions(page, figure.actions);

  const gate = await assertScreenOk(page, figure, url);
  if (!gate.ok) {
    return { id: figure.id, status: 'fail', reason: gate.reason, url, output: relOut };
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: true });

  const stat = fs.statSync(outPath);
  return {
    id: figure.id,
    status: 'ok',
    url: page.url(),
    output: relOut,
    bytes: stat.size,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = loadManifest();
  let figures = manifest.figures;
  if (args.filterIds) {
    figures = figures.filter((f) => args.filterIds.has(f.id));
  }

  const report = {
    work_item_id: manifest.work_item_id,
    generatedAt: new Date().toISOString(),
    portalBase: hostBase(manifest, 'portal'),
    hrmBase: hostBase(manifest, 'hrm'),
    dryRun: args.dryRun,
    results: [],
    skipped: manifest.skipped ?? [],
    summary: { ok: 0, fail: 0, dryRun: 0 },
  };

  if (args.dryRun) {
    for (const f of figures) {
      report.results.push({
        id: f.id,
        status: 'dry-run',
        output: assetRelativePath(f.domain, f.id),
        path: f.path,
      });
      report.summary.dryRun += 1;
    }
    const outJson = path.join(ROOT, 'docs/qa/evidence/hdsd-p2-screenshots-capture.json');
    fs.mkdirSync(path.dirname(outJson), { recursive: true });
    fs.writeFileSync(outJson, JSON.stringify(report, null, 2));
    console.log(`Dry-run ${figures.length} figures → ${outJson}`);
    return;
  }

  const browser = await chromium.launch({ headless: args.headless });
  const context = await browser.newContext({
    viewport: manifest.defaults.viewport,
  });
  const page = await context.newPage();
  const session = { portalLoggedIn: false, hrmLoggedIn: false };

  for (const figure of figures) {
    process.stdout.write(`Capture ${figure.id} … `);
    try {
      const result = await captureFigure(page, context, manifest, figure, session);
      report.results.push(result);
      if (result.status === 'ok') {
        report.summary.ok += 1;
        console.log(`OK (${result.bytes} bytes)`);
      } else {
        report.summary.fail += 1;
        console.log(`FAIL — ${result.reason}`);
      }
    } catch (err) {
      report.summary.fail += 1;
      const msg = err instanceof Error ? err.message : String(err);
      report.results.push({ id: figure.id, status: 'fail', reason: msg, output: assetRelativePath(figure.domain, figure.id) });
      console.log(`ERROR — ${msg}`);
    }
  }

  await browser.close();

  const outJson = path.join(ROOT, 'docs/qa/evidence/hdsd-p2-screenshots-capture.json');
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2));

  console.log('\nSummary:', report.summary);
  console.log('Report:', outJson);
  process.exit(report.summary.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
