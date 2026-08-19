import { describe, expect, it } from 'vitest';
import {
  createPerformanceCycleFormSchema,
  createPerformanceEvalFormSchema,
} from './performanceFormSchema';

const cycleMsg = {
  nameRequired: 'name',
  startRequired: 'start',
  endRequired: 'end',
  dateOrder: 'order',
};

const evalMsg = {
  employeeRequired: 'emp',
  cycleRequired: 'cycle',
  scoreRange: 'score',
  summaryRequired: 'summary',
  kpiNotInCatalog: 'kpi',
  gradeNotInCatalog: 'grade',
  deptNotInCatalog: 'dept',
};

describe('performanceFormSchema — E3 Zod', () => {
  it('rejects empty cycle name / date order', () => {
    const schema = createPerformanceCycleFormSchema(cycleMsg);
    expect(schema.safeParse({ cycle_name: '', start_date: '2026-01-01', end_date: '2026-02-01' }).success).toBe(
      false,
    );
    expect(
      schema.safeParse({
        cycle_name: 'Q1',
        start_date: '2026-03-01',
        end_date: '2026-01-01',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        cycle_name: 'Q1',
        start_date: '2026-01-01',
        end_date: '2026-03-01',
      }).success,
    ).toBe(true);
  });

  it('requires employee + cycle + summary; KPI when catalog >0', () => {
    const schema = createPerformanceEvalFormSchema(evalMsg, () => ['kpi_a'], () => [], () => []);
    expect(
      schema.safeParse({
        employee_id: '',
        cycle_id: 'c1',
        score: 80,
        summary: 'ok',
        kpi_code: '',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        employee_id: 'e1',
        cycle_id: 'c1',
        score: 80,
        summary: 'ok',
        kpi_code: '',
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        employee_id: 'e1',
        cycle_id: 'c1',
        score: 80,
        summary: 'ok',
        kpi_code: 'kpi_a',
      }).success,
    ).toBe(true);
    expect(
      schema.safeParse({
        employee_id: 'e1',
        cycle_id: 'c1',
        score: 80,
        summary: 'ok',
        kpi_code: 'invent',
      }).success,
    ).toBe(false);
  });
});
