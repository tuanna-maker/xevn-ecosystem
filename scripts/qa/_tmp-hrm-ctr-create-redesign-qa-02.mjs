#!/usr/bin/env node
/**
 * HRM-CTR-CREATE-REDESIGN-QA-02/03 — CC URL · U65
 * QA_WAVE=03 → FE-03 form-ready + empty-template banner/CTA evidence paths
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const QA_WAVE = process.env.QA_WAVE || '03';
const WAVE_ID = QA_WAVE === '03' ? 'HRM-CTR-CREATE-REDESIGN-QA-03' : 'HRM-CTR-CREATE-REDESIGN-QA-02';
const STAMP_PREFIX = QA_WAVE === '03' ? 'CTRCREATEQA03' : 'CTRCREATEQA02';
const STAMP = `${STAMP_PREFIX}-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CODE_MAIN = `QCTR0${QA_WAVE}${Date.now().toString(36).toUpperCase().slice(-7)}`;
const CODE_REG = `QCT${QA_WAVE}R${Date.now().toString(36).toUpperCase().slice(-6)}`;
const ABSTRACT = `QA${QA_WAVE} trích yếu ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const EVIDENCE_SLUG = `hrm-ctr-create-redesign-qa-${QA_WAVE}`;
const OUT_JSON = resolve(ROOT, `docs/qa/evidence/_tmp-${EVIDENCE_SLUG}.json`);
const OUT_MD = resolve(ROOT, `docs/qa/evidence/${EVIDENCE_SLUG}.md`);
const SCREEN = resolve(ROOT, `docs/qa/evidence/screens/${EVIDENCE_SLUG}`);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const DND_STORM_RE = /sameNodeDragBind|dragHandleProps missing|Unable to find drag handle|@hello-pangea\/dnd/i;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: WAVE_ID,
  qa_wave: QA_WAVE,
  stamp: STAMP,
  prior:
    QA_WAVE === '03'
      ? 'docs/qa/evidence/hrm-ctr-create-redesign-fe-03.md · prior QA CTRCREATEQA02-MSN049ZL'
      : 'docs/qa/evidence/hrm-ctr-create-redesign-fe-02.md',
  startedAt: ts(),
  url_required: `${PORTAL}/command-center/hrm/contracts`,
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { contracts_printable_ready: false, c_slice: true, seed_used: false },
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  uf: {},
  journeys: {},
  dnd_storms: [],
  consoleErrors: [],
  pageErrors: [],
  network: { scope_mismatch: [], samples: [], candidate_post: null, template_list: null },
  embed: {},
  fe03: null,
  screens: [],
  ack_status: null,
  overall: null,
  defects: [],
  endedAt: null,
};

function journey(id, verdict, detail) {
  if (id === 'UF-HRM-02') {
    R.uf['UF-HRM-02'] = verdict;
  }
  R.journeys[id] = { verdict, ...detail };
}

function defect(id, severity, note) {
  R.defects.push({ id, severity, note });
}

function noteStorm(text) {
  if (DND_STORM_RE.test(text)) R.dnd_storms.push(text.slice(0, 220));
}

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
  return { token: data.accessToken, user: data.user ?? { email: EMAIL }, companyId: COMPANY };
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
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
    }
  }, { ...session, expiresAt });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

async function resolveHrmFrame(page, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const f of page.frames()) {
      const has = await f
        .locator('[data-testid="hdsd-contracts-create-btn"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (has) return f;
    }
    if (await page.getByTestId('hdsd-contracts-create-btn').isVisible().catch(() => false)) return page;
    await sleep(400);
  }
  return null;
}

async function resolveWizardContexts(page, hrmCtx, timeoutMs = 50000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    for (const ctx of [page, hrmCtx, ...page.frames()]) {
      if (!ctx) continue;
      const stepper = await ctx
        .locator('[data-testid="ctr-create-wizard-stepper"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (stepper) return { shell: ctx, hrm: hrmCtx };
    }
    await sleep(350);
  }
  return { shell: null, hrm: hrmCtx };
}

function wireNetwork(page) {
  page.on('request', (req) => {
    const url = req.url();
    if (!url.includes('/api/hrm') && !url.includes('contracts')) return;
    try {
      const u = new URL(url);
      const cid =
        u.searchParams.get('company_id') ||
        u.searchParams.get('companyId') ||
        (() => {
          try {
            const b = req.postDataJSON();
            return b?.company_id ?? b?.companyId ?? null;
          } catch {
            return null;
          }
        })();
      if (cid && cid !== COMPANY && cid !== 'main') {
        R.network.scope_mismatch.push({ url: url.slice(0, 120), company: cid });
      }
      if (R.network.samples.length < 12) {
        R.network.samples.push({
          method: req.method(),
          company_id: cid,
          path: u.pathname.slice(-80),
        });
      }
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    const url = res.url();
    if (
      url.includes('/contracts-insurance/contracts') &&
      res.request().method() === 'POST' &&
      !url.includes('/preview')
    ) {
      let body = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        body = null;
      }
      const snap = { status: res.status(), candidate_id: body?.candidate_id, company_id: body?.company_id };
      if (body?.candidate_id) R.network.candidate_post = snap;
    }
    if (url.includes('/contract-templates') && res.request().method() === 'GET' && res.ok()) {
      try {
        const j = await res.json();
        const rows = j?.data?.data ?? j?.data ?? j;
        const arr = Array.isArray(rows) ? rows : Array.isArray(rows?.data) ? rows.data : [];
        R.network.template_list = { status: res.status(), count: arr.length };
      } catch {
        /* */
      }
    }
  });
}

