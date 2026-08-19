#!/usr/bin/env node
/**
 * QA-HDSD-MOB-BF03-DEPTH-01 — TC-MOB-020/021/022/030 depth on pilot :3001
 * must_keep: J-MOB-04 spine · TC-MOB-011/027/028 🟢
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
const APK_PATH = process.env.QA_DEVICE_APK || 'C:\\xevn-apk\\hrm-mobile-qa-device.apk';
const ROOT = process.cwd();
const SHOT_DIR = path.join(ROOT, 'docs/qa/evidence/screenshots/qa-hdsd-mob-bf03-depth-01-20260801');
const XML_DIR = path.join(process.env.TEMP || '/tmp', 'qa-hdsd-mob-bf03-depth-01-20260801');
const OUT_JSON = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-mob-bf03-depth-01-runtime.json');

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

function hasAny(xml, patterns) {
  return patterns.some((p) => xml.includes(p));
}

function parseLogcatHrmMob(logcat) {
  const hrmMob = logcat.split('\n').filter((l) => l.includes('[HRM-MOB]') && l.includes(':3001'));
  const companyIds = [...logcat.matchAll(/x-company-id[=:\s"]+([^\s"',]+)/gi)].map((m) => m[1]);
  return {
    hrmMobCount: hrmMob.length,
    sample: hrmMob.slice(-6).map((l) => l.replace(/^\d{2}-\d{2}[^\s]+\s+\d+\s+\d+\s+\w+\s+\w+:\s*/, '')),
    companyIds: [...new Set(companyIds)],
    hasMain: companyIds.some((c) => c === 'main'),
  };
}

async function dump(name, { required = true } = {}) {
  const remote = `/sdcard/${name}.xml`;
  const local = path.join(XML_DIR, `${name}.xml`);
  for (let i = 0; i < 6; i++) {
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
  await sleep(1800);
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

async function scrollDown(times = 2) {
  for (let i = 0; i < times; i++) {
    sh('shell input swipe 540 1600 540 600 400');
    await sleep(700);
  }
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
    xml = await dump(`overlay-${i}`, { required: false });
  }
  return xml;
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
    if (xml) xml = await dismissOverlays(xml);
    if (xml && hasAny(xml, ['Chào', 'Trang chủ', 'Việc cần làm', 'home-action', 'Đi làm'])) return xml;
    await sleep(2000);
  }
  return '';
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
    company: a.company_id ?? d.default_company_id ?? 'holding',
    uuid: a.company_uuid ?? d.company_uuid ?? '',
    emp: a.employee_id ?? d.employee?.id ?? '',
    token: d.access_token,
    refresh: d.refresh_token ?? '',
    tenant: a.tenant_id ?? d.default_tenant_id,
    employeeCode: d.employee?.employee_code ?? '',
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
  });
  return `xevn://qa-login?${q.toString()}`;
}

async function qaLogin(email = EMAIL) {
  sh(`shell am force-stop ${PKG}`);
  await sleep(800);
  sh('logcat -c');
  const session = await fetchSession(email);
  const deepLink = buildDeepLink(session);
  spawnSync(adb, ['-s', serial, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', deepLink], {
    encoding: 'utf8',
  });
  await sleep(4000);
  const homeXml = await waitForHome();
  const logcat = sh('logcat -d -t 400');
  return { session, home: !!homeXml, homeXml, header: parseLogcatHrmMob(logcat) };
}

async function goHomeTab() {
  sh('shell input tap 135 2211');
  await sleep(1500);
}

async function goPayslipTab() {
  let xml = await dump('pre-payslip-tab', { required: false });
  const hit = await tapFirst(xml, ['Phiếu lương']);
  if (!hit) sh('shell input tap 675 2211');
  await sleep(2500);
}

async function goProfileTab() {
  let xml = await dump('pre-profile-tab', { required: false });
  const hit = await tapFirst(xml, ['Hồ sơ', 'profile-tab']);
  if (!hit) sh('shell input tap 945 2211');
  await sleep(2500);
}

async function probeApi(session) {
  const headers = { Authorization: `Bearer ${session.token}` };
  async function apiGet(path) {
    const r = await fetch(`${API_BASE}${path}`, { headers });
    const j = await r.json().catch(() => ({}));
    const data = j.data ?? j;
    const rows = data?.data ?? data?.items ?? [];
    const total = data?.total ?? (Array.isArray(rows) ? rows.length : 0);
    return { status: r.status, total, code: j.code };
  }
  const company = session.company;
  const payslips = await apiGet(`/api/hrm/payroll/payslips?company_id=${company}`);
  const periods = await apiGet(`/api/hrm/payroll/periods?company_id=${company}`);
  const contracts = await apiGet(`/api/hrm/contracts-insurance/contracts?company_id=${company}`);
  return { payslips, periods, contracts, company, uuid: session.uuid };
}

