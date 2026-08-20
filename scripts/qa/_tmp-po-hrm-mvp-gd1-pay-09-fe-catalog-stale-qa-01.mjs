#!/usr/bin/env node
/**
 * QA-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01 — J-HRM-PAY-09-01 no-F5 row visibility
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `PAY09CSTQA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;
const GROUP_CODE = `Q09CST${Date.now().toString(36).toUpperCase().slice(-6)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'QA-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01',
  stamp: STAMP,
  fe_handoff: 'docs/qa/evidence/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md',
  prior_fe_qa: 'PAY09FEQA1-MSMLA825',
  defect_target: 'FE-PAY09-CATALOG-LIST-STALE',
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: { payroll_e2e_ready: false, ne_pay09_done: true, c_slice: true, seed_used: false },
  env: { PORTAL, XBOS, TENANT, commit: COMMIT },
  l0: { qc_fe_be_health: 'PASS (manual pre-run)' },
  l1: { fe_vitest: '11 PASS (3 files)' },
  browser: {},
  journeys: {},
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  defects: [],
  ack_status: null,
  overall: null,
  endedAt: null,
};

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function loginApi() {
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = { ...d, accessToken: token };
        break;
      }
    } catch {
      /* */
    }
  }
  if (!data?.accessToken) throw new Error('login failed');
  return {
    token: data.accessToken,
    user: data.user ?? { email: EMAIL },
    companyId: COMPANY,
    expiresAt: Date.now() + 3600000,
    raw: data,
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      store.setItem('access_token', s.token);
      store.setItem('token', s.token);
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

async function openPayGroups(page) {
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2000);
  await page.getByTestId('payroll-tab-policy').click();
  await sleep(400);
  await page.getByRole('menuitem', { name: /Phân nhóm bảng lương/ }).click();
  await sleep(1500);
  await page.getByTestId('pay-groups-catalog-precision').waitFor({ state: 'visible', timeout: 45000 });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function writeMd() {
  const j = R.journeys['J-HRM-PAY-09-01'] || {};
  const md = `# Evidence — QA-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01

| Field | Value |
|-------|--------|
| **work_item_id** | \`QA-PO-HRM-MVP-GD1-PAY-09-FE-CATALOG-STALE-01\` |
| **dev handoff** | \`docs/qa/evidence/po-hrm-mvp-gd1-pay-09-fe-catalog-stale-01.md\` |
| **date** | 2026-08-10 |
| **stamp** | **\`${STAMP}\`** |
| **ack_status** | **${R.ack_status}** |
| **overall** | **${R.overall}** · C-SLICE · **≠** PAY module DONE · \`payroll_e2e_ready=false\` |
| **persona** | \`ceo@xe.vn\` · \`companyId=main\` · U65 zero-seed |
| **prior FE QA** | \`PAY09FEQA1-MSMLA825\` (defect \`FE-PAY09-CATALOG-LIST-STALE\`) |
| **runner** | \`scripts/qa/_tmp-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.mjs\` |
| **raw JSON** | \`docs/qa/evidence/_tmp-po-hrm-mvp-gd1-pay-09-fe-catalog-stale-qa-01.json\` |
| **commit** | \`${COMMIT}\` |

## HDSD click path

\`\`\`text
Lương → Chính sách → Phân nhóm bảng lương
Tạo nhóm mới → Lưu (no manual F5)
\`\`\`

## Gates

| Gate | Result |
|------|--------|
| L0 | \`pnpm run qc:fe-be-health\` **PASS** |
| L1 vitest | **11 PASS** — payPay09GroupRing · clusterFe01 source · usePayrollGroups.cache |

## J-HRM-PAY-09-01

| Check | Result |
|-------|--------|
| Verdict | **${j.verdict || '—'}** |
| POST create | ${R.browser.j09_01_post ? JSON.stringify(R.browser.j09_01_post) : '—'} |
| Row visible ≤20s (no F5) | **${R.browser.j09_01_row_without_f5}** |
| Defect cleared | **${R.browser.defect_fe_pay09_catalog_list_stale_cleared}** |

\`\`\`json
${JSON.stringify(R.browser, null, 2)}
\`\`\`

**Screens:** ${R.screens.map((s) => `\`${s}\``).join(' · ') || '—'}

