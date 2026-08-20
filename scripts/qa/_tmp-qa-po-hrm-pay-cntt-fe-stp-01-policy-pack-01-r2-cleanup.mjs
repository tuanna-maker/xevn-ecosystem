#!/usr/bin/env node
/**
 * QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2-CLEANUP
 * Archive leftover FE-created rows via UI «Ngưng áp dụng» + capture a11y labels.
 * U65: zero-seed · browser-only · no SQL / no direct API mutate.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const TARGETS = ['qar2porxwdp4', 'qar2staxwdp4'];

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2-cleanup.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/qa-po-hrm-pay-cntt-fe-stp-01-policy-pack-01-r2-cleanup',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const R = {
  work_item_id: 'QA-PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01-R2-CLEANUP',
  stamp: `PAYPPCLEAN-${Date.now().toString(36).toUpperCase().slice(-8)}`,
  startedAt: ts(),
  targets: TARGETS,
  modes: {},
  a11y: null,
  ack_status: null,
  overall: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

async function loginApi() {
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        return {
          token,
          user: data?.user ?? { email: EMAIL, userId: EMAIL, roles: ['group_ceo'] },
          companyId: COMPANY,
          expiresAt: Date.now() + 8_000_000,
        };
      }
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function injectAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
    }
  }, session);
}

async function findCtx(page, testId, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const h of [page, ...page.frames()]) {
      try {
        const loc = h.getByTestId(testId).first();
        if (await loc.isVisible({ timeout: 400 }).catch(() => false)) return { host: h, loc };
      } catch {
        /* */
      }
    }
    await sleep(400);
  }
  return null;
}

function setupUrl(base, mode) {
  if (mode === 'portal') {
    const u = new URL('/hr/payroll/setup', base);
    u.searchParams.set('portal', '1');
    u.searchParams.set('tenantId', TENANT);
    u.searchParams.set('companyId', COMPANY);
    u.searchParams.set('section', 'policy-pack');
    return u.toString();
  }
  return `${base.replace(/\/$/, '')}/hr/payroll/setup?section=policy-pack&companyId=${COMPANY}&tenantId=${TENANT}`;
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: true }).catch(() => {});
  return path.replace(/\\/g, '/');
}

async function captureA11y(host) {
  // Search input: has aria-label
  const search = host.locator('[data-testid="pay-policy-pack-list"] input[aria-label]').first();
  // Prefer the search by its known aria-label; fallback placeholder
  const searchByAria = host.locator('input[aria-label="Tìm mã hoặc tên gói"]').first();
  const searchLoc = (await searchByAria.count()) ? searchByAria : search;

  const nameInput = host.locator('#nameVi').first();
  const nameLabel = host.locator('label[for="nameVi"]').first();

  const searchInfo = await searchLoc
    .evaluate((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      name: el.getAttribute('name'),
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledby: el.getAttribute('aria-labelledby'),
      className: (el.className || '').toString().slice(0, 120),
      // accessible name as browser computes if available via aria
    }))
    .catch(() => null);

  const nameInfo = await nameInput
    .evaluate((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      name: el.getAttribute('name'),
      type: el.getAttribute('type'),
      placeholder: el.getAttribute('placeholder'),
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledby: el.getAttribute('aria-labelledby'),
      className: (el.className || '').toString().slice(0, 120),
    }))
    .catch(() => null);

  const nameLabelText = await nameLabel.textContent().catch(() => null);
  const nameLabelHtmlFor = await nameLabel.getAttribute('for').catch(() => null);

  // Playwright getByLabel collision probe (observation only — not a verdict)
  const byLabelTenGoi = host.getByLabel(/Tên gói/i);
  const matchCount = await byLabelTenGoi.count().catch(() => -1);
  const matchSummaries = [];
  for (let i = 0; i < Math.min(matchCount, 5); i++) {
    const m = byLabelTenGoi.nth(i);
    const info = await m
      .evaluate((el) => ({
        id: el.id || null,
        ariaLabel: el.getAttribute('aria-label'),
        placeholder: el.getAttribute('placeholder'),
        tag: el.tagName.toLowerCase(),
      }))
      .catch(() => null);
    if (info) matchSummaries.push(info);
  }

  return {
    search_input: {
      css_selector_candidates: [
        'input[aria-label="Tìm mã hoặc tên gói"]',
        '[data-testid="pay-policy-pack-list"] input[placeholder="Tìm mã/tên…"]',
      ],
      observed: searchInfo,
    },
    name_input: {
      css_selector_candidates: ['#nameVi', 'label[for="nameVi"] + input', 'form #nameVi'],
      observed: nameInfo,
      associated_label: {
        selector: 'label[for="nameVi"]',
        htmlFor: nameLabelHtmlFor,
        textContent: (nameLabelText || '').trim(),
      },
    },
    playwright_getByLabel_Ten_goi_probe: {
      pattern: '/Tên gói/i (exact:false equivalent)',
      match_count: matchCount,
      matches: matchSummaries,
      note: 'Observation only — QC decides if a11y defect; QA does not PASS/FAIL this.',
    },
  };
}

