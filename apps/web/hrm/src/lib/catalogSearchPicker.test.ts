/**
 * @CODE-MEMORY
 * Screen:     Vitest — catalog picker resolve / filter / reject Khối
 * UC:         AC-HRM-PICKER-01 · FR-HRM-EMP-COL-01 (company path)
 * What: Leave/department/job-title catalog helpers (empty = []; cấm invent code từ nhãn)
 * Why: AC-SET-FS-05 · FR-HRM-SC-MD-02 · AC-SET-FS-03 · D-HRM-SETTINGS-MD-LEAVE/DEPT/JT-FE-01
 */
import { describe, expect, it } from 'vitest';
import {
  buildDepartmentKeyFields,
  buildJobTemplatePositionFields,
  buildPositionKeyFields,
  catalogPickerRequiresSearch,
  departmentOptionsFromCatalog,
  filterCatalogPickerOptions,
  findCatalogRowByKeys,
  HRM_MASTER_DATA_CATALOG_KEYS,
  isCatalogPickerValueAllowed,
  jobTitleOptionsFromCatalog,
  leaveTypeOptionsFromCatalog,
  mergeEffectiveItemsByKeys,
  contractTypeOptionsFromCatalog,
  insurerOptionsFromCatalog,
  insuranceTypeOptionsFromCatalog,
  kpiLibraryOptionsFromCatalog,
  payTypeOptionsFromCatalog,
  resolveCatalogPickerSelection,
  resolveCatalogWriteKey,
  resolveContractTypeCatalogLabel,
  resolveContractTypeEditValue,
  resolveDepartmentLabel,
  recruitmentChannelOptionsFromCatalog,
  resolveRecruitmentChannelLabel,
  resolveInsurerLabel,
  resolveInsuranceTypeCatalogLabel,
  resolveJobTitleLabel,
  resolveKpiLibraryLabel,
  resolveLeaveTypeLabel,
  resolvePayTypeLabel,
  resolvePositionDisplayLabel,
  salaryComponentOptionsFromCatalog,
  resolveSalaryComponentLabel,
  buildSalaryComponentCatalogFields,
  toCatalogPickerOptions,
  toCompanyCatalogPickerOptions,
} from './catalogSearchPicker';

describe('catalogSearchPicker — AC-HRM-PICKER-01', () => {
  const options = toCatalogPickerOptions([
    { code: 'annual', label: 'Nghỉ phép năm', status: 'active' },
    { code: 'sick', label: 'Nghỉ ốm', status: 'active' },
    { code: 'draft_only', label: 'Nháp', status: 'draft' },
  ]);

  it('maps active items to value=code', () => {
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({ value: 'annual', label: 'Nghỉ phép năm', code: 'annual' });
  });

  it('filters by code and label (gõ ≥1 ký tự)', () => {
    expect(filterCatalogPickerOptions(options, 'sick').map((o) => o.value)).toEqual(['sick']);
    expect(filterCatalogPickerOptions(options, 'ốm').map((o) => o.value)).toEqual(['sick']);
    expect(filterCatalogPickerOptions(options, 'ANNUAL').map((o) => o.value)).toEqual(['annual']);
  });

  it('resolves catalog selection and rejects free-text SoT', () => {
    expect(resolveCatalogPickerSelection(options, 'annual')?.label).toBe('Nghỉ phép năm');
    expect(resolveCatalogPickerSelection(options, 'tự gõ')).toBeNull();
    expect(isCatalogPickerValueAllowed(options, 'tự gõ')).toBe(false);
    expect(isCatalogPickerValueAllowed(options, '', { allowEmpty: true })).toBe(true);
  });

  it('requires search affordance when list > 10', () => {
    expect(catalogPickerRequiresSearch(10)).toBe(false);
    expect(catalogPickerRequiresSearch(11)).toBe(true);
  });
});

