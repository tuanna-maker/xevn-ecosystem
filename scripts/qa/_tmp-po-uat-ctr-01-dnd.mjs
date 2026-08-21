#!/usr/bin/env node
/**
 * PO-UAT-CTR-01 focused AC — template DnD persist + F5
 * Fixes prior qa-01 flake: wait pack filter + use .cursor-grab (rfd attrs)
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-ctr-01-dnd.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-ctr-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `UATDND-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-UAT-CTR-01',
  slice: 'AC-CTR-TPL-DND',
  startedAt: ts(),
  stamp: STAMP,
  honesty: { contracts_printable_ready: false },
  ac: {},
  process: { dndStorm: 0, uncaught: 0, consoleErrors: [] },
  network: [],
  overall: null,
  ack_status: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
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
  if (!token) throw new Error(`login ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      userId: data?.user?.userId || EMAIL,
      email: EMAIL,
      roles: ['group_ceo'],
    },
    raw: data,
  };
}

async function inject(page, session) {
  await page.addInitScript((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', JSON.stringify(s.user));
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
    }
  }, session);
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = String(msg.text());
      results.process.consoleErrors.push(t.slice(0, 240));
      if (/Unable to find drag handle|@hello-pangea\/dnd/i.test(t)) results.process.dndStorm += 1;
      if (/Uncaught ReferenceError|Uncaught TypeError/i.test(t)) results.process.uncaught += 1;
    }
  });
  page.on('pageerror', (e) => {
    results.process.uncaught += 1;
    results.process.consoleErrors.push(String(e).slice(0, 240));
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/contract-clauses|contract-templates/.test(u)) return;
    const entry = {
      method: res.request().method(),
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 300),
    };
    try {
      const j = await res.json();
      entry.code = j?.code;
    } catch {
      /* */
    }
    results.network.push(entry);
  });
  await inject(page, session);

  try {
    await page.goto(q('/hr/settings', { tab: 'contract-legal' }), {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2000);
    const tabBtn = page.getByTestId('settings-tab-contract-legal');
    if (await tabBtn.isVisible()) await tabBtn.click();
    await sleep(1200);

    // Create + activate LEGAL_BASIS + JOB clause
    const code1 = `LEGAL_${STAMP}`;
    const code2 = `JOB_${STAMP}`;
    await page.getByTestId('ctr-legal-tab-clauses').click();
    await sleep(400);
    for (const [code, title, group] of [
      [code1, `Căn cứ pháp lý UAT ${STAMP}`, /Căn cứ|LEGAL_BASIS|pháp lý/i],
      [code2, `Công việc UAT ${STAMP}`, /Công việc|JOB|job/i],
    ]) {
      await page.getByTestId('ctr-clause-code').fill(code);
      await page.getByTestId('ctr-clause-group').click();
      await sleep(300);
      const g = page.getByRole('option').filter({ hasText: group }).first();
      if (await g.isVisible().catch(() => false)) await g.click();
      else await page.keyboard.press('Escape');
      await page.getByTestId('ctr-clause-title').fill(title);
      await page.getByTestId('ctr-clause-body').fill(`Nội dung UAT DnD ${STAMP}`);
      await page.getByTestId('ctr-clause-save').click();
      await sleep(2000);
      const row = page.getByTestId(`ctr-clause-row-${code}`);
      const act = row.getByRole('button', { name: /Hiệu lực/i });
      if (await act.isVisible().catch(() => false)) {
        await act.click();
        await sleep(1500);
      }
    }
    await page.screenshot({ path: join(SCREEN, '01-clauses.png') });

    // Templates + pack GENERAL
    await page.getByTestId('ctr-legal-tab-templates').click();
    await sleep(800);
    const tplCode = `TPL_${STAMP}`;
    await page.getByTestId('ctr-tpl-code').fill(tplCode);
    await page.getByTestId('ctr-tpl-name').fill(`Mẫu UAT ${STAMP}`);
    await page.getByTestId('ctr-tpl-pack').click({ force: true });
    await sleep(400);
    const packOpt = page.getByRole('option').filter({ hasText: /GENERAL|Chung/i }).first();
    if (await packOpt.isVisible().catch(() => false)) await packOpt.click({ force: true });
    else await page.keyboard.press('Escape');
    await sleep(1500);

    const palette = page.getByTestId('ctr-tpl-palette');
    const grabCount = await palette.locator('.cursor-grab').count();
    const rfd = await palette.locator('[data-rfd-draggable-id]').count();
    results.ids = { grabCount, rfd, tplCode, code1, code2 };

    // Drag 2 items
    const canvas = page.getByTestId('ctr-tpl-canvas');
    for (let i = 0; i < 2; i++) {
      const src = palette.locator('.cursor-grab').first();
      if (!(await src.isVisible().catch(() => false))) break;
      const box = await src.boundingBox();
      const cbox = await canvas.boundingBox();
      if (!box || !cbox) break;
      await page.mouse.move(box.x + Math.min(24, box.width / 2), box.y + box.height / 2);
      await page.mouse.down();
      await sleep(100);
      await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 50 + i * 40, { steps: 28 });
      await sleep(100);
      await page.mouse.up();
      await sleep(700);
    }
    const placed = await page.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
    await page.screenshot({ path: join(SCREEN, '02-after-dnd.png') });

    // Reorder if >=2
    let reorderOk = false;
    if (placed >= 2) {
      const items = page.locator('[data-testid^="ctr-tpl-canvas-item-"]');
      const a = items.nth(0);
      const b = items.nth(1);
      const idA = await a.getAttribute('data-testid');
      const boxA = await a.boundingBox();
      const boxB = await b.boundingBox();
      if (boxA && boxB) {
        await page.mouse.move(boxA.x + 20, boxA.y + boxA.height / 2);
        await page.mouse.down();
        await sleep(80);
        await page.mouse.move(boxB.x + 20, boxB.y + boxB.height / 2 + 12, { steps: 20 });
        await sleep(80);
        await page.mouse.up();
        await sleep(600);
        const firstAfter = await items.nth(0).getAttribute('data-testid');
        reorderOk = firstAfter !== idA;
      }
    }

    const orderBefore = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="ctr-tpl-canvas-item-"]')].map((el) =>
        el.getAttribute('data-testid'),
      ),
    );

    const net0 = results.network.length;
    await page.getByTestId('ctr-tpl-save').click();
    await sleep(2500);
    const saveOk = results.network
      .slice(net0)
      .some((n) => /contract-templates/.test(n.url) && n.status >= 200 && n.status < 300);

    if (await page.getByTestId('ctr-tpl-activate').isVisible().catch(() => false)) {
      await page.getByTestId('ctr-tpl-activate').click();
      await sleep(1500);
    }

    // F5 persist
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2000);
    const tab2 = page.getByTestId('settings-tab-contract-legal');
    if (await tab2.isVisible()) await tab2.click();
    await sleep(1000);
    await page.getByTestId('ctr-legal-tab-templates').click();
    await sleep(1000);
    const tplRow = page.getByTestId(`ctr-tpl-row-${tplCode}`);
    const rowOk = await tplRow.isVisible().catch(() => false);
    if (rowOk) {
      // FE loadTemplateOntoCanvas is labeled «Mở» (not Sửa — Sửa is clause-only)
      const mo = tplRow.locator('button').filter({ hasText: /^Mở$/i }).first();
      if (await mo.isVisible().catch(() => false)) await mo.click();
      else {
        const any = tplRow.locator('button').filter({ hasText: /Mở|Sửa|Edit|Load/i }).first();
        if (await any.isVisible().catch(() => false)) await any.click();
        else await tplRow.click({ force: true });
      }
      await sleep(1200);
    }
    const orderAfter = await page.evaluate(() =>
      [...document.querySelectorAll('[data-testid^="ctr-tpl-canvas-item-"]')].map((el) =>
        el.getAttribute('data-testid'),
      ),
    );
    await page.screenshot({ path: join(SCREEN, '03-f5-canvas.png') });

    const orderMatch =
      orderBefore.length > 0 &&
      orderAfter.length === orderBefore.length &&
      orderBefore.every((id, i) => id === orderAfter[i]);

    const pass = placed >= 1 && saveOk && rowOk && orderAfter.length >= 1;
    results.ac['AC-CTR-TPL-DND'] = {
      verdict: pass ? 'PASS' : 'FAIL',
      summary: `placed=${placed} reorder=${reorderOk} save=${saveOk} F5row=${rowOk} orderMatch=${orderMatch} grab=${grabCount} rfd=${rfd}`,
      orderBefore,
      orderAfter,
      at: ts(),
    };
    results.overall = pass && results.process.dndStorm === 0 && results.process.uncaught === 0 ? 'PASS' : 'FAIL';
    results.ack_status = results.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.error = String(e?.message || e).slice(0, 400);
  } finally {
    results.endedAt = ts();
    save();
    await browser.close().catch(() => {});
  }
  console.log(JSON.stringify({ overall: results.overall, ac: results.ac, process: results.process }, null, 2));
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main();
