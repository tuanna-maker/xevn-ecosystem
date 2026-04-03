# BRD/HLD — Nguyên lý xuyên suốt XeVN OS (Master Standard)

| Thuộc tính | Giá trị |
|---|---|
| Loại tài liệu | Master BRD/HLD (Chuẩn hoá nghiệp vụ xuyên suốt) |
| Phiên bản tài liệu | 2.0 |
| Ngày cập nhật | 2026-03-30 |
| Phạm vi | Toàn bộ hệ sinh thái XeVN OS |

---

## 1. Tóm tắt điều hành & Tầm nhìn

XeVN OS được xây theo tư duy nhất quán: **mọi người trong tập đoàn vào một cửa, nhìn đúng dữ liệu của mình, xử lý đúng việc của mình**.

Hệ thống vận hành theo mô hình **quản trị tập trung — vận hành phân tán**:
- **X-BOS (Hub)**: giữ chuẩn dữ liệu dùng chung (MDM/DNA), chuẩn chính sách KPI/policy, cơ chế phân quyền, và điều phối hành vi “theo quy tắc”.
- **Vệ tinh theo domain (Spoke)**: làm nghiệp vụ chuyên sâu (HRM, TRSPORT, LGTS, EXPRESS, X-SCM, X-OFFICE, X-FINANCE, CRM, X-MAINTENANCE…), nhưng **không tạo nguồn chuẩn** cho danh mục/định mức/policy.

Tầm nhìn vận hành:
- Giảm lệch dữ liệu giữa các công ty/đơn vị.
- Ra quyết định nhanh nhờ cảnh báo hội tụ và KPI thác nước.
- Chuẩn hoá “luật chơi” cho quy trình và phân quyền, đảm bảo công bằng theo dữ liệu.

---

## 2. Nguyên lý xuyên suốt (Golden Rules)

1. **Single Source of Truth tại Hub**  
   Danh mục, định danh chuẩn, DNA/metadata, policy/KPI bản hành… được phát hành từ Hub. Vệ tinh chỉ đọc phiên bản chuẩn.

2. **Dynamic by Default (Form/metadata driven)**  
   Thêm/sửa trường/thuộc tính nghiệp vụ dựa trên metadata; UI và validate thay đổi theo cấu hình, hạn chế thay code.

3. **Dữ liệu phân tầng để kiểm soát phạm vi**  
   Tách dữ liệu theo mô hình cấp độ để:
   - lọc theo tenant/đơn vị,
   - cô lập dữ liệu theo cấp,
   - phân quyền “hiển thị từ dưới lên” và “thực thi theo phạm vi từ trên xuống”.

4. **Versioned Master Data — Delta/Snapshot có kiểm soát**  
   Hub phát hành version; vệ tinh cache có TTL và `invalidate` theo `etag/version` để tránh lệch.

5. **Event-driven Alerting hội tụ tập đoàn**  
   Vi phạm định mức/cảnh báo ở vệ tinh sinh sự kiện → hội tụ tại Hub để lên “Hot Point Alert” và cockpit chỉ đạo.

6. **Workflow engine đồng bộ top-down & bottom-up**  
   Quy trình định nghĩa có thể được áp dụng linh hoạt cho từng tình huống vận hành:
   - Top-down: cấp cao ban hành → hệ thống ghi nhận → áp dụng.
   - Bottom-up: đề xuất từ vận hành → đẩy lên cấp phê duyệt → cập nhật áp dụng.

7. **Phân quyền theo cấp độ quản lý + theo vai trò quy trình**  
   - RBAC/RBAC phân theo “cấp độ quản lý” (ai thấy gì / thao tác gì / chỉnh cấu hình gì).
   - RACI/role mapping dùng để quyết định nhánh kết quả (ví dụ nhánh “Từ chối” chỉ hiển thị khi vai trò có thẩm quyền).

8. **Tài sản “sống” có định danh ổn định**  
   Hạ tầng/đối tượng dùng vòng đời: mọi hồ sơ (đầu thầu, xây dựng, khai thác, khấu hao, chi phí…) gắn về **một ID hạ tầng duy nhất**.

9. **Định mức/hao phí không gian có cơ chế phân bổ chuẩn**  
   Chi phí theo không gian (m2/m3) được phân bổ bằng tỷ lệ “cột sử dụng” giữa các đơn vị pháp nhân/khối liên quan.

10. **Không dựa vào file đính kèm ngoài**  
   Nghiệp vụ văn bản dùng trigger → trích xuất chuẩn hoá (OCR/parse) → tạo kết quả (PDF/điện tử) trong hệ thống; cấm “lệch nguồn” do file rời.

---

## 3. Bối cảnh & Stakeholders

### 3.1 Stakeholders chính
- **Ban Tổng Giám đốc / Chủ tịch / BOD**: cần toàn cảnh, cảnh báo nóng, KPI/các việc chờ duyệt.
- **CEO & Lãnh đạo pháp nhân**: điều hành theo phạm vi công ty/con.
- **Trưởng khối / Trưởng phòng**: điều phối đội nhóm theo phạm vi được giao.
- **HR/Khối chính sách & vận hành**: đảm bảo tuân thủ và công bằng thưởng/phạt.
- **Nhân viên vận hành**: chỉ thấy việc liên quan; biết việc cần làm ngay và deadline.
- **Admin hệ thống / Quản trị Hub**: quản trị menu, phân quyền, phiên bản danh mục, validate cấu hình.
- **Kiến trúc sư giải pháp & tích hợp**: đảm bảo hợp đồng API, versioning và truy vết.

---

## 4. Kiến trúc tổng thể (System Landscape)

