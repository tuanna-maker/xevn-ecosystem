/**
 * @CODE-MEMORY
 * Screen:     FaceEnrollChromePanel — MOB-04b enroll/confirm chrome (mobile-only)
 * UC:         R-FACE-01 · BR-FACE-MOBILE-MVP
 * BR:         Brand dialog chrome · honesty banner · không biometric prod
 * SRS:        docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md MOB-04b
 * TechSpec:   ADR §16 Face HOLD web · product chrome mobile only
 * Purpose:    MVP UI đăng ký/xác nhận khuôn mặt — stub camera frame + CTA disabled/honesty.
 * WorkItem:   PO-HRM-UI-BRAND-W4-MOB-A
 * Coded:      2026-08-05
 * Callers:    CheckInScreen (channel face_mvp)
 * Callees:    BrandDialogChrome · PrimaryButton
 * Impact:     Wire Nest Face API → vi phạm scope chrome-only
 * must_keep:  face_live=false; FACE_* honesty strings; brand bar 4px
 * SOLID:      Panel tách khỏi GPS location block
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a.md
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandDialogChrome } from '../brand/BrandDialogChrome';
import { PrimaryButton } from '../ui/PrimaryButton';
import { brandBodyText } from '../../theme/brandTypography';
import {
  FACE_ENROLL_HONESTY_LINE,
  FACE_MVP_HONESTY_BANNER,
} from '../../utils/checkInChannel';
import { borderWidth, colors, layout, radius, spacing, typography } from '../../theme/tokens';

type FaceEnrollPhase = 'preview' | 'enroll_confirm';

type FaceEnrollChromePanelProps = {
  testID?: string;
};

export function FaceEnrollChromePanel({ testID = 'face-enroll-chrome-panel' }: FaceEnrollChromePanelProps) {
  const [phase, setPhase] = useState<FaceEnrollPhase>('preview');

  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.surface}>
        <BrandDialogChrome
          title={phase === 'preview' ? 'Nhận diện khuôn mặt' : 'Xác nhận đăng ký'}
          subtitle="Mobile MVP · chưa golive"
        />
        <View style={styles.body}>
          <View style={styles.honestyBanner} testID="face-mvp-honesty-banner">
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} accessibilityElementsHidden />
            <Text style={styles.honestyText}>{FACE_MVP_HONESTY_BANNER}</Text>
          </View>

          <View style={styles.cameraFrame} testID="face-mvp-camera-frame">
            <Ionicons name="scan-outline" size={48} color={colors.textMuted} accessibilityLabel="Khung camera MVP" />
            <Text style={styles.frameHint}>
              {phase === 'preview'
                ? 'Khung camera MVP — chưa kết nối engine nhận diện'
                : FACE_ENROLL_HONESTY_LINE}
            </Text>
          </View>

          {phase === 'preview' ? (
            <PrimaryButton
              label="Bắt đầu đăng ký MVP"
              onPress={() => setPhase('enroll_confirm')}
              testID="face-mvp-enroll-start"
              variant="secondary"
            />
          ) : (
            <>
              <PrimaryButton
                label="Xác nhận (MVP — chưa lưu máy chủ)"
                onPress={() => setPhase('preview')}
                disabled
                testID="face-mvp-enroll-confirm"
              />
              <PrimaryButton
                label="Quay lại"
                onPress={() => setPhase('preview')}
                variant="ghost"
                testID="face-mvp-enroll-back"
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: layout.itemGap,
  },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: borderWidth.thin,
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  body: {
    padding: layout.cardPadding,
    gap: spacing.md,
  },
  honestyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    borderWidth: borderWidth.thin,
    borderColor: colors.primary,
  },
  honestyText: {
    ...brandBodyText(),
    flex: 1,
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.text,
  },
  cameraFrame: {
    minHeight: 180,
    borderRadius: radius.card,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  frameHint: {
    ...brandBodyText(),
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
