import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  resolveOpsPriorityLabel,
  resolveServiceTypeLabel,
  resolveTaskStatusLabel,
} from '../../../utils/operationsLabels';

const SRC = path.resolve(__dirname, '../../..');

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8');
}

describe('MOB-UX-12d SET G-4 secondary screen polish', () => {
  it('ManagerApprovalsScreen uses ProfileSectionCard, elevated cards, empty illustration', () => {
    const screen = readSrc('features/attendance/ManagerApprovalsScreen.tsx');
    expect(screen).toContain('ProfileSectionCard');
    expect(screen).toContain('ManagerAttendanceCard');
    expect(screen).toContain('ManagerLeaveCard');
    expect(screen).toContain('EmptyStateIllustration');
    expect(screen).not.toContain("from '../../components/ui/ListRow'");
  });

  it('LeaveRequestsListScreen uses EssRichListRow + ElevatedCard', () => {
    const screen = readSrc('features/attendance/LeaveRequestsListScreen.tsx');
    expect(screen).toContain('EssRichListRow');
    expect(screen).toContain('ElevatedCard');
    expect(screen).not.toContain('<ListRow');
  });

  it('ContractsScreen uses ProfileSectionCard + EssRichListRow — no raw contract_type', () => {
    const screen = readSrc('features/contracts/ContractsScreen.tsx');
    expect(screen).toContain('ProfileSectionCard');
    expect(screen).toContain('EssRichListRow');
    expect(screen).toContain('ElevatedCard');
    expect(screen).toContain('resolveContractTypeLabel(item.contract_type)');
    expect(screen).not.toContain('title={item.contract_type}');
  });

  it('OperationsScreen uses ElevatedCard + localized labels', () => {
    const screen = readSrc('features/operations/OperationsScreen.tsx');
    expect(screen).toContain('ElevatedCard');
    expect(screen).toContain('EssRichListRow');
    expect(screen).toContain('resolveServiceTypeLabel');
    expect(screen).toContain('resolveTaskStatusLabel');
    expect(screen).not.toContain('item.service_type}');
  });

  it('EssRichListRow uses gradient icon + StatusBadge', () => {
    const row = readSrc('components/ui/EssRichListRow.tsx');
    expect(row).toContain('LinearGradient');
    expect(row).toContain('StatusBadge');
  });

  it('ElevatedCard applies shadow.soft elevation', () => {
    const card = readSrc('components/ui/ElevatedCard.tsx');
    expect(card).toContain('shadow.soft');
  });
});

describe('operationsLabels', () => {
  it('localizes service types and task status — no raw enums', () => {
    expect(resolveServiceTypeLabel('transport')).toBe('Đưa đón');
    expect(resolveTaskStatusLabel('in_progress')).toBe('Đang làm');
    expect(resolveTaskStatusLabel('done')).toBe('Hoàn thành');
    expect(resolveOpsPriorityLabel('high')).toBe('Ưu tiên cao');
  });
});
