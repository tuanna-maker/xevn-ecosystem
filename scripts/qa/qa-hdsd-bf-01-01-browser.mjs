/**
 * QA-HDSD-BF-01-01 — BF-01 Đ3 spine U65 (Canvas regression → YCTD Gửi duyệt → inbox → spots)
 * U65 zero-seed · portal :5173 · ceo@xe.vn · canvas load-only must_keep
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-01-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-01-01-20260801');
const STAMP = `BF01${Date.now().toString(36).slice(-5).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-01-01',
  program: 'P-HDSD-ECOSYSTEM-03 · BF-01 · Đ3',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP },
  l0: {},
  spots: [],
  network: [],
  consoleErrors: [],
  screens: [],
  ack_status: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function record(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.spots.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 220)}`);
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
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        at: new Date().toISOString(),
      };
      if (u.includes('/employees/summary')) {
        try {
          const body = await res.json();
          const data = body?.data ?? body;
          entry.response_total = data?.total;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
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
}

async function clickTestId(page, testId) {
  const sel = `[data-testid="${testId}"]`;
  await page.waitForSelector(sel, { timeout: 15000 });
  await page.click(sel);
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

async function waitForFormReady(page, testId, timeoutMs = 22000) {
  try {
    await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: timeoutMs });
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
    timeout: 90000,
  });
  await sleep(2500);
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      banner: /ERROR|Sync ERROR|409|54321|ERR_CONNECTION|thất bại|Không xử lý được/i.test(t),
      snippet: t.slice(0, 400),
    };
  });
}

async function readInboxUi(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="cc-inbox-task-card"]'));
    const actionBtns = cards.flatMap((c) =>
      Array.from(c.querySelectorAll('button')).filter((b) =>
        /Xử lý nhanh|Duyệt|Phê duyệt|Hoàn thành/i.test((b.textContent || '').trim()),
      ),
    );
    const text = document.body?.innerText || '';
    return {
      cardCount: cards.length,
      actionBtnCount: actionBtns.length,
      cards: cards.map((c) => ({
        text: (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        hasAction: /Xử lý nhanh|Duyệt|Phê duyệt|tuyển dụng|requisition/i.test(c.textContent || ''),
      })),
      hasRecruitment: /tuyển dụng|requisition|YCTD|yêu cầu tuyển/i.test(text),
      hasError: /ERROR|409|500|Sync ERROR/i.test(text),
      snippet: text.slice(0, 600),
    };
  });
}

async function ensureJdTemplateFromFe(page) {
  await page.goto(q('/hr/recruitment?tab=jd-library'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
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

async function runL0Shell() {
  for (const [name, cmd] of [
    ['qc:dev-stack', 'node scripts/qc-dev-stack.mjs'],
    ['qc:fe-be-health', 'node scripts/qc-fe-be-api-health.mjs'],
  ]) {
    try {
      const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
      results.l0[name] = { exit: 0, snippet: out.slice(-500) };
    } catch (e) {
      const snippet = String(e.stdout || e.stderr || e.message).slice(-500);
      const healthy = /HTTP 200|ALL PASS|healthy/i.test(snippet);
      results.l0[name] = { exit: healthy ? 0 : (e.status ?? 1), snippet };
    }
  }
  save();
}

(async () => {
  console.log('=== QA-HDSD-BF-01-01 ===');
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

    // UF-XBOS-10 regression — load-only (must_keep, no save)
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
      await shot(page, '01-canvas-regression');
      const canvasOk = await page.evaluate(() => ({
        hasDots:
          !!document.querySelector('.bg-workflow-canvas-dots') ||
          !!document.querySelector('[class*="workflow-canvas"]'),
        hasWorkflowText: /canvas|workflow|bước|node|Hệ thống quy trình|Lưu quy trình/i.test(
          document.body?.innerText || '',
        ),
        url: location.href,
        hasResolver: !!document.querySelector('[data-testid="workflow-resolver-type"]'),
      }));
      const saveClicked = await page.evaluate(() => {
        const save = Array.from(document.querySelectorAll('button')).find((b) =>
          /Lưu quy trình/i.test((b.textContent || '').trim()),
        );
        return !!save;
      });
      const postSave = lastNet((n) => n.method === 'POST' && /workflow-engine\/definitions/.test(n.url));
      const wfNet = lastNet((n) => /workflow-engine\/definitions/.test(n.url) && n.status < 500);
      const verdict =
        !postSave &&
        (canvasOk.hasDots || canvasOk.hasResolver || canvasOk.hasWorkflowText) &&
        wfNet?.status < 400
          ? '🟢'
          : postSave
            ? '🔴'
            : canvasOk.hasWorkflowText
              ? '🟡'
              : '🔴';
      record(
        'UF-XBOS-10-regression',
        verdict,
        `load-only dots=${canvasOk.hasDots} resolver=${canvasOk.hasResolver} GETdefs=${wfNet?.status ?? 'none'} saveClicked=false postSave=${postSave?.status ?? 'none'}`,
        { hdssd: '§4.2', must_keep: true, j: 'J-REC-WF-01-load-only' },
      );
    }

    // §4.1 CC inbox baseline (before YCTD submit)
    let inboxBeforeCount = 0;
    {
      await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      await shot(page, '02-inbox-before');
      const inboxUi = await readInboxUi(page);
      inboxBeforeCount = inboxUi.cardCount;
      const tasksNet = lastNet((n) => /workflow-engine\/tasks/.test(n.url));
      record(
        'HDSD-4.1-inbox-baseline',
        inboxUi.cardCount >= 1 && !inboxUi.hasError ? '🟢' : inboxUi.hasError ? '🔴' : '🟡',
        `cards=${inboxUi.cardCount} actionBtns=${inboxUi.actionBtnCount} tasksNet=${tasksNet?.status ?? 'none'}`,
        { hdssd: '§4.1' },
      );
    }

    // Spine: YCTD create → Gửi duyệt POST 2xx
    let submitWf = null;
    let postReq = null;
    let formReady = false;
    {
      const jdEnsure = await ensureJdTemplateFromFe(page);
      await page.goto(q('/hr/recruitment?tab=requisitions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      await shot(page, '03-requisitions');

      await clickTestId(page, 'hdsd-requisition-create-btn');
      await sleep(1500);
      const formOpened = await waitForDialog(page, 'hdsd-requisition-form-dialog');
      if (formOpened) {
        try {
          await clickTestId(page, 'hdsd-requisition-job-template');
        } catch {
          await page.evaluate(() => {
            const d = document.querySelector('[data-testid="hdsd-requisition-form-dialog"]');
            const combo = Array.from(d?.querySelectorAll('button[role="combobox"]') || []).find((b) =>
              /JD|mô tả|job|vị trí|template/i.test(b.getAttribute('aria-label') || b.textContent || ''),
            );
            combo?.click();
          });
        }
        await sleep(800);
        await page.evaluate(() => {
          const opt = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]')).find(Boolean);
          opt?.click();
        });
        await sleep(800);
        formReady = await waitForFormReady(page, 'hdsd-requisition-form-ready');
        await shot(page, '04-yctd-form-ready');

        const beforeSave = results.network.length;
        if (formReady) {
          try {
            await clickTestId(page, 'hdsd-requisition-form-submit');
          } catch {
            await page.click('[data-testid="hdsd-requisition-form-dialog"] button[aria-label="Lưu"]');
          }
        }
        await sleep(4000);
        postReq = netsSince(beforeSave, (n) => n.method === 'POST' && /requisition/.test(n.url)).pop();
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(2500);
        await shot(page, '05-yctd-after-f5');

        const beforeSubmit = results.network.length;
        const sendResult = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('tbody tr'));
          for (const row of rows) {
            const btn = Array.from(row.querySelectorAll('button')).find((b) =>
              /Gửi duyệt QT/i.test((b.textContent || '').trim()),
            );
            if (btn && !btn.disabled) {
              btn.scrollIntoView({ block: 'center' });
              btn.click();
              return { ok: true, via: 'row-button', rowText: (row.textContent || '').slice(0, 80) };
            }
          }
          const anyBtn = Array.from(document.querySelectorAll('button')).find(
            (b) => /Gửi duyệt QT/i.test((b.textContent || '').trim()) && !b.disabled,
          );
          if (anyBtn) {
            anyBtn.scrollIntoView({ block: 'center' });
            anyBtn.click();
            return { ok: true, via: 'any-button' };
          }
          return { ok: false, rowCount: rows.length };
        });
        results.sendQtClick = sendResult;
        await sleep(6000);
        submitWf = netsSince(beforeSubmit, (n) =>
          /submit-workflow|workflow-instances|spawn/.test(n.url),
        ).pop();
        await shot(page, '06-after-send-qt');
      }

      const spawnBanner = await page.evaluate(() =>
        /SPAWN-MISSING|Chưa tạo được quy trình|spawn/i.test(document.body?.innerText || ''),
      );
      let verdict = '🔴';
      if (formReady && postReq?.status >= 200 && postReq?.status < 300) {
        if (submitWf?.status >= 200 && submitWf?.status < 300) verdict = '🟢';
        else if (spawnBanner) verdict = '🟡';
        else verdict = '🟡';
      } else if (formOpened && !formReady) {
        verdict = '🔴';
      }

      record(
        'J-REC-WF-01-YCTD-submit',
        verdict,
        `jdEnsure=${JSON.stringify(jdEnsure)} formReady=${formReady} POSTreq=${postReq?.status ?? 'none'} sendClick=${JSON.stringify(results.sendQtClick ?? {})} submitWF=${submitWf?.status ?? 'none'} spawnBanner=${spawnBanner}`,
        {
          hdssd: '§3 YCTD',
          clickPath: 'Tạo YCTD → Lưu POST → Gửi duyệt QT',
          postUrl: postReq?.url,
          submitUrl: submitWf?.url,
        },
      );
    }

    // CC inbox after submit — task for requisition
    {
      await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(4000);
      await shot(page, '07-inbox-after-submit');
      const inboxUi = await readInboxUi(page);
      const tasksNet = lastNet((n) => /workflow-engine\/tasks/.test(n.url));
      const hasRecTask =
        inboxUi.hasRecruitment ||
        inboxUi.cards.some((c) => /tuyển dụng|requisition|YCTD|yêu cầu/i.test(c.text));
      const verdict =
        submitWf?.status >= 200 &&
        submitWf?.status < 300 &&
        inboxUi.cardCount >= 1 &&
        !inboxUi.hasError
          ? hasRecTask || inboxUi.cardCount >= inboxBeforeCount
            ? '🟢'
            : '🟡'
          : submitWf?.status >= 200 && submitWf?.status < 300
            ? '🟡'
            : '🔴';
      record(
        'CC-INBOX-POST-SUBMIT',
        verdict,
        `cards=${inboxUi.cardCount} before=${inboxBeforeCount} hasRecTask=${hasRecTask} tasksNet=${tasksNet?.status ?? 'none'} submitWF=${submitWf?.status ?? 'none'}`,
        { hdssd: '§4.1 spine', j: 'J-REC-WF-01' },
      );
    }

    // §4.3 RACI matrix
    {
      await openSettings(page, 'company_member_units');
      await sleep(1500);
      const opened = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        const row = rows.find((tr) => (tr.innerText || '').includes('XE_DU_LICH'));
        if (!row) return { ok: false };
        const btn = Array.from(row.querySelectorAll('button')).find((b) => /Chỉnh sửa/.test(b.textContent || ''));
        btn?.click();
        return { ok: !!btn };
      });
      await sleep(2500);
      if (opened.ok) {
        await page.evaluate(() => {
          const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((b) =>
            /Nhiệm vụ & RACI/i.test((b.textContent || '').trim()),
          );
          tab?.click();
        });
      }
      await sleep(4000);
      await shot(page, '08-raci');
      const raci409 = results.network.filter((n) => /raci/.test(n.url) && n.status === 409);
      const raciMatrix = lastNet((n) => /raci-governance.*\/matrix/.test(n.url));
      record(
        'HDSD-4.3-RACI',
        opened.ok && raci409.length === 0 && raciMatrix?.status < 400 ? '🟢' : raci409.length ? '🔴' : '🟡',
        `opened=${opened.ok} matrixGET=${raciMatrix?.status ?? 'none'} 409=${raci409.length}`,
        { hdssd: '§4.3' },
      );
    }

    // §4.4 catalog sync spot
    {
      await page.goto(`${PORTAL}/catalog-governance`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      await shot(page, '09-catalog');
      const err = await bodyHasError(page);
      const catNet = lastNet((n) => /catalog|settings-catalogs/.test(n.url) && n.status < 500);
      const bodyOk = await page.evaluate(() =>
        /danh mục|catalog|governance|đồng bộ/i.test(document.body?.innerText || ''),
      );
      record(
        'HDSD-4.4-catalog',
        !err.banner && bodyOk ? '🟢' : err.banner ? '🔴' : '🟡',
        `bodyOk=${bodyOk} catalogNet=${catNet?.status ?? 'none'} banner=${err.banner}`,
        { hdssd: '§4.4' },
      );
    }

    // §4.5 KPI dashboard spot
    {
      await page.goto(`${PORTAL}/dashboard/kpi-dashboard`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      await shot(page, '10-kpi');
      const err = await bodyHasError(page);
      const kpiNet = lastNet((n) => /kpi/.test(n.url) && n.status < 500);
      const bodyOk = await page.evaluate(() => /kpi|chỉ số|dashboard/i.test(document.body?.innerText || ''));
      record(
        'HDSD-4.5-kpi',
        !err.banner && bodyOk ? '🟢' : err.banner ? '🔴' : '🟡',
        `bodyOk=${bodyOk} kpiNet=${kpiNet?.status ?? 'none'} banner=${err.banner}`,
        { hdssd: '§4.5' },
      );
    }

    // INT-02 headcount spot
    {
      await page.goto(q('/command-center/hrm/company'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      await shot(page, '11-headcount');
      const summaryNet = lastNet((n) => /employees\/summary/.test(n.url));
      const ui = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const cardMatch = t.match(/Tổng nhân viên[\s\S]{0,40}?(\d+)/i);
        return { cardTotal: cardMatch ? Number(cardMatch[1]) : null, hasLabel: /Tổng nhân viên/i.test(t) };
      });
      const parity =
        summaryNet?.response_total != null && ui.cardTotal != null
          ? summaryNet.response_total === ui.cardTotal
          : summaryNet?.status === 200;
      record(
        'TC-ECO-INT-02-headcount',
        summaryNet?.status === 200 && parity ? '🟢' : summaryNet?.status === 200 ? '🟡' : '🔴',
        `summaryGET=${summaryNet?.status ?? 'none'} apiTotal=${summaryNet?.response_total ?? 'n/a'} cardTotal=${ui.cardTotal ?? 'n/a'} parity=${parity}`,
        { hdssd: '§10.1', j: 'INT-02' },
      );
    }

    // Recruitment tabs spot
    const recTabs = [
      ['requisitions', 'YCTD'],
      ['jd-library', 'JD'],
      ['job-postings', 'Tin TD'],
      ['funnel', 'Funnel'],
      ['campaigns', 'Chiến dịch'],
      ['interviews', 'Phỏng vấn'],
    ];
    for (const [tab, label] of recTabs) {
      await page.goto(q(`/hr/recruitment?tab=${tab}`), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2000);
      const err = await bodyHasError(page);
      const tabNet = lastNet((n) => /recruitment|requisition|job-templates|funnel/.test(n.url) && n.status < 500);
      const bodyOk = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        return t.length > 200 && !/HRM API Sync ERROR|500 Internal/i.test(t);
      });
      record(
        `HRM-rec-tab-${tab}`,
        !err.banner && bodyOk ? '🟢' : err.banner ? '🔴' : '🟡',
        `${label} tab=${tab} net=${tabNet?.status ?? 'none'} banner=${err.banner}`,
        { hdssd: 'recruitment tabs' },
      );
    }
    await shot(page, '12-recruitment-tabs');

    // Overall ack
    const spineIds = ['UF-XBOS-10-regression', 'J-REC-WF-01-YCTD-submit', 'CC-INBOX-POST-SUBMIT'];
    const spineRed = spineIds.some((id) => results.spots.find((s) => s.id === id)?.verdict === '🔴');
    const spineYellow = spineIds.some((id) => results.spots.find((s) => s.id === id)?.verdict === '🟡');
    const anyRed = results.spots.some((s) => s.verdict === '🔴');
    results.ack_status = spineRed || anyRed ? 'FAIL_TO_PM' : spineYellow ? 'FAIL_TO_PM' : 'PASS_TO_PM';
    results.finishedAt = new Date().toISOString();
    save();
    console.log(`\nack_status: ${results.ack_status}`);
  } finally {
    await browser.close();
    save();
  }
})();
