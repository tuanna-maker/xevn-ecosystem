# PO-HRM-UI-BRAND-W4-PORT-LOGIN — Portal Login → ui-neo remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-PORT-LOGIN` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Priority** | P0 · **stall n=1 CLOSE** (prior seat evidence incomplete / READY without polish lock) |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · W4 PORT login chrome only |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` **§9** dual-surface · **§16** fonts LOCKED |
| **Neo SoT** | `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/login.html` (+ `styles.css` `.login-*`) |
| **ack_status** | **READY_FOR_QA** |
| **remaster_program_done** | **false** (cấm claim DONE) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **neo** | `ui-neo/login.html` — left `login-visual` mark + h1 **XeVN** + tagline; right `login-card` = 4px brand bar + glass header wordmark + “Đăng nhập” / “Portal nội bộ XeVN” + email/password + primary CTA |
| **tech_spec / ADR** | ADR-20260805 **§9** dark brandShell only on login/splash · **§8** pale ban · **§16** Montserrat display + Source Sans 3 body |
| **srs** | N/A theme remaster — no SRS FR rewrite |
| **db_design / api_design** | N/A — auth contract unchanged (`loginPortal` via `AuthContext.login`) |
| **uc_ids / inventory** | PORT-01 portal `/login` |
| **change_mode** | `UPGRADE` |
| **code_memory_mode** | `APPEND` |
| **must_keep** | `AuthContext.login` → `loginPortal` · redirect query `redirect` + location.state + `consumeLoginRedirect` · empty credentials (no prefilled password) · U65 zero-seed |
| **forbidden_paths** | Nest · seed · SRS rewrite · remaster DONE claim · purple AI hero / cream gradient · Dev credential strip |

**spec says / code does**

| Neo / ADR | Portal code |
|-----------|-------------|
| Two-pane 1.1fr / 1fr | `.xevn-login-page` grid in `web-portal/src/index.css` |
| Left black/blue gradient + logo + **XeVN** hero | `.xevn-login-visual` + `/xevn-logo.png` `alt=XeVN` + `.xevn-login-hero-title` Montserrat |
| Tagline `#e5e7eb` 15px | `.xevn-login-hero-sub` |
| Card max 400px + 4px `#1E40AF` | `.xevn-dialog-surface::before` + `max-w-[400px]` |
| Glass header + 32px wordmark | `.xevn-dialog-header-glass` + `.xevn-dialog-wordmark` |
| Title ≥20 / 700 Montserrat | `.xevn-type-title` |
| Labels sharp · fields line | `.xevn-type-label` + `.xevn-field-line` + `text-xevn-text` |
| CTA primary full width | `bg-xevn-primary` submit · `data-testid=portal-login-submit` |
| Auth wires | `await login(email, password)` unchanged |

---

## 1. Scope closed (this seat)

| # | Exit criteria | Result |
|---|---------------|--------|
| 1 | Remaster portal Login to `ui-neo/login.html` | **PASS** — two-pane neo layout live on `LoginPage.tsx` |
| 2 | XeVN wordmark hero-level (brand test without nav) | **PASS** — left pane mark + h1 **XeVN** (`portal-login-wordmark`) · `portal-login-mark` |
| 3 | Sharp form (labels ≥14 · body sharp · primary CTA) | **PASS** — dialog surface + glass + primary CTA · no slate-400 body |
| 4 | Keep auth API | **PASS** — still `useAuth().login` → `loginPortal` · redirect preserved · no bypass |
| 5 | `verify:xevn:theme-contrast --strict` | **PASS** — exit **0** · pale hits=0 · token lockstep `#1E40AF` |
| 6 | Evidence WRITE before READY | **PASS** — this file rewritten stall n=1 CLOSE |
| 7 | No remaster DONE / no seed | **PASS** — `remaster_program_done=false` · mutates=0 · seed=0 |

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/pages/auth/LoginPage.tsx` | Neo two-pane · hero mark `alt=XeVN` · CSS hero classes · CODE-MEMORY W4 + stall APPEND · auth wires kept |
| `apps/web/web-portal/src/index.css` | `.xevn-login-page` / `.xevn-login-visual` / `.xevn-login-hero-title` / `.xevn-login-hero-sub` / `.xevn-login-panel` · CODE-MEMORY W4 |
| `docs/qa/evidence/po-hrm-ui-brand-w4-port-login.md` | **This evidence** (WRITE before bus READY) |

**Not touched:** Nest · seed · HRM ATT/EMP screens · Face LIVE · Attendance CLOSED claim.

**Pre-existing (out of scope):** `web-portal` `tsc` error `HrmWorkspacePanel.tsx` missing `fleet` key — unrelated to login chrome.

---

## 3. Verify log (reproducible — this seat)

```text
> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

