# P1-USER-FLOW-WEB-QC-8088 — QC Go/No-Go sponsor nghiệm thu web :8088

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-USER-FLOW-WEB-QC-8088` |
| **from_role** | qc |
| **to_role** | pm |
| **portal** | http://14.225.217.232:8088 |
| **account** | `ceo@xe.vn` / `Xevn@2026` · `du-lich.ceo@xe.vn` (scope negative) |
| **executed_at** | 2026-06-20T09:15Z |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS (scoped)** — sponsor nghiệm thu web :8088 **APPROVED** |

---

## Executive summary

QC audited PM post-R3 verification chain for Dev8088 web user-flow acceptance. Independent L0 **PASS** reproduced. Probe artifacts confirm **23/23** web UF **🟢** (4-blocker **4/4**, close probe **8/8**) after UF-HRM-10 sync401 hot-fix and probe payload correction. `USER_FLOW_OPERABILITY_MATRIX.md` §3–§4 Dev8088 column: **no 🔴** for web in-scope rows (UF-HRM-07/08 ⚪ mobile N/A).

**Bounded scope:** Web user-flow mutate+verify on `:8088` via API/probe harness — **NOT** full Phase 1 DONE, **NOT** full L2.5 browser J-* click-path on :8088.

---

## Evidence pack gate (Layer B)

| Check | Result |
|-------|--------|
| QA evidence path | `docs/qa/evidence/p1-web-acceptance-close-01-r3-20260620.md` |
| `pnpm run verify:qc:evidence-pack -- --evidence <path>` | **exit 0** (8/8) — QC 2026-06-20 |
| PM supplementary probes (post-R3.1) | `p1-deploy-8088-fe-probe-20260620.json` 4/4 · `p1-web-acceptance-close-20260620-probe.json` 8/8 |

---

## L0 stack (QC independent spot-check)

```text
PORTAL_DEV_URL=http://14.225.217.232:8088
HRM_HEALTH_URL=http://14.225.217.232:8088/api/hrm
XBOS_HEALTH_URL=http://14.225.217.232:8088/api/xbos
pnpm run qc:dev-stack → exit 0
```

| Service | HTTP | Result |
|---------|------|--------|
| Portal `/` | 200 | PASS |
| HRM proxy `/api/hrm` | 200 | PASS |
| XBOS proxy `/api/xbos` | 200 | PASS |

Prior L0 PASS also recorded: `docs/ops/evidence/p1-deploy-8088-web-uat-20260620.md` §R3.

---

## Matrix audit — Dev8088 web UF (23 rows)

Source: `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §3–§4 (updated 2026-06-20 post-R3.1).

| Scope | Count | Cờ |
|-------|-------|-----|
| XBOS UF-XBOS-01..15 | 15 | **15/15 🟢** |
| HRM web UF-HRM-01..06, 09..13 | 10 | **10/10 🟢** |
| Mobile UF-HRM-07, 08 | 2 | **⚪ N/A** (out of web nghiệm thu) |
| **Web in-scope total** | **23** | **23/23 🟢** — **no 🔴** |

### Post-R3.1 delta (UF-HRM-10 closure)

| UF-ID | R3 QA (prior) | Post-fix probe | Classification |
|-------|---------------|----------------|----------------|
| UF-HRM-10 | 🔴 502 sync / XBOS 401 | **🟢** sync **201** + items **201** `HRM-SET-201` | **PRODUCT** — `D-UF-WEB-HRM-10-01` **CLOSED** (`catalog-sync.service.ts` JWT forward + PM hot-sync) |
| UF-XBOS-05 | 🟢 API UUID | 🟢 4-blocker POST **201** `XBOS-SHR-201` | **PRODUCT** — `D-UF-WEB-XBOS-05-R1` CLOSED |
| UF-XBOS-14 | 🟢 | 🟢 PUT 200 → GET found | CLOSED |
| UF-HRM-11 | 🟢 | 🟢 submit 201 → approve 201 | CLOSED |

Probe JSON authority (executed 2026-06-20T01:38–01:39Z):

