# QA-XBOS-DASHBOARD-FE-01 — Retest D-XBOS-DASHBOARD-FE-01 toolbar

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-XBOS-DASHBOARD-FE-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · sweep |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | TC-XBOS-HDSD-016 **🟢** · TC-XBOS-HDSD-019 **🟢** |
| **executed_at** | 2026-08-01 ~01:26 ICT |
| **URL** | `http://127.0.0.1:5173` |
| **persona** | Group CEO `ceo@xe.vn` / `company_id=main` |
| **U65** | zero-seed · browser Puppeteer · no seed |
| **spec_ref** | HDSD XBOS Ch.4 §4.2–4.3 · UF-XBOS-10 · FR-UC-XBOS-DASH-01 |
| **dev_handoff** | `docs/qa/evidence/d-xbos-dashboard-fe-01-20260801.md` |
| **runtime** | `docs/qa/evidence/_tmp-qa-xbos-dashboard-fe-01-runtime.json` |
| **harness** | `scripts/qa/qa-xbos-dashboard-fe-01-browser.mjs` |

---

## Executive summary

**PASS_TO_PM** — Sau fix `D-XBOS-DASHBOARD-FE-01`, toolbar tiếng Việt visible + clickable trên `/dashboard/organization` và `/dashboard/customers`. Harness regex TC-016/019 khớp body; không console error; Khách hàng «Thêm mới» mở CRM notice (POST=0). Bắt buộc vào `/cockpit` trước để unlock `xevn.portal.unlocked` (portal-flow gate).

---

## L0

| Gate | Exit | Notes |
|------|------|-------|
| `pnpm run qc:dev-stack` | **0*** | hrm-api :28001 · xbos-api :28002 · portal :5173 HTTP 200 (*node UV_HANDLE exit noise post-check) |
| vitest `dashboardPageToolbar.test.ts` | **7/7 PASS** | regex + filter/export helpers |

---

## Verdict matrix

| ID | Criterion | Verdict | Notes |
|----|-----------|---------|-------|
| **TC-XBOS-HDSD-016** | Org dashboard toolbar regex + click | **🟢 PASS** | Bộ lọc · Tìm kiếm · Xuất Excel clickable; search input visible; GET group-org-overview **200** |
| **TC-XBOS-HDSD-019** | Customers toolbar regex + click | **🟢 PASS** | Thêm mới · Tìm kiếm · Xuất clickable; CRM notice; POST mutate **0**; GET customers/items **200** |
| **Console** | No error on both routes | **🟢** | `consoleErrors.length=0` |
| **PORTAL-UNLOCK** | `/cockpit` before `/dashboard/*` | **🟢** | `sessionStorage xevn.portal.unlocked=1` |

---

## TC-XBOS-HDSD-016 — Dashboard Tổ chức nút

### Click path

```
Login ceo@xe.vn → Command Center
→ /cockpit (unlock portal workspace)
→ /dashboard/organization
→ click Bộ lọc → Tìm kiếm → Xuất Excel
→ observe org-dashboard-search-input visible
```

### Network

```http
GET /api/xbos/tenant-scope/group-org-overview → 200
```

### FE sau click

- Body match `/bộ lọc|tìm|export|xuất/i` **true**
- `[data-testid="dashboard-page-toolbar"]` **present**
- Search input `[data-testid="org-dashboard-search-input"]` **visible** after Tìm kiếm
- No error banner · console clean

### Verdict: 🟢

---

## TC-XBOS-HDSD-019 — Khách hàng nút chung

### Click path

```
(from org) → /dashboard/customers
→ click Thêm mới → Tìm kiếm → Xuất
→ observe CRM notice + customers-dashboard-search-input
```

### Network

```http
GET /api/xbos/business-master/customers/items?tenantId=xevn&companyId=main → 200
```

### FE sau click

- Body match `/thêm|tạo|tìm/i` **true**
- «Thêm khách hàng qua CRM» notice **visible** (view-only — no POST)
- Search input **visible**
- POST mutations on customers page: **0**
- No error banner · console clean

### Verdict: 🟢

---

## Matrix promote

| TC ID | Prior | Retest | Evidence |
|-------|-------|--------|----------|
| TC-XBOS-HDSD-016 | 🟡 | **🟢** | This file · sweep R-SWEEP-01 closed |
| TC-XBOS-HDSD-019 | 🟡 | **🟢** | This file · sweep R-SWEEP-01 closed |

---

## Residual / not promoted

| Item | Owner | Notes |
|------|-------|-------|
| Partners page toolbar | dev-fe (defer) | Same pattern as customers — out of D-XBOS-DASHBOARD-FE-01 scope |
| Customer create POST | CRM module | By design view-only on group dashboard |
| Sweep harness `qa-hdsd-bf-sweep-01-browser.mjs` | qa | Should add `/cockpit` unlock step for TC-016/019 retest parity |

---

## Commands

```bash
node scripts/qa/qa-xbos-dashboard-fe-01-browser.mjs
pnpm --filter web-portal exec vitest run src/lib/dashboardPageToolbar.test.ts
```

---

## ack_status

**PASS_TO_PM**
