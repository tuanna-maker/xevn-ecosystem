# XeVN OS — PM/PO Handoff Brief
> Bất kỳ PM/PO nào cầm tiếp cũng đọc được trong 30 phút — không cần training

| Field | Value |
|---|---|
| Ngày tạo | 2026-08-15 |
| Cập nhật bởi | Claude Code PM Successor |
| Status | ACTIVE |
| Nguồn chính | `docs/BRD.md` · `docs/brand-new-documents-20270801/BRD_NEW.md` · `SRS_NEW.md` · `TECH_SPEC_NEW.md` · `DB_DESIGN_NEW.md` · `docs/client-delivery/01_BRD_XeVN_OS.md` · `docs/program/REMAINING_WORK_2026-07-29.md` · `docs/program/customer-blueprint/PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md` |
| Lưu ý | Các file `docs/ecosystem/`, `docs/logistics/`, `docs/xbos/BRD.md`, `docs/hrm/BRD.md` chưa tồn tại tại thời điểm tạo tài liệu này. Nội dung được tổng hợp từ các BRD/SRS/TechSpec hiện có. |

---

## TL;DR — Dự án là gì (1 trang)

**XeVN OS** là nền tảng phần mềm đa tenant (multi-tenant) tập trung giúp Tập đoàn XeVN Group quản lý toàn bộ nhân sự, vận hành và catalog danh mục trên một hệ thống duy nhất, thay thế hoàn toàn Excel và phần mềm rời rạc của từng công ty con.

**Khách hàng:** XeVN Group — tập đoàn đa ngành (du lịch, vận tải, dịch vụ) gồm nhiều pháp nhân (legal entity) hoạt động độc lập.

**Nhà phát triển:** Unicom Technology Solutions.

**Pain points gốc (lý do dự án tồn tại):**

| Pain Point | Tác động |
|---|---|
| Data silos (Excel, phần mềm rời rạc) | Báo cáo tổng hợp mất 3–5 ngày/tháng |
| Quy trình không chuẩn hóa | RACI mờ, phê duyệt không kiểm soát |
| Onboarding công ty mới chậm | 2–4 tuần setup thủ công |
| HR thủ công | Chấm công giấy, lương Excel, lỗi cao |
| Không có audit trail | Không truy xuất cho kiểm toán |
| Rủi ro rò rỉ đa công ty | DB không ngăn cách tenant-by-design |

**Mục tiêu kinh doanh:**
1. Single source-of-truth: tenant, tổ chức, nhân sự, lương bổng
2. RBAC-first, event-driven, mở rộng được
3. Auditability đạt chuẩn doanh nghiệp
4. Onboard tenant mới < 30 phút end-to-end

**Trạng thái hiện tại (2026-08-15):** Phase 1 CHƯA HOÀN THÀNH. HOLD_DEPLOY active. UAT chưa sign-off.

---

## Hệ sinh thái XeVN OS — Bản đồ tổng thể

**Kiến trúc tổng quát (text diagram):**

```
CLIENTS:  Web Portal (Command Center)  |  HRM Mobile (React Native)
                     |                           |
          API GATEWAY: auth · rate-limit · routing · JWT validation
                |               |               |
         XBOS Service      HRM Service    Logistics Service
         (Plane A)         (Plane B)      (Phase 1 limited)
         xevn_xbos         xevn_hrm
                |               |               |
    PostgreSQL 16+ (row-level tenant isolation) + Redis 7+ + S3 Storage
```

**Stack kỹ thuật:**

| Layer | Tech |
|---|---|
| Backend | Node.js 20+, NestJS, TypeScript strict |
| Frontend Web | React 18+, Vite |
| Mobile | React Native 0.76+, Expo |
| Database | PostgreSQL 16+, Prisma ORM |
| Cache/Queue | Redis 7+, BullMQ (dead-letter queue) |
| Build | Turborepo + pnpm 9.15 |
| Container dev | Docker Compose |
| File storage | S3-compatible (MinIO dev, AWS S3 prod) |

