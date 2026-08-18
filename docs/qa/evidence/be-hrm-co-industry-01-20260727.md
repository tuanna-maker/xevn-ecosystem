# BE Evidence — D-HRM-CO-INDUSTRY-BE-01

## spec_read_ack
- srs: `docs/hrm/SRS.md` § `UC-HRM-CO-01` Data Interaction danh sách ĐVTV / hồ sơ pháp nhân
- tech_spec: `docs/hrm/TECHSPEC.md` §20
- api_design: `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md`
- db_design: `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md`
- sponsor_confirm: BA note `AC-CO-IND` — ngành nghề lấy từ `business_lines`, không lấy từ `entity_type`

## completion_report
- Đã bổ sung `le.business_lines` vào `OrgFoundationService.listGroupMemberUnits()` để payload `GET /api/xbos/tenant-scope/group-member-units` trả `members[].business_lines`.
- Giữ nguyên các field hiện hữu `entity_type` và `payload`; không đổi semantics, không trộn sang headcount Plane B.
- Đã thêm regression test khóa contract backend: nếu `business_lines` tồn tại thì FE có thể bind ngành nghề từ call đầu tiên thay vì suy diễn từ `entity_type`.
- Residual: OpenAPI schema cho endpoint này hiện chưa khai báo chi tiết response field `business_lines`; phạm vi work item này chưa chỉnh tài liệu OpenAPI/runtime serializer ngoài service+test.

## changed_paths
- `apps/api/xbos-api/src/org-foundation/org-foundation.service.ts`
- `apps/api/xbos-api/src/org-foundation/org-foundation.service.spec.ts`

## verify
- `pnpm test org-foundation.service.spec.ts`
  - Result: PASS (`5 passed, 1 suite`)
- IDE diagnostics
  - Result: no linter errors on touched files

## contract_notes_for_fe
- `industry` phải đọc từ `members[].business_lines` trước, rồi mới fallback `payload.companyForm.industry|businessLines|business_lines` nếu cần.
- Không bind `members[].entity_type` vào bất kỳ field nào tên `industry`.

## ack
- next_owner: `qa`
- next_dispatch_prompt: `Retest work_item D-HRM-CO-INDUSTRY-BE-01 on /command-center/hrm/company with ceo@xe.vn. Verify GET /api/xbos/tenant-scope/group-member-units returns members[].business_lines when DB has value, and UI column "Ngành nghề" does not show raw entity_type tokens like subsidiary/holding. Cross-check F5 persistence and note whether FE still depends on legal-entities enrich call. Use evidence path docs/qa/evidence/be-hrm-co-industry-01-20260727.md plus your QA evidence file.`
- ack_status: `READY_FOR_QA`
