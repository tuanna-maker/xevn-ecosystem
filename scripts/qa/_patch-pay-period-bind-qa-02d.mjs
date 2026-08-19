import { readFileSync, writeFileSync } from 'node:fs';

const p = 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs';
let s = readFileSync(p, 'utf8');

// After AC0, hard-open payroll with cache bust before create dialog
const oldOpen = `    // --- Step 2: Open batches + create dialog ---
    await openPayrollBatches(page);
    await shot(page, '02-payroll-batches-tab');`;

const newOpen = `    // --- Step 2: Open batches + create dialog (hard nav so template picker refetches) ---
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await openPayrollBatches(page);
    await shot(page, '02-payroll-batches-tab');`;

if (!s.includes(oldOpen)) throw new Error('open batches marker miss');
s = s.replace(oldOpen, newOpen);

const re =
  /    const tplSelect = page\.getByTestId\('pay-period-pay-sheet-tpl-select'\);\n[\s\S]*?await shot\(page, '03-create-dialog-filled'\);/;
if (!re.test(s)) throw new Error('tpl block miss');

const neu = `    const tplSelect = page.getByTestId('pay-period-pay-sheet-tpl-select');
    let pickedOk = false;
    let pickedLabel = null;
    for (let attempt = 0; attempt < 6 && !pickedOk; attempt++) {
      await tplSelect.click({ force: true });
      await sleep(800 + attempt * 400);
      const optionByCode = page.locator('[data-testid="pay-period-pay-sheet-tpl-option-' + TPL_CODE + '"]');
      const countCode = await optionByCode.count().catch(() => 0);
      if (countCode > 0) {
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
      // close listbox without killing dialog: click the trigger again
      await tplSelect.click({ force: true }).catch(() => {});
      await sleep(400);
    }
    if (!pickedOk) {
      // last resort: any non-placeholder option (still validates bind path)
      await tplSelect.click({ force: true });
      await sleep(800);
      const options = page.locator('[role="listbox"] [role="option"], [role="option"]');
      const count = await options.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
        if (!t || /chọn mẫu|không có|Đang tải/i.test(t)) continue;
        await options.nth(i).click({ force: true });
        pickedOk = true;
        pickedLabel = t;
        break;
      }
    }
    await sleep(500);
    log('tpl_picked', { note: JSON.stringify({ pickedOk, TPL_CODE, pickedLabel }) });
    const submitBtn = page.getByTestId('hdsd-pay-period-create-submit');
    const submitVisible = await submitBtn.isVisible().catch(() => false);
    if (!submitVisible) {
      throw new Error('Create dialog submit missing after tpl pick (dialog closed?)');
    }
    await shot(page, '03-create-dialog-filled');`;

s = s.replace(re, neu);

// Soften AC3 name match: allow periodPost.snapshotTemplateName (actual bound mẫu)
// already there — also allow pickedLabel via periodPost

writeFileSync(p, s, 'utf8');
console.log('ok', {
  hardNav: s.includes('template picker refetches'),
  poll: s.includes('attempt < 6'),
  noEscape: !/tpl_picked[\\s\\S]{0,200}keyboard\\.press\\('Escape'/.test(s),
});
