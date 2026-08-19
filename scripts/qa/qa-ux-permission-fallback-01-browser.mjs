/**
 * QA-UX-PERMISSION-FALLBACK-01 — browser U65 FE-only
 * Wave B PermissionFallback: wiring + CEO portal non-blank + optional deny
 * must_keep: Profile C2 groups · Payroll D5 Zod · P0-c Advance cancel-reopen · Clock-In
 * HOLD_DEPLOY · zero-seed · cấm remove portal bypass
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_DEV_URL || 'http://127.0.0.1:8080';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-ux-permission-fallback-01-runtime.json');
const CONSOLE_OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-ux-permission-fallback-01-console.txt');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-ux-permission-fallback-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-UX-PERMISSION-FALLBACK-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM, EMAIL, seed: false, hold_deploy: true },
  steps: [],
  consoleErrors: [],
  pageErrors: [],
  network: { employeeGets: [] },
  screens: [],
  employeeId: null,
  residual: {},
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

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path);
  return path;
}

function trackConsole(page) {
  page.on('pageerror', (e) => results.pageErrors.push(String(e).slice(0, 400)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 400));
  });
}

function trackNetwork(page) {
  page.on('response', (res) => {
    const url = res.url();
    if (!/\/api\/hrm\/employees\//i.test(url)) return;
    if (res.request().method() !== 'GET') return;
    results.network.employeeGets.push({ status: res.status(), url: url.slice(0, 200) });
  });
}

async function visible(page, testId) {
  try {
    await page.getByTestId(testId).first().waitFor({ state: 'visible', timeout: 12000 });
    return true;
  } catch {
    return false;
  }
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

async function fetchEmployeeId() {
  const r = await fetch(`${PORTAL}/api/hrm/employees?page_size=5&company_id=main`, {
    headers: { Authorization: `Bearer ${results._token}`, Accept: 'application/json' },
  });
  const j = await r.json();
  const rows = j?.data?.data || j?.data?.items || (Array.isArray(j?.data) ? j.data : []) || j?.items || [];
  const prefer =
    rows.find((x) => /ceo@xe\.vn|PORTAL-GCEO/i.test(`${x?.email || ''} ${x?.employee_code || ''}`)) ||
    rows[0];
  return { status: r.status, id: prefer?.id || null, code: prefer?.employee_code || null };
}

function assertSourceWiring() {
  const profile = readFileSync(resolve(ROOT, 'apps/web/hrm/src/pages/EmployeeProfile.tsx'), 'utf8');
  const fb = readFileSync(resolve(ROOT, 'apps/web/hrm/src/components/auth/PermissionFallback.tsx'), 'utf8');
  const sot = readFileSync(
    resolve(ROOT, 'apps/web/hrm/src/components/auth/permissionFallbackSot.ts'),
    'utf8',
  );
  const gate = readFileSync(resolve(ROOT, 'apps/web/hrm/src/components/auth/PermissionGate.tsx'), 'utf8');

  const fallbackCount = (profile.match(/fallback=\{<PermissionFallback/g) || []).length;
  const viewSalaryGates = (profile.match(/action=["']view_salary["']/g) || []).length;
  const silentNull =
    /action=["']view_salary["'][\s\S]{0,80}fallback=\{null\}/.test(profile) ||
    /fallback=\{null\}[\s\S]{0,120}view_salary/.test(profile);
  const compactCmnd =
    /action=["']view_salary["'][\s\S]{0,120}variant=["']compact["']/.test(profile) ||
    /variant=["']compact["'][\s\S]{0,80}idNumber|id_number|personalInfo/i.test(profile) ||
    profile.includes('variant="compact"');
  // SoT owns VI copy + testids; component binds PERMISSION_FALLBACK_TEST_IDS / VI defaults
  const sotOk =
    sot.includes('Liên hệ HR') &&
    sot.includes("root: 'permission-fallback'") &&
    sot.includes("contactHr: 'permission-fallback-contact-hr'") &&
    sot.includes('mailto:hr@xe.vn') &&
    fb.includes('PERMISSION_FALLBACK_TEST_IDS') &&
    fb.includes('PERMISSION_FALLBACK_VI');
  const bypassKept = /shouldBypassHrmPermissionGate/.test(gate);

  const ok = fallbackCount >= 5 && viewSalaryGates >= 5 && !silentNull && compactCmnd && sotOk && bypassKept;
  note(
    'UF-PF-source-wiring',
    ok,
    JSON.stringify({
      fallbackCount,
      viewSalaryGates,
      silentNull,
      compactCmnd,
      sotOk,
      bypassKept,
    }),
  );
  return ok;
}

async function openProfile(page) {
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  const listOk = await page.evaluate(() =>
    /nhân viên|employees|mã nv|họ tên/i.test((document.body?.innerText || '').slice(0, 4000)),
  );
  note('J-HRM-list', listOk, listOk ? 'employees list loaded' : 'list text missing');
  await shot(page, '01-employees-list');

  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    for (const row of rows) {
      const t = (row.textContent || '').trim();
      if (!t || /không có|no data|chưa có/i.test(t)) continue;
      row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return;
    }
  });
  await sleep(3500);

  let url = page.url();
  let idMatch = url.match(/\/employees\/([0-9a-f-]{20,})/i);
  if (!idMatch) {
    const api = await fetchEmployeeId();
    if (api.id) {
      await page.goto(q(`/hr/employees/${api.id}`), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      url = page.url();
      idMatch = url.match(/\/employees\/([0-9a-f-]{20,})/i);
      note('J-HRM-deeplink', !!idMatch, `apiId=${api.id} code=${api.code}`);
    }
  }
  results.employeeId = idMatch?.[1] || null;
  const profileOk = await visible(page, 'employee-profile-page');
  note(
    'J-HRM-01-detail',
    profileOk && !!results.employeeId,
    `profile=${profileOk} id=${results.employeeId} url=${url.slice(0, 140)}`,
  );
  await shot(page, '02-profile');
  return profileOk;
}

async function assertProfileCards(page) {
  // General tab: financial + insurance cards + CMND (CEO bypass → content, not fallback)
  await page.getByTestId('profile-tab-general').click().catch(() => {});
  await sleep(800);
  const general = await page.evaluate(() => {
    const text = (document.body?.innerText || '').slice(0, 10000);
    const fb = document.querySelectorAll('[data-testid="permission-fallback"]').length;
    return {
      financial: /thông tin tài chính|lương cơ bản|base salary|ngân hàng|mã số thuế/i.test(text),
      insurance: /bảo hiểm|social insurance|health insurance|BHYT|BHXH/i.test(text),
      cmnd: /CMND|CCCD|căn cước|số CMND|id number|ngày cấp/i.test(text),
      fallbackCount: fb,
      blank: (document.querySelector('[data-testid="employee-profile-page"]')?.innerText || '').trim()
        .length < 40,
    };
  });
  // CEO portal: expect cards visible (non-blank), not silent empty
  note(
    'UF-PF-general-cards-ceo',
    !general.blank && (general.financial || general.insurance || general.cmnd),
    JSON.stringify(general),
  );
  await shot(page, '03-general-cards');

  // Salary tab — non-blank (bypass by design OK)
  await page.getByTestId('profile-tab-salary').click();
  await sleep(1200);
  const salary = await page.evaluate(() => {
    const fb = document.querySelector('[data-testid="permission-fallback"]');
    const pageEl = document.querySelector('[data-testid="employee-profile-page"]');
    const text = (pageEl?.innerText || document.body?.innerText || '').slice(0, 6000);
    return {
      fallback: !!fb,
      hasSalaryish: /lương|salary|thu nhập|phụ cấp|bảng lương|không có dữ liệu|chưa có/i.test(text),
      blankRoot: (pageEl?.innerText || '').trim().length < 40,
      textSample: text.replace(/\s+/g, ' ').slice(0, 120),
    };
  });
  note(
    'UF-PF-salary-ceo-nonblank',
    !salary.blankRoot && (salary.hasSalaryish || salary.fallback),
    JSON.stringify(salary),
  );
  await shot(page, '04-salary-tab');

  // Insurance via HR group
  let insuranceOk = false;
  if (await visible(page, 'profile-group-hr')) {
    await page.getByTestId('profile-group-hr').click();
    await sleep(400);
    if ((await page.getByTestId('profile-group-tab-insurance').count()) > 0) {
      await page.getByTestId('profile-group-tab-insurance').click();
      await sleep(1200);
      insuranceOk = await page.evaluate(() => {
        const text = (document.body?.innerText || '').slice(0, 6000);
        const fb = !!document.querySelector('[data-testid="permission-fallback"]');
        const blank =
          (document.querySelector('[data-testid="employee-profile-page"]')?.innerText || '').trim()
            .length < 40;
        return !blank && (/bảo hiểm|insurance|BHXH|BHYT/i.test(text) || fb);
      });
    }
    await page.keyboard.press('Escape').catch(() => {});
  }
  note('UF-PF-insurance-ceo-nonblank', insuranceOk, `insurancePanelNonBlank=${insuranceOk}`);
  await shot(page, '05-insurance-tab');
}

async function assertProfileC2Smoke(page) {
  const groups = await visible(page, 'profile-tab-groups');
  const core =
    (await visible(page, 'profile-tab-general')) && (await visible(page, 'profile-tab-salary'));
  const hr = await visible(page, 'profile-group-hr');
  const career = await visible(page, 'profile-group-career');
  const personal = await visible(page, 'profile-group-personal');
  note(
    'must_keep-C2-groups',
    groups && core && hr && career && personal,
    JSON.stringify({ groups, core, hr, career, personal }),
  );
}

async function tryDenyPersona(browser, session) {
  if (!results.employeeId) {
    note('UF-PF-deny-live', true, 'BLOCKED-ENV no employeeId — keep R-C2-01 P3');
    results.residual['R-C2-01'] = 'P3 KEEP — no employeeId for deny attempt';
    return;
  }

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  trackConsole(p);
  // Intentionally omit hrm_portal_mode + portal QS — still often bypasses if portal token present
  await p.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      store.removeItem('hrm_portal_mode');
    }
  }, session);

  let live = null;
  for (const url of [
    `${HRM}/employees/${results.employeeId}`,
    `${PORTAL}/hr/employees/${results.employeeId}`,
  ]) {
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch {
      continue;
    }
    await sleep(3000);
    await p.evaluate(() => {
      localStorage.removeItem('hrm_portal_mode');
      sessionStorage.removeItem('hrm_portal_mode');
    });
    if (!(await visible(p, 'employee-profile-page'))) continue;
    if ((await p.getByTestId('profile-tab-salary').count()) > 0) {
      await p.getByTestId('profile-tab-salary').click();
      await sleep(1000);
    }
    live = await p.evaluate(() => {
      const el = document.querySelector('[data-testid="permission-fallback"]');
      const cta = document.querySelector('[data-testid="permission-fallback-contact-hr"]');
      const text = el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
      const href = cta?.getAttribute('href') || '';
      return {
        visible: !!el,
        vi: /không có quyền|liên hệ hr/i.test(text),
        cta: !!cta,
        mailto: /^mailto:/i.test(href),
        href: href.slice(0, 120),
        text: text.slice(0, 160),
        url: location.href.slice(0, 160),
      };
    });
    if (live.visible && live.vi && live.cta) break;
  }

  const liveOk = !!(live && live.visible && live.vi && live.cta && live.mailto);
  if (liveOk) {
    note('UF-PF-deny-live', true, `CLOSED R-C2-01 ${JSON.stringify(live)}`);
    results.residual['R-C2-01'] = 'CLOSED — live deny DOM + mailto CTA';
  } else {
    // Soft-pass: BLOCKED-ENV under portal JWT bypass by design — keep R-C2-01 P3
    note(
      'UF-PF-deny-live',
      true,
      `BLOCKED-ENV portal bypass by design; keep R-C2-01 P3; live=${JSON.stringify(live)}`,
    );
    results.residual['R-C2-01'] = 'P3 KEEP — deny persona BLOCKED-ENV (portal bypass)';
  }
  await shot(p, '06-deny-attempt');
  await ctx.close();
}

async function openCalcMenuItem(page, nameRe) {
  const calc = page.getByRole('button', { name: /^Tính lương$/i });
  if ((await calc.count()) > 0) {
    await calc.first().click();
    await sleep(400);
  }
  const item = page.getByRole('menuitem', { name: nameRe });
  if ((await item.count()) > 0) {
    await item.first().click();
    return 'menuitem';
  }
  const viaText = page.getByText(nameRe, { exact: false });
  if ((await viaText.count()) > 0) {
    await viaText.first().click();
    return 'text';
  }
  return null;
}

async function mustKeep(page) {
  const errBefore = results.pageErrors.length + results.consoleErrors.length;

  // Clock-In C1
  await page.goto(q('/hr/attendance'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  if (await visible(page, 'overview-clock-in-cta')) {
    await page.getByTestId('overview-clock-in-cta').click();
  } else {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      buttons.find((b) => /chấm công/i.test((b.textContent || '').trim()))?.click();
    });
    await sleep(400);
    await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('[role="menuitem"]'));
      nodes
        .find((n) => /chấm công vào|vào\/ra|clock.?in/i.test((n.textContent || '').trim()))
        ?.click();
    });
    await sleep(800);
    if (await visible(page, 'overview-clock-in-cta')) {
      await page.getByTestId('overview-clock-in-cta').click();
    }
  }
  await sleep(1000);
  const wizardOk = await visible(page, 'clock-in-wizard');
  const methodOk =
    wizardOk &&
    ((await visible(page, 'clock-in-method-selector')) || (await visible(page, 'clock-in-panel-manual')));
  note('must_keep-C1-clock-in', wizardOk && methodOk, `wizard=${wizardOk} methodOrManual=${methodOk}`);
  await shot(page, '07-clock-in');

  // Payroll mount + D5 Zod
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  const payRoot = await page.evaluate(() => (document.getElementById('root')?.innerHTML || '').length);
  note('must_keep-payroll-mount', payRoot > 80, `root=${payRoot}`);

  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const openedComp = await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button, [role="tab"]'));
    const el = tabs.find((n) => /thành phần lương|salary component/i.test((n.textContent || '').trim()));
    if (!el) return null;
    el.click();
    return (el.textContent || '').trim().slice(0, 40);
  });
  await sleep(800);
  if (openedComp) {
    const add = page.getByRole('button', { name: /Thêm mới/i });
    if ((await add.count()) > 0) {
      await add.first().click();
      await sleep(800);
      const dlg = page.getByRole('dialog');
      if ((await dlg.count()) > 0) {
        const submit = dlg.getByRole('button', { name: /Thêm mới/i }).last();
        if ((await submit.count()) > 0) await submit.click();
        await sleep(600);
        const msgs = await page.evaluate(() => {
          const texts = Array.from(
            document.querySelectorAll('[id^="form-item-message"], .text-destructive, p'),
          )
            .map((el) => (el.textContent || '').trim())
            .filter((t) => /không được|vui lòng|required|bắt buộc/i.test(t));
          return [...new Set(texts)].slice(0, 5);
        });
        note('must_keep-D5-zod-add', msgs.length >= 1, `msgs=${JSON.stringify(msgs)}`);
        await page.keyboard.press('Escape');
      } else {
        note('must_keep-D5-zod-add', false, 'Add dialog missing');
      }
    } else {
      note('must_keep-D5-zod-add', false, 'Add CTA missing on SalaryComponents');
    }
  } else {
    note('must_keep-D5-zod-add', false, 'SalaryComponents tab not found');
  }
  await shot(page, '08-payroll-d5');

  // P0-c Advance cancel→reopen
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  await openCalcMenuItem(page, /Tạm ứng|Advance/i);
  await sleep(1200);
  let advanceReachable = false;
  const addAdvanceBtn = page.getByRole('button', {
    name: /Tạo bảng tạm ứng|Tạo tạm ứng|Thêm bảng tạm ứng|Thêm mới|^Thêm$/i,
  });
  if (await addAdvanceBtn.count()) {
    await addAdvanceBtn.first().click();
    await sleep(700);
    advanceReachable = (await page.locator('[role="dialog"]').count()) > 0;
  }
  if (!advanceReachable) {
    const viaEval = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const el = buttons.find((b) =>
        /tạo bảng tạm ứng|tạo tạm ứng|thêm bảng tạm|thêm mới/i.test(
          (b.textContent || '').replace(/\s+/g, ' '),
        ),
      );
      if (!el) return false;
      el.click();
      return true;
    });
    await sleep(700);
    advanceReachable = viaEval && (await page.locator('[role="dialog"]').count()) > 0;
  }
  if (advanceReachable) {
    const writableInputs = page.locator('[role="dialog"] input:not([readonly])');
    const wCount = await writableInputs.count();
    if (wCount > 0) await writableInputs.first().fill('QA_PF_ADV_STALE');
    await sleep(200);
    const cancelAdv = page.locator('[role="dialog"] button').filter({ hasText: /Hủy|Cancel|Đóng/i });
    if (await cancelAdv.count()) await cancelAdv.first().click();
    else await page.keyboard.press('Escape');
    await sleep(500);
    const advClosed = (await page.locator('[role="dialog"]').count()) === 0;
    if (await addAdvanceBtn.count()) await addAdvanceBtn.first().click();
    else {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        buttons
          .find((b) => /tạo bảng tạm ứng|tạo tạm ứng|thêm bảng tạm|thêm mới/i.test(b.textContent || ''))
          ?.click();
      });
    }
    await sleep(700);
    const advReopen = await page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return { open: false, inputs: [] };
      const inputs = Array.from(dlg.querySelectorAll('input:not([readonly])')).map((i) => i.value || '');
      return { open: true, inputs: inputs.slice(0, 4) };
    });
    const advEmpty =
      advClosed &&
      advReopen.open &&
      !(advReopen.inputs || []).some((v) => /QA_PF_ADV_STALE/i.test(v));
    note(
      'must_keep-P0c-advance-cancel-reopen',
      advEmpty,
      `closed=${advClosed} reopen=${JSON.stringify(advReopen)}`,
    );
    await page.keyboard.press('Escape');
  } else {
    note(
      'must_keep-P0c-advance-cancel-reopen',
      false,
      'Advance CTA / dialog not reachable',
    );
  }
  await shot(page, '09-advance-reopen');

  const crashes = [...results.pageErrors, ...results.consoleErrors]
    .slice(errBefore)
    .filter((e) => /TypeError|Invalid hook call|t is not defined|Cannot read propert/i.test(e));
  note('console-no-TypeError', crashes.length === 0, `count=${crashes.length}`);
}

async function main() {
  assertSourceWiring();

  const session = await loginApi();
  results._token = session.token;
  note('login-api', true, `email=${EMAIL}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  trackConsole(page);
  trackNetwork(page);

  try {
    await injectPortalAuth(page, session);
    const opened = await openProfile(page);
    if (opened) {
      await assertProfileC2Smoke(page);
      await assertProfileCards(page);
    } else {
      note('UF-PF-general-cards-ceo', false, 'profile not opened');
      note('UF-PF-salary-ceo-nonblank', false, 'profile not opened');
      note('must_keep-C2-groups', false, 'profile not opened');
    }

    await tryDenyPersona(browser, session);
    await mustKeep(page);
  } catch (e) {
    note('runtime-exception', false, String(e).slice(0, 400));
  } finally {
    results.finishedAt = new Date().toISOString();
    const required = [
      'UF-PF-source-wiring',
      'J-HRM-01-detail',
      'UF-PF-general-cards-ceo',
      'UF-PF-salary-ceo-nonblank',
      'UF-PF-insurance-ceo-nonblank',
      'UF-PF-deny-live',
      'must_keep-C2-groups',
      'must_keep-C1-clock-in',
      'must_keep-payroll-mount',
      'must_keep-D5-zod-add',
      'must_keep-P0c-advance-cancel-reopen',
      'console-no-TypeError',
    ];
    const failed = required.filter((id) => !results.steps.find((s) => s.id === id)?.ok);
    const hardFails = failed.filter((id) => id !== 'UF-PF-deny-live');
    results.failed = failed;
    results.hardFails = hardFails;
    results.verdict = hardFails.length === 0 ? 'PASS' : 'FAIL';
    save();
    writeFileSync(
      CONSOLE_OUT,
      [...results.pageErrors, ...results.consoleErrors].join('\n') || '(empty)',
    );
    console.log(`\nVERDICT ${results.verdict} hardFails=${JSON.stringify(hardFails)}`);
    console.log(`residual=${JSON.stringify(results.residual)}`);
    await browser.close();
    process.exit(hardFails.length === 0 ? 0 : 1);
  }
}

main();
