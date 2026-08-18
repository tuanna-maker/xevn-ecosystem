# P1-HRM-SCALE-QA-W1 — Browser acceptance (Employees scale FE W1)

- **Date:** 2026-07-17
- **work_item_id:** `P1-HRM-SCALE-QA-W1`
- **Environment:** `http://14.225.217.232:8088`
- **Persona:** Group CEO `ceo@xe.vn` / BOD / `companyId=main` / `tenantId=xevn`
- **Deploy refs:** FE commit `1814f49` (in VPS tree per `p1-hrm-scale-fe-w1-deploy-20260717.md`); live modules confirmed: `useEmployeesPage.ts`, `embedScopeKey`
- **Method:** U65 browser-only — dedicated tab, login session already BOD → HRM Nhân sự. No seed, no API-only PASS.
- **spec_ref:** ADR-HRM-SCALE-1000-USERS §5.1–5.3 / §5.5 T-FANOUT; J-HRM-02; residual `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01`

## Verdict

**PASS_TO_PM**

All browser exit criteria for Scale FE W1 closed. Residual `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` **CLOSED** on `:8088`.

Recommend **QC / TM Scale W1 gate** (not Phase 1 / PROD claim).

---

## Click path

1. Portal `http://14.225.217.232:8088/command-center` (BOD session) → `/command-center/hrm/employees`
2. Hard reload Employees embed — measure mount Network
3. Pagination → page 2 (`51–100 / 1107`)
4. Row click → profile `VTH-0817` / `Nguyễn Thị Hà`
5. Back (arrow) → list
6. Soft deep-link / second profile → `NV0001` / `Nguyen NhanSu0001`
7. Portal soft-nav: Nhân sự ↔ Hợp đồng ↔ Nhân sự (`embedScopeKey` / `_v` stable)
8. Search `keyword=NV0001` — server page

Screenshots:
- `C:\Users\ADMIN\AppData\Local\Temp\cursor\screenshots\p1-hrm-scale-qa-w1-employees-20260717.png`
- `C:\Users\ADMIN\AppData\Local\Temp\cursor\screenshots\p1-hrm-scale-qa-w1-list-20260717.png`

---

## Exit criteria matrix

| # | Criteria | Evidence | Verdict |
|---|----------|----------|---------|
| 1 | Initial mount ≤1 list GET / page; no `listAllEmployees` chain | Hard reload PerformanceResourceTiming: **1×** `GET /api/hrm/employees?company_id=main&page=1&page_size=50` (+ optional `summary`); **0** page=2..N | **PASS** |
| 2 | Pagination/search server-paged; no duplicate-key console warning | Page 2: **1×** `page=2&page_size=50` (UI `51–100 / 1107`, `2 / 23`). Search: **1×** `page=1&page_size=50&keyword=NV0001` (UI `1–2 / 2`). Console error/warn hooks: **[]**. No duplicate-key banner | **PASS** |
| 3 | List→profile ≤1 detail GET; **0** multi-page list chains | Profile open: **1×** `GET /employees/{id}?company_id=main` (+ work-timeline). List chains after click: **0**. Second open `NV0001`: detail **×1**, list **×0** | **PASS** — closes `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` |
| 4 | Iframe does not reload document on stable scope/nav | `iframe` element identity stable; `src` `_v=1784263960636` **unchanged** across list→profile→back and portal Nhân sự↔Hợp đồng soft-nav; path changes via in-iframe SPA / postMessage (src stays `/hr/employees?…`) | **PASS** (`embedScopeKey`) |
| 5 | Console product P0 = 0; no RATE-429 from fan-out | Console hooks empty; no ERROR/429 banner text during Employees journey | **PASS** |
| 6 | J-HRM-02 list→detail/deep-link/back | List → profile 200 scope parity (`company_id=main`); profile sections rendered (not «Không tìm thấy»); back → list 1107; deep-link `NV0001` profile OK | **PASS** |
| 7 | Network + FE state + F5/back captured | Counts below; hard reload = F5 mount; back = icon arrow | **PASS** |

---

## Network counts (authoritative: iframe `PerformanceResourceTiming`)

### Mount (hard reload)

| Request | Count | Notes |
|---------|------:|-------|
| `GET /api/hrm/employees?company_id=main&page=1&page_size=50` | **1** | ~254 ms |
| `GET /api/hrm/employees/summary?company_id=main&include_archived=true` | 1 | Allowed companion |
| `page=2..N` / full directory chain | **0** | Prior defect was 12-page fan-out |

