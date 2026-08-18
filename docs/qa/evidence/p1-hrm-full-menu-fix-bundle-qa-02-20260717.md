# P1-HRM-FULL-MENU-FIX-BUNDLE-QA-02 — Browser retest evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-FULL-MENU-FIX-BUNDLE-QA-02` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` |
| **account** | `ceo@xe.vn` / BOD · `companyId=main` |
| **deploy entry** | `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-deploy-02-20260717.md` · code `9dd029c` |
| **U65** | zero-seed · browser sequential · **no** `pnpm seed:*` |
| **ack_status** | **PASS_TO_PM** |

---

## Summary verdict

| # | Item | Verdict | Notes |
|---|------|---------|-------|
| 1 | **PERF-HRM-DEC-01** | 🟢 PASS | List: 1× `/api/hrm/decisions` 200; employees **0** until create dialog → 1× `/api/hrm/employees` 200 |
| 2 | **COND-PF-PORTAL-01** | 🟢 PASS | Deep-link stays on `/command-center/hrm/performance`; sidebar **Đánh giá**; list cycles/evaluations 200; mutate POST cycles **201** (no RATE-429) |
| 3 | **COMPANY-DEPT-STUB** | 🟢 PASS | Tab Phòng ban → `GET /api/hrm/departments?company_id=main` **200** + catalogs; rows DEPT_01..04 (Nhân sự/Vận hành/Kế toán/Kinh doanh) — not silent empty stub |
| 4 | **D-DASH-FE-STORM** | 🟢 PASS | `contracts/expiring` **×1** (not ×23); `employees/summary` **×1**; ops `reports/summary` **×1**; UC-HRM-20 tiles live (1107 / 13103 / 45 / Kỳ lương **80**) |
| 5 | **P1-HRM-CON-PERF-01** | 🟢 PASS | Progressive pages 1→12 sequential 200; employees picker deferred (0 on list); F5 → 1104 rows all 200, no silent empty; **J-HRM-03** detail dialog `HLD-0006-HD` |

**Overall:** **PASS_TO_PM** — all five fix-bundle ACs closed on live `:8088`.

---

## 1) PERF-HRM-DEC-01 — Decisions coalesce + deferred employees

**Path:** Login session → `/command-center/hrm/decisions` → iframe `/hr/decisions?portal=1&companyId=main`

### List load (PerformanceResourceTiming)

| API | Count | Status |
|-----|-------|--------|
| `/api/hrm/decisions?company_id=main` | **1** | 200 |
| `/api/hrm/employees` | **0** | — |
| `/api/hrm/operating-units` | 1 | 200 |
| `/api/hrm/settings-catalogs` | 1 | 200 |

FE: empty state "Không có quyết định nào" + filters — OK (no storm).

### Create dialog (click **Thêm quyết định+**)

| API | Count | Status | Timing |
|-----|-------|--------|--------|
| `/api/hrm/employees?company_id=main&page_size=100` | **1** | 200 | only after dialog open |

Dialog (portaled outer): "Thêm quyết định mới" + "Chọn nhân viên" visible.

**Verdict:** 🟢 coalesce + deferred picker PASS.

---

## 2) COND-PF-PORTAL-01 — Performance portal deep-link

**Path:** Hard nav `http://14.225.217.232:8088/command-center/hrm/performance`

| Check | Result |
|-------|--------|
| Final URL | `/command-center/hrm/performance` — **no** Navigate→dashboard |
| Iframe | `/hr/performance?portal=1&…&companyId=main` |
| Sidebar | **Đánh giá** present |
| `GET …/performance/cycles` | **200** |
| `GET …/performance/evaluations` | **200** |
| FE list | "Danh sách chu kỳ (15)" → after mutate **(16)** |
| Mutate `POST …/performance/cycles` | **201** (~220ms) — **not** RATE-429 |

**RATE-429 policy:** Not observed on this run (limit raised to 10000 on deploy-02). No BLOCKED-ENV note required for FE fail.

**Verdict:** 🟢 PASS.

---

## 3) COMPANY-DEPT-STUB — Phòng ban API wire

**Path:** `/command-center/hrm/company` → Radix tab **Phòng ban**

| Check | Result |
|-------|--------|
| `GET /api/hrm/departments?company_id=main` | **200** (~222ms) |
| `GET /api/hrm/settings-catalogs` | **200** |
| FE rows | Nhân sự `DEPT_01`, Vận hành `DEPT_02`, Kế toán `DEPT_03`, Kinh doanh `DEPT_04` |
| Silent empty on fail | N/A — load succeeded with real catalog rows |
| Error banner | Not shown (success path) |

