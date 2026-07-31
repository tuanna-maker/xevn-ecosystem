import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  isRequisitionJobTemplateSelected,
  mapRequisitionStatus,
  nestStatusMatchesFilter,
  normalizeRequisitionHeadcount,
  REQUISITION_EMPTY_JD_LIBRARY_HINT_VI,
  REQUISITION_JD_TEMPLATE_REQUIRED_VI,
  REQUISITION_NONE_TEMPLATE_SENTINEL,
  REQUISITION_OPEN_JD_LIBRARY_CTA_VI,
  REQUISITION_STATUS_LABEL_VI,
  requisitionDepartmentPickerOptions,
  buildRequisitionCreateFormDefaults,
  isRequisitionCreateFormReady,
  resolveRequisitionDepartmentDefault,
  resolveEffectiveJobTemplates,
  unwrapJobDescriptionTemplateRows,
} from '@/lib/jobRequisitionUi';

describe('jobRequisitionUi', () => {
  it('maps open requisition to active UI status', () => {
    expect(mapRequisitionStatus('open')).toBe('active');
  });

  it('filters active rows for UI status filter', () => {
    expect(nestStatusMatchesFilter('open', 'active')).toBe(true);
    expect(nestStatusMatchesFilter('closed', 'active')).toBe(false);
  });

  it('labels Vietnamese status for UF-HRM-12 display', () => {
    expect(REQUISITION_STATUS_LABEL_VI.open).toBe('Đang tuyển');
    expect(REQUISITION_STATUS_LABEL_VI.on_hold).toBe('Tạm dừng');
  });

  it('normalizeRequisitionHeadcount accepts ≥1 integers (FE-HRM-G-RC-01)', () => {
    expect(normalizeRequisitionHeadcount(1)).toBe(1);
    expect(normalizeRequisitionHeadcount(3)).toBe(3);
    expect(normalizeRequisitionHeadcount('15')).toBe(15);
    expect(normalizeRequisitionHeadcount(2.9)).toBe(2);
  });

  it('normalizeRequisitionHeadcount rejects ≤0 / empty / NaN (FR-HRM-RC-01)', () => {
    expect(normalizeRequisitionHeadcount(0)).toBeNull();
    expect(normalizeRequisitionHeadcount(-1)).toBeNull();
    expect(normalizeRequisitionHeadcount('')).toBeNull();
    expect(normalizeRequisitionHeadcount(undefined)).toBeNull();
    expect(normalizeRequisitionHeadcount(NaN)).toBeNull();
  });

  it('isRequisitionJobTemplateSelected rejects empty / __none__ (BM-FE-JD-REQ-ONLY-01)', () => {
    expect(isRequisitionJobTemplateSelected(undefined)).toBe(false);
    expect(isRequisitionJobTemplateSelected(null)).toBe(false);
    expect(isRequisitionJobTemplateSelected('')).toBe(false);
    expect(isRequisitionJobTemplateSelected('   ')).toBe(false);
    expect(isRequisitionJobTemplateSelected(REQUISITION_NONE_TEMPLATE_SENTINEL)).toBe(false);
    expect(isRequisitionJobTemplateSelected('tpl-uuid-1')).toBe(true);
  });

  it('requisitionDepartmentPickerOptions — catalog first, then requisition/OU fallback', () => {
    expect(requisitionDepartmentPickerOptions([], [], [])).toEqual([]);
    expect(
      requisitionDepartmentPickerOptions(
        [],
        ['Phòng KD'],
        ['Vận hành'],
      ).map((o) => o.value),
    ).toEqual(['Phòng KD', 'Vận hành']);
    expect(
      requisitionDepartmentPickerOptions(
        [{ catalogKey: 'departments', effectiveItems: [{ code: 'HR', label: 'Nhân sự', status: 'active' }] }],
        ['Legacy'],
        ['OU'],
      ).map((o) => o.value),
    ).toEqual(['HR']);
  });

  it('buildRequisitionCreateFormDefaults — sync JD + dept fallback chain', () => {
    expect(
      buildRequisitionCreateFormDefaults({ templates: [], departmentOptions: [] }),
    ).toBeNull();
    const defaults = buildRequisitionCreateFormDefaults({
      templates: [
        {
          id: 'tpl-1',
          title: 'Tài xế',
          position_code: 'DRV',
          position_name: null,
          job_description: 'Mô tả',
          requirements: 'Yêu cầu',
        },
      ],
      departmentOptions: [],
      ouLabels: ['Vận hành'],
    });
    expect(defaults?.job_template_id).toBe('tpl-1');
    expect(defaults?.title).toBe('Tài xế');
    expect(defaults?.department).toBe('Vận hành');
    expect(defaults?.headcount).toBe(1);
  });

  it('isRequisitionCreateFormReady — true when template title/dept resolve despite empty RHF dept', () => {
    expect(
      isRequisitionCreateFormReady({
        watched: {
          title: '',
          department: '',
          employmentType: '',
          headcount: undefined,
          jobTemplateId: '',
        },
        templates: [{ id: 'tpl-pilot', title: 'QA JD Pilot', code: 'JD-PILOT' }],
        departmentOptions: [],
        ouLabels: [],
      }),
    ).toBe(true);
  });

  it('isRequisitionCreateFormReady — true when only template code present', () => {
    expect(
      isRequisitionCreateFormReady({
        watched: { title: '', department: '', employmentType: '', headcount: '', jobTemplateId: '' },
        templates: [{ id: 'tpl-1', title: '', code: 'JD-CODE-ONLY' }],
        departmentOptions: [],
        ouLabels: [],
      }),
    ).toBe(true);
  });

  it('resolveRequisitionDepartmentDefault — ouLabels before sparse template fields', () => {
    expect(
      resolveRequisitionDepartmentDefault({
        template: { id: 'tpl-sparse', title: '', code: '' },
        departmentOptions: [],
        ouLabels: ['Vận hành Logistics'],
      }),
    ).toBe('Vận hành Logistics');
  });

  it('isRequisitionCreateFormReady — dept mirrors title when catalog/OU empty', () => {
    expect(
      isRequisitionCreateFormReady({
        watched: { title: '', department: '', employmentType: '', headcount: '', jobTemplateId: '' },
        templates: [{ id: 'tpl-title-only', title: 'Chuyên viên HCNS', code: '' }],
        departmentOptions: [],
        ouLabels: [],
      }),
    ).toBe(true);
  });

  it('resolveRequisitionDepartmentDefault — title fallback when position fields empty', () => {
    expect(
      resolveRequisitionDepartmentDefault({
        template: { id: 'tpl-2', title: 'Chuyên viên HCNS', code: 'JD-HCNS' },
        departmentOptions: [],
        ouLabels: [],
      }),
    ).toBe('Chuyên viên HCNS');
  });

  it('resolveRequisitionDepartmentDefault — job title catalog label for position_code', () => {
    expect(
      resolveRequisitionDepartmentDefault({
        template: { id: 'tpl-3', title: 'Role', position_code: 'DRV', position_name: null },
        departmentOptions: [],
        jobTitleOptions: [{ value: 'DRV', label: 'Tài xế', code: 'DRV' }],
      }),
    ).toBe('Tài xế');
  });

  it('exposes VI copy for required JD + empty library CTA', () => {
    expect(REQUISITION_JD_TEMPLATE_REQUIRED_VI).toMatch(/Chọn JD/);
    expect(REQUISITION_EMPTY_JD_LIBRARY_HINT_VI).toMatch(/thư viện/i);
    expect(REQUISITION_OPEN_JD_LIBRARY_CTA_VI).toBe('Mở Thư viện JD');
  });
});

