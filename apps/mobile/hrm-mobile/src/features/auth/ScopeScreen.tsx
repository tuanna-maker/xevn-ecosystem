import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { ListRow } from '../../components/ui/ListRow';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { useAuth, type MobileMembership } from '../../context/AuthContext';
import { resolveHrmCompanyHeaderId } from '../../integrations/hrmApiClient';
import {
  fetchHrmOperatingUnits,
  type HrmOperatingUnitRow,
  PILOT_HRM_OPERATING_UNITS,
} from '../../integrations/hrmOperatingUnits';
import {
  isGroupCeoMasterTenant,
  readOperatingUnitFilterSelection,
  type HrmOperatingUnitSlug,
} from '../../integrations/hrmListScope';
import { vi } from '../../i18n/vi';
import { colors, spacing, typography } from '../../theme/tokens';
import { resolveCompanyDisplayVi } from '../../utils/companyDisplayVi';
import {
  resolveMembershipRowMeta,
  resolveMembershipRowSubtitle,
  resolveMembershipRowTitle,
  resolveMembershipSectionTitle,
  resolveOperatingUnitRowMeta,
  resolveOperatingUnitRowSubtitle,
  resolveOperatingUnitsSectionTitle,
  resolveRollupOperatingUnitMeta,
  resolveRollupOperatingUnitSubtitle,
  resolveScopeScreenSubtitle,
} from '../../utils/scopeScreenCopy';

/**
 * UC-HRM-MOB-02 + U39 — phạm vi tenant/công ty và lọc đơn vị vận hành (group CEO).
 * JWT giữ `main`; query API dùng slug đã chọn (BR-INT-03). Member CEO chỉ thấy membership.
 */
export function ScopeScreen() {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [units, setUnits] = useState<HrmOperatingUnitRow[]>([]);
  const [unitsError, setUnitsError] = useState('');

  const showOperatingUnits = isGroupCeoMasterTenant(auth.tenantId);
  const selectedOpUnit = readOperatingUnitFilterSelection(auth.companyId);
  const headerWire = resolveHrmCompanyHeaderId(auth.companyUuid, auth.companyId);
  const companyLabel = resolveCompanyDisplayVi(auth.companyId, {
    membershipCompanyDisplay: auth.memberships.find(
      (m) => m.employee_id === auth.employeeId && m.tenant_id === auth.tenantId,
    )?.company_display,
    operatingUnits: units.length ? units : undefined,
  });

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

  const loadOperatingUnits = useCallback(async () => {
    if (!showOperatingUnits || !auth.signedIn) return;
    setUnitsLoading(true);
    setUnitsError('');
    try {
      const rows = await fetchHrmOperatingUnits(auth.getHrmAuth());
      setUnits(rows);
    } catch {
      setUnits(PILOT_HRM_OPERATING_UNITS);
      setUnitsError('Dùng danh sách pilot — không tải được từ máy chủ.');
    } finally {
      setUnitsLoading(false);
    }
  }, [auth, showOperatingUnits]);

  useEffect(() => {
    void loadOperatingUnits();
  }, [loadOperatingUnits]);

  const onPickOperatingUnit = async (selection: 'all' | HrmOperatingUnitSlug, label: string) => {
    if (selection === selectedOpUnit) {
      Alert.alert('Đã chọn', 'Phạm vi đơn vị hiện tại không đổi.');
      return;
    }
    setBusy(true);
    try {
      await auth.selectOperatingUnitFilter(selection);
      Alert.alert('Đã lưu', `Lọc danh sách: ${label}`);
    } finally {
      setBusy(false);
    }
  };

  const onPickMembership = async (m: MobileMembership) => {
    if (m.employee_id === auth.employeeId && m.tenant_id === auth.tenantId) {
      Alert.alert('Đã chọn', 'Kiêm nhiệm hiện tại không đổi.');
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
      if (isGroupCeoMasterTenant(m.tenant_id)) {
        void loadOperatingUnits();
      }
    } finally {
      setBusy(false);
    }
  };

  const subtitle = resolveScopeScreenSubtitle(showOperatingUnits);

  return (
    <AppScreenLayout
      title="Phạm vi công ty"
      subtitle={subtitle}
      scroll
      empty={!showOperatingUnits && memberships.length === 0}
      emptyMessage="Chưa có phạm vi — đăng nhập lại bằng email/mật khẩu."
    >
      <SurfaceCard title="Đang dùng">
        <Text style={styles.scopeMeta}>
          Công ty: {companyLabel}
          {typeof __DEV__ !== 'undefined' && __DEV__ ? (
            <>
              {'\n'}
              Tenant: {auth.tenantId || '—'}
              {'\n'}
              Query `company_id`: {auth.companyId || '—'}
              {'\n'}
              Header `x-company-id`: {headerWire || '(thiếu UUID/slug)'}
            </>
          ) : null}
        </Text>
      </SurfaceCard>

      {showOperatingUnits ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{resolveOperatingUnitsSectionTitle()}</Text>
          {unitsError ? <Text style={styles.hint}>{unitsError}</Text> : null}
          {unitsLoading && units.length === 0 ? (
            <Text style={styles.hint}>Đang tải từ GET /operating-units…</Text>
          ) : null}
          <Pressable
            onPress={() => void onPickOperatingUnit('all', 'Tất cả đơn vị (rollup)')}
            disabled={busy}
            style={({ pressed }) => [pressed && !busy && styles.pressed, busy && styles.disabled]}
          >
            <ListRow
              title="Tất cả đơn vị (rollup)"
              subtitle={resolveRollupOperatingUnitSubtitle()}
              meta={resolveRollupOperatingUnitMeta()}
              trailing={
                selectedOpUnit === 'all' ? (
                  <StatusBadge status="approved" label="Đang dùng" tone="success" />
                ) : undefined
              }
            />
          </Pressable>
          {units.map((unit) => {
            const active = selectedOpUnit === unit.operating_slug;
            return (
              <Pressable
                key={unit.operating_slug}
                onPress={() => void onPickOperatingUnit(unit.operating_slug, unit.display_name_vi)}
                disabled={busy}
                style={({ pressed }) => [pressed && !busy && styles.pressed, busy && styles.disabled]}
              >
                <ListRow
                  title={unit.display_name_vi}
                  subtitle={resolveOperatingUnitRowSubtitle(unit)}
                  meta={resolveOperatingUnitRowMeta(unit)}
                  trailing={
                    active ? <StatusBadge status="approved" label="Đang dùng" tone="success" /> : undefined
                  }
                />
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {memberships.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{resolveMembershipSectionTitle(memberships.length > 1)}</Text>
          {!showOperatingUnits ? (
            <Text style={styles.hint}>
              Chỉ xem phạm vi công ty của bạn. Đổi kiêm nhiệm khi có nhiều công ty.
            </Text>
          ) : null}
          {memberships.map((m) => {
            const active =
              m.employee_id === auth.employeeId && m.tenant_id === auth.tenantId;
            return (
              <Pressable
                key={`${m.tenant_id}:${m.company_id}:${m.employee_id}`}
                onPress={() => void onPickMembership(m)}
                disabled={busy}
                style={({ pressed }) => [pressed && !busy && styles.pressed, busy && styles.disabled]}
              >
                <ListRow
                  title={resolveMembershipRowTitle(m, units)}
                  subtitle={resolveMembershipRowSubtitle(m)}
                  meta={resolveMembershipRowMeta(m)}
                  trailing={
                    active ? <StatusBadge status="approved" label="Đang dùng" tone="success" /> : undefined
                  }
                />
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.6 },
  section: { marginTop: spacing.md },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  scopeMeta: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
