#!/usr/bin/env node
/**
 * QA-D-CTR-CREATE-PICKER-PLACEMENT-01 — U65 browser-only, zero-seed.
 * Verify/deny reported crash "catalogSearchPlacement is not defined" on Contract Create Step 1,
 * and validate picker placement per DEF-CTR-PICKER-INLINE-PORTAL-01 + CODE-MEMORY-CHANGE 2026-08-12:
 *   - standalone (/hr/contracts, 8080) => searchPlacement POPOVER (search hidden until click)
 *   - portal embed (:5173 command-center ?portal=1&companyId) => searchPlacement INLINE (search visible)
 * No seed, no DB writes, no product code change.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_STANDALONE = process.env.HRM_STANDALONE_URL || 'http://127.0.0.1:8080';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
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
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-d-ctr-create-picker-placement-01');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-d-ctr-create-picker-placement-01.json');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const REF_ERR_RE = /is not defined|ReferenceError|catalogSearchPlacement/i;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const PICKERS = [
  { id: 'hdsd-contracts-form-employee', label: 'NV picker' },
  { id: 'ctr-create-department-picker', label: 'Department picker' },
  { id: 'ctr-create-work-arrangement', label: 'Work-arrangement picker' },
  { id: 'ctr-create-candidate-picker', label: 'UV picker', requiresCandidateTab: true },
];

const R = {
  work_item_id: 'QA-D-CTR-CREATE-PICKER-PLACEMENT-01',
  startedAt: ts(),
  commit: COMMIT,
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  modes: {},
  endedAt: null,
};

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = { ...d, accessToken: token };
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken) throw new Error('login failed');
  return { token: data.accessToken, user: data.user ?? { userId: EMAIL, displayName: EMAIL } };
}

/** Inject portal JWT. portalMode=true → also set hrm_portal_mode='1' (embed). false → standalone (popover). */
async function injectAuth(page, session, portalMode) {
  const expiresAt = Date.now() + 3600000;
  await page.addInitScript(
    ({ token, user, companyId, tenantId, portalMode: pm, expiresAt: exp }) => {
      const userPayload = JSON.stringify(
        user?.userId ? { userId: user.userId, displayName: user.displayName || user.userId } : { userId: 'ceo@xe.vn', displayName: 'CEO' },
      );
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', token);
        store.setItem('xevn.portal.tokenExpiresAt', String(exp));
        store.setItem('xevn.portal.user', userPayload);
        store.setItem('hrm_current_company_id', companyId);
        store.setItem('hrm_current_tenant_id', tenantId);
        if (pm) {
          store.setItem('hrm_portal_mode', '1');
        } else {
          // standalone must NOT be portal-embed → force popover
          store.removeItem('hrm_portal_mode');
        }
      }
    },
    { token: session.token, user: session.user, companyId: COMPANY, tenantId: TENANT, portalMode, expiresAt },
  );
}

async function shot(ctxPage, name) {
  const path = join(SCREEN, `${name}.png`);
  await ctxPage.screenshot({ path, fullPage: false }).catch(() => {});
  return path.replace(/\\/g, '/');
}

async function resolveCreateContext(page, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const onPage = await page
      .getByTestId('hdsd-contracts-create-btn')
      .first()
      .isVisible()
      .catch(() => false);
    if (onPage) return page;
    for (const f of page.frames()) {
      const has = await f
        .locator('[data-testid="hdsd-contracts-create-btn"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (has) return f;
    }
    await sleep(400);
  }
  return null;
}

async function resolveShell(page, hrmCtx, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, hrmCtx, ...page.frames()]) {
      if (!ctx) continue;
      const stepper = await ctx
        .locator('[data-testid="ctr-create-step-1"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (stepper) return ctx;
    }
    await sleep(350);
  }
  return null;
}

/** For a picker id, is the -search input visible right now? (inline => visible, popover => hidden) */
async function searchVisible(shell, id) {
  return shell
    .locator(`[data-testid="${id}-search"]`)
    .first()
    .isVisible()
    .catch(() => false);
}

