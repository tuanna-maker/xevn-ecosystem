#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-PORT-B-QA — U65 browser chrome PORT-09/10 + CC settings + AppHeader
 * zero-seed · no Face invent · no Attendance CLOSED · no remaster DONE claim
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_STANDALONE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-port-b-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-port-b-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-PORT-B-QA',
  fe_work_item: 'PO-HRM-UI-BRAND-W3-PORT-B',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  env: { PORTAL, HRM_STANDALONE, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  surfaces: {},
  screenshots: [],
  consoleErrors: [],
  pageErrors: [],
  failReasons: [],
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
    ['hrm_fe', `${HRM_STANDALONE}/`],
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

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: 'main',
    user: {
      userId: data?.user?.userId || data?.user?.id || EMAIL,
      email: EMAIL,
      displayName: data?.user?.displayName || 'CEO',
      roles: data?.user?.roles || ['group_ceo'],
    },
    http: r.status,
  };
}

async function injectPortalAuth(page, session, { portalMode = true } = {}) {
  await page.addInitScript(
    ({ s, portalMode: pm }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        if (pm) {
          store.setItem('hrm_portal_mode', '1');
        } else {
          store.removeItem('hrm_portal_mode');
        }
      }
    },
    { s: session, portalMode },
  );
}

async function shot(page, id) {
  const path = resolve(SCREEN, `${id}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push(path.replace(/\\/g, '/').split('docs/qa/evidence/')[1] || path);
  return path;
}

function parseRgb(s) {
  const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** slate-500 ≈ rgb(100,116,139); xevn secondary #4B5563 ≈ rgb(75,85,99) */
function isPaleSlate500ish(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // slate-500 ballpark + very light grays
  const slateish =
    r >= 95 && r <= 120 && g >= 110 && g <= 130 && b >= 130 && b <= 155;
  const paleGray = r > 140 && g > 140 && b > 140 && Math.abs(r - g) < 25;
  return slateish || paleGray;
}

function isXevnSecondaryish(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // #4B5563 ± tolerance
  return r >= 60 && r <= 95 && g >= 70 && g <= 105 && b >= 80 && b <= 120;
}

function isPrimaryBlueish(rgb) {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  // #1E40AF ≈ 30,64,175
  return r < 80 && g < 120 && b > 140;
}

function passSurface(id, data, checks) {
  const fails = [];
  for (const c of checks) {
    if (!c.ok) fails.push(c.msg);
  }
  results.surfaces[id] = {
    ...data,
    checks,
    pass: fails.length === 0,
    fails,
  };
  if (fails.length) results.failReasons.push(`${id}: ${fails.join('; ')}`);
}

async function evaluatePort09(page) {
  return page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const primary = (cs.getPropertyValue('--xevn-color-primary') || '').trim().toLowerCase();
    const text = (cs.getPropertyValue('--xevn-color-text') || '').trim().toLowerCase();
    const secondary = (cs.getPropertyValue('--xevn-color-text-secondary') || '').trim().toLowerCase();
    const bodyText = document.body.innerText || '';

    const marketingHero =
      /trust badge|feature chip|White\/70|hero marketing|landing hero/i.test(bodyText) ||
      !!document.querySelector('.xevn-brand-shell .hero, [data-marketing-hero]');

    // purple/indigo gradient classes on quick actions
    const purpleNodes = Array.from(
      document.querySelectorAll('[class*="purple"], [class*="indigo"], [class*="violet"]'),
    ).filter((el) => {
      const c = el.className?.toString?.() || '';
      return /(?:from|to|via|bg|text)-(?:purple|indigo|violet)/i.test(c);
    });

    const honesty = Array.from(document.querySelectorAll('[class*="Alert"], [role="alert"], .border'))
      .map((el) => (el.textContent || '').trim().slice(0, 140))
      .filter((t) => /đồng bộ|EmptyState|chưa có|không có dữ liệu|HOLD|stub|tính năng|đang phát triển/i.test(t))
      .slice(0, 6);

    const labelSamples = Array.from(
      document.querySelectorAll('h1, h2, h3, label, .text-xevn-textSecondary, [class*="text-"]'),
    )
      .slice(0, 40)
      .map((el) => {
        const color = getComputedStyle(el).color;
        return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40), color };
      })
      .filter((x) => x.text.length > 0);

    return {
      url: location.href,
      tokens: { primary, text, secondary },
      marketingHero,
      purpleClassCount: purpleNodes.length,
      purpleSample: purpleNodes.slice(0, 3).map((el) => el.className?.toString?.().slice(0, 80)),
      honestySample: honesty,
      textLen: bodyText.length,
      hasDashboardSignal: /dashboard|tổng quan|nhân sự|HRM|chấm công|lương|tuyển dụng/i.test(bodyText),
      labelSamples: labelSamples.slice(0, 12),
      brandShell: !!document.querySelector('.xevn-brand-shell'),
    };
  });
}

async function evaluatePort10(page) {
  return page.evaluate(() => {
    function parseRgb(s) {
      const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return null;
      return [Number(m[1]), Number(m[2]), Number(m[3])];
    }
    const cs = getComputedStyle(document.documentElement);
    const primary = (cs.getPropertyValue('--xevn-color-primary') || '').trim().toLowerCase();
    const bodyText = document.body.innerText || '';

    const purpleClassEls = Array.from(
      document.querySelectorAll('[class*="purple"], [class*="indigo"], [class*="violet"]'),
    ).filter((el) => {
      const c = el.className?.toString?.() || '';
      return /(?:from|to|via|bg|text)-(?:purple|indigo|violet)/i.test(c);
    });

    // Sample avatar / primary circles
    const avatar = document.querySelector('.rounded-full.bg-xevn-primary, [class*="bg-xevn-primary"].rounded-full');
    let avatarBg = null;
    if (avatar) avatarBg = getComputedStyle(avatar).backgroundColor;

    // Any computed purple-ish fill on KPI-ish cards
    const cardLike = Array.from(document.querySelectorAll('[class*="gradient"], [class*="rounded-2xl"]')).slice(
      0,
      40,
    );
    let purpleFillCount = 0;
    const purpleFillSamples = [];
    for (const el of cardLike) {
      const bg = getComputedStyle(el).backgroundColor;
      const rgb = parseRgb(bg);
      if (rgb) {
        const [r, g, b] = rgb;
        // purple/violet: r and b high, g lower
        if (r > 100 && b > 140 && g < r - 20 && g < b - 20) {
          purpleFillCount += 1;
          if (purpleFillSamples.length < 3) purpleFillSamples.push(bg);
        }
      }
      // also check gradient children absolute layers
      const abs = el.querySelector('.absolute.inset-0');
      if (abs) {
        const cls = abs.className?.toString?.() || '';
        if (/purple|indigo|violet/i.test(cls)) {
          purpleFillCount += 1;
          if (purpleFillSamples.length < 3) purpleFillSamples.push(cls.slice(0, 80));
        }
      }
    }

    const honesty = Array.from(document.querySelectorAll('[class*="Alert"], [role="alert"], .border'))
      .map((el) => (el.textContent || '').trim().slice(0, 160))
      .filter((t) => /KPI|strict|demo|mock|chưa tải|ApiLoad|fallback|ẩn/i.test(t))
      .slice(0, 8);

    const titleOk = /BẢNG ĐIỀU HÀNH|Executive Cockpit|Cockpit/i.test(bodyText);
    const brandShell = !!document.querySelector('.xevn-brand-shell');
    const bodyBg = getComputedStyle(document.body).backgroundColor;

    return {
      url: location.href,
      tokens: { primary },
      titleOk,
      brandShell,
      bodyBg,
      purpleClassCount: purpleClassEls.length,
      purpleClassSample: purpleClassEls.slice(0, 3).map((el) => el.className?.toString?.().slice(0, 90)),
      purpleFillCount,
      purpleFillSamples,
      avatarBg,
      honestySample: honesty,
      textLen: bodyText.length,
      hasPrimaryToken: primary.includes('1e40af'),
    };
  });
}

async function evaluateCcSettings(page) {
  return page.evaluate(() => {
    function parseRgb(s) {
      const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return null;
      return [Number(m[1]), Number(m[2]), Number(m[3])];
    }
    const ths = Array.from(document.querySelectorAll('th'));
    const thColors = ths.slice(0, 20).map((th) => {
      const color = getComputedStyle(th).color;
      const cls = th.className?.toString?.() || '';
      return {
        text: (th.textContent || '').trim().slice(0, 40),
        color,
        rgb: parseRgb(color),
        hasXevnSecondaryClass: /text-xevn-textSecondary/.test(cls),
        hasSlate500Class: /text-slate-500/.test(cls),
      };
    });
    const bodyText = document.body.innerText || '';
    return {
      url: location.href,
      thCount: ths.length,
      thColors,
      hasLegalTable: /Tên pháp nhân|Mã|pháp nhân/i.test(bodyText),
      textLen: bodyText.length,
      slate500ClassCount: thColors.filter((t) => t.hasSlate500Class).length,
      xevnSecondaryClassCount: thColors.filter((t) => t.hasXevnSecondaryClass).length,
    };
  });
}

async function evaluateAppHeader(page) {
  return page.evaluate(() => {
    function parseRgb(s) {
      const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return null;
      return [Number(m[1]), Number(m[2]), Number(m[3])];
    }
    const header = document.querySelector('header');
    if (!header) {
      return { found: false };
    }
    const mutedIcons = Array.from(
      header.querySelectorAll('[class*="text-xevn-textMuted"], [class*="text-muted"]'),
    ).slice(0, 8);
    const secondaryLabels = Array.from(
      header.querySelectorAll('[class*="text-xevn-textSecondary"]'),
    ).slice(0, 8);

    const iconSamples = mutedIcons.map((el) => ({
      cls: (el.className?.toString?.() || '').slice(0, 80),
      color: getComputedStyle(el).color,
      rgb: parseRgb(getComputedStyle(el).color),
    }));
    const labelSamples = secondaryLabels.map((el) => ({
      text: (el.textContent || '').trim().slice(0, 40),
      color: getComputedStyle(el).color,
      rgb: parseRgb(getComputedStyle(el).color),
    }));

    const headerCls = header.className?.toString?.() || '';
    const membershipSignal =
      /XeVN|Tập đoàn|CEO|pháp nhân|Công ty/i.test(header.innerText || '') ||
      secondaryLabels.some((el) => /ceo|role|company/i.test(el.textContent || ''));

    return {
      found: true,
      headerHasXevnSurface: /bg-xevn-surface|border-xevn-border/.test(headerCls),
      mutedIconCount: mutedIcons.length,
      secondaryLabelCount: secondaryLabels.length,
      iconSamples,
      labelSamples,
      membershipSignal,
      hasMutedForegroundClass: !!header.querySelector('[class*="text-muted-foreground"]'),
    };
  });
}

async function main() {
  await probeL0();
  const l0Ok =
    results.l0.hrm === 200 && results.l0.xbos === 200 && results.l0.portal === 200;
  if (!l0Ok) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push(`L0 down: ${JSON.stringify(results.l0)}`);
    results.endedAt = new Date().toISOString();
    save();
    console.error('BLOCKED L0', results.l0);
    process.exit(2);
  }

  const session = await loginApi();
  results.login = { http: session.http, persona: EMAIL, companyId: 'main' };
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  const attachListeners = (page) => {
    page.on('console', (msg) => {
      const t = msg.text();
      if (msg.type() === 'error' && !/favicon|React DevTools|Download the React/i.test(t)) {
        results.consoleErrors.push(t.slice(0, 400));
      }
    });
    page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 400)));
  };

  // ---- PORT-09 HRM Index standalone (ops-dense, AppHeader co-located) ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachListeners(page);
    await injectPortalAuth(page, session, { portalMode: false });
    await page.goto(`${HRM_STANDALONE}/hr/`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await sleep(3500);
    await shot(page, 'PORT-09-hrm-index');
    const data09 = await evaluatePort09(page);
    const header = await evaluateAppHeader(page);
    await shot(page, 'PORT-09-appheader');

    const primaryOk =
      !data09.tokens.primary ||
      data09.tokens.primary.includes('1e40af') ||
      data09.tokens.primary.includes('#1e40af');

    passSurface('PORT-09', data09, [
      { ok: data09.textLen > 40, msg: 'HRM index empty' },
      { ok: data09.hasDashboardSignal || data09.textLen > 80, msg: 'dashboard signal weak' },
      { ok: !data09.marketingHero, msg: 'marketing hero invent detected' },
      { ok: !data09.brandShell, msg: 'dark brand shell on ops index (dual-surface break)' },
      { ok: data09.purpleClassCount === 0, msg: `purple/indigo classes ${data09.purpleClassCount}` },
      { ok: primaryOk, msg: `primary token ${data09.tokens.primary}` },
    ]);

    const iconOk =
      header.found &&
      (header.mutedIconCount > 0 || header.secondaryLabelCount > 0) &&
      !header.hasMutedForegroundClass;
    const iconColorsSharp =
      !header.iconSamples?.length ||
      header.iconSamples.every((s) => {
        const rgb = s.rgb;
        if (!rgb) return true;
        // not ultra-pale
        return !(rgb[0] > 160 && rgb[1] > 160 && rgb[2] > 160);
      });

    passSurface('AppHeader', header, [
      { ok: !!header.found, msg: 'header not found' },
      { ok: iconOk, msg: 'muted icons/labels not on xevn tokens' },
      { ok: iconColorsSharp, msg: 'header icon colors still pale' },
      {
        ok: header.headerHasXevnSurface || header.secondaryLabelCount > 0,
        msg: 'header missing xevn surface/secondary',
      },
    ]);
    results.surfaces.AppHeader.honestyNote = 'membership labels kept (must_keep)';
    await page.close();
  }

  // ---- PORT-10 Executive Cockpit ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachListeners(page);
    await injectPortalAuth(page, session);
    await page.goto(`${PORTAL}/cockpit`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(3500);
    await shot(page, 'PORT-10-cockpit');
    const data10 = await evaluatePort10(page);

    const avatarRgb = parseRgb(data10.avatarBg || '');
    const avatarPrimaryOk = !avatarRgb || isPrimaryBlueish(avatarRgb);

    passSurface('PORT-10', data10, [
      { ok: data10.titleOk || data10.textLen > 80, msg: 'cockpit not recognizable' },
      { ok: !data10.brandShell, msg: 'dark brand shell on cockpit ops' },
      { ok: data10.hasPrimaryToken || !!data10.tokens.primary?.includes('1e40af'), msg: 'primary not #1E40AF' },
      { ok: data10.purpleClassCount === 0, msg: `purple/indigo KPI classes ${data10.purpleClassCount}` },
      { ok: data10.purpleFillCount === 0, msg: `purple fill KPI ${data10.purpleFillCount}` },
      { ok: avatarPrimaryOk, msg: `avatar not primary blue: ${data10.avatarBg}` },
      {
        ok: (data10.honestySample || []).length > 0,
        msg: 'ApiLoadBanner / honesty banners not visible',
      },
    ]);
    await page.close();
  }

  // ---- CC settings tables (Đơn vị thành viên) ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachListeners(page);
    await injectPortalAuth(page, session);
    await page.goto(`${PORTAL}/command-center?settings=company_member_units`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await sleep(4000);
    await shot(page, 'CC-settings-member-units-table');
    const dataCc = await evaluateCcSettings(page);

    const paleTh = (dataCc.thColors || []).filter((t) => isPaleSlate500ish(t.rgb));
    const sharpTh = (dataCc.thColors || []).filter(
      (t) => t.hasXevnSecondaryClass || isXevnSecondaryish(t.rgb),
    );

    passSurface('CC-settings-tables', dataCc, [
      { ok: dataCc.thCount > 0, msg: 'no table headers found' },
      { ok: dataCc.hasLegalTable || dataCc.thCount >= 3, msg: 'legal entity settings table not visible' },
      { ok: dataCc.slate500ClassCount === 0, msg: `th still text-slate-500 ×${dataCc.slate500ClassCount}` },
      {
        ok: paleTh.length === 0,
        msg: `pale/slate-500ish th colors: ${paleTh.map((t) => t.color).join(',')}`,
      },
      {
        ok: sharpTh.length >= Math.min(3, dataCc.thCount),
        msg: `insufficient sharp secondary headers (${sharpTh.length}/${dataCc.thCount})`,
      },
    ]);
    results.surfaces['CC-settings-tables'].paleTh = paleTh;
    results.surfaces['CC-settings-tables'].sharpThCount = sharpTh.length;
    await page.close();
  }

  await browser.close();

  const surfaceFails = Object.entries(results.surfaces)
    .filter(([, v]) => v && v.pass === false)
    .map(([k]) => k);

  results.endedAt = new Date().toISOString();
  if (surfaceFails.length || results.failReasons.length) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
  } else {
    results.verdict = 'PASS';
    results.ack_status = 'PASS_TO_PM';
  }
  results.pageErrorCount = results.pageErrors.length;
  save();

  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        failReasons: results.failReasons,
        surfaces: Object.fromEntries(
          Object.entries(results.surfaces).map(([k, v]) => [k, { pass: v.pass, fails: v.fails }]),
        ),
        screenshots: results.screenshots,
        l0: results.l0,
        commit: COMMIT,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'ERROR';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e?.stack || e).slice(0, 800));
  results.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
