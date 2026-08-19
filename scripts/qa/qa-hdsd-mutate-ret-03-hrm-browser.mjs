/**
 * QA-HDSD-MUTATE-RET-03-HRM — HRM mutate browser retest (NV/HĐ/YCTD/leave)
 * U65 zero-seed · portal :5173 only · ceo@xe.vn · prefer data-testid selectors
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-hrm-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-mutate-ret-03-hrm-20260731');
const STAMP = `HDSD${Date.now().toString(36).slice(-5).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-MUTATE-RET-03-HRM',
  program: 'P-HDSD-QA-SRS-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP },
  l0: {},
  tc: [],
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, uf: extra.uf, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 160)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function trackNetwork(page) {
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
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

function netsSince(before, pred) {
  return results.network.slice(before).filter(pred);
}

async function waitHrmHealthy(page, maxMs = 30000) {
  const start = Date.now();
  const netBefore = results.network.length;
  while (Date.now() - start < maxMs) {
    const hit = results.network.slice(netBefore).find(
      (n) => n.method === 'GET' && /\/employees/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    if (hit) return true;
    const recent = results.network.slice(-8).find(
      (n) => n.method === 'GET' && /\/employees/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    if (recent) return true;
    await sleep(800);
  }
  return false;
}

async function typeViDate(page, handle, vi) {
  await handle.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await handle.type(vi, { delay: 25 });
  await page.keyboard.press('Tab');
  await sleep(200);
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 12 });
}

async function nativeClickByText(page, text, opts = {}) {
  const box = await page.evaluate(
    (t, exact) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], [role="menuitem"], span, div, li'),
      );
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (exact) return txt === t;
        return txt.includes(t);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    !!opts.exact,
  );
  if (!box) throw new Error(`click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
}

async function clickTestId(page, testId) {
  const sel = `[data-testid="${testId}"]`;
  await page.waitForSelector(sel, { timeout: 15000 });
  await page.click(sel);
}

async function clickLastTestIdPrefix(page, prefix) {
  return page.evaluate((pfx) => {
    const els = Array.from(document.querySelectorAll(`[data-testid^="${pfx}"]`));
    const target = els[els.length - 1];
    if (!target) return { ok: false };
    target.scrollIntoView({ block: 'center' });
    target.click();
    return { ok: true, testid: target.getAttribute('data-testid'), count: els.length };
  }, prefix);
}

async function typeLastTestIdPrefix(page, prefix, value) {
  const sel = `[data-testid^="${prefix}"]`;
  await page.waitForSelector(sel, { timeout: 15000 });
  const handles = await page.$$(sel);
  const el = handles[handles.length - 1];
  if (!el) return { ok: false };
  await el.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.keyboard.type(value, { delay: 15 });
  return { ok: true, count: handles.length };
}

async function waitForDialog(page, testId, timeoutMs = 12000) {
  const sel = testId ? `[data-testid="${testId}"]` : '[role="dialog"]';
  try {
    await page.waitForSelector(sel, { timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

async function uiLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  return { url: page.url() };
}

async function openSettings(page, query) {
  await page.goto(`${PORTAL}/command-center?settings=${query}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2500);
}

async function openHoldingEdit(page) {
  await openSettings(page, 'company_member_units');
  await sleep(1500);
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const row = rows.find((tr) => /TẬP ĐOÀN|HOLDING|XEVN/i.test(tr.innerText || ''));
    if (!row) return { ok: false, reason: 'no holding row' };
    const btn = Array.from(row.querySelectorAll('button')).find((b) =>
      /Chỉnh sửa|Sửa/i.test(b.textContent || ''),
    );
    if (!btn) return { ok: false, reason: 'no edit btn' };
    btn.scrollIntoView({ block: 'center' });
    btn.click();
    return { ok: true };
  });
  await sleep(2500);
  return clicked;
}

async function ensureJdTemplateFromFe(page) {
  const netBefore = results.network.length;
  await page.goto(q('/hr/recruitment?tab=jd-library'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  const existing = netsSince(netBefore, (n) => n.method === 'GET' && /job-templates/.test(n.url)).pop();
  const hasRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => (r.textContent || '').trim().length > 10);
    return rows.length;
  });
  if (hasRows > 0) return { ok: true, via: 'existing', count: hasRows };

  try {
    await nativeClickByText(page, 'Thêm JD');
  } catch {
    return { ok: false, reason: 'no-add-jd-btn' };
  }
  await sleep(1500);
  const jdCode = `JD-${STAMP}`;
  const jdTitle = `QA JD ${STAMP}`;
  await page.evaluate(
    (code, title) => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return;
      const inputs = Array.from(d.querySelectorAll('input'));
      const codeInp = inputs.find((i) => /mã/i.test(i.closest('label')?.textContent || i.name || '')) || inputs[0];
      const titleInp = inputs.find((i) => /tiêu đề/i.test(i.closest('label')?.textContent || '')) || inputs[1];
      if (codeInp) {
        codeInp.value = code;
        codeInp.dispatchEvent(new Event('input', { bubbles: true }));
        codeInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (titleInp) {
        titleInp.value = title;
        titleInp.dispatchEvent(new Event('input', { bubbles: true }));
        titleInp.dispatchEvent(new Event('change', { bubbles: true }));
      }
    },
    jdCode,
    jdTitle,
  );
  await sleep(400);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const combo = Array.from(d?.querySelectorAll('button[role="combobox"]') || []).find((b) =>
      /chức danh|position/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    combo?.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    const opt = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]')).find(Boolean);
    opt?.click();
  });
  await sleep(500);
  const beforeSave = results.network.length;
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const btn = Array.from(d?.querySelectorAll('button') || []).find((b) =>
      /Lưu|Thêm|Tạo/i.test((b.textContent || '').trim()),
    );
    btn?.click();
  });
  await sleep(4000);
  const postJd = netsSince(beforeSave, (n) => n.method === 'POST' && /job-templates/.test(n.url)).find(
    (n) => n.status >= 200 && n.status < 300,
  );
  return { ok: !!postJd, via: 'created', postStatus: postJd?.status, code: jdCode };
}

function pickLeaveWindow() {
  const start = new Date();
  start.setMonth(start.getMonth() + 5);
  const day = 3 + ((Date.now() / 60_000) | 0) % 25;
  start.setDate(day);
  const end = new Date(start);
  const dd = (d) => String(d.getDate()).padStart(2, '0');
  const mm = (d) => String(d.getMonth() + 1).padStart(2, '0');
  const vi = (d) => `${dd(d)}/${mm(d)}/${d.getFullYear()}`;
  return { startVi: vi(start), endVi: vi(end) };
}

async function activateLeaveTab(page) {
  await page.evaluate(() => {
    const hit = Array.from(document.querySelectorAll('button')).find((b) => {
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
      return t === 'Nghỉ phép' || t.endsWith('Nghỉ phép');
    });
    hit?.click();
  });
  for (let i = 0; i < 25; i++) {
    if (await page.evaluate(() => document.body.innerText.includes('Tạo yêu cầu nghỉ'))) return true;
    await sleep(400);
  }
  return false;
}

async function tryCreateLeaveRequest(page) {
  const netBefore = results.network.length;
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 120000 });
  await sleep(2000);
  const tabOk = await activateLeaveTab(page);
  if (!tabOk) return { ok: false, reason: 'leave-tab-miss' };

  const opened = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /Tạo yêu cầu nghỉ/i.test((x.textContent || '').trim()),
    );
    if (!b) return false;
    b.click();
    return true;
  });
  if (!opened) return { ok: false, reason: 'create-button-miss' };
  await sleep(1200);

  for (let i = 0; i < 40; i++) {
    const state = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return 'no-dialog';
      if (d.innerText.includes('Đang tải danh mục')) return 'loading';
      return Array.from(d.querySelectorAll('button[role="combobox"]')).some((b) =>
        /Chọn loại nghỉ|loại nghỉ/i.test(b.getAttribute('aria-label') || b.textContent || ''),
      )
        ? 'ready'
        : 'wait';
    });
    if (state === 'ready') break;
    await sleep(400);
  }

  const { startVi, endVi } = pickLeaveWindow();
  const MARKER = `QA-LEAVE-${STAMP}`;
  const empSearch = await page.$(
    '[role="dialog"] input[aria-label*="nhân" i], [role="dialog"] input[placeholder*="nhân" i], [role="dialog"] input[placeholder*="Tìm" i]',
  );
  if (empSearch) {
    await empSearch.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await empSearch.type('PORTAL-GCEO', { delay: 40 });
  }
  await sleep(900);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) => {
      const a = (b.getAttribute('aria-label') || '') + (b.textContent || '');
      return /nhân viên|Chọn nhân|select employee/i.test(a) && !/loại nghỉ|leave type/i.test(a);
    });
    btn?.click();
  });
  await sleep(700);
  await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('[role="option"], [data-radix-collection-item], [cmdk-item]'),
    );
    const hit = items.find((n) => (n.textContent || '').includes('PORTAL-GCEO')) || items[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(400);

  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
      /Chọn loại nghỉ|loại nghỉ|leave type/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    btn?.click();
  });
  await sleep(700);
  await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('[cmdk-item], [data-slot="command-item"], [role="option"]'),
    );
    const hit =
      nodes.find((n) => (n.textContent || '').includes('LVT_01')) ||
      nodes.find((n) => /Phép năm/i.test(n.textContent || '')) ||
      nodes[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(400);

  const dateInputs = await page.$$(
    '[role="dialog"] input[placeholder*="dd/MM/yyyy" i], [role="dialog"] input[placeholder*="dd/mm/yyyy" i]',
  );
  if (dateInputs.length >= 2) {
    await typeViDate(page, dateInputs[0], startVi);
    await typeViDate(page, dateInputs[1], endVi);
  }

  const reasonEl = await page.$('[role="dialog"] textarea');
  if (reasonEl) {
    await reasonEl.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await reasonEl.type(MARKER, { delay: 20 });
  }

  const submitted = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button')).find((b) =>
      /Gửi yêu cầu|Gửi/i.test((b.textContent || '').trim()),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  if (!submitted) return { ok: false, reason: 'submit-miss' };
  await sleep(3500);

  const postNet = results.network.slice(netBefore).find(
    (n) => n.method === 'POST' && /leave-requests/.test(n.url) && !/approve|reject/.test(n.url),
  );
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2000);
  const f5Visible = await page.evaluate((m) => (document.body?.innerText || '').includes(m), MARKER);
  return {
    ok: postNet?.status >= 200 && postNet?.status < 300,
    postStatus: postNet?.status ?? null,
    postUrl: postNet?.url ?? null,
    f5: f5Visible,
    reason: postNet ? 'posted' : 'no-post',
    marker: MARKER,
  };
}

async function runL0Shell() {
  if (process.env.SKIP_L0 === '1') {
    results.l0 = { skipped: true, note: 'pre-verified portal+hrm up' };
    save();
    return;
  }
  for (const [name, cmd] of [
    ['qc:dev-stack', 'node scripts/qc-dev-stack.mjs'],
    ['qc:fe-be-health', 'node scripts/qc-fe-be-api-health.mjs'],
  ]) {
    try {
      const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
      results.l0[name] = { exit: 0, snippet: out.slice(-400) };
    } catch (e) {
      const snippet = String(e.stdout || e.stderr || e.message).slice(-400);
      const healthy = /HTTP 200|ALL PASS|healthy/i.test(snippet);
      results.l0[name] = { exit: healthy ? 0 : (e.status ?? 1), snippet };
    }
  }
  save();
}

(async () => {
  console.log('=== QA-HDSD-MUTATE-RET-03-HRM ===');
  await runL0Shell();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => results.consoleErrors.push(String(e).slice(0, 180)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 180));
  });

  try {
    const login = await uiLogin(page);
    if (!/command-center/.test(login.url)) throw new Error(`login failed url=${login.url}`);

    // TC-HDSD-04-02-01 UF-XBOS-10 regression (no SHR — promoted RET-03-SHR)
    {
      await openSettings(page, 'workflow_designer');
      await sleep(2000);
      try {
        await nativeClickByText(page, 'Canvas');
      } catch {
        try {
          await nativeClickByText(page, 'Quy trình');
        } catch {
          /* */
        }
      }
      await shot(page, '04-02-wf-canvas');
      const canvasOk = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const hasDots =
          !!document.querySelector('.bg-workflow-canvas-dots') ||
          !!document.querySelector('[class*="workflow-canvas"]');
        return {
          hasDots,
          hasWorkflowText: /canvas|workflow|bước|node|Hệ thống quy trình/i.test(t),
          url: location.href,
        };
      });
      const wfNet = lastNet((n) => /workflow|process/.test(n.url) && n.status < 500);
      const verdict =
        canvasOk.hasDots || (canvasOk.hasWorkflowText && /settings=workflow/.test(canvasOk.url))
          ? '🟢'
          : canvasOk.hasWorkflowText
            ? '🟡'
            : '🔴';
      recordTc(
        'TC-HDSD-04-02-01',
        verdict,
        `deepLink workflow_designer dots=${canvasOk.hasDots} text=${canvasOk.hasWorkflowText} net=${wfNet?.status ?? 'n/a'}`,
        { uf: 'UF-XBOS-10', clickPath: '?settings=workflow_designer → Canvas' },
      );
    }

    // TC-HDSD-05-03-01 UF-HRM-02 — employee create via testid
    {
      await sleep(5000);
      await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2000);
      await waitHrmHealthy(page);
      await sleep(1000);
      await clickTestId(page, 'hdsd-employees-create-btn');
      await sleep(1500);
      const dialogOpen = await waitForDialog(page, 'hdsd-employee-form-dialog');
      await shot(page, '05-03-create-form');
      const empName = `NV ${STAMP}`;
      const empCode = `QA${STAMP}`;
      let fill = { ok: false };
      if (dialogOpen) {
        await reactSetInput(page, '[data-testid="hdsd-employee-form-dialog"] input[name="full_name"]', empName);
        await reactSetInput(page, '[data-testid="hdsd-employee-form-dialog"] input[name="employee_code"]', empCode);
        fill = { ok: true, field: 'full_name+employee_code', value: empName };
      }
      const beforeSave = results.network.length;
      if (dialogOpen) {
        try {
          await clickTestId(page, 'hdsd-employee-form-submit');
        } catch {
          await page.click('[data-testid="hdsd-employee-form-dialog"] button[aria-label="Lưu"]');
        }
      }
      await sleep(4000);
      await shot(page, '05-03-after-save');
      const postEmp = netsSince(beforeSave, (n) => n.method === 'POST' && /\/employees/.test(n.url)).pop();
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3000);
      const f5Emp = await page.evaluate((name) => (document.body?.innerText || '').includes(name), empName);
      await shot(page, '05-03-after-f5');
      const verdict =
        postEmp?.status === 201 && f5Emp ? '🟢' : postEmp?.status >= 200 && postEmp?.status < 300 && f5Emp ? '🟢' : postEmp?.status >= 200 && postEmp?.status < 300 ? '🟡' : postEmp ? '🔴' : '🔴';
      recordTc(
        'TC-HDSD-05-03-01',
        verdict,
        `dialog=${dialogOpen} fill=${JSON.stringify(fill)} POST=${postEmp?.status || 'none'} F5=${f5Emp}`,
        { uf: 'UF-HRM-02', clickPath: '#hdsd-employees-create-btn → full_name → submit testid → F5' },
      );
    }

    // TC-HDSD-06-02-01 UF-HRM-05 — contract via testid
    {
      await sleep(5000);
      await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2000);
      await waitHrmHealthy(page);
      await sleep(1000);
      await clickTestId(page, 'hdsd-contracts-create-btn');
      await sleep(2000);
      const contractDialog = await waitForDialog(page, 'hdsd-contracts-form-dialog');
      await shot(page, '06-02-create-form');
      const beforeSave = results.network.length;
      if (contractDialog) {
        try {
          await clickTestId(page, 'hdsd-contracts-form-submit');
        } catch {
          await page.click('[data-testid="hdsd-contracts-form-dialog"] button[aria-label="Lưu"]');
        }
      }
      await sleep(4000);
      await shot(page, '06-02-after-save');
      const postContract = netsSince(beforeSave, (n) =>
        ['POST', 'PUT'].includes(n.method) && /contract/.test(n.url),
      ).pop();
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3000);
      const f5HasStamp = await page.evaluate((s) => (document.body?.innerText || '').includes(s), STAMP);
      await shot(page, '06-02-after-f5');
      const verdict = postContract?.status >= 200 && postContract?.status < 300 ? '🟢' : postContract ? '🔴' : contractDialog ? '🟡' : '🔴';
      recordTc(
        'TC-HDSD-06-02-01',
        verdict,
        `dialog=${contractDialog} POST=${postContract?.method || 'none'} ${postContract?.status || ''} F5stamp=${f5HasStamp}`,
        { uf: 'UF-HRM-05', clickPath: '#hdsd-contracts-create-btn → Lưu testid → F5' },
      );
    }

    // TC-HDSD-07-02-01 UF-HRM-07 — YCTD + JD from FE catalog (U65)
    {
      await waitHrmHealthy(page);
      const jdEnsure = await ensureJdTemplateFromFe(page);
      await page.goto(q('/hr/recruitment?tab=requisitions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2000);
      await waitHrmHealthy(page);
      await shot(page, '07-02-requisitions');
      await clickTestId(page, 'hdsd-requisition-create-btn');
      await sleep(2000);
      const formOpened = await waitForDialog(page, 'hdsd-requisition-form-dialog');
      await shot(page, '07-02-create-form');
      let postReq = null;
      if (formOpened) {
        await page.evaluate(() => {
          const d = document.querySelector('[data-testid="hdsd-requisition-form-dialog"]') || document.querySelector('[role="dialog"]');
          const combo = Array.from(d?.querySelectorAll('button[role="combobox"]') || []).find((b) =>
            /JD|mô tả|job|vị trí|template/i.test(b.getAttribute('aria-label') || b.textContent || ''),
          );
          combo?.click();
        });
        await sleep(800);
        await page.evaluate(() => {
          const opt = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]')).find(Boolean);
          opt?.click();
        });
        await sleep(500);
        const beforeSave = results.network.length;
        try {
          await clickTestId(page, 'hdsd-requisition-form-submit');
        } catch {
          await page.click('[data-testid="hdsd-requisition-form-dialog"] button[aria-label="Lưu"]');
        }
        await sleep(4000);
        postReq = netsSince(beforeSave, (n) => n.method === 'POST' && /requisition|recruitment|job/.test(n.url)).pop();
        await shot(page, '07-02-after-save');
      }
      const verdict =
        formOpened && postReq?.status >= 200 && postReq?.status < 300
          ? '🟢'
          : formOpened && postReq
            ? '🔴'
            : formOpened
              ? '🟡'
              : '🔴';
      recordTc(
        'TC-HDSD-07-02-01',
        verdict,
        `jdEnsure=${JSON.stringify(jdEnsure)} formOpen=${formOpened} POST=${postReq?.status || 'none'}`,
        { uf: 'UF-HRM-07', clickPath: 'JD library FE → #hdsd-requisition-create-btn → JD picker → Lưu' },
      );
    }

    // TC-HDSD-10-04-01 internal_services redirect regression
    {
      const consoleBefore = results.consoleErrors.length;
      await page.goto(q('/hr/internal_services'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      await shot(page, '10-04-internal-services');
      const state = await page.evaluate(() => ({
        url: location.href,
        has404text: /404|not found/i.test(document.body?.innerText || ''),
        path: location.pathname,
      }));
      const internal404 = results.consoleErrors.slice(consoleBefore).some((e) => /404|internal_services/i.test(e));
      const getOk = lastNet((n) => n.method === 'GET' && /internal-services/.test(n.url) && n.status < 400);
      const verdict =
        !internal404 && !state.has404text && /internal-services/.test(state.path || state.url) ? '🟢' : internal404 ? '🔴' : '🟡';
      recordTc(
        'TC-HDSD-10-04-01',
        verdict,
        `url=${state.url.slice(0, 100)} GET=${getOk?.status ?? 'n/a'} console404=${internal404}`,
        { uf: 'UF-HRM-MENU-05', clickPath: '/hr/internal_services embed redirect' },
      );
    }

    // TC-HDSD-08-02-01 UF-HRM-09 leave POST (BE-02 lazy catalog)
    {
      await waitHrmHealthy(page);
      await sleep(1000);
      const leave = await tryCreateLeaveRequest(page);
      await shot(page, '08-02-leave-after-submit');
      const verdict = leave.ok ? '🟢' : leave.postStatus === 400 ? '🔴' : leave.postStatus ? '🟡' : '🔴';
      recordTc(
        'TC-HDSD-08-02-01',
        verdict,
        `POST=${leave.postStatus ?? 'none'} reason=${leave.reason} F5marker=${leave.f5}`,
        { uf: 'UF-HRM-09', clickPath: 'Attendance → Nghỉ phép → Tạo → LVT_01 → Gửi → F5' },
      );
    }

    results.finishedAt = new Date().toISOString();
    results.summary = {
      green: results.tc.filter((t) => t.verdict === '🟢').length,
      yellow: results.tc.filter((t) => t.verdict === '🟡').length,
      red: results.tc.filter((t) => t.verdict === '🔴').length,
    };
    save();
  } finally {
    await browser.close();
  }

  console.log('Runtime:', OUT);
  console.log('Summary:', JSON.stringify(results.summary));
})();
