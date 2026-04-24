# Product Backlog — Golden Flow XeVN OS

## Mục tiêu MVP
Golden Flow v1 tập trung vào một luồng vận hành có thể kiểm chứng:

```mermaid
sequenceDiagram
  participant Admin as X-BOS Admin
  participant API as XeVN API
  participant HR as HRM User
  participant Manager as HR Manager
  participant Audit as Audit Log

  Admin->>API: Publish employee_profile config
  HR->>API: GET effective config theo pháp nhân
  HR->>API: Submit metadata change request
  API->>HR: Field-level validation / requestId
  Manager->>API: Approve request
  API->>Audit: Write before/after + approver
  HR->>API: Reload profile metadata values
```

## 19 việc còn lại và acceptance

| # | Nhóm việc | Acceptance tối thiểu |
|---|---|---|
| 1 | Sản phẩm lõi/MVP | Golden Flow v1 được ưu tiên hơn việc mở thêm module mới. |
| 2 | User journey | Có journey BOD/Admin/HR/Manager/Employee với điểm vào, dữ liệu, kết quả. |
| 3 | Domain ownership | Có source-of-truth matrix cho Config, Employee, Workflow, KPI, Audit. |
| 4 | Authorization | Có policy field-level và rule portal-mode không bypass dữ liệu nhạy cảm. |
| 5 | Lifecycle | Config/change request/workflow có Draft/Pending/Approved/Published/Archived. |
| 6 | Versioning | Có rule fieldCode immutable, type change cần migration, old values giữ configVersion. |
| 7 | Cockpit | Có task queue thật cho metadata change request, SLA, action approve/reject. |
| 8 | Product KPI | Có KPI đo: time-to-config, validation error rate, approval SLA, audit completeness. |
| 9 | Onboarding | Wizard tenant → pháp nhân → org → import nhân sự → chọn template → publish config. |
| 10 | Import/export | Có import nhân sự theo dynamic field mapping và export config/audit snapshot. |
| 11 | Audit UX | Có before/after, reason, approver, config version, export audit. |
| 12 | Notification | Có notification in-app/email/SLA reminder/escalation mapping. |
| 13 | Exception rules | Có fallback khi API/config lỗi, publish race, validation drift. |
| 14 | Mobile/self-service | Có scope nhân viên/tài xế tự cập nhật hồ sơ và manager duyệt. |
| 15 | Reporting model | Có dimensions: org, legal entity, employee, time, config version, workflow status. |
| 16 | Packaging | Có package/feature flag: Core Portal, X-BOS Config, HRM Basic, Workflow, KPI, AI. |
| 17 | Security/privacy | Có PII masking, retention, export control, RLS, field-level permission. |
| 18 | UAT matrix | Có test case cho admin thêm field, HR nhập, manager duyệt, audit/report cập nhật. |
| 19 | Release strategy | Có tiêu chí Prototype → Alpha → Pilot → Production. |

## Trạng thái triển khai hiện tại
- API contract, Prisma schema và HRM dynamic metadata runtime đã có lát cắt đầu.
- Metadata values đang được nâng từ lưu trực tiếp sang change request + approval + audit.
- Các module HRM còn nhiều Supabase direct-call cần migrate dần sang API.
