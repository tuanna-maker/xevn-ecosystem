# PO-HRM-UI-BRAND-W3-ATT-D — OT / trip / update / shift-change remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-D` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **RE-DISPATCH** | stall#2 evidence MISS — **CLOSED** this seat (code polish + fresh verify + evidence rewrite) |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-D · S50–S57 |
| **Prior** | ATT-C-QA PASS `docs/qa/evidence/po-hrm-ui-brand-w3-att-c-qa.md` — LeaveTab not fought |
| **Coordinate** | Own OT / trip / update / shift-change only |
| **change_mode** | `UPGRADE` + stall#2 `FIX` · preserve_default · mutate wires kept |
| **ack_status** | **READY_FOR_QA** |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **remaster_program_done** | **false** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §10 ops-dense modal (Dialog title ≥20 bold; CTA primary `#1E40AF` / danger DNA) |
| **Inventory** | S50 OT tab · S51 OT Add/Detail/Delete · S52 trip tab · S53 trip modals · S54 update tab · S55 update modals · S56 shift-change tab · S57 shift-change modals |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice D |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **ATT-C QA** | PASS — leave-balance/panel + LeaveTab chrome kept untouched |
| **must_keep** | mutate wires (create/approve/reject/delete) · Face/GPS honesty · leave panel wire · ISO time compose + x-company-id on update · no Attendance CLOSED · no Nest/seed · no Face LIVE · no QR invent · no LeaveTab fight |

---

## Paths touched

| Path | Role |
|------|------|
| `apps/web/hrm/src/components/attendance/OvertimeRequestTab.tsx` | S50–S51 remaster + stall#2 CODE-MEMORY |
| `apps/web/hrm/src/components/attendance/BusinessTripRequestTab.tsx` | S52–S53 remaster + stall#2 CODE-MEMORY |
| `apps/web/hrm/src/components/attendance/AttendanceUpdateRequestTab.tsx` | S54–S55 remaster; forgot-type badge amber→secondary; ISO wires kept |
| `apps/web/hrm/src/components/attendance/ShiftChangeRequestTab.tsx` | S56–S57 remaster; changeCount KPI amber→secondary |

**Not touched:** `LeaveTab.tsx` · `LateEarlyRequestTab.tsx` · `dialog.tsx` · Face/GPS widgets · leave-balance/panel hooks · Nest · seed scripts.

---

## Surfaces remastered (8 inventory)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S50 | `OvertimeRequestTab.tsx` list shell | Title `text-[20px] font-bold`; Create CTA `bg-xevn-primary`; KPI ops-dense; ban orange/purple/blue CTA; `data-testid=att-ot-precision` |
| S51 | OT Add/Detail/Delete | DialogTitle ≥20; Save primary; AlertDialogTitle ≥20; avatar/coeff xevn; approve DNA green / reject danger |
| S52 | `BusinessTripRequestTab.tsx` | Title ≥20; CTA primary; KPI cards; `data-testid=att-trip-precision` |
| S53 | Trip Add/Detail/Delete | Dialog/Alert titles ≥20; MapPin/cost → primary; labels secondary |
| S54 | `AttendanceUpdateRequestTab.tsx` | Title ≥20; CTA primary; KPI ops-dense; `data-testid=att-update-precision` |
| S55 | Update Add/Detail/Delete | Dialog/Alert ≥20; type badges xevn; forgot-type non-DNA secondary; ISO compose wire kept |
| S56 | `ShiftChangeRequestTab.tsx` | Title ≥20; CTA primary; KPI; `data-testid=att-shift-change-precision` |
| S57 | Shift-change Add/Detail/Delete | Dialog/Alert ≥20; swap/change badges xevn; changeCount KPI secondary (not amber chrome) |

**OUT / SKIP this seat:**
- W3-ATT-C LeaveTab / late-early (not reopened)
- W3-ATT-B sheets/records/shifts
- W3-ATT-E QR clock
- W3-ATT-F work-sites GPS
- Face LIVE invent / Attendance CLOSED claim
- Nest / seed

---

## Stall#2 delta (this seat)

| Item | Action |
|------|--------|
| Evidence MISS | Rewrote this file with fresh verify logs + path list |
| Non-DNA amber | `forgot_check` type badge → `bg-xevn-textSecondary/15` |
| Non-DNA amber | Shift-change `changeCount` KPI icon → secondary (pending DNA amber kept) |
| CODE-MEMORY | APPEND stall#2 CHANGE on all 4 tabs |
| Orange CTA | Confirmed removed (was `bg-orange-500` → `bg-xevn-primary`) |

---

## Verify (mandatory — pasted)

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict for W3 DoD)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| OT `createRequest` / approve / reject / delete | kept |
| Trip `createRequest` / approve / reject / delete | kept |
| Update `buildAttendanceUpdateRequestTimeFields` ISO compose | kept |
| Update approve/reject + company header path | kept |
| Shift-change create/approve/reject/delete | kept |
| Leave-balance/panel GET (ATT-05b) | untouched |
| Face `featureHold` honesty | untouched |
| GPS / work-sites | untouched |
| QR clock | SKIP (W3-ATT-E) |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. Login `ceo@xe.vn` → HRM Attendance → Đơn từ → Tăng ca — title 20px + primary CTA
2. Open Add OT Dialog — title ≥20 + thin primary bar (shared Dialog)
3. Công tác / Cập nhật chấm công / Đổi ca — same chrome
4. Network: no Nest invent; mutates only if QA exercises create (optional)

---

## Residuals

| ID | Note | Owner |
|----|------|-------|
| OBS-empty-lists | Empty OT/trip/update/shift lists without seed = P2 OBS (U65) | QA |
| ATT-E | QR clock remaster next after D-QA | PM |
| ATT-F | Work-sites GPS remaster | PM |

**Forbidden claims:** Attendance CLOSED · remaster DONE · Face LIVE

---

## Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-w3-att-d.md`
- **next_dispatch_prompt:** see below

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-D-QA
from_role: pm
to_role: qa
priority: P1

entry: FE READY docs/qa/evidence/po-hrm-ui-brand-w3-att-d.md (stall#2 CLOSED) · ATT-C-QA PASS
U65 browser-only; zero-seed
persona: ceo@xe.vn / Xevn@2026
URL: portal → HRM embed → Chấm công → Đơn từ

inventory: S50–S57
AC:
- theme-contrast --strict exit 0
- OT/trip/update/shift-change titles ≥20 bold; CTA primary #1E40AF; no orange/purple AI chrome
- Dialog Add/Detail title ≥20 + brand bar; Alert delete title ≥20
- mutate wires intact (optional create smoke — no seed)
- leave panel / LeaveTab not regressed; Face hold honesty; Attendance not CLOSED
cấm: seed · Nest probe as UF · remaster DONE claim
evidence: docs/qa/evidence/po-hrm-ui-brand-w3-att-d-qa.md
ack_status: PASS_TO_PM
```
