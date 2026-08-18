# XEVN-THM-DO-SYNC-FE-W1-01 — Local FE-W1 theme → pilot :8088

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-DO-SYNC-FE-W1-01` |
| **Date** | 2026-07-22 |
| **Owner** | devops |
| **from_role** | pm |
| **Program** | `P1-XEVN-THEME-REMASTER` FE-W1 sync |
| **spec_ref** | QA `xevn-thm-qa-w1-20260722.md` §3.4 (VPS pre-FE-W1) · FE `xevn-thm-fe-w1-20260722.md` |
| **entry** | Local uncommitted FE-W1 + FE-W1-HRM; QA localhost:5173 PASS; VPS TopHeader Jul 17 no `portal-brand-mark` |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed; no `docker compose down`; non-xevn left Up |
| **method** | **tar + pscp** from local workspace — **not** `git pull` |

---

## 1. Verdict

| Gate | Result |
|------|--------|
| Sync local `apps/web/web-portal/**` + `apps/web/hrm/**` to `/opt/xevn-ecosystem` | **PASS** |
| Restart `portal-fe` + `hrm-fe` only | **PASS** |
| HTTP `http://14.225.217.232:8088/` → 200 | **PASS** |
| Served TopHeader contains `data-testid=portal-brand-mark` + wordmark XeVN + `/xevn-logo.png` | **PASS** |
| `/xevn-logo.png` → 200 | **PASS** |
| Non-xevn containers still Up | **PASS** (ytexa_*, hsbx_*, asms_*, viconnec_*) |
| Phase1 DONE claim | **not claimed** |

**Overall: READY_FOR_QA** — sponsor/pilot `:8088` now serves FE-W1 TopHeader source. QA must hard-refresh browser and retest brand mark in DOM (login → unlock → `/dashboard/organization` or MainLayout path per QA-W1).

---

## 2. Why not git pull

- FE-W1 remaster is **local dirty / uncommitted** (`TopHeader.tsx` + portal/HRM trees).
- VPS `git pull origin main` would **not** deliver remaster.
- PM correction: sync via **rsync/scp/plink** from workspace.

Pre-sync VPS TopHeader: `Jul 17 03:45`, **no** `portal-brand-mark` (QA §3.4).

Post-sync: `Jul 22 22:11` local mtime on VPS; line 103 `data-testid="portal-brand-mark"`.

---

## 3. Steps executed

1. Audit: `xevn-portal-fe-dev` Up `:8088→5173`; TopHeader pre-FE-W1.
2. Stage local trees → `/tmp/xevn-thm-fe-w1-sync.tgz` (~3.8 MB, 801 paths):
   - `apps/web/web-portal/src/**`
   - `apps/web/web-portal/tailwind.config.cjs`
   - `apps/web/web-portal/public/xevn-logo.png`
   - `apps/web/hrm/src/**`
   - `apps/web/hrm/tailwind.config.ts`
3. `pscp` → `root@14.225.217.232:/tmp/…tgz`
4. Extract over `/opt/xevn-ecosystem`; remove deleted `HrmEmbedScopeBar.tsx` / `PortalEmbedScopeBar.tsx`
5. `docker compose restart portal-fe hrm-fe` (no `down`, no unrelated recreate)
6. Smoke + Vite source probe

---

## 4. Proof (hard-refresh / curl)

### 4.1 Public Vite-served source (from Windows host)

```text
GET http://14.225.217.232:8088/src/components/layout/TopHeader.tsx
→ HTTP 200
→ contains: data-testid="portal-brand-mark"
→ contains: aria-label="XeVN — về Command Center"
→ contains: src="/xevn-logo.png"
→ contains: wordmark XeVN
```

Transformed snippet observed (Vite JSX):

```text
"data-testid": "portal-brand-mark",
"aria-label": "XeVN — về Command Center",
```

### 4.2 Assets / routes

| URL | Code |
|-----|------|
| `http://14.225.217.232:8088/` | 200 |
| `http://14.225.217.232:8088/command-center` | 200 |
| `http://14.225.217.232:8088/xevn-logo.png` | 200 |
| `http://14.225.217.232:8080/` (hrm-fe) | 302 (SPA OK) |

### 4.3 Screenshot note

DevOps L0 = file + Vite HTTP marker proof. **QA owns** browser hard-refresh screenshot (`Ctrl+Shift+R`) of TopHeader DOM `portal-brand-mark` after login — same path as `xevn-thm-qa-w1-20260722.md` §3.3 but URL base **`:8088`**.

---

## 5. Residual

| ID | Note |
|----|------|
| Uncommitted on laptop | VPS has overlay copy; commit later so next `git pull` does not regress |
| Browser DOM screenshot | QA retest U65 on :8088 |
| Mobile theme | out of this work_item |
| Full remaster DONE / Phase1 | **not** claimed |

---

## 6. Handoff

```
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/xevn-thm-do-sync-fe-w1-01-20260722.md
pm_dispatch_hint: XEVN-THM-QA-W1-R2-8088 — retest FE-W1 brand on http://14.225.217.232:8088 (hard refresh); assert data-testid=portal-brand-mark + XeVN wordmark + /xevn-logo.png; U65 zero-seed
completion_report: Synced local uncommitted web-portal+hrm theme trees via tar/pscp; restarted portal-fe+hrm-fe; Vite TopHeader on :8088 exposes portal-brand-mark; logo 200; non-xevn untouched.
next_dispatch_prompt: Task qa work_item_id=XEVN-THM-QA-W1-R2-8088. entry: devops READY XEVN-THM-DO-SYNC-FE-W1-01 evidence docs/qa/evidence/xevn-thm-do-sync-fe-w1-01-20260722.md. Browser U65: ceo@xe.vn → http://14.225.217.232:8088 → hard refresh → unlock → /dashboard/organization (or MainLayout). Assert data-testid=portal-brand-mark, wordmark XeVN, img /xevn-logo.png. Optional: CC settings pale check. exit: evidence md + PASS_TO_PM. cấm seed; do not fail on mobile.
```
