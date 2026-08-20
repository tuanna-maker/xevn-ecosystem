#!/usr/bin/env node
/**
 * Read-only probe: find pending tasks where submitter.userId === actor (ceo@xe.vn).
 * U65 — no mutate / no seed.
 */
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';

async function main() {
  const loginRes = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const login = await loginRes.json();
  let token =
    login?.data?.accessToken ||
    login?.data?.access_token ||
    login?.data?.token ||
    null;
  const memberships = login?.data?.memberships || [];
  if (!token && Array.isArray(memberships) && memberships.length) {
    const mid = memberships[0].id || memberships[0].membershipId;
    const sel = await fetch(`${XBOS}/api/xbos/auth/select-membership`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ membershipId: mid }),
    });
    const sj = await sel.json();
    token = sj?.data?.accessToken || sj?.data?.access_token || token;
  }
  console.log(
    JSON.stringify(
      {
        loginStatus: loginRes.status,
        code: login.code,
        hasToken: !!token,
        membershipCount: Array.isArray(memberships) ? memberships.length : 0,
      },
      null,
      2,
    ),
  );
  if (!token) {
    process.exit(2);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-company-id': 'main',
  };
  const tasksRes = await fetch(
    `${XBOS}/api/xbos/workflow-engine/tasks?status=pending&limit=80`,
    { headers },
  );
  const tasksJ = await tasksRes.json();
  const data = tasksJ?.data;
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.tasks)
        ? data.tasks
        : [];
  console.log('tasksStatus', tasksRes.status, tasksJ.code, 'count', arr.length);

  const actor = EMAIL.toLowerCase();
  const samples = [];
  const selfCandidates = [];

  for (const it of arr.slice(0, 40)) {
    const taskId = it.id || it.taskId;
    const instanceId = it.instance_id || it.instanceId;
    if (!instanceId) continue;
    const detRes = await fetch(
      `${XBOS}/api/xbos/workflow-engine/instances/${instanceId}/detail`,
      { headers },
    );
    const det = await detRes.json();
    const ctx = det?.data?.context || det?.data?.instance?.context || {};
    const sub = ctx.submitter || {};
    const subUid = String(sub.userId || sub.user_id || '').trim().toLowerCase();
    const assignee = String(
      it.assignee_user_id || it.assigneeUserId || '',
    )
      .trim()
      .toLowerCase();
    const row = {
      taskId,
      instanceId,
      detStatus: detRes.status,
      detCode: det.code,
      submitter: subUid || null,
      assignee: assignee || null,
      businessType:
        it.business_type ||
        it.businessType ||
        det?.data?.business_type ||
        det?.data?.businessType ||
        null,
      stepKey: it.step_key || it.stepKey || null,
    };
    if (samples.length < 6) samples.push(row);
    if (subUid && subUid === actor) selfCandidates.push(row);
  }

  console.log(
    JSON.stringify(
      {
        actor,
        sampleCount: samples.length,
        selfCandidateCount: selfCandidates.length,
        samples,
        selfCandidates: selfCandidates.slice(0, 10),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