**Residual (P2):** departments fetch appeared **twice** in net hook (same URL 200) — coalesce nicety, not blocker.

**Verdict:** 🟢 PASS.

---

## 4) D-DASH-FE-STORM — Dashboard network + ops tiles

**Path:** `/command-center/hrm/dashboard` → iframe `/hr/?portal=1&…`

### Network storm cut

| Endpoint | Count | Status | Prior defect |
|----------|-------|--------|--------------|
| `/api/hrm/contracts-insurance/contracts/expiring` | **1** | 200 | was ×23 |
| `/api/hrm/employees/summary` | **1** | 200 | was ×12 |
| `/api/hrm/operations/reports/summary` | **1** | 200 | PortalOperationsSummary |
| Total `/api/hrm/*` on mount | **7** | all 200 | — |

### UC-HRM-20 tiles (not fake 0)

| Tile | Value | Source label |
|------|-------|--------------|
| NHÂN SỰ | **1107** | GET `/employees/summary` |
| CHẤM CÔNG | **13103** | operations/reports/summary |
| TUYỂN DỤNG | **45** | operations/reports/summary |
| KỲ LƯƠNG | **80** | operations/reports/summary |

**Residual (P2):** Section "Tổng hợp lương" still shows TỔNG LƯƠNG / thuế / BH **0 VNĐ** charts without a payroll API call on this mount — separate from UC-HRM-20 ops tiles; storm AC closed.

**Verdict:** 🟢 PASS (storm + ops tiles).

---

## 5) P1-HRM-CON-PERF-01 — Contracts progressive + F5 + J-HRM-03

**Path:** `/command-center/hrm/contracts` · P-CC-04 · **J-HRM-03**

### Progressive mount

| Check | Result |
|-------|--------|
| Contracts pages | Sequential `page=1`…`page=12` `page_size=100` — all **200** (not parallel employee storm) |
| Employees on list | **0** calls (deferred pickers) |
| FE count | **1104** "Tất cả" |
| RATE-429 | **0** |

### F5

| Check | Result |
|-------|--------|
| Reload | Same URL + new iframe `_v` |
| List after F5 | **1104** rows, statuses all **200** |
| Silent empty | **No** |
| ERROR+Retry | Not needed (happy path) |

### J-HRM-03 detail

| Check | Result |
|-------|--------|
| Click | `button[aria-label="Chi tiết hợp đồng"]` |
| Dialog | **Chi tiết hợp đồng** — `HLD-0006-HD`, fixed_term, Có hiệu lực, Phòng ban Kinh doanh |
| 404/409 | None |

**Verdict:** 🟢 PASS.

---

## Environment / method

- Browser CDP + iframe `PerformanceResourceTiming` + fetch intercept (same-origin `/hr` embed).
- Dedicated tab (avoid concurrent soft-nav on shared session tab).
- Seed: **none**.

---

## Residual / not promoted

| ID | Severity | Note |
|----|----------|------|
| `R-DASH-PAYROLL-CHART-0` | P2 | Dashboard "Tổng hợp lương" sub-charts still 0 VNĐ; UC-HRM-20 Kỳ lương 80 OK |
| `R-DEPT-FETCH-X2` | P2 | Phòng ban tab: departments GET×2 identical |
| Contracts full-scan | Info | Still walks all 12 pages sequentially to hydrate 1104 — progressive vs storm PASS; optional next: true page-on-demand |

---

## Handoff

- `completion_report`: Fix-bundle QA-02 on `:8088` — **5/5 PASS** (decisions coalesce, performance deep-link+mutate 201, company departments API, dashboard storm cut, contracts progressive/F5/J-HRM-03). U65 no seed. Two P2 residuals only.
- `next_owner`: **pm** (optional **qc** gate if release wave requires)
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-FULL-MENU-FIX-BUNDLE-QA-02
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
entry: QA browser U65 PASS 5/5 on http://14.225.217.232:8088 HEAD/code 9dd029c — evidence docs/qa/evidence/p1-hrm-full-menu-fix-bundle-qa-02-20260717.md
action: Intake → update USER_FLOW_OPERABILITY_MATRIX Dev8088 for decisions/performance/company/dashboard/contracts; optional Task qc for GO/GWC on fix-bundle wave; P2 residual R-DASH-PAYROLL-CHART-0 / R-DEPT-FETCH-X2 defer or backlog — not blockers.
```
