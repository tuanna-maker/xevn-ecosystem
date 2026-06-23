import { describe, expect, it } from 'vitest';
import {
  resolveOpsPriorityLabel,
  resolveServiceTypeLabel,
  resolveTaskStatusLabel,
} from '../operationsLabels';

describe('operationsLabels', () => {
  it('resolveServiceTypeLabel maps known keys', () => {
    expect(resolveServiceTypeLabel('parking')).toBe('Bãi đỗ xe');
    expect(resolveServiceTypeLabel('unknown_type')).toBe('unknown type');
  });

  it('resolveTaskStatusLabel maps task lifecycle', () => {
    expect(resolveTaskStatusLabel('open')).toBe('Đang mở');
    expect(resolveTaskStatusLabel('pending')).toBe('Chờ duyệt');
  });

  it('resolveOpsPriorityLabel maps priority', () => {
    expect(resolveOpsPriorityLabel('urgent')).toBe('Ưu tiên cao');
    expect(resolveOpsPriorityLabel('medium')).toBe('Bình thường');
  });
});
