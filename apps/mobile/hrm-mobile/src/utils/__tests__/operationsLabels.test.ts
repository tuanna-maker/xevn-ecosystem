import { describe, expect, it } from 'vitest';
import {
  resolveOpsPriorityLabel,
  resolveServiceTypeLabel,
  resolveTaskStatusLabel,
} from '../operationsLabels';

describe('operationsLabels', () => {
  it('resolveServiceTypeLabel maps known keys; unknown → — (U72 M-F-06)', () => {
    expect(resolveServiceTypeLabel('parking')).toBe('Bãi đỗ xe');
    expect(resolveServiceTypeLabel('unknown_type')).toBe('—');
    expect(resolveServiceTypeLabel('new_service')).toBe('—');
  });

  it('resolveTaskStatusLabel maps task lifecycle; unknown → —', () => {
    expect(resolveTaskStatusLabel('open')).toBe('Đang mở');
    expect(resolveTaskStatusLabel('pending')).toBe('Chờ duyệt');
    expect(resolveTaskStatusLabel('weird_status')).toBe('—');
  });

  it('resolveOpsPriorityLabel maps priority', () => {
    expect(resolveOpsPriorityLabel('urgent')).toBe('Ưu tiên cao');
    expect(resolveOpsPriorityLabel('medium')).toBe('Bình thường');
  });
});
