# P1-GAP-ACT-03-WF-REJECT-QA-R2 — Inbox Từ chối AlertDialog retest

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-GAP-ACT-03-WF-REJECT-QA-R2` |
| **role** | qa |
| **executed_at** | 2026-06-20T19:50+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` (session active) |
| **capability** | `ACT-CC-WF-REJECT` |
| **spec_ref** | `ACTION_BUTTON_INVENTORY.md` §2 · **AC-ACT-WF-REJ-01** · **AC-UX-CFM-01** · DEF-GAP-ACT-03-CFM |
| **prior_handoff** | `docs/qa/evidence/p1-gap-act-03-wf-reject-fe-20260620.md` (READY_FOR_QA) |
| **ack_status** | **FAIL_TO_PM** |

---

## Executive summary

**FAIL** — `:8088` still serves **pre-fix** bundle: drawer **Từ chối** fires **immediate** `POST …/reject` **201** with **zero** `[role=alertdialog]`, no **Hủy** step. Repo source **has** `promptRejectInboxFromDrawer` / `onRejectRequest` but VPS-served `CommandCenterPage.tsx` + `WorkflowTaskDetailDrawer.tsx` **lack** those symbols (deploy/sync gap).

| Metric | Target | Observed |
|--------|--------|----------|
| GAP-ACT-03 | 🟢 | 🔴 **FAIL** (AlertDialog) |
| P0 block | 20/20 🟢 | **19/20 🟢** (unchanged) |
| Hủy → no POST | PASS | 🔴 FAIL (POST before cancel possible) |
| Confirm → POST 201 + F5 | PASS | 🟡 mutate path 🟢 on stale build; confirm step absent |

---

## L0 stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | exit **0** — hrm-api 28001, xbos-api 28002, web-portal 5173 **200** |
| `:8088` HTTP | **200** |

---

## Deploy parity probe (root cause)

| Asset on `:8088` | Expected (post FE fix) | Observed |
|------------------|------------------------|----------|
| `/src/pages/command-center/CommandCenterPage.tsx` | `promptRejectInboxFromDrawer`, `Từ chối nhiệm vụ` | **NOT FOUND** |
| `/src/pages/command-center/WorkflowTaskDetailDrawer.tsx` | `onRejectRequest` | **NOT FOUND** |
| Served mode | production nginx static **or** synced vite | **Vite dev** (`/@vite/client`, `/src/main.tsx`) — **stale tree** |

**Conclusion:** `P1-GAP-ACT-03-WF-REJECT-FE` merged locally but **portal-fe :8088 not rebuilt/re-synced** (`portal-fe-docker-rebuild-required` residual).

---

## Browser test — UF ACT-CC-WF-REJECT (U65 · no seed)

**Click path:** CC home → inbox → **Mở chi tiết** pending task → drawer **Từ chối**

### Run A — instance `8eef2f4a-3380-47b4-942c-8c4c7baa07c2`

| Step | Expected | Observed | Verdict |
|------|----------|----------|---------|
| Click **Từ chối** | `[role=alertdialog]` «Từ chối nhiệm vụ» | `alertdialog=0`, `modalTitle=false`, `huyVisible=false` | 🔴 |
| Network before confirm | **No** POST | **POST** `/api/xbos/workflow-engine/tasks/b91e7296-e0f4-4675-806b-1ba3d470f0ec/reject` → **201** | 🔴 |
| Click **Hủy** | No POST; drawer open | N/A — no dialog rendered | 🔴 |

### Run B — instance `721f23df-b1b4-470a-801c-9eb9fb590298`

| Step | Expected | Observed | Verdict |
|------|----------|----------|---------|
| Inbox before | — | **113** pending |
| Click **Từ chối** | AlertDialog + **Hủy** | `alertdialog=0`; immediate **POST** `/api/xbos/workflow-engine/tasks/0a2a4e2b-ef6c-4837-a94c-d75bd5861248/reject` → **201** | 🔴 |
| FE after 2xx | Count ↓ / status **Từ chối** | Inbox **112** (113→112 after reject) | 🟢 mutate only |
| F5 persistence | Status **Từ chối** | *(drawer closed on reject — same as wave-1 QA)* | 🟢 mutate only |

### Verdict matrix

| Criterion | Verdict |
|-----------|---------|
| AC-UX-CFM-01 AlertDialog (not native) | 🔴 **FAIL** |
| AC-ACT-WF-REJ-01 POST reject distinct **201** | 🟢 **PASS** |
| Hủy cancels without POST | 🔴 **FAIL** |
| Confirm-then-POST flow | 🔴 **FAIL** (no confirm step) |

**J-***: J-XBOS-01 inbox drawer — L2.5 blocked on confirm UX (same class as wave-1).

---

## Defect

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **DEF-GAP-ACT-03-CFM-R2** | P0 | `:8088` serves stale portal-fe without AlertDialog wiring; immediate reject POST persists | **devops** + **dev-fe** |

---

## Residual / not promoted

| Item | Status |
|------|--------|
| GAP-ACT-03 AlertDialog | 🔴 open — deploy gap, not logic regression in repo |
| P0 block 20/20 | **19/20** — GAP-ACT-03 remains sole ⬜ |
| screen-action-catalog-map row ACT-CC-WF-REJECT | stays 🟡 PARTIAL until R3 on synced :8088 |

---

## Handoff

| Field | Value |
|-------|-------|
| **completion_report** | R2 browser retest **FAIL**: `:8088` missing FE fix in served sources; 2 spot rejects confirm immediate POST **201** without AlertDialog/Hủy. Mutate path 🟢. P0 **19/20**. |
| **next_owner** | **pm** → **devops** (rebuild/redeploy portal-fe :8088) → **qa** R3 |
| **next_dispatch_prompt** | `work_item_id: P1-GAP-ACT-03-WF-REJECT-DEPLOY-8088 — entry: repo has promptRejectInboxFromDrawer (CommandCenterPage.tsx L4109). exit: curl :8088/src/...CommandCenterPage.tsx contains onRejectRequest + Từ chối nhiệm vụ; docker compose rebuild portal-fe; qa R3 Hủy=no POST + confirm=201 F5. evidence: docs/qa/evidence/p1-gap-act-03-wf-reject-qa-r2-20260620.md` |
| **evidence_path** | `docs/qa/evidence/p1-gap-act-03-wf-reject-qa-r2-20260620.md` |
| **ack_status** | **FAIL_TO_PM** |
