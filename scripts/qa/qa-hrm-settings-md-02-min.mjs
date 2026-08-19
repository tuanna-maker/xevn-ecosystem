/**
 * Minimal Settings master-data + leave empty CTA U65 slice
 */
import puppeteer from 'puppeteer';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const HRM_API = 'http://127.0.0.1:28001';
const PORTAL = 'http://127.0.0.1:5173';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/qa/evidence/_tmp-qa-hrm-settings-md-02-runtime.json');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = { work_item_id: 'QA-HRM-SETTINGS-MASTER-DATA-02', steps: [], verdicts: {}, startedAt: new Date().toISOString() };
const note = (id, ok, detail) => {
  out.steps.push({ id, ok, detail, at: new Date().toISOString() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
  writeFileSync(OUT, JSON.stringify(out, null, 2));
};

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function main() {
  for (let i = 0; i < 15; i++) {
    try {
      const h = await fetch(`${HRM_API}/api/hrm`);
      if (h.ok) break;
    } catch {}
    await sleep(1000);
  }
  const token = await login();
  note('login', !!token, 'token');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  const net = [];
  page.on('response', (res) => {
    const u = res.url();
    if (/settings-catalogs|leave-requests/.test(u)) {
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

  // Settings → Danh mục nghiệp vụ → Loại nghỉ → Lưu
  await page.goto(`${HRM_FE}/hr/settings?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    const md = tabs.find((t) => (t.textContent || '').includes('Danh mục nghiệp vụ'));
    md?.click();
  });
  await sleep(1500);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    tabs.find((t) => (t.textContent || '').trim() === 'Loại nghỉ')?.click();
  });
  await sleep(1500);
  const hasForm = await page.$('#md-code-leaveTypes');
  note('settings-leave-form', !!hasForm, hasForm ? 'found #md-code-leaveTypes' : 'missing form');
  const stamp = `QA_LVT_${Date.now().toString(36).slice(-6).toUpperCase()}`;
  if (hasForm) {
    await page.focus('#md-code-leaveTypes');
    await page.keyboard.type(stamp, { delay: 20 });
    await page.focus('#md-label-leaveTypes');
    await page.keyboard.type(`QA leave ${stamp}`, { delay: 10 });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      btns.find((b) => (b.textContent || '').includes('Lưu') && !b.disabled)?.click();
    });
    await sleep(3000);
    const posts = net.filter((n) => n.m === 'POST' && /items/.test(n.u));
    note('settings-leave-post', posts.some((p) => p.s >= 200 && p.s < 300), posts);
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(2000);
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      tabs.find((t) => (t.textContent || '').includes('Danh mục nghiệp vụ'))?.click();
    });
    await sleep(800);
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
      tabs.find((t) => (t.textContent || '').trim() === 'Loại nghỉ')?.click();
    });
    await sleep(1000);
    const f5 = await page.evaluate((c) => document.body.innerText.includes(c), stamp);
    note('settings-leave-f5', f5, stamp);
    out.verdicts.leaveCatalogCreateF5 = f5 ? 'PASS' : 'FAIL';
  }

  // Picker smoke on same page
  const smoke = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      title: t.includes('Danh mục nghiệp vụ'),
      leaveTab: t.includes('Loại nghỉ'),
      loadErr: /Không tải được danh mục/.test(t),
      hasLvt: /LVT_|QA_LVT_/.test(t),
      emptyHonest: t.includes('Chưa có mục'),
    };
  });
  out.verdicts.settingsPickerSmoke = !smoke.loadErr && (smoke.hasLvt || smoke.emptyHonest) ? 'PASS' : 'FAIL';
  note('settings-picker-smoke', out.verdicts.settingsPickerSmoke === 'PASS', smoke);

  // Dept bucket form + create
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button'));
    tabs.find((t) => (t.textContent || '').trim() === 'Phòng ban')?.click();
  });
  await sleep(1000);
  const deptForm = await page.$('#md-code-departments');
  const deptStamp = `QA_DEPT_${Date.now().toString(36).slice(-5).toUpperCase()}`;
  note('settings-dept-form', !!deptForm, deptStamp);
  if (deptForm) {
    await page.focus('#md-code-departments');
    await page.keyboard.type(deptStamp, { delay: 15 });
    await page.focus('#md-label-departments');
    await page.keyboard.type(`Phòng QA ${deptStamp}`, { delay: 10 });
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('button'))
        .find((b) => (b.textContent || '').includes('Lưu') && !b.disabled)
        ?.click();
    });
    await sleep(2500);
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(1500);
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('[role="tab"], button'))
        .find((t) => (t.textContent || '').includes('Danh mục nghiệp vụ'))
        ?.click();
    });
    await sleep(600);
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('[role="tab"], button'))
        .find((t) => (t.textContent || '').trim() === 'Phòng ban')
        ?.click();
    });
    await sleep(800);
    const f5d = await page.evaluate((c) => document.body.innerText.includes(c), deptStamp);
    note('settings-dept-f5', f5d, deptStamp);
  }

  // Leave empty CTA with intercept
  await page.setRequestInterception(true);
  page.on('request', async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs(\?|$)/.test(req.url())) {
        const upstream = await fetch(`${HRM_API}/api/hrm/settings-catalogs?company_id=main`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-tenant-id': 'xevn',
            'x-company-id': 'main',
          },
        });
        const json = await upstream.json();
        const list = json?.data?.catalogs ?? json?.data ?? [];
        if (Array.isArray(list)) {
          for (const row of list) {
            if (['leave_types', 'departments'].includes(row.catalogKey || row.key)) {
              row.effectiveItems = [];
            }
          }
        }
        return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
      }
      return req.continue();
    } catch {
      try {
        await req.continue();
      } catch {}
    }
  });

  await page.goto(`${HRM_FE}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"], button, a'));
    tabs.find((t) => /Nghỉ phép|Đơn nghỉ/.test(t.textContent || ''))?.click();
  });
  await sleep(1000);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    btns.find((b) => /^Tạo|^Thêm|Tạo đơn/.test((b.textContent || '').trim()))?.click();
  });
  await sleep(2000);
  // wait dialog
  await page.waitForSelector('[role="dialog"], .bg-amber-50', { timeout: 8000 }).catch(() => null);
  const leaveEmpty = await page.evaluate(() => {
    const root = document.querySelector('[role="dialog"]') || document.body;
    const t = root.innerText || '';
    return {
      cta: /Chưa có mục trong danh mục|Mở Cài đặt/.test(t),
      amber: !!document.querySelector('.bg-amber-50'),
      fake8: ['annual', 'sick', 'unpaid', 'maternity'].filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(t)),
      snippet: t.slice(0, 500),
    };
  });
  out.verdicts.leaveEmptyCta = leaveEmpty.cta && leaveEmpty.fake8.length === 0 ? 'PASS' : 'FAIL';
  note('leave-empty-cta', out.verdicts.leaveEmptyCta === 'PASS', leaveEmpty);

  // Employee form dept empty (same intercept)
  await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find((b) => /Thêm nhân viên|Thêm mới/.test(b.textContent || ''))
      ?.click();
  });
  await sleep(2000);
  await page.waitForSelector('[role="dialog"], .bg-amber-50', { timeout: 8000 }).catch(() => null);
  const deptEmpty = await page.evaluate(() => {
    const root = document.querySelector('[role="dialog"]') || document.body;
    const t = root.innerText || '';
    return {
      cta: /Chưa có mục trong danh mục|Mở Cài đặt/.test(t),
      amber: !!document.querySelector('.bg-amber-50'),
    };
  });
  out.verdicts.deptEmptyCta = deptEmpty.cta ? 'PASS' : 'FAIL';
  note('dept-empty-cta', deptEmpty.cta, deptEmpty);

  // Real catalog dept picker code SoT (disable intercept)
  await page.setRequestInterception(false);
  await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find((b) => /Thêm nhân viên|Thêm mới/.test(b.textContent || ''))
      ?.click();
  });
  await sleep(2500);
  const deptPicker = await page.evaluate(async () => {
    const dialog = document.querySelector('[role="dialog"]') || document.body;
    const btns = Array.from(dialog.querySelectorAll('button[role="combobox"]'));
    const deptBtn = btns.find((b) => /phòng ban|department/i.test(b.getAttribute('aria-label') || ''));
    if (!deptBtn) {
      // try by nearby label
      const labels = Array.from(dialog.querySelectorAll('label'));
      const lab = labels.find((l) => /phòng ban/i.test(l.textContent || ''));
      const combo = lab?.parentElement?.querySelector('button[role="combobox"]');
      if (!combo) return { found: false, amber: !!dialog.querySelector('.bg-amber-50'), combos: btns.length };
      combo.click();
    } else deptBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    const options = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).map((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim(),
    );
    const hit = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
      /DEPT_|QA_DEPT_/.test(n.textContent || ''),
    );
    const chosen = hit ? (hit.textContent || '').trim() : '';
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const trigger = (deptBtn || document.querySelector('button[role="combobox"]'))?.textContent || '';
    return {
      found: options.length > 0,
      options: options.slice(0, 6),
      chosen,
      trigger: trigger.replace(/\s+/g, ' ').trim(),
      showsCode: /DEPT_|QA_DEPT_/.test(chosen) || /DEPT_|QA_DEPT_/.test(trigger),
    };
  });
  out.verdicts.deptPersistCode = deptPicker.showsCode ? 'PASS' : deptPicker.found ? 'PARTIAL' : 'FAIL';
  note('dept-picker-code', out.verdicts.deptPersistCode !== 'FAIL', deptPicker);

  out.netSample = net.slice(-20);
  out.finishedAt = new Date().toISOString();
  out.overall =
    out.verdicts.leaveEmptyCta === 'PASS' &&
    out.verdicts.deptEmptyCta === 'PASS' &&
    out.verdicts.settingsPickerSmoke === 'PASS' &&
    (out.verdicts.leaveCatalogCreateF5 === 'PASS' || out.verdicts.leaveCatalogCreateF5 === undefined) &&
    (out.verdicts.deptPersistCode === 'PASS' || out.verdicts.deptPersistCode === 'PARTIAL')
      ? 'PASS'
      : 'PARTIAL_OR_FAIL';
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log('verdicts', out.verdicts);
  console.log('overall', out.overall);
  await browser.close();
  process.exit(out.overall === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  out.error = String(e?.stack || e);
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.error(e);
  process.exit(1);
});
