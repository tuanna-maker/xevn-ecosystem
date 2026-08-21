#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R8-BASEURL
 * APK-06 · fillDevBaseUrlField + mid-band assert → host http://10.0.2.2:28001
 * U65 zero-seed · face_live=false · remaster_program_done=false · no qa-login sole
 */
import { execSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  collapseDevLoginPanelIfOpen,
  fillDevBaseUrlField,
  fillProductionLoginFields,
  findDevBaseUrlBounds,
  findLoginFieldBounds,
  findNodeBounds,
  isAdbMidBandHit,
  loginEmailLooksFilled,
} from '../../apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const PKG = 'vn.xevn.hrm.mobile';
const SERIAL = process.env.ADB_SERIAL || 'emulator-5554';
const EMAIL = process.env.QA_EMAIL || 'uat.nv0001@xe.vn';
const EMAIL_ALT = process.env.QA_EMAIL_ALT || 'uat.nv0011@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'xevn-uat-2026';
const LOCAL_BASE = process.env.QA_HRM_BASE_URL || 'http://10.0.2.2:28001';
const HOST_API = { host: '127.0.0.1', port: 28001 };
const APK =
  process.env.QA_APK ||
  'apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk';
/** Must ≠ R7 APK-05 and R6 */
const FORBIDDEN_SHA_PREFIXES = [
  '01456E71',
  'C415E592',
  'E51C977C',
  '8CE49FF2',
  'EB65FD6F',
];
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl';
const LOG_JSON = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl-device.json';

mkdirSync(OUT, { recursive: true });

const log = [];
const cases = [];
const note = (msg, extra = {}) => {
  const row = { t: new Date().toISOString(), msg, ...extra };
  log.push(row);
  console.log(JSON.stringify(row));
};
const record = (id, verdict, evidence, detail = '') => {
  cases.push({ id, verdict, evidence, detail });
  note('case', { id, verdict, evidence, detail });
};

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function adbSh(...args) {
  const r = spawnSync(adb, ['-s', SERIAL, ...args], {
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 40e6,
  });
  if (r.status !== 0 && !args.includes('logcat')) {
    throw new Error(`adb ${args.join(' ')} => ${r.status} ${r.stderr || r.stdout || ''}`);
  }
  return (r.stdout || '').trim();
}

async function dump(name) {
  for (let i = 0; i < 6; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-w4r8.xml');
      await sleep(600);
      sh(`"${adb}" -s ${SERIAL} pull /sdcard/qa-w4r8.xml ${OUT}/${name}.xml`);
      const shot = spawnSync(adb, ['-s', SERIAL, 'exec-out', 'screencap', '-p'], {
        encoding: 'buffer',
        maxBuffer: 25e6,
      });
      if (shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch {
      await sleep(2000);
    }
  }
  throw new Error(`dump failed: ${name}`);
}

function hasTestId(xml, id) {
  return (
    xml.includes(`resource-id="${id}"`) ||
    xml.includes(`resource-id="${PKG}:id/${id}"`) ||
    xml.includes(`content-desc="${id}"`)
  );
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
}

function homeReached(xml) {
  return (
    hasTestId(xml, 'home-top-bar-brand-accent') ||
    texts(xml).some((t) => /Trang chủ|Chào buổi|Việc cần làm|Đồng nghiệp|Xin chào|Đi làm/i.test(t))
  );
}

function findBounds(xml, pred) {
  return findNodeBounds(xml, (n) => pred(n));
}

function tap(hit) {
  if (!hit) return false;
  adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
  return true;
}

/** Extract focused + bounds for login-dev-base-url from raw dump chunk. */
function inspectDevBaseUrl(xml) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const className = (chunk.match(/class="([^"]*)"/) || [])[1] || '';
    if (className !== 'android.widget.EditText') continue;
    if (!(rid === 'login-dev-base-url' || rid.endsWith('/login-dev-base-url') || rid.endsWith(':id/login-dev-base-url'))) {
      continue;
    }
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const focused = (chunk.match(/focused="([^"]*)"/) || [])[1] === 'true';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const x1 = +b[1];
    const y1 = +b[2];
    const x2 = +b[3];
    const y2 = +b[4];
    const x = Math.floor((x1 + x2) / 2);
    const y = Math.floor((y1 + y2) / 2);
    return {
      text,
      focused,
      bounds: `[${x1},${y1}][${x2},${y2}]`,
      x,
      y,
      midBand: isAdbMidBandHit({ x, y }),
    };
  }
  return null;
}

