import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OrgGradeOrgChart } from './OrgGradeOrgChart';

describe('OrgGradeOrgChart', () => {
  it('renders saved template titles from gradeTitleLayout', () => {
    render(
      <OrgGradeOrgChart
        enabledLevels={[1, 2]}
        titleLayout={{ 1: ['Chủ tịch tùy chỉnh'], 2: ['TGĐ riêng'] }}
        heading="Khung test"
      />,
    );

    expect(screen.getByText('Khung test')).toBeInTheDocument();
    expect(screen.getByText('Chủ tịch tùy chỉnh')).toBeInTheDocument();
    expect(screen.getByText('TGĐ riêng')).toBeInTheDocument();
    expect(screen.queryByText('CHỦ TỊCH')).not.toBeInTheDocument();
  });

  it('renders static master reference when no layout props', () => {
    render(<OrgGradeOrgChart />);
    expect(screen.getByText('CHỦ TỊCH')).toBeInTheDocument();
    expect(screen.getByText('TỔNG GIÁM ĐỐC')).toBeInTheDocument();
  });
});