### 4.1 Hub-and-Spoke
- **Hub (X-BOS)**: phát hành chuẩn dữ liệu và điều phối chính sách/cảnh báo.
- **Spoke (vệ tinh)**: vận hành domain và phát sự kiện khi có vi phạm/trạng thái cần hội tụ.

Quy tắc vàng: **vệ tinh không làm nguồn chuẩn**; chỉ đồng bộ/đọc theo hợp đồng và version do Hub phát hành.

### 4.2 Bốn lớp kiến trúc
1. **Presentation Layer**: Web/Mobile/Kiosk/B2B hiển thị theo vai trò/cấp độ.  
2. **Integration Layer**: Central SSO + API Gateway (routing, rate limit, correlation-id, audit).  
3. **Service Layer**: X-BOS Services (MDM/IAM/KPI/Policy/Governance/Alert aggregator) và Satellite Services (nghiệp vụ domain + event ingress).  
4. **Data Layer**: OLTP theo module + Data Warehouse/Analytics + Event Store/log phục vụ dashboard & điều tra.

---

## 5. Mô hình dữ liệu phân tầng (L1 → L4)

### 5.1 Các cấp độ
- **Level 1**: Tập đoàn.
- **Level 2**: Pháp nhân con (ví dụ Logistics/Xe khách/Visan).
- **Level 3**: Khối/Phòng ban (cây tổ chức).
- **Level 4**: Điểm chạm dữ liệu cụ thể (phòng ban, nhóm, điểm nhận…).

### 5.2 Nguyên lý vận hành dữ liệu phân tầng
- **Kế thừa từ trên xuống, phân quyền hiển thị từ dưới lên**: dữ liệu có nguồn gốc rõ ràng theo cấp; quyền truy cập hiển thị đúng “phần được giao”.
- Cô lập dữ liệu theo tenant + cấp độ quản lý để giảm rủi ro nhìn nhầm/đụng nhầm.
- Khi có cập nhật chuẩn tại Hub, vệ tinh nhận bản mới theo version để bảo đảm tính nhất quán.

---

## 6. Danh mục chuẩn & Master Data DNA Injection

Mục tiêu: thay vì thay code khi có thay đổi danh mục/thuộc tính, hệ thống cho phép **cập nhật master data có version** để UI và rule validate tự thích nghi.

Contract bắt buộc:
- Endpoint cung cấp danh mục theo version (`since=version` hỗ trợ delta).
- Payload có `etag/version` để vệ tinh invalidate cache.
- Metadata mô tả field/hành vi validate để UI render động.

---

## 7. Phân quyền xuyên suốt (RBAC + RACI mapping)

### 7.1 Hai trục phân quyền
1. **RBAC theo cấp độ quản lý**: quyết định “ai thấy gì / thao tác gì / chỉnh cấu hình gì”.
2. **RACI mapping trong workflow**: quyết định “nhánh kết quả nào được phép cấu hình/được phép thực thi” theo vai trò bước.

### 7.2 Ma trận phân quyền mức cao (Prototype)
| Cấp độ | Xem toàn tập đoàn | Xem công ty con | Thao tác nghiệp vụ | Chỉnh sửa cấu hình |
|---|---|---|---|---|
| Ban Tổng Giám đốc | Có | Có | Không (hoặc hạn chế theo chính sách) | Không |
| Lãnh đạo pháp nhân | Không | Có | Không | Không |
| Trưởng phòng | Không | Không | Có | Không |
| Nhân viên vận hành | Không | Không | Có | Không |

Ghi chú: quyền “Duyệt/Chỉnh cấu hình” thực tế được ánh xạ từ bộ chính sách (Hub) + scope dữ liệu (đơn vị).

### 7.3 RACI/Role mapping trong quy trình
- Danh mục vai trò step trong workflow có thể được gán theo cột chức danh của Excel RACI (Option 1).
- **Không áp dụng nhánh nghiệp vụ trái quyền**: ví dụ “Từ chối” chỉ hiển thị trên cấu hình/đồ thị khi vai trò có thẩm quyền (vai trò nhân viên không có thẩm quyền từ chối).

---

## 8. Engine Quy trình (Workflow) — định nghĩa, top-down/bottom-up & đồng bộ

### 8.1 Đối tượng quy trình
Quy trình được định nghĩa theo:
- Meta quy trình (mã, tên, áp dụng, tổng SLA).
- Danh sách bước: thứ tự, mô tả đầu việc, `handlerRoleId`, `stepAction`, SLA bước, module liên quan.
- Ba nhánh chuyển tiếp theo mô hình dữ liệu: **Đồng ý**, **Từ chối**, **Chuyển cấp BOD xử lý**.

### 8.2 Top-down & Bottom-up
- **Top-down (mặc định)**: cấp cao cấu hình → hệ thống ghi nhận phiên thực thi → giao nhiệm vụ theo vai trò bước → theo dõi SLA.
- **Bottom-up (đề xuất)**: dữ liệu/đề xuất phát sinh ở vệ tinh → tạo phiên thực thi → đẩy lên cấp phê duyệt → cập nhật áp dụng mới.

### 8.3 Đồng bộ cấu hình UI & vận hành engine
UI “Cấu hình bước & luồng” và “Sơ đồ luồng” là hai biểu diễn đồng nhất cùng một nguồn dữ liệu.
Engine khi vận hành dựa theo:
- `handlerRoleId` của bước,
- `transition.kind` và `destinationId`,
- và rules thẩm quyền theo mapping role.

---

## 9. Tự động hoá văn bản & trích xuất dữ liệu

Nguyên tắc bắt buộc:
- Nghiệp vụ văn bản đi qua chuỗi: **Trigger → Trung tâm dữ liệu → Kết quả trích xuất chuẩn hoá**.
- **Tuyệt đối không dựa vào file đính kèm ngoài** trong mô hình vận hành.

