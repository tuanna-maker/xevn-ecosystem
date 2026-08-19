/**
 * PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01 — contract-legal Settings dialog portal locks.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const panelSrc = readFileSync(
  resolve(__dirname, './ContractLegalPrintSettingsPanel.tsx'),
  'utf8',
);

describe('PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01 ContractLegalPrintSettingsPanel', () => {
  it('template composer dialog uses parent portal PAT (no iframe DialogContent)', () => {
    expect(panelSrc).toContain('data-testid="settings-contract-templates-dialog"');
    expect(panelSrc).not.toMatch(
      /settings-contract-templates-dialog[\s\S]*?portalScope="iframe"/,
    );
    expect(panelSrc).toContain('HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS');
    expect(panelSrc).toContain('data-hrm-dialog-portal="parent"');
  });

  it('clause mutate dialog marks parent portal (compact shell)', () => {
    expect(panelSrc).toContain('data-testid="settings-contract-clauses-dialog"');
    expect(panelSrc).toContain('HRM_DIALOG_PARENT_COMPACT_CLASS');
  });
});