async function dismissPerms(xml) {
  const allow =
    findBounds(
      xml,
      (n) =>
        n.rid.includes('permission_allow_button') ||
        n.text === 'Allow' ||
        n.text === 'Cho phép' ||
        /While using the app|Chỉ khi dùng|Allow/i.test(n.text),
    ) || findBounds(xml, (n) => /POST_NOTIFICATIONS|notification/i.test(n.text + n.desc));
  if (allow) {
    tap(allow);
    await sleep(1200);
    return true;
  }
  if (/permissioncontroller|com\.android\.permissioncontroller/i.test(xml)) {
    const btn =
      findBounds(xml, (n) => /Allow|Cho phép|While using/i.test(n.text)) ||
      findBounds(xml, (n) => n.rid.includes('permission_allow'));
    if (btn) {
      tap(btn);
      await sleep(1200);
      return true;
    }
  }
  return false;
}

async function coldStart() {
  adbSh('shell', 'pm', 'clear', PKG);
  await sleep(900);
  for (const perm of [
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
  ]) {
    try {
      adbSh('shell', 'pm', 'grant', PKG, perm);
    } catch {
      /* ignore */
    }
  }
  adbSh('shell', 'am', 'force-stop', PKG);
  await sleep(400);
  adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
  await sleep(10000);
}

/**
 * Matrix 1: expand Đăng nhập dev → mid-band URL → fillDevBaseUrlField
 */
async function expandAndFillBaseUrl(tag) {
  let xml = await dump(`${tag}-cold`);
  await fillDevBaseUrlField(adbSh, xml, {
    baseUrl: LOCAL_BASE,
    onAfterExpand: async () => {
      await sleep(1200);
      return dump(`${tag}-dev-expanded`);
    },
  });
  await sleep(500);
  // Commit field (Enter + blur) so React state syncs
  adbSh('shell', 'input', 'keyevent', '66');
  await sleep(400);
  adbSh('shell', 'input', 'tap', '540', '180');
  await sleep(600);
  xml = await dump(`${tag}-base-url-filled`);
  const info = inspectDevBaseUrl(xml);
  const node = findDevBaseUrlBounds(xml);
  const fieldText = info?.text || node?.text || '';
  const uiShowsLocal =
    fieldText.includes('10.0.2.2') ||
    fieldText.includes('28001') ||
    texts(xml).some((t) => t.includes('10.0.2.2:28001'));
  writeFileSync(
    `${OUT}/${tag}-url-node.json`,
    JSON.stringify({ info, node, uiShowsLocal, LOCAL_BASE }, null, 2),
  );
  return {
    xml,
    ok: uiShowsLocal,
    midBand: !!info?.midBand,
    focused: !!info?.focused,
    y: info?.y ?? node?.y ?? -1,
    bounds: info?.bounds || '',
    fieldText,
    reason: !info
      ? 'login-dev-base-url missing after expand'
      : !info.midBand
        ? `URL not mid-band y=${info.y} (R7 was ~2064)`
        : uiShowsLocal
          ? 'UI shows local base after fillDevBaseUrlField'
          : 'UI field text not local after fill',
  };
}

