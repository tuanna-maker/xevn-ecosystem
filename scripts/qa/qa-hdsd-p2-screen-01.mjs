/**
 * QA-HDSD-P2-SCREEN-01 — spot-check routes + MD inline images + PNG inventory
 * U65 zero-seed · browser-only route smoke
 */
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const HDSD = resolve(ROOT, 'docs/client-delivery/hdsd');
const ASSETS = join(HDSD, 'assets');
const OUT = resolve(ROOT, 'docs/qa/evidence/qa-hdsd-p2-screen-01-20260730-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-hdsd-p2-screen-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const SPOT_ROUTES = [
  { id: 'R-LOGIN', path: '/login', auth: false, label: 'Login' },
  { id: 'R-CC', path: '/command-center', auth: true, label: 'Command Center' },
  { id: 'R-HRM-EMP', path: '/command-center/hrm/employees', auth: true, label: 'HRM employees embed', waitIframe: true },
  {
    id: 'R-SETTINGS-ORG',
    path: '/command-center?settings=company_member_units',
    auth: true,
    label: 'Settings org units',
  },
  { id: 'R-HRM-PAYROLL', path: '/command-center/hrm/payroll', auth: true, label: 'HRM payroll embed', waitIframe: true },
];

const MD_SPOT = [
  {
    id: 'MD-ECO-CH01',
    file: 'ecosystem/HDSD_ECOSYSTEM_CH01_CONG_VA_CHUYEN_PHAN_HE.md',
    sampleImages: ['../assets/ecosystem/eco-1.png', '../assets/ecosystem/eco-2.png'],
  },
  {
    id: 'MD-XBOS-CH03',
    file: 'xbos/HDSD_XEVN_CH03_XBOS_TO_CHUC.md',
    sampleImages: ['../assets/xbos/xbos-3-0.png', '../assets/xbos/xbos-3-1.png'],
  },
  {
    id: 'MD-HRM-CH05',
    file: 'hrm/HDSD_XEVN_CH05_HRM_NHAN_SU.md',
    sampleImages: ['../assets/hrm/hrm-5-1.png', '../assets/hrm/hrm-5-4.png'],
  },
];

const manifest = JSON.parse(readFileSync(resolve(ROOT, 'scripts/hdsd/hdsd-capture-manifest.json'), 'utf8'));

const results = {
  work_item_id: 'QA-HDSD-P2-SCREEN-01',
  upstream: 'HDSD-P2-SCREEN-01',
  program: 'HDSD-P2-FULL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: null,
  routes: [],
  mdSpot: [],
  pngInventory: null,
  verdict: 'PENDING',
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 10 });
}

async function portalLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
}

function scanForbidden(bodyText, url) {
  const t = bodyText || '';
  if (/access denied|403 forbidden|bạn không có quyền|permission denied/i.test(t)) return 'access_denied';
  if (/^\s*$/.test(t) && !/\/login/.test(url)) return 'blank_body';
  if (/Sync ERROR|HRM API request failed|54321|ERR_CONNECTION_REFUSED/i.test(t)) return 'api_error_banner';
  return null;
}

function listPngs(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) listPngs(p, acc);
    else if (name.name.endsWith('.png')) acc.push(p);
  }
  return acc;
}

function slugForFigure(id, domain) {
  const d = domain || 'xbos';
  const s = String(id)
    .toLowerCase()
    .replace(/\./g, '-');
  if (id.startsWith('ECO')) return `ecosystem/eco-${s.replace(/^eco-/, '')}`;
  if (id.startsWith('XBOS')) return `xbos/${s}`;
  if (id.startsWith('HRM')) return `hrm/${s.toLowerCase()}`;
  return `${d}/${d === 'hrm' ? 'hrm' : 'xbos'}-${s}`;
}

function auditPngInventory() {
  const pngs = listPngs(ASSETS);
  const usable = pngs.filter((p) => {
    try {
      return statSync(p).size > 1024;
    } catch {
      return false;
    }
  });
  const skippedIds = new Set((manifest.skipped || []).map((s) => s.id));
  const capturable = manifest.figures.filter((f) => !skippedIds.has(f.id));
  const missingFigureIds = [];
  for (const fig of capturable) {
    const domainDir = join(ASSETS, fig.domain);
    const prefix = fig.id.replace(/\./g, '-').toLowerCase();
    const candidates = usable.filter((p) => {
      const rel = relative(ASSETS, p).replace(/\\/g, '/').toLowerCase();
      return rel.includes(prefix) || rel.includes(fig.id.toLowerCase().replace(/\./g, '-'));
    });
    if (candidates.length === 0) {
      const slug = slugForFigure(fig.id, fig.domain);
      const expected = join(ASSETS, `${slug}.png`);
      if (!existsSync(expected) || statSync(expected).size <= 1024) {
        missingFigureIds.push(fig.id);
      }
    }
  }

  const byDomain = { ecosystem: 0, xbos: 0, hrm: 0 };
  for (const p of usable) {
    const rel = relative(ASSETS, p).replace(/\\/g, '/');
    const dom = rel.split('/')[0];
    if (byDomain[dom] !== undefined) byDomain[dom]++;
  }

  return {
    totalPngOnDisk: pngs.length,
    usablePngCount: usable.length,
    byDomain,
    capturableFigureCount: capturable.length,
    missingFigureIds,
    passThreshold95: usable.length >= 95,
  };
}

