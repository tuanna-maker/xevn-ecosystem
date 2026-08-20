import { chromium } from 'playwright';

const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const urls = [
  'http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main',
  'http://127.0.0.1:8080/hr/employees?portal=1&tenantId=xevn&companyId=main',
];

const browser = await chromium.launch({
  headless: true,
  executablePath: CHROME,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();

for (const url of urls) {
  const fails = [];
  const onRes = async (res) => {
    if (res.status() < 400) return;
    const u = res.url().replace(/^https?:\/\/[^/]+/, '');
    let snip = '';
    try {
      snip = (await res.text()).slice(0, 220);
    } catch {
      /* */
    }
    fails.push({ status: res.status(), url: u.slice(0, 220), snip });
  };
  const onCon = (m) => {
    if (m.type() === 'error') fails.push({ console: m.text().slice(0, 220) });
  };
  page.on('response', onRes);
  page.on('console', onCon);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 4500));
  const root = await page.evaluate(() => ({
    child: document.querySelector('#root')?.childElementCount ?? -1,
    title: document.title,
    body: (document.body?.innerText || '').slice(0, 400),
  }));
  // probe common entry modules
  const probes = [];
  for (const p of [
    '/hr/src/main.tsx',
    '/hr/src/App.tsx',
    '/hr/src/pages/Employees.tsx',
    '/hr/src/pages/Fleet.tsx',
    '/hr/src/lib/embedWorkingContext.ts',
    '/hr/src/lib/hrmDialogPortalA11y.ts',
  ]) {
    const base = url.includes(':8080') ? 'http://127.0.0.1:8080' : 'http://127.0.0.1:5173';
    try {
      const r = await fetch(base + p);
      const t = await r.text();
      probes.push({
        p,
        status: r.status,
        err: /Failed to resolve|Internal Server Error|does not provide an export/i.test(t)
          ? t.slice(0, 180)
          : null,
      });
    } catch (e) {
      probes.push({ p, error: String(e).slice(0, 120) });
    }
  }
  console.log(JSON.stringify({ url, root, fails: fails.slice(0, 15), probes }, null, 2));
  page.off('response', onRes);
  page.off('console', onCon);
}

await browser.close();
