/**
 * QA-HRM-DASH-NET-01-VERIFY — dashboard embed network retest after D-HRM-DASH-NET-01
 * Portal :5173 · ceo@xe.vn · U65 zero-seed · browser-only
 */
import puppeteer from 'puppeteer';
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
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
const EVIDENCE = resolve(OUT_DIR, 'qa-hrm-dash-net-01-verify-20260730.md');
const AUDIT_R2 = resolve(OUT_DIR, 'qa-hrm-embed-network-audit-20260730-r2.md');
const RUNTIME = resolve(OUT_DIR, '_tmp-qa-hrm-dash-net-01-verify-runtime.json');
const SCREEN_DIR = resolve(OUT_DIR, 'screens/qa-hrm-dash-net-01-verify');

const DASHBOARD_REQUIRED = [
  { pattern: /\/api\/hrm\/employees\/summary/i, label: 'employees/summary' },
  { pattern: /\/api\/hrm\/attendance\/overview/i, label: 'attendance/overview' },
  { pattern: /\/api\/hrm\/payroll\/payslips/i, label: 'payroll/payslips' },
  { pattern: /\/api\/hrm\/attendance\/leave-requests/i, label: 'attendance/leave-requests' },
];

const FORBIDDEN_ON_MOUNT = /\/api\/hrm\/attendance\/records/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HRM-DASH-NET-01-VERIFY',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: {},
  load1: { network: [], required: {}, forbidden: [], banner: false },
  f5: { network: [], required: {}, forbidden: [], banner: false },
  hardFails: [],
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
    qc_dev_stack: { exit: devStack.status, stdoutTail: (devStack.stdout || '').slice(-600) },
    qc_fe_be_health: { exit: feBe.status, stdoutTail: (feBe.stdout || '').slice(-600) },
  };
  save();
  // Windows: qc:dev-stack may crash (3221226505) while services are healthy — defer to fe-be-health
  const devStackOk = devStack.status === 0;
  const feBeOk = feBe.status === 0;
  if (!devStackOk) {
    console.log(`WARN  L0-qc-dev-stack exit=${devStack.status} — checking fe-be-health fallback`);
  }
  if (!feBeOk) {
    fail('L0-qc-fe-be-health', `exit=${feBe.status}`);
    if (!devStackOk) fail('L0-qc-dev-stack', `exit=${devStack.status}`);
    return false;
  }
  pass('L0', devStackOk ? 'qc:dev-stack + qc:fe-be-health PASS' : 'qc:fe-be-health PASS (dev-stack crash waived)');
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

function attachNetworkCapture(page, bucket) {
  const handler = (res) => {
    const url = res.url();
    if (!/\/api\/hrm\//i.test(url)) return;
    if (res.request().method() === 'OPTIONS') return;
    bucket.push({
      method: res.request().method(),
      status: res.status(),
      url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 260),
      at: new Date().toISOString(),
    });
  };
  page.on('response', handler);
  return () => page.off('response', handler);
}