**Runtime Ports (dev/Docker):**

| Service | URL |
|---|---|
| Portal/CC (portal-fe) | http://host:8088/command-center |
| HRM Web (hrm-fe) | http://host:8080/hr/ |
| HRM API (hrm-be) | http://host:3001/api/hrm |
| XBOS Web (xbos-fe) | http://host:5173 |
| XBOS API (xbos-be) | http://host:3002/api/xbos |

---

## XBOS — Vai trò Master Data Source (QUAN TRỌNG)

**XBOS = X-Business Operating System = Lõi nền tảng. Mọi module khác đều phụ thuộc vào XBOS, không được bypass.**

### XBOS là nguồn thật (SoT) cho:

| Dữ liệu | Ghi chú |
|---|---|
| Tenant (pháp nhân) | CRUD, lifecycle: PROVISIONING → ACTIVE → SUSPENDED → ARCHIVED |
| Membership (user-tenant) | Roles, status, scope (department / payroll-period) |
| RBAC Engine | Token issuance duy nhất qua xbos-api |
| Workflow Engine | 2-level approval (L1 24h → L2 48h), anti-self-approval |
| Catalog Governance | Platform catalog (SUPER_ADMIN) + tenant extension |
| Org Structure | Organization tree, org type (holding/subsidiary/division/department) |
| Audit Log | Append-only, bất biến, queryable by actor/action/resource/time |

### RBAC Roles:

| Role | Phạm vi |
|---|---|
| SUPER_ADMIN | Toàn nền tảng — tạo tenant, quản lý platform catalog |
| TENANT_ADMIN | 1 tenant — membership CRUD, cấu hình tenant |
| HR_MANAGER | HR module — employee, attendance, leave, payroll |
| DEPT_MANAGER | Phòng ban riêng — duyệt đơn nhóm |
| FINANCE_STAFF | Xem xét, phê duyệt, xuất lương |
| RECRUITER | Tạo JD, quản lý pipeline tuyển dụng |
| EMPLOYEE | Profile cá nhân, chấm công, gửi đơn nghỉ |
| Fleet Manager | Quản lý phương tiện (Logistics) |
| Dispatcher | Lên lịch chuyến xe (Logistics) |

### Auth:

| Quy tắc | Chi tiết |
|---|---|
| Token phát | Duy nhất bởi xbos-api; HRM/Logistics chỉ validate, không phát |
| JWT claims | tenantId + membershipId + roles[] |
| Access token | RS256, 2 giờ |
| Refresh token | Rotating, 30 ngày |
| Revocation | Redis blacklist keyed by jti, TTL = remaining lifetime |
| Lockout | 5 failed attempts → 30-min cooldown |
| X-Tenant-ID header | Phải match JWT tenantId claim, reject nếu khác |

### Catalog hai tầng:

| Tầng | Quản lý bởi | Đặc điểm |
|---|---|---|
| Platform catalog | SUPER_ADMIN | Bất biến với tenant, không hard-delete |
| Tenant extension | TENANT_ADMIN | Extend từ platform, không sửa/xóa platform row |

---

## HRM — Phân hệ con, không độc lập tenant

**HRM không quản lý tenant. HRM nhận tenant_id từ JWT do XBOS phát. HRM DB (xevn_hrm) KHÔNG có FK đến xevn_xbos.**

### 4 Trụ HRM (Enterprise Blueprint từ PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md):

| Trụ | Mã WBS | Phạm vi |
|---|---|---|
| M1 Tuyển dụng | WBS-HRM-REC | Định biên, JD, pipeline ứng viên (CV/OCR), phỏng vấn, offer, onboarding trigger |
| M2 Hồ sơ HR | WBS-HRM-CORE | Employee profile (public vs C&B), HĐLĐ, tài sản, giấy tờ checklist/OCR, khen thưởng/kỷ luật |
| M3 Chấm công & Nghỉ phép | WBS-HRM-ATT | Ca làm việc, GPS/IP/thiết bị check-in, bảng công chốt, phép năm/OT/BHXH |
| M4 Tiền lương & Phúc lợi | WBS-HRM-PAY | Engine công thức kéo-thả, phụ cấp/khấu trừ, BH/thuế, split-month, payslip PDF |

