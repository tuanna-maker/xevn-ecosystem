#!/usr/bin/env node
/** One-shot UV mutate after open_for_hire YCTD — QA retest #4 */
import { chromium } from 'playwright';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const YCTD_STAMP = process.env.QA_YCTD_PREFER_STAMP || 'MSNJV0SR';
const STAMP = `RECCHQA-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  const data = (await r.json()).data;
  return { token: data.accessToken, user: data.user, companyId: 'main', expiresAt: Date.now() + 3600000 };
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
    }
  }, session);
}

async function findFrame(page, testId) {
  for (const h of [page, ...page.frames()]) {
    if (await h.getByTestId(testId).first().isVisible({ timeout: 500 }).catch(() => false)) return h;
  }
  return page;
}

async function main() {
  const session = await loginApi();
  const network = [];
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  const page = await browser.newPage();
  page.on('response', async (res) => {
    const url = res.url();
    if (!/candidates-pool/.test(url) || res.request().method() !== 'POST') return;
    let body = null;
    try {
      body = JSON.parse(res.request().postData() || '{}');
    } catch {
      body = res.request().postData();
    }
    network.push({ status: res.status(), url: url.slice(0, 180), body });
  });
  await inject(page, session);
  const url = `${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=candidates`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(4000);
  const host = await findFrame(page, 'hdsd-candidate-create-btn');
  await host.getByTestId('hdsd-candidate-create-btn').click({ force: true });
  await sleep(2500);
  const dlg = await findFrame(page, 'hdsd-candidate-form-dialog');
  const yctd = dlg.getByTestId('hdsd-candidate-form-yctd').first();
  await yctd.click({ force: true });
  await sleep(700);
  const yctdOpt = page.getByRole('option', { name: new RegExp(YCTD_STAMP) }).first();
  if (await yctdOpt.isVisible({ timeout: 8000 }).catch(() => false)) {
    await yctdOpt.click({ force: true });
  } else {
    throw new Error('YCTD option not found for stamp ' + YCTD_STAMP);
  }
  await sleep(500);
  const submitBtn = dlg.getByTestId('hdsd-candidate-form-submit');
  const submitDisabled = await submitBtn.isDisabled().catch(() => true);
  if (submitDisabled) {
    console.log(JSON.stringify({ error: 'submit still disabled after YCTD pick' }));
    await browser.close();
    process.exit(1);
  }
  await dlg.getByLabel(/Họ và tên|Họ tên/i).fill(`UV Kênh QA ${STAMP}`);
  await dlg.getByLabel(/Email/i).fill(`rec.ch.qa.${STAMP.toLowerCase()}@xe.vn`);
  const src = dlg.getByTestId('hdsd-candidate-form-source');
  await src.click({ force: true });
  await sleep(800);
  const srcOpt = page.getByRole('option', { name: /Website|CSO_01/i }).first();
  await srcOpt.waitFor({ state: 'visible', timeout: 15000 });
  const srcCode = (await srcOpt.getAttribute('data-value')) || 'CSO_01';
  await srcOpt.click({ force: true });
  const postWait = page.waitForResponse(
    (res) => /candidates-pool/.test(res.url()) && res.request().method() === 'POST',
    { timeout: 45000 },
  );
  await dlg.getByTestId('hdsd-candidate-form-submit').click({ force: true });
  const postRes = await postWait.catch(() => null);
  await sleep(2000);
  const r = await fetch(`${HRM}/api/hrm/recruitment/candidates-pool?company_id=main`, {
    headers: { authorization: `Bearer ${session.token}`, 'x-tenant-id': 'xevn' },
  });
  const pool = await r.json();
  const items = pool?.data?.items ?? [];
  const hit = items.find((x) => JSON.stringify(x).includes(STAMP));
  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        yctdStamp: YCTD_STAMP,
        postStatus: postRes?.status() ?? null,
        network,
        poolHit: hit ? { source: hit.source, name: hit.full_name || hit.name } : null,
        poolCount: items.length,
      },
      null,
      2,
    ),
  );
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