Định danh kết quả gắn vào mã/chân dung nghiệp vụ (ví dụ `Mã chi phí`) để quy đổi sang bảng điều khiển kế toán.

---

## 10. Tài sản sống & vòng đời hạ tầng

Khái niệm cốt lõi:
- Mỗi hạ tầng/đối tượng có vòng đời là “tài sản sống”.
- Mọi hồ sơ phát sinh theo thời gian (đầu thầu → xây dựng → khai thác → khấu hao & chi phí) đều gắn về **một ID duy nhất**.

Giá trị:
- Truy vết nguồn gốc chi phí.
- Đồng bộ trạng thái vật lý và trạng thái tài chính/kế toán.

---

## 11. Hạch toán chi phí quản trị & phân bổ không gian

Nguyên lý:
- Chi phí phát sinh được chuẩn hoá thành “mã chi phí” trong hệ thống.
- Phân bổ hao phí không gian dùng cơ chế tỷ lệ theo đơn vị đo (m2/m3) và “cột sử dụng” giữa các khối/pháp nhân liên quan.

Giá trị:
- Giảm nhập liệu thủ công.
- Tăng tính đúng đắn khi hợp nhất và giải trình.

---

## 12. Cảnh báo & Hot Point Alert (Cockpit)

Luồng hội tụ:
- Satellite phát sự kiện vi phạm/trạng thái.
- Hub gom trùng, xếp hạng, dedupe theo SLA và mức nghiêm trọng.
- Cockpit hiển thị “Hot Point Alert” để chỉ đạo xử lý.

Nguyên tắc dữ liệu sự kiện:
- Tenant, moduleCode, ruleId/metricCode, mức nghiêm trọng, timestamp, correlationId.

---

## 13. Yêu cầu phi chức năng (mức cao)

- **Bảo mật và phân tách tenant** theo scope và cấp độ.
- **Truy vết**: mọi thay đổi cấu hình/phiên bản và mọi sự kiện vận hành có `audit log` và `correlation-id`.
- **Tính khả dụng**: nền tảng có HA/replica và quan sát được (observability).
- **Đồng bộ gần real-time** cho cảnh báo; analytics phục vụ dashboard theo pipeline event/ETL.
- **Tính nhất quán dữ liệu** dựa trên versioning & contract danh mục.

---

## 14. Lộ trình triển khai (Roadmap) — từ nền móng đến liên kết

### Phase 0 — Chuẩn hoá nền tảng (Foundation)
- Chốt kiến trúc Hub-Spoke và hợp đồng API cốt lõi.
- Xây mô hình dữ liệu phân tầng L1-L4 + cây tổ chức.
- Chuẩn hoá DNA Category/metadata versioning.
- Thiết lập SSO + API Gateway + audit/correlation-id.

### Phase 1 — Đỡ trụ nghiệp vụ (Modules Boot)
- Khởi tạo phân hệ theo domain và pipeline sự kiện.
- Đưa vào RBAC theo cấp độ quản lý.
- Thiết lập engine quy trình mẫu (prototype) + cơ chế workflow triggers.

### Phase 2 — Đỡ giằng & liên kết (Integration + Cockpit)
- Hội tụ cảnh báo thành Hot Point Alert.
- KPI waterfall hội tụ: phân bổ mục tiêu từ trên xuống và hội tụ từ dưới lên.
- Policy & Incentive engine: chuẩn công bằng theo dữ liệu và phê duyệt trước thi hành.

### Phase 3 — Tinh chỉnh & mở rộng (Scale & Governance)
- Bổ sung bộ danh mục/rule đầy đủ (thay prototype bằng catalog thật).
- Mở rộng RACI mapping và role step theo danh mục khách hàng.
- Chuẩn hoá quy trình văn bản + trích xuất OCR/parse vào luồng nghiệp vụ.
- Governance: kiểm tra cấu hình workflow và kiểm soát rủi ro chu trình/vòng lặp.

---

## 15. Ma trận phân quyền mức cao (Governance — ai sở hữu gì)

| Năng lực | Chủ sở hữu nghiệp vụ | Chủ sở hữu cấu hình | Người thực thi |
|---|---|---|---|
| DNA Category / danh mục chuẩn | Quản trị Hub | Admin hệ thống | Hub (phát hành) |
| Policy KPI & ngưỡng vi phạm | Khối chính sách/HR | Admin Hub | Policy Engine |
| Workflow definition (bước & luồng) | Chủ sở hữu quy trình | Quản trị X-BOS | Workflow Governance UI |
| Ánh xạ role step ↔ RACI | Quản trị hệ thống / Kiến trúc sư | Admin Hub | UI mapping/catalog |
| Quyền xem/ghi/theo cấp độ | Quản trị hệ thống | IAM | SSO/IAM |
| Vận hành nghiệp vụ tại vệ tinh | Khối domain | Vệ tinh services | Satellite Services |

---

## 16. Giả định & rủi ro

Giả định:
- Dữ liệu danh mục/policy/KPI có version hóa và hợp đồng contract ổn định.
- Tenant và scope dữ liệu được gắn ngay từ tầng định danh/org engine.

Rủi ro:
- Lệch master data giữa Hub và cache vệ tinh nếu thiếu invalidate/version contract.
- Cấu hình workflow thiếu thẩm quyền role mapping dẫn tới hiển thị nhánh nghiệp vụ sai.
- Thiếu sự kiện chuẩn → cockpit cảnh báo không hội tụ chính xác.

Mitigation:
- Validate cấu hình workflow theo rules thẩm quyền.
- Audit log cho mọi thay đổi và chuỗi correlation-id.

---

## 17. Tuyên bố “điểm chốt nghiệp vụ”

