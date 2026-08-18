# P1-HRM-MENU-QA-INTERNAL-SERVICES — Dịch vụ nội bộ (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-INTERNAL-SERVICES` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **menu** | Dịch vụ nội bộ |
| **URL** | `http://14.225.217.232:8088/command-center/hrm/internal_services` |
| **spec_ref** | HRM-SV-02 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` § `internal_services` · `GET /operations/service-requests` |
| **U65** | zero-seed · browser-only (read-only API probe with session Bearer; no seed) |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**GWC** — Primary browse/list for HRM-SV-02 **PASS** (portal embed, live list, tabs, view dialog, API **200** `HRM-SVC-200`). **Condition:** U65 F5 under concurrent `:8088` load returned **RATE-429** on `service-requests` + `employees` → UI showed **0** totals **without** Sync ERROR banner (silent empty).

| Gate | Result |
|------|--------|
| **L0** tab load / no ERROR banner / no 409 / no `54321` | **PASS** (initial) |
| **L2** UI data + empty/200 semantics | **PASS** (initial) — tabs **20 / 15 / 15**; list cards hydrated |
| **Console** P0 (dup React key / red hard errors) | **PASS** — card headings **15/15** unique on supply tab; no same-key symptoms observed |
| **Network** `GET /api/hrm/operations/service-requests` | **PASS** (initial) — **200** `HRM-SVC-200`; **50** unique ids; first paint **~2012 ms** (<3s) |
| **L2.5** list → detail | **PASS** — Eye → dialog «Chi tiết yêu cầu» (no dedicated J-* in journey map) |
| **Tabs** meal / vehicle / supply | **PASS** — counts & row sets switch correctly |
| **F5** U65 | **FAIL / COND** — post-reload **429** → UI **0** silent (see Residual) |
| **Mutate CRUD** | **Out of scope** this wave (HRM-SV-02 = list; create/approve = SV-01/05) |

**Density vs matrix:** ≥10 requests / company — **50** total; `employee_id` present **34/50 (68%)** ≥50% — **PASS**.

---

## Environment / session

| Item | Value |
|------|-------|
| Portal URL | `http://14.225.217.232:8088/command-center/hrm/internal_services` |
| HRM iframe | `http://14.225.217.232:8088/hr/internal-services?portal=1&tenantId=xevn&companyId=main&_v=…` |
| UI title | «Dịch vụ nội bộ» |
| Subtitle | «Quản lý báo cơm, đặt xe, văn phòng phẩm» |
| Scope bar | «Tất cả đơn vị (rollup)» |
| Storage | `hrm_current_company_id=main` |
| Auth | iframe `localStorage` `xevn.portal.accessToken` |

Screenshots (agent temp):

- Portal embed: `p1-hrm-menu-internal_services-portal.png`
- Meal tab: `p1-hrm-menu-internal_services-meal.png`
- Supply tab: `p1-hrm-menu-internal_services-supply.png`

---

## L0 / L2 UI (initial — before rate-limit)

| Check | Observation |
|-------|-------------|
| Embed path | underscore portal → hyphen iframe `/hr/internal-services` (prior D-HRM-INTSVC-404-01 **CLOSED**) |
| Tabs | Báo cơm **20** · Đặt xe **15** · Văn phòng phẩm **15** |
| Meal stats | Tổng **20** · Chờ duyệt **11** · Đã duyệt **5** |
| Vehicle stats | Tổng **15** · Chờ duyệt **5** · Đã duyệt **7** |
| Supply stats | Tổng **15** · Chờ duyệt **2** · Đã duyệt **7** |
| Sample rows | Huỳnh Văn An, Nguyen NhanSu0022, Bùi Văn An, … (incl. historical seed notes in `notes` field — **not** seeded this wave) |
| Sync ERROR / 54321 / 409 | **None** on initial load |

### L2.5 — list → view dialog

| Step | Result |
|------|--------|
| Tab | Văn phòng phẩm |
| Action | Eye on first card **Nguyen NhanSu0022** |
| Dialog | «Chi tiết yêu cầu» · status **Từ chối** · VPP · NV0022 · Nhân sự · created `07/06/2026 00:49` |
| Close | Escape / Close control |

---

## Network (iframe session Bearer — initial)

| Endpoint | Status | Code | Duration | Payload |
|----------|--------|------|----------|---------|
| `GET /api/hrm/operations/service-requests?company_id=main` | **200** | `HRM-SVC-200` | **946–2012 ms** | **50** rows; types meal=20 vehicle=15 supply=15; unique ids **50**/0 dup |
| `GET /api/hrm/employees` (support for create picker) | 2xx | — | **~0.4–2.4 s** × **many** | P1 fan-out (see residual) |

Probe body head (redacted): `success:true`, first row `service_type=supply`, `employee_name=Nguyen NhanSu0022`.

---

## F5 / RATE-429 (condition)

1. Initial load **PASS** (data + tabs + dialog).
2. `location.reload()` on HRM app URL → Resource Timing: `service-requests` **429** (~8.3s), page blank / empty.
3. Soft re-open later: portal stuck briefly on Vite module load (~10s chunks), then iframe «Đang tải trang HRM…».
4. Direct `/hr/internal-services` recover: UI title present but stats **0/0/0**; Resource Timing:
   - `service-requests` **429** (transfer ~404 B)
   - `employees` **429** (transfer ~404 B)
5. **No** Sync ERROR / toast — silent empty (**P1 UX**).

Likely amplified by **parallel** P1-HRM-MENU-QA waves on same `:8088` host. Not attributed to missing SV-02 list wiring (proved earlier **200**/50).

---

## Residual / Conditions

| ID | Sev | Owner | Expiry | Note |
|----|-----|-------|--------|------|
| `D-P1-HRM-INTSVC-429-SILENT-EMPTY-01` | P1 | **dev-fe** (+ devops rate-limit review) | **2026-07-24** | On HTTP **429**/5xx for `service-requests`, show ERROR/retry — **cấm** render **0** as happy empty |
| `D-P1-HRM-INTSVC-EMP-FANOUT-01` | P1 | **dev-fe** | fold `P1-HRM-SCALE-FE-W1` / PERF | Page mounts `useEmployees` → many heavy `/employees` calls (1–2.4s); coalesce / defer until create dialog |
| F5 clean retest | P1 | **qa** | after rate-limit cool-down or FE error UI | Re-run F5 alone when host not under parallel menu QA |

**No P0** product defect on happy-path HRM-SV-02 list/embed.

---

## Handoff

- **completion_report:** Closed U65 browser sweep for Dịch vụ nội bộ / HRM-SV-02. Initial L0/L2/tabs/view/API **PASS** (50 rows, density OK). F5 under concurrent **RATE-429** → silent empty → **GWC**. Residuals logged with owners.
- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-internal_services-20260717.md`
- **next_dispatch_prompt:** Mark `P1-HRM-MENU-QA-INTERNAL-SERVICES` as **GWC** on `P1-HRM-FULL-MENU-QA-PROGRAM` roster (condition `D-P1-HRM-INTSVC-429-SILENT-EMPTY-01` owner dev-fe expiry 2026-07-24; fan-out fold into `P1-HRM-SCALE-FE-W1`). Continue remaining menu QA; do **not** open QC until 17/17. Optional: after cool-down, re-dispatch QA F5-only retest for this menu.
