/**
 * VAL-LV-ATT-FE-01 — AC-SET-CONSUMER-LV-ATT-01 source lock
 * work_item_id: PO-HRM-LEAVE-TYPES-CONSUMER-ATT-FE-01
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

const remindersSrc = readFileSync(
  resolve(__dirname, '../components/dashboard/HrmApiReminders.tsx'),
  'utf8',
);
const leaveTabSrc = readFileSync(resolve(__dirname, '../components/attendance/LeaveTab.tsx'), 'utf8');

describe('VAL-LV-ATT-FE-01 — leave_types consumer ATT effective SoT', () => {
  it('HrmApiReminders uses useAttLeaveTypesEffective; no MD catalog TXN path', () => {
    expect(remindersSrc).toContain('useAttLeaveTypesEffective');
    expect(remindersSrc).toContain('leaveTypeDisplayLabel');
    expect(remindersSrc).not.toContain('leaveTypeOptionsFromCatalog');
    expect(remindersSrc).not.toContain('useSettingsCatalogsOverview');
    expect(codeOnly(remindersSrc)).not.toContain('leaveTypeOptionsFromCatalog');
  });

  it('LeaveTab peer retains effective hook (ATTLVTSOTQC1 must_keep)', () => {
    expect(leaveTabSrc).toContain('useAttLeaveTypesEffective');
    expect(leaveTabSrc).toContain('resolveLeaveTypeLabel');
  });
});
