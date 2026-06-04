import React, { useState } from 'react';

import {

  Alert,

  KeyboardAvoidingView,

  Platform,

  Pressable,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  View,

} from 'react-native';

import { useAuth, type MobileLoginResult, type SignInPayload } from '../../context/AuthContext';

import { getDefaultBaseUrl, hrmRequest } from '../../integrations/hrmApiClient';

import { formatHrmError } from '../../integrations/mapApiError';

import { vi } from '../../i18n/vi';



export function LoginScreen() {

  const { signIn, signInWithMobileLogin } = useAuth();

  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl());

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [showDev, setShowDev] = useState(typeof __DEV__ !== 'undefined' && __DEV__);

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

        Alert.alert(

          'Nhiều phạm vi',

          `Bạn có ${res.data.memberships.length} công ty. Đang dùng: ${active?.company_display ?? active?.tenant_id ?? 'mặc định'}. Đổi phạm vi tại Cài đặt → Phạm vi.`,

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

      const payload: SignInPayload = {

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

      };

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

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>{vi.appName}</Text>

        <Text style={styles.hint}>

          Đăng nhập email + mật khẩu. Hệ thống tự xác định tenant/công ty từ hồ sơ nhân viên (giống portal).

        </Text>

        <L label="HRM_API_BASE_URL" value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" />

        <L label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

        <L label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry />

        <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={() => void onMobileLogin()} disabled={busy}>

          <Text style={styles.btnText}>{busy ? vi.loading : vi.login}</Text>

        </Pressable>

        {typeof __DEV__ !== 'undefined' && __DEV__ ? (

          <>

            <Pressable onPress={() => setShowDev((v) => !v)}>

              <Text style={styles.devToggle}>{showDev ? 'Ẩn đăng nhập dev' : 'Đăng nhập dev (JWT / internal key)'}</Text>

            </Pressable>

            {showDev ? (

              <View style={styles.devBox}>

                <L label="tenantId" value={tenantId} onChangeText={setTenantId} autoCapitalize="none" />

                <L label="companyId (header)" value={companyId} onChangeText={setCompanyId} autoCapitalize="none" />

                <L label="UUID công ty" value={companyUuid} onChangeText={setCompanyUuid} autoCapitalize="none" />

                <L label="employeeId (UUID)" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="none" />

                <L label="Bearer token" value={accessToken} onChangeText={setAccessToken} multiline autoCapitalize="none" />

                <L label="x-internal-api-key" value={internalKey} onChangeText={setInternalKey} autoCapitalize="none" />

                <Pressable style={[styles.btnSecondary, busy && styles.btnDisabled]} onPress={() => void onDevSubmit()} disabled={busy}>

                  <Text style={styles.btnTextSecondary}>Dev sign-in</Text>

                </Pressable>

              </View>

            ) : null}

          </>

        ) : null}

      </ScrollView>

    </KeyboardAvoidingView>

  );

}



function L(props: {

  label: string;

  value: string;

  onChangeText: (t: string) => void;

  multiline?: boolean;

  autoCapitalize?: 'none' | 'sentences';

  secureTextEntry?: boolean;

  keyboardType?: 'default' | 'email-address';

}) {

  return (

    <View style={styles.field}>

      <Text style={styles.label}>{props.label}</Text>

      <TextInput

        style={[styles.input, props.multiline && styles.inputMulti]}

        value={props.value}

        onChangeText={props.onChangeText}

        multiline={props.multiline}

        secureTextEntry={props.secureTextEntry}

        autoCapitalize={props.autoCapitalize ?? 'sentences'}

        keyboardType={props.keyboardType}

        placeholderTextColor="#64748b"

      />

    </View>

  );

}



const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: '#0f172a' },

  scroll: { padding: 20, paddingTop: 48, gap: 12 },

  title: { fontSize: 24, fontWeight: '700', color: '#f8fafc' },

  hint: { color: '#94a3b8', fontSize: 13, marginBottom: 8 },

  field: { gap: 4 },

  label: { color: '#cbd5e1', fontSize: 12 },

  input: {

    borderWidth: 1,

    borderColor: '#334155',

    borderRadius: 8,

    paddingHorizontal: 12,

    paddingVertical: 10,

    color: '#f8fafc',

    backgroundColor: '#1e293b',

  },

  inputMulti: { minHeight: 80, textAlignVertical: 'top' },

  btn: {

    marginTop: 8,

    backgroundColor: '#0ea5e9',

    paddingVertical: 14,

    borderRadius: 10,

    alignItems: 'center',

  },

  btnSecondary: {

    marginTop: 8,

    backgroundColor: '#334155',

    paddingVertical: 12,

    borderRadius: 10,

    alignItems: 'center',

  },

  btnDisabled: { opacity: 0.6 },

  btnText: { color: '#0f172a', fontWeight: '700', fontSize: 16 },

  btnTextSecondary: { color: '#e2e8f0', fontWeight: '600' },

  devToggle: { color: '#38bdf8', marginTop: 12, fontSize: 13 },

  devBox: { marginTop: 8, gap: 8, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },

});

