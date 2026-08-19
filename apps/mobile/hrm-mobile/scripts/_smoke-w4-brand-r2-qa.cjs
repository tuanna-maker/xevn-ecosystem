/**
 * PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2 — J-MOB-01/02 · MOB-04/04b device smoke
 * U65: UI login uat.nv0001@xe.vn · dev URL panel → 10.0.2.2:28001 (no seed)
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const adbBin =
  process.env.ADB ||
  path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const SERIAL = process.env.ANDROID_SERIAL || 'emulator-5554';
const PKG = 'vn.xevn.hrm.mobile';
const REPO = path.resolve(__dirname, '..', '..', '..', '..');
const OUT = path.join(REPO, 'docs', 'qa', 'evidence', 'screenshots', 'po-hrm-ui-brand-w4-mob-a-qa-01-r2');
fs.mkdirSync(OUT, { recursive: true });

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R2',
  out_dir: OUT,
  testids: {},
  journeys: {},
  mob04: {},
};

function sh(args, opts = {}) {
  return execSync(`"${adbBin}" -s ${SERIAL} ${args}`, {
    encoding: 'utf8',
    stdio: opts.silent ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'pipe', 'inherit'],
    maxBuffer: 25 * 1024 * 1024,
  });
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function screenshot(name) {
  const local = path.join(OUT, `${name}.png`);
  const buf = execSync(`"${adbBin}" -s ${SERIAL} exec-out screencap -p`, {
    maxBuffer: 15 * 1024 * 1024,
  });
  fs.writeFileSync(local, buf);
  return local;
}

function dump(name) {
  sh('shell uiautomator dump /sdcard/uidump.xml', { silent: true });
  const local = path.join(OUT, `${name}.xml`);
  sh(`pull /sdcard/uidump.xml "${local}"`, { silent: true });
  return fs.readFileSync(local, 'utf8');
}

function dismissSystemDialogs() {
  for (let i = 0; i < 3; i++) {
    let xml = '';
    try {
      xml = dump(`perm-${i}`);
    } catch {
      return;
    }
    const allow = findBounds(xml, (n) => n.text === 'Allow' || n.text === 'Cho phép');
    const whileUsing =
      findBounds(xml, (n) => /While using the app|While using|Only this time|Chỉ khi/i.test(n.text)) ||
      findBounds(xml, (n) => n.rid.includes('permission_allow_foreground_only_button'));
    if (allow) {
      tap(allow);
      sleep(800);
      continue;
    }
    if (whileUsing) {
      tap(whileUsing);
      sleep(800);
    } else break;
  }
}

function dumpWithRetry(name, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return dump(name);
    } catch (e) {
      sleep(1200);
      if (i === tries - 1) throw e;
    }
  }
  return '';
}

function hasTestId(xml, id) {
  return (
    xml.includes(`content-desc="${id}"`) ||
    xml.includes(`resource-id="${id}"`) ||
    xml.includes(`resource-id="${PKG}:id/${id}"`) ||
    xml.includes(`"${id}"`)
  );
}

function nodeEnabled(xml, testId) {
  const chunk = xml.split('<node ').find((c) => c.includes(`resource-id="${testId}"`));
  if (!chunk) return null;
  const m = chunk.match(/enabled="(true|false)"/);
  return m ? m[1] === 'true' : null;
}

function texts(xml) {
  const out = [];
  const re = /text="([^"]*)"/g;
  let m;
  while ((m = re.exec(xml))) {
    if (m[1]) out.push(m[1].replace(/&amp;/g, '&'));
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
      desc: desc.replace(/&amp;/g, '&'),
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
  sh(`shell input tap ${node.x} ${node.y}`, { silent: true });
}

function setField(node, value) {
  tap(node);
  sleep(300);
  sh('shell input keyevent 123', { silent: true });
  for (let i = 0; i < 48; i++) sh('shell input keyevent 67', { silent: true });
  const escaped = value.replace(/ /g, '%s');
  sh(`shell input text ${escaped}`, { silent: true });
}

function editTextsFrom(xml) {
  const editTexts = [];
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
  return editTexts;
}

function main() {
  sh('reverse tcp:28001 tcp:28001', { silent: true });
  try {
    sh(`shell pm grant ${PKG} android.permission.ACCESS_FINE_LOCATION`, { silent: true });
    sh(`shell pm grant ${PKG} android.permission.ACCESS_COARSE_LOCATION`, { silent: true });
  } catch (_) {
    /* ignore */
  }
  sh('shell settings put secure location_mode 3', { silent: true });
  try {
    sh('emu geo fix 105.8342 21.0278', { silent: true });
  } catch (_) {
    /* non-emulator or older adb */
  }

  sh(`shell pm clear ${PKG}`, { silent: true });
  sleep(900);
  sh(`shell am start -n ${PKG}/.MainActivity`, { silent: true });

  let xml = '';
  let editTexts = [];
  for (let attempt = 0; attempt < 14; attempt++) {
    sleep(2500);
    xml = dumpWithRetry(`01-launch-${attempt}`);
    editTexts = editTextsFrom(xml);
    const devToggle = findBounds(xml, (n) => /đăng nhập dev|URL máy chủ/i.test(n.text));
    if (devToggle) tap(devToggle);
    if (editTexts.length >= 2) break;
  }

  dismissSystemDialogs();

  const devToggle =
    findBounds(xml, (n) => /đăng nhập dev/i.test(n.text) || /đăng nhập dev/i.test(n.desc)) ||
    findBounds(xml, (n) => n.desc.includes('JWT'));
  if (devToggle) {
    tap(devToggle);
    sleep(1500);
    xml = dumpWithRetry('01b-dev-expanded');
    editTexts = editTextsFrom(xml);
  }
  results.testids.branded_login_card = hasTestId(xml, 'branded-login-card');
  results.testids.brand_dialog_chrome = hasTestId(xml, 'brand-dialog-chrome');
  screenshot('02-login');

  editTexts = editTextsFrom(xml);
  const urlField =
    editTexts.find((e) => /http|14\.225|28001/i.test(e.text)) || editTexts[2];
  const email = editTexts.find((e) => e.text.includes('@') || e.text.includes('name@')) || editTexts[0];
  const password =
    editTexts.find((e) => e !== email && e !== urlField) || editTexts[1];

  if (urlField) setField(urlField, 'http://10.0.2.2:28001');
  sleep(400);
  xml = dumpWithRetry('02c-after-url');

  const emailNode = findBounds(xml, (n) => n.rid === 'login-email') || email;
  const passNode = findBounds(xml, (n) => n.rid === 'login-password') || password;
  setField(emailNode, 'uat.nv0001@xe.vn');
  sleep(400);
  setField(passNode, 'xevn-uat-2026');
  sleep(400);

  xml = dumpWithRetry('03-filled');
  dismissSystemDialogs();
  xml = dumpWithRetry('03-filled-post-dismiss');
  const loginBtn =
    findBounds(xml, (n) => n.rid === 'login-submit') ||
    findBounds(xml, (n) => n.desc === 'Đăng nhập') ||
    findBounds(xml, (n) => /^Đăng nhập$/i.test(n.text));
  if (!loginBtn) throw new Error('login-submit not found — see 03-filled-post-dismiss.xml');
  tap(loginBtn);
  sleep(10000);
  dismissSystemDialogs();

  xml = dumpWithRetry('04-home');
  screenshot('04-home');
  results.testids.home_top_bar_brand_accent = hasTestId(xml, 'home-top-bar-brand-accent');
  results.testids.dashboard_attendance_brand_bar = hasTestId(xml, 'dashboard-attendance-brand-bar');
  const homeTexts = texts(xml);
  results.journeys['J-MOB-01'] = {
    pass:
      results.testids.home_top_bar_brand_accent &&
      (results.testids.dashboard_attendance_brand_bar ||
        homeTexts.some((t) => /Chấm công|Trang chủ|Việc cần làm/i.test(t))),
    home_sample: homeTexts.slice(0, 25),
  };

  let fab =
    findBounds(xml, (n) => n.rid === 'check-in-fab' || n.rid.endsWith('/check-in-fab')) ||
    findBounds(xml, (n) => n.desc === 'Thao tác nhanh') ||
    findBounds(xml, (n) => n.desc === 'check-in-fab');
  if (!fab) {
    // center-bottom FAB heuristic
    fab = findBounds(
      xml,
      (n) =>
        n.y > 1800 &&
        (n.desc.includes('Thao tác') || n.rid.includes('check-in-fab') || n.text === ''),
    );
  }
  tap(fab);
  sleep(2000);
  xml = dumpWithRetry('05-fab-sheet');
  if (!hasTestId(xml, 'fab-primary-action-sheet')) {
    xml = dumpWithRetry('04-home-retap');
    const tile =
      findBounds(xml, (n) => n.rid === 'home-action-tile-checkin') ||
      findBounds(xml, (n) => n.desc === 'Chấm công' && n.y < 700);
    if (tile) {
      tap(tile);
      sleep(2500);
      xml = dumpWithRetry('05-fab-sheet');
    }
  }
  screenshot('05-fab-sheet');
  results.testids.fab_primary_action_sheet = hasTestId(xml, 'fab-primary-action-sheet');
  results.testids.fab_action_check_in = hasTestId(xml, 'fab-action-check-in');

  if (!hasTestId(xml, 'check-in-channel-gps')) {
    const checkInRow =
      findBounds(xml, (n) => n.rid === 'fab-action-check-in') ||
      findBounds(xml, (n) => n.desc === 'fab-action-check-in' || n.text === 'Chấm công') ||
      findBounds(xml, (n) => /Chấm công/i.test(n.text) && n.y > 400);
    if (!checkInRow) throw new Error('fab-action-check-in row missing');
    tap(checkInRow);
    sleep(2000);
  }
  for (let i = 0; i < 5; i++) {
    dismissSystemDialogs();
    sleep(600);
  }
  sleep(2000);

  xml = dumpWithRetry('06-checkin-gps');
  screenshot('06-checkin-gps');
  results.testids.check_in_channel_gps = hasTestId(xml, 'check-in-channel-gps');
  results.testids.check_in_channel_face = hasTestId(xml, 'check-in-channel-face-mvp');
  results.journeys['J-MOB-02'] = {
    pass:
      results.testids.fab_primary_action_sheet &&
      results.testids.fab_action_check_in &&
      results.testids.check_in_channel_gps,
  };

  const faceChip =
    findBounds(xml, (n) => n.rid === 'check-in-channel-face-mvp') ||
    findBounds(xml, (n) => /Face|MVP|Khuôn mặt/i.test(n.text));
  if (faceChip) {
    tap(faceChip);
    sleep(1500);
  }
  xml = dumpWithRetry('07-checkin-face');
  screenshot('07-checkin-face');
  results.testids.face_mvp_honesty_banner = hasTestId(xml, 'face-mvp-honesty-banner');
  const submitEnabled = nodeEnabled(xml, 'check-in-submit');
  results.mob04b = {
    honesty_banner: results.testids.face_mvp_honesty_banner,
    submit_disabled_hint: submitEnabled === false,
    face_live_claimed: false,
  };

  const gpsChip =
    findBounds(xml, (n) => n.rid === 'check-in-channel-gps') ||
    findBounds(xml, (n) => /GPS|Vị trí/i.test(n.text));
  if (gpsChip) {
    tap(gpsChip);
    sleep(800);
  }
  xml = dumpWithRetry('08-checkin-gps-ready');
  screenshot('08-checkin-gps-ready');

  const logPath = path.join(OUT, 'logcat-submit.txt');
  const proxyLog = path.join(
    REPO,
    'docs',
    'qa',
    'evidence',
    'screenshots',
    'po-hrm-ui-brand-w4-mob-a-qa-01-r2-mob04-net',
    'hrm-proxy-access.log',
  );
  fs.writeFileSync(logPath, '', 'utf8');
  spawnSync(`"${adbBin}"`, ['-s', SERIAL, 'logcat', '-c'], { shell: true, encoding: 'utf8' });
  if (fs.existsSync(proxyLog)) {
    fs.appendFileSync(proxyLog, `\n# MOB04_SUBMIT_WINDOW ${new Date().toISOString()}\n`, 'utf8');
  }
  const submitBtn =
    findBounds(xml, (n) => n.rid === 'check-in-submit') ||
    findBounds(xml, (n) => /Chấm công vào|Ghi nhận giờ vào/i.test(n.text));
  const gpsSubmitEnabled = nodeEnabled(xml, 'check-in-submit');
  let mob04Post = { attempted: false, log_snippet: '', proxy_snippet: '' };
  if (submitBtn && gpsSubmitEnabled !== false) {
    mob04Post.attempted = true;
    tap(submitBtn);
    sleep(6000);
    screenshot('09-after-gps-submit');
    xml = dumpWithRetry('09-after-gps-submit');
    const logOut = execSync(`"${adbBin}" -s ${SERIAL} logcat -d ReactNativeJS:I *:S`, {
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    });
    fs.writeFileSync(logPath, logOut, 'utf8');
    mob04Post.log_snippet = logOut
      .split('\n')
      .filter((l) => /attendance\/records|HRM-MOB.*POST/i.test(l))
      .slice(-20)
      .join('\n');
    if (fs.existsSync(proxyLog)) {
      const proxyTail = fs.readFileSync(proxyLog, 'utf8').split('\n').slice(-30).join('\n');
      mob04Post.proxy_snippet = proxyTail;
      mob04Post.proxy_post_2xx =
        /POST \/api\/hrm\/attendance\/records/i.test(proxyTail) &&
        /-> status=20[0-9]/.test(proxyTail);
    }
    mob04Post.ui_toast = texts(xml).some((t) => /thành công|đã ghi|HRM-ATT/i.test(t));
  }
  results.mob04 = mob04Post;

  const allPass =
    results.journeys['J-MOB-01']?.pass &&
    results.journeys['J-MOB-02']?.pass &&
    results.mob04b.honesty_banner &&
    results.mob04b.submit_disabled_hint;

  results.verdict = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  fs.writeFileSync(path.join(OUT, 'device-result.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log(JSON.stringify(results, null, 2));
  process.exit(allPass ? 0 : 1);
}

main();
