# PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01

**work_item_id:** PO-MFD-M2-ATT-RULES-TAB-AMBIGUITY-01  
**role:** dev-fe  
**ack_status:** READY_FOR_QA  
**date:** 2026-08-04  

## Problem (QA P0 #3)

- **Rule:** R-MFD-ATT-RULES-TAB-AMBIGUITY  
- **Symptom:** Playwright `getByRole('button', { name: 'Máy chấm công' })` → strict mode **4 elements** on Settings → Quy định chấm công subtabs.  
- **Evidence:** `docs/qa/evidence/_tmp-po-mfd-m1-att-runtime-smoke-01-browser.json` (id `rules-Máy chấm côn`).

## Fix (FE)

| Area | Change |
|------|--------|
| `apps/web/hrm/src/i18n/locales/vi.json` | `rulesTabs.app/tablet/auto` → nhãn ngắn, không trùng «Máy chấm công» |
| `apps/web/hrm/src/i18n/locales/en.json` | Parity labels (device/app/tablet/proxy/auto distinct) |
| `apps/web/hrm/src/pages/Attendance.tsx` | `ATTENDANCE_RULES_TAB_IDS` + map label keys; `data-testid="hdsd-att-rules-tab-{id}"`; `@CODE-MEMORY-CHANGE` |
| `apps/web/hrm/src/pages/attendanceRulesTabLabels.test.ts` | Assert 8 unique VI labels; only `device` === «Máy chấm công» |

**Stub honesty:** `tablet`, `proxy`, `auto` vẫn `attPage.featureInDev` — không đổi.

## QA click path (U65 browser)

1. Login `ceo@xe.vn` → HRM → Chấm công → **Thiết lập** → sidebar **Quy định chấm công**.
2. Subtab **Máy chấm công** — `getByTestId('hdsd-att-rules-tab-device')` hoặc role name exact **Máy chấm công** → **1** match.
3. Subtab **Ứng dụng di động** — `getByTestId('hdsd-att-rules-tab-app')` → nội dung app (LIVE) hoặc stub banner không lẫn device.
4. `getByRole('button', { name: 'Máy chấm công' })` → **exact: true** → count **1**.

## Verify (dev-fe)

```bash
pnpm exec vitest run src/pages/attendanceRulesTabLabels.test.ts
```

## Residual

- QA smoke script `scripts/qa/_tmp-po-mfd-m1-att-runtime-smoke-01.mjs` vẫn dùng label cũ «Chấm công trên ứng dụng» cho app — PM/QA cập nhật probe hoặc dùng testid.
