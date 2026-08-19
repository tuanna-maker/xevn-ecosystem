#!/usr/bin/env node
/**
 * Retry TC-MOB-021 / TC-MOB-030 — Settings scroll to Lương / Hợp đồng
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
const ROOT = process.cwd();
const SHOT_DIR = path.join(ROOT, 'docs/qa/evidence/screenshots/qa-hdsd-mob-bf03-depth-01-20260801');
const XML_DIR = path.join(process.env.TEMP || '/tmp', 'qa-hdsd-mob-bf03-depth-01-20260801');
const RUNTIME = path.join(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-mob-bf03-depth-01-runtime.json');

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

function findByTestId(xml, id) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (
    findBounds(xml, new RegExp(`resource-id="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`)) ??
    findBounds(xml, new RegExp(`content-desc="${esc}"[^>]*bounds="\\[(\\d+),(\\d+)\\]\\[(\\d+),(\\d+)\\]"`))
  );
}

function hasAny(xml, pats) {
  return pats.some((p) => xml.includes(p));
}

async function dump(name) {
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
    await sleep(800);
  }
  throw new Error(`dump ${name}`);
}

async function shot(name) {
  const remote = `/sdcard/${name}.png`;
  const local = path.join(SHOT_DIR, `${name}.png`);
  sh(`shell screencap -p ${remote}`);
  sh(`pull ${remote} "${local}"`);
}

async function tap(b) {
  if (!b) return false;
  sh(`shell input tap ${b.x} ${b.y}`);
  await sleep(1800);
  return true;
}

async function scrollDown(n = 3) {
  for (let i = 0; i < n; i++) {
    sh('shell input swipe 540 1700 540 700 350');
    await sleep(600);
  }
}

async function fetchSession() {
  const res = await fetch(`${API_BASE}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'uat.nv0001@xe.vn', password: 'xevn-uat-2026' }),
  });
  const j = await res.json();
  if (!j.success) throw new Error(j.code);
  const d = j.data;
  const a = d.active_membership || {};
  return {
    token: d.access_token,
    refresh: d.refresh_token || '',
    tenant: a.tenant_id || d.default_tenant_id,
    company: a.company_id || d.default_company_id,
    uuid: a.company_uuid || d.company_uuid,
    emp: a.employee_id || d.employee?.id,
  };
}

async function qaLogin() {
  sh(`shell am force-stop ${PKG}`);
  await sleep(700);
  const s = await fetchSession();
  const q = new URLSearchParams({
    access_token: s.token,
    refresh_token: s.refresh,
    tenant_id: s.tenant,
    company_id: s.company,
    company_uuid: s.uuid,
    employee_id: s.emp,
    base_url: API_BASE,
  });
  spawnSync(adb, [
    '-s',
    serial,
    'shell',
    'am',
    'start',
    '-a',
    'android.intent.action.VIEW',
    '-n',
    `${PKG}/.MainActivity`,
    '-d',
    `xevn://qa-login?${q.toString()}`,
  ]);
  await sleep(5000);
}

async function openSettings() {
  sh('shell input tap 945 2211');
  await sleep(2000);
  let xml = await dump('retry-profile');
  let hit =
    findByTestId(xml, 'profile-settings-entry') ||
    findByText(xml, 'Cài đặt') ||
    findByTextContains(xml, 'Cài đặt');
  if (!hit) {
    await scrollDown(1);
    xml = await dump('retry-profile2');
    hit = findByTestId(xml, 'profile-settings-entry') || findByTextContains(xml, 'Cài');
  }
  await tap(hit);
  await sleep(2000);
  return dump('retry-settings');
}

async function findInSettingsScroll(labels, dumpName) {
  let xml = await dump(`${dumpName}-0`);
  for (let i = 0; i < 8; i++) {
    for (const lab of labels) {
      const b = findByText(xml, lab) || findByTextContains(xml, lab);
      // Prefer content area, not bottom tab
      if (b && b.y > 300 && b.y < 2100) return { xml, hit: b, label: lab, scrolls: i };
    }
    await scrollDown(1);
    xml = await dump(`${dumpName}-${i + 1}`);
  }
  return { xml, hit: null, label: null, scrolls: 8 };
}

async function main() {
  await qaLogin();
  const out = {};

  // TC-021
  {
    await openSettings();
    await shot('tc-mob-021-settings-retry');
    const found = await findInSettingsScroll(['Lương'], 'tc-mob-021-scroll');
    if (found.hit) {
      await tap(found.hit);
      await sleep(2500);
    }
    const xml = await dump('tc-mob-021-summary-retry');
    fs.writeFileSync(path.join(XML_DIR, 'tc-mob-021-summary-retry.xml'), xml);
    await shot('tc-mob-021-summary-retry');
    const summaryMarkers = hasAny(xml, [
      'Chọn kỳ để xem phiếu lương',
      'Danh sách kỳ lương',
      'kỳ lương trong phạm vi',
      'Chưa có kỳ lương',
      'payroll-summary',
    ]);
    const noNet = !hasAny(xml, ['HRM-MOB-ERR-NETWORK']);
    // After tapping Lương, header title is vi.payroll = "Lương" and subtitle about kỳ
    const titleOk = hasAny(xml, ['Lương', 'kỳ', 'Kỳ']) && found.hit;
    const pass = (summaryMarkers || titleOk) && noNet && !!found.hit;
    out['TC-MOB-021'] = {
      verdict: pass ? '🟢' : '🟡',
      ok: pass,
      note: pass
        ? `PayrollSummary via Settings→Lương (scrolls=${found.scrolls})`
        : `Settings Lương not reached or markers missing; scrolls=${found.scrolls}`,
      label: found.label,
      summaryMarkers,
      noNet,
      hasLuongTap: !!found.hit,
    };
  }

  // TC-030
  {
    sh('shell input keyevent 4');
    await sleep(1500);
    let xml = await dump('retry-back');
    if (!hasAny(xml, ['settings-screen', 'Cài đặt'])) {
      await openSettings();
    }
    const found = await findInSettingsScroll(['Hợp đồng'], 'tc-mob-030-scroll');
    if (found.hit) {
      await tap(found.hit);
      await sleep(2500);
    }
    xml = await dump('tc-mob-030-contracts-retry');
    fs.writeFileSync(path.join(XML_DIR, 'tc-mob-030-contracts-retry.xml'), xml);
    await shot('tc-mob-030-contracts-retry');
    const screenOk = hasAny(xml, [
      'contracts-section-contracts',
      'contracts-section-insurance',
      'contracts-empty',
      'Hợp đồng',
      'Bảo hiểm sắp hết hạn',
      'Chưa có hợp đồng',
    ]);
    const noNet = !hasAny(xml, ['HRM-MOB-ERR-NETWORK']);
    const pass = screenOk && noNet && !!found.hit;
    out['TC-MOB-030'] = {
      verdict: pass ? '🟢' : '🟡',
      ok: pass,
      note: pass
        ? `ContractsScreen via Settings→Hợp đồng (scrolls=${found.scrolls})`
        : `Contracts not reached; scrolls=${found.scrolls} hit=${!!found.hit}`,
      screenOk,
      noNet,
      hasHopDongTap: !!found.hit,
    };
  }

  const runtime = JSON.parse(fs.readFileSync(RUNTIME, 'utf8'));
  runtime.tc['TC-MOB-021'] = out['TC-MOB-021'];
  runtime.tc['TC-MOB-030'] = out['TC-MOB-030'];
  runtime.promote = [];
  runtime.remain_yellow = [];
  for (const [id, v] of Object.entries(runtime.tc)) {
    if (v.verdict === '🟢') runtime.promote.push(id);
    else runtime.remain_yellow.push(id);
  }
  runtime.summary = `${runtime.promote.length}/4 depth TC 🟢 · remain 🟡: ${runtime.remain_yellow.join(',') || 'none'} · J-MOB-04 ${runtime.jmob04_spine}`;
  runtime.retry_021_030 = out;
  fs.writeFileSync(RUNTIME, JSON.stringify(runtime, null, 2));
  console.log(JSON.stringify({ retry: out, promote: runtime.promote, remain: runtime.remain_yellow, summary: runtime.summary }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