Đây là “bản ghi nhớ nguyên lý” làm nền cho mọi BRD/SRS chi tiết sau này:
- **Hub là nguồn chuẩn**, vệ tinh là nguồn vận hành.
- **Dữ liệu phân tầng** + **phân quyền theo cấp độ** để người dùng chỉ thấy đúng phần.
- **Workflow engine** gắn vào thẩm quyền role step; không hiển thị cấu hình nghiệp vụ vượt quyền.
- **Cảnh báo hội tụ** để chỉ đạo tập đoàn theo ngưỡng/policy/KPI.
- **Tài sản sống** và **phân bổ chi phí** quy về định danh/chuẩn mã để hợp nhất.

---

## 18. Cấu hình theo nhiều đơn vị thành viên (Portal = cấu hình gốc)

### 18.1 Bài toán thực tế

Trong mỗi tập đoàn có nhiều **đơn vị thành viên**; mỗi đơn vị có **đặc thù** khác nhau nên:
- Danh mục dữ liệu và cấu trúc form (ví dụ cơ sở hạ tầng, hồ sơ nhân sự) của một đơn vị có thể **khác** đơn vị khác.
- Danh mục nhân sự của công ty vận tải có thể khác danh mục nhân sự của công ty tài chính/kế toán.
- Khi mở rộng sang các phân hệ riêng (HRM, CRM, Tài chính, Kế toán…), mỗi phân hệ sẽ có **cấu hình riêng** nhưng vẫn cần “neo” vào **phần khai báo gốc** đã xuất hiện trên Portal.

### 18.2 Khái niệm “cấu hình gốc” tại Portal

- Cấu hình hiển thị trên `X-BOS Unified Portal (Command Center)` là **Origin Template** theo từng phân hệ/domain.
- Origin Template định nghĩa “khung chung” để đảm bảo các phân hệ vận hành theo chuẩn của tập đoàn.
- Khi triển khai cho từng **đơn vị thành viên**, hệ thống cho phép tạo “biến thể” bằng cách **kế thừa + override** thay vì tạo lại từ đầu.

---

## 19. Mô hình Scope cấu hình & nguyên tắc kế thừa

### 19.1 Các lớp Scope cấu hình (tối thiểu)

1. **Global Origin (Portal/Hub)**  
   Khai báo gốc: schema form, danh mục chuẩn cấp tập đoàn (nếu có), metadata field và quy tắc validate cơ bản.

2. **Legal Entity Variant (theo đơn vị thành viên)**  
   Biến thể theo công ty con: override danh mục, override field/options, override template áp dụng.

3. **Module Variant (theo phân hệ HRM/CRM/Tài chính…)**  
   Biến thể theo phân hệ: cấu trúc và rule domain-specific; module vẫn phải tham chiếu Origin/Variant nếu có.

4. **Runtime Instance (theo nghiệp vụ/vòng đời)**  
   Dữ liệu cụ thể phát sinh theo bản ghi: được validate bởi effective config tại thời điểm phát sinh.

### 19.2 Quy tắc “effective config” (xếp ưu tiên)

Effective config dùng để render UI và validate dữ liệu được tính theo thứ tự ưu tiên:
- Module Variant (nếu tồn tại)  
  → override phần liên quan.
- Legal Entity Variant  
  → override phần còn lại.
- Global Origin (Portal/Hub)  
  → fallback cho toàn bộ phần chưa override.

Quy tắc này đảm bảo:
- Portal luôn là điểm neo chuẩn.
- Mỗi đơn vị thành viên có thể khác nhau ở dữ liệu danh mục/fields.
- Mở rộng phân hệ mới không phá vỡ chuẩn hiện có.

### 19.3 Cách xử lý danh mục thay đổi (options/catalog)

Đối với các trường có tập lựa chọn (select/radio/combobox):
- Cần phân biệt “danh mục gốc” (category) với “dữ liệu lựa chọn” (items) theo từng scope.
- Module/Entity chỉ override “items/options” trong phạm vi allowed; không được phá cấu trúc category do Origin cung cấp nếu không có cơ chế migration.

---

## 20. Thiết kế tối ưu để cấu hình linh hoạt theo dữ liệu (field contracts)

### 20.1 Field Contract (metadata) bắt buộc có

Mỗi field cấu hình theo portal/module phải có tối thiểu:
- `fieldCode` định danh ổn định (không đổi theo lần override).
- `dataType` (text/number/date/select/phone/email/…).
- `validationRules` (min/max/required/pattern…).
- `optionsSource` cho các kiểu có lựa chọn: trỏ đến category id và quy tắc lấy items theo scope.
- `displayRules` (visible/readonly/hidden theo role và scope).

### 20.2 Cơ chế optionsSource cho “danh mục khác nhau theo công ty”

`optionsSource` phải cho phép:
- Lấy items theo Legal Entity Variant (ưu tiên).
- Nếu entity không override items → dùng items từ Global Origin.
- Module có thể thêm items domain-specific cho category, nhưng vẫn phải tôn trọng cấu trúc category và rule validate.

### 20.3 Versioning để “biến động” mà vẫn nhất quán

Khi schema/contract thay đổi:
- Origin/Variant phát hành version mới.
- Runtime instance ghi nhận “effective version” để truy vết và tránh trường hợp cấu hình đổi làm dữ liệu cũ không còn hợp lệ.

---

## 21. Mở rộng theo phân hệ (HRM/CRM/Tài chính…) nhưng vẫn có Origin ở Portal

### 21.1 Module nào cũng phải cung cấp 2 lớp cấu hình

1. **Module Configuration Contract**  
   Module định nghĩa schema và các rule domain của module.

