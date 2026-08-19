/**
 * @CODE-MEMORY
 * Screen:     Vitest — AC-SET-CONSUMER-JT-WH-01 (QTCT Vị trí → job_titles)
 * UC:         UF-HRM-10 · AC-HRM-PICKER-01
 * WorkItem:   D-FE-HRM-WH-POSITION-PICKER-01
 * Purpose:    Payload + source scan — CatalogSearchPicker sends position_key; F5 label path
 */
import { describe, expect, it } from 'vitest';
import {
  jobTitleOptionsFromCatalog,
  resolvePositionDisplayLabel,
  resolveWorkTimelinePositionFromCatalog,
} from './catalogSearchPicker';
import { HDSD_MUTATE_TEST_IDS } from './hdsdMutateTestIds';

describe('D-FE-HRM-WH-POSITION-PICKER-01 — job_titles QTCT consumer', () => {
  const catalogs = [
    {
      catalogKey: 'job_titles',
      effectiveItems: [{ code: 'TP_KD', label: 'Trưởng phòng KD', status: 'active' }],
    },
  ];

  it('resolveWorkTimelinePositionFromCatalog — rejects label-only invent', () => {
    const opts = jobTitleOptionsFromCatalog(catalogs);
    expect(resolveWorkTimelinePositionFromCatalog('TP_KD', opts)).toEqual({
      position_key: 'TP_KD',
      position: 'Trưởng phòng KD',
    });
    expect(resolveWorkTimelinePositionFromCatalog('Trưởng phòng KD', opts)).toBeNull();
    expect(resolveWorkTimelinePositionFromCatalog('', opts)).toBeNull();
  });

  it('resolvePositionDisplayLabel — F5 list shows catalog label not raw key', () => {
    const opts = jobTitleOptionsFromCatalog(catalogs);
    expect(resolvePositionDisplayLabel(opts, 'TP_KD', 'Stale snapshot')).toBe('Trưởng phòng KD');
    expect(resolvePositionDisplayLabel(opts, 'UNKNOWN', 'Legacy only')).toBe('Legacy only');
  });

  it('HDSD test id for work timeline position picker', () => {
    expect(HDSD_MUTATE_TEST_IDS.workTimelinePositionPicker).toBe(
      'hdsd-work-timeline-position-picker',
    );
  });

  it('source-scan — EmployeeWorkTimeline wires CatalogSearchPicker + position_key', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const wh = await fs.readFile(
      path.join(__dirname, '../components/employee/EmployeeWorkTimeline.tsx'),
      'utf8',
    );
    expect(wh).toContain('CatalogSearchPicker');
    expect(wh).toContain('jobTitleOptionsFromCatalog');
    expect(wh).toContain('resolveWorkTimelinePositionFromCatalog');
    expect(wh).toContain('position_key: positionFields.position_key');
    expect(wh).toContain('HDSD_MUTATE_TEST_IDS.workTimelinePositionPicker');
    expect(wh).not.toMatch(/position:\s*formData\.position[^_]/);
  });
});
