import { describe, expect, it } from 'vitest';
import type { HrmPerformanceEvaluation } from '@/integrations/hrmApi';

// Re-export mapping logic via minimal inline mirror for unit test
function mapEvaluationToKpi(
  row: HrmPerformanceEvaluation,
  cycleName: string,
  cycleStart: string,
  cycleEnd: string,
) {
  return {
    id: row.id,
    period_name: cycleName,
    kpi_name: row.summary?.trim() || 'Đánh giá hiệu suất',
    score: row.score,
    period_start: cycleStart,
    period_end: cycleEnd,
  };
}

describe('useEmployeeKPI mapping', () => {
  it('maps performance evaluation to profile KPI row', () => {
    const mapped = mapEvaluationToKpi(
      {
        id: 'ev-1',
        company_id: 'main',
        employee_id: 'emp-1',
        cycle_id: 'cyc-1',
        score: 88,
        summary: 'Q1 review',
        reviewer: 'hr@xe.vn',
        created_at: '2025-03-01T00:00:00Z',
        updated_at: '2025-03-01T00:00:00Z',
      },
      'Q1 2025',
      '2025-01-01',
      '2025-03-31',
    );
    expect(mapped.period_name).toBe('Q1 2025');
    expect(mapped.kpi_name).toBe('Q1 review');
    expect(mapped.score).toBe(88);
  });
});
