/**
 * PO-HRM-UI-DIALOG-CENTER-01-R2 — QA formal U65 retest (independent of Dev probe)
 * Matrix: Jobs create dialog — center + position:fixed + scroll inside + Save/Cancel + Escape
 * Locks: zero-seed · mutates=0 · no LOGO-02
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-dialog-center-01-r2-qa.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const result = {
  work_item_id: 'PO-HRM-UI-DIALOG-CENTER-01-R2',
  role: 'qa',
  startedAt: new Date().toISOString(),
  portal: PORTAL,
  account: EMAIL,
  mutates: 0,
  locks: {
    face_live: false,
    remaster_program_done: false,
    no_seed: true,
    creative_extra: 'none',
  },
  checks: {},
  failReasons: [],
  screenshots: [],
  verdict: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(result, null, 2));
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

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
    await sleep(1000);
    result.checks.login = { pass: true };

    const recUrl = `${PORTAL}/command-center/hrm/recruitment?companyId=main&tenantId=xevn&_qa=${Date.now()}`;
    await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(4000);

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

    const labelRe = /Tin\s*Tuyển\s*dụng|Tin tuyển dụng|Jobs/i;
    let tabOk = false;
    for (const host of [page, ...page.frames()]) {
      const candidates = [
        host.getByRole('button', { name: labelRe }).first(),
        host.getByRole('tab', { name: labelRe }).first(),
        host.locator('button, [role="tab"], a').filter({ hasText: labelRe }).first(),
      ];
      for (const loc of candidates) {
        if (await loc.isVisible().catch(() => false)) {
          await loc.click({ force: true });
          await sleep(1800);
          tabOk = true;
          break;
        }
      }
      if (tabOk) break;
    }
    result.checks.jobs_tab_click = { pass: tabOk };
    if (!tabOk) result.failReasons.push('Jobs / Tin tuyển dụng tab not clicked');

    let jobsHost = page;
    let jobsMounted = false;
    for (let i = 0; i < 12; i++) {
      const hits = await findInFrames('[data-testid="rec-jobs-tab-precision"]');
      if (hits.length) {
        jobsHost = hits[0].host;
        jobsMounted = true;
        break;
      }
      if (i === 5) {
        await page.goto(
          `${PORTAL}/hr/recruitment?tab=jobs&portal=1&tenantId=xevn&companyId=main&_qa=${Date.now()}`,
          { waitUntil: 'domcontentloaded', timeout: 60000 },
        );
        await sleep(2500);
      }
      await sleep(500);
    }
    result.checks.jobs_tab_mounted = { pass: jobsMounted };
    if (!jobsMounted) result.failReasons.push('jobs tab not mounted');

    let createBtn = jobsHost
      .locator('[data-testid="rec-jobs-tab-precision"]')
      .getByRole('button', { name: /Tạo tin tuyển dụng/i })
      .first();
    if (!(await createBtn.isVisible().catch(() => false))) {
      createBtn = jobsHost.getByRole('button', { name: /Tạo tin tuyển dụng/i }).first();
    }

    const createVisible = await createBtn.isVisible().catch(() => false);
    result.checks.open_click = { pass: createVisible };
    if (!createVisible) {
      result.failReasons.push('create button not visible on Jobs tab');
    } else {
      await createBtn.click({ force: true });
      await sleep(2000);
    }

    let dlg = page.locator('[data-testid="rec-job-create-edit-dialog-precision"]');
    let visible = await dlg.isVisible().catch(() => false);
    if (!visible) {
      for (const frame of page.frames()) {
        const fd = frame.locator('[data-testid="rec-job-create-edit-dialog-precision"]');
        if (await fd.isVisible().catch(() => false)) {
          dlg = fd;
          visible = true;
          break;
        }
      }
    }
    if (!visible) {
      dlg = page.locator('[role="dialog"]').filter({ hasText: /Tạo tin tuyển dụng/i }).first();
      visible = await dlg.isVisible().catch(() => false);
    }
    await dlg.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
    await sleep(600);

    const shotPath = join(SCREEN, '02-qa-job-create-dialog.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    result.screenshots.push(
      'docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/02-qa-job-create-dialog.png',
    );
    // Keep canonical 01 as QA-confirmed copy when PASS geometry
    const canonical01 = join(SCREEN, '01-job-create-dialog.png');

    const box = await dlg.boundingBox().catch(() => null);
    const elMetrics = await dlg
      .evaluate((el) => {
        const surface =
          el.closest('.xevn-dialog-surface') ||
          (el.classList?.contains('xevn-dialog-surface') ? el : el);
        const cs = getComputedStyle(surface);
        const r = surface.getBoundingClientRect();
        return {
          found: true,
          position: cs.position,
          overflowY: cs.overflowY,
          maxHeight: cs.maxHeight,
          className: String(surface.className),
          hasInset0: /\binset-0\b/.test(String(surface.className)),
          hasMAuto: /\bm-auto\b/.test(String(surface.className)),
          hasFixed: /\bfixed\b/.test(String(surface.className)),
          rect: {
            top: Math.round(r.top * 10) / 10,
            bottom: Math.round(r.bottom * 10) / 10,
            height: Math.round(r.height * 10) / 10,
            width: Math.round(r.width * 10) / 10,
            left: Math.round(r.left * 10) / 10,
          },
          vh: window.innerHeight,
          vw: window.innerWidth,
          scrollHeight: surface.scrollHeight,
          clientHeight: surface.clientHeight,
        };
      })
      .catch(() => null);

    result.checks.dialog_found = { pass: !!(elMetrics?.found || box) };
    if (!elMetrics && !box) {
      result.failReasons.push('dialog not found after create click');
      result.verdict = 'FAIL';
      result.endedAt = new Date().toISOString();
      save();
      await browser.close();
      process.exit(1);
    }

    const vp = page.viewportSize() || { width: 1440, height: 900 };
    const top = box?.y ?? elMetrics?.rect?.top ?? null;
    const height = box?.height ?? elMetrics?.rect?.height ?? null;
    const bottom = top != null && height != null ? top + height : null;
    const topGap = top != null ? top : null;
    const bottomGap = bottom != null ? vp.height - bottom : null;
    const vCenterDelta =
      topGap != null && bottomGap != null ? Math.abs(topGap - bottomGap) : null;
    const offscreenEntirely =
      top != null && (top >= vp.height - 2 || (bottom != null && bottom <= 2));
    const permanentlyClipped =
      top != null && (top < -2 || (bottom != null && bottom > vp.height + 2));

    const positionOk = elMetrics?.position === 'fixed';
    const overflowOk =
      elMetrics?.overflowY === 'auto' || elMetrics?.overflowY === 'scroll';
    const inView = !offscreenEntirely && !permanentlyClipped;
    const centeredEnough =
      vCenterDelta != null &&
      (vCenterDelta <= 120 || (topGap >= 20 && bottomGap >= 20));
    const scrollsInside =
      !!elMetrics && elMetrics.scrollHeight > elMetrics.clientHeight + 4;

    result.checks.computed_position_fixed = {
      pass: positionOk,
      position: elMetrics?.position,
    };
    result.checks.vertically_centered = {
      pass: centeredEnough && inView,
      vCenterDelta,
      topGap,
      bottomGap,
      offscreenEntirely,
      permanentlyClipped,
    };
    result.checks.overflow_scrollable = {
      pass: overflowOk,
      overflowY: elMetrics?.overflowY,
    };
    result.checks.scrolls_inside_panel = {
      pass: scrollsInside || !overflowOk ? scrollsInside : true,
      scrollHeight: elMetrics?.scrollHeight,
      clientHeight: elMetrics?.clientHeight,
      note: scrollsInside
        ? 'content taller than panel — scroll region active'
        : 'content fits panel (scroll not required this session)',
    };
    result.checks.class_geometry = {
      pass: !!(elMetrics?.hasFixed && elMetrics?.hasInset0 && elMetrics?.hasMAuto),
      classSnippet: String(elMetrics?.className || '').slice(0, 200),
    };
    result.metrics = { elMetrics, box, vCenterDelta, topGap, bottomGap };

    if (!positionOk) result.failReasons.push(`position=${elMetrics?.position} (want fixed)`);
    if (!inView) result.failReasons.push(`bbox not in viewport top=${top} bottom=${bottom}`);
    if (!centeredEnough) {
      result.failReasons.push(`not centered enough vCenterDelta=${vCenterDelta}`);
    }
    if (!overflowOk) {
      result.failReasons.push(`overflowY=${elMetrics?.overflowY} (want auto|scroll)`);
    }

    // Save / Cancel reachable — scroll panel to end if needed, then assert in viewport
    const actionProbe = await dlg
      .evaluate((el) => {
        const surface =
          el.closest('.xevn-dialog-surface') ||
          (el.classList?.contains('xevn-dialog-surface') ? el : el);
        surface.scrollTop = surface.scrollHeight;
        const buttons = Array.from(surface.querySelectorAll('button'));
        const match = (re) =>
          buttons.find((b) => re.test((b.textContent || '').replace(/\s+/g, ' ').trim()));
        // Create flow primary CTA = «Tạo tin» (edit flow may use «Lưu»)
        const save = match(/Tạo tin|Lưu|Save/i);
        const cancel = match(/Hủy|Cancel|Đóng/i);
        const vis = (b) => {
          if (!b) return null;
          const r = b.getBoundingClientRect();
          const style = getComputedStyle(b);
          return {
            text: (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            inViewport: r.top < window.innerHeight && r.bottom > 0 && r.height > 0,
            display: style.display,
            visibility: style.visibility,
            disabled: b.disabled,
          };
        };
        return {
          scrollTop: surface.scrollTop,
          scrollHeight: surface.scrollHeight,
          clientHeight: surface.clientHeight,
          save: vis(save),
          cancel: vis(cancel),
        };
      })
      .catch((e) => ({ error: String(e) }));

    await sleep(300);
    const shotActions = join(SCREEN, '03-qa-dialog-scrolled-actions.png');
    await page.screenshot({ path: shotActions, fullPage: false });
    result.screenshots.push(
      'docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/03-qa-dialog-scrolled-actions.png',
    );

    const saveOk = !!(actionProbe?.save?.inViewport);
    const cancelOk = !!(actionProbe?.cancel?.inViewport);
    result.checks.save_cancel_reachable = {
      pass: saveOk && cancelOk,
      actionProbe,
    };
    if (!saveOk) result.failReasons.push('Save button not reachable in viewport after scroll');
    if (!cancelOk) result.failReasons.push('Cancel button not reachable in viewport after scroll');

    // Escape closes (no mutate)
    await page.keyboard.press('Escape');
    await sleep(600);
    const still = await page
      .locator('[data-testid="rec-job-create-edit-dialog-precision"]')
      .isVisible()
      .catch(() => false);
    result.checks.escape_closes = { pass: !still, stillVisible: still };
    if (still) result.failReasons.push('escape: dialog still visible');

    result.verdict = result.failReasons.length === 0 ? 'PASS' : 'FAIL';
    if (result.verdict === 'PASS' && existsSync(shotPath)) {
      try {
        copyFileSync(shotPath, canonical01);
      } catch {
        /* ignore */
      }
    }
    result.endedAt = new Date().toISOString();
    save();
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
    process.exit(result.verdict === 'PASS' ? 0 : 1);
  } catch (e) {
    result.failReasons.push(String(e?.stack || e));
    result.verdict = 'FAIL';
    result.endedAt = new Date().toISOString();
    save();
    console.error(e);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

main();
