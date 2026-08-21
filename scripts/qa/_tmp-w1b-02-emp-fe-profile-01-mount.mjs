/**
 * W1-B-02-EMP-FE-PROFILE-01 — Vite + #root mount smoke (dev-fe evidence, not UF PASS)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:8080';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-w1b-02-emp-fe-profile-01-mount.json');

const out = {
  work_item_id: 'W1-B-02-EMP-FE-PROFILE-01',
  startedAt: new Date().toISOString(),
  vite: {},
  mount: {},
  consoleErrors: [],
  pageErrors: [],
  network: [],
};

for (const base of [PORTAL, HRM]) {
  const u = `${base}/hr/src/pages/EmployeeProfile.tsx`;
  const r = await fetch(u);
  const t = await r.text();
  out.vite[base] = {
    status: r.status,
    resolveFail: /Failed to resolve|Internal Server Error/.test(t),
    len: t.length,
  };
}

const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const loginJson = await login.json();
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
};

const listRes = await fetch(
  `${PORTAL}/api/hrm/employees?company_id=${encodeURIComponent(companyId)}&page=1&page_size=5`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const listJson = await listRes.json();
const items = listJson?.data?.items || listJson?.data?.data || listJson?.items || [];
const emp = Array.isArray(items) ? items[0] : null;
out.listApi = {
  status: listRes.status,
  total: listJson?.data?.total ?? items?.length,
  empId: emp?.id,
};

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
  if (
    /EmployeeProfile|PermissionFallback|employeeProfileTabGroups|ViDateField|EmployeeCompensation|contractEndDatePolicy|\/api\/hrm\/employees\//.test(
      url,
    )
  ) {
    out.network.push({ status: res.status(), url: url.slice(0, 220) });
  }
});

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
    if (s.raw?.defaultMembershipId) {
      store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }
}, session);

if (!emp?.id) {
  out.verdict = 'FAIL_NO_EMP';
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  process.exit(2);
}

const detailUrl = `${PORTAL}/hr/employees/${emp.id}?portal=1&tenantId=xevn&companyId=${companyId}`;
await page.goto(detailUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);

const detail = await page.evaluate(() => {
  const root = document.querySelector('#root');
  const text = root?.innerText || '';
  return {
    childCount: root?.childElementCount ?? 0,
    textLen: text.length,
    hasProfileHint: /hồ sơ|thông tin chung|công việc|hợp đồng|lương|bảo hiểm|chỉnh sửa|quay lại|chung/i.test(
      text,
    ),
    snippet: text.replace(/\s+/g, ' ').slice(0, 320),
  };
});
out.mount.detail = { url: page.url(), empId: emp.id, ...detail };
out.finishedAt = new Date().toISOString();

const viteOk =
  out.vite[PORTAL].status === 200 &&
  out.vite[HRM].status === 200 &&
  !out.vite[PORTAL].resolveFail &&
  !out.vite[HRM].resolveFail;
const mountOk = detail.childCount > 0 && detail.textLen > 40;
const noResolveConsole = !out.consoleErrors.some((e) =>
  /Failed to resolve|PermissionFallback|employeeProfileTabGroups|ViDateField|EmployeeCompensation/i.test(
    e,
  ),
);
out.verdict = viteOk && mountOk && noResolveConsole ? 'PASS_MOUNT' : 'FAIL';
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
process.exit(out.verdict === 'PASS_MOUNT' ? 0 : 2);
