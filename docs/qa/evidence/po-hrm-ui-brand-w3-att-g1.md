# PO-HRM-UI-BRAND-W3-ATT-G1 — STUB/GĐ2/ALIAS + web Face honesty remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-G1` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **RE-DISPATCH** | stall#2 evidence MISS — **CLOSED** this seat (edit → verify → WRITE evidence) |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-G1 · S04, S17–S19, S39–S41, S58–S60, S66, S69–S70 |
| **Prior** | ATT-E-QA PASS · ATT-F-QA PASS |
| **change_mode** | `UPGRADE` / stall#2 `FIX` · preserve_default · honesty stubs kept |
| **ack_status** | **READY_FOR_QA** |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **prop_03e** | **SKIP** (unmounted honesty — not invent) |
| **remaster_program_done** | **false** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §10 ops-dense (Dialog/Alert title ≥20 bold; CTA primary `#1E40AF`; text `#111827`) |
| **Inventory** | S04 customize layout stub · S17–S19 Face GĐ2-HOLD · S39 shift copy stub · S40–S41 schedule/OT GĐ2 · S58–S60 leave alias · S66 settings Filter/Download stub · S69–S70 rules customize static |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice G1 |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | Face `featureHold` (no LIVE invent) · PROP-03e SKIP · ATT-03d/05b leave/GPS wires · customize/copy/filter no-op honesty · no Nest/seed · no Attendance CLOSED · no ATT-A..F regression |

---

## Paths touched

| Path | Role |
|------|------|
| `apps/web/hrm/src/pages/Attendance.tsx` | S04, S17 shell, S39–S41, S58–S60, S66, S69–S70 + CODE-MEMORY ATT-G1 stall#2; kill top-tab rainbow colorMap → always `bg-xevn-primary`; shifts title ≥20 |
| `apps/web/hrm/src/components/attendance/FaceIDScanner.tsx` | S17–S18 Face scan/confirm chrome + featureHold (confirm CTA primary; DialogTitle ≥20) |
| `apps/web/hrm/src/components/attendance/FaceRegistration.tsx` | S17/S19 Face register/delete chrome + featureHold (AlertDialogTitle ≥20) |

**Not touched:** Nest · seed · LeaveTab mutate wires · GPS work-sites CRUD · QR clock LIVE invent · EmployeeQRCard invent · Attendance CLOSED claim.

---

## Surfaces remastered (13 inventory)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S04 | `Attendance.tsx` overview | Customize CTA disabled + GĐ2 badge + `att-overview-customize-hold`; border/text xevn |
| S17 | Face panel + Face components | Hold banner title ≥20 + GĐ2 badge; shell `pointer-events-none`; Face cards Precision Motion |
| S18 | `FaceIDScanner` Dialog | DialogTitle ≥20; checkout orange→primary; confirm CTA primary; featureHold blocks mutate |
| S19 | `FaceRegistration` AlertDialog | AlertDialogTitle ≥20; delete honesty when featureHold; register CTA primary |
| S39 | shifts table Copy | Disabled no-op + `att-shift-copy-stub` honesty title; list title ≥20 |
| S40 | shifts schedule hold | Alert title ≥20; badge secondary; `shifts-schedule-hold` |
| S41 | shifts OT hold | Same chrome; `shifts-overtime-hold` |
| S58 | leave-summary alias | ALIAS honesty banner + LeaveTab; menu ALIAS badge |
| S59 | compensatory-summary alias | Same ALIAS pattern |
| S60 | leave-plan alias | ALIAS + GĐ2 badge honesty |
| S66 | settings emp Filter/Download | Disabled stubs + testids; filter card rounded-card xevn |
| S69 | rules customize tab | Hold banner ≥20; table sharp; `att-rules-customize-precision` |
| S70 | Reset/Preview/Add | Disabled stubs + honesty titles (no invent mutate LIVE) |

**OUT / SKIP this seat:**
- PROP-03e EmployeeQRCard invent (stays SKIP honesty from ATT-E)
- Face LIVE product / mobile MVP (W4-MOB-A)
- ATT-A..F PASS surfaces mutate wires
- Attendance CLOSED / remaster DONE claims

---

## Honesty / HOLD preservation

| Control | Status |
|---------|--------|
| Face `featureHold` on scanner + registration | kept |
| Face start/register/delete blocked when HOLD | kept (+ CTA disabled) |
| Parent Face shell `pointer-events-none` | kept |
| Customize layout disabled (no API) | kept |
| Shift copy no-op disabled | kept |
| Settings Filter/Download no-op disabled | kept |
| Rules customize Reset/Preview/Add no-op disabled | kept |
| Leave summary/plan = ALIAS LeaveTab (no fake report API) | kept |
| Schedule/OT = GĐ2-HOLD (no roster invent) | kept |

---

## Wire non-regression (spot)

| Wire | Status |
|------|--------|
| LeaveTab LIVE (leave-request) | untouched |
| ATT-05b leave panel / ATT-03d GPS sites | not in this seat |
| Rules Chung/Standard/App PATCH | untouched |
| QR clock scanner (ATT-E) | not remounted EmployeeQRCard |
| Shift CRUD / edit / bulk delete | Copy only disabled; edit/delete kept |

---

## Verify

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
```

---

## residual

| id | severity | note |
|----|----------|------|
| none P0/P1 | — | Face product = mobile W4; leave alias remains ALIAS until report API |

---

## handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-w3-att-g1.md`
- **next_dispatch_prompt:**

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-G1-QA
from_role: pm
to_role: qa
priority: P0
lane: execution
entry_criteria: browser-only U65 zero-seed; L0 stack; evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-g1.md present
scope: Inventory W3-ATT-G1 — S04 customize HOLD · S17–S19 Face GĐ2-HOLD honesty (never Face LIVE) · S39 copy stub · S40–S41 schedule/OT GĐ2 · S58–S60 leave ALIAS honesty · S66 Filter/Download stub · S69–S70 rules customize static
AC: titles ≥20 / text #111827 / primary #1E40AF; Face HOLD banner + disabled shell; ALIAS/GĐ2 badges; stubs disabled no-op; pnpm run verify:xevn:theme-contrast -- --strict exit 0; do not regress ATT-A..F; PROP-03e SKIP; no Attendance CLOSED
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-att-g1-qa.md
cấm: seed · Nest as UF · Face LIVE invent · QR LIVE invent · Attendance CLOSED · remaster DONE
ack_status target: PASS_TO_PM
```
