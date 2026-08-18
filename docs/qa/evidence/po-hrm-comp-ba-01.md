# PO-HRM-COMP-BA-01 — Competitive map → backlog testable + SRS delta P1 (governance)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-COMP-BA-01` |
| **role** | ba-process |
| **lane** | governance |
| **date** | 2026-08-03 |
| **priority** | P0 |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `sa` (ranh giới NFR/integration) rồi `qa` (spine P0 — ladder 🟡 đến khi BR khóa) |
| **SoT read** | `PO_HRM_COMPETITIVE_CAPABILITY_MAP.md` · `PO_E2E_BUSINESS_SPINE_PROGRAM.md` · `SRS_NEW.md` §3.7 · `HRM_MENU_DATA_LINKAGE_MATRIX.md` |
| **Optional A0** | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` — **chưa có trên disk** (Wave A0 vẫn mở; ladder ngày xử lý trong §2 dưới đây) |
| **Cấm** | `apps/**` · mở FR GĐ1 cho FaceID / OKR / L&D / TNCN portal · pretend Workday/MISA full suite |

---

## 1. Mục tiêu process

Chuẩn hóa §3–§4 bản đồ cạnh tranh PO thành:

1. Bảng gap **G-P0 / G-P1 / G-P2** → UC/FR hiện có **hoặc** `SPEC_GAP` + mã BR đề xuất.
2. Khóa trạng thái **leave day → approver ladder** (có citation hoặc SPEC_GAP rõ — không bịa số ngày).
3. Đề xuất SRS delta **P1** với ranh giới **in-GĐ1 ADD** vs **Sau GĐ1**, bám `SRS_NEW` §3.7 / AC-MMAP-* (must_keep).

**must_keep (ranh giới §3.7):** GPS ≠ FaceID · HIRED→NV tối thiểu (AC-MMAP-RC-01) · phân ca catalog ≠ roster đầy đủ · PF ≠ OKR/360 · công thức tham chiếu ≠ formula builder · OT / Đào tạo / FaceID / 360 / L&D / TNCN portal = ngoài FR GĐ1 trừ CR sponsor.

---

## 2. Leave day → approver ladder

### 2.1 Kết luận BA

| Kết luận | Chi tiết |
|----------|----------|
| **Trạng thái** | **`SPEC_GAP` P0** — mã tạm **`BR-LEAVE-LADDER-01`** (chưa khóa số ngày cắt L1/L2) |
| **Có gì hôm nay** | Phê duyệt nghỉ + spawn WF `hrm_leave_approval` + resolver quản lý trực tiếp; quy tắc **ngày** chỉ cho **validate** (ốm đính kèm, báo trước phép năm) — **không** routing cấp duyệt theo `total_days` |
| **QA 🟢 ladder** | **Cấm** cho case LV-02 (cắt L1/L2 theo ngày) cho đến khi sponsor/BA khóa bảng ngày; LV-01/LV-03..06 vẫn chạy được theo BR hiện hữu |

### 2.2 Citation (WF / HDSD / code / SRS)

| Nguồn | Path / neo | Nội dung trích | Ảnh hưởng ladder ngày |
|-------|------------|----------------|------------------------|
| SRS lean | `SRS_NEW.md` **FR-UC-H03** | Mục đích: «phê duyệt **hai cấp**»; bảng loại nghỉ: phép năm 12 ngày + gửi trước ≥ 3 ngày lịch; ốm ≥ 3 ngày cần giấy; sequence/Diễn biến = **một** QL duyệt/từ chối | Hai cấp **được nêu** nhưng **không** có ngưỡng ngày → L1 chỉ QL / L2 = GĐ |
| SRS lean | `SRS_NEW.md` **FR-UC-B03** | Happy: gửi → duyệt L1 → duyệt L2; BR-WF-04 chặn tự duyệt | Ladder **vai/bước WF** generic — **không** bind `total_days` |
| SRS lean | `SRS_NEW.md` §3.7 **AC-MMAP-LV-FUND** | Số dư + loại nghỉ + trừ đúng khi gửi | Không đụng cấp duyệt |
| Code | `leave-workflow.bridge.ts` | `WF_HRM_LEAVE_APPROVAL_CODE = 'hrm_leave_approval'`; resolve **direct_manager** (BR-CD-F4-02); escalate khi thiếu manager (BR-CD-F4-04) | Không nhánh theo số ngày đơn |
| Code | `leave-requests.service.ts` | `assertSickAttachmentIfRequired` khi nghỉ ốm ≥ 3 ngày + `attachment_url` | **Validate chứng từ** — không đổi người duyệt |
| HDSD UAT | `03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` §5.2–5.3 | NV tạo đơn → QL tab Phê duyệt → Duyệt/Từ chối | **Một** lớp quản lý; **không** bảng ngày→cấp |
| Program | `PO_E2E_BUSINESS_SPINE_PROGRAM.md` SPINE-02 | LV-01/LV-02 cần ngưỡng L1; ghi rõ gap «chưa ghi số ngày cắt L1/L2» | Khớp residual `R-PO-LEAVE-DAY-LADDER` |
| Competitive map | `PO_HRM_COMPETITIVE_CAPABILITY_MAP.md` G-P0-LEAVE-LADDER | «Thiếu bảng ngày→cấp duyệt» | Owner: BA khóa BR + QA |

### 2.3 Bảng ngày → cấp (đề xuất — **chưa chốt**)

> Không invent số. Bảng dưới = **khung testable** chờ quyết định sản phẩm (sponsor / policy CT).

| Case ID | Điều kiện (đề xuất khóa) | Cấp duyệt kỳ vọng | BR / AC |
|---------|--------------------------|-------------------|---------|
| LV-01 | Phép năm `total_days` ≤ **T_L1** (TBD) | Quản lý trực tiếp (L1) đủ để `APPROVED` nếu WF chỉ 1 bước active **hoặc** L1 terminal | **BR-LEAVE-LADDER-01** (SPEC_GAP) |
| LV-02 | Phép năm `total_days` > **T_L1** **hoặc** loại nghỉ bắt buộc L2 | Phải qua L2 (GĐ / position_template) mới `APPROVED` | **BR-LEAVE-LADDER-01** |
| LV-03 | Ốm ≥ 3 ngày, không đính kèm | Fail sâu chứng từ (đã có) | FR-UC-H03 · code sick attach — **không** ladder |
| LV-04 | Ốm ≥ 3 ngày, có đính kèm | Theo WF leave (sau khi BR ladder khóa) | FR-UC-H03 |
| LV-05 | Submitter = approver | Chặn | **BR-WF-04** |
| LV-06 | Duyệt sai công ty | 403/409 | Scope ladder ADR |

**Đề xuất số tạm (chỉ khi sponsor confirm — không tự claim):** Personio/Bamboo thường PTO ngắn = manager; dài = HR/Director. XeVN logistics: gợi ý thảo luận `T_L1 ∈ {1, 2, 3}` ngày phép năm — **chưa** ghi vào SRS cho đến confirm.

**Proposed BR (ADD khi confirm):**

| BR id | Condition | Action | Outcome |
|-------|-----------|--------|---------|
| **BR-LEAVE-LADDER-01** | Đơn nghỉ loại `annual` (phép năm) có `total_days` | WF `hrm_leave_approval` chọn bước L1-only vs L1→L2 theo ngưỡng **T_L1** đã cấu hình (hoặc hằng số tenant) | Approver đúng cấp; LV-01/LV-02 đo được |
| **BR-LEAVE-LADDER-02** | Loại nghỉ ∈ {unpaid, maternity, …} (danh sách khóa) | Bỏ qua ngưỡng ngày — luôn ≥ N bước theo định nghĩa WF | Deterministic per leave_type |
| **BR-LEAVE-DOC-01** (đã có hướng) | Ốm ≥ 3 ngày | Bắt buộc `attachment_url` | Fail VI nếu thiếu — **tách** khỏi ladder |

---

## 3. Gap matrix G-P0 / G-P1 / G-P2 → UC/FR hoặc SPEC_GAP

### 3.1 G-P0 — phải chứng minh E2E (spine)

| Gap ID | Capability | UC / FR / J-* hiện có | SPEC_GAP / BR đề xuất | Test spine | Verdict BA |
|--------|------------|------------------------|------------------------|------------|------------|
| **G-P0-HIREPAY** | Hire→Pay | UC-H05 · FR-UC-H05 inventory · FR-HRM-INT-01 · FR-UC-H04 · J-REC-WF-01..04 · J-HRM-01/02/03/07 · UF-HRM-12/01/06 · **AC-MMAP-RC-01** (HIRED→NV) | Không mở FR mới; gap = **chứng minh E2E** U65 | E2E-SPINE-01 | **MAPPED** — QA A1 |
| **G-P0-LEAVE-LADDER** | Nghỉ + cấp duyệt theo ngày | FR-UC-H03 · FR-UC-M03 · FR-UC-B03 · J-HRM-06 · J-MOB-03/05 · BR-WF-04 · bridge `hrm_leave_approval` | **SPEC_GAP:** thiếu bảng ngày→cấp → **BR-LEAVE-LADDER-01/02** | E2E-SPINE-02 | **SPEC_GAP P0** — chặn 🟢 LV-02 |
| **G-P0-LATE-ESS** | Đi muộn mobile→duyệt | UC-HRM-09 · update-requests · UC-H02 / UC-M02 · J-MOB-02/05/07 · UF-HRM-07/08 | Không FR mới; gap = E2E ESS | E2E-SPINE-03 | **MAPPED** — qa-device A2 |
| **G-P0-MENU-HONEST** | Menu leaf dùng được | UF-HRM-MENU-01..17 · matrix linkage · AC density | Gap = retest nghiệp vụ / mutate AC — không FR mới | Menu sweep Wave B | **MAPPED** — QA honesty |

### 3.2 G-P1 — mở rộng GĐ1 (backlog sản phẩm — chưa DONE)

| Gap ID | Capability | Neo hiện có | SPEC_GAP / BR đề xuất | in-GĐ1 ADD vs Sau | Owner lane |
|--------|------------|-------------|------------------------|-------------------|------------|
| **G-P1-ONBOARD-CHK** | Checklist hội nhập sau hire | **AC-MMAP-RC-01** (HIRED→NV Pass); Fail/ngoài = «checklist onboard hậu HIRED nhiều bước» §3.7.2 | **SPEC_GAP hẹp** nếu sponsor muốn > HIRED→NV: đề xuất **AC-MMAP-RC-01b** + **BR-ONBOARD-MIN-01** (≤3 mục trạng thái trên hồ sơ NV) — **không** Bamboo-full | Xem §4.1 | BA → ba-docs → Dev sau confirm |
| **G-P1-SHIFT-OT** | Ca + OT + đồng bộ lương | **AC-MMAP-SHIFT-01** (catalog ca); OT = §3.7.3 **Sau GĐ1**; loại nghỉ «Bù» tham chiếu OT đã duyệt (FR-UC-H03) | **BR-SHIFT-BIND-01** (ca gắn công — in-GĐ1); **cấm** FR OT đăng ký/hệ số trong GĐ1 (**Q-OT-TR**) | Xem §4.2 | BA-P + Dev (shift only) |
| **G-P1-PERF-CYCLE** | Chu kỳ đánh giá mật độ tối thiểu | Inventory PF · FR-HRM-PF-01 · **AC-MMAP-PF-01** · AC-PERF-01..05 (legacy E3) · menu `/performance` · AC-FID-13 | Không OKR/360; đề xuất **BR-PERF-DENSITY-01** = ≥1 cycle active/CT + eval path SM đo được | Xem §4.3 | BA + Dev + QA density |
| **G-P1-PAY-EXPLAIN** | Giải thích thành phần trên phiếu (không AI) | FR-UC-H04 công thức tham chiếu · `salary_components` · **AC-MMAP-PR-FORM** (cấm builder) · **AC-MMAP-PAY-01** | **BR-PAY-LINE-01**: phiếu hiển thị dòng thành phần + số (read-only từ dữ liệu đợt) | Xem §4.4 | FE copy + BE lines |
| **G-P1-VN-INS-DEPTH** | BH list chuyên biệt + export tối thiểu | UC-HRM-25 · AC-HRM-EMBED-03 · matrix insurance · residual **Q-INS-01** | **BR-INS-LIST-01** + **BR-INS-EXPORT-01** (CSV/xlsx tối thiểu); **cấm** cổng BHXH điện tử / TNCN trong GĐ1 | Xem §4.5 | Product đóng Q-INS-01 |

### 3.3 G-P2 — Sau GĐ1 / out-of-scope có chủ (**cấm pretend GĐ1**)

| Gap ID | Capability | Neo khóa ngoài | Hành động BA |
|--------|------------|----------------|--------------|
| **G-P2-TNCN-PORTAL** | Cổng kê khai TNCN | §3.7.3 + map PO · không FR | Giữ Sau GĐ1 / tích hợp phase riêng |
| **G-P2-FACE-QR** | FaceID / QR timeclock | **AC-MMAP-ATT-GPS** · §3.7.3 | Cấm gộp Pass GPS |
| **G-P2-GOAL-OKR** | Mục tiêu / OKR | **AC-MMAP-PF-01** Fail/ngoài · §3.7.3 | Cấm FR OKR GĐ1 |
| **G-P2-LND** | Đào tạo / succession | §3.7.3 · mindmap MISSING | Cấm FR L&D GĐ1 |
| **G-P2-ATTRITION-AI** | Dự báo nghỉ việc | Map PO D-AN | Sau GĐ1 |
| **G-P2-ACCT-NATIVE** | Liên thông kế toán kiểu MISA | BRD boundary · map D-INT | GĐ1 = API + WF; kế toán = phase sau |

---

## 4. P1 proposals — chi tiết in-GĐ1 ADD vs Sau GĐ1

### 4.1 Onboarding checklist vs **AC-MMAP-RC-01**

| Lớp | Nội dung | Quyết định BA |
|-----|----------|---------------|
| **must_keep GĐ1** | Ứng viên **HIRED** → tạo/liên kết hồ sơ NV cùng CT; list NV thấy mã mới sau F5 | Giữ **AC-MMAP-RC-01** — thuộc SPINE-01 bước 4–5 |
| **in-GĐ1 ADD (đề xuất hẹp — cần sponsor confirm)** | **AC-MMAP-RC-01b** / **BR-ONBOARD-MIN-01**: sau HIRED, hồ sơ NV có **tối đa 3** mục trạng thái (vd. hồ sơ pháp lý / thiết bị / hướng dẫn an toàn) dạng checkbox + ngày hoàn thành; list/detail hiển thị tiến độ %; **không** portal ứng viên; **không** multi-step WF hội nhập | Chỉ ADD khi PO confirm «tối thiểu checklist» ≠ «hire only» |
| **Sau GĐ1** | Thư offer formal · checklist nhiều bước · training module · portal UV · IT provisioning đầy đủ | Khóa §3.7.2 Fail/ngoài AC-MMAP-RC-01 · §3.7.3 |

**Khuyến nghị mặc định (không CR):** nghiệm thu GĐ1 = **AC-MMAP-RC-01 only**; G-P1-ONBOARD-CHK = backlog **sau** spine hire-pay PASS — không block SPINE-01.

### 4.2 Shift / OT

| Lớp | Nội dung | Quyết định BA |
|-----|----------|---------------|
| **in-GĐ1 ADD** | Catalog `shifts` publish/pull → gắn ca trên bản ghi công / form (tiêu thụ picker) đo bằng **AC-MMAP-SHIFT-01** + **BR-SHIFT-BIND-01** | Density tối thiểu — **không** claim roster |
| **Sau GĐ1** | Lịch phân ca / roster UI đầy đủ · đăng ký & phê duyệt OT · hệ số ×1,5/×2 · đồng bộ lương OT tự động | §3.7.3 · Q-OT-TR · Q-SHIFT |

**Hòa giải PO map «P1 SHIFT-OT»:** tách backlog — **P1a = shift bind (GĐ1)**; **P1b = OT = Sau GĐ1** trừ CR kéo scope.

### 4.3 Performance cycle

| Lớp | Nội dung | Quyết định BA |
|-----|----------|---------------|
| **in-GĐ1 ADD** | Tạo/xem chu kỳ; gán KPI/trọng số; SM eval `draft→submitted→approved→completed` theo **AC-MMAP-PF-01** + AC-PERF-*; mật độ **BR-PERF-DENSITY-01** (≥1 cycle/CT; eval ≥ ngưỡng matrix khi claim density) | Menu `/performance` — honesty empty hợp lệ ≠ DONE |
| **Sau GĐ1** | OKR liên tục (%) · 360 đa người · succession | §3.7.3 · AC-MMAP-PF-01 Fail/ngoài |

### 4.4 Pay explain (không AI / không builder)

| Lớp | Nội dung | Quyết định BA |
|-----|----------|---------------|
| **in-GĐ1 ADD** | **BR-PAY-LINE-01** / đề xuất **AC-MMAP-PAY-02**: chi tiết phiếu hiển thị các **dòng thành phần** (mã/label VI + số) từ dữ liệu đợt đã tính; NV/QL đúng phạm vi (cộng **AC-MMAP-PAY-01** mật) | Pattern «giải mã» mức đọc — không AVA |
| **Sau GĐ1** | Formula builder · AI giải thích công thức · PDF mã hóa nâng cao | **AC-MMAP-PR-FORM** · §3.7.3 |

### 4.5 BH depth (VN statutory nhẹ)

| Lớp | Nội dung | Quyết định BA |
|-----|----------|---------------|
| **in-GĐ1 ADD** | Đóng **Q-INS-01**: list BH chuyên biệt FE trung thực + **BR-INS-EXPORT-01** export tối thiểu (cột policy/NV/ngày hiệu lực); AC-HRM-EMBED-03 | Matrix `insurance` · UC-HRM-25 |
| **Sau GĐ1 / G-P2** | Cổng BHXH điện tử · tờ khai tự động · **TNCN portal** (G-P2-TNCN-PORTAL) | Map PO D-VN · §3.7 ngoài claim |

---

## 5. Business rule table (P0 + P1 đề xuất)

| BR id | Condition | Action | Outcome | Phase |
|-------|-----------|--------|---------|-------|
| BR-WF-04 | Submitter = approver | Chặn | Không tự duyệt | GĐ1 (có) |
| BR-LEAVE-DOC / sick≥3 | Ốm ≥ 3 ngày thiếu file | Reject tạo | Fail sâu VI | GĐ1 (có) |
| **BR-LEAVE-LADDER-01** | Phép năm vs **T_L1** | Chọn bước WF L1 vs L1→L2 | Approver đúng cấp | **SPEC_GAP** → ADD khi confirm |
| **BR-LEAVE-LADDER-02** | leave_type ∈ policy L2-always | Bỏ ngưỡng ngày | Luôn ≥ L2 | SPEC_GAP |
| **BR-ONBOARD-MIN-01** | Sau HIRED (nếu CR checklist) | Tạo ≤3 mục trạng thái | % hoàn thành trên hồ sơ | P1 optional |
| **BR-SHIFT-BIND-01** | Gắn ca làm việc | Chỉ key từ catalog `shifts` | F5 còn key; empty catalog = empty hợp lệ | P1a GĐ1 |
| **BR-PERF-DENSITY-01** | Claim PF density | ≥1 cycle active/CT + SM eval | Không DONE khi chỉ menu load | P1 GĐ1 |
| **BR-PAY-LINE-01** | Xem chi tiết phiếu | Hiển thị lines thành phần | Không raw key (U72); không builder | P1 GĐ1 |
| **BR-INS-LIST-01** | Tab/list BH | List từ API insurance chuyên biệt | Đóng Q-INS-01 UI | P1 GĐ1 |
| **BR-INS-EXPORT-01** | HCNS export | File tối thiểu cột khóa | Không cổng BHXH | P1 GĐ1 |

---

## 6. Acceptance criteria đo được (cho QA / ba-docs)

| AC id | Pass | Fail |
|-------|------|------|
| AC-SPINE-01 (reuse) | HIRED→NV→thấy trên kỳ/phiếu theo SPINE-01 | Chỉ load menu tuyển dụng |
| AC-LEAVE-LADDER-TBD | Sau khi **T_L1** khóa: LV-01 L1 đủ; LV-02 cần L2 | Claim ladder khi chưa có BR số |
| AC-MMAP-RC-01 | Giữ nguyên §3.7.2 | Claim checklist đầy đủ |
| AC-MMAP-RC-01b (proposed) | 3 mục trạng thái sau hire + F5 | Portal UV / multi-WF onboard |
| AC-MMAP-SHIFT-01 | Giữ §3.7.2 | Claim roster đầy đủ |
| AC-MMAP-PF-01 | Giữ §3.7.2 | Claim OKR/360 |
| AC-MMAP-PAY-02 (proposed) | Phiếu có ≥1 dòng thành phần khi payslip có data | AI decode / editor công thức |
| AC-INS-LIST/EXPORT (proposed) | List + export 2xx + cột đủ | Cổng BHXH/TNCN |

---

## 7. Điểm mạnh XeVN — không đánh đổi khi mở P1

1. Catalog tập đoàn 2 tầng (XBOS→HRM) — Spine 04.  
2. WF engine dùng chung CC.  
3. RBAC đa pháp nhân + kiêm nhiệm.  
4. DNA logistics / đa CT.

Mọi ADD P1 phải **bám định vị** — không phình AMIS clone (FaceID bundle, TNCN portal, L&D, OKR).

---

## 8. Assumptions · dependencies · open questions

| ID | Item | Owner |
|----|------|-------|
| A1 | `po-e2e-ba-case-matrix-01.md` chưa publish — ladder chi tiết case LV-* nằm §2; A0 có thể merge từ file này | ba-process / PM |
| Q1 | Giá trị **T_L1** (ngày cắt L1/L2 phép năm)? | Sponsor / HCNS policy |
| Q2 | Onboarding: chỉ AC-MMAP-RC-01 hay mở AC-MMAP-RC-01b trong GĐ1? | PO confirm |
| Q3 | OT có CR kéo vào GĐ1 không? Mặc định **không** (§3.7.3) | Sponsor |
| D1 | SA: NFR/integration boundary BHXH cổng + kế toán + cấm FaceID/AI productize | sa |
| D2 | QA: chạy SPINE-01/03; SPINE-02 LV-02 = 🟡 BLOCKED-SPEC đến Q1 | qa / qa-device |

---

## 9. Handoff package

### completion_report

- Đã chuẩn hóa toàn bộ G-P0/G-P1/G-P2 từ `PO_HRM_COMPETITIVE_CAPABILITY_MAP` → neo UC/FR hoặc SPEC_GAP + BR đề xuất.
- **Leave day ladder = SPEC_GAP P0** (`BR-LEAVE-LADDER-01/02`) với citation SRS/HDSD/code — **không** bịa ngưỡng ngày.
- P1 năm mục (onboard / shift-OT / perf / pay-explain / BH) đã tách **in-GĐ1 ADD** vs **Sau GĐ1**; OT/FaceID/OKR/L&D/TNCN **không** mở FR GĐ1.
- Không sửa `apps/**`; không viết FR khách; `no_prompt_echo`.

### Residual

| ID | Sev | Note |
|----|-----|------|
| R-PO-LEAVE-DAY-LADDER | P0 | Chờ T_L1 + ba-docs ADD BR vào SRS khi confirm |
| R-PO-ONBOARD-CHK-SCOPE | P1 | CR có/không AC-MMAP-RC-01b |
| R-PO-OT-IN-GĐ1 | P1 | Mặc định Sau; PO map «SHIFT-OT» đã tách P1a/P1b |
| A0 matrix file | P2 process | `po-e2e-ba-case-matrix-01.md` vẫn thiếu — có thể symlink/copy §2–§3 |

### next_owner

`sa`

### next_dispatch_prompt

```text
Operate as sa. work_item_id: PO-HRM-COMP-SA-01. priority P0. lane governance.
Entry: docs/qa/evidence/po-hrm-comp-ba-01.md + docs/program/PO_HRM_COMPETITIVE_CAPABILITY_MAP.md + SRS_NEW.md §3.7.
Mission: (1) Confirm NFR/integration boundaries — BHXH electronic portal & TNCN = out GĐ1; accounting native = out; FaceID/QR/OKR/L&D/AI attrition = out. (2) TechSpec/API note only if BR-LEAVE-LADDER needs WF graph field for day threshold (no invent T_L1). (3) Approve P1a shift-bind + pay-line + INS list/export as in-GĐ1 ADD; reject OT/formula-builder/OKR as GĐ1 FR. Evidence: docs/qa/evidence/po-hrm-comp-sa-01.md. ack_status PASS_TO_PM. Cấm apps/** · cấm mở FR FaceID/OKR/L&D/TNCN.
```

**Parallel QA (sau SA hoặc song song spine không phụ thuộc ladder số):**

```text
Operate as qa. work_item_id: PO-E2E-SPINE-01-QA (continue). Entry: PO_E2E_BUSINESS_SPINE_PROGRAM.md + po-hrm-comp-ba-01.md §3.1.
Run E2E-SPINE-01 (U65 zero-seed) + note SPINE-02 LV-02 = BLOCKED-SPEC until BR-LEAVE-LADDER-01 T_L1 locked. Evidence U78 test-log. Cấm seed inbox. PASS_TO_PM.
```

---

## 10. Trace

| Artifact | Role |
|----------|------|
| `docs/program/PO_HRM_COMPETITIVE_CAPABILITY_MAP.md` | SoT competitive |
| `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` | P0 test spine |
| `docs/brand-new-documents-20270801/SRS_NEW.md` §3.7 | must_keep GĐ1 vs Sau |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | Modules / density |
| `docs/qa/evidence/doc-ent-hrm-mmap-01.md` | Prior mindmap gap (align) |
| File này | BA backlog + delta proposals |

---

**ack_status:** `PASS_TO_PM`
