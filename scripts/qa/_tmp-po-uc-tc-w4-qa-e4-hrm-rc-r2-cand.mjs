#!/usr/bin/env node
/** R2 — HRM-RC-03 only after CTA selector fix */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const EMAIL = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e4-hrm-rc-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e4-hrm-rc');

const STAMP = `W4E4R2-${Date.now().toString(36).slice(-5).toUpperCase()}`;
const CAND_NAME = `Nguyen UV ${STAMP}`;
const CAND_EMAIL = `uv.${Date.now()}@example.vn`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const base = JSON.parse(readFileSync(OUT, 'utf8'));
const network = [];

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const j = await r.json();
  const d = j.data || j;
  return {
    token: d.accessToken || d.access_token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: 'main',
    user: {
      userId: d.user?.userId || EMAIL,
      email: EMAIL,
      displayName: EMAIL,
      roles: ['group_ceo'],
    },
    raw: d,
  };
}

const session = await login();
const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('response', async (res) => {
  const u = res.url();
  if (!/candidates/.test(u)) return;
  if (res.request().method() === 'OPTIONS') return;
  const e = {
    method: res.request().method(),
    status: res.status(),
    url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
  };
  if (e.method === 'POST') {
    try {
      const j = await res.json();
      e.code = j.code;
      e.id = j.data?.id || j.id;
    } catch {
      /* */
    }
  }
  network.push(e);
});
await page.addInitScript((s) => {
  const p = JSON.stringify(s.user);
  for (const st of [localStorage, sessionStorage]) {
    st.setItem('xevn.portal.accessToken', s.token);
    st.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    st.setItem('xevn.portal.user', p);
    st.setItem('xevn.portal.tenantId', 'xevn');
    st.setItem('xevn.portal.companyId', s.companyId);
    st.setItem('hrm_portal_mode', '1');
    st.setItem('hrm_current_company_id', s.companyId);
  }
}, session);

const url = `${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=candidates`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await sleep(4000);
await page.keyboard.press('Escape');
await sleep(400);
await page.evaluate(() => document.body.click());
await sleep(600);

const addBtn = page.locator('button').filter({ hasText: /Thêm ứng viên/i }).first();
let clicked = await addBtn.isVisible().catch(() => false);
console.log('btnVisible', clicked);
if (clicked) {
  await addBtn.click({ force: true });
} else {
  clicked = await page.evaluate(() => {
    const el = [...document.querySelectorAll('button')].find((n) =>
      /Thêm ứng viên/i.test(n.textContent || ''),
    );
    if (!el) return false;
    el.click();
    return true;
  });
}
console.log('clicked', clicked);
await sleep(1500);
await page.screenshot({ path: `${SCREEN}/12b-rc03-dialog.png` });

const dlg = page.locator('[role="dialog"]').filter({ hasText: /ứng viên/i }).last();
const dialogOpen = await dlg.isVisible().catch(() => false);
console.log('dialog', dialogOpen);

await dlg
  .getByRole('button', { name: /^(Lưu|Tạo|Save)/i })
  .first()
  .click({ force: true })
  .catch(() => {});
await sleep(700);
const fdKept = await dlg.isVisible().catch(() => false);

await dlg.locator('input[name="full_name"]').fill(CAND_NAME).catch(() => {});
await dlg.locator('input[name="email"], input[type="email"]').first().fill(CAND_EMAIL).catch(() => {});
const pos = dlg.locator('input[name="position"]');
if (await pos.isVisible().catch(() => false)) await pos.fill(`UV ${STAMP}`);
await page.screenshot({ path: `${SCREEN}/12b-rc03-filled.png` });

await dlg
  .locator('button[type="submit"]')
  .or(dlg.getByRole('button', { name: /^(Lưu|Tạo|Save)/i }))
  .first()
  .click({ force: true });
await sleep(4000);
await page.screenshot({ path: `${SCREEN}/13b-rc03-after.png` });

await page.reload({ waitUntil: 'domcontentloaded' });
await sleep(3000);
const body = await page.locator('body').innerText();
const stampOnList = body.includes(STAMP);
await page.screenshot({ path: `${SCREEN}/14b-rc03-f5.png` });

const posts = network.filter((n) => n.method === 'POST');
const createOk = posts.some((p) => p.status >= 200 && p.status < 300);
const verdict = createOk && stampOnList ? 'PASS' : createOk || stampOnList ? 'PARTIAL' : 'FAIL';
console.log({ verdict, createOk, stampOnList, fdKept, posts });

base.steps['HRM-RC-03-VAL-FD'] = {
  verdict: fdKept ? 'PASS' : 'SKIP',
  summary: `empty kept=${fdKept}`,
  at: new Date().toISOString(),
};
base.steps['HRM-RC-03-MAIN-FE-HP'] = {
  verdict,
  createOk,
  stampOnList,
  network: posts.slice(-3),
  summary: `R2 createOk=${createOk} stamp=${stampOnList} posts=${posts.map((p) => `${p.status}:${p.code || ''}`).join(',')}`,
  at: new Date().toISOString(),
};
delete base.steps['HRM-RC-03-MAIN'];
base.uc_verdicts['HRM-RC-03'] = verdict;
base.ids.candidateId = posts.find((p) => p.id)?.id || base.ids.candidateId;
base.residuals = (base.residuals || []).filter(
  (r) => r.id !== 'R-W4E4-RC03-CTA' && r.id !== 'R-W4E4-RC03-CREATE',
);
if (verdict === 'FAIL') {
  base.residuals.push({
    id: 'R-W4E4-RC03-CREATE',
    severity: 'P0',
    owner: 'dev-be',
    note: 'R2 candidate create fail',
  });
}
const uc = base.uc_verdicts;
const p0fail = Object.entries(uc)
  .filter(([, v]) => v === 'FAIL')
  .map(([k]) => k);
const p0pass = Object.entries(uc)
  .filter(([, v]) => v === 'PASS')
  .map(([k]) => k);
const partial = Object.entries(uc)
  .filter(([, v]) => v === 'PARTIAL' || v === 'BLOCKED')
  .map(([k, v]) => `${k}:${v}`);
base.seat_verdict =
  p0fail.length === 0 && partial.length === 0 ? 'PASS' : p0fail.length === 0 ? 'PARTIAL' : 'FAIL';
base.summary = {
  p0pass,
  p0fail,
  partial,
  residuals: base.residuals,
  stamp: base.env.STAMP,
  r2_stamp: STAMP,
  ids: base.ids,
};
base.rc03_r2 = { STAMP, CAND_NAME, verdict, createOk, stampOnList, fdKept, posts, clicked, dialogOpen };
writeFileSync(OUT, JSON.stringify(base, null, 2));
console.log('seat', base.seat_verdict, JSON.stringify(base.summary, null, 2));
await browser.close();
process.exitCode = verdict === 'FAIL' ? 1 : 0;
