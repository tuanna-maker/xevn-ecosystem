/**
 * Source lock — PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

describe('PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01 source lock', () => {
  it('attLeave05bRing · path · residuals · DENY att_leave_hold · ≠ API DONE', () => {
    const ring = read('lib/attLeave05bRing.ts');
    expect(ring).toContain('PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01');
    expect(ring).toContain('R-ATT-05B-PANEL-FE');
    expect(ring).toContain('R-ATT-05B-≠-API-DONE');
    expect(ring).toContain('carry_over');
    expect(ring).toContain('att_leave_hold');
    expect(ring).toContain('previewDeduction');
    expect(codeOnly(ring)).not.toMatch(/attendance_uat_ready\s*=\s*true/);
  });

  it('LeaveTab create — form panel · refetch · empty · advance · overlap · preview · Nest /core 0', () => {
    const tab = read('components/attendance/LeaveTab.tsx');
    expect(tab).toContain('att-05b-form-panel');
    expect(tab).toContain('att-05b-honesty');
    expect(tab).toContain('att-05b-empty-catalog');
    expect(tab).toContain('att-05b-adv-hint');
    expect(tab).toContain('att-09-type-block');
    expect(tab).toContain('AttLeavePreviewDeductionPanel');
    expect(tab).toContain('refetchBalancesByType');
    expect(tab).toContain('carry_over');
    expect(tab).toContain('leave-balance-row-${row.leave_type}');
    expect(tab).toContain('useAttLeaveTypesEffective');
    expect(tab).toContain('CatalogSearchPicker');
    expect(codeOnly(tab)).not.toContain('/api/hrm/core/');
  });

  it('physical /attendance/* panel + effective + preview retained', () => {
    const api = read('integrations/hrmApi.ts');
    expect(api).toContain('/api/hrm/attendance/leave-balance/panel');
    expect(api).toContain('/api/hrm/attendance/leave-types/effective');
    expect(api).toContain('preview-deduction');
    expect(api).toContain('/api/hrm/attendance/leave-requests');
  });
});
