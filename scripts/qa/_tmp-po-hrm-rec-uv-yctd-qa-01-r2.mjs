#!/usr/bin/env node
/**
 * PO-HRM-REC-UV-YCTD-QA-01-R2 — Browser U65 retest after FE-02 Lane A list union
 * Focus: UF-REC-UV-05 list cells · UF-05-F5 FE retain · J-HRM-REC-UV-01 steps 8–10
 * Regression: UF-01/03/04/06/07 · process gate
 * DENIED: seed · recruitment_uat_ready · job_postings SoT · API-only PASS for AC-02
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-rec-uv-yctd-qa-01-r2.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-rec-uv-yctd-qa-01-r2');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `UVYCTD-R2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const CAND_NAME = `UV YCTD QA R2 ${STAMP}`;
const CAND_EMAIL = `uv.yctd.qa.r2.${STAMP.toLowerCase()}@xe.vn`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function cellFilled(v) {
  const t = String(v || '').trim();
  return Boolean(t) && t !== '—' && t !== '-' && t !== '–' && !/^n\/?a$/i.test(t);
}

const results = {
  work_item_id: 'PO-HRM-REC-UV-YCTD-QA-01',
  round: 'R2',
  parent: 'PO-HRM-REC-UV-YCTD-FE-02',
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL: null, HRM, XBOS, TENANT, STAMP, beMode: 'nest-start-watch' },
  denied: [
    'recruitment_uat_ready',
    'jd_dynamic_done',
    'seed',
    'module_uat',
    'job_postings_sot',
    'api_only_pass',
  ],
  l0: {},
  api_corroborate: {},
  uf: {},
  ac: {},
  journey: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  dndStormHits: [],
  mojibakeHits: [],
  dualWriteHits: [],
  screens: [],
  click_log: [],
  ids: {
    selectedYctdId: null,
    selectedYctdTitle: null,
    positionKey: null,
    positionName: null,
    candidateId: null,
  },
  residuals: [],
  overall: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 320)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function unwrapList(body) {
  if (!body || typeof body !== 'object') return [];
  const d = body.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(d)) return d;
  return [];
}

function hasMojibake(text) {
  if (!text) return false;
  return /Ã.|Â.|Ä.|Æ.|Æ°|Æ°á|á»|Ä‘|Ã¡|Ã |Ã©|â€|ï¿½/.test(text);
}

async function pickPortal() {
  for (const base of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(5000) });
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
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  if (extra.requisition_id) u.searchParams.set('requisition_id', extra.requisition_id);
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
    const t = String(msg.text());
    if (msg.type() === 'error') results.consoleErrors.push(t.slice(0, 280));
    if (/Unable to find drag handle|@hello-pangea\/dnd|Invariant failed/i.test(t)) {
      results.dndStormHits.push(t.slice(0, 200));
    }
  });
  page.on('pageerror', (err) => {
    const t = String(err);
    results.pageErrors.push(t.slice(0, 280));
    if (/Uncaught|ReferenceError/i.test(t)) results.pageErrors.push(`UNCAUGHT:${t.slice(0, 200)}`);
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
        at: ts(),
      };
      const interesting =
        /requisitions|candidates|job_postings|job-postings|candidates-pool/.test(u) ||
        (method === 'POST' && /recruitment/.test(u));
      if (!interesting) return;

      if (method === 'GET' && /requisitions/.test(u) && /receivable=true/.test(u)) {
        try {
          const j = await res.json();
          const arr = unwrapList(j);
          entry.receivableCount = arr.length;
          entry.sample = arr.slice(0, 5).map((x) => ({
            id: x.id,
            title: x.title,
            status: x.status,
            position_key: x.position_key ?? x.position_code ?? null,
            position_name: x.position_name ?? null,
          }));
          results.lastReceivable = {
            status: res.status(),
            count: arr.length,
            sample: entry.sample,
          };
        } catch {
          /* */
        }
      }

      if (method === 'POST' && /\/candidates(\?|$)/.test(u) && !/candidates-pool/.test(u)) {
        try {
          const postData = res.request().postData();
          entry.requestBody = postData ? JSON.parse(postData) : null;
          const j = await res.json().catch(() => ({}));
          const row = j?.data ?? j;
          entry.responseCode = j?.code || j?.error?.code || null;
          entry.message = String(j?.message || j?.error?.message || '').slice(0, 240);
          if (row?.id) results.ids.candidateId = row.id;
          entry.createdId = row?.id || null;
          entry.requisition_id = row?.requisition_id ?? entry.requestBody?.requisition_id ?? null;
          entry.position_key = row?.position_key ?? null;
          entry.position_name = row?.position_name ?? null;
          entry.yctd_title = row?.yctd_title ?? null;
          results.lastCreate = {
            status: res.status(),
            code: entry.responseCode,
            id: row?.id,
            requestBody: entry.requestBody,
            responseSnippet: {
              requisition_id: entry.requisition_id,
              position_key: entry.position_key,
              position_name: entry.position_name,
              yctd_title: entry.yctd_title,
            },
            message: entry.message,
          };
        } catch {
          /* */
        }
      }

      if (/job.postings|job_postings|job-postings/i.test(u) && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        entry.dualWriteSuspect = true;
        results.dualWriteHits.push(entry);
      }

      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function apiCorroborate(token) {
  const h = {
    authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'x-company-id': COMPANY,
    'content-type': 'application/json',
  };
  const recvUrl = `${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}&receivable=true&page_size=50`;
  const r = await fetch(recvUrl, { headers: h });
  const rj = await r.json().catch(() => ({}));
  const arr = unwrapList(rj);

  // REQUIRED probe (API corroborate — not UF mutate seed)
  const miss = await fetch(`${HRM}/api/hrm/recruitment/candidates`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      company_id: COMPANY,
      full_name: 'QA REQUIRED Probe',
      email: `required.probe.${STAMP.toLowerCase()}@xe.vn`,
      stage: 'applied',
    }),
  });
  const missJ = await miss.json().catch(() => ({}));

  // STATUS probe — pick non-receivable if any
  const allUrl = `${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}&page_size=50`;
  const a = await fetch(allUrl, { headers: h });
  const aj = await a.json().catch(() => ({}));
  const allArr = unwrapList(aj);
  const nonRecv = allArr.find(
    (x) => !['open', 'approved', 'open_for_hire'].includes(String(x.status || '').toLowerCase()),
  );
  let statusProbe = null;
  if (nonRecv?.id) {
    const s = await fetch(`${HRM}/api/hrm/recruitment/candidates`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        company_id: COMPANY,
        full_name: 'QA STATUS Probe',
        email: `status.probe.${STAMP.toLowerCase()}@xe.vn`,
        stage: 'applied',
        requisition_id: nonRecv.id,
      }),
    });
    const sj = await s.json().catch(() => ({}));
    statusProbe = {
      status: s.status,
      code: sj?.code || sj?.error?.code || null,
      yctdId: nonRecv.id,
      yctdStatus: nonRecv.status,
    };
  }

  // MISMATCH probe — receivable + wrong position_key
  let mismatchProbe = null;
  if (arr[0]?.id) {
    const m = await fetch(`${HRM}/api/hrm/recruitment/candidates`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        company_id: COMPANY,
        full_name: 'QA MISMATCH Probe',
        email: `mismatch.probe.${STAMP.toLowerCase()}@xe.vn`,
        stage: 'applied',
        requisition_id: arr[0].id,
        position_key: '__qa_mismatch_key__',
      }),
    });
    const mj = await m.json().catch(() => ({}));
    mismatchProbe = {
      status: m.status,
      code: mj?.code || mj?.error?.code || null,
      message: String(mj?.message || '').slice(0, 200),
    };
  }

  results.api_corroborate = {
    receivable: {
      status: r.status,
      count: arr.length,
      sample: arr.slice(0, 3).map((x) => ({
        id: x.id,
        title: x.title,
        status: x.status,
        position_key: x.position_key ?? x.position_code,
        position_name: x.position_name,
      })),
    },
    requiredProbe: {
      status: miss.status,
      code: missJ?.code || missJ?.error?.code || null,
      message: String(missJ?.message || '').slice(0, 200),
    },
    statusProbe,
    mismatchProbe,
  };
  save();
  return { arr, headers: h };
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

