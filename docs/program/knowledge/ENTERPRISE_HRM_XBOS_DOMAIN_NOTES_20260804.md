# Domain Enterprise — HRM + XBOS (case study XeVN)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-DOMAIN-ENT-20260804` |
| **Version** | **v2** (2026-08-04) — research + vận hành đủ sâu để kế thừa |
| **Mục đích** | PM/PO/BA/SA/Dev/QA **cùng một bản đồ nghiệp vụ** khi đạo diễn hoặc implement |
| **Không thay** | SRS / TechSpec / OpenAPI — đây là **bối cảnh + rủi ro + cách nghiên cứu** |
| **Case study** | Tập đoàn XeVN · XBOS Command Center · HRM embed · Mobile ESS |

> **Tiêu chí đạt:** Người đọc nêu được *holding vs CT thành viên*, *ai SoT catalog*, *dual-plane ID*, *persona test*, *UC mẫu và cạm bẫy* — không chỉ «multi-company / approval matrix».

---

## Cách dùng (PM/PO sau + Claude/agent research)

1. Đọc §1–§3 trước mọi wave HRM/XBOS.  
2. Khi research đối thủ: dùng §8 **khung câu hỏi** — không copy UI.  
3. Khi nghi scope 409/404: đọc §1.3 + §1.4.  
4. Khi design/fix catalog: §2 + case §7.  
5. Claude / peer PM: dán packet `docs/program/TEAM_CLAUDE_DOMAIN_TRAINING_PACKET.md`.

---

## 1. Mô hình tập đoàn XeVN (bắt buộc thuộc)

### 1.1 Các tầng pháp nhân

| Tầng | Khái niệm trên hệ | Ai dùng | Thấy gì |
|------|-------------------|---------|---------|
| Tập đoàn / Holding | Scope `main` / master tenant | `ceo@xe.vn` (Group CEO) | Rollup nhiều CT; catalog publish; clone danh mục |
| Công ty thành viên | Legal entity / company slug riêng | vd. `du-lich.ceo@xe.vn` | **Chỉ** dữ liệu CT mình; bị chặn thao tác tập đoàn |
| Đơn vị / OU | Phòng ban, chi nhánh trong CT | HRBP / QL | Thu hẹp tiếp theo OU + role |

**Mật khẩu pilot chuẩn (không commit secret khác):** `Xevn@2026` (web UAT matrix).

### 1.2 Sản phẩm & cổng kỹ thuật (local UAT)

| Thành phần | Port / lối vào | Ghi chú |
|------------|----------------|---------|
| hrm-api | `:28001` | Nest HRM — NV, nghỉ, công, tuyển… |
| xbos-api | `:28002` | Nest XBOS — org, WF, catalog sync, CC APIs |
| web-portal | `:5173` / `:5175` (theo env) | Command Center + embed HRM |
| Mobile | Expo app | ESS; cùng BR web khi có bridge |

`pnpm dev` **không** luôn bật hrm-api — thiếu `:28001` → portal proxy 500 (không phải bug FE logic). Kiểm: `pnpm run qc:fe-be-health`.

### 1.3 Dual-plane định danh (nguồn lỗi #1)

| Plane | Ví dụ | Dùng ở |
|-------|-------|--------|
| Org / XBOS UUID | UUID legal entity | Header/token scope XBOS, nhiều API CC |
| HRM slug / tenant code | `trsport`, `finance`, `du-lich`… | HRM list filters, một số embed |

**Hậu quả nếu lệch:** List 200 nhưng get-by-id 404; hoặc 409 `companyId mismatches token scope`.

**Việc role phải làm:**

| Role | Việc |
|------|------|
| BA-Data | Precond TC ghi rõ UUID **và/hoặc** slug |
| SA | Xác nhận resolver list = get-by-id |
| Dev-BE | Không hardcode slug trong service khi API nhận UUID (và ngược lại) |
| Dev-FE | Gửi `x-company-id` / scope khớp token khi mutate |
| QA | Mỗi UF ghi persona + company đang đứng |

### 1.4 Kiêm nhiệm & JWT

- User có thể có `memberships[]` nhiều CT.  
- Inbox / duyệt / list phải theo **membership đang active** + role.  
- Test FD: user thuộc CT A không duyệt đơn CT B.

### 1.5 RBAC ladder (tóm tắt vận hành)

```text
Group CEO (holding) → thấy / làm thao tác tập đoàn
  → CEO CT thành viên → chỉ CT mình
       · clone catalog tập đoàn → HTTP 403 + XBOS-AUTH-003 (không nhầm 409 CFG-409)
       · sai companyId vs token (dual-plane) → thường 409 SCOPE_CONTEXT_MISMATCH
    → HRBP / QL → OU hẹp hơn
```

