/**
 * @CODE-MEMORY
 * Screen:     TabAttendance → CheckIn (AttendanceEntry mobile)
 * UC:         UC-HRM-MOB check-in · J-MOB clock-in
 * BR:         BR-ATT-01 location optional · sticky CTA clear home indicator
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §2.2 WCAG 2.4.12
 * TechSpec:   MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION.md §3–4.1
 * Purpose:    Chấm công vào — hero + vị trí thiết bị; StickyFooter thumbZone trên tab bar.
 * WorkItem:   D-UX-R3-WCAG-MOBILE-01
 * Coded:      2026-07-28
 * Callers:    AttendanceStack CheckIn
 * Callees:    AppScreenLayout · StickyFooter · PrimaryButton · checkInLocation
 * Impact:     Bỏ thumbZone / footerBottomExtra → CTA bị FAB/home indicator che
 * must_keep:  StickyFooter thumbZone; testID check-in-sticky-footer / check-in-submit; hide FAB on CheckIn
 * SOLID:      Screen owns submit; location util tách
 * LastVerified: docs/qa/evidence/d-ux-r3-wcag-mobile-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A
 * What: CheckInMethodSelector + FaceEnrollChromePanel (MOB-04/04b); GPS-only submit; face_live=false
 */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CheckInHeroCard } from '../../components/attendance/CheckInHeroCard';
import { CheckInMethodSelector } from '../../components/attendance/CheckInMethodSelector';
import { FaceEnrollChromePanel } from '../../components/attendance/FaceEnrollChromePanel';
import { ProfileSectionCard } from '../../components/profile/ProfileSectionCard';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StickyFooter } from '../../components/ui/StickyFooter';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import { fetchEmployeeById, resolveEmployeeMetaFromMemberships } from '../../integrations/hrmEmployees';
import { formatHrmError } from '../../integrations/mapApiError';
import { enqueueOfflineWrite } from '../../integrations/offlineQueue';
import { useNetwork } from '../../context/NetworkContext';
import { vi } from '../../i18n/vi';
import { groupedLayout } from '../../theme/groupedLayout';
import { colors, layout, statusToneColor, typography } from '../../theme/tokens';
import {
  buildCheckInSubmitBody,
  resolveDeviceLocationLabel,
  type DeviceLocationSnapshot,
  type DeviceLocationUiState,
} from '../../utils/checkInLocation';
import { formatHrmDate } from '../../utils/formatHrm';
import { OFFLINE_CHECKIN_QUEUED_MESSAGE } from '../../utils/scopeError';
import {
  canSubmitCheckInWithChannel,
  resolveDefaultCheckInChannel,
  type CheckInChannelId,
} from '../../utils/checkInChannel';

async function captureDeviceLocation(): Promise<DeviceLocationSnapshot> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { granted: false };
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { granted: true };
    }
    return { granted: true, latitude, longitude };
  } catch {
    return { granted: false };
  }
}

