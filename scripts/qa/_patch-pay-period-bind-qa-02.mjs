import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
let s = readFileSync(resolve(root, 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-01.mjs'), 'utf8');

s = s
  .replaceAll('QA-01', 'QA-02')
  .replaceAll('qa-01', 'qa-02')
  .replaceAll('PAYBINDQA1', 'PAYBINDQA2')
  .replace(
    'PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-FE-01 READY_FOR_QA',
    'PO-HRM-AMIS-PARITY-PAY-PERIOD-BIND-BE-02 READY_FOR_QA - retest R-PAY-PERIOD-LIST-TPL',
  );

// Make period month/year mutable + env override
s = s.replace(
  `// Use offset month to reduce overlap collisions
const now = new Date();
const PERIOD_MONTH = ((now.getMonth() + 7) % 12) + 1;
const PERIOD_YEAR = now.getFullYear() + (now.getMonth() >= 5 ? 1 : 0);`,
  `// Resolved after login to avoid HRM-PAY-002 overlap (or QA_PERIOD_MONTH/YEAR env)
let PERIOD_MONTH = Number(process.env.QA_PERIOD_MONTH || 0) || 0;
let PERIOD_YEAR = Number(process.env.QA_PERIOD_YEAR || 0) || 0;`,
);

// Insert resolveFreePeriodSlot after loginApi function ends (before injectPortalAuth)
const injectMarker = 'async function injectPortalAuth(page, session) {';
if (!s.includes(injectMarker)) throw new Error('injectPortalAuth marker missing');

const freeSlotFn = `
async function resolveFreePeriodSlot(token) {
  if (PERIOD_MONTH && PERIOD_YEAR) return { month: PERIOD_MONTH, year: PERIOD_YEAR, source: 'env' };
  const r = await fetch(HRM + '/api/hrm/payroll/periods?company_id=' + COMPANY, {
    headers: { Authorization: 'Bearer ' + token, 'x-tenant-id': TENANT, 'x-company-id': COMPANY },
  });
  const j = await r.json().catch(() => ({}));
  const rows = Array.isArray(j?.data) ? j.data : Array.isArray(j?.data?.data) ? j.data.data : [];
  const occupied = new Set();
  for (const row of rows) {
    const sd = row.start_date || row.period_start;
    if (!sd) continue;
    const d = new Date(sd);
    const vn = new Date(d.getTime() + 7 * 3600_000);
    occupied.add(vn.getUTCMonth() + 1 + '-' + vn.getUTCFullYear());
  }
  const cy = new Date().getFullYear();
  const candidates = [];
  for (const y of [cy, cy + 1, cy - 1]) {
    for (let m = 1; m <= 12; m++) candidates.push({ month: m, year: y });
  }
  candidates.sort((a, b) => {
    const score = (x) => (x.month === 9 || x.month === 10 || x.month === 11 || x.month === 12 ? 0 : 1);
    return score(a) - score(b);
  });
  for (const c of candidates) {
    if (!occupied.has(c.month + '-' + c.year)) {
      PERIOD_MONTH = c.month;
      PERIOD_YEAR = c.year;
      return { ...c, source: 'probe', occupied: [...occupied].sort() };
    }
  }
  PERIOD_MONTH = 10;
  PERIOD_YEAR = cy + 1;
  return { month: PERIOD_MONTH, year: PERIOD_YEAR, source: 'fallback', occupied: [...occupied].sort() };
}

`;

s = s.replace(injectMarker, freeSlotFn + injectMarker);

// After login in main: resolve slot
s = s.replace(
  `  const session = await loginApi();
  log('login_api_ok');

  const browser = await chromium.launch({`,
  `  const session = await loginApi();
  log('login_api_ok');
  const slot = await resolveFreePeriodSlot(session.token);
  log('free_period_slot', { note: JSON.stringify(slot) });
  results.env.PERIOD_MONTH = PERIOD_MONTH;
  results.env.PERIOD_YEAR = PERIOD_YEAR;
  save();

  const browser = await chromium.launch({`,
);

// Harden list GET parsing for nested {data:{data:[]}}
s = s.replace(
  `          if (Array.isArray(d?.data) && /\\/periods/.test(u) && method === 'GET') {
            entry.listCount = d.data.length;
            const hit = d.data.find((p) => String(p.period_label || '').includes(STAMP));
            if (hit) {
              entry.listHit = {
                id: hit.id,
                pay_sheet_template_id: hit.pay_sheet_template_id ?? null,
                snapshot_name: hit.sheet_template_snapshot_json?.template_name ?? null,
              };
            }
          }`,
  `          const list = Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : null;
          if (list && /\\/periods/.test(u) && method === 'GET') {
            entry.listCount = list.length;
            const hit =
              list.find((p) => String(p.period_label || '').includes(STAMP)) ||
              (results.ids.periodId ? list.find((p) => p.id === results.ids.periodId) : null);
            if (hit) {
              entry.listHit = {
                id: hit.id,
                pay_sheet_template_id: hit.pay_sheet_template_id ?? null,
                snapshot_name: hit.sheet_template_snapshot_json?.template_name ?? null,
              };
            }
          }`,
);

// After create: filter + listHit assert
const oldAc3Start = `    await dialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => null);
    await sleep(1500);
    await shot(page, '04-after-create-list');

    const periodId = results.ids.periodId;
    let rowTplText = '';
    if (periodId) {
      const rowCell = page.getByTestId(\`pay-batch-row-tpl-\${periodId}\`);
      rowTplText = ((await rowCell.innerText().catch(() => '')) || '').trim();
    } else {
      const row = page.locator(\`tr:has-text("\${PERIOD_NAME}")\`).first();
      rowTplText = ((await row.locator('td').nth(3).innerText().catch(() => '')) || '').trim();
    }
    const rowHasName =
      rowTplText.includes(TPL_NAME) ||
      rowTplText.includes(TPL_CODE) ||
      (periodPost?.snapshotTemplateName && rowTplText.includes(periodPost.snapshotTemplateName));

    recordAc('AC3_ROW_TPL_AFTER_CREATE', rowHasName ? 'PASS' : 'FAIL', {
      summary: rowHasName
        ? \`Row Mẫu bảng lương shows "\${rowTplText}"\`
        : \`FAIL row tpl cell="\${rowTplText}" expected "\${TPL_NAME}"\`,
      rowTplText,
      periodId,
      click_path: 'list after POST invalidateQueries',
    });
    if (!rowHasName) {
      results.residuals.push({
        id: 'R-PAY-PERIOD-LIST-TPL',
        owner: 'dev-be',
        note: 'GET /payroll/periods list missing snapshot — row shows em-dash after refetch',
      });
    }

    // Detail subtitle
    if (periodId) {
      await page.getByTestId(\`pay-batch-row-\${periodId}\`).click({ force: true });
    } else {
      await page.locator(\`tr:has-text("\${PERIOD_NAME}")\`).first().click({ force: true });
    }`;

const newAc3 = `    await dialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => null);
    await sleep(1500);

    async function selectPeriodFilter() {
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
    await shot(page, '04-after-create-list');

    const periodId = results.ids.periodId;
    const listHits = results.network
      .filter((n) => n.method === 'GET' && /\\/payroll\\/periods/.test(n.url) && n.listHit)
      .map((n) => n.listHit);
    const listHit =
      (periodId && listHits.filter((h) => h.id === periodId).slice(-1)[0]) ||
      listHits[listHits.length - 1] ||
      null;
    const listApiOk = Boolean(
      listHit?.pay_sheet_template_id &&
        listHit?.snapshot_name &&
        (String(listHit.snapshot_name).includes(TPL_NAME) ||
          String(listHit.snapshot_name).includes(TPL_CODE) ||
          (periodPost?.snapshotTemplateName &&
            String(listHit.snapshot_name).includes(periodPost.snapshotTemplateName))),
    );

    let rowTplText = '';
    if (periodId) {
      const rowCell = page.getByTestId('pay-batch-row-tpl-' + periodId);
      rowTplText = ((await rowCell.innerText().catch(() => '')) || '').trim();
    } else {
      const row = page.locator('tr:has-text("' + PERIOD_NAME + '")').first();
      rowTplText = ((await row.locator('td').nth(3).innerText().catch(() => '')) || '').trim();
    }
    const rowHasName =
      rowTplText.includes(TPL_NAME) ||
      rowTplText.includes(TPL_CODE) ||
      (periodPost?.snapshotTemplateName && rowTplText.includes(periodPost.snapshotTemplateName));
    const ac3Ok = listApiOk && rowHasName;

    recordAc('AC3_ROW_TPL_AFTER_CREATE', ac3Ok ? 'PASS' : 'FAIL', {
      summary: ac3Ok
        ? 'List API snapshot="' + (listHit?.snapshot_name || '') + '" row="' + rowTplText + '"'
        : 'FAIL listApiOk=' + listApiOk + ' listHit=' + JSON.stringify(listHit) + ' rowTpl="' + rowTplText + '"',
      rowTplText,
      listHit,
      listApiOk,
      filterSet,
      periodId,
      click_path: 'list after POST + pay-batch-period-filter',
    });
    if (!listApiOk) {
      results.residuals.push({
        id: 'R-PAY-PERIOD-LIST-TPL',
        owner: 'dev-be',
        note: 'GET /payroll/periods list missing pay_sheet_template_id / snapshot template_name',
      });
    } else if (!rowHasName) {
      results.residuals.push({
        id: 'R-PAY-PERIOD-ROW-TPL-FE',
        owner: 'dev-fe',
        note: 'List API has snapshot but row cell="' + rowTplText + '"',
      });
    }

    // Detail subtitle
    if (periodId) {
      await page.getByTestId('pay-batch-row-' + periodId).click({ force: true });
    } else {
      recordAc('AC4_DETAIL_TPL_SUBTITLE', 'FAIL', {
        summary: 'SKIP/FAIL — no periodId (POST did not create)',
        click_path: 'blocked',
      });
      throw new Error('No periodId after POST — cannot continue AC4/AC5');
    }`;

if (!s.includes(oldAc3Start)) throw new Error('AC3 block not found');
s = s.replace(oldAc3Start, newAc3);

// F5: re-apply filter + listHit
const oldF5 = `    // F5
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await openPayrollBatches(page);
    await shot(page, '06-after-f5-list');

    let rowTplAfterF5 = '';
    if (periodId) {
      rowTplAfterF5 = ((await page.getByTestId(\`pay-batch-row-tpl-\${periodId}\`).innerText().catch(() => '')) || '').trim();
    } else {
      const row = page.locator(\`tr:has-text("\${PERIOD_NAME}")\`).first();
      rowTplAfterF5 = ((await row.locator('td').nth(3).innerText().catch(() => '')) || '').trim();
    }
    const periodStillThere = await page.locator(\`text=\${PERIOD_NAME}\`).first().isVisible().catch(() => false);
    const f5TplOk =
      periodStillThere &&
      (rowTplAfterF5.includes(TPL_NAME) ||
        rowTplAfterF5.includes(TPL_CODE) ||
        (periodPost?.snapshotTemplateName && rowTplAfterF5.includes(periodPost.snapshotTemplateName)));

    recordAc('AC5_F5_ROW_TPL_PERSIST', f5TplOk ? 'PASS' : 'FAIL', {
      summary: f5TplOk
        ? \`F5: kỳ còn · mẫu row="\${rowTplAfterF5}"\`
        : \`FAIL F5 period=\${periodStillThere} rowTpl="\${rowTplAfterF5}" expected template name\`,
      rowTplAfterF5,
      periodStillThere,
      click_path: 'F5 → reopen batches list',
    });
    if (!f5TplOk) {
      const already = results.residuals.some((r) => r.id === 'R-PAY-PERIOD-LIST-TPL');
      if (!already) {
        results.residuals.push({
          id: 'R-PAY-PERIOD-LIST-TPL',
          owner: 'dev-be',
          note: 'F5 row lost template name — expand list SELECT + mapPeriod snapshot fields',
        });
      }
    }`;

const newF5 = `    // F5
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3500);
    await openPayrollBatches(page);
    await selectPeriodFilter();
    await shot(page, '06-after-f5-list');

    const listHitsF5 = results.network
      .filter((n) => n.method === 'GET' && /\\/payroll\\/periods/.test(n.url) && n.listHit)
      .map((n) => n.listHit);
    const listHitF5 =
      listHitsF5.filter((h) => h.id === periodId).slice(-1)[0] ||
      listHitsF5[listHitsF5.length - 1] ||
      null;
    const listApiF5Ok = Boolean(
      listHitF5?.pay_sheet_template_id &&
        listHitF5?.snapshot_name &&
        (String(listHitF5.snapshot_name).includes(TPL_NAME) ||
          String(listHitF5.snapshot_name).includes(TPL_CODE) ||
          (periodPost?.snapshotTemplateName &&
            String(listHitF5.snapshot_name).includes(periodPost.snapshotTemplateName))),
    );

    let rowTplAfterF5 = '';
    rowTplAfterF5 = ((await page.getByTestId('pay-batch-row-tpl-' + periodId).innerText().catch(() => '')) || '').trim();
    const periodStillThere = await page.getByTestId('pay-batch-row-' + periodId).isVisible().catch(() => false);
    const rowF5Ok =
      periodStillThere &&
      (rowTplAfterF5.includes(TPL_NAME) ||
        rowTplAfterF5.includes(TPL_CODE) ||
        (periodPost?.snapshotTemplateName && rowTplAfterF5.includes(periodPost.snapshotTemplateName)));
    const f5TplOk = listApiF5Ok && rowF5Ok;

    recordAc('AC5_F5_ROW_TPL_PERSIST', f5TplOk ? 'PASS' : 'FAIL', {
      summary: f5TplOk
        ? 'F5: list snapshot="' + (listHitF5?.snapshot_name || '') + '" row="' + rowTplAfterF5 + '"'
        : 'FAIL F5 listApi=' + listApiF5Ok + ' period=' + periodStillThere + ' rowTpl="' + rowTplAfterF5 + '"',
      rowTplAfterF5,
      listHitF5,
      listApiF5Ok,
      periodStillThere,
      click_path: 'F5 -> reopen batches list -> pay-batch-period-filter',
    });
    if (!listApiF5Ok) {
      if (!results.residuals.some((r) => r.id === 'R-PAY-PERIOD-LIST-TPL')) {
        results.residuals.push({
          id: 'R-PAY-PERIOD-LIST-TPL',
          owner: 'dev-be',
          note: 'F5 GET list missing pay_sheet_template_id / snapshot',
        });
      }
    } else if (!rowF5Ok) {
      if (!results.residuals.some((r) => r.id === 'R-PAY-PERIOD-ROW-TPL-FE')) {
        results.residuals.push({
          id: 'R-PAY-PERIOD-ROW-TPL-FE',
          owner: 'dev-fe',
          note: 'F5 list API OK but row="' + rowTplAfterF5 + '"',
        });
      }
    }`;

if (!s.includes(oldF5)) throw new Error('F5 block not found');
s = s.replace(oldF5, newF5);

mkdirSync(resolve(root, 'docs/qa/evidence/screens/po-hrm-amis-parity-pay-period-bind-qa-02'), {
  recursive: true,
});
const out = resolve(root, 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs');
writeFileSync(out, s, 'utf8');
console.log('OK', out, 'bytes', Buffer.byteLength(s, 'utf8'), 'hasMau', s.includes('Mẫu'), 'hasLap', s.includes('lập bảng'));
