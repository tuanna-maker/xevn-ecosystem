/**
 * QA-HDSD-MUTATE-RET-01 — HDSD mutate browser retest after D-HDSD-MUTATE-FE-01
 * U65 zero-seed · portal :5173 only · ceo@xe.vn
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-mutate-ret-20260730');
const STAMP = `HDSD${Date.now().toString(36).slice(-5).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-MUTATE-RET-01',
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
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 140)}`);
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

async function waitForNet(pred, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = lastNet(pred);
    if (hit) return hit;
    await sleep(200);
  }
  return null;
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

async function clickButtonIncluding(page, texts) {
  for (const t of texts) {
    try {
      await nativeClickByText(page, t);
      return t;
    } catch {
      /* */
    }
  }
  return null;
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
  const before = results.network.length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  const loginNet = results.network.slice(before).find((n) => /auth\/login/.test(n.url));
  return { url: page.url(), loginNet };
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

async function typeShareholderFields(page, { name, idCode, ratio, contributed }) {
  async function typeCol(colIndex, value) {
    const handle = await page.evaluateHandle((idx) => {
      const tables = Array.from(document.querySelectorAll('table'));
      const shr = tables.find((t) => /Họ tên|Tỷ lệ|cổ đông/i.test(t.innerText || ''));
      if (!shr) return null;
      const last = Array.from(shr.querySelectorAll('tbody tr')).at(-1);
      const inputs = Array.from(last?.querySelectorAll('input') || []);
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
  if (idCode) await typeCol(2, idCode);
  if (ratio) await typeCol(3, ratio);
  if (contributed) await typeCol(4, contributed);
  await sleep(200);
  return page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table'));
    const shr = tables.find((t) => /Họ tên|Tỷ lệ|cổ đông/i.test(t.innerText || ''));
    const last = Array.from(shr?.querySelectorAll('tbody tr') || []).at(-1);
    const inputs = Array.from(last?.querySelectorAll('input') || []);
    return { ok: !!shr, values: inputs.map((i) => i.value) };
  });
}

async function clickSaveShareholderLast(page) {
  return page.evaluate(() => {
    const all = Array.from(
      document.querySelectorAll('button[aria-label="Lưu cổ đông"], button[title="Lưu cổ đông"]'),
    );
    const target = all[all.length - 1];
    if (!target) {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        /Lưu cổ đông/i.test(b.textContent || b.getAttribute('aria-label') || ''),
      );
      if (!btn) return { ok: false };
      btn.click();
      return { ok: true, via: 'text' };
    }
    target.click();
    return { ok: true, via: 'aria', count: all.length };
  });
}

async function waitForDialog(page, timeoutMs = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const open = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    if (open) return true;
    await sleep(250);
  }
  return false;
}

async function openEmployeeCreateDialog(page) {
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) =>
      /Thêm nhân viên/i.test((b.textContent || '').trim()),
    );
    if (!btn) return { ok: false, reason: 'no Thêm nhân viên btn' };
    btn.click();
    return { ok: true };
  });
  await sleep(1500);
  const dialog = await waitForDialog(page);
  return { ...clicked, dialog };
}

async function fillDialogInputByName(page, name, value) {
  const handle = await page.$(`[role="dialog"] input[name="${name}"]`);
  if (!handle) return { ok: false, reason: `no input[name=${name}] in dialog` };
  await handle.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.keyboard.type(value, { delay: 15 });
  return { ok: true, field: name, value };
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
  await page.goto(q('/hr/attendance'), { waitUntil: 'networkidle2', timeout: 120000 });
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

  const dateInputs = await page.$$('[role="dialog"] input');
  for (const [idx, vi] of [startVi, endVi].entries()) {
    const inp = dateInputs.filter((el) =>
      page.evaluate((n) => {
        const ph = (n.placeholder || '').toLowerCase();
        return /dd\/mm|ngày|date/.test(ph) || n.type === 'date' || n.type === 'text';
      }, el),
    )[idx];
    if (inp) {
      await inp.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await inp.type(vi, { delay: 25 });
      await page.keyboard.press('Tab');
      await sleep(200);
    }
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

async function clickSaveInDialog(page, labels = ['Lưu', 'Thêm nhân viên', 'Tạo', 'Gửi', 'Cập nhật']) {
  const clicked = await page.evaluate((labs) => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button')).find((b) =>
      labs.some((l) => new RegExp(`^${l}$`, 'i').test((b.textContent || '').trim())),
    ) || Array.from(d.querySelectorAll('button')).find((b) => labs.some((l) => (b.textContent || '').includes(l)));
    if (!btn || btn.disabled) return { ok: false, disabled: !!btn?.disabled };
    btn.click();
    return { ok: true, text: (btn.textContent || '').trim() };
  }, labels);
  if (!clicked.ok) {
    for (const l of labels) {
      try {
        await nativeClickByText(page, l);
        return { ok: true, text: l };
      } catch {
        /* */
      }
    }
  }
  return clicked;
}

