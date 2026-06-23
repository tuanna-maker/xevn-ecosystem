# P1-CC-DEPT-TPL-SCOPE-01 — U31 persona retest (dept templates + infra settings)

**Date:** 2026-06-06  
**work_item_id:** P1-CC-DEPT-TPL-SCOPE-01 (+ infra settings false-PASS follow-up)  
**QA:** qa-lead  
**Account:** `ceo@xe.vn` / `Xevn@2026`  
**Authoritative SoT:** `http://14.225.217.232:8088`  
**Local fallback:** `http://localhost:5173` → xbos-api `:28002` (source tree, started for parity)

## Executive verdict

| Environment | Overall | Notes |
|-------------|---------|-------|
| **VPS :8088 (SoT)** | **FAIL** | Stale xbos-api: dept merge fix + infra DTO fix **not deployed**; CC SPA blank after login |
| **Local :5173 + :28002** | **PASS** | Source fixes verified via CEO JWT probe + L2 UI spot |

**ack_status:** `PASS_TO_PM` — defects block QC; **not** `READY_FOR_QC` on :8088.

---

## Environment traceability

| Check | VPS :8088 | Local |
|-------|-----------|-------|
| Portal HTTP | 200 `/` | 200 `/` (:5173) |
| Login API `POST /api/xbos/auth/login` | 201 + JWT | 201 + JWT |
| CC SPA mount (`#root` children) | **0** (blank white page) | **>0** (full CC shell) |
| xbos-api build | Stale (see API probes) | Fresh `pnpm start:dev` from workspace |

**Deploy gap (PM / DevOps):** Redeploy **xbos-api** + **web-portal** container on VPS with commits containing:
- `BusinessMasterService` legacy partition merge for `dept_system_templates`
- `infrastructure` DTO `@IsArray()` for `foundationCategories` / `sites`
- Portal bundle including `workflowEngineApi` export fix (CC currently blank — see D-8088-CC-IMPORT-01)

Probe script (reproducible): `scripts/tmp-p1-qa-u31-dept-infra-probe.mjs`

```bash
# VPS (FAIL at time of test)
PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs

# Local source (PASS)
PORTAL_DEV_URL=http://localhost:5173 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs
```

---

## TC1 — Dept system templates scope (`Danh mục khung`)

### Click path (L2)

| Step | VPS :8088 | Local :5173 |
|------|-----------|-------------|
| Login | Form login OK after `browser_fill` password; URL → `/command-center` | Session reused (already logged in) |
| Navigate | **Blocked** — `#root` empty, no settings rail | `GET /command-center?settings=company_dept_system` |
| Settings → Phòng/Ban | N/A | Sidebar **Hệ thống Phòng/Ban** selected |
| Tab **Danh mục khung** | N/A | Tab selected (default) |
| Table rows | N/A | Footer: **「Nguồn dữ liệu: DB (business-master) · 2 khung」**; 2× Chi tiết/Xóa action pairs |

### API probe (CEO JWT — required per process lesson)

`GET /api/xbos/business-master/dept_system_templates/items`  
Headers: `Authorization: Bearer <ceo JWT>`, `x-tenant-id: xevn`, `x-company-id: main`

| Env | HTTP | Partition | Item count | Sample items |
|-----|------|-----------|------------|--------------|
| **VPS :8088** | 200 | holding | **0** | `[]` |
| **Local :5173** | 200 | holding | **2** | `q@main`, `PB-ORG-XEVN-01@xevn` |

VPS browser fetch (same JWT in `localStorage`): `{ count: 0, items: [] }` — confirms empty table if UI were reachable.

### TC1 verdict

| Env | Verdict | Reason |
|-----|---------|--------|
| VPS :8088 | **FAIL** | API 200 but **0 templates** — scope merge fix not on deployed API |
| Local | **PASS** | ≥1 row (2) with expected legacy partition merge |

---

## TC2 — Infrastructure settings save (array payload)

### Click path (L2)

| Step | VPS :8088 | Local :5173 |
|------|-----------|-------------|
| Navigate | Blocked (blank CC) | `/command-center?settings=company_infrastructure` |
| Section | N/A | **Hạ tầng cơ sở** → tab **1. Danh mục nền & phạm vi** loads |

### Payload tested (matches FE real flow)

```json
{
  "foundationCategories": [
    {
      "id": "fcat-qa-u31",
      "code": "QA-U31",
      "nameVi": "QA U31 probe category",
      "description": "retest array payload",
      "appliesToCompanyIds": ["main"]
    }
  ],
  "sites": [],
  "blockTitleOverridesByEntity": {},
  "customBlocksByEntity": {},
  "customFieldDefsByEntity": {}
}
```