ADR tham chiếu: `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` (và ADR HRM scope ladder nếu có trong repo).

---

## 2. Catalog & cấu hình — ai là SoT?

### 2.1 Nguyên tắc

| Nguồn | Vai trò |
|-------|---------|
| **XBOS catalog (tập đoàn)** | SoT khung danh mục nhóm (loại nghỉ, ca, hợp đồng…) |
| **Publish / pull** | Đẩy xuống CT / HRM tiêu thụ — HRM **không** tự ý trở thành SoT khung nhóm |
| **HRM tenant extension** | Mở rộng/ghi đè **cho phép** theo UC — không xóa SoT tập đoàn im lặng |
| **Clone** | Nhân bản bộ giá trị sang đích (UC DM-09 / LOG-09) — khác apply-to-members |

### 2.2 Ba thao tác dễ nhầm (P0 training)

| Thao tác | UC neo | API (case 2026-08-04) | HP code | Conflict / fail | Không phải |
|----------|--------|------------------------|---------|-----------------|------------|
| Sao chép 1 bộ danh mục | **XBOS-DM-09** | `POST /api/xbos/config-sync/catalog/:catalogKey/clone` | `XBOS-CFG-206` | `409` + `XBOS-CFG-409` | Apply / bundle |
| Sao chép bundle LOG | **XBOS-DM-LOG-09** | `POST /api/xbos/config-sync/catalogs/clone-bundle` + `domains=['logistics']` | `XBOS-CFG-205` | `409` + `XBOS-CFG-009` | Single-key clone |
| Áp danh mục xuống members | **DM-HRM-07** | `POST /api/xbos/config-sync/catalog/:catalogKey/apply-to-members` | `XBOS-CFG-204` | Auth/allow-list fail (không = CFG-409 dest trùng) | Clone |

**AU pin:** member JWT (`du-lich.ceo`) gọi clone/apply tập đoàn → **`403` + `XBOS-AUTH-003`**.  
**Không nhầm:** `409 XBOS-CFG-409` = dest trùng mã (DM-09); `409 SCOPE_*` = dual-plane/header; `403 AUTH-003` = không đủ quyền.

### 2.3 Việc từng role trên catalog

| Role | Việc cụ thể |
|------|-------------|
| BA-P | TC phân biệt 3 thao tác; FD conflict; AU member |
| BA-D | Key catalog, ownership sau clone |
| SA | Không gộp endpoint; OpenAPI đúng |
| Dev-BE | Service clone riêng; jest conflict |
| Dev-FE | **Hai menu** nếu cả DM-09 và LOG-09; không hijack Apply panel |
| QA | Browser đúng menu HDSD; Network đúng path |

---

## 3. Workflow doanh nghiệp (XBOS WF × HRM)

### 3.1 Pattern kỳ vọng enterprise vs AS-IS XeVN

| Pattern | Kỳ vọng enterprise | AS-IS XeVN (honest) | Việc team |
|---------|--------------------|--------------------|-----------|
| Hai cấp duyệt | L1 QL → L2 GĐ theo ngưỡng tiền/ngày | Leave nhiều nơi **1 bước** | SPEC_GAP ladder — **cấm invent PASS L2** |
| Chống tự duyệt | Submitter ≠ approver | BR-WF-04 | TC FD bắt buộc |
| Inbox | Task từ instance tạo trên FE | Có thể trống | U65: **không** seed inbox để QA |
| SLA / escalate | 24h/48h (SRS_VN có thể mô tả) | Chỉ TC khi có impl | Không fake SLA PASS |
| Đa CT | Definition × company × catalog | U84 matrix | Primary browser theo company |

### 3.2 Chuỗi FE đúng (mọi mutate WF)

```text
Tạo / cấu hình trên UI → Lưu 2xx → (nếu có) Inbox thấy task
  → Duyệt/Từ chối → FE đổi trạng thái → F5 còn đúng
```

Inbox trống = 🟡 BLOCKED hoặc tạo nguồn từ FE trước — không `pnpm seed:workflow:inbox`.

### 3.3 Persona U84 / U78 thường dùng

| Persona | Email | Dùng để |
|---------|-------|---------|
| Group CEO | `ceo@xe.vn` | Holding, catalog clone, rollup |
| CEO Du lịch | `du-lich.ceo@xe.vn` | AU scope hẹp, 403 clone tập đoàn |
| (Khác theo matrix) | `*.ceo@xe.vn` CT | Primary REC/ATT theo CT |

