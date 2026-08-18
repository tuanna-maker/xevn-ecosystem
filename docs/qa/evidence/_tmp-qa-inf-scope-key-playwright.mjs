/**
 * QA-XBOS-INF-SCOPE-KEY-01 — temporary browser probe (U65, no seed).
 * Delete after evidence written.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.PORTAL_URL || 'http://127.0.0.1:5173';
const OUT = path.resolve('docs/qa/evidence/_tmp-qa-inf-scope-key-playwright.json');

const FORBIDDEN_SLUGS = new Set(['trsport', 'logistics', 'finance', 'services']);
const BPRIME_RE = /^10000000-0000-4000-8000-/i;

function auditIds(ids) {
  const list = (ids || []).map(String);
  return {
    ids: list,
    hasBprime: list.some((id) => BPRIME_RE.test(id)),
    hasWorkforce: list.some((id) => FORBIDDEN_SLUGS.has(id.toLowerCase())),
    hasHoldingRoot: list.includes('xbos-group-holding-root'),
    hasMainOnlyWithoutRoot:
      list.includes('main') && !list.includes('xbos-group-holding-root'),
    uuidMembers: list.filter((id) => /^[0-9a-f-]{36}$/i.test(id)),
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const putBodies = [];
  const getBodies = [];

  page.on('request', (req) => {
    if (req.method() === 'PUT' && req.url().includes('/infrastructure/settings')) {
      let body = null;
      try {
        body = JSON.parse(req.postData() || '{}');
      } catch {
        body = { raw: req.postData()?.slice(0, 500) };
      }
      putBodies.push({ url: req.url(), body });
    }
  });
  page.on('response', async (res) => {
    if (res.url().includes('/infrastructure/settings') && res.request().method() === 'GET') {
      try {
        const j = await res.json();
        getBodies.push({ status: res.status(), code: j.code, data: j.data });
      } catch {
        /* ignore */
      }
    }
  });

  const result = {
    work_item_id: 'QA-XBOS-INF-SCOPE-KEY-01',
    base: BASE,
    steps: [],
    putAudits: [],
    getAudits: [],
    wizardChecks: {},
    verdict: 'PENDING',
    errors: [],
  };

  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.fill('input[type="email"]', 'ceo@xe.vn');
    await page.fill('input[type="password"]', 'Xevn@2026');
    await Promise.all([
      page.waitForURL(/command-center|dashboard|\//, { timeout: 30000 }).catch(() => null),
      page.getByRole('button', { name: /Đăng nhập/i }).click(),
    ]);
    await page.waitForTimeout(2500);
    result.steps.push({ step: 'login', url: page.url(), ok: true });

    // Deep-link Command Center → Hạ tầng cơ sở
    await page.goto(`${BASE}/command-center?settings=company_infrastructure`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(3000);

    // Danh mục nền tab / browse
    const dm = page.getByText(/Danh mục nền/i).first();
    if (await dm.isVisible().catch(() => false)) {
      await dm.click();
      await page.waitForTimeout(1500);
    }
    result.steps.push({
      step: 'nav_infra',
      url: page.url(),
      bodyTextSnippet: (await page.locator('body').innerText()).slice(0, 1200),
    });

    // Prefer edit existing category with scope, else create
    const sua = page.getByRole('button', { name: /^Sửa$/i }).first();
    const them = page.getByRole('button', { name: /Thêm danh mục nền/i }).first();
    if (await sua.isVisible().catch(() => false)) {
      await sua.click();
    } else if (await them.isVisible().catch(() => false)) {
      await them.click();
      await page.waitForTimeout(500);
      const code = `QA-KEY-${Date.now().toString().slice(-6)}`;
      const dialog0 = page.locator('[role="dialog"][aria-labelledby="foundation-category-wizard-title"]');
      await dialog0.waitFor({ state: 'visible', timeout: 10000 });
      await dialog0.getByLabel(/Mã danh mục nền/i).fill(code).catch(async () => {
        await dialog0.locator('input').first().fill(code);
      });
      const nameInput = dialog0.getByLabel(/Tên danh mục nền/i);
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('QA Key Plane Scope');
      }
    } else {
      throw new Error('No Sửa/Thêm button for foundation category');
    }
    await page.waitForTimeout(1000);

    // Step 1 → Tiếp theo
    {
      const dialog0 = page.locator('[role="dialog"][aria-labelledby="foundation-category-wizard-title"]');
      await dialog0.waitFor({ state: 'visible', timeout: 10000 });
      const next1 = dialog0.getByRole('button', { name: /^Tiếp theo$/i });
      if (await next1.isVisible().catch(() => false)) {
        await next1.click();
        await page.waitForTimeout(800);
      }
    }

    // Step 2 — Phạm vi pháp nhân (dialog only)
    const dialog = page.locator('[role="dialog"][aria-labelledby="foundation-category-wizard-title"]');
    await dialog.waitFor({ state: 'visible', timeout: 15000 });
    await dialog.getByRole('heading', { name: 'Phạm vi pháp nhân' }).waitFor({ timeout: 15000 });
    const chips = dialog.locator('button[aria-pressed]');
    const chipCount = await chips.count();
    const chipLabels = [];
    for (let i = 0; i < chipCount; i++) {
      chipLabels.push({
        i,
        label: (await chips.nth(i).innerText()).replace(/\s+/g, ' ').trim(),
        pressed: await chips.nth(i).getAttribute('aria-pressed'),
      });
    }
    result.wizardChecks.beforeToggle = { chipCount, chipLabels };

    // Ensure holding tick (TẬP ĐOÀN / Tập đoàn)
    const holdingChip = chips.filter({ hasText: /TẬP ĐOÀN/i }).first();
    if (await holdingChip.isVisible().catch(() => false)) {
      const pressed = await holdingChip.getAttribute('aria-pressed');
      if (pressed !== 'true') await holdingChip.click();
      await page.waitForTimeout(300);
    }

    // Tick one member (not holding)
    for (let i = 0; i < chipCount; i++) {
      const label = (await chips.nth(i).innerText()).replace(/\s+/g, ' ').trim();
      if (/XE_TMDV|VISUN|XE_DU_LICH|XE_VIETNAM/i.test(label)) {
        const memberChip = chips.nth(i);
        const pressed = await memberChip.getAttribute('aria-pressed');
        if (pressed !== 'true') await memberChip.click();
        result.wizardChecks.memberChipLabel = label;
        break;
      }
    }
    await page.waitForTimeout(400);

    const afterLabels = [];
    for (let i = 0; i < (await chips.count()); i++) {
      afterLabels.push({
        label: (await chips.nth(i).innerText()).replace(/\s+/g, ' ').trim(),
        pressed: await chips.nth(i).getAttribute('aria-pressed'),
      });
    }
    result.wizardChecks.afterToggle = afterLabels;

    // Advance to step 3 and confirm (footer inside dialog)
    const nextBtn = dialog.getByRole('button', { name: /^Tiếp theo$/i });
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(800);
    }

    const confirm = dialog.getByRole('button', { name: /Xác nhận\s*&\s*áp dụng/i });
    await confirm.waitFor({ state: 'visible', timeout: 10000 });
    const putWait = page.waitForRequest(
      (r) => r.method() === 'PUT' && r.url().includes('/infrastructure/settings'),
      { timeout: 25000 },
    );
    await confirm.click();
    const putReq = await putWait.catch(() => null);
    if (putReq && putBodies.length === 0) {
      try {
        putBodies.push({ url: putReq.url(), body: JSON.parse(putReq.postData() || '{}') });
      } catch {
        putBodies.push({ url: putReq.url(), body: { raw: putReq.postData()?.slice(0, 500) } });
      }
    }
    await page.waitForTimeout(2500);
    result.steps.push({ step: 'save', putCount: putBodies.length, putCaptured: !!putReq });

    // Audit PUT bodies
    for (const p of putBodies) {
      const cats = p.body?.foundationCategories || p.body?.data?.foundationCategories || [];
      const scopes = (Array.isArray(cats) ? cats : []).map((c) =>
        auditIds(c.appliesToCompanyIds),
      );
      result.putAudits.push({
        url: p.url,
        categoryScopes: scopes,
        anyBprime: scopes.some((s) => s.hasBprime),
        anyWorkforce: scopes.some((s) => s.hasWorkforce),
        anyHoldingRoot: scopes.some((s) => s.hasHoldingRoot),
        anyUuidMember: scopes.some((s) => s.uuidMembers.length > 0),
        mainWithoutRoot: scopes.some((s) => s.hasMainOnlyWithoutRoot),
      });
    }

    // F5 / re-open
    await page.goto(`${BASE}/command-center?settings=company_infrastructure`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.waitForTimeout(2500);
    const dm2 = page.getByText(/Danh mục nền/i).first();
    if (await dm2.isVisible().catch(() => false)) await dm2.click();
    await page.waitForTimeout(1200);

    const sua2 = page.getByRole('button', { name: /^Sửa$/i }).first();
    if (await sua2.isVisible().catch(() => false)) {
      await sua2.click();
      await page.waitForTimeout(800);
      const dialog2 = page.locator('[role="dialog"][aria-labelledby="foundation-category-wizard-title"]');
      await dialog2.waitFor({ state: 'visible', timeout: 10000 });
      const next2 = dialog2.getByRole('button', { name: /^Tiếp theo$/i });
      if (await next2.isVisible().catch(() => false)) {
        await next2.click();
        await page.waitForTimeout(800);
      }
      const chips2 = dialog2.locator('button[aria-pressed]');
      const reopen = [];
      for (let i = 0; i < (await chips2.count()); i++) {
        reopen.push({
          label: (await chips2.nth(i).innerText()).replace(/\s+/g, ' ').trim(),
          pressed: await chips2.nth(i).getAttribute('aria-pressed'),
        });
      }
      result.wizardChecks.afterF5Reopen = reopen;
    }

    // Final GET audit from captured responses
    for (const g of getBodies.slice(-3)) {
      const cats = g.data?.foundationCategories || [];
      const scopes = (Array.isArray(cats) ? cats : []).map((c) => ({
        id: c.id,
        ...auditIds(c.appliesToCompanyIds),
      }));
      result.getAudits.push({ status: g.status, code: g.code, scopes });
    }

    const putOk =
      result.putAudits.length > 0 &&
      result.putAudits.every((a) => !a.anyBprime && !a.anyWorkforce) &&
      result.putAudits.some((a) => a.anyHoldingRoot || a.anyUuidMember);

    const getOk = result.getAudits.some((g) =>
      (g.scopes || []).every((s) => !s.hasBprime && !s.hasWorkforce),
    );

    result.verdict = putOk && getOk ? 'PASS' : 'FAIL_OR_PARTIAL';
    result.putOk = putOk;
    result.getOk = getOk;
  } catch (e) {
    result.errors.push(String(e?.stack || e));
    result.verdict = 'ERROR';
    result.steps.push({
      step: 'error_snapshot',
      url: page.url(),
      bodyTextSnippet: await page
        .locator('body')
        .innerText()
        .then((t) => t.slice(0, 1200))
        .catch(() => ''),
    });
  } finally {
    fs.writeFileSync(OUT, JSON.stringify(result, null, 2), 'utf8');
    await browser.close();
    console.log(JSON.stringify({ out: OUT, verdict: result.verdict, put: result.putAudits.length, errors: result.errors.length }, null, 2));
  }
}

main();