2. **Module Configuration Variant**  
   Cho phép override ở cấp Legal Entity (hoặc cấp thấp hơn nếu triển khai) mà không cần sửa Origin.

### 21.2 UI pattern đồng nhất

Trên Portal:
- Admin chọn phân hệ, xem Origin Template theo phân hệ.
- Admin tạo biến thể cho Legal Entity (kèm hiệu lực theo version).

Trong từng phân hệ riêng (HRM/CRM/Tài chính…):
- UI hiển thị “phần gốc” (inherited) và “phần đã override” (diff).
- Cho phép mở rộng/override có giới hạn theo contract của module.

---

## 22. Governance & kiểm soát rủi ro khi override nhiều lớp

### 22.1 Bảo toàn schema (schema integrity)

Hệ thống chỉ cho override:
- dữ liệu items/options
- hoặc các tham số nằm trong allowed contract  
tuỳ theo rule versioning và kiểm soát migration.

Không cho override “phá cấu trúc” nếu không có workflow migration kèm theo.

### 22.2 Audit & auditability

Mọi thay đổi Origin/Variant/Module Variant cần:
- audit log
- correlation-id theo chuỗi thay đổi
- thời điểm hiệu lực và version trước/sau.

### 22.3 Ràng buộc nghiệp vụ xuyên phân hệ

Nếu một field dùng chung qua nhiều phân hệ:
- category/fieldCode phải dùng chung contract và version.
- effective config của các phân hệ phải hội tụ về cùng “nguồn nghĩa” của field để tránh lệch thuật ngữ khi tổng hợp.

---

## 23. Điểm chốt nghiệp vụ cho phần “cấu hình theo đơn vị thành viên”

1. Portal luôn cung cấp Origin Template của từng phân hệ.
2. Mỗi đơn vị thành viên tạo Variant bằng kế thừa + override, không tạo lại từ đầu.
3. Module riêng mở rộng cấu hình theo contract, nhưng vẫn dựa trên Origin Template và Variant của entity.
4. Effective config được tính theo ưu tiên Module Variant → Entity Variant → Global Origin.
5. Versioning của contract đảm bảo “biến động nhưng truy vết được”, tránh phá dữ liệu runtime.

---

## 24. Tách bạch “Configuration Origin/Variant” và “Dữ liệu runtime”

Để giải bài toán nhiều công ty con có đặc thù khác nhau (ví dụ mỗi công ty có cấu trúc “hạ tầng cơ sở” và danh mục bên trong khác nhau), hệ thống phải tách 2 lớp:

### 24.1 Lớp A — Configuration (khung + hợp đồng)

Là phần “định nghĩa cách dữ liệu được tổ chức”:
- Field schema (nhóm field, kiểu dữ liệu, required/optional, validation rules)
- Options sourcing (category nào lấy items theo scope nào)
- Quy tắc hiển thị/thực thi theo role và scope
- Quy tắc workflow/policy ở mức cấu hình

Lớp này được quản trị theo Origin/Variant và versioned để hiệu lực ổn định.

### 24.2 Lớp B — Runtime data (dữ liệu phát sinh)

Là phần “dữ liệu thật” do nghiệp vụ tạo ra và sử dụng:
- Danh sách hạ tầng cụ thể (mỗi site), hồ sơ nhân sự cá nhân, bản ghi phòng ban, tài liệu/văn bản đã ban hành, bảng giá theo catalog…

Runtime data phải luôn được validate theo **effective config** tại thời điểm tạo/sửa (hoặc theo effective version được quy định bởi nghiệp vụ).

> Chốt: “Portfolio ở portal” là Configuration Origin, còn “công ty con” chỉ tạo Variant để data runtime của họ map đúng schema và đúng danh mục theo đặc thù.

---

## 25. Giải pháp nghiệp vụ cho “Hạ tầng cơ sở” (đúng bài toán bạn nêu)

### 25.1 Vấn đề hiện trạng prototype

Prototype “Hạ tầng cơ sở” hiện đang có form và danh mục kiểu mẫu, nhưng chưa mô hình hóa rõ:
- Hạ tầng cơ sở là **một entity runtime** (danh sách site)
- Hay là **một cấu hình schema runtime** (khối thông tin/field/danh mục bên trong)

Nếu tập đoàn có 3 công ty con, mà mỗi công ty con có “khối thông tin” và “danh mục” (facility types, tình trạng, nhãn năng lực, các field tùy biến…) khác nhau thì hệ thống không thể chỉ lưu một mẫu cứng dùng chung.

### 25.2 Mô hình đúng: Infrastructure Origin Template + Legal Entity Variant

#### (1) Origin Template: `infrastructure_origin`
Origin Template cho phép cấu hình:
- Entity schema “Infrastructure Site” (nhóm field: Thông tin cơ bản, Vị trí/trạng thái, Năng lực/Capacity, Pháp lý/Thuê…)
- Danh mục chuẩn/contract cho các trường select:
  - `facilityType` (loại hạ tầng): items theo scope
  - `status` (trạng thái vận hành)
  - Quy tắc validation cho các field số (areaSqm, palletMax…)
- Liên kết field:
  - `ownerLegalEntityId`
  - `operatingEntityId`

Origin Template phải là “khung chung được chấp nhận toàn tập đoàn” để vệ tinh/engine hiểu được schema.

#### (2) Legal Entity Variant: `infrastructure_variant` theo từng công ty con
Variant cho phép override:
- Allowed facility types (mỗi công ty chỉ chọn subset loại phù hợp)
- Required/readonly/hidden của các field nhóm (ví dụ công ty vận tải bắt buộc GPS, công ty tài chính có thể không dùng field năng lực pallet)
- Validation rules theo ngưỡng từng công ty (ví dụ leaseLegalEndDate bắt buộc hoặc không)
- Thêm custom fields (EAV/custom attributes) theo hợp đồng field contract (không làm vỡ schema)
- Override options items cho select trường hợp category items khác nhau