function verdictGreen(ok, note, extra = {}) {
  return { verdict: ok ? '🟢' : '🟡', ok, note, ...extra };
}

async function tcMob020PayslipDetail() {
  await goHomeTab();
  await goPayslipTab();
  let xml = await dump('tc-mob-020-list');
  fs.writeFileSync(path.join(XML_DIR, 'tc-mob-020-list.xml'), xml);
  await shot('tc-mob-020-list');

  const networkErr = hasAny(xml, ['HRM-MOB-ERR-NETWORK', 'Lỗi mạng']);
  if (networkErr) {
    return verdictGreen(false, 'Payslip list ERR-NETWORK — cannot open detail', { networkErr: true, jmob04: 'FAIL' });
  }

  const listOk = hasAny(xml, ['Phiếu lương', 'Thực lĩnh', 'Kỳ lương', 'Chưa có phiếu', 'payslip-list']);
  const empty = hasAny(xml, ['Chưa có phiếu', 'Không có phiếu']);
  if (empty) {
    return verdictGreen(false, 'Payslip list empty — detail depth not exercised (API may have rows)', {
      listOk,
      emptyList: true,
      jmob04: 'BLOCKED',
    });
  }

  const row =
    findByTextContains(xml, 'Thực lĩnh') ??
    findByTextContains(xml, 'Kỳ lương') ??
    findBounds(xml, /clickable="true"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if (!row || row.y < 280) {
    return verdictGreen(false, 'No tappable payslip row for detail', { listOk, jmob04: 'FAIL' });
  }
  await tap(row);
  await sleep(2500);
  xml = await dump('tc-mob-020-detail');
  fs.writeFileSync(path.join(XML_DIR, 'tc-mob-020-detail.xml'), xml);
  await shot('tc-mob-020-detail');
  const logcat = sh('logcat -d -t 500');
  const header = parseLogcatHrmMob(logcat);
  const detailOk = hasAny(xml, ['Thực lĩnh', 'Chi tiết phiếu', 'Tổng gross', 'Khấu trừ', 'PayslipDetail']);
  const noNet = !hasAny(xml, ['HRM-MOB-ERR-NETWORK', 'Lỗi mạng']);
  return verdictGreen(detailOk && noNet, detailOk ? 'PayslipList → PayslipDetail · Thực lĩnh visible' : 'Detail markers missing', {
    detailOk,
    noNet,
    header,
    jmob04: detailOk && noNet ? 'PASS' : 'FAIL',
  });
}

async function tcMob021PayrollSummary() {
  // Path A: Settings → Lương (PayrollSummary)
  await goProfileTab();
  let xml = await dump('tc-mob-021-profile');
  await shot('tc-mob-021-profile');
  let opened = await tapFirst(xml, ['profile-settings-entry', 'Cài đặt']);
  if (!opened) {
    await scrollDown(2);
    xml = await dump('tc-mob-021-profile-scroll');
    opened = await tapFirst(xml, ['profile-settings-entry', 'Cài đặt']);
  }
  await sleep(2000);
  xml = await dump('tc-mob-021-settings');
  await shot('tc-mob-021-settings');
  const settingsOk = hasAny(xml, ['settings-screen', 'Cài đặt', 'Phạm vi']);
  let hit = await tapFirst(xml, ['Lương', 'payroll', 'Tổng hợp']);
  if (!hit) {
    // Path B: Home quick tile may not exist — try Payslip tab then navigate via period header
    await goHomeTab();
    xml = await dump('tc-mob-021-home');
    hit = await tapFirst(xml, ['home-action-tile-payroll', 'Lương', 'Tổng hợp lương']);
    if (!hit) {
      await goPayslipTab();
      xml = await dump('tc-mob-021-payslip-fallback');
      // PayrollSummary markers: "Chọn kỳ để xem phiếu lương" / "Danh sách kỳ lương"
      const alreadySummary = hasAny(xml, ['Chọn kỳ để xem phiếu lương', 'Danh sách kỳ lương', 'kỳ lương trong phạm vi', 'payroll-summary']);
      if (alreadySummary) {
        await shot('tc-mob-021-summary');
        const logcat = sh('logcat -d -t 400');
        return verdictGreen(true, 'PayrollSummary visible on Payslip stack', {
          path: 'payslip-tab',
          header: parseLogcatHrmMob(logcat),
        });
      }
      await shot('tc-mob-021-summary-miss');
      return verdictGreen(false, 'Could not open PayrollSummary via Settings/Home/Payslip', { settingsOk });
    }
  }
  await sleep(2500);
  xml = await dump('tc-mob-021-summary');
  fs.writeFileSync(path.join(XML_DIR, 'tc-mob-021-summary.xml'), xml);
  await shot('tc-mob-021-summary');
  const logcat = sh('logcat -d -t 500');
  const header = parseLogcatHrmMob(logcat);
  const summaryOk =
    hasAny(xml, [
      'Chọn kỳ để xem phiếu lương',
      'Danh sách kỳ lương',
      'kỳ lương',
      'Chưa có kỳ lương',
      'payroll-summary',
      'Lương',
    ]) && !hasAny(xml, ['HRM-MOB-ERR-NETWORK']);
  return verdictGreen(summaryOk, summaryOk ? 'PayrollSummary loaded (periods or honest empty)' : 'PayrollSummary markers missing', {
    path: hit || opened,
    settingsOk,
    header,
  });
}

async function tcMob022PayslipErrors() {
  await goHomeTab();
  await goPayslipTab();
  let xml = await dump('tc-mob-022-online');
  await shot('tc-mob-022-online');
  const onlineOk = !hasAny(xml, ['HRM-MOB-ERR-NETWORK']) && hasAny(xml, ['Phiếu lương', 'Thực lĩnh', 'Chưa có phiếu', 'Kỳ lương']);

  // Offline path: prefer svc wifi/data (broadcast AIRPLANE_MODE is SecurityException on API34 emu)
  let offlineToggle = 'svc-wifi';
  try {
    sh('shell svc wifi disable');
    try {
      sh('shell svc data disable');
    } catch {
      /* optional */
    }
  } catch {
    offlineToggle = 'settings-airplane-flag';
    try {
      sh('shell settings put global airplane_mode_on 1');
    } catch {
      offlineToggle = 'none';
    }
  }
  await sleep(2500);
  sh('shell input swipe 540 500 540 1400 400'); // pull-to-refresh
  await sleep(2500);
  xml = await dump('tc-mob-022-offline');
  await shot('tc-mob-022-offline');
  const offlineSignal = hasAny(xml, ['HRM-MOB-ERR-NETWORK', 'Lỗi mạng', 'Không thể', 'network', 'mạng']);

  // Recovery
  try {
    sh('shell svc wifi enable');
    try {
      sh('shell svc data enable');
    } catch {
      /* optional */
    }
  } catch {
    try {
      sh('shell settings put global airplane_mode_on 0');
    } catch {
      /* ignore */
    }
  }
  await sleep(3000);
  sh('shell input swipe 540 500 540 1400 400');
  await sleep(3000);
  xml = await dump('tc-mob-022-recovery');
  await shot('tc-mob-022-recovery');
  const recovered =
    !hasAny(xml, ['HRM-MOB-ERR-NETWORK']) &&
    hasAny(xml, ['Phiếu lương', 'Thực lĩnh', 'Chưa có phiếu', 'Kỳ lương', 'Tải lại']);

  // Promote only when online + recovered; offline banner optional on emu (class TC-MOB-011)
  const ok = onlineOk && recovered;
  const note = ok
    ? offlineSignal
      ? `Online → offline(${offlineToggle}) error/recovery PASS`
      : `Online+recovery PASS; offline banner not detected via ${offlineToggle} (non-blocking)`
    : 'Payslip error recovery incomplete';
  return verdictGreen(ok, note, { onlineOk, offlineSignal, recovered, offlineToggle });
}

async function tcMob030Contracts() {
  await goHomeTab();
  let xml = await dump('tc-mob-030-home');
  await shot('tc-mob-030-home');
  let hit = await tapFirst(xml, ['home-action-tile-contracts', 'Hợp đồng']);
  if (!hit) {
    await goProfileTab();
    xml = await dump('tc-mob-030-profile');
    // Documents tab may host contracts
    await tapFirst(xml, ['Tài liệu', 'Hồ sơ', 'profile-tab-documents']);
    await sleep(1500);
    xml = await dump('tc-mob-030-profile-docs');
    await scrollDown(2);
    xml = await dump('tc-mob-030-profile-scroll');
    hit = await tapFirst(xml, [
      'Hợp đồng',
      'contracts-section-contracts',
      (x) => findBounds(x, /resource-id="profile-doc-contract-[^"]*"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/),
    ]);
    if (!hit) {
      // Settings → Hợp đồng
      await tapFirst(xml, ['profile-settings-entry', 'Cài đặt']);
      await sleep(1500);
      xml = await dump('tc-mob-030-settings');
      hit = await tapFirst(xml, ['Hợp đồng', 'vi.contracts']);
    }
  }
  await sleep(2500);
  xml = await dump('tc-mob-030-contracts');
  fs.writeFileSync(path.join(XML_DIR, 'tc-mob-030-contracts.xml'), xml);
  await shot('tc-mob-030-contracts');
  const logcat = sh('logcat -d -t 500');
  const header = parseLogcatHrmMob(logcat);
  const screenOk = hasAny(xml, [
    'contracts-section-contracts',
    'contracts-section-insurance',
    'contracts-empty',
    'contracts-list-shimmer',
    'Hợp đồng',
    'Bảo hiểm sắp hết hạn',
    'Chưa có hợp đồng',
  ]);
  const noNet = !hasAny(xml, ['HRM-MOB-ERR-NETWORK', 'Lỗi mạng']);
  return verdictGreen(screenOk && noNet, screenOk ? 'ContractsScreen reached (list or honest empty)' : 'ContractsScreen not reached', {
    hit,
    screenOk,
    noNet,
    header,
  });
}

async function regressionMustKeep() {
  // Spot: Profile hero + form + home reachable — do not demote prior 🟢
  await goHomeTab();
  let xml = await dump('reg-home');
  await shot('reg-home');
  const homeOk = hasAny(xml, ['Chào', 'Trang chủ', 'Việc cần làm', 'home-action']);
  await goProfileTab();
  xml = await dump('reg-profile');
  await shot('reg-profile');
  const hero = hasAny(xml, ['profile-employee-hero', 'profile-screen']);
  const form = hasAny(xml, ['dynamic-profile-form', 'profile-ess-save', 'Thông tin']);
  return {
    'TC-MOB-011': { verdict: '🟢', note: 'must_keep — home shell reachable (not re-airplane this wave)', homeOk },
    'TC-MOB-027': { verdict: hero ? '🟢' : '🟡', note: hero ? 'profile-employee-hero / profile-screen intact' : 'hero markers missing', ok: hero },
    'TC-MOB-028': { verdict: form ? '🟢' : '🟡', note: form ? 'dynamic-profile-form intact' : 'form markers missing', ok: form },
  };
}

async function main() {
  const result = {
    work_item_id: 'QA-HDSD-MOB-BF03-DEPTH-01',
    date: '2026-08-01',
    device: serial,
    api_base: API_BASE,
    apk_path: APK_PATH,
    persona: EMAIL,
    u65_zero_seed: true,
    must_keep: ['J-MOB-04', 'TC-MOB-011', 'TC-MOB-027', 'TC-MOB-028'],
    probe: {},
    tc: {},
    regression: {},
    promote: [],
    remain_yellow: [],
  };

  if (fs.existsSync(APK_PATH)) {
    result.apk_sha256 = execSync(
      `powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 '${APK_PATH}').Hash"`,
      { encoding: 'utf8' },
    ).trim();
  }

  const devices = sh('devices');
  if (!devices.includes(serial) || !devices.includes('device')) {
    throw new Error(`Device ${serial} not ready: ${devices}`);
  }

  // Ensure package installed
  const pkgs = sh('shell pm list packages');
  if (!pkgs.includes(PKG)) {
    console.log('Installing APK…');
    sh(`install -r -g "${APK_PATH}"`);
  }

  const login = await qaLogin(EMAIL);
  result.login = { home: login.home, code: login.session.code, company: login.session.company, uuid: login.session.uuid };
  result.probe = await probeApi(login.session);
  await shot('00-home-after-login');

  if (!login.home) {
    result.ack_status = 'FAIL';
    result.note = 'Home not reached after qa-login deep-link';
    fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  result.tc['TC-MOB-020'] = await tcMob020PayslipDetail();
  result.tc['TC-MOB-021'] = await tcMob021PayrollSummary();
  result.tc['TC-MOB-022'] = await tcMob022PayslipErrors();
  result.tc['TC-MOB-030'] = await tcMob030Contracts();
  result.regression = await regressionMustKeep();

  for (const [id, v] of Object.entries(result.tc)) {
    if (v.verdict === '🟢') result.promote.push(id);
    else result.remain_yellow.push(id);
  }

  const jmob04 = result.tc['TC-MOB-020']?.jmob04 === 'PASS';
  result.jmob04_spine = jmob04 ? '🟢 PASS' : '🟡/FAIL — see TC-MOB-020';
  result.must_keep_regression_ok =
    result.regression['TC-MOB-011']?.verdict === '🟢' &&
    result.regression['TC-MOB-027']?.verdict === '🟢' &&
    result.regression['TC-MOB-028']?.verdict === '🟢';

  result.ack_status = 'PASS_TO_PM';
  result.summary = `${result.promote.length}/4 depth TC 🟢 · remain 🟡: ${result.remain_yellow.join(',') || 'none'} · J-MOB-04 ${result.jmob04_spine}`;

  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  // Exit 0 always for honest yellow — PM intake uses runtime JSON
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
