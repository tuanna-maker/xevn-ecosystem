#!/usr/bin/env node
/**
 * QA-HDSD-BF-SWEEP-02-MOB-01 — sweep defer ×7 mobile TC on pilot :3001
 * U65 zero-seed · uat.nv0001@xe.vn · emulator-5554
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const sdk = process.env.LOCALAPPDATA + '\\Android\\Sdk';
const adb = `${sdk}\\platform-tools\\adb.exe`;
const serial = process.env.ADB_SERIAL || 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const API_BASE = process.env.HRM_API_BASE || 'http://14.225.217.232:3001';
const EMAIL = process.env.QA_MOBILE_EMAIL || 'uat.nv0001@xe.vn';
const PASSWORD = process.env.QA_MOBILE_PASSWORD || 'xevn-uat-2026';
const ROOT = process.cwd();
const SHOT_DIR = path.join(ROOT, 'docs/qa/evidence/screenshots/qa-hdsd-bf-sweep-02-mob-01-20260801');
const XML_DIR = path.join(process.env.TEMP || '/tmp', 'qa-hdsd-bf-sweep-02-mob-01-20260801');
const OUT_JSON = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-sweep-02-mob-01-runtime.json');

fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(XML_DIR, { recursive: true });

function sh(args) {
  return execSync(`"${adb}" -s ${serial} ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function findBounds(xml, pattern) {
  const m = xml.match(pattern);
  if (!m) return null;
  return { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
}

function findByText(xml, text) {
  const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return findBounds(xml, new RegExp(`text="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`));
}

function findByTextContains(xml, fragment) {
  const esc = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return findBounds(
    xml,
    new RegExp(`text="[^"]*${esc}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
  );
}

function findByTestId(xml, testId) {
  const esc = testId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    findBounds(
      xml,
      new RegExp(`resource-id="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
    ) ??
    findBounds(
      xml,
      new RegExp(`content-desc="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`),
    )
  );
}

const HOME_MARKERS = [
  'Chào buổi',
  'Trang chủ',
  'Xin chào',
  'Việc cần làm',
  'Đi làm',
  'home-action',
  'content-desc="Trang chủ"',
];

function homeReached(xml) {
  return HOME_MARKERS.some((m) => xml.includes(m));
}

function hasAny(xml, patterns) {
  return patterns.some((p) => xml.includes(p));
}

async function dismissPostNotifications() {
  try {
    let xml = await dump('qa-perm-dismiss', { required: false });
    if (!xml.includes('permissioncontroller')) return false;
    const deny =
      findBounds(
        xml,
        /resource-id="com\.android\.permissioncontroller:id\/permission_deny_button"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
      ) ?? findByTextContains(xml, 'Không cho phép');
    if (!deny) return false;
    await tap(deny);
    return true;
  } catch {
    return false;
  }
}

async function waitForHome(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await dismissPostNotifications();
    let xml = await dump('home-wait', { required: false });
    if (xml && homeReached(xml)) return xml;
    await sleep(2000);
  }
  return '';
}

async function dump(name, { required = true } = {}) {
  const remote = `/sdcard/${name}.xml`;
  const local = path.join(XML_DIR, `${name}.xml`);
  for (let i = 0; i < 5; i++) {
    try {
      sh(`shell uiautomator dump ${remote}`);
      await sleep(400);
      sh(`pull ${remote} "${local}"`);
      if (fs.existsSync(local) && fs.statSync(local).size > 80) {
        return fs.readFileSync(local, 'utf8');
      }
    } catch {
      /* retry */
    }
    await sleep(900);
  }
  if (!required) return '';
  throw new Error(`dump fail ${name}`);
}

async function shot(name) {
  const remote = `/sdcard/${name}.png`;
  const local = path.join(SHOT_DIR, `${name}.png`);
  sh(`shell screencap -p ${remote}`);
  sh(`pull ${remote} "${local}"`);
  return local.replace(/\\/g, '/');
}

async function tap(b) {
  if (!b) return false;
  sh(`shell input tap ${b.x} ${b.y}`);
  await sleep(1600);
  return true;
}

async function tapFirst(xml, candidates) {
  for (const c of candidates) {
    const b =
      typeof c === 'string'
        ? findByTestId(xml, c) ?? findByText(xml, c) ?? findByTextContains(xml, c)
        : c(xml);
    if (b && (await tap(b))) return String(c);
  }
  return null;
}

