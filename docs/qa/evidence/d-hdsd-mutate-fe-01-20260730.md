# D-HDSD-MUTATE-FE-01 — HDSD mutate FE wiring

**work_item_id:** `D-HDSD-MUTATE-FE-01`  
**Program:** `P-HDSD-QA-SRS-01`  
**Date:** 2026-07-30  
**Owner:** dev-fe  
**ack_status:** `READY_FOR_QA`  
**pm_dispatch_hint:** `QA-HDSD-MUTATE-RET-01`

## spec_read_ack

- **srs:** `docs/hrm/SRS.md` · UF-XBOS-05 (cổ đông holding) · UF-XBOS-10 (WF canvas) · UF-HRM-02/05/07 (create NV/HĐ/YCTD)
- **tech_spec:** Command Center settings deep links · HRM embed paths (`paths.ts`)
- **change_mode:** FIX · **preserve_default:** true

## Residual → fix map

| Residual | TC | Fix | Before | After (expected Network) |
|----------|-----|-----|--------|----------------------------|
| R-HDSD-W1-01 | TC-HDSD-03-02-01 | `submitShareholderRow` dùng `resolveLegalProfileScope` + `GROUP_HOLDING_ROOT_ID` → `saveShareholder` (không chặn bởi `ensureLegalProfileEntityId`); validate `holderName` | Lưu cổ đông silent return, không POST | POST/PUT `/org-foundation/legal-entities/.../shareholders` **2xx** khi đã nhập tên |
| R-HDSD-W1-02 | TC-HDSD-04-02-01 | Alias `?settings=workflow_designer` → `workflow` + auto mở canvas tab | Canvas dots không detect | `?settings=workflow_designer` mở **Hệ thống quy trình** + tab Canvas |
| R-HDSD-W2-01 | TC-HDSD-05/06/07 create | NV: prefill `employee_code` + `start_date`; HĐ: prefill code/type/date + `employee_id`; Recruitment: `?tab=requisitions` deep link | Form mở nhưng thiếu field → không POST | Login → fill tên NV → Lưu → POST **201**; HĐ có NV + loại HĐ → POST **201**; `/hr/recruitment?tab=requisitions` → **Thêm yêu cầu** |
| R-HDSD-W3-01 | TC-HDSD-10-04-01 | HRM routes `/internal_services` → redirect `/internal-services` | Console 404 `/hr/internal_services` | GET `/hr/internal-services` **200**, không 404 |

## Extra hardening

- `SETTINGS_MENU_ALIASES`: `departments`, `rbac`, `hrm_catalog`, `raci` (HDSD harness query keys)
- `settingsWorkspaceTitle` fallback — tránh `.trim()` crash trên menu lạ
- `tools_equipment` legacy redirect (parity với internal_services)

## Regression

```text
pnpm exec vitest run src/modules/hrm/commandCenterUrl.test.ts src/modules/hrm/paths.test.ts src/integrations/legalEntityProfileScope.test.ts
→ 30/30 PASS (2026-07-30)
```

## QA retest (U65 browser)

**Persona:** `ceo@xe.vn` / `Xevn@2026` · portal `:5173`

1. **UF-XBOS-05:** Settings → TẬP ĐOÀN → Chỉnh sửa → Thêm cổ đông → nhập tên (UI onChange) → icon Lưu cổ đông → Network POST 2xx → F5 row còn
2. **UF-XBOS-10:** `/command-center?settings=workflow_designer` → thấy canvas dots / bước WF
3. **UF-HRM-02:** `/hr/employees?portal=1&…` → Thêm → nhập **Họ tên** (mã NV đã prefill) → Lưu → POST 201 → F5
4. **UF-HRM-05:** `/hr/contracts?…` → Thêm → Lưu (NV + loại HĐ preselected nếu catalog có) → POST 201
5. **UF-HRM-07:** `/hr/recruitment?tab=requisitions&portal=1&…` → Thêm yêu cầu → chọn JD → Lưu → POST 201
6. **Internal services:** `/hr/internal_services?portal=1&…` → không console 404; route `/internal-services`

## completion_report

**Closed:** R-HDSD-W1-01/W1-02/W2-01 (FE wiring + prefill/deeplink)/W3-01; settings alias + trim crash guard.  
**Residual:** QA must use real React input for shareholder (not DOM-only harness); YCTD still needs JD template from FE catalog (U65); leave POST 400 remains dev-be (R-HDSD-W2-02).

## next_owner

qa

## next_dispatch_prompt

```
work_item_id: QA-HDSD-MUTATE-RET-01
from_role: dev-fe | to_role: qa
entry_criteria: docs/qa/evidence/d-hdsd-mutate-fe-01-20260730.md; portal :5173; L0 PASS
exit_criteria: Browser U65 retest TC-HDSD-03-02-01, 04-02-01, 05-03-01, 06-02-01, 07-02-01, 10-04-01 — mutate POST 2xx + F5; evidence docs/qa/evidence/qa-hdsd-mutate-ret-01-20260730.md
UF/J-*: UF-XBOS-05, UF-XBOS-10, UF-HRM-02, UF-HRM-05, UF-HRM-07, J-HRM-EMP-01
cấm: seed; probe-only PASS
ack_status: PASS_TO_PM
```
