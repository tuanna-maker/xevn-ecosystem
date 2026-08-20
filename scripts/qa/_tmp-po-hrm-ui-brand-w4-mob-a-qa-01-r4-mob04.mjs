#!/usr/bin/env node
/** PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4-MOB04 — GPS POST 2xx via pilot proxy + UIAutomator */
import { execSync, spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');
const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const S = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const APK = 'C:\\xevn-ecosystem\\apps\\mobile\\hrm-mobile\\dist\\hrm-mobile-qa-device.apk';
const APK_SHA_REQUIRED =
  process.env.APK_SHA256 || '8CE49FF25D76F690775DFB4B19B41FC6BF681F11C1D350F8823FC17734A4F765';
const ALLOW_SHA_DRIFT = process.env.QA_APK_ALLOW_DRIFT === '1';
const PILOT = { host: '14.225.217.232', port: 3001 };
const PROXY_PORT = Number(process.env.HRM_LOG_PROXY_PORT || 17811);
const OUT = path.join(REPO, 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r4');
const JSON_OUT = path.join(REPO, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-mob04.json');
const PROXY_LOG = path.join(REPO, 'docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r4-mob04-proxy.log');

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(PROXY_LOG, `# MOB04 pilot proxy ${new Date().toISOString()}\n`, 'utf8');

function logProxy(line) {
  fs.appendFileSync(PROXY_LOG, line + '\n', 'utf8');
}

function adbSh(...a) {
  const r = spawnSync(adb, ['-s', S, ...a], { encoding: 'utf8', maxBuffer: 30e6, timeout: 120000 });
  if (r.status !== 0 && !a.includes('logcat')) {
    throw new Error(String(r.stderr || r.stdout).slice(0, 800));
  }
  return (r.stdout || '').trim();
}

async function dump(name) {
  for (let i = 0; i < 8; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-mob04.xml');
      await sleep(800);
      execSync(`"${adb}" -s ${S} pull /sdcard/qa-mob04.xml "${OUT}/${name}.xml"`, { stdio: 'pipe' });
      const shot = spawnSync(adb, ['-s', S, 'exec-out', 'screencap', '-p'], { encoding: 'buffer', maxBuffer: 25e6 });
      if (shot.stdout?.length) fs.writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return fs.readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch {
      await sleep(2500);
    }
  }
  throw new Error('uiautomator dump failed');
}

function find(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const desc = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const node = { text, desc, rid };
    if (!pred(node)) continue;
    return { x: Math.floor((+b[1] + +b[3]) / 2), y: Math.floor((+b[2] + +b[4]) / 2), chunk };
  }
  return null;
}

function hasTestId(xml, id) {
  return xml.includes(`content-desc="${id}"`) || xml.includes(`resource-id="${id}"`);
}

function submitEnabled(xml) {
  const hit = find(xml, (n) => n.rid.includes('check-in-submit'));
  if (!hit) return null;
  const m = hit.chunk.match(/enabled="(true|false)"/);
  return m ? m[1] === 'true' : true;
}

function tap(hit) {
  if (hit) adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
}

function texts(xml) {
  const out = [];
  const re = /text="([^"]*)"/g;
  let m;
  while ((m = re.exec(xml))) if (m[1]) out.push(m[1]);
  return out;
}

async function dismissPerms(xml) {
  const allow =
    find(xml, (n) => n.rid.includes('permission_allow_button') || n.text === 'Allow' || n.text === 'Cho phép') ||
    find(xml, (n) => /While using the app|Chỉ khi dùng/i.test(n.text));
  if (allow) {
    tap(allow);
    await sleep(1200);
    return true;
  }
  return false;
}

function startPilotProxy() {
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const line = `${new Date().toISOString()} ${req.method} ${req.url} bytes=${body.length}`;
      logProxy(line);
      const headers = { ...req.headers, host: `${PILOT.host}:${PILOT.port}` };
      const proxyReq = http.request(
        {
          hostname: PILOT.host,
          port: PILOT.port,
          path: req.url,
          method: req.method,
          headers,
        },
        (proxyRes) => {
          logProxy(`  -> status=${proxyRes.statusCode} ${req.method} ${req.url}`);
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        },
      );
      proxyReq.on('error', (e) => {
        logProxy(`  -> proxy_error ${e.message}`);
        res.statusCode = 502;
        res.end('proxy error');
      });
      if (body.length) proxyReq.write(body);
      proxyReq.end();
    });
  });
  return new Promise((resolve) => {
    server.listen(PROXY_PORT, '127.0.0.1', () => {
      logProxy(`listening 127.0.0.1:${PROXY_PORT} -> ${PILOT.host}:${PILOT.port}`);
      resolve(server);
    });
  });
}

