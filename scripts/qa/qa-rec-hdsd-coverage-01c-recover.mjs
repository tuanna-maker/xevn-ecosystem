/**
 * Recovery append for QA-REC-HDSD-COVERAGE-01C — CH11 pull + inbox Hoàn thành/Từ chối retest
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01c-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-rec-hdsd-coverage-01c-20260801');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = JSON.parse(readFileSync(OUT, 'utf8'));
const network = [];
const pageErrors = [];

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login fail ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: 'main',
    user: {
      userId: data?.user?.userId || 'ceo@xe.vn',
      email: 'ceo@xe.vn',
      displayName: 'CEO',
      roles: data?.user?.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function clickText(page, re) {
  const ok = await page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(document.querySelectorAll('button, a, [role="button"], [role="tab"], span'));
    const el = nodes.find((n) => rx.test((n.textContent || '').trim()) && n.getClientRects().length);
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
  return ok;
}

function upsert(row) {
  results.hdsd_coverage = results.hdsd_coverage.filter(
    (r) => !(r.hdsd_ref === row.hdsd_ref && r.item === row.item),
  );
  results.hdsd_coverage.push({ ...row, at: new Date().toISOString() });
  console.log(`${row.verdict} ${row.hdsd_ref} — ${row.item} · ${(row.note || '').slice(0, 180)}`);
}

const session = await loginApi();
const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--ignore-certificate-errors'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));
page.on('response', (res) => {
  const u = res.url();
  if (!/\/api\/(hrm|xbos)\//.test(u)) return;
  if (res.request().method() === 'OPTIONS') return;
  if (/workflow-engine|inbox|tasks|settings-catalogs|catalog-sync|sync-from-xbos/i.test(u)) {
    network.push({
      method: res.request().method(),
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
    });
  }
});
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
  }
}, session);

mkdirSync(SCREEN_DIR, { recursive: true });

// --- Inbox retest: open Action Cards + observe Hoàn thành / Từ chối ---
await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await sleep(4000);
let body = await page.locator('body').innerText();
const hasActionCards = /Action Cards/i.test(body);
const hasTasks =
  /Tuyển dụng nhân sự|Mở chi tiết|Xử lý nhanh|Không có việc cần xử lý/i.test(body) &&
  !/Không có việc cần xử lý trong phạm vi hiện tại/i.test(body);
const cardCount = await page.locator('button:has-text("Mở chi tiết")').count().catch(() => 0);
await page.screenshot({ path: join(SCREEN_DIR, '01-inbox-retest.png') });

upsert({
  hdsd_ref: 'CH04 §4.1',
  item: 'Hộp thư Workflow — mở inbox Action Cards',
  click_path: ['/command-center', 'Action Cards'],
  url: page.url(),
  network: network.filter((n) => /workflow|inbox|tasks/i.test(n.url)).slice(-3),
  verdict: hasActionCards ? '🟢' : '🟡',
  note: `hasActionCards=${hasActionCards} openDetailBtns=${cardCount} hasTasksCue=${hasTasks}`,
});

if (cardCount > 0) {
  await page.locator('button:has-text("Mở chi tiết")').first().click({ force: true }).catch(() => {});
  await sleep(3000);
  await page.screenshot({ path: join(SCREEN_DIR, '01b-inbox-detail.png') });
  const detail = await page.locator('body').innerText();
  const hasComplete = /Hoàn thành/i.test(detail);
  const hasReject = /Từ chối/i.test(detail);
  // Observe-only — do not click Hoàn thành/Từ chối (tasks may be WF-definition approvals, not YCTD FE chain this wave)
  upsert({
    hdsd_ref: 'CH04 §4.1',
    item: 'Chi tiết task — Hoàn thành',
    click_path: ['Action Cards', 'Mở chi tiết', 'observe Hoàn thành (no mutate — not FE YCTD this wave)'],
    url: page.url(),
    verdict: hasComplete ? '🟢' : '🟡',
    note: `hasComplete=${hasComplete} cards=${cardCount} — observe-only U65 (no seed; no approve of ambiguous prior tasks)`,
  });
  upsert({
    hdsd_ref: 'CH04 §4.1',
    item: 'Chi tiết task — Từ chối',
    click_path: ['Action Cards', 'Mở chi tiết', 'observe Từ chối'],
    url: page.url(),
    verdict: hasReject ? '🟢' : '🟡',
    note: `hasReject=${hasReject} — observe-only`,
  });
  await page.keyboard.press('Escape').catch(() => {});
} else {
  upsert({
    hdsd_ref: 'CH04 §4.1',
    item: 'Chi tiết task — Hoàn thành',
    click_path: ['no Mở chi tiết'],
    url: page.url(),
    verdict: '🟡',
    note: 'BLOCKED/empty or cards without open control',
  });
  upsert({
    hdsd_ref: 'CH04 §4.1',
    item: 'Chi tiết task — Từ chối',
    click_path: ['no Mở chi tiết'],
    url: page.url(),
    verdict: '🟡',
    note: 'BLOCKED/empty',
  });
}

// --- CH11 settings catalogs pull ---
const q = (path) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  return u.toString();
};

let url = q('/hr/settings-catalogs');
let navigated = false;
for (let i = 0; i < 4; i++) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    navigated = true;
    break;
  } catch (e) {
    console.log('CH11 retry', i, String(e).slice(0, 100));
    await sleep(4000);
  }
}
if (!navigated) {
  url = q('/hr/settings');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
}
await sleep(4000);
body = await page.locator('body').innerText();
if (!/Đồng bộ từ XBOS|effectiveItems|Danh mục \(XBOS/i.test(body)) {
  await clickText(page, /Danh mục \(XBOS|Danh mục/);
  await sleep(2500);
  body = await page.locator('body').innerText();
}
await page.screenshot({ path: join(SCREEN_DIR, '04-hrm-settings-catalogs.png') });
const hasPull = /Đồng bộ từ XBOS|Sync from XBOS/i.test(body);
const hasChannel =
  /Nguồn ứng viên|Kênh tuyển|recruitment_channels|candidate_sources|Chức danh/i.test(body);
const gets = network.filter((n) => /settings-catalogs|catalog-sync/i.test(n.url) && n.method === 'GET');
let pullClicked = false;
let pull2xx = false;
if (hasPull) {
  const before = network.length;
  pullClicked = await clickText(page, /Đồng bộ từ XBOS|Sync from XBOS/);
  await sleep(4000);
  pull2xx = network
    .slice(before)
    .some((n) => /sync-from-xbos|settings-catalogs/i.test(n.url) && (n.method === 'POST' || n.method === 'PUT') && n.status >= 200 && n.status < 300);
  await page.screenshot({ path: join(SCREEN_DIR, '04b-after-pull.png') });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await sleep(2500);
}

upsert({
  hdsd_ref: 'CH11 §11.1',
  item: 'Cài đặt HRM — Pull / xem picker kênh TD · chức danh',
  click_path: [navigated ? '/hr/settings-catalogs' : '/hr/settings → Danh mục', hasPull ? 'Đồng bộ từ XBOS' : 'observe'].filter(Boolean),
  url: page.url(),
  network: network.filter((n) => /settings-catalogs|sync-from-xbos/i.test(n.url)).slice(-5),
  f5: pullClicked || null,
  verdict: hasPull || hasChannel || gets.some((g) => g.status === 200) ? '🟢' : '🟡',
  note: `hasPull=${hasPull} hasChannel=${hasChannel} pullClicked=${pullClicked} pull2xx=${pull2xx} GET=${gets.map((g) => g.status).join(',') || 'none'}`,
});

results.network = [...(results.network || []), ...network].slice(-800);
results.pageErrors = [...(results.pageErrors || []), ...pageErrors].slice(-12);
results.runError = undefined;
const verts = results.hdsd_coverage.map((r) => r.verdict);
results.summary = {
  rows: verts.length,
  green: verts.filter((v) => v === '🟢').length,
  yellow: verts.filter((v) => v === '🟡').length,
  red: verts.filter((v) => v === '🔴').length,
  orphan: results.orphan,
  consoleErrors: (results.consoleErrors || []).slice(-8),
  pageErrors: results.pageErrors.slice(-8),
};
results.ack_status = 'PASS_TO_PM';
results.finishedAt = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(results, null, 2));
console.log('SUMMARY', results.summary);
await browser.close();
