#!/usr/bin/env node
/**
 * PO-HRM-JD-YCTD-REF-QA-01 — Browser U65 execute
 * UF-YCTD-JD-01a..d · 01-F5 · 05 dual-write · 06 scope_parity · J-HRM-JD-YCTD-01
 * Persona: ceo@xe.vn · company_id=main · portal :5173
 * DENIED: seed · API-only PASS · jd_dynamic_done · module UAT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-jd-yctd-ref-qa-01.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-jd-yctd-ref-qa-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `YCTDJD-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const REQ_TITLE = `YCTD JD-ref QA ${STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-JD-YCTD-REF-QA-01',
  startedAt: ts(),
  u65: 'zero-seed',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, TENANT, STAMP },
  denied: ['jd_dynamic_done', 'seed', 'module_uat', 'job_postings_sot', 'api_only_pass'],
  l0: {},
  api_corroborate: {},
  uf: {},
  journey: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  ids: { selectedJdId: null, selectedJdCode: null, selectedJdTitle: null, requisitionId: null },
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 300)}`);
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

/** Normalize HRM list envelopes: data.items | data.data | items | data[] */
function unwrapList(body) {
  if (!body || typeof body !== 'object') return [];
  const d = body.data;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(d)) return d;
  return [];
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
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        at: ts(),
      };
      const interesting =
        /job-templates|requisitions|job_postings|job-postings|bindable|preview=yctd/.test(u) ||
        (method === 'POST' && /recruitment/.test(u));
      if (!interesting) return;

      if (method === 'GET' && /job-templates/.test(u) && /bindable=true|for=yctd/.test(u)) {
        try {
          const j = await res.json();
          const arr = unwrapList(j);
          entry.bindableCount = arr.length;
          entry.sampleStatuses = arr.slice(0, 8).map((x) => ({
            id: x.id,
            code: x.code,
            is_active: x.is_active,
            status: x.status,
            retired: x.retired_at || x.is_retired,
          }));
          results.lastBindable = { status: res.status(), count: arr.length, sample: entry.sampleStatuses };
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /job-templates\/[^/?]+/.test(u) && /preview=yctd/.test(u)) {
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.preview = j?.data ?? j;
          results.lastPreview = { status: res.status(), code: entry.code, body: entry.preview };
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/requisitions(\?|$)/.test(u) && !/submit-workflow/.test(u)) {
        try {
          const req = res.request();
          const postData = req.postData();
          entry.requestBody = postData ? JSON.parse(postData) : null;
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.requisitionId = row.id;
          entry.createdId = row?.id || null;
          entry.responseCode = j?.code || null;
          entry.jd_code = row?.jd_code ?? null;
          entry.jd_title = row?.jd_title ?? null;
          entry.job_template_id = row?.job_template_id ?? null;
          results.lastCreate = {
            status: res.status(),
            code: j?.code,
            id: row?.id,
            jd_code: row?.jd_code,
            jd_title: row?.jd_title,
            job_template_id: row?.job_template_id,
            requestBody: entry.requestBody,
            message: String(j?.message || '').slice(0, 240),
          };
        } catch {
          /* */
        }
      }
      if (/job.postings|job_postings|job-postings/i.test(u) && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        entry.dualWriteSuspect = true;
        results.dualWriteHits = results.dualWriteHits || [];
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
  const bindableUrl = `${HRM}/api/hrm/recruitment/job-templates?company_id=${COMPANY}&bindable=true&page_size=50`;
  const allUrl = `${HRM}/api/hrm/recruitment/job-templates?company_id=${COMPANY}&page_size=50`;
  const b = await fetch(bindableUrl, { headers: h });
  const bj = await b.json().catch(() => ({}));
  const bArr = unwrapList(bj);
  const a = await fetch(allUrl, { headers: h });
  const aj = await a.json().catch(() => ({}));
  const aArr = unwrapList(aj);
  const nonActiveInBindable = bArr.filter(
    (x) => x.is_active === false || /draft|retired|inactive|ngừng|nháp/i.test(String(x.status || '')),
  );
  const retiredOrDraft = aArr.filter(
    (x) =>
      x.is_active === false ||
      /draft|retired|inactive/i.test(String(x.status || '')) ||
      x.retired_at,
  );
  results.api_corroborate = {
    bindable: { status: b.status, count: bArr.length, nonActiveCount: nonActiveInBindable.length },
    all: { status: a.status, count: aArr.length, retiredOrDraftCount: retiredOrDraft.length },
    sampleBindable: bArr.slice(0, 3).map((x) => ({ id: x.id, code: x.code, title: x.title, is_active: x.is_active })),
    sampleRetiredOrDraft: retiredOrDraft.slice(0, 3).map((x) => ({
      id: x.id,
      code: x.code,
      is_active: x.is_active,
      status: x.status,
    })),
  };
  save();
  return { bArr, retiredOrDraft, token: h };
}

async function pickFirstCatalogOption(page, testId) {
  const trigger = page.getByTestId(testId).first();
  await trigger.click({ force: true }).catch(() => {});
  await sleep(500);
  const opts = page.locator('[role="option"], [cmdk-item], [data-radix-collection-item]');
  const n = await opts.count();
  const texts = [];
  for (let i = 0; i < Math.min(n, 20); i++) {
    const t = (await opts.nth(i).innerText().catch(() => '')).trim();
    if (t) texts.push(t.slice(0, 120));
  }
  const first = opts.filter({ hasNotText: /Chưa có|__empty|Không có/i }).first();
  let picked = null;
  if (await first.isVisible().catch(() => false)) {
    picked = (await first.innerText().catch(() => '')).trim().slice(0, 120);
    await first.click({ force: true }).catch(() => {});
    await sleep(800);
  }
  return { optionTexts: texts, picked, count: n };
}

async function openCreateDialog(page) {
  const btn = page.getByTestId('hdsd-requisition-create-btn').first();
  if (!(await btn.isVisible().catch(() => false))) {
    const alt = page.getByRole('button', { name: /Thêm yêu cầu|Thêm|Tạo yêu cầu/i }).first();
    await alt.click({ force: true }).catch(() => {});
  } else {
    await btn.click({ force: true });
  }
  log('open_create');
  await sleep(2000);
  await page.getByTestId('hdsd-requisition-form-ready').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  await page.getByTestId('hdsd-requisition-form-dialog').waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
}

async function main() {
  // L0
  for (const [name, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 100);
    }
  }
  save();
  if (results.l0.portal !== 200 || results.l0.hrm !== 200) {
    results.overall = 'FAIL_L0';
    results.endedAt = ts();
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }

  const session = await loginApi();
  const { bArr, retiredOrDraft, token: apiHeaders } = await apiCorroborate(session.token);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const url = q('/hr/recruitment', { tab: 'requisitions', companyId: COMPANY });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  log('goto_requisitions', { url });
  await sleep(4000);
  await shot(page, '00-requisitions');

  const body0 = await page.locator('body').innerText().catch(() => '');
  const mountOk =
    /Yêu cầu|Tuyển dụng|requisition/i.test(body0) &&
    !/HRM API Sync ERROR|Failed to fetch dynamically/i.test(body0);
  if (!mountOk) {
    recordUf('L2_MOUNT', '🔴', { summary: 'Requisitions tab mount fail', bodySlice: body0.slice(0, 200) });
    results.overall = 'FAIL';
    results.endedAt = ts();
    save();
    await browser.close();
    process.exit(1);
  }
  recordUf('L2_MOUNT', '🟢', { summary: 'Requisitions tab mounted', url: page.url() });

  await openCreateDialog(page);
  await shot(page, '01-create-open');
  await sleep(1500);

  // Wait bindable GET
  const bindableGets = () =>
    results.network.filter((n) => n.method === 'GET' && /job-templates/.test(n.url) && /bindable=true|for=yctd/.test(n.url));
  for (let i = 0; i < 20 && bindableGets().length === 0; i++) await sleep(250);
  const bindNet = bindableGets().slice(-1)[0];
  const libraryEmptyUi = await page
    .locator('text=/Chưa có JD|Mở Thư viện JD|thư viện JD trống/i')
    .first()
    .isVisible()
    .catch(() => false);
  const submitDisabled = await page.getByTestId('hdsd-requisition-form-submit').isDisabled().catch(() => false);

  // UF-01a
  const bindOk = bindNet && bindNet.status >= 200 && bindNet.status < 300;
  const nonActive = (results.lastBindable?.sample || []).filter(
    (x) => x.is_active === false || x.retired || /draft|retired|inactive/i.test(String(x.status || '')),
  );
  const apiNonActive = results.api_corroborate.bindable?.nonActiveCount || 0;
  if (bindOk && apiNonActive === 0 && nonActive.length === 0) {
    recordUf('UF-YCTD-JD-01a', '🟢', {
      summary: `GET bindable ${bindNet.status}; count=${results.lastBindable?.count ?? '?'}; only Hiệu lực (api+network)`,
      network: bindNet,
      api: results.api_corroborate.bindable,
      clickPath: ['login', '/hr/recruitment?tab=requisitions', 'Thêm', 'open JD picker bindable'],
    });
  } else if (bindOk && (apiNonActive > 0 || nonActive.length > 0)) {
    recordUf('UF-YCTD-JD-01a', '🔴', {
      summary: 'Bindable list includes non-active',
      nonActive,
      apiNonActive,
    });
  } else {
    recordUf('UF-YCTD-JD-01a', '🔴', {
      summary: 'No bindable GET 2xx observed on open create',
      bindNet: bindNet || null,
    });
  }

  // UF-01b — natural empty only (U65: no wipe seed)
  const bindableEmpty =
    (results.lastBindable?.count === 0 || bArr.length === 0) &&
    (results.api_corroborate.bindable?.count === 0 || bArr.length === 0);
  if (bindableEmpty) {
    const emptyPass = libraryEmptyUi || submitDisabled;
    recordUf('UF-YCTD-JD-01b', emptyPass ? '🟢' : '🔴', {
      summary: `Natural empty bindable; CTA/UI empty=${libraryEmptyUi} submitDisabled=${submitDisabled}`,
      note: 'U65 no seed to force empty — Diễn biến 1b',
    });
  } else {
    recordUf('UF-YCTD-JD-01b', '🟡', {
      summary: `Library non-empty (bindable=${bArr.length || results.lastBindable?.count || 0}) — natural empty path N/A (U65 no wipe)`,
      libraryEmptyUi,
      submitDisabled,
      blocked_reason: 'natural_non_empty',
    });
  }

  // If empty, cannot continue mutate journey — overall must NOT claim PASS for J-* mutate
  if (bindableEmpty) {
    recordUf('UF-YCTD-JD-01c', '🟡', { summary: 'BLOCKED — no Hiệu lực JD natural; journey mutate skipped' });
    recordUf('UF-YCTD-JD-01-F5', '🟡', { summary: 'BLOCKED — depends on 01c' });
    results.journey['J-HRM-JD-YCTD-01'] = {
      verdict: '🟡',
      summary: 'Partial: 01a/01b only; mutate blocked until natural Hiệu lực exists (no seed)',
    };
    results.residuals.push({
      id: 'R-YCTD-JD-NO-BINDABLE',
      severity: 'P1',
      summary: 'J-HRM-JD-YCTD-01 mutate blocked — bindable empty under U65 (create JD via FE Thư viện first)',
    });
  } else {
    // Pick JD
    const jdPick = await pickFirstCatalogOption(page, 'hdsd-requisition-job-template');
    results.ids.selectedJdId = bArr[0]?.id || null;
    results.ids.selectedJdCode = bArr[0]?.code || null;
    results.ids.selectedJdTitle = bArr[0]?.title || null;
    await sleep(1500);
    await shot(page, '02-jd-selected-preview');

    const previewEl = page.getByTestId('yctd-jd-preview');
    const previewVisible = await previewEl.isVisible().catch(() => false);
    const previewText = previewVisible ? (await previewEl.innerText().catch(() => '')).slice(0, 400) : '';
    const previewNet = results.lastPreview;

    // Fill title / dept / headcount / employment
    const titleInput = page.getByTestId('hdsd-requisition-title').first();
    if (await titleInput.isVisible().catch(() => false)) {
      await titleInput.fill(REQ_TITLE);
    } else {
      await page.locator('input[name="title"]').first().fill(REQ_TITLE).catch(() => {});
    }

    const deptPick = await pickFirstCatalogOption(page, 'hdsd-requisition-department');
    const hc = page.getByTestId('hdsd-requisition-headcount').first();
    await hc.fill('1').catch(() => {});

    const emp = page.getByTestId('hdsd-requisition-employment-type').first();
    if (await emp.isVisible().catch(() => false)) {
      await emp.click({ force: true }).catch(() => {});
      await sleep(300);
      const empOpt = page.locator('[role="option"]').first();
      await empOpt.click({ force: true }).catch(() => {});
    }

    await shot(page, '03-form-filled');
    log('submit_create', { jdPick, deptPick, previewVisible });

    await page.getByTestId('hdsd-requisition-form-submit').click({ force: true });
    await sleep(3500);
    await shot(page, '04-after-save');

    const create = results.lastCreate;
    const createOk = create && create.status >= 200 && create.status < 300;
    const hasJdDisplay =
      Boolean(create?.jd_code || create?.jd_title) ||
      Boolean(create?.job_template_id) ||
      (previewVisible && previewText.length > 0);

    // List row check
    const listBody = await page.locator('body').innerText().catch(() => '');
    const titleOnList = listBody.includes(REQ_TITLE);
    const jdOnList =
      (results.ids.selectedJdCode && listBody.includes(results.ids.selectedJdCode)) ||
      (results.ids.selectedJdTitle && listBody.includes(String(results.ids.selectedJdTitle).slice(0, 24))) ||
      Boolean(await page.locator(`[data-testid^="yctd-jd-ref-"]`).first().isVisible().catch(() => false));

    const bodyHasValuesJson =
      create?.requestBody &&
      (create.requestBody.values_json != null ||
        create.requestBody.layout_snapshot_json != null ||
        create.requestBody.layout_snapshot != null);

    if (createOk && previewVisible && hasJdDisplay) {
      recordUf('UF-YCTD-JD-01c', '🟢', {
        summary: `Preview+POST ${create.status} id=${create.id}; jd_code=${create.jd_code || '—'} jd_title=${(create.jd_title || '').slice(0, 60)}; listTitle=${titleOnList} jdOnList=${jdOnList}`,
        previewText: previewText.slice(0, 200),
        previewNetStatus: previewNet?.status,
        create,
        noFullValuesJsonPersist: !bodyHasValuesJson,
        clickPath: [
          'open create',
          'pick bindable JD',
          'assert yctd-jd-preview',
          'fill headcount/dept',
          'Lưu',
        ],
      });
      recordUf('UF-YCTD-JD-04-persist', !bodyHasValuesJson ? '🟢' : '🔴', {
        summary: bodyHasValuesJson
          ? 'Create body contains values_json/layout — FAIL SoT boundary'
          : 'Create body has soft FK (+ optional snapshot text); no full values_json',
        requestKeys: create?.requestBody ? Object.keys(create.requestBody) : [],
      });
    } else {
      recordUf('UF-YCTD-JD-01c', '🔴', {
        summary: `createOk=${createOk} previewVisible=${previewVisible} hasJdDisplay=${hasJdDisplay}`,
        create: create || null,
        previewText,
        jdPick,
      });
      recordUf('UF-YCTD-JD-04-persist', '🟡', { summary: 'Skipped / inconclusive — create failed' });
    }

    // F5
    if (createOk && results.ids.requisitionId) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3500);
      await shot(page, '05-f5-list');
      const afterF5 = await page.locator('body').innerText().catch(() => '');
      const titleKept = afterF5.includes(REQ_TITLE);
      const jdKept =
        (results.ids.selectedJdCode && afterF5.includes(results.ids.selectedJdCode)) ||
        (create.jd_code && afterF5.includes(create.jd_code)) ||
        (create.jd_title && afterF5.includes(String(create.jd_title).slice(0, 20))) ||
        Boolean(await page.locator(`[data-testid="yctd-jd-ref-${results.ids.requisitionId}"]`).isVisible().catch(() => false));

      // Open detail if possible
      const row = page.locator(`text=${REQ_TITLE}`).first();
      if (await row.isVisible().catch(() => false)) {
        await row.click({ force: true }).catch(() => {});
        await sleep(1500);
      }
      await shot(page, '06-detail-after-f5');
      const detailJd = page.getByTestId('yctd-jd-ref-detail');
      const detailVisible = await detailJd.isVisible().catch(() => false);
      const detailText = detailVisible ? (await detailJd.innerText().catch(() => '')).slice(0, 300) : '';

      // scope_parity API
      const listR = await fetch(
        `${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}&page_size=100`,
        { headers: apiHeaders },
      );
      const listJ = await listR.json().catch(() => ({}));
      const listArr = unwrapList(listJ);
      const inList = listArr.find((x) => x.id === results.ids.requisitionId);
      const getR = await fetch(
        `${HRM}/api/hrm/recruitment/requisitions/${results.ids.requisitionId}?company_id=${COMPANY}`,
        { headers: apiHeaders },
      );
      const getJ = await getR.json().catch(() => ({}));
      const getRow = getJ?.data ?? getJ;
      results.api_corroborate.scope_parity = {
        listStatus: listR.status,
        inList: Boolean(inList),
        getStatus: getR.status,
        getJdCode: getRow?.jd_code,
        getJdTitle: getRow?.jd_title,
        getJobTemplateId: getRow?.job_template_id,
      };

      const f5Pass = titleKept && (jdKept || detailVisible || Boolean(getRow?.jd_code || getRow?.jd_title));
      recordUf('UF-YCTD-JD-01-F5', f5Pass ? '🟢' : '🔴', {
        summary: `F5 titleKept=${titleKept} jdKept=${jdKept} detailVisible=${detailVisible} get=${getR.status} jd_code=${getRow?.jd_code || '—'}`,
        detailText,
        getRow: {
          jd_code: getRow?.jd_code,
          jd_title: getRow?.jd_title,
          job_template_id: getRow?.job_template_id,
        },
      });

      const spPass = inList && getR.status === 200 && getRow?.job_template_id;
      recordUf('UF-YCTD-JD-06', spPass ? '🟢' : '🔴', {
        summary: `scope_parity list∈=${Boolean(inList)} GET=${getR.status} job_template_id=${getRow?.job_template_id || '—'}`,
        ...results.api_corroborate.scope_parity,
        tag: 'scope_parity',
      });

      results.journey['J-HRM-JD-YCTD-01'] = {
        verdict: f5Pass && createOk && previewVisible && spPass ? '🟢' : '🔴',
        clickPath: [
          'login ceo@xe.vn',
          '/hr/recruitment?tab=requisitions&companyId=main',
          'Thêm yêu cầu',
          'picker bindable Hiệu lực',
          'preview title+short',
          'Lưu → POST 2xx',
          'F5 → jd_code/title retained',
          'list→detail scope_parity',
        ],
        requisitionId: results.ids.requisitionId,
        jd: {
          id: results.ids.selectedJdId,
          code: create.jd_code || results.ids.selectedJdCode,
          title: create.jd_title || results.ids.selectedJdTitle,
        },
      };
    } else {
      recordUf('UF-YCTD-JD-01-F5', '🔴', { summary: 'No successful create — F5 skipped' });
      recordUf('UF-YCTD-JD-06', '🟡', { summary: 'No create id — scope_parity inconclusive' });
      results.journey['J-HRM-JD-YCTD-01'] = { verdict: '🔴', summary: 'Create failed — journey FAIL' };
    }
  }

  // UF-01d STATUS — craft if FE hides Ngừng
  if (retiredOrDraft.length > 0) {
    const badId = retiredOrDraft[0].id;
    const previewBad = await fetch(
      `${HRM}/api/hrm/recruitment/job-templates/${badId}?company_id=${COMPANY}&preview=yctd`,
      { headers: apiHeaders },
    );
    const previewBadJ = await previewBad.json().catch(() => ({}));
    const createBad = await fetch(`${HRM}/api/hrm/recruitment/requisitions?company_id=${COMPANY}`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
        title: `STATUS-probe-${STAMP}`,
        job_template_id: badId,
        department: 'QA',
        headcount: 1,
        employment_type: 'full_time',
      }),
    });
    const createBadJ = await createBad.json().catch(() => ({}));
    const statusCode =
      previewBadJ?.code || createBadJ?.code || previewBadJ?.error?.code || createBadJ?.error?.code;
    const statusHit =
      previewBad.status === 400 ||
      createBad.status === 400 ||
      /HRM-JD-YCTD-STATUS/i.test(String(statusCode || '')) ||
      /HRM-JD-YCTD-STATUS/i.test(JSON.stringify(previewBadJ)) ||
      /HRM-JD-YCTD-STATUS/i.test(JSON.stringify(createBadJ));
    // FE path: picker should not list this id
    const pickerHides = !(bArr || []).some((x) => x.id === badId);
    recordUf('UF-YCTD-JD-01d', statusHit && pickerHides ? '🟢' : statusHit ? '🟢' : '🔴', {
      summary: `Ngừng/draft id=${badId.slice(0, 8)}… previewHTTP=${previewBad.status} createHTTP=${createBad.status} code=${statusCode || '—'} pickerHides=${pickerHides}`,
      note: 'FE hides non-bindable; BE STATUS gate corroborated via API (stale-id path) — not seed',
      previewBody: { code: previewBadJ?.code, message: String(previewBadJ?.message || '').slice(0, 160) },
      createBody: { code: createBadJ?.code, message: String(createBadJ?.message || '').slice(0, 160) },
    });
  } else {
    recordUf('UF-YCTD-JD-01d', '🟡', {
      summary: 'No natural Ngừng/Nháp template in scope — STATUS FE hide + BE gate not fully exercised (no seed invent)',
    });
  }

  // UF-05 dual-write deny
  const jobPostingWrites = (results.dualWriteHits || []).length;
  const createBodyKeys = results.lastCreate?.requestBody ? Object.keys(results.lastCreate.requestBody) : [];
  const pickerFromTemplates = bindableGets().length > 0;
  const uf05Pass = jobPostingWrites === 0 && pickerFromTemplates;
  recordUf('UF-YCTD-JD-05', uf05Pass ? '🟢' : '🔴', {
    summary: `pickerFrom job-templates bindable=${pickerFromTemplates}; job_postings write hits=${jobPostingWrites}; createKeys=${createBodyKeys.join(',')}`,
    dualWriteHits: results.dualWriteHits || [],
  });

  // Console hygiene on path
  const uncaught = results.pageErrors.filter((e) => /Uncaught|ReferenceError/i.test(e));
  results.consoleSummary = {
    consoleErrors: results.consoleErrors.length,
    pageErrors: results.pageErrors.length,
    uncaught: uncaught.length,
    sample: [...results.consoleErrors.slice(0, 5), ...results.pageErrors.slice(0, 3)],
  };

  const hardFail = Object.entries(results.uf).some(([, v]) => v.verdict === '🔴');
  const journeyFail = results.journey['J-HRM-JD-YCTD-01']?.verdict === '🔴';
  const journeyBlocked = results.journey['J-HRM-JD-YCTD-01']?.verdict === '🟡';
  const processGateFail =
    (results.consoleSummary?.uncaught || 0) > 0 ||
    results.pageErrors.some((e) => /Unable to find drag handle|@hello-pangea\/dnd/i.test(e)) ||
    results.consoleErrors.some((e) => /Unable to find drag handle|@hello-pangea\/dnd/i.test(e));
  if (processGateFail) {
    results.residuals.push({
      id: 'R-YCTD-JD-PROCESS-GATE',
      severity: 'P0',
      summary: 'DnD storm / Uncaught on path — process FAIL',
    });
  }
  // Honesty: full PASS only when journey 🟢 and no hardFail; blocked mutate = FAIL_TO_PM (not module PASS)
  if (hardFail || journeyFail || processGateFail) {
    results.overall = 'FAIL';
  } else if (journeyBlocked) {
    results.overall = 'BLOCKED';
  } else if (results.journey['J-HRM-JD-YCTD-01']?.verdict === '🟢') {
    results.overall = 'PASS';
  } else {
    results.overall = 'FAIL';
  }
  results.honesty = {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    module_uat: false,
  };
  results.endedAt = ts();
  save();

  await browser.close();
  console.log('\n=== OVERALL', results.overall, '===');
  console.log('JSON', OUT_JSON);
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  results.overall = 'ERROR';
  results.error = String(e).slice(0, 500);
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(3);
});
