#!/usr/bin/env node
/** Continue QA-PO-HRM-REC-CHANNELS-CONSUMER-01 — inbox WF → receivable → UV mutate */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const STAMP = process.env.QA_STAMP || 'RECCHQA-MSNJ2BYL';
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const TENANT = 'xevn';
const COMPANY = 'main';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01-cont.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAND_NAME = `UV Kênh QA ${STAMP}`;
const CAND_EMAIL = `rec.ch.qa.${STAMP.toLowerCase()}@xe.vn`;

const R = { stamp: STAMP, steps: [], network: [], ack: null };

function save() {
  writeFileSync(OUT, JSON.stringify(R, null, 2));
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error('login fail');
  return { token, user: data?.user ?? { email: EMAIL }, companyId: COMPANY, expiresAt: Date.now() + 3600000, raw: data };
}

async function recvCount(token, companyId) {
  const url = `${HRM}/api/hrm/recruitment/requisitions?company_id=${companyId}&receivable=true&page_size=50`;
  const r = await fetch(url, { headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT } });
  const j = await r.json();
  const items = j?.data?.items ?? [];
  return { status: r.status, count: Array.isArray(items) ? items.length : 0, items };
}

async function inject(page, session) {
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
      store.setItem('access_token', s.token);
    }
  }, session);
}

async function inboxApprove(page, round) {
  await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(5000);
  const body = await page.locator('body').innerText();
  if (!body.includes(STAMP)) {
    R.steps.push({ step: `inbox-${round}`, verdict: 'FAIL', summary: 'stamp not in inbox' });
    save();
    return false;
  }
  const card = page.locator('article, li, section, div').filter({ hasText: STAMP }).first();
  await card.scrollIntoViewIfNeeded().catch(() => {});
  const quick = card.getByRole('button', { name: /Xử lý nhanh/i }).first();
  if (await quick.isVisible().catch(() => false)) {
    await quick.click({ force: true });
  } else {
    await page.evaluate((stamp) => {
      const nodes = Array.from(document.querySelectorAll('div, li, article, section'));
      const container = nodes.find(
        (n) => (n.textContent || '').includes(stamp) && /Xử lý nhanh/i.test(n.textContent || ''),
      );
      const btn = container && Array.from(container.querySelectorAll('button')).find((b) =>
        /Xử lý nhanh/i.test(b.textContent || ''),
      );
      btn?.click();
    }, STAMP);
  }
  await sleep(1500);
  const duy = page.getByRole('button', { name: /Duyệt|Hoàn thành|Xác nhận|Phê duyệt|BOD/i }).first();
  if (await duy.isVisible().catch(() => false)) {
    await duy.click({ force: true });
    await sleep(3000);
  }
  R.steps.push({ step: `inbox-${round}`, verdict: 'PASS', summary: 'clicked approve path' });
  save();
  return true;
}

async function main() {
  const session = await loginApi();
  let recv = await recvCount(session.token, 'main');
  R.recvBefore = recv;
  save();

  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const page = await browser.newPage();
  page.on('response', (res) => {
    const url = res.url();
    if (/\/api\/(hrm|xbos)\//.test(url) && ['POST', 'PATCH', 'PUT'].includes(res.request().method())) {
      R.network.push({ method: res.request().method(), url: url.slice(0, 200), status: res.status() });
      save();
    }
  });
  await inject(page, session);

  await inboxApprove(page, 1);
  await sleep(2000);
  recv = await recvCount(session.token, 'main');
  R.recvAfterAp1 = recv;
  if (recv.count === 0) {
    recv = await recvCount(session.token, 'holding');
    R.recvAfterAp1Holding = recv;
  }
  if (recv.count === 0) {
    await inboxApprove(page, 2);
    await sleep(2000);
    recv = await recvCount(session.token, 'main');
    R.recvAfterAp2 = recv;
    if (recv.count === 0) recv = await recvCount(session.token, 'holding');
    R.recvAfterAp2Holding = recv;
  }
  R.recvFinal = recv;
  save();

  if (recv.count === 0) {
    R.ack = 'WF_BLOCKED';
    save();
    await browser.close();
    return;
  }

  const q = (path, tab) =>
    `${PORTAL}/hr/recruitment?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&tab=${tab}`;
  await page.goto(q('', 'candidates'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(4000);
  await page.getByTestId('hdsd-candidate-create-btn').first().click({ force: true }).catch(() => {});
  await sleep(3000);
  const dlg = page.getByTestId('hdsd-candidate-form-dialog');
  const yctdTrigger = dlg.getByTestId('hdsd-candidate-form-yctd').first();
  if (await yctdTrigger.isVisible().catch(() => false)) {
    await yctdTrigger.click({ force: true });
    await sleep(600);
    const opts = dlg.locator('[role="option"]');
    for (let i = 0; i < await opts.count(); i++) {
      const t = (await opts.nth(i).innerText()).trim();
      const v = (await opts.nth(i).getAttribute('data-value')) || '';
      if (t && !/Chọn|__none__/i.test(t) && v !== '__none__') {
        await opts.nth(i).click({ force: true });
        break;
      }
    }
  }
  await dlg.getByLabel(/Họ và tên|Họ tên/i).fill(CAND_NAME).catch(() => {});
  await dlg.getByLabel(/Email/i).fill(CAND_EMAIL).catch(() => {});
  const srcTrigger = dlg.getByTestId('hdsd-candidate-form-source');
  await srcTrigger.click({ force: true }).catch(() => {});
  await sleep(500);
  const opt = dlg.locator('[role="option"]').first();
  const srcCode = (await opt.getAttribute('data-value')) || '';
  await opt.click({ force: true }).catch(() => {});
  const netBefore = R.network.length;
  await dlg.getByTestId('hdsd-candidate-form-submit').click({ force: true });
  await sleep(4500);
  const post = R.network.slice(netBefore).find((n) => n.method === 'POST' && /candidates-pool/.test(n.url));
  R.uvPost = post;
  R.uvSourceCode = srcCode;
  R.ack = post?.status >= 200 && post?.status < 300 ? 'UV_PASS' : 'UV_FAIL';
  save();
  await browser.close();
}

main().catch((e) => {
  R.error = String(e);
  save();
  console.error(e);
  process.exit(1);
});
