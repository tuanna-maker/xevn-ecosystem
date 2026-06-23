# QA evidence — P1-HRM-H12-JOURNEY-QA (2026-06-06)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-H12-JOURNEY-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **ack_status** | **FAIL_TO_PM** |
| **executed_at** | 2026-06-06 |
| **environment** | `http://localhost:5173` · `ceo@xe.vn` / `Xevn@2026` · hrm-api `:28001` · xbos-api `:28002` |
| **parallel_wave** | `P1-HRM-H12-P2-POLISH` (dev-fe — in flight) |
| **journeys** | **J-HRM-03** (P-CC-04 contracts → detail) · **J-HRM-04** (P-CC-05 insurance → employee profile) |
| **spot_menus** | decisions · processes · settings · guide — SRS empty-state vs mock |

## Executive summary

| Area | Verdict | Notes |
|------|---------|-------|
| **L0** `qc:dev-stack` | **PASS** | exit **0** — hrm + xbos + portal 200 |
| **L1** `qc:fe-be-health` | **PASS** | exit **0** · portal-login + employees proxy 200 |
| **J-HRM-03** L2.5 browser | **PASS** | List 20 HĐ → Eye → **Chi tiết hợp đồng** dialog populated; **D-HRM-J03-DRAWER-01 CLOSED** |
| **J-HRM-04** L2.5 browser | **FAIL** | Employee name **not** a link; no `/employees/:id` navigation; Eye opens insurance detail only |
| **Spot: decisions** | **PASS GWC** | SRS empty «Không có quyết định nào» · 0 rows · no mock |
| **Spot: processes** | **PASS GWC** | «Chưa có quy trình nào» · no mock seed |
| **Spot: settings** | **PASS** | Account tab (Cài đặt) loads real profile form |
| **Spot: guide** | **PASS GWC** | Static module help cards (SRS static N/A) |

**Rule applied:** API-only 200 **does not** satisfy L2.5 — browser click path mandatory (`U19`).

---

## Environment traceability

| Service | Port | Health |
|---------|------|--------|
| web-portal | 5173 | HTTP 200 |
| hrm-api | 28001 | `GET /api/hrm` → 200 |
| xbos-api | 28002 | `GET /api/xbos` → 200 |

**Persona:** Group CEO · embed `companyId=main` · iframe proxy `/hr/*?portal=1&tenantId=xevn&companyId=main`

---

## Commands executed

```text
pnpm run qc:dev-stack          → exit 0
pnpm run qc:fe-be-health       → exit 0 (portal-login token ok; employees proxy 200)
```

Browser: Cursor IDE browser MCP · logged-in CC embed tab · iframe inspected via CDP `Runtime.evaluate`.

---

## J-HRM-03 — Hợp đồng → chi tiết HĐ (P-CC-04)

| Step | Action | Result |
|------|--------|--------|
| 1 | Sidebar **Hợp đồng** | URL `…/command-center/hrm/contracts` · iframe `…/hr/contracts?portal=1&companyId=main` |
| 2 | List load | **20** contracts (tabs: Tất cả 20, HĐ thử việc 5, …) · no ERROR banner · no 409 console |
| 3 | Row **HLD-0956-HD** (Đỗ Xuân Hà) → **Eye** (Thao tác col 1) | Dialog **Chi tiết hợp đồng** opens |
| 4 | Detail content | Mã **HLD-0956-HD** · NV **Đỗ Xuân Hà** · Phòng **Kinh doanh** · Loại HĐ · dates · **Có hiệu lực** |
| 5 | Empty error check | No «Không có dữ liệu» / red sync banner on detail |

**Verdict:** **PASS** — L2.5 click path complete; prior **D-HRM-J03-DRAWER-01** (Eye/modal) **CLOSED**.

**Click path (audit):** `CC HRM menu → Hợp đồng → table row HLD-0956-HD → Eye icon → Chi tiết hợp đồng modal`

---

## J-HRM-04 — Bảo hiểm → NV linked → profile (P-CC-05)

| Step | Action | Result |
|------|--------|--------|
| 1 | Sidebar **Bảo hiểm** | URL `…/command-center/hrm/insurance` · iframe loaded |
| 2 | List load | **2** rows (LOG-0003 · **Lê Văn An**) · pagination «1–2 of 2» |
| 3 | Click **employee name** «Lê Văn An» | `hasLink: false` · URL unchanged (`…/hr/insurance?…`) · **no profile navigation** |
| 4 | Click **Eye** (Thao tác) | Dialog **Chi tiết bảo hiểm** (not employee profile) · fields: LOG-0003, Lê Văn An, sparse BHXH cols |
| 5 | Profile `/employees/:id` | **Not reached** — no `<a href="/employees/…">` in name cell |