async function pageHasErrorBanner(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
    return {
      banner:
        /HRM API Sync ERROR|HRM API request failed|companyId mismatches token scope|ERR_CONNECTION_REFUSED/i.test(
          text,
        ) || /409.*scope|54321/.test(text),
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

function analyzeNetwork(network, phaseKey) {
  const phase = results[phaseKey];
  phase.network = network;

  for (const req of DASHBOARD_REQUIRED) {
    const hit = network.find((n) => req.pattern.test(n.url));
    phase.required[req.label] = hit ? { status: hit.status, url: hit.url } : null;
    if (!hit || hit.status < 200 || hit.status >= 300) {
      fail(`${phaseKey}-${req.label}`, hit ? `HTTP ${hit.status}` : 'not called');
    } else {
      pass(`${phaseKey}-${req.label}`, `HTTP ${hit.status}`);
    }
  }

  const recordsHits = network.filter((n) => FORBIDDEN_ON_MOUNT.test(n.url));
  phase.forbidden = recordsHits.map((n) => ({ status: n.status, url: n.url }));
  if (recordsHits.length) {
    fail(`${phaseKey}-no-attendance-records`, `attendance/records called ${recordsHits.length}x on mount`);
  } else {
    pass(`${phaseKey}-no-attendance-records`, 'attendance/records not called on initial load');
  }

  const bad = network.filter((n) => n.status === 0 || n.status >= 400);
  if (bad.length) {
    fail(`${phaseKey}-bad-http`, `${bad.length} bad /api/hrm responses`);
  }
}

function writeEvidence() {
  const verdict = results.hardFails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.verdict = verdict;
  results.finishedAt = new Date().toISOString();

  const reqTable = (phase) => {
    const rows = [];
    for (const req of DASHBOARD_REQUIRED) {
      const hit = phase.required[req.label];
      rows.push(`| ${req.label} | ${hit?.status ?? 'MISSING'} | ${(hit?.url ?? '—').slice(0, 120)} |`);
    }
    return rows.join('\n');
  };

  const lines = [
    '# QA-HRM-DASH-NET-01-VERIFY',
    '',
    '**work_item_id:** QA-HRM-DASH-NET-01-VERIFY',
    `**Generated:** ${results.finishedAt}`,
    `**Portal:** ${PORTAL}`,
    `**Account:** ${EMAIL} · companyId=main · U65 zero-seed`,
    `**Fix under test:** D-HRM-DASH-NET-01 · docs/qa/evidence/d-hrm-dash-net-01-20260730.md`,
    `**ack_status:** ${verdict}`,
    '',
    '## Verdict',
    '',
    verdict === 'PASS_TO_PM'
      ? '🟢 **PASS** — dashboard load includes all 4 required endpoints 2xx; no `attendance/records` on mount; F5 stable; no Sync ERROR banner.'
      : `🔴 **FAIL** — ${results.hardFails.length} hardFail(s) — see below.`,
    '',
    '## L0 gates',
    '',
    '| Gate | Exit |',
    '|------|------|',
    `| qc:dev-stack | ${results.l0.qc_dev_stack?.exit ?? '?'} |`,
    `| qc:fe-be-health | ${results.l0.qc_fe_be_health?.exit ?? '?'} |`,
    '',
    '## Initial load — `/command-center/hrm/dashboard`',
    '',
    `- URL: ${qPortal('/command-center/hrm/dashboard')}`,
    `- Error banner: **${results.load1.banner}**`,
    `- HRM API calls captured: **${results.load1.network.length}**`,
    '',
    '### Required endpoints',
    '',
    '| Endpoint | Status | URL |',
    '|----------|--------|-----|',
    reqTable(results.load1),
    '',
    '### Forbidden on mount',
    '',
    results.load1.forbidden.length
      ? `🔴 \`attendance/records\` called:\n\n| Status | URL |\n|--------|-----|\n${results.load1.forbidden.map((f) => `| ${f.status} | ${f.url} |`).join('\n')}`
      : '🟢 `attendance/records` **not called** on initial dashboard mount',
    '',
    '### All HRM requests (load 1)',
    '',
    '| Method | Status | URL |',
    '|--------|--------|-----|',
    ...results.load1.network.map((n) => `| ${n.method} | ${n.status} | ${n.url} |`),
    '',
    '## F5 reload (stability)',
    '',
    `- Error banner after F5: **${results.f5.banner}**`,
    `- HRM API calls captured: **${results.f5.network.length}**`,
    '',
    '### Required endpoints (F5)',
    '',
    '| Endpoint | Status | URL |',
    '|----------|--------|-----|',
    reqTable(results.f5),
    '',
    '### Forbidden on mount (F5)',
    '',
    results.f5.forbidden.length
      ? `🔴 \`attendance/records\` called after F5`
      : '🟢 `attendance/records` **not called** after F5',
    '',
    '## Matrix',
    '',
    '| Row | Verdict |',
    '|-----|---------|',
    '| P-CC-HRM-DASH | ' + (verdict === 'PASS_TO_PM' ? '🟢' : '🔴') + ' |',
    '',
    '## Residual (out of scope)',
    '',
    '- `performance/evaluations` 500 → D-HRM-PERF-EVAL-500-01 (dev-be)',
    '- Full 19-menu embed re-audit → QA-HRM-EMBED-NETWORK-AUDIT-01-R2',
    '',
  ];

  if (results.hardFails.length) {
    lines.push('## hardFails', '');
    for (const f of results.hardFails) {
      lines.push(`- **${f.id}:** ${f.detail}`);
    }
    lines.push('');
  }

  lines.push('## Screenshots', '', `- ${SCREEN_DIR.replace(/\\/g, '/')}`, '');
  lines.push('## Runtime', '', `- ${RUNTIME.replace(/\\/g, '/')}`, '');

  writeFileSync(EVIDENCE, lines.join('\n'));
  console.log(`\nWrote ${EVIDENCE}`);

  // Append dashboard section to r2 audit file
  const r2Section = [
    '',
    '---',
    '',
    '## R2 — Dashboard retest (QA-HRM-DASH-NET-01-VERIFY)',
    '',
    `**Generated:** ${results.finishedAt}`,
    `**ack_status:** ${verdict}`,
    '',
    '| Endpoint | Load 1 | F5 |',
    '|----------|--------|-----|',
    ...DASHBOARD_REQUIRED.map((req) => {
      const a = results.load1.required[req.label];
      const b = results.f5.required[req.label];
      return `| ${req.label} | ${a?.status ?? 'MISSING'} | ${b?.status ?? 'MISSING'} |`;
    }),
    '',
    `| attendance/records on mount | ${results.load1.forbidden.length ? '🔴 CALLED' : '🟢 absent'} | ${results.f5.forbidden.length ? '🔴 CALLED' : '🟢 absent'} |`,
    `| Sync ERROR banner | ${results.load1.banner ? '🔴' : '🟢'} | ${results.f5.banner ? '🔴' : '🟢'} |`,
    '',
    `Full evidence: docs/qa/evidence/qa-hrm-dash-net-01-verify-20260730.md`,
    '',
  ].join('\n');

  if (existsSync(AUDIT_R2)) {
    writeFileSync(AUDIT_R2, readFileSync(AUDIT_R2, 'utf8') + r2Section);
  } else {
    writeFileSync(
      AUDIT_R2,
      [
        '# QA-HRM-EMBED-NETWORK-AUDIT-01 — Round 2',
        '',
        '**Parent:** docs/qa/evidence/qa-hrm-embed-network-audit-20260730.md',
        '',
      ].join('\n') + r2Section,
    );
  }
  console.log(`Appended dashboard section to ${AUDIT_R2}`);

  save();
  return verdict;
}

async function main() {
  console.log('=== QA-HRM-DASH-NET-01-VERIFY ===\n');
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
    await injectSession(page, session);

    const loadNet = [];
    attachNetworkCapture(page, loadNet);

    await page.goto(qPortal('/command-center/hrm/dashboard'), {
      waitUntil: 'networkidle2',
      timeout: 120000,
    });
    await sleep(3000);

    const err1 = await pageHasErrorBanner(page);
    results.load1.banner = err1.banner;
    if (err1.banner) fail('load1-banner', `HRM error banner: ${err1.snippet.slice(0, 120)}`);
    else pass('load1-banner', 'no Sync ERROR banner');

    await shot(page, 'dashboard-load1');
    analyzeNetwork(loadNet, 'load1');

    // F5 reload
    const f5Net = [];
    attachNetworkCapture(page, f5Net);
    await page.reload({ waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(3000);

    const err2 = await pageHasErrorBanner(page);
    results.f5.banner = err2.banner;
    if (err2.banner) fail('f5-banner', `HRM error banner after F5`);
    else pass('f5-banner', 'F5 stable — no banner');

    await shot(page, 'dashboard-f5');
    analyzeNetwork(f5Net, 'f5');

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
