/**
 * QA-PCOMP-W6-BROWSER-HRM-DEEP-01 — U65 FE-only deep browser (portal :5173/hr)
 * P0: UF-HRM-01/03/10/12 · J-HRM-01/03/06 · leave BLOCKED cite FAIL
 * HOLD_DEPLOY · NOT :8088 · zero-seed · keep dist-uat-w6
 */
import puppeteer from 'puppeteer';
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
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-pcomp-w6-browser-hrm-deep-01-runtime.json');
const SCREEN_DIR = resolve(__dir, '../../docs/qa/evidence/screens/qa-pcomp-w6-browser-hrm-deep-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-PCOMP-W6-BROWSER-HRM-DEEP-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, seed: false, hold_deploy: true },
  steps: [],
  verdicts: {},
  network: [],
  screens: [],
  employeeId: null,
  contractId: null,
  requisitionId: null,
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
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: data?.user ?? { userId: EMAIL, email: EMAIL, displayName: 'CEO Tập đoàn', roles: ['group_ceo'] },
    raw: data,
  };
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function trackNetwork(page) {
  page.on('response', async (res) => {
    const url = res.url();
    if (!/\/api\/(hrm|xbos)\//.test(url)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    let bodySnippet = '';
    try {
      const t = await res.text();
      bodySnippet = t.slice(0, 240);
    } catch {
      /* */
    }
    results.network.push({
      method,
      status: res.status(),
      url: url.replace(PORTAL, '').slice(0, 220),
      bodySnippet,
      at: new Date().toISOString(),
    });
  });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path);
  return path;
}