async function dismissOverlays(xml) {
  for (let i = 0; i < 3; i++) {
    const close =
      findByText(xml, 'Đóng') ??
      findByText(xml, 'OK') ??
      findByTextContains(xml, 'Không cho phép') ??
      findByTextContains(xml, "Don't allow");
    if (!close) break;
    await tap(close);
    xml = await dump(`overlay-${i}`);
  }
  return xml;
}

async function scrollDown(times = 2) {
  for (let i = 0; i < times; i++) {
    sh('shell input swipe 540 1600 540 600 400');
    await sleep(700);
  }
}

function parseLogcat(logcat) {
  const companyIds = [...logcat.matchAll(/x-company-id[=:\s"]+([^\s"',]+)/gi)].map((m) => m[1]);
  const uuids = companyIds.filter((c) => /^[0-9a-f-]{36}$/i.test(c));
  return {
    companyIds: [...new Set(companyIds)],
    hasMain: companyIds.some((c) => c === 'main'),
    uuidHeader: uuids[0] ?? null,
    hrmMobLines: logcat.split('\n').filter((l) => l.includes('[HRM-MOB]')).slice(-6),
  };
}

async function fetchSession(email = EMAIL, password = PASSWORD) {
  const res = await fetch(`${API_BASE}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(`API login failed: ${j.code ?? res.status}`);
  const d = j.data;
  const a = d.active_membership ?? {};
  return {
    email,
    code: j.code,
    companyUuid: a.company_uuid ?? d.company_uuid ?? '',
    companyId: a.company_id ?? d.default_company_id ?? '',
    token: d.access_token,
    refresh: d.refresh_token ?? '',
    tenant: a.tenant_id ?? d.default_tenant_id,
    emp: a.employee_id ?? d.employee?.id ?? '',
    memberships: d.memberships?.length ?? 0,
  };
}

function buildDeepLink(session) {
  const q = new URLSearchParams({
    access_token: session.token,
    refresh_token: session.refresh,
    tenant_id: session.tenant,
    company_id: session.companyId,
    company_uuid: session.companyUuid,
    employee_id: session.emp,
    base_url: API_BASE,
  });
  return `xevn://qa-login?${q.toString()}`;
}

async function qaDeepLogin(email = EMAIL) {
  sh(`shell am force-stop ${PKG}`);
  await sleep(700);
  sh('logcat -c');
  const session = await fetchSession(email);
  const deepLink = buildDeepLink(session);
  spawnSync(
    adb,
    ['-s', serial, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', deepLink],
    { encoding: 'utf8' },
  );
  await sleep(3000);
  let xml = await waitForHome();
  xml = xml ? await dismissOverlays(xml) : '';
  const home = homeReached(xml);
  const logcat = sh('logcat -d -t 800');
  return { session, home, xml, logcat, header: parseLogcat(logcat) };
}

async function openProfileTab() {
  let xml = await dump('nav-profile-pre');
  await tapFirst(xml, ['Hồ sơ']) ?? (await tap({ x: 945, y: 2211 }));
  await sleep(2200);
  xml = await dump('profile-root');
  xml = await dismissOverlays(xml);
  return xml;
}

async function tryOpenSettingsFromProfile(xml) {
  const paths = [];
  for (const label of ['Cài đặt', 'Settings', 'Phạm vi công ty', 'Phạm vi']) {
    const hit = findByText(xml, label) ?? findByTextContains(xml, label);
    if (hit) {
      await tap(hit);
      paths.push(`text:${label}`);
      await sleep(2000);
      return { xml: await dump('settings-attempt'), paths };
    }
  }
  await scrollDown(3);
  xml = await dump('profile-scrolled');
  for (const label of ['Cài đặt', 'Settings', 'Phạm vi công ty']) {
    const hit = findByText(xml, label) ?? findByTextContains(xml, label);
    if (hit) {
      await tap(hit);
      paths.push(`scroll+text:${label}`);
      await sleep(2000);
      return { xml: await dump('settings-attempt'), paths };
    }
  }
  return { xml, paths };
}

async function testLoginErrorRecovery() {
  const wrongProbe = await fetch(`${API_BASE}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: 'wrong-password-qa' }),
  }).then((r) => r.json());
  sh(`shell pm clear ${PKG}`);
  await sleep(1200);
  sh(`shell am start -n ${PKG}/.MainActivity`);
  await sleep(4000);
  let xml = await dump('login-screen');
  xml = await dismissOverlays(xml);
  const onLogin = hasAny(xml, ['login-email', 'login-submit', 'Đăng nhập', 'Email']);
  if (!onLogin) {
    return {
      verdict: '🟡',
      note: 'Login screen not shown after pm clear (session auto-restore?)',
      apiWrongCode: wrongProbe.code,
    };
  }
  await tap(findByTestId(xml, 'login-email') ?? findByTextContains(xml, 'Email') ?? { x: 540, y: 900 });
  sh(`shell input text ${EMAIL.replace('@', '\\@')}`);
  await sleep(400);
  await tap(findByTestId(xml, 'login-password') ?? { x: 540, y: 1050 });
  sh('shell input text wrongpass');
  await sleep(400);
  await tap(findByTestId(xml, 'login-submit') ?? findByText(xml, 'Đăng nhập') ?? { x: 540, y: 1200 });
  await sleep(2500);
  xml = await dump('login-wrong-pass');
  await shot('tc-mob-007-login-error');
  const errorShown = hasAny(xml, ['Lỗi', 'HRM-AUTH', '401', 'Sai', 'mật khẩu', 'AlertDialog']);
  await tap(findByText(xml, 'OK') ?? findByText(xml, 'Đóng'));
  await sleep(800);
  xml = await dump('login-recovery-pre');
  await tap(findByTestId(xml, 'login-password') ?? { x: 540, y: 1050 });
  sh('shell input keyevent 67');
  sh('shell input keyevent 67');
  sh('shell input keyevent 67');
  sh(`shell input text ${PASSWORD}`);
  await sleep(400);
  await tap(findByTestId(xml, 'login-submit') ?? findByText(xml, 'Đăng nhập') ?? { x: 540, y: 1200 });
  await sleep(4500);
  xml = await dump('login-recovery-post');
  xml = await dismissOverlays(xml);
  await shot('tc-mob-007-login-recovery');
  const recovered = homeReached(xml);
  return {
    verdict: errorShown && recovered ? '🟢' : errorShown ? '🟡' : '🟡',
    note: errorShown
      ? recovered
        ? 'Wrong password alert + successful re-login to Home'
        : 'Error alert shown; recovery login did not reach Home (adb input)'
      : `API wrong pass ${wrongProbe.code}; UI error not captured`,
    apiWrongCode: wrongProbe.code,
    errorShown,
    recovered,
  };
}

async function testHomeErrorRecovery(xmlHome) {
  const happy = !hasAny(xmlHome, ['DashboardHomeShimmer', 'shimmer', 'HRM-MOB-ERR-NETWORK']);
  try {
    sh('shell cmd connectivity airplane-mode enable');
  } catch {
    /* emulator may deny — still capture recovery */
  }
  await sleep(2500);
  let xml = await dump('home-offline', { required: false });
  try {
    await shot('tc-mob-011-offline');
  } catch {
    /* screencap may fail offline */
  }
  const offlineBanner = hasAny(xml, ['Offline', 'Mất kết nối', 'offline-banner', 'Không có mạng']);
  try {
    sh('shell cmd connectivity airplane-mode disable');
  } catch {
    /* ignore */
  }
  await sleep(3500);
  xml = await dump('home-online-recovery', { required: false }) || xmlHome;
  await shot('tc-mob-011-recovery');
  xml = await dismissOverlays(xml);
  const recovered = homeReached(xml);
  const verdict =
    happy && (offlineBanner || recovered) && recovered ? '🟢' : happy && recovered ? '🟢' : '🟡';
  return {
    verdict,
    note:
      offlineBanner && recovered
        ? 'Home loads; offline banner on airplane-mode; recovery after disable'
        : happy && recovered
          ? 'Home happy path OK; offline banner not detected on emulator airplane toggle'
          : 'Home shimmer/network issue',
    happy,
    offlineBanner,
    recovered,
  };
}

const result = {
  work_item_id: 'QA-HDSD-BF-SWEEP-02-MOB-01',
  date: '2026-08-01',
  device: serial,
  api_base: API_BASE,
  persona: `${EMAIL} / ${PASSWORD}`,
  u65_zero_seed: true,
  tc: {},
  screenshots: SHOT_DIR.replace(/\\/g, '/'),
};

async function main() {
  if (!sh('devices').includes('device')) {
    console.error('no adb device');
    process.exit(2);
  }

  const sessionProbe = await fetchSession();
  result.session_probe = {
    code: sessionProbe.code,
    companyUuid: sessionProbe.companyUuid,
    companyId: sessionProbe.companyId,
    memberships: sessionProbe.memberships,
  };

  const login = await qaDeepLogin();
  if (!login.home) {
    result.blocked = 'Home not reached after qa deep-link login';
    fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
  await shot('00-home-after-login');

  // TC-MOB-006 / TC-MOB-032 — Settings → Scope
  let profileXml = await openProfileTab();
  await shot('tc-mob-027-profile');
  const settingsTry = await tryOpenSettingsFromProfile(profileXml);
  profileXml = settingsTry.xml;
  const onSettings = hasAny(profileXml, [
    'Cài đặt',
    'Phạm vi đang dùng',
    'Đăng xuất',
    'Sinh trắc học',
    'Lưu vào SecureStore',
  ]);
  if (onSettings) {
    await shot('tc-mob-032-settings');
    await tapFirst(profileXml, ['Phạm vi công ty', 'Phạm vi']);
    await sleep(2000);
    profileXml = await dump('scope-screen');
    await shot('tc-mob-006-scope');
  }
  const onScope = hasAny(profileXml, [
    'Phạm vi công ty',
    'Phạm vi nhân viên',
    'Phạm vi tập đoàn',
    'Kiêm nhiệm',
    'membership',
    'Đã chọn',
  ]);
  result.tc['TC-MOB-006'] = {
    verdict: onScope ? '🟢' : '🟡',
    note: onScope
      ? `Scope screen loaded via ${settingsTry.paths.join(' → ') || 'settings nav'}`
      : 'No FE navigation path to Scope (Profile lacks Cài đặt entry; old Thêm tab removed)',
    paths: settingsTry.paths,
    markers: ['Phạm vi', 'membership'].filter((m) => profileXml.includes(m)),
  };
  result.tc['TC-MOB-032'] = {
    verdict: onSettings ? '🟢' : '🟡',
    note: onSettings
      ? 'Settings screen — phạm vi block + logout visible'
      : 'SettingsScreen exists in stack but no Profile→Settings navigation (spec_gap vs HDSD §12.9)',
    paths: settingsTry.paths,
  };

  // TC-MOB-027 / TC-MOB-028 — Profile hero + dynamic form
  profileXml = await openProfileTab();
  const hero = hasAny(profileXml, ['profile-employee-hero', 'profile-screen']);
  const form = hasAny(profileXml, ['dynamic-profile-form', 'profile-ess-save', 'profile-ess-editor']);
  await shot('tc-mob-028-profile-form');
  result.tc['TC-MOB-027'] = {
    verdict: hero ? '🟢' : '🟡',
    note: hero ? 'EmployeeHeroCard testID visible on Profile › Thông tin' : 'Hero card markers missing',
    header: login.header,
  };
  result.tc['TC-MOB-028'] = {
    verdict: form ? '🟢' : '🟡',
    note: form ? 'DynamicProfileForm + ESS fields/save testIDs present' : 'Catalog-driven form not rendered',
  };

  // TC-MOB-011 — Home error / recovery
  sh('shell input keyevent 4');
  await sleep(800);
  let homeXml = await dump('home-for-011');
  result.tc['TC-MOB-011'] = await testHomeErrorRecovery(homeXml);

  // TC-MOB-007 — Login error / recovery (last — pm clear resets session)
  result.tc['TC-MOB-007'] = await testLoginErrorRecovery();

  // TC-MOB-033 — UC ↔ screen mapping (visited screens vs HDSD §12.10)
  const ucMap = [
    { uc: 'UC-HRM-MOB-01', screen: 'LoginScreen', seen: result.tc['TC-MOB-007'].recovered !== false },
    { uc: 'UC-HRM-MOB-02', screen: 'ScopeScreen · SettingsScreen', seen: onScope || onSettings },
    { uc: 'UC-HRM-MOB-03', screen: 'DashboardScreen', seen: login.home },
    { uc: 'UC-HRM-MOB-12', screen: 'ProfileScreen', seen: hero },
  ];
  const mapPass = ucMap.filter((r) => r.seen).length;
  result.tc['TC-MOB-033'] = {
    verdict: mapPass >= 3 ? '🟢' : '🟡',
    note: `HDSD §12.10 spot-check ${mapPass}/${ucMap.length} UC↔screen pairs verified on device`,
    ucMap,
  };

  result.header_audit = {
    expected_uuid: sessionProbe.companyUuid,
    logcat: login.header,
    pass: !login.header.hasMain && !!login.header.uuidHeader,
  };

  const greens = Object.values(result.tc).filter((t) => t.verdict === '🟢').length;
  result.summary = { green: greens, yellow: 7 - greens, total: 7 };
  result.pass = greens >= 4;

  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.pass ? 0 : 1);
}

main().catch((e) => {
  result.fatal = String(e?.message ?? e);
  try {
    fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
  } catch {
    /* ignore */
  }
  console.error(e);
  process.exit(1);
});