- `docs/ops/evidence/p1-deploy-8088-fe-probe-20260620.json` — summary `4/4 pass`
- `docs/qa/evidence/p1-web-acceptance-close-20260620-probe.json` — summary `8/8 pass`

Root-cause note (PM bus): probe scripts had wrong POST field names (`catalog_key` vs `category_key`) — corrected in `scripts/tmp-p1-web-acceptance-*-8088.mjs` before final 4/4 + 8/8.

---

## Classification (ENV vs PRODUCT)

| Item | Class | Blocks nghiệm thu 23 UF? |
|------|-------|---------------------------|
| UF-HRM-10 sync 401/502 (pre-fix) | **PRODUCT** | Was blocking — **CLOSED** post sync401 |
| CC `/command-center` Vite missing `command-center-rail-catalog.ts` | **ENV/deploy** | **No** for API mutate acceptance; **Yes** for live browser click-demo UF-XBOS-05 |
| Probe script field-name drift | **PROCESS/QA harness** | **No** — corrected before final probes |
| UF-HRM-07/08 mobile | **OUT OF SCOPE** | N/A web wave |

---

## L2.5 journey coverage (U19 audit)

| Journey | :8088 browser evidence | Probe/API mapping | QC note |
|---------|-------------------------|-------------------|---------|
| J-CC-01 | L0 login 201 (R3) | UF-XBOS-01 🟢 | PASS indirect |
| J-CC-02 | L2 browser **GWC** (rail-catalog) | UF-XBOS-02/05 API 🟢 | API PASS; browser click deferred |
| J-CC-03 | KPI rollup probe | UF-XBOS-10 🟢 | PASS |
| J-HRM-01..07 | Prior nip.io/localhost L2.5 ✅ | UF-HRM-01..06 🟢 on :8088 | **GWC** — full browser L2.5 on :8088 not re-run post-R3.1 |

**L2.5 on :8088:** Not fully re-validated in browser after R3 portal rebuild. API mutate probes cover UF business contracts. **Condition carry** — not a NO-GO for bounded 23 UF API nghiệm thu per sponsor matrix rule (mutate + verify via Network 2xx).

---

## Defect register (QC view)

| ID | UF | Sev | Status | QC |
|----|-----|-----|--------|-----|
| D-UF-WEB-XBOS-05-R1 | UF-XBOS-05 | P0 | **CLOSED** | ✅ |
| D-UF-WEB-XBOS-14-01 | UF-XBOS-14 | P0 | **CLOSED** | ✅ |
| D-UF-WEB-HRM-10-01 | UF-HRM-10 | P0 | **CLOSED** | ✅ post sync401 + re-probe |
| D-UF-WEB-HRM-11-01 | UF-HRM-11 | P0 | **CLOSED** | ✅ |
| D-DEPLOY-8088-RAIL-CATALOG | CC shell | P1 | **OPEN** | ENV carry — devops |

---

## QC verdict

### **GO WITH CONDITIONS (scoped)**

**Approved for sponsor nghiệm thu web** on http://14.225.217.232:8088 — **23/23** web user-flow rows **🟢** (mutate + verify via probe/API; matrix §3–§4 no 🔴).

#### Conditions (bounded — do not claim Phase 1 DONE)

| # | Condition | Owner | Expiry trigger |
|---|-----------|-------|----------------|
| C1 | pscp `command-center-rail-catalog.ts` + portal-fe recreate — CC browser loads without Vite overlay | **devops** | Before live click-demo UF-XBOS-05 holding |
| C2 | QA L2.5 browser J-CC-02 / J-HRM-* click-path on :8088 after C1 | **qa** | Before claiming full L2.5 :8088 |
| C3 | Push acceptance commits to `origin/main` — eliminate pscp drift | **dev-be** + **devops** | Before PROD cutover |
| C4 | Mobile UF-HRM-07/08 — separate wave | **dev-mobile** + **qa** | Out of this gate |

**Explicitly NOT promoted:** Phase 1 DONE · PROD-READY · full program QC S5 GO.

#### What sponsor may accept now

