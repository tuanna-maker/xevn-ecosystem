import puppeteer from 'puppeteer';
import { writeFileSync } from 'node:fs';

const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const PORTAL = 'http://127.0.0.1:5173';
const HRM_API = 'http://127.0.0.1:28001';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = { steps: [], verdicts: {} };
const note = (id, ok, detail) => {
  out.steps.push({ id, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
};

async function clickTab(page, text) {
  const handle = await page.evaluateHandle((t) => {
    return [...document.querySelectorAll('[role=tab]')].find((el) => (el.textContent || '').includes(t)) || null;
  }, text);
  const el = handle.asElement();
  if (!el) throw new Error('tab not found ' + text);
  const box = await el.boundingBox();
  if (!box) throw new Error('no box ' + text);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await sleep(900);
}

async function clickButtonContaining(page, re) {
  const box = await page.evaluate((pattern) => {
    const rx = new RegExp(pattern);
    const b = [...document.querySelectorAll('button')].find((x) => rx.test((x.textContent || '').trim()));
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: (b.textContent || '').trim() };
  }, re);
  if (!box) throw new Error('button not found ' + re);
  await page.mouse.click(box.x, box.y);
  await sleep(800);
  return box.text;
}

const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const j = await r.json();
const token = j?.data?.accessToken ?? j?.accessToken;
note('login', !!token, 'ok');

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
const net = [];
page.on('response', (res) => {
  const u = res.url();
  if (/settings-catalogs\/items|leave-requests/.test(u)) {
    net.push({ m: res.request().method(), s: res.status(), u: u.replace(/https?:\/\/[^/]+/, '') });
  }
});
await page.evaluateOnNewDocument((t) => {
  for (const s of [localStorage, sessionStorage]) {
    s.setItem('xevn.portal.accessToken', t);
    s.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
    s.setItem('xevn.portal.user', JSON.stringify({ userId: 'ceo@xe.vn', displayName: 'CEO' }));
  }
}, token);

await page.goto(`${HRM_FE}/hr/settings?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
await sleep(2000);
await clickTab(page, 'Danh mục nghiệp vụ');
await sleep(1200);
const active = await page.evaluate(() =>
  [...document.querySelectorAll('[role=tab]')]
    .filter((t) => t.getAttribute('data-state') === 'active')
    .map((t) => (t.textContent || '').trim()),
);
note('settings-md-tab', active.some((t) => t.includes('Danh mục nghiệp vụ')), active);

const hasMaster = await page.evaluate(
  () => document.body.innerText.includes('Đồng bộ XBOS') || document.body.innerText.includes('master data'),
);
note('settings-md-panel', hasMaster, hasMaster);

if (hasMaster) {
  await clickTab(page, 'Loại nghỉ');
  await sleep(1000);
  const form = !!(await page.$('#md-code-leaveTypes'));
  note('leave-form', form, '#md-code-leaveTypes');
  if (form) {
    const stamp = `QA_LVT_${Date.now().toString(36).slice(-5).toUpperCase()}`;
    await page.click('#md-code-leaveTypes', { clickCount: 3 });
    await page.type('#md-code-leaveTypes', stamp, { delay: 15 });
    await page.click('#md-label-leaveTypes', { clickCount: 3 });
    await page.type('#md-label-leaveTypes', `QA ${stamp}`, { delay: 10 });
    await clickButtonContaining(page, 'Lưu');
    await sleep(3000);
    const postOk = net.some((n) => n.m === 'POST' && n.s >= 200 && n.s < 300);
    note('leave-post', postOk, net);
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(2000);
    await clickTab(page, 'Danh mục nghiệp vụ');
    await sleep(1000);
    await clickTab(page, 'Loại nghỉ');
    await sleep(1000);
    const f5 = await page.evaluate((c) => document.body.innerText.includes(c), stamp);
    note('leave-f5', f5, stamp);
    out.verdicts.leaveCatalogCreateF5 = f5 && postOk ? 'PASS' : f5 || postOk ? 'PARTIAL' : 'FAIL';
  }

  await clickTab(page, 'Phòng ban');
  await sleep(800);
  note('dept-form', !!(await page.$('#md-code-departments')), 'dept');
}

// empty CTA intercept
await page.setRequestInterception(true);
const onReq = async (req) => {
  try {
    if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs(\?|$)/.test(req.url())) {
      const upstream = await fetch(`${HRM_API}/api/hrm/settings-catalogs?company_id=main`, {
        headers: { Authorization: `Bearer ${token}`, 'x-tenant-id': 'xevn', 'x-company-id': 'main' },
      });
      const json = await upstream.json();
      const list = json?.data?.catalogs ?? json?.data ?? [];
      if (Array.isArray(list)) {
        for (const row of list) {
          if (['leave_types', 'departments'].includes(row.catalogKey || row.key)) row.effectiveItems = [];
        }
      }
      return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
    }
    return req.continue();
  } catch {
    try {
      await req.continue();
    } catch {
      /* */
    }
  }
};
page.on('request', onReq);

await page.goto(`${HRM_FE}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
await sleep(2500);
try {
  await clickTab(page, 'Nghỉ phép');
} catch {
  try {
    await clickTab(page, 'Đơn nghỉ');
  } catch {
    /* */
  }
}
try {
  await clickButtonContaining(page, '^(Tạo|Thêm)');
} catch {
  /* */
}
await sleep(2000);
const leaveEmpty = await page.evaluate(() => {
  const root = document.querySelector('[role=dialog]') || document.body;
  const t = root.innerText || '';
  return {
    cta: /Chưa có mục|Mở Cài đặt/.test(t),
    amber: !!document.querySelector('.bg-amber-50'),
    fake8: ['annual', 'sick', 'unpaid', 'maternity'].filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(t)),
    snippet: t.slice(0, 350),
  };
});
out.verdicts.leaveEmptyCta = leaveEmpty.cta && leaveEmpty.fake8.length === 0 ? 'PASS' : 'FAIL';
note('leave-empty', out.verdicts.leaveEmptyCta === 'PASS', leaveEmpty);

await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
await sleep(2000);
try {
  await clickButtonContaining(page, 'Thêm nhân viên|Thêm mới');
} catch {
  /* */
}
await sleep(2000);
const deptEmpty = await page.evaluate(() => {
  const root = document.querySelector('[role=dialog]') || document.body;
  const t = root.innerText || '';
  return { cta: /Chưa có mục|Mở Cài đặt/.test(t), amber: !!document.querySelector('.bg-amber-50') };
});
out.verdicts.deptEmptyCta = deptEmpty.cta ? 'PASS' : 'FAIL';
note('dept-empty', deptEmpty.cta, deptEmpty);

page.off('request', onReq);
await page.setRequestInterception(false);

// Real catalog leave picker (no intercept)
await page.goto(`${HRM_FE}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
await sleep(2500);
try {
  await clickTab(page, 'Nghỉ phép');
} catch {
  /* */
}
try {
  await clickButtonContaining(page, '^(Tạo|Thêm)');
} catch {
  /* */
}
await sleep(2000);
const leavePick = await page.evaluate(async () => {
  const dialog = document.querySelector('[role=dialog]') || document.body;
  const labels = [...dialog.querySelectorAll('label')];
  const lab = labels.find((l) => /loại nghỉ|leave type/i.test(l.textContent || ''));
  const btn =
    lab?.parentElement?.querySelector('button[role=combobox]') ||
    [...dialog.querySelectorAll('button[role=combobox]')].find((b) =>
      /loại|nghỉ|leave/i.test(b.getAttribute('aria-label') || ''),
    );
  if (!btn) {
    return { ok: false, amber: !!dialog.querySelector('.bg-amber-50'), cta: /Chưa có mục/.test(dialog.innerText || '') };
  }
  btn.click();
  await new Promise((r) => setTimeout(r, 500));
  const opts = [...document.querySelectorAll('[cmdk-item],[role=option]')].map((n) =>
    (n.textContent || '').replace(/\s+/g, ' ').trim(),
  );
  return {
    ok: opts.length > 0,
    opts: opts.slice(0, 8),
    fakeAnnual: opts.some((o) => /\bannual\b/i.test(o)),
    hasLvt: opts.some((o) => /LVT_/.test(o)),
  };
});
out.verdicts.leavePickerCatalog = leavePick.ok && !leavePick.fakeAnnual ? 'PASS' : 'FAIL';
note('leave-picker', out.verdicts.leavePickerCatalog === 'PASS', leavePick);

// Dept picker real
await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
await sleep(2000);
try {
  await clickButtonContaining(page, 'Thêm nhân viên|Thêm mới');
} catch {
  /* */
}
await sleep(2500);
const deptPick = await page.evaluate(async () => {
  const dialog = document.querySelector('[role=dialog]') || document.body;
  const labels = [...dialog.querySelectorAll('label')];
  const lab = labels.find((l) => /phòng ban/i.test(l.textContent || ''));
  const btn = lab?.parentElement?.querySelector('button[role=combobox]');
  if (!btn) return { ok: false, amber: !!dialog.querySelector('.bg-amber-50') };
  btn.click();
  await new Promise((r) => setTimeout(r, 500));
  const opts = [...document.querySelectorAll('[cmdk-item],[role=option]')].map((n) =>
    (n.textContent || '').replace(/\s+/g, ' ').trim(),
  );
  const hit = [...document.querySelectorAll('[cmdk-item],[role=option]')].find((n) => /DEPT_/.test(n.textContent || ''));
  hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 300));
  const trigger = (btn.textContent || '').replace(/\s+/g, ' ').trim();
  return {
    ok: opts.length > 0,
    opts: opts.slice(0, 6),
    trigger,
    showsCode: /DEPT_/.test(trigger) || /DEPT_/.test(hit?.textContent || ''),
  };
});
out.verdicts.deptPersistCode = deptPick.showsCode ? 'PASS' : deptPick.ok ? 'PARTIAL' : 'FAIL';
note('dept-picker', out.verdicts.deptPersistCode !== 'FAIL', deptPick);

out.finishedAt = new Date().toISOString();
writeFileSync('docs/qa/evidence/_tmp-qa-hrm-settings-md-02-runtime.json', JSON.stringify(out, null, 2));
console.log('VERDICTS', JSON.stringify(out.verdicts, null, 2));
await browser.close();
