import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { ProfileSectionCard } from '../../components/profile/ProfileSectionCard';
import { groupedLayout } from '../../theme/groupedLayout';
import { colors, layout, typography } from '../../theme/tokens';
import { StickyFooter } from '../../components/ui/StickyFooter';

export function CreateOtRequestScreen() {
  const nav = useNavigation();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      Alert.alert('Thành công', 'Đã gửi đơn làm thêm giờ thành công!');
      nav.goBack();
    }, 1000);
  };

  return (
    <AppScreenLayout
      stackHeaderPresent
      scroll
      grouped
      keyboardShouldPersistTaps="handled"
      footerBottomExtra={groupedLayout.belowSubtitle}
      footer={
        <StickyFooter>
          <PrimaryButton
            label={busy ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
            onPress={submit}
            disabled={busy}
            loading={busy}
          />
        </StickyFooter>
      }
    >
      <ProfileSectionCard title="Chi tiết làm thêm giờ" icon="moon-outline">
        <View style={styles.formRow}>
          <Text style={styles.label}>Ngày làm thêm</Text>
          <Text style={styles.value}>Hôm nay</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Giờ bắt đầu</Text>
          <Text style={styles.value}>18:00</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Giờ kết thúc</Text>
          <Text style={styles.value}>21:00</Text>
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Lý do</Text>
          <Text style={styles.value}>Hỗ trợ release dự án</Text>
        </View>
      </ProfileSectionCard>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: layout.inlineGap,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.body,
  },
  value: {
    color: colors.text,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
  },
});
