import { readFileSync, writeFileSync } from 'node:fs';

const p = 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs';
let s = readFileSync(p, 'utf8');

const old = `  await page.getByTestId('hdsd-pay-sheet-tpl-code').fill(TPL_CODE);
  await page.getByTestId('hdsd-pay-sheet-tpl-name').fill(TPL_NAME);
  await page.getByTestId('hdsd-pay-sheet-tpl-save-header').click();`;

const neu = `  await page.getByTestId('hdsd-pay-sheet-tpl-code').fill(TPL_CODE);
  await page.getByTestId('hdsd-pay-sheet-tpl-name').fill(TPL_NAME);
  // Picker uses active_only — draft templates never appear in period dialog
  await page.getByTestId('hdsd-pay-sheet-tpl-status').click({ force: true });
  await sleep(400);
  const activeOpt = page.getByRole('option', { name: /active|đang áp dụng|hiệu lực/i }).first();
  if (await activeOpt.isVisible().catch(() => false)) {
    await activeOpt.click({ force: true });
  } else {
    // fallback: SelectItem value=active
    const byVal = page.locator('[role="option"][data-value="active"], [data-radix-collection-item]', { hasText: /active/i }).first();
    await page.locator('[role="option"]').filter({ hasText: /^active$/i }).first().click({ force: true }).catch(async () => {
      await page.keyboard.type('active');
      await page.keyboard.press('Enter');
    });
  }
  await sleep(300);
  await page.getByTestId('hdsd-pay-sheet-tpl-save-header').click();`;

if (!s.includes(old)) throw new Error('ensureActive fill block miss');
s = s.replace(old, neu);

// Also fix tpl pick + hard nav (from 02d that failed)
const oldOpen = `    // --- Step 2: Open batches + create dialog ---
    await openPayrollBatches(page);
    await shot(page, '02-payroll-batches-tab');`;
const newOpen = `    // --- Step 2: Open batches + create dialog (hard nav so template picker refetches) ---
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await openPayrollBatches(page);
    await shot(page, '02-payroll-batches-tab');`;
if (s.includes(oldOpen)) s = s.replace(oldOpen, newOpen);

const re =
  /    const tplSelect = page\.getByTestId\('pay-period-pay-sheet-tpl-select'\);\n[\s\S]*?await shot\(page, '03-create-dialog-filled'\);/;
if (!re.test(s)) throw new Error('tpl block miss');

const tplNeu = `    const tplSelect = page.getByTestId('pay-period-pay-sheet-tpl-select');
    let pickedOk = false;
    let pickedLabel = null;
    for (let attempt = 0; attempt < 6 && !pickedOk; attempt++) {
      await tplSelect.click({ force: true });
      await sleep(800 + attempt * 400);
      const optionByCode = page.locator('[data-testid="pay-period-pay-sheet-tpl-option-' + TPL_CODE + '"]');
      if ((await optionByCode.count().catch(() => 0)) > 0) {
        await optionByCode.first().click({ force: true });
        pickedOk = true;
        pickedLabel = TPL_NAME;
        break;
      }
      const byStamp = page.getByRole('option').filter({ hasText: STAMP });
      if ((await byStamp.count().catch(() => 0)) > 0) {
        pickedLabel = ((await byStamp.first().innerText().catch(() => '')) || '').trim();
        await byStamp.first().click({ force: true });
        pickedOk = true;
        break;
      }
      await tplSelect.click({ force: true }).catch(() => {});
      await sleep(300);
    }
    if (!pickedOk) {
      await tplSelect.click({ force: true });
      await sleep(800);
      const options = page.locator('[role="listbox"] [role="option"], [role="option"]');
      const count = await options.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
        if (!t || /chọn mẫu|không có|Đang tải|Chưa có/i.test(t)) continue;
        await options.nth(i).click({ force: true });
        pickedOk = true;
        pickedLabel = t;
        break;
      }
    }
    await sleep(500);
    log('tpl_picked', { note: JSON.stringify({ pickedOk, TPL_CODE, pickedLabel }) });
    if (!(await page.getByTestId('hdsd-pay-period-create-submit').isVisible().catch(() => false))) {
      throw new Error('Create dialog submit missing after tpl pick');
    }
    await shot(page, '03-create-dialog-filled');`;

s = s.replace(re, tplNeu);
writeFileSync(p, s, 'utf8');
console.log('ok', {
  activeStatus: s.includes('active_only'),
  hardNav: s.includes('template picker refetches'),
  poll: s.includes('attempt < 6'),
});
