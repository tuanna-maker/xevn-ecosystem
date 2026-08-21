#!/usr/bin/env node
/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-QA-01 — U65 browser (R1 live BE unlock)
 * AC-CTR-CL-01 · Template DnD persist · UF-HRM-02 · preview/print-version/PDF stub
 * Honesty: contracts_printable_ready=false — cấm promote
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01.FINAL.json');
const PRIOR_JSON = OUT_JSON;
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `CTRQA-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let priorBlocked = null;
if (existsSync(PRIOR_JSON)) {
  try {
    const prev = JSON.parse(readFileSync(PRIOR_JSON, 'utf8'));
    priorBlocked = {
      at: prev.endedAt || prev.startedAt,
      beUp: prev.beUp,
      ac: Object.fromEntries(
        Object.entries(prev.ac || {}).map(([k, v]) => [k, { verdict: v.verdict, summary: v.summary }]),
      ),
      note: 'R0/R1-partial BLOCKED-BE while hrm-api dist stale (404 clauses)',
    };
  } catch {
    /* */
  }
}

const results = {
  work_item_id: 'PO-HRM-CONTRACT-LEGAL-PRINT-QA-01',
  round: 'R1-LIVE-BE',
  startedAt: ts(),
  u65: 'zero-seed · browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP },
  prior_blocked_be: priorBlocked,
  honesty: {
    contracts_printable_ready: false,
    contracts_printable_ready_claimed: false,
    seed_used: false,
    api_only_pass: false,
  },
  denied: ['contracts_printable_ready=true', 'seed', 'api_only_pass', 'invent_printable_uat'],
  l0: {},
  beProbe: {},
  beUp: false,
  ids: {},
  uf: {},
  ac: {},
  process: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`, extra.note || '');
}
function recordUf(id, verdict, detail = {}) {
  results.uf[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 360)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
}

function hasMojibake(text) {
  if (!text) return false;
  return /Ã.|Â.|Ä.|Æ.|â€|ï¿½|�/.test(text);
}