## Console (errors only)

${R.consoleErrors.slice(0, 8).map((e) => `- ${e}`).join('\n') || '—'}

## honesty footer

> **payroll_e2e_ready=false** · **C-SLICE** · **≠ PAY module UAT** · cấm claim PAY-09 / PAY module DONE

**ack_status:** **${R.ack_status}**
`;
  writeFileSync(OUT_MD, md);
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

async function main() {
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 240));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 240)));

  let groupId = null;
  let rowWithoutF5 = false;

  try {
    await injectPortalAuth(page, session);
    await openPayGroups(page);
    await shot(page, 'before-create');

    const honestyFooter = page.getByTestId('pay09-catalog-honesty-footer');
    const honestyText = (await honestyFooter.textContent().catch(() => '')) || '';
    R.browser.honesty_footer_visible = /payroll_e2e_ready=false|C-SLICE/i.test(honestyText);

    await page.getByTestId('pay-group-create-btn').click();
    await page.getByTestId('pay-group-form-code').fill(GROUP_CODE);
    await page.getByTestId('pay-group-form-name').fill(`QA catalog stale ${GROUP_CODE}`);

    const createWait = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        /\/api\/hrm\/payroll\/groups/.test(res.url()) &&
        res.status() >= 200 &&
        res.status() < 300,
      { timeout: 45000 },
    );
    await page.getByTestId('pay-group-form-submit').click();
    const createRes = await createWait;
    const createJson = await createRes.json().catch(() => ({}));
    groupId = createJson?.data?.id ?? createJson?.id;
    R.browser.j09_01_post = { status: createRes.status(), id: groupId, code: GROUP_CODE };

    await page
      .waitForResponse(
        (res) => res.request().method() === 'GET' && /\/payroll\/groups\?/.test(res.url()) && res.status() === 200,
        { timeout: 20000 },
      )
      .catch(() => {});

    const rowById = groupId ? page.getByTestId(`pay-group-row-${groupId}`) : null;
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      const ok =
        (rowById && (await rowById.isVisible().catch(() => false))) ||
        (await page
          .locator(`[data-testid^="pay-group-row-"]`)
          .filter({ hasText: GROUP_CODE })
          .first()
          .isVisible()
          .catch(() => false));
      if (ok) {
        rowWithoutF5 = true;
        break;
      }
      await sleep(400);
    }

    R.browser.j09_01_row_without_f5 = rowWithoutF5;
    R.browser.defect_fe_pay09_catalog_list_stale_cleared =
      createRes.status() === 201 && rowWithoutF5;

    await shot(page, 'after-create-no-f5');

    const verdict =
      createRes.status() === 201 && rowWithoutF5 ? 'PASS' : 'FAIL';
    R.journeys['J-HRM-PAY-09-01'] = {
      verdict,
      at: ts(),
      summary: `POST ${createRes.status()} · pay-group-row-${groupId || '?'} visible without F5=${rowWithoutF5}`,
      hdsd: 'Lương → Chính sách → Phân nhóm bảng lương',
    };

    if (!rowWithoutF5) {
      R.defects.push({
        id: 'FE-PAY09-CATALOG-LIST-STALE',
        note: 'POST 201 but pay-group-row not visible within 20s without reload',
      });
    }

    R.overall = verdict === 'PASS' ? 'PASS' : 'FAIL';
    R.ack_status = verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL';
  } catch (e) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL';
    R.journeys['J-HRM-PAY-09-01'] = {
      verdict: 'FAIL',
      at: ts(),
      summary: String(e).slice(0, 300),
    };
    R.defects.push({ id: 'RUNNER', note: String(e).slice(0, 400) });
  } finally {
    R.endedAt = ts();
    await browser.close().catch(() => {});
    writeMd();
    console.log(JSON.stringify({ stamp: STAMP, ack_status: R.ack_status, browser: R.browser }, null, 2));
    process.exit(R.ack_status === 'PASS_TO_PM' ? 0 : 1);
  }
}

main();
