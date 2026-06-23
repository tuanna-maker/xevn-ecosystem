#!/usr/bin/env node
/**
 * P1 — Seed pending workflow step tasks for Member CEO (xe-du-lich).
 * Closes C-CRUDMAT-02: AC-CRUD-CC-WF-M-RD-01 / M-U-01 exercise.
 *
 * Usage:
 *   pnpm seed:workflow:member-inbox
 * Requires xbos-api on :28002 (XBOS_BE_PORT).
 */
import { loadDeployEnv, xbosBase, internalKey } from './seed-env-loader.mjs';

loadDeployEnv();

const TENANT = process.env.SEED_TENANT_ID ?? 'xe-du-lich';
const COMPANY = process.env.SEED_COMPANY_ID ?? 'main';
const ASSIGNEE = process.env.SEED_USER_ID ?? 'du-lich.ceo@xe.vn';

const MINIMAL_GRAPH = {
  applyingEntityId: TENANT,
  triggerEvent: 'seed.member.inbox',
  totalSlaHours: 48,
  steps: [
    {
      id: 'wf-step-1',
      order: 1,
      label: 'CEO công ty thành viên duyệt',
      handlerRoleId: 'member_ceo',
      slaHours: 24,
      action: 'approve',
      transitions: [
        { kind: 'approve', destinationId: 'wf-end-success' },
        { kind: 'reject', destinationId: 'wf-end-reject' },
      ],
    },
  ],
};

function memberHeaders(extra = {}) {
  return {
    'x-internal-api-key': internalKey(),
    'x-tenant-id': TENANT,
    'x-company-id': COMPANY,
    'x-user-id': ASSIGNEE,
    ...extra,
  };
}

async function apiJson(path, init = {}) {
  const url = `${xbosBase()}/api/xbos${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { ...init, headers: { ...memberHeaders(), ...(init.headers ?? {}) } });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}: ${JSON.stringify(json)?.slice(0, 300)}`);
  }
  return json;
}

async function ensureDefinition() {
  const list = await apiJson('/workflow-engine/definitions');
  const items = list?.data?.items ?? [];
  const existing = items.find((d) => d.workflow_code === 'WF-MEMBER-INBOX-DEMO') ?? items[0];
  if (existing?.id) {
    console.log(`Using definition: ${existing.id} (${existing.workflow_code ?? existing.name})`);
    return existing.id;
  }
  const created = await apiJson('/workflow-engine/definitions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowCode: 'WF-MEMBER-INBOX-DEMO',
      code: 'WF-MEMBER-INBOX-DEMO',
      name: 'Quy trình demo inbox CEO thành viên',
      category: 'general',
      scopeLevel: 'member',
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

async function seedInstance(definitionId) {
  const businessId = `seed-member-wf-${Date.now()}`;
  return apiJson('/workflow-engine/instances', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      definitionId,
      businessType: 'member_governance',
      businessId,
      context: { moduleHint: 'command-center', seeded: true, tenant: TENANT },
      steps: [
        {
          stepKey: 'member-ceo-approve',
          hatKey: 'member_ceo',
          assigneeUserId: ASSIGNEE,
          dueAt: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
    }),
  });
}

async function verifyPending() {
  const url = `${xbosBase()}/api/xbos/workflow-engine/tasks?tenantId=${encodeURIComponent(TENANT)}&status=pending&assigneeUserId=${encodeURIComponent(ASSIGNEE)}`;
  const res = await fetch(url, { headers: memberHeaders() });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`verify GET tasks → ${res.status}: ${JSON.stringify(json)?.slice(0, 300)}`);
  }
  return json;
}

async function main() {
  console.log(`XBOS ${xbosBase()} tenant=${TENANT} company=${COMPANY} assignee=${ASSIGNEE}`);
  const definitionId = await ensureDefinition();
  const instance = await seedInstance(definitionId);
  console.log(`Created instance: ${instance?.data?.id ?? '(unknown)'}`);

  const tasks = await verifyPending();
  const items = tasks?.data?.items ?? [];
  const count = items.length;
  console.log(`✓ Pending tasks for ${ASSIGNEE}: ${count} (code=${tasks?.code})`);
  if (count < 1) {
    console.error('✗ Expected >= 1 pending task');
    process.exit(1);
  }
  console.log(JSON.stringify({ taskId: items[0]?.id, instanceId: items[0]?.instance_id, businessType: items[0]?.business_type }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
