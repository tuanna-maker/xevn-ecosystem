# Evidence — PO-MFD-M3-EMP-SCOPE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M3-EMP-SCOPE-01` |
| **role** | qa |
| **date** | 2026-08-04 |
| **startedAt** | `2026-08-04T09:03:38.097Z` |
| **finishedAt** | ~`2026-08-04T09:04:06Z` |
| **commit** | `dc930c5` |
| **spec_ref** | UC-HRM-21 · J-HRM-01 · J-HRM-02 · FN-SCOPE-PARITY · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · HDSD CH06 §2 / §2.4 |
| **hdsd_align** | **true** (U76) |
| **U65** | zero-seed · no `pnpm seed:*` · no API invent Employees CLOSED |
| **matrix** | `HRM-EMPLOYEES_FIDELITY_MATRIX.md` surfaces **#1, #10, #28** (scope focus **#28**) |
| **runtime_json** | `docs/qa/evidence/_tmp-po-mfd-m3-emp-scope-01-browser.json` |
| **harness** | `scripts/qa/_tmp-po-mfd-m3-emp-scope-01.mjs` |
| **screens** | `docs/qa/evidence/screens/po-mfd-m3-emp-scope-01/` |
| **ack_status** | **PASS_TO_PM** |
| **Employees CLOSED** | **false** — scope seat only |
| **Attendance CLOSED** | **false** — not invented |
| **uat_done** | **false** |

## L0 `qc:fe-be-health`

| Checkpoint | Result |
|------------|--------|
| Entry (before browser) | **ALL PASS** (hrm/xbos/portal + employees/catalog direct+proxy) |
| Mid-run note | First attempt: HRM `:28001` dropped → contracts/member 500; restarted `pnpm run dev:hrm-api`; retest clean |
| Exit (after browser) | **ALL PASS** |

## hdsd_inventory (U76)

| HDSD / journey surface | Attempted | Result |
|------------------------|-----------|--------|
| Login Group CEO `ceo@xe.vn` | API login portal proxy | **201** · tenant `xevn` · `companyId=main` |
| CH06 §2 Danh sách nhân sự | `/hr/employees?portal=1&tenantId=xevn&companyId=main` | List **50** rows UI · GET **200** total **59** |
| CH06 §2.4 Bấm dòng → hồ sơ | Click holding rollup row | `/hr/employees/646306df-…` · tabs · GET **200** `HRM-EMP-200` |
| Quay lại danh sách | history back | List restored · **50** rows |
| J-HRM-01 Hợp đồng → NV | `/hr/contracts` → emp link | GET contracts **200** · GET emp **200** holding under `company_id=main` |
| Member CEO spot | `du-lich.ceo@xe.vn` · `tenantId=xe-du-lich` · `companyId=main` | List GET **200** empty honesty · **0** 404/409 on happy path |
| Member AU deny | L1 GET holding id + cross-tenant xevn | **409** `SCOPE_CONTEXT_MISMATCH` ×2 |

## Personas

| Persona | Account | Scope | Happy path |
|---------|---------|-------|------------|
| Group CEO | `ceo@xe.vn` / `Xevn@2026` | `tenantId=xevn` · `companyId=main` rollup | J-HRM-02 **PASS** · J-HRM-01 **PASS** |
| Member CEO | `du-lich.ceo@xe.vn` / `Xevn@2026` | `tenantId=xe-du-lich` · `companyId=main` (pilot membership — **not** company slug `xe-du-lich`) | J-HRM-02 **PASS_EMPTY** (list 200, 0 rows) · AU deny **PASS** |

## J-* L2.5 results

### J-HRM-02 — Nhân sự list → Hồ sơ → Back

| Step | Evidence | Verdict |
|------|----------|---------|
| List GET | `GET /api/hrm/employees?company_id=main&page=1&page_size=50` → **200** · total **59** · sample companies `holding,finance,trsport` | 🟢 |
| Click row | Holding row `646306df-f4a6-4199-bf99-9ea8a3ff8584` · «Tập đoàn XeVN» | 🟢 |
| Detail GET | `GET /api/hrm/employees/646306df-…?company_id=main` → **200** `HRM-EMP-200` · body `company_id=holding` | 🟢 **scope parity** |
| FE profile | tabs Chung/Công việc/… · notFound=false · scopeMismatch=false | 🟢 |
| Back | history → list URL `companyId=main` · rows **50** | 🟢 |
| 404/409 | **none** on happy path | 🟢 |

**FN-SCOPE-PARITY:** list and get-by-id both use `company_id=main` query under Group CEO; get-by-id returns member/holding employee (**not** 404). Same resolver class as ADR C2 rollup.

### J-HRM-01 — Hợp đồng → Hồ sơ NV

