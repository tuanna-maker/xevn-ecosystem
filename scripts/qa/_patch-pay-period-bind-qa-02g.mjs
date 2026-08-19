import { readFileSync, writeFileSync } from 'node:fs';

const p = 'scripts/qa/_tmp-po-hrm-amis-parity-pay-period-bind-qa-02.mjs';
let s = readFileSync(p, 'utf8');

// Capture start_date on POST/list responses
const oldSnap = `          if (d?.sheet_template_snapshot_json?.template_name)
            entry.snapshotTemplateName = d.sheet_template_snapshot_json.template_name;`;
const newSnap = `          if (d?.sheet_template_snapshot_json?.template_name)
            entry.snapshotTemplateName = d.sheet_template_snapshot_json.template_name;
          if (d?.start_date) entry.start_date = d.start_date;
          if (d?.end_date) entry.end_date = d.end_date;`;
if (!s.includes(oldSnap)) throw new Error('snapshot capture marker miss');
s = s.replace(oldSnap, newSnap);

const oldListHit = `              entry.listHit = {
                id: hit.id,
                pay_sheet_template_id: hit.pay_sheet_template_id ?? null,
                snapshot_name: hit.sheet_template_snapshot_json?.template_name ?? null,
              };`;
const newListHit = `              entry.listHit = {
                id: hit.id,
                pay_sheet_template_id: hit.pay_sheet_template_id ?? null,
                snapshot_name: hit.sheet_template_snapshot_json?.template_name ?? null,
                start_date: hit.start_date ?? null,
              };`;
if (!s.includes(oldListHit)) throw new Error('listHit marker miss');
s = s.replace(oldListHit, newListHit);

// After AC2 / periodId set, realign PERIOD_MONTH/YEAR from create start_date (VN)
const marker = `    if (periodPost?.dataId) results.ids.periodId = periodPost.dataId;

    recordAc('AC2_POST_PERIOD_BIND'`;
const inject = `    if (periodPost?.dataId) results.ids.periodId = periodPost.dataId;
    // Realign filter to VN calendar month of created start_date (form month can diverge)
    if (periodPost?.start_date) {
      const d = new Date(periodPost.start_date);
      const vn = new Date(d.getTime() + 7 * 3600_000);
      PERIOD_MONTH = vn.getUTCMonth() + 1;
      PERIOD_YEAR = vn.getUTCFullYear();
      results.env.PERIOD_MONTH = PERIOD_MONTH;
      results.env.PERIOD_YEAR = PERIOD_YEAR;
      log('period_slot_realign', {
        note: JSON.stringify({ start_date: periodPost.start_date, PERIOD_MONTH, PERIOD_YEAR }),
      });
      save();
    }

    recordAc('AC2_POST_PERIOD_BIND'`;
if (!s.includes(marker)) throw new Error('AC2 marker miss');
s = s.replace(marker, inject);

writeFileSync(p, s, 'utf8');
console.log('ok', s.includes('period_slot_realign'), s.includes('entry.start_date'));
