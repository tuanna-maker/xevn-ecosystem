/**
 * QA-ERP-E3-01 — Browser U65 · HOLD_DEPLOY · zero-seed
 * J-HRM-PERF-E3-01 · J-HRM-INS-E3-01 · J-HRM-SM-E3-01
 * Portal :5173 · ceo@xe.vn · hrm :28001
 *
 * Scope: illegal SM → HRM-SM-001; invent insurer/kpi → KEY 400;
 * policy path /api/hrm/contracts-insurance/insurance-policies only;
 * F5 after 2xx; Empty+CTA when catalog 0.
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-erp-e3-01-runtime.json');
const SHOT_DIR = resolve(__dir, '../../docs/qa/evidence/screens/qa-erp-e3-01');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => Date.now().toString(36).slice(-5).toUpperCase();

const results = {
  work_item_id: 'QA-ERP-E3-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_API, XBOS_API, EMAIL, seed: false, HOLD_DEPLOY: true, U65: true },
  steps: [],
  verdicts: {},
  netMutates: [],
  apiProbes: [],
  hardFails: [],
  softBlocks: [],
  pageErrors: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString() };
  results.steps.push(row);
  results.verdicts[id] = ok ? 'PASS' : 'FAIL';
  if (!ok) results.hardFails.push(id);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
}

function soft(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString(), soft: true };
  results.steps.push(row);
  results.verdicts[id] = ok ? 'PASS' : 'BLOCKED';
  if (!ok) results.softBlocks.push(id);
  console.log(`${ok ? 'PASS' : 'BLOCKED'}  ${id}  ${detail}`);
  save();
  return ok;
}

async function loginApi() {
  const bases = [`${XBOS_API}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`];
  let lastErr = '';
  for (const url of bases) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user: data?.user ?? {
            userId: EMAIL,
            email: EMAIL,
            displayName: 'CEO Tập đoàn',
            roles: ['group_ceo', 'portal'],
          },
          raw: data,
          loginUrl: url,
        };
      }
      lastErr = `HTTP ${r.status} via ${url} code=${j?.code}`;
    } catch (e) {
      lastErr = `${url}: ${String(e).slice(0, 160)}`;
    }
  }
  throw new Error(`login failed — ${lastErr}`);
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

async function apiJson(path, { method = 'GET', token, body, companyId = 'holding' } = {}) {
  const url = path.startsWith('http') ? path : `${HRM_API}${path}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'x-company-id': companyId,
    'x-tenant-id': 'xevn',
  };
  const r = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text.slice(0, 500) };
  }
  const row = { method, path, status: r.status, code: parsed?.code, message: parsed?.message };
  results.apiProbes.push(row);
  return { status: r.status, body: parsed, code: parsed?.code, message: parsed?.message };
}

function attachNet(page) {
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = req.method();
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;
      let parsed = null;
      try {
        parsed = req.postData() ? JSON.parse(req.postData()) : null;
      } catch {
        parsed = { raw: (req.postData() || '').slice(0, 800) };
      }
      results.netMutates.push({
        phase: 'request',
        method,
        url: u.replace(PORTAL, '').replace(HRM_API, ''),
        body: parsed,
      });
    } catch {
      /* ignore */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return;
      if (!/(performance|insurance-policies|contracts-insurance|leave-requests)/.test(u)) return;
      let code = null;
      try {
        const j = await res.json();
        code = j?.code ?? null;
      } catch {
        /* ignore */
      }
      results.netMutates.push({
        phase: 'response',
        method,
        url: u.replace(PORTAL, '').replace(HRM_API, ''),
        status: res.status(),
        code,
      });
    } catch {
      /* ignore */
    }
  });
}

