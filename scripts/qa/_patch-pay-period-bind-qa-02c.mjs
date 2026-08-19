import { readFileSync, writeFileSync } from 'node:fs';

const p = 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs';
let s = readFileSync(p, 'utf8');

const re =
  /    const tplSelect = page\.getByTestId\('pay-period-pay-sheet-tpl-select'\);\n[\s\S]*?await shot\(page, '03-create-dialog-filled'\);/;
if (!re.test(s)) throw new Error('tpl block miss');

const neu = `    const tplSelect = page.getByTestId('pay-period-pay-sheet-tpl-select');
    await tplSelect.click({ force: true });
    await sleep(1500);
    const optionByCode = page.locator('[data-testid="pay-period-pay-sheet-tpl-option-' + TPL_CODE + '"]');
    let pickedOk = false;
    try {
      await optionByCode.first().click({ force: true, timeout: 10000 });
      pickedOk = true;
    } catch {
      try {
        await page.getByRole('option').filter({ hasText: TPL_NAME }).first().click({ force: true, timeout: 5000 });
        pickedOk = true;
      } catch {
        const picked = await pickSelectOption(page, tplSelect);
        pickedOk = Boolean(picked?.ok);
      }
    }
    // Do not Escape here — closes the create dialog.
    await sleep(500);
    log('tpl_picked', { note: JSON.stringify({ pickedOk, TPL_CODE }) });
    await page.getByTestId('hdsd-pay-period-create-submit').waitFor({ state: 'visible', timeout: 15000 });
    await shot(page, '03-create-dialog-filled');`;

s = s.replace(re, neu);
writeFileSync(p, s, 'utf8');
console.log('ok', s.includes('Do not Escape here'));
