# QA-HRM-OU-FILTER-EMBED-01 — CC embed OU filter persist (browser U65)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-OU-FILTER-EMBED-01` |
| **Dev handoff** | `D-HRM-OU-FILTER-EMBED-01` · `docs/qa/evidence/dev-fe-hrm-ou-filter-embed-01-20260727.md` READY_FOR_QA |
| **Env** | Portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos `:28002` · `ceo@xe.vn` |
| **Runner** | `scripts/qa/qa-hrm-ou-filter-embed-01.mjs` |
| **Runtime** | `docs/qa/evidence/_tmp-qa-hrm-ou-filter-embed-01-runtime.json` |
| **Screenshots** | `_tmp-qa-hrm-ou-filter-embed-01-open.png` · `_tmp-qa-hrm-ou-filter-embed-01-reopen.png` · `_tmp-qa-hrm-ou-filter-embed-01-visun.png` · `_tmp-qa-hrm-ou-filter-embed-01-regression.png` |
| **Constraints** | **U65 zero-seed** · **HOLD_DEPLOY** · **NOT** `:8088` · no seed · browser-only (not API-only PASS) |
| **Overall** | **PASS** |

---

## 0. L0 / stack

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | hrm-api **200** · xbos-api **200** · portal `:5173` **200** |
| Seed | **not used** |
| Persona | `ceo@xe.vn` / `Xevn@2026` (login API → inject portal session) |

---

## 1. AC matrix

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | Open «Đơn vị thành viên» — member unit options visible (not only rollup) | **PASS** | CC iframe `/hr/?portal=1…` · Select open · **5** members + rollup · sample Visun / X.E / … |
| 2 | Wait ≥5s — reopen Select — options still present | **PASS** | Wait **5500ms** · reopen · still `all=true members=5` (same sample) |
| 3 | Select Visun → banner «Đang xem: …Visun» + employees `company_id=logistics` | **PASS** | Banner `Đang xem: Công ty TNHH Du lịch Visun` · `GET /api/hrm/employees?company_id=logistics` **200** |
| 4 | Regression `/hr/employees?portal=1` OU filter | **PASS** | Options 5+rollup · Visun → banner + `company_id=logistics` **200** |

---

## 2. UF evidence block (browser)

### UF-HRM-OU-FILTER-EMBED-01 — CC embed OU persist + Visun scope

- **Persona / URL / click path:** `ceo@xe.vn` → `http://127.0.0.1:5173/command-center/hrm/dashboard` → iframe HRM → open **Đơn vị thành viên** → wait ≥5s → reopen Select → soft/hard to `/command-center/hrm/employees` → chọn **Visun** → observe banner + Network
- **Trước mutate:** Rollup default; Select shows holding + 4 ĐVTV
- **Action:** Open Select (options) → idle 5.5s → reopen (options persist) → Visun
- **Network:**
  - `GET /api/hrm/operating-units` → **200** `HRM-OPU-200` · dataLen=5 · slugs `holding,trsport,logistics,finance,services`
  - After Visun: `GET /api/hrm/employees?company_id=logistics&page=1&page_size=50` → **200**
- **FE sau open/wait/reopen:** Options **still 5 members** (not wiped to only rollup) — closes D-HRM-OU-FILTER-EMBED-01 defect class
- **FE sau Visun:** Banner «Đang xem: Công ty TNHH Du lịch Visun»; employees request scoped to `logistics`
- **F5 / reopen:** N/A for mutate; wait+reopen Select is the persistence AC
- **Verdict:** 🟢
- **spec_ref:** ADR-HRM-RBAC-SCOPE-LADDER §3 / U39 · `HrmOperatingUnitFilter.tsx` `portalScope="iframe"` · `HrmOperatingUnitFilterContext` keepPreviousData / scoped invalidate · BM-AC-02 / AC-CD-F3-03
- **spec_gap:** none

### UF-HRM-OU-FILTER-REGRESSION-portal1 — direct portal embed

- **Persona / URL:** `ceo@xe.vn` → `http://127.0.0.1:5173/hr/employees?portal=1&tenantId=xevn&companyId=main`
- **Action:** Open OU → Visun
- **Network:** `GET …/employees?company_id=logistics` **200**
- **FE:** Banner Visun
- **Verdict:** 🟢

---

## 3. Network snapshots

### 3.1 operating-units (embed)

```json
{
  "status": 200,
  "code": "HRM-OPU-200",
  "dataLen": 5,
  "slugs": ["holding", "trsport", "logistics", "finance", "services"]
}
```

### 3.2 employees after Visun (embed CC)

| Phase | Request | Status |
|-------|---------|--------|
| Before Visun (employees route) | `/api/hrm/employees?company_id=main&…` | **200** |
| After Visun | `/api/hrm/employees?company_id=logistics&page=1&page_size=50` | **200** |

Note: `rowCount=0` on this run for logistics list — **empty list with correct `company_id` is OK** per AC (scope query is the gate). Prior wave `QA-HRM-OU-FILTER-01` had density on same env; not a blocker for this work item.

---

## 4. Screenshots

| File | Shows |
|------|--------|
| `_tmp-qa-hrm-ou-filter-embed-01-open.png` | First open — member options visible in CC embed |
| `_tmp-qa-hrm-ou-filter-embed-01-reopen.png` | After ≥5s wait — options still present |
| `_tmp-qa-hrm-ou-filter-embed-01-visun.png` | Visun selected · banner |
| `_tmp-qa-hrm-ou-filter-embed-01-regression.png` | `/hr/employees?portal=1` Visun scope |

---

## 5. Residual

| Item | Severity | Owner |
|------|----------|-------|
| None product P0/P1 for this work item | — | — |
| HOLD_DEPLOY / NOT `:8088` | process | pm |
| `pm_dispatch_hint` | **none** (PASS) | — |

---

## 6. Handoff

```yaml
work_item_id: QA-HRM-OU-FILTER-EMBED-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qa-hrm-ou-filter-embed-01-20260727.md
completion_report: |
  Closed browser U65 AC1–4 on :5173 ceo@xe.vn CC embed.
  Open OU → 5 members; wait 5.5s reopen → options persist (iframe portal + query resilience).
  Visun → banner + GET employees company_id=logistics 200.
  Regression /hr/employees?portal=1 PASS.
  No seed. pm_dispatch_hint: none.
next_owner: pm
pm_dispatch_hint: none
next_dispatch_prompt: |
  work_item_id: PM-INTAKE-QA-HRM-OU-FILTER-EMBED-01
  from_role: qa
  to_role: pm
  Intake PASS_TO_PM QA-HRM-OU-FILTER-EMBED-01 — D-HRM-OU-FILTER-EMBED-01 verified on CC iframe.
  No Dev residual. HOLD_DEPLOY remains; do NOT promote :8088 from this wave alone.
```

---

## Command table

| # | Command | Result |
|---|---------|--------|
| 1 | `pnpm run qc:dev-stack` | hrm+xbos+portal **200** |
| 2 | `node scripts/qa/qa-hrm-ou-filter-embed-01.mjs` | exit **0** · OVERALL **PASS** · AC1–4 PASS |

## Journey L2.5

| J-* / UF | Verdict | Note |
|----------|---------|------|
| CC embed OU open → wait → reopen | **PASS** | Persistence defect closed |
| Visun scope on CC employees | **PASS** | `company_id=logistics` |
| Regression portal=1 | **PASS** | Same OU components |
| Dialog Select parent portal | **not retested this wave** | Dev note; out of primary AC list — optional follow-up if sponsor reports overlay |
