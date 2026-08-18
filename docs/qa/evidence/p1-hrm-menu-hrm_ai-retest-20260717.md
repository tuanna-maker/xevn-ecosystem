# P1-HRM-MENU-QA-HRM-AI-RETEST — UniAI menu QA retest (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-HRM-AI-RETEST` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **program** | `docs/program/P1-HRM-FULL-MENU-QA-PROGRAM.md` |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` · Group CEO · `companyId=main` · role BOD |
| **menu** | UniAI · route `/command-center/hrm/hrm_ai` → canonical `/command-center/hrm/ai` |
| **mode** | **non-transactional** (no mutate / no Lưu AC) |
| **U65** | zero-seed · browser-only · FE shell + console + mock policy |
| **prior FAIL** | `docs/qa/evidence/p1-hrm-menu-hrm_ai-20260717.md` (HTTP 429 banner + stuck loading) |
| **entry fix** | `D-P1-HRM-RATE-429` — `HRM_RATE_LIMIT_MAX=10000` / 60s (`docs/qa/evidence/d-p1-hrm-rate-429-20260717.md`) |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |

---

## Verdict matrix

| Gate | Result | Notes |
|------|--------|-------|
| **L0 shell** | **PASS** | Portal chrome + HRM sidebar + UniAI `aria-current=page`; iframe `/hr/ai` settled |
| **L0 no ERROR / 429 banner** | **PASS** | No `HRM API trả HTTP 429` / Sync ERROR on parent document |
| **L0 loading clears** | **PASS** | «Đang tải module HRM…» **not** present after settle |
| **UniAI shell visible** | **PASS** | Screenshot: **UniAI - Trợ lý AI thông minh** + **UniAI Smart Assistant** card (robot + CTA) |
| **L0 no 409 / 54321** | **PASS** | Not observed |
| **Console `error` (parent)** | **PASS** | CDP hook: `consoleErrors: []` |
| **Network primary** | **PASS** | `/api/hrm/` ×2 → **200**, transferSize **457** (was size **404** under prior 429 FAIL) |
| **Embed HTML** | **PASS** | `GET /hr/ai?portal=1&tenantId=xevn&companyId=main` → **200**, size ~1700 |
| **Rate-limit live** | **PASS** | Probe `x-ratelimit-limit: 10000`, remaining ~9993+ |
| **No misleading mock as real data** | **PASS** | No fabricated «Phiên gần đây» rows; welcome shell only |
| **L2.5 J-*** | **N/A** | Non-transactional; no list→detail for UniAI in journey map |
| **Mutate** | **N/A** | Out of scope |

**Overall:** **PASS** — prior P0 `D-P1-HRM-AI-429-01` cleared on retest after rate-limit raise.

---

## Click path (U65)

1. Session `ceo@xe.vn` (BOD) already authenticated on `:8088`
2. Dedicated browser tab → `http://14.225.217.232:8088/command-center/hrm/hrm_ai`
3. Soft-canonical URL settle: `/command-center/hrm/ai`
4. Confirm sidebar **UniAI** `aria-current=page`
5. Observe embed iframe `/hr/ai?portal=1&tenantId=xevn&companyId=main&_v=…`
6. Confirm UniAI title + Smart Assistant card; no seed / no mutate

Final URL: `http://14.225.217.232:8088/command-center/hrm/ai`

---

## UI observations

### Portal shell (PASS)

- Header: X-BOS Unified Portal · Command Center · persona **BOD**
- Scope bar: `Phạm vi HRM embed: xevn / main · Tập đoàn (rollup pilot)`
- Operating unit filter: **Tất cả đơn vị (rollup)**
- UniAI nav: **current**

### Main pane / UniAI shell (PASS)

- Title: **UniAI - Trợ lý AI thông minh**
- Subtitle: tận dụng AI cho nghiệp vụ nhân sự
- Card: **UniAI Smart Assistant** + robot illustration + «Chọn một tính năng bên dưới để bắt đầu»
- No ERROR banner; loading overlay cleared

### Mock policy (PASS)

- No fake chat/session history presented as live API data
- Welcome / feature-picker shell only

---

## Network / performance (parent document)

| Endpoint | Observed | Note |
|----------|----------|------|
| `/api/hrm/` | **200** ×2, size **457**, dur ~130–171 ms | Health OK; **no 429** |
| `/hr/ai?portal=1&tenantId=xevn&companyId=main&_v=…` | **200**, size ~1700, dur ~128 ms | Embed shell HTML OK |
| Live header probe (curl) | `HTTP/1.1 200` · `x-ratelimit-limit: 10000` | Aligns `D-P1-HRM-RATE-429` |

**vs prior FAIL:** health transferSize was **404** with UI banner HTTP 429; now **200**/457 with UniAI shell rendered.

---

## Console excerpt (parent)

```
consoleErrors: []
has429: false
hasLoading: false
iframeOk: true
```

No `duplicate key`, no `ERR_CONNECTION_REFUSED`, no uncaught window.error in hook window.

---

## Defects

| ID | Prior | Retest |
|----|-------|--------|
| **D-P1-HRM-AI-429-01** | P0 L0 FAIL (429 banner + stuck loading) | **CLOSED** — no 429; shell visible |
| D-P1-HRM-AI-PERF-01 | P1 XBOS latency >3s under concurrent wave | **Deferred / residual** — not blocking UniAI L0 retest; not re-measured this exclusive tab |

---

## Residual / not promoted

- Deep UniAI feature tabs (chat / extract / generate) **not** exercised (non-transactional shell gate only)
- Member-CEO persona **not** run (N/A for this shell AC)
- Concurrent shared-tab interference observed earlier (soft-nav to settings) — retest used **dedicated tab** to isolate U65 path

---

## completion_report

**Closed:** U65 browser retest UniAI on `:8088` after `D-P1-HRM-RATE-429` — no 429/ERROR banner; loading cleared; UniAI shell visible; `/api/hrm/` 200; console error=0; no mock-as-real; prior P0 closed.  
**Open:** P1 perf residual under heavy concurrent menu QA (optional NFR); feature-tab depth out of scope.

## next_owner

`pm` — promote UniAI menu row PASS in full-menu program; optional `qc` if wave gate needs UniAI closure

## next_dispatch_prompt

```text
work_item_id: P1-HRM-MENU-QA-HRM-AI-RETEST
from_role: qa | to_role: pm
ack_status: PASS_TO_PM
evidence: docs/qa/evidence/p1-hrm-menu-hrm_ai-retest-20260717.md
action: Mark UniAI / hrm_ai menu PASS in P1-HRM-FULL-MENU-QA roster; close D-P1-HRM-AI-429-01; continue remaining menu FAIL residuals (settings/contracts/reports if still open) — do not re-open UniAI unless regression.
```

## pm_dispatch_hint

Promote `hrm_ai` PASS; next open menu defects from parallel wave (not UniAI).

---

## Evidence artifacts

- This file: `docs/qa/evidence/p1-hrm-menu-hrm_ai-retest-20260717.md`
- Screenshot (agent): `page-2026-07-17T03-09-43-123Z.png` — UniAI shell + no 429
- Prior FAIL: `docs/qa/evidence/p1-hrm-menu-hrm_ai-20260717.md`
- Rate-limit fix: `docs/qa/evidence/d-p1-hrm-rate-429-20260717.md`