### 25.3 Quy tắc effective config khi render form hạ tầng

Khi admin/portal thao tác trong `company_infrastructure` cho một legal entity cụ thể:
- UI chỉ render field groups và select options theo **effective config** của legal entity đó.
- Runtime “site record” chỉ cho phép nhập/được validate theo schema đã merge.
- Audit log và version ghi rõ effective origin/variant version đã dùng.

### 25.4 Bảo toàn dữ liệu giữa các lần thay đổi

Để tránh phá dữ liệu runtime khi variant thay đổi:
- Variant publish tạo “effective version”.
- Runtime record ghi “effective config version” (hoặc ít nhất origin/variant version) để truy vết.
- Quy tắc migration:
  - Trường bị xóa/ẩn: giữ giá trị cũ nhưng không cho sửa (hoặc cho phép migrate theo policy).
  - Validation siết chặt: áp cho records ở hiệu lực sau, hoặc bắt buộc re-validate theo chính sách.

---

## 26. Quy luật áp dụng cho toàn bộ menu “Cài đặt hệ thống”

Mỗi mục trong menu `permission/workflow/document/measurement/pricing/...` phải được coi là 1 **domain config framework** với 2 lớp:
- **Origin Template** ở portal: neo chuẩn theo tập đoàn
- **Legal Entity Variant** (và/hoặc Module Variant) để tạo khác biệt theo công ty con

### 26.1 Mapping thực thể theo loại artifact

| Menu trong portal | Artifact cấu hình (Configuration Origin/Variant) | Runtime data (phát sinh) |
|---|---|---|
| `company_member_units` | Origin cho schema pháp nhân (profile), mapping org types | Dữ liệu pháp nhân thực tế |
| `company_infrastructure` | Infrastructure Origin Template + Infrastructure Variant | Danh sách site hạ tầng cụ thể |
| `company_dept_system` | Origin cấu trúc org types + rule quan hệ (nếu có) | Cây phòng/ban và metadata theo công ty |
| `company_group_hr` | HR profile schema contract + employee metadata variant | Hồ sơ nhân sự/field giá trị |
| `permission` | Role catalog + permission matrix contract theo module | Ma trận quyền thực tế theo role (và scope) |
| `workflow` | Workflow definition + role step contract + transition gating | Các phiên vận hành theo definition |
| `document` | Document category/template contract, policy phát hành | Danh sách văn bản/quy định + version |
| `measurement` | Unit/currency contract + rounding policy | Danh mục unit/currency thực tế theo công ty |
| `pricing` | Pricing catalog contract (price lists, currency, validity rules) | Dữ liệu bảng giá theo catalog và pháp nhân |

> Quy tắc quan trọng: runtime data luôn có `tenant/legal_entity scope` và được validate theo effective config của scope đó.

---

## 27. Nghiệp vụ Governance cho “Origin thay đổi nhưng Variant vẫn đúng”

Giống cách Microsoft/Apple quản lý “platform contract”:
- Origin Template là “API contract nghiệp vụ” (schema + rule + category sourcing).
- Khi Origin thay đổi:
  1. hệ thống tạo version origin mới,
  2. Variant có thể:
     - tự động inherit phần không conflict (default),
     - hoặc cần “rebase/review” khi conflict với override diffJson.
  3. Runtime data chỉ dùng effective version đã chốt.

Acceptance criteria:
- Không có cảnh “sửa origin làm dữ liệu công ty con vỡ”.
- Mọi thay đổi đều truy vết được “ai publish, publish lúc nào, variant nào bị ảnh hưởng”.

---

## 28. Giải pháp tổng thể (định vị lại theo SA tư duy)

Đề xuất “một luật chơi thống nhất” cho toàn hệ sinh thái:

1. **Portal là nơi khai báo Origin Template** theo từng domain.
2. **Mỗi công ty con là nơi tạo Variant** kế thừa và override theo đặc thù.
3. **Mỗi phân hệ** (HRM/CRM/Tài chính/Kế toán…) chỉ làm “Module Variant” theo contract của domain, không phá Origin.
4. **Effective config là kết quả hợp nhất** (Module → Entity → Portal) và là thứ duy nhất UI/BE dùng để validate & render.
5. **Workflow/policy/alert** cũng vận hành theo contract và gating theo role step; không dùng “logic ngầm” riêng cho từng công ty.

Như vậy, prototype sẽ dần chuyển từ “form mẫu dùng chung” sang “framework cấu hình gốc + biến thể theo công ty”, đúng yêu cầu tập đoàn lớn.

---

## 29. Taxonomy cấu hình: thứ gì cấu hình được, cấu hình theo cái gì

Để “Origin ở Portal” nhưng vẫn đáp ứng “mỗi công ty con khác nhau rõ rệt”, hệ thống cần tách cấu hình thành các artifact rõ vai trò:

### 29.1 Origin Template (cấu hình gốc neo chuẩn)
Là contract mô tả:
- **Cấu trúc dữ liệu**: các section/block, các field thuộc block đó.
- **Validation contract**: ràng buộc dữ liệu theo kiểu field.
- **Options sourcing contract**: field select lấy items từ category nào và theo scope nào.
- **Visibility/Policy contract**: field/block hiển thị/readonly/hidden theo role và scope.

Origin Template là “chuẩn nền” mà mọi Variant phải thừa kế.

