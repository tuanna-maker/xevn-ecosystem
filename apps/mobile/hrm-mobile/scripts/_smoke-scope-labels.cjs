/**
 * Device smoke: password login → Profile → Settings → Scope; assert W1-B-04 labels.
 * U65: no seed. Uses live /auth/mobile/login via app UI (not deep-link stub memberships).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const adbBin =
  process.env.ADB ||
  path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const SERIAL = process.env.ANDROID_SERIAL || 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const OUT = path.join(os.tmpdir(), 'w1b04-scope-smoke');
fs.mkdirSync(OUT, { recursive: true });

function sh(args) {
  return execSync(`"${adbBin}" -s ${SERIAL} ${args}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024,
  });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function dump(name) {
  sh('shell uiautomator dump /sdcard/uidump.xml');
  const local = path.join(OUT, `${name}.xml`);
  sh(`pull /sdcard/uidump.xml "${local}"`);
  return fs.readFileSync(local, 'utf8');
}

function texts(xml) {
  const out = [];
  const re = /text="([^"]*)"/g;
  let m;
  while ((m = re.exec(xml))) {
    if (m[1]) out.push(m[1].replace(/&amp;/g, '&').replace(/&#10;/g, '\n'));
  }
  return out;
}

function findBounds(xml, pred) {
  const nodes = xml.split('<node ').slice(1);
  for (const chunk of nodes) {
    const t = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const desc = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const node = {
      text: t.replace(/&amp;/g, '&'),
      desc,
      rid,
      x: Math.floor((+b[1] + +b[3]) / 2),
      y: Math.floor((+b[2] + +b[4]) / 2),
    };
    if (pred(node)) return node;
  }
  return null;
}

function tap(node) {
  if (!node) throw new Error('tap target missing');
  sh(`shell input tap ${node.x} ${node.y}`);
}

function setField(node, value) {
  tap(node);
  sleep(300);
  sh('shell input keyevent 123'); // move end
  // clear roughly
  for (let i = 0; i < 40; i++) sh('shell input keyevent 67');
  // adb shell input text — escape spaces
  const escaped = value.replace(/([\\ '&<>|])/g, '\\$1').replace(/ /g, '%s');
  sh(`shell input text ${escaped}`);
}

function main() {
  sh('reverse tcp:28001 tcp:28001');
  sh(`shell pm clear ${PKG}`);
  sleep(800);
  sh(`shell am start -n ${PKG}/.MainActivity`);

  let xml = '';
  let editTexts = [];
  for (let attempt = 0; attempt < 12; attempt++) {
    sleep(2500);
    xml = dump(`00-launch-${attempt}`);
    editTexts = [];
    {
      const nodes = xml.split('<node ').slice(1);
      for (const chunk of nodes) {
        if (!chunk.includes('class="android.widget.EditText"')) continue;
        const t = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
        const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
        if (!b) continue;
        editTexts.push({
          text: t,
          x: Math.floor((+b[1] + +b[3]) / 2),
          y: Math.floor((+b[2] + +b[4]) / 2),
        });
      }
    }
    if (editTexts.length >= 2) break;
    // dismiss splash / expand dev panel
    const devToggle = findBounds(xml, (n) => /đăng nhập dev|URL máy chủ/i.test(n.text));
    if (devToggle) tap(devToggle);
  }
  console.log('editTexts', editTexts.map((e) => e.text));

  // Heuristic: [email, password, url?, tenant?, company?] — from dump order
  // From launch dump: Email, password, URL, tenantId, companyId fields exist
  if (editTexts.length < 2) throw new Error('login fields missing');

  // Find email field (hint name@company.com or empty near Email)
  const email =
    editTexts.find((e) => e.text.includes('@') || e.text.includes('name@')) || editTexts[0];
  const password =
    editTexts.find((e) => e !== email && (e.text === '' || /•|●|\*/.test(e.text))) ||
    editTexts[1];
  const url =
    editTexts.find((e) => e.text.includes('http') || e.text.includes('14.225') || e.text.includes('28001')) ||
    editTexts[2];

  if (url) setField(url, 'http://10.0.2.2:28001');
  sleep(400);
  setField(email, 'uat.nv0001@xe.vn');
  sleep(400);
  setField(password, 'xevn-uat-2026');
  sleep(400);

  xml = dump('02-filled');
  const loginBtn = findBounds(xml, (n) => /^Đăng nhập$/i.test(n.text) || n.text === 'Đăng nhập');
  tap(loginBtn);
  sleep(8000);

  xml = dump('03-after-login');
  const homeOk = texts(xml).some((t) =>
    /Trang chủ|Chào|Việc cần làm|Nguyễn|Đồng nghiệp|Hồ sơ/i.test(t),
  );
  console.log('home_ok', homeOk, 'sample', texts(xml).slice(0, 20));

  // Tap Hồ sơ tab
  let profile =
    findBounds(xml, (n) => n.text === 'Hồ sơ' || n.desc === 'Hồ sơ') ||
    findBounds(xml, (n) => /Hồ sơ|Profile/i.test(n.text));
  if (!profile) {
    // bottom tab often content-desc
    profile = findBounds(xml, (n) => /Hồ sơ/i.test(n.desc));
  }
  if (!profile) throw new Error('profile tab not found');
  tap(profile);
  sleep(2500);
  xml = dump('04-profile');

  const settings =
    findBounds(xml, (n) => /Cài đặt|Settings/i.test(n.text) || /Cài đặt/i.test(n.desc));
  if (!settings) throw new Error('settings entry not found');
  tap(settings);
  sleep(2000);
  xml = dump('05-settings');

  const scope = findBounds(
    xml,
    (n) => /Phạm vi công ty|Phạm vi/i.test(n.text) || /Phạm vi/i.test(n.desc),
  );
  if (!scope) throw new Error('scope entry not found');
  tap(scope);
  sleep(2500);
  xml = dump('06-scope');
  const all = texts(xml).join('\n');
  fs.writeFileSync(path.join(OUT, '06-scope-texts.txt'), all, 'utf8');

  const hasPhapNhan = /Pháp nhân/.test(all);
  const hasVaiTro = /Vai trò/.test(all);
  const hasChucDanh = /Chức danh/.test(all);
  const hasCongTy = /Công ty:/.test(all);
  const rawTenant = /Tenant:\s*xevn/i.test(all) || /Tenant: xevn/.test(all);
  const rawHolding = /Query company_id:\s*holding/i.test(all) && !/Tenant key/.test(all);

  const result = {
    work_item_id: 'W1-B-04-AUTH-MOB-BUILD-01',
    out_dir: OUT,
    home_ok: homeOk,
    scope_has: {
      company: hasCongTy,
      phap_nhan: hasPhapNhan,
      vai_tro: hasVaiTro,
      chuc_danh: hasChucDanh,
    },
    stale_raw_tenant_line: rawTenant,
    scope_texts_sample: texts(xml).filter((t) =>
      /Công ty|Pháp|Vai|Chức|Tenant|Đang dùng|holding|xevn/i.test(t),
    ),
    pass: homeOk && hasCongTy && hasPhapNhan && hasVaiTro && hasChucDanh && !rawTenant,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.pass ? 0 : 1);
}

main();
