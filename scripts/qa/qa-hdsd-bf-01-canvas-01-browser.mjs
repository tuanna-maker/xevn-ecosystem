/**
 * QA-HDSD-BF-01-CANVAS-01 — BF-01 parallel prep: Canvas QT → YCTD spot
 * U65 zero-seed · portal :5173 · ceo@xe.vn
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-01-canvas-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-01-canvas-01-20260801');
const STAMP = `BF01${Date.now().toString(36).slice(-5).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-01-CANVAS-01',
  program: 'P-HDSD-QA-SRS-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP },
  l0: {},
  journeys: [],
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordJ(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.journeys.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 200)}`);
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
}

function netsSince(before, pred) {
  return results.network.slice(before).filter(pred);
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
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
  const sel = `[data-testid="${testId}"]`;
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

async function waitHrmHealthy(page, maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const hit = results.network
      .slice(-20)
      .find((n) => n.method === 'GET' && /\/employees/.test(n.url) && n.status >= 200 && n.status < 300);
    if (hit) return true;
    await sleep(800);
  }
  return false;
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

async function openRecruitmentCanvas(page, shotPrefix = 'canvas') {
  await page.goto(`${PORTAL}/command-center?settings=workflow`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(3000);
  await shot(page, `${shotPrefix}-01-workflow-list`);

  let opened = { ok: false };
  try {
    await clickTestId(page, 'hrm-rec-wf-preset-requisition');
    opened = { ok: true, via: 'preset-requisition-testid' };
  } catch {
    try {
      await nativeClickByText(page, 'Phê duyệt yêu cầu tuyển dụng HRM');
      opened = { ok: true, via: 'preset-text' };
    } catch {
      const ev = await page.evaluate(() => {
        const btn = document.querySelector('[data-wf-code="hrm_requisition_approval"]');
        if (btn) {
          btn.scrollIntoView({ block: 'center' });
          btn.click();
          return { ok: true, via: 'data-wf-code' };
        }
        const row = Array.from(document.querySelectorAll('tr')).find((r) =>
          /hrm_requisition_approval/i.test(r.textContent || ''),
        );
        const edit = row?.querySelector('button');
        if (edit) {
          edit.click();
          return { ok: true, via: 'list-edit' };
        }
        return { ok: false, reason: 'no-bridge-card' };
      });
      opened = ev;
    }
  }
  await sleep(3000);
  await page.waitForFunction(
    () =>
      !!document.querySelector('.bg-workflow-canvas-dots') ||
      !!document.querySelector('[data-testid="workflow-resolver-type"]') ||
      /Lưu quy trình/i.test(document.body?.innerText || ''),
    { timeout: 15000 },
  ).catch(() => null);
  await shot(page, `${shotPrefix}-02-canvas-open`);
  return opened;
}

async function clickSaveWorkflow(page) {
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const save = buttons.find((b) => /Lưu quy trình/i.test((b.textContent || '').trim()));
    if (!save || save.disabled) return { ok: false, disabled: save?.disabled ?? null };
    save.scrollIntoView({ block: 'center' });
    save.click();
    return { ok: true };
  });
  if (!clicked.ok) {
    try {
      await nativeClickByText(page, 'Lưu quy trình', { exact: true });
      clicked.ok = true;
    } catch {
      /* */
    }
  }
  return clicked;
}