describe('leaveTypeOptionsFromCatalog — AC-SET-FS-05 / BR-SET-MD-03', () => {
  it('returns [] when catalogs empty (no hardcoded bootstrap)', () => {
    expect(leaveTypeOptionsFromCatalog([])).toEqual([]);
  });

  it('returns [] when leave_types row missing or has no items', () => {
    expect(
      leaveTypeOptionsFromCatalog([{ catalogKey: 'job_titles', effectiveItems: [{ code: 'x', label: 'X' }] }]),
    ).toEqual([]);
    expect(
      leaveTypeOptionsFromCatalog([{ catalogKey: 'leave_types', effectiveItems: [] }]),
    ).toEqual([]);
  });

  it('maps leave_types effectiveItems to picker options', () => {
    const opts = leaveTypeOptionsFromCatalog([
      {
        catalogKey: 'leave_types',
        effectiveItems: [
          { code: 'annual', label: 'Nghỉ phép năm', status: 'active' },
          { code: 'sick', label: 'Nghỉ ốm', status: 'active' },
        ],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['annual', 'sick']);
    expect(resolveLeaveTypeLabel(opts, 'sick')).toBe('Nghỉ ốm');
    expect(resolveLeaveTypeLabel(opts, 'unknown_code')).toBe('—');
    expect(resolveLeaveTypeLabel(opts, '')).toBe('—');
  });
});

describe('departmentOptionsFromCatalog — FR-HRM-SC-MD-02 / AC-SET-FS-01..05', () => {
  it('returns [] when catalogs empty (no name-as-code invent)', () => {
    expect(departmentOptionsFromCatalog([])).toEqual([]);
  });

  it('returns [] when department keys missing or empty (honest empty)', () => {
    expect(
      departmentOptionsFromCatalog([
        { catalogKey: 'job_titles', effectiveItems: [{ code: 'mgr', label: 'Quản lý', status: 'active' }] },
      ]),
    ).toEqual([]);
    expect(
      departmentOptionsFromCatalog([{ catalogKey: 'departments', effectiveItems: [] }]),
    ).toEqual([]);
  });

  it('maps departments|department_catalog|org_departments codes only (not labels)', () => {
    const opts = departmentOptionsFromCatalog([
      {
        catalogKey: 'department_catalog',
        effectiveItems: [
          { code: 'HR', label: 'Phòng Nhân sự', status: 'active' },
          { code: 'FIN', label: 'Phòng Tài chính', status: 'active' },
          { code: 'DRAFT', label: 'Nháp', status: 'draft' },
        ],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['HR', 'FIN']);
    expect(opts[0]).toEqual({ value: 'HR', label: 'Phòng Nhân sự', code: 'HR' });
    expect(resolveCatalogPickerSelection(opts, 'Phòng Nhân sự')).toBeNull();
    expect(resolveCatalogPickerSelection(opts, 'HR')?.label).toBe('Phòng Nhân sự');
    expect(isCatalogPickerValueAllowed(opts, 'Phòng Nhân sự')).toBe(false);
  });

  it('skips items without code (never invent code from label)', () => {
    const opts = departmentOptionsFromCatalog([
      {
        catalogKey: 'org_departments',
        effectiveItems: [
          { code: '', label: 'Phòng không mã', status: 'active' },
          { code: 'OPS', label: 'Vận hành', status: 'active' },
        ],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['OPS']);
  });
});

describe('jobTitleOptionsFromCatalog — FR-HRM-RC-JD-01 / AC-SET-FS-03', () => {
  it('returns [] when catalogs empty (honest empty — no invent)', () => {
    expect(jobTitleOptionsFromCatalog([])).toEqual([]);
  });

  it('returns [] when job_titles keys missing or empty', () => {
    expect(
      jobTitleOptionsFromCatalog([
        { catalogKey: 'leave_types', effectiveItems: [{ code: 'annual', label: 'Nghỉ phép', status: 'active' }] },
      ]),
    ).toEqual([]);
    expect(
      jobTitleOptionsFromCatalog([{ catalogKey: 'job_titles', effectiveItems: [] }]),
    ).toEqual([]);
  });

  it('maps job_titles|positions codes only (not labels as SoT)', () => {
    const opts = jobTitleOptionsFromCatalog([
      {
        catalogKey: 'job_titles',
        effectiveItems: [
          { code: 'NV_KD', label: 'Nhân viên Kinh doanh', status: 'active' },
          { code: 'TRUONG_PHONG', label: 'Trưởng phòng', status: 'active' },
          { code: 'DRAFT', label: 'Nháp', status: 'draft' },
        ],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['NV_KD', 'TRUONG_PHONG']);
    expect(resolveCatalogPickerSelection(opts, 'Nhân viên Kinh doanh')).toBeNull();
    expect(resolveJobTitleLabel(opts, 'NV_KD')).toBe('Nhân viên Kinh doanh');
    expect(resolveJobTitleLabel(opts, 'UNKNOWN_CODE')).toBe('—');
    expect(isCatalogPickerValueAllowed(opts, 'Nhân viên Kinh doanh')).toBe(false);
  });

  it('buildJobTemplatePositionFields requires catalog code — never invent from label', () => {
    const opts = jobTitleOptionsFromCatalog([
      {
        catalogKey: 'positions',
        effectiveItems: [{ code: 'NV_KD', label: 'Nhân viên Kinh doanh', status: 'active' }],
      },
    ]);
    expect(buildJobTemplatePositionFields('NV_KD', opts)).toEqual({
      position_code: 'NV_KD',
      position_name: 'Nhân viên Kinh doanh',
    });
    expect(buildJobTemplatePositionFields('Nhân viên Kinh doanh', opts)).toBeNull();
    expect(buildJobTemplatePositionFields('', opts)).toBeNull();
    expect(buildJobTemplatePositionFields('FAKE', opts)).toBeNull();
  });

  it('buildPositionKeyFields / buildDepartmentKeyFields — E1-A Network *_key + snapshot', () => {
    const posOpts = jobTitleOptionsFromCatalog([
      {
        catalogKey: 'job_titles',
        effectiveItems: [{ code: 'TP_KD', label: 'Trưởng phòng KD', status: 'active' }],
      },
    ]);
    const deptOpts = departmentOptionsFromCatalog([
      {
        catalogKey: 'departments',
        effectiveItems: [{ code: 'KD', label: 'Kinh doanh', status: 'active' }],
      },
    ]);
    expect(buildPositionKeyFields('TP_KD', posOpts)).toEqual({
      position_key: 'TP_KD',
      position: 'Trưởng phòng KD',
    });
    expect(buildPositionKeyFields('Trưởng phòng KD', posOpts)).toBeNull();
    expect(buildDepartmentKeyFields('KD', deptOpts)).toEqual({
      department_key: 'KD',
      department: 'Kinh doanh',
    });
    expect(buildDepartmentKeyFields('Kinh doanh', deptOpts)).toBeNull();
    expect(resolveDepartmentLabel(deptOpts, 'KD')).toBe('Kinh doanh');
    expect(resolvePositionDisplayLabel(posOpts, 'TP_KD')).toBe('Trưởng phòng KD');
    expect(resolvePositionDisplayLabel(posOpts, null, 'Legacy label')).toBe('Legacy label');
    expect(resolvePositionDisplayLabel(posOpts, 'UNKNOWN', null)).toBe('—');
  });
});

describe('catalogSearchPicker — company col reject Khối', () => {
  it('drops Khối Plane B labels from company picker options', () => {
    const opts = toCompanyCatalogPickerOptions([
      { id: 'holding', name: 'Công ty CP Tập đoàn XEVN' },
      { id: 'xe-tmdv', name: 'Khối Vận tải X.E' },
      { id: 'visun', name: 'Khối Logistics X.E' },
      { id: 'empty', name: '   ' },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['holding']);
    expect(opts[0]?.label).toBe('Công ty CP Tập đoàn XEVN');
  });

  it('fail-closed when only Khối names present', () => {
    expect(
      toCompanyCatalogPickerOptions([{ id: 'a', name: 'Khối Tài chính X.E' }]),
    ).toEqual([]);
  });
});

describe('D-FE-ERP-E1B-MD-PANEL-01 — DEC alias + writeKey', () => {
  it('decisionTypes keys include hr_decision_types and decision_types', () => {
    expect([...HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes]).toEqual([
      'hr_decision_types',
      'decision_types',
    ]);
    expect(Object.keys(HRM_MASTER_DATA_CATALOG_KEYS).length).toBeGreaterThanOrEqual(10);
  });

  it('findCatalogRowByKeys prefers alias with items (live DEC)', () => {
    const catalogs = [
      { catalogKey: 'decision_types', effectiveItems: [] as { code: string; label: string }[] },
      {
        catalogKey: 'hr_decision_types',
        effectiveItems: [{ code: 'transfer', label: 'Điều động' }],
      },
    ];
    const hit = findCatalogRowByKeys(catalogs, HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes);
    expect(hit?.catalogKey).toBe('hr_decision_types');
  });

  it('mergeEffectiveItemsByKeys unions DEC aliases', () => {
    const merged = mergeEffectiveItemsByKeys(
      [
        {
          catalogKey: 'hr_decision_types',
          effectiveItems: [{ code: 'a', label: 'A', status: 'active' }],
        },
        {
          catalogKey: 'decision_types',
          effectiveItems: [
            { code: 'a', label: 'A-dup', status: 'active' },
            { code: 'b', label: 'B', status: 'active' },
          ],
        },
      ],
      HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes,
    );
    expect(merged.map((i) => i.code)).toEqual(['a', 'b']);
    expect(merged[0]?.label).toBe('A');
  });

  it('resolveCatalogWriteKey prefers hr_decision_types when live', () => {
    expect(
      resolveCatalogWriteKey(
        [
          {
            catalogKey: 'hr_decision_types',
            effectiveItems: [{ code: 'x', label: 'X' }],
          },
        ],
        HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes,
        'hr_decision_types',
      ),
    ).toBe('hr_decision_types');
    expect(
      resolveCatalogWriteKey([], HRM_MASTER_DATA_CATALOG_KEYS.decisionTypes, 'hr_decision_types'),
    ).toBe('hr_decision_types');
  });
});

describe('payTypeOptionsFromCatalog — AC-E2-PAY-NATURE-01', () => {
  it('returns [] when catalogs empty (no HARDCODE bootstrap)', () => {
    expect(payTypeOptionsFromCatalog([])).toEqual([]);
  });

  it('merges pay_types aliases and maps value=code', () => {
    const opts = payTypeOptionsFromCatalog([
      {
        catalogKey: 'pay_types',
        effectiveItems: [{ code: 'salary', label: 'Lương', status: 'active' }],
      },
      {
        catalogKey: 'component_types',
        effectiveItems: [{ code: 'allowance', label: 'Phụ cấp', status: 'active' }],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['salary', 'allowance']);
    expect(resolvePayTypeLabel(opts, 'salary')).toBe('Lương');
    expect(resolvePayTypeLabel(opts, 'invent')).toBe('—');
  });
});

describe('salaryComponentOptionsFromCatalog — AC-PAY-COMP-01', () => {
  it('returns [] when catalogs empty (no free-text SoT)', () => {
    expect(salaryComponentOptionsFromCatalog([])).toEqual([]);
  });

  it('merges salary_components aliases and maps value=code', () => {
    const opts = salaryComponentOptionsFromCatalog([
      {
        catalogKey: 'salary_components',
        effectiveItems: [{ code: 'LUONG_CB', label: 'Lương cơ bản', status: 'active' }],
      },
      {
        catalogKey: 'payroll_components',
        effectiveItems: [{ code: 'PC_AN', label: 'Phụ cấp ăn', status: 'active' }],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['LUONG_CB', 'PC_AN']);
    expect(resolveSalaryComponentLabel(opts, 'LUONG_CB')).toBe('Lương cơ bản');
    expect(resolveSalaryComponentLabel(opts, 'invent')).toBe('—');
    expect(buildSalaryComponentCatalogFields('PC_AN', opts)).toEqual({
      code: 'PC_AN',
      name: 'Phụ cấp ăn',
    });
    expect(buildSalaryComponentCatalogFields('tự gõ', opts)).toBeNull();
  });
});

describe('contractTypeOptionsFromCatalog — AC-E2-CI-TYPE-01', () => {
  it('returns [] when empty (no HARDCODE fallback)', () => {
    expect(contractTypeOptionsFromCatalog([])).toEqual([]);
  });

  it('maps contract_types to picker options', () => {
    const opts = contractTypeOptionsFromCatalog([
      {
        catalogKey: 'contract_types',
        effectiveItems: [
          { code: 'indefinite', label: 'Không thời hạn', status: 'active' },
          { code: 'fixed_1y', label: 'Hợp đồng 1 năm', status: 'active' },
        ],
      },
    ]);
    expect(opts).toHaveLength(2);
    expect(resolveContractTypeCatalogLabel(opts, 'indefinite')).toBe('Không thời hạn');
    expect(resolveContractTypeCatalogLabel(opts, 'unknown')).toBe('—');
  });

  it('resolveContractTypeEditValue — maps VI label to catalog code (QACONPAYST parity)', () => {
    const opts = contractTypeOptionsFromCatalog([
      {
        catalogKey: 'contract_types',
        effectiveItems: [
          {
            code: 'HDLD_XDHN_36',
            label: 'Hợp đồng lao động xác định thời hạn 36 tháng',
            status: 'active',
          },
          { code: 'indefinite', label: 'Không thời hạn', status: 'active' },
        ],
      },
    ]);
    expect(resolveContractTypeEditValue(opts, 'HDLD_XDHN_36', true)).toBe('HDLD_XDHN_36');
    expect(resolveContractTypeEditValue(opts, 'Hợp đồng 3 năm', true)).toBe('HDLD_XDHN_36');
    expect(resolveContractTypeEditValue(opts, 'invent label', true)).toBe('');
    expect(resolveContractTypeEditValue(opts, 'legacy', false)).toBe('legacy');
  });
});

describe('insurer / insurance_types / kpi_library — AC-INS / AC-PERF E3', () => {
  it('returns [] when empty (honest empty + CTA)', () => {
    expect(insurerOptionsFromCatalog([])).toEqual([]);
    expect(insuranceTypeOptionsFromCatalog([])).toEqual([]);
    expect(kpiLibraryOptionsFromCatalog([])).toEqual([]);
  });

  it('merges insurer aliases and maps codes', () => {
    const opts = insurerOptionsFromCatalog([
      {
        catalogKey: 'insurance_providers',
        effectiveItems: [{ code: 'bao_viet', label: 'Bảo Việt', status: 'active' }],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['bao_viet']);
    expect(resolveInsurerLabel(opts, 'bao_viet')).toBe('Bảo Việt');
    expect(resolveInsurerLabel(opts, 'invent')).toBe('—');
  });

  it('maps insurance_types + kpi_library', () => {
    const types = insuranceTypeOptionsFromCatalog([
      {
        catalogKey: 'insurance_types',
        effectiveItems: [{ code: 'bhxh', label: 'BHXH', status: 'active' }],
      },
    ]);
    const kpis = kpiLibraryOptionsFromCatalog([
      {
        catalogKey: 'kpi_metrics',
        effectiveItems: [{ code: 'kpi_dt', label: 'Doanh thu', status: 'active' }],
      },
    ]);
    expect(resolveInsuranceTypeCatalogLabel(types, 'bhxh')).toBe('BHXH');
    expect(resolveKpiLibraryLabel(kpis, 'kpi_dt')).toBe('Doanh thu');
    expect(HRM_MASTER_DATA_CATALOG_KEYS.insurers).toContain('insurers');
    expect(HRM_MASTER_DATA_CATALOG_KEYS.kpiLibrary).toContain('kpi_library');
  });
});

describe('recruitmentChannelOptionsFromCatalog — FR-HRM-SC-CH-01 / AC-SET-CONSUMER-CH-REC-01', () => {
  it('returns [] when catalogs empty (honest empty)', () => {
    expect(recruitmentChannelOptionsFromCatalog([])).toEqual([]);
  });

  it('merges recruitment_channels | candidate_sources | channels aliases', () => {
    const opts = recruitmentChannelOptionsFromCatalog([
      {
        catalogKey: 'candidate_sources',
        effectiveItems: [{ code: 'LINKEDIN', label: 'LinkedIn', status: 'active' }],
      },
      {
        catalogKey: 'recruitment_channels',
        effectiveItems: [{ code: 'WEB', label: 'Website công ty', status: 'active' }],
      },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['WEB', 'LINKEDIN']);
    expect(resolveRecruitmentChannelLabel(opts, 'WEB')).toBe('Website công ty');
    expect(resolveRecruitmentChannelLabel(opts, 'unknown')).toBe('—');
    expect(HRM_MASTER_DATA_CATALOG_KEYS.recruitmentChannels).toContain('recruitment_channels');
  });
});