async function openCreateForm(page) {
  const host = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-create-btn'));
  const btn = host.getByTestId('hdsd-candidate-create-btn').first();
  if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await btn.click({ force: true });
  } else {
    const alt = host.getByRole('button', { name: /Thêm ứng viên|Thêm UV|Tạo ứng viên/i }).first();
    await alt.click({ force: true }).catch(() => {});
  }
  log('open_create_form');
  await sleep(2000);
  const dlgHost = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-form-dialog'));
  await dlgHost
    .getByTestId('hdsd-candidate-form-dialog')
    .waitFor({ state: 'visible', timeout: 12000 })
    .catch(() => {});
  return dlgHost;
}

async function selectYctdOption(host, preferredId) {
  const trigger = host.getByTestId('hdsd-candidate-form-yctd').first();
  await trigger.click({ force: true });
  await sleep(600);
  const opts = host.locator('[role="option"]');
  const n = await opts.count();
  const texts = [];
  let picked = null;
  let pickedId = null;
  for (let i = 0; i < n; i++) {
    const t = (await opts.nth(i).innerText().catch(() => '')).trim();
    if (t) texts.push(t.slice(0, 160));
  }
  // Skip sentinel «Chọn…»
  for (let i = 0; i < n; i++) {
    const opt = opts.nth(i);
    const t = (await opt.innerText().catch(() => '')).trim();
    const val = (await opt.getAttribute('data-value').catch(() => '')) || '';
    if (!t || /Chọn yêu cầu|__none__/i.test(t) || val === '__none__') continue;
    if (preferredId && val && val !== preferredId) continue;
    await opt.click({ force: true });
    picked = t;
    pickedId = val || preferredId;
    break;
  }
  if (!picked) {
    // fallback: second option
    if (n > 1) {
      const opt = opts.nth(1);
      picked = (await opt.innerText().catch(() => '')).trim();
      pickedId = (await opt.getAttribute('data-value').catch(() => '')) || null;
      await opt.click({ force: true });
    }
  }
  await sleep(800);
  return { optionTexts: texts, picked, pickedId, count: n };
}

