# Evidence — PO-HRM-UI-HEADER-JD-DND-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-HEADER-JD-DND-FE-01` |
| **role** | `dev-fe` |
| **date** | 2026-08-06 |
| **change_mode** | FIX · preserve_default · U65 no seed |
| **sponsor_log** | `docs/qa/evidence/sponsor-console-20260806-recruitment.log` |
| **ack_status** | **READY_FOR_QA** |
| **next_owner** | `qa` · `PO-HRM-UI-HEADER-JD-DND-QA-01` |

---

## Residuals closed (5/5)

| # | Defect | Root cause | Fix |
|---|--------|------------|-----|
| **1** | CC duplicate header | Page sticky «XeVN OS / Command Center» duplicated TopHeader remaster chrome | KEEP `TopHeader` (`portal-brand-mark`); REMOVE page brand strip; KEEP slim `cc-persona-bar` pills |
| **2** | JD DnD `Unable to find drag handle` | hello-pangea `findDragHandle` queries iframe `document`; Dialog was parent-portaled | `JdTemplateWriterDialog` `portalScope="iframe"` + div handle / `sameNodeDragBind` |
| **3** | Interview schedule mojibake | Hardcoded Latin1-misread VI in `ScheduleInterviewDialog.tsx` | Wire all copy to `t('recruitment.sid.*')` from UTF-8 `vi.json` |
| **4** | `getDialogPortalContainer is not defined` | Transient/partial Dialog rewrite called helper without import | DialogContent uses only `getRadixPortalContainer(portalScope)`; source lock bans bare `getDialogPortalContainer(` |
| **5** | `LayoutDashboard is not defined` | Import removed while JSX still referenced icon (HMR mid-edit) | No `LayoutDashboard` in `CommandCenterPage`; persona uses `Building2`/`CircleUser`/`User`; source lock |

---

## Spec says / code does

### 1) Command Center header

| Before | After |
|--------|-------|
| TopHeader + page strip (grid + XeVN OS + Command Center + persona) | TopHeader only for brand; page = `cc-persona-bar` / `cc-persona-switcher` |

### 2) JD writer DnD

| Before | After |
|--------|-------|
| Parent portal → handles invisible to iframe `document` | `portalScope="iframe"`; canvas header `<div {...dragHandleProps}>`; palette `sameNodeDragBind` |

### 3) Interview UTF-8

| Before | After |
|--------|-------|
| `LĂªn lá»‹ch phá»ng váº¥n` hardcoded in TSX | `t('recruitment.sid.title')` → «Lên lịch phỏng vấn»; labels Ngày/Giờ/Thời lượng/Hình thức/Địa điểm from `vi.json` |

---

## Files touched

- `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx`
- `apps/web/web-portal/src/pages/command-center/CommandCenterHeader.source.test.ts`
- `apps/web/hrm/src/components/ui/dialog.tsx` — `portalScope`
- `apps/web/hrm/src/components/ui/dialogCenter.source.test.ts`
- `apps/web/hrm/src/components/recruitment/JdTemplateWriterDialog.tsx`
- `apps/web/hrm/src/lib/jdDndSameNodeProps.ts` + `.test.ts`
- `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.tsx`
- `apps/web/hrm/src/components/recruitment/ScheduleInterviewDialog.source.test.ts`
- `docs/qa/evidence/po-hrm-ui-header-jd-dnd-fe-01.md` (this file)

---

## must_keep

| Item | Status |
|------|--------|
| TopHeader membership / `portal-brand-mark` | kept |
| Persona BOD / Quản lý / Nhân viên | kept (`cc-persona-switcher`) |
| HDSD JD testids | untouched |
| Dialog center R2 (default parent portal) | kept |
| `createInterviewCatalog` wire | kept |
| Seed / remaster_program_done / face_live / jd_dynamic_done | **false** |

---

## Unit tests

```text
# apps/web/hrm
pnpm exec vitest run \
  src/lib/jdDndSameNodeProps.test.ts \
  src/lib/jdDynamicSnapshot.test.ts \
  src/lib/jdPackClientNormalize.test.ts \
  src/components/ui/dialogCenter.source.test.ts \
  src/components/recruitment/ScheduleInterviewDialog.source.test.ts
→ expect PASS

# apps/web/web-portal
pnpm exec vitest run \
  src/pages/command-center/CommandCenterHeader.source.test.ts \
  src/components/layout/ExecutiveDashboardLayout.test.tsx
→ expect PASS
```

---

## Expected QA browser (U65 · no seed)

### UF-CC-HEADER-01
1. Login `ceo@xe.vn` → `/command-center`
2. Exactly one brand header = TopHeader (logo + workspace + search + profile)
3. No second «XeVN OS / Command Center» title strip
4. Persona pills still work; **zero** `LayoutDashboard is not defined`

### UF-JD-DND-01
1. HRM → Thư viện JD → Thêm/Sửa JD → pick chức danh
2. Drag canvas reorder + palette→canvas
3. Console: **zero** `Unable to find drag handle` / `Unable to find any drag handles`

### UF-REC-INTERVIEW-UTF-01
1. Candidates → Lên lịch phỏng vấn
2. Title «Lên lịch phỏng vấn» đúng dấu
3. Labels: Ngày / Giờ / Thời lượng / Hình thức / Địa điểm đúng dấu
4. Dialog opens; **zero** `getDialogPortalContainer is not defined`

---

## Honesty

- FE seat: unit + source locks — browser PASS not claimed here  
- JD writer dialog mounts in iframe document (DnD document parity trade-off)  

---

## Handoff

- `ack_status`: READY_FOR_QA  
- `next_owner`: qa  
- `evidence_path`: `docs/qa/evidence/po-hrm-ui-header-jd-dnd-fe-01.md`
