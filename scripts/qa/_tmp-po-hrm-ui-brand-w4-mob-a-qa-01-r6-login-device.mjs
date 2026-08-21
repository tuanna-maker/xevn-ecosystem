#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R6-LOGIN
 * A) C-LOGIN-ADB via FE adb production fields (no qa-login sole PASS)
 * B) C-MOB-04 check-in POST 2xx via logcat [HRM-MOB] or local proxy
 * U65 zero-seed · face_live=false · remaster_program_done=false
 */
import { execSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import http, { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, appendFileSync, existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import {
  collapseDevLoginPanelIfOpen,
  devPanelExpanded,
  fillAdbTextField,
  fillProductionLoginFields,
  findLoginFieldBounds,
  findNodeBounds,
  loginEmailLooksFilled,
} from '../../apps/mobile/hrm-mobile/scripts/adb-login-fields.mjs';

const adb = `${process.env.LOCALAPPDATA}\\Android\\Sdk\\platform-tools\\adb.exe`;
const PKG = 'vn.xevn.hrm.mobile';
const SERIAL = process.env.ADB_SERIAL || 'emulator-5554';
const EMAIL = process.env.QA_EMAIL || 'uat.nv0001@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'xevn-uat-2026';
const LOCAL_BASE = process.env.QA_HRM_BASE_URL || 'http://10.0.2.2:28001';
const PROXY_PORT = Number(process.env.HRM_LOG_PROXY_PORT || 17861);
const HOST_API = { host: '127.0.0.1', port: 28001 };
const APK =
  process.env.QA_APK ||
  'apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk';
const APK_SHA_REQUIRED =
  process.env.APK_SHA256 ||
  'C415E592F8D91CC256F1A87735162D583EF47D753D19B64E5A3756F66E006EDB';
const OUT = 'docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login';
const LOG_JSON = 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r6-login-device.json';
const PROXY_LOG = 'docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login-proxy.log';
const LOGCAT_OUT = `${OUT}/mob04-submit-logcat.txt`;

mkdirSync(OUT, { recursive: true });
writeFileSync(PROXY_LOG, `# R6 proxy ${new Date().toISOString()}\n`, 'utf8');

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
    timeout: 120000,
    maxBuffer: 30e6,
  });
  if (r.status !== 0 && !args.includes('logcat')) {
    throw new Error(`adb ${args.join(' ')} => ${r.status} ${r.stderr || r.stdout || ''}`);
  }
  return (r.stdout || '').trim();
}

async function dump(name) {
  for (let i = 0; i < 6; i++) {
    try {
      adbSh('shell', 'uiautomator', 'dump', '/sdcard/qa-w4r6.xml');
      await sleep(600);
      sh(`"${adb}" -s ${SERIAL} pull /sdcard/qa-w4r6.xml ${OUT}/${name}.xml`);
      const shot = spawnSync(adb, ['-s', SERIAL, 'exec-out', 'screencap', '-p'], {
        encoding: 'buffer',
        maxBuffer: 25e6,
      });
      if (shot.stdout?.length) writeFileSync(`${OUT}/${name}.png`, shot.stdout);
      return readFileSync(`${OUT}/${name}.xml`, 'utf8');
    } catch {
      await sleep(2000);
    }
  }
  throw new Error(`dump failed: ${name}`);
}

function hasTestId(xml, id) {
  return (
    xml.includes(`resource-id="${id}"`) ||
    xml.includes(`resource-id="${PKG}:id/${id}"`) ||
    xml.includes(`content-desc="${id}"`)
  );
}

