import { ResolverRegistry } from './resolver-registry';
import { createInMemoryResolverDataSource } from './resolver-data-source';
import type { ResolverRuntimeContext } from './resolver-registry.types';

const baseCtx: ResolverRuntimeContext = {
  tenantId: 'xevn',
  companyId: 'holding',
  submitter: {
    userId: 'nv001@xe.vn',
    employeeId: 'emp-nv-001',
    companyId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    companySlug: 'holding',
  },
  businessType: 'hrm_leave',
  businessId: 'leave-001',
  stepKey: 'manager_approval',
};

describe('ResolverRegistry — AC-CD-F4-02..04', () => {
  it('AC-CD-F4-02: direct_manager resolves submitter manager user account', async () => {
    const data = createInMemoryResolverDataSource({
      managers: { 'emp-nv-001': 'manager.a@xe.vn' },
      activeUsers: new Set(['manager.a@xe.vn', 'nv001@xe.vn']),
    });
    const registry = new ResolverRegistry(data);
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'manager_approval',
        resolver_type: 'direct_manager',
        resolver_config: { fallback_role_code: 'hrbp' },
      },
      baseCtx,
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      assigneeUserId: 'manager.a@xe.vn',
      resolvedVia: 'direct_manager',
      escalated: false,
    });
  });

  it('CD-FB-07: direct_manager assigns HRM email even without xbos membership (mobile UAT)', async () => {
    const data = createInMemoryResolverDataSource({
      managers: { 'emp-nv-001': 'uat.nv0001@xe.vn' },
      // Only unrelated users active — manager has no membership row
      activeUsers: new Set(['ceo@xe.vn']),
    });
    const registry = new ResolverRegistry(data);
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'manager_approval',
        resolver_type: 'direct_manager',
        resolver_config: { fallback_role_code: 'hrbp' },
      },
      baseCtx,
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      assigneeUserId: 'uat.nv0001@xe.vn',
      resolvedVia: 'direct_manager',
      escalated: false,
      hatKey: 'direct_manager',
    });
  });

  it('AC-CD-F4-03: position_template resolves active assignment holder', async () => {
    const data = createInMemoryResolverDataSource({
      positionAssignments: [
        {
          tenantId: 'xevn',
          companyId: 'holding',
          positionCode: 'TRUONG_PHONG',
          userId: 'truong.phong@xe.vn',
          assignmentId: 'asg-tp-01',
        },
      ],
      activeUsers: new Set(['truong.phong@xe.vn']),
    });
    const registry = new ResolverRegistry(data);
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'dept_head',
        resolver_type: 'position_template',
        resolver_config: { position_code: 'TRUONG_PHONG', company_id: 'main' },
      },
      { ...baseCtx, stepKey: 'dept_head' },
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      assigneeUserId: 'truong.phong@xe.vn',
      hatKey: 'truong_phong',
      assignmentId: 'asg-tp-01',
      resolvedVia: 'position_template',
    });
  });

  it('AC-CD-F4-04: parallel_group policy all creates separate tasks per child resolver', async () => {
    const data = createInMemoryResolverDataSource({
      managers: { 'emp-nv-001': 'manager.a@xe.vn' },
      positionAssignments: [
        {
          tenantId: 'xevn',
          companyId: 'holding',
          positionCode: 'HCNS',
          userId: 'hcns@xe.vn',
          assignmentId: 'asg-hcns-01',
        },
      ],
      activeUsers: new Set(['manager.a@xe.vn', 'hcns@xe.vn']),
    });
    const registry = new ResolverRegistry(data);
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'parallel_exec',
        resolver_type: 'parallel_group',
        resolver_config: {
          parallel_policy: 'all',
          resolver_types: ['direct_manager', 'position_template'],
          resolver_configs: [{}, { position_code: 'HCNS', company_id: 'main' }],
        },
      },
      { ...baseCtx, stepKey: 'parallel_exec' },
    );
    expect(tasks).toHaveLength(2);
    expect(tasks.map((t) => t.assigneeUserId).sort()).toEqual(['hcns@xe.vn', 'manager.a@xe.vn']);
    const groupIds = new Set(tasks.map((t) => t.parallelGroupId));
    expect(groupIds.size).toBe(1);
    expect(tasks.every((t) => t.parallelPolicy === 'all')).toBe(true);
  });

  it('BR-CD-F4-04: empty direct_manager escalates to CHRO position then spawns task', async () => {
    const escalations: unknown[] = [];
    const data = createInMemoryResolverDataSource({
      managers: {},
      positionAssignments: [
        {
          tenantId: 'xevn',
          companyId: 'holding',
          positionCode: 'CHRO',
          userId: 'chro@xe.vn',
          assignmentId: 'asg-chro',
        },
      ],
      activeUsers: new Set(['chro@xe.vn']),
    });
    const registry = new ResolverRegistry(data, {
      onEscalation: (log) => escalations.push(log),
    });
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'manager_approval',
        resolver_type: 'direct_manager',
        resolver_config: {},
      },
      baseCtx,
    );
    expect(tasks[0]).toMatchObject({
      assigneeUserId: 'chro@xe.vn',
      escalated: true,
      escalationReason: 'CHRO',
    });
    expect(escalations).toHaveLength(1);
    expect(escalations[0]).toMatchObject({ code: 'WF-ERR-RESOLVE-ESCALATE', escalation_tier: 1 });
  });

  it('rejects unknown resolver_type with XBOS-WF-400', async () => {
    const registry = new ResolverRegistry(createInMemoryResolverDataSource({}));
    await expect(
      registry.resolveStepTasks({ resolver_type: 'unknown_kind' }, baseCtx),
    ).rejects.toMatchObject({ code: 'XBOS-WF-400' });
  });

  it('XHRM-REC-WF-BE-TERMINAL-01: group_ceo escalation multi-member stamps any + dedupes casing', async () => {
    const data = createInMemoryResolverDataSource({
      managers: {},
      roleMembers: [
        { tenantId: 'xevn', roleCode: 'group_ceo', userId: 'Admin@xe.vn' },
        { tenantId: 'xevn', roleCode: 'group_ceo', userId: 'admin@xe.vn' },
        { tenantId: 'xevn', roleCode: 'group_ceo', userId: 'ceo@xe.vn' },
      ],
      activeUsers: new Set(['admin@xe.vn', 'ceo@xe.vn']),
    });
    const registry = new ResolverRegistry(data);
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'requisition_approval',
        resolver_type: 'direct_manager',
        resolver_config: { fallback_role_code: 'hrbp' },
      },
      {
        ...baseCtx,
        businessType: 'hrm_requisition',
        businessId: 'req-001',
        stepKey: 'requisition_approval',
        submitter: {
          userId: 'ceo@xe.vn',
          employeeId: 'emp-ceo',
          companyId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          companySlug: 'holding',
        },
      },
    );
    const ids = tasks.map((t) => t.assigneeUserId).sort();
    expect(ids).toEqual(['admin@xe.vn', 'ceo@xe.vn']);
    expect(tasks.every((t) => t.hatKey === 'group_ceo')).toBe(true);
    expect(tasks.every((t) => t.parallelPolicy === 'any')).toBe(true);
    const groupIds = new Set(tasks.map((t) => t.parallelGroupId));
    expect(groupIds.size).toBe(1);
    expect([...groupIds][0]).toBeTruthy();
  });

  it('XHRM-REC-WF-BE-TERMINAL-01: role_code multi-member → any-of-role (not all)', async () => {
    const data = createInMemoryResolverDataSource({
      roleMembers: [
        { tenantId: 'xevn', roleCode: 'group_ceo', userId: 'admin@xe.vn' },
        { tenantId: 'xevn', roleCode: 'group_ceo', userId: 'ceo@xe.vn' },
      ],
      activeUsers: new Set(['admin@xe.vn', 'ceo@xe.vn']),
    });
    const registry = new ResolverRegistry(data);
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'requisition_approval',
        resolver_type: 'role_code',
        resolver_config: { role_code: 'group_ceo' },
      },
      { ...baseCtx, stepKey: 'requisition_approval', businessType: 'hrm_requisition' },
    );
    expect(tasks).toHaveLength(2);
    expect(tasks.every((t) => t.parallelPolicy === 'any')).toBe(true);
    expect(new Set(tasks.map((t) => t.parallelGroupId)).size).toBe(1);
  });

  it('XHRM-REC-WF-BE-TERMINAL-01: parallel_group policy=all keeps all (must_keep F4)', async () => {
    const data = createInMemoryResolverDataSource({
      managers: { 'emp-nv-001': 'manager.a@xe.vn' },
      positionAssignments: [
        {
          tenantId: 'xevn',
          companyId: 'holding',
          positionCode: 'HCNS',
          userId: 'hcns@xe.vn',
          assignmentId: 'asg-hcns-01',
        },
      ],
      activeUsers: new Set(['manager.a@xe.vn', 'hcns@xe.vn']),
    });
    const registry = new ResolverRegistry(data);
    const tasks = await registry.resolveStepTasks(
      {
        stepKey: 'parallel_exec',
        resolver_type: 'parallel_group',
        resolver_config: {
          parallel_policy: 'all',
          resolver_types: ['direct_manager', 'position_template'],
          resolver_configs: [{}, { position_code: 'HCNS', company_id: 'main' }],
        },
      },
      { ...baseCtx, stepKey: 'parallel_exec' },
    );
    expect(tasks).toHaveLength(2);
    expect(tasks.every((t) => t.parallelPolicy === 'all')).toBe(true);
  });
});
