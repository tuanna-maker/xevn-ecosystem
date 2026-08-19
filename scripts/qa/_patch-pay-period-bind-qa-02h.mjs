import { readFileSync, writeFileSync } from 'node:fs';

const p = 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs';
let s = readFileSync(p, 'utf8');

const oldFnStart = '    async function openBatchesForSlot() {';
const idx = s.indexOf(oldFnStart);
if (idx < 0) throw new Error('openBatchesForSlot missing');
const endMarker = '    const filterSet = await openBatchesForSlot();';
const endIdx = s.indexOf(endMarker, idx);
if (endIdx < 0) throw new Error('filterSet call missing');

const neu = `    async function applyPeriodFilterInPlace() {
      const filter = page.getByTestId('pay-batch-period-filter');
      if (!(await filter.isVisible().catch(() => false))) return { ok: false, via: 'no-filter' };
      await filter.click({ force: true });
      await sleep(700);
      const opt = page.locator('[data-testid="pay-batch-period-option-' + PERIOD_MONTH + '-' + PERIOD_YEAR + '"]');
      try {
        await opt.first().click({ force: true, timeout: 8000 });
        await sleep(1800);
        return { ok: true, via: 'select-inplace', month: PERIOD_MONTH, year: PERIOD_YEAR };
      } catch {
        await page.keyboard.press('Escape').catch(() => {});
        return { ok: false, via: 'select-miss', month: PERIOD_MONTH, year: PERIOD_YEAR };
      }
    }

    async function openBatchesForSlot() {
      // Prefer in-place filter (avoid portal reload flakiness)
      if (await page.getByTestId('pay-batches-precision').isVisible().catch(() => false)) {
        const inplace = await applyPeriodFilterInPlace();
        if (inplace.ok) return inplace;
      }
      await openPayrollBatches(page);
      const inplace2 = await applyPeriodFilterInPlace();
      if (inplace2.ok) return inplace2;

      // Deep-link remount fallback
      const u = new URL(page.url());
      u.searchParams.set('portal', '1');
      u.searchParams.set('tenantId', TENANT);
      u.searchParams.set('companyId', COMPANY);
      u.searchParams.set('pay_period_month', String(PERIOD_MONTH));
      u.searchParams.set('pay_period_year', String(PERIOD_YEAR));
      if (results.ids.periodId) u.searchParams.set('pay_batch_id', results.ids.periodId);
      u.searchParams.set('_', String(Date.now()));
      await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2800);
      if (!(await page.getByTestId('pay-batches-precision').isVisible().catch(() => false))) {
        await openPayrollBatches(page);
      }
      const inplace3 = await applyPeriodFilterInPlace();
      return inplace3.ok ? inplace3 : { ok: true, via: 'deeplink-remount', month: PERIOD_MONTH, year: PERIOD_YEAR };
    }
`;

s = s.slice(0, idx) + neu + s.slice(endIdx);
writeFileSync(p, s, 'utf8');
console.log('ok', s.includes('applyPeriodFilterInPlace'), s.includes('select-inplace'));