`PUT /api/xbos/infrastructure/settings`

| Env | HTTP | Code | Message |
|-----|------|------|---------|
| **VPS :8088** (probe) | **400** | XBOS-VAL-001 | `foundationCategories must be an object; sites must be an object` |
| **VPS :8088** (browser fetch) | **400** | XBOS-VAL-001 | Same ValidationPipe rejection |
| **Local :5173** (probe) | **200** | XBOS-INFRA-201 | `Infrastructure settings saved` |

Follow-up `GET /api/xbos/infrastructure/settings`: local returns `foundationCategories count=1` after PUT.

**Note:** Prior false-PASS root cause confirmed on VPS — old `@IsObject()` DTO still live. Local source has `@IsArray()` fix.

### TC2 verdict

| Env | Verdict |
|-----|---------|
| VPS :8088 | **FAIL** |
| Local | **PASS** |

---

## TC3 — Infra custom fields UX

| Env | Verdict | Evidence |
|-----|---------|----------|
| VPS :8088 | **FAIL** | CC UI unreachable; PUT with `customFieldDefsByEntity` returns 400 (same DTO bug); GET `defs=0` |
| Local API | **PASS** | PUT custom field def → GET `customFieldDefsByEntity.main` **defs=1** (`cfd-qa-u31`) |
| Local UI modal | **GWC** | **Chi tiết & cấu hình** click intercepted by overlay in MCP automation; API persist verified |

---

## Console / network notes

- VPS `/command-center`: `document.getElementById('root').children.length === 0` after 3s — React app did not mount (aligns with prior **D-8088-CC-IMPORT-01** missing export on deployed portal bundle).
- No **409** `companyId mismatches token scope` on dept-templates GET (VPS returns 200 with empty items, not scope error).
- No **500** on probed endpoints.
- Platform audit on VPS: `GET .../platform-audit/events` → 200, **0 events** (no successful infra upsert on VPS).

---

## Defects opened / confirmed

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **D-U31-DEPLOY-01** | P0 | VPS :8088 xbos-api missing dept partition merge + infra array DTO fix | devops |
| **D-U31-DEPT-EMPTY-01** | P0 | `dept_system_templates` holding partition empty on VPS (200 + 0 items) | devops → dev-be if persists post-deploy |
| **D-U31-INFRA-400-01** | P0 | Infra PUT still ValidationPipe 400 on array payload | devops |
| **D-8088-CC-IMPORT-01** | P0 | CC SPA blank on :8088 — blocks all L2 settings UI | devops (portal redeploy) |

---

## completion_report

**Closed (local source parity):**
- CEO JWT probe confirms dev-be fixes work when xbos-api runs from current workspace: dept templates **2 rows**, infra array PUT **200/XBOS-INFRA-201**, custom fields persist.
- L2 UI on local: **Danh mục khung** shows **2 khung** with DB source label.

**Not closed (authoritative SoT :8088):**
- All three user-facing cases **FAIL** on VPS — deploy sync gap, not regression in source.
- L2 browser retest on :8088 **blocked** by blank Command Center SPA.
- QC gate **cannot** proceed on :8088 until DevOps redeploy + QA re-run this evidence template.

---

## next_owner

**devops** — redeploy xbos-api + web-portal on `14.225.217.232:8088`; then **qa** re-run U31.

---

## next_dispatch_prompt

```
work_item_id: P1-CC-DEPT-TPL-SCOPE-01-DEPLOY
from_role: pm
to_role: devops
entry_criteria: QA evidence docs/qa/evidence/p1-qa-u31-dept-infra-retest-20260606.md — VPS :8088 FAIL (dept 0 items, infra PUT 400, CC blank SPA)
exit_criteria: Redeploy xbos-api + portal on :8088 from branch containing dept_system_templates merge + infrastructure @IsArray DTO + workflowEngineApi export; `docker ps` portal Up; smoke: PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs exit 0; browser #root children > 0 at /command-center
evidence_path: docs/qa/evidence/p1-u31-deploy-smoke-20260606.md
ack_status: READY_FOR_QA
After deploy: dispatch QA to re-run p1-qa-u31-dept-infra-retest on :8088 only; if PASS → QC spot-check scope parity checklist.
```

---

## evidence_path

`docs/qa/evidence/p1-qa-u31-dept-infra-retest-20260606.md`

**ack_status:** `PASS_TO_PM`