describe('JobRequisitionsTab JD-only source contract (BM-FE-JD-REQ-ONLY-01)', () => {
  const src = readFileSync(
    join(process.cwd(), 'src/components/recruitment/JobRequisitionsTab.tsx'),
    'utf8',
  );

  it('requires job_template_id on create schema (no optional free-text-only path)', () => {
    expect(src).toMatch(/job_template_id:\s*z\s*\n?\s*\.string\(\)/);
    expect(src).toContain('.min(1, REQUISITION_JD_TEMPLATE_REQUIRED_VI)');
    expect(src).toContain('isRequisitionJobTemplateSelected');
    expect(src).toContain('REQUISITION_JD_TEMPLATE_REQUIRED_VI');
  });

  it('does not offer __none__ / «Không dùng template» on create Select', () => {
    expect(src).not.toContain("SelectItem value={NONE_TEMPLATE}");
    expect(src).not.toContain('Không dùng template');
    expect(src).not.toMatch(/value=\{[^}]*NONE_TEMPLATE/);
  });

  it('gates JD/requirements free-text until template applied; empty library CTA to Thư viện JD', () => {
    expect(src).toContain('jdSnapshotUnlocked');
    expect(src).toContain('REQUISITION_OPEN_JD_LIBRARY_CTA_VI');
    expect(src).toContain('onOpenJdLibrary');
    expect(src).toContain('Chép từ JD');
    expect(src).toContain('handleOpenCreate');
    expect(src).toContain('buildRequisitionCreateFormDefaults');
  });

  it('keeps G-RC-01 headcount + job_template_id on POST payload', () => {
    expect(src).toContain('normalizeRequisitionHeadcount');
    expect(src).toContain('job_template_id: jobTemplateId');
    expect(src).toContain('headcount');
  });
});

