import fs from 'node:fs';
import path from 'node:path';
const dir = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r3';
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.xml'))) {
  const x = fs.readFileSync(path.join(dir, f), 'utf8');
  const keys = [
    'home-top-bar-brand-accent',
    'dashboard-attendance-brand-bar',
    'fab-primary-action-sheet',
    'check-in-channel-gps',
    'check-in-channel-face',
    'face-mvp-honesty-banner',
    'check-in-submit',
    'login-email',
    'branded-login-card',
  ];
  const hit = keys.filter((k) => x.includes(k));
  const submitDisabled = /check-in-submit[^>]*enabled="false"/.test(x.replace(/\s+/g, ' '));
  if (hit.length || submitDisabled) console.log(f, hit.join(','), submitDisabled ? 'submit_disabled' : '');
}
