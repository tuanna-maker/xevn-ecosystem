# P1-HRM-MENU-QA-HRM-AI — UniAI menu QA (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-HRM-AI` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` · Group CEO · `companyId=main` |
| **menu** | UniAI · route `/command-center/hrm/hrm_ai` |
| **mode** | **non-transactional** (no mutate / no Lưu AC) |
| **U65** | zero-seed · browser-only · FE shell + console + mock policy |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **FAIL** (L0 ERROR banner HTTP 429 — embed stuck loading) |

---

## Verdict matrix

| Gate | Result | Notes |
|------|--------|-------|
| **L0 shell** | **PARTIAL** | Portal chrome + HRM sidebar + UniAI `aria-current` load; main pane stays «Đang tải module HRM…» |
| **L0 no ERROR banner** | **FAIL** | Banner: `HRM API trả HTTP 429. Kiểm tra terminal hrm-api (cổng 28001).` — observed on first settle and after cool-down reload |
| **L0 no 409 / 54321** | **PASS** | Not observed |
| **Console `error` (parent)** | **PASS** | CDP hook: `consoleErrors: []` (no P0 React/runtime red) |
| **Network primary** | **FAIL / env** | `/api/hrm/` transferSize **404** during banner (error body); later probe without concurrent spam returned **200** `HRM-HEALTH-200` |
| **Embed HTML** | **PASS** | `GET /hr/ai?portal=1&tenantId=xevn&companyId=main` → **200** (len ~1374–1716) |
| **No misleading mock as real data** | **PASS** | No fake «Phiên gần đây» rows; UI shows 429 banner + skeleton — not fabricated AI history |
| **L2.5 J-*** | **N/A** | Non-transactional; no list→detail journey for UniAI in `PROGRAM_JOURNEY_MAP` |
| **Mutate** | **N/A** | Out of scope for this menu wave |

**Overall:** **FAIL** — U65 shell/console/mock checks partially OK, but program L0 requires no ERROR banner and module did not finish loading under observed 429.

---

## Click path (U65)

1. Login `ceo@xe.vn` / `Xevn@2026` → redirect `/command-center/hrm/hrm_ai`
2. Confirm sidebar **UniAI** `aria-current`
3. Observe portal shell + embed iframe `/hr/ai?portal=1&tenantId=xevn&companyId=main&_v=…`
4. Observe banner / loading — **no seed**, no API mutate

Final URL: `http://14.225.217.232:8088/command-center/hrm/hrm_ai`

---

## UI observations

### Portal shell (PASS)

- Header: X-BOS Unified Portal · Command Center · persona **BOD**
- HRM collapsible sidebar lists UniAI under Nhân sự group
- UniAI link state: **current**

### Main pane (FAIL to settle)

- Text: `HRM API trả HTTP 429. Kiểm tra terminal hrm-api (cổng 28001).`
- Overlay/skeleton: «Đang tải module HRM…»
- iframe present (`w≈497`, `h≈351`) but contentDocument body empty / not interactive in capture window

### Mock policy (PASS)

- No fabricated chat sessions presented as live data
- Code path for legacy panel uses `API_NOT_AVAILABLE_MESSAGE` («Phân hệ này chưa có API…») for session table — **not** exercised in this embed mode; live route uses `HrmWorkspaceRoute` iframe embed of HRM `/ai`

---

## Network / performance (parent document)

| Endpoint | Observed | Note |
|----------|----------|------|
| `/api/hrm/` | dur **10–29s**, size **404** while banner up | Correlates with HTTP 429 UI |
| `/api/hrm/` (isolated probe, same host) | **200** `HRM-HEALTH-200` | Service healthy when not rate-limited |
| `/hr/ai?portal=1&tenantId=xevn&companyId=main` | **200** | Embed shell HTML OK |
| `/api/xbos/auth/me` | ×2, **3–7s** | P1 dup + slow |
| `/api/xbos/workflow-engine/tasks` | ~**9s**, body ~266–276 KB | P1 slow under concurrent menu wave |
| `/api/xbos/tenant-scope/group-member-units` | ×2, **8–13s** | P1 dup + slow |
| `/api/xbos/position-rbac/matrix` | ×2, **8–13s** | P1 dup + slow |
| `/api/xbos/command-center/workspace-meta` | ×2, **8–13s** | P1 dup + slow |

**P1 residual:** many Command Center APIs **>3s**; duplicate ×2 fetches on several XBOS endpoints during HRM embed mount (aligns prior CD-FB-03 / `P1-HRM-PERF-*` class).

---

## Console excerpt (parent)

```
consoleErrors: []
consoleWarns: []
```

No `duplicate key`, no `ERR_CONNECTION_REFUSED`, no uncaught window.error in hook window.

---

## Defects

| ID | Severity | Summary | Owner hint |
|----|----------|---------|------------|
| **D-P1-HRM-AI-429-01** | **P0** (L0) | UniAI portal route shows HTTP **429** banner; embed stuck «Đang tải module HRM…» during full-menu concurrent QA | devops / hrm-api rate-limit · NFR capacity (`P1-HRM-NFR-1000-SA`) |
| D-P1-HRM-AI-PERF-01 | P1 | XBOS + `/api/hrm/` latency >3s (up to ~29s) on menu open | technical-manager / devops |

**Hypothesis:** concurrent 17-menu QA wave saturates hrm-api rate limiter; isolated health probe returns 200. Still **FAIL** for this menu evidence — user-visible ERROR banner on UniAI.

---

## Residual / not promoted

- Full iframe UniAI feature tabs (chat / extract / generate) **not** verified (iframe empty while 429 / loading)
- Member-CEO scope persona **not** run (N/A for non-transactional shell gate)
- Clean PASS requires retest when `/api/hrm/` returns 2xx **without** 429 banner and embed finishes (loading cleared)

---

## completion_report

**Closed:** Browser U65 QA for UniAI menu on `:8088` — shell/nav, console, mock policy, network timing, 429 defect logged.  
**Open:** L0 FAIL until 429 cleared + embed settle retest; P1 perf residual under concurrent load.

## next_owner

`devops` (rate-limit / hrm-api capacity) → then `qa` retest same `work_item_id` suffix `-RETEST`

## next_dispatch_prompt

```text
work_item_id: P1-HRM-MENU-QA-HRM-AI-RETEST
to_role: qa
entry_criteria: hrm-api on :8088 no longer returns 429 on /api/hrm/ under light load; L0 stack up; U65 zero-seed
exit_criteria: /command-center/hrm/hrm_ai — no ERROR/429 banner; «Đang tải module HRM» clears; UniAI iframe shows HRM AI shell (not blank); console error=0; no mock-as-real; evidence docs/qa/evidence/p1-hrm-menu-hrm_ai-retest-20260717.md
parallel: devops investigate D-P1-HRM-AI-429-01 (rate limit vs crash loop) + P1-HRM-NFR-1000-SA
```

## pm_dispatch_hint

`P1-HRM-MENU-QA-HRM-AI-RETEST` after devops clears 429 — do not mark UniAI menu PASS in program roster until retest.

---

## Evidence artifacts

- This file: `docs/qa/evidence/p1-hrm-menu-hrm_ai-20260717.md`
- Screenshots (agent local): `page-2026-07-17T02-04-10-098Z.png`, `page-2026-07-17T02-08-18-567Z.png` (429 banner + skeleton)
