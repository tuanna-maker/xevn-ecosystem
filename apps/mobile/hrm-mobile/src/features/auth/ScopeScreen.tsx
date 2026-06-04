import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth, type MobileMembership } from '../../context/AuthContext';
import { vi } from '../../i18n/vi';

/**
 * UC-HRM-MOB-02 — chọn phạm vi tenant/công ty từ danh sách server (multi-tenant).
 */
export function ScopeScreen() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const memberships = auth.memberships.length
    ? auth.memberships
    : auth.tenantId
      ? [
          {
            tenant_id: auth.tenantId,
            company_id: auth.companyId,
            company_uuid: auth.companyUuid,
            employee_id: auth.employeeId,
            employee_code: '',
            employee_name: '',
            company_display: auth.companyId,
            is_primary: true,
          } satisfies MobileMembership,
        ]
      : [];

  const onPick = async (m: MobileMembership) => {
    if (m.employee_id === auth.employeeId && m.tenant_id === auth.tenantId) {
      Alert.alert('Đã chọn', 'Phạm vi hiện tại không đổi.');
      return;
    }
    setBusy(true);
    try {
      const ok = await auth.selectMembership(m.employee_id);
      if (!ok) {
        Alert.alert(vi.error, 'Không đổi được phạm vi — thử đăng nhập lại.');
        return;
      }
      Alert.alert('Đã lưu', `${m.company_display} (${m.tenant_id})`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>Phạm vi công ty</Text>
      <Text style={styles.hint}>
        Danh sách từ server sau đăng nhập. Header API dùng UUID pháp nhân (`company_uuid`) của membership — không gửi slug
        `main` khi đã có UUID.
      </Text>
      {memberships.length === 0 ? (
        <Text style={styles.empty}>Chưa có phạm vi — đăng nhập lại bằng email/mật khẩu.</Text>
      ) : (
        memberships.map((m) => {
          const active =
            m.employee_id === auth.employeeId &&
            m.tenant_id === auth.tenantId &&
            m.company_id === auth.companyId;
          return (
            <Pressable
              key={`${m.tenant_id}:${m.company_id}:${m.employee_id}`}
              style={[styles.card, active && styles.cardActive, busy && styles.cardDisabled]}
              onPress={() => void onPick(m)}
              disabled={busy}
            >
              <Text style={styles.cardTitle}>{m.company_display}</Text>
              <Text style={styles.cardMeta}>
                tenant: {m.tenant_id} · header: {m.company_id}
              </Text>
              <Text style={styles.cardMeta}>
                {m.employee_name || '—'} ({m.employee_code || m.employee_id.slice(0, 8)})
              </Text>
              {active ? <Text style={styles.badge}>Đang dùng</Text> : null}
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { color: '#f8fafc', fontSize: 20, fontWeight: '700' },
  hint: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  empty: { color: '#64748b', fontSize: 14 },
  card: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1e293b',
    gap: 4,
  },
  cardActive: { borderColor: '#0ea5e9' },
  cardDisabled: { opacity: 0.6 },
  cardTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  cardMeta: { color: '#94a3b8', fontSize: 12 },
  badge: { color: '#38bdf8', fontSize: 12, fontWeight: '600', marginTop: 4 },
});
