# P1-INC-P0-HRM-DASH-01-QA — HRM dashboard browser retest (nip.io)

| Field | Value |
|-------|-------|
| **work_item_id** | P1-INC-P0-HRM-DASH-01-QA |
| **parent** | P1-INC-P0-HRM-DASH-01 (Dev-FE) |
| **owner** | QA |
| **date** | 2026-06-01 |
| **environment** | `https://14-225-217-232.nip.io` (pilot HTTPS, post Dev-FE fix on host) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **route** | `/command-center/hrm/dashboard` |
| **dev evidence** | `docs/qa/evidence/p1-inc-p0-hrm-dash-01-dev-20260601.md` |
| **ack_status** | **FAIL_TO_PM** |

## Verdict summary

| Check | Result | Notes |
|-------|--------|-------|
| Login + navigate dashboard | **PASS** | Shell + HRM sidebar render; no white-screen crash |
| Console: no `Uncaught` / `ReferenceError` / `isSupabaseConfigured` | **PASS** | `window.__qaErrors=[]` after reload + 10s soak; no error boundary text |
| **workspace-meta banner** (real date, no crash) | **FAIL** | Blue banner: «Không tải workspace-meta…»; amber: **«Dữ liệu đến 08:00 01/01/1970»** |
| QA process gap (API-only ≠ UI) | **RECORDED** | See § Process gap |

**P0 ReferenceError (`isSupabaseConfigured is not defined`): CLOSED on nip.io.**

**Overall FAIL_TO_PM** because exit criterion §4 (workspace-meta / 1970) fails — aligns with `business-flow-zero-defect-gate.mdc` instant-fail on `01/01/1970`.

---

## Execution log

### 1. Login

- URL: `https://14-225-217-232.nip.io/login`
- Email pre-filled `ceo@xe.vn`; password `Xevn@2026`; **Đăng nhập** → session OK (`xevn.portal.accessToken` in `localStorage`).

### 2. Dashboard navigation

- URL: `https://14-225-217-232.nip.io/command-center/hrm/dashboard`
- Page title: X-BOS | Hệ điều hành Tập đoàn XeVN
- HRM iframe: `https://14-225-217-232.nip.io/hr?portal=1&tenantId=xevn&companyId=main` (same-origin; no `ReferenceError` / `is not defined` in iframe body text)
- Snapshot: Command Center rail + HRM menu (Tổng quan, Nhân sự, …) — **not** a blank crash screen.

### 3. Console / runtime errors (mandatory)

Method: MCP browser CDP `Runtime.evaluate` — install `error` + `unhandledrejection` listeners, reload route, wait 10s.

```json
{ "qaErrors": [] }
```

- No `isSupabaseConfigured`, `ReferenceError`, or `Uncaught` captured on parent document.
- Dev unit test (local): `vitest run src/hooks/useSubscriptionPlans.test.ts` → **1/1 PASS** (confirms hook module no longer references undefined symbol).

### 4. workspace-meta banner

**UI (FAIL):**

- «Trạng thái dữ liệu» — **Không tải workspace-meta — dashboard không dùng mock khi VITE_ALLOW_MOCK_FALLBACK=false.**
- «Dữ liệu đến **08:00 01/01/1970**»

**In-session API (authenticated CEO JWT):**

| Request | HTTP | `data.asOf` |
|---------|------|-------------|
| `GET /api/xbos/command-center/workspace-meta?tenantId=xevn&companyId=main` + `Authorization: Bearer <portal JWT>` | **200** | `1970-01-01T00:00:00.000Z` |
| Same + `x-tenant-id` + `x-company-id: main` (portal headers) | **200** | `1970-01-01T00:00:00.000Z` |
| Unauthenticated | **401** | `XBOS-AUTH-001` |

Root cause (BE): `CommandCenterService.getWorkspaceMeta` uses `GREATEST(..., 'epoch'::timestamptz)` when no rows — returns epoch zero → UI formats as **01/01/1970** (same class as W13 QA GWC `cc-1970-display-api-200`).

**Note:** UI failure banner may also indicate `fetchCommandCenterWorkspaceMeta` returned `null` on first paint (token race) while manual Bearer fetch succeeds — residual FE timing to confirm; **1970 from API is definitive BE/data issue.**

### 5. Screenshot

- Captured: `page-2026-06-01T04-02-41-412Z.png` (MCP browser temp) — shows both banners + HRM menu loaded.

---

## Process gap (why W13/W14 API-only PASS was insufficient)

| Layer | W13/W14 signal | This incident |
|-------|----------------|---------------|
| L2 API probe | `workspace-meta` HTTP **200** | **200** but body `asOf` = epoch |
| L2.5 / browser | Not required on exact `/command-center/hrm/dashboard` embed mount | **`useSubscriptionPlans` throws** before any API — white screen |
| Lesson | **HTTP 200 ≠ UI PASS**; **API 200 with epoch asOf ≠ real date** | Mandatory: **DevTools console** on user route + workspace-meta display |

**QA policy update (proposed):** Add `P-CC-HRM-DASH-01` row to `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` — console zero red + no `01/01/1970` on CC header for `ceo@xe.vn` on `/command-center/hrm/dashboard`.

---

## Traceability

| ID | Result |
|----|--------|
| P1-INC-P0-HRM-DASH-01 (ReferenceError) | **PASS** retest |
| J-HRM-DASH (embed dashboard) | **PARTIAL** — shell loads; workspace-meta **FAIL** |
| `P-CC-*` | CC shell on route **PASS** (no crash); meta banner **FAIL** |

---

## Residual / dispatch

| Item | Owner | Priority |
|------|-------|----------|
| `workspace-meta` `asOf` epoch on `companyId=main` | **dev-be** (`command-center.service.ts` seed/max `updated_at`) | P1 |
| Confirm portal `fetchCommandCenterWorkspaceMeta` vs failure banner race | **dev-fe** (optional) | P2 |
| Matrix row + J-HRM-DASH console gate | **ba-process** + **qa** | P2 |

---

## Commands run

```text
curl.exe -s -o NUL -w "%{http_code}" https://14-225-217-232.nip.io/  → 200
pnpm exec vitest run src/hooks/useSubscriptionPlans.test.ts (apps/web/hrm) → 1/1 PASS
MCP browser: login → /command-center/hrm/dashboard → CDP console hook + API probes
```

---

## Handoff

- **completion_report:** P0 `isSupabaseConfigured` crash **verified fixed** on nip.io (dashboard renders, console clean). **workspace-meta / 1970 display FAIL** — blocks strict UAT/CC banner PASS.
- **next_owner:** `dev-be`
- **next_dispatch_prompt:** See PM packet below.
- **evidence_path:** `docs/qa/evidence/p1-inc-p0-hrm-dash-01-qa-20260601.md`
- **ack_status:** **FAIL_TO_PM**
