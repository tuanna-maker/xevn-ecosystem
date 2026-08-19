/**
 * QA-HRM-OU-FILTER-EMBED-01 — browser U65
 * CC embed OU filter: open options → wait ≥5s → reopen still has members;
 * select Visun → banner + employees company_id=logistics;
 * regression /hr/employees?portal=1.
 * Portal :5173 · ceo@xe.vn · no seed · HOLD_DEPLOY · NOT :8088
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const WAIT_MS = Number(process.env.OU_WAIT_MS || 5500);
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-hrm-ou-filter-embed-01-runtime.json');
const SHOT_OPEN = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-hrm-ou-filter-embed-01-open.png');
const SHOT_REOPEN = resolve(
  __dir,
  '../../docs/qa/evidence/_tmp-qa-hrm-ou-filter-embed-01-reopen.png',
);
const SHOT_VISUN = resolve(
  __dir,
  '../../docs/qa/evidence/_tmp-qa-hrm-ou-filter-embed-01-visun.png',
);
const SHOT_REGRESSION = resolve(
  __dir,
  '../../docs/qa/evidence/_tmp-qa-hrm-ou-filter-embed-01-regression.png',
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-OU-FILTER-EMBED-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, seed: false, HOLD_DEPLOY: true, WAIT_MS },
  steps: [],
  verdicts: {},
  net: { operatingUnits: [], employees: [] },
  embed: {},
  regression: {},
  ownerHint: null,
};

function note(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString() };
  results.steps.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  return ok;
}

async function loginApi() {
  const bases = [`${XBOS_API}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`];
  let lastErr = '';
  for (const url of bases) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const text = await r.text();
      const j = text ? JSON.parse(text) : {};
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user: data?.user ?? {
            userId: EMAIL,
            email: EMAIL,
            displayName: 'CEO Tập đoàn',
            roles: ['group_ceo', 'portal'],
          },
          raw: data,
          loginUrl: url,
        };
      }
      lastErr = `HTTP ${r.status} via ${url}`;
    } catch (e) {
      lastErr = `${url}: ${String(e).slice(0, 160)}`;
    }
  }
  throw new Error(`login failed — ${lastErr}`);
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
    // Do NOT overwrite OU selection on every document (iframe remount / soft-nav)
    if (!sessionStorage.getItem('hrm:operating-unit-filter')) {
      sessionStorage.setItem('hrm:operating-unit-filter', 'all');
    }
  }, session);
}

function attachNet(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (/\/operating-units(\?|$)/.test(u) && method === 'GET') {
        let bodyText = '';
        try {
          bodyText = await res.text();
        } catch {
          bodyText = '';
        }
        let parsed = null;
        try {
          parsed = bodyText ? JSON.parse(bodyText) : null;
        } catch {
          parsed = { raw: bodyText.slice(0, 2000) };
        }
        results.net.operatingUnits.push({
          url: u.replace(PORTAL, '').replace('http://127.0.0.1:28001', ''),
          status: res.status(),
          dataLen: Array.isArray(parsed?.data) ? parsed.data.length : null,
          slugs: Array.isArray(parsed?.data)
            ? parsed.data.map((r) => r?.operating_slug).filter(Boolean)
            : [],
          code: parsed?.code ?? null,
        });
      }
      if (/\/employees(\?|$)/.test(u) && method === 'GET' && !/\/employees\//.test(u.replace(/\?.*/, ''))) {
        const reqUrl = res.request().url();
        let q = {};
        try {
          q = Object.fromEntries(new URL(reqUrl).searchParams.entries());
        } catch {
          /* ignore */
        }
        let bodyText = '';
        try {
          bodyText = await res.text();
        } catch {
          bodyText = '';
        }
        let parsed = null;
        try {
          parsed = bodyText ? JSON.parse(bodyText) : null;
        } catch {
          parsed = null;
        }
        const rows = Array.isArray(parsed?.data)
          ? parsed.data
          : Array.isArray(parsed?.data?.items)
            ? parsed.data.items
            : Array.isArray(parsed?.items)
              ? parsed.items
              : [];
        results.net.employees.push({
          url: reqUrl.replace(PORTAL, '').replace('http://127.0.0.1:28001', ''),
          status: res.status(),
          query: q,
          rowCount: rows.length,
          sampleCompanyIds: rows
            .slice(0, 5)
            .map((r) => r?.company_id ?? r?.companyId ?? r?.operating_slug)
            .filter(Boolean),
        });
      }
    } catch {
      /* ignore */
    }
  });
}

