#!/usr/bin/env node
/**
 * QA device login via deep link — bypasses adb TextInput on API33.
 *
 * Usage:
 *   node scripts/qa-mobile-login-intent.mjs
 *   node scripts/qa-mobile-login-intent.mjs --email uat.nv0001@xe.vn --password xevn-uat-2026
 *
 * Requires: emulator/device + **qa-device** APK (`BUILD_TARGET=qa-device node scripts/build-apk.cjs`)
 *   EXPO_PUBLIC_ENABLE_QA_DEEP_LINK=1, EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=1
 *
 * **hub04b release** (`hrm-mobile-release-hub04b.apk`) bundles QA_DEEP_LINK=0 — deep link is ignored;
 * use ADBKeyboard login in `scripts/tmp-pcomp-w7-qa-hub-r3-02-r2-device.mjs` (see PCOMP-W7-QA-HUB-R3-02-R2 evidence).
 */
import { execSync, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const sdk = process.env.LOCALAPPDATA + '\\Android\\Sdk';
const adb = `${sdk}\\platform-tools\\adb.exe`;
const API_BASE = process.env.HRM_API_BASE || 'http://14.225.217.232:8088';
const EMAIL = process.argv.includes('--email')
  ? process.argv[process.argv.indexOf('--email') + 1]
  : 'uat.nv0001@xe.vn';
const PASSWORD = process.argv.includes('--password')
  ? process.argv[process.argv.indexOf('--password') + 1]
  : 'xevn-uat-2026';
const PKG = 'vn.xevn.hrm.mobile';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

async function fetchSession() {
  const res = await fetch(`${API_BASE}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(`API login failed: ${j.code ?? res.status}`);
  const d = j.data;
  const a = d.active_membership ?? d.memberships?.[0] ?? {};
  return {
    token: d.access_token,
    refresh: d.refresh_token ?? '',
    tenant: a.tenant_id ?? d.default_tenant_id,
    company: a.company_id ?? d.default_company_id ?? 'holding',
    uuid: a.company_uuid ?? d.company_uuid ?? '',
    emp: a.employee_id ?? d.employee?.id ?? '',
    // W1-B-04 — pass BE display-ready labels into deep-link (Scope «Đang dùng»)
    company_label: a.company_label ?? '',
    tenant_label: a.tenant_label ?? '',
    role_label: a.role_label ?? '',
    job_title_label: a.job_title_label ?? '',
    employee_code: a.employee_code ?? '',
    employee_name: a.employee_name ?? '',
  };
}

function buildDeepLink(session) {
  const q = new URLSearchParams({
    access_token: session.token,
    refresh_token: session.refresh,
    tenant_id: session.tenant,
    company_id: session.company,
    company_uuid: session.uuid,
    employee_id: session.emp,
    base_url: API_BASE,
    company_label: session.company_label ?? '',
    tenant_label: session.tenant_label ?? '',
    role_label: session.role_label ?? '',
    job_title_label: session.job_title_label ?? '',
    employee_code: session.employee_code ?? '',
    employee_name: session.employee_name ?? '',
  });
  return `xevn://qa-login?${q.toString()}`;
}

const HOME_MARKERS = [
  'Chào buổi',
  'Trang chủ',
  'Xin chào',
  'Việc cần làm',
  'Đi làm',
  'Đồng nghiệp',
  'Thông báo',
  'content-desc="Trang chủ"',
];

function homeReached(xml) {
  return HOME_MARKERS.some((m) => xml.includes(m));
}

/** C-W8-DEVICE-04 — dismiss POST_NOTIFICATIONS before home UI assertions */
function findBounds(xml, pattern) {
  const m = xml.match(pattern);
  if (!m) return null;
  return {
    x: Math.floor((+m[1] + +m[3]) / 2),
    y: Math.floor((+m[2] + +m[4]) / 2),
  };
}

async function dismissPostNotifications() {
  try {
    sh(`"${adb}" shell uiautomator dump /sdcard/qa-perm-dismiss.xml`);
    sh(`"${adb}" pull /sdcard/qa-perm-dismiss.xml qa-perm-dismiss.xml`);
    const xml = await import('node:fs').then((fs) => fs.readFileSync('qa-perm-dismiss.xml', 'utf8'));
    if (!xml.includes('com.google.android.permissioncontroller')) return false;
    if (!/notification|thông báo/i.test(xml)) return false;

    const deny =
      findBounds(
        xml,
        /resource-id="com\.android\.permissioncontroller:id\/permission_deny_button"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
      ) ??
      findBounds(xml, /text="Don(?:&#8217;|')t allow"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/) ??
      findBounds(xml, /text="Không cho phép"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!deny) return false;

    sh(`"${adb}" shell input tap ${deny.x} ${deny.y}`);
    await sleep(1200);
    return true;
  } catch {
    return false;
  }
}

async function waitForHome(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await dismissPostNotifications();
      sh(`"${adb}" shell uiautomator dump /sdcard/qa-login-check.xml`);
      sh(`"${adb}" pull /sdcard/qa-login-check.xml qa-login-check.xml`);
      const xml = await import('node:fs').then((fs) => fs.readFileSync('qa-login-check.xml', 'utf8'));
      if (homeReached(xml)) {
        return { ok: true, xml, marker: HOME_MARKERS.find((m) => xml.includes(m)) };
      }
      if (!xml.includes(`package="${PKG}"`)) {
        await sleep(1500);
        sh(`"${adb}" shell am start -n ${PKG}/.MainActivity`);
      }
    } catch {
      /* emulator may kill uiautomator while app is loading */
    }
    await sleep(2000);
  }
  return { ok: false, xml: '' };
}

async function main() {
  if (!sh(`"${adb}" devices`).includes('device')) {
    console.error('no adb device');
    process.exit(2);
  }

  sh(`"${adb}" shell am force-stop ${PKG}`);
  try {
    sh(`"${adb}" shell pm unsuspend ${PKG}`);
  } catch {
    /* ignore */
  }
  await sleep(800);

  const session = await fetchSession();
  const deepLink = buildDeepLink(session);
  sh(`"${adb}" logcat -c`);
  sh(`"${adb}" shell am force-stop ${PKG}`);
  await sleep(800);

  const intentUrl = deepLink;
  const r = spawnSync(
    adb,
    [
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-n',
      `${PKG}/.MainActivity`,
      '-d',
      deepLink,
    ],
    { encoding: 'utf8' },
  );
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(1);
  }

  await sleep(3000);
  const home = await waitForHome();
  const logcat = sh(`"${adb}" logcat -d -t 120`);
  const fatal = /FATAL EXCEPTION.*vn\.xevn\.hrm\.mobile|Process: vn\.xevn\.hrm\.mobile.*FATAL/.test(
    logcat.replace(/\s+/g, ' '),
  );

  const out = {
    work_item_id: 'PCOMP-W7-MOB-DEVICE-LOGIN-01',
    login_method: 'xevn_qa_login_deep_link',
    email: EMAIL,
    api_base: API_BASE,
    home_reached: home.ok,
    fatal_logcat: fatal,
    pass: home.ok && !fatal,
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
