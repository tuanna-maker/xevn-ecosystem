# PO-HRM-UI-BRAND-W3-ATT-C — Leave cluster + late/early remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-C` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-C · S42–S49, S61 |
| **Prior** | W3-ATT-B FE READY (`po-hrm-ui-brand-w3-att-b.md`) — did not fight sheets/shifts |
| **Coordinate** | ATT-05b leave-balance/panel LIVE — chrome only; `dialog.tsx` R1 not modified |
| **change_mode** | `UPGRADE` · preserve_default · stub honesty |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §10 ops-dense modal |
| **Inventory** | S42 leave tab · S43 quỹ phép panel · S44 create · S45 detail · S46 reject · S47 delete · S48 late/early tab · S49 late/early modals · S61 top leave (LeaveTab) |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice C |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | leave-balance/panel GET wire · Face/GPS honesty · create/approve/reject/delete leave · late/early mutate · no Attendance CLOSED · no Nest/seed · no QR ATT-E · no sheets/shifts ATT-B fight |

---

## Surfaces remastered (9 inventory + shell residual)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S42 / S61 | `LeaveTab.tsx` list shell | Title ≥20 bold `text-xevn-text`; Create CTA `bg-xevn-primary`; cards `rounded-card border-xevn-border`; secondary labels; `data-testid=att-leave-precision` |
| S43 | `LeaveTab` `renderLeaveBalancePanel` | Already LIVE Precision Motion (ATT-05b) — preserved wire + sharp chrome unchanged |
| S44 | Create leave Dialog | Title ≥20 bold; Submit primary; helper secondary |
| S45 | Detail Dialog | Title ≥20; avatar primary; labels secondary; reason box xevn surface |
| S46 | Reject Dialog | Title ≥20; label sharp |
| S47 | Delete `AlertDialog` | Title ≥20 bold `text-xevn-text` |
| S48 | `LateEarlyRequestTab.tsx` | Title ≥20; Add CTA primary (was orange); KPI cards ops-dense; ban purple/orange chrome; `data-testid=att-late-early-precision` |
| S49 | Late/early Add/Detail/Delete | Dialog titles ≥20; Save primary; delete Alert title ≥20; avatar/time tokens xevn/amber DNA |
| Shell residual | `Attendance.tsx` leave request/detail/approval modals | Orange Save → primary; muted→secondary; Alert approve/reject title ≥20 |

**OUT / SKIP this seat:**
- W3-ATT-B sheets/records/shifts (not reopened)
- W3-ATT-D settings chrome
- W3-ATT-E QR clock
- W3-ATT-F work-sites GPS
- Face LIVE invent / Attendance CLOSED claim
- Nest / seed

---

## CODE-MEMORY

APPEND `@CODE-MEMORY-CHANGE` `PO-HRM-UI-BRAND-W3-ATT-C` + ADR-20260805 on:

- `apps/web/hrm/src/components/attendance/LeaveTab.tsx`
- `apps/web/hrm/src/components/attendance/LateEarlyRequestTab.tsx` (new block + CHANGE)
- `apps/web/hrm/src/pages/Attendance.tsx`

**Not touched:** `apps/web/hrm/src/components/ui/dialog.tsx` (R1 settled) · leave-balance panel fetch hooks · Face/GPS widgets.

---

## Verify

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| `useLeaveBalancesByType` / GET `/leave-balance/panel` | kept (S43 chrome only) |
| `createRequest` / `approveRequest` / `rejectRequest` / `deleteRequest` (leave) | kept |
| Leave attachment upload + catalog sync CTA | kept |
| Late/early `createRequest` / approve / reject / delete | kept |
| Face `featureHold` honesty | untouched |
| GPS / work-sites | untouched (W3-ATT-F) |
| Sheets/shifts ATT-B | not reopened |
| QR clock | SKIP (W3-ATT-E) |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. ATT → Nghỉ phép (top or Đơn từ) — sharp title + primary Tạo đơn + quỹ panel
2. Tạo đơn Dialog — brand bar + title ≥20 + Submit primary
3. Chi tiết / Từ chối / Xóa — titles ≥20
4. Đơn từ → Đi muộn/Về sớm — KPI no purple/orange CTA; Add primary
5. Late/early Add + Delete confirms

---

## Residual

| Item | Severity | Owner |
|------|----------|-------|
| ATT settings / customize chrome still orange/muted | P1 | **W3-ATT-D** |
| QR clock chrome | P1 | **W3-ATT-E** |
| Work-sites GPS remaster | P1 | **W3-ATT-F** |
| Nav tab orange chips on Attendance shell | P2 | later ATT nav batch |
| Browser visual spot | QA | this work_item QA |

---

## Handoff

### completion_report

W3-ATT-C closed: remastered leave cluster (S42–S49, S61) + residual Attendance leave modals to Precision Motion. Leave-balance/panel GET wire preserved. Late/early orange/purple CTA chrome removed. Sheets/shifts ATT-B not fought. Soft + strict theme-contrast exit 0. No Nest/seed/Attendance CLOSED invent.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-C-QA
from_role: pm
to_role: qa
priority: P0
entry_criteria: L0 stack up; U65 zero-seed browser-only; W3-ATT-C READY_FOR_QA
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w3-att-c.md
  - docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
  - docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md W3-ATT-C
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict → exit 0
  2) ceo@xe.vn → HRM→Chấm công→Nghỉ phép — sharp title; Tạo đơn primary #1E40AF; quỹ panel still loads (panel GET); no pale slate-400 body
  3) Tạo đơn Dialog — thin primary bar; DialogTitle ≥20 bold; Submit primary; leave-balance panel in dialog still wires
  4) Chi tiết / Từ chối Dialog title ≥20; Xóa AlertDialog title ≥20 bold text-xevn-text
  5) Đơn từ→Đi muộn/Về sớm — no orange Add CTA; no purple KPI; Add/Detail Dialog title ≥20; Delete confirm ≥20
  6) must_keep spot: panel GET not N× storm; Face honesty still on clock; no sheets/shifts fight; no QR invent
exit_criteria: evidence docs/qa/evidence/po-hrm-ui-brand-w3-att-c-qa.md · PASS_TO_PM or FAIL with surface_id
cấm: seed · Nest probe as UF · claim Attendance CLOSED · remaster program DONE · fail for W3-ATT-D/E/F residual
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-att-c.md`
