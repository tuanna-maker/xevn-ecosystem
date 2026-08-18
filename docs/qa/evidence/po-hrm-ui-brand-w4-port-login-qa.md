# PO-HRM-UI-BRAND-W4-PORT-LOGIN-QA — Portal Login neo brand

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-PORT-LOGIN-QA` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **Date** | 2026-08-05 |
| **Lane** | execution · U65 zero-seed · browser FE flow |
| **FE entry** | `docs/qa/evidence/po-hrm-ui-brand-w4-port-login.md` **READY_FOR_QA** |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` §9 dual-surface · §16 fonts |
| **Neo SoT** | `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/login.html` |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` — **typed** (fields empty by design · no prefill) |
| **URL** | `http://127.0.0.1:5173/login` |
| **Commit** | `dc930c5` |
| **ack_status** | **PASS_TO_PM** |
| **remaster_program_done** | **false** |

---

## 1. Scope

| In scope | Out of scope (cấm claim) |
|----------|--------------------------|
| Portal `/login` neo two-pane brand | Remaster DONE / 177-screen CLOSED |
| Glass card 4px `#1E40AF` + wordmark | Attendance CLOSED · Face LIVE invent |
| CTA primary · no purple/cream AI applied | Fake auth bypass / seed |
| Login POST 2xx → land · F5 session | EMP profile quick-edit (FE residual R1) |
| `theme-contrast --strict` exit 0 | Product / QC GO |

**Seed:** none (U65). **Mutates:** 0 (auth login only — production path).

---

## 2. L0 + OBS restore

| Probe | Result |
|-------|--------|
| Pre-run `:5173/login` | **ECONNREFUSED** (OBS — process missing) |
| Restore | `pnpm --filter web-portal exec vite --port 5173 --host 127.0.0.1` |
| Post-restore `:5173/login` | **200** |
| xbos-api `:28002/api/xbos` | **200** |
| POST `/api/xbos/auth/login` (API smoke) | **201** |

---

## 3. Theme contrast (AC5)

```text
> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## 4. Browser UF (U65)

**Harness:** `scripts/qa/_tmp-po-hrm-ui-brand-w4-port-login-qa.mjs`  
**Machine log:** `docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-port-login-qa-browser.json`  
**Screens:** `docs/qa/evidence/screens/po-hrm-ui-brand-w4-port-login-qa/`

| # | AC | Click path / assert | Result |
|---|----|---------------------|--------|
| 1 | Left hero XeVN / brandShell | Open `/login` (cleared storage) · `[data-testid=portal-login-neo]` · wordmark **XeVN** · visual/page bg `#000000` | **PASS** |
| 2 | Right glass card 4px `#1E40AF` + wordmark | `.xevn-dialog-surface::before` height **4px** bg **#1E40AF** · `.xevn-dialog-header-glass` · card wordmark · title **Đăng nhập** | **PASS** |
| 3 | CTA primary · no purple/cream AI | Submit computed bg **#1E40AF** · computed-style purple/cream hits on login tree **0** (unused Tailwind `.bg-purple-*` in CSS bundle ignored) | **PASS** |
| — | Fields empty by design | Email/password `value=""` · no Dev credential strip | **PASS** |
| 4 | Login POST → land · F5 | Type `ceo@xe.vn` / `Xevn@2026` → Đăng nhập · Network `POST /api/xbos/auth/login` **201** · land `/command-center` · F5 stays `/command-center` | **PASS** |
| 5 | theme-contrast `--strict` | exit **0** | **PASS** |

### Screenshots

| File | Moment |
|------|--------|
| `…/W4-PORT-LOGIN-load.png` | Empty form · two-pane neo |
| `…/W4-PORT-LOGIN-after-auth.png` | Post-login Command Center |
| `…/W4-PORT-LOGIN-f5.png` | After F5 session hold |

### Console / pageErrors

| Class | Count |
|-------|------:|
| `pageErrors` | **0** |
| console errors (blocking) | **0** |

---

## 5. Matrix rollup

| # | Exit criteria | Result |
|---|---------------|--------|
| 1 | Left hero XeVN brandShell | **PASS** |
| 2 | Right glass 4px `#1E40AF` + wordmark | **PASS** |
| 3 | CTA `#1E40AF` · no purple/cream AI applied | **PASS** |
| 4 | POST login 2xx → land · F5 session | **PASS** (201 → `/command-center`) |
| 5 | `theme-contrast --strict` exit 0 | **PASS** |
| 6 | Evidence WRITE before finish | **PASS** (this file) |

**Checks: 6/6 · Overall: PASS**

---

## 6. Residual (not blockers)

| ID | Item | Owner |
|----|------|-------|
| R1 | EMP profile quick-edit neo — deferred FE residual | PM → `dev-fe` EMP wave |
| R2 | HRM standalone `/login` centered (PORT-07) — out of W4 PORT scope | defer |
| OBS | Portal `:5173` was down at QA start — restored in-session | DevOps if flaky again |

---

## 7. Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W4-PORT-LOGIN-QA
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-port-login-qa.md
machine_log: docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-port-login-qa-browser.json
next_owner: pm
remaster_program_done: false
seed: false
mutates: 0
```

### completion_report

Closed W4 portal login brand QA on `:5173` after OBS restore. AC1–AC5 PASS (hero wordmark, glass 4px primary bar, CTA `#1E40AF`, POST login 201 + F5 session, theme-contrast strict 0). U65 honored — credentials typed into empty fields; no seed / no remaster DONE / Attendance CLOSED / Face LIVE not claimed.

### next_owner

`pm`

### next_dispatch_prompt

```text
Task pm INTAKE PO-HRM-UI-BRAND-W4-PORT-LOGIN-QA PASS_TO_PM
evidence: docs/qa/evidence/po-hrm-ui-brand-w4-port-login-qa.md · checks 6/6
residual: R1 EMP profile neo defer · R2 HRM standalone login out of scope · OBS :5173 restore documented
cấm claim: remaster DONE · Attendance CLOSED · Face LIVE
next: dispatch next open W4/brand work_item from backlog (or QC only if PM promotes wave gate) — do not re-QA this UF without code delta
```