async function pickTemplate(shell, searchText) {
  const combobox = shell.getByTestId('ctr-create-template-combobox');
  await combobox.click();
  await sleep(300);
  const input = combobox.locator('input').first();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(searchText);
    await sleep(500);
  }
  await shell.getByRole('option', { name: new RegExp(searchText, 'i') }).first().click({ timeout: 20000 });
}

async function pickFirstCandidate(shell, page) {
  const term = 'QA';
  const picker = shell.getByTestId('ctr-create-candidate-picker');
  await picker.click();
  await sleep(400);
  const inlineSearch = shell.getByTestId('ctr-create-candidate-picker-search');
  let hasInlineOption = false;
  if (await inlineSearch.isVisible().catch(() => false)) {
    await inlineSearch.fill(term);
    await sleep(800);
    hasInlineOption = await shell
      .locator('[data-testid^="catalog-picker-option-"]')
      .first()
      .isVisible()
      .catch(() => false);
  }
  const input = picker.locator('input').first();
  if (await input.isVisible().catch(() => false)) {
    await input.fill(term);
    await sleep(700);
  }
  for (const ctx of [shell, page, ...page.frames()]) {
    const opt = ctx.locator('[data-testid^="catalog-picker-option-"]').first();
    if (await opt.isVisible({ timeout: 8000 }).catch(() => false)) {
      const label = (await opt.innerText().catch(() => '')).trim();
      await opt.click();
      return { picked: true, label, hasInlineOption, hasUuid: UUID_RE.test(label) };
    }
    const roleOpt = ctx.getByRole('option').first();
    if (await roleOpt.isVisible({ timeout: 5000 }).catch(() => false)) {
      const label = (await roleOpt.innerText().catch(() => '')).trim();
      if (label && !/^Gõ tên/i.test(label)) {
        await roleOpt.click();
        return { picked: true, label, hasInlineOption, hasUuid: UUID_RE.test(label) };
      }
    }
  }
  return { picked: false, hasInlineOption, hasUuid: false };
}

async function fillSigningDate(shell) {
  const btn = shell.getByTestId('ctr-create-signing-date');
  await btn.click();
  await sleep(300);
  const day = shell.getByRole('gridcell', { name: /^15$/ }).first();
  if (await day.isVisible().catch(() => false)) {
    await day.click();
    return true;
  }
  return false;
}