function auditMdSpot() {
  const imgRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  for (const spot of MD_SPOT) {
    const full = join(HDSD, spot.file);
    const md = readFileSync(full, 'utf8');
    const inlineImages = [];
    let m;
    while ((m = imgRe.exec(md)) !== null) inlineImages.push(m[1]);
    const resolved = inlineImages.map((rel) => {
      const abs = resolve(dirname(full), rel);
      const ok = existsSync(abs) && statSync(abs).size > 1024;
      return { rel, abs: abs.replace(/\\/g, '/'), ok, bytes: ok ? statSync(abs).size : 0 };
    });
    const sampleOk = spot.sampleImages.every((rel) => {
      const abs = resolve(dirname(full), rel);
      return existsSync(abs) && statSync(abs).size > 1024;
    });
    results.mdSpot.push({
      id: spot.id,
      file: spot.file,
      inlineCount: inlineImages.length,
      allResolved: resolved.every((r) => r.ok),
      sampleOk,
      images: resolved.slice(0, 6),
      verdict: resolved.every((r) => r.ok) && sampleOk ? '🟢' : '🔴',
    });
  }
  save();
}

(async () => {
  console.log('=== QA-HDSD-P2-SCREEN-01 ===');

  results.pngInventory = auditPngInventory();
  console.log(`PNG usable: ${results.pngInventory.usablePngCount} (missing figures: ${results.pngInventory.missingFigureIds.length})`);
  auditMdSpot();

  let buildSpot = { ran: false, htmlExists: false, imgTagsInHtml: 0 };
  const skipBuild = process.env.SKIP_HDSD_BUILD === '1';
  if (!skipBuild) {
    try {
      const { spawnSync } = await import('node:child_process');
      const br = spawnSync('pnpm', ['run', 'hdsd:build'], { cwd: ROOT, shell: true, encoding: 'utf8', timeout: 120000 });
      buildSpot.ran = true;
      buildSpot.exitCode = br.status;
      const htmlPath = join(HDSD, 'artifacts/HDSD_XEVN_ECOSYSTEM_v1.html');
      buildSpot.htmlExists = existsSync(htmlPath);
      if (buildSpot.htmlExists) {
        const html = readFileSync(htmlPath, 'utf8');
        buildSpot.imgTagsInHtml = (html.match(/<img[^>]+src="[^"]*assets\/(ecosystem|xbos|hrm)\/[^"]+\.png"/gi) || []).length;
      }
    } catch (e) {
      buildSpot.error = String(e).slice(0, 200);
    }
  } else {
    const htmlPath = join(HDSD, 'artifacts/HDSD_XEVN_ECOSYSTEM_v1.html');
    buildSpot.skipped = true;
    buildSpot.htmlExists = existsSync(htmlPath);
    if (buildSpot.htmlExists) {
      const html = readFileSync(htmlPath, 'utf8');
      buildSpot.imgTagsInHtml = (html.match(/<img[^>]+src="[^"]*assets\/(ecosystem|xbos|hrm)\/[^"]+\.png"/gi) || []).length;
    }
  }
  results.buildSpot = buildSpot;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 160));
  });

  try {
    let loggedIn = false;
    for (const route of SPOT_ROUTES) {
      const url = route.auth ? qPortal(route.path) : `${PORTAL}${route.path}`;
      if (route.auth && !loggedIn) {
        await portalLogin(page);
        loggedIn = true;
      }

      if (!route.auth) {
        await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.evaluate(() => {
          try {
            for (const s of [localStorage, sessionStorage]) s.clear();
          } catch {
            /* cross-origin guard */
          }
        }).catch(() => null);
      }

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      if (route.waitIframe) {
        await page.waitForSelector('iframe', { timeout: 20000 }).catch(() => null);
        await sleep(2500);
      } else {
        await sleep(1500);
      }

      mkdirSync(SCREEN_DIR, { recursive: true });
      const shotName = `${route.id.toLowerCase()}.png`;
      const shotPath = join(SCREEN_DIR, shotName);
      await page.screenshot({ path: shotPath, fullPage: false });

      const probe = await page.evaluate(() => ({
        url: location.href,
        title: document.title,
        body: (document.body?.innerText || '').slice(0, 800),
        hasIframe: !!document.querySelector('iframe'),
      }));

      const forbidden = scanForbidden(probe.body, probe.url);
      const onLoginUnexpected = route.auth && /\/login\b/.test(probe.url) && !route.path.includes('login');
      const verdict =
        forbidden || onLoginUnexpected
          ? '🔴'
          : probe.body.length < 40 && route.auth
            ? '🟡'
            : '🟢';

      results.routes.push({
        id: route.id,
        label: route.label,
        url: probe.url,
        title: probe.title,
        forbidden,
        onLoginUnexpected,
        hasIframe: probe.hasIframe,
        bodySnippet: probe.body.slice(0, 200),
        screenshot: shotPath.replace(/\\/g, '/'),
        verdict,
      });
      console.log(`${verdict} ${route.id} ${route.label}`);
      save();
    }
  } finally {
    await browser.close();
  }

  results.consoleErrors = consoleErrors.slice(0, 12);
  results.finishedAt = new Date().toISOString();

  const routesFail = results.routes.some((r) => r.verdict === '🔴');
  const mdFail = results.mdSpot.some((m) => m.verdict === '🔴');
  const pngFail = !results.pngInventory.passThreshold95 || results.pngInventory.missingFigureIds.length > 0;

  results.verdict =
    routesFail || mdFail || pngFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
  results.ack_status = results.verdict;

  save();
  console.log(`\nVERDICT: ${results.verdict}`);
  process.exit(routesFail || mdFail || pngFail ? 1 : 0);
})();
