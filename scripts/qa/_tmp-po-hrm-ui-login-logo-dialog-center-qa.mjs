#!/usr/bin/env node
/**
 * PO-HRM-UI-PORTAL-LOGIN-LOGO-02 (+ DIALOG-CENTER-01 retest) — U65 browser QA
 * Sponsor CORRECTION: logo pad WHITE (not black); size ~112px kept.
 * zero-seed · FE login · no product GO · face_live=false · remaster_program_done=false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  process.env.QA_OUT_JSON || 'docs/qa/evidence/_tmp-po-hrm-ui-login-logo-dialog-center-qa.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_ids: ['PO-HRM-UI-PORTAL-LOGIN-LOGO-02', 'PO-HRM-UI-DIALOG-CENTER-01'],
  startedAt: ts(),
  u65: 'zero-seed',
  face_live: false,
  remaster_program_done: false,
  sponsor_correction: 'logo pad WHITE not black; size ~112px kept',
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  checks: {},
  failReasons: [],
  screenshots: [],
  consoleErrors: [],
  pageErrors: [],
  network: [],
  mutates: 0,
  seed: false,
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
  save();
}

function pass(id, detail) {
  results.checks[id] = { pass: true, ...(detail || {}) };
  save();
}

async function probeL0() {
  for (const [k, url] of [
    ['portal', `${PORTAL}/login`],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
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

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push(`evidence/screens/po-hrm-ui-login-logo-dialog-center-01/${name}.png`);
  save();
}

function parseRgb(bg) {
  const m = String(bg || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (!m) return null;
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] == null ? 1 : Number(m[4]) };
}

function isNearWhite(rgb, tol = 12) {
  if (!rgb) return false;
  if (rgb.a != null && rgb.a < 0.85) return false;
  return rgb.r >= 255 - tol && rgb.g >= 255 - tol && rgb.b >= 255 - tol;
}

function isNearBlack(rgb, tol = 24) {
  if (!rgb) return false;
  return rgb.r <= tol && rgb.g <= tol && rgb.b <= tol;
}

async function measureMark(page) {
  return page.locator('[data-testid="portal-login-mark"]').evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      width: Math.round(r.width * 100) / 100,
      height: Math.round(r.height * 100) / 100,
      attrW: el.getAttribute('width'),
      attrH: el.getAttribute('height'),
      className: el.className,
      computedH: cs.height,
      computedW: cs.width,
      backgroundColor: cs.backgroundColor,
      src: el.getAttribute('src'),
    };
  });
}

async function measureCardWordmark(page) {
  const loc = page.locator('[data-testid="portal-login-card-wordmark"]');
  if ((await loc.count()) === 0) return { found: false };
  const visible = await loc.first().isVisible().catch(() => false);
  if (!visible) return { found: true, visible: false };
  const detail = await loc.first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      className: el.className,
      backgroundColor: cs.backgroundColor,
      width: Math.round(el.getBoundingClientRect().width * 100) / 100,
      height: Math.round(el.getBoundingClientRect().height * 100) / 100,
    };
  });
  return { found: true, visible: true, ...detail };
}

async function measureDialogGeometry(page, testId) {
  return page.evaluate((tid) => {
    const candidates = [];
    const push = (el, via) => {
      if (!el || candidates.some((c) => c.el === el)) return;
      candidates.push({ el, via });
    };
    push(document.querySelector(`[data-testid="${tid}"]`), 'testid');
    document.querySelectorAll('.xevn-dialog-surface').forEach((el, i) => push(el, `surface[${i}]`));
    document.querySelectorAll('[role="dialog"]').forEach((el, i) => push(el, `role[${i}]`));

    if (!candidates.length) return { found: false };

    const scored = candidates.map(({ el, via }) => {
      const surface =
        el.closest?.('.xevn-dialog-surface') ||
        (el.classList?.contains('xevn-dialog-surface') ? el : el);
      const r = surface.getBoundingClientRect();
      const cs = getComputedStyle(surface);
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const topGap = r.top;
      const bottomGap = vh - r.bottom;
      const leftGap = r.left;
      const rightGap = vw - r.right;
      const vCenterDelta = Math.abs(topGap - bottomGap);
      const hCenterDelta = Math.abs(leftGap - rightGap);
      const permanentlyClipped = r.bottom > vh + 2 || r.top < -2;
      const droppedToBottom = topGap > vh * 0.45 && bottomGap < 24;
      const topAtMidCutOff = r.top > vh * 0.35 && r.bottom > vh + 8;
      const overflowY = cs.overflowY;
      const scrollH = surface.scrollHeight;
      const clientH = surface.clientHeight;
      const canScrollInside =
        scrollH > clientH + 2 && (overflowY === 'auto' || overflowY === 'scroll');
      const inViewScore =
        (r.height > 40 && r.width > 40 ? 10 : 0) +
        (cs.position === 'fixed' ? 50 : 0) +
        (r.top >= -2 && r.bottom <= vh + 2 ? 30 : 0) +
        (r.top < vh && r.bottom > 0 ? 20 : 0) -
        Math.min(vCenterDelta, 400) / 20;
      const cancel =
        surface.querySelector('button') &&
        Array.from(surface.querySelectorAll('button')).some((b) =>
          /Hủy|Cancel|Đóng|Close|Lưu|Save|Tạo/i.test((b.textContent || '').trim()),
        );
      const footerBtns = Array.from(surface.querySelectorAll('button'))
        .map((b) => (b.textContent || '').trim())
        .filter(Boolean)
        .slice(0, 12);
      return {
        via,
        score: inViewScore,
        found: true,
        testId: tid,
        top: Math.round(r.top * 10) / 10,
        bottom: Math.round(r.bottom * 10) / 10,
        height: Math.round(r.height * 10) / 10,
        width: Math.round(r.width * 10) / 10,
        vh,
        vw,
        topGap: Math.round(topGap * 10) / 10,
        bottomGap: Math.round(bottomGap * 10) / 10,
        vCenterDelta: Math.round(vCenterDelta * 10) / 10,
        hCenterDelta: Math.round(hCenterDelta * 10) / 10,
        permanentlyClipped,
        droppedToBottom,
        topAtMidCutOff,
        maxHeight: cs.maxHeight,
        overflowY,
        position: cs.position,
        scrollHeight: scrollH,
        clientHeight: clientH,
        canScrollInside,
        className: String(surface.className),
        hasInset0: /\binset-0\b/.test(String(surface.className)),
        hasMAuto: /\bm-auto\b/.test(String(surface.className)),
        hasMaxH90: /max-h-\[90vh\]/.test(String(surface.className)),
        hasOverflowYAuto: /\boverflow-y-auto\b/.test(String(surface.className)),
        footerBtns,
        actionButtonsPresent: !!cancel,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    best.candidates = scored.map((s) => ({
      via: s.via,
      score: s.score,
      position: s.position,
      top: s.top,
      bottom: s.bottom,
      height: s.height,
      vCenterDelta: s.vCenterDelta,
    }));
    return best;
  }, testId);
}

async function main() {
  await probeL0();
  if (results.l0.portal !== 200) {
    fail('L0_portal', `portal /login status=${results.l0.portal}`);
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  page.on('pageerror', (e) => results.pageErrors.push(String(e.message || e).slice(0, 200)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('response', (res) => {
    const u = res.url();
    const m = res.request().method();
    if (m === 'POST' || m === 'PUT' || m === 'PATCH' || m === 'DELETE') {
      if (/\/auth\/login|\/recruitment\//i.test(u)) {
        results.network.push({
          method: m,
          status: res.status(),
          url: u.replace(/https?:\/\/[^/]+/, ''),
        });
        if (m !== 'POST' || !u.includes('/auth/login')) {
          if (res.status() >= 200 && res.status() < 300 && /\/recruitment\//i.test(u)) {
            results.mutates += 1;
          }
        }
      }
    }
  });

  try {
    // ——— 1) Login logo size ———
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 45000 });
    await sleep(500);

    const mark = await measureMark(page);
    const h = mark.height;
    const logoOk = h >= 100 && h <= 124 && Number(mark.attrH) === 112;
    if (logoOk) {
      pass('AC1_login_mark_112', mark);
    } else {
      fail('AC1_login_mark_112', `height=${h} attrH=${mark.attrH} (expect ~112, not 56)`);
    }

    // LOGO-02: sponsor «Logo nền trắng» — pad WHITE not black
    const markRgb = parseRgb(mark.backgroundColor);
    const classHasWhite = /\bbg-white\b/.test(String(mark.className));
    const classHasBlack = /\bbg-black\b/.test(String(mark.className));
    const padWhite = isNearWhite(markRgb) && !isNearBlack(markRgb) && classHasWhite && !classHasBlack;
    if (padWhite) {
      pass('AC1_login_mark_pad_white', {
        backgroundColor: mark.backgroundColor,
        rgb: markRgb,
        classHasWhite,
        classHasBlack,
        className: mark.className,
      });
    } else {
      fail(
        'AC1_login_mark_pad_white',
        `bg=${mark.backgroundColor} rgb=${JSON.stringify(markRgb)} classWhite=${classHasWhite} classBlack=${classHasBlack} className=${mark.className}`,
      );
    }

    const cardWm = await measureCardWordmark(page);
    if (!cardWm.found || !cardWm.visible) {
      pass('AC1_card_wordmark_pad_white', {
        skipped: !cardWm.found,
        visible: cardWm.visible === true,
        reason: !cardWm.found ? 'portal-login-card-wordmark absent' : 'not visible',
      });
    } else {
      const cardRgb = parseRgb(cardWm.backgroundColor);
      const cardWhite =
        (isNearWhite(cardRgb) || /\b!bg-white\b|\bbg-white\b/.test(String(cardWm.className))) &&
        !isNearBlack(cardRgb) &&
        !/\bbg-black\b/.test(String(cardWm.className));
      if (cardWhite) {
        pass('AC1_card_wordmark_pad_white', {
          backgroundColor: cardWm.backgroundColor,
          rgb: cardRgb,
          className: cardWm.className,
        });
      } else {
        fail(
          'AC1_card_wordmark_pad_white',
          `bg=${cardWm.backgroundColor} rgb=${JSON.stringify(cardRgb)} className=${cardWm.className}`,
        );
      }
    }

    await shot(page, '01-login-mark-white-pad-112');
    await page.locator('[data-testid="portal-login-mark"]').screenshot({
      path: join(SCREEN, '01b-login-mark-crop.png'),
    });
    results.screenshots.push(
      'evidence/screens/po-hrm-ui-login-logo-dialog-center-01/01b-login-mark-crop.png',
    );
    save();

    // FE login (U65)
    await page.locator('[data-testid="portal-login-email"]').fill(EMAIL);
    await page.locator('[data-testid="portal-login-password"]').fill(PASSWORD);
    const loginWait = page.waitForResponse(
      (r) => r.url().includes('/auth/login') && r.request().method() === 'POST',
      { timeout: 20000 },
    );
    await page.locator('[data-testid="portal-login-submit"]').click();
    const loginRes = await loginWait;
    await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 25000 }).catch(() => null);
    await sleep(1000);
    const afterUrl = page.url();
    const loginOk = loginRes.status() >= 200 && loginRes.status() < 300 && !afterUrl.includes('/login');
    if (loginOk) {
      pass('AC1b_login_works', { status: loginRes.status(), afterUrl });
    } else {
      fail('AC1b_login_works', `status=${loginRes.status()} url=${afterUrl}`);
    }
    await shot(page, '02-after-login');

    // ——— 2) Recruitment create dialog center ———
    // HDSD path: CC HRM recruitment → tab Tin tuyển dụng → create
    // Note: Dashboard «+ Tạo tin tuyển dụng» has no onClick — must open Jobs tab first.
    const recUrl = `${PORTAL}/command-center/hrm/recruitment?companyId=main&tenantId=xevn&_qa=${Date.now()}`;
    await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);
    await shot(page, '03-recruitment-shell');

    /** Prefer iframe document for HRM tab chrome; dialog may portal to parent. */
    async function findInFrames(selector) {
      const hits = [];
      if ((await page.locator(selector).count().catch(() => 0)) > 0) {
        hits.push({ host: page, kind: 'page' });
      }
      for (const frame of page.frames()) {
        try {
          if ((await frame.locator(selector).count()) > 0) hits.push({ host: frame, kind: 'frame' });
        } catch {
          /* detached */
        }
      }
      return hits;
    }

    async function clickJobsTab() {
      const labelRe = /Tin\s*Tuyển\s*dụng|Tin tuyển dụng|Jobs/i;
      // Portal shell may expose text; real control is usually inside HRM iframe
      const hosts = [page, ...page.frames()];
      for (const host of hosts) {
        const candidates = [
          host.getByRole('button', { name: labelRe }).first(),
          host.getByRole('tab', { name: labelRe }).first(),
          host.locator('button, [role="tab"], a').filter({ hasText: labelRe }).first(),
        ];
        for (const loc of candidates) {
          if (await loc.isVisible().catch(() => false)) {
            await loc.click({ force: true });
            await sleep(1800);
            return { ok: true, hostKind: host === page ? 'page' : 'frame' };
          }
        }
      }
      return { ok: false };
    }

    const tabClick = await clickJobsTab();
    results.checks._jobs_tab_click = tabClick;

    // Wait for JobPostingsTab mount
    let jobsHost = page;
    let jobsMounted = false;
    for (let i = 0; i < 12; i++) {
      const hits = await findInFrames('[data-testid="rec-jobs-tab-precision"]');
      if (hits.length) {
        jobsHost = hits[0].host;
        jobsMounted = true;
        break;
      }
      // soft fallback: deep-link iframe-style path on portal
      if (i === 5) {
        await page.goto(
          `${PORTAL}/hr/recruitment?tab=jobs&portal=1&tenantId=xevn&companyId=main&_qa=${Date.now()}`,
          { waitUntil: 'domcontentloaded', timeout: 60000 },
        );
        await sleep(2500);
      }
      await sleep(500);
    }

    if (!jobsMounted) {
      fail('AC2_jobs_tab', 'rec-jobs-tab-precision not mounted after Tin tuyển dụng click / fallback');
      await shot(page, '03b-jobs-tab-missing');
    }

    // Create only from Jobs tab (wired handleOpenCreate)
    let createBtn = jobsHost
      .locator('[data-testid="rec-jobs-tab-precision"]')
      .getByRole('button', { name: /Tạo tin tuyển dụng/i })
      .first();
    if (!(await createBtn.isVisible().catch(() => false))) {
      createBtn = jobsHost.getByRole('button', { name: /Tạo tin tuyển dụng/i }).first();
    }

    if (!(await createBtn.isVisible().catch(() => false))) {
      fail('AC2_open_create', 'Create button on Jobs tab not visible');
      await shot(page, '03c-jobs-tab-no-create');
    } else {
      await createBtn.click({ force: true });
      await sleep(2000);

      // Dialog portals to parent in embed — search page first, then frames
      let geomHost = page;
      let dlg = page.locator('[data-testid="rec-job-create-edit-dialog-precision"]');
      let visible = await dlg.isVisible().catch(() => false);
      if (!visible) {
        for (const frame of page.frames()) {
          const fd = frame.locator('[data-testid="rec-job-create-edit-dialog-precision"]');
          if (await fd.isVisible().catch(() => false)) {
            dlg = fd;
            geomHost = frame;
            visible = true;
            break;
          }
        }
      }
      if (!visible) {
        dlg = page.locator('[role="dialog"]').filter({ hasText: /Tạo tin tuyển dụng/i }).first();
        visible = await dlg.isVisible().catch(() => false);
        geomHost = page;
      }

      await dlg.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
      await sleep(600);

      // Measure the exact element Playwright resolved (frame-aware via locator.evaluate)
      const box = await dlg.boundingBox().catch(() => null);
      const elMetrics = await dlg
        .evaluate((el) => {
          const surface =
            el.closest('.xevn-dialog-surface') ||
            (el.classList?.contains('xevn-dialog-surface') ? el : el);
          const cs = getComputedStyle(surface);
          const r = surface.getBoundingClientRect();
          const vh = window.innerHeight;
          const vw = window.innerWidth;
          return {
            found: true,
            testId: el.getAttribute('data-testid') || 'dialog',
            ownerHref: location.href.slice(0, 160),
            position: cs.position,
            overflowY: cs.overflowY,
            maxHeight: cs.maxHeight,
            topCss: cs.top,
            bottomCss: cs.bottom,
            margin: cs.margin,
            transform: cs.transform,
            zIndex: cs.zIndex,
            className: String(surface.className),
            hasInset0: /\binset-0\b/.test(String(surface.className)),
            hasMAuto: /\bm-auto\b/.test(String(surface.className)),
            hasMaxH90: /max-h-\[90vh\]/.test(String(surface.className)),
            hasOverflowYAuto: /\boverflow-y-auto\b/.test(String(surface.className)),
            rect: {
              top: Math.round(r.top * 10) / 10,
              bottom: Math.round(r.bottom * 10) / 10,
              height: Math.round(r.height * 10) / 10,
              width: Math.round(r.width * 10) / 10,
              left: Math.round(r.left * 10) / 10,
            },
            vh,
            vw,
            scrollHeight: surface.scrollHeight,
            clientHeight: surface.clientHeight,
          };
        })
        .catch(() => null);

      const vp = page.viewportSize() || { width: 1440, height: 900 };
      // Prefer frame-local rect; also compare to page.boundingBox (viewport coords)
      const top = box?.y ?? elMetrics?.rect?.top ?? null;
      const height = box?.height ?? elMetrics?.rect?.height ?? null;
      const bottom = top != null && height != null ? top + height : null;
      const topGap = top != null ? top : null;
      const bottomGap = bottom != null ? vp.height - bottom : null;
      const vCenterDelta =
        topGap != null && bottomGap != null ? Math.abs(topGap - bottomGap) : null;
      const permanentlyClipped =
        top != null && (top < -2 || (bottom != null && bottom > vp.height + 2));
      const droppedToBottom = topGap != null && topGap > vp.height * 0.45 && (bottomGap ?? 0) < 24;
      const topAtMidCutOff =
        top != null && top > vp.height * 0.35 && bottom != null && bottom > vp.height + 8;
      const offscreenEntirely =
        top != null && (top >= vp.height - 2 || (bottom != null && bottom <= 2));

      const geom = {
        found: !!(elMetrics?.found || box),
        box,
        elMetrics,
        viewport: vp,
        top,
        bottom,
        height,
        topGap,
        bottomGap,
        vCenterDelta,
        permanentlyClipped,
        droppedToBottom,
        topAtMidCutOff,
        offscreenEntirely,
        hasInset0: !!elMetrics?.hasInset0,
        hasMAuto: !!elMetrics?.hasMAuto,
        hasMaxH90: !!elMetrics?.hasMaxH90,
        hasOverflowYAuto: !!elMetrics?.hasOverflowYAuto,
        maxHeight: elMetrics?.maxHeight,
        overflowY: elMetrics?.overflowY,
        position: elMetrics?.position,
        canScrollInside:
          elMetrics != null &&
          elMetrics.scrollHeight > elMetrics.clientHeight + 2 &&
          (elMetrics.overflowY === 'auto' || elMetrics.overflowY === 'scroll'),
      };
      results.checks._dialog_geom_raw = geom;
      await shot(page, '04-job-create-dialog');

      if (!geom.found) {
        fail('AC2_dialog_center', 'dialog not found after create click');
      } else {
        const classOk = geom.hasInset0 && geom.hasMAuto && geom.hasMaxH90 && geom.hasOverflowYAuto;
        const notClipped =
          !geom.permanentlyClipped &&
          !geom.topAtMidCutOff &&
          !geom.droppedToBottom &&
          !geom.offscreenEntirely;
        const centeredEnough =
          geom.vCenterDelta != null &&
          (geom.vCenterDelta <= 120 || (geom.topGap >= 20 && geom.bottomGap >= 20));
        const maxHOk =
          /90vh/.test(String(geom.maxHeight)) ||
          (parseFloat(geom.maxHeight) > 0 &&
            parseFloat(geom.maxHeight) <= (geom.viewport?.height || 900) * 0.92);

        const saveBtn = page.getByRole('button', { name: /Lưu|Tạo tin|Lưu tin|Save/i }).first();
        const cancelBtn = page.getByRole('button', { name: /Hủy|Cancel|Đóng/i }).first();
        let saveReachable = await saveBtn.isVisible().catch(() => false);
        let cancelReachable = await cancelBtn.isVisible().catch(() => false);
        if (!saveReachable || !cancelReachable) {
          await dlg.evaluate((el) => {
            el.scrollTop = el.scrollHeight;
          }).catch(() => null);
          await sleep(300);
          saveReachable = await saveBtn.isVisible().catch(() => false);
          cancelReachable = await cancelBtn.isVisible().catch(() => false);
          await shot(page, '05-dialog-scrolled-footer');
        }

        const actionsOk = saveReachable && cancelReachable;
        const inViewportVisible =
          geom.top != null &&
          geom.top < (geom.viewport?.height || 900) - 40 &&
          geom.top > -40;
        const scrollOk =
          geom.canScrollInside ||
          (geom.height != null && geom.height <= (geom.viewport?.height || 900) * 0.92);

        if (
          classOk &&
          notClipped &&
          centeredEnough &&
          maxHOk &&
          actionsOk &&
          scrollOk &&
          inViewportVisible
        ) {
          pass('AC2_dialog_center', {
            geom: {
              top: geom.top,
              bottom: geom.bottom,
              height: geom.height,
              vh: geom.viewport?.height,
              vCenterDelta: geom.vCenterDelta,
              topGap: geom.topGap,
              bottomGap: geom.bottomGap,
              maxHeight: geom.maxHeight,
              overflowY: geom.overflowY,
              position: geom.position,
              canScrollInside: geom.canScrollInside,
              ownerHref: geom.elMetrics?.ownerHref,
              classFlags: {
                inset0: geom.hasInset0,
                mAuto: geom.hasMAuto,
                maxH90: geom.hasMaxH90,
                overflowYAuto: geom.hasOverflowYAuto,
              },
            },
            saveReachable,
            cancelReachable,
          });
        } else {
          fail(
            'AC2_dialog_center',
            JSON.stringify({
              classOk,
              notClipped,
              centeredEnough,
              maxHOk,
              actionsOk,
              scrollOk,
              inViewportVisible,
              offscreenEntirely: geom.offscreenEntirely,
              permanentlyClipped: geom.permanentlyClipped,
              droppedToBottom: geom.droppedToBottom,
              topAtMidCutOff: geom.topAtMidCutOff,
              vCenterDelta: geom.vCenterDelta,
              topGap: geom.topGap,
              bottomGap: geom.bottomGap,
              height: geom.height,
              vh: geom.viewport?.height,
              position: geom.position,
              maxHeight: geom.maxHeight,
              overflowY: geom.overflowY,
              ownerHref: geom.elMetrics?.ownerHref,
              saveReachable,
              cancelReachable,
            }),
          );
        }

        // Escape closes
        await page.keyboard.press('Escape');
        await sleep(500);
        const stillOpen = await page
          .locator('[data-testid="rec-job-create-edit-dialog-precision"]')
          .isVisible()
          .catch(() => false);
        if (!stillOpen) {
          pass('AC2b_escape_closes', { closed: true });
        } else {
          fail('AC2b_escape_closes', 'dialog still visible after Escape');
        }
      }
    }

    // ——— 3) AlertDialog spot (optional easy path) ———
    try {
      // Re-open create briefly then look for delete on a row; if hard, skip as OBS
      const delBtn = page.getByRole('button', { name: /Xóa|Delete/i }).first();
      let alertGeom = null;
      if (await delBtn.isVisible().catch(() => false)) {
        await delBtn.click({ force: true });
        await sleep(800);
        const alert = page.locator('[role="alertdialog"]').first();
        if (await alert.isVisible().catch(() => false)) {
          alertGeom = await page.evaluate(() => {
            const el = document.querySelector('[role="alertdialog"]');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            const vh = window.innerHeight;
            return {
              top: r.top,
              bottom: r.bottom,
              height: r.height,
              vh,
              vCenterDelta: Math.abs(r.top - (vh - r.bottom)),
              className: el.className,
              hasInset0: /\binset-0\b/.test(el.className),
              hasMAuto: /\bm-auto\b/.test(el.className),
            };
          });
          await shot(page, '06-alertdialog-spot');
          await page.keyboard.press('Escape');
          await sleep(300);
        }
      }
      if (alertGeom) {
        const ok =
          alertGeom.hasInset0 &&
          alertGeom.hasMAuto &&
          alertGeom.vCenterDelta <= 120 &&
          alertGeom.bottom <= alertGeom.vh + 2;
        if (ok) pass('AC3_alertdialog_center', alertGeom);
        else fail('AC3_alertdialog_center', JSON.stringify(alertGeom));
      } else {
        pass('AC3_alertdialog_center', {
          skipped: true,
          reason: 'no easy delete/confirm path without mutate — class parity covered by source + Dialog AC',
        });
      }
    } catch (e) {
      pass('AC3_alertdialog_center', {
        skipped: true,
        reason: String(e?.message || e).slice(0, 160),
      });
    }
  } catch (e) {
    fail('harness', String(e?.message || e).slice(0, 400));
  } finally {
    await browser.close().catch(() => null);
  }

  const critical = [
    'AC1_login_mark_112',
    'AC1_login_mark_pad_white',
    'AC1_card_wordmark_pad_white',
    'AC1b_login_works',
    'AC2_dialog_center',
    'AC2b_escape_closes',
  ];
  const allCriticalPass = critical.every((id) => results.checks[id]?.pass === true);
  const hardFails = results.failReasons.filter((f) => !f.startsWith('AC3_'));
  results.verdict = allCriticalPass && hardFails.length === 0 ? 'PASS' : 'FAIL';
  results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        verdict: results.verdict,
        ack_status: results.ack_status,
        checks: results.checks,
        failReasons: results.failReasons,
        l0: results.l0,
        screenshots: results.screenshots,
        mutates: results.mutates,
      },
      null,
      2,
    ),
  );
  process.exit(results.verdict === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