async function pickerState(shell, picker) {
  const rootVisible = await shell
    .locator(`[data-testid="${picker.id}"]`)
    .first()
    .isVisible()
    .catch(() => false);
  const comboVisible = await shell
    .locator(`[data-testid="${picker.id}-combobox"]`)
    .first()
    .isVisible()
    .catch(() => false);
  if (!rootVisible && !comboVisible) {
    return { rendered: false, placement: 'n/a', note: 'picker not rendered (subject/data state)' };
  }
  const searchBefore = await searchVisible(shell, picker.id);
  if (searchBefore) {
    // inline: search input present without click
    return { rendered: true, placement: 'inline', searchBefore: true, note: 'search input visible without click' };
  }
  // popover expected: click trigger, search should appear
  const trigger = shell.locator(`[data-testid="${picker.id}"]`).first();
  await trigger.click({ timeout: 8000 }).catch(() => {});
  await sleep(500);
  const searchAfter = await searchVisible(shell, picker.id);
  // close popover by toggling trigger again (NOT Escape — Escape would also close the wizard Dialog)
  await trigger.click({ timeout: 4000 }).catch(() => {});
  await sleep(250);
  return {
    rendered: true,
    placement: searchAfter ? 'popover' : 'unknown',
    searchBefore: false,
    searchAfter,
    note: searchAfter ? 'search hidden until click → popover' : 'search never appeared (possible options empty or broken)',
  };
}