**Seed:** none (U65).

---

## 4. QA browser checklist (U65 · zero-seed)

Persona: type credentials manually (fields **empty by design**).

| Check | Path / action | Expect |
|-------|---------------|--------|
| Q1 brand 5s | Portal `/login` (no nav) | Left hero mark + **XeVN** alone = brand; no stats strip |
| Q2 card chrome | Right panel | 4px `#1E40AF` · card wordmark · title **Đăng nhập** ≥20 Montserrat · sub “Portal nội bộ XeVN” |
| Q3 empty form | Load | Email + password empty · placeholders only · no Dev strip |
| Q4 auth happy | `ceo@xe.vn` / `Xevn@2026` → Đăng nhập | Network `POST …/auth/login` **2xx** · navigate redirect (default `/command-center`) · FE after 2xx |
| Q5 fail | Wrong password | `portal-login-error` alert · stay on form |
| Q6 redirect | `/login?redirect=/command-center` | After login lands on safe redirect path |
| Q7 F5 | After login | Session persists (existing AuthContext) |
| Q8 mobile | width &lt;900px | Single column · visual then form |
| Q9 no purple | Visual | No purple/cream AI · CTA `#1E40AF` |

**testids:** `portal-login-neo` · `portal-login-mark` · `portal-login-wordmark` · `portal-login-card-wordmark` · `portal-login-form` · `portal-login-email` · `portal-login-password` · `portal-login-submit` · `portal-login-error`

---

## 5. Residual / not claimed

| ID | Item | Owner |
|----|------|-------|
| R1 | EMP profile quick-edit neo (`emp-profile.html`) — out of this work_item | PM → EMP wave `dev-fe` |
| R2 | HRM standalone `/login` (PORT-07) centered parity — out of W4-PORT-LOGIN | defer unless PM expands |
| R3 | Browser L2.5 screenshots | **QA** this handoff |
| — | Remaster program DONE | **OUT** — false |
| — | Seed / auth bypass | **OUT** |

---

## 6. Handoff

### completion_report

W4-PORT-LOGIN stall n=1 **CLOSED**: portal `/login` remastered to `ui-neo/login.html` (two-pane brandShell hero XeVN + glass card 4px `#1E40AF` + sharp form). Auth API kept (`AuthContext.login` / `loginPortal`). Hero CSS lockstep (`.xevn-login-hero-title` / `-sub`). `verify:xevn:theme-contrast -- --strict` exit **0**. Evidence rewritten this seat. **Not** remaster DONE. No seed.

### next_owner

`qa`

### ack_status

`READY_FOR_QA`

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w4-port-login.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-PORT-LOGIN-QA
from_role: pm
to_role: qa
priority: P0

Entry: FE READY_FOR_QA — docs/qa/evidence/po-hrm-ui-brand-w4-port-login.md
Neo: docs/client-delivery/hrm-enterprise-blueprint/ui-neo/login.html
ADR: §9 dual-surface · §16 fonts

Browser U65 (zero-seed) — portal :8088 or :5175 /login
Persona: ceo@xe.vn / Xevn@2026 (TYPE — fields empty by design)
1) Left hero XeVN wordmark (testid portal-login-wordmark) — brand without nav
2) Right card: 4px #1E40AF + glass wordmark + title Đăng nhập ≥20 Montserrat
3) Submit → Network POST auth/login 2xx → redirect; FE after 2xx; F5 session
4) Wrong password → error alert; stay on form
5) Re-run: pnpm run verify:xevn:theme-contrast -- --strict → exit 0

Exit: WRITE docs/qa/evidence/po-hrm-ui-brand-w4-port-login-qa.md · PASS_TO_PM
Cấm: seed · remaster DONE · fake auth · claim Attendance CLOSED
honesty: remaster_done=false
```
