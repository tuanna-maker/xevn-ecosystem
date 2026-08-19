/**
 * Shared adb/uiautomator helpers — production login-email + login-password (C-LOGIN-ADB).
 * Used by qa-device matrix scripts; no seed · no qa-login as sole path.
 */
import { spawnSync } from 'node:child_process';

export const DEFAULT_PKG = 'vn.xevn.hrm.mobile';

/**
 * Encode value for legacy shell-string `adb shell input text` only.
 * When adb is invoked with argv (spawnSync), pass `@` literally — do NOT use %40.
 * @param {string} value
 */
export function encodeAdbInputText(value) {
  return value.replace(/ /g, '%s').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * @param {string} xml
 * @param {(node: { text: string; desc: string; rid: string; className: string }) => boolean} pred
 */
export function findNodeBounds(xml, pred) {
  for (const chunk of xml.split('<node ').slice(1)) {
    const text = (chunk.match(/text="([^"]*)"/) || [])[1] || '';
    const desc = (chunk.match(/content-desc="([^"]*)"/) || [])[1] || '';
    const rid = (chunk.match(/resource-id="([^"]*)"/) || [])[1] || '';
    const className = (chunk.match(/class="([^"]*)"/) || [])[1] || '';
    const b = chunk.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (!b) continue;
    const node = { text, desc, rid, className };
    if (!pred(node)) continue;
    return {
      x: Math.floor((+b[1] + +b[3]) / 2),
      y: Math.floor((+b[2] + +b[4]) / 2),
      text,
      desc,
      rid,
      className,
    };
  }
  return null;
}

/** EditText with resource-id login-email | login-password (production path). */
export function findLoginFieldBounds(xml, testId) {
  return findNodeBounds(
    xml,
    (n) =>
      n.className === 'android.widget.EditText' &&
      (n.rid === testId || n.rid.endsWith(`/${testId}`) || n.rid.endsWith(`:id/${testId}`)),
  );
}

/**
 * Collapse qa-device dev JWT panel so adb focus stays on login-email (not URL máy chủ).
 * @param {string} xml
 * @returns {boolean} true if collapse tap was sent
 */
export function devPanelExpanded(xml) {
  return /Ẩn đăng nhập dev/i.test(xml) || /login-dev-base-url/i.test(xml);
}

/**
 * @param {string} xml
 * @returns {{ x: number; y: number; text: string; desc: string; rid: string; className: string } | null}
 */
export function findDevBaseUrlBounds(xml) {
  return findLoginFieldBounds(xml, 'login-dev-base-url');
}

/**
 * Prefer mid-band Y for reliable adb focus (R7: y≈2064 bottom → focused=false).
 * @param {{ x: number; y: number }} node
 * @param {{ minY?: number; maxY?: number }} [band]
 */
export function isAdbMidBandHit(node, band = {}) {
  if (!node) return false;
  const minY = band.minY ?? 400;
  const maxY = band.maxY ?? 1800;
  return node.y >= minY && node.y <= maxY;
}

/**
 * Expand Đăng nhập dev so login-dev-base-url mounts above-fold (FE-BASEURL-ADB-02).
 * @param {(args: string[]) => void} adbSh
 * @param {string} xml
 * @returns {boolean} true if expand tap was sent
 */
export function expandDevLoginPanelIfCollapsed(adbSh, xml) {
  if (devPanelExpanded(xml)) return false;
  const open = findNodeBounds(
    xml,
    (n) =>
      /Đăng nhập dev/i.test(n.desc) ||
      /Đăng nhập dev/i.test(n.text) ||
      n.rid === 'login-dev-toggle' ||
      n.rid.endsWith('/login-dev-toggle') ||
      n.rid.endsWith(':id/login-dev-toggle'),
  );
  if (open) {
    adbSh('shell', 'input', 'tap', String(open.x), String(open.y));
    return true;
  }
  return false;
}

/**
 * Expand panel → fill login-dev-base-url (emulator host override for R8).
 * @param {(args: string[]) => void} adbSh
 * @param {string} xml
 * @param {{ baseUrl: string; onAfterExpand?: () => Promise<string> | string }} params
 * @returns {Promise<string>} xml after expand (caller should re-dump to verify URL text)
 */
export async function fillDevBaseUrlField(adbSh, xml, { baseUrl, onAfterExpand }) {
  if (expandDevLoginPanelIfCollapsed(adbSh, xml) && onAfterExpand) {
    xml = await onAfterExpand();
  }
  let urlNode = findDevBaseUrlBounds(xml);
  if (!urlNode) {
    throw new Error('login-dev-base-url EditText missing after expand Đăng nhập dev');
  }
  if (!isAdbMidBandHit(urlNode)) {
    // Scroll toward top so URL (card top) stays in mid-band if dump was stale.
    adbSh('shell', 'input', 'swipe', '540', '1600', '540', '600', '300');
    if (onAfterExpand) xml = await onAfterExpand();
    urlNode = findDevBaseUrlBounds(xml) || urlNode;
  }
  fillAdbTextField(adbSh, urlNode, baseUrl);
  await new Promise((r) => setTimeout(r, 400));
  return xml;
}

/**
 * @param {(args: string[]) => void} adbSh — e.g. adbSh from qa matrix script
 * @param {string} xml
 */
export function collapseDevLoginPanelIfOpen(adbSh, xml) {
  if (!devPanelExpanded(xml)) return false;
  const hide = findNodeBounds(
    xml,
    (n) => /Ẩn đăng nhập dev/i.test(n.desc) || /Ẩn đăng nhập dev/i.test(n.text),
  );
  if (hide) {
    adbSh('shell', 'input', 'tap', String(hide.x), String(hide.y));
    return true;
  }
  return false;
}

/**
 * @param {(args: string[]) => void} adbSh
 * @param {{ x: number; y: number }} node
 * @param {string} value
 * @param {{ useClipboard?: boolean }} [opts]
 */
export function fillAdbTextField(adbSh, node, value, opts = {}) {
  if (!node) throw new Error('adb fill: target node missing');
  adbSh('shell', 'input', 'tap', String(node.x), String(node.y));
  adbSh('shell', 'input', 'keyevent', '123');
  for (let i = 0; i < 48; i++) adbSh('shell', 'input', 'keyevent', '67');

  if (opts.useClipboard === true) {
    adbSh('shell', 'cmd', 'clipboard', 'set-text', value);
    adbSh('shell', 'input', 'keyevent', '279');
    return;
  }

  adbSh('shell', 'input', 'text', value.replace(/ /g, '%s'));
}

/** UI dump must show email text, not login placeholder (C-LOGIN-ADB). */
export function loginEmailLooksFilled(xml, email, placeholder = 'name@company.com') {
  const node = findLoginFieldBounds(xml, 'login-email');
  if (!node?.text) return false;
  if (node.text === placeholder) return false;
  if (email && node.text.includes(email.split('@')[0])) return true;
  return node.text.includes('@');
}

/**
 * Production login: collapse dev panel → fill login-email → login-password.
 * @param {(args: string[]) => void} adbSh
 * @param {string} xml — fresh uiautomator dump
 * @param {{ email: string; password: string; onAfterCollapse?: () => Promise<string> | string }} params
 * @returns {Promise<string>} xml hint after fill (caller should re-dump to verify)
 */
export async function fillProductionLoginFields(adbSh, xml, { email, password, onAfterCollapse }) {
  if (collapseDevLoginPanelIfOpen(adbSh, xml) && onAfterCollapse) {
    xml = await onAfterCollapse();
  }

  let emailNode = findLoginFieldBounds(xml, 'login-email');
  let passNode = findLoginFieldBounds(xml, 'login-password');
  if (!emailNode || !passNode) {
    throw new Error('login-email or login-password EditText missing in UI dump');
  }

  fillAdbTextField(adbSh, emailNode, email);
  await new Promise((r) => setTimeout(r, 500));
  fillAdbTextField(adbSh, passNode, password);
  await new Promise((r) => setTimeout(r, 200));
  return xml;
}

/** Smoke: run encode + find helpers (no device). */
export function selfTestEncode() {
  if (encodeAdbInputText('x y') !== 'x%sy') throw new Error('encode space failed');
  if (encodeAdbInputText('a@b.c') !== 'a@b.c') throw new Error('encode must preserve @ for argv adb');
}

if (process.argv[1]?.includes('adb-login-fields.mjs') && process.argv.includes('--self-test')) {
  selfTestEncode();
  console.log('adb-login-fields self-test OK');
}
