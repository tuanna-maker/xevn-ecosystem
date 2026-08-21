/**
 * PO-HRM-CONTRACT-LEGAL-PRINT-FE-04 — Vite hrmApi + Settings contract-legal mount smoke
 * Dev-FE evidence only (not UF PASS / not printable UAT). Honesty locked false.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-contract-legal-print-fe-04-mount.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-contract-legal-print-fe-04');
mkdirSync(SCREEN, { recursive: true });

const out = {
  work_item_id: 'PO-HRM-CONTRACT-LEGAL-PRINT-FE-04',
  defect: 'D-CTR-FE-HRMAPI-COMMENT-SWC',
  startedAt: new Date().toISOString(),
  honesty: { contracts_printable_ready: false, seed_used: false },
  vite: {},
  mount: {},
  consoleErrors: [],
  pageErrors: [],
  network: [],
};

const hrmApiUrl = `${PORTAL}/hr/src/integrations/hrmApi.ts`;
const viteRes = await fetch(hrmApiUrl);
const viteText = await viteRes.text();
out.vite = {
  url: hrmApiUrl,
  status: viteRes.status,
  len: viteText.length,
  hasSwcSyntaxError: /Expected ';'|Syntax Error|Internal Server Error/i.test(viteText),
  hasOriginStarSlashPublish: /origin\*\/publish/.test(viteText),
};

const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).catch(async () =>
  fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  }),
);
const loginJson = await login.json().catch(() => ({}));
out.loginStatus = login.status;
const data = loginJson?.data || {};
const token = data.accessToken || data.access_token;
const companyId = data.defaultCompanyId || data.memberships?.[0]?.companyId || 'main';
const u = data.user || {};
const session = {
  token,
  expiresAt: Date.now() + 8 * 3600_000,
  user: {
    userId: u.userId || u.id || u.email || EMAIL,
    email: u.email || EMAIL,
    displayName: u.displayName || 'CEO Tập đoàn',
    roles: u.roles || ['group_ceo'],
  },
  raw: data,
  companyId,
};

if (!token) {
  out.verdict = 'FAIL_LOGIN';
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  process.exit(2);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--disable-dev-shm-usage'],
});
const page = await browser.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') out.consoleErrors.push(m.text().slice(0, 400));
});
page.on('pageerror', (e) => out.pageErrors.push(String(e).slice(0, 400)));
page.on('response', (res) => {
  const url = res.url();
  if (/hrmApi\.ts|Settings\.tsx|ContractLegalPrint|ctr-library|\/hr\/settings/.test(url)) {
    out.network.push({ status: res.status(), url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 220) });
  }
});

await page.addInitScript((s) => {
  const payload = JSON.stringify(s.user);
  for (const store of [localStorage, sessionStorage]) {
    store.setItem('xevn.portal.accessToken', s.token);
    store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
    store.setItem('xevn.portal.user', payload);
    store.setItem('xevn.portal.tenantId', 'xevn');
    store.setItem('xevn.portal.companyId', s.companyId || 'main');
    store.setItem('hrm_portal_mode', '1');
    store.setItem('hrm_current_company_id', s.companyId || 'main');
    store.setItem('hrm_current_tenant_id', 'xevn');
    if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    if (s.raw?.defaultMembershipId) {
      store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }
}, session);

const settingsUrl = `${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=${encodeURIComponent(companyId)}&tab=contract-legal`;
await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);
const tabBtn = page.getByTestId('settings-tab-contract-legal');
if (await tabBtn.isVisible().catch(() => false)) {
  await tabBtn.click({ force: true });
  await page.waitForTimeout(1500);
}
await page.getByTestId('ctr-library-publish-panel').waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

const mount = await page.evaluate(() => {
  const root = document.querySelector('#root');
  const text = root?.innerText || '';
  return {
    rootChildCount: root?.childElementCount ?? 0,
    textLen: text.length,
    hasPanel: !!document.querySelector('[data-testid="ctr-library-publish-panel"]'),
    hasSettingsPrint: !!document.querySelector('[data-testid="settings-contract-legal-print"]'),
    hasTab: !!document.querySelector('[data-testid="settings-tab-contract-legal"]'),
    snippet: text.replace(/\s+/g, ' ').slice(0, 360),
  };
});
out.mount = { url: page.url(), ...mount };

const shotPath = join(SCREEN, 'settings-contract-legal.png');
await page.screenshot({ path: shotPath, fullPage: false }).catch(() => {});
out.screen = shotPath.replace(/\\/g, '/');

const hrmApiNet = out.network.filter((n) => /hrmApi\.ts/.test(n.url));
out.hrmApiNetwork = hrmApiNet;

const viteOk = out.vite.status === 200 && !out.vite.hasSwcSyntaxError;
const mountOk = mount.rootChildCount > 0 && mount.hasPanel;
const noHrmApi500 = !hrmApiNet.some((n) => n.status >= 500);
out.verdict = viteOk && mountOk && noHrmApi500 ? 'PASS_MOUNT' : 'FAIL';
out.finishedAt = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
process.exit(out.verdict === 'PASS_MOUNT' ? 0 : 2);