async function pilotLogin() {
  const res = await fetch(`http://${PILOT.host}:${PILOT.port}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'uat.nv0001@xe.vn', password: 'xevn-uat-2026' }),
  });
  if (!res.ok) throw new Error(`pilot login ${res.status}`);
  return res.json();
}

function homeReached(xml) {
  return (
    hasTestId(xml, 'home-top-bar-brand-accent') ||
    texts(xml).some((t) => /Trang chủ|Chào buổi|Việc cần làm|Xin chào|Đi làm/i.test(t))
  );
}

async function deeplinkViaProxy() {
  const j = await pilotLogin();
  const d = j.data;
  const a = d.active_membership ?? d.memberships?.[0] ?? {};
  const baseUrl = `http://10.0.2.2:${PROXY_PORT}`;
  const q = new URLSearchParams({
    access_token: d.access_token,
    refresh_token: d.refresh_token ?? '',
    tenant_id: a.tenant_id ?? d.default_tenant_id,
    company_id: a.company_id ?? d.default_company_id,
    company_uuid: a.company_uuid ?? '',
    employee_id: a.employee_id ?? d.employee?.id ?? '',
    base_url: baseUrl,
  });
  adbSh('shell', 'am', 'force-stop', PKG);
  await sleep(600);
  spawnSync(
    adb,
    ['-s', S, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', `xevn://qa-login?${q.toString()}`],
    { encoding: 'utf8' },
  );
  await sleep(9000);
  let xml = await dump('mob04-home');
  for (let i = 0; i < 14; i++) {
    await dismissPerms(xml);
    if (homeReached(xml)) {
      R.session_home = true;
      return xml;
    }
    await sleep(1500);
    xml = await dump(`mob04-home-wait-${i}`);
  }
  R.session_home = homeReached(xml);
  return xml;
}

const R = {
  work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4-MOB04',
  apk_sha_verified: false,
  login_path: 'qa-login OBS via deeplink + proxy base_url',
  face_live: false,
  remaster_program_done: false,
  seed: false,
};

const hashOut = spawnSync(
  'powershell',
  ['-NoProfile', '-Command', `(Get-FileHash -Algorithm SHA256 -LiteralPath '${APK.replace(/'/g, "''")}').Hash`],
  { encoding: 'utf8' },
);
const sha = (hashOut.stdout || '').trim().toUpperCase();
R.apk_sha = sha;
R.apk_sha_sot_required = APK_SHA_REQUIRED;
R.apk_sha_verified = sha === APK_SHA_REQUIRED;
if (!R.apk_sha_verified && !ALLOW_SHA_DRIFT) {
  fs.writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
  console.error('SHA mismatch', sha, 'expected', APK_SHA_REQUIRED);
  process.exit(2);
}
if (!R.apk_sha_verified) R.apk_sha_drift_obs = true;

const l0 = await fetch(`http://${PILOT.host}:${PILOT.port}/api/hrm/health`).catch(() => null);
R.pilot_l0 = l0?.status ?? 0;

const proxyServer = await startPilotProxy();
try {
  adbSh('reverse', '--remove-all');
  adbSh('reverse', `tcp:${PROXY_PORT}`, `tcp:${PROXY_PORT}`);
  adbSh('install', '-r', '-g', APK);
  adbSh('shell', 'settings', 'put', 'global', 'window_animation_scale', '0');
  adbSh('shell', 'settings', 'put', 'global', 'transition_animation_scale', '0');
  adbSh('shell', 'settings', 'put', 'global', 'animator_duration_scale', '0');
  adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_FINE_LOCATION');
  adbSh('shell', 'pm', 'grant', PKG, 'android.permission.ACCESS_COARSE_LOCATION');
  try {
    adbSh('shell', 'pm', 'grant', PKG, 'android.permission.POST_NOTIFICATIONS');
  } catch {
    /* ignore */
  }
  adbSh('shell', 'settings', 'put', 'secure', 'location_mode', '3');
  try {
    adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
  } catch {
    /* ignore */
  }

  fs.writeFileSync(PROXY_LOG, fs.readFileSync(PROXY_LOG, 'utf8') + '\n# --- submit window ---\n', 'utf8');
  let xml = await deeplinkViaProxy();
  if (!R.session_home) {
    R.ack = 'BLOCKED';
    R.blocked_reason = 'qa-login deeplink did not reach home within wait window';
  } else {
  for (let i = 0; i < 5; i++) {
    if (!(await dismissPerms(xml))) break;
    xml = await dump(`mob04-home-perm-${i}`);
  }

  if (xml.includes('fab-primary-action-sheet') || texts(xml).some((t) => /Đóng/i.test(t))) {
    tap(find(xml, (n) => n.text === 'Đóng' || n.desc.includes('Đóng')));
    await sleep(1200);
    xml = await dump('mob04-home-closed');
  }

  const fab =
    find(xml, (n) => n.desc === 'Thao tác nhanh' || n.rid.includes('check-in-fab')) ||
    find(xml, (n) => /Thao tác nhanh/i.test(n.text));
  R.fab_found = Boolean(fab);
  tap(fab);
  await sleep(2200);
  xml = await dump('mob04-fab');
  R.fab_sheet = hasTestId(xml, 'fab-primary-action-sheet');

  const checkIn =
    find(xml, (n) => n.rid.includes('fab-action-check-in') || n.desc === 'fab-action-check-in') ||
    find(xml, (n) => n.text === 'Chấm công');
  tap(checkIn);
  await sleep(3500);
  xml = await dump('mob04-checkin');
  for (let i = 0; i < 4; i++) {
    if (!(await dismissPerms(xml))) break;
    xml = await dump(`mob04-checkin-perm-${i}`);
  }

  R.checkin_gps = hasTestId(xml, 'check-in-channel-gps');
  R.checkin_submit_testid = hasTestId(xml, 'check-in-submit');

  tap(find(xml, (n) => n.rid.includes('check-in-channel-gps') || /Vị trí GPS/i.test(n.text)));
  await sleep(1500);
  xml = await dump('mob04-gps');
  R.submit_enabled = submitEnabled(xml);

  adbSh('logcat', '-c');
  const proxyLenBefore = fs.readFileSync(PROXY_LOG, 'utf8').length;
  const sub =
    find(xml, (n) => n.rid.includes('check-in-submit')) ||
    find(xml, (n) => /Chấm công vào/i.test(n.text));

  if (sub && R.submit_enabled !== false) {
    tap(sub);
    await sleep(12000);
    xml = await dump('mob04-after-submit');
    const log = adbSh('logcat', '-d', '-t', '800');
    fs.writeFileSync(`${OUT}/mob04-submit-logcat.txt`, log);
    const proxyTail = fs.readFileSync(PROXY_LOG, 'utf8').slice(proxyLenBefore);
    fs.writeFileSync(`${OUT}/mob04-proxy-snippet.log`, proxyTail, 'utf8');

    R.mob04_proxy_post2xx =
      /POST \/api\/hrm\/attendance\/records[^\n]*\n\s*-> status=(201|200|204)/m.test(proxyTail) ||
      (/attendance\/records/.test(proxyTail) && /-> status=(201|200|204)/.test(proxyTail));
    R.mob04_logcat_hrm_mob = /\[HRM-MOB\].*POST.*attendance\/records/i.test(log);
    R.mob04_ui_success = /Thành công|thành công|HRM-ATT|đã chấm/i.test(
      [xml, log].join('\n'),
    );
    R.mob04_proxy_snippet = proxyTail.split('\n').filter((l) => /attendance|status=/.test(l)).slice(0, 12);
  } else {
    R.mob04_proxy_post2xx = false;
    R.mob04_blocked = sub ? 'submit disabled' : 'submit not found';
  }

  R.ack =
    R.mob04_proxy_post2xx
      ? 'PASS_TO_PM'
      : R.mob04_ui_success && R.mob04_logcat_hrm_mob
        ? 'PASS_WITH_OBS'
        : 'FAIL_TO_PM';
  }
} finally {
  proxyServer.close();
}

fs.writeFileSync(JSON_OUT, JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 2));
process.exit(R.ack === 'PASS_TO_PM' || R.ack === 'PASS_WITH_OBS' ? 0 : 1);