async function runMode(browser, session, mode) {
  const isPortal = mode === 'portal';
  const expectedPlacement = isPortal ? 'inline' : 'popover';
  const res = {
    mode,
    expectedPlacement,
    url: isPortal
      ? `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`
      : `${HRM_STANDALONE}/hr/contracts?_=${Date.now()}`,
    consoleErrors: [],
    pageErrors: [],
    refErrors: [],
    step1Rendered: false,
    pickers: {},
    next: { attempted: false, reachedStep2: false, note: '' },
    screens: [],
    verdict: 'PENDING',
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text().slice(0, 300);
      res.consoleErrors.push(t);
      if (REF_ERR_RE.test(t)) res.refErrors.push(`console: ${t}`);
    }
  });
  page.on('pageerror', (err) => {
    const t = String(err).slice(0, 400);
    res.pageErrors.push(t);
    if (REF_ERR_RE.test(t)) res.refErrors.push(`pageerror: ${t}`);
  });

  try {
    await injectAuth(page, session, isPortal);
    await page.goto(res.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    res.screens.push(await shot(page, `${mode}-00-landing`));

    const createCtx = await resolveCreateContext(page);
    if (!createCtx) {
      res.verdict = 'BLOCKED';
      res.next.note = 'Không thấy nút Tạo hợp đồng (hdsd-contracts-create-btn)';
      res.screens.push(await shot(page, `${mode}-01-no-create-btn`));
      return res;
    }
    res.embedContext = createCtx === page ? 'top-document' : 'iframe';

    await createCtx.locator('[data-testid="hdsd-contracts-create-btn"]').first().click({ timeout: 30000 });
    const shell = await resolveShell(page, createCtx);
    if (!shell) {
      res.verdict = res.refErrors.length ? 'FAIL' : 'BLOCKED';
      res.next.note = 'Wizard Step 1 không hiện (ctr-create-step-1)';
      res.screens.push(await shot(page, `${mode}-02-no-step1`));
      return res;
    }
    res.step1Rendered = true;
    await sleep(1500);
    res.screens.push(await shot(page, `${mode}-03-step1`));

    for (const picker of PICKERS) {
      if (picker.requiresCandidateTab) {
        const tab = shell.locator('[data-testid="ctr-create-subject-tab-candidate"]').first();
        if (await tab.isVisible().catch(() => false)) {
          await tab.click().catch(() => {});
          await sleep(900);
        }
      }
      res.pickers[picker.id] = { label: picker.label, ...(await pickerState(shell, picker)) };
    }
    res.screens.push(await shot(page, `${mode}-04-pickers-done`));

    // switch back to employee tab and try select NV + template + Next
    const empTab = shell.locator('[data-testid="ctr-create-subject-tab-employee"]').first();
    if (await empTab.isVisible().catch(() => false)) {
      await empTab.click().catch(() => {});
      await sleep(800);
    }
    res.next.attempted = true;
    // select NV
    const nvId = 'hdsd-contracts-form-employee';
    const nvInline = res.pickers[nvId]?.placement === 'inline';
    try {
      if (nvInline) {
        await shell.locator(`[data-testid="${nvId}-combobox"]`).first().click().catch(() => {});
      } else {
        await shell.locator(`[data-testid="${nvId}"]`).first().click().catch(() => {});
      }
      await sleep(500);
      const firstOpt = shell.locator('[data-testid^="catalog-picker-option-"]').first();
      if (await firstOpt.isVisible().catch(() => false)) {
        await firstOpt.click().catch(() => {});
        await sleep(400);
      }
    } catch {
      /* */
    }
    // fill contract code + template if present
    const codeInput = shell.locator('[data-testid="ctr-create-contract-code"]').first();
    if (await codeInput.isVisible().catch(() => false)) {
      await codeInput.fill(`QAPLACE${Date.now().toString(36).toUpperCase().slice(-5)}`).catch(() => {});
    }
    const tplCombo = shell.locator('[data-testid="ctr-create-template-combobox"]').first();
    if (await tplCombo.isVisible().catch(() => false)) {
      await tplCombo.click().catch(() => {});
      await sleep(400);
      const opt = shell.locator('[role="option"]').first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click().catch(() => {});
        await sleep(400);
      }
    }
    res.screens.push(await shot(page, `${mode}-05-before-next`));
    // Wizard footer may render in iframe OR parent document (CC parent-portal) — search all contexts.
    let nextBtn = null;
    let nextCtx = null;
    for (const ctx of [shell, page, ...page.frames()]) {
      if (!ctx) continue;
      let loc = ctx.locator('[data-testid="ctr-create-next-btn"]').first();
      if (await loc.isVisible().catch(() => false)) {
        nextBtn = loc;
        nextCtx = ctx;
        break;
      }
      loc = ctx.getByRole('button', { name: /^Tiếp/ }).first();
      if (await loc.isVisible().catch(() => false)) {
        nextBtn = loc;
        nextCtx = ctx;
        break;
      }
    }
    if (nextBtn) {
      const disabled = await nextBtn.isDisabled().catch(() => true);
      if (!disabled) {
        await nextBtn.click().catch(() => {});
        await sleep(3000);
        for (const ctx of [nextCtx, shell, page, ...page.frames()]) {
          if (!ctx) continue;
          const v = await ctx
            .locator('[data-testid="ctr-create-step-2"]')
            .first()
            .isVisible()
            .catch(() => false);
          if (v) {
            res.next.reachedStep2 = true;
            break;
          }
        }
      }
      res.next.note = `next found in ${nextCtx === page ? 'top' : 'frame'}; disabled=${disabled}; reachedStep2=${res.next.reachedStep2}`;
    } else {
      res.next.note = 'next button not located in any context';
    }
    res.screens.push(await shot(page, `${mode}-06-after-next`));

    // Verdict: crash-free render + placement matches expectation for rendered pickers
    const renderedPickers = Object.values(res.pickers).filter((p) => p.rendered);
    const placementOk =
      renderedPickers.length > 0 &&
      renderedPickers.every((p) => p.placement === expectedPlacement);
    const crashFree = res.refErrors.length === 0 && res.step1Rendered;
    res.verdict = crashFree && placementOk ? 'PASS' : crashFree ? 'PARTIAL' : 'FAIL';
  } catch (err) {
    res.fatal = String(err).slice(0, 300);
    res.verdict = res.refErrors.length ? 'FAIL' : 'BLOCKED';
    res.screens.push(await shot(page, `${mode}-99-fatal`));
  } finally {
    await context.close().catch(() => {});
  }
  return res;
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--disable-dev-shm-usage'] });
  try {
    R.modes.standalone = await runMode(browser, session, 'standalone');
    R.modes.portal = await runMode(browser, session, 'portal');
  } finally {
    await browser.close().catch(() => {});
  }
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  const summarize = (m) =>
    `[${m.mode}] verdict=${m.verdict} step1=${m.step1Rendered} refErrors=${m.refErrors.length} ` +
    `pickers=${Object.entries(m.pickers).map(([k, v]) => `${k}:${v.placement}(${v.rendered})`).join(' | ')} ` +
    `next(${m.next.reachedStep2})`;
  console.log('=== QA-D-CTR-CREATE-PICKER-PLACEMENT-01 ===');
  console.log(summarize(R.modes.standalone));
  console.log(summarize(R.modes.portal));
  if (R.modes.standalone.refErrors.length || R.modes.portal.refErrors.length) {
    console.log('REF ERRORS:', JSON.stringify([...R.modes.standalone.refErrors, ...R.modes.portal.refErrors], null, 2));
  }
  console.log('json:', OUT_JSON);
}

main().catch((err) => {
  R.fatal = String(err);
  R.endedAt = ts();
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
  console.error(err);
  process.exit(1);
});
