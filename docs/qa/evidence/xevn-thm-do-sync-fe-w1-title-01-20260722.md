# XEVN-THM-DO-SYNC-FE-W1-TITLE-01 — Title slice → pilot :8088

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-DO-SYNC-FE-W1-TITLE-01` |
| **Date** | 2026-07-22 |
| **Owner** | devops |
| **from_role** | pm |
| **Program** | `P1-XEVN-THEME-REMASTER` C1 title close |
| **spec_ref** | FE `xevn-thm-fe-w1-title-01-20260722.md` · prior sync `xevn-thm-do-sync-fe-w1-01-20260722.md` (TopHeader only — title stale) |
| **entry** | Local title READY; QA title PASS; VPS CC hero still «X-BOS Unified Portal» |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed; no `docker compose down`; non-xevn left Up |
| **method** | **tar + pscp** from local workspace — **not** `git pull` |

---

## 1. Verdict

| Gate | Result |
|------|--------|
| Sync title allow-list to `/opt/xevn-ecosystem` | **PASS** |
| Restart `portal-fe` only | **PASS** |
| HTTP `:8088` portal 200 | **PASS** |
| Vite-served `CommandCenterPage.tsx` hero = **XeVN OS** | **PASS** |
| Served source **no** `X-BOS Unified Portal` | **PASS** |
| `index.html` `<title>` = `XeVN OS \| Command Center` | **PASS** |
| Non-xevn containers still Up | **PASS** |
| Phase1 DONE claim | **not claimed** |

**Overall: READY_FOR_QA** — sponsor/pilot `:8088` now serves CC hero **XeVN OS**. QA must hard-refresh and confirm DOM h1 after login.

---

## 2. Why this sync

Prior `XEVN-THM-DO-SYNC-FE-W1-01` delivered TopHeader remaster but **did not** include title-slice files (or VPS stayed on pre-title tree). Pre-sync VPS host grep:

```text
CommandCenterPage.tsx → X-BOS Unified Portal
index.html → <title>X-BOS | Hệ điều hành Tập đoàn XeVN</title>
UnifiedPortalRedirect.tsx → X-BOS Unified Portal (Command Center)
```

---

## 3. Files synced (allow-list)

| Path | Post-sync marker |
|------|------------------|
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | h1 `XeVN OS` + CODE-MEMORY-CHANGE TITLE-01 |
| `apps/web/web-portal/index.html` | `<title>XeVN OS \| Command Center</title>` |
| `apps/web/x-bos-core/src/components/UnifiedPortalRedirect.tsx` | `XeVN OS (Command Center)` |

Archive: `/tmp/xevn-thm-do-sync-fe-w1-title-01-20260722.tgz` (~79 KB) → extract `-C /opt/xevn-ecosystem`.

---

## 4. Steps executed

1. Audit: `xevn-portal-fe-dev` Up `:8088→5173`; host still old hero strings.
2. Stage 3 local files → tar → `pscp` → VPS `/tmp/…tgz`.
3. `tar -xzf` over `/opt/xevn-ecosystem` (bind-mount).
4. `docker compose --env-file .env restart portal-fe` only (no `down`, no unrelated recreate).
5. Smoke + Vite HTTP source proof from Windows host.

---

## 5. Proof (Vite / HTTP on :8088)

### 5.1 Routes

| URL | Code |
|-----|------|
| `http://14.225.217.232:8088/` | 200 |
| `http://14.225.217.232:8088/command-center` | 200 |
| `http://14.225.217.232:8088/src/pages/command-center/CommandCenterPage.tsx` | 200 |
| `http://14.225.217.232:8088/index.html` | 200 |

### 5.2 Transformed Vite source (Command Center hero)

```text
GET http://14.225.217.232:8088/src/pages/command-center/CommandCenterPage.tsx
→ contains children: "XeVN OS" on h1.page-title
→ does NOT contain "X-BOS Unified Portal"
```

Observed snippet:

```text
jsxDEV("h1", { className: "page-title text-xl font-semibold tracking-tight text-xevn-text", children: "XeVN OS" }, …)
fileName: "/app/apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx"
```

### 5.3 Document title

```text
GET http://14.225.217.232:8088/index.html
→ <title>XeVN OS | Command Center</title>
```

### 5.4 Non-xevn (sample still Up)

`ytexa_*`, `hsbx_*`, `asms_frontend` — Up (no wipe).

---

## 6. Residual

| ID | Note |
|----|------|
| Browser DOM screenshot | QA owns hard-refresh (`Ctrl+Shift+R`) after login `ceo@xe.vn` |
| VPS git HEAD vs pscp drift | defer — bind-mount intentional until commit/push |
| Full theme remaster | out of scope — C1 title only |

---

## 7. Handoff

```yaml
work_item_id: XEVN-THM-DO-SYNC-FE-W1-TITLE-01
from_role: devops
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/xevn-thm-do-sync-fe-w1-title-01-20260722.md
completion_report: Synced 3 title-slice files via tar/pscp; restarted portal-fe; Vite :8088 CommandCenterPage h1=XeVN OS; index title updated; old Unified Portal string absent; non-xevn untouched.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: XEVN-THM-QA-FE-W1-TITLE-01
  from_role: pm
  to_role: qa
  entry_criteria: DevOps READY_FOR_QA — docs/qa/evidence/xevn-thm-do-sync-fe-w1-title-01-20260722.md
  URL: http://14.225.217.232:8088/command-center
  account: ceo@xe.vn / Xevn@2026
  AC:
    1) Hard-refresh (Ctrl+Shift+R) after login
    2) CC hero h1 visible text = XeVN OS (not X-BOS Unified Portal)
    3) Subtitle still Command Center
    4) Tab title contains XeVN OS | Command Center
    5) TopHeader portal-brand-mark + wordmark XeVN still present (no regression)
  cấm: seed; PASS only from curl without browser
  evidence_path: docs/qa/evidence/xevn-thm-qa-fe-w1-title-01-20260722.md
  ack_status: PASS_TO_PM or FAIL_TO_PM
```
