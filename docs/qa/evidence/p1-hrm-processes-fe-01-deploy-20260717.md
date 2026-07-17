# P1-HRM-PROCESSES-FE-01-DEPLOY — DevOps deploy evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-PROCESSES-FE-01-DEPLOY` |
| **date** | 2026-07-17 |
| **owner** | devops |
| **target** | `http://14.225.217.232:8088` |
| **U65** | zero-seed — **no** `pnpm seed:*` / inbox seed / DB fake |
| **ack_status** | **READY_FOR_QA** |

---

## Commits deployed

| SHA | Message |
|-----|---------|
| `8967262` | fix(hrm): Processes menu honest read-only for :8088 QA (`P1-HRM-PROCESSES-FE-01`) |

**VPS HEAD:** `8967262` (`git pull origin main` fast-forward from `a3ea8eb`).

### Allow-list (committed + pushed)

- `apps/web/hrm/src/pages/Processes.tsx`
- `apps/web/hrm/src/hooks/useProcesses.ts`
- `apps/web/hrm/src/hooks/useProcesses.test.ts`
- `apps/web/hrm/src/pages/Processes.readOnly.test.ts`
- `docs/qa/evidence/p1-hrm-processes-fe-01-20260717.md`
- `docs/qa/evidence/p1-hrm-processes-ba-01-20260717.md`

Unrelated dirty lanes (xbos auth, leave-workflow, portal auth session, rate-limit docs, …) **not** scooped.

---

## Commands (VPS)

```bash
cd /opt/xevn-ecosystem
git stash -u || true
git fetch origin main
git pull origin main   # → 8967262
node scripts/merge-vps-port-env.mjs --apply-canonical

cd deploy/xevn-ecosystem
docker compose --env-file .env up -d --build --no-deps --force-recreate \
  portal-fe hrm-fe
```

### Services recreated

| Container | StartedAt (UTC) | Status | Ports |
|-----------|-----------------|--------|-------|
| `xevn-portal-fe-dev` | `2026-07-17T03:17:09.310Z` | running | `8088→5173` |
| `xevn-hrm-fe-dev` | `2026-07-17T03:17:09.081Z` | running | `8080→8080` |

Non-xevn left running (ytexa_*, hsbx_*, …). **No** `docker compose down`.

---

## Smoke results

| Check | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/` | **200** |
| `GET http://14.225.217.232:8088/command-center` | **200** |
| `GET http://14.225.217.232:8088/command-center/hrm/processes` | **200** |
| `GET http://127.0.0.1:8080/` | **302** (SPA redirect — OK) |
| Seed used | **none** |

### Bind-mount source proof (VPS HEAD `8967262`)

| Marker | Result |
|--------|--------|
| `DialogTitle` present on view dialog | **PASS** (line ~244) |
| `toast.success` count | **0** |
| `Thêm quy trình` count | **0** |
| CODE-MEMORY read-only / no fake stubs | present in file header |
| `useProcesses.ts` mutate/create/update/delete helpers | **absent** (only `created_*` / `updated_at` field names) |

---

## Residual / QA scope

DevOps L0 only — browser AC still **qa**:

| AC | Expect |
|----|--------|
| AC-PROC-01 | No **Thêm** CTA on Processes |
| AC-PROC-02 | No **Sửa** / **Xóa** mutate actions |
| AC-PROC-03 | No success toast on stub actions |
| AC-PROC-04 | Empty state «chưa hỗ trợ» OK; no `DialogTitle` console a11y warn |

Persona: `ceo@xe.vn` / `Xevn@2026` · URL: `http://14.225.217.232:8088/command-center/hrm/processes` · U65 browser-only.

---

## Handoff

- `completion_report`: Allow-list `8967262` live on `:8088`; `portal-fe` + `hrm-fe` recreated `--no-deps`; smoke `/` + `/command-center/hrm/processes` **200**; source proof no fake Thêm/toast.success; U65 no seed. Browser AC-PROC-01..04 still QA.
- `next_owner`: **qa**
- `ack_status`: **READY_FOR_QA**
- `evidence_path`: `docs/qa/evidence/p1-hrm-processes-fe-01-deploy-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-PROCESSES-FE-01-QA
from_role: pm
to_role: qa

entry_criteria:
- VPS HEAD 8967262; portal-fe+hrm-fe recreated (evidence p1-hrm-processes-fe-01-deploy-20260717.md)
- L0 smoke :8088/ and /command-center/hrm/processes = 200
- U65 zero-seed; browser-only

exit_criteria:
- AC-PROC-01..04 PASS on http://14.225.217.232:8088/command-center/hrm/processes
  (ceo@xe.vn): no Thêm/Sửa/Xóa; no success toast; empty «chưa hỗ trợ» OK; no DialogTitle console warn
- Evidence with click path + Network + screenshot; matrix update if applicable
- ack_status PASS_TO_PM or FAIL_TO_PM with defect id

cấm: pnpm seed:* · API/DB fake · PASS chỉ curl

evidence_path: docs/qa/evidence/p1-hrm-processes-fe-01-qa-20260717.md
```
