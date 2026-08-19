#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const srcPath = 'scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog.mjs';
const dstPath = 'scripts/qa/_tmp-po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog.mjs';

let s = readFileSync(srcPath, 'utf8');
s = s
  .replaceAll(
    'PO-UC-TC-W4-QA-E2-HRM-AT-R5-AT12-CREATE-CATALOG',
    'PO-UC-TC-W4-QA-E2-HRM-AT-R5b-AT12-CREATE-CATALOG',
  )
  .replaceAll(
    'po-uc-tc-w4-qa-e2-hrm-at-r5-at12-create-catalog',
    'po-uc-tc-w4-qa-e2-hrm-at-r5b-at12-create-catalog',
  )
  .replaceAll('W4R5AT12', 'W4R5bAT12')
  .replaceAll('QA R5 CREATE-CATALOG', 'QA R5b CREATE-CATALOG');

const probeStart = s.indexOf('async function probeLeaveTypePicker(page)');
const probeEnd = s.indexOf('async function clickSyncCta(page)');
if (probeStart < 0 || probeEnd < 0) throw new Error('probe markers missing');

const newProbe = `async function probeLeaveTypePicker(page) {
  const dlg = page.locator('[role="dialog"]').first();
  const syncCta = page.getByTestId('hdsd-leave-sync-catalog');
  const syncVisible = await syncCta.isVisible().catch(() => false);

  // Open leave-type combobox (usually 2nd in create dialog after employee)
  const typeTrigger = dlg.locator('button[role="combobox"]').nth(1);
  let optionCount = 0;
  let optionTexts = [];
  let emptyHint = null;
  let opened = false;
  if (await typeTrigger.isVisible().catch(() => false)) {
    await typeTrigger.click({ force: true });
    await sleep(800);
    opened = true;
    const opts = page.getByRole('option');
    const texts = await opts.allTextContents().catch(() => []);
    optionTexts = texts
      .map((t) => t.replace(/\\s+/g, ' ').trim())
      .filter((t) => t && !/^chọn|select|không có|empty/i.test(t));
    optionCount = optionTexts.length;
    emptyHint = await page
      .locator('text=/Chưa có mục|không có.*danh mục|Mở Cài đặt/i')
      .first()
      .textContent()
      .catch(() => null);
    // Keep popover open if we need sync CTA inside emptyHint; else close for count
    if (optionCount > 0 && !emptyHint) {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(300);
    }
  }

  // Sync CTA may live in emptyHint inside the open popover
  const syncVisibleAfter = (await syncCta.isVisible().catch(() => false)) || syncVisible;

  // R5 honesty: emptyHint + CTA => authoritative empty (ignore global option leak)
  const authoritativeEmpty = Boolean(emptyHint) && syncVisibleAfter;
  if (authoritativeEmpty) optionCount = 0;

  return {
    leaveTypeOptionCount: optionCount,
    optionTexts: optionTexts.slice(0, 8),
    syncCtaVisible: syncVisibleAfter,
    emptyHint: emptyHint ? String(emptyHint).slice(0, 160) : null,
    authoritativeEmpty,
    opened,
  };
}

`;

s = s.slice(0, probeStart) + newProbe + s.slice(probeEnd);

const syncMarker =
  "    const syncOk =\n      results.syncBody &&\n      results.syncBody.status >= 200 &&\n      results.syncBody.status < 300;\n    const syncScopeOk = results.syncBody?.xCompanyId === COMPANY;\n    recordStep('sync_post', syncOk && syncScopeOk ? 'PASS' : syncOk ? 'FAIL' : 'FAIL', {";
const syncIdx = s.indexOf(syncMarker);
if (syncIdx < 0) throw new Error('sync marker missing');

const afterSyncIf = s.indexOf(
  '\n\n    // Re-probe after invalidate',
  syncIdx,
);
if (afterSyncIf < 0) throw new Error('re-probe marker missing');

const newSyncBlock = `    const syncOk =
      results.syncBody &&
      results.syncBody.status >= 200 &&
      results.syncBody.status < 300;
    const syncScopeOk = results.syncBody?.xCompanyId === COMPANY;
    const pulled = Array.isArray(results.syncBody?.pulledKeys) ? results.syncBody.pulledKeys : [];
    const pulledOk = pulled.length > 0;
    const hasLeaveTypes = pulled.includes('leave_types');
    results.syncBody = { ...results.syncBody, pulledKeysCount: pulled.length, hasLeaveTypes };
    recordStep('sync_post', syncOk && syncScopeOk && pulledOk ? 'PASS' : 'FAIL', {
      summary: \`status=\${results.syncBody?.status} code=\${results.syncBody?.code} x-company-id=\${results.syncBody?.xCompanyId} pulledKeys=\${pulled.length} leave_types=\${hasLeaveTypes}\`,
    });

    if (!syncOk) {
      results.residuals.push({
        id: 'R-W4-AT12-L1-CREATE-CATALOG-SYNC',
        sev: 'P0',
        owner: 'dev-fe',
        note: \`sync-from-xbos not 2xx: \${JSON.stringify(results.syncBody)}\`,
      });
    } else if (!syncScopeOk) {
      results.residuals.push({
        id: 'R-W4-AT12-L1-CREATE-CATALOG-SCOPE',
        sev: 'P0',
        owner: 'dev-fe',
        note: \`sync x-company-id=\${results.syncBody?.xCompanyId} expected \${COMPANY}\`,
      });
    } else if (!pulledOk) {
      results.residuals.push({
        id: 'R-W4-AT12-L1-CREATE-CATALOG-BE-PULL',
        sev: 'P1',
        owner: 'dev-be',
        note: 'sync 201 + x-company-id=trsport but pulledKeys=[] — BE pull gap (cấm seed)',
      });
    }
`;

s = s.slice(0, syncIdx) + newSyncBlock + s.slice(afterSyncIf);

// Also strengthen post_sync summary
s = s.replace(
  "recordStep('post_sync_picker', post.leaveTypeOptionCount >= 1 ? 'PASS' : 'FAIL', {\n      summary: `options=${post.leaveTypeOptionCount} syncCta=${post.syncCtaVisible}`,\n    });",
  "recordStep('post_sync_picker', post.leaveTypeOptionCount >= 1 ? 'PASS' : 'FAIL', {\n      summary: `options=${post.leaveTypeOptionCount} syncCta=${post.syncCtaVisible} emptyHint=${post.emptyHint || 'n/a'} authEmpty=${post.authoritativeEmpty} texts=${JSON.stringify(post.optionTexts || [])}`,\n    });",
);

writeFileSync(dstPath, s, 'utf8');
console.log('wrote', dstPath, 'bytes', s.length);
console.log('has authoritativeEmpty', s.includes('authoritativeEmpty'));
console.log('has pulledOk', s.includes('pulledOk'));
console.log('work_item', s.includes('R5b-AT12'));
