/**
 * @CODE-MEMORY
 * Screen:     Auth — LoginScreen (hero + BrandedLoginCard)
 * UC:         UC-HRM-MOB-01 · AC-BRAND-DNA-03 / AC-BRAND-DNA-06 · FR-UC-M01
 * BR:         Login shell — primary gradient hero · L1 tokens · input DNA L2
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01
 * TechSpec:   docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §8.4
 * Purpose:    Đăng nhập ESS — logo/mark XeVN trên hero primary; form card L3 DNA.
 * WorkItem:   MOB-XEVN-BRAND-SHELL-L3-01
 * Coded:      2026-07-22
 * Callers:    RootNavigator (unsigned)
 * Callees:    BrandedLoginCard · XevnLogo · membershipDisplay · hrmRequest mobile/login
 * Impact:     Literal borderWidth:1 / ad-hoc radius → lệch FormField / Card DNA
 * must_keep:  XevnLogo mark; input/devBox dùng borderWidth.thin + colors.border; radius.input|card
 * SOLID:      Auth shell tách ESS remaster (L4c cấm ở wave này)
 * LastVerified: src/features/auth/membershipDisplay.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-MOB-G-ORPH-KHOI-01
 * change_mode: FIX
 * What: Multi-membership login toast dùng resolveCompanyDisplayVi (G-ORPH-MOB-03)
 * Why: AC-MOB-LABEL-05 · BR-MOB-LABEL-03
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-04-AUTH-MOB
 * change_mode: UPGRADE
 * What: Toast multi-membership bind company_label từ BE (membershipDisplay);
 *       bỏ resolveCompanyDisplayVi slug→label invent trên login path.
 * Why: OS 28 · W1-B-03-AUTH-BE · slice DOC-ENT-P0-AUTH-M01
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A
 * change_mode: UPGRADE
 * What: Hero title/hint brandTypography (Montserrat/Source Sans 3 when loaded)
 * Why: MOB-01 W4 parity ADR §16
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-01
 * change_mode: FIX
 * What: Dev JWT panel collapsed on cold start; login-email autoFocus + adb testIDs on dev URL
 * Why: C-LOGIN-ADB — qa-device adb input text must hit production email/password, not URL máy chủ
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-02
 * change_mode: FIX
 * What: LoginCredentialField (uncontrolled + onEndEditing) — adb paste/input text syncs RN state on blur/submit
 * Why: R5 FAIL — controlled value wiped native text; HRM-VAL-001 email empty
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01
 * change_mode: FIX
 * What: login-dev-base-url uses LoginCredentialField + resolveBaseUrl() before mobile/dev login
 * Why: R6 OBS — controlled FormField ignored adb URL; session stayed on pilot :3001
 * spec_read_ack: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-02.md · LoginCredentialField pattern
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-02
 * change_mode: FIX
 * What: When Đăng nhập dev expands — URL field mounts above fold (top of BrandedLoginCard),
 *       ScrollView + compact hero + autoFocus URL; commit resolveBaseUrl on collapse
 * Why: R7 FAIL — login-dev-base-url at y≈2064 below fold; adb tap focused=false; session stayed :3001
 * spec_read_ack: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r7-baseurl.md ·
 *                docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-01.md · LoginScreen layout
 * must_keep: login-email/password/submit · C-LOGIN-ADB collapse path · brand chrome · face_live=false
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  InteractionManager,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LoginCredentialField, type LoginCredentialFieldHandle } from './LoginCredentialField';
import { BrandedLoginCard } from '../../components/auth/BrandedLoginCard';
import { XevnLogo } from '../../components/brand/XevnLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { isQaDevLoginEnabled } from '../../config/qaLogin';
import { useAuth, type MobileLoginResult, type SignInPayload } from '../../context/AuthContext';
import { getDefaultBaseUrl, hrmRequest } from '../../integrations/hrmApiClient';
import { parseJwtClaims } from '../../integrations/jwtClaims';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';
import { brandDisplayText, brandBodyText } from '../../theme/brandTypography';
import { borderWidth, colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { resolveMembershipCompanyLabel } from './membershipDisplay';

function enrichDevPayloadFromJwt(payload: SignInPayload): SignInPayload {
  const claims = parseJwtClaims(payload.accessToken);
  if (!claims) return payload;
  return {
    ...payload,
    tenantId: payload.tenantId.trim() || claims.tenantId?.trim() || payload.tenantId,
    companyId: payload.companyId.trim() || claims.companyId?.trim() || payload.companyId,
    companyUuid: payload.companyUuid.trim() || claims.company_uuid?.trim() || payload.companyUuid,
    employeeId: payload.employeeId.trim() || claims.employee_id?.trim() || payload.employeeId,
    roles: payload.roles.length ? payload.roles : claims.roles ?? [],
  };
}

export function LoginScreen() {
  const { signIn, signInWithMobileLogin } = useAuth();
  const qaDevLogin = isQaDevLoginEnabled();
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  /** Collapsed by default — production email/password first; adb/uiautomator C-LOGIN-ADB. */
  const [showDev, setShowDev] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [companyId, setCompanyId] = useState('holding');
  const [companyUuid, setCompanyUuid] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [internalKey, setInternalKey] = useState('');
  const [busy, setBusy] = useState(false);
  const emailFieldRef = useRef<LoginCredentialFieldHandle>(null);
  const passwordFieldRef = useRef<LoginCredentialFieldHandle>(null);
  const baseUrlFieldRef = useRef<LoginCredentialFieldHandle>(null);
  const scrollRef = useRef<ScrollView>(null);

  const resolveCredentials = () => {
    const resolvedEmail = (emailFieldRef.current?.getText() ?? email).trim();
    const resolvedPassword = passwordFieldRef.current?.getText() ?? password;
    return { email: resolvedEmail, password: resolvedPassword };
  };

  /** Dev URL panel — adb fill must win over controlled React state (R6 OBS). */
  const resolveBaseUrl = () => {
    const fromField = baseUrlFieldRef.current?.getText();
    const raw = (fromField !== undefined && fromField !== null ? fromField : baseUrl).trim();
    return raw || getDefaultBaseUrl();
  };

  /** Persist URL into React state before unmounting the field (collapse panel). */
  const commitBaseUrlFromField = () => {
    baseUrlFieldRef.current?.blur();
    const loginBaseUrl = resolveBaseUrl();
    if (loginBaseUrl !== baseUrl) setBaseUrl(loginBaseUrl);
    return loginBaseUrl;
  };

  const onToggleDevPanel = () => {
    if (showDev) {
      commitBaseUrlFromField();
      setShowDev(false);
      return;
    }
    emailFieldRef.current?.blur();
    passwordFieldRef.current?.blur();
    Keyboard.dismiss();
    setShowDev(true);
  };

  /** R7: after expand, focus URL in mid-band so adb tap/input text lands on EditText. */
  useEffect(() => {
    if (!showDev) return;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    const handle = InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        baseUrlFieldRef.current?.focus();
      }, Platform.OS === 'android' ? 180 : 80);
    });
    return () => handle.cancel();
  }, [showDev]);

  const onMobileLogin = async () => {
    emailFieldRef.current?.blur();
    passwordFieldRef.current?.blur();
    baseUrlFieldRef.current?.blur();
    const { email: loginEmail, password: loginPassword } = resolveCredentials();
    const loginBaseUrl = resolveBaseUrl();
    if (loginEmail !== email) setEmail(loginEmail);
    if (loginPassword !== password) setPassword(loginPassword);
    if (loginBaseUrl !== baseUrl) setBaseUrl(loginBaseUrl);

    if (!loginEmail || !loginPassword.trim()) {
      Alert.alert(vi.error, 'Nhập email và mật khẩu.');
      return;
    }
    setBusy(true);
    try {
      const authCfg = { baseUrl: loginBaseUrl };
      const res = await hrmRequest<MobileLoginResult>(authCfg, '/auth/mobile/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (!res.ok) {
        Alert.alert(vi.error, formatHrmError(res));
        return;
      }
      const active = res.data.active_membership;
      if (res.data.memberships && res.data.memberships.length > 1) {
        // Xử lý: nhãn từ BE *_label — không map slug trên FE (OS 28).
        const activeCompanyLabel = resolveMembershipCompanyLabel(active);
        Alert.alert(
          'Nhiều phạm vi',
          `Bạn có ${res.data.memberships.length} công ty. Đang dùng: ${activeCompanyLabel}. Đổi phạm vi tại Cài đặt → Phạm vi.`,
        );
      }
      await signInWithMobileLogin({
        baseUrl: authCfg.baseUrl,
        tenantId: active?.tenant_id ?? res.data.default_tenant_id ?? '',
        companyId: active?.company_id ?? res.data.default_company_id ?? '',
        companyUuid: active?.company_uuid ?? res.data.company_uuid ?? '',
        employeeId: active?.employee_id ?? res.data.employee.id,
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        internalApiKey: '',
        roles: res.data.roles,
        memberships: res.data.memberships ?? [],
        login: res.data,
      });
    } finally {
      setBusy(false);
    }
  };

  const onDevSubmit = async () => {
    baseUrlFieldRef.current?.blur();
    const loginBaseUrl = resolveBaseUrl();
    if (loginBaseUrl !== baseUrl) setBaseUrl(loginBaseUrl);
    if (!tenantId.trim() || !companyId.trim()) {
      Alert.alert(vi.error, 'Dev: nhập tenantId và companyId (header).');
      return;
    }
    if (!accessToken.trim() && !internalKey.trim()) {
      Alert.alert(vi.error, 'Cần Bearer JWT hoặc khóa nội bộ (dev).');
      return;
    }
    setBusy(true);
    try {
      let payload: SignInPayload = {
        baseUrl: loginBaseUrl,
        tenantId: tenantId.trim(),
        companyId: companyId.trim(),
        companyUuid: companyUuid.trim(),
        employeeId: employeeId.trim(),
        accessToken: accessToken.trim(),
        refreshToken: '',
        internalApiKey: internalKey.trim(),
        roles: [],
        memberships: [],
        tokenExpiresAt: 0,
      };
      payload = enrichDevPayloadFromJwt(payload);
      if (!payload.tenantId.trim() || !payload.companyId.trim()) {
        Alert.alert(vi.error, 'Dev: thiếu tenantId hoặc companyId (header).');
        return;
      }
      const probe = await hrmRequest<{ service?: string }>(
        {
          baseUrl: payload.baseUrl,
          tenantId: payload.tenantId,
          companyId: payload.companyId,
          accessToken: payload.accessToken || undefined,
          internalApiKey: payload.internalApiKey || undefined,
        },
        '/',
        { method: 'GET' },
      );
      if (!probe.ok) {
        Alert.alert(vi.error, formatHrmError(probe));
        return;
      }
      await signIn(payload);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      testID="login-screen-root"
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.flex}>
        <LinearGradient
          colors={[colors.homeHeroGradientStart, colors.homeHeroGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroGradient, showDev && styles.heroGradientCompact]}
        />
        <ScrollView
          ref={scrollRef}
          style={styles.scrollWrap}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.heroContent, showDev && styles.heroContentCompact]}>
            <XevnLogo size={showDev ? 56 : 88} testID="login-xevn-logo" />
            <Text style={styles.heroTitle}>{vi.appName}</Text>
            {showDev ? null : (
              <Text style={styles.heroHint}>
                Đăng nhập bằng email và mật khẩu. Hệ thống tự xác định công ty từ hồ sơ nhân viên.
              </Text>
            )}
          </View>

          <BrandedLoginCard>
            {/* Above-fold when Đăng nhập dev expanded — adb mid-band hit target (R7). */}
            {qaDevLogin && showDev ? (
              <LoginCredentialField
                ref={baseUrlFieldRef}
                label="URL máy chủ"
                defaultValue={baseUrl}
                onLiveTextChange={setBaseUrl}
                autoCapitalize="none"
                keyboardType="url"
                placeholder="http://10.0.2.2:28001"
                testID="login-dev-base-url"
                autoFocus={showDev}
                accessibilityLabel="login-dev-base-url"
              />
            ) : null}
            <LoginCredentialField
              ref={emailFieldRef}
              label="Email"
              onLiveTextChange={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@company.com"
              testID="login-email"
              autoFocus={!showDev}
              accessibilityLabel="login-email"
            />
            <LoginCredentialField
              ref={passwordFieldRef}
              label="Mật khẩu"
              onLiveTextChange={setPassword}
              secureTextEntry
              placeholder="••••••••"
              testID="login-password"
              accessibilityLabel="login-password"
            />
            <PrimaryButton
              label={busy ? vi.loading : vi.login}
              onPress={() => {
                Keyboard.dismiss();
                emailFieldRef.current?.blur();
                passwordFieldRef.current?.blur();
                commitBaseUrlFromField();
                InteractionManager.runAfterInteractions(() => {
                  setTimeout(() => void onMobileLogin(), Platform.OS === 'android' ? 120 : 0);
                });
              }}
              disabled={busy}
              loading={busy}
              style={styles.loginBtn}
              testID="login-submit"
            />
          </BrandedLoginCard>

          {qaDevLogin ? (
            <View style={styles.devSection}>
              <Pressable
                testID="login-dev-toggle"
                accessibilityLabel="login-dev-toggle"
                onPress={onToggleDevPanel}
              >
                <Text style={styles.devToggle}>
                  {showDev ? 'Ẩn đăng nhập dev' : 'Đăng nhập dev (JWT / internal key)'}
                </Text>
              </Pressable>
              {showDev ? (
                <View style={styles.devBox} testID="login-dev-panel">
                  <FormField label="tenantId" value={tenantId} onChangeText={setTenantId} autoCapitalize="none" />
                  <FormField label="companyId (header)" value={companyId} onChangeText={setCompanyId} autoCapitalize="none" />
                  <FormField label="Công ty (phạm vi)" value={companyUuid} onChangeText={setCompanyUuid} autoCapitalize="none" />
                  <FormField label="Mã nhân viên" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="none" />
                  <FormField label="Bearer token" value={accessToken} onChangeText={setAccessToken} multiline autoCapitalize="none" />
                  <FormField label="x-internal-api-key" value={internalKey} onChangeText={setInternalKey} autoCapitalize="none" />
                  <PrimaryButton
                    label="Dev sign-in"
                    onPress={() => void onDevSubmit()}
                    disabled={busy}
                    loading={busy}
                    variant="secondary"
                    testID="login-dev-submit"
                  />
                </View>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function FormField(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences';
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  placeholder?: string;
  testID?: string;
  autoFocus?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        testID={props.testID}
        accessibilityLabel={props.accessibilityLabel ?? props.testID}
        style={[styles.input, props.multiline && styles.inputMulti]}
        value={props.value}
        onChangeText={props.onChangeText}
        multiline={props.multiline}
        secureTextEntry={props.secureTextEntry}
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
        keyboardType={props.keyboardType}
        placeholder={props.placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={props.autoFocus}
        importantForAutofill="no"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
  },
  scrollWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing['3xl'],
    paddingBottom: layout.screenPaddingBottom + spacing['2xl'],
    flexGrow: 1,
  },
  heroGradientCompact: {
    height: '36%',
  },
  heroContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing['2xl'] + spacing.lg,
  },
  heroContentCompact: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  heroTitle: {
    ...brandDisplayText({ fontWeight: '700' }),
    fontSize: typography.fontSize.title1,
    color: colors.surface,
    lineHeight: typography.lineHeight.title1,
  },
  heroHint: {
    ...brandBodyText(),
    color: 'rgba(255,255,255,0.92)',
    fontSize: typography.fontSize.body,
    textAlign: 'center',
    lineHeight: typography.lineHeight.body,
    paddingHorizontal: spacing.md,
  },
  loginBtn: { marginTop: spacing.xs },
  field: { gap: 4 },
  label: {
    color: colors.text,
    fontSize: typography.fontSize.subhead,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.subhead,
  },
  input: {
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  devSection: {
    marginTop: spacing.lg,
    paddingHorizontal: layout.screenPaddingH,
  },
  devToggle: {
    color: colors.primary,
    fontSize: typography.fontSize.subhead,
    textAlign: 'center',
    lineHeight: typography.lineHeight.subhead,
  },
  devBox: {
    marginTop: spacing.sm,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
