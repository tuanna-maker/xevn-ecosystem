// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Vitest + React Testing Library tests for CompanyStatusBadge

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CompanyStatusBadge } from './CompanyStatusBadge';
import type { TenantStatus } from '@/integrations/xbosApi';

describe('CompanyStatusBadge', () => {
  const statuses: { status: TenantStatus; expectedLabel: string; expectedClass: string }[] = [
    { status: 'provisioning', expectedLabel: 'Đang cấp phép', expectedClass: 'bg-blue-50 text-blue-700 border-blue-200' },
    { status: 'active', expectedLabel: 'Hoạt động', expectedClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { status: 'suspended', expectedLabel: 'Tạm ngưng', expectedClass: 'bg-amber-50 text-amber-700 border-amber-200' },
    { status: 'archived', expectedLabel: 'Lưu trữ', expectedClass: 'bg-gray-100 text-gray-500 border-gray-200' },
  ];

  describe('Known statuses', () => {
    statuses.forEach(({ status, expectedLabel, expectedClass }) => {
      it(`renders correct label and class for "${status}"`, () => {
        render(<CompanyStatusBadge status={status} />);
        const badge = screen.getByText(expectedLabel);

        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('inline-flex');
        expect(badge).toHaveClass('items-center');
        expect(badge).toHaveClass('rounded-full');
        expect(badge).toHaveClass('border');
        expect(badge).toHaveClass('px-2.5');
        expect(badge).toHaveClass('py-0.5');
        expect(badge).toHaveClass('text-xs');
        expect(badge).toHaveClass('font-medium');

        // Check status-specific classes
        expectedClass.split(' ').forEach((cls) => {
          expect(badge).toHaveClass(cls);
        });
      });
    });
  });

  describe('Unknown status fallback', () => {
    it('falls back to gray for unknown status', () => {
      // @ts-expect-error - testing unknown status
      render(<CompanyStatusBadge status="unknown" />);
      const badge = screen.getByText('unknown');

      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-500');
      expect(badge).toHaveClass('border-gray-200');
    });
  });

  describe('Structure', () => {
    it('renders as span element', () => {
      render(<CompanyStatusBadge status="active" />);
      const badge = screen.getByText('Hoạt động');
      expect(badge.tagName).toBe('SPAN');
    });

    it('applies all base classes', () => {
      render(<CompanyStatusBadge status="active" />);
      const badge = screen.getByText('Hoạt động');

      const baseClasses = [
        'inline-flex',
        'items-center',
        'rounded-full',
        'border',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-medium',
      ];

      baseClasses.forEach((cls) => {
        expect(badge).toHaveClass(cls);
      });
    });
  });
});