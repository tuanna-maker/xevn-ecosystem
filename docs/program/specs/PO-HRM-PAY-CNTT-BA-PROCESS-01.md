# PO-HRM-PAY-CNTT-BA-PROCESS-01 — Ma trận năng lực lương XeVN × AMIS × pack P.CNTT

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-PAY-CNTT-BA-PROCESS-01` |
| **parent** | `PO-HRM-PAY-XEVN-CUSTOMER-CNTT-INTAKE-01` |
| **lane** | governance · **cấm** `apps/**` |
| **change_mode** | **ADD-only** — đề xuất UC **Thiết lập lương**; không rewrite SRS khách |
| **date** | 2026-08-11 |
| **honesty** | `payroll_e2e_ready=false` · research/delta ≠ UAT · U65 zero-seed |
| **read_ack** | `PO_HRM_PAY_XEVN_CUSTOMER_CNTT_INTAKE_01.md` · `PO_HRM_AMIS_PARITY_RESEARCH_01.md` §3 · `po-hrm-payroll-formula-run-gap-ba-01.md` · `PO-HRM-PAY-CNTT-POLICY-READ-METHOD.md` |

---

## 1. Mục tiêu quy trình và tác nhân

| | |
|--|--|
| **Mục tiêu** | Đối chiếu **7 bước spine AMIS Tiền lương** với **7 mô hình lương thực tế XeVN** (pack P.CNTT) và hiện trạng product; xác định **GAP P0 Thiết lập** (metadata, không hardcode Nest). |
| **Tác nhân** | C&B tập đoàn · C&B đơn vị/BP · Kế toán lương · QA (U65) · PM (prioritize wave) |
| **Trong phạm vi** | Ma trận capability · BR Thiết lập · UC ADD · P0 setup functions · handoff ba-data/sa |
| **Ngoài phạm vi** | Map cột Excel chi tiết (→ `PO-HRM-PAY-CNTT-BA-DATA-01`) · API physical (→ SA) · Dev · claim UAT |

### 1.1 Nguồn khách (inventory — không đọc file trực tiếp trong seat này)

Pack **Gửi P.CNTT** (67 tệp: 30 PDF · 38 XLSX · 2 XLS) — **chưa mount trong git workspace** tại thời điểm BA; ma trận dùng **inventory đã xác nhận** trên intake + tên mẫu đại diện. Khi mount local: đọc theo `PO-HRM-PAY-CNTT-POLICY-READ-METHOD.md` (song song `PO-HRM-PAY-CNTT-BA-POLICY-DECOMPOSE-01`).

| Mã | Mô hình | Chính sách (khách) | Mẫu bảng (xlsx đại diện) | Input pack (khách) |
|----|---------|-------------------|---------------------------|-------------------|
| **CHUNG** | Toàn tập đoàn | Thang lương QĐ 2A · QĐ lương 127A | — | Lịch PVTHK |
| **ĐPHH** | Điều phối hàng hóa | 7 PDF BP ĐPHH | BP ĐPHH | DLL CPN |
| **TĐHK** | Tổng đài hành khách | 3 PDF KPI 1500/1731 | TĐHK done | KPI · BCC · PCCV T5 |
| **TG** | Lương thời gian | (theo VP) | VP Hà Nội | BCC chuẩn |
| **LX-T** | Lái xe tuyến | 13 PDF theo tỉnh | LX tuyến T06 | BCC · CPSC · điểm CLDV |
| **LX-TR** | Lái xe tải | 2 PDF | LXT t5 | DT · tạm ứng · XDTN |
| **VP-T** | Văn phòng tỉnh | 3 PDF theo tỉnh | 6 tỉnh T05 | Chi phí VP · trợ lương |

**Insight khóa:** XeVN vận hành **≥6 mẫu bảng + policy riêng từng BP** — không một công thức duy nhất. Thiết lập phải **đa OU / đa mẫu / bind policy pack** (neo AMIS bước 1–3–4).

### 1.2 Hiện trạng XeVN (rollup — cite parity + formula gap)

| Lớp | Trạng thái | Ghi chú |
|-----|------------|---------|
| Thiết lập thuế/BH/tham số | **PARTIAL** | Settings có khung; thiếu **policy pack** theo BP |
| Thành phần + công thức | **GAP** | Catalog stub · formula engine **HOLD** · free-text mã |
| Mẫu bảng đa OU | **GAP** | Paper `pay_sheet_template` CONFIRMED; product chưa LIVE |
| Input pack theo mô hình | **GAP** | ATT close gate OK; DLL/KPI/DT/CPSC chưa typed pack |
| Lập bảng / process | **GAP** | Enroll slice GWC · process **net=0** stub |
| ESS / chi trả | **PARTIAL** | P2 sau spine P0 |

---

## 2. Ma trận năng lực — AMIS bước 1–7 × mô hình XeVN

**Chú thích cột**

| Cột | Ý nghĩa |
|-----|---------|
| **Khách có gì** | Policy / template / input pack từ pack P.CNTT (inventory) |
| **XeVN hiện tại** | Product + paper spec (2026-08-07..11) |
| **GAP/OK/BETTER** | So với **nhu cầu khách** + **nguyên tắc AMIS** (không claim parity DONE) |
| **UC Thiết lập (ADD)** | UC đề xuất bổ sung SRS — **ADD-only** |

**Chú thích verdict:** **GAP** = thiếu hoặc stub chặn khách; **PARTIAL** = có hướng/spec hoặc slice hẹp; **OK** = đủ cho mô hình này ở mức GĐ1 paper+gate; **BETTER** = XeVN vượt AMIS (giữ, không đè).

---

### Bước 1 — Thiết lập (thuế · BH · thang lương · lịch sử C&B)

| Mô hình | Khách có gì | XeVN hiện tại | Verdict | UC Thiết lập (ADD) |
|---------|-------------|---------------|---------|-------------------|
| **CHUNG** | QĐ 2A thang bậc · QĐ 127A quy chế lương · lịch PVTHK | Settings thuế/BH partial; chưa master thang bậc metadata | **GAP** | **UC-BP-PAY-STP-01** Policy pack CHUNG |
| **ĐPHH** | 7 PDF BP (hệ số · KPI điều phối · thưởng/phạt riêng) | Không bind policy theo BP ĐPHH | **GAP** | **UC-BP-PAY-STP-02** Bind policy RIÊNG→OU |
| **TĐHK** | KPI 1500/1731 · PCCV tổng đài | Không tham số KPI catalog theo QĐ | **GAP** | **UC-BP-PAY-STP-03** Tham số KPI/PCCV |
| **TG** | Lương thời gian VP (ngày công chuẩn) | ATT chuẩn partial; chưa policy VP HN | **PARTIAL** | STP-02 + **UC-BP-PAY-STP-04** Ngày công chuẩn theo OU |
| **LX-T** | 13 PDF theo tỉnh (đơn giá tuyến · CLDV) | Không policy tỉnh / tuyến | **GAP** | STP-02 + **UC-BP-PAY-STP-05** Policy theo địa bàn/tuyến |
| **LX-TR** | 2 PDF (doanh thu · tạm ứng · XDTN) | Advance API partial; chưa policy LX tải | **PARTIAL** | STP-02 + STP-03 (DT/XDTN params) |
| **VP-T** | 3 PDF tỉnh · trợ lương VP | Không pack VP tỉnh | **GAP** | STP-02 + **UC-BP-PAY-STP-06** Trợ lương/CP VP |

---

### Bước 2 — Thành phần lương + công thức (catalog + publish)

| Mô hình | Khách có gì | XeVN hiện tại | Verdict | UC Thiết lập (ADD) |
|---------|-------------|---------------|---------|-------------------|
| **CHUNG** | Mã TP hệ thống (lương CB · PC chức vụ · BH · TNCN) | `salary_components` hướng mở; AC-PAY-COMP-01 **FAIL** free-text | **GAP** | **UC-BP-PAY-STP-07** Catalog TP + starter CHUNG |
| **ĐPHH** | Cột riêng DLL/CPN · thưởng điều phối | Không TP mã ĐPHH trong catalog | **GAP** | STP-07 + **UC-BP-PAY-STP-08** TP theo fragment policy |
| **TĐHK** | KPI · PCCV · thưởng tổng đài | Không TP nature KPI-linked | **GAP** | STP-08 + STP-03 |
| **TG** | Lương TG · PC độc hại (nếu có) | TP TG chưa tách nhóm | **GAP** | STP-07 + **UC-BP-PAY-STP-09** Nhóm TP theo PAY-09 |
| **LX-T** | CPSC · điểm CLDV · lương tuyến | Không TP typed CPSC/CLDV | **GAP** | STP-08 + STP-05 |
| **LX-TR** | DT · XDTN · khấu trừ tạm ứng | TP advance link shallow | **PARTIAL** | STP-08 + bind `source_kind=advance` (paper) |
| **VP-T** | Trợ lương · chi phí VP | Không TP VP tỉnh | **GAP** | STP-08 |

**Công thức (cross-model):** Mọi mô hình cần **dual-control publish** (PAY-02 · F-PAY-FORMULA-* CONFIRMED paper) — product **GAP** toàn bộ; không tách UC theo mô hình (dùng FR-UC-BP-PAY-02 + AC-PAY-FORMULA-*).

---

### Bước 3 — Mẫu bảng lương (đa OU · override công thức theo mẫu)

| Mô hình | Khách có gì | XeVN hiện tại | Verdict | UC Thiết lập (ADD) |
|---------|-------------|---------------|---------|-------------------|
| **CHUNG** | (cột danh tính chuẩn) | Paper `pay_sheet_template`; UI enroll pack ≠ mẫu AMIS | **GAP** | **UC-BP-PAY-STP-10** CRUD mẫu bảng đa OU |
| **ĐPHH** | Mẫu **BP ĐPHH** (cột DLL · CPN) | **MISSING** | **GAP** | STP-10 · applicability `BP=DPHH` |
| **TĐHK** | **TĐHK done** | **MISSING** | **GAP** | STP-10 · `BP=TĐHK` |
| **TG** | **VP Hà Nội** | **MISSING** | **GAP** | STP-10 · `BP=TG` |
| **LX-T** | **LX tuyến T06** (+ biến thể tỉnh) | **MISSING** | **GAP** | STP-10 · `BP=LX-T` + STP-05 |
| **LX-TR** | **LXT t5** | **MISSING** | **GAP** | STP-10 · `BP=LX-TR` |
| **VP-T** | **6 tỉnh T05** (multi template) | **MISSING** | **GAP** | STP-10 · **UC-BP-PAY-STP-11** Nhiều mẫu/1 BP (tỉnh) |

**P0 khóa:** Một OU/BP có thể có **>1 mẫu** (LX tỉnh · VP tỉnh) — `applicability_scope` metadata, **cấm** enum 6 tỉnh trong Nest.

---

### Bước 4 — Dữ liệu tính lương (input pack)

| Mô hình | Khách có gì | XeVN hiện tại | Verdict | UC Thiết lập (ADD) |
|---------|-------------|---------------|---------|-------------------|
| **CHUNG** | Lịch PVTHK (ngày lễ/nghỉ) | ATT holiday partial (ATT-03b GWC slice) | **PARTIAL** | Liên kết ATT — không UC Thiết lập mới |
| **ĐPHH** | **DLL CPN** (doanh lượng điều phối) | Không `input_pack_type=DLL_CPN` | **GAP** | **UC-BP-PAY-STP-12** Khai báo loại input pack |
| **TĐHK** | **KPI · BCC · PCCV T5** | Không pack KPI/BCC typed | **GAP** | STP-12 · `KPI_TDHK` · `BCC` · `PCCV` |
| **TG** | BCC thời gian | ATT close → vars **chưa** nạp engine | **PARTIAL** | STP-12 · `BCC_STD` + ATT-LINE paper |
| **LX-T** | **BCC · CPSC · điểm CLDV** | Không pack CPSC/CLDV | **GAP** | STP-12 · `CPSC` · `CLDV_SCORE` |
| **LX-TR** | **DT · tạm ứng · XDTN** | `advance_*` KEEP; `pay_period_input_lines` paper | **PARTIAL** | STP-12 · `REVENUE_DT` · `ADVANCE` · `XDTN` |
| **VP-T** | **Chi phí VP · trợ lương** | Không pack CP VP | **GAP** | STP-12 · `VP_COST` · `VP_ALLOWANCE` |

**Chuyển công:** `pay_period_timesheet_bind` paper CONFIRMED — **PARTIAL** (probe ATT-412 LIVE; bind UX **GAP**).

---

### Bước 5 — Lập bảng lương (tạo kỳ · process · dòng phiếu)

| Mô hình | Khách có gì | XeVN hiện tại | Verdict | UC Thiết lập (ADD) |
|---------|-------------|---------------|---------|-------------------|
| **Tất cả** | File **done.xlsx** / bảng T05–T06 khách | Create kỳ + enroll **PASS slice**; process **0₫** · no lines | **GAP** | Không UC Thiết lập — **FR-UC-BP-PAY-06** runtime (sau STP 1–4 LIVE) |

**Ghi chú:** Bước 5 phụ thuộc Thiết lập 1–4; ma trận ghi **GAP** thống nhất — không claim một mô hình «xong» khi engine absent.

---

### Bước 6 — Gửi phiếu (ESS)

| Mô hình | Khách có gì | XeVN hiện tại | Verdict | UC Thiết lập (ADD) |
|---------|-------------|---------------|---------|-------------------|
| **Tất cả** | Phiếu lương NV xác nhận | Payslip read partial; confirm workflow shallow | **PARTIAL** | **Không ADD** GĐ1 — P2 sau spine |

---

### Bước 7 — Chi trả

| Mô hình | Khách có gì | XeVN hiện tại | Verdict | UC Thiết lập (ADD) |
|---------|-------------|---------------|---------|-------------------|
| **Tất cả** | Lệnh chi / đối soát | Payment APIs exist; wire AC later | **PARTIAL** | **Không ADD** GĐ1 — P2 |

---

## 3. Rollup theo mô hình (P0 Thiết lập)

| Mô hình | B1 | B2 | B3 | B4 | Tổng Thiết lập | Blocker P0 |
|---------|----|----|----|----|----------------|------------|
| CHUNG | GAP | GAP | GAP | PARTIAL | **GAP** | Policy pack CHUNG + thang bậc |
| ĐPHH | GAP | GAP | GAP | GAP | **GAP** | Mẫu BP ĐPHH + DLL CPN |
| TĐHK | GAP | GAP | GAP | GAP | **GAP** | KPI 1500/1731 + PCCV pack |
| TG | PARTIAL | GAP | GAP | PARTIAL | **GAP** | Mẫu VP HN + nhóm TG |
| LX-T | GAP | GAP | GAP | GAP | **GAP** | Multi-tỉnh policy + CPSC/CLDV |
| LX-TR | PARTIAL | PARTIAL | GAP | PARTIAL | **GAP** | Mẫu LXT + DT/advance pack |
| VP-T | GAP | GAP | GAP | GAP | **GAP** | 6 mẫu tỉnh + CP VP |

---

## 4. Chức năng Thiết lập P0 còn thiếu (product)

| ID | Chức năng | Mô tả nghiệp vụ | Neo AMIS | Trạng thái XeVN | Ưu tiên |
|----|-----------|-----------------|----------|-----------------|---------|
| **F-STP-01** | **Mẫu bảng đa OU** | CRUD `pay_sheet_template` + lines; chọn applicability (OU/BP/tỉnh); snapshot khi lập kỳ | Bước 3 | Paper CONFIRMED · product **MISSING** | **P0** |
| **F-STP-02** | **Thành phần lương (catalog)** | Open catalog + picker; starter CHUNG; fragment → mã TP | Bước 2 | Stub · COMP-01 FAIL | **P0** |
| **F-STP-03** | **Policy bind** | Gắn policy pack CHUNG/RIÊNG → OU/BP; effective date; không gộp 1 UC | Bước 1 | **MISSING** | **P0** |
| **F-STP-04** | **Input pack types** | Khai báo loại pack (DLL_CPN · KPI · CPSC · DT…) + writer/validator; gắn mẫu | Bước 4 | Paper `pay_period_input_lines` · types **MISSING** | **P0** |
| **F-STP-05** | **Override CT trên mẫu** | FK `override_formula_definition_id` published (Option B) | Bước 3 | Paper · **MISSING** | **P0** |
| **F-STP-06** | **Nhóm lương (PAY-09)** | Danh mục nhóm + gán NV/BP — map 6 mô hình khách | Bước 1/3 | SRS FR-UC-BP-PAY-09 · product shallow | **P0** |
| **F-STP-07** | **Formula author/publish** | Dual-control CT (không nhúng trong STP UI) | Bước 2 | Paper F-PAY-FORMULA · engine absent | **P0** (song song) |
| **F-STP-08** | **Thang bậc / QĐ 2A·127A** | Master bậc lương metadata + gán NV/C&B | Bước 1 | **MISSING** | **P1** (sau pack CHUNG) |

---

## 5. Đề xuất UC **Thiết lập lương** (ADD-only)

Mở module **Thiết lập lương** (menu C&B) — tách khỏi **Lập bảng lương** (runtime PAY-06). Mỗi UC: Purpose · Actor · Pre/Post · sequenceDiagram · BR · AC đo được (U65).

| UC-ID | Tên (VI) | Mục đích | Maps FR/AMIS |
|-------|----------|----------|--------------|
| **UC-BP-PAY-STP-01** | Quản lý policy pack **CHUNG** | Lưu thang/QĐ tập đoàn · tham số dùng chung · hiệu lực | AMIS bước 1 · CHUNG |
| **UC-BP-PAY-STP-02** | Bind policy **RIÊNG** theo OU/BP | Gắn pack ĐPHH/TĐHK/LX/VP… với pháp nhân/BP; cấm gộp CHUNG | AMIS bước 1 · RIÊNG |
| **UC-BP-PAY-STP-03** | Tham số KPI / PCCV / đơn giá | CRUD tham số số theo QĐ (1500/1731 · CPSC…) | AMIS bước 1–2 |
| **UC-BP-PAY-STP-04** | Ngày công chuẩn theo OU | Cấu hình chuẩn TG/VP; liên kết ATT | AMIS bước 4 (vars) |
| **UC-BP-PAY-STP-05** | Policy theo địa bàn / tuyến | LX tuyến/tỉnh: đơn giá · CLDV | AMIS bước 1 · LX-T/VP-T |
| **UC-BP-PAY-STP-06** | Trợ lương & chi phí VP | Tham số VP tỉnh | AMIS bước 1 · VP-T |
| **UC-BP-PAY-STP-07** | Danh mục thành phần lương | Open catalog + starter; AC-PAY-COMP-01 | AMIS bước 2 · PAY-02 |
| **UC-BP-PAY-STP-08** | Sinh TP từ policy fragment | Từ fragment catalog → đề xuất mã TP (không hardcode) | AMIS bước 2 |
| **UC-BP-PAY-STP-09** | Nhóm lương & gán NV | FR-UC-BP-PAY-09; map 6 mô hình | AMIS bước 1/3 |
| **UC-BP-PAY-STP-10** | Mẫu bảng lương đa OU | CRUD mẫu + cột + sort; AC-PAY-TPL-01..03 | AMIS bước 3 |
| **UC-BP-PAY-STP-11** | Nhiều mẫu trong một BP | VP 6 tỉnh · LX đa tỉnh — applicability | AMIS bước 3 |
| **UC-BP-PAY-STP-12** | Loại input pack theo mô hình | Khai báo DLL/KPI/CPSC/DT… + bind mẫu | AMIS bước 4 |

**Cấm:** Hardcode `if (bp==='DPHH')` trong Nest; **must** metadata template + policy_id + pack_type.

---

## 6. Bảng quy tắc nghiệp vụ Thiết lập (BR)

| BR-ID | Điều kiện | Hành động | Kết quả | Fail nếu |
|-------|-----------|-----------|---------|----------|
| **BR-PAY-STP-01** | Policy scope = CHUNG | Chỉ C&B tập đoàn sửa; OU không override trường khóa thang bậc | Tham số CHUNG hiệu lực toàn group | OU sửa thang bậc im lặng |
| **BR-PAY-STP-02** | Policy scope = RIÊNG-{BP} | Bind ≥1 OU/BP; effective_from bắt buộc | Pack riêng áp đúng BP | Gộp chung+riêng một form |
| **BR-PAY-STP-03** | Tạo mẫu bảng | `applicability` phải trỏ OU/BP hợp lệ scope JWT | Mẫu chỉ hiện đúng OU | Mẫu global không audit |
| **BR-PAY-STP-04** | Cột mẫu gắn TP | `component_code` ∈ catalog hiệu lực | AC-PAY-COMP-01 pass | Free-text mã SoT |
| **BR-PAY-STP-05** | Override CT trên cột | Chỉ FK **published** formula | BR-AMIS-PAY-SRC-04 | Inline expression runtime |
| **BR-PAY-STP-06** | Khai báo input pack type | Mỗi type gắn ≥1 writer (UI/import/ATT/bridge) | Pack không orphan | Type khai báo không có đường nhập |
| **BR-PAY-STP-07** | Lập kỳ | Bắt buộc chọn mẫu **active** cho OU/NV | AC-PAY-TPL-03 | Kỳ không bind mẫu |
| **BR-PAY-STP-08** | Đổi mẫu/policy sau process | Từ chối hoặc chỉ kỳ mới | AC-PAY-TPL-05 | Hot-swap mid-period |

---

## 7. AC mẫu Thiết lập (U65 — trích; full pack khi mở SRS delta)

| AC-ID | Pass (đo được) | Fail |
|-------|----------------|------|
| **AC-PAY-STP-01** | C&B → Thiết lập lương → tạo policy CHUNG (QĐ 2A tham số) → Lưu 2xx → F5 còn | 4xx; mất sau F5 |
| **AC-PAY-STP-02** | Bind policy RIÊNG ĐPHH cho OU → list mẫu chỉ hiện applicability ĐPHH | Mẫu TĐHK lẫn vào OU ĐPHH |
| **AC-PAY-STP-03** | Tạo mẫu **BP ĐPHH** ≥5 cột từ catalog → F5 → chọn mẫu khi tạo kỳ OU ĐPHH | Không chọn được mẫu; hardcode cột |
| **AC-PAY-STP-04** | Khai báo `input_pack_type=DLL_CPN` gắn mẫu ĐPHH → màn nhập kỳ hiện đúng label | Pack type không xuất hiện |
| **AC-PAY-STP-05** | VP tỉnh: 2 mẫu (tỉnh A/B) cùng BP → picker đúng `applicability` | Chỉ 1 mẫu hardcode |

---

## 8. Handoff

| Owner | Việc | Entry | Exit |
|-------|------|-------|------|
| **ba-data** | Map cột xlsx mẫu → entity/field; FK ATT/EMP; pack grain | Ma trận §2–§4 · sample xlsx names intake | `PO-HRM-PAY-CNTT-BA-DATA-01` evidence |
| **sa** | ADR multi-template · policy bind layer · API unlock STP | §4 F-STP-* · AMIS §3 · TPL/INPUT paper | `PO-HRM-PAY-CNTT-SA-01` |
| **ba-docs** | Delta SRS § PAY Thiết lập (sau sponsor confirm) | UC STP-01..12 | Khách-facing SRS ADD |
| **qa** | Linkage menu Lương/Settings | `PO-HRM-PAY-CNTT-LINKAGE-QA-01` | Inventory orphan |

---

## 9. Rủi ro và giả định

| # | Mục | Xử lý |
|---|-----|--------|
| R1 | Pack P.CNTT chưa mount git | PM mount local; `BA-POLICY-DECOMPOSE` bổ sung fragment catalog |
| R2 | 13 PDF LX trùng/thay thế theo tỉnh | STP-05 + STP-11; đọc `supersedes` per PDF |
| R3 | Formula engine chưa LIVE | Thiết lập vẫn P0 paper+UI; runtime bước 5 blocked honesty |
| R4 | Trùng PAY-09 vs STP-09 | Synth: STP-09 = UI Thiết lập; PAY-09 = FR SRS giữ nguyên |

---

## 10. Cấm (sponsor lock)

- Seed để demo bảng khách · claim `payroll_e2e_ready=true` · hardcode 6 mô hình trong Nest.
- Copy UI/brand AMIS · prompt-echo trong tài liệu khách.
- Gộp CHUNG+RIÊNG một UC · REPLACE SRS PAY đã GWC enroll slice.

---

**ack_status (spec):** READY_FOR_PM_SYNTH  
**evidence:** `docs/qa/evidence/po-hrm-pay-cntt-ba-process-01.md`