### 29.2 Legal Entity Variant (cấu hình biến thể theo công ty con)
Là diff/override trên Origin Template theo pháp nhân:
- **Override visibility**: block/field nào được bật/tắt, required/readonly thế nào.
- **Override options**: subset category items được phép chọn.
- **Override rules**: validation ngưỡng theo công ty (nếu contract cho phép).
- **Custom attributes**: (nếu được phép) bổ sung field mở rộng nhưng vẫn trong giới hạn hợp đồng schema.

Variant là “tính đặc thù” của công ty con, nhưng không phá vỡ semantic contract của Origin.

### 29.3 Category Contract & Items (danh mục/giá trị)
Category Contract mô tả danh mục ở mức chuẩn (cái gì là category).
Category Items là dữ liệu danh mục thực tế, có thể:
- global items (dùng chung),
- entity-scoped items (khác theo công ty con).

### 29.4 Effective Config (hợp nhất để chạy)
Effective Config là kết quả merge:
Module Variant → Entity Variant → Global Origin

Effective Config là thứ duy nhất UI/BE dùng để:
- render form (field/block visibility),
- validate dữ liệu runtime,
- đảm bảo mọi ghi nhận lưu trúng schema đúng phiên bản.

### 29.5 Runtime Instance Data (dữ liệu thật)
Runtime data là danh sách site hạ tầng, hồ sơ nhân sự, bản ghi văn bản/quy định…
Runtime data phải:
- gắn `tenant/legal_entity scope`,
- gắn `effective version` để truy vết & xử lý migration.

---

## 30. Infrastructure cơ sở: phân tích nghiệp vụ và artifact mapping

### 30.1 Infrastructure là Runtime Instance hay Configuration?
Trong nghiệp vụ tập đoàn:
- “Hạ tầng cơ sở” là **Runtime Instance** (danh sách điểm logistics/kho/bãi/văn phòng … của từng công ty).
- Nhưng “cách hiển thị và các field nào xuất hiện” là **Configuration** (Origin/Variant).

Vì vậy:
- Runtime: `InfrastructureSite` (siteCode, name, facilityType, status, GPS, capacity…)
- Configuration: `InfrastructureSite contract` (block + field + validation + options sourcing) theo Origin/Variant.

### 30.2 Khi có 3 công ty con khác nhau: hệ thống phải làm được gì
Ví dụ:
- Công ty vận tải cần GPS + quy tắc nhập tọa độ và bắt buộc “tình trạng vận hành”.
- Công ty tài chính/kế toán có thể không dùng một số field năng lực pallet/xe hoặc có field khác.
- Một công ty có “khối pháp lý/thuê” bắt buộc, công ty khác có thể tắt/readonly.

Do đó cấu hình cần hỗ trợ:
1. **Khác block**: bật/tắt nhóm field.
2. **Khác field**: required/readonly/hidden.
3. **Khác category items**: facilityType/status subset.
4. **Khác validation ngưỡng**: areaSqm/capacity tối thiểu/tối đa theo công ty.
5. **(Tuỳ chọn) Custom attributes**: field bổ sung có giới hạn contract.

### 30.3 Proposal artifact cho Infrastructure (Origin/Variant/effective)

#### (1) Infrastructure Origin Template (khung chung)
- Origin code: `infrastructure_origin`
- Block contract (ví dụ):
  - `block_general` (Tên hạ tầng, Mã định danh)
  - `block_type_status` (Loại hình, Trạng thái vận hành)
  - `block_capacity` (Sức chứa/capacitySummary, areaSqm…)
  - `block_location_contact` (GPS, địa chỉ chi tiết, hotline, directManager)
  - `block_legal_lease` (leaseLegalEndDate, ownerLegalEntityId…)
  - (tuỳ biến) `block_custom` để chứa custom attributes nếu contract cho phép

- Field contract:
  - `facilityType`: select → `category=INFRA_FACILITY_TYPE` theo scope
  - `status`: select → `category=INFRA_STATUS` theo scope
  - validation: số không âm, format GPS, độ dài hotline…

#### (2) Infrastructure Legal Entity Variant (biến thể theo công ty con)
Variant cho từng `legal_entity_id` gồm:
- `visibilityRules`: bật/tắt block/field
- `validationOverrides`: ngưỡng riêng
- `optionsOverrides`: chỉ cho phép facilityType/status subset
- `customFieldAllowList`: (nếu có) tên field mở rộng được phép khai báo

#### (3) Effective config áp cho runtime “site”
Khi user tạo/chỉnh sửa site:
- hệ thống lấy `effective config` theo `tenant + legal_entity_id`
- validate input theo contract đã merge
- ghi runtime record kèm `effective config version`.

### 30.4 Quy tắc migration khi Origin/Variant thay đổi
- Khi Variant override thay đổi visibility:
  - record runtime cũ vẫn đọc được (không xóa).
  - record mới phải theo contract effective mới.
- Khi Origin thay đổi semantic field:
  - tạo version origin mới,
  - Variant có thể rebase,
  - runtime records xác định effective version tại thời điểm phát sinh.

---

## 31. Quy luật áp dụng cho toàn menu “Cài đặt hệ thống”

Chuyển từ “mỗi menu một logic khác nhau” sang “mọi menu là framework config”.

### 31.1 Mỗi menu có 2 lớp: Configuration Origin/Variant và Runtime data
- `company_member_units`: runtime là pháp nhân + cây tổ chức; configuration là metadata field/validation phục vụ org.
- `company_infrastructure`: runtime là site; configuration là infrastructure origin/variant contract.
- `company_dept_system`: runtime là phòng/ban của từng công ty; configuration là org schema metadata (fields, relation rules).
- `company_group_hr`: runtime là nhân sự + giá trị field; configuration là HR schema + metadata field contract.
- `permission`: runtime là matrix áp dụng thực thi; configuration là role catalog + permission rule contract.
- `workflow`: runtime là workflow instance; configuration là workflow definition contract + gating.
- `document`: runtime là tài liệu/quy định; configuration là category/template contract + versioning.
- `measurement`: runtime là unit/currency thực tế; configuration là rounding & unit semantics contract.
- `pricing`: runtime là bảng giá; configuration là pricing contract + validity rules theo entity scope.

