# P1-CC-DEPT-TPL-SCOPE-01 — Portal FE sync smoke (VPS :8088)

**work_item_id:** `P1-CC-DEPT-TPL-SCOPE-01-PORTAL-SYNC`  
**date:** 2026-06-06  
**owner:** devops  
**VPS:** `14.225.217.232` · portal `http://14.225.217.232:8088`

## Root cause

QA L2 FAIL: Vite returned HTTP **500** when resolving `CommandCenterPage.tsx` because two source files were absent on VPS (present locally, not in VPS git tree):

| File | VPS before | VPS after |
|------|------------|-----------|
| `apps/web/web-portal/src/components/org/OrgGradeOrgChartEditor.tsx` | MISSING | synced |
| `apps/web/web-portal/src/utils/orgGradeLayout.ts` | MISSING | synced |

Related dept-template / infra files (`deptSystemTemplatesApi.ts`, `useDeptSystemTemplates.ts`, `dept-system-foundation-catalog.ts`, `infrastructureApi.ts`, `CommandCenterPage.tsx`) were already on VPS.

## Actions executed

1. **Audit (SSH):** confirmed missing files; `xevn-portal-fe-dev` Up on `8088→5173`.
2. **PSCP sync** (PuTTY, `deploy/.vps-ssh.env`):
   - `OrgGradeOrgChartEditor.tsx` → `/opt/xevn-ecosystem/apps/web/web-portal/src/components/org/`
   - `orgGradeLayout.ts` → `/opt/xevn-ecosystem/apps/web/web-portal/src/utils/`
3. **Portal restart:** not required — Vite picked up new files; all checks passed without `docker compose` recreate.
4. **HTTP verify (VPS localhost):**
   - `GET /src/pages/command-center/CommandCenterPage.tsx` → **200**
   - `GET /command-center` → **200**
   - `GET /` → **200**
5. **External verify:** `GET http://14.225.217.232:8088/src/pages/command-center/CommandCenterPage.tsx` → **200**
6. **Browser smoke:** navigate `/command-center` — `#root` has children (`rootChildren=1`), no `vite-error-overlay`, Command Center rail visible (Task_Counter, module labels).
7. **API probe:**

```bash
PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs
```

**Exit code:** 0 · **VERDICT:** PASS (0 failed checks)

| Check | Result |
|-------|--------|
| login ceo@xe.vn | PASS HTTP 201 |
| GET dept-system-templates | PASS HTTP 200 partition=holding count=2 |
| PUT infrastructure/settings (array) | PASS HTTP 200 |
| GET infrastructure/settings | PASS |
| PUT customFieldDefsByEntity | PASS |
| GET customFieldDefs persisted | PASS defs=1 |

## Gate summary

| Gate | Result |
|------|--------|
| Missing import resolved (Vite 200) | PASS |
| Portal /command-center loads | PASS |
| Browser #root children | PASS |
| `tmp-p1-qa-u31-dept-infra-probe.mjs` | PASS exit 0 |
| portal-fe restart | SKIPPED (not needed) |

## Residual

- Files synced via PSCP only — **not** committed/pushed to `main`; next full `git pull` deploy should include these paths to avoid drift.
- Platform-audit probe reported `events=0 upsertSeen=false` (informational; not a probe failure).
- QA still owns **L2** matrix rows + **L2.5 J-*** journeys for Command Center dept-template UI.

## completion_report

Closed: PSCP of `OrgGradeOrgChartEditor.tsx` + `orgGradeLayout.ts` to VPS; Vite CommandCenterPage 200; browser Command Center smoke; dept/infra API probe exit 0.  
Open: QA L2/L2.5 UI verification on VPS; git merge so VPS does not rely on manual PSCP.

## next_owner

**qa**

## next_dispatch_prompt

```
work_item_id: P1-CC-DEPT-TPL-SCOPE-01-PORTAL-SYNC
from_role: devops
to_role: qa
entry_criteria: VPS portal :8088 — CommandCenterPage.tsx HTTP 200; tmp-p1-qa-u31-dept-infra-probe.mjs exit 0 (evidence docs/qa/evidence/p1-u31-portal-sync-smoke-20260606.md)
exit_criteria: L2 PILOT_BUSINESS_FLOW_MATRIX Command Center settings/dept-template rows PASS; L2.5 J-* cross-nav for org-grade/dept template scope; no Vite 500 on load; evidence docs/qa/evidence/p1-u31-qa-l2-dept-scope-20260606.md with ack_status PASS_TO_PM or FAIL with defect ids
evidence_path: docs/qa/evidence/p1-u31-portal-sync-smoke-20260606.md
account: ceo@xe.vn / Xevn@2026 · PORTAL http://14.225.217.232:8088/command-center
Run: PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs (confirm still exit 0) then manual L2.5 dept template + infra settings tabs.
ack_status: READY_FOR_QA
```

## evidence_path

`docs/qa/evidence/p1-u31-portal-sync-smoke-20260606.md`

## ack_status

**READY_FOR_QA**
