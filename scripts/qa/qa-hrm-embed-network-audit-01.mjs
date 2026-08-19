/**
 * QA-HRM-EMBED-NETWORK-AUDIT-01 — browser network audit all HRM embed menus (U65 zero-seed)
 * Portal :5173 · ceo@xe.vn · log every /api/hrm/* · FAIL 4xx/5xx on load
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = resolve(ROOT, 'docs/qa/evidence');
const EVIDENCE = resolve(OUT_DIR, 'qa-hrm-embed-network-audit-20260730.md');
const RUNTIME = resolve(OUT_DIR, '_tmp-qa-hrm-embed-network-audit-01-runtime.json');
const SCREEN_DIR = resolve(OUT_DIR, 'screens/qa-hrm-embed-network-audit-01');

/** Must match apps/web/web-portal/src/modules/hrm/registry.ts HRM_ALL_VIEWS */
const HRM_ALL_VIEWS = [
  'dashboard',
  'employees',
  'contracts',
  'insurance',
  'decisions',
  'recruitment',
  'attendance',
  'payroll',
  'performance',
  'hrm_ai',
  'tasks',
  'processes',
  'internal_services',
  'tools_equipment',
  'fleet',
  'company',
  'reports',
  'settings',
  'guide',
];

const DASHBOARD_REQUIRED = [
  { pattern: /\/api\/hrm\/employees\/summary/i, label: 'employees/summary' },
  { pattern: /\/api\/hrm\/attendance\/overview/i, label: 'attendance/overview' },
  { pattern: /\/api\/hrm\/payroll\/payslips/i, label: 'payroll/payslips' },
  { pattern: /\/api\/hrm\/attendance\/leave-requests/i, label: 'attendance/leave-requests' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HRM-EMBED-NETWORK-AUDIT-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: {},
  menus: [],
  network: [],
  dashboardRequired: {},
  hardFails: [],
  mutateSpot: { status: 'U65_BLOCKED', reason: 'no FE mutate in audit — post-mutate scan deferred' },
  verdict: null,
};

function save() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
}

function fail(id, detail) {
  results.hardFails.push({ id, detail });
  console.log(`FAIL  ${id}  ${detail}`);
  save();
}

function pass(id, detail) {
  console.log(`PASS  ${id}  ${detail}`);
  save();
}

function runL0() {
  const devStack = spawnSync('pnpm', ['run', 'qc:dev-stack'], {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
    timeout: 120_000,
  });
  const feBe = spawnSync('pnpm', ['run', 'qc:fe-be-health'], {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
    timeout: 120_000,
  });
  results.l0 = {
    qc_dev_stack: { exit: devStack.status, stdoutTail: (devStack.stdout || '').slice(-800) },
    qc_fe_be_health: { exit: feBe.status, stdoutTail: (feBe.stdout || '').slice(-800) },
  };
  save();
  const hrmUp = /hrm-api.*HTTP 200|PASS\s+hrm-api-health/i.test(
    (devStack.stdout || '') + (feBe.stdout || ''),
  );
  if (devStack.status !== 0 && !hrmUp) {
    fail('L0-qc-dev-stack', `exit=${devStack.status} hrm not healthy`);
    return false;
  }
  if (feBe.status !== 0) {
    fail('L0-qc-fe-be-health', `exit=${feBe.status}`);
    return false;
  }
  pass('L0', 'qc:dev-stack + qc:fe-be-health PASS');
  return true;
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
    status: r.status,
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

function trackNetwork(page, menuKey) {
  page.on('response', (res) => {
    const url = res.url();
    if (!/\/api\/hrm\//i.test(url)) return;
    if (res.request().method() === 'OPTIONS') return;
    results.network.push({
      menu: menuKey,
      method: res.request().method(),
      status: res.status(),
      url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 260),
      at: new Date().toISOString(),
    });
  });
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (!/\/api\/hrm\//i.test(url)) return;
    results.network.push({
      menu: menuKey,
      method: req.method(),
      status: 0,
      url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 260),
      failure: req.failure()?.errorText || 'failed',
      at: new Date().toISOString(),
    });
  });
}