- All **23 web UF** operational on Dev8088 at **API/user-mutate** level (login, org, HRM CRUD paths, catalog sync, metadata queue, recruitment, member scope).
- Demo with API-backed flows or HRM embed tabs that do not require broken CC Vite shell.
- Holding shareholder (UF-XBOS-05) validated via UUID POST 201 — same contract FE must use after rail-catalog deploy.

#### What would trigger NO-GO on re-gate

- Any web UF row returns to 🔴 on :8088
- L0 stack down after `qc:dev-stack` retry
- UF-HRM-10 sync regression (502/401)

---

## Commands (QC audit trail)

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `qc:dev-stack` (env :8088) | **0** | L0 PASS — QC independent |
| 2 | `verify:qc:evidence-pack` on R3 QA MD | **0** | 8/8 pack |
| 3 | Audit `p1-deploy-8088-fe-probe-20260620.json` | — | 4/4 |
| 4 | Audit `p1-web-acceptance-close-20260620-probe.json` | — | 8/8 |
| 5 | Cross-check `USER_FLOW_OPERABILITY_MATRIX.md` | — | 23/23 🟢, no 🔴 web |

---

## Residual

| Item | Owner | Severity |
|------|-------|----------|
| CC rail-catalog browser L2 | devops | P1 ENV |
| L2.5 browser :8088 | qa | P2 process |
| git push / deploy parity | devops | P2 |
| Phase 1 program gates | pm/qc | program |

---

## Handoff

- **completion_report:** QC gate `P1-USER-FLOW-WEB-QC-8088` — **GO WITH CONDITIONS (scoped)** for sponsor nghiệm thu web on :8088. L0 PASS (QC reproduced). Matrix 23/23 web UF 🟢, no 🔴. Probes 4/4 + 8/8 PASS including UF-HRM-10 post sync401. Evidence pack verify 8/8 on R3 QA file. Carry: rail-catalog browser deploy (C1), L2.5 browser :8088 (C2). **NOT Phase 1 DONE.**
- **next_owner:** `pm`
- **evidence_path:** `docs/qa/evidence/p1-user-flow-web-qc-8088-20260620.md`
- **ack_status:** **PASS_TO_PM**

### next_dispatch_prompt (copy-ready — devops rail-catalog)

```
Role: devops
work_item_id: P1-DEPLOY-8088-RAIL-CATALOG-01
from_role: pm
to_role: devops
priority: P1
entry_criteria: QC GWC P1-USER-FLOW-WEB-QC-8088 — sponsor nghiệm thu web 23/23 APPROVED with condition C1; CC /command-center Vite error missing command-center-rail-catalog.ts on VPS :8088; evidence docs/qa/evidence/p1-user-flow-web-qc-8088-20260620.md §Conditions C1 + docs/qa/evidence/p1-web-acceptance-close-01-r3-20260620.md § L2 browser
exit_criteria: pscp apps/web/web-portal/src/data/command-center-rail-catalog.ts + portal-fe recreate; browser http://14.225.217.232:8088/command-center loads without Vite overlay; ack_status READY_FOR_QA
evidence_path: docs/ops/evidence/p1-deploy-8088-rail-catalog-20260620.md
ack_status: READY_FOR_QA
pm_dispatch_hint: After C1 — qa L2.5 browser UF-XBOS-05 holding click-path on :8088
```

### next_dispatch_prompt (copy-ready — sponsor status update)

```
Role: pm
work_item_id: P1-USER-FLOW-WEB-SPONSOR-STATUS-8088
from_role: qc
to_role: pm
priority: P0
entry_criteria: QC PASS_TO_PM GO WITH CONDITIONS scoped — 23/23 web UF :8088; evidence docs/qa/evidence/p1-user-flow-web-qc-8088-20260620.md
exit_criteria: Update USER_SERVICE_STATUS.md / PROJECT_STATUS_REPORT.md — Dev8088 web nghiệm thu GO (scoped); list conditions C1–C4; do NOT claim Phase 1 DONE or PROD-READY
evidence_path: docs/program/PROJECT_STATUS_REPORT.md
ack_status: PASS_TO_PM
```
