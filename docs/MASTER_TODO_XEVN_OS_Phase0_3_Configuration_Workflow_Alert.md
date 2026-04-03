# Master TODO — XeVN OS (Phase 0 → Phase 3)

| Thuộc tính | Giá trị |
|---|---|
| Mục tiêu | Danh sách công việc cần làm để hoàn thiện các phần trong BRD Master Standard (khung Origin/Variant, workflow engine, alert aggregation) |
| Nguyên tắc | Tuyệt đối không sửa UI/UX đang đẹp; chỉ hoàn thiện prototype + nghiệp vụ + backend contract |
| Phiên bản | 1.1 (todo chi tiết) |
| Ngày cập nhật | 2026-03-30 |

---

## Pre-Phase — FE Prototype + Mockdata Gate (xong FE mới làm BE/DB)

### T-1.0 Prototype vs Mockdata end-to-end cho tất cả chức năng
- Mục tiêu: “FE chạy được theo contract” bằng mockdata để chốt nghiệp vụ + contract semantics trước khi đụng BE vs DB.
- Nguyên tắc: tuyệt đối không làm thay UI/UX production hiện có; chỉ gắn prototype logic (mock fetch + adapter) và mô phỏng error/validation theo `fieldCode`.

- Phạm vi “tất cả chức năng” (dựa theo blueprint/contract hiện có trong dự án):
  - Effective config contract + merge engine semantics:
    - `GET /config/effective` (mock response theo `originCode + legalEntityId`)
    - options sourcing theo scope (global vs legal_entity) + mapping label/itemCode
    - validation error format field-level
  - Admin prototype Origin/Variant:
    - `POST /config/origins`, `POST /config/variants`
    - preview diffJson cho inherited vs override (mock)
  - `company_infrastructure` wiring (prototype):
    - render form theo effective config
    - validate payload runtime theo contract rules
    - lấy options (facilityType/status) theo effective config subset
    - lưu runtime record (mock) kèm effectiveConfigVersion reference
  - `company_group_hr` wiring (prototype):
    - render danh sách metadata field theo effective config
    - validate dataType/validationRules + select options subset
    - lưu metadata runtime record (mock) kèm effectiveConfigVersion
  - Workflow:
    - governance/config validation (mock gating reject outcome theo role contract)
    - workflow runtime prototype instances:
      - `start` / `simulate` + chuyển trạng thái theo graph
  - Alerts/Cockpit:
    - ingestion + dedupe + hot_points ranking (mock)
    - drill-down hot_point_items (mock)
  - Unified Portal projection (cockpit overview):
    - mock mapping nghiệp vụ -> `UnifiedTask` / alert list / kpi sparkline

- Deliverables (để “thấy ok” và chốt BE/DB):
  - bộ mockdata tập trung cho ít nhất 2 legal entity:
    - entity A có override
    - entity B fallback global
  - checklist test thủ công:
    - ít nhất 10 tình huống validate thành công/thất bại (đúng fieldCode)
    - ít nhất 1 tình huống options khác nhau giữa entity A/B
    - ít nhất 1 tình huống reject transition bị chặn theo role contract
    - drill-down hot_point truy vết được keys/correlation-id

- Tiêu chí “OK để bắt đầu BE/DB”:
  - FE render + validate đúng contract semantics (không hard-code danh mục)
  - error format field-level khớp với UI placement expectation
  - workflow gating reject outcome và alert ranking hoạt động nhất quán

### T-1.1 Màn cấu hình “mục thông tin” cho `company_infrastructure`
- Mục tiêu: thay vì form “tự nhiên có ngần ấy khối & field”, admin phải cấu hình được:
  - các block (tên khối/tiêu đề),
  - danh sách field trong từng block,
  - inputType cho từng field,
  - visibility + label theo Origin và Variant (theo pháp nhân).
- Trường hợp option `2` (bạn chọn): admin có thể thêm **field custom hoàn toàn mới** (fieldCode mới) kèm inputType/selectConfig, và runtime phải render đúng cho từng pháp nhân.
- UI/UX:
  - giữ nguyên layout đẹp hiện tại của form runtime `company_infrastructure` (chỉ đổi nguồn metadata để render).
  - thêm 1 màn riêng cho config trường dữ liệu (Origin + Variant).
- Runtime behavior:
  - form detail của InfrastructureSite đọc effective config để hiển thị đúng block/field/inputType/label.
- Acceptance (prototype OK):
  - bạn thêm field custom mới cho `comp-002`/`comp-003` thì runtime form hiển thị thêm đúng inputType (text/number/date/select) trong đúng block.
  - bạn cấu hình lại tên khối cho entity thì heading khối thay đổi ngay.
  - config thay đổi được “save” như mock (có publishVersionChange tương ứng).