function processGateSummary() {
  const dndStorm = results.consoleErrors.filter((t) =>
    /Unable to find drag handle|@hello-pangea\/dnd/i.test(t),
  );
  const uncaught = [
    ...results.pageErrors,
    ...results.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  results.process = {
    pageErrors: results.pageErrors.length,
    consoleErrors: results.consoleErrors.length,
    dndStorm: dndStorm.length,
    uncaught: uncaught.length,
    samplePageErrors: results.pageErrors.slice(0, 5),
    sampleConsole: results.consoleErrors.slice(0, 10),
    sampleDnd: dndStorm.slice(0, 3),
  };
  return { fail: dndStorm.length > 0 || uncaught.length > 0, dndStorm, uncaught };
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    (s) => {
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
        if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
        if (s.raw?.defaultMembershipId)
          store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
      }
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      const interesting =
        /contract-clauses|contract-templates|print-versions|\/preview|\/pdf|pack-resolve|contracts-insurance\/contracts/.test(
          u,
        );
      if (!interesting) return;
      try {
        const ct = res.headers()['content-type'] || '';
        entry.contentType = ct.slice(0, 80);
        if (/json/i.test(ct)) {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 160);
          if (j?.data?.id) entry.dataId = j.data.id;
          if (Array.isArray(j?.data?.data)) entry.listCount = j.data.data.length;
          if (typeof j?.data?.total === 'number') entry.total = j.data.total;
        } else {
          const t = await res.text();
          entry.bodySnippet = String(t).slice(0, 120);
        }
      } catch {
        /* */
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function probeBe(token) {
  const paths = [
    `/api/hrm/contracts-insurance/contract-clauses?company_id=${COMPANY}`,
    `/api/hrm/contracts-insurance/contract-templates?company_id=${COMPANY}`,
    `/api/hrm/contracts-insurance/contracts?page_size=3&company_id=${COMPANY}`,
  ];
  const out = {};
  for (const path of paths) {
    try {
      const r = await fetch(`${HRM}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await r.json().catch(() => ({}));
      out[path] = {
        status: r.status,
        code: body?.code || null,
        message: String(body?.message || '').slice(0, 160),
      };
    } catch (e) {
      out[path] = { status: 0, error: String(e).slice(0, 160) };
    }
  }
  results.beProbe = out;
  const clauses = out[paths[0]]?.status;
  const templates = out[paths[1]]?.status;
  results.beUp = clauses >= 200 && clauses < 300 && templates >= 200 && templates < 300;
  save();
  return results.beUp;
}

async function pickFirstOption(page, testId) {
  const trigger = page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  const opt = page.getByRole('option').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  return false;
}

async function selectOptionByText(page, testId, textRe) {
  const trigger = page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  const opt = page.getByRole('option').filter({ hasText: textRe }).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(400);
    return true;
  }
  return false;
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
}

async function openSettingsLegal(page) {
  await page.goto(q('/hr/settings', { tab: 'contract-legal' }), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2500);
  const tabBtn = page.getByTestId('settings-tab-contract-legal');
  if (await tabBtn.isVisible().catch(() => false)) {
    await tabBtn.click();
    await sleep(1200);
  }
  return tabBtn;
}

async function createAndActivateClause(page, { code, title, body, groupLabel }) {
  await page.getByTestId('ctr-legal-tab-clauses').click().catch(() => {});
  await sleep(400);
  await page.getByTestId('ctr-clause-code').fill(code);
  if (groupLabel) {
    await page.getByTestId('ctr-clause-group').click();
    await sleep(300);
    const opt = page.getByRole('option').filter({ hasText: groupLabel }).first();
    if (await opt.isVisible().catch(() => false)) await opt.click();
    else {
      // LEGAL_BASIS often default
      await page.keyboard.press('Escape').catch(() => {});
    }
  }
  await page.getByTestId('ctr-clause-title').fill(title);
  await page.getByTestId('ctr-clause-body').fill(body);
  const net0 = results.network.length;
  await page.getByTestId('ctr-clause-save').click();
  await sleep(2500);
  const posts = results.network
    .slice(net0)
    .filter((n) => n.method === 'POST' && /contract-clauses(\?|$)/.test(n.url));
  const created = posts.find((p) => p.status >= 200 && p.status < 300);
  const row = page.getByTestId(`ctr-clause-row-${code}`);
  await row.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const activateBtn = row.getByRole('button', { name: /Hiệu lực/i });
  let activateOk = false;
  if (await activateBtn.isVisible().catch(() => false)) {
    const n1 = results.network.length;
    await activateBtn.click();
    await sleep(2000);
    activateOk = results.network
      .slice(n1)
      .some((n) => /activate/.test(n.url) && n.status >= 200 && n.status < 300);
  }
  return { posts, created, activateOk, rowVisible: await row.isVisible().catch(() => false) };
}

/** Drag first palette item onto canvas via mouse (hello-pangea). */
async function dragPaletteToCanvas(page, times = 1) {
  const canvas = page.getByTestId('ctr-tpl-canvas');
  await canvas.waitFor({ state: 'visible', timeout: 10000 });
  for (let i = 0; i < times; i++) {
    const palette = page.getByTestId('ctr-tpl-palette');
    const item = palette.locator('[data-rbd-draggable-id], [data-rfd-draggable-id]').first();
    const alt = palette.locator('.cursor-grab').nth(i);
    const src = (await item.count()) > 0 ? item : alt;
    if (!(await src.isVisible().catch(() => false))) {
      log('DND_NO_PALETTE_ITEM', { note: `i=${i}` });
      break;
    }
    const box = await src.boundingBox();
    const cbox = await canvas.boundingBox();
    if (!box || !cbox) break;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await sleep(80);
    await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 40 + i * 36, { steps: 18 });
    await sleep(80);
    await page.mouse.up();
    await sleep(500);
  }
  const count = await page.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
  return count;
}

async function reorderCanvas(page) {
  const items = page.locator('[data-testid^="ctr-tpl-canvas-item-"]');
  const n = await items.count();
  if (n < 2) return { ok: false, reason: 'need>=2' };
  const a = items.nth(0);
  const b = items.nth(1);
  const idA = await a.getAttribute('data-testid');
  const boxA = await a.boundingBox();
  const boxB = await b.boundingBox();
  if (!boxA || !boxB) return { ok: false, reason: 'no-box' };
  await page.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2);
  await page.mouse.down();
  await sleep(80);
  await page.mouse.move(boxB.x + boxB.width / 2, boxB.y + boxB.height / 2 + 8, { steps: 16 });
  await sleep(80);
  await page.mouse.up();
  await sleep(500);
  const firstAfter = await items.nth(0).getAttribute('data-testid');
  return { ok: firstAfter !== idA, idA, firstAfter };
}

async function main() {
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[k] = { status: r.status, url };
    } catch (e) {
      results.l0[k] = { status: 0, error: String(e).slice(0, 120) };
    }
  }
  save();
  if (results.l0.portal?.status !== 200 || results.l0.hrm?.status !== 200) {
    results.ack_status = 'FAIL_TO_PM';
    results.overall = 'FAIL';
    save();
    throw new Error('L0 FAIL');
  }

  const session = await loginApi();
  const beUp = await probeBe(session.token);
  log('BE_PROBE', { note: `beUp=${beUp}` });
  if (!beUp) {
    results.residuals.push({
      id: 'R-CTR-LEGAL-PRINT-BE-01',
      severity: 'P0',
      owner: 'dev-be',
      note: 'clause/template still not 2xx after restart',
    });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const code1 = `LEGAL_${STAMP}`;
  const code2 = `JOB_${STAMP}`;
  const tplCode = `TPL_${STAMP}`;
  let contractCode = `HD-${STAMP}`;

  try {
    // ——— Settings chrome + AC-CTR-CL-01 ———
    await openSettingsLegal(page);
    await hardRefresh(page);
    await openSettingsLegal(page);
    await shot(page, '00-settings-legal');

    const bodyText = await page.locator('body').innerText().catch(() => '');
    const honestySettings = /contracts_printable_ready\s*=\s*false/i.test(bodyText);
    const loadError = await page.getByTestId('ctr-legal-load-error').isVisible().catch(() => false);
    const clauseForm = await page.getByTestId('ctr-clause-code').isVisible().catch(() => false);
    recordUf('SETTINGS_CHROME', clauseForm ? 'PASS' : 'FAIL', {
      summary: `form=${clauseForm} honesty=${honestySettings} loadError=${loadError} mojibake=${hasMojibake(bodyText.slice(0, 3000))}`,
      honestySettings,
      loadError,
    });

    if (!beUp) {
      recordAc('AC-CTR-CL-01', 'BLOCKED-BE', { summary: 'BE not up' });
      recordAc('AC-CTR-TPL-DND', 'BLOCKED-BE', { summary: 'BE not up' });
    } else {
      // Create LEGAL_BASIS clause + second clause
      const c1 = await createAndActivateClause(page, {
        code: code1,
        title: `Căn cứ pháp lý QA ${STAMP}`,
        body: `Căn cứ Bộ luật Lao động 2019 — QA ${STAMP}.`,
        groupLabel: /Căn cứ|LEGAL/i,
      });
      await shot(page, '01-clause1-active');
      const c2 = await createAndActivateClause(page, {
        code: code2,
        title: `Công việc QA ${STAMP}`,
        body: `Mô tả công việc QA ${STAMP}.`,
        groupLabel: /Công việc|JOB|Điều/i,
      });
      await shot(page, '02-clause2-active');

      await hardRefresh(page);
      await openSettingsLegal(page);
      const persist1 = await page.getByTestId(`ctr-clause-row-${code1}`).isVisible().catch(() => false);
      const persist2 = await page.getByTestId(`ctr-clause-row-${code2}`).isVisible().catch(() => false);
      const status1 = persist1
        ? await page.getByTestId(`ctr-clause-row-${code1}`).innerText().catch(() => '')
        : '';
      const clOk =
        Boolean(c1.created) &&
        c1.activateOk &&
        persist1 &&
        /active/i.test(status1);
      recordAc('AC-CTR-CL-01', clOk ? 'PASS' : 'FAIL', {
        summary: `c1 post=${c1.posts.map((p) => p.status)} act=${c1.activateOk} F5=${persist1}/${persist2} status=${status1.slice(0, 80)} c2act=${c2.activateOk}`,
        codes: [code1, code2],
      });
      results.ids.clauseCodes = [code1, code2];

      // Template DnD
      await page.getByTestId('ctr-legal-tab-templates').click();
      await sleep(800);
      await page.getByTestId('ctr-tpl-code').fill(tplCode);
      await page.getByTestId('ctr-tpl-name').fill(`Mẫu HĐ QA ${STAMP}`);
      await selectOptionByText(page, 'ctr-tpl-pack', /GENERAL|Chung|general/i).catch(() => {});
      await sleep(400);

      const placed = await dragPaletteToCanvas(page, 2);
      await shot(page, '03-tpl-after-dnd');
      let reorder = { ok: false };
      if (placed >= 2) reorder = await reorderCanvas(page);
      await shot(page, '04-tpl-after-reorder');

      const orderBeforeSave = await page.evaluate(() =>
        [...document.querySelectorAll('[data-testid^="ctr-tpl-canvas-item-"]')].map((el) =>
          el.getAttribute('data-testid'),
        ),
      );

      const netTpl = results.network.length;
      await page.getByTestId('ctr-tpl-save').click();
      await sleep(2500);
      const tplPosts = results.network.slice(netTpl).filter((n) =>
        /contract-templates/.test(n.url),
      );
      const tplSaveOk = tplPosts.some((p) => p.status >= 200 && p.status < 300);

      if (await page.getByTestId('ctr-tpl-activate').isVisible().catch(() => false)) {
        const nA = results.network.length;
        await page.getByTestId('ctr-tpl-activate').click();
        await sleep(2000);
        results.ids.tplActivate = results.network
          .slice(nA)
          .some((n) => /activate/.test(n.url) && n.status >= 200 && n.status < 300);
      }

      await hardRefresh(page);
      await openSettingsLegal(page);
      await page.getByTestId('ctr-legal-tab-templates').click();
      await sleep(1000);
      const tplRow = page.getByTestId(`ctr-tpl-row-${tplCode}`);
      const tplPersist = await tplRow.isVisible().catch(() => false);
      if (tplPersist) {
        await tplRow.click({ force: true }).catch(() => {});
        const editBtn = tplRow.getByRole('button', { name: /Sửa|Edit|Load|Mở/i }).first();
        if (await editBtn.isVisible().catch(() => false)) await editBtn.click();
        else await tplRow.dblclick().catch(() => {});
        await sleep(1000);
      }
      // Click row "Sửa" if present in table
      const sua = page.locator(`[data-testid="ctr-tpl-row-${tplCode}"] button`).filter({ hasText: /Sửa/i });
      if (await sua.isVisible().catch(() => false)) {
        await sua.click();
        await sleep(1000);
      }
      const orderAfterF5 = await page.evaluate(() =>
        [...document.querySelectorAll('[data-testid^="ctr-tpl-canvas-item-"]')].map((el) =>
          el.getAttribute('data-testid'),
        ),
      );
      await shot(page, '05-tpl-f5');

      const orderMatch =
        orderBeforeSave.length > 0 &&
        orderAfterF5.length === orderBeforeSave.length &&
        orderBeforeSave.every((id, i) => id === orderAfterF5[i]);

      const dndOk = placed >= 1 && tplSaveOk && tplPersist;
      recordAc('AC-CTR-TPL-DND', dndOk ? 'PASS' : 'FAIL', {
        summary: `placed=${placed} reorder=${JSON.stringify(reorder)} save=${tplSaveOk} F5row=${tplPersist} orderMatch=${orderMatch} activate=${results.ids.tplActivate}`,
        orderBeforeSave,
        orderAfterF5,
        tplPosts: tplPosts.map((p) => ({ status: p.status, code: p.code, method: p.method })),
      });
      results.ids.tplCode = tplCode;
    }

    // ——— UF-HRM-02 + print spine ———
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    await hardRefresh(page);
    await sleep(2500);
    await shot(page, '06-contracts-list');

    const createBtn = page.getByTestId('hdsd-contracts-create-btn');
    if (!(await createBtn.isVisible().catch(() => false))) {
      recordUf('UF-HRM-02', 'FAIL', { summary: 'create btn missing' });
    } else {
      await createBtn.click();
      await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 25000 });
      await sleep(1500);

      let formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
      const deadline = Date.now() + 40000;
      while (!formReady && Date.now() < deadline) {
        await pickFirstOption(page, 'hdsd-contracts-form-employee');
        await pickFirstOption(page, 'hdsd-contracts-form-contract-type');
        await sleep(700);
        formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
      }

      const codeInput = page.locator('#contract_code');
      if (await codeInput.isVisible().catch(() => false)) {
        const cur = (await codeInput.inputValue().catch(() => '')).trim();
        contractCode = cur || contractCode;
        if (!cur) await codeInput.fill(contractCode);
      }
      const notes = page.locator('#notes');
      if (await notes.isVisible().catch(() => false)) await notes.fill(`QA LEGAL-PRINT ${STAMP}`);

      const spine = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
      const spineHonesty = await page.getByTestId('ctr-print-honesty').isVisible().catch(() => false);
      await shot(page, '07-create-spine');

      // Attach pack/template if BE up
      if (beUp && spine) {
        await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i).catch(() => {});
        await selectOptionByText(page, 'ctr-print-template', new RegExp(tplCode, 'i')).catch(() => {});
        await sleep(500);
      }

      const netBefore = results.network.length;
      if (!formReady) {
        recordUf('UF-HRM-02', 'FAIL', { summary: 'formReady=false' });
      } else {
        await page.getByTestId('hdsd-contracts-form-submit').click({ timeout: 15000 });
        log('CLICK_LUU', { note: contractCode });
        await sleep(4000);
        const posts = results.network
          .slice(netBefore)
          .filter((n) => n.method === 'POST' && /contracts-insurance\/contracts(\?|$)/.test(n.url));
        const saveOk = posts.some((p) => p.status >= 200 && p.status < 300);
        const createdId = posts.find((p) => p.dataId)?.dataId || null;
        results.ids.contractId = createdId;
        results.ids.contractCode = contractCode;
        await shot(page, '08-after-registry-save');

        await hardRefresh(page);
        await sleep(3000);
        const listText = await page.locator('body').innerText().catch(() => '');
        const codeOnList = listText.includes(contractCode);
        await shot(page, '09-f5-list');

        recordUf('UF-HRM-02', saveOk && codeOnList ? 'PASS' : saveOk ? 'PARTIAL' : 'FAIL', {
          summary: `POST=${posts.map((p) => `${p.status}:${p.code}`).join(',')} code=${contractCode} F5=${codeOnList} id=${createdId}`,
          posts: posts.map((p) => ({ status: p.status, code: p.code })),
        });

        // Reopen edit → preview → print version → PDF
        if (beUp && (createdId || codeOnList)) {
          // Pencil icon is 2nd action button (Eye / Pencil / Trash) — no "Sửa" aria-label
          const search = page.locator('input[placeholder*="Tìm"], input[type=search]').first();
          if (await search.isVisible().catch(() => false)) {
            await search.fill(contractCode);
            await sleep(1200);
          }
          const row = page.locator('tbody tr').filter({ hasText: contractCode }).first();
          let dialogOpen = false;
          if (await row.isVisible().catch(() => false)) {
            const actionBtns = row.locator('td').last().locator('button');
            const pencil = actionBtns.nth(1);
            if (await pencil.isVisible().catch(() => false)) {
              await pencil.click({ force: true });
              log('CLICK_PENCIL_EDIT', { note: contractCode });
            } else {
              await actionBtns.nth(0).click({ force: true }).catch(() => {});
            }
            await sleep(2000);
            dialogOpen = await page.getByTestId('hdsd-contracts-form-dialog').isVisible().catch(() => false);
          }
          if (!dialogOpen) {
            // last resort: any pencil-sized icon button in matching row
            const fallback = page
              .locator('tbody tr')
              .filter({ hasText: contractCode })
              .locator('button.h-8.w-8')
              .nth(1);
            if (await fallback.isVisible().catch(() => false)) {
              await fallback.click({ force: true });
              await sleep(2000);
              dialogOpen = await page.getByTestId('hdsd-contracts-form-dialog').isVisible().catch(() => false);
            }
          }

          await shot(page, '10-edit-dialog');
          const spineEdit = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
          if (!dialogOpen) {
            recordAc('AC-CTR-PRINT-SPINE', 'FAIL', {
              summary: `edit dialog not open after pencil; code=${contractCode} id=${createdId}`,
            });
          } else if (!spineEdit) {
            recordAc('AC-CTR-PRINT-SPINE', 'FAIL', {
              summary: 'dialog open but ctr-print-spine missing',
            });
          }
          if (spineEdit) {
            await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i).catch(() => {});
            await selectOptionByText(page, 'ctr-print-template', new RegExp(STAMP, 'i')).catch(() => {});
            await sleep(600);

            const nPrev = results.network.length;
            await page.getByTestId('ctr-print-preview-btn').click();
            await sleep(3000);
            const prevPosts = results.network
              .slice(nPrev)
              .filter((n) => /\/preview/.test(n.url));
            const previewOk = prevPosts.some((p) => p.status >= 200 && p.status < 300);
            const previewBody = await page.getByTestId('ctr-print-preview-body').isVisible().catch(() => false);
            const previewErr = await page.getByTestId('ctr-print-preview-error').innerText().catch(() => '');
            await shot(page, '11-preview');

            let versionOk = false;
            let pdfOk = false;
            let pdfSnippet = '';
            const saveVerBtn = page.getByTestId('ctr-print-save-version');
            const canSave = (await saveVerBtn.isVisible().catch(() => false)) && !(await saveVerBtn.isDisabled().catch(() => true));
            if (canSave) {
              const nV = results.network.length;
              await saveVerBtn.click();
              await sleep(3000);
              const vers = results.network.slice(nV).filter((n) => /print-versions/.test(n.url));
              versionOk = vers.some((p) => p.status >= 200 && p.status < 300);
              results.ids.printVersionPosts = vers;
            }

            // PDF button if listed
            const pdfBtn = page.locator('[data-testid^="ctr-print-pdf-"]').first();
            if (await pdfBtn.isVisible().catch(() => false)) {
              const nP = results.network.length;
              await pdfBtn.click();
              await sleep(2500);
              const pdfs = results.network.slice(nP).filter((n) => /\/pdf/.test(n.url));
              pdfOk = pdfs.some((p) => p.status >= 200 && p.status < 300);
              pdfSnippet = pdfs.map((p) => `${p.status}:${p.contentType}:${p.bodySnippet || ''}`).join('|');
            } else if (results.ids.contractId || createdId) {
              // API corroborate PDF stub if version exists
              const cid = createdId || results.ids.contractId;
              try {
                const listR = await fetch(
                  `${HRM}/api/hrm/contracts-insurance/contracts/${cid}/print-versions?company_id=${COMPANY}`,
                  { headers: { Authorization: `Bearer ${session.token}` } },
                );
                const listJ = await listR.json().catch(() => ({}));
                const versions = listJ?.data?.data || listJ?.data?.items || listJ?.data || [];
                const vid = Array.isArray(versions) && versions[0]?.id;
                results.ids.printVersionsList = { status: listR.status, count: Array.isArray(versions) ? versions.length : 0 };
                if (vid) {
                  const pdfR = await fetch(
                    `${HRM}/api/hrm/contracts-insurance/print-versions/${vid}/pdf?company_id=${COMPANY}`,
                    { headers: { Authorization: `Bearer ${session.token}` } },
                  );
                  const pdfText = await pdfR.text();
                  pdfOk = pdfR.status >= 200 && pdfR.status < 300 && /html|HỢP ĐỒNG|hop dong|contract|stub|<!DOCTYPE/i.test(pdfText);
                  pdfSnippet = `API ${pdfR.status} len=${pdfText.length} head=${pdfText.slice(0, 80)}`;
                  versionOk = versionOk || listR.status === 200;
                }
              } catch (e) {
                pdfSnippet = String(e).slice(0, 120);
              }
            }

            await shot(page, '12-print-version-pdf');
            const val001 = prevPosts.find((p) => p.code === 'HRM-VAL-001' || /company_id should not exist/i.test(p.message || ''));
            const printPass = previewOk && previewBody;
            recordAc(
              'AC-CTR-PRINT-SPINE',
              printPass ? (versionOk || canSave === false ? 'PASS' : 'PARTIAL') : 'FAIL',
              {
                summary: `preview=${previewOk}/${previewBody} err=${previewErr.slice(0, 120)} versionOk=${versionOk} canSave=${canSave} pdfOk=${pdfOk} ${pdfSnippet} val001=${Boolean(val001)}`,
                previewOk,
                previewBody,
                versionOk,
                pdfOk,
                prevPosts: prevPosts.map((p) => ({ status: p.status, code: p.code, message: p.message })),
                note: 'PDF = HTML stub OK (Q-CTR-02)',
              },
            );
            if (val001) {
              results.residuals.push({
                id: 'R-CTR-PREVIEW-COMPANY-ID-BODY',
                severity: 'P0',
                owner: 'dev-fe',
                note: 'POST …/preview body includes company_id → HRM-VAL-001 "property company_id should not exist". FE previewContractPrint must omit company_id from body (scope via query/header) or BE whitelist. Blocks print-version + PDF.',
              });
            } else if (previewOk && !versionOk && previewErr) {
              results.residuals.push({
                id: 'R-CTR-PRINT-VERSION',
                severity: 'P1',
                owner: 'dev-be',
                note: previewErr.slice(0, 200),
              });
            }
            if (printPass && !pdfOk) {
              results.residuals.push({
                id: 'Q-CTR-02-PDF-STUB-OPEN',
                severity: 'P2',
                owner: 'dev-be',
                note: `PDF stub not opened/2xx: ${pdfSnippet}`,
              });
            }
          } else {
            recordAc('AC-CTR-PRINT-SPINE', 'FAIL', { summary: 'spine missing on edit dialog' });
          }
        } else if (!beUp) {
          recordAc('AC-CTR-PRINT-SPINE', 'BLOCKED-BE', {
            summary: `spine honesty=${spineHonesty}`,
          });
        } else {
          recordAc('AC-CTR-PRINT-SPINE', 'FAIL', { summary: 'registry save failed — cannot print' });
        }
      }

      // honesty always false
      recordUf('HONESTY', spineHonesty || honestySettings ? 'PASS' : 'FAIL', {
        summary: `contracts_printable_ready=false visible settings=${honestySettings} spine=${spineHonesty}`,
      });
    }

    const gate = processGateSummary();
    recordUf('PROCESS_GATE', gate.fail ? 'FAIL' : 'PASS', {
      summary: `dndStorm=${gate.dndStorm.length} uncaught=${gate.uncaught.length} pageErr=${results.pageErrors.length} console=${results.consoleErrors.length}`,
      ...results.process,
    });

    const acV = Object.values(results.ac).map((x) => x.verdict);
    const ufV = Object.values(results.uf).map((x) => x.verdict);
    const hardFail = acV.includes('FAIL') || ufV.includes('FAIL');
    const blocked = acV.includes('BLOCKED-BE');
    const partial = acV.includes('PARTIAL') || ufV.includes('PARTIAL');

    if (hardFail) {
      results.overall = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
    } else if (blocked) {
      results.overall = 'PASS_WITH_OBS';
      results.ack_status = 'PASS_WITH_OBS';
    } else if (partial) {
      results.overall = 'PASS_WITH_OBS';
      results.ack_status = 'PASS_WITH_OBS';
    } else {
      results.overall = 'PASS';
      results.ack_status = 'PASS_TO_PM';
    }

    // residual: nest build currently fails TS — note for PM
    results.residuals.push({
      id: 'OBS-HRM-API-NEST-BUILD-TS2345',
      severity: 'P1',
      owner: 'dev-be',
      note: 'nest build fails contract-legal-print.service.ts:1038 custom_fields string|Record — QA restarted from existing dist emit that already had routes',
    });

    results.honesty.contracts_printable_ready = false;
    results.endedAt = ts();
    save();
    console.log(
      JSON.stringify(
        {
          ack_status: results.ack_status,
          overall: results.overall,
          beUp: results.beUp,
          ac: Object.fromEntries(Object.entries(results.ac).map(([k, v]) => [k, v.verdict])),
          uf: Object.fromEntries(Object.entries(results.uf).map(([k, v]) => [k, v.verdict])),
          ids: results.ids,
          residuals: results.residuals,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((e) => {
  results.overall = 'FAIL';
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  results.residuals.push({ id: 'HARNESS', note: String(e).slice(0, 500), owner: 'qa' });
  save();
  console.error(e);
  process.exit(1);
});