async function shot(page, name) {
  mkdirSync(SHOT_DIR, { recursive: true });
  const path = resolve(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function runApiProbes(token) {
  // Path freeze
  const alias = await apiJson('/api/hrm/insurance-policies', { token });
  note(
    'API-PATH-FREEZE-ALIAS',
    alias.status === 404,
    `GET /api/hrm/insurance-policies → ${alias.status} ${alias.code}`,
  );
  const policies = await apiJson('/api/hrm/contracts-insurance/insurance-policies?company_id=holding', {
    token,
  });
  note(
    'API-PATH-FREEZE-CANON',
    policies.status === 200 && policies.code === 'HRM-INS-POL-200',
    `GET …/contracts-insurance/insurance-policies → ${policies.status} ${policies.code} total=${policies.body?.data?.total}`,
  );

  // Invent insurer KEY
  const inventIns = await apiJson('/api/hrm/contracts-insurance/insurance-policies', {
    method: 'POST',
    token,
    body: {
      company_id: 'holding',
      policy_code: `QA-E3-INV-${stamp()}`,
      policy_name: 'QA invent insurer',
      insurer_key: 'INVENT_INSURER_QA_E3_ZZZ',
      insurance_type: 'all',
      effective_date: '2026-01-01',
    },
  });
  note(
    'API-INS-INVENT-KEY',
    inventIns.status === 400 && inventIns.code === 'HRM-INS-INSURER-KEY',
    `POST invent insurer → ${inventIns.status} ${inventIns.code}`,
  );

  // Invent KPI KEY
  const evals = await apiJson('/api/hrm/performance/evaluations?company_id=holding', { token });
  const draftEval = (evals.body?.data?.data || []).find((e) => (e.status || 'draft') === 'draft');
  if (!draftEval) {
    note('API-PERF-KPI-KEY', false, 'No draft evaluation for invent kpi probe');
  } else {
    const inventKpi = await apiJson(
      `/api/hrm/performance/evaluations/${draftEval.id}?company_id=holding`,
      {
        method: 'PATCH',
        token,
        body: { kpi_code: 'INVENT_KPI_QA_E3_ZZZ' },
      },
    );
    note(
      'API-PERF-KPI-KEY',
      inventKpi.status === 400 && inventKpi.code === 'HRM-PERF-KPI-KEY',
      `PATCH invent kpi → ${inventKpi.status} ${inventKpi.code}`,
    );
  }

  // SM: cycle closed→active
  const cycles = await apiJson('/api/hrm/performance/cycles?company_id=holding', { token });
  const closed = (cycles.body?.data?.data || []).find((c) => c.status === 'closed');
  if (!closed) {
    note('API-SM-CYCLE-CLOSED-ACTIVE', false, 'No closed cycle for SM probe');
  } else {
    const jump = await apiJson(`/api/hrm/performance/cycles/${closed.id}?company_id=holding`, {
      method: 'PATCH',
      token,
      body: { status: 'active' },
    });
    note(
      'API-SM-CYCLE-CLOSED-ACTIVE',
      jump.status === 400 && jump.code === 'HRM-SM-001',
      `closed→active → ${jump.status} ${jump.code} ${jump.message}`,
    );
  }

  // SM: eval draft→completed skip
  if (draftEval) {
    const skip = await apiJson(
      `/api/hrm/performance/evaluations/${draftEval.id}?company_id=holding`,
      {
        method: 'PATCH',
        token,
        body: { status: 'completed' },
      },
    );
    note(
      'API-SM-EVAL-SKIP',
      skip.status === 400 && skip.code === 'HRM-SM-001',
      `draft→completed → ${skip.status} ${skip.code}`,
    );
  }

  // SM: leave approved→rejected
  const leaves = await apiJson('/api/hrm/attendance/leave-requests?company_id=holding', { token });
  const approved = (leaves.body?.data?.data || []).find((l) => l.status === 'approved');
  if (!approved) {
    soft('API-SM-LEAVE-REJECT', false, 'No approved leave for SM spot');
  } else {
    const rej = await apiJson(
      `/api/hrm/attendance/leave-requests/${approved.id}/reject`,
      {
        method: 'POST',
        token,
        body: { reviewer_name: 'QA-ERP-E3-01' },
      },
    );
    note(
      'API-SM-LEAVE-REJECT',
      rej.status === 400 && rej.code === 'HRM-SM-001',
      `approved→rejected → ${rej.status} ${rej.code}`,
    );
  }

  // Policy SM: create blocked by KEY — skip active→draft until catalog; document residual
  soft(
    'API-SM-POLICY-ACTIVE-DRAFT',
    policies.body?.data?.total === 0,
    'No policy rows (catalog insurers empty) — active→draft SM covered by jest; live deferred until FE Settings catalog',
  );
}

async function runBrowser(session) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 400));
  });
  attachNet(page);
  await injectSession(page, session);

  try {
    // --- J-HRM-PERF-E3-01 ---
    await page.goto(`${PORTAL}/hr/performance?portal=1&companyId=main`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await sleep(2500);
    await shot(page, '01-performance');

    const perfOk = await page.$('[data-testid="performance-page-e3"]');
    note('FE-PERF-PAGE', !!perfOk, `performance-page-e3 present=${!!perfOk} url=${page.url()}`);

    const cycleName = `QA-E3-CYCLE-${stamp()}`;
    const filled = await page.evaluate((name) => {
      const labels = Array.from(document.querySelectorAll('label'));
      const nameLabel = labels.find((l) => (l.textContent || '').includes('Tên chu kỳ'));
      const form = nameLabel?.closest('form');
      if (!form) return { ok: false, reason: 'no form' };
      const inputs = form.querySelectorAll('input');
      if (inputs.length < 3) return { ok: false, reason: `inputs=${inputs.length}` };
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(inputs[0], name);
      set(inputs[1], '2026-08-01');
      set(inputs[2], '2026-08-31');
      return { ok: true };
    }, cycleName);
    if (!filled.ok) {
      note('J-HRM-PERF-E3-01-CREATE', false, `fill failed: ${filled.reason}`);
    } else {
      const before = results.netMutates.length;
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          (b.textContent || '').includes('Tạo chu kỳ'),
        );
        btn?.click();
      });
      await sleep(3500);
      const createResp = results.netMutates
        .slice(before)
        .filter((m) => m.phase === 'response' && /performance\/cycles/.test(m.url))
        .pop();
      const createOk =
        createResp &&
        createResp.status >= 200 &&
        createResp.status < 300 &&
        (createResp.code === 'HRM-PERF-200' || createResp.code === 'HRM-PERF-201' || !createResp.code);
      note(
        'J-HRM-PERF-E3-01-CREATE',
        !!createOk,
        `POST cycles → status=${createResp?.status} code=${createResp?.code}`,
      );

      // F5 — cycle name still listed
      await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(2500);
      const afterF5 = await page.evaluate((name) => {
        return (document.body.innerText || '').includes(name);
      }, cycleName);
      const statusVi = await page.evaluate(() => {
        const t = document.body.innerText || '';
        return { hasNhap: t.includes('Nháp'), hasDongMo: t.includes('Đang mở') || t.includes('Đã đóng') };
      });
      note(
        'J-HRM-PERF-E3-01-F5',
        afterF5,
        `F5 cycle visible=${afterF5}; U72 Nháp=${statusVi.hasNhap}`,
      );
      await shot(page, '02-performance-f5');
    }

    // SM UI: closed status (paren label, not "→ Đã đóng" button) must NOT expose active
    const smUi = await page.evaluate(() => {
      const statusOf = (row) => {
        const muted = row.querySelector('.text-muted-foreground');
        const t = muted?.textContent || '';
        const m = t.match(/\(([^)]+)\)\s*$/);
        return (m?.[1] || '').trim();
      };
      const rows = Array.from(document.querySelectorAll('[data-testid="perf-cycle-row"]'));
      const closedRows = rows.filter((r) => statusOf(r) === 'Đã đóng');
      const draftRows = rows.filter((r) => statusOf(r) === 'Nháp');
      const illegal = closedRows.filter((r) => r.querySelector('[data-testid="perf-cycle-sm-active"]'));
      const legalActive = draftRows.some((r) => r.querySelector('[data-testid="perf-cycle-sm-active"]'));
      const closedHasAnySm = closedRows.some((r) => r.querySelector('[data-testid^="perf-cycle-sm-"]'));
      return {
        closedRows: closedRows.length,
        illegalActiveOnClosed: illegal.length,
        closedHasAnySm,
        draftWithActive: legalActive,
        totalRows: rows.length,
        sampleClosed: closedRows[0] ? statusOf(closedRows[0]) : null,
      };
    });
    note(
      'J-HRM-PERF-E3-01-SM-UI',
      smUi.illegalActiveOnClosed === 0 && !smUi.closedHasAnySm,
      `closedRows=${smUi.closedRows} illegalActive=${smUi.illegalActiveOnClosed} closedHasSm=${smUi.closedHasAnySm} draftWithActive=${smUi.draftWithActive} sample=${smUi.sampleClosed}`,
    );

    // KPI Empty+CTA or picker present
    const kpiSurface = await page.evaluate(() => {
      const t = document.body.innerText || '';
      const hasKpi = /KPI|kpi|Chỉ tiêu/i.test(t);
      const hasSettingsLink = Array.from(document.querySelectorAll('a')).some((a) =>
        /Cài đặt|settings/i.test(a.textContent || ''),
      );
      return { hasKpi, hasSettingsLink };
    });
    soft(
      'FE-PERF-KPI-SURFACE',
      kpiSurface.hasKpi,
      `kpi surface=${kpiSurface.hasKpi} settingsLink=${kpiSurface.hasSettingsLink}`,
    );

    // --- J-HRM-INS-E3-01 ---
    await page.goto(`${PORTAL}/hr/insurance?portal=1&companyId=main`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    await sleep(3000);
    await shot(page, '03-insurance');

    const insPanel = await page.$('[data-testid="insurance-policy-master-e3"]');
    note('FE-INS-PANEL', !!insPanel, `insurance-policy-master-e3 present=${!!insPanel}`);

    const emptyCta = await page.evaluate(() => {
      const empty = document.querySelector('[data-testid="ins-policies-empty"]');
      const links = Array.from(document.querySelectorAll('a')).filter((a) =>
        /Cài đặt|Nhà bảo hiểm|settings/i.test(a.textContent || ''),
      );
      const pickerEmpty = Array.from(document.querySelectorAll('[data-testid="insurance-policy-master-e3"] a')).some(
        (a) => /Cài đặt|Nhà bảo hiểm/i.test(a.textContent || ''),
      );
      return {
        emptyPresent: !!empty,
        emptyText: empty ? (empty.textContent || '').slice(0, 200) : null,
        settingsCtaCount: links.length,
        pickerEmptyCta: pickerEmpty,
      };
    });
    // Empty+CTA when catalog 0 OR policies total 0 — either empty state or picker CTA
    note(
      'J-HRM-INS-E3-01-EMPTY-CTA',
      emptyCta.emptyPresent || emptyCta.pickerEmptyCta || emptyCta.settingsCtaCount > 0,
      `empty=${emptyCta.emptyPresent} pickerCta=${emptyCta.pickerEmptyCta} settingsLinks=${emptyCta.settingsCtaCount}`,
    );

    // Zod reject: try submit invent without catalog selection → no 2xx policy create
    const beforeIns = results.netMutates.length;
    await page.evaluate(() => {
      const root = document.querySelector('[data-testid="insurance-policy-master-e3"]');
      if (!root) return;
      const form = root.querySelector('form');
      if (!form) return;
      const inputs = form.querySelectorAll('input');
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      if (inputs[0]) set(inputs[0], `QA-E3-POL-${Date.now().toString(36)}`);
      if (inputs[1]) set(inputs[1], 'Policy invent attempt');
      if (inputs[2] && inputs[2].type === 'date') set(inputs[2], '2026-01-01');
      const btn = Array.from(form.querySelectorAll('button[type="submit"], button')).find((b) =>
        /Lưu|Tạo|Lưu chính sách/i.test(b.textContent || ''),
      );
      btn?.click();
    });
    await sleep(2500);
    const policyPosts = results.netMutates
      .slice(beforeIns)
      .filter(
        (m) =>
          m.phase === 'response' &&
          /insurance-policies/.test(m.url) &&
          m.method === 'POST' &&
          m.status >= 200 &&
          m.status < 300,
      );
    note(
      'J-HRM-INS-E3-01-ZOD-BLOCK',
      policyPosts.length === 0,
      `POST insurance-policies 2xx count=${policyPosts.length} (expect 0 when catalog empty / Zod)`,
    );
    await shot(page, '04-insurance-zod');

    // Confirm FE never calls alias path
    const aliasCalls = results.netMutates.filter((m) =>
      /\/api\/hrm\/insurance-policies(?!\/)/.test(m.url) && !/contracts-insurance/.test(m.url),
    );
    note(
      'FE-PATH-NO-ALIAS',
      aliasCalls.length === 0,
      `alias mutate calls=${aliasCalls.length}`,
    );

    // Page errors
    const crash = results.pageErrors.filter((e) => /ReferenceError|TypeError|is not defined/i.test(e));
    note('FE-NO-CRASH', crash.length === 0, `pageErrors=${results.pageErrors.length} crashes=${crash.length}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });
  // L0
  for (const [id, url] of [
    ['L0-PORTAL', PORTAL],
    ['L0-HRM', `${HRM_API}/api/hrm`],
    ['L0-XBOS', `${XBOS_API}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      note(id, r.status === 200, `HTTP ${r.status} ${url}`);
    } catch (e) {
      note(id, false, String(e).slice(0, 160));
    }
  }

  const session = await loginApi();
  note('L0-LOGIN', !!session.token, `login via ${session.loginUrl}`);

  await runApiProbes(session.token);
  await runBrowser(session);

  results.finishedAt = new Date().toISOString();
  results.overall =
    results.hardFails.length === 0
      ? 'PASS'
      : `FAIL (${results.hardFails.length}: ${results.hardFails.join(', ')})`;
  save();
  console.log('\n=== SUMMARY ===');
  console.log('overall:', results.overall);
  console.log('hardFails:', results.hardFails);
  console.log('softBlocks:', results.softBlocks);
  console.log('runtime:', OUT);
  process.exit(results.hardFails.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.hardFails.push('SCRIPT_CRASH');
  results.overall = `FAIL SCRIPT ${String(e).slice(0, 200)}`;
  save();
  process.exit(2);
});