Leave@CO-DL: có thể **BLOCKED-EXTERNAL** nếu 0 NV finance — cần Sponsor «bootstrap môi trường dev», không tự seed trong QA.

---

## 4. HRM — xương sống theo domain

Mỗi domain: **BR cốt lõi** + **cạm bẫy** + **file SoT gợi ý** (luôn mở file thật, không tin bảng này thay SRS).

### 4.1 Hồ sơ nhân viên

| BR / rule | Cạm bẫy |
|-----------|---------|
| CCCD/unique theo quy tắc SRS | Trùng im lặng |
| `manager_id` hierarchy | Duyệt nghỉ sai người |
| Scope CT | CEO CT A thấy NV CT B |

SoT gợi ý: `docs/hrm/SRS.md` · bang tong hop HRM.

### 4.2 Nghỉ phép (Leave)

| BR | Cạm bẫy |
|----|---------|
| Loại nghỉ + số dư | Âm số dư vẫn submit |
| Overlap đơn | Hai đơn chồng ngày |
| Ốm ≥ N ngày + file | Bỏ attach vẫn PASS |
| Notice period | Submit sát giờ |
| **L2 ladder** | AS-IS 1 bước → **SPEC_GAP** — exemplar `UC-FR-H03_LEAVE` |

### 4.3 Chấm công

| BR | Cạm bẫy |
|----|---------|
| ESS update-request → approve | FE không gửi `x-company-id` → 409 |
| Thời gian ISO | Wire sai → epoch **01/01/1970** |
| Geofence mobile | Fake GPS PASS |
| Empty bảng | Auto-reload storm ≠ PASS (console sạch ≠ business PASS) |

### 4.4 Tuyển dụng

| BR | Cạm bẫy |
|----|---------|
| Plan → YCTD → pipeline | JD catalog **sai CT** |
| Candidate DTO | Field FE không khớp API |
| Hire link NV | Orphan candidate |

### 4.5 Lương / BH / hợp đồng

| BR | Cạm bẫy |
|----|---------|
| Kỳ khóa | Sửa payslip kỳ khóa |
| Scope CT | Xem lương CT khác |
| Catalog BH schema | Build-gap schema |

### 4.6 Mobile ESS

Cùng BR web; offline queue; không fake approve; UUID header.

### 4.7 Quyết định nhân sự (UC-HRM-27)

- SoT HRM: **quyết định** — không gộp «báo cáo» chỉ vì nhãn ecosystem STT 351 cũ.  
- `/reports` = UC riêng nếu có.  
- W3: BACKLOG-HOLD rewrite; code PARTIAL.

---

## 5. Đối thủ / chuẩn enterprise (để PO hỏi đúng — không copy)

Tham chiếu tư duy: MISA AMIS, SAP SuccessFactors, Workday, các HRM VN peer.

| Năng lực enterprise | Câu hỏi áp vào XeVN | Phase1 XeVN (honest) |
|---------------------|---------------------|----------------------|
| Multi-company | Holding vs member có RBAC thật? | Có ladder + 409 scope |
| Approval matrix | Role × process × ngưỡng? | Một phần WF; leave L2 gap |
| Audit trail | Ai duyệt lúc nào? | Cần TC/API theo UC |
| Catalog governance | Ai SoT? Clone/publish? | XBOS SoT + clone UC |
| ESS mobile | Offline + cùng BR? | Đang có lane mobile |
| Observability | Metrics/error code ổn định? | NFR baseline + mã `XBOS-*`/`HRM-*` |

**PO research đúng cách:** chọn 1 năng lực → map UC Phase1 → `code_readiness` → gap backlog — không viết bài marketing.

---

## 6. SOLID trên Nest/React (áp dụng được ngay)

### 6.1 Nest (hrm-api / xbos-api)

| Nguyên tắc | Việc Dev-BE làm | Anti-pattern |
|------------|-----------------|--------------|
| **S** | 1 service bounded context (config-sync clone ≠ payroll) | God `AppService` |
| **O** | Conflict policy / onConflict strategy | if/else 200 dòng trong controller |
| **L** | Response DTO ổn định cho FE/Mobile | Đổi shape im lặng |
| **I** | Module API tách domain | Client «gọi hết mọi thứ» một class |
| **D** | Service → repo/port | Supabase/Prisma rải controller |

### 6.2 React portal

| Nguyên tắc | Việc Dev-FE làm | Anti-pattern |
|------------|-----------------|--------------|
| **S** | Panel clone ≠ panel apply | Một component 2 nghiệp vụ nút giống nhau |
| **O** | Composition hook API | Copy-paste fetch mỗi màn |
| **D** | UI phụ thuộc client API | Hardcode URL + business trong JSX |

