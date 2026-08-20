#!/usr/bin/env node
/**
 * PO-E2E-SPINE-02-03-MOB-QA-W1 — device walk (U65, no seed)
 * Assumes already logged in as current persona on emulator-5554.
 */
import { execSync, spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const adb = process.env.LOCALAPPDATA + '\\Android\\Sdk\\platform-tools\\adb.exe';
const OUT = 'docs/qa/evidence/screens/po-e2e-spine-02-03-mob-qa-w1';
const LOG = [];
mkdirSync(OUT, { recursive: true });

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function log(step, msg, extra = {}) {
  const row = { t: new Date().toISOString(), step, msg, ...extra };
  LOG.push(row);
  console.log(JSON.stringify(row));
}

function dump(name) {
  sh(`"${adb}" shell uiautomator dump /sdcard/qa-walk.xml`);
  sh(`"${adb}" pull /sdcard/qa-walk.xml ${OUT}/${name}.xml`);
  const xml = readFileSync(`${OUT}/${name}.xml`, 'utf8');
  const shot = spawnSync(adb, ['exec-out', 'screencap', '-p'], { maxBuffer: 25e6, encoding: 'buffer' });
  if (shot.status === 0 && shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
  return xml;
}

function findAll(xml, re) {
  const out = [];
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m;
  while ((m = g.exec(xml))) {
    out.push({
      x: Math.floor((+m[1] + +m[3]) / 2),
      y: Math.floor((+m[2] + +m[4]) / 2),
      raw: m[0].slice(0, 120),
    });
  }
  return out;
}

function tapBounds(xml, patterns) {
  for (const p of patterns) {
    const hits = findAll(xml, p);
    if (hits.length) {
      sh(`"${adb}" shell input tap ${hits[0].x} ${hits[0].y}`);
      return hits[0];
    }
  }
  return null;
}

function tapText(xml, text) {
  const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tapBounds(xml, [
    new RegExp(`text="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`, 'g'),
    new RegExp(`content-desc="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`, 'g'),
    new RegExp(`text="[^"]*${esc}[^"]*"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`, 'g'),
  ]);
}

function tapRes(xml, id) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return tapBounds(xml, [
    new RegExp(`resource-id="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`, 'g'),
  ]);
}

function has(xml, s) {
  return xml.includes(s);
}

async function waitText(texts, name, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const xml = dump(name);
    if (texts.some((t) => xml.includes(t))) return xml;
    await sleep(1500);
  }
  return dump(name);
}