### Pipeline dữ liệu (bất di bất dịch):

```
Tuyển dụng (M1) → Nhân sự/Core (M2) → Chấm công (M3) → Lương (M4)
```

- **Bảng công chốt = SoT duy nhất cho tính lương**
- Module Lương KHÔNG gọi OT/Leave API trực tiếp
- Tuyển dụng KHÔNG giao tiếp trực tiếp với Lương (qua Nhân sự + cổng kích hoạt)

### Payroll workflow:

```
Batch → HR Review → Finance Approve → Tenant Admin Confirm → Issue → Lock
```

- Batch: ngày 25 hàng tháng (hoặc ngày làm việc gần nhất)
- Payroll 500 NV < 30 phút (NFR-03)
- Sau LOCKED: không chỉnh sửa (enforcement app + DB write guard)

### Leave policy Phase 1:

| Loại | Số ngày | Ghi chú |
|---|---|---|
| Annual | 12 ngày/năm | Đăng ký trước 3 ngày |
| Sick | Không giới hạn | Giấy bác sĩ nếu >= 3 ngày |
| Maternity | 6 tháng | Theo pháp luật |
| Unpaid | Không giới hạn | Chỉ approval, không trừ lương |
| Compensatory | Biến động | Dựa trên OT đã duyệt |

### Phân quyền hồ sơ (C&B separation):

| Vòng | Ai xem | Nội dung |
|---|---|---|
| Vòng ngoài (HC/công khai) | Tất cả | Họ tên, SĐT, phòng ban, chức vụ, gia đình |
| Vòng trong (C&B only) | HR/Finance/TA | Lương CB, phụ cấp, MST, ngân hàng, BHXH — KHÔNG hiện profile chung |

---

## Logistics — Phase 2 (chưa code đầy đủ)

**Phase 1 (Limited scope — đã trong scope nhưng giới hạn):**
- API CRUD cơ bản: tạo/xem xe, tài xế, chuyến
- KHÔNG có điều độ thời gian thực
- KHÔNG có route optimization
- Catalog Logistics (loại xe, nhóm hàng) → khai báo trên XBOS, Logistics consume

**Phase 2 (chưa bắt đầu):**

| Feature | Mô tả |
|---|---|
| Real-time dispatch | Lịch trình xe, phân công tài xế theo chuyến |
| GPS tracking | Theo dõi tài xế trên bản đồ thời gian thực |
| Route optimization | Tích hợp Google Maps/Mapbox |
| Logistics catalog mở rộng | Loại hàng, điểm đón/trả, tuyến cố định |
| Báo cáo Fleet | Hiệu suất xe, tiêu hao nhiên liệu |
| HRM integration | Tài xế = nhân viên, lương tài xế = payroll HRM |

**GAP Logistics:** Không có file BRD/SRS Logistics riêng tại thời điểm 2026-08-15. BA phải viết BRD Phase 2 trước khi dev bắt đầu.

---

## Multi-tenancy — Hiện trạng và vấn đề còn tồn đọng

### Cơ chế hiện tại:

| Nguyên tắc | Cơ chế thực thi |
|---|---|
| Data isolation | Row-level: tất cả bảng có `tenant_id`, mọi query qua DAL tự filter |
| Identity isolation | JWT mang `tenantId + membershipId + roles[]` — không cross-tenant |
| Config isolation | Mỗi tenant có catalog riêng (extend từ platform catalog) |
| Audit trail | Mọi thao tác ghi `{actor, tenantId, action, resource, timestamp}` |
| No hard delete | Tenant: chỉ SUSPENDED/ARCHIVED; Employee: chỉ INACTIVE |

### Tenant Lifecycle (XBOS API):

```
PROVISIONING → ACTIVE → SUSPENDED → ARCHIVED
```

