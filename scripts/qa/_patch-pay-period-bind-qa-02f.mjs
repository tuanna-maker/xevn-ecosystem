import { readFileSync, writeFileSync } from 'node:fs';

const p = 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs';
let s = readFileSync(p, 'utf8');

const oldFnStart = '    async function openBatchesForSlot() {';
const idx = s.indexOf(oldFnStart);
if (idx < 0) throw new Error('openBatchesForSlot missing');
const endMarker = '    const filterSet = await openBatchesForSlot();';
const endIdx = s.indexOf(endMarker, idx);
if (endIdx < 0) throw new Error('filterSet call missing');

const neu = `    async function openBatchesForSlot() {
      // 1) Land on batches list first
      await openPayrollBatches(page);
      // 2) Remount tab with deep-link (initialUrlState only reads search on mount)
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
      // Ensure calculate > batches still visible
      if (!(await page.getByTestId('pay-batches-precision').isVisible().catch(() => false))) {
        await openPayrollBatches(page);
        await sleep(1000);
        await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(2500);
      }
      // 3) Force Select filter as belt-and-suspenders
      const filter = page.getByTestId('pay-batch-period-filter');
      if (await filter.isVisible().catch(() => false)) {
        await filter.click({ force: true });
        await sleep(700);
        const opt = page.locator('[data-testid="pay-batch-period-option-' + PERIOD_MONTH + '-' + PERIOD_YEAR + '"]');
        try {
          await opt.first().click({ force: true, timeout: 8000 });
          await sleep(1500);
          return { ok: true, via: 'select-force', month: PERIOD_MONTH, year: PERIOD_YEAR };
        } catch {
          const txt = page.getByRole('option', { name: new RegExp('Th\\\\u00e1ng ' + PERIOD_MONTH + '/' + PERIOD_YEAR) });
          try {
            await txt.first().click({ force: true, timeout: 5000 });
            await sleep(1500);
            return { ok: true, via: 'select-text', month: PERIOD_MONTH, year: PERIOD_YEAR };
          } catch {
            await page.keyboard.press('Escape').catch(() => {});
          }
        }
      }
      return { ok: true, via: 'deeplink-remount', month: PERIOD_MONTH, year: PERIOD_YEAR };
    }
`;

s = s.slice(0, idx) + neu + s.slice(endIdx);
writeFileSync(p, s, 'utf8');
console.log('ok remount filter', s.includes('deeplink-remount'), s.includes('select-force'));
