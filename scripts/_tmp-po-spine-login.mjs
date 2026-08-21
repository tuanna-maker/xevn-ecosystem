#!/usr/bin/env node
/** One-shot QA login: host fetch :28001, emulator base_url 10.0.2.2:28001 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const sdk = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const HOST_API = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMU_API = process.env.HRM_EMU_API || 'http://10.0.2.2:28001';
const EMAIL = process.argv.includes('--email')
  ? process.argv[process.argv.indexOf('--email') + 1]
  : 'uat.nv0001@xe.vn';
const PASSWORD = process.argv.includes('--password')
  ? process.argv[process.argv.indexOf('--password') + 1]
  : 'xevn-uat-2026';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = 'docs/qa/evidence/screens/po-e2e-spine-02-03-mob-qa-w1';

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

const HOME_MARKERS = ['Chào buổi', 'Trang chủ', 'Xin chào', 'Việc cần làm', 'Đi làm', 'Đồng nghiệp', 'Thông báo'];

function findBounds(xml, pattern) {
  const m = xml.match(pattern);
  if (!m) return null;
  return { x: Math.floor((+m[1] + +m[3]) / 2), y: Math.floor((+m[2] + +m[4]) / 2) };
}

async function dismissPerm() {
  try {
    sh(`"${sdk}" shell uiautomator dump /sdcard/qa-perm.xml`);
    sh(`"${sdk}" pull /sdcard/qa-perm.xml ${OUT}/_perm.xml`);
    const xml = readFileSync(`${OUT}/_perm.xml`, 'utf8');
    if (!xml.includes('permissioncontroller')) return;
    const deny =
      findBounds(
        xml,
        /resource-id="com\.android\.permissioncontroller:id\/permission_deny_button"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/,
      ) ??
      findBounds(xml, /text="Don't allow"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/) ??
      findBounds(xml, /text="Không cho phép"[^>]*bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (deny) {
      sh(`"${sdk}" shell input tap ${deny.x} ${deny.y}`);
      await sleep(1000);
    }
  } catch {
    /* ignore */
  }
}

async function waitHome(ms = 45000) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    await dismissPerm();
    try {
      sh(`"${sdk}" shell uiautomator dump /sdcard/qa-home.xml`);
      sh(`"${sdk}" pull /sdcard/qa-home.xml ${OUT}/01-home.xml`);
      const xml = readFileSync(`${OUT}/01-home.xml`, 'utf8');
      const hit = HOME_MARKERS.find((m) => xml.includes(m));
      if (hit) return { ok: true, hit, xml };
    } catch {
      /* retry */
    }
    await sleep(2000);
  }
  return { ok: false, hit: null, xml: '' };
}

const res = await fetch(`${HOST_API}/api/hrm/auth/mobile/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const j = await res.json();
if (!j.success) {
  console.error(JSON.stringify({ pass: false, error: j.code || res.status }));
  process.exit(1);
}
const d = j.data;
const a = d.active_membership ?? d.memberships?.[0] ?? {};
const session = {
  token: d.access_token,
  refresh: d.refresh_token ?? '',
  tenant: a.tenant_id ?? d.default_tenant_id,
  company: a.company_id ?? d.default_company_id ?? 'holding',
  uuid: a.company_uuid ?? d.company_uuid ?? '',
  emp: a.employee_id ?? d.employee?.id ?? '',
  company_label: a.company_label ?? '',
  tenant_label: a.tenant_label ?? '',
  role_label: a.role_label ?? '',
  job_title_label: a.job_title_label ?? '',
  employee_code: a.employee_code ?? '',
  employee_name: a.employee_name ?? '',
};
mkdirSync(OUT, { recursive: true });
writeFileSync(
  `${OUT}/_session.json`,
  JSON.stringify(
    {
      email: EMAIL,
      host_api: HOST_API,
      emu_api: EMU_API,
      company_id: session.company,
      company_uuid: session.uuid,
      employee_id: session.emp,
      company_label: session.company_label,
      role_label: session.role_label,
      access_token: session.token,
    },
    null,
    2,
  ),
);

const q = new URLSearchParams({
  access_token: session.token,
  refresh_token: session.refresh,
  tenant_id: session.tenant,
  company_id: session.company,
  company_uuid: session.uuid,
  employee_id: session.emp,
  base_url: EMU_API,
  company_label: session.company_label,
  tenant_label: session.tenant_label,
  role_label: session.role_label,
  job_title_label: session.job_title_label,
  employee_code: session.employee_code,
  employee_name: session.employee_name,
});
const deep = `xevn://qa-login?${q.toString()}`;

sh(`"${sdk}" shell am force-stop ${PKG}`);
await sleep(800);
sh(`"${sdk}" logcat -c`);
const r = spawnSync(
  sdk,
  ['shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-n', `${PKG}/.MainActivity`, '-d', deep],
  { encoding: 'utf8' },
);
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(1);
}
await sleep(3500);
const home = await waitHome();
sh(`"${sdk}" exec-out screencap -p > ${OUT}/01-home.png`.replace(' > ', ' '));
try {
  execSync(`"${sdk}" exec-out screencap -p`, { encoding: 'buffer', maxBuffer: 20e6, stdio: ['ignore', 'pipe', 'pipe'] });
} catch {
  /* fallback below */
}
spawnSync(sdk, ['exec-out', 'screencap', '-p'], {
  encoding: 'buffer',
  maxBuffer: 20e6,
  stdio: ['ignore', 'pipe', 'pipe'],
});
const shot = spawnSync(sdk, ['exec-out', 'screencap', '-p'], { maxBuffer: 20e6, encoding: 'buffer' });
if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/01-home.png`, shot.stdout);

const out = {
  pass: home.ok,
  email: EMAIL,
  host_api: HOST_API,
  emu_api: EMU_API,
  home_marker: home.hit,
  company_uuid: session.uuid,
  company_id: session.company,
};
console.log(JSON.stringify(out, null, 2));
process.exit(home.ok ? 0 : 1);
