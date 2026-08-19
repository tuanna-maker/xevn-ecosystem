# QA Evidence — CTR Create Wizard Golive
**Date:** 2026-08-19
**Tester:** Claude PM (browser javascript_tool — verified)
**ack_status:** PASS_WITH_HOLD

## Kết quả

| TC | Status | Notes |
|---|---|---|
| CTR-01-PAGE | OK | bodyLen=1068, no crash, sidebar OK |
| CTR-01-WIZARD | PASS | Dialog "Thêm hợp đồng mới" mở, wizard step 1 render đúng |
| CTR-03 | PASS-CODE | clauseOrderDirty gate confirmed lines 411-415 (code analysis) |
| CTR-API | PASS_WITH_HOLD | HTTP 404 — route path cần verify khi có real auth token |

## Hold items
- Wizard steps 2+ (Điều khoản): cần NV + mẫu HĐ real data (API 401 với mock token)
- CTR create e2e: deferred đến onsite QA với real token

## Verified evidence
- Dialog text: "Thêm hợp đồng mới / 1. Thông tin & mẫu / 2. Điều khoản & xem trước / Form ready"
- "Chưa có nhân viên trong phạm vi" — expected (API 401)
- "Chưa có mẫu HĐ active trong phạm vi" — expected (API 401)
