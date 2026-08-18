# PO-HRM-UI-BRAND-FE-DIALOG-01 — Dialog chrome + fonts + compact fields

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-FE-DIALOG-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Program** | `PO-HRM-UI-BRAND-REMASTER-01` · dialog foundation (not remaster DONE) |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16 LOCKED** (Montserrat + Source Sans 3 · S3=A · B4 cấm AI · ATT 90 path) |
| **Neo SoT** | `docs/client-delivery/hrm-enterprise-blueprint/ui-neo/styles.css` · `dialog-leave.html` · `dialog-ot.html` |
| **ack_status** | **READY_FOR_QA** |
| **stall** | **#3 CLOSE** — prior seats bus-only / evidence MISS; this seat **WRITE** evidence after code + gate |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| ADR §16 | Fonts Display=Montserrat · Body=Source Sans 3 LOCKED · S3=A · B4 no AI purple/cream/glow |
| ADR §15.4 / §10 | Modal: 4px primary brand bar `#1E40AF` · glass header · title ≥20 bold · wordmark slot |
| ui-neo | `styles.css` `.xevn-modal-brand-bar` / `.xevn-modal-header-glass` / `.xevn-field-*` |
| change_mode | UPGRADE / ADD compact wire |
| code_memory_mode | APPEND |
| must_keep | portal a11y mirror · leave/OT mutate wires · Face HOLD · U65 zero-seed · no Nest invent |
| forbidden | seed · Face LIVE · Attendance CLOSED · remaster DONE claim |

---

## 1. Scope closed

| # | Exit | Result |
|---|------|--------|
| 1 | Dialog/DialogContent brand top bar `#1E40AF` | **PASS** — `.xevn-dialog-surface::before` height 4px · `var(--xevn-color-primary)` · HRM + portal |
| 2 | Optional logo slot + glass header title | **PASS** — `DialogHeader` / `AlertDialogHeader` / `ConfirmDialog` → `.xevn-dialog-header-glass` + `/xevn-logo.png` wordmark · title `.xevn-type-title` Montserrat ≥20 |
| 3 | Montserrat + Source Sans 3 | **PASS** — `apps/web/hrm/index.html` + `apps/web/web-portal/index.html` Google fonts link; HRM `@import` in `index.css`; portal top-of-file `@import`; CSS vars `--xevn-font-display` / `--xevn-font-body`; TW `fontFamily.display` / `sans` |
| 4 | Compact field utilities | **PASS** — `.xevn-field-date\|time\|code\|num\|phone\|select-sm\|select-md\|name\|line\|reason` in HRM + portal `index.css` (ui-neo widths) |
| 5 | Leave + OT dialogs wired | **PASS** — Leave create `sm:max-w-[920px]` + field classes + `data-testid=att-leave-create-dialog-precision`; OT add `sm:max-w-[920px]` + date/time/select/reason + `data-testid=att-ot-add-dialog-precision` |
| 6 | `pnpm run verify:xevn:theme-contrast -- --strict` | **PASS** — exit **0** · pale hits=0 · token lockstep primary `#1E40AF` |
| 7 | Evidence + bus | **PASS** — this file WRITE · bus `READY_FOR_QA` |

**Cấm honored:** no seed · Face not LIVE · Attendance not CLOSED · no remaster DONE · no Nest/API/SRS rewrite.

---

## 2. Files touched (this seat / stall#3)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/ui/dialog.tsx` | Glass header + wordmark `data-testid=xevn-dialog-wordmark` · ADR §16 CODE-MEMORY |
| `apps/web/hrm/src/components/ui/alert-dialog.tsx` | Glass + surface parity · §16 CODE-MEMORY |
| `apps/web/hrm/src/index.css` | Fonts + dialog surface/glass + field utils · §16 CODE-MEMORY |
| `apps/web/web-portal/src/index.css` | Fonts @import top · dialog/field utils · §16 CODE-MEMORY |
| `apps/web/web-portal/src/components/common/ConfirmDialog.tsx` | Glass + wordmark · §16 CODE-MEMORY |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Wide create + compact fields · §16 CODE-MEMORY |
| `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx` | Wide add + compact date/time/select/reason · §16 CODE-MEMORY |
| `apps/web/hrm/index.html` / `web-portal/index.html` | Google fonts Montserrat + Source Sans 3 (confirmed) |

---

## 3. Verify log (reproducible)

```text
> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## 4. QA browser checklist (U65 · zero-seed)

| Check | Persona / path | Expect |
|-------|----------------|--------|
| Q1 brand 5s | `ceo@xe.vn` → HRM ATT Leave → **Tạo đơn** | Top bar blue `#1E40AF` · logo left · glass header · title ≥20 Montserrat |
| Q2 OT | ATT OT → **Thêm** | Same chrome · compact date/time/select · reason full width · primary CTA |
| Portal confirm | Any ConfirmDialog | Glass + wordmark + primary/danger DNA |
| Face | ATT Face screens | HOLD / featureHold honesty — **not** LIVE |
| Fonts | DevTools Computed | Title → Montserrat; body → Source Sans 3 |
| F5 | After open dialog | Chrome persists (CSS/fonts) |

**testids:** `att-leave-create-dialog-precision` · `att-ot-add-dialog-precision` · `xevn-dialog-wordmark`

---

## 5. Residual / not claimed

| Item | Status |
|------|--------|
| Full ATT 90 remaster | **OUT** — ATT path deferred; squad later |
| Face LIVE | **OUT** — HOLD |
| Attendance CLOSED | **OUT** |
| Remaster DONE | **OUT** |
| Browser screenshot this seat | **QA** — L0 stack not asserted here |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-FE-DIALOG-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01.md
next_owner: qa
next_dispatch_prompt: |
  Task qa PO-HRM-UI-BRAND-FE-DIALOG-01-QA — browser U65 zero-seed ceo@xe.vn;
  open Leave create + OT add — assert brand bar #1E40AF + logo + glass + title>=20 + compact fields;
  ConfirmDialog glass/logo; fonts Montserrat/Source Sans 3; Face HOLD honesty;
  theme-contrast --strict already exit 0 on FE seat;
  evidence docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01-qa.md;
  cấm seed / Face LIVE / Attendance CLOSED / remaster DONE
```
