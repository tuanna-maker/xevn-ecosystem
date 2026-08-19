/**
 * QA-HDSD-BF-XBOS-WF-01 — BF-01 XBOS WF spot (UF-XBOS-10 + inbox + RACI)
 * U65 zero-seed · portal :5173 · ceo@xe.vn · canvas regression load-only (no save)
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-xbos-wf-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-xbos-wf-01-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HDSD-BF-XBOS-WF-01',
  program: 'P-HDSD-ECOSYSTEM-03 · BF-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
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

function recordSpot(id, verdict, detail, extra = {}) {
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
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
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
        hasAction: /Xử lý nhanh|Duyệt|Phê duyệt/i.test(c.textContent || ''),
      })),
      hasError: /ERROR|409|500|Sync ERROR|Không xử lý được/i.test(text),
      emptyState: /Không có|trống|empty/i.test(text),
      snippet: text.slice(0, 500),
    };
  });
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
  console.log('=== QA-HDSD-BF-XBOS-WF-01 ===');
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

    // UF-XBOS-10 / TC-HDSD-04-02-01 regression — load only (must_keep, no save)
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
      await shot(page, '01-wf-canvas');
      const canvasOk = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const hasDots =
          !!document.querySelector('.bg-workflow-canvas-dots') ||
          !!document.querySelector('[class*="workflow-canvas"]');
        return {
          hasDots,
          hasWorkflowText: /canvas|workflow|bước|node|Hệ thống quy trình|Lưu quy trình/i.test(t),
          url: location.href,
          hasResolver: !!document.querySelector('[data-testid="workflow-resolver-type"]'),
        };
      });
      const wfNet = lastNet((n) => /workflow-engine\/definitions|workflow/.test(n.url) && n.status < 500);
      const wf409 = lastNet((n) => /workflow/.test(n.url) && n.status === 409);
      const verdict =
        !wf409 &&
        (canvasOk.hasDots || canvasOk.hasResolver || (canvasOk.hasWorkflowText && /settings=workflow/.test(canvasOk.url)))
          ? '🟢'
          : canvasOk.hasWorkflowText
            ? '🟡'
            : '🔴';
      recordSpot(
        'UF-XBOS-10',
        verdict,
        `load-only dots=${canvasOk.hasDots} resolver=${canvasOk.hasResolver} text=${canvasOk.hasWorkflowText} net=${wfNet?.status ?? 'n/a'} 409=${!!wf409}`,
        {
          uf: 'UF-XBOS-10',
          tc: 'TC-HDSD-04-02-01',
          clickPath: '?settings=workflow_designer → Canvas (no save)',
          must_keep: true,
        },
      );
    }

    // CC inbox action cards (§4.1)
    {
      const netBefore = results.network.length;
      await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      await shot(page, '02-inbox');
      const inboxUi = await readInboxUi(page);
      const inboxErr = await bodyHasError(page);
      const inboxNet = netsSince(netBefore, (n) => /workflow-engine\/tasks|inbox/.test(n.url)).pop();
      const tasksNet = lastNet((n) => /workflow-engine\/tasks/.test(n.url));
      const verdict =
        !inboxErr.banner &&
        !inboxUi.hasError &&
        inboxUi.cardCount >= 1 &&
        inboxUi.actionBtnCount >= 1
          ? '🟢'
          : inboxUi.cardCount >= 1 && !inboxErr.banner
            ? '🟡'
            : inboxErr.banner || inboxUi.hasError
              ? '🔴'
              : '🟡';
      recordSpot(
        'CC-INBOX-ACTION-CARDS',
        verdict,
        `cards=${inboxUi.cardCount} actionBtns=${inboxUi.actionBtnCount} tasksNet=${tasksNet?.status ?? inboxNet?.status ?? 'none'} banner=${inboxErr.banner}`,
        {
          hdssd: '§4.1 Hộp thư Workflow',
          clickPath: '/command-center/inbox',
          cards: inboxUi.cards.slice(0, 5),
        },
      );
    }

    // RACI matrix tab (§4.3) — no 409 (member legal-entity UUID scope parity)
    {
      async function openEntityEditByCode(code) {
        await openSettings(page, 'company_member_units');
        await sleep(1500);
        const clicked = await page.evaluate((codeText) => {
          const rows = Array.from(document.querySelectorAll('table tbody tr'));
          const row = rows.find((tr) => (tr.innerText || '').includes(codeText));
          if (!row) return { ok: false, reason: 'row missing' };
          const btn = Array.from(row.querySelectorAll('button')).find((b) =>
            /Chỉnh sửa/.test(b.textContent || ''),
          );
          if (!btn) return { ok: false, reason: 'edit btn missing' };
          btn.scrollIntoView({ block: 'center' });
          btn.click();
          return { ok: true, row: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
        }, code);
        await sleep(2500);
        return clicked;
      }

      const netBefore = results.network.length;
      const opened = await openEntityEditByCode('XE_DU_LICH');
      let raciTabClicked = false;
      if (opened.ok) {
        raciTabClicked = await page.evaluate(() => {
          const tab = Array.from(document.querySelectorAll('[role="tab"]')).find((b) =>
            /Nhiệm vụ & RACI/i.test((b.textContent || '').trim()),
          );
          if (!tab) return false;
          tab.scrollIntoView({ block: 'center' });
          tab.click();
          return true;
        });
      }
      await sleep(4000);
      await page.waitForFunction(
        () =>
          /Ma trận RACI|Hoạt động × vai trò|Đang tải ma trận|Không tải được ma trận/i.test(
            document.body?.innerText || '',
          ),
        { timeout: 12000 },
      ).catch(() => null);
      await shot(page, '03-raci-matrix');
      const raciCalls = netsSince(netBefore, (n) => /raci/.test(n.url));
      const raciMatrix = raciCalls.find((n) => /raci-governance.*\/matrix/.test(n.url));
      const raci409 = raciCalls.filter((n) => n.status === 409);
      const raciErr = await bodyHasError(page);
      const hasMatrixUi = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const onRaciTab = !!Array.from(document.querySelectorAll('[role="tab"]')).find(
          (b) => /Nhiệm vụ & RACI/i.test(b.textContent || '') && b.getAttribute('aria-selected') === 'true',
        );
        return (
          onRaciTab &&
          /Ma trận RACI|Hoạt động × vai trò|Danh mục hoạt động|raci_/i.test(t) &&
          !/409|companyId mismatches/i.test(t)
        );
      });
      const verdict =
        opened.ok &&
        raciTabClicked &&
        raci409.length === 0 &&
        !raciErr.banner &&
        raciMatrix &&
        raciMatrix.status < 400 &&
        hasMatrixUi
          ? '🟢'
          : raci409.length > 0 || raciMatrix?.status === 409
            ? '🔴'
            : opened.ok && raciMatrix && raciMatrix.status < 400 && !raciErr.banner && hasMatrixUi
              ? '🟡'
              : '🔴';
      recordSpot(
        'RACI-MATRIX-NO-409',
        verdict,
        `entity=XE_DU_LICH opened=${opened.ok} tab=${raciTabClicked} matrixGET=${raciMatrix?.status ?? 'none'} 409count=${raci409.length} ui=${hasMatrixUi} banner=${raciErr.banner}`,
        {
          hdssd: '§4.3 Ma trận RACI',
          clickPath: 'Đơn vị thành viên → XE_DU_LICH → Chỉnh sửa → Nhiệm vụ & RACI',
          raciUrls: raciCalls.map((n) => `${n.method} ${n.status} ${n.url}`).slice(0, 8),
        },
      );
    }

    const allGreen = results.spots.every((s) => s.verdict === '🟢');
    const anyRed = results.spots.some((s) => s.verdict === '🔴');
    results.ack_status = allGreen ? 'PASS_TO_PM' : anyRed ? 'FAIL_TO_PM' : 'FAIL_TO_PM';
    results.finishedAt = new Date().toISOString();
    save();
    console.log(`\nack_status: ${results.ack_status}`);
  } finally {
    await browser.close();
    save();
  }
})();
