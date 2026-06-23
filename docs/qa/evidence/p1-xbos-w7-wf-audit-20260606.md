# QA evidence — P1-XBOS-W7-WF-AUDIT (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W7-WF` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **PASS_TO_PM** (with defects — see § Defects) |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` ONLY · `ceo@xe.vn` / `Xevn@2026` · xbos-api `:28002` · hrm-api `:28001` |
| **journeys** | **J-XBOS-10** (workflow create → list → detail graph) · **J-XBOS-01** (CC inbox pending) |
| **mental_model** | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` § J-XBOS-10, J-XBOS-01 |

## Executive summary

| Journey / area | Verdict | Notes |
|----------------|---------|-------|
| **L0** `qc:dev-stack` + `qc:fe-be-health` | **PASS** | exit **0** · 8/8 FE↔BE |
| **J-XBOS-10** Settings workflow create → list → detail graph | **PASS** | New `QA-W7-WF-20260606` saved; list **7** rows; edit detail graph **Bắt đầu** + step + **Hoàn thành** intact |
| **J-XBOS-01** CC inbox pending tasks | **PASS (GWC)** | **5** pending cards; **Xử lý nhanh** **5→4**; API list→detail→complete **PROBE_OK**; **Mở chi tiết** drawer **no-op** (defect) |
| **Collateral** CC KPI rail | **GWC** | Banner *Không tải KPI rollup (JWT companyId=main)* though direct rollup API **200** empty series |

**Mock audit:** `VITE_ALLOW_MOCK_FALLBACK=false` — inbox cards from live `workflow-engine/tasks` (**XBOS-WF-203**), not mock rail.

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO JWT `tenantId=xevn`, `companyId=main`, hdr `x-company-id: main` on strict workflow paths.

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `node scripts/tmp-p1-phase1-qa-wf-inbox-probe.mjs` | **0** | J-XBOS-01 API L2.5 (pre-browser; 6→5 pending) |
| 4 | MCP browser — `?settings=workflow` + `/command-center` | — | J-XBOS-10 + J-XBOS-01 UI |
| 5 | Node API — definitions list + GET by id + tasks count | **0** | Graph in list row; GET by id **404** |

---

## J-XBOS-10 — Workflow: tạo → lưu → list → detail graph

### Click path (browser)

| Step | Action | URL / target | Result |
|------|--------|--------------|--------|
| 1 | Login (session) | `/command-center` | **PASS** — `ceo@xe.vn` |
| 2 | Settings → Hệ thống quy trình | `/command-center?settings=workflow` | **PASS** — table **6** seeded rows (pre-create) |
| 3 | **Thêm quy trình mới** | detail view | **PASS** — canvas + step scaffold visible (**Bắt đầu**, **Bước 1**) |
| 4 | Fill Mã / Tên / Bước 1 | `QA-W7-WF-20260606` · `QA W7 Workflow Audit 20260606` · `QA W7 Step 1 Review` | **PASS** (React-compatible input) |
| 5 | **Lưu quy trình** | `POST /api/xbos/workflow-engine/definitions` | **PASS** — toast *Đã lưu quy trình lên workflow-engine (DB).* |
| 6 | List refresh | same route list view | **PASS** — **7** rows; W7 row visible |
| 7 | **Chỉnh sửa** on W7 row | detail editor | **PASS** — code/name/step persisted; **Sơ đồ luồng** shows **Bắt đầu**, **QA W7 Step 1 Review**, **Hoàn thành** |

### API evidence (round-trip)

| Call | HTTP | Code | Pass |
|------|-----:|------|:----:|
| `GET …/workflow-engine/definitions?tenantId=xevn` | 200 | `XBOS-WF-200` | ✅ total **7** incl. `QA-W7-WF-20260606` |
| List row `graph.steps` | — | 1 step `taskName=QA W7 Step 1 Review` | ✅ |
| `GET …/definitions/{id}` | **404** | `XBOS-CFG-001` | ⚠️ **GWC** — no GET-by-id; FE uses list row (detail UI still PASS) |

### Console / network

- No **409** on definitions list/create during W7 save.
- First automation attempt (plain `textarea.value=`) triggered visible banner `workflow-engine.definitions.create failed: workflowCode and name required (HTTP 400)` — fields not bound to React state; **not reproduced** with normal typing / React setter (see **D-W7-WF-FORM-AUTO-01** P3).

---

## J-XBOS-01 — CC inbox pending task

### Click path (browser)

| Step | Action | Result |
|------|--------|--------|
| 1 | `/command-center` load | **PASS** — Task_Counter **5** · Action Cards **5** rows · assignee `ceo@xe.vn` |
| 2 | **Mở chi tiết** (first card) | **FAIL** — no drawer/dialog; URL unchanged; no **Hoàn thành** / **Từ chối** controls |
| 3 | **Xử lý nhanh** (same card) | **PASS** — button *Đang xử lý…* then Task_Counter **5→4**; card removed |
| 4 | API recount | **PASS** — `GET …/tasks?status=pending&assigneeUserId=ceo@xe.vn` → **4** `XBOS-WF-203` |

### API L2.5 (probe — same session stack)

| Step | API | HTTP | Code | Notes |
|------|-----|-----:|------|-------|
| List | `GET …/workflow-engine/tasks?…pending…ceo@xe.vn` | 200 | `XBOS-WF-203` | **6** pending at probe start |
| Detail | `GET …/instances/{id}/detail` | 200 | `XBOS-WF-204` | — |
| Complete | `POST …/tasks/{id}/complete` | 201 | `XBOS-WF-200` | probe task approved |
| Refresh | repeat list | 200 | `XBOS-WF-203` | **5** pending |

**409 / 54321:** none on exercised workflow paths.

### Collateral (CC home — not J-XBOS-01 blocker)

- KPI widget: *Không tải KPI rollup (JWT companyId=main).* Direct `GET /api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main` → **200** `XBOS-KPI-202` `series:[]` — empty rollup mishandled as `loadFailed` in UI (see **D-W7-KPI-ROLLUP-01**).

---

## Defect table

| ID | Severity | Summary | Owner | Blocks journey? |
|----|----------|---------|-------|-----------------|
| **D-W7-INBOX-DRAWER-01** | **P2** | CC Action Card **Mở chi tiết** does not open workflow instance drawer / deep link (`wfInstanceId`); list→detail cross-nav **not** exercised in browser | `dev-fe` | **CLOSED** — retest [`p1-xbos-w7-wf-qa-retest-20260606.md`](p1-xbos-w7-wf-qa-retest-20260606.md) |
| **D-W7-KPI-ROLLUP-01** | **P2** | CC KPI rail error banner on localhost though rollup API **200** empty series — regression vs D-8088-KPI-01 fix intent | `dev-fe` | **CLOSED** — retest [`p1-xbos-w7-wf-qa-retest-20260606.md`](p1-xbos-w7-wf-qa-retest-20260606.md) |
| **D-W7-WF-GET-ID-01** | **P3** | `GET /workflow-engine/definitions/{id}` → **404** `XBOS-CFG-001` while list row contains full `graph` | `dev-be` | No for W7 UI (list→edit uses list cache) |
| **D-W7-WF-FORM-AUTO-01** | **P3** | Programmatic DOM `.value` on workflow textareas does not update React state → save **400**; normal user typing OK | — | No |

---

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/p1-xbos-w7-wf-audit-20260606.md` |

