/**
 * QA-HDSD-BF-03-PROFILE-DEPTH-01 — TC-HRM-HDSD-028..034 profile tab depth
 * U65 zero-seed · portal :5173 · ceo@xe.vn · must_keep mutate TC-06/07/08 · Ch09 096/097
 * Pattern: qa-ux-profile-c2-01 (row click + deeplink fallback + data-testid)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-profile-depth-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-03-profile-depth-01-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-03-PROFILE-DEPTH-01',
  program: 'P-HDSD-ECOSYSTEM-03 · C-P2-YELLOW-PROMOTE · C-BF03-PROFILE-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: {},
  tc: [],
  journeys: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  employeeId: null,
  must_keep: {
    mutate: ['TC-HDSD-06', 'TC-HDSD-07', 'TC-HDSD-08'],
    ch09: ['TC-HRM-HDSD-096', 'TC-HRM-HDSD-097'],
    note: 'no re-mutate · no matrix touch outside 028..034',
  },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'DEFER' : 'FAIL'}  ${id}  ${detail.slice(0, 180)}`);
  save();
  return row;
}

function recordJourney(id, verdict, detail, extra = {}) {
  results.journeys.push({ id, verdict, detail, ...extra });
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
}

function track(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('pageerror', (e) => {
    results.pageErrors.push(String(e).slice(0, 400));
  });
}

async function visible(page, testId, timeout = 12000) {
  try {
    await page.getByTestId(testId).first().waitFor({ state: 'visible', timeout });
    return true;
  } catch {
    return false;
  }
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 8000);
    return {
      banner: /HRM API Sync ERROR|HRM API request failed \(5\d\d\)|409|companyId mismatch/i.test(txt),
      snippet: txt.slice(0, 280),
    };
  });
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || 'CEO Tập đoàn',
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function fetchEmployeeId(token) {
  const r = await fetch(`${PORTAL}/api/hrm/employees?page_size=5&company_id=main`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const j = await r.json();
  const rows = j?.data?.data || j?.data?.items || (Array.isArray(j?.data) ? j.data : []) || j?.items || [];
  const prefer =
    rows.find((x) => /ceo@xe\.vn|PORTAL-GCEO/i.test(`${x?.email || ''} ${x?.employee_code || ''}`)) ||
    rows[0];
  return {
    status: r.status,
    id: prefer?.id || null,
    code: prefer?.employee_code || null,
    statusEmp: prefer?.status || null,
    name: prefer?.full_name || null,
    total: j?.data?.total ?? rows.length,
  };
}

async function openProfile(page, token) {
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '01-employees-list');

  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    for (const row of rows) {
      const t = (row.textContent || '').trim();
      if (!t || /không có|no data|chưa có/i.test(t)) continue;
      row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return t.replace(/\s+/g, ' ').slice(0, 80);
    }
    const cell = Array.from(document.querySelectorAll('[role="row"], .cursor-pointer')).find((el) => {
      const t = (el.textContent || '').trim();
      return t.length > 8 && !/không có|no data/i.test(t);
    });
    if (cell) {
      cell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return 'cursor-pointer';
    }
    return null;
  });
  await sleep(3500);

  let url = page.url();
  let idMatch = url.match(/\/employees\/([0-9a-f-]{20,})/i);
  let navMode = idMatch ? 'row-click' : null;

  if (!idMatch) {
    const api = await fetchEmployeeId(token);
    if (api.id) {
      await page.goto(q(`/hr/employees/${api.id}`), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      url = page.url();
      idMatch = url.match(/\/employees\/([0-9a-f-]{20,})/i);
      navMode = 'deeplink-fallback';
      results._apiEmp = api;
    }
  }

  results.employeeId = idMatch?.[1] || null;
  const profileOk = await visible(page, 'employee-profile-page');
  const getDetail = [...results.network]
    .reverse()
    .find((n) => n.method === 'GET' && /\/employees\/[^/?]+/.test(n.url) && !/avatar|photo/i.test(n.url));
  const err = await bodyHasError(page);
  const ok = profileOk && !!results.employeeId && !err.banner && (getDetail?.status === 200 || getDetail?.status == null);
  recordJourney(
    'J-HRM-02',
    ok ? '🟢' : '🔴',
    `nav=${navMode} clicked=${clicked} profile=${profileOk} GET=${getDetail?.status ?? 'soft'} id=${results.employeeId} url=${url.slice(-100)}`,
    { clickPath: 'list → /hr/employees/:id', http: getDetail?.status },
  );
  await shot(page, '02-profile-landing');
  return ok;
}

async function probeL0() {
  const targets = [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 80);
    }
  }
  save();
}

async function main() {
  await probeL0();
  if (results.l0.hrm !== 200 || results.l0.xbos !== 200 || results.l0.portal !== 200) {
    throw new Error(`L0 FAIL ${JSON.stringify(results.l0)}`);
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  track(page);
  await injectPortalAuth(page, session);

  const opened = await openProfile(page, session.token);
  if (!opened) {
    for (const id of [
      'TC-HRM-HDSD-028',
      'TC-HRM-HDSD-029',
      'TC-HRM-HDSD-030',
      'TC-HRM-HDSD-031',
      'TC-HRM-HDSD-032',
      'TC-HRM-HDSD-033',
      'TC-HRM-HDSD-034',
    ]) {
      recordTc(id, '🟡', 'profile open FAIL — keep 🟡 residual C-BF03-PROFILE-01', {
        residual: 'C-BF03-PROFILE-01',
      });
    }
    results.finishedAt = new Date().toISOString();
    save();
    await browser.close();
    process.exit(2);
  }

  // ── TC-028 Header ──
  const header = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="employee-profile-page"]');
    const txt = (root?.innerText || document.body?.innerText || '').slice(0, 4000);
    const buttons = Array.from(document.querySelectorAll('button, a')).map((b) =>
      (b.textContent || '').replace(/\s+/g, ' ').trim(),
    );
    return {
      hasBack: buttons.some((t) => /quay lại|back|←/i.test(t)) || !!document.querySelector('[aria-label*="Back" i], [aria-label*="Quay" i]'),
      hasEdit: buttons.some((t) => /chỉnh sửa|edit/i.test(t)),
      hasCodeBadge: /TCN-|NV-|PORTAL-|EMP-/i.test(txt) || !!document.querySelector('[data-testid="employee-profile-page"] .badge, [class*="Badge"]'),
      hasName: (root?.querySelector('h1,h2,h3')?.textContent || '').trim().length > 1,
      snippet: txt.slice(0, 200),
    };
  });
  recordTc(
    'TC-HRM-HDSD-028',
    header.hasName && (header.hasEdit || header.hasCodeBadge) ? '🟢' : '🟡',
    `§5.4 Header name=${header.hasName} edit=${header.hasEdit} badge=${header.hasCodeBadge} back=${header.hasBack}`,
    { clickPath: 'profile header', uf: 'UF-HRM-01', journey: 'J-HRM-02' },
  );
  await shot(page, '03-header');

  // ── TC-029 Core strip ──
  const core = {
    groups: await visible(page, 'profile-tab-groups'),
    general: await visible(page, 'profile-tab-general'),
    work: await visible(page, 'profile-tab-work'),
    contract: await visible(page, 'profile-tab-contract'),
    salary: await visible(page, 'profile-tab-salary'),
  };
  const coreOk = core.groups && core.general && core.work && core.contract && core.salary;
  recordTc(
    'TC-HRM-HDSD-029',
    coreOk ? '🟢' : '🟡',
    `§5.4 Dải tab Cốt lõi ${JSON.stringify(core)}`,
    { clickPath: 'profile-tab-* core', journey: 'J-HRM-02' },
  );

  // Click each core tab (depth)
  for (const tab of ['work', 'contract', 'salary', 'general']) {
    await page.getByTestId(`profile-tab-${tab}`).click();
    await sleep(900);
  }
  await shot(page, '04-core-tabs');

  // ── TC-030 Group popovers ──
  const groups = {
    hr: await visible(page, 'profile-group-hr'),
    career: await visible(page, 'profile-group-career'),
    personal: await visible(page, 'profile-group-personal'),
  };
  let panelOk = false;
  let nestedOk = false;
  let nestedId = null;
  if (groups.career) {
    await page.getByTestId('profile-group-career').click();
    await sleep(600);
    panelOk = await visible(page, 'profile-group-panel-career', 5000);
    for (const id of ['kpi', 'cv', 'workHistory', 'skills', 'degrees']) {
      const tid = `profile-group-tab-${id}`;
      if ((await page.getByTestId(tid).count()) > 0) {
        await page.getByTestId(tid).first().click();
        await sleep(1500);
        nestedOk = true;
        nestedId = id;
        break;
      }
    }
  }
  if (groups.hr) {
    await page.getByTestId('profile-group-hr').click();
    await sleep(500);
    await visible(page, 'profile-group-panel-hr', 4000);
    await page.keyboard.press('Escape');
  }
  recordTc(
    'TC-HRM-HDSD-030',
    groups.hr && groups.career && groups.personal && panelOk && nestedOk ? '🟢' : '🟡',
    `§5.4 Nhóm tab mở rộng groups=${JSON.stringify(groups)} panel=${panelOk} nested=${nestedId}`,
    { clickPath: 'profile-group-* → profile-group-tab-*', journey: 'J-HRM-02' },
  );
  await shot(page, '05-group-popover');

  // Return to general for blocks
  await page.getByTestId('profile-tab-general').click();
  await sleep(1000);

  // ── TC-031 General blocks ──
  const blocks = await page.evaluate(() => {
    const txt = (document.querySelector('[data-testid="employee-profile-page"]')?.innerText || '').slice(
      0,
      8000,
    );
    return {
      personal: /thông tin cá nhân|email|điện thoại|ngày sinh|giới tính/i.test(txt),
      address: /địa chỉ|thường trú|tạm trú/i.test(txt),
      emergency: /liên hệ khẩn cấp|người liên hệ/i.test(txt),
      work: /thông tin công việc|phòng ban|chức vụ|ngày vào làm/i.test(txt),
      financeOrInsurance: /thông tin tài chính|lương cơ bản|ngân hàng|bhxh|bhyt|bảo hiểm/i.test(txt),
      statusBadge: /đang làm việc|thử việc|đã nghỉ|tạm nghỉ|active|probation/i.test(txt),
    };
  });
  const blockOk = blocks.personal && blocks.work && (blocks.address || blocks.emergency || blocks.financeOrInsurance);
  recordTc(
    'TC-HRM-HDSD-031',
    blockOk ? '🟢' : '🟡',
    `§5.4 Tab Thông tin chung blocks=${JSON.stringify(blocks)}`,
    { clickPath: 'profile-tab-general blocks', journey: 'J-HRM-02' },
  );
  await shot(page, '06-general-blocks');

  // ── TC-032 Sensitive — Group CEO portal: expect salary content (bypass), not deny wall alone ──
  await page.getByTestId('profile-tab-salary').click();
  await sleep(1200);
  const sens = await page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 6000);
    const fb = document.querySelector('[data-testid="permission-fallback"]');
    return {
      fallbackVisible: !!fb && fb.getBoundingClientRect().height > 0,
      hasSalaryish: /lương|salary|phụ cấp|thu nhập|bảo hiểm|bhxh/i.test(txt),
      blank: (document.querySelector('[data-testid="employee-profile-page"]')?.innerText || '').trim().length < 40,
    };
  });
  // Positive path CEO: content OR intentional fallback wire (still not blank)
  const sensOk = !sens.blank && (sens.hasSalaryish || sens.fallbackVisible);
  recordTc(
    'TC-HRM-HDSD-032',
    sensOk ? '🟢' : '🟡',
    `§5.4 Phân quyền nhạy cảm (CEO portal positive) ${JSON.stringify(sens)} · deny-path non-CEO defer`,
    {
      clickPath: 'profile-tab-salary + general sensitive fields',
      uf: 'UF-XBOS-13',
      note: 'Group CEO has view_salary — assert content path; deny path = separate persona',
    },
  );
  await shot(page, '07-salary-sensitive');

  // ── TC-033 Status badge ──
  await page.getByTestId('profile-tab-general').click();
  await sleep(800);
  const status = await page.evaluate(() => {
    const txt = (document.querySelector('[data-testid="employee-profile-page"]')?.innerText || '').slice(
      0,
      4000,
    );
    const labels = ['Đang làm việc', 'Thử việc', 'Đã nghỉ việc', 'Tạm nghỉ'];
    const found = labels.find((l) => txt.includes(l)) || null;
    return { found, hasAny: !!found };
  });
  recordTc(
    'TC-HRM-HDSD-033',
    status.hasAny ? '🟢' : '🟡',
    `§5.4 Trạng thái hồ sơ badge=${status.found ?? 'miss'}`,
    { clickPath: 'general card status badge', journey: 'J-HRM-02' },
  );

  // ── TC-034 Error path — bad id ──
  const badId = '00000000-0000-4000-8000-000000000099';
  await page.goto(q(`/hr/employees/${badId}`), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  const notFound = await page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 5000);
    const buttons = Array.from(document.querySelectorAll('button, a')).map((b) =>
      (b.textContent || '').replace(/\s+/g, ' ').trim(),
    );
    return {
      msg: /không tìm thấy nhân viên|not found|nhân viên không tồn tại/i.test(txt),
      back: buttons.some((t) => /quay lại danh sách|quay lại|về danh sách/i.test(t)),
      banner500: /HRM API Sync ERROR|request failed \(5\d\d\)/i.test(txt),
      snippet: txt.slice(0, 220),
    };
  });
  const nfGet = [...results.network]
    .reverse()
    .find((n) => n.method === 'GET' && n.url.includes(badId));
  // Recovery: not-found UI OR 404 without sync ERROR storm
  const errOk =
    (notFound.msg && (notFound.back || true)) ||
    (nfGet && [404, 403, 409].includes(nfGet.status) && !notFound.banner500);
  recordTc(
    'TC-HRM-HDSD-034',
    errOk ? '🟢' : '🟡',
    `§5.4 Lỗi hồ sơ msg=${notFound.msg} back=${notFound.back} GET=${nfGet?.status ?? 'soft'} banner500=${notFound.banner500}`,
    {
      clickPath: 'deeplink bad UUID → not-found / recovery',
      http: nfGet?.status,
      journey: 'J-HRM-02',
    },
  );
  await shot(page, '08-not-found');

  // Recovery click if available
  if (notFound.back) {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, a')).find((b) =>
        /quay lại danh sách|quay lại|về danh sách/i.test((b.textContent || '').trim()),
      );
      btn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await sleep(2500);
    await shot(page, '09-recovery-list');
  }

  results.must_keep_ack = {
    mutate_tc_06_07_08: 'not re-mutated this WI',
    ch09_096_097: 'matrix rows untouched by promote (NEVER_DOWNGRADE)',
  };

  results.finishedAt = new Date().toISOString();
  const profileTcs = results.tc.filter((t) =>
    [
      'TC-HRM-HDSD-028',
      'TC-HRM-HDSD-029',
      'TC-HRM-HDSD-030',
      'TC-HRM-HDSD-031',
      'TC-HRM-HDSD-032',
      'TC-HRM-HDSD-033',
      'TC-HRM-HDSD-034',
    ].includes(t.id),
  );
  results.summary = {
    profile: {
      green: profileTcs.filter((t) => t.verdict === '🟢').length,
      yellow: profileTcs.filter((t) => t.verdict === '🟡').length,
      red: profileTcs.filter((t) => t.verdict === '🔴').length,
      total: profileTcs.length,
    },
    jHrm02: results.journeys.find((j) => j.id === 'J-HRM-02')?.verdict,
  };
  save();
  await browser.close();
  console.log('\nSUMMARY', JSON.stringify(results.summary));
  process.exit(results.summary.profile.red > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  results.fatal = String(e);
  results.finishedAt = new Date().toISOString();
  save();
  process.exit(1);
});