async function archiveCode(page, host, code, mode) {
  const result = {
    code,
    found: false,
    archived: false,
    archiveStatus: null,
    hiddenAfter: null,
    hiddenF5: null,
    clickPath: [],
    network: null,
  };

  const rowTid = `pay-policy-pack-row-${code}`;
  let row = host.getByTestId(rowTid).first();
  if (!(await row.isVisible({ timeout: 2500 }).catch(() => false))) {
    row = host.getByText(code, { exact: true }).first();
  }
  if (!(await row.isVisible({ timeout: 2500 }).catch(() => false))) {
    result.clickPath.push(`row ${code} NOT in default list`);
    // Already gone = cleanup goal satisfied for this code
    result.found = false;
    result.archived = true; // treat as already clean
    result.hiddenF5 = true;
    return result;
  }

  result.found = true;
  result.clickPath.push(`click row ${rowTid}`);
  await row.click({ force: true });
  await sleep(800);

  const archBtn = host.getByTestId('pay-policy-pack-archive').first();
  if (!(await archBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
    result.clickPath.push('archive button missing');
    return result;
  }

  const wait = page
    .waitForResponse(
      (res) =>
        /pay-policy-packs\/.+\/archive/i.test(res.url()) && res.request().method() === 'POST',
      { timeout: 20000 },
    )
    .catch(() => null);

  result.clickPath.push('click Ngưng áp dụng (pay-policy-pack-archive)');
  await archBtn.click({ force: true });
  const archRes = await wait;
  await sleep(1200);

  result.archiveStatus = archRes?.status?.() ?? null;
  result.network = archRes
    ? { method: 'POST', url: archRes.url().slice(0, 220), status: archRes.status() }
    : null;
  result.archived = !!(archRes && archRes.status() >= 200 && archRes.status() < 300);

  result.hiddenAfter = !(await host.getByTestId(rowTid).first().isVisible({ timeout: 1500 }).catch(() => false));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  const list = await findCtx(page, 'pay-policy-pack-list', 15000);
  const h2 = list?.host ?? host;
  result.hiddenF5 =
    !(await h2.getByTestId(rowTid).first().isVisible({ timeout: 2000 }).catch(() => false)) &&
    !(await h2.getByText(code, { exact: true }).first().isVisible({ timeout: 1500 }).catch(() => false));
  result.clickPath.push(`F5 → hidden=${result.hiddenF5}`);

  // return refreshed host via mutating caller by re-finding later
  return result;
}

async function runMode(browser, session, mode, base) {
  const bag = {
    mode,
    base,
    url: setupUrl(base, mode),
    packs: [],
    screens: [],
    verdict: 'FAIL',
  };
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  await injectAuth(page, session);

  try {
    await page.goto(bag.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await sleep(2500);
    const hub = await findCtx(page, 'pay-stp-hub-root', 8000);
    if (hub) {
      const nav = await findCtx(page, 'pay-stp-nav-policy-pack', 4000);
      if (nav) {
        await nav.loc.click({ force: true }).catch(() => {});
        await sleep(1000);
      }
    }
    let list = await findCtx(page, 'pay-policy-pack-list', 20000);
    if (!list) {
      bag.error = 'pay-policy-pack-list not found';
      R.modes[mode] = bag;
      save();
      await context.close();
      return bag;
    }
    let host = list.host;
    bag.screens.push(await shot(page, `${mode}-01-before`));

    // Capture a11y once on portal (or first available mode)
    if (!R.a11y) {
      // Ensure create form visible so #nameVi exists
      const add = host.getByTestId('pay-policy-pack-add').first();
      if (await add.isVisible().catch(() => false)) {
        await add.click({ force: true });
        await sleep(400);
      }
      R.a11y = await captureA11y(host);
      bag.screens.push(await shot(page, `${mode}-a11y-form`));
    }

    for (const code of TARGETS) {
      // refresh list host each iteration
      list = await findCtx(page, 'pay-policy-pack-list', 12000);
      host = list?.host ?? host;
      const r = await archiveCode(page, host, code, mode);
      bag.packs.push(r);
      console.log(
        `${mode} ${code}: found=${r.found} archived=${r.archived} status=${r.archiveStatus} hiddenF5=${r.hiddenF5}`,
      );
      // after reload inside archiveCode, re-find
      list = await findCtx(page, 'pay-policy-pack-list', 12000);
      host = list?.host ?? host;
    }

    bag.screens.push(await shot(page, `${mode}-02-after-f5`));

    // Final confirmation both gone
    const remaining = [];
    for (const code of TARGETS) {
      const still =
        (await host.getByTestId(`pay-policy-pack-row-${code}`).first().isVisible({ timeout: 1000 }).catch(() => false)) ||
        (await host.getByText(code, { exact: true }).first().isVisible({ timeout: 800 }).catch(() => false));
      if (still) remaining.push(code);
    }
    bag.remainingAfterF5 = remaining;
    bag.verdict = remaining.length === 0 ? 'PASS' : 'FAIL';
  } catch (err) {
    bag.error = String(err?.stack || err).slice(0, 800);
    bag.verdict = 'FAIL';
  }

  R.modes[mode] = bag;
  save();
  await context.close();
  return bag;
}

async function main() {
  const session = await loginApi();
  console.log('login ok', R.stamp);
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  // Prefer portal for a11y capture + cleanup (same list CHUNG); also run standalone to confirm hide.
  await runMode(browser, session, 'portal', PORTAL);
  await runMode(browser, session, 'standalone', HRM_FE);

  await browser.close();

  const portalOk = R.modes.portal?.verdict === 'PASS';
  const standOk = R.modes.standalone?.verdict === 'PASS';
  // Cleanup PASS if BOTH codes hidden on both modes after F5 (or already absent)
  R.overall = portalOk && standOk ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  save();
  console.log('OVERALL', R.overall, R.ack_status);
  console.log('A11Y', JSON.stringify(R.a11y, null, 2));
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.endedAt = ts();
  R.error = String(e?.stack || e).slice(0, 1000);
  save();
  process.exit(1);
});
