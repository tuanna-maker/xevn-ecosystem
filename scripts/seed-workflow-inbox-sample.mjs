#!/usr/bin/env node
/**
 * P1 — Seed workflow definitions + instances with pending step tasks for Command Center inbox.
 * Requires xbos-api running. Usage: pnpm seed:workflow:inbox
 */
import { loadDeployEnv, xbosBase, xbosHeaders } from './seed-env-loader.mjs';

loadDeployEnv();

const TENANT = process.env.MASTER_TENANT_ID ?? 'xevn';
const ASSIGNEE = process.env.SEED_USER_ID ?? 'admin@xe.vn';

const MINIMAL_GRAPH = {
  applyingEntityId: TENANT,
  triggerEvent: 'seed.inbox.demo',
  totalSlaHours: 48,
  steps: [
    {
      id: 'wf-step-1',
      order: 1,
      label: 'Trưởng bộ phận duyệt',
      handlerRoleId: 'dept_head',
      slaHours: 24,
      action: 'approve',
      transitions: [
        { kind: 'approve', destinationId: 'wf-end-success' },
        { kind: 'reject', destinationId: 'wf-end-reject' },
        { kind: 'exception', destinationId: 'wf-bod-special' },
      ],
    },
    {
      id: 'wf-step-2',
      order: 2,
      label: 'HR BP xác nhận',
      handlerRoleId: 'hr_bp',
      slaHours: 24,
      action: 'sign',
      transitions: [
        { kind: 'approve', destinationId: 'wf-end-success' },
        { kind: 'reject', destinationId: 'wf-end-reject' },
        { kind: 'exception', destinationId: 'wf-bod-special' },
      ],
    },
  ],
};

const INSTANCE_SPECS = [
  { businessType: 'hrm_payroll', businessId: 'seed-payroll-001', moduleHint: 'hrm' },
  { businessType: 'catalog_governance', businessId: 'seed-catalog-002', moduleHint: 'x-bos' },
  { businessType: 'general', businessId: 'seed-general-003', moduleHint: 'business' },
  { businessType: 'hrm_recruitment', businessId: 'seed-recruit-004', moduleHint: 'hrm' },
  { businessType: 'finance_expense', businessId: 'seed-finance-005', moduleHint: 'finance' },
  { businessType: 'fleet_ops', businessId: 'seed-fleet-006', moduleHint: 'fleet' },
];

async function apiJson(path, init = {}) {
  const url = `${xbosBase()}/api/xbos${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { ...init, headers: { ...xbosHeaders(), ...(init.headers ?? {}) } });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${JSON.stringify(json)?.slice(0, 200)}`);
  }
  return json;
}

async function ensureDefinition() {
  const list = await apiJson('/workflow-engine/definitions');
  const items = list?.data?.items ?? [];
  if (items.length > 0) {
    console.log(`Using existing definition: ${items[0].id}`);
    return items[0].id;
  }
  const created = await apiJson('/workflow-engine/definitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowCode: 'WF-INBOX-DEMO',
      code: 'WF-INBOX-DEMO',
      name: 'Quy trình demo inbox Command Center',
      category: 'general',
      scopeLevel: 'group',
      graph: MINIMAL_GRAPH,
      conditions: {},
      status: 'active',
    }),
  });
  const id = created?.data?.id;
  if (!id) throw new Error('Definition create returned no id');
  console.log(`Created definition: ${id}`);
  return id;
}

async function seedInstances(definitionId) {
  let created = 0;
  for (const spec of INSTANCE_SPECS) {
    await apiJson('/workflow-engine/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        definitionId,
        businessType: spec.businessType,
        businessId: spec.businessId,
        context: { moduleHint: spec.moduleHint, seeded: true },
        steps: [
          {
            stepKey: 'approve-dept',
            hatKey: 'dept_head',
            assigneeUserId: ASSIGNEE,
            dueAt: new Date(Date.now() + 86400000).toISOString(),
          },
          {
            stepKey: 'hr-confirm',
            hatKey: 'hr_bp',
            assigneeUserId: ASSIGNEE,
            dueAt: new Date(Date.now() + 172800000).toISOString(),
          },
        ],
      }),
    });
    created += 1;
  }
  return created;
}

async function main() {
  console.log(`XBOS ${xbosBase()} tenant=${TENANT} assignee=${ASSIGNEE}`);
  const definitionId = await ensureDefinition();
  const n = await seedInstances(definitionId);
  const tasks = await apiJson(`/workflow-engine/tasks?tenantId=${encodeURIComponent(TENANT)}&status=pending`);
  const count = tasks?.data?.items?.length ?? 0;
  console.log(`✓ Seeded ${n} instances; pending tasks: ${count}`);
  if (count < 3) {
    console.warn('⚠ Expected >= 3 pending tasks for inbox rail');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
