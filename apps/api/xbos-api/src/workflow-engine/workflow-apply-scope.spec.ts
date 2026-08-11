import {
  definitionAppliesToSpawnScope,
  isGroupWideApplyingEntity,
  isGroupWideDefinitionPartition,
  isHrmRecruitmentWorkflowCode,
  parseApplyingEntityIdFromGraph,
  pickActiveDefinitionForCompanyPartition,
} from './workflow-apply-scope';

describe('workflow-apply-scope — G-BM-REC-02 / BM-BE-REC-WF-SPAWN-MEMBER-01', () => {
  it('parses applyingEntityId from graph (camel + snake)', () => {
    expect(parseApplyingEntityIdFromGraph({ applyingEntityId: 'visun-uuid' })).toBe('visun-uuid');
    expect(parseApplyingEntityIdFromGraph({ applying_entity_id: '  x  ' })).toBe('x');
    expect(parseApplyingEntityIdFromGraph(null)).toBe('');
  });

  it('treats empty / holding / main as group-wide', () => {
    expect(isGroupWideApplyingEntity('')).toBe(true);
    expect(isGroupWideApplyingEntity('holding')).toBe(true);
    expect(isGroupWideApplyingEntity('main')).toBe(true);
    expect(isGroupWideApplyingEntity('dfb107a7-99e3-433a-94e5-f78ce8b2d665')).toBe(false);
  });

  it('Group CEO holding/main spawn OK when applyingEntityId = member UUID (VISUN)', () => {
    const visunId = 'dfb107a7-99e3-433a-94e5-f78ce8b2d665';
    expect(
      definitionAppliesToSpawnScope({
        spawnCompanyId: 'holding',
        spawnTenantId: 'xevn',
        applyingEntityId: visunId,
        resolvedPartition: { tenantId: 'visun', companyId: 'main' },
      }),
    ).toBe(true);
    expect(
      definitionAppliesToSpawnScope({
        spawnCompanyId: 'main',
        applyingEntityId: visunId,
      }),
    ).toBe(true);
  });

  it('member spawn OK when context memberTenant matches resolved partition', () => {
    expect(
      definitionAppliesToSpawnScope({
        spawnCompanyId: 'main',
        spawnTenantId: 'visun',
        contextMemberTenantId: 'visun',
        applyingEntityId: 'dfb107a7-99e3-433a-94e5-f78ce8b2d665',
        resolvedPartition: { tenantId: 'visun', companyId: 'main' },
      }),
    ).toBe(true);
  });

  it('rejects unrelated member company when apply is another member slug', () => {
    expect(
      definitionAppliesToSpawnScope({
        spawnCompanyId: 'trsport',
        spawnTenantId: 'xevn',
        applyingEntityId: 'visun',
        resolvedPartition: null,
      }),
    ).toBe(false);
  });

  it('recognizes recruitment workflow codes for ensure/fallback', () => {
    expect(isHrmRecruitmentWorkflowCode('hrm_requisition_approval')).toBe(true);
    expect(isHrmRecruitmentWorkflowCode('hrm_leave_approval')).toBe(false);
  });
});

describe('workflow-apply-scope — D-HRM-REC-WF-OPTION-B-BE-01 partition pick', () => {
  const visunId = 'dfb107a7-99e3-433a-94e5-f78ce8b2d665';
  const groupDef = {
    id: 'def-group',
    company_id: 'holding',
    version: 1,
    graph: { applyingEntityId: '', steps: [{ stepKey: 'g', fingerprint: 'group-graph' }] },
  };
  const visunDef = {
    id: 'def-visun',
    company_id: 'visun',
    version: 2,
    graph: {
      applyingEntityId: visunId,
      steps: [{ stepKey: 'v', fingerprint: 'visun-graph' }],
    },
    resolvedPartition: { tenantId: 'visun', companyId: 'main' },
  };
  const trsportDef = {
    id: 'def-trsport',
    company_id: 'trsport',
    version: 3,
    graph: { applyingEntityId: 'trsport', steps: [{ stepKey: 't', fingerprint: 'trsport-graph' }] },
  };

  it('isGroupWideDefinitionPartition: holding+empty apply = group; member company = override', () => {
    expect(isGroupWideDefinitionPartition('holding', '')).toBe(true);
    expect(isGroupWideDefinitionPartition(null, 'main')).toBe(true);
    expect(isGroupWideDefinitionPartition('visun', '')).toBe(false);
    expect(isGroupWideDefinitionPartition('holding', visunId)).toBe(false);
  });

  it('member spawn prefers member override over higher-version unrelated / group', () => {
    const picked = pickActiveDefinitionForCompanyPartition([groupDef, visunDef, trsportDef], {
      spawnCompanyId: 'visun',
      spawnTenantId: 'xevn',
      contextMemberCompanyId: 'visun',
    });
    expect(picked?.id).toBe('def-visun');
  });

  it('holding/main spawn prefers group-wide over higher-version member override', () => {
    const pickedHolding = pickActiveDefinitionForCompanyPartition([groupDef, visunDef, trsportDef], {
      spawnCompanyId: 'holding',
      spawnTenantId: 'xevn',
      contextMemberCompanyId: 'holding',
    });
    expect(pickedHolding?.id).toBe('def-group');

    const pickedMain = pickActiveDefinitionForCompanyPartition([groupDef, visunDef], {
      spawnCompanyId: 'main',
      spawnTenantId: 'xevn',
    });
    expect(pickedMain?.id).toBe('def-group');
  });

  it('does not silently pick unrelated member graph when group-wide exists', () => {
    const picked = pickActiveDefinitionForCompanyPartition([groupDef, trsportDef], {
      spawnCompanyId: 'visun',
      contextMemberCompanyId: 'visun',
    });
    expect(picked?.id).toBe('def-group');
  });

  it('member LE UUID applyingEntity matches via resolvedPartition tenant', () => {
    const onlyVisunUuid = {
      id: 'def-visun-uuid',
      company_id: 'holding',
      version: 5,
      graph: { applyingEntityId: visunId },
      resolvedPartition: { tenantId: 'visun', companyId: 'main' },
    };
    const picked = pickActiveDefinitionForCompanyPartition([groupDef, onlyVisunUuid], {
      spawnCompanyId: 'main',
      spawnTenantId: 'visun',
      contextMemberTenantId: 'visun',
      contextMemberCompanyId: 'main',
    });
    expect(picked?.id).toBe('def-visun-uuid');
  });

  it('G-BM-REC-02: holding spawn still picks sole member-bound def when no group-wide', () => {
    const picked = pickActiveDefinitionForCompanyPartition([visunDef], {
      spawnCompanyId: 'holding',
      spawnTenantId: 'xevn',
    });
    expect(picked?.id).toBe('def-visun');
  });

  it('unrelated member spawn with only other-member def → null (no silent wrong graph)', () => {
    const picked = pickActiveDefinitionForCompanyPartition([trsportDef], {
      spawnCompanyId: 'visun',
      contextMemberCompanyId: 'visun',
    });
    expect(picked).toBeNull();
  });
});
