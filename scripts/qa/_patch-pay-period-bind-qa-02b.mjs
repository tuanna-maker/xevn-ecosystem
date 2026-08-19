import { readFileSync, writeFileSync } from 'node:fs';

const p = 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs';
let s = readFileSync(p, 'utf8');

const tplBlockRe =
  /    const tplSelect = page\.getByTestId\('pay-period-pay-sheet-tpl-select'\);\n[\s\S]*?await shot\(page, '03-create-dialog-filled'\);/;
if (!tplBlockRe.test(s)) throw new Error('tpl block regex miss');

const newPick = `    const tplSelect = page.getByTestId('pay-period-pay-sheet-tpl-select');
    await tplSelect.click({ force: true });
    await sleep(700);
    const optionByCode = page.getByTestId('pay-period-pay-sheet-tpl-option-' + TPL_CODE);
    await optionByCode.scrollIntoViewIfNeeded().catch(() => {});
    let pickedOk = false;
    if (await optionByCode.isVisible().catch(() => false)) {
      await optionByCode.click({ force: true });
      pickedOk = true;
    } else {
      const picked = await pickSelectOption(page, tplSelect);
      pickedOk = Boolean(picked?.ok);
      if (await optionByCode.isVisible().catch(() => false)) {
        await optionByCode.click({ force: true });
        pickedOk = true;
      }
    }
    await sleep(300);
    log('tpl_picked', { note: JSON.stringify({ pickedOk, TPL_CODE }) });
    await shot(page, '03-create-dialog-filled');`;
s = s.replace(tplBlockRe, newPick);

const oldFilter = `    async function selectPeriodFilter() {
      const filter = page.getByTestId('pay-batch-period-filter');
      if (!(await filter.isVisible().catch(() => false))) return { ok: false };
      await filter.click({ force: true });
      await sleep(600);
      const opt = page.getByTestId('pay-batch-period-option-' + PERIOD_MONTH + '-' + PERIOD_YEAR);
      await opt.scrollIntoViewIfNeeded().catch(() => {});
      if (await opt.isVisible().catch(() => false)) {
        await opt.click({ force: true });
        await sleep(1500);
        return { ok: true, month: PERIOD_MONTH, year: PERIOD_YEAR };
      }
      await page.keyboard.press('Escape').catch(() => {});
      return { ok: false };
    }
    const filterSet = await selectPeriodFilter();
    log('period_filter_set', { note: JSON.stringify(filterSet) });
    await shot(page, '04-after-create-list');`;

const newFilter = `    async function openBatchesForSlot() {
      const u = new URL('/hr/payroll', PORTAL);
      u.searchParams.set('portal', '1');
      u.searchParams.set('tenantId', TENANT);
      u.searchParams.set('companyId', COMPANY);
      u.searchParams.set('pay_period_month', String(PERIOD_MONTH));
      u.searchParams.set('pay_period_year', String(PERIOD_YEAR));
      if (results.ids.periodId) u.searchParams.set('pay_batch_id', results.ids.periodId);
      u.searchParams.set('_', String(Date.now()));
      await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2500);
      await page.getByTestId('payroll-tab-calculate').click({ force: true });
      await sleep(700);
      const listItem = page.getByRole('menuitem', { name: /danh s\\u00e1ch b\\u1ea3ng l\\u01b0\\u01a1ng/i });
      if (await listItem.isVisible().catch(() => false)) await listItem.click({ force: true });
      else {
        await page
          .locator('[role="menuitem"]')
          .filter({ hasText: /danh s/i })
          .first()
          .click({ force: true })
          .catch(() => {});
      }
      await sleep(2500);
      await page.getByTestId('pay-batches-precision').waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
      const filter = page.getByTestId('pay-batch-period-filter');
      if (await filter.isVisible().catch(() => false)) {
        await filter.click({ force: true });
        await sleep(500);
        const opt = page.getByTestId('pay-batch-period-option-' + PERIOD_MONTH + '-' + PERIOD_YEAR);
        await opt.scrollIntoViewIfNeeded().catch(() => {});
        if (await opt.isVisible().catch(() => false)) {
          await opt.click({ force: true });
          await sleep(1200);
          return { ok: true, via: 'select+deeplink', month: PERIOD_MONTH, year: PERIOD_YEAR };
        }
        await page.keyboard.press('Escape').catch(() => {});
      }
      return { ok: true, via: 'deeplink', month: PERIOD_MONTH, year: PERIOD_YEAR };
    }
    const filterSet = await openBatchesForSlot();
    log('period_filter_set', { note: JSON.stringify(filterSet) });
    await shot(page, '04-after-create-list');`;

if (!s.includes(oldFilter)) throw new Error('filter block missing');
s = s.replace(oldFilter, newFilter);

const oldF5 = `    await openPayrollBatches(page);
    await selectPeriodFilter();
    await shot(page, '06-after-f5-list');`;
const newF5 = `    const filterSetF5 = await openBatchesForSlot();
    log('period_filter_set_f5', { note: JSON.stringify(filterSetF5) });
    await shot(page, '06-after-f5-list');`;
if (!s.includes(oldF5)) throw new Error('F5 filter call missing');
s = s.replace(oldF5, newF5);

// Detail click: wait for row after deeplink
s = s.replace(
  `    if (periodId) {
      await page.getByTestId('pay-batch-row-' + periodId).click({ force: true });
    } else {
      recordAc('AC4_DETAIL_TPL_SUBTITLE', 'FAIL', {
        summary: 'SKIP/FAIL — no periodId (POST did not create)',
        click_path: 'blocked',
      });
      throw new Error('No periodId after POST — cannot continue AC4/AC5');
    }`,
  `    if (!periodId) {
      recordAc('AC4_DETAIL_TPL_SUBTITLE', 'FAIL', {
        summary: 'SKIP/FAIL — no periodId (POST did not create)',
        click_path: 'blocked',
      });
      throw new Error('No periodId after POST — cannot continue AC4/AC5');
    }
    const rowLocator = page.getByTestId('pay-batch-row-' + periodId);
    await rowLocator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
    if (!(await rowLocator.isVisible().catch(() => false))) {
      // one more deeplink retry
      await openBatchesForSlot();
      await rowLocator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
    }
    if (await rowLocator.isVisible().catch(() => false)) {
      await rowLocator.click({ force: true });
    } else {
      recordAc('AC4_DETAIL_TPL_SUBTITLE', 'FAIL', {
        summary: 'FAIL row not visible after deeplink filter ' + PERIOD_MONTH + '/' + PERIOD_YEAR,
        filterSet,
        click_path: 'pay_period_month deep-link',
      });
      results.residuals.push({
        id: 'R-PAY-PERIOD-FILTER-UX',
        owner: 'dev-fe',
        note: 'Created period row not visible after pay_period_month/year deep-link',
      });
      throw new Error('Row not visible for detail');
    }`,
);

writeFileSync(p, s, 'utf8');
console.log('OK patched', {
  openBatchesForSlot: s.includes('openBatchesForSlot'),
  pay_period_month: s.includes('pay_period_month'),
  tpl_picked: s.includes('tpl_picked'),
  hasMau: s.includes('Mẫu'),
});
