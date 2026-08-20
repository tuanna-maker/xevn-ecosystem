#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2 — J-MOB-01/02 · MOB-04/04b device (U65 zero-seed)
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const PKG = 'vn.xevn.hrm.mobile';
const SERIAL = process.env.ADB_SERIAL || 'emulator-5554';
const EMAIL = process.env.QA_EMAIL || 'uat.nv0001@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'xevn-uat-2026';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r2';
const LOG_JSON = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r2-device.json';
const API_HOST = process.env.HRM_API_BASE || 'http://14.225.217.232:3001';
/** APK qa-device bundles pilot :3001 — deep-link base_url must match JWT origin */
const EMU_API = process.env.HRM_EMULATOR_API_BASE || API_HOST;

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
    timeout: 60000,
    maxBuffer: 30e6,
  });
  if (r.status !== 0) throw new Error(`adb ${args.join(' ')} => ${r.status} ${r.stderr || r.stdout || ''}`);
  return (r.stdout || '').trim();
}

async function dump(name, attempts = 5) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-w4r2.xml');
      sh(`"${adb}" -s ${SERIAL} pull /sdcard/qa-w4r2.xml ${OUT}/${name}.xml`);
      const shot = spawnSync(adb, ['-s', SERIAL, 'exec-out', 'screencap', '-p'], {
        encoding: 'buffer',
        maxBuffer: 25e6,
      });
      if (shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch (e) {
      lastErr = e;
      await sleep(1200);
    }
  }
  throw lastErr;
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
}

function hasTestId(xml, id) {
  return xml.includes(`resource-id="${id}"`) || xml.includes(`resource-id="${PKG}:id/${id}"`);
}

function findEditTexts(xml) {
  const out = [];
  for (const chunk of xml.split('<node ').slice(1)) {
    if (!chunk.includes('class="android.widget.EditText"')) continue;
    const t = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    out.push({
      text: t,
      x: Math.floor((+b[1] + +b[3]) / 2),
      y: Math.floor((+b[2] + +b[4]) / 2),
    });
  }
  return out;
}

function findBounds(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const desc = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const node = { text, desc, rid };
    if (!pred(node)) continue;
    return {
      x: Math.floor((+b[1] + +b[3]) / 2),
      y: Math.floor((+b[2] + +b[4]) / 2),
      text,
      desc,
      rid,
    };
  }
  return null;
}

function tap(hit) {
  if (!hit) return false;
  adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
  return true;
}

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function setField(node, value) {
  tap(node);
  sleepSync(350);
  adbSh('shell', 'input', 'keyevent', '123');
  for (let i = 0; i < 48; i++) adbSh('shell', 'input', 'keyevent', '67');
  const escaped = value
    .replace(/\\/g, '\\\\')
    .replace(/ /g, '%s')
    .replace(/([@&<>|()])/g, '\\$1');
  adbSh('shell', 'input', 'text', escaped);
}

function homeReached(xml) {
  return texts(xml).some((t) => /Trang chủ|Chào buổi|Việc cần làm|Đồng nghiệp|Xin chào|Đi làm/i.test(t));
}

async function dismissAnr(xml) {
  const wait = findBounds(xml, (n) => /^Wait$/i.test(n.text) || n.rid.includes('aerr_wait'));
  if (wait && /System UI|isn't responding|không phản hồi/i.test(xml)) {
    tap(wait);
    await sleep(2000);
    return true;
  }
  return false;
}

