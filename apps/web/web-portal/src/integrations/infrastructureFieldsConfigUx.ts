import { commandCenterSettingsDeepLink } from '../modules/hrm/commandCenterUrl';

/** Show consumer-screen hint when metadata modal opened from member legal-entity settings. */
export function shouldShowInfraConsumerNavHint(openedFromMenu: string | null): boolean {
  return openedFromMenu === 'company_member_units';
}

/** Deep link to infrastructure site entry (company_infrastructure consumer screen). */
export function infrastructureSiteEntrySettingsUrl(): string {
  return commandCenterSettingsDeepLink({ settingsMenu: 'company_infrastructure' });
}

export function buildInfraFieldsApplySuccessMessage(entityId: string, visibleFieldCount: number): string {
  const fieldPart =
    visibleFieldCount > 0
      ? `${visibleFieldCount} trường hiển thị đã lưu`
      : 'Cấu hình khối/trường đã lưu';
  return `Đã áp dụng cấu hình hạ tầng cho pháp nhân (${entityId}) — ${fieldPart}. Màn nhập điểm hạ tầng sẽ đọc lại biểu mẫu khi mở chi tiết.`;
}
