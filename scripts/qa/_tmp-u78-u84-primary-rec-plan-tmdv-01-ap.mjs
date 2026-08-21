#!/usr/bin/env node
/**
 * AP-only retest — TC-HIM-REC-PLAN-TMDV-AP-001
 * Target inbox card containing STAMP; do not click leave Duyệt.
 */
import { chromium } from 'playwright';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const PREV = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-rec-plan-tmdv-01-browser.json');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-u78-u84-primary-rec-plan-tmdv-01-ap-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/u78-u84-primary-rec-plan-tmdv-01');
mkdirSync(SCREEN, { recursive: true });

const prev = JSON.parse(readFileSync(PREV, 'utf8'));
const STAMP = prev.env?.STAMP || 'TMDV-PLAN-DH7VCT';
const PLAN_ID = prev.ids?.planId;
const WI = prev.ids?.workflowInstanceId;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const results = {
  work_item_id: 'U78-U84-PRIMARY-REC-PLAN-TMDV-01',
  phase: 'AP-retarget',
  startedAt: ts(),
  STAMP,
  PLAN_ID,
  WI,
  network: [],
  screens: [],
  approve: {},
  plan_after: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  return {
    token: data.accessToken || data.access_token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: 'main',
    user: {
      userId: data.user?.userId || EMAIL,
      email: EMAIL,
      displayName: data.user?.displayName || 'CEO',
      roles: data.user?.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  page.on('response', async (res) => {
    const u = res.url();
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    if (!/workflow-engine\/tasks|recruitment-plans/.test(u)) return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
      at: ts(),
    };
    if (method === 'POST' && /\/complete/.test(u)) {
      try {
        const j = await res.json();
        entry.code = j?.code || null;
        entry.bodySnippet = JSON.stringify(j).slice(0, 240);
      } catch {
        /* */
      }
    }
    results.network.push(entry);
  });

  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);

  await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '12-ap-inbox-before');

  const body = await page.locator('body').innerText().catch(() => '');
  const cardVisible = body.includes(STAMP) && /kế hoạch tuyển/i.test(body);
  results.approve.cardVisible = cardVisible;
  if (!cardVisible) {
    results.approve.verdict = 'FAIL';
    results.approve.reason = 'STAMP card not in inbox';
    results.endedAt = ts();
    save();
    await browser.close();
    process.exit(2);
  }

  // Scope click to card containing STAMP — prefer Xử lý nhanh on that card only
  const card = page.locator('div, li, article, section, tr').filter({ hasText: STAMP }).first();
  await card.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(400);
  const quick = card.getByRole('button', { name: /Xử lý nhanh/i }).first();
  const open = card.getByRole('button', { name: /Mở chi tiết/i }).first();
  let clicked = false;
  if (await quick.isVisible().catch(() => false)) {
    await quick.click({ force: true });
    clicked = true;
    await sleep(1500);
    // dialog may appear with Duyệt / Hoàn thành
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible().catch(() => false)) {
      const duy = dialog.getByRole('button', { name: /Duyệt|Hoàn thành|Xác nhận|Phê duyệt/i }).first();
      if (await duy.isVisible().catch(() => false)) {
        await duy.click({ force: true });
        await sleep(2000);
      } else {
        // some UX: Xử lý nhanh = immediate complete
      }
    } else {
      // maybe a popover with Duyệt
      const duy2 = page.getByRole('button', { name: /^Duyệt$|Hoàn thành|Phê duyệt/i }).first();
      if (await duy2.isVisible().catch(() => false)) {
        await duy2.click({ force: true });
        await sleep(2000);
      }
    }
  } else if (await open.isVisible().catch(() => false)) {
    await open.click({ force: true });
    clicked = true;
    await sleep(2000);
    await shot(page, '12b-ap-detail');
    const duy = page.getByRole('button', { name: /^Duyệt$|Hoàn thành|Phê duyệt/i }).first();
    if (await duy.isVisible().catch(() => false)) {
      await duy.click({ force: true });
      await sleep(2000);
    }
  } else {
    // evaluate: find ancestor of STAMP text, click Xử lý nhanh inside
    clicked = await page.evaluate((stamp) => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      // Find a container that includes stamp, then its Xử lý nhanh
      const nodes = Array.from(document.querySelectorAll('div, li, article, section'));
      const container = nodes.find(
        (n) => (n.textContent || '').includes(stamp) && /Xử lý nhanh|Mở chi tiết/i.test(n.textContent || ''),
      );
      if (!container) return false;
      const btn = Array.from(container.querySelectorAll('button, a, [role="button"]')).find((b) =>
        /Xử lý nhanh/i.test(b.textContent || ''),
      );
      if (!btn) return false;
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }, STAMP);
    await sleep(2000);
    const duy = page.getByRole('button', { name: /^Duyệt$|Hoàn thành|Phê duyệt|Xác nhận/i }).first();
    if (await duy.isVisible().catch(() => false)) {
      await duy.click({ force: true });
      await sleep(2000);
    }
  }

  await shot(page, '13-ap-after-click');
  const completes = results.network.filter((n) => n.method === 'POST' && /\/complete/.test(n.url) && n.status >= 200 && n.status < 300);
  results.approve.clicked = clicked;
  results.approve.completePosts = completes;

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '14-ap-inbox-f5');
  const after = await page.locator('body').innerText().catch(() => '');
  const stillThere = after.includes(STAMP);
  results.approve.cardGoneAfterF5 = !stillThere;

  // Plan status via API
  const planRes = await fetch(`${HRM}/api/hrm/recruitment/recruitment-plans?company_id=trsport`, {
    headers: { Authorization: `Bearer ${session.token}` },
  }).then((r) => r.json());
  const rows = planRes?.data?.data ?? planRes?.data ?? [];
  const hit = (Array.isArray(rows) ? rows : []).find((r) => r.id === PLAN_ID || String(r.title || '').includes(STAMP));
  results.plan_after = hit
    ? { id: hit.id, status: hit.status, workflow_instance_id: hit.workflow_instance_id, title: hit.title }
    : null;

  const pass = !stillThere && completes.length >= 1;
  results.approve.verdict = pass ? 'PASS' : stillThere && completes.length >= 1 ? 'PARTIAL' : 'FAIL';
  results.endedAt = ts();
  save();
  console.log(
    JSON.stringify(
      {
        verdict: results.approve.verdict,
        cardGone: !stillThere,
        completes: completes.map((c) => c.url),
        plan_after: results.plan_after,
      },
      null,
      2,
    ),
  );
  await browser.close();
  process.exit(pass ? 0 : 2);
}

main().catch((e) => {
  results.endedAt = ts();
  results.error = String(e?.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