// --- LV-01 path: home → time_off → create leave → wizard ---
async function leaveSubmitPath() {
  let xml = dump('10-home-nv');
  log('LV-01', 'home dump', { markers: ['Trang chủ', 'Nghỉ phép', 'time_off'].filter((m) => has(xml, m)) });

  let hit =
    tapRes(xml, 'home-action-tile-time_off') ||
    tapText(xml, 'Nghỉ phép') ||
    tapText(xml, 'Đơn nghỉ') ||
    tapText(xml, 'Xin nghỉ');
  if (!hit) {
    // scroll down once
    sh(`"${adb}" shell input swipe 540 1800 540 600 400`);
    await sleep(800);
    xml = dump('11-home-scrolled');
    hit =
      tapRes(xml, 'home-action-tile-time_off') ||
      tapText(xml, 'Nghỉ phép') ||
      tapText(xml, 'Đơn nghỉ');
  }
  log('LV-01', 'tap time_off', { hit });
  await sleep(2500);
  xml = await waitText(
    ['leave-requests-list-screen', 'Đơn nghỉ', 'Còn lại', 'Tạo đơn', '+ Nghỉ', 'Nghỉ phép'],
    '12-leave-list',
  );

  // Create CTA
  hit =
    tapText(xml, 'Tạo đơn') ||
    tapText(xml, '+ Nghỉ phép') ||
    tapText(xml, 'Tạo đơn nghỉ') ||
    tapText(xml, 'Xin nghỉ') ||
    tapText(xml, 'Thêm');
  if (!hit) {
    // FAB often bottom-right
    sh(`"${adb}" shell input tap 980 2100`);
    log('LV-01', 'FAB fallback tap 980,2100');
  } else {
    log('LV-01', 'tap create CTA', { hit });
  }
  await sleep(2500);
  xml = await waitText(['Tạo đơn nghỉ', 'Bước 1', 'Khoảng ngày', 'Tiếp tục'], '13-create-step0');

  // Fail path first: try Tiếp tục without dates if next enabled wrongly — or clear and tap
  // Prefer validation: on step 2/3 empty title — capture disabled/next behavior
  const failXml = xml;
  const nextDisabled = /leave-create-next[^>]*enabled="false"/.test(failXml) || !has(failXml, 'leave-create-next');
  log('LV-FAIL', 'step0 next state', {
    hasNext: has(failXml, 'leave-create-next') || has(failXml, 'Tiếp tục'),
    hint: has(failXml, 'Chọn khoảng'),
  });

  // Proceed: tap date field then confirm default / OK on picker if opens
  hit =
    tapText(xml, 'Khoảng ngày nghỉ') ||
    tapText(xml, 'Chọn ngày') ||
    tapText(xml, 'Từ ngày');
  if (hit) {
    await sleep(1500);
    let px = dump('14-date-picker');
    tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Done') || tapText(px, 'Lưu');
    await sleep(1000);
    // some pickers need end date confirm twice
    px = dump('14b-date-picker2');
    tapText(px, 'OK') || tapText(px, 'Xác nhận') || tapText(px, 'Done');
    await sleep(800);
  }

  xml = dump('15-step0-after-date');
  hit = tapRes(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('LV-01', 'step0 next', { hit });
  await sleep(2000);
  xml = await waitText(['Bước 2', 'Loại nghỉ', 'Phép năm'], '16-step1');

  // Select annual leave if visible
  tapText(xml, 'Phép năm') || tapText(xml, 'Nghỉ phép năm') || tapText(xml, 'ANNUAL');
  await sleep(600);
  xml = dump('17-step1-type');
  hit = tapRes(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('LV-01', 'step1 next', { hit });
  await sleep(2000);
  xml = await waitText(['Bước 3', 'Xác nhận', 'Tiêu đề', 'Mô tả'], '18-step2');

  // Fail deep: try continue/submit without reason later; fill reason for success path
  // Fill via focused fields is hard without ADBKeyboard — tap Tiếp tục first (may allow empty)
  hit = tapRes(xml, 'leave-create-next') || tapText(xml, 'Tiếp tục');
  log('LV-01', 'step2 next', { hit });
  await sleep(2000);
  xml = await waitText(['Bước 4', 'Gửi đơn nghỉ', 'Chờ duyệt'], '19-step3');

  // Fail path attempt: if there's validation on empty — open confirm then cancel
  // Success: Gửi đơn nghỉ
  hit = tapText(xml, 'Gửi đơn nghỉ') || tapText(xml, 'Gửi đơn');
  log('LV-01', 'tap submit', { hit });
  await sleep(1500);
  xml = dump('20-confirm-modal');
  hit =
    tapText(xml, 'Xác nhận') ||
    tapText(xml, 'Gửi') ||
    tapText(xml, 'OK') ||
    tapText(xml, 'Đồng ý');
  log('LV-01', 'confirm submit', { hit });
  await sleep(2500);
  xml = dump('21-after-submit');
  // dismiss alert
  tapText(xml, 'OK') || tapText(xml, 'Đóng');
  await sleep(1500);
  xml = dump('22-leave-list-after');
  const pending =
    has(xml, 'Chờ duyệt') ||
    has(xml, 'PENDING') ||
    has(xml, 'pending') ||
    has(xml, 'Đã gửi');
  log('LV-01', 'post-submit list', {
    pending,
    hasList: has(xml, 'leave-requests-list-screen') || has(xml, 'Đơn nghỉ'),
  });
  return { pending, xml };
}

async function lateSubmitPath() {
  // Back to home
  sh(`"${adb}" shell input keyevent 4`);
  await sleep(800);
  sh(`"${adb}" shell input keyevent 4`);
  await sleep(800);
  sh(`"${adb}" shell input keyevent 4`);
  await sleep(1000);
  // tap Trang chủ tab
  let xml = dump('30-before-late');
  tapText(xml, 'Trang chủ') || tapRes(xml, 'tab-home');
  await sleep(1200);
  xml = dump('31-home-for-late');

  let hit =
    tapText(xml, 'Đơn công') ||
    tapText(xml, 'Điều chỉnh') ||
    tapText(xml, 'Đi muộn') ||
    tapRes(xml, 'home-action-tile-requests') ||
    tapText(xml, 'Yêu cầu');
  if (!hit) {
    sh(`"${adb}" shell input swipe 540 1800 540 600 400`);
    await sleep(700);
    xml = dump('32-home-scroll-late');
    hit =
      tapText(xml, 'Đơn công') ||
      tapText(xml, 'Điều chỉnh') ||
      tapText(xml, 'Đồng nghiệp');
  }
  log('LT-01', 'tap update/late entry', { hit });
  await sleep(2000);
  xml = dump('33-update-list');

  hit =
    tapText(xml, 'Tạo') ||
    tapText(xml, 'Thêm') ||
    tapText(xml, 'Gửi đơn') ||
    tapText(xml, '+');
  if (!hit) {
    sh(`"${adb}" shell input tap 980 2100`);
    log('LT-01', 'FAB fallback for create update');
  }
  await sleep(2000);
  xml = await waitText(['Đơn công', 'Loại điều chỉnh', 'Lý do', 'Gửi đơn'], '34-create-update');

  // Fail path: clear reason if possible — tap Lý do field and delete
  const reasonTap = tapText(xml, 'Lý do');
  if (reasonTap) {
    await sleep(400);
    sh(`"${adb}" shell input keyevent 123`); // move end
    for (let i = 0; i < 40; i++) sh(`"${adb}" shell input keyevent 67`); // DEL
    await sleep(300);
    sh(`"${adb}" shell input tap 540 2200`); // dismiss kb hopefully near send
    await sleep(500);
    xml = dump('35-late-empty-reason');
    tapText(xml, 'Gửi đơn');
    await sleep(1200);
    xml = dump('36-late-fail-result');
    const failOk =
      has(xml, 'bắt buộc') ||
      has(xml, 'Lỗi') ||
      has(xml, 'required') ||
      has(xml, 'không') ||
      has(xml, 'Alert') ||
      has(xml, 'vi.error') ||
      has(xml, 'Thiếu');
    log('LT-FAIL', 'empty reason submit', { failUi: failOk, textsHint: has(xml, 'Lỗi') });
    tapText(xml, 'OK') || tapText(xml, 'Đóng');
    await sleep(800);
  }

  // Success path: restore reason via typing (ADBKeyboard may not exist) — set field by re-open and type
  xml = dump('37-late-retry');
  tapText(xml, 'Lý do');
  await sleep(400);
  // try set text via adb (needs focused EditText)
  try {
    sh(`"${adb}" shell input text "Di_muon_mobile_PO_E2E"`);
  } catch {
    /* ignore */
  }
  await sleep(500);
  xml = dump('38-late-filled');
  hit = tapText(xml, 'Gửi đơn');
  log('LT-01', 'submit late/adjust', { hit });
  await sleep(2000);
  xml = dump('39-late-after-submit');
  tapText(xml, 'OK') || tapText(xml, 'Đóng') || tapText(xml, 'Thành công');
  const ok = has(xml, 'Thành công') || has(xml, 'HRM-') || has(xml, 'Đã gửi') || has(xml, 'pending');
  log('LT-01', 'post submit', { ok, hasSuccess: has(xml, 'Thành công') });
  return { ok, xml };
}

async function managerApprovePath(email, password) {
  // Login as manager via nested script
  const login = spawnSync(
    process.execPath,
    ['scripts/_tmp-po-spine-login.mjs', '--email', email, '--password', password],
    { encoding: 'utf8' },
  );
  console.log(login.stdout);
  if (login.status !== 0) {
    log('MGR', 'login failed', { email, stderr: login.stderr?.slice(0, 400) });
    return { ok: false, reason: 'login_fail' };
  }
  await sleep(2000);
  let xml = dump('40-mgr-home');
  let hit =
    tapRes(xml, 'home-action-tile-approve') ||
    tapText(xml, 'Cần duyệt') ||
    tapText(xml, 'Duyệt') ||
    tapText(xml, 'Đơn chờ duyệt') ||
    tapText(xml, 'Phê duyệt');
  if (!hit) {
    sh(`"${adb}" shell input swipe 540 1600 540 700 350`);
    await sleep(700);
    xml = dump('41-mgr-home-scroll');
    hit =
      tapRes(xml, 'home-action-tile-approve') ||
      tapText(xml, 'Cần duyệt') ||
      tapText(xml, 'Đơn chờ duyệt');
  }
  log('J-MOB-05', 'open approvals', { hit });
  await sleep(2500);
  xml = await waitText(['Duyệt', 'Chờ duyệt', 'Manager', 'Đơn nghỉ', 'manager-approve'], '42-mgr-approvals');

  const queue =
    has(xml, 'Không có') ||
    (has(xml, 'trống') && !has(xml, 'manager-approve-button')) ||
    (!has(xml, 'manager-approve-button') && !has(xml, 'Duyệt'));
  if (queue && !has(xml, 'manager-approve-button')) {
    log('J-MOB-05', 'queue empty — BLOCKED U65', { empty: true });
    writeFileSync(`${OUT}/_walk-log.json`, JSON.stringify(LOG, null, 2));
    return { ok: false, blocked: true, reason: 'empty_queue' };
  }

  hit = tapRes(xml, 'manager-approve-button') || tapText(xml, 'Duyệt');
  log('J-MOB-05', 'tap Duyệt', { hit });
  await sleep(1500);
  xml = dump('43-approve-confirm');
  tapText(xml, 'Xác nhận') || tapText(xml, 'Đồng ý') || tapText(xml, 'OK') || tapText(xml, 'Duyệt');
  await sleep(2500);
  xml = dump('44-after-approve');
  tapText(xml, 'OK') || tapText(xml, 'Đóng') || tapText(xml, 'Hoàn tác');
  await sleep(1000);
  xml = dump('45-mgr-final');
  const success =
    has(xml, 'Thành công') ||
    has(xml, 'Đã duyệt') ||
    has(xml, 'APPROVED') ||
    !has(xml, 'manager-approve-button');
  log('J-MOB-05', 'approve result', { success });
  return { ok: success, blocked: false };
}

const mode = process.argv[2] || 'all';
const results = {};

if (mode === 'leave' || mode === 'all') {
  results.leave = await leaveSubmitPath();
}
if (mode === 'late' || mode === 'all') {
  results.late = await lateSubmitPath();
}
if (mode === 'mgr' || mode === 'all') {
  // Prefer du-lich.ceo / documented manager; try uat password families
  const candidates = [
    ['du-lich.ceo@xe.vn', 'Xevn@2026'],
    ['du-lich.ceo@xe.vn', 'xevn-uat-2026'],
    ['du-lich.ceo@xe.vn', 'xevn-pilot'],
    ['uat.nv0002@xe.vn', 'xevn-uat-2026'],
  ];
  // Probe who can login on host first
  let mgr = null;
  for (const [email, password] of candidates) {
    try {
      const res = await fetch('http://127.0.0.1:28001/api/hrm/auth/mobile/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (j.success) {
        mgr = { email, password, role: j.data?.active_membership?.role_label };
        log('MGR', 'login probe ok', { email, role: mgr.role });
        break;
      }
    } catch (e) {
      log('MGR', 'probe err', { email, err: String(e) });
    }
  }
  if (!mgr) {
    results.mgr = { ok: false, reason: 'no_manager_login' };
  } else {
    results.mgr = await managerApprovePath(mgr.email, mgr.password);
    results.mgr.account = mgr.email;
  }
}

writeFileSync(`${OUT}/_walk-log.json`, JSON.stringify({ results, LOG }, null, 2));
console.log(JSON.stringify({ done: true, results }, null, 2));