**Verdict:** **FAIL** — journey requires insurance list → **employee link** → employee profile **200**; UI path blocked.

**Note:** Eye → insurance detail dialog is **not** a substitute for J-HRM-04 profile navigation per journey map + prior audit `D-HRM-J04-CLICK-01`.

**Click path attempted:** `CC HRM menu → Bảo hiểm → row LOG-0003 → click «Lê Văn An» → stayed on insurance (FAIL)`

---

## Spot — SRS empty-state vs mock

| Menu | Route | UI observation | Mock? | Verdict |
|------|-------|----------------|-------|---------|
| **Quyết định** | `/command-center/hrm/decisions` | «Không có quyết định nào» · 0 records | No 54321/demo | **PASS GWC** (deferred REST per matrix) |
| **Quy trình & chính sách** | `/command-center/hrm/processes` | «Chưa có quy trình nào» + Thêm mới | No mock rows | **PASS GWC** |
| **Cấu hình HRM** | `/command-center/hrm/settings` | Account form (Họ tên, Email, Lưu) | Real settings UI | **PASS** |
| **Hướng dẫn sử dụng** | `/command-center/hrm/guide` | Static module cards (Bắt đầu, Nhân viên, …) | Static SRS content | **PASS GWC** |

**P3 observation (non-blocking):** Insurance summary cards (Tổng BHXH/BHYT/BHTN) show «-» while table has 2 rows — summary aggregation UX gap, not J-HRM-04 blocker.

---

## Defects

| ID | Sev | Owner | Journey | Symptom | Repro |
|----|-----|-------|---------|---------|-------|
| **D-HRM-J04-CLICK-01** | **P1** | dev-fe | **J-HRM-04** | Insurance employee name is plain `<span>` — no `Link` to `/employees/:id`; click does not open profile | P-CC-05 → click «Lê Văn An» → URL stays on insurance |
| **D-HRM-INS-SUMMARY-01** | P3 | dev-fe | P-CC-05 | Summary cards «-» while list has 2 participants | Insurance tab load |

**Closed this wave**

| ID | Notes |
|----|-------|
| **D-HRM-J03-DRAWER-01** | Eye on contracts row opens **Chi tiết hợp đồng** — J-HRM-03 browser PASS |

---

## Residual / PM dispatch

| Item | Owner | Trigger |
|------|-------|---------|
| **D-HRM-J04-CLICK-01** | dev-fe (`P1-HRM-H12-P2-POLISH`) | Add `Link` on insurance employee name (mirror `Contracts.tsx` / `Decisions.tsx`) → QA retest J-HRM-04 |
| Insurance API probe | dev-be (if H12 adds link but GET 404) | Only if profile GET fails after FE link |

**pm_dispatch_hint:** Complete H12 insurance employee `Link` + `employee_id` wiring; QA re-run `P1-HRM-H12-JOURNEY-QA` J-HRM-04 only.

---

## Handoff packet

```yaml
completion_report: |
  L0+L1 PASS. J-HRM-03 browser PASS (contract Eye → detail dialog; D-HRM-J03-DRAWER-01 closed).
  J-HRM-04 browser FAIL — employee name not linked to profile; D-HRM-J04-CLICK-01 OPEN P1.
  Spot menus decisions/processes/settings/guide: SRS empty-state or static content PASS (no mock violation).
next_owner: dev-fe
next_dispatch_prompt: |
  P1-HRM-H12-P2-POLISH — close D-HRM-J04-CLICK-01: In apps/web/hrm/src/pages/Insurance.tsx wrap employee_name
  (and/or employee_code when employee_id present) with react-router Link to `/employees/${employee_id}` matching
  Contracts.tsx pattern. Ensure useInsuranceList maps employee_id on list rows. Handoff READY_FOR_QA with evidence path;
  QA will re-run J-HRM-04 browser click insurance → name → profile 200 on localhost:5173 ceo@xe.vn.
evidence_path: docs/qa/evidence/p1-hrm-h12-journey-qa-20260606.md
ack_status: FAIL_TO_PM
pm_dispatch_hint: P1-HRM-H12-P2-POLISH — D-HRM-J04-CLICK-01 P1 blocks J-HRM-04 promote
```