- Tạo: SUPER_ADMIN qua Portal/CC → `POST /xbos/tenants`
- Kích hoạt: email link 48h → TA activate → ACTIVE
- Target: onboard < 30 phút end-to-end

### Sponsor decision (2026-08-15) — Cách quản lý Tenant:

> Tenant được quản lý qua **XBOS Settings > Quản lý Công ty** (mở rộng). Khi company được khai báo và kích hoạt trên XBOS, hệ thống tự sinh `tenant_id` dùng cho HRM và Logistics. HRM hiện đang dùng `tenant_id text DEFAULT 'xevn'` — pattern này sẽ được thay bằng giá trị thật khi XBOS Company Settings mở rộng xong.

**Không có module Tenant Management riêng.** Thay vào đó, XBOS Settings > Quản lý Công ty cần được mở rộng thêm:

| Field cần thêm | Mô tả |
|---|---|
| Subdomain / tenant_code | Mã định danh tenant trong URL và JWT |
| Phân hệ được phép | Chọn: HRM / Logistics / cả hai |
| Kích hoạt / tạm ngưng | Admin thao tác trực tiếp từ Company Settings |

**Hệ quả kỹ thuật:** Khi admin kích hoạt company → XBOS tự provision `tenant_id` → propagate sang HRM và Logistics qua event `TENANT_PROVISIONED`.

**GAP còn lại: HRM dùng `tenant_id TEXT DEFAULT 'xevn'` (thiết kế hiện tại — không phải bug, nhưng cần migrate)**

HRM DB (xevn_hrm) dùng tenant_id là TEXT, không phải UUID FK đến bảng tenant của XBOS. Đây là Plane A/B separation đúng doctrine. Sau khi XBOS Company Settings mở rộng xong, HRM sẽ nhận tenant_code thật thay vì hardcode `'xevn'`.

---

## Tiến độ Phase 1 — Đang ở đâu

**Trạng thái tổng:** HOLD_DEPLOY. Phase 1 CHƯA xong. UAT chưa có sign-off. (Nguồn: `docs/program/REMAINING_WORK_2026-07-29.md` + TEAM_WORKING_NOW.md)

### Đã DONE/CLOSED (evidence có):

| Item | Verdict |
|---|---|
| W1 HRM embed zero-mock | CLOSED GWC |
| W2 Portal legacy mock M-CC-01..15 | CLOSED GWC |
| W3 BE integrity & scope | CLOSED GWC |
| W4 Mobile scope parity | API PASS |
| W5 Verification & QC | GO WITH CONDITIONS |
| Wave A UX (UX-03, D5, UX-09, WCAG, A-TOKEN) | CLOSED GWC |
| Wave B EmptyState + PermissionFallback | GWC |
| U77 Business Change Compiler Phase A+B | CLOSED |

### Còn mở (Phase 1 exit chưa đạt):

| ID | Priority | Mô tả |
|---|---|---|
| G8 Mobile ILA | **P0 — Block** | ILA score < 16/20 trên 5 màn hình (Home/Approval/Nghỉ phép). Hiện ~14.5/20 |
| W4-PAY-B | P1 | Payroll FE brand Wave 4 — evidence MISS |
| W4-MOB-A | P1 | Mobile Face MVP chrome HOLD != LIVE |
| W6 Sponsor UAT | P1 | Chưa có UAT session chính thức |
| HTTPS Residual R3 | P1 | P1-EX-QA-HTTPS-RESIDUAL-03-R3 chưa closed |
| Corp domain | P2 | portal.xe.vn DNS/TLS blocked — W14 lane |

### Governance locks (không tháo):

| Lock | Mô tả |
|---|---|
| HOLD_DEPLOY | Không deploy khi chưa có lệnh rõ từ sponsor |
| U65 zero-seed | Không seed DB giả để pass QA |
| Portal bypass | Giữ localhost JWT/portal bypass cho deny-persona (R-C2-01) |

---

## Coding Doctrine — Những gì dev KHÔNG ĐƯỢC làm

