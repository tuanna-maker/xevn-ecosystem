import { describe, expect, it } from 'vitest';
import {
  EMPTY_TRAINING_STATS,
  computeTrainingStats,
  type TrainingItem,
} from './useEmployeeTraining';

function row(partial: Partial<TrainingItem> & Pick<TrainingItem, 'id' | 'status'>): TrainingItem {
  return {
    employee_id: 'e1',
    company_id: 'main',
    name: 'Course',
    type: 'internal',
    category: 'technical',
    provider: null,
    instructor: null,
    start_date: null,
    end_date: null,
    duration: 0,
    duration_unit: 'hours',
    location: null,
    progress: 0,
    score: null,
    certificate_number: null,
    certificate_file_url: null,
    cost: 0,
    paid_by: 'company',
    description: null,
    skills: [],
    created_at: '',
    updated_at: '',
    ...partial,
  };
}

describe('PO-MFD-M3-EMP-TRAINING-FIX-01 — computeTrainingStats (matrix #19)', () => {
  it('returns EMPTY defaults for null/undefined/non-array (no crash on .completed)', () => {
    expect(computeTrainingStats(undefined)).toEqual(EMPTY_TRAINING_STATS);
    expect(computeTrainingStats(null)).toEqual(EMPTY_TRAINING_STATS);
    expect(computeTrainingStats([]).completed).toBe(0);
    expect(computeTrainingStats([]).inProgress).toBe(0);
    expect(computeTrainingStats([]).totalHours).toBe(0);
    expect(computeTrainingStats([]).totalCost).toBe(0);
  });

  it('rolls up completed / in-progress / hours / cost from list rows', () => {
    const stats = computeTrainingStats([
      row({ id: '1', status: 'completed', duration: 4, duration_unit: 'hours', cost: 1000 }),
      row({ id: '2', status: 'in-progress', duration: 1, duration_unit: 'days', cost: 500 }),
      row({ id: '3', status: 'planned', duration: 2, duration_unit: 'hours', cost: 0 }),
    ]);
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.planned).toBe(1);
    expect(stats.totalHours).toBe(4 + 8 + 2);
    expect(stats.totalCost).toBe(1500);
  });
});