describe('D-HDSD-MUTATE-FE-11 — job-templates refetch storm guard', () => {
  const src = readFileSync(
    join(process.cwd(), 'src/components/recruitment/JobRequisitionsTab.tsx'),
    'utf8',
  );

  it('uses page-level refetch callback (single shared hook — FE-14)', () => {
    expect(src).toContain('refetchJobTemplatesProp');
    expect(src).toMatch(/const refetchTemplates = useCallback/);
    expect(src).toMatch(/await refetchJobTemplatesProp\(\)/);
    expect(src).toContain('unwrapJobDescriptionTemplateRows');
    expect(src).not.toContain('useJobTemplates(');
  });

  it('one-shot create-dialog refetch guard — no createOpen effect loop', () => {
    expect(src).toContain('createDialogRefetchAttemptedRef');
    expect(src).not.toMatch(
      /if \(!createOpen \|\| !useInternalTemplates\) return;\s*\n\s*if \(templates\.length === 0 && !templatesLoading\)/,
    );
  });
});

describe('D-HDSD-MUTATE-FE-12 — YCTD dept hydrate + template source', () => {
  const src = readFileSync(
    join(process.cwd(), 'src/components/recruitment/JobRequisitionsTab.tsx'),
    'utf8',
  );

  it('uses shared page-level templates prop (FE-14)', () => {
    expect(src).toContain('jobTemplatesProp = []');
    expect(src).not.toMatch(/const parentHasTemplates/);
    expect(src).not.toMatch(/useInternalTemplates/);
  });

  it('await refetch before open defaults when library empty', () => {
    expect(src).toMatch(/let fetched = await refetchTemplates\(\)/);
    expect(src).toMatch(/activeTemplates = fetched/);
  });
});

describe('D-HDSD-MUTATE-FE-13 — templates hydration merge', () => {
  const tabSrc = readFileSync(
    join(process.cwd(), 'src/components/recruitment/JobRequisitionsTab.tsx'),
    'utf8',
  );
  const hookSrc = readFileSync(join(process.cwd(), 'src/hooks/useJobTemplates.ts'), 'utf8');

  it('resolveEffectiveJobTemplates — union by id when both hook and dialog have rows', () => {
    const hookRow = { id: 'hook-1', title: 'Hook JD' };
    const dialogRow = { id: 'dlg-1', title: 'Dialog JD' };
    expect(resolveEffectiveJobTemplates([hookRow], [dialogRow])).toEqual([hookRow, dialogRow]);
    expect(resolveEffectiveJobTemplates([hookRow], [hookRow])).toEqual([hookRow]);
    expect(resolveEffectiveJobTemplates([], [dialogRow])).toEqual([dialogRow]);
    expect(resolveEffectiveJobTemplates([], [])).toEqual([]);
  });

  it('isRequisitionCreateFormReady — true when only dialog-hydrated templates present', () => {
    expect(
      isRequisitionCreateFormReady({
        watched: { title: '', department: '', employmentType: '', headcount: '', jobTemplateId: '' },
        templates: [{ id: 'dlg-hydrate', title: 'QA JD HDSD', code: 'JD-QA' }],
        departmentOptions: [],
        ouLabels: ['Tập đoàn XEVN'],
      }),
    ).toBe(true);
  });

  it('JobRequisitionsTab — dialogHydratedTemplates + effectiveTemplates wiring', () => {
    expect(tabSrc).toContain('dialogHydratedTemplates');
    expect(tabSrc).toContain('resolveEffectiveJobTemplates');
    expect(tabSrc).toContain('effectiveTemplates');
    expect(tabSrc).toMatch(/await refetchJobTemplatesProp\(\)/);
  });

  it('useJobTemplates — refetch awaits in-flight promise (no stale [] return)', () => {
    expect(hookSrc).toContain('inFlightRef');
    expect(hookSrc).toMatch(/if \(inFlightRef\.current\)/);
    expect(hookSrc).not.toMatch(/fetchInFlightRef\.current\)\s*\{\s*return templatesRef\.current/);
  });
});

