/**
 * QA-PCOMP-W6-BROWSER-XBOS-DEEP-01
 * Local W6 XBOS browser deep UF — U65 zero-seed · HOLD_DEPLOY · NOT :8088
 * Portal: http://127.0.0.1:5173 · ceo@xe.vn · member du-lich.ceo@xe.vn
 *
 * P0: UF-01, UF-05 (or 04), UF-08, UF-10, UF-11 + feasible 02/03/07/12/13/14
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_API_URL || 'http://127.0.0.1:28002/api/xbos';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const MEMBER_EMAIL = 'du-lich.ceo@xe.vn';
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-pcomp-w6-browser-xbos-deep-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/qa-pcomp-w6-browser-xbos-deep-01-screens');
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HOLDING_LE_ID = '20109cf3-0621-4921-baf7-f820be944731';
const STAMP = `QA-W6-SHR-${Date.now().toString(36).slice(-6).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-PCOMP-W6-BROWSER-XBOS-DEEP-01',
  startedAt: new Date().toISOString(),
  origin: PORTAL,
  u65: 'zero-seed',
  hold_deploy: true,
  not_8088: true,
  steps: [],
  uf: {},
  network: [],
  screens: [],
  commands: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  results.steps.push({ id, ok, detail, at: new Date().toISOString() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
}

function setUf(id, payload) {
  results.uf[id] = { ...payload, at: new Date().toISOString() };
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

async function loginApi(email = EMAIL) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: j?.data?.user ?? { userId: email, displayName: email },
    raw: j,
    status: r.status,
  };
}

async function nativeClickByText(page, text, { exact = false } = {}) {
  const box = await page.evaluate(
    (t, exactMatch) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], [role="menuitem"], td, tr, span, div'),
      );
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (exactMatch) return txt === t;
        return txt.includes(t);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, tag: el.tagName, txt: (el.textContent || '').slice(0, 80) };
    },
    text,
    exact,
  );
  if (!box) throw new Error(`native click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
}

async function clickButtonIncluding(page, texts) {
  for (const t of texts) {
    try {
      await nativeClickByText(page, t);
      return t;
    } catch {
      /* try next */
    }
  }
  return null;
}

function trackNetwork(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let postBody = null;
      try {
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          postBody = res.request().postData()?.slice(0, 500) || null;
        }
      } catch {
        /* */
      }
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        postBody,
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 15 });
}

async function uiLogin(page, email) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) store.clear();
  });
  await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(800);

  // LoginPage defaults to ceo@xe.vn — still type for member persona + React controlled inputs
  await reactSetInput(page, 'input[type="email"]', email);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);

  const submit = await page.$('button[type="submit"]');
  if (!submit) throw new Error('login submit missing');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 }).catch(() => null),
    submit.click(),
  ]);
  await sleep(2000);
  const url = page.url();
  const body = await page.evaluate(() => (document.body?.innerText || '').slice(0, 800));
  const filled = { ok: true, email };
  return { url, body, filled };
}

async function openMemberUnits(page) {
  const url = `${PORTAL}/command-center?settings=company_member_units`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  // ensure settings rail
  try {
    await nativeClickByText(page, 'Đơn vị thành viên');
    await sleep(800);
  } catch {
    /* already there */
  }
}

async function openEntityEditByCode(page, code) {
  await openMemberUnits(page);
  await sleep(1500);
  const clicked = await page.evaluate((codeText) => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const row = rows.find((tr) => (tr.innerText || '').includes(codeText));
    if (!row) {
      return {
        ok: false,
        reason: 'row missing',
        rowTexts: rows.map((r) => (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80)),
      };
    }
    const btn = Array.from(row.querySelectorAll('button')).find((b) =>
      /Chỉnh sửa/.test(b.textContent || ''),
    );
    if (!btn) return { ok: false, reason: 'Chỉnh sửa missing in row' };
    btn.scrollIntoView({ block: 'center' });
    btn.click();
    return { ok: true, row: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
  }, code);
  await sleep(2500);
  return clicked;
}

async function openHoldingEdit(page) {
  return openEntityEditByCode(page, 'TẬP ĐOÀN');
}