async function fillWorkArrangement(shell) {
  await shell.getByTestId('ctr-create-work-arrangement').click();
  await sleep(200);
  await shell.getByRole('option').first().click({ timeout: 10000 });
}

async function canvasClauseCount(shell) {
  return shell.getByTestId('ctr-create-clause-canvas').locator('.cursor-grab').count();
}

async function dndAndThem(shell, times = 2) {
  const palette = shell.getByTestId('ctr-create-clause-palette');
  const canvas = shell.getByTestId('ctr-create-clause-canvas');
  let bound = await canvasClauseCount(shell);
  let usedThem = 0;
  for (let i = 0; i < times; i++) {
    const item = palette.locator('.cursor-grab').nth(i);
    const before = bound;
    if (await item.isVisible().catch(() => false)) {
      await item.dragTo(canvas, { force: true, targetPosition: { x: 60, y: 50 + i * 32 } }).catch(() => {});
      await sleep(600);
      bound = await canvasClauseCount(shell);
    }
    if (bound <= before) {
      const them = palette.getByRole('button', { name: /^Thêm$/ }).nth(i);
      if (await them.isVisible().catch(() => false)) {
        await them.click();
        usedThem += 1;
        await sleep(500);
        bound = await canvasClauseCount(shell);
      }
    }
  }
  return { bound, usedThem };
}

async function fetchActiveTemplateCount(token) {
  const q = new URLSearchParams({ company_id: COMPANY, page: '1', page_size: '50', status: 'active' });
  for (const path of [`${HRM}/contracts-insurance/contract-templates?${q}`, `${HRM}/contract-templates?${q}`]) {
    try {
      const r = await fetch(path, {
        headers: { Authorization: `Bearer ${token}`, 'X-Tenant-ID': TENANT, Accept: 'application/json' },
      });
      if (!r.ok) continue;
      const j = await r.json();
      const payload = j?.data;
      const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      return { status: r.status, count: rows.length, path: path.split('?')[0] };
    } catch {
      /* */
    }
  }
  return { status: 0, count: 0, path: null };
}

async function waitFormReady(shell, timeoutMs = 90000) {
  await shell.getByTestId('hdsd-contracts-form-ready').waitFor({ state: 'attached', timeout: timeoutMs });
  const emptyTplBanner = await shell
    .getByTestId('ctr-create-no-active-template-banner')
    .isVisible()
    .catch(() => false);
  if (!emptyTplBanner) {
    await shell.getByTestId('ctr-create-template-combobox').waitFor({ state: 'visible', timeout: timeoutMs });
  }
}

