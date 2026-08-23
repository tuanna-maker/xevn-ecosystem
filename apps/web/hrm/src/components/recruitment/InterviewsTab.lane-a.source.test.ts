import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(
  join(__dirname, 'InterviewsTab.tsx'),
  'utf8',
);

describe('InterviewsTab Lane A SoT (PO-HRM-REC-IV-LIST-LANE-A-01)', () => {
  it('lists via listRecruitmentInterviews not interviews-catalog twin', () => {
    expect(tabSrc).toContain('listRecruitmentInterviews');
    expect(tabSrc).not.toContain('listInterviewsCatalog');
    expect(tabSrc).not.toContain('createInterviewCatalog');
    expect(tabSrc).not.toContain('deleteInterviewCatalog');
    expect(tabSrc).not.toContain('updateInterviewCatalog');
  });

  it('mutates ACTIVE via Lane A status / Manage dialog', () => {
    expect(tabSrc).toContain('updateRecruitmentInterviewStatus');
    expect(tabSrc).toContain('ManageActiveInterviewDialog');
    expect(tabSrc).toContain('scheduleRecruitmentInterview');
  });
});