## Phase 0 — Foundation (Chuẩn hoá nền tảng)

### T0.1 Chốt contract effective config
- Mô tả rõ structure response cho `GET /config/effective` theo dạng:
  - `tenantId`, `moduleCode`, `legalEntityId` (hoặc `scopeId`), `originCode`
  - `effectiveVersion`: `{ originVersion, variantVersion, moduleVersion? }`
  - `blocks[]`: `{ blockCode, labelVi, visibility }`
  - `fields[]`: `{ fieldCode, labelVi, dataType, required, readonly, validationRules, options? }`
  - `options` (tuỳ trường hợp): `{ categoryCode, items: [{ itemCode, labelVi, payloadJson? }] }`
- Chuẩn hoá contract cho `fieldCode` ổn định:
  - naming rules (khuyến nghị snake_case)
  - cam kết “không đổi fieldCode” khi publish origin/variant (trừ migration policy)
- Chuẩn hoá cách map `optionsSource` và `displayRules`:
  - `optionsSource.categoryCode`, `optionsSource.scope` (global/legal_entity/module)
  - `displayRules`: hidden/readonly/required theo `persona + dataScope + roleContractVersion`
- Chuẩn hoá contract lỗi validation runtime:
  - error field-level: `{ fieldCode, errorCode, messageVi, meta }`
  - error cấp contract: `{ errorCode, messageVi, meta }`
- Acceptance:
  - UI prototype `company_infrastructure` render được theo contract mà không hard-code danh mục
  - UI prototype sai dữ liệu trả đúng `fieldCode` để hiển thị đúng vị trí

### T0.2 Thiết kế DB schema cho Config Orig./Variant + Field Contracts
- `config_origins`: origin_code, moduleCode/domainCode, origin_version, contractJson (metadata), status, createdBy, publishedAt
- `config_origin_fields`: origin_id, blockCode, fieldCode, fieldContractJson (dataType/validation/optionsSource/displayPolicyContract)
- `config_variants`: variant_code, legal_entity_id, origin_id, variant_version, diffJson (chỉ chứa override hợp lệ), status, publishedAt
- `config_categories`: category_code, category_contractJson (dataType/dedupeKey/options semantics), scope definitions
- `config_category_items`: category_id, item_code, labelJson, payloadJson, scope (global/entity)
- Ràng buộc/Indexes tối thiểu:
  - unique `(tenant_id, module_code, origin_code, origin_version)`
  - unique `(tenant_id, legal_entity_id, origin_code, variant_version)`
  - unique `(tenant_id, category_code, item_code, scope)`
  - indexes cho truy xuất effective: `(tenant_id, module_code, legal_entity_id, active)`
- RLS/security guardrails:
  - Read effective config trong tenant scope
  - Admin role mới được write origin/variant/publish
- Acceptance:
  - có thể lưu Origin và tạo Variant diffJson
  - có thể query nhanh effective config trong prototype latency

### T0.3 Effective merge engine (Prototype)
- Triển khai merge theo priority:
  - Module Variant (nếu tồn tại) → Entity Variant → Global Origin
  - merge deterministic: cùng inputs -> cùng outputs
- Merge visibility/required/readonly:
  - nếu override `hidden=true` thì `required=false` (không enforce required cho field ẩn)
  - conflict resolution rõ ràng theo thứ tự priority
- Merge options:
  - entity chỉ override subset allowed items
  - fallback global items nếu entity không override
  - label mapping thống nhất theo category contract
- Merge validationRules:
  - override subset parameter (min/max/pattern/regex/required)
  - validate contract schema trước khi accept publish
- Chặn lỗi contract:
  - fieldCode không tồn tại trong origin -> `FIELD_NOT_ALLOWED`
  - dataType lệch contract -> `CONTRACT_TYPE_MISMATCH`
- Acceptance:
  - cùng fieldCode cho ra contract/validation/options đúng scope
  - có golden test case: entity có override + entity không override (tối thiểu 2 entity)

### T0.4 Admin prototype: tạo Origin/Variant + diffJson
- Endpoint lưu Origin Template:
  - `POST /config/origins` (artifactCode/moduleCode, originCode, contractJson)
  - `POST /config/origins/:originCode/versions:publish`
- Endpoint tạo Variant (diffJson theo legal entity):
  - `POST /config/variants` (originCode, legalEntityId, diffJson)
  - `POST /config/variants/:variantId/versions:publish`
