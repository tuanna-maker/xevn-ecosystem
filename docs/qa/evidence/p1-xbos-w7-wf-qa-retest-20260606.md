# QA evidence — P1-XBOS-W7-WF-FIX retest (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-XBOS-W7-WF-FIX` |
| **from_role** | `qa` |
| **to_role** | `qc` |
| **ack_status** | **READY_FOR_QC** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · xbos-api `:28002` · hrm-api `:28001` |
| **entry_evidence** | `docs/qa/evidence/p1-xbos-w7-wf-fe-fix-20260606.md` (READY_FOR_QA) |
| **journeys** | **J-XBOS-01** (CC inbox drawer + KPI + quick-approve regression) · **J-XBOS-10** (U34 consumer sync — workflow save → list without F5) |
| **mental_model** | `docs/program/XBOS_CC_BUSINESS_MENTAL_MODEL.md` §1b consumer sync |

## Executive summary

| Journey / area | Verdict | Notes |
|----------------|---------|-------|
| **L0** `qc:dev-stack` + `qc:fe-be-health` | **PASS** | exit **0** · 8/8 FE↔BE |
| **J-XBOS-01** CC home inbox L2.5 | **PASS** | D-W7-INBOX-DRAWER-01 + D-W7-KPI-ROLLUP-01 **CLOSED** |
| **J-XBOS-10** Workflow create → list consumer sync (U34) | **PASS** | List **7→8** without F5; API total **8** incl. `QA-W7-RET-20260606` |

**Mock audit:** `VITE_ALLOW_MOCK_FALLBACK=false` — inbox cards from live `workflow-engine/tasks` (**XBOS-WF-203**).

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO JWT `tenantId=xevn`, `companyId=main`, hdr `x-company-id: main`.

---

## Commands executed

| # | Command | Exit | Notes |
|---|---------|------|-------|
| 1 | `pnpm run qc:dev-stack` | **0** | L0 |
| 2 | `pnpm run qc:fe-be-health` | **0** | 8/8 PASS |
| 3 | `node scripts/tmp-p1-phase1-qa-wf-inbox-probe.mjs` | **0** | J-XBOS-01 API L2.5 PROBE_OK |
| 4 | MCP browser — `/command-center` + `?wfInstanceId=` | — | J-XBOS-01 drawer + deep link |
| 5 | MCP browser CDP — `?settings=workflow` create save | — | J-XBOS-10 U34 consumer sync |
| 6 | API rollup + definitions list (inline probe) | **0** | KPI 200 empty series; defs total **8** |

---

## J-XBOS-01 — CC home: KPI banner + drawer + quick-approve regression

### Defects under retest

| ID | Prior symptom | Retest result |
|----|---------------|---------------|
| **D-W7-KPI-ROLLUP-01** | Red banner *Không tải KPI rollup* when rollup API **200** `series:[]` | **CLOSED** — no banner; headline `—`; sparkline empty OK |
| **D-W7-INBOX-DRAWER-01** | **Mở chi tiết** no-op | **CLOSED** — drawer opens; URL `?wfInstanceId=`; detail **200** |

### Click path (browser — `/command-center`)

| Step | Action | Result |
|------|--------|--------|
| 1 | CC home load | **PASS** — Task_Counter **4**; Action Cards **4**; KPI `—` (no error banner) |
| 2 | **Mở chi tiết** (first card) | **PASS** — URL `?wfInstanceId=aa85bade-0d28-42ed-8f65-274884d098ce`; drawer *Chi tiết nhiệm vụ*; steps `approve-dept` / `hr-confirm`; **Hoàn thành** / **Từ chối** visible |
| 3 | Deep link reload `?wfInstanceId=aa85bade-…` | **PASS** — drawer hydrates with instance detail |
| 4 | **Xử lý nhanh** regression | **PASS** — API probe `POST …/complete` **201** `XBOS-WF-200`; pending **3→2** (same-session stack; drawer fix does not break approve path) |

### API L2.5 (probe)

