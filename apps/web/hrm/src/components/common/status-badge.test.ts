import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import viLocale from '@/i18n/locales/vi.json';
import enLocale from '@/i18n/locales/en.json';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        'common.status.processed': 'Đã xử lý',
        'common.status.draft': 'Nháp',
        'common.status.paid': 'Đã thanh toán',
        'common.status.locked': 'Đã khóa',
        'common.status.closed': 'Đã đóng',
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
  }),
}));

import { StatusBadge } from './StatusBadge';

describe('D-P1-HRM-PAY-STATUS-BADGE-01 — StatusBadge payroll i18n', () => {
  it('vi/en common.status leaves are strings for payroll codes', () => {
    const codes = ['draft', 'processed', 'paid', 'locked', 'closed'] as const;
    for (const code of codes) {
      expect(typeof viLocale.common.status[code]).toBe('string');
      expect(typeof enLocale.common.status[code]).toBe('string');
    }
    expect(viLocale.common.status.processed).toBe('Đã xử lý');
    expect(enLocale.common.status.processed).toBe('Processed');
  });

  it('renders processed as Vietnamese, not raw English', () => {
    render(createElement(StatusBadge, { status: 'processed' }));
    expect(screen.getByText('Đã xử lý')).toBeTruthy();
    expect(screen.queryByText('processed')).toBeNull();
  });

  it('renders draft / paid / locked from common.status leaves', () => {
    const { rerender } = render(createElement(StatusBadge, { status: 'draft' }));
    expect(screen.getByText('Nháp')).toBeTruthy();
    rerender(createElement(StatusBadge, { status: 'paid' }));
    expect(screen.getByText('Đã thanh toán')).toBeTruthy();
    rerender(createElement(StatusBadge, { status: 'locked' }));
    expect(screen.getByText('Đã khóa')).toBeTruthy();
  });

  it('keeps employee active label (not company Đang hiệu lực)', () => {
    render(createElement(StatusBadge, { status: 'active' }));
    expect(screen.getByText('Đang làm việc')).toBeTruthy();
  });
});