- Endpoint preview:
  - `GET /config/variants/:variantId:diff` (diff so với origin)
  - `GET /config/effective` vẫn là nguồn render chính
- Policy cho admin:
  - diffJson chỉ chứa override hợp lệ trong allowed contract
  - nếu origin đổi breaking, variant cần migration policy trước khi publish
- UI không đổi (chỉ gắn logic nghiệp vụ lưu/validate và hiển thị inherited vs override)
- Acceptance:
  - quản trị tạo variant thành công
  - effective config thay đổi đúng với diffJson (preview + effective đều nhất quán)

### T0.5 Chuẩn hóa versioning + invalidate cache
- Mỗi publish origin/variant tạo version immutable:
  - lưu published snapshot phục vụ audit + effective query
- `GET /config/effective` trả:
  - `effectiveVersion`: `{ originVersion, variantVersion }` và `ETag`
  - `asOf`/`effectiveAt` (tuỳ triển khai) để audit reproducible
- Invalidate cache:
  - invalidate theo (tenantId, moduleCode, legalEntityId, originCode)
  - xử lý race: publish xong effective query phải thấy version mới
- Idempotency:
  - publish gọi lại cùng version/payload không tạo bản ghi trùng
- Audit hook:
  - log correlation-id, admin user id, originCode/variantCode/version change
- Acceptance:
  - UI luôn render đúng version sau publish
  - không có “stale config” kéo dài quá SLA prototype

---

## Phase 1 — Đỡ trụ nghiệp vụ (Modules Boot)

### T1.1 Workflow: governance + config validation
- Validate step role tồn tại trong `workflow_handler_roles`.
- Enforce transition gating:
  - nếu `allows_reject_outcome=false` thì “Từ chối” destination không được phép cấu hình.
- Acceptance: cấu hình sai không được lưu.
- Binding contract config:
  - workflow definition lưu reference đến handler role contract version (nếu có)
  - reject/approve/exception transition gating bám role contract, không hard-code
- Validation payload workflow definition:
  - validate transition kind, destination node existence, handlerRoleId hợp lệ
- Acceptance:
  - reject outcome không thể cấu hình sai cho role không cho phép
  - lỗi trả về field-level để UI hiển thị vị trí sai

### T1.2 Workflow runtime prototype (instances)
- Triển khai `POST .../start` tạo instance và move theo approve/reject/exception.
- Log transitions trong `workflow_instance_transitions`.
- Acceptance: có thể chạy thử end-to-end cho 1 definition.
- Endpoint simulate:
  - `POST /workflows/{workflowId}/instances:simulate` (không ghi vĩnh viễn)
- Transition contract:
  - mỗi transition lưu: actor role, handlerRoleId, destinationId, evidenceJson?
- Acceptance:
  - simulate và start cùng semantics transitions/exception

### T1.3 Role catalog: đồng bộ RACI option mapping
- `workflow_handler_roles` hỗ trợ cả:
  - legacy roles (`dept_head`, `bod`, …),
  - RACI roles (`raci_*`) từ catalog.
- Acceptance: mapping role step → thẩm quyền reject outcome hoạt động.
- Contract mapping:
  - handlerRole step liên kết `raciOrgColumnId` (nếu có)
  - `workflowAllowsReject` suy ra từ role contract version active
- Acceptance:
  - mapping RACI role đổi thì gating reject trong workflow đổi theo version

### T1.4 Workflow graph risk checks (tối thiểu)
- Kiểm tra vòng lặp/cycle ở mức cảnh báo (không bắt buộc sửa ngay).
- Acceptance: cảnh báo hiển thị rõ nhưng không chặn nếu policy cho phép.
- Config-time checks (tối thiểu):
  - reachable graph: start -> end-ok/end-reject/end-exception tồn tại
  - cycle detection: phát hiện cycle và gắn warning code
- Acceptance:
  - cockpit hiển thị warning list (không chặn nếu policy cho phép)

---

## Phase 2 — Đỡ giằng & liên kết (Integration + Cockpit)

### T2.1 Alert ingestion + dedupe + Hot Point ranking
- Endpoint ingests `alert_events`.
- Aggregator tạo/update `hot_points` theo hot_point_key + severity.
- Acceptance: Cockpit lấy hot_points đúng thứ tự ranking.
- Dedupe rules:
  - dedupe key theo `(hot_point_key, sourceSystem, sourceId)`
  - window theo cấu hình (giây/phút/ngày)
- Ranking:
  - severity + recency score + config weight (nếu có)
- Acceptance:
  - cùng event không tạo hot_point trùng trong dedupe window