### completion_report

- **Closed:** **J-XBOS-10** create/save/list/detail graph round-trip **PASS** on localhost:5173 (`QA-W7-WF-20260606`). **J-XBOS-01** pending inbox **PASS** with live tasks; API approve **PROBE_OK**; browser quick-approve **PASS**.
- **Open (defects):** **D-W7-INBOX-DRAWER-01** (detail drawer), **D-W7-KPI-ROLLUP-01** (CC banner), **D-W7-WF-GET-ID-01** (API GET-by-id), **D-W7-WF-FORM-AUTO-01** (automation-only).

### next_owner

`pm`

### next_dispatch_prompt

```
work_item_id: P1-XBOS-W7-WF-FIX
from_role: pm
to_role: dev-fe
lane: execution

QA W7 audit PASS_TO_PM with defects docs/qa/evidence/p1-xbos-w7-wf-audit-20260606.md. Dispatch dev-fe: (1) D-W7-INBOX-DRAWER-01 — CC Action Card "Mở chi tiết" must open workflow drawer or navigate ?wfInstanceId= with GET …/instances/{id}/detail 200; (2) D-W7-KPI-ROLLUP-01 — empty rollup series HTTP 200 must not show "Không tải KPI rollup" (regression vs useCommandCenterKpiRail D-8088-KPI-01). Exit: browser retest J-XBOS-01 drawer click + CC home no error banner. Optional dev-be: D-W7-WF-GET-ID-01 GET definitions/{id} scope parity. Then Task qa retest same evidence file.
```

### pm_dispatch_hint

- **dev-fe** `P1-XBOS-W7-WF-FIX` — P2 drawer + KPI banner before QC W7
- **qc** after qa retest — promote **J-XBOS-10** in `PROGRAM_JOURNEY_MAP.md`
- **D-W5-HRM-CAT-SYNC-01** (prior W5 FAIL) remains separate P0 — do not conflate with W7 PASS