function parseHostFromLogcat(logcat) {
  const lines = logcat.split(/\r?\n/).filter((l) => /\[HRM-MOB\]/i.test(l));
  const hosts = [];
  for (const line of lines) {
    const m = line.match(/https?:\/\/[^\s/'"]+/i);
    if (m) hosts.push(m[0]);
  }
  return { lines: lines.slice(0, 40), hosts };
}

async function loginProductionFromCurrent(xml, email, tag) {
  collapseDevLoginPanelIfOpen(adbSh, xml);
  await sleep(800);
  xml = await dump(`${tag}-collapsed`);

  await fillProductionLoginFields(adbSh, xml, {
    email,
    password: PASSWORD,
    onAfterCollapse: async () => dump(`${tag}-after-collapse`),
  });
  await sleep(600);
  xml = await dump(`${tag}-login-filled`);

  const emailNode = findLoginFieldBounds(xml, 'login-email');
  const emailOk =
    loginEmailLooksFilled(xml, email) &&
    emailNode?.text &&
    emailNode.text !== 'name@company.com' &&
    emailNode.text.includes(email.split('@')[0]);

  if (!emailOk) {
    return {
      emailOk: false,
      loginHome: false,
      emailText: emailNode?.text || '',
      hostOk: false,
      pilotLeak: false,
      hosts: [],
      hrmMobLines: [],
      val001: false,
      xml,
    };
  }

  const btn =
    findBounds(xml, (n) => n.rid.includes('login-submit')) ||
    findBounds(xml, (n) => /^Đăng nhập$/i.test(n.text));
  if (!btn) {
    return {
      emailOk: true,
      loginHome: false,
      emailText: emailNode?.text || '',
      hostOk: false,
      pilotLeak: false,
      hosts: [],
      hrmMobLines: [],
      val001: false,
      xml,
      submitMissing: true,
    };
  }

  adbSh('logcat', '-c');
  tap(btn);
  await sleep(14000);
  xml = await dump(`${tag}-post-login`);
  for (let i = 0; i < 8; i++) {
    if (await dismissPerms(xml)) {
      xml = await dump(`${tag}-post-login-perm-${i}`);
      continue;
    }
    if (homeReached(xml)) break;
    await sleep(1500);
    xml = await dump(`${tag}-post-login-wait-${i}`);
  }
  const postLog = adbSh('logcat', '-d', '-t', '500');
  writeFileSync(`${OUT}/${tag}-login-logcat.txt`, postLog);
  const { hosts, lines } = parseHostFromLogcat(postLog);
  const hostOk = hosts.some((h) => h.includes('10.0.2.2:28001'));
  const pilotLeak = hosts.some((h) => h.includes('14.225.217.232') || /:3001\b/.test(h));
  const val001 = /HRM-VAL-001/i.test(postLog) || texts(xml).some((t) => /HRM-VAL-001/i.test(t));
  const loginHome = homeReached(xml) && !val001;

  return {
    emailOk: true,
    loginHome,
    emailText: emailNode?.text || '',
    hosts,
    hrmMobLines: lines,
    hostOk,
    pilotLeak,
    val001,
    xml,
  };
}

/** Matrix 1–3: base URL override + production login */
async function runBaseUrlLogin(email) {
  await coldStart();
  const tag = `base-${email.split('@')[0]}`;
  const baseRes = await expandAndFillBaseUrl(tag);
  note('base_filled', { email, ...baseRes });
  const login = await loginProductionFromCurrent(baseRes.xml, email, tag);
  return { baseRes, ...login, email };
}

/** Matrix 4: C-LOGIN-ADB regression — cold start, no base-url override, FE adb only */
async function runLoginAdbRegression(email) {
  await coldStart();
  const tag = `reg-${email.split('@')[0]}`;
  let xml = await dump(`${tag}-cold`);
  // Ensure collapsed (cold start showDev=false)
  collapseDevLoginPanelIfOpen(adbSh, xml);
  await sleep(600);
  xml = await dump(`${tag}-ready`);
  await fillProductionLoginFields(adbSh, xml, {
    email,
    password: PASSWORD,
    onAfterCollapse: async () => dump(`${tag}-after-collapse`),
  });
  await sleep(600);
  xml = await dump(`${tag}-login-filled`);
  const emailNode = findLoginFieldBounds(xml, 'login-email');
  const emailOk =
    loginEmailLooksFilled(xml, email) &&
    !!emailNode?.text &&
    emailNode.text !== 'name@company.com' &&
    emailNode.text.includes(email.split('@')[0]);
  const btn =
    findBounds(xml, (n) => n.rid.includes('login-submit')) ||
    findBounds(xml, (n) => /^Đăng nhập$/i.test(n.text));
  if (!emailOk || !btn) {
    return { emailOk, loginHome: false, emailText: emailNode?.text || '', val001: false };
  }
  adbSh('logcat', '-c');
  tap(btn);
  await sleep(14000);
  xml = await dump(`${tag}-post-login`);
  for (let i = 0; i < 6; i++) {
    if (await dismissPerms(xml)) {
      xml = await dump(`${tag}-perm-${i}`);
      continue;
    }
    if (homeReached(xml)) break;
    await sleep(1500);
    xml = await dump(`${tag}-wait-${i}`);
  }
  const postLog = adbSh('logcat', '-d', '-t', '300');
  writeFileSync(`${OUT}/${tag}-login-logcat.txt`, postLog);
  const val001 = /HRM-VAL-001/i.test(postLog) || texts(xml).some((t) => /HRM-VAL-001/i.test(t));
  return {
    emailOk: true,
    loginHome: homeReached(xml) && !val001,
    emailText: emailNode?.text || '',
    val001,
  };
}

async function tryGpsCheckIn(tag) {
  let xml = await dump(`${tag}-home`);
  const fab =
    findBounds(xml, (n) => n.rid.includes('home-fab') || n.rid.includes('fab-check')) ||
    findBounds(xml, (n) => /Chấm công|Đi làm|Check.?in/i.test(n.text + n.desc));
  if (fab) {
    tap(fab);
    await sleep(2500);
    xml = await dump(`${tag}-fab`);
  }
  const checkInNav = findBounds(
    xml,
    (n) => n.rid.includes('check-in') || /Chấm công GPS|GPS|Check-in/i.test(n.text),
  );
  if (checkInNav) {
    tap(checkInNav);
    await sleep(2500);
    xml = await dump(`${tag}-checkin-screen`);
  }
  const gps =
    findBounds(xml, (n) => n.rid.includes('channel-gps') || /^GPS$/i.test(n.text)) ||
    findBounds(xml, (n) => /GPS/i.test(n.text) && /channel|kênh/i.test(n.desc + n.text));
  if (gps) {
    tap(gps);
    await sleep(1000);
    xml = await dump(`${tag}-gps`);
  }
  const submit = findBounds(xml, (n) => n.rid.includes('check-in-submit'));
  if (!submit) {
    return { attempted: true, submitted: false, reason: 'check-in-submit missing', logcat: '' };
  }
  adbSh('logcat', '-c');
  tap(submit);
  await sleep(10000);
  xml = await dump(`${tag}-after-submit`);
  const logcat = adbSh('logcat', '-d', '-t', '400');
  writeFileSync(`${OUT}/${tag}-submit-logcat.txt`, logcat);
  const ok201 =
    /attendance\/records[^\n]*http=201|attendance\/records POST ok=true[^\n]*http=201|HRM-ATT-201/i.test(
      logcat,
    ) || /\[HRM-MOB\][^\n]*attendance\/records[^\n]*http=201/i.test(logcat);
  const dup =
    /HRM-ATT-001|uq_attendance_company_employee_date/i.test(logcat) ||
    texts(xml).some((t) => /HRM-ATT-001|duplicate/i.test(t));
  const localHost = /10\.0\.2\.2:28001/.test(logcat);
  const pilotHost = /14\.225\.217\.232|:3001\b/.test(logcat);
  return {
    attempted: true,
    submitted: true,
    ok201,
    dup,
    localHost,
    pilotHost,
    logcat,
    alertTexts: texts(xml).filter((t) => /HRM-|ATT-|error|lỗi/i.test(t)).slice(0, 8),
  };
}

async function main() {
  if (!existsSync(APK)) throw new Error(`APK missing: ${APK}`);
  const apkBuf = readFileSync(APK);
  const sha = createHash('sha256').update(apkBuf).digest('hex').toUpperCase();
  const forbidden = FORBIDDEN_SHA_PREFIXES.some((p) => sha.startsWith(p));
  note('start', {
    work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R8-BASEURL',
    serial: SERIAL,
    EMAIL,
    LOCAL_BASE,
    apk_sha: sha,
    forbidden,
  });
  if (forbidden) {
    writeFileSync(
      LOG_JSON,
      JSON.stringify({ fatal: 'forbidden APK SHA (reuse of old build)', sha }, null, 2),
    );
    process.exit(2);
  }
  record('APK-06-sha', 'PASS', 'header', sha);

  let l0 = 0;
  try {
    const r = await fetch(`http://${HOST_API.host}:${HOST_API.port}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    l0 = r.status;
  } catch (e) {
    note('l0_fail', { err: String(e) });
  }
  record('L0-hrm-api-login', l0 === 201 || l0 === 200 ? 'PASS' : 'FAIL', 'host', `http=${l0}`);

  adbSh('reverse', '--remove-all');
  adbSh('reverse', 'tcp:28001', 'tcp:28001');
  adbSh('install', '-r', '-g', APK);
  adbSh('shell', 'settings', 'put', 'global', 'window_animation_scale', '0');
  adbSh('shell', 'settings', 'put', 'global', 'transition_animation_scale', '0');
  adbSh('shell', 'settings', 'put', 'global', 'animator_duration_scale', '0');
  adbSh('shell', 'settings', 'put', 'secure', 'location_mode', '3');
  try {
    adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
  } catch {
    /* ignore */
  }

  const primary = await runBaseUrlLogin(EMAIL);
  record(
    'C-LOGIN-ADB-base-url-mid-band',
    primary.baseRes.midBand ? 'PASS' : 'FAIL',
    `${OUT.replace(/^docs\/qa\/evidence\/screens\//, '')}/base-${EMAIL.split('@')[0]}-dev-expanded.png`,
    `y=${primary.baseRes.y} bounds=${primary.baseRes.bounds} midBand=${primary.baseRes.midBand}`,
  );
  record(
    'C-LOGIN-ADB-base-url-field-ui',
    primary.baseRes.ok ? 'PASS' : 'FAIL',
    `base-${EMAIL.split('@')[0]}-base-url-filled.png`,
    `text=${primary.baseRes.fieldText || ''} · ${primary.baseRes.reason}`,
  );
  record(
    'C-LOGIN-ADB-email-not-placeholder',
    primary.emailOk ? 'PASS' : 'FAIL',
    `base-${EMAIL.split('@')[0]}-login-filled.png`,
    `emailFieldText=${primary.emailText}`,
  );
  record(
    'C-LOGIN-ADB-no-val001',
    primary.val001 ? 'FAIL' : 'PASS',
    `base-${EMAIL.split('@')[0]}-post-login.png`,
    primary.val001 ? 'HRM-VAL-001' : 'no VAL-001',
  );
  record(
    'J-MOB-01-login-home',
    primary.loginHome ? 'PASS' : 'FAIL',
    `base-${EMAIL.split('@')[0]}-post-login.png`,
    `home=${primary.loginHome} FE adb only`,
  );

  const baseUrlHostPass = primary.hostOk && !primary.pilotLeak;
  record(
    'C-LOGIN-ADB-base-url-10.0.2.2',
    baseUrlHostPass ? 'PASS' : 'FAIL',
    `base-${EMAIL.split('@')[0]}-login-logcat.txt`,
    `hosts=${JSON.stringify(primary.hosts || [])} hostOk=${primary.hostOk} pilotLeak=${primary.pilotLeak}`,
  );

  // Matrix 4 — separate cold start C-LOGIN-ADB (no base-url override)
  const reg = await runLoginAdbRegression(EMAIL);
  record(
    'C-LOGIN-ADB-email-regression',
    reg.emailOk ? 'PASS' : 'FAIL',
    `reg-${EMAIL.split('@')[0]}-login-filled.png`,
    `emailFieldText=${reg.emailText}`,
  );
  record(
    'C-LOGIN-ADB-close',
    reg.loginHome ? 'PASS' : 'FAIL',
    `reg-${EMAIL.split('@')[0]}-post-login.png`,
    reg.loginHome ? 'FE adb path home — not qa-login' : 'login failed',
  );
  record(
    'J-MOB-01-login-home-regression',
    reg.loginHome ? 'PASS' : 'FAIL',
    `reg-${EMAIL.split('@')[0]}-post-login.png`,
    `home=${reg.loginHome}`,
  );
  record('qa-login-sole-path', 'PASS', 'policy', 'qa-login not used');

  let mob04Obs = null;
  if (primary.loginHome && baseUrlHostPass) {
    // Re-login with base URL for optional GPS OBS (reg session may be on pilot)
    const obsLogin = await runBaseUrlLogin(EMAIL);
    note('obs_relogin', {
      home: obsLogin.loginHome,
      hostOk: obsLogin.hostOk,
      pilotLeak: obsLogin.pilotLeak,
    });
    if (obsLogin.loginHome && obsLogin.hostOk && !obsLogin.pilotLeak) {
      mob04Obs = await tryGpsCheckIn('mob04-nv0001');
      note('mob04_primary', {
        ok201: mob04Obs.ok201,
        dup: mob04Obs.dup,
        localHost: mob04Obs.localHost,
        pilotHost: mob04Obs.pilotHost,
        alertTexts: mob04Obs.alertTexts,
      });
      if (mob04Obs.dup && !mob04Obs.ok201) {
        note('mob04_retry_alt', { email: EMAIL_ALT });
        const alt = await runBaseUrlLogin(EMAIL_ALT);
        if (alt.loginHome && alt.hostOk && !alt.pilotLeak) {
          mob04Obs = await tryGpsCheckIn('mob04-alt');
          mob04Obs.email = EMAIL_ALT;
        }
      }
      if (mob04Obs.ok201 && mob04Obs.localHost && !mob04Obs.pilotHost) {
        record(
          'C-MOB-04-local-host-OBS',
          'PASS_OBS',
          'mob04-*-submit-logcat.txt',
          'POST 201 on 10.0.2.2:28001 — OBS only; C-MOB-04 claim not reopened',
        );
      } else if (mob04Obs.dup) {
        record(
          'C-MOB-04-local-host-OBS',
          'OBS',
          'mob04-*-submit-logcat.txt',
          'ATT-001 duplicate or no 201 — C-MOB-04 not reopened',
        );
      } else {
        record(
          'C-MOB-04-local-host-OBS',
          'OBS',
          'mob04-*-submit-logcat.txt',
          `attempted=${mob04Obs.attempted} ok201=${mob04Obs.ok201} local=${mob04Obs.localHost}`,
        );
      }
    } else {
      record('C-MOB-04-local-host-OBS', 'SKIP', 'n/a', 'OBS re-login failed');
    }
  } else {
    record('C-MOB-04-local-host-OBS', 'SKIP', 'n/a', 'login or base-url host assert failed');
  }

  const loginPass =
    cases.find((c) => c.id === 'C-LOGIN-ADB-close')?.verdict === 'PASS' &&
    (cases.find((c) => c.id === 'J-MOB-01-login-home')?.verdict === 'PASS' ||
      cases.find((c) => c.id === 'J-MOB-01-login-home-regression')?.verdict === 'PASS');
  const basePass = cases.find((c) => c.id === 'C-LOGIN-ADB-base-url-10.0.2.2')?.verdict === 'PASS';
  const midPass = cases.find((c) => c.id === 'C-LOGIN-ADB-base-url-mid-band')?.verdict === 'PASS';
  const fieldPass = cases.find((c) => c.id === 'C-LOGIN-ADB-base-url-field-ui')?.verdict === 'PASS';

  let ack = 'FAIL_TO_PM';
  if (loginPass && basePass && midPass && fieldPass) {
    const obs = cases.find((c) => c.id === 'C-MOB-04-local-host-OBS');
    ack = obs && (obs.verdict === 'OBS' || obs.verdict === 'PASS_OBS') ? 'PASS_WITH_OBS' : 'PASS_TO_PM';
  }

  const out = {
    work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R8-BASEURL',
    apk_sha256: sha,
    apk_label: 'APK-06',
    LOCAL_BASE,
    EMAIL,
    l0,
    cases,
    primary: {
      emailOk: primary.emailOk,
      loginHome: primary.loginHome,
      hostOk: primary.hostOk,
      pilotLeak: primary.pilotLeak,
      hosts: primary.hosts,
      baseField: primary.baseRes,
      hrmMobSample: (primary.hrmMobLines || []).slice(0, 12),
    },
    regression: reg,
    mob04Obs: mob04Obs
      ? {
          ok201: mob04Obs.ok201,
          dup: mob04Obs.dup,
          localHost: mob04Obs.localHost,
          pilotHost: mob04Obs.pilotHost,
          email: mob04Obs.email || EMAIL,
          alertTexts: mob04Obs.alertTexts,
        }
      : null,
    ack_status: ack,
    honesty: {
      face_live: false,
      remaster_program_done: false,
      seed: 'none',
      qa_login_sole: false,
      c_mob_04_reopen_claim: false,
    },
    log,
  };
  writeFileSync(LOG_JSON, JSON.stringify(out, null, 2));
  note('done', { ack, loginPass, basePass, midPass, fieldPass });
  process.exit(ack.startsWith('PASS') ? 0 : 1);
}

main().catch((e) => {
  note('fatal', { err: String(e?.stack || e) });
  writeFileSync(
    LOG_JSON,
    JSON.stringify({ fatal: String(e?.stack || e), cases, log }, null, 2),
  );
  process.exit(1);
});