async function pageHasErrorBanner(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
    return {
      banner:
        /HRM API Sync ERROR|companyId mismatches token scope|ERR_CONNECTION_REFUSED/i.test(text) ||
        /409.*scope|54321/.test(text),
      snippet: text.slice(0, 400),
    };
  });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

function menuNet(menuKey) {
  return results.network.filter((n) => n.menu === menuKey);
}

function badResponses(menuKey) {
  return menuNet(menuKey).filter((n) => n.status === 0 || n.status >= 400);
}

async function auditMenu(page, viewKey) {
  const path = `/command-center/hrm/${viewKey}`;
  const url = qPortal(path);
  const netBefore = results.network.length;

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(2500);

  const err = await pageHasErrorBanner(page);
  await shot(page, `menu-${viewKey}`);

  const slice = results.network.slice(netBefore);
  const bad = slice.filter((n) => n.status === 0 || n.status >= 400);
  const hrmCalls = slice.filter((n) => /\/api\/hrm\//i.test(n.url));

  const row = {
    view: viewKey,
    url: page.url(),
    banner: err.banner,
    hrmRequestCount: hrmCalls.length,
    badCount: bad.length,
    bad,
    allHrm: hrmCalls.map((n) => ({ method: n.method, status: n.status, url: n.url })),
  };
  results.menus.push(row);

  if (err.banner) fail(`menu-${viewKey}-banner`, `HRM error banner on ${viewKey}`);
  if (bad.length) fail(`menu-${viewKey}-http`, `${bad.length} bad /api/hrm responses on load`);

  if (viewKey === 'dashboard') {
    const dashReq = {};
    for (const req of DASHBOARD_REQUIRED) {
      const hit = slice.find((n) => req.pattern.test(n.url));
      dashReq[req.label] = hit ? { status: hit.status, url: hit.url } : null;
      if (!hit || hit.status < 200 || hit.status >= 300) {
        fail(`dashboard-${req.label}`, hit ? `HTTP ${hit.status}` : 'not called');
      } else {
        pass(`dashboard-${req.label}`, `HTTP ${hit.status}`);
      }
    }
    results.dashboardRequired = dashReq;
  }

  const ok = !err.banner && bad.length === 0;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  menu/${viewKey}  hrm=${hrmCalls.length} bad=${bad.length} banner=${err.banner}`,
  );
  save();
  return row;
}

function writeEvidence() {
  const badAll = results.network.filter((n) => n.status === 0 || n.status >= 400);
  const passMenus = results.menus.filter((m) => m.badCount === 0 && !m.banner).length;
  const verdict = results.hardFails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';

  const lines = [
    '# QA-HRM-EMBED-NETWORK-AUDIT-01',
    '',
    `**work_item_id:** QA-HRM-EMBED-NETWORK-AUDIT-01`,
    `**Generated:** ${new Date().toISOString()}`,
    `**Portal:** ${PORTAL}`,
    `**Account:** ${EMAIL} · companyId=main · U65 zero-seed`,
    `**ack_status:** ${verdict}`,
    '',
    '## L0 gates',
    '',
    '| Gate | Exit | Notes |',
    '|------|------|-------|',
    `| qc:dev-stack | ${results.l0.qc_dev_stack?.exit ?? '?'} | HRM+XBOS+portal |`,
    `| qc:fe-be-health | ${results.l0.qc_fe_be_health?.exit ?? '?'} | proxy + direct HRM |`,
    '',
    '## Summary',
    '',
    `- Menus audited: **${results.menus.length}** / ${HRM_ALL_VIEWS.length} (registry HRM_ALL_VIEWS)`,
    `- Menus PASS (no 4xx/5xx, no banner): **${passMenus}**`,
    `- Total /api/hrm calls captured: **${results.network.length}**`,
    `- Bad responses (4xx/5xx/failed): **${badAll.length}**`,
    `- hardFails: **${results.hardFails.length}**`,
    '',
    '## Dashboard required endpoints',
    '',
    '| Endpoint | Status | URL |',
    '|----------|--------|-----|',
  ];

  for (const req of DASHBOARD_REQUIRED) {
    const hit = results.dashboardRequired[req.label];
    lines.push(`| ${req.label} | ${hit?.status ?? 'MISSING'} | ${(hit?.url ?? '—').slice(0, 100)} |`);
  }

  lines.push('', '## Per-menu network audit', '');

  for (const m of results.menus) {
    const v = m.badCount === 0 && !m.banner ? '🟢' : '🔴';
    lines.push(`### ${v} \`${m.view}\` — ${m.url.split('?')[0]}`, '');
    lines.push(`- HRM API calls on load: **${m.hrmRequestCount}** · bad: **${m.badCount}** · banner: **${m.banner}**`);
    if (m.bad.length) {
      lines.push('', '| Method | Status | URL |', '|--------|--------|-----|');
      for (const b of m.bad) {
        lines.push(`| ${b.method} | ${b.status} | ${b.url} |`);
      }
    }
    if (m.allHrm.length && m.allHrm.length <= 30) {
      lines.push('', '<details><summary>All HRM requests</summary>', '', '| Method | Status | URL |', '|--------|--------|-----|');
      for (const n of m.allHrm) {
        lines.push(`| ${n.method} | ${n.status} | ${n.url} |`);
      }
      lines.push('</details>');
    } else if (m.allHrm.length > 30) {
      lines.push('', `> ${m.allHrm.length} HRM requests — see runtime JSON for full list`);
    }
    lines.push('');
  }

  if (results.hardFails.length) {
    lines.push('## hardFails', '');
    for (const f of results.hardFails) {
      lines.push(`- **${f.id}:** ${f.detail}`);
    }
    lines.push('');
    lines.push(
      '**pm_dispatch_hint:** dev-be/dev-fe — fix failing /api/hrm routes per menu; re-run QA-HRM-EMBED-NETWORK-AUDIT-01 after fix.',
    );
  }

  lines.push('', '## Post-mutate spot (U65)', '', `- **${results.mutateSpot.status}:** ${results.mutateSpot.reason}`, '');
  lines.push('## Runtime', '', `- ${RUNTIME.replace(/\\/g, '/')}`, '');

  writeFileSync(EVIDENCE, lines.join('\n'));
  console.log(`\nWrote ${EVIDENCE}`);
  results.verdict = verdict;
  results.finishedAt = new Date().toISOString();
  save();
  return verdict;
}

async function main() {
  console.log('=== QA-HRM-EMBED-NETWORK-AUDIT-01 ===\n');
  if (!runL0()) {
    writeEvidence();
    process.exit(1);
  }

  const session = await loginApi();
  pass('login-api', `HTTP ${session.status}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const t = msg.text();
        if (/hrm|500|409|54321/i.test(t)) {
          results.network.push({
            menu: '_console',
            method: 'CONSOLE',
            status: 0,
            url: t.slice(0, 200),
            at: new Date().toISOString(),
          });
        }
      }
    });

    await injectSession(page, session);

    for (const viewKey of HRM_ALL_VIEWS) {
      trackNetwork(page, viewKey);
      await auditMenu(page, viewKey);
    }

    const verdict = writeEvidence();
    console.log(`\n=== VERDICT: ${verdict} hardFails=${results.hardFails.length} ===`);
    process.exit(results.hardFails.length === 0 ? 0 : 1);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  results.hardFails.push({ id: 'fatal', detail: String(e) });
  try {
    writeEvidence();
  } catch {
    /* */
  }
  process.exit(1);
});
