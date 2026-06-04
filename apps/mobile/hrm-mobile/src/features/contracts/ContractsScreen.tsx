import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

type Contract = {
  id: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: string;
};

type Insurance = {
  id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
  status: string;
};

type Row = { id: string; title: string; subtitle: string };

export function ContractsScreen() {
  const auth = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [err, setErr] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const companyId = auth.getAttendanceCompanyId();
    if (!companyId) {
      setErr('Thiếu UUID công ty (membership company_uuid).');
      return;
    }
    const q = new URLSearchParams({ company_id: companyId });
    const eid = auth.employeeId.trim();
    if (eid) q.set('employee_id', eid);

    const [cRes, iRes] = await Promise.all([
      hrmRequest<unknown>(auth.getHrmAuth(), `/contracts-insurance/contracts?${q.toString()}`, { method: 'GET' }),
      hrmRequest<unknown>(
        auth.getHrmAuth(),
        `/contracts-insurance/insurance/expiring?${new URLSearchParams({ company_id: companyId, days: '90' }).toString()}`,
        { method: 'GET' },
      ),
    ]);

    const parts: string[] = [];
    if (cRes.ok) setContracts(readListRows<Contract>(cRes.data));
    else {
      setContracts([]);
      parts.push(`Hợp đồng: ${formatHrmError(cRes)}`);
    }
    if (iRes.ok) setInsurance(readListRows<Insurance>(iRes.data));
    else {
      setInsurance([]);
      parts.push(`BH: ${formatHrmError(iRes)}`);
    }
    setErr(parts.join('\n'));
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const sections = useMemo(
    () =>
      [
        {
          title: 'Hợp đồng',
          data: contracts.map((item) => ({
            id: item.id,
            title: item.contract_type,
            subtitle: `${item.start_date} → ${item.end_date} · ${item.status}`,
          })),
        },
        {
          title: 'Bảo hiểm sắp hết hạn (90 ngày)',
          data: insurance.map((item) => ({
            id: item.id,
            title: item.provider,
            subtitle: `${item.policy_number} · hết hạn ${item.expiry_date} · ${item.status}`,
          })),
        },
      ] as { title: string; data: Row[] }[],
    [contracts, insurance],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.pageTitle}>UC-HRM-MOB-10 — {vi.contracts}</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <SectionList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.section}>{title}</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.main}>{item.title}</Text>
            <Text style={styles.sub}>{item.subtitle}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Không có dữ liệu</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  pageTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  err: { color: '#f87171', marginBottom: 8, fontSize: 13 },
  section: { color: '#94a3b8', fontSize: 13, marginTop: 12, marginBottom: 6 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  main: { color: '#e2e8f0', fontSize: 15 },
  sub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  empty: { color: '#64748b', marginTop: 24 },
});