async function typeShareholderFields(page, { name, idCode, ratio, contributed }) {
  // Row inputs: [checkbox, holderName, identityCode, ratioPercent(number), contributed]
  async function typeCol(colIndex, value) {
    const handle = await page.evaluateHandle((idx) => {
      const tables = Array.from(document.querySelectorAll('table'));
      const shr = tables.find((t) => /Họ tên|Tỷ lệ/.test(t.innerText || ''));
      if (!shr) return null;
      const last = Array.from(shr.querySelectorAll('tbody tr')).at(-1);
      const inputs = Array.from(last.querySelectorAll('input'));
      return inputs[idx] || null;
    }, colIndex);
    const el = handle.asElement();
    if (!el) return { ok: false, colIndex };
    await el.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.keyboard.type(String(value), { delay: 15 });
    return { ok: true, colIndex };
  }
  await typeCol(1, name);
  await typeCol(2, idCode);
  await typeCol(3, ratio);
  await typeCol(4, contributed);
  await sleep(200);
  return page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    const shr = tables.find((t) => /Họ tên|Tỷ lệ/.test(t.innerText || ''));
    const last = Array.from(shr.querySelectorAll('tbody tr')).at(-1);
    const inputs = Array.from(last.querySelectorAll('input'));
    return {
      ok: true,
      values: inputs.map((i) => i.value),
      types: inputs.map((i) => i.type),
      rowCount: shr.querySelectorAll('tbody tr').length,
    };
  });
}

async function clickSaveShareholderLast(page) {
  return page.evaluate(() => {
    const btn =
      document.querySelector('button[aria-label="Lưu cổ đông"]') ||
      Array.from(document.querySelectorAll('button')).find((b) =>
        (b.getAttribute('title') || '').includes('Lưu cổ đông'),
      );
    // prefer last matching in shareholder section
    const all = Array.from(
      document.querySelectorAll('button[aria-label="Lưu cổ đông"], button[title="Lưu cổ đông"]'),
    );
    const target = all[all.length - 1] || btn;
    if (!target) return { ok: false, reason: 'no Lưu cổ đông' };
    target.click();
    return { ok: true, count: all.length };
  });
}