export function CheckInScreen() {
  const auth = useAuth();
  const nav = useNavigation();
  const net = useNetwork();
  const blockIfOffline = useOfflineWriteGuard();
  const [busy, setBusy] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<DeviceLocationUiState>('idle');
  const [locationSnapshot, setLocationSnapshot] = useState<DeviceLocationSnapshot>({ granted: false });
  const [checkInChannel, setCheckInChannel] = useState<CheckInChannelId>(resolveDefaultCheckInChannel);

  const cid = auth.getAttendanceCompanyId();
  const employeeId = auth.employeeId.trim();

  const loadProfile = useCallback(async () => {
    const eid = auth.employeeId.trim();
    if (!eid) {
      setFullName('');
      setEmployeeCode('');
      setAvatarUrl(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const fromMembership = resolveEmployeeMetaFromMemberships(auth.memberships, eid);
    const row = await fetchEmployeeById(auth.getHrmAuth(), eid);
    setFullName(row?.full_name?.trim() || fromMembership?.employee_name || '');
    setEmployeeCode(row?.employee_code?.trim() || fromMembership?.employee_code || '');
    setAvatarUrl(row?.avatar_url ?? null);
    setProfileLoading(false);
  }, [auth]);

  const refreshLocation = useCallback(async () => {
    setLocationState('loading');
    const snapshot = await captureDeviceLocation();
    setLocationSnapshot(snapshot);
    if (!snapshot.granted) {
      setLocationState('denied');
      return;
    }
    if (Number.isFinite(snapshot.latitude) && Number.isFinite(snapshot.longitude)) {
      setLocationState('ready');
      return;
    }
    setLocationState('error');
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
      void refreshLocation();
    }, [loadProfile, refreshLocation]),
  );

  const submit = async () => {
    if (!canSubmitCheckInWithChannel(checkInChannel)) {
      Alert.alert(
        'Khuôn mặt (MVP)',
        'Chấm công bằng nhận diện khuôn mặt chưa golive. Chọn «Vị trí GPS» để chấm công.',
      );
      return;
    }
    if (!cid) {
      Alert.alert('Thiếu phạm vi công ty', 'Vào Cài đặt để cấu hình phạm vi chấm công.');
      return;
    }
    if (!employeeId) {
      Alert.alert(vi.error, 'Không xác định được nhân viên. Đăng nhập lại hoặc vào Cài đặt.');
      return;
    }

    setBusy(true);
    try {
      let location = locationSnapshot;
      if (locationState !== 'ready') {
        setLocationState('loading');
        location = await captureDeviceLocation();
        setLocationSnapshot(location);
        if (!location.granted) {
          setLocationState('denied');
        } else if (Number.isFinite(location.latitude) && Number.isFinite(location.longitude)) {
          setLocationState('ready');
        } else {
          setLocationState('error');
        }
      }

      const body = buildCheckInSubmitBody({
        companyId: cid,
        employeeId,
        location,
      });

      if (net.offline) {
        await enqueueOfflineWrite('/attendance/records', 'POST', body);
        Alert.alert('Đã xếp hàng', OFFLINE_CHECKIN_QUEUED_MESSAGE);
        return;
      }
      const off = blockIfOffline();
      if (off) {
        Alert.alert(vi.error, off);
        return;
      }
      const res = await auth.requestHrm<unknown>('/attendance/records', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.ok) Alert.alert('Thành công', res.code);
      else Alert.alert(vi.error, formatHrmError(res));
    } finally {
      setBusy(false);
    }
  };

  const locationLabel = resolveDeviceLocationLabel(locationState);

  return (
    <AppScreenLayout
      subtitle={`Hôm nay · ${formatHrmDate(new Date().toISOString())}`}
      stackHeaderPresent
      scroll
      grouped
      keyboardShouldPersistTaps="handled"
      footerBottomExtra={groupedLayout.belowSubtitle}
      footer={
        <StickyFooter thumbZone testID="check-in-sticky-footer">
          <PrimaryButton
            label={busy ? vi.loading : 'Chấm công vào'}
            onPress={() => void submit()}
            disabled={busy || profileLoading || !canSubmitCheckInWithChannel(checkInChannel)}
            loading={busy}
            testID="check-in-submit"
          />
          <PrimaryButton
            label="Lịch sử chấm công"
            onPress={() => nav.navigate('AttendanceHistory' as never)}
            variant="ghost"
            testID="check-in-history"
          />
        </StickyFooter>
      }
    >
      {!cid ? (
        <View style={styles.warnBanner}>
          <Text style={styles.warnText}>Chưa cấu hình phạm vi công ty. Vào Cài đặt để cập nhật.</Text>
        </View>
      ) : null}

      <CheckInHeroCard
        fullName={fullName}
        employeeCode={employeeCode}
        avatarUrl={avatarUrl}
        baseUrl={auth.baseUrl}
        loading={profileLoading}
      />

      <CheckInMethodSelector value={checkInChannel} onChange={setCheckInChannel} />

      {checkInChannel === 'face_mvp' ? <FaceEnrollChromePanel /> : null}

      {checkInChannel === 'gps' ? (
      <ProfileSectionCard title="Vị trí thiết bị" icon="navigate-outline" testID="check-in-location-section">
        <Text style={styles.locationStatus} testID="check-in-location-label">
          {locationLabel}
        </Text>
        {locationState === 'ready' &&
        Number.isFinite(locationSnapshot.latitude) &&
        Number.isFinite(locationSnapshot.longitude) ? (
          <Text style={styles.locationCoords} testID="check-in-location-coords">
            {locationSnapshot.latitude!.toFixed(5)}, {locationSnapshot.longitude!.toFixed(5)}
          </Text>
        ) : null}
      </ProfileSectionCard>
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  warnBanner: {
    backgroundColor: statusToneColor('warning').bg,
    borderRadius: layout.itemGap,
    borderWidth: 1,
    borderColor: statusToneColor('warning').border,
    padding: layout.itemGap,
    marginBottom: layout.itemGap,
  },
  warnText: {
    color: statusToneColor('warning').text,
    fontSize: typography.fontSize.callout,
    lineHeight: typography.lineHeight.callout,
  },
  locationStatus: {
    color: colors.text,
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
  },
  locationCoords: {
    marginTop: layout.inlineGap,
    color: colors.textSecondary,
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    fontVariant: ['tabular-nums'],
  },
});
