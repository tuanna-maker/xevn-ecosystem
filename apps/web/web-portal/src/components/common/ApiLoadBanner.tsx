import React from 'react';
import { Info } from 'lucide-react';
import { InfoBanner } from '@xevn/ui';
import { API_LOAD_FAILED_MESSAGE, MOCK_FALLBACK_ACTIVE_MESSAGE } from '../../utils/mockPolicy';

export type ApiLoadBannerProps = {
  loadFailed: boolean;
  usingMockFallback?: boolean;
  title?: string;
  message?: string;
};

export const ApiLoadBanner: React.FC<ApiLoadBannerProps> = ({
  loadFailed,
  usingMockFallback = false,
  title = 'Trạng thái dữ liệu',
  message,
}) => {
  if (!loadFailed && !usingMockFallback) return null;
  const resolvedMessage =
    message ??
    (usingMockFallback
      ? MOCK_FALLBACK_ACTIVE_MESSAGE
      : loadFailed
        ? API_LOAD_FAILED_MESSAGE
        : '');
  if (!resolvedMessage) return null;
  return (
    <InfoBanner
      title={title}
      message={resolvedMessage}
      icon={<Info size={20} />}
    />
  );
};