function texts(xml) {
  return [...xml.matchAll(/text="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);
}

function homeReached(xml) {
  return (
    hasTestId(xml, 'home-top-bar-brand-accent') ||
    texts(xml).some((t) => /Trang chủ|Chào buổi|Việc cần làm|Đồng nghiệp|Xin chào|Đi làm/i.test(t))
  );
}

function findBounds(xml, pred) {
  return findNodeBounds(xml, (n) => pred(n));
}

function tap(hit) {
  if (!hit) return false;
  adbSh('shell', 'input', 'tap', String(hit.x), String(hit.y));
  return true;
}

function submitEnabled(xml) {
  const hit = findBounds(xml, (n) => n.rid.includes('check-in-submit'));
  if (!hit) return null;
  const chunk = xml.split('<node ').find((c) => c.includes('check-in-submit')) || '';
  const m = chunk.match(/enabled="(true|false)"/);
  return m ? m[1] === 'true' : true;
}

async function dismissPerms(xml) {
  const allow =
    findBounds(
      xml,
      (n) =>
        n.rid.includes('permission_allow_button') ||
        n.text === 'Allow' ||
        n.text === 'Cho phép' ||
        /While using the app|Chỉ khi dùng|Allow/i.test(n.text),
    ) || findBounds(xml, (n) => /POST_NOTIFICATIONS|notification/i.test(n.text + n.desc));
  if (allow) {
    tap(allow);
    await sleep(1200);
    return true;
  }
  // permissioncontroller package dialogs
  if (/permissioncontroller|com\.android\.permissioncontroller/i.test(xml)) {
    const btn =
      findBounds(xml, (n) => /Allow|Cho phép|While using/i.test(n.text)) ||
      findBounds(xml, (n) => n.rid.includes('permission_allow'));
    if (btn) {
      tap(btn);
      await sleep(1200);
      return true;
    }
  }
  return false;
}

function startLocalProxy() {
  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const line = `${new Date().toISOString()} ${req.method} ${req.url} bytes=${body.length}`;
      appendFileSync(PROXY_LOG, line + '\n', 'utf8');
      const headers = { ...req.headers, host: `${HOST_API.host}:${HOST_API.port}` };
      const proxyReq = http.request(
        {
          hostname: HOST_API.host,
          port: HOST_API.port,
          path: req.url,
          method: req.method,
          headers,
        },
        (proxyRes) => {
          appendFileSync(
            PROXY_LOG,
            `  -> status=${proxyRes.statusCode} ${req.method} ${req.url}\n`,
            'utf8',
          );
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        },
      );
      proxyReq.on('error', (e) => {
        appendFileSync(PROXY_LOG, `  -> proxy_error ${e.message}\n`, 'utf8');
        res.statusCode = 502;
        res.end('proxy error');
      });
      if (body.length) proxyReq.write(body);
      proxyReq.end();
    });
  });
  return new Promise((resolve) => {
    server.listen(PROXY_PORT, '127.0.0.1', () => {
      appendFileSync(
        PROXY_LOG,
        `listening 127.0.0.1:${PROXY_PORT} -> ${HOST_API.host}:${HOST_API.port}\n`,
        'utf8',
      );
      resolve(server);
    });
  });
}

async function setBaseUrlViaDevPanel(xml) {
  // Expand if collapsed
  if (!devPanelExpanded(xml)) {
    const toggle =
      findBounds(xml, (n) => n.rid.includes('login-dev-toggle')) ||
      findBounds(xml, (n) => /Đăng nhập dev/i.test(n.text) || /Đăng nhập dev/i.test(n.desc));
    if (toggle) {
      tap(toggle);
      await sleep(1200);
      xml = await dump('dev-expanded');
    }
  }
  if (!hasTestId(xml, 'login-dev-base-url') && !devPanelExpanded(xml)) {
    return { xml, baseUrlSet: false, reason: 'dev panel not expandable' };
  }
  const urlNode =
    findLoginFieldBounds(xml, 'login-dev-base-url') ||
    findBounds(
      xml,
      (n) =>
        n.className === 'android.widget.EditText' &&
        (n.rid.includes('login-dev-base-url') || /URL máy chủ/i.test(n.desc)),
    );
  if (!urlNode) {
    // find EditText near label — first EditText in expanded panel after toggle
    const edits = [];
    for (const chunk of xml.split('<node ').slice(1)) {
      const className = (chunk.match(/class="([^"]*)"/) || [])[1] || '';
      const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
      const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
      const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
      if (className !== 'android.widget.EditText' || !b) continue;
      edits.push({
        x: Math.floor((+b[1] + +b[3]) / 2),
        y: Math.floor((+b[2] + +b[4]) / 2),
        text,
        rid,
        className,
      });
    }
    // After email/password, first panel EditText is usually base URL when panel open
    const candidate = edits.find((e) => e.rid.includes('login-dev-base-url')) || edits[2] || edits[0];
    if (!candidate) return { xml, baseUrlSet: false, reason: 'no url EditText' };
    fillAdbTextField(adbSh, candidate, LOCAL_BASE);
  } else {
    fillAdbTextField(adbSh, urlNode, LOCAL_BASE);
  }
  await sleep(800);
  xml = await dump('base-url-filled');
  const shown = texts(xml).some((t) => t.includes('10.0.2.2') || t.includes(String(PROXY_PORT)) || t.includes('28001'));
  collapseDevLoginPanelIfOpen(adbSh, xml);
  await sleep(800);
  xml = await dump('after-base-collapse');
  return { xml, baseUrlSet: shown, reason: shown ? 'UI shows local base' : 'UI may not show local base (controlled field)' };
}

