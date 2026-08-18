# P1-HRM-CONSOLE-AUDIT-QA — React console / Network classification (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-CONSOLE-AUDIT-QA` |
| **date** | 2026-07-16 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **click path** | Login → Command Center → HRM → Nhân sự (`/command-center/hrm/employees`) |
| **U65** | zero-seed · browser-only (no seed; API probe read-only for id cardinality) |
| **ack_status** | **FAIL** (P0 duplicate-key still live; Dev BE/FE not READY_FOR_QA) |

---

## Verdict

**FAIL** — Do **not** promote to QC / PASS_TO_PM for console hygiene.

| Gate | Result |
|------|--------|
| Duplicate React key on Employees DataTable | **Y — still present (P0)** |
| Dev `P1-HRM-EMP-DUP-KEY-BE` / `P1-HRM-EMP-DUP-KEY-FE` READY | **N** — bus only `DISPATCHED` 2026-07-16T23:05; no evidence files |
| GET `/api/hrm/employees` mount | **12** (page 1..12 ×1 each) — pagination fan-out |
| CC parent duplicate mount APIs | **Y** — ×2 pattern (P1 residual CD-FB-03) |

---

## Classification matrix (required)

| Signal | Verdict | Evidence |
|--------|---------|----------|
| Download React DevTools | **NOISE — ignore** | Vite DEV iframe (`/hr/@vite/client`); sponsor paste noise; not a product defect |
| i18next Locize ads | **NOISE — ignore** | Sponsor paste noise; not product defect |
| Duplicate React key on Employees DataTable | **P0 DEFECT — FAIL** | Fiber keys + list API id cardinality (below) |
| Duplicate API calls (tenant-scope, kpi rollup, workflow tasks ×2) | **P1 residual** of CD-FB-03 / `P1-HRM-PERF-*` | Parent Performance resource timing |

---

## Environment / session

- Portal URL final: `http://14.225.217.232:8088/command-center/hrm/employees`
- HRM iframe: `http://14.225.217.232:8088/hr/employees?portal=1&tenantId=xevn&companyId=main&…`
- UI title: «Danh sách nhân viên trong công ty - **1107**»
- Build: Vite **DEV** (`/hr/src/main.tsx`) — React key collisions observable via fiber

---

## P0 — Duplicate React key (Employees)

### Console duplicate-key still present?

| Question | Answer |
|----------|--------|
| **Duplicate-key still present?** | **Y** |
| Console string capture via injected hooks | Incomplete in automation (0 msgs buffered) — **not relied on for PASS** |
| Deterministic DOM/fiber + API proof | **PASS as defect confirmed** |

### Fiber / DOM (iframe DataTable)

After full list render (`tbody tr`):

| Metric | Value |
|--------|-------|
| Rendered rows | **1107** |
| Unique React `key` (employee UUID) | **996** |
| IDs with key used >1× | **107** |
| Extra duplicate rows | **111** |
| Max repeats for one id | **3** |
| Sample UUID | `221f23fe-aa70-429e-8006-50918284689e` (×2) |

Sample duplicate fiber keys (UUID → count):

| key (employee id) | count |
|-------------------|-------|
| `221f23fe-aa70-429e-8006-50918284689e` | 2 |
| `196ac746-da5b-4095-8cb9-f8f9214c66fd` | 2 |
| `81edd776-f4f7-4f8d-8b05-fcdff883d669` | 3 |
| `0277f545-961e-4701-8ca3-8de9a096971d` | 3 |
| `327123bc-7ddf-4b23-86d7-52d618a6e284` | 3 |

**Implication:** `keyExtractor = emp.id` + list containing the same id multiple times → React «Encountered two children with the same key» (sponsor paste). **FAIL until BE list dedupe/rollup fix + FE defensive dedupe.**

### List API cardinality (read-only probe, same session token)

`GET /api/hrm/employees?company_id=main&include_archived=true&page_size=100&page=N` → `200` `HRM-EMP-200`

| Metric | Value |
|--------|-------|
| Pages | 12 (100×11 + 9) |
| Rows fetched | **1109** |
| Unique `id` | **998** |
| Ids appearing >1× across pages | **107** |

Aligns with fiber collision set — root cause is **duplicate employee rows in group-CEO rollup list**, not only FE key hygiene.

### Linked work items (open)

