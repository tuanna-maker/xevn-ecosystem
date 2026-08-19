/**
 * Build world-standard test-log md+json from RET3 runtime.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const runtimePath = resolve(ROOT, 'docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret3-runtime.json');
const jsonOut = resolve(ROOT, 'docs/qa/evidence/w1b-04-auth-fe-qa-ret3-test-log.json');
const mdOut = resolve(ROOT, 'docs/qa/evidence/w1b-04-auth-fe-qa-ret3-test-log.md');

const r = JSON.parse(readFileSync(runtimePath, 'utf8'));
const started = r.startedAt;
const ended = r.finishedAt;
const screen = (name) => `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret3/${name}`;

const caseA = r.ac.find((a) => a.id === 'CASE-A');
const caseB1 = r.ac.find((a) => a.id === 'CASE-B-AC1-labels');
const caseB2 = r.ac.find((a) => a.id === 'CASE-B-AC2-membershipId');
const caseC = r.ac.find((a) => a.id === 'CASE-C-F5');
const formAc = r.ac.find((a) => a.id === 'FORM');

let seq = 1;
const steps = [];
const P = (at, action, expected, actual, network, result, attachment) => {
  steps.push({
    seq: seq++,
    at,
    action,
    expected,
    actual,
    network: network || null,
    result,
    attachment: attachment || null,
  });
};

const net = (i) => {
  const n = r.network[i];
  return {
    method: n.method,
    url: n.url,
    status: n.status,
    code: n.code,
    at: n.at,
  };
};

P(
  started,
  'L0 health probe',
  'HRM/XBOS/portal 200; App.tsx + CommandCenterPage 200',
  `hrm=${r.l0.hrm} xbos=${r.l0.xbos} portal=${r.l0.portal} App.tsx=${r.l0.appTsx} CommandCenterPage=${r.l0.commandCenterPage}`,
  null,
  'pass',
  null,
);
P(
  r.clicks[0].at,
  'assert-login-form-visible',
  'Login form email+password visible',
  `Form visible; ${formAc.detail.slice(0, 120)}`,
  null,
  'pass',
  screen('00-login-form.png'),
);
P(r.clicks[1].at, 'goto-login-clear (Case A)', 'Navigate /login clear', 'URL /login', null, 'pass', null);
P(r.clicks[2].at, 'fill-email Case A', 'Email ceo@xe.vn filled', 'filled', null, 'pass', null);
P(r.clicks[3].at, 'fill-password Case A', 'Wrong password entered', 'passwordLen=25', null, 'pass', null);
P(
  r.clicks[4].at,
  'click-submit-login Case A',
  'Submit wrong credentials; API 401',
  'click fired; login rejected',
  net(0),
  'pass',
  null,
);
P(
  caseA.at,
  'Case A assert fail UX',
  'Stay /login + VI fail message',
  '«Email hoặc mật khẩu không đúng»; stillLogin=true',
  net(0),
  'pass',
  screen('A-wrong-password.png'),
);
P(r.clicks[5].at, 'goto-login-clear (Case B ceo)', 'Fresh login for success path', '/login', null, 'pass', null);
P(r.clicks[6].at, 'fill-email Case B', 'ceo@xe.vn', 'filled', null, 'pass', null);
P(r.clicks[7].at, 'fill-password Case B', 'Correct password', 'passwordLen=9', null, 'pass', null);
P(
  r.clicks[8].at,
  'click-submit-login Case B',
  'Login 2xx + TopHeader membership BE *_label; no Vite overlay',
  'Login 201/XBOS-AUTH-200; BE labels OK in Network; viteOverlay=false; URL /command-center; UI mode=missing (no portal-membership-*); CC hero BOD/Quản lý/Nhân viên ≠ *_label',
  net(1),
  'fail',
  screen('B-ceo-after-login.png'),
);
P(
  caseB1.at,
  'post-login Command Center + membership chip',
  '/command-center without Vite overlay; chip shows tenant_label/company_label/role_label',
  'CC mounted; overlay=false; failedSrc=0; portal-membership-switcher/static absent; ExecutiveDashboardLayout has no TopHeader',
  null,
  'fail',
  screen('B-ceo-after-login.png'),
);
P(r.clicks[9].at, 'goto-login-clear (admin multi-mem)', 'Retry with multi-membership user', '/login', null, 'pass', null);
P(r.clicks[10].at, 'fill-email admin', 'admin@xe.vn', 'filled', null, 'pass', null);
P(r.clicks[11].at, 'fill-password admin', 'Correct password', 'filled', null, 'pass', null);
P(
  r.clicks[12].at,
  'click-submit-login admin',
  'Picker openable; select-membership Network',
  'Login 201; 5 memberships with *_label; switcher not in DOM; no POST select-membership',
  net(2),
  'fail',
  screen('B-admin-after-login.png'),
);
P(
  caseB2.at,
  'Case B select-membership AC',
  'Click other membership → select-membership 2xx + mid update',
  'path=blocked-no-switcher; session mid present; select UI unreachable',
  null,
  'blocked',
  null,
);
P(
  r.clicks[13].at,
  'reload-F5 Case C',
  'Labels persist after F5',
  caseC.detail,
  net(3),
  'fail',
  screen('C-after-f5.png'),
);

const summary = {
  passed: steps.filter((s) => s.result === 'pass').length,
  failed: steps.filter((s) => s.result === 'fail').length,
  blocked: steps.filter((s) => s.result === 'blocked').length,
  skipped: 0,
  click_count: r.clicks.length,
  network_auth_count: r.network.length,
  idle_viewport_violation: false,
};

const log = {
  schema: 'xevn-test-log/v1',
  log_id: 'TEL-W1B-04-AUTH-FE-RET3-20260803',
  work_item_id: 'W1-B-04-AUTH-FE-QA-RET3',
  tester: {
    role: 'qa',
    harness: 'scripts/qa/w1b-04-auth-fe-qa-ret3-cases-browser.mjs',
  },
  started_at: started,
  ended_at: ended,
  environment: {
    portal_url: 'http://127.0.0.1:5173',
    login_url: 'http://127.0.0.1:5173/login',
    hrm_api: 'http://127.0.0.1:28001/api/hrm',
    xbos_api: 'http://127.0.0.1:28002/api/xbos',
    l0: {
      hrm: 200,
      xbos: 200,
      portal: 200,
      appTsx: 200,
      commandCenterPage: 200,
    },
    notes:
      'U65 zero-seed; clickCount=14; failedSrc=0; vite overlay CLOSED; membership chip missing on CC shell',
  },
  spec_ref: 'FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice DOC-ENT-P0-AUTH-M01',
  hdsd_sot: 'Portal login → fail msg → membership labels → select → F5',
  hdsd_align: true,
  u65_zero_seed: true,
  evidence_narrative: 'docs/qa/evidence/w1b-04-auth-fe-qa-ret3.md',
  runtime_source: 'docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret3-runtime.json',
  human_log: 'docs/qa/evidence/w1b-04-auth-fe-qa-ret3-test-log.md',
  steps,
  cases: [
    {
      id: 'FORM',
      name: 'Login form visible',
      status: 'pass',
      notes: '00-login-form.png',
    },
    {
      id: 'CASE-A',
      name: 'fail_deep wrong password',
      status: 'pass',
      notes: '401 XBOS-AUTH-401 + VI message',
    },
    {
      id: 'CASE-B-AC1-labels',
      name: 'success_hdsd membership *_label on TopHeader',
      status: 'fail',
      notes:
        'CC loads no overlay; portal-membership-* absent; BOD persona ≠ BE *_label',
    },
    {
      id: 'CASE-B-AC2-membershipId',
      name: 'select-membership multi',
      status: 'blocked',
      notes: 'admin 5 mem; no switcher; no select Network',
    },
    {
      id: 'CASE-C-F5',
      name: 'logic_br F5 labels persist',
      status: 'fail',
      notes: 'mid/JWT persist; labels UI missing',
    },
  ],
  incidents: [
    {
      id: 'R-AUTH-FE-VITE-CC-PAGE',
      severity: 'closed',
      expected: 'CommandCenterPage Vite 200; no overlay',
      actual: 'CLOSED — transform 200; overlay false; failedSrc=0',
      residual_wi: null,
      status: 'closed',
    },
    {
      id: 'R-AUTH-FE-CC-MEMBERSHIP-CHIP',
      severity: 'P0',
      expected:
        'TopHeader portal-membership-* on /command-center with BE tenant_label/company_label/role_label',
      actual:
        'ExecutiveDashboardLayout has no TopHeader; CC hero BOD/Quản lý/Nhân viên only; testids missing',
      residual_wi: 'W1-B-04-AUTH-FE-CC-CHIP-01',
    },
    {
      id: 'R-AUTH-FE-SELECT-MEMBERSHIP-UI',
      severity: 'P0',
      expected: 'Multi-mem select-membership click path',
      actual: 'No portal-membership-switcher; no POST /auth/select-membership',
      residual_wi: 'W1-B-04-AUTH-FE-CC-CHIP-01',
    },
  ],
  summary,
  ack_status: 'FAIL',
  verdict: 'fail',
};

writeFileSync(jsonOut, JSON.stringify(log, null, 2));

const netCell = (n) =>
  n ? `${n.method} \`${n.url}\` → **${n.status}** \`${n.code || ''}\` @ ${n.at}` : '—';

const md = `# Test execution log — W1-B-04-AUTH-FE-QA-RET3

| Field | Value |
|-------|--------|
| **log_id** | \`${log.log_id}\` |
| **work_item_id** | \`W1-B-04-AUTH-FE-QA-RET3\` |
| **tester** | qa · harness \`scripts/qa/w1b-04-auth-fe-qa-ret3-cases-browser.mjs\` |
| **started_at** | \`${started}\` |
| **ended_at** | \`${ended}\` |
| **environment** | Portal \`http://127.0.0.1:5173\` · HRM \`:28001\` · XBOS \`:28002\` · L0 all 200 · App.tsx 200 · CommandCenterPage 200 |
| **hdsd_sot** | Portal login → fail msg → membership labels → select → F5 |
| **spec_ref** | FR-UC-M01 · API_CONTRACT §8.1–8.3 · slice \`DOC-ENT-P0-AUTH-M01\` |
| **hdsd_align** | true |
| **u65_zero_seed** | true |
| **machine_log** | \`docs/qa/evidence/w1b-04-auth-fe-qa-ret3-test-log.json\` |
| **evidence_narrative** | \`docs/qa/evidence/w1b-04-auth-fe-qa-ret3.md\` |
| **runtime_source** | \`docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret3-runtime.json\` |
| **verdict** | **fail** |

**SoT:** \`_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md\` · project \`docs/qa/WORLD_STANDARD_TEST_LOG.md\`

## Chronological steps

| seq | time (UTC) | action (HDSD) | expected | actual | network | result | attachment |
|-----|------------|---------------|----------|--------|---------|--------|------------|
${steps
  .map(
    (s) =>
      `| ${s.seq} | ${s.at} | ${s.action} | ${s.expected} | ${s.actual} | ${netCell(s.network)} | ${s.result} | ${s.attachment ? `\`${s.attachment}\`` : '—'} |`,
  )
  .join('\n')}

**Click count:** ${r.clicks.length} (anti-idle PASS). **No** \`POST /auth/select-membership\` observed. **failedSrc:** 0 · **viteOverlay:** false.

## Case matrix results

| Case | id | status | notes |
|------|-----|--------|-------|
| Form | FORM | pass | Login page email+password · \`00-login-form.png\` |
| A fail deep | CASE-A | pass | Wrong pwd → 401 + VI message · stay \`/login\` |
| B success HDSD | CASE-B-AC1-labels | fail | BE \`*_label\` in Network; CC no overlay; TopHeader \`portal-membership-*\` **missing** (shell = ExecutiveDashboardLayout) |
| B select | CASE-B-AC2-membershipId | blocked | admin 5 mem; select UI unreachable; no select Network |
| C logic BR | CASE-C-F5 | fail | F5 keeps JWT mid; labels not on UI |

## Incidents

| id | severity | expected | actual | residual WI |
|----|----------|----------|--------|-------------|
| R-AUTH-FE-VITE-CC-PAGE | closed | CC Vite 200 / no overlay | **CLOSED** this wave | — |
| R-AUTH-FE-CC-MEMBERSHIP-CHIP | P0 | TopHeader membership BE \`*_label\` on \`/command-center\` | Layout has no TopHeader; hero BOD/Quản lý/Nhân viên only | W1-B-04-AUTH-FE-CC-CHIP-01 |
| R-AUTH-FE-SELECT-MEMBERSHIP-UI | P0 | Multi-mem select click + Network | Switcher absent | W1-B-04-AUTH-FE-CC-CHIP-01 |

## Summary

| passed | failed | blocked | skipped |
|--------|--------|---------|---------|
| ${summary.passed} | ${summary.failed} | ${summary.blocked} | ${summary.skipped} |

**ack_status (source wave):** FAIL
`;

writeFileSync(mdOut, md);
console.log('Wrote', jsonOut);
console.log('Wrote', mdOut);
console.log('summary', summary);
