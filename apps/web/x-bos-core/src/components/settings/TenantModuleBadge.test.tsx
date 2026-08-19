// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Vitest + React Testing Library tests for TenantModuleBadge

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TenantModuleBadge } from './TenantModuleBadge';
import type { TenantModule } from '@/integrations/xbosApi';

describe('TenantModuleBadge', () => {
  const modules: { module: TenantModule; expectedLabel: string; expectedClass: string }[] = [
    { module: 'hrm', expectedLabel: 'HRM', expectedClass: 'bg-xevn-primary/10 text-xevn-primary border-xevn-primary/20' },
    { module: 'logistics', expectedLabel: 'Logistics', expectedClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  ];

  describe('Known modules', () => {
    modules.forEach(({ module, expectedLabel, expectedClass }) => {
      it(`renders correct label and class for "${module}"`, () => {
        render(<TenantModuleBadge module={module} />);
        const badge = screen.getByText(expectedLabel);

        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('inline-flex');
        expect(badge).toHaveClass('items-center');
        expect(badge).toHaveClass('rounded-full');
        expect(badge).toHaveClass('border');
        expect(badge).toHaveClass('px-2');
        expect(badge).toHaveClass('py-0.5');
        expect(badge).toHaveClass('text-xs');
        expect(badge).toHaveClass('font-semibold');
        expect(badge).toHaveClass('tracking-wide');

        // Check module-specific classes
        expectedClass.split(' ').forEach((cls) => {
          expect(badge).toHaveClass(cls);
        });
      });
    });
  });

  describe('Unknown module fallback', () => {
    it('falls back to gray for unknown module', () => {
      // @ts-expect-error - testing unknown module
      render(<TenantModuleBadge module="unknown" />);
      const badge = screen.getByText('unknown');

      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-600');
      expect(badge).toHaveClass('border-gray-200');
    });
  });

  describe('Structure', () => {
    it('renders as span element', () => {
      render(<TenantModuleBadge module="hrm" />);
      const badge = screen.getByText('HRM');
      expect(badge.tagName).toBe('SPAN');
    });

    it('applies all base classes', () => {
      render(<TenantModuleBadge module="hrm" />);
      const badge = screen.getByText('HRM');

      const baseClasses = [
        'inline-flex',
        'items-center',
        'rounded-full',
        'border',
        'px-2',
        'py-0.5',
        'text-xs',
        'font-semibold',
        'tracking-wide',
      ];

      baseClasses.forEach((cls) => {
        expect(badge).toHaveClass(cls);
      });
    });
  });

  describe('Multiple badges', () => {
    it('renders multiple badges correctly', () => {
      render(
        <div>
          <TenantModuleBadge module="hrm" />
          <TenantModuleBadge module="logistics" />
        </div>
      );

      expect(screen.getByText('HRM')).toBeInTheDocument();
      expect(screen.getByText('Logistics')).toBeInTheDocument();
      expect(screen.getByText('HRM')).toHaveClass('text-xevn-primary');
      expect(screen.getByText('Logistics')).toHaveClass('text-cyan-700');
    });
  });
});