/** Resolve HRM iframe frame on CC shell; fall back to page itself. */
async function resolveHrmContext(page, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const frames = page.frames();
    const hrmFrame = frames.find((f) => {
      try {
        const u = f.url() || '';
        return /\/hr(\/|\?|$)/.test(u) || /portal=1/.test(u) || /hrm-proxy|\/embed\//.test(u);
      } catch {
        return false;
      }
    });
    if (hrmFrame) {
      const hasOu = await hrmFrame
        .evaluate(() => Boolean(document.querySelector('[aria-label="Lọc đơn vị thành viên"]')))
        .catch(() => false);
      if (hasOu) return { ctx: hrmFrame, via: 'iframe', url: hrmFrame.url() };
    }
    const pageHasOu = await page
      .evaluate(() => Boolean(document.querySelector('[aria-label="Lọc đơn vị thành viên"]')))
      .catch(() => false);
    if (pageHasOu) return { ctx: page, via: 'page', url: page.url() };
    await sleep(500);
  }
  return { ctx: null, via: null, url: page.url() };
}

async function waitForOuFilter(ctx, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = await ctx
      .evaluate(() => {
        const trigger = document.querySelector('[aria-label="Lọc đơn vị thành viên"]');
        const label = Array.from(document.querySelectorAll('span,div')).some((el) =>
          (el.textContent || '').includes('Đơn vị thành viên'),
        );
        return Boolean(trigger) || label;
      })
      .catch(() => false);
    if (found) return true;
    await sleep(400);
  }
  return false;
}

async function openOuSelect(ctx) {
  const trigger = await ctx.$('[aria-label="Lọc đơn vị thành viên"]');
  if (!trigger) return false;
  await trigger.click();
  await sleep(700);
  return true;
}

async function readSelectOptions(ctx) {
  return ctx.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[role="option"], [data-radix-collection-item]'));
    return items
      .map((el) => ({
        text: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        value: el.getAttribute('data-value') || el.getAttribute('value') || null,
      }))
      .filter((x) => x.text);
  });
}

function analyzeOptions(options) {
  const texts = options.map((o) => o.text);
  const hasAll = texts.some((t) => /Tất cả đơn vị \(rollup\)/i.test(t));
  const memberOpts = options.filter((o) => !/Tất cả đơn vị|Đang tải/i.test(o.text));
  return { texts, hasAll, memberOpts, onlyAll: hasAll && memberOpts.length === 0 };
}

async function selectOptionByText(ctx, needle) {
  return ctx.evaluate((n) => {
    const items = Array.from(document.querySelectorAll('[role="option"], [data-radix-collection-item]'));
    const hit = items.find((el) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      return t.includes(String(n).toLowerCase());
    });
    if (!hit) return false;
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    hit.click?.();
    return true;
  }, needle);
}

async function readBanner(ctx) {
  return ctx.evaluate(() => {
    const banner = document.querySelector('[data-testid="hrm-operating-unit-viewing-banner"]');
    if (banner) return (banner.textContent || '').replace(/\s+/g, ' ').trim();
    const spans = Array.from(document.querySelectorAll('span'));
    const hit = spans.find((s) => (s.textContent || '').trim().startsWith('Đang xem:'));
    return hit ? (hit.textContent || '').replace(/\s+/g, ' ').trim() : null;
  });
}