---

## 7. Case study end-to-end — Catalog clone W3 (2026-08-04)

Dùng để **dạy** mọi role cùng một câu chuyện.

```text
W2 design: XBOS-DM-09 = GAP (chưa có clone chuyên biệt)
  → PM Task dev-be → POST …/catalog/:key/clone (CFG-206/409/AUTH-003)
  → QA API PASS; FE chưa wire → 🟡
  → PM Task dev-fe → menu «Sao chép bộ danh mục»
  → QA browser R2: ceo clone shifts → 201 CFG-206; member ẩn menu
Song song LOG-09: clone-bundle domains=logistics (CFG-205/009)
UC-HRM-27: BA triage → HOLD (không Dev)
```

**Bài học domain:**  
(1) Nhãn GAP phải verify AS-IS.  
(2) Catalog có nhiều «sao chép» khác nghĩa.  
(3) UAT Phase1 **không** = 3334 case designed hay 1 UC browser PASS.

Evidence neo:

- `docs/qa/evidence/po-uc-tc-w3-be-dm09.md`
- `docs/qa/evidence/po-uc-tc-w3-qa-dm09-r2.md`
- `docs/qa/professional/by-uc/XBOS-DM-09.md`

---

## 8. Protocol research cho PO / Claude / agent mới

Khi Sponsor bảo «nghiên cứu domain / đối thủ / thiếu gì»:

| Bước | Việc | Output |
|------|------|--------|
| R1 | Đọc §1–§4 doc này | Tóm tắt 10 dòng bối cảnh XeVN |
| R2 | Mở inventory UC | `docs/qa/professional/by-uc/_INVENTORY_PHASE1.md` |
| R3 | Chọn 1 domain (vd. Leave) | Đọc SRS HRM § + by-uc liên quan |
| R4 | AS-IS grep | «code does» |
| R5 | Gap class | SPEC_GAP / IMPL_GAP / DATA_GAP / HOLD |
| R6 | Không code | Chỉ backlog + gợi ý `work_item_id` cho PM |
| R7 | Cấm | Seed; claim UAT; đổi scope sản phẩm không Sponsor |

**Câu hỏi nghiên cứu chuẩn (trả lời bằng evidence path):**

1. SoT danh mục tập đoàn nằm XBOS hay HRM?  
2. CEO CT thành viên có được clone catalog holding không — mã lỗi?  
3. Leave có L2 trên AS-IS không — nếu không, TC có được PASS L2 không?  
4. Inbox trống thì QA làm gì (U65)?  

---

## 9. Điều hành team gắn domain (PO+PM)

| Tình huống | Hành động |
|------------|-----------|
| Matrix ghi GAP | BA triage trước Dev nếu nhãn «backlog» / gộp UC |
| API PASS / FE thiếu | Task FE — không đóng UC |
| 409 scope | BE scope parity + FE header — cùng wave |
| Sponsor chỉ hỏi | Không dispatch execution (rút lui nếu đã lỡ) |
| Chờ agent dài | Viết journal / enrich domain / training — không idle chat |

---

## 10. Backlog research PO (cập nhật khi làm)

- [ ] Map SRS_VN bullets → mã UC Phase1 (ma trận delta)  
- [ ] Approval matrix chuẩn (role × process × company × ngưỡng)  
- [ ] NFR metrics gắn domain mutate  
- [ ] HDSD vs SRS_VN leave ladder  
- [x] Case catalog clone DM-09/LOG-09 (W3) — neo evidence  
- [x] UC-HRM-27 false GAP / HOLD  

---

## 11. Quiz domain (nghiệm thu đọc hiểu)

1. `du-lich.ceo` gọi clone catalog holding → kỳ vọng? (**403** + **`XBOS-AUTH-003`**)  
2. Khác nhau publish/pull vs clone (`CFG-206`/`205`) vs apply-to-members (`POST …/apply-to-members` → **`CFG-204`**)?  
3. Vì sao leave L2 không được invent PASS?  
4. Ports hrm-api / xbos-api?  
5. Dual-plane: nêu 1 triệu chứng list OK / detail fail.  

---

## 12. Lịch sử

| Ver | Ngày | Thay đổi |
|-----|------|----------|
| v1 | 2026-08-04 | Bảng ngắn holding/WF/HRM/SOLID |
| **v2** | 2026-08-04 | Persona, ports, 3 thao tác catalog, dual-plane, leave SPEC_GAP, case W3, protocol research Claude/PO |

---

*PO-DOMAIN-ENT-20260804 v2*
