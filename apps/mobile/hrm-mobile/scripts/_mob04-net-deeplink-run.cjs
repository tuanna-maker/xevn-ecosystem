/**
 * MOB-04 network proof — qa-device deep-link session to local HRM (10.0.2.2 via reverse proxy).
 * U65: no DB seed; token from same mobile/login API the app uses; mutate via UI submit only.
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const adbBin =
  process.env.ADB ||
  path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const SERIAL = 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const PROXY = process.env.HRM_LOG_PROXY_PORT || '17801';
const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const OUT = path.join(
  REPO,
  'docs',
  'qa',
  'evidence',
  'screenshots',
  'po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net',
);
fs.mkdirSync(OUT, { recursive: true });
const proxyLog = path.join(OUT, 'hrm-proxy-access.log');

function sh(args) {
  return execSync(`"${adbBin}" -s ${SERIAL} ${args}`, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
}
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

async function main() {
  const loginRes = await fetch('http://127.0.0.1:28001/api/hrm/auth/mobile/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: process.env.QA_EMAIL || 'uat.nv0001@xe.vn', password: process.env.QA_PASSWORD || '' }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success) throw new Error(`login failed: ${JSON.stringify(loginJson)}`);
  const d = loginJson.data;
  const base = 'http://10.0.2.2:28001';
  const q = new URLSearchParams({
    base_url: base,
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    tenant_id: d.default_tenant_id || 'xevn',
    company_id: d.default_company_id || 'holding',
    company_uuid: d.company_uuid || '',
    employee_id: d.employee.id,
    employee_name: d.employee.full_name,
    employee_code: d.employee.employee_code,
  });
  const deeplink = `xevn://qa-login?${q.toString()}`;

  sh('reverse --remove-all');
  sh(`reverse tcp:28001 tcp:${PROXY}`);
  sh(`shell pm grant ${PKG} android.permission.ACCESS_FINE_LOCATION`);
  sh(`shell pm grant ${PKG} android.permission.ACCESS_COARSE_LOCATION`);
  sh(`shell settings put secure location_mode 3`);
  try {
    sh('emu geo fix 105.8342 21.0278');
  } catch (_) {}

  const start = spawnSync(
    adbBin,
    [
      '-s',
      SERIAL,
      'shell',
      'am',
      'start',
      '-a',
      'android.intent.action.VIEW',
      '-d',
      deeplink,
      '-n',
      `${PKG}/.MainActivity`,
    ],
    { encoding: 'utf8' },
  );
  const startOut = `${start.stdout || ''}${start.stderr || ''}`;
  if (start.status !== 0 && !/delivered to currently running/i.test(startOut)) {
    throw new Error(`am start failed: ${startOut}`);
  }
  sleep(12000);

  fs.appendFileSync(proxyLog, `\n# MOB04_DEEPLINK_RUN ${new Date().toISOString()}\n`, 'utf8');

  sh('shell uiautomator dump /sdcard/uidump.xml');
  sh(`pull /sdcard/uidump.xml "${path.join(OUT, 'deeplink-home.xml')}"`);
  let xml = fs.readFileSync(path.join(OUT, 'deeplink-home.xml'), 'utf8');

  const tap = (x, y) => sh(`shell input tap ${x} ${y}`);
  if (xml.includes('home-action-tile-checkin')) {
    tap(162, 549);
  } else {
    tap(540, 2209);
    sleep(2000);
    tap(540, 500);
  }
  sleep(3000);
  sh('shell uiautomator dump /sdcard/uidump.xml');
  sh(`pull /sdcard/uidump.xml "${path.join(OUT, 'checkin-pre-submit.xml')}"`);
  xml = fs.readFileSync(path.join(OUT, 'checkin-pre-submit.xml'), 'utf8');

  if (xml.includes('check-in-channel-gps')) {
    const m = xml.match(/check-in-channel-gps[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (m) tap(Math.floor((+m[1] + +m[3]) / 2), Math.floor((+m[2] + +m[4]) / 2));
    sleep(800);
  }

  sh('logcat -c');
  fs.appendFileSync(proxyLog, `# MOB04_SUBMIT_WINDOW ${new Date().toISOString()}\n`, 'utf8');

  const sm = xml.match(/check-in-submit[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
  if (!sm) throw new Error('check-in-submit not found');
  tap(Math.floor((+sm[1] + +sm[3]) / 2), Math.floor((+sm[2] + +sm[4]) / 2));
  sleep(8000);

  const logOut = sh('logcat -d ReactNativeJS:I *:S');
  fs.writeFileSync(path.join(OUT, 'logcat-mob04-post.txt'), logOut, 'utf8');

  const proxyText = fs.readFileSync(proxyLog, 'utf8');
  const post2xx =
    /POST \/api\/hrm\/attendance\/records/i.test(proxyText) &&
    /-> status=20[0-9]/.test(proxyText);
  const hrmMobPost = logOut.split('\n').filter((l) => /POST.*attendance\/records/i.test(l));

  const result = {
    deeplink_base: base,
    proxy_post_2xx: post2xx,
    hrm_mob_post_lines: hrmMobPost,
    proxy_tail: proxyText.split('\n').slice(-25),
  };
  fs.writeFileSync(path.join(OUT, 'mob04-net-result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  process.exit(post2xx ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
