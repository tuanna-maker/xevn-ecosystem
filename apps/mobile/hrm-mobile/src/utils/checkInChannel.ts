/**
 * @CODE-MEMORY
 * Screen:     checkInChannel — GPS vs Face MVP channel (chrome only)
 * UC:         UC-BP-ATT-10 · R-FACE-01 · MOB-04
 * BR:         Face product mobile MVP; không claim biometric prod LIVE
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/UC_MEETING_PRODUCT_GAP_MATRIX.md R-FACE-01
 * TechSpec:   docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §16 Face HOLD
 * Purpose:    Chọn kênh chấm công trên UI; submit GPS giữ nguyên — Face = chrome + honesty.
 * WorkItem:   PO-HRM-UI-BRAND-W4-MOB-A
 * Coded:      2026-08-05
 * Callers:    CheckInScreen · CheckInMethodSelector
 * Callees:    N/A
 * Impact:     Invent Face API → vi phạm face_live=false
 * must_keep:  gps default; face_live=false messaging
 * SOLID:      Pure channel enum + copy — không Nest
 * LastVerified: src/utils/__tests__/checkInChannel.test.ts
 */

export type CheckInChannelId = 'gps' | 'face_mvp';

export type CheckInChannelOption = {
  id: CheckInChannelId;
  label: string;
  subtitle: string;
  testID: string;
};

export const CHECK_IN_CHANNEL_OPTIONS: CheckInChannelOption[] = [
  {
    id: 'gps',
    label: 'Vị trí GPS',
    subtitle: 'Chấm công theo tọa độ thiết bị (đang dùng)',
    testID: 'check-in-channel-gps',
  },
  {
    id: 'face_mvp',
    label: 'Khuôn mặt (MVP)',
    subtitle: 'Giao diện nhận diện — chưa golive sản phẩm',
    testID: 'check-in-channel-face-mvp',
  },
];

export const FACE_MVP_HONESTY_BANNER =
  'Nhận diện khuôn mặt đang hoàn thiện MVP trên mobile. Không phải xác thực sinh trắc golive. Chấm công thực tế: dùng GPS.';

export const FACE_ENROLL_HONESTY_LINE =
  'Đăng ký khuôn mặt (MVP) — chỉ giao diện thử nghiệm; chưa đồng bộ máy chủ.';

export function resolveDefaultCheckInChannel(): CheckInChannelId {
  return 'gps';
}

export function canSubmitCheckInWithChannel(channel: CheckInChannelId): boolean {
  return channel === 'gps';
}