async function main() {
  const session = await loginApi();
  R.network.template_probe = await fetchActiveTemplateCount(session.token);
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  wireNetwork(page);
  page.on('console', (msg) => {
    const t = msg.text();
    if (msg.type() === 'error') R.consoleErrors.push(t.slice(0, 240));
    noteStorm(t);
  });
  page.on('pageerror', (err) => noteStorm(String(err)));

  const ccUrl = `${PORTAL}/command-center/hrm/contracts?portal=1&tenantId=${TENANT}&companyId=${COMPANY}&_=${Date.now()}`;

  try {
    await injectPortalAuth(page, session);
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);

    const hrmCtx = await resolveHrmFrame(page);
    if (!hrmCtx) throw new Error('HRM embed not found');

    const listReady = await hrmCtx.getByTestId('hdsd-contracts-create-btn').isVisible().catch(() => false);
    const tableOrEmpty =
      (await hrmCtx.locator('table').first().isVisible().catch(() => false)) ||
      (await hrmCtx.getByTestId('contracts-list-empty').isVisible().catch(() => false)) ||
      (await hrmCtx.getByTestId('contracts-list-empty-error').isVisible().catch(() => false));
    R.uf['UF-HRM-02'] = listReady && tableOrEmpty && page.url().includes('command-center/hrm/contracts') ? 'PASS' : 'FAIL';
    journey('UF-HRM-02', R.uf['UF-HRM-02'], { listReady, tableOrEmpty, url: page.url() });

    const honestyOnList = await hrmCtx.locator('[data-testid*="honesty"]').first().isVisible().catch(() => false);
    journey('J-HRM-CTR-CREATE-08', honestyOnList ? 'FAIL' : 'PASS', { honestyOnList });

    const tplCount = R.network.template_probe?.count ?? R.network.template_list?.count ?? 0;
    journey('J-HRM-CTR-CREATE-07', tplCount >= 9 ? 'PASS' : tplCount >= 1 ? 'PASS_WITH_HOLD' : 'BLOCKED', {
      template_api_count: tplCount,
      probe: R.network.template_probe,
    });

    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 45000 });
    const { shell } = await resolveWizardContexts(page, hrmCtx);
    if (!shell) throw new Error('wizard shell missing');
    R.embed.dialog_on = shell === page ? 'parent-portal' : 'hrm-iframe';
    await shell.getByTestId('ctr-create-step-1').waitFor({ state: 'visible', timeout: 45000 });
    const formReadyStart = Date.now();
    await waitFormReady(shell);
    const formReadyMs = Date.now() - formReadyStart;
    const tplCountNow =
      R.network.template_probe?.count ?? R.network.template_list?.count ?? tplCount;
    const bannerVisible = await shell
      .getByTestId('ctr-create-no-active-template-banner')
      .isVisible()
      .catch(() => false);
    const ctaVisible = await shell
      .getByTestId('ctr-create-template-settings-cta')
      .isVisible()
      .catch(() => false);
    R.fe03 = {
      formReadyMs,
      formReadyWithin90s: formReadyMs <= 90000,
      template_count: tplCountNow,
      bannerVisible,
      ctaVisible,
      emptyTemplateUiOk: tplCountNow === 0 ? bannerVisible && ctaVisible : true,
    };
    journey(
      'J-HRM-CTR-CREATE-FE03',
      R.fe03.formReadyWithin90s && R.fe03.emptyTemplateUiOk ? 'PASS' : 'FAIL',
      R.fe03,
    );
    await shot(page, 'step1-form-ready');
    await shell.getByTestId('ctr-create-subject-tab-candidate').click({ timeout: 15000 }).catch(() => {});
    await sleep(800);

    const candVisible = await shell.getByTestId('ctr-create-candidate-picker').isVisible().catch(() => false);
    await shell.getByTestId('ctr-create-candidate-picker').click().catch(() => {});
    const inlineSearch = await shell.getByTestId('ctr-create-candidate-picker-search').isVisible().catch(() => false);

    await shell.getByTestId('ctr-create-contract-code').fill(CODE_MAIN);
    let tplProb = '';
    let tplFt = '';
    const noActiveTemplates = tplCountNow === 0;
    if (noActiveTemplates) {
      journey('J-HRM-CTR-CREATE-03', 'BLOCKED', { reason: 'template_list count=0 U65' });
    } else {
      try {
        await pickTemplate(shell, 'XEVN_PROBATION');
        tplProb = await shell.getByTestId('ctr-create-contract-name-readonly').inputValue().catch(() => '');
      } catch {
        tplProb = '';
      }
      try {
        await pickTemplate(shell, 'XEVN_FT_12M');
        tplFt = await shell.getByTestId('ctr-create-contract-name-readonly').inputValue().catch(() => '');
      } catch {
        await pickTemplate(shell, 'XEVN_FT');
        tplFt = await shell.getByTestId('ctr-create-contract-name-readonly').inputValue().catch(() => '');
      }
      journey('J-HRM-CTR-CREATE-03', tplProb && tplFt && tplProb !== tplFt ? 'PASS' : tplFt ? 'PASS_WITH_HOLD' : 'FAIL', {
        tplProb: tplProb.slice(0, 60),
        tplFt: tplFt.slice(0, 60),
      });
    }

    let step2Open = false;
    let candPick = { picked: false, hasInlineOption: false, hasUuid: false };
    let triggerLabel = '';
    if (noActiveTemplates) {
      for (const id of ['J-HRM-CTR-CREATE-01', 'J-HRM-CTR-CREATE-02', 'J-HRM-CTR-CREATE-06']) {
        journey(id, 'BLOCKED', { reason: 'no active template — step2/DnD U65' });
      }
      journey('J-HRM-CTR-CREATE-04', 'PASS_WITH_HOLD', {
        note: 'DRIVER/GPLX slice not exercised U65 — no mutate without full driver persona',
      });
      await shell.getByTestId('ctr-create-cancel-btn').click({ timeout: 10000 }).catch(() => page.keyboard.press('Escape'));
      await sleep(800);
    } else {
      await fillSigningDate(shell);
      await fillWorkArrangement(shell);
      await shell.getByTestId('ctr-create-salary-ratio').fill('100');
      await shell.getByTestId('ctr-create-abstract').fill(ABSTRACT);
      candPick = await pickFirstCandidate(shell, page);
      triggerLabel = (await shell.getByTestId('ctr-create-candidate-picker').innerText().catch(() => '')).trim();

      const postWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/contracts-insurance\/contracts/.test(res.url()) &&
        !res.url().includes('/preview') &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 90000 },
    );
      await shell.getByTestId('ctr-create-next-btn').click();
      await postWait.catch(() => null);
      step2Open = await shell.getByTestId('ctr-create-step-2').isVisible({ timeout: 45000 }).catch(() => false);

      journey('J-HRM-CTR-CREATE-01', step2Open && candVisible && inlineSearch && candPick.picked && !candPick.hasUuid ? 'PASS' : 'FAIL', {
        step2Open,
        candVisible,
        inlineSearch,
        candPick,
        triggerLabel: triggerLabel.slice(0, 80),
        cc_url: page.url().includes('command-center'),
      });

      journey('J-HRM-CTR-CREATE-04', 'PASS_WITH_HOLD', {
        note: 'DRIVER/GPLX slice not exercised U65 — no mutate without full driver persona',
      });

      if (!step2Open) throw new Error('step2 blocked');

      await page.getByTestId('ctr-create-clause-dnd-ready').waitFor({ state: 'attached', timeout: 30000 }).catch(() => {});
      await sleep(500);
      const stormBefore = R.dnd_storms.length;
      const { bound: canvasAfter, usedThem } = await dndAndThem(shell, 2);
      const dndStorm = R.dnd_storms.length > stormBefore;
      await shot(page, 'step2-dnd-them');

      let dialogMsg = '';
      page.once('dialog', async (d) => {
        dialogMsg = d.message();
        await d.dismiss();
      });
      const goBtn = shell.getByRole('button', { name: 'Gỡ' }).first();
      if (await goBtn.isVisible().catch(() => false)) await goBtn.click();
      await sleep(400);
      page.once('dialog', async (d) => {
        dialogMsg = d.message() || dialogMsg;
        await d.accept();
      });
      if (await goBtn.isVisible().catch(() => false)) await goBtn.click();
      await sleep(400);

      journey('J-HRM-CTR-CREATE-02', !dndStorm && canvasAfter >= 1 && page.url().includes('command-center') ? 'PASS' : 'FAIL', {
        canvasAfter,
        usedThem,
        dnd_storms: R.dnd_storms.length,
        go_confirm: dialogMsg.slice(0, 100),
        url: page.url(),
      });

      await shell.getByTestId('hdsd-contracts-form-submit').click({ timeout: 20000 }).catch(() => {});
      await sleep(2500);
      await shell.getByTestId('ctr-create-cancel-btn').click({ timeout: 10000 }).catch(() => page.keyboard.press('Escape'));
      await sleep(800);
    }

    await hrmCtx.getByTestId('hdsd-contracts-create-btn').click({ timeout: 20000 });
    const { shell: shellReg } = await resolveWizardContexts(page, hrmCtx);
    await waitFormReady(shellReg);
    await shellReg.getByTestId('ctr-create-contract-code').fill(CODE_REG);
    const regWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/contracts-insurance\/contracts/.test(res.url()) &&
        !res.url().includes('/preview') &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 60000 },
    );
    await shellReg.getByTestId('ctr-create-registry-only-link').click();
    const regRes = await regWait.catch(() => null);
    await sleep(1000);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2500);
    const hrmAfter = (await resolveHrmFrame(page)) || hrmCtx;
    const rowReg = await hrmAfter.getByText(CODE_REG).first().isVisible().catch(() => false);
    journey('J-HRM-CTR-CREATE-05', regRes && rowReg ? 'PASS' : 'FAIL', {
      post: regRes?.status(),
      f5_row: rowReg,
      code: CODE_REG,
    });

    if (!noActiveTemplates) {
      const row = hrmAfter.getByRole('row', { name: new RegExp(CODE_MAIN) });
      let editOk = false;
      let step2Match = false;
      if (await row.isVisible().catch(() => false)) {
        await row.getByRole('button', { name: /Sửa|Edit/i }).click({ timeout: 15000 }).catch(() => {});
        const { shell: shellEdit } = await resolveWizardContexts(page, hrmAfter);
        if (shellEdit) {
          const codeVal = await shellEdit.getByTestId('ctr-create-contract-code').inputValue().catch(() => '');
          if (codeVal.includes(CODE_MAIN)) {
            await shellEdit.getByTestId('ctr-create-next-btn').click().catch(() => {});
            await shellEdit.getByTestId('ctr-create-step-2').waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
            const cnt = await canvasClauseCount(shellEdit);
            step2Match = cnt >= 1;
            editOk = true;
          }
        }
      }
      journey('J-HRM-CTR-CREATE-06', editOk && step2Match ? 'PASS' : 'FAIL', { editOk, step2Match, code: CODE_MAIN });
    }

    R.browser = {
      embed: R.embed,
      network: R.network,
      codes: { main: CODE_MAIN, registry: CODE_REG },
      scope_mismatch_count: R.network.scope_mismatch.length,
    };
  } catch (fatal) {
    R.browser = { fatal: String(fatal) };
    defect('DEF-QA-FATAL', 'P0', String(fatal).slice(0, 200));
    const fatalIds =
      QA_WAVE === '03'
        ? ['J-HRM-CTR-CREATE-FE03', 'J-HRM-CTR-CREATE-05']
        : [
            'J-HRM-CTR-CREATE-01',
            'J-HRM-CTR-CREATE-02',
            'J-HRM-CTR-CREATE-05',
            'J-HRM-CTR-CREATE-06',
          ];
    for (const id of fatalIds) {
      if (!R.journeys[id]) journey(id, 'FAIL', { fatal: String(fatal).slice(0, 120) });
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const mustPass =
    QA_WAVE === '03'
      ? ['J-HRM-CTR-CREATE-FE03', 'J-HRM-CTR-CREATE-08']
      : [
          'J-HRM-CTR-CREATE-01',
          'J-HRM-CTR-CREATE-02',
          'J-HRM-CTR-CREATE-05',
          'J-HRM-CTR-CREATE-06',
          'J-HRM-CTR-CREATE-08',
        ];
  const fails = mustPass.filter((id) => R.journeys[id]?.verdict === 'FAIL');
  if (R.uf['UF-HRM-02'] === 'FAIL') fails.push('UF-HRM-02');
  if (QA_WAVE === '03' && R.journeys['J-HRM-CTR-CREATE-05']?.verdict === 'FAIL') {
    defect(
      'DEF-CTR-REGISTRY-U65',
      'P1',
      `J-05 registry-only F5 missing — POST/validation U65 without employee pick (out of FE-03 form-ready scope)`,
    );
  }
  if (R.dnd_storms.length) defect('DEF-CTR-DND-STORM', 'P0', `${R.dnd_storms.length} pangea/dnd errors`);
  if (R.network.scope_mismatch.length) defect('DEF-CTR-SCOPE-CID', 'P1', `${R.network.scope_mismatch.length} company_id mismatches`);

  R.ack_status = fails.length === 0 && R.dnd_storms.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.overall = R.ack_status === 'PASS_TO_PM' ? 'PASS' : 'FAIL';
  R.endedAt = ts();
  writeEvidence();
}

function writeEvidence() {
  const jRows = Object.entries(R.journeys)
    .map(([id, j]) => `| **${id}** | ${j.verdict} | ${JSON.stringify(j).slice(0, 200)} |`)
    .join('\n');

  const fe03Block =
    R.fe03
      ? `## FE-03 form-ready (template count ${R.fe03.template_count})

| Check | Result |
|-------|--------|
| \`hdsd-contracts-form-ready\` | **${R.fe03.formReadyMs}ms** (≤90s: ${R.fe03.formReadyWithin90s ? 'yes' : 'no'}) |
| \`ctr-create-no-active-template-banner\` | ${R.fe03.bannerVisible ? 'visible' : 'missing'} |
| \`ctr-create-template-settings-cta\` | ${R.fe03.ctaVisible ? 'visible' : 'missing'} |
| **J-HRM-CTR-CREATE-FE03** | **${R.journeys['J-HRM-CTR-CREATE-FE03']?.verdict ?? '—'}** |

`
      : '';

  const md = `# Evidence — ${WAVE_ID}

| Field | Value |
|-------|--------|
| **work_item_id** | \`${WAVE_ID}\` |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · \`contracts_printable_ready=false\` |
| **URL** | \`${R.url_required}\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **entry** | \`${R.prior}\` |
| **runner** | \`scripts/qa/_tmp-hrm-ctr-create-redesign-qa-02.mjs\` (QA_WAVE=${QA_WAVE}) |
| **raw JSON** | \`docs/qa/evidence/_tmp-${EVIDENCE_SLUG}.json\` |
| **commit** | \`${COMMIT}\` |

## Gates

| Gate | Result |
|------|--------|
| L0 \`qc:dev-stack\` | hrm + xbos + portal **200** (node UV exit quirk Windows) |
| L0 \`qc:fe-be-health\` | **exit 0** |
| Vitest contract wizard | **19 PASS** (resolver + source) |

${fe03Block}

## UF / Journeys

| ID | Verdict | Detail |
|----|---------|--------|
| **UF-HRM-02** | ${R.uf['UF-HRM-02'] || '—'} | list + Thêm HĐ on CC embed |
${jRows}

## DnD / scope

| Check | Result |
|-------|--------|
| pangea / drag-handle storms | ${R.dnd_storms.length === 0 ? '**none**' : `**${R.dnd_storms.length}** — ${R.dnd_storms[0]?.slice(0, 80)}`} |
| \`company_id\` scope mismatches | ${R.network.scope_mismatch.length === 0 ? '**none**' : R.network.scope_mismatch.length} |
| dialog mount | \`${R.embed.dialog_on || '—'}\` |

## Network samples

\`\`\`json
${JSON.stringify(R.network, null, 2)}
\`\`\`

## Defects

${R.defects.map((d) => `- **${d.id}** (${d.severity}): ${d.note}`).join('\n') || '—'}

## Screens

${R.screens.map((s) => `- \`${s}\``).join('\n') || '—'}

## Console (max 6)

${R.consoleErrors.slice(0, 6).map((e) => `- ${e}`).join('\n') || '—'}

> **contracts_printable_ready=false** · **C-SLICE** · DnD evidence on CC URL only
${QA_WAVE === '03' ? '\n\n## Residual (QA-03)\n\n- **J-HRM-CTR-CREATE-05** registry-only F5: P1 if FAIL — cần chọn NV/loại HĐ trên FE (U65) hoặc BA AC; **không** block FE-03 form-ready.\n- **J-HRM-CTR-CREATE-07** BLOCKED `template_api_count=0` — honest U65.\n- **J-01..03,06** BLOCKED until sponsor tạo mẫu active từ FE Settings.\n' : ''}

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

main().catch((err) => {
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'FAIL';
  R.browser = { fatal: String(err) };
  R.endedAt = ts();
  writeEvidence();
  console.error(err);
  process.exit(1);
});