async function closeSelect(ctx) {
  try {
    await ctx.keyboard.press('Escape');
  } catch {
    /* page may not own keyboard — try evaluate */
    await ctx.evaluate(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
  }
  await sleep(400);
}

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const session = await loginApi();
  note('api-login', true, `${EMAIL} via ${session.loginUrl}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    await injectSession(page, session);
    attachNet(page);

    // ——— AC1–3: CC embed dashboard ———
    const ccUrl = `${PORTAL}/command-center/hrm/dashboard`;
    await page.goto(ccUrl, { waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(3000);

    let { ctx, via, url: embedUrl } = await resolveHrmContext(page);
    results.embed.resolve = { via, url: embedUrl };
    note(
      'ac0-embed-context',
      Boolean(ctx),
      ctx ? `via=${via} url=${embedUrl}` : `no OU filter / iframe — page=${page.url()}`,
    );
    if (!ctx) {
      results.ownerHint = 'dev-fe — CC HRM iframe / OU filter not mounted on /command-center/hrm/dashboard';
      results.verdicts.overall = 'FAIL';
      writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
      return;
    }

    const filterReady = await waitForOuFilter(ctx);
    note('ac1-filter-visible', filterReady, filterReady ? 'OU filter present in embed' : 'OU filter missing');
    if (!filterReady) {
      results.ownerHint = 'dev-fe — showFilter / Group CEO gate on CC embed';
      results.verdicts.overall = 'FAIL';
      writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
      return;
    }

    // AC1: open — member options visible
    const opened = await openOuSelect(ctx);
    note('ac1-dropdown-open', opened, opened ? 'Select opened' : 'could not click trigger');
    await sleep(800);
    await page.screenshot({ path: SHOT_OPEN, fullPage: false });

    const options1 = await readSelectOptions(ctx);
    results.embed.optionsOpen = options1;
    const a1 = analyzeOptions(options1);
    const ac1Ok = a1.memberOpts.length > 0 && a1.hasAll && !a1.onlyAll;
    note(
      'ac1-member-options',
      ac1Ok,
      `all=${a1.hasAll} members=${a1.memberOpts.length} sample=${a1.memberOpts
        .slice(0, 4)
        .map((o) => o.text)
        .join(' | ')}`,
    );
    results.verdicts.ac1 = ac1Ok ? 'PASS' : 'FAIL';
    if (!ac1Ok) {
      results.ownerHint =
        a1.onlyAll
          ? 'dev-be/auth — GET /api/hrm/operating-units fail-closed empty'
          : 'dev-fe — D-HRM-OU-FILTER-EMBED-01 Select portal / options empty on first open';
    }

    await closeSelect(ctx);

    // AC2: wait ≥5s, reopen — options still present
    console.log(`Waiting ${WAIT_MS}ms before reopen…`);
    await sleep(WAIT_MS);

    // Re-resolve in case iframe remounted
    ({ ctx, via, url: embedUrl } = await resolveHrmContext(page, 15000));
    results.embed.resolveAfterWait = { via, url: embedUrl };
    if (!ctx) {
      note('ac2-reopen-context', false, 'lost embed context after wait');
      results.verdicts.ac2 = 'FAIL';
      results.ownerHint = 'dev-fe — D-HRM-OU-FILTER-EMBED-01 iframe lost after idle';
    } else {
      const reopened = await openOuSelect(ctx);
      note('ac2-reopen-click', reopened, reopened ? 'Select reopened after wait' : 'reopen click failed');
      await sleep(800);
      await page.screenshot({ path: SHOT_REOPEN, fullPage: false });

      const options2 = await readSelectOptions(ctx);
      results.embed.optionsReopen = options2;
      const a2 = analyzeOptions(options2);
      const ac2Ok = a2.memberOpts.length > 0 && a2.hasAll && !a2.onlyAll;
      note(
        'ac2-options-persist',
        ac2Ok,
        `afterWait=${WAIT_MS}ms all=${a2.hasAll} members=${a2.memberOpts.length} sample=${a2.memberOpts
          .slice(0, 4)
          .map((o) => o.text)
          .join(' | ')} (openHad=${a1.memberOpts.length})`,
      );
      results.verdicts.ac2 = ac2Ok ? 'PASS' : 'FAIL';
      if (!ac2Ok) {
        results.ownerHint =
          'dev-fe — D-HRM-OU-FILTER-EMBED-01 options wiped after idle (portal/query invalidate)';
      }

      // AC3: go to employees in CC embed, then Select Visun → banner + company_id=logistics
      await closeSelect(ctx);
      const empCcUrl = `${PORTAL}/command-center/hrm/employees`;
      if (!/\/employees/.test(page.url())) {
        await page.goto(empCcUrl, { waitUntil: 'networkidle2', timeout: 90000 });
        await sleep(3000);
        ({ ctx, via, url: embedUrl } = await resolveHrmContext(page, 30000));
        results.embed.resolveEmployees = { via, url: embedUrl };
      }
      if (!ctx) {
        note('ac3-employees-context', false, 'lost embed on employees route');
        results.verdicts.ac3 = 'FAIL';
        results.ownerHint =
          'dev-fe — D-HRM-OU-FILTER-EMBED-01 iframe missing on /command-center/hrm/employees';
      } else {
        await waitForOuFilter(ctx);
        const empNetBefore = results.net.employees.length;
        await openOuSelect(ctx);
        await sleep(600);
        let clickedVisun = await selectOptionByText(ctx, 'Visun');
        if (!clickedVisun) {
          clickedVisun = await selectOptionByText(ctx, 'logistics');
        }
        note('ac3-select-visun', clickedVisun, clickedVisun ? 'Visun option clicked' : 'Visun not found');
        await sleep(2800);
        await page.screenshot({ path: SHOT_VISUN, fullPage: false });

        const banner = await readBanner(ctx);
        results.embed.banner = banner;
        const bannerOk =
          Boolean(banner) &&
          /Đang xem:/i.test(banner) &&
          /Visun/i.test(banner) &&
          !/Tất cả đơn vị \(rollup\)/i.test(banner);
        note('ac3-banner', bannerOk, banner || '(no banner)');

        await sleep(1500);
        const logisticsHit =
          results.net.employees.slice(empNetBefore).find(
            (e) =>
              e.status >= 200 &&
              e.status < 300 &&
              String(e.query?.company_id || '').toLowerCase() === 'logistics',
          ) ||
          results.net.employees.find(
            (e) =>
              e.status >= 200 &&
              e.status < 300 &&
              String(e.query?.company_id || '').toLowerCase() === 'logistics',
          );
        results.embed.logisticsEmployees = logisticsHit || null;
        const scopeOk = Boolean(logisticsHit);
        note(
          'ac3-employees-scoped',
          scopeOk,
          scopeOk
            ? `status=${logisticsHit.status} company_id=${logisticsHit.query?.company_id} rows=${logisticsHit.rowCount} url=${logisticsHit.url?.slice(0, 160)}`
            : `no GET employees?company_id=logistics after Visun (empNet total=${results.net.employees.length})`,
        );
        results.verdicts.ac3 = clickedVisun && bannerOk && scopeOk ? 'PASS' : 'FAIL';
        if (results.verdicts.ac3 !== 'PASS' && !results.ownerHint) {
          results.ownerHint =
            'dev-fe — D-HRM-OU-FILTER-EMBED-01 Visun banner / company_id=logistics not applied in embed';
        }
      }
    }

    // ——— AC4: regression direct portal embed ———
    const regPage = await browser.newPage();
    await injectSession(regPage, session);
    attachNet(regPage);
    const regUrl = `${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`;
    await regPage.goto(regUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(2500);

    const regReady = await waitForOuFilter(regPage);
    note('ac4-reg-filter', regReady, regReady ? 'OU filter on /hr/employees?portal=1' : 'missing');
    if (regReady) {
      await openOuSelect(regPage);
      await sleep(600);
      const regOpts = await readSelectOptions(regPage);
      results.regression.options = regOpts;
      const ar = analyzeOptions(regOpts);
      const regOpenOk = ar.memberOpts.length > 0 && ar.hasAll;
      note(
        'ac4-reg-options',
        regOpenOk,
        `members=${ar.memberOpts.length} all=${ar.hasAll}`,
      );
      await closeSelect(regPage);
      await openOuSelect(regPage);
      await sleep(400);
      const empBefore = results.net.employees.length;
      await selectOptionByText(regPage, 'Visun');
      await sleep(2500);
      await regPage.screenshot({ path: SHOT_REGRESSION, fullPage: false });
      const regBanner = await readBanner(regPage);
      results.regression.banner = regBanner;
      const regBannerOk = /Visun/i.test(regBanner || '');
      const regScope =
        results.net.employees.slice(empBefore).find(
          (e) => String(e.query?.company_id || '').toLowerCase() === 'logistics' && e.status < 300,
        ) ||
        results.net.employees.find(
          (e) => String(e.query?.company_id || '').toLowerCase() === 'logistics' && e.status < 300,
        );
      results.regression.logistics = regScope || null;
      const regOk = regOpenOk && regBannerOk && Boolean(regScope);
      note(
        'ac4-regression',
        regOk,
        `banner=${regBanner} logisticsNet=${regScope?.status} q=${regScope?.query?.company_id}`,
      );
      results.verdicts.ac4 = regOk ? 'PASS' : 'FAIL';
      if (!regOk && !results.ownerHint) {
        results.ownerHint = 'dev-fe — D-HRM-OU-FILTER-EMBED-01 regression /hr/employees?portal=1 broken';
      }
    } else {
      results.verdicts.ac4 = 'FAIL';
      results.ownerHint = results.ownerHint || 'dev-fe — regression OU filter missing on portal=1';
    }
    await regPage.close();

    const criticalFails = results.steps.filter(
      (s) =>
        !s.ok &&
        /^(ac1-|ac2-|ac3-|ac4-|ac0-)/.test(s.id),
    );
    results.verdicts.overall = criticalFails.length === 0 ? 'PASS' : 'FAIL';
    if (results.verdicts.overall === 'FAIL' && !results.ownerHint) {
      results.ownerHint = 'dev-fe — D-HRM-OU-FILTER-EMBED-01';
    }
  } finally {
    results.finishedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
    console.log('RUNTIME', OUT);
    console.log('OVERALL', results.verdicts.overall);
    await browser.close();
  }
}

main().catch((e) => {
  results.verdicts.overall = 'FAIL';
  results.ownerHint = 'qa/devops — runner crash';
  results.error = String(e);
  writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
  console.error(e);
  process.exit(1);
});
