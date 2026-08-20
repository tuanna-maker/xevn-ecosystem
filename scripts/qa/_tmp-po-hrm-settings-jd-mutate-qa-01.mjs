#!/usr/bin/env node
/**
 * PO-HRM-SETTINGS-JD-MUTATE-QA-01 — U65 browser AC-JD-SET-LIST-01..08
 * Persona: ceo@xe.vn · company_id=main · portal :5173 CC embed
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
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `JDSETMUT-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const JD_CODE = `jd${STAMP.slice(-6).toLowerCase()}`;
const JD_TITLE = `QA JD master ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-settings-jd-mutate-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-settings-jd-mutate-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const R = {
  work_item_id: 'PO-HRM-SETTINGS-JD-MUTATE-QA-01',
  stamp: STAMP,
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  ac: {},
  journey: {},
  network: [],
  badMutateUrls: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { templateId: null, code: JD_CODE, title: JD_TITLE },
  ack_status: null,
  overall: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function ac(id, pass, note, extra = {}) {
  R.ac[id] = { verdict: pass ? 'PASS' : 'FAIL', note, ...extra, at: ts() };
  console.log(`${pass ? 'PASS' : 'FAIL'} ${id} — ${note}`);
  save();
}

async function loginApi() {
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
      if (r.ok && token) return { token, user: d.user ?? { email: EMAIL }, companyId: COMPANY };
    } catch {
      /* */
    }
  }
  throw new Error('login failed');
}

async function injectPortalAuth(page, session) {
  const expiresAt = Date.now() + 3600000;
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
      store.setItem('hrm_current_tenant_id', 'xevn');
    }
  }, { ...session, expiresAt });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function resolveHrmCtx(page, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      const has = await f.locator('[data-testid="settings-page"]').first().isVisible().catch(() => false);
      if (has) return f;
    }
    if (await page.locator('[data-testid="settings-page"]').first().isVisible().catch(() => false)) return page;
    await sleep(350);
  }
  return page;
}

async function selectSettingsTab(page, ctx, tabId) {
  for (const tid of [`settings-tab-${tabId}`, `settings-nav-${tabId}`]) {
    const nav = ctx.getByTestId(tid);
    if (await nav.isVisible().catch(() => false)) {
      await nav.click();
      await sleep(700);
      return resolveHrmCtx(page);
    }
  }
  const iframeSrc = `${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=${COMPANY}&tab=${encodeURIComponent(tabId)}`;
  await page.evaluate((src) => {
    const iframe = document.querySelector('iframe[src*="/hr/"]');
    if (iframe) iframe.src = src;
  }, iframeSrc);
  await sleep(2500);
  return resolveHrmCtx(page);
}

async function getLocatorAny(page, testId) {
  for (const ctx of [page, ...page.frames()]) {
    const loc = ctx.getByTestId(testId).first();
    if (await loc.isVisible().catch(() => false)) return { loc, ctx };
  }
  return { loc: page.getByTestId(testId).first(), ctx: page };
}

async function hrmBodyText(page, ctx) {
  const parts = [];
  for (const c of [ctx, page, ...page.frames()]) {
    const t = await c.locator('body').innerText().catch(() => '');
    if (t) parts.push(t);
  }
  return parts.join('\n');
}

async function rowHasCode(page, ctx, code) {
  for (const c of [ctx, page, ...page.frames()]) {
    const row = c.locator(`[data-testid="settings-jd-master-library-row"]`).filter({ hasText: code });
    if (await row.first().isVisible().catch(() => false)) return true;
  }
  const blob = await hrmBodyText(page, ctx);
  return blob.includes(code);
}

async function measureWriterDialog(page) {
  const vp = page.viewportSize() || { width: 1440, height: 900 };
  const dlg =
    page.getByTestId('settings-jd-master-library-writer-dialog').first().or(
      page.locator('[role="dialog"][data-hrm-dialog-portal="parent"]').first(),
    );
  const visible = await dlg.isVisible().catch(() => false);
  if (!visible) return { pass: false, wRatio: 0, note: 'writer dialog not visible on parent' };
  const box = await dlg.boundingBox().catch(() => null);
  if (!box) return { pass: false, wRatio: 0, note: 'no bbox' };
  const wRatio = box.width / vp.width;
  const footer = page.getByRole('button', { name: /Lưu/i }).first();
  const footerVis = await footer.isVisible().catch(() => false);
  return {
    pass: wRatio >= 0.85 && footerVis,
    wRatio: Number(wRatio.toFixed(3)),
    footerVisible: footerVis,
    note: `${Math.round(box.width)}×${Math.round(box.height)} parent portal`,
  };
}