| Step | Evidence | Verdict |
|------|----------|---------|
| Contracts list | `GET …/contracts-insurance/contracts?company_id=main` → **200** · total **12** | 🟢 |
| Click emp link | `/hr/employees/a6be9b40-…?portal=1&tenantId=xevn&companyId=main` | 🟢 |
| Detail GET | `GET /employees/a6be9b40-…?company_id=main` → **200** · body `company_id=holding` | 🟢 |
| 404/409 | **none** | 🟢 |

### Member spot + AU

| Probe | Result | Verdict |
|-------|--------|---------|
| Browser list `xe-du-lich` + `main` | GET **200** · rows **0** · no Sync ERROR | 🟢 honesty empty |
| AU holding_leak | GET emp holding id · `x-company-id=holding` · member JWT → **409** `SCOPE_CONTEXT_MISMATCH` | 🟢 |
| AU xevn_main_cross_tenant | same id · `x-tenant-id=xevn` · `company_id=main` → **409** `SCOPE_CONTEXT_MISMATCH` | 🟢 |

## AC matrix

| # | AC | Verdict |
|---|-----|---------|
| 1 | L0 fe-be health entry+exit | 🟢 PASS |
| 2 | J-HRM-02 list→detail→Back no 404/409 | 🟢 PASS |
| 3 | List + get-by-id same `company_id=main` query (Group CEO) | 🟢 PASS |
| 4 | Rollup: detail body may be `holding` under query `main` | 🟢 PASS |
| 5 | J-HRM-01 contracts→employee detail same scope | 🟢 PASS |
| 6 | Member scope limits (empty own + AU 409) | 🟢 PASS |
| 7 | U65 zero-seed · no invent Employees/Attendance CLOSED | 🟢 PASS |

## Matrix stamp (this seat)

| Surface # | Prior | After SCOPE-01 | Note |
|-----------|-------|----------------|------|
| **28** FN-SCOPE-PARITY | UNKNOWN | **LIVE** | Browser + network proven |
| 1 List shell (scope path) | UNKNOWN | *(leave for RUNTIME/LIST)* | List load observed 200 — full LIST seat separate |
| 10 Detail shell (scope path) | UNKNOWN | *(leave for DETAIL)* | Profile mount observed — full DETAIL seat separate |

## Defects / residuals

| ID | Severity | Status | Note |
|----|----------|--------|------|
| — | — | **none P0 scope** | No `PO-MFD-M3-EMP-SCOPE-01-BE` needed |
| OBS-MEMBER-EMP-EMPTY | P3 env | OPEN | `du-lich` tenant `main` employees total 0 — honesty; not scope_parity FAIL |
| OBS-HRM-FLAP | ops | CLOSED this run | HRM restarted mid first attempt |

## Screens

| File | Content |
|------|---------|
| `group_ceo-01-list.png` | Employees list main rollup |
| `group_ceo-02-detail.png` | Profile holding under main |
| `group_ceo-03-back-list.png` | After Back |
| `group_ceo-04-contracts.png` | Contracts list |
| `group_ceo-05-contracts-detail.png` | Employee from contract link |
| `member_ceo-01-list.png` | Member empty list honesty |

## completion_report

**Closed:** P0-2 `PO-MFD-M3-EMP-SCOPE-01` — U65 browser FN-SCOPE-PARITY for J-HRM-01 + J-HRM-02 under `ceo@xe.vn` / `main` rollup; member AU 409 limits; L0 entry+exit PASS; matrix **#28 LIVE**.

**Residual / not claimed:** Employees menu **not** CLOSED; Attendance **not** CLOSED; LIST/DETAIL/IMPORT/RUNTIME seats remain; member employee density empty (env honesty).

**ack_status:** **PASS_TO_PM**

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M3-EMP-LIST-01
from_role: pm
to_role: qa
lane: execution
priority: P0
u65_zero_seed: true
hdsd_align: true
ack_status target: PASS_TO_PM

## Entry
- SCOPE-01 PASS — evidence docs/qa/evidence/po-mfd-m3-emp-scope-01.md · matrix #28 LIVE
- must_keep: scope parity J-HRM-01/02 (do not regress)
- Parallel OK with PO-MFD-M3-EMP-QA-RUNTIME-01 / PO-MFD-M3-EMP-DETAIL-01

## Job
Browser U65 ceo@xe.vn companyId=main: HDSD CH06 §2 list — search/filter/page; company_display VI; no Sync ERROR; empty honesty.
Do NOT invent Employees/Attendance CLOSED · no seed.

## Exit
evidence_path: docs/qa/evidence/po-mfd-m3-emp-list-01.md
Bus PASS_TO_PM + completion_report + next_dispatch_prompt (DETAIL or IMPORT)
```

Alternate parallel after SCOPE: `PO-MFD-M3-EMP-DETAIL-01` (list→profile→Back tab shell) — SCOPE already green.