### 31.2 Contract bắt buộc chung cho mọi menu
Mọi menu muốn “biến động theo công ty” đều phải hỗ trợ tối thiểu:
- Origin Template (schema + validation + options sourcing)
- Variant override theo legal_entity_id
- Effective config merge theo ưu tiên
- Runtime instance data gắn effective version
- Governance (publish version + audit + migration rule)

---

## 32. Chuẩn quản trị giống Microsoft/Apple: “Platform contract + Diff”

Để giống tư duy Apple/Microsoft:
- Portal cung cấp platform contract (Origin).
- Mỗi công ty con là một “fork” có kiểm soát (Variant diff).
- Module/Phân hệ là lớp chạy trên contract (Module variant nếu cần).
- Khi contract nền thay đổi:
  - có version,
  - có release notes/migration rules,
  - có cơ chế rebase/override-review.

Chốt: platform contract đảm bảo consistency, variant diff đảm bảo đặc thù.

---

## 33. HR (Hồ sơ nhân sự tập đoàn) trong mô hình Origin/Variant

### 33.1 Tách bạch Configuration và Runtime cho “Hồ sơ nhân sự”
- **Runtime data**: giá trị metadata của từng nhân sự (mỗi nhân sự có một tập giá trị theo effective config của công ty họ).
- **Configuration**: “các trường metadata nào được phép khai báo, kiểu dữ liệu, validation, danh mục lựa chọn” — do Origin/Variant quyết định.

### 33.2 Origin Template (Portal) cho HR metadata
Origin Template của phân hệ `company_group_hr` phải cung cấp tối thiểu:
- danh sách `fieldCode` ổn định (định danh trường)
- `dataType` và `validationRules` theo hợp đồng dữ liệu
- `options sourcing contract` (nếu field là `select`/`radio`):
  - lấy options theo scope `global` hay theo `legal_entity`
- quy tắc mặc định hiển thị/required/readonly ở mức chuẩn tập đoàn

### 33.3 Legal Entity Variant cho HR metadata
Variant theo `legal_entity_id` cho phép override:
- visibility: bật/tắt/required/readonly theo công ty con
- options subset: chọn subset items cho các category liên quan
- validation ngưỡng theo công ty (khi contract cho phép)
- (tuỳ chọn) field additions trong giới hạn `allowed schema` của Origin

### 33.4 Effective config & runtime validation
Khi hệ thống render form “hồ sơ nhân sự” cho một công ty con:
- phải lấy effective config theo `tenant + legal_entity_id`
- validate giá trị nhân sự theo effective config
- runtime record bắt buộc gắn `effective config version` để truy vết & migration

### 33.5 Gợi ý map với prototype hiện có
Prototype hiện lưu config HR metadata theo từng `companyId` (danh sách metadata field + dataType + selectConfig).
Trong framework Origin/Variant:
- danh sách đó chính là “effective fieldDefinitions” ở cấp legal entity
- lần refactor tiếp theo sẽ chuyển từ “inline prototype payload” sang “field contract + options sourcing” chuẩn hóa như Origin/Variant engine.

---

## 34. Quy chuẩn Options Sourcing theo Legal Entity (áp cho mọi menu)

### 34.1 Mục tiêu
Đảm bảo mọi trường có lựa chọn (`select/radio/combobox`) hoặc danh mục gắn hợp đồng (category/template) đều:
- lấy đúng items theo `tenant + legal_entity_id`,
- vẫn giữ nguyên contract semantic từ Origin,
- không “lệch danh mục” giữa các công ty con.

### 34.2 Contract bắt buộc cho mọi options-field
Mỗi field/options phải có 3 lớp thông tin:
1. **categoryCode** (định danh danh mục)
2. **options scope** (global | legal_entity | module)
3. **allowed items rule** (Entity variant được phép override tới mức nào)

Quy tắc chung:
- Origin cung cấp cấu trúc danh mục (category contract).
- Legal Entity Variant chỉ override **items/options** (subset, ordering, label mapping) trong allowed contract.
- Khi runtime lưu dữ liệu: hệ thống phải kiểm tra “giá trị người dùng chọn” có nằm trong effective allowed items không.

### 34.3 Quy tắc effective options merge
Effective options = merge theo ưu tiên:
- Legal Entity Variant (nếu tồn tại) → override subset và label mapping
- Module Variant (nếu tồn tại) → bổ sung/override theo domain
- Global Origin → fallback cho items không bị override

### 34.4 Mapping nhanh theo menu hiện có
- `company_infrastructure`: `facilityType` + `status` lấy từ category có scope `legal_entity` (effective subset theo công ty)
- `company_group_hr`: metadata field “kiểu chọn” (`dataType=select`) dùng options sourcing theo scope `legal_entity` (hoặc global nếu Origin không override)
- `permission`: “quyền/role mapping” theo hợp đồng role catalog; reject/approve gating theo role contract (không dùng category items nhưng vẫn là effective contract)
- `workflow`: transitions có thể gating theo role contract (ví dụ reject outcome chỉ áp dụng cho handler roles có thẩm quyền)
- `document`: document type/template là category contract + versioned policy; entity variant chọn template/policy theo legal entity scope
- `measurement`: unit/currency semantics là contract để tính toán KPI/measurement; entity variant override rounding & unit semantics allowed
- `pricing`: pricing catalog/template hợp lệ theo effective validity window và legal entity scope