### Plane A / Plane B (bất di bất dịch):

| | Plane A — XBOS DB (xevn_xbos) | Plane B — HRM DB (xevn_hrm) |
|---|---|---|
| Chứa | tenant, company, organization, RACI, catalog platform, workflow engine, audit log | employee, attendance, leave, payroll, recruitment, settings catalogs |
| FK nội bộ | Được (trong cùng plane) | Được (trong cùng plane) |
| FK cross-plane | TUYỆT ĐỐI CẤM | TUYỆT ĐỐI CẤM |

### DB Rules:

| Rule | Chi tiết |
|---|---|
| tenant_id HRM | `tenant_id TEXT NOT NULL DEFAULT 'xevn'` — KHÔNG phải UUID FK đến tenant table |
| Không cross-FK | Migration HRM mới: KHÔNG có REFERENCES tenant(id), REFERENCES company(id), REFERENCES organization(id) |
| Soft-delete bắt buộc | Mọi entity có `deleted_at TIMESTAMPTZ` — hard-delete bị cấm tuyệt đối |
| Cột bắt buộc | Mọi table phải có: `tenant_id`, `created_at`, `updated_at`, `deleted_at` |
| Unique composite | employee_code unique per tenant: composite `(tenant_id, employee_code)` |
| No raw SQL | Không viết raw SQL bypass DAL tenant filter |

### BE Rules:

| Rule | Chi tiết |
|---|---|
| Verify method tồn tại | Trước khi gọi method trên injected service → xác nhận method tồn tại trên service class |
| tenantId từ JWT | Controller resolve tenantId từ JWT claim — không dùng undefined, không hardcode |
| No cross-DB query | HRM service KHÔNG query table thuộc xevn_xbos (tenant, company, organization) |
| Event-driven cross-module | Giao tiếp cross-service qua named events (BullMQ) — direct DB access cross-service bị cấm |
| Error envelope | {code, message, details?, requestId} trên mọi API response |
| TypeScript strict | Cấm `any` trong code mới; dùng class-validator hoặc Zod |

### FE Rules:

| Rule | Chi tiết |
|---|---|
| hrmApi.ts boundary | File `hrmApi.ts` là boundary duy nhất: snake_case từ BE → camelCase type trước khi export |
| Component chỉ nhận camelCase | FE component không bao giờ nhận snake_case field trực tiếp từ BE |
| Settings pattern | PAT-SETTINGS-CATALOG-01: List table + Dialog (thêm/sửa) — KHÔNG inline form |
| Anti-patterns AP-01..06 | FE không tính toán nghiệp vụ (lương, BH, thuế, số ngày phép) — chỉ hiển thị kết quả từ BE |
| Null display | null/undefined/empty → hiển thị em dash (—), không để trống |
| Enum mapping | enum key slug → label tiếng Việt; UUID → tên đầy đủ từ context |

### Catalog Rules:

| Loại Catalog | Nơi khai báo | Quản lý bởi |
|---|---|---|
| Catalog toàn hệ (loại xe, nhóm hàng, route template, org type) | XBOS trước | SUPER_ADMIN |
| Catalog riêng HRM gắn luật (loại nghỉ BLĐ 2019, mức đóng BH theo nghị định) | HRM Settings | HR_MANAGER / TENANT_ADMIN |
| Catalog Logistics | XBOS trước, Logistics consume | SUPER_ADMIN |

---

## Roadmap còn lại — Ai làm gì tiếp theo

### Ưu tiên ngay (Phase 1 exit criteria):

| # | Item | Owner | Điều kiện done |
|---|---|---|---|
| 1 | G8 Mobile ILA >= 16/20 trên 5 màn hình bắt buộc | dev-mobile + qa-device | `pnpm run verify:mobile:layout` exit 0 |
| 2 | W4-PAY-B Payroll brand evidence PASS | dev-fe + qc | Evidence path + PASS verdict |
| 3 | W4-MOB-A Face MVP LIVE (không HOLD) | dev-mobile | Chrome LIVE confirm |
| 4 | W6 UAT session sponsor sign-off | pm + sponsor | Sign-off ghi vào evidence |
| 5 | HTTPS residual P1-EX-QA-HTTPS-RESIDUAL-03-R3 | qc + devops | Closed PASS hoặc DEFERRED explicit |