Live module scripts observed: `useEmployeesPage.ts` (and legacy `useEmployees.ts` still bundled for export/deleted paths — **not** invoked as multi-page list on mount).

### Pagination

| Action | Request | Count |
|--------|---------|------:|
| Next → page 2 | `…&page=2&page_size=50` | **1** |

### Profile navigation (closes D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01)

| Action | Detail GET | List chain page=1..N |
|--------|------------:|---------------------:|
| Click `VTH-0817` → `/hr/employees/eebb04ca-…` | **1** (102 ms, `company_id=main`) | **0** |
| Soft/deep open `NV0001` → `/hr/employees/00000000-0000-4000-8000-000000000001` | **1** (147 ms) | **0** |

Prior baseline (`p1-hrm-menu-employees-20260717.md`): detail **×2** + **24** list requests (two×12-page chains). **Regressed closed.**

### Back to list

| Action | List GET | Iframe reload |
|--------|---------:|---------------|
| Arrow back | **1×** `page=1&page_size=50` (+ summary) | **No** (same `_v`, same element) |

Note: 1 refetch on remount of list route is within AC («≤1 if cache stale; prefer 0»). No multi-page storm.

### Search

| Action | Request | Count |
|--------|---------|------:|
| keyword `NV0001` | `…page=1&page_size=50&keyword=NV0001` | **1** |

---

## J-HRM-02

| Step | Result |
|------|--------|
| List scope | `Danh sách nhân viên trong công ty - 1107`; embed banner `xevn / main` |
| Detail | Profile headings/sections for selected employee; API 200 with `company_id=main` |
| Deep-link | `NV0001` / Nguyen NhanSu0001 profile rendered |
| Back | List restored; iframe document not reloaded |
| Fail pattern | No «Không tìm thấy nhân viên» / no 404 scope |

---

## Residuals (out of W1 QA scope — do not block PASS)

| ID | Severity | Note |
|----|----------|------|
| Satellite `listAllEmployees` pickers (insurance/decisions/…) | P2 / W2 | ADR W2 — not Employees table path |
| Department filter client-side on current server page | P3 / W2 | Documented in FE W1 residual |
| 1000-VU load test | W3 | Not in this wave |

---

## Handoff packet

- `work_item_id`: `P1-HRM-SCALE-QA-W1`
- `from_role`: `qa`
- `to_role`: `pm`
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md`
- `completion_report`: Browser Scale FE W1 PASS on `:8088` (BOD/`main`). T-FANOUT mount ≤1 paged list GET; pagination/search each ≤1 server GET; list→profile detail ≤1 and **0** multi-page list chains; iframe `_v`/element stable (no document reload); console P0=0; no RATE-429 fan-out; J-HRM-02 PASS. Residual `D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01` **CLOSED**. U65 zero-seed. No Phase 1/PROD claim.
- `next_owner`: `qc` (Scale W1 gate) — optional parallel `technical-manager` NFR note
- `next_dispatch_prompt`: (copy-ready below)

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-QC-W1
from_role: pm
to_role: qc
subagent_type: qc
entry_criteria: P1-HRM-SCALE-QA-W1 PASS_TO_PM; evidence docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md; deploy docs/qa/evidence/p1-hrm-scale-fe-w1-deploy-20260717.md; ADR-HRM-SCALE-1000-USERS-20260717.md §5.5 / W1
read_first: docs/qa/evidence/p1-hrm-scale-qa-w1-20260717.md; docs/qa/evidence/p1-hrm-scale-fe-w1-20260717.md; docs/decisions/ADR-HRM-SCALE-1000-USERS-20260717.md
spec_ref: ADR §5.1–5.3 T-FANOUT / embedScopeKey; J-HRM-02; D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01 CLOSED
exit_criteria: QC GO or GWC for Scale FE W1 only — confirm Network ≤1 list GET mount, profile ≤1 detail + 0 list chains, iframe no remount, J-HRM-02; list W2 residuals (picker listAllEmployees) as conditions not blockers; evidence docs/qa/evidence/qc-p1-hrm-scale-w1-20260717.md; PASS_TO_PM
cấm: seed; Phase 1/PROD claim; reopen CLOSED D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01 without new browser FAIL
```
