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
import { useAuth, type SignInPayload } from '../../context/AuthContext';
import { EXPO_DEFAULT_COMPANY_ID, EXPO_DEFAULT_TENANT_ID } from '../../config/tenantDefaults';
import { getDefaultBaseUrl, hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [baseUrl, setBaseUrl] = useState(getDefaultBaseUrl());
  const [tenantId, setTenantId] = useState(EXPO_DEFAULT_TENANT_ID);
  const [companyId, setCompanyId] = useState(EXPO_DEFAULT_COMPANY_ID);
  const [companyUuid, setCompanyUuid] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [internalKey, setInternalKey] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!tenantId.trim() || !companyId.trim()) {
      Alert.alert(vi.error, 'Nhập tenantId và mã công ty (header).');
      return;
    }
    if (!accessToken.trim() && !internalKey.trim()) {
      Alert.alert(vi.error, 'Cần Bearer JWT hoặc khóa nội bộ (dev) theo SRS UC-HRM-MOB-01.');
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
        internalApiKey: internalKey.trim(),
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
      await signIn({
        baseUrl: payload.baseUrl,
        tenantId: payload.tenantId,
        companyId: payload.companyId,
        companyUuid: payload.companyUuid,
        employeeId: payload.employeeId,
        accessToken: payload.accessToken,
        internalApiKey: payload.internalApiKey,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{vi.appName}</Text>
        <Text style={styles.hint}>
          UC-HRM-MOB-01/02: Bearer JWT (HS256 nội bộ) hoặc x-internal-api-key (dev). Header x-tenant-id / x-company-id
          gửi kèm mọi request.
        </Text>
        <L label="HRM_API_BASE_URL" value={baseUrl} onChangeText={setBaseUrl} autoCapitalize="none" />
        <L label="tenantId" value={tenantId} onChangeText={setTenantId} autoCapitalize="none" />
        <L label="companyId (header, ví dụ holding)" value={companyId} onChangeText={setCompanyId} autoCapitalize="none" />
        <L
          label="UUID công ty (chấm công / đơn / lương — bắt buộc nếu API yêu cầu UUID)"
          value={companyUuid}
          onChangeText={setCompanyUuid}
          autoCapitalize="none"
        />
        <L label="employeeId (UUID — tùy chọn, chấm công)" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="none" />
        <L
          label="Bearer access token (không lưu mật khẩu)"
          value={accessToken}
          onChangeText={setAccessToken}
          multiline
          autoCapitalize="none"
        />
        <L label="x-internal-api-key (chỉ dev)" value={internalKey} onChangeText={setInternalKey} autoCapitalize="none" />
        <Pressable style={[styles.btn, busy && styles.btnDisabled]} onPress={() => void onSubmit()} disabled={busy}>
          <Text style={styles.btnText}>{busy ? vi.loading : vi.login}</Text>
        </Pressable>
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
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMulti]}
        value={props.value}
        onChangeText={props.onChangeText}
        multiline={props.multiline}
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
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
    marginTop: 16,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#0f172a', fontWeight: '700', fontSize: 16 },
});