### Phase 1b / Gap fill (trước khi tuyên bố PROD-ready):

| Item | Mô tả | Owner |
|---|---|---|
| XBOS Settings > Quản lý Công ty — mở rộng | Thêm tenant_code, phân hệ được phép, kích hoạt/ngưng; event TENANT_PROVISIONED → HRM + Logistics | dev-be (XBOS) + dev-fe |
| Corp domain portal.xe.vn | DNS/TLS production setup | devops |
| C-HRMQC-01 VPS :8088 | Retest sau khi HOLD_DEPLOY được tháo | devops |

### Phase 2 (chưa bắt đầu):

| Module | Phạm vi | Prerequisite bắt buộc |
|---|---|---|
| Logistics Full | Real-time dispatch, GPS tracking, route optimization | BRD/SRS Logistics Phase 2 (chưa có — BA phải viết trước) |
| HRM Reports nâng cao | Custom reports, export scheduler, BI dashboard | Phase 1 HRM DONE |
| Integration bên thứ ba | API mở ra external | Phase 2 kickoff + ADR |
| AI/ML | Không trong scope XeVN OS hiện tại | TBD riêng |

---

## Tài liệu tham chiếu

| Tài liệu | Đường dẫn | Ghi chú |
|---|---|---|
| BRD chính (tiếng Việt, enterprise) | `docs/brand-new-documents-20270801/BRD_NEW.md` | Đọc trước |
| BRD gốc ngắn | `docs/BRD.md` | Tóm tắt draft |
| Client BRD (giao khách) | `docs/client-delivery/01_BRD_XeVN_OS.md` | Use case flows chi tiết |
| Client SRS | `docs/client-delivery/02_SRS_XeVN_OS.md` | Software requirements |
| SRS | `docs/brand-new-documents-20270801/SRS_NEW.md` | Use cases kỹ thuật |
| Tech Spec | `docs/brand-new-documents-20270801/TECH_SPEC_NEW.md` | Stack, port, job schedule |
| DB Design | `docs/brand-new-documents-20270801/DB_DESIGN_NEW.md` | Schema PostgreSQL đầy đủ |
| API Contract | `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` | Endpoint list + error codes |
| HRM Enterprise Blueprint | `docs/program/customer-blueprint/PO_HRM_ENTERPRISE_BLUEPRINT_PROGRAM.md` | 4 trụ WBS, mandate slide 14 |
| Field Display SRS - XBOS | `docs/xbos/FIELD_DISPLAY_SRS_XBOS.md` | Label map UI XBOS |
| Field Display SRS - HRM | `docs/hrm/FIELD_DISPLAY_SRS_HRM.md` | Label map UI HRM |
| Remaining Work Audit | `docs/program/REMAINING_WORK_2026-07-29.md` | P0/P1 backlog chi tiết |
| Agent Message Bus | `docs/program/AGENT_MESSAGE_BUS.md` | Trạng thái dispatch live |
| Team Working Now | `docs/program/TEAM_WORKING_NOW.md` | Pulse hiện tại |

**Files MISSING (cần tạo để bổ sung tài liệu hệ sinh thái):**
- `docs/ecosystem/` — BRD tổng hợp hệ sinh thái XeVN (chưa tồn tại)
- `docs/logistics/` — BRD/SRS Logistics Phase 2 (chưa tồn tại — GAP nghiêm trọng)
- `docs/xbos/BRD.md`, `docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md` — BRD/API chi tiết XBOS (chưa tồn tại)
- `docs/hrm/BRD.md` — BRD chi tiết HRM (chưa tồn tại)
- `docs/program/TEAM_CLAUDE_ROLLING_QUEUE.md` — Rolling queue (chưa tồn tại)