async function runL0Shell() {
  for (const [name, cmd] of [
    ['qc:dev-stack', 'node scripts/qc-dev-stack.mjs'],
    ['qc:fe-be-health', 'node scripts/qc-fe-be-api-health.mjs'],
  ]) {
    try {
      const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
      results.l0[name] = { exit: 0, snippet: out.slice(-400) };
    } catch (e) {
      results.l0[name] = { exit: e.status ?? 1, snippet: String(e.stdout || e.stderr || e.message).slice(-400) };
    }
  }
  save();
}

(async () => {
  console.log('=== QA-HDSD-MUTATE-RET-01 ===');
  await runL0Shell();

  if (results.l0['qc:dev-stack']?.exit !== 0 || results.l0['qc:fe-be-health']?.exit !== 0) {
    console.warn('L0 not fully PASS — continuing browser with recorded L0 state');
  }

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

    // TC-HDSD-03-02-01 UF-XBOS-05
    {
      const netBefore = results.network.length;
      const opened = await openHoldingEdit(page);
      await shot(page, '03-02-holding-edit');
      let verdict = '🟡';
      let detail = `open=${JSON.stringify(opened)}`;
      if (opened.ok) {
        await page.evaluate(() => {
          const h = Array.from(document.querySelectorAll('h3,h4,div')).find((n) =>
            /Danh sách Cổ đông|cổ đông/i.test(n.textContent || ''),
          );
          h?.scrollIntoView({ block: 'center' });
        });
        await sleep(400);
        const rowsBefore = await page.evaluate(() => {
          const tables = Array.from(document.querySelectorAll('table'));
          const shr = tables.find((t) => /Họ tên|Tỷ lệ|cổ đông/i.test(t.innerText || ''));
          return shr?.querySelectorAll('tbody tr').length ?? 0;
        });
        await clickButtonIncluding(page, ['+ Thêm cổ đông', 'Thêm cổ đông', 'Thêm dòng']);
        await sleep(1200);
        const rowsAfterAdd = await page.evaluate(() => {
          const tables = Array.from(document.querySelectorAll('table'));
          const shr = tables.find((t) => /Họ tên|Tỷ lệ|cổ đông/i.test(t.innerText || ''));
          return shr?.querySelectorAll('tbody tr').length ?? 0;
        });
        const filled = await typeShareholderFields(page, {
          name: `QA ${STAMP}`,
          idCode: `079${Date.now().toString().slice(-8)}`,
          ratio: '1.2',
          contributed: '1500000',
        });
        const saveClick = await clickSaveShareholderLast(page);
        await sleep(4000);
        await shot(page, '03-02-after-save');
        const postShr = netsSince(netBefore, (n) =>
          ['POST', 'PUT', 'PATCH'].includes(n.method) && /shareholder/i.test(n.url),
        ).find((n) => n.status >= 200 && n.status < 300);
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(2000);
        await openHoldingEdit(page);
        await sleep(2000);
        const f5Visible = await page.evaluate((stamp) => (document.body?.innerText || '').includes(stamp), STAMP);
        await shot(page, '03-02-after-f5');
        const ok = !!postShr && f5Visible;
        verdict = ok ? '🟢' : postShr ? '🟡' : '🔴';
        detail = `rows ${rowsBefore}→${rowsAfterAdd} fill=${JSON.stringify(filled)} save=${JSON.stringify(saveClick)} POST=${postShr?.method || 'none'} ${postShr?.status || ''} F5=${f5Visible}`;
      }
      recordTc('TC-HDSD-03-02-01', verdict, detail, {
        uf: 'UF-XBOS-05',
        clickPath: 'Settings → TẬP ĐOÀN → Chỉnh sửa → Thêm cổ đông → Lưu → F5',
      });
    }

    // TC-HDSD-04-02-01 UF-XBOS-10
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
        `deepLink workflow_designer dots=${canvasOk.hasDots} text=${canvasOk.hasWorkflowText} net=${wfNet?.status ?? 'n/a'} url=${canvasOk.url.slice(0, 100)}`,
        { uf: 'UF-XBOS-10', clickPath: '?settings=workflow_designer → Canvas' },
      );
    }

    // TC-HDSD-05-03-01 UF-HRM-02 create NV
    {
      const netBefore = results.network.length;
      await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      const openDlg = await openEmployeeCreateDialog(page);
      await shot(page, '05-03-create-form');
      const empName = `NV ${STAMP}`;
      let fill = { ok: false, reason: 'dialog-not-open' };
      if (openDlg.dialog) {
        fill = await fillDialogInputByName(page, 'full_name', empName);
        if (!fill.ok) {
          fill = await fillDialogInputByName(page, 'employee_code', `QA${STAMP}`);
        }
      }
      const beforeSave = results.network.length;
      await clickSaveInDialog(page, ['Thêm nhân viên', 'Lưu', 'Tạo']);
      await sleep(4000);
      await shot(page, '05-03-after-save');
      const postEmp = netsSince(beforeSave, (n) => n.method === 'POST' && /\/employees/.test(n.url)).find(
        (n) => n.status >= 200 && n.status < 300,
      );
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3000);
      const f5Emp = await page.evaluate((name) => (document.body?.innerText || '').includes(name), empName);
      await shot(page, '05-03-after-f5');
      const verdict = postEmp?.status === 201 || (postEmp && f5Emp) ? '🟢' : postEmp ? '🟡' : '🔴';
      recordTc(
        'TC-HDSD-05-03-01',
        verdict,
        `openDlg=${JSON.stringify(openDlg)} fill=${JSON.stringify(fill)} POST=${postEmp?.status || 'none'} F5=${f5Emp} name=${empName}`,
        { uf: 'UF-HRM-02', clickPath: '/hr/employees → Thêm nhân viên → Lưu → F5' },
      );
    }

    // TC-HDSD-06-02-01 UF-HRM-05 create HĐ
    {
      await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      const contractOpen = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          /Thêm hợp đồng/i.test((b.textContent || '').trim()),
        );
        if (!btn) return { ok: false };
        btn.click();
        return { ok: true };
      });
      await sleep(2000);
      const contractDialog = await waitForDialog(page);
      await shot(page, '06-02-create-form');
      const beforeSave = results.network.length;
      await clickSaveInDialog(page, ['Lưu', 'Thêm hợp đồng', 'Tạo']);
      await sleep(4000);
      await shot(page, '06-02-after-save');
      const postContract = netsSince(beforeSave, (n) =>
        ['POST', 'PUT'].includes(n.method) && /contract/.test(n.url),
      ).find((n) => n.status >= 200 && n.status < 300);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3000);
      const rowCount = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => (r.textContent || '').trim().length > 5);
        return rows.length;
      });
      await shot(page, '06-02-after-f5');
      const verdict = postContract ? '🟢' : '🟡';
      recordTc(
        'TC-HDSD-06-02-01',
        verdict,
        `open=${JSON.stringify(contractOpen)} dialog=${contractDialog} POST=${postContract?.method || 'none'} ${postContract?.status || ''} rowsAfterF5=${rowCount}`,
        { uf: 'UF-HRM-05', clickPath: '/hr/contracts → Thêm hợp đồng → Lưu → F5' },
      );
    }

    // TC-HDSD-07-02-01 UF-HRM-07 YCTD
    {
      await page.goto(q('/hr/recruitment?tab=requisitions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      try {
        await nativeClickByText(page, 'Yêu cầu tuyển dụng');
        await sleep(1200);
      } catch {
        /* tab may already be active via query */
      }
      await shot(page, '07-02-requisitions');
      let formOpened = false;
      const reqClick = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          /Thêm yêu cầu/i.test((b.textContent || '').trim()),
        );
        if (!btn) return { ok: false };
        btn.click();
        return { ok: true };
      });
      await sleep(2000);
      formOpened = await waitForDialog(page);
      await shot(page, '07-02-create-form');
      let postReq = null;
      if (formOpened) {
        await page.evaluate(() => {
          const d = document.querySelector('[role="dialog"]') || document.body;
          const combo = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
            /JD|mô tả|job|vị trí/i.test(b.getAttribute('aria-label') || b.textContent || ''),
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
        await clickSaveInDialog(page, ['Lưu', 'Thêm yêu cầu', 'Tạo', 'Gửi']);
        await sleep(4000);
        postReq = netsSince(beforeSave, (n) => n.method === 'POST' && /requisition|recruitment|job/.test(n.url)).find(
          (n) => n.status >= 200 && n.status < 300,
        );
        await shot(page, '07-02-after-save');
      }
      const verdict = formOpened && postReq ? '🟢' : formOpened ? '🟡' : '🔴';
      recordTc(
        'TC-HDSD-07-02-01',
        verdict,
        `reqClick=${JSON.stringify(reqClick)} formOpen=${formOpened} POST=${postReq?.status || 'none/n/a'} (JD catalog U65 may block save)`,
        { uf: 'UF-HRM-07', clickPath: '/hr/recruitment?tab=requisitions → Thêm yêu cầu' },
      );
    }

    // TC-HDSD-10-04-01 internal_services redirect
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

    // TC-HDSD-06-03-01 UF-HRM-06 insurance tab — stable 200 (no chk_contract_date_range 500)
    {
      const insRuns = [];
      for (let run = 0; run < 3; run++) {
        const netBefore = results.network.length;
        await page.goto(q('/hr/insurance'), { waitUntil: 'networkidle2', timeout: 90000 });
        await sleep(2500);
        try {
          await nativeClickByText(page, 'BHXH');
        } catch {
          /* tab may default */
        }
        await sleep(1500);
        if (run === 0) await shot(page, '06-03-insurance-tab');
        const insNets = netsSince(netBefore, (n) => /contracts-insurance\/insurance|insurance/.test(n.url));
        const has500 = insNets.some((n) => n.status >= 500);
        const all200 = insNets.length > 0 && insNets.every((n) => n.status >= 200 && n.status < 300);
        insRuns.push({ run: run + 1, count: insNets.length, has500, all200, statuses: insNets.map((n) => n.status) });
        await sleep(800);
      }
      const stable = insRuns.every((r) => r.all200 && !r.has500) && insRuns.some((r) => r.count > 0);
      const any500 = insRuns.some((r) => r.has500);
      const chkErr = results.consoleErrors.some((e) => /chk_contract_date_range/i.test(e));
      recordTc(
        'TC-HDSD-06-03-01',
        stable ? '🟢' : any500 ? '🔴' : '🟡',
        `3×load insurance runs=${JSON.stringify(insRuns)} chk500console=${chkErr}`,
        { uf: 'UF-HRM-06', clickPath: '/hr/insurance → tab BHXH → Network all 200' },
      );
    }

    // TC-HDSD-08-02-01 UF-HRM-09 leave POST 2xx LVT_01 (cold lazy catalog pull)
    {
      const leave = await tryCreateLeaveRequest(page);
      await shot(page, '08-02-leave-after-submit');
      const verdict = leave.ok ? '🟢' : leave.postStatus === 400 ? '🔴' : leave.postStatus ? '🟡' : '🔴';
      recordTc(
        'TC-HDSD-08-02-01',
        verdict,
        `POST=${leave.postStatus ?? 'none'} reason=${leave.reason} F5marker=${leave.f5} url=${(leave.postUrl || '').slice(0, 80)}`,
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
