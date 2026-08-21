#!/usr/bin/env node
/** Supplemental J-HRM-REC-06-04 — APP-02 transition after eval seat */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const XBOS = 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const NAME = /CNS Deny/i;
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-06-j04.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = {
  work_item: 'PO-HRM-MVP-GD1-REC-06-CLUSTER-QA-01-J04',
  network: [],
  nest_rec: 0,
  transition: null,
  notes: [],
  timeline: false,
  ok: false,
};

async function findHost(page, fn) {
  for (const h of [page, ...page.frames()]) {
    try {
      if (await fn(h).first().isVisible({ timeout: 800 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return null;
}

const lr = await fetch(`${XBOS}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASS }),
});
const token = (await lr.json())?.data?.accessToken;

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('response', (res) => {
  const u = res.url();
  if (!/\/api\/hrm\//.test(u)) return;
  out.network.push({ m: res.request().method(), u, s: res.status() });
  if (/\/api\/hrm\/rec(\/|$)/.test(u)) out.nest_rec += 1;
});
await page.addInitScript(
  (s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
      store.setItem(
        'xevn.portal.user',
        JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }),
      );
      store.setItem('xevn.portal.tenantId', s.tenantId);
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', s.tenantId);
    }
  },
  { token, email: EMAIL, companyId: COMPANY, tenantId: TENANT },
);

await page.goto(
  `${PORTAL}/command-center/hrm/recruitment?tab=candidates&companyId=${COMPANY}&tenantId=${TENANT}`,
  { waitUntil: 'domcontentloaded', timeout: 60000 },
);
await sleep(3500);
const nav = await findHost(page, (h) => h.getByRole('button', { name: /ứng viên/i }));
if (nav) await nav.getByRole('button', { name: /ứng viên/i }).first().click({ force: true });
await sleep(800);
const all = await findHost(page, (h) => h.getByText(/tất cả ứng viên/i));
if (all) await all.getByText(/tất cả ứng viên/i).first().click({ force: true });
await sleep(2500);

const host = await findHost(page, (h) => h.locator('table tbody tr').filter({ hasText: NAME }));
if (!host) {
  out.notes.push('row missing');
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  process.exit(2);
}
const row = host.locator('table tbody tr').filter({ hasText: NAME }).first();
const buttons = row.locator('td').last().locator('button');
const bc = await buttons.count();
let opened = false;
for (let i = 0; i < bc; i++) {
  const b = buttons.nth(i);
  const txt = ((await b.innerText().catch(() => '')) || '').trim();
  const tid = (await b.getAttribute('data-testid').catch(() => '')) || '';
  if (txt || /interview/i.test(tid)) continue;
  await b.click({ force: true });
  await sleep(1500);
  const stage = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-open-detail"]'));
  if (stage) {
    opened = true;
    out.notes.push(`detail open idx=${i}`);
    break;
  }
  const back = await findHost(page, (h) =>
    h.locator('button').filter({ has: h.locator('svg.lucide-arrow-left') }),
  );
  if (back) await back.locator('button').first().click({ force: true }).catch(() => null);
  await sleep(400);
}
if (!opened) {
  out.notes.push('detail not opened');
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  process.exit(2);
}

const stageOpen = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-open-detail"]'));
await stageOpen.locator('[data-testid="rec-stage-transition-open-detail"]').first().click({ force: true });
await sleep(1000);
const dlg = await findHost(page, (h) => h.locator('[data-testid="rec-stage-transition-dialog"]'));
if (!dlg) {
  out.notes.push('dialog miss');
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  process.exit(2);
}
const trigger = dlg.locator('[data-testid="hdsd-rec-candidate-stage-picker"]').first();
await trigger.click({ force: true });
await sleep(400);
const options = page.locator('[role="option"]');
const count = await options.count();
out.notes.push(`eff_options=${count}`);
if (count > 0) await options.nth(Math.min(1, count - 1)).click({ force: true });
await sleep(300);
const postP = page.waitForResponse(
  (r) =>
    /\/recruitment\/candidates\/[^/]+\/transitions/.test(r.url()) && r.request().method() === 'POST',
  { timeout: 20000 },
);
await dlg.locator('[data-testid="rec-stage-transition-save"]').click({ force: true });
const postR = await postP.catch(() => null);
let body = null;
if (postR) body = await postR.json().catch(() => null);
out.transition = {
  status: postR?.status() ?? null,
  code: body?.code ?? null,
  history_id: body?.data?.history_id ?? body?.data?.history?.id ?? null,
  url: postR?.url() ?? null,
};
await sleep(800);
const hist = await findHost(page, (h) => h.locator('[data-testid="rec-stage-history-tab"]'));
if (hist) {
  await hist.locator('[data-testid="rec-stage-history-tab"]').first().click({ force: true });
  await sleep(1200);
  out.timeline = true;
}
out.ok = out.transition?.status >= 200 && out.transition?.status < 300 && out.nest_rec === 0;
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
process.exit(out.ok ? 0 : 2);