async function main() {
  const portal = await pickPortal();
  results.env.PORTAL = portal;
  async function probe(url, retries = 3) {
    let last = null;
    for (let i = 0; i < retries; i++) {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
        return r.status;
      } catch (e) {
        last = e;
        await sleep(800);
      }
    }
    return String(last).slice(0, 100);
  }
  for (const [name, url] of [
    ['portal', portal],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    if (!url) {
      results.l0[name] = 'missing';
      continue;
    }
    results.l0[name] = await probe(url);
  }
  save();
  if (results.l0.portal !== 200 || results.l0.hrm !== 200) {
    results.overall = 'FAIL_L0';
    results.endedAt = ts();
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }

  const session = await loginApi(portal);
  const { arr: receivable } = await apiCorroborate(session.token);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const url = q(portal, '/hr/recruitment', { tab: 'candidates', companyId: COMPANY });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  log('goto_candidates', { url });
  await sleep(4500);
  await shot(page, '00-candidates-list');

  const body0 = await page.locator('body').innerText().catch(() => '');
  if (hasMojibake(body0)) results.mojibakeHits.push('list_body');
  if (/Sync ERROR|HRM API request failed \(5/i.test(body0)) {
    recordUf('L2_MOUNT', 'FAIL', { summary: 'Sync ERROR / API fail on candidates tab' });
  } else {
    recordUf('L2_MOUNT', 'PASS', { summary: 'candidates tab mounted · no Sync ERROR' });
  }

  // ——— UF-01 open form + YCTD gate ———
  let dlgHost = await openCreateForm(page);
  await shot(page, '01-form-open');
  const formVisible = await dlgHost
    .getByTestId('hdsd-candidate-form-dialog')
    .isVisible()
    .catch(() => false);
  const yctdTrigger = dlgHost.getByTestId('hdsd-candidate-form-yctd');
  const emptyCta = dlgHost.getByTestId('hdsd-candidate-form-empty-yctd');
  const yctdVisible = await yctdTrigger.isVisible().catch(() => false);
  const emptyVisible = await emptyCta.isVisible().catch(() => false);
  const receivableNet = results.lastReceivable || results.api_corroborate.receivable;
  const formLabels = await dlgHost
    .getByTestId('hdsd-candidate-form-dialog')
    .innerText()
    .catch(() => '');
  if (hasMojibake(formLabels)) results.mojibakeHits.push('form_dialog');

  if (formVisible && (yctdVisible || emptyVisible) && receivableNet?.status === 200) {
    recordUf('UF-REC-UV-01', 'PASS', {
      summary: `form open · YCTD gate=${yctdVisible ? 'SELECT' : 'empty-CTA'} · GET receivable ${receivableNet.status} count=${receivableNet.count}`,
      receivableCount: receivableNet.count,
    });
  } else {
    recordUf('UF-REC-UV-01', 'FAIL', {
      summary: `formVisible=${formVisible} yctd=${yctdVisible} empty=${emptyVisible} recv=${JSON.stringify(receivableNet)}`,
    });
  }

  // ——— UF-02 empty ———
  if (emptyVisible || (receivableNet?.count === 0 && emptyVisible)) {
    const submit = dlgHost.getByTestId('hdsd-candidate-form-submit');
    const disabled = await submit.isDisabled().catch(() => false);
    const cta = dlgHost.getByTestId('hdsd-candidate-form-open-yctd-cta');
    const ctaVis = await cta.isVisible().catch(() => false);
    recordUf('UF-REC-UV-02', disabled || ctaVis ? 'PASS' : 'FAIL', {
      summary: `empty CTA · submitDisabled=${disabled} · openYctdCta=${ctaVis}`,
    });
  } else {
    recordUf('UF-REC-UV-02', 'N/A', {
      summary: `natural receivable=${receivableNet?.count ?? receivable.length} — U65 no wipe; empty path not forced`,
    });
  }

  // ——— UF-04 REQUIRED (omit YCTD) — before selecting ———
  if (yctdVisible) {
    await dlgHost.locator('input').filter({ hasNot: dlgHost.getByTestId('hdsd-candidate-form-position') }).first().fill('').catch(() => {});
    // Fill name/email but leave YCTD sentinel
    await dlgHost.locator('input[name="full_name"], input').nth(0).fill(CAND_NAME).catch(() => {});
    // Prefer labeled fields
    const nameInput = dlgHost.locator('input').filter({ has: page.locator('xpath=..') });
    // Fill by placeholder / label proximity
    const inputs = dlgHost.locator('form input:not([readonly])');
    const inCount = await inputs.count();
    for (let i = 0; i < inCount; i++) {
      const ph = (await inputs.nth(i).getAttribute('placeholder').catch(() => '')) || '';
      const type = (await inputs.nth(i).getAttribute('type').catch(() => '')) || '';
      const name = (await inputs.nth(i).getAttribute('name').catch(() => '')) || '';
      if (/email/i.test(type) || /email/i.test(name) || /@/.test(ph)) {
        await inputs.nth(i).fill(CAND_EMAIL);
      } else if (/họ|tên|name|Họ/i.test(ph) || name === 'full_name') {
        await inputs.nth(i).fill(CAND_NAME);
      }
    }
    // Explicit: try getByLabel
    await dlgHost.getByLabel(/Họ và tên|Họ tên|Full name/i).fill(CAND_NAME).catch(() => {});
    await dlgHost.getByLabel(/Email/i).fill(CAND_EMAIL).catch(() => {});

    const submitBtn = dlgHost.getByTestId('hdsd-candidate-form-submit');
    const submitDisabled = await submitBtn.isDisabled().catch(() => false);
    const postsBefore = results.network.filter(
      (n) => n.method === 'POST' && /\/candidates(\?|$)/.test(n.url) && !/pool/.test(n.url),
    ).length;
    if (!submitDisabled) {
      await submitBtn.click({ force: true });
      await sleep(1500);
    }
    const postsAfter = results.network.filter(
      (n) => n.method === 'POST' && /\/candidates(\?|$)/.test(n.url) && !/pool/.test(n.url),
    );
    const newPosts = postsAfter.slice(postsBefore);
    const requiredOk =
      submitDisabled ||
      newPosts.length === 0 ||
      newPosts.every((p) => p.status === 400 && /REQUIRED/i.test(String(p.responseCode || '')));
    const formKept = await dlgHost.getByTestId('hdsd-candidate-form-dialog').isVisible().catch(() => false);
    const msgText = await dlgHost.locator('[id*=form-item-message], .text-destructive, [role=alert]').allInnerTexts().catch(() => []);
    recordUf('UF-REC-UV-04', requiredOk && formKept ? 'PASS' : 'FAIL', {
      summary: `submitDisabled=${submitDisabled} · posts=${JSON.stringify(newPosts.map((p) => ({ s: p.status, c: p.responseCode })))} · msgs=${msgText.join('|').slice(0, 200)}`,
      ac: 'AC-REC-UV-01',
    });
  } else {
    recordUf('UF-REC-UV-04', emptyVisible ? 'PASS' : 'N/A', {
      summary: 'empty path — Lưu blocked by empty receivable (AC-01 covered via submit disabled)',
    });
  }

  // ——— UF-03 select YCTD + position derived ———
  let positionVal = '';
  let positionKey = '';
  let positionSource = '';
  if (yctdVisible && (receivableNet?.count > 0 || receivable.length > 0)) {
    const preferred = receivable[0]?.id || receivableNet?.sample?.[0]?.id;
    const sel = await selectYctdOption(dlgHost, preferred);
    results.ids.selectedYctdId = sel.pickedId || preferred;
    results.ids.selectedYctdTitle = sel.picked;
    await sleep(500);
    const pos = dlgHost.getByTestId('hdsd-candidate-form-position');
    positionVal = (await pos.inputValue().catch(() => '')) || (await pos.innerText().catch(() => ''));
    positionKey = (await pos.getAttribute('data-position-key').catch(() => '')) || '';
    positionSource = (await pos.getAttribute('data-position-source').catch(() => '')) || '';
    results.ids.positionKey = positionKey;
    results.ids.positionName = positionVal;
    const readonly = (await pos.getAttribute('readonly').catch(() => null)) !== null;
    const freeTextSoT = await dlgHost
      .locator('input[name="position"]:not([readonly]), textarea[name="position"]')
      .count()
      .catch(() => 0);
    const pass03 =
      Boolean(sel.picked) &&
      readonly &&
      freeTextSoT === 0 &&
      (Boolean(positionVal) || Boolean(positionKey));
    await shot(page, '02-yctd-selected-position');
    recordUf('UF-REC-UV-03', pass03 ? 'PASS' : 'FAIL', {
      summary: `picked=${sel.picked} · pos="${positionVal}" key=${positionKey} source=${positionSource} · readonly=${readonly} · freeTextSoT=${freeTextSoT}`,
      optionCount: sel.count,
      ac: 'AC-REC-UV-03',
    });

    // UF-06 no free-text SoT
    recordUf('UF-REC-UV-06', freeTextSoT === 0 && readonly ? 'PASS' : 'FAIL', {
      summary: `free-text position SoT controls=${freeTextSoT} · derived readonly=${readonly}`,
      ac: 'AC-REC-UV-03',
    });
  } else {
    recordUf('UF-REC-UV-03', 'BLOCKED', { summary: 'no receivable YCTD — mutate blocked U65' });
    recordUf('UF-REC-UV-06', emptyVisible ? 'PASS' : 'BLOCKED', {
      summary: 'empty path — no free-text SoT control present',
    });
  }

  // ——— UF-05 happy create ———
  if (results.uf['UF-REC-UV-03']?.verdict === 'PASS') {
    await dlgHost.getByLabel(/Họ và tên|Họ tên|Full name/i).fill(CAND_NAME).catch(() => {});
    await dlgHost.getByLabel(/Email/i).fill(CAND_EMAIL).catch(() => {});
    // source select optional
    const sourceTrigger = dlgHost.locator('button[role="combobox"]').filter({ hasText: /Nguồn|Source|Chọn/i }).first();
    if (await sourceTrigger.isVisible().catch(() => false)) {
      await sourceTrigger.click({ force: true }).catch(() => {});
      await sleep(400);
      const opt = dlgHost.locator('[role="option"]').filter({ hasText: /Website|Email|Khác/i }).first();
      await opt.click({ force: true }).catch(() => {});
    }
    const postsBefore = results.network.filter(
      (n) => n.method === 'POST' && /\/candidates(\?|$)/.test(n.url) && !/pool/.test(n.url),
    ).length;
    await dlgHost.getByTestId('hdsd-candidate-form-submit').click({ force: true });
    await sleep(4000);
    await shot(page, '03-after-save');
    const createPosts = results.network
      .filter((n) => n.method === 'POST' && /\/candidates(\?|$)/.test(n.url) && !/pool/.test(n.url))
      .slice(postsBefore);
    const okPost = createPosts.find((p) => p.status >= 200 && p.status < 300);
    const body1 = await page.locator('body').innerText().catch(() => '');
    const listShows =
      body1.includes(CAND_NAME) ||
      body1.includes(STAMP) ||
      Boolean(
        await page
          .locator(`[data-testid="hdsd-candidate-list-yctd"]`)
          .first()
          .isVisible()
          .catch(() => false),
      );
    // Find row for our candidate
    const rowHost = await findInFrames(page, (h) => h.locator('table tbody tr').filter({ hasText: STAMP }));
    const row = rowHost.locator('table tbody tr').filter({ hasText: STAMP }).first();
    let listYctd = '';
    let listPos = '';
    if (await row.isVisible().catch(() => false)) {
      listYctd = (await row.getByTestId('hdsd-candidate-list-yctd').innerText().catch(() => '')).trim();
      listPos = (await row.getByTestId('hdsd-candidate-list-position').innerText().catch(() => '')).trim();
    }
    // R2: FE list cells REQUIRED (AC-02) — POST 201 alone ≠ UF PASS
    const listCellsOk = cellFilled(listYctd) && cellFilled(listPos);
    const pass05 =
      Boolean(okPost) &&
      Boolean(okPost?.requestBody?.requisition_id || okPost?.requisition_id) &&
      !/job_posting/i.test(JSON.stringify(okPost?.requestBody || {})) &&
      listShows &&
      listCellsOk;
    recordUf('UF-REC-UV-05', pass05 ? 'PASS' : 'FAIL', {
      summary: `POST ${okPost?.status} code=${okPost?.responseCode || results.lastCreate?.code} · req=${okPost?.requestBody?.requisition_id || results.lastCreate?.responseSnippet?.requisition_id} · listYctd="${listYctd}" listPos="${listPos}" · listShows=${listShows} · listCellsOk=${listCellsOk}`,
      create: results.lastCreate,
      listCells: { yctd: listYctd, position: listPos },
      ac: 'AC-REC-UV-02',
    });

    // ——— F5 ———
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(4500);
    await shot(page, '04-f5-list');
    const bodyF5 = await page.locator('body').innerText().catch(() => '');
    const rowF5Host = await findInFrames(page, (h) => h.locator('table tbody tr').filter({ hasText: STAMP }));
    const rowF5 = rowF5Host.locator('table tbody tr').filter({ hasText: STAMP }).first();
    let f5Yctd = '';
    let f5Pos = '';
    let f5ReqId = '';
    if (await rowF5.isVisible().catch(() => false)) {
      f5Yctd = (await rowF5.getByTestId('hdsd-candidate-list-yctd').innerText().catch(() => '')).trim();
      f5Pos = (await rowF5.getByTestId('hdsd-candidate-list-position').innerText().catch(() => '')).trim();
      f5ReqId =
        (await rowF5.getByTestId('hdsd-candidate-list-yctd').getAttribute('data-requisition-id').catch(() => '')) ||
        '';
    }
    const namePersists = bodyF5.includes(STAMP) || bodyF5.includes(CAND_NAME);
    const yctdPersists = cellFilled(f5Yctd);
    const posPersists = cellFilled(f5Pos);

    // scope_parity GET (corroborate only — FE cells gate AC-02)
    let scopeParity = null;
    if (results.ids.candidateId) {
      const g = await fetch(
        `${HRM}/api/hrm/recruitment/candidates/${results.ids.candidateId}?company_id=${COMPANY}`,
        {
          headers: {
            authorization: `Bearer ${session.token}`,
            'x-tenant-id': TENANT,
            'x-company-id': COMPANY,
          },
        },
      );
      const gj = await g.json().catch(() => ({}));
      const rowG = gj?.data ?? gj;
      scopeParity = {
        status: g.status,
        requisition_id: rowG?.requisition_id ?? null,
        position_key: rowG?.position_key ?? null,
        position_name: rowG?.position_name ?? null,
        yctd_title: rowG?.yctd_title ?? null,
      };
    }
    // R2 honesty: AC-02 = FE list cells after F5 (API alone ≠ PASS)
    const passF5 =
      namePersists &&
      yctdPersists &&
      posPersists &&
      (!scopeParity || scopeParity.status === 200);
    recordUf('UF-REC-UV-05-F5', passF5 ? 'PASS' : 'FAIL', {
      summary: `name=${namePersists} yctd="${f5Yctd}" pos="${f5Pos}" reqAttr=${f5ReqId} · feCells=${yctdPersists && posPersists} · scope=${JSON.stringify(scopeParity)}`,
      listCellsF5: { yctd: f5Yctd, position: f5Pos, requisitionAttr: f5ReqId },
      scopeParity,
      ac: 'AC-REC-UV-02',
    });
  } else {
    recordUf('UF-REC-UV-05', 'BLOCKED', { summary: 'UF-03 not PASS — no happy create' });
    recordUf('UF-REC-UV-05-F5', 'BLOCKED', { summary: 'depends UF-05' });
  }

  // ——— UF-07 context prefill ———
  if (results.ids.selectedYctdId || receivable[0]?.id) {
    const reqId = results.ids.selectedYctdId || receivable[0].id;
    const ctxUrl = q(portal, '/hr/recruitment', {
      tab: 'candidates',
      companyId: COMPANY,
      requisition_id: reqId,
    });
    await page.goto(ctxUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(5000);
    await shot(page, '05-context-prefill');
    // Form may auto-open
    let ctxHost = await findInFrames(page, (h) => h.getByTestId('hdsd-candidate-form-dialog'));
    let dlgOpen = await ctxHost.getByTestId('hdsd-candidate-form-dialog').isVisible().catch(() => false);
    if (!dlgOpen) {
      ctxHost = await openCreateForm(page);
      dlgOpen = await ctxHost.getByTestId('hdsd-candidate-form-dialog').isVisible().catch(() => false);
    }
    const yctdVal = await ctxHost
      .getByTestId('hdsd-candidate-form-yctd')
      .innerText()
      .catch(() => '');
    const pos = ctxHost.getByTestId('hdsd-candidate-form-position');
    const posV = (await pos.inputValue().catch(() => '')) || '';
    const posSrc = (await pos.getAttribute('data-position-source').catch(() => '')) || '';
    const preselected =
      /YCTD|Yêu cầu|JD-|open|approved/i.test(yctdVal) && !/Chọn yêu cầu tuyển dụng/i.test(yctdVal);
    // Also check if select value is set via data
    const triggerText = (await ctxHost.getByTestId('hdsd-candidate-form-yctd').textContent().catch(() => '')) || '';
    const ok07 =
      dlgOpen &&
      (!/Chọn yêu cầu tuyển dụng —/.test(triggerText) || Boolean(posV) || posSrc === 'yctd');
    recordUf('UF-REC-UV-07', ok07 || preselected || Boolean(posV) ? 'PASS' : 'FAIL', {
      summary: `reqId=${reqId} · trigger="${triggerText.slice(0, 120)}" · pos="${posV}" source=${posSrc} · dlg=${dlgOpen}`,
      ac: 'AC-REC-UV-04',
    });
  } else {
    recordUf('UF-REC-UV-07', 'BLOCKED', { summary: 'no YCTD id for context URL' });
  }

  // ——— UF-08 FORBIDDEN job_postings ———
  const recvGets = results.network.filter(
    (n) => n.method === 'GET' && /requisitions/.test(n.url) && /receivable=true/.test(n.url),
  );
  const postingWrites = results.dualWriteHits;
  const createBodies = results.network.filter(
    (n) => n.method === 'POST' && /\/candidates(\?|$)/.test(n.url) && n.requestBody,
  );
  const noPostingInCreate = createBodies.every(
    (n) => !n.requestBody?.job_posting_id && !n.requestBody?.job_postings,
  );
  recordUf('UF-REC-UV-08', recvGets.length > 0 && postingWrites.length === 0 && noPostingInCreate ? 'PASS' : 'FAIL', {
    summary: `receivable GETs=${recvGets.length} · dualWrite=${postingWrites.length} · createHasPosting=${!noPostingInCreate}`,
  });

  // ——— Negatives from API corroborate ———
  const req = results.api_corroborate.requiredProbe;
  const st = results.api_corroborate.statusProbe;
  const mm = results.api_corroborate.mismatchProbe;
  results.ac['AC-REC-UV-01'] =
    results.uf['UF-REC-UV-04']?.verdict === 'PASS' &&
    req?.status === 400 &&
    /REQUIRED/i.test(String(req?.code || ''))
      ? 'PASS'
      : results.uf['UF-REC-UV-04']?.verdict === 'PASS'
        ? 'PASS_SOFT'
        : 'FAIL';
  results.ac['AC-REC-UV-02'] = results.uf['UF-REC-UV-05-F5']?.verdict === 'PASS' ? 'PASS' : 'FAIL';
  results.ac['AC-REC-UV-03'] =
    results.uf['UF-REC-UV-03']?.verdict === 'PASS' && results.uf['UF-REC-UV-06']?.verdict === 'PASS'
      ? 'PASS'
      : 'FAIL';
  results.ac['AC-REC-UV-04'] = results.uf['UF-REC-UV-07']?.verdict === 'PASS' ? 'PASS' : 'FAIL';
  results.ac['NEG-REQUIRED'] =
    req?.status === 400 && /REQUIRED/i.test(String(req?.code || '')) ? 'PASS' : 'FAIL';
  results.ac['NEG-STATUS'] = st
    ? st.status === 400 && /STATUS/i.test(String(st.code || ''))
      ? 'PASS'
      : 'FAIL'
    : 'N/A';
  results.ac['NEG-MISMATCH'] =
    mm && mm.status === 400 && /MISMATCH/i.test(String(mm.code || '')) ? 'PASS' : mm ? 'FAIL' : 'N/A';

  // ——— Journey ———
  const processClean =
    results.pageErrors.length === 0 &&
    results.dndStormHits.length === 0 &&
    results.mojibakeHits.length === 0;
  const journeyPass =
    results.uf['UF-REC-UV-01']?.verdict === 'PASS' &&
    ['PASS', 'N/A'].includes(results.uf['UF-REC-UV-02']?.verdict) &&
    results.uf['UF-REC-UV-03']?.verdict === 'PASS' &&
    results.uf['UF-REC-UV-04']?.verdict === 'PASS' &&
    results.uf['UF-REC-UV-05']?.verdict === 'PASS' &&
    results.uf['UF-REC-UV-05-F5']?.verdict === 'PASS' &&
    results.uf['UF-REC-UV-06']?.verdict === 'PASS' &&
    results.uf['UF-REC-UV-08']?.verdict === 'PASS' &&
    processClean &&
    results.ac['NEG-REQUIRED'] === 'PASS';

  results.journey['J-HRM-REC-UV-01'] = {
    verdict: journeyPass ? 'PASS' : 'FAIL',
    processClean,
    pageErrors: results.pageErrors.length,
    dndStorm: results.dndStormHits.length,
    mojibake: results.mojibakeHits.length,
    consoleErrors: results.consoleErrors.length,
  };

  await shot(page, '06-final');
  await browser.close();

  const hardFails = Object.entries(results.uf).filter(([, v]) => v.verdict === 'FAIL');
  const acFails = Object.entries(results.ac).filter(([, v]) => v === 'FAIL');
  if (!processClean) {
    results.residuals.push({
      id: 'R-PROCESS-CONSOLE',
      detail: {
        pageErrors: results.pageErrors.slice(0, 5),
        dnd: results.dndStormHits.slice(0, 3),
        mojibake: results.mojibakeHits,
      },
    });
  }
  if (results.uf['UF-REC-UV-07']?.verdict === 'FAIL') {
    results.residuals.push({ id: 'R-UV-CONTEXT-PREFILL', owner: 'dev-fe' });
  }

  results.overall =
    journeyPass && hardFails.length === 0 && acFails.filter(([k]) => !k.startsWith('NEG-STATUS') || results.ac['NEG-STATUS'] !== 'N/A').every(([, v]) => v !== 'FAIL' || true)
      ? hardFails.length === 0 &&
        results.ac['AC-REC-UV-01'] !== 'FAIL' &&
        results.ac['AC-REC-UV-02'] === 'PASS' &&
        results.ac['AC-REC-UV-03'] === 'PASS' &&
        results.ac['NEG-REQUIRED'] === 'PASS' &&
        results.ac['NEG-MISMATCH'] !== 'FAIL' &&
        processClean
        ? 'PASS_TO_PM'
        : 'FAIL_TO_PM'
      : 'FAIL_TO_PM';

  // Simpler overall
  const mustPass = [
    'UF-REC-UV-01',
    'UF-REC-UV-03',
    'UF-REC-UV-04',
    'UF-REC-UV-05',
    'UF-REC-UV-05-F5',
    'UF-REC-UV-06',
    'UF-REC-UV-08',
  ];
  const mustOk = mustPass.every((id) => results.uf[id]?.verdict === 'PASS');
  const acOk =
    ['AC-REC-UV-01', 'AC-REC-UV-02', 'AC-REC-UV-03'].every((k) =>
      ['PASS', 'PASS_SOFT'].includes(results.ac[k]),
    ) &&
    results.ac['NEG-REQUIRED'] === 'PASS' &&
    results.ac['NEG-MISMATCH'] !== 'FAIL';
  results.overall = mustOk && acOk && processClean && journeyPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  if (results.uf['UF-REC-UV-07']?.verdict === 'FAIL') {
    // AC-04 soft residual — still FAIL journey if AC-04 required
    results.overall = 'FAIL_TO_PM';
    results.residuals.push({ id: 'R-AC-REC-UV-04', note: 'context prefill FAIL' });
  }

  if (results.uf['UF-REC-UV-05']?.verdict === 'FAIL' || results.uf['UF-REC-UV-05-F5']?.verdict === 'FAIL') {
    results.residuals.push({
      id: 'R-UV-YCTD-LANE-A-LIST-GAP',
      status: 'OPEN_OR_REGRESSED',
      note: 'FE list YCTD/position cells still missing after POST/F5 — recheck FE-02 unionSpineOnlyCandidatesIntoList wire',
      owner: 'dev-fe',
    });
  } else if (results.uf['UF-REC-UV-05']?.verdict === 'PASS' && results.uf['UF-REC-UV-05-F5']?.verdict === 'PASS') {
    results.residuals.push({
      id: 'R-UV-YCTD-LANE-A-LIST-GAP',
      status: 'CLOSED',
      note: 'R2: list cells + F5 FE retain PASS after FE-02 union',
    });
  }

  results.endedAt = ts();
  save();
  console.log(JSON.stringify({ overall: results.overall, uf: results.uf, ac: results.ac, journey: results.journey, residuals: results.residuals }, null, 2));
  process.exit(results.overall === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  results.overall = 'FAIL_TO_PM';
  results.residuals.push({ id: 'R-HARNESS', error: String(e).slice(0, 400) });
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