### T2.2 Alert drill-down dữ liệu tương ứng
- Endpoint trả `hot_point_items` để xem event gốc.
- Acceptance: truy vết theo correlation-id.
- Drill-down contract:
  - trả về link/keys để cockpit mở event gốc + metadata tối thiểu
- Acceptance:
  - drill-down truy vết được correlation-id xuyên suốt

### T2.3 Kết nối Effective Config với validation runtime
- UI gửi payload runtime → backend validate theo contract fields + rules.
- Acceptance: lỗi trả về theo field-level (khớp UI).
- Wiring theo thứ tự bạn yêu cầu:
  - (a) `company_infrastructure` trước
  - (b) sau đó mới `company_group_hr`
- T2.3(a) Infrastructure wiring:
  - khi lưu `InfrastructureSite` theo `operatingEntityId` (legal entity):
    - backend lấy `GET /config/effective` cho module `infrastructure`
    - validate fields theo `required/readonly/validationRules`
    - resolve select options (facilityType/status) theo effective config subset
  - lưu runtime record kèm `effectiveConfigVersion` (origin/variant versions)
  - Acceptance:
    - không hard-code facility/status items trong validation
    - sai rule trả lỗi đúng `fieldCode` để UI hiển thị chính xác
- T2.3(b) HR wiring:
  - khi lưu HR metadata theo `companyId` (legal entity):
    - backend lấy effective config module `company_group_hr`
    - validate từng field definition theo contract (dataType/validationRules)
    - với select/radio: options subset lấy theo effective config
  - runtime metadata lưu kèm effectiveConfigVersion
  - Acceptance:
    - legal entity A/B có thể show/validate khác nhau đúng contract
- Contract-level validation:
  - field không có trong effective contract -> `FIELD_NOT_ALLOWED`
  - contract yêu cầu select nhưng payload rỗng -> `REQUIRED`
- Acceptance E2E:
  - ít nhất 1 entity có override + 1 entity không override cho cả Infrastructure + HR

---

## Phase 3 — Tinh chỉnh & mở rộng (Scale & Governance)

### T3.1 Mở rộng danh mục/catalog thật thay prototype
- Bổ sung pipeline publish danh mục/categorization theo module & scope.
- Acceptance: UI dropdown lên đúng items theo legal entity.
- Options sourcing thật:
  - pipeline publish category versions (global categories và items scope entity)
  - đảm bảo labels và ordering nhất quán theo category contract
- Contract stability:
  - fieldCode không đổi khi category items thay đổi
- Acceptance:
  - đổi category items không làm thay contract/validation của field

### T3.2 Mở rộng module riêng (HRM/CRM/Tài chính/Kế toán…)
- Mỗi module cung cấp:
  - Module Configuration Contract,
  - Module Configuration Variant (cho entity override).
- Acceptance: module mở rộng mới không cần sửa framework config.
- Module onboarding checklist:
  - module định nghĩa origin codes + domain_code
  - mapping moduleCode -> originCode set
  - định nghĩa categories phục vụ options sourcing
  - định nghĩa runtime entities và mapping fieldCode
- Acceptance:
  - thêm module mới: chỉ thêm contract origin/variant, merge engine không sửa

### T3.3 Audit log đầy đủ + correlation-id chuẩn
- Audit thay đổi Origin/Variant + publish + workflow config save.
- Acceptance: audit trace đủ để audit nghiệp vụ.
- Audit coverage tối thiểu (tối quan trọng cho config framework):
  - publish origin/variant
  - upsert runtime record (infrastructure/site, hr metadata)
  - validate fail/success theo effectiveConfigVersion
- Correlation-id chuẩn:
  - tạo correlation-id cho request config change
  - propagate vào workflow/alert/validation logs theo chain
- Acceptance:
  - truy ngược “ai làm, làm lúc nào, publish version nào, effectiveVersion nào dùng” bằng 1 query

### T3.4 Governance quy trình & kiểm soát rủi ro
- Bổ sung rule check nâng cao cho workflow:
  - ràng buộc reachable graph,
  - ràng buộc start/end usage,
  - cảnh báo vòng lặp theo policy.
- Acceptance: giảm lỗi cấu hình, tăng tự tin vận hành.
- Governance cho config framework:
  - “breaking change” origin phải có migration policy hoặc preview impact rõ ràng
  - rule check:
    - chặn override phá vỡ schema integrity
    - cảnh báo nếu variant override làm giảm coverage validate
- Publish preview:
  - ước lượng số runtime records bị ảnh hưởng (tối thiểu theo field set thay đổi)
- Acceptance:
  - giảm lỗi cấu hình khi origin/variant thay đổi trên môi trường thật

