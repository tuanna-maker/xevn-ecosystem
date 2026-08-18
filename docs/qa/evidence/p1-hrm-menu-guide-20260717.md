# P1-HRM-MENU-QA-GUIDE — Hướng dẫn (static) · :8088

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-GUIDE` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` · `tenantId=xevn` |
| **menu** | Hướng dẫn · `/command-center/hrm/guide` · **static** |
| **U65** | zero-seed · browser-only · login → menu → load (no mutate) |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**PASS** — Guide static content loads in HRM embed; title + TOC + section cards visible; no Vite/React error overlay; no console `error`/`warn` observed on hooked post-load probe.

| Gate | Result |
|------|--------|
| L0 tab load (URL deep-link) | **PASS** — `…/command-center/hrm/guide` |
| L2 static UI (title + sections) | **PASS** — «Hướng dẫn sử dụng» + 11 section cards |
| Console red / Vite overlay | **PASS** — none observed (parent + iframe) |
| Network Guide-critical | **PASS** — Guide page is FE static (`guideSections` / i18n); no Guide CRUD API |
| L2.5 J-* | **N/A** — static TOC; no list→detail journey |
| Mutate | **N/A** — static |
| F5 recoverability | **PASS** (content returned) with **residual 429 banner** (env) |

---

## Click path (U65)

1. Login `ceo@xe.vn` / `Xevn@2026` → redirect `?redirect=/command-center/hrm/guide`
2. Portal shell HRM → menu **Hướng dẫn sử dụng** highlighted
3. iframe embed: `/hr/guide?portal=1&tenantId=xevn&companyId=main`
4. Observe static guide (search + category chips + section cards)
5. F5 reload → wait for embed → content still present

**Screenshots**

- First load (clean): `docs/qa/evidence/p1-hrm-menu-guide-20260717-load.png`
- After F5 (429 banner + content): `docs/qa/evidence/p1-hrm-menu-guide-20260717-f5-429.png`

---

## L2 — Static content observed

| UI element | Observed |
|------------|----------|
| Title | **Hướng dẫn sử dụng** |
| Subtitle | **Cách sử dụng hệ thống** — «Hướng dẫn từng bước cho tất cả các module…» |
| Search | placeholder `Tìm kiếm hướng dẫn…` (typed probe `nhân viên` OK) |
| Section cards / TOC | Bắt đầu, Quản lý nhân viên, Chấm công, Tiền lương, Tuyển dụng, Hợp đồng, Bảo hiểm, Công ty, Báo cáo, UniAI, Cài đặt (**11**) |
| iframe title | `UNICOM HRM - Hệ thống quản lý nhân sự` |
| Scope | `companyId=main`, `tenantId=xevn` |

---

## Console

| Check | Result |
|-------|--------|
| Vite error overlay (parent/iframe) | **none** |
| React error boundary marker | **none** |
| Hooked `console.error` / `console.warn` (post-load) | **0** messages |
| DevTools native panel screenshot | **not available** in automation (same SoT as other `:8088` HRM QA waves) |

Noise note: concurrent menu-QA waves on `:8088` may produce unrelated parent fetch noise; no Guide-specific JS exception observed.

---

## Network

| Call | Status | Note |
|------|--------|------|
| Portal `/hr/guide?portal=1&…` embed | **200** (document) | static Guide |
| `GET /api/hrm/` (portal health/bootstrap) | **429** ×2 after F5 | rate-limit under parallel QA |
| `GET /api/hrm/operating-units` (iframe) | **429** ×1 after F5 | non-Guide; embed chrome |
| Guide mutate / list APIs | **none required** | static FE content |

First cold load in this session: **no** ERROR banner; Guide rendered ~12s after iframe mount.

---

## Residual (non-blocking for Guide AC)

| ID | Severity | Finding | Owner |
|----|----------|---------|-------|
| `P1-HRM-MENU-QA-GUIDE-R1` | **P1 env** | After F5 under concurrent `:8088` menu QA, portal banner: «HRM API trả HTTP 429. Kiểm tra terminal hrm-api (cổng 28001).» Static Guide still rendered underneath. | devops / PM (throttle parallel QA or raise rate limit) |

**Not** a Guide content defect — Guide has no transactional API. Do **not** seed to “fix” 429.

---

## Spec / SoT

- Program row: `P1-HRM-MENU-QA-GUIDE` · static · wave-5
- Portal path map: `guide → /guide` (`apps/web/web-portal/src/modules/hrm/paths.ts`)
- HRM page: `apps/web/hrm/src/pages/UserGuide.tsx` + `guideSections`

---

## Handoff

- **ack_status:** `PASS_TO_PM`
- **next_owner:** `pm`
- **completion_report:** Guide menu static QA **PASS** on `:8088`; residual 429 banner under concurrent load noted.
- **pm_dispatch_hint:** Continue wave-5 roster (`P1-HRM-MENU-QA-PERFORMANCE` if open) or aggregate toward `P1-HRM-FULL-MENU-QC` when 17/17 evidence ready; optionally dispatch devops on 429 rate-limit if multiple menus report same banner.