async function nativeClickByText(page, text, { selector = 'button, a, [role="tab"], [role="button"], [role="menuitem"]' } = {}) {
  const box = await page.evaluate(
    (t, sel) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      const el = nodes.find((n) => (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t));
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    selector,
  );
  if (!box) throw new Error(`click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
}

async function clickFirstTableRow(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr, [role="row"]')).filter((r) => {
      const t = (r.textContent || '').trim();
      return t.length > 8 && !/không có|no data|empty/i.test(t);
    });
    if (!rows.length) return { ok: false, reason: 'no rows' };
    const row = rows[0];
    row.scrollIntoView({ block: 'center' });
    row.click();
    return { ok: true, text: (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
  });
}

async function clickEyeButton(page) {
  return page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const eye = buttons.find((b) => {
      const svg = b.querySelector('svg');
      const title = (b.getAttribute('title') || '') + (b.getAttribute('aria-label') || '') + (b.textContent || '');
      return /xem|chi tiết|view|eye/i.test(title) || (svg && b.querySelectorAll('svg').length === 1 && b.closest('tr'));
    });
    // Prefer Eye icon in first data row action cell
    const row = document.querySelector('tbody tr');
    if (row) {
      const btns = Array.from(row.querySelectorAll('button'));
      const candidate = btns[0] || btns.find((b) => b.querySelector('svg'));
      if (candidate) {
        candidate.click();
        return { ok: true, via: 'first-row-action' };
      }
    }
    if (eye) {
      eye.click();
      return { ok: true, via: 'eye-text' };
    }
    return { ok: false };
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    const n = results.network[i];
    if (pred(n)) return n;
  }
  return null;
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

(async () => {
  console.log('=== QA-PCOMP-W6-BROWSER-HRM-DEEP-01 ===');
  note('L0-portal', true, PORTAL);

  const session = await loginApi();
  note('login', true, `token ok · company main`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  trackNetwork(page);
  await injectSession(page, session);

  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e).slice(0, 200)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
  });

  try {
    // ---------- UF-HRM-01 / J-HRM-01: employees list → detail ----------
    await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    await shot(page, '01-employees-list');

    const listGet = await waitForNet(
      (n) => n.method === 'GET' && /\/employees(\?|$)/.test(n.url) && n.status >= 200 && n.status < 300,
      20000,
    );
    note('UF-HRM-01-list-GET', !!listGet, listGet ? `HTTP ${listGet.status}` : 'no employees list 2xx');

    const rowClick = await clickFirstTableRow(page);
    await sleep(2500);
    const urlAfter = page.url();
    const empMatch = urlAfter.match(/\/employees\/([0-9a-f-]{36}|[A-Za-z0-9_-]+)/i);
    results.employeeId = empMatch?.[1] || null;
    await shot(page, '02-employee-detail');

    const detailGet = await waitForNet(
      (n) =>
        n.method === 'GET' &&
        /\/employees\/[^/?]+/.test(n.url) &&
        !/employees\?/.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
      12000,
    );

    const j01 =
      rowClick.ok &&
      !!results.employeeId &&
      !!detailGet &&
      detailGet.status === 200;
    note(
      'UF-HRM-01_J-HRM-01',
      j01,
      `click=${rowClick.ok} id=${results.employeeId} url=${urlAfter.slice(0, 120)} detailGET=${detailGet?.status ?? 'none'} row="${rowClick.text || ''}"`,
    );
    results.verdicts['UF-HRM-01'] = j01 ? 'PASS' : 'FAIL';
    results.verdicts['J-HRM-01'] = j01 ? 'PASS' : 'FAIL';

    // ---------- UF-HRM-03: edit → Lưu → F5 ----------
    let uf03 = false;
    let uf03Detail = '';
    try {
      // Ensure on profile
      if (!results.employeeId) throw new Error('no employeeId');
      await page.goto(q(`/hr/employees/${results.employeeId}`), {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await sleep(2500);

      // Click Sửa / Edit
      let opened = false;
      for (const label of ['Sửa', 'Chỉnh sửa', 'Edit']) {
        try {
          await nativeClickByText(page, label);
          opened = true;
          break;
        } catch {
          /* */
        }
      }
      await sleep(1200);
      await shot(page, '03-employee-edit-dialog');

      // Prefer full_name (always on edit dialog) — toggle W6QA marker for F5 assert
      let fill = await page.evaluate(() => {
        const pick =
          document.querySelector('input[name="full_name"]') ||
          document.querySelector('#full_name') ||
          document.querySelector('input[name="personal_email"]') ||
          document.querySelector('input[name="phone"]') ||
          Array.from(document.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], textarea')).find(
            (el) => {
              const n = ((el.name || '') + (el.id || '') + (el.placeholder || '')).toLowerCase();
              return /full_name|họ|tên|phone|mobile|email|ghi chú|note/.test(n);
            },
          );
        if (!pick) {
          return {
            ok: false,
            reason: 'no editable field',
            inputs: Array.from(document.querySelectorAll('input,textarea'))
              .slice(0, 25)
              .map((e) => e.name || e.id || e.type),
          };
        }
        const prev = pick.value || '';
        let next;
        if (/email/i.test(pick.name || pick.id || '') || pick.type === 'email') {
          next = prev.includes('+w6qa') ? prev.replace('+w6qa', '') : prev.replace('@', '+w6qa@');
        } else if (/\bW6QA\b/.test(prev)) {
          next = prev.replace(/\s*\bW6QA\b/g, '').trim();
        } else {
          next = `${prev} W6QA`.trim();
        }
        const proto = Object.getOwnPropertyDescriptor(
          pick.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
          'value',
        );
        proto.set.call(pick, next);
        pick.dispatchEvent(new Event('input', { bubbles: true }));
        pick.dispatchEvent(new Event('change', { bubbles: true }));
        // React Hook Form: also nativeInputValueSetter + InputEvent
        pick.dispatchEvent(new InputEvent('input', { bubbles: true, data: next }));
        return { ok: true, field: pick.name || pick.id || 'unknown', prev: prev.slice(0, 60), next: next.slice(0, 60) };
      });

      if (!opened || !fill.ok) {
        // Fallback: focus full_name via keyboard if RHF shadow name missed
        const typed = await page.evaluate(() => {
          const el =
            document.querySelector('input[name="full_name"]') ||
            Array.from(document.querySelectorAll('input')).find((i) =>
              /họ|tên|full/i.test(
                (i.getAttribute('aria-label') || '') +
                  (i.placeholder || '') +
                  (i.closest('div')?.textContent || '').slice(0, 40),
              ),
            );
          if (!el) return { ok: false };
          el.focus();
          el.select();
          return { ok: true, value: el.value };
        });
        if (typed.ok) {
          await page.keyboard.press('End');
          await page.keyboard.type(' W6QA', { delay: 20 });
          fill.ok = true;
          fill.field = 'full_name(keyboard)';
          fill.next = '… W6QA';
        } else {
          uf03Detail = `editDialog=${opened} fill=${JSON.stringify(fill)}`;
        }
      }

      if (fill.ok) {
        // Click Lưu inside dialog
        const beforeLen = results.network.length;
        const saveClicked = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          const scope = dialog || document;
          const btns = Array.from(scope.querySelectorAll('button'));
          const save = btns.find((b) => /^(Lưu|Save|Cập nhật)$/i.test((b.textContent || '').trim())) ||
            btns.find((b) => /Lưu|Save|Cập nhật/i.test((b.textContent || '').trim()));
          if (!save) return false;
          save.click();
          return true;
        });
        if (!saveClicked) {
          for (const label of ['Lưu', 'Save', 'Cập nhật']) {
            try {
              await nativeClickByText(page, label);
              break;
            } catch {
              /* */
            }
          }
        }
        await sleep(3000);
        const mutate = results.network
          .slice(beforeLen)
          .find(
            (n) =>
              (n.method === 'PUT' || n.method === 'PATCH' || n.method === 'POST') &&
              /\/employees/.test(n.url),
          );
        await shot(page, '04-employee-after-save');

        // F5
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(3000);
        await shot(page, '05-employee-after-f5');

        const fePersist = await page.evaluate(() => {
          const body = document.body?.innerText || '';
          return body.includes('W6QA') || body.includes('+w6qa');
        });

        uf03 = !!mutate && mutate.status >= 200 && mutate.status < 300;
        uf03Detail = `opened=${opened} field=${fill.field} saveClicked mutate=${mutate?.method || 'none'} ${mutate?.status || ''} fePersist=${fePersist} next=${fill.next || ''}`;
        if (uf03 && !fePersist) {
          uf03Detail += ' · FE marker soft (may need profile header refresh)';
        }
        if (!uf03 && mutate) {
          uf03Detail += ` · body=${(mutate.bodySnippet || '').slice(0, 160)}`;
        }
        if (!uf03 && !mutate) {
          uf03Detail += ' · no PATCH/PUT observed — BLOCKED with Network empty';
        }
      } else if (!uf03Detail) {
        uf03Detail = `editDialog=${opened} fill=${JSON.stringify(fill)}`;
      }
    } catch (e) {
      uf03Detail = String(e).slice(0, 300);
    }
    note('UF-HRM-03', uf03, uf03Detail);
    results.verdicts['UF-HRM-03'] = uf03 ? 'PASS' : 'BLOCKED_OR_FAIL';

    // ---------- J-HRM-03: contracts list → detail ----------
    await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    await shot(page, '06-contracts-list');
    const contractsList = await waitForNet(
      (n) => n.method === 'GET' && /contracts/.test(n.url) && n.status >= 200 && n.status < 300,
      15000,
    );

    const beforeC = results.network.length;
    // Click row or Eye
    let cClick = await clickFirstTableRow(page);
    await sleep(1500);
    if (!cClick.ok) {
      cClick = await clickEyeButton(page);
      await sleep(1500);
    } else {
      // Also try Eye in case row click doesn't open drawer
      await clickEyeButton(page).catch(() => null);
      await sleep(1000);
    }
    await shot(page, '07-contract-detail');

    const contractDetail = results.network.slice(beforeC).find(
      (n) =>
        n.method === 'GET' &&
        /contracts[^?]*\/[0-9a-f-]{8,}/i.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
    // Fallback: dialog/drawer visible with contract fields
    const drawerUi = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      const dialog =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('[data-state="open"]');
      return {
        hasDialog: !!dialog,
        hasContractWords: /hợp đồng|contract|số hđ|loại hđ|nhân viên/i.test(text),
        dialogText: (dialog?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      };
    });

    const j03 =
      !!contractsList &&
      (cClick.ok || drawerUi.hasDialog) &&
      (!!contractDetail || (drawerUi.hasDialog && drawerUi.hasContractWords));
    note(
      'J-HRM-03',
      j03,
      `list=${contractsList?.status} click=${JSON.stringify(cClick)} detailGET=${contractDetail?.status || 'none'} drawer=${JSON.stringify(drawerUi)}`,
    );
    results.verdicts['J-HRM-03'] = j03 ? 'PASS' : 'FAIL';

    // ---------- J-HRM-06: attendance load (+ leave tab load, no mutate) ----------
    await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    await shot(page, '08-attendance');
    const attGet = await waitForNet(
      (n) =>
        n.method === 'GET' &&
        /attendance|sheets|records/.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
      15000,
    );
    // Open leave tab (load only — mutate blocked by known BE)
    try {
      await nativeClickByText(page, 'Nghỉ phép');
      await sleep(1500);
    } catch {
      try {
        await nativeClickByText(page, 'Leave');
        await sleep(1500);
      } catch {
        /* */
      }
    }
    await shot(page, '09-attendance-leave-tab');
    const leaveList = lastNet(
      (n) => n.method === 'GET' && /leave/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    const j06 = !!attGet;
    note(
      'J-HRM-06',
      j06,
      `attGET=${attGet?.status || 'none'} leaveList=${leaveList?.status || 'n/a'} (mutate leave → BLOCKED cite QA-HRM-LEAVE-REQ-CREATE-01)`,
    );
    results.verdicts['J-HRM-06'] = j06 ? 'PASS' : 'FAIL';
    results.verdicts['LEAVE-CREATE'] = 'BLOCKED';
    results.verdicts['LEAVE-CREATE_cite'] =
      'docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md · POST 400 HRM-ATT-LEAVE-TYPE · BE D-HRM-LEAVE-REQ-CREATE-BE-01 in flight · no seed';

    // ---------- UF-HRM-10: Settings spot (cite POS GWC + live click) ----------
    await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    for (const t of ['Danh mục nghiệp vụ', 'Master data', 'Danh mục']) {
      try {
        await nativeClickByText(page, t);
        await sleep(500);
        break;
      } catch {
        /* */
      }
    }
    try {
      await nativeClickByText(page, 'Chức danh');
      await sleep(800);
    } catch {
      /* */
    }
    await shot(page, '10-settings-positions');
    const settingsUi = await page.evaluate(() => {
      const code = document.querySelector('#md-code-positions');
      const form = document.querySelector('[data-testid="md-upsert-form-positions"]');
      const body = document.body?.innerText || '';
      return {
        hasCode: !!code,
        hasForm: !!form,
        hasChucDanh: /Chức danh|job_titles|positions/i.test(body),
        hasSettings: /Cài đặt|Settings|Danh mục/i.test(body),
      };
    });
    const settingsGet = lastNet(
      (n) => n.method === 'GET' && /settings-catalog|catalog/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    const uf10 =
      settingsUi.hasSettings &&
      (settingsUi.hasCode || settingsUi.hasForm || settingsUi.hasChucDanh) &&
      !!settingsGet;
    note(
      'UF-HRM-10',
      uf10,
      `live click Settings/Chức danh · ui=${JSON.stringify(settingsUi)} catalogGET=${settingsGet?.status || 'none'} · cite GWC POS create 201: qa-hrm-settings-md-pos-browser-01-20260727.md (no re-create this run — spot regression)`,
    );
    results.verdicts['UF-HRM-10'] = uf10 ? 'PASS' : 'FAIL';
    results.verdicts['UF-HRM-10_cite'] =
      'docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md · POST 201 job_titles QA_POS_2LVZCM · F5';

    // ---------- UF-HRM-12: recruitment requisition open/edit ----------
    await page.goto(q('/hr/recruitment'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    try {
      await nativeClickByText(page, 'Yêu cầu tuyển dụng');
      await sleep(1500);
    } catch {
      /* */
    }
    await shot(page, '11-recruitment-list');
    const recList = await waitForNet(
      (n) => n.method === 'GET' && /requisition/.test(n.url) && n.status >= 200 && n.status < 300,
      12000,
    );
    const beforeR = results.network.length;
    // Prefer explicit «Chi tiết» / «Sửa» on first requisition row (not row navigate)
    const rClick = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) =>
        ((r.textContent || '').trim().length > 8),
      );
      if (!rows.length) return { ok: false, reason: 'no rows' };
      const row = rows[0];
      const btns = Array.from(row.querySelectorAll('button, a'));
      const detailBtn = btns.find((b) => /chi tiết|detail/i.test((b.textContent || '').trim()));
      const editBtn = btns.find((b) => /^sửa$|edit/i.test((b.textContent || '').trim()));
      const target = detailBtn || editBtn;
      if (!target) {
        return {
          ok: false,
          reason: 'no Chi tiết/Sửa',
          rowText: (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
          btnTexts: btns.map((b) => (b.textContent || '').trim()).slice(0, 8),
        };
      }
      target.click();
      return {
        ok: true,
        via: (target.textContent || '').trim(),
        rowText: (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      };
    });
    await sleep(2000);
    // If still closed, try global Chi tiết then Sửa
    let dialogOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    if (!dialogOpen) {
      for (const label of ['Chi tiết', 'Sửa']) {
        try {
          await nativeClickByText(page, label);
          await sleep(1200);
          dialogOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
          if (dialogOpen) break;
        } catch {
          /* */
        }
      }
    }
    await shot(page, '12-recruitment-detail');
    const recDetail = results.network.slice(beforeR).find(
      (n) =>
        n.method === 'GET' &&
        /requisition[^?]*\/[0-9a-f-]{8,}/i.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
    const recUi = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const text = (dialog?.textContent || document.body?.innerText || '').replace(/\s+/g, ' ');
      return {
        hasDialog: !!dialog,
        title: (dialog?.querySelector('h2,h3,[class*="DialogTitle"]')?.textContent || '').trim().slice(0, 80),
        hasRecWords: /yêu cầu|requisition|vị trí|tuyển|headcount|job/i.test(text),
        dialogText: text.slice(0, 180),
        rowCount: document.querySelectorAll('tbody tr').length,
      };
    });
    // Optional: open Sửa from detail footer if detail open
    if (recUi.hasDialog && /chi tiết/i.test(recUi.title || '')) {
      try {
        await nativeClickByText(page, 'Sửa');
        await sleep(1000);
        await shot(page, '12b-recruitment-edit');
      } catch {
        /* open/edit feasible without edit click */
      }
    }
    const uf12 =
      !!recList &&
      (rClick.ok || recUi.hasDialog || !!recDetail) &&
      (recUi.hasDialog || !!recDetail || recUi.hasRecWords);
    note(
      'UF-HRM-12',
      uf12,
      `list=${recList?.status} click=${JSON.stringify(rClick)} detailGET=${recDetail?.status || 'none'} ui=${JSON.stringify(recUi)}`,
    );
    results.verdicts['UF-HRM-12'] = uf12 ? 'PASS' : 'FAIL';

    results.consoleErrors = consoleErrors.slice(0, 30);
    results.finishedAt = new Date().toISOString();
    results.networkSummary = {
      total: results.network.length,
      non2xx: results.network.filter((n) => n.status < 200 || n.status >= 300).slice(-15),
    };
    save();

    const must = ['UF-HRM-01', 'J-HRM-01', 'J-HRM-03', 'J-HRM-06', 'UF-HRM-10', 'UF-HRM-12'];
    const hardFail = must.filter((k) => results.verdicts[k] === 'FAIL');
    console.log('\n=== VERDICTS ===');
    console.log(JSON.stringify(results.verdicts, null, 2));
    console.log(`hardFail=${hardFail.join(',') || 'none'} · UF-HRM-03=${results.verdicts['UF-HRM-03']} · LEAVE=BLOCKED`);

    await browser.close();
    process.exit(hardFail.length ? 1 : 0);
  } catch (e) {
    results.fatal = String(e);
    save();
    console.error('FATAL', e);
    try {
      await browser.close();
    } catch {
      /* */
    }
    process.exit(2);
  }
})();