| Step | API | HTTP | Code | Notes |
|------|-----|-----:|------|-------|
| List | `GET …/workflow-engine/tasks?…pending…ceo@xe.vn` | 200 | `XBOS-WF-203` | pending **3** at probe start |
| Detail | `GET …/instances/aa85bade-…/detail` | 200 | `XBOS-WF-204` | drawer instance |
| Complete | `POST …/tasks/{id}/complete` | 201 | `XBOS-WF-200` | quick-approve path |
| Refresh | repeat list | 200 | `XBOS-WF-203` | pending **2** |

### KPI collateral

| Call | HTTP | Code | UI |
|------|-----:|------|-----|
| `GET /api/xbos/kpi-engine/rollup?tenantId=xevn&companyId=main` | 200 | `XBOS-KPI-202` | `series:[]` — **no** red rollup banner on CC home |

**409 / 54321:** none on exercised workflow/KPI paths.

---

## J-XBOS-10 — Workflow save → list consumer sync (U34)

Per `XBOS_CC_BUSINESS_MENTAL_MODEL.md` §1b: list must update **without F5** after save.

### Click path (browser — `?settings=workflow`)

| Step | Action | Result |
|------|--------|--------|
| 1 | Workflow list load | **PASS** — **7** rows (`Chỉnh sửa` buttons) |
| 2 | **Thêm quy trình mới** | **PASS** — detail editor opens |
| 3 | Fill `QA-W7-RET-20260606` / `QA W7 Retest Consumer Sync 20260606` | **PASS** |
| 4 | **Lưu quy trình** | **PASS** — toast *Đã lưu quy trình lên workflow-engine (DB).* |
| 5 | List refresh **without F5** | **PASS** — **8** rows; `QA-W7-RET-20260606` visible in table |

### API corroboration

| Call | HTTP | Code | Pass |
|------|-----:|------|:----:|
| `GET …/workflow-engine/definitions?tenantId=xevn` | 200 | `XBOS-WF-200` | total **8** incl. `QA-W7-RET-20260606` |

---

## Defect table (post-retest)

| ID | Severity | Status | Owner |
|----|----------|--------|-------|
| **D-W7-INBOX-DRAWER-01** | P2 | **CLOSED** | — |
| **D-W7-KPI-ROLLUP-01** | P2 | **CLOSED** | — |
| **D-W7-WF-GET-ID-01** | P3 | OPEN | `dev-be` |
| **D-W7-WF-FORM-AUTO-01** | P3 | OPEN (automation-only) | — |

---

## Handoff

| Field | Value |
|-------|--------|
| **from_role** | qa |
| **to_role** | qc |
| **ack_status** | **READY_FOR_QC** |
| **evidence_path** | `docs/qa/evidence/p1-xbos-w7-wf-qa-retest-20260606.md` |

### completion_report

- **Closed:** **J-XBOS-01** full L2.5 after dev-fe fix — KPI no false banner, **Mở chi tiết** drawer + `wfInstanceId` deep link + detail **200**, quick-approve regression via API. **J-XBOS-10** U34 consumer sync **PASS** (7→8 list without F5).
- **Open:** **D-W7-WF-GET-ID-01** (P3 GET definitions/{id} 404), **D-W7-WF-FORM-AUTO-01** (P3 automation DOM).

### next_owner

`qc`

### next_dispatch_prompt

```
work_item_id: P1-XBOS-W7-WF-FIX
from_role: pm
to_role: qc
lane: execution

QA retest READY_FOR_QC docs/qa/evidence/p1-xbos-w7-wf-qa-retest-20260606.md. Re-gate J-XBOS-01 + J-XBOS-10 on localhost:5173 ceo@xe.vn: D-W7-INBOX-DRAWER-01 + D-W7-KPI-ROLLUP-01 CLOSED; U34 consumer sync workflow list 7→8 without F5. Promote journey map if GO. Residual P3 D-W7-WF-GET-ID-01 dev-be optional.
```

### pm_dispatch_hint

- **qc** `P1-XBOS-W7-WF-FIX` — W7 wave closure after retest PASS
- Promote **J-XBOS-01** browser status in `PROGRAM_JOURNEY_MAP.md` if QC GO