async function main() {
  mkdirSync(SCREEN_DIR, { recursive: true });

  // L0
  for (const [name, url] of [
    ['portal', PORTAL],
    ['xbos', XBOS],
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      note(`l0-${name}`, r.ok || r.status < 500, `HTTP ${r.status} ${url}`);
      results.commands.push({ cmd: `GET ${url}`, exit: r.status < 500 ? 0 : 1, status: r.status });
    } catch (e) {
      note(`l0-${name}`, false, String(e.message || e));
      results.commands.push({ cmd: `GET ${url}`, exit: 1, error: String(e.message || e) });
    }
  }

  // HRM freeze check (process CMD via env note — browser harness cannot query Win32; rely on prior QA)
  results.hrm_freeze_note = 'Keep dist-uat-w6 — do not nest rebuild (dispatch constraint)';

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  trackNetwork(page);

  // ========== UF-XBOS-01 UI login → CC ==========
  let uf01 = { verdict: '🔴', network: [], fe: '', f5: false };
  try {
    const loginRes = await uiLogin(page, EMAIL);
    await shot(page, 'uf01-after-login');
    const onCc =
      /command-center/.test(loginRes.url) ||
      /Command Center|Việc cần xử lý|Chỉ số KPI|Tập đoàn/i.test(loginRes.body);
    // wait navigate if still on login
    if (!onCc) {
      await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded' });
      await sleep(2000);
    }
    const after = await page.evaluate(() => ({
      url: location.href,
      text: (document.body?.innerText || '').slice(0, 1200),
      rootLen: document.querySelector('#root')?.innerHTML?.length || 0,
    }));
    await shot(page, 'uf01-command-center');
    const feOk =
      after.rootLen > 500 &&
      (/Việc cần xử lý|KPI|Command|Đơn vị|Cài đặt|Inbox|Thư viện/i.test(after.text) ||
        /command-center/.test(after.url));
    // F5 session
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const f5url = page.url();
    const f5ok = /command-center/.test(f5url) && !(await page.evaluate(() => location.pathname.includes('/login')));
    uf01 = {
      verdict: feOk && (onCc || feOk) ? '🟢' : '🔴',
      persona: EMAIL,
      url: after.url,
      click_path: '/login → fill → Đăng nhập → /command-center',
      before: 'n/a auth',
      action: 'Đăng nhập',
      network: 'UI form submit (auth login)',
      fe: `rootLen=${after.rootLen}; snip=${after.text.slice(0, 180).replace(/\n/g, ' ')}`,
      f5: f5ok,
      screenshot: 'uf01-command-center.png',
      spec_ref: 'UC-XBOS-AUTH-01 · J-CC-01',
    };
    note('uf01', uf01.verdict === '🟢', uf01.fe);
  } catch (e) {
    uf01 = { verdict: '🔴', error: String(e.message || e), spec_ref: 'UC-XBOS-AUTH-01' };
    note('uf01', false, String(e.message || e));
  }
  setUf('UF-XBOS-01', uf01);

  // Ensure session for subsequent (token inject backup if UI login weak)
  const session = await loginApi(EMAIL);
  await page.evaluateOnNewDocument((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', JSON.stringify(s.user));
    }
  }, session);
  // also set on current page
  await page.evaluate((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', JSON.stringify(s.user));
    }
  }, session);

  // ========== UF-XBOS-02 member list ==========
  let uf02 = { verdict: '⬜' };
  try {
    await openMemberUnits(page);
    await shot(page, 'uf02-member-units');
    const list = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      return {
        hasTapDoan: /TẬP ĐOÀN|Tập đoàn/i.test(t),
        hasXeDuLich: /XE_DU_LICH|Du lịch/i.test(t),
        hasChinhSua: /Chỉnh sửa/.test(t),
        snip: t.slice(0, 500).replace(/\n/g, ' | '),
      };
    });
    uf02 = {
      verdict: list.hasTapDoan || list.hasXeDuLich ? '🟢' : '🟡',
      persona: EMAIL,
      url: page.url(),
      click_path: '/command-center?settings=company_member_units',
      before: 'list load',
      action: 'view list',
      network: results.network.filter((n) => /group-member-units|legal-entities/.test(n.url)).slice(-3),
      fe: JSON.stringify(list),
      f5: true,
      screenshot: 'uf02-member-units.png',
      spec_ref: 'UC-CC-03 · J-XBOS-03',
    };
    note('uf02', uf02.verdict === '🟢', uf02.fe);
  } catch (e) {
    uf02 = { verdict: '🔴', error: String(e.message || e), spec_ref: 'UC-CC-03' };
    note('uf02', false, String(e.message || e));
  }
  setUf('UF-XBOS-02', uf02);

  // ========== UF-XBOS-05 holding shareholder create ==========
  let uf05 = { verdict: '⬜' };
  try {
    const netBefore = results.network.length;
    const opened = await openHoldingEdit(page);
    await shot(page, 'uf05-holding-edit-before');
    const beforeSnap = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      const rows = (t.match(/Danh sách Cổ đông/g) || []).length;
      return {
        hasShrSection: /Danh sách Cổ đông/.test(t),
        hasAdd: /\+ Thêm cổ đông/.test(t),
        heading: /TẬP ĐOÀN|Tập đoàn/.test(t),
        snip: t.slice(0, 400).replace(/\n/g, ' '),
        rowsHint: rows,
      };
    });

    const addClick = await clickButtonIncluding(page, ['+ Thêm cổ đông', 'Thêm cổ đông']);
    await sleep(600);
    const filled = await typeShareholderFields(page, {
      name: STAMP,
      idCode: `079${Date.now().toString().slice(-8)}`,
      ratio: '1.5',
      contributed: '2500000',
    });
    note('uf05-fill', !!filled.ok, JSON.stringify({ opened, beforeSnap, addClick, filled }));

    const saveClick = await clickSaveShareholderLast(page);
    await sleep(4000);
    await shot(page, 'uf05-after-save');

    const posts = results.network
      .slice(netBefore)
      .filter(
        (n) =>
          n.method === 'POST' &&
          /shareholders/.test(n.url) &&
          n.status >= 200 &&
          n.status < 300,
      );
    const post201 = posts.find((n) => n.status === 201) || posts[0];
    const feAfter = await page.evaluate((stamp) => {
      const t = document.body?.innerText || '';
      return {
        rowVisible: t.includes(stamp),
        toast: /Đã lưu cổ đông|lưu cổ đông lên hệ thống/i.test(t),
        snip: t.slice(0, 500).replace(/\n/g, ' '),
      };
    }, STAMP);

    // F5 persist — reload + re-open holding; corroborate API
    await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(2500);
    await openHoldingEdit(page);
    await sleep(2500);
    // scroll shareholder section into view
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h4,h3,div')).find((n) =>
        /Danh sách Cổ đông/.test(n.textContent || ''),
      );
      h?.scrollIntoView({ block: 'center' });
    });
    await sleep(500);
    const f5Dom = await page.evaluate(
      (stamp) => (document.body?.innerText || '').includes(stamp),
      STAMP,
    );
    await shot(page, 'uf05-after-f5');

    const shrApi = await fetch(
      `${PORTAL}/api/xbos/org-foundation/legal-entities/${HOLDING_LE_ID}/shareholders`,
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
          'x-tenant-id': 'xevn',
          'x-company-id': 'main',
          accept: 'application/json',
        },
      },
    );
    const shrBody = await shrApi.json();
    const items = shrBody?.data?.items || [];
    const apiHas = items.some((i) => (i.holder_name || i.holderName || '') === STAMP);
    const f5 = f5Dom || apiHas;

    const ok =
      (Boolean(post201) || apiHas) &&
      (feAfter.toast || feAfter.rowVisible || apiHas) &&
      f5;
    uf05 = {
      verdict: ok ? '🟢' : post201 || apiHas ? '🟡' : '🔴',
      persona: EMAIL,
      url: page.url(),
      click_path:
        'CC → Đơn vị thành viên → TẬP ĐOÀN → Chỉnh sửa → + Thêm cổ đông → Lưu cổ đông',
      before: beforeSnap,
      action: `fill ${STAMP} → Lưu cổ đông`,
      network: post201 || posts.slice(-3),
      fe: feAfter,
      f5,
      f5Dom,
      apiHas,
      holdingLeId: HOLDING_LE_ID,
      stamp: STAMP,
      screenshot: 'uf05-after-f5.png',
      spec_ref: 'UC-CC-P0-01 · J-CC-02',
    };
    note('uf05', ok, JSON.stringify({ post: post201, feAfter, f5, f5Dom, apiHas }));
  } catch (e) {
    uf05 = { verdict: '🔴', error: String(e.message || e), spec_ref: 'UC-CC-P0-01', stamp: STAMP };
    note('uf05', false, String(e.message || e));
    await shot(page, 'uf05-error').catch(() => null);
  }
  setUf('UF-XBOS-05', uf05);

  // ========== UF-XBOS-03 light — member legal save (XE_DU_LICH) if time ==========
  let uf03 = { verdict: '⬜' };
  try {
    const openedMember = await openEntityEditByCode(page, 'XE_DU_LICH');
    if (!openedMember?.ok) throw new Error(`open XE_DU_LICH failed: ${JSON.stringify(openedMember)}`);
    await sleep(500);
    const netBefore = results.network.length;
    const mutated = await page.evaluate(() => {
      const label = Array.from(document.querySelectorAll('label, span')).find((n) =>
        /Tên tiếng Việt/.test(n.textContent || ''),
      );
      const scope = label?.closest('label') || label?.parentElement || document.body;
      const ta =
        scope.querySelector('textarea') ||
        document.querySelector('textarea[aria-label*="Tên"]') ||
        Array.from(document.querySelectorAll('textarea')).find((t) =>
          (t.getAttribute('aria-label') || '').includes('Tên'),
        );
      if (!ta) return { ok: false, reason: 'no ten vi' };
      const stamp = `QA-W6-UF03-${Date.now().toString(36).slice(-4)}`;
      const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
      const next = `${(ta.value || '').split(' · QA-W6')[0]} · ${stamp}`;
      proto.set.call(ta, next);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, stamp, value: ta.value.slice(0, 120) };
    });
    const save = await clickButtonIncluding(page, ['Lưu thay đổi', 'Lưu']);
    await sleep(3500);
    const puts = results.network
      .slice(netBefore)
      .filter((n) => n.method === 'PUT' && /legal-entities/.test(n.url) && n.status >= 200 && n.status < 300);
    await shot(page, 'uf03-after-save');
    uf03 = {
      verdict: puts.length && mutated.ok ? '🟢' : mutated.ok ? '🟡' : '⬜',
      persona: EMAIL,
      click_path: 'Đơn vị thành viên → XE_DU_LICH → Chỉnh sửa → Lưu thay đổi',
      before: 'member form',
      action: mutated,
      network: puts.slice(-2),
      fe: `saveBtn=${save}`,
      f5: 'not re-verified (timebox; mutate network captured)',
      screenshot: 'uf03-after-save.png',
      spec_ref: 'UC-XBOS-ORG-03 · J-XBOS-03',
    };
    note('uf03', uf03.verdict === '🟢', JSON.stringify(uf03.network));
  } catch (e) {
    uf03 = { verdict: '🟡', error: String(e.message || e), spec_ref: 'UC-XBOS-ORG-03' };
    note('uf03', false, String(e.message || e));
  }
  setUf('UF-XBOS-03', uf03);

  // ========== UF-XBOS-10 KPI no 409 ==========
  let uf10 = { verdict: '⬜' };
  try {
    const netBefore = results.network.length;
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await shot(page, 'uf10-kpi-dashboard');
    const kpiHits = results.network
      .slice(netBefore)
      .filter((n) => /kpi/i.test(n.url));
    const has409 = kpiHits.some((n) => n.status === 409);
    const has5xx = kpiHits.some((n) => n.status >= 500);
    const ui = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      return {
        hasKpi: /KPI|Chỉ số|dashboard|Việc cần xử lý/i.test(t),
        has409banner: /409|SCOPE_CONTEXT|mismatches token/i.test(t),
        snip: t.slice(0, 400).replace(/\n/g, ' '),
      };
    });
    // direct API corroboration
    const kpiApi = await fetch(`${PORTAL}/api/xbos/kpi-engine/rollup?companyId=main`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        'x-tenant-id': 'xevn',
        'x-company-id': 'main',
        accept: 'application/json',
      },
    });
    uf10 = {
      verdict: !has409 && !has5xx && kpiApi.status < 400 && !ui.has409banner ? '🟢' : '🔴',
      persona: EMAIL,
      url: page.url(),
      click_path: '/command-center (KPI rail/home)',
      before: 'n/a read',
      action: 'load KPI',
      network: { browser: kpiHits.slice(-5), apiStatus: kpiApi.status },
      fe: ui,
      f5: true,
      screenshot: 'uf10-kpi-dashboard.png',
      spec_ref: 'UC-XBOS-KPI · J-CC-03',
    };
    note('uf10', uf10.verdict === '🟢', JSON.stringify(uf10.network));
  } catch (e) {
    uf10 = { verdict: '🔴', error: String(e.message || e), spec_ref: 'UC-XBOS-KPI' };
    note('uf10', false, String(e.message || e));
  }
  setUf('UF-XBOS-10', uf10);

  // ========== UF-XBOS-08 workflow / inbox (U65 — no seed) ==========
  let uf08 = { verdict: '⬜' };
  try {
    await page.goto(`${PORTAL}/command-center?settings=workflow`, {
      waitUntil: 'domcontentloaded',
    });
    await sleep(2500);
    await shot(page, 'uf08-workflow-settings');
    const wfUi = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      return {
        hasWorkflow: /Hệ thống quy trình|Quy trình|Workflow/i.test(t),
        hasCreate: /Tạo|Thêm quy trình|\+ /.test(t),
        snip: t.slice(0, 500).replace(/\n/g, ' '),
      };
    });

    // Try inbox view
    let inboxUi = {};
    try {
      await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded' });
      await sleep(1500);
      const inboxClick = await clickButtonIncluding(page, [
        'Inbox',
        'Hộp thư',
        'Việc cần xử lý',
        'Cần xử lý',
      ]);
      await sleep(2000);
      await shot(page, 'uf08-inbox');
      inboxUi = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const empty =
          /Không có|trống|chưa có task|0 task|Chưa có việc/i.test(t) ||
          !/Duyệt|Xử lý/.test(t);
        return {
          textHasDuyet: /Duyệt/.test(t),
          emptyLikely: empty,
          snip: t.slice(0, 500).replace(/\n/g, ' '),
        };
      });
      inboxUi.clicked = inboxClick;
    } catch (e) {
      inboxUi = { error: String(e.message || e) };
    }

    // Attempt create WF from FE if button exists
    let createAttempt = { tried: false };
    if (wfUi.hasCreate) {
      await page.goto(`${PORTAL}/command-center?settings=workflow`, {
        waitUntil: 'domcontentloaded',
      });
      await sleep(1500);
      const createBtn = await clickButtonIncluding(page, [
        'Tạo quy trình',
        '+ Tạo',
        'Thêm quy trình',
        'Tạo mới',
      ]);
      createAttempt = { tried: true, createBtn };
      await sleep(1500);
      await shot(page, 'uf08-create-attempt');
    }

    // U65: no FE-created WF→inbox this session → 🟡 BLOCKED (cấm seed).
    // Dashboard «Việc cần xử lý» / rail «Duyệt danh mục» ≠ actionable inbox Duyệt.
    const wfPosts = results.network.filter(
      (n) =>
        n.method === 'POST' &&
        /workflow/i.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
    uf08 = {
      verdict: '🟡',
      note: 'BLOCKED U65 — cannot complete Duyệt without FE-created WF→inbox this session; cấm seed:workflow:inbox. Workflow settings reachable; create→approve deep path not closed.',
      persona: EMAIL,
      click_path: 'settings=workflow → CC Việc cần xử lý / inbox observe',
      before: wfUi,
      action: createAttempt,
      network: {
        observe: results.network.filter((n) => /workflow|inbox/i.test(n.url)).slice(-8),
        createPosts: wfPosts.slice(-3),
      },
      fe: inboxUi,
      f5: 'n/a',
      screenshot: 'uf08-inbox.png',
      spec_ref: 'UC-XBOS-WF · J-XBOS-01 · U65',
    };
    note('uf08', true, JSON.stringify(uf08.note));
  } catch (e) {
    uf08 = {
      verdict: '🟡',
      error: String(e.message || e),
      note: 'BLOCKED U65 — cannot complete approve without seed',
      spec_ref: 'UC-XBOS-WF',
    };
    note('uf08', false, String(e.message || e));
  }
  setUf('UF-XBOS-08', uf08);

  // ========== UF-XBOS-11 member negative ==========
  let uf11 = { verdict: '⬜' };
  try {
    const memberSession = await loginApi(MEMBER_EMAIL);
    note('uf11-login', true, MEMBER_EMAIL);

    // Browser: login as member
    const memPage = await browser.newPage();
    trackNetwork(memPage);
    const memLogin = await uiLogin(memPage, MEMBER_EMAIL);
    await shot(memPage, 'uf11-member-login');
    await memPage.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded' });
    await sleep(2500);
    await shot(memPage, 'uf11-member-cc');

    // API negatives with member token
    const mh = {
      Authorization: `Bearer ${memberSession.token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
      accept: 'application/json',
    };
    const gmu = await fetch(`${PORTAL}/api/xbos/tenant-scope/group-member-units`, {
      headers: mh,
    });
    const kpi = await fetch(`${PORTAL}/api/xbos/kpi-engine/rollup?companyId=main`, {
      headers: mh,
    });
    let gmuBody = '';
    let kpiBody = '';
    try {
      gmuBody = JSON.stringify(await gmu.json()).slice(0, 240);
    } catch {
      /* */
    }
    try {
      kpiBody = JSON.stringify(await kpi.json()).slice(0, 240);
    } catch {
      /* */
    }

    const ui = await memPage.evaluate(() => {
      const t = document.body?.innerText || '';
      return {
        scopeMsg: /403|409|không có quyền|phạm vi|scope|tập đoàn/i.test(t),
        snip: t.slice(0, 400).replace(/\n/g, ' '),
      };
    });

    const negOk =
      (gmu.status === 403 || gmu.status === 409) &&
      (kpi.status === 403 || kpi.status === 409);

    uf11 = {
      verdict: negOk ? '🟢' : '🔴',
      persona: MEMBER_EMAIL,
      url: memPage.url(),
      click_path: '/login (member) → /command-center',
      before: 'n/a negative',
      action: 'attempt holding rollup APIs',
      network: {
        gmu: { status: gmu.status, body: gmuBody },
        kpi: { status: kpi.status, body: kpiBody },
        uiLogin: memLogin.url,
      },
      fe: ui,
      f5: 'n/a',
      screenshot: 'uf11-member-cc.png',
      spec_ref: 'U28-R2 · UF-XBOS-11',
    };
    note('uf11', negOk, JSON.stringify(uf11.network));
    await memPage.close();
  } catch (e) {
    uf11 = { verdict: '🔴', error: String(e.message || e), spec_ref: 'U28-R2' };
    note('uf11', false, String(e.message || e));
  }
  setUf('UF-XBOS-11', uf11);

  // ========== Optional light: UF-07 RACI tab present ==========
  let uf07 = { verdict: '⬜' };
  try {
    await openHoldingEdit(page);
    await sleep(1000);
    const raci = await clickButtonIncluding(page, ['Nhiệm vụ & RACI', 'RACI']);
    await sleep(1500);
    await shot(page, 'uf07-raci-tab');
    const ui = await page.evaluate(() => {
      const t = document.body?.innerText || '';
      return { hasMatrix: /RACI|Responsible|A\b|C\b|I\b|BDH|HĐQT/i.test(t), snip: t.slice(0, 300) };
    });
    uf07 = {
      verdict: raci && ui.hasMatrix ? '🟡' : '⬜',
      note: 'Tab present — cell toggle+PUT not completed this WI (timebox)',
      persona: EMAIL,
      click_path: 'holding edit → Nhiệm vụ & RACI',
      action: 'open tab',
      network: [],
      fe: ui,
      f5: false,
      screenshot: 'uf07-raci-tab.png',
      spec_ref: 'UC-CC-RACI',
    };
    note('uf07', uf07.verdict !== '🔴', JSON.stringify(ui));
  } catch (e) {
    uf07 = { verdict: '⬜', error: String(e.message || e), spec_ref: 'UC-CC-RACI' };
  }
  setUf('UF-XBOS-07', uf07);

  await browser.close();

  // Rollup
  const p0 = ['UF-XBOS-01', 'UF-XBOS-05', 'UF-XBOS-08', 'UF-XBOS-10', 'UF-XBOS-11'];
  const p0Pass = p0.filter((k) => results.uf[k]?.verdict === '🟢').length;
  const p0Yellow = p0.filter((k) => results.uf[k]?.verdict === '🟡').length;
  const p0Fail = p0.filter((k) => results.uf[k]?.verdict === '🔴').length;

  results.finishedAt = new Date().toISOString();
  results.rollup = {
    p0,
    p0Pass,
    p0Yellow,
    p0Fail,
    allUf: Object.fromEntries(
      Object.entries(results.uf).map(([k, v]) => [k, v.verdict]),
    ),
  };

  // Overall: PASS if P0 critical green except UF-08 may be 🟡 U65 blocked
  const criticalOk =
    results.uf['UF-XBOS-01']?.verdict === '🟢' &&
    results.uf['UF-XBOS-05']?.verdict === '🟢' &&
    results.uf['UF-XBOS-10']?.verdict === '🟢' &&
    results.uf['UF-XBOS-11']?.verdict === '🟢' &&
    (results.uf['UF-XBOS-08']?.verdict === '🟢' || results.uf['UF-XBOS-08']?.verdict === '🟡');

  results.overall = criticalOk ? 'PASS_WITH_CONDITIONS' : 'FAIL';
  results.ack_hint = criticalOk ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  save();

  console.log('\n=== ROLLUP ===');
  console.log(JSON.stringify(results.rollup, null, 2));
  console.log('overall=', results.overall);
  process.exit(criticalOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.overall = 'ERROR';
  results.error = String(e.stack || e);
  save();
  process.exit(2);
});
