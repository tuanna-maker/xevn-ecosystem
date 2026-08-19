// @ts-nocheck
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  encodeAdbInputText,
  findLoginFieldBounds,
  findDevBaseUrlBounds,
  isAdbMidBandHit,
  expandDevLoginPanelIfCollapsed,
  fillDevBaseUrlField,
  devPanelExpanded,
  loginEmailLooksFilled,
  selfTestEncode,
} from '../../../../scripts/adb-login-fields.mjs';

const authDir = dirname(fileURLToPath(import.meta.url));
const loginSrc = readFileSync(join(authDir, '../LoginScreen.tsx'), 'utf8');
const credentialSrc = readFileSync(join(authDir, '../LoginCredentialField.tsx'), 'utf8');

describe('adb-login-fields.mjs', () => {
  it('encodes spaces for adb input text (argv @ preserved)', () => {
    selfTestEncode();
    expect(encodeAdbInputText('uat.nv0001@xe.vn')).toBe('uat.nv0001@xe.vn');
    expect(encodeAdbInputText('x y')).toBe('x%sy');
  });

  it('finds EditText by login-email resource-id', () => {
    const xml = `<hierarchy><node index="0" text="name@company.com" resource-id="login-email" class="android.widget.EditText" bounds="[108,1142][972,1273]" /></hierarchy>`;
    const hit = findLoginFieldBounds(xml, 'login-email');
    expect(hit?.rid).toBe('login-email');
  });

  it('detects expanded dev panel', () => {
    expect(devPanelExpanded('Ẩn đăng nhập dev')).toBe(true);
    expect(devPanelExpanded('Đăng nhập dev (JWT')).toBe(false);
  });

  it('finds login-dev-base-url and mid-band hit heuristic (R7)', () => {
    const mid = `<hierarchy><node text="http://10.0.2.2:28001" resource-id="login-dev-base-url" class="android.widget.EditText" bounds="[87,900][993,1030]" /></hierarchy>`;
    const bottom = `<hierarchy><node text="http://14.225.217.232:3001" resource-id="login-dev-base-url" class="android.widget.EditText" bounds="[87,1999][993,2129]" /></hierarchy>`;
    const midNode = findDevBaseUrlBounds(mid);
    const bottomNode = findDevBaseUrlBounds(bottom);
    expect(midNode?.y).toBe(965);
    expect(isAdbMidBandHit(midNode)).toBe(true);
    expect(isAdbMidBandHit(bottomNode)).toBe(false);
  });

  it('expandDevLoginPanelIfCollapsed taps Đăng nhập dev toggle', () => {
    const taps = [];
    const adbSh = (...args) => taps.push(args);
    const xml = `<hierarchy><node text="Đăng nhập dev (JWT / internal key)" content-desc="login-dev-toggle" resource-id="login-dev-toggle" class="android.widget.TextView" bounds="[100,1500][980,1560]" /></hierarchy>`;
    expect(expandDevLoginPanelIfCollapsed(adbSh, xml)).toBe(true);
    expect(taps.some((a) => a.includes('tap'))).toBe(true);
    expect(expandDevLoginPanelIfCollapsed(adbSh, 'Ẩn đăng nhập dev')).toBe(false);
  });

  it('fillDevBaseUrlField expands then fills URL', async () => {
    const taps = [];
    const adbSh = (...args) => taps.push(args.join(' '));
    const collapsed = `<hierarchy><node text="Đăng nhập dev (JWT / internal key)" resource-id="login-dev-toggle" class="android.widget.TextView" bounds="[100,1500][980,1560]" /></hierarchy>`;
    const expanded = `<hierarchy><node text="http://14.225.217.232:3001" resource-id="login-dev-base-url" class="android.widget.EditText" bounds="[87,900][993,1030]" /></hierarchy>`;
    await fillDevBaseUrlField(adbSh, collapsed, {
      baseUrl: 'http://10.0.2.2:28001',
      onAfterExpand: () => expanded,
    });
    expect(taps.some((t) => t.includes('input text http://10.0.2.2:28001'))).toBe(true);
  });
});

