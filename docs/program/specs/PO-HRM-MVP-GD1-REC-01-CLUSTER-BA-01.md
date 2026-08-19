# BA AC pack — Wave-1 REC cluster · UC-BP-REC-01 + UC-BP-REC-01b

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-BA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 — single GD continuous) |
| **lane** | governance · ba-process |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED against SA Option A LOCKED** · O1–O5 **CONFIRMED** · Dev **HOLD** until ba-data / TechSpec-API physical DOC-DELTA |
| **change_mode** | **ADD** (align SA-01 — **no** wipe paper AC) |
| **uc_ids** | `UC-BP-REC-01` · `UC-BP-REC-01b` |
| **ref_sa** | `PO-HRM-MVP-GD1-REC-01-CLUSTER-SA-01.md` **Option A LOCKED** · F-REC-HC-01..03/05 · HC-S1..S7 |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-REC-01** · **FR-UC-BP-REC-01b** (SRS paper ≥ v0.8 chốt; FR body đủ 7 mục) |
| **ref_wbs** | `WBS_HRM_ENTERPRISE.md` **WBS-REC-01** · **WBS-REC-01b** |
| **ref_backlog** | `FR_BACKLOG_REMAINING.md` § Wave-2A items **1–2** (skeleton — FR body đã có trên SRS; AC này khóa đo lường FE) |
| **ref_api_paper** | Logical F-REC-HC-* · **physical Option A:** `/api/hrm/recruitment/recruitment-plans*` + **ADD** `…/spawn-requests` |
| **ref_db_paper** | Logical `rec_headcount_*` = **alias** · physical SoT = **UPGRADE** `recruitment_plans` + dept/pos + months normalize · YCTD = `job_requisitions` |
| **Sponsor chốt** | **Q-REC-HEADCOUNT** = Cho ngoài ĐB + duyệt BOD; workflow XBOS theo tenant · **Q-REC-HC-2** = **Trưởng phòng + HR** (SoT số định biên theo phòng) |
| **Honesty** | `recruitment_uat_ready=false` · **`C-SLICE-≠-MODULE`** · DENY flip module REC UAT / product_go |
| **Cấm** | REC-03 / chiến dịch · dual physical `rec_headcount_*` table · seed · invent BR · overwrite UF-HRM-12🟢 / J-HRM-05 / J-REC-WF-* · apps/** · dual FE cột ns+dx sau wave |

---

## 0. Process objective & actors

### Objective

Khóa **AC đo được** + **Diễn biến FE mutate (U63/U65)** cho Wave-1:

1. **UC-BP-REC-01** — Trưởng bộ phận lập / gửi lưới định biên vị trí × **12 tháng**; lãnh đạo duyệt; HCNS **tổng hợp** — SoT số theo phòng = **TP + HR** (**Q-REC-HC-2**).
2. **UC-BP-REC-01b** — Sau duyệt, theo lịch kích hoạt pháp nhân: **đúng một YCTD / ô Cần tuyển approved** (**BR-BP-HC-04**); mở lại cùng phiên bản ĐB → **không sinh trùng**.

### Actors

| Actor | Trách nhiệm |
|-------|-------------|
| Trưởng bộ phận (TP) | Lập / sửa lưới phòng mình; gửi duyệt |
| Lãnh đạo duyệt phòng | Duyệt / từ chối đề xuất định biên |
| HCNS (HR) | Tổng hợp lưới đã duyệt; xem YCTD auto; cấu hình lịch kích hoạt (khi có UI) |
| Hệ thống | Validate ô; khóa sau duyệt; spawn idempotent YCTD |
| Group CEO | Rollup `company_id=main` — đọc tổng hợp; không thay TP nhập hộ mọi phòng (**U19**) |

### Scope

| In (this seat) | Out |
|----------------|-----|
| AC-REC-HC-01* · AC-REC-HC-01b* · VAL-REC-HC-* · BR-BP-HC-01/02/04 cite · Diễn biến FE · UF/J-* placeholders | Impl `apps/**` / migration / seed |
| Trace UC→BR→partner_req · Q-REC-HEADCOUNT / Q-REC-HC-2 as **cite** | **UC-BP-REC-02 / 02b** body (QUEUED) — chỉ ranh giới |
| depends_on SA Option/F.1 confirm | **UC-BP-REC-03** campaign (**DENY**) |
| | Claim `recruitment_uat_ready` / module REC UAT |

### SA Option A — BA CONFIRM (đóng D1–D5 / O1–O5)

| # | Topic | BA CONFIRM (normative) |
|---|-------|-------------------------|
| **O1** | `ns`/`dx` → single `need_hire` | **`dx` → `need_hire` (Cần tuyển SoT)** · **`ns` → `headcount_current` (Hiện tại snapshot)** · `projected` giữ trạng thái Dự kiến / field riêng — **cấm** FE hai cột số sau wave · migration one-time: `need_hire = dx` (null→0); ô Cần tuyển chỉ khi `need_hire ≥ 1` |
| **O2** | Activation schedule | Tenant CFG: `on_approve` **\|** `calendar_month` · **MVP default khi CFG unset = `on_approve`** (spawn ngay sau duyệt — SA HC-S6) · mode `calendar_month` thiếu lịch tháng → **chặn** + thông báo VI (SRS) |
| **O3** | Qty drift after spawn | **Cấm silent overwrite** · cell đã spawn: đổi SL → **warn `qty_drift`** + **không** đổi YCTD đến khi user **xác nhận tạo phiên bản / cập nhật có kiểm soát** (version path) |
| **O4** | Vượt trên **grid** approve | **Warn cho phép duyệt lưới** (không block approve ĐB) · **không** invent BOD trên FR-01 · vượt / ngoài ĐB mở YCTD = **REC-02b** + **Q-REC-HEADCOUNT** (BOD + XBOS) — OUT seat |
| **O5** | HCNS rollup | **Read aggregation only** · **≠** write-all-depts · khớp AC-REC-HC-01e / EX-05 |
| **D1** | Physical path | **Option A:** `/api/hrm/recruitment/recruitment-plans*` · spawn **ADD** `POST …/recruitment-plans/:id/spawn-requests` · paper `/rec/headcount-plans` = alias |
| **Architecture** | SoT | UPGRADE `recruitment_plans` spine · **DENY** greenfield dual `rec_headcount_*` physical |

---


## 1. As-is vs to-be

| | AS-IS (LIVE + paper) | TO-BE (Wave-1 · Option A) |
|---|----------------------|---------------------------|
| SoT ĐB | `recruitment_plans` + `months_data` `{ns,dx}` dual số | **UPGRADE** cùng spine · **một** `need_hire` · nhãn ≡ định biên |
| Actor | Scope/OU yếu; HCNS có thể nhập hộ | **TP trình theo phòng**; HCNS **rollup đọc** (**Q-REC-HC-2** / O5) |
| Duyệt | XBOS `hrm_recruitment_plan_approval` LIVE | **RETAIN** bridge + **cell lock** sau approve |
| YCTD | `job_requisitions` LIVE; không cell FK | Spawn ADD → `in_plan` + `headcount_cell_id` · **BR-BP-HC-04** |
| Campaign / proposals tab | — / `headcount_proposals` ≠ FR-01 | REC-03 **OUT** · proposals **HOLD** REC-02b |
| Honesty | Slice GWC risk | `recruitment_uat_ready=false` · **C-SLICE** |

---

## 2. Business rules (normative — từ SRS/WBS; không invent)

| ID | Condition | Action | Outcome |
|----|-----------|--------|---------|
| **BR-BP-HC-01** | Ô tháng trên lưới ĐB | Đúng **một** trạng thái ∈ {Hiện tại, Cần tuyển, Dự kiến}; «Cần tuyển» chỉ tháng kích hoạt | Vi phạm → từ chối lưu/gửi |
| **BR-BP-HC-02** | Tạo YCTD (tay hoặc auto) từ ô | Chỉ ô **Cần tuyển đã duyệt** | Ô Dự kiến / Hiện tại → từ chối |
| **BR-BP-HC-04** | Định biên **đã duyệt** + ô Cần tuyển + mốc kích hoạt | Sinh **đúng một** YCTD / ô; reopen cùng plan version → skip | Trùng = FAIL |
| **BR-Q-REC-HC-2** | SoT số ĐB theo phòng | TP nhập phòng mình; HR tổng hợp | HCNS nhập hộ mọi phòng không ủy quyền → từ chối/cảnh báo ngoài quy trình (SRS) |
| **BR-Q-REC-HEADCOUNT** | YCTD **ngoài ĐB** (UC-02b — ranh giới) | Cho phép + duyệt **BOD**; workflow **XBOS theo tenant** | **Cite only** — không implement 02b trong seat này |
| **BR-REC-01-MONTH-SPLIT** | Cùng vị trí tháng 3 và tháng 8 | Hai nhu cầu độc lập | Hai ô / hai YCTD — **cấm** gộp một YCTD |
| **BR-REC-01-LOCK** | Ô Cần tuyển đã duyệt | Khóa chỉnh tay trừ override có lý do + quyền | Không quyền → lỗi |
| **BR-REC-01-SCOPE** | Hai pháp nhân / OU | Định biên tách theo đơn vị | Không trộn |
| **BR-REC-01b-NO-CAMPAIGN** | MVP spawn YCTD | Không bắt buộc gắn chiến dịch | REC-03 **DENY** |
| **BR-REC-01-NO-SEED** | Nghiệm thu | Chuỗi FE only | Seed / API fake inbox / DB fake = **FAIL U65** |

---

## 3. UC-BP-REC-01 — Acceptance criteria

### 3.1 Happy path

| AC-ID | Given | When | Then (measurable) | Evidence |
|-------|-------|------|-------------------|----------|
| **AC-REC-HC-01** | Persona TP; năm N; catalog vị trí + đơn vị có phần tử; quyền lập phòng A | Mở màn định biên / «Kế hoạch tuyển» ≡ ĐB | Hiển thị lưới **12 tháng**; chọn đơn vị ∈ danh mục (không free-text SoT); chọn vị trí ∈ danh mục | Screenshot + URL |
| **AC-REC-HC-01b** | Lưới nháp phòng A | Gán ≥1 ô = **Cần tuyển** + SL nguyên ≥1; các ô khác đúng một trạng thái; **Lưu** | Network **2xx**; FE cập nhật ô/SL; **không** yêu cầu cặp cột kế hoạch+đề xuất | DevTools + FE |
| **AC-REC-HC-01c** | Có ≥1 thay đổi hợp lệ | **Gửi duyệt** | Network **2xx**; FE trạng thái **chờ duyệt**; F5 vẫn chờ duyệt | FE + F5 |
| **AC-REC-HC-01d** | Plan submitted; persona duyệt đúng cấp (XBOS/tenant) | **Duyệt** thành công | Network **2xx**; ô Cần tuyển **khóa** chỉnh tay; FE hiển thị đã duyệt; khóa mang = mã ĐB + vị trí + tháng | FE + F5 |
| **AC-REC-HC-01e** | ≥1 phòng đã duyệt | Persona HCNS mở **tổng hợp** | Thấy rollup các lưới đã duyệt (không bắt HCNS nhập hộ); Group CEO `main` thấy rollup U19 | FE list |
| **AC-REC-HC-01f** | Ô Cần tuyển đã duyệt | Cross-nav: từ ô / link → chuẩn bị YCTD (tay REC-02 **hoặc** chờ auto 01b) | Không 404 scope; UI không tạo Campaign | Click path |

### 3.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-01-ALT-01** | Plan submitted | **Từ chối** + lý do bắt buộc | Network **2xx**; FE trả **chỉnh sửa**; lý do hiển thị; F5 còn rejected + lý do | FE + F5 |
| **AC-REC-HC-01-ALT-02** | Cùng vị trí cần tuyển T3 và T8 | Lưu hai ô Cần tuyển | Hai ô độc lập; sẵn sàng **hai** YCTD (01b) — không gộp | FE grid |
| **AC-REC-HC-01-ALT-03** | Nhãn UI «Kế hoạch tuyển» | Quan sát cột số theo tháng | Chỉ **một** số **Cần tuyển** (`need_hire`); **FAIL** nếu còn cặp ns+dx SoT | UI audit |
| **AC-REC-HC-01-ALT-04** | Policy pháp nhân map XBOS workflow ĐB | Gửi duyệt | Task inbox sinh từ **chuỗi FE** (không seed); duyệt qua XBOS **RETAIN** | J-REC-WF-02/03 · U65 |
| **AC-REC-HC-01-ALT-05** | Migration legacy plan có ns/dx | Sau UPGRADE Option A | `need_hire=dx` · `headcount_current=ns` (**O1**); dual editor **ABSENT** | FE + data spot |

### 3.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-01-EX-01** | Lưới thiếu trạng thái ≥1 tháng / không đủ 12 ô | Lưu hoặc Gửi duyệt | **4xx** + thông báo VI; FE giữ form; **không** 2xx im lặng | Network |
| **AC-REC-HC-01-EX-02** | Ô Cần tuyển thiếu SL hoặc SL &lt; 1 | Lưu/Gửi | **4xx** validation; FE highlight | Network |
| **AC-REC-HC-01-EX-03** | Free-text vị trí / đơn vị khi catalog EFF&gt;0 | Lưu | **4xx** KEY/VAL (SA token); không persist free-text SoT | Network |
| **AC-REC-HC-01-EX-04** | Ô đã duyệt; user không override | Sửa SL / trạng thái | **403/409**; toast VI; FE không đổi sau F5 | Network + F5 |
| **AC-REC-HC-01-EX-05** | HCNS tạo ĐB thay mọi phòng **không** ủy quyền | Attempt save cross-OU | Từ chối hoặc cảnh báo ngoài quy trình (SRS); không coi là happy | Network |
| **AC-REC-HC-01-EX-06** | Attempt tạo YCTD từ ô **Dự kiến** | Action tạo | Từ chối (**BR-BP-HC-02**) | Network |
| **AC-REC-HC-01-EX-07** | Scope member vs `main` | GET list/detail ĐB | Cùng scope resolver list↔get; không 409 sai scope / 404 rollup | U19 |

### 3.4 FE after 2xx + F5 (U63/U65) — Diễn biến mutate

| Bước | Actor FE | Action | Network | FE ngay sau 2xx | F5 / navigate lại |
|------|----------|--------|---------|-----------------|-------------------|
| 1 | TP | Mở ĐB năm N phòng A | GET **2xx** | Lưới 12 tháng (trống/nháp) | — |
| 2 | TP | Gán Cần tuyển + SL → **Lưu** | PUT/PATCH cells **2xx** | Ô + SL đúng; không banner lỗi | Còn đúng |
| 3 | TP | **Gửi duyệt** | POST submit **2xx** | Chip/trạng thái chờ duyệt | Còn chờ duyệt |
| 4a | Approver | Inbox/XBOS **Duyệt** *(chuỗi FE)* | POST approve **2xx** | Ô Cần tuyển khóa | Khóa còn |
| 4b | Approver | **Từ chối** + lý do | POST reject **2xx** | Trả chỉnh sửa + lý do | Còn |
| 5 | HCNS | Mở tổng hợp | GET rollup **2xx** | Thấy phòng đã duyệt | Còn |
| **Cấm** | QA | seed plan / seed inbox / SQL flip approved | — | — | **FAIL U65** |

**Thành công SRS:** Người dùng thấy lưới đã duyệt; bản ghi ĐB có tháng Cần tuyển; khóa mang = mã ĐB + vị trí + tháng; UC kế = YCTD tay (02) / auto (01b).

---

## 4. UC-BP-REC-01b — Acceptance criteria

### 4.1 Happy path

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-01b-01** | ĐB **approved**; ≥1 ô Cần tuyển SL≥1; lịch kích hoạt CFG có | Đến mốc kích hoạt (job hoặc action hệ thống tương đương SA) | Sinh **đúng một** YCTD / ô: vị trí + tháng kế hoạch + SL; `headcount_mode` trong ĐB (paper); **không** bắt Campaign | DB/API count + FE list |
| **AC-REC-HC-01b-02** | Spawn vừa chạy | HCNS mở danh sách YCTD | Thấy YCTD mới: tháng + vị trí + SL; Network list **2xx** | FE |
| **AC-REC-HC-01b-03** | YCTD đã gắn JD master (nếu đã chọn trên ô/policy) | Xem detail YCTD | Có ref JD khi SRS cho phép; không nhập lại full mô tả thư viện | FE detail |
| **AC-REC-HC-01b-04** | Cùng vị trí T3 + T8 Cần tuyển | Spawn | **Hai** YCTD độc lập | Count = 2 |

### 4.2 Alternate

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-01b-ALT-01** | Đã spawn cho `(plan_version, OU, position, month)` | **Mở lại** cùng phiên bản ĐB / gọi spawn lại | **Không** tạo bản thứ hai; response skip/duplicate ≥1; FE count không +1 | Idempotent proof |
| **AC-REC-HC-01b-ALT-02** | Đã spawn; user có quyền chỉnh có kiểm soát | Đổi SL ô nguồn | **warn `qty_drift`** + **cấm silent overwrite**; chỉ cập nhật YCTD sau **xác nhận version** (**O3**) | FE + Network |
| **AC-REC-HC-01b-ALT-03** | Ô đổi khỏi Cần tuyển **trước** mốc kích hoạt | Đến mốc / spawn | Hủy lịch / **không** tạo YCTD cho ô đó | Count |
| **AC-REC-HC-01b-ALT-04** | CFG unset | Approve plan (MVP) | Spawn **`on_approve`** ngay (**O2** default) | created ≥1 khi có ô |

### 4.3 Exception

| AC-ID | Given | When | Then | Evidence |
|-------|-------|------|------|----------|
| **AC-REC-HC-01b-EX-01** | ĐB chưa duyệt / rejected | Spawn | **Không** sinh; **4xx/409** hoặc no-op có lý do VI | Network |
| **AC-REC-HC-01b-EX-02** | CFG = `calendar_month` **và** thiếu lịch tháng | Spawn | Chặn + thông báo cấu hình (SRS · **O2**) | FE/API message |
| **AC-REC-HC-01b-EX-03** | Ô Hiện tại / Dự kiến only | Spawn scan | Không tạo YCTD từ các ô đó (**BR-BP-HC-02/04** · HC-S2) | Count |
| **AC-REC-HC-01b-EX-04** | Seed YCTD để «có data» rồi claim 01b PASS | — | **FAIL U65** | Process |
| **AC-REC-HC-01b-EX-05** | Plan chưa approved | `POST …/spawn-requests` | **409** (HC-S1) · không insert | Network |

### 4.4 FE after 2xx + F5 (U63/U65) — Diễn biến

| Bước | Actor | Action | FE / hệ thống | F5 |
|------|-------|--------|---------------|-----|
| 1 | (tiên quyết) | AC-REC-HC-01d PASS | ĐB approved + ô Cần tuyển | Còn |
| 2 | Hệ thống | Mốc kích hoạt → spawn service | YCTD created = số ô đủ điều kiện; skipped = 0 lần đầu | — |
| 3 | HCNS | Mở tab Yêu cầu tuyển / list YCTD | Row mới: tháng + vị trí + SL; **không** bắt buộc Campaign | Row còn |
| 4 | HCNS / hệ thống | Spawn lại cùng plan version | FE count **không** tăng; skipped_duplicate | Count ổn định |
| 5 | Cross-nav | Click YCTD → detail (J-HRM-05 must_keep) | Detail load; không 404 scope | — |

**Thành công SRS:** Mỗi ô Cần tuyển đủ điều kiện có đúng một YCTD; khóa mang = ĐB + vị trí + tháng; UC kế = REC-02/02b / nhận UV (QUEUED).

---

## 5. Validation table

| VAL-ID | Field / rule | Valid | Invalid → outcome |
|--------|--------------|-------|-------------------|
| **VAL-REC-HC-01** | Năm kế hoạch | Dương lịch hợp lệ | Thiếu → 4xx |
| **VAL-REC-HC-02** | Đơn vị / phòng | ∈ catalog phạm vi actor | Ngoài phạm vi / free-text SoT → 4xx |
| **VAL-REC-HC-03** | Vị trí | ∈ catalog chức danh pháp nhân | Free-text SoT → 4xx |
| **VAL-REC-HC-04** | Tháng | 1…12 đủ 12 ô khi gửi | Thiếu ô → 4xx (SRS) |
| **VAL-REC-HC-05** | Trạng thái ô | Exactly one of 3 | Multi/null → 4xx |
| **VAL-REC-HC-06** | SL Cần tuyển | Integer ≥ 1 khi status=Cần tuyển | &lt;1 / non-int → 4xx |
| **VAL-REC-HC-07** | Submit | ≥1 thay đổi hợp lệ | Không đổi → 409 (paper API) |
| **VAL-REC-HC-08** | Approve | Plan = submitted; đúng cấp | Sai trạng thái/cấp → 403/409 |
| **VAL-REC-HC-09** | Reject reason | Bắt buộc khi từ chối | Thiếu → 4xx |
| **VAL-REC-HC-10** | Mutate after approve | Override + lý do + quyền | Không → 403/409 |
| **VAL-REC-HC-11** | Spawn precondition | Plan approved + ô Cần tuyển + lịch CFG | Thiếu → chặn |
| **VAL-REC-HC-12** | Spawn idempotency | UQ logic (plan_version, OU, position, month) | Duplicate insert = FAIL BR-BP-HC-04 |
| **VAL-REC-HC-13** | Campaign trên spawn | Optional / absent OK | Bắt buộc Campaign = FAIL (REC-03 DENY) |
| **VAL-REC-HC-15** | Legacy dual ns+dx post-wave | Forbidden as SoT | Dual editors remain = **FAIL AC-ALT-03/05** |
| **VAL-REC-HC-16** | O4 vượt grid | Warn OK; approve ĐB still 2xx | Block approve ĐB **or** invent BOD on FR-01 = **FAIL process** |

---

## 6. Traceability — UC → BR → partner_req → AC → Journey/UF

| UC | BR | partner_req | Decision | AC (primary) | UF / J-* (placeholders) |
|----|-----|-------------|----------|--------------|-------------------------|
| **UC-BP-REC-01** | BR-BP-HC-01 · BR-BP-HC-02 · BR-Q-REC-HC-2 · BR-REC-01-* | **REQ_REC_003** · **REQ_REC_005** | **Q-REC-HC-2** (TP+HR) · Q-REC-HEADCOUNT cite ranh giới | AC-REC-HC-01…01f · ALT · EX · VAL-01..10 | **UF-HRM-REC-HC-01** *(new)* · **J-HRM-REC-HC-01** · must_keep **UF-HRM-12** / **J-HRM-05** / **J-REC-WF-02/03** (approve path) |
| **UC-BP-REC-01b** | **BR-BP-HC-04** · BR-BP-HC-02 · BR-REC-01-MONTH-SPLIT · BR-REC-01b-NO-CAMPAIGN | **REQ_REC_003** | — (D4 SA) | AC-REC-HC-01b-01…04 · ALT · EX · VAL-11..14 | **UF-HRM-REC-HC-01b** *(new)* · **J-HRM-REC-HC-01b** · cross-nav **J-HRM-05** |
| UC-BP-REC-02 *(OUT seat)* | BR-BP-HC-05 | REQ_REC_001 | Q-REC-HEADCOUNT | — | QUEUED continuous board |
| UC-BP-REC-02b *(OUT seat)* | BR-BP-HC-06 | REQ_REC_001 | Q-REC-HEADCOUNT ngoài ĐB+BOD | — | QUEUED |
| UC-BP-REC-03 | BR-BP-HC-03 | REQ_REC_002 | R-CAMPAIGN OUT | — | **DENY** |

### UF matrix note (existing)

| UF | Status | Relation |
|----|--------|----------|
| **UF-HRM-12** | 🟢 Dev8088 | Requisition CRUD — **must_keep**; **không** đè bằng AC ĐB; 01b spawn **bổ sung** nguồn YCTD |
| **UF-HRM-MENU-06** | load | Entry `/recruitment` — entry path cho tab ĐB khi wire |
| **UF-HRM-REC-HC-01 / 01b** | ⬜ DRAFT | Thêm khi Dev wire FE; QA browser U65 |

### Journey placeholders (U19)

| J-ID | Click path (draft) | Pass when |
|------|--------------------|-----------|
| **J-HRM-REC-HC-01** | Login persona TP → Tuyển dụng → Định biên/Kế hoạch tuyển → lưới 12 tháng → Lưu Cần tuyển → Gửi duyệt → Approver duyệt (FE/XBOS) → F5 khóa ô → HCNS tổng hợp | AC-REC-HC-01* · U65 · no seed |
| **J-HRM-REC-HC-01b** | After HC-01 approved → (mốc kích hoạt) → HCNS list YCTD thấy đúng 1/ô → spawn lại → count không +1 → click YCTD → detail (J-HRM-05) | AC-REC-HC-01b* · BR-BP-HC-04 · U65 |

**Group CEO:** AC-REC-HC-01e / EX-07 — `company_id=main` rollup tổng hợp; member CEO chỉ đơn vị mình.

---

## 7. Honesty & must_keep

| Lock | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `C-SLICE-≠-MODULE` | Slice GWC ĐB/spawn ≠ module REC UAT |
| DENY | REC-03 campaign · seed AC · invent warn/block vượt HC trên seat này · flip product_go |
| must_keep | UF-HRM-12🟢 · J-HRM-05 · J-REC-WF-01..06 seals · JD/YCTD ref seals · stage catalog seals |

---

## 8. Handoff expectations

| Role | Expectation | Done when |
|------|-------------|-----------|
| **ba-data** | Physical DOC-DELTA Option A: months normalize · cell identity/UQ · YCTD `headcount_cell_id`/`headcount_mode`/`target_month` · **DENY** dual `rec_headcount_*` table | DATA CONFIRMED |
| **sa** | TechSpec/API F.1 depth on **physical** paths + spawn contract HC-S1..S7 | Spec DOC-DELTA CONFIRMED |
| **dev-be / dev-fe** | Sau DATA+API — wire U65; single Cần tuyển column; spawn idempotent | READY_FOR_QA |
| **qa** | Browser J-HRM-REC-HC-01 / 01b · O1 dual-column ABSENT · idempotent | PASS_TO_PM / FAIL |
| **qc** | GWC slice only; honesty false | GWC ≠ module GO |

---

## 9. Open risks / clarifications

| ID | Risk | Owner | Resolution path |
|----|------|-------|-----------------|
| R1 | Dual SoT nếu Dev tạo `rec_headcount_*` | ba-data/tm | DENY Option B |
| R2 | FE còn ns+dx | qa | FAIL ALT-03 |
| R3 | Nhầm UF-HRM-12 = ĐB grid | qa/pm | UF-HRM-REC-HC-* |
| R4 | Claim module REC UAT sau slice | qc | Honesty false · C-SLICE |
| R5 | `headcount_proposals` mutate as FR-01 | dev | HOLD REC-02b |

**SRS gap?** Không. **SA Option A** + **O1–O5** sealed. **Không BLOCKED**.

---

## 10. Completion

| Field | Value |
|-------|-------|
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **next_owner** | **ba-data** (physical Option A) · parallel **sa** TechSpec/API F.1 depth nếu PM tách seat |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-ba-01.md` |
