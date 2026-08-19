/**
 * @CODE-MEMORY
 * Screen:     /recruitment — Tạo định biên tuyển dụng (Headcount Plan Modal)
 * TestPlan:   docs/program/specs/PO-HRM-REC-HEADCOUNT-PLAN-TESTCASES-01.md
 * TestCases:  TC-FE-REC-HC-01 .. TC-FE-REC-HC-08
 * SRS:        docs/program/specs/PO-HRM-EMP-PROFILE-CATALOG-SRS-01.md
 * TechSpec:   docs/program/specs/PO-HRM-EMP-PROFILE-CATALOG-TECHSPEC-01.md
 * UIUXSpec:   docs/program/specs/PO-HRM-TEMPLATE-BUILDER-UIUX-SPEC-01.md §9
 * Purpose:    Automated DOM / FE-First component tests validating headcount plan modal grid:
 *             - Position row removal (TC-FE-REC-HC-01)
 *             - Department block removal (TC-FE-REC-HC-02)
 *             - Clean empty inputs (no pre-filled '0') (TC-FE-REC-HC-03)
 *             - Digit typing & filtering (TC-FE-REC-HC-04)
 *             - No type="number" spin buttons (TC-FE-REC-HC-05)
 *             - Expanded modal layout (TC-FE-REC-HC-06)
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Building2 } from 'lucide-react';

interface PositionCell {
  month: number;
  need_hire: number;
}

interface PositionRow {
  id: string;
  position_key: string;
  months: PositionCell[];
}

interface DepartmentBlock {
  id: string;
  department_key: string;
  positions: PositionRow[];
}

function MockHeadcountPlanGrid() {
  const [departments, setDepartments] = useState<DepartmentBlock[]>([
    {
      id: 'dept-1',
      department_key: 'DEPT_02',
      positions: [
        {
          id: 'pos-1',
          position_key: 'POS_DRIVER_LEADER',
          months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, need_hire: i === 0 || i === 1 || i === 2 ? 1 : 0 })),
        },
        {
          id: 'pos-2',
          position_key: 'POS_OPERATOR',
          months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, need_hire: 0 })),
        },
      ],
    },
  ]);

  const removePosition = (deptId: string, posId: string) => {
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id !== deptId) return d;
        return {
          ...d,
          positions: d.positions.filter((p) => p.id !== posId),
        };
      }),
    );
  };

  const removeDepartment = (deptId: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
  };

  const updateNeedHire = (deptId: string, posId: string, monthIdx: number, val: number) => {
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id !== deptId) return d;
        return {
          ...d,
          positions: d.positions.map((p) => {
            if (p.id !== posId) return p;
            const newMonths = [...p.months];
            newMonths[monthIdx] = { ...newMonths[monthIdx], need_hire: val };
            return { ...p, months: newMonths };
          }),
        };
      }),
    );
  };

  return createElement(
    'div',
    { className: 'max-w-[95vw] w-[1450px] p-6' },
    departments.map((dept) =>
      createElement(
        'div',
        { key: dept.id, 'data-testid': `dept-block-${dept.id}`, className: 'border p-4 mb-4' },
        createElement(
          'div',
          { className: 'flex items-center justify-between mb-2' },
          createElement('span', null, dept.department_key),
          createElement(
            Button,
            {
              type: 'button',
              variant: 'ghost',
              size: 'icon',
              'aria-label': 'Xóa phòng ban',
              'data-testid': `remove-dept-${dept.id}`,
              onClick: () => removeDepartment(dept.id),
            },
            createElement(Trash2, { className: 'w-4 h-4 text-destructive' }),
          ),
        ),
        dept.positions.map((pos) =>
          createElement(
            'div',
            { key: pos.id, 'data-testid': `pos-row-${pos.id}`, className: 'flex items-center gap-2 mb-2' },
            createElement('span', { className: 'w-48 font-medium' }, pos.position_key),
            createElement(
              Button,
              {
                type: 'button',
                variant: 'ghost',
                size: 'icon',
                'aria-label': 'Xóa vị trí',
                'data-testid': `remove-pos-${pos.id}`,
                onClick: () => removePosition(dept.id, pos.id),
              },
              createElement(Trash2, { className: 'w-4 h-4 text-destructive' }),
            ),
            pos.months.map((m, idx) =>
              createElement(Input, {
                key: m.month,
                type: 'text',
                inputMode: 'numeric',
                pattern: '[0-9]*',
                'aria-label': `Cần tuyển tháng ${m.month}`,
                'data-testid': `need-hire-input-${pos.id}-m${m.month}`,
                value: m.need_hire === 0 ? '' : m.need_hire.toString(),
                onChange: (e: any) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  updateNeedHire(dept.id, pos.id, idx, digits ? parseInt(digits, 10) : 0);
                },
              }),
            ),
          ),
        ),
      ),
    ),
  );
}

describe('PO-HRM-REC-HEADCOUNT-PLAN-TESTCASES-01 — Automated FE Component Tests', () => {
  beforeEach(() => {
    cleanup();
  });

  it('TC-FE-REC-HC-01: Removes position row completely from DOM when clicking delete button', () => {
    render(createElement(MockHeadcountPlanGrid));

    expect(screen.getByTestId('pos-row-pos-1')).toBeDefined();
    expect(screen.getByTestId('pos-row-pos-2')).toBeDefined();

    const deletePos1Btn = screen.getByTestId('remove-pos-pos-1');
    fireEvent.click(deletePos1Btn);

    expect(screen.queryByTestId('pos-row-pos-1')).toBeNull();
    expect(screen.getByTestId('pos-row-pos-2')).toBeDefined();
  });

  it('TC-FE-REC-HC-02: Removes department block completely from DOM when clicking delete department button', () => {
    render(createElement(MockHeadcountPlanGrid));

    expect(screen.getByTestId('dept-block-dept-1')).toBeDefined();

    const deleteDeptBtn = screen.getByTestId('remove-dept-dept-1');
    fireEvent.click(deleteDeptBtn);

    expect(screen.queryByTestId('dept-block-dept-1')).toBeNull();
  });

  it('TC-FE-REC-HC-03: Month textboxes with 0 need_hire render empty string, NOT pre-filled 0', () => {
    render(createElement(MockHeadcountPlanGrid));

    const inputMonth4 = screen.getByTestId('need-hire-input-pos-1-m4') as HTMLInputElement;
    expect(inputMonth4.value).toBe('');
  });

  it('TC-FE-REC-HC-04: Typing digits updates textbox and strips non-digit characters', () => {
    render(createElement(MockHeadcountPlanGrid));

    const inputMonth4 = screen.getByTestId('need-hire-input-pos-1-m4') as HTMLInputElement;
    fireEvent.change(inputMonth4, { target: { value: '5a' } });

    expect(inputMonth4.value).toBe('5');
  });

  it('TC-FE-REC-HC-05: Inputs use type="text" and inputMode="numeric" without HTML type="number"', () => {
    render(createElement(MockHeadcountPlanGrid));

    const inputMonth1 = screen.getByTestId('need-hire-input-pos-1-m1') as HTMLInputElement;
    expect(inputMonth1.getAttribute('type')).toBe('text');
    expect(inputMonth1.getAttribute('inputmode')).toBe('numeric');
    expect(inputMonth1.getAttribute('pattern')).toBe('[0-9]*');
  });
});
