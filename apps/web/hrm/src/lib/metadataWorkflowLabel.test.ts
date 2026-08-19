import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  formatMetadataWorkflowLabel,
  METADATA_WORKFLOW_LABELS_VI,
} from './metadataWorkflowLabel';

describe('formatMetadataWorkflowLabel', () => {
  it('maps xbos.employee_metadata.default to business Vietnamese', () => {
    expect(formatMetadataWorkflowLabel('xbos.employee_metadata.default')).toBe(
      METADATA_WORKFLOW_LABELS_VI['xbos.employee_metadata.default'],
    );
    expect(formatMetadataWorkflowLabel('xbos.employee_metadata.default')).not.toMatch(/xbos\./i);
  });

  it('hides unknown technical dotted / snake ids', () => {
    expect(formatMetadataWorkflowLabel('xbos.employee_metadata.custom')).toBe(
      'Quy trình phê duyệt metadata',
    );
    expect(formatMetadataWorkflowLabel('hrm_meta_approval')).toBe('Quy trình phê duyệt metadata');
    expect(formatMetadataWorkflowLabel('xbos.employee_metadata.custom')).not.toMatch(/xbos\./i);
  });

  it('uses empty default when code missing', () => {
    expect(formatMetadataWorkflowLabel(null)).toBe('Quy trình mặc định');
    expect(formatMetadataWorkflowLabel('')).toBe('Quy trình mặc định');
    expect(formatMetadataWorkflowLabel('   ')).toBe('Quy trình mặc định');
  });

  it('keeps free-text human labels', () => {
    expect(formatMetadataWorkflowLabel('Duyệt bởi HRBP chi nhánh')).toBe('Duyệt bởi HRBP chi nhánh');
  });
});

describe('MetadataQueueTab wiring (source)', () => {
  it('renders formatMetadataWorkflowLabel and Vietnamese Quy trình header', () => {
    const path = resolve(__dirname, '../components/settings/MetadataQueueTab.tsx');
    const raw = readFileSync(path, 'utf8');
    // Strip block comments so CODE-MEMORY may mention machine ids without failing UI assert
    const code = raw.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).toMatch(/formatMetadataWorkflowLabel\(\s*row\.workflow_code\s*\)/);
    expect(code).not.toMatch(/row\.workflow_code\s*\?\?/);
    expect(code).toMatch(/>Quy trình</);
    expect(code).not.toMatch(/>Workflow</);
    expect(code).not.toMatch(/xbos\.employee_metadata\.default/);
  });
});
