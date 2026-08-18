# PO-UC-TC-W4-QA-ATT-WORKSHIFT-LOOP-01

**work_item_id:** PO-UC-TC-W4-QA-ATT-WORKSHIFT-LOOP-01  
**from_role:** qa · **to_role:** pm  
**fe_ref:** PO-UC-TC-W4-FE-ATT-WORKSHIFT-UPDATE-LOOP-01 · `docs/qa/evidence/po-uc-tc-w4-fe-att-workshift-update-loop-01.md`  
**u65:** zero-seed · browser-only (Playwright + portal auth inject)  
**date:** 2026-08-04 · **commit:** dc930c5  
**ack_status:** **PASS_TO_PM**

## L0 / FE↔BE

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm-api / xbos-api / portal **200** (hrm briefly down mid-session → restarted `pnpm run dev:hrm-api`) |
| `qc:fe-be-health:pilot` | Stack + proxy routes **PASS**; `test:pilot:flows` **12/13** (P-CC-09b catalog approve — out of scope) |

## Browser AC — Ca làm việc (loop seat)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · `company_id=main`  
**URL:** `http://127.0.0.1:5173/hr/attendance?portal=1&tenantId=xevn&companyId=main`  
**Click path:** Command Center HRM embed → **Chấm công** → **Ca làm việc** → **Danh sách ca**  
**J-***: HRM attendance embed — Ca list surface (`PROGRAM_JOURNEY_MAP` attendance module)

| # | AC | Evidence | Verdict |
|---|-----|----------|---------|
| 1 | L0 stack | See table above | 🟢 |
| 2 | Login CEO holding | Portal login **201** · auth inject | 🟢 |
| 3 | Open Chấm công | Page loads embed shell | 🟢 |
| 4 | Tab Ca / Danh sách ca | Dropdown navigation OK | 🟢 |
| 5 | **No** `Maximum update depth exceeded` | `pageErrors`: **[]** · no `[depth]` console · all runs | 🟢 |
| 6 | **No** `work-shifts` GET storm | After tab open: **1** GET then **0** additional GETs in **5s** idle (`stormDetected: false`) | 🟢 |
| 7 | List surface stable | `[data-testid="shifts-table"]` visible · spinners **0** | 🟢 |
| 8 | Optional create/edit/delete + F5 | **Not promoted** — loop-only seat (`QA_SKIP_CRUD`); no seed | ⚪ |

### Network (work-shifts)

- **Run A (HRM healthy):** `GET /api/hrm/attendance/work-shifts?company_id=main` → **200** (single call).
- **Run B (HRM flaky / proxy 500):** same endpoint **500** once — **still only 1 GET** (proves loop fixed; data load blocked by BE/env, not FE re-fetch storm).

### Console excerpt (representative — no depth loop)

```
(no "Maximum update depth exceeded")
Error fetching work shifts: ApiClientError: ... (500)   ← only when BE/proxy 500; not a re-render storm
```

### Screenshot

`docs/qa/evidence/screens/po-uc-tc-w4-qa-att-workshift-loop-01/shifts-list-tab.png`

### Machine JSON

`docs/qa/evidence/_tmp-po-uc-tc-w4-qa-att-workshift-loop-01-browser.json`  
Repro: `node scripts/qa/_tmp-po-uc-tc-w4-qa-att-workshift-loop-01.mjs` (optional `QA_SKIP_CRUD=1` `QA_SKIP_F5=1` for loop-only)

## completion_report

- **Closed:** FE `useWorkShifts` unstable `h` / `fetchShifts` deps loop — **no** React maximum update depth; **no** infinite `work-shifts` polling on Ca tab (U65 browser).
- **Open (out of slice):** Intermittent HRM **500** / `ECONNREFUSED :28001` during session — ops/BE stability, not loop regression. Optional CRUD + F5 mutate not exercised this seat.

## Residual

| ID | Owner | Note |
|----|-------|------|
| R-W4-ATT-WS-ENV-500 | devops / dev-be | Keep `hrm-api` on `:28001` for embed proxy; investigate 500 burst on attendance satellite routes when API restarts |
| MFD Ca LIVE | qa (later) | PM note: **PO-MFD-M1** runtime smoke can re-stamp **Ca làm việc** LIVE when stack stable |

## next_owner

**pm** (no QC gate required for this narrow FE loop fix per dispatch)

## next_dispatch_prompt

```text
work_item_id: PO-UC-TC-W4-PM-ATT-WORKSHIFT-LOOP-CLOSE-01
PM intake: QA PASS_TO_PM PO-UC-TC-W4-QA-ATT-WORKSHIFT-LOOP-01 — FE loop fix verified (no Maximum update depth; single work-shifts GET; no storm). Optional CRUD not in seat. Residual R-W4-ATT-WS-ENV-500 = stack stability only.
Action: Close FE work item on bus; schedule PO-MFD-M1-att-runtime re-stamp Ca LIVE when hrm-api stable; no QC unless sponsor wants release gate on attendance module.
evidence_path: docs/qa/evidence/po-uc-tc-w4-qa-att-workshift-loop-01.md
```

## evidence_path

`docs/qa/evidence/po-uc-tc-w4-qa-att-workshift-loop-01.md`