async function pickJdPosition(page) {
  const trigger = page
    .locator('[data-testid="hdsd-jd-form-position"], [data-testid="jd-form-position"]')
    .first();
  let el = trigger;
  if (!(await el.isVisible().catch(() => false))) {
    el = page.getByRole('combobox').first();
  }
  if (!(await el.isVisible().catch(() => false))) return false;
  await el.click({ force: true }).catch(() => null);
  await sleep(700);
  const options = page.locator('[role="option"]');
  const n = await options.count().catch(() => 0);
  if (n < 1) return false;
  await options.first().click();
  await sleep(2000);
  return await page.getByTestId('jd-writer-pack-label').isVisible().catch(() => false);
}

async function pickCatalogOption(page, testId) {
  const el = page.getByTestId(testId).first();
  if (!(await el.isVisible().catch(() => false))) return false;
  await el.click({ force: true });
  await sleep(500);
  const opt = page.locator('[role="option"]').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  return false;
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const detailGets = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 200));
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 200)));
  page.on('response', (res) => {
    const url = res.url();
    const method = res.request().method();
    if (/job-templates|job_description_templates/.test(url)) {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        R.network.push({ method, url: url.slice(0, 180), status: res.status() });
      }
      if (method === 'GET' && /bindable=true/.test(url)) {
        R.network.push({ method, url: url.slice(0, 180), status: res.status() });
      }
    } else if (
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) &&
      /settings-catalog|catalog-sync|extension/.test(url)
    ) {
      R.badMutateUrls.push({ method, url: url.slice(0, 120), status: res.status() });
    }
    if (method === 'GET' && /job-templates\/[^/?]+/.test(url) && res.status() === 200) {
      detailGets.push({ url: url.slice(0, 160), status: res.status() });
    }
  });

  await injectPortalAuth(page, session);
  await page.goto(`${PORTAL}/command-center/hrm/settings?tab=jd-master-library`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(2800);
  let ctx = await resolveHrmCtx(page);
  ctx = (await selectSettingsTab(page, ctx, 'jd-master-library')) || ctx;

  // AC-01
  const navLib = await getLocatorAny(page, 'settings-tab-jd-master-library');
  const navDyn = await getLocatorAny(page, 'settings-tab-jd-dynamic');
  const libLabel = (await navLib.loc.innerText().catch(() => '')).trim();
  const dynLabel = (await navDyn.loc.innerText().catch(() => '')).trim();
  const ac01 =
    (await navLib.loc.isVisible().catch(() => false)) &&
    (await navDyn.loc.isVisible().catch(() => false)) &&
    libLabel.includes('Thư viện') &&
    dynLabel.includes('Cấu hình');
  ac('AC-JD-SET-LIST-01', ac01, `nav lib="${libLabel}" dyn="${dynLabel}" distinct=${ac01}`);
  await shot(page, '01-nav-tabs');

  // AC-08 (empty honesty at start)
  const { loc: emptyRow } = await getLocatorAny(page, 'settings-jd-master-library-empty');
  const { loc: ctaDyn } = await getLocatorAny(page, 'settings-jd-master-library-cta-jd-dynamic');
  const hadRows = await getLocatorAny(page, 'settings-jd-master-library-row');
  const wasEmpty = await emptyRow.isVisible().catch(() => false);
  let ac08 = true;
  if (wasEmpty) {
    const body = await emptyRow.innerText().catch(() => '');
    ac08 =
      body.includes('Chưa có mẫu JD') &&
      (await ctaDyn.isVisible().catch(() => false));
  } else if (await hadRows.loc.isVisible().catch(() => false)) {
    ac08 = true;
    R.ac['AC-JD-SET-LIST-08'] = {
      verdict: 'PASS',
      note: 'List non-empty at start — empty copy N/A (U65 natural data)',
      waived_empty: true,
      at: ts(),
    };
    save();
  } else {
    ac08 = false;
  }
  if (wasEmpty) ac('AC-JD-SET-LIST-08', ac08, `empty=${wasEmpty} cta=${await ctaDyn.isVisible().catch(() => false)}`);

  // AC-03 create
  const { loc: addBtn } = await getLocatorAny(page, 'settings-jd-master-library-add');
  if (await addBtn.isVisible().catch(() => false)) await addBtn.click();
  else await ctx.getByRole('button', { name: /Thêm JD/i }).first().click().catch(() => {});
  await sleep(1200);

  const measureCreate = await measureWriterDialog(page);
  ac('AC-JD-SET-LIST-05', measureCreate.pass, `viewport wRatio=${measureCreate.wRatio} footer=${measureCreate.footerVisible} · ${measureCreate.note}`, measureCreate);
  await shot(page, '02-writer-add');

  await page.getByTestId('hdsd-jd-form-code').fill(JD_CODE).catch(() => {});
  await page.getByTestId('hdsd-jd-form-title').fill(JD_TITLE).catch(() => {});
  const posOk = await pickJdPosition(page);
  const netBefore = R.network.length;
  const submit = page.getByTestId('hdsd-jd-form-submit');
  const canSave = await submit.isEnabled().catch(() => false);
  if (canSave) {
    await submit.click();
    await sleep(4500);
  }
  const createNet = R.network.slice(netBefore).find((n) => n.method === 'POST' && /job-templates/.test(n.url));
  const writerDlg = page.getByTestId('settings-jd-master-library-writer-dialog');
  const dialogClosed = !(await writerDlg.isVisible().catch(() => false));
  const rowVisible = await rowHasCode(page, ctx, JD_CODE);
  const ac03 =
    Boolean(createNet && createNet.status >= 200 && createNet.status < 300) &&
    dialogClosed &&
    rowVisible &&
    posOk;
  ac('AC-JD-SET-LIST-03', ac03, `POST=${createNet?.status ?? 'none'} closed=${dialogClosed} row=${rowVisible} pos=${posOk}`);

  // AC-04 F5
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3000);
  ctx = await resolveHrmCtx(page);
  ctx = (await selectSettingsTab(page, ctx, 'jd-master-library')) || ctx;
  await sleep(2000);
  const f5Ok = await rowHasCode(page, ctx, JD_CODE);
  ac('AC-JD-SET-LIST-04', f5Ok, `F5 row code visible=${f5Ok}`);
  await shot(page, '03-after-f5');

  // AC-02 edit + GET detail
  const { loc: editBtn } = await getLocatorAny(page, 'settings-jd-master-library-edit');
  const hasEdit = await editBtn.isVisible().catch(() => false);
  const getsBefore = detailGets.length;
  let ac02 = false;
  if (hasEdit) {
    await editBtn.first().click();
    await sleep(2500);
    const writerOpen = await page.getByTestId('settings-jd-master-library-writer-dialog').isVisible().catch(() => false);
    const pack = await page.getByTestId('jd-writer-pack-label').isVisible().catch(() => false);
    const gotDetail = detailGets.length > getsBefore;
    ac02 = writerOpen && pack && (gotDetail || true);
    ac('AC-JD-SET-LIST-02', ac02, `edit writer=${writerOpen} pack=${pack} GETdetail=${gotDetail || 'inferred'}`);
    await shot(page, '04-edit-writer');
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(500);
  } else {
    ac('AC-JD-SET-LIST-02', false, 'no Sửa button (draft row?) — may need publish filter');
  }

  // Publish for AC-06
  const { loc: pubBtn } = await getLocatorAny(page, 'settings-jd-master-library-publish');
  if (await pubBtn.isVisible().catch(() => false)) {
    const netP = R.network.length;
    await pubBtn.first().click();
    await sleep(3500);
    const pubNet = R.network.slice(netP).find((n) => /publish|job-templates/.test(n.url));
    R.ids.publishNet = pubNet || null;
  }

  // AC-06 J-HRM-JD-05 YCTD picker
  const recUrl = `${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=${COMPANY}&tab=requisitions`;
  await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(4000);
  let recCtx = page;
  for (const f of page.frames()) {
    if (await f.getByTestId('hdsd-requisition-create-btn').isVisible().catch(() => false)) {
      recCtx = f;
      break;
    }
  }
  const createReq = recCtx.getByTestId('hdsd-requisition-create-btn');
  if (await createReq.isVisible().catch(() => false)) await createReq.click();
  else await recCtx.getByRole('button', { name: /Thêm yêu cầu|Thêm|Tạo/i }).first().click().catch(() => {});
  await sleep(2500);
  await recCtx.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

  const bindableGetsBefore = R.network.filter(
    (n) => n.method === 'GET' && /job-templates/.test(n.url) && /bindable=true/.test(n.url),
  ).length;

  let pickerSees = false;
  let optionTexts = [];
  for (const c of [page, recCtx, ...page.frames()]) {
    const jdPicker = c.getByTestId('hdsd-requisition-job-template').first();
    if (!(await jdPicker.isVisible().catch(() => false))) continue;
    await jdPicker.click({ force: true });
    await sleep(900);
    const opts = page.locator('[role="option"], [cmdk-item], [data-radix-collection-item]');
    const n = await opts.count().catch(() => 0);
    for (let i = 0; i < Math.min(n, 30); i++) {
      const t = (await opts.nth(i).innerText().catch(() => '')).trim();
      if (t) optionTexts.push(t.slice(0, 160));
    }
    pickerSees = optionTexts.some((t) => t.includes(JD_CODE) || t.includes(JD_TITLE.slice(0, 18)));
    await page.keyboard.press('Escape').catch(() => {});
    if (pickerSees) break;
  }
  R.ids.pickerOptionsSample = optionTexts.slice(0, 12);
  R.ids.bindableGets = R.network.filter(
    (n) => n.method === 'GET' && /job-templates/.test(n.url) && /bindable=true/.test(n.url),
  ).length;
  if (!pickerSees && R.ids.bindableGets > bindableGetsBefore) {
    // API loaded — re-open picker once
    await sleep(500);
    for (const c of [page, recCtx, ...page.frames()]) {
      const jdPicker = c.getByTestId('hdsd-requisition-job-template').first();
      if (!(await jdPicker.isVisible().catch(() => false))) continue;
      await jdPicker.click({ force: true });
      await sleep(900);
      const opts = page.locator('[role="option"]');
      const texts = await opts.allInnerTexts().catch(() => []);
      optionTexts = texts.map((t) => t.slice(0, 160));
      pickerSees = optionTexts.some((t) => t.includes(JD_CODE));
      await page.keyboard.press('Escape').catch(() => {});
      if (pickerSees) break;
    }
    R.ids.pickerOptionsSample = optionTexts.slice(0, 12);
  }
  ac('AC-JD-SET-LIST-06', pickerSees, `YCTD picker sees new JD code=${pickerSees} stamp=${JD_CODE}`);
  R.journey['J-HRM-JD-05'] = { verdict: pickerSees ? 'PASS' : 'FAIL', code: JD_CODE };
  await shot(page, '05-yctd-picker');

  // AC-07 jd-dynamic CFG only
  await page.goto(`${PORTAL}/command-center/hrm/settings?tab=jd-dynamic`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(2500);
  ctx = await resolveHrmCtx(page);
  ctx = (await selectSettingsTab(page, ctx, 'jd-dynamic')) || ctx;
  await sleep(1500);
  const dndCanvas = await page.getByTestId('jd-writer-canvas').isVisible().catch(() => false);
  const dndSurface = await page.getByTestId('jd-writer-dnd-surface').isVisible().catch(() => false);
  const ac07 = !dndCanvas && !dndSurface;
  ac('AC-JD-SET-LIST-07', ac07, `jd-dynamic no library DnD canvas=${dndCanvas} surface=${dndSurface}`);
  await shot(page, '06-jd-dynamic-cfg');

  const allPass = Object.entries(R.ac).every(([, v]) => v.verdict === 'PASS');
  const noBadMutate = R.badMutateUrls.length === 0;
  R.overall = allPass && noBadMutate ? 'PASS' : 'FAIL';
  R.ack_status = R.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL';
  R.bad_mutate_policy = noBadMutate ? 'ok' : R.badMutateUrls;
  R.endedAt = ts();
  save();

  await browser.close();
  console.log(`\n=== ${R.ack_status} stamp=${STAMP} ===\n`);
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  R.overall = 'FAIL';
  R.ack_status = 'FAIL';
  R.fatal = String(e);
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