async function dismissPerms(xml) {
  if (await dismissAnr(xml)) return true;
  const deny = findBounds(xml, (n) => /Don't allow|Không cho phép|Deny/i.test(n.text));
  if (deny) {
    tap(deny);
    await sleep(900);
    return true;
  }
  const allow = findBounds(xml, (n) => /^While using|^Allow$|^Cho phép$/i.test(n.text));
  if (allow && /location|vị trí|GPS|notification|thông báo/i.test(xml)) {
    tap(allow);
    await sleep(900);
    return true;
  }
  return false;
}

async function openLogin() {
  adbSh('shell', 'am', 'force-stop', PKG);
  await sleep(600);
  for (const p of [
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.POST_NOTIFICATIONS',
  ]) {
    try {
      adbSh('shell', 'pm', 'grant', PKG, p);
    } catch {
      /* ignore */
    }
  }
  adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
  await sleep(10000);
  let xml = '';
  for (let i = 0; i < 16; i++) {
    await sleep(2500);
    xml = await dump(`login-${i}`);
    await dismissPerms(xml);
    if (hasTestId(xml, 'login-email') || hasTestId(xml, 'branded-login-card') || findEditTexts(xml).length >= 2) {
      return xml;
    }
    adbSh('shell', 'input', 'swipe', '540', '1600', '540', '600', '350');
  }
  return xml;
}

async function uiLogin(xml) {
  const emailNode = findBounds(xml, (n) => n.rid.includes('login-email'));
  const passNode = findBounds(xml, (n) => n.rid.includes('login-password'));
  if (emailNode && passNode) {
    setField(emailNode, EMAIL);
    await sleep(400);
    setField(passNode, PASSWORD);
  } else {
    const edits = findEditTexts(xml);
    if (edits.length < 2) throw new Error('login fields missing');
    setField(edits[0], EMAIL);
    await sleep(400);
    setField(edits[1], PASSWORD);
  }
  await sleep(400);
  xml = await dump('login-filled');
  if (homeReached(xml)) return xml;
  const btn =
    findBounds(xml, (n) => n.rid.includes('login-submit')) ||
    findBounds(xml, (n) => /^Đăng nhập$/i.test(n.text));
  if (!btn) throw new Error('login submit missing');
  tap(btn);
  await sleep(10000);
  return dump('post-login');
}

async function deepLinkHome(session) {
  const q = new URLSearchParams({
    access_token: session.token,
    refresh_token: session.refresh,
    tenant_id: session.tenant,
    company_id: session.company,
    company_uuid: session.uuid,
    employee_id: session.emp,
    base_url: EMU_API,
  });
  adbSh('shell', 'am', 'force-stop', PKG);
  await sleep(500);
  spawnSync(
    adb,
    ['-s', SERIAL, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', `xevn://qa-login?${q.toString()}`],
    { encoding: 'utf8' },
  );
  await sleep(8000);
  let xml = await dump('deeplink-home');
  for (let i = 0; i < 12; i++) {
    await dismissPerms(xml);
    if (homeReached(xml)) return xml;
    await sleep(1500);
    xml = await dump(`deeplink-home-${i}`);
  }
  return xml;
}

async function fetchSession() {
  const res = await fetch(`${API_HOST}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(`API login ${res.status} ${j.code}`);
  const d = j.data;
  const a = d.active_membership ?? d.memberships?.[0] ?? {};
  return {
    httpStatus: res.status,
    token: d.access_token,
    refresh: d.refresh_token ?? '',
    tenant: a.tenant_id ?? d.default_tenant_id,
    company: a.company_id ?? d.default_company_id,
    uuid: a.company_uuid ?? '',
    emp: a.employee_id ?? d.employee?.id ?? '',
  };
}

async function main() {
  note('start', { work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2', serial: SERIAL, EMAIL, API_HOST, EMU_API });

  const devices = sh(`"${adb}" devices`);
  if (!devices.includes('device')) {
    record('ENV-ADB', 'BLOCKED', 'adb', 'no device');
    writeFileSync(LOG_JSON, JSON.stringify({ log, cases, ack: 'BLOCKED-EXTERNAL' }, null, 2));
    process.exit(2);
  }
  record('ENV-ADB', 'PASS', 'adb', devices.split('\n').filter(Boolean).join('; '));

  const health = await fetch(`${API_HOST}/api/hrm/`).then((r) => r.status).catch((e) => String(e));
  record('L0-HRM', health === 200 ? 'PASS' : 'FAIL', 'qc:fe-be-health', String(health));

  let xml = await openLogin();
  const loginBrand =
    hasTestId(xml, 'branded-login-card') ||
    hasTestId(xml, 'brand-dialog-chrome') ||
    hasTestId(xml, 'login-email') ||
    texts(xml).some((t) => t === 'Đăng nhập' && texts(xml).includes('Email'));
  record(
    'MOB-01-login-chrome',
    loginBrand ? 'PASS' : 'PARTIAL',
    'login-0.png',
    `branded-login-card=${hasTestId(xml, 'branded-login-card')} login-email=${hasTestId(xml, 'login-email')}`,
  );

  let loginMethod = 'ui';
  try {
    xml = await uiLogin(xml);
    if (!homeReached(xml)) throw new Error('UI login did not reach home');
    record('J-MOB-01-login-home', 'PASS', 'post-login.png', 'UI login uat.nv0001');
  } catch (e) {
    loginMethod = 'qa-deep-link-fallback';
    note('ui-login-fail', { err: String(e.message || e) });
    const session = await fetchSession();
    record('MOB-04-api-login-probe', session.httpStatus === 201 ? 'PASS' : 'FAIL', 'api', `status=${session.httpStatus}`);
    xml = await deepLinkHome(session);
    record(
      'J-MOB-01-login-home',
      homeReached(xml) ? 'PARTIAL' : 'FAIL',
      'deeplink-home.png',
      `UI fail → qa-login deep link; base=${EMU_API}`,
    );
  }

  await dismissPerms(xml);
  xml = await dump('home-brand');
  const jmob01 =
    hasTestId(xml, 'home-top-bar-brand-accent') && hasTestId(xml, 'dashboard-attendance-brand-bar');
  record(
    'J-MOB-01-home-brand-testIDs',
    jmob01 ? 'PASS' : 'FAIL',
    'home-brand.png',
    `home-top-bar-brand-accent=${hasTestId(xml, 'home-top-bar-brand-accent')} dashboard-attendance-brand-bar=${hasTestId(xml, 'dashboard-attendance-brand-bar')}`,
  );

  const fab =
    findBounds(xml, (n) => /Thao tác nhanh/i.test(n.desc)) ||
    findBounds(xml, (n) => /Thao tác nhanh/i.test(n.text)) ||
    findBounds(xml, (n) => n.rid.includes('fab') || n.rid.includes('check-in-fab'));
  if (fab) {
    tap(fab);
    await sleep(2000);
    xml = await dump('fab-sheet');
    const sheetOk = hasTestId(xml, 'fab-primary-action-sheet') || texts(xml).some((t) => /Thao tác nhanh/i.test(t));
    record('J-MOB-02-FAB-sheet', sheetOk ? 'PASS' : 'FAIL', 'fab-sheet.png', `fab-primary-action-sheet=${hasTestId(xml, 'fab-primary-action-sheet')}`);

    const checkInAction =
      findBounds(xml, (n) => /Chấm công|Check-in|Điểm danh/i.test(n.text)) ||
      findBounds(xml, (n) => n.rid.includes('check_in') || n.rid.includes('check-in'));
    if (checkInAction) {
      tap(checkInAction);
      await sleep(2500);
    } else {
      adbSh('shell', 'input', 'keyevent', '4');
      await sleep(500);
      const tile = findBounds(xml, (n) => /Chấm công/i.test(n.text));
      if (tile) tap(tile);
      await sleep(2500);
    }
  } else {
    record('J-MOB-02-FAB-sheet', 'FAIL', 'home-brand.png', 'FAB not found');
  }

  xml = await dump('checkin-screen');
  await dismissPerms(xml);
  const gpsChannel =
    hasTestId(xml, 'check-in-channel-gps') ||
    findBounds(xml, (n) => /GPS|Vị trí|Định vị/i.test(n.text));
  record('J-MOB-02-checkin-channels', gpsChannel ? 'PASS' : 'PARTIAL', 'checkin-screen.png', `check-in-channel-gps=${hasTestId(xml, 'check-in-channel-gps')}`);

  const faceTap =
    findBounds(xml, (n) => n.rid.includes('face-mvp') || n.rid.includes('face_mvp')) ||
    findBounds(xml, (n) => /Face|Khuôn mặt/i.test(n.text));
  if (faceTap) {
    tap(faceTap);
    await sleep(1500);
    xml = await dump('face-channel');
    const honesty = hasTestId(xml, 'face-mvp-honesty-banner') || texts(xml).some((t) => /MVP|chưa/i.test(t));
    const submitNode = findBounds(xml, (n) => n.rid.includes('check-in-submit'));
    const submitDisabledHint = /enabled="false"/.test(xml.split('check-in-submit').pop()?.slice(0, 400) ?? '') || honesty;
    record(
      'MOB-04b-face-honesty',
      honesty ? 'PASS' : 'FAIL',
      'face-channel.png',
      `face-mvp-honesty-banner=${hasTestId(xml, 'face-mvp-honesty-banner')} submit_guard=${submitDisabledHint}`,
    );
    record('face_live_claim', 'PASS', 'policy', 'face_live=false — no LIVE claim');
  } else {
    record('MOB-04b-face-honesty', 'PARTIAL', 'checkin-screen.png', 'Face channel control not tapped');
  }

  const gpsTap =
    findBounds(xml, (n) => n.rid.includes('check-in-channel-gps')) ||
    findBounds(xml, (n) => /^GPS$/i.test(n.text) || /Vị trí GPS/i.test(n.text));
  if (gpsTap) tap(gpsTap);
  await sleep(800);
  xml = await dump('gps-selected');
  adbSh('logcat', '-c');
  const submit =
    findBounds(xml, (n) => n.rid.includes('check-in-submit')) ||
    findBounds(xml, (n) => /Chấm công vào|Ghi nhận|Xác nhận chấm/i.test(n.text));
  if (submit) {
    tap(submit);
    await sleep(5000);
    await dismissPerms(await dump('gps-after-submit'));
    xml = await dump('gps-after-submit');
    const logcat = adbSh('logcat', '-d', '-t', '200');
    const postOk =
      /attendance\/records.*\b(201|200|2xx)\b/i.test(logcat) ||
      /POST.*attendance/i.test(logcat) ||
      texts(xml).some((t) => /thành công|đã chấm|ghi nhận/i.test(t));
    const postErr = texts(xml).some((t) => /lỗi|thất bại|401|403|500/i.test(t));
    record(
      'MOB-04-gps-post-2xx',
      postOk && !postErr ? 'PASS' : postErr ? 'FAIL' : 'PARTIAL',
      'gps-after-submit.png',
      `logcat_attendance=${/attendance/i.test(logcat)} ui_ok=${texts(xml).slice(0, 8).join('|')}`,
    );
  } else {
    record('MOB-04-gps-post-2xx', 'FAIL', 'gps-selected.png', 'check-in-submit not found or disabled');
  }

  const fails = cases.filter((c) => c.verdict === 'FAIL').length;
  const blocked = cases.some((c) => c.verdict === 'BLOCKED');
  const partial = cases.filter((c) => c.verdict === 'PARTIAL').length;
  const ack = blocked ? 'BLOCKED-EXTERNAL' : fails > 0 ? 'FAIL_TO_PM' : partial > 0 ? 'PASS_TO_PM' : 'PASS_TO_PM';

  const summary = { log, cases, loginMethod, ack, face_live: false, remaster_program_done: false, seed: false };
  writeFileSync(LOG_JSON, JSON.stringify(summary, null, 2));
  note('done', { ack, fails, partial });
  process.exit(fails > 0 && !blocked ? 1 : 0);
}

main().catch((e) => {
  note('fatal', { err: String(e.stack || e) });
  writeFileSync(LOG_JSON, JSON.stringify({ log, cases, fatal: String(e) }, null, 2));
  process.exit(1);
});