- `P1-HRM-EMP-DUP-KEY-BE` — list must not return same UUID twice under `company_id=main` rollup
- `P1-HRM-EMP-DUP-KEY-FE` — dedupe-by-id after merge; no console duplicate-key on Employees

---

## Network — GET `/employees`

| Observation | Count |
|-------------|-------|
| `GET /api/hrm/employees?…&page=1..12` (iframe, one mount) | **12** |
| Same page fetched twice? | **N** (each page exactly once) |

```
fetchesByPage: { "1":1, "2":1, …, "12":1 }
```

**Note:** 12 sequential page fetches = **P1 perf residual** (`P1-HRM-PERF-BE-01` summary/cursor + FE gates) per `docs/qa/evidence/cd-fb-03-hrm-perf-audit-20260620.md` — distinct from P0 duplicate-key, still not closed on live `:8088`.

---

## P1 — Duplicate parent CC mount APIs

Parent Performance `fetch` counts on Employees route load:

| Endpoint | Count | Classification |
|----------|-------|----------------|
| `/api/xbos/tenant-scope/accessible` | **2** | P1 residual CD-FB-03 / `P1-HRM-PERF-*` |
| `/api/xbos/tenant-scope/group-member-units` | **2** | P1 residual |
| `/api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main` | **2** | P1 residual |
| `/api/xbos/workflow-engine/tasks?…` | **4** (2 query shapes ×2) | P1 residual |
| `/api/xbos/kpi-engine/portal-alerts?…` | **2** | P1 residual |

Link: `CD-FB-03` · `P1-HRM-PERF-FE-01` (iframe remount) · related PERF FE/BE items.

---

## Noise (explicit ignore)

| Signal | Action |
|--------|--------|
| «Download the React DevTools…» | Ignore |
| i18next / Locize promotional console | Ignore |

---

## Dev readiness

| Work item | Bus status (2026-07-16) | Evidence on disk |
|-----------|-------------------------|------------------|
| `P1-HRM-EMP-DUP-KEY-BE` | `pm -> dev-be DISPATCHED` | missing |
| `P1-HRM-EMP-DUP-KEY-FE` | `pm -> dev-fe DISPATCHED` | missing |

→ QA **cannot** retest-to-PASS; live `:8088` still shows P0.

---

## Residual / not promoted

1. **P0** duplicate employee id in list + React key collision — block UF/console green until BE+FE READY + QA retest.
2. **P1** CC mount ×2 APIs + employees 12-page fan-out — track under `P1-HRM-PERF-*` / CD-FB-03 (do not conflate with P0).
3. Automation note: injected `console.*` hooks did not buffer React warning strings this run; fiber+API cardinality is the SoT for this FAIL.

---

## Handoff

- **ack_status:** `FAIL`
- **next_owner:** `pm` → ensure `dev-be` + `dev-fe` complete dup-key; then re-dispatch **qa** retest
- **evidence_path:** `docs/qa/evidence/p1-hrm-console-audit-20260716.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: P1-HRM-EMP-DUP-KEY-BE (+ FE parallel P1-HRM-EMP-DUP-KEY-FE)
from_role: pm
to_role: dev-be
lane: execution
entry_criteria: QA FAIL P1-HRM-CONSOLE-AUDIT-QA — evidence docs/qa/evidence/p1-hrm-console-audit-20260716.md; :8088 ceo@xe.vn Employees; GET /api/hrm/employees company_id=main returns 107 duplicate UUIDs across pages (1109 rows / 998 unique); DataTable fiber keys 1107 rows / 996 unique / 107 colliding ids (sample 221f23fe-aa70-429e-8006-50918284689e ×2).
exit_criteria: List under group CEO rollup returns unique employee id per row; FE dedupe-by-id defense; no duplicate React keys on Employees DataTable; unit/spec evidence; READY_FOR_QA.
evidence_path: docs/qa/evidence/p1-hrm-emp-dup-key-be-20260716.md
cấm: seed; do not claim console PASS while dup keys remain
U65: zero-seed
After BOTH BE+FE READY_FOR_QA → Task qa work_item_id P1-HRM-CONSOLE-AUDIT-QA-RETEST: browser :8088 Employees; duplicate-key present? N; GET /employees page fan-out note; evidence docs/qa/evidence/p1-hrm-console-audit-retest-20260716.md
```
