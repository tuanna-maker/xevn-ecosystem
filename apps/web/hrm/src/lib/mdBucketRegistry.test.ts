/**
 * @CODE-MEMORY
 * Screen:     Vitest — mdBucketRegistry E1-B
 * UC:         AC-SET-UI-01 · AC-SET-UI-05
 * WorkItem:   D-FE-ERP-E1B-MD-PANEL-01
 */
import { describe, expect, it } from 'vitest';
import {
  assertE1bMdBucketRegistry,
  MD_BUCKET_META,
  MD_BUCKET_ORDER,
} from './mdBucketRegistry';

describe('mdBucketRegistry — E1-B', () => {
  it('DoD snapshot: ≥10 buckets, DEC write prefer hr_decision_types', () => {
    const snap = assertE1bMdBucketRegistry();
    expect(snap.bucketCount).toBeGreaterThanOrEqual(10);
    expect(snap.decisionWriteKey).toBe('hr_decision_types');
    expect(snap.decisionKeys).toContain('hr_decision_types');
    expect(snap.decisionKeys).toContain('decision_types');
  });

  it('every bucket has FR + keys + writeKey', () => {
    for (const id of MD_BUCKET_ORDER) {
      const meta = MD_BUCKET_META[id];
      expect(meta.fr.startsWith('FR-HRM-SC-')).toBe(true);
      expect(meta.keys.length).toBeGreaterThan(0);
      expect(meta.writeKey.length).toBeGreaterThan(0);
    }
  });
});
