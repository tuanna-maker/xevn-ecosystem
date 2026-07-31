import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProfileSectionCard } from '../../components/profile/ProfileSectionCard';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { ElevatedCard } from '../../components/ui/ElevatedCard';
import { EmptyStateIllustration } from '../../components/ui/EmptyStateIllustration';
import { EssRichListRow } from '../../components/ui/EssRichListRow';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import { colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';
import { formatHrmDate } from '../../utils/formatHrm';
import { resolveContractTypeLabel } from '../../utils/profileTabs';
import { userFacingScopeError } from '../../utils/scopeError';

/**
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Pass statusLabel VI for contract/insurance EssRichListRow badges
 * Why: U72 M-F-01 raw active/expired/terminated
 * must_keep: resolveContractTypeLabel; U65 · HOLD_DEPLOY
 */

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

export function ContractsScreen() {
  const auth = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const companyId = auth.getAttendanceCompanyId();
    if (!companyId) {
      setErr(userFacingScopeError('company'));
      setContracts([]);
      setInsurance([]);
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

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void refresh();
    }, [refresh]),
  );

  const isEmpty = contracts.length === 0 && insurance.length === 0;

  const listHeader = (
    <View style={styles.header}>
      <Text style={styles.headerSub}>Hợp đồng lao động và bảo hiểm</Text>
    </View>
  );

  if (loading && isEmpty && !err) {
    return (
      <View style={styles.root}>
        {listHeader}
        <ListShimmerPlaceholder testID="contracts-list-shimmer" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.primary} />
      }
    >
      {listHeader}

      {err ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{err}</Text>
        </View>
      ) : null}

      {isEmpty && !err ? (
        <EmptyStateIllustration
          testID="contracts-empty"
          title="Chưa có dữ liệu hợp đồng"
          hint="Hợp đồng và bảo hiểm sẽ hiển thị khi HR cập nhật."
          icon="document-text-outline"
        />
      ) : null}

      {contracts.length > 0 ? (
        <ProfileSectionCard title="Hợp đồng" icon="document-text-outline" testID="contracts-section-contracts">
          {contracts.map((item) => (
            <ElevatedCard key={item.id} style={styles.rowCard}>
              <EssRichListRow
                icon="document-text"
                iconTone="primary"
                title={resolveContractTypeLabel(item.contract_type)}
                subtitle={`${formatHrmDate(item.start_date)} → ${formatHrmDate(item.end_date)}`}
                status={item.status}
                statusLabel={statusLabel(item.status)}
              />
            </ElevatedCard>
          ))}
        </ProfileSectionCard>
      ) : null}

      {insurance.length > 0 ? (
        <ProfileSectionCard title="Bảo hiểm sắp hết hạn (90 ngày)" icon="shield-checkmark-outline" testID="contracts-section-insurance">
          {insurance.map((item) => (
            <ElevatedCard key={item.id} style={styles.rowCard}>
              <EssRichListRow
                icon="shield-checkmark"
                iconTone="accent"
                title={item.provider}
                subtitle={`${item.policy_number} · hết hạn ${formatHrmDate(item.expiry_date)}`}
                status={item.status}
                statusLabel={statusLabel(item.status)}
              />
            </ElevatedCard>
          ))}
        </ProfileSectionCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.iosGroupedBackground },
  header: { gap: 4, marginBottom: spacing.sm },
  headerSub: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: statusToneColor('danger').bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: statusToneColor('danger').border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: statusToneColor('danger').text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  rowCard: { marginBottom: spacing.sm },
});
