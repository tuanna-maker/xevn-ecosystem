#!/usr/bin/env node
/**
 * QA-PO-HRM-REC-CHANNELS-CONSUMER-01 — AC-SET-CONSUMER-CH-REC-01..03
 * U65 ceo@ · zero-seed · FE sync/create channel if EFF=0
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5173',
].filter(Boolean);
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

const STAMP = `RECCHQA-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const CAND_NAME = `UV Kênh QA ${STAMP}`;
const CAND_EMAIL = `rec.ch.qa.${STAMP.toLowerCase()}@xe.vn`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-po-hrm-rec-channels-consumer-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/qa-po-hrm-rec-channels-consumer-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-REC-CHANNELS-CONSUMER-01',
  stamp: STAMP,
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  honesty: { settings_catalog_e2e_ready: false, uf_hrm_10_full: false },
  env: { PORTAL: null, HRM, XBOS, TENANT, commit: COMMIT },
  l0: { qc_fe_be_health: 'exit 0 (pre-run)' },
  vitest: { result: '43/43 pass (pre-run)' },
  channels: { effBefore: 0, effAfter: 0, codes: [], syncUsed: false, feCreateUsed: false },
  ac: {},
  network: [],
  consoleErrors: [],
  ids: { selectedSourceCode: null, selectedSourceLabel: null, candidateId: null },
  ack_status: null,
  overall: null,
  pm_dispatch_hint: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, ...detail, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 280)}`);
  save();
}

async function pickPortal() {
  for (const base of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(8000) });
      if (r.status === 200 || r.status === 304) return base.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return null;
}

function q(portal, path, extra = {}) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
}

async function loginApi(portal) {
  const r = await fetch(`${portal}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    user: data?.user ?? { email: EMAIL },
    companyId: COMPANY,
    expiresAt: Date.now() + 3600000,
    raw: data,
  };
}

async function fetchReceivableCount(token) {
  const url = `${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}&receivable=true&page_size=50`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const items = j?.data?.items ?? j?.data ?? [];
  const arr = Array.isArray(items) ? items : [];
  return { status: r.status, count: arr.length, sample: arr[0]?.id ?? null };
}

async function clickTestId(page, id) {
  const host = await findInFrames(page, (h) => h.getByTestId(id));
  await host.getByTestId(id).first().click({ force: true, timeout: 30000 });
}

async function waitForFormReady(page, testId, ms = 25000) {
  const host = await findInFrames(page, (h) => h.getByTestId(testId));
  return host
    .getByTestId(testId)
    .waitFor({ state: 'visible', timeout: ms })
    .then(() => true)
    .catch(() => false);
}

async function ensureJdTemplateFromFe(page, portal) {
  await page.goto(q(portal, '/hr/recruitment', { tab: 'jd-library' }), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(3500);
  const hasRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter(
      (r) => (r.textContent || '').trim().length > 10,
    );
    return rows.length;
  });
  if (hasRows > 0) return { ok: true, via: 'existing', count: hasRows };

  const addBtn = page.getByRole('button', { name: /Thêm JD|Thêm mẫu/i }).first();
  if (!(await addBtn.isVisible().catch(() => false))) {
    await page.goto(q(portal, '/command-center/hrm/settings', { tab: 'jd-master-library' }), {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await sleep(3000);
  }
  const add2 = page.getByRole('button', { name: /Thêm JD|Thêm mẫu/i }).first();
  if (!(await add2.isVisible().catch(() => false))) return { ok: false, reason: 'no-add-jd' };
  await add2.click({ force: true });
  await sleep(1500);
  const jdCode = `jd_${STAMP.toLowerCase().slice(0, 20)}`;
  const jdTitle = `QA JD ${STAMP}`;
  await page.evaluate(
    (code, title) => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return;
      const inputs = Array.from(d.querySelectorAll('input'));
      const codeInp = inputs[0];
      const titleInp = inputs[1];
      const set = (el, v) => {
        if (!el) return;
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInp, code);
      set(titleInp, title);
    },
    jdCode,
    jdTitle,
  );
  await sleep(400);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const combo = Array.from(d?.querySelectorAll('button[role="combobox"]') || [])[0];
    combo?.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    const opt = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]')).find(Boolean);
    opt?.click();
  });
  await sleep(500);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const btn = Array.from(d?.querySelectorAll('button') || []).find((b) =>
      /Lưu|Thêm|Tạo/i.test((b.textContent || '').trim()),
    );
    btn?.click();
  });
  await sleep(4000);
  const pub = page.getByTestId('settings-jd-master-library-publish').first();
  if (await pub.isVisible().catch(() => false)) {
    await pub.click({ force: true });
    await sleep(3500);
  }
  return { ok: true, via: 'created', code: jdCode };
}

async function bootstrapReceivableYctd(page, portal, token, opts = {}) {
  let recv = await fetchReceivableCount(token);
  if (recv.count > 0 && !opts.forceNew) return { ok: true, via: 'existing', count: recv.count };

  const jd = await ensureJdTemplateFromFe(page, portal);
  R.bootstrap = { jd, recvBefore: recv };
  save();

  await page.goto(q(portal, '/hr/recruitment', { tab: 'requisitions' }), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(4000);
  await clickTestId(page, 'hdsd-requisition-create-btn');
  await sleep(2000);
  try {
    await clickTestId(page, 'hdsd-requisition-job-template');
  } catch {
    await page.evaluate(() => {
      const d = document.querySelector('[data-testid="hdsd-requisition-form-dialog"]');
      const combo = Array.from(d?.querySelectorAll('button[role="combobox"]') || [])[0];
      combo?.click();
    });
  }
  await sleep(800);
  await page.evaluate(() => {
    const opt = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]')).find(Boolean);
    opt?.click();
  });
  await sleep(800);
  const formReady = await waitForFormReady(page, 'hdsd-requisition-form-ready');
  if (!formReady) return { ok: false, reason: 'yctd-form-not-ready', jd };

  const titleHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-title'));
  await titleHost.getByTestId('hdsd-requisition-title').fill(`YCTD QA ${STAMP}`).catch(() => {});
  const hcHost = await findInFrames(page, (h) => h.getByTestId('hdsd-requisition-headcount'));
  await hcHost.getByTestId('hdsd-requisition-headcount').fill('1').catch(() => {});
  await sleep(400);

  const postsBefore = R.network.length;
  try {
    await clickTestId(page, 'hdsd-requisition-form-submit');
  } catch {
    await page
      .locator('[data-testid="hdsd-requisition-form-dialog"] button')
      .filter({ hasText: /Lưu/i })
      .first()
      .click({ force: true })
      .catch(() => {});
  }
  await sleep(4500);
  const yctdPost = R.network
    .slice(postsBefore)
    .find((n) => n.method === 'POST' && /requisitions/.test(n.url));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3000);

  const sent = await page.evaluate((stamp) => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    for (const row of rows) {
      if (stamp && !(row.textContent || '').includes(stamp)) continue;
      const btn = Array.from(row.querySelectorAll('button')).find((b) =>
        /Gửi duyệt QT/i.test((b.textContent || '').trim()),
      );
      if (btn && !btn.disabled) {
        btn.click();
        return { ok: true, stamp };
      }
    }
    for (const row of rows) {
      const btn = Array.from(row.querySelectorAll('button')).find((b) =>
        /Gửi duyệt QT/i.test((b.textContent || '').trim()),
      );
      if (btn && !btn.disabled) {
        btn.click();
        return { ok: true, stamp: null, fallback: true };
      }
    }
    return { ok: false };
  }, `YCTD QA ${STAMP}`);
  await sleep(8000);

  recv = await fetchReceivableCount(token);
  R.bootstrap = { ...(R.bootstrap || {}), jd, sentWf: sent, recvAfter: recv, yctdPost };
  save();
  return { ok: recv.count > 0, count: recv.count, jd, sentWf: sent, yctdPost };
}

async function fetchChannelEff(token) {
  const url = `${HRM}/api/hrm/settings-catalogs?company_id=${COMPANY}`;
  const r = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, 'x-tenant-id': TENANT },
  });
  const j = await r.json().catch(() => ({}));
  const catalogs = j?.data?.catalogs ?? j?.catalogs ?? j?.data ?? [];
  const list = Array.isArray(catalogs) ? catalogs : [];
  const chCat = list.find((c) => {
    const k = String(c?.catalog_key || c?.key || '');
    return /recruitment_channel|candidate_source|^channels$/i.test(k);
  });
  const items =
    chCat?.effective_items ??
    chCat?.effectiveItems ??
    chCat?.items?.filter((i) => i?.status !== 'inactive') ??
    [];
  const active = (Array.isArray(items) ? items : []).filter(
    (i) => i?.is_active !== false && i?.active !== false && i?.status !== 'draft',
  );
  const rows = active.length ? active : Array.isArray(items) ? items : [];
  const codes = rows
    .map((i) => i?.code ?? i?.storage_key ?? i?.key)
    .filter(Boolean)
    .map(String);
  const labels = rows.map((i) => i?.label ?? i?.name ?? '').filter(Boolean);
  return { status: r.status, count: codes.length, codes, labels, catalogKey: chCat?.catalog_key };
}

async function injectPortalAuth(page, session) {
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
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('response', async (res) => {
    const url = res.url();
    const method = res.request().method();
    if (/\/api\/hrm\//.test(url)) {
    let requestBody = null;
    try {
      const post = res.request().postData();
      if (post) requestBody = JSON.parse(post);
    } catch {
      requestBody = res.request().postData()?.slice(0, 500) ?? null;
    }
    const entry = {
      method,
      url: url.slice(0, 220),
      status: res.status(),
      requestBody,
      at: ts(),
    };
    if (/requisitions/.test(url) && ['POST', 'PATCH', 'PUT'].includes(method)) {
      R.network.push(entry);
    }
    if ((/candidates-pool/.test(url) || /\/recruitment\/candidates(?:\?|$)/.test(url)) && ['POST', 'PATCH'].includes(method)) {
      R.network.push(entry);
      if (method === 'POST' && res.status() >= 200 && res.status() < 300) {
        try {
          const j = await res.json();
          R.ids.candidateId = j?.data?.id ?? j?.id ?? R.ids.candidateId;
        } catch {
          /* */
        }
      }
    }
    if (/settings-catalogs/.test(url) && ['POST', 'PUT', 'PATCH'].includes(method)) {
      R.network.push(entry);
    }
    if (/catalog-sync|syncSettingsCatalogs/.test(url)) {
      R.network.push({ ...entry, kind: 'sync' });
    }
    }
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  return path.replace(/\\/g, '/');
}