describe('D-HDSD-MUTATE-FE-14 — shared jd-library ↔ requisitions source', () => {
  const tabSrc = readFileSync(
    join(process.cwd(), 'src/components/recruitment/JobRequisitionsTab.tsx'),
    'utf8',
  );
  const pageSrc = readFileSync(join(process.cwd(), 'src/pages/Recruitment.tsx'), 'utf8');
  const jdSrc = readFileSync(
    join(process.cwd(), 'src/components/recruitment/JobTemplatesTab.tsx'),
    'utf8',
  );

  it('Recruitment page passes shared hook to jd-library and requisitions tabs', () => {
    expect(pageSrc).toContain('recruitmentJobTemplatesState');
    expect(pageSrc).toContain('sharedTemplates={recruitmentJobTemplatesState}');
    expect(pageSrc).toContain('refetchJobTemplates={recruitmentJobTemplatesState.refetch}');
  });

  it('handleOpenCreate — direct listJobDescriptionTemplates fallback when refetch []', () => {
    expect(tabSrc).toContain('listJobDescriptionTemplates');
    expect(tabSrc).toMatch(/if \(fetched\.length === 0\)/);
  });

  it('JobTemplatesTab — accepts sharedTemplates prop', () => {
    expect(jdSrc).toContain('sharedTemplates');
    expect(jdSrc).toMatch(/sharedTemplates \?\? internalHook/);
  });
});

describe('D-HDSD-MUTATE-FE-15 — job-templates row unwrap + sync hydrate', () => {
  const tabSrc = readFileSync(
    join(process.cwd(), 'src/components/recruitment/JobRequisitionsTab.tsx'),
    'utf8',
  );
  const hookSrc = readFileSync(join(process.cwd(), 'src/hooks/useJobTemplates.ts'), 'utf8');
  const pageSrc = readFileSync(join(process.cwd(), 'src/pages/Recruitment.tsx'), 'utf8');

  const sampleRow = {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    title: 'QA JD HDSD',
    code: 'JD-QA',
  };

  it('unwrapJobDescriptionTemplateRows — { total, data: rows[] } envelope', () => {
    expect(
      unwrapJobDescriptionTemplateRows({ total: 1, data: [sampleRow] }),
    ).toEqual([sampleRow]);
  });

  it('unwrapJobDescriptionTemplateRows — bare array', () => {
    expect(unwrapJobDescriptionTemplateRows([sampleRow])).toEqual([sampleRow]);
  });

  it('unwrapJobDescriptionTemplateRows — skips rows without id', () => {
    expect(
      unwrapJobDescriptionTemplateRows([
        sampleRow,
        { title: 'orphan' } as { id: string; title: string },
      ]),
    ).toEqual([sampleRow]);
  });

  it('handleOpenCreate — unwrap + sync ref + hydrateJobTemplates', () => {
    expect(tabSrc).toContain('unwrapJobDescriptionTemplateRows');
    expect(tabSrc).toContain('openSyncTemplatesRef');
    expect(tabSrc).toContain('hydrateJobTemplatesProp');
    expect(tabSrc).not.toMatch(/fetched = direct\.data \?\? \[\]/);
    expect(tabSrc).toMatch(/if \(fetched\.length === 0\)/);
  });

  it('useJobTemplates — unwrap list payload + hydrateTemplates export', () => {
    expect(hookSrc).toContain('unwrapJobDescriptionTemplateRows');
    expect(hookSrc).toContain('hydrateTemplates');
  });

  it('Recruitment page — passes hydrateJobTemplates to requisitions tab', () => {
    expect(pageSrc).toContain('hydrateJobTemplates={recruitmentJobTemplatesState.hydrateTemplates}');
  });
});
