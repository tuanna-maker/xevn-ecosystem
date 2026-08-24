import { describe, expect, it } from 'vitest';
import { EmployeeSkillsRadarChart } from '@/components/employee/EmployeeSkillsRadarChart';
import { render, screen } from '@testing-library/react';

describe.skip('EmployeeSkillsRadarChart', () => {
  it('shows empty state when no skill data (no mock fallback)', () => {
    render(<EmployeeSkillsRadarChart />);
    expect(screen.getByText(/Chưa có dữ liệu kỹ năng/i)).toBeTruthy();
  });

  it('renders chart when data is provided', () => {
    render(
      <EmployeeSkillsRadarChart
        data={[{ subject: 'Giao tiếp', value: 4, fullMark: 5 }]}
      />,
    );
    expect(screen.queryByText(/Chưa có dữ liệu kỹ năng/i)).toBeNull();
  });
});
