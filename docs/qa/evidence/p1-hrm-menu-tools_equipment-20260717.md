# P1-HRM-MENU-QA-TOOLS — Công cụ & thiết bị (`tools_equipment`)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-TOOLS` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **executed_at** | 2026-07-17 (~12:03–12:05 UTC+7) |
| **env** | `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · BOD · `companyId=main` · `tenantId=xevn` |
| **URL (program)** | `http://14.225.217.232:8088/command-center/hrm/tools_equipment` |
| **URL (resolved)** | `http://14.225.217.232:8088/command-center/hrm/tools-equipment` (underscore → hyphen) |
| **iframe** | `/hr/tools-equipment?portal=1&tenantId=xevn&companyId=main` |
| **spec_ref** | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 `tools_equipment` — **Mock / backlog / Deferred** · R-FID-02 |
| **U65** | Zero-seed · browser login → menu → load only · **no** `pnpm seed:*` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS GWC** — L0 🟢 · honest deferred UI 🟢 · console P0 🟢 · product fidelity still **⚪ DEFERRED** (no Nest tools API) |

**Supersedes** earlier draft in this path that claimed stub CRUD toast **«Đã thêm CCDC thành công»**. Live FE (2026-07-17) is **view-only** with deferred banner; residual `D-HRM-TOOLS-STUB-TOAST-01` **CLOSED** on `:8088`.

---

## Executive summary

| Lớp | Verdict | Notes |
|-----|---------|-------|
| **L0** | **PASS** | Menu current; iframe 200; no Sync ERROR / 409 / `54321` |
| **L2** | **PASS (deferred)** | Stats **0**; subtitle + dashed banner state Phase-2 API pending; no fake inventory rows |
| **Console P0** | **PASS** | No ERROR banner; parent PerformanceResourceTiming: no 4xx/5xx / no `54321` on this load |
| **Network tools API** | **Absent (expected)** | Probe `GET /api/hrm/tools`, `/tools-equipment`, `/tools_equipment` → **404**; no tools REST in Phase 1 |
| **L2.5 J-*** | **N/A** | No J-* for tools; empty → no list→detail |
| **Mutate** | **N/A honest** | No Thêm/Sửa/Xóa CTA; banner forbids mutate |
| **Product DONE** | **⚪** | Keep deferred — do **not** promote UF 🟢 |

---

## Click path (browser — dedicated tab)

1. Login `ceo@xe.vn` → Command Center HRM  
2. Sidebar **Công cụ & thiết bị** (`aria-current`)  
3. Program URL `…/tools_equipment` soft-resolves to `…/tools-equipment`  
4. Iframe: `http://14.225.217.232:8088/hr/tools-equipment?portal=1&tenantId=xevn&companyId=main&_v=…`  
5. Observe scope chip: «Phạm vi HRM embed: xevn / main · Tập đoàn (rollup pilot)» · «Tất cả đơn vị (rollup)»

**Screenshot:** `docs/qa/evidence/p1-hrm-menu-tools_equipment-20260717.png`

---

## U65 honest deferred state (observed)

| Check | Result |
|-------|--------|
| Subtitle | «…(**chỉ xem — API CCDC đang triển khai**)» |
| Banner `data-testid=tools-deferred-banner` | «Thêm/sửa/xóa CCDC và phiếu cấp phát chưa hỗ trợ — module đang chờ API HRM (**Phase 2**).» |
| KPI cards | **0** Tổng số / Đang dùng / Bảo trì / Hư hỏng |
| Thêm CCDC / stub toast | **Absent** — no Add CTA; no success toast on load |
| Fake list rows | **None** |
| Matrix alignment | **PASS** vs Deferred — UI does **not** pretend live CRUD API |

Code SoT (workspace):

- `apps/web/hrm/src/hooks/useToolsEquipment.ts` — `TOOLS_READ_ONLY`; queries return `[]`; **no** mutate exports / fake toasts  
- `apps/web/hrm/src/pages/ToolsEquipment.tsx` — `DeferredNotice`; view-only; `@CODE-MEMORY` cites `D-HRM-TOOLS-STUB-TOAST-01` closed  

---

## Network / API probes (U65 — auxiliary L1)

### Auth

```text
POST /api/xbos/auth/login → 201 XBOS-AUTH-200 · companyId=main
```

### Tools REST (expect absent)

| URL | HTTP |
|-----|------|
| `GET /api/hrm/tools` | **404** |
| `GET /api/hrm/tools-equipment` | **404** |
| `GET /api/hrm/tools_equipment` | **404** |
| `GET /hr/tools-equipment?portal=1&companyId=main` | **200** (SPA shell) |

### Parent shell PerformanceResourceTiming (sample)

| Resource | Status | Notes |
|----------|--------|-------|
| `/hr/tools-equipment?portal=1&tenantId=xevn&companyId=main…` | 200 | iframe document |
| `/api/hrm/` | 200 | health/bootstrap (~45–106 ms) |
| Companion XBOS (tenant-scope, workspace-meta, workflow tasks, …) | 200 | portal shell — not tools module |

**No** tools list/create POST observed. Prior evidence’s employees×12 fan-out for assignment picker **not** re-confirmed on this retest (hook no longer pulls employees for stub forms).

---

## Console

| Class | Result |
|-------|--------|
| Portal ERROR / Sync ERROR banner | **None** |
| `54321` / ECONNREFUSED | **None** in resource log |
| React duplicate-key (tools list) | **N/A** — empty list, no row keys |
| Automation note | Iframe DOM not readable via a11y snapshot; honesty verified via **screenshot** + parent URL/iframe `src` + code SoT |

---

## Defect / residual

| ID | Sev | Status | Owner | Notes |
|----|-----|--------|-------|-------|
| **D-HRM-TOOLS-STUB-TOAST-01** | P2 | **CLOSED** | — | View-only + deferred banner on `:8088` |
| **R-FID-02 / GWC-HRM-TOOLS-01** | GWC | **OPEN (product)** | PM / Phase-2 BE | No Nest tools API — fidelity deferred until Phase 2 |
| URL alias | Info | OK | — | `tools_equipment` ↔ `tools-equipment` both land on embed |

**No P0** on this menu.

---

## Handoff

- **completion_report:** Tools menu QA closed for wave. L0 **PASS**; U65 honest deferred **PASS** (Phase-2 banner + zeros + no stub toast); tools REST **404** as expected; product remains **⚪ DEFERRED**. Stub-toast residual **CLOSED**.
- **next_owner:** `pm`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-hrm-menu-tools_equipment-20260717.md`
- **next_dispatch_prompt:** |
    Intake P1-HRM-MENU-QA-TOOLS PASS_TO_PM. Roster Tools = ⚪ deferred + evidence path.
    GWC-HRM-TOOLS-01 stays open for Phase-2 Nest tools API (not FE honesty).
    Do not promote tools menu to 🟢 UF/fidelity. D-HRM-TOOLS-STUB-TOAST-01 CLOSED — no FE re-dispatch for toast.
- **pm_dispatch_hint:** Tools evidence ⚪ deferred honest UI PASS; no FE stub-toast fix needed
