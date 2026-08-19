import { describe, expect, it } from 'vitest';
import {
  buildRecPipelineKanbanColumns,
  formatRecPipelineStageDisplay,
  isRecPipelineStageInterviewScheduleAllowed,
  isValidRecPipelineStageKeyFormat,
  normalizeRecPipelineStageKey,
  recPipelineStagesToPickerOptions,
  resolveRecPipelineStageLabel,
} from './recPipelineStageCatalog';

describe('recPipelineStageCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01)', () => {
  it('accepts open-catalog format keys including #7+ style (hr_custom_stage_07)', () => {
    expect(isValidRecPipelineStageKeyFormat('hr_custom_stage_07')).toBe(true);
    expect(isValidRecPipelineStageKeyFormat('screening')).toBe(true);
    expect(isValidRecPipelineStageKeyFormat('hired_qa_custom')).toBe(true);
  });

  it('rejects format-only failures — not closed six-starter enum', () => {
    expect(isValidRecPipelineStageKeyFormat('9starts_digit')).toBe(false);
    expect(isValidRecPipelineStageKeyFormat('BAD KEY')).toBe(false);
    expect(isValidRecPipelineStageKeyFormat('')).toBe(false);
  });

  it('accepts mixed-case slug after normalize (pattern Loại phép)', () => {
    expect(isValidRecPipelineStageKeyFormat('Interview')).toBe(true);
    expect(isValidRecPipelineStageKeyFormat('QMY9E1AREC')).toBe(true);
  });

  it('normalizes key to lowercase slug', () => {
    expect(normalizeRecPipelineStageKey('  HR_CUSTOM_STAGE_07  ')).toBe('hr_custom_stage_07');
  });

  it('display-ready label never raw-key-only when nameVi present', () => {
    expect(formatRecPipelineStageDisplay('hr_custom_stage_07', 'Giai đoạn HR custom')).toBe(
      'Giai đoạn HR custom (hr_custom_stage_07)',
    );
  });

  it('maps rows to picker options + historical resolve falls back to key', () => {
    const opts = recPipelineStagesToPickerOptions([
      { stageKey: 'hr_custom_stage_07', nameVi: 'Giai đoạn HR custom' },
      { stageKey: 'hired', nameVi: 'Đã tuyển' },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['hr_custom_stage_07', 'hired']);
    expect(opts[0]?.label).toBe('Giai đoạn HR custom');
    expect(resolveRecPipelineStageLabel(opts, 'retired_old_key')).toBe('retired_old_key');
    expect(resolveRecPipelineStageLabel(opts, 'hr_custom_stage_07')).toBe('Giai đoạn HR custom');
  });
});

describe('recPipelineStageCatalog CNS-FE-01 (VAL-REC-CNS-04/05)', () => {
  it('buildRecPipelineKanbanColumns — EFF empty → [] (soft-empty; no invent starter-six)', () => {
    expect(buildRecPipelineKanbanColumns([])).toEqual([]);
  });

  it('buildRecPipelineKanbanColumns — EFF >0 includes N+1 key sorted by sortOrder', () => {
    const cols = buildRecPipelineKanbanColumns([
      { stageKey: 'hired', nameVi: 'Đã tuyển', sortOrder: 50 },
      { stageKey: 'hr_custom_stage_07', nameVi: 'Giai đoạn HR custom', sortOrder: 15 },
      { stageKey: 'screening', nameVi: 'Sàng lọc', sortOrder: 10 },
    ]);
    expect(cols.map((c) => c.id)).toEqual(['screening', 'hr_custom_stage_07', 'hired']);
    expect(cols[1]?.label).toBe('Giai đoạn HR custom');
  });

  it('isRecPipelineStageInterviewScheduleAllowed — empty catalog compat allow', () => {
    expect(isRecPipelineStageInterviewScheduleAllowed([], 'screening', 0)).toBe(true);
  });

  it('isRecPipelineStageInterviewScheduleAllowed — explicit false blocks; true allows', () => {
    const items = [
      { stageKey: 'screening', allowsInterviewSchedule: false },
      { stageKey: 'interview', allowsInterviewSchedule: true },
    ];
    expect(isRecPipelineStageInterviewScheduleAllowed(items, 'screening', 2)).toBe(false);
    expect(isRecPipelineStageInterviewScheduleAllowed(items, 'interview', 2)).toBe(true);
  });

  it('isRecPipelineStageInterviewScheduleAllowed — unknown historical key soft-allows (≠ invent one-active)', () => {
    const items = [{ stageKey: 'interview', allowsInterviewSchedule: true }];
    expect(isRecPipelineStageInterviewScheduleAllowed(items, 'legacy_stage', 1)).toBe(true);
  });
});
