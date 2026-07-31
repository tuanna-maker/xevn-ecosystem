/**
 * @CODE-MEMORY
 * Screen:     Auth — LoginScreen (hero + BrandedLoginCard)
 * UC:         UC-HRM-MOB-01 · AC-BRAND-DNA-03 / AC-BRAND-DNA-06
 * BR:         Login shell — primary gradient hero · L1 tokens · input DNA L2
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md §3 L3m
 * TechSpec:   THEME_USAGE.md § L3 · XEVN_BRAND_UIUX_PROPOSAL.md §3
 * Purpose:    Đăng nhập ESS — logo/mark XeVN trên hero primary; form card L3 DNA.
 * WorkItem:   MOB-XEVN-BRAND-SHELL-L3-01
 * Coded:      2026-07-22
 * Callers:    RootNavigator (unsigned)
 * Callees:    BrandedLoginCard · XevnLogo · colors.homeHeroGradient* · borderWidth.thin · radius.input|card
 * Impact:     Literal borderWidth:1 / ad-hoc radius → lệch FormField / Card DNA
 * must_keep:  XevnLogo mark; input/devBox dùng borderWidth.thin + colors.border; radius.input|card
 * SOLID:      Auth shell tách ESS remaster (L4c cấm ở wave này)
 * LastVerified: src/theme/__tests__/mobL3Shell.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-MOB-G-ORPH-KHOI-01
 * change_mode: FIX
 * What: Multi-membership login toast dùng resolveCompanyDisplayVi (G-ORPH-MOB-03)
 * Why: AC-MOB-LABEL-05 · BR-MOB-LABEL-03
 */
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BrandedLoginCard } from '../../components/auth/BrandedLoginCard';
import { XevnLogo } from '../../components/brand/XevnLogo';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { isQaDevLoginEnabled } from '../../config/qaLogin';
import { useAuth, type MobileLoginResult, type SignInPayload } from '../../context/AuthContext';
import { getDefaultBaseUrl, hrmRequest } from '../../integrations/hrmApiClient';
import { parseJwtClaims } from '../../integrations/jwtClaims';
import { formatHrmError } from '../../integrations/mapApiError';
import { resolveCompanyDisplayVi } from '../../utils/companyDisplayVi';
import { vi } from '../../i18n/vi';
import { borderWidth, colors, layout, radius, spacing, typography } from '../../theme/tokens';

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
  const nativeDev = typeof __DEV__ !== 'undefined' && __DEV__;
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDev, setShowDev] = useState(nativeDev);
  const [tenantId, setTenantId] = useState('');
  const [companyId, setCompanyId] = useState('holding');
  const [companyUuid, setCompanyUuid] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [internalKey, setInternalKey] = useState('');
  const [busy, setBusy] = useState(false);

  const onMobileLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(vi.error, 'Nhập email và mật khẩu.');
      return;
    }
    setBusy(true);
    try {
      const authCfg = { baseUrl: baseUrl.trim() || getDefaultBaseUrl() };
      const res = await hrmRequest<MobileLoginResult>(authCfg, '/auth/mobile/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) {
        Alert.alert(vi.error, formatHrmError(res));
        return;
      }
      const active = res.data.active_membership;
      if (res.data.memberships && res.data.memberships.length > 1) {
        const activeCompanyLabel = resolveCompanyDisplayVi(active?.company_id, {
          membershipCompanyDisplay: active?.company_display,
        });
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
        baseUrl: baseUrl.trim() || getDefaultBaseUrl(),
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
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.flex}>
        <LinearGradient
          colors={[colors.homeHeroGradientStart, colors.homeHeroGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        />
        <View style={styles.scrollWrap}>
          <View style={styles.heroContent}>
            <XevnLogo size={88} testID="login-xevn-logo" />
            <Text style={styles.heroTitle}>{vi.appName}</Text>
            <Text style={styles.heroHint}>
              Đăng nhập bằng email và mật khẩu. Hệ thống tự xác định công ty từ hồ sơ nhân viên.
            </Text>
          </View>

          <BrandedLoginCard>
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="name@company.com"
              testID="login-email"
            />
            <FormField
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              testID="login-password"
            />
            <PrimaryButton
              label={busy ? vi.loading : vi.login}
              onPress={() => void onMobileLogin()}
              disabled={busy}
              loading={busy}
              style={styles.loginBtn}
              testID="login-submit"
            />
          </BrandedLoginCard>

          {qaDevLogin ? (
            <View style={styles.devSection}>
              <Pressable onPress={() => setShowDev((v) => !v)}>
                <Text style={styles.devToggle}>
                  {showDev ? 'Ẩn đăng nhập dev' : 'Đăng nhập dev (JWT / internal key)'}
                </Text>
              </Pressable>
              {showDev ? (
                <View style={styles.devBox}>
                  <FormField
                    label="URL máy chủ"
                    value={baseUrl}
                    onChangeText={setBaseUrl}
                    autoCapitalize="none"
                  />
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
        </View>
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
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        testID={props.testID}
        style={[styles.input, props.multiline && styles.inputMulti]}
        value={props.value}
        onChangeText={props.onChangeText}
        multiline={props.multiline}
        secureTextEntry={props.secureTextEntry}
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
        keyboardType={props.keyboardType}
        placeholder={props.placeholder}
        placeholderTextColor={colors.textMuted}
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
    paddingTop: spacing['3xl'],
    paddingBottom: layout.screenPaddingBottom,
  },
  heroContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing['2xl'] + spacing.lg,
  },
  heroTitle: {
    fontSize: typography.fontSize.title1,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
    lineHeight: typography.lineHeight.title1,
  },
  heroHint: {
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
