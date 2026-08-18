# D-HDSD-MUTATE-SHR-F5-01 — Shareholder POST 201 → F5 list persist

**work_item_id:** `D-HDSD-MUTATE-SHR-F5-01`  
**Program:** `P-HDSD-QA-SRS-01`  
**Date:** 2026-07-30  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**Prior QA:** `docs/qa/evidence/qa-hdsd-mutate-ret-02-20260730.md` (TC-HDSD-03-02-01 POST 201 · F5 ✗)

## spec_read_ack

- **srs:** UF-XBOS-05 — sau POST cổ đông 2xx, UI hiển thị row + F5 còn dữ liệu
- **tech_spec:** `legalEntityProfileApi` shareholders list/create
- **change_mode:** FIX · **preserve_default:** true · testid giữ nguyên (FE-02)

## Root cause

| Layer | Issue |
|-------|--------|
| State sync | `submitShareholderRow` chỉ cập nhật `id`/`submitted`, không map `holder_name` từ response và **không refetch** list |
| Load guard | `useEffect` chỉ `setShareholderRows` khi `shareholders.length > 0` — empty API giữ mock seed |
| U65 seed | Initial state + `openEditCompanyEntity` else branch hardcode «Nguyễn Văn A» che list API thật |
| QA harness | `document.body.innerText` không đọc `<input value>` — thêm `sr-only` text cho holderName |

## Fix

| File | Change |
|------|--------|
| `shareholderListSync.ts` | `mapShareholderApiRowToUiRow` + `fetchShareholderUiRows` (authoritative list) |
| `CommandCenterPage.tsx` | Initial rows `[]`; useEffect luôn sync API; post-save refetch; holding/member openEdit load list; bỏ mock seed; sr-only holder name |

## Regression

```text
apps/web/web-portal:
  pnpm exec vitest run \
    src/pages/command-center/shareholderListSync.test.ts \
    src/pages/command-center/shareholderRowUpdate.test.ts \
    src/lib/hdsdMutateTestIds.test.ts
  → 7/7 PASS
```

## QA retest (U65 · :5173 · ceo@xe.vn)

1. CC → Settings `company_member_units` → TẬP ĐOÀN → Chỉnh sửa
2. `#hdsd-shareholder-add-row` → type `QA <stamp>` → `[data-testid^=hdsd-shareholder-save-]`
3. **Network:** POST `/shareholders` **201**
4. **FE sau mutate:** row visible trong bảng (input + sr-only text)
5. **F5** → mở lại holding edit → stamp còn trong bảng
6. Regression 🟢: WF canvas · internal_services (unchanged)

## completion_report

**Closed:** TC-HDSD-03-02-01 FE list invalidation + post-save refetch + F5 load path; U65 mock shareholder seed removed; testids preserved.

**Residual:** HRM mutate TC 05–08 blocked by hrm-api stack (devops D-HDSD-MUTATE-DO-01) — out of scope this WI.

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-03-SHR
from_role: dev-fe | to_role: qa
program: P-HDSD-QA-SRS-01
entry_criteria: docs/qa/evidence/d-hdsd-mutate-shr-f5-01-20260730.md READY_FOR_QA; L0 exit 0; portal :5173; U65 zero-seed
exit_criteria: Browser TC-HDSD-03-02-01 UF-XBOS-05 — POST 201 + F5 reopen holding edit shows stamp in table (data-testid + innerText/sr-only); regression UF-XBOS-10 + internal_services 🟢; evidence docs/qa/evidence/qa-hdsd-mutate-ret-03-20260730.md (or append RET-02 if stack not ready for full RET-03)
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM
pm_dispatch_hint: Full RET-03 after devops stack stable
```