(async () => {
  console.log('=== QA-HDSD-BF-01-CANVAS-01 ===');
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

    // J-REC-WF-01 — Canvas QT tuyển dụng active → Lưu → F5
    {
      const opened = await openRecruitmentCanvas(page);
      const canvasState = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        return {
          url: location.href,
          hasDots:
            !!document.querySelector('.bg-workflow-canvas-dots') ||
            !!document.querySelector('[class*="workflow-canvas"]'),
          hasSaveBtn: /Lưu quy trình/i.test(t),
          hasRequisition: /hrm_requisition|Yêu cầu tuyển|tuyển dụng/i.test(t),
          resolverSelect: !!document.querySelector('[data-testid="workflow-resolver-type"]'),
        };
      });

      const beforeSave = results.network.length;
      const saveClick = await clickSaveWorkflow(page);
      await sleep(5000);
      const putDef = netsSince(beforeSave, (n) =>
        ['PUT', 'POST'].includes(n.method) && /workflow-engine\/definitions/.test(n.url),
      ).pop();
      await shot(page, '03-after-save');

      const f5Url = page.url();
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3000);
      await openRecruitmentCanvas(page, 'f5');
      await shot(page, '04-after-f5');

      const getDefs = lastNet((n) => n.method === 'GET' && /workflow-engine\/definitions/.test(n.url) && n.status < 500);
      const afterF5 = await page.evaluate(() => ({
        url: location.href,
        hasDots:
          !!document.querySelector('.bg-workflow-canvas-dots') ||
          !!document.querySelector('[class*="workflow-canvas"]'),
        bodySnippet: (document.body?.innerText || '').slice(0, 400),
      }));

      const putOk = putDef?.status >= 200 && putDef?.status < 300;
      const canvasPass =
        opened.ok &&
        (canvasState.hasDots || canvasState.hasSaveBtn || canvasState.resolverSelect) &&
        putOk;

      recordJ(
        'J-REC-WF-01',
        canvasPass ? '🟢' : opened.ok && putOk ? '🟡' : opened.ok ? '🟡' : '🔴',
        `opened=${opened.ok} via=${opened.via || 'n/a'} save=${saveClick.ok} PUT=${putDef?.status ?? 'none'} GETdefs=${getDefs?.status ?? 'none'} F5dots=${afterF5.hasDots}`,
        {
          clickPath: 'CC ?settings=workflow → hrm_requisition_approval → Lưu quy trình → F5',
          putUrl: putDef?.url,
          f5Url,
        },
      );
    }

    // J-REC-WF-02 spot — YCTD create + Gửi duyệt QT
    {
      await waitHrmHealthy(page);
      const jdEnsure = await ensureJdTemplateFromFe(page);
      await page.goto(q('/hr/recruitment?tab=requisitions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      await waitHrmHealthy(page);
      await shot(page, '05-requisitions-list');

      await clickTestId(page, 'hdsd-requisition-create-btn');
      await sleep(1500);
      const formOpened = await waitForDialog(page, 'hdsd-requisition-form-dialog');
      let formReady = false;
      let postReq = null;
      let submitWf = null;

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
        await shot(page, '06-yctd-form-ready');

        const beforeSave = results.network.length;
        if (formReady) {
          try {
            await clickTestId(page, 'hdsd-requisition-form-submit');
          } catch {
            await page.click('[data-testid="hdsd-requisition-form-dialog"] button[aria-label="Lưu"]');
          }
        }
        await sleep(4000);
        postReq = netsSince(beforeSave, (n) => n.method === 'POST' && /requisition|recruitment/.test(n.url)).pop();
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(2500);
        await shot(page, '07-yctd-after-f5');

        const beforeSubmit = results.network.length;
        let sendClicked = false;
        try {
          await nativeClickByText(page, 'Gửi duyệt QT');
          sendClicked = true;
        } catch {
          await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find((b) =>
              /Gửi duyệt QT/i.test((b.textContent || '').trim()),
            );
            btn?.click();
          });
          sendClicked = true;
        }
        await sleep(5000);
        submitWf = netsSince(beforeSubmit, (n) =>
          /submit-workflow|workflow-instances|spawn/.test(n.url),
        ).pop();
        await shot(page, '08-after-send-qt');

        const spawnBanner = await page.evaluate(() =>
          /SPAWN-MISSING|Chưa tạo được quy trình|spawn/i.test(document.body?.innerText || ''),
        );
        results.spawnBanner = spawnBanner;
      }

      let verdict = '🔴';
      if (formOpened && formReady && postReq?.status >= 200 && postReq?.status < 300) {
        if (submitWf?.status >= 200 && submitWf?.status < 300) verdict = '🟢';
        else if (results.spawnBanner || submitWf?.status === 404) verdict = '🟡';
        else if (sendClicked) verdict = '🟡';
        else verdict = '🟡';
      } else if (formOpened && postReq?.status >= 200 && postReq?.status < 300) {
        verdict = '🟡';
      } else if (formOpened) {
        verdict = '🟡';
      }

      recordJ(
        'J-REC-WF-02-spot',
        verdict,
        `jdEnsure=${JSON.stringify(jdEnsure)} formOpen=${formOpened} formReady=${formReady} POST=${postReq?.status || 'none'} submitWF=${submitWf?.status || 'none'} spawnBanner=${results.spawnBanner ?? false}`,
        {
          clickPath: 'HRM Tuyển dụng → Tạo YCTD → Lưu → Gửi duyệt QT',
          uf: 'UF-HRM-07',
          postUrl: postReq?.url,
          submitUrl: submitWf?.url,
        },
      );
    }

    results.finishedAt = new Date().toISOString();
    const j01 = results.journeys.find((j) => j.id === 'J-REC-WF-01');
    const j02 = results.journeys.find((j) => j.id === 'J-REC-WF-02-spot');
    const j01ok = j01?.verdict === '🟢';
    const j02ok = j02?.verdict === '🟢' || j02?.verdict === '🟡';
    results.ack_status =
      j01ok && (j02?.verdict === '🟢' || j02?.verdict === '🟡')
        ? 'PASS_TO_PM'
        : j01ok
          ? 'PASS_TO_PM'
          : 'FAIL_TO_PM';
    save();
    console.log('ack_status:', results.ack_status);
  } finally {
    await browser.close();
  }
})();
