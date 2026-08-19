import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(
  resolve(__dirname, '../components/recruitment/JobRequisitionsTab.tsx'),
  'utf8',
);
const pickerSrc = readFileSync(resolve(__dirname, './catalogSearchPicker.ts'), 'utf8');
const apiSrc = readFileSync(resolve(__dirname, '../integrations/hrmApi.ts'), 'utf8');
const testIdsSrc = readFileSync(resolve(__dirname, './hdsdMutateTestIds.ts'), 'utf8');

describe('PO-HRM-JOB-GRADES-CONSUMER-REC-FE-01 source locks', () => {
  it('catalog helpers exist for job_grades consumer', () => {
    expect(pickerSrc).toContain('jobGradeOptionsFromCatalog');
    expect(pickerSrc).toContain('resolveJobGradeLabel');
    expect(pickerSrc).toContain("jobGrades: ['job_grades', 'grades']");
  });

  it('JobRequisitionsTab wires overview + grade picker + labels', () => {
    expect(tabSrc).toContain('useSettingsCatalogsOverview');
    expect(tabSrc).toContain('jobGradeOptionsFromCatalog');
    expect(tabSrc).toContain('resolveJobGradeLabel');
    expect(tabSrc).toContain('name="job_grade_key"');
    expect(tabSrc).toContain('CatalogSearchPicker');
    expect(tabSrc).toContain('Ngạch/bậc');
    expect(tabSrc).toContain('job_grade_key: values.job_grade_key?.trim()');
    expect(tabSrc).toContain('job_grade_key: editJobGradeKey.trim()');
    expect(tabSrc).toContain('yctd-detail-job-grade');
    expect(tabSrc).toContain('yctd-grade-label-');
  });

  it('hrmApi exposes job_grade_key on requisition types', () => {
    expect(apiSrc).toMatch(/job_grade_key\?: string \| null/);
    expect(apiSrc).toContain('job_grade_key?: string;');
    expect(apiSrc).toContain('job_grade_key?: string | null;');
  });

  it('HDSD test id for requisition job grade picker', () => {
    expect(testIdsSrc).toContain("requisitionJobGrade: 'hdsd-requisition-job-grade'");
    expect(tabSrc).toContain('HDSD_MUTATE_TEST_IDS.requisitionJobGrade');
  });
});