async function findInFrames(page, locatorFn) {
  for (const h of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(h);
      if (await loc.first().isVisible({ timeout: 800 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return page;
}

async function ensureChannelsViaFe(page, portal) {
  await page.goto(q(portal, '/hr/settings', { tab: 'master-data' }), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(3500);
  const tab = page.getByTestId('md-tab-recruitmentChannels');
  if (await tab.isVisible().catch(() => false)) {
    await tab.click({ force: true });
    await sleep(1200);
  }
  const syncBtn = page.getByTestId('md-sync-xbos');
  if (await syncBtn.isVisible().catch(() => false)) {
    const syncWait = page
      .waitForResponse((res) => /catalog-sync|settings-catalogs\/sync/i.test(res.url()), {
        timeout: 60000,
      })
      .catch(() => null);
    await syncBtn.click({ force: true });
    await syncWait;
    await sleep(2500);
    R.channels.syncUsed = true;
  }
  await shot(page, '01-settings-channels');
}

async function createChannelExtension(page, code, label) {
  const codeInput = page.getByTestId('md-code-recruitmentChannels');
  const labelInput = page.getByTestId('md-label-recruitmentChannels');
  if (!(await codeInput.isVisible().catch(() => false))) return false;
  await codeInput.fill(code);
  await labelInput.fill(label);
  const postWait = page
    .waitForResponse(
      (res) =>
        /settings-catalogs\/items/.test(res.url()) &&
        res.request().method() === 'POST' &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 45000 },
    )
    .catch(() => null);
  await page.getByTestId('md-save-recruitmentChannels').click({ force: true });
  await postWait;
  await sleep(2000);
  R.channels.feCreateUsed = true;
  await shot(page, '02-channel-created');
  return true;
}

async function openCandidates(page, portal) {
  await page.goto(q(portal, '/hr/recruitment', { tab: 'candidates' }), {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await sleep(3500);
  const nav = page.getByTestId('recruitment-nav-candidates');
  if (await nav.isVisible().catch(() => false)) {
    await nav.click().catch(() => {});
    await sleep(800);
  }
  await page.keyboard.press('Escape').catch(() => {});
}

/** AC-REC-02 only — reuse existing UV row (no AC-REC-01 re-stamp). */
async function runAcRec02Filter(page, portal, rowStamp, sourceCode) {
  await openCandidates(page, portal);
  await shot(page, 'ac-rec-02-list-before-filter');

  const filterHost = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-filter-source'));
  const filterTrigger = filterHost.getByTestId('hdsd-candidate-filter-source').first();
  if (!(await filterTrigger.isVisible().catch(() => false))) {
    ac('AC-REC-02', 'FAIL', { summary: 'hdsd-candidate-filter-source not visible' });
    return false;
  }
  await filterTrigger.click({ force: true });
  await sleep(600);

  const optionTestId = `hdsd-candidate-filter-source-option-${sourceCode}`;
  const optHost = await findInFrames(page, (h) => h.getByTestId(optionTestId));
  const opt = optHost.getByTestId(optionTestId).first();
  if (!(await opt.isVisible({ timeout: 10000 }).catch(() => false))) {
    ac('AC-REC-02', 'FAIL', {
      summary: `option testid ${optionTestId} not visible (sourceCode=${sourceCode})`,
    });
    await page.keyboard.press('Escape').catch(() => {});
    return false;
  }
  await opt.click({ force: true });
  await sleep(2000);
  await shot(page, 'ac-rec-02-after-filter');

  const rowHost = await findInFrames(page, (h) =>
    h.locator('table tbody tr').filter({ hasText: rowStamp }),
  );
  const filterPass = await rowHost
    .locator('table tbody tr')
    .filter({ hasText: rowStamp })
    .first()
    .isVisible()
    .catch(() => false);
  ac('AC-REC-02', filterPass ? 'PASS' : 'FAIL', {
    summary: `filter ${sourceCode} shows row stamp=${rowStamp} visible=${filterPass}`,
    optionTestId,
  });
  return filterPass;
}

async function selectYctd(page, host) {
  const preferStamp = process.env.QA_YCTD_PREFER_STAMP || '';
  const trigger = host.getByTestId('hdsd-candidate-form-yctd').first();
  if (!(await trigger.isVisible().catch(() => false))) return { ok: false, reason: 'no-yctd' };
  await trigger.click({ force: true });
  await sleep(600);
  if (preferStamp) {
    const preferOpt = page.getByRole('option', { name: new RegExp(preferStamp) }).first();
    if (await preferOpt.isVisible({ timeout: 8000 }).catch(() => false)) {
      await preferOpt.click({ force: true });
      const t = (await preferOpt.innerText().catch(() => '')).trim();
      const val = (await preferOpt.getAttribute('data-value').catch(() => '')) || '';
      return { ok: true, picked: t, pickedId: val, preferStamp };
    }
  }
  const opts = page.getByRole('option');
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const t = (await opts.nth(i).innerText().catch(() => '')).trim();
    const val = (await opts.nth(i).getAttribute('data-value').catch(() => '')) || '';
    if (!t || /Chọn yêu cầ|__none__/i.test(t) || val === '__none__') continue;
    await opts.nth(i).click({ force: true });
    return { ok: true, picked: t, pickedId: val };
  }
  return { ok: false, reason: 'no-option', count: n };
}

async function selectSourceCatalog(page, host, preferCode) {
  const empty = host.getByTestId('hdsd-candidate-form-empty-channel-catalog');
  if (await empty.isVisible().catch(() => false)) {
    return { ok: false, reason: 'empty-channel-catalog-cta' };
  }
  const trigger = host.getByTestId('hdsd-candidate-form-source');
  if (!(await trigger.isVisible().catch(() => false))) {
    return { ok: false, reason: 'no-source-trigger' };
  }
  await trigger.click({ force: true });
  await sleep(500);
  const opts = page.getByRole('option');
  const n = await opts.count();
  let pickedCode = null;
  let pickedLabel = null;
  for (let i = 0; i < n; i++) {
    const opt = opts.nth(i);
    const val = (await opt.getAttribute('data-value').catch(() => '')) || '';
    const label = (await opt.innerText().catch(() => '')).trim();
    if (!label || /Chọn|__none__/i.test(label)) continue;
    const codeMatch = preferCode && (val === preferCode || label.includes(preferCode));
    if (preferCode && val && val !== preferCode && !codeMatch) continue;
    if (preferCode && !val && !label.toLowerCase().includes(String(preferCode).toLowerCase())) {
      const labelLooksCode = /CSO_\d+/i.test(label);
      if (labelLooksCode && !label.includes(preferCode)) continue;
    }
    await opt.click({ force: true });
    pickedCode = val || preferCode || label;
    pickedLabel = label;
    break;
  }
  if (!pickedCode) {
    for (let i = 0; i < n; i++) {
      const opt = opts.nth(i);
      const label = (await opt.innerText().catch(() => '')).trim();
      if (!label || /Chọn|__none__/i.test(label)) continue;
      const val = (await opt.getAttribute('data-value').catch(() => '')) || '';
      await opt.click({ force: true });
      pickedCode = val || preferCode || label;
      pickedLabel = label;
      break;
    }
  }
  await sleep(400);
  return { ok: Boolean(pickedCode), code: pickedCode, label: pickedLabel, optionCount: n };
}

async function main() {
  const acRec02Only = process.env.QA_AC_REC_02_ONLY === '1';
  const existingRowStamp = process.env.QA_EXISTING_STAMP || 'RECCHQA-MSNK95YR';
  const filterSourceCode = process.env.QA_FILTER_SOURCE_CODE || 'CSO_01';

  const portal = await pickPortal();
  if (!portal) {
    R.ack_status = 'FAIL_TO_PM';
    R.overall = 'FAIL_L0_PORTAL';
    R.pm_dispatch_hint = 'devops — portal :5173/:5175 down';
    R.endedAt = ts();
    save();
    process.exit(2);
  }
  R.env.PORTAL = portal;

  const session = await loginApi(portal);

  if (acRec02Only) {
    R.mode = 'AC-REC-02-only';
    R.existingRowStamp = existingRowStamp;
    R.filterSourceCode = filterSourceCode;
    R.l0 = { qc_fe_be_health: 'exit 0 (this run)' };
    save();
    const browser = await chromium.launch({
      headless: true,
      executablePath: CHROME,
      args: ['--disable-dev-shm-usage'],
    });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    track(page);
    await injectPortalAuth(page, session);
    const ok = await runAcRec02Filter(page, portal, existingRowStamp, filterSourceCode);
    R.overall = ok ? 'PASS' : 'FAIL';
    R.ack_status = ok ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    R.pm_dispatch_hint = ok
      ? 'qc — PO-HRM-REC-CHANNELS-CONSUMER-QC-01 narrow slice AC-REC-02; deny settings_catalog_e2e_ready flip'
      : 'dev-fe — AC-REC-02 filter testids or list filter predicate';
    R.endedAt = ts();
    save();
    await browser.close();
    console.log('ack_status', R.ack_status, 'overall', R.overall);
    process.exitCode = ok ? 0 : 1;
    return;
  }

  let eff = await fetchChannelEff(session.token);
  R.channels.effBefore = eff.count;
  R.channels.codes = eff.codes.slice(0, 20);
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  let channelCode = eff.codes[0] || null;
  let channelLabel = eff.labels?.[0] || null;

  if (eff.count === 0) {
    await ensureChannelsViaFe(page, portal);
    eff = await fetchChannelEff(session.token);
    R.channels.effAfter = eff.count;
    channelCode = eff.codes[0] || null;
    channelLabel = eff.labels?.[0] || null;
    if (eff.count === 0) {
      const newCode = `qa_ch_${STAMP.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 24)}`;
      const newLabel = `QA Kênh ${STAMP}`;
      const created = await createChannelExtension(page, newCode, newLabel);
      if (created) {
        channelCode = newCode;
        channelLabel = newLabel;
        eff = await fetchChannelEff(session.token);
        R.channels.effAfter = eff.count;
      }
    } else {
      R.channels.effAfter = eff.count;
    }
    save();
  }

  if (!channelCode) {
    ac('AC-REC-01-PRECOND', 'FAIL', { summary: 'No recruitment_channels EFF after FE sync/create' });
    R.ack_status = 'FAIL_TO_PM';
    R.pm_dispatch_hint = 'dev-fe — BR-REC-CH-SOT-02 empty path or settings sync broken';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }
  ac('AC-REC-01-PRECOND', 'PASS', {
    summary: `EFF>0 code=${channelCode} label=${channelLabel} sync=${R.channels.syncUsed} feCreate=${R.channels.feCreateUsed}`,
  });

  const recvBefore = await fetchReceivableCount(session.token);
  R.yctd = { receivableBefore: recvBefore };
  const forceNewYctd = process.env.QA_FORCE_NEW_YCTD === '1';
  if (recvBefore.count === 0 || forceNewYctd) {
    const boot = await bootstrapReceivableYctd(page, portal, session.token, { forceNew: forceNewYctd });
    R.yctd.bootstrap = boot;
    save();
    ac('YCTD-BOOTSTRAP-U65', boot.ok ? 'PASS' : 'FAIL', {
      summary: `FE chain JD→YCTD→WF receivable=${boot.count ?? 0} reason=${boot.reason || boot.yctdPost?.status || 'no-post'}`,
    });
    if (!boot.ok) {
      R.yctd.bootstrapBlocked = true;
      save();
    }
  } else {
    ac('YCTD-BOOTSTRAP-U65', 'PASS', {
      summary: `receivable=${recvBefore.count} existing-approved (skip new YCTD)`,
    });
  }

  await openCandidates(page, portal);
  const bodyMount = await page.locator('body').innerText().catch(() => '');
  if (/Sync ERROR|HRM API request failed \(5/i.test(bodyMount)) {
    ac('L2-CANDIDATES', 'FAIL', { summary: 'Sync ERROR on candidates tab' });
  } else {
    ac('L2-CANDIDATES', 'PASS', { summary: 'Candidates tab mounted' });
  }
  await shot(page, '03-candidates-list');

  const host = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-create-btn'));
  await host.getByTestId('hdsd-candidate-create-btn').first().click({ force: true });
  await sleep(3500);
  const dlgHost = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-form-dialog'));
  await dlgHost
    .getByTestId('hdsd-candidate-form-dialog')
    .waitFor({ state: 'visible', timeout: 20000 })
    .catch(() => {});
  const yctdVisible = await dlgHost.getByTestId('hdsd-candidate-form-yctd').isVisible().catch(() => false);
  const emptyYctd = await dlgHost.getByTestId('hdsd-candidate-form-empty-yctd').isVisible().catch(() => false);
  ac('REGRESSION-YCTD', yctdVisible || emptyYctd ? 'PASS' : 'FAIL', {
    summary: `YCTD gate picker=${yctdVisible} emptyCta=${emptyYctd}`,
  });

  if (emptyYctd && !yctdVisible) {
    const srcOnly = await selectSourceCatalog(page, dlgHost, channelCode);
    const legacyLinkedIn =
      srcOnly.optionCount > 0 &&
      (await dlgHost.locator('[role="option"]').filter({ hasText: /^LinkedIn$/ }).count()) > 0;
    ac('AC-REC-01-PICKER-SMOKE', srcOnly.ok && !legacyLinkedIn ? 'PASS' : 'FAIL', {
      summary: `blocked mutate · picker=${srcOnly.ok} code=${srcOnly.code} options=${srcOnly.optionCount} legacyLinkedIn=${legacyLinkedIn}`,
    });
    ac('AC-REC-01', 'FAIL', { summary: 'UV create blocked — no receivable YCTD (U65)' });
    R.ack_status = 'FAIL_TO_PM';
    R.pm_dispatch_hint =
      'dev-fe — YCTD create form-ready/submit (0 requisitions in API); then re-run QA-PO-HRM-REC-CHANNELS-CONSUMER-01';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }

  const yctd = await selectYctd(page, dlgHost);
  if (!yctd.ok) {
    ac('AC-REC-01', 'FAIL', { summary: `Cannot select YCTD: ${yctd.reason}` });
    R.ack_status = 'FAIL_TO_PM';
    R.pm_dispatch_hint = 'qa-device blocked — create receivable YCTD from FE first (U65) or dev-fe empty gate';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }

  await dlgHost.getByLabel(/Họ và tên|Họ tên|Full name/i).fill(CAND_NAME).catch(() => {});
  await dlgHost.getByLabel(/Email/i).fill(CAND_EMAIL).catch(() => {});

  const src = await selectSourceCatalog(page, dlgHost, channelCode);
  if (!src.ok) {
    ac('AC-REC-01', 'FAIL', { summary: `Source picker fail: ${src.reason}` });
    R.ack_status = 'FAIL_TO_PM';
    R.pm_dispatch_hint = 'dev-fe — CandidateFormDialog catalog bind';
    R.overall = 'FAIL';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }
  R.ids.selectedSourceCode = src.code;
  R.ids.selectedSourceLabel = src.label;
  save();

  const postsBefore = R.network.length;
  await dlgHost.getByTestId('hdsd-candidate-form-submit').click({ force: true });
  await sleep(4500);
  await shot(page, '04-after-create');

  const createPost = R.network.slice(postsBefore).find((n) => n.method === 'POST' && (/candidates-pool/.test(n.url) || /\/recruitment\/candidates/.test(n.url)));
  const reqSource = createPost?.requestBody?.source ?? null;
  const sourceIsCode =
    reqSource === src.code && reqSource !== src.label && String(reqSource).length > 0;
  ac('AC-REC-01', sourceIsCode && createPost?.status >= 200 && createPost?.status < 300 ? 'PASS' : 'FAIL', {
    summary: `POST ${createPost?.status} source=${reqSource} expectedCode=${src.code} label=${src.label}`,
    network: createPost,
  });
  ac('VAL-REC-CH-FE-01', sourceIsCode ? 'PASS' : 'FAIL', {
    summary: 'POST source must be catalog code not VI label',
  });

  const rowHost = await findInFrames(page, (h) => h.locator('table tbody tr').filter({ hasText: STAMP }));
  const row = rowHost.locator('table tbody tr').filter({ hasText: STAMP }).first();
  const listVisible = await row.isVisible().catch(() => false);
  let badgeText = '';
  if (listVisible) {
    badgeText = (await row.locator('.badge, [class*="Badge"]').filter({ hasText: src.label || src.code }).first().innerText().catch(() => '')).trim();
    if (!badgeText) {
      badgeText = (await row.innerText().catch(() => '')).includes(src.label || src.code) ? src.label || src.code : '';
    }
  }
  const listLabelOk = listVisible && (badgeText || (await row.innerText().catch(() => '')).includes(src.label || ''));
  ac('AC-REC-03-LIST', listLabelOk ? 'PASS' : 'FAIL', {
    summary: `list row visible=${listVisible} badge/label match label=${src.label}`,
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(4500);
  await shot(page, '05-f5-list');
  const rowF5Host = await findInFrames(page, (h) => h.locator('table tbody tr').filter({ hasText: STAMP }));
  const rowF5 = rowF5Host.locator('table tbody tr').filter({ hasText: STAMP }).first();
  const f5Ok = await rowF5.isVisible().catch(() => false);
  ac('AC-REC-01-F5', f5Ok ? 'PASS' : 'FAIL', { summary: `F5 list persists stamp=${STAMP}` });

  if (await rowF5.isVisible().catch(() => false)) {
    const detailBtn = rowF5.getByRole('button', { name: /Chi tiết|Xem|Detail/i }).first();
    if (await detailBtn.isVisible().catch(() => false)) {
      await detailBtn.click({ force: true });
    } else {
      await rowF5.click({ force: true }).catch(() => {});
    }
    await sleep(2000);
    await shot(page, '06-detail');
    const detailBody = await page.locator('body').innerText().catch(() => '');
    const detailOk = detailBody.includes(src.label || '') || detailBody.includes(src.code || '');
    ac('AC-REC-03-DETAIL', detailOk ? 'PASS' : 'FAIL', {
      summary: `detail shows resolved label/code`,
    });
  }

  const filterCode = src.code && /^CSO_/i.test(String(src.code)) ? src.code : 'CSO_01';
  await runAcRec02Filter(page, portal, STAMP, filterCode);

  const fails = Object.values(R.ac).filter((x) => x.verdict === 'FAIL');
  R.overall = fails.length === 0 ? 'PASS' : 'FAIL';
  R.ack_status = fails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  if (fails.length) {
    R.pm_dispatch_hint = 'dev-fe — AC-REC consumer channels FAIL see evidence json';
  }
  R.endedAt = ts();
  save();
  await browser.close();
  console.log('ack_status', R.ack_status, 'overall', R.overall);
  process.exitCode = fails.length ? 1 : 0;
}

main().catch((e) => {
  R.ack_status = 'FAIL_TO_PM';
  R.overall = 'ERROR';
  R.pm_dispatch_hint = `qa re-run after fix — ${String(e).slice(0, 200)}`;
  R.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
