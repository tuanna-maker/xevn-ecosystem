import fs from 'node:fs';
const dir = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r2';
for (const f of ['checkin-screen', 'gps-after-submit', 'fab-sheet']) {
  const x = fs.readFileSync(`${dir}/${f}.xml`, 'utf8');
  console.log('\n==', f);
  for (const id of [
    'check-in-submit',
    'check-in-channel-gps',
    'check-in-channel-face-mvp',
    'face-mvp-honesty-banner',
    'fab-primary-action-sheet',
  ]) {
    console.log(id, x.includes(id));
  }
}