async function main() {
  if (!existsSync(APK)) throw new Error(`APK missing: ${APK}`);
  const apkBuf = readFileSync(APK);
  const sha = createHash('sha256').update(apkBuf).digest('hex').toUpperCase();
  note('start', {
    work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R6-LOGIN',
    serial: SERIAL,
    EMAIL,
    LOCAL_BASE,
    apk_sha: sha,
    apk_sha_required: APK_SHA_REQUIRED,
  });
  if (sha !== APK_SHA_REQUIRED.toUpperCase()) {
    writeFileSync(
      LOG_JSON,
      JSON.stringify({ fatal: 'SHA mismatch', sha, required: APK_SHA_REQUIRED }, null, 2),
    );
    process.exit(2);
  }
  record('APK-04-sha', 'PASS', 'header', sha);

  // L0 host API
  let l0 = 0;
  try {
    const r = await fetch(`http://${HOST_API.host}:${HOST_API.port}/api/hrm/auth/mobile/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    l0 = r.status;
  } catch (e) {
    note('l0_fail', { err: String(e) });
  }
  record('L0-hrm-api-login', l0 === 201 || l0 === 200 ? 'PASS' : 'FAIL', 'host', `http=${l0}`);

  const proxyServer = await startLocalProxy();
  const proxyBase = `http://10.0.2.2:${PROXY_PORT}`;

  try {
    adbSh('reverse', '--remove-all');
    adbSh('reverse', 'tcp:28001', 'tcp:28001');
    adbSh('reverse', `tcp:${PROXY_PORT}`, `tcp:${PROXY_PORT}`);
    adbSh('install', '-r', '-g', APK);
    adbSh('shell', 'settings', 'put', 'global', 'window_animation_scale', '0');
    adbSh('shell', 'settings', 'put', 'global', 'transition_animation_scale', '0');
    adbSh('shell', 'settings', 'put', 'global', 'animator_duration_scale', '0');
    adbSh('shell', 'pm', 'clear', PKG);
    await sleep(900);
    for (const perm of [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.ACCESS_COARSE_LOCATION',
    ]) {
      try {
        adbSh('shell', 'pm', 'grant', PKG, perm);
      } catch {
        /* ignore */
      }
    }
    adbSh('shell', 'settings', 'put', 'secure', 'location_mode', '3');
    try {
      adbSh('emu', 'geo', 'fix', '105.8342', '21.0278');
    } catch {
      /* ignore */
    }

    adbSh('shell', 'am', 'force-stop', PKG);
    await sleep(500);
    adbSh('shell', 'am', 'start', '-n', `${PKG}/.MainActivity`);
    await sleep(10000);

    let xml = await dump('cold-start');
    const devCollapsed = !devPanelExpanded(xml) && !hasTestId(xml, 'login-dev-base-url');
    record(
      'C-LOGIN-ADB-cold-dev-collapsed',
      devCollapsed ? 'PASS' : 'FAIL',
      'cold-start.png',
      `devExpanded=${devPanelExpanded(xml)}`,
    );
    record(
      'C-LOGIN-ADB-login-email-present',
      hasTestId(xml, 'login-email') ? 'PASS' : 'FAIL',
      'cold-start.png',
      '',
    );

    // Prefer direct host reverse :28001; fill base URL then production credentials
    const baseRes = await setBaseUrlViaDevPanel(xml);
    xml = baseRes.xml;
    record(
      'C-MOB-04-base-url-prelogin',
      baseRes.baseUrlSet ? 'PASS' : 'PARTIAL',
      'base-url-filled.png',
      `${baseRes.reason}; target=${LOCAL_BASE} (proxy alt=${proxyBase})`,
    );

    // If UI didn't show local base, try again with proxy URL (still FE adb path for credentials)
    if (!baseRes.baseUrlSet) {
      note('retry_base_via_proxy_url');
      // re-expand and set proxy base
      xml = await dump('pre-proxy-base');
      if (!devPanelExpanded(xml)) {
        const toggle =
          findBounds(xml, (n) => n.rid.includes('login-dev-toggle')) ||
          findBounds(xml, (n) => /Đăng nhập dev/i.test(n.text));
        tap(toggle);
        await sleep(1000);
        xml = await dump('dev-expanded-proxy');
      }
      const urlNode =
        findLoginFieldBounds(xml, 'login-dev-base-url') ||
        findBounds(xml, (n) => n.rid.includes('login-dev-base-url'));
      if (urlNode) {
        fillAdbTextField(adbSh, urlNode, proxyBase);
        await sleep(600);
        xml = await dump('base-url-proxy-filled');
      }
      collapseDevLoginPanelIfOpen(adbSh, xml);
      await sleep(600);
      xml = await dump('after-proxy-base-collapse');
    }

    await fillProductionLoginFields(adbSh, xml, {
      email: EMAIL,
      password: PASSWORD,
      onAfterCollapse: async () => dump('login-after-collapse'),
    });
    await sleep(600);
    xml = await dump('login-filled');

    const emailNode = findLoginFieldBounds(xml, 'login-email');
    const emailOk =
      loginEmailLooksFilled(xml, EMAIL) &&
      emailNode?.text &&
      emailNode.text !== 'name@company.com' &&
      emailNode.text.includes('uat.nv0001');
    record(
      'C-LOGIN-ADB-email-not-placeholder',
      emailOk ? 'PASS' : 'FAIL',
      'login-filled.png',
      `emailFieldText=${emailNode?.text ?? 'missing'}`,
    );

    let loginHome = false;
    let val001 = false;
    if (!emailOk) {
      record('J-MOB-01-login-home', 'FAIL', 'login-filled.png', 'placeholder after adb fill');
      record('C-LOGIN-ADB-close', 'OPEN', 'policy', 'FE adb fill did not bind email');
    } else {
      const btn =
        findBounds(xml, (n) => n.rid.includes('login-submit')) ||
        findBounds(xml, (n) => /^Đăng nhập$/i.test(n.text));
      if (!btn) {
        record('J-MOB-01-login-home', 'FAIL', 'login-filled.png', 'submit missing');
        record('C-LOGIN-ADB-close', 'OPEN', 'login-filled.png', 'submit missing');
      } else {
        adbSh('logcat', '-c');
        tap(btn);
        await sleep(14000);
        xml = await dump('post-login');
        for (let i = 0; i < 8; i++) {
          if (await dismissPerms(xml)) {
            xml = await dump(`post-login-perm-${i}`);
            continue;
          }
          if (homeReached(xml)) break;
          await sleep(1500);
          xml = await dump(`post-login-wait-${i}`);
        }
        const postLog = adbSh('logcat', '-d', '-t', '400');
        writeFileSync(`${OUT}/login-logcat.txt`, postLog);
        val001 = /HRM-VAL-001/i.test(postLog) || texts(xml).some((t) => /HRM-VAL-001/i.test(t));
        loginHome = homeReached(xml) && !val001;
        record(
          'C-LOGIN-ADB-no-val001',
          val001 ? 'FAIL' : 'PASS',
          'post-login.png',
          val001 ? 'HRM-VAL-001 observed' : 'no HRM-VAL-001',
        );
        record(
          'J-MOB-01-login-home',
          loginHome ? 'PASS' : 'FAIL',
          'post-login.png',
          `home=${homeReached(xml)} val001=${val001} FE adb only (no qa-login)`,
        );
        record(
          'C-LOGIN-ADB-close',
          loginHome ? 'PASS' : 'OPEN',
          'post-login.png',
          loginHome ? 'FE adb login reached home' : 'submit did not reach home',
        );
      }
    }

    // --- B) MOB-04 ---
    let mob04Post2xx = false;
    let mob04LogcatOk = false;
    let mob04Ui = false;
    let mob04Detail = 'skipped — login home FAIL';

    if (loginHome) {
      for (let i = 0; i < 4; i++) {
        if (!(await dismissPerms(xml))) break;
        xml = await dump(`home-perm-${i}`);
      }
      if (xml.includes('fab-primary-action-sheet') || texts(xml).some((t) => /^Đóng$/i.test(t))) {
        tap(findBounds(xml, (n) => n.text === 'Đóng' || /Đóng/i.test(n.desc)));
        await sleep(1000);
        xml = await dump('home-sheet-closed');
      }

      const fab =
        findBounds(xml, (n) => n.desc === 'Thao tác nhanh' || n.rid.includes('check-in-fab')) ||
        findBounds(xml, (n) => /Thao tác nhanh/i.test(n.text));
      tap(fab);
      await sleep(2200);
      xml = await dump('mob04-fab');
      record(
        'J-MOB-02-FAB-sheet',
        hasTestId(xml, 'fab-primary-action-sheet') || texts(xml).some((t) => /Thao tác nhanh|Chấm công/i.test(t))
          ? 'PASS'
          : 'PARTIAL',
        'mob04-fab.png',
        '',
      );

      const checkIn =
        findBounds(xml, (n) => n.rid.includes('fab-action-check-in') || n.desc === 'fab-action-check-in') ||
        findBounds(xml, (n) => n.text === 'Chấm công');
      tap(checkIn);
      await sleep(3500);
      xml = await dump('mob04-checkin');
      for (let i = 0; i < 4; i++) {
        if (!(await dismissPerms(xml))) break;
        xml = await dump(`mob04-checkin-perm-${i}`);
      }

      tap(findBounds(xml, (n) => n.rid.includes('check-in-channel-gps') || /Vị trí GPS/i.test(n.text)));
      await sleep(1500);
      xml = await dump('mob04-gps');
      const enabled = submitEnabled(xml);
      record(
        'C-MOB-04-gps-ready',
        hasTestId(xml, 'check-in-submit') && enabled !== false ? 'PASS' : 'FAIL',
        'mob04-gps.png',
        `submitEnabled=${enabled}`,
      );

      adbSh('logcat', '-c');
      const proxyLenBefore = readFileSync(PROXY_LOG, 'utf8').length;
      const sub =
        findBounds(xml, (n) => n.rid.includes('check-in-submit')) ||
        findBounds(xml, (n) => /Chấm công vào/i.test(n.text));
      if (sub && enabled !== false) {
        tap(sub);
        await sleep(14000);
        xml = await dump('mob04-after-submit');
        const lc = adbSh('logcat', '-d', '-t', '1200');
        writeFileSync(LOGCAT_OUT, lc);
        const proxyTail = readFileSync(PROXY_LOG, 'utf8').slice(proxyLenBefore);
        writeFileSync(`${OUT}/mob04-proxy-snippet.log`, proxyTail, 'utf8');

        mob04LogcatOk =
          /\[HRM-MOB\]\s*attendance\/records\s*POST\s*ok=true\b/i.test(lc) &&
          /http=(201|200|204)\b/i.test(lc);
        const logcatAny =
          /\[HRM-MOB\]\s*attendance\/records\s*POST/i.test(lc) ||
          /\[HRM-MOB\].*POST.*attendance\/records/i.test(lc);
        mob04Post2xx =
          /POST \/api\/hrm\/attendance\/records[^\n]*\n\s*-> status=(201|200|204)/m.test(proxyTail) ||
          (/attendance\/records/.test(proxyTail) && /-> status=(201|200|204)/.test(proxyTail));
        mob04Ui = /Thành công|thành công|HRM-ATT|đã chấm/i.test([xml, lc].join('\n'));
        mob04Detail = `logcatOk=${mob04LogcatOk} logcatAny=${logcatAny} proxy2xx=${mob04Post2xx} ui=${mob04Ui}`;
        note('mob04_logcat_snip', {
          lines: lc
            .split('\n')
            .filter((l) => /HRM-MOB|attendance\/records/i.test(l))
            .slice(0, 20),
        });
      } else {
        mob04Detail = sub ? 'submit disabled' : 'submit not found';
      }

      const mob04Pass = mob04Post2xx || mob04LogcatOk;
      record(
        'C-MOB-04-post-2xx',
        mob04Pass ? 'PASS' : 'FAIL',
        'mob04-after-submit.png',
        mob04Detail,
      );
    } else {
      record('C-MOB-04-post-2xx', 'FAIL', 'post-login.png', mob04Detail);
      record('J-MOB-02-FAB-sheet', 'SKIP', '—', 'blocked on login');
      record('C-MOB-04-gps-ready', 'SKIP', '—', 'blocked on login');
    }

    record('face_live_claim', 'PASS', 'policy', 'face_live=false');
    record('remaster_done_claim', 'PASS', 'policy', 'remaster_program_done=false');
    record('qa-login-sole-path', 'PASS', 'policy', 'qa-login not used for PASS');

    const loginPass = cases.find((c) => c.id === 'C-LOGIN-ADB-close')?.verdict === 'PASS';
    const jmob01 = cases.find((c) => c.id === 'J-MOB-01-login-home')?.verdict === 'PASS';
    const mob04Pass = cases.find((c) => c.id === 'C-MOB-04-post-2xx')?.verdict === 'PASS';
    const hardFails = cases.filter((c) => c.verdict === 'FAIL' && !['C-MOB-04-post-2xx', 'C-LOGIN-ADB-close', 'J-MOB-01-login-home', 'C-LOGIN-ADB-email-not-placeholder', 'C-LOGIN-ADB-no-val001', 'C-MOB-04-gps-ready', 'L0-hrm-api-login'].includes(c.id));

    let ack = 'FAIL_TO_PM';
    if (loginPass && jmob01 && mob04Pass) ack = 'PASS_TO_PM';
    else if ((loginPass && jmob01) || mob04Pass) ack = 'PASS_WITH_OBS';
    else ack = 'FAIL_TO_PM';

    // residual clarity
    const residual = [];
    if (!(loginPass && jmob01)) residual.push('PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-03 / C-LOGIN-ADB');
    if (!mob04Pass) residual.push('PO-HRM-UI-BRAND-W4-MOB-A-MOB04 / C-MOB-04');

    const summary = {
      work_item_id: 'PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R6-LOGIN',
      log,
      cases,
      ack,
      residual,
      face_live: false,
      remaster_program_done: false,
      seed: false,
      apk_sha: sha,
      local_base: LOCAL_BASE,
      proxy_port: PROXY_PORT,
      hardFails: hardFails.length,
    };
    writeFileSync(LOG_JSON, JSON.stringify(summary, null, 2));
    note('done', { ack, residual });
    process.exit(ack === 'FAIL_TO_PM' ? 1 : 0);
  } finally {
    proxyServer.close();
  }
}

main().catch((e) => {
  note('fatal', { err: String(e.stack || e) });
  writeFileSync(LOG_JSON, JSON.stringify({ log, cases, fatal: String(e.stack || e) }, null, 2));
  process.exit(1);
});