describe('LoginScreen adb contract (PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-02)', () => {
  it('collapses dev JWT panel on cold start', () => {
    expect(loginSrc).toMatch(/useState\(false\)/);
    expect(loginSrc).not.toMatch(/useState\(nativeDev\)/);
  });

  it('keeps brand + production login testIDs', () => {
    expect(loginSrc).toContain('testID="login-screen-root"');
    expect(loginSrc).toContain('testID="login-email"');
    expect(loginSrc).toContain('testID="login-password"');
    expect(loginSrc).toContain('testID="login-submit"');
    expect(loginSrc).toContain('testID="login-dev-base-url"');
  });

  it('autoFocus production email when dev panel hidden', () => {
    expect(loginSrc).toMatch(/autoFocus=\{!showDev\}/);
  });

  it('uses adb-sync credential fields (uncontrolled + onEndEditing)', () => {
    expect(loginSrc).toContain('LoginCredentialField');
    expect(credentialSrc).toContain('defaultValue={defaultValue}');
    expect(credentialSrc).toContain('onEndEditing');
    expect(credentialSrc).not.toMatch(/value=\{props\.value\}/);
    expect(credentialSrc).not.toMatch(/value=\{[^}]*baseUrl/);
  });

  it('loginEmailLooksFilled rejects placeholder dump text', () => {
    const xml = `<node text="name@company.com" resource-id="login-email" class="android.widget.EditText" bounds="[0,0][1,1]" />`;
    expect(loginEmailLooksFilled(xml, 'uat.nv0001@xe.vn')).toBe(false);
    const filled = `<node text="uat.nv0001@xe.vn" resource-id="login-email" class="android.widget.EditText" bounds="[0,0][1,1]" />`;
    expect(loginEmailLooksFilled(filled, 'uat.nv0001@xe.vn')).toBe(true);
  });
});

describe('LoginScreen baseUrl adb contract (PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01)', () => {
  it('binds login-dev-base-url via LoginCredentialField (not controlled FormField)', () => {
    const baseUrlFieldBlock = loginSrc.slice(
      loginSrc.indexOf('testID="login-dev-base-url"') - 400,
      loginSrc.indexOf('testID="login-dev-base-url"') + 80,
    );
    expect(baseUrlFieldBlock).toContain('LoginCredentialField');
    expect(baseUrlFieldBlock).toContain('defaultValue={baseUrl}');
    expect(baseUrlFieldBlock).toContain('onLiveTextChange={setBaseUrl}');
    expect(baseUrlFieldBlock).not.toMatch(/value=\{baseUrl\}/);
    // Controlled FormField pattern must not wrap the URL field
    expect(loginSrc).not.toMatch(
      /FormField[\s\S]{0,120}testID="login-dev-base-url"/,
    );
  });

  it('resolves baseUrl from field ref before mobile login (adb sync)', () => {
    expect(loginSrc).toContain('baseUrlFieldRef');
    expect(loginSrc).toContain('resolveBaseUrl');
    expect(loginSrc).toMatch(/const loginBaseUrl = resolveBaseUrl\(\)/);
    expect(loginSrc).toMatch(/baseUrl:\s*loginBaseUrl/);
    expect(loginSrc).toContain('commitBaseUrlFromField');
  });

  it('documents emulator host hint for qa-device fill', () => {
    expect(loginSrc).toContain('http://10.0.2.2:28001');
  });
});

describe('LoginScreen baseUrl layout (PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-02)', () => {
  it('mounts URL above-fold inside BrandedLoginCard when showDev (not bottom JWT panel only)', () => {
    expect(loginSrc).toContain('ScrollView');
    expect(loginSrc).toContain('onToggleDevPanel');
    expect(loginSrc).toContain('heroContentCompact');
    // URL field gated by showDev and placed before login-email in source order
    const urlIdx = loginSrc.indexOf('testID="login-dev-base-url"');
    const emailIdx = loginSrc.indexOf('testID="login-email"');
    expect(urlIdx).toBeGreaterThan(-1);
    expect(emailIdx).toBeGreaterThan(-1);
    expect(urlIdx).toBeLessThan(emailIdx);
    expect(loginSrc).toMatch(/qaDevLogin && showDev/);
    expect(loginSrc).toMatch(/autoFocus=\{showDev\}/);
  });

  it('keeps LoginCredentialField focusable hit target for adb', () => {
    expect(credentialSrc).toContain('minHeight: 48');
    expect(credentialSrc).toMatch(/\beditable\b/);
    expect(credentialSrc).toMatch(/\bfocusable\b/);
  });
});
